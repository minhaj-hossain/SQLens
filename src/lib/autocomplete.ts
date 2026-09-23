import { SQL_KEYWORDS } from './highlight-sql';
import { SQL_DATA_TYPES } from './sql-keywords';
import { TableSchema } from '../types/database';
import { maskLiterals } from './sql-mask';
import { connectedTables, parseQueryScope, QueryScope } from './sql-scope';

/**
 * Context-aware SQL autocomplete suggestions (tracker item 12).
 * Suggestions derive from (a) the clause context at the cursor, (b) the tables
 * actually referenced in the query so far, and (c) the database schema — as a
 * pure function, so it is unit-testable and reusable.
 *
 * Ranking is score-based (Batch 2): exact prefix > word-start > fuzzy
 * subsequence > contains, with context-type and recency bonuses on top — so
 * `slct` still reaches `SELECT` and repeated picks float to the top.
 *
 * Scope intelligence (Batch 3): `parseQueryScope` supplies FROM/JOIN
 * aliases and CTE names/columns, so dotted prefixes resolve to the aliased
 * table, FK-connected tables sort first after `JOIN`, `ON a.fk = b.pk`
 * conditions are offered as one-key accepts, and CTEs behave like tables.
 */

export type SuggestionKind = 'keyword' | 'table' | 'column' | 'snippet';

/** Optional recency signal: +1 per previous user pick of this exact text. */
export type HistoryBoost = (text: string) => number;

export interface Suggestion {
  text: string;
  type: SuggestionKind;
  /** One-line explanation shown in the dropdown (Batch 4: learning-app docs). */
  doc?: string;
}

/**
 * Short teaching docs for the suggestions learners reach for most. Rendered
 * as the right-hand annotation in the dropdown; intentionally one line so it
 * fits beside the item without wrapping.
 */
export const SUGGESTION_DOCS: Record<string, string> = {
  SELECT: 'picks the columns to return',
  FROM: 'names the table(s) to read',
  WHERE: 'filters rows before grouping',
  'GROUP BY': 'collapses rows into groups',
  'ORDER BY': 'sorts the final result',
  HAVING: 'filters groups after GROUP BY',
  LIMIT: 'caps how many rows come back',
  JOIN: 'combines rows of two tables',
  'INNER JOIN': 'keeps only matching rows',
  'LEFT JOIN': 'keeps every left-table row',
  'RIGHT JOIN': 'keeps every right-table row',
  'CROSS JOIN': 'every left × right combination',
  ON: 'states the join match condition',
  'UNION': 'stacks two result sets',
  'UNION ALL': 'stacks without de-duplicating',
  DISTINCT: 'removes duplicate rows',
  COUNT: 'counts rows or non-NULL values',
  SUM: 'adds numeric values',
  AVG: 'averages numeric values',
  MIN: 'smallest value in the group',
  MAX: 'largest value in the group',
  COALESCE: 'first non-NULL argument',
  ROUND: 'rounds a number to N digits',
  'IS NULL': 'true when the value is missing',
  'IS NOT NULL': 'true when a value exists',
  LIKE: 'pattern match with % wildcard',
  ILIKE: 'case-insensitive LIKE',
  'IN': 'matches any value in a list',
  'NOT IN': 'excludes values in a list',
  BETWEEN: 'inclusive range check',
  CASE: 'row-by-row if/else expression',
  ROW_NUMBER: 'sequential per-partition number',
  RANK: 'order rank, ties share a rank',
  WITH: 'defines a named CTE (subquery)',
  AS: 'aliases a table, column, or CTE',
  EXPLAIN: 'shows how the query is planned',
  'INSERT INTO': 'adds new rows',
  UPDATE: 'changes existing rows',
  'DELETE FROM': 'removes rows',
  'CREATE TABLE': 'defines a new table',
  'DROP TABLE': 'removes a table',
  'ALTER TABLE': 'changes a table definition',
  'PRIMARY KEY': 'uniquely identifies each row',
  'FOREIGN KEY': 'links a column to another table',
  REFERENCES: 'names the parent table/column',
  'NOT NULL': 'rejects missing values',
  'CREATE INDEX': 'speeds up lookups on a column',
  CHECK: 'enforces a rule on every row',
  CONSTRAINT: 'names a table rule (optional)',
  'IF NOT EXISTS': 'skip creation when it already exists',
  'IF EXISTS': 'no error when the object is missing',
  'OR REPLACE': 'overwrites the view in place',
  'CREATE VIEW': 'saves a query under a name',
  'DROP VIEW': 'removes a saved query',
  'CREATE OR REPLACE VIEW': 'updates a saved query in place',
  EXISTS: 'true when the subquery returns rows',
  'NOT EXISTS': 'true when the subquery returns none',
  SAVEPOINT: 'marks a rollback point inside a transaction',
  'ROLLBACK TO SAVEPOINT': 'undoes back to a marked point',
  'WITH RECURSIVE': 'a CTE that references itself',
  // Data types (Workstream C)
  INT: 'whole numbers / IDs',
  INTEGER: 'whole numbers (INT synonym)',
  BIGINT: 'very large whole numbers',
  VARCHAR: 'variable-length text',
  CHAR: 'fixed-length text',
  TEXT: 'long unbounded text',
  DECIMAL: 'exact fixed-point numbers (money)',
  NUMERIC: 'exact fixed-point numbers',
  FLOAT: 'approximate decimal (avoid for money)',
  DOUBLE: 'approximate decimal (avoid for money)',
  REAL: 'approximate decimal (avoid for money)',
  DATE: 'calendar day (YYYY-MM-DD)',
  DATETIME: 'date + time of day',
  TIMESTAMP: 'date + time point',
  TIME: 'time of day',
  BOOLEAN: 'true / false flag',
  BOOL: 'true / false flag',
  JSON: 'structured JSON document',
  ENUM: 'fixed set of allowed strings',
  BEGIN: 'opens a transaction',
  COMMIT: 'saves the open transaction',
  ROLLBACK: 'undoes the open transaction',
};

