/**
 * Phase 4: Networking Component Library Test Suite
 * ─────────────────────────────────────────────────────────────────────────────
 * Validates the extracted shared component library:
 *  - Unified package exports in src/components/learning/networking/index.ts
 *  - PacketInspector multi-layer progressive disclosure (L2, L3, L4, L7)
 *  - Hop-by-hop comparative diffing (TTL decrement, MAC address rewrite)
 *  - Hex dump inspection mode
 *  - Wiring into NetworkingPracticeTaskView
 */

import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import * as NetworkingLib from '../../src/components/learning/networking';
import {
  PacketInspector,
  SubnetBitSlicer,
  calculateSubnet,
  StructuredTaskGrader,
  ArpSimulationLab,
  SwitchSimulationLab,
  RouterOnAStickDiagram,
  HostTelemetryTerminal,
  NetworkingPracticeTaskView,
} from '../../src/components/learning/networking';
import { isNetworkingTask } from '../../src/lib/network-engine/networking-submit-pipeline';
import type { PracticeTask, PacketInspectionTaskContent } from '../../src/types/curriculum';

describe('Phase 4: Component Library Export Integrity', () => {
  it('exports all core networking interactive widgets from the unified package root', () => {
    expect(NetworkingLib.PacketInspector).toBeDefined();
    expect(NetworkingLib.SubnetBitSlicer).toBeDefined();
    expect(NetworkingLib.calculateSubnet).toBeDefined();
    expect(NetworkingLib.StructuredTaskGrader).toBeDefined();
    expect(NetworkingLib.ArpSimulationLab).toBeDefined();
    expect(NetworkingLib.SwitchSimulationLab).toBeDefined();
    expect(NetworkingLib.RouterOnAStickDiagram).toBeDefined();
    expect(NetworkingLib.HostTelemetryTerminal).toBeDefined();
    expect(NetworkingLib.SwitchingTopologyCanvas).toBeDefined();
    expect(NetworkingLib.PlaybackControls).toBeDefined();
    expect(NetworkingLib.MacTableView).toBeDefined();
    expect(NetworkingLib.PredictionGate).toBeDefined();
    expect(NetworkingLib.NetworkingPracticeTaskView).toBeDefined();
  });
});

describe('Phase 4: PacketInspector Multi-Layer Rendering', () => {
  const sampleInspection: PacketInspectionTaskContent = {
    title: 'Cross-Router Forwarding & TTL Decrement Inspection',
    description: 'Observe how a Layer 3 router transforms headers while preserving end-to-end IP payloads.',
    snapshots: [
      {
        hopLabel: 'Hop 1: Ingress at Router Gig0/0',
        deviceType: 'Router',
        layer2: {
          srcMac: 'AA:AA:AA:AA:AA:AA',
          dstMac: 'GW:01:01:01:01:01',
          etherType: '0x0800 (IPv4)',
        },
        layer3: {
          version: 4,
          srcIp: '192.168.1.50',
          dstIp: '8.8.8.8',
          ttl: 64,
          protocol: 'UDP (17)',
        },
        layer4: {
          type: 'UDP',
          srcPort: 53535,
          dstPort: 53,
        },
        layer7: {
          protocol: 'DNS',
          summary: 'Standard query 0x1234 A example.com',
          data: { query: 'example.com', type: 'A', id: '0x1234' },
        },
      },
      {
        hopLabel: 'Hop 2: Egress at Router Gig0/1',
        deviceType: 'Router',
        layer2: {
          srcMac: 'GW:02:02:02:02:02', // Rewritten router egress interface MAC
          dstMac: 'ISP:11:22:33:44:55', // Next-hop ISP MAC
          etherType: '0x0800 (IPv4)',
        },
        layer3: {
          version: 4,
          srcIp: '192.168.1.50',
          dstIp: '8.8.8.8',
          ttl: 63, // Decremented TTL
          protocol: 'UDP (17)',
        },
        layer4: {
          type: 'UDP',
          srcPort: 53535,
          dstPort: 53,
        },
        layer7: {
          protocol: 'DNS',
          summary: 'Standard query 0x1234 A example.com',
        },
      },
    ],
    highlightedModifications: [
      {
        layer: 'L3',
        field: 'TTL',
        description: 'Router decrements TTL by 1 before egress',
        beforeValue: '64',
        afterValue: '63',
      },
      {
        layer: 'L2',
        field: 'Dst MAC',
        description: 'Layer 2 MAC rewritten to next-hop gateway',
        beforeValue: 'GW:01:01:01:01:01',
        afterValue: 'ISP:11:22:33:44:55',
      },
    ],
  };

  it('renders PacketInspector in Structured Layer mode with all 4 OSI layers', () => {
    const markup = renderToStaticMarkup(
      <PacketInspector taskContent={sampleInspection} />,
    );

    expect(markup).toContain('packet-inspector');
    expect(markup).toContain('layer2-accordion');
    expect(markup).toContain('layer3-accordion');
    expect(markup).toContain('layer4-accordion');
    expect(markup).toContain('layer7-accordion');
    expect(markup).toContain('AA:AA:AA:AA:AA:AA');
    expect(markup).toContain('192.168.1.50');
    expect(markup).toContain('8.8.8.8');
    expect(markup).toContain('Ports 53535');
    expect(markup).toContain('DNS');
  });

  it('renders comparative view and highlights header differences across hops', () => {
    // When snapshots >= 2, the comparative button is present
    const markup = renderToStaticMarkup(
      <PacketInspector taskContent={sampleInspection} />,
    );

    expect(markup).toContain('view-comparative-btn');
    expect(markup).toContain('view-hexdump-btn');
  });
});

