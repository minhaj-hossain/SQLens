import {
  UserLearningState,
  CompletedTaskRecord,
  CompletedConceptRecord,
  CompletedModuleRecord,
} from '../../types/progress';

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

/** Strip developer-only fields before anything leaves the browser. */
export function toCloudProgress(state: UserLearningState): CloudProgress {
  const { bypassDailyLock: _bypass, simulatedTimeOffsetHours: _offset, ...cloud } = state;
  void _bypass;
  void _offset;
  return cloud;
}

/** Re-hydrate a cloud doc into a full local state (dev toggles kept from base). */
export function fromCloudProgress(
  cloud: CloudProgress,
  base: UserLearningState,
): UserLearningState {
  return {
    ...base,
    ...(cloud as Partial<UserLearningState>),
    bypassDailyLock: base.bypassDailyLock,
    simulatedTimeOffsetHours: base.simulatedTimeOffsetHours,
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
 */
export function mergeProgress(
  local: UserLearningState,
  cloud: CloudProgress,
): UserLearningState {
  const completedTasks = mergeDatedRecords<CompletedTaskRecord>(
    local.completedTasks,
    cloud.completedTasks,
  );
  const taskAttempts = mergeTaskAttempts(
    local.taskAttempts,
    cloud.taskAttempts,
  );
  const completedConcepts = mergeDatedRecords<CompletedConceptRecord>(
    local.completedConcepts,
    cloud.completedConcepts,
  );
  const completedModules = mergeCompletedModules(
    local.completedModules,
    cloud.completedModules,
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
      new Set([...(local.unlockedModuleIds ?? []), ...(cloud.unlockedModuleIds ?? [])]),
    ),
    lastActiveTimestamp: lastActive ?? new Date().toISOString(),
    bypassDailyLock: local.bypassDailyLock,
    simulatedTimeOffsetHours: local.simulatedTimeOffsetHours,
  };
}