/**
 * Track identity — Phase 1 (multi-track foundation).
 * ─────────────────────────────────────────────────────────────────────────────
 * ADDITIVE ONLY: this file introduces the `TrackId` concept without touching
 * any SQL code. SQL remains the default track (`'sql'`) everywhere.
 *
 * A "track" is one full learning path (SQL = 57 days, Prisma = 14 days).
 * Tracks share UI/engine patterns but NEVER share:
 *   - module IDs (sql: `day-NN`, prisma: `prisma-NN`)
 *   - progress storage keys
 *   - URL base paths
 *   - curriculum arrays
 */

/**
 * Every track id the build ships — the ONE source of truth.
 *
 * Phase 4 (multi-track generalization): `BuiltinTrackId` is derived from this
 * tuple instead of a hand-written union, so adding a track starts here and
 * `tsc` then fails until every exhaustive map (`TRACK_META`,
 * `TRACK_REGISTRY`) covers it. The tuple is a literal type, so
 * `TRACK_IDS[0]` is `'sql'` — not a widened `string`.
 */
export const TRACK_IDS = ['sql', 'prisma'] as const;

/** Id of a track the build ships (`'sql' | 'prisma'`). */
export type BuiltinTrackId = (typeof TRACK_IDS)[number];

/**
 * Public track identity — an alias of `BuiltinTrackId`, kept so the ~20
 * existing `TrackId` import sites never had to change when the union became
 * derived.
 */
export type TrackId = BuiltinTrackId;

export function isTrackId(value: unknown): value is TrackId {
  return typeof value === 'string' && (TRACK_IDS as readonly string[]).includes(value);
}

/** Display metadata for the track selector (Phase 2 `/` page). */
export interface TrackMeta {
  id: BuiltinTrackId;
  /** Short label, e.g. "SQL" / "Prisma". */
  label: string;
  /** Full title, e.g. "SQLens — 57 Days of Hands-On SQL". */
  title: string;
  /** One-line pitch for the selector card. */
  tagline: string;
  /** URL base path for the track's roadmap. `/sql` / `/prisma`. */
  basePath: string;
  /** LocalStorage guest key (signed-in keys are derived per user + track). */
  guestStorageKey: string;
  /** Prefix for per-user storage keys: `sqlens_progress_user_<id>` etc. */
  userStorageKeyPrefix: string;
  /** First module of the track. */
  initialModuleId: string;
}

/**
 * LocalStorage key for a track (+ optional user id). Phase 3: the ONE place
 * these strings are derived, so `progress/storage.ts` and
 * `progress/track-storage.ts` can never drift. SQL yields exactly the
 * historical keys (`sql_mastery_progress_v1` / `sqlens_progress_user_<id>`).
 */
export function trackStorageKey(track: TrackId, userId?: string | null): string {
  const meta = TRACK_META[track];
  return userId ? `${meta.userStorageKeyPrefix}${userId}` : meta.guestStorageKey;
}

/**
 * Which track owns a localStorage key, or null when the key is not a
 * progress key at all. Used to route `storage` events to the right tab and
 * to ignore the other track's writes.
 */
export function trackOfStorageKey(key: string): TrackId | null {
  for (const id of TRACK_IDS) {
    const meta = TRACK_META[id];
    if (key === meta.guestStorageKey || key.startsWith(meta.userStorageKeyPrefix)) return id;
  }
  return null;
}

export const TRACK_META: Record<TrackId, TrackMeta> = {
  sql: {
    id: 'sql',
    label: 'SQL',
    title: 'SQL — 57 Days of Hands-On SQL',
    tagline: 'Master SQL from SELECT to production engineering, entirely in your browser.',
    basePath: '/sql',
    guestStorageKey: 'sql_mastery_progress_v1',
    userStorageKeyPrefix: 'sqlens_progress_user_',
    initialModuleId: 'day-01',
  },
  prisma: {
    id: 'prisma',
    label: 'Prisma',
    title: 'Prisma — 14 Days of Prisma ORM',
    tagline: 'Master Prisma ORM, schema modeling and production database engineering.',
    basePath: '/prisma',
    guestStorageKey: 'prismalens_progress_v1',
    userStorageKeyPrefix: 'prismalens_progress_user_',
    initialModuleId: 'prisma-01',
  },
};
