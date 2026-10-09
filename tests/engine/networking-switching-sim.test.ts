/**
 * Gate 2 — Unit tests for the Lean Switching Simulation Engine.
 * ─────────────────────────────────────────────────────────────────────────────
 * Verifies:
 *  1. Protocol correctness and coverage of all 7 SwitchDecision variants:
 *     - LEARN_NEW_SOURCE
 *     - REFRESH_SOURCE
 *     - MOVE_SOURCE
 *     - FLOOD_BROADCAST
 *     - FLOOD_UNKNOWN_UNICAST
 *     - FORWARD_KNOWN_UNICAST
 *     - FILTER_SAME_PORT
 *  2. Granular ordered transitions (source_evaluation followed by forwarding_action).
 *  3. Invariant state snapshots (immutable MAC table and port states at each step).
 *  4. 5-port unfamiliar topology resilience (Transfer Validation).
 *  5. Pure replayability with zero side-effects.
 */

import { describe, it, expect } from 'vitest';
import {
  generateSwitchSimulation,
  SwitchSimulationEngine,
  normalizeMac,
  isBroadcastMac,
  BROADCAST_MAC,
  type HostNode,
  type FrameTransmission,
  type SwitchDecision,
} from '../../src/lib/network-engine/switching-sim';

const STANDARD_4_HOSTS: HostNode[] = [
  { id: 'host-a', name: 'Host A', mac: 'AA:AA:AA:AA:AA:AA', port: 1 },
  { id: 'host-b', name: 'Host B', mac: 'BB:BB:BB:BB:BB:BB', port: 2 },
  { id: 'host-c', name: 'Host C', mac: 'CC:CC:CC:CC:CC:CC', port: 3 },
  { id: 'host-d', name: 'Host D', mac: 'DD:DD:DD:DD:DD:DD', port: 4 },
];

describe('Gate 2 — MAC address normalization & helpers', () => {
  it('normalizes MAC addresses to uppercase colon-separated format', () => {
    expect(normalizeMac('aa:bb:cc:dd:ee:ff')).toBe('AA:BB:CC:DD:EE:FF');
    expect(normalizeMac('AA-BB-CC-DD-EE-FF')).toBe('AA:BB:CC:DD:EE:FF');
    expect(normalizeMac('  aa-bb-cc-dd-ee-ff  ')).toBe('AA:BB:CC:DD:EE:FF');
  });

  it('detects broadcast address accurately', () => {
    expect(isBroadcastMac('FF:FF:FF:FF:FF:FF')).toBe(true);
    expect(isBroadcastMac('ff:ff:ff:ff:ff:ff')).toBe(true);
    expect(isBroadcastMac('ff-ff-ff-ff-ff-ff')).toBe(true);
    expect(isBroadcastMac('AA:BB:CC:DD:EE:FF')).toBe(false);
  });
});

