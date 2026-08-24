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
    <header className="fixed top-0 w-full z-50 bg-surface-base/80 backdrop-blur-xl pt-safe shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-outline-variant/30">
      <div className="h-16 px-4 sm:px-6 flex items-center justify-between max-w-5xl mx-auto w-full gap-4">

        {/* Left: Brand Icon + View Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 bg-primary-container rounded-lg flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-on-primary-container text-[20px]">school</span>
          </div>
          <span className="font-headline-sm text-headline-sm tracking-tight text-on-surface truncate">
            {activeViewTitle}
          </span>
        </div>

        {/* Right: Progress + Icon Buttons */}
        <div className="flex items-center gap-2 shrink-0">

          {/* Progress Pill with animated mini fill bar */}
          <div
            className="hidden sm:flex flex-col gap-1 bg-surface-container border border-outline-variant/50 px-3 py-1.5 rounded-lg"
            title={`${completedCount} of 25 modules completed`}
            style={{ minWidth: '100px' }}
          >
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[12px] text-primary">check_circle</span>
              <span className="font-mono text-[11px] font-bold text-primary leading-none">
                {completedCount}<span className="text-text-muted font-normal">/25</span>
              </span>
              <span className="text-[10px] text-text-muted leading-none">done</span>
            </div>
            <div className="w-full h-[3px] rounded-full bg-outline-variant/40 overflow-hidden">
              <div
                className="h-full rounded-full bg-primary motion-safe:transition-[width] motion-safe:duration-700 motion-safe:ease-out"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* Unlock / Dev Controls */}
          <div className="relative flex flex-col items-center gap-0.5">
            <button
              id="header-unlock-btn"
              onClick={() => setShowDevMenu(!showDevMenu)}
              title="Daily Unlock Controls"
              aria-label="Daily Unlock Controls"
              aria-expanded={showDevMenu}
              className={`flex items-center justify-center w-9 h-9 rounded-lg border transition-all duration-200 ease-out cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                showDevMenu
                  ? 'bg-primary-container/20 border-primary/40 text-primary scale-105'
                  : 'bg-surface-container border-outline-variant text-text-muted hover:text-on-surface hover:bg-surface-variant hover:scale-105 hover:border-outline-variant/80'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {userState.bypassDailyLock ? 'lock_open' : 'schedule'}
              </span>
            </button>
            <span className="hidden md:block text-[9px] text-text-muted leading-none tracking-wide uppercase font-medium select-none">
              Unlock
            </span>
          </div>

          {/* Database Schema */}
          <div className="flex flex-col items-center gap-0.5">
            <button
              id="header-schema-btn"
              onClick={onOpenSchemaModal}
              title="Inspect Database Schema"
              aria-label="Inspect Database Schema"
              className="flex items-center justify-center w-9 h-9 rounded-lg bg-surface-container border border-outline-variant text-text-muted hover:text-on-surface hover:bg-surface-variant hover:scale-105 hover:border-outline-variant/80 transition-all duration-200 ease-out cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            >
              <span className="material-symbols-outlined text-[18px]">database</span>
            </button>
            <span className="hidden md:block text-[9px] text-text-muted leading-none tracking-wide uppercase font-medium select-none">
              Schema
            </span>
          </div>

          {/* Profile / Avatar - intentionally round+filled as account indicator */}
          <div className="flex flex-col items-center gap-0.5">
            <button
              id="header-profile-btn"
              onClick={() => { if (onProfileClick) onProfileClick(); }}
              title="Your Profile"
              aria-label="Your Profile"
              className="relative flex items-center justify-center w-9 h-9 rounded-full bg-primary-container text-on-primary-container hover:brightness-110 hover:scale-105 transition-all duration-200 ease-out cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">person</span>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-surface-base" />
            </button>
            <span className="hidden md:block text-[9px] text-text-muted leading-none tracking-wide uppercase font-medium select-none">
              You
            </span>
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
                  className="absolute right-4 top-[4.5rem] w-72 rounded-xl border border-outline-variant bg-surface-container p-4 shadow-2xl z-50 origin-top-right"
                >
                  <div className="flex items-center justify-between border-b border-outline-variant/60 pb-2 mb-3">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[15px] text-primary">settings</span>
                      <span className="text-xs font-semibold text-on-surface font-headline-sm">Progression Controls</span>
                    </div>
                    <span className="text-[9px] text-text-muted font-mono bg-surface-base px-1.5 py-0.5 rounded border border-outline-variant/50 tracking-wider uppercase">Dev</span>
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
                          className={`rounded px-2 py-1 text-[11px] font-mono border transition-colors duration-150 cursor-pointer ${
                            userState.simulatedTimeOffsetHours === 0
                              ? 'bg-primary-container text-on-primary-container border-primary-container'
                              : 'bg-surface-base text-text-muted border-outline-variant hover:text-on-surface'
                          }`}
                        >
                          Real Time
                        </button>
                        <button
                          onClick={() => onUpdateState((prev) => ({ ...prev, simulatedTimeOffsetHours: prev.simulatedTimeOffsetHours + 6 }))}
                          className="rounded bg-surface-base px-2 py-1 text-[11px] font-mono text-on-surface border border-outline-variant hover:bg-surface-variant transition-colors duration-150 cursor-pointer"
                        >
                          +6h
                        </button>
                        <button
                          onClick={() => onUpdateState((prev) => ({ ...prev, simulatedTimeOffsetHours: prev.simulatedTimeOffsetHours + 24 }))}
                          className="rounded bg-surface-base px-2 py-1 text-[11px] font-mono text-on-surface border border-outline-variant hover:bg-surface-variant transition-colors duration-150 cursor-pointer"
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
                        className="text-[11px] text-text-muted hover:text-on-surface cursor-pointer transition-colors duration-150"
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
      </div>
    </header>
  );
};
