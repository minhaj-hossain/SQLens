import { DatabaseState, QueryExecutionResult } from '../../types/database';
import { ValidationRule } from '../../types/curriculum';
import { validateTaskSolution, isReadOnlySelect, ValidationOutcome } from './validator';
import { gradeFinalState, FinalStateVerdict } from './state-verification';
import { GradingStage, GradingSurface, recordGradingEvent } from '../grading-telemetry';

/**
 * Phase 3 (single grading pipeline) — the ONE place a submission is graded.
 *
 * Why this exists: the blocking INSERT bug shipped twice because the same
 * five-step sequence was copy-pasted in `PracticeTaskView` and
 * `IndependentChallengeView`, so a fix had to be applied twice and a missed copy
 * stayed broken. Audits had a THIRD, weaker copy: `audit-all-tasks.ts` called
 * `validateTaskSolution` but never `gradeFinalState`, so "343/343 passed" meant
 * "no construct rule or row count objected" — it could not see the bug the
 * learner was staring at.
 *
 * The pipeline owns, in order:
 *   1. `fresh` lifecycle reset (idempotent retry: never accumulate rows)
 *   2. snapshot pre-state (deep clone — a live reference poisoned grading)
 *   3. execute the learner's SQL
 *   4. snapshot post-state (frozen, so the sandbox replay can't pollute it)
 *   5. validate result (count / construct / exact dataset)
 *   6. grade final state for mutations (wrong row/value → different state)
 *   7. record one telemetry event (best-effort, never fatal)
 *
 * UI calls `runAndGradeSubmission`; scripts call the same function with the same
 * hooks, so an audit failure is a real user-visible failure.
 */

/** The subset of a curriculum task grading needs (works for PracticeTask + ChallengeTask). */
export interface SubmittableTask {
  id: string;
  solutionSql?: string;
  validation: ValidationRule;
  databaseLifecycle?: 'fresh' | 'inherit';
}

/** Everything the pipeline needs from the host (provider / audit session). */
export interface SubmitHooks {
  /** Execute SQL on the session executor. */
  execute: (sql: string) => QueryExecutionResult;
  /** Deep-cloning snapshot hook. Absent → state grading is skipped. */
  getDatabaseState?: () => DatabaseState;
  /** Reset to seed. Absent → `fresh` retries keep prior mutations. */
  resetDatabase?: () => void;
}

export interface SubmitOptions {
  task: SubmittableTask;
  /** The learner's SQL (already trimmed by the caller's empty-guard). */
  sql: string;
  hooks: SubmitHooks;
  /** Which surface sent this submit — recorded in telemetry. */
  surface: GradingSurface;
  /** 1-based attempt within the current task session (telemetry only). */
  attempt?: number;
  /**
   * Set `false` in audits/scripts: telemetry is a browser-session signal and
   * must not be written by bulk verification runs.
   */
  record?: boolean;
}

export interface GradedVerdict extends ValidationOutcome {
  /** Which layer decided this verdict. */
  stage: GradingStage;
  /** True when the state layer ran AND agreed. */
  stateOk?: boolean;
  /** S3-11: the task's own reference solution failed — authoring bug. */
  inconclusive?: boolean;
  /** Phase 1: columns whose values differed on a same-size mismatch. */
  diffColumns?: string[];
}

export interface SubmitOutcome extends GradedVerdict {
  /** The learner's raw execution result (for the results console). */
  result: QueryExecutionResult;
  /** True when this attempt reset the database first (fresh-task retry). */
  reset: boolean;
}

/** Structural shape of a mutation/DDL task: graded by final state, not by result. */
export function isStateGraded(task: SubmittableTask): boolean {
  return !!task.solutionSql && !isReadOnlySelect(task.solutionSql);
}

/**
 * Grade an ALREADY-EXECUTED submission. Pure with respect to the executor (it
 * reads snapshots and replays the reference solution in a sandbox), so audit
 * scripts can call it directly after their own `executeQuery`.
 */
