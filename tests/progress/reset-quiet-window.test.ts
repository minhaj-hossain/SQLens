import { describe, it, expect } from 'vitest';
import {
  isInResetQuietWindow,
  shouldPushOnNullCloud,
  mayBackgroundSync,
  buildSyncMessage,
  buildResetMessage,
  decideIncomingBroadcast,
  decideIncomingStorage,
  RESET_QUIET_WINDOW_MS,
} from '../../src/lib/progress/sync-guard';
import { INITIAL_USER_STATE } from '../../src/lib/progress/storage';
import { getResetEpoch } from '../../src/lib/progress/merge';
import type { UserLearningState } from '../../src/types/progress';

describe('Batch 1 — client write-serialization guards (GREEN)', () => {
  it('opens a quiet window after reset that silences background writers', () => {
    const resetAt = 1_000_000;
    const quietUntil = resetAt + RESET_QUIET_WINDOW_MS;
    expect(mayBackgroundSync({ quietUntilMs: quietUntil }, resetAt + 100)).toBe(false);
    expect(isInResetQuietWindow(quietUntil, resetAt + 100)).toBe(true);
    expect(mayBackgroundSync({ quietUntilMs: quietUntil }, quietUntil + 1)).toBe(true);
    expect(mayBackgroundSync({ quietUntilMs: 0 }, resetAt)).toBe(true);
  });

  it('GET-null branch only pushes when the in-memory ref is not stale', () => {
    const local = { ...INITIAL_USER_STATE, lastActiveTimestamp: '2026-09-06T10:00:00.000Z' };
    const staleRef = { ...INITIAL_USER_STATE, lastActiveTimestamp: '2026-09-05T10:00:00.000Z' };
    const freshRef = { ...INITIAL_USER_STATE, lastActiveTimestamp: '2026-09-06T10:00:00.000Z' };
    expect(shouldPushOnNullCloud(staleRef, local)).toBe(false);
    expect(shouldPushOnNullCloud(freshRef, local)).toBe(true);
  });
});

function progressed(epoch = 0): UserLearningState {
  return {
    ...INITIAL_USER_STATE,
    currentModuleId: 'day-03',
    completedModules: {
      'day-01': { moduleId: 'day-01', completedAt: '2026-09-02T00:00:00.000Z' },
    },
    unlockedModuleIds: ['day-01', 'day-02'],
    lastActiveTimestamp: '2026-09-05T10:00:00.000Z',
    resetEpoch: epoch,
    resetAt: epoch > 0 ? '2026-09-06T10:00:00.000Z' : null,
  };
}

function fresh(epoch: number): UserLearningState {
  return {
    ...INITIAL_USER_STATE,
    lastActiveTimestamp: '2026-09-06T10:00:00.000Z',
    resetEpoch: epoch,
    resetAt: '2026-09-06T10:00:00.000Z',
  };
}

describe('Batch 4 — multitab reset protocol (GREEN)', () => {
  it('PROGRESS_RESET with a newer epoch is adopted (stale tab converges to Day 1)', () => {
    const msg = buildResetMessage('user_1', fresh(2));
    const decision = decideIncomingBroadcast(msg, 'user_1', getResetEpoch(progressed(1)));

    expect(decision.action).toBe('adopt-reset');
    if (decision.action === 'adopt-reset') {
      expect(decision.resetEpoch).toBe(2);
      expect(decision.state.currentModuleId).toBe('day-01');
      expect(Object.keys(decision.state.completedModules)).toEqual([]);
    }
  });

  it('a stale-epoch broadcast is ignored (no resurrection merge)', () => {
    // Tab already reset to epoch 2; a lagging tab still shouts epoch 0.
    const staleMsg = buildSyncMessage('user_1', progressed(0));
    expect(decideIncomingBroadcast(staleMsg, 'user_1', 2)).toEqual({
      action: 'ignore',
      reason: 'stale-epoch',
    });

    const staleReset = buildResetMessage('user_1', fresh(1));
    expect(decideIncomingBroadcast(staleReset, 'user_1', 2)).toEqual({
      action: 'ignore',
      reason: 'stale-epoch',
    });
  });

  it('same-epoch SYNC is adopted without a push-back (normal propagation)', () => {
    const msg = buildSyncMessage('user_1', progressed(2));
    const decision = decideIncomingBroadcast(msg, 'user_1', 2);
    expect(decision.action).toBe('adopt-sync');
  });

  it('messages for another user or malformed payloads are ignored', () => {
    const msg = buildResetMessage('user_1', fresh(3));
    expect(decideIncomingBroadcast(msg, 'user_2', 0)).toEqual({
      action: 'ignore',
      reason: 'user-mismatch',
    });
    expect(decideIncomingBroadcast(null, 'user_1', 0)).toEqual({
      action: 'ignore',
      reason: 'invalid',
    });
    expect(decideIncomingBroadcast({ type: 'PROGRESS_SYNC', userId: 'user_1' }, 'user_1', 0)).toEqual({
      action: 'ignore',
      reason: 'invalid',
    });
  });

  it('legacy payloads without an explicit epoch fall back to state.resetEpoch', () => {
    const legacy = { type: 'PROGRESS_RESET', userId: 'user_1', state: fresh(2) };
    const decision = decideIncomingBroadcast(legacy, 'user_1', 1);
    expect(decision.action).toBe('adopt-reset');
  });

  it('storage events follow the same epoch gate', () => {
    expect(decideIncomingStorage(progressed(0), 2)).toEqual({ action: 'ignore' });
    const decision = decideIncomingStorage(fresh(2), 1);
    expect(decision.action).toBe('adopt');
    if (decision.action === 'adopt') {
      expect(decision.state.currentModuleId).toBe('day-01');
    }
    expect(decideIncomingStorage(null, 0)).toEqual({ action: 'ignore' });
  });
});
