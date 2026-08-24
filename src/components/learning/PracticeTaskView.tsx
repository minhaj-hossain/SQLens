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

  // Re-sync when task changes
  useEffect(() => {
    const codeToSet = savedSql && savedSql.trim().length > 0 ? savedSql : task.initialSql;
    setCurrentSql(codeToSet);
    setExecutionResult(null);
    setTaskPassed(isCompleted);
    setValidationMessage(null);
  }, [task.id, task.initialSql, savedSql, isCompleted]);

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
      className="w-full max-w-7xl mx-auto space-y-5"
    >
      {/* SECTION 1 & 2: Top Row - What do I need to do (Task) & What data do I have (Explorer) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left Pane (5 cols): Task Instructions */}
        <div className="lg:col-span-5 flex flex-col">
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

        {/* Right Pane (7 cols): Database Explorer */}
        <div className="lg:col-span-7 flex flex-col">
          <DatabaseExplorer
            initialTableName={task.primaryTable}
            highlightedColumns={task.validation.requiredColumns}
            onSelectColumn={(colName) => {
              // Quick helper: if user clicks a column, optionally insert it or show feedback
            }}
          />
        </div>
      </div>

      {/* SECTION 3 & 4: Bottom Row - What do I write (Editor) & Did I get it right (Results) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left Pane (6 cols): SQL Code Editor */}
        <div className="lg:col-span-6 flex flex-col">
          <SQLEditor
            value={currentSql}
            tableName={task.primaryTable}
            onChange={(newVal) => {
              setCurrentSql(newVal);
              if (evaluationState === 'wrong') {
                setValidationMessage(null);
              }
            }}
            onRun={handleRunPreview}
            onSubmit={handleSubmitAndValidate}
            evaluationState={evaluationState}
            nextActionLabel={nextActionLabel}
            onNextAction={onNextTask}
          />
        </div>

        {/* Right Pane (6 cols): Results & Validation Console */}
        <div className="lg:col-span-6 flex flex-col">
          <ResultsConsole
            result={executionResult}
            evaluationState={evaluationState}
            validationFeedback={validationMessage}
            sqlQuery={currentSql}
          />
        </div>
      </div>

      {/* Navigation Controls Bar */}
      {onPreviousTask && canGoBack && (
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={onPreviousTask}
            className="flex items-center gap-1.5 text-xs font-mono font-medium text-zinc-400 hover:text-zinc-200 px-3 py-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700/60 transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous Task</span>
          </button>
        </div>
      )}
    </motion.div>
  );
};
