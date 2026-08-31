import { describe, it, expect } from 'vitest';
import {
  parseEvalLine,
  isEvalLine,
  splitEvalBlock,
} from '../../src/lib/parse-truth-eval';

/**
 * Regression tests for the truth-eval renderer: curriculum modules write
 * boolean-evaluation content as plain text inside explanation strings. The
 * parser must turn exactly those lines into visual rows — and never hijack
 * ordinary prose that merely mentions TRUE/FALSE.
 */

const TRUTH_BULLET = '• `TRUE AND TRUE` ---> **TRUE** ✓';
const TRUTH_BULLET_FALSE = '• `FALSE AND FALSE` ---> **FALSE** ✕';

const NUMBERED_ROW = '1. Rahim: (CSE = TRUE) AND (21 = TRUE) → TRUE ✓';
const NUMBERED_ROW_FALSE = '2. Karim: (EEE = FALSE) → FALSE ✕';
const NOT_CHAIN = "1. Rahim: NOT ('Dhaka' = 'Dhaka') → NOT (TRUE) → FALSE ✕";
const PAREN_ROW = 'Wireless Mouse ($15.99 > 50.00): FALSE ✕';
const PAREN_ROW_TRUE = "Rahim ('Dhaka' = 'Dhaka'): TRUE ✓";
const ROW_NO_NUM = 'Row 1 (21 = 21): TRUE ✓';

const PROSE_CASE = 'Wireless Mouse has 40 units → FALSE. USB-C Cable has 0 → TRUE.';
const PROSE_SENTENCE =
  "1. First, SQL evaluates the inner condition: `(city = 'Dhaka')` ---> `TRUE` or `FALSE`.";

describe('parseEvalLine — truth-table rows', () => {
  it('parses the AND logic table bullet', () => {
    expect(parseEvalLine(TRUTH_BULLET)).toEqual({
      kind: 'truth',
      left: 'TRUE',
      op: 'AND',
      right: 'TRUE',
      verdict: 'TRUE',
      mark: '✓',
    });
  });

  it('parses the FALSE bullet with the ✕ mark', () => {
    const row = parseEvalLine(TRUTH_BULLET_FALSE);
    expect(row).toMatchObject({ kind: 'truth', verdict: 'FALSE', mark: '✕' });
  });

  it('rejects a bare boolean word with no operator', () => {
    expect(parseEvalLine('• TRUE')).toBeNull();
  });
});

describe('parseEvalLine — subject evaluation rows', () => {
  it('parses a numbered compound row (AND of two conditions)', () => {
    expect(parseEvalLine(NUMBERED_ROW)).toEqual({
      kind: 'row',
      index: 1,
      subject: 'Rahim',
      chain: ['(CSE = TRUE) AND (21 = TRUE)'],
      verdict: 'TRUE',
      mark: '✓',
    });
  });

  it('parses a numbered FALSE row', () => {
    expect(parseEvalLine(NUMBERED_ROW_FALSE)).toMatchObject({
      kind: 'row',
      index: 2,
      subject: 'Karim',
      verdict: 'FALSE',
      mark: '✕',
    });
  });

  it('splits multi-step NOT chains into chain segments', () => {
    expect(parseEvalLine(NOT_CHAIN)).toEqual({
      kind: 'row',
      index: 1,
      subject: 'Rahim',
      chain: ["NOT ('Dhaka' = 'Dhaka')", 'NOT (TRUE)'],
      verdict: 'FALSE',
      mark: '✕',
    });
  });

  it('parses the "Subject (expr): VERDICT" colon form', () => {
    expect(parseEvalLine(PAREN_ROW)).toEqual({
      kind: 'row',
      index: null,
      subject: 'Wireless Mouse',
      chain: ['($15.99 > 50.00)'],
      verdict: 'FALSE',
      mark: '✕',
    });
  });

  it('parses quoted-value colon rows as TRUE', () => {
    expect(parseEvalLine(PAREN_ROW_TRUE)).toMatchObject({
      kind: 'row',
      subject: 'Rahim',
      chain: ["('Dhaka' = 'Dhaka')"],
      verdict: 'TRUE',
      mark: '✓',
    });
  });

  it('parses "Row N (expr)" without leading numbering', () => {
    expect(parseEvalLine(ROW_NO_NUM)).toMatchObject({
      kind: 'row',
      index: null,
      subject: 'Row 1',
      chain: ['(21 = 21)'],
      verdict: 'TRUE',
    });
  });
});

