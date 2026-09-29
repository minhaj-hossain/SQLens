import { describe, it, expect } from 'vitest';
import { PRISMA_MODULES } from '../../src/content/prisma/prisma-curriculum-index';
import { PRISMA_ROADMAP_MILESTONES } from '../../src/content/prisma/prisma-roadmap';
import { PRISMA_MODULE_CURRICULUM_ORDER } from '../../src/content/prisma/prisma-curriculum-order';
import { SqlExecutor } from '../../src/lib/sql-engine/executor';
import { validateTaskSolution, isReadOnlySelect } from '../../src/lib/sql-engine/validator';
import { validatePrismaCode } from '../../src/lib/prisma-engine/prisma-validator';
import { PRISMA_SEED_TABLES, PRISMA_SEED_USERS_SQL } from './phase1-foundation.test';
import type { PracticeTask } from '../../src/types/curriculum';

/**
 * Fresh database for one task. Phase-6 tasks carry their own `setupSql`; the
 * legacy pilot (prisma-01) has none and shares the Phase-1 users seed.
 */
function freshSeeded(task: PracticeTask) {
  const ex = new SqlExecutor();
  const bootstrap = task.setupSql ?? PRISMA_SEED_USERS_SQL;
  const boot = ex.executeQuery(bootstrap);
  return { ex, boot };
}

/**
 * Reference output for `requireExactResult` tasks — same rule as the app
 * (`solution-sql.test.ts` / `submit-pipeline.ts`): replay the solution on an
 * identical fresh database and grade the learner against that dataset.
 */
function referenceResult(task: PracticeTask) {
  if (!task.solutionSql || !isReadOnlySelect(task.solutionSql)) return undefined;
  const { ex } = freshSeeded(task);
  return ex.executeQuery(task.solutionSql);
}

