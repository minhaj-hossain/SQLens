/**
 * Content Guarantee — a task's initialSql must NEVER be the complete answer (P9.6).
 *
 * Running validators on the initialSql alone must NOT pass, otherwise a task is
 * completable by just pressing "Run & Check" with zero typing.
 */
import { describe, it, expect } from 'vitest';
import { ALL_MODULES } from '../../src/content/curriculum-index';
import { SqlExecutor } from '../../src/lib/sql-engine/executor';
import { validateTaskSolution } from '../../src/lib/sql-engine/validator';

function fresh() {
  return new SqlExecutor();
}

describe('no task ships its own answer', () => {
  it('initialSql does not already pass validation for any guided task', () => {
    const ex = fresh();
    const failures: string[] = [];
    const fs = require('fs');

    for (const mod of ALL_MODULES) {
      for (const concept of mod.concepts) {
        for (const task of concept.tasks) {
          // Deliberate-error labs expect the engine to reject — exempt.
          if (task.validation.expectFailure) continue;
          const result = ex.executeQuery(task.initialSql);
          const outcome = validateTaskSolution(task.initialSql, result, task.validation);
          if (outcome.passed) {
            failures.push(`${mod.id}/${concept.id}/${task.id}`);
            // eslint-disable-next-line no-console
            try { fs.appendFileSync('fail.txt', `${mod.id}/${concept.id}/${task.id}\n`); } catch {}
          }
          // Reset per-task so DML tasks don't leak state.
          ex.resetDatabase();
        }
      }
    }

    expect(failures).toEqual([]);
  });
});