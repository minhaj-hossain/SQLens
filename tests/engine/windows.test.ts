/**
 * Window Functions regression suite (Batch 7 — Day 23/24 content).
 * Ranking tie-semantics, running aggregates, and LAG/LEAD are the Batch 7
 * engine additions; the existing ROW_NUMBER() path stays intact.
 * NOTE: the window post-pass does NOT reorder the projected result, so all
 * assertions are value-based, never index-based.
 */
import { describe, it, expect } from 'vitest';
import { SqlExecutor } from '../../src/lib/sql-engine/executor';

function fresh() {
  return new SqlExecutor();
}
function rows(ex: SqlExecutor, sql: string) {
  const r = ex.executeQuery(sql);
  expect(r.success, r.error ?? '').toBe(true);
  return r;
}

describe('ROW_NUMBER — global ranking (Day 23 · C1)', () => {
  it('appends a 1..N rank without collapsing rows', () => {
    const ex = fresh();
    const all = rows(ex, 'SELECT product_id FROM products;');
    const r = rows(ex, 'SELECT product_id, price, ROW_NUMBER() OVER (ORDER BY price DESC) AS price_rank FROM products;');
    expect(r.rowCount).toBe(all.rowCount); // rows preserved (unlike GROUP BY)
    // The most expensive product (Office Chair, 120.00) is rank 1.
    const chair = r.rows!.find((x: any) => x.price === 120);
    expect(chair.price_rank).toBe(1);
    const ranks = r.rows!.map((x: any) => x.price_rank);
    expect(new Set(ranks).size).toBe(r.rowCount); // unique, no ties in ROW_NUMBER
  });
});

describe('PARTITION BY — rank within groups (Day 23 · C2)', () => {
  it('restarts ranking per category', () => {
    const ex = fresh();
    const r = rows(ex, 'SELECT product_id, category_id, ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY price DESC) AS cat_rank FROM products;');
    const top = r.rows!.filter((x: any) => x.cat_rank === 1);
    // one rank-1 per non-empty grouping: categories 1,2,3,4,5 + the NULL-category group
    expect(top.length).toBe(6);
  });
});

describe('RANK vs DENSE_RANK — ties (Day 23 · C3/C4)', () => {
  it('RANK leaves gaps after ties (55.00 ties at rank 4, next distinct is 6)', () => {
    const ex = fresh();
    const r = rows(ex, 'SELECT name, price, RANK() OVER (ORDER BY price DESC) AS price_rank FROM products;');
    const tie = r.rows!.filter((x: any) => x.price === 55);
    expect(tie.length).toBe(2);
    expect(tie.every((x: any) => x.price_rank === 4)).toBe(true);
    // next distinct price (45.50) starts at 6 (gap)
    expect(r.rows!.find((x: any) => x.price === 45.5)!.price_rank).toBe(6);
  });

  it('DENSE_RANK leaves no gaps (55.00 ties at 4, next is 5)', () => {
    const ex = fresh();
    const r = rows(ex, 'SELECT name, price, DENSE_RANK() OVER (ORDER BY price DESC) AS price_rank FROM products;');
    const tie = r.rows!.filter((x: any) => x.price === 55);
    expect(tie.every((x: any) => x.price_rank === 4)).toBe(true);
    expect(r.rows!.find((x: any) => x.price === 45.5)!.price_rank).toBe(5);
  });
});

describe('Running totals — SUM() OVER (ORDER BY) (Day 24 · C1)', () => {
  it('cumulative revenue is monotonic and ends at the grand total', () => {
    const ex = fresh();
    const grand = Number(rows(ex, 'SELECT SUM(quantity * unit_price) AS total FROM order_items;').rows![0].total);
    const r = rows(ex, `WITH monthly AS (
        SELECT MONTH(o.order_date) AS mon, SUM(oi.quantity * oi.unit_price) AS revenue
        FROM orders o JOIN order_items oi ON o.order_id = oi.order_id
        GROUP BY MONTH(o.order_date)
      )
      SELECT mon, revenue, SUM(revenue) OVER (ORDER BY mon) AS running_revenue
      FROM monthly ORDER BY mon;`);
    expect(r.rowCount).toBe(7); // Feb–Aug
    const running = r.rows!.map((x: any) => Number(x.running_revenue));
    for (let i = 1; i < running.length; i++) {
      expect(running[i]).toBeGreaterThanOrEqual(running[i - 1]);
    }
    expect(running[running.length - 1]).toBeCloseTo(grand, 2);
  });
});

describe('LAG / LEAD — row-to-row comparison (Day 24 · C2)', () => {
  it("LAG returns the previous row's value; first row is NULL", () => {
    const ex = fresh();
    const r = rows(ex, `WITH monthly AS (
        SELECT MONTH(o.order_date) AS mon, SUM(oi.quantity * oi.unit_price) AS revenue
        FROM orders o JOIN order_items oi ON o.order_id = oi.order_id
        GROUP BY MONTH(o.order_date)
      ), with_prev AS (
        SELECT mon, revenue, LAG(revenue) OVER (ORDER BY mon) AS prev_revenue
        FROM monthly
      )
      SELECT mon, revenue, revenue - prev_revenue AS growth
      FROM with_prev ORDER BY mon;`);
    expect(r.rows![0].growth).toBeNull(); // first month has no previous
    expect(r.rows!.slice(1).every((x: any) => x.growth !== null)).toBe(true);
  });

  it('LAG with an offset reaches further back in the window order', () => {
    const ex = fresh();
    const r = rows(ex, 'SELECT product_id, price, LAG(price, 2) OVER (ORDER BY price DESC) AS prev2 FROM products;');
    // sorted DESC: 120, 89.99, 65, 55, 55, 45.50, ... → 65's prev2 = 120; 45.50's prev2 = 55
    expect(r.rows!.find((x: any) => x.price === 65)!.prev2).toBe(120);
    expect(r.rows!.find((x: any) => x.price === 45.5)!.prev2).toBe(55);
  });

  it('LEAD reads the next row (highest price has no next)', () => {
    const ex = fresh();
    const r = rows(ex, 'SELECT product_id, price, LEAD(price) OVER (ORDER BY price ASC) AS next_price FROM products;');
    expect(r.rows!.find((x: any) => x.price === 120)!.next_price).toBeNull();
    expect(r.rows!.find((x: any) => x.price === 15.99)!.next_price).toBe(16.5);
  });
});

describe('PARTITION BY + LAG (Day 24 challenge pattern)', () => {
  it('per-customer gaps between consecutive orders (days)', () => {
    const ex = fresh();
    const r = rows(ex, `WITH ordered AS (
        SELECT customer_id, order_date,
               LAG(order_date) OVER (PARTITION BY customer_id ORDER BY order_date) AS prev_date
        FROM orders
      )
      SELECT o.customer_id, DATEDIFF(o.order_date, o.prev_date) AS days_between
      FROM ordered o WHERE o.prev_date IS NOT NULL ORDER BY o.customer_id;`);
    // Rafiul (customer 1) orders 2026-06-10 → 2026-08-02 → 2026-08-23: gaps 53, 21.
    const rafiul = r.rows!.filter((x: any) => x.customer_id === 1).map((x: any) => x.days_between);
    expect(rafiul).toEqual([53, 21]);
    expect(r.rowCount).toBeGreaterThan(5);
  });
});