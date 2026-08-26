import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/authorize';
import { listUsers } from '@/lib/admin/users';

/**
 * GET /api/admin/users  → list users (admin only, server-enforced).
 * ?limit=&offset=      → pagination (default limit 50, offset 0).
 */
export async function GET(req: NextRequest) {
  const authz = await requireAdmin(req);
  if (authz instanceof NextResponse) return authz;

  const { searchParams } = new URL(req.url);
  const limit = Math.min(200, Math.max(1, Number(searchParams.get('limit')) || 50));
  const offset = Math.max(0, Number(searchParams.get('offset')) || 0);

  const { users, total } = await listUsers({ limit, offset });
  return NextResponse.json({ users, total });
}