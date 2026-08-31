import { LEARNING_CONFIG } from '../../config/learning';
import { UserLearningState, CompletedModuleRecord, CompletedConceptRecord, CompletedTaskRecord } from '../../types/progress';

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
 * Module-ID consolidation map (2026-09). Module ids were normalized to the
 * positional `day-NN` scheme so that id === filename === position === label.
 * Any persisted progress written under a pre-consolidation id is remapped on
 * load so no learner loses completed/unlocked state. The map is one-directional
 * (old → new) and idempotent — running it twice is harmless because new ids
 * never appear as keys.
 */
const MODULE_ID_MIGRATION: Record<string, string> = {
  'case-conditional-logic': 'day-10',
  'string-functions': 'day-11',
  'date-functions': 'day-12',
  'day-10': 'day-13', // reporting dashboards
  'day-11': 'day-14', // joins
  'day-12': 'day-15', // fanout debug
  'day-13': 'day-16', // query pipeline
  'set-operations': 'day-17',
  'day-14': 'day-18', // BI reporting
  'day-15': 'day-19', // hardening & temporal
  'day-16': 'day-20', // milestone 2 checkpoint
  'day-17': 'day-21', // subqueries & CTEs
  'day-18': 'day-22', // subquery practice
  'window-ranking': 'day-23',
  'window-running-metrics': 'day-24',
  'day-19': 'day-25', // DML
  'dml-transactions': 'day-26',
  'day-20': 'day-27', // DDL I: creating tables
  'ddl-column-constraints': 'day-28',
  'ddl-schema-evolution': 'day-29',
  'schema-design-normalization': 'day-30',
  'day-21': 'day-31', // performance & indexing
  'security-production-safety': 'day-32',
  'capstone-bookstore': 'day-33',
  'day-22': 'day-34', // backend API
  'day-23': 'day-35', // zero-state hardening
  'day-24': 'day-36', // final assessment
  'interview-gauntlet': 'day-37',
  'day-25': 'day-38', // graduation
};

function migrateModuleIdRef(value: string): string {
  return MODULE_ID_MIGRATION[value] ?? value;
}

/** Remap any stored module references written under pre-consolidation ids. */
export function migrateLegacyModuleIds(state: UserLearningState): UserLearningState {
  const s: UserLearningState = { ...state };
  s.currentModuleId = migrateModuleIdRef(state.currentModuleId);
  s.unlockedModuleIds = (state.unlockedModuleIds ?? []).map(migrateModuleIdRef);

  const completedModules: Record<string, CompletedModuleRecord> = {};
  for (const [key, record] of Object.entries(state.completedModules ?? {})) {
    completedModules[migrateModuleIdRef(key)] = { ...record, moduleId: migrateModuleIdRef(record.moduleId ?? key) };
  }
  s.completedModules = completedModules;

  const remapEmbedded = <T extends { moduleId?: string }>(records?: Record<string, T>): Record<string, T> | undefined => {
    if (!records) return undefined;
    const out: Record<string, T> = {};
    for (const [key, record] of Object.entries(records)) {
      out[key] = record.moduleId ? { ...record, moduleId: migrateModuleIdRef(record.moduleId) } : record;
    }
    return out;
  };
  s.completedConcepts = remapEmbedded<CompletedConceptRecord>(state.completedConcepts);
  s.completedTasks = remapEmbedded<CompletedTaskRecord>(state.completedTasks);
  s.taskAttempts = remapEmbedded<CompletedTaskRecord>(state.taskAttempts);
  return s;
}

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
    return migrateLegacyModuleIds({
      ...INITIAL_USER_STATE,
      ...parsed,
      bypassDailyLock: false,
      simulatedTimeOffsetHours: 0,
    });
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

