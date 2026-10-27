import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/Icon';
import { useTrackCurriculum } from '@/components/learn/use-track';
import { getModuleDisplayLabel, getNextModule } from '../../lib/curriculum/module-order';
import { ModuleData, MilestoneData } from '../../types/curriculum';
import { UserLearningState } from '../../types/progress';

export interface CircleTooltipInfo {
  visible: boolean;
  moduleId: string;
  moduleNumber: string;
  title: string;
  stageName: string;
  description: string;
  status: 'completed' | 'current' | 'unlocked' | 'locked';
  conceptsCount: number;
  tasksCount: number;
  x: number;
  y: number;
}
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
  onResetClick?: () => void;
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
  onResetClick,
}) => {
  // Phase 2: aliased to the original names so the whole view below is
  // unchanged while resolving against the ACTIVE track.
  const { modules: ALL_MODULES, milestones: ROADMAP_MILESTONES, getModuleById, track, meta } =
    useTrackCurriculum();
  const isPrisma = track === 'prisma';
  const [pulseId, setPulseId] = useState<string | null>(null);
  const [lockedAlert, setLockedAlert] = useState<{
    title: string;
    message: string;
  } | null>(null);

  const [circleTooltip, setCircleTooltip] = useState<CircleTooltipInfo>({
    visible: false,
    moduleId: '',
    moduleNumber: '1',
    title: '',
    stageName: '',
    description: '',
    status: 'unlocked',
    conceptsCount: 0,
    tasksCount: 0,
    x: 0,
    y: 0,
  });

  const hideCircleTooltipTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleCircleMouseEnter = (
    e: React.MouseEvent<HTMLElement>,
    mod: ModuleData,
    milestone: MilestoneData,
    status: { isUnlocked: boolean },
    isDone: boolean,
    isCurrent: boolean,
  ) => {
    if (hideCircleTooltipTimeoutRef.current) {
      clearTimeout(hideCircleTooltipTimeoutRef.current);
      hideCircleTooltipTimeoutRef.current = null;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const moduleNum =
      getModuleDisplayLabel(mod).replace(/^(?:Day|Module)\s*/i, '').trim() ||
      String(mod.curriculumOrder ?? mod.day);

    const taskCount =
      mod.concepts.reduce((acc, c) => acc + (c.tasks?.length ?? 0), 0) +
      (mod.challenge ? 1 : 0);

    const teaser =
      mod.description ||
      mod.concepts.map((c) => c.title).slice(0, 3).join(' · ');

    const nodeStatus: 'completed' | 'current' | 'unlocked' | 'locked' = isDone
      ? 'completed'
      : isCurrent
      ? 'current'
      : isDone || status.isUnlocked
      ? 'unlocked'
      : 'locked';

    // Center horizontally above anchor and clamp inside viewport
    const targetX = rect.left + rect.width / 2;
    const clampedX = Math.max(160, Math.min(typeof window !== 'undefined' ? window.innerWidth - 160 : 600, targetX));
    const targetY = rect.top - 12;

    setCircleTooltip({
      visible: true,
      moduleId: mod.id,
      moduleNumber: moduleNum,
      title: mod.shortTitle || mod.title,
      stageName: `STAGE ${milestone.number} · ${milestone.subtitle}`,
      description: teaser,
      status: nodeStatus,
      conceptsCount: mod.concepts.length,
      tasksCount: taskCount,
      x: clampedX,
      y: targetY,
    });
  };

  const handleCircleMouseLeave = () => {
    hideCircleTooltipTimeoutRef.current = setTimeout(() => {
      setCircleTooltip((prev) => ({ ...prev, visible: false }));
    }, 120);
  };

  const handleCircleTooltipMouseEnter = () => {
    if (hideCircleTooltipTimeoutRef.current) {
      clearTimeout(hideCircleTooltipTimeoutRef.current);
      hideCircleTooltipTimeoutRef.current = null;
    }
  };

  const handleCircleTooltipMouseLeave = () => {
    hideCircleTooltipTimeoutRef.current = setTimeout(() => {
      setCircleTooltip((prev) => ({ ...prev, visible: false }));
    }, 100);
  };

  useEffect(() => {
    return () => {
      if (hideCircleTooltipTimeoutRef.current) {
        clearTimeout(hideCircleTooltipTimeoutRef.current);
      }
    };
  }, []);

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

  // Helper to resolve element by ID, hash, or normalized day number
  const resolveTargetElement = (idOrHash: string): HTMLElement | null => {
    if (typeof document === 'undefined') return null;
    const raw = idOrHash.replace(/^#/, '');
    if (!raw) return null;

    const direct =
      document.getElementById(raw) ||
      document.getElementById(`leaf-${raw}`) ||
      document.getElementById(`stage-card-${raw}`) ||
      document.getElementById(`day-${raw}`);
    if (direct) return direct;

    const match = raw.match(/(\d+)/);
    if (match) {
      const num = parseInt(match[1], 10);
      const padded = String(num).padStart(2, '0');
      const candidates = [
        `day-${num}`,
        `day-${padded}`,
        `leaf-day-${padded}`,
        `leaf-prisma-${padded}`,
        `stage-card-day-${padded}`,
        `stage-card-prisma-${padded}`,
        `day-${padded}`,
        `prisma-${padded}`,
      ];
      for (const candidate of candidates) {
        const found = document.getElementById(candidate);
        if (found) return found;
      }
    }
    return null;
  };

  // Auto-scroll to a target day's leaf (returns from a lesson via ?highlight=).
  useEffect(() => {
    if (!scrollToModuleId) return;
    let cleanupTimer: ReturnType<typeof setTimeout>;
    const rafId = requestAnimationFrame(() => {
      const el = resolveTargetElement(scrollToModuleId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
        setPulseId(scrollToModuleId);
        setTimeout(() => setPulseId(null), 1800);
        // Clean up the ?highlight= query param silently after the smooth scroll completes
        cleanupTimer = setTimeout(() => {
          onScrolledToModule?.();
        }, 600);
      }
    });
    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(cleanupTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollToModuleId]);

  // Smoothly center target day from URL hash on mount or hashchange (e.g., #day-4 or #prisma-02)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const scrollToHash = () => {
      const hash = window.location.hash;
      if (!hash) return;
      const el = resolveTargetElement(hash);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
        const modIdMatch = el.id.match(/(?:leaf-|stage-card-)?(day-\d{2}|prisma-\d{2})/);
        const pulseTarget = modIdMatch ? modIdMatch[1] : el.id;
        setPulseId(pulseTarget);
        setTimeout(() => setPulseId(null), 1800);
      }
    };

    const timer = setTimeout(scrollToHash, 200);
    window.addEventListener('hashchange', scrollToHash);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('hashchange', scrollToHash);
    };
  }, []);

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
            {track === 'prisma' ? 'PRISMA' : 'SQL'} <span className="text-func">/</span> CURRICULUM ROADMAP
          </div>
          <h1 className="font-sans font-bold text-[34px] md:text-[44px] leading-[1.12] tracking-tight text-text text-balance">
            {track === 'prisma' ? (
              <>Go from <code className="font-mono text-func font-semibold">prisma.findMany()</code> to production.</>
            ) : (
              <>Go from <code className="font-mono text-func font-semibold">SELECT *</code> to shipped.</>
            )}
          </h1>
          <p className="mt-4 text-[15.5px] text-text-dim max-w-[480px] leading-[1.65]">
            {track === 'prisma'
              ? "Type-safe queries, one schema at a time — because guessing your DB shape isn't a strategy."
              : <>&quot;I sort of know JOINs&quot; isn&apos;t a personality trait — hands-on SQL, one query at a time.</>}
          </p>
          <div className="mt-[30px] flex items-center gap-4 flex-wrap">
            <button
              onClick={handleContinue}
              className="font-semibold text-[14.5px] px-[22px] py-[13px] rounded-lg inline-flex items-center gap-2 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer bg-func text-ink hover:brightness-110 hover:shadow-lg hover:shadow-func/25"
            >
              {completedCount === 0
                ? isPrisma
                  ? 'Start Day 1: Schema Modeling'
                  : 'Start Day 1: Find a Table'
                : 'Continue where you left off'}{' '}
              <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1">→</span>
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
              <circle cx="75" cy="75" r="64" fill="none" stroke="var(--border)" strokeWidth="7" />
              <circle
                cx="75"
                cy="75"
                r="64"
                fill="none"
                stroke="var(--func)"
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray={RING_CIRCUMFERENCE}
                strokeDashoffset={ringOffset}
                style={{
                  filter: 'drop-shadow(0 0 8px var(--accent-line))',
                }}
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
          {track === 'prisma' ? 'Learning path' : 'Execution path'}
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
                className={`relative ${mIdx < ROADMAP_MILESTONES.length - 1 ? 'mb-16' : ''} ${mIdx > 0 ? 'roadmap-milestone-stage' : ''}`}
              >
                {/* stage node */}
                <div
                  className={`relative z-[2] mx-auto mb-[22px] w-[210px] bg-surface border-[1.5px] rounded-[14px] p-4 px-[18px] text-center transition-all duration-300 ease-out hover:-translate-y-0.5 ${
                    stageState === 'active'
                      ? 'border-func shadow-[0_0_0_5px_var(--accent-dim)] hover:shadow-[0_0_24px_var(--accent-line)]'
                      : stageState === 'locked'
                      ? 'border-border opacity-50'
                      : 'border-border hover:border-border-strong hover:shadow-lg hover:shadow-black/20'
                  }`}
                >
                  <div
                    className={`font-mono text-[10px] tracking-[0.08em] mb-1.5 ${
                      stageState === 'active'
                        ? 'text-func'
                        : 'text-text-faint'
                    }`}
                  >
                    STAGE {milestone.number} · {stageState === 'active' ? 'ACTIVE' : stageState === 'done' ? 'COMPLETE' : 'LOCKED'}
                  </div>
                  <div className="font-sans font-semibold text-[15.5px] text-text leading-snug tracking-tight">
                    {milestone.subtitle}
                  </div>
                  <div className="text-[11.5px] text-text-dim mt-[5px]">{milestone.daysRange}</div>
                  <div
                    className={`font-mono text-[11px] mt-[9px] pt-[9px] border-t border-border-soft ${
                      stageState === 'active'
                        ? 'text-text'
                        : 'text-text-faint'
                    }`}
                  >
                    {stagePct}% complete
                  </div>
                </div>

                <div className="w-px h-[26px] bg-border mx-auto" aria-hidden="true" />

                {/* leaves — one round node per day/module */}
                <div className="flex justify-center gap-3.5 flex-wrap max-w-[640px] mx-auto">
                  {stageModules.map((mod) => {
                    const status = getModuleUnlockStatus(mod, ALL_MODULES, userState);
                    const isDone = isModuleFullyComplete(mod, userState);
                    const isUnlocked = isDone || status.isUnlocked;
                    const isCurrent = mod.id === currentModuleId && !isDone;
                    const moduleNum =
                      getModuleDisplayLabel(mod).replace(/^(?:Day|Module)\s*/i, '').trim() ||
                      String(mod.curriculumOrder ?? mod.day);

                    const isThisPulsing =
                      pulseId === mod.id ||
                      pulseId === `stage-card-${mod.id}` ||
                      pulseId === `day-${mod.day}` ||
                      pulseId === `leaf-${mod.id}`;

                    return (
                      <div
                        key={mod.id}
                        id={`day-${mod.day}`}
                        className="scroll-mt-48"
                      >
                        <div
                          id={`stage-card-${mod.id}`}
                          className={`rounded-full p-1 transition-shadow duration-700 ${
                            isThisPulsing ? 'stage-pulse' : ''
                          }`}
                        >
                          <button
                            id={`leaf-${mod.id}`}
                            onClick={() => {
                              setCircleTooltip((prev) => ({ ...prev, visible: false }));
                              handleLeaf(mod);
                            }}
                            onMouseEnter={(e) =>
                              handleCircleMouseEnter(e, mod, milestone, status, isDone, isCurrent)
                            }
                            onMouseLeave={handleCircleMouseLeave}
                            disabled={!isUnlocked}
                            title={`${getModuleDisplayLabel(mod)} — ${mod.shortTitle}${isDone ? ' (complete)' : isCurrent ? ' (you are here)' : isUnlocked ? '' : ' (locked)'}`}
                            aria-label={`${getModuleDisplayLabel(mod)}: ${mod.shortTitle}`}
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-mono text-[11px] shrink-0 transition-all duration-200 ease-out outline-none focus-visible:ring-2 focus-visible:ring-func target:ring-4 target:ring-(--accent-line) target:border-func target:scale-110 ${
                              isDone
                                ? 'bg-surface-2 border-[1.5px] border-func/40 text-func font-bold hover:bg-func/10 hover:border-func hover:scale-110 hover:shadow-[0_0_18px_var(--accent-dim)] active:scale-95 cursor-pointer shadow-[0_0_12px_var(--pulse-mid)]'
                                : isCurrent
                                ? 'bg-func border-[1.5px] border-func text-ink font-bold shadow-[0_0_20px_var(--pulse-strong)] hover:scale-110 active:scale-95 ring-4 ring-func/20 cursor-pointer'
                                : isUnlocked
                                ? 'bg-surface border-[1.5px] border-border text-text-dim hover:text-text hover:border-func/50 hover:bg-func/5 hover:scale-110 hover:shadow-[0_0_14px_var(--pulse-mid)] active:scale-95 cursor-pointer'
                                : 'bg-surface border-[1.5px] border-border-soft text-text-faint opacity-50 cursor-not-allowed'
                            }`}
                          >
                            {isDone ? '✓' : moduleNum}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* callout — hangs off the active stage, shows the current module */}
                {isActiveStage && activeModuleInStage && (
                  <div
                    className="max-w-[680px] mx-auto mt-[26px] bg-surface-2 border border-func/35 shadow-[0_0_28px_var(--accent-dim)] rounded-xl p-[18px] px-5 relative transition-shadow duration-300"
                  >
                    <div
                      className="absolute -top-[9px] left-1/2 -translate-x-1/2 rotate-45 w-4 h-4 bg-surface-2 border-l border-t border-func/35"
                      aria-hidden="true"
                    />
                    <div className="flex items-center justify-between mb-3 gap-2">
                      <div className="font-sans text-[14px] font-bold text-text truncate">
                        {getModuleDisplayLabel(currentModule)} — {currentModule.shortTitle}
                      </div>
                      <div className="font-mono text-[11px] font-semibold text-func shrink-0">
                        {activeTaskPct}% done
                      </div>
                    </div>

                    {(() => {
                      const firstIncompleteConceptIdx = currentModule.concepts.findIndex(
                        (c) => !isConceptCompleted(c, currentModule.id, userState),
                      );
                      const activeChallengeUnlocked = firstIncompleteConceptIdx === -1;

                      return (
                        <>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {calloutConcepts.map((concept, cIdx) => {
                              const conceptDone = isConceptCompleted(concept, currentModule.id, userState);
                              const isConceptCurrent = !conceptDone && cIdx === firstIncompleteConceptIdx;
                              const isConceptLocked =
                                !conceptDone && firstIncompleteConceptIdx !== -1 && cIdx > firstIncompleteConceptIdx;

                              return (
                                <button
                                  key={concept.id}
                                  onClick={() => {
                                    if (isConceptLocked) {
                                      const requiredConcept =
                                        firstIncompleteConceptIdx >= 0
                                          ? currentModule.concepts[firstIncompleteConceptIdx]
                                          : null;
                                      setLockedAlert({
                                        title: `${concept.title} is locked`,
                                        message: `Complete ${
                                          requiredConcept ? `"${requiredConcept.title}"` : 'earlier concept lessons'
                                        } in ${getModuleDisplayLabel(currentModule)} first to unlock this lesson.`,
                                      });
                                      return;
                                    }
                                    onSelectModuleAndConcept(
                                      currentModule.id,
                                      concept.id,
                                      'theory',
                                    );
                                  }}
                                  title={
                                    isConceptLocked
                                      ? `${concept.title} (locked — complete earlier concepts first)`
                                      : concept.title
                                  }
                                  className={`group flex items-center gap-2.5 text-xs px-3 py-2.5 rounded-[8px] text-left transition-all duration-200 ease-out ${
                                    isConceptLocked
                                      ? 'bg-surface/50 border border-border-soft/60 text-text-faint opacity-60 cursor-not-allowed'
                                      : 'bg-surface border border-border-soft text-text-dim hover:bg-func/[0.05] hover:border-func/40 hover:text-text hover:-translate-y-0.5 hover:shadow-md hover:shadow-func/10 cursor-pointer'
                                  }`}
                                >
                                  <span
                                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] shrink-0 font-bold transition-transform duration-200 group-hover:scale-110 ${
                                      conceptDone
                                        ? 'bg-func/20 text-func border border-func/40'
                                        : isConceptCurrent
                                        ? 'bg-func text-ink shadow-[0_0_8px_var(--pulse-strong)]'
                                        : 'bg-surface-2 text-text-faint border border-border'
                                    }`}
                                  >
                                    {conceptDone ? (
                                      '✓'
                                    ) : isConceptLocked ? (
                                      <Icon name="lock" className="text-[9px]" />
                                    ) : (
                                      cIdx + 1
                                    )}
                                  </span>
                                  <span
                                    className={`truncate flex-1 font-medium transition-colors ${
                                      conceptDone ? 'text-text' : isConceptLocked ? 'text-text-faint' : 'text-text group-hover:text-white'
                                    }`}
                                  >
                                    {concept.title}
                                  </span>
                                  {!isConceptLocked && (
                                    <span
                                      className="text-[11px] opacity-0 -translate-x-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0 text-func"
                                      aria-hidden="true"
                                    >
                                      →
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>

                          {currentModule.challenge && (
                            <button
                              onClick={() => {
                                if (!activeChallengeUnlocked && !activeChallengeDone) {
                                  const requiredConcept =
                                    firstIncompleteConceptIdx >= 0
                                      ? currentModule.concepts[firstIncompleteConceptIdx]
                                      : null;
                                  setLockedAlert({
                                    title: 'Stage challenge is locked',
                                    message: `Complete all concept lessons in ${getModuleDisplayLabel(
                                      currentModule,
                                    )} first to unlock the challenge.`,
                                  });
                                  return;
                                }
                                onSelectModuleAndConcept(currentModule.id, undefined, 'challenge');
                              }}
                              className={`mt-2.5 pt-2.5 border-t border-dashed border-border w-full flex items-center justify-between font-mono text-[11.5px] transition-all duration-200 group ${
                                activeChallengeUnlocked || activeChallengeDone
                                  ? 'text-func hover:brightness-125 cursor-pointer'
                                  : 'text-text-faint opacity-60 cursor-not-allowed'
                              }`}
                            >
                              <span className="flex items-center gap-1.5 transition-transform duration-200 group-hover:translate-x-0.5">
                                <span>🏆 Stage challenge</span>
                                {!activeChallengeUnlocked && !activeChallengeDone && (
                                  <Icon name="lock" className="text-[12px]" />
                                )}
                              </span>
                              <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                                {activeChallengeDone
                                  ? 'Complete ✓'
                                  : activeChallengeUnlocked
                                  ? `${activeChallengePct}% done →`
                                  : 'Locked'}
                              </span>
                            </button>
                          )}
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <footer className="mt-[74px] mb-11 flex flex-col items-center justify-center gap-5 text-center">
        <div className="font-mono text-[11px] text-text-faint">
          {track === 'prisma' ? 'Prisma' : 'SQL'} — {overallPct}% through the path.
        </div>
        
        {onResetClick && (
          <button
            onClick={onResetClick}
            className="text-xs font-mono text-text-dim hover:text-error border border-border-soft hover:border-error/30 bg-surface px-4 py-2 rounded-lg transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <Icon name="restart_alt" className="text-[14px]" />
            Reset {track === 'prisma' ? 'Prisma' : 'SQL'} Progress
          </button>
        )}
      </footer>

      {/* ============================================================
          SMOOTH FLOATING CIRCLE POPOVER CARD
          Animated with CSS opacity & scale without abrupt unmounting
          ============================================================ */}
      <div
        data-testid="circle-tooltip"
        onMouseEnter={handleCircleTooltipMouseEnter}
        onMouseLeave={handleCircleTooltipMouseLeave}
        style={{
          left: `${circleTooltip.x}px`,
          top: `${circleTooltip.y}px`,
          transform: 'translate(-50%, -100%)',
        }}
        className={`fixed z-50 transition-all duration-200 ease-out max-w-[280px] w-full ${
          circleTooltip.visible
            ? 'opacity-100 scale-100 pointer-events-auto'
            : 'opacity-0 scale-95 pointer-events-none'
        }`}
        role="tooltip"
        aria-hidden={!circleTooltip.visible}
      >
        <div className="relative bg-surface-3/95 backdrop-blur-xl border border-border rounded-xl p-3.5 text-text shadow-[0_20px_40px_rgba(0,0,0,0.65),0_0_24px_var(--accent-dim)]">
          {/* Header Row */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[11px] font-mono font-medium text-text-dim truncate">
              Day {circleTooltip.moduleNumber} · {circleTooltip.stageName.split('·')[0].trim()}
            </span>

            {circleTooltip.status === 'completed' ? (
              <span className="inline-flex items-center gap-1 text-[10.5px] font-mono px-2 py-0.5 rounded-full bg-func/15 text-func border border-func/30 font-semibold shrink-0">
                <span>✓ Complete</span>
              </span>
            ) : circleTooltip.status === 'current' ? (
              <span className="inline-flex items-center gap-1 text-[10.5px] font-mono px-2 py-0.5 rounded-full bg-func text-ink font-bold shrink-0 shadow-[0_0_8px_var(--pulse-strong)]">
                <span className="w-1.5 h-1.5 rounded-full bg-ink animate-pulse" />
                Active
              </span>
            ) : circleTooltip.status === 'unlocked' ? (
              <span className="inline-flex items-center gap-1 text-[10.5px] font-mono px-2 py-0.5 rounded-full bg-surface-2 text-text-dim border border-border shrink-0">
                Unlocked
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10.5px] font-mono px-2 py-0.5 rounded-full bg-surface-2 text-text-faint border border-border-soft shrink-0">
                <Icon name="lock" className="text-[10px]" /> Locked
              </span>
            )}
          </div>

          {/* Title */}
          <h4 className="text-[14px] font-semibold text-text leading-tight mb-1.5">
            {circleTooltip.title}
          </h4>

          {/* Description */}
          <p className="text-[12px] text-text-dim leading-relaxed mb-3 line-clamp-2">
            {circleTooltip.description}
          </p>

          {/* Action CTA inside popover */}
          {circleTooltip.status !== 'locked' ? (
            <button
              onClick={() => {
                const targetMod = getModuleById(circleTooltip.moduleId);
                if (targetMod) {
                  setCircleTooltip((prev) => ({ ...prev, visible: false }));
                  handleLeaf(targetMod);
                }
              }}
              className={`inline-flex w-full items-center justify-center gap-1.5 font-semibold text-[12.5px] py-1.5 px-3 rounded-lg transition-all cursor-pointer ${
                circleTooltip.status === 'current'
                  ? 'bg-func text-ink hover:brightness-110 shadow-[0_0_12px_var(--pulse-strong)]'
                  : circleTooltip.status === 'completed'
                  ? 'bg-surface-2 border border-func/40 text-func hover:bg-func/10 hover:border-func'
                  : 'bg-func text-ink hover:brightness-110 shadow-[0_0_12px_var(--accent-dim)]'
              }`}
            >
              <span>
                {circleTooltip.status === 'completed'
                  ? `Review Day ${circleTooltip.moduleNumber}`
                  : circleTooltip.status === 'current'
                  ? `Continue Day ${circleTooltip.moduleNumber}`
                  : `Start Day ${circleTooltip.moduleNumber}`}
              </span>
              <span aria-hidden="true">→</span>
            </button>
          ) : (
            <div className="text-[11px] font-mono text-text-faint text-center py-0.5">
              Complete previous days to unlock
            </div>
          )}

          {/* Downward triangle arrow indicator */}
          <div
            className="absolute left-1/2 -bottom-[6px] -translate-x-1/2 w-3 h-3 bg-surface-3 border-b border-r border-border rotate-45 pointer-events-none"
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  );
};
