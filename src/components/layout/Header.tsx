import React, { useState, useEffect } from 'react';
import { UserLearningState } from '../../types/progress';
import { getEffectiveNow } from '../../lib/progress/unlock-calculator';
import { ModuleData } from '../../types/curriculum';

interface HeaderProps {
  userState: UserLearningState;
  currentModule: ModuleData;
  onUpdateState: (updater: (prev: UserLearningState) => UserLearningState) => void;
  onResetProgress: () => void;
  onOpenSchemaModal: () => void;
  onOpenRoadmapModal: () => void;
  activeViewTitle?: string;
  onProfileClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  userState,
  currentModule,
  onUpdateState,
  onResetProgress,
  onOpenSchemaModal,
  activeViewTitle = 'Learning Path',
  onProfileClick,
}) => {
  const [showDevMenu, setShowDevMenu] = useState(false);
  const completedCount = Object.keys(userState.completedModules).length;

  return (
    <header className="fixed top-0 w-full z-50 bg-surface-base/80 backdrop-blur-xl pt-safe shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-outline-variant/30">
      <div className="h-16 px-margin-mobile flex items-center justify-between max-w-4xl mx-auto w-full">
        {/* Left: Brand Icon + Title */}
        <div className="flex items-center gap-element-gap">
          <div className="w-8 h-8 bg-primary-container rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary-container text-[20px]">school</span>
          </div>
          <span className="font-headline-sm text-headline-sm tracking-tight text-on-surface">
            {activeViewTitle}
          </span>
        </div>

        {/* Right: Actions & User Avatar */}
        <div className="flex items-center gap-3">
          {/* Quick Progress Badge */}
          <div className="hidden sm:flex items-center gap-1.5 font-label-sm text-label-sm bg-surface-container border border-outline-variant/50 text-text-muted px-2.5 py-1 rounded">
            <span className="text-primary-container font-mono">{completedCount}/25</span>
            <span>Completed</span>
          </div>

          {/* Dev / Lock Toggle */}
          <button
            onClick={() => setShowDevMenu(!showDevMenu)}
            title="Daily Unlock Simulator & Dev Options"
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-surface-container border border-outline-variant text-text-muted hover:text-on-surface transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">
              {userState.bypassDailyLock ? 'lock_open' : 'schedule'}
            </span>
          </button>

          {/* Schema quick access */}
          <button
            onClick={onOpenSchemaModal}
            title="Inspect Database Schema"
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-surface-container border border-outline-variant text-text-muted hover:text-on-surface transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">database</span>
          </button>

          {/* Profile Icon button */}
          <button
            onClick={() => {
              if (onProfileClick) onProfileClick();
              else setShowDevMenu(!showDevMenu);
            }}
            className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container cursor-pointer transition-transform hover:scale-105"
          >
            <span className="material-symbols-outlined text-on-primary-container text-[18px]">person</span>
          </button>

          {/* Dev / Settings Popover */}
          {showDevMenu && (
            <div className="absolute right-4 top-16 w-72 rounded-xl border border-outline-variant bg-surface-container p-4 shadow-2xl z-50">
              <div className="flex items-center justify-between border-b border-outline-variant/60 pb-2 mb-3">
                <span className="text-xs font-semibold text-on-surface font-headline-sm">
                  Progression Controls
                </span>
                <span className="text-[10px] text-text-muted font-mono">Dev Mode</span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-on-surface">Bypass 6:00 PM Lock</span>
                  <input
                    type="checkbox"
                    checked={userState.bypassDailyLock}
                    onChange={(e) => {
                      onUpdateState((prev) => ({ ...prev, bypassDailyLock: e.target.checked }));
                    }}
                    className="rounded border-outline-variant bg-surface-base text-primary-container focus:ring-0 cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-text-muted leading-relaxed">
                  Allows instant access to upcoming modules without waiting for the 6:00 PM daily unlock.
                </p>

                <div className="border-t border-outline-variant/60 pt-2">
                  <span className="text-text-muted block mb-1.5 text-[11px]">Simulated Time Offset:</span>
                  <div className="grid grid-cols-3 gap-1">
                    <button
                      onClick={() => onUpdateState((prev) => ({ ...prev, simulatedTimeOffsetHours: 0 }))}
                      className={`rounded px-2 py-1 text-[11px] font-mono border ${
                        userState.simulatedTimeOffsetHours === 0
                          ? 'bg-primary-container text-on-primary-container border-primary-container'
                          : 'bg-surface-base text-text-muted border-outline-variant hover:text-on-surface'
                      }`}
                    >
                      Real Time
                    </button>
                    <button
                      onClick={() =>
                        onUpdateState((prev) => ({
                          ...prev,
                          simulatedTimeOffsetHours: prev.simulatedTimeOffsetHours + 6,
                        }))
                      }
                      className="rounded bg-surface-base px-2 py-1 text-[11px] font-mono text-on-surface border border-outline-variant hover:bg-surface-variant"
                    >
                      +6h
                    </button>
                    <button
                      onClick={() =>
                        onUpdateState((prev) => ({
                          ...prev,
                          simulatedTimeOffsetHours: prev.simulatedTimeOffsetHours + 24,
                        }))
                      }
                      className="rounded bg-surface-base px-2 py-1 text-[11px] font-mono text-on-surface border border-outline-variant hover:bg-surface-variant"
                    >
                      +24h
                    </button>
                  </div>
                  {userState.simulatedTimeOffsetHours !== 0 && (
                    <p className="mt-1.5 text-[10px] text-primary font-mono">
                      Offset: +{userState.simulatedTimeOffsetHours} hours
                    </p>
                  )}
                </div>

                <div className="border-t border-outline-variant/60 pt-2 flex justify-between">
                  <button
                    onClick={() => {
                      if (confirm('Reset all course progress back to Day 1?')) {
                        onResetProgress();
                        setShowDevMenu(false);
                      }
                    }}
                    className="flex items-center gap-1 text-[11px] text-error hover:underline cursor-pointer"
                  >
                    Reset Progress
                  </button>
                  <button
                    onClick={() => setShowDevMenu(false)}
                    className="text-[11px] text-text-muted hover:text-on-surface cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
