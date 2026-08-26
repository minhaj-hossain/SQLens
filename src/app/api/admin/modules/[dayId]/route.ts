import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/authorize';
import { setModuleAvailability } from '@/lib/admin/modules';
import type { UnlockMode } from '@/types/progress';

const VALID_MODES: UnlockMode[] = ['automatic', 'manual', 'scheduled', 'locked'];

/**
 * PUT /api/admin/modules/:dayId
 * Body: { unlockMode: 'automatic'|'manual'|'scheduled'|'locked', unlockAt?: ISO }
 * Admin-only (server-enforced). Schedules require a valid unlockAt datetime.
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ dayId: string }> },
) {
  const authz = await requireAdmin(req);
  if (authz instanceof NextResponse) return authz;

  const { dayId } = await params;
  if (!/^day-\d{2}$/.test(dayId)) {
    return NextResponse.json({ error: 'invalid_day_id' }, { status: 400 });
  }

  let body: { unlockMode?: string; unlockAt?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const mode = body?.unlockMode as UnlockMode;
  if (!VALID_MODES.includes(mode)) {
    return NextResponse.json({ error: 'invalid_unlock_mode' }, { status: 400 });
  }

  try {
    const record = await setModuleAvailability(dayId, { unlockMode: mode, unlockAt: body.unlockAt }, authz.user.id);
    return NextResponse.json({ module: record });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'update_failed';
    return NextResponse.json({ error: msg }, { status: msg === 'invalid_unlock_at' ? 400 : 500 });
  }
}

/**
 * DELETE /api/admin/modules/:dayId
 * Resets the module to automatic (removes any admin override).
 * Admin-only (server-enforced).
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ dayId: string }> },
) {
  const authz = await requireAdmin(req);
  if (authz instanceof NextResponse) return authz;

  const { dayId } = await params;
  if (!/^day-\d{2}$/.test(dayId)) {
    return NextResponse.json({ error: 'invalid_day_id' }, { status: 400 });
  }

  const record = await setModuleAvailability(dayId, { unlockMode: 'automatic' }, authz.user.id);
  return NextResponse.json({ module: record });
}
