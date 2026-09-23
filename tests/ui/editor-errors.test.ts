import { describe, expect, it } from 'vitest';
import { parseEditorError, findClosestMatch, levenshtein } from '../../src/lib/editor-errors';
import { DATABASE_SCHEMAS } from '../../src/content/database/schema';

describe('editor error parsing & did-you-mean', () => {
  it('computes levenshtein distance correctly', () => {
    expect(levenshtein('kitten', 'sitting')).toBe(3);
    expect(levenshtein('emial', 'email')).toBe(2);
  });

  it('suggests closest match for typos', () => {
    const candidates = ['customer_id', 'email', 'city', 'signup_date'];
    expect(findClosestMatch('emial', candidates)).toBe('email');
    expect(findClosestMatch('citi', candidates)).toBe('city');
  });

  it('parses unknown column error and extracts token, line, and suggestion', () => {
    const sql = 'SELECT emial\nFROM customers';
    const parsed = parseEditorError("Unknown column 'emial'", sql, DATABASE_SCHEMAS);
    expect(parsed).not.toBeNull();
    expect(parsed?.token).toBe('emial');
    expect(parsed?.line).toBe(1);
    expect(parsed?.didYouMean).toBe('email');
    expect(parsed?.displayMessage).toContain("Did you mean 'email'?");
  });

  it('parses unknown table error and suggests closest table', () => {
    const sql = 'SELECT * FROM custmers';
    const parsed = parseEditorError("Table 'custmers' does not exist", sql, DATABASE_SCHEMAS);
    expect(parsed).not.toBeNull();
    expect(parsed?.token).toBe('custmers');
    expect(parsed?.didYouMean).toBe('customers');
    expect(parsed?.displayMessage).toContain("Did you mean 'customers'?");
  });

  it('handles null / empty error gracefully', () => {
    expect(parseEditorError(null, 'SELECT 1', DATABASE_SCHEMAS)).toBeNull();
    expect(parseEditorError('', 'SELECT 1', DATABASE_SCHEMAS)).toBeNull();
  });

  // P0 regression (blocking INSERT bug): grading/validation feedback must
  // NEVER render as an inline engine error. Before the fix,
  // "Table 'products' does not match..." was rewritten into the false
  // "Table 'products' does not exist. Did you mean 'products'?" + a no-op
  // "Fix to products" button.
  it('P0: ignores final-state validation feedback (not an engine error)', () => {
    const sql =
      "INSERT INTO products (name, supplier_id, category_id, price, quantity_in_stock, reorder_level) VALUES ('Ultra Wireless Mouse', 1, 1, 49.99, 100, 20);";
    expect(
      parseEditorError(
        "Table 'products' does not match the expected final state (expected 32 row(s), found 31). Check which rows you targeted and the values you wrote.",
        sql,
        DATABASE_SCHEMAS,
      ),
    ).toBeNull();
    expect(
      parseEditorError(
        "Table 'products' is missing column(s): price.",
        sql,
        DATABASE_SCHEMAS,
      ),
    ).toBeNull();
  });

  it('P0: never suggests the token itself (no self "Fix to products")', () => {
    const sql = 'INSERT INTO products (name) VALUES (\'X\');';
    const parsed = parseEditorError("Table 'products' does not exist.", sql, DATABASE_SCHEMAS);
    // products exists in the schema, but even for a hypothetical exact-name
    // hit the Fix button must not offer a no-op replacement.
    expect(parsed?.didYouMean === undefined || parsed?.didYouMean.toLowerCase() !== 'products').toBe(true);
    expect(parsed?.displayMessage ?? '').not.toContain("Did you mean 'products'?");
  });

  // ---- Engine DDL typing errors (Workstream C / B messages) ----

  it('parses Unknown data type and suggests the closest canonical type', () => {
    const sql = 'CREATE TABLE t (id VARCHR(20));';
    const parsed = parseEditorError(
      "Unknown data type 'VARCHR(20)' for column 'id' — did you mean 'VARCHAR'? (supported: INT, VARCHAR, … see docs/DIALECT.md §5).",
      sql,
      DATABASE_SCHEMAS,
    );
    expect(parsed).not.toBeNull();
    expect(parsed?.token).toBe('VARCHR');
    expect(parsed?.didYouMean).toBe('VARCHAR');
    expect(parsed?.displayMessage).toContain("Unknown data type 'VARCHR'. Did you mean 'VARCHAR'?");
    // The `for column 'id'` tail must NOT be misread as an unknown-column error
    expect(parsed?.displayMessage ?? '').not.toContain('No column named');
  });

  it('surfaces a missing-data-type error without a bogus keyword suggestion', () => {
    const sql = 'CREATE TABLE t (id);';
    const parsed = parseEditorError(
      "Column 'id' needs a data type (e.g. id INT, id VARCHAR(50)).",
      sql,
      DATABASE_SCHEMAS,
    );
    expect(parsed).not.toBeNull();
    expect(parsed?.token).toBe('id');
    expect(parsed?.didYouMean).toBeUndefined(); // 'id' → 'IN' would be a lie
    expect(parsed?.displayMessage).toContain('needs a data type');
  });
});
