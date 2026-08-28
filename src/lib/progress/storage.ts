import { LEARNING_CONFIG } from '../../config/learning';
import { UserLearningState } from '../../types/progress';

export const INITIAL_USER_STATE: UserLearningState = {
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
  lastActiveTimestamp: new Date().toISOString(),
  bypassDailyLock: false,
  simulatedTimeOffsetHours: 0,
};

/**
 * Load persisted state. Tolerates the pre-Phase-2 position format: older saves
 * carry `currentConceptIndex` (number). The raw legacy field is passed through
 * on the returned object so the provider can resolve it to a concept slug —
 * storage stays curriculum-agnostic (no module imports here).
 */
export function loadUserState(): UserLearningState & { currentConceptIndex?: number } {
  if (typeof window === 'undefined') {
    return INITIAL_USER_STATE;
  }
  try {
    const raw = localStorage.getItem(LEARNING_CONFIG.STORAGE_KEY);
    if (!raw) return INITIAL_USER_STATE;
    const parsed = JSON.parse(raw);
    // The legacy dev-only "Progression Controls" were removed once role-based
    // administration shipped. Normalize any stale bypass flags so a stored
    // true/offset can never silently unlock modules for regular users.
    return {
      ...INITIAL_USER_STATE,
      ...parsed,
      bypassDailyLock: false,
      simulatedTimeOffsetHours: 0,
    };
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
    try {
      localStorage.removeItem(LEARNING_CONFIG.STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear learning state:', e);
    }
  }
  return { ...INITIAL_USER_STATE, lastActiveTimestamp: new Date().toISOString() };
}

// Legacy alias exports (kept for API stability).
export const loadUserLearningState = loadUserState;
export const saveUserLearningState = saveUserState;
export const resetAllProgress = resetUserState;

