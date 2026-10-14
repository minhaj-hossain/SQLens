'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  generateSwitchSimulation,
  type HostNode,
  type FrameTransmission,
  type SimulationStep,
} from '../../../lib/network-engine/switching-sim';
import { SwitchingTopologyCanvas } from './SwitchingTopologyCanvas';
import { MacTableView } from './MacTableView';
import { PlaybackControls } from './PlaybackControls';
import { PredictionGate } from './PredictionGate';
import { Info, Sparkles, BookOpen } from 'lucide-react';

import type { MentorControllable } from '../../../types/networking-curriculum';

const DEFAULT_4_HOSTS: HostNode[] = [
  { id: 'host-a', name: 'Host A', mac: 'AA:AA:AA:AA:AA:AA', port: 1 },
  { id: 'host-b', name: 'Host B', mac: 'BB:BB:BB:BB:BB:BB', port: 2 },
  { id: 'host-c', name: 'Host C', mac: 'CC:CC:CC:CC:CC:CC', port: 3 },
  { id: 'host-d', name: 'Host D', mac: 'DD:DD:DD:DD:DD:DD', port: 4 },
];

const DEFAULT_SEQUENCE: FrameTransmission[] = [
  // Frame 1: Host A sends to Host B (cold start flood)
  { srcMac: 'AA:AA:AA:AA:AA:AA', dstMac: 'BB:BB:BB:BB:BB:BB', ingressPort: 1 },
  // Frame 2: Host B replies to Host A (learned unicast)
  { srcMac: 'BB:BB:BB:BB:BB:BB', dstMac: 'AA:AA:AA:AA:AA:AA', ingressPort: 2 },
];

export interface SwitchSimulationLabProps extends Partial<MentorControllable> {
  hosts?: HostNode[];
  sequence?: FrameTransmission[];
  enablePredictionGate?: boolean;
  predictionGateStepIndex?: number; // Step after which prediction is required (default: 1)
  interactivePortSelection?: boolean;
  selectedPorts?: number[];
  onTogglePort?: (port: number) => void;
  title?: string;
  subtitle?: string;
  className?: string;
}

