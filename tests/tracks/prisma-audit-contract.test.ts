/**
 * Phase 8 — Prisma grading-pipeline audit: the vitest half.
 * ─────────────────────────────────────────────────────────────────────────────
 * `scripts/audit-prisma-grading-pipeline.ts` is the bulk gate (all 70 Prisma
 * tasks, wired into `npm run audit:all` + CI). This file pins the two things a
 * bulk script cannot pin for itself:
 *
 *   1. WIRING — the script exists, routes through `submitForTask` with telemetry
 *      off, and is reachable from `audit:all` / CI / `scripts/README.md`. A gate
 *      nobody runs is not a gate.
 *   2. CONTRACT — the exact per-task assertions the script makes (solution
 *      passes, lens matches the task kind), plus the retry fingerprint and the
 *      telemetry-off guarantee, so a regression is reported by a test rather
 *      than only by a script someone has to remember to run.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest';
import { SqlExecutor } from '../../src/lib/sql-engine/executor';
import { PRISMA_MODULES } from '../../src/content/prisma/prisma-curriculum-index';
import { isExecutablePrismaTask } from '../../src/lib/prisma-engine/prisma-submit-pipeline';
import { submitForTask } from '../../src/lib/track-submit';
import { readGradingEvents } from '../../src/lib/grading-telemetry';
import type { PracticeTask } from '../../src/types/curriculum';

/** Repo file, resolved from this test file so `process.cwd()` cannot matter. */
function repoFile(rel: string): string {
  return fileURLToPath(new URL(`../../${rel}`, import.meta.url));
}

/** Every Prisma task, concept or challenge (mirrors the audit's walk). */
function allPrismaTasks(): PracticeTask[] {
  return PRISMA_MODULES.flatMap((mod) => [
    ...mod.concepts.flatMap((c) => c.tasks),
    ...(mod.challenge?.tasks ?? []),
  ]);
}

/** Any Prisma task by id. */
function taskById(id: string): PracticeTask {
  const hit = allPrismaTasks().find((t) => t.id === id);
  if (!hit) throw new Error('No Prisma task ' + id);
  return hit;
}

/** Hooks over a real session executor, matching `SqlExecutorProvider`. */
function hooksFor(exec: SqlExecutor) {
  exec.allowDdlOverwrite = true;
  return {
    execute: (sql: string) => exec.executeQuery(sql),
    getDatabaseState: () => exec.getDatabaseState(),
    getCommittedState: () => exec.getCommittedState(),
    getTransactionState: () => exec.getTransactionState(),
    resetDatabase: () => exec.resetDatabase(),
  };
}

/** Row counts per table — the fingerprint the audit compares across attempts. */
function fingerprint(exec: SqlExecutor): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [table, rows] of Object.entries(exec.getDatabaseState().tables ?? {})) {
    out[table] = (rows as unknown[]).length;
  }
  return out;
}

/** Minimal in-memory localStorage — the vitest env is `node` (no DOM). */
function memoryStorage() {
  const map = new Map<string, string>();
  return {
    getItem: (k: string) => (map.has(k) ? (map.get(k) as string) : null),
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
  };
}

describe('Phase 8 — the Prisma audit is wired into every gate', () => {
  it('the script runs the UI router with telemetry off and exits 1 on findings', () => {
    const src = readFileSync(repoFile('scripts/audit-prisma-grading-pipeline.ts'), 'utf8');
    expect(src).toContain('submitForTask');
    expect(src).toContain('record: false');
    expect(src).toContain('process.exit(1)');
  });

  it('package.json exposes it and chains it into `audit:all`', () => {
    const pkg = JSON.parse(readFileSync(repoFile('package.json'), 'utf8')) as {
      scripts: Record<string, string>;
    };
    expect(pkg.scripts['audit:prisma-grading-pipeline']).toBe(
      'tsx scripts/audit-prisma-grading-pipeline.ts',
    );
    const chain = pkg.scripts['audit:all'];
    expect(chain).toContain('npm run audit:prisma-grading-pipeline');
    // Order matters only in that it must not run before the SQL gate it mirrors.
    expect(chain.indexOf('npm run audit:prisma-grading-pipeline')).toBeGreaterThan(
      chain.indexOf('npm run audit:grading-pipeline &&'),
    );
  });

  it('CI runs it and scripts/README.md documents it', () => {
    expect(readFileSync(repoFile('.github/workflows/ci.yml'), 'utf8')).toContain(
      'npm run audit:prisma-grading-pipeline',
    );
    expect(readFileSync(repoFile('scripts/README.md'), 'utf8')).toContain(
      'audit-prisma-grading-pipeline.ts',
    );
  });

  it('Task 0.4 — the Prisma equivalence audit is wired the same way', () => {
    const src = readFileSync(repoFile('scripts/audit-prisma-equivalence.ts'), 'utf8');
    expect(src).toContain('submitForTask');
    expect(src).toContain('record: false');
    expect(src).toContain('process.exit(1)');
    const pkg = JSON.parse(readFileSync(repoFile('package.json'), 'utf8')) as {
      scripts: Record<string, string>;
    };
    expect(pkg.scripts['audit:prisma-equivalence']).toBe('tsx scripts/audit-prisma-equivalence.ts');
    const chain = pkg.scripts['audit:all'];
    expect(chain).toContain('npm run audit:prisma-equivalence');
    // Same ordering rule: it must not run before the Prisma gate it audits against.
    expect(chain.indexOf('npm run audit:prisma-equivalence')).toBeGreaterThan(
      chain.indexOf('npm run audit:prisma-grading-pipeline &&'),
    );
    expect(readFileSync(repoFile('.github/workflows/ci.yml'), 'utf8')).toContain(
      'npm run audit:prisma-equivalence',
    );
    expect(readFileSync(repoFile('scripts/README.md'), 'utf8')).toContain(
      'audit-prisma-equivalence.ts',
    );
  });
});

