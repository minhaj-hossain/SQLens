'use client';

import React, { useState } from 'react';
import { Target, Layers, ShieldCheck, CheckCircle2, Award } from 'lucide-react';

export const InterviewWhiteboardVisualizer: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(1);

  return (
    <div className="rounded-xl border border-border bg-surface p-3.5 sm:p-5 text-text my-4 sm:my-5 shadow-sm w-full min-w-0">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 sm:pb-4 border-b border-border-soft min-w-0">
        <div>
          <span className="font-mono text-[10.5px] sm:text-[11px] uppercase tracking-wider text-func font-semibold">
            Mental Model · Technical Interview Whiteboard Framework
          </span>
          <h3 className="font-display font-semibold text-[15px] sm:text-[17px] text-text mt-0.5">
            The 3-Step Production Query Blueprint
          </h3>
        </div>

        <div className="flex items-center gap-1.5 font-mono text-xs text-func font-bold">
          <Award className="w-4 h-4" />
          <span>FAANG / Top-Tier Standard</span>
        </div>
      </div>

      <p className="text-xs text-text-dim mt-3 leading-relaxed font-sans">
        In technical interviews, strong candidates don&apos;t immediately rush into typing SQL. They systematically break down the problem into three structured stages:
      </p>

      {/* Stepper Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-4 font-mono text-xs">
        <button
          onClick={() => setActiveStep(1)}
          className={`p-3 rounded-lg border text-left transition cursor-pointer ${
            activeStep === 1
              ? 'bg-surface-2 border-func shadow-[0_0_10px_var(--accent-dim)]'
              : 'bg-surface-2/60 border-border text-text-dim hover:bg-surface-2'
          }`}
        >
          <div className="flex items-center gap-1.5 text-func font-bold mb-1">
            <Target className="w-4 h-4" />
            <span>Step 1: Schema Alignment</span>
          </div>
          <span className="text-[11px] text-text-faint">Input tables $\to$ Output shape</span>
        </button>

        <button
          onClick={() => setActiveStep(2)}
          className={`p-3 rounded-lg border text-left transition cursor-pointer ${
            activeStep === 2
              ? 'bg-surface-2 border-func shadow-[0_0_10px_var(--accent-dim)]'
              : 'bg-surface-2/60 border-border text-text-dim hover:bg-surface-2'
          }`}
        >
          <div className="flex items-center gap-1.5 text-func font-bold mb-1">
            <Layers className="w-4 h-4" />
            <span>Step 2: Relational Path</span>
          </div>
          <span className="text-[11px] text-text-faint">Joins & Aggregations</span>
        </button>

        <button
          onClick={() => setActiveStep(3)}
          className={`p-3 rounded-lg border text-left transition cursor-pointer ${
            activeStep === 3
              ? 'bg-surface-2 border-func shadow-[0_0_10px_var(--accent-dim)]'
              : 'bg-surface-2/60 border-border text-text-dim hover:bg-surface-2'
          }`}
        >
          <div className="flex items-center gap-1.5 text-func font-bold mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Step 3: Edge Case Shield</span>
          </div>
          <span className="text-[11px] text-text-faint">NULLs, ties & empty sets</span>
        </button>
      </div>

      {/* Step Explanation Card */}
      <div className="mt-4 p-4 rounded-xl bg-surface-2 border border-border font-mono text-xs space-y-2">
        {activeStep === 1 && (
          <div>
            <div className="text-func font-bold mb-1 text-[13px]">
              Step 1: Establish Input Tables and Expected Output Grain
            </div>
            <p className="text-text-dim text-xs font-sans leading-relaxed">
              Always state the desired output grain before writing syntax. Ask: <em>&ldquo;Is the result 1 row per customer, 1 row per order, or 1 row per department?&rdquo;</em> Identifying the grain immediately tells you which columns belong in <code className="text-func">GROUP BY</code> or window partitions.
            </p>
          </div>
        )}

        {activeStep === 2 && (
          <div>
            <div className="text-func font-bold mb-1 text-[13px]">
              Step 2: Choose Safe Join Types and Window Metrics
            </div>
            <p className="text-text-dim text-xs font-sans leading-relaxed">
              Decide between <code className="text-func">INNER JOIN</code> and <code className="text-func">LEFT JOIN</code> based on whether inactive/zero-order entities must appear. If ranking within groups is needed (e.g. &ldquo;top 3 products per category&rdquo;), reach for <code className="text-func">DENSE_RANK() OVER (PARTITION BY ...)</code> rather than unscalable self-joins.
            </p>
          </div>
        )}

        {activeStep === 3 && (
          <div>
            <div className="text-func font-bold mb-1 text-[13px]">
              Step 3: Defensive SQL & Production Hardening
            </div>
            <p className="text-text-dim text-xs font-sans leading-relaxed">
              Interviewers look for defensive instincts: Did you handle division by zero using <code className="text-func">NULLIF(denominator, 0)</code>? Did you use <code className="text-func">COALESCE()</code> for null fallback values? Did you guard against Cartesian fanout duplicates with <code className="text-func">COUNT(DISTINCT ...)</code>?
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewWhiteboardVisualizer;


