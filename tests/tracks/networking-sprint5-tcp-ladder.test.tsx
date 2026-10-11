/**
 * Sprint 5: Module 12 — TCP Sequence & Sliding Window Ladder Tests.
 * ─────────────────────────────────────────────────────────────────────────────
 * Verifies:
 *  1. Pure TCP Byte Accounting & Fast Retransmit Trigger Helpers:
 *     - calculateNextExpectedAck: Byte math for data payloads and SYN/FIN phantom bytes.
 *     - calculateFastRetransmitTrigger: RFC 5681 3-duplicate-ACK fast retransmit threshold.
 *  2. TcpSequenceLadderSimulator standalone rendering across all scenarios:
 *     - Handshake mode: 3-way connection setup (ISN_c, ISN_s, SYN/ACK progression).
 *     - Data Flow mode: Byte stream offsets and cumulative ACKs (10,000 + 1,460 = 11,460).
 *     - Fast Retransmit mode: Dropped segment 2, 3 duplicate ACKs, fast retransmit, gap healing.
 *     - Zero Window mode: rwnd=0 buffer saturation, 1-byte persist probe, window reopening.
 *     - Teardown mode: 4-way FIN/ACK termination and 2*MSL TIME_WAIT safety callout.
 *  3. NetworkingPracticeTaskView integration with net-12 tasks:
 *     - net12-p1-ack-calculation renders TcpSequenceLadderSimulator in data flow mode.
 *     - net12-p2-flow-retransmit-eval renders in fast retransmit mode.
 *     - net12-p3-teardown-timewait renders in teardown mode.
 *     - net12-ch1-fast-retransmit-trace renders challenge packet loss forensics.
 *     - net12-ch2-timewait-exhaustion renders high-throughput socket exhaustion triage.
 *     - Status label displays "TCP Ladder Lab".
 *  4. isNetworkingTask classifier recognizes all tasks with tcpLadder property.
 *  5. Central submit pipeline evaluates all net-12 tasks with 100% precision.
 *  6. Zero regressions across the entire curriculum.
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  TcpSequenceLadderSimulator,
  calculateNextExpectedAck,
  calculateFastRetransmitTrigger,
} from '../../src/components/learning/networking/TcpSequenceLadderSimulator';
import { NetworkingPracticeTaskView } from '../../src/components/learning/networking/NetworkingPracticeTaskView';
import { NET_12_MODULE } from '../../src/content/networking/modules/net-12';
import {
  isNetworkingTask,
  gradeNetworkingSubmission,
} from '../../src/lib/network-engine/networking-submit-pipeline';
import { submitForTask } from '../../src/lib/track-submit';
import type { PracticeTask, TcpLadderTaskContent } from '../../src/types/curriculum';

// ─────────────────────────────────────────────────────────────────────────────
// Test Suite 1: Pure RFC 793 / 9293 & RFC 5681 TCP Helpers
// ─────────────────────────────────────────────────────────────────────────────

describe('Sprint 5 — Test 1: TCP Byte Accounting & Fast Retransmit Logic', () => {
  it('calculates cumulative ACK for normal data payloads without phantom bytes', () => {
    // Seq 10,000 + 1,460 bytes payload -> next expected is byte 11,460
    const ack = calculateNextExpectedAck(10000, 1460, false);
    expect(ack).toBe(11460);
  });

  it('consumes 1 phantom sequence number for SYN and FIN control flags', () => {
    // Client SYN: Seq 1000, 0 payload -> ACK is 1001
    const synAck = calculateNextExpectedAck(1000, 0, true);
    expect(synAck).toBe(1001);

    // FIN: Seq 20000, 0 payload -> ACK is 20001
    const finAck = calculateNextExpectedAck(20000, 0, true);
    expect(finAck).toBe(20001);
  });

  it('evaluates RFC 5681 Fast Retransmit threshold accurately', () => {
    const zero = calculateFastRetransmitTrigger(0);
    expect(zero.isTriggered).toBe(false);
    expect(zero.remainingToTrigger).toBe(3);

    const two = calculateFastRetransmitTrigger(2);
    expect(two.isTriggered).toBe(false);
    expect(two.remainingToTrigger).toBe(1);

    const three = calculateFastRetransmitTrigger(3);
    expect(three.isTriggered).toBe(true);
    expect(three.remainingToTrigger).toBe(0);
    expect(three.status).toContain('FAST RETRANSMIT TRIGGERED');

    const four = calculateFastRetransmitTrigger(4);
    expect(four.isTriggered).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test Suite 2: TcpSequenceLadderSimulator Standalone Rendering
// ─────────────────────────────────────────────────────────────────────────────

describe('Sprint 5 — Test 2: TcpSequenceLadderSimulator Standalone Rendering', () => {
  it('renders 3-Way Handshake mode with SYN, SYN+ACK, and ACK segments', () => {
    const config: TcpLadderTaskContent = {
      title: 'TCP Handshake Lab',
      clientIsn: 1000,
      serverIsn: 5000,
      defaultScenario: 'handshake',
    };

    const html = renderToStaticMarkup(<TcpSequenceLadderSimulator taskContent={config} />);

    expect(html).toContain('data-testid="tcp-sequence-ladder-simulator"');
    expect(html).toContain('Client (192.168.1.100)');
    expect(html).toContain('Server (93.184.216.34)');
    expect(html).toContain('Seq=1000');
    expect(html).toContain('Ack=1001');
    expect(html).toContain('Seq=5000');
    expect(html).toContain('Ack=5001');
    expect(html).toContain('Connection ESTABLISHED');
  });

  it('renders Data Flow mode with byte offset sequence accounting', () => {
    const config: TcpLadderTaskContent = {
      title: 'TCP Byte Stream Math',
      defaultScenario: 'data_flow',
    };

    const html = renderToStaticMarkup(<TcpSequenceLadderSimulator taskContent={config} />);

    expect(html).toContain('Seq=10000');
    expect(html).toContain('Len=1460B');
    expect(html).toContain('Ack=11460');
    expect(html).toContain('Seq=11460');
    expect(html).toContain('Ack=12920');
  });

  it('renders Fast Retransmit mode with dropped packet, 3 dup ACKs, and retransmit', () => {
    const config: TcpLadderTaskContent = {
      title: 'Packet Loss Recovery Lab',
      defaultScenario: 'fast_retransmit',
    };

    const html = renderToStaticMarkup(<TcpSequenceLadderSimulator taskContent={config} />);

    expect(html).toContain('data-testid="toggle-drop-btn"');
    expect(html).toContain('Packet State: DROPPED (Loss)');
    expect(html).toContain('[DROPPED IN TRANSIT]');
    expect(html).toContain('Server Duplicate ACK #1');
    expect(html).toContain('Server Duplicate ACK #2');
    expect(html).toContain('Server Duplicate ACK #3');
    expect(html).toContain('FAST RETRANSMIT: Client resends Seg 2');
    expect(html).toContain('Ack=6000');
  });

  it('renders Zero Window mode with persist timer and window updates', () => {
    const config: TcpLadderTaskContent = {
      title: 'Flow Control Zero Window Lab',
      defaultScenario: 'zero_window',
    };

    const html = renderToStaticMarkup(<TcpSequenceLadderSimulator taskContent={config} />);

    expect(html).toContain('rwnd=0');
    expect(html).toContain('Client Zero Window Probe');
    expect(html).toContain('Len=1B');
    expect(html).toContain('rwnd=64240');
  });

  it('renders Teardown mode with 4-way termination and 2*MSL TIME_WAIT safety callout', () => {
    const config: TcpLadderTaskContent = {
      title: 'TCP Teardown & TIME_WAIT Lab',
      defaultScenario: 'teardown',
    };

    const html = renderToStaticMarkup(<TcpSequenceLadderSimulator taskContent={config} />);

    expect(html).toContain('FIN');
    expect(html).toContain('FIN_WAIT_1');
    expect(html).toContain('CLOSE_WAIT');
    expect(html).toContain('data-testid="timewait-callout"');
    expect(html).toContain('TIME_WAIT Safety Duration (2 * MSL = 60–120 seconds)');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test Suite 3: NetworkingPracticeTaskView Split-Pane Integration
// ─────────────────────────────────────────────────────────────────────────────

describe('Sprint 5 — Test 3: NetworkingPracticeTaskView Integration with net-12 Tasks', () => {
  it('renders net12-p1-ack-calculation with TCP Ladder Lab badge and data flow view', () => {
    const task = NET_12_MODULE.concepts[0].tasks[0];
    const concept = NET_12_MODULE.concepts[0];

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
    expect(html).toContain('TCP Ladder Lab');
    expect(html).toContain('data-testid="tcp-sequence-ladder-simulator"');
    expect(html).toContain('Byte Offsets &amp; Cumulative Acknowledgments');
  });

  it('renders net12-p2-flow-retransmit-eval with fast retransmit simulator', () => {
    const task = NET_12_MODULE.concepts[1].tasks[0];
    const concept = NET_12_MODULE.concepts[1];

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

    expect(html).toContain('data-testid="tcp-sequence-ladder-simulator"');
    expect(html).toContain('Flow Control (rwnd) &amp; Fast Retransmit');
    expect(html).toContain('data-testid="toggle-drop-btn"');
  });

  it('renders net12-p3-teardown-timewait with teardown simulator and TIME_WAIT box', () => {
    const task = NET_12_MODULE.concepts[2].tasks[0];
    const concept = NET_12_MODULE.concepts[2];

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

    expect(html).toContain('data-testid="tcp-sequence-ladder-simulator"');
    expect(html).toContain('4-Way Teardown &amp; TIME_WAIT Semantics');
    expect(html).toContain('data-testid="timewait-callout"');
  });

  it('renders net12-ch1-fast-retransmit-trace challenge task with packet drop diagnostics', () => {
    const task = NET_12_MODULE.challenge!.tasks[0];

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
    expect(html).toContain('data-testid="tcp-sequence-ladder-simulator"');
    expect(html).toContain('Packet Loss &amp; Fast Retransmit Accounting');
  });

  it('renders net12-ch2-timewait-exhaustion challenge task with teardown socket telemetry', () => {
    const task = NET_12_MODULE.challenge!.tasks[1];

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

    expect(html).toContain('Mastery Challenge');
    expect(html).toContain('data-testid="tcp-sequence-ladder-simulator"');
    expect(html).toContain('High-Throughput TIME_WAIT Socket Exhaustion');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test Suite 4: Task Classification & Submission Pipeline
// ─────────────────────────────────────────────────────────────────────────────

describe('Sprint 5 — Test 4: Task Classification & Submission Pipeline', () => {
  it('correctly classifies all net-12 tasks via isNetworkingTask', () => {
    const allTasks: PracticeTask[] = [
      ...NET_12_MODULE.concepts.flatMap((c) => c.tasks),
      ...(NET_12_MODULE.challenge?.tasks || []),
    ];

    expect(allTasks.length).toBe(5);

    for (const task of allTasks) {
      expect(isNetworkingTask(task)).toBe(true);
    }
  });

  it('grades net12-p1-ack-calculation correctly with reference answers', () => {
    const task = NET_12_MODULE.concepts[0].tasks[0];
    const outcome = gradeNetworkingSubmission({
      task,
      judgmentAnswers: [1, 1], // Option 1: 11,460; Option 1: ACK 1001 cumulative gap
    });

    expect(outcome.passed).toBe(true);
  });

  it('grades net12-p2-flow-retransmit-eval correctly with reference answers', () => {
    const task = NET_12_MODULE.concepts[1].tasks[0];
    const outcome = gradeNetworkingSubmission({
      task,
      judgmentAnswers: [1, 0], // Option 1: application buffer full; Option 0: arrival of 3 duplicate ACKs
    });

    expect(outcome.passed).toBe(true);
  });

  it('grades net12-p3-teardown-timewait correctly with reference answers', () => {
    const task = NET_12_MODULE.concepts[2].tasks[0];
    const outcome = gradeNetworkingSubmission({
      task,
      judgmentAnswers: [1, 1], // Option 1: TCP is full duplex; Option 1: old delayed duplicate segments data corruption
    });

    expect(outcome.passed).toBe(true);
  });

  it('grades net12-ch1-fast-retransmit-trace challenge task correctly', () => {
    const task = NET_12_MODULE.challenge!.tasks[0];
    const outcome = gradeNetworkingSubmission({
      task,
      judgmentAnswers: [1], // Option 1: Both carry ACK 2000
    });

    expect(outcome.passed).toBe(true);
  });

  it('grades net12-ch2-timewait-exhaustion challenge task correctly', () => {
    const task = NET_12_MODULE.challenge!.tasks[1];
    const outcome = gradeNetworkingSubmission({
      task,
      judgmentAnswers: [1], // Option 1: sockets accumulated in TIME_WAIT exhausting ephemeral port pool
    });

    expect(outcome.passed).toBe(true);
  });

  it('rejects incorrect judgment answers with targeted explanation', () => {
    const task = NET_12_MODULE.concepts[1].tasks[0];
    const outcome = gradeNetworkingSubmission({
      task,
      judgmentAnswers: [0, 0], // Wrong on question 1
    });

    expect(outcome.passed).toBe(false);
    expect(outcome.feedback).toBeDefined();
    expect(outcome.feedback).toContain('buffer');
  });

  it('passes all Module 12 tasks via submitForTask central pipeline', () => {
    const allTasks: PracticeTask[] = [
      ...NET_12_MODULE.concepts.flatMap((c) => c.tasks),
      ...(NET_12_MODULE.challenge?.tasks || []),
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
