import React, { useState, useEffect } from 'react';
import { ALL_MODULES, getModuleById } from '../../content/curriculum-index';
import { ROADMAP_MILESTONES } from '../../config/roadmap';
import {
  getModuleDisplayLabel,
  getNextModule,
} from '../../lib/curriculum/module-order';
import { ModuleData } from '../../types/curriculum';
import { UserLearningState } from '../../types/progress';
import {
  getModuleUnlockStatus,
  getModuleProgressCounts,
  isConceptCompleted,
  isModuleFullyComplete,
  getCompletedChallengeTaskIds,
} from '../../lib/progress/unlock-calculator';

interface LearningPathViewProps {
  userState: UserLearningState;
  currentModuleId: string;
  currentConceptId: string | null;
  onSelectModuleAndConcept: (moduleId: string, conceptId?: string, stage?: 'theory' | 'practice' | 'challenge') => void;
  onOpenSchema: () => void;
  scrollToModuleId?: string;
  onScrolledToModule?: () => void;
}

const RING_CIRCUMFERENCE = 402; // 2 * PI * 64

/**
 * LearningPathView — the homepage (`/`), rebuilt to the approved
 * "execution plan" design: monochrome grays, ONE gold accent that only ever
 * marks "you are here". Hero carries the overall % ring; the roadmap renders
 * as a flow diagram (stage nodes on a spine, each branching into one round
 * leaf per day); the active day's detail hangs off its stage as a callout.
 */
