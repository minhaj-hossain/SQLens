/**
 * Prisma proxy executor — Phase 4.
 * ─────────────────────────────────────────────────────────────────────────────
 * Runs learner-typed Prisma client code against the real in-browser SQL
 * engine: translate (`prisma-sql-generator.ts`) → execute on the caller's
 * `SqlExecutor` (same seed/setup the UI uses) → return the results per
 * statement. Pure orchestration — no parsing of its own, no schema guessing.
 */

import { SqlExecutor } from '../sql-engine/executor';
import type { QueryExecutionResult } from '../../types/database';
import { generatePrismaSql, renderGeneratedSql, type GenerateOptions } from './prisma-sql-generator';

export interface PrismaExecutionStep {
  /** SQL Lens label (`read`, `parent insert`, `tx step 1: update`, …). */
  label: string;
  /** The exact statement that ran (params already substituted). */
  sql: string;
  /** Engine result for this statement. */
  result: QueryExecutionResult;
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
 * Translate + execute `code` on `executor`. Stops at the first failing
 * statement (Prisma aborts the call the same way); later statements never run.
 */
export function executePrismaCode(
  code: string,
  executor: SqlExecutor,
  options: GenerateOptions = {},
): PrismaExecutionOutcome {
  const gen = generatePrismaSql(code, options);
  if (!gen.ok) {
    return { ok: false, reason: gen.reason, steps: [], success: false };
  }
  const steps: PrismaExecutionStep[] = [];
  for (const stmt of gen.statements) {
    if (stmt.sql.trim().startsWith('--')) continue;
    const sql = renderGeneratedSql(stmt, options.seed);
    const result = executor.executeQuery(sql);
    steps.push({ label: stmt.label, sql, result });
    if (!result.success) {
      return { ok: true, steps, success: false, error: result.error };
    }
  }
  return { ok: true, steps, success: steps.length > 0 };
}
