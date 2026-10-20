import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { NET_01_MODULE } from '../../src/content/networking/modules/net-01';
import { NET_02_MODULE } from '../../src/content/networking/modules/net-02';
import { NET_03_MODULE } from '../../src/content/networking/modules/net-03';
import { NetworkingPracticeTaskView } from '../../src/components/learning/networking/NetworkingPracticeTaskView';
import { VirtualTerminalSimulator } from '../../src/components/learning/networking/VirtualTerminalSimulator';
import { submitForTask } from '../../src/lib/track-submit';

describe('Milestone 1 — 11 Micro-Concepts & Physical Causality Architecture', () => {
  it('verifies Module 1 has exactly 4 micro-concepts in unbroken causal sequence', () => {
    expect(NET_01_MODULE.concepts).toHaveLength(4);
    const conceptIds = NET_01_MODULE.concepts.map((c) => c.id);
    expect(conceptIds).toEqual([
      'direct-link-mac',
      'copper-strands-full-duplex',
      'nic-permanent-mac-address',
      'encapsulation-segment-packet-frame',
    ]);
  });

  it('verifies Module 2 has exactly 3 micro-concepts detailing hub shared medium and collisions', () => {
    expect(NET_02_MODULE.concepts).toHaveLength(3);
    const conceptIds = NET_02_MODULE.concepts.map((c) => c.id);
    expect(conceptIds).toEqual([
      'shared-medium-collisions',
      'ethernet-framing-mtu-fcs',
      'mac-addresses-and-collision-domains',
    ]);
  });

  it('verifies Module 3 has exactly 4 micro-concepts detailing switch CAM self-learning and aging', () => {
    expect(NET_03_MODULE.concepts).toHaveLength(4);
    const conceptIds = NET_03_MODULE.concepts.map((c) => c.id);
    expect(conceptIds).toEqual([
      'mac-table-and-forwarding',
      'learning-by-listening',
      'unicast-vs-unknown-flooding',
      'table-aging-dynamic-eviction',
    ]);
  });

  it('verifies all 11 concepts possess complete 3-beat physical causality theories and MCQs', () => {
    const allConcepts = [
      ...NET_01_MODULE.concepts,
      ...NET_02_MODULE.concepts,
      ...NET_03_MODULE.concepts,
    ];
    expect(allConcepts).toHaveLength(11);

    for (const concept of allConcepts) {
      expect(concept.theory.summary.length).toBeGreaterThan(20);
      expect(concept.theory.explanation.length).toBeGreaterThanOrEqual(3);
      expect(concept.theory.mcqs).toBeDefined();
      expect(concept.theory.mcqs!.length).toBeGreaterThanOrEqual(1);
      for (const mcq of concept.theory.mcqs!) {
        expect(mcq.options.length).toBeGreaterThanOrEqual(3);
        expect(mcq.correctIndex).toBeGreaterThanOrEqual(0);
        expect(mcq.explanation.length).toBeGreaterThan(10);
      }
    }
  });
});

