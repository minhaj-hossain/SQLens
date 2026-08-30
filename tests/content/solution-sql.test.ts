/**
 * Content Guarantee — a task's solutionSql must ALWAYS pass its own validator (P9.7).
 *
 * The symmetric counterpart of initial-sql.test.ts: if a task's own answer
 * fails "Run & Check", the learner can never complete it legitimately.
 */
import { describe, it, expect } from 'vitest';
import { ALL_MODULES } from '../../src/content/curriculum-index';
import { SqlExecutor } from '../../src/lib/sql-engine/executor';
import { validateTaskSolution, isReadOnlySelect } from '../../src/lib/sql-engine/validator';

function fresh() {
  return new SqlExecutor();
}

describe('every task answer passes its own validator', () => {
  it('solutionSql passes validation for every practice + challenge task', () => {
    const failures: string[] = [];

    for (const mod of ALL_MODULES) {
      // One executor per module, tasks executed in curriculum order — mirrors
      // the real app, where the session executor persists across tasks, so
      // DDL (CREATE TABLE / CREATE INDEX) from earlier tasks is present.
      const ex = fresh();

      const runTask = (conceptKey: string, task: { id: string; solutionSql?: string; validation: { expectFailure?: boolean; requireExactResult?: boolean }; databaseLifecycle?: 'fresh' | 'inherit' }) => {
        // Mirror PracticeView/ChallengeView: reset BEFORE tasks marked 'fresh'.
        if (task.databaseLifecycle === 'fresh') ex.resetDatabase();
        if (task.validation.expectFailure) return; // deliberate-error labs exempt
        if (!task.solutionSql) {
          failures.push(`${mod.id}/${conceptKey}/${task.id} (no solutionSql)`);
          return;
        }
        const result = ex.executeQuery(task.solutionSql);
        // P10.3: exact-result tasks grade against the solution output.
        const expected =
          task.validation.requireExactResult && isReadOnlySelect(task.solutionSql)
            ? ex.executeQuery(task.solutionSql)
            : undefined;
        const outcome = validateTaskSolution(task.solutionSql, result, task.validation, expected);
        if (!outcome.passed) {
          failures.push(`${mod.id}/${conceptKey}/${task.id} → ${outcome.feedback ?? result.error ?? 'no feedback'}`);
        }
      };

      for (const concept of mod.concepts) {
        for (const task of concept.tasks) runTask(concept.id, task);
      }
      if (mod.challenge) {
        for (const task of mod.challenge.tasks) runTask('challenge', task);
      }
    }

    if (failures.length > 0) console.error('FAILING SOLUTIONS:\n' + failures.join('\n'));
    expect(failures).toEqual([]);
  });
});