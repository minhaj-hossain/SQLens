import { describe, it, expect } from 'vitest';
import { SqlExecutor } from '../../src/lib/sql-engine/executor';

function planRow(ex: SqlExecutor, sql: string) {
  const r = ex.executeQuery(sql);
  if (!r.success) throw new Error(r.error || 'EXPLAIN failed');
  return r.rows[0] as any;
}

describe('EXPLAIN simulation (docs/DIALECT.md §6)', () => {
  it('no WHERE clause → full table scan (ALL)', () => {
    const ex = new SqlExecutor();
    const row = planRow(ex, 'EXPLAIN SELECT * FROM products;');
    expect(row.type).toBe('ALL');
    expect(row.key).toBeNull();
    expect(row.table).toBe('products');
  });

  it('equality on non-indexed column → ALL (no index on price yet)', () => {
    const ex = new SqlExecutor();
    const row = planRow(ex, 'EXPLAIN SELECT * FROM products WHERE price > 50;');
    expect(row.type).toBe('ALL');
    expect(row.key).toBeNull();
    expect(row.rows).toBeGreaterThan(10);
  });

  it('equality on PRIMARY KEY → const, key PRIMARY, rows 1', () => {
    const ex = new SqlExecutor();
    const row = planRow(ex, 'EXPLAIN SELECT * FROM products WHERE product_id = 7;');
    expect(row.type).toBe('const');
    expect(row.key).toBe('PRIMARY');
    expect(row.possible_keys).toContain('PRIMARY');
    expect(row.rows).toBe(1);
  });

  it('CREATE INDEX makes the column reachable → ref for equality', () => {
    const ex = new SqlExecutor();
    const created = ex.executeQuery('CREATE INDEX idx_products_supplier ON products(supplier_id);');
    expect(created.success).toBe(true);
    const row = planRow(ex, 'EXPLAIN SELECT * FROM products WHERE supplier_id = 2;');
    expect(row.type).toBe('ref');
    expect(row.key).toBe('idx_products_supplier');
    expect(row.possible_keys).toContain('idx_products_supplier');
    expect(row.rows).toBeLessThan(created ? 100 : 100);
  });

  it('range predicate on an indexed column → range', () => {
    const ex = new SqlExecutor();
    ex.executeQuery('CREATE INDEX idx_products_price ON products(price);');
    const row = planRow(ex, 'EXPLAIN SELECT * FROM products WHERE price > 50;');
    expect(row.type).toBe('range');
    expect(row.key).toBe('idx_products_price');
  });

  it('BETWEEN counts as a range predicate on an indexed column', () => {
    const ex = new SqlExecutor();
    ex.executeQuery('CREATE INDEX idx_products_price ON products(price);');
    const row = planRow(ex, 'EXPLAIN SELECT * FROM products WHERE price BETWEEN 20 AND 60;');
    expect(row.type).toBe('range');
  });

  it('DROP INDEX returns the column to ALL', () => {
    const ex = new SqlExecutor();
    ex.executeQuery('CREATE INDEX idx_products_supplier ON products(supplier_id);');
    ex.executeQuery('DROP INDEX idx_products_supplier ON products;');
    const row = planRow(ex, 'EXPLAIN SELECT * FROM products WHERE supplier_id = 2;');
    expect(row.type).toBe('ALL');
    expect(row.key).toBeNull();
  });

  it('duplicate index name is rejected', () => {
    const ex = new SqlExecutor();
    ex.executeQuery('CREATE INDEX idx_products_supplier ON products(supplier_id);');
    const dup = ex.executeQuery('CREATE INDEX idx_products_supplier ON products(category_id);');
    expect(dup.success).toBe(false);
    expect(String(dup.error)).toMatch(/Duplicate key name/i);
  });

  it('resetDatabase restores the seed index state', () => {
    const ex = new SqlExecutor();
    ex.executeQuery('CREATE INDEX idx_products_price ON products(price);');
    ex.resetDatabase();
    const row = planRow(ex, 'EXPLAIN SELECT * FROM products WHERE price > 50;');
    expect(row.type).toBe('ALL');
  });

  it('index creation rolls back with the transaction', () => {
    const ex = new SqlExecutor();
    ex.executeQuery('BEGIN;');
    ex.executeQuery('CREATE INDEX idx_products_supplier ON products(supplier_id);');
    let row = planRow(ex, 'EXPLAIN SELECT * FROM products WHERE supplier_id = 2;');
    expect(row.type).toBe('ref');
    ex.executeQuery('ROLLBACK;');
    row = planRow(ex, 'EXPLAIN SELECT * FROM products WHERE supplier_id = 2;');
    expect(row.type).toBe('ALL');
  });

  it('index creation survives COMMIT', () => {
    const ex = new SqlExecutor();
    ex.executeQuery('BEGIN;');
    ex.executeQuery('CREATE INDEX idx_products_supplier ON products(supplier_id);');
    ex.executeQuery('COMMIT;');
    const row = planRow(ex, 'EXPLAIN SELECT * FROM products WHERE supplier_id = 2;');
    expect(row.type).toBe('ref');
  });

  it("EXPLAIN identifies other tables' PRIMARY KEY lookups", () => {
    const ex = new SqlExecutor();
    const checks: Array<[string, string]> = [
      ['EXPLAIN SELECT * FROM orders WHERE order_id = 3;', 'PRIMARY'],
      ['EXPLAIN SELECT * FROM customers WHERE customer_id = 1;', 'PRIMARY'],
      ['EXPLAIN SELECT * FROM order_items WHERE order_item_id = 5;', 'PRIMARY'],
    ];
    for (const [sql, pk] of checks) {
      const row = planRow(ex, sql);
      expect(row.type).toBe('const');
      expect(row.key).toBe(pk);
    }
  });
});