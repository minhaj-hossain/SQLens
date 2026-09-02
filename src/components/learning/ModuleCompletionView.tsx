'use client';
/**
 * ModuleCompletionView — P11.4 rebuild on the current design system.
 *
 * Gold check-ring hero, milestone progress (mono labels + hairline bar),
 * next-up card driven by getModuleUnlockStatus (immediate unlock under the
 * default PACING_MODE=false; countdown only when pacing/schedule gates),
 * step-chain Back (useStepBack), and `Next Module` + step-chain Back that lands on the
 * module card via /?highlight= instead of opening the modal.
 */
import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/Icon';
import { ModuleData } from '../../types/curriculum';
import { UserLearningState } from '../../types/progress';
import { ALL_MODULES } from '../../content/curriculum-index';
import { ROADMAP_MILESTONES } from '../../config/roadmap';
import { getModuleDisplayLabel } from '../../lib/curriculum/module-order';
import {
  getModuleUnlockStatus,
  formatTimeRemaining,
  getEffectiveNow,
  isModuleFullyComplete,
} from '../../lib/progress/unlock-calculator';
import { learnUrl } from '../../lib/learn-routes';
import { useStepBack } from '../learn/use-step-back';

interface ModuleCompletionViewProps {
  module: ModuleData;
  nextModule?: ModuleData;
  userState: UserLearningState;
  onReviewModule: () => void;
  onContinueNextDay?: () => void;
}

export const ModuleCompletionView: React.FC<ModuleCompletionViewProps> = ({
  module,
  nextModule,
  userState,
  onReviewModule,
  onContinueNextDay,
}) => {
  const router = useRouter();
  const { backStep, goBack } = useStepBack(module.id);

  const currentMilestone =
    ROADMAP_MILESTONES.find((m) => m.id === module.milestoneId) || ROADMAP_MILESTONES[0];
  const milestoneModules = ALL_MODULES.filter((m) => currentMilestone.moduleIds.includes(m.id));
  const completedInMilestone = milestoneModules.filter((m) =>
    isModuleFullyComplete(m, userState),
  ).length;
  const milestonePercent = Math.round((completedInMilestone / milestoneModules.length) * 100);

  const nextStatus = nextModule
    ? getModuleUnlockStatus(nextModule, ALL_MODULES, userState)
    : null;
  const nextLocked = Boolean(nextStatus && !nextStatus.isUnlocked);

  // Countdown tick — only meaningful while the next module is gated
  // (PACING_MODE on or a scheduledPublishDate). No timer when unlocked.
  const [, forceTick] = useState(0);
  useEffect(() => {
    if (!nextLocked) return;
    const t = setInterval(() => forceTick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, [nextLocked]);

  const moduleLabel = getModuleDisplayLabel(module);
  const countdown = nextStatus?.countdownFormatted ||
    (nextStatus?.unlockTime
      ? formatTimeRemaining(
          nextStatus.unlockTime,
          getEffectiveNow(userState.simulatedTimeOffsetHours),
        )
      : null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className='mx-auto max-w-2xl py-4'
    >
      {/* Hero — gold check ring */}
      <div className='flex flex-col items-center text-center'>
        <div className='flex h-16 w-16 items-center justify-center rounded-full border border-accent/60 bg-accent/10 text-accent shadow-[0_0_18px_var(--accent-dim)]'>
          <Icon name='check' className='text-[30px]' />
        </div>
        <div className='mt-5 font-mono text-[11px] uppercase tracking-[0.08em] text-text-faint'>
          {moduleLabel} · Complete
        </div>
        <h1 className='mt-2 font-display text-[26px] font-bold tracking-tight text-text'>
          {module.title}
        </h1>
        <p className='mt-2 text-sm text-text-dim'>
          Every concept finished and the challenge shipped. Nice work.
        </p>
      </div>

      {/* Milestone progress */}
      <div className='mt-8 rounded-xl border border-border bg-surface p-5'>
        <div className='flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.06em]'>
          <span className='text-text-faint'>{currentMilestone.title}</span>
          <span className='text-text-dim'>{milestonePercent}%</span>
        </div>
        <div className='mt-3 h-1.5 overflow-hidden rounded-full bg-surface-2'>
          <div
            className='h-full rounded-full bg-accent transition-all duration-500'
            style={{ width: `${milestonePercent}%` }}
          />
        </div>
        <div className='mt-2.5 font-mono text-[10.5px] text-text-faint'>
          {completedInMilestone} of {milestoneModules.length} days in this stage
        </div>
      </div>

      {/* Next up */}
      <div className='mt-5 rounded-xl border border-border bg-surface p-5'>
        {nextModule && nextStatus ? (
          <>
            <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
              <div className='text-left'>
                <div className='font-mono text-[10.5px] uppercase tracking-[0.06em] text-text-faint'>
                  Next up
                </div>
                <div className='mt-1 text-[15px] font-semibold text-text'>
                  {getModuleDisplayLabel(nextModule)}: {nextModule.title}
                </div>
              </div>
              {nextStatus.isUnlocked ? (
                <span className='inline-flex shrink-0 items-center gap-1.5 font-mono text-[11px] text-text-dim'>
                  <Icon name='lock_open' className='text-[14px]' />
                  Unlocked
                </span>
              ) : (
                <span className='inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border bg-surface-2 px-2.5 py-1.5 font-mono text-[11px] text-text-dim'>
                  <Icon name='schedule' className='text-[13px]' />
                  Unlocks in {countdown}
                </span>
              )}
            </div>
            {nextStatus.isUnlocked && onContinueNextDay && (
              <button
                onClick={onContinueNextDay}
                className='mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-[13px] font-semibold text-ink transition hover:brightness-105 active:scale-[0.99] sm:w-auto'
              >
                Start {getModuleDisplayLabel(nextModule)}
                <Icon name='arrow_forward' className='text-[15px]' />
              </button>
            )}
          </>
        ) : (
          <div className='py-1 text-center'>
            <div className='text-[15px] font-semibold text-accent'>Curriculum completed</div>
            <p className='mx-auto mt-1.5 max-w-md text-[13px] text-text-dim'>
              You&apos;ve finished all {ALL_MODULES.length} days of the SQLens curriculum.
            </p>
          </div>
        )}
      </div>

      {/* Secondary nav — step-chain Back + Review + Next Module */}
      <div className='mt-5 flex flex-wrap items-center justify-center gap-3'>
        {backStep && (
          <button
            onClick={() => goBack(backStep.url)}
            title={backStep.label}
            className='inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-4 py-2 font-mono text-xs text-text-dim transition hover:bg-surface-3 hover:text-text'
          >
            <Icon name='arrow_back' className='text-[14px]' />
            Back
          </button>
        )}
        <button
          onClick={onReviewModule}
          className='inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-4 py-2 font-mono text-xs text-text-dim transition hover:bg-surface-3 hover:text-text'
        >
          <Icon name='restart_alt' className='text-[14px]' />
          Review Day
        </button>
        {nextModule && (
          <button
            onClick={() => router.push(learnUrl(nextModule.id, 'theory', nextModule.concepts[0].id))}
            title={`Open ${getModuleDisplayLabel(nextModule)}`}
            className='inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-4 py-2 font-mono text-xs text-text-dim transition hover:bg-surface-3 hover:text-text'
          >
            <Icon name='arrow_forward' className='text-[14px]' />
            Next Module
          </button>
        )}
      </div>
    </motion.div>
  );
};
