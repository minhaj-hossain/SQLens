/**
 * SQL type registry — the single source of truth for which column data types
 * SQLens accepts and what internal kind each maps to (Workstream B, DDL audit).
 *
 * Contract (docs/DIALECT.md §5, "fails loudly by design"): a type token in
 * `CREATE TABLE (...)` / `ALTER ... ADD COLUMN` either resolves here or the
 * statement fails with a NAMED error — typo'd tokens get a "did you mean"
 * suggestion, and a column with no type is an error. The engine never silently
 * coerces an unknown token to a default kind.
 *
 * Kinds are the internal `SQLDataType` values. Length/precision (VARCHAR(50),
 * DECIMAL(10,2)) never affects the kind — which is exactly what
 * `verifyColumnTypes` compares in state-verification (precision-insensitive
 * by construction: VARCHAR(50) ≡ VARCHAR(200), INT ≠ TEXT).
 */
import type { SQLDataType } from '../../types/database';

/** Canonical base type -> internal kind. Lookup is exact on the uppercased base word. */
export const SQL_TYPE_KINDS: ReadonlyArray<{ base: string; kind: SQLDataType }> = [
  // Integers
  { base: 'TINYINT', kind: 'number' },
  { base: 'SMALLINT', kind: 'number' },
  { base: 'MEDIUMINT', kind: 'number' },
  { base: 'INT', kind: 'number' },
  { base: 'INTEGER', kind: 'number' },
  { base: 'BIGINT', kind: 'number' },
  { base: 'SERIAL', kind: 'number' },
  { base: 'BIGSERIAL', kind: 'number' },
  // Exact / approximate numerics
  { base: 'DEC', kind: 'decimal' },
  { base: 'DECIMAL', kind: 'decimal' },
  { base: 'NUMERIC', kind: 'decimal' },
  { base: 'FLOAT', kind: 'decimal' },
  { base: 'DOUBLE', kind: 'decimal' },
  { base: 'REAL', kind: 'decimal' },
  // Text
  { base: 'CHAR', kind: 'string' },
  { base: 'VARCHAR', kind: 'string' },
  { base: 'TINYTEXT', kind: 'string' },
  { base: 'TEXT', kind: 'string' },
  { base: 'MEDIUMTEXT', kind: 'string' },
  { base: 'LONGTEXT', kind: 'string' },
  { base: 'ENUM', kind: 'string' },
  { base: 'JSON', kind: 'string' },
  // Temporal
  { base: 'DATE', kind: 'date' },
  { base: 'DATETIME', kind: 'date' },
  { base: 'TIMESTAMP', kind: 'date' },
  { base: 'TIME', kind: 'date' },
  // Boolean
  { base: 'BOOL', kind: 'boolean' },
  { base: 'BOOLEAN', kind: 'boolean' },
];

/** Learner-facing label per kind — used in verifyColumnTypes failure messages. */
export const SQL_TYPE_LABELS: Record<SQLDataType, string> = {
  number: 'a number type (INT)',
  decimal: 'a decimal type (DECIMAL)',
  string: 'a text type (VARCHAR/TEXT)',
  date: 'a date type (DATE/DATETIME)',
  boolean: 'a boolean type (BOOLEAN)',
};

/** "a text type (VARCHAR/TEXT)" for a stored kind; tolerant of unknown input. */
export function describeSqlKind(kind: string): string {
  return SQL_TYPE_LABELS[(kind || '').toLowerCase() as SQLDataType] ?? `a '${kind}' type`;
}

export type SqlTypeResolution =
  | { ok: true; kind: SQLDataType }
  | { ok: false; suggestion?: string };

/** `VARCHAR(50)` -> `VARCHAR` (uppercased base word, precision dropped). */
function baseOf(sqlType: string): string {
  return sqlType.toUpperCase().split('(')[0].trim();
}

/**
 * Resolve a declared type token to its internal kind.
 * Unknown tokens return `{ ok: false }` with the closest canonical type when a
 * Levenshtein distance of ≤ 2 finds one (`VARCHR` -> `VARCHAR`).
 */
export function resolveSqlType(sqlType: string): SqlTypeResolution {
  const base = baseOf(sqlType || '');
  if (!base) return { ok: false };
  const hit = SQL_TYPE_KINDS.find((e) => e.base === base);
  if (hit) return { ok: true, kind: hit.kind };
  const suggestion = closestSqlType(base);
  return suggestion ? { ok: false, suggestion } : { ok: false };
}

/** Closest canonical base type within Levenshtein distance 2, if any. */
function closestSqlType(base: string): string | undefined {
  let best: string | undefined;
  let bestDist = 3; // strictly < 3 => distance ≤ 2
  for (const { base: cand } of SQL_TYPE_KINDS) {
    const d = levenshtein(base, cand);
    if (d < bestDist) {
      bestDist = d;
      best = cand;
    }
  }
  return best;
}

/** Classic two-row Levenshtein distance (short tokens only — type bases). */
function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev: number[] = [];
  let cur: number[] = [];
  for (let j = 0; j <= b.length; j++) prev[j] = j;
  for (let i = 1; i <= a.length; i++) {
    cur[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(cur[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    prev = cur;
    cur = [];
  }
  return prev[b.length];
}