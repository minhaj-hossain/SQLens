import { describe, expect, it } from 'vitest';
import type { ModuleData, PracticeTask } from '../../src/types/curriculum';
import {
  auditCustomValidators,
  canFail,
  collectCustomValidatorSites,
  collectTaskLadder,
  diagnoseCustomValidator,
  harvestValueLiterals,
  stripRegexLiterals,
  suppliesEngineMessage,
  undiscoverableLiterals,
  type CustomValidatorSite,
} from '../../src/lib/curriculum/custom-validators';

/**
 * Batch 5 (custom-validator gate) regression tests.
 *
 * `validation.customValidator` is the last grading surface written in CODE, so
 * nothing typed could ever read it. These tests pin the four defect classes the
 * gate exists to catch, plus the one real bug it found in shipped content:
 * Day 1's `day01-c4-t4` returned its guidance under `feedback:`, a key the
 * validator's rule 14 never reads — so the learner got the generic sentence.
 */

const taskWith = (over: Partial<PracticeTask> & { id: string }): PracticeTask =>
  ({
    title: 'T',
    description: 'D',
    type: 'guided',
    primaryTable: 'products',
    initialSql: '-- x\n',
    solutionSql: 'SELECT 1;',
    hints: [],
    validation: {},
    ...over,
  }) as PracticeTask;

const siteWith = (
  source: string,
  task: Partial<PracticeTask> & { id: string } = { id: 't' },
  challengeScenario?: string,
): CustomValidatorSite => ({
  day: 1,
  where: 'lesson',
  taskId: task.id,
  title: task.title ?? 'T',
  task: taskWith(task),
  challengeScenario,
  source,
});

const moduleWith = (day: number, lesson: PracticeTask[], challenge?: PracticeTask[]): ModuleData =>
  ({
    id: `day-${day}`,
    slug: `s${day}`,
    day,
    title: `Day ${day}`,
    shortTitle: `D${day}`,
    type: 'module',
    milestoneId: 'm',
    description: 'd',
    estimatedMinutes: 1,
    concepts: [
      {
        id: `c${day}`,
        order: 1,
        title: 'C',
        shortDescription: 's',
        theory: { summary: 's', explanation: [] },
        tasks: lesson,
      },
    ],
    ...(challenge ? { challenge: { id: `ch${day}`, title: 'CH', scenario: 'S', tasks: challenge } } : {}),
    completionLearnings: [],
  }) as unknown as ModuleData;

describe('custom-validators — literal harvesting', () => {
  it('blanks regex bodies so a pattern cannot masquerade as a graded value', () => {
    // `/values\s*\(/i` must NOT yield the literal `values`.
    const clean = stripRegexLiterals(String.raw`/values\s*\(/i.test(q) && x.match(/[a-z_]+/g)`);
    expect(clean).not.toContain('values');
    expect(clean).not.toContain('a-z_');
    expect(clean).toContain('test');
  });

  it('keeps comparison values but drops message values and prose feedback', () => {
    const src = String.raw`
      if (q.toLowerCase().includes('flash sale product')) {
        return { valid: false, message: 'Insert one flash-sale product.' };
      }
      return { valid: true };
    `;
    const lits = harvestValueLiterals(src);
    expect(lits).toContain('flash sale product');
    // The message value is feedback, not a graded value…
    expect(lits).not.toContain('Insert one flash-sale product.');
    // …and never the key spelling itself.
    expect(lits).not.toContain('message');
  });

  it('drops concatenated messages built with + and a message-like key', () => {
    const lits = harvestValueLiterals(
      String.raw`return { valid: false, feedback: 'Use ' + 'COUNT' + ' here please.' };`,
    );
    expect(lits).not.toContain('COUNT');
  });
});

describe('custom-validators — refutability and explainability', () => {
  it('canFail accepts a false literal, a return false, or a computed condition', () => {
    expect(canFail(`return { valid: true };`)).toBe(false);
    expect(canFail(`return { valid: false };`)).toBe(true);
    expect(canFail(`if (bad) return false; return { valid: true };`)).toBe(true);
    expect(canFail(`return { valid: hasId && hasName };`)).toBe(true);
    expect(canFail(`return { valid: !ok };`)).toBe(true);
  });

  it('suppliesEngineMessage reads only the key rule 14 honours', () => {
    expect(suppliesEngineMessage(`return { valid: false, message: 'x' }`)).toBe(true);
    // The shipped Day-1 bug: guidance under a key the engine never reads.
    expect(suppliesEngineMessage(`return { valid: false, feedback: 'x' }`)).toBe(false);
    expect(suppliesEngineMessage(`return { valid: false, hint: 'x' }`)).toBe(false);
  });
});

