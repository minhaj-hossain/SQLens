/**
 * editor-diagnostics — semantic diagnostics from the real AST (M4 audit P4.18).
 *
 * WHY THIS EXISTS
 * `editor-errors.ts` used to understand only ENGLISH ERROR MESSAGES: it regex-
 * scraped `Unknown column 'x'` out of engine text and picked a "did you mean"
 * candidate from the GLOBAL pool of every column in the starter schema — so a
 * typo in `orders` could be "corrected" to a column of `products`. Worse, the
 * engine's own projection guard deliberately SKIPS computed items, so
 * `SELECT UPPER(emial) FROM customers` runs and quietly returns NULL.
 *
 * This module reads the parsed statement instead of the message:
 *   - it walks `parseSql` output to learn which tables a statement actually
 *     reads (with their aliases) and which columns that scope provides,
 *   - it then checks every identifier the statement uses against THAT scope,
 *     so suggestions come from the tables in the query (the audit's example:
 *     a `price` typo inside an `order_items` query offers `unit_price`),
 *   - it names the offending identifier with a REAL position, reusing the
 *     P4.17 source map (`source-position.ts`).
 *
 * CONSERVATIVE BY CONSTRUCTION (the repo's governing rule: never a plausible-
 * looking wrong answer — and no coverage beats a false error). It returns an
 * EMPTY list rather than guess whenever the scope cannot be established:
 *   - the text contains DDL (`CREATE`/`ALTER`/`DROP`/`RENAME`/`TRUNCATE`), so a
 *     table or column may have been created earlier in the learner's session,
 *   - any relation is a CTE name, a derived table, or unknown to the schema,
 *   - the statement does not parse, or is not a SELECT/UPDATE/DELETE,
 *   - any relation resolves to a table the starter schema does not describe.
 * Unknown TABLES are deliberately not reported at all: a learner-created table
 * is invisible to the editor, so "no such table" would be a lie.
 */
import { parseSql } from './sql-engine/parser';
import type { ParsedSqlQuery } from './sql-engine/parser';
import { splitStatements } from './sql-engine/split-statements';
import { locateToken, maskNonTokenText, shiftPosition } from './sql-engine/source-position';
import type { SqlSourcePosition } from './sql-engine/source-position';
import { SQL_KEYWORDS } from './sql-keywords';
import type { TableSchema } from '../types/database';

export type SqlDiagnosticCode = 'unknown-column' | 'unknown-qualifier' | 'ambiguous-column';

export interface SqlDiagnostic {
  code: SqlDiagnosticCode;
  /** Learner-facing, plain language (no jargon, no engine-speak). */
  message: string;
  /** The identifier the message is about. */
  token: string;
  didYouMean?: string;
  /** Where the identifier sits in the learner's own text (absent when unlocatable). */
  position?: SqlSourcePosition;
  /** How many times the token appears in real code (> 1 → do not mark a line). */
  occurrences?: number;
}

/** Keep the inline bar readable — the first few problems are the useful ones. */
const MAX_DIAGNOSTICS = 3;

/** Table/alias/column names, optionally qualified (`p.name`). */
const IDENTIFIER = /[A-Za-z_][A-Za-z0-9_]*(?:\s*\.\s*[A-Za-z_][A-Za-z0-9_]*)?/g;

// ---------------------------------------------------------------------------
// Nearest-name matching (moved here from editor-errors so the AST walk and the
// message parser share ONE implementation and cannot drift).
// ---------------------------------------------------------------------------

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

export function findClosestMatch(word: string, candidates: string[]): string | null {
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

// ---------------------------------------------------------------------------
// Vocabulary + text helpers
// ---------------------------------------------------------------------------

/**
 * Single words that can never be a column reference. Same rule as the engine's
 * own identifier guard: the canonical vocabulary plus date-part / literal
 * extras, with multi-word entries contributing each of their words (so
 * `price IS NOT NULL` is not misread as a column called `IS`).
 */
const IDENT_KEYWORDS: Set<string> = (() => {
  const kw = new Set<string>();
  for (const k of SQL_KEYWORDS) {
    const up = String(k).toUpperCase();
    kw.add(up);
    for (const word of up.split(/\s+/)) if (word) kw.add(word);
  }
  for (const k of [
    'NULL', 'TRUE', 'FALSE', 'DAY', 'MONTH', 'YEAR', 'HOUR', 'MINUTE', 'SECOND',
    'DUAL', 'INTERVAL', 'ESCAPE', 'REGEXP', 'RLIKE', 'UNSIGNED', 'SIGNED',
    'CAST', 'CONVERT',
  ]) {
    kw.add(k);
  }
  return kw;
})();

/**
 * Blank balanced paren groups whose body starts with SELECT/WITH: a nested
 * query has its OWN scope, so its identifiers must never be judged against the
 * outer statement's tables. Mirrors the engine's `blankSubselects`.
 */
export function blankSubselects(text: string): string {
  const remove: Array<[number, number]> = [];
  const stack: number[] = [];
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '(') stack.push(i);
    else if (text[i] === ')') {
      const start = stack.pop();
      if (start === undefined) continue;
      if (/^\s*(SELECT|WITH)\b/i.test(text.slice(start + 1, i))) remove.push([start, i]);
    }
  }
  if (remove.length === 0) return text;
  let out = '';
  let pos = 0;
  for (const [s, e] of remove.sort((a, b) => a[0] - b[0])) {
    if (e < pos) continue; // nested inside an already-removed span
    out += text.slice(pos, s) + ' ';
    pos = e + 1;
  }
  return out + text.slice(pos);
}

