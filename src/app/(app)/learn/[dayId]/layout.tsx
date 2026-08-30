'use client';
/**
 * /learn/[dayId] layout — the DAY boundary (Phase 3).
 *  - Validates dayId against the curriculum (invalid → 404).
 *  - Owns the executor reset boundary: the in-memory SQL database resets when
 *    the learner enters a DIFFERENT day (not on concept/task navigation, so
 *    DML/DDL continuity is preserved within a day's flow).
 *  - Renders the breadcrumb bar ("Back to Learning Path" + "Day N of 38").
 */
import React, { useEffect, useMemo, useRef } from 'react';
import { useParams, usePathname, useRouter, useSearchParams, notFound } from 'next/navigation';
import Icon from '@/components/ui/Icon';
import { ALL_MODULES, getModuleById } from '@/content/curriculum-index';
import { getModuleUnlockStatus } from '@/lib/progress/unlock-calculator';
import { conceptIdFromPathname, getPreviousStep } from '@/lib/learn-routes';
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
  // learner enters a DIFFERENT DAY or a DIFFERENT CONCEPT. Theory→practice of
  // the same concept and task→task within a concept keep continuity.
  // (Content audit: Day 19 DML / Day 20 DDL need cross-concept isolation —
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

  // P9.5 smooth back: task param + scroll memory + prefetch for instant nav.
  const searchParams = useSearchParams();
  const taskQuery = searchParams.get('task');
  const conceptIds = mod.concepts.map((c) => c.id);
  const backStep = getPreviousStep(mod.id, pathname, conceptIds, taskQuery);
  const scrollKey = `${pathname}${taskQuery ? `?task=${taskQuery}` : ''}`;
  const scrollRestoredFor = useRef<string | null>(null);
  const goBack = (url: string) => {
    try {
      sessionStorage.setItem(`sqlens_scroll_${scrollKey}`, String(window.scrollY));
    } catch {}
    router.push(url);
  };

  // Restore saved scroll position one-shot when arriving (only after a back).
  useEffect(() => {
    if (scrollRestoredFor.current === scrollKey) return;
    try {
      const saved = sessionStorage.getItem(`sqlens_scroll_${scrollKey}`);
      if (saved) {
        scrollRestoredFor.current = scrollKey;
        sessionStorage.removeItem(`sqlens_scroll_${scrollKey}`);
        const y = Number(saved);
        if (Number.isFinite(y)) {
          // Nudge twice so it wins the race against Next's default top-scroll.
          requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo(0, y)));
        }
      }
    } catch {}
  }, [scrollKey]);

  // Prefetch the back target so the click is instant (no loading flash).
  useEffect(() => {
    if (backStep) router.prefetch(backStep.url);
  }, [backStep, router]);
  if (isLocked && !isOverview) return null;

  return (
    <div className="flex flex-col w-full pb-8 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
      {/* Breadcrumb Header (replaces the old in-page breadcrumb) */}
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 pb-4 mb-4 border-b border-outline-variant/40">
        <div className="flex items-center gap-2 min-w-0">
          {backStep && (
            <button
              onClick={() => goBack(backStep.url)}
              className="flex items-center gap-2 font-label-sm text-label-sm text-text-muted hover:text-text transition cursor-pointer px-2.5 py-1 rounded-lg border border-outline-variant/70 bg-surface-container/40 whitespace-nowrap"
              title={`Back to ${backStep.label}`}
            >
              <Icon name="arrow_back" className="text-[16px] shrink-0" />
              <span className="truncate">{backStep.label}</span>
            </button>
          )}
          <button
            onClick={() => backToRoadmap(mod.id)}
            className="flex items-center gap-2 font-label-sm text-label-sm text-text-muted hover:text-primary transition cursor-pointer min-w-0"
          >
            <Icon name="arrow_back" className="text-[18px] shrink-0" />
            <span className="truncate">Back to Learning Path</span>
          </button>
        </div>

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
