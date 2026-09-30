import { describe, expect, it } from 'vitest';
import { SqlExecutor } from '../../src/lib/sql-engine/executor';
import { PRISMA_TASK_SETUP_SQL } from '../../src/content/prisma/phase6-tasks';
import { runPrismaPlaygroundCode } from '../../src/lib/prisma-playground';
import {
  HERO_PRISMA_SAMPLE,
  HERO_SQL_SAMPLE,
  buildPrismaSampleRun,
  buildSqlSampleRun,
  type HeroLensEngine,
} from '../../src/lib/homepage';

/**
 * Phase 3 (Task 3.1) — the hero lens must be a REAL run, not a screenshot:
 *  - the Prisma tab goes through the curriculum's translator + runner, so the
 *    `include` call honestly becomes two statements (parent read + relation);
 *  - the SQL tab executes the hand-written JOIN on the same seed;
 *  - timings and row counts come from the engine (never fabricated), and a
 *    statement that cannot run reports the error instead of a fake row count.
 */

/** The two-table Prisma seed, booted exactly like the playground boots it. */
function seeded(): SqlExecutor {
  const exec = new SqlExecutor();
  const boot = exec.execute(PRISMA_TASK_SETUP_SQL);
  expect(boot.success, boot.error).toBe(true);
  return exec;
}

function engineFor(exec: SqlExecutor): HeroLensEngine {
  return {
    execute: (sql: string) => exec.execute(sql),
    runPrismaPlaygroundCode,
  };
}

describe('homepage hero lens samples (Task 3.1)', () => {
  it('the samples are the documented snippets', () => {
    expect(HERO_PRISMA_SAMPLE).toContain('prisma.user.findUnique');
    expect(HERO_PRISMA_SAMPLE).toContain('include');
    expect(HERO_SQL_SAMPLE.toUpperCase()).toContain('JOIN');
  });

  it('the Prisma tab runs the real translator: one call → parent read + relation load', () => {
    const run = buildPrismaSampleRun(engineFor(seeded()));
    expect(run.note).toBeNull();
    expect(run.steps).toHaveLength(2);
    expect(run.steps[0].role).toBe('main');
    expect(run.steps[1].role).toBe('relation');
    expect(run.steps[0].sql.toLowerCase()).toContain('select');
    expect(run.steps[1].sql.toLowerCase()).toContain('select');
    // Seed truth: user 1 (Alex) owns exactly two posts.
    expect(run.steps[0].rows).toBe(1);
    expect(run.steps[1].rows).toBe(2);
    for (const step of run.steps) {
      expect(step.error).toBeNull();
      expect(typeof step.ms).toBe('number');
      expect(step.ms).toBeGreaterThanOrEqual(0);
    }
    expect(run.main).not.toBeNull();
    expect(run.main?.rows[0]?.name).toBe('Alex');
  });

  it('the SQL tab returns the same three rows as one JOIN statement', () => {
    const run = buildSqlSampleRun(engineFor(seeded()));
    expect(run.note).toBeNull();
    expect(run.steps).toHaveLength(1);
    expect(run.steps[0].role).toBe('main');
    expect(run.steps[0].rows).toBe(3);
    expect(run.steps[0].error).toBeNull();
    expect(run.main?.columns).toEqual(expect.arrayContaining(['name', 'title']));
    expect(run.main?.rows.map((row) => row.title)).toEqual([
      'Hello Prisma',
      'Typed queries',
      'Migrations 101',
    ]);
  });

  it('both samples are read-only — the seed survives the demo', () => {
    const exec = seeded();
    buildPrismaSampleRun(engineFor(exec));
    buildSqlSampleRun(engineFor(exec));
    expect(exec.getDatabaseState().tables.users).toHaveLength(3);
    expect(exec.getDatabaseState().tables.posts).toHaveLength(3);
  });

  it('a statement that cannot run reports the engine error, never a fake row count', () => {
    // A plain executor carries the shop seed, not `users` — the sample must fail
    // honestly: no main result, no row count, the engine's own message.
    const run = buildSqlSampleRun(engineFor(new SqlExecutor()));
    expect(run.main).toBeNull();
    expect(run.steps[0].rows).toBeNull();
    expect(run.steps[0].error).toMatch(/users/i);
  });
});
