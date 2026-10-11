/**
 * Module 5 ARP Pilot Test Suite
 * ─────────────────────────────────────────────────────────────────────────────
 * Validates the 5-Stage Cognitive Fading Model and ARP Protocol Mechanics:
 *  - Stage 1: Observe (Worked example 192.168.1.10 ➔ .20 with FIFO Hold Queue)
 *  - Stage 2: Complete (Scaffolded intermediate fields on 10.0.0.15 ➔ .30)
 *  - Stage 3: Perform Independently (Faded stepper on 192.168.5.50 ➔ .75)
 *  - Stage 4: Transfer (Remote subnet gateway ARP resolution for 8.8.8.8)
 *  - Stage 5: Diagnose (Subnet mask mismatch & asymmetric routing isolation)
 *  - UI Component Rendering: ArpSimulationLab & NetworkingPracticeTaskView
 */

import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { NET_05_MODULE } from '../../src/content/networking/modules/net-05';
import { ArpSimulationLab } from '../../src/components/learning/networking/ArpSimulationLab';
import { NetworkingPracticeTaskView } from '../../src/components/learning/networking/NetworkingPracticeTaskView';
import { gradeNetworkingSubmission } from '../../src/lib/network-engine/networking-submit-pipeline';
import type { PracticeTask } from '../../src/types/curriculum';

describe('Module 5 ARP Pilot: Curriculum Integrity & Backward Compatibility', () => {
  it('preserves existing milestone 3 task contracts at index 0 of all concepts', () => {
    expect(NET_05_MODULE.concepts[0].tasks[0].id).toBe('net05-p1-arp-exchange');
    expect(NET_05_MODULE.concepts[1].tasks[0].id).toBe('net05-p2-arp-cache-reasoning');
    expect(NET_05_MODULE.concepts[2].tasks[0].id).toBe('net05-p3-mask-mismatch-diagnosis');
  });

  it('contains all 5 pilot stages in concepts[0].tasks', () => {
    const taskIds = NET_05_MODULE.concepts[0].tasks.map((t) => t.id);
    expect(taskIds).toContain('net05-stage1-observe');
    expect(taskIds).toContain('net05-stage2-complete');
    expect(taskIds).toContain('net05-stage3-perform');
    expect(taskIds).toContain('net05-stage4-transfer');
    expect(taskIds).toContain('net05-stage5-diagnose');
  });

  it('ensures all 5 pilot stages declare valid judgment questions', () => {
    const stages = NET_05_MODULE.concepts[0].tasks.filter((t) => t.id.startsWith('net05-stage'));
    expect(stages.length).toBe(5);
    for (const stage of stages) {
      const judgments = stage.validation.judgment ?? [];
      expect(judgments.length).toBeGreaterThanOrEqual(1);
      for (const j of judgments) {
        expect(j.options.length).toBeGreaterThanOrEqual(3);
        expect(j.correctIndex).toBeGreaterThanOrEqual(0);
        expect(j.correctIndex).toBeLessThan(j.options.length);
        expect(j.explanation.length).toBeGreaterThan(15);
      }
    }
  });
});

describe('Module 5 ARP Pilot: Stage 1 — Observe (Worked Example & Hold Queue)', () => {
  const stage1 = NET_05_MODULE.concepts[0].tasks.find((t) => t.id === 'net05-stage1-observe')!;

  it('defines valid ARP content for 192.168.1.10 resolving 192.168.1.20', () => {
    expect(stage1).toBeDefined();
    expect(stage1.arp).toBeDefined();
    expect(stage1.arp?.stage).toBe(1);
    expect(stage1.arp?.sourceHost.ip).toBe('192.168.1.10');
    expect(stage1.arp?.targetHost.ip).toBe('192.168.1.20');
  });

  it('passes judgment question with correct Layer 2 encapsulation rationale', () => {
    const res = gradeNetworkingSubmission({
      task: stage1,
      judgmentAnswers: [stage1.validation.judgment![0].correctIndex],
    });
    expect(res.passed).toBe(true);
  });
});

