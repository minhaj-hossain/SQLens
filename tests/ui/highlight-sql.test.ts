import { describe, it, expect } from 'vitest';
import { highlightSql, SQL_KEYWORDS } from '../../src/lib/highlight-sql';

/**
 * Regression tests for the grayscale SQL tokenizer used on concept pages.
 * Guards against the ___TOKEN_n___ placeholder leak: the identifier pass used
 * to re-stash keyword placeholders, so the restore pass silently no-op'd and
 * raw `___TOKEN_0___ name, age` rendered in the UI instead of SELECT.
 */
describe('highlightSql', () => {
  it('never leaks raw ___TOKEN_n___ placeholders', () => {
    const inputs = [
      'SELECT name, age FROM students;',
      'SELECT * FROM students WHERE age > 21;',
      "SELECT name FROM students WHERE city = 'Dhaka'; -- top rows",
      'SELECT COUNT(*) FROM students GROUP BY department;',
    ];
    for (const sql of inputs) {
      const out = highlightSql(sql);
      expect(out).not.toMatch(/___TOKEN_\d+___/);
    }
  });

  it('wraps keywords in text-code-kw spans (white, bold)', () => {
    const out = highlightSql('SELECT name FROM students;');
    expect(out).toContain('<span class="text-code-kw font-bold">SELECT</span>');
    expect(out).toContain('<span class="text-code-kw font-bold">FROM</span>');
  });

  it('keeps identifiers mid-gray and punctuation dim', () => {
    const out = highlightSql('SELECT name FROM students;');
    expect(out).toContain('<span class="text-code-ident">name</span>');
    expect(out).toContain('<span class="text-code-ident">students</span>');
    expect(out).toContain('<span class="text-code-punc">;</span>');
  });

  it('matches multi-word keywords before sub-words and lower-cased input', () => {
    const out = highlightSql('select id from students order by age desc;');
    // P9.2: case is preserved as typed — no uppercase forcing
    expect(out).toContain('>order by<');
    expect(out).toContain('>desc<');
    // ORDER must not be left half-highlighted inside a broken span
    expect(out).not.toMatch(/OR(?!DER)/);
  });

  it('stashes and restores comments as dim italic', () => {
    const out = highlightSql('SELECT name FROM students; -- get names');
    expect(out).toContain('<span class="text-code-comment italic">-- get names</span>');
  });

  it('stashes and restores string literals as text-code-str spans', () => {
    const out = highlightSql("SELECT name FROM students WHERE city = 'Dhaka';");
    expect(out).toContain("'Dhaka'");
    expect(out).toContain("<span class=\"text-code-str font-medium\">'Dhaka'</span>");
    expect(out).not.toMatch(/___TOKEN_\d+___/);
  });

  it('escapes HTML special characters', () => {
    const out = highlightSql('SELECT a < b FROM t;');
    expect(out).toContain('&lt;');
    expect(out).not.toMatch(/<b>/);
  });

  it('returns empty string for empty input', () => {
    expect(highlightSql('')).toBe('');
  });

  it('handles multi-line queries without losing newlines or placeholders', () => {
    const sql = 'SELECT name, age\nFROM students\nWHERE age > 21;';
    const out = highlightSql(sql);
    expect(out).toContain('\n');
    expect(out).not.toMatch(/___TOKEN_\d+___/);
    expect(out).toContain('>WHERE<');
  });

  it('handles the full day-01 target query end to end', () => {
    const sql = 'SELECT name FROM students;';
    const out = highlightSql(sql);
    const plain = out.replace(/<[^>]+>/g, '');
    expect(plain).toBe('SELECT name FROM students;');
  });
});

describe('highlightSql — P9.2 unification', () => {
  it('exports the shared keyword list as the single source for all editors', () => {
    expect(SQL_KEYWORDS).toContain('SELECT');
    expect(SQL_KEYWORDS).toContain('CROSS JOIN');
    expect(SQL_KEYWORDS).toContain('ALTER TABLE');
    expect(SQL_KEYWORDS).toContain('NULL');
  });

  it('preserves the case the user typed (no uppercase forcing at tokenizer level)', () => {
    const strip = (html: string) => html.replace(/<[^>]+>/g, '');
    const out = strip(highlightSql('select name from students;'));
    expect(out).toContain('select');
    expect(out).not.toContain('SELECT');
  });
});
