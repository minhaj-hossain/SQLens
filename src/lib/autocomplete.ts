import { SQL_KEYWORDS } from './highlight-sql';
import { TableSchema } from '../types/database';

/**
 * Context-aware SQL autocomplete suggestions (tracker item 12).
 * Suggestions derive from (a) the clause context at the cursor, (b) the tables
 * actually referenced in the query so far, and (c) the database schema — as a
 * pure function, so it is unit-testable and reusable.
 */

export type SuggestionKind = 'keyword' | 'table' | 'column';

export interface Suggestion {
  text: string;
  type: SuggestionKind;
}

type Ctx = 'statement-start' | 'tables' | 'columns' | 'after-table';

const EXPRESSION_KWS = [
  'SELECT', 'WHERE', 'ON', 'HAVING', 'GROUP BY', 'ORDER BY',
  'SET', 'VALUES', 'AND', 'OR', 'NOT', 'BY',
];

const TABLE_KWS = ['FROM', 'JOIN', 'INSERT INTO', 'INTO', 'UPDATE', 'DELETE FROM'];

const AFTER_TABLE_KWS = [
  'WHERE', 'GROUP BY', 'HAVING', 'ORDER BY', 'LIMIT', 'OFFSET',
  'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'CROSS JOIN', 'ON', 'AS',
  'UNION', 'UNION ALL', 'EXCEPT', 'INTERSECT',
];

const EXPR_CONTINUATION = [
  'AS', 'AND', 'OR', 'NOT', 'IN', 'BETWEEN', 'LIKE', 'IS NULL', 'IS NOT NULL',
  'ASC', 'DESC', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'DISTINCT',
  'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'ROUND', 'COALESCE', 'UPPER', 'LOWER',
  'CONCAT', 'SUBSTRING', 'YEAR', 'MONTH', 'DATEDIFF',
  'ROW_NUMBER', 'RANK', 'DENSE_RANK', 'LAG', 'LEAD',
];

const KW_SET = new Set(SQL_KEYWORDS.map((k) => k.toUpperCase()));
/** FULL JOIN is listed for highlighting but the engine has no executor/parser
 *  support for it — offering it guarantees an error. Excluded here. */
const UNSUPPORTED = new Set(['FULL JOIN']);

/** Mask string literals and comments so their contents never mislead context
 *  detection (e.g. `name = 'SELECT'` must not flip the context). */
function maskLiterals(sql: string): string {
  return sql
    .replace(/--[^\n]*/g, (m) => ' '.repeat(m.length))
    .replace(/'[^']*'/g, (m) => ' '.repeat(m.length));
}

/** Table names already referenced in the query (FROM/JOIN/INTO/UPDATE targets). */
export function referencedTables(queryBeforeCursor: string): string[] {
  const masked = maskLiterals(queryBeforeCursor).toUpperCase();
  const names: string[] = [];
  const re = /\b(DELETE\s+FROM|FROM|INSERT\s+INTO|INTO|JOIN|UPDATE|,)\s+([A-Z_][A-Z0-9_]*)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(masked)) !== null) {
    const t = m[2];
    if (!KW_SET.has(t) && /^[A-Za-z]/.test(t)) names.push(m[2].toLowerCase());
  }
  return Array.from(new Set(names));
}

/** Offset of the LAST structural keyword (matches multi-word forms like
 *  GROUP BY, INSERT INTO, ORDER BY). */
function lastKeywordEnd(masked: string): { kw: string; end: number } {
  let best: { kw: string; end: number } = { kw: '', end: -1 };
  for (const kw of [...EXPRESSION_KWS, ...TABLE_KWS, 'LIMIT', 'OFFSET', ';']) {
    const re = new RegExp(`\\b${kw.replace(' ', '\\s+')}\\b`, 'gi');
    let m: RegExpExecArray | null;
    while ((m = re.exec(masked)) !== null) {
      if (m.index + m[0].length > best.end) {
        best = { kw: kw.toUpperCase(), end: m.index + m[0].length };
      }
    }
  }
  return best;
}

function detectContext(beforeCursor: string, prefix: string): Ctx {
  const masked = maskLiterals(beforeCursor).toUpperCase();
  if (!masked.trim()) return 'statement-start';
  const last = lastKeywordEnd(masked);
  if (!last.kw) return 'statement-start';

  const remainder = masked.slice(last.end);
  const seesExpr = /(WHERE|ON|GROUP\s+BY|HAVING|ORDER\s+BY|SET|LIMIT|VALUES|AND|OR)\b/.test(remainder);

  if (last.kw === 'INSERT INTO' || last.kw === 'INTO') {
    if (remainder.includes('(')) return 'columns';
    return prefix.trim() || !remainder.trim() || /,\s*$/.test(remainder) ? 'tables' : 'after-table';
  }
  if (TABLE_KWS.includes(last.kw)) {
    // Mid-table-name or just after FROM/JOIN / after a comma → keep typing tables.
    if (seesExpr) return 'columns';
    if (prefix.trim() || !remainder.trim() || /,\s*$/.test(remainder)) return 'tables';
    // Completed `<table>` or `<table> <alias>` → next clause/keyword time.
    return 'after-table';
  }
  if (EXPRESSION_KWS.includes(last.kw) || last.kw === 'LIMIT' || last.kw === 'OFFSET') {
    return 'columns';
  }
  return 'tables';
}