describe('Gate 2 — All 7 SwitchDecision variants coverage', () => {
  it('Scenario 1: Cold start -> LEARN_NEW_SOURCE & FLOOD_UNKNOWN_UNICAST', () => {
    const sequence: FrameTransmission[] = [
      {
        srcMac: 'AA:AA:AA:AA:AA:AA',
        dstMac: 'BB:BB:BB:BB:BB:BB',
        ingressPort: 1,
      },
    ];

    const steps = generateSwitchSimulation(STANDARD_4_HOSTS, sequence);
    expect(steps).toHaveLength(2);

    // Transition 1: Source evaluation
    const step0 = steps[0];
    expect(step0.phase).toBe('source_evaluation');
    expect(step0.decision).toBe('LEARN_NEW_SOURCE');
    expect(step0.ingressPort).toBe(1);
    expect(step0.egressPorts).toEqual([]);
    expect(step0.macTableSnapshot).toEqual([{ mac: 'AA:AA:AA:AA:AA:AA', port: 1 }]);
    expect(step0.portStates.find((p) => p.port === 1)?.state).toBe('accepted');
    expect(step0.portStates.filter((p) => p.port !== 1).every((p) => p.state === 'idle')).toBe(
      true,
    );

    // Transition 2: Destination lookup & egress action
    const step1 = steps[1];
    expect(step1.phase).toBe('forwarding_action');
    expect(step1.decision).toBe('FLOOD_UNKNOWN_UNICAST');
    expect(step1.ingressPort).toBe(1);
    expect(step1.egressPorts).toEqual([2, 3, 4]);
    expect(step1.portStates.find((p) => p.port === 1)?.state).toBe('idle');
    expect(
      step1.portStates
        .filter((p) => [2, 3, 4].includes(p.port))
        .every((p) => p.state === 'transmitting'),
    ).toBe(true);
  });

  it('Scenario 2: Return frame -> LEARN_NEW_SOURCE & FORWARD_KNOWN_UNICAST', () => {
    const sequence: FrameTransmission[] = [
      { srcMac: 'AA:AA:AA:AA:AA:AA', dstMac: 'BB:BB:BB:BB:BB:BB', ingressPort: 1 },
      { srcMac: 'BB:BB:BB:BB:BB:BB', dstMac: 'AA:AA:AA:AA:AA:AA', ingressPort: 2 },
    ];

    const steps = generateSwitchSimulation(STANDARD_4_HOSTS, sequence);
    expect(steps).toHaveLength(4);

    // Host B returns frame to Host A
    const step2 = steps[2];
    expect(step2.phase).toBe('source_evaluation');
    expect(step2.decision).toBe('LEARN_NEW_SOURCE');
    expect(step2.ingressPort).toBe(2);
    expect(step2.macTableSnapshot).toEqual([
      { mac: 'AA:AA:AA:AA:AA:AA', port: 1 },
      { mac: 'BB:BB:BB:BB:BB:BB', port: 2 },
    ]);

    const step3 = steps[3];
    expect(step3.phase).toBe('forwarding_action');
    expect(step3.decision).toBe('FORWARD_KNOWN_UNICAST');
    expect(step3.ingressPort).toBe(2);
    expect(step3.egressPorts).toEqual([1]);
    expect(step3.highlightedPort).toBe(1);
    expect(step3.portStates.find((p) => p.port === 1)?.state).toBe('transmitting');
    expect(step3.portStates.find((p) => p.port === 2)?.state).toBe('idle');
    expect(step3.portStates.find((p) => p.port === 3)?.state).toBe('idle');
    expect(step3.portStates.find((p) => p.port === 4)?.state).toBe('idle');
  });

  it('Scenario 3: Broadcast frame -> FLOOD_BROADCAST', () => {
    const sequence: FrameTransmission[] = [
      { srcMac: 'CC:CC:CC:CC:CC:CC', dstMac: BROADCAST_MAC, ingressPort: 3 },
    ];

    const steps = generateSwitchSimulation(STANDARD_4_HOSTS, sequence);
    expect(steps).toHaveLength(2);

    expect(steps[0].decision).toBe('LEARN_NEW_SOURCE');
    expect(steps[1].decision).toBe('FLOOD_BROADCAST');
    expect(steps[1].ingressPort).toBe(3);
    expect(steps[1].egressPorts).toEqual([1, 2, 4]);
    expect(
      steps[1].portStates
        .filter((p) => [1, 2, 4].includes(p.port))
        .every((p) => p.state === 'transmitting'),
    ).toBe(true);
    expect(steps[1].portStates.find((p) => p.port === 3)?.state).toBe('idle');
  });

  it('Scenario 4: Known source on same port -> REFRESH_SOURCE', () => {
    const sequence: FrameTransmission[] = [
      { srcMac: 'AA:AA:AA:AA:AA:AA', dstMac: 'BB:BB:BB:BB:BB:BB', ingressPort: 1 },
      { srcMac: 'AA:AA:AA:AA:AA:AA', dstMac: 'CC:CC:CC:CC:CC:CC', ingressPort: 1 },
    ];

    const steps = generateSwitchSimulation(STANDARD_4_HOSTS, sequence);
    expect(steps).toHaveLength(4);

    const step2 = steps[2];
    expect(step2.phase).toBe('source_evaluation');
    expect(step2.decision).toBe('REFRESH_SOURCE');
    expect(step2.ingressPort).toBe(1);
    expect(step2.macTableSnapshot).toEqual([{ mac: 'AA:AA:AA:AA:AA:AA', port: 1 }]);
    expect(step2.description).toContain('Entry timestamp refreshed');
  });

  it('Scenario 5: Station migration -> MOVE_SOURCE', () => {
    const sequence: FrameTransmission[] = [
      // Host A starts on Port 1
      { srcMac: 'AA:AA:AA:AA:AA:AA', dstMac: 'BB:BB:BB:BB:BB:BB', ingressPort: 1 },
      // Host A cable moved to Port 4, transmits again
      { srcMac: 'AA:AA:AA:AA:AA:AA', dstMac: 'BB:BB:BB:BB:BB:BB', ingressPort: 4 },
    ];

    const steps = generateSwitchSimulation(STANDARD_4_HOSTS, sequence);
    expect(steps).toHaveLength(4);

    const moveStep = steps[2];
    expect(moveStep.phase).toBe('source_evaluation');
    expect(moveStep.decision).toBe('MOVE_SOURCE');
    expect(moveStep.ingressPort).toBe(4);
    expect(moveStep.macTableSnapshot).toEqual([{ mac: 'AA:AA:AA:AA:AA:AA', port: 4 }]);
    expect(moveStep.description).toContain('Station migration detected');
    expect(moveStep.description).toContain('Port 1 to Port 4');
  });

  it('Scenario 6: Destination on arrival port -> FILTER_SAME_PORT', () => {
    const engine = new SwitchSimulationEngine(STANDARD_4_HOSTS);

    // Learn Host B on Port 2
    engine.processFrame({
      srcMac: 'BB:BB:BB:BB:BB:BB',
      dstMac: 'AA:AA:AA:AA:AA:AA',
      ingressPort: 2,
    });

    // Another frame arrives on Port 2 whose destination is Host B (e.g. shared hub on Port 2)
    const [sourceStep, forwardStep] = engine.processFrame({
      srcMac: 'DD:DD:DD:DD:DD:DD',
      dstMac: 'BB:BB:BB:BB:BB:BB',
      ingressPort: 2,
    });

    expect(sourceStep.decision).toBe('LEARN_NEW_SOURCE');
    expect(forwardStep.phase).toBe('forwarding_action');
    expect(forwardStep.decision).toBe('FILTER_SAME_PORT');
    expect(forwardStep.ingressPort).toBe(2);
    expect(forwardStep.egressPorts).toEqual([]);
    expect(forwardStep.highlightedPort).toBe(2);
    expect(forwardStep.portStates.find((p) => p.port === 2)?.state).toBe('dropped');
    expect(forwardStep.portStates.filter((p) => p.port !== 2).every((p) => p.state === 'idle')).toBe(
      true,
    );
  });
});

