import React, { useState } from 'react';
import { QueryExecutionResult } from '../../types/database';
import { CheckCircle2, AlertCircle, Terminal, HelpCircle, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

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

  // Plain-English explanation generator for common SQL constructs
  const getQueryExplanation = (sql: string) => {
    if (!sql.trim()) return 'No SQL query entered yet.';
    const normalized = sql.trim();
    const explanations: string[] = [];

    // Match SELECT
    const selectMatch = normalized.match(/SELECT\s+(DISTINCT\s+)?([\s\S]+?)\s+FROM/i);
    if (selectMatch) {
      const distinct = Boolean(selectMatch[1]);
      const cols = selectMatch[2].trim();
      if (cols === '*') {
        explanations.push(`Retrieves ${distinct ? 'distinct ' : 'all '}columns from the source dataset.`);
      } else {
        explanations.push(`Selects specific columns (${cols})${distinct ? ' removing duplicate values' : ''}.`);
      }
    }

    // Match FROM
    const fromMatch = normalized.match(/FROM\s+([a-zA-Z0-9_]+)/i);
    if (fromMatch) {
      explanations.push(`Reads data from table '${fromMatch[1]}'.`);
    }

    // Match JOIN
    const joinMatch = normalized.match(/(INNER\s+|LEFT\s+|RIGHT\s+)?JOIN\s+([a-zA-Z0-9_]+)\s+ON\s+([\s\S]+?)(WHERE|GROUP|ORDER|LIMIT|;|$)/i);
    if (joinMatch) {
      const joinType = (joinMatch[1] || 'INNER').trim().toUpperCase();
      explanations.push(`Performs a ${joinType} JOIN with table '${joinMatch[2]}' on condition (${joinMatch[3].trim()}).`);
    }

    // Match WHERE
    const whereMatch = normalized.match(/WHERE\s+([\s\S]+?)(GROUP\s+BY|ORDER\s+BY|LIMIT|;|$)/i);
    if (whereMatch) {
      explanations.push(`Filters records where condition (${whereMatch[1].trim()}) is satisfied.`);
    }

    // Match GROUP BY
    const groupMatch = normalized.match(/GROUP\s+BY\s+([\s\S]+?)(HAVING|ORDER\s+BY|LIMIT|;|$)/i);
    if (groupMatch) {
      explanations.push(`Aggregates rows grouped by (${groupMatch[1].trim()}).`);
    }

    // Match ORDER BY
    const orderMatch = normalized.match(/ORDER\s+BY\s+([\s\S]+?)(LIMIT|;|$)/i);
    if (orderMatch) {
      explanations.push(`Sorts final results by (${orderMatch[1].trim()}).`);
    }

    // Match LIMIT
    const limitMatch = normalized.match(/LIMIT\s+(\d+)/i);
    if (limitMatch) {
      explanations.push(`Limits output to at most ${limitMatch[1]} row(s).`);
    }

    return explanations.length > 0
      ? explanations.join(' ')
      : 'Executes standard SQL data retrieval operations.';
  };

  return (
    <div
      id="results-console-container"
      className={`flex flex-col bg-surface rounded-xl border border-border overflow-hidden shadow-lg ${className}`}
    >
      {/* Console Header & Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 bg-ink border-b border-border">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-func" />
          <span className="font-mono text-xs font-bold text-text uppercase tracking-wider">
            Query Results
          </span>

          {/* Execution Metadata Pills */}
          {result && !result.error && (
            <div className="flex items-center gap-1.5 ml-2">
              <span className="px-2 py-0.5 rounded bg-surface-2 text-text-dim text-[10px] font-mono border border-border">
                {totalRows} {totalRows === 1 ? 'row' : 'rows'}
              </span>
              <span className="px-2 py-0.5 rounded bg-surface-2 text-string text-[10px] font-mono border border-border">
                {result.fields?.length || 0} cols
              </span>
              <span className="px-2 py-0.5 rounded bg-surface-2 text-func text-[10px] font-mono border border-border">
                {result.executionTimeMs?.toFixed(1) || '1.2'}ms
              </span>
            </div>
          )}
        </div>

        {/* Console View Tabs */}
        <div className="flex items-center bg-surface-2 p-0.5 rounded-lg border border-border text-xs">
          <button
            id="tab-result-table-btn"
            onClick={() => setActiveTab('results')}
            className={`px-3 py-1 rounded-md text-[11px] font-mono font-medium transition cursor-pointer ${
              activeTab === 'results'
                ? 'bg-func/20 text-func font-bold border border-func/30'
                : 'text-text-dim hover:text-text'
            }`}
          >
            Output Grid
          </button>
          <button
            id="tab-explain-query-btn"
            onClick={() => setActiveTab('explain')}
            className={`flex items-center gap-1 px-3 py-1 rounded-md text-[11px] font-mono font-medium transition cursor-pointer ${
              activeTab === 'explain'
                ? 'bg-func/20 text-func font-bold border border-func/30'
                : 'text-text-dim hover:text-text'
            }`}
          >
            <Sparkles className="w-3 h-3 text-func" />
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
        <div className="min-h-[160px] max-h-[300px] overflow-auto bg-ink scrollbar-thin">
          {activeTab === 'explain' ? (
            <div className="p-4 space-y-3 font-mono text-xs">
              <div className="text-text flex items-center gap-2 font-bold">
                <Sparkles className="w-4 h-4 text-func" />
                <span>Query Execution Breakdown</span>
              </div>
              <p className="p-3 bg-surface rounded-lg border border-border text-text leading-relaxed font-normal">
                {getQueryExplanation(sqlQuery)}
              </p>
              <div className="text-[11px] text-text-dim">
                Tip: In real database engines (PostgreSQL, MySQL), the <code className="text-keyword">EXPLAIN</code> keyword shows the query execution plan and table scans.
              </div>
            </div>
          ) : !result ? (
            /* Empty / Initial State */
            <div className="flex flex-col items-center justify-center py-12 text-center text-text-dim space-y-2">
              <Terminal className="w-8 h-8 text-text-faint" />
              <p className="text-xs font-mono">Run your query to preview rows and inspect execution output.</p>
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
                {result.fields?.map((field) => (
                  <th key={field} className="px-3 py-2 text-[11px] font-bold select-none whitespace-nowrap bg-surface-2 text-keyword">
                    {field}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-[11.5px] text-text-dim">
              {displayedRows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-surface-2/50 transition-colors">
                  {result.fields?.map((field) => (
                    <td key={field} className="px-3 py-1.5 whitespace-nowrap">
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
        <div className="flex items-center justify-between px-3 py-2 bg-ink border-t border-border text-xs text-text-dim font-mono">
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