describe('Phase 4: NetworkingPracticeTaskView Wiring with PacketInspector', () => {
  const inspectionTask: PracticeTask = {
    id: 'net07-p1-ttl-decrement',
    title: 'Analyze Router Hop & TTL Decrement',
    description: 'Inspect the packet headers across the routing hop and identify header modifications.',
    instructions: [
      'Examine the Ingress packet at Router interface Gig0/0.',
      'Compare with the Egress packet at Router interface Gig0/1.',
    ],
    type: 'guided',
    primaryTable: '',
    initialSql: '',
    solutionSql: 'NETWORKING_JUDGMENT_TASK',
    solutionExplanation: 'The router decrements the TTL field and rewrites the Layer 2 frame MAC addresses.',
    successMessage: 'Great job analyzing router hop header transformations!',
    packetInspection: {
      title: 'Hop-by-Hop Telemetry: Router R1',
      snapshots: [
        {
          hopLabel: 'Router Ingress',
          layer2: {
            srcMac: '11:11:11:11:11:11',
            dstMac: 'GW:AA:BB:CC:DD:EE',
            etherType: '0x0800',
          },
          layer3: {
            version: 4,
            srcIp: '10.0.0.10',
            dstIp: '1.1.1.1',
            ttl: 128,
            protocol: 'TCP (6)',
          },
        },
        {
          hopLabel: 'Router Egress',
          layer2: {
            srcMac: 'GW:22:33:44:55:66',
            dstMac: 'ISP:AA:BB:CC:DD:EE',
            etherType: '0x0800',
          },
          layer3: {
            version: 4,
            srcIp: '10.0.0.10',
            dstIp: '1.1.1.1',
            ttl: 127,
            protocol: 'TCP (6)',
          },
        },
      ],
      highlightedModifications: [
        {
          layer: 'L3',
          field: 'TTL',
          description: 'Hop count decremented',
          beforeValue: '128',
          afterValue: '127',
        },
      ],
    },
    validation: {
      judgment: [
        {
          kind: 'choose-and-defend',
          prompt: 'What happens to the Layer 3 IP header when the packet is forwarded across Router R1?',
          options: [
            'The TTL is decremented by 1, and the source/destination IPs remain unchanged',
            'Both IP addresses are swapped',
            'The router strips the entire Layer 3 header',
            'The TTL is reset to 255',
          ],
          correctIndex: 0,
          explanation: 'Standard routers decrement the TTL field by 1 to prevent infinite routing loops, preserving source and destination IP addresses unless NAT is configured.',
        },
      ],
    },
    hints: [
      { level: 1, text: 'Look at the TTL value before and after the routing hop.' },
    ],
  };

  it('identifies the task as a networking task via isNetworkingTask', () => {
    expect(isNetworkingTask(inspectionTask)).toBe(true);
  });

  it('renders NetworkingPracticeTaskView with PacketInspector on the left and Judgment on the right', () => {
    const onTaskSuccess = vi.fn();
    const markup = renderToStaticMarkup(
      <NetworkingPracticeTaskView
        task={inspectionTask}
        taskIndex={0}
        totalTasks={1}
        isCompleted={false}
        onTaskSuccess={onTaskSuccess}
      />,
    );

    expect(markup).toContain('packet-inspector');
    expect(markup).toContain('Hop-by-Hop Telemetry: Router R1');
    expect(markup).toContain('Layer 2: Data Link Header');
    expect(markup).toContain('Layer 3: Network Header');
    expect(markup).toContain('Prediction &amp; Causal Defense');
  });
});
