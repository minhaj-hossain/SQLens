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

/**
 * P9.5 "Back to where I was" — deterministic previous-step mapping for the
 * linear learn chain:
 *
 *   [module card] → c1 theory → c1 task1 → c1 task2 → c2 theory → … → challenge → complete
 *
 * Back always means the node before the current one, never fragile history:
 *   practice ?task=N>0 → that task's previous task
 *   practice ?task=0   → that concept's theory
 *   theory concept i>0 → previous concept's theory
 *   theory concept 0   → module overview card   (the exact flow you described)
 *   challenge          → last concept's theory
 *   complete           → challenge (or last theory if the module has none)
 *   overview           → null (no back; "Back to Learning Path" covers it)
 */
export function getPreviousStep(
  dayId: string,
  pathname: string,
  conceptIds: string[],
  taskQuery: string | null,
): { url: string; label: string } | null {
  const overview = `/learn/${dayId}`;
  if (pathname === overview) return null;

  const conceptId = conceptIdFromPathname(pathname) ?? '';

  // practice /learn/day-XX/practice/[conceptId]?task=N
  if (pathname.startsWith(`${overview}/practice/`)) {
    const taskIdx = parseInt(taskQuery ?? '0', 10);
    if (!Number.isFinite(taskIdx) || taskIdx < 0) {
      return { url: learnUrl(dayId, 'theory', conceptId), label: 'Back to Lesson' };
    }
    if (taskIdx > 0) {
      return { url: learnUrl(dayId, 'practice', conceptId, taskIdx - 1), label: `Back to Task ${taskIdx}` };
    }
    return { url: learnUrl(dayId, 'theory', conceptId), label: 'Back to Lesson' };
  }

  // theory /learn/day-XX/theory/[conceptId]
  if (pathname.startsWith(`${overview}/theory/`)) {
    const idx = conceptIds.indexOf(conceptId);
    if (idx > 0) {
      return { url: learnUrl(dayId, 'theory', conceptIds[idx - 1]), label: 'Previous Concept' };
    }
    return { url: overview, label: 'Back to Module' };
  }

  // challenge
  if (pathname === `${overview}/challenge`) {
    const last = conceptIds[conceptIds.length - 1];
    return last ? { url: learnUrl(dayId, 'theory', last), label: 'Back to Lesson' } : { url: overview, label: 'Back to Module' };
  }

  // complete
  if (pathname === `${overview}/complete`) {
    return { url: `${overview}/challenge`, label: 'Back to Challenge' };
  }

  return null;
}