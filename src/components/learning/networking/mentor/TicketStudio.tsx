'use client';

import React, { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Terminal,
  Wrench,
  Activity,
  ArrowRight,
} from 'lucide-react';
import type { TicketScene } from '../../../../types/networking-curriculum';

interface TicketStudioProps<TState = unknown> {
  ticket: TicketScene<TState>;
  onResolved: () => void;
}

export const TicketStudio = <TState,>({
  ticket,
  onResolved,
}: TicketStudioProps<TState>) => {
  const [state, setState] = useState<TState>(ticket.initialState);
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<number | null>(null);
  const [appliedActionIds, setAppliedActionIds] = useState<string[]>([]);
  const [hasVerified, setHasVerified] = useState(false);

  const isDiagnosisCorrect =
    selectedDiagnosis !== null && ticket.diagnosticQuestion.options[selectedDiagnosis]?.isCorrect;

  const isResolved = ticket.isFixed(state);
  const telemetry = ticket.verifyTelemetry(state);

  const handleApplyFix = (actionId: string) => {
    const action = ticket.allowedFixActions.find((a) => a.id === actionId);
    if (!action) return;

    // Apply declarative patch by updating state
    const patch = action.patch;
    setState((prevState) => {
      if (typeof prevState === 'object' && prevState !== null) {
        return {
          ...prevState,
          [patch.target]: patch.value,
        };
      }
      return prevState;
    });

    setAppliedActionIds((prev) => (prev.includes(actionId) ? prev : [...prev, actionId]));
  };

  const handleVerify = () => {
    setHasVerified(true);
    if (isResolved) {
      onResolved();
    }
  };

  return (
    <div className="w-full bg-surface border border-border rounded-2xl p-5 shadow-xl space-y-5 text-text">
      {/* Ticket Header Banner */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                Stage 5 Incident Ticket
              </span>
              <span className="text-text-muted text-xs">•</span>
              <span className="font-mono text-[11px] text-text-dim">#{ticket.id}</span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-text">{ticket.title}</h3>
          </div>
        </div>

        {isResolved && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold animate-in fade-in">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>INCIDENT RESOLVED</span>
          </span>
        )}
      </div>

      {/* Incident Symptom Description */}
      <div className="p-3.5 rounded-xl bg-surface-2 border border-border text-xs sm:text-sm font-sans leading-relaxed text-text">
        <span className="font-mono font-bold text-amber-400 uppercase tracking-wider block mb-1">
          Reported Outage:
        </span>
        {ticket.symptom}
      </div>

      {/* Inspectable Telemetry Components */}
      <div className="space-y-2">
        <span className="font-mono text-xs font-bold text-text-dim uppercase tracking-wider flex items-center gap-1.5">
          <Terminal className="w-3.5 h-3.5 text-func" />
          <span>Diagnostic Telemetry &amp; Evidence:</span>
        </span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {ticket.inspectableComponents.map((comp) => (
            <div
              key={comp.id}
              className="p-3 rounded-xl bg-surface-3/80 border border-border font-mono text-xs space-y-1.5 overflow-x-auto"
            >
              <div className="text-[11px] font-bold text-func border-b border-border-soft pb-1">
                {comp.label}
              </div>
              <pre className="text-[11px] text-text-dim leading-snug whitespace-pre-wrap font-mono">
                {typeof comp.data === 'string' ? comp.data : JSON.stringify(comp.data, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      </div>

      {/* Diagnostic Question: Isolate Root Cause */}
      <div className="space-y-2 pt-2 border-t border-border">
        <span className="font-mono text-xs font-bold text-text-dim uppercase tracking-wider flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <span>Step 1: Isolate the Root Cause</span>
        </span>
        <p className="text-xs text-text font-sans">{ticket.diagnosticQuestion.prompt}</p>
        <div className="space-y-1.5">
          {ticket.diagnosticQuestion.options.map((opt, idx) => {
            const isSelected = selectedDiagnosis === idx;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSelectedDiagnosis(idx)}
                className={`w-full text-left p-3 rounded-xl border text-xs font-sans transition-all flex items-start gap-2.5 ${
                  isSelected
                    ? opt.isCorrect
                      ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 font-medium'
                      : 'bg-amber-500/15 border-amber-500/50 text-amber-300'
                    : 'bg-surface-2 hover:bg-surface-3 border-border text-text'
                }`}
              >
                <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center shrink-0 text-[10px] font-mono mt-0.5">
                  {idx + 1}
                </span>
                <div className="space-y-1">
                  <div>{opt.label}</div>
                  {isSelected && (
                    <div className="text-[11px] font-mono opacity-90 pt-1 border-t border-current/20">
                      {opt.feedback}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Allowed Fix Actions: Apply Declarative Patch */}
      {isDiagnosisCorrect && (
        <div className="space-y-2 pt-2 border-t border-border animate-in fade-in duration-200">
          <span className="font-mono text-xs font-bold text-text-dim uppercase tracking-wider flex items-center gap-1.5">
            <Wrench className="w-3.5 h-3.5 text-func" />
            <span>Step 2: Apply Engineering Remediation</span>
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {ticket.allowedFixActions.map((action) => {
              const isApplied = appliedActionIds.includes(action.id);
              return (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => handleApplyFix(action.id)}
                  disabled={isApplied}
                  className={`p-3 rounded-xl border text-xs font-mono font-medium text-left transition-all ${
                    isApplied
                      ? 'bg-func/15 border-func text-func shadow-sm'
                      : 'bg-surface-2 hover:bg-surface-3 border-border text-text hover:border-func/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{action.label}</span>
                    {isApplied && <CheckCircle2 className="w-4 h-4 text-func shrink-0" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Verification Telemetry Console */}
      {appliedActionIds.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-border animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-text-dim uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-func" />
              <span>Step 3: Verification Telemetry</span>
            </span>
            <button
              type="button"
              onClick={handleVerify}
              className="px-3 py-1.5 rounded-lg bg-func hover:bg-func/90 text-white font-mono text-xs font-bold transition-all shadow-sm"
            >
              Run Verification Ping
            </button>
          </div>

          {hasVerified && (
            <div
              className={`p-3.5 rounded-xl border font-mono text-xs space-y-1.5 ${
                telemetry.success
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              }`}
            >
              <pre className="whitespace-pre-wrap leading-snug">{telemetry.pingOutput}</pre>
              <p className="font-sans text-[11px] pt-1 border-t border-current/20">
                {telemetry.explanation}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
