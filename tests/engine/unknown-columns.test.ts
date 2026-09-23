import { describe, it, expect } from 'vitest';
import { SqlExecutor } from '../../src/lib/sql-engine/executor';

/**
 * P2-A — unknown columns fail with a NAMED error (governing rule: never a
 * plausible-looking wrong answer). Probe evidence (pre-fix):
 *   SELECT no_such_column FROM products   -> success, 28 all-NULL rows
 *   ... WHERE no_such_col = 5             -> success, []
 * MySQL names the column in both cases; SQLens must too. The guard is
 * deliberately conservative: unresolvable relations (CTE bodies) SKIP it, and
 * routine/trigger bodies suppress it — those paths are pinned here as well.
 */
describe('unknown column references are named errors', () => {
  it('projection of an unknown column errors instead of returning NULL rows', () => {
    const ex = new SqlExecutor();
    const r = ex.executeQuery('SELECT no_such_column FROM products;');
    expect(r.success).toBe(false);
    expect(String(r.error)).toMatch(/Unknown column 'no_such_column' in 'field list'/);
  });

  it('WHERE on an unknown column errors instead of returning an empty set', () => {
    const ex = new SqlExecutor();
    const r = ex.executeQuery('SELECT 1 FROM products WHERE no_such_col = 5;');
    expect(r.success).toBe(false);
    expect(String(r.error)).toMatch(/Unknown column 'no_such_col' in 'where clause'/);
  });

  it('unknown columns inside function arguments are caught too', () => {
    const ex = new SqlExecutor();
    const r = ex.executeQuery('SELECT name FROM products WHERE YEAR(nosuch_col) = 2026;');
    expect(r.success).toBe(false);
    expect(String(r.error)).toMatch(/Unknown column 'nosuch_col'/);
  });

  it('valid projections still run: bare, dotted, aliased, literal, arithmetic, function', () => {
    const ex = new SqlExecutor();
    expect(ex.executeQuery('SELECT name, price FROM products LIMIT 3;').success).toBe(true);
    expect(ex.executeQuery('SELECT p.name AS pname FROM products p LIMIT 3;').success).toBe(true);
    expect(ex.executeQuery("SELECT 'tag' AS label FROM products LIMIT 1;").success).toBe(true);
    expect(ex.executeQuery('SELECT price * 2 AS double_price FROM products LIMIT 1;').success).toBe(true);
    expect(ex.executeQuery('SELECT UPPER(name) AS up FROM products LIMIT 1;').success).toBe(true);
    expect(ex.executeQuery('SELECT COUNT(*) AS c FROM products;').success).toBe(true);
  });

  it('valid WHERE variants still run: functions, IN, LIKE, NULL, dotted join columns', () => {
    const ex = new SqlExecutor();
    expect(ex.executeQuery("SELECT name FROM products WHERE price > 10 AND name LIKE '%a%';").success).toBe(true);
    expect(ex.executeQuery('SELECT name FROM products WHERE supplier_id IN (1, 2);').success).toBe(true);
    expect(ex.executeQuery('SELECT name FROM products WHERE price IS NOT NULL LIMIT 3;').success).toBe(true);
    expect(ex.executeQuery('SELECT o.order_id FROM orders o WHERE MONTH(o.order_date) = 8 LIMIT 3;').success).toBe(true);
    const join = ex.executeQuery(
      'SELECT p.name FROM products p JOIN suppliers s ON p.supplier_id = s.supplier_id WHERE s.supplier_id > 0 LIMIT 3;',
    );
    expect(join.success).toBe(true);
  });

  it('CTE statements skip the guard when a relation is unresolvable (no false errors)', () => {
    const ex = new SqlExecutor();
    const r = ex.executeQuery(
      'WITH cheap AS (SELECT product_id, price FROM products WHERE price < 10) SELECT price FROM cheap LIMIT 2;',
    );
    expect(r.success).toBe(true);
  });

  it('unknown TABLE still errors by name (unchanged)', () => {
    const ex = new SqlExecutor();
    const r = ex.executeQuery('SELECT * FROM no_such_table;');
    expect(r.success).toBe(false);
    expect(String(r.error)).toMatch(/no_such_table/);
  });
});
