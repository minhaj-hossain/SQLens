import { describe, it, expect } from 'vitest';
import {
  INITIAL_USER_STATE,
  resetUserState,
  loadUserState,
  saveUserState,
  getStorageKey,
} from '../../src/lib/progress/storage';
import {
  mergeProgress,
  toCloudProgress,
  getResetEpoch,
  isResetTombstone,
  type CloudProgress,
} from '../../src/lib/progress/merge';
import { UserLearningState } from '../../src/types/progress';

/**
 * Batch 2 — reset-epoch regression tests (GREEN: the protocol holds).
 *
 * Batch 0 proved each vector with `it.fails` against the old union-only /
 * blind-$set sync. The resetEpoch tombstone + epoch-aware merge + server
 * fencing below closed them, so these now assert the FIXED behavior. Each
 * test models one layer of the defense:
 *  - merge layer: epoch fencing decides before any union
 *  - server layer: stale-epoch PUTs are rejected (mirrors progress-store)
 *  - client layer: full reset bumps the epoch and round-trips through storage
 */

function progressedState(): UserLearningState {
  return {
    ...INITIAL_USER_STATE,
    currentModuleId: 'day-03',
    completedModules: {
      'day-01': {
        moduleId: 'day-01',
        completedAt: '2026-09-02T00:00:00.000Z',
        completedConcepts: ['c1'],
        completedTasks: ['t1', 't2'],
        challengeCompleted: true,
      },
    },
    completedTasks: {
      t1: { taskId: 't1', moduleId: 'day-01', completed: true, hintsUsed: 0, viewedSolution: false },
      t2: { taskId: 't2', moduleId: 'day-01', completed: true, hintsUsed: 1, viewedSolution: false },
    },
    taskAttempts: {
      t1: { taskId: 't1', moduleId: 'day-01', completed: true, hintsUsed: 0, viewedSolution: false, lastSubmittedSql: 'SELECT 1;' },
    },
    completedConcepts: {
      c1: { conceptId: 'c1', moduleId: 'day-01', completedAt: '2026-09-02T00:00:00.000Z' },
    },
    unlockedModuleIds: ['day-01', 'day-02', 'day-03'],
    lastActiveTimestamp: '2026-09-05T10:00:00.000Z',
  };
}

/** Minimal in-memory stand-in for the `user_progress` collection, WITH Batch 2 epoch fencing. */
function makeFakeCloudStore() {
  let doc: CloudProgress | null = null;
  return {
    put(progress: CloudProgress) {
      // Mirrors progress-store.saveProgress(): rejects stale-epoch writes.
      if (doc && getResetEpoch(progress) < getResetEpoch(doc)) return false;
      doc = structuredClone(progress);
      return true;
    },
    delete() {
      // Legacy deleteOne — no longer used by user reset (tombstone instead).
      doc = null;
    },
    get(): CloudProgress | null {
      return doc ? structuredClone(doc) : null;
    },
  };
}

describe('Batch 2 — reset epoch closes the resurrection vectors', () => {
  it('V2 fixed: newer-epoch fresh state is never unioned with older-epoch cloud', () => {
    const oldCloud = toCloudProgress(progressedState()); // epoch 0
    const fresh = {
      ...resetUserState(null, getResetEpoch(progressedState())), // epoch 1
      lastActiveTimestamp: '2026-09-06T10:00:00.000Z',
    };
    expect(getResetEpoch(fresh)).toBe(1);

    const merged = mergeProgress(fresh, oldCloud);

    // The tombstone generation wins outright — no resurrection via union.
    expect(Object.keys(merged.completedModules)).toEqual([]);
    expect(Object.keys(merged.completedTasks ?? {})).toEqual([]);
    expect(merged.unlockedModuleIds).toEqual(['day-01']);
    expect(getResetEpoch(merged)).toBe(1);
  });

  it('V2 fixed: newer-epoch cloud tombstone is adopted even over local progress', () => {
    const local = progressedState(); // epoch 0, holds real progress
    const tombstone: CloudProgress = {
      ...toCloudProgress(resetUserState(null, 0)), // epoch 1, Day-1 empty
      lastActiveTimestamp: '2026-09-06T10:00:00.000Z',
    };
    expect(isResetTombstone(tombstone)).toBe(true);

    const merged = mergeProgress(local, tombstone);

    expect(Object.keys(merged.completedModules)).toEqual([]);
    expect(merged.currentModuleId).toBe('day-01');
    expect(getResetEpoch(merged)).toBe(1);
  });

  it('V1/V3 fixed: epoch-fenced store rejects a stale PUT after the reset tombstone', () => {
    const store = makeFakeCloudStore();
    const oldCloud = toCloudProgress(progressedState()); // epoch 0

    // Reset commits the authoritative tombstone (server resetProgress()).
    const tombstone: CloudProgress = {
      ...toCloudProgress(resetUserState(null, getResetEpoch(oldCloud))),
      lastActiveTimestamp: '2026-09-06T10:00:00.000Z',
    };
    store.put(tombstone);
    expect(getResetEpoch(store.get())).toBe(1);

    // Stale in-flight PUT(old epoch 0) lands after the tombstone → rejected.
    store.put(oldCloud);

    // Doc still the tombstone — refresh converges to Day 1, not old progress.
    const after = store.get();
    expect(after).not.toBeNull();
    expect(Object.keys(after!.completedModules)).toEqual([]);
    expect(getResetEpoch(after)).toBe(1);
  });

  it('client: full reset bumps the epoch and round-trips through storage', () => {
    const userId = 'user_epoch_probe';
    const hasStorage = typeof window !== 'undefined' && typeof localStorage !== 'undefined';
    if (hasStorage) localStorage.removeItem(getStorageKey(userId));
    const before = { ...progressedState(), resetEpoch: 4 };
    if (hasStorage) {
      saveUserState(before, userId);
      expect(getResetEpoch(loadUserState(userId))).toBe(4);
    }

    const fresh = resetUserState(userId, 4);
    expect(getResetEpoch(fresh)).toBe(5);
    expect(fresh.resetAt).toBeTruthy();
    expect(Object.keys(fresh.completedModules)).toEqual([]);
    if (hasStorage) {
      saveUserState(fresh, userId);
      const reloaded = loadUserState(userId);
      expect(getResetEpoch(reloaded)).toBe(5);
      expect(Object.keys(reloaded.completedModules)).toEqual([]);
      localStorage.removeItem(getStorageKey(userId));
    }
  });
});
