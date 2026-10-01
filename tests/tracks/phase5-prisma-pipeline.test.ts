/**
 * Phase 5 — Prisma submit pipeline: the integration layer between the
 * Phase-4 execution engine and the Phase-6 content model.
 *
 * One pipeline (`runAndGradePrismaSubmission`) grades every Prisma task the
 * same way the UI will: fresh-seed reset → translate → execute on the session
 * executor → static checks → execution rules → telemetry.
 */
import { describe, it, expect } from 'vitest';
import { SqlExecutor } from '../../src/lib/sql-engine/executor';
import { PRISMA_MODULES } from '../../src/content/prisma/prisma-curriculum-index';
import { renderGeneratedSql } from '../../src/lib/prisma-engine/prisma-sql-generator';
import {
  isPrismaSchemaLab,
  isPrismaTask,
  prismaCliCommandIn,
  prismaSeedContext,
  runAndGradePrismaSubmission,
  schemaForTask,
  setupSqlForPrismaTask,
  simulatePrismaCliOutput,
  snippetLabDisplay,
  PRISMA_SEED_SCHEMA,
} from '../../src/lib/prisma-engine/prisma-submit-pipeline';
import {
  canonicalizeCli,
  isCliFragment,
  validatePrismaCode,
} from '../../src/lib/prisma-engine/prisma-validator';
import type { PracticeTask } from '../../src/types/curriculum';

function hooksFor(ex: SqlExecutor, resets: { n: number } = { n: 0 }) {
  return {
    execute: (sql: string) => ex.executeQuery(sql),
    resetDatabase: () => {
      resets.n++;
      ex.resetDatabase();
    },
  };
}

function firstPrismaTask(): PracticeTask {
  const mod = PRISMA_MODULES.find((m) => m.id === 'prisma-01')!;
  return mod.concepts[0].tasks[0];
}

/** Any Prisma task by id (concept task or challenge task). */
function taskById(id: string): PracticeTask {
  for (const mod of PRISMA_MODULES) {
    const hit = [...mod.concepts.flatMap((c) => c.tasks), ...(mod.challenge?.tasks ?? [])].find(
      (t) => t.id === id,
    );
    if (hit) return hit;
  }
  throw new Error('No Prisma task ' + id);
}

/** Submit `code` for `task` on a fresh session executor (telemetry off). */
function submit(task: PracticeTask, code: string) {
  const ex = new SqlExecutor();
  return {
    ex,
    out: runAndGradePrismaSubmission({
      task,
      code,
      hooks: hooksFor(ex),
      surface: 'lesson',
      record: false,
    }),
  };
}

