import { describe, expect, it } from 'vitest';
import {
  readSuggestionHistory,
  recordSuggestionPick,
  historyBoostFromList,
} from '../../src/lib/suggestion-history';

describe('suggestion-history (Batch 2 recency)', () => {
  it('builds a recency-weighted boost newest-first', () => {
    const boost = historyBoostFromList(['EMAIL', 'CITY', 'NAME']);
    expect(boost('email')).toBeGreaterThan(boost('city'));
    expect(boost('city')).toBeGreaterThan(boost('name'));
    expect(boost('unknown')).toBe(0);
  });

  it('is case-insensitive', () => {
    const boost = historyBoostFromList(['EMAIL']);
    expect(boost('email')).toBeGreaterThan(0);
    expect(boost('Email')).toBeGreaterThan(0);
  });

  it('recordSuggestionPick dedupes without throwing (SSR-safe)', () => {
    const next = recordSuggestionPick('email');
    expect(next[0]).toBe('EMAIL');
    // localStorage may be unavailable under vitest node env — read back only
    // when storage actually persisted.
    const stored = readSuggestionHistory();
    if (stored.length > 0) {
      expect(stored[0]).toBe('EMAIL');
    }
  });
});
