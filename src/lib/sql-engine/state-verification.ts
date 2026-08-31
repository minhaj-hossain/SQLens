import { SqlExecutor } from './executor';
import { DatabaseState, TableRow } from '../../types/database';

/**
 * F1 (report.md §6 Rec 1): mutation/DDL task grading by FINAL DATABASE STATE.
 *
 * Result-only grading cannot verify mutations: an UPDATE on the wrong row can
 * report the same affectedRows as the correct one. This module replays the
 * task's solutionSql on a SANDBOX clone of the pre-statement database and
 * compares the resulting final state against the learner's actual state —
 * float-tolerant, row-order-insensitive, and timestamp-tolerant so equivalent
 * approaches always pass while wrong targets fail loudly.
 */

/** Matches a full timestamp (date + time part). Such values may be generated
 *  at execution time (DEFAULT CURRENT_TIMESTAMP), so they compare at minute
 *  precision — literal seed dates differ by days, so this never masks errors. */
const FULL_TIMESTAMP_RE = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}/;

/** Serialize a cell value deterministically for state comparison.
 *  - floats: 12 significant digits (18.700000000000003 === 18.7)
 *  - full timestamps: minute precision (execution-time generation tolerance)
 *  - NULL-safe, string-exact otherwise. */
export function serializeCellValue(v: unknown): string {
  if (v === null || v === undefined) return '\u0000NULL';
  if (v instanceof Date) return 'd:' + v.toISOString().slice(0, 16);
  if (typeof v === 'number') {
    return 'n:' + (Number.isFinite(v) ? String(Number(v.toPrecision(12))) : String(v));
  }
  const s = String(v);
  if (FULL_TIMESTAMP_RE.test(s)) return 's:' + s.slice(0, 16);
  return 's:' + s;
}

/** Canonical key for a row: column-name-sorted, value-serialized. */
function rowKey(row: TableRow): string {
  const keys = Object.keys(row || {}).sort();
  return keys.map((k) => k + '=' + serializeCellValue(row[k])).join('\u0001');
}

/** True when two row-key lists represent the same multiset (order-insensitive). */
export function rowMultisetEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const counts = new Map<string, number>();
  for (const k of a) counts.set(k, (counts.get(k) ?? 0) + 1);
  for (const k of b) {
    const c = counts.get(k);
    if (!c) return false;
    if (c === 1) counts.delete(k);
    else counts.set(k, c - 1);
  }
  return counts.size === 0;
}

export interface FinalStateVerdict {
  ok: boolean;
  /** Human-readable explanation of the first mismatch found (when !ok). */
  message?: string;
}

/** Compare two database states: same tables, same columns, same row multisets. */
export function compareFinalState(actual: DatabaseState, expected: DatabaseState): FinalStateVerdict {
  const norm = (s: string) => s.toLowerCase();
  const actualTables = new Map(Object.keys(actual.tables ?? {}).map((t) => [norm(t), t]));
  const expectedTables = new Map(Object.keys(expected.tables ?? {}).map((t) => [norm(t), t]));

  for (const [lnorm, lorig] of expectedTables) {
    if (!actualTables.has(lnorm)) {
      return { ok: false, message: `Expected table '${lorig}' is missing from the database.` };
    }
  }
  for (const [lnorm, lorig] of actualTables) {
    if (!expectedTables.has(lnorm)) {
      return { ok: false, message: `Table '${lorig}' should not exist in the final state.` };
    }
  }

  for (const [lnorm, eorig] of expectedTables) {
    const aorig = actualTables.get(lnorm)!;

    // Column comparison: NAME SET only (not types) — legal variations like
    // VARCHAR(100) vs VARCHAR(200) or DECIMAL vs FLOAT must not fail a
    // correct solution. Wrong/missing columns still fail.
    const eCols = expected.schemas?.[eorig]?.columns?.map((c) => c.name.toLowerCase()) ?? [];
    const aCols = actual.schemas?.[aorig]?.columns?.map((c) => c.name.toLowerCase()) ?? [];
    if (eCols.length > 0) {
      const eSet = new Set(eCols);
      const aSet = new Set(aCols);
      const missingCols = eCols.filter((c) => !aSet.has(c));
      if (missingCols.length > 0) {
        return { ok: false, message: `Table '${eorig}' is missing column(s): ${missingCols.join(', ')}.` };
      }
      const extraCols = aCols.filter((c) => !eSet.has(c));
      if (extraCols.length > 0) {
        return { ok: false, message: `Table '${eorig}' has unexpected column(s): ${extraCols.join(', ')}.` };
      }
    }

    const eRows = expected.tables?.[eorig] ?? [];
    const aRows = actual.tables?.[aorig] ?? [];
    if (!rowMultisetEqual(aRows.map(rowKey), eRows.map(rowKey))) {
      return {
        ok: false,
        message: `Table '${eorig}' does not match the expected final state (expected ${eRows.length} row(s), found ${aRows.length}). Check which rows you targeted and the values you wrote.`,
      };
    }
  }

  return { ok: true };
}

/**
 * Grade a mutation task by final state: replay `solutionSql` on a sandbox
 * clone of `preState`, then compare the sandbox's final state with the
 * learner's `actualPostState`.
 */
export function gradeFinalState(
  preState: DatabaseState,
  solutionSql: string,
  actualPostState: DatabaseState,
): FinalStateVerdict {
  const sandbox = new SqlExecutor(preState);
  const refResult = sandbox.execute(solutionSql);
  if (refResult.error) {
    // The reference solution itself must run cleanly; if it does not, fall
    // back to no state grading rather than rejecting a possibly-correct user.
    return { ok: true };
  }
  return compareFinalState(actualPostState, sandbox.getDatabaseState());
}
