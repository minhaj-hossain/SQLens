'use client';

import React from 'react';
import type { ConceptTheory } from '../../../types/curriculum';
import { highlightSql } from '../sql-blocks';
import { StepExplanation } from '../TruthEval';
import { InlineContent } from '../InlineContent';

/**
 * P2.1 — renders `theory.prisma` content on the concept lesson (hero call,
 * mental model, genuine call → SQL → type steps). Both halves are Prisma-only:
 * they return `null` when the concept carries no Prisma theory, so every SQL
 * lesson renders exactly as before.
 */

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="font-mono text-[11px] text-text-faint tracking-[0.07em] uppercase mb-3.5 mt-7 first:mt-0">
    {children}
  </div>
);

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
 * The mental model + genuine steps. `visualData.type` drives the snippet
 * treatment: `sql_lens` snippets get SQL highlighting, everything else renders
 * as plain mono (TypeScript calls, inferred types).
 */
export const PrismaTheorySteps: React.FC<{ theory: ConceptTheory }> = ({ theory }) => {
  const mentalModel = theory.prisma?.mentalModel;
  const steps = theory.prisma?.stepBreakdowns ?? [];
  if (!mentalModel && steps.length === 0) return null;
  return (
    <div className="mt-6">
      <Label>How Prisma executes this call</Label>
      {mentalModel && (
        <p className="p-3 bg-surface-2 rounded-lg border border-border text-text-dim text-[13px] leading-relaxed font-normal mb-4">
          <InlineContent text={mentalModel} />
        </p>
      )}
      <div className="space-y-4">
        {steps.map((step, sIdx) => (
          <div key={sIdx} className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
              <div className="inline-flex items-center gap-2 font-mono text-[12px] font-semibold text-text">
                <span className="w-[18px] h-[18px] rounded-full bg-surface-3 text-text-dim flex items-center justify-center text-[10px] shrink-0">
                  {step.stepNumber}
                </span>
                <span>{step.stepTitle.replace(/^Step\s*\d*:\s*/i, '')}</span>
              </div>
              {step.visualData?.title && (
                <span className="font-mono text-[10px] uppercase tracking-wide text-text-faint">
                  {step.visualData.title}
                </span>
              )}
            </div>
            {step.codeSnippet &&
              (step.visualData?.type === 'sql_lens' ? (
                <pre
                  className="font-mono text-[11.5px] text-editor-text bg-editor-bg border border-border rounded-lg px-3 py-2 overflow-x-auto whitespace-pre-wrap break-words"
                  dangerouslySetInnerHTML={{ __html: highlightSql(step.codeSnippet) }}
                />
              ) : (
                <pre className="font-mono text-[11.5px] text-editor-text bg-editor-bg border border-border rounded-lg px-3 py-2 overflow-x-auto whitespace-pre-wrap break-words">
                  {step.codeSnippet}
                </pre>
              ))}
            {step.explanation && <StepExplanation text={step.explanation} />}
          </div>
        ))}
      </div>
    </div>
  );
};
