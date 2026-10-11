'use client';

import React, { useState, useMemo } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Unlock,
  Radio,
  Server,
  Activity,
  ArrowRight,
  Layers,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  GitCommit,
  GitBranch,
  Network,
  ListOrdered,
  Eye,
  Sliders,
} from 'lucide-react';
import type {
  FirewallTaskContent,
  AclRule,
  ConntrackEntry,
  StpSwitchNode,
  StpLink,
} from '../../../types/networking-curriculum';

// ─────────────────────────────────────────────────────────────────────────────
// PURE PROTOCOL & ALGORITHM HELPERS
// ─────────────────────────────────────────────────────────────────────────────

export interface PacketProbe {
  protocol: 'tcp' | 'udp' | 'icmp';
  srcIp: string;
  srcPort: number;
  dstIp: string;
  dstPort: number;
  direction: 'inbound' | 'outbound';
  flags?: ('SYN' | 'ACK' | 'FIN' | 'RST')[];
}

export interface AclEvaluationResult {
  matchedLine: number;
  matchedRule: AclRule;
  action: 'permit' | 'deny';
  isImplicitDeny: boolean;
  evaluatedLines: number[];
  skippedLines: number[];
  explanation: string;
}

export function evaluateAclRule(
  rules: AclRule[],
  packet: PacketProbe,
): AclEvaluationResult {
  const evaluatedLines: number[] = [];
  const allLines = rules.map((r) => r.line);

  for (let i = 0; i < rules.length; i++) {
    const rule = rules[i];
    evaluatedLines.push(rule.line);

    // Protocol check
    const protoMatches =
      rule.protocol === 'ip' ||
      rule.protocol.toLowerCase() === packet.protocol.toLowerCase();

    if (!protoMatches) continue;

    // Destination IP check
    let dstMatches = true;
    if (rule.destination && rule.destination !== 'any') {
      const cleanDst = rule.destination.replace(/^host\s+/i, '').trim();
      dstMatches = cleanDst === packet.dstIp;
    }

    if (!dstMatches) continue;

    // Destination Port check
    let portMatches = true;
    if (rule.destPort !== undefined && rule.destPort !== 'any') {
      portMatches = Number(rule.destPort) === packet.dstPort;
    }

    if (!portMatches) continue;

    // Source IP check
    let srcMatches = true;
    if (rule.source && rule.source !== 'any') {
      if (rule.source.endsWith('/24')) {
        const prefix = rule.source.replace('/24', '').split('.').slice(0, 3).join('.');
        srcMatches = packet.srcIp.startsWith(prefix);
      } else {
        const cleanSrc = rule.source.replace(/^host\s+/i, '').trim();
        srcMatches = cleanSrc === packet.srcIp;
      }
    }

    if (!srcMatches) continue;

    // First match found!
    const skippedLines = allLines.filter((l) => !evaluatedLines.includes(l));
    return {
      matchedLine: rule.line,
      matchedRule: rule,
      action: rule.action,
      isImplicitDeny: false,
      evaluatedLines,
      skippedLines,
      explanation: `First-Match Found at Line ${rule.line}: Packet matches rule '${rule.action.toUpperCase()} ${rule.protocol} ${rule.source} ${rule.destination}${rule.destPort ? ' eq ' + rule.destPort : ''}'. Action applied immediately; subsequent ${skippedLines.length} rules were skipped.`,
    };
  }

  // Implicit Deny Any Any
  const implicitRule: AclRule = {
    line: 999,
    action: 'deny',
    protocol: 'ip',
    source: 'any',
    destination: 'any',
    comment: 'Default invisible implicit deny all',
  };

  return {
    matchedLine: 999,
    matchedRule: implicitRule,
    action: 'deny',
    isImplicitDeny: true,
    evaluatedLines,
    skippedLines: [],
    explanation:
      'Implicit Deny Executed: Packet failed to match any configured permit rules. Dropped by the invisible implicit deny ip any any at the end of the ACL.',
  };
}

export interface ConntrackEvaluationResult {
  action: 'PERMIT' | 'DROP';
  state: 'NEW' | 'ESTABLISHED' | 'RELATED' | 'INVALID';
  matchedEntryId?: string;
  table: ConntrackEntry[];
  explanation: string;
}

