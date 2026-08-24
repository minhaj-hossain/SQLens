import React, { useState } from 'react';
import { PracticeTask, Concept } from '../../types/curriculum';
import { BookOpen, CheckCircle2, ChevronDown, ChevronUp, Code, Copy, Check, HelpCircle } from 'lucide-react';

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
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [showSolution, setShowSolution] = useState<boolean>(false);
  const [copiedSolution, setCopiedSolution] = useState<boolean>(false);

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

  // Clean and unify the single task statement without repetitive duplicate phrases
  const rawTitle = (task.title || '').replace(/^Task\s+\d+:\s*/i, '').replace(/`/g, '').trim();
  const rawDesc = (task.description || '').replace(/`/g, '').trim();
  const taskStatement = rawDesc || rawTitle;

  return (
    <div
      id="task-instructions-container"
      className="flex flex-col bg-[#18181b] rounded-xl border border-zinc-800 p-4 sm:p-5 shadow-lg relative text-zinc-100"
    >
      {/* Top Header: Muted Secondary Metadata & Lesson Link */}
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-zinc-800 text-xs">
        <div className="flex items-center gap-1.5 font-mono text-zinc-400">
          <span className="text-white font-bold tracking-wider">
            TASK {taskIndex + 1}/{totalTasks}
          </span>
          <span className="text-zinc-600">•</span>
          <span className="truncate max-w-[180px] sm:max-w-xs">{concept.title}</span>
        </div>

        <div className="flex items-center gap-2">
          {isCompleted && (
            <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-700/40">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Done</span>
            </div>
          )}

          {onBackToLesson && (
            <button
              onClick={onBackToLesson}
              className="flex items-center gap-1 text-zinc-400 hover:text-cyan-300 text-[11px] font-mono px-2 py-0.5 rounded hover:bg-zinc-800 transition cursor-pointer"
              title="Review concept lesson"
            >
              <BookOpen className="w-3 h-3 text-cyan-400" />
              <span>Lesson</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Single Task Statement (Prominent Visual Focus) */}
      <div className="py-3.5">
        <h2 className="text-base sm:text-lg font-bold text-white leading-snug tracking-tight">
          {taskStatement}
        </h2>
      </div>

      {/* Compact Secondary Reference Chips */}
      <div className="flex flex-wrap items-center gap-2 pb-3 pt-1 text-xs font-mono">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300">
          <span className="text-zinc-500">table:</span>
          <span className="text-white font-semibold">{task.primaryTable}</span>
        </span>

        {task.validation.requiredColumns && task.validation.requiredColumns.length > 0 && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300">
            <span className="text-zinc-500">cols:</span>
            <span className="text-zinc-200 font-semibold">
              {task.validation.requiredColumns.join(', ')}
            </span>
          </span>
        )}

        {task.validation.expectedRowCount !== undefined && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300">
            <span className="text-zinc-500">expected rows:</span>
            <span className="text-zinc-200 font-semibold">{String(task.validation.expectedRowCount)}</span>
          </span>
        )}
      </div>

      {/* Single Unified "Need Help?" Progressive Disclosure Section */}
      <div className="mt-1 pt-2.5 border-t border-zinc-800/80">
        <button
          id="toggle-help-btn"
          onClick={() => {
            setIsHelpOpen(!isHelpOpen);
            if (!isHelpOpen && hintLevel === 0 && task.hints.length > 0) {
              setHintLevel(1);
              if (onUseHint) onUseHint(1);
            }
          }}
          className="flex items-center justify-between w-full text-xs font-mono text-zinc-400 hover:text-amber-300 transition py-1 cursor-pointer"
        >
          <div className="flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-medium">Need help with this query?</span>
          </div>
          {isHelpOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {isHelpOpen && (
          <div className="mt-2.5 space-y-2.5 text-xs font-mono">
            {/* Progressive Hints */}
            {task.hints.slice(0, hintLevel).map((hint, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-500/30 text-amber-200 text-xs leading-relaxed"
              >
                <span className="font-bold text-amber-400 mr-1.5">Hint {idx + 1}:</span>
                <span>{hint.text}</span>
              </div>
            ))}

            {/* Next Hint / Reveal Solution Actions */}
            <div className="flex items-center justify-between pt-1">
              {hintLevel < task.hints.length ? (
                <button
                  id="next-hint-btn"
                  onClick={handleNextHint}
                  className="px-2.5 py-1 rounded bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-[11px] font-semibold transition cursor-pointer"
                >
                  Next Hint ({hintLevel + 1}/{task.hints.length})
                </button>
              ) : (
                <span className="text-[11px] text-zinc-500 italic">All hints revealed</span>
              )}

              {!showSolution ? (
                <button
                  id="show-solution-btn"
                  onClick={() => {
                    setShowSolution(true);
                    if (onViewSolution) onViewSolution();
                  }}
                  className="text-[11px] text-zinc-400 hover:text-cyan-300 underline underline-offset-2 transition cursor-pointer"
                >
                  View Solution
                </button>
              ) : null}
            </div>

            {/* Inline Solution Display */}
            {showSolution && (
              <div className="mt-2 p-3 rounded-lg bg-[#0c0c0e] border border-zinc-700 relative text-xs">
                <div className="flex items-center justify-between mb-1.5 text-zinc-400 text-[11px]">
                  <span className="font-bold text-zinc-300 flex items-center gap-1">
                    <Code className="w-3 h-3" /> Solution SQL:
                  </span>
                  <button
                    onClick={handleCopySolution}
                    className="flex items-center gap-1 text-zinc-400 hover:text-zinc-200 cursor-pointer"
                    title="Copy Solution"
                  >
                    {copiedSolution ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>{copiedSolution ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="text-zinc-200 font-mono text-xs overflow-x-auto whitespace-pre-wrap">
                  {task.solutionSql}
                </pre>
                {task.solutionExplanation && (
                  <p className="mt-2 pt-2 border-t border-zinc-800 text-zinc-300 text-[11px] font-sans leading-relaxed">
                    {task.solutionExplanation}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

