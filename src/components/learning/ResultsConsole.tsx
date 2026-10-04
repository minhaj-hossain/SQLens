import React, { useState, useEffect } from 'react';
import { QueryExecutionResult } from '../../types/database';
import { CheckCircle2, AlertCircle, Terminal, HelpCircle, Sparkles, Braces, Table } from 'lucide-react';
import { explainQuery } from '../../lib/sql-explain';
import { formatExecutionTime } from '../../lib/format-execution-time';
import type { ConsoleDisplayMode, SqlLensState } from '../../lib/track-submit';
import { DataGrid } from './DataGrid';
import { SqlLensPanel } from './SqlLensPanel';
import { TerminalOutput } from './TerminalOutput';
import { JsonViewer } from './JsonViewer';

interface ResultsConsoleProps {
  result: QueryExecutionResult | null;
  evaluationState: 'idle' | 'wrong' | 'correct';
  validationFeedback: string | null;
  sqlQuery?: string;
  /**
   * Phase 7: the Prisma SQL Lens for this run (`SqlLensState` from
   * `track-submit`). `undefined`/`null` on the SQL track — the lens UI is
   * Prisma-only, so every SQL render stays exactly as it was.
   */
  sqlLens?: SqlLensState | null;
  /**
   * P1.2 — console rendering hint from the submit outcome. `'terminal'` swaps
   * the table grid for the simulated CLI card (snippet labs); `undefined`
   * keeps the SQL-track behavior byte-identical.
   */
  displayMode?: ConsoleDisplayMode;
  /** P1.2 — simulated terminal text rendered when `displayMode === 'terminal'`. */
  terminalOutput?: string;
  /** Phase 3: in-memory hydrated object graph for Prisma tasks. */
  stitchedJson?: unknown;
  className?: string;
}

