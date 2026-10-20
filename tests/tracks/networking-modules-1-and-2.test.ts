import { describe, it, expect } from 'vitest';
import { getNetworkingModuleById } from '../../src/content/networking/networking-curriculum-index';
import {
  isNetworkingTask,
  gradeNetworkingSubmission,
} from '../../src/lib/network-engine/networking-submit-pipeline';

describe('Networking Track — Module 1 (net-01) Full Authoring & Verification', () => {
  const mod = getNetworkingModuleById('net-01');

  it('net-01 is registered with 4 concepts, estimated minutes, and metadata', () => {
    expect(mod).toBeDefined();
    expect(mod!.id).toBe('net-01');
    expect(mod!.title).toBe('Module 1: The First Link & Hardware Identity');
    expect(mod!.displayLabel).toBe('Module 1');
    expect(mod!.milestoneId).toBe('net-milestone-1');
    expect(mod!.concepts).toHaveLength(4);
    expect(mod!.concepts.map((c) => c.id)).toEqual([
      'direct-link-mac',
      'copper-strands-full-duplex',
      'nic-permanent-mac-address',
      'encapsulation-segment-packet-frame',
    ]);
  });

  it('all 4 concepts have explanations, takeaways, MCQs, and guided/independent tasks', () => {
    for (const c of mod!.concepts) {
      expect(c.theory.summary.length).toBeGreaterThan(20);
      expect(c.theory.explanation.length).toBeGreaterThan(0);
      expect(c.theory.keyTakeaway.length).toBeGreaterThan(10);
      expect(c.theory.mcqs?.length).toBeGreaterThanOrEqual(1);
      expect(c.tasks.length).toBeGreaterThanOrEqual(1);
      for (const t of c.tasks) {
        expect(isNetworkingTask(t)).toBe(true);
        expect(t.validation.judgment).toBeDefined();
        expect(t.validation.judgment!.length).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it('net-01 has a module challenge with 2 tasks', () => {
    expect(mod!.challenge).toBeDefined();
    expect(mod!.challenge!.id).toBe('net-01-challenge');
    expect(mod!.challenge!.tasks).toHaveLength(2);
    for (const ct of mod!.challenge!.tasks) {
      expect(isNetworkingTask(ct)).toBe(true);
      expect(ct.validation.judgment?.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('net-01 tasks pass when correct judgment indices are provided and fail otherwise', () => {
    const task = mod!.concepts[0].tasks[0];
    const judgments = task.validation.judgment!;
    const correctAnswers = judgments.map((j) => j.correctIndex);

    // Correct submission
    const passOutcome = gradeNetworkingSubmission({
      task,
      judgmentAnswers: correctAnswers,
    });
    expect(passOutcome.passed).toBe(true);

    // Incorrect submission
    const failAnswers = judgments.map((j) => (j.correctIndex + 1) % j.options.length);
    const failOutcome = gradeNetworkingSubmission({
      task,
      judgmentAnswers: failAnswers,
    });
    expect(failOutcome.passed).toBe(false);
    expect(failOutcome.isMisconception).toBe(true);
  });
});

describe('Networking Track — Module 2 (net-02) Full Authoring & Verification', () => {
  const mod = getNetworkingModuleById('net-02');

  it('net-02 is registered with 3 concepts, estimated minutes, and metadata', () => {
    expect(mod).toBeDefined();
    expect(mod!.id).toBe('net-02');
    expect(mod!.title).toBe('Module 2: Expanding the Room — The Shared Wire & Collisions');
    expect(mod!.displayLabel).toBe('Module 2');
    expect(mod!.milestoneId).toBe('net-milestone-1');
    expect(mod!.concepts).toHaveLength(3);
    expect(mod!.concepts.map((c) => c.id)).toEqual([
      'shared-medium-collisions',
      'ethernet-framing-mtu-fcs',
      'mac-addresses-and-collision-domains',
    ]);
  });

  it('all 3 concepts have explanations, takeaways, MCQs, and guided/independent tasks', () => {
    for (const c of mod!.concepts) {
      expect(c.theory.summary.length).toBeGreaterThan(20);
      expect(c.theory.explanation.length).toBeGreaterThan(0);
      expect(c.theory.keyTakeaway.length).toBeGreaterThan(10);
      expect(c.theory.mcqs?.length).toBeGreaterThanOrEqual(1);
      expect(c.tasks.length).toBeGreaterThanOrEqual(1);
      for (const t of c.tasks) {
        expect(isNetworkingTask(t)).toBe(true);
        expect(t.validation.judgment).toBeDefined();
        expect(t.validation.judgment!.length).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it('net-02 has a module challenge with 2 tasks', () => {
    expect(mod!.challenge).toBeDefined();
    expect(mod!.challenge!.id).toBe('net-02-challenge');
    expect(mod!.challenge!.tasks).toHaveLength(2);
    for (const ct of mod!.challenge!.tasks) {
      expect(isNetworkingTask(ct)).toBe(true);
      expect(ct.validation.judgment?.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('net-02 tasks pass when correct judgment indices are provided and fail otherwise', () => {
    const task = mod!.concepts[1].tasks[0];
    const judgments = task.validation.judgment!;
    const correctAnswers = judgments.map((j) => j.correctIndex);

    // Correct submission
    const passOutcome = gradeNetworkingSubmission({
      task,
      judgmentAnswers: correctAnswers,
    });
    expect(passOutcome.passed).toBe(true);

    // Incorrect submission
    const failAnswers = judgments.map((j) => (j.correctIndex + 1) % j.options.length);
    const failOutcome = gradeNetworkingSubmission({
      task,
      judgmentAnswers: failAnswers,
    });
    expect(failOutcome.passed).toBe(false);
    expect(failOutcome.isMisconception).toBe(true);
  });
});
