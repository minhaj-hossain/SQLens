'use client';
/**
 * AppShell — presentation layer only (Phase 0).
 * All learning state, progress sync, auth session and the SQL executor now
 * live in the providers under src/components/providers (see AppProviders).
 * What remains here: full-page gates (auth view, blocked view, playground),
 * chrome (header), global modals, and the routing of stage → view component.
 */
import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { Header } from '@/components/layout/Header';
import Icon from '@/components/ui/Icon';
import { AuthView } from '@/components/auth/AuthView';
import BlockedView from '@/components/auth/BlockedView';
import Playground from '@/components/learning/Playground';
import { LearningPathView } from '@/components/roadmap/LearningPathView';
import { ConceptLessonView } from '@/components/learning/ConceptLessonView';
import { PracticeTaskView } from '@/components/learning/PracticeTaskView';
import { ConceptCompleteView } from '@/components/learning/ConceptCompleteView';
import { IndependentChallengeView } from '@/components/learning/IndependentChallengeView';
import { ModuleCompletionView } from '@/components/learning/ModuleCompletionView';
import { SuccessModal } from '@/components/learning/SuccessModal';
import dynamic from 'next/dynamic';
import { useLearning } from '@/components/providers/LearningProgressProvider';
import { useAuth } from '@/components/providers/AuthProvider';
import { useSqlExecutor } from '@/components/providers/SqlExecutorProvider';

// Heavy, rarely-opened modals are code-split out of the initial bundle.
const SchemaModal = dynamic(
  () => import('@/components/roadmap/SchemaModal').then((m) => m.SchemaModal),
);
const RoadmapModal = dynamic(
  () => import('@/components/roadmap/RoadmapModal').then((m) => m.RoadmapModal),
);

export default function AppShell() {
  // ---- Learning state & actions (owned by LearningProgressProvider) --------
  const {
    userState,
    currentModuleId,
    setCurrentModuleId,
    currentConceptIndex,
    setCurrentConceptIndex,
    currentTaskIndex,
    setCurrentTaskIndex,
    stage,
    setStage,
    activeTab,
    setActiveTab,
    currentModule,
    concepts,
    currentConcept,
    currentTasks,
    currentTask,
    nextModule,
    availabilityVersion,
    completedChallengeTaskIds,
    handleSelectModuleAndConcept,
    handleSelectModule,
    handleResetProgress,
    handleStartPractice,
    handleTaskSuccess,
    handleCompleteConcept,
    handleContinueNextConcept,
    handleChallengeTaskSuccess,
    handleCompleteDay,
    handleReviewModule,
    handleContinueNextDay,
  } = useLearning();
  const { user: authUser, isAuthPending, signOut } = useAuth();
  const { executeQuery, resetDatabase } = useSqlExecutor();

  // ---- Chrome-only state (stays in AppShell) -------------------------------
  // Auth pages ('signin' | 'signup' | null = closed). Static UI only for now.
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | null>(null);
  // Module card the Learning Path should auto-scroll to when it becomes visible.
  const [roadmapScrollTarget, setRoadmapScrollTarget] = useState<string | null>(null);
  const [isSchemaModalOpen, setIsSchemaModalOpen] = useState<boolean>(false);
  const [isRoadmapModalOpen, setIsRoadmapModalOpen] = useState<boolean>(false);
  const [isPlaygroundOpen, setIsPlaygroundOpen] = useState<boolean>(false);
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

  // Reset the in-memory DB whenever the active module/concept/task/stage changes.
  // This prevents DML/DDL mutations from one task (e.g. DELETE FROM products;)
  // from leaking into later lessons. (Phase 3 moves this to route boundaries.)
  useEffect(() => {
    resetDatabase();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentModuleId, currentConceptIndex, currentTaskIndex, stage]);

  // Close the auth page and return to the homepage (landing view).
  const handleAuthBack = () => {
    setAuthMode(null);
    setActiveTab('learning-path');
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

  // A blocked account gets a dedicated full-page screen instead of the app.
  // (Server-side enforcement happens independently on every authenticated API.)
  if (!isAuthPending && authUser?.status === 'blocked') {
    return <BlockedView onSignOut={signOut} />;
  }

  // SQL Playground — its own full page, like the auth view.
  if (isPlaygroundOpen) {
    return <Playground onClose={() => setIsPlaygroundOpen(false)} />;
  }

  return (
    <div
      data-availability={availabilityVersion}
      className="flex min-h-screen flex-col bg-surface-base text-on-surface font-body-md antialiased selection:bg-primary-container/30 selection:text-primary"
    >
      {/* Top Application Header matching HTML */}
      <Header
        userState={userState}
        currentModule={currentModule}
        onResetProgress={handleResetProgress}
        onOpenSchemaModal={() => setIsSchemaModalOpen(true)}
        onOpenRoadmapModal={() => setIsRoadmapModalOpen(true)}
        onOpenPlayground={() => setIsPlaygroundOpen(true)}
        onLogoClick={() => {
          setRoadmapScrollTarget(currentModuleId);
          setActiveTab('learning-path');
        }}
        onSignInClick={() => setAuthMode('signin')}
        onSignUpClick={() => setAuthMode('signup')}
        user={authUser}
        isAuthPending={isAuthPending}
        onSignOut={signOut}
        activeViewTitle={activeTab === 'practice' ? `Day ${currentModule.day}: ${currentModule.shortTitle}` : 'Learning Path'}
      />

      {/* Main Content Area — header is sticky (in flow), so no top offset needed */}
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
                <Icon name="arrow_back" className="text-[18px] shrink-0" />
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
                  onExecuteSql={executeQuery}
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
                  onExecuteSql={executeQuery}
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
                  onExecuteSql={executeQuery}
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