/** Docs lookup that also covers join-condition snippets. */
export function suggestionDoc(text: string): string | undefined {
  const up = text.trim().toUpperCase();
  if (SUGGESTION_DOCS[up]) return SUGGESTION_DOCS[up];
  if (/^ON\s+[A-Za-z_][\w.]*\s*=\s*[A-Za-z_][\w.]*$/i.test(text.trim())) {
    return 'suggested join key from the schema';
  }
  return undefined;
}

export type SuggestionContext =
  | 'statement-start'
  | 'tables'
  | 'columns'
  | 'after-table'
  | 'ddl-columns'
  | 'ddl-modifier';
type Ctx = SuggestionContext;

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
  'NOT NULL', 'DEFAULT', 'AUTO_INCREMENT', 'UNIQUE', 'CHECK', 'CONSTRAINT',
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
  // Workstream C: the canonical vocabulary (data types, DDL modifiers,
  // CHECK/EXISTS/SAVEPOINT/VIEW forms, …) joins the reachability pool so
  // every blessed keyword is prefix-reachable from any cursor position.
  ...SQL_KEYWORDS,
  // Batch 4: a multi-word TEMPLATE starter. Listing it here (instead of a
  // separate pool) gives it the same reachability contract as any keyword:
  // `CASE ` is a MULTI_STARTERS word, so typing it injects the candidate.
  'CASE WHEN',
].filter((k, i, arr) => arr.indexOf(k) === i && !UNSUPPORTED.has(k));

/** Global reachability pool: every keyword (templates included). */
const GLOBAL_POOL: string[] = ALL_KEYWORDS;

/** First words of every multi-word keyword — a cursor sitting after one of
 *  these (e.g. after `ORDER `, `IS `, `INSERT `) implies ONLY its multi-word
 *  continuations, never the whole keyword universe. */
/** First words that must NOT hijack the empty-prefix pool (Workstream C):
 *  `OR ` is overwhelmingly expression use (`OR REPLACE` stays reachable by
 *  typing its own prefix), and `WITH ` must keep offering its normal context
 *  rather than collapsing to only `WITH RECURSIVE`. */
const NON_STARTER_FIRST_WORDS = new Set(['OR', 'WITH']);

const MULTI_STARTERS = new Set(
  ALL_KEYWORDS.filter((k) => k.includes(' '))
    .map((k) => k.split(/\s+/)[0].toUpperCase())
    .filter((w) => !NON_STARTER_FIRST_WORDS.has(w)),
);

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

/**
 * Suggestion context at a cursor position (`tables` right after FROM, `columns`
 * in an expression, …), classified WITHOUT building the suggestion pool.
 * Exposed for telemetry, which needs to label a keystroke cheaply.
 */
