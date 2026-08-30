'use client';
/**
 * /learn/[dayId] layout â€” the DAY boundary (Phase 3).
 *  - Validates dayId against the curriculum (invalid â†’ 404).
 *  - Owns the executor reset boundary: the in-memory SQL database resets when
 *    the learner enters a DIFFERENT day (not on concept/task navigation, so
 *    DML/DDL continuity is preserved within a day's flow).
 *  - Renders the breadcrumb bar ("Back to Learning Path" + "Day N of 38").
 */
import React, { useEffect } from 'react';
import { useParams, usePathname, useRouter, notFound } from 'next/navigation';
import Icon from '@/components/ui/Icon';
import { ALL_MODULES, getModuleById } from '@/content/curriculum-index';
import { getModuleUnlockStatus } from '@/lib/progress/unlock-calculator';
import { conceptIdFromPathname } from '@/lib/learn-routes';
import { useSqlExecutor } from '@/components/providers/SqlExecutorProvider';
import { useLearning } from '@/components/providers/LearningProgressProvider';
import { useLearningNavigation } from '@/components/learn/use-learning-navigation';

export default function DayLayout({ children }: { children: React.ReactNode }) {
  const { dayId } = useParams<{ dayId: string }>();
  const pathname = usePathname();
  const router = useRouter();
  const mod = getModuleById(dayId);
  if (!mod) notFound();

  const { userState } = useLearning();
  const { resetDatabase } = useSqlExecutor();
  const { backToRoadmap } = useLearningNavigation();

  // Explicit reset boundaries (Phase 3): the in-memory DB resets when the
  // learner enters a DIFFERENT DAY or a DIFFERENT CONCEPT. Theoryâ†’practice of
  // the same concept and taskâ†’task within a concept keep continuity.
  // (Content audit: Day 19 DML / Day 20 DDL need cross-concept isolation â€”
  // e.g. re-running a Day 20 CREATE TABLE task must not hit "table exists".)
  const conceptId = conceptIdFromPathname(pathname);
  useEffect(() => {
    resetDatabase();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dayId, conceptId]);

  // Locked-day enforcement: the OVERVIEW page renders the locked notice; any
  // deeper stage (theory/practice/challenge/complete) bounces back to it.
  const unlockStatus = getModuleUnlockStatus(mod, ALL_MODULES, userState);
  const isLocked = !unlockStatus.isUnlocked && !userState.completedModules[mod.id];
  const isOverview = pathname === `/learn/${mod.id}`;
  useEffect(() => {
    if (isLocked && !isOverview) router.replace(`/learn/${mod.id}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLocked, isOverview, mod.id]);

  if (isLocked && !isOverview) return null;

  return (
    <div className="flex flex-col w-full pb-8 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
      {/* Breadcrumb Header (replaces the old in-page breadcrumb) */}
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 pb-4 mb-4 border-b border-outline-variant/40">
        <button
          onClick={() => backToRoadmap(mod.id)}
          className="flex items-center gap-2 font-label-sm text-label-sm text-text-muted hover:text-primary transition cursor-pointer min-w-0"
        >
          <Icon name="arrow_back" className="text-[18px] shrink-0" />
          <span className="truncate">Back to Learning Path</span>
        </button>

        <div className="flex items-center gap-2 shrink-0">
          <span className="font-label-sm text-label-sm bg-surface-container text-text-muted px-2.5 py-1 rounded border border-outline-variant/60 whitespace-nowrap">
            Day {mod.day} of {ALL_MODULES.length}
          </span>
        </div>
      </div>

      {children}
    </div>
  );
}
