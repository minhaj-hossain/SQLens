'use client';
/**
 * LearnHomePage — the content of `/` (Phase 1).
 * The learning-path ↔ lesson-flow switch is still state-driven (activeTab)
 * until Phase 3 introduces real /learn routes; URL sync and NavSnapshot remain
 * in LearningProgressProvider until then.
 */
import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import Icon from '@/components/ui/Icon';
import { LearningPathView } from '@/components/roadmap/LearningPathView';
import { ConceptLessonView } from '@/components/learning/ConceptLessonView';
import { PracticeTaskView } from '@/components/learning/PracticeTaskView';
import { ConceptCompleteView } from '@/components/learning/ConceptCompleteView';
import { IndependentChallengeView } from '@/components/learning/IndependentChallengeView';
import { ModuleCompletionView } from '@/components/learning/ModuleCompletionView';
import { SuccessModal } from '@/components/learning/SuccessModal';
import { useLearning } from '@/components/providers/LearningProgressProvider';
import { useSqlExecutor } from '@/components/providers/SqlExecutorProvider';
import { useUiChrome } from '@/components/providers/UiChromeProvider';

export default function LearnHomePage() {
  const {
    userState,
    currentModuleId,
    currentConceptId,
    setCurrentConceptId,
    currentConceptIndex,
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
    completedChallengeTaskIds,
    handleSelectModuleAndConcept,
    handleStartPractice,
    handleTaskSuccess,
    handleCompleteConcept,
    handleContinueNextConcept,
    handleChallengeTaskSuccess,
    handleCompleteDay,
    handleReviewModule,
    handleContinueNextDay,
  } = useLearning();
  const { executeQuery, resetDatabase } = useSqlExecutor();
  const { openSchema, openRoadmap, roadmapScrollTarget, setRoadmapScrollTarget } = useUiChrome();

  // Legacy success modal — currently never opened programmatically; kept for
  // parity with the pre-migration shell.
  const [successModalData, setSuccessModalData] = useState({
    isOpen: false,
    title: '',
    message: '',
    userSql: '',
    progressText: '',
    progressPercent: 100,
    onContinue: () => {},
  });

  // Reset the in-memory DB whenever the active module/concept/task/stage
  // changes so DML/DDL mutations cannot leak into later lessons.
  // (Phase 3 moves this to route boundaries.)
  useEffect(() => {
    resetDatabase();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentModuleId, currentConceptIndex, currentTaskIndex, stage]);

  return (
    <>
      {activeTab === 'learning-path' || activeTab === 'home' ? (
        <LearningPathView
          userState={userState}
          currentModuleId={currentModuleId}
          currentConceptId={currentConceptId}
          onSelectModuleAndConcept={handleSelectModuleAndConcept}
          onOpenSchema={openSchema}
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
                    const prevConcept = concepts[currentConceptIndex - 1];
                    if (prevConcept) setCurrentConceptId(prevConcept.id);
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
                onOpenRoadmap={openRoadmap}
                onContinueNextDay={handleContinueNextDay}
              />
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Legacy global success modal — see note above */}
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
    </>
  );
}

