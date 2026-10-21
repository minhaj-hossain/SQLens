'use client';

import React, { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import type { Concept } from '../../../../types/curriculum';
import type { MentorScript } from '../../../../types/networking-curriculum';
import { useMentorScript } from './useMentorScript';
import { MentorDialoguePanel } from './MentorDialoguePanel';
import { SpotlightLayer } from './SpotlightLayer';
import { SwitchSimulationLab } from '../SwitchSimulationLab';
import { ArpSimulationLab } from '../ArpSimulationLab';
import { SubnetBitSlicer } from '../SubnetBitSlicer';
import { EthernetFrameInspector } from '../EthernetFrameInspector';
import { PacketInspector } from '../PacketInspector';
import { DhcpDoraSimulator } from '../DhcpDoraSimulator';
import { DnsResolutionTreeSimulator } from '../DnsResolutionTreeSimulator';
import { TcpSequenceLadderSimulator } from '../TcpSequenceLadderSimulator';
import { HttpTlsHandshakeSimulator } from '../HttpTlsHandshakeSimulator';
import { FirewallAclRuleSimulator } from '../FirewallAclRuleSimulator';
import { VlanTrunkDijkstraLab } from '../VlanTrunkDijkstraLab';
import type { ArpTaskContent, PacketInspectionTaskContent } from '../../../../types/curriculum';

import { PhysicalConnectionCanvas } from '../PhysicalConnectionCanvas';
import { VirtualTerminalSimulator } from '../VirtualTerminalSimulator';
import type { SimulationState, LearnerActionEvent } from '../../../../lib/network-engine/types';
import {
  reduceSimulationState,
  reduceActionLog,
  saveEngineSession,
  loadEngineSession,
} from '../../../../lib/network-engine/reducer';
import { createInitialAcmeOfficeState } from '../../../../lib/network-engine/fixtures/acme-office-m1';
import { isPingCommand, normalizeCommand } from '../../../../lib/network-engine/commands';

const DEFAULT_NET05_ARP: ArpTaskContent = {
  stage: 1,
  sourceHost: { name: 'Host A', ip: '192.168.1.10', mac: '00:00:5E:00:53:01', port: 1 },
  targetHost: { name: 'Host B', ip: '192.168.1.20', mac: '00:00:5E:00:53:02', port: 2 },
  allHosts: [
    { name: 'Host A', ip: '192.168.1.10', mac: '00:00:5E:00:53:01', port: 1 },
    { name: 'Host B', ip: '192.168.1.20', mac: '00:00:5E:00:53:02', port: 2 },
    { name: 'Host C', ip: '192.168.1.30', mac: '00:00:5E:00:53:03', port: 3 },
  ],
};

const DEFAULT_NET01_PACKET: PacketInspectionTaskContent = {
  title: 'Ethernet II Envelope & Dynamic MAC Matching',
  description:
    'Inspect the Layer 2 Ethernet outer packaging stamped with Router R1 discovered MAC address.',
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

const DEFAULT_NET06_PACKET: PacketInspectionTaskContent = {
  title: 'IPv6 Solicited-Node Multicast & Neighbor Discovery (NDP)',
  description: 'Inspect the Layer 2 Multicast MAC and ICMPv6 Neighbor Solicitation payload.',
  snapshots: [
    {
      hopLabel: 'Acme-PC-01 ➔ Local Segment Multicast',
      deviceType: 'Host',
      layer2: {
        srcMac: '00-1A-2B-3C-4D-10',
        dstMac: '33-33-FF-00-00-02',
        etherType: '0x86DD (IPv6)',
        fcs: 'CRC-32 (Valid)',
      },
      layer3: {
        version: 6,
        srcIp: 'fe80::10',
        dstIp: 'ff02::1:ff00:2',
        ttl: 255,
        protocol: 'ICMPv6 (58)',
        totalLength: 72,
      },
    },
  ],
};

const DEFAULT_NET07_PACKET: PacketInspectionTaskContent = {
  title: 'Multi-Hop Routing: Hop-by-Hop L2 Rewrite & Constant L3 IP',
  description: 'Compare Hop 1 (Inside LAN) vs Hop 2 (Outside WAN) to observe the Golden Rule in action.',
  snapshots: [
    {
      hopLabel: 'Hop 1: Host A ➔ Router R1 (Inside LAN)',
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
        dstIp: '8.8.8.8',
        ttl: 64,
        protocol: 'ICMP (1)',
        totalLength: 60,
      },
    },
    {
      hopLabel: 'Hop 2: Router R1 ➔ ISP Gateway (Outside WAN)',
      deviceType: 'Router',
      layer2: {
        srcMac: '70-B3-D5-11-22-33',
        dstMac: '00-50-56-EA-1A-02',
        etherType: '0x0800 (IPv4)',
        fcs: 'CRC-32 (Valid)',
      },
      layer3: {
        version: 4,
        srcIp: '192.168.1.10',
        dstIp: '8.8.8.8',
        ttl: 63,
        protocol: 'ICMP (1)',
        totalLength: 60,
      },
    },
  ],
};

const DEFAULT_NET08_PACKET: PacketInspectionTaskContent = {
  title: 'Network Address & Port Translation (PAT / NAT Overload)',
  description: 'Trace private client egress, public WAN translation, and return flow de-NATting.',
  snapshots: [
    {
      hopLabel: 'Phase 1: Inside LAN Egress (Before NAT)',
      deviceType: 'Host',
      layer2: {
        srcMac: '00-1A-2B-3C-4D-10',
        dstMac: '00-1A-2B-3C-4D-01',
        etherType: '0x0800 (IPv4)',
        fcs: 'CRC-32 (Valid)',
      },
      layer3: {
        version: 4,
        srcIp: '192.168.1.100',
        dstIp: '198.51.100.4',
        ttl: 64,
        protocol: 'TCP (6)',
        totalLength: 60,
      },
      layer4: {
        protocol: 'TCP',
        srcPort: 52410,
        dstPort: 80,
        flags: ['SYN'],
        windowSize: 64240,
        checksum: 'Valid',
      },
    },
    {
      hopLabel: 'Phase 2: Outside WAN Egress (PAT Translated: Port 40001)',
      deviceType: 'Router',
      layer2: {
        srcMac: '70-B3-D5-11-22-33',
        dstMac: '00-50-56-EA-1A-02',
        etherType: '0x0800 (IPv4)',
        fcs: 'CRC-32 (Valid)',
      },
      layer3: {
        version: 4,
        srcIp: '203.0.113.1',
        dstIp: '198.51.100.4',
        ttl: 63,
        protocol: 'TCP (6)',
        totalLength: 60,
      },
      layer4: {
        protocol: 'TCP',
        srcPort: 40001,
        dstPort: 80,
        flags: ['SYN'],
        windowSize: 64240,
        checksum: 'Valid',
      },
    },
    {
      hopLabel: 'Phase 3: Inbound Return Response (De-NATted to Host A)',
      deviceType: 'Host',
      layer2: {
        srcMac: '00-1A-2B-3C-4D-01',
        dstMac: '00-1A-2B-3C-4D-10',
        etherType: '0x0800 (IPv4)',
        fcs: 'CRC-32 (Valid)',
      },
      layer3: {
        version: 4,
        srcIp: '198.51.100.4',
        dstIp: '192.168.1.100',
        ttl: 58,
        protocol: 'TCP (6)',
        totalLength: 60,
      },
      layer4: {
        protocol: 'TCP',
        srcPort: 80,
        dstPort: 52410,
        flags: ['SYN', 'ACK'],
        windowSize: 65535,
        checksum: 'Valid',
      },
    },
  ],
};

const DEFAULT_NET11_PACKET: PacketInspectionTaskContent = {
  title: 'Transport Layer Multiplexing: UDP vs TCP Handshake',
  description: 'Inspect L4 port numbers, 5-tuple bindings, and protocol headers.',
  snapshots: [
    {
      hopLabel: 'TCP SYN Handshake Packet (Port 443)',
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
        dstIp: '198.51.100.4',
        ttl: 64,
        protocol: 'TCP (6)',
        totalLength: 60,
      },
      layer4: {
        protocol: 'TCP',
        srcPort: 52144,
        dstPort: 443,
        flags: ['SYN'],
        windowSize: 64240,
        checksum: 'Valid',
      },
    },
    {
      hopLabel: 'UDP Lightweight Datagram (Port 53 DNS)',
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
        dstIp: '8.8.8.8',
        ttl: 64,
        protocol: 'UDP (17)',
        totalLength: 48,
      },
      layer4: {
        protocol: 'UDP',
        srcPort: 53120,
        dstPort: 53,
        flags: [],
        windowSize: 0,
        checksum: 'Valid',
      },
    },
  ],
};

