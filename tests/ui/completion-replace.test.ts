import { describe, expect, it } from 'vitest';
import {
  applyCompletion,
  applySnippetCompletion,
  completionPrefix,
  completionReplaceRange,
} from '../../src/lib/completion-replace';

describe('completionPrefix', () => {
  it('captures alias-qualified prefixes including a trailing dot', () => {
    expect(completionPrefix('SELECT * FROM customers c WHERE c.')).toBe('c.');
    expect(completionPrefix('SELECT * FROM customers c WHERE c.em')).toBe('c.em');
  });

  it('captures a plain identifier', () => {
    expect(completionPrefix('SELECT * FROM products WHERE pr')).toBe('pr');
  });
});

describe('completionReplaceRange', () => {
  it('replaces a single-word prefix', () => {
    const r = completionReplaceRange('SEL', 'SELECT');
    expect(r.replaceFrom).toBe(0);
    expect(r.insertText).toBe('SELECT');
  });

  it('replaces two-word keywords as a unit', () => {
    const before = 'SELECT * FROM products ORDER B';
    const r = completionReplaceRange(before, 'ORDER BY');
    expect(before.slice(r.replaceFrom)).toBe('ORDER B');
  });

  it('replaces three-word keywords as a unit', () => {
    const before = 'SELECT * FROM products WHERE email IS NOT N';
    const r = completionReplaceRange(before, 'IS NOT NULL');
    expect(before.slice(r.replaceFrom)).toBe('IS NOT N');
  });

  it('completes INNER JOIN after INNER and a space', () => {
    const before = 'SELECT * FROM products INNER ';
    const r = completionReplaceRange(before, 'INNER JOIN');
    expect(before.slice(r.replaceFrom).trim()).toBe('INNER');
  });

  it('replaces only the column after a dotted qualifier', () => {
    const before = 'SELECT * FROM customers c WHERE c.em';
    const r = completionReplaceRange(before, 'email');
    expect(before.slice(0, r.replaceFrom)).toBe(
      'SELECT * FROM customers c WHERE c.',
    );
  });

  it('inserts at the caret when the prefix is empty', () => {
    const before = 'SELECT * FROM products ';
    const r = completionReplaceRange(before, 'WHERE');
    expect(r.replaceFrom).toBe(before.length);
  });

  it('tolerates extra spaces between multi-word tokens', () => {
    const before = 'SELECT * FROM products ORDER  B';
    const r = completionReplaceRange(before, 'ORDER BY');
    expect(before.slice(r.replaceFrom).replace(/\s+/g, ' ')).toBe('ORDER B');
  });
});

describe('applyCompletion', () => {
  it('does not leave the typed prefix beside the suggestion', () => {
    const sql = 'SELECT * FROM products ORDER B';
    const { next } = applyCompletion(sql, sql.length, 'ORDER BY');
    expect(next).toBe('SELECT * FROM products ORDER BY ');
    expect(next).not.toContain('ORDER ORDER');
  });

  it('keeps the table qualifier when completing a column', () => {
    const sql = 'SELECT * FROM customers c WHERE c.em';
    const { next } = applyCompletion(sql, sql.length, 'email');
    expect(next).toContain('c.email');
    expect(next).not.toContain('c.ememail');
  });

  it('does not add a space before an opening paren', () => {
    const sql = 'SELECT COUN';
    const { next } = applyCompletion(sql + '(', sql.length, 'COUNT');
    expect(next.startsWith('SELECT COUNT(')).toBe(true);
  });
});

describe('applySnippetCompletion', () => {
  it('expands UPDATE snippet with placeholders', () => {
    const res = applySnippetCompletion('UPD', 3, 'UPDATE');
    expect(res).not.toBeNull();
    expect(res?.next).toContain('UPDATE table_name\nSET column = value\nWHERE condition');
    expect(res?.placeholders).toEqual(['column', 'value', 'condition']);
  });

  it('expands DELETE FROM snippet with placeholders', () => {
    const res = applySnippetCompletion('DEL', 3, 'DELETE FROM');
    expect(res).not.toBeNull();
    expect(res?.next).toContain('DELETE FROM table_name\nWHERE condition');
    expect(res?.placeholders).toEqual(['condition']);
  });
});

