import { describe, expect, it } from 'vitest';
import { SqlExecutor } from '../../src/lib/sql-engine/executor';
import {
  isStateGraded,
  runAndGradeSubmission,
} from '../../src/lib/sql-engine/submit-pipeline';

/**
 * Phase 3 regression tests: the shared submit pipeline both views run.
 *
 * These pin the exact behaviors the blocking INSERT bug violated: `fresh`
 * retries must be idempotent (no 28→29→30→31 accumulation), the frozen postState
 * — not a live re-read — is what gets graded, and `stateOk` means the
 * final-state layer RAN and AGREED (never "probably fine").
 */

function lessonHooks(exec: SqlExecutor) {
  return {
    execute: (sql: string) => exec.executeQuery(sql),
    getDatabaseState: () => exec.getDatabaseState(),
    resetDatabase: () => exec.resetDatabase(),
  };
}

const INSERT_CUSTOMER = {
  id: 'day19-c1-t2',
  solutionSql:
    "INSERT INTO customers (name, email, city, signup_date) VALUES ('Sultana Begum', 'sultana@example.com', 'Dhaka', '2026-08-25');",
  validation: {},
  databaseLifecycle: 'fresh' as const,
};

describe('submit-pipeline — fresh retry idempotence (P0)', () => {
  it('a correct solution passes on attempt 1 and on attempt N with the same state', () => {
    const exec = new SqlExecutor();
    const seedCount = exec.executeQuery('SELECT * FROM customers;').rowCount;

    const first = runAndGradeSubmission({
      task: INSERT_CUSTOMER,
      sql: INSERT_CUSTOMER.solutionSql,
      hooks: lessonHooks(exec),
      surface: 'lesson',
      attempt: 1,
      record: false,
    });
    expect(first.passed).toBe(true);
    expect(first.reset).toBe(true);
    // INSERT reports affectedRows (not the table's row count): one row added.
    expect(first.result.affectedRows).toBe(1);
    expect(exec.executeQuery('SELECT * FROM customers;').rowCount).toBe(seedCount + 1);

    const second = runAndGradeSubmission({
      task: INSERT_CUSTOMER,
      sql: INSERT_CUSTOMER.solutionSql,
      hooks: lessonHooks(exec),
      surface: 'lesson',
      attempt: 2,
      record: false,
    });
    expect(second.passed).toBe(true);
    // No accumulation: attempt 2 replays from seed, not on top of attempt 1.
    expect(second.result.affectedRows).toBe(1);
    expect(exec.executeQuery('SELECT * FROM customers;').rowCount).toBe(seedCount + 1);
  });

  it('allows custom values on INSERT by default, and enforces diff when strictValues is set', () => {
    const exec = new SqlExecutor();
    // Default flexible behavior: custom values pass as long as constraints and counts are valid
    const flexibleVerdict = runAndGradeSubmission({
      task: INSERT_CUSTOMER,
      sql: "INSERT INTO customers (name, email, city, signup_date) VALUES ('Rahim Ahmed', 'rahim.ahmed@example.com', 'Dhaka', '2026-09-20');",
      hooks: lessonHooks(exec),
      surface: 'lesson',
      record: false,
    });
    expect(flexibleVerdict.passed).toBe(true);

    // When strictValues is true, exact value matching is enforced
    const strictTask = {
      ...INSERT_CUSTOMER,
      validation: { strictValues: true },
    };
    const strictVerdict = runAndGradeSubmission({
      task: strictTask,
      sql: "INSERT INTO customers (name, email, city, signup_date) VALUES ('Rahim Ahmed', 'rahim.ahmed@example.com', 'Dhaka', '2026-09-20');",
      hooks: lessonHooks(exec),
      surface: 'lesson',
      record: false,
    });
    expect(strictVerdict.passed).toBe(false);
    expect(strictVerdict.stage).toBe('final-state');
    expect(strictVerdict.stateOk).toBe(false);
    expect(strictVerdict.feedback).toMatch(/row count is right/i);
    expect(strictVerdict.diffColumns).toContain('name');
  });
});

describe('submit-pipeline — stateOk honesty', () => {
  it('read-only SELECT passes report stateOk as undefined (layer never ran)', () => {
    const exec = new SqlExecutor();
    const verdict = runAndGradeSubmission({
      task: {
        id: 'day01-t1',
        solutionSql: 'SELECT * FROM products;',
        validation: { expectedRowCount: 28 },
      },
      sql: 'SELECT * FROM products;',
      hooks: lessonHooks(exec),
      surface: 'lesson',
      record: false,
    });
    expect(verdict.passed).toBe(true);
    expect(verdict.stage).toBe('pass');
    expect(verdict.stateOk).toBeUndefined();
  });

  it('isStateGraded is true for mutations/DDL and false for read-only SELECTs', () => {
    expect(isStateGraded(INSERT_CUSTOMER)).toBe(true);
    expect(
      isStateGraded({ id: 'x', solutionSql: 'SELECT 1;', validation: {} }),
    ).toBe(false);
    // expectFailure labs grade on the engine error, and the pipeline never
    // resets before a failing statement (nothing valid to snapshot-compare).
    // They still replay their solution through gradeSubmission, so they count
    // as stateGraded for the audit census — the state layer simply reports
    // "nothing to compare" once the engine has errored.
    expect(
      isStateGraded({
        id: 'y',
        solutionSql: 'INSERT INTO t (a) VALUES (1);',
        validation: { expectFailure: true },
      }),
    ).toBe(true);
  });
});
