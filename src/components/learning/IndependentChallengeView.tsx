import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ModuleChallenge, PracticeTask } from '../../types/curriculum';
import { QueryExecutionResult, DatabaseState, TxnStatus } from '../../types/database';
import {
  defaultEditorTab,
  editorSchemaTab,
  editorStarterCode,
  editorSurface,
  idleLensState,
  isPrismaTask,
  isSavedCodeCompatibleWithTask,
  solutionReveal,
  submitForTask,
  typeInspectorState,
  type SqlLensState,
} from '../../lib/track-submit';
import { buildEditorPlaceholder } from '../../lib/task-scaffold';
import { JudgmentBlock } from './JudgmentBlock';
import { useCloseOnOutside } from '../../lib/use-close-on-outside';
import { DATABASE_SCHEMAS } from '../../content/sql/database/schema';
import { readLiveTables, resolveLiveRows, resolveRowCount } from '../../lib/sql-engine/live-table-view';
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
  /** Batch A: durable snapshot — grading compares this, never the session view. */
  getCommittedState?: () => DatabaseState;
  /** Batch B: session txn state — drives the dirty banner. */
  getTransactionState?: () => { status: TxnStatus; uncommittedChanges: number };
  /**
   * P0 FIX (parity with PracticeTaskView): lets fresh-challenge retries reset
   * to seed at submit time so repeated Run & Check stays idempotent.
   * Host (ChallengeView) decides; view only calls for `fresh` lifecycles.
   */
  onResetDatabase?: () => void;
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
import { MonacoCodeEditor, MonacoCodeEditorHandle } from './MonacoCodeEditor';
import { SqlLensPanel } from './SqlLensPanel';
import { PrismaEditorTabs } from './prisma/PrismaEditorTabs';
import { PrismaSchemaTab } from './prisma/PrismaSchemaTab';
import { PrismaTypeInspector } from './prisma/PrismaTypeInspector';
import type { PrismaEditorTab } from '../../lib/track-submit';

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
  getCommittedState,
  getTransactionState,
  onResetDatabase,
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

  // Phase 7: the editor's starter comes from the track (Prisma tasks edit
  // TypeScript, so the SQL scaffold of `initialSql` must NOT load there).
  const cachedInitial = taskSqlCache[currentTask.id];
  const isInitialCompat = isSavedCodeCompatibleWithTask(currentTask, cachedInitial);
  const initialSqlForTask = isInitialCompat && cachedInitial ? cachedInitial : editorStarterCode(currentTask);
  const [currentSql, setCurrentSql] = useState<string>(initialSqlForTask);
  const [executionResult, setExecutionResult] = useState<QueryExecutionResult | null>(null);
  const [taskPassed, setTaskPassed] = useState<boolean>(() => completedTaskIds.includes(currentTask.id) && (isInitialCompat || !cachedInitial));
  const [validationFeedback, setValidationFeedback] = useState<string | null>(null);
  /**
   * Phase 7: Prisma SQL Lens for the current task (`null` on the SQL track —
   * the results section then renders exactly as before).
   */
  const [sqlLens, setSqlLens] = useState<SqlLensState | null>(() => idleLensState(currentTask) ?? null);
  const chrome = editorSurface(currentTask);
  const isPrismaSurface = isPrismaTask(currentTask);
  // Phase 9: schema tab exists on the Prisma track only; `activeTab: 'schema'`
  // opens a task directly on it. Tab state resets on task switch below.
  const schemaTab = editorSchemaTab(currentTask);
  const [editorTab, setEditorTab] = useState<PrismaEditorTab>(() => defaultEditorTab(currentTask));
  const [schemaView, setSchemaView] = useState<'source' | 'diagram'>('source');
  const showSchema = Boolean(schemaTab) && editorTab === 'schema';



  // Progressive Hint States
  const [revealedHintLevel, setRevealedHintLevel] = useState<number>(0);
  // P1: answers to the current task's `validation.judgment` (null = unanswered).
  const [judgmentAnswers, setJudgmentAnswers] = useState<(number | null)[]>(() =>
    (currentTask.validation.judgment ?? []).map(() => null),
  );
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
  const editorRef = useRef<MonacoCodeEditorHandle>(null);

  // Phase 5: 1-based submit counter for the CURRENT task session. Telemetry only
  // — a high attempt count alongside value mismatches is the signal that a
  // challenge's instructions (not the engine) are what learners struggle with.
  const attemptRef = useRef(1);

  // Sync state when selected task changes (tracked by currentTask.id)
  useEffect(() => {
    const isDone = completedTaskIds.includes(currentTask.id);
    const cached = taskSqlCache[currentTask.id];
    const isCompat = isSavedCodeCompatibleWithTask(currentTask, cached);
    // Phase 7: when a completed task reloads, show the track's own reference —
    // TypeScript on the Prisma track, SQL otherwise — never raw `initialSql`.
    const existingSql =
      isCompat && cached
        ? cached
        : (isDone ? solutionReveal(currentTask).code : editorStarterCode(currentTask));
    
    setCurrentSql(existingSql);
    setExecutionResult(null);
    // Phase 7: a new task starts with the LENS IDLE (or absent on the SQL
    // track) — never showing the previous task's generated SQL.
    setSqlLens(idleLensState(currentTask) ?? null);
    // Phase 9: reset the editor tab on task switch so a schema-first task
    // opens on the schema (not on the previous task's leftover code tab).
    setEditorTab(defaultEditorTab(currentTask));
    setSchemaView('source');
    setTaskPassed(isDone && (isCompat || !cached));
    setValidationFeedback(null);
    setRevealedHintLevel(0);
    setFailedAttemptsCount(0);
    setInspectTable(currentTask.primaryTable || 'products');
    attemptRef.current = 1;
    setJudgmentAnswers((currentTask.validation.judgment ?? []).map(() => null));
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

    // Hint 4: reference template in the track's own authoring surface — the
    // TypeScript solution on the Prisma track (its `solutionSql` is the SQL the
    // reference generates, not code the learner could paste into the editor).
    if (solutionReveal(currentTask).code) {
      list.push(`Reference Template:\n${solutionReveal(currentTask).code}`);
    }

    return list;
  }, [currentTask]);

  const maxHints = taskHints.length;

  // Update line number and text
  const handleTextChange = (text: string) => {
    setCurrentSql(text);
    setTaskSqlCache((prev) => ({ ...prev, [currentTask.id]: text }));
    if (taskPassed) setTaskPassed(false);
    if (validationFeedback) setValidationFeedback(null);
  };

  // Submit & grade.
  //
  // Phase 3 (single grading pipeline): this used to inline the same six-step
  // sequence as `PracticeTaskView`, which is how the blocking INSERT bug shipped
  // twice — a fix applied to one view left the other broken. Both now call
  // `submitForTask`, and the audit scripts call it too, so a CI failure
  // is the same failure a learner would hit.
  //
  // Phase 7: `submitForTask` routes a Prisma task to the Prisma pipeline
  // (translate the learner's TypeScript → execute the generated SQL → grade)
  // and everything else to the SQL pipeline.
  // v2 lifecycle: a task-level `databaseLifecycle` overrides the challenge-level
  // one (challenge tasks usually inherit); `fresh` resets to seed at submit so
  // retries are idempotent instead of accumulating rows.
  const handleRunQuery = (sqlToRun?: string) => {
    const sql = typeof sqlToRun === 'string' ? sqlToRun : currentSql;
    const trimmed = sql.trim();
    if (!trimmed) {
      setValidationFeedback(
        isPrismaSurface ? 'Please enter Prisma code before running.' : 'Please enter a SQL query before running.',
      );
      return;
    }

    const outcome = submitForTask({
      task: {
        ...currentTask,
        databaseLifecycle: currentTask.databaseLifecycle ?? challenge.databaseLifecycle,
      },
      code: sql,
      hooks: {
        execute: onExecuteSql,
        getDatabaseState,
        getCommittedState,
        getTransactionState,
        resetDatabase: onResetDatabase,
      },
      judgmentAnswers,
      surface: 'challenge',
      // Phase 5: telemetry only — never affects the verdict.
      attempt: attemptRef.current++,
    });
    // Batch B: the preview grid shows what RAN even when grading is blocked —
    // the verdict banner carries the open-txn warning, not an empty console.
    setExecutionResult(outcome.result ?? null);
    // Phase 7: the Prisma SQL Lens renders whatever was graded.
    if (outcome.lens) setSqlLens(outcome.lens);

    if (outcome.txnBlocked) {
      setTaskPassed(false);
      setValidationFeedback(outcome.feedback ?? null);
      return;
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
        (outcome.result?.error
          ? `SQL execution error: ${outcome.result.error}`
          : isPrismaSurface
            ? 'Your code did not meet this task requirement yet — check the SQL Lens below and the rules in the task card.'
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
  // Phase 2 (live explorer, parity with DatabaseExplorer): read the executor
  // snapshot so the inspector shows the learner's live rows (seed + their own
  // INSERT/UPDATE/DELETE) instead of the static INITIAL_TABLES seed. Keyed on
  // `executionResult` so it re-reads after every Run & Check; falls back to
  // seed when no executor hook is provided (unit tests, static renders).
  const liveTables = useMemo(
    () => readLiveTables(getDatabaseState),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [executionResult, getDatabaseState],
  );
  const inspectKey = inspectTable.toLowerCase();
  const { rows: rawRows, deltaLabel: inspectDeltaLabel } = resolveLiveRows(inspectKey, liveTables);
  const filteredRows = rawRows.filter((r) => {
    if (!dbSearchFilter) return true;
    return Object.values(r).some((val) =>
      String(val ?? '').toLowerCase().includes(dbSearchFilter.toLowerCase())
    );
  });

  const tableRowCount = resolveRowCount(currentTask.primaryTable, liveTables);
  const cleanedPrompt = cleanBackticks(
    (currentTask.title || '').replace(/^Task\s+\d+:\s*/i, '').trim() || 'Complete the challenge task'
  );

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

      {/* P1: reasoning questions attached to this task (if any) */}
      {(currentTask.validation.judgment?.length ?? 0) > 0 && (
        <JudgmentBlock
          exercises={currentTask.validation.judgment!}
          answers={judgmentAnswers}
          onChange={(qi, oi) =>
            setJudgmentAnswers((prev) => {
              const next = [...prev];
              next[qi] = oi;
              return next;
            })
          }
          disabled={taskPassed}
        />
      )}

      {/* 2. SQL EDITOR CENTERPIECE (TypeScript on the Prisma track) */}
      <div className="bg-surface rounded-xl border border-border overflow-visible shadow-lg">
        {/* Editor Top Bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-surface-2 border-b border-border-soft select-none">
          <div className="flex items-center gap-2">
            {schemaTab ? (
              <PrismaEditorTabs active={editorTab} onChange={setEditorTab} className="ml-1" />
            ) : (
              <span className="text-[11px] font-mono text-text-faint font-semibold tracking-wide">
                {isPrismaSurface ? 'TYPESCRIPT' : 'SQL'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Format + Copy + Reset belong to the code surface: the schema tab
                is read-only (it carries its own copy button), and formatting
                TypeScript with the SQL formatter would mangle the code. */}
            {!showSchema && (
              <>
            {/* Format is SQL-only: `formatSql` capitalizes SQL keywords, which
                would mangle Prisma TypeScript — so it hides on that surface. */}
            {!isPrismaSurface && (
              <button
                onClick={handleFormatSql}
                className="flex items-center gap-1 px-2 py-0.5 text-[11px] font-mono text-text-dim hover:text-text hover:bg-surface-2 rounded transition cursor-pointer"
                title="Capitalize SQL keywords"
              >
                <Sparkles className="w-3 h-3 text-text-dim" />
                <span>Format</span>
              </button>
            )}

            <button
              onClick={handleCopySql}
              className="flex items-center gap-1 px-2 py-0.5 text-[11px] font-mono text-text-dim hover:text-text hover:bg-surface-2 rounded transition cursor-pointer"
              title={isPrismaSurface ? 'Copy code' : 'Copy SQL'}
            >
              {copiedSql ? <Check className="w-3 h-3 text-text" /> : <Copy className="w-3 h-3" />}
              <span>{copiedSql ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={() => {
                // Phase 7: reset restores the TRACK's starter (TypeScript on
                // Prisma), not the SQL scaffold of `initialSql`.
                handleTextChange(editorStarterCode(currentTask));
                editorRef.current?.focus();
              }}
              className="flex items-center gap-1 px-2 py-0.5 text-[11px] font-mono text-text-dim hover:text-text hover:bg-surface-2 rounded transition cursor-pointer"
              title={isPrismaSurface ? 'Reset to the task starter code' : 'Reset to the task starter query'}
            >
              <RotateCcw className="w-3 h-3" />
            </button>
              </>
            )}
          </div>
        </div>

        {showSchema && schemaTab ? (
          /* Phase 9: the dedicated schema.prisma surface — the source the SQL
             is generated from, plus the live ERD of that same string. */
          <PrismaSchemaTab
            source={schemaTab.source}
            label={schemaTab.label}
            caption={schemaTab.caption}
            activeView={schemaView}
            onViewChange={setSchemaView}
          />
        ) : (
        <MonacoCodeEditor
          ref={editorRef}
          value={currentSql}
          onChange={handleTextChange}
          language={isPrismaSurface ? 'typescript' : 'sql'}
          onRun={(sql) => {
            if (taskPassed) handleNextAction();
            else handleRunQuery(sql);
          }}
          placeholder={buildEditorPlaceholder(currentTask)}
          minHeight="200px"
          error={!taskPassed && !isPrismaSurface ? (executionResult?.error ?? null) : null}
          errorPosition={!taskPassed && !isPrismaSurface ? (executionResult?.errorPosition ?? null) : null}
        />
        )}

        {/* Editor Bottom Actions */}
        <div className="flex items-center justify-between px-4 py-3 bg-surface border-t border-border">
          <div className="text-xs text-text-dim font-mono flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-surface-2 border border-border text-text text-[10px]">
              Ctrl + Enter
            </kbd>
            <span className="hidden sm:inline">
              {isPrismaSurface ? 'to run & grade' : 'to run query'}
            </span>
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
              <span>
                {validationFeedback ? 'Try Again' : isPrismaSurface ? 'Run & Check' : 'Run Query'}
              </span>
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

            {/* Phase 7: Prisma SQL Lens — label + substituted SQL + per-statement
                result, above the output grid (which on the Prisma track shows the
                rows of the last generated statement). Absent on the SQL track, so
                that render path stays exactly as before. */}
            {sqlLens && <SqlLensPanel lens={sqlLens} className="rounded-xl border border-border" />}

            {/* Phase 9: Type Inspector — derived from the run result (never
                stored), so it always reflects the latest rows, never stale. */}
            {(() => {
              const inspectorState = typeInspectorState(currentTask, executionResult);
              return (
                inspectorState && (
                  <PrismaTypeInspector state={inspectorState} className="rounded-xl border border-border" />
                )
              );
            })()}

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
                        {/* Phase 2: live row counts, so inserts are visible here too */}
                        {tName} ({resolveRowCount(tName, liveTables)} rows)
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
            {/* Phase 2: when the learner's statements changed this table, say so —
                the cryptic "expected 16, found 16" only makes sense once they can
                see their own row landed on top of the seed. */}
            {inspectDeltaLabel && (
              <div className="px-3 pt-2 font-mono text-[10.5px] text-text-dim">
                Showing live data: {inspectDeltaLabel}. New rows appear at the bottom.
              </div>
            )}
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
