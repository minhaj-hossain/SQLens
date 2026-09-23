'use client';

import React from 'react';
import { JudgmentExercise } from '../../types/curriculum';

/**
 * P1 — task-level reasoning questions (`ValidationRule.judgment`).
 *
 * Rendered above/below the task prompt in PracticeTaskView and
 * IndependentChallengeView. Answers are index-aligned and passed to
 * `runAndGradeSubmission({ judgmentAnswers })`; the validator treats an
 * omitted/null pick as UNANSWERED (fail) and a wrong pick as a failure that
 * surfaces the authored explanation. SQL problems are always reported first —
 * the judgment gate only runs when the query verdict would otherwise pass.
 */
interface JudgmentBlockProps {
  exercises: JudgmentExercise[];
  answers: (number | null)[];
  onChange: (questionIndex: number, optionIndex: number) => void;
  disabled?: boolean;
}

const LETTERS = ['A', 'B', 'C', 'D', 'E'];

export const JudgmentBlock: React.FC<JudgmentBlockProps> = ({
  exercises,
  answers,
  onChange,
  disabled = false,
}) => {
  if (!exercises.length) return null;
  return (
    <div className="rounded-xl border border-border bg-surface p-4 space-y-4" data-testid="judgment-block">
      <div className="text-[11px] font-mono font-bold text-text-faint uppercase tracking-wider">
        Reasoning Check — answer to complete the task
      </div>
      {exercises.map((ex, qi) => (
        <div key={qi} className="space-y-2">
          <p className="text-sm text-text leading-relaxed">
            <span className="font-mono text-text-dim mr-1.5">Q{qi + 1}.</span>
            {ex.prompt}
          </p>
          <div className="space-y-1.5">
            {ex.options.map((opt, oi) => {
              const selected = answers[qi] === oi;
              return (
                <button
                  key={oi}
                  type="button"
                  disabled={disabled}
                  onClick={() => onChange(qi, oi)}
                  className={`w-full text-left rounded-md border px-3 py-2 text-sm transition cursor-pointer ${
                    selected
                      ? 'border-func bg-func/10 text-text'
                      : 'border-border bg-surface-2 text-text-dim hover:border-func/50 hover:text-text'
                  }`}
                >
                  <span className="font-mono text-xs mr-2 text-text-faint">{LETTERS[oi] ?? `${oi + 1}.`}</span>
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default JudgmentBlock;