export const ResultsConsole: React.FC<ResultsConsoleProps> = ({
  result,
  evaluationState,
  validationFeedback,
  sqlQuery = '',
  sqlLens = null,
  displayMode,
  terminalOutput,
  stitchedJson,
  className = '',
}) => {
  const effectiveJson = stitchedJson ?? sqlLens?.stitchedJson;
  const isPrisma = Boolean(sqlLens);
  const hasStitchedJson = effectiveJson !== undefined;

  const [activeTab, setActiveTab] = useState<'results' | 'json' | 'explain'>('results');

  // When a Prisma task produces an in-memory object, switch to the JSON view automatically
  useEffect(() => {
    if (hasStitchedJson) {
      setActiveTab('json');
    }
  }, [hasStitchedJson, effectiveJson]);

  const totalRows = result?.rows.length || 0;
  // Honest timing (tracker item 11): real value only — never a fabricated
  // fallback number like the old '1.2'.
  const timeDisplay = result ? formatExecutionTime(result.executionTimeMs) : null;
  // Phase 7: the Explain tab explains SQL. On a Prisma task the editor holds
  // TypeScript, so explaining it would be nonsense — the lens statements are the
  // real SQL of this run and are what the breakdown must read.
  const explainTarget = sqlLens && sqlLens.steps.length > 0
    ? sqlLens.steps.map((s) => s.sql).join('\n')
    : sqlQuery;

  return (
    <div
      id="results-console-container"
      className={`flex flex-col bg-surface rounded-xl border border-border overflow-hidden w-full min-w-0 ${className}`}
    >
      {/* Console Header & Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-2.5 sm:py-3.5 bg-surface border-b border-border-soft min-w-0">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <Terminal className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-text-dim shrink-0" />
          <span className="font-mono text-[11px] sm:text-[12px] font-semibold text-text-dim uppercase tracking-wider shrink-0">
            &gt;_ Results
          </span>

          {/* Execution Metadata Pills */}
          {result && !result.error && (
            <div className="flex items-center gap-1 sm:gap-1.5 ml-1 sm:ml-2">
              <span className="px-1.5 sm:px-2 py-0.5 rounded bg-surface-2 text-text-dim text-[9.5px] sm:text-[10px] font-mono border border-border shrink-0">
                {totalRows} {totalRows === 1 ? 'row' : 'rows'}
              </span>
              <span className="px-1.5 sm:px-2 py-0.5 rounded bg-surface-2 text-text-dim text-[9.5px] sm:text-[10px] font-mono border border-border shrink-0">
                {result.columns?.length || 0} cols
              </span>
              {timeDisplay && (
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded bg-surface-2 text-text-dim text-[10px] font-mono border border-border shrink-0">
                  {timeDisplay}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Segmented View Switch (design `.segmented` / `.seg`) */}
        <div className="flex items-center bg-surface-2 p-0.5 rounded-lg border border-border text-xs">
          {isPrisma && hasStitchedJson && (
            <button
              id="tab-result-json-btn"
              onClick={() => setActiveTab('json')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-mono font-medium transition cursor-pointer ${
                activeTab === 'json'
                  ? 'bg-surface-3 text-text font-semibold shadow-sm'
                  : 'text-text-faint hover:text-text-dim'
              }`}
            >
              <Braces className="w-3 h-3 text-func" />
              <span>In-Memory Object</span>
            </button>
          )}
          <button
            id="tab-result-table-btn"
            onClick={() => setActiveTab('results')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-mono font-medium transition cursor-pointer ${
              activeTab === 'results'
                ? 'bg-surface-3 text-text font-semibold shadow-sm'
                : 'text-text-faint hover:text-text-dim'
            }`}
          >
            {isPrisma && <Table className="w-3 h-3 text-text-dim" />}
            <span>{isPrisma ? 'SQLite Rows' : 'Output Grid'}</span>
          </button>
          <button
            id="tab-explain-query-btn"
            onClick={() => setActiveTab('explain')}
            className={`flex items-center gap-1 px-3 py-1 rounded-md text-[11px] font-mono font-medium transition cursor-pointer ${
              activeTab === 'explain'
                ? 'bg-surface-3 text-text font-semibold shadow-sm'
                : 'text-text-faint hover:text-text-dim'
            }`}
          >
            <Sparkles className="w-3 h-3 text-text-dim" />
            <span>Explain Query</span>
          </button>
        </div>
      </div>

      {/* Validation Banner (Did I get it right?) */}
      {evaluationState !== 'idle' && validationFeedback && (
        <div
          id="validation-feedback-banner"
          className={`p-3 text-xs font-mono flex items-start gap-2.5 border-b ${
            evaluationState === 'correct'
              ? 'bg-success-bg text-success-text border-success-border'
              : 'bg-error-bg text-error-text border-error-border'
          }`}
        >
          {evaluationState === 'correct' ? (
            <CheckCircle2 className="w-4 h-4 text-success-text shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-error-text shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <span className="font-bold">
              {evaluationState === 'correct' ? 'Correct!' : 'Needs Adjustment:'}
            </span>{' '}
            <span>{validationFeedback}</span>
          </div>
        </div>
      )}

      {/* Phase 7: Prisma SQL Lens — label + substituted SQL + per-statement
          result. Placed under the verdict so a failed run still shows the SQL
          it produced (that is the lesson) and a passed snippet lab explains
          why no SQL appears at all. */}
      {sqlLens && <SqlLensPanel lens={sqlLens} />}

      {/* Main Console Content */}
      <div className="relative">
        <div className="min-h-[160px] bg-surface">
          {activeTab === 'explain' ? (
            <div className="p-4 space-y-3 font-mono text-xs">
              <div className="text-text flex items-center gap-2 font-bold">
                <Sparkles className="w-4 h-4 text-func" />
                <span>Query Execution Breakdown</span>
              </div>
              <p className="p-3 bg-surface-2 rounded-lg border border-border text-text leading-relaxed font-normal">
                {explainQuery(explainTarget).join(' ')}
              </p>
              <div className="text-[11px] text-text-dim">
                Tip: In real database engines (PostgreSQL, MySQL), the <code className="text-keyword">EXPLAIN</code> keyword shows the query execution plan and table scans.
              </div>
            </div>
          ) : activeTab === 'json' && hasStitchedJson ? (
            <div className="p-3 sm:p-4">
              <JsonViewer data={effectiveJson} />
            </div>
          ) : displayMode === 'terminal' && terminalOutput ? (
            /* P1.2 — snippet lab: simulated CLI output instead of reference rows */
            <div className="p-3 sm:p-4">
              <TerminalOutput output={terminalOutput} />
            </div>
          ) : !result ? (
            /* Empty / Initial State (design `.results-empty`) */
            <div className="flex flex-col items-center justify-center py-14 text-center space-y-3">
              <div className="font-mono text-[26px] leading-none text-text-faint">&gt;_</div>
              <p className="text-[12.5px] text-text-dim max-w-[320px]">
                {sqlLens
                  ? 'Run your code to see the SQL Prisma generates and the rows it returns.'
                  : 'Run your query to preview rows and inspect execution output.'}
              </p>
            </div>
          ) : result.error ? (
            /* Error Display */
            <div className="p-4 bg-error-bg text-error-text font-mono text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-error-text">
                <AlertCircle className="w-4 h-4" />
                <span>SQL Execution Error</span>
              </div>
              <p className="p-3 bg-surface-2 rounded border border-error-border leading-relaxed text-error-text">
                {result.error}
              </p>
            </div>
          ) : totalRows === 0 ? (
            /* Zero rows matched */
            <div className="p-8 text-center text-text-dim font-mono text-xs space-y-1">
              <p className="text-text font-semibold">Query executed successfully, but returned 0 rows.</p>
              <p className="text-text-faint text-[11px]">Check your WHERE filter conditions or table records.</p>
            </div>
          ) : (
            /* Results Table Grid — shared DataGrid (types + pagination) */
            <DataGrid
              columns={result.columns ?? []}
              rows={result.rows}
              maxHeight="max-h-[300px]"
              pageSize={15}
              bare
              className="min-h-[160px]"
            />
        )}
        </div>
      </div>

      </div>
  );
};
