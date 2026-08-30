/**
 * Set Operations regression suite (Batch 6 — Day 17 content).
 * Engine contract: docs/DIALECT.md §2 ('union all/union/except').
 * Shape-compatibility validation is deliberate: a UNION of mismatched column
 * counts must fail loudly (taught concept), not silently concatenate.
 */
import { describe, it, expect } from 'vitest';
import { SqlExecutor } from '../../src/lib/sql-engine/executor';

function fresh() {
  return new SqlExecutor();
}
function rows(ex: SqlExecutor, sql: string) {
  const r = ex.executeQuery(sql);
  expect(r.success, r.error).toBe(true);
  return r;
}

describe('Set operations — stack & dedupe', () => {
  it('UNION ALL stacks both sides without deduplication (20 city rows)', () => {
    const ex = fresh();
    const r = rows(ex, 'SELECT city FROM customers UNION ALL SELECT city FROM students;');
    expect(r.rowCount).toBe(20);
    expect(r.columns).toContain('city');
  });

  it('UNION removes duplicates between the sides (8 distinct cities)', () => {
    const ex = fresh();
    const r = rows(ex, 'SELECT city FROM customers UNION SELECT city FROM students;');
    expect(r.rowCount).toBe(8);
  });

  it('UNION ALL keeps literal source tags intact', () => {
    const ex = fresh();
    const r = rows(ex, "SELECT 'customer' AS source, city FROM customers UNION ALL SELECT 'student' AS source, city FROM students;");
    expect(r.rowCount).toBe(20);
    expect(r.columns).toEqual(['source', 'city']);
    const sources = new Set(r.rows!.map((x: any) => x.source));
    expect(sources.has('customer') && sources.has('student')).toBe(true);
  });

  it('data-quality wrinkle: Chittagong vs Chattogram stay separate in UNION', () => {
    const ex = fresh();
    const r = rows(ex, 'SELECT city FROM customers UNION SELECT city FROM students;');
    const cities = r.rows!.map((x: any) => x.city);
    expect(cities).toContain('Chittagong');
    expect(cities).toContain('Chattogram');
    expect(cities).not.toContain('Dhaka;Dhaka');
  });
});

describe('Set operations — shape compatibility (taught concept)', () => {
  it('mismatched column counts FAIL loudly', () => {
    const ex = fresh();
    const r = ex.executeQuery('SELECT name, city FROM customers UNION SELECT city FROM students;');
    expect(r.success).toBe(false);
    expect(String(r.error ?? '')).toEqual(expect.stringMatching(/same number of columns/i));
  });

  it('matching 2-column shapes succeed', () => {
    const ex = fresh();
    const r = rows(ex, "SELECT 'customer' AS source, city FROM customers UNION ALL SELECT 'student' AS source, city FROM students;");
    expect(r.success).toBe(true);
  });
});

describe('Set operations — EXCEPT', () => {
  it('EXCEPT returns rows only in the left side (customer-only cities)', () => {
    const ex = fresh();
    const r = rows(ex, 'SELECT city FROM customers EXCEPT SELECT city FROM students;');
    const cities = new Set(r.rows!.map((x: any) => x.city));
    expect(cities.has('Sylhet') && cities.has('Khulna') && cities.has('Barisal') && cities.has('Chittagong')).toBe(true);
    expect(cities.has('Dhaka')).toBe(false); // shared with students
  });

  it('EXCEPT is directional — reversing the sides changes the answer', () => {
    const ex = fresh();
    const r = rows(ex, 'SELECT city FROM students EXCEPT SELECT city FROM customers;');
    const cities = new Set(r.rows!.map((x: any) => x.city));
    expect(cities.has('Gazipur') && cities.has('Chattogram')).toBe(true);
    expect(cities.has('Dhaka')).toBe(false);
  });

  it('business classic: products that have never been ordered (anti-join via EXCEPT)', () => {
    const ex = fresh();
    const r = rows(ex, 'SELECT product_id FROM products EXCEPT SELECT product_id FROM order_items;');
    // Ground truth from seed data: 28 products, 22 distinct ordered ids → 6 never-ordered.
    expect(r.rowCount).toBe(6);
    const ids = r.rows!.map((x: any) => x.product_id).sort((a: number, b: number) => a - b);
    expect(ids).toEqual([3, 9, 19, 25, 27, 28]);
    // Independent cross-check: the LEFT JOIN anti-join (Day 14 technique) must agree.
    const aj = rows(ex, 'SELECT p.product_id FROM products p LEFT JOIN order_items oi ON p.product_id = oi.product_id WHERE oi.order_item_id IS NULL;');
    expect(aj.rowCount).toBe(6);
  });
});

describe('Set operations — chained (left-associative folding)', () => {
  it('a UNION chain keeps every distinct value (no silent row drops)', () => {
    const ex = fresh();
    const r = rows(ex, 'SELECT 1 AS m UNION SELECT 2 UNION SELECT 3 UNION SELECT 9 UNION SELECT 10 UNION SELECT 11 UNION SELECT 12;');
    expect(r.rowCount).toBe(7);
    const months = r.rows!.map((x: any) => x.m).sort((a: number, b: number) => a - b);
    expect(months).toEqual([1, 2, 3, 9, 10, 11, 12]);
  });

  it('UNION ALL chain stacks every side', () => {
    const ex = fresh();
    const r = rows(ex, "SELECT 'customer' AS source, city FROM customers UNION ALL SELECT 'student' AS source, city FROM students UNION ALL SELECT 'supplier' AS source, city FROM suppliers;");
    expect(r.rowCount).toBe(26);
    expect(r.columns).toEqual(['source', 'city']);
    const sources = new Set(r.rows!.map((x: any) => x.source));
    expect([...sources].sort()).toEqual(['customer', 'student', 'supplier']);
    // Every row must carry the LEFT side's column names (positional normalization) —
    // a nested set-op result used to leak its own inner column names into rows,
    // producing mixed-key objects that rendered as blank cells in the UI grid.
    for (const row of r.rows!) {
      expect(Object.keys(row).sort()).toEqual(['city', 'source']);
    }
  });

  it('EXCEPT applies to the WHOLE preceding chain (regression: first-op splitting)', () => {
    const ex = fresh();
    // Months 2–8 have orders (ground truth: 7 distinct order months).
    const r = rows(ex, 'SELECT 1 AS month UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10 UNION ALL SELECT 11 UNION ALL SELECT 12 EXCEPT SELECT EXTRACT(MONTH FROM order_date) AS month FROM orders;');
    expect(r.rowCount).toBe(5);
    const months = r.rows!.map((x: any) => x.month).sort((a: number, b: number) => a - b);
    expect(months).toEqual([1, 9, 10, 11, 12]);
  });

  it('mixed operators: UNION then EXCEPT folds left-to-right', () => {
    const ex = fresh();
    // (students ∪ suppliers) − customers = cities we serve/staff but no customers
    const r = rows(ex, 'SELECT city FROM students UNION SELECT city FROM suppliers EXCEPT SELECT city FROM customers;');
    const cities = new Set(r.rows!.map((x: any) => x.city));
    expect(cities.has('Dhaka')).toBe(false); // customers in Dhaka → removed
    expect(cities.has('Gazipur') || cities.has('Chattogram')).toBe(true);
  });
});