import {
  UserLearningState,
  CompletedTaskRecord,
  CompletedConceptRecord,
  CompletedModuleRecord,
} from '../../types/progress';
import { devKnobsEnabled } from './dev-knobs';

/**
 * Guest → Account progress merge (Phase 2 & Comprehensive Sync Overhaul).
 *
 * Pure, deterministic, client-safe (no server imports). Rules:
 *  - completedModules: deep recursive union. Task IDs, concept IDs, and
 *      challengeCompleted are unioned. Completed timestamps are preserved.
 *  - taskAttempts: merged with max attempts, unioned completion, and latest SQL.
 *  - completedTasks / completedConcepts: unioned via timestamps.
 *  - Current position (module / concept / task / step): taken from whichever
 *      side has the LATER lastActiveTimestamp (most recent intent).
 *  - unlockedModuleIds: union.
 *  - Developer toggles (bypassDailyLock / simulatedTimeOffsetHours) are NEVER
 *      synced — they stay local-only and never travel to the database.
 */

/** The shape stored in the `user_progress` collection — no dev toggles. */
export type CloudProgress = Omit<UserLearningState, 'bypassDailyLock' | 'simulatedTimeOffsetHours'>;

/**
 * Batch 2 — authoritative reset generation ("epoch").
 *
 * Every full reset bumps `resetEpoch` by 1 (locally AND on the server
 * tombstone). Any write/merge carrying an older epoch is stale by definition
 * and must never resurrect pre-reset bytes:
 *  - PUT with `progress.resetEpoch < stored.resetEpoch` → 409 reset_stale
 *  - merge where one side is newer-epoch → the newer epoch wins outright,
 *    no union of the older side back in
 *
 * Legacy states/docs without the field read as epoch 0.
 */
export function getResetEpoch(state: Pick<UserLearningState, 'resetEpoch'> | CloudProgress | null | undefined): number {
  const epoch = (state as { resetEpoch?: unknown } | null | undefined)?.resetEpoch;
  return typeof epoch === 'number' && Number.isFinite(epoch) && epoch >= 0 ? Math.floor(epoch) : 0;
}

/**
 * A server-side reset tombstone: the content half is Day-1 empty, the epoch
 * half proves "a reset happened at generation N". Adopted unconditionally by
 * any client holding an older epoch.
 */
export function isResetTombstone(progress: CloudProgress | null | undefined): boolean {
  if (!progress) return false;
  if (getResetEpoch(progress) <= 0) return false;
  return (
    Object.keys(progress.completedModules ?? {}).length === 0 &&
    Object.keys(progress.taskAttempts ?? {}).length === 0 &&
    Object.keys(progress.completedTasks ?? {}).length === 0 &&
    Object.keys(progress.completedConcepts ?? {}).length === 0
  );
}

function ts(value?: string): number {
  const t = Date.parse(value ?? '');
  return Number.isNaN(t) ? 0 : t;
}

type DatedRecord = { completedAt?: string };

function mergeDatedRecords<T extends DatedRecord>(
  local: Record<string, T> = {},
  cloud: Record<string, T> = {},
): Record<string, T> {
  const out: Record<string, T> = { ...local };
  for (const [key, cloudRec] of Object.entries(cloud)) {
    const localRec = out[key];
    if (!localRec) {
      out[key] = cloudRec;
      continue;
    }
    // Same record exists on both sides → keep whichever was completed later.
    out[key] = ts(cloudRec.completedAt) >= ts(localRec.completedAt) ? cloudRec : localRec;
  }
  return out;
}

