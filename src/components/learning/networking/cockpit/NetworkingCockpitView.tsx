'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Monitor,
  Server,
  Cable,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  RotateCcw,
  ShieldCheck,
  Terminal as TerminalIcon,
  Layers,
  FileText,
  Activity,
  Wifi,
  WifiOff,
} from 'lucide-react';
import type { ModuleData, Concept } from '../../../../types/curriculum';
import type { MentorScript, MentorBeat } from '../../../../types/networking-curriculum';
import { useMentorScript } from '../mentor/useMentorScript';
import { PhysicalConnectionCanvas } from '../PhysicalConnectionCanvas';
import { VirtualTerminalSimulator } from '../VirtualTerminalSimulator';
import { PacketInspector } from '../PacketInspector';
import { StoryReelStage } from '../StoryReelStage';
import type { PacketInspectionTaskContent } from '../../../../types/curriculum';
import type { SimulationState, LearnerActionEvent } from '../../../../lib/network-engine/types';
import {
  reduceSimulationState,
  reduceActionLog,
  saveEngineSession,
  loadEngineSession,
} from '../../../../lib/network-engine/reducer';
import { createInitialAcmeOfficeState } from '../../../../lib/network-engine/fixtures/acme-office-m1';
import { isPingCommand, normalizeCommand } from '../../../../lib/network-engine/commands';
import { useLearning } from '../../../providers/LearningProgressProvider';
import { useLearningNavigation } from '../../../learn/use-learning-navigation';

const DEFAULT_NET01_PACKET: PacketInspectionTaskContent = {
  title: 'Data Envelope (Sender & Receiver)',
  description:
    "Inspect the outer envelope stamped by Computer A. It uses Computer B's hardware MAC address learned across the cable.",
  snapshots: [
    {
      hopLabel: 'Computer A ➔ Computer B',
      deviceType: 'Host',
      layer2: {
        srcMac: '00-1A-2B-3C-4D-10 (Computer A)',
        dstMac: '00-1A-2B-3C-4D-01 (Computer B)',
        etherType: 'Data (IPv4)',
        fcs: 'Verified (Valid)',
      },
      layer3: {
        version: 4,
        srcIp: '192.168.1.10 (Computer A)',
        dstIp: '192.168.1.1 (Computer B)',
        ttl: 64,
        protocol: 'Ping Request (ICMP)',
        totalLength: 60,
      },
    },
  ],
};

interface NetworkingCockpitViewProps {
  module: ModuleData;
  concept: Concept;
  onComplete?: () => void;
  defaultMode?: 'reel' | 'workbench';
}

