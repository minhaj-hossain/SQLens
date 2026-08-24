import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ModuleChallenge, PracticeTask } from '../../types/curriculum';
import { QueryExecutionResult, TableRow } from '../../types/database';
import { validateTaskSolution } from '../../lib/sql-engine/validator';
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
  onChallengeTaskSuccess: (taskId: string, userSql: string) => void;
  onFinishAllChallenges: () => void;
  onBackToPractice?: () => void;
}

const SQL_KEYWORDS = [
  'SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN',
  'ON', 'GROUP BY', 'HAVING', 'ORDER BY', 'LIMIT', 'OFFSET', 'AS', 'DISTINCT',
  'AND', 'OR', 'NOT', 'IN', 'BETWEEN', 'LIKE', 'ILIKE', 'IS NULL', 'IS NOT NULL',
  'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'ROUND', 'COALESCE', 'ASC', 'DESC'
];

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
  onChallengeTaskSuccess,
  onFinishAllChallenges,
  onBackToPractice,
}) => {
  const [selectedTaskIdx, setSelectedTaskIdx] = useState(0);
  const currentTask: PracticeTask = challenge.tasks[selectedTaskIdx] || challenge.tasks[0];

  // Local cache of user's SQL per task id so returning preserves what they typed/passed
  const [taskSqlCache, setTaskSqlCache] = useState<Record<string, string>>(() => ({
    ...savedTaskSqls,
  }));

  const initialSqlForTask = taskSqlCache[currentTask.id] ?? (currentTask.initialSql || '');
  const [currentSql, setCurrentSql] = useState<string>(initialSqlForTask);
  const [executionResult, setExecutionResult] = useState<QueryExecutionResult | null>(null);
  const [taskPassed, setTaskPassed] = useState<boolean>(() => completedTaskIds.includes(currentTask.id));
  const [validationFeedback, setValidationFeedback] = useState<string | null>(null);

  // Progressive Hint States
  const [revealedHintLevel, setRevealedHintLevel] = useState<number>(0);
  const [failedAttemptsCount, setFailedAttemptsCount] = useState<number>(0);

  // Database Inspector Modal / Drawer
  const [showDatabaseModal, setShowDatabaseModal] = useState<boolean>(false);
  const [inspectTable, setInspectTable] = useState<string>(currentTask.primaryTable || 'products');
  const [dbSearchFilter, setDbSearchFilter] = useState<string>('');
  const [copiedColumn, setCopiedColumn] = useState<string | null>(null);

  // Code editor states
  const [copiedSql, setCopiedSql] = useState<boolean>(false);
  const [activeLine, setActiveLine] = useState<number>(1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync state when selected task changes
  useEffect(() => {
    const isDone = completedTaskIds.includes(currentTask.id);
    const existingSql = taskSqlCache[currentTask.id] ?? (isDone && currentTask.solutionSql ? currentTask.solutionSql : (currentTask.initialSql || ''));
    
    setCurrentSql(existingSql);
    setExecutionResult(null);
    setTaskPassed(isDone);
    setValidationFeedback(null);
    setRevealedHintLevel(0);
    setFailedAttemptsCount(0);
    setInspectTable(currentTask.primaryTable || 'products');
  }, [currentTask.id, currentTask.primaryTable, completedTaskIds]);

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
      list.push(`The columns you need to output are:\n${reqCols.map((c) => `• ${c}`).join('\n')}`);
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

  const updateCursor = (text: string, selectionStart: number) => {
    const textBeforeCursor = text.slice(0, selectionStart);
    setActiveLine(textBeforeCursor.split('\n').length);
  };

  // Execute and Validate Query
  const handleRunQuery = () => {
    const trimmed = currentSql.trim();
    if (!trimmed) {
      setValidationFeedback('Please enter a SQL query before running.');
      return;
    }

    const result = onExecuteSql(currentSql);
    setExecutionResult(result);

    const outcome = validateTaskSolution(currentSql, result, currentTask.validation);

    if (outcome.passed) {
      setTaskPassed(true);
      setValidationFeedback(null);
      setTaskSqlCache((prev) => ({ ...prev, [currentTask.id]: currentSql }));
      onChallengeTaskSuccess(currentTask.id, currentSql);
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
    let formatted = currentSql;
    SQL_KEYWORDS.forEach((kw) => {
      const regex = new RegExp(`\\b${kw}\\b`, 'gi');
      formatted = formatted.replace(regex, kw);
    });
    setCurrentSql(formatted);
    setTaskSqlCache((prev) => ({ ...prev, [currentTask.id]: formatted }));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (taskPassed) {
        handleNextAction();
      } else {
        handleRunQuery();
      }
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const newSql = currentSql.substring(0, start) + '  ' + currentSql.substring(end);
      setCurrentSql(newSql);
      setTaskSqlCache((prev) => ({ ...prev, [currentTask.id]: newSql }));
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  const lineCount = Math.max(currentSql.split('\n').length, 5);
  const lines = Array.from({ length: lineCount }, (_, i) => i + 1);

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
      className="w-full max-w-3xl mx-auto space-y-5"
    >
      {/* 1. TOP HEADER & QUESTION */}
      <div className="bg-[#121414] rounded-xl border border-[#3c494a]/60 p-5 shadow-md space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold text-[#55d8e1] uppercase tracking-wider">
              FINAL CHALLENGE
            </span>
            {challenge.tasks.length > 1 && (
              <span className="text-xs font-mono text-[#9BA4B4]">
                • Task {selectedTaskIdx + 1} of {challenge.tasks.length}
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
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono text-[#e2e2e2] bg-[#222831] hover:bg-[#393E46] hover:text-white border border-[#4F5864] transition cursor-pointer"
            title="Inspect table schema and rows"
          >
            <Database className="w-3.5 h-3.5 text-[#55d8e1]" />
            <span>Database: <strong className="text-white">{currentTask.primaryTable}</strong></span>
            <span className="text-[10px] text-[#9BA4B4]">({tableRowCount} rows)</span>
            <ChevronDown className="w-3 h-3 text-[#9BA4B4] ml-0.5" />
          </button>
        </div>

        {/* Clean, Direct Question Prompt without backticks */}
        <h1 className="text-base sm:text-lg font-semibold text-[#e2e2e2] leading-relaxed font-body-lg">
          {cleanedPrompt}
        </h1>

        {/* Multi-Task Navigation Pills: show checkmark ONLY if truly completed in completedTaskIds */}
        {challenge.tasks.length > 1 && (
          <div className="flex items-center gap-2 pt-2 border-t border-[#3c494a]/50">
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
                      ? 'bg-[#00adb5]/20 text-[#55d8e1] font-bold border border-[#00adb5]'
                      : isTaskDone
                      ? 'bg-[#00adb5]/10 text-[#55d8e1] border border-[#00adb5]/40 hover:bg-[#00adb5]/20'
                      : 'bg-[#222831] text-[#9BA4B4] hover:text-white border border-[#4F5864]/60'
                  }`}
                >
                  {isTaskDone && (
                    <span className="text-[#55d8e1] font-bold text-xs">✓</span>
                  )}
                  <span>Task {idx + 1}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. SQL EDITOR CENTERPIECE */}
      <div className="bg-[#121414] rounded-xl border border-[#3c494a]/60 overflow-hidden shadow-lg">
        {/* Editor Top Bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#0c0f0f] border-b border-[#3c494a]/50 select-none">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-[#9BA4B4] font-semibold tracking-wide">
              SQL
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleFormatSql}
              className="flex items-center gap-1 px-2 py-0.5 text-[11px] font-mono text-[#9BA4B4] hover:text-[#55d8e1] hover:bg-[#222831] rounded transition cursor-pointer"
              title="Capitalize SQL keywords"
            >
              <Sparkles className="w-3 h-3 text-[#55d8e1]" />
              <span>Format</span>
            </button>

            <button
              onClick={handleCopySql}
              className="flex items-center gap-1 px-2 py-0.5 text-[11px] font-mono text-[#9BA4B4] hover:text-white hover:bg-[#222831] rounded transition cursor-pointer"
              title="Copy SQL"
            >
              {copiedSql ? <Check className="w-3 h-3 text-[#55d8e1]" /> : <Copy className="w-3 h-3" />}
              <span>{copiedSql ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={() => {
                setCurrentSql('');
                setTaskSqlCache((prev) => ({ ...prev, [currentTask.id]: '' }));
                textareaRef.current?.focus();
              }}
              className="flex items-center gap-1 px-2 py-0.5 text-[11px] font-mono text-[#9BA4B4] hover:text-white hover:bg-[#222831] rounded transition cursor-pointer"
              title="Clear editor"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Code Editor Surface */}
        <div
          onClick={() => textareaRef.current?.focus()}
          className="relative min-h-[160px] flex font-mono text-[13.5px] leading-[22px] bg-[#1a1c1c] cursor-text"
        >
          {/* Line Numbers Gutter */}
          <div className="w-10 select-none py-3 bg-[#0c0f0f] text-[#9BA4B4] text-right pr-3 font-mono border-r border-[#3c494a]/40 flex flex-col shrink-0">
            {lines.map((ln) => (
              <div
                key={ln}
                className={`h-[22px] text-[11px] font-medium transition-colors ${
                  ln === activeLine ? 'text-[#55d8e1] font-bold' : ''
                }`}
              >
                {ln}
              </div>
            ))}
          </div>

          {/* Editable Textarea */}
          <div className="relative flex-1 w-full p-0">
            <textarea
              id="challenge-sql-textarea"
              ref={textareaRef}
              value={currentSql}
              onChange={(e) => {
                handleTextChange(e.target.value);
                updateCursor(e.target.value, e.target.selectionStart);
              }}
              onKeyUp={(e) => updateCursor(currentSql, e.currentTarget.selectionStart)}
              onClick={(e) => updateCursor(currentSql, e.currentTarget.selectionStart)}
              onKeyDown={handleKeyDown}
              placeholder={`-- Type your SQL query here\nSELECT name, price, quantity_in_stock\nFROM ${currentTask.primaryTable};`}
              spellCheck={false}
              autoCapitalize="none"
              autoComplete="off"
              autoCorrect="off"
              className="w-full h-full min-h-[160px] p-3 bg-transparent text-[#e2e2e2] placeholder:text-[#4F5864] caret-[#55d8e1] font-mono text-[13.5px] leading-[22px] resize-none outline-none overflow-y-auto scrollbar-thin border-none block"
            />
          </div>
        </div>

        {/* Editor Bottom Actions */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#121414] border-t border-[#3c494a]/60">
          <div className="text-xs text-[#9BA4B4] font-mono flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-[#222831] border border-[#4F5864] text-[#e2e2e2] text-[10px]">
              Ctrl + Enter
            </kbd>
            <span className="hidden sm:inline">to run query</span>
          </div>

          {/* SINGLE Unified Action Button for Run / Next Task */}
          {taskPassed ? (
            <button
              id="challenge-next-btn"
              onClick={handleNextAction}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold font-mono bg-[#00adb5] hover:bg-[#55d8e1] text-[#003739] shadow-md shadow-[#00adb5]/20 transition cursor-pointer active:scale-95"
            >
              <span>{isLastTask ? 'Finish Challenge 🏆' : 'Next Task →'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              id="challenge-run-btn"
              onClick={handleRunQuery}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold font-mono bg-[#00adb5] hover:bg-[#55d8e1] text-[#003739] shadow-md shadow-[#00adb5]/20 transition cursor-pointer active:scale-95"
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
              <div className="p-4 rounded-xl bg-[#00adb5]/10 border border-[#00adb5]/40 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#55d8e1] shrink-0 mt-0.5" />
                <div className="space-y-0.5 text-left">
                  <h3 className="text-sm font-bold text-[#55d8e1]">✓ Correct!</h3>
                  <p className="text-xs text-[#e2e2e2] leading-relaxed">
                    {cleanBackticks(currentTask.successMessage) || 'Your query returned the expected result.'}
                  </p>
                </div>
              </div>
            )}

            {/* Error / Not Quite Banner */}
            {!taskPassed && validationFeedback && (
              <div className="p-4 rounded-xl bg-[#93000a]/20 border border-[#ffb4ab]/30 flex items-start gap-3">
                <XCircle className="w-5 h-5 text-[#ffb4ab] shrink-0 mt-0.5" />
                <div className="space-y-1 text-left">
                  <h3 className="text-sm font-bold text-[#ffb4ab]">✕ Not quite</h3>
                  <p className="text-xs text-[#e2e2e2] leading-relaxed font-mono">
                    {validationFeedback}
                  </p>
                </div>
              </div>
            )}

            {/* Query Results Table */}
            {executionResult && executionResult.success && executionResult.rows.length > 0 && (
              <div className="bg-[#121414] rounded-xl border border-[#3c494a]/60 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 bg-[#0c0f0f] border-b border-[#3c494a]/50 text-xs font-mono text-[#9BA4B4]">
                  <span>Output ({executionResult.rowCount} rows)</span>
                  <span className="text-[11px] text-[#9BA4B4]">{executionResult.executionTimeMs.toFixed(1)}ms</span>
                </div>

                <div className="overflow-x-auto max-h-[220px] scrollbar-thin">
                  <table className="w-full text-left font-mono text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#1a1c1c] border-b border-[#3c494a]/60 sticky top-0 z-10 text-[#e2e2e2]">
                        {executionResult.columns.map((col) => (
                          <th key={col} className="px-3.5 py-2 font-semibold">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#3c494a]/30 text-[#e2e2e2]">
                      {executionResult.rows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-[#222831]/60 transition">
                          {executionResult.columns.map((col) => (
                            <td key={col} className="px-3.5 py-1.5 whitespace-nowrap text-[#e2e2e2]">
                              {String(row[col] ?? 'NULL')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
            className="flex items-center gap-1.5 text-xs font-mono text-[#9BA4B4] hover:text-[#55d8e1] transition cursor-pointer"
          >
            <Lightbulb className="w-3.5 h-3.5 text-[#55d8e1]" />
            <span>Need a hint?</span>
          </button>
        ) : (
          <div className="p-4 rounded-xl bg-[#121414] border border-[#00adb5]/30 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#55d8e1]">
                <Lightbulb className="w-4 h-4 text-[#55d8e1]" />
                <span>Hint {revealedHintLevel} of {maxHints}</span>
              </div>

              {revealedHintLevel < maxHints && (
                <button
                  onClick={() => setRevealedHintLevel((prev) => Math.min(prev + 1, maxHints))}
                  className="text-xs font-mono text-[#55d8e1] hover:underline transition cursor-pointer font-semibold"
                >
                  Stronger Hint →
                </button>
              )}
            </div>

            <div className="text-xs text-[#e2e2e2] font-mono leading-relaxed bg-[#0c0f0f] p-3 rounded-lg border border-[#3c494a]/40 whitespace-pre-wrap">
              {taskHints[revealedHintLevel - 1]}
            </div>
          </div>
        )}
      </div>

      {/* 5. MINIMALIST DATABASE INSPECTOR MODAL / DRAWER */}
      {showDatabaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#121414] border border-[#3c494a] rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden text-[#e2e2e2] flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 bg-[#0c0f0f] border-b border-[#3c494a]/60">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-[#55d8e1]" />
                {/* Table Switcher */}
                <div className="relative inline-block">
                  <select
                    value={inspectTable}
                    onChange={(e) => setInspectTable(e.target.value)}
                    className="appearance-none font-mono text-xs font-bold text-white bg-[#222831] border border-[#4F5864] rounded-lg pl-3 pr-7 py-1.5 focus:outline-none focus:border-[#55d8e1] transition cursor-pointer"
                  >
                    {Object.keys(DATABASE_SCHEMAS).map((tName) => (
                      <option key={tName} value={tName} className="bg-[#222831] text-white">
                        {tName} ({INITIAL_TABLES[tName]?.length || 0} rows)
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-[#9BA4B4] absolute right-2 top-2.5 pointer-events-none" />
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setShowDatabaseModal(false)}
                className="text-[#9BA4B4] hover:text-white p-1.5 rounded-lg hover:bg-[#222831] transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Table Search & Column Bar */}
            <div className="p-3 bg-[#1a1c1c] border-b border-[#3c494a]/50 flex flex-wrap items-center justify-between gap-2.5">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="w-3.5 h-3.5 text-[#9BA4B4] absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter rows..."
                  value={dbSearchFilter}
                  onChange={(e) => setDbSearchFilter(e.target.value)}
                  className="w-full bg-[#222831] border border-[#4F5864]/70 rounded-lg pl-8 pr-3 py-1 text-xs text-[#e2e2e2] font-mono placeholder:text-[#9BA4B4]/60 focus:outline-none focus:border-[#55d8e1]"
                />
              </div>

              {/* Columns Quick Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] font-mono text-[#9BA4B4]">
                <span className="text-[10px] text-[#9BA4B4] uppercase font-bold">Columns:</span>
                {activeSchema.columns.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => {
                      navigator.clipboard.writeText(c.name);
                      setCopiedColumn(c.name);
                      setTimeout(() => setCopiedColumn(null), 1200);
                    }}
                    className="px-2 py-0.5 rounded bg-[#222831] hover:bg-[#393E46] hover:text-[#55d8e1] text-[#e2e2e2] border border-[#4F5864]/60 transition cursor-pointer whitespace-nowrap"
                    title="Click to copy column name"
                  >
                    {copiedColumn === c.name ? `✓ ${c.name}` : c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Data Grid */}
            <div className="overflow-auto flex-1 p-0 scrollbar-thin">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="bg-[#1a1c1c] border-b border-[#3c494a]/60 sticky top-0 z-10 text-[#e2e2e2]">
                    {activeSchema.columns.map((col) => (
                      <th key={col.name} className="px-3.5 py-2 font-semibold">
                        <div className="flex items-center gap-1">
                          <span>{col.name}</span>
                          <span className="text-[10px] text-[#9BA4B4] font-normal">({col.type})</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#3c494a]/30 text-[#e2e2e2]">
                  {filteredRows.slice(0, 50).map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-[#222831]/60 transition">
                      {activeSchema.columns.map((col) => (
                        <td key={col.name} className="px-3.5 py-1.5 whitespace-nowrap text-[#e2e2e2]">
                          {String(row[col.name] ?? 'NULL')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-[#0c0f0f] border-t border-[#3c494a]/60 flex items-center justify-between text-xs text-[#9BA4B4] font-mono">
              <span>Showing {filteredRows.length} rows</span>
              <button
                onClick={() => setShowDatabaseModal(false)}
                className="px-3.5 py-1 rounded-lg bg-[#222831] hover:bg-[#393E46] text-white font-semibold transition cursor-pointer"
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
