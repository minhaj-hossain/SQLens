import React, { useState, useEffect, useRef } from 'react';
import { QueryExecutionResult } from '../../types/database';

interface SQLSandboxProps {
  initialSql?: string;
  onRunQuery: (sql: string) => QueryExecutionResult;
  onSqlChange?: (sql: string) => void;
  onSubmit?: (sql: string) => void;
  solutionSql?: string;
  className?: string;
  externalResult?: QueryExecutionResult | null;
  /** Evaluation state */
  evaluationState?: 'idle' | 'wrong' | 'correct';
  /** Feedback message if evaluated */
  validationFeedback?: string | null;
  /** Callback for moving forward when correct */
  onNextAction?: () => void;
  /** Label for next action button (e.g., 'Next Task', 'Next Concept', 'Challenge') */
  nextActionLabel?: string;
}

export const SQLSandbox: React.FC<SQLSandboxProps> = ({
  initialSql = 'SELECT * FROM products;',
  onRunQuery,
  onSqlChange,
  onSubmit,
  className = '',
  externalResult,
  evaluationState = 'idle',
  validationFeedback = null,
  onNextAction,
  nextActionLabel = 'Next Task',
}) => {
  const [sql, setSql] = useState(initialSql);
  const [internalResult, setInternalResult] = useState<QueryExecutionResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [page, setPage] = useState(0);
  const pageSize = 8;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const result = externalResult !== undefined ? externalResult : internalResult;

  useEffect(() => {
    setSql(initialSql);
    setInternalResult(null);
    setPage(0);
  }, [initialSql]);

  // Close overflow menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const handleSqlChange = (newVal: string) => {
    setSql(newVal);
    if (onSqlChange) {
      onSqlChange(newVal);
    }
  };

  const handleRun = () => {
    if (!sql.trim()) return;
    if (onSubmit) {
      onSubmit(sql);
    } else {
      const res = onRunQuery(sql);
      setInternalResult(res);
      setPage(0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (evaluationState === 'correct' && onNextAction) {
        onNextAction();
      } else {
        handleRun();
      }
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(sql);
    setCopied(true);
    setShowMenu(false);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleReset = () => {
    handleSqlChange(initialSql);
    setShowMenu(false);
  };

  const handleFormat = () => {
    const keywords = [
      'SELECT',
      'FROM',
      'WHERE',
      'AND',
      'OR',
      'NOT',
      'LIMIT',
      'OFFSET',
      'ORDER BY',
      'ASC',
      'DESC',
      'AS',
      'DISTINCT',
      'JOIN',
      'INNER JOIN',
      'LEFT JOIN',
      'ON',
      'GROUP BY',
      'HAVING',
      'COUNT',
      'SUM',
      'AVG',
      'MIN',
      'MAX',
      'BETWEEN',
      'LIKE',
      'IN',
      'IS NULL',
      'IS NOT NULL',
    ];
    let formatted = sql;
    keywords.forEach((kw) => {
      const regex = new RegExp(`\\b${kw}\\b`, 'gi');
      formatted = formatted.replace(regex, kw);
    });
    handleSqlChange(formatted);
  };

  const lineCount = Math.max(sql.split('\n').length, 3);
  const lines = Array.from({ length: lineCount }, (_, i) => i + 1);

  const totalRows = result?.rows.length || 0;
  const paginatedRows = result?.rows.slice(page * pageSize, (page + 1) * pageSize) || [];
  const totalPages = Math.ceil(totalRows / pageSize);

  const isCorrect = evaluationState === 'correct';
  const isWrong = evaluationState === 'wrong';

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* SQL Editor Card with subtle green tint border on success */}
      <div
        className={`flex flex-col rounded-xl border transition-colors duration-200 overflow-hidden shadow-md ${
          isCorrect
            ? 'border-emerald-500/50 bg-surface-container'
            : isWrong
            ? 'border-rose-500/40 bg-surface-container'
            : 'border-outline-variant/60 bg-surface-container'
        }`}
      >
        {/* Editor Top Toolbar */}
        <div
          className={`flex items-center justify-between border-b px-4 py-2 transition-colors ${
            isCorrect
              ? 'border-emerald-500/30 bg-emerald-950/20'
              : 'border-outline-variant/40 bg-surface-dim/90'
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`font-mono text-xs font-bold tracking-wider uppercase flex items-center gap-1.5 ${
                isCorrect ? 'text-emerald-400' : 'text-primary'
              }`}
            >
              {isCorrect && (
                <span className="material-symbols-outlined text-[15px]">check_circle</span>
              )}
              SQL Query
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Format Button - subtle ghost */}
            <button
              onClick={handleFormat}
              className="flex items-center gap-1 px-2.5 py-1 text-xs text-text-muted hover:text-on-surface hover:bg-surface-container rounded transition cursor-pointer font-label-sm"
              title="Auto-format SQL keywords"
            >
              <span className="material-symbols-outlined text-[14px]">auto_fix_high</span>
              <span>Format</span>
            </button>

            {/* Overflow Menu (⋯) */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center justify-center w-7 h-7 text-text-muted hover:text-on-surface hover:bg-surface-container rounded transition cursor-pointer"
                title="More options"
              >
                <span className="material-symbols-outlined text-[18px]">more_horiz</span>
              </button>

              {showMenu && (
                <div className="absolute right-0 top-8 z-30 w-36 rounded-lg bg-surface-container-high border border-outline-variant shadow-xl py-1 text-xs">
                  <button
                    onClick={handleCopy}
                    className="w-full text-left px-3 py-2 text-on-surface hover:bg-surface-variant flex items-center gap-2 transition cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px] text-text-muted">
                      {copied ? 'check' : 'content_copy'}
                    </span>
                    <span>{copied ? 'Copied!' : 'Copy SQL'}</span>
                  </button>
                  <button
                    onClick={handleReset}
                    className="w-full text-left px-3 py-2 text-on-surface hover:bg-surface-variant flex items-center gap-2 transition cursor-pointer border-t border-outline-variant/40"
                  >
                    <span className="material-symbols-outlined text-[15px] text-text-muted">
                      restart_alt
                    </span>
                    <span>Reset SQL</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Code Editor Body */}
        <div className="relative flex bg-surface-base font-mono text-xs sm:text-[13px] min-h-[110px] max-h-[220px]">
          {/* Line Numbers */}
          <div className="select-none bg-surface-base border-r border-outline-variant/30 px-3 py-3 text-right text-text-muted/40 font-mono text-[11px] leading-relaxed">
            {lines.map((num) => (
              <div key={num}>{num}</div>
            ))}
          </div>

          {/* Text Area */}
          <textarea
            ref={textareaRef}
            value={sql}
            onChange={(e) => handleSqlChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="-- Write your SQL query here..."
            className="w-full flex-1 resize-none bg-transparent p-3 text-cyan-300 font-mono text-xs sm:text-[13px] leading-relaxed placeholder-text-muted/30 focus:outline-none selection:bg-primary-container/30"
            rows={lineCount}
            spellCheck={false}
          />
        </div>

        {/* Editor Bottom Bar: Stateful Primary Button (Run Query <-> Next Task) */}
        <div className="flex items-center justify-between border-t border-outline-variant/40 bg-surface-dim/80 px-4 py-2.5">
          <div className="flex items-center gap-2 text-xs text-text-muted font-mono">
            <span
              title="Shortcut: ⌘ + Enter (or Ctrl + Enter)"
              className="inline-flex items-center gap-1 text-[11px] text-text-muted hover:text-on-surface cursor-help transition"
            >
              <kbd className="px-1.5 py-0.5 rounded bg-surface-container border border-outline-variant/60 font-mono text-[10px] font-semibold text-text-muted">
                ⌘ Enter
              </kbd>
            </span>
          </div>

          {/* Single Stateful Action Button */}
          {isCorrect && onNextAction ? (
            <button
              onClick={onNextAction}
              className="bg-primary text-surface-base font-bold px-5 py-2 rounded-lg shadow-md shadow-primary/20 hover:brightness-110 active:scale-95 transition-all text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer font-headline-sm"
            >
              <span>{nextActionLabel}</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          ) : (
            <button
              onClick={handleRun}
              className="bg-primary text-surface-base font-bold px-5 py-2 rounded-lg shadow-md shadow-primary/20 hover:brightness-110 active:scale-95 transition-all text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer font-headline-sm"
            >
              <span className="material-symbols-outlined text-[18px]">play_arrow</span>
              <span>Run Query</span>
            </button>
          )}
        </div>
      </div>

      {/* Results Section */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between text-xs text-text-muted">
          {/* Stateful Header label: Normal vs ✓ Correct vs ✕ Not quite */}
          <div className="flex items-center gap-2">
            {isCorrect ? (
              <span className="flex items-center gap-1.5 font-mono font-bold text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-md">
                <span className="material-symbols-outlined text-[14px]">check</span>
                <span>Correct!</span>
              </span>
            ) : isWrong ? (
              <span className="flex items-center gap-1.5 font-mono font-bold text-xs text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2.5 py-0.5 rounded-md">
                <span className="material-symbols-outlined text-[14px]">close</span>
                <span>Not quite</span>
              </span>
            ) : (
              <span className="font-mono font-bold uppercase tracking-wider text-[11px] text-on-surface/80">
                RESULTS
              </span>
            )}
          </div>

          {result && result.success && (
            <span className="text-[11px] font-mono text-text-muted">
              {result.rowCount} {result.rowCount === 1 ? 'row' : 'rows'} ·{' '}
              {result.executionTimeMs?.toFixed(1)}ms
            </span>
          )}
        </div>

        {/* Validation Feedback Message Box (Educational & Specific) */}
        {validationFeedback && (
          <div
            className={`p-3 rounded-xl text-xs leading-relaxed flex items-start gap-2.5 border ${
              isCorrect
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25'
                : 'bg-rose-500/10 text-rose-300 border-rose-500/25'
            }`}
          >
            <span className="material-symbols-outlined text-[17px] shrink-0 mt-0.5">
              {isCorrect ? 'check_circle' : 'info'}
            </span>
            <span className="font-body-md">{validationFeedback}</span>
          </div>
        )}

        {/* Results Data / State Panel */}
        {!result ? (
          <div className="rounded-xl border border-dashed border-outline-variant/60 bg-surface-base/50 py-7 px-4 flex flex-col items-center justify-center text-center">
            <span className="material-symbols-outlined text-[22px] text-text-muted/40 mb-1.5">
              terminal
            </span>
            <p className="text-xs font-mono text-text-muted/70">
              Run the query to see execution results.
            </p>
          </div>
        ) : !result.success ? (
          <div className="rounded-xl border border-rose-500/40 bg-rose-950/20 p-3.5 text-xs text-rose-300 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold font-mono">
              <span className="material-symbols-outlined text-[16px]">error</span>
              <span>SQL Execution Error</span>
            </div>
            <p className="font-mono text-[11px] leading-relaxed text-rose-300/90 font-mono">
              {result.error}
            </p>
          </div>
        ) : result.rows.length === 0 ? (
          <div className="rounded-xl border border-outline-variant/40 bg-surface-base p-4 text-xs font-mono text-text-muted text-center">
            Query executed successfully. 0 rows returned.
          </div>
        ) : (
          <div className="space-y-2">
            <div className="overflow-x-auto overflow-y-auto max-h-[260px] rounded-xl border border-outline-variant/60 bg-surface-base scrollbar-thin shadow-inner">
              <table className="w-max min-w-full text-left text-xs border-collapse font-mono">
                <thead className="sticky top-0 bg-surface-container-high z-10">
                  <tr className="border-b border-outline-variant/60 text-[11px] text-primary">
                    {result.columns.map((col) => (
                      <th
                        key={col}
                        className="px-3.5 py-2.5 font-bold whitespace-nowrap min-w-[90px]"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30 text-[11px]">
                  {paginatedRows.map((row, rIdx) => (
                    <tr
                      key={rIdx}
                      className="hover:bg-surface-container/50 transition-colors"
                    >
                      {result.columns.map((col) => {
                        const val = row[col];
                        const isNull = val === null || val === undefined;
                        return (
                          <td
                            key={col}
                            className="px-3.5 py-2 whitespace-nowrap text-on-surface"
                          >
                            {isNull ? (
                              <span className="italic text-text-muted/50">NULL</span>
                            ) : typeof val === 'number' ? (
                              <span className="text-cyan-400 font-medium">{val}</span>
                            ) : (
                              <span>{String(val)}</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls if many rows */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between font-label-sm text-[11px] text-text-muted px-1 pt-1">
                <span>
                  Page {page + 1} of {totalPages} ({totalRows} rows)
                </span>
                <div className="flex items-center gap-1">
                  <button
                    disabled={page === 0}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    className="rounded p-1 text-text-muted hover:bg-surface-container disabled:opacity-30 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      chevron_left
                    </span>
                  </button>
                  <button
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    className="rounded p-1 text-text-muted hover:bg-surface-container disabled:opacity-30 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      chevron_right
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
