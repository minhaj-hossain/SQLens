import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface SuccessModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  userSql?: string;
  conceptProgressText?: string;
  progressPercent?: number;
  onContinue: () => void;
  onClose: () => void;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  title = 'Correct!',
  message,
  userSql,
  conceptProgressText,
  progressPercent = 100,
  onContinue,
  onClose,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-base/80 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-lg rounded-xl bg-surface-container border border-outline-variant/80 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Green Accent Border */}
            <div className="absolute top-0 left-0 w-full h-1 bg-[#10B981]" />

            <div className="p-6 sm:p-8 flex flex-col gap-5">
              {/* Correct Banner */}
              <div className="w-full flex items-center gap-3 p-4 rounded-lg bg-[#10B981]/15 border border-[#10B981]/30">
                <span
                  className="material-symbols-outlined text-[#10B981] text-[24px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
                <span className="font-headline-sm text-lg font-bold text-[#10B981]">
                  {title}
                </span>
              </div>

              {/* Message if provided */}
              {message && (
                <p className="text-xs sm:text-sm text-on-surface-variant font-body-md leading-relaxed">
                  {message}
                </p>
              )}

              {/* Your Answer Display */}
              {userSql && (
                <div className="flex flex-col gap-2">
                  <span className="font-label-sm text-xs text-text-muted">Your answer:</span>
                  <div className="w-full bg-surface-dim rounded-lg p-3.5 font-label-md text-xs text-primary font-mono border border-outline-variant/70 overflow-x-auto whitespace-pre">
                    <code>{userSql}</code>
                  </div>
                </div>
              )}

              {/* Progress & Review Info */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-2 text-text-muted text-xs font-body-md">
                  <span className="material-symbols-outlined text-[16px]">schedule</span>
                  <span>Next review: 6 days (Interval Spaced)</span>
                </div>

                {conceptProgressText && (
                  <span className="font-label-sm text-xs text-primary font-semibold">
                    {conceptProgressText}
                  </span>
                )}
              </div>

              {/* Action Button */}
              <button
                onClick={onContinue}
                id="modal-continue-btn"
                className="w-full mt-2 bg-primary-container hover:brightness-110 text-on-primary-container font-headline-sm text-sm sm:text-base font-bold py-3.5 rounded-lg transition-all duration-200 active:scale-[0.98] active:ring-2 active:ring-inset active:ring-on-primary/30 flex items-center justify-center gap-2 group cursor-pointer shadow-lg shadow-primary-container/20"
              >
                <span className="relative z-10">Continue</span>
                <span className="material-symbols-outlined relative z-10 group-hover:translate-x-1 transition-transform text-[20px]">
                  arrow_forward
                </span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
