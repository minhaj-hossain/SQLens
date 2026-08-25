import React from 'react';
import { Check, Lock, ChevronRight } from 'lucide-react';
import { UserLearningState } from '../../types/progress';
import { ROADMAP_MILESTONES } from '../../config/roadmap';
import { ALL_MODULES } from '../../content/curriculum-index';
import { getModuleUnlockStatus, isModuleFullyComplete } from '../../lib/progress/unlock-calculator';

interface RoadmapSidebarProps {
  currentModuleId: string;
  userState: UserLearningState;
  onSelectModule: (moduleId: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const RoadmapSidebar: React.FC<RoadmapSidebarProps> = ({
  currentModuleId,
  userState,
  onSelectModule,
  isOpen,
  onToggle,
}) => {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-20 w-64 flex-col border-r border-zinc-800/80 bg-zinc-950 transition-transform md:static md:translate-x-0 ${
        isOpen ? 'translate-x-0 flex' : '-translate-x-full hidden md:flex'
      }`}
    >
      {/* Sidebar Header */}
      <div className="flex h-14 items-center justify-between border-b border-zinc-800/80 px-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono">
          Curriculum Map
        </span>
        <button
          onClick={onToggle}
          className="rounded p-1 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 md:hidden"
        >
          ✕
        </button>
      </div>

      {/* Roadmap List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {ROADMAP_MILESTONES.map((milestone) => {
          const milestoneModules = ALL_MODULES.filter(m => milestone.moduleIds.includes(m.id));
          const completedInMilestone = milestoneModules.filter(m => isModuleFullyComplete(m, userState)).length;

          return (
            <div key={milestone.id} className="space-y-2">
              {/* Milestone Group Label */}
              <div className="flex items-center justify-between px-2">
                <span className="text-xs font-medium text-zinc-300">
                  {milestone.title}
                </span>
                <span className="text-[11px] font-mono text-zinc-500">
                  {completedInMilestone}/{milestoneModules.length}
                </span>
              </div>

              {/* Module List in Progression Map Style */}
              <div className="space-y-0.5 border-l border-zinc-800/70 ml-2 pl-2">
                {milestoneModules.map((module) => {
                  const unlockStatus = getModuleUnlockStatus(module, ALL_MODULES, userState);
                  const isCurrent = module.id === currentModuleId;
                  const isCompleted = unlockStatus.isCompleted;
                  const isUnlocked = unlockStatus.isUnlocked;

                  return (
                    <button
                      key={module.id}
                      disabled={!isUnlocked && !isCompleted}
                      onClick={() => onSelectModule(module.id)}
                      className={`group flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-xs transition-colors ${
                        isCurrent
                          ? 'bg-zinc-900 text-zinc-100 font-medium'
                          : isCompleted
                          ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
                          : isUnlocked
                          ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
                          : 'cursor-not-allowed text-zinc-600'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {/* Minimalist Progression Node: ✓ Completed, ◉ Current, ○ Inactive, 🔒 Locked */}
                        <span className="shrink-0 flex items-center justify-center w-4 text-center font-mono">
                          {isCompleted ? (
                            <span className="text-emerald-400 text-xs">✓</span>
                          ) : isCurrent ? (
                            <span className="text-emerald-400 text-sm font-bold">◉</span>
                          ) : isUnlocked ? (
                            <span className="text-zinc-500 text-sm">○</span>
                          ) : (
                            <Lock className="h-3 w-3 text-zinc-700" />
                          )}
                        </span>

                        <div className="truncate">
                          <span className="font-mono text-[11px] text-zinc-500 mr-1.5">
                            D{module.day}
                          </span>
                          <span className={`${isCurrent ? 'text-zinc-100' : 'text-zinc-300'}`}>
                            {module.shortTitle}
                          </span>
                        </div>
                      </div>

                      {!isUnlocked && !isCompleted && unlockStatus.countdownFormatted && (
                        <span className="text-[10px] font-mono text-zinc-600 shrink-0">
                          {unlockStatus.countdownFormatted.split(' ')[0]}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Meta */}
      <div className="border-t border-zinc-800/80 px-4 py-3 bg-zinc-950">
        <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono">
          <span>Daily 6:00 PM Cycle</span>
          <span className="text-zinc-400">25 Days</span>
        </div>
      </div>
    </aside>
  );
};
