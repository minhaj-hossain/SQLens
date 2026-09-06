import { describe, expect, it } from 'vitest';
import {
  indentSelection,
  toggleLineComment,
  duplicateLine,
  selectLineRange,
  moveLine,
  applyAutoPair,
  deleteEmptyPair,
} from '../../src/lib/editor-keybindings';
import { formatSql } from '../../src/lib/format-sql';

describe('indentSelection', () => {
  it('indents every selected line', () => {
    const sql = 'SELECT a\nFROM b';
    const r = indentSelection(sql, 0, sql.length, 'in');
    expect(r.next).toBe('  SELECT a\n  FROM b');
  });

  it('outdents two spaces', () => {
    const sql = '  SELECT a\n  FROM b';
    const r = indentSelection(sql, 0, sql.length, 'out');
    expect(r.next).toBe('SELECT a\nFROM b');
  });
});

describe('toggleLineComment', () => {
  it('comments the current line when nothing is selected', () => {
    const sql = 'SELECT 1';
    const r = toggleLineComment(sql, 0, 0);
    expect(r.next).toBe('-- SELECT 1');
  });

  it('uncomments a commented line', () => {
    const sql = '-- SELECT 1';
    const r = toggleLineComment(sql, 0, 0);
    expect(r.next).toBe('SELECT 1');
  });
});

describe('duplicateLine', () => {
  it('duplicates the current line', () => {
    const r = duplicateLine('SELECT 1\nFROM x', 3);
    expect(r.next).toBe('SELECT 1\nSELECT 1\nFROM x');
  });
});

describe('selectLineRange', () => {
  it('selects the full line span from cursor', () => {
    const sql = 'SELECT 1\nFROM products\nWHERE id = 2';
    const range = selectLineRange(sql, 12);
    expect(sql.slice(range.start, range.end)).toBe('FROM products\n');
  });
});

describe('moveLine', () => {
  it('moves current line down', () => {
    const sql = 'line1\nline2\nline3';
    const r = moveLine(sql, 2, 1);
    expect(r.next).toBe('line2\nline1\nline3');
  });
});

describe('auto-pairs', () => {
  it('wraps a selection', () => {
    const r = applyAutoPair('abc', 0, 3, "'");
    expect(r?.next).toBe("'abc'");
  });

  it('deletes an empty pair on backspace', () => {
    const r = deleteEmptyPair("''", 1);
    expect(r?.next).toBe('');
  });
});

describe('formatSql', () => {
  it('uppercases keywords and does not emit FULL JOIN', () => {
    const out = formatSql('select * from products where name = \'full join\'');
    expect(out).toContain('SELECT');
    expect(out).toContain('FROM');
    expect(out).not.toMatch(/\bFULL JOIN\b/);
    expect(out).toContain("'full join'");
  });
});
