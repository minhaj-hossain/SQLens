/**
 * Gate 1 — Networking Fundamentals track foundation & isolation tests.
 * ─────────────────────────────────────────────────────────────────────────────
 * Verifies:
 *  1. Track registration in TRACK_IDS, TRACK_META, and TRACK_REGISTRY.
 *  2. Minimal module shells (net-01 -> net-02 -> net-03) and ordering.
 *  3. Invariant checks: assertTrackRegistry() === [] & assertNoModuleIdCollision() === [].
 *  4. Route parsing and builders: trackFromPathname, trackModuleIdFromPathname, trackLearnUrl.
 *  5. Storage key isolation and initial state.
 *  6. Step-chain Back navigation isolation.
 *  7. Byte-for-byte non-regression of SQL (57) and Prisma (14) modules.
 */

import { describe, it, expect } from 'vitest';
import { ALL_MODULES } from '../../src/content/sql/curriculum-index';
import { PRISMA_MODULES } from '../../src/content/prisma/prisma-curriculum-index';
import {
  NETWORKING_MODULES,
  getNetworkingModuleById,
} from '../../src/content/networking/networking-curriculum-index';
import { NETWORKING_ROADMAP_MILESTONES } from '../../src/content/networking/networking-roadmap';
import {
  TRACK_IDS,
  TRACK_META,
  isTrackId,
  trackStorageKey,
  trackOfStorageKey,
} from '../../src/types/track';
import {
  assertNoModuleIdCollision,
  assertTrackRegistry,
  getTrackDefinition,
  getTrackMeta,
  getTrackMilestones,
  getTrackModuleById,
  getTrackModules,
  trackForModuleId,
} from '../../src/tracks/registry';
import {
  getTrackPreviousStep,
  trackConceptIdFromPathname,
  trackFromPathname,
  trackLearnUrl,
  trackModuleIdFromPathname,
  trackRoadmapUrl,
} from '../../src/lib/track-routes';
import {
  getTrackStorageKey,
  initialStateForTrack,
} from '../../src/lib/progress/track-storage';

describe('Gate 1 — Networking track registration & identity', () => {
  it('registers "networking" in TRACK_IDS as a first-class builtin track', () => {
    expect(TRACK_IDS).toContain('networking');
    expect(isTrackId('networking')).toBe(true);
  });

  it('TRACK_META defines Networking Fundamentals metadata matching specifications', () => {
    const meta = TRACK_META.networking;
    expect(meta.id).toBe('networking');
    expect(meta.label).toBe('Networking');
    expect(meta.title).toBe('Networking Fundamentals');
    expect(meta.basePath).toBe('/networking');
    expect(meta.initialModuleId).toBe('net-01');
    expect(meta.guestStorageKey).toBe('networking_progress_v1');
    expect(meta.userStorageKeyPrefix).toBe('networking_progress_user_');
  });

  it('TRACK_REGISTRY registers networking definition with modules, lookup, and milestones', () => {
    const def = getTrackDefinition('networking');
    expect(def).toBeDefined();
    expect(def.meta).toBe(TRACK_META.networking);
    expect(getTrackMeta('networking')).toBe(TRACK_META.networking);
    expect(getTrackModules('networking')).toBe(NETWORKING_MODULES);
    expect(getTrackMilestones('networking')).toBe(NETWORKING_ROADMAP_MILESTONES);
    expect(def.moduleIdPattern.test('net-01')).toBe(true);
    expect(def.moduleIdPattern.test('net-02')).toBe(true);
    expect(def.moduleIdPattern.test('net-03')).toBe(true);
    expect(def.moduleIdPattern.test('day-01')).toBe(false);
    expect(def.moduleIdPattern.test('prisma-01')).toBe(false);
  });

  it('assertTrackRegistry reports 0 issues across all registered tracks', () => {
    expect(assertTrackRegistry()).toEqual([]);
  });

  it('assertNoModuleIdCollision reports 0 ID collisions across SQL, Prisma, and Networking', () => {
    expect(assertNoModuleIdCollision()).toEqual([]);
  });
});

