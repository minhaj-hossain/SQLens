import { LEARNING_CONFIG } from '../../config/learning';
import { UserLearningState, UnlockStatus } from '../../types/progress';
import { ModuleData, Concept } from '../../types/curriculum';
import { getAvailabilityForModule } from './availability-store';

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
 * Checks whether a module is considered FULLY complete.
 * A module is fully complete when:
 *  - All concept lessons (and their practice tasks) are done, AND
 *  - If the module has an independent challenge, it has also been completed.
 *
 * This is the stricter gate used for unlocking the *next* module.
 */
export function isModuleFullyComplete(
  module: ModuleData,
  state: UserLearningState
): boolean {
  const record = state.completedModules?.[module.id];
  // No completion record at all → definitely not done
  if (!record) return false;

  // All concept lessons must be done
  if (!isModuleConceptsCompleted(module, state)) return false;

  // If the module has a challenge, it must also be completed
  if (module.challenge && !record.challengeCompleted && !record.completedAt) {
    return false;
  }

  return true;
}

/**
 * Restores which Independent Challenge tasks were completed for a module.
 * Challenge task ids are persisted inside `completedModules[id].completedTasks`
 * (appended by handleChallengeTaskSuccess), so partial challenge progress
 * survives refresh and cross-device sync. If the whole challenge is finished
 * (`challengeCompleted`), every task id is returned.
 */
export function getCompletedChallengeTaskIds(
  module: ModuleData,
  state: UserLearningState
): string[] {
  if (!module.challenge) return [];
  const challengeIds = module.challenge.tasks.map((t) => t.id);
  const record = state.completedModules?.[module.id];
  if (!record) return [];
  if (record.challengeCompleted) return challengeIds;
  const saved = new Set(record.completedTasks || []);
  return challengeIds.filter((id) => saved.has(id));
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
 *
 * Gate order (all must pass):
 *  1. Day 1 is always unlocked.
 *  2. Previous module must exist and have a completion record.
 *  3. Previous module must be FULLY complete (concepts + challenge).
 *  4. If this module has a `scheduledPublishDate`, it must have passed.
 *  5. The 6 PM learning-cycle gate: must be in a new cycle or past next 6 PM.
 */
export function getModuleUnlockStatus(
  module: ModuleData,
  allModules: ModuleData[],
  state: UserLearningState
): UnlockStatus {
  // Gate 0 — Day 1 is always unlocked
  if (module.day === 1 || module.id === 'day-01') {
    // A day only counts as "completed" when every concept AND the final
    // challenge (if any) is finished — never for a partial progress record.
    const isCompleted = isModuleFullyComplete(module, state);
    return {
      isUnlocked: true,
      isCompleted,
      isCurrent: state.currentModuleId === module.id,
    };
  }

  const hasRecord = !!state.completedModules[module.id];
  if (hasRecord) {
    // Keep the module unlocked so learners can always return and continue, but
    // only report "completed" once all concepts AND the challenge are done.
    return {
      isUnlocked: true,
      isCompleted: isModuleFullyComplete(module, state),
      isCurrent: state.currentModuleId === module.id,
    };
  }

  // ─── Server-controlled availability (admin global control) ───────────────
  // The database is the source of truth for global module availability;
  // these overrides apply on top of the user-progression rules below.
  const availability = getAvailabilityForModule(module.id);

  // 'locked' → closed for everyone (modules already completed stay viewable).
  if (availability?.unlockMode === 'locked') {
    return {
      isUnlocked: false,
      isCompleted: false,
      isCurrent: state.currentModuleId === module.id,
      reason: 'This module is currently locked by the administrator.',
    };
  }

  // 'manual' → unlocked for everyone immediately, regardless of progression.
  if (availability?.unlockMode === 'manual') {
    return {
      isUnlocked: true,
      isCompleted: isModuleFullyComplete(module, state),
      isCurrent: state.currentModuleId === module.id,
    };
  }

  // Bypass mode — skip all time/schedule gates; only require previous completion
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

  // Gate 1 — Find previous module
  const prevModule = allModules.find(m => m.day === module.day - 1);
  if (!prevModule) {
    return { isUnlocked: true, isCompleted: false, isCurrent: false };
  }

  // Gate 2 — Previous module must have a completion record
  const prevCompletionRecord = state.completedModules[prevModule.id];
  if (!prevCompletionRecord) {
    return {
      isUnlocked: false,
      isCompleted: false,
      isCurrent: false,
      reason: `Complete Day ${prevModule.day} (${prevModule.shortTitle}) first.`,
    };
  }

  // Gate 3 — Previous module must be FULLY complete (concepts + challenge)
  if (!isModuleFullyComplete(prevModule, state)) {
    const totalConcepts = prevModule.concepts?.length ?? 0;
    const completedCount = prevModule.concepts?.filter((c) =>
      isConceptCompleted(c, prevModule.id, state)
    ).length ?? 0;
    const challengePending = prevModule.challenge && !prevCompletionRecord.challengeCompleted;
    const reason = challengePending
      ? `Finish the Day ${prevModule.day} Independent Challenge to unlock Day ${module.day}.`
      : `Finish all Day ${prevModule.day} concept lessons first (${completedCount}/${totalConcepts} done).`;
    return {
      isUnlocked: false,
      isCompleted: false,
      isCurrent: false,
      reason,
    };
  }

  const now = getEffectiveNow(state.simulatedTimeOffsetHours);
  const prevCompletedDate = new Date(prevCompletionRecord.completedAt);
  const nextUnlockDate = getNextUnlockTime(prevCompletedDate);

  // Gate 3.5 — Admin-scheduled global release (overrides all local timing).
  // The module still requires previous-module completion, but unlocks at the
  // server-defined date instead of the default 6 PM cycle.
  if (availability?.unlockMode === 'scheduled' && availability.unlockAt) {
    const scheduledAt = new Date(availability.unlockAt);
    if (!isNaN(scheduledAt.getTime())) {
      if (now.getTime() >= scheduledAt.getTime()) {
        return {
          isUnlocked: true,
          isCompleted: false,
          isCurrent: state.currentModuleId === module.id,
          unlockTime: scheduledAt,
        };
      }
      return {
        isUnlocked: false,
        isCompleted: false,
        isCurrent: false,
        unlockTime: scheduledAt,
        countdownFormatted: formatTimeRemaining(scheduledAt, now),
        reason: `Scheduled for release on ${scheduledAt.toLocaleDateString()} at ${scheduledAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (${formatTimeRemaining(scheduledAt, now)} remaining).`,
      };
    }
  }

  // Gate 4 — Respect scheduledPublishDate if set on this module
  if (module.scheduledPublishDate) {
    const publishDate = new Date(module.scheduledPublishDate);
    if (!isNaN(publishDate.getTime()) && now.getTime() < publishDate.getTime()) {
      return {
        isUnlocked: false,
        isCompleted: false,
        isCurrent: false,
        unlockTime: publishDate,
        countdownFormatted: formatTimeRemaining(publishDate, now),
        reason: `Scheduled for release on ${publishDate.toLocaleDateString()} at ${publishDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (${formatTimeRemaining(publishDate, now)} remaining).`,
      };
    }
  }

  // Gate 5 — 6 PM learning-cycle gate
  const prevCycle = prevCompletionRecord.learningDayCycleId;
  const currentCycle = getLearningCycleId(now);
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
