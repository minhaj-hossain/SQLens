/**
 * Track registry — Phase 1 (multi-track foundation), generalized in Phase 4.1.
 * ─────────────────────────────────────────────────────────────────────────────
 * The ONE place that knows every track's shape. Phase 4.1 replaced the
 * `track === 'prisma' ? … : …` cascade with a data-driven dictionary: each
 * track registers its metadata, modules, id lookup, milestones and the
 * module-id pattern it owns. A new track is one entry in `TRACK_REGISTRY`
 * plus one id in `TRACK_IDS` — never a new branch in every helper.
 *
 * Why a separate registry instead of editing existing files:
 *  - `src/content/curriculum-index.ts` (ALL_MODULES) stays SQL-only, so all
 *    57-day logic, audits, sitemap, and admin keep working byte-for-byte.
 *  - `src/lib/learn-routes.ts` and `src/lib/progress/storage.ts` stay frozen;
 *    track-aware variants live in `src/lib/track-routes.ts` and
 *    `src/lib/progress/track-storage.ts`.
 *
 * Reference guarantees existing consumers (and tests) rely on:
 *  - `getTrackModules('sql') === ALL_MODULES` and
 *    `getTrackMilestones('sql') === ROADMAP_MILESTONES` — the same object,
 *    never a copy — so identity checks and frozen-array behaviour are intact.
 *  - `getTrackMeta(track) === TRACK_META[track]`.
 *  - `trackForModuleId` keeps its historical semantics: `prisma-…` → prisma,
 *    everything else (legacy ids, junk) → sql.
 */

import { ALL_MODULES, getModuleById as getSqlModuleById } from '../content/curriculum-index';
import { ROADMAP_MILESTONES } from '../config/roadmap';
import {
  PRISMA_MODULES,
  getPrismaModuleById,
} from '../content/prisma/prisma-curriculum-index';
import { PRISMA_ROADMAP_MILESTONES } from '../content/prisma/prisma-roadmap';
import {
  TRACK_IDS,
  TRACK_META,
  type BuiltinTrackId,
  type TrackId,
  type TrackMeta,
} from '../types/track';
import type { MilestoneData, ModuleData } from '../types/curriculum';

/** Everything the rest of the app needs to know about one track. */
export interface TrackDefinition {
  /** The very object `TRACK_META[id]` holds (reference, never a copy). */
  meta: TrackMeta;
  /** The track's curriculum modules (SQL: the frozen `ALL_MODULES` array). */
  modules: ModuleData[];
  /** Id lookup inside `modules`. */
  getModuleById: (id: string) => ModuleData | undefined;
  /** The track's roadmap milestones. */
  milestones: MilestoneData[];
  /**
   * Shape of the module ids this track owns — consumed by
   * `assertTrackRegistry` and `trackForModuleId`. Kept prefix-shaped
   * (`/^prisma-/`) so the historical `startsWith('prisma-')` classification
   * is preserved exactly, malformed ids included.
   */
  moduleIdPattern: RegExp;
}

/**
 * The dictionary. `Record<BuiltinTrackId, …>` is deliberate: adding an id to
 * `TRACK_IDS` without a definition here is a compile error, so the old
 * ternary cascade can never come back.
 */
export const TRACK_REGISTRY: Record<BuiltinTrackId, TrackDefinition> = {
  sql: {
    meta: TRACK_META.sql,
    modules: ALL_MODULES,
    getModuleById: getSqlModuleById,
    milestones: ROADMAP_MILESTONES,
    moduleIdPattern: /^day-/,
  },
  prisma: {
    meta: TRACK_META.prisma,
    modules: PRISMA_MODULES,
    getModuleById: getPrismaModuleById,
    milestones: PRISMA_ROADMAP_MILESTONES,
    moduleIdPattern: /^prisma-/,
  },
};

/** The registered definition for a track. */
export function getTrackDefinition(track: TrackId): TrackDefinition {
  return TRACK_REGISTRY[track];
}

export function getTrackMeta(track: TrackId): TrackMeta {
  return TRACK_REGISTRY[track].meta;
}

/** Curriculum modules for a track. SQL returns the frozen ALL_MODULES array. */
export function getTrackModules(track: TrackId): ModuleData[] {
  return TRACK_REGISTRY[track].modules;
}

export function getTrackModuleById(track: TrackId, id: string): ModuleData | undefined {
  return TRACK_REGISTRY[track].getModuleById(id);
}

export function getTrackMilestones(track: TrackId): MilestoneData[] {
  return TRACK_REGISTRY[track].milestones;
}

/**
 * Invariants of the registry itself — mirrors `assertNoModuleIdCollision`'s
 * shape (returns issue strings; tests assert `[]`). Catches a hand-edited
 * entry that drifts from `TRACK_META` or `TRACK_IDS`, a track with no
 * content, an `initialModuleId` that resolves to nothing, and a module id
 * that no track (or more than one track) claims.
 */
export function assertTrackRegistry(): string[] {
  const issues: string[] = [];
  for (const id of TRACK_IDS) {
    const def = TRACK_REGISTRY[id];
    if (!def) {
      issues.push(`${id}: no TRACK_REGISTRY entry`);
      continue;
    }
    if (def.meta !== TRACK_META[id]) issues.push(`${id}: meta is not the TRACK_META object`);
    if (def.meta.id !== id) issues.push(`${id}: meta.id is '${def.meta.id}'`);
    if (def.meta.basePath !== `/${id}`) issues.push(`${id}: meta.basePath is '${def.meta.basePath}'`);
    if (def.modules.length === 0) issues.push(`${id}: registers no modules`);
    if (def.milestones.length === 0) issues.push(`${id}: registers no milestones`);
    if (!def.modules.some((m) => m.id === def.meta.initialModuleId)) {
      issues.push(`${id}: initialModuleId '${def.meta.initialModuleId}' is not a registered module`);
    }
    for (const m of def.modules) {
      if (!def.moduleIdPattern.test(m.id)) {
        issues.push(`${id}: module id '${m.id}' does not match its own pattern`);
      }
      const owners = TRACK_IDS.filter((t) => TRACK_REGISTRY[t].moduleIdPattern.test(m.id));
      if (owners.length !== 1) issues.push(`${m.id}: claimed by ${owners.length} tracks`);
    }
  }
  return issues;
}

/**
 * Track that owns a module id — the first registered `moduleIdPattern` that
 * claims it, defaulting to `'sql'`.
 *
 * Historical semantics preserved exactly (asserted in
 * `tests/tracks/phase10-registry.test.ts`): `prisma-NN` → prisma, everything
 * else (legacy ids, junk) → sql. Classifying from the registry means a future
 * track only declares its pattern in `TRACK_REGISTRY` — no third branch here.
 */
export function trackForModuleId(moduleId: string): TrackId {
  for (const id of TRACK_IDS) {
    if (TRACK_REGISTRY[id].moduleIdPattern.test(moduleId)) return id;
  }
  return 'sql';
}

/**
 * Guard: every module id must be globally unique across tracks.
 * SQL uses `day-NN`, Prisma uses `prisma-NN` — this asserts no overlap,
 * reading whichever tracks the registry declares.
 */
export function assertNoModuleIdCollision(): string[] {
  const seen = new Map<string, TrackId>();
  const collisions: string[] = [];
  const register = (m: ModuleData, track: TrackId) => {
    const owner = seen.get(m.id);
    if (owner && owner !== track) collisions.push(m.id);
    else seen.set(m.id, track);
  };
  for (const id of TRACK_IDS) {
    for (const m of TRACK_REGISTRY[id].modules) register(m, id);
  }
  return collisions;
}