describe('Gate 2 — Comprehensive decision variant sweep', () => {
  it('covers all 7 SwitchDecision enum variants across test sequences', () => {
    const decisionsEmitted = new Set<SwitchDecision>();

    const sequence: FrameTransmission[] = [
      // 1. AA -> BB on Port 1: LEARN_NEW_SOURCE (AA), FLOOD_UNKNOWN_UNICAST (BB)
      { srcMac: 'AA:AA:AA:AA:AA:AA', dstMac: 'BB:BB:BB:BB:BB:BB', ingressPort: 1 },
      // 2. BB -> AA on Port 2: LEARN_NEW_SOURCE (BB), FORWARD_KNOWN_UNICAST (AA)
      { srcMac: 'BB:BB:BB:BB:BB:BB', dstMac: 'AA:AA:AA:AA:AA:AA', ingressPort: 2 },
      // 3. AA -> BB on Port 1: REFRESH_SOURCE (AA), FORWARD_KNOWN_UNICAST (BB)
      { srcMac: 'AA:AA:AA:AA:AA:AA', dstMac: 'BB:BB:BB:BB:BB:BB', ingressPort: 1 },
      // 4. CC -> FF on Port 3: LEARN_NEW_SOURCE (CC), FLOOD_BROADCAST (FF)
      { srcMac: 'CC:CC:CC:CC:CC:CC', dstMac: BROADCAST_MAC, ingressPort: 3 },
      // 5. AA -> CC on Port 4: MOVE_SOURCE (AA), FORWARD_KNOWN_UNICAST (CC)
      { srcMac: 'AA:AA:AA:AA:AA:AA', dstMac: 'CC:CC:CC:CC:CC:CC', ingressPort: 4 },
      // 6. XX -> AA on Port 4: LEARN_NEW_SOURCE (XX), FILTER_SAME_PORT (AA is on Port 4)
      { srcMac: 'XX:XX:XX:XX:XX:XX', dstMac: 'AA:AA:AA:AA:AA:AA', ingressPort: 4 },
    ];

    const steps = generateSwitchSimulation(STANDARD_4_HOSTS, sequence);
    for (const s of steps) {
      decisionsEmitted.add(s.decision);
    }

    const expected7: SwitchDecision[] = [
      'LEARN_NEW_SOURCE',
      'REFRESH_SOURCE',
      'MOVE_SOURCE',
      'FLOOD_BROADCAST',
      'FLOOD_UNKNOWN_UNICAST',
      'FORWARD_KNOWN_UNICAST',
      'FILTER_SAME_PORT',
    ];

    for (const d of expected7) {
      expect(decisionsEmitted.has(d), `Missing decision variant: ${d}`).toBe(true);
    }
  });
});

