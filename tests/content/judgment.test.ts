/**
 * P1 — task-level reasoning grading (`ValidationRule.judgment`).
 *
 * DIALECT §10: reasoning is graded by judgment[] exercises (choose-and-defend,
 * predict-failure, diagnose-plan, compare-tradeoff), never by keyword regex.
 * This suite pins two contracts:
 *   1. CONTENT — every authored item is well-formed (valid kind, >= 3 unique
 *      options, in-bounds correctIndex, a real explanation), and every day the
 *      spec lists a Judgment MCQ for actually carries one.
 *   2. GATE — the validator fails unanswered/wrong picks with the authored
 *      explanation, passes correct answers, and always lets a SQL failure
 *      surface BEFORE the reasoning gate (reachable, refutable, ordered).
 */
import { describe, it, expect } from 'vitest';
import { ALL_MODULES } from '../../src/content/curriculum-index';
import { SqlExecutor } from '../../src/lib/sql-engine/executor';
import { validateTaskSolution } from '../../src/lib/sql-engine/validator';
import type { JudgmentKind } from '../../src/types/curriculum';

const KINDS: JudgmentKind[] = ['choose-and-defend', 'predict-failure', 'diagnose-plan', 'compare-tradeoff'];

function allTasks() {
  const out: { modId: string; task: { id: string; validation?: { judgment?: any[] } } }[] = [];
  for (const mod of ALL_MODULES) {
    for (const c of mod.concepts ?? []) {
      for (const t of c.tasks ?? []) out.push({ modId: mod.id, task: t as any });
    }
    for (const t of mod.challenge?.tasks ?? []) out.push({ modId: mod.id, task: t as any });
  }
  return out;
}

describe('judgment[] content contract', () => {
  it('every authored judgment item is well-formed', () => {
    const problems: string[] = [];
    for (const { task } of allTasks()) {
      const items = task.validation?.judgment ?? [];
      items.forEach((j: any, i: number) => {
        const label = `${task.id}[${i}]`;
        if (!KINDS.includes(j.kind)) problems.push(`${label}: bad kind '${j.kind}'`);
        if (!j.prompt || j.prompt.length < 10) problems.push(`${label}: prompt too short`);
        if (!j.options || j.options.length < 3) problems.push(`${label}: needs >= 3 options`);
        if (j.options && new Set(j.options).size !== j.options.length) problems.push(`${label}: duplicate options`);
        if (typeof j.correctIndex !== 'number' || j.correctIndex < 0 || j.correctIndex >= (j.options?.length ?? 0)) {
          problems.push(`${label}: correctIndex out of bounds`);
        }
        if (!j.explanation || j.explanation.length < 20) problems.push(`${label}: explanation too short`);
      });
    }
    expect(problems).toEqual([]);
  });

  it('the Milestone 4 spec days each carry a judgment exercise', () => {
    const judgedDays = new Set(allTasks().filter(({ task }) => (task.validation?.judgment?.length ?? 0) > 0).map(({ modId }) => modId));
    const required = [
      'day-39', 'day-41', 'day-43', 'day-46', 'day-47', 'day-48', 'day-49',
      'day-50', 'day-51', 'day-53', 'day-54', 'day-55', 'day-56', 'day-57',
    ];
    for (const id of required) {
      expect(judgedDays.has(id), `${id} must carry a judgment exercise`).toBe(true);
    }
  });
});

describe('judgment grading (validator gate)', () => {
  const ex = new SqlExecutor();
  const sql = 'SELECT product_id FROM products LIMIT 3;';
  const result = ex.executeQuery(sql);
  const rule: any = {
    requireSelect: true,
    judgment: [
      {
        kind: 'predict-failure',
        prompt: 'What does LIMIT 3 do?',
        options: ['Returns 3 rows', 'Returns all rows', 'Sorts the table', 'Drops the table'],
        correctIndex: 0,
        explanation: 'LIMIT caps the result at three rows.',
      },
    ],
  };

  it('passes with correct SQL + correct answer', () => {
    const o = validateTaskSolution(sql, result, rule, undefined, [0]);
    expect(o.passed).toBe(true);
  });

  it('fails with correct SQL + wrong answer, surfacing the explanation', () => {
    const o = validateTaskSolution(sql, result, rule, undefined, [1]);
    expect(o.passed).toBe(false);
    expect(o.feedback).toContain('not quite right');
    expect(o.feedback).toContain('LIMIT caps the result');
  });

  it('fails with correct SQL + no answer (the gate is refutable)', () => {
    const o = validateTaskSolution(sql, result, rule, undefined, undefined);
    expect(o.passed).toBe(false);
    expect(o.feedback).toContain('reasoning question');
  });

  it('a SQL failure surfaces BEFORE the judgment gate', () => {
    const badSql = 'SELECT * FROM no_such_table;';
    const badResult = ex.executeQuery(badSql);
    expect(badResult.success).toBe(false);
    const o = validateTaskSolution(badSql, badResult, rule, undefined, undefined);
    expect(o.passed).toBe(false);
    expect(o.feedback ?? '').not.toContain('reasoning question');
  });
});
