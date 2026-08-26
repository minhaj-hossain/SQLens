import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/authorize';
import { getUserById, setUserStatus, removeUser } from '@/lib/admin/users';

/**
 * PATCH /api/admin/users/[id]
 *   body: { action: 'block' } | { action: 'unblock' }
 * DELETE /api/admin/users/[id]
 *   permanently removes the user (user + session + account docs)
 * Both admin-only, server-enforced.
 */

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, ctx: Params) {
  const authz = await requireAdmin(req);
  if (authz instanceof NextResponse) return authz;

  const { id } = await ctx.params;
  const target = await getUserById(id);
  if (!target) {
    return NextResponse.json({ error: 'user_not_found' }, { status: 404 });
  }

  let action: string | null = null;
  try {
    const body = await req.json();
    action = body?.action;
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  if (action === 'block' || action === 'unblock') {
    const next = action === 'block' ? 'blocked' : 'active';
    const updated = await setUserStatus(id, next);
    return NextResponse.json({ user: updated });
  }

  return NextResponse.json({ error: 'invalid_action' }, { status: 400 });
}

export async function DELETE(req: NextRequest, ctx: Params) {
  const authz = await requireAdmin(req);
  if (authz instanceof NextResponse) return authz;

  const { id } = await ctx.params;
  const target = await getUserById(id);
  if (!target) {
    return NextResponse.json({ error: 'user_not_found' }, { status: 404 });
  }

  await removeUser(id);
  return NextResponse.json({ success: true });
}