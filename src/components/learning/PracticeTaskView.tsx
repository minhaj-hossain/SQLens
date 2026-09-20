import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { PracticeTask, Concept } from '../../types/curriculum';
import { QueryExecutionResult, DatabaseState } from '../../types/database';
import { runAndGradeSubmission } from '../../lib/sql-engine/submit-pipeline';
import { TaskInstructions } from './TaskInstructions';
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

  // Phase 5: 1-based submit counter for the CURRENT task session. Telemetry only
  // — a high attempt count with value mismatches is the signal that a task's
  // instructions (not the engine) are what learners struggle with.
  const attemptRef = useRef(1);

  // Re-sync when switching tasks (tracked by task.id)
  useEffect(() => {
    const scaffold = splitTaskScaffold(task.initialSql);
    const codeToSet = savedSql && savedSql.trim().length > 0 ? savedSql : scaffold.code;
    setCurrentSql(codeToSet);
    setExecutionResult(null);
    setTaskPassed(isCompleted);
    setValidationMessage(null);
    attemptRef.current = 1;
  }, [task.id]);

  // Run Preview (no grading / validation, purely executes and shows results)
  const handleRunPreview = (sqlToRun: string = currentSql) => {
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
        resetDatabase: onResetDatabase,
      },
      surface: 'lesson',
      // Phase 5: attempt count feeds telemetry only (never the verdict).
      attempt: attemptRef.current++,
    });
    setExecutionResult(outcome.result);

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

          {/* Order 4 on Mobile (or below task on desktop): Database Explorer */}
          <div className="order-4 lg:order-2 min-w-0 w-full">
            <DatabaseExplorer
              initialTableName={task.primaryTable}
              highlightedColumns={task.validation.requiredColumns}
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
