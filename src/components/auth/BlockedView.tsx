'use client';

import React from 'react';
import { motion } from 'motion/react';
import Icon from '@/components/ui/Icon';

/**
 * Full-page screen shown when the signed-in account has status = 'blocked'
 * (set by an admin). Purely informational — actual enforcement is server-side:
 * every authenticated API route re-checks status and returns 403 account_blocked.
 * The user may sign out and continue as a guest; their local progress is intact.
 */
export default function BlockedView({ onSignOut }: { onSignOut?: () => void }) {
  return (
    <main className="min-h-screen bg-ink flex flex-col">
      {/* Top bar */}
      <header className="border-b border-border-soft">
        <div className="max-w-5xl mx-auto h-14 px-4 sm:px-6 flex items-center justify-between">
          <span className="font-display font-bold text-sm sm:text-lg tracking-tight text-text">
            SQL<span className="text-func">ens</span>
          </span>
          {onSignOut && (
            <button
              onClick={onSignOut}
              className="font-mono text-[11px] sm:text-xs px-3 py-1.5 rounded-lg bg-surface-2 border border-border text-text-dim hover:text-text transition"
            >
              Sign out
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="bg-surface border border-error/30 rounded-2xl p-8 max-w-md w-full text-center"
        >
          <div className="mx-auto mb-5 w-12 h-12 rounded-full bg-error/10 border border-error/40 flex items-center justify-center">
            <Icon name="block" className="text-error text-[24px]" />
          </div>

          <h1 className="font-display font-bold text-xl text-text mb-2">Account suspended</h1>

          <p className="text-sm text-text-dim leading-relaxed mb-2">
            This account has been blocked by an administrator and can no longer be used to
            sign in or sync progress.
          </p>
          <p className="font-mono text-[11px] text-text-faint leading-relaxed mb-6">
            If you believe this is a mistake, contact the site administrator to have your
            account reviewed.
          </p>

          {onSignOut && (
            <button
              onClick={onSignOut}
              className="inline-block bg-func text-ink font-mono text-xs font-bold px-5 py-2.5 rounded-lg hover:brightness-110 transition"
            >
              Continue as guest
            </button>
          )}
        </motion.div>
      </div>
    </main>
  );
}
