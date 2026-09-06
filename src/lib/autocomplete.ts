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

/** DDL/transaction keywords (Days 25–33) — offered globally so they are
 *  always discoverable once typed. */
const DDL_KWS = [
  'CREATE TABLE', 'DROP TABLE', 'ALTER TABLE', 'ADD COLUMN', 'DROP COLUMN',
  'CREATE INDEX', 'DROP INDEX', 'PRIMARY KEY', 'FOREIGN KEY', 'REFERENCES',
  'NOT NULL', 'DEFAULT', 'AUTO_INCREMENT', 'UNIQUE',
];

const TXN_KWS = ['BEGIN', 'COMMIT', 'ROLLBACK', 'START TRANSACTION'];

const EXPR_CONTINUATION = [
  'AS', 'AND', 'OR', 'NOT', 'IN', 'NOT IN', 'BETWEEN', 'LIKE', 'ILIKE', 'IS NULL', 'IS NOT NULL',
  'ASC', 'DESC', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'DISTINCT',
  // Aggregates
  'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'ROUND', 'COALESCE',
  // Scalar string functions
  'UPPER', 'LOWER', 'TRIM', 'LENGTH', 'CONCAT', 'SUBSTRING',
  // Date functions
  'YEAR', 'MONTH', 'DAY', 'EXTRACT', 'DATEDIFF', 'CURDATE', 'INTERVAL',
  // Window functions
  'ROW_NUMBER', 'RANK', 'DENSE_RANK', 'LAG', 'LEAD', 'PARTITION BY', 'OVER',
  // Boolean literals
  'TRUE', 'FALSE',
];

const KW_SET = new Set(SQL_KEYWORDS.map((k) => k.toUpperCase()));
/** FULL JOIN is listed for highlighting but the engine has no executor/parser
 *  support for it — offering it guarantees an error. Excluded here. */
const UNSUPPORTED = new Set(['FULL JOIN']);

/** Every keyword the engine knows. Each context ranks its own keywords first,
 *  but the full set is ALWAYS in the pool after them — so a `startsWith`
 *  prefix can reach ANY syntax (FROM, ORDER BY, GROUP BY, LIKE, …) no matter
 *  where the cursor sits. This is what makes every keyword discoverable. */
const ALL_KEYWORDS: string[] = [
  ...['SELECT', 'WITH', 'EXPLAIN'],
  ...TABLE_KWS,
  ...AFTER_TABLE_KWS,
  ...EXPR_CONTINUATION,
  ...DDL_KWS,
  ...TXN_KWS,
].filter((k, i, arr) => arr.indexOf(k) === i && !UNSUPPORTED.has(k));

/** First words of every multi-word keyword — a cursor sitting after one of
 *  these (e.g. after `ORDER `, `IS `, `INSERT `) implies ONLY its multi-word
 *  continuations, never the whole keyword universe. */
const MULTI_STARTERS = new Set(
  ALL_KEYWORDS.filter((k) => k.includes(' ')).map((k) => k.split(/\s+/)[0].toUpperCase()),
);

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
  // Context-scoped heads only — this preserves the intentional routing
  // (e.g. NO SELECT after a completed FROM list). The global ALL_KEYWORDS
  // superset is added in buildSuggestions for typed prefixes/continuations.
  let pool: string[];
  if (ctx === 'statement-start') {
    pool = [...['SELECT', 'WITH', 'EXPLAIN'], ...DDL_KWS, ...TXN_KWS, 'FROM', 'WHERE', 'ORDER BY'];
  } else if (ctx === 'after-table') {
    pool = AFTER_TABLE_KWS;
  } else if (ctx === 'tables') {
    pool = [...AFTER_TABLE_KWS, ...TABLE_KWS];
  } else {
    pool = EXPR_CONTINUATION;
  }
  return pool.map((k) => ({ text: k, type: 'keyword' as SuggestionKind }));
}

function tableSuggestions(schemas: Record<string, TableSchema>): Suggestion[] {
  return Object.values(schemas).map((s) => ({ text: s.name, type: 'table' as SuggestionKind }));
}

/** Prefix, inner-word (`JOIN` → `LEFT JOIN`), and compact/fuzzy (`GBY` → `GROUP BY`). */
export function suggestionMatches(text: string, prefix: string): boolean {
  const su = text.toUpperCase();
  const up = prefix.toUpperCase();
  if (!up) return true;
  if (su === up) return false;
  if (su.startsWith(up)) return true;
  const words = su.split(/\s+/);
  if (words.length > 1 && words.some((w) => w !== su && w.startsWith(up))) return true;
  const compact = su.replace(/\s+/g, '');
  const compactUp = up.replace(/\s+/g, '');
  if (compactUp.length >= 2 && compact !== compactUp && compact.startsWith(compactUp)) return true;
  if (compactUp.length >= 3 && isSubsequence(compact, compactUp)) return true;
  return false;
}

function isSubsequence(hay: string, needle: string): boolean {
  let i = 0;
  for (const ch of hay) {
    if (ch === needle[i]) i += 1;
    if (i >= needle.length) return true;
  }
  return false;
}