describe('Phase 5 — Prisma submit pipeline', () => {
  it('guards, seed context, schema and setup helpers', () => {
    expect(isPrismaTask(firstPrismaTask())).toBe(true);
    expect(isPrismaTask({ id: 'x', validation: {} } as PracticeTask)).toBe(false);
    const seed = prismaSeedContext({ email: 'mina@prisma.io' });
    expect(seed.tables.users).toHaveLength(3);
    expect(seed.variables?.email).toBe('mina@prisma.io');
    // Phase 10: the seed universe is two tables — `users` and its `posts`.
    expect(schemaForTask(firstPrismaTask()).models.map((m) => m.name)).toEqual(['User', 'Post']);
    expect(setupSqlForPrismaTask(firstPrismaTask())).toContain('CREATE TABLE users');
    expect(PRISMA_SEED_SCHEMA).toContain('model User');
  });

  it('grades a correct solutionCode as pass with the SQL lens attached', () => {
    const task = firstPrismaTask();
    const ex = new SqlExecutor();
    const out = runAndGradePrismaSubmission({
      task,
      code: task.prisma!.solutionCode,
      hooks: hooksFor(ex),
      surface: 'lesson',
      record: false,
    });
    expect(out.passed).toBe(true);
    expect(out.stage).toBe('pass');
    expect(out.generatedSql.length).toBeGreaterThan(0);
    expect(out.generatedSql[0]).toContain('SELECT');
    expect(out.result?.success).toBe(true);
  });

  it('rejects the starter (static failure, nothing executed)', () => {
    const task = firstPrismaTask();
    const ex = new SqlExecutor();
    const out = runAndGradePrismaSubmission({
      task,
      code: task.prisma!.initialCode,
      hooks: hooksFor(ex),
      surface: 'lesson',
      record: false,
    });
    expect(out.passed).toBe(false);
    expect(out.stage).toBe('validation');
    expect(out.result).toBeUndefined();
  });

  it('reports untranslatable snippet labs via the read-through contract', () => {
    // Snippet labs (CLI / schema.prisma / URL / Zod) have no client call:
    // static + reference-dataset grading, never invented SQL.
    const task = firstPrismaTask();
    const ex = new SqlExecutor();
    const out = runAndGradePrismaSubmission({
      task,
      code: 'npx prisma migrate dev --name init',
      hooks: hooksFor(ex),
      surface: 'lesson',
      record: false,
    });
    expect(out.passed).toBe(false);
    expect(out.generatedSql).toEqual([]);
    expect(out.feedback).toBeTruthy();
  });

  it('resets `fresh`-lifecycle tasks at submit so retries stay idempotent', () => {
    const task = { ...firstPrismaTask(), databaseLifecycle: 'fresh' as const };
    const ex = new SqlExecutor();
    const resets = { n: 0 };
    runAndGradePrismaSubmission({
      task,
      code: task.prisma!.solutionCode,
      hooks: hooksFor(ex, resets),
      surface: 'lesson',
      record: false,
    });
    expect(resets.n).toBe(1);
  });

  it('every Phase-6 solutionCode passes its own pipeline; every starter fails', () => {
    const failures: string[] = [];
    for (const mod of PRISMA_MODULES) {
      const all = [...mod.concepts.flatMap((c) => c.tasks), ...(mod.challenge?.tasks ?? [])];
      for (const task of all) {
        if (!isPrismaTask(task)) {
          failures.push(`${task.id}: not a Prisma task`);
          continue;
        }
        const ex = new SqlExecutor();
        const good = runAndGradePrismaSubmission({
          task,
          code: task.prisma!.solutionCode,
          hooks: hooksFor(ex),
          surface: 'lesson',
          record: false,
        });
        if (!good.passed) {
          failures.push(`${mod.id}/${task.id}: solution fails → ${good.feedback}`);
          continue;
        }
        const ex2 = new SqlExecutor();
        const bad = runAndGradePrismaSubmission({
          task,
          code: task.prisma!.initialCode,
          hooks: hooksFor(ex2),
          surface: 'lesson',
          record: false,
        });
        if (bad.passed) failures.push(`${mod.id}/${task.id}: starter already passes`);
      }
    }
    expect(failures).toEqual([]);
  });

  it('counts multi-statement rows by the transaction form Prisma resolves to', () => {
    // Array form: $transaction([a, b]) resolves to the LIST of operations, so
    // the batch grades the SUM of both updates' row effects (2), never the
    // last statement's 1.
    const arrayTask = taskById('prisma12-c2-t1');
    const array = submit(arrayTask, arrayTask.prisma!.solutionCode);
    expect(array.out.passed).toBe(true);
    expect(array.out.generatedSql).toHaveLength(2);
    expect(array.out.result?.affectedRows).toBe(2);

    // Interactive form: $transaction(async (tx) => ...) resolves to the
    // callback's return value, so the LAST statement's own count is graded —
    // and the demo binding keeps the SQL Lens runnable (buyerEmail resolves
    // through the seeded email, not an honest-but-useless NULL).
    const hw = taskById('prisma12-hw-1');
    const interactive = submit(hw, hw.prisma!.solutionCode);
    expect(interactive.out.passed).toBe(true);
    expect(interactive.out.generatedSql).toHaveLength(2);
    expect(interactive.out.generatedSql[0]).toContain("WHERE email = 'mina@prisma.io'");
    expect(interactive.out.generatedSql[1]).toContain('INSERT INTO users');
    expect(interactive.ex.executeQuery('SELECT email FROM users ORDER BY id;').rowCount).toBe(4);
  });

  it('renders param markers through one shared path (pipeline + proxy)', () => {
    const stmt = {
      sql: 'SELECT id, email FROM users WHERE email = /* param:email */ AND name = /* param:name */;',
      params: [
        { name: 'email', source: 'buyerEmail' },
        { name: 'name', source: 'getName()' },
      ],
      label: 'read',
    };
    // The FIELD a marker belongs to binds through the demo variables; an
    // expression nobody can resolve stays an honest NULL.
    expect(renderGeneratedSql(stmt)).toBe(
      "SELECT id, email FROM users WHERE email = 'mina@prisma.io' AND name = NULL;",
    );
    // A caller binding for the learner's own expression wins over the demo one.
    expect(renderGeneratedSql(stmt, { tables: {}, variables: { buyerEmail: 'x@y.io' } })).toBe(
      "SELECT id, email FROM users WHERE email = 'x@y.io' AND name = NULL;",
    );

    // Params are recorded in EVALUATION order (where before data), which is the
    // reverse of the statement — so markers must bind by NAME, never by
    // position (the live shape of prisma13-c1-t2's update).
    const reversed = {
      sql: 'UPDATE users SET name = /* param:name */ WHERE id = /* param:id */;',
      params: [
        { name: 'id', source: 'someId' },
        { name: 'name', source: 'req.body.name' },
      ],
      label: 'update',
    };
    expect(renderGeneratedSql(reversed)).toBe('UPDATE users SET name = NULL WHERE id = 1;');
  });
});

