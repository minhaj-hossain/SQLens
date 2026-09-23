/**
 * DDL column-contract extraction — the shared reader for Workstream A.
 *
 * Two consumers:
 *   1. `validator.ts` rule 2 (requiredColumns): a CREATE/ALTER statement
 *      returns no result grid, so the required-column contract used to be
 *      unenforceable for DDL — the only signal was the final-state diff. The
 *      contract lives IN the statement, so we read it from there.
 *   2. `scripts/audit-ddl-contracts.ts`: proves every task's visible prompt
 *      names the columns its solutionSql creates (no ghost requirements).
 *
 * Scope: `CREATE TABLE [IF NOT EXISTS] t ( ... )` column definitions and
 * `ALTER TABLE t ADD [COLUMN] x TYPE` clauses. Table-level constraints
 * (PRIMARY KEY (...), FOREIGN KEY ..., CONSTRAINT ..., CHECK (...), ...)
 * are recognized and skipped — they are not columns. Plain `DROP TABLE`
 * declares nothing and yields no entries.
 */
import { splitStatements } from './split-statements';
import { splitFunctionArgs } from './parser';

/** First words that begin a TABLE constraint, never a column definition. */
const TABLE_CONSTRAINT_STARTERS = new Set([
  'primary',
  'foreign',
  'unique',
  'check',
  'constraint',
  'key',
  'index',
  'fulltext',
  'spatial',
]);

/** One DDL statement's declared columns, keyed by its (lowercased) target table. */
export interface DdlTableColumns {
  /** Lowercased target table name, or null when the name could not be parsed. */
  table: string | null;
  /** Declared column names, in statement order (original case preserved). */
  columns: string[];
}

/** Strip one layer of identifier quoting (backticks / double quotes). */
function stripIdent(q: string): string {
  return q.replace(/^[`"]|[`"]$/g, '');
}

/**
 * Return the inside of the balanced parenthesis OPEN at `openIdx`, quote-aware.
 * Null when unbalanced (a malformed statement simply declares nothing — the
 * validator then falls through to its existing feedback paths).
 */
function balancedBody(sql: string, openIdx: number): string | null {
  let depth = 0;
  let inQuote: string | null = null;
  for (let i = openIdx; i < sql.length; i++) {
    const ch = sql[i];
    if (inQuote) {
      if (ch === inQuote) inQuote = null;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === '`') {
      inQuote = ch;
      continue;
    }
    if (ch === '(') depth++;
    else if (ch === ')') {
      depth--;
      if (depth === 0) return sql.slice(openIdx + 1, i);
    }
  }
  return null;
}

/** `CREATE TABLE [IF NOT EXISTS] t ( ... )` → declared column definitions. */
function parseCreateTable(stmt: string): DdlTableColumns | null {
  const m = /\bCREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([`"]?[\w]+[`"]?)\s*\(/i.exec(stmt);
  if (!m) return null;
  const openIdx = m.index + m[0].length - 1; // position of the '(' the regex consumed
  const body = balancedBody(stmt, openIdx);
  if (body === null) return null;

  const columns: string[] = [];
  for (const part of splitFunctionArgs(body)) {
    const pm = /^\s*([`"]?[\w]+[`"]?)\s+([A-Za-z]\w*)/.exec(part);
    if (!pm) continue; // table constraint that starts with '(' or is otherwise not `name type`
    const first = stripIdent(pm[1]).toLowerCase();
    if (TABLE_CONSTRAINT_STARTERS.has(first)) continue; // PRIMARY/FOREIGN/CONSTRAINT/...
    columns.push(stripIdent(pm[1]));
  }
  return { table: stripIdent(m[1]).toLowerCase(), columns };
}

/** `ALTER TABLE t ADD [COLUMN] x TYPE [, ADD ...]` → added column names. */
function parseAlterAdd(stmt: string): DdlTableColumns | null {
  const tm = /\bALTER\s+TABLE\s+(?:IF\s+EXISTS\s+)?([`"]?[\w]+[`"]?)/i.exec(stmt);
  if (!tm) return null;
  const columns: string[] = [];
  const addRe = /\bADD\s+(?:COLUMN\s+)?([`"]?[\w]+[`"]?)\s+([A-Za-z]\w*)/gi;
  let am: RegExpExecArray | null;
  while ((am = addRe.exec(stmt)) !== null) {
    const first = stripIdent(am[1]).toLowerCase();
    if (TABLE_CONSTRAINT_STARTERS.has(first)) continue; // ADD CONSTRAINT / ADD PRIMARY KEY / ...
    columns.push(stripIdent(am[1]));
  }
  return { table: stripIdent(tm[1]).toLowerCase(), columns };
}

/**
 * Every column declared by DDL across all statements of `sql`.
 * Empty array for SELECT/DML/DROP-only scripts and for unparseable DDL —
 * callers use `[]` to mean "this rule has nothing to say here".
 */
export function extractDdlTableColumns(sql: string): DdlTableColumns[] {
  const out: DdlTableColumns[] = [];
  for (const stmt of splitStatements(sql)) {
    const create = parseCreateTable(stmt);
    if (create) {
      out.push(create);
      continue;
    }
    const alter = parseAlterAdd(stmt);
    if (alter && alter.columns.length > 0) out.push(alter);
  }
  return out;
}

/** Flat union of every column declared by DDL in `sql` (`[]` when none). */
export function extractDdlColumns(sql: string): string[] {
  const cols: string[] = [];
  for (const entry of extractDdlTableColumns(sql)) cols.push(...entry.columns);
  return cols;
}