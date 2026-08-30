'use client';
/**
 * Shared SQL "blocks" for concept/lesson pages — the grayscale syntax recipe
 * (Amendment 1, Option 3) + the table-card & code-card recipes from the design.
 *
 * Palette: gold = "you are here" ONLY. SQL code is monochrome:
 *   keywords   -> #ffffff (white, weight 700)  -- structure via weight, not hue
 *   identifiers-> #a9a9a3 (mid gray)
 *   punctuation-> #6b6b65 (dim gray)
 *   comments   -> #55554f (dim, italic)
 */
import React from 'react';

const SQL_KEYWORDS = [
  'SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL JOIN',
  'ON', 'GROUP BY', 'HAVING', 'ORDER BY', 'LIMIT', 'OFFSET', 'AS', 'DISTINCT',
  'AND', 'OR', 'NOT', 'IN', 'BETWEEN', 'LIKE', 'ILIKE', 'IS NULL', 'IS NOT NULL',
  'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'ROUND', 'COALESCE',
  'UNION', 'UNION ALL', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'ASC', 'DESC',
  'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM', 'CREATE TABLE', 'DROP TABLE',
];

/**
 * Grayscale SQL tokenizer. Escapes HTML, stashes comments/strings, then
 * colorizes keywords (white, bold), numbers/identifiers (mid gray) and
 * punctuation (dim). Returns an HTML string for a styled <pre>/<code>.
 */
export function highlightSql(sql: string): string {
  if (!sql) return '';

  // Escape HTML special characters first (safe tokenization)
  let escaped = sql
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // 1. Stash comments with placeholders
  const tokens: { placeholder: string; html: string }[] = [];
  escaped = escaped.replace(/(--[^\n]*)/g, (match) => {
    const ph = `___TOKEN_${tokens.length}___`;
    tokens.push({ placeholder: ph, html: `<span class="text-code-comment italic">${match}</span>` });
    return ph;
  });

  // 2. Stash string literals with placeholders
  escaped = escaped.replace(/('(?:[^'\\]|\\.)*')/g, (match) => {
    const ph = `___TOKEN_${tokens.length}___`;
    tokens.push({ placeholder: ph, html: `<span class="text-code-ident font-medium">${match}</span>` });
    return ph;
  });

  // 3. SQL Keywords — single-pass combined regex; sort longest first so
  //    multi-word keywords (e.g. "LEFT JOIN") match before sub-words.
  const sortedKws = [...SQL_KEYWORDS].sort((a, b) => b.length - a.length);
  const kwPattern = sortedKws.map((kw) => kw.replace(/\s+/g, '\\s+')).join('|');
  const kwRegex = new RegExp(`\\b(${kwPattern})\\b`, 'gi');
  escaped = escaped.replace(kwRegex, (match) => {
    const ph = `___TOKEN_${tokens.length}___`;
    tokens.push({
      placeholder: ph,
      html: `<span class="text-code-kw font-bold">${match.toUpperCase()}</span>`,
    });
    return ph;
  });

  // 4. Numbers — also stash to avoid re-touching
  escaped = escaped.replace(/\b(\d+(?:\.\d+)?)\b/g, (match) => {
    const ph = `___TOKEN_${tokens.length}___`;
    tokens.push({ placeholder: ph, html: `<span class="text-code-ident">${match}</span>` });
    return ph;
  });

  // 5. Remaining words -> identifiers (mid gray); punctuation -> dim gray
  escaped = escaped.replace(/([A-Za-z_][A-Za-z0-9_]*|[^\sA-Za-z0-9_])/g, (match) => {
    if (/[A-Za-z_]/.test(match)) {
      const ph = `___TOKEN_${tokens.length}___`;
      tokens.push({ placeholder: ph, html: `<span class="text-code-ident">${match}</span>` });
      return ph;
    }
    const ph = `___TOKEN_${tokens.length}___`;
    tokens.push({ placeholder: ph, html: `<span class="text-code-punc">${match}</span>` });
    return ph;
  });

  // 6. Restore all stashed tokens in a single pass
  tokens.forEach((t) => {
    escaped = escaped.replace(t.placeholder, t.html);
  });

  return escaped;
}