export function suggestionContext(prefix: string, queryBeforeCursor: string): SuggestionContext {
  return detectContext(queryBeforeCursor, prefix);
}

function detectContext(beforeCursor: string, prefix: string): Ctx {
  const masked = maskLiterals(beforeCursor).toUpperCase();
  if (!masked.trim()) return 'statement-start';

  // ---- Workstream C: DDL cursor states ------------------------------------
  // Inside a CREATE TABLE column list (paren depth 1) or a single ALTER ...
  // ADD COLUMN clause → types/constraints pool (ddl-columns). Deeper parens
  // (CHECK (…)) are expression positions. A CREATE with no '(' yet or a DROP
  // with no ';' yet gets the idempotence modifier (IF [NOT] EXISTS) ranked
  // first (ddl-modifier).
  const region = ddlRegionStart(masked);
  if (region) {
    const seg = masked.slice(region.start);
    let depth = 0;
    for (const ch of seg) {
      if (ch === '(') depth++;
      else if (ch === ')') depth = Math.max(0, depth - 1);
    }
    if (depth > 1) return 'columns';
    if (depth === 1) return 'ddl-columns';
    if (region.kind === 'add') return 'ddl-columns';
    if (!seg.includes('(')) return 'ddl-modifier';
    // Fully parenthesized CREATE — statement complete; fall through.
  }
  if (/\bDROP\s+TABLE\b[^;]*$/i.test(masked)) return 'ddl-modifier';

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

/** Start offset of the DDL definition region the cursor sits in — the later
 *  of CREATE TABLE / ADD COLUMN (Workstream C). */
function ddlRegionStart(masked: string): { start: number; kind: 'create' | 'add' } | null {
  const createIdx = masked.lastIndexOf('CREATE TABLE');
  const addIdx = masked.lastIndexOf('ADD COLUMN');
  if (addIdx > createIdx && addIdx >= 0) return { start: addIdx, kind: 'add' };
  if (createIdx >= 0) return { start: createIdx, kind: 'create' };
  return null;
}

/** Text of the column definition currently being typed: after the first '('
 *  of the CREATE list / after the ADD COLUMN keywords, re-anchored on every
 *  column-separator comma (depth 1 inside CREATE, depth 0 after ADD). */
function currentDdlSegment(
  masked: string,
  region: { start: number; kind: 'create' | 'add' },
): string {
  const seg = masked.slice(region.start);
  let depth = 0;
  let anchor = 0;
  for (let i = 0; i < seg.length; i++) {
    const ch = seg[i];
    if (ch === '(') {
      depth++;
      if (depth === 1 && region.kind === 'create') anchor = i + 1;
    } else if (ch === ')') {
      depth = Math.max(0, depth - 1);
    } else if (
      ch === ',' &&
      ((region.kind === 'create' && depth === 1) || (region.kind === 'add' && depth === 0))
    ) {
      anchor = i + 1;
    }
  }
  return seg.slice(anchor);
}

/** Constraint keywords offered inside a column definition (Workstream C). */
const DDL_COLUMN_CONSTRAINTS = [
  'NOT NULL', 'DEFAULT', 'PRIMARY KEY', 'UNIQUE', 'CHECK', 'REFERENCES',
  'AUTO_INCREMENT', 'FOREIGN KEY', 'CONSTRAINT',
];

/** Pool for ddl-columns: types first until the current definition already
 *  declares one, then constraints first (types stay prefix-reachable). */
function ddlColumnPool(beforeCursor: string): Suggestion[] {
  const masked = maskLiterals(beforeCursor).toUpperCase();
  const region = ddlRegionStart(masked);
  const seg = (region ? currentDdlSegment(masked, region) : '').replace(/^ADD\s+COLUMN\s+/i, '');
  const m = /^[`"]?[\w]+[`"]?\s+([A-Z_]+)/.exec(seg);
  const typeSet = new Set(SQL_DATA_TYPES);
  const typeDeclared = m !== null && typeSet.has(m[1]);
  const kw = (k: string): Suggestion => ({ text: k, type: 'keyword' });
  const types = SQL_DATA_TYPES.map(kw);
  const constraints = DDL_COLUMN_CONSTRAINTS.map(kw);
  return typeDeclared ? [...constraints, ...types] : [...types, ...constraints];
}

/** The IF [NOT] EXISTS modifier for a ddl-modifier cursor (DROP vs CREATE). */
function ddlModifierSuggestion(beforeCursor: string): Suggestion {
  const masked = maskLiterals(beforeCursor).toUpperCase();
  const isDrop = /\bDROP\s+TABLE\b[^;]*$/i.test(masked);
  return { text: isDrop ? 'IF EXISTS' : 'IF NOT EXISTS', type: 'keyword' };
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

/** Column names a CTE exposes at the cursor (Batch 3). */
function cteColumnSuggestions(cteName: string, scope: QueryScope): Suggestion[] {
  const cols = scope.cteColumns[cteName.toLowerCase()] ?? [];
  return cols.map((name) => ({ text: name, type: 'column' as SuggestionKind }));
}

function columnSuggestions(
  prefix: string,
  beforeCursor: string,
  schemas: Record<string, TableSchema>,
  fallbackTable?: string,
): Suggestion[] {
  const scope = parseQueryScope(beforeCursor);
  let active: string[];
  const dot = prefix.indexOf('.');
  if (dot >= 0) {
    const q = prefix.slice(0, dot);
    const qT = qualifierTables(q, beforeCursor, schemas);
    if (qT.length > 0) {
      active = qT;
    } else if (scope.cteColumns[q.toLowerCase()]) {
      // `WITH recent AS (…) … WHERE recent.` — CTE columns only.
      return cteColumnSuggestions(q, scope);
    } else {
      // Alias resolution fallback: any FROM/JOIN alias in scope (handles
      // `AS` aliases, multi-join chains, aliases not matching the regex path).
      const scoped = scope.tables.filter((t) => t.alias.toLowerCase() === q.toLowerCase());
      active = scoped.length > 0 ? scoped.map((t) => t.table) : [];
    }
  } else {
    active = referencedTables(beforeCursor);
    if (active.length === 0 && fallbackTable) active = [fallbackTable.toLowerCase()];
  }
  const seen = new Set<string>();
  const out: Suggestion[] = [];
  const push = (name: string) => {
    const key = name.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ text: name, type: 'column' });
  };
  // CTE columns lead in a non-dotted column context: they are the narrowest,
  // most likely projection the learner is reaching for.
  if (dot < 0) {
    for (const cte of scope.cteNames) {
      for (const c of scope.cteColumns[cte.toLowerCase()] ?? []) push(c);
    }
  }
  for (const t of active) {
    const s = schemas[t];
    if (!s) continue;
    for (const c of s.columns) push(c.name);
  }
  return out;
}
function keywordSuggestions(ctx: Ctx): Suggestion[] {
  // Context-scoped heads only — this preserves the intentional routing
  // (e.g. NO SELECT after a completed FROM list). The global ALL_KEYWORDS
  // superset is added in buildSuggestions for typed prefixes/continuations.
  // (ddl contexts are served by ddlColumnPool / ddlModifierSuggestion at the
  // buildSuggestions call site — they never route through here.)
  if (ctx === 'ddl-columns' || ctx === 'ddl-modifier') return [];
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

/**
 * Table pool for `FROM`/`JOIN` positions (Batch 3 ordering):
 * CTE names first (they are defined in-text, hence locally relevant), then
 * FK-connected tables, then the rest of the schema. Base tables already in
 * scope are dropped by `connectedTables` so `JOIN |` never re-offers the
 * `FROM` table — joining a table to itself is the rare case.
 */
function tableSuggestions(
  schemas: Record<string, TableSchema>,
  scope?: QueryScope,
): Suggestion[] {
  const out: Suggestion[] = [];
  const seen = new Set<string>();
  for (const name of scope?.cteNames ?? []) {
    seen.add(name.toLowerCase());
    out.push({ text: name, type: 'table' });
  }
  const base = (scope?.tables ?? []).map((t) => t.table);
  const order =
    base.length > 0
      ? connectedTables(base, schemas)
      : Object.keys(schemas).map((t) => t.toLowerCase());
  for (const name of order) {
    if (seen.has(name)) continue;
    const s = schemas[name];
    if (!s) continue;
    seen.add(name);
    out.push({ text: s.name, type: 'table' });
  }
  return out;
}

/** Prefix, inner-word (`JOIN` → `LEFT JOIN`), and compact/fuzzy (`GBY` → `GROUP BY`). */
export function suggestionMatches(text: string, prefix: string): boolean {
  if (!prefix) return true;
  const fullMatch = scoreSuggestion(text, prefix) > 0;
  if (fullMatch) return true;
  // Multi-word continuation: `ORDER B` / `INNER JO` imply the full keyword.
  const up = prefix.toUpperCase();
  const stem = up.includes(' ') ? up.slice(0, up.lastIndexOf(' ') + 1) : '';
  if (stem && text.toUpperCase().startsWith(stem)) {
    const tail = up.slice(stem.length);
    const candidateTail = text.toUpperCase().slice(stem.length);
    if (tail && (candidateTail.startsWith(tail) || scoreSuggestion(candidateTail, tail) > 0)) return true;
  }
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

/**
 * Score-based ranking (Batch 2). Higher wins; 0 means "no match".
 *
 * Tiers: exact-prefix 100 > word-start 80 > compact-prefix 70 >
 * fuzzy-subsequence 50 > contains 20. Single-char prefixes only match via
 * exact-prefix/word-start (no fuzzy noise). Multi-word candidates also match
 * against their compact form (`GROUPBY` ← `GBY`).
 */
export function scoreSuggestion(text: string, prefix: string): number {
  const su = text.toUpperCase();
  const up = prefix.toUpperCase().trim();
  if (!up) return 1;
  if (su === up) return 0;
  if (su.startsWith(up)) return 100 - Math.min(su.length - up.length, 40);
  const words = su.split(/\s+/);
  if (words.length > 1 && words.some((w) => w !== su && w.startsWith(up))) {
    return 80 - Math.min(su.length - up.length, 30);
  }
  const compact = su.replace(/\s+/g, '');
  const compactUp = up.replace(/\s+/g, '');
  if (compactUp.length >= 2 && compact !== compactUp && compact.startsWith(compactUp)) {
    return 70 - Math.min(compact.length - compactUp.length, 25);
  }
  if (up.length >= 2 && su.includes(up)) return 20;
  if (compactUp.length >= 3 && isSubsequence(compact, compactUp)) return 50;
  if (compactUp.length >= 2 && isSubsequence(compact, compactUp) && prefixIncludesTypoPair(compact, compactUp)) {
    return 50;
  }
  return 0;
}

/** True when the fuzzy subsequence has exactly one adjacent transposition or
 *  one substitution vs the candidate compact form — i.e. a plausible typo
 *  (`slct`→`SELECT`, `whre`→`WHERE`, `frm`→`FROM`, `usr` subsequence). */
function prefixIncludesTypoPair(compact: string, compactUp: string): boolean {
  if (Math.abs(compact.length - compactUp.length) > 6) return false;
  // Adjacent transposition of the typed chars appearing in order.
  for (let i = 0; i + 1 < compactUp.length; i++) {
    const swapped =
      compactUp.slice(0, i) + compactUp[i + 1] + compactUp[i] + compactUp.slice(i + 2);
    if (isSubsequence(compact, swapped)) return true;
  }
  // Single substitution: all but one typed char appear in order.
  for (let i = 0; i < compactUp.length; i++) {
    const dropped = compactUp.slice(0, i) + compactUp.slice(i + 1);
    if (isSubsequence(compact, dropped)) return true;
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
          type: 'snippet',
        });
      }
    }
    for (const col of sOther.columns) {
      if (col.foreignKey && col.foreignKey.table.toLowerCase() === joinedTable) {
        suggestions.push({
          text: `${prefix}${aOther}.${col.name} = ${joinedAlias}.${col.foreignKey.column}`,
          type: 'snippet',
        });
      }
    }
    for (const c1 of sJoined.columns) {
      if (c1.name.endsWith('_id')) {
        for (const c2 of sOther.columns) {
          if (c1.name.toLowerCase() === c2.name.toLowerCase()) {
            const candidate = `${prefix}${joinedAlias}.${c1.name} = ${aOther}.${c2.name}`;
            if (!suggestions.some((s) => s.text === candidate)) {
              suggestions.push({ text: candidate, type: 'snippet' });
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
 * `limit` suggestions ordered by (match score + context rank + recency).
 */
export function buildSuggestions(params: {
  prefix: string;
  queryBeforeCursor: string;
  schemas: Record<string, TableSchema>;
  fallbackTable?: string;
  limit?: number;
  /** Optional recency signal (picks recorded via suggestion-history). */
  historyBoost?: HistoryBoost;
}): Suggestion[] {
  const { prefix, queryBeforeCursor, schemas, fallbackTable, limit = 8, historyBoost } = params;
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
  const scope = parseQueryScope(queryBeforeCursor);

  // Context-scoped pool by default; when the user has actually typed a prefix
  // (or left a multi-word keyword starter like `ORDER ` / `IS `), inject the
  // GLOBAL keyword superset so ANY syntax is reachable.
  const ctxPool: Suggestion[] =
    ctx === 'ddl-columns'
      ? ddlColumnPool(queryBeforeCursor)
      : ctx === 'ddl-modifier'
        ? [
            ddlModifierSuggestion(queryBeforeCursor),
            ...tableSuggestions(schemas, scope),
            ...keywordSuggestions('statement-start'),
          ]
        : ctx === 'columns'
          ? [
              ...joinConds,
              ...columnSuggestions(prefix, queryBeforeCursor, schemas, fallbackTable),
              ...keywordSuggestions('columns'),
            ]
          : ctx === 'after-table'
            ? [...joinConds, ...keywordSuggestions('after-table')]
            : [...tableSuggestions(schemas, scope), ...keywordSuggestions(ctx)];
  const pool: Suggestion[] =
    up || continuation
      ? [
          ...ctxPool,
          ...GLOBAL_POOL.filter((k) => !ctxPool.some((s) => s.text.toUpperCase() === k)).map((k) => ({
            text: k,
            type: 'keyword' as SuggestionKind,
          })),
        ]
      : ctxPool;

  const matchTarget = (s: Suggestion): string | null => {
    if (dot < 0) return s.text;
    // Dotted qualifier (`c.` / `c.ema`): only columns of the aliased table
    // are valid — keywords/tables must not match the post-dot token.
    if (s.type === 'column') return s.text;
    return null;
  };

  const filtered = pool.filter((s) => {
    const su = s.text.toUpperCase();
    const target = matchTarget(s);
    if (target === null) {
      // Bare `alias.` with no token yet: keep columns, drop keywords/tables.
      // Once the user types `alias.xx`, non-columns stay hidden too.
      return false;
    }
    if (up && continuation) {
      return suggestionMatches(target, up) || (upStem ? suggestionMatches(s.text, upStem) : false);
    }
    if (up) return suggestionMatches(target, up);
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

  // Base context rank: the smartest source wins ties — a schema-derived join
  // key (snippet) is worth more than any single token, then the context's own
  // kind (columns in expr ctx, tables in FROM ctx), then keywords.
  const rank: Record<SuggestionKind, number> =
    ctx === 'columns'
      ? { snippet: 0, column: 1, keyword: 2, table: 3 }
      : ctx === 'tables'
        ? { snippet: 0, table: 1, keyword: 2, column: 3 }
        : ctx === 'after-table'
          ? { snippet: 0, keyword: 1, table: 2, column: 3 }
          : { keyword: 0, snippet: 1, table: 2, column: 3 };
  const scored = deduped.map((s, idx) => {
    const target = dot >= 0 && s.type === 'column' ? s.text : s.text;
    const matchScore = up
      ? upStem && continuation
        ? Math.max(scoreSuggestion(target, up), scoreSuggestion(target, upStem))
        : scoreSuggestion(target, up)
      : 1;
    const recency = historyBoost ? Math.min(historyBoost(s.text), 5) * 12 : 0;
    // Quantise the match tier (0..10) before ranking: the raw `- length`
    // penalty inside scoreSuggestion would otherwise let a SHORTER candidate
    // leapfrog a whole kind (`o` after JOIN ranked `ON` above `orders`).
    // Tier first, then kind, then recency, then pool order.
    const tier = Math.floor(matchScore / 10);
    return { s, idx, score: tier * 1000 - rank[s.type] * 100 + recency };
  });
  // Stable sort: score desc, then original pool order.
  scored.sort((a, b) => b.score - a.score || a.idx - b.idx);
  // Batch 4: attach the one-line teaching doc shown beside each row.
  return scored
    .slice(0, limit)
    .map((e) => (e.s.doc ? e.s : { ...e.s, doc: suggestionDoc(e.s.text) }));
}