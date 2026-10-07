/**
 * Phase 7 — Prisma UI wiring: the track decisions that were previously dead
 * (no view called the Prisma submit pipeline).
 *
 * These pin the exact contract `PracticeTaskView` + `IndependentChallengeView`
 * now consume through `src/lib/track-submit.ts`: the editor opens with the
 * track's own starter, the lens always shows either the executed statements or
 * the honest reason nothing ran, and the SQL track stays byte-identical.
 */
import { describe, it, expect } from 'vitest';
import { SqlExecutor } from '../../src/lib/sql-engine/executor';
import { runAndGradeSubmission } from '../../src/lib/sql-engine/submit-pipeline';
import { PRISMA_MODULES } from '../../src/content/prisma/prisma-curriculum-index';
import { Prisma_05_MODULE as Prisma_05_Migrations_MODULE } from '../../src/content/prisma/modules/prisma-05-migrations-seeding';
import { ALL_MODULES } from '../../src/content/curriculum-index';
import { deriveEvaluationState } from '../../src/lib/evaluation-state';
import {
  editorStarterCode,
  editorSurface,
  idleLensState,
  isPrismaTask,
  previewPrismaTask,
  solutionReveal,
  submitForTask,
} from '../../src/lib/track-submit';
import type { PracticeTask } from '../../src/types/curriculum';

/** Every Prisma task, concept or challenge (mirrors the Phase-5 audit loop). */
function allPrismaTasks(): PracticeTask[] {
  return PRISMA_MODULES.flatMap((mod) => [
    ...mod.concepts.flatMap((c) => c.tasks),
    ...(mod.challenge?.tasks ?? []),
  ]);
}

/** Any Prisma task by id. */
function prismaTaskById(id: string): PracticeTask {
  const hit = allPrismaTasks().find((t) => t.id === id);
  if (!hit) throw new Error('No Prisma task ' + id);
  return hit;
}

/** First SQL-track guided task (day-01, concept task). */
function firstSqlTask(): PracticeTask {
  const mod = ALL_MODULES.find((m) => (m.track ?? 'sql') === 'sql')!;
  return mod.concepts[0].tasks[0];
}

function fullHooks(ex: SqlExecutor) {
  return {
    execute: (sql: string) => ex.executeQuery(sql),
    getDatabaseState: () => ex.getDatabaseState(),
    getCommittedState: () => ex.getCommittedState(),
    getTransactionState: () => ex.getTransactionState(),
    resetDatabase: () => ex.resetDatabase(),
  };
}


describe('Phase 7 — editor + reveal + idle lens decisions', () => {
  it('the editor opens with the track starter: TS on Prisma, scaffold on SQL', () => {
    const prisma = prismaTaskById('prisma14-c1-t1');
    expect(editorStarterCode(prisma)).toBe(prisma.prisma!.initialCode);
    expect(editorStarterCode(prisma)).toContain('prisma.user.');
    // Loading `initialSql` into the Prisma editor would ask the learner to
    // hand-write the SQL Prisma is supposed to generate.
    expect(editorStarterCode(prisma)).not.toBe(prisma.initialSql);

    const sql = firstSqlTask();
    expect(isPrismaTask(sql)).toBe(false);
    expect(editorStarterCode(sql)).not.toContain('--');
  });

  it('solution reveal: solutionCode on Prisma, solutionSql on SQL', () => {
    const prisma = prismaTaskById('prisma14-c1-t1');
    const reveal = solutionReveal(prisma);
    expect(reveal.language).toBe('typescript');
    expect(reveal.label).toContain('TypeScript');
    expect(reveal.code).toBe(prisma.prisma!.solutionCode);

    const sql = firstSqlTask();
    expect(solutionReveal(sql)).toEqual({
      language: 'sql',
      label: 'Solution SQL',
      code: sql.solutionSql,
    });
  });

  it('editor surface: query.ts + no SQL chips + Type Inspector on Prisma', () => {
    const prisma = prismaTaskById('prisma14-c1-t1');
    const chrome = editorSurface(prisma);
    expect(chrome.fileLabel).toBe('query.ts');
    expect(chrome.showQuickChips).toBe(false);
    expect(chrome.expectedType).toBe(prisma.prisma!.expectedType);

    const sql = firstSqlTask();
    expect(editorSurface(sql)).toEqual({
      fileLabel: 'query.sql',
      showQuickChips: true,
      expectedType: null,
    });
  });
});

