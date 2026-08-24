export interface CompletedTaskRecord {
  taskId: string;
  moduleId?: string;
  conceptId?: string;
  completedAt?: string;
  userSql?: string;
  hintsUsed: number;
  viewedSolution: boolean;
  attemptsCount?: number;
  completed?: boolean;
  lastSubmittedSql?: string;
}

export interface CompletedConceptRecord {
  conceptId: string;
  moduleId?: string;
  completedAt?: string;
}

export interface CompletedModuleRecord {
  moduleId: string;
  day?: number;
  completedAt: string; // ISO String
  learningDayCycleId?: string;
  completedConcepts?: string[];
  completedTasks?: string[];
  challengeCompleted?: boolean;
}

export interface UserLearningState {
  currentModuleId: string;
  currentConceptIndex: number;
  currentTaskIndex: number;
  currentStepType?: 'concept_theory' | 'practice_task' | 'concept_complete' | 'module_challenge' | 'module_complete';
  challengeTaskIndex?: number;
  taskAttempts?: Record<string, CompletedTaskRecord>;
  completedTasks?: Record<string, CompletedTaskRecord>;
  completedConcepts?: Record<string, CompletedConceptRecord>;
  completedModules: Record<string, CompletedModuleRecord>;
  unlockedModuleIds?: string[];
  lastActiveTimestamp?: string;
  // Developer / learner test settings
  bypassDailyLock: boolean;
  simulatedTimeOffsetHours: number; // For time-traveling forward to test 6:00 PM unlock
}

export interface UnlockStatus {
  isUnlocked: boolean;
  isCompleted: boolean;
  isCurrent: boolean;
  unlockTime?: Date;
  reason?: string;
  countdownFormatted?: string;
}