/** Deep union merge for task attempts (retains highest hint counts, solutions viewed, and latest SQL). */
function mergeTaskAttempts(
  local: Record<string, CompletedTaskRecord> = {},
  cloud: Record<string, CompletedTaskRecord> = {},
): Record<string, CompletedTaskRecord> {
  const out: Record<string, CompletedTaskRecord> = { ...local };
  for (const [taskId, cloudRec] of Object.entries(cloud)) {
    const localRec = out[taskId];
    if (!localRec) {
      out[taskId] = cloudRec;
      continue;
    }

    const cloudIsLater = ts(cloudRec.completedAt) >= ts(localRec.completedAt);
    out[taskId] = {
      ...localRec,
      ...cloudRec,
      attemptsCount: Math.max(localRec.attemptsCount || 0, cloudRec.attemptsCount || 0),
      completed: Boolean(localRec.completed || cloudRec.completed),
      hintsUsed: Math.max(localRec.hintsUsed || 0, cloudRec.hintsUsed || 0),
      viewedSolution: Boolean(localRec.viewedSolution || cloudRec.viewedSolution),
      lastSubmittedSql: cloudIsLater
        ? (cloudRec.lastSubmittedSql || localRec.lastSubmittedSql)
        : (localRec.lastSubmittedSql || cloudRec.lastSubmittedSql),
      completedAt: cloudIsLater
        ? (cloudRec.completedAt || localRec.completedAt)
        : (localRec.completedAt || cloudRec.completedAt),
    };
  }
  return out;
}

/** Deep union merge for module records — prevents in-progress modules from clobbering inner task arrays. */
function mergeCompletedModules(
  local: Record<string, CompletedModuleRecord> = {},
  cloud: Record<string, CompletedModuleRecord> = {},
): Record<string, CompletedModuleRecord> {
  const out: Record<string, CompletedModuleRecord> = { ...local };

  for (const [moduleId, cloudMod] of Object.entries(cloud)) {
    const localMod = out[moduleId];
    if (!localMod) {
      out[moduleId] = cloudMod;
      continue;
    }

    const mergedConcepts = Array.from(
      new Set([...(localMod.completedConcepts ?? []), ...(cloudMod.completedConcepts ?? [])]),
    );
    const mergedTasks = Array.from(
      new Set([...(localMod.completedTasks ?? []), ...(cloudMod.completedTasks ?? [])]),
    );
    const challengeDone = Boolean(localMod.challengeCompleted || cloudMod.challengeCompleted);

    // If either side marked the module complete, preserve the latest valid completion timestamp.
    let completedAt = '';
    if (localMod.completedAt && cloudMod.completedAt) {
      completedAt = ts(cloudMod.completedAt) >= ts(localMod.completedAt) ? cloudMod.completedAt : localMod.completedAt;
    } else {
      completedAt = localMod.completedAt || cloudMod.completedAt || '';
    }

    out[moduleId] = {
      ...localMod,
      ...cloudMod,
      moduleId,
      completedConcepts: mergedConcepts,
      completedTasks: mergedTasks,
      challengeCompleted: challengeDone,
      completedAt,
      learningDayCycleId: cloudMod.learningDayCycleId || localMod.learningDayCycleId,
    };
  }

  return out;
}

/** Strip developer-only fields before anything leaves the browser. Batch 2: the epoch travels with every PUT. */
export function toCloudProgress(state: UserLearningState): CloudProgress {
  const { bypassDailyLock: _bypass, simulatedTimeOffsetHours: _offset, ...cloud } = state;
  void _bypass;
  void _offset;
  return { ...cloud, resetEpoch: getResetEpoch(state) };
}

/** Re-hydrate a cloud doc into a full local state (dev toggles kept from base). */
export function fromCloudProgress(
  cloud: CloudProgress,
  base: UserLearningState,
): UserLearningState {
  return {
    ...base,
    ...(cloud as Partial<UserLearningState>),
    resetEpoch: getResetEpoch(cloud),
    resetAt: cloud.resetAt ?? base.resetAt ?? null,
    // Item 15: toggles only survive a merge inside `next dev` — production
    // hydrates them to their inert defaults no matter what `base` carries.
    bypassDailyLock: devKnobsEnabled() ? base.bypassDailyLock : false,
    simulatedTimeOffsetHours: devKnobsEnabled() ? base.simulatedTimeOffsetHours : 0,
  };
}

export interface DivergenceDetails {
  isDivergent: boolean;
  localTaskCount: number;
  cloudTaskCount: number;
  localModuleCount: number;
  cloudModuleCount: number;
  divergentModules: string[];
}

