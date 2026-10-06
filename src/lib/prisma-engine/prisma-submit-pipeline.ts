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
 *   6. final-state check for MUTATIONS (Task 0.1 — SQL-pipeline step 6 parity):
 *      the learner's post-state must match a sandbox replay of the reference's
 *      own translated SQL; deferred while a reference still renders unresolved
 *      NULL params (the Task 0.2 carve-out, asserted in the phase12 tests)
 *   7. record one telemetry event (best-effort, never fatal)
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
import type { DatabaseState, QueryExecutionResult } from '../../types/database';
import {
  PRISMA_SEED_POST_ROWS,
  PRISMA_SEED_ROWS,
  PRISMA_TASK_SETUP_SQL,
} from '../../content/prisma/phase6-tasks';
import {
  generatePrismaSql,
  PRISMA_DEMO_VARIABLES,
  renderGeneratedSql,
  type GenerateResult,
  type SeedContext,
} from './prisma-sql-generator';
import { runPrismaPlan, type PrismaExecutionStep } from './prisma-proxy-executor';
import { parsePrismaSchema, type PrismaSchema } from './prisma-schema-parser';
import { stitchPrismaExecution } from './prisma-in-memory-stitcher';
import { gradePrismaCode, gradePrismaExecution } from './prisma-execution';
import { PRISMA_CLI_RUNNER_SRC, validatePrismaCode } from './prisma-validator';
import { dispatchBehavioralGrader } from './graders';
import { gradeFinalState } from '../sql-engine/state-verification';
import {
  type GradingStage,
  type GradingSurface,
  recordGradingEvent,
} from '../grading-telemetry';

/**
 * The seed universe's `schema.prisma` — the TWO tables every Prisma task and
 * the Prisma playground run against: `users` and its `posts`.
 *
 * Phase 10: the relation is declared for real (`Post.authorId @relation(...)`),
 * which is what lets the generator turn `include: { posts: true }` into an
 * executable second query and gives the ERD visualizer something true to draw.
 * Execution still never guesses: a task whose relation target is missing from
 * its schema degrades to an honest lens note (see `prisma-sql-generator.ts`).
 */
export const PRISMA_SEED_SCHEMA = `model User {
  id    Int    @id @default(autoincrement())
  name  String
  email String @unique
  posts Post[]
}

model Post {
  id       Int    @id @default(autoincrement())
  title    String
  authorId Int
  author   User   @relation(fields: [authorId], references: [id])
}`;

/** Seed rows every Prisma task's generated SQL runs against (object form). */
export function prismaSeedContext(
  variables?: Record<string, unknown>,
): SeedContext {
  return {
    tables: {
      users: PRISMA_SEED_ROWS.map(([id, name, email]) => ({ id, name, email })),
      posts: PRISMA_SEED_POST_ROWS.map(([id, title, authorId]) => ({ id, title, authorId })),
    },
    variables: { ...PRISMA_DEMO_VARIABLES, ...(variables ?? {}) },
  };
}

/**
 * Task 0.2 — the seed context for ONE task: the shared demo universe plus the
 * task's author-declared `demoVariables`, so a reference param the translator
 * cannot see (`update({ data: { name } })`) renders a real value instead of the
 * honest NULL. Learner and reference share this context, so a param the learner
 * writes and the reference both bind to the same value and stay in agreement.
 */
function taskSeedContext(task: PracticeTask): SeedContext {
  return prismaSeedContext(task.prisma?.demoVariables);
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
    seed: taskSeedContext(task),
  });
  return gen.ok;
}

/**
 * Task 0.1 — translate a task's REFERENCE client code (schema + seed): the raw
 * material of the state layer. `null` = the reference is not translatable
 * (snippet lab), which is never state-graded.
 */
function translateReference(task: PracticeTask): { gen: GenerateResult; seed: SeedContext } | null {
  const seed = taskSeedContext(task);
  const gen = generatePrismaSql(task.prisma!.solutionCode, { schema: schemaForTask(task), seed });
  return gen.ok ? { gen, seed } : null;
}

