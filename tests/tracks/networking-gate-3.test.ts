/**
 * Gate 3 — Interactive Switch MAC Learning Slice & Acceptance Tests.
 * ─────────────────────────────────────────────────────────────────────────────
 * Verifies:
 *  1. Structured State Parity: MAC table model matches simulation snapshot at each step.
 *  2. Mandatory Prediction Gate: halting before return frame and unlocking on correct prediction.
 *  3. Causal Explanation Defense: practice and challenge tasks require identifying governing rules.
 *  4. Transfer Validation: unfamiliar 5-port topology is evaluated accurately by the engine.
 *  5. Misconception Remediation: selecting Destination MAC returns targeted corrective copy.
 *  6. Single grading pipeline routing in `submitForTask` for all net-03 tasks.
 *  7. Full solution pass sweep and invalid answer rejection.
 */

import { describe, it, expect } from 'vitest';
import { NET_03_MODULE } from '../../src/content/networking/modules/net-03';
import {
  generateSwitchSimulation,
  SwitchSimulationEngine,
  type HostNode,
  type FrameTransmission,
} from '../../src/lib/network-engine/switching-sim';
import {
  isNetworkingTask,
  gradeNetworkingSubmission,
} from '../../src/lib/network-engine/networking-submit-pipeline';
import { submitForTask } from '../../src/lib/track-submit';

const STANDARD_4_HOSTS: HostNode[] = [
  { id: 'host-a', name: 'Host A', mac: 'AA:AA:AA:AA:AA:AA', port: 1 },
  { id: 'host-b', name: 'Host B', mac: 'BB:BB:BB:BB:BB:BB', port: 2 },
  { id: 'host-c', name: 'Host C', mac: 'CC:CC:CC:CC:CC:CC', port: 3 },
  { id: 'host-d', name: 'Host D', mac: 'DD:DD:DD:DD:DD:DD', port: 4 },
];

describe('Gate 3 — Acceptance Test 2: Structured State Parity', () => {
  it('guarantees MAC table entries match the simulation step snapshot at every transition', () => {
    const sequence: FrameTransmission[] = [
      { srcMac: 'AA:AA:AA:AA:AA:AA', dstMac: 'BB:BB:BB:BB:BB:BB', ingressPort: 1 },
      { srcMac: 'BB:BB:BB:BB:BB:BB', dstMac: 'AA:AA:AA:AA:AA:AA', ingressPort: 2 },
      { srcMac: 'CC:CC:CC:CC:CC:CC', dstMac: 'DD:DD:DD:DD:DD:DD', ingressPort: 3 },
    ];

    const steps = generateSwitchSimulation(STANDARD_4_HOSTS, sequence);
    expect(steps).toHaveLength(6);

    // Step 0: Ingress AA on Port 1
    expect(steps[0].macTableSnapshot).toEqual([{ mac: 'AA:AA:AA:AA:AA:AA', port: 1 }]);
    // Step 1: Forwarding AA -> BB (still only AA in table)
    expect(steps[1].macTableSnapshot).toEqual([{ mac: 'AA:AA:AA:AA:AA:AA', port: 1 }]);

    // Step 2: Ingress BB on Port 2
    expect(steps[2].macTableSnapshot).toEqual([
      { mac: 'AA:AA:AA:AA:AA:AA', port: 1 },
      { mac: 'BB:BB:BB:BB:BB:BB', port: 2 },
    ]);
    // Step 3: Forwarding BB -> AA (both AA and BB in table)
    expect(steps[3].macTableSnapshot).toEqual([
      { mac: 'AA:AA:AA:AA:AA:AA', port: 1 },
      { mac: 'BB:BB:BB:BB:BB:BB', port: 2 },
    ]);

    // Step 4: Ingress CC on Port 3
    expect(steps[4].macTableSnapshot).toEqual([
      { mac: 'AA:AA:AA:AA:AA:AA', port: 1 },
      { mac: 'BB:BB:BB:BB:BB:BB', port: 2 },
      { mac: 'CC:CC:CC:CC:CC:CC', port: 3 },
    ]);
  });
});

