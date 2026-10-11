/**
 * Sprint 7 Test Suite: Stateful Firewall, ACL & STP Topology Simulator (Module 15)
 * ─────────────────────────────────────────────────────────────────────────────
 * Validates:
 * 1. Pure ACL first-match rule evaluator with implicit deny all fallback.
 * 2. Pure stateful connection tracking (conntrack) evaluator (NEW vs ESTABLISHED vs unsolicited).
 * 3. Pure Spanning Tree Protocol (STP) Root Bridge election and redundant link blocking logic.
 * 4. Pure broadcast storm simulator (infinite frame multiplication without TTL).
 * 5. Standalone FirewallAclRuleSimulator rendering across all tabs:
 *    - Stateless ACL view (rule lines, probe selector, first-match badges).
 *    - Stateful Conntrack view (connection state table, threat toggle, conntrack action).
 *    - STP Topology view (switch nodes, Bridge ID, Root Bridge badge, blocking link).
 * 6. Pipeline detection (`isNetworkingTask`) and `NetworkingPracticeTaskView` split-pane integration.
 * 7. Verification that all Module 15 tasks (p1, p2, p3, ch1, ch2) have `firewall` properly configured.
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

import {
  FirewallAclRuleSimulator,
  evaluateAclRule,
  evaluateConntrackPacket,
  calculateStpElection,
  simulateBroadcastStorm,
  type PacketProbe,
} from '../../src/components/learning/networking/FirewallAclRuleSimulator';

import { NetworkingPracticeTaskView } from '../../src/components/learning/networking/NetworkingPracticeTaskView';
import {
  isNetworkingTask,
  gradeNetworkingSubmission,
} from '../../src/lib/network-engine/networking-submit-pipeline';
import { submitForTask } from '../../src/lib/track-submit';
import { NET_15_MODULE } from '../../src/content/networking/modules/net-15';
import type { PracticeTask, FirewallTaskContent, AclRule, ConntrackEntry } from '../../src/types/curriculum';

// ─────────────────────────────────────────────────────────────────────────────
// Test Suite 1: Pure ACL First-Match & Implicit Deny Logic
// ─────────────────────────────────────────────────────────────────────────────

describe('Sprint 7 — Test 1: Stateless ACL First-Match & Implicit Deny Logic', () => {
  const sampleRules: AclRule[] = [
    { line: 10, action: 'deny', protocol: 'tcp', source: 'any', destination: 'host 10.0.0.5', destPort: 80, comment: 'Block HTTP to sensitive host' },
    { line: 20, action: 'permit', protocol: 'tcp', source: 'any', destination: 'host 10.0.0.5', destPort: 80, comment: 'Permit HTTP (conflicting rule)' },
    { line: 30, action: 'permit', protocol: 'tcp', source: '10.0.0.0/24', destination: 'any', destPort: 443, comment: 'Allow HTTPS' },
    { line: 40, action: 'permit', protocol: 'udp', source: 'any', destination: 'any', destPort: 53, comment: 'Allow DNS' },
  ];

  it('halts evaluation on first match and applies deny action (Line 10 matches, Line 20 skipped)', () => {
    const packet: PacketProbe = {
      protocol: 'tcp',
      srcIp: '10.0.0.100',
      srcPort: 51200,
      dstIp: '10.0.0.5',
      dstPort: 80,
      direction: 'inbound',
    };

    const result = evaluateAclRule(sampleRules, packet);
    expect(result.matchedLine).toBe(10);
    expect(result.action).toBe('deny');
    expect(result.isImplicitDeny).toBe(false);
    expect(result.evaluatedLines).toEqual([10]);
    expect(result.skippedLines).toContain(20);
    expect(result.explanation).toContain('First-Match Found at Line 10');
  });

  it('permits matching outbound HTTPS traffic on Line 30', () => {
    const packet: PacketProbe = {
      protocol: 'tcp',
      srcIp: '10.0.0.55',
      srcPort: 50400,
      dstIp: '93.184.216.34',
      dstPort: 443,
      direction: 'outbound',
    };

    const result = evaluateAclRule(sampleRules, packet);
    expect(result.matchedLine).toBe(30);
    expect(result.action).toBe('permit');
    expect(result.evaluatedLines).toEqual([10, 20, 30]);
    expect(result.skippedLines).toEqual([40]);
  });

  it('drops unmatched packets using invisible implicit deny all (Line 999)', () => {
    const packet: PacketProbe = {
      protocol: 'udp',
      srcIp: '192.168.1.1',
      srcPort: 12345,
      dstIp: '192.168.1.254',
      dstPort: 161, // SNMP
      direction: 'inbound',
    };

    const result = evaluateAclRule(sampleRules, packet);
    expect(result.matchedLine).toBe(999);
    expect(result.action).toBe('deny');
    expect(result.isImplicitDeny).toBe(true);
    expect(result.explanation).toContain('Implicit Deny Executed');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test Suite 2: Pure Stateful Connection Tracking (conntrack) Logic
// ─────────────────────────────────────────────────────────────────────────────

describe('Sprint 7 — Test 2: Stateful Connection Tracking (conntrack) Logic', () => {
  const initialTable: ConntrackEntry[] = [
    { id: 'ct-active-1', protocol: 'tcp', srcIp: '10.0.0.50', srcPort: 51200, dstIp: '93.184.216.34', dstPort: 443, state: 'NEW', timeoutSeconds: 120 },
  ];

  it('permits returning SYN-ACK packet and upgrades session state to ESTABLISHED', () => {
    const returnPacket: PacketProbe = {
      protocol: 'tcp',
      srcIp: '93.184.216.34',
      srcPort: 443,
      dstIp: '10.0.0.50',
      dstPort: 51200,
      direction: 'inbound',
    };

    const result = evaluateConntrackPacket(initialTable, returnPacket, 'inbound');
    expect(result.action).toBe('PERMIT');
    expect(result.state).toBe('ESTABLISHED');
    expect(result.matchedEntryId).toBe('ct-active-1');
    expect(result.table.find((e) => e.id === 'ct-active-1')?.state).toBe('ESTABLISHED');
  });

  it('creates new conntrack entry for permitted outbound connection', () => {
    const newOutbound: PacketProbe = {
      protocol: 'tcp',
      srcIp: '10.0.0.75',
      srcPort: 49800,
      dstIp: '142.250.190.46',
      dstPort: 80,
      direction: 'outbound',
    };

    const result = evaluateConntrackPacket(initialTable, newOutbound, 'outbound', true);
    expect(result.action).toBe('PERMIT');
    expect(result.state).toBe('NEW');
    expect(result.table).toHaveLength(2);
  });

  it('drops unsolicited inbound connection attempts by external hosts', () => {
    const attackerPacket: PacketProbe = {
      protocol: 'tcp',
      srcIp: '198.51.100.99',
      srcPort: 4444,
      dstIp: '10.0.0.50',
      dstPort: 22, // SSH
      direction: 'inbound',
    };

    const result = evaluateConntrackPacket(initialTable, attackerPacket, 'inbound');
    expect(result.action).toBe('DROP');
    expect(result.explanation).toContain('Unsolicited Inbound Packet Dropped');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test Suite 3: Pure STP Root Election & Broadcast Storm Logic
// ─────────────────────────────────────────────────────────────────────────────

describe('Sprint 7 — Test 3: STP Root Election & Loop Elimination', () => {
  const switches = [
    { id: 'SW1', name: 'SW1', priority: 32768, macAddress: '00:11:22:33:44:01' },
    { id: 'SW2', name: 'SW2', priority: 4096, macAddress: '00:11:22:33:44:02' },
    { id: 'SW3', name: 'SW3', priority: 32768, macAddress: '00:11:22:33:44:03' },
  ];

  const links = [
    { id: 'link-1-2', fromSwitch: 'SW2', fromPort: 'Gi0/1', toSwitch: 'SW1', toPort: 'Gi0/1', cost: 4, status: 'forwarding' as const },
    { id: 'link-2-3', fromSwitch: 'SW2', fromPort: 'Gi0/2', toSwitch: 'SW3', toPort: 'Gi0/1', cost: 4, status: 'forwarding' as const },
    { id: 'link-1-3', fromSwitch: 'SW1', fromPort: 'Gi0/2', toSwitch: 'SW3', toPort: 'Gi0/2', cost: 4, status: 'blocking' as const },
  ];

  it('elects switch with lowest Bridge Priority as Root Bridge (SW2 with 4096)', () => {
    const result = calculateStpElection(switches, links);
    expect(result.rootSwitchId).toBe('SW2');
    expect(result.rootBridgeId).toBe('4096:00:11:22:33:44:02');
    expect(result.blockingLinkId).toBe('link-1-3');
    expect(result.portRoles['SW3:Gi0/2']).toBe('BLOCKING');
  });

  it('demonstrates broadcast storm saturation when STP is disabled', () => {
    const stormDisabled = simulateBroadcastStorm(false, 1);
    expect(stormDisabled.networkSaturated).toBe(true);
    expect(stormDisabled.cpuUtilizationPercent).toBe(100);
    expect(stormDisabled.explanation).toContain('BROADCAST STORM');

    const stpActive = simulateBroadcastStorm(true, 1);
    expect(stpActive.networkSaturated).toBe(false);
    expect(stpActive.cpuUtilizationPercent).toBe(4);
    expect(stpActive.explanation).toContain('Loop-Free Topology');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test Suite 4: Standalone FirewallAclRuleSimulator Component Rendering
// ─────────────────────────────────────────────────────────────────────────────

describe('Sprint 7 — Test 4: Standalone FirewallAclRuleSimulator Rendering', () => {
  it('renders default Stateless ACL view with rule table and first-match indicators', () => {
    const html = renderToStaticMarkup(<FirewallAclRuleSimulator />);

    expect(html).toContain('data-testid="firewall-acl-simulator"');
    expect(html).toContain('data-testid="view-acl-pipeline"');
    expect(html).toContain('Sequential ACL Rule Table');
    expect(html).toContain('data-testid="acl-rule-10"');
    expect(html).toContain('data-testid="acl-rule-implicit-deny"');
    expect(html).toContain('data-testid="acl-verdict-box"');
    expect(html).toContain('DENY');
  });

  it('renders Stateful Conntrack view with active connection tracking table', () => {
    const config: FirewallTaskContent = {
      defaultTab: 'stateful_conntrack',
    };

    const html = renderToStaticMarkup(<FirewallAclRuleSimulator taskContent={config} />);

    expect(html).toContain('data-testid="view-stateful-conntrack"');
    expect(html).toContain('Dynamic Connection State Table');
    expect(html).toContain('data-testid="conntrack-table"');
    expect(html).toContain('ESTABLISHED');
    expect(html).toContain('data-testid="conntrack-verdict-box"');
  });

  it('renders STP Topology view with Root Bridge election and blocking link', () => {
    const config: FirewallTaskContent = {
      defaultTab: 'stp_topology',
    };

    const html = renderToStaticMarkup(<FirewallAclRuleSimulator taskContent={config} />);

    expect(html).toContain('data-testid="view-stp-topology"');
    expect(html).toContain('Spanning Tree Protocol (IEEE 802.1D / 802.1w)');
    expect(html).toContain('ROOT BRIDGE');
    expect(html).toContain('data-testid="switch-card-SW2"');
    expect(html).toContain('BLOCKING (BLK)');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test Suite 5: NetworkingPracticeTaskView Split-Pane Integration
// ─────────────────────────────────────────────────────────────────────────────

describe('Sprint 7 — Test 5: NetworkingPracticeTaskView Integration with net-15 Tasks', () => {
  it('renders net15-p1-stp-election with Firewall & STP Lab badge and STP topology', () => {
    const task = NET_15_MODULE.concepts[0].tasks[0];
    const concept = NET_15_MODULE.concepts[0];

    const html = renderToStaticMarkup(
      <NetworkingPracticeTaskView
        task={task}
        taskIndex={0}
        totalTasks={3}
        concept={concept}
        conceptIndex={0}
        totalConcepts={3}
        isCompleted={false}
        onTaskSuccess={vi.fn()}
      />,
    );

    expect(html).toContain('data-testid="networking-practice-task-view"');
    expect(html).toContain('Firewall &amp; STP Lab');
    expect(html).toContain('data-testid="firewall-acl-simulator"');
    expect(html).toContain('Spanning Tree Protocol (STP) Root Election &amp; Loop Lab');
  });

  it('renders net15-p2-acl-rule-evaluation with Stateless ACL pipeline', () => {
    const task = NET_15_MODULE.concepts[1].tasks[0];
    const concept = NET_15_MODULE.concepts[1];

    const html = renderToStaticMarkup(
      <NetworkingPracticeTaskView
        task={task}
        taskIndex={1}
        totalTasks={3}
        concept={concept}
        conceptIndex={1}
        totalConcepts={3}
        isCompleted={false}
        onTaskSuccess={vi.fn()}
      />,
    );

    expect(html).toContain('data-testid="firewall-acl-simulator"');
    expect(html).toContain('Stateless ACL First-Match &amp; Implicit Deny Pipeline');
    expect(html).toContain('data-testid="acl-rule-10"');
  });

  it('renders net15-p3-stateful-conntrack with Stateful Conntrack inspector', () => {
    const task = NET_15_MODULE.concepts[2].tasks[0];
    const concept = NET_15_MODULE.concepts[2];

    const html = renderToStaticMarkup(
      <NetworkingPracticeTaskView
        task={task}
        taskIndex={2}
        totalTasks={3}
        concept={concept}
        conceptIndex={2}
        totalConcepts={3}
        isCompleted={false}
        onTaskSuccess={vi.fn()}
      />,
    );

    expect(html).toContain('data-testid="firewall-acl-simulator"');
    expect(html).toContain('Stateful Connection Tracking (conntrack) Inspector');
  });

  it('renders net15-ch1-stp-topology-blocking challenge with redundant loop lab', () => {
    const task = NET_15_MODULE.challenge!.tasks[0];

    const html = renderToStaticMarkup(
      <NetworkingPracticeTaskView
        task={task}
        taskIndex={0}
        totalTasks={2}
        isChallenge={true}
        isCompleted={false}
        onTaskSuccess={vi.fn()}
      />,
    );

    expect(html).toContain('data-testid="firewall-acl-simulator"');
    expect(html).toContain('STP Redundant Topology &amp; Port Role Identification Lab');
  });

  it('renders net15-ch2-stateless-vs-stateful-firewall challenge with asymmetric return simulator', () => {
    const task = NET_15_MODULE.challenge!.tasks[1];

    const html = renderToStaticMarkup(
      <NetworkingPracticeTaskView
        task={task}
        taskIndex={1}
        totalTasks={2}
        isChallenge={true}
        isCompleted={false}
        onTaskSuccess={vi.fn()}
      />,
    );

    expect(html).toContain('data-testid="firewall-acl-simulator"');
    expect(html).toContain('Stateless vs Stateful Asymmetric Return Flow Simulator');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test Suite 6: Pipeline Recognition & Submission Grading
// ─────────────────────────────────────────────────────────────────────────────

describe('Sprint 7 — Test 6: Submit Pipeline Recognition & Grading', () => {
  it('recognizes any task containing firewall as a networking task', () => {
    const dummyTask: PracticeTask = {
      id: 'custom-firewall-task',
      title: 'Boundary Filter Test',
      description: 'Test description',
      instructions: [],
      type: 'guided',
      primaryTable: '',
      initialSql: '',
      solutionSql: 'NETWORKING_JUDGMENT_TASK',
      solutionExplanation: 'Test explanation',
      successMessage: 'Test success',
      hints: [],
      validation: { judgment: [] },
      firewall: {
        defaultTab: 'acl_pipeline',
      },
    };

    expect(isNetworkingTask(dummyTask)).toBe(true);
  });

  it('evaluates judgment submission for net15-p1 correctly via gradeNetworkingSubmission', () => {
    const task = NET_15_MODULE.concepts[0].tasks[0];

    // Correct answers: [1, 1] (SW2 priority 4096 wins, Ethernet lacks TTL)
    const passOutcome = gradeNetworkingSubmission({
      task,
      judgmentAnswers: [1, 1],
    });
    expect(passOutcome.passed).toBe(true);

    // Incorrect answer
    const failOutcome = gradeNetworkingSubmission({
      task,
      judgmentAnswers: [0, 0],
    });
    expect(failOutcome.passed).toBe(false);
  });

  it('evaluates judgment submission for net15-ch2 challenge correctly via submitForTask', () => {
    const task = NET_15_MODULE.challenge!.tasks[1];

    // Correct answer: option 1 (SYN leaves, return SYN-ACK dropped by inbound implicit deny)
    const passOutcome = submitForTask({
      task,
      code: '',
      hooks: {
        execute: () => ({ success: true, columns: [], rows: [], rowCount: 0, executionTimeMs: 0 }),
      },
      judgmentAnswers: [1],
      surface: 'challenge',
    });
    expect(passOutcome.passed).toBe(true);
    expect(passOutcome.feedback).toContain('Challenge 2 cleared');
  });
});
