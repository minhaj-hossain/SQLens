/**
 * Gate 5 Milestones 5+ (Milestones 4–7: net-09 through net-16) Test Suite.
 * ─────────────────────────────────────────────────────────────────────────────
 * Validates the complete delivery of all remaining modules in the Networking track:
 *  - net-09: Dynamic Host Configuration Protocol (DHCP)
 *  - net-10: Domain Name System (DNS)
 *  - net-11: Transport Layer: UDP & TCP Foundations
 *  - net-12: TCP Reliability, Flow Control & Teardown
 *  - net-13: Application Protocols: HTTP & TLS/HTTPS
 *  - net-14: Diagnostics & Windows Office Troubleshooting
 *  - net-15: Boundary Security, Firewalls & STP
 *  - net-16: VLANs, Wireless & Enterprise Routing
 *
 * Verifies:
 *  1. Module registration in curriculum index and roadmap milestones.
 *  2. Curriculum completeness (3 concepts, tasks, challenge scenarios).
 *  3. Accurate protocol judgment questions and explanations.
 *  4. submitForTask pipeline grading and isNetworkingTask classification.
 *  5. Challenge task grading.
 *  6. Responsive UI rendering parity via NetworkingPracticeTaskView.
 *  7. Zero regressions and collision isolation.
 */

import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

import {
  NETWORKING_MODULES,
  getNetworkingModuleById,
} from '../../src/content/networking/networking-curriculum-index';
import { NETWORKING_ROADMAP_MILESTONES } from '../../src/content/networking/networking-roadmap';
import { NET_09_MODULE } from '../../src/content/networking/modules/net-09';
import { NET_10_MODULE } from '../../src/content/networking/modules/net-10';
import { NET_11_MODULE } from '../../src/content/networking/modules/net-11';
import { NET_12_MODULE } from '../../src/content/networking/modules/net-12';
import { NET_13_MODULE } from '../../src/content/networking/modules/net-13';
import { NET_14_MODULE } from '../../src/content/networking/modules/net-14';
import { NET_15_MODULE } from '../../src/content/networking/modules/net-15';
import { NET_16_MODULE } from '../../src/content/networking/modules/net-16';
import {
  gradeNetworkingSubmission,
  isNetworkingTask,
} from '../../src/lib/network-engine/networking-submit-pipeline';
import { submitForTask } from '../../src/lib/track-submit';
import { NetworkingPracticeTaskView } from '../../src/components/learning/networking/NetworkingPracticeTaskView';
import type { PracticeTask } from '../../src/types/curriculum';

const MODULES_5_PLUS = [
  NET_09_MODULE,
  NET_10_MODULE,
  NET_11_MODULE,
  NET_12_MODULE,
  NET_13_MODULE,
  NET_14_MODULE,
  NET_15_MODULE,
  NET_16_MODULE,
];

// ─────────────────────────────────────────────────────────────────────────────
// Test 1: Module Registration
// ─────────────────────────────────────────────────────────────────────────────