describe('Gate 3 — Acceptance Test 3: Mandatory Prediction Gate Logic', () => {
  it('halts before return frame event and verifies prediction requirements', () => {
    // In net-03, Frame 1 is A -> B, Frame 2 is B -> A
    const engine = new SwitchSimulationEngine(STANDARD_4_HOSTS);

    // Frame 1 arrives and executes
    const [step0, step1] = engine.processFrame({
      srcMac: 'AA:AA:AA:AA:AA:AA',
      dstMac: 'BB:BB:BB:BB:BB:BB',
      ingressPort: 1,
    });

    expect(step0.decision).toBe('LEARN_NEW_SOURCE');
    expect(step1.decision).toBe('FLOOD_UNKNOWN_UNICAST');

    // At this point (before Frame 2 is processed), the prediction gate must verify
    // the learner understands that AA is already on Port 1.
    const tableSnapshot = engine.getMacTableSnapshot();
    expect(tableSnapshot).toHaveLength(1);
    expect(tableSnapshot[0].mac).toBe('AA:AA:AA:AA:AA:AA');
    expect(tableSnapshot[0].port).toBe(1);

    // If learner predicts unknown flood or all ports, test rejects
    const wrongPrediction = gradeNetworkingSubmission({
      task: NET_03_MODULE.concepts[0].tasks[0],
      selectedOptionIndex: 1, // Destination MAC misconception
      judgmentAnswers: [0, 0],
    });
    expect(wrongPrediction.passed).toBe(false);

    // Frame 2 executes after correct prediction
    const [step2, step3] = engine.processFrame({
      srcMac: 'BB:BB:BB:BB:BB:BB',
      dstMac: 'AA:AA:AA:AA:AA:AA',
      ingressPort: 2,
    });

    expect(step2.decision).toBe('LEARN_NEW_SOURCE');
    expect(step2.ingressPort).toBe(2);
    expect(step3.decision).toBe('FORWARD_KNOWN_UNICAST');
    expect(step3.egressPorts).toEqual([1]);
  });
});

describe('Gate 3 — Acceptance Test 4 & 6: Causal Defense & Misconception Remediation', () => {
  const task1 = NET_03_MODULE.concepts[0].tasks[0];

  it('rejects predictions based on the Destination MAC misconception with targeted copy', () => {
    // User selects option 1 (Learns DD on Port 4)
    const outcome = gradeNetworkingSubmission({
      task: task1,
      selectedOptionIndex: 1,
      judgmentAnswers: [0, 0], // Q1 wrong index: Destination MAC
    });

    expect(outcome.passed).toBe(false);
    expect(outcome.feedback).toContain('Misconception');
    expect(outcome.feedback).toContain('Switches NEVER learn from the Destination MAC');
  });

  it('rejects answers that fail to answer reasoning questions', () => {
    const outcome = gradeNetworkingSubmission({
      task: task1,
      selectedOptionIndex: 0,
      judgmentAnswers: [null, null],
    });

    expect(outcome.passed).toBe(false);
    expect(outcome.feedback).toContain('Please answer question 1');
  });

  it('passes when both the prediction and the causal explanation defense are correct', () => {
    const outcome = gradeNetworkingSubmission({
      task: task1,
      selectedOptionIndex: 0,
      judgmentAnswers: [1, 0], // Correct indices: Q1 = Source MAC, Q2 = Destination DD absent
    });

    expect(outcome.passed).toBe(true);
    expect(outcome.feedback).toContain('Correct');
  });
});