export function gradeSubmission(input: {
  task: SubmittableTask;
  sql: string;
  result: QueryExecutionResult;
  /** Snapshot taken BEFORE the learner's statement (omit → skip state grading). */
  preState?: DatabaseState | null;
  /** Snapshot taken AFTER the learner's statement. */
  postState?: DatabaseState | null;
  /** Reference output for `requireExactResult` SELECT tasks. */
  expected?: QueryExecutionResult;
}): GradedVerdict {
  const { task, sql, result, preState, postState, expected } = input;

  // Step 5: result-level validation (count / construct / dataset).
  const outcome = validateTaskSolution(sql, result, task.validation, expected);

  // Step 6: mutations/DDL are graded on FINAL STATE. A wrong-row UPDATE or a
  // wrong-value INSERT reports the same affectedRows as the right one, so the
  // result alone can never prove the learner did it correctly.
  if (outcome.passed && preState && postState && isStateGraded(task) && !result.error) {
    const stateCheck: FinalStateVerdict = gradeFinalState(preState, task.solutionSql!, postState, {
      verifyTypes: !!task.validation.verifyColumnTypes,
    });
    if (!stateCheck.ok) {
      return {
        passed: false,
        feedback:
          stateCheck.message ||
          'The statement ran, but the resulting database state does not match the expected outcome.',
        stage: 'final-state',
        stateOk: false,
        diffColumns: stateCheck.diffColumns,
      };
    }
    return {
      passed: true,
      feedback: outcome.feedback,
      stage: 'pass',
      stateOk: true,
      inconclusive: stateCheck.inconclusive,
      diffColumns: stateCheck.diffColumns,
    };
  }

  if (outcome.passed) {
    // Only reachable when the state layer did NOT run: read-only SELECT tasks
    // (nothing to compare), `expectFailure` labs (the engine errored on
    // purpose), or a host with no snapshot hooks. Reporting `stateOk: true`
    // here would claim a comparison that never executed — the same class of
    // phantom success the P0 bug was made of. Telemetry reads this field to
    // detect "right count, wrong values", so it must mean "layer ran and
    // agreed", never "probably fine".
    return { ...outcome, stage: 'pass', stateOk: undefined };
  }
  return { ...outcome, stage: result.error ? 'engine-error' : 'validation' };
}

/**
 * The production submit path: reset (when `fresh`) → snapshot → execute →
 * snapshot → validate → grade final state → record telemetry.
 *
 * Idempotence contract (P0): a correct solution passes on attempt 1 and on
 * attempt N, because `fresh` tasks restart from seed instead of stacking
 * mutations (28 → 29 → 30 → 31 made every grader message off-by-one).
 */
export function runAndGradeSubmission(options: SubmitOptions): SubmitOutcome {
  const { task, sql, hooks, surface, attempt = 1, record = true } = options;
  const { execute, getDatabaseState, resetDatabase } = hooks;

  // Step 1: `fresh` tasks reset BEFORE the snapshot. Read-only SELECT tasks are
  // exempt: their solutionSql never mutates, so a reset would only discard the
  // learner's earlier work in an `inherit` concept.
  const reset = task.databaseLifecycle === 'fresh' && isStateGraded(task);
  if (reset) resetDatabase?.();

  // Steps 2–4: pre/post snapshots are deep clones; the sandbox replay must never
  // observe the learner's own mutation.
  const preState = getDatabaseState?.();
  const result = execute(sql);
  const postState = getDatabaseState?.();

  // Reference dataset for exact-result SELECT tasks — legal only for a
  // read-only solution, so computing it can't mutate the session database.
  const expected =
    task.validation.requireExactResult && !result.error && isReadOnlySelect(task.solutionSql)
      ? execute(task.solutionSql!)
      : undefined;

  const verdict = gradeSubmission({ task, sql, result, preState, postState, expected });

  // Step 7: telemetry is best-effort and must never break a submit.
  if (record) {
    recordGradingEvent({
      taskId: task.id,
      stage: verdict.stage,
      surface,
      validatorPassed: verdict.stage === 'final-state' ? true : verdict.passed,
      stateOk: verdict.stateOk,
      affectedRows: result.affectedRows ?? result.rowCount,
      inconclusive: verdict.inconclusive,
      diffColumns: verdict.diffColumns,
      attempt,
    });
  }

  return { ...verdict, result, reset };
}

