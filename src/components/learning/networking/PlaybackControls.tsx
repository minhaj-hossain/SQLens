'use client';

import React, { useEffect } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  FastForward,
  Lock,
} from 'lucide-react';
import type { SimulationStep } from '../../../types/networking-curriculum';

interface PlaybackControlsProps {
  currentStepIndex: number;
  totalSteps: number;
  currentStep: SimulationStep | null;
  isPlaying: boolean;
  speed: number; // 0.5, 1, 2
  isBlockedByPrediction?: boolean;
  onPlayToggle: () => void;
  onStepForward: () => void;
  onStepBack: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
  className?: string;
}

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  currentStepIndex,
  totalSteps,
  currentStep,
  isPlaying,
  speed,
  isBlockedByPrediction = false,
  onPlayToggle,
  onStepForward,
  onStepBack,
  onReset,
  onSpeedChange,
  className = '',
}) => {
  // Global Keyboard shortcuts: Space toggles play/pause, Left/Right steps
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input/textarea
      if (
        ['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        if (!isBlockedByPrediction) onPlayToggle();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        if (!isBlockedByPrediction && currentStepIndex < totalSteps - 1) onStepForward();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        if (currentStepIndex > 0) onStepBack();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isBlockedByPrediction,
    currentStepIndex,
    totalSteps,
    onPlayToggle,
    onStepForward,
    onStepBack,
  ]);

  const canStepBack = currentStepIndex > 0;
  const canStepForward =
    !isBlockedByPrediction && currentStepIndex < totalSteps - 1;

  return (
    <div
      className={`rounded-2xl border border-border bg-surface-1/90 backdrop-blur-md p-3 sm:p-4 shadow-lg flex flex-col gap-3 ${className}`}
      data-testid="playback-controls"
    >
      {/* Top Bar: Step Indicator & Phase Badge */}
      <div className="flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="font-bold text-text">
            Step {totalSteps > 0 ? currentStepIndex + 1 : 0} of {totalSteps}
          </span>
          {currentStep && (
            <span
              className={`px-2 py-0.5 rounded text-[10.5px] font-semibold uppercase tracking-wider ${
                currentStep.phase === 'source_evaluation'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-func/15 text-func border border-func/30'
              }`}
            >
              {currentStep.phase === 'source_evaluation'
                ? 'Phase 1: Source Ingress'
                : 'Phase 2: Egress Action'}
            </span>
          )}
        </div>

        {/* Prediction Gate Alert */}
        {isBlockedByPrediction && (
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[11px] font-semibold animate-pulse">
            <Lock className="w-3 h-3" />
            <span>Prediction Gate Active</span>
          </div>
        )}
      </div>

      {/* Center Bar: Buttons & Speed Selector */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-border-soft">
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Reset Button */}
          <button
            onClick={onReset}
            disabled={currentStepIndex === 0 && !isPlaying}
            title="Reset Simulation (Cold Start)"
            aria-label="Reset simulation"
            className="p-2 rounded-xl text-text-dim hover:text-text hover:bg-surface-2 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Step Back */}
          <button
            onClick={onStepBack}
            disabled={!canStepBack || isPlaying}
            title="Step Back (Left Arrow)"
            aria-label="Step back"
            className="p-2 rounded-xl text-text-dim hover:text-text hover:bg-surface-2 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          {/* Play / Pause Toggle */}
          <button
            onClick={onPlayToggle}
            disabled={isBlockedByPrediction || currentStepIndex >= totalSteps - 1}
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            aria-label={isPlaying ? 'Pause simulation' : 'Play simulation'}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-xs transition cursor-pointer shadow-md ${
              isPlaying
                ? 'bg-amber-500 text-ink hover:bg-amber-400'
                : 'bg-func text-ink hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Play</span>
              </>
            )}
          </button>

          {/* Step Forward */}
          <button
            onClick={onStepForward}
            disabled={!canStepForward || isPlaying}
            title="Step Forward (Right Arrow)"
            aria-label="Step forward"
            className="p-2 rounded-xl text-text-dim hover:text-text hover:bg-surface-2 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Speed Selector (0.5x, 1x, 2x) */}
        <div className="flex items-center gap-1 bg-surface-2 p-1 rounded-xl border border-border-soft">
          <FastForward className="w-3.5 h-3.5 text-text-muted ml-1 mr-0.5" />
          {[0.5, 1, 2].map((s) => (
            <button
              key={s}
              onClick={() => onSpeedChange(s)}
              aria-label={`Playback speed ${s}x`}
              className={`px-2 py-0.5 rounded-lg text-[10.5px] font-mono transition cursor-pointer ${
                speed === s
                  ? 'bg-func text-ink font-bold shadow-sm'
                  : 'text-text-dim hover:text-text hover:bg-surface-3'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Step Timeline Track */}
      <div className="w-full bg-surface-2 h-1.5 rounded-full overflow-hidden relative">
        <div
          className="bg-func h-full transition-all duration-200 rounded-full"
          style={{
            width: `${totalSteps > 1 ? (currentStepIndex / (totalSteps - 1)) * 100 : 0}%`,
          }}
        />
      </div>
    </div>
  );
};
