import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { PracticeTask, Concept } from '../../types/curriculum';
import { QueryExecutionResult, DatabaseState, TxnStatus } from '../../types/database';
import { runAndGradeSubmission } from '../../lib/sql-engine/submit-pipeline';
import { TaskInstructions } from './TaskInstructions';
import { JudgmentBlock } from './JudgmentBlock';
import { DatabaseExplorer } from './DatabaseExplorer';
import { SQLEditor } from './SQLEditor';
import { ResultsConsole } from './ResultsConsole';
import { splitTaskScaffold, buildEditorPlaceholder } from '../../lib/task-scaffold';

interface PracticeTaskViewProps {
  task: PracticeTask;
  taskIndex: number;
  totalTasks: number;
  concept: Concept;
  conceptIndex: number;
  totalConcepts: number;
  isCompleted?: boolean;
  savedSql?: string;
  onExecuteSql: (sql: string) => QueryExecutionResult;
  /** F1: snapshot hook — mutation tasks grade by final database state. */
  getDatabaseState?: () => DatabaseState;
  /** Batch A: durable snapshot — grading compares this, never the session view. */
  getCommittedState?: () => DatabaseState;
  /** Batch B: session txn state — drives the dirty banner. */
  getTransactionState?: () => { status: TxnStatus; uncommittedChanges: number };
  /**
   * P0 FIX: idempotent retry for `fresh` tasks. The host (PracticeView) owns
   * resetDatabase; PracticeTaskView calls it at the START of submit so every
   * Run & Check replays from seed instead of accumulating rows across
   * retries (28 -> 29 -> 30 -> 31 ... which made correct INSERTs ungradeable).
   */
  onResetDatabase?: () => void;
  onTaskSuccess: (userSql: string, hintsUsed: number, viewedSolution: boolean) => void;
  onNextTask?: () => void;
  /** P11.2: step-chain Back (task N -> task N-1 -> lesson -> prev-concept task). */
  onBack?: () => void;
  backLabel?: string;
  canGoForward?: boolean;
}

