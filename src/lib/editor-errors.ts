import { TableSchema } from '../types/database';
import { SQL_KEYWORDS } from './highlight-sql';

export interface ParsedEditorError {
  rawMessage: string;
  displayMessage: string;
  token?: string;
  didYouMean?: string;
  line?: number;
  col?: number;
  offsetStart?: number;
  offsetEnd?: number;
}

export function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

export function findClosestMatch(
  word: string,
  candidates: string[],
): string | null {
  const clean = word.toLowerCase().trim();
  if (clean.length < 2) return null;
  let best: string | null = null;
  let bestDist = Infinity;
  for (const cand of candidates) {
    const d = levenshtein(clean, cand.toLowerCase());
    if (d < bestDist) {
      bestDist = d;
      best = cand;
    }
  }
  return best && bestDist <= Math.max(2, Math.floor(best.length / 3)) ? best : null;
}

export function parseEditorError(
  rawError: string | null | undefined,
  sql: string,
  schemas: Record<string, TableSchema>,
): ParsedEditorError | null {
  if (!rawError || !rawError.trim()) return null;
  const msg = rawError.trim();

  const allTables = Object.keys(schemas);
  const allColumns = Array.from(
    new Set(Object.values(schemas).flatMap((s) => s.columns.map((c) => c.name))),
  );

  let token: string | undefined;
  let kind: 'table' | 'column' | 'syntax' | 'generic' = 'generic';

  // 1. Check for table errors
  const tblMatch =
    msg.match(/Table\s+['"`]([^'"`]+)['"`]/i) ||
    msg.match(/no such table:\s*([A-Za-z0-9_]+)/i);
  if (tblMatch) {
    token = tblMatch[1];
    kind = 'table';
  }

  // 2. Check for column errors
  if (!token) {
    const colMatch =
      msg.match(/(?:column|Column)\s+['"`]([^'"`]+)['"`]/i) ||
      msg.match(/Unknown column\s+['"`]?([^'"`\s,]+)['"`]?/i) ||
      msg.match(/no such column:\s*([A-Za-z0-9_.]+)/i);
    if (colMatch) {
      token = colMatch[1];
      if (token.includes('.')) token = token.split('.').pop();
      kind = 'column';
    }
  }

  // 3. Check for syntax error near token
  if (!token) {
    const synMatch =
      msg.match(/near\s+['"`]([^'"`\n]+)['"`]/i) ||
      msg.match(/syntax error near\s+['"`]?([^'"`\s\n]+)['"`]?/i) ||
      msg.match(/unexpected token\s+['"`]?([^'"`\s\n]+)['"`]?/i);
    if (synMatch) {
      token = synMatch[1];
      kind = 'syntax';
    }
  }

  // 4. Line matching if reported
  const lineMatch = msg.match(/(?:at|on)?\s*line\s+(\d+)/i);
  let line = lineMatch ? parseInt(lineMatch[1], 10) : undefined;
  let col: number | undefined;
  let offsetStart: number | undefined;
  let offsetEnd: number | undefined;

  if (token && sql) {
    const regex = new RegExp(`\\b${token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    const m = sql.match(regex);
    if (m && m.index !== undefined) {
      offsetStart = m.index;
      offsetEnd = m.index + m[0].length;
      line = sql.slice(0, offsetStart).split('\n').length;
      col = offsetStart - (sql.lastIndexOf('\n', offsetStart - 1) + 1) + 1;
    } else {
      const idx = sql.toLowerCase().indexOf(token.toLowerCase());
      if (idx >= 0) {
        offsetStart = idx;
        offsetEnd = idx + token.length;
        line = sql.slice(0, offsetStart).split('\n').length;
        col = offsetStart - (sql.lastIndexOf('\n', offsetStart - 1) + 1) + 1;
      }
    }
  }

  // "Did you mean?" suggestions
  let didYouMean: string | undefined;
  let displayMessage = msg;

  if (kind === 'table' && token) {
    const best = findClosestMatch(token, allTables);
    if (best) {
      didYouMean = best;
      displayMessage = `Table '${token}' does not exist. Did you mean '${best}'?`;
    }
  } else if (kind === 'column' && token) {
    const best = findClosestMatch(token, allColumns);
    if (best) {
      didYouMean = best;
      displayMessage = `No column named '${token}'. Did you mean '${best}'?`;
    }
  } else if (kind === 'syntax' && token) {
    const best = findClosestMatch(token, [...SQL_KEYWORDS]);
    if (best) {
      didYouMean = best;
      displayMessage = `Syntax error near '${token}'. Did you mean '${best}'?`;
    }
  }

  return {
    rawMessage: msg,
    displayMessage,
    token,
    didYouMean,
    line,
    col,
    offsetStart,
    offsetEnd,
  };
}