describe('Phase 6 — full Prisma track (prisma-01 … prisma-14)', () => {
  it('has 14 modules, prisma-01 first, prisma-14 last, ids unique + ordered', () => {
    expect(PRISMA_MODULES.length).toBe(14);
    expect(PRISMA_MODULES[0].id).toBe('prisma-01');
    expect(PRISMA_MODULES[13].id).toBe('prisma-14');
    const ids = PRISMA_MODULES.map((m) => m.id);
    expect(new Set(ids).size).toBe(14);
    PRISMA_MODULES.forEach((m, i) => {
      expect(PRISMA_MODULE_CURRICULUM_ORDER[m.id]?.curriculumOrder).toBe(i + 1);
      expect(m.day).toBe(i + 1);
      expect(m.track).toBe('prisma');
    });
  });

  it('every milestone id resolves to existing modules', () => {
    const ids = new Set(PRISMA_MODULES.map((m) => m.id));
    for (const ms of PRISMA_ROADMAP_MILESTONES) {
      expect(ms.moduleIds.length).toBeGreaterThan(0);
      for (const id of ms.moduleIds) expect(ids.has(id), `milestone ${ms.id} → missing ${id}`).toBe(true);
    }
    expect(PRISMA_ROADMAP_MILESTONES.flatMap((m) => m.moduleIds).sort()).toEqual(
      PRISMA_MODULES.map((m) => m.id).sort(),
    );
  });

  it('shape: ≥1 concept, ≥2 tasks per concept, ≥1 challenge task, theory complete', () => {
    const failures: string[] = [];
    for (const mod of PRISMA_MODULES) {
      if (mod.concepts.length < 1) failures.push(`${mod.id}: no concepts`);
      for (const c of mod.concepts) {
        if ((c.tasks?.length ?? 0) < 2) failures.push(`${mod.id}/${c.id}: <2 tasks`);
        if (!c.theory?.summary) failures.push(`${mod.id}/${c.id}: missing theory.summary`);
        if (!c.theory?.keyTakeaway) failures.push(`${mod.id}/${c.id}: missing keyTakeaway`);
        if (!c.theory?.targetQuery?.sql) failures.push(`${mod.id}/${c.id}: missing targetQuery`);
        if (!c.theory?.exampleQuery) failures.push(`${mod.id}/${c.id}: missing exampleQuery`);
        if (!c.theory?.liveDemoSql) failures.push(`${mod.id}/${c.id}: missing liveDemoSql`);
      }
      if ((mod.challenge?.tasks?.length ?? 0) < 1) failures.push(`${mod.id}: no challenge tasks`);
    }
    expect(failures).toEqual([]);
  });

  it('SQL lens: only seeded tables; solutionSql passes; initialSql fails', () => {
    const failures: string[] = [];
    const allowed = new Set(PRISMA_SEED_TABLES.map((t) => t.toLowerCase()));
    for (const mod of PRISMA_MODULES) {
      const all = [...mod.concepts.flatMap((c) => c.tasks), ...(mod.challenge?.tasks ?? [])];
      for (const task of all) {
        const ref = (task.primaryTable ?? '').toLowerCase();
        if (!allowed.has(ref)) failures.push(`${task.id}: primaryTable '${task.primaryTable}' not in seed universe`);
        for (const s of task.secondaryTables ?? []) {
          if (!allowed.has(s.toLowerCase())) failures.push(`${task.id}: secondaryTable '${s}' not in seed universe`);
        }
        if (!task.solutionSql) { failures.push(`${task.id}: no solutionSql`); continue; }
        if (task.validation.expectFailure) continue;
        const expected = referenceResult(task);

        // The authored solution must pass its own validator (a learner can
        // never complete a task whose answer is rejected).
        const { ex, boot } = freshSeeded(task);
        if (!boot.success) { failures.push(`${mod.id}/${task.id} seed → ${boot.error}`); continue; }
        const result = ex.executeQuery(task.solutionSql);
        const outcome = validateTaskSolution(task.solutionSql, result, task.validation, expected);
        if (!outcome.passed) failures.push(`${mod.id}/${task.id} solution → ${outcome.feedback ?? result.error}`);
        expect(task.prisma, `${task.id} missing prisma content`).toBeDefined();

        // Starter must NOT already pass (no task ships its own answer).
        if (task.initialSql) {
          const { ex: ex2, boot: boot2 } = freshSeeded(task);
          if (!boot2.success) { failures.push(`${mod.id}/${task.id} starter seed → ${boot2.error}`); continue; }
          const r2 = ex2.executeQuery(task.initialSql);
          const o2 = validateTaskSolution(task.initialSql, r2, task.validation, expected);
          if (o2.passed) failures.push(`${mod.id}/${task.id}: initialSql already passes`);
        }
      }
    }
    expect(failures).toEqual([]);
  });

  it('every module points at the milestone that lists it', () => {
    const milestones = new Map(PRISMA_ROADMAP_MILESTONES.map((m) => [m.id, m]));
    const failures: string[] = [];
    for (const mod of PRISMA_MODULES) {
      const ms = milestones.get(mod.milestoneId ?? '');
      if (!ms) failures.push(`${mod.id}: unknown milestone '${mod.milestoneId}'`);
      else if (!ms.moduleIds.includes(mod.id)) failures.push(`${mod.id}: not listed in ${ms.id}`);
    }
    expect(failures).toEqual([]);
  });

  it('Prisma code: solution passes, starter fails, all ids unique', () => {
    const failures: string[] = [];
    const seen = new Set<string>();
    for (const mod of PRISMA_MODULES) {
      const all = [...mod.concepts.flatMap((c) => c.tasks), ...(mod.challenge?.tasks ?? [])];
      for (const task of all) {
        if (seen.has(task.id)) failures.push(`duplicate task id ${task.id}`);
        seen.add(task.id);
        const p = task.prisma!;
        if (!p.solutionCode || !p.initialCode) { failures.push(`${task.id}: missing prisma code`); continue; }
        const solution = validatePrismaCode(p.solutionCode, p.validation);
        if (!solution.passed) {
          failures.push(`${mod.id}/${task.id}: solutionCode fails → ${solution.feedback}`);
        }
        const starter = validatePrismaCode(p.initialCode, p.validation);
        if (starter.passed) {
          failures.push(`${mod.id}/${task.id}: initialCode already passes prisma validator`);
        }
      }
    }
    expect(failures).toEqual([]);
  });
});