describe('Phase 8 — bulk router contract over every Prisma task', () => {
  it('every solution passes and the SQL Lens matches the task kind', () => {
    const problems: string[] = [];
    let executed = 0;
    let readThrough = 0;

    for (const task of allPrismaTasks()) {
      const executable = isExecutablePrismaTask(task);
      const outcome = submitForTask({
        task,
        code: task.prisma!.solutionCode,
        hooks: hooksFor(new SqlExecutor()),
        surface: 'lesson',
        attempt: 1,
        record: false,
      });

      if (!outcome.passed) {
        problems.push(`${task.id}: solution failed (${outcome.stage}) :: ${outcome.feedback ?? ''}`);
        continue;
      }

      const steps = outcome.lens?.steps.length ?? 0;
      if (executable) {
        executed++;
        if (steps === 0) problems.push(`${task.id}: executable pass with an empty lens (phantom pass)`);
      } else {
        readThrough++;
        if (steps > 0) problems.push(`${task.id}: read-through pass shows ${steps} lens step(s)`);
        else if (!outcome.lens?.note?.includes('reference dataset')) {
          problems.push(`${task.id}: read-through note does not name the reference dataset`);
        }
      }
    }

    expect(problems).toEqual([]);
    // Both kinds are present, so the loop above cannot pass vacuously.
    expect(executed).toBeGreaterThan(0);
    expect(readThrough).toBeGreaterThan(0);
  });

  it('every executable pass carries a real statement (label + SQL + result)', () => {
    const task = taskById('prisma12-hw-1');
    const outcome = submitForTask({
      task,
      code: task.prisma!.solutionCode,
      hooks: hooksFor(new SqlExecutor()),
      surface: 'challenge',
      attempt: 1,
      record: false,
    });
    expect(outcome.passed).toBe(true);
    const step = outcome.lens!.steps[0];
    expect(step.label.length).toBeGreaterThan(0);
    // A real statement against the task's table — the lens, not a placeholder.
    expect(step.sql).toMatch(/^(INSERT|UPDATE|DELETE|SELECT)\b/i);
    expect(step.sql).toContain('users');
    expect(step.result.success).toBe(true);
    expect(outcome.lens!.note).toBeUndefined();
  });
});

describe('Phase 8 — starter safety and retry idempotence', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', memoryStorage());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('starters never pass (spot-check of the STARTER_FAILS contract)', () => {
    for (const id of ['prisma12-hw-1', 'prisma07-c1-t1', 'prisma02-c1-t1']) {
      const task = taskById(id);
      const outcome = submitForTask({
        task,
        code: task.prisma!.initialCode,
        hooks: hooksFor(new SqlExecutor()),
        surface: 'lesson',
        attempt: 1,
        record: false,
      });
      expect({ id, passed: outcome.passed }).toEqual({ id, passed: false });
    }
  });

  it('a fresh task replays to the same fingerprint on a dirty executor', () => {
    const task = taskById('prisma12-hw-1');
    const exec = new SqlExecutor();
    const hooks = hooksFor(exec);

    const first = submitForTask({
      task,
      code: task.prisma!.solutionCode,
      hooks,
      surface: 'lesson',
      attempt: 1,
      record: false,
    });
    expect(first.passed).toBe(true);
    const afterFirst = fingerprint(exec);

    // Second attempt against the SAME (already mutated) executor.
    const second = submitForTask({
      task,
      code: task.prisma!.solutionCode,
      hooks,
      surface: 'lesson',
      attempt: 2,
      record: false,
    });
    expect(second.passed).toBe(true);
    expect(fingerprint(exec)).toEqual(afterFirst);

    // …and that state is the same one a brand-new session reaches, so the
    // retry neither accumulated rows nor drifted off the seed.
    const clean = new SqlExecutor();
    submitForTask({
      task,
      code: task.prisma!.solutionCode,
      hooks: hooksFor(clean),
      surface: 'lesson',
      attempt: 1,
      record: false,
    });
    expect(fingerprint(clean)).toEqual(afterFirst);
  });

  it('record:false writes no telemetry (the audit must not pollute the signal)', () => {
    const task = taskById('prisma12-hw-1');
    submitForTask({
      task,
      code: task.prisma!.solutionCode,
      hooks: hooksFor(new SqlExecutor()),
      surface: 'lesson',
      attempt: 1,
      record: false,
    });
    expect(readGradingEvents()).toEqual([]);

    // Same submit with telemetry ON: proves the buffer works and the flag is
    // what kept it empty (not a missing localStorage stub).
    submitForTask({
      task,
      code: task.prisma!.solutionCode,
      hooks: hooksFor(new SqlExecutor()),
      surface: 'lesson',
      attempt: 1,
      record: true,
    });
    const events = readGradingEvents();
    expect(events).toHaveLength(1);
    expect(events[0].taskId).toBe(task.id);
    expect(events[0].stage).toBe('pass');
  });
});
