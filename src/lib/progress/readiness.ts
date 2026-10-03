/**
 * Progress-readiness — Phase 3 (navigation & overview cleanup).
 * ─────────────────────────────────────────────────────────────────────────────
 * The learn surfaces (day layout, theory, challenge, complete) must never run a
 * lock-rejection while progress is still hydrating. On a signed-in page refresh
 * the auth session resolves a render BEFORE the provider applies the user-local
 * snapshot, so the seeded guest state looks "empty" and every day past Day 1
 * appears locked — which used to bounce the learner off the exact task page
 * they refreshed.
 *
 * Readiness is identified by a TICKET: the (user, track) whose snapshot the
 * provider has actually applied. While auth is still resolving there is no
 * expected ticket (`null`), so nothing is ready. This is a pure seam so the
 * rule is unit-testable without a provider or a DOM.
 */

import type { TrackId } from '../../types/track';

/**
 * The identity ticket for the snapshot a provider is allowed to call "ready".
 * `null` while auth is pending (no identity is known yet).
 */
export function progressReadyTicket(
  authPending: boolean,
  signedInUserId: string | null,
  track: TrackId,
): string | null {
  if (authPending) return null;
  return signedInUserId ? `${signedInUserId}::${track}` : `guest::${track}`;
}

/**
 * True when `readyTicket` matches the ticket expected for the current
 * (session, user, track). False while auth is pending, and false until the
 * matching snapshot has been applied.
 */
export function deriveProgressReady(
  authPending: boolean,
  signedInUserId: string | null,
  track: TrackId,
  readyTicket: string | null,
): boolean {
  const expected = progressReadyTicket(authPending, signedInUserId, track);
  return expected !== null && readyTicket === expected;
}
