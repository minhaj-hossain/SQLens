/**
 * Track registry — Phase 1 (multi-track foundation).
 * ─────────────────────────────────────────────────────────────────────────────
 * ADDITIVE ONLY. Nothing here modifies SQL behavior.
 *
 * Why a separate registry instead of editing existing files:
 *  - `src/content/curriculum-index.ts` (ALL_MODULES) stays SQL-only, so all
 *    57-day logic, audits, sitemap, and admin keep working byte-for-byte.
 *  - `src/lib/learn-routes.ts` and `src/lib/progress/storage.ts` stay frozen;
 *    track-aware variants live in `src/lib/track-routes.ts` and
 *    `src/lib/progress/track-storage.ts`.
 *  - This registry is the ONLY place that knows both tracks. UI pages
 *    (Phase 2) ask the registry "which modules / milestones / basePath for
 *    this track?" instead of importing SQL constants directly.
 */

import { ALL_MODULES, getModuleById as getSqlModuleById } from '../content/curriculum-index';
import { ROADMAP_MILESTONES } from '../config/roadmap';
import {
  PRISMA_MODULES,
  getPrismaModuleById,
} from '../content/prisma/prisma-curriculum-index';
import { PRISMA_ROADMAP_MILESTONES } from '../content/prisma/prisma-roadmap';
import { TRACK_META, type TrackId, type TrackMeta } from '../types/track';
import type { MilestoneData, ModuleData } from '../types/curriculum';

export function getTrackMeta(track: TrackId): TrackMeta {
  return TRACK_META[track];
}

/** Curriculum modules for a track. SQL returns the frozen ALL_MODULES array. */
export function getTrackModules(track: TrackId): ModuleData[] {
  return track === 'prisma' ? PRISMA_MODULES : ALL_MODULES;
}

export function getTrackModuleById(track: TrackId, id: string): ModuleData | undefined {
  return track === 'prisma' ? getPrismaModuleById(id) : getSqlModuleById(id);
}

export function getTrackMilestones(track: TrackId): MilestoneData[] {
  return track === 'prisma' ? PRISMA_ROADMAP_MILESTONES : ROADMAP_MILESTONES;
}

/** Track that owns a module id. `prisma-NN` → prisma, everything else → sql. */
export function trackForModuleId(moduleId: string): TrackId {
  return moduleId.startsWith('prisma-') ? 'prisma' : 'sql';
}

/**
 * Guard: every module id must be globally unique across tracks.
 * SQL uses `day-NN`, Prisma uses `prisma-NN` — this asserts no overlap.
 */
export function assertNoModuleIdCollision(): string[] {
  const seen = new Map<string, TrackId>();
  const collisions: string[] = [];
  const register = (m: ModuleData, track: TrackId) => {
    const owner = seen.get(m.id);
    if (owner && owner !== track) collisions.push(m.id);
    else seen.set(m.id, track);
  };
  for (const m of ALL_MODULES) register(m, 'sql');
  for (const m of PRISMA_MODULES) register(m, 'prisma');
  return collisions;
}
