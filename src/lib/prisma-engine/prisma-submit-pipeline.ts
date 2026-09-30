/**
 * Prisma submit pipeline — Phase 5.
 * ─────────────────────────────────────────────────────────────────────────────
 * The missing integration layer between the Phase-4 execution engine
 * (translate → execute → grade primitives) and the Phase-6 content model
 * (`task.prisma`, `task.solutionSql` as the executable reference).
 *
 * This is the ONE place a Prisma submission is graded — the Prisma mirror of
 * `src/lib/sql-engine/submit-pipeline.ts` (`runAndGradeSubmission`). Same
 * ownership, in order:
 *   1. `fresh` lifecycle reset (idempotent retry: never accumulate rows)
 *   2. seed the task universe (`setupSql`, or the shared `users` seed)
 *   3. translate the learner's TypeScript (`generatePrismaSql`)
 *   4. execute the generated statement(s) on the session executor
 *   5. static checks first (`validatePrismaCode`), then execution rules
 *      (`gradePrismaExecution`) — the same two layers as `gradePrismaCode`
 *   6. record one telemetry event (best-effort, never fatal)
 *
 * Snippet labs (CLI / schema.prisma / URL / Zod) have no translatable call:
 * the generator says so honestly (`ok: false`) and the outcome carries the
 * lens reason — never invented SQL.
 *
 * Pure orchestration: imports the generator + grader, never parses. Every
 * statement runs through the caller's hooks (`hooks.execute`), so the UI and
 * the audits share one executor; static-only surfaces must keep importing
 * `prisma-validator.ts` only (see its header).
 */

import type { PracticeTask } from '../../types/curriculum';
import type { PrismaValidationRule } from '../../types/prisma-curriculum';
import type { QueryExecutionResult } from '../../types/database';
import {
  PRISMA_SEED_ROWS,
  PRISMA_TASK_SETUP_SQL,
} from '../../content/prisma/phase6-tasks';
import { generatePrismaSql, renderGeneratedSql, PRISMA_DEMO_VARIABLES, type SeedContext } from './prisma-sql-generator';
import { parsePrismaSchema, type PrismaSchema } from './prisma-schema-parser';
import { gradePrismaCode, gradePrismaExecution } from './prisma-execution';
import { validatePrismaCode } from './prisma-validator';
import {
  type GradingStage,
  type GradingSurface,
  recordGradingEvent,
} from '../grading-telemetry';

/**
 * Minimal schema.prisma for the single-table seed universe. Execution never
 * guesses relations: the translator needs real model shape, so tasks without
 * an authored schema still get the honest `users(id,name,email)` AST.
 */
export const PRISMA_SEED_SCHEMA = `model User {
  id    Int    @id @default(autoincrement())
  name  String
  email String @unique
}`;

/** Seed rows every Prisma task's generated SQL runs against (object form). */
export function prismaSeedContext(
  variables?: Record<string, unknown>,
): SeedContext {
  return {
    tables: {
      users: PRISMA_SEED_ROWS.map(([id, name, email]) => ({ id, name, email })),
    },
    variables: { ...PRISMA_DEMO_VARIABLES, ...(variables ?? {}) },
  };
}


/**
 * Prisma read-through contract — Phase 5.
 * ─────────────────────────────────────────────────────────────────────────────
 * Only tasks whose `solutionCode` is genuinely a Prisma client read/write go
 * through translate → execute → grade. Snippet labs (CLI / schema.prisma /
 * URL / Zod / raw-client scaffolding) and concept labs whose structural
 * rules the static validator already owns are graded WITHOUT executing
 * anything: static checks first, then the execution-only rules
 * (`expectedRowCount` / `expectFailure` / snippets) against the authored
 * `solutionSql` reference dataset — exactly how the SQL pipeline grades
 * (`gradeSubmission` runs the reference and compares).
 *
 * This keeps the Phase-6 promise (`solutionSql` is the executable reference)
 * while never inventing SQL for code the generator is honest about.
 */

/** Every Prisma task ships a `prisma` block — this is the submit-time guard. */
export function isPrismaTask(task: PracticeTask): boolean {
  return task.prisma !== undefined && task.prisma !== null;
}

