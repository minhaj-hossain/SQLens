import { describe, it, expect } from 'vitest';
import {
  ALL_DAY1_CONCEPTS,
  DAY1_VOCABULARY,
} from '../../src/content/networking/modules/net-01-day1';

describe('Networking Track — Day 1 Term Gate & Quality Audits', () => {
  it('contains exactly 4 concepts and 25 rungs total', () => {
    expect(ALL_DAY1_CONCEPTS).toHaveLength(4);
    const totalRungs = ALL_DAY1_CONCEPTS.reduce(
      (sum, c) => sum + c.rungs.length,
      0,
    );
    expect(totalRungs).toBe(25);
    expect(ALL_DAY1_CONCEPTS[0].rungs).toHaveLength(8);
    expect(ALL_DAY1_CONCEPTS[1].rungs).toHaveLength(5);
    expect(ALL_DAY1_CONCEPTS[2].rungs).toHaveLength(6);
    expect(ALL_DAY1_CONCEPTS[3].rungs).toHaveLength(6);
  });

  it('strictly limits Day 1 vocabulary to 8 counted terms plus network', () => {
    const terms = Object.keys(DAY1_VOCABULARY);
    expect(terms).toHaveLength(9);
    expect(terms).toContain('network');
    const countedTerms = terms.filter((t) => t !== 'network');
    expect(countedTerms).toHaveLength(8);
    expect(countedTerms).toEqual([
      'terminal',
      'command',
      'ping',
      'link light',
      'IP address',
      'time (ms)',
      'unreachable',
      'ipconfig',
    ]);
  });

  it('enforces that no card teaching text leaks forbidden Day 2+ terms', () => {
    const forbiddenWords = [
      /\bmac\b/i,
      /\barp\b/i,
      /\bnic\b/i,
      /\bpacket\b/i,
      /\brouter\b/i,
      /\bswitch\b/i,
      /\bhub\b/i,
      /\bosi\b/i,
      /\bdefault gateway\b/i,
      /\bsubnet mask\b/i,
    ];

    for (const concept of ALL_DAY1_CONCEPTS) {
      for (const rung of concept.rungs) {
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

  it('enforces word limits: story <= 35 words and task <= 65 words', () => {
    for (const concept of ALL_DAY1_CONCEPTS) {
      for (const rung of concept.rungs) {
        const storyWords = rung.story.trim().split(/\s+/).filter(Boolean);
        expect(
          storyWords.length,
          `Story word count exceeded on ${rung.id}: ${storyWords.length} words`,
        ).toBeLessThanOrEqual(35);

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
    for (const concept of ALL_DAY1_CONCEPTS) {
      for (const rung of concept.rungs) {
        if (rung.check.options) {
          expect(rung.check.options.length).toBeGreaterThanOrEqual(2);
          const hasCorrect = rung.check.options.some((opt) => opt.isCorrect);
          expect(hasCorrect, `Rung ${rung.id} has no correct option`).toBe(true);

          for (const opt of rung.check.options) {
            expect(opt.feedback.length).toBeGreaterThan(10);
            expect(opt.label.length).toBeGreaterThan(2);
          }
        }
      }
    }
  });

  it('guarantees 3-level hint ladders for all rungs', () => {
    for (const concept of ALL_DAY1_CONCEPTS) {
      for (const rung of concept.rungs) {
        expect(rung.hints).toHaveLength(3);
        expect(rung.hints[0].level).toBe(1);
        expect(rung.hints[1].level).toBe(2);
        expect(rung.hints[2].level).toBe(3);
        expect(rung.hints[2].label).toBe('Show me');
      }
    }
  });
});
