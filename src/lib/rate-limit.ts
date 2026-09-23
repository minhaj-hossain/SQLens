/**
 * Milestone 4 (item 13) — zero-dependency API rate limiting (finding S-1).
 *
 * Fixed-window counters kept in process memory: no npm package, no external
 * service, and an injectable clock so tests never sleep. Keys combine the
 * caller IP with a hash of the session token (never the raw token) so that
 * signed-in users behind one NAT each get their own budget, while anonymous
 * traffic (sign-in attempts) stays bounded per IP.
 *
 * Known limit: the window map is per server instance — on serverless each
 * instance counts separately, so this caps *burst* behaviour per instance
 * rather than enforcing a global quota. A WAF rule or an Upstash-style shared
 * limiter remains the recommended outer layer (S-1).
 */

/** A fixed window: `max` requests allowed per `windowMs` per key. */
export interface RateLimitRule {
  windowMs: number;
  max: number;
}

export interface RateLimitResult {
  allowed: boolean;
  /** Seconds the client should wait before retrying (0 while allowed). */
  retryAfterSeconds: number;
  /** Requests left in the current window (0 once blocked). */
  remaining: number;
}

interface WindowEntry {
  count: number;
  resetAt: number;
}

/**
 * Rule sizes are matched to the app's real cadence, not guessed:
 *
 * - `authRead` (GET  /api/auth/*): get-session etc. — generous 120/min so a
 *   NAT'd classroom refreshing pages never trips it.
 * - `authWrite` (POST /api/auth/*): sign-in/sign-up — tight 30/min per key;
 *   a human needs <5, a brute-force script now hits a wall (it was unbounded).
 * - `progressPut`: the client debounces PUTs at 1.5s (~40/min steady for one
 *   tab, double that for two synced tabs) — 120/min bounds abuse at 2/s while
 *   leaving legitimate sync far below the cap.
 */
export const RATE_LIMITS = {
  authRead: { windowMs: 60_000, max: 120 },
  authWrite: { windowMs: 60_000, max: 30 },
  progressPut: { windowMs: 60_000, max: 120 },
} as const satisfies Record<string, RateLimitRule>;

const windows = new Map<string, WindowEntry>();

/** Drop expired windows once the map grows large enough to matter. */
const PRUNE_THRESHOLD = 512;

function pruneExpired(now: number): void {
  if (windows.size < PRUNE_THRESHOLD) return;
  for (const [key, entry] of windows) {
    if (now >= entry.resetAt) windows.delete(key);
  }
}

/**
 * Consume one request from `key`'s fixed window.
 * `now` is injectable so tests advance time instead of sleeping.
 */
export function checkRateLimit(
  key: string,
  rule: RateLimitRule,
  now: number = Date.now(),
): RateLimitResult {
  pruneExpired(now);

  let entry = windows.get(key);
  if (!entry || now >= entry.resetAt) {
    entry = { count: 1, resetAt: now + rule.windowMs };
    windows.set(key, entry);
    return { allowed: true, remaining: rule.max - 1, retryAfterSeconds: 0 };
  }

  entry.count += 1;
  if (entry.count > rule.max) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
    };
  }
  return { allowed: true, remaining: rule.max - entry.count, retryAfterSeconds: 0 };
}

/** Non-cryptographic 32-bit hash — keeps raw session tokens out of the map. */
function hashToken(token: string): string {
  let hash = 5381;
  for (let i = 0; i < token.length; i++) {
    hash = ((hash << 5) + hash + token.charCodeAt(i)) >>> 0;
  }
  return hash.toString(36);
}

/** Key = client IP + hashed session (or `-` when anonymous). */
export function buildRateLimitKey(ip: string, sessionToken?: string | null): string {
  return sessionToken ? `${ip}|${hashToken(sessionToken)}` : `${ip}|-`;
}

/**
 * Endpoint budgets must not share a counter: the window map is keyed by key
 * only, so without a bucket prefix a burst of auth GETs (max 120) would
 * silently consume the auth POST budget (max 30) — caught by a live probe
 * during M4 P3. Every route therefore namespaces its key with its bucket.
 */
export type RateLimitBucket = 'auth-read' | 'auth-write' | 'progress-write';

export function bucketedKey(
  bucket: RateLimitBucket,
  ip: string,
  sessionToken: string | null,
): string {
  return `${bucket}:${buildRateLimitKey(ip, sessionToken)}`;
}

/**
 * Best-effort client IP. Vercel overwrites `x-forwarded-for` at the edge, so
 * the first hop is the real client; falls back for local dev where neither
 * header exists.
 */
export function ipFromHeaders(headers: { get(name: string): string | null }): string {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  const real = headers.get('x-real-ip');
  if (real && real.trim()) return real.trim();
  return 'unknown';
}

const SESSION_COOKIE = 'better-auth.session_token';

/**
 * Pull the better-auth session token from a Cookie header. Matches both the
 * plain and the `__Secure-` prefixed cookie name better-auth uses over TLS.
 */
export function sessionTokenFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(';')) {
    const eq = part.indexOf('=');
    if (eq === -1) continue;
    const name = part.slice(0, eq).trim();
    if (name === SESSION_COOKIE || name === `__Secure-${SESSION_COOKIE}`) {
      const value = part.slice(eq + 1).trim();
      return value || null;
    }
  }
  return null;
}

/** Test hook — current number of tracked windows. */
export function rateLimitSize(): number {
  return windows.size;
}

/** Test hook — drop all state between cases. */
export function resetRateLimits(): void {
  windows.clear();
}
