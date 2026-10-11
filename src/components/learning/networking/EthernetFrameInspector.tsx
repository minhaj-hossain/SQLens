'use client';

import React, { useState, useMemo } from 'react';
import type { EthernetFrameTaskContent } from '../../../types/curriculum';
import {
  Layers,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Cpu,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Sliders,
  Binary,
  Radio,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Info,
  Clock,
  Zap,
} from 'lucide-react';

export interface EthernetFrameInspectorProps {
  taskContent?: EthernetFrameTaskContent;
  title?: string;
  description?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// IEEE 802.3 Standard CRC-32 Lookup Table & Calculator
// ─────────────────────────────────────────────────────────────────────────────
const CRC32_TABLE: number[] = (() => {
  const table: number[] = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table.push(c >>> 0);
  }
  return table;
})();

export function computeCrc32(data: Uint8Array | number[]): number {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < data.length; i++) {
    const byte = data[i];
    crc = (crc >>> 8) ^ CRC32_TABLE[(crc ^ byte) & 0xFF];
  }
  return ((crc ^ 0xFFFFFFFF) >>> 0);
}

function parseMacToBytes(mac: string): number[] {
  const clean = mac.replace(/[^0-9a-fA-F]/g, '');
  const bytes: number[] = [];
  for (let i = 0; i < 12; i += 2) {
    bytes.push(parseInt(clean.slice(i, i + 2) || '0', 16));
  }
  return bytes;
}

function parseHex16ToBytes(hexStr: string): number[] {
  const clean = hexStr.replace(/^0x/i, '').padStart(4, '0');
  return [parseInt(clean.slice(0, 2), 16), parseInt(clean.slice(2, 4), 16)];
}

