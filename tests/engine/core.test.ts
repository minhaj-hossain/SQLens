/**
 * SQLens Engine — Core Regression Suite (Vitest)
 * ─────────────────────────────────────────────────────────────────────────────
 * Locks in the behaviors the curriculum depends on. New engine features land
 * here FIRST (spec → tests → implementation), then content may use them.
 * Run: npm test
 */
import { describe, it, expect } from 'vitest';
import { SqlExecutor } from '../../src/lib/sql-engine/executor';
import { SIMULATED_TODAY } from '../../src/config/simulated-date';

function fresh() {
  return new SqlExecutor();
}

describe('deterministic date anchor (Batch 0)', () => {
  it('anchors CURDATE() to SIMULATED_TODAY (2026-08-24), not the wall clock', () => {
    const ex = fresh();
    const r = ex.executeQuery(
      'SELECT COUNT(*) AS c FROM orders WHERE order_date <= CURDATE();'
    );
    expect(r.success).toBe(true);
    // All 2026 seed orders must be on/before the anchor
    expect(Number(r.rows?.[0]?.c)).toBeGreaterThan(0);
  });

  it('matches Day 15/19 temporal tasks: CURDATE() - INTERVAL 60 DAY == 2026-06-25', () => {
    const ex = fresh();
    const viaCurdate = ex.executeQuery(
      'SELECT COUNT(*) AS c FROM orders WHERE order_date >= CURDATE() - INTERVAL 60 DAY;'
    );
    const viaLiteral = ex.executeQuery(
      "SELECT COUNT(*) AS c FROM orders WHERE order_date >= '2026-06-25';"
    );
    expect(viaCurdate.success).toBe(true);
    expect(viaLiteral.success).toBe(true);
    expect(Number(viaCurdate.rows?.[0]?.c)).toBe(Number(viaLiteral.rows?.[0]?.c));
    expect(Number(viaCurdate.rows?.[0]?.c)).toBeGreaterThan(0);
  });

  it('exports the documented anchor value', () => {
    expect(SIMULATED_TODAY).toBe('2026-08-24');
  });
});

describe('COALESCE over aggregates (Batch 0 — null-safe reporting)', () => {
  it('COALESCE(SUM(col), 0) is present on every row with clean 0s for never-ordered products', () => {
    const ex = fresh();
    const r = ex.executeQuery(
      `SELECT p.product_id, p.name, COALESCE(SUM(oi.quantity), 0) AS total_units_sold
       FROM products p
       LEFT JOIN order_items oi ON p.product_id = oi.product_id
       GROUP BY p.product_id, p.name
       ORDER BY p.product_id;`
    );
    expect(r.success).toBe(true);
    expect(r.rows!.length).toBeGreaterThan(0);
    for (const row of r.rows!) {
      expect(row).toHaveProperty('total_units_sold');
      expect(row.total_units_sold).not.toBeNull();
      expect(row.total_units_sold).not.toBeUndefined();
    }
    const zeroRows = r.rows!.filter((row: any) => row.total_units_sold === 0);
    expect(zeroRows.length).toBeGreaterThan(0);
  });
});

