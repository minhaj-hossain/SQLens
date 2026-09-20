import { describe, expect, it } from 'vitest';
import {
  applyCompletion,
  applySnippetCompletion,
  completionPrefix,
  completionReplaceRange,
  ghostRemainder,
  snippetNeedsSpace,
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

  it('does not absorb a finished token that merely prefixes the candidate', () => {
    // Regression: `JOIN orders o ` + `ON …` used to delete the `o` alias
    // because `o` is a prefix of `ON`.
    const before = 'SELECT * FROM customers c JOIN orders o ';
    const r = completionReplaceRange(before, 'ON o.customer_id = c.customer_id');
    expect(r.replaceFrom).toBe(before.length);
    expect(before.slice(r.replaceFrom)).toBe('');
  });

  it('still absorbs an exactly matching finished token', () => {
    const before = 'SELECT * FROM products INNER ';
    const r = completionReplaceRange(before, 'INNER JOIN');
    expect(before.slice(r.replaceFrom).trim()).toBe('INNER');
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

describe('ghost text (Batch 4)', () => {
  it('returns the not-yet-typed tail of an extending suggestion', () => {
    expect(ghostRemainder('SEL', 'SELECT')).toBe('ECT');
    expect(ghostRemainder('se', 'SELECT')).toBe('LECT');
  });

  it('previews only the token after a dotted qualifier', () => {
    expect(ghostRemainder('c.em', 'email')).toBe('ail');
    // A bare `c.` has nothing typed yet: the dropdown is the affordance, an
    // inline ghost would guess one column out of many.
    expect(ghostRemainder('c.', 'email')).toBe('');
  });

  it('is empty when the suggestion does not extend the typed token', () => {
    expect(ghostRemainder('SLCT', 'SELECT')).toBe('');
    expect(ghostRemainder('', 'SELECT')).toBe('');
  });

  it('previews the missing tail of a multi-word continuation', () => {
    expect(ghostRemainder('ORDER B', 'ORDER BY')).toBe('Y');
    expect(ghostRemainder('IS NOT N', 'IS NOT NULL')).toBe('ULL');
  });
});

describe('snippet spacing (Batch 4)', () => {
  it('does not append a space to a schema-derived join condition', () => {
    expect(snippetNeedsSpace('ON o.customer_id = c.customer_id')).toBe(false);
    const sql = 'SELECT * FROM customers c JOIN orders o ';
    const { next } = applyCompletion(sql, sql.length, 'ON o.customer_id = c.customer_id');
    expect(next).toBe('SELECT * FROM customers c JOIN orders o ON o.customer_id = c.customer_id');
    expect(next.endsWith(' ')).toBe(false);
  });

  it('still appends a space to ordinary keywords', () => {
    expect(snippetNeedsSpace('WHERE')).toBe(true);
    const sql = 'SELECT * FROM products ';
    const { next } = applyCompletion(sql, sql.length, 'WHERE');
    expect(next).toBe('SELECT * FROM products WHERE ');
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

  it('expands the Batch 4 CASE WHEN skeleton and selects the first placeholder', () => {
    const caseWhen = applySnippetCompletion('CASE W', 6, 'CASE WHEN');
    expect(caseWhen?.next).toContain('CASE\n  WHEN condition THEN result\n  ELSE fallback\nEND');
    // The FIRST placeholder is pre-selected (the returned list excludes it).
    expect(caseWhen?.placeholders).toEqual(['result', 'fallback']);
    const body = caseWhen?.next ?? '';
    expect(body.slice(caseWhen!.caretStart, caseWhen!.caretEnd)).toBe('condition');
  });

  it('leaves high-frequency clause keywords as plain completions, not skeletons', () => {
    // Regression guard: accepting `ORDER BY` / `GROUP BY` must insert the clause,
    // never a pre-filled `column_name` skeleton.
    expect(applySnippetCompletion('GROUP ', 6, 'GROUP BY')).toBeNull();
    expect(applySnippetCompletion('ORDER B', 7, 'ORDER BY')).toBeNull();
    const sql = 'SELECT * FROM products ';
    expect(applyCompletion(sql, sql.length, 'ORDER BY').next).toBe(
      'SELECT * FROM products ORDER BY ',
    );
  });
});

