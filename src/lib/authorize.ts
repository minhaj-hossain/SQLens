import 'server-only';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

// Authorization types validated server-side from the trusted session (never from
// the client). role/status are read from the MongoDB `user` document, so a user
// cannot escalate their own role by editing localStorage, frontend state, or URL.

export interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  role: 'user' | 'admin';
  status: 'active' | 'blocked' | 'deleted';
}

/**
 * Pull the authenticated user from the request, or null when there is no valid
 * session. `getSession` verifies the cookie against the database via Better Auth.
 */
export async function getAuthUser(
  req: NextRequest,
): Promise<{ user: SessionUser } | null> {
  const session = await auth.api.getSession({
    headers: req.headers,
  });
  if (!session?.user) return null;
  const u = session.user as Partial<SessionUser> & typeof session.user;
  return {
    user: {
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role === 'admin' ? 'admin' : 'user',
      status: u.status === 'blocked' ? 'blocked' : u.status === 'deleted' ? 'deleted' : 'active',
    },
  };
}

/** Result of an authorization check — one shape, no union to narrow. */
export interface AuthResult {
  ok: boolean;
  user: SessionUser | null;
  response: NextResponse | null;
}

/**
 * Resolve an authorization check. Returns:
 *   - ok:true, user set, response null       → allowed
 *   - ok:false, user null, response set     → respond with this JSON error
 */
export async function authorize(
  req: NextRequest,
  guard: 'admin' | 'authenticated',
): Promise<AuthResult> {
  const result = await getAuthUser(req);
  if (!result) {
    return {
      ok: false,
      user: null,
      response: NextResponse.json({ error: 'unauthorized' }, { status: 401 }),
    };
  }
  const { user } = result;

  // A blocked/deleted account is never allowed authenticated features.
  if (user.status !== 'active') {
    return {
      ok: false,
      user: null,
      response: NextResponse.json(
        { error: 'account_' + user.status },
        { status: 403 },
      ),
    };
  }

  if (guard === 'admin' && user.role !== 'admin') {
    return {
      ok: false,
      user: null,
      response: NextResponse.json({ error: 'forbidden' }, { status: 403 }),
    };
  }

  return { ok: true, user, response: null };
}

/** Convenience wrapper for admin-only route handlers. */
export async function requireAdmin(
  req: NextRequest,
): Promise<{ user: SessionUser } | NextResponse> {
  return requireUser(req, 'admin');
}

/** Convenience wrapper for any authenticated user (must be active). */
export async function requireUser(
  req: NextRequest,
  guard: 'admin' | 'authenticated' = 'authenticated',
): Promise<{ user: SessionUser } | NextResponse> {
  const res = await authorize(req, guard);
  if (!res.ok) return res.response as NextResponse;
  return { user: res.user as SessionUser };
}