/**
 * Checks whether local state and cloud state have meaningful divergence.
 * Divergence occurs when both sides have progress, but each side has progress
 * that the other side lacks.
 */
export function detectProgressDivergence(
  local: UserLearningState,
  cloud: CloudProgress,
): DivergenceDetails {
  const getCompletedTaskIds = (s: {
    taskAttempts?: Record<string, CompletedTaskRecord>;
    completedModules?: Record<string, CompletedModuleRecord>;
  }): Set<string> => {
    const ids = new Set<string>();
    for (const [taskId, att] of Object.entries(s.taskAttempts ?? {})) {
      if (att.completed) ids.add(taskId);
    }
    for (const mod of Object.values(s.completedModules ?? {})) {
      for (const t of mod.completedTasks ?? []) ids.add(t);
    }
    return ids;
  };

  const localTasks = getCompletedTaskIds(local);
  const cloudTasks = getCompletedTaskIds(cloud);

  const localFinishedMods = new Set(
    Object.keys(local.completedModules ?? {}).filter((k) => local.completedModules[k]?.completedAt),
  );
  const cloudFinishedMods = new Set(
    Object.keys(cloud.completedModules ?? {}).filter((k) => cloud.completedModules[k]?.completedAt),
  );

  const localHasItems = localTasks.size > 0 || localFinishedMods.size > 0;
  const cloudHasItems = cloudTasks.size > 0 || cloudFinishedMods.size > 0;

  if (!localHasItems || !cloudHasItems) {
    return {
      isDivergent: false,
      localTaskCount: localTasks.size,
      cloudTaskCount: cloudTasks.size,
      localModuleCount: localFinishedMods.size,
      cloudModuleCount: cloudFinishedMods.size,
      divergentModules: [],
    };
  }

  // Find tasks unique to local or unique to cloud
  let hasLocalUnique = false;
  for (const id of localTasks) {
    if (!cloudTasks.has(id)) {
      hasLocalUnique = true;
      break;
    }
  }

  let hasCloudUnique = false;
  for (const id of cloudTasks) {
    if (!localTasks.has(id)) {
      hasCloudUnique = true;
      break;
    }
  }

  // Find module divergence
  const allMods = new Set([...Object.keys(local.completedModules ?? {}), ...Object.keys(cloud.completedModules ?? {})]);
  const divergentModules: string[] = [];
  for (const modId of allMods) {
    const lMod = local.completedModules?.[modId];
    const cMod = cloud.completedModules?.[modId];
    const lTasks = new Set(lMod?.completedTasks ?? []);
    const cTasks = new Set(cMod?.completedTasks ?? []);
    if (lTasks.size !== cTasks.size || [...lTasks].some((t) => !cTasks.has(t))) {
      divergentModules.push(modId);
    }
  }

  const isDivergent = hasLocalUnique && hasCloudUnique;

  return {
    isDivergent,
    localTaskCount: localTasks.size,
    cloudTaskCount: cloudTasks.size,
    localModuleCount: localFinishedMods.size,
    cloudModuleCount: cloudFinishedMods.size,
    divergentModules,
  };
}

/**
 * Merge a local guest state and a cloud state into one unified state.
 * Both inputs are treated as immutable; the result is brand new.
 *
 * Batch 2/3 — epoch fencing runs BEFORE any union: union can only ADD data,
 * so it can never express "this was deleted". When the two sides disagree on
 * resetEpoch, the newer generation wins outright (tombstone adoption for
 * cloud-newer, cloud-ignore for local-newer). Equal epochs fall through to
 * the legacy union below.
 */
