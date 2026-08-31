import React, { useState } from 'react';
import { QueryExecutionResult } from '../../types/database';
import { CheckCircle2, AlertCircle, Terminal, HelpCircle, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { explainQuery } from '../../lib/sql-explain';
import { formatExecutionTime } from '../../lib/format-execution-time';

interface ResultsConsoleProps {
  result: QueryExecutionResult | null;
  evaluationState: 'idle' | 'wrong' | 'correct';
  validationFeedback: string | null;
  sqlQuery?: string;
  className?: string;
}

export const ResultsConsole: React.FC<ResultsConsoleProps> = ({
  result,
  evaluationState,
  validationFeedback,
  sqlQuery = '',
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<'results' | 'explain'>('results');
  const [page, setPage] = useState(0);
  const pageSize = 8;

  const totalRows = result?.rows.length || 0;
  const totalPages = Math.ceil(totalRows / pageSize);
  const displayedRows = result?.rows ? result.rows.slice(page * pageSize, (page + 1) * pageSize) : [];
  // Honest timing (tracker item 11): real value only — never a fabricated
  // fallback number like the old '1.2'.
  const timeDisplay = result ? formatExecutionTime(result.executionTimeMs) : null;

  return (
    <div
      id="results-console-container"
      className={`flex flex-col bg-surface rounded-xl border border-border overflow-hidden ${className}`}
    >
      {/* Console Header & Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 px-4 py-3.5 bg-surface border-b border-border-soft">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-text-dim" />
          <span className="font-mono text-[12px] font-semibold text-text-dim uppercase tracking-wider">
            &gt;_ Query Results
          </span>

          {/* Execution Metadata Pills */}
          {result && !result.error && (
            <div className="flex items-center gap-1.5 ml-2">
              <span className="px-2 py-0.5 rounded bg-surface-2 text-text-dim text-[10px] font-mono border border-border">
                {totalRows} {totalRows === 1 ? 'row' : 'rows'}
              </span>
              <span className="px-2 py-0.5 rounded bg-surface-2 text-text-dim text-[10px] font-mono border border-border">
                {result.columns?.length || 0} cols
              </span>
              {timeDisplay && (
                <span className="px-2 py-0.5 rounded bg-surface-2 text-text-dim text-[10px] font-mono border border-border">
                  {timeDisplay}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Segmented View Switch (design `.segmented` / `.seg`) */}
        <div className="flex items-center bg-surface-2 p-0.5 rounded-lg border border-border text-xs">
          <button
            id="tab-result-table-btn"
            onClick={() => setActiveTab('results')}
            className={`px-3 py-1 rounded-md text-[11px] font-mono font-medium transition cursor-pointer ${
              activeTab === 'results'
                ? 'bg-surface-3 text-text font-semibold'
                : 'text-text-faint hover:text-text-dim'
            }`}
          >
            Output Grid
          </button>
          <button
            id="tab-explain-query-btn"
            onClick={() => setActiveTab('explain')}
            className={`flex items-center gap-1 px-3 py-1 rounded-md text-[11px] font-mono font-medium transition cursor-pointer ${
              activeTab === 'explain'
                ? 'bg-surface-3 text-text font-semibold'
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
              ? 'bg-func/10 text-func border-func/40'
              : 'bg-error/10 text-error border-error/40'
          }`}
        >
          {evaluationState === 'correct' ? (
            <CheckCircle2 className="w-4 h-4 text-func shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-error shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <span className="font-bold">
              {evaluationState === 'correct' ? 'Correct!' : 'Needs Adjustment:'}
            </span>{' '}
            <span>{validationFeedback}</span>
          </div>
        </div>
      )}

      {/* Main Console Content with Mobile Scroll Indicator */}
      <div className="relative">
        {result && !result.error && totalRows > 0 && activeTab === 'results' && (
          <div className="sm:hidden px-3 py-1 bg-surface-2 text-[10px] font-mono text-text-faint border-b border-border flex items-center justify-between">
            <span>← Swipe horizontally to view all columns →</span>
          </div>
        )}
        <div className="min-h-[160px] max-h-[300px] overflow-auto bg-surface scrollbar-thin">
          {activeTab === 'explain' ? (
            <div className="p-4 space-y-3 font-mono text-xs">
              <div className="text-text flex items-center gap-2 font-bold">
                <Sparkles className="w-4 h-4 text-func" />
                <span>Query Execution Breakdown</span>
              </div>
              <p className="p-3 bg-surface-2 rounded-lg border border-border text-text leading-relaxed font-normal">
                {explainQuery(sqlQuery).join(' ')}
              </p>
              <div className="text-[11px] text-text-dim">
                Tip: In real database engines (PostgreSQL, MySQL), the <code className="text-keyword">EXPLAIN</code> keyword shows the query execution plan and table scans.
              </div>
            </div>
          ) : !result ? (
            /* Empty / Initial State (design `.results-empty`) */
            <div className="flex flex-col items-center justify-center py-14 text-center space-y-3">
              <div className="font-mono text-[26px] leading-none text-text-faint">&gt;_</div>
              <p className="text-[12.5px] text-text-dim max-w-[320px]">Run your query to preview rows and inspect execution output.</p>
            </div>
          ) : result.error ? (
            /* Error Display */
            <div className="p-4 bg-error/10 text-error font-mono text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-error">
                <AlertCircle className="w-4 h-4" />
                <span>SQL Execution Error</span>
              </div>
              <p className="p-3 bg-error/20 rounded border border-error/40 leading-relaxed">
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
            /* Results Table Grid */
            <table className="min-w-full text-left font-mono border-collapse text-xs">
            <thead className="sticky top-0 z-10 bg-surface-2 border-b border-border text-text">
              <tr>
                {result.columns?.map((field) => (
                  <th key={field} className="px-3.5 py-2 text-[11px] font-semibold select-none whitespace-nowrap bg-surface-2 text-text">
                    {field}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-soft text-[12px] text-text-dim">
              {displayedRows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-surface-2/50 transition-colors">
                  {result.columns?.map((field) => (
                    <td key={field} className="px-3.5 py-2 whitespace-nowrap">
                      {row[field] !== null && row[field] !== undefined ? (
                        String(row[field])
                      ) : (
                        <span className="text-text-faint italic">NULL</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
        </div>
      </div>

      {/* Pagination Footer (if more than 8 rows) */}
      {result && totalRows > pageSize && activeTab === 'results' && (
        <div className="flex items-center justify-between px-3 py-2 bg-surface-2 border-t border-border-soft text-xs text-text-dim font-mono">
          <span>
            Page {page + 1} of {totalPages} ({totalRows} total records)
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1 rounded bg-surface-2 hover:bg-surface-3 disabled:opacity-40 text-text-dim transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-1 rounded bg-surface-2 hover:bg-surface-3 disabled:opacity-40 text-text-dim transition cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
