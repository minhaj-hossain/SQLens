'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Icon } from '@/components/ui/Icon';
import { ModuleData } from '@/types/curriculum';
import { getModuleDisplayLabel } from '@/lib/curriculum/module-order';

export interface ResetProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentModule?: ModuleData | null;
  onConfirmReset: (mode: 'all' | 'module', moduleId?: string) => Promise<void>;
}

export default function ResetProgressModal({
  isOpen,
  onClose,
  currentModule,
  onConfirmReset,
}: ResetProgressModalProps) {
  const [resetMode, setResetMode] = useState<'all' | 'module'>('all');
  const [isResetting, setIsResetting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsResetting(true);
    setErrorMessage(null);
    try {
      if (resetMode === 'module' && currentModule) {
        await onConfirmReset('module', currentModule.id);
      } else {
        await onConfirmReset('all');
      }
      onClose();
    } catch (err) {
      console.error('Reset error:', err);
      setErrorMessage('Failed to reset progress. Please try again.');
    } finally {
      setIsResetting(false);
    }
  };

  const moduleLabel = currentModule ? getModuleDisplayLabel(currentModule) : '';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/75 backdrop-blur-sm">
        {/* Backdrop click dismiss */}
        <div
          className="absolute inset-0"
          onClick={() => !isResetting && onClose()}
          aria-hidden="true"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 6 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="reset-modal-title"
          className="relative w-full max-w-md rounded-2xl border border-border bg-surface-2 p-6 shadow-2xl overflow-hidden z-10"
        >
          {/* Top accent line */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-error/40 via-error to-error/40" />

          {/* Header */}
          <div className="flex items-start gap-3.5 mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-error/10 border border-error/25 text-error shrink-0 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
              <Icon name="restart_alt" className="text-[20px]" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 id="reset-modal-title" className="text-base font-bold text-text font-display">
                Reset Learning Progress
              </h3>
              <p className="text-xs text-text-dim mt-0.5">
                Choose the scope of progress you would like to reset.
              </p>
            </div>
            <button
              onClick={onClose}
              disabled={isResetting}
              aria-label="Close"
              className="text-text-faint hover:text-text p-1 rounded-lg hover:bg-surface-3 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Icon name="close" className="text-[18px]" />
            </button>
          </div>

          {/* Scope selection if currentModule is available */}
          {currentModule ? (
            <div className="space-y-2 mb-4">
              <label
                onClick={() => setResetMode('all')}
                className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                  resetMode === 'all'
                    ? 'border-error/50 bg-error/5 shadow-[0_0_12px_rgba(239,68,68,0.1)]'
                    : 'border-border/60 bg-surface hover:border-border hover:bg-surface-3/50'
                }`}
              >
                <input
                  type="radio"
                  name="reset-scope"
                  checked={resetMode === 'all'}
                  onChange={() => setResetMode('all')}
                  className="mt-1 text-error focus:ring-error"
                />
                <div className="text-xs">
                  <span className="font-semibold text-text block">
                    Reset Entire Course (Days 1–38)
                  </span>
                  <span className="text-text-dim mt-0.5 block leading-relaxed">
                    Wipes all completed lessons, practice tasks, challenges, and daily unlock records back to Day 1.
                  </span>
                </div>
              </label>

              <label
                onClick={() => setResetMode('module')}
                className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                  resetMode === 'module'
                    ? 'border-func/50 bg-func/5 shadow-[0_0_12px_rgba(56,189,248,0.1)]'
                    : 'border-border/60 bg-surface hover:border-border hover:bg-surface-3/50'
                }`}
              >
                <input
                  type="radio"
                  name="reset-scope"
                  checked={resetMode === 'module'}
                  onChange={() => setResetMode('module')}
                  className="mt-1 text-func focus:ring-func"
                />
                <div className="text-xs">
                  <span className="font-semibold text-text block">
                    Reset Only {moduleLabel} ({currentModule.shortTitle})
                  </span>
                  <span className="text-text-dim mt-0.5 block leading-relaxed">
                    Clears practice queries and challenge completions for this day only. Other days and unlocks remain untouched.
                  </span>
                </div>
              </label>
            </div>
          ) : (
            <div className="rounded-xl border border-error/20 bg-error/5 p-3.5 mb-4 text-xs text-text-dim leading-relaxed">
              <span className="text-text font-semibold block mb-1">
                Full Curriculum Reset
              </span>
              This will reset all 38 days, task submissions, and unlock times back to Day 1.
            </div>
          )}

          {/* Warning banner */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface border border-border text-[11px] text-text-dim mb-5">
            <Icon name="warning" className="text-warning shrink-0 text-[15px]" />
            <span>This action cannot be undone. Saved SQL solutions will be cleared.</span>
          </div>

          {errorMessage && (
            <div className="mb-4 text-xs text-error bg-error/10 border border-error/30 rounded-lg p-2.5">
              {errorMessage}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border/50">
            <button
              type="button"
              onClick={onClose}
              disabled={isResetting}
              className="px-3.5 py-1.5 rounded-lg border border-border bg-surface text-text-dim hover:text-text hover:bg-surface-3 transition-colors text-xs font-mono disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isResetting}
              className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-error hover:bg-error/90 text-white font-mono text-xs font-bold shadow-[0_0_15px_rgba(239,68,68,0.25)] transition-all disabled:opacity-50 cursor-pointer"
            >
              {isResetting ? (
                <>
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span>Resetting...</span>
                </>
              ) : (
                <>
                  <Icon name="restart_alt" className="text-[14px]" />
                  <span>Confirm Reset</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
