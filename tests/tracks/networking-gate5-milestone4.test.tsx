/**
 * Gate 5 — Milestone 4: Default Gateways, Internetwork Routing & NAT Tests.
 * ─────────────────────────────────────────────────────────────────────────────
 * Verifies:
 *  1. Module registration: net-07 and net-08 are in NETWORKING_MODULES.
 *  2. Milestone registration: net-milestone-3 covers modules 7 and 8.
 *  3. Curriculum completeness: all concepts, tasks, and judgment options.
 *  4. net-07 judgment grader: Default Gateways, MAC rewrites, LPM, TTL loop drop.
 *  5. net-08 judgment grader: NAT quadrants, PAT port remapping, return de-NAT, unsolicited drop.
 *  6. isNetworkingTask classifier identifies all net-07/08 tasks.
 *  7. submitForTask central pipeline routes and grades all tasks.
 *  8. Wrong answer rejection with targeted feedback & misconception marking.
 *  9. Full solution sweep: all tasks pass with reference answers.
 * 10. UI Component rendering parity: NetworkingPracticeTaskView renders balanced split-pane.
 * 11. Zero regression: modules 1–6 remain intact.
 * 12. No module ID collisions across all 8 modules.
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  NETWORKING_MODULES,
  getNetworkingModuleById,
} from '../../src/content/networking/networking-curriculum-index';
import { NETWORKING_ROADMAP_MILESTONES } from '../../src/content/networking/networking-roadmap';
import { NET_07_MODULE } from '../../src/content/networking/modules/net-07';
import { NET_08_MODULE } from '../../src/content/networking/modules/net-08';
import {
  gradeNetworkingSubmission,
  isNetworkingTask,
} from '../../src/lib/network-engine/networking-submit-pipeline';
import { submitForTask } from '../../src/lib/track-submit';
import { NetworkingPracticeTaskView } from '../../src/components/learning/networking/NetworkingPracticeTaskView';
import type { PracticeTask } from '../../src/types/curriculum';

function collectAllTasks(...modules: typeof NET_07_MODULE[]): PracticeTask[] {
  const tasks: PracticeTask[] = [];
  for (const mod of modules) {
    for (const concept of mod.concepts) {
      tasks.push(...concept.tasks);
    }
    if (mod.challenge) {
      tasks.push(...mod.challenge.tasks);
    }
  }
  return tasks;
}

// ─────────────────────────────────────────────────────────────────────────────
// Test 1: Module Registration
// ─────────────────────────────────────────────────────────────────────────────

describe('Gate 5 Milestone 4 — Test 1: Module Registration', () => {
  it('registers net-07 in NETWORKING_MODULES with correct metadata', () => {
    const mod = getNetworkingModuleById('net-07');
    expect(mod).toBeDefined();
    expect(mod!.title).toContain('Default Gateways');
    expect(mod!.track).toBe('networking');
    expect(mod!.milestoneId).toBe('net-milestone-3');
    expect(mod!.curriculumOrder).toBe(7);
  });

  it('registers net-08 in NETWORKING_MODULES with correct metadata', () => {
    const mod = getNetworkingModuleById('net-08');
    expect(mod).toBeDefined();
    expect(mod!.title).toContain('Network Address Translation');
    expect(mod!.track).toBe('networking');
    expect(mod!.milestoneId).toBe('net-milestone-3');
    expect(mod!.curriculumOrder).toBe(8);
  });

  it('has 8 total modules in sequential order (net-01 through net-08)', () => {
    expect(NETWORKING_MODULES).toHaveLength(8);
    const ids = NETWORKING_MODULES.map((m) => m.id);
    expect(ids).toEqual([
      'net-01', 'net-02', 'net-03', 'net-04',
      'net-05', 'net-06', 'net-07', 'net-08',
    ]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test 2: Milestone Registration
// ─────────────────────────────────────────────────────────────────────────────

describe('Gate 5 Milestone 4 — Test 2: Milestone Registration', () => {
  it('has 3 milestones registered in NETWORKING_ROADMAP_MILESTONES', () => {
    expect(NETWORKING_ROADMAP_MILESTONES).toHaveLength(3);
    const ids = NETWORKING_ROADMAP_MILESTONES.map((m) => m.id);
    expect(ids).toEqual(['net-milestone-1', 'net-milestone-2', 'net-milestone-3']);
  });

  it('net-milestone-3 covers modules 7 and 8', () => {
    const m3 = NETWORKING_ROADMAP_MILESTONES.find((m) => m.id === 'net-milestone-3');
    expect(m3).toBeDefined();
    expect(m3!.moduleIds).toEqual(['net-07', 'net-08']);
    expect(m3!.number).toBe(3);
    expect(m3!.title).toContain('Routing & NAT');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test 3: Curriculum Completeness
// ─────────────────────────────────────────────────────────────────────────────

describe('Gate 5 Milestone 4 — Test 3: Curriculum Completeness', () => {
  it('net-07 has 3 concepts, each with tasks and completion learnings', () => {
    expect(NET_07_MODULE.concepts).toHaveLength(3);
    expect(NET_07_MODULE.completionLearnings.length).toBeGreaterThanOrEqual(4);
    for (const c of NET_07_MODULE.concepts) {
      expect(c.tasks.length).toBeGreaterThanOrEqual(1);
      expect(c.theory.explanation.length).toBeGreaterThan(0);
      expect(c.theory.keyTakeaway.length).toBeGreaterThan(0);
    }
  });

  it('net-07 has a module challenge with 2 tasks', () => {
    expect(NET_07_MODULE.challenge).toBeDefined();
    expect(NET_07_MODULE.challenge!.tasks).toHaveLength(2);
  });

  it('net-08 has 3 concepts, each with tasks and completion learnings', () => {
    expect(NET_08_MODULE.concepts).toHaveLength(3);
    expect(NET_08_MODULE.completionLearnings.length).toBeGreaterThanOrEqual(4);
    for (const c of NET_08_MODULE.concepts) {
      expect(c.tasks.length).toBeGreaterThanOrEqual(1);
      expect(c.theory.explanation.length).toBeGreaterThan(0);
      expect(c.theory.keyTakeaway.length).toBeGreaterThan(0);
    }
  });

  it('net-08 has a module challenge with 2 tasks', () => {
    expect(NET_08_MODULE.challenge).toBeDefined();
    expect(NET_08_MODULE.challenge!.tasks).toHaveLength(2);
  });

  it('all tasks across net-07 and net-08 have valid judgment questions', () => {
    const allTasks = collectAllTasks(NET_07_MODULE, NET_08_MODULE);
    expect(allTasks.length).toBe(10); // (3+2 in net-07) + (3+2 in net-08)

    for (const task of allTasks) {
      const judgments = task.validation.judgment ?? [];
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

// ─────────────────────────────────────────────────────────────────────────────
// Test 4: net-07 Grader (Routing & Default Gateways)
// ─────────────────────────────────────────────────────────────────────────────

describe('Gate 5 Milestone 4 — Test 4: net-07 Judgment Grader', () => {
  const p1 = NET_07_MODULE.concepts[0].tasks[0]; // gateway & mac rewrites
  const p2 = NET_07_MODULE.concepts[1].tasks[0]; // longest prefix match
  const p3 = NET_07_MODULE.concepts[2].tasks[0]; // ttl loop mitigation

  it('passes net07-p1 with correct gateway MAC and MAC rewrite answers', () => {
    const res = gradeNetworkingSubmission({
      task: p1,
      judgmentAnswers: [1, 1], // Gateway MAC, MAC rewrites while IP preserved
    });
    expect(res.passed).toBe(true);
  });

  it('fails net07-p1 Q1 when learner wrongly picks destination host MAC directly', () => {
    const res = gradeNetworkingSubmission({
      task: p1,
      judgmentAnswers: [0, 1], // wrong: Server Z MAC
    });
    expect(res.passed).toBe(false);
    expect(res.feedback).toContain('Question 1');
  });

  it('passes net07-p2 LPM and default route evaluation', () => {
    const res = gradeNetworkingSubmission({
      task: p2,
      judgmentAnswers: [1, 1], // /24 wins by LPM, 0.0.0.0/0 default route
    });
    expect(res.passed).toBe(true);
  });

  it('passes net07-p3 TTL decrement and loop mitigation check', () => {
    const res = gradeNetworkingSubmission({
      task: p3,
      judgmentAnswers: [1, 1], // TTL=124, ICMP Time Exceeded drops loop
    });
    expect(res.passed).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test 5: net-08 Grader (NAT & PAT)
// ─────────────────────────────────────────────────────────────────────────────

describe('Gate 5 Milestone 4 — Test 5: net-08 Judgment Grader', () => {
  const p1 = NET_08_MODULE.concepts[0].tasks[0]; // inside/outside terminology
  const p2 = NET_08_MODULE.concepts[1].tasks[0]; // pat port multiplexing
  const p3 = NET_08_MODULE.concepts[2].tasks[0]; // return flows & security

  it('passes net08-p1 with correct inside local and inside global identification', () => {
    const res = gradeNetworkingSubmission({
      task: p1,
      judgmentAnswers: [1, 1], // 10.50.1.25 is Inside Local, 203.0.113.10 is Inside Global
    });
    expect(res.passed).toBe(true);
  });

  it('passes net08-p2 PAT source port disambiguation reasoning', () => {
    const res = gradeNetworkingSubmission({
      task: p2,
      judgmentAnswers: [1, 1], // alternate port assigned, required for return demux
    });
    expect(res.passed).toBe(true);
  });

  it('fails net08-p2 when learner believes colliding ports are dropped', () => {
    const res = gradeNetworkingSubmission({
      task: p2,
      judgmentAnswers: [0, 1], // wrong: dropped with ICMP port unreachable
    });
    expect(res.passed).toBe(false);
    expect(res.feedback).toContain('Question 1');
  });

  it('passes net08-p3 return flow de-NATting and unsolicited drop analysis', () => {
    const res = gradeNetworkingSubmission({
      task: p3,
      judgmentAnswers: [1, 1], // de-NATted via state table, unsolicited dropped
    });
    expect(res.passed).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test 6: Task Classification via isNetworkingTask
// ─────────────────────────────────────────────────────────────────────────────

describe('Gate 5 Milestone 4 — Test 6: Task Classification via isNetworkingTask', () => {
  it('correctly identifies all 10 tasks in net-07 and net-08 as networking tasks', () => {
    const allTasks = collectAllTasks(NET_07_MODULE, NET_08_MODULE);
    for (const task of allTasks) {
      expect(
        isNetworkingTask(task),
        `Task ${task.id} was not identified as a networking task`,
      ).toBe(true);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test 7: Central Pipeline Routing via submitForTask
// ─────────────────────────────────────────────────────────────────────────────

describe('Gate 5 Milestone 4 — Test 7: Central Pipeline Routing via submitForTask', () => {
  const mockHooks = {
    execute: () => ({ success: true, columns: [], rows: [], rowCount: 0, executionTimeMs: 0 }),
  };

  it('grades all practice and challenge tasks through submitForTask', () => {
    const allTasks = collectAllTasks(NET_07_MODULE, NET_08_MODULE);

    for (const task of allTasks) {
      const judgments = task.validation.judgment ?? [];
      const correctAnswers = judgments.map((j) => j.correctIndex);

      // Must pass with correct answers
      const passOutcome = submitForTask({
        task,
        code: '',
        hooks: mockHooks,
        judgmentAnswers: correctAnswers,
        surface: 'lesson',
      });
      expect(
        passOutcome.passed,
        `Task ${task.id} failed submitForTask: ${passOutcome.feedback}`,
      ).toBe(true);

      // Must fail with stage 'validation' when answers are omitted
      const emptyOutcome = submitForTask({
        task,
        code: '',
        hooks: mockHooks,
        judgmentAnswers: judgments.map(() => null),
        surface: 'lesson',
      });
      expect(emptyOutcome.passed).toBe(false);
      expect(emptyOutcome.stage).toBe('validation');
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test 8: Challenge Tasks Execution
// ─────────────────────────────────────────────────────────────────────────────

describe('Gate 5 Milestone 4 — Test 8: Module Challenges', () => {
  const mockHooks = {
    execute: () => ({ success: true, columns: [], rows: [], rowCount: 0, executionTimeMs: 0 }),
  };

  it('net-07 Challenge 1 (multi-hop packet trace) grades correctly', () => {
    const ch1 = NET_07_MODULE.challenge!.tasks[0];
    const passOutcome = submitForTask({
      task: ch1,
      code: '',
      hooks: mockHooks,
      judgmentAnswers: [1], // R1 WAN -> R2 WAN MACs, Host A -> Server B IPs
      surface: 'challenge',
    });
    expect(passOutcome.passed).toBe(true);
  });

  it('net-07 Challenge 2 (LPM decision) grades correctly', () => {
    const ch2 = NET_07_MODULE.challenge!.tasks[1];
    const passOutcome = submitForTask({
      task: ch2,
      code: '',
      hooks: mockHooks,
      judgmentAnswers: [1], // /20 route via 192.168.0.3 wins by LPM
      surface: 'challenge',
    });
    expect(passOutcome.passed).toBe(true);
  });

  it('net-08 Challenge 1 (PAT table reconstruction) grades correctly', () => {
    const ch1 = NET_08_MODULE.challenge!.tasks[0];
    const passOutcome = submitForTask({
      task: ch1,
      code: '',
      hooks: mockHooks,
      judgmentAnswers: [0], // Local 10.0.0.15:52000 <-> Global 198.51.100.2:63400
      surface: 'challenge',
    });
    expect(passOutcome.passed).toBe(true);
  });

  it('net-08 Challenge 2 (inbound web server port forwarding) grades correctly', () => {
    const ch2 = NET_08_MODULE.challenge!.tasks[1];
    const passOutcome = submitForTask({
      task: ch2,
      code: '',
      hooks: mockHooks,
      judgmentAnswers: [1], // Dynamic PAT drops unsolicited; needs static Port Forwarding
      surface: 'challenge',
    });
    expect(passOutcome.passed).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test 9: UI Component Rendering Parity
// ─────────────────────────────────────────────────────────────────────────────

describe('Gate 5 Milestone 4 — Test 9: UI Component Rendering Parity', () => {
  it('renders net-07 practice task with clean instructions and no phantom switch lab', () => {
    const task07p1 = NET_07_MODULE.concepts[0].tasks[0];
    const concept07 = NET_07_MODULE.concepts[0];

    const html = renderToStaticMarkup(
      <NetworkingPracticeTaskView
        task={task07p1}
        taskIndex={0}
        totalTasks={3}
        concept={concept07}
        onTaskSuccess={vi.fn()}
      />
    );

    expect(html).toContain('Prediction &amp; Causal Defense');
    expect(html).toContain('Check Prediction');
    expect(html).toContain('What destination MAC address does Host A place');
    expect(html).not.toContain('data-testid="switch-simulation-lab"');
    expect(html).not.toContain('Direct Port Inspection &amp; Selection:');
  });

  it('renders net-08 challenge task cleanly without concept prop', () => {
    const chTask = NET_08_MODULE.challenge!.tasks[1];

    const html = renderToStaticMarkup(
      <NetworkingPracticeTaskView
        task={chTask}
        taskIndex={1}
        totalTasks={2}
        isChallenge={true}
        onTaskSuccess={vi.fn()}
      />
    );

    expect(html).toContain('Module Challenge Task');
    expect(html).toContain('Inbound Web Hosting');
    expect(html).toContain('Port Forwarding Diagnosis');
    expect(html).toContain('Check Prediction');
    expect(html).not.toContain('data-testid="switch-simulation-lab"');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test 10: Zero Regression & Unique IDs
// ─────────────────────────────────────────────────────────────────────────────

describe('Gate 5 Milestone 4 — Test 10: Zero Regression & Collision Isolation', () => {
  it('all 8 module IDs in NETWORKING_MODULES are unique and match net-NN pattern', () => {
    const ids = NETWORKING_MODULES.map((m) => m.id);
    expect(ids).toHaveLength(8);
    const unique = new Set(ids);
    expect(unique.size).toBe(8);
    for (const id of ids) {
      expect(id).toMatch(/^net-\d{2}$/);
    }
  });

  it('modules 1 through 6 remain registered with expected milestones', () => {
    expect(getNetworkingModuleById('net-01')!.milestoneId).toBe('net-milestone-1');
    expect(getNetworkingModuleById('net-02')!.milestoneId).toBe('net-milestone-1');
    expect(getNetworkingModuleById('net-03')!.milestoneId).toBe('net-milestone-1');
    expect(getNetworkingModuleById('net-04')!.milestoneId).toBe('net-milestone-2');
    expect(getNetworkingModuleById('net-05')!.milestoneId).toBe('net-milestone-2');
    expect(getNetworkingModuleById('net-06')!.milestoneId).toBe('net-milestone-2');
  });
});