/** Resolve a dotted qualifier (`table.` or `alias.`) to real table names. */
function qualifierTables(qualifier: string, beforeCursor: string, schemas: Record<string, TableSchema>): string[] {
  const q = qualifier.toLowerCase();
  if (schemas[q]) return [q];
  const masked = maskLiterals(beforeCursor).toUpperCase();
  const re = /\b(FROM|JOIN|INSERT\s+INTO|INTO)\s+([A-Z_][A-Z0-9_]*)\s+([A-Z_][A-Z0-9_]*)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(masked)) !== null) {
    if (m[3].toUpperCase() === qualifier.toUpperCase()) return [m[2].toLowerCase()];
  }
  return [];
}

function columnSuggestions(
  prefix: string,
  beforeCursor: string,
  schemas: Record<string, TableSchema>,
  fallbackTable?: string,
): Suggestion[] {
  let active: string[];
  const dot = prefix.indexOf('.');
  if (dot >= 0) {
    const q = prefix.slice(0, dot);
    const qT = qualifierTables(q, beforeCursor, schemas);
    active = qT.length > 0 ? qT : [];
  } else {
    active = referencedTables(beforeCursor);
    if (active.length === 0 && fallbackTable) active = [fallbackTable.toLowerCase()];
  }
  const seen = new Set<string>();
  const out: Suggestion[] = [];
  for (const t of active) {
    const s = schemas[t];
    if (!s) continue;
    for (const c of s.columns) {
      const key = c.name.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        out.push({ text: c.name, type: 'column' });
      }
    }
  }
  return out;
}
function keywordSuggestions(ctx: Ctx): Suggestion[] {
  let pool: string[];
  if (ctx === 'statement-start') {
    pool = ['SELECT', 'INSERT INTO', 'UPDATE', 'DELETE FROM', 'CREATE TABLE', 'DROP TABLE', 'ALTER TABLE', 'WITH', 'EXPLAIN'];
  } else if (ctx === 'after-table') {
    pool = AFTER_TABLE_KWS;
  } else if (ctx === 'tables') {
    pool = ['FROM', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'CROSS JOIN', 'ON', 'UNION', 'UNION ALL', 'EXCEPT', 'INTERSECT'];
  } else {
    pool = EXPR_CONTINUATION;
  }
  return pool
    .filter((k) => !UNSUPPORTED.has(k))
    .map((k) => ({ text: k, type: 'keyword' as SuggestionKind }));
}

function tableSuggestions(schemas: Record<string, TableSchema>): Suggestion[] {
  return Object.values(schemas).map((s) => ({ text: s.name, type: 'table' as SuggestionKind }));
}

/**
 * Entry point. `prefix` is the identifier being typed (may be ''), and
 * `queryBeforeCursor` is the full SQL text up to the cursor. Returns up to
 * `limit` suggestions ordered tables → columns → keywords.
 */
export function buildSuggestions(params: {
  prefix: string;
  queryBeforeCursor: string;
  schemas: Record<string, TableSchema>;
  fallbackTable?: string;
  limit?: number;
}): Suggestion[] {
  const { prefix, queryBeforeCursor, schemas, fallbackTable, limit = 6 } = params;
  const ctx = detectContext(queryBeforeCursor, prefix);

  const pool: Suggestion[] =
    ctx === 'columns'
      ? [
          ...columnSuggestions(prefix, queryBeforeCursor, schemas, fallbackTable),
          ...keywordSuggestions('columns'),
        ]
      : ctx === 'after-table'
        ? keywordSuggestions('after-table')
        : [...tableSuggestions(schemas), ...keywordSuggestions(ctx)];

  const dot = prefix.indexOf('.');
  // For a dotted prefix (`c.` or `c.ema`), match against the part after the dot.
  const up = (dot >= 0 ? prefix.slice(dot + 1) : prefix).toUpperCase();
  const filtered = pool.filter((s) => {
    const su = s.text.toUpperCase();
    return su.startsWith(up) && su !== up;
  });

  const seen = new Set<string>();
  const deduped: Suggestion[] = [];
  for (const s of filtered) {
    const key = s.text.toUpperCase();
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(s);
    }
  }

  const rank: Record<SuggestionKind, number> = { table: 0, column: 1, keyword: 2 };
  return deduped.sort((a, b) => rank[a.type] - rank[b.type]).slice(0, limit);
}