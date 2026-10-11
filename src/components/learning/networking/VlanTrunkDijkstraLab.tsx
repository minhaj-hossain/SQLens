import React, { useState, useMemo } from 'react';
import {
  Layers,
  Radio,
  Network,
  RotateCcw,
  Play,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  ArrowRight,
  ShieldAlert,
  Zap,
} from 'lucide-react';
import type {
  VlanDijkstraTaskContent,
  VlanConfig,
  TrunkPortConfig,
  VlanTrunkPacket,
  WifiChannelConfig,
  OspfRouterNode,
  OspfLink,
} from '../../../types/networking-curriculum';

// ─────────────────────────────────────────────────────────────────────────────
// PURE DOMAIN HELPER FUNCTIONS (RFC 2328, IEEE 802.1Q, IEEE 802.11)
// ─────────────────────────────────────────────────────────────────────────────

export interface DijkstraStepRecord {
  step: number;
  currentNode: string;
  visited: string[];
  tentativeDistances: Record<string, number>;
  log: string;
}

export interface DijkstraResult {
  source: string;
  distances: Record<string, number>;
  previous: Record<string, string | null>;
  paths: Record<string, string[]>;
  steps: DijkstraStepRecord[];
}

/**
 * Executes Dijkstra's Shortest Path First (SPF) algorithm for OSPF link-state routing (RFC 2328).
 */
export function runDijkstraAlgorithm(
  nodes: { id: string; name?: string }[],
  links: { fromRouter: string; toRouter: string; cost: number; failed?: boolean }[],
  sourceId: string
): DijkstraResult {
  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const visited = new Set<string>();
  const steps: DijkstraStepRecord[] = [];

  // Initialize
  for (const node of nodes) {
    distances[node.id] = node.id === sourceId ? 0 : Infinity;
    previous[node.id] = null;
  }

  // Active (non-failed) bidirectional edges
  const activeLinks = links.filter((l) => !l.failed);

  steps.push({
    step: 0,
    currentNode: sourceId,
    visited: [],
    tentativeDistances: { ...distances },
    log: `Initialized SPF calculation at source router ${sourceId}. Tentative cost is 0; all other routers set to ∞.`,
  });

  let stepCount = 1;
  while (visited.size < nodes.length) {
    // Find unvisited node with smallest distance
    let minNode: string | null = null;
    let minDistance = Infinity;

    for (const node of nodes) {
      if (!visited.has(node.id) && distances[node.id] < minDistance) {
        minDistance = distances[node.id];
        minNode = node.id;
      }
    }

    if (!minNode || minDistance === Infinity) {
      // Remaining nodes are unreachable
      break;
    }

    visited.add(minNode);
    const neighborsUpdated: string[] = [];

    // Relax all edges adjacent to minNode
    for (const link of activeLinks) {
      let neighborId: string | null = null;
      if (link.fromRouter === minNode) neighborId = link.toRouter;
      else if (link.toRouter === minNode) neighborId = link.fromRouter;

      if (neighborId && !visited.has(neighborId)) {
        const alt = distances[minNode] + link.cost;
        if (alt < distances[neighborId]) {
          distances[neighborId] = alt;
          previous[neighborId] = minNode;
          neighborsUpdated.push(`${neighborId} (cost ${alt})`);
        }
      }
    }

    steps.push({
      step: stepCount++,
      currentNode: minNode,
      visited: Array.from(visited),
      tentativeDistances: { ...distances },
      log:
        neighborsUpdated.length > 0
          ? `Visited router ${minNode} (cost ${minDistance}). Relaxed neighbors: ${neighborsUpdated.join(', ')}.`
          : `Visited router ${minNode} (cost ${minDistance}). No unvisited neighbor costs reduced.`,
    });
  }

  // Reconstruct shortest paths
  const paths: Record<string, string[]> = {};
  for (const node of nodes) {
    if (distances[node.id] === Infinity) {
      paths[node.id] = [];
      continue;
    }
    const path: string[] = [];
    let curr: string | null = node.id;
    while (curr) {
      path.unshift(curr);
      curr = previous[curr];
    }
    paths[node.id] = path;
  }

  return {
    source: sourceId,
    distances,
    previous,
    paths,
    steps,
  };
}

export interface VlanTagEvaluation {
  action: 'forward_tagged' | 'forward_untagged' | 'drop_vlan_not_allowed' | 'drop_native_mismatch';
  frameTagged: boolean;
  effectiveVlan: number;
  reason: string;
  tagDetails?: {
    tpid: string;
    pcp: number;
    dei: number;
    vid: number;
    tagHex: string;
  };
}

/**
 * Evaluates an Ethernet frame traversing an 802.1Q trunk or access port.
 */
