'use client';
/**
 * TruthEval — visual cards for boolean-evaluation content that curriculum
 * modules write as plain text (`TRUE AND TRUE ---> TRUE ✓`,
 * `Rahim: (CSE = TRUE) AND (21 = TRUE) → TRUE ✓`). Replaces the unreadable
 * run-on text with scannable rows: operand chips, gold operators, and
 * verdict badges (gold = TRUE, error red = FALSE, gray = UNKNOWN).
 */

import React from 'react';
import Icon from '@/components/ui/Icon';
import type { EvalBlock, EvalRow, SubjectRow, TruthRow, Verdict } from '../../lib/parse-truth-eval';
import { parseEvalLine } from '../../lib/parse-truth-eval';
import { InlineContent } from './InlineContent';

const VERDICT_STYLES: Record<Verdict, string> = {
  TRUE: 'bg-func/10 text-func border-func/30',
  FALSE: 'bg-error/10 text-error border-error/30',
  UNKNOWN: 'bg-surface-3 text-text-dim border-border',
};

const VERDICT_MARK: Record<Verdict, string> = {
  TRUE: '✓',
  FALSE: '✕',
  UNKNOWN: '?',
};

/** Verdict badge — the row's pass/fail outcome. */
const VerdictBadge: React.FC<{ verdict: Verdict; mark: string | null; className?: string }> = ({
  verdict,
  mark,
  className = '',
}) => (
  <span
    className={`inline-flex items-center gap-1.5 shrink-0 font-mono text-[11px] font-semibold px-2.5 py-1 rounded-full border ${VERDICT_STYLES[verdict]} ${className}`}
  >
    <span aria-hidden>{mark ?? VERDICT_MARK[verdict]}</span>
    <span>{verdict}</span>
  </span>
);

/** Mono chip for operands / expressions. */
const Chip: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <code className="font-mono text-[10.5px] sm:text-[11.5px] text-text bg-surface-3 border border-border-soft rounded px-1.5 py-0.5 break-all sm:break-normal max-w-full">
    {children}
  </code>
);

/** Expression text with AND/OR/NOT operators accented in gold. */
const ExprText: React.FC<{ text: string }> = ({ text }) => {
  const parts = text.split(/\b(AND|OR|NOT)\b/);
  return (
    <>
      {parts.map((part, i) =>
        part === 'AND' || part === 'OR' || part === 'NOT' ? (
          <span key={i} className="text-func font-bold">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
};

const Arrow: React.FC = () => (
  <Icon name="arrow_forward" className="text-[13px] text-text-faint shrink-0" />
);

/** Truth-table row: TRUE AND FALSE → FALSE ✕ */
const TruthRowView: React.FC<{ row: TruthRow }> = ({ row }) => (
  <div className="flex flex-wrap items-center gap-2 px-4 py-2.5">
    {row.op === 'NOT' ? (
      <>
        <span className="font-mono text-[10px] font-bold text-func tracking-widest">NOT</span>
        <Chip>{row.left}</Chip>
      </>
    ) : (
      <>
        <Chip>{row.left}</Chip>
        <span className="font-mono text-[10px] font-bold text-func tracking-widest">{row.op}</span>
        <Chip>{row.right}</Chip>
      </>
    )}
    <Arrow />
    <VerdictBadge verdict={row.verdict} mark={row.mark} className="ml-auto sm:ml-0" />
  </div>
);

/** Subject row: Rahim (CSE = TRUE) AND (21 = TRUE) → TRUE ✓ */
const SubjectRowView: React.FC<{ row: SubjectRow }> = ({ row }) => (
  <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 px-3.5 py-2.5">
    {row.index !== null && (
      <span className="w-4 font-mono text-[10px] text-text-faint shrink-0">{row.index}</span>
    )}
    <span className="text-[13px] font-semibold text-text">{row.subject}</span>
    {row.chain.length > 0 && (
      <span className="flex flex-wrap items-center gap-1.5 min-w-0">
        {row.chain.map((seg, i) => (
          <React.Fragment key={i}>
            {i > 0 && <Arrow />}
            <Chip>
              <ExprText text={seg} />
            </Chip>
          </React.Fragment>
        ))}
      </span>
    )}
    <VerdictBadge verdict={row.verdict} mark={row.mark} className="ml-auto" />
  </div>
);

/** The grouped card: optional label header + divided rows. */
export const TruthEvalBlock: React.FC<{ rows: EvalRow[]; label?: string | null }> = ({
  rows,
  label,
}) => (
  <div className="rounded-xl border border-border bg-surface-2 overflow-hidden">
    {label && (
      <div className="px-4 py-2 border-b border-border-soft font-mono text-[10px] uppercase tracking-wider text-text-faint">
        {label}
      </div>
    )}
    <div className="divide-y divide-border-soft">
      {rows.map((row, i) =>
        row.kind === 'truth' ? (
          <TruthRowView key={i} row={row} />
        ) : (
          <SubjectRowView key={i} row={row} />
        ),
      )}
    </div>
  </div>
);

/**
 * Render a parsed explanation item that is an evaluation block:
 * optional heading + visual rows + any leftover prose lines.
 */
export const ExplanationEvalContent: React.FC<{ parsed: EvalBlock }> = ({ parsed }) => (
  <div className="space-y-2">
    {parsed.label && (
      <h3 className="text-sm sm:text-base font-bold text-text pt-2 pb-1.5 border-b border-border-soft flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-func inline-block shrink-0" />
        <span>{parsed.label}</span>
      </h3>
    )}
    <TruthEvalBlock rows={parsed.rows} />
    {parsed.otherLines.length > 0 && (
      <div className="space-y-1.5">
        {parsed.otherLines.map((line, i) => (
          <p key={i} className="text-xs sm:text-sm text-text-dim leading-relaxed">
            <InlineContent text={line} />
          </p>
        ))}
      </div>
    )}
  </div>
);

/**
 * Step-breakdown explanation renderer. When every non-empty line is an
 * evaluation row, the whole step renders as one visual card instead of a
 * run-on paragraph (the newlines were previously collapsed into one blob).
 */
export const StepExplanation: React.FC<{ text: string }> = ({ text }) => {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  const rows = lines
    .map((l) => parseEvalLine(l))
    .filter((r): r is EvalRow => r !== null);

  if (rows.length >= 2 && rows.length === lines.length) {
    return <TruthEvalBlock rows={rows} />;
  }

  return (
    <p className="text-[13px] leading-relaxed text-text-dim font-sans">
      <InlineContent text={text} />
    </p>
  );
};