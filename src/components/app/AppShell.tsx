'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Header } from '@/components/layout/Header';
import { AuthView } from '@/components/auth/AuthView';
import { LearningPathView } from '@/components/roadmap/LearningPathView';
import { ConceptLessonView } from '@/components/learning/ConceptLessonView';
import { PracticeTaskView } from '@/components/learning/PracticeTaskView';
import { ConceptCompleteView } from '@/components/learning/ConceptCompleteView';
import { IndependentChallengeView } from '@/components/learning/IndependentChallengeView';
import { ModuleCompletionView } from '@/components/learning/ModuleCompletionView';
import { SuccessModal } from '@/components/learning/SuccessModal';
import { SchemaModal } from '@/components/roadmap/SchemaModal';
import { RoadmapModal } from '@/components/roadmap/RoadmapModal';
import { ALL_MODULES, getModuleById } from '@/content/curriculum-index';
import { SqlExecutor } from '@/lib/sql-engine/executor';
import {
  loadUserState,
  saveUserState,
  resetUserState,
  loadNavSnapshot,
  saveNavSnapshot,
  resetNavSnapshot,
} from '@/lib/progress/storage';
import { UserLearningState } from '@/types/progress';
import { ModuleData } from '@/types/curriculum';
import { authClient } from '@/lib/auth-client';
import {
  getModuleUnlockStatus,
  isConceptCompleted,
  isModuleConceptsCompleted,
  isModuleChallengeUnlocked,
} from '@/lib/progress/unlock-calculator';

type LearningStage = 'lesson' | 'practice' | 'concept_complete' | 'challenge' | 'day_complete';
// Active app view. The bottom navigation bar was removed; 'learning-path' is the
// landing view, 'practice' is entered by selecting a module. 'settings'/'home'
// are retained on the type for backward compatibility with saved state but are
// no longer directly navigable.
export type NavTab = 'home' | 'learning-path' | 'practice' | 'schema' | 'settings';