/** SQL verbs that make a plan a STATE change — the Prisma mirror of `isStateGraded`. */
const MUTATING_SQL_RE = /^\s*(INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|TRUNCATE)\b/i;

/**
 * Task 0.1 — the Prisma mirror of the SQL track's `isStateGraded(task)`: the
 * task's REFERENCE call mutates state, so the learner's post-state must match a
 * sandbox replay of the reference (wrong row / wrong value → different state).
 * Reads (`findMany` / `findUnique` / `findFirst`) stay result-graded; snippet
 * labs are never executable, and `$transaction` / nested writes classify by
 * their own statements.
 */
export function isStateGradedPrismaTask(task: PracticeTask): boolean {
  if (!isPrismaTask(task)) return false;
  const ref = translateReference(task);
  return (
    !!ref &&
    ref.gen.statements.some(
      (s) => !s.sql.trim().startsWith('--') && MUTATING_SQL_RE.test(s.sql.trim()),
    )
  );
}

/**
 * Render the reference plan into executable SQL (the exact `renderGeneratedSql`
 * path the learner's plan takes) and report whether any param-marker statement
 * fell back to the honest NULL.
 *
 * Task 0.2 deferral: comparing against a NULL-writing reference would
 * false-reject a learner who wrote the value the task intends (e.g.
 * `data: { name: 'Alexandra' }` against a reference that renders `SET name =
 * NULL`), so those tasks skip the state layer until the reference demo
 * bindings are fixed — a temporary carve-out explicitly asserted in
 * `tests/tracks/prisma-state-parity.test.ts`.
 */
function referenceStateSql(
  gen: GenerateResult,
  seed: SeedContext,
): { sql: string; unresolvedNull: boolean } {
  const parts: string[] = [];
  let unresolvedNull = false;
  for (const stmt of gen.statements) {
    if (stmt.sql.trim().startsWith('--')) continue;
    const rendered = renderGeneratedSql(stmt, seed).trimEnd();
    if (/\/\*\s*param:/.test(stmt.sql) && /\bNULL\b/.test(rendered)) unresolvedNull = true;
    parts.push(rendered.endsWith(';') ? rendered : `${rendered};`);
  }
  return { sql: parts.join('\n'), unresolvedNull };
}

/** The `schema.prisma` a task's code is translated against (authored wins). */
export function prismaSchemaSourceForTask(task: PracticeTask): string {
  const authored = task.prisma?.schemaSource?.trim();
  return authored && authored.length > 0 ? authored : PRISMA_SEED_SCHEMA;
}

/** Parse the task's schema: its authored `schemaSource`, else the seed universe. */
export function schemaForTask(task: PracticeTask): PrismaSchema {
  return parsePrismaSchema(prismaSchemaSourceForTask(task));
}

/** Bootstrap SQL for a Prisma task (its own `setupSql`, else the shared seed). */
export function setupSqlForPrismaTask(task: PracticeTask): string {
  return task.setupSql ?? PRISMA_TASK_SETUP_SQL;
}

export interface PrismaSubmitHooks {
  /** Execute SQL on the session executor (same hook the SQL pipeline takes). */
  execute: (sql: string) => QueryExecutionResult;
  /**
   * Task 0.1: deep-cloning state snapshot hook — the SAME hook the SQL
   * pipeline grades mutations with (`SqlExecutorProvider` already supplies
   * it). Absent → the final-state layer is skipped (legacy hosts/tests keep
   * their old verdicts, no crash).
   */
  getDatabaseState?: () => DatabaseState;
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
  /**
   * P1.2 — console rendering hint for read-through labs (undefined → the
   * table grid). CLI/schema.prisma labs render a simulated terminal card
   * instead of the authored reference rows.
   */
  displayMode?: ConsoleDisplayMode;
  /** P1.2 — simulated terminal text when `displayMode === 'terminal'`. */
  terminalOutput?: string;
  /** The Prisma SQL Lens: one entry per executed statement (label + SQL + result). */
  steps: PrismaExecutionStep[];
  /** Engine result of the last executed statement (undefined when nothing ran). */
  result?: QueryExecutionResult;
  stage: GradingStage;
  /** True when the task's own reference fails (authoring bug — file it). */
  inconclusive?: boolean;
  /**
   * Task 0.1: final-state layer verdict. `undefined` when the layer did not
   * run (reads, snippet labs, expectFailure labs, deferred NULL references, or
   * a host without the snapshot hook). Mirrors the SQL pipeline's `stateOk`.
   */
  stateOk?: boolean;
  /** Columns whose VALUES differed on a same-size row mismatch (state layer). */
  diffColumns?: string[];
  /** Execution method translated ('findUnique', '$transaction', etc.). */
  method?: string;
  /** Multi-statement counting mode for $transaction ('sum' | 'last'). */
  rowEffect?: 'sum' | 'last';
  /** In-memory hydrated JavaScript/JSON object graph returned by Prisma Client. */
  stitchedJson?: unknown;
}

