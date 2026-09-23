/**
 * SQLens Engine — Multi-Statement Script + Script-Aware Validation
 * ─────────────────────────────────────────────────────────────────────────────
 * Locks in the Batch 10 fixes:
 *   1. Executor runs `BEGIN; INSERT …; COMMIT;` scripts and reports the DATA
 *      result (so transaction tasks can validate affected-row counts).
 *   2. Validator is script-aware: requireWhere / requireOrderBy see clauses
 *      inside multi-statement & CTE queries.
 *   3. Deliberate-failure labs (expectFailure) pass when the engine rejects.
 */
import { describe, it, expect } from 'vitest';
import { SqlExecutor } from '../../src/lib/sql-engine/executor';
import { validateTaskSolution } from '../../src/lib/sql-engine/validator';

function fresh() {
  return new SqlExecutor();
}

describe('multi-statement script execution', () => {
  it('executes BEGIN…INSERT…COMMIT and returns the INSERT data result', () => {
    const ex = fresh();
    const r = ex.executeQuery(
      "BEGIN;\nINSERT INTO products (name, supplier_id, category_id, price, quantity_in_stock, reorder_level) VALUES ('Script Mouse', 1, 1, 9.99, 50, 10);\nCOMMIT;"
    );
    expect(r.success).toBe(true);
    expect(r.affectedRows).toBe(1);
    // The committed row is durable
    const check = ex.executeQuery(
      "SELECT COUNT(*) AS c FROM products WHERE name = 'Script Mouse';"
    );
    expect(Number(check.rows?.[0]?.c)).toBe(1);
  });

  it('executes a multi-row INSERT script and reports affectedRows 3', () => {
    const ex = fresh();
    const r = ex.executeQuery(
      "BEGIN;\nINSERT INTO products (name, supplier_id, category_id, price, quantity_in_stock, reorder_level) VALUES ('A', 1, 1, 1.00, 1, 1), ('B', 1, 1, 2.00, 1, 1), ('C', 1, 1, 3.00, 1, 1);\nCOMMIT;"
    );
    expect(r.success).toBe(true);
    expect(r.affectedRows).toBe(3);
  });

  it('returns the SELECT result when a script ends with verify-with-SELECT', () => {
    const ex = fresh();
    const r = ex.executeQuery(
      "BEGIN;\nINSERT INTO products (name, supplier_id, category_id, price, quantity_in_stock, reorder_level) VALUES ('Verify Me', 1, 1, 4.99, 5, 2);\nCOMMIT;\nSELECT name FROM products WHERE name = 'Verify Me';"
    );
    expect(r.success).toBe(true);
    expect(r.rows).toHaveLength(1);
    expect(r.rows?.[0]?.name).toBe('Verify Me');
  });
});

describe('script-aware validation', () => {
  it('requireWhere passes for a script whose UPDATE carries WHERE', () => {
    const ex = fresh();
    const r = ex.executeQuery(
      'BEGIN;\nUPDATE products SET price = price * 1.10 WHERE product_id = 1;\nROLLBACK;'
    );
    // Rolled back → no lasting change; outcome carries the UPDATE result
    expect(r.success).toBe(true);
    const outcome = validateTaskSolution(
      'BEGIN;\nUPDATE products SET price = price * 1.10 WHERE product_id = 1;\nROLLBACK;',
      r,
      { targetTable: 'products', requireWhere: true, expectedRowCount: 1 }
    );
    expect(outcome.passed).toBe(true);
  });

  it('requireOrderBy passes for a CTE whose main query sorts', () => {
    const ex = fresh();
    const q =
      'WITH ranked AS (SELECT name, category_id, price, ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY price DESC) AS price_rank FROM products) SELECT name, category_id, price FROM ranked WHERE price_rank <= 3 ORDER BY category_id, price DESC;';
    const r = ex.executeQuery(q);
    expect(r.success).toBe(true);
    const outcome = validateTaskSolution(q, r, {
      targetTable: 'products',
      requiredColumns: ['name', 'category_id', 'price'],
      requireOrderBy: [{ column: 'category_id', direction: 'ASC' }],
      expectFailure: undefined,
    });
    expect(outcome.passed).toBe(true);
  });
});

describe('deliberate-failure labs (expectFailure)', () => {
  it('passes when the engine rejects the query (FK violation)', () => {
    const ex = fresh();
    const q =
      "INSERT INTO products (name, supplier_id, category_id, price, quantity_in_stock, reorder_level) VALUES ('Broken Item', 1, 999, 1.00, 1, 1);";
    const r = ex.executeQuery(q);
    expect(r.success).toBe(false);
    const outcome = validateTaskSolution(q, r, { expectFailure: true });
    expect(outcome.passed).toBe(true);
  });
});

// P0 regression: the old runner stored the first failure in `last` (guarded by
// `if (!last)`), so any later successful statement overwrote it and the script
// reported success — day45-t3's CHECK violation was invisible.
describe('first failing statement surfaces even after a success', () => {
  it('a mid-script error is not swallowed by later successful statements', () => {
    const ex = fresh();
    const r = ex.executeQuery(
      'SELECT product_id FROM products LIMIT 1;\nUPDATE no_such_table SET x = 1;\nSELECT 1 AS ok;'
    );
    expect(r.success).toBe(false);
    expect(String(r.error)).toMatch(/does not exist/i);
  });

  it('the day45-t3 lab shape reports the CHECK violation, not the trailing statements', () => {
    const ex = fresh();
    const r = ex.executeQuery(
      "CREATE TABLE accounts (acc_id INT PRIMARY KEY, balance DECIMAL CHECK (balance >= 0));\nINSERT INTO accounts (acc_id, balance) VALUES (1, 100);\nUPDATE accounts SET balance = -50 WHERE acc_id = 1;"
    );
    expect(r.success).toBe(false);
    expect(String(r.error)).toMatch(/CHECK constraint violated/i);
  });
});
