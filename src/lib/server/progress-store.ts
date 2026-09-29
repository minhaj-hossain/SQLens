import 'server-only';
import type { CloudProgress } from '@/lib/progress/merge';
import { getResetEpoch } from '@/lib/progress/merge';
import { db } from '@/lib/auth';
import {
  TRACK_PROJECTION,
  emptyTombstone,
  readTrackEpoch,
  readTrackSlice,
  trackResetFragment,
  trackSetFragment,
} from '@/lib/progress/track-cloud';
import type { TrackId } from '@/types/track';

/**
 * Server-side persistence for per-user learning progress (Phase 2).
 *
 * One document per user in the `user_progress` collection:
 *   { userId (unique), progress, version, updatedAt, resetEpoch, resetAt,
 *     tracks: { prisma: { progress, resetEpoch, resetAt } } }
 * `userId` ALWAYS comes from the verified session (requireUser), never from a
 * request body — a user can only ever read/write their own progress.
 *
 * Phase 3 — per-track progress: SQL keeps the top-level slot it has always
 * used, so existing documents and SQL-only readers (admin analytics, exports)
 * are untouched; every other track is namespaced under `tracks.<trackId>`.
 * The physical layout lives in `src/lib/progress/track-cloud.ts` and `track`
 * is the LAST argument of every reader/writer (default `'sql'`).
 *
 * Batch 2 — reset epoch fencing: every full reset bumps `resetEpoch` by 1 and
 * leaves a Day-1-empty tombstone doc (never a missing doc). A PUT carrying an
 * older epoch is stale by definition (in-flight write racing a reset, or a
 * stale tab/device re-upload) and is rejected with `reset_stale` instead of
 * blindly `$set`-ing old bytes back over the tombstone. Legacy docs without
 * the field read as epoch 0.
 */

let indexReady: Promise<void> | null = null;

function ensureIndexes(): Promise<void> {
  if (!indexReady) {
    indexReady = db
      .collection('user_progress')
      .createIndex({ userId: 1 }, { unique: true })
      .then(() => undefined)
      .catch((err) => {
        indexReady = null;
        throw err;
      });
  }
  return indexReady;
}


/**
 * Fetch a user's cloud progress for ONE track, or null when that track has
 * none yet (documents written before Phase 3 only ever held SQL).
 */
export async function getProgress(
  userId: string,
  track: TrackId = 'sql',
): Promise<{ progress: CloudProgress | null; version: number; updatedAt: string | null; resetEpoch: number; resetAt: string | null }> {
  await ensureIndexes();
  const doc = await db.collection('user_progress').findOne({ userId });
  const slice = readTrackSlice(doc, track);
  return {
    progress: slice?.progress ?? null,
    version: (doc?.version as number) ?? 0,
    updatedAt: (doc?.updatedAt as string) ?? null,
    resetEpoch: readTrackEpoch(doc, track),
    resetAt: slice?.resetAt ?? null,
  };
}

/**
 * Upsert progress for a user. Returns the new version number.
 * Uses $inc so two racing writes still yield monotonic versions.
 *
 * Batch 2: rejects writes carrying an older resetEpoch than the stored doc
 * (`ok: false, stale: true`) — the caller maps this to HTTP 409. Writes at
 * the same or a newer epoch proceed (newer = the reset tombstone itself or a
 * post-reset write catching up).
 */
export async function saveProgress(
  userId: string,
  progress: CloudProgress,
  track: TrackId = 'sql',
): Promise<{ ok: true; version: number; updatedAt: string; resetEpoch: number } | { ok: false; stale: true; storedEpoch: number; version: number; updatedAt: string | null }> {
  await ensureIndexes();
  const clientEpoch = getResetEpoch(progress);
  const existing = await db.collection('user_progress').findOne({ userId }, { projection: TRACK_PROJECTION });
  const storedEpoch = readTrackEpoch(existing, track);
  if (clientEpoch < storedEpoch) {
    return {
      ok: false,
      stale: true,
      storedEpoch,
      version: (existing?.version as number) ?? 0,
      updatedAt: (existing?.updatedAt as string) ?? null,
    };
  }
  const updatedAt = new Date().toISOString();
  const res = await db.collection('user_progress').findOneAndUpdate(
    { userId },
    {
      $set: trackSetFragment(track, progress, clientEpoch, updatedAt),
      $setOnInsert: { userId },
      $inc: { version: 1 },
    },
    { upsert: true, returnDocument: 'after', projection: { version: 1 } },
  );
  return { ok: true, version: res?.version ?? 1, updatedAt, resetEpoch: clientEpoch };
}

/**
 * Batch 2 — authoritative full reset. Bumps the epoch and writes a Day-1
 * empty tombstone doc (never deletes it) so any racing/stale PUT with the
 * older epoch is rejected and any later GET converges to Day 1.
 */
export async function resetProgress(
  userId: string,
  track: TrackId = 'sql',
): Promise<{ version: number; updatedAt: string; resetEpoch: number; resetAt: string }> {
  await ensureIndexes();
  const existing = await db.collection('user_progress').findOne({ userId }, { projection: TRACK_PROJECTION });
  const nextEpoch = readTrackEpoch(existing, track) + 1;
  const now = new Date().toISOString();
  const tombstone: CloudProgress = emptyTombstone(track, now, nextEpoch);
  const res = await db.collection('user_progress').findOneAndUpdate(
    { userId },
    {
      $set: trackResetFragment(track, tombstone, nextEpoch, now),
      $setOnInsert: { userId },
      $inc: { version: 1 },
    },
    { upsert: true, returnDocument: 'after', projection: { version: 1 } },
  );
  return { version: res?.version ?? 1, updatedAt: now, resetEpoch: nextEpoch, resetAt: now };
}

/**
 * Permanently delete a user's cloud progress document.
 * NOTE (Batch 2): user-initiated resets no longer use this — DELETE
 * /api/me/progress now writes a reset tombstone via resetProgress(). This is
 * kept for admin/account-deletion flows only.
 */
export async function deleteProgress(userId: string): Promise<boolean> {
  await ensureIndexes();
  const res = await db.collection('user_progress').deleteOne({ userId });
  return (res.deletedCount ?? 0) > 0;
}