describe('Phase 7 — submitForTask routing', () => {
  it('a Prisma solution passes with labeled lens steps', () => {
    const task = prismaTaskById('prisma03-c1-t2');
    const ex = new SqlExecutor();
    const out = submitForTask({
      task,
      code: task.prisma!.solutionCode,
      hooks: fullHooks(ex),
      surface: 'lesson',
      record: false,
    });
    expect(out.passed).toBe(true);
    expect(out.stage).toBe('pass');
    expect(out.lens).toBeDefined();
    expect(out.lens!.steps.length).toBeGreaterThan(0);
    // Every lens step is substituted SQL with its own real result.
    for (const step of out.lens!.steps) {
      expect(step.sql).toContain('SELECT');
      expect(step.sql).not.toContain('/* param:');
      expect(step.label.length).toBeGreaterThan(0);
      expect(step.result.success).toBe(true);
      expect(step.result.rows.length).toBeGreaterThan(0);
    }
    expect(out.result?.rows.length).toBeGreaterThan(0);
  });

  it('a Prisma starter fails with feedback and an explained empty lens', () => {
    const task = prismaTaskById('prisma14-c1-t1');
    const ex = new SqlExecutor();
    const out = submitForTask({
      task,
      code: task.prisma!.initialCode,
      hooks: fullHooks(ex),
      surface: 'lesson',
      record: false,
    });
    expect(out.passed).toBe(false);
    expect(out.feedback).toBeTruthy();
    expect(out.result).toBeUndefined();
    // Static failure executes nothing: the lens is empty but explained.
    expect(out.lens!.steps).toEqual([]);
    expect(out.lens!.note).toBeTruthy();
  });

  it('a snippet-lab solution passes through the read-through contract', () => {
    const task = Prisma_05_Migrations_MODULE.concepts[0].tasks[0];
    const ex = new SqlExecutor();
    const out = submitForTask({
      task,
      code: task.prisma!.solutionCode,
      hooks: fullHooks(ex),
      surface: 'challenge',
      record: false,
    });
    expect(out.passed).toBe(true);
    // No client call was translated: the lens admits the rows are the reference.
    expect(out.lens!.steps).toEqual([]);
    expect(out.lens!.note).toContain('reference dataset');
    // P1.2: the CLI lab renders simulated terminal output instead of the
    // authored reference rows.
    expect(out.displayMode).toBe('terminal');
    // `prisma05-c1-t1` is a CLI migration lab, so the simulated run is
    // `npx prisma migrate dev`.
    expect(out.terminalOutput).toContain('$ npx prisma migrate dev');
    expect(out.result).toBeUndefined();
  });

  it('a passed snippet lab maps to the "correct" UI state — Next must be reachable', () => {
    // Day 2 · Concept 1 · Task 1 dead-end regression: a snippet lab passes with
    // `result: undefined`, and the view used to derive 'idle' from the missing
    // run result — hiding the Next button behind an unreachable state.
    const task = prismaTaskById('prisma02-c1-t1');
    const ex = new SqlExecutor();
    const out = submitForTask({
      task,
      code: task.prisma!.solutionCode,
      hooks: fullHooks(ex),
      surface: 'lesson',
      record: false,
    });
    // Pipeline contract: static labs pass without executing anything.
    expect(out.passed).toBe(true);
    expect(out.result).toBeUndefined();
    expect(out.displayMode).toBe('terminal');
    // …so the view's derivation must trust the VERDICT, not the payload.
    // (On a pass the view sets the success message → hasFeedback is true.)
    expect(
      deriveEvaluationState({
        taskPassed: out.passed,
        hasResult: out.result !== undefined,
        hasFeedback: true,
      }),
    ).toBe('correct');
  });

  it('refuses to pass a Prisma task that declares reasoning questions', () => {
    const base = prismaTaskById('prisma07-c1-t1');
    const withJudgment: PracticeTask = {
      ...base,
      validation: {
        ...base.validation,
        judgment: [
          {
            kind: 'choose-and-defend',
            prompt: 'Why pick findUnique here?',
            options: ['Unique key', 'Any filter'],
            correctIndex: 0,
            explanation: 'The key is unique.',
          },
        ],
      },
    };
    const ex = new SqlExecutor();
    const out = submitForTask({
      task: withJudgment,
      code: withJudgment.prisma!.solutionCode,
      hooks: fullHooks(ex),
      surface: 'lesson',
      record: false,
    });
    expect(out.passed).toBe(false);
    expect(out.stage).toBe('validation');
    expect(out.feedback).toContain('refuses to pass');
    expect(out.lens!.steps).toEqual([]);
  });

  it('the SQL track is byte-identical: submitForTask === runAndGradeSubmission', () => {
    const task = firstSqlTask();
    for (const code of [task.solutionSql, task.initialSql]) {
      const via = submitForTask({
        task,
        code,
        hooks: fullHooks(new SqlExecutor()),
        surface: 'lesson',
        record: false,
      });
      const direct = runAndGradeSubmission({
        task,
        sql: code,
        hooks: fullHooks(new SqlExecutor()),
        surface: 'lesson',
        record: false,
      });
      expect(via.passed).toBe(direct.passed);
      expect(via.feedback).toBe(direct.feedback);
      expect(via.stage).toBe(direct.stage);
      expect(via.reset).toBe(direct.reset);
      expect(via.txnBlocked).toBe(direct.txnBlocked);
      expect(via.lens).toBeUndefined();
      // `executionTimeMs` is wall-clock: compare everything except timing.
      const { executionTimeMs: _a, ...viaResult } = via.result ?? {};
      const { executionTimeMs: _b, ...directResult } = direct.result ?? {};
      void _a;
      void _b;
      expect(viaResult).toEqual(directResult);
    }
  });
});