/** A fragment reduced to its real code: literals/comments masked, nested queries blanked. */
function codeText(fragment: string): string {
  return blankSubselects(maskNonTokenText(fragment));
}

/** Identifiers used by a fragment — keywords, function names and numbers dropped. */
function identifiersIn(fragment: string): string[] {
  const text = codeText(fragment);
  const out: string[] = [];
  IDENTIFIER.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = IDENTIFIER.exec(text)) !== null) {
    const raw = m[0];
    // A name immediately followed by `(` is a function call, not a column.
    if (/^\s*\(/.test(text.slice(m.index + raw.length))) continue;
    const parts = raw
      .split('.')
      .map((p) => p.replace(/[`"']/g, '').trim())
      .filter(Boolean);
    const last = parts[parts.length - 1];
    if (!last || IDENT_KEYWORDS.has(last.toUpperCase())) continue;
    out.push(parts.join('.'));
  }
  return out;
}

// ---------------------------------------------------------------------------
// Statement scope
// ---------------------------------------------------------------------------

interface Scope {
  /** lowercase alias / table name → lowercase table name */
  names: Map<string, string>;
  /** lowercase table → the name to USE for it in messages/fixes (alias if declared) */
  preferredName: Map<string, string>;
  /** lowercase table → its lowercase columns */
  columnsByTable: Map<string, Set<string>>;
  /** lowercase column → the tables in scope that declare it (scope order) */
  owners: Map<string, string[]>;
  /** "orders" or "products (as p), suppliers (as s)" — for messages */
  label: string;
  /** union of every in-scope column, for bare-name suggestions */
  allColumns: string[];
}

function cleanIdentifier(raw: string): string {
  return raw.replace(/[`"']/g, '').trim().toLowerCase();
}

/**
 * The relations a statement reads, or null when the editor CANNOT know them —
 * a CTE, a derived table, an unknown table, or no relation at all. Returning
 * null is a decision, not a failure: without a trustworthy scope every check
 * below would be a guess.
 */
function buildScope(parsed: ParsedSqlQuery, schemas: Record<string, TableSchema>): Scope | null {
  const relations: Array<{ table: string; alias?: string }> = [];
  if (parsed.type === 'SELECT') {
    if (parsed.fromTable) relations.push({ table: parsed.fromTable, alias: parsed.fromAlias });
    for (const j of parsed.joins ?? []) relations.push({ table: j.table, alias: j.alias });
  } else if (parsed.type === 'UPDATE' && parsed.updateTable) {
    relations.push({ table: parsed.updateTable });
  } else if (parsed.type === 'DELETE' && parsed.deleteTable) {
    relations.push({ table: parsed.deleteTable });
  } else {
    return null;
  }
  if (relations.length === 0) return null; // FROM-less SELECT — constant context
  if (parsed.ctes?.length || parsed.cteName) return null; // CTE scope not modelled

  const names = new Map<string, string>();
  const preferredName = new Map<string, string>();
  const columnsByTable = new Map<string, Set<string>>();
  const owners = new Map<string, string[]>();
  const labels: string[] = [];
  const allColumns: string[] = [];

  for (const rel of relations) {
    const table = cleanIdentifier(String(rel.table ?? ''));
    if (!/^[a-z_][a-z0-9_]*$/.test(table)) return null; // derived table / odd token
    const cols = schemas[table]?.columns?.map((c) => cleanIdentifier(String(c.name))) ?? [];
    if (cols.length === 0) return null; // unknown or empty relation — cannot verify

    const alias = rel.alias ? cleanIdentifier(String(rel.alias)) : '';
    names.set(table, table);
    if (alias) names.set(alias, table);
    preferredName.set(table, alias || table);
    const colSet = new Set(cols);
    columnsByTable.set(table, colSet);
    for (const c of cols) {
      allColumns.push(c);
      const list = owners.get(c) ?? [];
      if (!list.includes(table)) list.push(table);
      owners.set(c, list);
    }
    labels.push(alias ? `${table} (as ${alias})` : table);
  }

  return {
    names,
    preferredName,
    columnsByTable,
    owners,
    label: labels.length === 1 ? labels[0] : labels.join(', '),
    allColumns: Array.from(new Set(allColumns)),
  };
}

/** Judge one identifier against the scope. Null = the scope knows it. */
function checkIdentifier(
  raw: string,
  scope: Scope,
): Omit<SqlDiagnostic, 'position' | 'occurrences'> | null {
  const parts = raw.split('.').map(cleanIdentifier).filter(Boolean);
  if (parts.length === 0) return null;
  const target = parts[parts.length - 1];

  if (parts.length >= 2) {
    const qualifier = parts[0];
    const table = scope.names.get(qualifier);
    if (!table) {
      const best = findClosestMatch(qualifier, Array.from(scope.names.keys()));
      const replacement = best ? [best, target].join('.') : undefined;
      return {
        code: 'unknown-qualifier',
        token: parts.join('.'),
        didYouMean: replacement,
        message: best
          ? `There is no table or alias called '${qualifier}' here. Did you mean '${replacement}'?`
          : `There is no table or alias called '${qualifier}' here. This statement reads ${scope.label}.`,
      };
    }
    const cols = scope.columnsByTable.get(table) ?? new Set<string>();
    if (cols.has(target)) return null;
    const best = findClosestMatch(target, Array.from(cols));
    // Preserve the qualifier in every Fix action: `p.prices` must become
    // `p.price`, never silently lose `p.` and change the query's shape.
    const replacement = best ? `${qualifier}.${best}` : undefined;
    return {
      code: 'unknown-column',
      token: parts.join('.'),
      didYouMean: replacement,
      message: best
        ? `No column named '${target}' in '${table}'. Did you mean '${replacement}'?`
        : `No column named '${target}' in '${table}'. Its columns are ${Array.from(cols).join(', ')}.`,
    };
  }

  const ownerTables = scope.owners.get(target) ?? [];
  if (ownerTables.length > 1) {
    const fix = `${scope.preferredName.get(ownerTables[0]) ?? ownerTables[0]}.${target}`;
    return {
      code: 'ambiguous-column',
      token: target,
      didYouMean: fix,
      message: `'${target}' exists in more than one table here (${ownerTables.join(', ')}). Qualify it — e.g. '${fix}'.`,
    };
  }
  if (ownerTables.length === 0) {
    const best = findClosestMatch(target, scope.allColumns);
    return {
      code: 'unknown-column',
      token: target,
      didYouMean: best ?? undefined,
      message: best
        ? `No column named '${target}' in ${scope.label}. Did you mean '${best}'?`
        : `No column named '${target}' in ${scope.label}.`,
    };
  }
  return null;
}

// ---------------------------------------------------------------------------
// The walk
// ---------------------------------------------------------------------------

/**
 * Every fragment of a statement that can contain a column reference. Projection
 * items are checked INCLUDING their function arguments, CASE branches and window
 * clauses — the engine's own guard deliberately skips computed projection items,
 * which is exactly where `SELECT UPPER(emial)` quietly returns NULL.
 */
function statementFragments(parsed: ParsedSqlQuery): string[] {
  const out: string[] = [];

  for (const col of parsed.columns ?? []) {
    const parts: Array<string | undefined> = [String(col.expression ?? '')];
    if (col.functionCall) parts.push(col.functionCall.name, ...col.functionCall.args);
    if (col.caseExpression) {
      for (const w of col.caseExpression.whens) parts.push(w.condition, w.result);
      parts.push(col.caseExpression.elseResult);
    }
    if (col.windowFunction) {
      const w = col.windowFunction;
      parts.push(w.partitionBy, w.orderBy, w.aggregateArg, ...(w.args ?? []));
    }
    if (col.aggregateArg) parts.push(col.aggregateArg);
    out.push(parts.filter(Boolean).join(' '));
  }

  for (const j of parsed.joins ?? []) out.push(j.onLeft, j.onRight, ...(j.onCondition ? [j.onCondition] : []));
  if (parsed.whereClause) out.push(parsed.whereClause);
  if (parsed.havingClause) out.push(parsed.havingClause);
  for (const g of parsed.groupBy ?? []) out.push(g);
  for (const o of parsed.orderBy ?? []) {
    out.push(o.column);
    if (o.caseExpression) {
      for (const w of o.caseExpression.whens) out.push(w.condition, w.result);
      out.push(...(o.caseExpression.elseResult ? [o.caseExpression.elseResult] : []));
    }
  }
  // UPDATE targets: a typo in `SET <column>` is a silent no-op, so the assigned
  // names are checked (the values may be literals or expressions — left alone).
  for (const key of Object.keys(parsed.updateSet ?? {})) out.push(key);

  return out.filter((f) => typeof f === 'string' && f.trim().length > 0);
}

function diagnoseStatement(
  stmt: string,
  schemas: Record<string, TableSchema>,
): Array<Omit<SqlDiagnostic, 'position' | 'occurrences'>> {
  const masked = maskNonTokenText(stmt);
  // A derived table (`FROM (SELECT …) x`) brings columns we cannot enumerate.
  if (/\bFROM\s*\(/i.test(masked) || /\bJOIN\s*\(/i.test(masked)) return [];

  const parsed = parseSql(stmt);
  if (parsed.error) return [];
  const scope = buildScope(parsed, schemas);
  if (!scope) return [];

  // Output aliases this statement defines are legal references (ORDER BY …).
  const declared = new Set<string>();
  for (const col of parsed.columns ?? []) {
    if (col.alias) declared.add(cleanIdentifier(String(col.alias)));
  }

  const found: Array<Omit<SqlDiagnostic, 'position' | 'occurrences'>> = [];
  const seen = new Set<string>();
  for (const fragment of statementFragments(parsed)) {
    for (const raw of identifiersIn(fragment)) {
      const bare = raw.split('.').map(cleanIdentifier).filter(Boolean);
      if (bare.length === 1 && declared.has(bare[0])) continue;
      const hit = checkIdentifier(raw, scope);
      if (!hit) continue;
      const key = `${hit.code}:${hit.token.toLowerCase()}`;
      if (seen.has(key)) continue;
      seen.add(key);
      found.push(hit);
    }
  }
  return found;
}

/**
 * Semantic diagnostics for the learner's SQL, read from the AST.
 * An empty array means "nothing provably wrong — or nothing the editor can know".
 */
export function diagnoseSql(sql: string, schemas: Record<string, TableSchema>): SqlDiagnostic[] {
  if (!sql || !sql.trim()) return [];
  // DDL anywhere in the text: a table or column may exist from earlier in the
  // learner's session and the editor cannot see runtime schema state. Stay
  // silent rather than accuse SQL that is correct at run time.
  if (/\b(CREATE|ALTER|DROP|RENAME|TRUNCATE)\b/i.test(maskNonTokenText(sql))) return [];

  const diagnostics: SqlDiagnostic[] = [];
  const seen = new Set<string>();
  let cursor = 0;

  for (const stmt of splitStatements(sql)) {
    const at = sql.indexOf(stmt, cursor);
    if (at >= 0) cursor = at + stmt.length;
    const slice = at >= 0 ? sql.slice(at) : sql;

    for (const hit of diagnoseStatement(stmt, schemas)) {
      const key = `${hit.code}:${hit.token.toLowerCase()}`;
      if (seen.has(key)) continue;
      seen.add(key);

      // Locate INSIDE this statement's span, then re-anchor onto the learner's
      // full text (same rule the executor uses for multi-statement scripts).
      const target = hit.token.split('.').pop() ?? hit.token;
      const local = locateToken(slice, hit.token) ?? locateToken(slice, target);
      const located = local && at >= 0 ? shiftPosition(sql, local, at) : local;

      diagnostics.push({
        ...hit,
        // No location = no line claim: the bar still names the problem, but the
        // gutter stays clean instead of pointing somewhere innocent.
        position: located
          ? {
              line: located.line,
              col: located.col,
              offsetStart: located.offsetStart,
              offsetEnd: located.offsetEnd,
            }
          : undefined,
        occurrences: local?.occurrences,
      });
      if (diagnostics.length >= MAX_DIAGNOSTICS) return diagnostics;
    }
  }

  return diagnostics;
}

/**
 * Scope-aware suggestion for a COLUMN the engine already rejected with a named
 * error: the closest column name across the tables the statement really reads.
 * Returns null when the scope cannot be established — the caller then falls back
 * to the global pool rather than suggesting a column from an unrelated table.
 */
export function suggestColumnInScope(
  sql: string,
  token: string,
  schemas: Record<string, TableSchema>,
): string | null {
  if (!sql || !token) return null;
  if (/\b(CREATE|ALTER|DROP|RENAME|TRUNCATE)\b/i.test(maskNonTokenText(sql))) return null;

  const candidates: string[] = [];
  for (const stmt of splitStatements(sql)) {
    const parsed = parseSql(stmt);
    if (parsed.error) continue;
    const scope = buildScope(parsed, schemas);
    if (scope) candidates.push(...scope.allColumns);
  }
  if (candidates.length === 0) return null;

  const best = findClosestMatch(token, Array.from(new Set(candidates)));
  return best && best.toLowerCase() !== token.toLowerCase() ? best : null;
}
