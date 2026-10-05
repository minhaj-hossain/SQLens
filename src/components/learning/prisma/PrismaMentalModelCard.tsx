'use client';

import React from 'react';
import { Compass, CheckCircle2, ArrowRightLeft, Terminal, Lightbulb } from 'lucide-react';
import type { PrismaHowToThink } from '../../../types/prisma-curriculum';
import { InlineContent } from '../InlineContent';

interface PrismaMentalModelCardProps {
  howToThink: PrismaHowToThink;
}

export const PrismaMentalModelCard: React.FC<PrismaMentalModelCardProps> = ({ howToThink }) => {
  if (!howToThink) return null;

  return (
    <div className="mt-6 rounded-xl border border-border bg-surface-2/60 p-4 sm:p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 pb-2.5 border-b border-border-soft">
        <Compass className="w-4 h-4 text-func shrink-0" />
        <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-text-dim font-semibold">
          How to think through this
        </span>
      </div>

      {/* Part 1: Bidirectional Sanity Test */}
      {howToThink.bidirectionalCheck && (
        <div className="mb-4">
          <div className="text-[12.5px] font-semibold text-text mb-2 flex items-center gap-1.5">
            <ArrowRightLeft className="w-3.5 h-3.5 text-func" />
            <span>Before you type anything: say the relationship in both directions</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="p-3 rounded-lg bg-surface-1 border border-border-soft flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-func mt-1.5 shrink-0" />
              <div className="text-xs text-text leading-relaxed">
                <span className="font-medium text-text-dim block text-[11px] uppercase tracking-wider mb-0.5">
                  Direction 1
                </span>
                <span className="italic font-medium">
                  "{howToThink.bidirectionalCheck.forward}"
                </span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-surface-1 border border-border-soft flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
              <div className="text-xs text-text leading-relaxed">
                <span className="font-medium text-text-dim block text-[11px] uppercase tracking-wider mb-0.5">
                  Direction 2
                </span>
                <span className="italic font-medium">
                  "{howToThink.bidirectionalCheck.reverse}"
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Part 2: Decision Questions Tree */}
      {howToThink.decisionQuestions && howToThink.decisionQuestions.length > 0 && (
        <div className="space-y-3 mb-4">
          <div className="text-[12.5px] font-semibold text-text flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ask these in order:</span>
          </div>

          <div className="space-y-2">
            {howToThink.decisionQuestions.map((q, idx) => (
              <div
                key={idx}
                className="rounded-lg bg-surface-1/80 border border-border-soft p-3 text-xs leading-relaxed"
              >
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-surface-3 text-text font-mono text-[10.5px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {q.questionNumber || idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-text mb-1">
                      {q.question}
                    </div>
                    <div className="text-text-dim font-normal">
                      <InlineContent text={q.answer} />
                    </div>
                    {q.template && (
                      <div className="mt-2 p-2 rounded bg-editor-bg border border-border-soft font-mono text-[11px] text-emerald-300 overflow-x-auto whitespace-pre">
                        {q.template}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Part 3: Tooling Pro-Tip */}
      {howToThink.toolingTip && (
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-func/5 border border-func/20 text-xs text-text leading-relaxed">
          <Terminal className="w-4 h-4 text-func shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-func mr-1.5">Tooling tip:</span>
            <span className="text-text-dim">
              <InlineContent text={howToThink.toolingTip} />
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
