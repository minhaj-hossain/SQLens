/**
 * Prisma proxy executor — Phase 4.
 * ─────────────────────────────────────────────────────────────────────────────
 * Runs learner-typed Prisma client code against the real in-browser SQL
 * engine: translate (`prisma-sql-generator.ts`) → execute on the caller's
 * `SqlExecutor` (same seed/setup the UI uses) → return the results per
 * statement. Pure orchestration — no parsing of its own, no schema guessing.
 */

import type { QueryExecutionResult } from '../../types/database';
import {
  generatePrismaSql,
  renderGeneratedSql,
  type GenerateOptions,
  type GenerateResult,
} from './prisma-sql-generator';

export interface PrismaExecutionStep {
  /** SQL Lens label (`read`, `parent insert`, `tx step 1: update`, …). */
  label: string;
  /** The exact statement that ran (params already substituted). */
  sql: string;
  /** Engine result for this statement. */
  result: QueryExecutionResult;
  /**
   * Phase 10: `main` (the call's own statement) or `relation` (a follow-up
   * query from `include` / a nested write). The lens marks relation steps; the
   * grader reads the MAIN one — see `prisma-submit-pipeline.ts`.
   */
  role?: 'main' | 'relation';
}

/**
 * Anything that can run ONE statement. A `SqlExecutor` satisfies this
 * structurally, and so does the `{ executeQuery }` adapter the submit pipeline
 * builds from its `hooks.execute` — that is what keeps this the single
 * execution path for the Phase-4 proxy and the Phase-5 pipeline alike.
 */
export interface PrismaStatementRunner {
  executeQuery: (sql: string) => QueryExecutionResult;
}

/** Result of running an ALREADY-translated plan (no `ok`/`reason`: those belong to translation). */
export interface PrismaPlanRun {
  steps: PrismaExecutionStep[];
  /** True when every executed statement succeeded AND at least one ran. */
  success: boolean;
  /** First engine error, if any (mapped to Prisma codes by the grader). */
  error?: string;
}

export interface PrismaExecutionOutcome {
  ok: boolean;
  /** `ok: false` → translation reason (shown in the lens, never executed). */
  reason?: string;
  steps: PrismaExecutionStep[];
  /** True when every executed statement succeeded. */
  success: boolean;
  /** First engine error, if any (mapped to Prisma codes by the grader). */
  error?: string;
}

/**
 * Run an already-translated plan on `runner`. Stops at the first failing
 * statement (Prisma aborts the call the same way); later statements never run.
 *
 * The submit pipeline calls this with the plan it already translated (it needs
 * `gen.ok`/`gen.rowEffect` BEFORE anything executes), so the proxy and the
 * grader share one substitution + execution loop instead of two copies — and
 * the SQL Lens labels therefore come from the same translation that ran.
 */
export function runPrismaPlan(
  gen: GenerateResult,
  runner: PrismaStatementRunner,
  options: GenerateOptions = {},
): PrismaPlanRun {
  const steps: PrismaExecutionStep[] = [];
  for (const stmt of gen.statements) {
    if (stmt.sql.trim().startsWith('--')) continue;
    const sql = renderGeneratedSql(stmt, options.seed);
    const result = runner.executeQuery(sql);
    steps.push({ label: stmt.label, sql, result, role: stmt.role ?? 'main' });
    if (!result.success) {
      return { steps, success: false, error: result.error };
    }
  }
  return { steps, success: steps.length > 0 };
}

/**
 * Translate + execute `code` on `executor`. Thin wrapper over
 * `runPrismaPlan` — kept as the proxy's own entry point (Phase-4 API).
 */
export function executePrismaCode(
  code: string,
  executor: PrismaStatementRunner,
  options: GenerateOptions = {},
): PrismaExecutionOutcome {
  const gen = generatePrismaSql(code, options);
  if (!gen.ok) {
    return { ok: false, reason: gen.reason, steps: [], success: false };
  }
  return { ok: true, ...runPrismaPlan(gen, executor, options) };
}