/**
 * `true` when the task's solution is a real `prisma.<model>.<method>(…)`
 * client call the generator can translate. Snippet labs (CLI / schema.prisma
 * / URL / Zod / lifecycle scaffolding) never reach the executor.
 */
export function isExecutablePrismaTask(task: PracticeTask): boolean {
  if (!isPrismaTask(task)) return false;
  const gen = generatePrismaSql(task.prisma!.solutionCode, {
    schema: schemaForTask(task),
    seed: prismaSeedContext(),
  });
  return gen.ok;
}

/** Parse the task's authored schema (falls back to the seed-universe schema). */
export function schemaForTask(task: PracticeTask): PrismaSchema {
  void task;
  return parsePrismaSchema(PRISMA_SEED_SCHEMA);
}

/** Bootstrap SQL for a Prisma task (its own `setupSql`, else the shared seed). */
export function setupSqlForPrismaTask(task: PracticeTask): string {
  return task.setupSql ?? PRISMA_TASK_SETUP_SQL;
}

export interface PrismaSubmitHooks {
  /** Execute SQL on the session executor (same hook the SQL pipeline takes). */
  execute: (sql: string) => QueryExecutionResult;
  /** Reset to seed. Absent → `fresh` retries keep prior mutations. */
  resetDatabase?: () => void;
}

export interface PrismaSubmitOptions {
  task: PracticeTask;
  /** The learner's TypeScript (already trimmed by the caller's empty-guard). */
  code: string;
  hooks: PrismaSubmitHooks;
  /** Which surface sent this submit — recorded in telemetry. */
  surface: GradingSurface;
  /** 1-based attempt within the current task session (telemetry only). */
  attempt?: number;
  /** `false` in audits/scripts: telemetry must not be written by bulk runs. */
  record?: boolean;
}

export interface PrismaSubmitOutcome {
  passed: boolean;
  feedback?: string;
  /** Translation failed — the SQL Lens reason (shown, never executed). */
  untranslatable?: boolean;
  /** The exact generated statement(s), in order (the SQL Lens). */
  generatedSql: string[];
  /** Engine result of the last executed statement (undefined when nothing ran). */
  result?: QueryExecutionResult;
  stage: GradingStage;
  /** True when the task's own reference fails (authoring bug — file it). */
  inconclusive?: boolean;
}

function emit(
  task: PracticeTask,
  outcome: PrismaSubmitOutcome,
  options: { surface: GradingSurface; attempt: number; record: boolean },
): PrismaSubmitOutcome {
  if (options.record) {
    recordGradingEvent({
      taskId: task.id,
      stage: outcome.stage,
      surface: options.surface,
      validatorPassed: outcome.stage === 'pass' || outcome.stage === 'final-state',
      affectedRows: outcome.result?.affectedRows ?? outcome.result?.rowCount,
      inconclusive: outcome.inconclusive,
      attempt: options.attempt,
    });
  }
  return outcome;
}


/**
 * Run one Prisma submission end-to-end. UI calls this; scripts call the same
 * function with the same hooks, so an audit failure is a real user-visible
 * failure.
 */
