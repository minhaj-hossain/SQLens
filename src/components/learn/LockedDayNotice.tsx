'use client';
/**
 * LockedDayNotice — the in-place "this day is locked" screen (Phase 4).
 * ─────────────────────────────────────────────────────────────────────────────
 * Extracted from the retired `/learn/[dayId]` overview page: with that page
 * gone, the DAY LAYOUT is the one owner of the locked-day experience, so a
 * locked deep link (theory/practice/challenge/complete) renders this notice
 * instead of the lesson — never a redirect.
 *
 * Self-contained: it derives the unlock reason from the active track's own
 * curriculum + progress, and the back link stays track-aware (`meta.basePath`).
 */
import React from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import { useTrackCurriculum } from '@/components/learn/use-track';
import { getModuleDisplayLabel } from '@/lib/curriculum/module-order';
import { getModuleUnlockStatus } from '@/lib/progress/unlock-calculator';
import { useLearning } from '@/components/providers/LearningProgressProvider';
import type { ModuleData } from '@/types/curriculum';

interface LockedDayNoticeProps {
  /** The locked module. Passed directly (client→client) — never serialized. */
  mod: ModuleData;
}

export function LockedDayNotice({ mod }: LockedDayNoticeProps) {
  const { modules, meta } = useTrackCurriculum();
  const { userState } = useLearning();
  const unlockStatus = getModuleUnlockStatus(mod, modules, userState);

  return (
    <div className="max-w-xl mx-auto text-center py-16">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-surface-container border border-outline-variant/60 text-text-dim mb-4">
        <Icon name="lock" className="text-[26px]" />
      </div>
      <h1 className="font-display text-xl font-bold text-text mb-2">
        {getModuleDisplayLabel(mod)} is locked
      </h1>
      <p className="text-sm text-text-dim font-body leading-relaxed mb-6">
        {unlockStatus.reason || 'Complete the previous days to unlock this lesson.'}
      </p>
      <Link
        href={meta.basePath}
        className="inline-flex items-center gap-2 font-mono text-xs bg-func text-ink font-bold px-4 py-2 rounded-lg hover:brightness-110 transition"
      >
        <Icon name="arrow_back" className="text-[15px]" />
        Back to Learning Path
      </Link>
    </div>
  );
}

export default LockedDayNotice;
