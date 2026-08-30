import { describe, it, expect } from 'vitest';
import { getPreviousStep } from '../../src/lib/learn-routes';

const concepts = ['select-basics', 'filtering', 'ordering'];
// filtering has 2 tasks, ordering has 1; select-basics has none.
const tasksByConcept: Record<string, number> = {
  'select-basics': 0,
  filtering: 2,
  ordering: 1,
};

describe('getPreviousStep — deterministic back chain (P11.2)', () => {
  it('overview has no back button', () => {
    expect(getPreviousStep('day-01', '/learn/day-01', concepts, null, tasksByConcept)).toBeNull();
  });

  it('practice task>0 goes to previous task', () => {
    const s = getPreviousStep('day-01', '/learn/day-01/practice/filtering', concepts, '2', tasksByConcept);
    expect(s).toEqual({
      url: '/learn/day-01/practice/filtering?task=1',
      label: 'Back',
      hint: 'Back to Task 2',
    });
  });

  it('practice task=0 goes to its lesson', () => {
    const s = getPreviousStep('day-01', '/learn/day-01/practice/filtering', concepts, '0', tasksByConcept);
    expect(s).toEqual({
      url: '/learn/day-01/theory/filtering',
      label: 'Back',
      hint: 'Back to Lesson',
    });
  });

  it('theory concept>0 goes to previous concept LAST task (true reverse of forward flow)', () => {
    const s = getPreviousStep('day-01', '/learn/day-01/theory/ordering', concepts, null, tasksByConcept);
    expect(s).toEqual({
      url: '/learn/day-01/practice/filtering?task=1',
      label: 'Back',
      hint: 'Back to Task 2',
    });
  });

  it('theory concept>0 falls back to previous concept theory when it has no tasks', () => {
    const s = getPreviousStep('day-01', '/learn/day-01/theory/filtering', concepts, null, tasksByConcept);
    expect(s).toEqual({
      url: '/learn/day-01/theory/select-basics',
      label: 'Back',
      hint: 'Back to Lesson',
    });
  });

  it('first theory goes back to the module card', () => {
    const s = getPreviousStep('day-01', '/learn/day-01/theory/select-basics', concepts, null, tasksByConcept);
    expect(s).toEqual({ url: '/learn/day-01', label: 'Back', hint: 'Back to Module' });
  });

  it('challenge goes back to the last concept last task', () => {
    const s = getPreviousStep('day-01', '/learn/day-01/challenge', concepts, null, tasksByConcept);
    expect(s).toEqual({
      url: '/learn/day-01/practice/ordering?task=0',
      label: 'Back',
      hint: 'Back to Task 1',
    });
  });

  it('complete goes back to the challenge', () => {
    const s = getPreviousStep('day-01', '/learn/day-01/complete', concepts, null, tasksByConcept);
    expect(s).toEqual({ url: '/learn/day-01/challenge', label: 'Back', hint: 'Back to Challenge' });
  });

  it('works without tasksByConcept (legacy signature) — theory chains to theory', () => {
    const s = getPreviousStep('day-01', '/learn/day-01/theory/filtering', concepts, null);
    expect(s).toEqual({
      url: '/learn/day-01/theory/select-basics',
      label: 'Back',
      hint: 'Back to Lesson',
    });
  });
});