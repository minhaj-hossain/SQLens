'use client';
/**
 * useStepBack — P11.2 step-chain Back for the learn flow.
 *
 * Owns everything the in-flow "← Back" button needs:
 *  - the deterministic previous-step lookup (getPreviousStep v2, with
 *    tasksByConcept derived from the module so callers never pass it)
 *  - scroll memory: writes the current scroll Y before navigating back and
 *    restores it one-shot on arrival (double-rAF so it wins over Next's
 *    default top-scroll) — back and forth feels seamless
 *  - prefetch of the back target for instant, spinner-free navigation
 *
 * taskQuery: pass `searchParams.get('task')` on practice pages (needed to
 * resolve task→task steps); omit elsewhere. No useSearchParams inside —
 * safe for pages not wrapped in Suspense.
 */
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getModuleById } from '@/content/curriculum-index';
import { getPreviousStep } from '@/lib/learn-routes';

export function useStepBack(dayId: string, taskQuery: string | null = null) {
  const router = useRouter();
  const pathname = usePathname();

  const mod = getModuleById(dayId);
  const conceptIds = useMemo(() => mod?.concepts.map((c) => c.id) ?? [], [mod]);
  const tasksByConcept = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of mod?.concepts ?? []) map[c.id] = c.tasks.length;
    return map;
  }, [mod]);

  const backStep = useMemo(
    () => getPreviousStep(dayId, pathname, conceptIds, taskQuery, tasksByConcept),
    [dayId, pathname, conceptIds, taskQuery, tasksByConcept],
  );

  const scrollKey = `${pathname}${taskQuery ? `?task=${taskQuery}` : ''}`;
  const scrollRestoredFor = useRef<string | null>(null);

  const goBack = useCallback(
    (url: string) => {
      try {
        sessionStorage.setItem(`sqlens_scroll_${scrollKey}`, String(window.scrollY));
      } catch {
        /* storage unavailable — back still works, just no scroll restore */
      }
      router.push(url);
    },
    [router, scrollKey],
  );

  // Restore saved scroll one-shot when arriving after a back.
  useEffect(() => {
    if (scrollRestoredFor.current === scrollKey) return;
    try {
      const saved = sessionStorage.getItem(`sqlens_scroll_${scrollKey}`);
      if (saved) {
        scrollRestoredFor.current = scrollKey;
        sessionStorage.removeItem(`sqlens_scroll_${scrollKey}`);
        const y = Number(saved);
        if (Number.isFinite(y)) {
          requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo(0, y)));
        }
      }
    } catch {
      /* ignore */
    }
  }, [scrollKey]);

  // Prefetch the back target so the click is instant (no loading flash).
  useEffect(() => {
    if (backStep) router.prefetch(backStep.url);
  }, [backStep, router]);

  return { backStep, goBack };
}
