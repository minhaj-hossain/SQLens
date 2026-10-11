'use client';

import React, { useState } from 'react';
import type {
  PacketInspectionTaskContent,
  PacketSnapshot,
  Layer2Header,
  Layer3Header,
  Layer4Header,
  Layer7Payload,
} from '../../../types/curriculum';
import {
  Layers,
  ArrowRight,
  Shield,
  Network,
  Cpu,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sparkles,
  Binary,
  Code2,
  GitCompare,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Server,
  Laptop,
} from 'lucide-react';

export interface PacketInspectorProps {
  taskContent: PacketInspectionTaskContent;
  title?: string;
  description?: string;
}

export const PacketInspector: React.FC<PacketInspectorProps> = ({
  taskContent,
  title,
  description,
}) => {
  const snapshots = taskContent.snapshots || [];
  const [activeSnapshotIndex, setActiveSnapshotIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'structured' | 'comparative' | 'hexdump'>('structured');
  const [expandedLayers, setExpandedLayers] = useState<Record<string, boolean>>({
    l2: true,
    l3: true,
    l4: true,
    l7: true,
  });

  const toggleLayer = (layer: string) => {
    setExpandedLayers((prev) => ({ ...prev, [layer]: !prev[layer] }));
  };

  const currentSnapshot: PacketSnapshot | undefined = snapshots[activeSnapshotIndex] || snapshots[0];
  const isComparativeAvailable = snapshots.length >= 2;

  if (!currentSnapshot) {
    return (
      <div className="p-4 rounded-xl border border-border bg-surface-1 text-text-dim text-xs font-mono">
        No packet snapshots available for inspection.
      </div>
    );
  }

  return (
    <div
      className="w-full rounded-2xl border border-border bg-surface-1/90 backdrop-blur-md p-4 sm:p-5 shadow-lg space-y-4 text-text"
      data-testid="packet-inspector"
    >
      {/* 1. Header Bar with Mode Toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-soft pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-mono text-sm sm:text-base font-bold text-text">
              {taskContent.title || title || 'Multi-Layer Packet Inspector'}
            </h3>
            <span className="text-[11px] font-mono text-text-dim block">
              OSI Protocol Stack &amp; Hop-by-Hop Telemetry
            </span>
          </div>
        </div>

        {/* View Mode Buttons */}
        <div className="flex items-center gap-1.5 bg-surface-2/80 p-1 rounded-lg border border-border-soft self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('structured')}
            className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition cursor-pointer ${
              viewMode === 'structured'
                ? 'bg-func text-white shadow-sm font-bold'
                : 'text-text-dim hover:text-text'
            }`}
            data-testid="view-structured-btn"
          >
            Protocol Layers
          </button>

          {isComparativeAvailable && (
            <button
              type="button"
              onClick={() => setViewMode('comparative')}
              className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition cursor-pointer flex items-center gap-1 ${
                viewMode === 'comparative'
                  ? 'bg-func text-white shadow-sm font-bold'
                  : 'text-text-dim hover:text-text'
              }`}
              data-testid="view-comparative-btn"
            >
              <GitCompare className="w-3 h-3" /> Hop Diff ({snapshots.length} Hops)
            </button>
          )}

          <button
            type="button"
            onClick={() => setViewMode('hexdump')}
            className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition cursor-pointer flex items-center gap-1 ${
              viewMode === 'hexdump'
                ? 'bg-func text-white shadow-sm font-bold'
                : 'text-text-dim hover:text-text'
            }`}
            data-testid="view-hexdump-btn"
          >
            <Binary className="w-3 h-3" /> Hex Dump
          </button>
        </div>
      </div>

      {/* Snapshot Selector Tabs (when multiple snapshots available) */}
      {snapshots.length > 1 && viewMode !== 'comparative' && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-border-soft">
          <span className="text-[11px] font-mono text-text-muted uppercase font-bold mr-1 shrink-0">
            Observation Point:
          </span>
          {snapshots.map((snap, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveSnapshotIndex(idx)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition cursor-pointer whitespace-nowrap ${
                idx === activeSnapshotIndex
                  ? 'bg-surface-3 border-func text-func font-bold shadow-sm'
                  : 'bg-surface-2/60 border-border-soft text-text-dim hover:text-text hover:bg-surface-2'
              }`}
            >
              {snap.hopLabel}
            </button>
          ))}
        </div>
      )}

      {/* Description / Instructions */}
      {(taskContent.description || description) && (
        <p className="text-xs sm:text-sm text-text-dim leading-relaxed font-sans">
          {taskContent.description || description}
        </p>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODE A: STRUCTURED LAYER-BY-LAYER PROGRESSIVE DISCLOSURE
          ───────────────────────────────────────────────────────────── */}
      {viewMode === 'structured' && (
        <div className="space-y-3 font-mono text-xs">
          {/* Quick Summary Pill Bar */}
          <div className="p-2.5 rounded-xl bg-surface-2/70 border border-border-soft flex flex-wrap items-center gap-2 text-[11px]">
            <span className="px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold">
              L2: {currentSnapshot.layer2.srcMac.slice(0, 8)}... ➔ {currentSnapshot.layer2.dstMac.slice(0, 8)}...
            </span>
            <ArrowRight className="w-3 h-3 text-text-muted" />
            <span className="px-2 py-0.5 rounded bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-bold">
              L3: {currentSnapshot.layer3.srcIp} ➔ {currentSnapshot.layer3.dstIp} (TTL {currentSnapshot.layer3.ttl ?? 64})
            </span>
            {currentSnapshot.layer4 && (
              <>
                <ArrowRight className="w-3 h-3 text-text-muted" />
                <span className="px-2 py-0.5 rounded bg-purple-500/15 border border-purple-500/30 text-purple-300 font-bold">
                  L4: {currentSnapshot.layer4.type} {currentSnapshot.layer4.srcPort ? `${currentSnapshot.layer4.srcPort} ➔ ${currentSnapshot.layer4.dstPort}` : ''}
                </span>
              </>
            )}
            {currentSnapshot.layer7 && (
              <>
                <ArrowRight className="w-3 h-3 text-text-muted" />
                <span className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold">
                  L7: {currentSnapshot.layer7.protocol}
                </span>
              </>
            )}
          </div>

          {/* Layer 2: Ethernet Frame Accordion */}
          <div
            className="rounded-xl border border-amber-500/30 bg-surface-2/60 overflow-hidden"
            data-testid="layer2-accordion"
          >
            <button
              type="button"
              onClick={() => toggleLayer('l2')}
              className="w-full flex items-center justify-between p-3 bg-amber-500/10 hover:bg-amber-500/15 transition cursor-pointer text-left"
            >
              <div className="flex items-center gap-2 text-amber-300 font-bold text-xs sm:text-sm">
                <Network className="w-4 h-4 text-amber-400" />
                <span>Layer 2: Data Link Header (Ethernet II Frame)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-amber-400/80 font-mono">
                  {currentSnapshot.layer2.etherType}
                </span>
                {expandedLayers.l2 ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </div>
            </button>

            {expandedLayers.l2 && (
              <div className="p-3.5 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px] bg-surface-2/40">
                <div className="p-2 rounded bg-surface-3/80 border border-border-soft space-y-0.5">
                  <span className="text-text-muted text-[10px] font-bold block uppercase">Source MAC</span>
                  <div className="text-text font-bold">{currentSnapshot.layer2.srcMac}</div>
                </div>
                <div className="p-2 rounded bg-surface-3/80 border border-border-soft space-y-0.5">
                  <span className="text-text-muted text-[10px] font-bold block uppercase">Destination MAC</span>
                  <div className="text-amber-300 font-bold">{currentSnapshot.layer2.dstMac}</div>
                </div>
                <div className="p-2 rounded bg-surface-3/80 border border-border-soft space-y-0.5">
                  <span className="text-text-muted text-[10px] font-bold block uppercase">EtherType Payload Protocol</span>
                  <div className="text-text font-bold">{currentSnapshot.layer2.etherType}</div>
                </div>
                {currentSnapshot.layer2.vlanTag ? (
                  <div className="p-2 rounded bg-blue-500/15 border border-blue-500/30 space-y-0.5">
                    <span className="text-blue-300 text-[10px] font-bold block uppercase">802.1Q VLAN Tag (Encapsulated)</span>
                    <div className="text-blue-200 font-bold">VLAN ID: {currentSnapshot.layer2.vlanTag.vlanId} (TPID {currentSnapshot.layer2.vlanTag.tpid})</div>
                  </div>
                ) : (
                  <div className="p-2 rounded bg-surface-3/80 border border-border-soft space-y-0.5">
                    <span className="text-text-muted text-[10px] font-bold block uppercase">Frame Check Sequence (FCS)</span>
                    <div className="text-text-dim">{currentSnapshot.layer2.fcs || 'CRC-32 (Verified Valid)'}</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Layer 3: Network Packet Accordion */}
          <div
            className="rounded-xl border border-cyan-500/30 bg-surface-2/60 overflow-hidden"
            data-testid="layer3-accordion"
          >
            <button
              type="button"
              onClick={() => toggleLayer('l3')}
              className="w-full flex items-center justify-between p-3 bg-cyan-500/10 hover:bg-cyan-500/15 transition cursor-pointer text-left"
            >
              <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs sm:text-sm">
                <Shield className="w-4 h-4 text-cyan-400" />
                <span>Layer 3: Network Header (IPv{currentSnapshot.layer3.version} Packet)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-cyan-400/80 font-mono">
                  TTL: {currentSnapshot.layer3.ttl ?? 64} | Protocol: {currentSnapshot.layer3.protocol}
                </span>
                {expandedLayers.l3 ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </div>
            </button>

            {expandedLayers.l3 && (
              <div className="p-3.5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-[11px] bg-surface-2/40">
                <div className="p-2 rounded bg-surface-3/80 border border-border-soft space-y-0.5">
                  <span className="text-text-muted text-[10px] font-bold block uppercase">Source IP Address</span>
                  <div className="text-cyan-300 font-bold">{currentSnapshot.layer3.srcIp}</div>
                </div>
                <div className="p-2 rounded bg-surface-3/80 border border-border-soft space-y-0.5">
                  <span className="text-text-muted text-[10px] font-bold block uppercase">Destination IP Address</span>
                  <div className="text-cyan-300 font-bold">{currentSnapshot.layer3.dstIp}</div>
                </div>
                <div className="p-2 rounded bg-surface-3/80 border border-border-soft space-y-0.5">
                  <span className="text-text-muted text-[10px] font-bold block uppercase">Time to Live (TTL)</span>
                  <div className="text-text font-bold">{currentSnapshot.layer3.ttl ?? 64} hops</div>
                </div>
                <div className="p-2 rounded bg-surface-3/80 border border-border-soft space-y-0.5">
                  <span className="text-text-muted text-[10px] font-bold block uppercase">Next-Level Protocol</span>
                  <div className="text-text font-bold">{currentSnapshot.layer3.protocol}</div>
                </div>
                <div className="p-2 rounded bg-surface-3/80 border border-border-soft space-y-0.5">
                  <span className="text-text-muted text-[10px] font-bold block uppercase">Total Packet Length</span>
                  <div className="text-text-dim">{currentSnapshot.layer3.totalLength ?? 84} bytes</div>
                </div>
                <div className="p-2 rounded bg-surface-3/80 border border-border-soft space-y-0.5">
                  <span className="text-text-muted text-[10px] font-bold block uppercase">Header Checksum</span>
                  <div className="text-text-dim">{currentSnapshot.layer3.headerChecksum || '0x4a12 (Valid)'}</div>
                </div>
              </div>
            )}
          </div>

          {/* Layer 4: Transport Segment Accordion */}
          {currentSnapshot.layer4 && (
            <div
              className="rounded-xl border border-purple-500/30 bg-surface-2/60 overflow-hidden"
              data-testid="layer4-accordion"
            >
              <button
                type="button"
                onClick={() => toggleLayer('l4')}
                className="w-full flex items-center justify-between p-3 bg-purple-500/10 hover:bg-purple-500/15 transition cursor-pointer text-left"
              >
                <div className="flex items-center gap-2 text-purple-300 font-bold text-xs sm:text-sm">
                  <Cpu className="w-4 h-4 text-purple-400" />
                  <span>Layer 4: Transport Header ({currentSnapshot.layer4.type} Segment)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-purple-400/80 font-mono">
                    {currentSnapshot.layer4.srcPort ? `Ports ${currentSnapshot.layer4.srcPort} ➔ ${currentSnapshot.layer4.dstPort}` : currentSnapshot.layer4.type}
                  </span>
                  {expandedLayers.l4 ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </div>
              </button>

              {expandedLayers.l4 && (
                <div className="p-3.5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-[11px] bg-surface-2/40">
                  {currentSnapshot.layer4.srcPort !== undefined && (
                    <div className="p-2 rounded bg-surface-3/80 border border-border-soft space-y-0.5">
                      <span className="text-text-muted text-[10px] font-bold block uppercase">Source Port</span>
                      <div className="text-purple-300 font-bold">{currentSnapshot.layer4.srcPort}</div>
                    </div>
                  )}
                  {currentSnapshot.layer4.dstPort !== undefined && (
                    <div className="p-2 rounded bg-surface-3/80 border border-border-soft space-y-0.5">
                      <span className="text-text-muted text-[10px] font-bold block uppercase">Destination Port</span>
                      <div className="text-purple-300 font-bold">{currentSnapshot.layer4.dstPort}</div>
                    </div>
                  )}
                  {currentSnapshot.layer4.seqNum !== undefined && (
                    <div className="p-2 rounded bg-surface-3/80 border border-border-soft space-y-0.5">
                      <span className="text-text-muted text-[10px] font-bold block uppercase">Sequence Number</span>
                      <div className="text-text font-bold">{currentSnapshot.layer4.seqNum}</div>
                    </div>
                  )}
                  {currentSnapshot.layer4.flags && (
                    <div className="p-2 rounded bg-surface-3/80 border border-border-soft space-y-0.5 sm:col-span-2">
                      <span className="text-text-muted text-[10px] font-bold block uppercase">Control Flags</span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {Object.entries(currentSnapshot.layer4.flags).map(([k, v]) => (
                          <span
                            key={k}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              v
                                ? 'bg-purple-500/25 border border-purple-500/40 text-purple-200'
                                : 'bg-surface-4 text-text-muted'
                            }`}
                          >
                            {k.toUpperCase()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Layer 7: Application Payload Accordion */}
          {currentSnapshot.layer7 && (
            <div
              className="rounded-xl border border-emerald-500/30 bg-surface-2/60 overflow-hidden"
              data-testid="layer7-accordion"
            >
              <button
                type="button"
                onClick={() => toggleLayer('l7')}
                className="w-full flex items-center justify-between p-3 bg-emerald-500/10 hover:bg-emerald-500/15 transition cursor-pointer text-left"
              >
                <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs sm:text-sm">
                  <Code2 className="w-4 h-4 text-emerald-400" />
                  <span>Layer 7: Application Data ({currentSnapshot.layer7.protocol})</span>
                </div>
                {expandedLayers.l7 ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {expandedLayers.l7 && (
                <div className="p-3.5 space-y-2 text-[11px] bg-surface-2/40">
                  <div className="p-2.5 rounded bg-surface-3 border border-border-soft text-text leading-relaxed">
                    <span className="text-text-muted text-[10px] font-bold uppercase block mb-1">Payload Summary</span>
                    {currentSnapshot.layer7.summary}
                  </div>
                  {currentSnapshot.layer7.data && (
                    <div className="p-2.5 rounded bg-black/50 border border-border-soft space-y-1 font-mono text-[10.5px]">
                      {Object.entries(currentSnapshot.layer7.data).map(([k, v]) => (
                        <div key={k} className="flex items-center justify-between">
                          <span className="text-text-dim">{k}:</span>
                          <span className="text-emerald-300 font-bold">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODE B: COMPARATIVE HOP-BY-HOP DIFFERENTIAL VIEW
          ───────────────────────────────────────────────────────────── */}
      {viewMode === 'comparative' && isComparativeAvailable && (
        <div className="space-y-4 font-mono text-xs" data-testid="hop-comparator">
          {/* Highlighted Modifications Card */}
          {taskContent.highlightedModifications && taskContent.highlightedModifications.length > 0 && (
            <div className="p-3.5 rounded-xl bg-surface-2/90 border border-func/30 space-y-2">
              <span className="font-bold text-text flex items-center gap-1.5 text-xs">
                <Sparkles className="w-3.5 h-3.5 text-func" />
                Detected Cross-Hop Transformations:
              </span>
              <div className="space-y-1.5">
                {taskContent.highlightedModifications.map((mod, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-lg bg-surface-3/80 border border-border-soft flex flex-col sm:flex-row sm:items-center justify-between gap-1.5"
                    data-testid="diff-badge"
                  >
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-func/20 text-func border border-func/30">
                        {mod.layer} {mod.field}
                      </span>
                      <span className="text-[11px] text-text font-sans">{mod.description}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <span className="text-text-muted line-through">{mod.beforeValue}</span>
                      <ArrowRight className="w-3 h-3 text-func" />
                      <span className="text-emerald-400 font-bold">{mod.afterValue}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Side-by-Side Snapshots Comparison Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
            {snapshots.slice(0, 2).map((snap, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border space-y-3 ${
                  idx === 0
                    ? 'bg-surface-2/60 border-border-soft'
                    : 'bg-surface-2/90 border-cyan-500/40 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between border-b border-border-soft pb-2">
                  <span className="font-bold text-text flex items-center gap-1.5 text-xs">
                    {idx === 0 ? <Laptop className="w-3.5 h-3.5 text-amber-400" /> : <Server className="w-3.5 h-3.5 text-cyan-400" />}
                    {snap.hopLabel}
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-surface-3 text-text-dim border border-border-soft">
                    {snap.deviceType || (idx === 0 ? 'Ingress Hop' : 'Egress Hop')}
                  </span>
                </div>

                <div className="space-y-2 text-[11px]">
                  {/* Layer 2 */}
                  <div className="p-2 rounded bg-surface-3/70 border border-border-soft space-y-0.5">
                    <span className="text-amber-400 text-[10px] font-bold block uppercase">L2 Ethernet</span>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Src MAC:</span>
                      <span className="text-text font-bold">{snap.layer2.srcMac}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Dst MAC:</span>
                      <span className="text-amber-300 font-bold">{snap.layer2.dstMac}</span>
                    </div>
                  </div>

                  {/* Layer 3 */}
                  <div className="p-2 rounded bg-surface-3/70 border border-border-soft space-y-0.5">
                    <span className="text-cyan-400 text-[10px] font-bold block uppercase">L3 Network</span>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Src IP:</span>
                      <span className="text-cyan-300 font-bold">{snap.layer3.srcIp}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Dst IP:</span>
                      <span className="text-cyan-300 font-bold">{snap.layer3.dstIp}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">TTL:</span>
                      <span className="text-text font-bold">{snap.layer3.ttl ?? 64} hops</span>
                    </div>
                  </div>

                  {/* Layer 4 */}
                  {snap.layer4 && (
                    <div className="p-2 rounded bg-surface-3/70 border border-border-soft space-y-0.5">
                      <span className="text-purple-400 text-[10px] font-bold block uppercase">L4 Transport ({snap.layer4.type})</span>
                      {snap.layer4.srcPort && (
                        <div className="flex justify-between">
                          <span className="text-text-muted">Ports:</span>
                          <span className="text-purple-300 font-bold">{snap.layer4.srcPort} ➔ {snap.layer4.dstPort}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODE C: RAW HEX DUMP VIEW
          ───────────────────────────────────────────────────────────── */}
      {viewMode === 'hexdump' && (
        <div className="p-3.5 rounded-xl bg-black/70 border border-border-soft font-mono text-xs space-y-2">
          <div className="flex items-center justify-between text-[11px] text-text-dim border-b border-border-soft pb-1.5">
            <span>Offset (hex)</span>
            <span>Raw Frame Octets (00–0F)</span>
            <span>ASCII</span>
          </div>
          <div className="text-[11px] text-cyan-300 leading-relaxed overflow-x-auto whitespace-pre font-mono">
            {currentSnapshot.layer7?.rawHex || `0000  ${currentSnapshot.layer2.dstMac.replace(/:/g, ' ')} ${currentSnapshot.layer2.srcMac.replace(/:/g, ' ')} 08 00
0010  45 00 00 54 1a 2b 40 00 ${((currentSnapshot.layer3.ttl ?? 64).toString(16).padStart(2, '0'))} 01 4a 12 c0 a8 01 0a
0020  08 08 08 08 08 00 b5 3d 00 01 00 01 66 11 0a 00
0030  00 00 00 00 10 11 12 13 14 15 16 17 18 19 1a 1b`}
          </div>
        </div>
      )}
    </div>
  );
};
