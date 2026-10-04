/**
 * Evaluation-state derivation for the practice task view (shared seam).
 *
 * The state the learner sees after a submit — idle / wrong / correct — must
 * follow the VERDICT (`outcome.passed`), never the console payload alone:
 * snippet labs (Prisma CLI / static labs) legitimately return NO run result
 * (`result: undefined`, `displayMode: 'terminal'`). Deriving 'idle' from a
 * missing result left a PASSED lab with no Next button and a FAILED lab with
 * no error banner — a hard dead end on every snippet lab, and the reason a
 * correct answer on Prisma Day 2 · Concept 1 · Task 1 could not advance.
 *
 * Decision table:
 *   passed                  -> 'correct'  (Next unlocked, green verdict banner)
 *   graded but not passed   -> 'wrong'    (Try Again + feedback banner)
 *   nothing graded yet      -> 'idle'     (Run & Check)
 */
export type EvaluationState = 'idle' | 'wrong' | 'correct';

export interface EvaluationStateInputs {
  /** Verdict for THIS task's last submit (or its persisted completion state). */
  taskPassed: boolean;
  /** True when a run result exists. Snippet labs: false by design. */
  hasResult: boolean;
  /** True when graded feedback is on screen (success or failure message). */
  hasFeedback: boolean;
}

export function deriveEvaluationState({
  taskPassed,
  hasResult,
  hasFeedback,
}: EvaluationStateInputs): EvaluationState {
  if (taskPassed) return 'correct';
  if (hasResult || hasFeedback) return 'wrong';
  return 'idle';
}
