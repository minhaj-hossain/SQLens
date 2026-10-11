/**
 * Sprint 8 Test Suite: 802.1Q VLAN Trunk & OSPF Dijkstra Lab (Module 16)
 * ─────────────────────────────────────────────────────────────────────────────
 * Validates:
 * 1. Pure Dijkstra Shortest Path First (SPF) algorithm (RFC 2328).
 * 2. Dynamic SPF recalculation on topology link failure.
 * 3. Pure 802.1Q VLAN Tagging & access/trunk port evaluator (IEEE 802.1Q).
 * 4. Pure Wi-Fi 2.4 GHz channel overlap & interference risk analyzer (IEEE 802.11).
 * 5. Pure CSMA/CA binary exponential backoff simulator.
 * 6. Standalone VlanTrunkDijkstraLab rendering across all 3 tabs:
 *    - 802.1Q Trunk view (frame dissection, 4-byte tag zoom, allowed VLAN filtering).
 *    - Wi-Fi Spectrum view (2.4 GHz channel masks, overlap card, CSMA/CA timeline).
 *    - OSPF Dijkstra view (SPF stepper, link failure toggle, loop-free routing table).
 * 7. Pipeline detection (`isNetworkingTask`) and `NetworkingPracticeTaskView` integration.
 * 8. Verification that all Module 16 tasks (p1, p2, p3, ch1, ch2) have `vlanDijkstra` configured.
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

import {
  VlanTrunkDijkstraLab,
  runDijkstraAlgorithm,
  evaluateVlanTrunkFrame,
  calculateWifiChannelOverlap,
  simulateCsmaCaBackoff,
} from '../../src/components/learning/networking/VlanTrunkDijkstraLab';

import { NetworkingPracticeTaskView } from '../../src/components/learning/networking/NetworkingPracticeTaskView';
import {
  isNetworkingTask,
  gradeNetworkingSubmission,
} from '../../src/lib/network-engine/networking-submit-pipeline';
import { submitForTask } from '../../src/lib/track-submit';
import { NET_16_MODULE } from '../../src/content/networking/modules/net-16';
import type { PracticeTask, VlanDijkstraTaskContent } from '../../src/types/curriculum';

// ─────────────────────────────────────────────────────────────────────────────
// Test Suite 1: Pure Dijkstra Shortest Path Algorithm (RFC 2328)
// ─────────────────────────────────────────────────────────────────────────────

describe('Sprint 8 — Test 1: Pure Dijkstra Shortest Path Algorithm (OSPF RFC 2328)', () => {
  const sampleRouters = [
    { id: 'R1', name: 'Core Router 1' },
    { id: 'R2', name: 'Aggregation Router 2' },
    { id: 'R3', name: 'Aggregation Router 3' },
    { id: 'R4', name: 'Edge Router 4' },
    { id: 'R5', name: 'Gateway Router 5' },
  ];

  const sampleLinks = [
    { fromRouter: 'R1', toRouter: 'R2', cost: 1 },
    { fromRouter: 'R1', toRouter: 'R3', cost: 10 },
    { fromRouter: 'R2', toRouter: 'R4', cost: 10 },
    { fromRouter: 'R3', toRouter: 'R4', cost: 1 },
    { fromRouter: 'R4', toRouter: 'R5', cost: 1 },
    { fromRouter: 'R2', toRouter: 'R5', cost: 100 },
  ];

  it('computes optimal shortest paths and cumulative costs from R1', () => {
    const result = runDijkstraAlgorithm(sampleRouters, sampleLinks, 'R1');

    expect(result.source).toBe('R1');
    expect(result.distances['R1']).toBe(0);
    expect(result.distances['R2']).toBe(1);
    expect(result.distances['R3']).toBe(10);
    // Path to R4: R1 -> R2 (cost 1) -> R4 (cost 10) = 11, OR R1 -> R3 (10) -> R4 (1) = 11.
    expect(result.distances['R4']).toBe(11);
    // Path to R5: via R4 (11 + 1 = 12), much better than direct R2-R5 (1 + 100 = 101)
    expect(result.distances['R5']).toBe(12);

    expect(result.paths['R5']).toEqual(['R1', 'R2', 'R4', 'R5']);
  });

  it('records sequential SPF exploration steps with frontier logs', () => {
    const result = runDijkstraAlgorithm(sampleRouters, sampleLinks, 'R1');

    expect(result.steps.length).toBeGreaterThan(3);
    expect(result.steps[0].step).toBe(0);
    expect(result.steps[0].currentNode).toBe('R1');
    expect(result.steps[0].tentativeDistances['R1']).toBe(0);
  });

  it('dynamically reconverges and updates shortest paths upon link failure', () => {
    // Fail the primary fast link R1-R2
    const linksWithFailure = sampleLinks.map((l) => ({
      ...l,
      failed: l.fromRouter === 'R1' && l.toRouter === 'R2',
    }));

    const result = runDijkstraAlgorithm(sampleRouters, linksWithFailure, 'R1');

    // With R1-R2 down, traffic to R4 must go through R3: R1 -> R3 (10) -> R4 (1) = 11
    expect(result.distances['R4']).toBe(11);
    expect(result.paths['R4']).toEqual(['R1', 'R3', 'R4']);

    // Traffic to R2 must reverse from R4: R1 -> R3 (10) -> R4 (1) -> R2 (10) = 21
    expect(result.distances['R2']).toBe(21);
    expect(result.paths['R2']).toEqual(['R1', 'R3', 'R4', 'R2']);
  });

  it('marks disconnected nodes as Infinity and empty path', () => {
    const isolatedNode = { id: 'R_ISOLATED', name: 'Island' };
    const result = runDijkstraAlgorithm([...sampleRouters, isolatedNode], sampleLinks, 'R1');

    expect(result.distances['R_ISOLATED']).toBe(Infinity);
    expect(result.paths['R_ISOLATED']).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test Suite 2: Pure 802.1Q Frame Evaluator (IEEE 802.1Q)
// ─────────────────────────────────────────────────────────────────────────────

describe('Sprint 8 — Test 2: Pure 802.1Q Frame Evaluator (IEEE 802.1Q)', () => {
  it('constructs 4-byte 802.1Q tag header hex and forwards permitted VLAN on trunk', () => {
    const evaluation = evaluateVlanTrunkFrame(
      { vlanId: 20, isTagged: true, priority: 5, dropEligible: false },
      { mode: 'trunk', allowedVlans: [10, 20, 30], nativeVlan: 1 }
    );

    expect(evaluation.action).toBe('forward_tagged');
    expect(evaluation.frameTagged).toBe(true);
    expect(evaluation.effectiveVlan).toBe(20);
    expect(evaluation.tagDetails?.tpid).toBe('0x8100');
    expect(evaluation.tagDetails?.pcp).toBe(5);
    expect(evaluation.tagDetails?.vid).toBe(20);
    expect(evaluation.tagDetails?.tagHex).toContain('8100');
  });

  it('drops frame when VLAN ID is pruned from trunk allowed list', () => {
    const evaluation = evaluateVlanTrunkFrame(
      { vlanId: 30, isTagged: true, priority: 0, dropEligible: false },
      { mode: 'trunk', allowedVlans: [10, 20], nativeVlan: 1 }
    );

    expect(evaluation.action).toBe('drop_vlan_not_allowed');
    expect(evaluation.reason).toContain('PRUNED/FILTERED');
    expect(evaluation.reason).toContain('VLAN 30');
  });

  it('maps untagged frame on trunk port to configured native VLAN', () => {
    const evaluation = evaluateVlanTrunkFrame(
      { vlanId: 1, isTagged: false },
      { mode: 'trunk', allowedVlans: [1, 10, 20], nativeVlan: 1 }
    );

    expect(evaluation.action).toBe('forward_untagged');
    expect(evaluation.effectiveVlan).toBe(1);
    expect(evaluation.reason).toContain('Native VLAN 1');
  });

  it('strips 802.1Q tag on access port and forwards untagged frame', () => {
    const evaluation = evaluateVlanTrunkFrame(
      { vlanId: 10, isTagged: true },
      { mode: 'access', accessVlan: 10 }
    );

    expect(evaluation.action).toBe('forward_untagged');
    expect(evaluation.frameTagged).toBe(false);
    expect(evaluation.reason).toContain('Access port delivers frame untagged');
  });

  it('drops tagged frame arriving at access port with mismatched VLAN ID', () => {
    const evaluation = evaluateVlanTrunkFrame(
      { vlanId: 30, isTagged: true },
      { mode: 'access', accessVlan: 10 }
    );

    expect(evaluation.action).toBe('drop_vlan_not_allowed');
    expect(evaluation.reason).toContain('discarded');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test Suite 3: Pure Wi-Fi 2.4 GHz RF Channel Overlap (IEEE 802.11)
// ─────────────────────────────────────────────────────────────────────────────

describe('Sprint 8 — Test 3: Pure Wi-Fi 2.4 GHz RF Channel Overlap (IEEE 802.11)', () => {
  it('identifies non-overlapping channels (1 and 6, 6 and 11) with 0% overlap', () => {
    const overlap1and6 = calculateWifiChannelOverlap(1, 6);
    expect(overlap1and6.isOverlapping).toBe(false);
    expect(overlap1and6.overlapPercentage).toBe(0);
    expect(overlap1and6.frequencyDiffMhz).toBe(25);
    expect(overlap1and6.interferenceRisk).toBe('none');

    const overlap6and11 = calculateWifiChannelOverlap(6, 11);
    expect(overlap6and11.isOverlapping).toBe(false);
    expect(overlap6and11.interferenceRisk).toBe('none');
  });

  it('flags severe adjacent-channel overlap between Channel 6 and Channel 7', () => {
    const overlap6and7 = calculateWifiChannelOverlap(6, 7);
    expect(overlap6and7.isOverlapping).toBe(true);
    expect(overlap6and7.frequencyDiffMhz).toBe(5);
    expect(overlap6and7.overlapPercentage).toBe(80);
    expect(overlap6and7.interferenceRisk).toBe('severe');
    expect(overlap6and7.explanation).toContain('destructive adjacent-channel');
  });

  it('detects co-channel interference when both APs are on identical channel', () => {
    const cochannel = calculateWifiChannelOverlap(6, 6);
    expect(cochannel.isOverlapping).toBe(true);
    expect(cochannel.frequencyDiffMhz).toBe(0);
    expect(cochannel.overlapPercentage).toBe(100);
    expect(cochannel.interferenceRisk).toBe('co-channel');
    expect(cochannel.explanation).toContain('Co-Channel Interference');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test Suite 4: Pure CSMA/CA Backoff Simulator
// ─────────────────────────────────────────────────────────────────────────────

describe('Sprint 8 — Test 4: Pure CSMA/CA Binary Exponential Backoff Simulator', () => {
  it('doubles contention window on collision up to cwMax', () => {
    const sim0 = simulateCsmaCaBackoff(0, 5);
    expect(sim0.currentCw).toBe(15);
    expect(sim0.randomBackoffSlots).toBe(5);
    // 28 DIFS + (5 * 9) = 28 + 45 = 73
    expect(sim0.totalContentionTimeUs).toBe(73);

    const sim1 = simulateCsmaCaBackoff(1, 10);
    expect(sim1.currentCw).toBe(31);

    const sim2 = simulateCsmaCaBackoff(2, 20);
    expect(sim2.currentCw).toBe(63);

    const sim3 = simulateCsmaCaBackoff(3, 40);
    expect(sim3.currentCw).toBe(127);

    const sim7 = simulateCsmaCaBackoff(7, 100);
    expect(sim7.currentCw).toBe(1023); // Capped at cwMax
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test Suite 5: VlanTrunkDijkstraLab Component Rendering
// ─────────────────────────────────────────────────────────────────────────────

describe('Sprint 8 — Test 5: VlanTrunkDijkstraLab Component Rendering', () => {
  it('renders tab 1 (vlan_trunking) with frame inspector, 802.1Q tags, and decision card', () => {
    const html = renderToStaticMarkup(
      <VlanTrunkDijkstraLab
        taskContent={{
          defaultTab: 'vlan_trunking',
          vlans: [
            { id: 10, name: 'Engineering', color: '#38bdf8' },
            { id: 20, name: 'Finance', color: '#34d399' },
          ],
        }}
      />
    );

    expect(html).toContain('data-testid="vlan-trunk-dijkstra-lab"');
    expect(html).toContain('data-testid="panel-vlan-trunking"');
    expect(html).toContain('802.1Q Tag Insertion');
    expect(html).toContain('TPID (16b)');
    expect(html).toContain('0x8100');
    expect(html).toContain('VID (12b)');
    expect(html).toContain('data-testid="vlan-decision-card"');
  });

  it('renders tab 2 (wifi_spectrum) with 2.4 GHz channel ruler and CSMA/CA backoff', () => {
    const html = renderToStaticMarkup(
      <VlanTrunkDijkstraLab
        taskContent={{
          defaultTab: 'wifi_spectrum',
          accessPoints: [
            { apId: 'ap1', apName: 'AP-1', channel: 6 },
            { apId: 'ap2', apName: 'AP-2', channel: 7 },
          ],
        }}
      />
    );

    expect(html).toContain('data-testid="panel-wifi-spectrum"');
    expect(html).toContain('2.4 GHz RF Channel Mask');
    expect(html).toContain('data-testid="wifi-overlap-card"');
    expect(html).toContain('CSMA/CA Binary Exponential Backoff Simulator');
    expect(html).toContain('Contention Window');
  });

  it('renders tab 3 (ospf_dijkstra) with SPF stepper, link toggles, and routing table', () => {
    const html = renderToStaticMarkup(
      <VlanTrunkDijkstraLab
        taskContent={{
          defaultTab: 'ospf_dijkstra',
          sourceRouter: 'R1',
        }}
      />
    );

    expect(html).toContain('data-testid="panel-ospf-dijkstra"');
    expect(html).toContain('OSPF SPF Controls');
    expect(html).toContain('data-testid="dijkstra-step-log"');
    expect(html).toContain('data-testid="ospf-routing-table"');
    expect(html).toContain('Campus Core (R1)');
    expect(html).toContain('Shortest Path');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test Suite 6: Pipeline & NetworkingPracticeTaskView Integration
// ─────────────────────────────────────────────────────────────────────────────

describe('Sprint 8 — Test 6: Pipeline & NetworkingPracticeTaskView Integration', () => {
  const dummyTask: PracticeTask = {
    id: 'net16-p1-vlan-tagging',
    title: 'Analyzing Access vs Trunk Ports & 802.1Q Tags',
    description: 'Determine when Ethernet frames carry 802.1Q tags.',
    instructions: ['Inspect the 802.1Q frame format.'],
    type: 'guided',
    primaryTable: '',
    initialSql: '',
    solutionSql: 'NETWORKING_JUDGMENT_TASK',
    solutionExplanation: 'Access ports strip tags; trunk ports add 802.1Q tags.',
    hints: [{ level: 1, text: 'Trunk links insert 802.1Q tags.' }],
    validation: {
      judgment: [
        {
          kind: 'choose-and-defend',
          prompt: 'What happens to a frame traversing a trunk link?',
          options: ['Switch inserts 4-byte 802.1Q tag', 'Switch encrypts frame'],
          correctIndex: 0,
          explanation: 'IEEE 802.1Q tags the frame with VLAN ID.',
        },
      ],
    },
    successMessage: 'Great job!',
    vlanDijkstra: {
      title: '802.1Q Trunk Simulator',
      defaultTab: 'vlan_trunking',
    },
  };

  it('recognizes task with vlanDijkstra as a networking task in pipeline', () => {
    expect(isNetworkingTask(dummyTask)).toBe(true);
  });

  it('grades judgment submission correctly', () => {
    const gradeCorrect = gradeNetworkingSubmission({
      task: dummyTask,
      judgmentAnswers: [0],
    });
    expect(gradeCorrect.passed).toBe(true);

    const gradeIncorrect = gradeNetworkingSubmission({
      task: dummyTask,
      judgmentAnswers: [1],
    });
    expect(gradeIncorrect.passed).toBe(false);
  });

  it('renders NetworkingPracticeTaskView with "VLAN & Dijkstra Lab" badge', () => {
    const html = renderToStaticMarkup(
      <NetworkingPracticeTaskView
        task={dummyTask}
        taskIndex={0}
        totalTasks={3}
        onTaskSuccess={vi.fn()}
      />
    );

    expect(html).toContain('VLAN &amp; Dijkstra Lab');
    expect(html).toContain('data-testid="vlan-trunk-dijkstra-lab"');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test Suite 7: Module 16 Curriculum Content Verification
// ─────────────────────────────────────────────────────────────────────────────

describe('Sprint 8 — Test 7: Module 16 Curriculum Content Verification', () => {
  it('verifies NET_16_MODULE structure with 3 concepts and 1 challenge', () => {
    expect(NET_16_MODULE.id).toBe('net-16');
    expect(NET_16_MODULE.concepts).toHaveLength(3);
    expect(NET_16_MODULE.challenge).toBeDefined();
    expect(NET_16_MODULE.challenge!.tasks).toHaveLength(2);
  });

  it('verifies all 5 tasks in Module 16 have vlanDijkstra configured', () => {
    const p1 = NET_16_MODULE.concepts[0].tasks[0];
    const p2 = NET_16_MODULE.concepts[1].tasks[0];
    const p3 = NET_16_MODULE.concepts[2].tasks[0];
    const ch1 = NET_16_MODULE.challenge!.tasks[0];
    const ch2 = NET_16_MODULE.challenge!.tasks[1];

    expect(p1.vlanDijkstra).toBeDefined();
    expect(p1.vlanDijkstra?.defaultTab).toBe('vlan_trunking');

    expect(p2.vlanDijkstra).toBeDefined();
    expect(p2.vlanDijkstra?.defaultTab).toBe('wifi_spectrum');

    expect(p3.vlanDijkstra).toBeDefined();
    expect(p3.vlanDijkstra?.defaultTab).toBe('ospf_dijkstra');

    expect(ch1.vlanDijkstra).toBeDefined();
    expect(ch1.vlanDijkstra?.defaultTab).toBe('vlan_trunking');

    expect(ch2.vlanDijkstra).toBeDefined();
    expect(ch2.vlanDijkstra?.defaultTab).toBe('wifi_spectrum');
  });
});
