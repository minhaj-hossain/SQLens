import { describe, it, expect, afterEach, vi } from 'vitest';
import { devKnobsEnabled } from '../../src/lib/progress/dev-knobs';
import {
  getEffectiveNow,
  getModuleUnlockStatus,
} from '../../src/lib/progress/unlock-calculator';
import {
  mergeProgress,
  fromCloudProgress,
  toCloudProgress,
} from '../../src/lib/progress/merge';
import type { UserLearningState } from '../../src/types/progress';
import type { ModuleData, Concept, ConceptTheory } from '../../src/types/curriculum';

/** Minimal fixtures — only the fields the unlock gates actually read. */
const concept: Concept = {
  id: 'c1',
  order: 0,
  title: 'Concept 1',
  shortDescription: 'stub',
  theory: {} as ConceptTheory,
  tasks: [],
};

function makeModule(id: string, day: number): ModuleData {
  return {
    id,
    slug: id,
    day,
    title: id,
    shortTitle: id,
    type: 'module',
    milestoneId: 'm1',
    description: 'stub',
    estimatedMinutes: 10,
    concepts: [concept],
    completionLearnings: [],
  };
}

const baseState: UserLearningState = {
  currentModuleId: 'day-02',
  currentConceptId: null,
  currentTaskIndex: 0,
  currentStepType: 'concept_theory',
  challengeTaskIndex: 0,
  taskAttempts: {},
  completedTasks: {},
  completedConcepts: {},
  completedModules: {},
  unlockedModuleIds: ['day-01'],
  lastActiveTimestamp: '2026-09-01T10:00:00.000Z',
  bypassDailyLock: false,
  simulatedTimeOffsetHours: 0,
};

/**
 * Item 15 (finding S-3): developer time knobs must be inert outside `next dev`.
 * The gate is `devKnobsEnabled()` — read at the two unlock entrances and both
 * merge paths. Default vitest env (`NODE_ENV=test`) is already non-dev, so the
 * inert side runs without stubbing; `vi.stubEnv` flips on the dev side.
 */
describe('dev time knobs are inert outside next dev (M4 item 15)', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('devKnobsEnabled() is true only under NODE_ENV=development', () => {
    vi.stubEnv('NODE_ENV', 'development');
    expect(devKnobsEnabled()).toBe(true);
    vi.stubEnv('NODE_ENV', 'production');
    expect(devKnobsEnabled()).toBe(false);
    vi.stubEnv('NODE_ENV', 'test');
    expect(devKnobsEnabled()).toBe(false);
  });

  it('getEffectiveNow applies the simulated offset only in development', () => {
    const OFFSET = 48;

    vi.stubEnv('NODE_ENV', 'development');
    const devNow = getEffectiveNow(OFFSET).getTime();
    expect(devNow).toBeGreaterThanOrEqual(Date.now() - 5_000 + OFFSET * 3_600_000);
    expect(devNow).toBeLessThanOrEqual(Date.now() + 5_000 + OFFSET * 3_600_000);

    vi.stubEnv('NODE_ENV', 'production');
    const prodNow = getEffectiveNow(OFFSET).getTime();
    expect(Math.abs(prodNow - Date.now())).toBeLessThan(5_000);

    // Default test env is non-dev too → offset ignored.
    vi.unstubAllEnvs();
    expect(Math.abs(getEffectiveNow(OFFSET).getTime() - Date.now())).toBeLessThan(5_000);
  });

  it('bypassDailyLock unlocks the next module only in development', () => {
    const day01 = makeModule('day-01', 1);
    const day02 = makeModule('day-02', 2);
    const modules = [day01, day02];
    // Prev module has a completion record but is NOT fully complete
    // (completedAt '' + no concepts done) — exactly the state where the
    // bypass branch and the real gates diverge.
    const state: UserLearningState = {
      ...baseState,
      bypassDailyLock: true,
      completedModules: {
        'day-01': {
          moduleId: 'day-01',
          completedAt: '',
          completedConcepts: [],
          completedTasks: [],
          challengeCompleted: false,
        },
      },
    };

    vi.stubEnv('NODE_ENV', 'development');
    expect(getModuleUnlockStatus(day02, modules, state).isUnlocked).toBe(true);

    vi.stubEnv('NODE_ENV', 'production');
    const prod = getModuleUnlockStatus(day02, modules, state);
    expect(prod.isUnlocked).toBe(false);
    expect(prod.reason).toMatch(/concept lessons first/);

    // Default (test) env — same inert behaviour, no stub.
    vi.unstubAllEnvs();
    expect(getModuleUnlockStatus(day02, modules, state).isUnlocked).toBe(false);
  });

  it('mergeProgress forces knobs to inert defaults outside development', () => {
    const local: UserLearningState = {
      ...baseState,
      bypassDailyLock: true,
      simulatedTimeOffsetHours: 48,
    };
    const cloud = toCloudProgress(baseState);

    vi.stubEnv('NODE_ENV', 'production');
    const prodMerged = mergeProgress(local, cloud);
    expect(prodMerged.bypassDailyLock).toBe(false);
    expect(prodMerged.simulatedTimeOffsetHours).toBe(0);

    vi.stubEnv('NODE_ENV', 'development');
    const devMerged = mergeProgress(local, cloud);
    expect(devMerged.bypassDailyLock).toBe(true);
    expect(devMerged.simulatedTimeOffsetHours).toBe(48);
  });

  it('fromCloudProgress carries base knobs only in development', () => {
    const baseWithKnobs: UserLearningState = {
      ...baseState,
      bypassDailyLock: true,
      simulatedTimeOffsetHours: 6,
    };
    const cloud = toCloudProgress(baseState);

    vi.stubEnv('NODE_ENV', 'production');
    const prod = fromCloudProgress(cloud, baseWithKnobs);
    expect(prod.bypassDailyLock).toBe(false);
    expect(prod.simulatedTimeOffsetHours).toBe(0);

    vi.stubEnv('NODE_ENV', 'development');
    const dev = fromCloudProgress(cloud, baseWithKnobs);
    expect(dev.bypassDailyLock).toBe(true);
    expect(dev.simulatedTimeOffsetHours).toBe(6);
  });

  it('toCloudProgress never carries knobs in any environment (pre-existing invariant)', () => {
    const doc = toCloudProgress({
      ...baseState,
      bypassDailyLock: true,
      simulatedTimeOffsetHours: 48,
    }) as Partial<UserLearningState>;
    expect(doc.bypassDailyLock).toBeUndefined();
    expect(doc.simulatedTimeOffsetHours).toBeUndefined();
  });
});