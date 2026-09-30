import { describe, expect, it } from 'vitest';
import { initialStateForTrack } from '../../src/lib/progress/storage';
import {
  buildContinuityEntry,
  trackHasProgress,
  trackProgressPercent,
} from '../../src/lib/homepage';
import { getModuleProgressCounts } from '../../src/lib/progress/unlock-calculator';
import { getTrackModules } from '../../src/tracks/registry';
import type { CompletedModuleRecord, UserLearningState } from '../../src/types/progress';

/**
 * Phase 3 (Task 3.1) — the homepage's returning-learner card must tell the
 * truth from the learner's OWN stored state:
 *  - an untouched track contributes nothing (first-time visitors see no card);
 *  - the resume point is the first INCOMPLETE module/concept (P9.7), never the
 *    stale `currentModuleId` hint;
 *  - the percentage counts finished task units across the whole track;
 *  - the URL is that concept's theory page under the track's namespace.
 */

/** A stored record as the provider writes a finished module (concepts + tasks). */
function completeModules(base: UserLearningState, ids: string[]): UserLearningState {
  const completedModules: Record<string, CompletedModuleRecord> = { ...base.completedModules };
  const track = ids[0]?.startsWith('prisma') ? 'prisma' : 'sql';
  for (const id of ids) {
    const mod = getTrackModules(track).find((m) => m.id === id);
    if (!mod) throw new Error(`unknown module id: ${id}`);
    completedModules[id] = {
      moduleId: id,
      completedAt: '2026-01-01T12:00:00.000Z',
      challengeCompleted: true,
      completedConcepts: mod.concepts.map((c) => c.id),
      completedTasks: [
        ...mod.concepts.flatMap((c) => c.tasks.map((t) => t.id)),
        ...(mod.challenge?.tasks.map((t) => t.id) ?? []),
      ],
    };
  }
  return { ...base, completedModules };
}

function units(modules: ReturnType<typeof getTrackModules>, state: UserLearningState): number {
  return modules.reduce((sum, mod) => sum + getModuleProgressCounts(mod, state).total, 0);
}

describe('homepage continuity card (Task 3.1)', () => {
  it('an untouched track contributes nothing', () => {
    const sql = initialStateForTrack('sql');
    const prisma = initialStateForTrack('prisma');
    expect(trackHasProgress(sql)).toBe(false);
    expect(trackHasProgress(prisma)).toBe(false);
    expect(buildContinuityEntry('sql', sql)).toBeNull();
    expect(buildContinuityEntry('prisma', prisma)).toBeNull();
  });

  it('resumes SQL at the first incomplete module, not the stored hint', () => {
    const modules = getTrackModules('sql');
    const state = completeModules(initialStateForTrack('sql'), ['day-01']);
    // The stored hint still says day-01 — the entry must not follow it.
    expect(state.currentModuleId).toBe('day-01');

    const entry = buildContinuityEntry('sql', state);
    expect(entry).not.toBeNull();
    expect(entry?.moduleId).toBe('day-02');
    expect(entry?.moduleLabel).toBe('Day 2');
    expect(entry?.moduleTitle).toBe(modules[1].title);
    expect(entry?.conceptId).toBe(modules[1].concepts[0].id);
    expect(entry?.url).toBe(`/sql/learn/day-02/theory/${modules[1].concepts[0].id}`);
    expect(entry?.percent).toBeGreaterThan(0);
  });

  it('percent counts finished task units across the whole track', () => {
    const modules = getTrackModules('sql');
    const state = completeModules(initialStateForTrack('sql'), ['day-01']);
    const dayOne = getModuleProgressCounts(modules[0], state).total;
    expect(trackProgressPercent(modules, state)).toBe(
      Math.round((dayOne / units(modules, state)) * 100),
    );
  });

  it('a partially finished day counts as progress and keeps the learner on it', () => {
    const modules = getTrackModules('sql');
    const mod = modules[0];
    const concept = mod.concepts[0];
    expect(concept.tasks.length).toBeGreaterThan(0);
    const taskAttempts: UserLearningState['taskAttempts'] = {};
    for (const task of concept.tasks) {
      taskAttempts[task.id] = {
        taskId: task.id,
        moduleId: mod.id,
        hintsUsed: 0,
        viewedSolution: false,
        completed: true,
      };
    }
    const state: UserLearningState = { ...initialStateForTrack('sql'), taskAttempts };
    expect(trackHasProgress(state)).toBe(true);

    const entry = buildContinuityEntry('sql', state);
    expect(entry?.moduleId).toBe(mod.id);
    expect(entry?.conceptId).toBe(mod.concepts[1].id);
    expect(entry?.url).toBe(`/sql/learn/${mod.id}/theory/${mod.concepts[1].id}`);
    expect(entry?.percent).toBeGreaterThan(0);
  });

  it('Prisma resumes on its own namespaced URL and ignores the SQL track', () => {
    const prismaModules = getTrackModules('prisma');
    const prismaState = completeModules(initialStateForTrack('prisma'), ['prisma-01']);
    const entry = buildContinuityEntry('prisma', prismaState);
    expect(entry?.track).toBe('prisma');
    expect(entry?.moduleId).toBe('prisma-02');
    expect(entry?.url).toBe(
      `/prisma/learn/prisma-02/theory/${prismaModules[1].concepts[0].id}`,
    );
    // The same learner never touched SQL — that track stays card-free.
    expect(buildContinuityEntry('sql', initialStateForTrack('sql'))).toBeNull();
  });
});
