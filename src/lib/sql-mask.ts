/**
 * Shared literal masking for the context/suggestion heuristics.
 *
 * String literals and line comments must never influence clause detection
 * (`WHERE name = 'FROM customers'` is still a WHERE), so every regex-level
 * parser works on a masked copy where those regions become spaces of the
 * exact same length. Coordinates therefore stay comparable with the original
 * text (offset-preserving mask), which is what lets the scope parser map a
 * match back to a caret position.
 */
export function maskLiterals(sql: string): string {
  return sql
    .replace(/--[^\n]*/g, (m) => ' '.repeat(m.length))
    .replace(/'[^']*'/g, (m) => ' '.repeat(m.length));
}