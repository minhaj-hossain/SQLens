import { describe, expect, it } from 'vitest';
import {
  indentSelection,
  toggleLineComment,
  duplicateLine,
  selectLineRange,
  moveLine,
  applyAutoPair,
  deleteEmptyPair,
  findActiveSignature,
  signatureHint,
  signatureParts,
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

describe('signature helper — batch 5 item 6 (per-argument highlight)', () => {
  it('detects the function whose paren the caret sits in', () => {
    const sig = findActiveSignature('SELECT COUNT(');
    expect(sig?.name).toBe('COUNT');
    expect(sig?.activeIndex).toBe(0);
  });

  it('keeps highlighting while the first argument is being typed', () => {
    // Previously the hint only existed immediately after `(`.
    const sig = findActiveSignature('SELECT COUNT(cust');
    expect(sig?.name).toBe('COUNT');
    expect(sig?.activeIndex).toBe(0);
  });

  it('advances the active argument after each top-level comma', () => {
    expect(findActiveSignature('SELECT SUBSTRING(name, ')?.activeIndex).toBe(1);
    expect(findActiveSignature('SELECT SUBSTRING(name, 1, ')?.activeIndex).toBe(2);
  });

  it('resolves the INNERMOST unclosed call', () => {
    // SUM( is still open, so the caret is inside SUM, not ROUND.
    expect(findActiveSignature('SELECT ROUND(SUM(')?.name).toBe('SUM');
    // SUM is closed: ROUND with its second (active) argument.
    const outer = findActiveSignature('SELECT ROUND(SUM(price), ');
    expect(outer?.name).toBe('ROUND');
    expect(outer?.activeIndex).toBe(1);
  });

  it('ignores commas inside a nested call', () => {
    expect(findActiveSignature('SELECT COALESCE(CONCAT(a, b), ')?.activeIndex).toBe(1);
  });

  it('clamps to the last declared argument when extras are typed', () => {
    expect(findActiveSignature('SELECT ROUND(a, b, c, ')?.activeIndex).toBe(1);
  });

  it('returns null outside a known call, after the call closes, and in literals', () => {
    expect(findActiveSignature('SELECT * FROM customers')).toBeNull();
    expect(findActiveSignature('SELECT COUNT(city) ')).toBeNull();
    expect(findActiveSignature('SELECT zzz(')).toBeNull();
    // Masked literal: `'COUNT('` must not open a signature.
    expect(findActiveSignature("SELECT * FROM t WHERE note = 'COUNT('")).toBeNull();
  });

  it('splits the signature around the active argument for rendering', () => {
    const sig = findActiveSignature('SELECT SUBSTRING(name, ');
    expect(sig).not.toBeNull();
    const parts = signatureParts(sig!);
    // The bar shows the DECLARED parameters (`text`), not an echo of what was
    // typed (`name`) — the typed text is already visible in the editor.
    expect(parts.before).toBe('SUBSTRING(text, ');
    expect(parts.active).toBe('start');
    expect(parts.after).toBe(', length) — slice a string');
    expect(parts.text).toBe('SUBSTRING(text, start, length) — slice a string');
  });

  it('renders a single-argument signature with no leading comma', () => {
    const parts = signatureParts(findActiveSignature('SELECT COUNT(')!);
    expect(parts.before).toBe('COUNT(');
    expect(parts.active).toBe('column');
    expect(parts.after).toBe(') — how many non-NULL values');
  });

  it('keeps the string entry point returning the one-line signature', () => {
    expect(signatureHint('SELECT COUNT(')).toBe('COUNT(column) — how many non-NULL values');
    expect(signatureHint('SELECT 1')).toBeNull();
  });
});

});
