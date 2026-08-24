import { LEARNING_CONFIG } from '../../config/learning';
import { UserLearningState } from '../../types/progress';

export const INITIAL_USER_STATE: UserLearningState = {
  currentModuleId: 'day-01',
  currentConceptIndex: 0,
  currentTaskIndex: 0,
  currentStepType: 'concept_theory',
  challengeTaskIndex: 0,
  taskAttempts: {},
  completedTasks: {},
  completedConcepts: {},
  completedModules: {},
  unlockedModuleIds: ['day-01'],
  lastActiveTimestamp: new Date().toISOString(),
  bypassDailyLock: false,
  simulatedTimeOffsetHours: 0,
};

export function loadUserState(): UserLearningState {
  if (typeof window === 'undefined') {
    return INITIAL_USER_STATE;
  }
  try {
    const raw = localStorage.getItem(LEARNING_CONFIG.STORAGE_KEY);
    if (!raw) return INITIAL_USER_STATE;
    const parsed = JSON.parse(raw);
    return { ...INITIAL_USER_STATE, ...parsed };
  } catch (e) {
    console.error('Failed to load learning state from localStorage:', e);
    return INITIAL_USER_STATE;
  }
}

export function saveUserState(state: UserLearningState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LEARNING_CONFIG.STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save learning state:', e);
  }
}

export function resetUserState(): UserLearningState {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(LEARNING_CONFIG.STORAGE_KEY);
  }
  return INITIAL_USER_STATE;
}

export const loadUserLearningState = loadUserState;
export const saveUserLearningState = saveUserState;
export const resetAllProgress = resetUserState;
