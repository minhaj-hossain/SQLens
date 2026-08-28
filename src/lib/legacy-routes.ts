/**
 * Legacy URL mapping (Phase 3) — one central place, per the migration plan.
 *
 * Old scheme: /?day=N&stage=lesson|practice|concept_complete|challenge|day_complete&concept=I&task=J
 * (concept is 1-based; task is 0-based — both preserved verbatim where they
 * still exist in the new scheme).
 *
 * Pure and synchronous: resolves against the curriculum's concept slugs.
 * Unlock enforcement does NOT happen here (it is client-side by design) —
 * the destination page renders the locked-state UI when the day is locked,
 * mirroring the pre-migration behaviour of refusing locked deep links.
 */
import { getModuleById } from '@/content/curriculum-index';

export type LegacySearchParams = Record<string, string | string[] | undefined>;

function first(params: LegacySearchParams, key: string): string | null {
  const v = params[key];
  const s = Array.isArray(v) ? v[0] : v;
  return typeof s === 'string' && s.length > 0 ? s : null;
}

/**
 * Returns the new URL for a legacy lesson deep link, or null when the params
 * don't identify a lesson (caller renders the roadmap normally).
 */
export function legacyNavigationToRoute(params: LegacySearchParams): string | null {
  const dayParam = Number(first(params, 'day'));
  const stage = first(params, 'stage');
  if (!dayParam || !Number.isFinite(dayParam) || !stage) return null;

  const mod = getModuleById(`day-${String(dayParam).padStart(2, '0')}`);
  if (!mod) return null;
  const concepts = mod.concepts ?? [];

  // ?concept=I is 1-based; out-of-range falls back to the first concept.
  const conceptIdx = (() => {
    const raw = Number(first(params, 'concept'));
    if (!raw || !Number.isFinite(raw)) return 0;
    return Math.min(Math.max(raw - 1, 0), Math.max(0, concepts.length - 1));
  })();
  const conceptId = concepts[conceptIdx]?.id ?? null;
  const task = first(params, 'task');
  const taskSuffix = task !== null ? `?task=${Math.max(Number(task) || 0, 0)}` : '';

  switch (stage) {
    case 'lesson':
      return `/learn/${mod.id}/theory/${conceptId ?? ''}`;
    case 'practice':
      return `/learn/${mod.id}/practice/${conceptId ?? ''}${taskSuffix}`;
    case 'challenge':
      return `/learn/${mod.id}/challenge`;
    case 'day_complete':
      return `/learn/${mod.id}/complete`;
    case 'concept_complete': {
      // "Just finished concept I" → continue to the NEXT concept's theory,
      // else the challenge, else the completion screen.
      const next = concepts[conceptIdx + 1];
      if (next) return `/learn/${mod.id}/theory/${next.id}`;
      if (mod.challenge) return `/learn/${mod.id}/challenge`;
      return `/learn/${mod.id}/complete`;
    }
    default:
      return null;
  }
}
