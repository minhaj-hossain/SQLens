import { DatabaseState, TableRow } from '../../types/database';
import { INITIAL_TABLES } from '../../content/database/tables';

/**
 * Phase 2 (live database explorer): which rows should a learner SEE right now?
 *
 * Before this module, every preview rendered the static `INITIAL_TABLES` seed, so
 * a learner who inserted a row still read "products (28 rows)" while the grader
 * compared live state ("expected 32, found 31"). The counts contradicted each
 * other and the mismatch looked like an engine bug.
 *
 * This resolves preview data from the executor snapshot instead, and keeps the
 * seed as the fallback for consumers with no executor (roadmap schema modal,
 * static renders/tests). Pure + synchronous, so it is unit-testable without a
 * DOM and reusable by both `DatabaseExplorer` and the challenge inspector.
 */
export type LiveTables = Record<string, TableRow[]> | null;

export interface LiveTableRows {
  /** Rows to render: live snapshot rows when available, else seed rows. */
  rows: TableRow[];
  /** Rows the table started with (static seed). */
  seedCount: number;
  /** Rows the table has now (live) — equals seedCount in fallback mode. */
  liveCount: number;
  /** liveCount - seedCount: >0 after INSERTs, <0 after DELETEs, 0 untouched. */
  delta: number;
  /** 'live' when an executor snapshot answered, 'seed' when falling back. */
  source: 'live' | 'seed';
  /** Human summary for the UI; empty string when the table is still at seed. */
  deltaLabel: string;
}

/**
 * Read the tables map from an executor snapshot hook.
 *
 * Returns `null` — never throws — when no hook is wired (static previews) or the
 * clone fails, so previews degrade to the seed instead of blanking the panel.
 * Callers in React should memoize on a per-run token; `getDatabaseState()`
 * deep-clones, so one read per Run & Check is enough.
 */
export function readLiveTables(
  getDatabaseState?: (() => DatabaseState) | null,
): LiveTables {
  if (!getDatabaseState) return null;
  try {
    return getDatabaseState()?.tables ?? null;
  } catch {
    return null;
  }
}

/** Resolve the rows + counts for one table, preferring live data over seed. */
export function resolveLiveRows(
  tableName: string | undefined | null,
  liveTables?: LiveTables,
): LiveTableRows {
  const key = (tableName || '').toLowerCase();
  const seedRows: TableRow[] = INITIAL_TABLES[key] || [];
  const liveRows = liveTables?.[key];
  const rows = liveRows ?? seedRows;
  const seedCount = seedRows.length;
  const liveCount = rows.length;
  const delta = liveCount - seedCount;
  const source: 'live' | 'seed' = liveRows ? 'live' : 'seed';
  const deltaLabel =
    source === 'live' && delta !== 0
      ? `seed ${seedCount} → now ${liveCount} (${delta > 0 ? `+${delta}` : delta})`
      : '';
  return { rows, seedCount, liveCount, delta, source, deltaLabel };
}

/**
 * Live row count for one table — used by table switchers, which historically
 * printed the seed length for every option and made inserts invisible.
 */
export function resolveRowCount(
  tableName: string | undefined | null,
  liveTables?: LiveTables,
): number {
  const key = (tableName || '').toLowerCase();
  return liveTables?.[key]?.length ?? INITIAL_TABLES[key]?.length ?? 0;
}
