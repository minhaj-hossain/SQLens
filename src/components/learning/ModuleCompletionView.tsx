import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import Icon from '@/components/ui/Icon';
import { ModuleData } from '../../types/curriculum';
import { UserLearningState } from '../../types/progress';
import { getNextUnlockTime, formatTimeRemaining, getEffectiveNow, isModuleFullyComplete } from '../../lib/progress/unlock-calculator';
import { ROADMAP_MILESTONES } from '../../config/roadmap';
import { ALL_MODULES } from '../../content/curriculum-index';

interface ModuleCompletionViewProps {
  module: ModuleData;
  nextModule?: ModuleData;
  userState: UserLearningState;
  onReviewModule: () => void;
  onOpenRoadmap: () => void;
  onContinueNextDay?: () => void;
}

export const ModuleCompletionView: React.FC<ModuleCompletionViewProps> = ({
  module,
  nextModule,
  userState,
  onReviewModule,
  onOpenRoadmap,
  onContinueNextDay,
}) => {
  const completedDate = userState.completedModules[module.id]?.completedAt || new Date().toISOString();
  const baseUnlockDate = getNextUnlockTime(completedDate);
  // If the next module has a scheduledPublishDate that is later than the standard
  // 6 PM gate, we show a countdown to that later date instead.
  const scheduledDate =
    nextModule?.scheduledPublishDate ? new Date(nextModule.scheduledPublishDate) : null;
  const nextUnlockDate =
    scheduledDate && !isNaN(scheduledDate.getTime()) && scheduledDate > baseUnlockDate
      ? scheduledDate
      : baseUnlockDate;

  const [countdown, setCountdown] = useState(() =>
    formatTimeRemaining(nextUnlockDate, userState.simulatedTimeOffsetHours)
  );
  const [isUnlockedNow, setIsUnlockedNow] = useState(
    userState.bypassDailyLock ||
      getEffectiveNow(userState.simulatedTimeOffsetHours).getTime() >=
        nextUnlockDate.getTime()
  );

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = formatTimeRemaining(nextUnlockDate, userState.simulatedTimeOffsetHours);
      setCountdown(remaining);
      const unlocked =
        userState.bypassDailyLock ||
        getEffectiveNow(userState.simulatedTimeOffsetHours).getTime() >=
          nextUnlockDate.getTime();
      setIsUnlockedNow(unlocked);
    }, 1000);

    return () => clearInterval(timer);
  }, [nextUnlockDate, userState.simulatedTimeOffsetHours, userState.bypassDailyLock]);

  const currentMilestone =
    ROADMAP_MILESTONES.find((m) => m.id === module.milestoneId) || ROADMAP_MILESTONES[0];
  const milestoneModules = ALL_MODULES.filter((m) => currentMilestone.moduleIds.includes(m.id));
  const completedInMilestone = milestoneModules.filter((m) => isModuleFullyComplete(m, userState)).length;
  const milestonePercent = Math.round((completedInMilestone / milestoneModules.length) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="mx-auto max-w-3xl space-y-6 text-center py-4"
    >
      {/* Completion Icon */}
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-container/20 text-primary border border-primary-container/40 shadow-[0_0_16px_rgba(0,173,181,0.3)]">
        <Icon name="check" className="text-[28px]" />
      </div>

      <div className="space-y-2">
        <div className="font-label-sm text-xs text-primary font-medium uppercase tracking-wider">
          Day {module.day} Complete · {module.title}
        </div>
        <h1 className="font-headline-lg text-2xl sm:text-3xl font-bold tracking-tight text-on-surface">
          Module Mastered
        </h1>
        <p className="text-sm text-text-muted max-w-lg mx-auto leading-relaxed font-body-md">
          You have successfully completed all concepts, guided practice exercises, and independent challenge scenarios for Day {module.day}.
        </p>
      </div>

      {/* Core Competencies Mastered */}
      <div className="rounded-xl border border-outline-variant/70 bg-surface-container p-5 text-left space-y-3 shadow-sm">
        <span className="font-label-sm text-xs font-semibold uppercase tracking-wider text-text-muted block">
          Competencies Acquired:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {module.completionLearnings.map((learning, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2 text-xs text-on-surface bg-surface-dim p-2.5 rounded-lg border border-outline-variant/60"
            >
              <span className="text-primary font-mono">✓</span>
              <span className="leading-relaxed font-body-md">{learning}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Milestone Progress Status */}
      <div className="rounded-xl border border-outline-variant/70 bg-surface-container p-4 text-left space-y-2.5 shadow-sm">
        <div className="flex items-center justify-between text-xs">
          <div>
            <span className="font-semibold text-on-surface">{currentMilestone.title}</span>
            <span className="text-text-muted ml-2 font-label-sm">
              ({completedInMilestone}/{milestoneModules.length} days completed)
            </span>
          </div>
          <span className="font-medium text-primary font-mono">{milestonePercent}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-surface-dim overflow-hidden">
          <div
            style={{ width: `${milestonePercent}%` }}
            className="h-full bg-primary-container rounded-full transition-all duration-300"
          />
        </div>
      </div>

      {/* Next Day Unlock Status & Actions */}
      <div className="rounded-xl border border-outline-variant/70 bg-surface-container p-5 space-y-4 shadow-sm">
        {nextModule ? (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-left">
              <div>
                <span className="font-label-sm text-xs text-text-muted block">Next in Roadmap:</span>
                <span className="font-headline-sm text-base font-semibold text-on-surface">
                  Day {nextModule.day}: {nextModule.title}
                </span>
              </div>

              {isUnlockedNow ? (
                <span className="inline-flex items-center gap-1 text-xs font-label-sm text-primary">
                  <Icon name="lock_open" className="text-[14px]" />
                  Ready to start
                </span>
              ) : (
                <div className="flex items-center gap-1.5 text-xs font-mono text-text-muted bg-surface-dim px-3 py-1.5 rounded-lg border border-outline-variant/60">
                  <Icon name="schedule" className="text-[14px]" />
                  <span>Unlocks in: {countdown}</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={onReviewModule}
                className="inline-flex items-center gap-1.5 rounded-lg border border-outline-variant bg-surface-dim px-4 py-2 font-label-sm text-xs font-medium text-text-muted hover:text-on-surface hover:border-primary-container/40 transition cursor-pointer"
              >
                <Icon name="restart_alt" className="text-[15px]" />
                <span>Review Today's Module</span>
              </button>

              <button
                onClick={onOpenRoadmap}
                className="inline-flex items-center gap-1.5 rounded-lg border border-outline-variant bg-surface-dim px-4 py-2 font-label-sm text-xs font-medium text-text-muted hover:text-on-surface hover:border-primary-container/40 transition cursor-pointer"
              >
                <Icon name="map" className="text-[15px]" />
                <span>Explore Full Roadmap</span>
              </button>

              {isUnlockedNow && onContinueNextDay && (
                <button
                  onClick={onContinueNextDay}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary-container px-5 py-2 font-label-sm text-xs font-semibold text-on-primary-container hover:brightness-110 active:scale-95 transition cursor-pointer shadow-[0_0_8px_rgba(0,173,181,0.25)]"
                >
                  <span>Start Day {nextModule.day}</span>
                  <Icon name="arrow_forward" className="text-[15px]" />
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3 py-2">
            <span className="font-headline-sm text-base font-semibold text-primary block">
              Curriculum Completed!
            </span>
            <p className="text-xs text-text-muted max-w-md mx-auto font-body-md">
              Congratulations! You have finished all 25 days of the SQL Master Curriculum.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};
