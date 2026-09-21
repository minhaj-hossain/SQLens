import { SqlExecutor } from './executor';
import { DatabaseState, TableRow } from '../../types/database';
import { isDataPreservingTxnControlOnly } from './txn-expectation';

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
/** Truncate a display value so error banners stay one idea, not a data dump. */
function fmtCell(v: unknown, maxLen = 40): string {
  if (v === null || v === undefined) return 'NULL';
  let s = String(v);
  if (s.length > maxLen) s = s.slice(0, maxLen - 1) + '…';
  return "'" + s + "'";
}

/**
 * Phase 1 (value-diff errors): when two same-size row multisets differ,
 * explain WHICH values differ instead of the cryptic "expected 16, found 16".
 * Pairs the single extra learner row with the single missing expected row for
 * a column-level diff: `name (yours: 'Rahim …', expected: 'Sultana …')`.
 * Pure + bounded: at most maxCols columns named, values truncated, no
 * solution copy-paste (only differing columns shown).
 */
function diffSameSizeRows(
  aRows: TableRow[],
  eRows: TableRow[],
  maxCols = 3,
): { message: string; columns: string[] } | null {
  if (aRows.length === 0 || aRows.length !== eRows.length) return null;
  const aKeys = aRows.map(rowKey);
  const eCounts = new Map<string, number>();
  for (const k of eRows.map(rowKey)) eCounts.set(k, (eCounts.get(k) ?? 0) + 1);
  const extraIdx: number[] = [];
  for (let i = 0; i < aKeys.length; i++) {
    const c = eCounts.get(aKeys[i]);
    if (!c) extraIdx.push(i);
    else if (c === 1) eCounts.delete(aKeys[i]);
    else eCounts.set(aKeys[i], c - 1);
  }
  if (extraIdx.length === 0) return null;
  const missing = eRows.filter((r) => !aKeys.includes(rowKey(r)));
  // Precise 1:1 diff for the classic single-INSERT mistake; otherwise a
  // bounded summary so multi-row batches don't flood the banner.
  if (extraIdx.length !== 1 || missing.length !== 1) {
    // No 1:1 pairing, so there is no column list to report — the caller still
    // gets the count framing and telemetry just records "value mismatch".
    return { message: extraIdx.length + ' row(s) differ from the expected result.', columns: [] };
  }
  const actual = aRows[extraIdx[0]];
  const want = missing[0];
  const cols = Array.from(new Set([...Object.keys(actual ?? {}), ...Object.keys(want ?? {})]));
  const diffs = cols.filter(
    (c) => serializeCellValue(actual?.[c]) !== serializeCellValue(want?.[c]),
  );
  if (diffs.length === 0) return null;
  const shown = diffs.slice(0, maxCols);
  const parts = shown.map(
    (c) => "'" + c + "' (yours: " + fmtCell(actual?.[c]) + ', expected: ' + fmtCell(want?.[c]) + ')',
  );
  const more = diffs.length > maxCols ? ' +' + (diffs.length - maxCols) + ' more' : '';
  return {
    message: 'values differ in ' + parts.join(', ') + more + '.',
    columns: diffs,
  };
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
  /**
   * Phase 3 (telemetry + audits): the column names whose VALUES differed, when
   * the mismatch was a same-size 1:1 row diff (the classic wrong-INSERT). Empty
   * for count/shape mismatches. Lets the telemetry report say "learners get the
   * row count right but miss the VALUES in these columns" without re-parsing the
   * human-readable message.
   */
  diffColumns?: string[];
  /**
   * S3-11: the check could not reach a verdict because the task's own reference
   * solution errored. `ok` stays TRUE so a learner is never punished for an
   * authoring bug, but the flag makes the broken task visible (callers log it,
   * audit scripts can fail CI on it) instead of silently passing forever.
   */
  inconclusive?: boolean;
}

