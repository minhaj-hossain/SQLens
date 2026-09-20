import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  MAX_EVENTS,
  SuggestEvent,
  clearSuggestEvents,
  missedPrefixes,
  percentile,
  readSuggestEvents,
  recordSuggestEvent,
  slowestPasses,
  summarizeSuggestEvents,
} from '../../src/lib/suggest-telemetry';

/** Minimal in-memory localStorage — the vitest env is `node` (no DOM). */
function memoryStorage() {
  const map = new Map<string, string>();
  return {
    getItem: (k: string) => (map.has(k) ? (map.get(k) as string) : null),
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
  };
}

const shown = (prefix: string, passMs = 5, count = 3): Omit<SuggestEvent, 't'> => ({
  kind: 'shown',
  prefix,
  ctx: 'columns',
  count,
  passMs,
});

beforeEach(() => {
  vi.stubGlobal('localStorage', memoryStorage());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('suggest-telemetry — ring buffer', () => {
  it('records newest-first and caps the buffer at MAX_EVENTS', () => {
    for (let i = 0; i < MAX_EVENTS + 25; i++) recordSuggestEvent(shown(`P${i}`));
    const events = readSuggestEvents();
    expect(events).toHaveLength(MAX_EVENTS);
    // Newest write is first, the oldest entries were dropped.
    expect(events[0].prefix).toBe(`P${MAX_EVENTS + 24}`);
    expect(events.some((e) => e.prefix === 'P0')).toBe(false);
  });

  it('normalises the prefix (trimmed, upper-cased, length-capped)', () => {
    recordSuggestEvent(shown('  sel  '));
    recordSuggestEvent(shown('x'.repeat(60)));
    const [longestFirst, second] = readSuggestEvents();
    expect(second.prefix).toBe('SEL');
    expect(longestFirst.prefix).toHaveLength(24);
  });

  it('ignores malformed payloads instead of throwing', () => {
    localStorage.setItem('sqlens:suggest-telemetry', JSON.stringify([{ nope: 1 }, 42, null]));
    expect(readSuggestEvents()).toEqual([]);
    localStorage.setItem('sqlens:suggest-telemetry', 'not json');
    expect(readSuggestEvents()).toEqual([]);
  });

  it('clearSuggestEvents empties the buffer', () => {
    recordSuggestEvent(shown('SEL'));
    expect(readSuggestEvents()).toHaveLength(1);
    clearSuggestEvents();
    expect(readSuggestEvents()).toEqual([]);
  });

  it('is SSR-safe when localStorage does not exist', () => {
    vi.unstubAllGlobals();
    expect(() => recordSuggestEvent(shown('SEL'))).not.toThrow();
    expect(readSuggestEvents()).toEqual([]);
    expect(() => clearSuggestEvents()).not.toThrow();
  });
});

describe('suggest-telemetry — aggregates', () => {
  it('computes accept rate and the ignored remainder per prefix', () => {
    recordSuggestEvent(shown('SEL'));
    recordSuggestEvent(shown('SEL'));
    recordSuggestEvent(shown('SEL'));
    recordSuggestEvent({ kind: 'accepted', prefix: 'SEL', text: 'SELECT' });
    recordSuggestEvent({ kind: 'dismissed', prefix: 'SEL' });
    // Third showing was neither accepted nor dismissed: the learner typed on.

    const [stat] = summarizeSuggestEvents(readSuggestEvents());
    expect(stat.prefix).toBe('SEL');
    expect(stat.shown).toBe(3);
    expect(stat.accepted).toBe(1);
    expect(stat.dismissed).toBe(1);
    expect(stat.ignored).toBe(1);
    expect(stat.acceptRate).toBeCloseTo(1 / 3, 5);
  });

  it('orders prefixes by how often they were shown', () => {
    recordSuggestEvent(shown('ONE'));
    recordSuggestEvent(shown('TWO'));
    recordSuggestEvent(shown('TWO'));
    expect(summarizeSuggestEvents(readSuggestEvents()).map((s) => s.prefix)).toEqual(['TWO', 'ONE']);
  });

  it('reports pass latency percentiles and decision time', () => {
    for (const ms of [2, 4, 6, 8, 100]) recordSuggestEvent(shown('SEL', ms));
    recordSuggestEvent({ kind: 'accepted', prefix: 'SEL', decisionMs: 900, text: 'SELECT' });

    const [stat] = summarizeSuggestEvents(readSuggestEvents());
    expect(stat.passP50).toBe(6);
    expect(stat.passP95).toBe(100);
    expect(stat.decideP50).toBe(900);
  });

  it('percentile is nearest-rank and null for an empty sample', () => {
    expect(percentile([], 0.5)).toBeNull();
    expect(percentile([10], 0.95)).toBe(10);
    expect(percentile([1, 2, 3, 4], 0.5)).toBe(2);
    expect(percentile([1, 2, 3, 4], 0.95)).toBe(4);
  });
});

describe('suggest-telemetry — actionable views', () => {
  it('lists prefixes shown repeatedly but never accepted', () => {
    recordSuggestEvent(shown('WHRE'));
    recordSuggestEvent(shown('WHRE'));
    recordSuggestEvent(shown('SEL'));
    recordSuggestEvent(shown('SEL'));
    recordSuggestEvent({ kind: 'accepted', prefix: 'SEL', text: 'SELECT' });

    const missed = missedPrefixes(readSuggestEvents());
    expect(missed.map((m) => m.prefix)).toEqual(['WHRE']);
  });

  it('ignores one-off showings so a single stray dismiss is not systemic', () => {
    recordSuggestEvent(shown('RARE'));
    expect(missedPrefixes(readSuggestEvents(), 2)).toEqual([]);
    expect(missedPrefixes(readSuggestEvents(), 1).map((m) => m.prefix)).toEqual(['RARE']);
  });

  it('ranks the slowest passes by p95', () => {
    recordSuggestEvent(shown('FAST', 3));
    recordSuggestEvent(shown('SLOW', 40));
    recordSuggestEvent(shown('SLOW', 80));
    expect(slowestPasses(readSuggestEvents())[0].prefix).toBe('SLOW');
  });
});
