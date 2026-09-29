/**
 * Track-aware progress storage keys — Phase 1 (multi-track foundation).
 * ─────────────────────────────────────────────────────────────────────────────
 * ADDITIVE ONLY. `src/lib/progress/storage.ts#getStorageKey` is NOT modified:
 * it keeps returning the SQL keys (`sql_mastery_progress_v1` /
 * `sqlens_progress_user_<id>`). These helpers derive the parallel Prisma keys
 * from `TRACK_META`, and `initialStateForTrack` stamps the correct starting
 * module + unlocked list per track.
 */

import { LEARNING_CONFIG } from '../../config/learning';
import { INITIAL_USER_STATE } from './storage';
import { TRACK_META, type TrackId } from '../../types/track';
import type { UserLearningState } from '../../types/progress';

export function getTrackGuestStorageKey(track: TrackId): string {
  return TRACK_META[track].guestStorageKey;
}

export function getTrackStorageKey(track: TrackId, userId?: string | null): string {
  if (userId) return `${TRACK_META[track].userStorageKeyPrefix}${userId}`;
  return getTrackGuestStorageKey(track);
}

/**
 * Fresh progress state for a track. SQL returns the frozen INITIAL_USER_STATE
 * shape untouched; Prisma starts at `prisma-01` with only it unlocked.
 */
export function initialStateForTrack(track: TrackId): UserLearningState {
  if (track === 'sql') return { ...INITIAL_USER_STATE };
  return {
    ...INITIAL_USER_STATE,
    currentModuleId: TRACK_META.prisma.initialModuleId,
    unlockedModuleIds: [TRACK_META.prisma.initialModuleId],
  };
}

/** Sanity check used by tests: SQL storage keys must stay exactly as today. */
export function assertSqlStorageKeysUnchanged(): boolean {
  return (
    LEARNING_CONFIG.STORAGE_KEY === 'sql_mastery_progress_v1' &&
    getTrackStorageKey('sql') === 'sql_mastery_progress_v1' &&
    getTrackStorageKey('sql', 'user_123') === 'sqlens_progress_user_user_123'
  );
}
