/**
 * Track-scoped cloud progress layout (Phase 3).
 * ─────────────────────────────────────────────────────────────────────────────
 * `user_progress` keeps exactly ONE document per user — the `{ userId: 1 }`
 * unique index is never migrated:
 *
 *   { userId, progress, resetEpoch, resetAt, tracks: { prisma: {...} }, version, updatedAt }
 *
 * SQL — the original track — owns the TOP-LEVEL `progress` / `resetEpoch` /
 * `resetAt` fields, so every pre-Phase-3 document and every SQL-only reader
 * (admin analytics: `projection: { progress: 1 }`, exports) keeps working
 * byte-for-byte. Additional tracks are namespaced under `tracks.<trackId>`, so
 * their progress can never be unioned into — or overwrite — SQL progress, and
 * a SQL `<->` Prisma switch on one account stays fully independent.
 *
 * Everything here is pure (no db access) so it is unit-testable, and it is the
 * ONLY place that knows the physical document shape.
 */

import { getResetEpoch, type CloudProgress } from './merge';
import { TRACK_META, type TrackId } from '../../types/track';

/** Fields `writeTrack*` merge into a `$set`, plus the shared projection. */
export const TRACK_PROJECTION = {
  version: 1,
  updatedAt: 1,
  resetEpoch: 1,
  resetAt: 1,
  progress: 1,
  tracks: 1,
} as const;

/** True when the track stores its state in the document's top-level fields. */
export function usesTopLevelSlot(track: TrackId): boolean {
  return track === 'sql';
}

/** Readable view of a track's slot inside a progress document. */
export interface TrackCloudSlice {
  progress: CloudProgress;
  resetEpoch: number;
  resetAt: string | null;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function normalizeEpoch(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? Math.floor(value) : null;
}

/**
 * The raw node holding a track's progress, or null when the track has never
 * been written. SQL → the document root; others → `doc.tracks[track]`.
 */
function trackNodeOf(doc: unknown, track: TrackId): Record<string, unknown> | null {
  const root = asRecord(doc);
  if (!root) return null;
  if (usesTopLevelSlot(track)) return root;
  return asRecord(asRecord(root.tracks)?.[track]);
}

/** Track progress + epoch + resetAt, or null when the track has no cloud state. */
export function readTrackSlice(doc: unknown, track: TrackId): TrackCloudSlice | null {
  const node = trackNodeOf(doc, track);
  if (!node) return null;
  const progress = asRecord(node.progress) as CloudProgress | null;
  if (!progress) return null;
  const resetEpoch = normalizeEpoch(node.resetEpoch);
  return {
    progress,
    resetEpoch: resetEpoch ?? getResetEpoch(progress),
    resetAt: (typeof node.resetAt === 'string' ? node.resetAt : null) ?? progress.resetAt ?? null,
  };
}

/**
 * Reset generation for a track. Legacy documents without the field read as the
 * epoch carried inside the progress body (or 0) — identical to the pre-Phase-3
 * behaviour for SQL, and 0 for a track with no doc yet.
 */
export function readTrackEpoch(doc: unknown, track: TrackId): number {
  const node = trackNodeOf(doc, track);
  if (!node) return 0;
  const epoch = normalizeEpoch(node.resetEpoch);
  if (epoch !== null) return epoch;
  return getResetEpoch((node.progress as CloudProgress | undefined) ?? undefined);
}

/**
 * `$set` fragment for a normal save. The SQL fragment is unchanged from
 * Phase 2 — same three fields, same document shape.
 */
export function trackSetFragment(
  track: TrackId,
  progress: CloudProgress,
  epoch: number,
  now: string,
): Record<string, unknown> {
  const normalized: CloudProgress = { ...progress, resetEpoch: epoch };
  if (usesTopLevelSlot(track)) {
    return { progress: normalized, resetEpoch: epoch, updatedAt: now };
  }
  return { [`tracks.${track}`]: { progress: normalized, resetEpoch: epoch }, updatedAt: now };
}

/** `$set` fragment for an authoritative (epoch-bumped) reset tombstone. */
export function trackResetFragment(
  track: TrackId,
  tombstone: CloudProgress,
  epoch: number,
  now: string,
): Record<string, unknown> {
  if (usesTopLevelSlot(track)) {
    return { progress: tombstone, resetEpoch: epoch, resetAt: now, updatedAt: now };
  }
  return { [`tracks.${track}`]: { progress: tombstone, resetEpoch: epoch, resetAt: now }, updatedAt: now };
}

/**
 * Empty started-state tombstone for a track: only the track's FIRST module is
 * unlocked. SQL yields exactly the pre-Phase-3 `day-01` tombstone.
 */
export function emptyTombstone(track: TrackId, now: string, nextEpoch: number): CloudProgress {
  const initialModuleId = TRACK_META[track].initialModuleId;
  return {
    currentModuleId: initialModuleId,
    currentConceptId: null,
    currentTaskIndex: 0,
    challengeTaskIndex: 0,
    taskAttempts: {},
    completedTasks: {},
    completedConcepts: {},
    completedModules: {},
    unlockedModuleIds: [initialModuleId],
    lastActiveTimestamp: now,
    resetEpoch: nextEpoch,
    resetAt: now,
  };
}