describe('Module 5 ARP Pilot: Stage 2 — Complete (Guided Scaffolding)', () => {
  const stage2 = NET_05_MODULE.concepts[0].tasks.find((t) => t.id === 'net05-stage2-complete')!;

  it('defines 6 structured scaffolding fields with expected protocol values', () => {
    expect(stage2).toBeDefined();
    expect(stage2.arp?.fields).toBeDefined();
    expect(stage2.arp?.fields?.length).toBe(6);

    const fields = stage2.arp!.fields!;
    const ethDst = fields.find((f) => f.id === 'arp_req_eth_dst');
    const swLearn = fields.find((f) => f.id === 'sw_learned_mac');
    const nonTarget = fields.find((f) => f.id === 'non_target_action');
    const targetCache = fields.find((f) => f.id === 'target_host_cache');
    const opcode = fields.find((f) => f.id === 'arp_reply_opcode');
    const queueAction = fields.find((f) => f.id === 'hold_queue_action');

    expect(ethDst?.expected).toBe('FF:FF:FF:FF:FF:FF');
    expect(swLearn?.expected).toBe('11:11:11:11:11:11');
    expect(nonTarget?.expected).toBe('discard');
    expect(targetCache?.expected).toBe('11:11:11:11:11:11');
    expect(opcode?.expected).toBe('2');
    expect(queueAction?.expected).toBe('dequeue');
  });

  it('passes judgment question for switch ingress learning & broadcast flood', () => {
    const res = gradeNetworkingSubmission({
      task: stage2,
      judgmentAnswers: [stage2.validation.judgment![0].correctIndex],
    });
    expect(res.passed).toBe(true);
  });
});

describe('Module 5 ARP Pilot: Stage 3 — Perform Independently (Faded Stepper)', () => {
  const stage3 = NET_05_MODULE.concepts[0].tasks.find((t) => t.id === 'net05-stage3-perform')!;

  it('configures collapsed stepper with independent protocol verification fields', () => {
    expect(stage3.arp?.isCollapsed).toBe(true);
    const fields = stage3.arp!.fields!;
    expect(fields.length).toBe(5);

    const targetMac = fields.find((f) => f.id === 'req_target_mac_unknown');
    const egressPorts = fields.find((f) => f.id === 'switch_egress_ports');
    const replyDst = fields.find((f) => f.id === 'reply_dst_mac');
    const replyOp = fields.find((f) => f.id === 'reply_opcode_indep');
    const dequeuedDst = fields.find((f) => f.id === 'dequeued_dst_mac');

    expect(targetMac?.expected).toBe('00:00:00:00:00:00');
    expect(egressPorts?.expected).toBe('1, 2, 3');
    expect(replyDst?.expected).toBe('55:55:55:55:55:55');
    expect(replyOp?.expected).toBe('2');
    expect(dequeuedDst?.expected).toBe('77:77:77:77:77:77');
  });

  it('passes judgment question explaining unknown Target MAC placeholder', () => {
    const res = gradeNetworkingSubmission({
      task: stage3,
      judgmentAnswers: [stage3.validation.judgment![0].correctIndex],
    });
    expect(res.passed).toBe(true);
  });
});

describe('Module 5 ARP Pilot: Stage 4 — Transfer (Remote Subnet Gateway Resolution)', () => {
  const stage4 = NET_05_MODULE.concepts[0].tasks.find((t) => t.id === 'net05-stage4-transfer')!;

  it('enforces gateway ARP target rule: Target IP is Default Gateway, NOT 8.8.8.8', () => {
    const fields = stage4.arp!.fields!;
    const l3Decision = fields.find((f) => f.id === 'l3_delivery_decision');
    const arpTargetIp = fields.find((f) => f.id === 'arp_target_ip_transfer');
    const frameDstMac = fields.find((f) => f.id === 'transmitted_frame_dst_mac');
    const packetDstIp = fields.find((f) => f.id === 'transmitted_packet_dst_ip');

    expect(l3Decision?.expected).toBe('remote');
    expect(arpTargetIp?.expected).toBe('192.168.1.1'); // Must be Gateway!
    expect(frameDstMac?.expected).toBe('GW:01:01:01:01:01');
    expect(packetDstIp?.expected).toBe('8.8.8.8'); // Preserved remote destination!
  });

  it('includes targeted misconception feedback for learners attempting to ARP for 8.8.8.8', () => {
    const arpTargetIp = stage4.arp!.fields!.find((f) => f.id === 'arp_target_ip_transfer')!;
    expect(arpTargetIp.misconceptions).toBeDefined();
    expect(arpTargetIp.misconceptions![0].feedback).toContain('strictly local');
  });

  it('passes judgment question on remote gateway ARP mechanism', () => {
    const res = gradeNetworkingSubmission({
      task: stage4,
      judgmentAnswers: [stage4.validation.judgment![0].correctIndex],
    });
    expect(res.passed).toBe(true);
  });
});

