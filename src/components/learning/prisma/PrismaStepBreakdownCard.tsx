'use client';

import React, { useState } from 'react';
import {
  Code,
  Braces,
  Layers,
  Network,
  ChevronLeft,
  ChevronRight,
  Check,
  Sparkles,
  ListOrdered,
  Play,
  MessageSquareQuote,
  Database,
  ArrowRight,
} from 'lucide-react';
import type { PrismaStepBreakdown } from '../../../types/prisma-curriculum';
import { highlightSql } from '../sql-blocks';
import { StepExplanation } from '../TruthEval';
import { InlineContent } from '../InlineContent';

interface PrismaStepBreakdownCardProps {
  steps: PrismaStepBreakdown[];
  title?: string;
}

function getVisualBadge(type?: string, fallbackTitle?: string) {
  switch (type) {
    case 'sql_lens':
      return {
        label: fallbackTitle || 'SQL Lens',
        icon: <Code className="w-3.5 h-3.5 text-func" />,
        badgeClass: 'bg-func/10 text-func border-func/25',
      };
    case 'type_preview':
      return {
        label: fallbackTitle || 'Type Preview',
        icon: <Braces className="w-3.5 h-3.5 text-emerald-400" />,
        badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
      };
    case 'table_diff':
      return {
        label: fallbackTitle || 'Table Diff',
        icon: <Layers className="w-3.5 h-3.5 text-amber-400" />,
        badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
      };
    case 'erd_highlight':
      return {
        label: fallbackTitle || 'ERD Highlight',
        icon: <Network className="w-3.5 h-3.5 text-indigo-400" />,
        badgeClass: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/25',
      };
    default:
      if (!fallbackTitle) return null;
      return {
        label: fallbackTitle,
        icon: <Sparkles className="w-3.5 h-3.5 text-text-faint" />,
        badgeClass: 'bg-surface-3 text-text-dim border-border',
      };
  }
}

/** Formatted Code block with line-level diff highlighting for `// NEW` lines */
function DiffHighlightedCode({
  code,
  isSql = false,
}: {
  code: string;
  isSql?: boolean;
}) {
  const lines = code.split('\n');
  return (
    <div className="font-mono text-[11.5px] sm:text-[12px] leading-relaxed overflow-x-auto">
      {lines.map((rawLine, idx) => {
        const isNew = /\/\/\s*NEW/i.test(rawLine);
        const cleanLine = rawLine.replace(/\/\/\s*NEW/gi, '').trimEnd();

        if (isNew) {
          return (
            <div
              key={idx}
              className="flex items-center justify-between px-2.5 py-0.5 my-0.5 bg-emerald-500/10 border-l-[3px] border-emerald-500 rounded-r text-emerald-300 font-medium transition-colors"
            >
              <span className="flex-1 whitespace-pre">
                {cleanLine}
              </span>
              <span className="ml-2 px-1.5 py-0.2 rounded text-[9.5px] font-bold tracking-wider uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                NEW
              </span>
            </div>
          );
        }

        if (isSql) {
          return (
            <div
              key={idx}
              className="px-2.5 py-0.5 text-editor-text whitespace-pre"
              dangerouslySetInnerHTML={{ __html: highlightSql(rawLine) }}
            />
          );
        }

        return (
          <div key={idx} className="px-2.5 py-0.5 text-editor-text whitespace-pre">
            {rawLine}
          </div>
        );
      })}
    </div>
  );
}

