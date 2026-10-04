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
} from 'lucide-react';
import type { ConceptTheory } from '../../../types/curriculum';
import { highlightSql } from '../sql-blocks';
import { StepExplanation } from '../TruthEval';
import { InlineContent } from '../InlineContent';

/**
 * P2.1 & Phase 5 — renders `theory.prisma` content on the concept lesson:
 * 1. Hero call (call → SQL target).
 * 2. Mental model + Interactive stepped timeline (PrismaTheorySteps).
 *
 * Both components return `null` when the concept carries no Prisma theory,
 * ensuring 100% byte-isolation and zero regressions for the SQL track.
 */

/** Visual badge & icon helper for theory steps */
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

/** The hero call — shown above the generated-SQL target card (call → SQL). */
export const PrismaTheoryHero: React.FC<{ theory: ConceptTheory }> = ({ theory }) => {
  const hero = theory.prisma?.targetHero;
  if (!hero) return null;
  return (
    <div className="mt-6">
      <div className="w-full min-w-0 rounded-xl overflow-hidden border border-border bg-editor-bg shadow-sm">
        <div className="flex items-center justify-between gap-3 px-3.5 py-2 border-b border-border-soft min-w-0">
          <span className="font-mono text-[10.5px] uppercase tracking-[0.05em] text-text-faint truncate min-w-0">
            {hero.badge || 'The Prisma call we dissect'}
          </span>
          <span className="font-mono text-[10px] text-text-faint shrink-0">{hero.language}</span>
        </div>
        <pre className="px-3.5 sm:px-4 py-3 sm:py-3.5 font-mono text-[12px] sm:text-[13px] leading-[1.7] sm:leading-[1.8] text-editor-text whitespace-pre overflow-x-auto w-full min-w-0">
          {hero.code}
        </pre>
        {hero.explanation && (
          <div className="px-3.5 sm:px-4 pb-3 text-xs leading-relaxed text-text-dim">
            <InlineContent text={hero.explanation} />
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Interactive stepped visualizer for Prisma query execution theory.
 * Supports Step-by-Step interactive progression and Show All expanded mode.
 */
export const PrismaTheorySteps: React.FC<{ theory: ConceptTheory }> = ({ theory }) => {
  const mentalModel = theory.prisma?.mentalModel;
  const steps = theory.prisma?.stepBreakdowns ?? [];
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'stepper' | 'all'>('stepper');

  // Guard: return null if concept carries no Prisma theory or steps
  if (!mentalModel && steps.length === 0) return null;

  const currentStep = steps[activeStepIndex] || steps[0];
  const currentBadge = currentStep ? getVisualBadge(currentStep.visualData?.type, currentStep.visualData?.title) : null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (viewMode !== 'stepper' || steps.length <= 1) return;
    if (e.key === 'ArrowRight' && activeStepIndex < steps.length - 1) {
      setActiveStepIndex(prev => prev + 1);
    } else if (e.key === 'ArrowLeft' && activeStepIndex > 0) {
      setActiveStepIndex(prev => prev - 1);
    }
  };

  return (
    <div className="mt-6" tabIndex={0} onKeyDown={handleKeyDown} aria-label="Prisma query execution stepper">
      {/* Header with Mode Switcher */}
      <div className="flex items-center justify-between gap-3 mb-3.5 mt-7 first:mt-0">
        <div className="font-mono text-[11px] text-text-faint tracking-[0.07em] uppercase">
          How Prisma executes this call
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

      {/* Mental Model Overview */}
      {mentalModel && (
        <p className="p-3 bg-surface-2 rounded-lg border border-border text-text-dim text-[13px] leading-relaxed font-normal mb-4">
          <InlineContent text={mentalModel} />
        </p>
      )}

      {/* Stepper Mode: Interactive timeline + Single active step + Playback */}
      {viewMode === 'stepper' && steps.length > 0 && currentStep && (
        <div className="space-y-4">
          {/* Horizontal Timeline (shown if >= 2 steps) */}
          {steps.length > 1 && (
            <div className="relative py-2 px-1">
              {/* Background Connecting Line */}
              <div className="absolute top-1/2 left-6 right-6 -translate-y-1/2 h-0.5 bg-border pointer-events-none" />
              {/* Progress Line */}
              <div
                className="absolute top-1/2 left-6 -translate-y-1/2 h-0.5 bg-func/50 transition-all duration-300 pointer-events-none"
                style={{
                  width: `${(activeStepIndex / (steps.length - 1)) * 100}%`,
                  maxWidth: 'calc(100% - 3rem)',
                }}
              />

              {/* Step Nodes */}
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
                          isActive ? 'text-text font-semibold' : isPast ? 'text-text-dim' : 'text-text-faint'
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
              {currentBadge && (
                <span
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono border font-medium ${currentBadge.badgeClass}`}
                >
                  {currentBadge.icon}
                  {currentBadge.label}
                </span>
              )}
            </div>

            {/* Code Snippet */}
            {currentStep.codeSnippet && (
              <div className="p-3 sm:p-4 bg-editor-bg border-b border-border-soft overflow-x-auto">
                {currentStep.visualData?.type === 'sql_lens' ? (
                  <pre
                    className="font-mono text-[11.5px] sm:text-[12px] text-editor-text leading-relaxed whitespace-pre-wrap break-words"
                    dangerouslySetInnerHTML={{ __html: highlightSql(currentStep.codeSnippet) }}
                  />
                ) : (
                  <pre className="font-mono text-[11.5px] sm:text-[12px] text-editor-text leading-relaxed whitespace-pre-wrap break-words">
                    {currentStep.codeSnippet}
                  </pre>
                )}
              </div>
            )}

            {/* Explanation */}
            {currentStep.explanation && (
              <div className="p-3 sm:p-4 bg-surface-1/40">
                <StepExplanation text={currentStep.explanation} />
              </div>
            )}
          </div>

          {/* Playback Navigation (shown if >= 2 steps) */}
          {steps.length > 1 && (
            <div className="flex items-center justify-between gap-3 pt-1">
              <button
                type="button"
                disabled={activeStepIndex === 0}
                onClick={() => setActiveStepIndex(i => Math.max(0, i - 1))}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-surface-2 text-text text-xs font-medium hover:bg-surface-3 hover:border-text-dim disabled:opacity-40 disabled:pointer-events-none transition-colors"
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
                onClick={() => setActiveStepIndex(i => Math.min(steps.length - 1, i + 1))}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-surface-2 text-text text-xs font-medium hover:bg-surface-3 hover:border-text-dim disabled:opacity-40 disabled:pointer-events-none transition-colors"
                aria-label="Next step"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* All Steps View: Expanded list of cards */}
      {viewMode === 'all' && (
        <div className="space-y-4">
          {steps.map((step, sIdx) => {
            const badge = getVisualBadge(step.visualData?.type, step.visualData?.title);
            return (
              <div key={sIdx} className="rounded-xl border border-border bg-editor-bg shadow-sm overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 bg-surface-2/60 border-b border-border-soft">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-surface-3 text-text-dim flex items-center justify-center font-mono text-[10px] font-semibold shrink-0">
                      {step.stepNumber}
                    </span>
                    <span className="font-mono text-[12px] font-semibold text-text truncate">
                      {step.stepTitle.replace(/^Step\s*\d*:\s*/i, '')}
                    </span>
                  </div>
                  {badge && (
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono border font-medium ${badge.badgeClass}`}
                    >
                      {badge.icon}
                      {badge.label}
                    </span>
                  )}
                </div>

                {step.codeSnippet && (
                  <div className="p-3 sm:p-4 bg-editor-bg border-b border-border-soft overflow-x-auto">
                    {step.visualData?.type === 'sql_lens' ? (
                      <pre
                        className="font-mono text-[11.5px] sm:text-[12px] text-editor-text leading-relaxed whitespace-pre-wrap break-words"
                        dangerouslySetInnerHTML={{ __html: highlightSql(step.codeSnippet) }}
                      />
                    ) : (
                      <pre className="font-mono text-[11.5px] sm:text-[12px] text-editor-text leading-relaxed whitespace-pre-wrap break-words">
                        {step.codeSnippet}
                      </pre>
                    )}
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