export const EthernetFrameInspector: React.FC<EthernetFrameInspectorProps> = ({
  taskContent,
  title,
  description,
}) => {
  const dstMacStr = taskContent?.destinationMac || '00:50:56:C0:00:08';
  const srcMacStr = taskContent?.sourceMac || '00:0C:29:12:34:56';
  const etherTypeStr = taskContent?.etherType || '0x0800';
  const payloadProto = taskContent?.payloadProtocol || (etherTypeStr === '0x0806' ? 'ARP Request' : etherTypeStr === '0x86DD' ? 'IPv6 Datagram' : 'IPv4 Datagram');
  const initialSize = taskContent?.initialPayloadSize ?? 1500;
  const initialCorrupted = taskContent?.initialCorrupted ?? false;

  const [payloadSize, setPayloadSize] = useState<number>(initialSize);
  const [hasVlan, setHasVlan] = useState<boolean>(Boolean(taskContent?.hasVlanTag || taskContent?.vlanTag));
  const [isCorrupted, setIsCorrupted] = useState<boolean>(initialCorrupted);
  const [corruptedField, setCorruptedField] = useState<'payload' | 'dstMac' | 'srcMac' | 'etherType'>(
    (taskContent?.corruptedField as any) || 'payload'
  );
  const [activeField, setActiveField] = useState<string>('payload');

  // Minimum payload constraint per IEEE 802.3
  const minPayloadLimit = 46;
  const paddingBytes = Math.max(0, minPayloadLimit - payloadSize);
  const headerBytes = hasVlan ? 18 : 14;
  const fcsBytes = 4;
  const totalFrameBytes = headerBytes + payloadSize + paddingBytes + fcsBytes;
  const wireBytesWithPreamble = totalFrameBytes + 8; // 7B Preamble + 1B SFD

  // Build simulated byte buffer for clean frame
  const cleanFrameBytes = useMemo(() => {
    const bytes: number[] = [];
    // Destination MAC (6B)
    bytes.push(...parseMacToBytes(dstMacStr));
    // Source MAC (6B)
    bytes.push(...parseMacToBytes(srcMacStr));
    // Optional 802.1Q Tag (4B)
    if (hasVlan) {
      bytes.push(0x81, 0x00, 0x00, 0x0A); // TPID 0x8100, VLAN 10
    }
    // EtherType (2B)
    bytes.push(...parseHex16ToBytes(etherTypeStr));
    // Payload bytes (simulated repeating pattern)
    for (let i = 0; i < payloadSize; i++) {
      bytes.push((i + 1) & 0xFF);
    }
    // Padding bytes (0x00)
    for (let i = 0; i < paddingBytes; i++) {
      bytes.push(0x00);
    }
    return bytes;
  }, [dstMacStr, srcMacStr, etherTypeStr, hasVlan, payloadSize, paddingBytes]);

  // Compute transmitted FCS (always clean at sender)
  const transmittedFcs = useMemo(() => {
    return computeCrc32(cleanFrameBytes);
  }, [cleanFrameBytes]);

  // Compute received CRC (altered if corruption is injected)
  const receivedCrc = useMemo(() => {
    if (!isCorrupted) return transmittedFcs;

    const modified = [...cleanFrameBytes];
    if (corruptedField === 'dstMac' && modified.length > 0) {
      modified[0] = modified[0] ^ 0x01; // flip 1 bit in Dst MAC
    } else if (corruptedField === 'srcMac' && modified.length > 6) {
      modified[6] = modified[6] ^ 0x01; // flip 1 bit in Src MAC
    } else if (corruptedField === 'etherType' && modified.length > 12) {
      const idx = hasVlan ? 16 : 12;
      modified[idx] = modified[idx] ^ 0x01;
    } else {
      // payload flip
      const offset = (hasVlan ? 18 : 14) + Math.min(payloadSize - 1, 5);
      if (offset < modified.length) {
        modified[offset] = modified[offset] ^ 0x01;
      }
    }
    return computeCrc32(modified);
  }, [cleanFrameBytes, transmittedFcs, isCorrupted, corruptedField, hasVlan, payloadSize]);

  const isFcsValid = !isCorrupted && transmittedFcs === receivedCrc;

  const formatHexCrc = (val: number) =>
    '0x' + (val >>> 0).toString(16).toUpperCase().padStart(8, '0');

  // Parse OUI and Device ID from MAC
  const dstMacParts = dstMacStr.split(/[:-]/);
  const dstOui = dstMacParts.slice(0, 3).join(':');
  const dstNic = dstMacParts.slice(3).join(':');

  return (
    <div
      className="w-full rounded-2xl border border-border bg-surface-1/90 backdrop-blur-md p-4 sm:p-5 shadow-lg space-y-5 text-text"
      data-testid="ethernet-frame-inspector"
    >
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER BAR: Title, RFC Indicators & Reset
          ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-soft pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-mono text-sm sm:text-base font-bold text-text">
              {taskContent?.title || title || 'Ethernet Frame & FCS Inspector'}
            </h3>
            <span className="text-[11px] font-mono text-text-dim block">
              IEEE 802.3 / Ethernet II Framing • MTU &amp; CRC-32 Trailer Verification
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => {
              setPayloadSize(initialSize);
              setIsCorrupted(false);
              setHasVlan(Boolean(taskContent?.hasVlanTag || taskContent?.vlanTag));
            }}
            className="px-2.5 py-1 rounded text-xs font-mono font-medium text-text-dim hover:text-text bg-surface-2/80 hover:bg-surface-3 border border-border-soft transition flex items-center gap-1 cursor-pointer"
            title="Reset frame parameters to initial values"
            data-testid="reset-frame-btn"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. WIRE METRICS STRIP: Total Frame, MTU, Padding & IPG
          ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-2.5 rounded-xl border border-border bg-surface-2/60">
          <span className="text-[10px] font-mono text-text-dim uppercase tracking-wider block">
            Payload Size (MTU)
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="font-mono text-base font-bold text-text">{payloadSize}</span>
            <span className="text-[10px] font-mono text-text-dim">/ 1500 B</span>
          </div>
          <span className="text-[10px] text-text-dim font-sans block mt-0.5">
            {payloadSize === 1500 ? 'Standard Max MTU' : payloadSize < 46 ? 'Sub-minimum (<46B)' : 'Valid Payload'}
          </span>
        </div>

        <div className="p-2.5 rounded-xl border border-border bg-surface-2/60">
          <span className="text-[10px] font-mono text-text-dim uppercase tracking-wider block">
            Padding Inserted
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className={`font-mono text-base font-bold ${paddingBytes > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {paddingBytes}
            </span>
            <span className="text-[10px] font-mono text-text-dim">Bytes (0x00)</span>
          </div>
          <span className="text-[10px] text-text-dim font-sans block mt-0.5">
            {paddingBytes > 0 ? 'Enforces 64B min frame' : 'No padding required'}
          </span>
        </div>

        <div className="p-2.5 rounded-xl border border-border bg-surface-2/60">
          <span className="text-[10px] font-mono text-text-dim uppercase tracking-wider block">
            On-Wire Frame Size
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="font-mono text-base font-bold text-text">{totalFrameBytes}</span>
            <span className="text-[10px] font-mono text-text-dim">Bytes</span>
          </div>
          <span className="text-[10px] text-text-dim font-sans block mt-0.5">
            Min 64B • Max {hasVlan ? '1522B (VLAN)' : '1518B'}
          </span>
        </div>

        <div className="p-2.5 rounded-xl border border-border bg-surface-2/60">
          <span className="text-[10px] font-mono text-text-dim uppercase tracking-wider block">
            Inter-Packet Gap (IPG)
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="font-mono text-base font-bold text-cyan-400">96</span>
            <span className="text-[10px] font-mono text-text-dim">Bit Times</span>
          </div>
          <span className="text-[10px] text-text-dim font-sans block mt-0.5">
            0.096 µs @ 1 Gbps (idle wire)
          </span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. INTERACTIVE VISUAL FRAME ARCHITECTURE BAR
          ───────────────────────────────────────────────────────────── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="font-bold text-text-dim flex items-center gap-1.5">
            <Binary className="w-3.5 h-3.5 text-func" />
            Layer 2 Frame Structure (Click segment to inspect):
          </span>
          <span className="text-[11px] text-text-dim">
            Total Wire: {totalFrameBytes} Bytes (excl. 8B Preamble/SFD)
          </span>
        </div>

        {/* Visual Segment Diagram */}
        <div className="grid grid-cols-12 gap-1 p-2 rounded-xl border border-border bg-surface-2/80 text-center text-[11px] font-mono select-none overflow-x-auto min-w-[320px]">
          {/* Preamble & SFD (Layer 1 overhead) */}
          <button
            type="button"
            onClick={() => setActiveField('preamble')}
            className={`col-span-2 p-2 rounded-lg border transition cursor-pointer flex flex-col justify-between ${
              activeField === 'preamble'
                ? 'bg-blue-500/20 border-blue-500 text-blue-300 font-bold shadow-sm'
                : 'bg-surface-3/60 border-border-soft text-text-dim hover:text-text'
            }`}
            data-testid="segment-preamble"
          >
            <span className="text-[9px] uppercase tracking-wider opacity-75">Layer 1</span>
            <span className="truncate font-bold">Preamble+SFD</span>
            <span className="text-[10px] opacity-80">8 Bytes</span>
          </button>

          {/* Destination MAC */}
          <button
            type="button"
            onClick={() => setActiveField('dstMac')}
            className={`col-span-2 p-2 rounded-lg border transition cursor-pointer flex flex-col justify-between ${
              activeField === 'dstMac'
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold shadow-sm'
                : 'bg-surface-3/60 border-border-soft text-text-dim hover:text-text'
            }`}
            data-testid="segment-dst-mac"
            title={dstMacStr}
          >
            <span className="text-[9px] uppercase tracking-wider opacity-75">Dst MAC</span>
            <span className="truncate font-bold text-[10.5px]">{dstMacStr}</span>
            <span className="text-[10px] opacity-80">6 Bytes</span>
          </button>

          {/* Source MAC */}
          <button
            type="button"
            onClick={() => setActiveField('srcMac')}
            className={`col-span-2 p-2 rounded-lg border transition cursor-pointer flex flex-col justify-between ${
              activeField === 'srcMac'
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold shadow-sm'
                : 'bg-surface-3/60 border-border-soft text-text-dim hover:text-text'
            }`}
            data-testid="segment-src-mac"
            title={srcMacStr}
          >
            <span className="text-[9px] uppercase tracking-wider opacity-75">Src MAC</span>
            <span className="truncate font-bold text-[10.5px]">{srcMacStr}</span>
            <span className="text-[10px] opacity-80">6 Bytes</span>
          </button>

          {/* Optional 802.1Q Tag or EtherType */}
          {hasVlan && (
            <button
              type="button"
              onClick={() => setActiveField('vlan')}
              className={`col-span-1 p-2 rounded-lg border transition cursor-pointer flex flex-col justify-between ${
                activeField === 'vlan'
                  ? 'bg-purple-500/20 border-purple-500 text-purple-300 font-bold shadow-sm'
                  : 'bg-surface-3/60 border-border-soft text-text-dim hover:text-text'
              }`}
              data-testid="segment-vlan"
            >
              <span className="text-[9px] uppercase tracking-wider opacity-75">802.1Q</span>
              <span className="truncate font-bold">VLAN</span>
              <span className="text-[10px] opacity-80">4B</span>
            </button>
          )}

          {/* EtherType */}
          <button
            type="button"
            onClick={() => setActiveField('etherType')}
            className={`${hasVlan ? 'col-span-1' : 'col-span-2'} p-2 rounded-lg border transition cursor-pointer flex flex-col justify-between ${
              activeField === 'etherType'
                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-bold shadow-sm'
                : 'bg-surface-3/60 border-border-soft text-text-dim hover:text-text'
            }`}
            data-testid="segment-ether-type"
          >
            <span className="text-[9px] uppercase tracking-wider opacity-75">Type</span>
            <span className="truncate font-bold">{etherTypeStr}</span>
            <span className="text-[10px] opacity-80">2 Bytes</span>
          </button>

          {/* Payload (Variable) */}
          <button
            type="button"
            onClick={() => setActiveField('payload')}
            className={`${paddingBytes > 0 ? (hasVlan ? 'col-span-2' : 'col-span-2') : hasVlan ? 'col-span-3' : 'col-span-3'} p-2 rounded-lg border transition cursor-pointer flex flex-col justify-between ${
              activeField === 'payload'
                ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300 font-bold shadow-sm'
                : 'bg-surface-3/60 border-border-soft text-text-dim hover:text-text'
            }`}
            data-testid="segment-payload"
          >
            <span className="text-[9px] uppercase tracking-wider opacity-75">L3 Payload</span>
            <span className="truncate font-bold">{payloadProto}</span>
            <span className="text-[10px] opacity-80">{payloadSize} Bytes</span>
          </button>

          {/* Padding (if needed) */}
          {paddingBytes > 0 && (
            <button
              type="button"
              onClick={() => setActiveField('padding')}
              className={`col-span-1 p-2 rounded-lg border transition cursor-pointer flex flex-col justify-between ${
                activeField === 'padding'
                  ? 'bg-amber-500/25 border-amber-500 text-amber-300 font-bold shadow-sm'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/15'
              }`}
              data-testid="segment-padding"
            >
              <span className="text-[9px] uppercase tracking-wider opacity-75">Pad</span>
              <span className="truncate font-bold">0x00</span>
              <span className="text-[10px] opacity-80">{paddingBytes}B</span>
            </button>
          )}

          {/* FCS Trailer */}
          <button
            type="button"
            onClick={() => setActiveField('fcs')}
            className={`col-span-1 p-2 rounded-lg border transition cursor-pointer flex flex-col justify-between ${
              activeField === 'fcs'
                ? isFcsValid
                  ? 'bg-emerald-500/25 border-emerald-500 text-emerald-300 font-bold shadow-sm'
                  : 'bg-rose-500/25 border-rose-500 text-rose-300 font-bold shadow-sm'
                : isFcsValid
                ? 'bg-surface-3/60 border-border-soft text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/40 text-rose-400'
            }`}
            data-testid="segment-fcs"
          >
            <span className="text-[9px] uppercase tracking-wider opacity-75">FCS</span>
            <span className="truncate font-bold">CRC-32</span>
            <span className="text-[10px] opacity-80">4 Bytes</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. DYNAMIC PAYLOAD SLIDER & BOUNDARY PRESETS
          ───────────────────────────────────────────────────────────── */}
      <div className="p-3.5 sm:p-4 rounded-xl border border-border bg-surface-2/60 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-func" />
            <span className="font-mono text-xs font-bold text-text">
              Dynamic Payload Sizer:
            </span>
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-surface-3 border border-border text-func">
              {payloadSize} Bytes
            </span>
          </div>

          {/* Quick presets */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-mono text-text-dim mr-1">Presets:</span>
            <button
              type="button"
              onClick={() => setPayloadSize(20)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition cursor-pointer border ${
                payloadSize === 20
                  ? 'bg-func text-white border-func font-bold'
                  : 'bg-surface-3 border-border-soft text-text-dim hover:text-text'
              }`}
              data-testid="preset-20"
            >
              20B (Tiny ACK)
            </button>
            <button
              type="button"
              onClick={() => setPayloadSize(46)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition cursor-pointer border ${
                payloadSize === 46
                  ? 'bg-func text-white border-func font-bold'
                  : 'bg-surface-3 border-border-soft text-text-dim hover:text-text'
              }`}
              data-testid="preset-46"
            >
              46B (Min Cutoff)
            </button>
            <button
              type="button"
              onClick={() => setPayloadSize(576)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition cursor-pointer border ${
                payloadSize === 576
                  ? 'bg-func text-white border-func font-bold'
                  : 'bg-surface-3 border-border-soft text-text-dim hover:text-text'
              }`}
              data-testid="preset-576"
            >
              576B (Dial-up/IPv4)
            </button>
            <button
              type="button"
              onClick={() => setPayloadSize(1500)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition cursor-pointer border ${
                payloadSize === 1500
                  ? 'bg-func text-white border-func font-bold'
                  : 'bg-surface-3 border-border-soft text-text-dim hover:text-text'
              }`}
              data-testid="preset-1500"
            >
              1500B (Std MTU)
            </button>
          </div>
        </div>

        {/* Range Slider */}
        <div className="space-y-1">
          <input
            type="range"
            min="10"
            max="1500"
            step="1"
            value={payloadSize}
            onChange={(e) => setPayloadSize(parseInt(e.target.value, 10))}
            className="w-full accent-func cursor-pointer h-2 bg-surface-3 rounded-lg"
            data-testid="payload-slider"
          />
          <div className="flex justify-between text-[10px] font-mono text-text-dim">
            <span>10 Bytes (Sub-minimum)</span>
            <span className="text-amber-400 font-bold">46B Minimum Payload Cutoff</span>
            <span>1500 Bytes (Standard MTU)</span>
          </div>
        </div>

        {/* Padding Warning Callout if < 46 bytes */}
        {paddingBytes > 0 && (
          <div
            className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-300"
            data-testid="padding-notice"
          >
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5 font-sans">
              <span className="font-bold font-mono block">
                64-Byte Minimum Ethernet Frame Rule Activated:
              </span>
              <p className="text-[11.5px] leading-relaxed text-amber-200/90">
                Because payload ({payloadSize}B) is below 46 bytes, Ethernet hardware must inject{' '}
                <strong>{paddingBytes} padding bytes (0x00)</strong> so the frame reaches exactly{' '}
                <strong>64 bytes</strong> on the wire (excluding preamble). This guarantees collision detection
                across half-duplex CSMA/CD network segments.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          5. FCS CRC-32 & BIT-FLIP ERROR INJECTION LAB
          ───────────────────────────────────────────────────────────── */}
      <div className="p-3.5 sm:p-4 rounded-xl border border-border bg-surface-2/60 space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-func" />
            <h4 className="font-mono text-xs font-bold text-text uppercase tracking-wider">
              FCS Trailer &amp; CRC-32 Bit Integrity Verification
            </h4>
          </div>

          {/* Bit Error Injector Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-text-dim">Simulate Noise / Bit-Flip:</span>
            <button
              type="button"
              onClick={() => setIsCorrupted((prev) => !prev)}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                isCorrupted
                  ? 'bg-rose-500 text-white border-rose-600 shadow-sm animate-pulse'
                  : 'bg-surface-3 hover:bg-surface-4 text-text-dim hover:text-text border-border-soft'
              }`}
              data-testid="bit-flip-btn"
            >
              <Zap className="w-3.5 h-3.5" />
              {isCorrupted ? 'Bit-Flip ACTIVE' : 'Inject Bit Error'}
            </button>
          </div>
        </div>

        {/* Error Target Selector when corrupted */}
        {isCorrupted && (
          <div className="flex items-center gap-2 pt-1 border-t border-border-soft text-xs font-mono">
            <span className="text-text-dim text-[11px]">Corrupt Bit In:</span>
            {(['payload', 'dstMac', 'srcMac', 'etherType'] as const).map((field) => (
              <button
                key={field}
                type="button"
                onClick={() => setCorruptedField(field)}
                className={`px-2 py-0.5 rounded text-[10.5px] cursor-pointer transition border ${
                  corruptedField === field
                    ? 'bg-rose-500/25 border-rose-500 text-rose-300 font-bold'
                    : 'bg-surface-3 border-border-soft text-text-dim hover:text-text'
                }`}
              >
                {field === 'dstMac'
                  ? 'Dst MAC'
                  : field === 'srcMac'
                  ? 'Src MAC'
                  : field === 'etherType'
                  ? 'EtherType'
                  : 'Payload'}
              </button>
            ))}
          </div>
        )}

        {/* CRC Comparison & NIC Verdict Banner */}
        <div
          className={`p-3 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
            isFcsValid
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
          }`}
          data-testid="fcs-status-banner"
        >
          <div className="flex items-start gap-2.5">
            {isFcsValid ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div className="space-y-0.5">
              <span className="font-mono text-xs font-bold block">
                {isFcsValid
                  ? 'CRC MATCH — Frame Check Sequence Validated'
                  : 'CRC MISMATCH — Frame Check Sequence Corrupted!'}
              </span>
              <p className="text-[11.5px] font-sans text-text-dim">
                {isFcsValid
                  ? 'Receiving NIC verifies bit integrity: L2 headers decapsulated, L3 payload passed to host network stack.'
                  : 'SILENT DROP: Receiving NIC discards the corrupted frame immediately. Ethernet provides ZERO Layer 2 retransmission.'}
              </p>
            </div>
          </div>

          <div className="font-mono text-xs space-y-1 bg-surface-1/60 p-2 rounded-lg border border-border-soft shrink-0 w-full sm:w-auto">
            <div className="flex justify-between gap-3 text-[11px]">
              <span className="text-text-dim">Transmitted FCS:</span>
              <span className="font-bold text-emerald-400">{formatHexCrc(transmittedFcs)}</span>
            </div>
            <div className="flex justify-between gap-3 text-[11px]">
              <span className="text-text-dim">Recalculated CRC:</span>
              <span className={`font-bold ${isFcsValid ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatHexCrc(receivedCrc)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          6. DETAILED FIELD DISSECTION PANEL
          ───────────────────────────────────────────────────────────── */}
      <div className="p-3.5 sm:p-4 rounded-xl border border-border bg-surface-2/60 space-y-2">
        <h4 className="font-mono text-xs font-bold text-text uppercase tracking-wider flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-func" />
          Field Telemetry &amp; RFC Specifications ({activeField.toUpperCase()})
        </h4>

        {activeField === 'preamble' && (
          <div className="text-xs space-y-1.5 text-text-dim font-sans">
            <p className="leading-relaxed">
              <strong className="text-text font-mono">Preamble (7 Octets) + SFD (1 Octet)</strong>: 56 alternating bits{' '}
              <code className="text-func font-mono">10101010</code> (<code className="text-func font-mono">0xAA</code>) followed by the 8-bit Start of Frame Delimiter{' '}
              <code className="text-func font-mono">10101011</code> (<code className="text-func font-mono">0xAB</code>).
            </p>
            <p className="leading-relaxed">
              Used by Layer 1 transceivers to lock receiving clock PLL circuits with the incoming electrical/optical waveform. Stripped by the physical layer prior to MAC frame delivery — not counted in frame size boundaries.
            </p>
          </div>
        )}

        {activeField === 'dstMac' && (
          <div className="text-xs space-y-1.5 text-text-dim font-sans">
            <p className="leading-relaxed">
              <strong className="text-text font-mono">Destination MAC (6 Octets / 48 Bits)</strong>:{' '}
              <code className="text-emerald-400 font-mono font-bold">{dstMacStr}</code>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
              <div className="p-2 rounded bg-surface-3/60 border border-border-soft">
                <span className="text-text-dim block">OUI (Organization Unique Id):</span>
                <span className="text-text font-bold">{dstOui} (IEEE Vendor Identifier)</span>
              </div>
              <div className="p-2 rounded bg-surface-3/60 border border-border-soft">
                <span className="text-text-dim block">NIC Specific (Device ID):</span>
                <span className="text-text font-bold">{dstNic}</span>
              </div>
            </div>
            <p className="leading-relaxed text-[11px]">
              The least-significant bit of the first octet indicates address type: <code className="text-func font-mono">0</code> = Unicast (individual recipient), <code className="text-func font-mono">1</code> = Multicast/Broadcast.
            </p>
          </div>
        )}

        {activeField === 'srcMac' && (
          <div className="text-xs space-y-1.5 text-text-dim font-sans">
            <p className="leading-relaxed">
              <strong className="text-text font-mono">Source MAC (6 Octets / 48 Bits)</strong>:{' '}
              <code className="text-emerald-400 font-mono font-bold">{srcMacStr}</code>
            </p>
            <p className="leading-relaxed">
              Hardware identifier of the sending interface. Switches record this source MAC against their ingress port in their CAM/MAC forwarding table (Module 3).
            </p>
          </div>
        )}

        {activeField === 'vlan' && (
          <div className="text-xs space-y-1.5 text-text-dim font-sans">
            <p className="leading-relaxed">
              <strong className="text-text font-mono">IEEE 802.1Q VLAN Tag (4 Octets)</strong>: Tag Protocol Identifier (TPID{' '}
              <code className="text-purple-400 font-mono">0x8100</code>) + Tag Control Information (3-bit Priority PCP, 1-bit DEI, 12-bit VLAN ID).
            </p>
            <p className="leading-relaxed">
              Expands standard frame overhead by 4 bytes. Increases maximum standard Ethernet wire frame size from <strong>1518 bytes</strong> to <strong>1522 bytes</strong>.
            </p>
          </div>
        )}

        {activeField === 'etherType' && (
          <div className="text-xs space-y-1.5 text-text-dim font-sans">
            <p className="leading-relaxed">
              <strong className="text-text font-mono">EtherType Field (2 Octets / 16 Bits)</strong>:{' '}
              <code className="text-cyan-400 font-mono font-bold">{etherTypeStr}</code> ({payloadProto})
            </p>
            <p className="leading-relaxed text-[11px]">
              IEEE 802.3 Convention: Values &gt;= <code className="text-func font-mono">0x0600</code> (1536 decimal) represent an <strong>EtherType</strong> protocol identifier (<code className="text-func font-mono">0x0800</code> IPv4, <code className="text-func font-mono">0x0806</code> ARP, <code className="text-func font-mono">0x86DD</code> IPv6). Values &lt;= 1500 represent 802.3 Length.
            </p>
          </div>
        )}

        {activeField === 'payload' && (
          <div className="text-xs space-y-1.5 text-text-dim font-sans">
            <p className="leading-relaxed">
              <strong className="text-text font-mono">Layer 3 Payload ({payloadSize} Bytes)</strong>:{' '}
              Encapsulated {payloadProto}.
            </p>
            <p className="leading-relaxed text-[11px]">
              Bounded by the interface <strong>MTU (Maximum Transmission Unit)</strong> of 1500 bytes. Standard Ethernet cannot carry payloads larger than 1500 bytes without IP fragmentation or Jumbo Frames (up to 9000 bytes in datacenters).
            </p>
          </div>
        )}

        {activeField === 'padding' && (
          <div className="text-xs space-y-1.5 text-text-dim font-sans">
            <p className="leading-relaxed">
              <strong className="text-text font-mono">Ethernet Padding ({paddingBytes} Octets of 0x00)</strong>
            </p>
            <p className="leading-relaxed text-[11px]">
              Inserted automatically by the transmitting MAC controller whenever the payload is smaller than 46 bytes. Ensures the minimum frame size of 64 bytes is met so slot times during collision detection function accurately.
            </p>
          </div>
        )}

        {activeField === 'fcs' && (
          <div className="text-xs space-y-1.5 text-text-dim font-sans">
            <p className="leading-relaxed">
              <strong className="text-text font-mono">Frame Check Sequence Trailer (4 Octets / 32 Bits)</strong>:{' '}
              CRC-32 Checksum (<code className="text-emerald-400 font-mono">{formatHexCrc(transmittedFcs)}</code>).
            </p>
            <p className="leading-relaxed text-[11px]">
              Calculated across all fields from Destination MAC through Payload/Padding. Detects all single and double bit errors, odd number bit errors, and burst errors up to 32 bits with 99.99999% mathematical accuracy.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
