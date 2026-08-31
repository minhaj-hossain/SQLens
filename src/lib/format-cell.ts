/**
 * Type-aware cell formatting for SQLens data grids.
 *
 * Kills the "every cell is identical tiny gray mono text" look:
 *  - numbers right-align + tabular-nums
 *  - money columns keep exactly 2 decimals (120.00 never degrades to `120`)
 *  - date columns use tabular-nums and a stable ISO presentation
 *  - NULL is handled as a consistent muted chip by the DataGrid
 *
 * Pure + deterministic so it is unit-tested under `tests/ui/format-cell.test.ts`
 * and shared by `DataGrid` (single source of truth for "how a value looks").
 */

export type CellType =
  | 'string'
  | 'number'
  | 'decimal'
  | 'money'
  | 'date'
  | 'boolean'
  | 'null';

/** Column names that mean money regardless of the value shape. */
const MONEY_COLUMN =
  /(^|[._])(price|unit_price|subtotal|total|amount|cost|revenue|salary|rate)([._]|$)/i;

const DATE_STRING = /^\d{4}-\d{2}-\d{2}([ T]\d{2}:\d{2}(:\d{2})?)?$/;

/** True when a column *name* signals money (works on `products.price`,
 *  `oi.unit_price`, aliased outputs, …). */
export function moneyColumnName(name: string): boolean {
  return MONEY_COLUMN.test(name);
}

/** Maps a schema `SQLDataType` to the display CellType. */
export function cellTypeFromSchema(type: string | undefined): CellType | 'unknown' {
  switch (type) {
    case 'number':
      return 'number';
    case 'decimal':
      return 'decimal';
    case 'date':
      return 'date';
    case 'boolean':
      return 'boolean';
    case 'string':
      return 'string';
    default:
      // 'unknown' keeps consumers able to fall back to value inference.
      return 'unknown';
  }
}

/**
 * Value-based heuristic for arbitrary SELECT outputs that have no schema.
 * Deterministic per (name, values) — never random.
 */
export function inferCellType(name: string, values: readonly unknown[]): CellType {
  let sawNonNull = false;
  let allNumbers = true;
  let allInts = true;
  let allDates = true;
  let allBooleans = true;

  for (const v of values) {
    if (v === null || v === undefined) continue;
    sawNonNull = true;
    if (typeof v !== 'number' || Number.isNaN(v)) allNumbers = false;
    if (typeof v === 'number') {
      if (!Number.isInteger(v)) allInts = false;
    } else {
      allInts = false;
    }
    if (!(typeof v === 'string' && DATE_STRING.test(v))) allDates = false;
    if (typeof v !== 'boolean') allBooleans = false;
  }

  if (!sawNonNull) return 'null';
  if (allBooleans) return 'boolean';
  // Name bias wins for money even on integers ("120" must read as `120.00`).
  if (moneyColumnName(name)) return 'money';
  if (allNumbers) return allInts ? 'number' : 'decimal';
  if (allDates) return 'date';
  return 'string';
}

/**
 * Resolve a column's display type with a clear precedence:
 * explicit override > schema type > name/value inference.
 */
export function resolveCellType(
  name: string,
  values: readonly unknown[],
  opts?: { schemaType?: string; explicit?: CellType },
): CellType {
  if (opts?.explicit) return opts.explicit;
  if (opts?.schemaType) {
    const t = cellTypeFromSchema(opts.schemaType);
    if (t !== 'unknown') {
      if (t === 'decimal' && moneyColumnName(name)) return 'money';
      return t;
    }
  }
  return inferCellType(name, values);
}

/** Formats a single value for display. Returns 'NULL' as the plain fallback. */
export function formatCell(value: unknown, type: CellType): string {
  if (value === null || value === undefined) return 'NULL';
  switch (type) {
    case 'money': {
      const n = Number(value);
      return Number.isFinite(n) ? n.toFixed(2) : String(value);
    }
    case 'decimal': {
      const n = Number(value);
      if (!Number.isFinite(n)) return String(value);
      // Integer decimals (a schema `decimal` column that holds a whole value)
      // render without trailing zeros; fractional ones get fixed 2dp.
      return Number.isInteger(n) ? String(n) : n.toFixed(2);
    }
    case 'number': {
      const n = Number(value);
      if (!Number.isFinite(n)) return String(value);
      // Strip float dust (0.30000000000000004) while preserving integers.
      return String(parseFloat(n.toPrecision(12)));
    }
    case 'date': {
      if (value instanceof Date) return value.toISOString().slice(0, 10);
      return String(value);
    }
    case 'boolean':
      return String(value);
    case 'null':
      return 'NULL';
    case 'string':
    default:
      return String(value);
  }
}

/** Typography/alignment classes per type — numbers right-aligned + tabular. */
export function cellAlign(type: CellType): string {
  if (type === 'number' || type === 'decimal' || type === 'money') {
    return 'text-right tabular-nums';
  }
  if (type === 'date') return 'tabular-nums';
  return '';
}