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
  onLogoClick?: () => void;
  onSignInClick?: () => void;
  onSignUpClick?: () => void;
  user?: { id?: string; name?: string | null; email?: string | null; role?: string | null } | null;
  isAuthPending?: boolean;
  onSignOut?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  userState,
  currentModule,
  onUpdateState,
  onResetProgress,
  onOpenSchemaModal,
  activeViewTitle = 'Learning Path',
  onProfileClick,
  onLogoClick,
  onSignInClick,
  onSignUpClick,
  user,
  isAuthPending,
  onSignOut,
}) => {
  const [showDevMenu, setShowDevMenu] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const completedCount = Object.keys(userState.completedModules).length;
  const progressPct = Math.round((completedCount / 25) * 100);

  return (
    <header className="sticky top-0 w-full z-50 bg-ink/90 backdrop-blur-md pt-safe border-b border-border-soft">
      <div className="h-14 px-3 sm:px-6 flex items-center justify-between max-w-5xl mx-auto w-full gap-2 sm:gap-4">

        {/* Left: Brand Icon + SQLens Name (Clickable to Home) */}
        <button
          onClick={onLogoClick}
          className="flex items-center gap-2.5 min-w-0 hover:opacity-85 transition cursor-pointer text-left focus:outline-none group"
          title="Return to Curriculum Homepage"
          aria-label="Return to Curriculum Homepage"
        >
          <svg width="22" height="22" viewBox="0 0 30 30" fill="none" className="shrink-0 sm:w-[26px] sm:h-[26px] transition-transform duration-200 group-hover:scale-105">
            <circle cx="12.5" cy="12.5" r="9" stroke="#38BDF8" strokeWidth="2" />
            <line x1="19" y1="19" x2="26" y2="26" stroke="#38BDF8" strokeWidth="2.4" strokeLinecap="round" />
            <line x1="8" y1="10.5" x2="17" y2="10.5" stroke="#60A5FA" strokeWidth="1.6" strokeLinecap="round" />
            <line x1="8" y1="14.5" x2="15" y2="14.5" stroke="#60A5FA" strokeWidth="1.6" strokeLinecap="round" opacity="0.65" />
          </svg>
          <span className="font-display font-bold text-sm sm:text-lg tracking-tight text-text whitespace-nowrap">
            SQL<span className="text-func">ens</span>
          </span>
          <span className="hidden sm:inline-block text-border font-mono text-xs">/</span>
          <span className="hidden sm:inline-block font-body text-xs text-text-dim truncate group-hover:text-text transition-colors">
            {activeViewTitle}
          </span>
        </button>

        {/* Right: Streak Pill + Icon Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">

          {/* Streak Pill */}
          <div
            className="flex items-center gap-1.5 sm:gap-2 bg-surface-2 border border-border px-2 sm:px-3 py-1 rounded-full font-mono text-[11px] sm:text-xs text-text-dim whitespace-nowrap"
            title={`${completedCount} of 25 modules completed`}
            aria-label={`Curriculum progress: ${completedCount} out of 25 days completed`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-func">
              <path d="M12 2C12 2 6 9 6 14a6 6 0 0012 0c0-2-1-3.5-1-3.5s-.5 2-2 2c1-3-1-6-3-6.5 0 0 1 2.5-1 4.5-1.5 1-2 2.5-2 3.5" />
            </svg>
            <span><strong className="text-func font-semibold">{completedCount}/25</strong><span className="hidden min-[380px]:inline"> days</span></span>
          </div>

          {/* Unlock / Dev Controls */}
          <button
            id="header-unlock-btn"
            onClick={() => setShowDevMenu(!showDevMenu)}
            title="Daily Unlock Controls"
            aria-label="Daily Unlock Controls"
            aria-expanded={showDevMenu}
            className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg border transition-all duration-150 cursor-pointer ${
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
            className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-surface-2 border border-border text-text-dim hover:text-text hover:border-text-dim transition-all duration-150 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">database</span>
          </button>

          {/* Auth: signed-in user chip + sign-out, otherwise Sign In / Sign Up */}
          {isAuthPending ? (
            <button
              title="Checking session"
              aria-label="Checking session"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-surface-2 border border-border flex items-center justify-center"
            >
              <span className="w-3 h-3 rounded-full border-2 border-border border-t-func animate-spin" />
            </button>
          ) : user ? (
            <div
              className="relative flex items-center gap-1.5"
              onMouseEnter={() => setUserMenuOpen(true)}
              onMouseLeave={() => setUserMenuOpen(false)}
            >
              {user.role === 'admin' && (
                <a
                  href="/admin"
                  title="Admin dashboard"
                  aria-label="Admin dashboard"
                  className="hidden sm:flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-func/10 border border-func/30 text-func hover:bg-func/20 transition-all duration-150"
                >
                  <span className="material-symbols-outlined text-[16px]">shield_person</span>
                </a>
              )}
              {/* Avatar — animated brand-hue shimmer orbiting the initial */}
              <button
                id="header-user-btn"
                onClick={() => setUserMenuOpen((v) => !v)}
                aria-label={`Signed in as ${user.name ?? user.email}. Open account menu`}
                aria-expanded={userMenuOpen}
                className="relative flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full cursor-pointer focus:outline-none"
              >
                {/* Rotating conic ring — cyan→sky shades only (matches --func brand) */}
                <motion.span
                  aria-hidden="true"
                  className="absolute inset-0 rounded-full"
                  style={{
                    background:
                      'conic-gradient(from 140deg, #67E8F9, #38BDF8, #0284C7, #7DD3FC, #22D3EE, #67E8F9)',
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, ease: 'linear', repeat: Infinity }}
                />
                {/* Soft gap between ring and disc */}
                <span className="absolute inset-[2px] rounded-full bg-ink" />
                {/* Inner disc with initial */}
                <span className="absolute inset-[3px] rounded-full bg-surface-2 flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                  <span className="font-display font-bold text-func text-xs sm:text-sm select-none drop-shadow-[0_0_6px_rgba(56,189,248,0.45)]">
                    {(user.name ?? user.email ?? '?').trim().charAt(0).toUpperCase()}
                  </span>
                </span>
                {/* Gentle breathing glow */}
                <motion.span
                  aria-hidden="true"
                  className="absolute -inset-0.5 rounded-full bg-func/15 blur-[5px]"
                  animate={{ opacity: [0.35, 0.65, 0.35] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                />
              </button>
              {/* Profile popover — opens on hover/tap */}
              <AnimatePresence>
                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                      aria-hidden="true"
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.96 }}
                      transition={{ duration: 0.16, ease: 'easeOut' }}
                      role="menu"
                      aria-label="Account menu"
                      className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border bg-surface-2 shadow-2xl z-50 origin-top-right overflow-hidden"
                    >
                      {/* Identity header */}
                      <div className="flex items-start gap-2.5 px-3.5 pt-3.5 pb-3">
                        <span className="shrink-0 mt-0.5 flex items-center justify-center w-8 h-8 rounded-full bg-func/10 border border-func/25 text-func text-sm font-bold font-display shadow-[0_0_10px_rgba(56,189,248,0.2)]">
                          {(user.name ?? user.email ?? '?').trim().charAt(0).toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-text font-display truncate">
                            {user.name || 'Learner'}
                          </p>
                          <p
                            className="font-mono text-[10px] text-text-dim truncate"
                            title={user.email ?? ''}
                          >
                            {user.email}
                          </p>
                          {user.role === 'admin' && (
                            <span className="mt-1 inline-block bg-func/15 text-func border border-func/30 font-mono text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider">
                              Admin
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="border-t border-border/60 py-1">
                        {user.role === 'admin' && (
                          <a
                            href="/admin"
                            role="menuitem"
                            onClick={() => setUserMenuOpen(false)}
                            className="sm:hidden flex items-center gap-2 px-3.5 py-2 text-xs text-text-dim hover:text-text hover:bg-surface transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[15px] text-func">shield_person</span>
                            Admin dashboard
                          </a>
                        )}
                        <button
                          role="menuitem"
                          onClick={() => {
                            setUserMenuOpen(false);
                            onSignOut?.();
                          }}
                          className="w-full flex items-center gap-2 px-3.5 py-2 text-left text-xs text-text-dim hover:text-error hover:bg-error/5 transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[15px]">logout</span>
                          Sign out
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button
              id="header-signin-btn"
              onClick={() => onSignInClick?.()}
              title="Sign in"
              aria-label="Sign in"
              className="flex items-center justify-center px-3 sm:px-4 py-1.5 rounded-lg bg-func text-ink font-bold hover:brightness-110 transition-all duration-150 cursor-pointer font-mono text-[11px] sm:text-xs whitespace-nowrap"
            >
              Sign In
            </button>
          )}
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
                    <span className="text-text">Bypass Unlock Gates</span>
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
                    Bypasses all unlock gates: the 6:00 PM daily lock <em>and</em> any scheduled publish dates. Previous module must still be completed.
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