interface MentorLessonStageProps {
  moduleId: string;
  concept: Concept;
  script: MentorScript;
  onComplete?: () => void;
}

export const MentorLessonStage: React.FC<MentorLessonStageProps> = ({
  moduleId,
  concept,
  script,
  onComplete,
}) => {
  const {
    state,
    currentBeat,
    handleNext,
    handleActionDone,
    handleSelectPrediction,
    handleSelectWhy,
    handleSubmitFill,
    handleReplay,
  } = useMentorScript(script);

  const [simState, setSimState] = useState<SimulationState>(() => {
    if (typeof window !== 'undefined' && moduleId === 'net-01') {
      const saved = loadEngineSession();
      if (saved && saved.actionLog.length > 0) {
        return reduceActionLog(createInitialAcmeOfficeState(), saved.actionLog);
      }
    }
    return createInitialAcmeOfficeState();
  });

  const [activeSpotlightOverride, setActiveSpotlightOverride] = useState<string | null>(null);
  const [showTextFallback, setShowTextFallback] = useState(false);
  const [slowMotionPhase, setSlowMotionPhase] = useState<number>(0);

  // Active spotlight is either overridden by clicking a Term chip, or the beat's defined spotlight
  const effectiveSpotlight = activeSpotlightOverride ?? state.currentSpotlight;
  const activeTermLabel = Object.values(script.terms).find((t) => t.part === effectiveSpotlight)?.label;

  const handleNextWithCompletion = () => {
    if (state.beatIndex >= script.beats.length - 1) {
      onComplete?.();
    }
    handleNext();
  };

  const dispatchSimulationAction = (action: LearnerActionEvent) => {
    setSimState((prev) => {
      const next = reduceSimulationState(prev, action);
      if (moduleId === 'net-01') {
        saveEngineSession({
          engineSchemaVersion: 1,
          scriptVersion: '1.0.0',
          actionLog: next.actionLog,
        });
      }
      return next;
    });
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
      if (state.beatIndex === 0) {
        handleActionDone({ type: 'ping' });
      } else if (state.beatIndex === 5) {
        handleActionDone({ type: 'ping-slow' });
        setSlowMotionPhase(3);
      }
    } else if (norm === 'arp -a' || norm === 'arp') {
      if (state.beatIndex === 4 || state.beatIndex === 6) {
        handleActionDone({ type: 'arp' });
      }
    }
  };

  const handleToggleCable = () => {
    const isSeated = simState.links['cable-hostA-sw1']?.endpointA.isSeated;
    const action: LearnerActionEvent = {
      id: `act-${simState.logicalClock + 1}`,
      logicalTick: simState.logicalClock + 1,
      type: isSeated ? 'UNSEAT_CABLE' : 'SEAT_CABLE',
      linkId: 'cable-hostA-sw1',
    };
    dispatchSimulationAction(action);

    if (!isSeated && state.beatIndex === 2) {
      handleActionDone({ type: 'seat-cable' });
    }
  };

  /**
   * Render the corresponding interactive simulator stage.
   * Controlled mode: passes visibleParts, spotlight, and controlledStepIndex.
   */
  const renderSimulatorStage = () => {
    if (moduleId === 'net-03') {
      return (
        <SwitchSimulationLab
          visibleParts={state.revealedParts}
          spotlight={effectiveSpotlight ?? undefined}
          controlledStepIndex={currentBeat?.stage?.stepIndex}
          onAction={handleActionDone}
        />
      );
    }

    if (moduleId === 'net-05') {
      const taskArp = concept.tasks?.find((t) => t.arp)?.arp || DEFAULT_NET05_ARP;
      return (
        <div data-testid="arp-simulation-stage" className="w-full">
          <ArpSimulationLab
            taskArp={taskArp}
            title={concept.title}
            description="Interactive ARP Resolution & FIFO Hold Queue"
          />
        </div>
      );
    }

    if (moduleId === 'net-04') {
      return (
        <div data-testid="subnet-slicer-stage" className="w-full">
          <SubnetBitSlicer
            initialIp="192.168.10.130"
            initialPrefix={26}
            isInteractive={true}
            title="Interactive Subnet Bit Slicer & Active Octet"
          />
        </div>
      );
    }

    if (moduleId === 'net-02') {
      return (
        <div data-testid="ethernet-frame-stage" className="w-full">
          <EthernetFrameInspector
            title="Ethernet II Frame Inspector & 32-bit CRC-32"
            description="Inspect MTU boundaries, payload slicing, and CRC error verification."
          />
        </div>
      );
    }

    if (moduleId === 'net-01') {
      const isCableSeated = simState.links['cable-hostA-sw1']?.status === 'carrier-active';
      const showPhysicalCanvas = state.beatIndex >= 2 && state.beatIndex < 7;
      const showPacketInspector = state.beatIndex >= 7;

      let suggestedCommands = ['ping 192.168.1.1'];
      if (state.beatIndex === 1 || state.beatIndex === 3) {
        suggestedCommands = ['ipconfig', 'ipconfig /all'];
      } else if (state.beatIndex === 4 || state.beatIndex === 6) {
        suggestedCommands = ['arp -a'];
      } else if (state.beatIndex === 5) {
        suggestedCommands = ['ping 192.168.1.1'];
      }

      const taskContent =
        concept.tasks?.find((t) => t.packetInspection)?.packetInspection || DEFAULT_NET01_PACKET;

      return (
        <div data-testid="packet-inspector-stage" className="w-full space-y-4">
          {/* Progressive Stage 1-7: Physical Canvas + Terminal */}
          {!showPacketInspector && (
            <div className="space-y-3.5">
              {showPhysicalCanvas && (
                <PhysicalConnectionCanvas
                  isCableSeated={isCableSeated}
                  onToggleCable={handleToggleCable}
                  className="animate-in fade-in duration-300"
                />
              )}

              {/* Slow-Motion Stepper Banner in Beat 6 */}
              {state.beatIndex === 5 && (
                <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/40 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-cyan-300">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
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
                      Step 1: ARP Broadcast
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded border ${
                        slowMotionPhase >= 2
                          ? 'bg-cyan-500/30 border-cyan-400 text-cyan-100 font-bold'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                      }`}
                    >
                      Step 2: ARP Reply
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded border ${
                        slowMotionPhase >= 3
                          ? 'bg-emerald-500/30 border-emerald-400 text-emerald-100 font-bold'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                      }`}
                    >
                      Step 3: ICMP Echo
                    </span>
                  </div>
                </div>
              )}

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
          )}

          {/* Beat 8: Ethernet Envelope & MAC Matching Inspector */}
          {showPacketInspector && (
            <div className="animate-in fade-in duration-300">
              <PacketInspector
                taskContent={taskContent}
                title="Ethernet II Envelope & Dynamic MAC Matching"
                description="Inspect the Layer 2 outer Ethernet packaging stamped with Router R1's MAC address learned via ARP."
                visibleLayers={['L2', 'L3']}
                spotlightMac="00-1A-2B-3C-4D-01"
              />
            </div>
          )}
        </div>
      );
    }

    if (moduleId === 'net-06') {
      const taskContent =
        concept.tasks?.find((t) => t.packetInspection)?.packetInspection || DEFAULT_NET06_PACKET;
      return (
        <div data-testid="packet-inspector-stage-net06" className="w-full">
          <PacketInspector
            taskContent={taskContent}
            title={taskContent.title || 'IPv6 Solicited-Node Multicast & Neighbor Discovery (NDP)'}
            description={taskContent.description}
            visibleLayers={['L2', 'L3']}
          />
        </div>
      );
    }

    if (moduleId === 'net-07') {
      const taskContent =
        concept.tasks?.find((t) => t.packetInspection)?.packetInspection || DEFAULT_NET07_PACKET;
      return (
        <div data-testid="packet-inspector-stage-net07" className="w-full">
          <PacketInspector
            taskContent={taskContent}
            title={taskContent.title || 'Multi-Hop Routing: Hop-by-Hop L2 Rewrite'}
            description={taskContent.description}
            visibleLayers={['L2', 'L3']}
          />
        </div>
      );
    }

    if (moduleId === 'net-08') {
      const taskContent =
        concept.tasks?.find((t) => t.packetInspection)?.packetInspection || DEFAULT_NET08_PACKET;
      return (
        <div data-testid="packet-inspector-stage-net08" className="w-full">
          <PacketInspector
            taskContent={taskContent}
            title={taskContent.title || 'Network Address & Port Translation (PAT / NAT Overload)'}
            description={taskContent.description}
            visibleLayers={['L2', 'L3', 'L4']}
          />
        </div>
      );
    }

    if (moduleId === 'net-09') {
      const taskContent = concept.tasks?.find((t) => t.dhcp)?.dhcp;
      return (
        <div data-testid="dhcp-dora-stage" className="w-full">
          <DhcpDoraSimulator
            taskContent={taskContent}
            title={concept.title}
            description="Interactive 4-Step DORA Handshake & Lease Timers"
          />
        </div>
      );
    }

    if (moduleId === 'net-10') {
      const taskContent = concept.tasks?.find((t) => t.dns)?.dns;
      return (
        <div data-testid="dns-tree-stage" className="w-full">
          <DnsResolutionTreeSimulator
            taskContent={taskContent}
            title={concept.title}
            description="Hierarchical Inverted Tree & Iterative Resolution"
          />
        </div>
      );
    }

    if (moduleId === 'net-11') {
      const taskContent =
        concept.tasks?.find((t) => t.packetInspection)?.packetInspection || DEFAULT_NET11_PACKET;
      return (
        <div data-testid="packet-inspector-stage-net11" className="w-full">
          <PacketInspector
            taskContent={taskContent}
            title={taskContent.title || 'Transport Multiplexing & 5-Tuple Sockets'}
            description={taskContent.description}
            visibleLayers={['L2', 'L3', 'L4']}
          />
        </div>
      );
    }

    if (moduleId === 'net-12') {
      const taskContent = concept.tasks?.find((t) => t.tcpLadder)?.tcpLadder;
      return (
        <div data-testid="tcp-ladder-stage" className="w-full">
          <TcpSequenceLadderSimulator
            taskContent={taskContent}
            title={concept.title}
            description="TCP Byte-Stream Accounting & Fast Retransmit"
          />
        </div>
      );
    }

    if (moduleId === 'net-13') {
      const taskContent = concept.tasks?.find((t) => t.httpTls)?.httpTls;
      return (
        <div data-testid="http-tls-stage" className="w-full">
          <HttpTlsHandshakeSimulator
            taskContent={taskContent}
            title={concept.title}
            description="TLS 1.3 1-RTT Handshake & Stream Multiplexing"
          />
        </div>
      );
    }

    if (moduleId === 'net-14') {
      const taskContent = concept.tasks?.find((t) => t.terminal)?.terminal;
      return (
        <div data-testid="virtual-terminal-stage" className="w-full">
          <VirtualTerminalSimulator
            scenario={taskContent}
            title={concept.title}
            description="Diagnostic Terminal & 5-Layer Outage Triage Lab"
            userPrompt="C:\Users\admin>"
            hostname="IT-ADMIN-PC"
          />
        </div>
      );
    }

    if (moduleId === 'net-15') {
      const taskContent = concept.tasks?.find((t) => t.firewall)?.firewall || { defaultTab: 'stp_topology' as const };
      return (
        <div data-testid="firewall-stp-stage" className="w-full">
          <FirewallAclRuleSimulator
            taskContent={taskContent}
            title={concept.title}
            description="Spanning Tree BPDU Root Election & Boundary Firewalls"
          />
        </div>
      );
    }

    if (moduleId === 'net-16') {
      const taskContent = concept.tasks?.find((t) => t.vlanDijkstra)?.vlanDijkstra || { defaultTab: 'vlan_trunking' as const };
      return (
        <div data-testid="vlan-dijkstra-stage" className="w-full">
          <VlanTrunkDijkstraLab
            taskContent={taskContent}
            title={concept.title}
            description="802.1Q VLAN Trunking & Dijkstra Shortest Path Lab"
          />
        </div>
      );
    }

    // Fallback placeholder stage
    return (
      <div className="w-full h-full min-h-[360px] flex flex-col items-center justify-center p-6 bg-surface-2/60 border border-border rounded-2xl text-center">
        <span className="font-mono text-xs font-bold text-func uppercase tracking-wider mb-2">
          Interactive Stage • {moduleId.toUpperCase()}
        </span>
        <p className="text-xs text-text-dim max-w-sm font-sans leading-relaxed">
          The interactive stage for {concept.title} is currently active in Mentor Mode.
        </p>
      </div>
    );
  };

  return (
    <div
      className="w-full max-w-[1440px] mx-auto space-y-4 px-0 sm:px-4 min-w-0"
      data-testid="mentor-lesson-stage"
    >
      {/* 2-Pane Split Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 min-w-0 items-start">
        {/* LEFT / BOTTOM (Mobile): Mentor Dialogue Panel (5 cols on desktop) */}
        <div className="order-2 lg:order-1 lg:col-span-5 h-[480px] lg:h-[620px] flex flex-col min-w-0">
          <MentorDialoguePanel
            script={script}
            currentBeat={currentBeat}
            state={state}
            onNext={handleNextWithCompletion}
            onSelectPrediction={handleSelectPrediction}
            onSelectWhy={handleSelectWhy}
            onSubmitFill={handleSubmitFill}
            onReplay={handleReplay}
            onHoverTerm={(partId) => setActiveSpotlightOverride(partId)}
            onClickTerm={(partId) =>
              setActiveSpotlightOverride((prev) => (prev === partId ? null : partId))
            }
            activeSpotlight={effectiveSpotlight}
          />
        </div>

        {/* RIGHT / TOP (Mobile Sticky): Interactive Simulator Stage (7 cols on desktop) */}
        <div className="order-1 lg:order-2 lg:col-span-7 sticky top-2 z-10 lg:static min-w-0">
          <div className="bg-surface border border-border rounded-2xl p-3 sm:p-4 shadow-md overflow-hidden min-h-[380px] lg:min-h-[620px] flex flex-col justify-center">
            <SpotlightLayer
              spotlight={effectiveSpotlight}
              activeLabel={activeTermLabel}
              onClearSpotlight={() => setActiveSpotlightOverride(null)}
            >
              {renderSimulatorStage()}
            </SpotlightLayer>
          </div>
        </div>
      </div>

      {/* Accessible "Read as Text" Fallback Disclosure */}
      <div className="rounded-xl border border-border bg-surface-2/40 overflow-hidden text-xs">
        <button
          type="button"
          onClick={() => setShowTextFallback((prev) => !prev)}
          className="w-full flex items-center justify-between px-4 py-2.5 text-text-dim hover:text-text hover:bg-surface-3/50 transition-colors focus:outline-none"
        >
          <span className="flex items-center gap-2 font-mono font-medium">
            <BookOpen className="w-3.5 h-3.5 text-func" />
            <span>Read lesson summary as standard text</span>
          </span>
          {showTextFallback ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {showTextFallback && (
          <div className="p-4 border-t border-border/60 bg-surface space-y-3 font-sans text-text-dim leading-relaxed animate-in fade-in duration-200">
            <p className="font-semibold text-text">{concept.theory.summary}</p>
            {concept.theory.explanation.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
            <div className="p-3 rounded-lg bg-func/10 border border-func/30 text-func font-medium font-mono text-[11px]">
              Key Takeaway: {concept.theory.keyTakeaway}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
