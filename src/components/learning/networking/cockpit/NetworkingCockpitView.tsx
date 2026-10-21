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
  title: 'Ethernet II Envelope & Dynamic MAC Matching',
  description:
    'Inspect the Layer 2 outer Ethernet packaging stamped with Router R1 discovered MAC address.',
  snapshots: [
    {
      hopLabel: 'Acme-PC-01 ➔ Acme-SW-01 ➔ Acme-RTR-01',
      deviceType: 'Host',
      layer2: {
        srcMac: '00-1A-2B-3C-4D-10',
        dstMac: '00-1A-2B-3C-4D-01',
        etherType: '0x0800 (IPv4)',
        fcs: 'CRC-32 (Valid)',
      },
      layer3: {
        version: 4,
        srcIp: '192.168.1.10',
        dstIp: '192.168.1.1',
        ttl: 64,
        protocol: 'ICMP (1)',
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
  const { backToRoadmap } = useLearningNavigation();

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

    if (!isCurrentlySeated && mentorState.beatIndex === 3) {
      handleActionDone({ type: 'SEAT_CABLE' });
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
    if (isPingCommand(norm, '192.168.1.1')) {
      if (mentorState.beatIndex === 0) {
        handleActionDone({ type: 'PING' });
      } else if (mentorState.beatIndex === 5) {
        handleActionDone({ type: 'PING' });
      }
    } else if (norm.startsWith('ipconfig')) {
      if (mentorState.beatIndex === 2) {
        handleActionDone({ type: 'IPCONFIG' });
      }
    } else if (norm.startsWith('arp')) {
      if (mentorState.beatIndex === 4 || mentorState.beatIndex === 6) {
        handleActionDone({ type: 'ARP' });
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

  // Technician confirmed diagnostic facts notebook
  const diagnosticFacts = useMemo(() => {
    const facts = [
      { beat: 0, text: 'Host A IP 192.168.1.10/24 is assigned statically; default gateway is 192.168.1.1.' },
    ];
    if (mentorState.beatIndex >= 1) {
      facts.push({ beat: 1, text: 'Initial ping failed with "General failure / Media disconnected".' });
    }
    if (mentorState.beatIndex >= 3) {
      facts.push({ beat: 3, text: 'Interface eth0 showed no physical link carrier pulse.' });
    }
    if (mentorState.beatIndex >= 4) {
      facts.push({ beat: 4, text: 'Cat6 patch cable seated into Switch Port 1. 1000BASE-T link established.' });
    }
    if (mentorState.beatIndex >= 5) {
      facts.push({ beat: 5, text: 'ARP table was initially empty; Host A cannot send IPv4 packet without destination MAC.' });
    }
    if (mentorState.beatIndex >= 6) {
      facts.push({ beat: 6, text: 'ARP Request broadcast resolved 192.168.1.1 to 00-1A-2B-3C-4D-01. Ping succeeded.' });
    }
    if (mentorState.beatIndex >= 7) {
      facts.push({ beat: 7, text: 'Ethernet II frame encapsulation stamped with learned router MAC in Layer 2 header.' });
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
      <header className="rounded-xl bg-zinc-950/90 border border-zinc-800 p-3 sm:p-4 shadow-xl backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-rose-950/40 border border-rose-800/60 text-rose-300 font-mono text-[11px] font-bold tracking-wider uppercase">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            TICKET #1042
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm sm:text-base font-bold text-zinc-100 flex items-center gap-1.5">
              <span>Host A Cannot Reach Default Gateway (192.168.1.1)</span>
            </h1>
            <span className="text-[11px] text-zinc-400 font-mono">
              Reported by: Engineering Dept • Priority: High • Assigned: Junior NOC Tech (You)
            </span>
          </div>
        </div>

        {/* Live Hardware Telemetry Pills */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700/60">
            <Monitor className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-zinc-300">Acme-PC-01</span>
            <span className="text-zinc-500 text-[10px]">192.168.1.10/24</span>
          </div>

          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors ${
              isCableSeated
                ? 'bg-emerald-950/50 border-emerald-600/70 text-emerald-300'
                : 'bg-rose-950/50 border-rose-600/70 text-rose-300'
            }`}
          >
            {isCableSeated ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-bold">ETH0: 1000M UP</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                <span className="font-bold">ETH0: NO CARRIER</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700/60 text-zinc-300">
            <span className="text-zinc-500">Phase:</span>
            <span className="font-bold text-emerald-400">
              {mentorState.beatIndex + 1} / {script.beats.length}
            </span>
          </div>

          {/* Mode Selector Tabs: Story Reel vs Workplace Lab */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono ml-auto">
            <button
              onClick={() => setActiveMode('reel')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                activeMode === 'reel'
                  ? 'bg-cyan-500 text-black font-bold shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>🎬</span>
              <span>Story Reel</span>
            </button>
            <button
              onClick={() => setActiveMode('workbench')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                activeMode === 'workbench'
                  ? 'bg-emerald-500 text-black font-bold shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>💻</span>
              <span>Workplace Lab</span>
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* CONDITIONAL STAGES: STORY REEL (CONCEPT) VS 2-PANE WORKBENCH (PRACTICE)   */}
      {/* ========================================================================= */}
      {activeMode === 'reel' ? (
        <div className="space-y-4">
          <StoryReelStage onComplete={() => setActiveMode('workbench')} />
          <div className="flex justify-between items-center px-2 text-xs font-mono text-zinc-400">
            <span>Concept Discovery: Machine Isolation ➔ Copper Medium ➔ Factory MAC</span>
            <button
              onClick={() => setActiveMode('workbench')}
              className="text-cyan-400 hover:underline flex items-center gap-1"
            >
              <span>Jump to Workplace Lab</span>
              <span>➔</span>
            </button>
          </div>
        </div>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start min-w-0">
        {/* ----------------------------------------------------------------------- */}
        {/* LEFT PANE: SENIOR MENTOR CONSOLE (5 COLS ON DESKTOP)                     */}
        {/* ----------------------------------------------------------------------- */}
        <aside className="lg:col-span-5 flex flex-col gap-3 min-w-0">
          <div className="rounded-2xl bg-zinc-950/90 border border-zinc-800 p-4 sm:p-5 shadow-xl flex flex-col justify-between min-h-[500px]">
            <div className="space-y-4">
              {/* Senior Mentor Identity Badge */}
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs font-mono">
                    SR
                  </div>
                  <div>
                    <div className="text-xs font-bold text-zinc-200">Senior Systems Engineer</div>
                    <div className="text-[10px] text-zinc-500 font-mono">Interactive Peer Guidance</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-900 border border-zinc-700 text-zinc-400">
                  Step {mentorState.beatIndex + 1} of 8
                </span>
              </div>

              {/* Speech stream */}
              <div className="space-y-2.5">
                {mentorState.bubbles.map((paragraph, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-700/70 text-zinc-200 text-sm leading-relaxed font-sans shadow-sm"
                  >
                    {paragraph}
                  </div>
                ))}
              </div>

              {/* Action Required Banner for 'do' beats */}
              {currentBeat?.kind === 'do' && (
                <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/40 text-xs font-mono text-indigo-300 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <TerminalIcon className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Action: {currentBeat.actionPrompt || 'Run the diagnostic command'}</span>
                  </div>
                  {currentBeat.actionTargetPart === 'cable' && !isCableSeated && (
                    <button
                      onClick={handleToggleCable}
                      className="px-2.5 py-1 rounded bg-indigo-500 text-white font-bold text-[11px] hover:bg-indigo-400 transition"
                    >
                      Plug In Cable
                    </button>
                  )}
                </div>
              )}

              {/* Socratic Multiple-Choice Questions for 'predict' beats */}
              {currentBeat?.kind === 'predict' && (
                <div className="space-y-2 pt-2">
                  <div className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Senior Tech Asks:</span>
                  </div>
                  <div className="space-y-2">
                    {currentBeat.options?.map((opt, oIdx) => {
                      const isSelected = mentorState.selectedOptionIndex === oIdx;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => handleSelectPrediction(oIdx)}
                          className={`w-full text-left p-3 rounded-xl border text-xs leading-relaxed transition flex flex-col gap-1.5 ${
                            isSelected
                              ? opt.isCorrect
                                ? 'bg-emerald-950/50 border-emerald-500 text-emerald-200'
                                : 'bg-rose-950/50 border-rose-500 text-rose-200'
                              : 'bg-zinc-900/80 border-zinc-700 hover:border-zinc-500 text-zinc-300'
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

              {/* Reaction Bubbles from previous action */}
              {mentorState.reactionBubbles.length > 0 && (
                <div className="space-y-2 pt-2">
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

            {/* Bottom Advancement Controls */}
            <div className="pt-4 mt-4 border-t border-zinc-800 flex items-center justify-between gap-3">
              <button
                onClick={handleReplay}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-400 hover:text-zinc-200 text-xs font-mono transition"
                title="Replay Current Step Instructions"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Replay
              </button>

              <button
                onClick={handleProceed}
                disabled={
                  (currentBeat?.kind === 'predict' && !mentorState.isPredictionResolved) ||
                  (currentBeat?.kind === 'do' && mentorState.isWaitingForAction)
                }
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-950 font-bold text-xs tracking-wide transition shadow-lg shadow-emerald-950/50"
              >
                {mentorState.beatIndex >= script.beats.length - 1 ? (
                  <>
                    <span>Resolve Ticket #1042</span>
                    <ShieldCheck className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>Next Beat</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Collapsible Technician's Diagnostic Notes */}
          <div className="rounded-xl bg-zinc-950/80 border border-zinc-800/80 overflow-hidden text-xs">
            <button
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
        </aside>

        {/* ----------------------------------------------------------------------- */}
        {/* RIGHT PANE: HARDWARE TOPOLOGY & DIAGNOSTICS DECK (7 COLS ON DESKTOP)     */}
        {/* ----------------------------------------------------------------------- */}
        <main className="lg:col-span-7 flex flex-col gap-3 min-w-0">
          {/* Deck View Mode Selector (For medium & mobile screens) */}
          <div className="flex lg:hidden items-center justify-between p-1 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono">
            <button
              onClick={() => setActiveDeckTab('terminal')}
              className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition ${
                activeDeckTab === 'terminal'
                  ? 'bg-zinc-800 text-emerald-400 font-bold shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <TerminalIcon className="w-3.5 h-3.5" /> Terminal
            </button>
            <button
              onClick={() => setActiveDeckTab('topology')}
              className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition ${
                activeDeckTab === 'topology'
                  ? 'bg-zinc-800 text-emerald-400 font-bold shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Cable className="w-3.5 h-3.5" /> Physical Rack
            </button>
            {mentorState.beatIndex >= 7 && (
              <button
                onClick={() => setActiveDeckTab('inspector')}
                className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition ${
                  activeDeckTab === 'inspector'
                    ? 'bg-zinc-800 text-emerald-400 font-bold shadow'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" /> Frame Scope
              </button>
            )}
          </div>

          {/* Desktop Stacked View / Mobile Tab View */}
          <div className="space-y-4">
            {/* 1. Physical Layer 1 Topology Canvas */}
            <div
              className={`${
                activeDeckTab === 'topology' ? 'block' : 'hidden lg:block'
              } transition-all`}
            >
              <PhysicalConnectionCanvas
                isCableSeated={isCableSeated}
                onToggleCable={handleToggleCable}
              />
            </div>

            {/* 2. Slow-Motion Protocol Tracer Banner for Beat 6 */}
            {mentorState.beatIndex === 5 && (
              <div className="p-3.5 rounded-xl bg-cyan-950/60 border border-cyan-500/40 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-cyan-200">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400 animate-spin" />
                  <span className="font-bold">Dual-Protocol Slow-Motion Trace</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px]">
                  <span
                    className={`px-2 py-0.5 rounded border ${
                      slowMotionPhase >= 1
                        ? 'bg-cyan-500/30 border-cyan-400 text-cyan-100 font-bold'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                    }`}
                  >
                    1. ARP Broadcast
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded border ${
                      slowMotionPhase >= 2
                        ? 'bg-cyan-500/30 border-cyan-400 text-cyan-100 font-bold'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                    }`}
                  >
                    2. ARP Reply
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded border ${
                      slowMotionPhase >= 3
                        ? 'bg-emerald-500/30 border-emerald-400 text-emerald-100 font-bold'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                    }`}
                  >
                    3. ICMP Echo Success
                  </span>
                </div>
              </div>
            )}

            {/* 3. Operating System Diagnostics Virtual Terminal */}
            <div
              className={`${
                activeDeckTab === 'terminal' ? 'block' : 'hidden lg:block'
              } transition-all`}
            >
              <VirtualTerminalSimulator
                title="Acme-PC-01 Command Prompt"
                hostname="Acme-PC-01"
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

            {/* 4. Layer 2 Frame Inspector (Beat 8 Reveal) */}
            {mentorState.beatIndex >= 7 && (
              <div
                className={`${
                  activeDeckTab === 'inspector' ? 'block' : 'hidden lg:block'
                } transition-all`}
              >
                <PacketInspector
                  taskContent={DEFAULT_NET01_PACKET}
                  title="Ethernet II Envelope & Dynamic MAC Matching"
                  description="Inspect the Layer 2 outer Ethernet packaging stamped with Router R1's MAC address learned via ARP."
                  visibleLayers={['L2', 'L3']}
                  spotlightMac="00-1A-2B-3C-4D-01"
                />
              </div>
            )}
          </div>
        </main>
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
              <h2 className="text-xl font-bold text-zinc-100">Ticket #1042 Resolved!</h2>
              <p className="text-xs text-zinc-400 mt-1 font-mono">
                Acme-PC-01 reachability to Default Gateway restored.
              </p>
            </div>

            <div className="w-full p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-left text-xs font-mono space-y-2 text-zinc-300">
              <div className="text-[11px] text-zinc-500 uppercase tracking-wider font-bold">
                Mastered Diagnostics:
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Layer 1: Media disconnected vs operational link pulse</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Layer 2: ARP address discovery & MAC frame encapsulation</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Layer 3: IP packet payload transport across LAN</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full pt-2">
              <button
                onClick={() => backToRoadmap(module.id)}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition"
              >
                Return to Roadmap (Day 2 Unlocked)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