describe('P1.2 — snippet-lab terminal display contract', () => {
  it('extracts the CLI command (flags included) and classifies schema labs', () => {
    expect(prismaCliCommandIn('return "npx prisma migrate dev --name init";')).toBe(
      'npx prisma migrate dev --name init',
    );
    expect(prismaCliCommandIn('const u = await prisma.user.findMany();')).toBeNull();
    expect(isPrismaSchemaLab('model User {\n  id Int @id\n}')).toBe(true);
    expect(isPrismaSchemaLab('const u = await prisma.user.findMany();')).toBe(false);
  });

  it('simulates the taught CLI commands deterministically, echoing the command', () => {
    const generate = simulatePrismaCliOutput('npx prisma generate');
    expect(generate.startsWith('$ npx prisma generate')).toBe(true);
    expect(generate).toContain('✔ Generated Prisma Client (v7.0.0) in 34ms');

    const migrate = simulatePrismaCliOutput('npx prisma migrate dev --name init');
    expect(migrate).toContain('Applying migration `20260930000000_init`');
    expect(migrate).toContain('✔ Your database is now in sync with your schema.');

    // Unknown-but-real commands still get an honest, command-echoing output.
    expect(simulatePrismaCliOutput('npx prisma validate')).toContain('$ npx prisma validate');
    // Deterministic: same command → byte-identical output.
    expect(simulatePrismaCliOutput('npx prisma generate')).toBe(generate);
  });

  it('attaches terminal output to CLI labs and drops the reference rows', () => {
    const task = taskById('prisma02-c1-t1');
    const { out } = submit(task, task.prisma!.solutionCode);
    expect(out.passed).toBe(true);
    expect(out.displayMode).toBe('terminal');
    expect(out.terminalOutput).toContain('$ npx prisma generate');
    // The authored reference rows are the dataset, not the learner's run.
    expect(out.result).toBeUndefined();
    expect(out.steps).toEqual([]);
  });

  it('schema.prisma labs get a comment notice, never a fake validate run', () => {
    const display = snippetLabDisplay('model User {\n  id Int @id\n  email String @unique\n}');
    expect(display?.displayMode).toBe('terminal');
    expect(display?.terminalOutput).toContain('# schema.prisma lab');
    // URL/Zod-style labs stay null → the read-through dataset contract applies.
    expect(snippetLabDisplay('const url = process.env.DATABASE_URL')).toBeNull();
  });

  it('sweep: every CLI/schema lab renders terminal with no rows; other labs keep the dataset invariant', () => {
    let cli = 0;
    let schema = 0;
    const failures: string[] = [];
    for (const mod of PRISMA_MODULES) {
      const all = [...mod.concepts.flatMap((c) => c.tasks), ...(mod.challenge?.tasks ?? [])];
      for (const task of all) {
        const ex = new SqlExecutor();
        const out = runAndGradePrismaSubmission({
          task,
          code: task.prisma!.solutionCode,
          hooks: hooksFor(ex),
          surface: 'lesson',
          record: false,
        });
        if (!out.readThrough) continue;
        const display = snippetLabDisplay(task.prisma!.solutionCode);
        if (display) {
          if (prismaCliCommandIn(task.prisma!.solutionCode)) cli++;
          else schema++;
          if (out.displayMode !== 'terminal') failures.push(`${task.id}: no terminal display`);
          if (!out.terminalOutput) failures.push(`${task.id}: empty terminal output`);
          if (out.result !== undefined) failures.push(`${task.id}: reference rows leaked`);
        } else {
          if (out.displayMode !== undefined) failures.push(`${task.id}: unexpected displayMode`);
          // Reference-dataset invariant for non-terminal labs: rows iff conclusive.
          if (out.inconclusive && out.result !== undefined) {
            failures.push(`${task.id}: inconclusive but rows attached`);
          }
          if (!out.inconclusive && out.result === undefined) {
            failures.push(`${task.id}: conclusive but no rows attached`);
          }
        }
      }
    }
    expect(failures).toEqual([]);
    // Non-vacuous: the curriculum really contains both kinds of snippet lab.
    expect(cli).toBeGreaterThanOrEqual(1);
    expect(schema).toBeGreaterThanOrEqual(1);
  });
});

