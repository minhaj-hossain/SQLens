/**
 * highlightSql — pure grayscale SQL tokenizer for the concept/lesson pages.
 * (Amendment 1, Option 3: structure via weight + lightness, never hue.)
 *
 *   keywords    -> #f2f2f0 (heading white, bold)  .text-code-kw  — pure white banned
 *   identifiers -> #a9a9a3 (mid gray)      .text-code-ident
 *   numbers     -> #a9a9a3 (mid gray)      .text-code-num   (semibold)
 *   punctuation -> #6b6b65 (dim gray)      .text-code-punc
 *   comments    -> #55554f (dim, italic)   .text-code-comment
 *   strings     -> #a9a9a3 (mid gray)      .text-code-str
 *
 * NOTE ON THE PLACEHOLDER LIFECYCLE (this exact setup once leaked raw
 * `___TOKEN_0___` text into the UI): stashed tokens are replaced with
 * `___TOKEN_n___` placeholders, which are themselves all-word-char strings.
 * The final identifier pass must therefore NEVER re-stash a placeholder
 * (guard in each callback), and tokens are restored LIFO (last stashed,
 * first restored) so any nesting would still unwrap correctly.
 */

export const SQL_KEYWORDS = [
  'SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL JOIN',
  'ON', 'GROUP BY', 'HAVING', 'ORDER BY', 'LIMIT', 'OFFSET', 'AS', 'DISTINCT',
  'AND', 'OR', 'NOT', 'IN', 'BETWEEN', 'LIKE', 'ILIKE', 'IS NULL', 'IS NOT NULL',
  'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'ROUND', 'COALESCE',
  'UNION', 'UNION ALL', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'ASC', 'DESC',
  'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM', 'CREATE TABLE', 'DROP TABLE',
  'ALTER TABLE', 'CROSS JOIN', 'INTERSECT', 'EXCEPT', 'NULL', 'WITH',
];

const PLACEHOLDER_RE = /___TOKEN_\d+___/;

export function highlightSql(sql: string): string {
  if (!sql) return '';

  // Escape HTML special characters first (safe tokenization)
  let escaped = sql
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Stash helper: assigns the next placeholder index.
  const tokens: { placeholder: string; html: string }[] = [];
  const stash = (html: string): string => {
    const ph = `___TOKEN_${tokens.length}___`;
    tokens.push({ placeholder: ph, html });
    return ph;
  };

  // 1. Stash HTML entities (from the escaping pass above) with placeholders —
  //    otherwise the word pass splits `&lt;` into `&` + `lt` + `;` spans and
  //    the entity renders as literal text in the UI.
  escaped = escaped.replace(/&amp;|&lt;|&gt;/g, (match) =>
    stash(`<span class="text-code-punc">${match}</span>`),
  );

  // 2. Stash comments with placeholders
  escaped = escaped.replace(/(--[^\n]*)/g, (match) => {
    if (PLACEHOLDER_RE.test(match)) return match;
    return stash(`<span class="text-code-comment italic">${match}</span>`);
  });

  // 2. Stash string literals with placeholders (neutral gray on both themes).
  escaped = escaped.replace(/('(?:[^'\\]|\\.)*')/g, (match) => {
    if (PLACEHOLDER_RE.test(match)) return match;
    return stash(`<span class="text-code-str font-medium">${match}</span>`);
  });

  // 3. SQL Keywords — single-pass combined regex; sorted longest first so
  //    multi-word keywords (e.g. "LEFT JOIN") match before sub-words.
  const sortedKws = [...SQL_KEYWORDS].sort((a, b) => b.length - a.length);
  const kwPattern = sortedKws.map((kw) => kw.replace(/\s+/g, '\\s+')).join('|');
  const kwRegex = new RegExp(`\\b(${kwPattern})\\b`, 'gi');
  escaped = escaped.replace(kwRegex, (match) =>
    stash(`<span class="text-code-kw font-bold">${match}</span>`),
  );

  // 4. Numbers — stash to avoid re-touching (neutral gray on both themes).
  escaped = escaped.replace(/\b(\d+(?:\.\d+)?)\b/g, (match) => {
    if (PLACEHOLDER_RE.test(match)) return match;
    return stash(`<span class="text-code-num font-semibold">${match}</span>`);
  });

  // 5. Remaining words -> identifiers (mid gray); punctuation -> dim gray.
  //    GUARD: never re-stash a placeholder — `___TOKEN_0___` is a valid
  //    identifier match, and re-stashing it hides it from the restore pass.
  escaped = escaped.replace(/([A-Za-z_][A-Za-z0-9_]*|[^\sA-Za-z0-9_])/g, (match) => {
    if (PLACEHOLDER_RE.test(match)) return match;
    if (/[A-Za-z_]/.test(match)) {
      return stash(`<span class="text-code-ident">${match}</span>`);
    }
    return stash(`<span class="text-code-punc">${match}</span>`);
  });

  // 6. Restore stashed tokens LIFO — last stashed, first restored. (With the
  //    guards above no nesting can occur, but LIFO keeps this correct even if
  //    a future stash step forgets the guard.)
  for (let i = tokens.length - 1; i >= 0; i--) {
    escaped = escaped.replace(tokens[i].placeholder, tokens[i].html);
  }

  return escaped;
}
