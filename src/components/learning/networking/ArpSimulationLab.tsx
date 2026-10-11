'use client';

import React, { useState } from 'react';
import type { ArpTaskContent, ArpSimulationStep } from '../../../types/curriculum';
import {
  Layers,
  Clock,
  ArrowRight,
  Shield,
  Network,
  Cpu,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Play,
  Terminal,
} from 'lucide-react';

export interface ArpSimulationLabProps {
  taskArp: ArpTaskContent;
  title?: string;
  description?: string;
}

export const ArpSimulationLab: React.FC<ArpSimulationLabProps> = ({
  taskArp,
  title,
  description,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(taskArp.isCollapsed ?? false);

  // Fallback default simulation steps if not explicitly authored
  const defaultSteps: ArpSimulationStep[] = [
    {
      stepNumber: 1,
      title: 'Step 1: ARP Request Broadcast (Opcode 1)',
      description: `${taskArp.sourceHost.name} buffers the outbound IP packet in the FIFO hold queue and broadcasts an ARP Request frame (Dst: FF:FF:FF:FF:FF:FF) with Target MAC 00:00:00:00:00:00.`,
      activePacket: {
        type: 'ARP_REQUEST',
        sourceHost: taskArp.sourceHost.name,
        ethernetDst: 'FF:FF:FF:FF:FF:FF',
        arp: {
          hwType: 'Ethernet (1)',
          protoType: 'IPv4 (0x0800)',
          hwSize: 6,
          protoSize: 4,
          opcode: 1,
          senderMac: taskArp.sourceHost.mac,
          senderIp: taskArp.sourceHost.ip,
          targetMac: '00:00:00:00:00:00',
          targetIp: taskArp.targetHost.ip,
        },
      },
      queuedPacket: {
        type: 'ICMP Echo Request',
        sourceIp: taskArp.sourceHost.ip,
        destIp: taskArp.targetHost.ip,
        status: 'QUEUED_WAITING_FOR_ARP',
      },
      switchCamTable: [{ port: taskArp.sourceHost.port, mac: taskArp.sourceHost.mac }],
      hostArpTable: [],
      highlightPort: [taskArp.sourceHost.port],
    },
    {
      stepNumber: 2,
      title: 'Step 2: Switch Port Learning & Flood',
      description: `Switch SW1 inspects ingress frame on Port ${taskArp.sourceHost.port}, learns ${taskArp.sourceHost.name}'s MAC (${taskArp.sourceHost.mac}), and floods the broadcast out all other active ports.`,
      activePacket: {
        type: 'ARP_REQUEST',
        sourceHost: taskArp.sourceHost.name,
        ethernetDst: 'FF:FF:FF:FF:FF:FF',
        arp: {
          opcode: 1,
          senderMac: taskArp.sourceHost.mac,
          senderIp: taskArp.sourceHost.ip,
          targetMac: '00:00:00:00:00:00',
          targetIp: taskArp.targetHost.ip,
        },
      },
      queuedPacket: {
        type: 'ICMP Echo Request',
        sourceIp: taskArp.sourceHost.ip,
        destIp: taskArp.targetHost.ip,
        status: 'QUEUED_WAITING_FOR_ARP',
      },
      switchCamTable: [{ port: taskArp.sourceHost.port, mac: taskArp.sourceHost.mac }],
      hostArpTable: [],
      highlightPort: taskArp.allHosts.filter((h) => h.port !== taskArp.sourceHost.port).map((h) => h.port),
    },
    {
      stepNumber: 3,
      title: 'Step 3: Target Match & Non-Target Discard',
      description: `Non-target hosts inspect Target IP ${taskArp.targetHost.ip} (mismatch) and silently drop the frame. ${taskArp.targetHost.name} matches Target IP and records ${taskArp.sourceHost.ip} ➔ ${taskArp.sourceHost.mac} in its ARP cache.`,
      activePacket: {
        type: 'ARP_REQUEST',
        sourceHost: taskArp.sourceHost.name,
        targetHost: taskArp.targetHost.name,
        ethernetDst: 'FF:FF:FF:FF:FF:FF',
        arp: {
          opcode: 1,
          senderMac: taskArp.sourceHost.mac,
          senderIp: taskArp.sourceHost.ip,
          targetMac: '00:00:00:00:00:00',
          targetIp: taskArp.targetHost.ip,
        },
      },
      queuedPacket: {
        type: 'ICMP Echo Request',
        sourceIp: taskArp.sourceHost.ip,
        destIp: taskArp.targetHost.ip,
        status: 'QUEUED_WAITING_FOR_ARP',
      },
      switchCamTable: [{ port: taskArp.sourceHost.port, mac: taskArp.sourceHost.mac }],
      hostArpTable: [{ host: taskArp.targetHost.name, ip: taskArp.sourceHost.ip, mac: taskArp.sourceHost.mac }],
      highlightPort: [taskArp.targetHost.port],
    },
    {
      stepNumber: 4,
      title: 'Step 4: Unicast ARP Reply & IP Packet Dequeue',
      description: `${taskArp.targetHost.name} unicasts an ARP Reply (Opcode 2) to ${taskArp.sourceHost.mac}. ${taskArp.sourceHost.name} populates its ARP cache (${taskArp.targetHost.ip} ➔ ${taskArp.targetHost.mac}), dequeues the buffered IP packet, and transmits!`,
      activePacket: {
        type: 'ARP_REPLY',
        sourceHost: taskArp.targetHost.name,
        targetHost: taskArp.sourceHost.name,
        ethernetDst: taskArp.sourceHost.mac,
        arp: {
          hwType: 'Ethernet (1)',
          protoType: 'IPv4 (0x0800)',
          hwSize: 6,
          protoSize: 4,
          opcode: 2,
          senderMac: taskArp.targetHost.mac,
          senderIp: taskArp.targetHost.ip,
          targetMac: taskArp.sourceHost.mac,
          targetIp: taskArp.sourceHost.ip,
        },
      },
      queuedPacket: {
        type: 'ICMP Echo Request',
        sourceIp: taskArp.sourceHost.ip,
        destIp: taskArp.targetHost.ip,
        status: 'DEQUEUED_TRANSMITTING',
      },
      switchCamTable: [
        { port: taskArp.sourceHost.port, mac: taskArp.sourceHost.mac },
        { port: taskArp.targetHost.port, mac: taskArp.targetHost.mac },
      ],
      hostArpTable: [
        { host: taskArp.sourceHost.name, ip: taskArp.targetHost.ip, mac: taskArp.targetHost.mac },
        { host: taskArp.targetHost.name, ip: taskArp.sourceHost.ip, mac: taskArp.sourceHost.mac },
      ],
      highlightPort: [taskArp.sourceHost.port, taskArp.targetHost.port],
    },
  ];

  const steps = taskArp.simulationSteps && taskArp.simulationSteps.length > 0
    ? taskArp.simulationSteps
    : defaultSteps;

  const currentStep = steps[Math.min(currentStepIndex, steps.length - 1)];
  const isResolved = currentStep.queuedPacket?.status === 'DEQUEUED_TRANSMITTING' || currentStep.queuedPacket?.status === 'RESOLVED';

  return (
    <div
      className="w-full rounded-2xl border border-border bg-surface-1/90 backdrop-blur-md p-4 sm:p-5 shadow-lg space-y-4 text-text"
      data-testid="arp-simulation-lab"
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-border-soft pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-mono text-sm sm:text-base font-bold text-text">
              {title || `ARP Dynamic State Machine (Stage ${taskArp.stage})`}
            </h3>
            <span className="text-[11px] font-mono text-text-dim block">
              Event-Driven Stepper &amp; Queued Packet Resolution
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg border border-border-soft hover:bg-surface-2 text-text-dim hover:text-text transition cursor-pointer"
          aria-label={isCollapsed ? 'Expand ARP Lab' : 'Collapse ARP Lab'}
        >
          {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      </div>

      {!isCollapsed && (
        <div className="space-y-4">
          {/* 1. FIFO BUFFER / PACKET HOLD QUEUE STATE MACHINE */}
          <div
            className={`p-3.5 sm:p-4 rounded-xl border transition-all ${
              isResolved
                ? 'bg-emerald-950/20 border-emerald-500/40 shadow-emerald-900/10'
                : 'bg-amber-950/20 border-amber-500/40 shadow-amber-900/10'
            }`}
            data-testid="arp-fifo-hold-queue"
          >
            <div className="flex items-center justify-between border-b border-border-soft pb-2 mb-2.5">
              <div className="flex items-center gap-2">
                <Clock className={`w-4 h-4 ${isResolved ? 'text-emerald-400' : 'text-amber-400 animate-pulse'}`} />
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-text">
                  FIFO Buffer / Outbound Hold Queue
                </span>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wide border ${
                  isResolved
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                }`}
              >
                {isResolved ? 'Dequeued & Transmitted' : 'Waiting for ARP Resolution'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-surface-2/80 border border-border-soft space-y-1">
                <span className="text-[10px] text-text-muted uppercase font-bold block">
                  Layer 3 Outbound IP Packet
                </span>
                <div className="text-text font-bold">
                  Payload: {currentStep.queuedPacket?.type || 'ICMP Echo Request'}
                </div>
                <div className="text-text-dim text-[11px]">
                  Src IP: <span className="text-func font-bold">{currentStep.queuedPacket?.sourceIp || taskArp.sourceHost.ip}</span> ➔ Dst IP: <span className="text-func font-bold">{currentStep.queuedPacket?.destIp || taskArp.targetHost.ip}</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-surface-2/80 border border-border-soft space-y-1">
                <span className="text-[10px] text-text-muted uppercase font-bold block">
                  Layer 2 Encapsulation State
                </span>
                <div className="text-text font-bold">
                  Src MAC: <span className="text-text-dim">{taskArp.sourceHost.mac}</span>
                </div>
                <div className="text-[11px]">
                  Dst MAC:{' '}
                  {isResolved ? (
                    <span className="text-emerald-400 font-bold bg-emerald-500/10 px-1 rounded">
                      {taskArp.targetHost.mac} (Resolved!)
                    </span>
                  ) : (
                    <span className="text-amber-400 font-bold bg-amber-500/10 px-1 rounded">
                      [UNRESOLVED — HELD IN QUEUE]
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 2. 4-STEP EVENT-DRIVEN INTERACTIVE STEPPER */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-surface-2/70 border border-border-soft space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-func" />
                <h4 className="font-mono text-xs sm:text-sm font-bold text-text">
                  {currentStep.title}
                </h4>
              </div>

              {/* Step indicator pills */}
              <div className="flex items-center gap-1.5" data-testid="arp-step-indicator">
                {steps.map((st, idx) => (
                  <button
                    key={st.stepNumber}
                    type="button"
                    onClick={() => setCurrentStepIndex(idx)}
                    className={`w-6 h-6 rounded text-xs font-mono font-bold transition cursor-pointer flex items-center justify-center ${
                      idx === currentStepIndex
                        ? 'bg-func text-white shadow-sm ring-2 ring-func/30'
                        : idx < currentStepIndex
                          ? 'bg-surface-3 text-text hover:bg-surface-4'
                          : 'bg-surface-3/50 text-text-muted hover:text-text'
                    }`}
                    aria-label={`Jump to step ${st.stepNumber}`}
                  >
                    {st.stepNumber}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-xs sm:text-sm text-text-dim leading-relaxed font-sans">
              {currentStep.description}
            </p>

            {/* Stepper Controls */}
            <div className="flex items-center justify-between pt-2 border-t border-border-soft">
              <button
                type="button"
                disabled={currentStepIndex === 0}
                onClick={() => setCurrentStepIndex((prev) => Math.max(0, prev - 1))}
                className="px-3 py-1.5 rounded-lg border border-border-soft bg-surface-3 hover:bg-surface-4 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-mono font-medium transition cursor-pointer text-text"
              >
                Previous Step
              </button>

              <button
                type="button"
                onClick={() => setCurrentStepIndex(0)}
                className="flex items-center gap-1 text-[11px] font-mono text-text-dim hover:text-text transition cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>

              <button
                type="button"
                disabled={currentStepIndex === steps.length - 1}
                onClick={() => setCurrentStepIndex((prev) => Math.min(steps.length - 1, prev + 1))}
                className="px-3 py-1.5 rounded-lg bg-func hover:bg-func-hover disabled:opacity-40 disabled:cursor-not-allowed text-xs font-mono font-semibold text-white transition cursor-pointer flex items-center gap-1"
              >
                Next Step <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 3. 28-BYTE PROTOCOL DECODER PANEL */}
          {currentStep.activePacket?.arp && (
            <div
              className="p-3.5 sm:p-4 rounded-xl bg-surface-2/60 border border-border-soft space-y-2.5 font-mono text-xs"
              data-testid="arp-packet-decoder"
            >
              <div className="flex items-center justify-between border-b border-border-soft pb-2">
                <span className="font-bold text-text flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-func" />
                  ARP Frame Header &amp; Payload Decoder
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-func/15 text-func border border-func/30">
                  {currentStep.activePacket.arp.opcode === 1 ? 'Opcode 1 (REQUEST)' : 'Opcode 2 (REPLY)'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded bg-surface-3/80 border border-border-soft space-y-1">
                  <span className="text-[10px] text-text-muted font-bold block">Ethernet Frame Header</span>
                  <div>Dst MAC: <span className="font-bold text-amber-300">{currentStep.activePacket.ethernetDst}</span></div>
                  <div>Src MAC: <span className="font-bold text-text">{currentStep.activePacket.arp.senderMac}</span></div>
                  <div>EtherType: <span className="text-text-dim">0x0806 (ARP)</span></div>
                </div>

                <div className="p-2 rounded bg-surface-3/80 border border-border-soft space-y-1">
                  <span className="text-[10px] text-text-muted font-bold block">28-Byte ARP Payload</span>
                  <div>Opcode: <span className="font-bold text-func">{currentStep.activePacket.arp.opcode === 1 ? '1 (REQUEST)' : '2 (REPLY)'}</span></div>
                  <div>Sender: <span className="text-text font-bold">{currentStep.activePacket.arp.senderIp}</span> / <span className="text-text-dim">{currentStep.activePacket.arp.senderMac}</span></div>
                  <div>
                    Target:{' '}
                    <span className="text-text font-bold">{currentStep.activePacket.arp.targetIp}</span> /{' '}
                    <span className={currentStep.activePacket.arp.targetMac === '00:00:00:00:00:00' ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                      {currentStep.activePacket.arp.targetMac}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. SWITCH CAM TABLE & HOST ARP TABLE STATE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
            {/* Switch CAM Table */}
            <div className="p-3 rounded-xl bg-surface-2/60 border border-border-soft space-y-2">
              <div className="flex items-center justify-between text-text font-bold">
                <span className="flex items-center gap-1.5 text-blue-400">
                  <Network className="w-3.5 h-3.5" /> Switch SW1 CAM Table
                </span>
                <span className="text-[10px] text-text-muted">Port ➔ MAC</span>
              </div>
              <div className="space-y-1">
                {currentStep.switchCamTable.length > 0 ? (
                  currentStep.switchCamTable.map((entry, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between px-2 py-1 rounded bg-surface-3 border border-border-soft text-[11px]"
                    >
                      <span className="font-bold text-text">Port {entry.port}</span>
                      <span className="text-blue-300">{entry.mac}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-[11px] text-text-faint italic py-1">CAM Table Empty</div>
                )}
              </div>
            </div>

            {/* Host ARP Tables */}
            <div className="p-3 rounded-xl bg-surface-2/60 border border-border-soft space-y-2">
              <div className="flex items-center justify-between text-text font-bold">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <Terminal className="w-3.5 h-3.5" /> Host ARP Cache
                </span>
                <span className="text-[10px] text-text-muted">IP ➔ MAC</span>
              </div>
              <div className="space-y-1">
                {currentStep.hostArpTable.length > 0 ? (
                  currentStep.hostArpTable.map((entry, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between px-2 py-1 rounded bg-surface-3 border border-border-soft text-[11px]"
                    >
                      <span className="text-text font-bold">{entry.host}: {entry.ip}</span>
                      <span className="text-emerald-300 font-bold">{entry.mac}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-[11px] text-text-faint italic py-1">No Dynamic ARP Entries</div>
                )}
              </div>
            </div>
          </div>

          {/* 5. DIAGNOSTICS LOG PANEL (if present in task) */}
          {taskArp.diagnostics && (
            <div className="p-3.5 rounded-xl bg-surface-3/90 border border-border-soft font-mono text-xs space-y-2">
              <div className="flex items-center gap-1.5 text-func font-bold">
                <Terminal className="w-3.5 h-3.5" /> Diagnostic Telemetry &amp; PCAP Trace
              </div>
              {taskArp.diagnostics.arpTableOutput && (
                <div className="p-2 rounded bg-black/60 border border-border-soft text-[11px] text-text-dim whitespace-pre-wrap">
                  {taskArp.diagnostics.arpTableOutput}
                </div>
              )}
              {taskArp.diagnostics.pingOutput && (
                <div className="p-2 rounded bg-black/60 border border-border-soft text-[11px] text-text-dim whitespace-pre-wrap">
                  {taskArp.diagnostics.pingOutput}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
