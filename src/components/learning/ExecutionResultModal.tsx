import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

export interface ExecutionModalData {
  isOpen: boolean;
  status: 'success' | 'failure';
  title: string;
  message?: string;
  userSql?: string;
  expectedSql?: string;
  progressText?: string;
  canGoBack?: boolean;
  canGoForward?: boolean;
  isLastTask?: boolean;
  onContinueNext?: () => void;
  onPrevious?: () => void;
  onTryAgain?: () => void;
  onViewSolution?: () => void;
  onClose?: () => void;
}

interface ExecutionResultModalProps {
  data: ExecutionModalData;
}

export const ExecutionResultModal: React.FC<ExecutionResultModalProps> = ({ data }) => {
  const {
    isOpen,
    status,
    title,
    message,
    userSql,
    expectedSql,
    progressText,
    canGoBack = false,
    canGoForward = false,
    isLastTask = false,
    onContinueNext,
    onPrevious,
    onTryAgain,
    onViewSolution,
    onClose,
  } = data;

  const isSuccess = status === 'success';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-base/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className={`relative w-full max-w-lg rounded-2xl bg-surface-container border shadow-2xl overflow-hidden ${
              isSuccess ? 'border-[#10B981]/50' : 'border-error/50'
            }`}
          >
            {/* Top Colored Accent Stripe */}
            <div
              className={`absolute top-0 left-0 w-full h-[4px] ${
                isSuccess ? 'bg-[#10B981]' : 'bg-error'
              }`}
            />

            <div className="p-6 sm:p-7 flex flex-col gap-5">
              {/* Header Status Card */}
              <div
                className={`w-full flex items-center justify-between p-4 rounded-xl border ${
                  isSuccess
                    ? 'bg-[#10B981]/15 border-[#10B981]/30'
                    : 'bg-error-container/20 border-error/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`material-symbols-outlined text-[28px] ${
                      isSuccess ? 'text-[#10B981]' : 'text-error'
                    }`}
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {isSuccess ? 'check_circle' : 'cancel'}
                  </span>
                  <div>
                    <h3
                      className={`font-headline-sm text-lg font-bold ${
                        isSuccess ? 'text-[#10B981]' : 'text-error'
                      }`}
                    >
                      {title}
                    </h3>
                    {progressText && (
                      <span className="text-xs text-text-muted font-label-sm block mt-0.5">
                        {progressText}
                      </span>
                    )}
                  </div>
                </div>

                {onClose && (
                  <button
                    onClick={onClose}
                    className="text-text-muted hover:text-on-surface p-1 rounded-lg hover:bg-surface-variant transition cursor-pointer"
                    title="Close"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                )}
              </div>

              {/* Message / Diagnostic Feedback */}
              {message && (
                <div
                  className={`rounded-xl p-4 text-xs sm:text-sm font-body-md leading-relaxed border ${
                    isSuccess
                      ? 'bg-surface-base/80 border-outline-variant/60 text-on-surface'
                      : 'bg-surface-dim border-error/25 text-on-surface'
                  }`}
                >
                  <p className="flex items-start gap-2">
                    <span
                      className={`material-symbols-outlined text-[18px] shrink-0 mt-0.5 ${
                        isSuccess ? 'text-primary' : 'text-error'
                      }`}
                    >
                      {isSuccess ? 'verified' : 'info'}
                    </span>
                    <span>{message}</span>
                  </p>
                </div>
              )}

              {/* Your Executed SQL Query */}
              {userSql && (
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-label-sm text-xs text-text-muted">
                      Your query executed:
                    </span>
                  </div>
                  <div className="w-full bg-surface-dim rounded-lg p-3 font-mono text-xs text-primary border border-outline-variant/70 overflow-x-auto whitespace-pre shadow-inner">
                    <code>{userSql}</code>
                  </div>
                </div>
              )}

              {/* Expected Solution (if shown in failure mode) */}
              {!isSuccess && expectedSql && (
                <div className="flex flex-col gap-1.5">
                  <span className="font-label-sm text-xs text-text-muted">
                    Expected query solution:
                  </span>
                  <div className="w-full bg-surface-dim rounded-lg p-3 font-mono text-xs text-[#10B981] border border-outline-variant/70 overflow-x-auto whitespace-pre shadow-inner">
                    <code>{expectedSql}</code>
                  </div>
                </div>
              )}

              {/* Action Buttons & Navigation Controls */}
              <div className="flex flex-col gap-2.5 pt-2 border-t border-outline-variant/50">
                {isSuccess ? (
                  // SUCCESS ACTIONS
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      {canGoBack && onPrevious && (
                        <button
                          onClick={onPrevious}
                          className="flex-1 sm:flex-initial px-4 py-2.5 rounded-lg border border-outline-variant/70 text-on-surface hover:bg-surface-variant transition text-xs font-label-md cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                          <span>Previous Problem</span>
                        </button>
                      )}

                      {onClose && (
                        <button
                          onClick={onClose}
                          className="flex-1 sm:flex-initial px-4 py-2.5 rounded-lg border border-outline-variant/70 text-text-muted hover:text-on-surface hover:bg-surface-variant transition text-xs font-label-md cursor-pointer"
                        >
                          Stay & Review
                        </button>
                      )}
                    </div>

                    {onContinueNext && (
                      <button
                        onClick={onContinueNext}
                        className="w-full sm:w-auto px-6 py-3 rounded-lg bg-primary-container text-on-primary-container hover:brightness-110 active:scale-95 transition-all font-headline-sm text-xs sm:text-sm font-bold shadow-md shadow-primary-container/20 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>{isLastTask ? 'Complete Concept' : 'Next Problem'}</span>
                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                      </button>
                    )}
                  </div>
                ) : (
                  // FAILURE / TRY AGAIN ACTIONS
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      {canGoBack && onPrevious && (
                        <button
                          onClick={onPrevious}
                          className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-lg border border-outline-variant/70 text-on-surface hover:bg-surface-variant transition text-xs font-label-md cursor-pointer flex items-center justify-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                          <span>Prev Problem</span>
                        </button>
                      )}

                      {canGoForward && onContinueNext && (
                        <button
                          onClick={onContinueNext}
                          className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-lg border border-outline-variant/70 text-on-surface hover:bg-surface-variant transition text-xs font-label-md cursor-pointer flex items-center justify-center gap-1"
                        >
                          <span>Next Problem</span>
                          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                        </button>
                      )}

                      {onViewSolution && !expectedSql && (
                        <button
                          onClick={onViewSolution}
                          className="flex-1 sm:flex-initial px-3 py-2.5 rounded-lg text-text-muted hover:text-primary transition text-xs font-label-md cursor-pointer underline"
                        >
                          Show Solution
                        </button>
                      )}
                    </div>

                    <button
                      onClick={onTryAgain || onClose}
                      className="w-full sm:w-auto px-6 py-3 rounded-lg bg-primary-container text-on-primary-container hover:brightness-110 active:scale-95 transition-all font-headline-sm text-xs sm:text-sm font-bold shadow-md shadow-primary-container/20 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                      <span>Try Again</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
