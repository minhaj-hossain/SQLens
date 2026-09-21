import { describe, expect, it } from 'vitest';
import {
  findMatchingBracket,
  highlightBracketPair,
  structuralParens,
} from '../../src/lib/editor-brackets';
import { highlightSql } from '../../src/lib/highlight-sql';

/**
 * Batch E1 — bracket matching / pair highlighting.
 *
 * The reported failure was a multi-row INSERT: the pair glow went missing (or
 * landed on the wrong row) because the highlight pass counted parentheses with a
 * different rule than the matcher. Both are pinned here against the REAL
 * `highlightSql` output, so the ordinal alignment cannot silently drift.
 */
describe('editor-brackets — multi-row INSERT (Batch E1)', () => {
  // Row 1's literal contains a `(` — one RAW paren that never becomes a
  // punctuation span. That is what used to slide the glow off its bracket.
  const MULTI_ROW = [
    'INSERT INTO notes (body)',
    "VALUES ('a (x)', 1),",
    "       (2, 'b'),",
    "       (3, 'c');",
  ].join('\n');

  const row3Open = MULTI_ROW.indexOf('(2,');
  const row3Close = MULTI_ROW.indexOf(')', row3Open);

  it('pairs the tuple on the caret`s own row (no other row can interfere)', () => {
    expect(findMatchingBracket(MULTI_ROW, row3Open + 1)).toEqual({
      open: row3Open,
      close: row3Close,
    });
    // Same row: the pair must NOT swallow the neighbouring tuples.
    expect(MULTI_ROW.slice(row3Open, row3Close + 1)).not.toContain('\n');
  });

  it('pairs backwards from the caret sitting after that row`s close', () => {
    expect(findMatchingBracket(MULTI_ROW, row3Close + 1)).toEqual({
      open: row3Open,
      close: row3Close,
    });
  });

  it('glows the caret`s tuple, not the paren hidden in an earlier literal', () => {
    const html = highlightSql(MULTI_ROW);
    const painted = highlightBracketPair(
      html,
      MULTI_ROW,
      findMatchingBracket(MULTI_ROW, row3Open + 1),
    );
    expect(painted.match(/bg-func\/25/g)).toHaveLength(2);
    // Four STRUCTURAL parens precede row 3's `(`: `(body)` and the two of row 2.
    // The literal's paren is not one of them, so exactly 4 plain punctuation
    // spans come first — this is the ordinal rule the old pass got wrong (it
    // counted 5 and therefore painted nothing at all).
    const before = painted.slice(0, painted.indexOf('bg-func/25'));
    expect(before.match(/<span class="text-code-punc">[()]<\/span>/g) ?? []).toHaveLength(4);
    // Every structural paren has a plain punctuation span to address.
    const plain = html.match(/<span class="text-code-punc">[()]<\/span>/g) ?? [];
    expect(plain).toHaveLength(structuralParens(MULTI_ROW).length);
  });

  it('pairs a column list that spans several lines', () => {
    const sql = 'INSERT INTO t (\n  a,\n  b\n) VALUES (1, 2);';
    const open = sql.indexOf('(');
    const close = sql.indexOf(')');
    const pair = findMatchingBracket(sql, open + 1);
    expect(pair).toEqual({ open, close });
    expect(sql.slice(pair!.open, pair!.close + 1).split('\n').length).toBe(4);
  });

  it('pairs an IN list that spans several lines', () => {
    const sql = 'SELECT *\nFROM products\nWHERE id IN (\n  1,\n  2,\n  3\n);';
    const open = sql.indexOf('IN (') + 3;
    const close = sql.lastIndexOf(')');
    expect(findMatchingBracket(sql, open + 1)).toEqual({ open, close });
  });
});

