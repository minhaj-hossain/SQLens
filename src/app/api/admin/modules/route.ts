import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/authorize';
import { getAllModuleAvailability } from '@/lib/admin/modules';

/**
 * GET /api/admin/modules → full availability map (admin only, server-enforced).
 */
export async function GET(req: NextRequest) {
  const authz = await requireAdmin(req);
  if (authz instanceof NextResponse) return authz;

  const availability = await getAllModuleAvailability();
  return NextResponse.json({ availability });
}
