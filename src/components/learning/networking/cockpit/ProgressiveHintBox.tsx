'use client';

import React from 'react';
import { HelpCircle, ChevronRight, X } from 'lucide-react';

interface Hint {
  level: number;
  label?: string;
  text: string;
}

interface ProgressiveHintBoxProps {
  hints?: Hint[];
  hintLevel: number;
  onNextHint: () => void;
  onClose: () => void;
}

export const ProgressiveHintBox: React.FC<ProgressiveHintBoxProps> = ({
  hints,
  hintLevel,
  onNextHint,
  onClose,
}) => {
  if (!hints || hintLevel === 0) return null;

  const currentHint = hints[hintLevel - 1];
  if (!currentHint) return null;

  const isLastHint = hintLevel >= hints.length;

  return (
    <div
      role="region"
      aria-label="Progressive Hint"
      className="p-3.5 sm:p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-200 text-xs sm:text-[13px] leading-relaxed animate-in fade-in duration-200 shadow-sm space-y-2.5"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-semibold text-amber-300 font-mono text-[11px] uppercase tracking-wider">
            {currentHint.label || `Hint ${hintLevel} of ${hints.length}`}
          </span>
          <span className="text-[10px] font-mono text-zinc-500 px-1.5 py-0.5 rounded bg-zinc-900 border border-white/5">
            Step {hintLevel}/{hints.length}
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-md hover:bg-amber-950/40 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
          title="Dismiss hint (Esc)"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <p className="text-zinc-200 font-normal leading-relaxed pl-6">
        {currentHint.text}
      </p>

      <div className="flex items-center justify-between pt-1 pl-6">
        {!isLastHint ? (
          <button
            type="button"
            onClick={onNextHint}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-400 hover:text-amber-300 font-mono cursor-pointer transition-colors"
          >
            <span>Next hint</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <kbd className="text-[9px] px-1 py-0.2 rounded bg-amber-950/60 border border-amber-500/30 text-amber-300 ml-1">
              H
            </kbd>
          </button>
        ) : (
          <span className="text-[11px] text-zinc-500 font-mono">
            Final hint reached
          </span>
        )}

        <button
          type="button"
          onClick={onClose}
          className="text-[11px] text-zinc-400 hover:text-zinc-200 font-mono underline cursor-pointer"
        >
          Hide hint
        </button>
      </div>
    </div>
  );
};
