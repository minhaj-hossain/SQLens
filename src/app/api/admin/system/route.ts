import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/authorize';
import { db } from '@/lib/auth';
import { ALL_MODULES } from '@/content/curriculum-index';
import { ROADMAP_MILESTONES } from '@/config/roadmap';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const authz = await requireAdmin(req);
  if (authz instanceof NextResponse) return authz;

  try {
    const mem = process.memoryUsage();
    const heapUsedMB = Math.round((mem.heapUsed / 1024 / 1024) * 10) / 10;
    const heapTotalMB = Math.round((mem.heapTotal / 1024 / 1024) * 10) / 10;
    const rssMB = Math.round((mem.rss / 1024 / 1024) * 10) / 10;

    // Ping MongoDB
    let dbStatus = 'connected';
    let collectionsCount = 0;
    try {
      const cols = await db.listCollections().toArray();
      collectionsCount = cols.length;
    } catch {
      dbStatus = 'unhealthy';
    }

    // Curriculum statistics
    const totalModules = ALL_MODULES.length;
    const totalConcepts = ALL_MODULES.reduce(
      (sum, m) => sum + (m.concepts?.length || 0),
      0,
    );
    const totalPracticeTasks = ALL_MODULES.reduce(
      (sum, m) =>
        sum +
        (m.concepts?.reduce(
          (cSum, c) => cSum + (c.tasks?.length || 0),
          0,
        ) || 0),
      0,
    );

    return NextResponse.json({
      system: {
        serverTime: new Date().toISOString(),
        uptimeSeconds: Math.floor(process.uptime()),
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        environment: process.env.NODE_ENV || 'development',
        memory: {
          heapUsedMB,
          heapTotalMB,
          rssMB,
        },
        database: {
          status: dbStatus,
          name: db.databaseName,
          collectionsCount,
        },
        curriculum: {
          modulesCount: totalModules,
          conceptsCount: totalConcepts,
          practiceTasksCount: totalPracticeTasks,
          milestonesCount: ROADMAP_MILESTONES.length,
          status: 'verified',
        },
      },
    });
  } catch (err) {
    console.error('Failed to get system health:', err);
    return NextResponse.json({ error: 'system_health_failed' }, { status: 500 });
  }
}
