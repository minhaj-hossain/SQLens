import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/authorize';
import { listAnnouncements, createAnnouncement } from '@/lib/admin/announcements';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const authz = await requireAdmin(req);
  if (authz instanceof NextResponse) return authz;

  try {
    const announcements = await listAnnouncements();
    return NextResponse.json({ announcements });
  } catch (err) {
    console.error('Failed to list announcements:', err);
    return NextResponse.json({ error: 'list_failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authz = await requireAdmin(req);
  if (authz instanceof NextResponse) return authz;

  try {
    const body = await req.json();
    if (!body.title || !body.message) {
      return NextResponse.json({ error: 'title_and_message_required' }, { status: 400 });
    }

    const announcement = await createAnnouncement({
      title: body.title,
      message: body.message,
      severity: body.severity || 'info',
      active: body.active ?? true,
    });

    return NextResponse.json({ announcement }, { status: 201 });
  } catch (err) {
    console.error('Failed to create announcement:', err);
    return NextResponse.json({ error: 'create_failed' }, { status: 500 });
  }
}
