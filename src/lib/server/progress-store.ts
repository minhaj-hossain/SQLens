import 'server-only';
import type { CloudProgress } from '@/lib/progress/merge';
import { getResetEpoch } from '@/lib/progress/merge';
import { db } from '@/lib/auth';

/**
 * Server-side persistence for per-user learning progress (Phase 2).
 *
 * One document per user in the `user_progress` collection:
 *   { userId (unique), progress, version, updatedAt, resetEpoch, resetAt }
 * `userId` ALWAYS comes from the verified session (requireUser), never from a
 * request body — a user can only ever read/write their own progress.
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

function storedEpochOf(doc: Record<string, unknown> | null | undefined): number {
  if (!doc) return 0;
  const top = doc.resetEpoch;
  if (typeof top === 'number' && Number.isFinite(top) && top >= 0) return Math.floor(top);
  return getResetEpoch((doc.progress as CloudProgress | undefined) ?? undefined);
}

/** Fetch a user's cloud progress, or null when they have none yet. */
export async function getProgress(userId: string): Promise<{ progress: CloudProgress | null; version: number; updatedAt: string | null; resetEpoch: number; resetAt: string | null }> {
  await ensureIndexes();
  const doc = await db.collection('user_progress').findOne({ userId });
  const progress = (doc?.progress as CloudProgress | undefined) ?? null;
  const resetEpoch = storedEpochOf(doc as Record<string, unknown> | null);
  return {
    progress,
    version: (doc?.version as number) ?? 0,
    updatedAt: (doc?.updatedAt as string) ?? null,
    resetEpoch,
    resetAt: (doc?.resetAt as string | null) ?? (progress?.resetAt ?? null),
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
): Promise<{ ok: true; version: number; updatedAt: string; resetEpoch: number } | { ok: false; stale: true; storedEpoch: number; version: number; updatedAt: string | null }> {
  await ensureIndexes();
  const clientEpoch = getResetEpoch(progress);
  const existing = await db.collection('user_progress').findOne({ userId }, { projection: { version: 1, updatedAt: 1, resetEpoch: 1, progress: 1 } });
  const storedEpoch = storedEpochOf(existing as Record<string, unknown> | null);
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
  const normalized: CloudProgress = { ...progress, resetEpoch: clientEpoch };
  const res = await db.collection('user_progress').findOneAndUpdate(
    { userId },
    {
      $set: { progress: normalized, resetEpoch: clientEpoch, updatedAt },
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
): Promise<{ version: number; updatedAt: string; resetEpoch: number; resetAt: string }> {
  await ensureIndexes();
  const existing = await db.collection('user_progress').findOne({ userId }, { projection: { resetEpoch: 1, progress: 1 } });
  const nextEpoch = storedEpochOf(existing as Record<string, unknown> | null) + 1;
  const now = new Date().toISOString();
  const tombstone: CloudProgress = {
    currentModuleId: 'day-01',
    currentConceptId: null,
    currentTaskIndex: 0,
    challengeTaskIndex: 0,
    taskAttempts: {},
    completedTasks: {},
    completedConcepts: {},
    completedModules: {},
    unlockedModuleIds: ['day-01'],
    lastActiveTimestamp: now,
    resetEpoch: nextEpoch,
    resetAt: now,
  };
  const res = await db.collection('user_progress').findOneAndUpdate(
    { userId },
    {
      $set: { progress: tombstone, resetEpoch: nextEpoch, resetAt: now, updatedAt: now },
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