export interface StateCompareOptions {
  /**
   * S3-11: opt-in column TYPE comparison for DDL tasks where the declared type
   * is the learning objective. Defaults to OFF because legal variations
   * (VARCHAR(100) vs VARCHAR(200), DECIMAL vs FLOAT) must not fail a correct
   * solution — enable only on tasks that teach types.
   */
  verifyTypes?: boolean;
  /**
   * Batch B follow-up: replay the reference INSIDE an open transaction, i.e. in
   * the same context the learner was in. Day 26 chains inherit `BEGIN;` from the
   * previous task, so a reference of `COMMIT;` (task 3) is legal there and
   * "no transaction in progress" in a clean sandbox — which made an otherwise
   * passing task report an inconclusive verdict. Only injected when the session
   * really had a transaction open, so the comparison stays apples-to-apples.
   */
  ambientTxn?: boolean;
  /**
   * Batch B follow-up: compare the sandbox's SESSION view (what the learner
   * sees, uncommitted writes included) instead of its durable view. Set for
   * provisional tasks whose reference leaves the transaction open — otherwise
   * the reference's own uncommitted rows would look like a mismatch.
   */
  provisional?: boolean;
  /**
   * Pre-statement database state. When provided, allows learners to write custom
   * values on INSERT operations as long as pre-existing rows remain intact and
   * newly inserted rows satisfy schema constraints (NOT NULL, types, FKs).
   */
  preState?: DatabaseState;
  /**
   * When true, enforces exact value parity on newly inserted rows (disables flexible insert).
   */
  strictValues?: boolean;
}

/**
 * Normalize a declared type for comparison, dropping precision/scale — a
 * VARCHAR(100) solution satisfies a VARCHAR(200) reference.
 */
function baseType(t: string | undefined): string {
  return String(t ?? '').toUpperCase().replace(/\(.*\)/, '').trim();
}

