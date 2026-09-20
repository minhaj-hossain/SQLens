import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  MAX_EVENTS,
  GradingEvent,
  clearGradingEvents,
  confusingTasks,
  gradingOverview,
  inconclusiveTasks,
  mismatchedColumns,
  readGradingEvents,
  recordGradingEvent,
  summarizeGradingEvents,
} from '../../src/lib/grading-telemetry';

/** Minimal in-memory localStorage — the vitest env is `node` (no DOM). */
function memoryStorage() {
  const map = new Map<string, string>();
  return {
    getItem: (k: string) => (map.has(k) ? (map.get(k) as string) : null),
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
  };
}

const pass = (taskId: string, attempt = 1): Omit<GradingEvent, 't'> => ({
  taskId,
  stage: 'pass',
  surface: 'lesson',
  validatorPassed: true,
  stateOk: true,
  attempt,
});

/** Right count, wrong values — the signal Phase 1 + Phase 5 exist to surface. */
const valueMismatch = (taskId: string, attempt = 1, diffColumns = ['name']): Omit<GradingEvent, 't'> => ({
  taskId,
  stage: 'final-state',
  surface: 'lesson',
  validatorPassed: true,
  stateOk: false,
  diffColumns,
  attempt,
});

beforeEach(() => {
  vi.stubGlobal('localStorage', memoryStorage());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('grading-telemetry — ring buffer', () => {
  it('records newest-first and caps the buffer at MAX_EVENTS', () => {
    for (let i = 0; i < MAX_EVENTS + 10; i++) recordGradingEvent(pass(`task-${i}`));
    const events = readGradingEvents();
    expect(events).toHaveLength(MAX_EVENTS);
    expect(events[0].taskId).toBe(`task-${MAX_EVENTS + 9}`);
    expect(events.some((e) => e.taskId === 'task-0')).toBe(false);
  });

  it('caps diffColumns so one wide table cannot bloat the buffer', () => {
    recordGradingEvent(valueMismatch('wide', 1, ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']));
    const [e] = readGradingEvents();
    expect(e.diffColumns).toHaveLength(6);
    expect(e.diffColumns).toEqual(['a', 'b', 'c', 'd', 'e', 'f']);
  });

  it('ignores malformed payloads instead of throwing', () => {
    localStorage.setItem('sqlens:grading-telemetry', JSON.stringify([{ nope: 1 }, 42, null]));
    expect(readGradingEvents()).toEqual([]);
    localStorage.setItem('sqlens:grading-telemetry', 'not json');
    expect(readGradingEvents()).toEqual([]);
  });

  it('clearGradingEvents empties the buffer', () => {
    recordGradingEvent(pass('t1'));
    expect(readGradingEvents()).toHaveLength(1);
    clearGradingEvents();
    expect(readGradingEvents()).toEqual([]);
  });

  it('is SSR-safe when localStorage does not exist', () => {
    vi.unstubAllGlobals();
    expect(() => recordGradingEvent(pass('t1'))).not.toThrow();
    expect(readGradingEvents()).toEqual([]);
    expect(() => clearGradingEvents()).not.toThrow();
  });
});

describe('grading-telemetry — aggregates', () => {
  it('summarizes passes, failures, and value mismatches per task', () => {
    recordGradingEvent(pass('easy'));
    recordGradingEvent(pass('easy', 2));
    recordGradingEvent(valueMismatch('hard', 1));
    recordGradingEvent(valueMismatch('hard', 2));
    recordGradingEvent({
      taskId: 'broken-sql',
      stage: 'engine-error',
      surface: 'challenge',
      validatorPassed: false,
      attempt: 1,
    });

    const byId = new Map(summarizeGradingEvents(readGradingEvents()).map((s) => [s.taskId, s]));
    expect(byId.get('easy')).toMatchObject({ attempts: 2, passes: 1 + 1, valueMismatches: 0 });
    expect(byId.get('hard')).toMatchObject({ attempts: 2, passes: 0, stateFails: 2, valueMismatches: 2 });
    expect(byId.get('broken-sql')).toMatchObject({ attempts: 1, engineErrors: 1 });
  });

  it('counts diffColumns per task so instruction wording can target them', () => {
    recordGradingEvent(valueMismatch('t', 1, ['name', 'email']));
    recordGradingEvent(valueMismatch('t', 2, ['name']));
    const [s] = summarizeGradingEvents(readGradingEvents());
    expect(s.diffColumns).toEqual({ name: 2, email: 1 });
  });

  it('headline overview reports the confusing-feedback and inconclusive rates', () => {
    recordGradingEvent(pass('a'));
    recordGradingEvent(valueMismatch('b'));
    recordGradingEvent({ ...pass('c'), inconclusive: true });
    const o = gradingOverview(readGradingEvents());
    expect(o).toMatchObject({ submits: 3, passes: 2, fails: 1, distinctTasks: 3, inconclusive: 1 });
    expect(o.valueMismatchRate).toBeCloseTo(1 / 3, 5);
    expect(o.engineErrorRate).toBe(0);
  });
});

describe('grading-telemetry — actionable views', () => {
  it('flags tasks dominated by right-count-wrong-values, worst first', () => {
    for (let i = 0; i < 4; i++) recordGradingEvent(valueMismatch('confusing', i + 1));
    recordGradingEvent(pass('confusing', 5));
    for (let i = 0; i < 3; i++) recordGradingEvent(pass('fine', i + 1));

    const flagged = confusingTasks(readGradingEvents());
    expect(flagged.map((s) => s.taskId)).toEqual(['confusing']);
  });

  it('requires a minimum attempt count so one stray fail is not systemic', () => {
    recordGradingEvent(valueMismatch('rare'));
    expect(confusingTasks(readGradingEvents(), 3)).toEqual([]);
    expect(confusingTasks(readGradingEvents(), 1).map((s) => s.taskId)).toEqual(['rare']);
  });

  it('surfaces inconclusive tasks (broken reference solutions) loudly', () => {
    recordGradingEvent({ ...pass('authoring-bug'), inconclusive: true });
    recordGradingEvent(pass('healthy'));
    expect(inconclusiveTasks(readGradingEvents()).map((s) => s.taskId)).toEqual(['authoring-bug']);
  });

  it('ranks the columns learners get wrong most often', () => {
    recordGradingEvent(valueMismatch('t1', 1, ['name', 'email']));
    recordGradingEvent(valueMismatch('t2', 1, ['name']));
    expect(mismatchedColumns(readGradingEvents())).toEqual([
      { column: 'name', count: 2 },
      { column: 'email', count: 1 },
    ]);
  });
});
