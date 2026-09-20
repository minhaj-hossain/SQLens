import { describe, expect, it } from 'vitest';
import { buildSuggestions, Suggestion } from '../../src/lib/autocomplete';
import { connectedTables, parseQueryScope } from '../../src/lib/sql-scope';
import { DATABASE_SCHEMAS } from '../../src/content/database/schema';
import { TableSchema } from '../../src/types/database';

const schemas = DATABASE_SCHEMAS as unknown as Record<string, TableSchema>;

const suggest = (prefix: string, queryBeforeCursor: string, fallbackTable?: string): Suggestion[] =>
  buildSuggestions({ prefix, queryBeforeCursor, schemas, fallbackTable });

const texts = (arr: Suggestion[]) => arr.map((s) => s.text);
const has = (arr: Suggestion[], text: string) =>
  arr.some((s) => s.text.toUpperCase() === text.toUpperCase());

describe('sql-scope: parseQueryScope (Batch 3)', () => {
  it('extracts FROM/JOIN tables with aliases, including the AS form', () => {
    const scope = parseQueryScope(
      'SELECT * FROM customers c JOIN orders AS o ON o.customer_id = c.customer_id',
    );
    expect(scope.tables).toEqual([
      { table: 'customers', alias: 'c' },
      { table: 'orders', alias: 'o' },
    ]);
  });

  it('falls back to the table name as alias when no alias is written', () => {
    const scope = parseQueryScope('SELECT * FROM products WHERE');
    expect(scope.tables).toEqual([{ table: 'products', alias: 'products' }]);
  });

  it('never treats a following clause keyword as an alias', () => {
    const scope = parseQueryScope('SELECT * FROM customers WHERE city = ');
    expect(scope.tables[0].alias).toBe('customers');
  });

  it('reads CTE names and their projected columns (aliases win)', () => {
    const scope = parseQueryScope(
      'WITH recent AS (SELECT customer_id, COUNT(*) AS order_count FROM orders GROUP BY customer_id), big AS (SELECT id FROM students) SELECT * FROM recent',
    );
    expect(scope.cteNames).toEqual(['recent', 'big']);
    expect(scope.cteColumns.recent).toEqual(['customer_id', 'order_count']);
    expect(scope.cteColumns.big).toEqual(['id']);
  });

  it('ignores FROM inside string literals and comments', () => {
    const scope = parseQueryScope("SELECT * FROM customers WHERE note = 'FROM orders' -- JOIN products");
    expect(scope.tables).toEqual([{ table: 'customers', alias: 'customers' }]);
  });

  it('orders FK-connected tables first for a given base set', () => {
    const order = connectedTables(['customers'], schemas);
    expect(order.indexOf('orders')).toBeLessThan(order.indexOf('categories'));
    expect(order).not.toContain('customers');
  });

  it('returns the whole schema when there is no base table', () => {
    expect(connectedTables([], schemas)).toHaveLength(Object.keys(schemas).length);
  });
});

describe('autocomplete schema intelligence (Batch 3)', () => {
  it('floats FK-connected tables to the top while typing after JOIN', () => {
    const s = suggest('o', 'SELECT * FROM customers c JOIN o');
    // `orders` (FK-linked to customers) beats the `ON`/`ORDER BY` keywords, and
    // a single-char prefix stays strict: unrelated tables never leak in.
    expect(texts(s)[0]).toBe('orders');
    expect(has(s, 'products')).toBe(false);
  });

  it('floats FK-connected tables above unrelated ones in the JOIN pool', () => {
    const order = connectedTables(['customers'], schemas);
    expect(order.indexOf('orders')).toBeLessThan(order.indexOf('products'));
    expect(order.indexOf('orders')).toBeLessThan(order.indexOf('students'));
  });

  it('offers the FK join condition as a one-key accept right after the join target', () => {
    const s = suggest('', 'SELECT * FROM customers c JOIN orders o ');
    expect(texts(s)[0]).toBe('ON o.customer_id = c.customer_id');
  });

  it('strips the ON prefix once the user already typed it', () => {
    const s = suggest('', 'SELECT * FROM customers c JOIN orders o ON ');
    expect(texts(s)[0]).toBe('o.customer_id = c.customer_id');
    expect(texts(s).every((t) => !t.startsWith('ON '))).toBe(true);
  });

  it('scopes dotted columns to the aliased table only', () => {
    const s = suggest('c.', 'SELECT o.order_id FROM orders o JOIN customers c ON o.customer_id = c.customer_id WHERE c.');
    expect(has(s, 'email')).toBe(true);
    expect(has(s, 'order_date')).toBe(false);
    expect(has(s, 'SELECT')).toBe(false);
  });

  it('resolves an alias written with an explicit AS after a JOIN', () => {
    const s = suggest(
      'buy.',
      'SELECT * FROM customers c JOIN orders AS buy ON buy.customer_id = c.customer_id WHERE buy.',
    );
    expect(has(s, 'order_date')).toBe(true);
    expect(has(s, 'email')).toBe(false);
  });

  it('offers CTE names as tables and CTE columns inside WHERE', () => {
    const cte =
      'WITH recent AS (SELECT customer_id, COUNT(*) AS order_count FROM orders GROUP BY customer_id) SELECT * FROM recent WHERE ';
    const s = suggest('', cte);
    expect(has(s, 'order_count')).toBe(true);
  });

  it('resolves dotted CTE columns', () => {
    const cte =
      'WITH recent AS (SELECT customer_id, COUNT(*) AS order_count FROM orders GROUP BY customer_id) SELECT * FROM recent WHERE recent.';
    const s = suggest('recent.', cte);
    expect(texts(s)).toEqual(['customer_id', 'order_count']);
  });

  it('suggests CTE names while typing a FROM target', () => {
    const cte =
      'WITH recent AS (SELECT customer_id FROM orders) SELECT * FROM ';
    const s = suggest('', cte);
    expect(texts(s)[0]).toBe('recent');
  });

  it('keeps columns of the referenced table ahead of unrelated tables in WHERE', () => {
    const s = suggest('', 'SELECT * FROM customers WHERE ');
    const firstTable = texts(s).findIndex((t) => t === 'products');
    const custCol = texts(s).indexOf('email');
    expect(custCol).toBeGreaterThanOrEqual(0);
    if (firstTable >= 0) expect(custCol).toBeLessThan(firstTable);
  });
});