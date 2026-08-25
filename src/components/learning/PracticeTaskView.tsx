import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { PracticeTask, Concept } from '../../types/curriculum';
import { QueryExecutionResult } from '../../types/database';
import { TaskInstructions } from './TaskInstructions';
import { DatabaseExplorer } from './DatabaseExplorer';
import { SQLEditor } from './SQLEditor';
import { ResultsConsole } from './ResultsConsole';
import { validateTaskSolution } from '../../lib/sql-engine/validator';
import { ArrowLeft } from 'lucide-react';

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
  onTaskSuccess: (userSql: string, hintsUsed: number, viewedSolution: boolean) => void;
  onPreviousTask?: () => void;
  onNextTask?: () => void;
  onBackToLesson?: () => void;
  canGoBack?: boolean;
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
  onTaskSuccess,
  onPreviousTask,
  onNextTask,
  onBackToLesson,
  canGoBack = false,
  canGoForward = false,
}) => {
  const initialCode = savedSql && savedSql.trim().length > 0 ? savedSql : task.initialSql;
  const [currentSql, setCurrentSql] = useState(initialCode);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [viewedSolution, setViewedSolution] = useState(false);
  const [executionResult, setExecutionResult] = useState<QueryExecutionResult | null>(null);
  const [taskPassed, setTaskPassed] = useState<boolean>(isCompleted);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // Re-sync when switching tasks (tracked by task.id)
  useEffect(() => {
    const codeToSet = savedSql && savedSql.trim().length > 0 ? savedSql : task.initialSql;
    setCurrentSql(codeToSet);
    setExecutionResult(null);
    setTaskPassed(isCompleted);
    setValidationMessage(null);
  }, [task.id]);

  // Run Preview (no grading / validation, purely executes and shows results)
  const handleRunPreview = (sqlToRun: string = currentSql) => {
    const result = onExecuteSql(sqlToRun);
    setExecutionResult(result);
    return result;
  };

  // Submit & Validate
  const handleSubmitAndValidate = (sqlToRun: string = currentSql) => {
    const result = onExecuteSql(sqlToRun);
    setExecutionResult(result);

    const outcome = validateTaskSolution(sqlToRun, result, task.validation);

    if (outcome.passed) {
      setTaskPassed(true);
      setValidationMessage(task.successMessage || 'Output matches expected dataset and query constraints.');
      onTaskSuccess(sqlToRun, hintsUsed, viewedSolution);
    } else {
      setTaskPassed(false);
      const errMsg =
        outcome.feedback ||
        (result.error
          ? `SQL Error: ${result.error}`
          : 'Result did not match the expected dataset. Check your selected columns or filter condition.');
      setValidationMessage(errMsg);
    }

    return result;
  };

  const isLastTask = taskIndex >= totalTasks - 1;
  const nextActionLabel = isLastTask
    ? conceptIndex < totalConcepts - 1
      ? 'Next Concept →'
      : 'Module Challenge →'
    : 'Next Task →';

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
      className="w-full max-w-7xl mx-auto space-y-4 px-2 sm:px-4"
    >
      {/* UNIFIED 4-PANEL RESPONSIVE GRID 
          Desktop (lg: 2-column balanced pairs)
          Tablet (md: stacked 2-column)
          Mobile: Prioritized linear stream: Task (1) -> Editor (2) -> Results (3) -> Data Explorer (4)
      */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        {/* LEFT COLUMN (Desktop): Task Instructions + Database Explorer */}
        <div className="flex flex-col gap-4">
          {/* Order 1 on Mobile: Task Instructions */}
          <div className="order-1">
            <TaskInstructions
              task={task}
              taskIndex={taskIndex}
              totalTasks={totalTasks}
              concept={concept}
              isCompleted={taskPassed || isCompleted}
              onBackToLesson={onBackToLesson}
              onUseHint={(lvl) => setHintsUsed((prev) => Math.max(prev, lvl))}
              onViewSolution={() => setViewedSolution(true)}
            />
          </div>

          {/* Order 4 on Mobile (or below task on desktop): Database Explorer */}
          <div className="order-4 lg:order-2">
            <DatabaseExplorer
              initialTableName={task.primaryTable}
              highlightedColumns={task.validation.requiredColumns}
              onSelectColumn={(colName) => {
                // Click column helper
              }}
            />
          </div>
        </div>

        {/* RIGHT COLUMN (Desktop): SQL Editor + Results Console */}
        <div className="flex flex-col gap-4">
          {/* Order 2 on Mobile: SQL Code Editor */}
          <div className="order-2 lg:order-1">
            <SQLEditor
              value={currentSql}
              tableName={task.primaryTable}
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
            />
          </div>

          {/* Order 3 on Mobile: Results Console */}
          <div className="order-3 lg:order-2">
            <ResultsConsole
              result={executionResult}
              evaluationState={evaluationState}
              validationFeedback={validationMessage}
              sqlQuery={currentSql}
            />
          </div>
        </div>
      </div>

      {/* Navigation Controls Bar */}
      {onPreviousTask && canGoBack && (
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={onPreviousTask}
            className="flex items-center gap-1.5 text-xs font-mono font-medium text-text-dim hover:text-text px-3 py-1.5 rounded-lg bg-surface-2 hover:bg-surface-3 border border-border transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous Task</span>
          </button>
        </div>
      )}
    </motion.div>
  );
};
