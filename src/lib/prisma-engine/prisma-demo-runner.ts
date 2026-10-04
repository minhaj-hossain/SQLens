/**
 * Prisma concept theory live demo runner — Phase 4.
 * ─────────────────────────────────────────────────────────────────────────────
 * A task-agnostic runner that translates learner/author TypeScript code into
 * SQL statements, runs them on the provided SQL executor against the seed universe,
 * and stitches the results into an in-memory JSON object graph.
 *
 * Used by ConceptLessonView for interactive Prisma theory demos without requiring
 * a full PracticeTask harness.
 */

import type { QueryExecutionResult } from '../../types/database';
import { PRISMA_TASK_SETUP_SQL } from '../../content/prisma/phase6-tasks';
import { generatePrismaSql } from './prisma-sql-generator';
import { runPrismaPlan, type PrismaExecutionStep } from './prisma-proxy-executor';
import { parsePrismaSchema } from './prisma-schema-parser';
import { stitchPrismaExecution } from './prisma-in-memory-stitcher';
import { PRISMA_SEED_SCHEMA, prismaSeedContext } from './prisma-submit-pipeline';

export interface PrismaDemoRunnerOptions {
  code: string;
  executor: {
    executeQuery: (sql: string) => QueryExecutionResult;
    resetDatabase?: () => void;
  };
  schemaSource?: string;
  variables?: Record<string, unknown>;
}

export interface PrismaDemoRunResult {
  ok: boolean;
  reason?: string;
  steps: PrismaExecutionStep[];
  result?: QueryExecutionResult;
  stitchedJson?: unknown;
  method?: string;
  rowEffect?: 'sum' | 'last';
}

/**
 * Executes a TypeScript Prisma Client call for interactive concept demos.
 */
export function executePrismaDemo(options: PrismaDemoRunnerOptions): PrismaDemoRunResult {
  const { code, executor, schemaSource, variables } = options;

  if (!code || !code.trim()) {
    return { ok: false, reason: 'No code provided to execute.', steps: [] };
  }

  // Ensure demo seed setup has run on the session executor
  try {
    executor.executeQuery(PRISMA_TASK_SETUP_SQL);
  } catch {
    // Non-fatal if tables already exist
  }

  const rawSchema =
    schemaSource && schemaSource.trim().length > 0
      ? schemaSource
      : PRISMA_SEED_SCHEMA;
  const schema = parsePrismaSchema(rawSchema);
  const seed = prismaSeedContext(variables);

  const gen = generatePrismaSql(code, { schema, seed });
  if (!gen.ok) {
    return {
      ok: false,
      reason: gen.reason ?? 'This TypeScript code could not be translated into SQL.',
      steps: [],
    };
  }

  const run = runPrismaPlan(gen, executor, { schema, seed });
  const stitchedJson = stitchPrismaExecution({
    steps: run.steps,
    schema,
    method: gen.method,
    rowEffect: gen.rowEffect,
  });

  const lastResult =
    run.steps.length > 0 ? run.steps[run.steps.length - 1].result : undefined;

  return {
    ok: run.success,
    reason: run.error,
    steps: run.steps,
    result: lastResult,
    stitchedJson,
    method: gen.method,
    rowEffect: gen.rowEffect,
  };
}
