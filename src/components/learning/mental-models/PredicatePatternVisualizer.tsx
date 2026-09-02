'use client';

import React, { useState } from 'react';
import { Search, CheckCircle2, XCircle, AlertTriangle, HelpCircle } from 'lucide-react';

type Mode = 'LIKE' | 'BETWEEN' | 'NULL';

const SAMPLE_NAMES = ['Alice', 'Bob', 'Charlie', 'David', 'Amanda', 'Alex'];

export const PredicatePatternVisualizer: React.FC<{ conceptId?: string }> = ({ conceptId }) => {
  const initialMode: Mode = conceptId?.toLowerCase().includes('between')
    ? 'BETWEEN'
    : conceptId?.toLowerCase().includes('null')
    ? 'NULL'
    : 'LIKE';
  const [mode, setMode] = useState<Mode>(initialMode);
  const [likePattern, setLikePattern] = useState<string>('A%');
  const [minRange, setMinRange] = useState<number>(20);
  const [maxRange, setMaxRange] = useState<number>(50);

  // LIKE evaluator
  const testLike = (name: string, pattern: string) => {
    try {
      const regexStr = '^' + pattern.replace(/%/g, '.*').replace(/_/g, '.') + '$';
      const regex = new RegExp(regexStr, 'i');
      return regex.test(name);
    } catch {
      return false;
    }
  };

  return (
    <div className="rounded-xl border border-border bg-surface p-5 text-text my-5 shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-border-soft">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-wider text-func font-semibold">
            Mental Model · Pattern Matching & Truth Evaluation
          </span>
          <h3 className="font-display font-semibold text-[17px] text-text mt-0.5">
            Predicate Filtering Engine & The NULL Trap
          </h3>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-1 bg-surface-2 p-1 rounded-lg border border-border text-xs font-mono">
          <button
            onClick={() => setMode('LIKE')}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition cursor-pointer ${
              mode === 'LIKE' ? 'bg-func text-ink' : 'text-text-dim hover:text-text hover:bg-surface-3'
            }`}
          >
            LIKE Wildcards (% / _)
          </button>
          <button
            onClick={() => setMode('BETWEEN')}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition cursor-pointer ${
              mode === 'BETWEEN' ? 'bg-func text-ink' : 'text-text-dim hover:text-text hover:bg-surface-3'
            }`}
          >
            BETWEEN Range
          </button>
          <button
            onClick={() => setMode('NULL')}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition cursor-pointer ${
              mode === 'NULL' ? 'bg-func text-ink' : 'text-text-dim hover:text-text hover:bg-surface-3'
            }`}
          >
            IS NULL Trap
          </button>
        </div>
      </div>

      {/* Mode 1: LIKE Wildcards */}
      {mode === 'LIKE' && (
        <div className="mt-4 space-y-3 font-mono text-xs">
          <p className="text-text-dim leading-relaxed font-sans text-xs">
            In SQL, <code className="text-func font-bold">%</code> matches <strong>zero or more characters</strong>, while <code className="text-func font-bold">_</code> matches <strong>exactly one character</strong>. Test patterns live:
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-text-faint text-[11px]">Quick Patterns:</span>
            {['A%', '%e', 'A___', '%li%'].map((p) => (
              <button
                key={p}
                onClick={() => setLikePattern(p)}
                className={`px-2 py-0.5 rounded border text-[11px] cursor-pointer transition ${
                  likePattern === p ? 'bg-func text-ink border-func' : 'bg-surface-2 border-border text-text-dim hover:text-text'
                }`}
              >
                WHERE name LIKE &apos;{p}&apos;
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
            {SAMPLE_NAMES.map((name) => {
              const matched = testLike(name, likePattern);
              return (
                <div
                  key={name}
                  className={`p-2 rounded border flex items-center justify-between ${
                    matched
                      ? 'bg-success-bg/30 border-success-border text-success-text'
                      : 'bg-surface-2 border-border-soft text-text-faint opacity-50'
                  }`}
                >
                  <span className="font-bold">{name}</span>
                  {matched ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Mode 2: BETWEEN Range Boundaries */}
      {mode === 'BETWEEN' && (
        <div className="mt-4 space-y-3 font-mono text-xs">
          <p className="text-text-dim leading-relaxed font-sans text-xs">
            <strong className="text-text">BETWEEN is fully inclusive</strong>: <code className="text-func font-bold">WHERE price BETWEEN {minRange} AND {maxRange}</code> is identical to writing <code className="text-func">price &gt;= {minRange} AND price &lt;= {maxRange}</code>. Both boundaries are included!
          </p>

          <div className="p-4 rounded-lg bg-surface-2 border border-border space-y-3">
            <div className="flex items-center justify-between text-[11px]">
              <span>Min Price: <strong className="text-func">${minRange}</strong></span>
              <span>Max Price: <strong className="text-func">${maxRange}</strong></span>
            </div>

            {/* Slider bar demonstration */}
            <div className="relative h-2 bg-surface rounded-full overflow-hidden border border-border">
              <div
                className="absolute top-0 bottom-0 bg-func"
                style={{
                  left: `${(minRange / 100) * 100}%`,
                  right: `${100 - (maxRange / 100) * 100}%`,
                }}
              />
            </div>

            <div className="flex justify-between text-[10px] text-text-faint">
              <span>$0 (Excluded)</span>
              <span className="text-func font-bold">${minRange} (INCLUDED)</span>
              <span className="text-func font-bold">${maxRange} (INCLUDED)</span>
              <span>$100 (Excluded)</span>
            </div>
          </div>
        </div>
      )}

      {/* Mode 3: The NULL Three-Valued Logic Trap */}
      {mode === 'NULL' && (
        <div className="mt-4 space-y-3 font-mono text-xs">
          <div className="p-3.5 rounded-lg bg-error-bg/30 border border-error-border space-y-1.5">
            <div className="flex items-center gap-1.5 text-error-text font-bold text-xs">
              <AlertTriangle className="w-4 h-4" />
              <span>The Beginner Trap: WHERE email = NULL Always Returns Zero Rows!</span>
            </div>
            <p className="text-text-dim text-[11.5px] leading-relaxed font-sans">
              In SQL, <code className="text-text font-bold">NULL</code> does not mean zero or an empty string — it means <em>&ldquo;unknown value&rdquo;</em>. Asking if an unknown equals another unknown evaluates to <code className="text-error-text font-bold">UNKNOWN</code>, never <code className="text-success-text font-bold">TRUE</code>.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-success-bg/30 border border-success-border space-y-1.5">
            <div className="flex items-center gap-1.5 text-success-text font-bold text-xs">
              <CheckCircle2 className="w-4 h-4" />
              <span>The Safe Solution: Always Use IS NULL or IS NOT NULL</span>
            </div>
            <div className="p-2 rounded bg-surface border border-border text-[11px]">
              SELECT name, email FROM customers WHERE email <span className="text-func font-bold">IS NULL</span>;
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PredicatePatternVisualizer;