describe('Gate 5 M5+ — Test 1: Module Registration', () => {
  it('registers all 8 modules (net-09 through net-16) with proper metadata', () => {
    for (let i = 0; i < MODULES_5_PLUS.length; i++) {
      const mod = MODULES_5_PLUS[i];
      const dayNum = i + 9;
      const pad = String(dayNum).padStart(2, '0');
      const expectedId = `net-${pad}`;

      expect(mod.id).toBe(expectedId);
      expect(mod.curriculumOrder).toBe(dayNum);
      expect(mod.day).toBe(dayNum);
      expect(mod.track).toBe('networking');
      expect(mod.displayLabel).toBe(`Module ${dayNum}`);

      const retrieved = getNetworkingModuleById(expectedId);
      expect(retrieved).toBeDefined();
      expect(retrieved!.id).toBe(expectedId);
    }
  });

  it('NETWORKING_MODULES contains exactly 16 modules in sequential order', () => {
    expect(NETWORKING_MODULES).toHaveLength(16);
    const ids = NETWORKING_MODULES.map((m) => m.id);
    expect(ids).toEqual([
      'net-01', 'net-02', 'net-03', 'net-04',
      'net-05', 'net-06', 'net-07', 'net-08',
      'net-09', 'net-10', 'net-11', 'net-12',
      'net-13', 'net-14', 'net-15', 'net-16',
    ]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test 2: Milestone Registration
// ─────────────────────────────────────────────────────────────────────────────

describe('Gate 5 M5+ — Test 2: Roadmap Milestones', () => {
  it('has 7 milestones registered in NETWORKING_ROADMAP_MILESTONES', () => {
    expect(NETWORKING_ROADMAP_MILESTONES).toHaveLength(7);
    const ids = NETWORKING_ROADMAP_MILESTONES.map((m) => m.id);
    expect(ids).toEqual([
      'net-milestone-1',
      'net-milestone-2',
      'net-milestone-3',
      'net-milestone-4',
      'net-milestone-5',
      'net-milestone-6',
      'net-milestone-7',
    ]);
  });

  it('milestones 4 through 7 cover their respective module sets', () => {
    const m4 = NETWORKING_ROADMAP_MILESTONES.find((m) => m.id === 'net-milestone-4');
    expect(m4?.moduleIds).toEqual(['net-09', 'net-10']);

    const m5 = NETWORKING_ROADMAP_MILESTONES.find((m) => m.id === 'net-milestone-5');
    expect(m5?.moduleIds).toEqual(['net-11', 'net-12', 'net-13']);

    const m6 = NETWORKING_ROADMAP_MILESTONES.find((m) => m.id === 'net-milestone-6');
    expect(m6?.moduleIds).toEqual(['net-14']);

    const m7 = NETWORKING_ROADMAP_MILESTONES.find((m) => m.id === 'net-milestone-7');
    expect(m7?.moduleIds).toEqual(['net-15', 'net-16']);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test 3: Curriculum Completeness & Concept Integrity
// ─────────────────────────────────────────────────────────────────────────────

describe('Gate 5 M5+ — Test 3: Curriculum Completeness', () => {
  it('every module has 3 concepts, tasks, and completion learnings', () => {
    for (const mod of MODULES_5_PLUS) {
      expect(mod.concepts).toHaveLength(3);
      expect(mod.completionLearnings.length).toBeGreaterThanOrEqual(4);

      for (const concept of mod.concepts) {
        expect(concept.theory.explanation.length).toBeGreaterThan(0);
        expect(concept.tasks.length).toBeGreaterThan(0);
      }
    }
  });

  it('every module has a challenge with scenario and 2 tasks', () => {
    for (const mod of MODULES_5_PLUS) {
      expect(mod.challenge).toBeDefined();
      expect(mod.challenge!.scenario).toBeDefined();
      expect(mod.challenge!.scenario.length).toBeGreaterThan(15);
      expect(mod.challenge!.tasks).toHaveLength(2);
    }
  });

  it('all tasks have valid choose-and-defend judgment validations', () => {
    for (const mod of MODULES_5_PLUS) {
      const allTasks = [
        ...mod.concepts.flatMap((c) => c.tasks),
        ...mod.challenge!.tasks,
      ];

      for (const task of allTasks) {
        expect(task.solutionSql).toBe('NETWORKING_JUDGMENT_TASK');
        expect(task.validation?.judgment).toBeDefined();
        const judgments = task.validation!.judgment!;
        expect(judgments.length).toBeGreaterThan(0);

        for (const j of judgments) {
          expect(j.prompt.length).toBeGreaterThan(5);
          expect(j.options.length).toBeGreaterThanOrEqual(3);
          expect(j.correctIndex).toBeGreaterThanOrEqual(0);
          expect(j.correctIndex).toBeLessThan(j.options.length);
          expect(j.explanation.length).toBeGreaterThan(10);
        }
      }
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test 4: Deterministic Judgment Grading Across All Modules
// ─────────────────────────────────────────────────────────────────────────────

describe('Gate 5 M5+ — Test 4: Judgment Validation Accuracy', () => {
  // Module 9: DHCP
  it('grades net-09 DHCP bootstrap and DORA questions correctly', () => {
    const task = NET_09_MODULE.concepts[0].tasks[0] as PracticeTask;
    const outcome = gradeNetworkingSubmission({
      task,
      judgmentAnswers: [1, 1],
    });
    expect(outcome.passed).toBe(true);

    const failOutcome = gradeNetworkingSubmission({
      task,
      judgmentAnswers: [0, 1], // Wrong source IP
    });
    expect(failOutcome.passed).toBe(false);
  });

  // Module 10: DNS
  it('grades net-10 DNS hierarchy and TCP 53 truncation questions correctly', () => {
    const task = NET_10_MODULE.concepts[1].tasks[0] as PracticeTask;
    const outcome = gradeNetworkingSubmission({
      task,
      judgmentAnswers: [1, 1],
    });
    expect(outcome.passed).toBe(true);

    const failOutcome = gradeNetworkingSubmission({
      task,
      judgmentAnswers: [1, 0], // Wrong TC handling
    });
    expect(failOutcome.passed).toBe(false);
  });

  // Module 11: Transport
  it('grades net-11 5-tuple socket and TCP handshake questions correctly', () => {
    const task = NET_11_MODULE.concepts[2].tasks[0] as PracticeTask;
    const outcome = gradeNetworkingSubmission({
      task,
      judgmentAnswers: [0, 1],
    });
    expect(outcome.passed).toBe(true);

    const failOutcome = gradeNetworkingSubmission({
      task,
      judgmentAnswers: [1, 1],
    });
    expect(failOutcome.passed).toBe(false);
  });

  // Module 12: TCP Reliability
  it('grades net-12 sequence math and duplicate ACK questions correctly', () => {
    const task = NET_12_MODULE.concepts[0].tasks[0] as PracticeTask;
    const outcome = gradeNetworkingSubmission({
      task,
      judgmentAnswers: [1, 1],
    });
    expect(outcome.passed).toBe(true);
  });

  // Module 13: HTTP & TLS
  it('grades net-13 status codes and TLS 1.3 forward secrecy correctly', () => {
    const task = NET_13_MODULE.concepts[2].tasks[0] as PracticeTask;
    const outcome = gradeNetworkingSubmission({
      task,
      judgmentAnswers: [1, 1],
    });
    expect(outcome.passed).toBe(true);
  });

  // Module 14: Diagnostics
  it('grades net-14 traceroute TTL and ping triage correctly', () => {
    const task = NET_14_MODULE.concepts[0].tasks[0] as PracticeTask;
    const outcome = gradeNetworkingSubmission({
      task,
      judgmentAnswers: [1, 1],
    });
    expect(outcome.passed).toBe(true);
  });

  // Module 15: Security & STP
  it('grades net-15 STP root priority and stateless ACL correctly', () => {
    const task = NET_15_MODULE.concepts[0].tasks[0] as PracticeTask;
    const outcome = gradeNetworkingSubmission({
      task,
      judgmentAnswers: [1, 1],
    });
    expect(outcome.passed).toBe(true);
  });

  // Module 16: VLANs, Wireless & Routing
  it('grades net-16 802.1Q tags and Wi-Fi channels correctly', () => {
    const task = NET_16_MODULE.concepts[1].tasks[0] as PracticeTask;
    const outcome = gradeNetworkingSubmission({
      task,
      judgmentAnswers: [1, 1],
    });
    expect(outcome.passed).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test 5: isNetworkingTask Classifier & submitForTask Pipeline
// ─────────────────────────────────────────────────────────────────────────────

describe('Gate 5 M5+ — Test 5: Pipeline Central Routing', () => {
  it('identifies every practice and challenge task in modules 9–16 as networking tasks', () => {
    for (const mod of MODULES_5_PLUS) {
      const tasks = [
        ...mod.concepts.flatMap((c) => c.tasks),
        ...mod.challenge!.tasks,
      ];
      for (const t of tasks) {
        expect(isNetworkingTask(t as PracticeTask)).toBe(true);
      }
    }
  });

  const mockHooks = {
    execute: () => ({ success: true, columns: [], rows: [], rowCount: 0, executionTimeMs: 0 }),
  };

  it('grades tasks through central submitForTask', () => {
    const task = NET_09_MODULE.concepts[0].tasks[0] as PracticeTask;
    const result = submitForTask({
      task,
      code: '',
      hooks: mockHooks as any,
      surface: 'lesson',
      judgmentAnswers: [1, 1],
    });

    expect(result.passed).toBe(true);
    expect(result.stage).toBe('validation');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test 6: Challenge Tasks Grading
// ─────────────────────────────────────────────────────────────────────────────

describe('Gate 5 M5+ — Test 6: Challenge Tasks Evaluation', () => {
  it('grades all 16 challenge tasks successfully with correct answers', () => {
    for (const mod of MODULES_5_PLUS) {
      for (const chTask of mod.challenge!.tasks) {
        const correctAnswers = chTask.validation!.judgment!.map((j) => j.correctIndex);
        const outcome = gradeNetworkingSubmission({
          task: chTask as PracticeTask,
          judgmentAnswers: correctAnswers,
        });
        expect(outcome.passed).toBe(true);
      }
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test 7: UI Rendering Parity
// ─────────────────────────────────────────────────────────────────────────────

describe('Gate 5 M5+ — Test 7: UI Rendering Parity', () => {
  it('renders net-14 practice task cleanly with instructions and assessment', () => {
    const task = NET_14_MODULE.concepts[2].tasks[0] as PracticeTask;
    const html = renderToStaticMarkup(
      <NetworkingPracticeTaskView
        task={task}
        concept={NET_14_MODULE.concepts[2]}
        taskIndex={0}
        totalTasks={1}
        onTaskSuccess={vi.fn()}
      />
    );

    expect(html).toContain('Systematic Bottom-Up Triage in Action');
    expect(html).toContain('Check Prediction');
    expect(html).not.toContain('data-testid="switch-simulation-lab"');
  });

  it('renders net-16 challenge task cleanly without concept prop', () => {
    const chTask = NET_16_MODULE.challenge!.tasks[0] as PracticeTask;
    const html = renderToStaticMarkup(
      <NetworkingPracticeTaskView
        task={chTask}
        taskIndex={0}
        totalTasks={2}
        isChallenge={true}
        onTaskSuccess={vi.fn()}
      />
    );

    expect(html).toContain('Module Challenge Task');
    expect(html).toContain('Troubleshooting Inter-VLAN Trunking Failures');
    expect(html).not.toContain('data-testid="switch-simulation-lab"');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test 8: Zero Regression & Unique IDs Across All 16 Modules
// ─────────────────────────────────────────────────────────────────────────────

describe('Gate 5 M5+ — Test 8: Zero Regression & Collision Isolation', () => {
  it('all 16 module IDs are unique and formatted net-NN', () => {
    const ids = NETWORKING_MODULES.map((m) => m.id);
    expect(ids).toHaveLength(16);
    const set = new Set(ids);
    expect(set.size).toBe(16);
    for (const id of ids) {
      expect(id).toMatch(/^net-\d{2}$/);
    }
  });

  it('all task IDs across the entire track are strictly unique', () => {
    const allTaskIds: string[] = [];
    for (const mod of NETWORKING_MODULES) {
      for (const concept of mod.concepts) {
        for (const task of concept.tasks) {
          allTaskIds.push(task.id);
        }
      }
      if (mod.challenge) {
        for (const task of mod.challenge.tasks) {
          allTaskIds.push(task.id);
        }
      }
    }

    const uniqueTaskIds = new Set(allTaskIds);
    expect(uniqueTaskIds.size).toBe(allTaskIds.length);
  });
});
