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
    localStorage.removeItem(LEARNING_CONFIG.STORAGE_KEY);
  }
  return INITIAL_USER_STATE;
}

// =============================================================================
// UI NAVIGATION SNAPSHOT
// Persists the learner's current position (module / concept / task / stage /
// active view) so a page reload returns them to the same screen instead of the
// homepage. Stored separately from learning progress to avoid coupling.
// =============================================================================

export interface NavSnapshot {
  moduleId: string;
  /**
   * Stable concept slug (Phase 2). Legacy snapshots carry `conceptIndex`
   * instead — loadNavSnapshot surfaces it as legacyConceptIndex for the
   * provider to resolve against the module's concept list.
   */
  conceptId: string | null;
  legacyConceptIndex?: number;
  taskIndex: number;
  stage: string;
  tab: string;
}

const NAV_KEY = 'sql_mastery_nav_v1';

const VALID_TABS = ['learning-path', 'home', 'practice', 'schema', 'settings'];
const VALID_STAGES = ['lesson', 'practice', 'concept_complete', 'challenge', 'day_complete'];

export function loadNavSnapshot(): NavSnapshot | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(NAV_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;

    const tab = VALID_TABS.includes(parsed.tab) ? parsed.tab : 'learning-path';
    const stage = VALID_STAGES.includes(parsed.stage) ? parsed.stage : 'lesson';

    return {
      moduleId: typeof parsed.moduleId === 'string' ? parsed.moduleId : 'day-01',
      conceptId: typeof parsed.conceptId === 'string' ? parsed.conceptId : null,
      legacyConceptIndex: Number.isFinite(parsed.conceptIndex)
        ? Number(parsed.conceptIndex)
        : undefined,
      taskIndex: Number.isFinite(parsed.taskIndex) ? Number(parsed.taskIndex) : 0,
      stage,
      tab,
    };
  } catch (e) {
    console.error('Failed to load navigation snapshot:', e);
    return null;
  }
}

export function saveNavSnapshot(snapshot: NavSnapshot): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(NAV_KEY, JSON.stringify(snapshot));
  } catch (e) {
    console.error('Failed to save navigation snapshot:', e);
  }
}

export function resetNavSnapshot(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(NAV_KEY);
  }
}

export const loadUserLearningState = loadUserState;
export const saveUserLearningState = saveUserState;
export const resetAllProgress = resetUserState;