describe('Phase 7 — previewPrismaTask (ungraded Run)', () => {
  it('a failing starter still shows its SQL: preview executes, never grades', () => {
    // The prisma10 starter uses `findUnique` instead of `update`:
    // static-fail against update, but the generated SELECT is real and runnable.
    const task = prismaTaskById('prisma10-c1-t1');
    const ex = new SqlExecutor();
    const preview = previewPrismaTask(task, task.prisma!.initialCode, fullHooks(ex));
    expect(preview.lens.steps.length).toBeGreaterThan(0);
    expect(preview.lens.note).toBeUndefined();
    expect(preview.result?.success).toBe(true);
    expect(preview.result?.rows.length).toBeGreaterThan(0);
  });

  it('a snippet lab preview is honest: no steps, the translation reason', () => {
    const task = prismaTaskById('prisma02-c1-t1');
    const ex = new SqlExecutor();
    const preview = previewPrismaTask(task, task.prisma!.solutionCode, fullHooks(ex));
    expect(preview.lens.steps).toEqual([]);
    expect(preview.lens.note).toBeTruthy();
    expect(preview.result).toBeUndefined();
  });

  it('preview seeds the database itself: a create preview leaves real rows', () => {
    const ex = new SqlExecutor();
    const before = ex.executeQuery('SELECT email FROM users ORDER BY id;');
    expect(before.success).toBe(false);
    const task = prismaTaskById('prisma13-hw-1');
    previewPrismaTask(task, task.prisma!.solutionCode, fullHooks(ex));
    const after = ex.executeQuery('SELECT email FROM users ORDER BY id;');
    expect(after.success).toBe(true);
    expect(after.rowCount).toBe(4);
  });
});

describe('Phase 7 — whole-track wiring invariants', () => {
  it('every Prisma solution passes submitForTask; every starter fails', () => {
    const failures: string[] = [];
    for (const task of allPrismaTasks()) {
      const good = submitForTask({
        task,
        code: task.prisma!.solutionCode,
        hooks: fullHooks(new SqlExecutor()),
        surface: 'lesson',
        record: false,
      });
      if (!good.passed) {
        failures.push(`${task.id}: solution fails → ${good.feedback}`);
        continue;
      }
      const bad = submitForTask({
        task,
        code: task.prisma!.initialCode,
        hooks: fullHooks(new SqlExecutor()),
        surface: 'lesson',
        record: false,
      });
      if (bad.passed) failures.push(`${task.id}: starter already passes`);
    }
    expect(failures).toEqual([]);
  });

  it('content wiring invariants: no judgment, starter !== solution, types present', () => {
    const problems: string[] = [];
    for (const task of allPrismaTasks()) {
      if ((task.validation.judgment?.length ?? 0) > 0) {
        problems.push(`${task.id}: authors judgment the Prisma grader cannot score`);
      }
      if (!task.prisma!.initialCode || !task.prisma!.solutionCode) {
        problems.push(`${task.id}: missing initialCode/solutionCode`);
      }
      if (task.prisma!.initialCode.trim() === task.prisma!.solutionCode.trim()) {
        problems.push(`${task.id}: starter is the solution`);
      }
      if (!task.prisma!.expectedType) {
        problems.push(`${task.id}: missing expectedType for the Type Inspector`);
      }
    }
    expect(problems).toEqual([]);
  });
});

describe('Phase 7 — editor + reveal + idle lens decisions', () => {
  it('idle lens: undefined on SQL and schema mode; a runnable hint on executable Prisma tasks', () => {
    expect(idleLensState(firstSqlTask())).toBeUndefined();
    expect(idleLensState(prismaTaskById('prisma05-c1-t1'))).toBeUndefined();

    const idle = idleLensState(prismaTaskById('prisma02-c3-t1'))!;
    expect(idle.steps).toEqual([]);
    expect(idle.note).toContain('Run your code');
  });

  it('idle lens: snippet labs say there is nothing to translate', () => {
    const idle = idleLensState(Prisma_05_Migrations_MODULE.concepts[0].tasks[0])!;
    expect(idle.steps).toEqual([]);
    expect(idle.note).toContain('no Prisma client call');
  });
});
