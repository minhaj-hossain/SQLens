import { describe, it, expect } from 'vitest';
import { PRISMA_MODULES } from '../../src/content/prisma/prisma-curriculum-index';
import { PRISMA_ROADMAP_MILESTONES } from '../../src/content/prisma/prisma-roadmap';
import { PRISMA_MODULE_CURRICULUM_ORDER } from '../../src/content/prisma/prisma-curriculum-order';
import { SqlExecutor } from '../../src/lib/sql-engine/executor';
import { validateTaskSolution, isReadOnlySelect } from '../../src/lib/sql-engine/validator';
import { validatePrismaCode } from '../../src/lib/prisma-engine/prisma-validator';
import { isExecutablePrismaTask } from '../../src/lib/prisma-engine/prisma-submit-pipeline';
import { PRISMA_SEED_TABLES, PRISMA_SEED_USERS_SQL } from './track-foundation.test';
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

  it('shape: ≥1 concept, ≥1 task per concept, ≥1 challenge task, theory complete', () => {
    const failures: string[] = [];
    for (const mod of PRISMA_MODULES) {
      if (mod.concepts.length < 1) failures.push(`${mod.id}: no concepts`);
      for (const c of mod.concepts) {
        if ((c.tasks?.length ?? 0) < 1) failures.push(`${mod.id}/${c.id}: <1 task`);
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

describe('P2.1 — rich Prisma theory', () => {
  it('the placeholder step is gone everywhere', () => {
    const offenders: string[] = [];
    for (const mod of PRISMA_MODULES) {
      for (const c of mod.concepts) {
        for (const s of c.theory?.stepBreakdowns ?? []) {
          if (/FROM users exists/i.test(s.stepTitle)) offenders.push(`${mod.id}/${c.id}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });

  it('steps are genuine: ≥3, ordered, non-empty, valid visualData', () => {
    const failures: string[] = [];
    let conceptsWithSteps = 0;
    for (const mod of PRISMA_MODULES) {
      for (const c of mod.concepts) {
        const steps = c.theory?.prisma?.stepBreakdowns;
        if (!steps || steps.length === 0) continue;
        conceptsWithSteps++;
        if (steps.length < 3) failures.push(`${mod.id}/${c.id}: only ${steps.length} step(s)`);
        steps.forEach((s, i) => {
          if (s.stepNumber !== i + 1) failures.push(`${mod.id}/${c.id}: step ${i + 1} numbered ${s.stepNumber}`);
          if (!s.stepTitle?.trim()) failures.push(`${mod.id}/${c.id}#${s.stepNumber}: empty stepTitle`);
          if (!s.codeSnippet?.trim()) failures.push(`${mod.id}/${c.id}#${s.stepNumber}: empty codeSnippet`);
          if (!s.explanation?.trim()) failures.push(`${mod.id}/${c.id}#${s.stepNumber}: empty explanation`);
          if (s.visualData && !['sql_lens', 'type_preview', 'table_diff', 'erd_highlight'].includes(s.visualData.type)) {
            failures.push(`${mod.id}/${c.id}#${s.stepNumber}: unknown visualData type`);
          }
        });
        // Hero + mental model are part of the rich contract (hero before steps).
        if (!c.theory?.prisma?.targetHero) failures.push(`${mod.id}/${c.id}: steps without targetHero`);
        if (!c.theory?.prisma?.mentalModel?.trim()) failures.push(`${mod.id}/${c.id}: steps without mentalModel`);
      }
    }
    expect(failures).toEqual([]);
    expect(conceptsWithSteps).toBeGreaterThanOrEqual(6);
  });

  it('migrated days carry real SQL + inferred-type steps (non-vacuous)', () => {
    const migrated = ['prisma-02', 'prisma-03', 'prisma-12'];
    const failures: string[] = [];
    let sqlSteps = 0;
    let typeSteps = 0;
    for (const id of migrated) {
      const mod = PRISMA_MODULES.find((m) => m.id === id);
      if (!mod) {
        failures.push(`${id}: module missing`);
        continue;
      }
      for (const c of mod.concepts) {
        const steps = c.theory?.prisma?.stepBreakdowns ?? [];
        if (steps.length < 3) {
          failures.push(`${id}/${c.id}: fewer than 3 steps`);
          continue;
        }
        const sql = steps.filter((s) => s.visualData?.type === 'sql_lens');
        const types = steps.filter((s) => s.visualData?.type === 'type_preview');
        sqlSteps += sql.length;
        typeSteps += types.length;
        for (const s of sql) {
          if (!/\b(SELECT|INSERT|UPDATE|DELETE|BEGIN)\b/i.test(s.codeSnippet)) {
            failures.push(`${id}/${c.id}#${s.stepNumber}: sql_lens step without SQL`);
          }
        }
      }
    }
    expect(failures).toEqual([]);
    expect(sqlSteps).toBeGreaterThanOrEqual(6);
    expect(typeSteps).toBeGreaterThanOrEqual(3);
  });
});

describe('Phase 3 & Phase 4 — Schema Design & Relations concepts', () => {
  const conceptById = (moduleId: string, conceptId: string) =>
    PRISMA_MODULES.find((m) => m.id === moduleId)?.concepts.find((c) => c.id === conceptId);

  it('Phase 3 and Phase 4 concepts exist in their modules', () => {
    // Phase 3 (Day 5)
    expect(conceptById('prisma-05', 'primary-keys-and-identifiers')).toBeDefined();
    expect(conceptById('prisma-05', 'uniqueness-constraints')).toBeDefined();
    // Phase 4 (Days 6-8)
    expect(conceptById('prisma-06', 'foreign-key-bridge')).toBeDefined();
    expect(conceptById('prisma-06', 'querying-relations')).toBeDefined();
    expect(conceptById('prisma-07', 'relational-lifecycle')).toBeDefined();
    expect(conceptById('prisma-07', 'cascade-restrict-setnull')).toBeDefined();
    expect(conceptById('prisma-08', 'implicit-many-to-many')).toBeDefined();
    expect(conceptById('prisma-08', 'explicit-join-models')).toBeDefined();
    // Production concepts in later milestones
    expect(conceptById('prisma-14', 'client-extensions')).toBeDefined();
    expect(conceptById('prisma-14', 'raw-sql-escape-hatch')).toBeDefined();
  });

  it('every new concept carries rich theory (hero + mental model + ≥3 steps)', () => {
    const ids: [string, string][] = [
      ['prisma-05', 'primary-keys-and-identifiers'],
      ['prisma-06', 'foreign-key-bridge'],
      ['prisma-07', 'cascade-restrict-setnull'],
      ['prisma-08', 'explicit-join-models'],
      ['prisma-14', 'client-extensions'],
      ['prisma-14', 'raw-sql-escape-hatch'],
    ];
    const failures: string[] = [];
    for (const [mod, cid] of ids) {
      const c = conceptById(mod, cid);
      if (!c) {
        failures.push(`${mod}/${cid}: missing`);
        continue;
      }
      const p = c.theory?.prisma;
      if (!p?.targetHero) failures.push(`${mod}/${cid}: no targetHero`);
      if (!p?.mentalModel?.trim()) failures.push(`${mod}/${cid}: no mentalModel`);
      if ((p?.stepBreakdowns?.length ?? 0) < 3) failures.push(`${mod}/${cid}: <3 steps`);
    }
    expect(failures).toEqual([]);
  });

  it('explicit join model lab: @@id composite primary key on PostTag', () => {
    const c = conceptById('prisma-08', 'explicit-join-models')!;
    const lab = c.tasks.find((t) => t.id === 'prisma08-c2-t1');
    expect(lab).toBeDefined();
    expect(lab!.prisma!.solutionCode).toContain('model PostTag');
    expect(lab!.prisma!.solutionCode).toContain('@@id([postId, tagId])');
    expect(lab!.prisma!.validation.requiredCodeSnippets).toContain('@@id([postId, tagId])');
  });

  it('$extends concept bans the deprecated $use in its lab', () => {
    const c = conceptById('prisma-14', 'client-extensions')!;
    const lab = c.tasks.find((t) => t.id === 'prisma14-c2-t1')!;
    expect(lab.prisma!.validation.requiredCodeSnippets).toContain('$extends');
    expect(lab.prisma!.validation.forbiddenCodeSnippets).toContain('$use');
    expect(lab.prisma!.solutionCode).toContain('$extends');
    expect(lab.prisma!.solutionCode).not.toContain('$use');
  });

  it('$queryRaw concept composes with Prisma.sql and never concatenates', () => {
    const c = conceptById('prisma-14', 'raw-sql-escape-hatch')!;
    const t1 = c.tasks.find((t) => t.id === 'prisma14-c3-t1')!;
    const t2 = c.tasks.find((t) => t.id === 'prisma14-c3-t2')!;
    expect(t1.prisma!.solutionCode).toContain('$queryRaw');
    expect(t1.prisma!.validation.forbiddenCodeSnippets).toContain('$queryRawUnsafe');
    expect(t2.prisma!.solutionCode).toContain('Prisma.sql');
    // No string-concatenation of values into raw SQL.
    for (const t of [t1, t2]) expect(t.prisma!.solutionCode).not.toMatch(/\$\{?\w+\}?\s*\+/);
  });
});
