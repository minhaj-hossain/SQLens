import React, { useState } from 'react';
import { ALL_MODULES } from '../../content/curriculum-index';
import { ROADMAP_MILESTONES } from '../../config/roadmap';
import { ModuleData, Concept } from '../../types/curriculum';
import { UserLearningState } from '../../types/progress';
import {
  getModuleUnlockStatus,
  isConceptCompleted,
  isModuleConceptsCompleted,
  isModuleChallengeUnlocked,
} from '../../lib/progress/unlock-calculator';

interface LearningPathViewProps {
  userState: UserLearningState;
  currentModuleId: string;
  currentConceptIndex: number;
  onSelectModuleAndConcept: (moduleId: string, conceptIndex?: number, stage?: 'lesson' | 'practice' | 'challenge') => void;
  onOpenSchema: () => void;
}

export const LearningPathView: React.FC<LearningPathViewProps> = ({
  userState,
  currentModuleId,
  currentConceptIndex,
  onSelectModuleAndConcept,
  onOpenSchema,
}) => {
  const [lockedAlert, setLockedAlert] = useState<{
    title: string;
    message: string;
    targetModuleId?: string;
    targetConceptIdx?: number;
    actionLabel?: string;
  } | null>(null);

  // Overall curriculum stats
  const totalDays = ALL_MODULES.length;
  const completedDaysCount = Object.keys(userState.completedModules).length;
  const overallPercent = Math.round((completedDaysCount / totalDays) * 100);

  return (
    <div className="flex flex-col w-full pb-32">
      {/* Locked Notice Banner if clicked */}
      {lockedAlert && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
          <div className="bg-surface-container border border-amber-500/50 shadow-2xl rounded-xl p-4 flex items-start gap-3 text-left animate-in fade-in slide-in-from-top-3 duration-200">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
              <span className="material-symbols-outlined text-[20px]">lock</span>
            </div>
            <div className="flex-1 space-y-1">
              <h4 className="font-headline-sm text-sm font-bold text-on-surface">
                {lockedAlert.title}
              </h4>
              <p className="text-xs text-text-muted leading-relaxed font-body-md">
                {lockedAlert.message}
              </p>
              {lockedAlert.targetModuleId && (
                <div className="pt-1.5 flex items-center gap-2">
                  <button
                    onClick={() => {
                      onSelectModuleAndConcept(
                        lockedAlert.targetModuleId!,
                        lockedAlert.targetConceptIdx || 0,
                        'lesson'
                      );
                      setLockedAlert(null);
                    }}
                    className="px-3 py-1 bg-primary-container text-on-primary-container font-label-sm text-xs font-semibold rounded hover:brightness-110 transition cursor-pointer"
                  >
                    {lockedAlert.actionLabel || 'Go to Current Lesson'}
                  </button>
                  <button
                    onClick={() => setLockedAlert(null)}
                    className="px-2.5 py-1 text-xs text-text-muted hover:text-on-surface font-label-sm transition cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={() => setLockedAlert(null)}
              className="text-text-muted hover:text-on-surface p-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        </div>
      )}

      {/* Top Overview & Progress Header */}
      <div className="px-margin-mobile pt-4 pb-2 max-w-4xl mx-auto w-full">
        <div className="bg-surface-container rounded-xl border border-outline-variant/70 p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">
                  route
                </span>
                <span className="font-label-sm text-xs font-semibold uppercase tracking-wider text-primary">
                  Curriculum Roadmap
                </span>
              </div>
              <h1 className="font-headline-sm text-xl font-bold text-on-surface">
                25-Day SQL Mastery Journey
              </h1>
              <p className="text-xs text-text-muted font-body-md">
                3 structured milestones taking you from single-table querying to production backend relational architecture.
              </p>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 border-t sm:border-t-0 border-outline-variant/40 pt-3 sm:pt-0">
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-muted font-label-sm">Overall Progress:</span>
                <span className="font-mono text-sm font-bold text-primary">
                  {completedDaysCount}/{totalDays} Days ({overallPercent}%)
                </span>
              </div>
              <div className="w-36 h-2 rounded-full bg-surface-dim overflow-hidden border border-outline-variant/40">
                <div
                  style={{ width: `${overallPercent}%` }}
                  className="h-full bg-primary-container rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(0,173,181,0.4)]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grouped Milestone Sections */}
      <div className="px-margin-mobile py-6 flex flex-col gap-10 max-w-4xl mx-auto w-full">
        {ROADMAP_MILESTONES.map((milestone, milestoneIdx) => {
          // Get all modules belonging to this milestone
          const milestoneModules: ModuleData[] = ALL_MODULES.filter((m) =>
            milestone.moduleIds.includes(m.id)
          );

          // Calculate milestone progress
          const completedInMilestone = milestoneModules.filter(
            (m) => !!userState.completedModules[m.id]
          ).length;
          const isMilestoneCompleted = completedInMilestone === milestoneModules.length;
          const isMilestoneActive = milestoneModules.some((m) => m.id === currentModuleId);
          const milestonePercent = Math.round(
            (completedInMilestone / milestoneModules.length) * 100
          );

          return (
            <section
              key={milestone.id}
              className="flex flex-col gap-5 relative"
              aria-label={milestone.title}
            >
              {/* Milestone Banner Header */}
              <div className="rounded-xl border border-outline-variant/80 bg-surface-container overflow-hidden shadow-sm">
                <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-surface-container via-surface-container to-surface-variant/30">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-label-sm text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-primary-container/20 text-primary border border-primary-container/30">
                        {milestone.title} · {milestone.daysRange}
                      </span>
                      {isMilestoneCompleted ? (
                        <span className="font-label-sm text-[11px] font-medium text-primary flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">check_circle</span>
                          Completed
                        </span>
                      ) : isMilestoneActive ? (
                        <span className="font-label-sm text-[11px] font-medium text-on-surface flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px] text-primary">play_circle</span>
                          In Progress
                        </span>
                      ) : null}
                    </div>

                    <h2 className="font-headline-sm text-lg font-bold text-on-surface">
                      {milestone.subtitle}
                    </h2>
                    <p className="text-xs text-text-muted font-body-md max-w-2xl leading-relaxed">
                      {milestone.description}
                    </p>
                  </div>

                  {/* Milestone Progress Metric */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1.5 border-t sm:border-t-0 border-outline-variant/40 pt-2.5 sm:pt-0">
                    <span className="font-label-sm text-xs text-text-muted">
                      {completedInMilestone}/{milestoneModules.length} Days Done
                    </span>
                    <div className="w-28 h-1.5 rounded-full bg-surface-dim overflow-hidden border border-outline-variant/40">
                      <div
                        style={{ width: `${milestonePercent}%` }}
                        className="h-full bg-primary rounded-full transition-all duration-300"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Modules List inside this Milestone */}
              <div className="flex flex-col gap-6 pl-0 sm:pl-2">
                {milestoneModules.map((module) => {
                  const unlockStatus = getModuleUnlockStatus(module, ALL_MODULES, userState);
                  const isCurrent = module.id === currentModuleId;
                  const isCompleted = !!userState.completedModules[module.id];
                  const isUnlocked = unlockStatus.isUnlocked || isCompleted;

                  const totalConcepts = module.concepts.length;
                  const completedConceptsCount = module.concepts.filter((c) =>
                    isConceptCompleted(c, module.id, userState)
                  ).length;
                  const areConceptsComplete = isModuleConceptsCompleted(module, userState);

                  const challengeStatus = isModuleChallengeUnlocked(module, ALL_MODULES, userState);
                  const isChallengeUnlocked = challengeStatus.isUnlocked;
                  const isChallengeCompleted = challengeStatus.isCompleted;

                  // Find first incomplete concept index
                  const firstIncompleteConceptIdx = module.concepts.findIndex(
                    (c) => !isConceptCompleted(c, module.id, userState)
                  );

                  // Status label
                  let statusText = `${completedConceptsCount}/${totalConcepts}`;
                  if (isCompleted) {
                    statusText = 'Completed';
                  } else if (isCurrent) {
                    statusText = `${completedConceptsCount > 0 ? completedConceptsCount : 1} started`;
                  } else if (!isUnlocked) {
                    statusText = unlockStatus.countdownFormatted
                      ? `Unlocks in ${unlockStatus.countdownFormatted.split(' ')[0]}`
                      : 'Locked';
                  }

                  return (
                    <div
                      key={module.id}
                      className={`bg-surface-container rounded-xl border p-card-padding relative overflow-hidden transition-colors duration-300 hover:bg-surface-variant group ${
                        isCurrent ? 'border-outline-variant' : 'border-outline-variant/60'
                      } ${!isUnlocked ? 'opacity-70' : ''}`}
                    >
                      {/* Active Border Highlight if this is the active module */}
                      {isCurrent && (
                        <div className="absolute inset-0 border border-primary-container rounded-xl pointer-events-none opacity-100 transition-opacity duration-300" />
                      )}

                      {/* Module Header */}
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                          <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                            {module.shortTitle || module.title}
                          </h3>
                          <span className="font-label-sm text-label-sm bg-surface-variant text-text-muted px-2 py-1 rounded">
                            {statusText}
                          </span>
                        </div>

                        <button
                          disabled={!isUnlocked}
                          onClick={() => {
                            if (isUnlocked) {
                              const targetIdx = firstIncompleteConceptIdx >= 0 ? firstIncompleteConceptIdx : 0;
                              onSelectModuleAndConcept(module.id, targetIdx, 'lesson');
                            } else {
                              setLockedAlert({
                                title: `Day ${module.day} is Locked`,
                                message: unlockStatus.reason || 'Complete previous modules to unlock.',
                              });
                            }
                          }}
                          className={`font-label-sm text-label-sm border px-3 py-1.5 rounded transition-all active:scale-95 cursor-pointer ${
                            isUnlocked
                              ? 'border-primary-container text-primary-container bg-transparent hover:bg-primary-container hover:text-on-primary-container'
                              : 'border-outline-variant text-outline-variant opacity-40 cursor-not-allowed'
                          }`}
                        >
                          {isCompleted ? 'Review' : 'Practice'}
                        </button>
                      </div>

                      {/* Node Grid */}
                      <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-4 gap-4">
                        {module.concepts.map((concept: Concept, idx: number) => {
                          const isConceptDone = isConceptCompleted(concept, module.id, userState);
                          const isConceptActive = isCurrent && currentConceptIndex === idx && !isCompleted;

                          // Format short label with line breaks if multi-word
                          const words = concept.title.split(' ');
                          let label = concept.title;
                          if (words.length > 2) {
                            label = `${words.slice(0, 2).join(' ')}\n${words.slice(2).join(' ')}`;
                          }

                          if (isConceptDone) {
                            return (
                              <div
                                key={concept.id}
                                onClick={() => onSelectModuleAndConcept(module.id, idx, 'lesson')}
                                className={`flex flex-col items-center gap-2 cursor-pointer transition-opacity ${
                                  idx >= 4 ? 'col-start-1 mt-4' : ''
                                }`}
                                title={`Concept ${idx + 1}: ${concept.title} (Completed)`}
                              >
                                <div className="w-12 h-12 rounded-full border-2 border-primary-container bg-primary-container/20 flex items-center justify-center transition-transform hover:scale-105 shadow-[0_0_8px_rgba(0,173,181,0.2)]">
                                  <span className="material-symbols-outlined text-primary-container text-[20px]">
                                    check
                                  </span>
                                </div>
                                <span className="font-label-md text-label-md text-on-surface text-center leading-tight whitespace-pre-line">
                                  {label}
                                </span>
                              </div>
                            );
                          }

                          if (isConceptActive || (isUnlocked && !isConceptDone && idx === completedConceptsCount)) {
                            return (
                              <div
                                key={concept.id}
                                onClick={() => onSelectModuleAndConcept(module.id, idx, 'lesson')}
                                className={`flex flex-col items-center gap-2 cursor-pointer ${
                                  idx >= 4 ? 'col-start-1 mt-4' : ''
                                }`}
                                title={`Concept ${idx + 1}: ${concept.title} (Current)`}
                              >
                                <div className="w-12 h-12 rounded-full border-2 border-primary-container flex items-center justify-center bg-transparent transition-transform hover:scale-105 shadow-[0_0_8px_rgba(0,173,181,0.2)]">
                                  <span className="material-symbols-outlined text-primary-container text-[20px] transition-opacity">
                                    play_arrow
                                  </span>
                                </div>
                                <span className="font-label-md text-label-md text-on-surface text-center leading-tight whitespace-pre-line">
                                  {label}
                                </span>
                              </div>
                            );
                          }

                          // Locked node
                          return (
                            <div
                              key={concept.id}
                              onClick={() => {
                                if (isUnlocked) {
                                  onSelectModuleAndConcept(module.id, idx, 'lesson');
                                } else {
                                  setLockedAlert({
                                    title: `Day ${module.day} is Locked`,
                                    message: unlockStatus.reason || 'Complete previous days to unlock.',
                                  });
                                }
                              }}
                              className={`flex flex-col items-center gap-2 transition-opacity ${
                                isUnlocked
                                  ? 'cursor-pointer opacity-70 hover:opacity-100'
                                  : 'cursor-not-allowed opacity-50 hover:opacity-100'
                              } ${idx >= 4 ? 'col-start-1 mt-4' : ''}`}
                              title={`Concept ${idx + 1}: ${concept.title} (Locked)`}
                            >
                              <div className="w-12 h-12 rounded-full border-2 border-outline-variant flex items-center justify-center bg-transparent">
                                <span className="material-symbols-outlined text-outline-variant text-[18px]">
                                  lock
                                </span>
                              </div>
                              <span className="font-label-md text-label-md text-on-surface-variant text-center leading-tight whitespace-pre-line">
                                {label}
                              </span>
                            </div>
                          );
                        })}

                        {/* Independent Challenge Node if module has challenge */}
                        {module.challenge && (
                          <div
                            onClick={() => {
                              if (isChallengeUnlocked) {
                                // Direct navigation to the main Independent Challenge of the module
                                onSelectModuleAndConcept(module.id, 0, 'challenge');
                              } else {
                                // Challenge is locked - prevent jumping to challenge and provide helpful guidance
                                const targetIdx = firstIncompleteConceptIdx >= 0 ? firstIncompleteConceptIdx : 0;
                                setLockedAlert({
                                  title: `Day ${module.day} Challenge Locked`,
                                  message:
                                    challengeStatus.reason ||
                                    `You must complete all ${totalConcepts} concept lessons and practice tasks in Day ${module.day} before unlocking the Independent Challenge.`,
                                  targetModuleId: isUnlocked ? module.id : undefined,
                                  targetConceptIdx: targetIdx,
                                  actionLabel: `Start Concept ${targetIdx + 1}`,
                                });
                              }
                            }}
                            className={`flex flex-col items-center gap-2 transition-all ${
                              isChallengeUnlocked
                                ? 'cursor-pointer hover:opacity-100 hover:scale-105'
                                : 'cursor-not-allowed opacity-55 hover:opacity-80'
                            } ${module.concepts.length % 4 === 0 ? 'col-start-1 mt-4' : ''}`}
                            title={
                              isChallengeUnlocked
                                ? `Day ${module.day} Challenge: ${module.challenge.title} (Ready to Start)`
                                : `Day ${module.day} Challenge (Locked - Complete all ${totalConcepts} concepts first)`
                            }
                          >
                            <div
                              className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all ${
                                isChallengeCompleted
                                  ? 'border-primary-container bg-primary-container/20 text-primary-container shadow-[0_0_8px_rgba(0,173,181,0.25)]'
                                  : isChallengeUnlocked
                                  ? 'border-primary-container bg-primary-container/10 text-primary-container shadow-[0_0_12px_rgba(0,173,181,0.35)] ring-2 ring-primary-container/30'
                                  : 'border-outline-variant bg-surface-dim/40 text-outline-variant'
                              }`}
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                {isChallengeCompleted ? 'workspace_premium' : isChallengeUnlocked ? 'terminal' : 'lock'}
                              </span>
                            </div>
                            <span
                              className={`font-label-md text-label-md text-center leading-tight ${
                                isChallengeUnlocked ? 'text-primary-container font-semibold' : 'text-on-surface-variant'
                              }`}
                            >
                              Day {module.day} Challenge
                            </span>
                            {!isChallengeUnlocked && (
                              <span className="text-[10px] text-text-muted font-mono -mt-1">
                                {completedConceptsCount}/{totalConcepts} done
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Milestone Separator if not last */}
              {milestoneIdx < ROADMAP_MILESTONES.length - 1 && (
                <div className="flex items-center justify-center my-4">
                  <div className="flex-1 h-px bg-outline-variant/40" />
                  <div className="flex items-center gap-1.5 px-4 py-1 rounded-full bg-surface-container border border-outline-variant/60 font-label-sm text-[11px] text-text-muted">
                    <span className="material-symbols-outlined text-[14px] text-primary">arrow_downward</span>
                    <span>Next: {ROADMAP_MILESTONES[milestoneIdx + 1].title} ({ROADMAP_MILESTONES[milestoneIdx + 1].daysRange})</span>
                  </div>
                  <div className="flex-1 h-px bg-outline-variant/40" />
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
};
