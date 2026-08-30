/**
 * Transactions regression suite (Batch 9 — Day 26 `dml-transactions`).
 * Verifies BEGIN/COMMIT/ROLLBACK semantics, multi-row INSERT, atomic failure,
 * and the expectFailure validator rule.
 */
import { describe, it, expect } from 'vitest';
import { SqlExecutor } from '../../src/lib/sql-engine/executor';
import { validateTaskSolution } from '../../src/lib/sql-engine/validator';

function fresh() {
  return new SqlExecutor();
}
function run(ex: SqlExecutor, sql: string) {
  const r = ex.executeQuery(sql);
  expect(r.success, r.error ?? sql).toBe(true);
  return r;
}
const PKG_COLS =
  'name, supplier_id, category_id, price, quantity_in_stock, reorder_level';
function insert(name: string, supplier: number, category: number, price: number) {
  return `INSERT INTO products (${PKG_COLS}) VALUES ('${name}', ${supplier}, ${category}, ${price}, 10, 5);`;
}

describe('BEGIN / COMMIT — provisional until committed', () => {
  it('COMMIT makes changes durable', () => {
    const ex = fresh();
    run(ex, 'BEGIN;');
    run(ex, insert('Transactional Widget', 1, 1, 9.99));
    run(ex, 'COMMIT;');
    const r = run(ex, "SELECT name FROM products WHERE name = 'Transactional Widget';");
    expect(r.rowCount).toBe(1);
  });

  it('transactionStatus reflects in_transaction → committed', () => {
    const ex = fresh();
    const begin = run(ex, 'BEGIN;');
    expect(begin.transactionStatus).toBe('in_transaction');
    const commit = run(ex, 'COMMIT;');
    expect(commit.transactionStatus).toBe('committed');
  });
});

describe('ROLLBACK — the undo', () => {
  it('ROLLBACK reverts uncommitted changes', () => {
    const ex = fresh();
    run(ex, 'BEGIN;');
    run(ex, insert('Vapor Item', 1, 1, 1.0));
    const roll = run(ex, 'ROLLBACK;');
    expect(roll.transactionStatus).toBe('rolled_back');
    const r = ex.executeQuery("SELECT name FROM products WHERE name = 'Vapor Item';");
    expect(r.rows!.length).toBe(0);
  });

  it('an UPDATE inside a transaction is undone by ROLLBACK', () => {
    const ex = fresh();
    const before = ex.executeQuery('SELECT price FROM products WHERE product_id = 1;').rows![0].price;
    run(ex, 'BEGIN;');
    run(ex, 'UPDATE products SET price = price * 1.10 WHERE product_id = 1;');
    const after = ex.executeQuery('SELECT price FROM products WHERE product_id = 1;').rows![0].price;
    expect(Number(after)).not.toBe(Number(before));
    run(ex, 'ROLLBACK;');
    const restored = ex.executeQuery('SELECT price FROM products WHERE product_id = 1;').rows![0].price;
    expect(Number(restored)).toBe(Number(before));
  });
});

describe('Multi-row INSERT', () => {
  it('inserts every tuple in one statement', () => {
    const ex = fresh();
    const before = Number(ex.executeQuery('SELECT COUNT(*) AS c FROM products;').rows![0].c);
    const r = run(
      ex,
      `INSERT INTO products (${PKG_COLS}) VALUES ('Row A', 1, 1, 1, 1, 1), ('Row B', 1, 1, 2, 2, 2), ('Row C', 1, 1, 3, 3, 3);`
    );
    expect(r.affectedRows).toBe(3);
    const after = Number(ex.executeQuery('SELECT COUNT(*) AS c FROM products;').rows![0].c);
    expect(after).toBe(before + 3);
  });

  it('rejects a multi-row INSERT when any tuple breaks a foreign key', () => {
    const ex = fresh();
    const failed = ex.executeQuery(
      `INSERT INTO products (${PKG_COLS}) VALUES ('Ok Row', 1, 1, 1, 1, 1), ('Bad Row', 1, 999, 1, 1, 1);`
    );
    expect(failed.success).toBe(false);
    const c = Number(ex.executeQuery("SELECT COUNT(*) AS c FROM products WHERE name LIKE 'Ok Row' OR name LIKE 'Bad Row';").rows![0].c);
    expect(c).toBe(0); // entire statement rolled back — no partial insert
  });
});

describe('Atomic failure — all or nothing', () => {
  it('a failed statement inside a transaction rolls back cleanly', () => {
    const ex = fresh();
    run(ex, 'BEGIN;');
    run(ex, insert('Kept Item', 1, 1, 5.0));
    const failed = ex.executeQuery(insert('Wont Exist', 1, 999, 5.0)); // bad category FK
    expect(failed.success).toBe(false);
    run(ex, 'ROLLBACK;');
    const r = ex.executeQuery("SELECT COUNT(*) AS c FROM products WHERE name IN ('Kept Item','Wont Exist');");
    expect(Number(r.rows![0].c)).toBe(0);
  });
});

describe('expectFailure validator rule', () => {
  it('passes when the query errors as required', () => {
    const ex = fresh();
    const result = ex.executeQuery(insert('X', 1, 999, 1)); // FK violation
    expect(result.success).toBe(false);
    const outcome = validateTaskSolution(
      insert('X', 1, 999, 1),
      result,
      { targetTable: 'products', expectFailure: true }
    );
    expect(outcome.passed).toBe(true);
  });

  it('fails a query that unexpectedly succeeds', () => {
    const ex = fresh();
    const result = ex.executeQuery(insert('Y', 1, 1, 1));
    expect(result.success).toBe(true);
    const outcome = validateTaskSolution(
      insert('Y', 1, 1, 1),
      result,
      { targetTable: 'products', expectFailure: true }
    );
    expect(outcome.passed).toBe(false);
  });
});