export interface PrismaSubmitOutcome extends PrismaSubmitResult {
  /** Mirror of `steps.map((s) => s.sql)` — the statements that ran, in order. */
  generatedSql: string[];
}

/** P1.2 — what the results console renders for an outcome (default: the table). */
export type ConsoleDisplayMode = 'table' | 'terminal' | 'schema_diff' | 'type_preview';

/**
 * First Prisma CLI command in `code` — ANY supported runner, flags included
 * (`npx prisma migrate dev --name init`, `pnpm dlx prisma generate`,
 * `bunx prisma migrate deploy`). Quoted flag values stay verbatim, bare
 * tokens stop at a quote/semicolon/backtick (so a command embedded in a JS
 * string never swallows its closing quote), and whitespace runs — including
 * newline splits — stay untouched: the terminal echoes what the learner typed.
 * Shares its runner alias set with the validator (`PRISMA_CLI_RUNNER_SRC`)
 * so a submission the normalizer accepts always renders, and vice versa.
 */
export function prismaCliCommandIn(code: string): string | null {
  const m = new RegExp(
    PRISMA_CLI_RUNNER_SRC + '(?:\\s+(?:"[^"]*"|\'[^\']*\'|[^\\s"`\';]+))*',
  ).exec(code);
  return m ? m[0] : null;
}

/** `true` for a `schema.prisma` lab (model/enum/datasource/generator block, no client call). */
export function isPrismaSchemaLab(code: string): boolean {
  return /\b(?:model|enum|datasource|generator)\s+[A-Za-z_][A-Za-z0-9_]*\s*\{/.test(code);
}

/**
 * Simulated CLI output for a snippet lab — deterministic, echoing the learner's
 * own command. The browser has no shell; this faithfully reproduces what the
 * real Prisma CLI prints for the taught commands, and the console card labels
 * it as simulated (never a claim that a process ran).
 */
export function simulatePrismaCliOutput(command: string): string {
  // Runner-agnostic (Phase 1.1): strip ANY runner → `prisma …`, then collapse
  // whitespace so branch detection survives double-space / newline typing.
  // The `$ ${command}` echo below still shows the learner's OWN command.
  const sub = command
    .replace(new RegExp('^' + PRISMA_CLI_RUNNER_SRC + '\\s*'), '')
    .replace(/\s+/g, ' ');
  if (sub.startsWith('generate')) {
    return [
      `$ ${command}`,
      'Environment variables loaded from .env',
      'Prisma schema loaded from prisma/schema.prisma',
      '✔ Generated Prisma Client (v7.0.0) in 34ms',
    ].join('\n');
  }
  if (sub.startsWith('migrate dev')) {
    // Phase 1.1: accept `--name init`, `--name "init"` and `--name=init` —
    // the migration name is the unwrapped value either way (never `"init"`).
    const nameMatch = /--name(?:=|\s+)(?:"([^"]*)"|'([^']*)'|([^\s-][^\s]*))/.exec(sub);
    const name = (nameMatch && (nameMatch[1] ?? nameMatch[2] ?? nameMatch[3])) || 'init';
    return [
      `$ ${command}`,
      'Prisma schema loaded from prisma/schema.prisma',
      'Datasource "db": PostgreSQL database "app" at "localhost:5432"',
      '',
      `Applying migration \`20260930000000_${name}\``,
      '',
      '✔ Your database is now in sync with your schema.',
      'Done in 1.24s',
    ].join('\n');
  }
  if (sub.startsWith('migrate deploy')) {
    return [
      `$ ${command}`,
      '1 migration found in prisma/migrations',
      '',
      'Applying migration `20260930000000_init`',
      '',
      '✔ All migrations have been successfully applied.',
    ].join('\n');
  }
  if (sub.startsWith('db push')) {
    return [
      `$ ${command}`,
      'Prisma schema loaded from prisma/schema.prisma',
      '✔ Your database is now in sync with your Prisma schema. Done in 62ms',
    ].join('\n');
  }
  if (sub.startsWith('migrate reset')) {
    return [
      `$ ${command}`,
      '✔ Your database has been reset.',
      '',
      'Running seed command `tsx prisma/seed.ts` ...',
      '✔ The seed command has been executed.',
    ].join('\n');
  }
  if (sub.startsWith('db seed')) {
    return [
      `$ ${command}`,
      'Running seed command `tsx prisma/seed.ts` ...',
      '✔ The seed command has been executed.',
    ].join('\n');
  }
  return [`$ ${command}`, '✔ Done.'].join('\n');
}

