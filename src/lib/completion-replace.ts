/**
 * VS Code-style completion: replace the token range being completed, not
 * only the last identifier. Fixes `ORDER B` + `ORDER BY` → `ORDER ORDER BY`
 * and `IS NOT N` + `IS NOT NULL` → `IS IS NOT NULL`.
 */

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Identifier currently being typed, including `alias.` / `alias.col`. */
export function completionPrefix(textBeforeCursor: string): string {
  const dotted = textBeforeCursor.match(
    /([A-Za-z_][A-Za-z0-9_]*)\.([A-Za-z0-9_]*)$/,
  );
  if (dotted) return `${dotted[1]}.${dotted[2]}`;
  return textBeforeCursor.match(/([A-Za-z0-9_]+)$/)?.[1] ?? '';
}

export function completionReplaceRange(
  textBeforeCursor: string,
  suggestion: string,
): { replaceFrom: number; insertText: string } {
  const dotted = textBeforeCursor.match(
    /([A-Za-z_][A-Za-z0-9_]*)\.([A-Za-z0-9_]*)$/,
  );
  if (dotted) {
    return {
      replaceFrom: textBeforeCursor.length - dotted[2].length,
      insertText: suggestion,
    };
  }

  const su = suggestion.toUpperCase();
  const trailing = textBeforeCursor.match(
    /([A-Za-z0-9_]+(?:\s+[A-Za-z0-9_]+)*)\s*$/,
  );
  if (!trailing || trailing.index === undefined) {
    return { replaceFrom: textBeforeCursor.length, insertText: suggestion };
  }

  const words = trailing[1].split(/\s+/).filter(Boolean);
  for (let k = words.length; k >= 1; k--) {
    const slice = words.slice(-k);
    const suffix = slice.join(' ');
    if (!su.startsWith(suffix.toUpperCase())) continue;
    const pattern = new RegExp(
      slice.map(escapeRegExp).join('\\s+') + '\\s*$',
      'i',
    );
    const mm = textBeforeCursor.match(pattern);
    if (mm && mm.index !== undefined) {
      return { replaceFrom: mm.index, insertText: suggestion };
    }
  }

  return { replaceFrom: textBeforeCursor.length, insertText: suggestion };
}

function shouldAppendSpace(after: string): boolean {
  const next = after[0];
  if (!next) return true;
  return !/[\s(),;]/.test(next);
}

export function applyCompletion(
  fullText: string,
  caret: number,
  suggestion: string,
): { next: string; caret: number } {
  const before = fullText.slice(0, caret);
  const after = fullText.slice(caret);
  const { replaceFrom, insertText } = completionReplaceRange(before, suggestion);
  const insert = insertText + (shouldAppendSpace(after) ? ' ' : '');
  const next = fullText.slice(0, replaceFrom) + insert + after;
  return { next, caret: replaceFrom + insert.length };
}

/** Templates inserted instead of the bare keyword. Placeholders are selected in order on Tab. */
export const COMPLETION_SNIPPETS: Record<
  string,
  { body: string; placeholders: string[] }
> = {
  'INSERT INTO': {
    body: 'INSERT INTO table_name (column)\nVALUES (value)',
    placeholders: ['table_name', 'column', 'value'],
  },
  'CREATE TABLE': {
    body: 'CREATE TABLE table_name (\n  id INTEGER PRIMARY KEY\n)',
    placeholders: ['table_name'],
  },
  'LEFT JOIN': {
    body: 'LEFT JOIN table_name ON ',
    placeholders: ['table_name'],
  },
  'INNER JOIN': {
    body: 'INNER JOIN table_name ON ',
    placeholders: ['table_name'],
  },
  'UPDATE': {
    body: 'UPDATE table_name\nSET column = value\nWHERE condition',
    placeholders: ['table_name', 'column', 'value', 'condition'],
  },
  'DELETE FROM': {
    body: 'DELETE FROM table_name\nWHERE condition',
    placeholders: ['table_name', 'condition'],
  },
};

export function applySnippetCompletion(
  fullText: string,
  caret: number,
  keyword: string,
): { next: string; caretStart: number; caretEnd: number; placeholders: string[] } | null {
  const spec = COMPLETION_SNIPPETS[keyword.toUpperCase()];
  if (!spec) return null;
  const before = fullText.slice(0, caret);
  const after = fullText.slice(caret);
  const { replaceFrom } = completionReplaceRange(before, keyword);
  let body = spec.body;
  if (shouldAppendSpace(after) && !body.endsWith(' ') && !body.endsWith('\n')) {
    body += ' ';
  }
  const next = fullText.slice(0, replaceFrom) + body + after;
  const first = spec.placeholders[0];
  const rel = body.indexOf(first);
  const caretStart = rel >= 0 ? replaceFrom + rel : replaceFrom + body.length;
  const caretEnd = rel >= 0 ? caretStart + first.length : caretStart;
  return {
    next,
    caretStart,
    caretEnd,
    placeholders: spec.placeholders.slice(1),
  };
}