export const PrismaStepBreakdownCard: React.FC<PrismaStepBreakdownCardProps> = ({
  steps,
  title = 'Step-by-step breakdown',
}) => {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'stepper' | 'all'>('stepper');

  if (!steps || steps.length === 0) return null;

  const currentStep = steps[activeStepIndex] || steps[0];
  const currentBadge = currentStep
    ? getVisualBadge(currentStep.visualData?.type, currentStep.visualData?.title)
    : null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (viewMode !== 'stepper' || steps.length <= 1) return;
    if (e.key === 'ArrowRight' && activeStepIndex < steps.length - 1) {
      setActiveStepIndex((prev) => prev + 1);
    } else if (e.key === 'ArrowLeft' && activeStepIndex > 0) {
      setActiveStepIndex((prev) => prev - 1);
    }
  };

  return (
    <div
      className="mt-6"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label="Prisma step-by-step execution breakdown"
    >
      {/* Header with Mode Switcher */}
      <div className="flex items-center justify-between gap-3 mb-3.5 mt-7 first:mt-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-func inline-block shrink-0" />
          <span className="font-mono text-[11px] text-text-faint tracking-[0.07em] uppercase font-semibold">
            {title}
          </span>
        </div>
        {steps.length > 1 && (
          <div className="inline-flex items-center rounded-lg border border-border bg-surface-2 p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('stepper')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors ${
                viewMode === 'stepper'
                  ? 'bg-surface-1 text-func font-semibold shadow-sm'
                  : 'text-text-faint hover:text-text'
              }`}
              aria-pressed={viewMode === 'stepper'}
            >
              <Play className="w-3 h-3" />
              Stepper
            </button>
            <button
              type="button"
              onClick={() => setViewMode('all')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors ${
                viewMode === 'all'
                  ? 'bg-surface-1 text-func font-semibold shadow-sm'
                  : 'text-text-faint hover:text-text'
              }`}
              aria-pressed={viewMode === 'all'}
            >
              <ListOrdered className="w-3 h-3" />
              All Steps
            </button>
          </div>
        )}
      </div>

      {/* Stepper Mode: Interactive timeline + Single active step */}
      {viewMode === 'stepper' && steps.length > 0 && currentStep && (
        <div className="space-y-4">
          {/* Horizontal Timeline (shown if >= 2 steps) */}
          {steps.length > 1 && (
            <div className="relative py-2 px-1">
              <div className="absolute top-1/2 left-6 right-6 -translate-y-1/2 h-0.5 bg-border pointer-events-none" />
              <div
                className="absolute top-1/2 left-6 -translate-y-1/2 h-0.5 bg-func/50 transition-all duration-300 pointer-events-none"
                style={{
                  width: `${(activeStepIndex / (steps.length - 1)) * 100}%`,
                  maxWidth: 'calc(100% - 3rem)',
                }}
              />

              <div className="relative flex items-center justify-between">
                {steps.map((step, idx) => {
                  const isActive = idx === activeStepIndex;
                  const isPast = idx < activeStepIndex;
                  const cleanTitle = step.stepTitle.replace(/^Step\s*\d*:\s*/i, '');
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveStepIndex(idx)}
                      className="group flex flex-col items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-func rounded-lg p-1 transition-all"
                      title={`Step ${idx + 1}: ${cleanTitle}`}
                      aria-label={`Step ${idx + 1}: ${cleanTitle}`}
                      aria-current={isActive ? 'step' : undefined}
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all duration-200 z-10 ${
                          isActive
                            ? 'bg-func text-ink shadow-md shadow-func/20 ring-4 ring-func/20 scale-110'
                            : isPast
                              ? 'bg-surface-3 text-func border border-func/40 hover:border-func hover:scale-105'
                              : 'bg-surface-2 text-text-faint border border-border hover:border-text-dim hover:text-text'
                        }`}
                      >
                        {isPast ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : idx + 1}
                      </div>
                      <span
                        className={`mt-1.5 text-[10.5px] max-w-[80px] sm:max-w-[120px] truncate text-center transition-colors hidden sm:block ${
                          isActive
                            ? 'text-text font-semibold'
                            : isPast
                              ? 'text-text-dim'
                              : 'text-text-faint'
                        }`}
                      >
                        {cleanTitle}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Active Step Card */}
          <div className="rounded-xl border border-border bg-editor-bg shadow-sm overflow-hidden transition-all">
            {/* Step Top Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 bg-surface-2/60 border-b border-border-soft">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-mono text-[11px] font-bold text-text-faint uppercase tracking-wider shrink-0">
                  Step {activeStepIndex + 1}
                </span>
                <span className="text-text-faint text-xs">•</span>
                <span className="font-mono text-[12px] font-semibold text-text truncate">
                  {currentStep.stepTitle.replace(/^Step\s*\d*:\s*/i, '')}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {currentStep.isPhysicalColumn && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/15 text-blue-400 border border-blue-500/30">
                    <Database className="w-3 h-3" />
                    Physical Column
                  </span>
                )}
                {currentStep.isVirtualRelation && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/15 text-purple-300 border border-purple-500/30">
                    <ArrowRight className="w-3 h-3" />
                    Virtual Relation
                  </span>
                )}
                {currentBadge && (
                  <span
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono border font-medium ${currentBadge.badgeClass}`}
                  >
                    {currentBadge.icon}
                    {currentBadge.label}
                  </span>
                )}
              </div>
            </div>

            {/* Conversational Sentence Translation Callout */}
            {currentStep.sentenceReading && (
              <div className="flex items-start gap-2.5 px-3.5 py-2.5 bg-surface-2/40 border-b border-border-soft text-text text-xs leading-relaxed">
                <MessageSquareQuote className="w-4 h-4 text-func shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-func mr-1.5">How to read this:</span>
                  <span className="italic text-text-dim">"{currentStep.sentenceReading}"</span>
                </div>
              </div>
            )}

            {/* Code Snippet with Line-level Diff Highlighting */}
            {currentStep.codeSnippet && (
              <div className="p-3 sm:p-4 bg-editor-bg border-b border-border-soft overflow-x-auto">
                <DiffHighlightedCode
                  code={currentStep.codeSnippet}
                  isSql={currentStep.visualData?.type === 'sql_lens'}
                />
              </div>
            )}

            {/* Explanation */}
            {currentStep.explanation && (
              <div className="p-3 sm:p-4 bg-surface-1/40">
                <StepExplanation text={currentStep.explanation} />
              </div>
            )}
          </div>

          {/* Navigation Controls */}
          {steps.length > 1 && (
            <div className="flex items-center justify-between gap-3 pt-1">
              <button
                type="button"
                disabled={activeStepIndex === 0}
                onClick={() => setActiveStepIndex((i) => Math.max(0, i - 1))}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-surface-2 text-text text-xs font-medium hover:bg-surface-3 hover:border-text-dim disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                aria-label="Previous step"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              <span className="font-mono text-[11px] text-text-faint">
                Step {activeStepIndex + 1} of {steps.length}
              </span>

              <button
                type="button"
                disabled={activeStepIndex === steps.length - 1}
                onClick={() => setActiveStepIndex((i) => Math.min(steps.length - 1, i + 1))}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-surface-2 text-text text-xs font-medium hover:bg-surface-3 hover:border-text-dim disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                aria-label="Next step"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* All Steps View */}
      {viewMode === 'all' && (
        <div className="space-y-4">
          {steps.map((step, sIdx) => {
            const badge = getVisualBadge(step.visualData?.type, step.visualData?.title);
            return (
              <div
                key={sIdx}
                className="rounded-xl border border-border bg-editor-bg shadow-sm overflow-hidden"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 bg-surface-2/60 border-b border-border-soft">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-surface-3 text-text-dim flex items-center justify-center font-mono text-[10px] font-semibold shrink-0">
                      {step.stepNumber}
                    </span>
                    <span className="font-mono text-[12px] font-semibold text-text truncate">
                      {step.stepTitle.replace(/^Step\s*\d*:\s*/i, '')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {step.isPhysicalColumn && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/15 text-blue-400 border border-blue-500/30">
                        <Database className="w-3 h-3" />
                        Physical Column
                      </span>
                    )}
                    {step.isVirtualRelation && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/15 text-purple-300 border border-purple-500/30">
                        <ArrowRight className="w-3 h-3" />
                        Virtual Relation
                      </span>
                    )}
                    {badge && (
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono border font-medium ${badge.badgeClass}`}
                      >
                        {badge.icon}
                        {badge.label}
                      </span>
                    )}
                  </div>
                </div>

                {step.sentenceReading && (
                  <div className="flex items-start gap-2.5 px-3.5 py-2.5 bg-surface-2/40 border-b border-border-soft text-text text-xs leading-relaxed">
                    <MessageSquareQuote className="w-4 h-4 text-func shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-func mr-1.5">How to read this:</span>
                      <span className="italic text-text-dim">"{step.sentenceReading}"</span>
                    </div>
                  </div>
                )}

                {step.codeSnippet && (
                  <div className="p-3 sm:p-4 bg-editor-bg border-b border-border-soft overflow-x-auto">
                    <DiffHighlightedCode
                      code={step.codeSnippet}
                      isSql={step.visualData?.type === 'sql_lens'}
                    />
                  </div>
                )}

                {step.explanation && (
                  <div className="p-3 sm:p-4 bg-surface-1/40">
                    <StepExplanation text={step.explanation} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
