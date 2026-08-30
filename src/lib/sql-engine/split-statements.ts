/**
 * Splits a SQL script on top-level `;` (quote/paren aware) so each statement
 * can be executed in order — multi-statement script support.
 *
 * Single source of truth shared by the executor (script execution), the
 * validator (script-aware table checks), and the Playground (per-statement
 * result display).
 */
export function splitStatements(sql: string): string[] {
  const out: string[] = [];
  let current = '';
  let inString: string | null = null;
  let parenDepth = 0;
  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i];
    if ((ch === "'" || ch === '"') && (i === 0 || sql[i - 1] !== '\\')) {
      if (!inString) inString = ch;
      else if (inString === ch) inString = null;
      current += ch;
      continue;
    }
    if (inString) {
      current += ch;
      continue;
    }
    if (ch === '(') {
      parenDepth++;
      current += ch;
      continue;
    }
    if (ch === ')') {
      parenDepth = Math.max(0, parenDepth - 1);
      current += ch;
      continue;
    }
    if (ch === ';' && parenDepth === 0) {
      if (current.trim()) out.push(current.trim());
      current = '';
      continue;
    }
    current += ch;
  }
  if (current.trim()) out.push(current.trim());
  return out;
}
