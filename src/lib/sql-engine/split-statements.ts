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
  let hasNewlineSinceLastToken = false;

  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i];
    if ((ch === "'" || ch === '"') && (i === 0 || sql[i - 1] !== '\\')) {
      if (!inString) inString = ch;
      else if (inString === ch) inString = null;
      current += ch;
      hasNewlineSinceLastToken = false;
      continue;
    }
    if (inString) {
      current += ch;
      continue;
    }
    if (ch === '\n' || ch === '\r') {
      hasNewlineSinceLastToken = true;
      current += ch;
      continue;
    }
    if (ch === '(') {
      parenDepth++;
      current += ch;
      hasNewlineSinceLastToken = false;
      continue;
    }
    if (ch === ')') {
      parenDepth = Math.max(0, parenDepth - 1);
      current += ch;
      hasNewlineSinceLastToken = false;
      continue;
    }
    if (ch === ';' && parenDepth === 0) {
      if (hasRealSql(current)) out.push(current.trim());
      current = '';
      hasNewlineSinceLastToken = false;
      continue;
    }

    // Lenient boundary detection: if parenDepth === 0, we're on a new line,
    // and a standalone transaction statement (COMMIT, ROLLBACK, BEGIN, START TRANSACTION)
    // starts here, split the preceding statement even if it lacked a trailing semicolon.
    if (parenDepth === 0 && hasNewlineSinceLastToken && hasRealSql(current)) {
      const remaining = sql.slice(i);
      const match = remaining.match(/^(?:COMMIT|ROLLBACK|BEGIN|START\s+TRANSACTION)\b/i);
      if (match) {
        out.push(current.trim());
        current = '';
        hasNewlineSinceLastToken = false;
      }
    }

    if (ch !== ' ' && ch !== '\t') {
      hasNewlineSinceLastToken = false;
    }
    current += ch;
  }
  if (hasRealSql(current)) out.push(current.trim());
  return out;
}

/** A chunk is a real statement only if it contains actual SQL (non-comment). */
function hasRealSql(chunk: string): boolean {
  // Strip `-- …` and `# …` line comments plus `/* … */` block comments, then test
  // for non-whitespace. `#` must be handled here too: the parser's `stripComments`
  // recognises it, so a `#`-only chunk was treated as a real statement, pushed as
  // one, and then failed with "Empty query" instead of being ignored.
  const withoutLine = chunk.replace(/--[^\n]*/g, ' ').replace(/#[^\n]*/g, ' ');
  const withoutBlock = withoutLine.replace(/\/\*[\s\S]*?\*\//g, ' ');
  return withoutBlock.trim().length > 0;
}
