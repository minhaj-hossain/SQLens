import { describe, expect, it } from 'vitest';
import {
  buildSuggestions,
  scoreSuggestion,
  suggestionMatches,
} from '../../src/lib/autocomplete';
import { historyBoostFromList } from '../../src/lib/suggestion-history';
import { preserveCase } from '../../src/lib/completion-replace';
import { DATABASE_SCHEMAS } from '../../src/content/database/schema';
import { TableSchema } from '../../src/types/database';

const schemas = DATABASE_SCHEMAS as unknown as Record<string, TableSchema>;

const suggest = (
  prefix: string,
  queryBeforeCursor: string,
  extra?: { history?: string[]; fallbackTable?: string; limit?: number },
) =>
  buildSuggestions({
    prefix,
    queryBeforeCursor,
    schemas,
    fallbackTable: extra?.fallbackTable,
    limit: extra?.limit ?? 8,
    historyBoost: extra?.history ? historyBoostFromList(extra.history) : undefined,
  }).map((s) => s.text);

describe('autocomplete ranking (Batch 2: fuzzy + scored)', () => {
  it('scores exact-prefix above fuzzy subsequence', () => {
    expect(scoreSuggestion('SELECT', 'SEL')).toBeGreaterThan(scoreSuggestion('SELECT', 'SLT'));
    expect(scoreSuggestion('SELECT', 'SEL')).toBeGreaterThan(scoreSuggestion('SELECT', 'ECT'));
  });

  it('tolerates typos: slct/whre/frm still reach their keyword', () => {
    expect(suggestionMatches('SELECT', 'SLCT')).toBe(true);
    expect(suggestionMatches('WHERE', 'WHRE')).toBe(true);
    expect(suggestionMatches('FROM', 'FRM')).toBe(true);
  });

  it('reaches tables via subsequence in tables context: ctm -> customers', () => {
    expect(suggest('ctm', 'SELECT * FROM ctm')).toContain('customers');
  });

  it('keeps multi-word continuation working: ORDER B -> ORDER BY', () => {
    expect(suggest('B', 'SELECT * FROM products ORDER B')).toContain('ORDER BY');
    expect(suggest('', 'SELECT * FROM products ORDER ')).toContain('ORDER BY');
  });

  it('ranks exact prefix first even with fuzzy neighbours present', () => {
    const items = suggest('SEL', 'SEL');
    expect(items[0]).toBe('SELECT');
  });

  it('attaches a one-line teaching doc to keyword suggestions (Batch 4)', () => {
    const s = buildSuggestions({
      prefix: 'WH',
      queryBeforeCursor: 'SELECT * FROM products WH',
      schemas,
    });
    const where = s.find((item) => item.text === 'WHERE');
    expect(where?.doc).toBe('filters rows before grouping');
  });

  it('shows no doc for plain column suggestions', () => {
    const s = buildSuggestions({
      prefix: 'ema',
      queryBeforeCursor: 'SELECT * FROM customers WHERE ema',
      schemas,
    });
    const email = s.find((item) => item.text === 'email');
    expect(email).toBeDefined();
    expect(email?.doc).toBeUndefined();
  });

  it('floats repeated picks to the top via history boost', () => {
    const boosted = suggest('ct', 'SELECT ct', {
      fallbackTable: 'customers',
      limit: 12,
      history: ['CITY'],
    });
    expect(boosted).toContain('city');
    const plain = suggest('ct', 'SELECT ct', {
      fallbackTable: 'customers',
      limit: 12,
    });
    expect(boosted.indexOf('city')).toBeLessThanOrEqual(plain.indexOf('city'));
    expect(boosted.indexOf('city')).toBeLessThanOrEqual(2);
  });

  it('scopes dotted prefixes to columns only', () => {
    const items = suggest('c.em', 'SELECT * FROM customers c WHERE c.em');
    expect(items).toContain('email');
    expect(items.some((t) => t.toUpperCase() === 'SELECT')).toBe(false);
  });

  it('preserves the user typed casing on accept', () => {
    expect(preserveCase('sel', 'SELECT')).toBe('select');
    expect(preserveCase('SEL', 'SELECT')).toBe('SELECT');
    expect(preserveCase('SeL', 'SELECT')).toBe('SELECT');
  });
});
