import React, { useRef } from 'react';
import { motion } from 'motion/react';
import Icon from '@/components/ui/Icon';
import { ROADMAP_MILESTONES } from '../../config/roadmap';
import { ALL_MODULES } from '../../content/curriculum-index';
import { UserLearningState } from '../../types/progress';
import { getModuleUnlockStatus, isModuleFullyComplete } from '../../lib/progress/unlock-calculator';
import { getModuleDisplayLabel } from '../../lib/curriculum/module-order';
import { useCloseOnOutside } from '../../lib/use-close-on-outside';

interface RoadmapModalProps {
  isOpen: boolean;
  userState: UserLearningState;
  currentModuleId: string;
  onSelectModule: (moduleId: string) => void;
  onClose: () => void;
}

export const RoadmapModal: React.FC<RoadmapModalProps> = ({
  isOpen,
  userState,
  currentModuleId,
  onSelectModule,
  onClose,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close when clicking/tapping anywhere outside the modal panel.
  useCloseOnOutside(panelRef, isOpen, onClose);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/80 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        ref={panelRef}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.15 }}
        className="w-full max-w-5xl rounded-xl border border-border bg-surface shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-soft bg-ink px-5 py-3">
          <div className="flex items-center gap-2.5">
            <Icon name="map" className="text-[20px] text-text-dim" />
            <div>
              <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-text">
                38-day Curriculum Map
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded p-1 text-text-dim hover:bg-surface-2 hover:text-text transition cursor-pointer"
          >
            <Icon name="close" className="text-[18px]" />
          </button>
        </div>

        {/* Roadmap Milestones */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-ink">
          {ROADMAP_MILESTONES.map((milestone) => {
            const milestoneModules = ALL_MODULES.filter((m) => milestone.moduleIds.includes(m.id));
            const completedCount = milestoneModules.filter((m) => isModuleFullyComplete(m, userState)).length;
            const isMilestoneDone = completedCount === milestoneModules.length;

            return (
              <div
                key={milestone.id}
                className="rounded-xl border border-border bg-surface p-4 space-y-3 shadow-sm"
              >
                {/* Milestone Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-xs font-semibold text-text">
                      {milestone.title}
                    </span>
                    <span className="text-xs text-text-dim font-body">({milestone.subtitle})</span>
                    {isMilestoneDone && (
                      <span className="font-mono text-[11px] text-done font-medium">
                        [Complete]
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-xs text-text-faint">
                    {completedCount}/{milestoneModules.length} Days Done
                  </span>
                </div>

                {/* Day Modules Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {milestoneModules.map((module) => {
                    const unlockStatus = getModuleUnlockStatus(module, ALL_MODULES, userState);
                    const isCurrent = module.id === currentModuleId;
                    const isCompleted = unlockStatus.isCompleted;
                    const isUnlocked = unlockStatus.isUnlocked;

                    return (
                      <button
                        key={module.id}
                        disabled={!isUnlocked && !isCompleted}
                        onClick={() => {
                          onSelectModule(module.id);
                          onClose();
                        }}
                        className={`flex flex-col justify-between rounded-lg p-2.5 text-left transition border ${
                          isCurrent
                            ? 'border-string bg-string/10 text-text font-medium'
                            : isCompleted
                            ? 'border-border bg-surface-2 text-text hover:border-text-dim cursor-pointer'
                            : isUnlocked
                            ? 'border-border bg-surface-2/50 text-text-dim hover:border-keyword/40 cursor-pointer'
                            : 'border-border-soft bg-surface/20 text-text-faint cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <span className="font-mono text-[11px] font-medium text-text-faint">
                            {getModuleDisplayLabel(module)}
                          </span>
                          {isCompleted ? (
                            <Icon name="check_circle" className="text-[14px] text-done" />
                          ) : isUnlocked ? (
                            <Icon name="play_circle" className="text-[14px] text-text-dim" />
                          ) : (
                            <Icon name="lock" className="text-[14px] text-text-faint" />
                          )}
                        </div>
                        <span className="font-mono text-xs line-clamp-1 text-text">
                          {module.shortTitle}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};
