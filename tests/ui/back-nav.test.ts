import { describe, it, expect } from 'vitest';
import { getPreviousStep } from '../../src/lib/learn-routes';

const concepts = ['select-basics', 'filtering', 'ordering'];

describe('getPreviousStep — deterministic back chain', () => {
  it('overview has no back button', () => {
    expect(getPreviousStep('day-01', '/learn/day-01', concepts, null)).toBeNull();
  });

  it('practice task>0 goes to previous task', () => {
    const s = getPreviousStep('day-01', '/learn/day-01/practice/select-basics', concepts, '2');
    expect(s).toEqual({ url: '/learn/day-01/practice/select-basics?task=1', label: 'Back to Task 2' });
  });

  it('practice task=0 goes to its lesson', () => {
    const s = getPreviousStep('day-01', '/learn/day-01/practice/select-basics', concepts, '0');
    expect(s).toEqual({ url: '/learn/day-01/theory/select-basics', label: 'Back to Lesson' });
  });

  it('theory concept>0 goes to previous concept', () => {
    const s = getPreviousStep('day-01', '/learn/day-01/theory/filtering', concepts, null);
    expect(s).toEqual({ url: '/learn/day-01/theory/select-basics', label: 'Previous Concept' });
  });

  it('first theory goes back to the module card', () => {
    const s = getPreviousStep('day-01', '/learn/day-01/theory/select-basics', concepts, null);
    expect(s).toEqual({ url: '/learn/day-01', label: 'Back to Module' });
  });

  it('challenge goes back to last concept lesson', () => {
    const s = getPreviousStep('day-01', '/learn/day-01/challenge', concepts, null);
    expect(s).toEqual({ url: '/learn/day-01/theory/ordering', label: 'Back to Lesson' });
  });

  it('complete goes back to the challenge', () => {
    const s = getPreviousStep('day-01', '/learn/day-01/complete', concepts, null);
    expect(s).toEqual({ url: '/learn/day-01/challenge', label: 'Back to Challenge' });
  });
});