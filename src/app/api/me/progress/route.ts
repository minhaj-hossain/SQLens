import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { authorize } from '@/lib/authorize';
import { getProgress, saveProgress, resetProgress, deleteProgress } from '@/lib/server/progress-store';
import { getResetEpoch, type CloudProgress } from '@/lib/progress/merge';

/**
 * Per-user progress sync (Phase 2). `userId` always comes from the verified
 * session — never from the request — so a user can only touch their own doc.
 * Blocked/deleted accounts are rejected by `authorize` before anything here runs.
 */

export async function GET(req: NextRequest) {
  const res = await authorize(req, 'authenticated');
  if (!res.ok) return res.response as NextResponse;
  const { progress, version, updatedAt, resetEpoch, resetAt } = await getProgress(res.user!.id);
  return NextResponse.json({ progress, version, updatedAt, resetEpoch, resetAt });
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

  // Batch 2: legacy clients that predate resetEpoch write epoch 0 — accepted
  // unless a reset tombstone already bumped the stored epoch, in which case
  // saveProgress reports stale and we answer 409 so the tab refetches Day 1
  // instead of resurrecting pre-reset bytes.
  const result = await saveProgress(res.user!.id, { ...body.progress, resetEpoch: getResetEpoch(body.progress) });
  if (!result.ok) {
    return NextResponse.json(
      { error: 'reset_stale', storedEpoch: result.storedEpoch, version: result.version, updatedAt: result.updatedAt },
      { status: 409 },
    );
  }
  return NextResponse.json({ ...result });
}

export async function DELETE(req: NextRequest) {
  const res = await authorize(req, 'authenticated');
  if (!res.ok) return res.response as NextResponse;

  // Batch 2 — permanent fix for "reset, then refresh brings data back": a full
  // reset is now an authoritative epoch-bumped tombstone, NOT a deleteOne.
  // Deleting the doc left a hole that any racing/stale PUT (in-flight write,
  // pagehide flush, stale tab on GET-null) would blindly recreate; the
  // tombstone instead rejects those stale writes with 409 and makes every
  // later GET converge to Day 1. deleteProgress() stays for admin/account
  // deletion only. keepalive retained: the reset must commit even if the tab
  // navigates away mid-request.
  void deleteProgress;
  const result = await resetProgress(res.user!.id);
  return NextResponse.json({ ok: true, ...result });
}