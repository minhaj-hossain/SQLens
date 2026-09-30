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
  isPrismaTask,
  prismaSeedContext,
  runAndGradePrismaSubmission,
  schemaForTask,
  setupSqlForPrismaTask,
  PRISMA_SEED_SCHEMA,
} from '../../src/lib/prisma-engine/prisma-submit-pipeline';
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
