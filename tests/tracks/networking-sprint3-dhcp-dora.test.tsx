/**
 * Sprint 3: Module 9 — DHCP DORA Protocol & Lease Stepper Tests.
 * ─────────────────────────────────────────────────────────────────────────────
 * Verifies:
 *  1. RFC 2131 DHCP Lease Timer Calculations (calculateDhcpTimers):
 *     - T1 Renewal timer fires at exactly 50% of total lease time (unicast).
 *     - T2 Rebind timer fires at exactly 87.5% of total lease time (broadcast).
 *     - Accurate duration formatting across various lease intervals (1h, 8h, 24h).
 *  2. DhcpDoraSimulator standalone component rendering across all 4 steps:
 *     - Step 1: DHCPDISCOVER (0.0.0.0:68 -> 255.255.255.255:67, FF:FF:FF:FF:FF:FF, XID).
 *     - Step 2: DHCPOFFER (Offered IP yiaddr, options, competing/rogue server display).
 *     - Step 3: DHCPREQUEST (Broadcast to 255.255.255.255, Option 50 & 54 declination).
 *     - Step 4: DHCPACK (BOUND state, bound IP, T1 renewal, T2 rebind breakdown).
 *     - APIPA Timeout Scenario (RFC 3927 link-local fallback: 169.254.x.x/16).
 *  3. NetworkingPracticeTaskView integration with net-09 tasks:
 *     - net09-p1-bootstrap-analysis renders DhcpDoraSimulator in Step 1 Discover mode.
 *     - net09-p2-dora-timing renders DhcpDoraSimulator in Step 3 / competing server mode.
 *     - net09-p3-relay-apipa-diagnosis renders DhcpDoraSimulator in APIPA fallback mode.
 *     - net09-ch1-rogue-dhcp-detection renders DhcpDoraSimulator in rogue server mode.
 *     - Split-pane layout maintains status badge "DHCP DORA Lab".
 *  4. isNetworkingTask classifier recognizes all tasks with dhcp property.
 *  5. Central submit pipeline evaluates net-09 tasks with 100% precision.
 *  6. Zero regression across all Module 9 practice and challenge tasks.
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  DhcpDoraSimulator,
  calculateDhcpTimers,
} from '../../src/components/learning/networking/DhcpDoraSimulator';
import { NetworkingPracticeTaskView } from '../../src/components/learning/networking/NetworkingPracticeTaskView';
import { NET_09_MODULE } from '../../src/content/networking/modules/net-09';
import {
  isNetworkingTask,
  gradeNetworkingSubmission,
} from '../../src/lib/network-engine/networking-submit-pipeline';
import { submitForTask } from '../../src/lib/track-submit';
import type { PracticeTask, DhcpTaskContent } from '../../src/types/curriculum';

// ─────────────────────────────────────────────────────────────────────────────
// Test Suite 1: Pure RFC 2131 DHCP Lease Timer Calculations
// ─────────────────────────────────────────────────────────────────────────────

describe('Sprint 3 — Test 1: RFC 2131 DHCP Lease Timer Calculation', () => {
  it('calculates 50% T1 and 87.5% T2 for standard 8-hour lease (28,800s)', () => {
    const timers = calculateDhcpTimers(28800);

    // T1 = 50% = 14,400s (4 hours)
    expect(timers.t1Seconds).toBe(14400);
    expect(timers.t1Formatted).toBe('4h (14,400s)');

    // T2 = 87.5% = 25,200s (7 hours)
    expect(timers.t2Seconds).toBe(25200);
    expect(timers.t2Formatted).toBe('7h (25,200s)');

    expect(timers.leaseSeconds).toBe(28800);
    expect(timers.leaseFormatted).toBe('8h (28,800s)');
  });

  it('calculates 50% T1 and 87.5% T2 for 24-hour lease (86,400s)', () => {
    const timers = calculateDhcpTimers(86400);

    expect(timers.t1Seconds).toBe(43200);
    expect(timers.t1Formatted).toBe('12h (43,200s)');

    expect(timers.t2Seconds).toBe(75600);
    expect(timers.t2Formatted).toBe('21h (75,600s)');
  });

  it('calculates 50% T1 and 87.5% T2 for 1-hour lease (3,600s)', () => {
    const timers = calculateDhcpTimers(3600);

    expect(timers.t1Seconds).toBe(1800);
    expect(timers.t1Formatted).toBe('0.5h (1,800s)');

    expect(timers.t2Seconds).toBe(3150);
    expect(timers.t2Formatted).toBe('0.9h (3,150s)');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test Suite 2: DhcpDoraSimulator Component Standalone Rendering
// ─────────────────────────────────────────────────────────────────────────────

describe('Sprint 3 — Test 2: DhcpDoraSimulator Standalone Rendering', () => {
  it('renders Step 1 (DHCPDISCOVER) with bootstrap broadcast parameters', () => {
    const config: DhcpTaskContent = {
      title: 'DHCP Bootstrap Lab',
      clientMac: '00:1A:2B:3C:4D:5E',
      transactionId: '0x39A2F1B0',
      initialStep: 1,
      scenarioMode: 'standard',
    };

    const html = renderToStaticMarkup(<DhcpDoraSimulator taskContent={config} />);

    // Verify main container and step 1 view
    expect(html).toContain('data-testid="dhcp-dora-simulator"');
    expect(html).toContain('data-testid="step-discover-view"');

    // Verify bootstrap L3: 0.0.0.0 -> 255.255.255.255
    expect(html).toContain('0.0.0.0 (Unconfigured)');
    expect(html).toContain('255.255.255.255 (Limited Broadcast)');

    // Verify bootstrap L2: client MAC -> FF:FF:FF:FF:FF:FF
    expect(html).toContain('00:1A:2B:3C:4D:5E');
    expect(html).toContain('FF:FF:FF:FF:FF:FF (Broadcast)');

    // Verify Ports: UDP 68 -> 67
    expect(html).toContain('UDP Port 68 → 67');

    // Verify XID and Option 53
    expect(html).toContain('0x39A2F1B0');
    expect(html).toContain('Option 53: DHCPDISCOVER (1)');
  });

  it('renders Step 2 (DHCPOFFER) in competing servers mode with rogue warnings', () => {
    const config: DhcpTaskContent = {
      title: 'Rogue DHCP Analysis',
      clientMac: '00:1A:2B:3C:4D:5E',
      primaryServer: {
        name: 'Corporate DHCP Server',
        serverIp: '10.50.0.1',
        serverMac: '00:50:56:C0:00:01',
        offeredIp: '10.50.0.125',
        subnetMask: '255.255.255.0 (/24)',
        gateway: '10.50.0.1',
        dns: '10.50.0.10',
        leaseTimeSeconds: 28800,
      },
      competingServer: {
        name: 'Rogue Wi-Fi Router (Floor 3)',
        serverIp: '192.168.1.1',
        serverMac: '00:14:D1:E2:34:56',
        offeredIp: '192.168.1.100',
        subnetMask: '255.255.255.0 (/24)',
        gateway: '192.168.1.1',
        dns: '192.168.1.1',
        leaseTimeSeconds: 86400,
        isRogue: true,
      },
      initialStep: 2,
      scenarioMode: 'competing_servers',
    };

    const html = renderToStaticMarkup(<DhcpDoraSimulator taskContent={config} />);

    expect(html).toContain('data-testid="step-offer-view"');
    expect(html).toContain('Corporate DHCP Server');
    expect(html).toContain('10.50.0.125');

    // Competing/Rogue server callouts
    expect(html).toContain('Rogue Wi-Fi Router (Floor 3)');
    expect(html).toContain('192.168.1.100');
    expect(html).toContain('Rogue / Conflicting');
    expect(html).toContain('First-Come, First-Served:');
  });

  it('renders Step 3 (DHCPREQUEST) with broadcast declination explanation', () => {
    const config: DhcpTaskContent = {
      title: 'DHCP Request & Option 54 Lab',
      clientMac: '00:1A:2B:3C:4D:5E',
      primaryServer: {
        name: 'Main DHCP Server',
        serverIp: '192.168.1.1',
        serverMac: '00:50:56:C0:00:01',
        offeredIp: '192.168.1.100',
        subnetMask: '255.255.255.0 (/24)',
        gateway: '192.168.1.1',
        dns: '8.8.8.8',
        leaseTimeSeconds: 28800,
      },
      initialStep: 3,
      scenarioMode: 'standard',
    };

    const html = renderToStaticMarkup(<DhcpDoraSimulator taskContent={config} />);

    expect(html).toContain('data-testid="step-request-view"');
    expect(html).toContain('Option 50 (Requested IP)');
    expect(html).toContain('Option 54 (Server Identifier)');
    expect(html).toContain('192.168.1.100');
    expect(html).toContain('192.168.1.1');
    expect(html).toContain('255.255.255.255 (Broadcast!)');
    expect(html).toContain('Why is the DHCP Request Sent as a Broadcast?');
  });

  it('renders Step 4 (DHCPACK) with BOUND state and T1/T2 timer breakdown', () => {
    const config: DhcpTaskContent = {
      title: 'DHCP ACK & Binding Lab',
      clientMac: '00:1A:2B:3C:4D:5E',
      leaseSeconds: 28800,
      primaryServer: {
        name: 'Enterprise DHCP Server',
        serverIp: '192.168.1.1',
        serverMac: '00:50:56:C0:00:01',
        offeredIp: '192.168.1.100',
        subnetMask: '255.255.255.0 (/24)',
        gateway: '192.168.1.1',
        dns: '8.8.8.8',
        leaseTimeSeconds: 28800,
      },
      initialStep: 4,
      scenarioMode: 'standard',
    };

    const html = renderToStaticMarkup(<DhcpDoraSimulator taskContent={config} />);

    expect(html).toContain('data-testid="step-ack-view"');
    expect(html).toContain('State: BOUND');
    expect(html).toContain('data-testid="bound-ip-output"');
    expect(html).toContain('192.168.1.100');

    // Timer callouts
    expect(html).toContain('T1 Renewal (50%)');
    expect(html).toContain('4h (14,400s)');
    expect(html).toContain('T2 Rebind (87.5%)');
    expect(html).toContain('7h (25,200s)');
    expect(html).toContain('Expire (100%)');
    expect(html).toContain('8h (28,800s)');
  });

  it('renders APIPA failure mode with RFC 3927 link-local explanation', () => {
    const config: DhcpTaskContent = {
      title: 'APIPA Fallback Lab',
      clientMac: '00:1A:2B:3C:4D:5E',
      initialStep: 1,
      scenarioMode: 'apipa_timeout',
    };

    const html = renderToStaticMarkup(<DhcpDoraSimulator taskContent={config} />);

    expect(html).toContain('data-testid="apipa-view"');
    expect(html).toContain('APIPA Failure State (RFC 3927): 169.254.x.x/16');
    expect(html).toContain('169.254.44.120');
    expect(html).toContain('255.255.0.0 (/16)');
    expect(html).toContain('Scope: Link-Local Unrouted');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test Suite 3: NetworkingPracticeTaskView Split-Pane Integration
// ─────────────────────────────────────────────────────────────────────────────

describe('Sprint 3 — Test 3: NetworkingPracticeTaskView Integration with net-09 Tasks', () => {
  it('renders net09-p1-bootstrap-analysis with DHCP DORA Lab indicator and Step 1 view', () => {
    const task = NET_09_MODULE.concepts[0].tasks[0];
    const concept = NET_09_MODULE.concepts[0];

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
    expect(html).toContain('DHCP DORA Lab');
    expect(html).toContain('data-testid="dhcp-dora-simulator"');
    expect(html).toContain('data-testid="step-discover-view"');
    expect(html).toContain('0.0.0.0 (Unconfigured)');
    expect(html).toContain('255.255.255.255 (Limited Broadcast)');
  });

  it('renders net09-p2-dora-timing with competing servers and timer options', () => {
    const task = NET_09_MODULE.concepts[1].tasks[0];
    const concept = NET_09_MODULE.concepts[1];

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

    expect(html).toContain('data-testid="dhcp-dora-simulator"');
    expect(html).toContain('192.168.1.100');
    expect(html).toContain('192.168.1.1');
    expect(html).toContain('data-testid="step-request-view"');
  });

  it('renders net09-p3-relay-apipa-diagnosis with APIPA view', () => {
    const task = NET_09_MODULE.concepts[2].tasks[0];
    const concept = NET_09_MODULE.concepts[2];

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

    expect(html).toContain('data-testid="dhcp-dora-simulator"');
    expect(html).toContain('data-testid="apipa-view"');
    expect(html).toContain('169.254.44.120');
  });

  it('renders net09-ch1-rogue-dhcp-detection challenge task with rogue server layout', () => {
    const task = NET_09_MODULE.challenge!.tasks[0];

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

    expect(html).toContain('Mastery Challenge');
    expect(html).toContain('data-testid="dhcp-dora-simulator"');
    expect(html).toContain('Corporate DHCP Server');
    expect(html).toContain('Rogue Wi-Fi Router (Floor 3)');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test Suite 4: isNetworkingTask Classifier & Central Pipeline Grading
// ─────────────────────────────────────────────────────────────────────────────

describe('Sprint 3 — Test 4: Task Classification & Submission Pipeline', () => {
  it('correctly classifies all net-09 tasks via isNetworkingTask', () => {
    const allTasks: PracticeTask[] = [
      ...NET_09_MODULE.concepts.flatMap((c) => c.tasks),
      ...(NET_09_MODULE.challenge?.tasks || []),
    ];

    expect(allTasks.length).toBe(5);

    for (const task of allTasks) {
      expect(isNetworkingTask(task)).toBe(true);
    }
  });

  it('grades net09-p1-bootstrap-analysis correctly with reference answers', () => {
    const task = NET_09_MODULE.concepts[0].tasks[0];
    const outcome = gradeNetworkingSubmission({
      task,
      judgmentAnswers: [1, 1], // Option 1: 0.0.0.0:68; Option 1: does not yet know IP or MAC
    });

    expect(outcome.passed).toBe(true);
  });

  it('grades net09-p2-dora-timing correctly with reference answers', () => {
    const task = NET_09_MODULE.concepts[1].tasks[0];
    const outcome = gradeNetworkingSubmission({
      task,
      judgmentAnswers: [0, 1], // Option 0: notify other servers; Option 1: at 4 hours unicast to original server
    });

    expect(outcome.passed).toBe(true);
  });

  it('grades net09-p3-relay-apipa-diagnosis correctly with reference answers', () => {
    const task = NET_09_MODULE.concepts[2].tasks[0];
    const outcome = gradeNetworkingSubmission({
      task,
      judgmentAnswers: [1, 1], // Option 1: failed to receive reply fell back to APIPA; Option 1: giaddr field
    });

    expect(outcome.passed).toBe(true);
  });

  it('grades net09-ch1-rogue-dhcp-detection challenge task correctly', () => {
    const task = NET_09_MODULE.challenge!.tasks[0];
    const outcome = gradeNetworkingSubmission({
      task,
      judgmentAnswers: [1, 1], // Option 1: first offer race condition; Option 1: DHCP Snooping
    });

    expect(outcome.passed).toBe(true);
  });

  it('rejects incorrect judgment answers with targeted feedback', () => {
    const task = NET_09_MODULE.concepts[0].tasks[0];
    const outcome = gradeNetworkingSubmission({
      task,
      judgmentAnswers: [0, 1], // Wrong: chose 127.0.0.1 loopback
    });

    expect(outcome.passed).toBe(false);
    expect(outcome.feedback).toBeDefined();
    expect(outcome.feedback).toContain('0.0.0.0');
  });

  it('passes all Module 9 tasks via submitForTask central pipeline', () => {
    const allTasks: PracticeTask[] = [
      ...NET_09_MODULE.concepts.flatMap((c) => c.tasks),
      ...(NET_09_MODULE.challenge?.tasks || []),
    ];

    const mockHooks = {
      execute: () => ({ success: true, columns: [], rows: [], rowCount: 0, executionTimeMs: 0 }),
      recordSubmission: vi.fn(),
      triggerFeedbackModal: vi.fn(),
      syncAdaptiveChallengeUnlock: vi.fn(),
    };

    for (const task of allTasks) {
      const correctAnswers = (task.validation.judgment ?? []).map((j) => j.correctIndex);
      const outcome = submitForTask({
        task,
        code: '',
        hooks: mockHooks,
        judgmentAnswers: correctAnswers,
        surface: 'lesson',
      });

      expect(outcome.passed).toBe(true);
    }
  });
});
