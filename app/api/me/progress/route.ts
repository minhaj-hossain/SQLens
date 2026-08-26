import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { authorize } from '@/lib/authorize';
import { getProgress, saveProgress } from '@/lib/server/progress-store';
import type { CloudProgress } from '@/lib/progress/merge';

/**
 * Per-user progress sync (Phase 2). `userId` always comes from the verified
 * session — never from the request — so a user can only touch their own doc.
 * Blocked/deleted accounts are rejected by `authorize` before anything here runs.
 */

export async function GET(req: NextRequest) {
  const res = await authorize(req, 'authenticated');
  if (!res.ok) return res.response as NextResponse;
  const progress = await getProgress(res.user!.id);
  return NextResponse.json({ progress });
}

export async function PUT(req: NextRequest) {
  const res = await authorize(req, 'authenticated');
  if (!res.ok) return res.response as NextResponse;

  let body: { progress?: CloudProgress };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }
  if (!body?.progress || typeof body.progress !== 'object') {
    return NextResponse.json({ error: 'missing_progress' }, { status: 400 });
  }

  // Basic shape validation before persisting.
  const p = body.progress as Record<string, unknown>;
  if (
    typeof p.currentModuleId !== 'string' ||
    typeof p.completedModules !== 'object' ||
    p.completedModules === null
  ) {
    return NextResponse.json({ error: 'invalid_progress_shape' }, { status: 400 });
  }

  const result = await saveProgress(res.user!.id, body.progress);
  return NextResponse.json({ ok: true, ...result });
}