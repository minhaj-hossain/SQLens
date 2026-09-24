import { describe, expect, it } from 'vitest';
import { diagnoseSql, suggestColumnInScope } from '../../src/lib/editor-diagnostics';
import { DATABASE_SCHEMAS } from '../../src/content/database/schema';

describe('AST editor diagnostics', () => {
  it('finds a typo inside a computed projection that the engine skips', () => {
    const sql = 'SELECT UPPER(emial) FROM customers;';
    const [hit] = diagnoseSql(sql, DATABASE_SCHEMAS);

    expect(hit).toMatchObject({
      code: 'unknown-column',
      token: 'emial',
      didYouMean: 'email',
    });
    expect(hit.message).toContain("Did you mean 'email'?");
    expect(hit.position).toEqual({
      line: 1,
      col: 14,
      offsetStart: 13,
      offsetEnd: 18,
    });
  });

  it('suggests from the table actually read, not the global schema', () => {
    const sql = 'SELECT unit_prce FROM order_items;';
    const [hit] = diagnoseSql(sql, DATABASE_SCHEMAS);

    expect(hit.code).toBe('unknown-column');
    expect(hit.didYouMean).toBe('unit_price');
    expect(hit.message).toContain('in order_items');
    expect(hit.message).not.toContain("Did you mean 'price'?");
  });

  it('checks qualified columns and gives a scoped suggestion', () => {
    const sql = 'SELECT p.prices FROM products p;';
    const [hit] = diagnoseSql(sql, DATABASE_SCHEMAS);

    expect(hit).toMatchObject({
      code: 'unknown-column',
      token: 'p.prices',
      didYouMean: 'p.price',
    });
    expect(hit.message).toContain("Did you mean 'p.price'?");
  });

  it('reports an unknown qualifier with a useful scoped message', () => {
    const [hit] = diagnoseSql('SELECT custmers.email FROM customers;', DATABASE_SCHEMAS);

    expect(hit.code).toBe('unknown-qualifier');
    expect(hit.didYouMean).toBe('customers.email');
    expect(hit.message).toContain("Did you mean 'customers.email'?");
  });

  it('distinguishes an ambiguous shared column from an unknown column', () => {
    const [hit] = diagnoseSql(
      'SELECT name FROM customers c JOIN categories g ON c.customer_id = g.category_id;',
      DATABASE_SCHEMAS,
    );

    expect(hit).toMatchObject({
      code: 'ambiguous-column',
      token: 'name',
      didYouMean: 'c.name',
    });
    expect(hit.message).toContain('more than one table');
  });

  it('checks WHERE, ORDER BY, GROUP BY, and UPDATE SET targets', () => {
    expect(diagnoseSql('SELECT customer_id FROM orders WHERE statuss = \'open\';', DATABASE_SCHEMAS))
      .toEqual([expect.objectContaining({ token: 'statuss' })]);
    expect(diagnoseSql('SELECT customer_id FROM orders ORDER BY ordr_date;', DATABASE_SCHEMAS))
      .toEqual([expect.objectContaining({ token: 'ordr_date' })]);
    expect(diagnoseSql('SELECT customer_id FROM orders GROUP BY customers_id;', DATABASE_SCHEMAS))
      .toEqual([expect.objectContaining({ token: 'customers_id' })]);
    expect(diagnoseSql('UPDATE customers SET emial = \'x\' WHERE customer_id = 1;', DATABASE_SCHEMAS))
      .toEqual([expect.objectContaining({ token: 'emial', didYouMean: 'email' })]);
  });

  it('stays quiet for valid SQL, literals, comments, and output aliases', () => {
    const valid = [
      'SELECT email FROM customers;',
      'SELECT COUNT(*) AS total FROM customers;',
      "SELECT 'emial' AS label, email FROM customers;",
      'SELECT email AS mail FROM customers ORDER BY mail;',
      'SELECT * FROM customers;',
    ];
    for (const sql of valid) expect(diagnoseSql(sql, DATABASE_SCHEMAS), sql).toEqual([]);
    expect(diagnoseSql('SELECT emial FROM customers; -- emial', DATABASE_SCHEMAS)).toHaveLength(1);
  });

  it('does not guess when the statement scope is unavailable', () => {
    const unsupported = [
      'WITH x AS (SELECT 1 AS a) SELECT emial FROM x;',
      'SELECT emial FROM (SELECT * FROM customers) x;',
      'SELECT emial FROM custmers;',
      'CREATE TABLE t (id INT); SELECT emial FROM customers;',
      'SELECT emial FROM customers UNION SELECT emial FROM orders;',
    ];
    for (const sql of unsupported) expect(diagnoseSql(sql, DATABASE_SCHEMAS), sql).toEqual([]);
  });

  it('re-anchors a later statement position onto the full script', () => {
    const sql = 'SELECT email FROM customers;\nSELECT emial FROM orders;';
    const [hit] = diagnoseSql(sql, DATABASE_SCHEMAS);

    expect(hit.position).toMatchObject({ line: 2, col: 8 });
    expect(sql.slice(hit.position!.offsetStart, hit.position!.offsetEnd)).toBe('emial');
  });

  it('handles multiple statements and reports the count across the script', () => {
    const sql = 'SELECT emial FROM customers;\nSELECT emial FROM orders;';
    const [hit] = diagnoseSql(sql, DATABASE_SCHEMAS);

    expect(hit.position).toMatchObject({ line: 1, col: 8 });
    expect(hit.occurrences).toBe(2);
  });

  it('offers a scope-aware fallback for an engine-named error', () => {
    expect(suggestColumnInScope('SELECT unit_prce FROM order_items;', 'unit_prce', DATABASE_SCHEMAS))
      .toBe('unit_price');
    expect(suggestColumnInScope('SELECT 1;', 'unit_prce', DATABASE_SCHEMAS)).toBeNull();
    expect(suggestColumnInScope('SELECT unit_prce FROM unknown_table;', 'unit_prce', DATABASE_SCHEMAS)).toBeNull();
  });
});
