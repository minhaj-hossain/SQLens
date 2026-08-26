import {
  UserLearningState,
  CompletedTaskRecord,
  CompletedConceptRecord,
  CompletedModuleRecord,
} from '../../types/progress';

/**
 * Guest → Account progress merge (Phase 2).
 *
 * Pure, deterministic, client-safe (no server imports). Rules:
 *  - completedTasks / completedConcepts / completedModules / taskAttempts:
 *      union; on conflicting records the one with the LATEST completedAt wins
 *      (missing timestamps lose to present ones).
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
  const taskAttempts = mergeDatedRecords<CompletedTaskRecord>(
    local.taskAttempts,
    cloud.taskAttempts,
  );
  const completedConcepts = mergeDatedRecords<CompletedConceptRecord>(
    local.completedConcepts,
    cloud.completedConcepts,
  );
  const completedModules = mergeDatedRecords<CompletedModuleRecord>(
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