export function evaluateVlanTrunkFrame(
  frame: {
    vlanId: number;
    isTagged: boolean;
    priority?: number;
    dropEligible?: boolean;
  },
  port: {
    mode: 'access' | 'trunk';
    accessVlan?: number;
    allowedVlans?: number[];
    nativeVlan?: number;
  }
): VlanTagEvaluation {
  const pcp = frame.priority ?? 0;
  const dei = frame.dropEligible ? 1 : 0;
  const vid = frame.vlanId;
  const tci = (pcp << 13) | (dei << 12) | (vid & 0x0fff);
  const tagHex = `8100 ${tci.toString(16).padStart(4, '0').toUpperCase()}`;

  if (port.mode === 'access') {
    const portVlan = port.accessVlan ?? 1;
    if (frame.isTagged && frame.vlanId !== portVlan) {
      return {
        action: 'drop_vlan_not_allowed',
        frameTagged: true,
        effectiveVlan: frame.vlanId,
        reason: `Access port is configured for VLAN ${portVlan}. Tagged frame for VLAN ${frame.vlanId} is discarded.`,
      };
    }
    return {
      action: 'forward_untagged',
      frameTagged: false,
      effectiveVlan: portVlan,
      reason: `Access port delivers frame untagged to endpoint on VLAN ${portVlan}. Any 802.1Q tag is stripped.`,
    };
  }

  // Trunk port
  const nativeVlan = port.nativeVlan ?? 1;
  const allowed = port.allowedVlans ?? [10, 20, 30];

  if (!frame.isTagged) {
    // Untagged frame arriving on trunk belongs to native VLAN
    if (!allowed.includes(nativeVlan)) {
      return {
        action: 'drop_vlan_not_allowed',
        frameTagged: false,
        effectiveVlan: nativeVlan,
        reason: `Untagged frame mapped to Native VLAN ${nativeVlan}, but Native VLAN ${nativeVlan} is not in the allowed trunk list [${allowed.join(', ')}].`,
      };
    }
    return {
      action: 'forward_untagged',
      frameTagged: false,
      effectiveVlan: nativeVlan,
      reason: `Untagged frame belongs to Native VLAN ${nativeVlan} and traverses the trunk without an 802.1Q header.`,
    };
  }

  // Tagged frame on trunk
  if (!allowed.includes(frame.vlanId)) {
    return {
      action: 'drop_vlan_not_allowed',
      frameTagged: true,
      effectiveVlan: frame.vlanId,
      reason: `VLAN ${frame.vlanId} is PRUNED/FILTERED: Not permitted in trunk allowed list [${allowed.join(', ')}]. Frame dropped.`,
      tagDetails: {
        tpid: '0x8100',
        pcp,
        dei,
        vid,
        tagHex,
      },
    };
  }

  return {
    action: 'forward_tagged',
    frameTagged: true,
    effectiveVlan: frame.vlanId,
    reason: `VLAN ${frame.vlanId} is allowed on trunk [${allowed.join(', ')}]. Transmitted with 4-byte 802.1Q tag (VID=${vid}, PCP=${pcp}).`,
    tagDetails: {
      tpid: '0x8100',
      pcp,
      dei,
      vid,
      tagHex,
    },
  };
}

export interface ChannelOverlapAnalysis {
  channelA: number;
  channelB: number;
  frequencyDiffMhz: number;
  isOverlapping: boolean;
  overlapPercentage: number;
  interferenceRisk: 'none' | 'moderate' | 'severe' | 'co-channel';
  explanation: string;
}

/**
 * Analyzes RF channel overlap in the 2.4 GHz band (802.11b/g/n).
 * 20 MHz wide channels centered every 5 MHz (Channels 1 to 11).
 */
export function calculateWifiChannelOverlap(channelA: number, channelB: number): ChannelOverlapAnalysis {
  const diff = Math.abs(channelA - channelB);
  const freqDiffMhz = diff * 5;

  if (diff === 0) {
    return {
      channelA,
      channelB,
      frequencyDiffMhz: 0,
      isOverlapping: true,
      overlapPercentage: 100,
      interferenceRisk: 'co-channel',
      explanation: `Both APs share identical channel ${channelA} (Co-Channel Interference). Radios share the same CSMA/CA contention domain; aggregate throughput is split.`,
    };
  }

  if (diff < 5) {
    // Overlapping channels (< 25 MHz separation)
    const overlapPercentage = Math.round(((25 - freqDiffMhz) / 25) * 100);
    const risk = diff <= 2 ? 'severe' : 'moderate';
    return {
      channelA,
      channelB,
      frequencyDiffMhz: freqDiffMhz,
      isOverlapping: true,
      overlapPercentage,
      interferenceRisk: risk,
      explanation: `Channels ${channelA} and ${channelB} are separated by only ${freqDiffMhz} MHz (< 25 MHz required for 20 MHz width). Overlaps by ~${overlapPercentage}%, causing destructive adjacent-channel packet corruption!`,
    };
  }

  // diff >= 5: Non-overlapping (e.g. 1 and 6, or 6 and 11)
  return {
    channelA,
    channelB,
    frequencyDiffMhz: freqDiffMhz,
    isOverlapping: false,
    overlapPercentage: 0,
    interferenceRisk: 'none',
    explanation: `Channels ${channelA} and ${channelB} have ${freqDiffMhz} MHz separation (>= 25 MHz). Non-overlapping channels provide clean spectral isolation with zero RF interference!`,
  };
}

export interface BackoffSimulation {
  cwMin: number;
  cwMax: number;
  collisionCount: number;
  currentCw: number;
  randomBackoffSlots: number;
  difsUs: number;
  sifsUs: number;
  slotTimeUs: number;
  totalContentionTimeUs: number;
}

/**
 * Simulates 802.11 CSMA/CA binary exponential backoff contention window growth.
 */
