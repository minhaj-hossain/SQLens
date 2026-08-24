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
  const highlightRef = useRef<HTMLDivElement>(null);

  // Autocomplete
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedSuggestionIdx, setSelectedSuggestionIdx] = useState(0);
  const [suggestionWord, setSuggestionWord] = useState('');

  // Column names for the current task's table
  const columnNames = useMemo(() => {
    const schema = DATABASE_SCHEMAS[currentTask.primaryTable?.toLowerCase() || 'products'];
    return schema ? schema.columns.map((c) => c.name) : [];
  }, [currentTask.primaryTable]);

  // Syntax highlight (single-pass tokenizer)
  const highlightedCode = useMemo(() => {
    if (!currentSql) return '';
    let escaped = currentSql
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    const tokens: { placeholder: string; html: string }[] = [];

    // 1. Comments
    escaped = escaped.replace(/(--[^\n]*)/g, (match) => {
      const ph = `___TOKEN_${tokens.length}___`;
      tokens.push({ placeholder: ph, html: `<span class="text-zinc-400 italic">${match}</span>` });
      return ph;
    });

    // 2. String literals
    escaped = escaped.replace(/('(?:[^'\\]|\\.)*')/g, (match) => {
      const ph = `___TOKEN_${tokens.length}___`;
      tokens.push({ placeholder: ph, html: `<span class="text-emerald-400 font-medium">${match}</span>` });
      return ph;
    });

    // 3. Numbers
    escaped = escaped.replace(/\b(\d+(\.\d+)?)\b/g, (match) => {
      const ph = `___TOKEN_${tokens.length}___`;
      tokens.push({ placeholder: ph, html: `<span class="text-amber-300 font-semibold">${match}</span>` });
      return ph;
    });

    // 4. SQL Keywords (single combined regex pass)
    const kwPattern = new RegExp(`\\b(${SQL_KEYWORDS.map((k) => k.replace(/ /g, '\\s+')).join('|')})\\b`, 'gi');
    escaped = escaped.replace(kwPattern, (match) =>
      `<span class="text-cyan-400 font-bold">${match.toUpperCase()}</span>`
    );

    // 5. Restore tokens
    tokens.forEach(({ placeholder, html }) => {
      escaped = escaped.replace(placeholder, html);
    });

    return escaped;
  }, [currentSql]);

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

  const updateCursorAndSuggestions = (text: string, selectionStart: number) => {
    updateCursor(text, selectionStart);
    const textBefore = text.slice(0, selectionStart);
    const wordMatch = textBefore.match(/[\w]+$/);
    const word = wordMatch ? wordMatch[0].toUpperCase() : '';
    if (word.length >= 2) {
      const allTerms = [...SQL_KEYWORDS, ...columnNames];
      const matches = allTerms.filter(
        (t) => t.toUpperCase().startsWith(word) && t.toUpperCase() !== word
      );
      setSuggestions(matches.slice(0, 8));
      setSuggestionWord(word);
      setShowSuggestions(matches.length > 0);
      setSelectedSuggestionIdx(0);
    } else {
      setShowSuggestions(false);
    }
  };

  const applySuggestion = (sug: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const pos = ta.selectionStart;
    const before = currentSql.slice(0, pos);
    const after = currentSql.slice(pos);
    const wordMatch = before.match(/[\w]+$/);
    const wordLen = wordMatch ? wordMatch[0].length : 0;
    const newSql = before.slice(0, before.length - wordLen) + sug + ' ' + after;
    handleTextChange(newSql);
    setShowSuggestions(false);
    const newPos = pos - wordLen + sug.length + 1;
    setTimeout(() => { if (ta) { ta.selectionStart = ta.selectionEnd = newPos; ta.focus(); } }, 0);
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
    // Autocomplete navigation
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedSuggestionIdx(p => (p + 1) % suggestions.length); return; }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedSuggestionIdx(p => (p - 1 + suggestions.length) % suggestions.length); return; }
      if (e.key === 'Tab' || (e.key === 'Enter' && !e.ctrlKey && !e.metaKey)) { e.preventDefault(); applySuggestion(suggestions[selectedSuggestionIdx]); return; }
      if (e.key === 'Escape') { setShowSuggestions(false); return; }
    }

    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      setShowSuggestions(false);
      if (taskPassed) { handleNextAction(); } else { handleRunQuery(); }
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const newSql = currentSql.substring(0, start) + '  ' + currentSql.substring(end);
      handleTextChange(newSql);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  // Sync scroll between textarea and highlight overlay
  const handleScroll = () => {
    if (textareaRef.current && highlightRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
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
          className="relative min-h-[160px] flex font-mono text-[13px] leading-[22px] bg-[#0e141b] cursor-text"
        >
          {/* Line Numbers Gutter */}
          <div className="w-11 select-none py-3 bg-[#0d1217] text-zinc-500 text-right pr-3 font-mono border-r border-zinc-800/80 flex flex-col shrink-0">
            {lines.map((ln) => (
              <div
                key={ln}
                className={`h-[22px] text-[11px] font-medium transition-colors ${
                  ln === activeLine ? 'text-cyan-400 font-bold bg-cyan-950/40 -mr-3 pr-3' : ''
                }`}
              >
                {ln}
              </div>
            ))}
          </div>

          {/* Syntax Highlight + Textarea */}
          <div className="relative flex-1 min-h-[160px]">
            {/* Highlight overlay */}
            <div
              ref={highlightRef}
              aria-hidden="true"
              className="absolute inset-0 p-3 pointer-events-none select-none font-mono text-[13px] leading-[22px] overflow-hidden whitespace-pre-wrap break-words text-zinc-100 z-0"
              dangerouslySetInnerHTML={{ __html: highlightedCode + (currentSql.endsWith('\n') ? '<br />&nbsp;' : '') }}
            />

            {/* Editable Textarea */}
            <textarea
              id="challenge-sql-textarea"
              ref={textareaRef}
              value={currentSql}
              onScroll={handleScroll}
              onChange={(e) => {
                handleTextChange(e.target.value);
                updateCursorAndSuggestions(e.target.value, e.target.selectionStart);
              }}
              onKeyUp={(e) => updateCursorAndSuggestions(currentSql, e.currentTarget.selectionStart)}
              onClick={(e) => updateCursorAndSuggestions(currentSql, e.currentTarget.selectionStart)}
              onKeyDown={handleKeyDown}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
              placeholder={`-- Type your SQL query here\nSELECT name, price\nFROM ${currentTask.primaryTable};`}
              spellCheck={false}
              autoCapitalize="none"
              autoComplete="off"
              autoCorrect="off"
              style={{
                tabSize: 2,
                color: 'transparent',
                caretColor: '#22d3ee',
                WebkitTextFillColor: 'transparent',
              }}
              className="absolute inset-0 w-full h-full p-3 bg-transparent placeholder:text-zinc-500 placeholder:opacity-40 font-mono text-[13px] leading-[22px] resize-none outline-none overflow-y-auto scrollbar-thin border-none block selection:bg-cyan-500/30 whitespace-pre-wrap break-words z-10"
            />

            {/* Autocomplete Popup */}
            {showSuggestions && suggestions.length > 0 && (
              <div
                id="challenge-autocomplete-dropdown"
                className="absolute z-50 bg-[#1c2128] border border-zinc-700 rounded-lg shadow-2xl overflow-hidden py-1 min-w-[150px]"
                style={{ top: `${(activeLine) * 22 + 8}px`, left: '12px' }}
              >
                <div className="px-2 py-0.5 text-[9px] font-mono text-zinc-500 border-b border-zinc-800 uppercase tracking-wider">
                  Suggestions
                </div>
                {suggestions.map((sug, idx) => (
                  <div
                    key={sug}
                    onMouseDown={(e) => { e.preventDefault(); applySuggestion(sug); }}
                    className={`px-3 py-1.5 text-xs font-mono cursor-pointer flex items-center justify-between gap-2.5 transition ${
                      idx === selectedSuggestionIdx
                        ? 'bg-cyan-500/30 text-cyan-200 font-bold'
                        : 'text-zinc-200 hover:bg-zinc-800/80 hover:text-white'
                    }`}
                  >
                    <span className="font-semibold">{sug}</span>
                    <span className="text-[9px] text-zinc-400 px-1.5 rounded bg-zinc-800/80 border border-zinc-700/40">
                      {SQL_KEYWORDS.includes(sug.toUpperCase()) ? 'SQL' : 'COL'}
                    </span>
                  </div>
                ))}
              </div>
            )}
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
