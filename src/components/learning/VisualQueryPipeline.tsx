import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';

interface VisualQueryPipelineProps {
  initialQuery?: string;
  tableName?: string;
  selectedColumns?: string[];
}

export const VisualQueryPipeline: React.FC<VisualQueryPipelineProps> = ({
  initialQuery = 'SELECT name, price FROM products LIMIT 3;',
  tableName = 'products',
  selectedColumns = ['name', 'price'],
}) => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const steps = [
    {
      id: 'from',
      label: '1. FROM',
      icon: 'database',
      sql: `FROM ${tableName}`,
      explanation: `Database engine reads table '${tableName}', loading disk records into memory buffers.`,
    },
    {
      id: 'where',
      label: '2. WHERE',
      icon: 'filter_alt',
      sql: 'WHERE (Predicates)',
      explanation: 'Filters rows sequentially according to boolean expressions before projecting columns.',
    },
    {
      id: 'select',
      label: '3. SELECT',
      icon: 'view_column',
      sql: `SELECT ${selectedColumns.join(', ')}`,
      explanation: `Extracts requested columns [${selectedColumns.join(', ')}] and computes expressions or aliases.`,
    },
    {
      id: 'limit',
      label: '4. LIMIT',
      icon: 'content_cut',
      sql: 'LIMIT 3',
      explanation: 'Restricts the returned result rows to the specified upper bound.',
    },
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setActiveStep((prev) => (prev + 1) % steps.length);
      }, 2400);
    }
    return () => clearInterval(interval);
  }, [isPlaying, steps.length]);

  return (
    <div className="rounded-xl border border-outline-variant/70 bg-surface-container p-4 space-y-4 shadow-sm">
      {/* Step Tabs & Play Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {steps.map((step, idx) => {
            const isActive = idx === activeStep;
            return (
              <button
                key={step.id}
                onClick={() => {
                  setActiveStep(idx);
                  setIsPlaying(false);
                }}
                className={`rounded-lg px-2.5 py-1 text-xs font-label-sm transition cursor-pointer ${
                  isActive
                    ? 'bg-surface-base text-primary-container border border-primary-container font-medium'
                    : 'text-text-muted hover:text-on-surface hover:bg-surface-base/50'
                }`}
              >
                {step.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1 rounded bg-surface-base px-2.5 py-1 font-label-sm text-[11px] text-on-surface border border-outline-variant hover:bg-surface-variant transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-[14px]">
              {isPlaying ? 'pause' : 'play_arrow'}
            </span>
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </button>
          <button
            onClick={() => {
              setActiveStep(0);
              setIsPlaying(false);
            }}
            className="rounded bg-surface-base p-1 text-text-muted border border-outline-variant hover:text-on-surface cursor-pointer"
            title="Reset"
          >
            <span className="material-symbols-outlined text-[14px]">restart_alt</span>
          </button>
        </div>
      </div>

      {/* Active Step Visual Explainer */}
      <div className="rounded-lg border border-outline-variant/60 bg-surface-dim p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary-container font-label-md text-xs font-medium">
            <span className="material-symbols-outlined text-[18px]">{steps[activeStep].icon}</span>
            <span>{steps[activeStep].label} Step Transformation</span>
          </div>
          <span className="text-[11px] font-mono text-text-muted">
            Step {activeStep + 1} of 4
          </span>
        </div>

        <div className="rounded bg-surface-base p-2.5 font-mono text-xs text-primary border border-outline-variant/60">
          {steps[activeStep].sql}
        </div>

        <p className="text-xs text-on-surface/80 leading-relaxed font-body-md">
          {steps[activeStep].explanation}
        </p>
      </div>
    </div>
  );
};