/**
 * Code card — the design's `.code-card` recipe.
 * editor-bg body, uppercase mono title bar with a copy button, optional caption.
 */
export function CodeCard({
  title,
  sql,
  caption,
  copied = false,
  onCopy,
}: {
  title?: string;
  sql: string;
  caption?: string;
  copied?: boolean;
  onCopy?: () => void;
}) {
  return (
    <div className="rounded-xl overflow-hidden border border-border bg-editor-bg shadow-sm">
      <div className="flex items-center justify-between gap-3 px-3.5 py-2 border-b border-border-soft">
        <span className="font-mono text-[10.5px] uppercase tracking-[0.05em] text-text-faint truncate">
          {title || 'SQL'}
        </span>
        {onCopy && (
          <button
            onClick={onCopy}
            className="flex items-center gap-1.5 font-mono text-[11px] text-text-faint hover:text-text transition cursor-pointer px-1.5 py-0.5 rounded hover:bg-surface-2"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              {copied ? (
                <path d="M20 6L9 17l-5-5" />
              ) : (
                <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H8a2 2 0 01-2-2v-2M4 16H2V2h14v2" />
              )}
            </svg>
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        )}
      </div>
      <pre
        className="px-4 py-3.5 font-mono text-[13px] leading-[1.8] text-editor-text whitespace-pre overflow-x-auto"
        dangerouslySetInnerHTML={{ __html: highlightSql(sql) }}
      />
      {caption && (
        <div className="px-4 pb-3 text-xs leading-relaxed text-text-dim">{caption}</div>
      )}
    </div>
  );
}

/**
 * Table card — the design's `.table-card` recipe.
 * - uppercase mono label bar (table name + description).
 * - mono cells, hairline dividers, row hover.
 * - `id`/first column dimmed; highlighted columns bright.
 */
export function DataTable({
  tableName,
  description,
  columns,
  rows,
  highlightedColumns,
}: {
  tableName?: string;
  description?: string;
  columns: string[];
  rows: (string | number | null)[][];
  highlightedColumns?: string[];
}) {
  const hl = new Set(highlightedColumns || []);
  return (
    <div className="rounded-lg overflow-hidden border border-border bg-surface">
      {tableName && (
        <div className="flex items-center justify-between gap-3 px-3.5 py-2 bg-surface-2 border-b border-border-soft">
          <span className="flex items-center gap-1.5 font-mono text-[11.5px] font-semibold text-text">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
              <path d="M3 5h18v14H3zM3 10h18M3 15h18M10 10v9" />
            </svg>
            {tableName}
          </span>
          {description && (
            <span className="font-mono text-[10.5px] text-text-faint whitespace-nowrap text-right">
              {description}
            </span>
          )}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse font-mono text-[12.5px]">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  className={`text-left font-semibold text-text px-3.5 py-2 bg-surface-2 border-b border-border whitespace-nowrap ${
                    hl.has(col) ? 'text-ink bg-done' : ''
                  }`}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-surface-2 transition-colors">
                {row.map((cell, cIdx) => {
                  const col = columns[cIdx];
                  const isHl = hl.has(col);
                  const isId = cIdx === 0 && col.toLowerCase() === 'id';
                  const cellText = cell === null || cell === undefined ? 'NULL' : String(cell);
                  return (
                    <td
                      key={cIdx}
                      className={`px-3.5 py-2 border-b border-border-soft whitespace-nowrap ${
                        isHl
                          ? 'text-text font-semibold'
                          : isId
                          ? 'text-text-faint'
                          : cell === null || cell === undefined
                          ? 'text-text-faint italic'
                          : 'text-text-dim'
                      }`}
                    >
                      {cellText}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}