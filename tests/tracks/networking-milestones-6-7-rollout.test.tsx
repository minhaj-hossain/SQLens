/**
 * Phase 5 Verification Suite: Milestones 6 & 7 Rollout
 * Modules 14–16: Diagnostics & Troubleshooting, Security & STP, Enterprise Infrastructure & Wireless
 * ─────────────────────────────────────────────────────────────────────────────
 * Validates:
 * 1. 3-Beat physical causality across all 9 micro-concepts in Modules 14, 15, 16.
 * 2. MCQ coverage (>= 2 per concept) with realistic options and valid indices.
 * 3. Workplace Diagnostic Terminals for Tickets #116, #117, #118 and Capstone Exam.
 * 4. Dual-OS / multi-platform command availability (Cisco IOS, Linux bridge, Netfilter, Windows PowerShell).
 * 5. Static UI rendering with NetworkingPracticeTaskView co-rendering terminal & simulators.
 * 6. Judgment grading preservation across all milestone tasks.
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

import { NET_14_MODULE } from '../../src/content/networking/modules/net-14';
import { NET_15_MODULE } from '../../src/content/networking/modules/net-15';
import { NET_16_MODULE } from '../../src/content/networking/modules/net-16';

import { NetworkingPracticeTaskView } from '../../src/components/learning/networking/NetworkingPracticeTaskView';
import { gradeNetworkingSubmission } from '../../src/lib/network-engine/networking-submit-pipeline';

const MODULES_PHASE_5 = [
  { module: NET_14_MODULE, expectedConcepts: 3, name: 'Module 14 (Diagnostics & Triage)' },
  { module: NET_15_MODULE, expectedConcepts: 3, name: 'Module 15 (Security, Firewalls & STP)' },
  { module: NET_16_MODULE, expectedConcepts: 3, name: 'Module 16 (VLANs, Wireless & Routing)' },
];

describe('Phase 5 (Milestones 6 & 7 Rollout) — Modules 14–16 Quality Gate', () => {
  it('enforces unbroken 3-beat physical causality across all 9 concepts in Modules 14–16', () => {
    let totalConceptsVerified = 0;

    MODULES_PHASE_5.forEach(({ module }) => {
      expect(module.concepts.length).toBeGreaterThanOrEqual(3);

      module.concepts.forEach((concept) => {
        totalConceptsVerified++;
        const text = concept.theory.explanation.join('\n');

        expect(text).toContain('Beat 1');
        expect(text).toContain('Beat 2');
        expect(text).toContain('Beat 3');

        expect(concept.theory.summary.length).toBeGreaterThan(40);
        expect(concept.theory.keyTakeaway.length).toBeGreaterThan(20);
      });
    });

    expect(totalConceptsVerified).toBe(9);
  });

  it('guarantees >= 2 MCQs per concept with valid schemas and explanations across all 9 concepts', () => {
    let totalMcqsVerified = 0;

    MODULES_PHASE_5.forEach(({ module }) => {
      module.concepts.forEach((concept) => {
        const mcqs = concept.theory.mcqs;
        expect(mcqs).toBeDefined();
        expect(mcqs!.length).toBeGreaterThanOrEqual(2);

        mcqs!.forEach((mcq) => {
          totalMcqsVerified++;
          expect(mcq.id).toBeTruthy();
          expect(mcq.question.length).toBeGreaterThan(15);
          expect(mcq.options.length).toBe(4);
          expect(mcq.correctIndex).toBeGreaterThanOrEqual(0);
          expect(mcq.correctIndex).toBeLessThan(4);
          expect(mcq.explanation!.length).toBeGreaterThan(20);
        });
      });
    });

    expect(totalMcqsVerified).toBeGreaterThanOrEqual(18);
  });

  it('validates Ticket #116 workplace diagnostic terminal in Module 16 (VLANs & Trunking)', () => {
    const task = NET_16_MODULE.concepts[0].tasks[0];
    expect(task.id).toBe('net16-p1-vlan-tagging');
    expect(task.terminal).toBeDefined();

    const terminal = task.terminal!;
    expect(terminal.initialOutput).toContain('WORKPLACE TICKET #116');
    expect(terminal.commands['show vlan brief']).toContain('10   Engineering');
    expect(terminal.commands['show interfaces trunk']).toContain('802.1q');
    expect(terminal.commands['bridge vlan show']).toContain('10 PVID Egress Untagged');
    expect(terminal.commands['ip link add link eth0 name eth0.10 type vlan id 10']).toContain('Created VLAN subinterface');
    expect(terminal.commands['ip addr show eth0.10']).toContain('192.168.10.1/24');
  });

  it('validates Ticket #117 workplace diagnostic terminal in Module 15 (Stateful Conntrack)', () => {
    const task = NET_15_MODULE.concepts[2].tasks[0];
    expect(task.id).toBe('net15-p3-stateful-conntrack');
    expect(task.terminal).toBeDefined();

    const terminal = task.terminal!;
    expect(terminal.initialOutput).toContain('WORKPLACE TICKET #117');
    expect(terminal.commands['iptables -L -v -n']).toContain('ctstate RELATED,ESTABLISHED');
    expect(terminal.commands['conntrack -L']).toContain('ESTABLISHED');
    expect(terminal.commands['Get-NetFirewallRule']).toContain('Block-Unsolicited-Inbound');
  });

  it('validates Ticket #118 workplace diagnostic terminal in Module 15 (STP Loops & BPDU)', () => {
    const task = NET_15_MODULE.concepts[0].tasks[0];
    expect(task.id).toBe('net15-p1-stp-election');
    expect(task.terminal).toBeDefined();

    const terminal = task.terminal!;
    expect(terminal.initialOutput).toContain('WORKPLACE TICKET #118');
    expect(terminal.commands['show spanning-tree']).toContain('Root ID    Priority    4096');
    expect(terminal.commands['show spanning-tree root']).toContain('0011.2233.4402');
    expect(terminal.commands['brctl showstp br0']).toContain('designated root        1000.001122334402');
  });

  it('validates Module 14 Capstone Exam systematic triage diagnostic terminals', () => {
    // Concept 1 task
    const task1 = NET_14_MODULE.concepts[0].tasks[0];
    expect(task1.id).toBe('net14-p1-icmp-trace-eval');
    expect(task1.terminal).toBeDefined();
    expect(task1.terminal!.commands['tracert 93.184.216.34']).toContain('Trace complete.');
    expect(task1.terminal!.commands['ping 93.184.216.34']).toContain('TTL=56');

    // Concept 3 task
    const task3 = NET_14_MODULE.concepts[2].tasks[0];
    expect(task3.id).toBe('net14-p3-systematic-triage');
    expect(task3.terminal).toBeDefined();
    expect(task3.terminal!.commands['ping 8.8.8.8']).toContain('TTL=58');
    expect(task3.terminal!.commands['ping google.com']).toContain('could not find host');

    // Challenge 2 Capstone Exam
    const ch2 = NET_14_MODULE.challenge.tasks[1];
    expect(ch2.id).toBe('net14-ch2-office-outage-triage');
    expect(ch2.terminal).toBeDefined();
    expect(ch2.terminal!.initialOutput).toContain('CAPSTONE EXAM');
    expect(ch2.terminal!.commands['ipconfig /all']).toContain('169.254.20.15');
    expect(ch2.terminal!.commands['ping 127.0.0.1']).toContain('bytes=32');
  });

  it('renders static UI markup co-rendering workplace terminals and interactive simulators', () => {
    // 1. VLAN Tagging + Terminal (Module 16 Task 1)
    const task16 = NET_16_MODULE.concepts[0].tasks[0];
    const html16 = renderToStaticMarkup(
      <NetworkingPracticeTaskView
        task={task16}
        taskIndex={0}
        totalTasks={3}
        concept={NET_16_MODULE.concepts[0]}
        conceptIndex={0}
        totalConcepts={3}
        isCompleted={false}
        onTaskSuccess={vi.fn()}
      />
    );
    expect(html16).toContain('802.1Q VLAN Tagging &amp; Trunk Port Simulator');
    expect(html16).toContain('WORKPLACE TICKET #116');

    // 2. STP Loop Lab + Terminal (Module 15 Task 1)
    const task15_stp = NET_15_MODULE.concepts[0].tasks[0];
    const html15_stp = renderToStaticMarkup(
      <NetworkingPracticeTaskView
        task={task15_stp}
        taskIndex={0}
        totalTasks={3}
        concept={NET_15_MODULE.concepts[0]}
        conceptIndex={0}
        totalConcepts={3}
        isCompleted={false}
        onTaskSuccess={vi.fn()}
      />
    );
    expect(html15_stp).toContain('Spanning Tree Protocol (STP) Root Election');
    expect(html15_stp).toContain('WORKPLACE TICKET #118');

    // 3. Stateful Conntrack + Terminal (Module 15 Task 3)
    const task15_ct = NET_15_MODULE.concepts[2].tasks[0];
    const html15_ct = renderToStaticMarkup(
      <NetworkingPracticeTaskView
        task={task15_ct}
        taskIndex={2}
        totalTasks={3}
        concept={NET_15_MODULE.concepts[2]}
        conceptIndex={2}
        totalConcepts={3}
        isCompleted={false}
        onTaskSuccess={vi.fn()}
      />
    );
    expect(html15_ct).toContain('Stateful Connection Tracking (conntrack) Inspector');
    expect(html15_ct).toContain('WORKPLACE TICKET #117');

    // 4. Module 14 ICMP Traceroute Terminal
    const task14 = NET_14_MODULE.concepts[0].tasks[0];
    const html14 = renderToStaticMarkup(
      <NetworkingPracticeTaskView
        task={task14}
        taskIndex={0}
        totalTasks={3}
        concept={NET_14_MODULE.concepts[0]}
        conceptIndex={0}
        totalConcepts={3}
        isCompleted={false}
        onTaskSuccess={vi.fn()}
      />
    );
    expect(html14).toContain('data-testid="virtual-terminal-simulator"');
    expect(html14).toContain('Type &quot;tracert 93.184.216.34&quot;');
  });

  it('grades judgment submissions correctly across Modules 14, 15, 16', () => {
    // Module 16 Task 1: [0, 1]
    const task16_1 = NET_16_MODULE.concepts[0].tasks[0];
    const pass16_1 = gradeNetworkingSubmission({
      task: task16_1,
      userSql: '',
      judgmentAnswers: [0, 1],
    });
    expect(pass16_1.passed).toBe(true);
    const fail16_1 = gradeNetworkingSubmission({
      task: task16_1,
      userSql: '',
      judgmentAnswers: [1, 0],
    });
    expect(fail16_1.passed).toBe(false);

    // Module 16 Task 2: [1, 1]
    const task16_2 = NET_16_MODULE.concepts[1].tasks[0];
    const pass16_2 = gradeNetworkingSubmission({
      task: task16_2,
      userSql: '',
      judgmentAnswers: [1, 1],
    });
    expect(pass16_2.passed).toBe(true);

    // Module 16 Task 3: [1, 0]
    const task16_3 = NET_16_MODULE.concepts[2].tasks[0];
    const pass16_3 = gradeNetworkingSubmission({
      task: task16_3,
      userSql: '',
      judgmentAnswers: [1, 0],
    });
    expect(pass16_3.passed).toBe(true);

    // Module 15 Task 1: [1, 1]
    const task15_1 = NET_15_MODULE.concepts[0].tasks[0];
    const pass15_1 = gradeNetworkingSubmission({
      task: task15_1,
      userSql: '',
      judgmentAnswers: [1, 1],
    });
    expect(pass15_1.passed).toBe(true);

    // Module 15 Task 2: [1, 1]
    const task15_2 = NET_15_MODULE.concepts[1].tasks[0];
    const pass15_2 = gradeNetworkingSubmission({
      task: task15_2,
      userSql: '',
      judgmentAnswers: [1, 1],
    });
    expect(pass15_2.passed).toBe(true);

    // Module 15 Task 3: [1, 1]
    const task15_3 = NET_15_MODULE.concepts[2].tasks[0];
    const pass15_3 = gradeNetworkingSubmission({
      task: task15_3,
      userSql: '',
      judgmentAnswers: [1, 1],
    });
    expect(pass15_3.passed).toBe(true);

    // Module 14 Task 1: [1, 1]
    const task14_1 = NET_14_MODULE.concepts[0].tasks[0];
    const pass14_1 = gradeNetworkingSubmission({
      task: task14_1,
      userSql: '',
      judgmentAnswers: [1, 1],
    });
    expect(pass14_1.passed).toBe(true);

    // Module 14 Task 2: [1, 0]
    const task14_2 = NET_14_MODULE.concepts[1].tasks[0];
    const pass14_2 = gradeNetworkingSubmission({
      task: task14_2,
      userSql: '',
      judgmentAnswers: [1, 0],
    });
    expect(pass14_2.passed).toBe(true);

    // Module 14 Task 3: [2, 0]
    const task14_3 = NET_14_MODULE.concepts[2].tasks[0];
    const pass14_3 = gradeNetworkingSubmission({
      task: task14_3,
      userSql: '',
      judgmentAnswers: [2, 0],
    });
    expect(pass14_3.passed).toBe(true);

    // Module 14 Challenge 2: [1]
    const ch14_2 = NET_14_MODULE.challenge.tasks[1];
    const passCh14_2 = gradeNetworkingSubmission({
      task: ch14_2,
      userSql: '',
      judgmentAnswers: [1],
    });
    expect(passCh14_2.passed).toBe(true);
  });
});
