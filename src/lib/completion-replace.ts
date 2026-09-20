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
  // When the caret sits AFTER a space the previous token is already finished,
  // so it may only be absorbed when it matches the candidate word-for-word
  // (`INNER ` + `INNER JOIN`). Absorbing a partial first word would delete
  // real input: `JOIN orders o ` + `ON o.customer_id = …` must not eat the
  // `o` alias just because `o` is a prefix of `ON`.
  const finishedToken = /\s$/.test(textBeforeCursor);
  for (let k = words.length; k >= 1; k--) {
    const slice = words.slice(-k);
    const suffix = slice.join(' ');
    if (finishedToken) {
      const su2 = suffix.toUpperCase();
      if (su !== su2 && !su.startsWith(`${su2} `)) continue;
    } else if (!su.startsWith(suffix.toUpperCase())) {
      continue;
    }
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

/**
 * Smart multi-word expressions (schema-derived join keys like
 * `ON o.customer_id = c.customer_id`) must NOT get a trailing space: the very
 * next thing the learner types is ` AND …`, and a trailing space makes the
 * autocomplete prefix empty right after accepting.
 */
export function snippetNeedsSpace(suggestion: string): boolean {
  return !/\s=\s/.test(suggestion);
}

/**
 * Would accepting `suggestion` leave the typed text unchanged?
 *
 * The list opens with the first candidate already selected and `Enter` accepts
 * it, so this guards the everyday writing flow: typing a complete `customers`
 * and pressing Enter must produce a newline, not "accept" a completion that
 * only adds a trailing space (which used to cost two Enters per line and made
 * the last line of the document hard to create — the reason `Enter` was
 * originally turned into a plain newline).
 *
 * Built on `completionReplaceRange`, so dotted (`c.email`) and multi-word
 * (`ORDER B` → `ORDER BY`) prefixes behave exactly as accepting would.
 */
export function isNoOpCompletion(textBefore: string, suggestion: string): boolean {
  const { replaceFrom, insertText } = completionReplaceRange(textBefore, suggestion);
  const typed = textBefore.slice(replaceFrom);
  // Nothing typed yet (`c.`): accepting inserts a real column name.
  if (!typed) return false;
  return typed.toUpperCase() === insertText.toUpperCase();
}

/**
 * Batch 4: ghost text. Returns the not-yet-typed tail of the top suggestion
 * for inline preview (`SEL` + `SELECT` → `ECT`, `c.em` + `email` → `ail`,
 * `ORDER B` + `ORDER BY` → `Y`), or `''` when the suggestion does not extend
 * the typed text (`SLCT` + `SELECT` is a fuzzy match with no safe preview, and
 * a bare `c.` has no token to extend). `Tab`/`ArrowRight` accept the ghost,
 * typing dismisses it. Purely visual — `value` is untouched until accepted.
 */
export function ghostRemainder(typedPrefix: string, suggestion: string): string {
  const typed = typedPrefix.trim();
  if (!typed) return '';
  const dot = typed.lastIndexOf('.');
  const token = dot >= 0 ? typed.slice(dot + 1) : typed;
  if (!token) return '';
  if (!suggestion.toUpperCase().startsWith(token.toUpperCase())) return '';
  return suggestion.slice(token.length);
}

/** Preserve the user's typed casing: `select` + `SELECT` => `select`. */
export function preserveCase(typedPrefix: string, suggestion: string): string {
  const letters = typedPrefix.replace(/[^A-Za-z]/g, '');
  if (!letters) return suggestion;
  const isLower = letters === letters.toLowerCase();
  const isUpper = letters === letters.toUpperCase();
  if (isLower) return suggestion.toLowerCase();
  if (isUpper) return suggestion.toUpperCase();
  return suggestion;
}

export function applyCompletion(
  fullText: string,
  caret: number,
  suggestion: string,
  opts?: { preserveTypedCase?: boolean },
): { next: string; caret: number } {
  const before = fullText.slice(0, caret);
  const after = fullText.slice(caret);
  const { replaceFrom, insertText } = completionReplaceRange(before, suggestion);
  const typed = before.slice(replaceFrom);
  // Default keeps canonical UPPER keywords (existing behaviour); callers can
  // opt into preserveCase via preserveTypedCase for user-typed lowercase.
  const cased = opts?.preserveTypedCase ? preserveCase(typed, insertText) : insertText;
  const insert =
    cased + (snippetNeedsSpace(cased) && shouldAppendSpace(after) ? ' ' : '');
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
  // Batch 4: only genuinely multi-PART skeletons belong here. High-frequency
  // clause keywords (`ORDER BY`, `GROUP BY`) are deliberately NOT snippet keys —
  // hijacking them would insert `ORDER BY column_name` where the learner just
  // wanted the clause, which is the opposite of smooth.
  'CASE WHEN': {
    body: 'CASE\n  WHEN condition THEN result\n  ELSE fallback\nEND',
    placeholders: ['condition', 'result', 'fallback'],
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
