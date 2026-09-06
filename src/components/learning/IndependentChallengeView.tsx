import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ModuleChallenge, PracticeTask } from '../../types/curriculum';
import { QueryExecutionResult, TableRow, DatabaseState } from '../../types/database';
import { validateTaskSolution, isReadOnlySelect } from '../../lib/sql-engine/validator';
import { gradeFinalState } from '../../lib/sql-engine/state-verification';
import { splitTaskScaffold, buildEditorPlaceholder } from '../../lib/task-scaffold';
import { useCloseOnOutside } from '../../lib/use-close-on-outside';
import { DATABASE_SCHEMAS } from '../../content/database/schema';
import { INITIAL_TABLES } from '../../content/database/tables';
import {
  Play,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Database,
  Search,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ChevronDown,
  X,
} from 'lucide-react';

interface IndependentChallengeViewProps {
  challenge: ModuleChallenge;
  completedTaskIds: string[];
  savedTaskSqls?: Record<string, string>;
  onExecuteSql: (sql: string) => QueryExecutionResult;
  /** F1: snapshot hook — mutation tasks grade by final database state. */
  getDatabaseState?: () => DatabaseState;
  onChallengeTaskSuccess: (taskId: string, userSql: string) => void;
  onFinishAllChallenges: () => void;
  onBackToPractice?: () => void;
  /** v2: called on every task switch so the host can honor the challenge's
   *  lifecycle (fresh → reset DB; inherit → keep mutated state). */
  onSelectedTaskChange?: (taskId: string) => void;
}


import { formatExecutionTime } from '@/lib/format-execution-time';
import { formatSql } from '@/lib/format-sql';
import { DataGrid } from './DataGrid';
import { QueryEditor, QueryEditorHandle } from './QueryEditor';

/**
 * Strips raw markdown backtick delimiters (`column` -> column)
 * for clean, professional typography.
 */
