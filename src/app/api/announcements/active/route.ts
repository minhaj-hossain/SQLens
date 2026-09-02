import { NextResponse } from 'next/server';
import { getActiveAnnouncement } from '@/lib/admin/announcements';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const announcement = await getActiveAnnouncement();
    return NextResponse.json({ announcement });
  } catch (err) {
    console.error('Failed to get active announcement:', err);
    return NextResponse.json({ announcement: null });
  }
}
