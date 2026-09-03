'use client';

import React, { useState } from 'react';
import { Layers, Combine } from 'lucide-react';

type SetOp = 'UNION' | 'UNION ALL' | 'INTERSECT' | 'EXCEPT';

const SET_A = ['Alice', 'Bob', 'Charlie'];
const SET_B = ['Bob', 'Charlie', 'Diana'];

export const VennSetVisualizer: React.FC = () => {
  const [op, setOp] = useState<SetOp>('UNION');

  const resultItems = React.useMemo(() => {
    if (op === 'UNION') {
      return Array.from(new Set([...SET_A, ...SET_B]));
    }
    if (op === 'UNION ALL') {
      return [...SET_A, ...SET_B];
    }
    if (op === 'INTERSECT') {
      return SET_A.filter((x) => SET_B.includes(x));
    }
    if (op === 'EXCEPT') {
      return SET_A.filter((x) => !SET_B.includes(x));
    }
    return [];
  }, [op]);

  return (
    <div className="rounded-xl border border-border bg-surface p-3.5 sm:p-5 text-text my-4 sm:my-5 shadow-sm w-full min-w-0">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 sm:pb-4 border-b border-border-soft min-w-0">
        <div className="min-w-0">
          <span className="font-mono text-[10.5px] sm:text-[11px] uppercase tracking-wider text-func font-semibold">
            Mental Model · Relational Set Theory
          </span>
          <h3 className="font-display font-semibold text-[15px] sm:text-[17px] text-text mt-0.5">
            Interactive Venn Diagram & Set Operations
          </h3>
        </div>

        {/* Operation Selector */}
        <div className="flex items-center gap-1 bg-surface-2 p-1 rounded-lg border border-border text-xs font-mono">
          {(['UNION', 'UNION ALL', 'INTERSECT', 'EXCEPT'] as SetOp[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setOp(mode)}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition cursor-pointer ${
                op === mode
                  ? 'bg-func text-ink'
                  : 'text-text-dim hover:text-text hover:bg-surface-3'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-text-dim mt-3 leading-relaxed">
        Set operations combine results from two separate SELECT queries with compatible column schemas:
      </p>

      {/* Interactive Venn Diagram Graphics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center mt-4">
        {/* SVG Venn Diagram */}
        <div className="flex flex-col items-center justify-center p-4 bg-surface-2/60 rounded-xl border border-border">
          <svg width="240" height="150" viewBox="0 0 240 150" className="overflow-visible">
            {/* Definitions for clip paths */}
            <defs>
              {/* Left Circle Clip */}
              <clipPath id="clipLeft">
                <circle cx="90" cy="75" r="55" />
              </clipPath>
              {/* Right Circle Clip */}
              <clipPath id="clipRight">
                <circle cx="150" cy="75" r="55" />
              </clipPath>
            </defs>

            {/* Left Circle Base */}
            <circle
              cx="90"
              cy="75"
              r="55"
              fill={op === 'UNION' || op === 'UNION ALL' || op === 'EXCEPT' ? 'var(--func)' : 'transparent'}
              fillOpacity={op === 'EXCEPT' || op === 'UNION' || op === 'UNION ALL' ? 0.25 : 0.05}
              stroke="var(--func)"
              strokeWidth="2"
            />

            {/* Right Circle Base */}
            <circle
              cx="150"
              cy="75"
              r="55"
              fill={op === 'UNION' || op === 'UNION ALL' ? 'var(--func)' : 'transparent'}
              fillOpacity={op === 'UNION' || op === 'UNION ALL' ? 0.25 : 0.05}
              stroke="var(--border-strong)"
              strokeWidth="2"
            />

            {/* Intersection Overlay */}
            {op === 'INTERSECT' && (
              <circle
                cx="90"
                cy="75"
                r="55"
                clipPath="url(#clipRight)"
                fill="var(--func)"
                fillOpacity="0.5"
              />
            )}

            {/* In EXCEPT, un-shade intersection */}
            {op === 'EXCEPT' && (
              <circle
                cx="150"
                cy="75"
                r="55"
                clipPath="url(#clipLeft)"
                fill="var(--ink)"
              />
            )}

            {/* Labels */}
            <text x="65" y="78" fill="var(--text)" fontSize="11" fontFamily="var(--font-mono)" textAnchor="middle">
              Alice
            </text>
            <text x="120" y="70" fill="var(--text)" fontSize="10" fontFamily="var(--font-mono)" textAnchor="middle" fontWeight="bold">
              Bob
            </text>
            <text x="120" y="85" fill="var(--text)" fontSize="10" fontFamily="var(--font-mono)" textAnchor="middle" fontWeight="bold">
              Charlie
            </text>
            <text x="175" y="78" fill="var(--text)" fontSize="11" fontFamily="var(--font-mono)" textAnchor="middle">
              Diana
            </text>

            <text x="90" y="16" fill="var(--func)" fontSize="10" fontFamily="var(--font-mono)" textAnchor="middle" fontWeight="bold">
              SET A (Students)
            </text>
            <text x="150" y="142" fill="var(--text-dim)" fontSize="10" fontFamily="var(--font-mono)" textAnchor="middle" fontWeight="bold">
              SET B (Employees)
            </text>
          </svg>

          <span className="font-mono text-[11px] text-text-faint mt-2">
            {op === 'UNION' && 'All unique items from both sets (Bob & Charlie deduplicated)'}
            {op === 'UNION ALL' && 'All items preserved including duplicates (Bob & Charlie appear twice)'}
            {op === 'INTERSECT' && 'Only items present in BOTH sets simultaneously'}
            {op === 'EXCEPT' && 'Items in Set A that do NOT appear anywhere in Set B'}
          </span>
        </div>

        {/* Output Row Set */}
        <div className="rounded-xl border border-border bg-surface-2 p-4">
          <div className="flex items-center justify-between pb-2 border-b border-border-soft">
            <span className="font-mono text-xs font-bold text-text flex items-center gap-1.5">
              <Combine className="w-4 h-4 text-func" />
              <span>Result: {op}</span>
            </span>
            <span className="font-mono text-[11px] text-func bg-func/10 border border-func/30 px-2 py-0.5 rounded">
              {resultItems.length} rows returned
            </span>
          </div>

          <div className="mt-3 space-y-1.5 font-mono text-xs">
            {resultItems.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded bg-surface border border-border-soft"
              >
                <span className="text-text font-medium">{item}</span>
                <span className="text-[10px] text-text-faint">
                  {SET_A.includes(item) && SET_B.includes(item)
                    ? 'In Both Sets'
                    : SET_A.includes(item)
                    ? 'From Set A'
                    : 'From Set B'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VennSetVisualizer;
