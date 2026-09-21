import { splitStatements } from './split-statements';

/**
 * Batch B (transaction durability expectation) - pure analysis of what a task's
 * REFERENCE solution expects from the transaction boundary.
 *
 * Why this exists: "an open transaction after submit" means two completely
 * different things depending on the task.
 *
 *  - A task whose reference is `BEGIN; INSERT ...; COMMIT;` expects DURABLE
 *    writes. A learner who leaves the txn open (`BEGIN; INSERT ...;`) has
 *    uncommitted rows and must be told to COMMIT - the screenshot bug.
 *  - Day 26's `inherit` chain teaches the PROVISIONAL state itself: task 1's
 *    reference is `BEGIN;` and task 2's is a bare multi-row INSERT that must
 *    stay uncommitted until task 3 runs `COMMIT;`. Here an open txn is the
 *    lesson, not a mistake, so blocking the submit would make the homework
 *    impossible to pass.
 *
 * The rule is therefore derived from the reference solution's own transaction
 * boundary, replayed from the transaction state the learner started in, exactly
 * like the executor's state machine (Batch A).
 */
export interface ReferenceTxnExpectation {
  /** The reference opens its own transaction (`BEGIN` / `START TRANSACTION`). */
  opensTransaction: boolean;
  /** The reference closes the transaction it runs in (`COMMIT` / `ROLLBACK`). */
  closesTransaction: boolean;
  /**
   * Writes from this submission must be DURABLE when it finishes - i.e. the
   * transaction boundary is closed at the end of the reference solution.
   */
  expectsDurable: boolean;
}

const OPENS_TXN = /^(BEGIN|START\s+TRANSACTION)\b/;
const CLOSES_TXN = /^(COMMIT|END|ROLLBACK)\b/;
/** Statements that move the transaction boundary without touching DATA. */
const DATA_PRESERVING = /^(BEGIN|START\s+TRANSACTION|COMMIT|END|SET\s+(?:SESSION\s+|GLOBAL\s+)?TRANSACTION\s+ISOLATION\s+LEVEL\s+[\w\s]+)$/;

/** Strip `--` / `#` line comments and block comments from one statement. */
function stripComments(statement: string): string {
  return statement
    .replace(/--[^\n]*/g, ' ')
    .replace(/#[^\n]*/g, ' ')
    .replace(/\/\*[\s\S]*?\*\//g, ' ');
}

/** Every statement of the script, normalized (comments + terminator removed). */
function normalizedStatements(solutionSql: string | undefined): string[] {
  const out: string[] = [];
  for (const raw of splitStatements(solutionSql ?? '')) {
    const stmt = stripComments(raw).replace(/;+\s*$/, '').trim().toUpperCase();
    if (stmt) out.push(stmt);
  }
  return out;
}

/**
 * Simulate the reference solution's transaction boundary.
 *
 * `ambientTxnOpen` is the session state BEFORE the learner's SQL ran: an
 * inherited open transaction (Day 26 chains) makes a bare `INSERT` reference
 * provisional, while the same reference in a clean session is durable.
 */
export function referenceTxnExpectation(
  solutionSql: string | undefined,
  ambientTxnOpen: boolean,
): ReferenceTxnExpectation {
  let open = ambientTxnOpen;
  let opensTransaction = false;
  let closesTransaction = false;
  for (const stmt of normalizedStatements(solutionSql)) {
    if (OPENS_TXN.test(stmt)) {
      opensTransaction = true;
      open = true;
    } else if (CLOSES_TXN.test(stmt)) {
      closesTransaction = true;
      open = false;
    }
  }
  return { opensTransaction, closesTransaction, expectsDurable: !open };
}

/**
 * True when the reference solution consists ONLY of `BEGIN` / `START
 * TRANSACTION` / `COMMIT` / `END` statements - statements that move the
 * transaction BOUNDARY and cannot change the data itself.
 *
 * Used by the final-state sandbox: such a reference has an expected state equal
 * to the pre-state by definition, so there is nothing to replay. Without this,
 * a `COMMIT;` reference (Day 26 task 3 - legal only because the learner inherited
 * an open transaction) errored in a transaction-less sandbox and reported a bogus
 * "task needs review" inconclusive verdict on a task that passes.
 *
 * `ROLLBACK` is deliberately NOT in this set: rolling back applies the BEGIN
 * snapshot, which DISCARDS writes staged earlier in the session, so it can change
 * what the data looks like.
 */
export function isDataPreservingTxnControlOnly(solutionSql: string | undefined): boolean {
  const statements = normalizedStatements(solutionSql);
  return statements.length > 0 && statements.every((stmt) => DATA_PRESERVING.test(stmt));
}
