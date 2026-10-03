/**
 * Phase 3 — progress readiness seam (fixes the task-page-refresh bounce).
 * ─────────────────────────────────────────────────────────────────────────────
 * On a signed-in page refresh, Better Auth resolves the session a render BEFORE
 * the LearningProgressProvider applies the user-local snapshot. For that window
 * the in-memory state is the seeded guest state (`completedModules` empty), so
 * every day past Day 1 looks locked. The learn surfaces must therefore NEVER run
 * a lock-rejection/redirect until progress is READY.
 *
 * `deriveProgressReady` is the pure rule that decides readiness from a ticket:
 * the (session, user, track) whose snapshot the provider has actually applied.
 * While auth is pending there is no expected ticket, so nothing is ready.
 */
import { describe, it, expect } from 'vitest';
import { deriveProgressReady, progressReadyTicket } from '../../src/lib/progress/readiness';

describe('Phase 3 — progressReadyTicket', () => {
  it('is null while auth is pending (no identity is known yet)', () => {
    expect(progressReadyTicket(true, null, 'sql')).toBeNull();
    expect(progressReadyTicket(true, 'user-1', 'sql')).toBeNull();
  });

  it('namespaces the ticket by (user, track) once auth settles', () => {
    expect(progressReadyTicket(false, 'user-1', 'sql')).toBe('user-1::sql');
    expect(progressReadyTicket(false, 'user-1', 'prisma')).toBe('user-1::prisma');
    expect(progressReadyTicket(false, null, 'sql')).toBe('guest::sql');
  });
});

describe('Phase 3 — deriveProgressReady', () => {
  it('is false while auth is pending, regardless of any stamped ticket', () => {
    expect(deriveProgressReady(true, null, 'sql', null)).toBe(false);
    expect(deriveProgressReady(true, 'user-1', 'sql', 'user-1::sql')).toBe(false);
  });

  it('is false for a signed-in user until the matching snapshot is applied', () => {
    // The refresh bug window: auth resolved, but the ticket is still the seeded
    // guest ticket (or null), so the seeded empty state is NOT authoritative.
    expect(deriveProgressReady(false, 'user-1', 'sql', null)).toBe(false);
    expect(deriveProgressReady(false, 'user-1', 'sql', 'guest::sql')).toBe(false);
  });

  it('is true once the (user, track) snapshot has been applied', () => {
    expect(deriveProgressReady(false, 'user-1', 'sql', 'user-1::sql')).toBe(true);
    expect(deriveProgressReady(false, 'user-1', 'prisma', 'user-1::prisma')).toBe(true);
  });

  it('is true for a settled guest whose guest snapshot is applied', () => {
    expect(deriveProgressReady(false, null, 'sql', 'guest::sql')).toBe(true);
  });

  it('re-arms per track: a ticket for the other track is not ready', () => {
    expect(deriveProgressReady(false, 'user-1', 'prisma', 'user-1::sql')).toBe(false);
    expect(deriveProgressReady(false, null, 'prisma', 'guest::sql')).toBe(false);
  });
});