describe('Milestone 1 — Dual-OS CLI Terminal Diagnostics (Tickets #101, #102, #103)', () => {
  it('validates Ticket #101 in Module 1 provides dual Windows and Linux CLI diagnostics', () => {
    const task = NET_01_MODULE.concepts[0].tasks.find((t) => t.id === 'net01-p1-carrier-and-link-triage');
    expect(task).toBeDefined();
    expect(task!.terminal).toBeDefined();

    const term = task!.terminal!;
    expect(term.availableCommands).toContain('ipconfig /all');
    expect(term.availableCommands).toContain('ip link show');
    expect(term.availableCommands).toContain('ethtool eth0');

    // Windows verification
    expect(term.commandResponses['ipconfig /all']).toContain('Physical Address');
    expect(term.commandResponses['ipconfig /all']).toContain('Media disconnected');

    // Linux verification
    expect(term.commandResponses['ip link show']).toContain('link/ether');
    expect(term.commandResponses['ip link show']).toContain('state DOWN');
    expect(term.commandResponses['ethtool eth0']).toContain('Link detected: no');
  });

  it('validates Ticket #102 in Module 2 provides dual Cisco IOS and Linux collision diagnostics', () => {
    const task = NET_02_MODULE.concepts[2].tasks.find((t) => t.id === 'net02-p3-mac-collision-evaluation');
    expect(task).toBeDefined();
    expect(task!.terminal).toBeDefined();

    const term = task!.terminal!;
    expect(term.availableCommands).toContain('show interfaces status');
    expect(term.availableCommands).toContain('show interfaces fastEthernet 0/12');
    expect(term.availableCommands).toContain('ethtool -S eth0');

    // Cisco IOS verification
    expect(term.commandResponses['show interfaces status']).toContain('a-half');
    expect(term.commandResponses['show interfaces fastEthernet 0/12']).toContain('collisions');

    // Linux verification
    expect(term.commandResponses['ethtool -S eth0']).toContain('collision_errors');
  });

  it('validates Ticket #103 in Module 3 provides dual Cisco IOS and Linux MAC migration diagnostics', () => {
    const task = NET_03_MODULE.concepts[3].tasks.find((t) => t.id === 'net03-p4-station-migration');
    expect(task).toBeDefined();
    expect(task!.terminal).toBeDefined();

    const term = task!.terminal!;
    expect(term.availableCommands).toContain('show mac address-table dynamic');
    expect(term.availableCommands).toContain('show mac address-table aging-time');
    expect(term.availableCommands).toContain('bridge fdb show');

    // Cisco IOS verification
    expect(term.commandResponses['show mac address-table dynamic']).toContain('Mac Address Table');
    expect(term.commandResponses['show mac address-table dynamic']).toContain('DYNAMIC');
    expect(term.commandResponses['show mac address-table aging-time']).toContain('300 seconds');

    // Linux verification
    expect(term.commandResponses['bridge fdb show']).toContain('master br0');
  });
});

describe('Milestone 1 — UI Rendering & Grading Pipeline Execution', () => {
  const mockHooks = {
    execute: () => ({ success: true, columns: [], rows: [], rowCount: 0, executionTimeMs: 0 }),
  };

  it('renders VirtualTerminalSimulator for Ticket #101, #102, and #103 without errors', () => {
    const t101 = NET_01_MODULE.concepts[0].tasks[0].terminal!;
    const t102 = NET_02_MODULE.concepts[2].tasks[0].terminal!;
    const t103 = NET_03_MODULE.concepts[3].tasks[0].terminal!;

    const html101 = renderToStaticMarkup(<VirtualTerminalSimulator scenario={t101} title="Ticket 101" description="Test" />);
    expect(html101).toContain('Acme-PC-02');
    expect(html101).toContain('ipconfig /all');

    const html102 = renderToStaticMarkup(<VirtualTerminalSimulator scenario={t102} title="Ticket 102" description="Test" />);
    expect(html102).toContain('ACME-CORE-SW01');
    expect(html102).toContain('show interfaces status');

    const html103 = renderToStaticMarkup(<VirtualTerminalSimulator scenario={t103} title="Ticket 103" description="Test" />);
    expect(html103).toContain('ACME-DIST-SW01');
    expect(html103).toContain('show mac address-table dynamic');
  });

  it('renders NetworkingPracticeTaskView for Ticket #103 task mounting terminal simulator', () => {
    const task = NET_03_MODULE.concepts[3].tasks[0];
    const concept = NET_03_MODULE.concepts[3];

    const html = renderToStaticMarkup(
      <NetworkingPracticeTaskView
        task={task}
        taskIndex={0}
        totalTasks={1}
        concept={concept}
        onTaskSuccess={vi.fn()}
      />
    );

    expect(html).toContain('data-testid="virtual-terminal-simulator"');
    expect(html).toContain('ACME-DIST-SW01');
    expect(html).toContain('show mac address-table dynamic');
  });

  it('verifies every practice task across Modules 1, 2, and 3 passes submitForTask reference answers', () => {
    const allModules = [NET_01_MODULE, NET_02_MODULE, NET_03_MODULE];

    for (const mod of allModules) {
      for (const concept of mod.concepts) {
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
            `Task ${task.id} in ${mod.id} failed reference grading: ${outcome.feedback}`,
          ).toBe(true);
        }
      }
    }
  });
});