export function simulateCsmaCaBackoff(collisionCount: number, fixedRandomSlot?: number): BackoffSimulation {
  const cwMin = 15;
  const cwMax = 1023;
  const difsUs = 28;
  const sifsUs = 10;
  const slotTimeUs = 9;

  // CW doubles on each collision: min(cwMax, (cwMin + 1) * 2^collisions - 1)
  const currentCw = Math.min(cwMax, (cwMin + 1) * Math.pow(2, collisionCount) - 1);
  const randomBackoffSlots =
    fixedRandomSlot !== undefined
      ? Math.min(fixedRandomSlot, currentCw)
      : Math.floor(Math.random() * (currentCw + 1));

  const totalContentionTimeUs = difsUs + randomBackoffSlots * slotTimeUs;

  return {
    cwMin,
    cwMax,
    collisionCount,
    currentCw,
    randomBackoffSlots,
    difsUs,
    sifsUs,
    slotTimeUs,
    totalContentionTimeUs,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT PROPS & DEFAULTS
// ─────────────────────────────────────────────────────────────────────────────

interface VlanTrunkDijkstraLabProps {
  taskContent?: VlanDijkstraTaskContent;
  title?: string;
  description?: string;
}

const DEFAULT_VLANS: VlanConfig[] = [
  { id: 10, name: 'Engineering', color: '#38bdf8' },
  { id: 20, name: 'Finance', color: '#34d399' },
  { id: 30, name: 'Guest / DMZ', color: '#f87171' },
];

const DEFAULT_PACKETS: VlanTrunkPacket[] = [
  {
    id: 'pkt-vlan10',
    sourceHost: 'PC-Eng-1',
    destHost: 'Server-Eng-1',
    sourceIp: '10.0.10.5',
    destIp: '10.0.10.100',
    vlanId: 10,
    isTagged: true,
    priority: 3,
    dropEligible: false,
    payload: 'HTTPS GET /repo/code',
  },
  {
    id: 'pkt-vlan20',
    sourceHost: 'PC-Fin-2',
    destHost: 'Server-Payroll',
    sourceIp: '10.0.20.15',
    destIp: '10.0.20.50',
    vlanId: 20,
    isTagged: true,
    priority: 5,
    dropEligible: false,
    payload: 'SQL Query: payroll_records',
  },
  {
    id: 'pkt-vlan30',
    sourceHost: 'Guest-Laptop',
    destHost: 'Gateway-Internet',
    sourceIp: '10.0.30.88',
    destIp: '10.0.30.1',
    vlanId: 30,
    isTagged: true,
    priority: 0,
    dropEligible: true,
    payload: 'DNS Query: google.com',
  },
  {
    id: 'pkt-native',
    sourceHost: 'Mgmt-Switch-A',
    destHost: 'Mgmt-Switch-B',
    sourceIp: '192.168.1.1',
    destIp: '192.168.1.2',
    vlanId: 1,
    isTagged: false,
    priority: 0,
    dropEligible: false,
    payload: 'CDP/LLDP Management Frame',
  },
];

const DEFAULT_ROUTERS: OspfRouterNode[] = [
  { id: 'R1', name: 'Campus Core (R1)', routerId: '1.1.1.1', area: 0 },
  { id: 'R2', name: 'Data Center (R2)', routerId: '2.2.2.2', area: 0 },
  { id: 'R3', name: 'Branch East (R3)', routerId: '3.3.3.3', area: 0 },
  { id: 'R4', name: 'Branch West (R4)', routerId: '4.4.4.4', area: 0 },
  { id: 'R5', name: 'Edge Gateway (R5)', routerId: '5.5.5.5', area: 0 },
];

const DEFAULT_OSPF_LINKS: OspfLink[] = [
  { id: 'l1-2', fromRouter: 'R1', toRouter: 'R2', bandwidthMbps: 1000, cost: 1 },
  { id: 'l1-3', fromRouter: 'R1', toRouter: 'R3', bandwidthMbps: 100, cost: 10 },
  { id: 'l2-4', fromRouter: 'R2', toRouter: 'R4', bandwidthMbps: 100, cost: 10 },
  { id: 'l3-4', fromRouter: 'R3', toRouter: 'R4', bandwidthMbps: 1000, cost: 1 },
  { id: 'l4-5', fromRouter: 'R4', toRouter: 'R5', bandwidthMbps: 1000, cost: 1 },
  { id: 'l2-5', fromRouter: 'R2', toRouter: 'R5', bandwidthMbps: 10, cost: 100 },
];

export const VlanTrunkDijkstraLab: React.FC<VlanTrunkDijkstraLabProps> = ({
  taskContent,
  title,
  description,
}) => {
  const activeTabDefault = taskContent?.defaultTab || 'vlan_trunking';
  const [activeTab, setActiveTab] = useState<'vlan_trunking' | 'wifi_spectrum' | 'ospf_dijkstra'>(
    activeTabDefault
  );

  // Tab 1: VLAN Trunking State
  const vlans = taskContent?.vlans || DEFAULT_VLANS;
  const packets = taskContent?.packets || DEFAULT_PACKETS;
  const [selectedPacketIndex, setSelectedPacketIndex] = useState(0);
  const [portMode, setPortMode] = useState<'trunk' | 'access'>('trunk');
  const [allowedVlans, setAllowedVlans] = useState<number[]>([10, 20]);
  const [nativeVlan, setNativeVlan] = useState(1);
  const [accessVlan, setAccessVlan] = useState(10);

  // Tab 2: Wi-Fi Spectrum State
  const [channelAp1, setChannelAp1] = useState(6);
  const [channelAp2, setChannelAp2] = useState(7);
  const [collisionCount, setCollisionCount] = useState(0);

  // Tab 3: OSPF Dijkstra State
  const routers = taskContent?.routers || DEFAULT_ROUTERS;
  const initialLinks = taskContent?.links || DEFAULT_OSPF_LINKS;
  const [sourceRouter, setSourceRouter] = useState(taskContent?.sourceRouter || 'R1');
  const [failedLinks, setFailedLinks] = useState<Record<string, boolean>>({});
  const [currentStepIdx, setCurrentStepIdx] = useState<number | null>(null);

  // Computed values
  const activeLinks = useMemo(() => {
    return initialLinks.map((link) => ({
      ...link,
      failed: Boolean(failedLinks[link.id]),
    }));
  }, [initialLinks, failedLinks]);

  const dijkstraResult = useMemo(() => {
    return runDijkstraAlgorithm(routers, activeLinks, sourceRouter);
  }, [routers, activeLinks, sourceRouter]);

  const activePacket = packets[selectedPacketIndex] || packets[0];

  const trunkEvaluation = useMemo(() => {
    return evaluateVlanTrunkFrame(
      {
        vlanId: activePacket.vlanId,
        isTagged: activePacket.isTagged,
        priority: activePacket.priority,
        dropEligible: activePacket.dropEligible,
      },
      {
        mode: portMode,
        accessVlan,
        allowedVlans,
        nativeVlan,
      }
    );
  }, [activePacket, portMode, accessVlan, allowedVlans, nativeVlan]);

  const rfOverlap = useMemo(() => {
    return calculateWifiChannelOverlap(channelAp1, channelAp2);
  }, [channelAp1, channelAp2]);

  const backoffSim = useMemo(() => {
    return simulateCsmaCaBackoff(collisionCount);
  }, [collisionCount]);

  const displayTitle = taskContent?.title || title || '802.1Q VLAN Trunk & OSPF Dijkstra Lab';
  const displayDesc =
    taskContent?.description ||
    description ||
    'Interactive visualization of 4-byte 802.1Q VLAN tagging, Wi-Fi 2.4 GHz channel overlap & CSMA/CA backoff, and OSPF link-state Dijkstra SPF calculations.';

  const handleToggleAllowedVlan = (vlanId: number) => {
    setAllowedVlans((prev) =>
      prev.includes(vlanId) ? prev.filter((v) => v !== vlanId) : [...prev, vlanId].sort((a, b) => a - b)
    );
  };

  const handleToggleLinkFail = (linkId: string) => {
    setFailedLinks((prev) => ({
      ...prev,
      [linkId]: !prev[linkId],
    }));
    setCurrentStepIdx(null);
  };

  return (
    <div
      data-testid="vlan-trunk-dijkstra-lab"
      className="rounded-2xl border border-border bg-surface-1/90 backdrop-blur-md shadow-xl overflow-hidden flex flex-col w-full text-text"
    >
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-border/70 bg-gradient-to-r from-surface-2/60 to-surface-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-400 font-mono text-[11px] font-bold">
              <Layers className="w-3.5 h-3.5" />
              Module 16 Visualizer
            </span>
            <span className="text-text-muted text-xs">•</span>
            <span className="font-mono text-[11px] text-text-dim">802.1Q &amp; OSPF Lab</span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-text tracking-tight">{displayTitle}</h2>
          <p className="text-xs text-text-dim leading-relaxed max-w-2xl">{displayDesc}</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 bg-surface-3/80 p-1 rounded-xl border border-border self-start sm:self-auto">
          <button
            type="button"
            data-testid="tab-vlan-trunking"
            onClick={() => setActiveTab('vlan_trunking')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
              activeTab === 'vlan_trunking'
                ? 'bg-func text-white shadow-sm'
                : 'text-text-muted hover:text-text hover:bg-surface-2'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            802.1Q Trunk
          </button>
          <button
            type="button"
            data-testid="tab-wifi-spectrum"
            onClick={() => setActiveTab('wifi_spectrum')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
              activeTab === 'wifi_spectrum'
                ? 'bg-func text-white shadow-sm'
                : 'text-text-muted hover:text-text hover:bg-surface-2'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            Wi-Fi Spectrum
          </button>
          <button
            type="button"
            data-testid="tab-ospf-dijkstra"
            onClick={() => setActiveTab('ospf_dijkstra')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
              activeTab === 'ospf_dijkstra'
                ? 'bg-func text-white shadow-sm'
                : 'text-text-muted hover:text-text hover:bg-surface-2'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            OSPF Dijkstra
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 sm:p-5 space-y-5">
        {/* TAB 1: 802.1Q VLAN TRUNKING & TAG INSPECTOR */}
        {activeTab === 'vlan_trunking' && (
          <div data-testid="panel-vlan-trunking" className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Left Column: Packet Generator & Port Config */}
              <div className="md:col-span-5 space-y-4">
                <div className="p-4 rounded-xl border border-border bg-surface-2/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-text uppercase tracking-wider">
                      1. Select Test Frame
                    </span>
                    <span className="text-[11px] text-text-dim font-mono">
                      {packets.length} Frames Configured
                    </span>
                  </div>
                  <div className="space-y-2">
                    {packets.map((pkt, idx) => (
                      <button
                        key={pkt.id}
                        type="button"
                        data-testid={`select-packet-${idx}`}
                        onClick={() => setSelectedPacketIndex(idx)}
                        className={`w-full text-left p-2.5 rounded-lg border text-xs font-mono transition-all flex items-center justify-between ${
                          selectedPacketIndex === idx
                            ? 'border-func bg-func/10 text-func font-bold shadow-sm'
                            : 'border-border/60 bg-surface-1/60 hover:bg-surface-2 text-text-muted'
                        }`}
                      >
                        <div className="truncate">
                          <span className="font-bold text-text">{pkt.sourceHost}</span>
                          <span className="text-text-dim text-[11px] ml-1.5">
                            ({pkt.isTagged ? `VLAN ${pkt.vlanId}` : 'Untagged'})
                          </span>
                        </div>
                        <span
                          className="px-1.5 py-0.5 rounded text-[10px] font-bold"
                          style={{
                            backgroundColor: pkt.isTagged
                              ? `${vlans.find((v) => v.id === pkt.vlanId)?.color || '#38bdf8'}20`
                              : '#64748b20',
                            color: pkt.isTagged
                              ? vlans.find((v) => v.id === pkt.vlanId)?.color || '#38bdf8'
                              : '#94a3b8',
                          }}
                        >
                          {pkt.isTagged ? `VID ${pkt.vlanId}` : 'Untagged'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Port Configuration Box */}
                <div className="p-4 rounded-xl border border-border bg-surface-2/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-text uppercase tracking-wider">
                      2. Switch Port Settings
                    </span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        data-testid="toggle-mode-trunk"
                        onClick={() => setPortMode('trunk')}
                        className={`px-2 py-1 rounded text-[11px] font-mono font-bold transition-all ${
                          portMode === 'trunk'
                            ? 'bg-func text-white'
                            : 'bg-surface-3 text-text-dim hover:text-text'
                        }`}
                      >
                        Trunk
                      </button>
                      <button
                        type="button"
                        data-testid="toggle-mode-access"
                        onClick={() => setPortMode('access')}
                        className={`px-2 py-1 rounded text-[11px] font-mono font-bold transition-all ${
                          portMode === 'access'
                            ? 'bg-func text-white'
                            : 'bg-surface-3 text-text-dim hover:text-text'
                        }`}
                      >
                        Access
                      </button>
                    </div>
                  </div>

                  {portMode === 'trunk' ? (
                    <div className="space-y-3 pt-1">
                      <div>
                        <label className="text-[11px] font-mono text-text-dim block mb-1">
                          Allowed VLANs List:
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {[10, 20, 30, 40].map((v) => (
                            <button
                              key={v}
                              type="button"
                              data-testid={`toggle-allowed-vlan-${v}`}
                              onClick={() => handleToggleAllowedVlan(v)}
                              className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold border transition-all ${
                                allowedVlans.includes(v)
                                  ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-400'
                                  : 'border-border/60 bg-surface-1 text-text-muted hover:border-border'
                              }`}
                            >
                              VLAN {v} {allowedVlans.includes(v) ? '✓' : '✗'}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] font-mono text-text-dim">Native VLAN (Untagged):</span>
                        <select
                          data-testid="select-native-vlan"
                          value={nativeVlan}
                          onChange={(e) => setNativeVlan(Number(e.target.value))}
                          className="px-2 py-1 bg-surface-3 border border-border rounded font-mono text-xs text-text"
                        >
                          <option value={1}>VLAN 1 (Default)</option>
                          <option value={10}>VLAN 10</option>
                          <option value={20}>VLAN 20</option>
                          <option value={99}>VLAN 99 (Mgmt)</option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono text-text-dim">Access Port VLAN:</span>
                        <select
                          data-testid="select-access-vlan"
                          value={accessVlan}
                          onChange={(e) => setAccessVlan(Number(e.target.value))}
                          className="px-2 py-1 bg-surface-3 border border-border rounded font-mono text-xs text-text"
                        >
                          <option value={10}>VLAN 10 (Engineering)</option>
                          <option value={20}>VLAN 20 (Finance)</option>
                          <option value={30}>VLAN 30 (Guest)</option>
                        </select>
                      </div>
                      <p className="text-[11px] text-text-dim leading-relaxed">
                        Access ports strip 802.1Q tags upon egress to endpoints and deliver untagged frames.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Frame Dissection & 802.1Q Tag Zoom */}
              <div className="md:col-span-7 space-y-4">
                <div className="p-4 rounded-xl border border-border bg-surface-2/40 space-y-3">
                  <span className="font-mono text-xs font-bold text-text uppercase tracking-wider block">
                    Ethernet Frame Dissection &amp; 802.1Q Tag Insertion
                  </span>

                  {/* Visual Frame Block Layout */}
                  <div className="space-y-2">
                    <div className="grid grid-cols-12 gap-1 font-mono text-[11px] text-center">
                      <div className="col-span-2 p-2 rounded bg-surface-3 border border-border flex flex-col justify-center">
                        <span className="font-bold text-text truncate">Dst MAC</span>
                        <span className="text-[9px] text-text-dim">6 Bytes</span>
                      </div>
                      <div className="col-span-2 p-2 rounded bg-surface-3 border border-border flex flex-col justify-center">
                        <span className="font-bold text-text truncate">Src MAC</span>
                        <span className="text-[9px] text-text-dim">6 Bytes</span>
                      </div>
                      <div
                        className={`col-span-4 p-2 rounded border flex flex-col justify-center transition-all ${
                          trunkEvaluation.frameTagged
                            ? 'bg-sky-500/20 border-sky-400 text-sky-300 ring-2 ring-sky-500/30'
                            : 'bg-surface-3/50 border-dashed border-border-soft text-text-muted'
                        }`}
                      >
                        <span className="font-bold truncate">
                          {trunkEvaluation.frameTagged ? 'IEEE 802.1Q Tag' : 'No 802.1Q Tag'}
                        </span>
                        <span className="text-[9px]">
                          {trunkEvaluation.frameTagged ? '4 Bytes (Inserted)' : 'Untagged Frame'}
                        </span>
                      </div>
                      <div className="col-span-2 p-2 rounded bg-surface-3 border border-border flex flex-col justify-center">
                        <span className="font-bold text-text truncate">EtherType</span>
                        <span className="text-[9px] text-text-dim">2 Bytes</span>
                      </div>
                      <div className="col-span-2 p-2 rounded bg-surface-3 border border-border flex flex-col justify-center">
                        <span className="font-bold text-text truncate">Payload</span>
                        <span className="text-[9px] text-text-dim">46-1500B</span>
                      </div>
                    </div>

                    {/* Exploded 802.1Q Tag Detail */}
                    {trunkEvaluation.tagDetails ? (
                      <div className="p-3 rounded-lg border border-sky-500/40 bg-sky-950/20 space-y-2 mt-2">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="font-bold text-sky-400">802.1Q Tag Fields (32 bits):</span>
                          <span className="font-bold text-sky-300">
                            Hex: {trunkEvaluation.tagDetails.tagHex}
                          </span>
                        </div>
                        <div className="grid grid-cols-4 gap-2 font-mono text-[10.5px] text-center">
                          <div className="p-2 rounded bg-surface-1 border border-sky-500/30">
                            <span className="block text-sky-400 font-bold">TPID (16b)</span>
                            <span className="text-text text-[11px] font-mono">0x8100</span>
                            <span className="text-[9px] text-text-dim block">Protocol ID</span>
                          </div>
                          <div className="p-2 rounded bg-surface-1 border border-sky-500/30">
                            <span className="block text-sky-400 font-bold">PCP (3b)</span>
                            <span className="text-text text-[11px] font-mono">
                              {trunkEvaluation.tagDetails.pcp}
                            </span>
                            <span className="text-[9px] text-text-dim block">CoS Priority</span>
                          </div>
                          <div className="p-2 rounded bg-surface-1 border border-sky-500/30">
                            <span className="block text-sky-400 font-bold">DEI (1b)</span>
                            <span className="text-text text-[11px] font-mono">
                              {trunkEvaluation.tagDetails.dei}
                            </span>
                            <span className="text-[9px] text-text-dim block">Drop Eligible</span>
                          </div>
                          <div className="p-2 rounded bg-surface-1 border border-sky-500/30">
                            <span className="block text-sky-400 font-bold">VID (12b)</span>
                            <span className="text-emerald-400 text-[11px] font-bold font-mono">
                              {trunkEvaluation.tagDetails.vid}
                            </span>
                            <span className="text-[9px] text-text-dim block">VLAN Identifier</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 rounded-lg border border-border/60 bg-surface-1/40 text-xs font-mono text-text-dim">
                        Frame is untagged. Untagged frames belong to Native VLAN {nativeVlan} across trunk links.
                      </div>
                    )}
                  </div>

                  {/* Forwarding Decision Card */}
                  <div
                    data-testid="vlan-decision-card"
                    className={`p-3 rounded-xl border flex items-start gap-3 transition-all ${
                      trunkEvaluation.action === 'forward_tagged'
                        ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300'
                        : trunkEvaluation.action === 'forward_untagged'
                        ? 'border-sky-500/40 bg-sky-950/20 text-sky-300'
                        : 'border-red-500/40 bg-red-950/20 text-red-300'
                    }`}
                  >
                    {trunkEvaluation.action === 'drop_vlan_not_allowed' ? (
                      <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-1 text-xs">
                      <div className="font-mono font-bold uppercase tracking-wider">
                        {trunkEvaluation.action === 'forward_tagged'
                          ? 'Status: FORWARDED TAGGED ACROSS TRUNK'
                          : trunkEvaluation.action === 'forward_untagged'
                          ? 'Status: FORWARDED UNTAGGED'
                          : 'Status: PACKET DROPPED / PRUNED'}
                      </div>
                      <p className="text-[11.5px] leading-relaxed text-text/90 font-sans">
                        {trunkEvaluation.reason}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: WI-FI 2.4 GHz SPECTRUM & CSMA/CA BACKOFF */}
        {activeTab === 'wifi_spectrum' && (
          <div data-testid="panel-wifi-spectrum" className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Left Column: Channel Selectors & Overlap Analysis */}
              <div className="md:col-span-5 space-y-4">
                <div className="p-4 rounded-xl border border-border bg-surface-2/40 space-y-3">
                  <span className="font-mono text-xs font-bold text-text uppercase tracking-wider block">
                    Access Point Channel Selection (2.4 GHz)
                  </span>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-text">AP-1 Channel:</span>
                      <select
                        data-testid="select-ap1-channel"
                        value={channelAp1}
                        onChange={(e) => setChannelAp1(Number(e.target.value))}
                        className="px-2.5 py-1 bg-surface-3 border border-border rounded font-mono text-xs text-text"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((c) => (
                          <option key={c} value={c}>
                            Channel {c} ({2407 + c * 5} MHz)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-text">AP-2 Channel:</span>
                      <select
                        data-testid="select-ap2-channel"
                        value={channelAp2}
                        onChange={(e) => setChannelAp2(Number(e.target.value))}
                        className="px-2.5 py-1 bg-surface-3 border border-border rounded font-mono text-xs text-text"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((c) => (
                          <option key={c} value={c}>
                            Channel {c} ({2407 + c * 5} MHz)
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Quick Presets */}
                    <div className="pt-2 border-t border-border-soft space-y-1.5">
                      <span className="text-[11px] font-mono text-text-dim block">Quick Scenarios:</span>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          data-testid="preset-bad-overlap"
                          onClick={() => {
                            setChannelAp1(6);
                            setChannelAp2(7);
                          }}
                          className="px-2 py-1 rounded bg-red-500/20 border border-red-500/40 text-red-300 text-[10.5px] font-mono font-bold"
                        >
                          Ch 6 &amp; 7 (Severe Overlap)
                        </button>
                        <button
                          type="button"
                          data-testid="preset-clean-plan"
                          onClick={() => {
                            setChannelAp1(1);
                            setChannelAp2(6);
                          }}
                          className="px-2 py-1 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10.5px] font-mono font-bold"
                        >
                          Ch 1 &amp; 6 (Clean 0% Overlap)
                        </button>
                        <button
                          type="button"
                          data-testid="preset-cochannel"
                          onClick={() => {
                            setChannelAp1(6);
                            setChannelAp2(6);
                          }}
                          className="px-2 py-1 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10.5px] font-mono font-bold"
                        >
                          Ch 6 &amp; 6 (Co-Channel)
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Overlap Status Card */}
                <div
                  data-testid="wifi-overlap-card"
                  className={`p-4 rounded-xl border space-y-2 transition-all ${
                    rfOverlap.interferenceRisk === 'none'
                      ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300'
                      : rfOverlap.interferenceRisk === 'co-channel'
                      ? 'border-amber-500/40 bg-amber-950/20 text-amber-300'
                      : 'border-red-500/40 bg-red-950/20 text-red-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      {rfOverlap.interferenceRisk === 'none' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : rfOverlap.interferenceRisk === 'co-channel' ? (
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                      ) : (
                        <ShieldAlert className="w-4 h-4 text-red-400" />
                      )}
                      Interference: {rfOverlap.interferenceRisk.toUpperCase()}
                    </span>
                    <span>{rfOverlap.overlapPercentage}% Overlap</span>
                  </div>
                  <p className="text-xs text-text/90 leading-relaxed font-sans">
                    {rfOverlap.explanation}
                  </p>
                </div>
              </div>

              {/* Right Column: Spectrum Graph & CSMA/CA Backoff Simulator */}
              <div className="md:col-span-7 space-y-4">
                {/* 2.4 GHz Visual Spectrum Graph */}
                <div className="p-4 rounded-xl border border-border bg-surface-2/40 space-y-3">
                  <span className="font-mono text-xs font-bold text-text uppercase tracking-wider block">
                    2.4 GHz RF Channel Mask (20 MHz Width)
                  </span>

                  {/* Channel Frequency Ruler */}
                  <div className="space-y-3 pt-2">
                    <div className="grid grid-cols-11 gap-1 text-center font-mono text-[10px]">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((ch) => {
                        const isAp1 = ch === channelAp1;
                        const isAp2 = ch === channelAp2;
                        const isPrimary = ch === 1 || ch === 6 || ch === 11;
                        return (
                          <div
                            key={ch}
                            className={`p-2 rounded-lg border transition-all flex flex-col justify-center items-center ${
                              isAp1 && isAp2
                                ? 'border-amber-400 bg-amber-500/25 ring-2 ring-amber-400 font-bold'
                                : isAp1
                                ? 'border-sky-400 bg-sky-500/25 ring-2 ring-sky-400 font-bold'
                                : isAp2
                                ? 'border-purple-400 bg-purple-500/25 ring-2 ring-purple-400 font-bold'
                                : isPrimary
                                ? 'border-emerald-500/30 bg-emerald-950/10 text-emerald-400/80'
                                : 'border-border/40 bg-surface-1/40 text-text-dim'
                            }`}
                          >
                            <span className="text-[11px]">Ch {ch}</span>
                            <span className="text-[8.5px] opacity-75">{2407 + ch * 5}M</span>
                            {(isAp1 || isAp2) && (
                              <span className="mt-1 px-1 rounded text-[8px] font-bold bg-surface-1 text-text">
                                {isAp1 && isAp2 ? 'AP1+2' : isAp1 ? 'AP-1' : 'AP-2'}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-[11px] text-text-dim text-center font-mono">
                      Recommended non-overlapping 3-channel plan: Channel 1 (2412 MHz), Channel 6 (2437 MHz), Channel 11 (2462 MHz).
                    </p>
                  </div>
                </div>

                {/* CSMA/CA Collision & Backoff Timeline */}
                <div className="p-4 rounded-xl border border-border bg-surface-2/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-text uppercase tracking-wider">
                      CSMA/CA Binary Exponential Backoff Simulator
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        data-testid="simulate-collision-btn"
                        onClick={() => setCollisionCount((c) => Math.min(6, c + 1))}
                        className="px-2.5 py-1 rounded bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 font-mono text-[11px] font-bold flex items-center gap-1"
                      >
                        <Zap className="w-3 h-3" />
                        Trigger Collision
                      </button>
                      <button
                        type="button"
                        data-testid="reset-backoff-btn"
                        onClick={() => setCollisionCount(0)}
                        className="p-1 rounded bg-surface-3 hover:bg-surface-2 text-text-muted hover:text-text border border-border"
                        title="Reset Backoff"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 font-mono text-center text-xs">
                    <div className="p-2 rounded bg-surface-1 border border-border">
                      <span className="text-text-dim text-[10px] block">Collisions</span>
                      <span className="font-bold text-text text-sm">{collisionCount}</span>
                    </div>
                    <div className="p-2 rounded bg-surface-1 border border-border">
                      <span className="text-text-dim text-[10px] block">Contention Window</span>
                      <span className="font-bold text-amber-400 text-sm">
                        0 .. {backoffSim.currentCw}
                      </span>
                    </div>
                    <div className="p-2 rounded bg-surface-1 border border-border">
                      <span className="text-text-dim text-[10px] block">Random Slot</span>
                      <span className="font-bold text-sky-400 text-sm">
                        {backoffSim.randomBackoffSlots}
                      </span>
                    </div>
                    <div className="p-2 rounded bg-surface-1 border border-border">
                      <span className="text-text-dim text-[10px] block">Total Wait</span>
                      <span className="font-bold text-text text-sm">
                        {backoffSim.totalContentionTimeUs} µs
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-2 rounded bg-surface-1/60 border border-border/60 text-[11px] font-mono text-text-dim">
                    <Info className="w-3.5 h-3.5 text-func flex-shrink-0" />
                    <span>
                      DIFS ({backoffSim.difsUs}µs) + ({backoffSim.randomBackoffSlots} slots × {backoffSim.slotTimeUs}µs) ={' '}
                      {backoffSim.totalContentionTimeUs}µs before transmitting data frame.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: OSPF LINK-STATE DIJKSTRA SPF CALCULATOR */}
        {activeTab === 'ospf_dijkstra' && (
          <div data-testid="panel-ospf-dijkstra" className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Left Column: Topology Controls & Step-by-Step Stepper */}
              <div className="md:col-span-5 space-y-4">
                <div className="p-4 rounded-xl border border-border bg-surface-2/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-text uppercase tracking-wider">
                      OSPF SPF Controls
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-mono text-text-dim">Source:</span>
                      <select
                        data-testid="select-source-router"
                        value={sourceRouter}
                        onChange={(e) => {
                          setSourceRouter(e.target.value);
                          setCurrentStepIdx(null);
                        }}
                        className="px-2 py-0.5 bg-surface-3 border border-border rounded font-mono text-xs text-text"
                      >
                        {routers.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.id} ({r.name})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Stepper Controls */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      data-testid="step-prev-btn"
                      disabled={currentStepIdx === null || currentStepIdx <= 0}
                      onClick={() =>
                        setCurrentStepIdx((curr) =>
                          curr !== null && curr > 0 ? curr - 1 : 0
                        )
                      }
                      className="px-2.5 py-1 rounded bg-surface-3 hover:bg-surface-2 disabled:opacity-40 disabled:cursor-not-allowed border border-border text-xs font-mono font-semibold"
                    >
                      Prev
                    </button>
                    <button
                      type="button"
                      data-testid="step-next-btn"
                      disabled={
                        currentStepIdx !== null &&
                        currentStepIdx >= dijkstraResult.steps.length - 1
                      }
                      onClick={() =>
                        setCurrentStepIdx((curr) =>
                          curr === null ? 1 : Math.min(dijkstraResult.steps.length - 1, curr + 1)
                        )
                      }
                      className="px-2.5 py-1 rounded bg-func hover:bg-func/80 text-white disabled:opacity-40 disabled:cursor-not-allowed text-xs font-mono font-semibold flex items-center gap-1"
                    >
                      Next Step
                    </button>
                    <button
                      type="button"
                      data-testid="step-all-btn"
                      onClick={() => setCurrentStepIdx(dijkstraResult.steps.length - 1)}
                      className="px-2.5 py-1 rounded bg-surface-3 hover:bg-surface-2 border border-border text-xs font-mono font-semibold"
                    >
                      Complete SPF
                    </button>
                    <button
                      type="button"
                      data-testid="step-reset-btn"
                      onClick={() => setCurrentStepIdx(0)}
                      className="p-1.5 rounded bg-surface-3 hover:bg-surface-2 text-text-muted hover:text-text border border-border ml-auto"
                      title="Reset Step"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Step Description Log */}
                  <div
                    data-testid="dijkstra-step-log"
                    className="p-3 rounded-lg border border-border/80 bg-surface-1 font-mono text-[11px] leading-relaxed space-y-1"
                  >
                    <div className="flex items-center justify-between text-func font-bold">
                      <span>
                        Step{' '}
                        {currentStepIdx !== null
                          ? currentStepIdx
                          : dijkstraResult.steps.length - 1}{' '}
                        of {dijkstraResult.steps.length - 1}
                      </span>
                      <span>
                        Visiting:{' '}
                        {
                          dijkstraResult.steps[
                            currentStepIdx !== null
                              ? currentStepIdx
                              : dijkstraResult.steps.length - 1
                          ]?.currentNode
                        }
                      </span>
                    </div>
                    <p className="text-text">
                      {
                        dijkstraResult.steps[
                          currentStepIdx !== null
                            ? currentStepIdx
                            : dijkstraResult.steps.length - 1
                        ]?.log
                      }
                    </p>
                  </div>
                </div>

                {/* Link Failure Simulation Toggles */}
                <div className="p-4 rounded-xl border border-border bg-surface-2/40 space-y-3">
                  <span className="font-mono text-xs font-bold text-text uppercase tracking-wider block">
                    Link Failure &amp; Dynamic Convergence
                  </span>
                  <div className="space-y-1.5">
                    {initialLinks.map((link) => (
                      <div
                        key={link.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-surface-1 border border-border/60 text-xs font-mono"
                      >
                        <div>
                          <span className="font-bold text-text">
                            {link.fromRouter} ↔ {link.toRouter}
                          </span>
                          <span className="text-text-dim text-[11px] ml-2">
                            Cost: {link.cost} ({link.bandwidthMbps} Mbps)
                          </span>
                        </div>
                        <button
                          type="button"
                          data-testid={`toggle-link-${link.id}`}
                          onClick={() => handleToggleLinkFail(link.id)}
                          className={`px-2 py-0.5 rounded text-[10.5px] font-bold border transition-all ${
                            failedLinks[link.id]
                              ? 'bg-red-500/20 border-red-500 text-red-400'
                              : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                          }`}
                        >
                          {failedLinks[link.id] ? 'FAILED' : 'ACTIVE'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Routing Table & SPF Shortest Paths */}
              <div className="md:col-span-7 space-y-4">
                <div className="p-4 rounded-xl border border-border bg-surface-2/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-text uppercase tracking-wider">
                      OSPF Forwarding Table for Router {sourceRouter}
                    </span>
                    <span className="text-[11px] font-mono text-text-dim">
                      Metric = Cost = 100 / BW (Mbps)
                    </span>
                  </div>

                  {/* Routing Table */}
                  <div className="overflow-x-auto rounded-lg border border-border">
                    <table
                      data-testid="ospf-routing-table"
                      className="w-full text-left font-mono text-xs divide-y divide-border"
                    >
                      <thead className="bg-surface-3/80 text-text-muted text-[11px]">
                        <tr>
                          <th className="p-2.5">Destination</th>
                          <th className="p-2.5">Total Cost</th>
                          <th className="p-2.5">Next Hop</th>
                          <th className="p-2.5">Shortest Path</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60 bg-surface-1/40">
                        {routers.map((node) => {
                          const dist = dijkstraResult.distances[node.id];
                          const path = dijkstraResult.paths[node.id] || [];
                          const nextHop = path.length > 1 ? path[1] : 'Direct';
                          const isSelf = node.id === sourceRouter;

                          return (
                            <tr
                              key={node.id}
                              className={isSelf ? 'bg-func/10 font-bold' : 'hover:bg-surface-2/50'}
                            >
                              <td className="p-2.5 font-bold text-text">
                                {node.name} ({node.id})
                              </td>
                              <td className="p-2.5 text-func">
                                {dist === Infinity ? 'Unreachable' : dist}
                              </td>
                              <td className="p-2.5 text-text">
                                {isSelf ? 'Self' : dist === Infinity ? 'None' : nextHop}
                              </td>
                              <td className="p-2.5 text-text-dim">
                                {path.length > 0 ? (
                                  <span className="flex items-center gap-1 font-bold text-text">
                                    {path.map((hop, idx) => (
                                      <React.Fragment key={hop}>
                                        <span
                                          className={
                                            hop === sourceRouter
                                              ? 'text-sky-400'
                                              : hop === node.id
                                              ? 'text-emerald-400'
                                              : 'text-text'
                                          }
                                        >
                                          {hop}
                                        </span>
                                        {idx < path.length - 1 && (
                                          <ArrowRight className="w-3 h-3 text-text-muted inline" />
                                        )}
                                      </React.Fragment>
                                    ))}
                                  </span>
                                ) : (
                                  <span className="text-red-400 font-bold">No Path</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <p className="text-[11px] text-text-dim leading-relaxed font-sans pt-1">
                    RFC 2328: OSPF routers build identical Link-State Databases (LSDB) and run Dijkstra SPF to construct loop-free shortest-path trees toward all reachable destinations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
