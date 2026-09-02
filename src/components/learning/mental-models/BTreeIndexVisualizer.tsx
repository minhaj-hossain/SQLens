'use client';

import React, { useState } from 'react';
import { Gauge, Zap, Search, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const BTreeIndexVisualizer: React.FC = () => {
  const [mode, setMode] = useState<'SCAN' | 'BTREE'>('BTREE');

  return (
    <div className="rounded-xl border border-border bg-surface p-5 text-text my-5 shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-border-soft">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-wider text-func font-semibold">
            Mental Model · Query Optimization & Database Internals
          </span>
          <h3 className="font-display font-semibold text-[17px] text-text mt-0.5">
            B-Tree Index Seek vs Sequential Table Scan
          </h3>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center gap-1 bg-surface-2 p-1 rounded-lg border border-border text-xs font-mono">
          <button
            onClick={() => setMode('SCAN')}
            className={`px-3 py-1 rounded text-[11px] font-semibold transition cursor-pointer ${
              mode === 'SCAN'
                ? 'bg-func text-ink'
                : 'text-text-dim hover:text-text hover:bg-surface-3'
            }`}
          >
            Seq Scan (No Index)
          </button>
          <button
            onClick={() => setMode('BTREE')}
            className={`px-3 py-1 rounded text-[11px] font-semibold transition cursor-pointer ${
              mode === 'BTREE'
                ? 'bg-func text-ink'
                : 'text-text-dim hover:text-text hover:bg-surface-3'
            }`}
          >
            B-Tree Index Seek
          </button>
        </div>
      </div>

      <p className="text-xs text-text-dim mt-3 leading-relaxed">
        Looking up <code className="text-func font-bold">WHERE user_id = 45290</code> across a 1,000,000-row table:
      </p>

      {/* Visual Comparison Stage */}
      <div className="mt-4 p-4 rounded-xl bg-surface-2 border border-border">
        {mode === 'SCAN' ? (
          <div>
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-border-soft">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-error-text">
                <ShieldAlert className="w-4 h-4" />
                <span>Full Table Scan (Brute-Force O(N))</span>
              </div>
              <span className="font-mono text-[11px] text-error-text bg-error-bg border border-error-border px-2 py-0.5 rounded">
                Cost: ~1,000,000 row inspections (124 ms)
              </span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto py-2">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-12 h-14 rounded border flex flex-col items-center justify-center font-mono text-[10px] shrink-0 ${
                    i === 8
                      ? 'bg-func/20 border-func text-text font-bold'
                      : 'bg-surface border-border-soft text-text-faint opacity-50'
                  }`}
                >
                  <span>Block</span>
                  <span className="text-text-dim">#{i * 80}</span>
                </div>
              ))}
              <span className="text-text-faint text-xs font-mono px-2">... 999,900 more blocks</span>
            </div>
            <p className="text-xs text-text-dim mt-2 font-mono">
              The engine reads every physical disk page one-by-one from block 0 to the end, discarding unmatching rows.
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-border-soft">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-success-text">
                <Zap className="w-4 h-4 text-func" />
                <span>B-Tree Tree Traversal (Binary Branching O(log N))</span>
              </div>
              <span className="font-mono text-[11px] text-success-text bg-success-bg border border-success-border px-2 py-0.5 rounded">
                Cost: 3 block reads (0.4 ms)
              </span>
            </div>

            {/* B-Tree Graph Representation */}
            <div className="flex flex-col items-center space-y-3 py-2 font-mono text-xs">
              {/* Root Node */}
              <div className="px-4 py-1.5 rounded-lg bg-surface-3 border border-func text-text font-bold shadow-[0_0_8px_var(--accent-dim)]">
                Root Node [Keys: 25000 | 50000 | 75000]
              </div>
              <div className="text-func text-[11px]">↓ Jump to child [25000 - 50000]</div>

              {/* Intermediate Branch Node */}
              <div className="px-4 py-1.5 rounded-lg bg-surface-3 border border-func/60 text-text">
                Branch Node [Keys: 35000 | 45000 | 48000]
              </div>
              <div className="text-func text-[11px]">↓ Jump to Leaf [45000 - 48000]</div>

              {/* Target Leaf Pointer */}
              <div className="px-4 py-1.5 rounded-lg bg-success-bg border border-success-border text-success-text font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Leaf Page #412 → Row user_id = 45290 Found Instantly!</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BTreeIndexVisualizer;
