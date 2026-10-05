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

import { PrismaStepBreakdownCard } from './PrismaStepBreakdownCard';
export { PrismaStepBreakdownCard } from './PrismaStepBreakdownCard';
export { PrismaLittleDetailsCard } from './PrismaLittleDetailsCard';
export { SqlPrismaBridgeCard } from './SqlPrismaBridgeCard';
export { PrismaMentalModelCard } from './PrismaMentalModelCard';
export { PrismaTaskHeaderMeta } from './PrismaTaskHeaderMeta';

/**
 * Interactive stepped visualizer for Prisma query execution theory.
 * Supports Step-by-Step interactive progression and Show All expanded mode.
 */
export const PrismaTheorySteps: React.FC<{ theory: ConceptTheory }> = ({ theory }) => {
  const mentalModel = theory.prisma?.mentalModel;
  const steps = theory.prisma?.stepBreakdowns ?? [];

  // Guard: return null if concept carries no Prisma theory or steps
  if (!mentalModel && steps.length === 0) return null;

  return (
    <div className="mt-6">
      {/* Mental Model Overview */}
      {mentalModel && (
        <p className="p-3 bg-surface-2 rounded-lg border border-border text-text-dim text-[13px] leading-relaxed font-normal mb-4">
          <InlineContent text={mentalModel} />
        </p>
      )}

      {/* Upgraded Step Breakdown with line-level diff highlighting & badges */}
      {steps.length > 0 && (
        <PrismaStepBreakdownCard steps={steps} title="Step-by-step breakdown" />
      )}
    </div>
  );
};
