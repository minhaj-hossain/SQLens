/**
 * Phase 4 / Task 4.1 — the track registry is a data-driven dictionary.
 * ─────────────────────────────────────────────────────────────────────────────
 * 4.1.2 (this block): `TRACK_REGISTRY` covers exactly the `TRACK_IDS` tuple,
 * registers the same objects the old ternary helpers returned (SQL identity
 * included: `getTrackModules('sql') === ALL_MODULES`), resolves every module
 * id per track by identity, and `assertTrackRegistry()` proves the invariants
 * that make the dictionary trustworthy — metadata identity, a resolvable
 * `initialModuleId`, and every module id claimed by exactly one track pattern.
 *
 * 4.1.3 (second block): `trackForModuleId` classifies from the registered
 * patterns (historical semantics preserved, quirks included), and a static
 * guard pins the acceptance criterion — no `=== 'prisma'` / `=== 'sql'`
 * branches (and no `startsWith('prisma-')`) may grow back in the registry.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';
import { ALL_MODULES, getModuleById as getSqlModuleById } from '../../src/content/sql/curriculum-index';
import {
  PRISMA_MODULES,
  getPrismaModuleById,
} from '../../src/content/prisma/prisma-curriculum-index';
import { PRISMA_ROADMAP_MILESTONES } from '../../src/content/prisma/prisma-roadmap';
import { ROADMAP_MILESTONES } from '../../src/config/roadmap';
import { TRACK_IDS, TRACK_META } from '../../src/types/track';
import {
  assertNoModuleIdCollision,
  assertTrackRegistry,
  getTrackDefinition,
  getTrackMeta,
  getTrackMilestones,
  getTrackModuleById,
  getTrackModules,
  trackForModuleId,
  TRACK_REGISTRY,
} from '../../src/tracks/registry';

/** Tracks whose registered pattern claims an id (the classifier's raw rule). */
function patternOwners(id: string): string[] {
  return TRACK_IDS.filter((t) => TRACK_REGISTRY[t].moduleIdPattern.test(id));
}

/** Repo file, resolved from this test file so `process.cwd()` cannot matter. */
function repoFile(rel: string): string {
  return fileURLToPath(new URL(`../../${rel}`, import.meta.url));
}

/**
 * The registry's source with comments stripped — the static guard targets real
 * code, so the header may freely quote the old cascade it replaced.
 */
function registrySource(): string {
  return readFileSync(repoFile('src/tracks/registry.ts'), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '');
}