export function evaluateConntrackPacket(
  table: ConntrackEntry[],
  packet: PacketProbe,
  direction: 'inbound' | 'outbound',
  allowOutboundNew: boolean = true,
): ConntrackEvaluationResult {
  // Check if packet matches existing bidirectional session
  const matchingEntry = table.find((e) => {
    if (e.protocol !== packet.protocol) return false;
    if (direction === 'outbound') {
      return (
        e.srcIp === packet.srcIp &&
        e.srcPort === packet.srcPort &&
        e.dstIp === packet.dstIp &&
        e.dstPort === packet.dstPort
      );
    } else {
      // Inbound return packet: reversed IP and port
      return (
        e.srcIp === packet.dstIp &&
        e.srcPort === packet.dstPort &&
        e.dstIp === packet.srcIp &&
        e.dstPort === packet.srcPort
      );
    }
  });

  if (matchingEntry) {
    // Existing session! Upgrade to ESTABLISHED
    const updatedTable = table.map((e) =>
      e.id === matchingEntry.id ? { ...e, state: 'ESTABLISHED' as const, timeoutSeconds: 7200 } : e,
    );
    return {
      action: 'PERMIT',
      state: 'ESTABLISHED',
      matchedEntryId: matchingEntry.id,
      table: updatedTable,
      explanation: `Stateful Conntrack Match: Inbound response packet matches active session [${matchingEntry.srcIp}:${matchingEntry.srcPort} <-> ${matchingEntry.dstIp}:${matchingEntry.dstPort}]. Classified as ESTABLISHED and permitted without broad inbound port openings.`,
    };
  }

  // No existing entry in state table
  if (direction === 'outbound' && allowOutboundNew) {
    const newEntry: ConntrackEntry = {
      id: `ct-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      protocol: packet.protocol,
      srcIp: packet.srcIp,
      srcPort: packet.srcPort,
      dstIp: packet.dstIp,
      dstPort: packet.dstPort,
      state: 'NEW',
      timeoutSeconds: 120,
    };
    return {
      action: 'PERMIT',
      state: 'NEW',
      table: [...table, newEntry],
      explanation: `Outbound Session Initiated: Packet permitted under outbound policy. New connection tracking entry created in conntrack table (State: NEW, Timeout: 120s).`,
    };
  }

  // Unsolicited inbound packet
  return {
    action: 'DROP',
    state: 'NEW',
    table,
    explanation:
      'Unsolicited Inbound Packet Dropped: Inbound packet does not match any active connection in the state table. Classified as NEW (unsolicited) and dropped by default perimeter security policy.',
  };
}

export interface StpElectionResult {
  rootSwitchId: string;
  rootBridgeId: string;
  portRoles: Record<string, 'ROOT' | 'DESIGNATED' | 'BLOCKING'>;
  blockingLinkId: string;
  explanation: string;
}

export function calculateStpElection(
  switches: StpSwitchNode[],
  links: StpLink[],
): StpElectionResult {
  if (switches.length === 0) {
    return {
      rootSwitchId: '',
      rootBridgeId: '',
      portRoles: {},
      blockingLinkId: '',
      explanation: 'No switches in topology.',
    };
  }

  // Sort by priority (lowest wins), then MAC address (lowest wins)
  const sortedSwitches = [...switches].sort((a, b) => {
    if (a.priority !== b.priority) {
      return a.priority - b.priority;
    }
    return a.macAddress.localeCompare(b.macAddress);
  });

  const rootSwitch = sortedSwitches[0];
  const rootBridgeId = `${rootSwitch.priority}:${rootSwitch.macAddress}`;

  // Assign port roles for a 3-switch triangle
  // Root switch ports are all DESIGNATED
  // Non-root switches use direct link to Root as ROOT PORT
  // Redundant link between non-root switches has one DESIGNATED port and one BLOCKING port
  const portRoles: Record<string, 'ROOT' | 'DESIGNATED' | 'BLOCKING'> = {};
  let blockingLinkId = '';

  const nonRoots = sortedSwitches.slice(1);

  // Mark root switch ports
  links.forEach((link) => {
    if (link.fromSwitch === rootSwitch.id) {
      portRoles[`${link.fromSwitch}:${link.fromPort}`] = 'DESIGNATED';
      portRoles[`${link.toSwitch}:${link.toPort}`] = 'ROOT';
    } else if (link.toSwitch === rootSwitch.id) {
      portRoles[`${link.toSwitch}:${link.toPort}`] = 'DESIGNATED';
      portRoles[`${link.fromSwitch}:${link.fromPort}`] = 'ROOT';
    }
  });

  // Cross link between non-roots
  if (nonRoots.length >= 2) {
    const swB = nonRoots[0];
    const swC = nonRoots[1];
    const crossLink = links.find(
      (l) =>
        (l.fromSwitch === swB.id && l.toSwitch === swC.id) ||
        (l.fromSwitch === swC.id && l.toSwitch === swB.id),
    );

    if (crossLink) {
      blockingLinkId = crossLink.id;
      // swB has lower Bridge ID than swC -> swB port is DESIGNATED, swC port is BLOCKING
      if (crossLink.fromSwitch === swB.id) {
        portRoles[`${swB.id}:${crossLink.fromPort}`] = 'DESIGNATED';
        portRoles[`${swC.id}:${crossLink.toPort}`] = 'BLOCKING';
      } else {
        portRoles[`${swB.id}:${crossLink.toPort}`] = 'DESIGNATED';
        portRoles[`${swC.id}:${crossLink.fromPort}`] = 'BLOCKING';
      }
    }
  }

  return {
    rootSwitchId: rootSwitch.id,
    rootBridgeId,
    portRoles,
    blockingLinkId,
    explanation: `STP Root Bridge Elected: Switch '${rootSwitch.name}' won the election with lowest Bridge Priority ${rootSwitch.priority} (Bridge ID: ${rootBridgeId}). Redundant cross-link port placed into BLOCKING state to eliminate Layer 2 loops.`,
  };
}

export function simulateBroadcastStorm(stpEnabled: boolean, framesInjected: number = 1): {
  framesCirculating: number;
  cpuUtilizationPercent: number;
  networkSaturated: boolean;
  explanation: string;
} {
  if (stpEnabled) {
    return {
      framesCirculating: framesInjected,
      cpuUtilizationPercent: 4,
      networkSaturated: false,
      explanation:
        'Loop-Free Topology: STP has placed redundant links into Blocking state. Broadcast frames are forwarded along the spanning tree without looping. Switch CPU is healthy (4%).',
    };
  }

  // STP disabled: exponential replication across loop
  const duplicatedFrames = Math.min(1000000, framesInjected * Math.pow(2, 10));
  return {
    framesCirculating: duplicatedFrames,
    cpuUtilizationPercent: 100,
    networkSaturated: true,
    explanation:
      'CATASTROPHIC BROADCAST STORM: Ethernet frames lack a Time-to-Live (TTL) field! Broadcast frames endlessly multiply around the physical loop, saturating switch ASICs and freezing CPU at 100%.',
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT PROPS & DEFAULTS
// ─────────────────────────────────────────────────────────────────────────────

export interface FirewallAclRuleSimulatorProps {
  taskContent?: FirewallTaskContent;
  title?: string;
  description?: string;
}

const DEFAULT_ACL_RULES: AclRule[] = [
  { line: 10, action: 'deny', protocol: 'tcp', source: 'any', destination: 'host 10.0.0.5', destPort: 80, comment: 'Block HTTP to sensitive accounting host' },
  { line: 20, action: 'permit', protocol: 'tcp', source: 'any', destination: 'host 10.0.0.5', destPort: 80, comment: 'Conflicting rule (never reached due to first-match)' },
  { line: 30, action: 'permit', protocol: 'tcp', source: '10.0.0.0/24', destination: 'any', destPort: 443, comment: 'Allow outbound HTTPS for internal subnet' },
  { line: 40, action: 'permit', protocol: 'udp', source: 'any', destination: 'any', destPort: 53, comment: 'Allow DNS lookups' },
];

const DEFAULT_CONNTRACK_ENTRIES: ConntrackEntry[] = [
  { id: 'ct-1', protocol: 'tcp', srcIp: '10.0.0.105', srcPort: 51240, dstIp: '93.184.216.34', dstPort: 443, state: 'ESTABLISHED', timeoutSeconds: 7180 },
  { id: 'ct-2', protocol: 'tcp', srcIp: '10.0.0.110', srcPort: 49812, dstIp: '142.250.190.46', dstPort: 443, state: 'NEW', timeoutSeconds: 115 },
];

const DEFAULT_SWITCHES: StpSwitchNode[] = [
  { id: 'SW1', name: 'SW-1 (Core)', priority: 32768, macAddress: '00:11:22:33:44:01' },
  { id: 'SW2', name: 'SW-2 (Distribution)', priority: 4096, macAddress: '00:11:22:33:44:02' },
  { id: 'SW3', name: 'SW-3 (Access)', priority: 32768, macAddress: '00:11:22:33:44:03' },
];

const DEFAULT_LINKS: StpLink[] = [
  { id: 'link-1-2', fromSwitch: 'SW2', fromPort: 'Gi0/1', toSwitch: 'SW1', toPort: 'Gi0/1', cost: 4, status: 'forwarding' },
  { id: 'link-2-3', fromSwitch: 'SW2', fromPort: 'Gi0/2', toSwitch: 'SW3', toPort: 'Gi0/1', cost: 4, status: 'forwarding' },
  { id: 'link-1-3', fromSwitch: 'SW1', fromPort: 'Gi0/2', toSwitch: 'SW3', toPort: 'Gi0/2', cost: 4, status: 'blocking' },
];

export const FirewallAclRuleSimulator: React.FC<FirewallAclRuleSimulatorProps> = ({
  taskContent,
  title,
  description,
}) => {
  // Tab state
  const [activeTab, setActiveTab] = useState<'acl_pipeline' | 'stateful_conntrack' | 'stp_topology'>(
    taskContent?.defaultTab ?? 'acl_pipeline',
  );

  // Tab 1: ACL state
  const rules = useMemo(() => taskContent?.rules ?? DEFAULT_ACL_RULES, [taskContent?.rules]);
  const [selectedProbeId, setSelectedProbeId] = useState<'probe_accounting' | 'probe_dns' | 'probe_https'>('probe_accounting');

  const probePackets: Record<string, PacketProbe> = {
    probe_accounting: { protocol: 'tcp', srcIp: '10.0.0.50', srcPort: 49152, dstIp: '10.0.0.5', dstPort: 80, direction: 'inbound' },
    probe_dns: { protocol: 'udp', srcIp: '192.168.1.100', srcPort: 53000, dstIp: '8.8.8.8', dstPort: 53, direction: 'outbound' },
    probe_https: { protocol: 'tcp', srcIp: '10.0.0.22', srcPort: 52100, dstIp: '93.184.216.34', dstPort: 443, direction: 'outbound' },
  };

  const aclResult = useMemo(
    () => evaluateAclRule(rules, probePackets[selectedProbeId]),
    [rules, selectedProbeId],
  );

  // Tab 2: Stateful Conntrack state
  const [conntrackTable, setConntrackTable] = useState<ConntrackEntry[]>(
    taskContent?.conntrackEntries ?? DEFAULT_CONNTRACK_ENTRIES,
  );
  const [conntrackDirection, setConntrackDirection] = useState<'outbound' | 'inbound'>('outbound');
  const [isUnsolicitedAttacker, setIsUnsolicitedAttacker] = useState<boolean>(false);
  const [isStatelessMode, setIsStatelessMode] = useState<boolean>(false);

  const testConntrackPacket: PacketProbe = useMemo(() => {
    if (isUnsolicitedAttacker) {
      return { protocol: 'tcp', srcIp: '198.51.100.99', srcPort: 4444, dstIp: '10.0.0.50', dstPort: 22, direction: 'inbound', flags: ['SYN'] };
    }
    if (conntrackDirection === 'outbound') {
      return { protocol: 'tcp', srcIp: '10.0.0.50', srcPort: 51200, dstIp: '93.184.216.34', dstPort: 443, direction: 'outbound', flags: ['SYN'] };
    }
    return { protocol: 'tcp', srcIp: '93.184.216.34', srcPort: 443, dstIp: '10.0.0.50', dstPort: 51200, direction: 'inbound', flags: ['SYN', 'ACK'] };
  }, [conntrackDirection, isUnsolicitedAttacker]);

  const conntrackResult = useMemo(() => {
    if (isStatelessMode && conntrackDirection === 'inbound' && !isUnsolicitedAttacker) {
      return {
        action: 'DROP' as const,
        state: 'INVALID' as const,
        table: conntrackTable,
        explanation:
          'Stateless ACL Return Traffic Dilemma: The outbound SYN was permitted, but returning SYN-ACK packet hits the inbound implicit deny because stateless filters lack connection tracking!',
      };
    }
    return evaluateConntrackPacket(conntrackTable, testConntrackPacket, conntrackDirection, true);
  }, [conntrackTable, testConntrackPacket, conntrackDirection, isStatelessMode, isUnsolicitedAttacker]);

  // Tab 3: STP Topology state
  const [switches, setSwitches] = useState<StpSwitchNode[]>(
    taskContent?.switches ?? DEFAULT_SWITCHES,
  );
  const [links] = useState<StpLink[]>(taskContent?.links ?? DEFAULT_LINKS);
  const [stpEnabled, setStpEnabled] = useState<boolean>(taskContent?.stpEnabled ?? true);

  const stpResult = useMemo(() => calculateStpElection(switches, links), [switches, links]);
  const stormResult = useMemo(() => simulateBroadcastStorm(stpEnabled, 1), [stpEnabled]);

  const handleSwitchPriorityChange = (switchId: string, newPriority: number) => {
    setSwitches((prev) =>
      prev.map((sw) => (sw.id === switchId ? { ...sw, priority: newPriority } : sw)),
    );
  };

  return (
    <div
      className="w-full rounded-2xl border border-border bg-surface-1/90 shadow-xl backdrop-blur-md overflow-hidden text-text"
      data-testid="firewall-acl-simulator"
    >
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-border bg-surface-2/40 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-func/15 border border-func/30 flex items-center justify-center text-func shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-bold text-func uppercase tracking-wider">
                Module 15 Interactive Visualizer
              </span>
              <span className="text-text-muted text-xs">•</span>
              <span className="text-xs text-text-dim font-medium">Boundary Security & STP</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-text truncate">
              {taskContent?.title || title || 'Firewall, ACL & STP Defense Lab'}
            </h3>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface-3/60 border border-border text-xs font-medium">
          <button
            onClick={() => setActiveTab('acl_pipeline')}
            data-testid="tab-acl-pipeline"
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'acl_pipeline'
                ? 'bg-func text-white shadow-sm font-semibold'
                : 'text-text-muted hover:text-text'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span>Stateless ACLs</span>
          </button>
          <button
            onClick={() => setActiveTab('stateful_conntrack')}
            data-testid="tab-stateful-conntrack"
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'stateful_conntrack'
                ? 'bg-func text-white shadow-sm font-semibold'
                : 'text-text-muted hover:text-text'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Stateful Conntrack</span>
          </button>
          <button
            onClick={() => setActiveTab('stp_topology')}
            data-testid="tab-stp-topology"
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'stp_topology'
                ? 'bg-func text-white shadow-sm font-semibold'
                : 'text-text-muted hover:text-text'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>STP & Loops</span>
          </button>
        </div>
      </div>

      {(taskContent?.description || description) && (
        <div className="px-5 py-2.5 bg-surface-2/20 border-b border-border/50 text-xs text-text-dim">
          {taskContent?.description || description}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────
          TAB 1: STATELESS ACL PIPELINE & FIRST-MATCH EVALUATION
          ───────────────────────────────────────────────────────────────────── */}
      {activeTab === 'acl_pipeline' && (
        <div className="p-4 sm:p-6 space-y-6" data-testid="view-acl-pipeline">
          {/* Probe Selector */}
          <div className="p-4 rounded-xl bg-surface-2/40 border border-border space-y-3">
            <label className="text-xs font-mono font-bold text-text-dim uppercase tracking-wider block">
              Inject Test Packet Probe
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { id: 'probe_accounting', label: 'HTTP to 10.0.0.5:80', desc: 'Tests Line 10 vs Line 20 ordering' },
                { id: 'probe_dns', label: 'DNS to 8.8.8.8:53', desc: 'Tests explicit permit UDP' },
                { id: 'probe_https', label: 'Outbound HTTPS:443', desc: 'Tests subnet source match' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedProbeId(p.id as any)}
                  data-testid={`probe-btn-${p.id}`}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    selectedProbeId === p.id
                      ? 'border-func bg-func/20 text-white font-bold'
                      : 'border-border bg-surface-1/60 text-text-muted hover:text-text'
                  }`}
                >
                  <div className="text-xs font-mono font-bold">{p.label}</div>
                  <div className="text-[10px] text-text-dim font-sans mt-0.5 truncate">{p.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Ordered ACL Rules Table */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-text-dim flex items-center gap-2">
              <ListOrdered className="w-4 h-4 text-func" />
              Sequential ACL Rule Table (First-Match Halts Processing)
            </h4>

            <div className="space-y-2 font-mono text-xs">
              {rules.map((rule) => {
                const isEvaluated = aclResult.evaluatedLines.includes(rule.line);
                const isMatched = aclResult.matchedLine === rule.line;
                const isSkipped = aclResult.skippedLines.includes(rule.line);

                return (
                  <div
                    key={rule.line}
                    data-testid={`acl-rule-${rule.line}`}
                    className={`p-3 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all ${
                      isMatched
                        ? rule.action === 'permit'
                          ? 'border-emerald-500/70 bg-emerald-950/30'
                          : 'border-red-500/70 bg-red-950/30'
                        : isEvaluated
                        ? 'border-amber-500/40 bg-surface-2/60 text-text-muted'
                        : isSkipped
                        ? 'border-border/40 bg-surface-1/30 opacity-50'
                        : 'border-border bg-surface-2/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-surface-3 flex items-center justify-center font-bold text-text-dim">
                        {rule.line}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10.5px] font-bold uppercase ${
                              rule.action === 'permit'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-red-500/20 text-red-300'
                            }`}
                          >
                            {rule.action}
                          </span>
                          <span className="font-bold text-text">
                            {rule.protocol.toUpperCase()} {rule.source} {rule.destination}
                            {rule.destPort ? ` eq ${rule.destPort}` : ''}
                          </span>
                        </div>
                        {rule.comment && (
                          <div className="text-[11px] text-text-dim font-sans mt-0.5">
                            // {rule.comment}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isMatched ? (
                        <span
                          data-testid="rule-match-badge"
                          className={`px-2.5 py-1 rounded text-[10.5px] font-bold ${
                            rule.action === 'permit'
                              ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40'
                              : 'bg-red-500/25 text-red-300 border border-red-500/40'
                          }`}
                        >
                          [FIRST MATCH APPLIED]
                        </span>
                      ) : isSkipped ? (
                        <span className="text-[10px] text-text-muted font-sans italic">
                          (Skipped by First-Match)
                        </span>
                      ) : (
                        <span className="text-[10px] text-text-muted font-sans">
                          (Evaluated: No Match)
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Implicit Deny Any Any */}
              <div
                data-testid="acl-rule-implicit-deny"
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                  aclResult.isImplicitDeny
                    ? 'border-red-500/70 bg-red-950/30'
                    : 'border-border/50 bg-surface-2/20 text-text-muted'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-surface-3 flex items-center justify-center font-bold text-text-dim">
                    999
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-red-500/20 text-red-300 uppercase">
                        DENY
                      </span>
                      <span className="font-bold text-text">IP ANY ANY (Implicit Deny)</span>
                    </div>
                    <div className="text-[11px] text-text-dim font-sans mt-0.5">
                      Invisible default rule terminating all Access Control Lists
                    </div>
                  </div>
                </div>

                {aclResult.isImplicitDeny && (
                  <span
                    data-testid="rule-match-badge"
                    className="px-2.5 py-1 rounded text-[10.5px] font-bold bg-red-500/25 text-red-300 border border-red-500/40"
                  >
                    [IMPLICIT DENY EXECUTED]
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Verdict Box */}
          <div
            data-testid="acl-verdict-box"
            className={`p-4 rounded-xl border text-xs flex items-start gap-3 ${
              aclResult.action === 'permit'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                : 'bg-red-500/10 border-red-500/30 text-red-200'
            }`}
          >
            {aclResult.action === 'permit' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1 font-sans">
              <div className="font-bold font-mono">
                Packet Disposition:{' '}
                <span data-testid="acl-final-action">{aclResult.action.toUpperCase()}</span> (Line{' '}
                {aclResult.matchedLine})
              </div>
              <p className="leading-relaxed">{aclResult.explanation}</p>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────
          TAB 2: STATEFUL CONNECTION TRACKING (CONNTRACK)
          ───────────────────────────────────────────────────────────────────── */}
      {activeTab === 'stateful_conntrack' && (
        <div className="p-4 sm:p-6 space-y-6" data-testid="view-stateful-conntrack">
          {/* Controls Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-surface-2/40 border border-border">
            {/* Direction */}
            <div>
              <label className="text-xs font-mono font-bold text-text-dim uppercase tracking-wider block mb-1.5">
                Packet Flow Direction
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setConntrackDirection('outbound');
                    setIsUnsolicitedAttacker(false);
                  }}
                  data-testid="conntrack-dir-outbound"
                  className={`flex-1 py-2 px-3 rounded-lg border text-xs font-mono font-bold transition-all ${
                    conntrackDirection === 'outbound' && !isUnsolicitedAttacker
                      ? 'border-func bg-func/20 text-white'
                      : 'border-border bg-surface-1 text-text-muted hover:text-text'
                  }`}
                >
                  Outbound (Client $\to$ Web)
                </button>
                <button
                  onClick={() => {
                    setConntrackDirection('inbound');
                    setIsUnsolicitedAttacker(false);
                  }}
                  data-testid="conntrack-dir-inbound"
                  className={`flex-1 py-2 px-3 rounded-lg border text-xs font-mono font-bold transition-all ${
                    conntrackDirection === 'inbound' && !isUnsolicitedAttacker
                      ? 'border-func bg-func/20 text-white'
                      : 'border-border bg-surface-1 text-text-muted hover:text-text'
                  }`}
                >
                  Inbound (Web $\to$ Client)
                </button>
              </div>
            </div>

            {/* Unsolicited Attacker Toggle */}
            <div>
              <label className="text-xs font-mono font-bold text-text-dim uppercase tracking-wider block mb-1.5">
                Threat Simulation
              </label>
              <button
                onClick={() => setIsUnsolicitedAttacker((prev) => !prev)}
                data-testid="toggle-attacker-btn"
                className={`w-full py-2 px-3 rounded-lg border text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 ${
                  isUnsolicitedAttacker
                    ? 'border-red-500 bg-red-950/40 text-red-300'
                    : 'border-border bg-surface-1 text-text-muted hover:text-text'
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
                <span>{isUnsolicitedAttacker ? 'External Inbound Attack' : 'Legitimate Web Traffic'}</span>
              </button>
            </div>

            {/* Stateless vs Stateful Mode Toggle */}
            <div>
              <label className="text-xs font-mono font-bold text-text-dim uppercase tracking-wider block mb-1.5">
                Inspection Engine
              </label>
              <button
                onClick={() => setIsStatelessMode((prev) => !prev)}
                data-testid="toggle-stateless-mode-btn"
                className={`w-full py-2 px-3 rounded-lg border text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 ${
                  isStatelessMode
                    ? 'border-amber-500 bg-amber-950/40 text-amber-300'
                    : 'border-emerald-500 bg-emerald-950/40 text-emerald-300'
                }`}
              >
                <span>{isStatelessMode ? 'Stateless Filter (No Memory)' : 'Stateful Conntrack (Active)'}</span>
              </button>
            </div>
          </div>

          {/* Active Conntrack State Table */}
          <div className="space-y-3 font-mono text-xs">
            <h4 className="font-bold uppercase tracking-wider text-text-dim flex items-center gap-2">
              <Activity className="w-4 h-4 text-func" />
              Dynamic Connection State Table (`/proc/net/nf_conntrack`)
            </h4>

            <div className="overflow-x-auto rounded-xl border border-border bg-surface-2/40">
              <table className="w-full text-left" data-testid="conntrack-table">
                <thead className="bg-surface-3/60 text-text-dim border-b border-border text-[11px] uppercase">
                  <tr>
                    <th className="py-2.5 px-3 font-bold">Proto</th>
                    <th className="py-2.5 px-3 font-bold">Source Endpoint</th>
                    <th className="py-2.5 px-3 font-bold">Destination Endpoint</th>
                    <th className="py-2.5 px-3 font-bold">State</th>
                    <th className="py-2.5 px-3 font-bold">TTL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {conntrackTable.map((entry) => (
                    <tr
                      key={entry.id}
                      data-testid={`conntrack-entry-${entry.id}`}
                      className="hover:bg-surface-3/40 transition-colors"
                    >
                      <td className="py-2.5 px-3 font-bold text-func">{entry.protocol.toUpperCase()}</td>
                      <td className="py-2.5 px-3 text-text">
                        {entry.srcIp}:{entry.srcPort}
                      </td>
                      <td className="py-2.5 px-3 text-text">
                        {entry.dstIp}:{entry.dstPort}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            entry.state === 'ESTABLISHED'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : entry.state === 'NEW'
                              ? 'bg-blue-500/20 text-blue-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {entry.state}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-text-muted">{entry.timeoutSeconds}s</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Verdict Box */}
          <div
            data-testid="conntrack-verdict-box"
            className={`p-4 rounded-xl border text-xs flex items-start gap-3 ${
              conntrackResult.action === 'PERMIT'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                : 'bg-red-500/10 border-red-500/30 text-red-200'
            }`}
          >
            {conntrackResult.action === 'PERMIT' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1 font-sans">
              <div className="font-bold font-mono">
                Firewall Action:{' '}
                <span data-testid="conntrack-final-action">{conntrackResult.action}</span> (Classification:{' '}
                {conntrackResult.state})
              </div>
              <p className="leading-relaxed">{conntrackResult.explanation}</p>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────
          TAB 3: STP TOPOLOGY & BROADCAST STORM ELIMINATION
          ───────────────────────────────────────────────────────────────────── */}
      {activeTab === 'stp_topology' && (
        <div className="p-4 sm:p-6 space-y-6" data-testid="view-stp-topology">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-surface-2/40 border border-border">
            <div>
              <span className="text-xs font-mono font-bold text-text-dim uppercase tracking-wider block">
                Spanning Tree Protocol (IEEE 802.1D / 802.1w)
              </span>
              <span className="text-xs text-text">
                Lowest Bridge Priority wins election. Redundant ports enter Blocking state.
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setStpEnabled((prev) => !prev)}
                data-testid="toggle-stp-btn"
                className={`py-2 px-3 rounded-lg border text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                  stpEnabled
                    ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-300'
                    : 'border-red-500/50 bg-red-500/20 text-red-300'
                }`}
              >
                {stpEnabled ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                <span>STP: {stpEnabled ? 'ENABLED (Loop-Free)' : 'DISABLED (Simulate Storm)'}</span>
              </button>
            </div>
          </div>

          {/* Switch Nodes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono">
            {switches.map((sw) => {
              const isRoot = stpResult.rootSwitchId === sw.id;

              return (
                <div
                  key={sw.id}
                  data-testid={`switch-card-${sw.id}`}
                  className={`p-4 rounded-xl border transition-all ${
                    isRoot
                      ? 'border-emerald-500/60 bg-emerald-950/20 shadow-md'
                      : 'border-border bg-surface-2/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Server className="w-4 h-4 text-func" />
                      <span className="font-bold text-text">{sw.name}</span>
                    </div>
                    {isRoot && (
                      <span
                        data-testid="root-bridge-badge"
                        className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/25 text-emerald-300 border border-emerald-500/40"
                      >
                        ROOT BRIDGE
                      </span>
                    )}
                  </div>

                  <div className="text-xs space-y-1.5 pt-2 border-t border-border/40">
                    <div className="flex justify-between items-center">
                      <span className="text-text-muted">Priority:</span>
                      <select
                        value={sw.priority}
                        onChange={(e) => handleSwitchPriorityChange(sw.id, Number(e.target.value))}
                        data-testid={`priority-select-${sw.id}`}
                        className="py-1 px-2 rounded border border-border bg-surface-1 text-xs font-bold text-text"
                      >
                        <option value={4096}>4096 (Primary Root)</option>
                        <option value={8192}>8192 (Secondary)</option>
                        <option value={32768}>32768 (Default)</option>
                      </select>
                    </div>

                    <div className="flex justify-between text-[11px]">
                      <span className="text-text-muted">MAC Address:</span>
                      <span className="text-text font-bold">{sw.macAddress}</span>
                    </div>

                    <div className="flex justify-between text-[11px]">
                      <span className="text-text-muted">Bridge ID:</span>
                      <span className="text-func font-bold">
                        {sw.priority}:{sw.macAddress}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Redundant Links Status Table */}
          <div className="p-4 rounded-xl border border-border bg-surface-2/40 space-y-3 font-mono text-xs">
            <h4 className="font-bold uppercase tracking-wider text-text-dim flex items-center gap-2">
              <GitCommit className="w-4 h-4 text-func" />
              STP Port Roles & Redundant Link States
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {links.map((link) => {
                const isBlocked = stpEnabled && link.id === stpResult.blockingLinkId;

                return (
                  <div
                    key={link.id}
                    data-testid={`stp-link-${link.id}`}
                    className={`p-3 rounded-lg border ${
                      isBlocked
                        ? 'border-amber-500/50 bg-amber-950/20'
                        : 'border-border bg-surface-3/50'
                    }`}
                  >
                    <div className="flex justify-between font-bold text-text">
                      <span>
                        {link.fromSwitch} $\leftrightarrow$ {link.toSwitch}
                      </span>
                      <span
                        data-testid={`link-status-${link.id}`}
                        className={`text-[10px] px-1.5 py-0.5 rounded ${
                          isBlocked
                            ? 'bg-amber-500/25 text-amber-300 font-bold border border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 font-bold'
                        }`}
                      >
                        {isBlocked ? 'BLOCKING (BLK)' : 'FORWARDING (FWD)'}
                      </span>
                    </div>
                    <div className="text-[11px] text-text-dim mt-1 font-sans">
                      Path Cost: {link.cost} (1 Gbps)
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Broadcast Storm Diagnostic */}
          <div
            data-testid="storm-verdict-box"
            className={`p-4 rounded-xl border text-xs flex items-start gap-3 ${
              stormResult.networkSaturated
                ? 'bg-red-500/15 border-red-500/40 text-red-200'
                : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200'
            }`}
          >
            {stormResult.networkSaturated ? (
              <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            ) : (
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1 font-sans">
              <div className="font-bold font-mono">
                {stormResult.networkSaturated
                  ? 'CRITICAL FAILURE: 100% Broadcast Storm Saturated'
                  : 'STP Operational: Loop Eliminated'}
              </div>
              <p className="leading-relaxed">{stormResult.explanation}</p>
              <div className="text-xs font-mono font-bold pt-1">
                Circulating Frames: {stormResult.framesCirculating.toLocaleString()} | Switch CPU:{' '}
                {stormResult.cpuUtilizationPercent}%
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
