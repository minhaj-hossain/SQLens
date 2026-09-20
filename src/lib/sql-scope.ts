import { TableSchema } from '../types/database';
import { maskLiterals } from './sql-mask';

/**
 * sql-scope — Batch 3: query-scope parsing for schema-intelligent ranking.
 *
 * Pure helpers over the SQL text before the cursor:
 * - `parseQueryScope`: `FROM`/`JOIN` table + alias pairs, `WITH … name AS (…)`
 *   CTE names, and the best-effort column list each CTE exposes (so
 *   `WITH recent AS (SELECT customer_id, SUM(x) AS total …) … WHERE tot`
 *   still suggests `total`).
 * - `connectedTables`: tables sharing a foreign-key edge with a base set, so
 *   `FROM customers c JOIN |` floats `orders` / `reviews` above unrelated
 *   tables.
 *
 * Regex + balanced-paren scanning over the masked prefix only — no full SQL
 * parser, so it stays instant and reusable inside the suggestion hot path.
 */

export interface ScopeTable {
  table: string;
  alias: string;
}

export interface QueryScope {
  /** In-scope `FROM`/`JOIN` targets in source order. */
  tables: ScopeTable[];
  /** CTE names visible at the cursor (original casing), in declaration order. */
  cteNames: string[];
  /** CTE name (lower-cased) -> projected column names (best effort). */
  cteColumns: Record<string, string[]>;
}

const CLAUSE_GUARD = new Set([
  'WHERE', 'GROUP', 'ORDER', 'HAVING', 'LIMIT', 'OFFSET', 'ON', 'USING',
  'SELECT', 'SET', 'VALUES', 'UNION', 'EXCEPT', 'INTERSECT', 'ORDER BY',
  'GROUP BY', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'CROSS', 'FULL', 'JOIN',
]);

/** Words that can only ever end a SELECT list item — never a projected name. */
const EXPRESSION_TAIL = new Set([
  'SELECT', 'FROM', 'WHERE', 'GROUP', 'ORDER', 'BY', 'HAVING', 'LIMIT',
  'OFFSET', 'ASC', 'DESC', 'AND', 'OR', 'AS', 'ON', 'JOIN', 'UNION',
]);

function cleanAlias(raw: string | undefined, fallback: string): string {
  if (!raw) return fallback;
  const up = raw.toUpperCase();
  if (CLAUSE_GUARD.has(up)) return fallback;
  return raw;
}

/** Body of the balanced paren starting at `openIdx` (masked text, offsets kept). */
function extractBalancedParen(masked: string, openIdx: number): { body: string; end: number } | null {
  if (masked[openIdx] !== '(') return null;
  let depth = 0;
  for (let i = openIdx; i < masked.length; i++) {
    const ch = masked[i];
    if (ch === '(') depth++;
    else if (ch === ')') {
      depth--;
      if (depth === 0) return { body: masked.slice(openIdx + 1, i), end: i };
    }
  }
  return null;
}

