import { describe, it, expect } from 'vitest';
import { SqlExecutor } from '../../src/lib/sql-engine/executor';
import {
  gradeFinalState,
  compareFinalState,
  serializeCellValue,
} from '../../src/lib/sql-engine/state-verification';
import { validateTaskSolution } from '../../src/lib/sql-engine/validator';
import { DatabaseState, QueryExecutionResult, TableRow } from '../../src/types/database';

/** Build a minimal one-table DatabaseState fixture. */
function mkState(tableName: string, rows: TableRow[], cols?: string[]): DatabaseState {
  return {
    tables: { [tableName]: rows },
    schemas: {
      [tableName]: {
        name: tableName,
        displayName: tableName,
        description: '',
        columns: (cols ?? Object.keys(rows[0] ?? {})).map((n) => ({
          name: n,
          type: 'string' as const,
        })),
      },
    },
  };
}

function execResult(rows: TableRow[], columns: string[]): QueryExecutionResult {
  return { success: true, columns, rows, rowCount: rows.length, executionTimeMs: 1 };
}

describe('F1: mutation grading by final database state', () => {
  const SOLUTION = 'UPDATE products SET price = price * 1.10 WHERE product_id = 1;';

  it('accepts the learner running the exact solution', () => {
    const preState = new SqlExecutor().getDatabaseState();
    const learner = new SqlExecutor(preState);
    learner.execute(SOLUTION);
    const verdict = gradeFinalState(preState, SOLUTION, learner.getDatabaseState());
    expect(verdict.ok).toBe(true);
  });

  it('REJECTS an UPDATE targeting the wrong row (the report.md Day-25 false-accept)', () => {
    const preState = new SqlExecutor().getDatabaseState();
    const learner = new SqlExecutor(preState);
    learner.execute('UPDATE products SET price = 15.99 WHERE product_id = 2;');
    const verdict = gradeFinalState(preState, SOLUTION, learner.getDatabaseState());
    expect(verdict.ok).toBe(false);
    expect(verdict.message).toMatch(/products/i);
  });

  it('REJECTS an unguarded UPDATE (missing WHERE mutates every row)', () => {
    const preState = new SqlExecutor().getDatabaseState();
    const learner = new SqlExecutor(preState);
    learner.execute('UPDATE products SET price = price * 1.10;');
    const verdict = gradeFinalState(preState, SOLUTION, learner.getDatabaseState());
    expect(verdict.ok).toBe(false);
  });

  // P0 regression (blocking INSERT bug): getDatabaseState() must return a
  // frozen snapshot, not the live reference. Before the fix, snapshotting
  // preState then executing mutated the SAME object, so the sandbox replay
  // inserted twice and a correct INSERT could never grade ok.
  it('P0: preState snapshot stays frozen after the learner executes', () => {
    const host = new SqlExecutor();
    const seedCount = host.executeQuery('SELECT * FROM products;').rowCount;
    const preState = host.getDatabaseState();
    const preCount = preState.tables['products'].length;
    host.executeQuery(
      "INSERT INTO products (name, supplier_id, category_id, price, quantity_in_stock, reorder_level) VALUES ('Ultra Wireless Mouse', 1, 1, 49.99, 100, 20);",
    );
    expect(preState.tables['products'].length).toBe(preCount);
    expect(preState.tables['products'].length).toBe(seedCount);
    expect(host.getDatabaseState().tables['products'].length).toBe(seedCount + 1);
  });

  it('P0: correct INSERT grades ok, repeatedly (idempotent retry)', () => {
    const INSERT =
      "INSERT INTO products (name, supplier_id, category_id, price, quantity_in_stock, reorder_level) VALUES ('Ultra Wireless Mouse', 1, 1, 49.99, 100, 20);";
    for (let attempt = 0; attempt < 3; attempt++) {
      // Fresh-task retry contract: reset to seed, snapshot, execute, grade.
      const host = new SqlExecutor();
      const preState = host.getDatabaseState();
      host.executeQuery(INSERT);
      const verdict = gradeFinalState(preState, INSERT, host.getDatabaseState());
      expect(verdict.ok).toBe(true);
    }
  });

  it('is float-tolerant: precomputed literal 17.589 equals engine-computed price*1.10', () => {
    const preState = new SqlExecutor().getDatabaseState();
    const learner = new SqlExecutor(preState);
    learner.execute('UPDATE products SET price = 17.589 WHERE product_id = 1;');
    const verdict = gradeFinalState(preState, SOLUTION, learner.getDatabaseState());
    expect(verdict.ok).toBe(true);
  });

  it('is row-order-insensitive for INSERT batches', () => {
    const expected = mkState('t', [{ id: 1, name: 'a' }, { id: 2, name: 'b' }, { id: 3, name: 'c' }]);
    const actual = mkState('t', [{ id: 3, name: 'c' }, { id: 1, name: 'a' }, { id: 2, name: 'b' }]);
    expect(compareFinalState(actual, expected).ok).toBe(true);
  });

  it('rejects a missing or unexpected table (DDL grading)', () => {
    const base = mkState('t', [{ id: 1 }]);
    expect(compareFinalState(mkState('t', [{ id: 1 }]), base).ok).toBe(true);
    expect(compareFinalState(mkState('other', [{ id: 1 }]), base).ok).toBe(false);
    const withExtra = { tables: { t: [{ id: 1 }], extra: [{ x: 1 }] }, schemas: base.schemas };
    expect(compareFinalState(withExtra, base).ok).toBe(false);
  });

  it('compares column NAME sets, not types (VARCHAR(200) vs TEXT is legal variation)', () => {
    const expected = mkState('t', [{ id: 1, note: 'x' }], ['id', 'note']);
    const actual = mkState('t', [{ id: 1, note: 'x' }], ['id', 'note']);
    expect(compareFinalState(actual, expected).ok).toBe(true);
    const missingCol = mkState('t', [{ id: 1 }], ['id']);
    expect(compareFinalState(missingCol, expected).ok).toBe(false);
  });

  it('tolerates execution-time timestamps at minute precision', () => {
    const expected = mkState('r', [{ id: 1, created_at: '2026-08-31 10:30:02' }], ['id', 'created_at']);
    const sameMinute = mkState('r', [{ id: 1, created_at: '2026-08-31 10:30:59' }], ['id', 'created_at']);
    const different = mkState('r', [{ id: 1, created_at: '2026-07-01 10:30:02' }], ['id', 'created_at']);
    expect(compareFinalState(sameMinute, expected).ok).toBe(true);
    expect(compareFinalState(different, expected).ok).toBe(false);
  });

  // Phase 1 (value-diff errors): same-size mismatch names differing columns
  // instead of the cryptic "expected 16, found 16". Covers the Day-25
  // screenshot: Rahim vs Sultana, same count, wrong values.
  it('Phase 1: same-count wrong-INSERT names the differing columns', () => {
    const expected = mkState(
      'customers',
      [{ name: 'Sultana Begum', email: 'sultana@example.com', city: 'Dhaka' }],
      ['name', 'email', 'city'],
    );
    const actual = mkState(
      'customers',
      [{ name: 'Rahim Ahmed', email: 'rahim.ahmed@example.com', city: 'Dhaka' }],
      ['name', 'email', 'city'],
    );
    const verdict = compareFinalState(actual, expected);
    expect(verdict.ok).toBe(false);
    expect(verdict.message).toMatch(/row count is right/i);
    expect(verdict.message).toMatch(/values differ in/i);
    expect(verdict.message).toContain("'name'");
    expect(verdict.message).toContain('Rahim Ahmed');
    expect(verdict.message).toContain('Sultana Begum');
    // Same-city must NOT be listed as differing.
    expect(verdict.message).not.toContain("'city'");
  });

  it('Phase 1: count mismatch keeps the count framing (no fake diff)', () => {
    const expected = mkState('t', [{ id: 1 }, { id: 2 }]);
    const actual = mkState('t', [{ id: 1 }]);
    const verdict = compareFinalState(actual, expected);
    expect(verdict.ok).toBe(false);
    expect(verdict.message).toMatch(/expected 2 row\(s\), found 1/);
    expect(verdict.message).not.toMatch(/row count is right/i);
  });

  it('Phase 1: end-to-end Day-25 T2 wrong customer gets a diff message', () => {
    const SOLUTION =
      "INSERT INTO customers (name, email, city, signup_date) VALUES ('Sultana Begum', 'sultana@example.com', 'Dhaka', '2026-08-25');";
    const preState = new SqlExecutor().getDatabaseState();
    const learner = new SqlExecutor(preState);
    learner.executeQuery(
      "INSERT INTO customers (name, email, city, signup_date) VALUES ('Rahim Ahmed', 'rahim.ahmed@example.com', 'Dhaka', '2026-09-20');",
    );
    const verdict = gradeFinalState(preState, SOLUTION, learner.getDatabaseState());
    expect(verdict.ok).toBe(false);
    expect(verdict.message).toMatch(/values differ in/i);
    expect(verdict.message).toContain("'name'");
  });

  it('falls back to PASS when the reference solution itself errors', () => {
    const preState = new SqlExecutor().getDatabaseState();
    const verdict = gradeFinalState(preState, 'UPDATE nonexistent_table SET x = 1;', preState);
    expect(verdict.ok).toBe(true);
    // S3-11: the pass must be FLAGGED, not silent — a broken reference solution
    // is an authoring bug that has to stay visible.
    expect(verdict.inconclusive).toBe(true);
    expect(verdict.message).toMatch(/reference solution failed/i);
  });

  it('S3-11: verifyTypes OFF accepts legal type variation', () => {
    const expected = mkState('t', [{ id: 1, name: 'a' }], ['id', 'name']);
    const actual = mkState('t', [{ id: 1, name: 'a' }], ['id', 'name']);
    actual.schemas.t.columns[0].type = 'number';
    expect(compareFinalState(actual, expected).ok).toBe(true);
  });

  it('S3-11: verifyTypes ON rejects a wrong type KIND but ignores precision', () => {
    const expected = mkState('t', [{ id: 1, name: 'a' }], ['id', 'name']);
    expected.schemas.t.columns[0].type = 'number';

    const wrongKind = mkState('t', [{ id: 1, name: 'a' }], ['id', 'name']);
    const wrongVerdict = compareFinalState(wrongKind, expected, { verifyTypes: true });
    expect(wrongVerdict.ok).toBe(false);
    expect(wrongVerdict.message).toMatch(/requires/i);

    const sameKind = mkState('t', [{ id: 1, name: 'a' }], ['id', 'name']);
    sameKind.schemas.t.columns[0].type = 'number';
    expect(compareFinalState(sameKind, expected, { verifyTypes: true }).ok).toBe(true);
  });
});

