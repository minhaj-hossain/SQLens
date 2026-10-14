'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Zap,
} from 'lucide-react';
import type {
  MentorScript,
  MentorBeat,
} from '../../../../types/networking-curriculum';
import type { MentorState } from './useMentorScript';
import { TermChip } from './TermChip';

interface MentorDialoguePanelProps {
  script: MentorScript;
  currentBeat: MentorBeat | null;
  state: MentorState;
  onNext: () => void;
  onSelectPrediction: (index: number) => void;
  onSelectWhy?: (index: number) => void;
  onSubmitFill?: (values: Record<string, string>) => void;
  onReplay: () => void;
  onHoverTerm?: (partId: string | null) => void;
  onClickTerm?: (partId: string) => void;
  activeSpotlight?: string | null;
}

export const MentorDialoguePanel: React.FC<MentorDialoguePanelProps> = ({
  script,
  currentBeat,
  state,
  onNext,
  onSelectPrediction,
  onSelectWhy,
  onSubmitFill,
  onReplay,
  onHoverTerm,
  onClickTerm,
  activeSpotlight,
}) => {
  const [fillInputs, setFillInputs] = useState<Record<string, string>>({});

  // Reset inputs when beat changes
  useEffect(() => {
    setFillInputs({});
  }, [state.beatIndex]);

  // Keyboard shortcut: Enter advances NEXT if allowed
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
        // If on predict and resolved, or on say/point/debrief
        if (
          currentBeat &&
          (currentBeat.kind === 'say' ||
            currentBeat.kind === 'point' ||
            currentBeat.kind === 'debrief' ||
            (currentBeat.kind === 'predict' && state.isPredictionResolved && state.isWhyResolved) ||
            (currentBeat.kind === 'do' && !state.isWaitingForAction) ||
            (currentBeat.kind === 'fill' && state.isFillResolved))
        ) {
          e.preventDefault();
          onNext();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentBeat, state.isPredictionResolved, state.isWhyResolved, state.isWaitingForAction, state.isFillResolved, onNext]);

  if (!currentBeat) return null;

  /**
   * Parses string with `{{term:key}}` and returns array of string / React nodes
   */
  const renderTextWithTerms = (text: string) => {
    const regex = /\{\{term:([a-zA-Z0-9_-]+)\}\}/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      const termKey = match[1];
      const termDef = script.terms[termKey];
      if (termDef) {
        parts.push(
          <TermChip
            key={`${termKey}-${match.index}`}
            termKey={termKey}
            label={termDef.label}
            partId={termDef.part}
            isActive={activeSpotlight === termDef.part}
            onHover={onHoverTerm}
            onClick={onClickTerm}
          />,
        );
      } else {
        parts.push(termKey);
      }
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts;
  };

  const isAdvanceAllowed =
    (currentBeat.kind === 'say' || currentBeat.kind === 'point' || currentBeat.kind === 'debrief') ||
    (currentBeat.kind === 'do' && !state.isWaitingForAction) ||
    (currentBeat.kind === 'predict' && state.isPredictionResolved && state.isWhyResolved) ||
    (currentBeat.kind === 'fill' && state.isFillResolved);

  return (
    <div
      className="flex flex-col h-full bg-surface border border-border rounded-2xl shadow-lg overflow-hidden min-w-0"
      aria-live="polite"
    >
      {/* Mentor Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface-2/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-func/15 border border-func/30 flex items-center justify-center text-func font-mono font-bold text-xs">
            👨‍🏫
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-bold text-func uppercase tracking-wider">
                Mentor Mode
              </span>
              <span className="text-text-muted text-xs">•</span>
              <span className="text-[11px] font-mono text-text-dim">
                {script.tier === 'shadow'
                  ? 'Stage 1: Shadow the Master'
                  : script.tier === 'call-the-shots'
                    ? 'Stage 3: Call the Shots'
                    : 'Stage 5: Urgent Ticket'}
              </span>
            </div>
            <p className="text-xs font-semibold text-text truncate">
              Step {state.beatIndex + 1} of {script.beats.length}
            </p>
          </div>
        </div>

        {/* Replay Button */}
        <button
          type="button"
          onClick={onReplay}
          className="p-1.5 rounded-lg text-text-dim hover:text-text hover:bg-surface-3 transition-colors focus:outline-none"
          title="Replay this step"
          aria-label="Replay current step"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Chat Transcript Area */}
      <div className="flex-1 p-4 space-y-3.5 overflow-y-auto min-h-0 text-sm">
        {/* Trainer Speech Bubbles */}
        {state.bubbles.map((bubble, i) => (
          <div key={`say-${i}`} className="flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="w-6 h-6 rounded-md bg-func/20 text-func flex items-center justify-center shrink-0 mt-0.5 text-xs">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div className="p-3.5 rounded-2xl rounded-tl-sm bg-surface-2 border border-border text-text leading-relaxed font-sans shadow-sm max-w-[92%]">
              {renderTextWithTerms(bubble)}
            </div>
          </div>
        ))}

        {/* Reactive Trainer Feedback Bubbles (Answers / Actions) */}
        {state.reactionBubbles.map((reaction, i) => {
          const isSuccess = state.isPredictionResolved && state.isWhyResolved;
          return (
            <div
              key={`rx-${i}`}
              className="flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200"
            >
              <div
                className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5 text-xs ${
                  isSuccess
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}
              >
                {isSuccess ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
              </div>
              <div
                className={`p-3.5 rounded-2xl rounded-tl-sm border leading-relaxed font-sans shadow-sm max-w-[92%] ${
                  isSuccess
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                }`}
              >
                {renderTextWithTerms(reaction)}
              </div>
            </div>
          );
        })}

        {/* Nudge / Hint Bubble (After repeated failed attempts) */}
        {state.hintVisible && (
          <div className="flex items-start gap-3 p-3 rounded-xl bg-func/10 border border-func/30 text-text text-xs leading-relaxed animate-in fade-in duration-200">
            <HelpCircle className="w-4 h-4 text-func shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-func block mb-0.5">Trainer Hint:</span>
              Look at the spotlighted element on the stage to evaluate the protocol rule before deciding.
            </div>
          </div>
        )}
      </div>

      {/* Action / Interaction Area (Directly Underneath) */}
      <div className="p-4 border-t border-border bg-surface-2/40 space-y-3">
        {/* DO BEAT: Waiting for student action on stage */}
        {currentBeat.kind === 'do' && (
          <div className="p-3 rounded-xl bg-func/10 border border-func/30 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-mono font-medium text-func">
              <Zap className="w-4 h-4 animate-pulse" />
              <span>
                {state.isWaitingForAction
                  ? `Action Required on Canvas: ${currentBeat.expect ?? 'Operate control'}`
                  : 'Action completed! Click Next to proceed.'}
              </span>
            </div>
          </div>
        )}

        {/* PREDICT BEAT: Options + Paired Why */}
        {currentBeat.kind === 'predict' && (
          <div className="space-y-3">
            {/* Primary Question Options */}
            <div className="space-y-1.5">
              <span className="text-xs font-mono font-bold text-text-muted uppercase tracking-wider block">
                Choose the correct forwarding decision:
              </span>
              <div className="space-y-1.5">
                {currentBeat.options.map((opt, idx) => {
                  const isSelected = state.selectedOptionIndex === idx;
                  const isCorrect = opt.isCorrect;
                  const showResult = isSelected;

                  return (
                    <button
                      key={opt.id || idx}
                      type="button"
                      onClick={() => onSelectPrediction(idx)}
                      disabled={state.isPredictionResolved}
                      className={`w-full text-left p-2.5 rounded-xl border text-xs font-sans transition-all flex items-start gap-2.5 ${
                        showResult && isCorrect
                          ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 font-medium'
                          : showResult && !isCorrect
                            ? 'bg-amber-500/15 border-amber-500/50 text-amber-300'
                            : 'bg-surface-3/70 hover:bg-surface-3 border-border hover:border-func/40 text-text'
                      } ${state.isPredictionResolved ? 'opacity-85 cursor-default' : 'cursor-pointer'}`}
                    >
                      <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center shrink-0 text-[10px] font-mono mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-snug">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Paired Why Selector (Activated once primary prediction passes) */}
            {state.isPredictionResolved && currentBeat.whyPrompt && currentBeat.whyOptions && (
              <div className="space-y-1.5 pt-2 border-t border-border/60 animate-in fade-in duration-200">
                <span className="text-xs font-mono font-bold text-func uppercase tracking-wider block">
                  Why? {currentBeat.whyPrompt}
                </span>
                <div className="space-y-1.5">
                  {currentBeat.whyOptions.map((whyOpt, wIdx) => {
                    const isSelected = state.selectedWhyIndex === wIdx;
                    return (
                      <button
                        key={whyOpt.id || wIdx}
                        type="button"
                        onClick={() => onSelectWhy?.(wIdx)}
                        disabled={state.isWhyResolved}
                        className={`w-full text-left p-2.5 rounded-xl border text-xs font-sans transition-all flex items-start gap-2.5 ${
                          isSelected && whyOpt.isCorrect
                            ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 font-medium'
                            : isSelected && !whyOpt.isCorrect
                              ? 'bg-amber-500/15 border-amber-500/50 text-amber-300'
                              : 'bg-surface-3/70 hover:bg-surface-3 border-border hover:border-func/40 text-text'
                        } ${state.isWhyResolved ? 'opacity-85 cursor-default' : 'cursor-pointer'}`}
                      >
                        <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center shrink-0 text-[10px] font-mono mt-0.5">
                          {String.fromCharCode(65 + wIdx)}
                        </span>
                        <span className="leading-snug">{whyOpt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* FILL BEAT: Form Fields */}
        {currentBeat.kind === 'fill' && (
          <div className="space-y-2.5">
            <span className="text-xs font-mono font-bold text-text-muted uppercase tracking-wider block">
              Enter Calculated Network Parameters:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {currentBeat.fields.map((field) => (
                <div key={field.id} className="space-y-1">
                  <label className="text-[11px] font-mono text-text-dim block">
                    {field.label}:
                  </label>
                  <input
                    type="text"
                    value={fillInputs[field.id] ?? ''}
                    disabled={state.isFillResolved}
                    onChange={(e) =>
                      setFillInputs((prev) => ({ ...prev, [field.id]: e.target.value }))
                    }
                    placeholder={field.helperText ?? field.label}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-surface-3 border border-border text-xs font-mono text-text focus:outline-none focus:border-func"
                  />
                </div>
              ))}
            </div>
            {!state.isFillResolved && (
              <button
                type="button"
                onClick={() => onSubmitFill?.(fillInputs)}
                className="w-full py-2 rounded-xl bg-func hover:bg-func/90 text-white font-mono text-xs font-bold transition-colors"
              >
                Verify Calculated Values
              </button>
            )}
          </div>
        )}

        {/* ADVANCE BUTTON: Next Step */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5">
            {script.beats.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-200 ${
                  idx === state.beatIndex
                    ? 'w-5 bg-func shadow-sm'
                    : idx < state.beatIndex
                      ? 'w-2 bg-emerald-500'
                      : 'w-1.5 bg-surface-3'
                }`}
                title={`Beat ${idx + 1}`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={onNext}
            disabled={!isAdvanceAllowed || state.isCompleted}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-mono text-xs font-bold transition-all shadow-md ${
              isAdvanceAllowed && !state.isCompleted
                ? 'bg-func hover:bg-func/90 text-white cursor-pointer active:scale-95'
                : 'bg-surface-3 text-text-muted border border-border cursor-not-allowed opacity-60'
            }`}
          >
            <span>{state.beatIndex >= script.beats.length - 1 ? 'Finish Module' : 'Next Step'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
