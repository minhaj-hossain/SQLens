import type { CloudProgress } from './merge';
import type { UserLearningState } from '../../types/progress';

/**
 * Batch 1 — client write-serialization guards (pure, unit-testable).
 *
 * These model the rules LearningProgressProvider enforces around reset:
 *  - a reset opens a short "quiet window" during which background writers
 *    (debounced push, pagehide flush, focus revalidation) must stay silent;
 *  - a `GET null` (no cloud doc) must never re-upload a state that is
 *    strictly older than the local state just loaded;
 *  - aborting the in-flight PUT before DELETE removes the last-writer-wins
 *    race where stale bytes land after the reset.
 */

/** Quiet-window length after a reset — background sync stays silent. */
export const RESET_QUIET_WINDOW_MS = 3000;

/** True while `nowMs` is still inside the post-reset quiet window. */
export function isInResetQuietWindow(resetQuietUntilMs: number, nowMs: number): boolean {
  return nowMs < resetQuietUntilMs;
}

/**
 * Guard for the `GET null` branch: only push when the in-memory ref is at
 * least as new as the local state we just loaded. Prevents a stale tab from
 * recreating the cloud doc right after another tab reset it.
 */
export function shouldPushOnNullCloud(
  latestState: UserLearningState,
  localState: UserLearningState,
): boolean {
  const latest = Date.parse(latestState.lastActiveTimestamp ?? '');
  const local = Date.parse(localState.lastActiveTimestamp ?? '');
  const latestMs = Number.isNaN(latest) ? 0 : latest;
  const localMs = Number.isNaN(local) ? 0 : local;
  return latestMs >= localMs;
}

export interface SyncGateState {
  /** Epoch-ms until which background sync is suppressed (0 = no suppression). */
  quietUntilMs: number;
}

/** True when a background sync writer (debounce/flush/focus) may proceed. */
export function mayBackgroundSync(gate: SyncGateState, nowMs: number): boolean {
  return !isInResetQuietWindow(gate.quietUntilMs, nowMs);
}

/**
 * Decide whether an incoming cloud doc may be union-merged (Batch 2/3 will
 * add the `resetEpoch` fencing on top of this timestamp rule).
 */
export function shouldAdoptCloudForMerge(
  local: UserLearningState,
  cloud: CloudProgress,
): boolean {
  const localTs = Date.parse(local.lastActiveTimestamp ?? '');
  const cloudTs = Date.parse(cloud.lastActiveTimestamp ?? '');
  const l = Number.isNaN(localTs) ? 0 : localTs;
  const c = Number.isNaN(cloudTs) ? 0 : cloudTs;
  return c >= l;
}
