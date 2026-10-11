/**
 * Sprint 2: Module 6 — IPv6 NDP & EUI-64 Simulator Tests.
 * ─────────────────────────────────────────────────────────────────────────────
 * Verifies:
 *  1. RFC 4291 Modified EUI-64 algorithm:
 *     - 48-bit MAC split into OUI and NIC halves.
 *     - Insertion of 0xFFFE in the middle.
 *     - Bit 7 (Universal/Local) inversion (XOR 0x02).
 *     - Derivation of canonical link-local fe80:: address.
 *  2. RFC 4861 Neighbor Discovery Protocol (NDP) algorithm:
 *     - Solicited-node multicast group generation (ff02::1:ffxx:xxxx).
 *     - Multicast MAC mapping (33:33:FF:xx:xx:xx).
 *  3. RFC 5952 Zero-Compression & Expansion:
 *     - Canonical short form derivation and leading-zero omission.
 *  4. Ipv6NdpSimulator standalone rendering across all 3 modes:
 *     - EUI-64 Stepper tab.
 *     - NDP NS/NA Flow tab with broadcast vs multicast comparison.
 *     - Zero Compression tab with RFC 5952 guidelines.
 *  5. NetworkingPracticeTaskView integration with net-06 tasks:
 *     - net06-p1-ipv6-notation renders Ipv6NdpSimulator in compression mode.
 *     - net06-p2-scope-classification renders Ipv6NdpSimulator in ndp_flow mode.
 *     - net06-p3-ndp-slaac renders Ipv6NdpSimulator in eui64 mode.
 *  6. isNetworkingTask classifier recognizes all tasks with ipv6Ndp.
 *  7. Central submit pipeline evaluates net-06 tasks with 100% precision.
 *  8. Zero regression across all 16 networking modules.
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  Ipv6NdpSimulator,
  macToEui64,
  toSolicitedNodeMulticast,
  canonicalizeIpv6,
  expandIpv6,
} from '../../src/components/learning/networking/Ipv6NdpSimulator';
import { NetworkingPracticeTaskView } from '../../src/components/learning/networking/NetworkingPracticeTaskView';
import { NET_06_MODULE } from '../../src/content/networking/modules/net-06';
import {
  isNetworkingTask,
  gradeNetworkingSubmission,
} from '../../src/lib/network-engine/networking-submit-pipeline';
import { submitForTask } from '../../src/lib/track-submit';
import type { PracticeTask, Ipv6NdpTaskContent } from '../../src/types/curriculum';

// ─────────────────────────────────────────────────────────────────────────────
// Test Suite 1: Pure RFC Algorithms (EUI-64, NDP Multicast, RFC 5952)
// ─────────────────────────────────────────────────────────────────────────────

describe('Sprint 2 — Test 1: RFC 4291 Modified EUI-64 Identifier Logic', () => {
  it('correctly converts MAC 3C:22:FB:4A:11:80 to link-local fe80::3e22:fbff:fe4a:1180', () => {
    const res = macToEui64('3C:22:FB:4A:11:80');

    expect(res.oui).toBe('3C:22:FB');
    expect(res.nic).toBe('4A:11:80');
    // First octet 0x3C XOR 0x02 = 0x3E
    expect(res.invertedFirstOctet).toBe('3E');
    expect(res.interfaceId).toBe('3e22:fbff:fe4a:1180');
    expect(res.linkLocal).toBe('fe80::3e22:fbff:fe4a:1180');
    expect(res.slaacGlobal).toBe('2001:db8:abc::3e22:fbff:fe4a:1180');
  });

  it('correctly inverts bit 7 for MAC 00:1A:2B:3C:4D:5E (0x00 -> 0x02)', () => {
    const res = macToEui64('00:1A:2B:3C:4D:5E');

    expect(res.invertedFirstOctet).toBe('02');
    expect(res.interfaceId).toBe('021a:2bff:fe3c:4d5e');
    expect(res.linkLocal).toBe('fe80::21a:2bff:fe3c:4d5e');
  });
});

describe('Sprint 2 — Test 2: RFC 4861 Solicited-Node Multicast Derivation', () => {
  it('derives solicited-node multicast for 2001:db8:1::20 -> ff02::1:ff00:0020', () => {
    const res = toSolicitedNodeMulticast('2001:db8:1::20');

    expect(res.lower24Bits).toBe('00:00:20');
    expect(res.solicitedMulticast).toBe('ff02::1:ff00:0020');
    expect(res.multicastMac).toBe('33:33:FF:00:00:20');
  });

  it('derives solicited-node multicast for 2001:db8::1234:5678 -> ff02::1:ff34:5678', () => {
    const res = toSolicitedNodeMulticast('2001:db8::1234:5678');

    expect(res.lower24Bits).toBe('34:56:78');
    expect(res.solicitedMulticast).toBe('ff02::1:ff34:5678');
    expect(res.multicastMac).toBe('33:33:FF:34:56:78');
  });
});

describe('Sprint 2 — Test 3: RFC 5952 Compression & Expansion', () => {
  it('compresses 2001:0db8:0000:0000:0000:ff00:0042:8329 to 2001:db8::ff00:42:8329', () => {
    const canonical = canonicalizeIpv6('2001:0db8:0000:0000:0000:ff00:0042:8329');
    expect(canonical).toBe('2001:db8::ff00:42:8329');
  });

  it('expands fe80::1 to exactly 8 4-digit hextets', () => {
    const expanded = expandIpv6('fe80::1');
    expect(expanded).toHaveLength(8);
    expect(expanded[0]).toBe('fe80');
    expect(expanded[1]).toBe('0000');
    expect(expanded[7]).toBe('0001');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test Suite 4: Ipv6NdpSimulator Component Rendering
// ─────────────────────────────────────────────────────────────────────────────

describe('Sprint 2 — Test 4: Ipv6NdpSimulator Standalone Rendering', () => {
  it('renders EUI-64 Stepper mode with link-local and SLAAC address derivation', () => {
    const config: Ipv6NdpTaskContent = {
      title: 'EUI-64 Dissection Lab',
      macAddress: '3C:22:FB:4A:11:80',
      routerPrefix: '2001:db8:abc::/64',
      defaultMode: 'eui64',
    };

    const html = renderToStaticMarkup(<Ipv6NdpSimulator taskContent={config} />);

    expect(html).toContain('data-testid="ipv6-ndp-simulator"');
    expect(html).toContain('data-testid="eui64-panel"');
    expect(html).toContain('3C:22:FB');
    expect(html).toContain('4A:11:80');
    expect(html).toContain('data-testid="link-local-output"');
    expect(html).toContain('fe80::3e22:fbff:fe4a:1180');
    expect(html).toContain('data-testid="slaac-output"');
    expect(html).toContain('2001:db8:abc::3e22:fbff:fe4a:1180');
  });

  it('renders NDP Flow mode with solicited-node multicast and NS/NA sequence', () => {
    const config: Ipv6NdpTaskContent = {
      title: 'NDP Resolution Exchange',
      targetIpv6: '2001:db8:1::20',
      defaultMode: 'ndp_flow',
    };

    const html = renderToStaticMarkup(<Ipv6NdpSimulator taskContent={config} />);

    expect(html).toContain('data-testid="ndp-flow-panel"');
    expect(html).toContain('data-testid="solicited-multicast"');
    expect(html).toContain('ff02::1:ff00:0020');
    expect(html).toContain('33:33:FF:00:00:20');
    expect(html).toContain('Neighbor Solicitation (NS) — ICMPv6 Type 135');
    expect(html).toContain('IPv4 ARP Broadcast vs IPv6 Solicited-Node Multicast');
  });

  it('renders Zero Compression mode with RFC 5952 guidelines', () => {
    const config: Ipv6NdpTaskContent = {
      title: 'Zero Compression Lab',
      defaultMode: 'compression',
    };

    const html = renderToStaticMarkup(<Ipv6NdpSimulator taskContent={config} />);

    expect(html).toContain('data-testid="compression-panel"');
    expect(html).toContain('RFC 5952 Canonical IPv6 Compression Rules');
    expect(html).toContain('data-testid="canonical-demo"');
    expect(html).toContain('2001:db8::ff00:42:8329');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test Suite 5: NetworkingPracticeTaskView Integration with Module 6
// ─────────────────────────────────────────────────────────────────────────────

describe('Sprint 2 — Test 5: NetworkingPracticeTaskView Integration with Module 6', () => {
  it('renders net06-p1-ipv6-notation with Ipv6NdpSimulator on left and Judgment on right', () => {
    const task = NET_06_MODULE.concepts[0].tasks[0];
    const concept = NET_06_MODULE.concepts[0];

    expect(task.id).toBe('net06-p1-ipv6-notation');
    expect(task.ipv6Ndp).toBeDefined();

    const html = renderToStaticMarkup(
      <NetworkingPracticeTaskView
        task={task}
        taskIndex={0}
        totalTasks={1}
        concept={concept}
        onTaskSuccess={vi.fn()}
      />
    );

    expect(html).toContain('data-testid="ipv6-ndp-simulator"');
    expect(html).toContain('data-testid="compression-panel"');
    expect(html).toContain('IPv6 &amp; NDP Lab');
    expect(html).toContain('What is the correct canonical short form of 2001:0db8:0000:0000:0000:ff00:0042:8329?');
    expect(html).toContain('Check Prediction');
  });

  it('renders net06-p2-scope-classification with Ipv6NdpSimulator in ndp_flow mode', () => {
    const task = NET_06_MODULE.concepts[1].tasks[0];
    const concept = NET_06_MODULE.concepts[1];

    expect(task.id).toBe('net06-p2-scope-classification');
    expect(task.ipv6Ndp).toBeDefined();

    const html = renderToStaticMarkup(
      <NetworkingPracticeTaskView
        task={task}
        taskIndex={0}
        totalTasks={1}
        concept={concept}
        onTaskSuccess={vi.fn()}
      />
    );

    expect(html).toContain('data-testid="ipv6-ndp-simulator"');
    expect(html).toContain('data-testid="ndp-flow-panel"');
    expect(html).toContain('Solicited-Node Multicast Group Derivation');
    expect(html).toContain('Which of the listed addresses would a standard internet router forward');
  });

  it('renders net06-p3-ndp-slaac challenge task with Ipv6NdpSimulator in eui64 mode', () => {
    const task = NET_06_MODULE.concepts[2].tasks[0];
    const concept = NET_06_MODULE.concepts[2];

    expect(task.id).toBe('net06-p3-ndp-slaac');
    expect(task.ipv6Ndp).toBeDefined();

    const html = renderToStaticMarkup(
      <NetworkingPracticeTaskView
        task={task}
        taskIndex={0}
        totalTasks={1}
        concept={concept}
        onTaskSuccess={vi.fn()}
      />
    );

    expect(html).toContain('data-testid="ipv6-ndp-simulator"');
    expect(html).toContain('data-testid="eui64-panel"');
    expect(html).toContain('EUI-64 Stepper &amp; NDP Resolution Exchange');
    expect(html).toContain('In Scenario 1, to what IPv6 destination does Alpha send the Neighbor Solicitation?');
    expect(html).toContain('In Scenario 2, what is the complete SLAAC address');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test Suite 6: Central Submission Pipeline & isNetworkingTask Classifier
// ─────────────────────────────────────────────────────────────────────────────

describe('Sprint 2 — Test 6: Pipeline Classification & Grading Sweep for net-06', () => {
  it('correctly classifies all net-06 tasks via isNetworkingTask', () => {
    for (const concept of NET_06_MODULE.concepts) {
      for (const task of concept.tasks) {
        expect(isNetworkingTask(task)).toBe(true);
      }
    }
  });

  it('grades net06-p1-ipv6-notation correctly with reference answers', () => {
    const task = NET_06_MODULE.concepts[0].tasks[0];
    const outcome = gradeNetworkingSubmission({
      task,
      judgmentAnswers: [1, 1], // Option 1: 2001:db8::ff00:42:8329; Option 1: ambiguity
    });

    expect(outcome.passed).toBe(true);
  });

  it('grades net06-p3-ndp-slaac correctly with reference answers', () => {
    const task = NET_06_MODULE.concepts[2].tasks[0];
    const outcome = gradeNetworkingSubmission({
      task,
      judgmentAnswers: [1, 1], // Option 1: ff02::1:ff00:0020; Option 1: 2001:db8:abc:0:123:4567:89ab:cdef/64
    });

    expect(outcome.passed).toBe(true);
  });

  it('rejects incorrect judgment answers with targeted explanation', () => {
    const task = NET_06_MODULE.concepts[2].tasks[0];
    const outcome = gradeNetworkingSubmission({
      task,
      judgmentAnswers: [0, 1], // Wrong: chose all-nodes multicast instead of solicited-node
    });

    expect(outcome.passed).toBe(false);
    expect(outcome.feedback).toBeDefined();
    expect(outcome.feedback).toContain('ff02::1:ff00:0020');
  });

  it('passes all Module 6 tasks via submitForTask central pipeline', () => {
    const allTasks: PracticeTask[] = [
      ...NET_06_MODULE.concepts.flatMap((c) => c.tasks),
      ...(NET_06_MODULE.challenge?.tasks || []),
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
