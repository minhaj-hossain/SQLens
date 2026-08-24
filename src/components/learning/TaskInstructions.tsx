import React, { useState } from 'react';
import { PracticeTask, Concept } from '../../types/curriculum';
import { BookOpen, CheckCircle2, Lightbulb, HelpCircle, Code, Eye, Copy, Check } from 'lucide-react';

interface TaskInstructionsProps {
  task: PracticeTask;
  taskIndex: number;
  totalTasks: number;
  concept: Concept;
  isCompleted?: boolean;
  onBackToLesson?: () => void;
  onUseHint?: (level: number) => void;
  onViewSolution?: () => void;
}

export const TaskInstructions: React.FC<TaskInstructionsProps> = ({
  task,
  taskIndex,
  totalTasks,
  concept,
  isCompleted = false,
  onBackToLesson,
  onUseHint,
  onViewSolution,
}) => {
  const [hintLevel, setHintLevel] = useState<number>(0);
  const [showSolutionModal, setShowSolutionModal] = useState(false);
  const [copiedSolution, setCopiedSolution] = useState(false);

  const handleNextHint = () => {
    const nextLvl = Math.min(hintLevel + 1, task.hints.length);
    setHintLevel(nextLvl);
    if (onUseHint) onUseHint(nextLvl);
  };

  const handleCopySolution = () => {
    navigator.clipboard.writeText(task.solutionSql);
    setCopiedSolution(true);
    if (onViewSolution) onViewSolution();
    setTimeout(() => setCopiedSolution(false), 1500);
  };

  const cleanTitle = task.title.replace(/^Task\s+\d+:\s*/i, '').replace(/`/g, '');
  const cleanDescription = (task.description || '').replace(/`/g, '');

  return (
    <div
      id="task-instructions-container"
      className="flex flex-col bg-[#11171e] rounded-xl border border-zinc-700/60 p-5 shadow-lg relative"
    >
      {/* Top Header: Step Tracker, Title, Status & Lesson Link */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-zinc-700/60">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 text-[11px] font-mono font-bold tracking-wide">
            TASK {taskIndex + 1} OF {totalTasks}
          </span>
          <span className="text-xs font-mono text-zinc-400">
            • {concept.title}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isCompleted && (
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-700/60 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Completed</span>
            </div>
          )}

          {onBackToLesson && (
            <button
              onClick={onBackToLesson}
              className="flex items-center gap-1 text-zinc-400 hover:text-zinc-100 text-xs px-2.5 py-1 rounded-lg hover:bg-zinc-800/80 transition cursor-pointer"
              title="Review concept lesson theory"
            >
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span>Lesson</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Task Title & Description */}
      <div className="py-3">
        <h2 className="text-lg sm:text-xl font-bold text-zinc-100 tracking-tight mb-2">
          {cleanTitle}
        </h2>
        <p className="text-sm text-zinc-300 leading-relaxed font-normal">
          {cleanDescription}
        </p>
      </div>

      {/* Requirements Checklist & Badges */}
      <div className="flex flex-wrap items-center gap-2 py-2 border-t border-zinc-800/80">
        <span className="text-[11px] font-mono font-semibold text-zinc-400 uppercase tracking-wider mr-1">
          Requirements:
        </span>

        {/* Primary Table Badge */}
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-zinc-800/80 border border-zinc-700 text-zinc-200 text-xs font-mono">
          <span className="text-zinc-400">Table:</span>
          <span className="text-cyan-300 font-bold">{task.primaryTable}</span>
        </span>

        {/* Required Columns */}
        {task.validation.requiredColumns && task.validation.requiredColumns.length > 0 && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-zinc-800/80 border border-zinc-700 text-zinc-200 text-xs font-mono">
            <span className="text-zinc-400">Columns:</span>
            <span className="text-amber-300">
              {task.validation.requiredColumns.join(', ')}
            </span>
          </span>
        )}

        {/* Required Row Count or Limit */}
        {task.validation.requiredRowCount !== undefined && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-zinc-800/80 border border-zinc-700 text-zinc-200 text-xs font-mono">
            <span className="text-zinc-400">Rows:</span>
            <span className="text-emerald-300 font-semibold">{task.validation.requiredRowCount}</span>
          </span>
        )}
      </div>

      {/* Progressive Hint Section */}
      <div className="mt-3 pt-3 border-t border-zinc-800/80 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            <span>Need a nudge?</span>
          </div>

          <div className="flex items-center gap-2">
            {task.hints.length > 0 && hintLevel < task.hints.length && (
              <button
                id="request-hint-btn"
                onClick={handleNextHint}
                className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-mono font-semibold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>
                  {hintLevel === 0 ? 'Get Hint' : `Hint ${hintLevel + 1}/${task.hints.length}`}
                </span>
              </button>
            )}

            <button
              id="view-solution-btn"
              onClick={() => {
                setShowSolutionModal(true);
                if (onViewSolution) onViewSolution();
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 transition cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              <span>Solution</span>
            </button>
          </div>
        </div>

        {/* Revealed Hints */}
        {hintLevel > 0 && (
          <div className="space-y-2 mt-1">
            {task.hints.slice(0, hintLevel).map((h, i) => (
              <div
                key={i}
                className="p-3 rounded-lg bg-amber-950/20 border border-amber-500/30 text-xs text-amber-200 font-mono flex items-start gap-2"
              >
                <span className="font-bold text-amber-400 shrink-0">H{i + 1}:</span>
                <span className="leading-relaxed">{h.text}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Solution Modal / Overlay */}
      {showSolutionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#121822] border border-zinc-700 rounded-xl p-5 max-w-lg w-full shadow-2xl space-y-4 text-zinc-100">
            <div className="flex items-center justify-between border-b border-zinc-700/80 pb-3">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-cyan-400" />
                <h3 className="font-mono text-sm font-bold text-zinc-100">Reference Solution</h3>
              </div>
              <button
                onClick={() => setShowSolutionModal(false)}
                className="text-zinc-400 hover:text-zinc-100 p-1 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="relative bg-[#0d1217] p-3 rounded-lg border border-zinc-800 font-mono text-xs text-cyan-300 overflow-x-auto">
              <pre>{task.solutionSql}</pre>
              <button
                onClick={handleCopySolution}
                className="absolute top-2 right-2 p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition cursor-pointer"
                title="Copy solution SQL"
              >
                {copiedSolution ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {task.solutionExplanation && (
              <p className="text-xs text-zinc-300 leading-relaxed font-normal bg-zinc-900/50 p-3 rounded-lg border border-zinc-800">
                {task.solutionExplanation}
              </p>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowSolutionModal(false)}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