/**
 * P1.2 — how a snippet lab should render in the results console.
 *
 * CLI labs (`npx prisma generate`) get simulated terminal output; schema.prisma
 * labs get a comment-style notice (no fake `prisma validate` success claim —
 * the static rules decided the verdict). URL/Zod/other labs return `null` and
 * keep the read-through dataset contract untouched.
 */
export function snippetLabDisplay(
  code: string,
): { displayMode: ConsoleDisplayMode; terminalOutput: string } | null {
  const command = prismaCliCommandIn(code);
  if (command) return { displayMode: 'terminal', terminalOutput: simulatePrismaCliOutput(command) };
  if (isPrismaSchemaLab(code)) {
    return {
      displayMode: 'terminal',
      terminalOutput: [
        '# schema.prisma lab — no SQL is generated for a schema edit.',
        '# The static rules decided the verdict; the schema tab shows the full schema.',
      ].join('\n'),
    };
  }
  return null;
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
      stateOk: full.stateOk,
      diffColumns: full.diffColumns,
      inconclusive: full.inconclusive,
      attempt: options.attempt,
    });
  }
  return full;
}


export function resolveBehavioralGrader(taskId: string, explicit?: string): string | undefined {
  if (explicit) return explicit;
  if (/^prisma06-(?:c1-t1|c1-t2|hw-1)$/.test(taskId)) return 'day6-singleton';
  if (/^prisma09-(?:c2-t1|c2-t2|c2-t3|hw-1)$/.test(taskId)) return 'day9-zod';
  if (/^prisma12-(?:c2-t1|c2-t2|c2-t3|hw-1)$/.test(taskId)) return 'day12-transaction';
  if (/^prisma13-(?:c1-t1|c1-t2|c1-t3|c2-t1|c2-t2|hw-1|hw-2)$/.test(taskId)) return 'day13-errors';
  if (/^prisma08-c2-t2$/.test(taskId)) return 'orderby-tiebreaker';
  if (/^prisma04-hw-2$/.test(taskId)) return 'checkpoint1-schema';
  if (/^prisma08-hw-2$/.test(taskId)) return 'checkpoint2-feed';
  return undefined;
}

/**
 * Run one Prisma submission end-to-end. UI calls this; scripts call the same
 * function with the same hooks, so an audit failure is a real user-visible
 * failure.
 */