export function runAndGradePrismaSubmission(options: PrismaSubmitOptions): PrismaSubmitOutcome {
  const { task, code, hooks, surface, attempt = 1, record = true } = options;
  const { execute, resetDatabase } = hooks;
  const rule = task.prisma?.validation as PrismaValidationRule | undefined;
  const done = (outcome: PrismaSubmitOutcome): PrismaSubmitOutcome =>
    emit(task, outcome, { surface, attempt, record });

  if (!rule) {
    return done({
      passed: false,
      feedback: 'This task has no Prisma contract to grade against.',
      generatedSql: [],
      stage: 'validation',
    });
  }

  // Reset first (SQL-pipeline parity): `fresh` tasks replay from seed on
  // every submit so retries never accumulate rows.
  if (task.databaseLifecycle === 'fresh') resetDatabase?.();
  execute(setupSqlForPrismaTask(task));

  // Translate, then grade STATIC-first: `validatePrismaCode` decides before
  // anything executes (SQL-pipeline parity — a starter that happens to
  // generate runnable SQL still fails its structural rules untouched).
  const schema = schemaForTask(task);
  const seed = prismaSeedContext();
  const gen = generatePrismaSql(code, { schema, seed });
  if (!gen.ok) {
    // No client call to translate (snippet lab, middleware, lifecycle
    // scaffolding): fall back to the read-through contract — static checks
    // first, then the execution-only rules against the authored `solutionSql`
    // reference dataset. Never invented SQL, never an honest miss turned
    // into a failure.
    const staticOnly = validatePrismaCode(code, rule);
    if (!staticOnly.passed) {
      return done({
        passed: false,
        feedback: staticOnly.feedback,
        generatedSql: [],
        stage: 'validation',
      });
    }
    // The reference dataset: the authored `solutionSql` replayed on the same
    // seeded session database the learner's own code would have run against
    // (setup already ran above, after the `fresh` reset) — so a reference that
    // cannot run is reported inconclusive instead of failing the learner.
    const expected = execute(task.solutionSql);
    const execVerdict = gradePrismaExecution(rule, expected, task.solutionSql);
    return done({
      passed: execVerdict.passed,
      feedback: execVerdict.feedback,
      generatedSql: [],
      result: expected.success ? expected : undefined,
      stage: execVerdict.passed ? 'pass' : 'validation',
      inconclusive: expected.success ? undefined : true,
    });
  }
  const staticAfterGen = validatePrismaCode(code, rule);
  if (!staticAfterGen.passed) {
    return done({
      passed: false,
      feedback: staticAfterGen.feedback,
      generatedSql: gen.statements.map((s) => s.sql),
      stage: 'validation',
    });
  }

  // Static passed — execute statement-by-statement on the session executor
  // (stop at the first failure — Prisma aborts the same way). `gen.rowEffect`
  // decides what several statements count as (see `GenerateResult`): the array
  // form of `$transaction` grades the SUM of the row effects it ran, every
  // other translation the LAST statement's own count.
  const generatedSql: string[] = [];
  let last: QueryExecutionResult | undefined;
  let affectedTotal = 0;
  let affectedSeen = false;
  for (const stmt of gen.statements) {
    if (stmt.sql.trim().startsWith('--')) continue;
    // One substitution path with the proxy executor — `renderGeneratedSql`
    // documents the order (caller binding → field demo binding → honest NULL),
    // so the lens and the grader can never drift.
    const sql = renderGeneratedSql(stmt, seed);
    generatedSql.push(sql);
    last = execute(sql);
    if (typeof last.affectedRows === 'number') {
      affectedTotal += last.affectedRows;
      affectedSeen = true;
    }
    if (!last.success) break;
  }
  if (!last) {
    return done({
      passed: false,
      feedback: 'Nothing executable was generated from this code.',
      untranslatable: true,
      generatedSql,
      stage: 'validation',
    });
  }
  if (!last.success) {
    // Engine error is learner-visible — unless the lab EXPECTS failure, in
    // which case the grader decides (missing P2002 mapping → fail, not pass).
    const afterError = gradePrismaCode(code, rule, last, generatedSql.join('\n'));
    if (rule.expectFailure && afterError.passed) {
      return done({ passed: true, generatedSql, result: last, stage: 'pass' });
    }
    return done({
      passed: false,
      feedback: last.error ?? 'The generated SQL failed to run.',
      generatedSql,
      result: last,
      stage: 'engine-error',
    });
  }

  // Execution rules on the real result (`gradePrismaExecution` half). Only the
  // array form of `$transaction([...])` replaces the last statement's count
  // with the batch aggregate — that form resolves to the list of operations it
  // ran, while the interactive form resolves to the callback's return value.
  const graded: QueryExecutionResult =
    gen.rowEffect === 'sum' && affectedSeen && last
      ? { ...last, affectedRows: affectedTotal }
      : last;
  const final = gradePrismaCode(code, rule, graded, generatedSql.join('\n'));
  return done({
    passed: final.passed,
    feedback: final.feedback,
    generatedSql,
    result: graded,
    stage: final.passed ? 'pass' : 'validation',
  });
}
