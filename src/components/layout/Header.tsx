import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserLearningState } from '../../types/progress';
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
  const progressPct = Math.round((completedCount / 25) * 100);

  return (
    <header className="sticky top-0 w-full z-50 bg-ink/90 backdrop-blur-md pt-safe border-b border-border-soft">
      <div className="h-14 px-4 sm:px-6 flex items-center justify-between max-w-5xl mx-auto w-full gap-4">

        {/* Left: Brand Icon + SQLens Name */}
        <div className="flex items-center gap-2.5 min-w-0">
          <svg width="26" height="26" viewBox="0 0 30 30" fill="none" className="shrink-0">
            <circle cx="12.5" cy="12.5" r="9" stroke="#48D8C8" strokeWidth="2" />
            <line x1="19" y1="19" x2="26" y2="26" stroke="#48D8C8" strokeWidth="2.4" strokeLinecap="round" />
            <line x1="8" y1="10.5" x2="17" y2="10.5" stroke="#7C9BFF" strokeWidth="1.6" strokeLinecap="round" />
            <line x1="8" y1="14.5" x2="15" y2="14.5" stroke="#7C9BFF" strokeWidth="1.6" strokeLinecap="round" opacity="0.65" />
          </svg>
          <span className="font-display font-bold text-base sm:text-lg tracking-tight text-text">
            SQL<span className="text-func">ens</span>
          </span>
          <span className="hidden sm:inline-block text-border font-mono text-xs">/</span>
          <span className="hidden sm:inline-block font-body text-xs text-text-dim truncate">
            {activeViewTitle}
          </span>
        </div>

        {/* Right: Streak Pill + Icon Buttons */}
        <div className="flex items-center gap-3 shrink-0">

          {/* Streak Pill */}
          <div
            className="flex items-center gap-2 bg-surface-2 border border-border px-3 py-1 rounded-full font-mono text-xs text-text-dim"
            title={`${completedCount} of 25 modules completed`}
            aria-label={`Curriculum progress: ${completedCount} out of 25 days completed`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-func">
              <path d="M12 2C12 2 6 9 6 14a6 6 0 0012 0c0-2-1-3.5-1-3.5s-.5 2-2 2c1-3-1-6-3-6.5 0 0 1 2.5-1 4.5-1.5 1-2 2.5-2 3.5" />
            </svg>
            <span><strong className="text-func font-semibold">{completedCount}/25</strong> days</span>
          </div>

          {/* Unlock / Dev Controls */}
          <button
            id="header-unlock-btn"
            onClick={() => setShowDevMenu(!showDevMenu)}
            title="Daily Unlock Controls"
            aria-label="Daily Unlock Controls"
            aria-expanded={showDevMenu}
            className={`flex items-center justify-center w-8 h-8 rounded-lg border transition-all duration-150 cursor-pointer ${
              showDevMenu
                ? 'bg-func/20 border-func/40 text-func'
                : 'bg-surface-2 border-border text-text-dim hover:text-text hover:border-text-dim'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">
              {userState.bypassDailyLock ? 'lock_open' : 'schedule'}
            </span>
          </button>

          {/* Database Schema */}
          <button
            id="header-schema-btn"
            onClick={onOpenSchemaModal}
            title="Inspect Database Schema"
            aria-label="Inspect Database Schema"
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-surface-2 border border-border text-text-dim hover:text-text hover:border-text-dim transition-all duration-150 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">database</span>
          </button>

          {/* Profile / Avatar */}
          <button
            id="header-profile-btn"
            onClick={() => { if (onProfileClick) onProfileClick(); }}
            title="Your Profile"
            aria-label="Your Profile"
            className="w-8 h-8 rounded-full bg-gradient-to-br from-func to-keyword flex items-center justify-center font-display font-bold text-xs text-ink hover:opacity-90 transition cursor-pointer"
          >
            M
          </button>
        </div>

        {/* Dev / Settings Popover - animated slide+fade */}
        <AnimatePresence>
          {showDevMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowDevMenu(false)}
                aria-hidden="true"
              />
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="absolute right-4 top-16 w-72 rounded-xl border border-border bg-surface-2 p-4 shadow-2xl z-50 origin-top-right"
              >
                <div className="flex items-center justify-between border-b border-border/60 pb-2 mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[15px] text-func">settings</span>
                    <span className="text-xs font-semibold text-text font-display">Progression Controls</span>
                  </div>
                  <span className="text-[9px] text-text-dim font-mono bg-ink px-1.5 py-0.5 rounded border border-border tracking-wider uppercase">Dev</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-text">Bypass 6:00 PM Lock</span>
                    <input
                      type="checkbox"
                      checked={userState.bypassDailyLock}
                      onChange={(e) => {
                        onUpdateState((prev) => ({ ...prev, bypassDailyLock: e.target.checked }));
                      }}
                      className="rounded border-border bg-ink text-func focus:ring-0 cursor-pointer"
                    />
                  </div>
                  <p className="text-[11px] text-text-dim leading-relaxed">
                    Allows instant access to upcoming modules without waiting for the 6:00 PM daily unlock.
                  </p>

                  <div className="border-t border-border/60 pt-2">
                    <span className="text-text-dim block mb-1.5 text-[11px]">Simulated Time Offset:</span>
                    <div className="grid grid-cols-3 gap-1">
                      <button
                        onClick={() => onUpdateState((prev) => ({ ...prev, simulatedTimeOffsetHours: 0 }))}
                        className={`rounded px-2 py-1 text-[11px] font-mono border transition-colors duration-150 cursor-pointer ${
                          userState.simulatedTimeOffsetHours === 0
                            ? 'bg-func text-ink border-func font-bold'
                            : 'bg-ink text-text-dim border-border hover:text-text'
                        }`}
                      >
                        Real Time
                      </button>
                      <button
                        onClick={() => onUpdateState((prev) => ({ ...prev, simulatedTimeOffsetHours: prev.simulatedTimeOffsetHours + 6 }))}
                        className="rounded bg-ink px-2 py-1 text-[11px] font-mono text-text border border-border hover:bg-surface transition-colors duration-150 cursor-pointer"
                      >
                        +6h
                      </button>
                      <button
                        onClick={() => onUpdateState((prev) => ({ ...prev, simulatedTimeOffsetHours: prev.simulatedTimeOffsetHours + 24 }))}
                        className="rounded bg-ink px-2 py-1 text-[11px] font-mono text-text border border-border hover:bg-surface transition-colors duration-150 cursor-pointer"
                      >
                        +24h
                      </button>
                    </div>
                    {userState.simulatedTimeOffsetHours !== 0 && (
                      <p className="mt-1.5 text-[10px] text-func font-mono">
                        Offset: +{userState.simulatedTimeOffsetHours} hours
                      </p>
                    )}
                  </div>

                  <div className="border-t border-border/60 pt-2 flex justify-between">
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
                      className="text-[11px] text-text-dim hover:text-text cursor-pointer transition-colors duration-150"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};
