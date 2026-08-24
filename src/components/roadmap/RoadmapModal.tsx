import React from 'react';
import { motion } from 'motion/react';
import { ROADMAP_MILESTONES } from '../../config/roadmap';
import { ALL_MODULES } from '../../content/curriculum-index';
import { UserLearningState } from '../../types/progress';
import { getModuleUnlockStatus } from '../../lib/progress/unlock-calculator';

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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-base/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.15 }}
        className="w-full max-w-5xl rounded-xl border border-outline-variant/80 bg-surface-container shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-outline-variant/60 bg-surface-base/80 px-5 py-3">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[20px] text-primary-container">map</span>
            <div>
              <h2 className="font-label-sm text-xs font-semibold uppercase tracking-wider text-on-surface">
                25-Day Curriculum Map
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded p-1 text-text-muted hover:bg-surface-variant hover:text-on-surface transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Roadmap Milestones */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-surface-base">
          {ROADMAP_MILESTONES.map((milestone) => {
            const milestoneModules = ALL_MODULES.filter((m) => milestone.moduleIds.includes(m.id));
            const completedCount = milestoneModules.filter((m) => !!userState.completedModules[m.id]).length;
            const isMilestoneDone = completedCount === milestoneModules.length;

            return (
              <div
                key={milestone.id}
                className="rounded-xl border border-outline-variant/70 bg-surface-container p-4 space-y-3 shadow-sm"
              >
                {/* Milestone Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-outline-variant/60 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-headline-sm text-xs font-semibold text-on-surface">
                      {milestone.title}
                    </span>
                    <span className="text-xs text-text-muted font-body-md">({milestone.subtitle})</span>
                    {isMilestoneDone && (
                      <span className="font-label-sm text-[11px] text-primary font-medium">
                        [Complete]
                      </span>
                    )}
                  </div>
                  <span className="font-label-sm text-xs text-text-muted">
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
                            ? 'border-primary-container bg-surface-dim text-on-surface font-medium'
                            : isCompleted
                            ? 'border-outline-variant/60 bg-surface-dim/70 text-on-surface hover:border-primary-container/60 cursor-pointer'
                            : isUnlocked
                            ? 'border-outline-variant/60 bg-surface-dim/40 text-on-surface hover:border-primary-container/40 cursor-pointer'
                            : 'border-outline-variant/40 bg-surface-dim/20 text-text-muted/40 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <span className="font-label-sm text-[11px] font-medium text-text-muted">
                            Day {module.day}
                          </span>
                          {isCompleted ? (
                            <span className="material-symbols-outlined text-[14px] text-primary">
                              check_circle
                            </span>
                          ) : isUnlocked ? (
                            <span className="material-symbols-outlined text-[14px] text-primary-container">
                              play_circle
                            </span>
                          ) : (
                            <span className="material-symbols-outlined text-[14px] text-text-muted/50">
                              lock
                            </span>
                          )}
                        </div>
                        <span className="font-label-sm text-xs line-clamp-1 text-on-surface">
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