describe('parseEvalLine — prose safety', () => {
  it('ignores mid-sentence arrows ending in a period', () => {
    expect(parseEvalLine(PROSE_CASE)).toBeNull();
  });

  it('ignores prose sentences that mention TRUE or FALSE', () => {
    expect(parseEvalLine(PROSE_SENTENCE)).toBeNull();
  });

  it('ignores ordinary explanation text', () => {
    expect(
      parseEvalLine('`AND` narrows down your results — every condition must be `TRUE`.'),
    ).toBeNull();
    expect(parseEvalLine('Output: Standard. Wrong.')).toBeNull();
  });

  it('isEvalLine mirrors parseEvalLine', () => {
    expect(isEvalLine(NUMBERED_ROW)).toBe(true);
    expect(isEvalLine(PROSE_CASE)).toBe(false);
  });
});

describe('splitEvalBlock — explanation items', () => {
  const AND_LOGIC_ITEM = [
    '### 1. AND Logic Table',
    '• `TRUE AND TRUE` ---> **TRUE** ✓',
    '• `TRUE AND FALSE` ---> **FALSE** ✕',
    '• `FALSE AND TRUE` ---> **FALSE** ✕',
    '• `FALSE AND FALSE` ---> **FALSE** ✕',
  ].join('\n');

  it('parses the full AND logic table item with its heading label', () => {
    const block = splitEvalBlock(AND_LOGIC_ITEM);
    expect(block).not.toBeNull();
    expect(block?.label).toBe('AND Logic Table');
    expect(block?.rows).toHaveLength(4);
    expect(block?.rows.every((r) => r.kind === 'truth')).toBe(true);
    expect(block?.otherLines).toHaveLength(0);
  });

  it('parses a pure row-by-row step explanation (no heading)', () => {
    const item = [
      '1. Rahim: (CSE = TRUE) AND (21 = TRUE) → TRUE ✓',
      '2. Karim: (EEE = FALSE) → FALSE ✕',
      '3. Ayesha: (CSE = TRUE) AND (20 = FALSE) → FALSE ✕',
    ].join('\n');
    const block = splitEvalBlock(item);
    expect(block).not.toBeNull();
    expect(block?.label).toBeNull();
    expect(block?.rows).toHaveLength(3);
    expect(block?.rows.every((r) => r.kind === 'row')).toBe(true);
  });

  it('requires at least 2 rows before hijacking an item', () => {
    expect(splitEvalBlock('### Heading\n' + TRUTH_BULLET)).toBeNull();
    expect(splitEvalBlock('Just one verdict line: `x = 1` → TRUE ✓')).toBeNull();
  });

  it('skips code fences entirely', () => {
    const fenced = ['```sql', '-- ✕ broken ordering', 'SELECT 1;', '```'].join('\n');
    expect(splitEvalBlock(fenced)).toBeNull();
  });

  it('keeps non-eval companion lines as prose', () => {
    const item = [
      '### 1. Mixed',
      'Some prose line about the table.',
      '• `TRUE AND TRUE` ---> **TRUE** ✓',
      '• `TRUE AND FALSE` ---> **FALSE** ✕',
    ].join('\n');
    const block = splitEvalBlock(item);
    expect(block?.rows).toHaveLength(2);
    expect(block?.otherLines).toEqual(['Some prose line about the table.']);
  });
});

