'use client';
/**
 * TrackDayLayoutView — the shared DAY boundary for every track (Task 4.2).
 * ─────────────────────────────────────────────────────────────────────────────
 * Extracted verbatim from the two byte-identical per-track layouts
 * (`src/app/(app)/sql/learn/[dayId]/layout.tsx` and its prisma sibling), which
 * are now thin delegates: `<TrackDayLayoutView track="sql">{children}</…>`.
 * The day-boundary logic lives HERE, once:
 *  - Validates dayId against the given track's curriculum (invalid → 404).
 *  - Owns the executor reset boundary: the in-memory SQL database resets when
 *    the learner enters a DIFFERENT day (not on concept/task navigation, so
 *    DML/DDL continuity is preserved within a day's flow).
 *  - Renders the breadcrumb bar ("Roadmap" + "Day N of M").
 *  - Enforces lock rules: the OVERVIEW page renders the locked notice; any
 *    deeper stage (theory/practice/challenge/complete) bounces back to it.
 *
 * The `track` prop is authoritative: meta, modules and the id lookup all come
 * from `TRACK_REGISTRY` (Phase 4.1), so the track literal in each delegate is
 * the only track-specific byte — the static guard in
 * `tests/tracks/phase11-day-layout-view.test.tsx` keeps the two delegates
 * identical modulo that literal.
 *
 * `resolveDayLayoutState` is the pure seam over the three derived decisions
 * (locked / overview / redirect target). It is exported so the redirect rule
 * is unit-testable per track without a DOM (effects never run under
 * `renderToStaticMarkup`).
 */
import React, { useEffect } from 'react';
import { useParams, usePathname, useRouter, notFound } from 'next/navigation';
import Icon from '@/components/ui/Icon';
import { useTrackConceptId } from '@/components/learn/use-track';
import { getModuleUnlockStatus } from '@/lib/progress/unlock-calculator';
import { getTrackDefinition } from '@/tracks/registry';
import { useSqlExecutor } from '@/components/providers/SqlExecutorProvider';
import { useLearning } from '@/components/providers/LearningProgressProvider';
import { useLearningNavigation } from '@/components/learn/use-learning-navigation';
import type { ModuleData } from '@/types/curriculum';
import type { UserLearningState } from '@/types/progress';
import type { TrackId } from '@/types/track';

/** The three decisions a day layout derives before it renders anything. */
export interface TrackDayLayoutState {
  /** Locked AND no completion record → deeper stages must not render. */
  isLocked: boolean;
  /** The URL points at the day's overview (the locked notice lives there). */
  isOverview: boolean;
  /** Non-null ⇔ a locked deep link must bounce to the day's overview URL. */
  redirectUrl: string | null;
}

/**
 * Pure derivation of the lock/overview/redirect decision — extracted from the
 * layout so the per-track redirect target (`/sql/...` vs `/prisma/...`) is
 * testable without a router or a DOM. Mirrors the pre-4.2 inline logic
 * exactly: unlock status from the track's own modules, plus the historical
 * completion-record escape hatch.
 */
export function resolveDayLayoutState(
  mod: ModuleData,
  modules: ModuleData[],
  pathname: string,
  track: TrackId,
  userState: UserLearningState,
): TrackDayLayoutState {
  const unlockStatus = getModuleUnlockStatus(mod, modules, userState);
  const isLocked = !unlockStatus.isUnlocked && !userState.completedModules[mod.id];
  const overviewUrl = `${getTrackDefinition(track).meta.basePath}/learn/${mod.id}`;
  const isOverview = pathname === overviewUrl;
  return { isLocked, isOverview, redirectUrl: isLocked && !isOverview ? overviewUrl : null };
}

export default function TrackDayLayoutView({
  track,
  children,
}: {
  track: TrackId;
  children: React.ReactNode;
}) {
  const { dayId } = useParams<{ dayId: string }>();
  const pathname = usePathname();
  const router = useRouter();
  const def = getTrackDefinition(track);
  const mod = def.getModuleById(dayId);
  if (!mod) notFound();

  const { userState } = useLearning();
  const { resetDatabase } = useSqlExecutor();
  const { backToRoadmap } = useLearningNavigation();

  // Explicit reset boundaries (Phase 3): the in-memory DB resets when the
  // learner enters a DIFFERENT DAY or a DIFFERENT CONCEPT. Theory→practice of
  // the same concept and task→task within a concept keep continuity.
  // (Content audit: Day 19 DML / Day 20 DDL need cross-concept isolation —
  // e.g. re-running a Day 20 CREATE TABLE task must not hit "table exists".)
  const conceptId = useTrackConceptId();
  useEffect(() => {
    resetDatabase();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dayId, conceptId]);

  // Locked-day enforcement: the OVERVIEW page renders the locked notice; any
  // deeper stage (theory/practice/challenge/complete) bounces back to it.
  const { isLocked, isOverview, redirectUrl } = resolveDayLayoutState(
    mod,
    def.modules,
    pathname,
    track,
    userState,
  );
  useEffect(() => {
    if (redirectUrl) router.replace(redirectUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [redirectUrl]);

  // P11.2: back lives in-flow (concept footer / editor run-row) via
  // useStepBack, which also owns scroll memory + prefetch. The top bar only
  // carries the roadmap link + day chip.
  if (isLocked && !isOverview) return null;

  return (
    <div className="flex flex-col w-full pb-8 px-2.5 sm:px-6 lg:px-8 py-3.5 sm:py-6 max-w-7xl mx-auto min-w-0 overflow-x-clip">
      {/* Breadcrumb Header */}
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 pb-4 mb-4 border-b border-border-soft">
        <button
          onClick={() => backToRoadmap(mod.id)}
          className="flex items-center gap-2 font-mono text-xs text-text-dim hover:text-text transition cursor-pointer min-w-0"
          title="Roadmap — back to your module card"
        >
          <Icon name="arrow_back" className="text-[16px] shrink-0" />
          <span className="truncate">Roadmap</span>
        </button>

        <div className="flex items-center gap-2 shrink-0">
          <span className="font-mono text-[11px] text-text-dim bg-surface-2 px-2.5 py-1 rounded border border-border whitespace-nowrap">
            Day {mod.day} of {def.modules.length}
          </span>
        </div>
      </div>

      {children}
    </div>
  );
}