describe('Module 5 ARP Pilot: Stage 5 — Diagnose (Subnet Mask Mismatch)', () => {
  const stage5 = NET_05_MODULE.concepts[0].tasks.find((t) => t.id === 'net05-stage5-diagnose')!;

  it('includes complete diagnostic telemetry outputs for host routing table and pcap trace', () => {
    expect(stage5.arp?.diagnostics).toBeDefined();
    expect(stage5.arp?.diagnostics?.arpTableOutput).toContain('192.168.1.129');
    expect(stage5.arp?.diagnostics?.pcapOutput).toContain('ARP Who has 192.168.1.200?');
    expect(stage5.arp?.diagnostics?.pingOutput).toContain('100%');
  });

  it('enforces root cause isolation and specifies corrective subnet mask 255.255.255.0', () => {
    const fields = stage5.arp!.fields!;
    const hostAClass = fields.find((f) => f.id === 'host_a_classification');
    const hostBClass = fields.find((f) => f.id === 'host_b_classification');
    const rootCause = fields.find((f) => f.id === 'asymmetric_failure_root_cause');
    const correctiveMask = fields.find((f) => f.id === 'corrective_subnet_mask');

    expect(hostAClass?.expected).toBe('local');
    expect(hostBClass?.expected).toBe('remote');
    expect(rootCause?.expected).toBe('gateway_route');
    expect(correctiveMask?.expected).toBe('255.255.255.0');
  });

  it('passes judgment question isolating the asymmetric return drop', () => {
    const res = gradeNetworkingSubmission({
      task: stage5,
      judgmentAnswers: [stage5.validation.judgment![0].correctIndex],
    });
    expect(res.passed).toBe(true);
  });
});

describe('Module 5 ARP Pilot: UI Component Static Rendering', () => {
  const stage1 = NET_05_MODULE.concepts[0].tasks.find((t) => t.id === 'net05-stage1-observe')!;
  const stage2 = NET_05_MODULE.concepts[0].tasks.find((t) => t.id === 'net05-stage2-complete')!;

  it('renders ArpSimulationLab with FIFO Hold Queue and Step Indicators', () => {
    const markup = renderToStaticMarkup(
      <ArpSimulationLab
        taskArp={stage1.arp!}
        title={stage1.title}
        description={stage1.description}
      />,
    );

    expect(markup).toContain('arp-simulation-lab');
    expect(markup).toContain('arp-fifo-hold-queue');
    expect(markup).toContain('FIFO Buffer / Outbound Hold Queue');
    expect(markup).toContain('Waiting for ARP Resolution');
    expect(markup).toContain('arp-step-indicator');
    expect(markup).toContain('arp-packet-decoder');
    expect(markup).toContain('Switch SW1 CAM Table');
    expect(markup).toContain('Host ARP Cache');
  });

  it('renders NetworkingPracticeTaskView with ArpSimulationLab on Stage 1', () => {
    const onTaskSuccess = vi.fn();
    const markup = renderToStaticMarkup(
      <NetworkingPracticeTaskView
        task={stage1}
        taskIndex={1}
        totalTasks={6}
        concept={NET_05_MODULE.concepts[0]}
        conceptIndex={0}
        totalConcepts={3}
        isCompleted={false}
        onTaskSuccess={onTaskSuccess}
      />,
    );

    expect(markup).toContain('arp-simulation-lab');
    expect(markup).toContain('FIFO Buffer / Outbound Hold Queue');
    expect(markup).toContain('Prediction &amp; Causal Defense');
  });

  it('renders NetworkingPracticeTaskView with StructuredTaskGrader on Stage 2', () => {
    const onTaskSuccess = vi.fn();
    const markup = renderToStaticMarkup(
      <NetworkingPracticeTaskView
        task={stage2}
        taskIndex={2}
        totalTasks={6}
        concept={NET_05_MODULE.concepts[0]}
        conceptIndex={0}
        totalConcepts={3}
        isCompleted={false}
        onTaskSuccess={onTaskSuccess}
      />,
    );

    expect(markup).toContain('arp-simulation-lab');
    expect(markup).toContain('structured-task-grader');
    expect(markup).toContain('ARP Request Ethernet Frame Destination MAC');
  });
});
