import { LEARNING_CONFIG } from '../../config/learning';
import { UserLearningState, CompletedModuleRecord, CompletedConceptRecord, CompletedTaskRecord } from '../../types/progress';
import { ModuleData } from '../../types/curriculum';

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

export function getStorageKey(userId?: string | null): string {
  if (userId) {
    return `sqlens_progress_user_${userId}`;
  }
  return LEARNING_CONFIG.STORAGE_KEY;
}

/**
 * Load persisted state for a specific user (or guest if no userId provided).
 * Tolerates legacy position formats and migrates legacy module IDs.
 */
export function loadUserState(userId?: string | null): UserLearningState & { currentConceptIndex?: number } {
  if (typeof window === 'undefined') {
    return INITIAL_USER_STATE;
  }
  try {
    const key = getStorageKey(userId);
    let raw = localStorage.getItem(key);
    
    // If loading for a signed-in user and user-scoped key is empty, don't fall back to guest key
    // unless explicitly migrating.
    if (!raw) return INITIAL_USER_STATE;
    const parsed = JSON.parse(raw);
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

export function saveUserState(state: UserLearningState, userId?: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    const key = getStorageKey(userId);
    localStorage.setItem(key, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save learning state:', e);
  }
}

export function resetUserState(userId?: string | null): UserLearningState {
  if (typeof window !== 'undefined') {
    try {
      const key = getStorageKey(userId);
      localStorage.removeItem(key);
      localStorage.removeItem(LEARNING_CONFIG.STORAGE_KEY);
      localStorage.removeItem('sql_mastery_nav_v1');
      try {
        for (let i = sessionStorage.length - 1; i >= 0; i--) {
          const k = sessionStorage.key(i);
          if (k && k.startsWith('sqlens_scroll_')) {
            sessionStorage.removeItem(k);
          }
        }
      } catch {
        /* ignore sessionStorage failure */
      }
    } catch (e) {
      console.error('Failed to clear learning state:', e);
    }
  }
  return { ...INITIAL_USER_STATE, lastActiveTimestamp: new Date().toISOString() };
}

/**
 * Resets task and concept progress for a single specific module,
 * leaving other days and unlocked modules intact.
 */
export function resetModuleProgress(
  moduleId: string,
  state: UserLearningState,
  moduleData?: ModuleData | null,
): UserLearningState {
  const next: UserLearningState = { ...state };
  const nextCompletedModules = { ...next.completedModules };
  delete nextCompletedModules[moduleId];
  next.completedModules = nextCompletedModules;

  const taskIdsToDelete = new Set<string>();
  const conceptIdsToDelete = new Set<string>();

  if (moduleData) {
    for (const c of moduleData.concepts ?? []) {
      conceptIdsToDelete.add(c.id);
      for (const t of c.tasks ?? []) {
        taskIdsToDelete.add(t.id);
      }
    }
    if (moduleData.challenge) {
      for (const t of moduleData.challenge.tasks ?? []) {
        taskIdsToDelete.add(t.id);
      }
    }
  }

  if (next.completedConcepts) {
    const nextConcepts = { ...next.completedConcepts };
    for (const [id, rec] of Object.entries(nextConcepts)) {
      if (rec.moduleId === moduleId || conceptIdsToDelete.has(id)) {
        delete nextConcepts[id];
      }
    }
    next.completedConcepts = nextConcepts;
  }

  if (next.completedTasks) {
    const nextTasks = { ...next.completedTasks };
    for (const [id, rec] of Object.entries(nextTasks)) {
      if (rec.moduleId === moduleId || taskIdsToDelete.has(id)) {
        delete nextTasks[id];
      }
    }
    next.completedTasks = nextTasks;
  }

  if (next.taskAttempts) {
    const nextAttempts = { ...next.taskAttempts };
    for (const [id, rec] of Object.entries(nextAttempts)) {
      if (rec.moduleId === moduleId || taskIdsToDelete.has(id)) {
        delete nextAttempts[id];
      }
    }
    next.taskAttempts = nextAttempts;
  }

  next.lastActiveTimestamp = new Date().toISOString();
  return next;
}

export function clearGuestState(): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(LEARNING_CONFIG.STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }
}

// Legacy alias exports (kept for API stability).
export const loadUserLearningState = loadUserState;
export const saveUserLearningState = saveUserState;
export const resetAllProgress = resetUserState;


