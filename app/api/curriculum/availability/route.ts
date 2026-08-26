import { NextResponse } from 'next/server';
import { getAllModuleAvailability } from '@/lib/admin/modules';

/**
 * GET /api/curriculum/availability
 *
 * PUBLIC endpoint — no auth required. Guests and signed-in users alike fetch
 * the global curriculum schedule here. Contains only module unlock config;
 * never exposes user data.
 */
export async function GET() {
  try {
    const availability = await getAllModuleAvailability();
    return NextResponse.json(
      { availability },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (err) {
    console.error('[availability] failed:', err);
    // Fail open: an empty map means every module uses its default behaviour.
    return NextResponse.json({ availability: {} });
  }
}