describe('core retrieval smoke (curriculum spine)', () => {
  it('Day 1: projection + aliasing', () => {
    const ex = fresh();
    const r = ex.executeQuery('SELECT name AS student_name FROM students;');
    expect(r.success).toBe(true);
    expect(r.columns).toContain('student_name');
  });

  it('Day 2/3: WHERE with BETWEEN and IS NULL', () => {
    const ex = fresh();
    const between = ex.executeQuery(
      'SELECT product_id FROM products WHERE price BETWEEN 25.00 AND 100.00;'
    );
    expect(between.success).toBe(true);
    const nulls = ex.executeQuery(
      'SELECT customer_id FROM customers WHERE email IS NULL;'
    );
    expect(nulls.success).toBe(true);
    expect(nulls.rows!.length).toBe(2); // seed has exactly 2 customers without email
  });

  it('Day 4: ORDER BY + LIMIT pagination', () => {
    const ex = fresh();
    const r = ex.executeQuery(
      'SELECT product_id FROM products ORDER BY price DESC LIMIT 5 OFFSET 2;'
    );
    expect(r.success).toBe(true);
    expect(r.rows!.length).toBe(5);
  });

  it('Day 9: GROUP BY + HAVING (the fixed teaching example)', () => {
    const ex = fresh();
    const r = ex.executeQuery(
      `SELECT category_id, COUNT(*) AS total_products, AVG(price) AS avg_price
       FROM products GROUP BY category_id HAVING AVG(price) > 30 ORDER BY avg_price DESC;`
    );
    expect(r.success).toBe(true);
    expect(r.columns).toEqual(
      expect.arrayContaining(['category_id', 'total_products', 'avg_price'])
    );
  });

  it('Day 11/14: LEFT JOIN anti-join finds never-ordered products', () => {
    const ex = fresh();
    const r = ex.executeQuery(
      `SELECT p.product_id FROM products p
       LEFT JOIN order_items oi ON p.product_id = oi.product_id
       WHERE oi.order_item_id IS NULL;`
    );
    expect(r.success).toBe(true);
    expect(r.rows!.length).toBeGreaterThan(0);
  });

  it('Day 17: scalar subquery + CTE', () => {
    const ex = fresh();
    const scalar = ex.executeQuery(
      'SELECT name FROM products WHERE price > (SELECT AVG(price) FROM products);'
    );
    expect(scalar.success).toBe(true);
    const cte = ex.executeQuery(
      'WITH expensive AS (SELECT * FROM products WHERE price > 100) SELECT COUNT(*) AS c FROM expensive;'
    );
    expect(cte.success).toBe(true);
  });

  it('Day 23: COALESCE solution from the live curriculum task validates with the real column', () => {
    const ex = fresh();
    const r = ex.executeQuery(
      'SELECT p.product_id, p.name, COALESCE(SUM(oi.quantity), 0) AS total_units_sold FROM products p LEFT JOIN order_items oi ON p.product_id = oi.product_id GROUP BY p.product_id, p.name ORDER BY p.product_id;'
    );
    expect(r.success).toBe(true);
    expect(r.rows![0]).toHaveProperty('total_units_sold');
  });
});

describe('DML regression: string-literal SET (Day 30 anomaly task)', () => {
  it('UPDATE SET with a quoted string stores the string, not a boolean', () => {
    const ex = fresh();
    const upd = ex.executeQuery(
      "UPDATE fat_orders SET product_name = 'Gaming Mouse Pro' WHERE order_id = 1;"
    );
    expect(upd.success).toBe(true);
    expect(upd.affectedRows).toBe(1);

    const check = ex.executeQuery(
      'SELECT product_name FROM fat_orders WHERE order_id = 1;'
    );
    expect(check.success).toBe(true);
    expect(check.rows?.[0]?.product_name).toBe('Gaming Mouse Pro');
  });

  it('UPDATE SET with a string containing an operator-like char stays literal', () => {
    const ex = fresh();
    const upd = ex.executeQuery(
      "UPDATE products SET name = 'USB-C Cable (2m)' WHERE product_id = 3;"
    );
    expect(upd.success).toBe(true);
    const check = ex.executeQuery(
      'SELECT name FROM products WHERE product_id = 3;'
    );
    expect(check.rows?.[0]?.name).toBe('USB-C Cable (2m)');
  });

  it('UPDATE SET numeric and arithmetic SET behavior is unchanged', () => {
    const ex = fresh();
    ex.executeQuery('UPDATE fat_orders SET quantity = 9 WHERE order_id = 3;');
    expect(
      ex.executeQuery('SELECT quantity FROM fat_orders WHERE order_id = 3;').rows?.[0]?.quantity
    ).toBe(9);

    ex.executeQuery(
      'UPDATE products SET price = price * 1.10 WHERE product_id = 1;'
    );
    const price = ex.executeQuery(
      'SELECT price FROM products WHERE product_id = 1;'
    ).rows?.[0]?.price as number;
    expect(price).toBeCloseTo(15.99 * 1.1, 2);
  });
});
