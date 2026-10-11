'use client';

import React, { useState, useMemo } from 'react';
import type { DhcpTaskContent, DhcpServerInfo } from '../../../types/curriculum';
import {
  Server,
  Laptop,
  Radio,
  ArrowRight,
  Shield,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  RotateCcw,
  Sliders,
  Layers,
  HelpCircle,
  Info,
  Zap,
} from 'lucide-react';

export interface DhcpDoraSimulatorProps {
  taskContent?: DhcpTaskContent;
  title?: string;
  description?: string;
}

export function calculateDhcpTimers(leaseSeconds: number = 28800) {
  const t1 = Math.round(leaseSeconds * 0.5); // 50%
  const t2 = Math.round(leaseSeconds * 0.875); // 87.5%

  const formatHours = (sec: number) => {
    const hours = (sec / 3600).toFixed(1).replace(/\.0$/, '');
    return `${hours}h (${sec.toLocaleString()}s)`;
  };

  return {
    leaseSeconds,
    t1Seconds: t1,
    t2Seconds: t2,
    leaseFormatted: formatHours(leaseSeconds),
    t1Formatted: formatHours(t1),
    t2Formatted: formatHours(t2),
  };
}

export const DhcpDoraSimulator: React.FC<DhcpDoraSimulatorProps> = ({
  taskContent,
  title,
  description,
}) => {
  const clientMac = taskContent?.clientMac || '00:1A:2B:3C:4D:5E';
  const clientHostname = taskContent?.clientHostname || 'WORKSTATION-01';
  const transactionId = taskContent?.transactionId || '0x39A2F1B0';
  const initialStep = taskContent?.initialStep || 1;
  const initialScenario = taskContent?.scenarioMode || (taskContent?.competingServer ? 'competing_servers' : 'standard');
  const baseLease = taskContent?.leaseSeconds || taskContent?.primaryServer?.leaseTimeSeconds || 28800;

  const [currentStep, setCurrentStep] = useState<number>(initialStep);
  const [activeScenario, setActiveScenario] = useState<'standard' | 'competing_servers' | 'apipa_timeout'>(initialScenario);
  const [leaseDuration, setLeaseDuration] = useState<number>(baseLease);
  const [dhcpSnoopingEnabled, setDhcpSnoopingEnabled] = useState<boolean>(false);

  const primaryServer: DhcpServerInfo = useMemo(() => {
    return (
      taskContent?.primaryServer || {
        name: 'Corporate DHCP Server (Server A)',
        serverIp: '192.168.1.1',
        serverMac: '00:50:56:C0:00:01',
        offeredIp: '192.168.1.100',
        subnetMask: '255.255.255.0 (/24)',
        gateway: '192.168.1.1',
        dns: '192.168.1.1, 8.8.8.8',
        leaseTimeSeconds: leaseDuration,
      }
    );
  }, [taskContent?.primaryServer, leaseDuration]);

  const competingServer: DhcpServerInfo = useMemo(() => {
    return (
      taskContent?.competingServer || {
        name: 'Rogue Wi-Fi Router (Server B)',
        serverIp: '10.0.0.1',
        serverMac: '00:11:22:33:44:02',
        offeredIp: '10.0.0.50',
        subnetMask: '255.255.255.0 (/24)',
        gateway: '10.0.0.1',
        dns: '10.0.0.1',
        leaseTimeSeconds: 86400,
        isRogue: true,
      }
    );
  }, [taskContent?.competingServer]);

  const timers = useMemo(() => calculateDhcpTimers(leaseDuration), [leaseDuration]);

  return (
    <div
      className="w-full rounded-2xl border border-border bg-surface-1/90 backdrop-blur-md p-4 sm:p-5 shadow-lg space-y-5 text-text"
      data-testid="dhcp-dora-simulator"
    >
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER BAR: Title, Scenario Tabs & Reset
          ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-soft pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-mono text-sm sm:text-base font-bold text-text">
              {taskContent?.title || title || 'DHCP DORA Exchange & Lease Simulator'}
            </h3>
            <span className="text-[11px] font-mono text-text-dim block">
              RFC 2131 4-Way Handshake • Lease Timers (T1/T2) • APIPA Fallback
            </span>
          </div>
        </div>

        {/* Mode selector */}
        <div className="flex items-center gap-1 bg-surface-2/80 p-1 rounded-lg border border-border-soft self-start sm:self-auto">
          <button
            type="button"
            onClick={() => {
              setActiveScenario('standard');
              setCurrentStep(1);
            }}
            className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition cursor-pointer ${
              activeScenario === 'standard'
                ? 'bg-func text-white font-bold shadow-sm'
                : 'text-text-dim hover:text-text'
            }`}
            data-testid="mode-standard"
          >
            Standard DORA
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveScenario('competing_servers');
              setCurrentStep(2);
            }}
            className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition cursor-pointer ${
              activeScenario === 'competing_servers'
                ? 'bg-func text-white font-bold shadow-sm'
                : 'text-text-dim hover:text-text'
            }`}
            data-testid="mode-competing"
          >
            Competing / Rogue
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveScenario('apipa_timeout');
              setCurrentStep(1);
            }}
            className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition cursor-pointer ${
              activeScenario === 'apipa_timeout'
                ? 'bg-func text-white font-bold shadow-sm'
                : 'text-text-dim hover:text-text'
            }`}
            data-testid="mode-apipa"
          >
            APIPA Timeout
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. 4-STEP DORA TIMELINE STEPPER
          ───────────────────────────────────────────────────────────── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="font-bold text-text-dim flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-func" />
            DORA Protocol Exchange Sequence:
          </span>
          <span className="text-[11px] text-text-dim">
            Transaction ID (XID): <code className="text-func font-bold">{transactionId}</code>
          </span>
        </div>

        <div className="grid grid-cols-4 gap-1.5 text-center text-xs font-mono">
          {[
            { step: 1, label: '1. Discover', desc: 'Broadcast (0.0.0.0)' },
            { step: 2, label: '2. Offer', desc: 'Server(s) IP proposals' },
            { step: 3, label: '3. Request', desc: 'Broadcast selection' },
            { step: 4, label: '4. ACK', desc: 'Binding confirmed' },
          ].map((s) => (
            <button
              key={s.step}
              type="button"
              onClick={() => setCurrentStep(s.step)}
              className={`p-2.5 rounded-xl border transition cursor-pointer flex flex-col items-center justify-between min-h-[58px] ${
                currentStep === s.step
                  ? 'bg-func/20 border-func text-func font-bold shadow-sm'
                  : currentStep > s.step
                  ? 'bg-surface-2 border-emerald-500/40 text-emerald-400'
                  : 'bg-surface-2/60 border-border text-text-dim hover:text-text'
              }`}
              data-testid={`dora-step-btn-${s.step}`}
            >
              <span className="text-[11px] uppercase tracking-wider font-bold truncate">
                {s.label}
              </span>
              <span className="text-[9.5px] opacity-75 truncate">{s.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. ACTIVE STEP PACKET & TOPOLOGY TELEMETRY CARD
          ───────────────────────────────────────────────────────────── */}
      <div className="p-4 rounded-xl border border-border bg-surface-2/80 space-y-4">
        {/* Step 1: Discover */}
        {currentStep === 1 && (
          <div className="space-y-3" data-testid="step-discover-view">
            <div className="flex items-center justify-between border-b border-border-soft pb-2">
              <span className="font-mono text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <Laptop className="w-4 h-4" />
                Step 1: DHCPDISCOVER — Broadcast from Unconfigured Host
              </span>
              <span className="px-2 py-0.5 rounded bg-surface-3 text-[10px] font-mono text-text-dim">
                UDP Port 68 → 67
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-mono text-xs">
              <div className="p-2.5 rounded-lg bg-surface-3/70 border border-border-soft space-y-1">
                <span className="text-[10px] text-text-dim block uppercase">Network Layer (L3):</span>
                <div className="flex justify-between text-[11px]">
                  <span className="text-text-dim">Source IP:</span>
                  <span className="font-bold text-text">0.0.0.0 (Unconfigured)</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-text-dim">Destination IP:</span>
                  <span className="font-bold text-amber-400">255.255.255.255 (Limited Broadcast)</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-surface-3/70 border border-border-soft space-y-1">
                <span className="text-[10px] text-text-dim block uppercase">Data Link Layer (L2):</span>
                <div className="flex justify-between text-[11px]">
                  <span className="text-text-dim">Source MAC:</span>
                  <span className="font-bold text-text">{clientMac}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-text-dim">Destination MAC:</span>
                  <span className="font-bold text-amber-400">FF:FF:FF:FF:FF:FF (Broadcast)</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-surface-3 text-xs font-sans text-text-dim space-y-1">
              <strong className="text-text font-mono block">DHCP Payload Options:</strong>
              <div className="grid grid-cols-2 gap-1 text-[11px] font-mono">
                <span>Option 53: DHCPDISCOVER (1)</span>
                <span>XID: {transactionId}</span>
                <span>Option 55: Parameter Request List</span>
                <span>Client HW (chaddr): {clientMac}</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Offer */}
        {currentStep === 2 && (
          <div className="space-y-3" data-testid="step-offer-view">
            <div className="flex items-center justify-between border-b border-border-soft pb-2">
              <span className="font-mono text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                <Server className="w-4 h-4" />
                Step 2: DHCPOFFER — Server Proposes IP Configuration
              </span>
              <span className="px-2 py-0.5 rounded bg-surface-3 text-[10px] font-mono text-text-dim">
                UDP Port 67 → 68
              </span>
            </div>

            {/* Offer Display (Single or Competing) */}
            <div className={`grid grid-cols-1 ${activeScenario === 'competing_servers' ? 'sm:grid-cols-2' : ''} gap-3`}>
              {/* Primary Offer */}
              <div className="p-3 rounded-lg bg-surface-3/80 border border-emerald-500/30 space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-400">{primaryServer.name}</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px]">
                    Legitimate
                  </span>
                </div>
                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-text-dim">Offered IP (yiaddr):</span>
                    <span className="font-bold text-text">{primaryServer.offeredIp}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-dim">Subnet Mask:</span>
                    <span>{primaryServer.subnetMask}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-dim">Default Gateway:</span>
                    <span className="text-emerald-400 font-bold">{primaryServer.gateway}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-dim">Lease Duration:</span>
                    <span>{timers.leaseFormatted}</span>
                  </div>
                </div>
              </div>

              {/* Competing/Rogue Offer if active */}
              {activeScenario === 'competing_servers' && (
                <div className="p-3 rounded-lg bg-surface-3/80 border border-rose-500/40 space-y-2 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-400">{competingServer.name}</span>
                    <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-bold">
                      Rogue / Conflicting
                    </span>
                  </div>
                  <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-text-dim">Offered IP (yiaddr):</span>
                      <span className="font-bold text-rose-300">{competingServer.offeredIp}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-dim">Subnet Mask:</span>
                      <span>{competingServer.subnetMask}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-dim">Default Gateway:</span>
                      <span className="text-rose-400 font-bold">{competingServer.gateway} (Wrong GW!)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-dim">Lease Duration:</span>
                      <span>24h</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {activeScenario === 'competing_servers' && (
              <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 font-sans">
                <strong>First-Come, First-Served:</strong> DHCP clients do not verify server authorization; they select the first Offer that arrives. Notice how broadcasting the subsequent Request will explicitly notify the non-chosen server to release its hold.
              </div>
            )}
          </div>
        )}

        {/* Step 3: Request */}
        {currentStep === 3 && (
          <div className="space-y-3" data-testid="step-request-view">
            <div className="flex items-center justify-between border-b border-border-soft pb-2">
              <span className="font-mono text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                <Laptop className="w-4 h-4" />
                Step 3: DHCPREQUEST — Broadcast Acceptance of Selected Offer
              </span>
              <span className="px-2 py-0.5 rounded bg-surface-3 text-[10px] font-mono text-text-dim">
                UDP Port 68 → 67 (Broadcast)
              </span>
            </div>

            <div className="p-3 rounded-lg bg-surface-3 space-y-2 font-mono text-xs">
              <div className="flex justify-between text-[11.5px]">
                <span className="text-text-dim">Option 50 (Requested IP):</span>
                <span className="font-bold text-emerald-400">{primaryServer.offeredIp}</span>
              </div>
              <div className="flex justify-between text-[11.5px]">
                <span className="text-text-dim">Option 54 (Server Identifier):</span>
                <span className="font-bold text-cyan-400">{primaryServer.serverIp}</span>
              </div>
              <div className="flex justify-between text-[11.5px]">
                <span className="text-text-dim">Destination IP:</span>
                <span className="font-bold text-amber-400">255.255.255.255 (Broadcast!)</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-xs text-indigo-200 font-sans space-y-1">
              <span className="font-bold font-mono block text-indigo-300">
                Why is the DHCP Request Sent as a Broadcast?
              </span>
              <p className="text-[11.5px] leading-relaxed">
                1. <strong>Ownership:</strong> The client does not officially own the IP address until it receives the server's final ACK.<br />
                2. <strong>Declination Signal:</strong> By broadcasting Option 54 (Server Identifier = {primaryServer.serverIp}), all other DHCP servers on the subnet are informed that their offers were declined, enabling them to return those reserved IPs back to their pool immediately.
              </p>
            </div>
          </div>
        )}

        {/* Step 4: ACK & Bound State */}
        {currentStep === 4 && (
          <div className="space-y-3" data-testid="step-ack-view">
            <div className="flex items-center justify-between border-b border-border-soft pb-2">
              <span className="font-mono text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Step 4: DHCPACK — Lease Committed &amp; Timers Initialized
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold">
                State: BOUND
              </span>
            </div>

            {/* Committed IP Address Bar */}
            <div className="p-3 rounded-lg bg-surface-3/90 border border-emerald-500/30 font-mono text-xs space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-text-dim">Bound IPv4 Address:</span>
                <span className="font-bold text-emerald-400" data-testid="bound-ip-output">
                  {primaryServer.offeredIp}
                </span>
              </div>
              <div className="flex justify-between text-[11.5px]">
                <span className="text-text-dim">Default Gateway:</span>
                <span className="text-text font-bold">{primaryServer.gateway}</span>
              </div>
              <div className="flex justify-between text-[11.5px]">
                <span className="text-text-dim">Subnet Mask:</span>
                <span className="text-text">{primaryServer.subnetMask}</span>
              </div>
            </div>

            {/* Timers Breakdown: T1 & T2 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-xs">
              <div className="p-2.5 rounded-lg bg-surface-3 border border-border-soft">
                <span className="text-[10px] text-text-dim block uppercase">T1 Renewal (50%)</span>
                <span className="font-bold text-cyan-400">{timers.t1Formatted}</span>
                <span className="text-[10px] text-text-dim block mt-0.5 font-sans">
                  Unicast to original server ({primaryServer.serverIp})
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-surface-3 border border-border-soft">
                <span className="text-[10px] text-text-dim block uppercase">T2 Rebind (87.5%)</span>
                <span className="font-bold text-amber-400">{timers.t2Formatted}</span>
                <span className="text-[10px] text-text-dim block mt-0.5 font-sans">
                  Broadcast if T1 times out
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-surface-3 border border-border-soft">
                <span className="text-[10px] text-text-dim block uppercase">Expire (100%)</span>
                <span className="font-bold text-rose-400">{timers.leaseFormatted}</span>
                <span className="text-[10px] text-text-dim block mt-0.5 font-sans">
                  Drop IP; revert to INIT
                </span>
              </div>
            </div>
          </div>
        )}

        {/* APIPA Fallback Mode Details */}
        {activeScenario === 'apipa_timeout' && (
          <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs space-y-2 font-sans" data-testid="apipa-view">
            <div className="flex items-center gap-2 text-rose-400 font-mono font-bold">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>APIPA Failure State (RFC 3927): 169.254.x.x/16</span>
            </div>
            <p className="text-rose-200/90 text-[11.5px] leading-relaxed">
              When client Discover broadcasts receive <strong>zero replies</strong> after multiple retry attempts, Windows and macOS self-assign an address in the reserved <strong>169.254.0.0/16</strong> block.
            </p>
            <div className="p-2 rounded bg-surface-3 font-mono text-[11px] text-text-dim space-y-0.5">
              <div>Assigned IP: 169.254.44.120 • Subnet: 255.255.0.0 (/16)</div>
              <div>Gateway: None (Empty) • Scope: Link-Local Unrouted</div>
            </div>
          </div>
        )}

        {/* Stepper Controls */}
        <div className="flex justify-between items-center pt-2 border-t border-border-soft">
          <button
            type="button"
            disabled={currentStep <= 1}
            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
            className="px-3 py-1 rounded text-xs font-mono bg-surface-3 hover:bg-surface-4 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
          >
            Previous Step
          </button>
          <button
            type="button"
            disabled={currentStep >= 4}
            onClick={() => setCurrentStep((prev) => Math.min(4, prev + 1))}
            className="px-3 py-1 rounded text-xs font-mono font-bold bg-func text-white hover:bg-func/90 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
          >
            Next Step
          </button>
        </div>
      </div>
    </div>
  );
};
