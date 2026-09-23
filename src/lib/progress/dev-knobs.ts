/**
 * Milestone 4 (item 15) — developer-only time knobs (finding S-3).
 *
 * `bypassDailyLock` and `simulatedTimeOffsetHours` exist so `next dev` can
 * simulate the 6 PM learning-cycle boundary without waiting for real time.
 * They are deliberately inert outside `next dev`: every reader (unlock gates,
 * effective-clock math, cloud merge) funnels through this check, and because
 * the bundler inlines NODE_ENV the whole knob path dead-code-eliminates out of
 * production builds. Types stay on `UserLearningState`; production behaviour is
 * always `bypass = false`, `offset = 0`. Persistence already matches —
 * `loadUserState` hard-resets both fields on every load (there is no UI for
 * these knobs anywhere in `src`).
 */
export function devKnobsEnabled(): boolean {
  return process.env.NODE_ENV === 'development';
}