export function runAndGradePrismaSubmission(options: PrismaSubmitOptions): PrismaSubmitOutcome {
  const { task, code, hooks, surface, attempt = 1, record = true } = options;
  const { execute, getDatabaseState, resetDatabase } = hooks;
  const rule = task.prisma?.validation as PrismaValidationRule | undefined;
  const behavioralGraderName = resolveBehavioralGrader(task.id, rule?.behavioralGrader);
  let gen: GenerateResult | undefined;
  const done = (outcome: PrismaSubmitResult): PrismaSubmitOutcome =>
    emit(
      task,
      {
        ...outcome,
        method: outcome.method ?? gen?.method,
        rowEffect: outcome.rowEffect ?? gen?.rowEffect,
        stitchedJson:
          outcome.stitchedJson ??
          (outcome.steps.length > 0
            ? stitchPrismaExecution({
                steps: outcome.steps,
                schema,
                method: outcome.method ?? gen?.method,
                rowEffect: outcome.rowEffect ?? gen?.rowEffect,
              })
            : undefined),
      },
      { surface, attempt, record },
    );

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
  // Task 0.1: the state layer's pre-state — snapshot AFTER seeding and BEFORE
  // the learner's plan runs (the exact state `gradeFinalState` replays from).
  const preState = getDatabaseState?.();

  // Translate, then grade STATIC-first: `validatePrismaCode` decides before
  // anything executes (SQL-pipeline parity — a starter that happens to
  // generate runnable SQL still fails its structural rules untouched).
  const schema = schemaForTask(task);
  const seed = taskSeedContext(task);
  const generated = generatePrismaSql(code, { schema, seed });
  gen = generated;
  if (!generated.ok) {
    // P1.2 — how this snippet lab should render (CLI terminal / schema notice,
    // else the read-through dataset contract). Purely presentational: the
    // grading below is unchanged.
    const display = snippetLabDisplay(code);
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

    // Phase 2: Behavioral Grader execution for snippet labs
    if (behavioralGraderName) {
      const behavioral = dispatchBehavioralGrader(behavioralGraderName, code, task.id);
      if (!behavioral.passed) {
        return done({
          passed: false,
          feedback: behavioral.feedback,
          readThrough: true,
          steps: [],
          stage: 'validation',
        });
      }
    }
    // Task 0.4: a task whose OWN reference is a translatable client call is a
    // client-code lab — a submission that does not translate (e.g. the `where`
    // clause deleted from an update) must FAIL. Falling through to the
    // read-through dataset contract would grade the REFERENCE's dataset as if
    // the learner's code had run: the Prisma phantom pass (proven by
    // `audit:prisma-equivalence`'s drop-where probe). Snippet labs — whose
    // references have no client call to translate — keep the contract below,
    // and `expectFailure` labs keep their execution-graded path untouched.
    if (isExecutablePrismaTask(task) && !rule.expectFailure) {
      return done({
        passed: false,
        feedback: gen.reason ?? 'This code could not be translated into SQL.',
        untranslatable: true,
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
      // P1.2 — a CLI/schema lab shows the terminal card instead of the
      // authored reference rows (they are the dataset, not the learner's run).
      result: display ? undefined : expected.success ? expected : undefined,
      displayMode: display?.displayMode,
      terminalOutput: display?.terminalOutput,
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

  // Phase 2: Behavioral Grader execution for client calls
  if (behavioralGraderName) {
    const behavioral = dispatchBehavioralGrader(behavioralGraderName, code, task.id);
    if (!behavioral.passed) {
      return done({
        passed: false,
        feedback: behavioral.feedback,
        steps: [],
        stage: 'validation',
      });
    }
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
  // Task 0.1: post-plan snapshot (`getDatabaseState` deep-clones). Captured
  // before any grading read; unused when the run failed (that path returns).
  const postState = getDatabaseState?.();
  // The rendered statements, joined — the same strings the lens renders (one
  // `renderGeneratedSql` path, so the SQL the learner sees is the SQL that ran).
  const renderedSql = steps.map((s) => s.sql).join('\n');
  const last = steps.length > 0 ? steps[steps.length - 1].result : undefined;
  /**
   * Phase 10: a relation load (`include`) or nested write is a FOLLOW-UP
   * statement — `await prisma.user.findUnique({ include: … })` resolves to the
   * PARENT row, not to the children it also fetched. Grading therefore reads
   * the last MAIN statement (the console grid shows those rows), while the SQL
   * Lens still renders every statement that ran, relation rows included.
   */
  const mainStep =
    [...steps].reverse().find((s) => (s.role ?? 'main') !== 'relation') ??
    steps[steps.length - 1];
  let affectedTotal = 0;
  let affectedSeen = false;
  for (const step of steps) {
    // Relation statements are loads/writes the call did as well; the row-effect
    // aggregate of `$transaction([...])` counts only the call's own statements.
    if ((step.role ?? 'main') === 'relation') continue;
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

  // Execution rules on the real result (`gradePrismaExecution` half) — read off
  // the MAIN statement (Phase 10: relation follow-ups never grade the call).
  // Only the array form of `$transaction([...])` replaces the last statement's
  // count with the batch aggregate — that form resolves to the list of
  // operations it ran, while the interactive form resolves to the callback's
  // return value.
  const graded: QueryExecutionResult =
    gen.rowEffect === 'sum' && affectedSeen && mainStep
      ? { ...mainStep.result, affectedRows: affectedTotal }
      : (mainStep?.result ?? last);
  const final = gradePrismaCode(code, rule, graded, renderedSql);
  if (!final.passed) {
    return done({
      passed: false,
      feedback: final.feedback,
      steps,
      result: graded,
      stage: 'validation',
    });
  }

  // Task 0.1 — final-state layer (SQL-pipeline step 6 parity). A passed
  // MUTATION is re-checked against the DATABASE: the learner's post-state must
  // match a sandbox replay of the reference's own translated SQL, so a
  // wrong-row / wrong-value write fails where `affectedRows` alone cannot tell
  // (the class `GRADING_POLICY.md` Rule 2 exists to close on the SQL track).
  if (!rule.expectFailure && preState && postState && isStateGradedPrismaTask(task)) {
    const ref = translateReference(task);
    if (ref) {
      const referenceSql = referenceStateSql(ref.gen, ref.seed);
      if (!referenceSql.unresolvedNull) {
        const stateCheck = gradeFinalState(preState, referenceSql.sql, postState);
        if (!stateCheck.ok) {
          return done({
            passed: false,
            feedback:
              stateCheck.message ??
              'The resulting database state does not match the expected outcome.',
            steps,
            result: graded,
            stage: 'final-state',
            stateOk: false,
            diffColumns: stateCheck.diffColumns,
          });
        }
        return done({
          passed: true,
          feedback: final.feedback,
          steps,
          result: graded,
          stage: 'pass',
          stateOk: true,
          inconclusive: stateCheck.inconclusive,
        });
      }
    }
  }

  return done({
    passed: true,
    feedback: final.feedback,
    steps,
    result: graded,
    stage: 'pass',
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
  /** Execution method translated ('findUnique', '$transaction', etc.). */
  method?: string;
  /** Multi-statement counting mode for $transaction ('sum' | 'last'). */
  rowEffect?: 'sum' | 'last';
  /** In-memory hydrated JavaScript/JSON object graph returned by Prisma Client. */
  stitchedJson?: unknown;
}

export function previewPrismaSubmission(options: PrismaPreviewOptions): PrismaPreviewOutcome {
  const { task, code, hooks } = options;
  const { execute, resetDatabase } = hooks;

  // Preview is idempotent the same way submit is: a `fresh` task replays from
  // seed, so repeated Runs never accumulate rows.
  if (task.databaseLifecycle === 'fresh') resetDatabase?.();
  execute(setupSqlForPrismaTask(task));

  const schema = schemaForTask(task);
  const seed = taskSeedContext(task);
  const gen = generatePrismaSql(code, { schema, seed });
  if (!gen.ok) return { ok: false, reason: gen.reason, steps: [] };

  const run = runPrismaPlan(gen, { executeQuery: execute }, { schema, seed });
  const stitchedJson = stitchPrismaExecution({
    steps: run.steps,
    schema,
    method: gen.method,
    rowEffect: gen.rowEffect,
  });
  return {
    ok: true,
    steps: run.steps,
    result: run.steps.length > 0 ? run.steps[run.steps.length - 1].result : undefined,
    method: gen.method,
    rowEffect: gen.rowEffect,
    stitchedJson,
  };
}
