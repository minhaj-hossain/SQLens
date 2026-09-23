import { DatabaseState, QueryExecutionResult, TxnStatus } from '../../types/database';
import { ValidationRule } from '../../types/curriculum';
import { validateTaskSolution, isReadOnlySelect, ValidationOutcome } from './validator';
import { gradeFinalState, FinalStateVerdict, StateCompareOptions } from './state-verification';
import { GradingStage, GradingSurface, recordGradingEvent } from '../grading-telemetry';
import { referenceTxnExpectation } from './txn-expectation';

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
  setupSql?: string;
}

/** Everything the pipeline needs from the host (provider / audit session). */
export interface SubmitHooks {
  /** Execute SQL on the session executor. */
  execute: (sql: string) => QueryExecutionResult;
  /** Deep-cloning snapshot hook. Absent → state grading is skipped. */
  getDatabaseState?: () => DatabaseState;
  /**
   * Batch A/B: DURABLE snapshot hook (live minus uncommitted txn writes).
   * State-graded tasks MUST grade against this; `getDatabaseState` stays the
   * session view for the explorer. Absent → falls back to `getDatabaseState`
   * (pre-Batch-A hosts, incl. old tests).
   */
  getCommittedState?: () => DatabaseState;
  /**
   * Batch B: session txn state for the open-transaction submit gate.
   * Absent → the gate is skipped (same fallback as the committed snapshot).
   */
  getTransactionState?: () => { status: TxnStatus; uncommittedChanges: number };
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
  /**
   * Batch B: the submit script left a transaction OPEN, so nothing was durable.
   * Grading refused to run — the learner must COMMIT or ROLLBACK first.
   * Never a pass; the UI shows the open-txn warning instead of a diff.
   */
  txnBlocked?: boolean;
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
  /** Extra final-state comparison options (Batch B: txn context). */
  stateOptions?: StateCompareOptions;
}): GradedVerdict {
  const { task, sql, result, preState, postState, expected, stateOptions } = input;

  // Step 5: result-level validation (count / construct / dataset).
  const outcome = validateTaskSolution(sql, result, task.validation, expected);

  // Step 6: mutations/DDL are graded on FINAL STATE. A wrong-row UPDATE or a
  // wrong-value INSERT reports the same affectedRows as the right one, so the
  // result alone can never prove the learner did it correctly.
  if (outcome.passed && preState && postState && isStateGraded(task) && !result.error) {
    const stateCheck: FinalStateVerdict = gradeFinalState(preState, task.solutionSql!, postState, {
      verifyTypes: !!task.validation.verifyColumnTypes,
      strictValues: !!task.validation.strictValues,
      ...stateOptions,
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
  const { execute, getDatabaseState, getCommittedState, getTransactionState, resetDatabase } = hooks;

  // Step 1: `fresh` tasks reset BEFORE the snapshot. DDL tasks without explicit 'inherit'
  // reset to seed so retries never accumulate duplicate definitions.
  // P0 FIX: the reset used to be gated on `isStateGraded(task)` (mutation
  // solutions only), so a `fresh` READ-ONLY task never replayed from seed —
  // its verdict depended on whatever state the session happened to hold
  // (the Day 42/54 ladder-pollution failures: 30 rows where 4 were graded).
  // `fresh` means seed, full stop; `tests/content/solution-sql.test.ts` has
  // always reset unconditionally on `fresh` before setupSql, which is exactly
  // the sequence now guaranteed here. `inherit` chains never reset.
  const isDdl = /CREATE\s+TABLE|ALTER\s+TABLE|DROP\s+TABLE|CREATE\s+(?:UNIQUE\s+)?INDEX|DROP\s+INDEX/i.test(task.solutionSql || '');
  const reset = task.databaseLifecycle === 'fresh' || (isDdl && task.databaseLifecycle !== 'inherit');
  if (reset) resetDatabase?.();

  // If task defines prerequisite setupSql (e.g. multi-stage capstone), bootstrap it
  if (task.setupSql) {
    execute(task.setupSql);
  }

  // Batch B: the transaction state the learner STARTS from decides what "open at
  // submit" means. A `fresh` reset above closes any inherited transaction, while
  // Day 26's `inherit` chains deliberately hand the next task an OPEN one (task 1
  // teaches `BEGIN;`, task 2 fills it, task 3 commits) — there an open txn is the
  // exercise, not a mistake, so a blanket gate would make the homework unpassable.
  const txnBefore = getTransactionState?.();
  const txnWasOpen = !!txnBefore && txnBefore.status !== 'none';
  const expectation = referenceTxnExpectation(task.solutionSql, txnWasOpen);

  // Steps 2–4: pre/post snapshots are deep clones; the sandbox replay must never
  // observe the learner's own mutation.
  const preState = getDatabaseState?.();
  const result = execute(sql);
  const txnAfter = getTransactionState?.();

  // Batch B gate: an OPEN (or FAILED) transaction means the script's writes are
  // provisional. That is only a mistake when the task expects DURABILITY — i.e.
  // when its own reference leaves the transaction boundary closed. The result grid
  // still shows what RAN (session view); only the verdict is gated.
  if (
    txnAfter &&
    txnAfter.status !== 'none' &&
    isStateGraded(task) &&
    expectation.expectsDurable &&
    !result.error
  ) {
    const blocked: SubmitOutcome = {
      passed: false,
      feedback:
        txnAfter.status === 'failed'
          ? 'Your transaction has failed and must be rolled back. Run ROLLBACK; before retrying — COMMIT cannot save a failed transaction.'
          : `You have an open transaction${txnAfter.uncommittedChanges > 0 ? ` with ${txnAfter.uncommittedChanges} uncommitted change(s)` : ''}. Run COMMIT; to make it durable (or ROLLBACK; to discard it) before checking.`,
      stage: 'validation',
      txnBlocked: true,
      result,
      reset,
    };
    if (record) {
      recordGradingEvent({
        taskId: task.id,
        stage: blocked.stage,
        surface,
        validatorPassed: false,
        affectedRows: result.affectedRows ?? result.rowCount,
        attempt,
      });
    }
    return blocked;
  }

  // Batch A/B: grade the DURABLE view for durability tasks (grading the session
  // view would bless `BEGIN; INSERT;` as durable — the screenshot bug) and the
  // SESSION view for provisional ones, where the reference's own rows are
  // uncommitted too and its durable view would always look "missing".
  const postState = expectation.expectsDurable
    ? (getCommittedState ?? getDatabaseState)?.()
    : (getDatabaseState ?? getCommittedState)?.();


  // Reference dataset for exact-result SELECT tasks — legal only for a
  // read-only solution, so computing it can't mutate the session database.
  const expected =
    task.validation.requireExactResult && !result.error && isReadOnlySelect(task.solutionSql)
      ? execute(task.solutionSql!)
      : undefined;

  const verdict = gradeSubmission({
    task,
    sql,
    result,
    preState,
    postState,
    expected,
    // Batch B: replay the reference in the SAME transaction context the learner
    // was in (a `COMMIT;` reference is only legal inside an inherited txn), and
    // compare the sandbox's session view for provisional tasks.
    stateOptions: {
      ambientTxn: txnWasOpen && !expectation.opensTransaction,
      provisional: !expectation.expectsDurable,
    },
  });

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

