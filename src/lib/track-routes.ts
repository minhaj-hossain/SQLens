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
