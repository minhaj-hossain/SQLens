import { describe, it, expect } from 'vitest';
import { buildSuggestions, Suggestion, referencedTables } from '../../src/lib/autocomplete';
import { DATABASE_SCHEMAS } from '../../src/content/database/schema';

const sug = (opts: {
  prefix: string;
  queryBeforeCursor: string;
  fallbackTable?: string;
}): Suggestion[] =>
  buildSuggestions({
    prefix: opts.prefix,
    queryBeforeCursor: opts.queryBeforeCursor,
    schemas: DATABASE_SCHEMAS as unknown as Record<string, import('../../src/types/database').TableSchema>,
    fallbackTable: opts.fallbackTable,
  });

const has = (arr: Suggestion[], text: string) => arr.some((s) => s.text.toUpperCase() === text.toUpperCase());

describe('autocomplete context routing (tracker item 12)', () => {
  it('offers SELECT at statement start', () => {
    expect(has(sug({ prefix: 'SEL', queryBeforeCursor: '' }), 'SELECT')).toBe(true);
  });

  it('suggests TABLES while typing after FROM, not keywords', () => {
    const s = sug({ prefix: 'cus', queryBeforeCursor: 'SELECT * FROM cus' });
    expect(has(s, 'customers')).toBe(true);
    expect(has(s, 'SELECT')).toBe(false);
    expect(has(s, 'WHERE')).toBe(false);
  });

  it('suggests clause-starters after a completed FROM table list', () => {
    const s = sug({ prefix: '', queryBeforeCursor: 'SELECT * FROM products p ' });
    expect(has(s, 'WHERE')).toBe(true);
    expect(has(s, 'ORDER BY')).toBe(true);
    expect(has(s, 'SELECT')).toBe(false);
  });

  it('suggests COLUMNS of the referenced table inside WHERE', () => {
    const s = sug({ prefix: 'pr', queryBeforeCursor: 'SELECT * FROM products WHERE pr' });
    expect(has(s, 'price')).toBe(true);
    expect(has(s, 'SELECT')).toBe(false);
  });

  it('uses referenced tables over the fallback table', () => {
    const s = sug({ prefix: 'ci', queryBeforeCursor: 'SELECT name FROM customers WHERE ci', fallbackTable: 'products' });
    expect(has(s, 'city')).toBe(true);
    expect(has(s, 'quantity_in_stock')).toBe(false);
  });

  it('resolves an alias-qualified prefix to the aliased table columns', () => {
    const s = sug({
      prefix: 'c.',
      queryBeforeCursor: 'SELECT o.order_id FROM orders o JOIN customers c ON o.customer_id = c.customer_id WHERE c.',
    });
    expect(has(s, 'email')).toBe(true);
    expect(has(s, 'customer_id')).toBe(true);
  });

  it('offers AND/OR-style continuations inside expressions', () => {
    const s = sug({ prefix: 'AN', queryBeforeCursor: 'SELECT * FROM products WHERE price > 50 ' });
    expect(has(s, 'AND')).toBe(true);
  });

  it('suggests tables in an UPDATE statement', () => {
    const s = sug({ prefix: 'pro', queryBeforeCursor: 'UPDATE pro' });
    expect(has(s, 'products')).toBe(true);
  });

  it('never surfaces the unsupported FULL JOIN', () => {
    const start = sug({ prefix: '', queryBeforeCursor: '' });
    const afterTable = sug({ prefix: '', queryBeforeCursor: 'SELECT * FROM products p ' });
    const joinCtx = sug({ prefix: 'FUL', queryBeforeCursor: 'SELECT * FROM products p ' });
    expect(has(start, 'FULL JOIN')).toBe(false);
    expect(has(afterTable, 'FULL JOIN')).toBe(false);
    expect(has(joinCtx, 'FULL JOIN')).toBe(false);
  });
});

describe('referencedTables', () => {
  it('finds FROM/JOIN targets but not keyword tokens', () => {
    expect(referencedTables('SELECT * FROM customers c JOIN orders o ON c.id = o.cust')).toEqual(
      expect.arrayContaining(['customers', 'orders']),
    );
  });

  it('ignores table-like words inside string literals', () => {
    expect(referencedTables("SELECT * FROM products WHERE name = 'FROM customers'")).toEqual(['products']);
  });
});