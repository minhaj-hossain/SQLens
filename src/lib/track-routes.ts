/**
 * Track-aware route builders — Phase 1 (multi-track foundation).
 * ─────────────────────────────────────────────────────────────────────────────
 * ADDITIVE ONLY. `src/lib/learn-routes.ts` is NOT modified: its SQL helpers
 * keep returning `/` and `/learn/...` exactly as today. These helpers build
 * the Phase-2 namespaced URLs (`/sql/...`, `/prisma/...`) and learn to parse
 * both `day-NN` and `prisma-NN` ids.
 */

import type { TrackId } from '../types/track';
import { TRACK_META } from '../types/track';
import type { LearnStage } from './learn-routes';

export function trackRoadmapUrl(track: TrackId, highlightModuleId?: string): string {
  const base = TRACK_META[track].basePath;
  return highlightModuleId ? `${base}?highlight=${highlightModuleId}` : base;
}

export function trackLearnUrl(
  track: TrackId,
  moduleId: string,
  stage: LearnStage,
  conceptId?: string,
  taskIndex?: number,
): string {
  const base = `${TRACK_META[track].basePath}/learn/${moduleId}`;
  switch (stage) {
    case 'theory':
      return `${base}/theory/${conceptId ?? ''}`;
    case 'practice': {
      const practiceBase = `${base}/practice/${conceptId ?? ''}`;
      return taskIndex === undefined ? practiceBase : `${practiceBase}?task=${taskIndex}`;
    }
    case 'challenge':
      return `${base}/challenge`;
    case 'complete':
      return `${base}/complete`;
  }
}

const TRACK_DAY_PATTERN = /^(?:day-\d{2}|prisma-\d{2})$/;

/** Extract a module id (`day-NN` or `prisma-NN`) from a track-namespaced learn pathname. */
export function trackModuleIdFromPathname(pathname: string | null): string | null {
  if (!pathname) return null;
  const match = /^\/(?:sql|prisma)\/learn\/([a-z]+-\d{2})(?:\/|$)/.exec(pathname);
  if (!match) return null;
  return TRACK_DAY_PATTERN.test(match[1]) ? match[1] : null;
}

/** Concept slug from a track-namespaced theory/practice pathname, else null. */
export function trackConceptIdFromPathname(pathname: string | null): string | null {
  if (!pathname) return null;
  const match = /^\/(?:sql|prisma)\/learn\/[a-z]+-\d{2}\/(?:theory|practice)\/([a-z0-9-]+)/.exec(pathname);
  return match ? match[1] : null;
}

/** Which track owns a pathname (`/sql/...` → sql, `/prisma/...` → prisma). */
export function trackFromPathname(pathname: string | null): TrackId | null {
  if (!pathname) return null;
  if (pathname === '/sql' || pathname.startsWith('/sql/')) return 'sql';
  if (pathname === '/prisma' || pathname.startsWith('/prisma/')) return 'prisma';
  return null;
}

/**
 * Track-aware `getPreviousStep` (P11.2 step-chain Back).
 *
 * Same contract as `learn-routes.ts#getPreviousStep` but every URL it returns
 * is namespaced (`/sql/learn/…`, `/prisma/learn/…`) and it accepts ids of both
 * shapes. The SQL file stays frozen; callers that live on a track-namespaced
 * route use this one instead.
 *
 *   practice ?task=N>0 → that task's previous task
 *   practice ?task=0   → that concept's theory
 *   theory concept i>0 → previous concept's LAST task, or its theory
 *   theory concept 0   → the track roadmap, highlighting this module's card
 *   challenge          → last concept's last task (or its theory)
 *   complete           → challenge
 *   overview           → null (the roadmap link covers it)
 */
export function getTrackPreviousStep(
  track: TrackId,
  moduleId: string,
  pathname: string,
  conceptIds: string[],
  taskQuery: string | null,
  tasksByConcept?: Record<string, number>,
): { url: string; label: string; hint: string } | null {
  const overview = `${TRACK_META[track].basePath}/learn/${moduleId}`;
  if (pathname === overview) return null;

  const conceptId = trackConceptIdFromPathname(pathname) ?? '';
  const lastTaskOf = (cid: string): { url: string; hint: string } | null => {
    const count = tasksByConcept?.[cid] ?? 0;
    if (count > 0) {
      return {
        url: trackLearnUrl(track, moduleId, 'practice', cid, count - 1),
        hint: `Back to Task ${count}`,
      };
    }
    return null;
  };

  // practice /[track]/learn/<moduleId>/practice/<conceptId>?task=N
  if (pathname.startsWith(`${overview}/practice/`)) {
    const taskIdx = parseInt(taskQuery ?? '0', 10);
    if (!Number.isFinite(taskIdx) || taskIdx < 0) {
      return {
        url: trackLearnUrl(track, moduleId, 'theory', conceptId),
        label: 'Back',
        hint: 'Back to Lesson',
      };
    }
    if (taskIdx > 0) {
      return {
        url: trackLearnUrl(track, moduleId, 'practice', conceptId, taskIdx - 1),
        label: 'Back',
        hint: `Back to Task ${taskIdx}`,
      };
    }
    return {
      url: trackLearnUrl(track, moduleId, 'theory', conceptId),
      label: 'Back',
      hint: 'Back to Lesson',
    };
  }

  // theory /[track]/learn/<moduleId>/theory/<conceptId>
  if (pathname.startsWith(`${overview}/theory/`)) {
    const idx = conceptIds.indexOf(conceptId);
    if (idx > 0) {
      const prevId = conceptIds[idx - 1];
      const prevTask = lastTaskOf(prevId);
      if (prevTask) return { ...prevTask, label: 'Back' };
      return {
        url: trackLearnUrl(track, moduleId, 'theory', prevId),
        label: 'Back',
        hint: 'Back to Lesson',
      };
    }
    return { url: trackRoadmapUrl(track, moduleId), label: 'Back', hint: 'Back to Module' };
  }

  // challenge
  if (pathname === `${overview}/challenge`) {
    const last = conceptIds[conceptIds.length - 1];
    if (last) {
      const lastTask = lastTaskOf(last);
      if (lastTask) return { ...lastTask, label: 'Back' };
      return {
        url: trackLearnUrl(track, moduleId, 'theory', last),
        label: 'Back',
        hint: 'Back to Lesson',
      };
    }
    return { url: trackRoadmapUrl(track, moduleId), label: 'Back', hint: 'Back to Module' };
  }

  // complete
  if (pathname === `${overview}/complete`) {
    return { url: `${overview}/challenge`, label: 'Back', hint: 'Back to Challenge' };
  }

  return null;
}

