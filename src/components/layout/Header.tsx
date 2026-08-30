import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import Icon from '@/components/ui/Icon';
import { UserLearningState } from '../../types/progress';
import { ModuleData } from '../../types/curriculum';
import { ALL_MODULES } from '../../content/curriculum-index';

const TOTAL_MODULES = ALL_MODULES.length;

interface HeaderProps {
  userState: UserLearningState;
  currentModule: ModuleData;
  onResetProgress: () => void;
  onOpenSchemaModal: () => void;
  activeViewTitle?: string;
  user?: { id?: string; name?: string | null; email?: string | null; role?: string | null } | null;
  isAuthPending?: boolean;
  onSignOut?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  userState,
  currentModule,
  onResetProgress,
  onOpenSchemaModal,
  activeViewTitle = 'Learning Path',
  user,
  isAuthPending,
  onSignOut,
}) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const completedCount = Object.keys(userState.completedModules).length;
  const progressPct = Math.round((completedCount / TOTAL_MODULES) * 100);

  return (
    <header className="sticky top-0 w-full z-50 bg-ink/90 backdrop-blur-md pt-safe border-b border-border-soft">
      <div className="h-14 px-3 sm:px-6 flex items-center justify-between max-w-5xl mx-auto w-full gap-2 sm:gap-4">

        {/* Left: brand dot + wordmark + current-route label (links home) */}
        <Link
          href="/"
          className="flex items-center gap-[9px] min-w-0 hover:opacity-85 transition text-left focus:outline-none group"
          title="Return to Curriculum Homepage"
          aria-label="Return to Curriculum Homepage"
        >
          <span className="w-[7px] h-[7px] rounded-full bg-func shrink-0" aria-hidden="true" />
          <span className="font-mono font-bold text-[15px] tracking-tight text-text whitespace-nowrap">
            SQLens
          </span>
          <span className="hidden sm:inline-block font-body text-xs text-text-faint truncate pl-[9px] border-l border-border ml-[2px]">
            {activeViewTitle}
          </span>
        </Link>

        {/* Right: Streak Pill + Icon Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">

          {/* Streak Pill */}
          <div
            className="flex items-center gap-1.5 sm:gap-2 bg-surface-2 border border-border px-2 sm:px-3 py-1 rounded-full font-mono text-[11px] sm:text-xs text-text-dim whitespace-nowrap"
            title={`${completedCount} of ${TOTAL_MODULES} modules completed`}
            aria-label={`Curriculum progress: ${completedCount} out of 38 Days completed`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-func">
              <path d="M12 2C12 2 6 9 6 14a6 6 0 0012 0c0-2-1-3.5-1-3.5s-.5 2-2 2c1-3-1-6-3-6.5 0 0 1 2.5-1 4.5-1.5 1-2 2.5-2 3.5" />
            </svg>
            <span><strong className="text-func font-semibold">{completedCount}/{TOTAL_MODULES}</strong><span className="hidden min-[380px]:inline"> days</span></span>
          </div>

          {/* Database Schema */}
          <button
            id="header-schema-btn"
            onClick={onOpenSchemaModal}
            title="Inspect Database Schema"
            aria-label="Inspect Database Schema"
            className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-surface-2 border border-border text-text-dim hover:text-text hover:border-text-dim transition-all duration-150 cursor-pointer"
          >
            <Icon name="database" className="text-[16px]" />
          </button>

          {/* SQL Playground â€” real route since Phase 1 */}
          <Link
            href="/playground"
            title="Open SQL Playground"
            aria-label="Open SQL Playground"
            className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-surface-2 border border-border text-text-dim hover:text-text hover:border-text-dim transition-all duration-150"
          >
            <Icon name="terminal" className="text-[16px]" />
          </Link>

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
            >
              {user.role === 'admin' && (
                <Link
                  href="/admin"
                  title="Admin dashboard"
                  aria-label="Admin dashboard"
                  className="hidden sm:flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-func/10 border border-func/30 text-func hover:bg-func/20 transition-all duration-150"
                >
                  <Icon name="shield_person" className="text-[16px]" />
                </Link>
              )}
              {/* Avatar + popover share one hover wrapper so the mouse can move
                  from the circle into the menu without closing it. The admin
                  shield stays OUTSIDE this wrapper â€” hovering it never opens
                  the account menu. */}
              <div
                className="relative"
                onMouseEnter={() => setUserMenuOpen(true)}
                onMouseLeave={() => setUserMenuOpen(false)}
              >
                <button
                  id="header-user-btn"
                  onClick={() => setUserMenuOpen((v) => !v)}
                  aria-label={`Signed in as ${user.name ?? user.email}. Open account menu`}
                  aria-expanded={userMenuOpen}
                  className="relative flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-surface-2 border border-border cursor-pointer focus:outline-none"
                >
                {/* Rotating conic ring - grayscale (matches border system) */}
                <motion.span
                  aria-hidden="true"
                  className="absolute inset-0 rounded-full"
                  style={{
                    background:
                      'conic-gradient(from 140deg, #262626, #3d3d3d, #262626, #333333, #262626, #262626)',
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, ease: 'linear', repeat: Infinity }}
                />
                {/* Soft gap between ring and disc */}
                <span className="absolute inset-[2px] rounded-full bg-ink" />
                {/* Inner disc with initial */}
                <span className="absolute inset-[3px] rounded-full bg-surface-2 flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                  <span className="font-display font-bold text-text text-xs sm:text-sm select-none">
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
              {/* Profile popover â€” opens on hover/tap */}
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
                        <button
                          role="menuitem"
                          onClick={() => {
                            if (window.confirm('Reset all course progress back to Day 1?')) {
                              setUserMenuOpen(false);
                              onResetProgress();
                            }
                          }}
                          className="w-full flex items-center gap-2 px-3.5 py-2 text-left text-xs text-text-dim hover:text-error hover:bg-error/5 transition-colors cursor-pointer"
                        >
                          <Icon name="restart_alt" className="text-[15px]" />
                          Reset Progress
                        </button>
                        {user.role === 'admin' && (
                          <Link
                            href="/admin"
                            role="menuitem"
                            onClick={() => setUserMenuOpen(false)}
                            className="sm:hidden flex items-center gap-2 px-3.5 py-2 text-xs text-text-dim hover:text-text hover:bg-surface transition-colors cursor-pointer"
                          >
                            <Icon name="shield_person" className="text-[15px] text-func" />
                            Admin dashboard
                          </Link>
                        )}
                        <button
                          role="menuitem"
                          onClick={() => {
                            setUserMenuOpen(false);
                            onSignOut?.();
                          }}
                          className="w-full flex items-center gap-2 px-3.5 py-2 text-left text-xs text-text-dim hover:text-error hover:bg-error/5 transition-colors cursor-pointer"
                        >
                          <Icon name="logout" className="text-[15px]" />
                          Sign out
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
              </div>
            </div>
          ) : (
            <Link
              id="header-signin-btn"
              href="/signin"
              title="Sign in"
              aria-label="Sign in"
              className="flex items-center justify-center px-3 sm:px-4 py-1.5 rounded-lg bg-func text-ink font-bold hover:brightness-110 transition-all duration-150 font-mono text-[11px] sm:text-xs whitespace-nowrap"
            >
              Sign In
            </Link>
          )}
        </div>

      </div>
    </header>
  );
};
