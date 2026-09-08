import { describe, it, expect } from 'vitest';
import {
  mergeProgress,
  detectProgressDivergence,
  toCloudProgress,
  fromCloudProgress,
} from '../../src/lib/progress/merge';
import { getStorageKey, loadUserState, saveUserState, resetUserState } from '../../src/lib/progress/storage';
import { UserLearningState } from '../../src/types/progress';

describe('Progress Merge Engine (Deep Union & Conflict Resolution)', () => {
  const baseState: UserLearningState = {
    currentModuleId: 'day-01',
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

  it('unions completedTasks and completedConcepts deeply without overwriting in-progress modules', () => {
    // Local device did Task 1 & 2 of Day 1 (in-progress)
    const local: UserLearningState = {
      ...baseState,
      completedModules: {
        'day-01': {
          moduleId: 'day-01',
          completedAt: '',
          completedConcepts: ['concept-1'],
          completedTasks: ['task-1', 'task-2'],
          challengeCompleted: false,
        },
      },
      taskAttempts: {
        'task-1': { taskId: 'task-1', hintsUsed: 0, viewedSolution: false, completed: true, lastSubmittedSql: 'SELECT 1;' },
        'task-2': { taskId: 'task-2', hintsUsed: 1, viewedSolution: false, completed: true, lastSubmittedSql: 'SELECT 2;' },
      },
    };

    // Account in cloud has Task 3 & 4 of Day 1 (in-progress)
    const cloud = toCloudProgress({
      ...baseState,
      completedModules: {
        'day-01': {
          moduleId: 'day-01',
          completedAt: '',
          completedConcepts: ['concept-2'],
          completedTasks: ['task-3', 'task-4'],
          challengeCompleted: false,
        },
      },
      taskAttempts: {
        'task-3': { taskId: 'task-3', hintsUsed: 0, viewedSolution: false, completed: true, lastSubmittedSql: 'SELECT 3;' },
        'task-4': { taskId: 'task-4', hintsUsed: 0, viewedSolution: true, completed: true, lastSubmittedSql: 'SELECT 4;' },
      },
    });

    const merged = mergeProgress(local, cloud);

    // Verify all 4 tasks are retained in the merged module!
    expect(merged.completedModules['day-01'].completedTasks).toContain('task-1');
    expect(merged.completedModules['day-01'].completedTasks).toContain('task-2');
    expect(merged.completedModules['day-01'].completedTasks).toContain('task-3');
    expect(merged.completedModules['day-01'].completedTasks).toContain('task-4');
    expect(merged.completedModules['day-01'].completedTasks?.length).toBe(4);

    // Verify concepts unioned
    expect(merged.completedModules['day-01'].completedConcepts).toContain('concept-1');
    expect(merged.completedModules['day-01'].completedConcepts).toContain('concept-2');

    // Verify taskAttempts unioned
    expect(merged.taskAttempts?.['task-1']?.completed).toBe(true);
    expect(merged.taskAttempts?.['task-3']?.completed).toBe(true);
    expect(merged.taskAttempts?.['task-4']?.viewedSolution).toBe(true);
  });

  it('preserves module completion timestamp when one side has finished the module', () => {
    const local: UserLearningState = {
      ...baseState,
      completedModules: {
        'day-01': {
          moduleId: 'day-01',
          completedAt: '',
          completedConcepts: ['c1'],
          completedTasks: ['t1'],
          challengeCompleted: false,
        },
      },
    };

    const cloud = toCloudProgress({
      ...baseState,
      completedModules: {
        'day-01': {
          moduleId: 'day-01',
          completedAt: '2026-09-02T14:00:00.000Z',
          completedConcepts: ['c1', 'c2'],
          completedTasks: ['t1', 't2', 't3'],
          challengeCompleted: true,
        },
      },
    });

    const merged = mergeProgress(local, cloud);
    expect(merged.completedModules['day-01'].completedAt).toBe('2026-09-02T14:00:00.000Z');
    expect(merged.completedModules['day-01'].challengeCompleted).toBe(true);
    expect(merged.completedModules['day-01'].completedTasks).toEqual(
      expect.arrayContaining(['t1', 't2', 't3']),
    );
  });

  it('retains the highest attempt counts and latest SQL in taskAttempts', () => {
    const local: UserLearningState = {
      ...baseState,
      taskAttempts: {
        'task-sql': {
          taskId: 'task-sql',
          attemptsCount: 2,
          hintsUsed: 1,
          viewedSolution: false,
          completed: false,
          lastSubmittedSql: 'SELECT * FROM old;',
          completedAt: '2026-09-01T12:00:00.000Z',
        },
      },
    };

    const cloud = toCloudProgress({
      ...baseState,
      taskAttempts: {
        'task-sql': {
          taskId: 'task-sql',
          attemptsCount: 4,
          hintsUsed: 2,
          viewedSolution: true,
          completed: true,
          lastSubmittedSql: 'SELECT * FROM new_better;',
          completedAt: '2026-09-01T15:00:00.000Z',
        },
      },
    });

    const merged = mergeProgress(local, cloud);
    const task = merged.taskAttempts?.['task-sql'];
    expect(task?.attemptsCount).toBe(4);
    expect(task?.hintsUsed).toBe(2);
    expect(task?.viewedSolution).toBe(true);
    expect(task?.completed).toBe(true);
    expect(task?.lastSubmittedSql).toBe('SELECT * FROM new_better;');
  });

  it('accurately detects divergence between local and cloud progress', () => {
    const local: UserLearningState = {
      ...baseState,
      completedModules: {
        'day-01': { moduleId: 'day-01', completedAt: '', completedTasks: ['t1', 't2'] },
      },
      taskAttempts: {
        't1': { taskId: 't1', completed: true, hintsUsed: 0, viewedSolution: false },
        't2': { taskId: 't2', completed: true, hintsUsed: 0, viewedSolution: false },
      },
    };

    const cloud = toCloudProgress({
      ...baseState,
      completedModules: {
        'day-01': { moduleId: 'day-01', completedAt: '', completedTasks: ['t3', 't4'] },
      },
      taskAttempts: {
        't3': { taskId: 't3', completed: true, hintsUsed: 0, viewedSolution: false },
        't4': { taskId: 't4', completed: true, hintsUsed: 0, viewedSolution: false },
      },
    });

    const divergence = detectProgressDivergence(local, cloud);
    expect(divergence.isDivergent).toBe(true);
    expect(divergence.localTaskCount).toBe(2);
    expect(divergence.cloudTaskCount).toBe(2);
  });

  it('does not flag divergence when one side is a subset or empty', () => {
    const localEmpty: UserLearningState = {
      ...baseState,
    };

    const cloudWithProgress = toCloudProgress({
      ...baseState,
      completedModules: {
        'day-01': { moduleId: 'day-01', completedAt: '2026-09-01T00:00:00Z', completedTasks: ['t1'] },
      },
      taskAttempts: {
        't1': { taskId: 't1', completed: true, hintsUsed: 0, viewedSolution: false },
      },
    });

    const result = detectProgressDivergence(localEmpty, cloudWithProgress);
    expect(result.isDivergent).toBe(false);
  });
});

describe('User Scoped Storage Isolation', () => {
  it('scopes storage keys by user id and isolates accounts', () => {
    expect(getStorageKey(null)).toBe('sql_mastery_progress_v1');
    expect(getStorageKey(undefined)).toBe('sql_mastery_progress_v1');
    expect(getStorageKey('user_123')).toBe('sqlens_progress_user_user_123');
    expect(getStorageKey('user_456')).toBe('sqlens_progress_user_user_456');
  });
});
