import { describe, expect, it } from 'vitest';
import type { ConceptTheory, ModuleData, PracticeTask } from '../../src/types/curriculum';
import {
  auditTaughtBeforeTested,
  checkableLiteralCores,
  renderedTaskText,
  solutionLiterals,
  theoryCode,
} from '../../src/lib/curriculum/taught-before-tested';

/**
 * Batch 2 (taught-before-tested) regression tests — synthetic mini-curriculum.
 *
 * Pins the two real bugs this audit exists to catch:
 *  1. multi-row VALUES required (tx-c1-t2) but taught nowhere before it;
 *  2. exact values graded (tx-c1-t1's 'Flash Sale Mouse') but invisible in the
 *     rendered prompt (Batch 1 made instructions visible; the audit enforces it).
 */

const theoryWith = (sql: string): ConceptTheory =>
  ({
    summary: 's',
    explanation: [],
    targetQuery: { sql, explanation: 'e' },
  }) as unknown as ConceptTheory;

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

const moduleWith = (
  day: number,
  theorySql: string,
  lesson: PracticeTask[],
  challenge?: PracticeTask[],
): ModuleData =>
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
        theory: theoryWith(theorySql),
        tasks: lesson,
      },
    ],
    ...(challenge ? { challenge: { id: `ch${day}`, title: 'CH', scenario: 'S', tasks: challenge } } : {}),
    completionLearnings: [],
  }) as unknown as ModuleData;

describe('taught-before-tested — helpers', () => {
  it('theoryCode harvests SQL code but never bare prose', () => {
    const code = theoryCode({
      ...theoryWith('SELECT 1;'),
      explanation: ['remember to join the tables', 'run `SELECT 1;` to verify'],
    } as unknown as ConceptTheory);
    expect(code).toContain('SELECT 1;');
    // Bare prose must NOT count as teaching ("join" in English ≠ JOIN syntax)…
    expect(code).not.toContain('remember to join the tables');
    // …but an inline `CODE` span is a shown statement and counts.
    expect(code).toContain('run `SELECT 1;` to verify'.split('`')[1]);
  });

  it('renderedTaskText includes instructions but excludes hints/solution', () => {
    const text = renderedTaskText(
      taskWith({
        id: 't',
        description: 'Do the thing',
        instructions: ['Run `BEGIN;`'],
        hints: [{ level: 1, text: 'SECRET-HINT' }],
        solutionSql: 'SECRET-SOLUTION;',
      }),
    );
    expect(text).toContain('Run `BEGIN;`');
    expect(text).not.toContain('SECRET-HINT');
    expect(text).not.toContain('SECRET-SOLUTION');
  });

  it('solutionLiterals reads single- and double-quoted strings', () => {
    expect(solutionLiterals(`VALUES ('O''Brien', "x")`)).toEqual([`O'Brien`, 'x']);
  });

  it('checkableLiteralCores drops wildcards and short codes', () => {
    expect(checkableLiteralCores(`WHERE name LIKE 'Flash Sale%' AND id = '1'`)).toEqual([
      'flash sale',
    ]);
  });
});

describe('taught-before-tested — audit', () => {
  it('flags multi-row VALUES required but never taught', () => {
    const multi = taskWith({
      id: 'needs-multi',
      solutionSql: `INSERT INTO t (a) VALUES ('x'), ('y');`,
      instructions: ['Insert the rows.'],
    });
    const { findings } = auditTaughtBeforeTested([
      moduleWith(25, 'INSERT INTO t (a) VALUES (1);', []),
      moduleWith(26, 'BEGIN; COMMIT;', [multi]),
    ]);
    expect(findings.some((f) => f.taskId === 'needs-multi' && f.constructId === 'multi-row-insert')).toBe(
      true,
    );
  });

  it('passes once an earlier concept teaches the syntax in code', () => {
    const multi = taskWith({
      id: 'needs-multi',
      solutionSql: `INSERT INTO t (a) VALUES ('x'), ('y');`,
      description: `Insert the rows ('x'), ('y').`,
      instructions: ['Insert the rows.'],
    });
    const { findings } = auditTaughtBeforeTested([
      moduleWith(25, `INSERT INTO t (a) VALUES ('x'), ('y');`, []),
      moduleWith(26, 'BEGIN; COMMIT;', [multi]),
    ]);
    expect(findings.filter((f) => f.taskId === 'needs-multi')).toEqual([]);
  });

  it('flags enforced literals missing from the visible prompt', () => {
    const hidden = taskWith({
      id: 'hidden-tuple',
      solutionSql: `INSERT INTO p (name) VALUES ('Flash Sale Mouse');`,
      description: 'Insert one flash-sale product.',
      instructions: ['Insert one flash-sale product.'],
    });
    const { findings } = auditTaughtBeforeTested([moduleWith(26, 'INSERT INTO p (name) VALUES (1);', [hidden])]);
    const lit = findings.find((f) => f.taskId === 'hidden-tuple' && f.kind === 'literal');
    expect(lit?.detail).toContain('flash sale mouse');
  });

  it('accepts the same task once the tuple is visible (the tx-c1-t1 fix)', () => {
    const visible = taskWith({
      id: 'visible-tuple',
      solutionSql: `INSERT INTO p (name) VALUES ('Flash Sale Mouse');`,
      description: `Insert the flash-sale product ('Flash Sale Mouse').`,
      instructions: [`Run \`INSERT INTO p (name) VALUES ('Flash Sale Mouse');\``],
    });
    const { findings } = auditTaughtBeforeTested([moduleWith(26, 'INSERT INTO p (name) VALUES (1);', [visible])]);
    expect(findings.filter((f) => f.taskId === 'visible-tuple')).toEqual([]);
  });

  it('exempts expectFailure labs from the literal half (invalid values are the point)', () => {
    const lab = taskWith({
      id: 'fail-lab',
      solutionSql: `INSERT INTO p (cat) VALUES (999);`,
      description: 'Break the constraint.',
      instructions: ['Break it.'],
      validation: { expectFailure: true },
    });
    const { findings } = auditTaughtBeforeTested([moduleWith(26, 'INSERT INTO p (a) VALUES (1);', [lab])]);
    expect(findings.filter((f) => f.taskId === 'fail-lab' && f.kind === 'literal')).toEqual([]);
  });
});
