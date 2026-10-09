'use client';

import React, { useState } from 'react';
import { Lock, Unlock, HelpCircle, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export interface PredictionOption {
  id: number;
  label: string;
  egressPorts: number[];
  isCorrect: boolean;
  misconceptionExplanation?: string;
}

interface PredictionGateProps {
  prompt?: string;
  sourceHostName?: string;
  sourceMac?: string;
  ingressPort?: number;
  targetHostName?: string;
  targetMac?: string;
  options?: PredictionOption[];
  onUnlocked: () => void;
  className?: string;
}

const DEFAULT_OPTIONS: PredictionOption[] = [
  {
    id: 0,
    label: 'Flooded out Ports 1, 3, and 4 (All ports except arrival Port 2)',
    egressPorts: [1, 3, 4],
    isCorrect: false,
    misconceptionExplanation:
      'Incorrect: When Host A sent its initial frame, the switch recorded AA:AA:AA:AA:AA:AA on Port 1 in its CAM table. When Host B replies, the destination is KNOWN. Known unicast frames are forwarded only to their destination port — they are never flooded!',
  },
  {
    id: 1,
    label: 'Forwarded ONLY out Port 1 directly to Host A',
    egressPorts: [1],
    isCorrect: true,
    misconceptionExplanation: '',
  },
  {
    id: 2,
    label: 'Flooded out all 4 ports including arrival Port 2 (Ports 1, 2, 3, 4)',
    egressPorts: [1, 2, 3, 4],
    isCorrect: false,
    misconceptionExplanation:
      'Incorrect: Standard switches NEVER reflect or flood a frame out the same port it arrived on (the ingress port). Flooding only reaches the other active ports in the broadcast domain.',
  },
  {
    id: 3,
    label: 'Filtered (discarded) by the switch without forwarding',
    egressPorts: [],
    isCorrect: false,
    misconceptionExplanation:
      'Incorrect: Frames are only filtered (dropped) if the destination MAC is on the EXACT SAME port where the frame entered. Since Host A is on Port 1 and the frame entered on Port 2, it is forwarded.',
  },
];

export const PredictionGate: React.FC<PredictionGateProps> = ({
  prompt = "Host B is sending a reply frame back to Host A. Predict which switch ports this frame will exit before playback can resume:",
  sourceHostName = 'Host B',
  sourceMac = 'BB:BB:BB:BB:BB:BB',
  ingressPort = 2,
  targetHostName = 'Host A',
  targetMac = 'AA:AA:AA:AA:AA:AA',
  options = DEFAULT_OPTIONS,
  onUnlocked,
  className = '',
}) => {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);

  const selectedOption = options.find((o) => o.id === selectedId);

  const handleSubmit = () => {
    if (selectedId === null) return;
    setSubmitted(true);
    if (selectedOption?.isCorrect) {
      setIsUnlocked(true);
      onUnlocked();
    }
  };

  const handleRetry = () => {
    setSubmitted(false);
  };

  return (
    <div
      className={`rounded-2xl border-2 ${
        isUnlocked
          ? 'border-emerald-500/40 bg-emerald-500/5'
          : 'border-amber-500/50 bg-amber-500/5'
      } p-4 sm:p-5 shadow-xl transition-all duration-300 ${className}`}
      data-testid="prediction-gate"
    >
      {/* Gate Status Header */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-border-soft">
        <div className="flex items-center gap-2.5">
          <div
            className={`p-2 rounded-xl ${
              isUnlocked
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-amber-500/20 text-amber-400 animate-pulse'
            }`}
          >
            {isUnlocked ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
          </div>
          <div>
            <h4 className="font-mono text-sm font-bold text-text uppercase tracking-wide flex items-center gap-2">
              <span>{isUnlocked ? 'Prediction Gate: Unlocked' : 'Mandatory Prediction Gate'}</span>
              {!isUnlocked && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-sans normal-case font-medium">
                  Playback Paused
                </span>
              )}
            </h4>
            <p className="text-xs text-text-dim mt-0.5 font-sans">
              Test your causal understanding of switch MAC learning before observing the return event.
            </p>
          </div>
        </div>
      </div>

      {/* Frame Context Card */}
      <div className="mt-3 p-3 rounded-xl bg-surface-2 border border-border-soft font-mono text-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-text-dim">Pending Frame:</span>
          <span className="font-bold text-emerald-400">{sourceHostName} (P{ingressPort})</span>
          <span className="text-text-muted">&rarr;</span>
          <span className="font-bold text-func">{targetHostName} ({targetMac})</span>
        </div>
        <div className="text-[11px] text-text-dim">
          Src: <span className="text-text">{sourceMac}</span> &bull; Ingress: <span className="text-text">Port {ingressPort}</span>
        </div>
      </div>

      {/* Prompt */}
      <p className="mt-3 text-sm font-semibold text-text font-sans leading-snug">
        {prompt}
      </p>

      {/* Options Radio List */}
      <div className="mt-3 space-y-2">
        {options.map((opt) => {
          const isChosen = selectedId === opt.id;
          const showResult = submitted && isChosen;
          const isWrong = showResult && !opt.isCorrect;
          const isRight = showResult && opt.isCorrect;

          return (
            <label
              key={opt.id}
              className={`flex items-start gap-3 p-3 rounded-xl border text-xs sm:text-sm cursor-pointer transition-all ${
                isRight
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-200'
                  : isWrong
                    ? 'border-red-500 bg-red-500/10 text-red-200'
                    : isChosen
                      ? 'border-func bg-func/10 text-text'
                      : 'border-border-soft bg-surface-2/60 hover:bg-surface-2 text-text-dim hover:text-text'
              }`}
            >
              <input
                type="radio"
                name="prediction-option"
                disabled={isUnlocked}
                checked={isChosen}
                onChange={() => {
                  setSelectedId(opt.id);
                  if (submitted) setSubmitted(false);
                }}
                className="mt-0.5 accent-func"
              />
              <div className="flex-1">
                <span className="font-medium font-sans">{opt.label}</span>
                {opt.egressPorts.length > 0 && (
                  <div className="mt-1 flex items-center gap-1.5 text-[11px] font-mono text-text-muted">
                    <span>Target Ports:</span>
                    {opt.egressPorts.map((p) => (
                      <span key={p} className="px-1.5 py-0.2 rounded bg-surface-3 text-text-dim">
                        Port {p}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </label>
          );
        })}
      </div>

      {/* Feedback & Misconception Remediation Banner */}
      {submitted && selectedOption && (
        <div
          className={`mt-4 p-3.5 rounded-xl border flex items-start gap-2.5 text-xs sm:text-sm ${
            selectedOption.isCorrect
              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
              : 'border-red-500/40 bg-red-500/10 text-red-300'
          }`}
          data-testid="prediction-feedback"
        >
          {selectedOption.isCorrect ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 shrink-0 text-red-400 mt-0.5" />
          )}
          <div className="flex-1 space-y-1 font-sans">
            <p className="font-bold">
              {selectedOption.isCorrect
                ? 'Excellent Prediction! Protocol rule verified.'
                : 'Misconception Detected:'}
            </p>
            <p className="text-xs leading-relaxed opacity-95">
              {selectedOption.isCorrect
                ? 'Because Host A transmitted first, the switch already associated AA:AA:AA:AA:AA:AA with Port 1. When Host B replies, the destination lookup succeeds immediately. The frame is unicast solely out Port 1, and other ports remain completely dark!'
                : selectedOption.misconceptionExplanation}
            </p>
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div className="mt-4 flex items-center justify-between pt-2 border-t border-border-soft">
        <div className="flex items-center gap-1.5 text-xs text-text-muted font-sans">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Switches learn on Ingress Source MAC, forward on Destination MAC.</span>
        </div>

        {!isUnlocked ? (
          <button
            onClick={handleSubmit}
            disabled={selectedId === null}
            data-testid="submit-prediction-button"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-func text-ink font-bold text-xs sm:text-sm hover:brightness-110 transition cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>Confirm Prediction</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 font-semibold text-xs font-mono">
            <CheckCircle2 className="w-4 h-4" />
            <span>Unlocked — Ready for Playback</span>
          </div>
        )}
      </div>
    </div>
  );
};
