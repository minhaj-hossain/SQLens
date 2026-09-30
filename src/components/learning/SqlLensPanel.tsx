import React from 'react';
import { Sparkles, Info, AlertCircle } from 'lucide-react';
import type { PrismaExecutionStep, SqlLensState } from '../../lib/track-submit';

interface SqlLensPanelProps {
  /**
   * The lens for the current run (`SqlLensState` from `track-submit`):
   * `steps` to render, or `note` when there is nothing to translate.
   */
  lens: SqlLensState;
  className?: string;
}

/**
 * Per-statement result summary for the lens.
 *
 * Derived from the REAL engine result of that statement — never from the
 * translation, which cannot know how many rows a WHERE matched.
 */
function stepResultLabel(step: PrismaExecutionStep): { text: string; isError: boolean } {
  const { result } = step;
  if (result.error) return { text: result.error, isError: true };
  if (typeof result.affectedRows === 'number') {
    return {
      text: `${result.affectedRows} row${result.affectedRows === 1 ? '' : 's'} affected`,
      isError: false,
    };
  }
  return {
    text: `${result.rowCount} row${result.rowCount === 1 ? '' : 's'} returned`,
    isError: false,
  };
}

/**
 * Prisma SQL Lens (Phase 7) — the teaching payload of the Prisma track: the
 * TypeScript the learner wrote, translated into the SQL Prisma actually sends,
 * with each executed statement's own result.
 *
 * Renders nothing for the SQL track (callers pass no lens) and is honest about
 * its own emptiness: an empty `steps` array plus a `note` is the snippet-lab /
 * idle state, never a blank box.
 */
export const SqlLensPanel: React.FC<SqlLensPanelProps> = ({ lens, className = '' }) => {
  const { steps, note } = lens;
  const statements = steps.length;

  return (
    <div
      id="sql-lens-panel"
      className={`border-b border-border-soft bg-surface-2/50 ${className}`}
    >
      {/* Header — what this panel is, and how much ran */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-2.5">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <Sparkles className="w-3.5 h-3.5 text-func shrink-0" />
          <span className="font-mono text-[11px] font-semibold text-text-dim uppercase tracking-wider">
            SQL Lens
          </span>
          {statements > 0 && (
            <span className="px-1.5 sm:px-2 py-0.5 rounded bg-surface-3 text-text-dim text-[9.5px] sm:text-[10px] font-mono border border-border shrink-0">
              {statements} statement{statements === 1 ? '' : 's'}
            </span>
          )}
        </div>
        <span className="text-[10px] font-mono text-text-faint hidden sm:inline">
          what Prisma sends after your code runs
        </span>
      </div>

      {/* Empty-but-honest state: idle, snippet lab, or nothing translatable */}
      {statements === 0 && (
        <div className="px-3 sm:px-4 pb-3 flex items-start gap-2 text-[11.5px] font-mono text-text-dim">
          <Info className="w-3.5 h-3.5 shrink-0 mt-px text-text-faint" />
          <span className="leading-relaxed">
            {note ?? 'No statement ran yet.'}
          </span>
        </div>
      )}

      {/* One card per executed statement: label + substituted SQL + its result */}
      {statements > 0 && (
        <div className="px-3 sm:px-4 pb-3 space-y-2">
          {steps.map((step, idx) => {
            const verdict = stepResultLabel(step);
            return (
              <div
                key={`${idx}-${step.label}`}
                className="rounded-lg border border-border bg-surface overflow-hidden"
              >
                <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 px-3 py-1.5 bg-surface-2 border-b border-border-soft">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-[10px] text-text-faint shrink-0">
                      {statements > 1 ? `#${idx + 1}` : '1'}
                    </span>
                    <span className="font-mono text-[10.5px] text-text-dim uppercase tracking-wide truncate">
                      {step.label}
                    </span>
                  </div>
                  <div
                    className={`flex items-center gap-1.5 font-mono text-[10.5px] min-w-0 ${
                      verdict.isError ? 'text-error-text' : 'text-text-dim'
                    }`}
                  >
                    {verdict.isError && <AlertCircle className="w-3 h-3 shrink-0" />}
                    <span className="truncate">{verdict.text}</span>
                  </div>
                </div>
                <pre className="px-3 py-2 font-mono text-[11.5px] text-editor-text bg-editor-bg overflow-x-auto whitespace-pre-wrap break-words">
                  {step.sql}
                </pre>
              </div>
            );
          })}
          <p className="text-[10.5px] font-mono text-text-faint leading-relaxed">
            Executed on your session database — the rows below are real results of this SQL.
          </p>
        </div>
      )}
    </div>
  );
};
