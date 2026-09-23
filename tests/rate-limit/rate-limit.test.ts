import { describe, it, expect, beforeEach } from 'vitest';
import {
  RATE_LIMITS,
  checkRateLimit,
  buildRateLimitKey,
  bucketedKey,
  ipFromHeaders,
  sessionTokenFromCookie,
  rateLimitSize,
  resetRateLimits,
} from '../../src/lib/rate-limit';

const RULE = { windowMs: 60_000, max: 3 };

describe('checkRateLimit (fixed window, injectable clock)', () => {
  beforeEach(() => resetRateLimits());

  it('allows up to max within one window, then blocks', () => {
    const t0 = 1_000_000;
    expect(checkRateLimit('k', RULE, t0)).toEqual({
      allowed: true,
      remaining: 2,
      retryAfterSeconds: 0,
    });
    expect(checkRateLimit('k', RULE, t0 + 1_000).allowed).toBe(true);
    expect(checkRateLimit('k', RULE, t0 + 2_000).allowed).toBe(true);

    const blocked = checkRateLimit('k', RULE, t0 + 3_000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    // Window ends at t0 + 60s; 57s remain at t0 + 3s.
    expect(blocked.retryAfterSeconds).toBe(57);
  });

  it('starts a fresh window once windowMs elapses (no sleeping — clock is injected)', () => {
    const t0 = 1_000_000;
    for (let i = 0; i < RULE.max; i++) checkRateLimit('k', RULE, t0 + i);
    expect(checkRateLimit('k', RULE, t0 + RULE.max).allowed).toBe(false);

    const after = t0 + RULE.windowMs;
    const fresh = checkRateLimit('k', RULE, after);
    expect(fresh.allowed).toBe(true);
    expect(fresh.remaining).toBe(RULE.max - 1);
  });

  it('counts keys independently (a blocked key does not consume another key)', () => {
    const t0 = 2_000_000;
    for (let i = 0; i <= RULE.max; i++) checkRateLimit('a', RULE, t0 + i);
    expect(checkRateLimit('a', RULE, t0).allowed).toBe(false);
    expect(checkRateLimit('b', RULE, t0).allowed).toBe(true);
  });

  it('buckets isolate endpoint budgets on the same caller key (live-probe regression)', () => {
    const t0 = 5_000_000;
    const ip = '7.7.7.7';
    const session = 'tok';
    const readKey = bucketedKey('auth-read', ip, session);
    const writeKey = bucketedKey('auth-write', ip, session);
    // Exhaust the read budget (max 3 in RULE)…
    for (let i = 0; i <= RULE.max; i++) checkRateLimit(readKey, RULE, t0 + i);
    expect(checkRateLimit(readKey, RULE, t0).allowed).toBe(false);
    // …the write bucket for the SAME ip+session must still have full budget.
    expect(checkRateLimit(writeKey, RULE, t0)).toEqual({
      allowed: true,
      remaining: RULE.max - 1,
      retryAfterSeconds: 0,
    });
    // And bucket prefixes keep namespaced keys distinct.
    expect(readKey).not.toBe(writeKey);
    expect(readKey.startsWith('auth-read:')).toBe(true);
  });

  it('retryAfterSeconds never returns 0 once blocked (minimum 1s)', () => {
    const t0 = 3_000_000;
    for (let i = 0; i <= RULE.max; i++) checkRateLimit('k', RULE, t0 + i);
    // Exactly at the window boundary the entry is stale → fresh window, so hit
    // one ms before expiry to land in the blocked branch at the very edge.
    const edge = checkRateLimit('k', RULE, t0 + RULE.windowMs - 1);
    if (!edge.allowed) expect(edge.retryAfterSeconds).toBeGreaterThanOrEqual(1);
  });

  it('prunes expired windows once the map crosses the threshold', () => {
    const t0 = 4_000_000;
    for (let i = 0; i < 600; i++) checkRateLimit(`bulk-${i}`, RULE, t0);
    expect(rateLimitSize()).toBeGreaterThanOrEqual(600);
    // All 600 are expired an hour later → a new hit sweeps them out.
    checkRateLimit('after', RULE, t0 + 3_600_000);
    expect(rateLimitSize()).toBe(1);
  });
});

describe('buildRateLimitKey', () => {
  it('separates sessions on the same IP and unifies a session across IPs', () => {
    const s1 = buildRateLimitKey('1.2.3.4', 'token-one');
    const s2 = buildRateLimitKey('1.2.3.4', 'token-two');
    const s1b = buildRateLimitKey('5.6.7.8', 'token-one');
    expect(s1).not.toBe(s2);
    // The session-hash segment is stable across IPs; the IP segment differs.
    expect(s1.split('|')[1]).toBe(s1b.split('|')[1]);
    expect(s1).not.toBe(s1b);
  });

  it('never embeds the raw session token in the key', () => {
    const key = buildRateLimitKey('9.9.9.9', 'super-secret-session-token');
    expect(key).not.toContain('super-secret-session-token');
  });

  it('anonymous callers share one slot per IP', () => {
    expect(buildRateLimitKey('1.1.1.1', null)).toBe('1.1.1.1|-');
    expect(buildRateLimitKey('1.1.1.1')).toBe(buildRateLimitKey('1.1.1.1', null));
  });
});

describe('ipFromHeaders', () => {
  it('takes the first (client) hop of x-forwarded-for, trimmed', () => {
    const headers = { get: (n: string) => (n === 'x-forwarded-for' ? '203.0.113.9, 10.0.0.1' : null) };
    expect(ipFromHeaders(headers)).toBe('203.0.113.9');
  });

  it('falls back to x-real-ip, then unknown', () => {
    expect(ipFromHeaders({ get: (n) => (n === 'x-real-ip' ? '198.51.100.7' : null) })).toBe('198.51.100.7');
    expect(ipFromHeaders({ get: () => null })).toBe('unknown');
  });
});

describe('sessionTokenFromCookie', () => {
  it('reads the better-auth cookie, plain and __Secure- prefixed', () => {
    expect(sessionTokenFromCookie('a=1; better-auth.session_token=abc123; b=2')).toBe('abc123');
    expect(sessionTokenFromCookie('__Secure-better-auth.session_token=xyz; a=1')).toBe('xyz');
  });

  it('returns null when absent or empty', () => {
    expect(sessionTokenFromCookie('theme=dark')).toBeNull();
    expect(sessionTokenFromCookie(null)).toBeNull();
    expect(sessionTokenFromCookie('better-auth.session_token=; x=1')).toBeNull();
  });
});

describe('shipped policy values', () => {
  it('progress PUT budget sits above the client debounce cadence (120/min vs ~40/min)', () => {
    expect(RATE_LIMITS.progressPut.windowMs).toBe(60_000);
    expect(RATE_LIMITS.progressPut.max).toBeGreaterThanOrEqual(60);
  });

  it('auth budgets: strict writes, generous reads', () => {
    expect(RATE_LIMITS.authWrite.max).toBeLessThanOrEqual(30);
    expect(RATE_LIMITS.authRead.max).toBeGreaterThan(RATE_LIMITS.authWrite.max);
  });
});