function cleanBackticks(text?: string | null): string {
  if (!text) return '';
  return text.replace(/`/g, '');
}

export const IndependentChallengeView: React.FC<IndependentChallengeViewProps> = ({
  challenge,
  completedTaskIds,
  savedTaskSqls = {},
  onExecuteSql,
  getDatabaseState,
  onChallengeTaskSuccess,
  onFinishAllChallenges,
  onBackToPractice,
  onSelectedTaskChange,
}) => {
  const [selectedTaskIdx, setSelectedTaskIdx] = useState(0);
  const currentTask: PracticeTask = challenge.tasks[selectedTaskIdx] || challenge.tasks[0];

  // Local cache of user's SQL per task id so returning preserves what they typed/passed
  const [taskSqlCache, setTaskSqlCache] = useState<Record<string, string>>(() => ({
    ...savedTaskSqls,
  }));

  // Guidance comments become the editor PLACEHOLDER; only real code loads.
  const taskScaffold = splitTaskScaffold(currentTask.initialSql);
  const initialSqlForTask = taskSqlCache[currentTask.id] ?? taskScaffold.code;
  const [currentSql, setCurrentSql] = useState<string>(initialSqlForTask);
  const [executionResult, setExecutionResult] = useState<QueryExecutionResult | null>(null);
  const [taskPassed, setTaskPassed] = useState<boolean>(() => completedTaskIds.includes(currentTask.id));
  const [validationFeedback, setValidationFeedback] = useState<string | null>(null);

  // Progressive Hint States
  const [revealedHintLevel, setRevealedHintLevel] = useState<number>(0);
  const [failedAttemptsCount, setFailedAttemptsCount] = useState<number>(0);

  // Database Inspector Modal / Drawer
  const [showDatabaseModal, setShowDatabaseModal] = useState<boolean>(false);
  const dbModalRef = useRef<HTMLDivElement>(null);

  // Close the database inspector when clicking/tapping outside its panel.
  useCloseOnOutside(dbModalRef, showDatabaseModal, () => setShowDatabaseModal(false));

  const [inspectTable, setInspectTable] = useState<string>(currentTask.primaryTable || 'products');
  const [dbSearchFilter, setDbSearchFilter] = useState<string>('');
  const [copiedColumn, setCopiedColumn] = useState<string | null>(null);

  const [copiedSql, setCopiedSql] = useState<boolean>(false);
  const editorRef = useRef<QueryEditorHandle>(null);

  // Sync state when selected task changes (tracked by currentTask.id)
  useEffect(() => {
    const isDone = completedTaskIds.includes(currentTask.id);
    const scaffold = splitTaskScaffold(currentTask.initialSql);
    const existingSql = taskSqlCache[currentTask.id] ?? (isDone && currentTask.solutionSql ? currentTask.solutionSql : scaffold.code);
    
    setCurrentSql(existingSql);
    setExecutionResult(null);
    setTaskPassed(isDone);
    setValidationFeedback(null);
    setRevealedHintLevel(0);
    setFailedAttemptsCount(0);
    setInspectTable(currentTask.primaryTable || 'products');
    // v2 database lifecycle: a `fresh` challenge resets the database to seed
    // on every task switch so each task is independently verifiable. `inherit`
    // (or default) keeps the mutated state for connected multi-step tasks.
    onSelectedTaskChange?.(currentTask.id);
  }, [currentTask.id]);

  const isLastTask = selectedTaskIdx >= challenge.tasks.length - 1;

  // Build progressive hints for the task
  const taskHints = useMemo(() => {
    const list: string[] = [];
    const table = currentTask.primaryTable || currentTask.validation.targetTable || 'the table';
    const reqCols = currentTask.validation.requiredColumns;
    const reqAliases = currentTask.validation.requiredAliases;

    // Hint 1: Gentle Conceptual Nudge
    if (currentTask.hints && currentTask.hints[0] && currentTask.hints[0].text) {
      list.push(cleanBackticks(currentTask.hints[0].text));
    } else {
      list.push(`You need to retrieve data from the '${table}' table.`);
    }

    // Hint 2: Columns / Filtering requirements
    if (reqCols && reqCols.length > 0) {
      list.push(`The columns you need to output are:\n${reqCols.map((c) => `⬢ ${c}`).join('\n')}`);
    } else if (currentTask.validation.requireWhere) {
      list.push(`Make sure to use a WHERE clause to filter the rows correctly.`);
    } else {
      list.push(`Check the table columns by clicking "Database: ${table}" at the top right.`);
    }

    // Hint 3: Query skeleton structure
    if (reqAliases && Object.keys(reqAliases).length > 0) {
      const aliasDemo = Object.entries(reqAliases)
        .map(([orig, al]) => `${orig} AS ${al}`)
        .join(', ');
      list.push(`Your query should alias the columns using AS:\nSELECT ${aliasDemo}\nFROM ${table};`);
    } else if (reqCols && reqCols.length > 0) {
      list.push(`Your query should start with:\nSELECT ${reqCols.join(', ')}\nFROM ${table};`);
    } else {
      list.push(`Structure your query as:\nSELECT ...\nFROM ${table};`);
    }

    // Hint 4: Complete template structure
    if (currentTask.solutionSql) {
      list.push(`Reference Template:\n${currentTask.solutionSql}`);
    }

    return list;
  }, [currentTask]);

  const maxHints = taskHints.length;

  // Update line number and text
  const handleTextChange = (text: string) => {
    setCurrentSql(text);
    setTaskSqlCache((prev) => ({ ...prev, [currentTask.id]: text }));
    if (validationFeedback) setValidationFeedback(null);
  };

  const handleRunQuery = (sqlToRun?: string) => {
    const sql = typeof sqlToRun === 'string' ? sqlToRun : currentSql;
    const trimmed = sql.trim();
    if (!trimmed) {
      setValidationFeedback('Please enter a SQL query before running.');
      return;
    }

    // F1: snapshot BEFORE the statement runs, so mutation tasks can be graded
    // against the expected final database state (sandbox replay).
    const preState = getDatabaseState?.();
    const result = onExecuteSql(sql);
    setExecutionResult(result);

    // P10.3: grade against the solution's output on the same session executor
    // (read-only SELECTs only, so this never mutates the database).
    const expected =
      currentTask.validation.requireExactResult && !result.error && isReadOnlySelect(currentTask.solutionSql)
        ? onExecuteSql(currentTask.solutionSql)
        : undefined;

    let outcome = validateTaskSolution(sql, result, currentTask.validation, expected);

    // F1: mutation/DDL tasks grade on final database state — replay the
    // solution on a sandbox clone and compare (wrong-row/wrong-value UPDATEs
    // report identical affectedRows but leave a different state behind).
    if (
      outcome.passed &&
      preState && getDatabaseState && currentTask.solutionSql &&
      !isReadOnlySelect(currentTask.solutionSql) && !result.error
    ) {
      const stateCheck = gradeFinalState(preState, currentTask.solutionSql, getDatabaseState());
      if (!stateCheck.ok) {
        outcome = {
          passed: false,
          feedback: stateCheck.message || 'The statement ran, but the resulting database state does not match the expected outcome.',
        };
      }
    }

    if (outcome.passed) {
      setTaskPassed(true);
      setValidationFeedback(null);
      setTaskSqlCache((prev) => ({ ...prev, [currentTask.id]: sql }));
      onChallengeTaskSuccess(currentTask.id, sql);
    } else {
      setTaskPassed(false);
      setFailedAttemptsCount((prev) => prev + 1);

      const errorText =
        outcome.feedback ||
        (result.error
          ? `SQL execution error: ${result.error}`
          : 'Your query output did not match the expected dataset.');
      setValidationFeedback(cleanBackticks(errorText));
    }
  };

  const handleNextAction = () => {
    if (selectedTaskIdx < challenge.tasks.length - 1) {
      setSelectedTaskIdx((prev) => prev + 1);
    } else {
      onFinishAllChallenges();
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(currentSql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 1500);
  };

  const handleFormatSql = () => {
    const formatted = formatSql(currentSql);
    handleTextChange(formatted);
  };

  // Active Inspect Table Schema & Rows for Modal
  const activeSchema = DATABASE_SCHEMAS[inspectTable.toLowerCase()] || DATABASE_SCHEMAS.products;
  const rawRows: TableRow[] = INITIAL_TABLES[inspectTable.toLowerCase()] || [];
  const filteredRows = rawRows.filter((r) => {
    if (!dbSearchFilter) return true;
    return Object.values(r).some((val) =>
      String(val ?? '').toLowerCase().includes(dbSearchFilter.toLowerCase())
    );
  });

  const tableRowCount = INITIAL_TABLES[currentTask.primaryTable.toLowerCase()]?.length || 0;
  const cleanedPrompt = cleanBackticks(currentTask.description || currentTask.title);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.18 }}
      className="w-full max-w-3xl mx-auto space-y-6"
    >
      {/* 1. TOP HEADER & QUESTION */}
      <div className="bg-surface rounded-xl border border-border p-6 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-y-2 gap-x-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold text-text-faint uppercase tracking-wider">
              FINAL CHALLENGE
            </span>
            {challenge.tasks.length > 1 && (
              <span className="text-xs font-mono text-text-dim">
                ⬢ Task {selectedTaskIdx + 1} of {challenge.tasks.length}
              </span>
            )}
          </div>

          {/* Database Trigger Dropdown Pill */}
          <button
            id="view-database-btn"
            onClick={() => {
              setInspectTable(currentTask.primaryTable || 'products');
              setShowDatabaseModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono text-text bg-surface-2 hover:bg-surface-3 hover:text-text border border-border transition cursor-pointer"
            title="Inspect table schema and rows"
          >
            <Database className="w-3.5 h-3.5 text-text-dim" />
            <span>Database: <strong className="text-text">{currentTask.primaryTable}</strong></span>
            <span className="hidden sm:inline text-[10px] text-text-faint">({tableRowCount} rows)</span>
            <ChevronDown className="w-3 h-3 text-text-faint ml-0.5" />
          </button>
        </div>

        {/* Clean, Direct Question Prompt without backticks */}
        <h1 className="font-display text-base sm:text-lg font-semibold text-text leading-relaxed">
          {cleanedPrompt}
        </h1>

        {/* Multi-Task Navigation Pills: show checkmark ONLY if truly completed in completedTaskIds */}
        {challenge.tasks.length > 1 && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border-soft">
            {challenge.tasks.map((t, idx) => {
              const isTaskDone = completedTaskIds.includes(t.id);
              const isSelected = idx === selectedTaskIdx;
              return (
                <button
                  key={t.id}
                  id={`challenge-task-tab-${idx + 1}`}
                  onClick={() => setSelectedTaskIdx(idx)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono transition cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-surface-3 text-text font-semibold border-border'
                      : isTaskDone
                      ? 'bg-surface text-text border border-border hover:bg-surface-2'
                      : 'bg-surface-2 text-text-dim hover:text-text border border-border'
                  }`}
                >
                  {isTaskDone && (
                    <span className="text-done font-bold text-xs">✓</span>
                  )}
                  <span>Task {idx + 1}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. SQL EDITOR CENTERPIECE */}
      <div className="bg-surface rounded-xl border border-border overflow-visible shadow-lg">
        {/* Editor Top Bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-surface-2 border-b border-border-soft select-none">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-text-faint font-semibold tracking-wide">
              SQL
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleFormatSql}
              className="flex items-center gap-1 px-2 py-0.5 text-[11px] font-mono text-text-dim hover:text-text hover:bg-surface-2 rounded transition cursor-pointer"
              title="Capitalize SQL keywords"
            >
              <Sparkles className="w-3 h-3 text-text-dim" />
              <span>Format</span>
            </button>

            <button
              onClick={handleCopySql}
              className="flex items-center gap-1 px-2 py-0.5 text-[11px] font-mono text-text-dim hover:text-text hover:bg-surface-2 rounded transition cursor-pointer"
              title="Copy SQL"
            >
              {copiedSql ? <Check className="w-3 h-3 text-text" /> : <Copy className="w-3 h-3" />}
              <span>{copiedSql ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={() => {
                const scaffold = splitTaskScaffold(currentTask.initialSql);
                handleTextChange(scaffold.code);
                editorRef.current?.focus();
              }}
              className="flex items-center gap-1 px-2 py-0.5 text-[11px] font-mono text-text-dim hover:text-text hover:bg-surface-2 rounded transition cursor-pointer"
              title="Reset to the task starter query"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>

        <QueryEditor
          ref={editorRef}
          value={currentSql}
          onChange={handleTextChange}
          onRun={(sql) => {
            if (taskPassed) handleNextAction();
            else handleRunQuery(sql);
          }}
          fallbackTable={currentTask.primaryTable || 'products'}
          placeholder={buildEditorPlaceholder(currentTask)}
          textareaId="challenge-sql-textarea"
          minLineCount={5}
          error={!taskPassed ? (executionResult?.error || validationFeedback) : null}
        />

        {/* Editor Bottom Actions */}
        <div className="flex items-center justify-between px-4 py-3 bg-surface border-t border-border">
          <div className="text-xs text-text-dim font-mono flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-surface-2 border border-border text-text text-[10px]">
              Ctrl + Enter
            </kbd>
            <span className="hidden sm:inline">to run query</span>
          </div>

          {/* SINGLE Unified Action Button for Run / Next Task */}
          {taskPassed ? (
            <button
              id="challenge-next-btn"
              onClick={handleNextAction}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-[13px] font-semibold font-sans bg-func hover:bg-func/80 text-ink transition cursor-pointer active:scale-95"
            >
              <span>{isLastTask ? 'Finish Challenge' : 'Next Task'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              id="challenge-run-btn"
              onClick={() => handleRunQuery()}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-[13px] font-semibold font-sans bg-func hover:bg-func/80 text-ink transition cursor-pointer active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{validationFeedback ? 'Try Again' : 'Run Query'}</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. DYNAMIC EVALUATION & RESULTS */}
      <AnimatePresence>
        {(executionResult || taskPassed) && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="space-y-3"
          >
            {/* Success Notification Banner */}
            {taskPassed && (
              <div className="p-4 rounded-xl bg-func/10 border border-func/40 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-func shrink-0 mt-0.5" />
                <div className="space-y-0.5 text-left">
                  <h3 className="font-display text-sm font-bold text-func">✓ Correct!</h3>
                  <p className="text-xs text-text leading-relaxed">
                    {cleanBackticks(currentTask.successMessage) || 'Your query returned the expected result.'}
                  </p>
                </div>
              </div>
            )}

            {/* Error / Not Quite Banner */}
            {!taskPassed && validationFeedback && (
              <div className="p-4 rounded-xl bg-error/10 border border-error/30 flex items-start gap-3">
                <XCircle className="w-5 h-5 text-error shrink-0 mt-0.5" />
                <div className="space-y-1 text-left">
                  <h3 className="font-display text-sm font-bold text-error">Not quite</h3>
                  <p className="text-xs text-text leading-relaxed font-mono">
                    {validationFeedback}
                  </p>
                </div>
              </div>
            )}

            {/* Query Results Table — shared DataGrid */}
            {executionResult && executionResult.success && executionResult.rows.length > 0 && (
              <div className="bg-surface rounded-xl border border-border overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 bg-surface-2 border-b border-border-soft text-xs font-mono text-text-dim">
                  <span>Output ({executionResult.rowCount} rows)</span>
                  <span className="text-[11px] text-text-dim">
                    {formatExecutionTime(executionResult.executionTimeMs)}
                  </span>
                </div>

                <DataGrid
                  columns={executionResult.columns}
                  rows={executionResult.rows}
                  pageSize={50}
                  maxHeight="max-h-[220px]"
                  bare
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. PROGRESSIVE, FAILURE-AWARE HINT SYSTEM */}
      <div className="pt-1">
        {revealedHintLevel === 0 ? (
          <button
            id="challenge-hint-trigger-btn"
            onClick={() => setRevealedHintLevel(1)}
            className="flex items-center gap-1.5 text-xs font-mono text-text-dim hover:text-text transition cursor-pointer"
          >
            <Lightbulb className="w-3.5 h-3.5 text-text-dim" />
            <span>Need a hint?</span>
          </button>
        ) : (
          <div className="p-4 rounded-xl bg-surface border border-border-soft space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono font-semibold text-text-dim">
                <Lightbulb className="w-4 h-4 text-text-dim" />
                <span>Hint {revealedHintLevel} of {maxHints}</span>
              </div>

              {revealedHintLevel < maxHints && (
                <button
                  onClick={() => setRevealedHintLevel((prev) => Math.min(prev + 1, maxHints))}
                  className="text-xs font-mono text-text-dim hover:text-text transition cursor-pointer font-semibold"
                >
                  Stronger Hint →
                </button>
              )}
            </div>

            <div className="text-xs text-text font-mono leading-relaxed bg-surface-2 p-3 rounded-lg border border-border whitespace-pre-wrap">
              {taskHints[revealedHintLevel - 1]}
            </div>
          </div>
        )}
      </div>

      {/* 5. MINIMALIST DATABASE INSPECTOR MODAL / DRAWER */}
      {showDatabaseModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setShowDatabaseModal(false)}
        >
          <div
            ref={dbModalRef}
            className="bg-surface border border-border rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden text-text flex flex-col max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 bg-surface-2 border-b border-border-soft">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-text-dim" />
                {/* Table Switcher */}
                <div className="relative inline-block">
                  <select
                    value={inspectTable}
                    onChange={(e) => setInspectTable(e.target.value)}
                    className="appearance-none font-mono text-xs font-bold text-text bg-surface-2 border border-border rounded-lg pl-3 pr-7 py-1.5 focus:outline-none focus:border-func transition cursor-pointer"
                  >
                    {Object.keys(DATABASE_SCHEMAS).map((tName) => (
                      <option key={tName} value={tName} className="bg-surface-2 text-text">
                        {tName} ({INITIAL_TABLES[tName]?.length || 0} rows)
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-text-faint absolute right-2 top-2.5 pointer-events-none" />
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setShowDatabaseModal(false)}
                className="text-text-dim hover:text-text p-1.5 rounded-lg hover:bg-surface-2 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Table Search & Column Bar */}
            <div className="p-3 bg-surface-2 border-b border-border flex flex-wrap items-center justify-between gap-2.5">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="w-3.5 h-3.5 text-text-dim absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter rows..."
                  value={dbSearchFilter}
                  onChange={(e) => setDbSearchFilter(e.target.value)}
                  className="w-full bg-surface border border-border rounded-lg pl-8 pr-3 py-1 text-xs text-text font-mono placeholder:text-text-faint/60 focus:outline-none focus:border-func"
                />
              </div>

              {/* Columns Quick Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] font-mono text-text-dim">
                <span className="text-[10px] text-text-faint uppercase font-bold">Columns:</span>
                {activeSchema.columns.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => {
                      navigator.clipboard.writeText(c.name);
                      setCopiedColumn(c.name);
                      setTimeout(() => setCopiedColumn(null), 1200);
                    }}
                    className="px-2 py-0.5 rounded bg-surface hover:bg-surface-3 hover:text-text text-text border border-border transition cursor-pointer whitespace-nowrap"
                    title="Click to copy column name"
                  >
                    {copiedColumn === c.name ? `✓ ${c.name}` : c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Data Grid — shared DataGrid */}
            <DataGrid
              columns={activeSchema.columns.map((c) => c.name)}
              rows={filteredRows}
              schemaName={inspectTable}
              rowCap={50}
              maxHeight="max-h-[220px]"
              bare
              showRowCount
              columnBadges={(colName) => {
                const colInfo = activeSchema.columns.find(
                  (c) => c.name.toLowerCase() === colName.toLowerCase(),
                );
                return colInfo ? (
                  <span className="text-[10px] text-comment font-normal">
                    ({colInfo.type})
                  </span>
                ) : null;
              }}
              emptyMessage="No records found."
            />

            {/* Modal Footer */}
            <div className="p-3 bg-ink border-t border-border flex items-center justify-between text-xs text-text-dim font-mono">
              <span className="text-text-faint">Tap a column chip to copy its name</span>
              <button
                onClick={() => setShowDatabaseModal(false)}
                className="px-3.5 py-1 rounded-lg bg-surface-2 hover:bg-surface-3 text-text font-semibold transition cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
