import { describe, it, expect } from 'vitest';
import {
  ALL_DAY2_CONCEPTS,
  DAY2_VOCABULARY,
} from '../../src/content/networking/modules/net-02-day2';

describe('Networking Track — Day 2 Term Gate & Quality Audits', () => {
  it('contains exactly 4 concepts and 23 rungs total', () => {
    expect(ALL_DAY2_CONCEPTS).toHaveLength(4);
    const totalRungs = ALL_DAY2_CONCEPTS.reduce(
      (sum, c) => sum + c.rungs.length,
      0,
    );
    expect(totalRungs).toBe(23);
    expect(ALL_DAY2_CONCEPTS[0].rungs).toHaveLength(6);
    expect(ALL_DAY2_CONCEPTS[1].rungs).toHaveLength(5);
    expect(ALL_DAY2_CONCEPTS[2].rungs).toHaveLength(6);
    expect(ALL_DAY2_CONCEPTS[3].rungs).toHaveLength(6);
  });

  it('strictly limits Day 2 vocabulary to 7 counted terms', () => {
    const terms = Object.keys(DAY2_VOCABULARY);
    expect(terms).toHaveLength(7);
    expect(terms).toEqual([
      'switch',
      'port',
      'mac address',
      'broadcast',
      'arp',
      'arp table',
      'request timed out',
    ]);
  });

  it('enforces that no card teaching text leaks forbidden Day 3+ terms before wrap-up', () => {
    // Note: C4 R6 is the wrap-up bridge that asks the hook question for Day 3 (introducing the need for a router).
    // All preceding rungs (C1 R1 through C4 R5) must strictly contain ZERO mentions of forbidden words.
    const forbiddenWords = [
      /\brouter\b/i,
      /\bdefault gateway\b/i,
      /\bdns\b/i,
      /\binternet\b/i,
      /\btcp\b/i,
      /\budp\b/i,
      /\bvlan\b/i,
      /\bstp\b/i,
      /\bdhcp\b/i,
    ];

    for (const concept of ALL_DAY2_CONCEPTS) {
      for (const rung of concept.rungs) {
        if (rung.id === 'c4-r6') continue; // Day 3 preview bridge

        const textToCheck = [
          rung.look,
          rung.story,
          rung.doText || '',
          rung.whyText || '',
          rung.expectText || '',
          rung.meaningText || '',
        ].join(' ');

        for (const pattern of forbiddenWords) {
          const match = textToCheck.match(pattern);
          expect(
            match,
            `Forbidden word "${pattern}" found in ${rung.id}: "${textToCheck}"`,
          ).toBeNull();
        }
      }
    }
  });

  it('enforces word limits: story <= 100 words and task <= 65 words on every rung for multi-sentence clarity', () => {
    for (const concept of ALL_DAY2_CONCEPTS) {
      for (const rung of concept.rungs) {
        const storyWords = rung.story.trim().split(/\s+/).filter(Boolean);
        expect(
          storyWords.length,
          `Story word count exceeded on ${rung.id}: ${storyWords.length} words`,
        ).toBeLessThanOrEqual(100);

        const taskText = [
          rung.doText || '',
          rung.whyText || '',
          rung.expectText || '',
        ]
          .join(' ')
          .trim();
        const taskWords = taskText ? taskText.split(/\s+/).filter(Boolean) : [];
        expect(
          taskWords.length,
          `Task block word count exceeded on ${rung.id}: ${taskWords.length} words`,
        ).toBeLessThanOrEqual(65);
      }
    }
  });

  it('guarantees every question has plausible options with authored feedback', () => {
    for (const concept of ALL_DAY2_CONCEPTS) {
      for (const rung of concept.rungs) {
        if (rung.check.options) {
          expect(rung.check.options.length).toBeGreaterThanOrEqual(2);
          const correctCount = rung.check.options.filter(
            (o) => o.isCorrect,
          ).length;
          expect(
            correctCount,
            `Rung ${rung.id} must have exactly one correct option`,
          ).toBe(1);

          for (const opt of rung.check.options) {
            expect(opt.feedback.length).toBeGreaterThan(10);
            expect(opt.label.length).toBeGreaterThan(0);
          }
        }
      }
    }
  });

  it('ensures all rungs include 3 progressive hints', () => {
    for (const concept of ALL_DAY2_CONCEPTS) {
      for (const rung of concept.rungs) {
        expect(rung.hints).toHaveLength(3);
        expect(rung.hints[0].level).toBe(1);
        expect(rung.hints[1].level).toBe(2);
        expect(rung.hints[2].level).toBe(3);
      }
    }
  });
});