/** Split on `sep` only at paren depth 0 (so `SUM(a, b)` stays one item). */
function topLevelSplit(text: string, sep: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    else if (ch === sep && depth === 0) {
      parts.push(text.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(text.slice(start));
  return parts;
}

/** Text before the first top-level occurrence of `keyword` (e.g. the FROM of a SELECT). */
function sliceBeforeTopLevelKeyword(text: string, keyword: string): string {
  const up = text.toUpperCase();
  let depth = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    else if (
      depth === 0 &&
      up.startsWith(keyword, i) &&
      !/[A-Za-z0-9_]/.test(up[i - 1] ?? ' ') &&
      !/[A-Za-z0-9_]/.test(up[i + keyword.length] ?? ' ')
    ) {
      return text.slice(0, i);
    }
  }
  return text;
}
/** Projected column names of a CTE body (`SELECT a, SUM(x) AS total FROM …`). */
function cteSelectColumns(body: string): string[] {
  const head = body.match(/^\s*SELECT\s+(?:DISTINCT\s+|ALL\s+)?/i);
  if (!head) return [];
  const listText = sliceBeforeTopLevelKeyword(body.slice(head[0].length), 'FROM');
  const out: string[] = [];
  for (const raw of topLevelSplit(listText, ',')) {
    const part = raw.trim();
    if (!part) continue;
    const alias = part.match(/\bAS\s+([A-Za-z_][A-Za-z0-9_]*)\s*$/i)?.[1];
    if (alias) {
      out.push(alias);
      continue;
    }
    // Bare projection: `o.order_id` -> `order_id`; `COUNT(*)`/`*` are skipped
    // because they do not end in a bare identifier.
    const name = part.match(/(?:^|\s|\.)([A-Za-z_][A-Za-z0-9_]*)\s*$/)?.[1];
    if (!name || EXPRESSION_TAIL.has(name.toUpperCase())) continue;
    out.push(name);
  }
  return out;
}

/** FROM/JOIN targets (with aliases) + CTE names/columns visible at the cursor. */
export function parseQueryScope(queryBeforeCursor: string): QueryScope {
  const masked = maskLiterals(queryBeforeCursor);
  const tables: ScopeTable[] = [];
  const re =
    /\b(?:FROM|(?:LEFT\s+|RIGHT\s+|INNER\s+|CROSS\s+)?JOIN)\s+([A-Za-z_][A-Za-z0-9_]*)(?:\s+(?:AS\s+)?([A-Za-z_][A-Za-z0-9_]*))?/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(masked)) !== null) {
    tables.push({
      table: m[1].toLowerCase(),
      alias: cleanAlias(m[2], m[1]),
    });
  }

  const cteNames: string[] = [];
  const cteColumns: Record<string, string[]> = {};
  const seen = new Set<string>();
  const withRe = /\bWITH\b/gi;
  let w: RegExpExecArray | null;
  while ((w = withRe.exec(masked)) !== null) {
    let pos = w.index + w[0].length;
    for (;;) {
      const head = masked.slice(pos).match(/^\s*,?\s*([A-Za-z_][A-Za-z0-9_]*)\s+AS\s*\(/i);
      if (!head) break;
      const opened = pos + head[0].length - 1;
      const found = extractBalancedParen(masked, opened);
      if (!found) break;
      const key = head[1].toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        cteNames.push(head[1]);
        cteColumns[key] = cteSelectColumns(found.body);
      }
      pos = found.end + 1;
    }
  }

  return { tables, cteNames, cteColumns };
}

/**
 * Rank candidate tables by FK-connectivity to the in-scope tables: tables
 * sharing a foreign-key edge (either direction) with the base set come first.
 * Returns the ordered table names (lower-cased): FK-connected first, then the
 * remaining schema order.
 */
export function connectedTables(
  baseTables: string[],
  schemas: Record<string, TableSchema>,
): string[] {
  const base = new Set(baseTables.map((t) => t.toLowerCase()));
  if (base.size === 0) return Object.keys(schemas).map((t) => t.toLowerCase());
  const connected = new Set<string>();
  for (const [name, schema] of Object.entries(schemas)) {
    const lower = name.toLowerCase();
    if (base.has(lower)) continue;
    // Outgoing: candidate FK -> base table?
    const out = schema.columns.some(
      (c) => c.foreignKey && base.has(c.foreignKey.table.toLowerCase()),
    );
    if (out) {
      connected.add(lower);
      continue;
    }
    // Incoming: base table FK -> candidate?
    for (const b of base) {
      const bs = schemas[b];
      if (!bs) continue;
      if (bs.columns.some((c) => c.foreignKey && c.foreignKey.table.toLowerCase() === lower)) {
        connected.add(lower);
        break;
      }
    }
  }
  const ordered = Object.keys(schemas).map((t) => t.toLowerCase());
  return [
    ...ordered.filter((t) => connected.has(t)),
    ...ordered.filter((t) => !connected.has(t) && !base.has(t)),
  ];
}