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
});
