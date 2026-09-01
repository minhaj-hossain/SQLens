import { describe, expect, it } from 'vitest';
import { buildSuggestions } from '../../src/lib/autocomplete';
import { DATABASE_SCHEMAS } from '../../src/content/database/schema';

/**
 * Regression coverage for the autocomplete-coverage bug (tracker item 12):
 * users complained that typing FROM, ORDER BY, GROUP BY, LIMIT etc. yielded
 * NO suggestion, because each clause keyword lived only in one narrow pool.
 * Every keyword must be reachable by prefix at every cursor position.
 */
const suggest = (queryBeforeCursor: string) =>
  buildSuggestions({
    prefix: queryBeforeCursor.match(/([a-z0-9_]+)$/i)?.[1] ?? '',
    queryBeforeCursor,
    schemas: DATABASE_SCHEMAS,
    limit: 12,
  }).map((s) => s.text);

describe('autocomplete keyword coverage (every syntax discoverable)', () => {
  it('OFFERS FROM while typing its prefix mid-SELECT', () => {
    const items = suggest('SELECT * FR');
    expect(items).toContain('FROM');
  });

  it('OFFERS ORDER BY while typing its second word', () => {
    expect(suggest('SELECT * FROM products ORDER B')).toContain('ORDER BY');
    expect(suggest('SELECT * FROM products ORDER ')).toContain('ORDER BY');
  });

  it('OFFERS GROUP BY while typing its second word after WHERE', () => {
    const items = suggest('SELECT category_id, COUNT(*) FROM products WHERE price > 10 GROUP B');
    expect(items).toContain('GROUP BY');
  });

  it('OFFERS LIKE inside a WHERE expression', () => {
    const items = suggest('SELECT name FROM products WHERE name LIK');
    expect(items).toContain('LIKE');
  });

  it('OFFERS HAVING, LIMIT and ORDER BY after a FROM clause', () => {
    const items = suggest('SELECT name FROM products HA');
    expect(items).toContain('HAVING');
    expect(suggest('SELECT name FROM products LIM')).toContain('LIMIT');
    expect(suggest('SELECT name FROM products ORD')).toContain('ORDER BY');
  });

  it('OFFERS JOIN and multi-word join forms by prefix', () => {
    expect(suggest('SELECT * FROM products J')).toContain('JOIN');
    expect(suggest('SELECT * FROM products LE')).toContain('LEFT JOIN');
    expect(suggest('SELECT * FROM products INNER JO')).toContain('INNER JOIN');
  });

  it('OFFERS IS NULL / IS NOT NULL from only the first word', () => {
    expect(suggest('SELECT * FROM products WHERE supplier_id IS ')).toContain('IS NULL');
    expect(suggest('SELECT * FROM products WHERE supplier_id IS N')).toContain('IS NOT NULL');
    expect(suggest('SELECT * FROM products WHERE supplier_id IS ')).toContain('IS NOT NULL');
  });

  it('OFFERS DDL + transaction keywords at statement start', () => {
    expect(suggest('CREATE TA')).toContain('CREATE TABLE');
    expect(suggest('ALTER TA')).toContain('ALTER TABLE');
    expect(suggest('BEG')).toContain('BEGIN');
    expect(suggest('INS')).toContain('INSERT INTO');
    expect(suggest('DROP TA')).toContain('DROP TABLE');
  });

  it('OFFERS INSERT INTO / DELETE FROM from their second word', () => {
    expect(suggest('INSERT INT')).toContain('INSERT INTO');
    expect(suggest('DELETE FRO')).toContain('DELETE FROM');
  });

  it('still ranks tables over keywords right after FROM', () => {
    const items = buildSuggestions({
      prefix: '',
      queryBeforeCursor: 'SELECT * FROM ',
      schemas: DATABASE_SCHEMAS,
      limit: 10,
    });
    expect(items[0].type).toBe('table');
    expect(items.map((i) => i.text)).toContain('products');
  });

  it('excludes FULL JOIN (engine unsupported)', () => {
    const items = suggest('SELECT * FROM products FULL');
    expect(items).not.toContain('FULL JOIN');
  });

  // ---- Expanded keyword coverage (engine-supported syntax stays discoverable) ----

  it('OFFERS ILIKE and NOT IN inside a WHERE expression', () => {
    expect(suggest('SELECT name FROM products WHERE name IL')).toContain('ILIKE');
    expect(suggest('SELECT name FROM products WHERE id NOT ')).toContain('NOT IN');
  });

  it('OFFERS string scalar functions in SELECT expressions', () => {
    const items = suggest('SELECT UP');
    expect(items).toContain('UPPER');
    expect(suggest('SELECT TR')).toContain('TRIM');
    expect(suggest('SELECT LEN')).toContain('LENGTH');
    expect(suggest('SELECT SUB')).toContain('SUBSTRING');
  });

  it('OFFERS date functions in SELECT/expression contexts', () => {
    expect(suggest('SELECT YE')).toContain('YEAR');
    expect(suggest('SELECT EXTR')).toContain('EXTRACT');
    expect(suggest('SELECT DATEDI')).toContain('DATEDIFF');
    expect(suggest('SELECT CUR')).toContain('CURDATE');
    expect(suggest('SELECT * FROM products WHERE order_date > CUR')).toContain('CURDATE');
  });

  it('OFFERS window functions by prefix inside a SELECT list', () => {
    const items = suggest('SELECT ROW_');
    expect(items).toContain('ROW_NUMBER');
    expect(suggest('SELECT RAN')).toContain('RANK');
    expect(suggest('SELECT DENSE_')).toContain('DENSE_RANK');
  });

  it('OFFERS transactions + EXPLAIN by prefix', () => {
    expect(suggest('BEG')).toContain('BEGIN');
    expect(suggest('COM')).toContain('COMMIT');
    expect(suggest('ROLL')).toContain('ROLLBACK');
    expect(suggest('EXPLA')).toContain('EXPLAIN');
  });

  it('OFFERS TRUE/FALSE keywords', () => {
    const items = suggest('SELECT * FROM products WHERE in_stock = TR');
    expect(items).toContain('TRUE');
    expect(suggest('SELECT * FROM products WHERE in_stock = FA')).toContain('FALSE');
  });
});