export default function AppShell() {
  // On first mount, restore the learner's last navigation position so a reload
  // returns to the same screen (not the homepage). Falls back to saved progress
  // module or day-01.
  const persistedNav = useMemo(() => loadNavSnapshot(), []);

  const [userState, setUserState] = useState<UserLearningState>(loadUserState);
  const [currentModuleId, setCurrentModuleId] = useState<string>(
    persistedNav?.moduleId ?? userState.currentModuleId ?? 'day-01'
  );
  const [currentConceptIndex, setCurrentConceptIndex] = useState<number>(persistedNav?.conceptIndex ?? 0);
  const [currentTaskIndex, setCurrentTaskIndex] = useState<number>(persistedNav?.taskIndex ?? 0);
  const [stage, setStage] = useState<LearningStage>(
    (persistedNav?.stage as LearningStage) || 'lesson'
  );
  const [completedChallengeTaskIds, setCompletedChallengeTaskIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<NavTab>(
    (persistedNav?.tab as NavTab) || 'learning-path'
  );
  // Module card the Learning Path should auto-scroll to when it becomes visible.
  const [roadmapScrollTarget, setRoadmapScrollTarget] = useState<string | null>(null);

  // Auth pages ('signin' | 'signup' | null = closed). Static UI only for now.
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | null>(null);

  // Live Better Auth session (cookies → server at /api/auth/*).
  const { data: sessionData, isPending: isAuthPending } = authClient.useSession();
  // `useSession()` is not type-inferred without server type generation; cast to
  // the minimal user shape we consume.
  const authUser =
    (sessionData as {
      user?: {
        id?: string;
        name?: string | null;
        email?: string | null;
        role?: string | null;
      } | null;
    } | null)
      ?.user ?? null;

  // Modals & UI Toggles
  const [isSchemaModalOpen, setIsSchemaModalOpen] = useState<boolean>(false);
  const [isRoadmapModalOpen, setIsRoadmapModalOpen] = useState<boolean>(false);
  const [successModalData, setSuccessModalData] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    userSql?: string;
    progressText: string;
    progressPercent: number;
    onContinue: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    userSql: '',
    progressText: '',
    progressPercent: 100,
    onContinue: () => {},
  });

  // In-memory SQL Executor instance
  const sqlExecutor = useMemo(() => new SqlExecutor(), []);

  // Reset the in-memory DB whenever the active module/concept/task/stage changes.
  // This prevents DML/DDL mutations from one task (e.g. DELETE FROM products;
  // or CREATE TABLE) from leaking into later lessons, which would cause
  // misleading "returned X rows, expected Y rows" mismatches down the course.
  useEffect(() => {
    sqlExecutor.resetDatabase();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentModuleId, currentConceptIndex, currentTaskIndex, stage]);

  // Sync state with localStorage
  useEffect(() => {
    saveUserState(userState);
  }, [userState]);

  // Persist the learner's current navigation position so reloads resume here.
  useEffect(() => {
    saveNavSnapshot({
      moduleId: currentModuleId,
      conceptIndex: currentConceptIndex,
      taskIndex: currentTaskIndex,
      stage,
      tab: activeTab,
    });
  }, [currentModuleId, currentConceptIndex, currentTaskIndex, stage, activeTab]);

  // On reload into a finished day's challenge view, restore its completed-markers
  // so all challenge tasks show as done (same as when navigating normally).
  useEffect(() => {
    if (stage === 'challenge' && currentModule.challenge) {
      const rec = userState.completedModules[currentModule.id];
      if (rec?.challengeCompleted) {
        setCompletedChallengeTaskIds(currentModule.challenge.tasks.map((t) => t.id));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentModuleId, stage]);

  const currentModule: ModuleData = useMemo(() => {
    return getModuleById(currentModuleId) || ALL_MODULES[0];
  }, [currentModuleId]);

  const concepts = currentModule.concepts || [];
  const currentConcept = concepts[currentConceptIndex] || concepts[0];
  const currentTasks = currentConcept?.tasks || [];
  const currentTask = currentTasks[currentTaskIndex] || currentTasks[0];

  // Handle module selection from learning path or roadmap
  const handleSelectModuleAndConcept = (
    moduleId: string,
    conceptIndex: number = 0,
    targetStage: LearningStage = 'lesson'
  ) => {
    const mod = getModuleById(moduleId);
    if (!mod) return;

    const status = getModuleUnlockStatus(mod, ALL_MODULES, userState);
    if (!status.isUnlocked && !userState.completedModules[moduleId]) return;

    // Strict guard: Enforce that user cannot access challenge before completing all module concepts
    if (targetStage === 'challenge') {
      const challengeUnlock = isModuleChallengeUnlocked(mod, ALL_MODULES, userState);
      if (!challengeUnlock.isUnlocked) {
        // Find first unfinished concept and guide the user there
        const firstIncompleteIdx = mod.concepts.findIndex(
          (c) => !isConceptCompleted(c, mod.id, userState)
        );
        setCurrentModuleId(moduleId);
        setCurrentConceptIndex(firstIncompleteIdx >= 0 ? firstIncompleteIdx : 0);
        setCurrentTaskIndex(0);
        setStage('lesson');
        setActiveTab('practice');
        return;
      }

      // If unlocked, take user directly to the Challenge stage
      setCurrentModuleId(moduleId);
      setCurrentConceptIndex(conceptIndex);
      setCurrentTaskIndex(0);
      if (userState.completedModules[moduleId]?.challengeCompleted && mod.challenge) {
        setCompletedChallengeTaskIds(mod.challenge.tasks.map((t) => t.id));
      } else {
        setCompletedChallengeTaskIds([]);
      }
      setStage('challenge');
      setActiveTab('practice');
      return;
    }

    setCurrentModuleId(moduleId);
    setCurrentConceptIndex(conceptIndex);
    setCurrentTaskIndex(0);
    setCompletedChallengeTaskIds([]);

    if (targetStage === 'day_complete' && userState.completedModules[moduleId]) {
      setStage('day_complete');
    } else {
      setStage(targetStage);
    }

    setActiveTab('practice');
  };

  const handleSelectModule = (moduleId: string) => {
    handleSelectModuleAndConcept(moduleId, 0, 'lesson');
  };

  const handleResetProgress = () => {
    const fresh = resetUserState();
    resetNavSnapshot();
    setUserState(fresh);
    setCurrentModuleId('day-01');
    setCurrentConceptIndex(0);
    setCurrentTaskIndex(0);
    setStage('lesson');
    setCompletedChallengeTaskIds([]);
    setActiveTab('learning-path');
  };

  // Step 1: User finishes reading Concept Lesson -> Move to Guided Practice
  const handleStartPractice = () => {
    if (currentTasks.length > 0) {
      // Retain currentTaskIndex if already valid within the current concept; otherwise start at 0
      const validIndex =
        currentTaskIndex >= 0 && currentTaskIndex < currentTasks.length
          ? currentTaskIndex
          : 0;
      setCurrentTaskIndex(validIndex);
      setStage('practice');
    } else {
      handleCompleteConcept();
    }
  };

  // Step 2: Task completed successfully
  const handleTaskSuccess = (userSql: string, hintsUsed: number, viewedSolution: boolean) => {
    setUserState((prev) => {
      const existing = prev.taskAttempts?.[currentTask.id] || {
        taskId: currentTask.id,
        attemptsCount: 0,
        completed: false,
        hintsUsed: 0,
        viewedSolution: false,
      };

      const moduleProgress = prev.completedModules[currentModule.id] || {
        moduleId: currentModule.id,
        completedAt: '',
        completedConcepts: [],
        completedTasks: [],
        challengeCompleted: false,
      };

      const updatedCompletedTasks = [...(moduleProgress.completedTasks || [])];
      if (!updatedCompletedTasks.includes(currentTask.id)) {
        updatedCompletedTasks.push(currentTask.id);
      }

      return {
        ...prev,
        taskAttempts: {
          ...prev.taskAttempts,
          [currentTask.id]: {
            ...existing,
            attemptsCount: (existing.attemptsCount || 0) + 1,
            completed: true,
            hintsUsed: Math.max(existing.hintsUsed || 0, hintsUsed),
            viewedSolution: existing.viewedSolution || viewedSolution,
            lastSubmittedSql: userSql,
            completedAt: new Date().toISOString(),
          },
        },
        completedModules: {
          ...prev.completedModules,
          [currentModule.id]: {
            ...moduleProgress,
            completedTasks: updatedCompletedTasks,
          },
        },
      };
    });
  };

  // Step 3: All tasks in concept finished -> Advance directly to next concept / challenge / day complete
  const handleCompleteConcept = () => {
    setUserState((prev) => {
      const moduleProgress = prev.completedModules[currentModule.id];
      const completedConcepts = moduleProgress?.completedConcepts || [];
      if (!completedConcepts.includes(currentConcept.id)) {
        completedConcepts.push(currentConcept.id);
      }
      return {
        ...prev,
        completedModules: {
          ...prev.completedModules,
          [currentModule.id]: {
            moduleId: currentModule.id,
            completedAt: moduleProgress?.completedAt || '',
            completedConcepts,
            completedTasks: moduleProgress?.completedTasks || [],
            challengeCompleted: moduleProgress?.challengeCompleted || false,
          },
        },
      };
    });

    const nextConceptIdx = currentConceptIndex + 1;
    if (nextConceptIdx < concepts.length) {
      setCurrentConceptIndex(nextConceptIdx);
      setCurrentTaskIndex(0);
      setStage('lesson');
    } else if (currentModule.challenge) {
      setStage('challenge');
    } else {
      handleCompleteDay();
    }
  };

  // Step 3 -> 4: Continue to Next Concept or Independent Challenge
  const handleContinueNextConcept = () => {
    const nextConceptIdx = currentConceptIndex + 1;
    if (nextConceptIdx < concepts.length) {
      setCurrentConceptIndex(nextConceptIdx);
      setCurrentTaskIndex(0);
      setStage('lesson');
    } else if (currentModule.challenge) {
      setStage('challenge');
    } else {
      handleCompleteDay();
    }
  };

  // Step 4: Challenge Task Success
  const handleChallengeTaskSuccess = (taskId: string, userSql: string) => {
    setCompletedChallengeTaskIds((prev) => {
      if (prev.includes(taskId)) return prev;
      return [...prev, taskId];
    });

    setUserState((prev) => {
      const existing = prev.taskAttempts?.[taskId] || {
        taskId,
        attemptsCount: 0,
        completed: false,
        hintsUsed: 0,
        viewedSolution: false,
      };

      const moduleProgress = prev.completedModules[currentModule.id] || {
        moduleId: currentModule.id,
        completedAt: '',
        completedConcepts: [],
        completedTasks: [],
        challengeCompleted: false,
      };

      const updatedCompletedTasks = [...(moduleProgress.completedTasks || [])];
      if (!updatedCompletedTasks.includes(taskId)) {
        updatedCompletedTasks.push(taskId);
      }

      return {
        ...prev,
        taskAttempts: {
          ...prev.taskAttempts,
          [taskId]: {
            ...existing,
            attemptsCount: (existing.attemptsCount || 0) + 1,
            completed: true,
            lastSubmittedSql: userSql,
            completedAt: new Date().toISOString(),
          },
        },
        completedModules: {
          ...prev.completedModules,
          [currentModule.id]: {
            ...moduleProgress,
            completedTasks: updatedCompletedTasks,
          },
        },
      };
    });
  };

  // Step 4 -> 5: Finish Challenge & Complete Day
  const handleCompleteDay = () => {
    const completedAt = new Date().toISOString();
    setUserState((prev) => ({
      ...prev,
      completedModules: {
        ...prev.completedModules,
        [currentModule.id]: {
          moduleId: currentModule.id,
          completedAt,
          completedConcepts: currentModule.concepts.map((c) => c.id),
          completedTasks: currentModule.concepts.flatMap((c) => c.tasks.map((t) => t.id)),
          challengeCompleted: true,
        },
      },
    }));

    setStage('day_complete');
  };

  // Review today's module from the beginning
  const handleReviewModule = () => {
    setCurrentConceptIndex(0);
    setCurrentTaskIndex(0);
    setStage('lesson');
  };

  // Find next module in roadmap
  const nextModule = ALL_MODULES.find((m) => m.day === currentModule.day + 1);

  const handleContinueNextDay = () => {
    if (nextModule) {
      handleSelectModule(nextModule.id);
    }
  };

  // Close the auth page and return to the homepage (landing view).
  const handleAuthBack = () => {
    setAuthMode(null);
    setActiveTab('learning-path');
  };

  // Sign the user out via Better Auth.
  const handleSignOut = async () => {
    await authClient.signOut();
  };

  // Auth is its own full page — when a mode is active, render the auth view in
  // place of the app shell (no modal overlay, nothing bleeding through behind it).
  if (authMode) {
    return (
      <AuthView
        mode={authMode}
        onSetMode={setAuthMode}
        onBack={handleAuthBack}
        onSuccess={handleAuthBack}
      />
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface-base text-on-surface font-body-md antialiased selection:bg-primary-container/30 selection:text-primary">
      {/* Top Application Header matching HTML */}
      <Header
        userState={userState}
        currentModule={currentModule}
        onUpdateState={setUserState}
        onResetProgress={handleResetProgress}
        onOpenSchemaModal={() => setIsSchemaModalOpen(true)}
        onOpenRoadmapModal={() => setIsRoadmapModalOpen(true)}
        onLogoClick={() => {
          setRoadmapScrollTarget(currentModuleId);
          setActiveTab('learning-path');
        }}
        onSignInClick={() => setAuthMode('signin')}
        onSignUpClick={() => setAuthMode('signup')}
        user={authUser}
        isAuthPending={isAuthPending}
        onSignOut={handleSignOut}
        activeViewTitle={activeTab === 'practice' ? `Day ${currentModule.day}: ${currentModule.shortTitle}` : 'Learning Path'}
      />

      {/* Main Content Area â€” header is sticky (in flow), so no top offset needed */}
      <main className="relative w-full bg-surface-base min-h-screen">
        {activeTab === 'learning-path' || activeTab === 'home' ? (
          <LearningPathView
            userState={userState}
            currentModuleId={currentModuleId}
            currentConceptIndex={currentConceptIndex}
            onSelectModuleAndConcept={handleSelectModuleAndConcept}
            onOpenSchema={() => setIsSchemaModalOpen(true)}
            scrollToModuleId={roadmapScrollTarget ?? undefined}
            onScrolledToModule={() => setRoadmapScrollTarget(null)}
          />
        ) : (
          <div className="flex flex-col w-full pb-8 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
            {/* Breadcrumb Header in Practice View */}
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 pb-4 mb-4 border-b border-outline-variant/40">
              <button
                onClick={() => {
                  setRoadmapScrollTarget(currentModuleId);
                  setActiveTab('learning-path');
                }}
                className="flex items-center gap-2 font-label-sm text-label-sm text-text-muted hover:text-primary transition cursor-pointer min-w-0"
              >
                <span className="material-symbols-outlined text-[18px] shrink-0">arrow_back</span>
                <span className="truncate">Back to Learning Path</span>
              </button>

              <div className="flex items-center gap-2 shrink-0">
                <span className="font-label-sm text-label-sm bg-surface-container text-text-muted px-2.5 py-1 rounded border border-outline-variant/60 whitespace-nowrap">
                  Day {currentModule.day} of 25
                </span>
              </div>
            </div>

            {/* Dynamic Learning Stage Views */}
            <AnimatePresence mode="wait">
              {stage === 'lesson' && currentConcept && (
                <ConceptLessonView
                  key={`lesson-${currentConcept.id}`}
                  concept={currentConcept}
                  conceptIndex={currentConceptIndex}
                  totalConcepts={concepts.length}
                  onStartPractice={handleStartPractice}
                  onExecuteSql={(sql) => sqlExecutor.executeQuery(sql)}
                  onPrevious={() => {
                    if (currentConceptIndex > 0) {
                      setCurrentConceptIndex((prev) => prev - 1);
                      setCurrentTaskIndex(0);
                    }
                  }}
                  canGoBack={currentConceptIndex > 0}
                />
              )}

              {stage === 'practice' && currentTask && currentConcept && (
                <PracticeTaskView
                  key={`practice-${currentTask.id}`}
                  task={currentTask}
                  taskIndex={currentTaskIndex}
                  totalTasks={currentTasks.length}
                  concept={currentConcept}
                  conceptIndex={currentConceptIndex}
                  totalConcepts={concepts.length}
                  isCompleted={Boolean(
                    userState.taskAttempts?.[currentTask.id]?.completed ||
                    userState.completedModules?.[currentModule.id]?.completedTasks?.includes(currentTask.id)
                  )}
                  savedSql={userState.taskAttempts?.[currentTask.id]?.lastSubmittedSql}
                  onExecuteSql={(sql) => sqlExecutor.executeQuery(sql)}
                  onTaskSuccess={handleTaskSuccess}
                  onPreviousTask={() => {
                    if (currentTaskIndex > 0) {
                      setCurrentTaskIndex((prev) => prev - 1);
                    }
                  }}
                  onNextTask={() => {
                    if (currentTaskIndex < currentTasks.length - 1) {
                      setCurrentTaskIndex((prev) => prev + 1);
                    } else {
                      handleCompleteConcept();
                    }
                  }}
                  onBackToLesson={() => setStage('lesson')}
                  canGoBack={currentTaskIndex > 0}
                  canGoForward={
                    currentTaskIndex < currentTasks.length - 1 ||
                    Boolean(userState.taskAttempts?.[currentTask.id]?.completed)
                  }
                />
              )}

              {stage === 'concept_complete' && currentConcept && (
                <ConceptCompleteView
                  key={`complete-${currentConcept.id}`}
                  concept={currentConcept}
                  conceptIndex={currentConceptIndex}
                  totalConcepts={concepts.length}
                  onContinueNextConcept={handleContinueNextConcept}
                />
              )}

              {stage === 'challenge' && currentModule.challenge && (
                <IndependentChallengeView
                  key={`challenge-${currentModule.challenge.id}`}
                  challenge={currentModule.challenge}
                  completedTaskIds={completedChallengeTaskIds}
                  onExecuteSql={(sql) => sqlExecutor.executeQuery(sql)}
                  onChallengeTaskSuccess={handleChallengeTaskSuccess}
                  onFinishAllChallenges={handleCompleteDay}
                  onBackToPractice={() => {
                    setCurrentTaskIndex(0);
                    setStage('practice');
                  }}
                />
              )}

              {stage === 'day_complete' && (
                <ModuleCompletionView
                  key={`daycomplete-${currentModule.id}`}
                  module={currentModule}
                  nextModule={nextModule}
                  userState={userState}
                  onReviewModule={handleReviewModule}
                  onOpenRoadmap={() => setIsRoadmapModalOpen(true)}
                  onContinueNextDay={handleContinueNextDay}
                />
              )}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Global Modals */}
      <SuccessModal
        isOpen={successModalData.isOpen}
        title={successModalData.title}
        message={successModalData.message}
        userSql={successModalData.userSql}
        conceptProgressText={successModalData.progressText}
        progressPercent={successModalData.progressPercent}
        onContinue={successModalData.onContinue}
        onClose={() => setSuccessModalData((d) => ({ ...d, isOpen: false }))}
      />

      <SchemaModal
        isOpen={isSchemaModalOpen}
        onClose={() => setIsSchemaModalOpen(false)}
      />

      <RoadmapModal
        isOpen={isRoadmapModalOpen}
        userState={userState}
        currentModuleId={currentModuleId}
        onSelectModule={handleSelectModule}
        onClose={() => setIsRoadmapModalOpen(false)}
      />
    </div>
  );
}
