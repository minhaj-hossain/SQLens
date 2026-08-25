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

function getPedagogicalModeInfo(module: ModuleData) {
  switch (module.type) {
    case 'practice_day':
      if (module.title.toLowerCase().includes('debug')) {
        return { label: 'DEBUGGING LAB', icon: 'bug_report' };
      }
      return { label: 'GUIDED PRACTICE', icon: 'bolt' };
    case 'conceptual_session':
      return { label: 'CONCEPT LAB', icon: 'science' };
    case 'project_part':
      if (module.day === 25) {
        return { label: 'GRADUATION', icon: 'workspace_premium' };
      }
      if (module.title.toLowerCase().includes('debug')) {
        return { label: 'DEBUGGING LAB', icon: 'bug_report' };
      }
      return { label: 'APPLIED PROJECT', icon: 'rocket_launch' };
    case 'assignment':
      return { label: 'MASTERY CHECKPOINT', icon: 'verified' };
    case 'module':
    default:
      return { label: 'CORE MODULE', icon: 'school' };
  }
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

  // Active module & first incomplete concept
  const activeModule = ALL_MODULES.find((m) => m.id === currentModuleId) || ALL_MODULES[0];
  const activeFirstIncompleteConceptIdx = activeModule.concepts.findIndex(
    (c) => !isConceptCompleted(c, activeModule.id, userState)
  );
  const activeTargetConceptIdx = activeFirstIncompleteConceptIdx >= 0 ? activeFirstIncompleteConceptIdx : 0;

  // SVG Circular progress ring calculations (r=27, circumference = 2 * PI * 27 = 169.646)
  const ringCircumference = 169.65;
  const ringOffset = ringCircumference - (overallPercent / 100) * ringCircumference;

  return (
    <div className="flex flex-col w-full pb-32">
      {/* Locked Notice Banner if clicked */}
      {lockedAlert && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
          <div className="bg-surface border border-string/50 shadow-2xl rounded-xl p-4 flex items-start gap-3 text-left animate-in fade-in slide-in-from-top-3 duration-200">
            <div className="p-2 rounded-lg bg-string/20 text-string shrink-0">
              <span className="material-symbols-outlined text-[20px]">lock</span>
            </div>
            <div className="flex-1 space-y-1">
              <h4 className="font-display text-sm font-bold text-text">
                {lockedAlert.title}
              </h4>
              <p className="text-xs text-text-dim leading-relaxed font-body">
                {lockedAlert.message}
              </p>
              {lockedAlert.targetModuleId && (
                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => {
                      onSelectModuleAndConcept(
                        lockedAlert.targetModuleId!,
                        lockedAlert.targetConceptIdx || 0,
                        'lesson'
                      );
                      setLockedAlert(null);
                    }}
                    className="px-3 py-1.5 bg-func text-ink font-body text-xs font-bold rounded-lg hover:brightness-110 transition cursor-pointer"
                  >
                    {lockedAlert.actionLabel || 'Go to Lesson'}
                  </button>
                  <button
                    onClick={() => setLockedAlert(null)}
                    className="px-2.5 py-1.5 text-xs text-text-dim hover:text-text font-body transition cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={() => setLockedAlert(null)}
              className="text-text-dim hover:text-text p-1 cursor-pointer"
              aria-label="Close alert"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        </div>
      )}

      {/* ============ HERO SECTION ============ */}
      <section className="max-w-[840px] mx-auto w-full px-4 sm:px-6 pt-10 sm:pt-14 pb-8 sm:pb-10">
        <div className="inline-flex items-center gap-2 font-mono text-xs tracking-wider text-func uppercase mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-func shadow-[0_0_8px_#48D8C8] shrink-0" />
          <span>SQLens · Curriculum Roadmap</span>
        </div>

        <h1 className="font-display font-semibold text-3xl sm:text-4xl lg:text-[44px] leading-tight tracking-tight text-text max-w-xl mb-4">
          Master SQL, one query at a time.
        </h1>
        <p className="text-text-dim text-sm sm:text-base max-w-lg mb-7">
          25 days, 3 milestones — from single-table querying to production-ready relational architecture.
        </p>

        {/* Query Box with Syntax Highlighting */}
        <div className="bg-surface border border-border rounded-xl p-4 sm:p-5 mb-7 font-mono text-xs sm:text-sm shadow-2xl overflow-x-auto">
          <div className="flex gap-2 mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-border inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-border inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-border inline-block" />
          </div>
          <div className="text-text space-y-1">
            <div><span className="text-keyword font-bold">SELECT</span> skill</div>
            <div><span className="text-keyword font-bold">FROM</span> you</div>
            <div><span className="text-keyword font-bold">WHERE</span> consistency = <span className="text-string">'daily'</span>;</div>
          </div>
        </div>

        {/* Hero Actions */}
        <div className="flex items-center gap-5 flex-wrap row-gap-4">
          <button
            onClick={() => {
              onSelectModuleAndConcept(activeModule.id, activeTargetConceptIdx, 'lesson');
            }}
            className="bg-func text-ink font-body font-bold text-sm px-6 py-3 rounded-full inline-flex items-center gap-2 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_-8px_rgba(72,216,200,0.5)] transition duration-150 cursor-pointer"
          >
            <span>Continue Day {activeModule.day}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>

          <div className="flex items-center gap-3 font-mono text-xs sm:text-[12.5px] text-text-dim">
            <div className="w-28 h-1.5 bg-surface-3 rounded-full overflow-hidden shrink-0">
              <div
                style={{ width: `${overallPercent}%` }}
                className="h-full bg-func rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(72,216,200,0.5)]"
              />
            </div>
            <span>{completedDaysCount} / {totalDays} days · {overallPercent}%</span>
          </div>
        </div>
      </section>

      {/* ============ ROADMAP OVERVIEW CARD ============ */}
      <section className="max-w-[840px] mx-auto w-full px-4 sm:px-6 py-6">
        <div className="bg-surface border border-border rounded-2xl p-6 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-sm">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 font-mono text-xs text-func uppercase tracking-wider mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-func" />
              <span>Curriculum Roadmap</span>
            </div>
            <h2 className="font-display font-semibold text-lg sm:text-xl text-text">
              25-Day SQL Mastery Journey
            </h2>
            <p className="text-text-dim text-xs sm:text-sm max-w-md">
              3 structured milestones taking you from single-table querying to production backend relational architecture.
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <svg width="64" height="64" viewBox="0 0 64 64" className="-rotate-90">
              <circle cx="32" cy="32" r="27" fill="none" stroke="var(--surface-3)" strokeWidth="6" />
              <circle
                cx="32"
                cy="32"
                r="27"
                fill="none"
                stroke="var(--func)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={ringCircumference}
                strokeDashoffset={ringOffset}
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div className="font-mono">
              <span className="block text-sm sm:text-base text-text font-semibold">
                {completedDaysCount}/{totalDays} days
              </span>
              <span className="block text-xs text-text-dim mt-0.5">
                {overallPercent}% complete
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ============ MILESTONES & TIMELINE ============ */}
      <div className="max-w-[840px] mx-auto w-full px-4 sm:px-6 py-4 flex flex-col gap-12" id="roadmap">
        {ROADMAP_MILESTONES.map((milestone, milestoneIdx) => {
          const milestoneModules: ModuleData[] = ALL_MODULES.filter((m) =>
            milestone.moduleIds.includes(m.id)
          );

          const completedInMilestone = milestoneModules.filter(
            (m) => !!userState.completedModules[m.id]
          ).length;
          const isMilestoneCompleted = completedInMilestone === milestoneModules.length;
          const isMilestoneActive = milestoneModules.some((m) => m.id === currentModuleId);
          const isMilestoneLocked = milestoneIdx > 0 && !ROADMAP_MILESTONES[milestoneIdx - 1].moduleIds.every((id) => !!userState.completedModules[id]);

          // If milestone is locked teaser
          if (isMilestoneLocked && completedInMilestone === 0) {
            return (
              <div
                key={milestone.id}
                className="flex items-center gap-4 bg-surface border border-dashed border-border rounded-2xl p-6 opacity-70"
              >
                <div className="w-10 h-10 rounded-xl bg-surface-2 flex items-center justify-center shrink-0 text-text-faint">
                  <span className="material-symbols-outlined text-[20px]">lock</span>
                </div>
                <div>
                  <h3 className="font-display text-base font-semibold text-text-dim mb-1">
                    {milestone.title} — {milestone.subtitle}
                  </h3>
                  <p className="font-mono text-xs text-text-faint">
                    Unlocks after {ROADMAP_MILESTONES[milestoneIdx - 1].title} · {milestone.daysRange}
                  </p>
                </div>
              </div>
            );
          }

          return (
            <section
              key={milestone.id}
              className="flex flex-col gap-5"
              aria-label={milestone.title}
            >
              {/* Milestone Head */}
              <div className="mb-2">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <span className="font-mono text-xs tracking-wider text-string bg-string/10 border border-string/30 px-2.5 py-1 rounded-full whitespace-nowrap uppercase">
                    {milestone.title} · {milestone.daysRange}
                  </span>
                  <span className="flex items-center gap-1.5 font-mono text-xs text-text-dim">
                    <span className="material-symbols-outlined text-[14px] text-string">
                      {isMilestoneCompleted ? 'check_circle' : isMilestoneActive ? 'play_circle' : 'schedule'}
                    </span>
                    <span>
                      {isMilestoneCompleted
                        ? 'Completed'
                        : `In progress · ${completedInMilestone}/${milestoneModules.length} days done`}
                    </span>
                  </span>
                </div>

                <h3 className="font-display font-semibold text-lg sm:text-xl text-text mb-1">
                  {milestone.subtitle}
                </h3>
                <p className="text-text-dim text-xs sm:text-sm max-w-2xl">
                  {milestone.description}
                </p>
              </div>

              {/* ER-Style Timeline Rail */}
              <ol className="timeline-container">
                {milestoneModules.map((module) => {
                  const unlockStatus = getModuleUnlockStatus(module, ALL_MODULES, userState);
                  const isCurrent = module.id === currentModuleId;
                  const isCompleted = !!userState.completedModules[module.id];
                  const isUnlocked = unlockStatus.isUnlocked || isCompleted;

                  const totalConcepts = module.concepts.length;
                  const completedConceptsCount = module.concepts.filter((c) =>
                    isConceptCompleted(c, module.id, userState)
                  ).length;

                  const challengeStatus = isModuleChallengeUnlocked(module, ALL_MODULES, userState);
                  const isChallengeUnlocked = challengeStatus.isUnlocked;
                  const isChallengeCompleted = challengeStatus.isCompleted;

                  const firstIncompleteConceptIdx = module.concepts.findIndex(
                    (c) => !isConceptCompleted(c, module.id, userState)
                  );
                  const targetConceptIdx = firstIncompleteConceptIdx >= 0 ? firstIncompleteConceptIdx : 0;

                  const modeInfo = getPedagogicalModeInfo(module);

                  // Day node state class
                  const nodeStateClass = isCompleted
                    ? 'day-node-done'
                    : isCurrent
                    ? 'day-node-active'
                    : isUnlocked
                    ? 'day-node-unlocked'
                    : 'day-node-locked';

                  return (
                    <li
                      key={module.id}
                      className={`relative mb-6 ${nodeStateClass}`}
                    >
                      {/* Left Rail Connector Dot */}
                      <span
                        className="node-dot-connector"
                        aria-hidden="true"
                      >
                        {isCompleted ? (
                          <span className="material-symbols-outlined text-[14px]">check</span>
                        ) : !isUnlocked ? (
                          <span className="material-symbols-outlined text-[14px]">lock</span>
                        ) : (
                          module.day
                        )}
                      </span>

                      {/* Day Card */}
                      <div
                        className={`rounded-xl border p-5 sm:p-6 transition-all duration-200 ${
                          !isUnlocked
                            ? 'bg-ink border-border-soft opacity-75'
                            : isCurrent
                            ? 'bg-surface border-string/40 shadow-[0_0_16px_rgba(240,168,96,0.12)]'
                            : 'bg-surface border-border hover:border-border/80'
                        }`}
                      >
                        {/* Day Card Header */}
                        <div className="flex items-start justify-between gap-3 mb-5">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-comment font-mono text-[10.5px] uppercase tracking-wider">
                              <span className="material-symbols-outlined text-[14px]">
                                {modeInfo.icon}
                              </span>
                              <span>{modeInfo.label}</span>
                            </div>
                            <h4
                              className={`font-display text-base font-semibold ${
                                !isUnlocked ? 'text-text-faint' : 'text-text'
                              }`}
                            >
                              Day {module.day} — {module.shortTitle || module.title}
                            </h4>
                          </div>

                          <div className="flex items-center gap-2.5 shrink-0">
                            {isCompleted ? (
                              <>
                                <span className="font-mono text-[10.5px] px-2 py-0.5 rounded bg-func/10 text-func border border-func/25 uppercase">
                                  COMPLETED
                                </span>
                                <button
                                  onClick={() => onSelectModuleAndConcept(module.id, 0, 'lesson')}
                                  className="font-mono text-xs text-func border border-func/30 px-3 py-1 rounded-lg hover:bg-func/10 transition cursor-pointer"
                                >
                                  Review
                                </button>
                              </>
                            ) : isCurrent ? (
                              <>
                                <span className="font-mono text-[10.5px] px-2 py-0.5 rounded bg-string/10 text-string border border-string/25 uppercase">
                                  IN PROGRESS
                                </span>
                                <button
                                  onClick={() => onSelectModuleAndConcept(module.id, targetConceptIdx, 'lesson')}
                                  className="font-mono text-xs text-ink bg-func font-bold px-3 py-1 rounded-lg hover:brightness-110 transition cursor-pointer"
                                >
                                  Continue →
                                </button>
                              </>
                            ) : isUnlocked ? (
                              <button
                                onClick={() => onSelectModuleAndConcept(module.id, 0, 'lesson')}
                                className="font-mono text-xs text-text-dim border border-border px-3 py-1 rounded-lg hover:text-text hover:border-text-dim transition cursor-pointer"
                              >
                                Start
                              </button>
                            ) : (
                              <span className="font-mono text-[11px] text-text-faint">
                                Locked
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Concept Grid (Multi-Column Auto-Flow) */}
                        <div
                          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-3 gap-y-4 items-start"
                        >
                          {module.concepts.map((concept: Concept, idx: number) => {
                            const isConceptDone = isConceptCompleted(concept, module.id, userState);
                            const isConceptActive = isCurrent && currentConceptIndex === idx && !isCompleted;
                            const isConceptUnlocked = isUnlocked && (isConceptDone || idx === completedConceptsCount);

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
                                className={`flex flex-col items-center text-center gap-2 group cursor-pointer transition-all ${
                                  !isUnlocked ? 'cursor-not-allowed opacity-50' : 'hover:scale-105'
                                }`}
                                aria-label={`Concept ${idx + 1}: ${concept.title} - ${
                                  isConceptDone ? 'Completed' : isConceptActive ? 'Current lesson' : isUnlocked ? 'Unlocked' : 'Locked'
                                }`}
                                aria-disabled={!isUnlocked}
                              >
                                {/* Concept Icon Bubble (42px x 42px) */}
                                <div
                                  className={`w-[42px] h-[42px] rounded-full flex items-center justify-center transition-all ${
                                    isConceptDone
                                      ? 'bg-func/10 border-1.5 border-func text-func shadow-[0_0_8px_rgba(72,216,200,0.25)]'
                                      : isConceptActive
                                      ? 'bg-string/10 border-1.5 border-string text-string shadow-[0_0_8px_rgba(240,168,96,0.3)] ring-2 ring-string/20'
                                      : isConceptUnlocked
                                      ? 'bg-surface-2 border-1.5 border-border text-text hover:border-func/50'
                                      : 'bg-surface-2 border-1.5 border-border text-text-faint'
                                  }`}
                                >
                                  {isConceptDone ? (
                                    <span className="material-symbols-outlined text-[16px]">check</span>
                                  ) : isConceptActive ? (
                                    <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                                  ) : !isUnlocked ? (
                                    <span className="material-symbols-outlined text-[16px]">lock</span>
                                  ) : (
                                    <span className="font-mono text-xs font-semibold">{idx + 1}</span>
                                  )}
                                </div>

                                {/* Concept Title with Clean 2-Line Clamp */}
                                <span
                                  className={`concept-label-clamp ${
                                    isConceptDone
                                      ? 'text-text font-medium'
                                      : isConceptActive
                                      ? 'text-string font-semibold'
                                      : isUnlocked
                                      ? 'text-text-dim group-hover:text-text'
                                      : 'text-text-faint'
                                  }`}
                                >
                                  {concept.title}
                                </span>
                              </div>
                            );
                          })}

                          {/* Dedicated Full-Width Challenge Strip */}
                          {module.challenge && (
                            <div
                              onClick={() => {
                                if (isChallengeUnlocked) {
                                  onSelectModuleAndConcept(module.id, 0, 'challenge');
                                } else {
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
                              className={`col-span-full flex items-center justify-between gap-3 pt-3.5 mt-1 border-t border-dashed border-border-soft cursor-pointer transition-colors ${
                                isChallengeUnlocked
                                  ? 'text-text hover:text-func'
                                  : 'text-text-faint hover:text-text-dim'
                              }`}
                              aria-label={`Day ${module.day} Challenge: ${module.challenge.title} - ${
                                isChallengeCompleted ? 'Completed' : isChallengeUnlocked ? 'Unlocked' : 'Locked'
                              }`}
                              aria-disabled={!isChallengeUnlocked}
                            >
                              <div className="flex items-center gap-2.5">
                                <span
                                  className={`material-symbols-outlined text-[18px] ${
                                    isChallengeCompleted
                                      ? 'text-func'
                                      : isChallengeUnlocked
                                      ? 'text-string'
                                      : 'text-text-faint'
                                  }`}
                                >
                                  {isChallengeCompleted
                                    ? 'workspace_premium'
                                    : isChallengeUnlocked
                                    ? 'terminal'
                                    : 'lock'}
                                </span>
                                <span
                                  className={`font-mono text-xs ${
                                    isChallengeUnlocked ? 'font-semibold text-text' : 'text-text-dim'
                                  }`}
                                >
                                  Day {module.day} Challenge
                                </span>
                              </div>

                              <span className="font-mono text-[11px] text-text-faint">
                                {isChallengeCompleted
                                  ? `${module.challenge.tasks.length}/${module.challenge.tasks.length} done`
                                  : isChallengeUnlocked
                                  ? 'Ready to Start →'
                                  : `${completedConceptsCount}/${totalConcepts} concepts done`}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>
          );
        })}
      </div>
    </div>
  );
};
