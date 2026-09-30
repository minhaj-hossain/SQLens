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
 *   4. execute the generated statement(s) on the session executor — through the
 *      ONE shared runner (`runPrismaPlan`, also used by the Phase-4 proxy), so
 *      the SQL Lens, the grader and the proxy can never execute different SQL
 *   5. static checks first (`validatePrismaCode`), then execution rules
 *      (`gradePrismaExecution`) — the same two layers as `gradePrismaCode`
 *   6. record one telemetry event (best-effort, never fatal)
 *
 * `previewPrismaSubmission` is the ungraded twin of step 1–4 (the editor's Run):
 * same reset/seed/translate/execute path, no verdict.
 *
 * Every executed statement is reported as a `PrismaExecutionStep[]` — the
 * payload the UI's SQL Lens renders (label + substituted SQL + per-statement
 * result). `generatedSql` is a mirror of that array, derived in `emit` alone.
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
import { generatePrismaSql, PRISMA_DEMO_VARIABLES, type SeedContext } from './prisma-sql-generator';
import { runPrismaPlan, type PrismaExecutionStep } from './prisma-proxy-executor';
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

/**
 * The graded outcome MINUS the mirror field: `emit` derives `generatedSql` in
 * one place, so no return site can hand the lens a stale statement list.
 */
export interface PrismaSubmitResult {
  passed: boolean;
  feedback?: string;
  /** Translation failed — the SQL Lens reason (shown, never executed). */
  untranslatable?: boolean;
  /**
   * Graded WITHOUT translating a client call (snippet lab: CLI /
   * schema.prisma / URL / Zod). Static checks decided the verdict; `result`,
   * when present, is the authored `solutionSql` reference run, and the SQL Lens
   * says so — never invented SQL, never an honest miss turned into a failure.
   */
  readThrough?: boolean;
  /** The Prisma SQL Lens: one entry per executed statement (label + SQL + result). */
  steps: PrismaExecutionStep[];
  /** Engine result of the last executed statement (undefined when nothing ran). */
  result?: QueryExecutionResult;
  stage: GradingStage;
  /** True when the task's own reference fails (authoring bug — file it). */
  inconclusive?: boolean;
}

export interface PrismaSubmitOutcome extends PrismaSubmitResult {
  /** Mirror of `steps.map((s) => s.sql)` — the statements that ran, in order. */
  generatedSql: string[];
}

function emit(
  task: PracticeTask,
  outcome: PrismaSubmitResult,
  options: { surface: GradingSurface; attempt: number; record: boolean },
): PrismaSubmitOutcome {
  // `generatedSql` is DERIVED here and nowhere else (see `PrismaSubmitResult`),
  // so the lens strings and the graded statements can never disagree.
  const full: PrismaSubmitOutcome = {
    ...outcome,
    generatedSql: outcome.steps.map((s) => s.sql),
  };
  if (options.record) {
    recordGradingEvent({
      taskId: task.id,
      stage: full.stage,
      surface: options.surface,
      validatorPassed: full.stage === 'pass' || full.stage === 'final-state',
      affectedRows: full.result?.affectedRows ?? full.result?.rowCount,
      inconclusive: full.inconclusive,
      attempt: options.attempt,
    });
  }
  return full;
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
  const done = (outcome: PrismaSubmitResult): PrismaSubmitOutcome =>
    emit(task, outcome, { surface, attempt, record });

  if (!rule) {
    return done({
      passed: false,
      feedback: 'This task has no Prisma contract to grade against.',
      steps: [],
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
        readThrough: true,
        steps: [],
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
      readThrough: true,
      steps: [],
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
      steps: [],
      stage: 'validation',
    });
  }

  // Static passed — execute the plan on the session executor through the ONE
  // shared statement runner: `runPrismaPlan` substitutes params through
  // `renderGeneratedSql` (caller binding → field demo binding → honest NULL),
  // stops at the first failure the way Prisma aborts a call, and labels every
  // step for the SQL Lens. `gen.rowEffect` decides what several statements count
  // as (see `GenerateResult`): the array form of `$transaction` grades the SUM
  // of the row effects it ran, every other translation the LAST statement's own
  // count.
  const run = runPrismaPlan(gen, { executeQuery: execute }, { schema, seed });
  const steps = run.steps;
  // The rendered statements, joined — the same strings the lens renders (one
  // `renderGeneratedSql` path, so the SQL the learner sees is the SQL that ran).
  const renderedSql = steps.map((s) => s.sql).join('\n');
  const last = steps.length > 0 ? steps[steps.length - 1].result : undefined;
  let affectedTotal = 0;
  let affectedSeen = false;
  for (const step of steps) {
    if (typeof step.result.affectedRows === 'number') {
      affectedTotal += step.result.affectedRows;
      affectedSeen = true;
    }
  }
  if (!last) {
    return done({
      passed: false,
      feedback: 'Nothing executable was generated from this code.',
      untranslatable: true,
      steps,
      stage: 'validation',
    });
  }
  if (!last.success) {
    // Engine error is learner-visible — unless the lab EXPECTS failure, in
    // which case the grader decides (missing P2002 mapping → fail, not pass).
    const afterError = gradePrismaCode(code, rule, last, renderedSql);
    if (rule.expectFailure && afterError.passed) {
      return done({ passed: true, steps, result: last, stage: 'pass' });
    }
    return done({
      passed: false,
      feedback: last.error ?? 'The generated SQL failed to run.',
      steps,
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
  const final = gradePrismaCode(code, rule, graded, renderedSql);
  return done({
    passed: final.passed,
    feedback: final.feedback,
    steps,
    result: graded,
    stage: final.passed ? 'pass' : 'validation',
  });
}

/**
 * Translate + execute WITHOUT grading — the editor's Run (preview) on the
 * Prisma track.
 *
 * Same reset → seed → translate → execute steps as the graded path (shared
 * `generatePrismaSql` + `runPrismaPlan`, so the SQL Lens can never disagree with
 * what grading ran), minus the static checks and telemetry: a Run exists to show
 * the learner the SQL their code produces — including the SQL of code that would
 * NOT pass yet.
 */
export interface PrismaPreviewOptions {
  task: PracticeTask;
  /** The learner's TypeScript, exactly as typed (no empty-guard here). */
  code: string;
  hooks: PrismaSubmitHooks;
}

export interface PrismaPreviewOutcome {
  /** Translation succeeded — `steps` is what ran (`success` per statement). */
  ok: boolean;
  /** `ok: false` → the honest translation reason (there is no SQL to show). */
  reason?: string;
  steps: PrismaExecutionStep[];
  /** Engine result of the last executed statement (undefined when none ran). */
  result?: QueryExecutionResult;
}

export function previewPrismaSubmission(options: PrismaPreviewOptions): PrismaPreviewOutcome {
  const { task, code, hooks } = options;
  const { execute, resetDatabase } = hooks;

  // Preview is idempotent the same way submit is: a `fresh` task replays from
  // seed, so repeated Runs never accumulate rows.
  if (task.databaseLifecycle === 'fresh') resetDatabase?.();
  execute(setupSqlForPrismaTask(task));

  const schema = schemaForTask(task);
  const seed = prismaSeedContext();
  const gen = generatePrismaSql(code, { schema, seed });
  if (!gen.ok) return { ok: false, reason: gen.reason, steps: [] };

  const run = runPrismaPlan(gen, { executeQuery: execute }, { schema, seed });
  return {
    ok: true,
    steps: run.steps,
    result: run.steps.length > 0 ? run.steps[run.steps.length - 1].result : undefined,
  };
}
