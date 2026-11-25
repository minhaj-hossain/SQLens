import type { UserLearningState } from '@/types/progress';
import type { CloudProgress } from './merge';
import { mergeProgress, toCloudProgress } from './merge';
import { getAllNetworkingModules } from '@/content/networking';

const GUEST_STORAGE_KEY = 'networking_progress_v1';
const USER_STORAGE_KEY_PREFIX = 'networking_progress_user_';

export function getNetworkingStorageKey(userId?: string | null): string {
  return userId ? `${USER_STORAGE_KEY_PREFIX}${userId}` : GUEST_STORAGE_KEY;
}

export function initialNetworkingProgress(): UserLearningState {
  return {
    currentModuleId: 'net-01',
    currentConceptId: null,
    currentTaskIndex: 0,
    challengeTaskIndex: 0,
    taskAttempts: {},
    completedTasks: {},
    completedConcepts: {},
    completedModules: {},
    unlockedModuleIds: ['net-01'],
    bypassDailyLock: false,
    simulatedTimeOffsetHours: 0,
    lastActiveTimestamp: new Date().toISOString(),
    resetEpoch: 0,
  };
}

function normalizeNetworkingProgress(raw: unknown): UserLearningState {
  const base = initialNetworkingProgress();
  if (!raw || typeof raw !== 'object') return base;
  const obj = raw as Partial<UserLearningState>;
  return {
    ...base,
    ...obj,
    currentModuleId: typeof obj.currentModuleId === 'string' ? obj.currentModuleId : 'net-01',
    completedTasks:
      obj.completedTasks && typeof obj.completedTasks === 'object' ? obj.completedTasks : {},
    completedModules:
      obj.completedModules && typeof obj.completedModules === 'object' ? obj.completedModules : {},
    completedConcepts:
      obj.completedConcepts && typeof obj.completedConcepts === 'object' ? obj.completedConcepts : {},
    taskAttempts:
      obj.taskAttempts && typeof obj.taskAttempts === 'object' ? obj.taskAttempts : {},
    unlockedModuleIds: Array.isArray(obj.unlockedModuleIds) ? obj.unlockedModuleIds : ['net-01'],
  };
}

export function loadNetworkingProgress(userId?: string | null): UserLearningState {
  if (typeof window === 'undefined') return initialNetworkingProgress();
  try {
    const raw = window.localStorage.getItem(getNetworkingStorageKey(userId));
    if (!raw) return initialNetworkingProgress();
    return normalizeNetworkingProgress(JSON.parse(raw));
  } catch {
    return initialNetworkingProgress();
  }
}

export function saveNetworkingProgress(progress: CloudProgress, userId?: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(getNetworkingStorageKey(userId), JSON.stringify(progress));
  } catch {
    // Ignore quota/storage errors in private browsing
  }
}

export function getNetworkingStepTaskId(dayId: string, stepIdx: number): string {
  return `${dayId}:step-${stepIdx}`;
}

export function getCompletedStepsForDay(progress: CloudProgress, dayId: string): number[] {
  const prefix = `${dayId}:step-`;
  const indices: number[] = [];
  for (const taskId of Object.keys(progress.completedTasks ?? {})) {
    if (taskId.startsWith(prefix)) {
      const parsed = Number.parseInt(taskId.slice(prefix.length), 10);
      if (Number.isInteger(parsed) && parsed >= 0) {
        indices.push(parsed);
      }
    }
  }
  return indices.sort((a, b) => a - b);
}

export function recordNetworkingStepCompletion(
  dayId: string,
  completedStepIndices: number[],
  totalSteps: number,
  userId?: string | null,
): UserLearningState {
  const existing = loadNetworkingProgress(userId);
  const now = new Date().toISOString();
  const nextTasks = { ...(existing.completedTasks ?? {}) };
  const dayTaskIds: string[] = [];

  for (const idx of completedStepIndices) {
    const taskId = getNetworkingStepTaskId(dayId, idx);
    dayTaskIds.push(taskId);
    if (!nextTasks[taskId]) {
      nextTasks[taskId] = {
        completedAt: now,
        taskId,
        moduleId: dayId,
        conceptId: dayId,
        hintsUsed: 0,
        viewedSolution: false,
      };
    }
  }

  const nextModules = { ...(existing.completedModules ?? {}) };
  const isDayDone = totalSteps > 0 && completedStepIndices.length >= totalSteps;
  if (isDayDone && !nextModules[dayId]) {
    nextModules[dayId] = {
      completedAt: now,
      moduleId: dayId,
      completedTasks: dayTaskIds,
      challengeCompleted: true,
    };
  }

  const nextState: UserLearningState = {
    ...existing,
    currentModuleId: dayId,
    completedTasks: nextTasks,
    completedModules: nextModules,
    unlockedModuleIds: Array.from(new Set([...(existing.unlockedModuleIds ?? ['net-01']), dayId])),
    lastActiveTimestamp: now,
  };

  saveNetworkingProgress(nextState, userId);
  return nextState;
}

export function hasNetworkingProgressData(progress: CloudProgress): boolean {
  return (
    Object.keys(progress.completedTasks ?? {}).length > 0 ||
    Object.keys(progress.completedModules ?? {}).length > 0
  );
}

export async function pushNetworkingProgressToCloud(progress: UserLearningState): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    await fetch('/api/me/progress?track=networking', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ progress: toCloudProgress(progress) }),
    });
  } catch {
    // Offline/network errors will sync on next session
  }
}

export async function syncNetworkingProgressWithCloud(userId: string): Promise<UserLearningState> {
  const userLocal = loadNetworkingProgress(userId);
  const guestLocal = loadNetworkingProgress(null);
  const combinedLocal = hasNetworkingProgressData(guestLocal)
    ? mergeProgress(userLocal, toCloudProgress(guestLocal))
    : userLocal;

  if (typeof window === 'undefined') return combinedLocal;

  try {
    const res = await fetch('/api/me/progress?track=networking', { cache: 'no-store' });
    if (!res.ok) {
      saveNetworkingProgress(combinedLocal, userId);
      return combinedLocal;
    }
    const data = (await res.json()) as { progress?: CloudProgress | null };
    const cloud = data.progress ? toCloudProgress(normalizeNetworkingProgress(data.progress)) : null;
    const merged = cloud ? mergeProgress(combinedLocal, cloud) : combinedLocal;
    saveNetworkingProgress(merged, userId);

    if (
      hasNetworkingProgressData(combinedLocal) &&
      (!cloud ||
        Object.keys(merged.completedTasks ?? {}).length > Object.keys(cloud.completedTasks ?? {}).length ||
        Object.keys(merged.completedModules ?? {}).length > Object.keys(cloud.completedModules ?? {}).length)
    ) {
      await pushNetworkingProgressToCloud(merged);
    }
    return merged;
  } catch {
    saveNetworkingProgress(combinedLocal, userId);
    return combinedLocal;
  }
}

export function getNextIncompleteNetworkingDay(progress: CloudProgress): {
  dayNumber: number;
  dayId: string;
  title: string;
} {
  const modules = getAllNetworkingModules();
  const completed = progress.completedModules ?? {};
  const next = modules.find((m) => !completed[m.id]) ?? modules[modules.length - 1];
  return {
    dayNumber: next?.dayNumber ?? 1,
    dayId: next?.id ?? 'net-01',
    title: next?.title ?? 'Day 1 · The First Link & Hardware Identity',
  };
}
