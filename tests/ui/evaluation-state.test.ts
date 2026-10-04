import { describe, it, expect } from 'vitest';
import { deriveEvaluationState } from '../../src/lib/evaluation-state';

/**
 * Verdict-first regression suite for the practice view's post-submit state.
 *
 * The bug this pins: snippet labs (Prisma CLI / static labs) pass with
 * `result: undefined` and `displayMode: 'terminal'`. Deriving the UI state from
 * the result payload made a PASSED lab look 'idle' — no Next button, no green
 * banner — which dead-ended Day 2 · Concept 1 · Task 1 of the Prisma track.
 */
describe('deriveEvaluationState — the verdict decides, the payload never vetoes', () => {
  it('a passed snippet lab (no run result) is still correct — Next must be reachable', () => {
    expect(
      deriveEvaluationState({ taskPassed: true, hasResult: false, hasFeedback: false }),
    ).toBe('correct');
  });

  it('a passed run task is correct (SQL / executable Prisma unchanged)', () => {
    expect(
      deriveEvaluationState({ taskPassed: true, hasResult: true, hasFeedback: true }),
    ).toBe('correct');
  });

  it('a revisited completed task is correct before any re-run', () => {
    // `taskPassed` seeds from persisted completion, so returning to a done task
    // must not require a throwaway re-run just to see Next again.
    expect(
      deriveEvaluationState({ taskPassed: true, hasResult: false, hasFeedback: false }),
    ).toBe('correct');
  });

  it('a failed static lab with feedback is wrong — the banner must not stay hidden', () => {
    expect(
      deriveEvaluationState({ taskPassed: false, hasResult: false, hasFeedback: true }),
    ).toBe('wrong');
  });

  it('a failed run is wrong (Try Again + feedback banner)', () => {
    expect(
      deriveEvaluationState({ taskPassed: false, hasResult: true, hasFeedback: true }),
    ).toBe('wrong');
  });

  it('an edited-after-failure state (result kept, feedback cleared) stays wrong', () => {
    expect(
      deriveEvaluationState({ taskPassed: false, hasResult: true, hasFeedback: false }),
    ).toBe('wrong');
  });

  it('nothing graded yet is idle (Run & Check)', () => {
    expect(
      deriveEvaluationState({ taskPassed: false, hasResult: false, hasFeedback: false }),
    ).toBe('idle');
  });
});
