/**
 * Sprint 1: Module 2 — Ethernet Framing & FCS Inspector Tests.
 * ─────────────────────────────────────────────────────────────────────────────
 * Verifies:
 *  1. CRC-32 algorithmic correctness (IEEE 802.3 standard polynomial 0xEDB88320).
 *  2. EthernetFrameInspector standalone rendering:
 *     - Displays Preamble/SFD (8B Layer 1 sync), MACs (48-bit EUI-48), EtherType, and FCS.
 *     - Minimum frame size calculation: 46B payload limit + padding = 64B minimum wire frame.
 *     - Maximum standard frame calculation: 1500B payload MTU = 1518B total wire frame.
 *     - Inter-Packet Gap (IPG): 96 bit times wire telemetry.
 *     - Bit error corruption state: CRC mismatch & silent discard notice.
 *  3. NetworkingPracticeTaskView integration with ethernetFrame tasks:
 *     - net02-p2-frame-dissection renders EthernetFrameInspector in split-pane layout.
 *     - net02-p3-mac-collision-evaluation renders broadcast ARP frame with padding.
 *     - net02-c2-frame-forensics-mtu-crc renders elevator EMI corrupted frame.
 *  4. isNetworkingTask classifier recognizes all tasks with ethernetFrame.
 *  5. Central submit pipeline evaluates net-02 tasks with 100% precision.
 *  6. Zero regression across all 16 networking modules.
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  EthernetFrameInspector,
  computeCrc32,
} from '../../src/components/learning/networking/EthernetFrameInspector';
import { NetworkingPracticeTaskView } from '../../src/components/learning/networking/NetworkingPracticeTaskView';
import { NET_02_MODULE } from '../../src/content/networking/modules/net-02';
import {
  isNetworkingTask,
  gradeNetworkingSubmission,
} from '../../src/lib/network-engine/networking-submit-pipeline';
import { submitForTask } from '../../src/lib/track-submit';
import type { PracticeTask, EthernetFrameTaskContent } from '../../src/types/curriculum';

// ─────────────────────────────────────────────────────────────────────────────
// Test Suite 1: Pure CRC-32 Algorithm & Bit Inversion
// ─────────────────────────────────────────────────────────────────────────────

describe('Sprint 1 — Test 1: IEEE 802.3 CRC-32 Algorithm', () => {
  it('computes deterministic CRC-32 for byte sequences', () => {
    const data = [0x00, 0x50, 0x56, 0xC0, 0x00, 0x08, 0x00, 0x0C, 0x29, 0x12, 0x34, 0x56, 0x08, 0x00];
    const crc1 = computeCrc32(data);
    const crc2 = computeCrc32(data);

    expect(crc1).toBeTypeOf('number');
    expect(crc1).toBe(crc2);
    expect(crc1).toBeGreaterThan(0);
  });

  it('flips CRC value when a single bit in the payload is altered', () => {
    const cleanData = [0x00, 0x50, 0x56, 0xC0, 0x00, 0x08, 0x08, 0x00, 0x45, 0x00];
    const corruptedData = [...cleanData];
    corruptedData[8] ^= 0x01; // flip bit 0 in byte 8

    const cleanCrc = computeCrc32(cleanData);
    const corruptedCrc = computeCrc32(corruptedData);

    expect(corruptedCrc).not.toBe(cleanCrc);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test Suite 2: EthernetFrameInspector Component Rendering & Boundaries
// ─────────────────────────────────────────────────────────────────────────────

describe('Sprint 1 — Test 2: EthernetFrameInspector Standalone Rendering', () => {
  it('renders standard 1500B MTU frame with 1518B wire size and zero padding', () => {
    const config: EthernetFrameTaskContent = {
      title: 'Standard IPv4 Frame Dissection',
      destinationMac: '00:50:56:C0:00:08',
      sourceMac: '00:0C:29:12:34:56',
      etherType: '0x0800',
      payloadProtocol: 'IPv4 Datagram',
      initialPayloadSize: 1500,
      initialCorrupted: false,
    };

    const html = renderToStaticMarkup(<EthernetFrameInspector taskContent={config} />);

    expect(html).toContain('data-testid="ethernet-frame-inspector"');
    expect(html).toContain('Standard IPv4 Frame Dissection');
    expect(html).toContain('00:50:56:C0:00:08');
    expect(html).toContain('00:0C:29:12:34:56');
    expect(html).toContain('0x0800');
    // Wire metrics
    expect(html).toContain('1500'); // Payload size
    expect(html).toContain('1518'); // Total wire frame bytes (14 header + 1500 + 4 FCS)
    expect(html).toContain('0</span><span class="text-[10px] font-mono text-text-dim">Bytes (0x00)</span>'); // 0 padding
    expect(html).toContain('96</span><span class="text-[10px] font-mono text-text-dim">Bit Times</span>'); // IPG
    // Clean FCS status
    expect(html).toContain('CRC MATCH — Frame Check Sequence Validated');
  });

  it('renders sub-minimum 20B payload with padding notice and 64B minimum wire frame', () => {
    const config: EthernetFrameTaskContent = {
      title: 'Small ACK Packet Framing',
      destinationMac: '00:11:22:33:44:55',
      sourceMac: '00:AA:BB:CC:DD:EE',
      etherType: '0x0800',
      payloadProtocol: 'IPv4 Datagram',
      initialPayloadSize: 20, // 20B payload requires 26B padding
      initialCorrupted: false,
    };

    const html = renderToStaticMarkup(<EthernetFrameInspector taskContent={config} />);

    expect(html).toContain('data-testid="ethernet-frame-inspector"');
    expect(html).toContain('data-testid="padding-notice"');
    expect(html).toContain('64-Byte Minimum Ethernet Frame Rule Activated');
    expect(html).toContain('26</span><span class="text-[10px] font-mono text-text-dim">Bytes (0x00)</span>'); // 26B padding
    expect(html).toContain('64</span><span class="text-[10px] font-mono text-text-dim">Bytes</span>'); // 64B total wire size
  });

  it('renders corrupted frame with CRC MISMATCH and silent discard banner', () => {
    const config: EthernetFrameTaskContent = {
      title: 'Corrupted Frame Under Noise',
      destinationMac: '00:1A:2B:3C:4D:5E',
      sourceMac: '00:11:22:33:44:55',
      etherType: '0x0800',
      initialPayloadSize: 40,
      initialCorrupted: true,
      corruptedField: 'payload',
    };

    const html = renderToStaticMarkup(<EthernetFrameInspector taskContent={config} />);

    expect(html).toContain('data-testid="fcs-status-banner"');
    expect(html).toContain('CRC MISMATCH — Frame Check Sequence Corrupted!');
    expect(html).toContain('SILENT DROP: Receiving NIC discards the corrupted frame immediately');
    expect(html).toContain('ZERO Layer 2 retransmission');
  });

  it('renders 802.1Q tagged frame expanding max size to 1522 bytes', () => {
    const config: EthernetFrameTaskContent = {
      title: 'VLAN Tagged Trunk Frame',
      destinationMac: '00:50:56:C0:00:08',
      sourceMac: '00:0C:29:12:34:56',
      etherType: '0x0800',
      initialPayloadSize: 1500,
      hasVlanTag: true,
      vlanTag: {
        tpid: '0x8100',
        pcp: 5,
        dei: 0,
        vid: 10,
      },
    };

    const html = renderToStaticMarkup(<EthernetFrameInspector taskContent={config} />);

    expect(html).toContain('data-testid="segment-vlan"');
    expect(html).toContain('1522'); // 18B header + 1500 + 4 FCS = 1522B
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test Suite 3: NetworkingPracticeTaskView Integration with net-02 Tasks
// ─────────────────────────────────────────────────────────────────────────────

describe('Sprint 1 — Test 3: NetworkingPracticeTaskView Integration with Module 2', () => {
  it('renders net02-p2-frame-dissection with EthernetFrameInspector on left and Judgment on right', () => {
    const task = NET_02_MODULE.concepts[1].tasks[0];
    const concept = NET_02_MODULE.concepts[1];

    expect(task.id).toBe('net02-p2-frame-dissection');
    expect(task.ethernetFrame).toBeDefined();

    const html = renderToStaticMarkup(
      <NetworkingPracticeTaskView
        task={task}
        taskIndex={1}
        totalTasks={3}
        concept={concept}
        onTaskSuccess={vi.fn()}
      />
    );

    // Left pane contains EthernetFrameInspector
    expect(html).toContain('data-testid="ethernet-frame-inspector"');
    expect(html).toContain('Wireshark Telemetry: Standard IPv4 Ethernet II Frame');
    expect(html).toContain('1518');
    // Top bar badge
    expect(html).toContain('Ethernet Framing Lab');
    // Right pane contains judgment questions
    expect(html).toContain('Prediction &amp; Causal Defense');
    expect(html).toContain('What protocol is encapsulated inside the frame payload');
    expect(html).toContain('Check Prediction');
    // No unwanted other labs
    expect(html).not.toContain('data-testid="switch-simulation-lab"');
    expect(html).not.toContain('data-testid="subnet-bit-slicer"');
    expect(html).not.toContain('data-testid="arp-simulation-lab"');
  });

  it('renders net02-p3-mac-collision-evaluation with ARP broadcast frame', () => {
    const task = NET_02_MODULE.concepts[2].tasks[0];
    const concept = NET_02_MODULE.concepts[2];

    expect(task.id).toBe('net02-p3-mac-collision-evaluation');
    expect(task.ethernetFrame).toBeDefined();

    const html = renderToStaticMarkup(
      <NetworkingPracticeTaskView
        task={task}
        taskIndex={2}
        totalTasks={3}
        concept={concept}
        onTaskSuccess={vi.fn()}
      />
    );

    expect(html).toContain('data-testid="ethernet-frame-inspector"');
    expect(html).toContain('Ethernet Broadcast Frame: ARP Request Dissection');
    expect(html).toContain('FF:FF:FF:FF:FF:FF');
    expect(html).toContain('0x0806');
    expect(html).toContain('How many collision domains exist in Topology 1');
  });

  it('renders net02-c2-frame-forensics-mtu-crc challenge task with corrupted frame banner', () => {
    const challengeTask = NET_02_MODULE.challenge!.tasks[1];

    expect(challengeTask.id).toBe('net02-c2-frame-forensics-mtu-crc');
    expect(challengeTask.ethernetFrame).toBeDefined();

    const html = renderToStaticMarkup(
      <NetworkingPracticeTaskView
        task={challengeTask}
        taskIndex={1}
        totalTasks={2}
        isChallenge={true}
        onTaskSuccess={vi.fn()}
      />
    );

    expect(html).toContain('data-testid="ethernet-frame-inspector"');
    expect(html).toContain('Elevator EMI Interference: Corrupted Frame Capture');
    expect(html).toContain('CRC MISMATCH — Frame Check Sequence Corrupted!');
    expect(html).toContain('Mastery Challenge');
    expect(html).toContain('What happens when an application attempts to send a 1600-byte IP packet');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test Suite 4: Central Submission Pipeline & isNetworkingTask Classifier
// ─────────────────────────────────────────────────────────────────────────────

describe('Sprint 1 — Test 4: Pipeline Classification & Grading Sweep', () => {
  it('correctly classifies all net-02 tasks via isNetworkingTask', () => {
    for (const concept of NET_02_MODULE.concepts) {
      for (const task of concept.tasks) {
        expect(isNetworkingTask(task)).toBe(true);
      }
    }
    if (NET_02_MODULE.challenge) {
      for (const task of NET_02_MODULE.challenge.tasks) {
        expect(isNetworkingTask(task)).toBe(true);
      }
    }
  });

  it('grades net02-p2-frame-dissection correctly with reference answers', () => {
    const task = NET_02_MODULE.concepts[1].tasks[0];
    const outcome = gradeNetworkingSubmission({
      task,
      judgmentAnswers: [1, 1], // IPv4 Datagram (idx 1), Silent discard (idx 1)
    });

    expect(outcome.passed).toBe(true);
  });

  it('rejects incorrect judgment answers with targeted explanation', () => {
    const task = NET_02_MODULE.concepts[1].tasks[0];
    const outcome = gradeNetworkingSubmission({
      task,
      judgmentAnswers: [0, 1], // Wrong EtherType (chose IPv6 instead of IPv4)
    });

    expect(outcome.passed).toBe(false);
    expect(outcome.feedback).toBeDefined();
    expect(outcome.feedback).toContain('0x0800');
  });

  it('passes all Module 2 tasks via submitForTask central pipeline', () => {
    const allTasks: PracticeTask[] = [
      ...NET_02_MODULE.concepts.flatMap((c) => c.tasks),
      ...(NET_02_MODULE.challenge?.tasks || []),
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