export const LearningPathView: React.FC<LearningPathViewProps> = ({
  userState,
  currentModuleId,
  currentConceptId,
  onSelectModuleAndConcept,
  scrollToModuleId,
  onScrolledToModule,
}) => {
  const [lockedAlert, setLockedAlert] = useState<{
    title: string;
    message: string;
  } | null>(null);

  const totalModules = ALL_MODULES.length;
  const completedCount = ALL_MODULES.filter((m) => isModuleFullyComplete(m, userState)).length;
  const overallPct = Math.round((completedCount / totalModules) * 100);

  const currentModule = getModuleById(currentModuleId) ?? ALL_MODULES[0];
  const currentMilestone =
    ROADMAP_MILESTONES.find((m) => m.id === currentModule.milestoneId) ?? ROADMAP_MILESTONES[0];
  const currentMilestoneIndex = ROADMAP_MILESTONES.findIndex(
    (m) => m.id === currentMilestone.id,
  );
  const nextModule = getNextModule(currentModule, ALL_MODULES);

  // Auto-scroll to a target day's leaf (returns from a lesson via ?highlight=).
  useEffect(() => {
    if (!scrollToModuleId) return;
    const t = setTimeout(() => {
      const el = document.getElementById(`leaf-${scrollToModuleId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        onScrolledToModule?.();
      }
    }, 60);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollToModuleId]);

  const handleContinue = () => {
    onSelectModuleAndConcept(currentModule.id, currentConceptId ?? undefined, 'theory');
  };

  const handleViewPlan = () => {
    document.getElementById('execution-path')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleLeaf = (mod: ModuleData) => {
    const status = getModuleUnlockStatus(mod, ALL_MODULES, userState);
    const unlocked = status.isUnlocked || status.isCompleted || Boolean(userState.completedModules[mod.id]);
    if (unlocked) {
      setLockedAlert(null);
      onSelectModuleAndConcept(mod.id, undefined, 'theory');
    } else {
      setLockedAlert({
        title: `${getModuleDisplayLabel(mod)} is locked`,
        message:
          status.reason ||
          `Finish ${getModuleDisplayLabel(currentModule)} — concepts and challenge — to unlock this day.`,
      });
    }
  };

  // Active-day callout data (the gold "you are here" detail card).
  const activeCounts = getModuleProgressCounts(currentModule, userState);
  const activeTaskPct = activeCounts.total > 0 ? Math.round((activeCounts.done / activeCounts.total) * 100) : 0;
  const activeChallengeDone = Boolean(userState.completedModules[currentModule.id]?.challengeCompleted);
  const activeChallengeDoneIds = currentModule.challenge
    ? getCompletedChallengeTaskIds(currentModule, userState)
    : [];
  const activeChallengePct =
    currentModule.challenge && currentModule.challenge.tasks.length > 0
      ? Math.round((activeChallengeDoneIds.length / currentModule.challenge.tasks.length) * 100)
      : 0;
  const calloutConcepts = currentModule.concepts.slice(0, 4);

  const ringOffset = RING_CIRCUMFERENCE * (1 - overallPct / 100);

  return (
    <div className="max-w-[960px] mx-auto px-[28px] max-[760px]:px-[18px]">
      {/* ============ HERO ============ */}
      <section className="pt-16 pb-14 grid grid-cols-1 md:grid-cols-[1.3fr_0.7fr] gap-10 items-center">
        <div>
          <div className="font-mono text-xs text-text-faint tracking-[0.06em] uppercase mb-5">
            SQLENS <span className="text-func">/</span> CURRICULUM ROADMAP
          </div>
          <h1 className="font-mono font-bold text-[32px] md:text-[42px] leading-[1.14] tracking-tight text-text">
            Go from <span className="text-func">SELECT *</span> to shipped.
          </h1>
          <p className="mt-4 text-[15.5px] text-text-dim max-w-[480px] leading-[1.65]">
            Hands-on SQL, one query at a time — because &quot;I sort of know JOINs&quot;
            isn&apos;t a personality trait.
          </p>
          <div className="mt-[30px] flex items-center gap-4 flex-wrap">
            <button
              onClick={handleContinue}
              className="font-semibold text-[14.5px] bg-func text-ink px-[22px] py-[13px] rounded-lg inline-flex items-center gap-2 hover:-translate-y-px transition-transform cursor-pointer"
            >
              Continue where you left off <span aria-hidden="true">→</span>
            </button>
            <button
              onClick={handleViewPlan}
              className="font-mono text-[13px] text-text-dim border border-border px-4 py-3 rounded-lg hover:text-text hover:border-text-dim transition-colors cursor-pointer"
            >
              View full plan
            </button>
          </div>
        </div>

        {/* % ring — the graphical centerpiece */}
        <div className="flex flex-col items-center bg-surface border border-border rounded-[18px] p-7 px-5 md:order-none order-first">
          <div className="relative w-[150px] h-[150px]">
            <svg viewBox="0 0 150 150" className="w-full h-full -rotate-90">
              <circle cx="75" cy="75" r="64" fill="none" stroke="#262626" strokeWidth="7" />
              <circle
                cx="75"
                cy="75"
                r="64"
                fill="none"
                stroke="#f4c430"
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray={RING_CIRCUMFERENCE}
                strokeDashoffset={ringOffset}
                style={{ filter: 'drop-shadow(0 0 6px rgba(244,196,48,0.33))' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="font-mono text-[30px] font-bold text-text">{overallPct}%</div>
              <div className="font-mono text-[10px] text-text-faint tracking-[0.05em] mt-0.5">COMPLETE</div>
            </div>
          </div>
          <p className="mt-4 text-xs text-text-dim text-center leading-relaxed">
            You&apos;re through <b className="text-text font-semibold">{currentMilestoneIndex + 1 === ROADMAP_MILESTONES.length && overallPct === 100 ? 'all stages' : `Stage ${currentMilestoneIndex + 1}`}</b> of {ROADMAP_MILESTONES.length}
            {nextModule && overallPct < 100 ? (
              <> — <b className="text-text font-semibold">{nextModule.shortTitle}</b> is next up.</>
            ) : (
              '.'
            )}
          </p>
        </div>
      </section>

      {/* locked-day notice (shown when a locked leaf is clicked) */}
      {lockedAlert && (
        <div
          role="alert"
          className="mb-8 flex items-start justify-between gap-3 bg-surface-2 border border-border rounded-xl px-4 py-3"
        >
          <div>
            <p className="font-mono text-xs font-semibold text-text">{lockedAlert.title}</p>
            <p className="text-xs text-text-dim mt-0.5 leading-relaxed">{lockedAlert.message}</p>
          </div>
          <button
            onClick={() => setLockedAlert(null)}
            aria-label="Dismiss"
            className="shrink-0 font-mono text-xs text-text-faint hover:text-text transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      <div className="h-px bg-border-soft mb-[52px]" />

      {/* ============ EXECUTION PATH ============ */}
      <section id="execution-path">
        <div className="font-mono text-[11.5px] text-text-faint tracking-[0.08em] uppercase mb-[18px]">
          Execution path
        </div>

        <div className="relative pb-5">
          {/* spine */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border -translate-x-[0.5px]" aria-hidden="true" />

          {ROADMAP_MILESTONES.map((milestone, mIdx) => {
            const stageModules = ALL_MODULES.filter((m) => milestone.moduleIds.includes(m.id));
            const doneInStage = stageModules.filter((m) => isModuleFullyComplete(m, userState)).length;
            const stagePct = Math.round((doneInStage / Math.max(stageModules.length, 1)) * 100);
            const isActiveStage = stageModules.some((m) => m.id === currentModuleId);
            const stageState = isActiveStage ? 'active' : stagePct === 100 ? 'done' : 'locked';
            const activeModuleInStage = stageModules.find((m) => m.id === currentModuleId);

            return (
              <div
                key={milestone.id}
                className={`relative ${mIdx < ROADMAP_MILESTONES.length - 1 ? 'mb-16' : ''}`}
              >
                {/* stage node */}
                <div
                  className={`relative z-[2] mx-auto mb-[22px] w-[210px] bg-surface border-[1.5px] border-border rounded-[14px] p-4 px-[18px] text-center ${
                    stageState === 'active'
                      ? 'border-func shadow-[0_0_0_5px_var(--accent-dim)]'
                      : stageState === 'locked'
                      ? 'opacity-50'
                      : ''
                  }`}
                >
                  <div
                    className={`font-mono text-[10px] tracking-[0.08em] mb-1.5 ${
                      stageState === 'active' ? 'text-func' : 'text-text-faint'
                    }`}
                  >
                    STAGE {milestone.number} · {stageState === 'active' ? 'ACTIVE' : stageState === 'done' ? 'COMPLETE' : 'LOCKED'}
                  </div>
                  <div className="font-mono font-semibold text-[15px] text-text leading-snug">
                    {milestone.subtitle}
                  </div>
                  <div className="text-[11.5px] text-text-dim mt-[5px]">{milestone.daysRange}</div>
                  <div
                    className={`font-mono text-[11px] mt-[9px] pt-[9px] border-t border-border-soft ${
                      stageState === 'active' ? 'text-text' : 'text-text-faint'
                    }`}
                  >
                    {stagePct}% complete
                  </div>
                </div>

                <div className="w-px h-[26px] bg-border mx-auto" aria-hidden="true" />

                {/* leaves — one round node per day */}
                <div className="flex justify-center gap-3.5 flex-wrap max-w-[640px] mx-auto">
                  {stageModules.map((mod) => {
                    const status = getModuleUnlockStatus(mod, ALL_MODULES, userState);
                    const isDone = isModuleFullyComplete(mod, userState);
                    const isUnlocked = isDone || status.isUnlocked;
                    const isCurrent = mod.id === currentModuleId && !isDone;
                    const dayNum = getModuleDisplayLabel(mod).replace(/^Day\s*/, '');

                    return (
                      <button
                        key={mod.id}
                        id={`leaf-${mod.id}`}
                        onClick={() => handleLeaf(mod)}
                        disabled={!isUnlocked}
                        title={`${getModuleDisplayLabel(mod)} — ${mod.shortTitle}${isDone ? ' (complete)' : isCurrent ? ' (you are here)' : isUnlocked ? '' : ' (locked)'}`}
                        aria-label={`${getModuleDisplayLabel(mod)}: ${mod.shortTitle}`}
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-mono text-[11px] shrink-0 transition-all duration-150 ${
                          isDone
                            ? 'bg-done border-[1.5px] border-done text-ink font-bold hover:-translate-y-0.5 hover:shadow-[0_0_0_4px_rgba(216,216,211,0.15)] cursor-pointer'
                            : isCurrent
                            ? 'bg-func border-[1.5px] border-func text-ink font-bold shadow-[0_0_0_6px_var(--accent-dim)] hover:-translate-y-0.5 cursor-pointer'
                            : isUnlocked
                            ? 'bg-surface border-[1.5px] border-border text-text-dim hover:-translate-y-0.5 cursor-pointer'
                            : 'bg-surface border-[1.5px] border-border text-text-faint cursor-not-allowed'
                        }`}
                      >
                        {isDone ? '✓' : dayNum}
                      </button>
                    );
                  })}
                </div>

                {/* callout — hangs off the active stage, shows the current day */}
                {isActiveStage && activeModuleInStage && (
                  <div className="max-w-[480px] mx-auto mt-[26px] bg-surface-2 border border-[rgba(244,196,48,0.33)] rounded-xl p-[18px] px-5 relative">
                    <div
                      className="absolute -top-[9px] left-1/2 -translate-x-1/2 rotate-45 w-4 h-4 bg-surface-2 border-l border-t border-[rgba(244,196,48,0.33)]"
                      aria-hidden="true"
                    />
                    <div className="flex items-center justify-between mb-3 gap-2">
                      <div className="font-mono text-[13.5px] font-semibold text-text truncate">
                        {getModuleDisplayLabel(currentModule)} — {currentModule.shortTitle}
                      </div>
                      <div className="font-mono text-[11px] text-func shrink-0">{activeTaskPct}% done</div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {calloutConcepts.map((concept, cIdx) => {
                        const conceptDone = isConceptCompleted(concept, currentModule.id, userState);
                        return (
                          <button
                            key={concept.id}
                            onClick={() =>
                              onSelectModuleAndConcept(currentModule.id, concept.id, conceptDone ? 'practice' : 'theory')
                            }
                            className="flex items-center gap-2 text-xs text-text-dim px-2.5 py-2 bg-surface border border-border-soft rounded-[7px] text-left hover:bg-surface-2 hover:-translate-y-px transition-all cursor-pointer"
                          >
                            <span
                              className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] shrink-0 font-bold ${
                                conceptDone
                                  ? 'bg-done text-ink'
                                  : cIdx === calloutConcepts.findIndex((c) => !isConceptCompleted(c, currentModule.id, userState))
                                  ? 'bg-func text-ink'
                                  : 'bg-surface-2 text-text-faint border border-border'
                              }`}
                            >
                              {conceptDone ? '✓' : cIdx + 1}
                            </span>
                            <span className={conceptDone ? 'text-text' : 'text-text-dim'}>
                              {concept.shortDescription || concept.title}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {currentModule.challenge && (
                      <button
                        onClick={() => onSelectModuleAndConcept(currentModule.id, undefined, 'challenge')}
                        className="mt-2.5 pt-2.5 border-t border-dashed border-border w-full flex items-center justify-between font-mono text-[11.5px] text-func hover:brightness-110 transition cursor-pointer"
                      >
                        <span>🏆 Stage challenge</span>
                        <span>
                          {activeChallengeDone
                            ? 'Complete'
                            : `${activeChallengePct}% done`}
                        </span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <footer className="mt-[74px] mb-11 text-center font-mono text-[11px] text-text-faint">
        SQLens — {overallPct}% through the path.
      </footer>
    </div>
  );
};
