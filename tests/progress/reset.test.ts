import { describe, it, expect, beforeEach } from 'vitest';
import {
  resetUserState,
  resetModuleProgress,
  loadUserState,
  saveUserState,
  INITIAL_USER_STATE,
  getStorageKey,
} from '../../src/lib/progress/storage';
import { UserLearningState } from '../../src/types/progress';
import { ModuleData } from '../../src/types/curriculum';

describe('Progress Reset Engine', () => {
  beforeEach(() => {
    // Reset browser localStorage mock before each test
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
    }
  });

  it('resetUserState returns fresh INITIAL_USER_STATE with current timestamp', () => {
    const userId = 'user_abc';
    const state: UserLearningState = {
      ...INITIAL_USER_STATE,
      currentModuleId: 'day-05',
      completedModules: {
        'day-01': { moduleId: 'day-01', completedAt: '2026-09-01T00:00:00Z' },
      },
    };
    saveUserState(state, userId);

    const fresh = resetUserState(userId);
    expect(fresh.currentModuleId).toBe('day-01');
    expect(fresh.completedModules).toEqual({});
    expect(fresh.unlockedModuleIds).toEqual(['day-01']);
    expect(Date.parse(fresh.lastActiveTimestamp!)).toBeGreaterThan(0);

    // Verify localStorage key is wiped
    if (typeof window !== 'undefined') {
      expect(localStorage.getItem(getStorageKey(userId))).toBeNull();
    }
  });

  it('resetModuleProgress removes only targeted module completions and tasks', () => {
    const dummyModule = {
      id: 'day-02',
      title: 'Day 2',
      shortTitle: 'WHERE Filtering',
      description: 'Test',
      objectives: [],
      estimatedMinutes: 30,
      concepts: [
        {
          id: 'c2-1',
          title: 'Concept 1',
          description: '',
          theoryHtml: '',
          tasks: [{ id: 'd2-t1' }],
        },
      ],
      challenge: {
        id: 'd2-ch',
        title: 'Challenge',
        description: '',
        tasks: [{ id: 'd2-ch-t1' }],
      },
    } as unknown as ModuleData;


    const state: UserLearningState = {
      ...INITIAL_USER_STATE,
      currentModuleId: 'day-02',
      unlockedModuleIds: ['day-01', 'day-02', 'day-03'],
      completedModules: {
        'day-01': { moduleId: 'day-01', completedAt: '2026-09-01T00:00:00Z' },
        'day-02': {
          moduleId: 'day-02',
          completedAt: '2026-09-02T00:00:00Z',
          completedConcepts: ['c2-1'],
          completedTasks: ['d2-t1', 'd2-ch-t1'],
          challengeCompleted: true,
        },
      },
      completedConcepts: {
        'c1-1': { conceptId: 'c1-1', moduleId: 'day-01', completedAt: '2026-09-01T00:00:00Z' },
        'c2-1': { conceptId: 'c2-1', moduleId: 'day-02', completedAt: '2026-09-02T00:00:00Z' },
      },
      completedTasks: {
        'd1-t1': { taskId: 'd1-t1', moduleId: 'day-01', completed: true, hintsUsed: 0, viewedSolution: false },
        'd2-t1': { taskId: 'd2-t1', moduleId: 'day-02', completed: true, hintsUsed: 0, viewedSolution: false },
        'd2-ch-t1': { taskId: 'd2-ch-t1', moduleId: 'day-02', completed: true, hintsUsed: 0, viewedSolution: false },
      },
      taskAttempts: {
        'd1-t1': { taskId: 'd1-t1', moduleId: 'day-01', completed: true, hintsUsed: 0, viewedSolution: false },
        'd2-t1': { taskId: 'd2-t1', moduleId: 'day-02', completed: true, hintsUsed: 0, viewedSolution: false },
        'd2-ch-t1': { taskId: 'd2-ch-t1', moduleId: 'day-02', completed: true, hintsUsed: 0, viewedSolution: false },
      },
    };

    const next = resetModuleProgress('day-02', state, dummyModule);

    // Day 2 module record is removed
    expect(next.completedModules['day-02']).toBeUndefined();
    // Day 1 module record is retained!
    expect(next.completedModules['day-01']).toBeDefined();

    // Day 2 concepts and tasks are cleared
    expect(next.completedConcepts?.['c2-1']).toBeUndefined();
    expect(next.completedTasks?.['d2-t1']).toBeUndefined();
    expect(next.completedTasks?.['d2-ch-t1']).toBeUndefined();
    expect(next.taskAttempts?.['d2-t1']).toBeUndefined();
    expect(next.taskAttempts?.['d2-ch-t1']).toBeUndefined();

    // Day 1 concept and tasks are preserved!
    expect(next.completedConcepts?.['c1-1']).toBeDefined();
    expect(next.completedTasks?.['d1-t1']).toBeDefined();
    expect(next.taskAttempts?.['d1-t1']).toBeDefined();

    // Day unlocks are preserved!
    expect(next.unlockedModuleIds).toEqual(['day-01', 'day-02', 'day-03']);
  });

  it('handles resetModuleProgress gracefully when moduleData is not supplied', () => {
    const state: UserLearningState = {
      ...INITIAL_USER_STATE,
      completedModules: {
        'day-01': { moduleId: 'day-01', completedAt: '2026-09-01T00:00:00Z' },
      },
      taskAttempts: {
        't1': { taskId: 't1', moduleId: 'day-01', completed: true, hintsUsed: 0, viewedSolution: false },
      },
    };

    const next = resetModuleProgress('day-01', state);
    expect(next.completedModules['day-01']).toBeUndefined();
    expect(next.taskAttempts?.['t1']).toBeUndefined();
  });
});
