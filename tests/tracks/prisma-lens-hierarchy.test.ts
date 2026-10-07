import { describe, expect, it } from 'vitest';
import { PRISMA_MODULES } from '../../src/content/prisma/prisma-curriculum-index';
import { submitForTask, previewPrismaTask } from '../../src/lib/track-submit';
import { SqlExecutor } from '../../src/lib/sql-engine/executor';
import type { PracticeTask } from '../../src/types/curriculum';

function findTask(id: string): PracticeTask {
  for (const mod of PRISMA_MODULES) {
    for (const concept of mod.concepts) {
      const hit = concept.tasks.find((t) => t.id === id);
      if (hit) return hit;
    }
    const challengeHit = mod.challenge?.tasks.find((t) => t.id === id);
    if (challengeHit) return challengeHit;
  }
  throw new Error(`Task not found: ${id}`);
}

function hooksFor(exec: SqlExecutor) {
  return {
    execute: (sql: string) => exec.executeQuery(sql),
    getDatabaseState: () => exec.getDatabaseState(),
    getCommittedState: () => exec.getCommittedState(),
    getTransactionState: () => exec.getTransactionState(),
    resetDatabase: () => exec.resetDatabase(),
  };
}

describe('Phase 14 — SQL Lens Hierarchy & Transaction Semantics', () => {
  it('marks relation follow-up queries with role relation on include tasks', () => {
    // include task: getAuthorWithPosts (findUnique with include: { posts: true })
    const task = findTask('prisma07-c2-t2');
    const exec = new SqlExecutor();
    const outcome = submitForTask({
      task,
      code: task.prisma!.solutionCode,
      hooks: hooksFor(exec),
      surface: 'lesson',
      attempt: 1,
      record: false,
    });

    expect(outcome.passed).toBe(true);
    expect(outcome.lens).toBeDefined();
    const steps = outcome.lens!.steps;
    expect(steps.length).toBeGreaterThanOrEqual(2);

    // Main step: query for parent User
    expect(steps[0].role).toBe('main');
    expect(steps[0].label).toMatch(/read|findUnique/);

    // Follow-up step: relation query for posts
    expect(steps[1].role).toBe('relation');
    expect(steps[1].label).toContain('include posts');
  });

  it('preserves relation tagging and metadata in previewPrismaTask', () => {
    const task = findTask('prisma07-c2-t2');
    const exec = new SqlExecutor();
    const preview = previewPrismaTask(task, task.prisma!.solutionCode, hooksFor(exec));

    expect(preview.lens).toBeDefined();
    expect(preview.lens.steps.length).toBeGreaterThanOrEqual(2);
    expect(preview.lens.steps[0].role).toBe('main');
    expect(preview.lens.steps[1].role).toBe('relation');
  });

  it('attaches batch transaction metadata (rowEffect sum) on $transaction([...])', () => {
    // Day 12 Concept 2 Task 1: batch transaction
    const task = findTask('prisma12-c2-t1');
    const exec = new SqlExecutor();
    const outcome = submitForTask({
      task,
      code: task.prisma!.solutionCode,
      hooks: hooksFor(exec),
      surface: 'lesson',
      attempt: 1,
      record: false,
    });

    expect(outcome.passed).toBe(true);
    expect(outcome.lens).toBeDefined();
    expect(outcome.lens!.method).toBe('$transaction');
    expect(outcome.lens!.rowEffect).toBe('sum');
  });

  it('attaches interactive transaction metadata (rowEffect last) on $transaction(async tx => ...)', () => {
    // Day 12 Concept 2 Task 2: interactive transaction callback
    const task = findTask('prisma12-c2-t2');
    const exec = new SqlExecutor();
    const outcome = submitForTask({
      task,
      code: task.prisma!.solutionCode,
      hooks: hooksFor(exec),
      surface: 'lesson',
      attempt: 1,
      record: false,
    });

    expect(outcome.passed).toBe(true);
    expect(outcome.lens).toBeDefined();
    expect(outcome.lens!.method).toBe('$transaction');
    expect(outcome.lens!.rowEffect).toBe('last');
  });
});
