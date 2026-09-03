'use client';

import React, { useState } from 'react';
import { GitMerge, Layers, ArrowDown, CheckCircle2, ShieldAlert } from 'lucide-react';

export const CtePipelineVisualizer: React.FC = () => {
  const [view, setView] = useState<'CTE' | 'NESTED'>('CTE');

  return (
    <div className="rounded-xl border border-border bg-surface p-3.5 sm:p-5 text-text my-4 sm:my-5 shadow-sm w-full min-w-0">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 sm:pb-4 border-b border-border-soft min-w-0">
        <div className="min-w-0">
          <span className="font-mono text-[10.5px] sm:text-[11px] uppercase tracking-wider text-func font-semibold">
            Mental Model · Query Decomposition & Readability
          </span>
          <h3 className="font-display font-semibold text-[15px] sm:text-[17px] text-text mt-0.5">
            Modular CTE Pipelines vs Nested Bracket Inception
          </h3>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-surface-2 p-1 rounded-lg border border-border text-xs font-mono">
          <button
            onClick={() => setView('CTE')}
            className={`px-3 py-1 rounded text-[11px] font-semibold transition cursor-pointer ${
              view === 'CTE'
                ? 'bg-func text-ink'
                : 'text-text-dim hover:text-text hover:bg-surface-3'
            }`}
          >
            Clean CTE Pipeline (WITH)
          </button>
          <button
            onClick={() => setView('NESTED')}
            className={`px-3 py-1 rounded text-[11px] font-semibold transition cursor-pointer ${
              view === 'NESTED'
                ? 'bg-func text-ink'
                : 'text-text-dim hover:text-text hover:bg-surface-3'
            }`}
          >
            Messy Nested Subquery
          </button>
        </div>
      </div>

      <p className="text-xs text-text-dim mt-3 leading-relaxed font-sans">
        When queries become complex, nesting brackets inside brackets creates cognitive overload. Common Table Expressions (<code className="text-func font-bold">WITH ... AS</code>) let you read and debug queries sequentially from top to bottom:
      </p>

      {/* Visual Content */}
      <div className="mt-4 font-mono text-xs">
        {view === 'CTE' ? (
          <div className="space-y-2.5">
            {/* CTE Step 1 */}
            <div className="p-3 rounded-lg bg-surface-2 border border-border">
              <div className="flex items-center justify-between text-func font-bold pb-1 mb-1 border-b border-border-soft">
                <span>1. WITH CustomerSpending AS (...)</span>
                <span className="text-[10px] text-text-faint font-normal">Step 1: Aggregate totals</span>
              </div>
              <p className="text-[11.5px] text-text-dim font-sans">
                Calculates total revenue per customer. Encapsulates grouping logic into a clean named dataset.
              </p>
            </div>

            <div className="flex justify-center">
              <ArrowDown className="w-4 h-4 text-func" />
            </div>

            {/* CTE Step 2 */}
            <div className="p-3 rounded-lg bg-surface-2 border border-border">
              <div className="flex items-center justify-between text-func font-bold pb-1 mb-1 border-b border-border-soft">
                <span>2. TopTierCustomers AS (...)</span>
                <span className="text-[10px] text-text-faint font-normal">Step 2: Filter VIPs</span>
              </div>
              <p className="text-[11.5px] text-text-dim font-sans">
                Filters <code className="text-text">CustomerSpending</code> for clients with &gt; $1,000 total spend.
              </p>
            </div>

            <div className="flex justify-center">
              <ArrowDown className="w-4 h-4 text-func" />
            </div>

            {/* Final SELECT */}
            <div className="p-3 rounded-lg bg-success-bg/30 border border-success-border">
              <div className="flex items-center gap-1.5 text-success-text font-bold pb-1 mb-1 border-b border-border-soft">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>3. SELECT * FROM TopTierCustomers JOIN ...</span>
              </div>
              <p className="text-[11.5px] text-text-dim font-sans">
                The final query reads like plain English. Clean, maintainable, and easily debugged by teammates.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-lg bg-error-bg/20 border border-error-border space-y-2">
            <div className="flex items-center gap-1.5 text-error-text font-bold text-xs">
              <ShieldAlert className="w-4 h-4" />
              <span>Bracket Inception (The Unmaintainable Anti-Pattern)</span>
            </div>
            <div className="p-3 rounded bg-surface border border-border text-[11px] text-text-dim leading-relaxed">
              SELECT * FROM (SELECT * FROM (SELECT customer_id, SUM(amount) AS total FROM orders GROUP BY customer_id) WHERE total &gt; 1000) AS sub2 JOIN users ON ...
            </div>
            <p className="text-[11.5px] text-text-dim font-sans">
              Notice how this must be read from the inside out. Any syntax error requires counting parenthesis pairs, making maintenance a nightmare.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CtePipelineVisualizer;
