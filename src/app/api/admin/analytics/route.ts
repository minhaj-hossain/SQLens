import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/authorize';
import { getAdminAnalytics } from '@/lib/admin/analytics';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/analytics
 * Aggregates learner retention, funnel drop-off, and milestone completion.
 * Protected: Admin only.
 */
export async function GET(req: NextRequest) {
  const authz = await requireAdmin(req);
  if (authz instanceof NextResponse) return authz;

  try {
    const analytics = await getAdminAnalytics();
    return NextResponse.json({ analytics });
  } catch (err) {
    console.error('Failed to aggregate admin analytics:', err);
    return NextResponse.json({ error: 'analytics_aggregation_failed' }, { status: 500 });
  }
}
