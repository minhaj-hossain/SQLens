'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import type { PracticeTask, Concept } from '../../../types/curriculum';
import { submitForTask } from '../../../lib/track-submit';
import { SwitchSimulationLab } from './SwitchSimulationLab';
import { TaskInstructions } from '../TaskInstructions';
import { JudgmentBlock } from '../JudgmentBlock';
import { ArrowRight, CheckCircle2, AlertTriangle, Lightbulb, RotateCcw } from 'lucide-react';

interface NetworkingPracticeTaskViewProps {
  task: PracticeTask;
  taskIndex: number;
  totalTasks: number;
  concept?: Concept;
  conceptIndex?: number;
  totalConcepts?: number;
  isCompleted?: boolean;
  onTaskSuccess: (userSql: string, hintsUsed: number, viewedSolution: boolean) => void;
  onNextTask?: () => void;
  onBack?: () => void;
  backLabel?: string;
  hasChallenge?: boolean;
  isChallenge?: boolean;
}

export const NetworkingPracticeTaskView: React.FC<NetworkingPracticeTaskViewProps> = ({
  task,
  taskIndex,
  totalTasks,
  concept,
  conceptIndex = 0,
  totalConcepts = 1,
  isCompleted = false,
  onTaskSuccess,
  onNextTask,
  onBack,
  backLabel,
  hasChallenge = true,
  isChallenge = false,
}) => {
  const [judgmentAnswers, setJudgmentAnswers] = useState<(number | null)[]>(() =>
    (task.validation.judgment ?? []).map(() => null),
  );
  const [selectedPorts, setSelectedPorts] = useState<number[]>([]);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [viewedSolution, setViewedSolution] = useState(false);
  const [taskPassed, setTaskPassed] = useState(isCompleted);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [isMisconception, setIsMisconception] = useState(false);

  // Sync state when task changes
  useEffect(() => {
    setJudgmentAnswers((task.validation.judgment ?? []).map(() => null));
    setSelectedPorts([]);
    setSelectedOptionIndex(null);
    setHintsUsed(0);
    setViewedSolution(false);
    setTaskPassed(isCompleted);
    setValidationMessage(null);
    setIsMisconception(false);
  }, [task.id, isCompleted]);

  const handleTogglePort = (port: number) => {
    setSelectedPorts((prev) =>
      prev.includes(port) ? prev.filter((p) => p !== port) : [...prev, port].sort((a, b) => a - b),
    );
  };

  const handleCheckSubmission = () => {
    // If task has judgment questions, submit via submitForTask
    const outcome = submitForTask({
      task,
      code: selectedOptionIndex !== null ? String(selectedOptionIndex) : '',
      hooks: {
        execute: () => ({ success: true, columns: [], rows: [], rowCount: 0, executionTimeMs: 0 }),
      },
      judgmentAnswers,
      surface: isChallenge ? 'challenge' : 'lesson',
    });

    if (outcome.passed) {
      setTaskPassed(true);
      setValidationMessage(task.successMessage || 'Correct! Prediction verified.');
      setIsMisconception(false);
      onTaskSuccess('', hintsUsed, viewedSolution);
    } else {
      setTaskPassed(false);
      setValidationMessage(
        outcome.feedback ||
          'Your prediction does not match Layer 2 switching rules. Review the CAM table state and try again.',
      );
      setIsMisconception(true);
    }
  };

  // Resolve topology and sequence from task.networking or fallback
  const topology = task.networking?.topology;
  const initialSequence = task.networking?.initialSequence;
  const pendingTx = task.networking?.pendingTransmission;

  const sequence = [
    ...(initialSequence ?? []),
    ...(pendingTx ? [pendingTx] : []),
  ];

  const isLastTask = taskIndex >= totalTasks - 1;
  const nextActionLabel = isLastTask
    ? conceptIndex < totalConcepts - 1
      ? 'Next Concept'
      : hasChallenge
        ? 'Module Challenge'
        : 'Complete Module'
    : 'Next Task';

  const hasTopology = Boolean(topology && topology.length > 0);

  return (
    <motion.div
      key={task.id}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.2 }}
      className="w-full max-w-[1440px] mx-auto space-y-4 sm:space-y-6 px-0 sm:px-4 min-w-0"
      data-testid="networking-practice-task-view"
    >
      {/* 
        SPLIT-PANE RESPONSIVE LAYOUT (per specification §9.2):
        When topology exists: Left: Topology Canvas & Live CAM Table, Right: Instructions & Questions.
        When purely conceptual / addressing: Left: Scenario Instructions & References, Right: Questions & Assessment.
        Mobile (< 768px): Stacked layout.
      */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start w-full min-w-0">
        {hasTopology ? (
          /* LEFT COLUMN: Interactive Network Topology Simulator & CAM Table */
          <div className="lg:col-span-7 xl:col-span-7 flex flex-col gap-4 min-w-0 w-full order-1">
            <SwitchSimulationLab
              hosts={topology}
              sequence={sequence}
              enablePredictionGate={false} // Practice exercises have their own explicit form gate
              interactivePortSelection={true}
              selectedPorts={selectedPorts}
              onTogglePort={handleTogglePort}
              title={task.title}
              subtitle={task.description}
            />
          </div>
        ) : (
          /* LEFT COLUMN: Full Instructions and Scenario Context for Non-Topology Tasks */
          <div className="lg:col-span-6 xl:col-span-7 flex flex-col gap-4 min-w-0 w-full order-1">
            {concept ? (
              <TaskInstructions
                task={task}
                taskIndex={taskIndex}
                totalTasks={totalTasks}
                concept={concept}
                isCompleted={taskPassed}
                onUseHint={(lvl) => setHintsUsed((prev) => Math.max(prev, lvl))}
                onViewSolution={() => setViewedSolution(true)}
              />
            ) : (
              <div className="rounded-2xl border border-border bg-surface-1/90 backdrop-blur-md p-5 sm:p-6 shadow-lg space-y-4">
                <div className="space-y-1">
                  <span className="font-mono text-xs font-semibold text-func uppercase tracking-wider">
                    {isChallenge ? 'Module Challenge Task' : 'Network Engineering Task'}
                  </span>
                  <h3 className="font-mono text-base sm:text-lg font-bold text-text">
                    {task.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-text-dim leading-relaxed font-sans">
                    {task.description}
                  </p>
                </div>
                {task.instructions.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-border-soft">
                    <span className="font-mono text-xs font-bold text-text uppercase tracking-wider block">
                      Instructions &amp; Constraints:
                    </span>
                    <ul className="text-xs sm:text-sm text-text space-y-2 list-disc list-inside font-sans">
                      {task.instructions.map((inst, i) => (
                        <li key={i} className="leading-relaxed">{inst}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* RIGHT COLUMN: Questions, Predictions, Options & Action Bar */}
        <div className={`${hasTopology ? 'lg:col-span-5 xl:col-span-5' : 'lg:col-span-6 xl:col-span-5'} flex flex-col gap-4 min-w-0 w-full order-2`}>
          {/* Task Instructions (shown in right column only when topology lab occupies left column) */}
          {hasTopology && concept && (
            <TaskInstructions
              task={task}
              taskIndex={taskIndex}
              totalTasks={totalTasks}
              concept={concept}
              isCompleted={taskPassed}
              onUseHint={(lvl) => setHintsUsed((prev) => Math.max(prev, lvl))}
              onViewSolution={() => setViewedSolution(true)}
            />
          )}

          {/* Reasoning / Prediction Judgment Questions */}
          {(task.validation.judgment?.length ?? 0) > 0 && (
            <div className="rounded-2xl border border-border bg-surface-1/90 backdrop-blur-md p-4 sm:p-5 shadow-lg space-y-3">
              <div className="flex items-center justify-between border-b border-border-soft pb-2.5">
                <h4 className="font-mono text-xs sm:text-sm font-bold uppercase tracking-wider text-text">
                  Prediction &amp; Causal Defense
                </h4>
                <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-surface-2 text-text-dim">
                  Interactive Assessment
                </span>
              </div>

              <JudgmentBlock
                exercises={task.validation.judgment!}
                answers={judgmentAnswers}
                onChange={(qi, oi) => {
                  setJudgmentAnswers((prev) => {
                    const next = [...prev];
                    next[qi] = oi;
                    return next;
                  });
                  setValidationMessage(null);
                }}
                disabled={taskPassed}
              />
            </div>
          )}

          {/* Direct Port Selection Helper (Rendered only when active topology ports exist) */}
          {hasTopology && (topology ?? []).length > 0 && (
            <div className="rounded-2xl border border-border bg-surface-1/90 backdrop-blur-md p-4 shadow-md space-y-2">
              <span className="font-mono text-xs font-semibold text-text-dim uppercase tracking-wider block">
                Direct Port Inspection &amp; Selection:
              </span>
              <div className="flex flex-wrap gap-2">
                {(topology ?? []).map((h) => {
                  const isSelected = selectedPorts.includes(h.port);
                  return (
                    <button
                      key={h.port}
                      onClick={() => handleTogglePort(h.port)}
                      aria-label={`Toggle Port ${h.port}`}
                      className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-func text-ink shadow-md'
                          : 'bg-surface-2 text-text-dim hover:text-text border border-border-soft'
                      }`}
                    >
                      <span>Port {h.port}</span>
                      <span className="text-[10px] opacity-75">({h.name})</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-text-muted font-sans pt-1">
                Click ports on the canvas or the chips above to inspect link connections.
              </p>
            </div>
          )}

          {/* Validation Feedback & Misconception Remediation Banner */}
          {validationMessage && (
            <div
              className={`p-4 rounded-2xl border text-xs sm:text-sm flex items-start gap-3 shadow-md ${
                taskPassed
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                  : 'border-red-500/40 bg-red-500/10 text-red-300'
              }`}
              data-testid="task-validation-message"
            >
              {taskPassed ? (
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 shrink-0 text-red-400 mt-0.5" />
              )}
              <div className="space-y-1 font-sans">
                <p className="font-bold">
                  {taskPassed ? 'Task Completed!' : 'Incorrect Prediction:'}
                </p>
                <p className="leading-relaxed opacity-95">{validationMessage}</p>
              </div>
            </div>
          )}

          {/* Action Bar: Check Prediction / Next Task */}
          <div className="flex items-center justify-between gap-3 pt-2">
            {onBack && (
              <button
                onClick={onBack}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-text-dim hover:text-text hover:bg-surface-2 transition cursor-pointer"
              >
                {backLabel || 'Back'}
              </button>
            )}

            <div className="flex items-center gap-2 ml-auto">
              {!taskPassed ? (
                <button
                  onClick={handleCheckSubmission}
                  data-testid="check-prediction-button"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-func text-ink font-bold text-xs sm:text-sm hover:brightness-110 transition cursor-pointer shadow-lg"
                >
                  <span>Check Prediction</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={onNextTask}
                  data-testid="next-task-button"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-ink font-bold text-xs sm:text-sm hover:bg-emerald-400 transition cursor-pointer shadow-lg"
                >
                  <span>{nextActionLabel}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
