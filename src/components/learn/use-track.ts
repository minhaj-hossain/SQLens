'use client';
/**
 * useTrack — the active track, derived from the URL (Phase 2).
 * ─────────────────────────────────────────────────────────────────────────────
 * The track is ALREADY in the pathname (`/sql/...`, `/prisma/...`), so no new
 * React context, provider or server layout is needed: `trackFromPathname`
 * reads it back. When the pathname carries no track prefix (legacy `/learn/…`
 * links, the `/` selector, or any pre-migration surface) the hook returns
 * `'sql'` — which is exactly today's behaviour, so SQL is unaffected.
 *
 * `useTrackModuleId` / `useTrackConceptId` are the track-aware replacements for
 * `dayIdFromPathname` / `conceptIdFromPathname` (src/lib/learn-routes.ts):
 * they parse both `day-NN` and `prisma-NN` ids.
 */
import { usePathname } from 'next/navigation';
import type { MilestoneData, ModuleData } from '@/types/curriculum';
import type { TrackId, TrackMeta } from '@/types/track';
import {
  trackConceptIdFromPathname,
  trackFromPathname,
  trackModuleIdFromPathname,
} from '@/lib/track-routes';
import {
  getTrackMeta,
  getTrackMilestones,
  getTrackModuleById,
  getTrackModules,
} from '@/tracks/registry';

/** Active track for the current URL. Always `'sql'` outside `/prisma/…`. */
export function useTrack(): TrackId {
  return trackFromPathname(usePathname()) ?? 'sql';
}

/** Module id (`day-NN` / `prisma-NN`) from the current URL, else null. */
export function useTrackModuleId(): string | null {
  return trackModuleIdFromPathname(usePathname());
}

/** Concept slug from the current URL, else null. */
export function useTrackConceptId(): string | null {
  return trackConceptIdFromPathname(usePathname());
}

export interface TrackCurriculum {
  track: TrackId;
  meta: TrackMeta;
  modules: ModuleData[];
  milestones: MilestoneData[];
  getModuleById: (id: string) => ModuleData | undefined;
}

/**
 * Everything a track-scoped view needs: the curriculum array, its milestones
 * and a matching id lookup. SQL callers receive the frozen `ALL_MODULES`
 * array by reference (see `getTrackModules`), so behaviour is byte-identical.
 */
export function useTrackCurriculum(): TrackCurriculum {
  const track = useTrack();
  return {
    track,
    meta: getTrackMeta(track),
    modules: getTrackModules(track),
    milestones: getTrackMilestones(track),
    getModuleById: (id: string) => getTrackModuleById(track, id),
  };
}
