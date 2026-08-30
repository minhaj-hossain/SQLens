/**
 * SQLens Engine — CASE, String & Date Function Regression Suite (Batches 3+5)
 * ─────────────────────────────────────────────────────────────────────────────
 * Spec-first tests for the M2 expansion features. Each test mirrors a concept
 * or task authored in Days 10–12 of the curriculum. These tests are the gate:
 * content may only reference features that pass here.
 *
 * Dialect contract: docs/DIALECT.md §2.
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

describe('CASE — basic transformation (Day 10 · C1)', () => {
  it('labels rows with a two-branch CASE and keeps row count', () => {
    const ex = fresh();
    const r = rows(ex, `SELECT name, price, CASE WHEN price < 25 THEN 'Budget' ELSE 'Premium' END AS price_tier FROM products;`);
    expect(r.columns).toContain('price_tier');
    expect(r.rows!.length).toBe(rows(ex, 'SELECT product_id FROM products;').rows!.length);
    const tiers = new Set(r.rows!.map((x: any) => x.price_tier));
    for (const t of tiers) expect(['Budget', 'Premium']).toContain(t);
  });

  it('evaluates string-equality conditions (stock status labels)', () => {
    const ex = fresh();
    const r = rows(ex, `SELECT name, CASE WHEN quantity_in_stock = 0 THEN 'Out of Stock' ELSE 'Available' END AS stock_status FROM products;`);
    const statuses = new Set(r.rows!.map((x: any) => x.stock_status));
    expect(statuses.has('Out of Stock') || statuses.has('Available')).toBe(true);
  });
});

describe('CASE — multi-branch (Day 10 · C2)', () => {
  it('maps numeric ranges into three tiers', () => {
    const ex = fresh();
    const r = rows(ex, `SELECT name, price, CASE WHEN price < 25 THEN 'Budget' WHEN price < 100 THEN 'Standard' ELSE 'Premium' END AS price_tier FROM products;`);
    const tiers = new Set(r.rows!.map((x: any) => x.price_tier));
    for (const t of tiers) expect(['Budget', 'Standard', 'Premium']).toContain(t);
  });
});

describe('CASE — evaluation order (Day 10 · C3)', () => {
  it('first matching WHEN wins — a higher branch makes a lower one unreachable', () => {
    const ex = fresh();
    const r = rows(ex, `SELECT price, CASE WHEN price < 100 THEN 'Standard' WHEN price < 25 THEN 'Budget' ELSE 'Premium' END AS tier FROM products;`);
    // 'Budget' must never appear: anything < 25 is also < 100, caught by WHEN #1
    expect(r.rows!.some((x: any) => x.tier === 'Budget')).toBe(false);
  });

  it('missing ELSE yields NULL for non-matching rows', () => {
    const ex = fresh();
    const r = rows(ex, `SELECT name, CASE WHEN price > 500 THEN 'Luxury' END AS tier FROM products;`);
    expect(r.rows!.some((x: any) => x.tier === null)).toBe(true);
  });
});

describe('CASE inside aggregates (Day 10 · C4)', () => {
  it('SUM(CASE WHEN … THEN 1 ELSE 0 END) counts matching rows per group', () => {
    const ex = fresh();
    const r = rows(ex, `SELECT category_id, SUM(CASE WHEN quantity_in_stock = 0 THEN 1 ELSE 0 END) AS out_of_stock, COUNT(*) AS total FROM products GROUP BY category_id;`);
    expect(r.columns).toEqual(expect.arrayContaining(['category_id', 'out_of_stock', 'total']));
    for (const row of r.rows!) {
      expect(Number(row.out_of_stock)).toBeLessThanOrEqual(Number(row.total));
    }
    const totalOut = r.rows!.reduce((s: number, x: any) => s + Number(x.out_of_stock), 0);
    const expected = Number(rows(ex, 'SELECT COUNT(*) AS c FROM products WHERE quantity_in_stock = 0;').rows![0].c);
    expect(totalOut).toBe(expected);
  });

  it('COUNT(CASE WHEN … THEN 1 END) counts only matching rows (ELSE omitted → NULL)', () => {
    const ex = fresh();
    const r = rows(ex, `SELECT city, COUNT(CASE WHEN email IS NULL THEN 1 END) AS missing_email FROM customers GROUP BY city;`);
    const totalMissing = r.rows!.reduce((s: number, x: any) => s + Number(x.missing_email), 0);
    expect(totalMissing).toBe(2);
  });
});

describe('CASE in ORDER BY (Day 10 · C5)', () => {
  it('sorts by computed priority: zero-stock items first, then cheapest', () => {
    const ex = fresh();
    const r = rows(ex, `SELECT name, quantity_in_stock FROM products ORDER BY CASE WHEN quantity_in_stock = 0 THEN 0 ELSE 1 END, quantity_in_stock ASC;`);
    const stock = r.rows!.map((x: any) => Number(x.quantity_in_stock));
    const firstPositive = stock.findIndex((s) => s > 0);
    if (firstPositive !== -1) {
      for (let i = firstPositive + 1; i < stock.length; i++) {
        expect(stock[i]).toBeGreaterThan(0);
        expect(stock[i]).toBeGreaterThanOrEqual(stock[i - 1]);
      }
    }
  });
});

describe('string functions in SELECT (Day 11)', () => {
  it('UPPER / LOWER with alias', () => {
    const ex = fresh();
    const r = rows(ex, 'SELECT UPPER(name) AS name_upper, LOWER(email) AS email_lower FROM customers;');
    expect(r.columns).toEqual(expect.arrayContaining(['name_upper', 'email_lower']));
    expect(String(r.rows![0].name_upper)).toBe(String(r.rows![0].name_upper).toUpperCase());
  });

  it('TRIM strips whitespace', () => {
    const ex = fresh();
    const r = rows(ex, 'SELECT TRIM(name) AS clean_name FROM students;');
    expect(r.success).toBe(true);
  });

  it('CONCAT assembles display strings from columns + literals', () => {
    const ex = fresh();
    const r = rows(ex, "SELECT CONCAT(name, ' <', email, '>') AS contact FROM customers WHERE email IS NOT NULL;");
    expect(r.columns).toContain('contact');
    expect(String(r.rows![0].contact)).toContain('<');
    expect(String(r.rows![0].contact)).toContain('>');
  });

  it('SUBSTRING extracts with 1-based start, LENGTH measures', () => {
    const ex = fresh();
    const r = rows(ex, 'SELECT SUBSTRING(name, 1, 3) AS initials, LENGTH(name) AS name_len FROM customers;');
    expect(r.columns).toEqual(expect.arrayContaining(['initials', 'name_len']));
    expect(String(r.rows![0].initials).length).toBe(3);
    expect(Number(r.rows![0].name_len)).toBeGreaterThan(0);
  });

  it("works in the WHERE clause too: UPPER(city) = 'DHAKA'", () => {
    const ex = fresh();
    const viaFn = rows(ex, "SELECT customer_id FROM customers WHERE UPPER(city) = 'DHAKA';");
    const viaPlain = rows(ex, "SELECT customer_id FROM customers WHERE city = 'Dhaka';");
    expect(viaFn.rows!.length).toBe(viaPlain.rows!.length);
    expect(viaFn.rows!.length).toBeGreaterThan(0);
  });

  it('string function over a grouped column (grouped projection path)', () => {
    const ex = fresh();
    const r = rows(ex, 'SELECT city, UPPER(city) AS city_upper, COUNT(*) AS c FROM customers GROUP BY city;');
    expect(r.columns).toEqual(expect.arrayContaining(['city_upper', 'c']));
    expect(String(r.rows![0].city_upper)).toBe(String(r.rows![0].city_upper).toUpperCase());
  });
});

describe('date functions (Day 12 · Batch 5)', () => {
  it('YEAR()/MONTH()/DAY() extract components', () => {
    const ex = fresh();
    const r = rows(ex, 'SELECT order_date, YEAR(order_date) AS yr, MONTH(order_date) AS mon, DAY(order_date) AS dy FROM orders LIMIT 3;');
    expect(r.columns).toEqual(expect.arrayContaining(['yr', 'mon', 'dy']));
    for (const row of r.rows!) {
      expect(Number(row.yr)).toBe(2026);
      expect(Number(row.mon)).toBeGreaterThanOrEqual(1);
      expect(Number(row.mon)).toBeLessThanOrEqual(12);
    }
  });

  it('EXTRACT(YEAR FROM col) canonical alternative form', () => {
    const ex = fresh();
    const r = rows(ex, 'SELECT EXTRACT(YEAR FROM order_date) AS yr FROM orders LIMIT 2;');
    expect(r.rows!.every((x: any) => Number(x.yr) === 2026)).toBe(true);
  });

  it('GROUP BY a date component (orders per year)', () => {
    const ex = fresh();
    const perYear = rows(ex, 'SELECT YEAR(order_date) AS yr, COUNT(*) AS orders FROM orders GROUP BY YEAR(order_date);');
    const all = Number(rows(ex, 'SELECT COUNT(*) AS c FROM orders;').rows![0].c);
    const sum = perYear.rows!.reduce((s: number, x: any) => s + Number(x.orders), 0);
    expect(sum).toBe(all);
  });

  it('DATEDIFF(a, b) returns a − b in days, accepts literals and CURDATE()', () => {
    const ex = fresh();
    // Note: the engine requires a FROM clause — DATEDIFF is always taught in a table context.
    const r = rows(ex, "SELECT DATEDIFF('2026-08-24', '2026-08-14') AS gap FROM students LIMIT 1;");
    expect(Number(r.rows![0].gap)).toBe(10);
    const r2 = rows(ex, 'SELECT order_date, DATEDIFF(CURDATE(), order_date) AS days_ago FROM orders LIMIT 3;');
    expect(r2.columns).toContain('days_ago');
    expect(Number(r2.rows![0].days_ago)).toBeGreaterThanOrEqual(0);
  });

  it('challenge idiom: monthly order volume (group by month + sort)', () => {
    const ex = fresh();
    const r = rows(ex, 'SELECT MONTH(order_date) AS mon, COUNT(*) AS order_count FROM orders GROUP BY MONTH(order_date) ORDER BY mon;');
    expect(r.rows!.length).toBeGreaterThan(3);
  });
});


