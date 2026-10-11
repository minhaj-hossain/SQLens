'use client';

import React, { useState, useMemo } from 'react';
import type { Ipv6NdpTaskContent } from '../../../types/curriculum';
import {
  Network,
  Layers,
  ArrowRight,
  Shield,
  Zap,
  RotateCcw,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Info,
  ChevronRight,
  Radio,
  Binary,
  HelpCircle,
  Eye,
  RefreshCw,
  Cpu,
} from 'lucide-react';

export interface Ipv6NdpSimulatorProps {
  taskContent?: Ipv6NdpTaskContent;
  title?: string;
  description?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Pure Helper Functions: RFC 4291 EUI-64 & RFC 4861 NDP Derivation
// ─────────────────────────────────────────────────────────────────────────────

export interface Eui64Result {
  originalMac: string;
  oui: string;
  nic: string;
  invertedFirstOctet: string;
  interfaceId: string;
  linkLocal: string;
  slaacGlobal?: string;
}

export function macToEui64(mac: string, routerPrefix: string = '2001:db8:abc::/64'): Eui64Result {
  const clean = mac.replace(/[^0-9a-fA-F]/g, '').toLowerCase();
  const padded = clean.padEnd(12, '0').slice(0, 12);
  
  const octets: string[] = [];
  for (let i = 0; i < 12; i += 2) {
    octets.push(padded.slice(i, i + 2));
  }

  const oui = `${octets[0]}:${octets[1]}:${octets[2]}`.toUpperCase();
  const nic = `${octets[3]}:${octets[4]}:${octets[5]}`.toUpperCase();

  // Invert bit 7 of first octet (Universal/Local bit)
  const firstByte = parseInt(octets[0], 16);
  const invertedByte = firstByte ^ 0x02;
  const invertedHex = invertedByte.toString(16).padStart(2, '0');

  // Insert FF:FE in the middle
  // EUI-64 octets: [invertedHex, octet1, octet2, 'ff', 'fe', octet3, octet4, octet5]
  const h1 = `${invertedHex}${octets[1]}`;
  const h2 = `${octets[2]}ff`;
  const h3 = `fe${octets[3]}`;
  const h4 = `${octets[4]}${octets[5]}`;
  const interfaceId = `${h1}:${h2}:${h3}:${h4}`;

  // Link-Local prefix fe80::
  const linkLocal = canonicalizeIpv6(`fe80:0000:0000:0000:${interfaceId}`);

  // SLAAC global address if prefix provided
  const prefixBase = routerPrefix.replace(/\/\d+$/, '').replace(/::$/, '');
  const slaacGlobal = `${prefixBase}::${interfaceId}`;

  return {
    originalMac: mac.toUpperCase(),
    oui,
    nic,
    invertedFirstOctet: invertedHex.toUpperCase(),
    interfaceId,
    linkLocal,
    slaacGlobal,
  };
}

export function toSolicitedNodeMulticast(ipv6: string): {
  targetIpv6: string;
  lower24Bits: string;
  solicitedMulticast: string;
  multicastMac: string;
} {
  const expanded = expandIpv6(ipv6);
  // Last 2 hextets: e.g. '0000', '0020' -> total 32 bits. Lower 24 bits = last 6 hex chars.
  const joined = expanded.join('');
  const last6Hex = joined.slice(-6); // 24 bits
  const hexPart1 = last6Hex.slice(0, 2);
  const hexPart2 = last6Hex.slice(2, 6);

  const solicitedMulticast = `ff02::1:ff${hexPart1}:${hexPart2}`;
  const multicastMac = `33:33:FF:${last6Hex.slice(0, 2)}:${last6Hex.slice(2, 4)}:${last6Hex.slice(4, 6)}`.toUpperCase();

  return {
    targetIpv6: ipv6,
    lower24Bits: `${last6Hex.slice(0, 2)}:${last6Hex.slice(2, 4)}:${last6Hex.slice(4, 6)}`.toUpperCase(),
    solicitedMulticast,
    multicastMac,
  };
}

export function expandIpv6(addr: string): string[] {
  let clean = addr.trim().toLowerCase();
  const hasDoubleColon = clean.includes('::');

  if (hasDoubleColon) {
    const [left, right] = clean.split('::');
    const leftParts = left ? left.split(':') : [];
    const rightParts = right ? right.split(':') : [];
    const missingCount = 8 - (leftParts.length + rightParts.length);
    const middleParts = Array(Math.max(0, missingCount)).fill('0000');
    const all = [...leftParts, ...middleParts, ...rightParts];
    return all.map((p) => p.padStart(4, '0'));
  }

  const parts = clean.split(':');
  while (parts.length < 8) parts.push('0000');
  return parts.slice(0, 8).map((p) => p.padStart(4, '0'));
}

export function canonicalizeIpv6(addr: string): string {
  const hextets = expandIpv6(addr).map((h) => parseInt(h, 16).toString(16));
  
  // Find longest run of consecutive zeros
  let maxStart = -1;
  let maxLength = 0;
  let currentStart = -1;
  let currentLength = 0;

  for (let i = 0; i < 8; i++) {
    if (hextets[i] === '0') {
      if (currentStart === -1) {
        currentStart = i;
        currentLength = 1;
      } else {
        currentLength++;
      }
      if (currentLength > maxLength) {
        maxLength = currentLength;
        maxStart = currentStart;
      }
    } else {
      currentStart = -1;
      currentLength = 0;
    }
  }

  // RFC 5952: only compress if length >= 2
  if (maxLength >= 2) {
    const left = hextets.slice(0, maxStart).join(':');
    const right = hextets.slice(maxStart + maxLength).join(':');
    return `${left}::${right}`;
  }

  return hextets.join(':');
}

// ─────────────────────────────────────────────────────────────────────────────
// Component: Ipv6NdpSimulator
// ─────────────────────────────────────────────────────────────────────────────

export const Ipv6NdpSimulator: React.FC<Ipv6NdpSimulatorProps> = ({
  taskContent,
  title,
  description,
}) => {
  const initialMac = taskContent?.macAddress || '3C:22:FB:4A:11:80';
  const initialTargetIpv6 = taskContent?.targetIpv6 || '2001:db8:1::20';
  const routerPrefix = taskContent?.routerPrefix || '2001:db8:abc::/64';
  const defaultMode = taskContent?.defaultMode || 'eui64';
  const initialStep = taskContent?.interactiveStep ?? 1;

  const [activeTab, setActiveTab] = useState<'eui64' | 'ndp_flow' | 'compression'>(defaultMode);
  const [macInput, setMacInput] = useState<string>(initialMac);
  const [targetIpv6Input, setTargetIpv6Input] = useState<string>(initialTargetIpv6);
  const [euiStep, setEuiStep] = useState<number>(initialStep);
  const [ndpStep, setNdpStep] = useState<number>(1);
  const [broadcastComparisonMode, setBroadcastComparisonMode] = useState<boolean>(true);

  // Computed EUI-64 and NDP artifacts
  const euiData = useMemo(() => macToEui64(macInput, routerPrefix), [macInput, routerPrefix]);
  const ndpData = useMemo(() => toSolicitedNodeMulticast(targetIpv6Input), [targetIpv6Input]);

  return (
    <div
      className="w-full rounded-2xl border border-border bg-surface-1/90 backdrop-blur-md p-4 sm:p-5 shadow-lg space-y-5 text-text"
      data-testid="ipv6-ndp-simulator"
    >
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER BAR: Title & Mode Tabs
          ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-soft pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Network className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-mono text-sm sm:text-base font-bold text-text">
              {taskContent?.title || title || 'IPv6 NDP & Modified EUI-64 Simulator'}
            </h3>
            <span className="text-[11px] font-mono text-text-dim block">
              RFC 4291 EUI-64 • RFC 4861 Neighbor Discovery • RFC 5952 Compression
            </span>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 bg-surface-2/80 p-1 rounded-lg border border-border-soft self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('eui64')}
            className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition cursor-pointer ${
              activeTab === 'eui64'
                ? 'bg-func text-white font-bold shadow-sm'
                : 'text-text-dim hover:text-text'
            }`}
            data-testid="tab-eui64"
          >
            EUI-64 Stepper
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ndp_flow')}
            className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition cursor-pointer ${
              activeTab === 'ndp_flow'
                ? 'bg-func text-white font-bold shadow-sm'
                : 'text-text-dim hover:text-text'
            }`}
            data-testid="tab-ndp-flow"
          >
            NDP NS/NA Flow
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('compression')}
            className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition cursor-pointer ${
              activeTab === 'compression'
                ? 'bg-func text-white font-bold shadow-sm'
                : 'text-text-dim hover:text-text'
            }`}
            data-testid="tab-compression"
          >
            Zero Compression
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. TAB 1: MODIFIED EUI-64 & LINK-LOCAL STEPPER
          ───────────────────────────────────────────────────────────── */}
      {activeTab === 'eui64' && (
        <div className="space-y-4" data-testid="eui64-panel">
          {/* Persistent EUI-64 Address Result Summary */}
          <div className="p-3 rounded-xl border border-border bg-surface-2/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-surface-3/70 border border-border-soft space-y-0.5">
              <span className="text-[10px] text-text-dim block uppercase">Link-Local Address (fe80::/10):</span>
              <span className="font-bold text-emerald-400 break-all text-xs" data-testid="link-local-output">
                {euiData.linkLocal}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-surface-3/70 border border-border-soft space-y-0.5">
              <span className="text-[10px] text-text-dim block uppercase">SLAAC Global Address (from {routerPrefix}):</span>
              <span className="font-bold text-cyan-400 break-all text-xs" data-testid="slaac-output">
                {euiData.slaacGlobal}
              </span>
            </div>
          </div>
          {/* Quick Preset Selector */}
          <div className="p-3 rounded-xl border border-border bg-surface-2/60 flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-text-dim">Source MAC:</span>
              <input
                type="text"
                value={macInput}
                onChange={(e) => setMacInput(e.target.value)}
                className="px-2.5 py-1 rounded-lg bg-surface-3 border border-border text-xs font-mono font-bold text-emerald-400 focus:outline-none focus:border-func w-44"
                data-testid="mac-input"
              />
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-mono text-text-dim">Presets:</span>
              {[
                '3C:22:FB:4A:11:80',
                '00:1A:2B:3C:4D:5E',
                '02:00:5E:00:12:34',
                'AA:BB:CC:11:22:33',
              ].map((pMac) => (
                <button
                  key={pMac}
                  type="button"
                  onClick={() => setMacInput(pMac)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono transition border cursor-pointer ${
                    macInput.toUpperCase() === pMac
                      ? 'bg-func text-white border-func font-bold'
                      : 'bg-surface-3 text-text-dim border-border-soft hover:text-text'
                  }`}
                >
                  {pMac.slice(0, 8)}…
                </button>
              ))}
            </div>
          </div>

          {/* Stepper Progress Indicator */}
          <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
            {[
              { step: 1, label: '1. Split MAC (24/24)' },
              { step: 2, label: '2. Insert FF:FE' },
              { step: 3, label: '3. Invert Bit 7 (U/L)' },
              { step: 4, label: '4. Prepend fe80::' },
            ].map((s) => (
              <button
                key={s.step}
                type="button"
                onClick={() => setEuiStep(s.step)}
                className={`p-2 rounded-xl border transition cursor-pointer flex flex-col items-center gap-1 ${
                  euiStep === s.step
                    ? 'bg-func/20 border-func text-func font-bold shadow-sm'
                    : euiStep > s.step
                    ? 'bg-surface-2 border-emerald-500/40 text-emerald-400'
                    : 'bg-surface-2/60 border-border text-text-dim hover:text-text'
                }`}
                data-testid={`eui-step-btn-${s.step}`}
              >
                <span className="text-[10px] uppercase tracking-wider">{s.label}</span>
              </button>
            ))}
          </div>

          {/* Step Detail Card */}
          <div className="p-4 rounded-xl border border-border bg-surface-2/80 space-y-3.5">
            {euiStep === 1 && (
              <div className="space-y-3">
                <span className="font-mono text-xs font-bold text-text flex items-center gap-1.5">
                  <Binary className="w-4 h-4 text-func" />
                  Step 1: Dissect 48-bit MAC into 24-bit Halves
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                  <div className="p-3 rounded-lg bg-surface-3/70 border border-border-soft space-y-1">
                    <span className="text-[10px] text-text-dim block uppercase">
                      OUI (Manufacturer 24 bits):
                    </span>
                    <span className="text-base font-bold text-emerald-400">{euiData.oui}</span>
                    <p className="text-[11px] font-sans text-text-dim">
                      Assigned by IEEE registration authority to identify the hardware vendor.
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-surface-3/70 border border-border-soft space-y-1">
                    <span className="text-[10px] text-text-dim block uppercase">
                      NIC Specific (Device 24 bits):
                    </span>
                    <span className="text-base font-bold text-cyan-400">{euiData.nic}</span>
                    <p className="text-[11px] font-sans text-text-dim">
                      Unique device serial number assigned by vendor during manufacturing.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {euiStep === 2 && (
              <div className="space-y-3">
                <span className="font-mono text-xs font-bold text-text flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-func" />
                  Step 2: Insert 16-bit Delimiter (0xFFFE) in the Middle
                </span>
                <p className="text-xs text-text-dim font-sans leading-relaxed">
                  To expand a 48-bit MAC into a 64-bit IEEE EUI-64 identifier, standard convention inserts the 16-bit constant{' '}
                  <code className="text-amber-400 font-mono font-bold">FF:FE</code> directly between the OUI and device identifier.
                </p>
                <div className="p-3 rounded-lg bg-surface-3 font-mono text-xs flex flex-wrap items-center justify-center gap-2 text-center">
                  <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                    {euiData.oui}
                  </span>
                  <span className="text-text-dim">+</span>
                  <span className="px-2.5 py-1 rounded bg-amber-500/25 border border-amber-500/40 text-amber-300 font-bold animate-pulse">
                    FF:FE
                  </span>
                  <span className="text-text-dim">+</span>
                  <span className="px-2 py-1 rounded bg-cyan-500/20 text-cyan-300 font-bold">
                    {euiData.nic}
                  </span>
                </div>
              </div>
            )}

            {euiStep === 3 && (
              <div className="space-y-3">
                <span className="font-mono text-xs font-bold text-text flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-func" />
                  Step 3: Invert Universal/Local (U/L) Bit 7 (RFC 4291)
                </span>
                <div className="p-3 rounded-lg bg-surface-3 space-y-2 font-mono text-xs">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-text-dim">First MAC Octet:</span>
                    <span className="font-bold text-text">{euiData.originalMac.slice(0, 2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-text-dim">Inverted U/L Octet (XOR 0x02):</span>
                    <span className="font-bold text-rose-400">{euiData.invertedFirstOctet}</span>
                  </div>
                  <div className="pt-2 border-t border-border-soft text-[11px] font-sans text-text-dim leading-relaxed">
                    <strong>RFC 4291 Rationale:</strong> In IEEE MAC addresses, bit 7 is <code className="text-func font-mono">0</code> for universally unique burned-in addresses. In IPv6 Interface IDs, this bit is inverted to <code className="text-func font-mono">1</code> so that network engineers configuring manual addresses (like <code className="text-func font-mono">::1</code> or <code className="text-func font-mono">::2</code>) naturally produce local scope without flipping high bits.
                  </div>
                </div>
              </div>
            )}

            {euiStep === 4 && (
              <div className="space-y-3">
                <span className="font-mono text-xs font-bold text-text flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Step 4: Prepend Link-Local Prefix (fe80::/10) &amp; Form SLAAC Address
                </span>
                <div className="space-y-2 font-mono text-xs">
                  <div className="p-3 rounded-lg bg-surface-3 border border-border-soft space-y-1">
                    <span className="text-[10px] text-text-dim uppercase block">
                      Canonical Link-Local IPv6 Address (Non-Routable):
                    </span>
                    <span className="text-sm sm:text-base font-bold text-emerald-400 break-all block" data-testid="link-local-output">
                      {euiData.linkLocal}
                    </span>
                    <span className="text-[10px] text-text-dim font-sans block">
                      Auto-generated at interface startup; used by NDP and local gateways.
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-surface-3 border border-border-soft space-y-1">
                    <span className="text-[10px] text-text-dim uppercase block">
                      SLAAC Global Unicast Address (from RA Prefix {routerPrefix}):
                    </span>
                    <span className="text-sm sm:text-base font-bold text-cyan-400 break-all block" data-testid="slaac-output">
                      {euiData.slaacGlobal}
                    </span>
                    <span className="text-[10px] text-text-dim font-sans block">
                      Publicly routable IPv6 address constructed without any DHCP server.
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Step navigation buttons */}
            <div className="flex justify-between items-center pt-2 border-t border-border-soft">
              <button
                type="button"
                disabled={euiStep <= 1}
                onClick={() => setEuiStep((prev) => Math.max(1, prev - 1))}
                className="px-3 py-1 rounded text-xs font-mono bg-surface-3 hover:bg-surface-4 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              >
                Previous Step
              </button>
              <button
                type="button"
                disabled={euiStep >= 4}
                onClick={() => setEuiStep((prev) => Math.min(4, prev + 1))}
                className="px-3 py-1 rounded text-xs font-mono font-bold bg-func text-white hover:bg-func/90 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              >
                Next Step
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. TAB 2: SOLICITED-NODE MULTICAST & NDP RESOLUTION FLOW
          ───────────────────────────────────────────────────────────── */}
      {activeTab === 'ndp_flow' && (
        <div className="space-y-4" data-testid="ndp-flow-panel">
          {/* Target Address & Solicited Multicast Formula */}
          <div className="p-3.5 rounded-xl border border-border bg-surface-2/60 space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-mono font-bold text-text-dim">Target IPv6 Address:</span>
              <input
                type="text"
                value={targetIpv6Input}
                onChange={(e) => setTargetIpv6Input(e.target.value)}
                className="px-2.5 py-1 rounded-lg bg-surface-3 border border-border text-xs font-mono font-bold text-cyan-400 focus:outline-none focus:border-func w-full sm:w-64"
                data-testid="target-ipv6-input"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-xs">
              <div className="p-2.5 rounded-lg bg-surface-3 border border-border-soft">
                <span className="text-[10px] text-text-dim block uppercase">Lower 24 Bits</span>
                <span className="font-bold text-amber-400 text-sm">{ndpData.lower24Bits}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-surface-3 border border-border-soft">
                <span className="text-[10px] text-text-dim block uppercase">Solicited-Node Multicast</span>
                <span className="font-bold text-emerald-400 text-sm break-all" data-testid="solicited-multicast">
                  {ndpData.solicitedMulticast}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-surface-3 border border-border-soft">
                <span className="text-[10px] text-text-dim block uppercase">Multicast L2 MAC</span>
                <span className="font-bold text-indigo-400 text-sm">{ndpData.multicastMac}</span>
              </div>
            </div>
          </div>

          {/* 4-Step NDP Exchange Flow */}
          <div className="p-4 rounded-xl border border-border bg-surface-2/80 space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-text uppercase tracking-wider flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-func" />
                NDP Resolution Protocol Flow:
              </span>
              <div className="flex items-center gap-1 font-mono text-xs">
                {[1, 2, 3, 4].map((step) => (
                  <button
                    key={step}
                    type="button"
                    onClick={() => setNdpStep(step)}
                    className={`w-6 h-6 rounded-md text-xs font-bold transition cursor-pointer ${
                      ndpStep === step
                        ? 'bg-func text-white'
                        : 'bg-surface-3 text-text-dim hover:text-text'
                    }`}
                  >
                    {step}
                  </button>
                ))}
              </div>
            </div>

            {/* Sequence Diagram Display */}
            {ndpStep === 1 && (
              <div className="p-3.5 rounded-lg bg-surface-3 border border-border-soft space-y-2 text-xs">
                <div className="flex items-center gap-2 text-func font-mono font-bold">
                  <span>Host Alpha</span>
                  <ArrowRight className="w-4 h-4" />
                  <span>Neighbor Solicitation (NS) — ICMPv6 Type 135</span>
                </div>
                <p className="text-text-dim font-sans leading-relaxed text-[11.5px]">
                  Alpha wants to send packets to Beta (<code className="text-text font-mono">{targetIpv6Input}</code>), but does not have Beta's MAC. It sends an NS probe to Beta's solicited-node multicast address <code className="text-emerald-400 font-mono">{ndpData.solicitedMulticast}</code> with L2 MAC <code className="text-indigo-400 font-mono">{ndpData.multicastMac}</code>.
                </p>
                <div className="p-2 rounded bg-surface-2 text-[11px] font-mono text-text-dim">
                  Includes Option: Source Link-Layer Address (Alpha's MAC AA:BB:CC:11:22:33)
                </div>
              </div>
            )}

            {ndpStep === 2 && (
              <div className="p-3.5 rounded-lg bg-surface-3 border border-border-soft space-y-2 text-xs">
                <div className="flex items-center gap-2 text-amber-400 font-mono font-bold">
                  <Shield className="w-4 h-4" />
                  <span>NIC Multicast Hardware Filter Check</span>
                </div>
                <p className="text-text-dim font-sans leading-relaxed text-[11.5px]">
                  Because the frame destination is multicast MAC <code className="text-indigo-400 font-mono">{ndpData.multicastMac}</code>, switches flood it only to ports joined to that group. Hosts that do not share the lower 24 bits discard the frame in their NIC hardware without CPU interrupts. Only Host Beta accepts and processes the NS!
                </p>
              </div>
            )}

            {ndpStep === 3 && (
              <div className="p-3.5 rounded-lg bg-surface-3 border border-border-soft space-y-2 text-xs">
                <div className="flex items-center gap-2 text-emerald-400 font-mono font-bold">
                  <span>Host Beta</span>
                  <ArrowRight className="w-4 h-4" />
                  <span>Neighbor Advertisement (NA) — ICMPv6 Type 136 (Unicast)</span>
                </div>
                <p className="text-text-dim font-sans leading-relaxed text-[11.5px]">
                  Beta sends an NA message unicast back to Alpha's address with Target Link-Layer Address (TLLA = Beta's MAC <code className="text-text font-mono">DD:EE:FF:44:55:66</code>). Flags: Solicited (S=1), Override (O=1).
                </p>
              </div>
            )}

            {ndpStep === 4 && (
              <div className="p-3.5 rounded-lg bg-surface-3 border border-border-soft space-y-2 text-xs">
                <div className="flex items-center gap-2 text-cyan-400 font-mono font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Alpha Neighbor Cache State: REACHABLE</span>
                </div>
                <p className="text-text-dim font-sans leading-relaxed text-[11.5px]">
                  Alpha receives the NA, records <code className="text-text font-mono">{targetIpv6Input} -&gt; DD:EE:FF:44:55:66</code> in its Neighbor Cache under state <strong className="text-emerald-400 font-mono">REACHABLE</strong>, and begins transmitting queued IPv6 datagrams.
                </p>
              </div>
            )}

            {/* Broadcast vs Multicast Efficiency Callout */}
            <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-xs text-indigo-300 font-sans space-y-1">
              <span className="font-mono font-bold block">
                IPv4 ARP Broadcast vs IPv6 Solicited-Node Multicast:
              </span>
              <p className="text-[11px] leading-relaxed text-indigo-200/90">
                In a large subnet with 10,000 workstations, an IPv4 ARP broadcast wakes up and interrupts the CPU of <strong>all 10,000 devices</strong>. In IPv6, solicited-node multicast interrupts only the <strong>1 target device</strong> matching that group!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. TAB 3: ZERO COMPRESSION & EXPANSION LAB (RFC 5952)
          ───────────────────────────────────────────────────────────── */}
      {activeTab === 'compression' && (
        <div className="space-y-4" data-testid="compression-panel">
          <div className="p-4 rounded-xl border border-border bg-surface-2/80 space-y-3">
            <span className="font-mono text-xs font-bold text-text uppercase tracking-wider block">
              RFC 5952 Canonical IPv6 Compression Rules:
            </span>
            <ul className="text-xs text-text-dim space-y-2 list-disc list-inside font-sans leading-relaxed">
              <li>
                <strong className="text-text font-mono">Rule 1 (Omit Leading Zeros):</strong> Inside each 16-bit hextet, omit leading zeros (e.g. <code className="text-func font-mono">0db8 -&gt; db8</code>, <code className="text-func font-mono">0000 -&gt; 0</code>).
              </li>
              <li>
                <strong className="text-text font-mono">Rule 2 (Double Colon `::`):</strong> A single run of consecutive all-zero hextets must be replaced by <code className="text-func font-mono">::</code>. The <code className="text-func font-mono">::</code> can only be used <strong>at most once</strong> per address.
              </li>
              <li>
                <strong className="text-text font-mono">Rule 3 (Longest Run Wins):</strong> If multiple runs of zeros exist, compress the longest run. If runs are of equal length, compress the first run.
              </li>
            </ul>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 font-mono text-xs">
              <div className="p-3 rounded-lg bg-surface-3 border border-border-soft space-y-1">
                <span className="text-[10px] text-text-dim block uppercase">Expanded 128-Bit Form:</span>
                <span className="text-xs font-bold text-text break-all">
                  2001:0db8:0000:0000:0000:ff00:0042:8329
                </span>
              </div>
              <div className="p-3 rounded-lg bg-surface-3 border border-border-soft space-y-1">
                <span className="text-[10px] text-text-dim block uppercase">RFC 5952 Canonical Short Form:</span>
                <span className="text-xs font-bold text-emerald-400 break-all" data-testid="canonical-demo">
                  2001:db8::ff00:42:8329
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
