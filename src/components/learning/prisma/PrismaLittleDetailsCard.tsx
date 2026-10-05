'use client';

import React from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import type { PrismaLittleDetails } from '../../../types/prisma-curriculum';
import { InlineContent } from '../InlineContent';

interface PrismaLittleDetailsCardProps {
  details: PrismaLittleDetails;
}

export const PrismaLittleDetailsCard: React.FC<PrismaLittleDetailsCardProps> = ({ details }) => {
  if (!details || !details.rules || details.rules.length === 0) return null;

  return (
    <div className="mt-6 rounded-xl border border-border bg-surface-2/60 p-4 sm:p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3.5 pb-2.5 border-b border-border-soft">
        <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
        <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-text-dim font-semibold">
          {details.title || 'Syntax Rules & Conventions'}
        </span>
      </div>

      {/* Rules Stack */}
      <div className="space-y-3.5">
        {details.rules.map((rule, idx) => (
          <div
            key={idx}
            className="rounded-lg bg-surface-1/70 border border-border-soft p-3 sm:p-3.5 transition-colors"
          >
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-surface-3 text-text-dim border border-border flex items-center justify-center font-mono text-[10.5px] font-bold shrink-0 mt-0.5">
                {rule.ruleNumber || idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <span className="font-sans text-[13px] font-semibold text-text">
                    {rule.title}
                  </span>
                  {rule.badge && (
                    <span className="px-2 py-0.5 rounded text-[9.5px] font-mono bg-func/10 text-func border border-func/20 font-medium">
                      {rule.badge}
                    </span>
                  )}
                </div>
                <p className="text-[12.5px] leading-relaxed text-text-dim font-sans">
                  <InlineContent text={rule.description} />
                </p>

                {rule.codeSnippet && (
                  <div className="mt-2.5 rounded-md border border-border-soft bg-editor-bg p-2.5 font-mono text-[11.5px] text-editor-text overflow-x-auto whitespace-pre">
                    {rule.codeSnippet}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
