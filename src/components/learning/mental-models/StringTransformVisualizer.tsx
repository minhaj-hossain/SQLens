'use client';

import React, { useState } from 'react';
import { Type, ArrowRight, Wand2, Sparkles } from 'lucide-react';

export const StringTransformVisualizer: React.FC = () => {
  const [rawInput, setRawInput] = useState<string>('   ALEXANDER_HAMILTON   ');

  const trimmed = rawInput.trim();
  const lowercased = trimmed.toLowerCase();
  const substringPart = lowercased.slice(0, 8);
  const formatted = substringPart.charAt(0).toUpperCase() + substringPart.slice(1);

  return (
    <div className="rounded-xl border border-border bg-surface p-3.5 sm:p-5 text-text my-4 sm:my-5 shadow-sm w-full min-w-0">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 sm:pb-4 border-b border-border-soft min-w-0">
        <div>
          <span className="font-mono text-[10.5px] sm:text-[11px] uppercase tracking-wider text-func font-semibold">
            Mental Model · Data Cleaning & Normalization
          </span>
          <h3 className="font-display font-semibold text-[15px] sm:text-[17px] text-text mt-0.5">
            String Function Assembly Line
          </h3>
        </div>

        <span className="font-mono text-[11px] text-text-dim px-2.5 py-1 rounded-full bg-surface-2 border border-border">
          Interactive Cleaner
        </span>
      </div>

      <p className="text-xs text-text-dim mt-3 leading-relaxed font-sans">
        Real-world databases are full of messy user inputs (extra spaces, inconsistent capitalization). SQL string functions chain together like an assembly line to clean data for reliable filtering and joins:
      </p>

      {/* Interactive Input */}
      <div className="mt-4 font-mono text-xs">
        <label className="text-text-faint text-[10.5px] uppercase tracking-wider block mb-1.5">
          Messy Database Input String:
        </label>
        <input
          type="text"
          value={rawInput}
          onChange={(e) => setRawInput(e.target.value)}
          className="w-full p-2.5 rounded-lg bg-surface-2 border border-border text-text font-mono text-xs focus:outline-none focus:border-func"
          placeholder="Type any messy string..."
        />
      </div>

      {/* The 4-Stage Assembly Line */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4 font-mono text-xs">
        {/* Stage 1: TRIM */}
        <div className="p-3 rounded-lg bg-surface-2 border border-border space-y-1.5">
          <div className="text-func font-bold text-[11px]">1. TRIM(str)</div>
          <div className="p-2 rounded bg-surface border border-border-soft text-text truncate">
            &apos;{trimmed}&apos;
          </div>
          <div className="text-[10px] text-text-faint">Removes leading & trailing padding spaces</div>
        </div>

        {/* Stage 2: LOWER */}
        <div className="p-3 rounded-lg bg-surface-2 border border-border space-y-1.5">
          <div className="text-func font-bold text-[11px]">2. LOWER(str)</div>
          <div className="p-2 rounded bg-surface border border-border-soft text-text truncate">
            &apos;{lowercased}&apos;
          </div>
          <div className="text-[10px] text-text-faint">Ensures case-insensitive matching</div>
        </div>

        {/* Stage 3: SUBSTRING */}
        <div className="p-3 rounded-lg bg-surface-2 border border-border space-y-1.5">
          <div className="text-func font-bold text-[11px]">3. SUBSTRING(str, 1, 8)</div>
          <div className="p-2 rounded bg-surface border border-border-soft text-text truncate">
            &apos;{substringPart}&apos;
          </div>
          <div className="text-[10px] text-text-faint">Extracts prefix substring tokens</div>
        </div>

        {/* Stage 4: CONCAT / Formatting */}
        <div className="p-3 rounded-lg bg-success-bg/30 border border-success-border space-y-1.5">
          <div className="text-success-text font-bold text-[11px] flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>4. CONCAT Result</span>
          </div>
          <div className="p-2 rounded bg-surface border border-border-soft text-success-text font-bold truncate">
            &apos;{formatted}&apos;
          </div>
          <div className="text-[10px] text-text-faint">Ready for reporting and UI presentation</div>
        </div>
      </div>
    </div>
  );
};

export default StringTransformVisualizer;


