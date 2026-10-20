'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { PracticeTask, Concept } from '../../../types/curriculum';
import { submitForTask } from '../../../lib/track-submit';
import { SwitchSimulationLab } from './SwitchSimulationLab';
import { SubnetBitSlicer } from './SubnetBitSlicer';
import { ArpSimulationLab } from './ArpSimulationLab';
import { PacketInspector } from './PacketInspector';
import { VirtualTerminalSimulator } from './VirtualTerminalSimulator';
import { EthernetFrameInspector } from './EthernetFrameInspector';
import { Ipv6NdpSimulator } from './Ipv6NdpSimulator';
import { DhcpDoraSimulator } from './DhcpDoraSimulator';
import { DnsResolutionTreeSimulator } from './DnsResolutionTreeSimulator';
import { TcpSequenceLadderSimulator } from './TcpSequenceLadderSimulator';
import { HttpTlsHandshakeSimulator } from './HttpTlsHandshakeSimulator';
import { FirewallAclRuleSimulator } from './FirewallAclRuleSimulator';
import { VlanTrunkDijkstraLab } from './VlanTrunkDijkstraLab';
import { StructuredTaskGrader, type StructuredFieldDef } from './StructuredTaskGrader';
import { RouterOnAStickDiagram, HostTelemetryTerminal } from './SubnetPilotVisuals';
import { TaskInstructions } from '../TaskInstructions';
import { JudgmentBlock } from '../JudgmentBlock';
import {
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Network,
  Terminal,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ShieldCheck,
  Check,
  Sliders,
} from 'lucide-react';

interface NetworkingPracticeTaskViewProps {
  task: PracticeTask;
  taskIndex: number;
  totalTasks: number;
  concept?: Concept;
  conceptIndex?: number;
  totalConcepts?: number;
  isCompleted?: boolean;
  onTaskSuccess: (userSql: string, hintsUsed: number, viewedSolution: boolean) => void;
  onNextTask?: () => void;
  onBack?: () => void;
  backLabel?: string;
  hasChallenge?: boolean;
  isChallenge?: boolean;
}

