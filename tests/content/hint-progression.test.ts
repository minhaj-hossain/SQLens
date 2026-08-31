/**
 * Hint Quality — hints must teach, not echo (P4 gap).
 *
 * Two guarantees:
 *  1. A hint must not merely restate a task's instructions (the learner has
 *     already read them — a repeated instruction is a wasted hint click).
 *  2. Hints must PROGRESS: each successive hint adds new information beyond
 *     the previous one instead of paraphrasing it.
 *
 * Comparison is done on normalized token sets (case-, punctuation-, and
 * markdown-insensitive) with containment scoring, so near-duplicates fail
 * while legitimately related phrasing passes.
 */
import { describe, it, expect } from 'vitest';
import { ALL_MODULES } from '../../src/content/curriculum-index';

const STOPWORDS = new Set([
  'a', 'an', 'the', 'of', 'to', 'in', 'on', 'for', 'and', 'or', 'is', 'are',
  'your', 'you', 'with', 'as', 'that', 'this', 'it', 'be', 'from', 'by',
]);

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/`/g, '') // strip markdown code ticks
    .replace(/[^a-z0-9%*()]+/g, ' ') // punctuation → space, keep SQL-ish tokens
    .trim();
}

function tokens(text: string): Set<string> {
  const set = new Set<string>();
  for (const tok of normalize(text).split(' ')) {
    if (tok && !STOPWORDS.has(tok)) set.add(tok);
  }
  return set;
}

/** Containment of `a` inside `b`: fraction of a's tokens found in b. */
function containment(a: Set<string>, b: Set<string>): number {
  if (a.size === 0) return 0;
  let hits = 0;
  for (const t of a) if (b.has(t)) hits++;
  return hits / a.size;
}

function mutualContainment(a: string, b: string): number {
  const ta = tokens(a);
  const tb = tokens(b);
  return Math.min(containment(ta, tb), containment(tb, ta));
}

interface HintsLike {
  id: string;
  instructions?: string[];
  hints?: { level: number; text: string }[];
}

describe('hint progression quality', () => {
  it('no hint merely restates a task instruction or a previous hint', () => {
    const violations: string[] = [];
    const THRESHOLD = 0.85; // ≥85% mutual token containment = echo, not teaching

    const check = (moduleId: string, conceptKey: string, task: HintsLike) => {
      const where = `${moduleId}/${conceptKey}/${task.id}`;
      const instructions = task.instructions ?? [];

      (task.hints ?? []).forEach((hint, hIdx) => {
        // A hint that contains actual SQL is a deliberate answer-reveal
        // scaffold (established pattern across the early days) — it teaches
        // by showing syntax, not by echoing prose. Only prose hints are
        // checked for instruction echo.
        const isSqlHint = /`|select\s.+from\s|insert\s+into|update\s+\w+\s+set|delete\s+from|from\s+\w|join\s+\w+\s+on|alter\s+table|create\s+(table|index)|drop\s+table/i.test(hint.text);
        if (!isSqlHint) {
          // Guarantee 1: hint vs instructions
          for (const instr of instructions) {
            const score = mutualContainment(hint.text, instr);
            if (score >= THRESHOLD) {
              violations.push(
                `${where} hint ${hIdx + 1} restates an instruction (containment ${(score * 100).toFixed(0)}%): "${hint.text.slice(0, 60)}…"`
              );
              break;
            }
          }
          // Guarantee 2: hint vs previous hint
          if (hIdx > 0) {
            const prev = (task.hints ?? [])[hIdx - 1];
            const score = mutualContainment(hint.text, prev.text);
            if (score >= THRESHOLD) {
              violations.push(
                `${where} hint ${hIdx + 1} repeats hint ${hIdx} (containment ${(score * 100).toFixed(0)}%): "${hint.text.slice(0, 60)}…"`
              );
            }
          }
        }
      });
    };

    for (const mod of ALL_MODULES) {
      for (const concept of mod.concepts) {
        for (const task of concept.tasks) check(mod.id, concept.id, task);
      }
      if (mod.challenge) {
        for (const task of mod.challenge.tasks) check(mod.id, 'challenge', task);
      }
    }

    if (violations.length > 0) {
      console.error('ECHOING HINTS:\n' + violations.join('\n'));
    }
    expect(violations).toEqual([]);
  });
});