export const SwitchSimulationLab: React.FC<SwitchSimulationLabProps> = ({
  hosts = DEFAULT_4_HOSTS,
  sequence = DEFAULT_SEQUENCE,
  enablePredictionGate = false,
  predictionGateStepIndex = 1,
  interactivePortSelection = false,
  selectedPorts = [],
  onTogglePort,
  title,
  subtitle,
  className = '',
  visibleParts,
  spotlight,
  controlledStepIndex,
  onAction,
}) => {
  // Pre-generate deterministic simulation steps
  const steps = useMemo(() => {
    return generateSwitchSimulation(hosts, sequence);
  }, [hosts, sequence]);

  const [internalStepIndex, setInternalStepIndex] = useState(0);
  const currentStepIndex = controlledStepIndex !== undefined ? controlledStepIndex : internalStepIndex;
  const setCurrentStepIndex = (val: number | ((prev: number) => number)) => {
    if (controlledStepIndex !== undefined) {
      const nextVal = typeof val === 'function' ? val(currentStepIndex) : val;
      onAction?.({ type: 'step', payload: { stepIndex: nextVal } });
    } else {
      setInternalStepIndex(val);
    }
  };

  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [predictionUnlocked, setPredictionUnlocked] = useState(!enablePredictionGate);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentStep: SimulationStep | null = steps[currentStepIndex] ?? null;

  // Check if simulation is currently paused at prediction gate
  const isAtPredictionPause =
    enablePredictionGate &&
    !predictionUnlocked &&
    currentStepIndex >= predictionGateStepIndex;

  // Auto-play interval
  useEffect(() => {
    if (isPlaying && !isAtPredictionPause) {
      const intervalMs = Math.round(1800 / speed);
      timerRef.current = setInterval(() => {
        setCurrentStepIndex((prev) => {
          const next = prev + 1;
          if (enablePredictionGate && !predictionUnlocked && next > predictionGateStepIndex) {
            setIsPlaying(false);
            return predictionGateStepIndex;
          }
          if (next >= steps.length) {
            setIsPlaying(false);
            return prev;
          }
          return next;
        });
      }, intervalMs);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [
    isPlaying,
    speed,
    steps.length,
    isAtPredictionPause,
    enablePredictionGate,
    predictionUnlocked,
    predictionGateStepIndex,
  ]);

  const handlePlayToggle = () => {
    if (isAtPredictionPause) return;
    if (currentStepIndex >= steps.length - 1) {
      setCurrentStepIndex(0);
      setIsPlaying(true);
    } else {
      setIsPlaying((prev) => !prev);
    }
  };

  const handleStepForward = () => {
    if (isAtPredictionPause) return;
    if (currentStepIndex < steps.length - 1) {
      const next = currentStepIndex + 1;
      if (enablePredictionGate && !predictionUnlocked && next > predictionGateStepIndex) {
        setIsPlaying(false);
        return;
      }
      setCurrentStepIndex(next);
    }
  };

  const handleStepBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
    if (enablePredictionGate) {
      setPredictionUnlocked(false);
    }
  };

  const handlePredictionUnlocked = () => {
    setPredictionUnlocked(true);
  };

  const showMacTable = !visibleParts || visibleParts.has('mac-table');
  const showControls = !visibleParts || visibleParts.has('controls');

  return (
    <div
      className={`space-y-4 w-full select-none ${className}`}
      data-testid="switch-simulation-lab"
    >
      {/* Title / Description if provided */}
      {title && (
        <div className="flex flex-col gap-1 pb-1">
          <h3 className="font-mono text-base sm:text-lg font-bold text-text flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-func" />
            <span>{title}</span>
          </h3>
          {subtitle && <p className="text-xs sm:text-sm text-text-dim">{subtitle}</p>}
        </div>
      )}

      {/* Main Visualizer: Topology Canvas on Top/Left, CAM Table on Bottom/Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Topology View */}
        <div className={showMacTable ? "lg:col-span-7 xl:col-span-8 flex flex-col gap-3 min-w-0" : "lg:col-span-12 flex flex-col gap-3 min-w-0"}>
          <SwitchingTopologyCanvas
            hosts={hosts}
            currentStep={currentStep}
            selectedPorts={selectedPorts}
            onTogglePort={(port) => {
              onTogglePort?.(port);
              onAction?.({ type: 'select-port', payload: { port } });
            }}
            interactivePortSelection={interactivePortSelection}
          />
        </div>

        {/* Live CAM Table (Rendered only when revealed) */}
        {showMacTable && (
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-3 min-w-0 animate-in fade-in duration-300">
            <MacTableView
              entries={currentStep?.macTableSnapshot ?? []}
              activeDecision={currentStep?.decision}
              highlightedPort={currentStep?.highlightedPort}
              highlightedMac={currentStep?.activeFrame?.srcMac}
            />
          </div>
        )}
      </div>

      {/* Step Explanation Card (Rendered only when not in controlled mentor mode) */}
      {!controlledStepIndex && currentStep && (
        <div className="rounded-2xl border border-border bg-surface-1/90 backdrop-blur-md p-4 shadow-md space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-soft pb-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-func uppercase tracking-wider">
                {currentStep.title}
              </span>
            </div>
            <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-surface-2 text-text-dim border border-border-soft">
              Decision: {currentStep.decision}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-text leading-relaxed font-sans">
            {currentStep.description}
          </p>

          <div className="flex items-start gap-2 pt-1 text-xs text-text-muted font-sans border-t border-border-soft/60">
            <BookOpen className="w-4 h-4 shrink-0 text-text-dim mt-0.5" />
            <span className="leading-snug">
              <strong className="text-text-dim">Technical Rule:</strong> {currentStep.technicalRule}
            </span>
          </div>
        </div>
      )}

      {/* Playback Controls (Rendered only when revealed) */}
      {showControls && (
        <PlaybackControls
          currentStepIndex={currentStepIndex}
          totalSteps={steps.length}
          currentStep={currentStep}
          isPlaying={isPlaying}
          speed={speed}
          isBlockedByPrediction={isAtPredictionPause}
          onPlayToggle={() => {
            onAction?.({ type: 'transmit' });
            handlePlayToggle();
          }}
          onStepForward={() => {
            onAction?.({ type: 'step' });
            handleStepForward();
          }}
          onStepBack={handleStepBack}
          onReset={handleReset}
          onSpeedChange={setSpeed}
        />
      )}

      {/* Mandatory Prediction Gate (Visible when pause point reached) */}
      {isAtPredictionPause && (
        <div className="pt-2 animate-fade-in">
          <PredictionGate
            sourceHostName="Host B"
            sourceMac="BB:BB:BB:BB:BB:BB"
            ingressPort={2}
            targetHostName="Host A"
            targetMac="AA:AA:AA:AA:AA:AA"
            onUnlocked={handlePredictionUnlocked}
          />
        </div>
      )}
    </div>
  );
};