describe('P1.1 — CLI snippet normalization (validator + display)', () => {
  /** The curriculum's only CLI-shaped labs (4 CLI fragments — 1.1.0 census). */
  const CLI_TASK_IDS = ['prisma02-c1-t1', 'prisma05-c1-t1', 'prisma05-c1-t2'];
  /** Every runner alias from the Task-1.1 D3b set — all ≡ `npx prisma`. */
  const RUNNERS = [
    'pnpm dlx prisma',
    'pnpm exec prisma',
    'npm exec prisma',
    'yarn prisma',
    'yarn dlx prisma',
    'bunx prisma',
  ];

  it('accepts every package-runner variant of every CLI lab, rendering its own command', () => {
    let cliFragments = 0;
    for (const id of CLI_TASK_IDS) {
      const task = taskById(id);
      cliFragments += (task.prisma!.validation.requiredCodeSnippets ?? []).filter((s) => isCliFragment(s)).length;
      const sol = task.prisma!.solutionCode;
      // The authored form must be untouched by the normalizer.
      expect(submit(task, sol).out.passed, `${id} authored`).toBe(true);
      for (const runner of RUNNERS) {
        const code = sol.replace('npx prisma', runner);
        expect(code === sol ? 'REWRITE-FAILED' : runner, `${id} rewrite`).toBe(runner);
        const { out } = submit(task, code);
        expect(out.passed, `${id} / ${runner}`).toBe(true);
        expect(out.displayMode, `${id} / ${runner} display`).toBe('terminal');
        // The terminal echoes the LEARNER'S runner, not the authored one.
        expect(out.terminalOutput ?? '', `${id} / ${runner} echo`).toContain(runner);
      }
    }
    // Non-vacuous: exactly the 3 CLI labs / 4 CLI fragments the census found.
    expect(CLI_TASK_IDS).toHaveLength(3);
    expect(cliFragments).toBe(4);
  });

  it('accepts quoted / equals flag values and parses the migration name from them', () => {
    const task = taskById('prisma05-c1-t1');
    const sol = task.prisma!.solutionCode; // `… --name init_users`
    const quoted = sol.replace('--name init_users', '--name "init_users"');
    const equals = sol.replace('--name init_users', '--name=init_users');
    expect(quoted).not.toBe(sol);
    expect(equals).not.toBe(sol);
    for (const [label, code] of [
      ['quoted', quoted],
      ['equals', equals],
    ] as const) {
      const { out } = submit(task, code);
      expect(out.passed, label).toBe(true);
      expect(out.displayMode, label).toBe('terminal');
      // The migration name is the unwrapped VALUE — never `"init_users"`.
      expect(out.terminalOutput ?? '', label).toContain('Applying migration `20260930000000_init_users`');
    }
    // Extraction keeps the learner's own flag spelling in the echoed command…
    expect(prismaCliCommandIn(quoted)).toBe('npx prisma migrate dev --name "init_users"');
    expect(prismaCliCommandIn(equals)).toBe('npx prisma migrate dev --name=init_users');
  });

  it('treats double-spaced and newline-split commands as the same command', () => {
    const gen = taskById('prisma02-c1-t1');
    const t1 = taskById('prisma05-c1-t1');
    const t2 = taskById('prisma05-c1-t2');
    expect(submit(gen, gen.prisma!.solutionCode.replace('npx prisma generate', 'npx prisma\n  generate')).out.passed).toBe(true);
    expect(submit(t1, t1.prisma!.solutionCode.replace('npx prisma', 'npx  prisma')).out.passed).toBe(true);
    expect(submit(t1, t1.prisma!.solutionCode.replace('migrate dev', 'migrate\n    dev')).out.passed).toBe(true);
    expect(submit(t2, t2.prisma!.solutionCode.replace('npx prisma', 'npx\n  prisma')).out.passed).toBe(true);
  });

  it('still rejects starters, dropped fragments, wrong subcommands and forbidden commands', () => {
    // Every authored starter keeps failing at the validation stage.
    for (const id of CLI_TASK_IDS) {
      const task = taskById(id);
      const { out } = submit(task, task.prisma!.initialCode);
      expect(out.passed, `${id} starter`).toBe(false);
      expect(out.stage, `${id} starter stage`).toBe('validation');
    }
    const t1 = taskById('prisma05-c1-t1'); // migrate dev lab; forbids `db push`
    const t2 = taskById('prisma05-c1-t2'); // migrate deploy lab; forbids `migrate dev`
    // A runner variant with the WRONG subcommand still fails.
    expect(submit(t1, 'const cmd = "pnpm dlx prisma db push";').out.passed).toBe(false);
    // A runner variant missing the `--name` fragment still fails.
    expect(submit(t1, 'const cmd = "bunx prisma migrate dev";').out.passed).toBe(false);
    // The forbidden command via ANOTHER runner still fails.
    const cross = submit(t2, 'const cmd = "pnpm dlx prisma migrate deploy";\nconst evil = "bunx prisma migrate dev";');
    expect(cross.out.passed).toBe(false);
    expect(cross.out.stage).toBe('validation');
    // Forbidden caught under whitespace mangling raw `includes` would miss.
    const spaced = submit(t2, 'const cmd = "npx prisma migrate deploy";\n// migrate   dev');
    expect(spaced.out.passed).toBe(false);
    expect(spaced.out.feedback ?? '').toContain('Remove forbidden code: `migrate dev`');
  });

  it('quotes the AUTHORED fragment in failures; non-CLI fragments keep the literal contract', () => {
    const gen = taskById('prisma02-c1-t1');
    // Failure text always shows the authored spelling, even for runner variants.
    const miss = validatePrismaCode('return "pnpm dlx prisma validate";', gen.prisma!.validation);
    expect(miss.passed).toBe(false);
    expect(miss.feedback).toBe('Missing required code: `npx prisma generate`.');
    // Fragment classification: command vocabulary is canonicalized…
    for (const f of ['npx prisma migrate dev', '--name', 'db push', 'migrate dev', 'pnpm dlx prisma generate']) {
      expect(isCliFragment(f), f).toBe(true);
    }
    // …everything else (schema / client / Zod / SQL) stays literal.
    for (const f of ['z.object(', 'z.string().email()', '@map("cust_email")', 'select: { id: true, email: true }', 'sqlite', 'prisma.user.create(']) {
      expect(isCliFragment(f), f).toBe(false);
    }
    // Canonical view: the same command, spelled differently.
    expect(canonicalizeCli('pnpm dlx prisma migrate dev --name "init"')).toBe('npx prisma migrate dev --name init');
    expect(canonicalizeCli('bunx prisma migrate\n  dev --name=init')).toBe('npx prisma migrate dev --name init');
    // A NON-CLI fragment must NOT normalize (quoted keys stay Phase 1.2).
    const zod = taskById('prisma09-c2-t1');
    const spacedZod = zod.prisma!.solutionCode.replace('z.object(', 'z . object(');
    expect(spacedZod).not.toBe(zod.prisma!.solutionCode);
    expect(validatePrismaCode(spacedZod, zod.prisma!.validation).passed).toBe(false);
  });
});
