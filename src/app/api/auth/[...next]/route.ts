import { toNextJsHandler } from 'better-auth/next-js';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  RATE_LIMITS,
  bucketedKey,
  checkRateLimit,
  ipFromHeaders,
  sessionTokenFromCookie,
  type RateLimitBucket,
  type RateLimitRule,
} from '@/lib/rate-limit';

// Better Auth catch-all — replaces the old Express `app.all('/api/auth/*', ...)`.
// Runs on the Node.js runtime (Vercel default) so the MongoDB driver works.
const handlers = toNextJsHandler(auth);

/**
 * Item 13: fixed-window cap on every /api/auth/* call — GET (session reads)
 * and POST (sign-in/sign-up writes) get separate budgets via separate buckets
 * (a shared counter would let GET bursts exhaust the POST budget). Runs before
 * the handler so brute-force POSTs never reach the Mongo lookup.
 */
function withRateLimit<Args extends [NextRequest, ...unknown[]]>(
  handler: (...args: Args) => Response | Promise<Response>,
  rule: RateLimitRule,
  bucket: RateLimitBucket,
): (...args: Args) => Promise<Response> {
  return async (...args: Args) => {
    const [req] = args;
    const rl = checkRateLimit(
      bucketedKey(bucket, ipFromHeaders(req.headers), sessionTokenFromCookie(req.headers.get('cookie'))),
      rule,
    );
    if (!rl.allowed) {
      return NextResponse.json(
        {
          error: 'rate_limited',
          message: 'Too many attempts — please wait a moment and try again.',
          retryAfterSeconds: rl.retryAfterSeconds,
        },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfterSeconds) } },
      );
    }
    return handler(...args);
  };
}

export const GET = withRateLimit(handlers.GET, RATE_LIMITS.authRead, 'auth-read');
export const POST = withRateLimit(handlers.POST, RATE_LIMITS.authWrite, 'auth-write');