describe('Gate 2 — Unfamiliar 5-port topology transfer validation', () => {
  const FIVE_PORT_HOSTS: HostNode[] = [
    { id: 'node-1', name: 'Node 1', mac: '00:11:22:33:44:55', port: 1 },
    { id: 'node-2', name: 'Node 2', mac: '00:11:22:33:44:66', port: 2 },
    { id: 'node-3', name: 'Node 3', mac: '00:11:22:33:44:77', port: 3 },
    { id: 'node-4', name: 'Node 4', mac: '00:11:22:33:44:88', port: 4 },
    { id: 'node-5', name: 'Node 5', mac: '00:11:22:33:44:99', port: 5 },
  ];

  it('correctly manages a 5-port switch topology with novel MAC addresses', () => {
    const sequence: FrameTransmission[] = [
      {
        srcMac: '00:11:22:33:44:55',
        dstMac: '00:11:22:33:44:99',
        ingressPort: 1,
      },
      {
        srcMac: '00:11:22:33:44:99',
        dstMac: '00:11:22:33:44:55',
        ingressPort: 5,
      },
    ];

    const steps = generateSwitchSimulation(FIVE_PORT_HOSTS, sequence);
    expect(steps).toHaveLength(4);

    // Frame 1 flood reaches all other 4 ports: 2, 3, 4, 5
    expect(steps[1].decision).toBe('FLOOD_UNKNOWN_UNICAST');
    expect(steps[1].egressPorts).toEqual([2, 3, 4, 5]);

    // Frame 2 from Node 5 on Port 5 forwards only to Port 1
    expect(steps[3].decision).toBe('FORWARD_KNOWN_UNICAST');
    expect(steps[3].egressPorts).toEqual([1]);
    expect(steps[3].portStates.filter((p) => p.port !== 1).every((p) => p.state === 'idle')).toBe(
      true,
    );
  });
});

describe('Gate 2 — Engine reset and determinism', () => {
  it('reset() completely restores cold-start state', () => {
    const engine = new SwitchSimulationEngine(STANDARD_4_HOSTS);
    engine.processFrame({
      srcMac: 'AA:AA:AA:AA:AA:AA',
      dstMac: 'BB:BB:BB:BB:BB:BB',
      ingressPort: 1,
    });
    expect(engine.getMacTableSnapshot()).toHaveLength(1);
    expect(engine.getAllSteps()).toHaveLength(2);

    engine.reset();
    expect(engine.getMacTableSnapshot()).toHaveLength(0);
    expect(engine.getAllSteps()).toHaveLength(0);

    // New frame starts fresh at stepIndex 0
    const [step0] = engine.processFrame({
      srcMac: 'CC:CC:CC:CC:CC:CC',
      dstMac: 'DD:DD:DD:DD:DD:DD',
      ingressPort: 3,
    });
    expect(step0.stepIndex).toBe(0);
    expect(step0.decision).toBe('LEARN_NEW_SOURCE');
  });

  it('guarantees pure deterministic output across multiple invocations', () => {
    const sequence: FrameTransmission[] = [
      { srcMac: 'AA:AA:AA:AA:AA:AA', dstMac: 'BB:BB:BB:BB:BB:BB', ingressPort: 1 },
      { srcMac: 'BB:BB:BB:BB:BB:BB', dstMac: 'AA:AA:AA:AA:AA:AA', ingressPort: 2 },
    ];

    const run1 = generateSwitchSimulation(STANDARD_4_HOSTS, sequence);
    const run2 = generateSwitchSimulation(STANDARD_4_HOSTS, sequence);

    expect(run1).toEqual(run2);
  });
});
