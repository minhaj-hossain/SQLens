import { LEARNING_CONFIG } from '../../config/learning';
import { UserLearningState, UnlockStatus } from '../../types/progress';
import { ModuleData, Concept } from '../../types/curriculum';

/**
 * Get effective current time, factoring in any simulated offset hours (for testing).
 */
export function getEffectiveNow(simulatedOffsetHours: number = 0): Date {
  const now = new Date();
  if (simulatedOffsetHours !== 0) {
    now.setHours(now.getHours() + simulatedOffsetHours);
  }
  return now;
}

/**
 * Calculates the cycle identifier for a given timestamp.
 * A learning cycle starts at 18:00 (6:00 PM) on date D and ends at 17:59:59 on date D+1.
 */
export function getLearningCycleId(date: Date): string {
  const d = new Date(date);
  // If time is before 18:00, it belongs to yesterday's 18:00 cycle
  if (d.getHours() < LEARNING_CONFIG.DAILY_RESET_HOUR) {
    d.setDate(d.getDate() - 1);
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}@18:00`;
}

/**
 * Calculates the exact next 6:00 PM boundary when the next module will unlock.
 */
export function getNextUnlockTime(completedAtDate: Date | string): Date {
  const unlock = completedAtDate instanceof Date ? new Date(completedAtDate.getTime()) : new Date(completedAtDate);
  if (isNaN(unlock.getTime())) {
    const fallback = new Date();
    fallback.setHours(LEARNING_CONFIG.DAILY_RESET_HOUR, LEARNING_CONFIG.DAILY_RESET_MINUTE, 0, 0);
    return fallback;
  }
  // If completed after or at 18:00, the next boundary is tomorrow 18:00.
  // If completed before 18:00, the next boundary is today 18:00.
  if (unlock.getHours() >= LEARNING_CONFIG.DAILY_RESET_HOUR) {
    unlock.setDate(unlock.getDate() + 1);
  }
  unlock.setHours(LEARNING_CONFIG.DAILY_RESET_HOUR, LEARNING_CONFIG.DAILY_RESET_MINUTE, 0, 0);
  return unlock;
}

/**
 * Formats remaining time until unlock (e.g. "5h 22m 14s").
 */
export function formatTimeRemaining(
  targetTime: Date | string,
  currentTime?: Date | string | number
): string {
  const target = targetTime instanceof Date ? targetTime : new Date(targetTime);
  let current: Date;
  
  if (typeof currentTime === 'number') {
    current = getEffectiveNow(currentTime);
  } else if (currentTime instanceof Date) {
    current = currentTime;
  } else if (typeof currentTime === 'string') {
    current = new Date(currentTime);
  } else {
    current = getEffectiveNow();
  }

  const targetMs = isNaN(target.getTime()) ? 0 : target.getTime();
  const currentMs = isNaN(current.getTime()) ? 0 : current.getTime();
  const diffMs = targetMs - currentMs;
  if (diffMs <= 0) return '0h 0m 0s';

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  return `${hours}h ${minutes}m ${seconds}s`;
}

/**
 * Checks if a specific concept has been completed by the user.
 */
export function isConceptCompleted(
  concept: Concept,
  moduleId: string,
  state: UserLearningState
): boolean {
  // 1. Direct record in completedConcepts map
  if (state.completedConcepts && state.completedConcepts[concept.id]) {
    return true;
  }

  // 2. Module record has it in completedConcepts list
  const moduleProgress = state.completedModules?.[moduleId];
  if (moduleProgress?.completedConcepts?.includes(concept.id)) {
    return true;
  }

  // 3. Entire module is already marked completed
  if (moduleProgress?.completedAt) {
    return true;
  }

  // 4. If concept has tasks, check if all tasks were completed
  if (concept.tasks && concept.tasks.length > 0) {
    const allTasksDone = concept.tasks.every(
      (task) =>
        state.taskAttempts?.[task.id]?.completed ||
        moduleProgress?.completedTasks?.includes(task.id)
    );
    if (allTasksDone) {
      return true;
    }
  }

  return false;
}

/**
 * Checks if all concepts in a module have been completed.
 */
export function isModuleConceptsCompleted(
  module: ModuleData,
  state: UserLearningState
): boolean {
  if (state.completedModules?.[module.id]?.completedAt) {
    return true;
  }

  if (!module.concepts || module.concepts.length === 0) {
    return true;
  }

  return module.concepts.every((concept) => isConceptCompleted(concept, module.id, state));
}

/**
 * Determines whether the Independent Challenge for a module is unlocked.
 * A challenge is unlocked ONLY IF:
 * 1. The module itself is unlocked (or completed).
 * 2. ALL concept lessons & practice tasks in this module are finished.
 */
export function isModuleChallengeUnlocked(
  module: ModuleData,
  allModules: ModuleData[],
  state: UserLearningState
): { isUnlocked: boolean; isCompleted: boolean; reason?: string } {
  if (!module.challenge) {
    return { isUnlocked: false, isCompleted: false, reason: 'No challenge exists for this module.' };
  }

  const moduleStatus = getModuleUnlockStatus(module, allModules, state);
  if (!moduleStatus.isUnlocked && !moduleStatus.isCompleted) {
    return {
      isUnlocked: false,
      isCompleted: false,
      reason: moduleStatus.reason || `Day ${module.day} is currently locked.`,
    };
  }

  const isCompleted = Boolean(
    state.completedModules?.[module.id]?.challengeCompleted ||
    state.completedModules?.[module.id]?.completedAt
  );

  const conceptsDone = isModuleConceptsCompleted(module, state);

  if (!conceptsDone && !isCompleted) {
    const totalConcepts = module.concepts.length;
    const completedCount = module.concepts.filter((c) => isConceptCompleted(c, module.id, state)).length;
    return {
      isUnlocked: false,
      isCompleted: false,
      reason: `Complete all Day ${module.day} concept lessons & practice tasks first (${completedCount}/${totalConcepts} completed).`,
    };
  }

  return {
    isUnlocked: true,
    isCompleted,
  };
}

/**
 * Determines unlock status for a specific module based on progression rules.
 */
export function getModuleUnlockStatus(
  module: ModuleData,
  allModules: ModuleData[],
  state: UserLearningState
): UnlockStatus {
  // Day 1 is always unlocked
  if (module.day === 1 || module.id === 'day-01') {
    const isCompleted = !!state.completedModules[module.id];
    return {
      isUnlocked: true,
      isCompleted,
      isCurrent: state.currentModuleId === module.id,
    };
  }

  const isCompleted = !!state.completedModules[module.id];
  if (isCompleted) {
    return {
      isUnlocked: true,
      isCompleted: true,
      isCurrent: state.currentModuleId === module.id,
    };
  }

  // If bypass daily lock is enabled (for previewing / testing)
  if (state.bypassDailyLock) {
    const prevModule = allModules.find(m => m.day === module.day - 1);
    const prevCompleted = prevModule ? !!state.completedModules[prevModule.id] : true;
    return {
      isUnlocked: prevCompleted,
      isCompleted: false,
      isCurrent: state.currentModuleId === module.id,
      reason: prevCompleted ? undefined : 'Previous module must be completed first',
    };
  }

  // Find previous module
  const prevModule = allModules.find(m => m.day === module.day - 1);
  if (!prevModule) {
    return { isUnlocked: true, isCompleted: false, isCurrent: false };
  }

  const prevCompletionRecord = state.completedModules[prevModule.id];
  if (!prevCompletionRecord) {
    return {
      isUnlocked: false,
      isCompleted: false,
      isCurrent: false,
      reason: `Complete Day ${prevModule.day} (${prevModule.shortTitle}) first.`,
    };
  }

  const now = getEffectiveNow(state.simulatedTimeOffsetHours);
  const prevCompletedDate = new Date(prevCompletionRecord.completedAt);
  const nextUnlockDate = getNextUnlockTime(prevCompletedDate);

  const prevCycle = prevCompletionRecord.learningDayCycleId;
  const currentCycle = getLearningCycleId(now);

  // Condition 1: Must be in a new learning cycle OR now >= nextUnlockDate
  const isPastUnlockTime = now.getTime() >= nextUnlockDate.getTime();
  const isDifferentCycle = prevCycle !== currentCycle;

  if (isPastUnlockTime || isDifferentCycle) {
    return {
      isUnlocked: true,
      isCompleted: false,
      isCurrent: state.currentModuleId === module.id,
      unlockTime: nextUnlockDate,
    };
  }

  return {
    isUnlocked: false,
    isCompleted: false,
    isCurrent: false,
    unlockTime: nextUnlockDate,
    countdownFormatted: formatTimeRemaining(nextUnlockDate, now),
    reason: `Unlocks at 6:00 PM on next learning day (${formatTimeRemaining(nextUnlockDate, now)} remaining).`,
  };
}