export const PracticeTaskView: React.FC<PracticeTaskViewProps> = ({
  task,
  taskIndex,
  totalTasks,
  concept,
  conceptIndex = 0,
  totalConcepts = 1,
  isCompleted = false,
  savedSql,
  onExecuteSql,
  getDatabaseState,
  getCommittedState,
  getTransactionState,
  onResetDatabase,
  onTaskSuccess,
  onNextTask,
  onBack,
  backLabel,
  canGoForward = false,
}) => {
  // Guidance comments become the editor PLACEHOLDER; only real code loads.
  const taskScaffold = splitTaskScaffold(task.initialSql);
  const initialCode = savedSql && savedSql.trim().length > 0 ? savedSql : taskScaffold.code;
  const [currentSql, setCurrentSql] = useState(initialCode);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [viewedSolution, setViewedSolution] = useState(false);
  const [executionResult, setExecutionResult] = useState<QueryExecutionResult | null>(null);
  const [taskPassed, setTaskPassed] = useState<boolean>(isCompleted);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  // P1: answers to the task's `validation.judgment` (null = unanswered).
  const [judgmentAnswers, setJudgmentAnswers] = useState<(number | null)[]>(() =>
    (task.validation.judgment ?? []).map(() => null),
  );

  // Phase 5: 1-based submit counter for the CURRENT task session. Telemetry only
  // — a high attempt count with value mismatches is the signal that a task's
  // instructions (not the engine) are what learners struggle with.
  const attemptRef = useRef(1);

  // Re-sync when switching tasks (tracked by task.id)
  useEffect(() => {
    const scaffold = splitTaskScaffold(task.initialSql);
    const codeToSet = savedSql && savedSql.trim().length > 0 ? savedSql : scaffold.code;
    setCurrentSql(codeToSet);
    setJudgmentAnswers((task.validation.judgment ?? []).map(() => null));
    setExecutionResult(null);
    setTaskPassed(isCompleted);
    setValidationMessage(null);
    attemptRef.current = 1;
    if (task.setupSql) {
      onExecuteSql(task.setupSql);
    }
  }, [task.id]);

  // Run Preview (no grading / validation, purely executes and shows results)
  const handleRunPreview = (sqlToRun: string = currentSql) => {
    const isDdl = /CREATE\s+TABLE|ALTER\s+TABLE|DROP\s+TABLE|CREATE\s+(?:UNIQUE\s+)?INDEX|DROP\s+INDEX/i.test(task.solutionSql || '');
    if ((task.databaseLifecycle === 'fresh' || (isDdl && task.databaseLifecycle !== 'inherit')) && onResetDatabase) {
      onResetDatabase();
    }
    if (task.setupSql) {
      onExecuteSql(task.setupSql);
    }
    const result = onExecuteSql(sqlToRun);
    setExecutionResult(result);
    return result;
  };

  // Submit & Validate.
  //
  // Phase 3 (single grading pipeline): this used to inline reset → snapshot →
  // execute → snapshot → validate → grade-final-state. That sequence was
  // copy-pasted in `IndependentChallengeView` and (weaker) in `audit-all-tasks`,
  // which is exactly how the blocking INSERT bug shipped twice. It now lives in
  // ONE testable function that the UI and the audits both call, so an audit
  // failure is a real learner-visible failure.
  const handleSubmitAndValidate = (sqlToRun: string = currentSql) => {
    const outcome = runAndGradeSubmission({
      task,
      sql: sqlToRun,
      hooks: {
        execute: onExecuteSql,
        getDatabaseState,
        getCommittedState,
        getTransactionState,
        resetDatabase: onResetDatabase,
      },
      judgmentAnswers,
      surface: 'lesson',
      // Phase 5: attempt count feeds telemetry only (never the verdict).
      attempt: attemptRef.current++,
    });
    // Batch B: the preview grid shows what RAN even when grading is blocked —
    // the verdict banner carries the open-txn warning, not an empty console.
    setExecutionResult(outcome.result);
    if (outcome.txnBlocked) {
      setTaskPassed(false);
      setValidationMessage(outcome.feedback);
      return;
    }

    if (outcome.passed) {
      setTaskPassed(true);
      setValidationMessage(task.successMessage || 'Output matches expected dataset and query constraints.');
      onTaskSuccess(sqlToRun, hintsUsed, viewedSolution);
    } else {
      setTaskPassed(false);
      setValidationMessage(
        outcome.feedback ||
          (outcome.result.error
            ? `SQL Error: ${outcome.result.error}`
            : 'Result did not match the expected dataset. Check your selected columns or filter condition.'),
      );
    }

    return outcome.result;
  };

  const isLastTask = taskIndex >= totalTasks - 1;
  const nextActionLabel = isLastTask
    ? conceptIndex < totalConcepts - 1
      ? 'Next Concept'
      : 'Module Challenge'
    : 'Next Task';

  // Batch B: txn pill reads the last execution result (session view). Open/failed
  // means uncommitted work; none means durable. No extra executor call needed.
  const txnStatus = executionResult?.txnStatus ?? 'none';
  const uncommitted = executionResult?.uncommittedChanges ?? 0;

  const evaluationState =
    executionResult === null
      ? 'idle'
      : taskPassed
      ? 'correct'
      : 'wrong';

  return (
    <motion.div
      key={task.id}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.2 }}
      className="w-full max-w-[1440px] mx-auto space-y-4 sm:space-y-6 px-0 sm:px-4 min-w-0"
    >
      {/* UNIFIED 4-PANEL RESPONSIVE GRID 
          Desktop (lg: 2-column balanced pairs)
          Tablet (md: stacked 2-column)
          Mobile: Prioritized linear stream: Task (1) -> Editor (2) -> Results (3) -> Data Explorer (4)
      */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 sm:gap-4 items-start min-w-0 w-full">
        {/* LEFT COLUMN (Desktop): Task Instructions + Database Explorer */}
        <div className="flex flex-col gap-3.5 sm:gap-4 min-w-0 w-full">
          {/* Order 1 on Mobile: Task Instructions */}
          <div className="order-1 min-w-0 w-full">
            <TaskInstructions
              task={task}
              taskIndex={taskIndex}
              totalTasks={totalTasks}
              concept={concept}
              isCompleted={taskPassed || isCompleted}
              onUseHint={(lvl) => setHintsUsed((prev) => Math.max(prev, lvl))}
              onViewSolution={() => setViewedSolution(true)}
            />
          </div>

          {/* P1: reasoning questions attached to this task (if any) */}
          {(task.validation.judgment?.length ?? 0) > 0 && (
            <div className="order-2 min-w-0 w-full">
              <JudgmentBlock
                exercises={task.validation.judgment!}
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
            </div>
          )}

          {/* Order 4 on Mobile (or below task on desktop): Database Explorer */}
          <div className="order-4 lg:order-2 min-w-0 w-full">
            <DatabaseExplorer
              initialTableName={task.primaryTable}
              highlightedColumns={task.validation.requiredColumns}
              expectedColumns={
                /\b(CREATE\s+TABLE|ALTER\s+TABLE|DROP\s+TABLE|CREATE\s+(?:UNIQUE\s+)?INDEX|DROP\s+INDEX)\b/i.test(
                  task.solutionSql,
                )
                  ? task.validation.requiredColumns
                  : undefined
              }
              getDatabaseState={getDatabaseState}
              refreshKey={executionResult}
              onSelectColumn={(colName) => {
                // Click column helper
              }}
            />
          </div>
        </div>

        {/* RIGHT COLUMN (Desktop): SQL Editor + Results Console */}
        <div className="flex flex-col gap-3.5 sm:gap-4 min-w-0 w-full">
          {/* Batch B: session txn pill — Run shows the session outcome. Open/failed
              means uncommitted work: Submit will refuse until COMMIT/ROLLBACK. */}
          {txnStatus !== 'none' && (
            <div
              className={
                txnStatus === 'failed'
                  ? 'rounded-xl border border-error-border bg-error-bg px-3.5 py-2 font-mono text-[11.5px] text-error-text'
                  : 'rounded-xl border border-border bg-surface px-3.5 py-2 font-mono text-[11.5px] text-text-dim'
              }
            >
              {txnStatus === 'failed'
                ? 'Transaction failed — only ROLLBACK; is legal now. COMMIT cannot save it.'
                : uncommitted > 0
                  ? 'TXN OPEN — ' + uncommitted + ' uncommitted change(s). Run COMMIT; or ROLLBACK; before checking.'
                  : 'TXN OPEN — no durable writes yet. Run COMMIT; or ROLLBACK; before checking.'}
            </div>
          )}

          {/* Order 2 on Mobile: SQL Code Editor */}
          <div className="order-2 lg:order-1 min-w-0 w-full">
            <SQLEditor
              value={currentSql}
              tableName={task.primaryTable}
              placeholder={buildEditorPlaceholder(task)}
              onChange={(newVal) => {
                setCurrentSql(newVal);
                if (evaluationState === 'wrong') {
                  setValidationMessage(null);
                }
              }}
              onRunAndCheck={handleSubmitAndValidate}
              evaluationState={evaluationState}
              nextActionLabel={nextActionLabel}
              onNextAction={onNextTask}
              onBack={onBack}
              backLabel={backLabel}
              resetSql={taskScaffold.code}
              engineError={executionResult?.error ?? null}
            />
          </div>

          {/* Order 3 on Mobile: Results Console */}
          <div className="order-3 lg:order-2 min-w-0 w-full">
            <ResultsConsole
              result={executionResult}
              evaluationState={evaluationState}
              validationFeedback={validationMessage}
              sqlQuery={currentSql}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
