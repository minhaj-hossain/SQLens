'use client';

import React from 'react';
import { Keyboard, X } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutItem {
  keys: string[];
  description: string;
}

const SHORTCUTS: ShortcutItem[] = [
  { keys: ['↵ Enter'], description: 'Continue to next step (when ready)' },
  { keys: ['←', 'Backspace'], description: 'Go to previous step' },
  { keys: ['1', '2', '3'], description: 'Select multiple-choice option' },
  { keys: ['W'], description: 'Toggle "My Words" glossary drawer' },
  { keys: ['H'], description: 'Cycle through hints (Step 1 → 2 → 3)' },
  { keys: ['R'], description: 'Reset current step to initial state' },
  { keys: ['?'], description: 'Open this shortcuts cheatsheet' },
  { keys: ['Esc'], description: 'Close any open modal or drawer' },
];

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-2xl bg-[#121215] border border-white/[0.1] p-5 sm:p-6 shadow-2xl text-zinc-200 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-800/80 border border-white/10 flex items-center justify-center text-blue-400">
              <Keyboard className="w-4 h-4" />
            </div>
            <div>
              <h3 id="shortcuts-modal-title" className="font-semibold text-sm text-zinc-100">
                Keyboard Shortcuts
              </h3>
              <p className="text-[11px] text-zinc-400 font-normal">
                Navigate and interact without leaving your keyboard
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close shortcuts modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Shortcuts list */}
        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
          {SHORTCUTS.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between py-2 px-2.5 rounded-xl bg-[#18181c] border border-white/[0.04] text-xs"
            >
              <span className="text-zinc-300 font-normal">{item.description}</span>
              <div className="flex items-center gap-1.5">
                {item.keys.map((k) => (
                  <kbd
                    key={k}
                    className="px-2 py-0.5 rounded-md bg-zinc-900 border border-white/15 text-zinc-200 font-mono text-[11px] font-semibold shadow-sm"
                  >
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-white/[0.08] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs transition-all shadow-sm active:scale-[0.98] cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
