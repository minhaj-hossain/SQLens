import { describe, it, expect } from 'vitest';
import {
  ALL_DAY3_CONCEPTS,
  DAY3_VOCABULARY,
} from '../../src/content/networking/modules/net-03-day3';

describe('Networking Track — Day 3 Term Gate & Quality Audits', () => {
  it('contains exactly 4 concepts and 22 rungs total', () => {
    expect(ALL_DAY3_CONCEPTS).toHaveLength(4);
    const totalRungs = ALL_DAY3_CONCEPTS.reduce(
      (sum, c) => sum + c.rungs.length,
      0
    );
    expect(totalRungs).toBe(22);
    expect(ALL_DAY3_CONCEPTS[0].rungs).toHaveLength(5);
    expect(ALL_DAY3_CONCEPTS[1].rungs).toHaveLength(6);
    expect(ALL_DAY3_CONCEPTS[2].rungs).toHaveLength(5);
    expect(ALL_DAY3_CONCEPTS[3].rungs).toHaveLength(6);
  });

  it('strictly limits Day 3 vocabulary to exactly 6 counted terms', () => {
    const terms = Object.keys(DAY3_VOCABULARY);
    expect(terms).toHaveLength(6);
    expect(terms).toEqual([
      'router',
      'default gateway',
      'hop',
      'routing table',
      'forwarding',
      'traceroute',
    ]);
  });

  it('enforces that teaching text does not leak forbidden Day 4+ terms before wrap-up', () => {
    // Note: C4 R6 is the wrap-up bridge that introduces the hook question for Day 4 (Subnet masks).
    // All preceding rungs (C1 R1 through C4 R5) must strictly contain ZERO mentions of forbidden terms.
    const forbiddenWords = [
      /\bsubnet mask\b/i,
      /\bcidr\b/i,
      /\bnat\b/i,
      /\bdns\b/i,
      /\bwan\b/i,
      /\bpublic ip\b/i,
      /\bprivate ip\b/i,
      /\bbgp\b/i,
      /\bospf\b/i,
    ];

    for (const concept of ALL_DAY3_CONCEPTS) {
      for (const rung of concept.rungs) {
        if (rung.id === 'c4-r6') continue; // Day 4 preview bridge

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
            `Forbidden term "${pattern}" leaked in ${rung.id}: "${textToCheck}"`
          ).toBeNull();
        }
      }
    }
  });

  it('guarantees every question option provides authored diagnostic feedback', () => {
    for (const concept of ALL_DAY3_CONCEPTS) {
      for (const rung of concept.rungs) {
        if (rung.check.options) {
          for (const opt of rung.check.options) {
            expect(
              opt.feedback,
              `Missing feedback on ${rung.id} option: ${opt.label}`
            ).toBeTruthy();
          }
        }
      }
    }
  });

  it('verifies that correct answers are naturally distributed across options', () => {
    const correctIndices: number[] = [];
    for (const concept of ALL_DAY3_CONCEPTS) {
      for (const rung of concept.rungs) {
        if (rung.check.options && rung.check.options.length > 1) {
          const idx = rung.check.options.findIndex((o) => o.isCorrect);
          if (idx !== -1) {
            correctIndices.push(idx);
          }
        }
      }
    }

    // Ensure we do not always put correct answer in position 0
    const countIndex0 = correctIndices.filter((i) => i === 0).length;
    const countIndex1 = correctIndices.filter((i) => i === 1).length;
    expect(countIndex1).toBeGreaterThan(0);
    expect(countIndex0).toBeLessThan(correctIndices.length);
  });
});
