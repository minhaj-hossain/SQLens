/**
 * Phase 5 — Curriculum-Wide Interactive Rollout Tests.
 * ─────────────────────────────────────────────────────────────────────────────
 * Verifies:
 *  1. VirtualTerminalSimulator component unit tests (rendering, built-in commands,
 *     custom responses, prompt configuration).
 *  2. Module net-14 (Diagnostics & Troubleshooting) terminal scenario configuration.
 *  3. Interactive PacketInspector rollout across curriculum modules:
 *     - net-01: Encapsulation trace (L2/L3/L4/L7 progressive disclosure).
 *     - net-07: Remote Gateway ARP & Routing (Cross-hop MAC rewrites + TTL decrement).
 *     - net-08: NAT / PAT Translation (Inside Local ➔ Inside Global mapping).
 *     - net-11: Transport Layer 5-tuple concurrent socket multiplexing.
 *  4. NetworkingPracticeTaskView layout and rendering integration across all enhanced modules.
 *  5. Pipeline classification: isNetworkingTask identifies all terminal and packetInspection tasks.
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  VirtualTerminalSimulator,
  PacketInspector,
} from '../../src/components/learning/networking';
import { NetworkingPracticeTaskView } from '../../src/components/learning/networking/NetworkingPracticeTaskView';
import { NET_01_MODULE } from '../../src/content/networking/modules/net-01';
import { NET_07_MODULE } from '../../src/content/networking/modules/net-07';
import { NET_08_MODULE } from '../../src/content/networking/modules/net-08';
import { NET_11_MODULE } from '../../src/content/networking/modules/net-11';
import { NET_14_MODULE } from '../../src/content/networking/modules/net-14';
import { isNetworkingTask } from '../../src/lib/network-engine/networking-submit-pipeline';
import type { PracticeTask } from '../../src/types/curriculum';

// ─────────────────────────────────────────────────────────────────────────────
// Test Suite 1: VirtualTerminalSimulator Component
// ─────────────────────────────────────────────────────────────────────────────

describe('Phase 5 — VirtualTerminalSimulator Component', () => {
  it('renders terminal window chrome, prompt, initial lines, and quick pills', () => {
    const html = renderToStaticMarkup(
      <VirtualTerminalSimulator
        hostname="TEST-WORKSTATION"
        userPrompt="C:\Users\test>"
        initialLines={['System Ready.', 'Diagnostics console initialized.']}
        availableCommands={['ipconfig', 'ping 8.8.8.8', 'tracert 1.1.1.1']}
      />
    );

    expect(html).toContain('TEST-WORKSTATION');
    expect(html).toContain('Interactive Command-Line Diagnostics Lab');
    expect(html).toContain('System Ready.');
    expect(html).toContain('Diagnostics console initialized.');
    expect(html).toContain('C:\\Users\\test&gt;');
    expect(html).toContain('Quick Commands:');
    expect(html).toContain('ipconfig');
    expect(html).toContain('ping 8.8.8.8');
    expect(html).toContain('tracert 1.1.1.1');
  });

  it('renders custom responses when supplied in scenario', () => {
    const html = renderToStaticMarkup(
      <VirtualTerminalSimulator
        hostname="ROUTER-CLI"
        userPrompt="Router#"
        initialLines={['Cisco IOS Software']}
        customResponses={{
          'show ip route': [
            'Codes: C - connected, S - static, R - RIP',
            'Gateway of last resort is not set',
            'C    192.168.1.0/24 is directly connected, GigabitEthernet0/0',
          ],
        }}
        availableCommands={['show ip route']}
      />
    );

    expect(html).toContain('ROUTER-CLI');
    expect(html).toContain('Cisco IOS Software');
    expect(html).toContain('show ip route');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test Suite 2: Module net-14 Diagnostics & Virtual Terminal Configuration
// ─────────────────────────────────────────────────────────────────────────────

describe('Phase 5 — Module net-14 Terminal Diagnostics', () => {
  it('configures net14-p1-icmp-trace-eval with a custom tracert terminal scenario', () => {
    const concept1 = NET_14_MODULE.concepts.find((c) => c.id === 'net14-c1-icmp-diagnostics');
    expect(concept1).toBeDefined();

    const task1 = concept1!.tasks.find((t) => t.id === 'net14-p1-icmp-trace-eval');
    expect(task1).toBeDefined();
    expect(task1!.terminal).toBeDefined();

    const term = task1!.terminal!;
    expect(term.hostname).toBe('IT-ADMIN-PC');
    expect(term.availableCommands).toContain('tracert 93.184.216.34');
    expect(term.availableCommands).toContain('ping 93.184.216.34');
    expect(term.customResponses).toBeDefined();
    expect(term.customResponses!['tracert 93.184.216.34'].join('\n')).toContain('Tracing route to 93.184.216.34');
  });

  it('configures net14-p2-cli-commands with interactive host diagnostics', () => {
    const concept2 = NET_14_MODULE.concepts.find((c) => c.id === 'net14-c2-cli-diagnostics');
    expect(concept2).toBeDefined();

    const task2 = concept2!.tasks.find((t) => t.id === 'net14-p2-cli-commands');
    expect(task2).toBeDefined();
    expect(task2!.terminal).toBeDefined();

    const term = task2!.terminal!;
    expect(term.hostname).toBe('CORP-WS-04');
    expect(term.availableCommands).toContain('ipconfig /flushdns');
    expect(term.availableCommands).toContain('netstat -ano');
  });

  it('renders VirtualTerminalSimulator inside NetworkingPracticeTaskView for net-14 tasks', () => {
    const task = NET_14_MODULE.concepts[0].tasks[0];
    const html = renderToStaticMarkup(
      <NetworkingPracticeTaskView
        task={task}
        taskIndex={0}
        totalTasks={1}
        onTaskSuccess={vi.fn()}
      />
    );

    expect(html).toContain('data-testid="virtual-terminal-simulator"');
    expect(html).toContain('IT-ADMIN-PC');
    expect(html).toContain('tracert 93.184.216.34');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test Suite 3: Interactive Packet Inspection Rollout
// ─────────────────────────────────────────────────────────────────────────────

describe('Phase 5 — Interactive Packet Inspection Across Curriculum Modules', () => {
  it('verifies net-01 encapsulation trace task has complete L2-L7 packet inspection', () => {
    const task = NET_01_MODULE.concepts
      .flatMap((c) => c.tasks)
      .find((t) => t.id === 'net01-p2-encapsulation-trace');
    expect(task).toBeDefined();
    expect(task!.packetInspection).toBeDefined();

    const p = task!.packetInspection!;
    expect(p.title).toContain('Protocol Encapsulation Stack');
    expect(p.snapshots).toHaveLength(1);

    const snap = p.snapshots[0];
    expect(snap.layer2?.etherType).toContain('0x0800');
    expect(snap.layer3?.protocol).toContain('TCP');
    expect(snap.layer4?.srcPort).toBe(52140);
    expect(snap.layer4?.dstPort).toBe(443);
    expect(snap.layer7?.protocol).toBe('HTTP');
  });

  it('verifies net-07 routing task has cross-hop MAC rewrites and TTL decrement', () => {
    const task = NET_07_MODULE.concepts[0].tasks.find(
      (t) => t.id === 'net07-p1-remote-gateway-arp'
    );
    expect(task).toBeDefined();
    expect(task!.packetInspection).toBeDefined();

    const p = task!.packetInspection!;
    expect(p.snapshots).toHaveLength(2);

    const hop1 = p.snapshots[0];
    const hop2 = p.snapshots[1];

    // End-to-end IP invariance:
    expect(hop1.layer3?.srcIp).toBe('192.168.1.10');
    expect(hop2.layer3?.srcIp).toBe('192.168.1.10');
    expect(hop1.layer3?.dstIp).toBe('198.51.100.50');
    expect(hop2.layer3?.dstIp).toBe('198.51.100.50');

    // Hop-by-hop MAC rewrites:
    expect(hop1.layer2?.srcMac).toBe('AA:AA:AA:AA:AA:AA');
    expect(hop1.layer2?.dstMac).toBe('00:00:5E:00:53:01');
    expect(hop2.layer2?.srcMac).toBe('00:00:5E:00:53:02');
    expect(hop2.layer2?.dstMac).toBe('ZZ:ZZ:ZZ:ZZ:ZZ:ZZ');

    // TTL decrement across router:
    expect(hop1.layer3?.ttl).toBe(64);
    expect(hop2.layer3?.ttl).toBe(63);
  });

  it('verifies net-08 NAT task has Inside Local ➔ Inside Global translation', () => {
    const task = NET_08_MODULE.concepts[0].tasks.find(
      (t) => t.id === 'net08-p1-inside-outside-terminology'
    );
    expect(task).toBeDefined();
    expect(task!.packetInspection).toBeDefined();

    const p = task!.packetInspection!;
    expect(p.snapshots).toHaveLength(2);

    const seg1 = p.snapshots[0];
    const seg2 = p.snapshots[1];

    // Inside Local -> Inside Global address & port translation
    expect(seg1.layer3?.srcIp).toBe('10.50.1.25');
    expect(seg1.layer4?.srcPort).toBe(52140);

    expect(seg2.layer3?.srcIp).toBe('203.0.113.10');
    expect(seg2.layer4?.srcPort).toBe(41000);
  });

  it('verifies net-11 transport multiplexing task has concurrent 5-tuple inspection', () => {
    const task = NET_11_MODULE.concepts[0].tasks.find(
      (t) => t.id === 'net11-p1-5tuple-multiplexing'
    );
    expect(task).toBeDefined();
    expect(task!.packetInspection).toBeDefined();

    const p = task!.packetInspection!;
    expect(p.snapshots).toHaveLength(2);

    const tab1 = p.snapshots[0];
    const tab2 = p.snapshots[1];

    expect(tab1.layer4?.srcPort).toBe(52001);
    expect(tab2.layer4?.srcPort).toBe(52002);
    expect(tab1.layer4?.dstPort).toBe(443);
    expect(tab2.layer4?.dstPort).toBe(443);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test Suite 4: UI Rendering Parity and Pipeline Classifier
// ─────────────────────────────────────────────────────────────────────────────

describe('Phase 5 — Pipeline Classifier & End-to-End View Parity', () => {
  it('correctly classifies tasks with terminal or packetInspection as networking tasks', () => {
    const net14Task = NET_14_MODULE.concepts[0].tasks[0];
    const net01Task = NET_01_MODULE.concepts[1].tasks[0];
    const net07Task = NET_07_MODULE.concepts[0].tasks[0];
    const net08Task = NET_08_MODULE.concepts[0].tasks[0];
    const net11Task = NET_11_MODULE.concepts[0].tasks[0];

    expect(isNetworkingTask(net14Task)).toBe(true);
    expect(isNetworkingTask(net01Task)).toBe(true);
    expect(isNetworkingTask(net07Task)).toBe(true);
    expect(isNetworkingTask(net08Task)).toBe(true);
    expect(isNetworkingTask(net11Task)).toBe(true);
  });

  it('renders NetworkingPracticeTaskView without errors for all enhanced tasks', () => {
    const tasksToTest = [
      NET_01_MODULE.concepts[1].tasks[0],
      NET_07_MODULE.concepts[0].tasks[0],
      NET_08_MODULE.concepts[0].tasks[0],
      NET_11_MODULE.concepts[0].tasks[0],
      NET_14_MODULE.concepts[0].tasks[0],
    ];

    for (const task of tasksToTest) {
      const html = renderToStaticMarkup(
        <NetworkingPracticeTaskView
          task={task}
          taskIndex={0}
          totalTasks={1}
          onTaskSuccess={vi.fn()}
        />
      );
      expect(html).toBeTruthy();
      expect(html).toContain('data-testid="networking-practice-task-view"');
    }
  });
});