export function mergeProgress(
  local: UserLearningState,
  cloud: CloudProgress,
): UserLearningState {
  const localEpoch = getResetEpoch(local);
  const cloudEpoch = getResetEpoch(cloud);

  if (cloudEpoch > localEpoch) {
    // A newer reset happened elsewhere (another tab/device already bumped the
    // generation). Adopt the tombstone/authoritative doc unconditionally —
    // never union pre-reset local bytes back in, and never prompt "combine".
    return fromCloudProgress(cloud, local);
  }
  if (localEpoch > cloudEpoch) {
    // Local reset is newer than this cloud snapshot (stale GET racing the
    // tombstone write, or a device that hasn't converged yet). Keep local
    // verbatim — the caller pushes it, which the server's epoch fence accepts.
    return { ...local };
  }

  // Batch 6 — equal-epoch module tombstones: strip reset modules from the
  // CLOUD side before unioning. resetModuleProgress() bumps the global epoch
  // so this path normally never runs for module resets, but if epochs tie
  // anyway (legacy states, concurrent resets), the explicit tombstone list
  // still prevents the deleted module from resurrecting via union.
  const tombstoned = new Set(local.resetModuleIds ?? []);
  let cloudForUnion: CloudProgress = cloud;
  if (tombstoned.size > 0) {
    const stripByModule = <T extends { moduleId?: string }>(
      recs: Record<string, T> | undefined,
    ): Record<string, T> | undefined => {
      if (!recs) return recs;
      const out: Record<string, T> = {};
      for (const [k, v] of Object.entries(recs)) {
        if (tombstoned.has(k)) continue;
        const mid = (v as { moduleId?: unknown } | null)?.moduleId;
        if (typeof mid === 'string' && tombstoned.has(mid)) continue;
        out[k] = v;
      }
      return out;
    };
    const strippedModules: Record<string, CompletedModuleRecord> = {};
    for (const [k, v] of Object.entries(cloud.completedModules ?? {})) {
      if (tombstoned.has(k)) continue;
      strippedModules[k] = v;
    }
    cloudForUnion = {
      ...cloud,
      completedTasks: stripByModule(cloud.completedTasks),
      taskAttempts: stripByModule(cloud.taskAttempts),
      completedConcepts: stripByModule(cloud.completedConcepts),
      completedModules: strippedModules,
    };
  }
  const completedTasks = mergeDatedRecords<CompletedTaskRecord>(
    local.completedTasks,
    cloudForUnion.completedTasks,
  );
  const taskAttempts = mergeTaskAttempts(
    local.taskAttempts,
    cloudForUnion.taskAttempts,
  );
  const completedConcepts = mergeDatedRecords<CompletedConceptRecord>(
    local.completedConcepts,
    cloudForUnion.completedConcepts,
  );
  const completedModules = mergeCompletedModules(
    local.completedModules,
    cloudForUnion.completedModules,
  );

  // Position fields follow the most recently active side. When neither has a
  // usable timestamp, prefer the furthest module by day number as a fallback.
  const localTs = ts(local.lastActiveTimestamp);
  const cloudTs = ts(cloud.lastActiveTimestamp);
  let positionSource: UserLearningState | CloudProgress;
  if (localTs !== cloudTs) {
    positionSource = localTs > cloudTs ? local : cloud;
  } else {
    const dayOf = (s: { currentModuleId: string }) =>
      Number(/^day-(\d+)$/.exec(s.currentModuleId)?.[1] ?? 0);
    positionSource = dayOf(cloud) > dayOf(local) ? cloud : local;
  }

  const lastActive =
    localTs >= cloudTs ? local.lastActiveTimestamp : cloud.lastActiveTimestamp;

  return {
    ...local,
    ...(positionSource as UserLearningState),
    completedTasks,
    taskAttempts,
    completedConcepts,
    completedModules,
    unlockedModuleIds: Array.from(
      new Set([...(local.unlockedModuleIds ?? []), ...(cloudForUnion.unlockedModuleIds ?? [])]),
    ),
    lastActiveTimestamp: lastActive ?? new Date().toISOString(),
    resetEpoch: localEpoch,
    resetAt: local.resetAt ?? cloud.resetAt ?? null,
    // Batch 6: tombstone list survives merges so the deletion keeps winning.
    resetModuleIds: local.resetModuleIds ?? cloud.resetModuleIds ?? undefined,
    bypassDailyLock: devKnobsEnabled() ? local.bypassDailyLock : false,
    simulatedTimeOffsetHours: devKnobsEnabled() ? local.simulatedTimeOffsetHours : 0,
  };
}