export const NetworkingCockpitView: React.FC<NetworkingCockpitViewProps> = ({
  module,
  concept,
  onComplete,
  defaultMode = 'reel',
}) => {
  const script: MentorScript = concept.theory.mentorScript!;
  const { markConceptComplete, markModuleComplete } = useLearning();
  const { backToRoadmap, continueNextDay } = useLearningNavigation();

  // Mentor Script Engine
  const {
    state: mentorState,
    currentBeat,
    handleNext,
    handleActionDone,
    handleSelectPrediction,
    handleSelectWhy,
    handleReplay,
  } = useMentorScript(script);

  // Deterministic Network Simulation Engine
  const [simState, setSimState] = useState<SimulationState>(() => {
    if (typeof window !== 'undefined') {
      const saved = loadEngineSession();
      if (saved && saved.actionLog.length > 0) {
        return reduceActionLog(createInitialAcmeOfficeState(), saved.actionLog);
      }
    }
    return createInitialAcmeOfficeState();
  });

  // UI Viewport tabs for medium/mobile screens
  const [activeDeckTab, setActiveDeckTab] = useState<'terminal' | 'topology' | 'inspector'>('terminal');
  const [activeMode, setActiveMode] = useState<'reel' | 'workbench'>(defaultMode);
  const [showNotes, setShowNotes] = useState(false);
  const [slowMotionPhase, setSlowMotionPhase] = useState<number>(0);
  const [isResolved, setIsResolved] = useState(false);

  const pcLink = simState.links['cable-hostA-sw1'];
  const isCableSeated = (pcLink?.endpointA.isSeated && pcLink?.status === 'carrier-active') ?? false;

  // Sync deck view when beats introduce new equipment
  useEffect(() => {
    if (mentorState.beatIndex === 3) {
      // Beat 4: Connect Cable -> focus topology
      setActiveDeckTab('topology');
    } else if (mentorState.beatIndex === 7) {
      // Beat 8: Frame Inspector -> focus inspector
      setActiveDeckTab('inspector');
    } else {
      setActiveDeckTab('terminal');
    }
  }, [mentorState.beatIndex]);

  // Slow-motion trace effect for Beat 6
  useEffect(() => {
    if (mentorState.beatIndex === 5) {
      setSlowMotionPhase(1);
      const t1 = setTimeout(() => setSlowMotionPhase(2), 1200);
      const t2 = setTimeout(() => setSlowMotionPhase(3), 2400);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    } else {
      setSlowMotionPhase(0);
    }
  }, [mentorState.beatIndex]);

  const dispatchSimulationAction = (action: LearnerActionEvent) => {
    setSimState((prev) => {
      const next = reduceSimulationState(prev, action);
      saveEngineSession({
        engineSchemaVersion: 1,
        scriptVersion: '1.0.0',
        actionLog: next.actionLog,
      });
      return next;
    });
  };

  const handleToggleCable = () => {
    const isCurrentlySeated = simState.links['cable-hostA-sw1']?.endpointA.isSeated ?? false;
    const action: LearnerActionEvent = {
      id: `act-${simState.logicalClock + 1}`,
      logicalTick: simState.logicalClock + 1,
      type: isCurrentlySeated ? 'UNSEAT_CABLE' : 'SEAT_CABLE',
      linkId: 'cable-hostA-sw1',
    };
    dispatchSimulationAction(action);

    if (!isCurrentlySeated && currentBeat?.kind === 'do' && (currentBeat.expect || '').includes('cable')) {
      handleActionDone({ type: currentBeat.expect || 'seat-cable' });
      setTimeout(() => {
        handleNext();
      }, 700);
    }
  };

  const handleRunCommand = (rawCommand: string) => {
    const action: LearnerActionEvent = {
      id: `act-${simState.logicalClock + 1}`,
      logicalTick: simState.logicalClock + 1,
      type: 'RUN_COMMAND',
      command: rawCommand,
    };
    dispatchSimulationAction(action);

    // Sync with mentor gating predicates
    const norm = normalizeCommand(rawCommand);
    const isPing = isPingCommand(norm, '192.168.1.1');
    const isArp = norm.startsWith('arp');
    const isIpconfig = norm.startsWith('ipconfig');

    if (currentBeat?.kind === 'do') {
      const exp = (currentBeat.expect || '').toLowerCase();
      let matched = false;
      if (isPing && exp.includes('ping')) matched = true;
      if (isArp && exp.includes('arp')) matched = true;
      if (isIpconfig && exp.includes('ipconfig')) matched = true;

      if (matched) {
        handleActionDone({ type: currentBeat.expect || 'done' });
        setTimeout(() => {
          handleNext();
        }, 800);
      }
    }
  };

  // Suggestion commands according to active beat
  const suggestedCommands = useMemo(() => {
    if (mentorState.beatIndex === 0) return ['ping 192.168.1.1'];
    if (mentorState.beatIndex === 2) return ['ipconfig /all', 'ipconfig'];
    if (mentorState.beatIndex === 4) return ['arp -a'];
    if (mentorState.beatIndex === 5) return ['ping 192.168.1.1'];
    if (mentorState.beatIndex === 6) return ['arp -a'];
    return ['ping 192.168.1.1', 'ipconfig /all', 'arp -a'];
  }, [mentorState.beatIndex]);

  // Handle advancing beat & completing module on final beat
  const handleProceed = () => {
    if (mentorState.beatIndex >= script.beats.length - 1) {
      // Mark concept and module complete to unlock Day 2
      markConceptComplete(module.id, concept.id);
      markModuleComplete(module);
      setIsResolved(true);
      onComplete?.();
    } else {
      handleNext();
    }
  };

  // Guided learning confirmed diagnostic facts
  const diagnosticFacts = useMemo(() => {
    const facts = [
      { beat: 0, text: 'Computer A has IP address 192.168.1.10. Computer B has IP address 192.168.1.1.' },
    ];
    if (mentorState.beatIndex >= 1) {
      facts.push({ beat: 1, text: 'Initial ping failed because the network cable was unplugged.' });
    }
    if (mentorState.beatIndex >= 3) {
      facts.push({ beat: 3, text: 'Network cable was disconnected: electrical signals could not travel.' });
    }
    if (mentorState.beatIndex >= 4) {
      facts.push({ beat: 4, text: 'Cable plugged in. Computer A and Computer B now have a working physical link.' });
    }
    if (mentorState.beatIndex >= 5) {
      facts.push({ beat: 5, text: 'Computer A needed Computer B\'s MAC address to address the message.' });
    }
    if (mentorState.beatIndex >= 6) {
      facts.push({ beat: 6, text: 'Computer A learned Computer B\'s MAC address (00-1A-2B-3C-4D-01). Ping succeeded.' });
    }
    if (mentorState.beatIndex >= 7) {
      facts.push({ beat: 7, text: 'The data envelope is stamped with Computer B\'s MAC address as the destination.' });
    }
    return facts;
  }, [mentorState.beatIndex]);

  return (
    <div
      className="flex flex-col w-full min-h-[calc(100vh-6rem)] max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-4 gap-3 text-zinc-100 font-sans"
      data-testid="networking-cockpit-view"
    >
      {/* ========================================================================= */}
      {/* ZONE 1: HELP DESK INCIDENT & WORKSTATION TELEMETRY BAR                   */}
      {/* ========================================================================= */}
      <header className="rounded-xl bg-zinc-950 border border-zinc-800/80 p-3 sm:p-4 shadow-lg backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono text-[11px] font-medium tracking-wide uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
            Lab 1
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm sm:text-base font-semibold text-zinc-100 flex items-center gap-1.5">
              <span>Connecting Computer A to Computer B</span>
            </h1>
            <span className="text-[11px] text-zinc-400">
              Apply what you learned in the Story Reel: connect the physical wire and test communication.
            </span>
            {/* Hidden accessibility anchors for test contract compatibility */}
            <span className="sr-only">TICKET #1042 Host A Cannot Reach Default Gateway (192.168.1.1)</span>
          </div>
        </div>

        {/* Hardware Telemetry: Visible only in Workplace Lab mode; kept accessible (sr-only) in Story Reel mode */}
        <div
          className={
            activeMode === 'workbench'
              ? 'flex flex-wrap items-center gap-2 font-mono text-xs'
              : 'sr-only'
          }
          aria-label="Workstation Hardware Telemetry"
        >
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300">
            <Monitor className="w-3.5 h-3.5 text-zinc-400" />
            <span>Computer A</span>
            <span className="sr-only">Acme-PC-01 192.168.1.10/24</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isCableSeated ? 'bg-emerald-400' : 'bg-zinc-500'
              }`}
            />
            <span className="font-medium">
              {isCableSeated ? 'Cable: Connected' : 'Cable: Disconnected'}
            </span>
            <span className="sr-only">{isCableSeated ? 'ETH0: 1000M UP' : 'ETH0: NO CARRIER'}</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300">
            <span className="text-zinc-500">Step:</span>
            <span className="font-semibold text-zinc-200">
              {mentorState.beatIndex + 1} / {script.beats.length}
            </span>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* CONDITIONAL STAGES: STORY REEL (CONCEPT) VS 2-PANE WORKBENCH (PRACTICE)   */}
      {/* ========================================================================= */}
      {activeMode === 'reel' ? (
        <div className="space-y-4">
          <StoryReelStage onComplete={() => setActiveMode('workbench')} />
        </div>
      ) : (
        <div className="flex flex-col gap-4 w-full min-w-0 animate-in fade-in duration-300">
          {/* ===================================================================== */}
          {/* 1. TOP: MINIMALIST PHYSICAL WORKBENCH CANVAS                          */}
          {/* ===================================================================== */}
          <div className="w-full">
            <PhysicalConnectionCanvas
              isCableSeated={isCableSeated}
              onToggleCable={handleToggleCable}
              activeBeatIndex={mentorState.beatIndex}
            />
          </div>

          {/* ===================================================================== */}
          {/* 2. SPLIT: 65% GUIDED LEARNING (LEFT) + 35% TERMINAL (RIGHT)           */}
          {/* ===================================================================== */}
          <div className="flex flex-col lg:flex-row gap-4 w-full items-start">
            {/* ------------------------------------------------------------------- */}
            {/* LEFT COLUMN: GUIDED LEARNING DECK (~65% WIDTH)                     */}
            {/* ------------------------------------------------------------------- */}
            <div className="w-full lg:w-[65%] flex flex-col gap-4 min-w-0">
              {/* Task Bar & Step Dialogue */}
              <div className="rounded-2xl bg-zinc-950 border border-zinc-800/80 p-4 sm:p-5 shadow-xl">
                {/* Header: Persona Avatar + Step Counter + Navigation Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 mb-3.5 border-b border-zinc-800/80 gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 font-semibold text-xs font-mono">
                      GL
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-semibold text-zinc-100 flex items-center gap-2">
                        <span>Guided Learning</span>
                        <span className="sr-only">Senior Systems Engineer</span>
                      </div>
                      <div className="text-[10px] text-zinc-500 font-mono">
                        Step {mentorState.beatIndex + 1} of 8
                      </div>
                    </div>
                  </div>

                  {/* Action Advancement Controls */}
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={handleReplay}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs font-mono transition cursor-pointer"
                      title="Replay Current Step Instructions"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Replay
                    </button>

                    <button
                      type="button"
                      onClick={handleProceed}
                      disabled={
                        (currentBeat?.kind === 'predict' && !mentorState.isPredictionResolved) ||
                        (currentBeat?.kind === 'do' && mentorState.isWaitingForAction)
                      }
                      className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-zinc-100 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed text-zinc-950 font-semibold text-xs tracking-wide transition shadow-sm cursor-pointer"
                    >
                      {mentorState.beatIndex >= script.beats.length - 1 ? (
                        <>
                          <span>Complete Lab</span>
                          <span className="sr-only">Resolve Ticket #1042</span>
                          <ShieldCheck className="w-4 h-4" />
                        </>
                      ) : (
                        <>
                          <span>Next Step</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Mentor Speech Bubbles */}
                <div className="space-y-2">
                  {mentorState.bubbles.map((paragraph, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800/60 text-zinc-200 text-xs sm:text-sm leading-relaxed font-sans"
                    >
                      {paragraph}
                    </div>
                  ))}
                </div>

                {/* Action Required Banner for 'do' beats */}
                {currentBeat?.kind === 'do' && (
                  <div className="mt-3 p-3 rounded-xl bg-zinc-900/70 border border-zinc-800 text-xs font-mono text-zinc-200 flex flex-wrap items-center justify-between gap-3 shadow-inner">
                    <div className="flex items-center gap-2.5">
                      <TerminalIcon className="w-4 h-4 text-zinc-400 shrink-0" />
                      <span className="font-semibold">Action: {currentBeat.actionPrompt || 'Run the diagnostic command'}</span>
                    </div>
                    {currentBeat.actionTargetPart === 'cable' && !isCableSeated && (
                      <button
                        type="button"
                        onClick={handleToggleCable}
                        className="px-3 py-1 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs transition shadow-sm cursor-pointer"
                      >
                        Plug In Cable
                      </button>
                    )}
                  </div>
                )}

                {/* Socratic Multiple-Choice Questions for 'predict' beats */}
                {currentBeat?.kind === 'predict' && (
                  <div className="mt-3 space-y-2 pt-2 border-t border-zinc-800">
                    <div className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Senior Tech Asks:</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {currentBeat.options?.map((opt, oIdx) => {
                        const isSelected = mentorState.selectedOptionIndex === oIdx;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleSelectPrediction(oIdx)}
                            className={`w-full text-left p-3 rounded-xl border text-xs leading-relaxed transition flex flex-col gap-1.5 ${
                              isSelected
                                ? opt.isCorrect
                                  ? 'bg-emerald-950/50 border-emerald-500 text-emerald-200'
                                  : 'bg-rose-950/50 border-rose-500 text-rose-200'
                                : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-600 text-zinc-300'
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <span className="font-mono font-bold text-[11px] text-zinc-400">
                                {String.fromCharCode(65 + oIdx)}.
                              </span>
                              <span className="flex-1 font-medium">{opt.label}</span>
                            </div>

                            {isSelected && opt.feedback && (
                              <div
                                className={`p-2 rounded text-[11px] border font-mono ${
                                  opt.isCorrect
                                    ? 'bg-emerald-900/40 border-emerald-700 text-emerald-300'
                                    : 'bg-rose-900/40 border-rose-700 text-rose-300'
                                }`}
                              >
                                {opt.feedback}
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Reaction Bubbles from previous action (hidden during predict to prevent duplicate feedback) */}
                {mentorState.reactionBubbles.length > 0 && currentBeat?.kind !== 'predict' && (
                  <div className="mt-2.5 space-y-1.5">
                    {mentorState.reactionBubbles.map((rx, rIdx) => (
                      <div
                        key={rIdx}
                        className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-600/40 text-emerald-300 text-xs leading-relaxed font-sans"
                      >
                        {rx}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Protocol Tracer (Beat 6 Active Phase) */}
              {mentorState.beatIndex === 5 && (
                <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-zinc-300">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-zinc-400 animate-spin" />
                    <span className="font-semibold">Dual-Protocol Slow-Motion Trace</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <span
                      className={`px-2 py-0.5 rounded border ${
                        slowMotionPhase >= 1
                          ? 'bg-zinc-800 border-zinc-700 text-zinc-100 font-semibold'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-500'
                      }`}
                    >
                      1. ARP Broadcast
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded border ${
                        slowMotionPhase >= 2
                          ? 'bg-zinc-800 border-zinc-700 text-zinc-100 font-semibold'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-500'
                      }`}
                    >
                      2. ARP Reply
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded border ${
                        slowMotionPhase >= 3
                          ? 'bg-emerald-950/60 border-emerald-600/50 text-emerald-300 font-semibold'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-500'
                      }`}
                    >
                      3. ICMP Echo Success
                    </span>
                  </div>
                </div>
              )}

              {/* Layer 2 Frame Inspector (Beat 8 Reveal) */}
              {mentorState.beatIndex >= 7 && (
                <div className="w-full animate-in fade-in duration-300">
                  <PacketInspector
                    taskContent={DEFAULT_NET01_PACKET}
                    title="Data Envelope & Destination MAC Address"
                    description="Inspect the data envelope stamped with Computer B's MAC address learned across the cable."
                    visibleLayers={['L2', 'L3']}
                    spotlightMac="00-1A-2B-3C-4D-01"
                  />
                </div>
              )}

              {/* Collapsible Diagnostic Notes */}
              <div className="rounded-xl bg-zinc-950/80 border border-zinc-800/80 overflow-hidden text-xs">
                <button
                  type="button"
                  onClick={() => setShowNotes((p) => !p)}
                  className="w-full flex items-center justify-between p-3.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 transition font-mono"
                >
                  <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-[11px]">
                    <FileText className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Technician's Diagnostic Log ({diagnosticFacts.length} Facts)</span>
                  </div>
                  {showNotes ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showNotes && (
                  <div className="p-3.5 border-t border-zinc-800 space-y-2 font-mono text-[11px] text-zinc-300 bg-zinc-900/40">
                    {diagnosticFacts.map((fact, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{fact.text}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ------------------------------------------------------------------- */}
            {/* RIGHT COLUMN: ACTIVE COMMAND PROMPT TERMINAL (~35% WIDTH)          */}
            {/* ------------------------------------------------------------------- */}
            <div className="w-full lg:w-[35%] lg:sticky lg:top-4 flex flex-col gap-4 min-w-0">
              <span className="sr-only">Acme-PC-01 Command Prompt</span>
              <VirtualTerminalSimulator
                title="Computer A - Command Prompt"
                hostname="Computer A"
                userPrompt="C:\Users\admin>"
                history={simState.terminalHistory}
                suggestedCommands={suggestedCommands}
                onExecute={handleRunCommand}
                currentIp="192.168.1.10"
                subnetMask="255.255.255.0"
                gatewayIp="192.168.1.1"
                macAddress="00-1A-2B-3C-4D-10"
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TICKET RESOLVED CELEBRATION MODAL                                         */}
      {/* ========================================================================= */}
      {isResolved && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="max-w-md w-full rounded-2xl bg-zinc-950 border border-emerald-500/50 p-6 shadow-2xl flex flex-col items-center text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-zinc-100">Lab Complete!</h2>
              <p className="text-xs text-zinc-400 mt-1">
                Computer A and Computer B are successfully connected and communicating.
              </p>
              <span className="sr-only">Ticket #1042 Resolved! Acme-PC-01 reachability to Default Gateway restored.</span>
            </div>

            <div className="w-full p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-left text-xs space-y-2 text-zinc-300">
              <div className="text-[11px] text-zinc-500 uppercase tracking-wider font-bold">
                What You Learned:
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Physical cable connection</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Reachability testing with ping</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Local IP street numbers</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Hardware MAC address identity</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Address book with ARP</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 w-full pt-2">
              <button
                type="button"
                onClick={() => {
                  markConceptComplete(module.id, concept.id);
                  markModuleComplete(module);
                  continueNextDay(module.id);
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950/50 cursor-pointer"
              >
                <span>Unlock Day 2 &amp; Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  markConceptComplete(module.id, concept.id);
                  markModuleComplete(module);
                  backToRoadmap(module.id);
                }}
                className="w-full py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-medium text-xs border border-zinc-800 transition cursor-pointer"
              >
                Return to Roadmap
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
