import { describe, expect, it } from 'vitest';
import { errorGutterLine, parseEditorError, findClosestMatch, levenshtein } from '../../src/lib/editor-errors';
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

  it('uses the AST scope for an engine-named column error', () => {
    const scoped = parseEditorError(
      "Unknown column 'unit_prce' in 'field list'",
      'SELECT unit_prce FROM order_items;',
      DATABASE_SCHEMAS,
    );
    expect(scoped?.didYouMean).toBe('unit_price');
    expect(scoped?.displayMessage).toContain('in order_items');

    const computed = parseEditorError(
      "Unknown column 'emial' in 'field list'",
      'SELECT UPPER(emial) FROM customers;',
      DATABASE_SCHEMAS,
    );
    expect(computed?.didYouMean).toBe('email');
    expect(computed?.line).toBe(1);
    expect(computed?.col).toBe(14);
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

  // ---- P4.17: engine-reported positions (line/col + gutter marker) ----

  it('P4.17: an engine location is used verbatim instead of being re-guessed', () => {
    const parsed = parseEditorError(
      "Unknown column 'emial'",
      "SELECT 'emial' AS label,\n  emial\nFROM customers",
      DATABASE_SCHEMAS,
      // Synthetic on purpose: if the editor re-derived the position this could
      // never come back unchanged.
      { position: { line: 7, col: 4, offsetStart: 3, offsetEnd: 8 }, occurrences: 2 },
    );
    expect(parsed?.line).toBe(7);
    expect(parsed?.col).toBe(4);
    expect(parsed?.offsetStart).toBe(3);
    expect(parsed?.offsetEnd).toBe(8);
    expect(parsed?.tokenOccurrences).toBe(2);
    expect(errorGutterLine(parsed)).toBeNull(); // ambiguous → no marker
  });

  it('P4.17: without an engine location the search stays comment/string aware', () => {
    const sql = "SELECT 'emial' AS label,\n  emial\nFROM customers";
    const parsed = parseEditorError("Unknown column 'emial'", sql, DATABASE_SCHEMAS);
    // The old regex search matched the LITERAL on line 1 (offset 8) and sent the
    // learner to text that is not code; the shared locator finds the real one.
    expect(parsed?.line).toBe(2);
    expect(parsed?.offsetStart).toBe(27);
    expect(sql.slice(27, 32)).toBe('emial');
    expect(parsed?.tokenOccurrences).toBe(1);
  });

  it('P4.17: reports no position when the name appears only inside a literal', () => {
    const parsed = parseEditorError(
      "Unknown column 'emial'",
      "SELECT 'emial' FROM customers",
      DATABASE_SCHEMAS,
    );
    expect(parsed).not.toBeNull();
    expect(parsed?.token).toBe('emial');
    expect(parsed?.line).toBeUndefined();
    expect(parsed?.col).toBeUndefined();
    expect(errorGutterLine(parsed)).toBeNull();
  });

  it('P4.17: counts occurrences and suppresses an ambiguous gutter marker', () => {
    const twice = parseEditorError(
      "Unknown column 'emial'",
      'SELECT emial FROM t WHERE emial > 1',
      DATABASE_SCHEMAS,
    );
    expect(twice?.tokenOccurrences).toBe(2);
    expect(twice?.line).toBe(1);
    expect(errorGutterLine(twice)).toBeNull();

    const once = parseEditorError("Unknown column 'emial'", 'SELECT emial FROM t', DATABASE_SCHEMAS);
    expect(once?.tokenOccurrences).toBe(1);
    expect(errorGutterLine(once)).toBe(1);
  });
});
