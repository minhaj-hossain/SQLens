import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  THEMES,
  DEFAULT_THEME,
  STORAGE_KEY,
  THEME_COLORS,
  isValidTheme,
  getStoredTheme,
  applyTheme,
} from '../../src/lib/theme-system';

/**
 * Unit tests for the theme registry (src/lib/theme-system.ts).
 * Browser globals (window/localStorage/document) are stubbed per test —
 * the module is written SSR-safe so every function guards on typeof.
 */

function stubBrowser() {
  const store = new Map<string, string>();
  const setAttribute = vi.fn();
  const getAttribute = vi.fn(() => null);
  vi.stubGlobal('window', {
    localStorage: {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
    },
  });
  vi.stubGlobal('document', {
    documentElement: { setAttribute, getAttribute },
  });
  return { store, setAttribute, getAttribute };
}

describe('theme-system registry', () => {
  it('ships exactly two themes with graphite as the default', () => {
    expect(THEMES).toEqual(['graphite', 'sky']);
    expect(DEFAULT_THEME).toBe('graphite');
  });

  it('isValidTheme accepts only registered theme ids', () => {
    expect(isValidTheme('sky')).toBe(true);
    expect(isValidTheme('graphite')).toBe(true);
    expect(isValidTheme('blue')).toBe(false);
    expect(isValidTheme('')).toBe(false);
    expect(isValidTheme(null)).toBe(false);
    expect(isValidTheme(42)).toBe(false);
    expect(isValidTheme(undefined)).toBe(false);
  });

  it('uses a stable storage key and per-theme browser chrome colors', () => {
    expect(STORAGE_KEY).toBe('sqlens:theme');
    expect(THEME_COLORS.graphite).toBe('#0a0a0a');
    expect(THEME_COLORS.sky).toBe('#0a0d12');
  });
});

describe('getStoredTheme', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns the persisted theme when valid', () => {
    const { store } = stubBrowser();
    store.set(STORAGE_KEY, 'sky');
    expect(getStoredTheme()).toBe('sky');
  });

  it('returns null for corrupt/unknown stored values', () => {
    const { store } = stubBrowser();
    store.set(STORAGE_KEY, 'neon-pink');
    expect(getStoredTheme()).toBeNull();
  });

  it('returns null when nothing is stored', () => {
    stubBrowser();
    expect(getStoredTheme()).toBeNull();
  });

  it('returns null during SSR (no window)', () => {
    expect(getStoredTheme()).toBeNull();
  });

  it('returns null when localStorage throws (private mode)', () => {
    vi.stubGlobal('window', {
      localStorage: {
        getItem: () => {
          throw new Error('SecurityError');
        },
        setItem: () => {
          throw new Error('SecurityError');
        },
      },
    });
    expect(getStoredTheme()).toBeNull();
  });
});

describe('applyTheme', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('sets data-theme on <html> and persists the choice', () => {
    const { store, setAttribute } = stubBrowser();
    applyTheme('sky');
    expect(setAttribute).toHaveBeenCalledWith('data-theme', 'sky');
    expect(store.get(STORAGE_KEY)).toBe('sky');
  });

  it('survives storage failures and still applies the attribute', () => {
    vi.stubGlobal('window', {
      localStorage: {
        getItem: () => null,
        setItem: () => {
          throw new Error('QuotaExceeded');
        },
      },
    });
    const setAttribute = vi.fn();
    vi.stubGlobal('document', { documentElement: { setAttribute } });
    expect(() => applyTheme('graphite')).not.toThrow();
    expect(setAttribute).toHaveBeenCalledWith('data-theme', 'graphite');
  });
});
