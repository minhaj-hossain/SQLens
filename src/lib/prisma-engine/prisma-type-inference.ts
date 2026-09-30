/**
 * Prisma result type inference — Phase 9.
 * ─────────────────────────────────────────────────────────────────────────────
 * The Type Inspector's honest half. Prisma's real types come from the generated
 * client (they exist BEFORE any row is read); this in-browser engine has no code
 * generator, so nothing here pretends to reimplement one:
 *
 *   · `expectedType` on a task is the AUTHORED contract (what the reference call
 *     resolves to, e.g. `{ id: number; name: string } | null`) — shown as
 *     "reference type", never claimed as derived.
 *   · `inferResultType` reads the rows the engine ACTUALLY returned and infers
 *     the shape from them (`{ id: number; email: string }`), which is what makes
 *     the panel useful after a Run and honest about being observed, not declared.
 *
 * A view combines both (`typeInspectorView` in track-submit.ts) and says which is
 * which; an empty result set is reported as "no rows yet" instead of inventing
 * columns from the SQL's projection list.
 */

import type { QueryExecutionResult } from '../../types/database';

/** One observed column. */
export interface InferredField {
  name: string;
  /** TypeScript type the observed values imply (`number`, `string`, `null`, …). */
  tsType: string;
  /** The runtime type(s) actually seen — a mixed column keeps both. */
  observed: string[];
  /** `true` when a null was observed (Prisma would widen the type with `| null`). */
  nullable: boolean;
  /** A representative value, for the panel's tooltip. */
  sample: unknown;
}

export interface InferredResultType {
  /** `true` when at least one row was observed. */
  observed: boolean;
  fields: InferredField[];
  /** The TypeScript type string, or `null` when nothing was observed. */
  tsType: string | null;
  /** One honest sentence about how this type was derived. */
  note: string;
}

/**
 * Runtime type of one SQL value, named the way a TypeScript reader expects.
 * Dates arrive over SQL as ISO strings (`2026-09-30T…`), so they read `string`
 * here — the panel's per-column note says so instead of guessing a `Date`.
 */
export function tsTypeOf(value: unknown): string {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'number') return 'number';
  if (typeof value === 'boolean') return 'boolean';
  if (typeof value === 'string') return 'string';
  if (typeof value === 'bigint') return 'bigint';
  return 'unknown';
}

/** Column order + observed values of a result set, tolerant of ragged rows. */
function columnsOf(result: QueryExecutionResult): string[] {
  const declared = result.columns ?? [];
  if (declared.length > 0) return declared;
  const seen: string[] = [];
  for (const row of result.rows) {
    for (const key of Object.keys(row)) if (!seen.includes(key)) seen.push(key);
  }
  return seen;
}

/** Exact, stable inference of the shape a result set actually had. */
export function inferResultType(result: QueryExecutionResult | null | undefined): InferredResultType {
  if (!result) {
    return { observed: false, fields: [], tsType: null, note: 'No run yet — run your code to observe a result shape.' };
  }
  if (result.error) {
    return {
      observed: false,
      fields: [],
      tsType: null,
      note: `The last statement errored (${result.error}), so there is no result shape to infer.`,
    };
  }
  const columns = columnsOf(result);
  if (result.rows.length === 0) {
    return {
      observed: false,
      fields: [],
      tsType: null,
      note:
        columns.length > 0
          ? `The query returned 0 rows (projection: ${columns.join(', ')}). Prisma's types come from your schema — an empty result set cannot show them.`
          : 'The statement returned no rows and no column list, so there is no shape to infer.',
    };
  }

  const fields: InferredField[] = columns.map((name) => {
    const observed: string[] = [];
    let nullable = false;
    let sample: unknown = null;
    for (const row of result.rows) {
      const value = row[name];
      const t = tsTypeOf(value);
      if (t === 'null') nullable = true;
      if (!observed.includes(t)) observed.push(t);
      if (sample === null && value !== null && value !== undefined) sample = value;
    }
    const nonNull = observed.filter((t) => t !== 'null');
    const base = nonNull.length === 0 ? 'null' : nonNull.join(' | ');
    return {
      name,
      tsType: nullable && nonNull.length > 0 ? `${base} | null` : base,
      observed,
      nullable,
      sample,
    };
  });

  const body = fields.map((f) => `${f.name}: ${f.tsType}`).join('; ');
  const single = result.rowCount === 1;
  const tsType = single ? `{ ${body} }` : `{ ${body} }[]`;

  return {
    observed: true,
    fields,
    tsType,
    note: `Inferred from the ${result.rowCount} row${result.rowCount === 1 ? '' : 's'} this statement returned${
      nullableColumnNames(fields).length > 0
        ? ` (${nullableColumnNames(fields).join(', ')} had nulls, so the type widens with \`| null\`)`
        : ''
    }.`,
  };
}

function nullableColumnNames(fields: InferredField[]): string[] {
  return fields.filter((f) => f.nullable).map((f) => f.name);
}