/** Suggests smart join conditions (table.fk = other.pk) informed by schemas. */
export function suggestJoinCondition(
  beforeCursor: string,
  schemas: Record<string, TableSchema>,
): Suggestion[] {
  const masked = maskLiterals(beforeCursor);
  const match = masked.match(
    /\b(?:LEFT\s+|INNER\s+|RIGHT\s+|CROSS\s+)?JOIN\s+([A-Za-z_][A-Za-z0-9_]*)(?:\s+(?:AS\s+)?([A-Za-z_][A-Za-z0-9_]*))?\s*(?:ON\s*)?$/i,
  );
  if (!match) return [];
  const joinedTable = match[1].toLowerCase();
  const joinedAlias = match[2] || match[1];

  const beforeJoin = masked.slice(0, match.index);
  const re = /\b(?:FROM|(?:LEFT\s+|INNER\s+|RIGHT\s+|CROSS\s+)?JOIN)\s+([A-Za-z_][A-Za-z0-9_]*)(?:\s+(?:AS\s+)?([A-Za-z_][A-Za-z0-9_]*))?/gi;
  const otherTables: { table: string; alias: string }[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(beforeJoin)) !== null) {
    const t = m[1].toLowerCase();
    if (t !== joinedTable && schemas[t]) {
      otherTables.push({ table: t, alias: m[2] || m[1] });
    }
  }

  const sJoined = schemas[joinedTable];
  if (!sJoined) return [];

  const alreadyTypedOn = /\bON\s*$/i.test(masked);
  const prefix = alreadyTypedOn ? '' : 'ON ';
  const suggestions: Suggestion[] = [];

  for (const { table: tOther, alias: aOther } of otherTables) {
    const sOther = schemas[tOther];
    if (!sOther) continue;

    for (const col of sJoined.columns) {
      if (col.foreignKey && col.foreignKey.table.toLowerCase() === tOther) {
        suggestions.push({
          text: `${prefix}${joinedAlias}.${col.name} = ${aOther}.${col.foreignKey.column}`,
          type: 'keyword',
        });
      }
    }
    for (const col of sOther.columns) {
      if (col.foreignKey && col.foreignKey.table.toLowerCase() === joinedTable) {
        suggestions.push({
          text: `${prefix}${aOther}.${col.name} = ${joinedAlias}.${col.foreignKey.column}`,
          type: 'keyword',
        });
      }
    }
    for (const c1 of sJoined.columns) {
      if (c1.name.endsWith('_id')) {
        for (const c2 of sOther.columns) {
          if (c1.name.toLowerCase() === c2.name.toLowerCase()) {
            const candidate = `${prefix}${joinedAlias}.${c1.name} = ${aOther}.${c2.name}`;
            if (!suggestions.some((s) => s.text === candidate)) {
              suggestions.push({ text: candidate, type: 'keyword' });
            }
          }
        }
      }
    }
  }

  return suggestions;
}

/**
 * Entry point. `prefix` is the identifier being typed (may be ''), and
 * `queryBeforeCursor` is the full SQL text up to the cursor. Returns up to
 * `limit` suggestions ordered contextually (columns in column context, tables in table context).
 */
export function buildSuggestions(params: {
  prefix: string;
  queryBeforeCursor: string;
  schemas: Record<string, TableSchema>;
  fallbackTable?: string;
  limit?: number;
}): Suggestion[] {
  const { prefix, queryBeforeCursor, schemas, fallbackTable, limit = 8 } = params;
  const ctx = detectContext(queryBeforeCursor, prefix);

  const dot = prefix.indexOf('.');
  // For a dotted prefix (`c.` or `c.ema`), match against the part after the dot.
  const up = (dot >= 0 ? prefix.slice(dot + 1) : prefix).toUpperCase();
  const stemSource =
    dot >= 0 ? queryBeforeCursor : queryBeforeCursor.slice(0, queryBeforeCursor.length - prefix.length);
  const prevWord = stemSource.match(/([a-zA-Z0-9_]+)\s*$/i)?.[1]?.toUpperCase() ?? '';
  const continuation = !!prevWord && MULTI_STARTERS.has(prevWord);
  const upStem = up && continuation ? `${prevWord} ${up}` : '';

  const joinConds = suggestJoinCondition(queryBeforeCursor, schemas);

  // Context-scoped pool by default; when the user has actually typed a prefix
  // (or left a multi-word keyword starter like `ORDER ` / `IS `), inject the
  // GLOBAL keyword superset so ANY syntax is reachable.
  const ctxPool: Suggestion[] =
    ctx === 'columns'
      ? [
          ...joinConds,
          ...columnSuggestions(prefix, queryBeforeCursor, schemas, fallbackTable),
          ...keywordSuggestions('columns'),
        ]
      : ctx === 'after-table'
        ? [...joinConds, ...keywordSuggestions('after-table')]
        : [...tableSuggestions(schemas), ...keywordSuggestions(ctx)];
  const pool: Suggestion[] =
    up || continuation
      ? [
          ...ctxPool,
          ...ALL_KEYWORDS.filter((k) => !ctxPool.some((s) => s.text.toUpperCase() === k)).map((k) => ({
            text: k,
            type: 'keyword' as SuggestionKind,
          })),
        ]
      : ctxPool;

  const filtered = pool.filter((s) => {
    const su = s.text.toUpperCase();
    if (up && continuation) {
      return suggestionMatches(s.text, up) || (upStem ? suggestionMatches(s.text, upStem) : false);
    }
    if (up) return suggestionMatches(s.text, up);
    // No prefix yet, but a trailing keyword starter (`ORDER `, `IS `, `INSERT `)
    // implies exactly its multi-word continuation(s).
    if (continuation) {
      const cont = `${prevWord} `;
      return su !== cont && su.startsWith(cont);
    }
    return true; // context-scoped pool only
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

  // Dynamic ranking: columns first in column ctx, tables first in table ctx, keywords first otherwise
  const rank: Record<SuggestionKind, number> =
    ctx === 'columns'
      ? { column: 0, keyword: 1, table: 2 }
      : ctx === 'tables'
        ? { table: 0, keyword: 1, column: 2 }
        : { keyword: 0, table: 1, column: 2 };
  return deduped.sort((a, b) => rank[a.type] - rank[b.type]).slice(0, limit);
}