describe('custom-validators — discoverability', () => {
  const rendered = 'Insert one flash-sale product into the products table.';

  it('flags a graded value no visible text or schema column names', () => {
    expect(undiscoverableLiterals(`c.includes('sultana begum')`, rendered)).toEqual([
      'sultana begum',
    ]);
  });

  it('accepts a value the prompt spells differently (hyphen vs space)', () => {
    expect(undiscoverableLiterals(`c.includes('flash sale product')`, rendered)).toEqual([]);
  });

  it('accepts a value the prompt spells with separators (Student ID -> studentid)', () => {
    const cols = 'Alias std_id AS "Student ID".';
    expect(undiscoverableLiterals(`cols.some((c) => c.includes('studentid'))`, cols)).toEqual([]);
  });

  it('never flags SQL syntax tokens or schema identifiers', () => {
    expect(undiscoverableLiterals(`if (/select/i.test(q)) {}`, 'nothing here')).toEqual([]);
    expect(undiscoverableLiterals(`c === 'products'`, 'nothing here')).toEqual([]);
    expect(undiscoverableLiterals(`c === 'signup_date'`, 'nothing here')).toEqual([]);
  });
});

describe('custom-validators — diagnosis', () => {
  it('reports an always-valid predicate as grading nothing', () => {
    const findings = diagnoseCustomValidator(siteWith(`return { valid: true };`));
    expect(findings.map((f) => f.kind)).toEqual(['always-valid']);
  });

  it('reports a dead expectFailure predicate once, as unreachable', () => {
    const findings = diagnoseCustomValidator(
      siteWith(`return { valid: false, feedback: 'never read' };`, {
        id: 'lab',
        validation: { expectFailure: true },
      }),
    );
    // One finding only: ghost/message symptoms of dead code are not separate defects.
    expect(findings.map((f) => f.kind)).toEqual(['unreachable']);
  });

  it('names rule 14 when the predicate fails under a message key the engine ignores', () => {
    const findings = diagnoseCustomValidator(
      siteWith(`if (bad) return { valid: false, feedback: 'Use aliases.' };`),
    );
    const silent = findings.find((f) => f.kind === 'silent-failure');
    expect(silent?.detail).toContain('feedback');
    expect(silent?.detail).toContain('rule 14');
  });

  it('reports a failing predicate with no message at all', () => {
    const findings = diagnoseCustomValidator(siteWith(`if (bad) return { valid: false };`));
    expect(findings.map((f) => f.kind)).toEqual(['silent-failure']);
  });

  it('reports a graded value the prompt never shows', () => {
    const findings = diagnoseCustomValidator(
      siteWith(`if (!q.includes('sultana begum')) return { valid: false, message: 'x' };`, {
        id: 'ghost',
        description: 'Insert the new customer.',
      }),
    );
    expect(findings.map((f) => f.kind)).toEqual(['ghost-value']);
    expect(findings[0].detail).toContain('sultana begum');
  });

  it('reports a predicate that no solution can ever regression-test', () => {
    const findings = diagnoseCustomValidator(
      siteWith(`if (bad) return { valid: false, message: 'x' };`, { id: 'no-sol', solutionSql: '' }),
    );
    expect(findings.map((f) => f.kind)).toContain('no-solution');
  });
});

describe('custom-validators — ladder', () => {
  it('walks concepts before the challenge, so inherited state can be rebuilt', () => {
    const ladder = collectTaskLadder([
      moduleWith(31, [taskWith({ id: 'perf-c1-t1' })], [taskWith({ id: 'perf-hw-3' })]),
    ]);
    expect(ladder.map((r) => r.taskId)).toEqual(['perf-c1-t1', 'perf-hw-3']);
    expect(ladder.map((r) => r.where)).toEqual(['lesson', 'challenge']);
    expect(ladder[1].challengeScenario).toBe('S');
  });

  it('orders modules canonically by curriculumOrder, not array position', () => {
    const a = { ...moduleWith(31, [taskWith({ id: 'later' })]), curriculumOrder: 2 } as ModuleData;
    const b = { ...moduleWith(30, [taskWith({ id: 'earlier' })]), curriculumOrder: 1 } as ModuleData;
    expect(collectTaskLadder([a, b]).map((r) => r.taskId)).toEqual(['earlier', 'later']);
  });
});

describe('custom-validators — shipped curriculum', () => {
  it('every authored predicate is reachable, refutable, explainable and discoverable', async () => {
    const { ALL_MODULES } = await import('../../src/content/curriculum-index');
    const { checked, findings } = auditCustomValidators(ALL_MODULES);
    expect(checked).toBeGreaterThan(0);
    expect(findings).toEqual([]);
  });

  it('found and kept fixed the Day-1 predicate that spoke under a dead key', async () => {
    const { ALL_MODULES } = await import('../../src/content/curriculum-index');
    const site = collectCustomValidatorSites(ALL_MODULES).find((s) => s.taskId === 'day01-c4-t4');
    expect(site).toBeDefined();
    // Batch 5's real content fix: `feedback:` -> `message:`, so rule 14 surfaces it.
    expect(suppliesEngineMessage(site!.source)).toBe(true);
    expect(diagnoseCustomValidator(site!)).toEqual([]);
  });
});
