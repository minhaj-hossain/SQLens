import 'server-only';
import type { CloudProgress } from '@/lib/progress/merge';
import { db } from '@/lib/auth';

/**
 * Server-side persistence for per-user learning progress (Phase 2).
 *
 * One document per user in the `user_progress` collection:
 *   { userId (unique), progress, version, updatedAt }
 * `userId` ALWAYS comes from the verified session (requireUser), never from a
 * request body — a user can only ever read/write their own progress.
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

/** Fetch a user's cloud progress, or null when they have none yet. */
export async function getProgress(userId: string): Promise<CloudProgress | null> {
  await ensureIndexes();
  const doc = await db.collection('user_progress').findOne({ userId });
  return (doc?.progress as CloudProgress) ?? null;
}

/**
 * Upsert progress for a user. Returns the new version number.
 * Uses $inc so two racing writes still yield monotonic versions.
 */
export async function saveProgress(
  userId: string,
  progress: CloudProgress,
): Promise<{ version: number; updatedAt: string }> {
  await ensureIndexes();
  const updatedAt = new Date().toISOString();
  const res = await db.collection('user_progress').findOneAndUpdate(
    { userId },
    {
      $set: { progress, updatedAt },
      $setOnInsert: { userId },
      $inc: { version: 1 },
    },
    { upsert: true, returnDocument: 'after', projection: { version: 1 } },
  );
  return { version: res?.version ?? 1, updatedAt };
}