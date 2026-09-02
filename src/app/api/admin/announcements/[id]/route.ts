import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/authorize';
import { toggleAnnouncementActive, deleteAnnouncement } from '@/lib/admin/announcements';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authz = await requireAdmin(req);
  if (authz instanceof NextResponse) return authz;

  const { id } = await params;
  try {
    const body = await req.json();
    if (typeof body.active !== 'boolean') {
      return NextResponse.json({ error: 'active_boolean_required' }, { status: 400 });
    }

    await toggleAnnouncementActive(id, body.active);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Failed to update announcement:', err);
    return NextResponse.json({ error: 'update_failed' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authz = await requireAdmin(req);
  if (authz instanceof NextResponse) return authz;

  const { id } = await params;
  try {
    await deleteAnnouncement(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Failed to delete announcement:', err);
    return NextResponse.json({ error: 'delete_failed' }, { status: 500 });
  }
}