export const NetworkingPracticeTaskView: React.FC<NetworkingPracticeTaskViewProps> = ({
  task,
  taskIndex,
  totalTasks,
  concept,
  conceptIndex = 0,
  totalConcepts = 1,
  isCompleted = false,
  onTaskSuccess,
  onNextTask,
  onBack,
  backLabel,
  hasChallenge = true,
  isChallenge = false,
}) => {
  const [judgmentAnswers, setJudgmentAnswers] = useState<(number | null)[]>(() =>
    (task.validation.judgment ?? []).map(() => null),
  );
  const [selectedPorts, setSelectedPorts] = useState<number[]>([]);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [viewedSolution, setViewedSolution] = useState(false);
  const [taskPassed, setTaskPassed] = useState(isCompleted);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [isMisconception, setIsMisconception] = useState(false);
  const [isChallengeHelpOpen, setIsChallengeHelpOpen] = useState(false);
  const [challengeHintLevel, setChallengeHintLevel] = useState(0);
  const [showChallengeSolution, setShowChallengeSolution] = useState(false);

  // Sync state when task changes
  useEffect(() => {
    setJudgmentAnswers((task.validation.judgment ?? []).map(() => null));
    setSelectedPorts([]);
    setSelectedOptionIndex(null);
    setHintsUsed(0);
    setViewedSolution(false);
    setTaskPassed(isCompleted);
    setValidationMessage(null);
    setIsMisconception(false);
    setIsChallengeHelpOpen(false);
    setChallengeHintLevel(0);
    setShowChallengeSolution(false);
  }, [task.id, isCompleted]);

  const handleTogglePort = (port: number) => {
    setSelectedPorts((prev) =>
      prev.includes(port) ? prev.filter((p) => p !== port) : [...prev, port].sort((a, b) => a - b),
    );
  };

  const handleCheckSubmission = () => {
    const outcome = submitForTask({
      task,
      code: selectedOptionIndex !== null ? String(selectedOptionIndex) : '',
      hooks: {
        execute: () => ({ success: true, columns: [], rows: [], rowCount: 0, executionTimeMs: 0 }),
      },
      judgmentAnswers,
      surface: isChallenge ? 'challenge' : 'lesson',
    });

    if (outcome.passed) {
      setTaskPassed(true);
      setValidationMessage(task.successMessage || 'Correct! Prediction verified.');
      setIsMisconception(false);
      onTaskSuccess('', hintsUsed, viewedSolution);
    } else {
      setTaskPassed(false);
      setValidationMessage(
        outcome.feedback ||
          'Your prediction does not match Layer 2 switching rules. Review the CAM table state and try again.',
      );
      setIsMisconception(true);
    }
  };

  // Resolve topology and sequence from task.networking or fallback
  const topology = task.networking?.topology;
  const initialSequence = task.networking?.initialSequence;
  const pendingTx = task.networking?.pendingTransmission;

  const sequence = [
    ...(initialSequence ?? []),
    ...(pendingTx ? [pendingTx] : []),
  ];

  const isLastTask = taskIndex >= totalTasks - 1;
  const nextActionLabel = isLastTask
    ? conceptIndex < totalConcepts - 1
      ? 'Next Concept'
      : hasChallenge
        ? 'Module Challenge'
        : 'Complete Module'
    : 'Next Task';

  const hasTopology = Boolean(topology && topology.length > 0);
  const hasSubnetting = Boolean(task.subnetting);
  const hasArp = Boolean(task.arp);
  const hasPacketInspection = Boolean(task.packetInspection);
  const hasTerminal = Boolean(task.terminal);
  const hasEthernetFrame = Boolean(task.ethernetFrame);
  const hasIpv6Ndp = Boolean(task.ipv6Ndp);
  const hasDhcp = Boolean(task.dhcp);
  const hasDns = Boolean(task.dns);
  const hasTcpLadder = Boolean(task.tcpLadder);
  const hasHttpTls = Boolean(task.httpTls);
  const hasFirewall = Boolean(task.firewall);
  const hasVlanDijkstra = Boolean(task.vlanDijkstra);

  const hasInteractiveLab = Boolean(
    hasTopology ||
    hasSubnetting ||
    hasArp ||
    hasPacketInspection ||
    hasTerminal ||
    hasEthernetFrame ||
    hasIpv6Ndp ||
    hasDhcp ||
    hasDns ||
    hasTcpLadder ||
    hasHttpTls ||
    hasFirewall ||
    hasVlanDijkstra,
  );

  // Map SubnetFieldDef to StructuredFieldDef (for both Subnetting and ARP)
  const sourceFields = task.subnetting?.fields ?? task.arp?.fields ?? [];
  const graderFields: StructuredFieldDef[] = sourceFields.map((f) => ({
    id: f.id,
    label: f.label,
    placeholder: f.placeholder,
    type: f.type,
    options: f.options,
    expected: f.expected,
    helperText: f.helperText,
    misconceptions: (f.misconceptions ?? []).map((m) => ({
      test: (val: string) => Boolean(m.testPattern && new RegExp(m.testPattern, 'i').test(val)),
      feedback: m.feedback,
    })),
  }));

  const cleanTitle = (task.title || '').replace(/^Task\s+\d+:\s*/i, '').trim();

  return (
    <motion.div
      key={task.id}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.2 }}
      className="w-full max-w-[1440px] mx-auto space-y-4 sm:space-y-5 px-0 sm:px-4 min-w-0"
      data-testid="networking-practice-task-view"
    >
      {/* ─────────────────────────────────────────────────────────────
          1. TOP STATUS & NAVIGATION STEPPER BAR
          ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl bg-surface border border-border shadow-md">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-func/15 border border-func/30 flex items-center justify-center shrink-0 text-func">
            {isChallenge ? <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" /> : <Network className="w-4 h-4 sm:w-5 sm:h-5" />}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] sm:text-[11px] font-bold text-func uppercase tracking-wider">
                {isChallenge ? 'Mastery Challenge' : hasSubnetting ? 'Subnetting Lab' : hasEthernetFrame ? 'Ethernet Framing Lab' : hasIpv6Ndp ? 'IPv6 & NDP Lab' : hasDhcp ? 'DHCP DORA Lab' : hasDns ? 'DNS Resolution Lab' : hasTcpLadder ? 'TCP Ladder Lab' : hasHttpTls ? 'HTTP & TLS Lab' : hasFirewall ? 'Firewall & STP Lab' : hasVlanDijkstra ? 'VLAN & Dijkstra Lab' : 'Networking Practice'}
              </span>
              <span className="text-text-muted text-xs">•</span>
              <span className="font-mono text-[10.5px] sm:text-[11px] text-text-dim">
                Task {taskIndex + 1} of {totalTasks}
              </span>
            </div>
            <h2 className="text-xs sm:text-sm font-bold text-text truncate">
              {concept ? `${concept.title} • ` : ''}
              {cleanTitle}
            </h2>
          </div>
        </div>

        {/* Task Progress Indicator Pills */}
        <div className="flex items-center gap-1.5 ml-auto">
          {Array.from({ length: totalTasks }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === taskIndex
                  ? 'w-6 bg-func shadow-sm'
                  : i < taskIndex || (i === taskIndex && taskPassed)
                  ? 'w-3.5 bg-emerald-500'
                  : 'w-2 bg-surface-3'
              }`}
              title={`Task ${i + 1}`}
            />
          ))}
          {taskPassed && (
            <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] font-bold">
              <Check className="w-3 h-3" />
              Passed
            </span>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. SPLIT-PANE RESPONSIVE LAYOUT (Specification §9.2)
          ───────────────────────────────────────────────────────────── */}
      {hasInteractiveLab ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start w-full min-w-0">
        {hasTopology ? (
          /* LEFT COLUMN: Interactive Network Topology Simulator & CAM Table */
          <div className="lg:col-span-7 xl:col-span-7 flex flex-col gap-4 min-w-0 w-full order-1">
            <SwitchSimulationLab
              hosts={topology}
              sequence={sequence}
              enablePredictionGate={false}
              interactivePortSelection={true}
              selectedPorts={selectedPorts}
              onTogglePort={handleTogglePort}
              title={task.title}
              subtitle={task.description}
            />
            {task.terminal && (
              <VirtualTerminalSimulator
                scenario={task.terminal}
                title={task.title}
                description={task.description}
              />
            )}
          </div>
        ) : hasSubnetting ? (
          /* LEFT COLUMN: Subnet Bit-Slicer & Visuals Lab */
          <div className="lg:col-span-7 xl:col-span-7 flex flex-col gap-4 min-w-0 w-full order-1">
            {task.subnetting?.targetIp && (
              <SubnetBitSlicer
                initialIp={task.subnetting.targetIp}
                initialPrefix={task.subnetting.prefix}
                isInteractive={task.subnetting.isInteractive ?? true}
                initiallyCollapsed={task.subnetting.isCollapsed ?? false}
                title={task.title}
              />
            )}
            {task.subnetting?.routerOnAStick && (
              <RouterOnAStickDiagram />
            )}
            {task.subnetting?.diagnostics && (
              <HostTelemetryTerminal
                routeOutput={task.subnetting.diagnostics.routeTableOutput}
                pingOutput={task.subnetting.diagnostics.pingOutput}
              />
            )}
            {concept ? (
              <TaskInstructions
                task={task}
                taskIndex={taskIndex}
                totalTasks={totalTasks}
                concept={concept}
                isCompleted={taskPassed}
                onUseHint={(lvl) => setHintsUsed((prev) => Math.max(prev, lvl))}
                onViewSolution={() => setViewedSolution(true)}
              />
            ) : (
              <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-lg space-y-4 text-text">
                <div className="space-y-1.5">
                  <h3 className="font-mono text-base sm:text-lg font-bold text-text">
                    {cleanTitle}
                  </h3>
                  <p className="text-xs sm:text-sm text-text-dim leading-relaxed font-sans">
                    {task.description}
                  </p>
                </div>
                {task.instructions.length > 0 && (
                  <div className="space-y-2.5 pt-3 border-t border-border-soft">
                    <span className="font-mono text-xs font-bold text-text uppercase tracking-wider block">
                      Instructions &amp; Constraints:
                    </span>
                    <ul className="text-xs sm:text-sm text-text space-y-2 list-disc list-inside font-sans">
                      {task.instructions.map((inst, i) => (
                        <li key={i} className="leading-relaxed text-text/90">
                          {inst}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : hasArp ? (
          /* LEFT COLUMN: ARP Dynamic State Machine & Packet Stepper */
          <div className="lg:col-span-7 xl:col-span-7 flex flex-col gap-4 min-w-0 w-full order-1">
            {task.arp && (
              <ArpSimulationLab
                taskArp={task.arp}
                title={task.title}
                description={task.description}
              />
            )}
            {concept ? (
              <TaskInstructions
                task={task}
                taskIndex={taskIndex}
                totalTasks={totalTasks}
                concept={concept}
                isCompleted={taskPassed}
                onUseHint={(lvl) => setHintsUsed((prev) => Math.max(prev, lvl))}
                onViewSolution={() => setViewedSolution(true)}
              />
            ) : (
              <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-lg space-y-4 text-text">
                <div className="space-y-1.5">
                  <h3 className="font-mono text-base sm:text-lg font-bold text-text">
                    {cleanTitle}
                  </h3>
                  <p className="text-xs sm:text-sm text-text-dim leading-relaxed font-sans">
                    {task.description}
                  </p>
                </div>
                {task.instructions.length > 0 && (
                  <div className="space-y-2.5 pt-3 border-t border-border-soft">
                    <span className="font-mono text-xs font-bold text-text uppercase tracking-wider block">
                      Instructions &amp; Constraints:
                    </span>
                    <ul className="text-xs sm:text-sm text-text space-y-2 list-disc list-inside font-sans">
                      {task.instructions.map((inst, i) => (
                        <li key={i} className="leading-relaxed text-text/90">
                          {inst}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : hasPacketInspection ? (
          /* LEFT COLUMN: Multi-Layer Packet Inspector & Hop Comparison */
          <div className="lg:col-span-7 xl:col-span-7 flex flex-col gap-4 min-w-0 w-full order-1">
            {task.packetInspection && (
              <PacketInspector
                taskContent={task.packetInspection}
                title={task.title}
                description={task.description}
              />
            )}
            {concept ? (
              <TaskInstructions
                task={task}
                taskIndex={taskIndex}
                totalTasks={totalTasks}
                concept={concept}
                isCompleted={taskPassed}
                onUseHint={(lvl) => setHintsUsed((prev) => Math.max(prev, lvl))}
                onViewSolution={() => setViewedSolution(true)}
              />
            ) : (
              <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-lg space-y-4 text-text">
                <div className="space-y-1.5">
                  <h3 className="font-mono text-base sm:text-lg font-bold text-text">
                    {cleanTitle}
                  </h3>
                  <p className="text-xs sm:text-sm text-text-dim leading-relaxed font-sans">
                    {task.description}
                  </p>
                </div>
                {task.instructions.length > 0 && (
                  <div className="space-y-2.5 pt-3 border-t border-border-soft">
                    <span className="font-mono text-xs font-bold text-text uppercase tracking-wider block">
                      Instructions &amp; Constraints:
                    </span>
                    <ul className="text-xs sm:text-sm text-text space-y-2 list-disc list-inside font-sans">
                      {task.instructions.map((inst, i) => (
                        <li key={i} className="leading-relaxed text-text/90">
                          {inst}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : hasEthernetFrame ? (
          /* LEFT COLUMN: Ethernet Frame Inspector & Bit-Flip FCS Lab */
          <div className="lg:col-span-7 xl:col-span-7 flex flex-col gap-4 min-w-0 w-full order-1">
            {task.ethernetFrame && (
              <EthernetFrameInspector
                taskContent={task.ethernetFrame}
                title={task.title}
                description={task.description}
              />
            )}
            {task.terminal && (
              <VirtualTerminalSimulator
                scenario={task.terminal}
                title={task.title}
                description={task.description}
              />
            )}
            {concept ? (
              <TaskInstructions
                task={task}
                taskIndex={taskIndex}
                totalTasks={totalTasks}
                concept={concept}
                isCompleted={taskPassed}
                onUseHint={(lvl) => setHintsUsed((prev) => Math.max(prev, lvl))}
                onViewSolution={() => setViewedSolution(true)}
              />
            ) : (
              <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-lg space-y-4 text-text">
                <div className="space-y-1.5">
                  <h3 className="font-mono text-base sm:text-lg font-bold text-text">
                    {cleanTitle}
                  </h3>
                  <p className="text-xs sm:text-sm text-text-dim leading-relaxed font-sans">
                    {task.description}
                  </p>
                </div>
                {task.instructions.length > 0 && (
                  <div className="space-y-2.5 pt-3 border-t border-border-soft">
                    <span className="font-mono text-xs font-bold text-text uppercase tracking-wider block">
                      Instructions &amp; Constraints:
                    </span>
                    <ul className="text-xs sm:text-sm text-text space-y-2 list-disc list-inside font-sans">
                      {task.instructions.map((inst, i) => (
                        <li key={i} className="leading-relaxed text-text/90">
                          {inst}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : hasTerminal ? (
          /* LEFT COLUMN: Virtual Terminal Diagnostics Simulator */
          <div className="lg:col-span-7 xl:col-span-7 flex flex-col gap-4 min-w-0 w-full order-1">
            {task.terminal && (
              <VirtualTerminalSimulator
                scenario={task.terminal}
                title={task.title}
                description={task.description}
              />
            )}
            {concept ? (
              <TaskInstructions
                task={task}
                taskIndex={taskIndex}
                totalTasks={totalTasks}
                concept={concept}
                isCompleted={taskPassed}
                onUseHint={(lvl) => setHintsUsed((prev) => Math.max(prev, lvl))}
                onViewSolution={() => setViewedSolution(true)}
              />
            ) : (
              <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-lg space-y-4 text-text">
                <div className="space-y-1.5">
                  <h3 className="font-mono text-base sm:text-lg font-bold text-text">
                    {cleanTitle}
                  </h3>
                  <p className="text-xs sm:text-sm text-text-dim leading-relaxed font-sans">
                    {task.description}
                  </p>
                </div>
                {task.instructions.length > 0 && (
                  <div className="space-y-2.5 pt-3 border-t border-border-soft">
                    <span className="font-mono text-xs font-bold text-text uppercase tracking-wider block">
                      Instructions &amp; Constraints:
                    </span>
                    <ul className="text-xs sm:text-sm text-text space-y-2 list-disc list-inside font-sans">
                      {task.instructions.map((inst, i) => (
                        <li key={i} className="leading-relaxed text-text/90">
                          {inst}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : hasIpv6Ndp ? (
          /* LEFT COLUMN: IPv6 NDP & Modified EUI-64 Simulator */
          <div className="lg:col-span-7 xl:col-span-7 flex flex-col gap-4 min-w-0 w-full order-1">
            {task.ipv6Ndp && (
              <Ipv6NdpSimulator
                taskContent={task.ipv6Ndp}
                title={task.title}
                description={task.description}
              />
            )}
            {concept ? (
              <TaskInstructions
                task={task}
                taskIndex={taskIndex}
                totalTasks={totalTasks}
                concept={concept}
                isCompleted={taskPassed}
                onUseHint={(lvl) => setHintsUsed((prev) => Math.max(prev, lvl))}
                onViewSolution={() => setViewedSolution(true)}
              />
            ) : (
              <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-lg space-y-4 text-text">
                <div className="space-y-1.5">
                  <h3 className="font-mono text-base sm:text-lg font-bold text-text">
                    {cleanTitle}
                  </h3>
                  <p className="text-xs sm:text-sm text-text-dim leading-relaxed font-sans">
                    {task.description}
                  </p>
                </div>
                {task.instructions.length > 0 && (
                  <div className="space-y-2.5 pt-3 border-t border-border-soft">
                    <span className="font-mono text-xs font-bold text-text uppercase tracking-wider block">
                      Instructions &amp; Constraints:
                    </span>
                    <ul className="text-xs sm:text-sm text-text space-y-2 list-disc list-inside font-sans">
                      {task.instructions.map((inst, i) => (
                        <li key={i} className="leading-relaxed text-text/90">
                          {inst}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : hasDhcp ? (
          /* LEFT COLUMN: DHCP DORA Exchange & Lease Simulator */
          <div className="lg:col-span-7 xl:col-span-7 flex flex-col gap-4 min-w-0 w-full order-1">
            {task.dhcp && (
              <DhcpDoraSimulator
                taskContent={task.dhcp}
                title={task.title}
                description={task.description}
              />
            )}
            {concept ? (
              <TaskInstructions
                task={task}
                taskIndex={taskIndex}
                totalTasks={totalTasks}
                concept={concept}
                isCompleted={taskPassed}
                onUseHint={(lvl) => setHintsUsed((prev) => Math.max(prev, lvl))}
                onViewSolution={() => setViewedSolution(true)}
              />
            ) : (
              <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-lg space-y-4 text-text">
                <div className="space-y-1.5">
                  <h3 className="font-mono text-base sm:text-lg font-bold text-text">
                    {cleanTitle}
                  </h3>
                  <p className="text-xs sm:text-sm text-text-dim leading-relaxed font-sans">
                    {task.description}
                  </p>
                </div>
                {task.instructions.length > 0 && (
                  <div className="space-y-2.5 pt-3 border-t border-border-soft">
                    <span className="font-mono text-xs font-bold text-text uppercase tracking-wider block">
                      Instructions &amp; Constraints:
                    </span>
                    <ul className="text-xs sm:text-sm text-text space-y-2 list-disc list-inside font-sans">
                      {task.instructions.map((inst, i) => (
                        <li key={i} className="leading-relaxed text-text/90">
                          {inst}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : hasDns ? (
          /* LEFT COLUMN: DNS Resolution Tree & Cache Simulator */
          <div className="lg:col-span-7 xl:col-span-7 flex flex-col gap-4 min-w-0 w-full order-1">
            {task.dns && (
              <DnsResolutionTreeSimulator
                taskContent={task.dns}
                title={task.title}
                description={task.description}
              />
            )}
            {concept ? (
              <TaskInstructions
                task={task}
                taskIndex={taskIndex}
                totalTasks={totalTasks}
                concept={concept}
                isCompleted={taskPassed}
                onUseHint={(lvl) => setHintsUsed((prev) => Math.max(prev, lvl))}
                onViewSolution={() => setViewedSolution(true)}
              />
            ) : (
              <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-lg space-y-4 text-text">
                <div className="space-y-1.5">
                  <h3 className="font-mono text-base sm:text-lg font-bold text-text">
                    {cleanTitle}
                  </h3>
                  <p className="text-xs sm:text-sm text-text-dim leading-relaxed font-sans">
                    {task.description}
                  </p>
                </div>
                {task.instructions.length > 0 && (
                  <div className="space-y-2.5 pt-3 border-t border-border-soft">
                    <span className="font-mono text-xs font-bold text-text uppercase tracking-wider block">
                      Instructions &amp; Constraints:
                    </span>
                    <ul className="text-xs sm:text-sm text-text space-y-2 list-disc list-inside font-sans">
                      {task.instructions.map((inst, i) => (
                        <li key={i} className="leading-relaxed text-text/90">
                          {inst}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : hasTcpLadder ? (
          /* LEFT COLUMN: TCP Sequence & Sliding Window Ladder */
          <div className="lg:col-span-7 xl:col-span-7 flex flex-col gap-4 min-w-0 w-full order-1">
            {task.tcpLadder && (
              <TcpSequenceLadderSimulator
                taskContent={task.tcpLadder}
                title={task.title}
                description={task.description}
              />
            )}
            {concept ? (
              <TaskInstructions
                task={task}
                taskIndex={taskIndex}
                totalTasks={totalTasks}
                concept={concept}
                isCompleted={taskPassed}
                onUseHint={(lvl) => setHintsUsed((prev) => Math.max(prev, lvl))}
                onViewSolution={() => setViewedSolution(true)}
              />
            ) : (
              <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-lg space-y-4 text-text">
                <div className="space-y-1.5">
                  <h3 className="font-mono text-base sm:text-lg font-bold text-text">
                    {cleanTitle}
                  </h3>
                  <p className="text-xs sm:text-sm text-text-dim leading-relaxed font-sans">
                    {task.description}
                  </p>
                </div>
                {task.instructions.length > 0 && (
                  <div className="space-y-2.5 pt-3 border-t border-border-soft">
                    <span className="font-mono text-xs font-bold text-text uppercase tracking-wider block">
                      Instructions &amp; Constraints:
                    </span>
                    <ul className="text-xs sm:text-sm text-text space-y-2 list-disc list-inside font-sans">
                      {task.instructions.map((inst, i) => (
                        <li key={i} className="leading-relaxed text-text/90">
                          {inst}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : hasHttpTls ? (
          /* LEFT COLUMN: HTTP/2, HTTP/3 & TLS 1.3 Handshake Simulator */
          <div className="lg:col-span-7 xl:col-span-7 flex flex-col gap-4 min-w-0 w-full order-1">
            {task.httpTls && (
              <HttpTlsHandshakeSimulator
                taskContent={task.httpTls}
                title={task.title}
                description={task.description}
              />
            )}
            {concept ? (
              <TaskInstructions
                task={task}
                taskIndex={taskIndex}
                totalTasks={totalTasks}
                concept={concept}
                isCompleted={taskPassed}
                onUseHint={(lvl) => setHintsUsed((prev) => Math.max(prev, lvl))}
                onViewSolution={() => setViewedSolution(true)}
              />
            ) : (
              <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-lg space-y-4 text-text">
                <div className="space-y-1.5">
                  <h3 className="font-mono text-base sm:text-lg font-bold text-text">
                    {cleanTitle}
                  </h3>
                  <p className="text-xs sm:text-sm text-text-dim leading-relaxed font-sans">
                    {task.description}
                  </p>
                </div>
                {task.instructions.length > 0 && (
                  <div className="space-y-2.5 pt-3 border-t border-border-soft">
                    <span className="font-mono text-xs font-bold text-text uppercase tracking-wider block">
                      Instructions &amp; Constraints:
                    </span>
                    <ul className="text-xs sm:text-sm text-text space-y-2 list-disc list-inside font-sans">
                      {task.instructions.map((inst, i) => (
                        <li key={i} className="leading-relaxed text-text/90">
                          {inst}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : hasFirewall ? (
          /* LEFT COLUMN: Stateful Firewall, ACL & STP Topology Simulator */
          <div className="lg:col-span-7 xl:col-span-7 flex flex-col gap-4 min-w-0 w-full order-1">
            {task.firewall && (
              <FirewallAclRuleSimulator
                taskContent={task.firewall}
                title={task.title}
                description={task.description}
              />
            )}
            {concept ? (
              <TaskInstructions
                task={task}
                taskIndex={taskIndex}
                totalTasks={totalTasks}
                concept={concept}
                isCompleted={taskPassed}
                onUseHint={(lvl) => setHintsUsed((prev) => Math.max(prev, lvl))}
                onViewSolution={() => setViewedSolution(true)}
              />
            ) : (
              <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-lg space-y-4 text-text">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-func uppercase tracking-wider flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5" />
                      {isChallenge ? 'Module Challenge Task' : 'Network Engineering Task'}
                    </span>
                  </div>
                  <h3 className="font-mono text-base sm:text-lg font-bold text-text">
                    {cleanTitle}
                  </h3>
                  <p className="text-xs sm:text-sm text-text-dim leading-relaxed font-sans">
                    {task.description}
                  </p>
                </div>
                {task.instructions.length > 0 && (
                  <div className="space-y-2.5 pt-3 border-t border-border-soft">
                    <span className="font-mono text-xs font-bold text-text uppercase tracking-wider block">
                      Instructions &amp; Constraints:
                    </span>
                    <ul className="text-xs sm:text-sm text-text space-y-2 list-disc list-inside font-sans">
                      {task.instructions.map((inst, i) => (
                        <li key={i} className="leading-relaxed text-text/90">
                          {inst}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : hasVlanDijkstra ? (
          /* LEFT COLUMN: 802.1Q VLAN Trunk & OSPF Dijkstra Lab */
          <div className="lg:col-span-7 xl:col-span-7 flex flex-col gap-4 min-w-0 w-full order-1">
            {task.vlanDijkstra && (
              <VlanTrunkDijkstraLab
                taskContent={task.vlanDijkstra}
                title={task.title}
                description={task.description}
              />
            )}
            {concept ? (
              <TaskInstructions
                task={task}
                taskIndex={taskIndex}
                totalTasks={totalTasks}
                concept={concept}
                isCompleted={taskPassed}
                onUseHint={(lvl) => setHintsUsed((prev) => Math.max(prev, lvl))}
                onViewSolution={() => setViewedSolution(true)}
              />
            ) : (
              <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-lg space-y-4 text-text">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-func uppercase tracking-wider flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5" />
                      {isChallenge ? 'Module Challenge Task' : 'Network Engineering Task'}
                    </span>
                  </div>
                  <h3 className="font-mono text-base sm:text-lg font-bold text-text">
                    {cleanTitle}
                  </h3>
                  <p className="text-xs sm:text-sm text-text-dim leading-relaxed font-sans">
                    {task.description}
                  </p>
                </div>
                {task.instructions.length > 0 && (
                  <div className="space-y-2.5 pt-3 border-t border-border-soft">
                    <span className="font-mono text-xs font-bold text-text uppercase tracking-wider block">
                      Instructions &amp; Constraints:
                    </span>
                    <ul className="text-xs sm:text-sm text-text space-y-2 list-disc list-inside font-sans">
                      {task.instructions.map((inst, i) => (
                        <li key={i} className="leading-relaxed text-text/90">
                          {inst}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : null}

        {/* ─────────────────────────────────────────────────────────────
            3. RIGHT COLUMN: Questions, Predictions, Options & Action Bar
            ───────────────────────────────────────────────────────────── */}
        <div className="lg:col-span-5 xl:col-span-5 flex flex-col gap-4 min-w-0 w-full order-2">
          {/* Task Instructions (shown in right column only when topology lab occupies left column) */}
          {hasTopology && concept && (
            <TaskInstructions
              task={task}
              taskIndex={taskIndex}
              totalTasks={totalTasks}
              concept={concept}
              isCompleted={taskPassed}
              onUseHint={(lvl) => setHintsUsed((prev) => Math.max(prev, lvl))}
              onViewSolution={() => setViewedSolution(true)}
            />
          )}

          {/* Structured Calculation & Task Grader (for Subnetting & ARP Stages) */}
          {(hasSubnetting || hasArp) && graderFields.length > 0 && (
            <StructuredTaskGrader
              title={cleanTitle}
              description={task.description}
              fields={graderFields}
              isPassed={taskPassed}
              onGrade={(passed, details) => {
                if (passed) {
                  setTaskPassed(true);
                  setValidationMessage(details.feedback);
                  setIsMisconception(false);
                  if (task.validation.judgment) {
                    setJudgmentAnswers(task.validation.judgment.map((j) => j.correctIndex));
                  }
                  onTaskSuccess('', hintsUsed, viewedSolution);
                } else {
                  setTaskPassed(false);
                  setValidationMessage(details.feedback);
                  setIsMisconception(true);
                }
              }}
              reflectionPrompt={task.subnetting?.reflectionPrompt}
              modelExplanation={task.subnetting?.modelExplanation}
            />
          )}

          {/* Reasoning / Prediction Judgment Questions Card */}
          {(task.validation.judgment?.length ?? 0) > 0 && (
            <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5 shadow-lg space-y-3.5">
              <div className="flex items-center justify-between border-b border-border-soft pb-2.5">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-func" />
                  <h4 className="font-mono text-xs sm:text-sm font-bold uppercase tracking-wider text-text">
                    Prediction &amp; Causal Defense
                  </h4>
                </div>
                <span className="font-mono text-[10.5px] px-2 py-0.5 rounded-md bg-surface-2 text-text-dim border border-border-soft">
                  Interactive Assessment
                </span>
              </div>

              <JudgmentBlock
                exercises={task.validation.judgment!}
                answers={judgmentAnswers}
                onChange={(qi, oi) => {
                  setJudgmentAnswers((prev) => {
                    const next = [...prev];
                    next[qi] = oi;
                    return next;
                  });
                  setValidationMessage(null);
                }}
                disabled={taskPassed}
              />
            </div>
          )}

          {/* Direct Port Selection Helper (when active topology ports exist) */}
          {hasTopology && (topology ?? []).length > 0 && (
            <div className="rounded-2xl border border-border bg-surface p-4 shadow-md space-y-2">
              <span className="font-mono text-xs font-semibold text-text-dim uppercase tracking-wider block">
                Direct Port Inspection &amp; Selection:
              </span>
              <div className="flex flex-wrap gap-2">
                {(topology ?? []).map((h) => {
                  const isSelected = selectedPorts.includes(h.port);
                  return (
                    <button
                      key={h.port}
                      onClick={() => handleTogglePort(h.port)}
                      aria-label={`Toggle Port ${h.port}`}
                      className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-func text-ink shadow-md scale-102'
                          : 'bg-surface-2 text-text-dim hover:text-text border border-border-soft'
                      }`}
                    >
                      <span>Port {h.port}</span>
                      <span className="text-[10px] opacity-75">({h.name})</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-text-muted font-sans pt-1">
                Click ports on the canvas or the chips above to inspect link connections.
              </p>
            </div>
          )}

          {/* Validation Feedback & Misconception Remediation Banner */}
          <AnimatePresence>
            {validationMessage && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98, y: 4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -4 }}
                transition={{ duration: 0.15 }}
                className={`p-4 rounded-2xl border text-xs sm:text-sm flex items-start gap-3 shadow-lg ${
                  taskPassed
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                    : 'border-red-500/40 bg-red-500/10 text-red-300'
                }`}
                data-testid="task-validation-message"
              >
                {taskPassed ? (
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 shrink-0 text-red-400 mt-0.5" />
                )}
                <div className="space-y-1 font-sans">
                  <p className="font-bold">
                    {taskPassed ? 'Task Completed!' : 'Incorrect Prediction:'}
                  </p>
                  <p className="leading-relaxed opacity-95">{validationMessage}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Bar: Check Prediction / Next Task */}
          <div className="flex items-center justify-between gap-3 pt-2">
            {onBack && (
              <button
                onClick={onBack}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-text-dim hover:text-text hover:bg-surface-2 transition cursor-pointer"
              >
                {backLabel || 'Back'}
              </button>
            )}

            <div className="flex items-center gap-2 ml-auto">
              {!taskPassed ? (
                <button
                  onClick={handleCheckSubmission}
                  data-testid="check-prediction-button"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-func text-ink font-bold text-xs sm:text-sm hover:brightness-110 active:scale-98 transition cursor-pointer shadow-lg shadow-func/20"
                >
                  <span>Check Prediction</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={onNextTask}
                  data-testid="next-task-button"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-ink font-bold text-xs sm:text-sm hover:bg-emerald-400 active:scale-98 transition cursor-pointer shadow-lg shadow-emerald-500/20"
                >
                  <span>{nextActionLabel}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    ) : (
      /* ─────────────────────────────────────────────────────────────
          3. FOCUSED ERGONOMIC ASSESSMENT LAYOUT (Pure Judgment / MCQ Tasks)
          Centered single-column layout for reading scenario & answering deductions
          ───────────────────────────────────────────────────────────── */
      <div className="max-w-4xl mx-auto flex flex-col gap-4 sm:gap-5 w-full min-w-0">
        {/* Card 1: Scenario Context & Technical Objectives Briefing */}
        <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-lg space-y-4 text-text">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold text-func uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5" />
                {isChallenge ? 'Module Challenge Task' : 'Network Engineering Task'}
              </span>
            </div>
            <h3 className="font-mono text-base sm:text-lg font-bold text-text">
              {cleanTitle}
            </h3>
            {task.description && (
              <p className="text-xs sm:text-sm text-text-dim leading-relaxed font-sans">
                {task.description}
              </p>
            )}
          </div>

          {task.instructions && task.instructions.length > 0 && (
            <div className="space-y-2.5 pt-3 border-t border-border-soft">
              <span className="font-mono text-xs font-bold text-text uppercase tracking-wider block">
                Scenario Context &amp; Objectives:
              </span>
              <ul className="text-xs sm:text-sm text-text space-y-2 list-disc list-inside font-sans">
                {task.instructions.map((inst, i) => (
                  <li key={i} className="leading-relaxed text-text/90">
                    {inst}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Progressive Hints & Technical Defense Drawer */}
          {task.hints && task.hints.length > 0 && (
            <div className="pt-3 border-t border-border-soft">
              <button
                type="button"
                onClick={() => {
                  setIsChallengeHelpOpen(!isChallengeHelpOpen);
                  if (!isChallengeHelpOpen && challengeHintLevel === 0) {
                    setChallengeHintLevel(1);
                    setHintsUsed(1);
                  }
                }}
                className="flex items-center justify-between w-full text-xs font-body text-text-dim hover:text-text transition py-1 cursor-pointer"
              >
                <div className="flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-text-dim" />
                  <span className="font-medium">Need a hint for this network scenario?</span>
                </div>
                {isChallengeHelpOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {isChallengeHelpOpen && (
                <div className="mt-2.5 space-y-2.5 text-xs font-mono">
                  {task.hints.slice(0, challengeHintLevel).map((hint, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-surface-2 border border-border-soft text-text text-xs leading-relaxed"
                    >
                      <span className="font-bold text-text-dim mr-1.5">Hint {idx + 1}:</span>
                      <span>{hint.text}</span>
                    </div>
                  ))}

                  <div className="flex items-center justify-between pt-1">
                    {challengeHintLevel < task.hints.length ? (
                      <button
                        type="button"
                        onClick={() => {
                          const nextLvl = challengeHintLevel + 1;
                          setChallengeHintLevel(nextLvl);
                          setHintsUsed((prev) => Math.max(prev, nextLvl));
                        }}
                        className="px-2.5 py-1 rounded bg-surface-2 hover:bg-surface-3 text-text-dim border border-border text-[11px] font-semibold transition cursor-pointer"
                      >
                        Next Hint ({challengeHintLevel + 1}/{task.hints.length})
                      </button>
                    ) : (
                      <span className="text-[11px] text-text-faint italic">All hints revealed</span>
                    )}

                    {!showChallengeSolution && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowChallengeSolution(true);
                          setViewedSolution(true);
                        }}
                        className="text-[11px] text-text-dim hover:text-text underline underline-offset-2 transition cursor-pointer"
                      >
                        View Solution Explanation
                      </button>
                    )}
                  </div>

                  {showChallengeSolution && (
                    <div className="mt-2 p-3.5 rounded-xl bg-surface-2/95 border border-border text-xs space-y-1.5 font-sans">
                      <div className="flex items-center gap-1.5 text-func text-[11px] font-bold uppercase tracking-wider font-mono">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Technical Solution Defense</span>
                      </div>
                      <p className="text-text leading-relaxed">
                        {task.solutionExplanation || 'Review the technical rule governing this scenario.'}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Card 2: Interactive Assessment (JudgmentBlock) */}
        {(task.validation.judgment?.length ?? 0) > 0 && (
          <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-border-soft pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-func" />
                <h4 className="font-mono text-xs sm:text-sm font-bold uppercase tracking-wider text-text">
                  Prediction &amp; Causal Defense
                </h4>
              </div>
              <span className="font-mono text-[10.5px] px-2.5 py-1 rounded-md bg-surface-2 text-text-dim border border-border-soft">
                Interactive Assessment
              </span>
            </div>

            <JudgmentBlock
              exercises={task.validation.judgment!}
              answers={judgmentAnswers}
              onChange={(qi, oi) => {
                setJudgmentAnswers((prev) => {
                  const next = [...prev];
                  next[qi] = oi;
                  return next;
                });
                setValidationMessage(null);
              }}
              disabled={taskPassed}
            />
          </div>
        )}

        {/* Card 3: Validation Message Banner */}
        <AnimatePresence>
          {validationMessage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -4 }}
              transition={{ duration: 0.15 }}
              className={`p-4 rounded-2xl border text-xs sm:text-sm flex items-start gap-3 shadow-lg ${
                taskPassed
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                  : 'border-red-500/40 bg-red-500/10 text-red-300'
              }`}
              data-testid="task-validation-message"
            >
              {taskPassed ? (
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 shrink-0 text-red-400 mt-0.5" />
              )}
              <div className="space-y-1 font-sans">
                <p className="font-bold">
                  {taskPassed ? 'Task Completed!' : 'Incorrect Prediction:'}
                </p>
                <p className="leading-relaxed opacity-95">{validationMessage}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Card 4: Action Bar */}
        <div className="flex items-center justify-between gap-3 pt-2">
          {onBack && (
            <button
              onClick={onBack}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-text-dim hover:text-text hover:bg-surface-2 transition cursor-pointer"
            >
              {backLabel || 'Back'}
            </button>
          )}

          <div className="flex items-center gap-2 ml-auto">
            {!taskPassed ? (
              <button
                onClick={handleCheckSubmission}
                data-testid="check-prediction-button"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-func text-ink font-bold text-xs sm:text-sm hover:brightness-110 active:scale-98 transition cursor-pointer shadow-lg shadow-func/20"
              >
                <span>Check Prediction</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onNextTask}
                data-testid="next-task-button"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 text-ink font-bold text-xs sm:text-sm hover:bg-emerald-400 active:scale-98 transition cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                <span>{nextActionLabel}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    )}
    </motion.div>
  );
};