describe('F2: float-exactness fix in exact-result grading', () => {
  it('accepts 18.700000000000003 vs 18.7 (different SUM expression order)', () => {
    const outcome = validateTaskSolution(
      'SELECT SUM(x) FROM t',
      execResult([{ revenue: 18.700000000000003 }], ['revenue']),
      { requireExactResult: true },
      execResult([{ revenue: 18.7 }], ['revenue']),
    );
    expect(outcome.passed).toBe(true);
  });

  it('still rejects genuinely different values', () => {
    const outcome = validateTaskSolution(
      'SELECT SUM(x) FROM t',
      execResult([{ revenue: 19.7 }], ['revenue']),
      { requireExactResult: true },
      execResult([{ revenue: 18.7 }], ['revenue']),
    );
    expect(outcome.passed).toBe(false);
  });
});

describe('F3: operator-normalized whereContainsTerms', () => {
  const result = execResult([], []);

  it('accepts <> when the task phrase uses !=', () => {
    const outcome = validateTaskSolution(
      "SELECT * FROM customers WHERE city <> 'Dhaka'",
      result,
      { requireWhere: true, whereContainsTerms: ["city != 'Dhaka'"] },
      undefined,
    );
    expect(outcome.passed).toBe(true);
  });

  it('accepts != when the task phrase uses <>', () => {
    const outcome = validateTaskSolution(
      "SELECT * FROM customers WHERE city != 'Dhaka'",
      result,
      { requireWhere: true, whereContainsTerms: ["city <> 'Dhaka'"] },
      undefined,
    );
    expect(outcome.passed).toBe(true);
  });

  it('still rejects a missing condition', () => {
    const outcome = validateTaskSolution(
      'SELECT * FROM customers',
      result,
      { requireWhere: true, whereContainsTerms: ["city != 'Dhaka'"] },
      undefined,
    );
    expect(outcome.passed).toBe(false);
  });
});

describe('cell serialization contract', () => {
  it('floats collapse to 12 significant digits', () => {
    expect(serializeCellValue(18.700000000000003)).toBe(serializeCellValue(18.7));
    expect(serializeCellValue(19.7)).not.toBe(serializeCellValue(18.7));
  });

  it('NULL is distinct from 0 and empty string', () => {
    expect(serializeCellValue(null)).not.toBe(serializeCellValue(0));
    expect(serializeCellValue(null)).not.toBe(serializeCellValue(''));
  });
});