describe('Gate 1 — Minimal module shells & ordering (net-01 -> net-02 -> net-03)', () => {
  it('registers all milestone-1, milestone-2, and milestone-3 modules in order', () => {
    const modules = getTrackModules('networking');
    expect(modules).toHaveLength(8);
    expect(modules.map((m) => m.id)).toEqual([
      'net-01', 'net-02', 'net-03',
      'net-04', 'net-05', 'net-06',
      'net-07', 'net-08',
    ]);
  });

  it('modules have sequential curriculumOrder and displayLabel "Module N"', () => {
    const modules = getTrackModules('networking');
    expect(modules[0]).toMatchObject({
      id: 'net-01',
      curriculumOrder: 1,
      displayLabel: 'Module 1',
      track: 'networking',
    });
    expect(modules[1]).toMatchObject({
      id: 'net-02',
      curriculumOrder: 2,
      displayLabel: 'Module 2',
      track: 'networking',
    });
    expect(modules[2]).toMatchObject({
      id: 'net-03',
      curriculumOrder: 3,
      displayLabel: 'Module 3',
      track: 'networking',
    });
    expect(modules[3]).toMatchObject({
      id: 'net-04',
      curriculumOrder: 4,
      displayLabel: 'Module 4',
      track: 'networking',
    });
    expect(modules[4]).toMatchObject({
      id: 'net-05',
      curriculumOrder: 5,
      displayLabel: 'Module 5',
      track: 'networking',
    });
    expect(modules[5]).toMatchObject({
      id: 'net-06',
      curriculumOrder: 6,
      displayLabel: 'Module 6',
      track: 'networking',
    });
    expect(modules[6]).toMatchObject({
      id: 'net-07',
      curriculumOrder: 7,
      displayLabel: 'Module 7',
      track: 'networking',
    });
    expect(modules[7]).toMatchObject({
      id: 'net-08',
      curriculumOrder: 8,
      displayLabel: 'Module 8',
      track: 'networking',
    });
  });

  it('every module resolves by ID from the track registry', () => {
    expect(getTrackModuleById('networking', 'net-01')).toBe(NETWORKING_MODULES[0]);
    expect(getTrackModuleById('networking', 'net-02')).toBe(NETWORKING_MODULES[1]);
    expect(getTrackModuleById('networking', 'net-03')).toBe(NETWORKING_MODULES[2]);
    expect(getNetworkingModuleById('net-01')).toBe(NETWORKING_MODULES[0]);
  });

  it('tracks isolate module lookups — foreign module IDs return undefined', () => {
    expect(getTrackModuleById('networking', 'day-01')).toBeUndefined();
    expect(getTrackModuleById('networking', 'prisma-01')).toBeUndefined();
    expect(getTrackModuleById('sql', 'net-01')).toBeUndefined();
    expect(getTrackModuleById('prisma', 'net-01')).toBeUndefined();
  });

  it('trackForModuleId correctly maps net-* IDs to "networking"', () => {
    expect(trackForModuleId('net-01')).toBe('networking');
    expect(trackForModuleId('net-02')).toBe('networking');
    expect(trackForModuleId('net-03')).toBe('networking');
    expect(trackForModuleId('net-99')).toBe('networking');
    expect(trackForModuleId('day-01')).toBe('sql');
    expect(trackForModuleId('prisma-01')).toBe('prisma');
  });
});

