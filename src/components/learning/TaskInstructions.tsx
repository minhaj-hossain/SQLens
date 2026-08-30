import React, { useState } from 'react';
import { PracticeTask, Concept } from '../../types/curriculum';
import { BookOpen, CheckCircle2, ChevronDown, ChevronUp, Code, Copy, Check, HelpCircle } from 'lucide-react';

interface TaskInstructionsProps {
  task: PracticeTask;
  taskIndex: number;
  totalTasks: number;
  concept: Concept;
  isCompleted?: boolean;
  onUseHint?: (level: number) => void;
  onViewSolution?: () => void;
}

export const TaskInstructions: React.FC<TaskInstructionsProps> = ({
  task,
  taskIndex,
  totalTasks,
  concept,
  isCompleted = false,
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
      className="flex flex-col bg-surface rounded-xl border border-border p-5 relative text-text"
    >
      {/* Top Header: Muted Secondary Metadata & Lesson Link */}
      <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5 pb-2.5 border-b border-border-soft text-xs">
        <div className="flex items-center gap-1.5 font-mono text-[11.5px] text-text-faint min-w-0">
          <span className="tracking-wider shrink-0">
            TASK {taskIndex + 1}/{totalTasks}
          </span>
          <span className="shrink-0">·</span>
          <b className="text-text-dim font-medium truncate">{concept.title}</b>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isCompleted && (
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-text-dim bg-surface-2 px-2.5 py-1 rounded-md border border-border">
              <span className="w-3 h-3 rounded-full bg-done text-ink flex items-center justify-center text-[8px] font-bold leading-none">✓</span>
              <span>Done</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Single Task Statement (Prominent Visual Focus) */}
      <div className="py-3.5">
        <h2 className="font-display text-[19px] font-semibold text-text leading-snug tracking-tight">
          {taskStatement}
        </h2>
      </div>

      {/* Meta strip — TABLE / COLUMNS / EXPECTED ROWS (design `.meta-row`) */}
      <div className="mt-4 flex flex-wrap items-center font-mono text-xs bg-surface-2 border border-border-soft rounded-lg px-4 py-2.5">
        <div className="flex items-center gap-2 pr-4 mr-4 border-r border-border">
          <span className="text-text-faint tracking-wider">TABLE</span>
          <span className="text-text font-semibold">{task.primaryTable}</span>
        </div>

        {task.validation.requiredColumns && task.validation.requiredColumns.length > 0 && (
          <div className="flex items-center gap-2 pr-4 mr-4 border-r border-border">
            <span className="text-text-faint tracking-wider">COLUMNS</span>
            <span className="text-text font-semibold">
              {task.validation.requiredColumns.join(', ')}
            </span>
          </div>
        )}

        {task.validation.expectedRowCount !== undefined && (
          <div className="flex items-center gap-2">
            <span className="text-text-faint tracking-wider">EXPECTED ROWS</span>
            <span className="text-text font-semibold">{String(task.validation.expectedRowCount)}</span>
          </div>
        )}
      </div>

      {/* Single Unified "Need Help?" Progressive Disclosure Section */}
      <div className="mt-4 pt-3.5 border-t border-border-soft">
        <button
          id="toggle-help-btn"
          onClick={() => {
            setIsHelpOpen(!isHelpOpen);
            if (!isHelpOpen && hintLevel === 0 && task.hints.length > 0) {
              setHintLevel(1);
              if (onUseHint) onUseHint(1);
            }
          }}
          className="flex items-center justify-between w-full text-[12.5px] font-body text-text-dim hover:text-text transition py-1 cursor-pointer"
        >
          <div className="flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-text-dim" />
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
                className="p-2.5 rounded-lg bg-surface-2 border border-border-soft text-text text-xs leading-relaxed"
              >
                <span className="font-bold text-text-dim mr-1.5">Hint {idx + 1}:</span>
                <span>{hint.text}</span>
              </div>
            ))}

            {/* Next Hint / Reveal Solution Actions */}
            <div className="flex items-center justify-between pt-1">
              {hintLevel < task.hints.length ? (
                <button
                  id="next-hint-btn"
                  onClick={handleNextHint}
                  className="px-2.5 py-1 rounded bg-surface-2 hover:bg-surface-3 text-text-dim border border-border text-[11px] font-semibold transition cursor-pointer"
                >
                  Next Hint ({hintLevel + 1}/{task.hints.length})
                </button>
              ) : (
                <span className="text-[11px] text-text-faint italic">All hints revealed</span>
              )}

              {!showSolution ? (
                <button
                  id="show-solution-btn"
                  onClick={() => {
                    setShowSolution(true);
                    if (onViewSolution) onViewSolution();
                  }}
                  className="text-[11px] text-text-dim hover:text-text underline underline-offset-2 transition cursor-pointer"
                >
                  View Solution
                </button>
              ) : null}
            </div>

            {/* Inline Solution Display */}
            {showSolution && (
              <div className="mt-2 p-3 rounded-lg bg-ink border border-border relative text-xs">
                <div className="flex items-center justify-between mb-1.5 text-text-dim text-[11px]">
                  <span className="font-bold text-text-dim flex items-center gap-1">
                    <Code className="w-3 h-3" /> Solution SQL:
                  </span>
                  <button
                    onClick={handleCopySolution}
                    className="flex items-center gap-1 text-text-dim hover:text-text cursor-pointer"
                    title="Copy Solution"
                  >
                    {copiedSolution ? (
                      <Check className="w-3 h-3 text-text" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>{copiedSolution ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="text-editor-text font-mono text-xs overflow-x-auto whitespace-pre-wrap">
                  {task.solutionSql}
                </pre>
                {task.solutionExplanation && (
                  <p className="mt-2 pt-2 border-t border-border text-text-dim text-[11px] font-body leading-relaxed">
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