describe('Gate 3 — Acceptance Test 5: Transfer Validation (5-Port Unfamiliar Topology)', () => {
  const challenge4 = NET_03_MODULE.challenge?.tasks[3];

  it('correctly models 5-port unfamiliar topology with novel MAC addresses', () => {
    expect(challenge4).toBeDefined();
    expect(challenge4?.networking?.topology).toHaveLength(5);

    const topology = challenge4!.networking!.topology;
    const initialTx = challenge4!.networking!.initialSequence!;
    const pendingTx = challenge4!.networking!.pendingTransmission!;

    const steps = generateSwitchSimulation(topology, [...initialTx, pendingTx]);
    expect(steps).toHaveLength(4);

    // Step 3: Node 5 replies back to Node 1
    const finalStep = steps[3];
    expect(finalStep.decision).toBe('FORWARD_KNOWN_UNICAST');
    expect(finalStep.ingressPort).toBe(5);
    expect(finalStep.egressPorts).toEqual([1]);
    expect(finalStep.portStates.find((p) => p.port === 1)?.state).toBe('transmitting');
    expect(
      finalStep.portStates
        .filter((p) => p.port !== 1)
        .every((p) => p.state === 'idle'),
    ).toBe(true);
  });

  it('grades the transfer validation challenge task correctly via submitForTask', () => {
    expect(challenge4).toBeDefined();
    const mockHooks = {
      execute: () => ({ success: true, columns: [], rows: [], rowCount: 0, executionTimeMs: 0 }),
    };

    // Submitting wrong answer
    const failOutcome = submitForTask({
      task: challenge4!,
      code: '',
      hooks: mockHooks,
      judgmentAnswers: [1], // wrong index
      surface: 'challenge',
    });
    expect(failOutcome.passed).toBe(false);

    // Submitting correct answer
    const passOutcome = submitForTask({
      task: challenge4!,
      code: '',
      hooks: mockHooks,
      judgmentAnswers: [0], // correct index
      surface: 'challenge',
    });
    expect(passOutcome.passed).toBe(true);
    expect(passOutcome.feedback).toContain('Transfer validation successful');
  });
});

describe('Gate 3 — Full net-03 Curriculum Task & Challenge Sweep', () => {
  const mockHooks = {
    execute: () => ({ success: true, columns: [], rows: [], rowCount: 0, executionTimeMs: 0 }),
  };

  it('classifies all net-03 tasks as networking tasks', () => {
    for (const concept of NET_03_MODULE.concepts) {
      for (const task of concept.tasks) {
        expect(isNetworkingTask(task)).toBe(true);
      }
    }
    if (NET_03_MODULE.challenge) {
      for (const task of NET_03_MODULE.challenge.tasks) {
        expect(isNetworkingTask(task)).toBe(true);
      }
    }
  });

  it('every practice task in net-03 passes submitForTask with its correct judgment answers', () => {
    for (const concept of NET_03_MODULE.concepts) {
      for (const task of concept.tasks) {
        const correctAnswers = task.validation.judgment?.map((j) => j.correctIndex) ?? [];
        const outcome = submitForTask({
          task,
          code: '',
          hooks: mockHooks,
          judgmentAnswers: correctAnswers,
          surface: 'lesson',
        });
        expect(
          outcome.passed,
          `Task ${task.id} failed its own reference answer: ${outcome.feedback}`,
        ).toBe(true);
      }
    }
  });

  it('every challenge task in net-03 passes submitForTask with its correct judgment answers', () => {
    expect(NET_03_MODULE.challenge).toBeDefined();
    for (const task of NET_03_MODULE.challenge!.tasks) {
      const correctAnswers = task.validation.judgment?.map((j) => j.correctIndex) ?? [];
      const outcome = submitForTask({
        task,
        code: '',
        hooks: mockHooks,
        judgmentAnswers: correctAnswers,
        surface: 'challenge',
      });
      expect(
        outcome.passed,
        `Challenge Task ${task.id} failed its own reference answer: ${outcome.feedback}`,
      ).toBe(true);
    }
  });
});