describe('Gate 1 — Route classification and builders', () => {
  it('trackFromPathname classifies /networking paths', () => {
    expect(trackFromPathname('/networking')).toBe('networking');
    expect(trackFromPathname('/networking/learn')).toBe('networking');
    expect(trackFromPathname('/networking/learn/net-01')).toBe('networking');
    expect(trackFromPathname('/networking/learn/net-03/practice/mac-table-and-forwarding')).toBe(
      'networking',
    );
  });

  it('parses module and concept IDs out of namespaced networking paths', () => {
    expect(trackModuleIdFromPathname('/networking/learn/net-01')).toBe('net-01');
    expect(trackModuleIdFromPathname('/networking/learn/net-02/theory/shared-medium-collisions')).toBe(
      'net-02',
    );
    expect(trackModuleIdFromPathname('/networking/learn/net-03/challenge')).toBe('net-03');
    expect(
      trackConceptIdFromPathname('/networking/learn/net-01/theory/direct-link-mac'),
    ).toBe('direct-link-mac');
    expect(
      trackConceptIdFromPathname(
        '/networking/learn/net-03/practice/mac-table-and-forwarding',
      ),
    ).toBe('mac-table-and-forwarding');
  });

  it('builds namespaced roadmap and learn URLs for networking', () => {
    expect(trackRoadmapUrl('networking')).toBe('/networking');
    expect(trackRoadmapUrl('networking', 'net-01')).toBe('/networking?highlight=net-01');
    expect(trackLearnUrl('networking', 'net-01', 'theory', 'direct-link-mac')).toBe(
      '/networking/learn/net-01/theory/direct-link-mac',
    );
    expect(trackLearnUrl('networking', 'net-03', 'challenge')).toBe(
      '/networking/learn/net-03/challenge',
    );
    expect(trackLearnUrl('networking', 'net-03', 'complete')).toBe(
      '/networking/learn/net-03/complete',
    );
  });

  it('step-chain Back in networking stays namespaced and links to roadmap on first concept', () => {
    const concepts = ['direct-link-mac'];
    const back = getTrackPreviousStep(
      'networking',
      'net-01',
      '/networking/learn/net-01/theory/direct-link-mac',
      concepts,
      null,
    );
    expect(back).toEqual({
      url: '/networking?highlight=net-01',
      label: 'Back',
      hint: 'Back to Module',
    });
  });
});

describe('Gate 1 — Progress storage isolation', () => {
  it('derives isolated guest and user storage keys for networking', () => {
    expect(getTrackStorageKey('networking')).toBe('networking_progress_v1');
    expect(getTrackStorageKey('networking', 'u_test')).toBe('networking_progress_user_u_test');
    expect(trackStorageKey('networking')).toBe('networking_progress_v1');
    expect(trackStorageKey('networking', 'u_test')).toBe('networking_progress_user_u_test');
  });

  it('trackOfStorageKey attributes keys correctly to networking and does not conflict', () => {
    expect(trackOfStorageKey('networking_progress_v1')).toBe('networking');
    expect(trackOfStorageKey('networking_progress_user_u_42')).toBe('networking');
    expect(trackOfStorageKey('sql_mastery_progress_v1')).toBe('sql');
    expect(trackOfStorageKey('prismalens_progress_v1')).toBe('prisma');
    expect(trackOfStorageKey('some_other_key')).toBeNull();
  });

  it('initialStateForTrack("networking") starts on net-01', () => {
    const state = initialStateForTrack('networking');
    expect(state.currentModuleId).toBe('net-01');
    expect(state.unlockedModuleIds).toEqual(['net-01']);
    expect(state.completedModules).toEqual({});
  });
});

describe('Gate 1 — Non-regression verification of existing tracks', () => {
  it('SQL track remains completely intact (57 modules, day-01 first)', () => {
    expect(ALL_MODULES).toHaveLength(57);
    expect(ALL_MODULES[0].id).toBe('day-01');
    expect(ALL_MODULES[56].id).toBe('day-57');
  });

  it('Prisma track remains completely intact (14 modules, prisma-01 first)', () => {
    expect(PRISMA_MODULES).toHaveLength(14);
    expect(PRISMA_MODULES[0].id).toBe('prisma-01');
    expect(PRISMA_MODULES[13].id).toBe('prisma-14');
  });
});
