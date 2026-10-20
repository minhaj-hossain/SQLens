/**
 * Gate 5 — Milestone 3: Networking Addressing & Resolution Tests.
 * ─────────────────────────────────────────────────────────────────────────────
 * Verifies:
 *  1. Module registration: net-04, net-05, net-06 are in NETWORKING_MODULES.
 *  2. Milestone registration: net-milestone-2 covers modules 4–6.
 *  3. Curriculum completeness: all 3 modules have concepts, tasks, and valid judgment questions.
 *  4. net-04 judgment grader: IPv4 classification, subnet AND decision, CIDR sizing.
 *  5. net-05 judgment grader: ARP exchange, cache reasoning, mask mismatch diagnosis.
 *  6. net-06 judgment grader: IPv6 compression, scope classification, NDP/SLAAC.
 *  7. Grader rejects wrong answers with targeted feedback.
 *  8. Grader accepts all correct answers (full solution sweep).
 *  9. Zero regression: net-01, net-02, net-03 modules remain intact.
 * 10. No module ID collisions in the full NETWORKING_MODULES array.
 */

import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { NETWORKING_MODULES, getNetworkingModuleById } from '../../src/content/networking/networking-curriculum-index';
import { NETWORKING_ROADMAP_MILESTONES } from '../../src/content/networking/networking-roadmap';
import { NET_04_MODULE } from '../../src/content/networking/modules/net-04';
import { NET_05_MODULE } from '../../src/content/networking/modules/net-05';
import { NET_06_MODULE } from '../../src/content/networking/modules/net-06';
import {
  gradeNetworkingSubmission,
  isNetworkingTask,
} from '../../src/lib/network-engine/networking-submit-pipeline';
import { submitForTask } from '../../src/lib/track-submit';
import { NetworkingPracticeTaskView } from '../../src/components/learning/networking/NetworkingPracticeTaskView';
import type { PracticeTask } from '../../src/types/curriculum';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function collectAllTasks(...modules: typeof NET_04_MODULE[]): PracticeTask[] {
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

describe('Gate 5 Milestone 3 — Test 1: Module Registration', () => {
  it('registers net-04 in NETWORKING_MODULES', () => {
    const mod = getNetworkingModuleById('net-04');
    expect(mod).toBeDefined();
    expect(mod!.title).toContain('IPv4');
    expect(mod!.track).toBe('networking');
    expect(mod!.milestoneId).toBe('net-milestone-2');
  });

  it('registers net-05 in NETWORKING_MODULES', () => {
    const mod = getNetworkingModuleById('net-05');
    expect(mod).toBeDefined();
    expect(mod!.title).toContain('ARP');
    expect(mod!.track).toBe('networking');
    expect(mod!.milestoneId).toBe('net-milestone-2');
  });

  it('registers net-06 in NETWORKING_MODULES', () => {
    const mod = getNetworkingModuleById('net-06');
    expect(mod).toBeDefined();
    expect(mod!.title).toContain('IPv6');
    expect(mod!.track).toBe('networking');
    expect(mod!.milestoneId).toBe('net-milestone-2');
  });

  it('has at least 6 total modules with net-01 through net-06 in order', () => {
    expect(NETWORKING_MODULES.length).toBeGreaterThanOrEqual(6);
    const ids = NETWORKING_MODULES.slice(0, 6).map((m) => m.id);
    expect(ids).toEqual(['net-01', 'net-02', 'net-03', 'net-04', 'net-05', 'net-06']);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test 2: Milestone Registration
// ─────────────────────────────────────────────────────────────────────────────

describe('Gate 5 Milestone 3 — Test 2: Milestone Registration', () => {
  it('has milestones: net-milestone-1 and net-milestone-2', () => {
    expect(NETWORKING_ROADMAP_MILESTONES.length).toBeGreaterThanOrEqual(2);
    const ids = NETWORKING_ROADMAP_MILESTONES.map((m) => m.id);
    expect(ids).toContain('net-milestone-1');
    expect(ids).toContain('net-milestone-2');
  });

  it('net-milestone-2 covers modules 4, 5, and 6', () => {
    const m2 = NETWORKING_ROADMAP_MILESTONES.find((m) => m.id === 'net-milestone-2');
    expect(m2).toBeDefined();
    expect(m2!.moduleIds).toEqual(['net-04', 'net-05', 'net-06']);
    expect(m2!.number).toBe(2);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test 3: Curriculum Completeness
// ─────────────────────────────────────────────────────────────────────────────

describe('Gate 5 Milestone 3 — Test 3: Curriculum Completeness', () => {
  it('net-04 has 3 concepts and all concepts have tasks', () => {
    expect(NET_04_MODULE.concepts).toHaveLength(3);
    for (const concept of NET_04_MODULE.concepts) {
      expect(concept.tasks.length).toBeGreaterThanOrEqual(1);
      expect(concept.theory.explanation.length).toBeGreaterThan(0);
      expect(concept.theory.keyTakeaway.length).toBeGreaterThan(0);
    }
  });

  it('net-04 has a module challenge with 2 tasks', () => {
    expect(NET_04_MODULE.challenge).toBeDefined();
    expect(NET_04_MODULE.challenge!.tasks).toHaveLength(2);
  });

  it('net-05 has 3 concepts and all concepts have tasks', () => {
    expect(NET_05_MODULE.concepts).toHaveLength(3);
    for (const concept of NET_05_MODULE.concepts) {
      expect(concept.tasks.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('net-06 has 3 concepts and all concepts have tasks', () => {
    expect(NET_06_MODULE.concepts).toHaveLength(3);
    for (const concept of NET_06_MODULE.concepts) {
      expect(concept.tasks.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('all tasks across net-04, net-05, net-06 have judgment validation questions', () => {
    const allTasks = collectAllTasks(NET_04_MODULE, NET_05_MODULE, NET_06_MODULE);
    for (const task of allTasks) {
      const judgments = task.validation.judgment ?? [];
      expect(judgments.length).toBeGreaterThanOrEqual(1);
      for (const j of judgments) {
        expect(j.options.length).toBeGreaterThanOrEqual(3);
        expect(j.correctIndex).toBeGreaterThanOrEqual(0);
        expect(j.correctIndex).toBeLessThan(j.options.length);
        expect(j.explanation.length).toBeGreaterThan(10);
      }
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test 4: net-04 Grader (IPv4)
// ─────────────────────────────────────────────────────────────────────────────

describe('Gate 5 Milestone 3 — Test 4: net-04 Judgment Grader', () => {
  const task04p1 = NET_04_MODULE.concepts[0].tasks[0]; // net04-p1-ip-need
  const task04p2 = NET_04_MODULE.concepts[1].tasks[0]; // net04-p2-subnet-decision
  const task04p3 = NET_04_MODULE.concepts[2].tasks[0]; // net04-p3-cidr-sizing

  it('passes net04-p1 when both judgment answers are correct', () => {
    const result = gradeNetworkingSubmission({
      task: task04p1,
      judgmentAnswers: [1, 1], // correctIndexes for both questions
    });
    expect(result.passed).toBe(true);
  });

  it('fails net04-p1 Q1 when wrong MAC hierarchy answer given', () => {
    const result = gradeNetworkingSubmission({
      task: task04p1,
      judgmentAnswers: [0, 1], // Q1 wrong (option 0 = "MAC too short")
    });
    expect(result.passed).toBe(false);
    expect(result.feedback).toContain('Question 1');
  });

  it('fails net04-p1 Q2 when wrong RFC 1918 answer given', () => {
    const result = gradeNetworkingSubmission({
      task: task04p1,
      judgmentAnswers: [1, 0], // Q2 wrong (option 0 = 203.0.113.5 public)
    });
    expect(result.passed).toBe(false);
    expect(result.feedback).toContain('Question 2');
  });

  it('passes net04-p2 when both subnet decision answers are correct', () => {
    const result = gradeNetworkingSubmission({
      task: task04p2,
      judgmentAnswers: [1, 1], // local ARP, then remote gateway
    });
    expect(result.passed).toBe(true);
  });

  it('passes net04-p3 when both CIDR answers are correct', () => {
    const result = gradeNetworkingSubmission({
      task: task04p3,
      judgmentAnswers: [1, 1], // /26 for 50 hosts, /31 for WAN
    });
    expect(result.passed).toBe(true);
  });

  it('rejects unanswered net04 judgment question with prompt text in feedback', () => {
    const result = gradeNetworkingSubmission({
      task: task04p1,
      judgmentAnswers: [null, 1],
    });
    expect(result.passed).toBe(false);
    expect(result.feedback).toContain('answer question 1');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test 5: net-05 Grader (ARP)
// ─────────────────────────────────────────────────────────────────────────────

describe('Gate 5 Milestone 3 — Test 5: net-05 Judgment Grader', () => {
  const task05p1 = NET_05_MODULE.concepts[0].tasks[0]; // arp-exchange
  const task05p2 = NET_05_MODULE.concepts[1].tasks[0]; // arp-cache
  const task05p3 = NET_05_MODULE.concepts[2].tasks[0]; // mask-mismatch

  it('passes net05-p1 ARP exchange when both answers are correct', () => {
    const result = gradeNetworkingSubmission({
      task: task05p1,
      judgmentAnswers: [1, 1], // broadcast MAC, unicast reply
    });
    expect(result.passed).toBe(true);
  });

  it('fails net05-p1 Q1 when learner wrongly picks destination MAC', () => {
    const result = gradeNetworkingSubmission({
      task: task05p1,
      judgmentAnswers: [0, 1], // wrong: thinks Host A knows Host B's MAC
    });
    expect(result.passed).toBe(false);
    expect(result.feedback).toContain('Question 1');
  });

  it('passes net05-p2 ARP cache reasoning with correct answers', () => {
    const result = gradeNetworkingSubmission({
      task: task05p2,
      judgmentAnswers: [1, 1], // expired → new ARP, GARP for failover
    });
    expect(result.passed).toBe(true);
  });

  it('passes net05-p3 mask mismatch diagnosis with correct answers', () => {
    const result = gradeNetworkingSubmission({
      task: task05p3,
      judgmentAnswers: [1, 1], // both local since same segment
    });
    expect(result.passed).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test 6: net-06 Grader (IPv6)
// ─────────────────────────────────────────────────────────────────────────────

describe('Gate 5 Milestone 3 — Test 6: net-06 Judgment Grader', () => {
  const task06p1 = NET_06_MODULE.concepts[0].tasks[0]; // ipv6 notation
  const task06p2 = NET_06_MODULE.concepts[1].tasks[0]; // scope classification
  const task06p3 = NET_06_MODULE.concepts[2].tasks[0]; // ndp/slaac

  it('passes net06-p1 IPv6 compression/expansion when both answers correct', () => {
    const result = gradeNetworkingSubmission({
      task: task06p1,
      judgmentAnswers: [1, 1], // canonical short form + :: invalid reason
    });
    expect(result.passed).toBe(true);
  });

  it('fails net06-p1 Q1 when wrong compression chosen', () => {
    const result = gradeNetworkingSubmission({
      task: task06p1,
      judgmentAnswers: [2, 1], // wrong: 2001:db8::ff00::8329 (double ::)
    });
    expect(result.passed).toBe(false);
    expect(result.feedback).toContain('Question 1');
  });

  it('passes net06-p2 scope classification when global unicast selected', () => {
    const result = gradeNetworkingSubmission({
      task: task06p2,
      judgmentAnswers: [1], // 2001:db8:1::100 is global unicast
    });
    expect(result.passed).toBe(true);
  });

  it('fails net06-p2 when link-local wrongly classified as routable', () => {
    const result = gradeNetworkingSubmission({
      task: task06p2,
      judgmentAnswers: [0], // fe80:: selected — not routable
    });
    expect(result.passed).toBe(false);
  });

  it('passes net06-p3 NDP/SLAAC mastery check with correct answers', () => {
    const result = gradeNetworkingSubmission({
      task: task06p3,
      judgmentAnswers: [1, 1], // solicited-node multicast NS, SLAAC address construction
    });
    expect(result.passed).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test 7: Wrong Answer Rejection
// ─────────────────────────────────────────────────────────────────────────────

describe('Gate 5 Milestone 3 — Test 7: Wrong Answer Rejection & Feedback Quality', () => {
  it('rejects wrong answers with non-empty explanation from the judgment definition', () => {
    const task = NET_04_MODULE.concepts[0].tasks[0];
    const result = gradeNetworkingSubmission({
      task,
      judgmentAnswers: [2, 0], // both wrong
    });
    expect(result.passed).toBe(false);
    expect(result.feedback).toBeTruthy();
    expect(result.feedback!.length).toBeGreaterThan(20);
  });

  it('marks wrong answers as isMisconception=true', () => {
    const task = NET_05_MODULE.concepts[0].tasks[0];
    const result = gradeNetworkingSubmission({
      task,
      judgmentAnswers: [0, 0], // wrong on both
    });
    expect(result.passed).toBe(false);
    expect(result.isMisconception).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test 8: Full Solution Sweep
// ─────────────────────────────────────────────────────────────────────────────

describe('Gate 5 Milestone 3 — Test 8: Full Solution Sweep', () => {
  it('all tasks pass when correct judgment answer indices are submitted', () => {
    const allTasks = collectAllTasks(NET_04_MODULE, NET_05_MODULE, NET_06_MODULE);
    for (const task of allTasks) {
      const judgments = task.validation.judgment ?? [];
      const correctAnswers = judgments.map((j) => j.correctIndex);
      const result = gradeNetworkingSubmission({
        task,
        judgmentAnswers: correctAnswers,
      });
      expect(result.passed).toBe(true);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test 9: Zero Regression (Milestone 1 modules intact)
// ─────────────────────────────────────────────────────────────────────────────

describe('Gate 5 Milestone 3 — Test 9: Zero Regression', () => {
  it('net-01 is still registered and intact', () => {
    const mod = getNetworkingModuleById('net-01');
    expect(mod).toBeDefined();
    expect(mod!.milestoneId).toBe('net-milestone-1');
  });

  it('net-02 is still registered and intact', () => {
    const mod = getNetworkingModuleById('net-02');
    expect(mod).toBeDefined();
    expect(mod!.milestoneId).toBe('net-milestone-1');
  });

  it('net-03 is still registered with its concepts and challenge', () => {
    const mod = getNetworkingModuleById('net-03');
    expect(mod).toBeDefined();
    expect(mod!.concepts.length).toBeGreaterThanOrEqual(1);
    expect(mod!.challenge).toBeDefined();
  });

  it('net-milestone-1 still covers modules 1, 2, and 3', () => {
    const m1 = NETWORKING_ROADMAP_MILESTONES.find((m) => m.id === 'net-milestone-1');
    expect(m1).toBeDefined();
    expect(m1!.moduleIds).toEqual(['net-01', 'net-02', 'net-03']);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test 10: No Module ID Collisions
// ─────────────────────────────────────────────────────────────────────────────

describe('Gate 5 Milestone 3 — Test 10: No Module ID Collisions', () => {
  it('all 6 module IDs in NETWORKING_MODULES are unique', () => {
    const ids = NETWORKING_MODULES.map((m) => m.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('no networking module ID duplicates any existing SQL or Prisma day ID pattern', () => {
    const ids = NETWORKING_MODULES.map((m) => m.id);
    for (const id of ids) {
      expect(id).toMatch(/^net-\d{2}$/);
      expect(id).not.toMatch(/^day-/);
      expect(id).not.toMatch(/^prisma-/);
    }
  });

  it('curriculumOrder values for net-04/05/06 are 4/5/6 and unique', () => {
    const orders = [NET_04_MODULE, NET_05_MODULE, NET_06_MODULE].map(
      (m) => m.curriculumOrder,
    );
    expect(orders).toEqual([4, 5, 6]);
    const unique = new Set(orders);
    expect(unique.size).toBe(3);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test 11: Task Classification via isNetworkingTask
// ─────────────────────────────────────────────────────────────────────────────

describe('Gate 5 Milestone 3 — Test 11: Task Classification via isNetworkingTask', () => {
  it('identifies all tasks in net-04, net-05, and net-06 as networking tasks', () => {
    const allTasks = collectAllTasks(NET_04_MODULE, NET_05_MODULE, NET_06_MODULE);
    expect(allTasks.length).toBeGreaterThanOrEqual(11);

    for (const task of allTasks) {
      expect(
        isNetworkingTask(task),
        `Task ${task.id} was not identified as a networking task`,
      ).toBe(true);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test 12: Unified Pipeline Routing via submitForTask
// ─────────────────────────────────────────────────────────────────────────────

describe('Gate 5 Milestone 3 — Test 12: Unified Pipeline Routing via submitForTask', () => {
  const mockHooks = {
    execute: () => ({ success: true, columns: [], rows: [], rowCount: 0, executionTimeMs: 0 }),
  };

  it('grades all net-04, net-05, net-06 practice and challenge tasks through submitForTask', () => {
    const allTasks = collectAllTasks(NET_04_MODULE, NET_05_MODULE, NET_06_MODULE);

    for (const task of allTasks) {
      const judgments = task.validation.judgment ?? [];
      const correctAnswers = judgments.map((j) => j.correctIndex);

      // Submission with correct answers must pass
      const passOutcome = submitForTask({
        task,
        code: '',
        hooks: mockHooks,
        judgmentAnswers: correctAnswers,
        surface: 'lesson',
      });

      expect(
        passOutcome.passed,
        `Task ${task.id} failed submitForTask with its reference answers: ${passOutcome.feedback}`,
      ).toBe(true);

      // Submission with missing answers must fail with stage 'validation'
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
// Test 13: UI Component Rendering Parity
// ─────────────────────────────────────────────────────────────────────────────

describe('Gate 5 Milestone 3 — Test 13: UI Component Rendering Parity', () => {
  it('renders NetworkingPracticeTaskView without phantom switch lab for non-topology tasks', () => {
    const task04p1 = NET_04_MODULE.concepts[0].tasks[0];
    const concept04 = NET_04_MODULE.concepts[0];

    const html = renderToStaticMarkup(
      <NetworkingPracticeTaskView
        task={task04p1}
        taskIndex={0}
        totalTasks={3}
        concept={concept04}
        onTaskSuccess={vi.fn()}
      />
    );

    // Renders instructions and prediction assessment
    expect(html).toContain('Prediction &amp; Causal Defense');
    expect(html).toContain('Check Prediction');
    expect(html).toContain('Why would a router need billions of table entries');

    // DOES NOT render switch lab or port inspection chips
    expect(html).not.toContain('data-testid="switch-simulation-lab"');
    expect(html).not.toContain('Direct Port Inspection &amp; Selection:');
  });

  it('renders challenge task without concept prop cleanly', () => {
    const chTask = NET_04_MODULE.challenge!.tasks[0];

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
    expect(html).toContain(chTask.title);
    expect(html).toContain('Check Prediction');
    expect(html).not.toContain('data-testid="switch-simulation-lab"');
  });
});