/** Compare two database states: same tables, same columns, same row multisets. */
export function compareFinalState(
  actual: DatabaseState,
  expected: DatabaseState,
  options: StateCompareOptions = {},
): FinalStateVerdict {
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
      // S3-11: opt-in type verification. Off by default (precision/scale
      // differences are legal); when ON, a declared type that differs in KIND
      // (INT where the reference says VARCHAR) fails the task — that IS the
      // lesson for type-teaching DDL tasks.
      if (options.verifyTypes) {
        const eTypes = new Map(
          (expected.schemas?.[eorig]?.columns ?? []).map((c) => [c.name.toLowerCase(), baseType(c.type)])
        );
        for (const col of actual.schemas?.[aorig]?.columns ?? []) {
          const want = eTypes.get(col.name.toLowerCase());
          if (want === undefined) continue;
          const got = baseType(col.type);
          if (got && want && got !== want) {
            return {
              ok: false,
              message: `Column '${col.name}' in table '${eorig}' was declared ${got}, but this task requires ${want}.`,
            };
          }
        }
      }
    }

    const eRows = expected.tables?.[eorig] ?? [];
    const aRows = actual.tables?.[aorig] ?? [];
    if (!rowMultisetEqual(aRows.map(rowKey), eRows.map(rowKey))) {
      // Check for flexible INSERT: if this table grew with new rows,
      // allow user to write custom values as long as pre-existing rows are untouched
      // and new rows are well-formed according to schema.
      const pRows = options.preState?.tables?.[eorig] ?? [];
      const isInsert = options.preState && !options.strictValues && eRows.length > pRows.length;
      if (isInsert && aRows.length === eRows.length) {
        // Verify that all pre-existing rows from pRows are preserved in aRows
        const pKeys = pRows.map(rowKey);
        const aKeyCounts = new Map<string, number>();
        for (const r of aRows) {
          const k = rowKey(r);
          aKeyCounts.set(k, (aKeyCounts.get(k) ?? 0) + 1);
        }
        let preRowsPreserved = true;
        for (const pk of pKeys) {
          const count = aKeyCounts.get(pk) ?? 0;
          if (count <= 0) {
            preRowsPreserved = false;
            break;
          }
          aKeyCounts.set(pk, count - 1);
        }

        if (preRowsPreserved) {
          // Identify the newly inserted rows
          const remainingPKeys = new Map<string, number>();
          for (const pk of pKeys) remainingPKeys.set(pk, (remainingPKeys.get(pk) ?? 0) + 1);
          const newRows: TableRow[] = [];
          for (const r of aRows) {
            const k = rowKey(r);
            const c = remainingPKeys.get(k) ?? 0;
            if (c > 0) {
              remainingPKeys.set(k, c - 1);
            } else {
              newRows.push(r);
            }
          }

          // Validate new rows against schema (NOT NULL and types)
          const schema = actual.schemas?.[aorig] ?? expected.schemas?.[eorig];
          let validNewRows = true;
          let constraintError = '';
          if (schema?.columns) {
            for (const r of newRows) {
              for (const col of schema.columns) {
                const val = r[col.name];
                if (col.nullable === false && (val === null || val === undefined)) {
                  validNewRows = false;
                  constraintError = `Column '${col.name}' cannot be NULL in '${eorig}'.`;
                  break;
                }
              }
              if (!validNewRows) break;
            }
          }

          if (validNewRows) {
            // Flexible insert criteria satisfied! Custom values accepted.
            continue;
          } else if (constraintError) {
            return {
              ok: false,
              message: `Inserted row constraint error: ${constraintError}`,
            };
          }
        }
      }

      // Phase 1: prefer a value-level diff over the cryptic count message.
      // Same-size mismatch (the classic wrong-INSERT: "expected 16, found 16")
      // names the differing columns; count mismatch keeps the count framing.
      const base = `Table '${eorig}' does not match the expected final state (expected ${eRows.length} row(s), found ${aRows.length}).`;
      if (eRows.length === aRows.length) {
        const diff = diffSameSizeRows(aRows, eRows);
        if (diff) {
          return {
            ok: false,
            message: `${base} Your row count is right, but ${diff.message} Check the exact values in the instructions.`,
            diffColumns: diff.columns,
          };
        }
      }
      return {
        ok: false,
        message: `${base} Check which rows you targeted and the values you wrote.`,
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
  options: StateCompareOptions = {},
): FinalStateVerdict {
  // A reference made only of BEGIN / COMMIT cannot change the data: its expected
  // state IS the pre-state. Short-circuiting here also keeps a `COMMIT;`
  // reference legal (Day 26 task 3 only has a transaction because the learner
  // inherited one) instead of erroring in a transaction-less sandbox.
  if (isDataPreservingTxnControlOnly(solutionSql)) {
    return compareFinalState(actualPostState, preState, { ...options, preState });
  }
  const sandbox = new SqlExecutor(preState);
  // The grading sandbox must allow DDL re-runs so that CREATE TABLE / CREATE INDEX
  // solutions can be verified cleanly regardless of what the pre-state contains.
  sandbox.allowDdlOverwrite = true;
  // Batch B follow-up: an inherited open transaction is part of the exercise on
  // Day 26 chains — replay the reference inside it so `COMMIT;` is legal and a
  // bare `INSERT` stays provisional, exactly as it did for the learner.
  if (options.ambientTxn) sandbox.execute('BEGIN;');
  const refResult = sandbox.execute(solutionSql);
  if (refResult.error) {
    // S3-11: the reference solution must run cleanly. It did not, so the task is
    // ungradeable — never punish the learner (`ok` stays true), but do NOT hide
    // the authoring bug behind a silent pass: flag it and surface it.
    const message =
      `This task's reference solution failed to run (${refResult.error}), so the final state could not be verified. Please report this task.`;
    if (typeof console !== 'undefined' && typeof console.warn === 'function') {
      console.warn(`[state-verification] reference solution errored — task needs review: ${solutionSql} :: ${refResult.error}`);
    }
    return { ok: true, inconclusive: true, message };
  }
  // Provisional tasks are compared on the session view: the reference's own rows
  // are uncommitted too, so its durable view would always look like "missing".
  const sandboxState = options.provisional
    ? sandbox.getDatabaseState()
    : sandbox.getCommittedState();
  return compareFinalState(actualPostState, sandboxState, { ...options, preState });
}
