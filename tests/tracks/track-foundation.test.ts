/**
 * Phase 1 — multi-track foundation: Prisma pilot is valid, SQL untouched.
 * Pilot solutionSql runs through the REAL SQL engine + validator; Prisma
 * solutionCode passes the code validator; ids/keys/routes stay isolated.
 */
import { describe, it, expect } from 'vitest';
import { ALL_MODULES } from '../../src/content/curriculum-index';
import { PRISMA_MODULES } from '../../src/content/prisma/prisma-curriculum-index';
import { PRISMA_ROADMAP_MILESTONES } from '../../src/content/prisma/prisma-roadmap';
import { ROADMAP_MILESTONES } from '../../src/config/roadmap';
import { SqlExecutor } from '../../src/lib/sql-engine/executor';
import { validateTaskSolution } from '../../src/lib/sql-engine/validator';
import { validatePrismaCode } from '../../src/lib/prisma-engine/prisma-validator';
import { TRACK_META } from '../../src/types/track';
import { getTrackModules, getTrackMilestones } from '../../src/tracks/registry';
import { trackLearnUrl, trackRoadmapUrl } from '../../src/lib/track-routes';
import { getTrackStorageKey, initialStateForTrack } from '../../src/lib/progress/track-storage';

/** Minimal seeded `users` table for the pilot's executable solutionSql. */
// Shared Prisma seed universe: the ONLY tables the SQL lens may reference.
// The SQL engine executes every Prisma task's `solutionSql` against this
// seed universe (fresh DB per task), so `users` is the ONLY table that can
// appear in Phase-6 content.
export const PRISMA_SEED_TABLES = ['users'] as const;

// Shared users rows: id 1-3 only. Every task's solutionSql must be written
// against exactly these rows.
export const PRISMA_SEED_USERS_SQL =
  "CREATE TABLE users (id INTEGER, name TEXT, email TEXT); " +
  "INSERT INTO users (id, name, email) VALUES " +
  "(1, 'Alex', 'alex@prisma.io'), " +
  "(2, 'Mina', 'mina@prisma.io'), " +
  "(3, 'Rafi', 'rafi@prisma.io');";

/** Minimal seeded `users` table for the pilot's executable solutionSql. */
function seedUsers(ex: SqlExecutor) {
  ex.executeQuery(PRISMA_SEED_USERS_SQL);
}

describe('Phase 1 — track foundation', () => {
  it('SQL curriculum is untouched: 57 modules, day-01 first', () => {
    expect(ALL_MODULES.length).toBe(57);
    expect(ALL_MODULES[0].id).toBe('day-01');
    expect(ALL_MODULES.every((m) => m.track === undefined || m.track === 'sql')).toBe(true);
  });

  it('registry routes modules and milestones per track', () => {
    expect(getTrackModules('sql')).toBe(ALL_MODULES);
    expect(getTrackModules('prisma')).toBe(PRISMA_MODULES);
    expect(getTrackMilestones('sql')).toBe(ROADMAP_MILESTONES);
    expect(getTrackMilestones('prisma')).toBe(PRISMA_ROADMAP_MILESTONES);
  });

  it('no module id collides across tracks', () => {
    const ids = new Set<string>();
    for (const m of [...ALL_MODULES, ...PRISMA_MODULES]) {
      expect(ids.has(m.id), `collision: ${m.id}`).toBe(false);
      ids.add(m.id);
    }
  });

  it('prisma-01 shape: 3 concepts, >=2 tasks each, 1 challenge task', () => {
    const mod = PRISMA_MODULES.find((m) => m.id === 'prisma-01');
    expect(mod).toBeDefined();
    expect(mod!.track).toBe('prisma');
    expect(mod!.concepts.length).toBe(3);
    for (const c of mod!.concepts) {
      expect(c.tasks.length).toBeGreaterThanOrEqual(2);
    }
    expect(mod!.challenge?.tasks.length).toBeGreaterThanOrEqual(1);
  });

  it('pilot solutionSql executes for real via the SQL engine + validator', () => {
    const mod = PRISMA_MODULES.find((m) => m.id === 'prisma-01')!;
    const failures: string[] = [];
    const all = [
      ...mod.concepts.flatMap((c) => c.tasks),
      ...(mod.challenge?.tasks ?? []),
    ];
    for (const task of all) {
      const ex = new SqlExecutor();
      seedUsers(ex);
      const result = ex.executeQuery(task.solutionSql);
      const outcome = validateTaskSolution(task.solutionSql, result, task.validation);
      if (!outcome.passed) failures.push(`${task.id} -> ${outcome.feedback ?? result.error}`);
      expect(task.prisma, `${task.id} missing prisma content`).toBeDefined();
    }
    expect(failures).toEqual([]);
  });

  it('pilot solutionCode passes Prisma validator; starter does not', () => {
    const mod = PRISMA_MODULES.find((m) => m.id === 'prisma-01')!;
    const all = [
      ...mod.concepts.flatMap((c) => c.tasks),
      ...(mod.challenge?.tasks ?? []),
    ];
    for (const task of all) {
      const rule = task.prisma!.validation;
      const solRes = validatePrismaCode(task.prisma!.solutionCode, rule);
      expect(solRes.passed, `${task.id} solution failed: ${solRes.feedback}`).toBe(true);
      const initRes = validatePrismaCode(task.prisma!.initialCode, rule);
      expect(initRes.passed, `${task.id} starter passed: ${initRes.feedback}`).toBe(false);
    }
  });

  it('track routes and storage stay namespaced; SQL keys byte-identical', () => {
    expect(trackRoadmapUrl('sql')).toBe('/sql');
    expect(trackRoadmapUrl('prisma', 'prisma-01')).toBe('/prisma?highlight=prisma-01');
    expect(trackLearnUrl('prisma', 'prisma-01', 'theory', 'model-and-scalar-types')).toBe(
      '/prisma/learn/prisma-01/theory/model-and-scalar-types',
    );
    expect(getTrackStorageKey('sql')).toBe(TRACK_META.sql.guestStorageKey);
    expect(getTrackStorageKey('sql')).toBe('sql_mastery_progress_v1');
    expect(getTrackStorageKey('sql', 'user_123')).toBe('sqlens_progress_user_user_123');
    expect(getTrackStorageKey('prisma')).toBe('prismalens_progress_v1');
    expect(getTrackStorageKey('prisma', 'user_123')).toBe('prismalens_progress_user_user_123');
    expect(initialStateForTrack('sql').currentModuleId).toBe('day-01');
    expect(initialStateForTrack('prisma').currentModuleId).toBe('prisma-01');
    expect(initialStateForTrack('prisma').unlockedModuleIds).toEqual(['prisma-01']);
  });
});
