import { getResetEpoch, type CloudProgress } from './merge';
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
 * Batch 4 — multitab message protocol (pure, unit-testable).
 *
 * Two message types travel on BroadcastChannel('sqlens_progress_sync'):
 *  - PROGRESS_SYNC  { userId, state, resetEpoch } — normal state propagation.
 *  - PROGRESS_RESET { userId, state, resetEpoch, resetAt } — a full reset. A
 *    stale tab that missed the SYNC (closed, throttled, storage-event only)
 *    must still converge: on RESET it drops pendingPush, aborts its in-flight
 *    PUT, adopts fresh, and never re-pushes its older epoch.
 *
 * Rule: an incoming message with an OLDER epoch than local is ignored (the
 * sender is stale); NEWER-or-equal is adopted without pushing back (the reset
 * path already committed the tombstone server-side, and normal SYNCs carry
 * already-persisted state). This is what closes V4: previously the receiver
 * blindly `setUserState(incoming)` + merged, so a stale tab re-merged its old
 * bytes back and its push scheduler PUT them over the tombstone.
 */

/** Outgoing/incoming multitab payload — epoch travels with every message. */
export interface ProgressSyncMessage {
  type: 'PROGRESS_SYNC';
  userId: string | null;
  state: UserLearningState;
  resetEpoch: number;
}

/** Authoritative reset broadcast — forces stale tabs to converge to Day 1. */
export interface ProgressResetMessage {
  type: 'PROGRESS_RESET';
  userId: string | null;
  state: UserLearningState;
  resetEpoch: number;
  resetAt: string | null;
}

export type ProgressBroadcastMessage = ProgressSyncMessage | ProgressResetMessage;

/** Build a PROGRESS_SYNC for the given state (epoch stamped from state). */
export function buildSyncMessage(userId: string | null, state: UserLearningState): ProgressSyncMessage {
  return { type: 'PROGRESS_SYNC', userId, state, resetEpoch: getResetEpoch(state) };
}

/** Build a PROGRESS_RESET for a freshly reset state. */
export function buildResetMessage(userId: string | null, fresh: UserLearningState): ProgressResetMessage {
  return {
    type: 'PROGRESS_RESET',
    userId,
    state: fresh,
    resetEpoch: getResetEpoch(fresh),
    resetAt: fresh.resetAt ?? null,
  };
}

export type IncomingSyncDecision =
  | { action: 'ignore'; reason: 'user-mismatch' | 'stale-epoch' | 'invalid' }
  | { action: 'adopt-sync'; state: UserLearningState }
  | { action: 'adopt-reset'; state: UserLearningState; resetEpoch: number; resetAt: string | null };

/**
 * Decide what a tab should do with an incoming broadcast message.
 * Pure — the provider applies the decision (adopt, drop pendingPush, abort
 * PUT, skip next push) so the decision itself stays unit-testable.
 */
export function decideIncomingBroadcast(
  data: unknown,
  signedInUserId: string | null,
  localEpoch: number,
): IncomingSyncDecision {
  if (!data || typeof data !== 'object') return { action: 'ignore', reason: 'invalid' };
  const msg = data as Partial<ProgressBroadcastMessage>;
  if (msg.userId !== signedInUserId) return { action: 'ignore', reason: 'user-mismatch' };
  const state = (msg as { state?: unknown }).state;
  if (!state || typeof state !== 'object' || typeof (state as { currentModuleId?: unknown }).currentModuleId !== 'string') {
    return { action: 'ignore', reason: 'invalid' };
  }
  const incomingEpoch =
    typeof msg.resetEpoch === 'number' && Number.isFinite(msg.resetEpoch)
      ? Math.floor(msg.resetEpoch)
      : getResetEpoch(state as UserLearningState);
  // Older generation sender — stale tab writing before it converged. Ignore,
  // or it would merge old bytes back over our newer reset (V4).
  if (incomingEpoch < localEpoch) return { action: 'ignore', reason: 'stale-epoch' };
  const typed = state as UserLearningState;
  if (msg.type === 'PROGRESS_RESET') {
    const resetAt = (msg as Partial<ProgressResetMessage>).resetAt ?? typed.resetAt ?? null;
    return { action: 'adopt-reset', state: { ...typed, resetEpoch: incomingEpoch }, resetEpoch: incomingEpoch, resetAt };
  }
  if (msg.type === 'PROGRESS_SYNC') {
    return { action: 'adopt-sync', state: { ...typed, resetEpoch: incomingEpoch } };
  }
  return { action: 'ignore', reason: 'invalid' };
}

export type IncomingStorageDecision =
  | { action: 'ignore' }
  | { action: 'adopt'; state: UserLearningState };

/**
 * Decide what a tab should do with a `storage` event payload. Same epoch rule
 * as broadcasts: older-generation writes are ignored, newer-or-equal adopted
 * without pushing back. Guards the path where BroadcastChannel is missing but
 * localStorage events still fire.
 */
export function decideIncomingStorage(incoming: unknown, localEpoch: number): IncomingStorageDecision {
  if (!incoming || typeof incoming !== 'object') return { action: 'ignore' };
  const state = incoming as UserLearningState;
  if (typeof state.currentModuleId !== 'string') return { action: 'ignore' };
  if (getResetEpoch(state) < localEpoch) return { action: 'ignore' };
  return { action: 'adopt', state: { ...state, resetEpoch: getResetEpoch(state) } };
}
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