describe('editor-brackets — strings, comments and unbalanced input', () => {
  it('ignores parens inside string literals', () => {
    const sql = "INSERT INTO notes (body) VALUES ('has ( and ) inside');";
    // The column list and the tuple: four structural parens, none of them the
    // two that live inside the literal.
    const parens = structuralParens(sql);
    expect(parens).toHaveLength(4);
    expect(parens).not.toContain(sql.indexOf('( and'));
    expect(parens).not.toContain(sql.indexOf(') inside'));
    // The paren inside the literal is NOT a bracket: no pair, no glow.
    expect(findMatchingBracket(sql, sql.indexOf('( and') + 1)).toBeNull();
  });

  it('ignores parens inside -- comments up to the end of the line', () => {
    const sql = 'SELECT 1 -- unmatched ( here\nFROM products;';
    expect(structuralParens(sql)).toEqual([]);
    expect(findMatchingBracket(sql, sql.indexOf('( here') + 1)).toBeNull();
    // A real pair AFTER the comment is still matched.
    const withPair = 'SELECT COUNT(*) -- note\nFROM products;';
    expect(findMatchingBracket(withPair, withPair.indexOf('(') + 1)).toEqual({
      open: withPair.indexOf('('),
      close: withPair.indexOf(')'),
    });
  });

  it('returns null when the caret is not on a bracket or the pair is unbalanced', () => {
    expect(findMatchingBracket('SELECT 1;', 3)).toBeNull();
    expect(findMatchingBracket('', 0)).toBeNull();
    const openOnly = 'SELECT (1 + 2;';
    expect(findMatchingBracket(openOnly, openOnly.indexOf('(') + 1)).toBeNull();
    const closeOnly = 'SELECT 1 + 2);';
    expect(findMatchingBracket(closeOnly, closeOnly.indexOf(')') + 1)).toBeNull();
  });

  it('matches the bracket UNDER the caret as well as the one before it', () => {
    const sql = 'SELECT (1 + 2);';
    const open = sql.indexOf('(');
    const close = sql.indexOf(')');
    expect(findMatchingBracket(sql, open)).toEqual({ open, close });
    expect(findMatchingBracket(sql, close)).toEqual({ open, close });
  });
});

describe('editor-brackets — the highlight pass follows the MATCHER (ordinal fix)', () => {
  it('paints the real pair even when a literal hides an earlier paren', () => {
    // The old pass counted RAW parens: the `(` inside the string shifted the
    // ordinal, so nothing was painted for this pair at all.
    const sql = "SELECT '(' AS note, (1 + 2);";
    const html = highlightSql(sql);
    const open = sql.indexOf('(1 + 2');
    const pair = findMatchingBracket(sql, open + 1);
    expect(pair).toEqual({ open, close: sql.indexOf(')') });

    const painted = highlightBracketPair(html, sql, pair);
    expect(painted.match(/bg-func\/25/g)).toHaveLength(2);
    // The literal keeps its own span untouched.
    expect(painted).toContain('text-code-str');
    expect(html).toContain('<span class="text-code-punc">(</span>');
  });

  it('is a no-op without a pair, and never invents markup for a stale one', () => {
    const sql = 'SELECT (1 + 2);';
    const html = highlightSql(sql);
    expect(highlightBracketPair(html, sql, null)).toBe(html);
    // Unmatched offsets (the sql changed under the memo) leave the HTML alone.
    expect(highlightBracketPair(html, sql, { open: 999, close: 1000 })).toBe(html);
    expect(highlightBracketPair('', sql, { open: 7, close: 12 })).toBe('');
  });

  it('paints both brackets of a nested pair independently', () => {
    const sql = 'SELECT ROUND(COALESCE(a, 0), 2);';
    const innerOpen = sql.indexOf('(a');
    const inner = findMatchingBracket(sql, innerOpen + 1)!;
    const painted = highlightBracketPair(highlightSql(sql), sql, inner);
    expect(painted.match(/bg-func\/25/g)).toHaveLength(2);
    expect(painted).toContain(
      '<span class="text-code-punc text-func bg-func/25 rounded-xs ring-1 ring-func/60">(</span>',
    );
  });
});
