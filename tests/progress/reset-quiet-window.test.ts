import { describe, it, expect } from 'vitest';
import {
  isInResetQuietWindow,
  shouldPushOnNullCloud,
  mayBackgroundSync,
  RESET_QUIET_WINDOW_MS,
} from '../../src/lib/progress/sync-guard';
import { INITIAL_USER_STATE } from '../../src/lib/progress/storage';

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
