/**
 * Track-scoped progress storage — the import surface for track-aware keys.
 * ─────────────────────────────────────────────────────────────────────────
 * Phase 3 moved the single source of truth into `src/lib/progress/storage.ts`:
 *   - `getStorageKey(userId, track)`      — SQL keys byte-identical
 *   - `initialStateForTrack(track)`       — `day-01` vs `prisma-01`
 *   - `loadUserState / saveUserState / resetUserState(userId, …, track)`
 *   - `clearGuestState(track)`
 * `track` is the LAST, optional argument on every one of them and defaults to
 * `'sql'`, so every pre-Phase-3 call site keeps its exact behaviour.
 *
 * This module re-exports the track helpers so the registry, the tests and
 * `LearningProgressProvider` keep one stable import path.
 */

import { LEARNING_CONFIG } from '../../config/learning';
import { initialStateForTrack, getStorageKey } from './storage';
import { TRACK_META, type TrackId } from '../../types/track';

export { initialStateForTrack };

/** Guest key only (`sql_mastery_progress_v1` / `prismalens_progress_v1`). */
export function getTrackGuestStorageKey(track: TrackId): string {
  return TRACK_META[track].guestStorageKey;
}

/**
 * `sqlens_progress_user_<id>` / `prismalens_progress_user_<id>`; the guest key
 * for the track when no user id is given.
 */
export function getTrackStorageKey(track: TrackId, userId?: string | null): string {
  return getStorageKey(userId, track);
}

/** Sanity check used by tests: SQL storage keys must stay exactly as today. */
export function assertSqlStorageKeysUnchanged(): boolean {
  return (
    LEARNING_CONFIG.STORAGE_KEY === 'sql_mastery_progress_v1' &&
    getTrackStorageKey('sql') === 'sql_mastery_progress_v1' &&
    getTrackStorageKey('sql', 'user_123') === 'sqlens_progress_user_user_123'
  );
}