describe('Phase 4.1 — TRACK_REGISTRY dictionary', () => {
  it('covers exactly TRACK_IDS — one entry per id, no extras', () => {
    expect(Object.keys(TRACK_REGISTRY).sort()).toEqual([...TRACK_IDS].sort());
    for (const id of TRACK_IDS) expect(getTrackDefinition(id)).toBe(TRACK_REGISTRY[id]);
  });

  it('every entry registers metadata, modules, id lookup, milestones and a pattern', () => {
    for (const id of TRACK_IDS) {
      const def = TRACK_REGISTRY[id];
      expect(def.meta).toBe(TRACK_META[id]);
      expect(getTrackMeta(id)).toBe(TRACK_META[id]);
      expect(getTrackModules(id)).toBe(def.modules);
      expect(getTrackMilestones(id)).toBe(def.milestones);
      expect(typeof def.getModuleById).toBe('function');
      expect(def.moduleIdPattern).toBeInstanceOf(RegExp);
      expect(def.modules.length).toBeGreaterThan(0);
      expect(def.milestones.length).toBeGreaterThan(0);
    }
  });

  it('keeps the SQL byte-for-byte contract: identity, never a copy', () => {
    expect(getTrackModules('sql')).toBe(ALL_MODULES);
    expect(getTrackMilestones('sql')).toBe(ROADMAP_MILESTONES);
    expect(getTrackModules('prisma')).toBe(PRISMA_MODULES);
    expect(getTrackMilestones('prisma')).toBe(PRISMA_ROADMAP_MILESTONES);
  });

  it('resolves every registered module id by identity — 57 SQL + 14 Prisma', () => {
    expect(getTrackModules('sql')).toHaveLength(57);
    expect(getTrackModules('prisma')).toHaveLength(14);
    for (const mod of getTrackModules('sql')) {
      expect(getTrackModuleById('sql', mod.id), mod.id).toBe(mod);
      expect(getTrackModuleById('sql', mod.id), mod.id).toBe(getSqlModuleById(mod.id));
    }
    for (const mod of getTrackModules('prisma')) {
      expect(getTrackModuleById('prisma', mod.id), mod.id).toBe(mod);
      expect(getTrackModuleById('prisma', mod.id), mod.id).toBe(getPrismaModuleById(mod.id));
    }
  });

  it('returns undefined for ids the track does not own', () => {
    expect(getTrackModuleById('sql', 'prisma-01')).toBeUndefined();
    expect(getTrackModuleById('prisma', 'day-01')).toBeUndefined();
    expect(getTrackModuleById('sql', 'not-a-module')).toBeUndefined();
    expect(getTrackModuleById('prisma', 'not-a-module')).toBeUndefined();
  });

  it('assertTrackRegistry() reports no issues', () => {
    expect(assertTrackRegistry()).toEqual([]);
  });

  it('every module id is claimed by exactly one track pattern', () => {
    for (const id of TRACK_IDS) {
      for (const mod of TRACK_REGISTRY[id].modules) {
        expect(patternOwners(mod.id), mod.id).toEqual([id]);
      }
    }
    expect(patternOwners('day-01')).toEqual(['sql']);
    expect(patternOwners('prisma-14')).toEqual(['prisma']);
    expect(patternOwners('unclaimed-id')).toEqual([]);
  });

  it('module ids still never collide across tracks', () => {
    expect(assertNoModuleIdCollision()).toEqual([]);
  });
});

describe('Phase 4.1 — module-id classification is registry-driven', () => {
  it('classifies historical module ids exactly as before', () => {
    expect(trackForModuleId('day-01')).toBe('sql');
    expect(trackForModuleId('day-57')).toBe('sql');
    expect(trackForModuleId('prisma-01')).toBe('prisma');
    expect(trackForModuleId('prisma-14')).toBe('prisma');
  });

  it('defaults legacy / malformed / unknown ids to sql — quirks included', () => {
    expect(trackForModuleId('')).toBe('sql');
    expect(trackForModuleId('day-')).toBe('sql');
    expect(trackForModuleId('not-a-module')).toBe('sql');
    // `startsWith('prisma-')` parity: a malformed prisma id still classifies
    // as prisma, exactly as the pre-4.1 ternary did.
    expect(trackForModuleId('prisma-xyz')).toBe('prisma');
  });

  it('every registered module id round-trips to its own track (57 + 14)', () => {
    for (const id of TRACK_IDS) {
      for (const mod of TRACK_REGISTRY[id].modules) {
        expect(trackForModuleId(mod.id), mod.id).toBe(id);
      }
    }
  });

  it('ids of a not-yet-registered track stay on the sql default (extension point)', () => {
    // A future track adds a pattern + entry; until then its ids are "unknown"
    // and must keep the historical sql default rather than being misattributed.
    expect(patternOwners('drizzle-01')).toEqual([]);
    expect(trackForModuleId('drizzle-01')).toBe('sql');
  });

  it('src/tracks/registry.ts contains no track-id branches and classifies from patterns', () => {
    // Pins the Task 4.1 acceptance criterion ("eliminate ternary operators"):
    // no `=== 'prisma'` / `=== 'sql'` comparison and no `startsWith('prisma-')`
    // may grow back — every decision comes from `TRACK_REGISTRY`. Comments are
    // stripped first: prose may quote the old cascade, code may not contain it.
    const src = registrySource();
    expect(src).not.toMatch(/===\s*'prisma'/);
    expect(src).not.toMatch(/===\s*'sql'/);
    expect(src).not.toContain("startsWith('prisma-')");
    expect(src).toContain('moduleIdPattern.test(moduleId)');
  });
});

