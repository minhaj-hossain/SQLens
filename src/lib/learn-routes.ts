/**
 * URL builders for the /learn route tree (Phase 3).
 *
 * /learn                 → resume point redirect
 * /learn/[dayId]         → module overview
 * /learn/[dayId]/theory/[conceptId]
 * /learn/[dayId]/practice/[conceptId]?task=N
 * /learn/[dayId]/challenge
 * /learn/[dayId]/complete
 *
 * Concept positions use STABLE SLUGS (Phase 2) — never array indexes — so
 * curriculum reordering cannot break bookmarks or shared links.
 */

export type LearnStage = 'theory' | 'practice' | 'challenge' | 'complete';

export function learnUrl(
  dayId: string,
  stage: LearnStage,
  conceptId?: string,
  taskIndex?: number,
): string {
  switch (stage) {
    case 'theory':
      return `/learn/${dayId}/theory/${conceptId ?? ''}`;
    case 'practice': {
      const base = `/learn/${dayId}/practice/${conceptId ?? ''}`;
      return taskIndex === undefined ? base : `${base}?task=${taskIndex}`;
    }
    case 'challenge':
      return `/learn/${dayId}/challenge`;
    case 'complete':
      return `/learn/${dayId}/complete`;
  }
}

/** Day road map: highlight a module card after navigating back to `/`. */
export function roadmapUrl(highlightDayId?: string): string {
  return highlightDayId ? `/?highlight=${highlightDayId}` : '/';
}

/** Extract a valid dayId from a /learn/[dayId]/… pathname, else null. */
export function dayIdFromPathname(pathname: string | null): string | null {
  if (!pathname) return null;
  const match = /^\/learn\/(day-\d{2})(?:\/|$)/.exec(pathname);
  return match ? match[1] : null;
}

/**
 * Concept slug from a theory/practice pathname, else null (overview,
 * challenge and complete have no concept in the URL).
 */
export function conceptIdFromPathname(pathname: string | null): string | null {
  if (!pathname) return null;
  const match = /^\/learn\/day-\d{2}\/(?:theory|practice)\/([a-z0-9-]+)/.exec(pathname);
  return match ? match[1] : null;
}
