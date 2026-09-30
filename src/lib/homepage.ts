/**
 * Homepage derivations — Phase 3 (Task 3.1).
 * ─────────────────────────────────────────────────────────────────────────────
 * Everything the `/` landing page computes, kept OUT of the client island so it
 * is testable without a DOM:
 *
 *  - `buildPrismaSampleRun` / `buildSqlSampleRun` — the hero lens's two tabs.
 *    Both run their sample on the REAL engine: the Prisma tab goes through the
 *    same translator + runner the curriculum grades with, so the statements,
 *    row counts and timings in the lens are the engine's own — never a mock.
 *  - `buildContinuityEntry` — the returning-learner card's line per track: the
 *    TRUE position (`deriveLastPosition`, not the stale stored hint) plus an
 *    honest completion percentage (`getModuleProgressCounts` counts finished
 *    tasks, so a half-finished practice day reads "half", not "0 of 1 days").
 */

import type { ModuleData } from '../types/curriculum';
import type { QueryExecutionResult } from '../types/database';
import type { UserLearningState } from '../types/progress';
import type { TrackId } from '../types/track';
import type { runPrismaPlaygroundCode } from './prisma-playground';
import { getModuleDisplayLabel } from './curriculum/module-order';
import {
  deriveLastPosition,
  getModuleProgressCounts,
  isModuleFullyComplete,
} from './progress/unlock-calculator';
import { getTrackModuleById, getTrackModules } from '../tracks/registry';
import { trackLearnUrl, trackRoadmapUrl } from './track-routes';

/* ── Hero lens ───────────────────────────────────────────────────────────── */

/** The Prisma tab's sample: one call, two statements (parent read + relation). */
export const HERO_PRISMA_SAMPLE = `const user = await prisma.user.findUnique({
  where: { id: 1 },
  include: { posts: true },
});`;

/** The SQL tab's sample: the same rows, hand-written on the same seed. */
export const HERO_SQL_SAMPLE = `SELECT u.name, p.title
FROM users AS u
JOIN posts AS p ON p.authorId = u.id
ORDER BY u.name, p.id;`;

/** One executed statement, shaped for the lens card. */
export interface HeroLensStep {
  /** Statement label from the translator (`read`, `relation: posts`, …). */
  label: string;
  /** The exact SQL that ran. */
  sql: string;
  role: 'main' | 'relation';
  /** `null` when the statement failed (no honest row count exists). */
  rows: number | null;
  /** `null` when the engine reported no finite timing. */
  ms: number | null;
  error: string | null;
}

export interface HeroLensRun {
  steps: HeroLensStep[];
  /** The call's own result (last MAIN statement) — what the preview grid shows. */
  main: QueryExecutionResult | null;
  /** Honest reason when the sample held no translatable call (never expected). */
  note: string | null;
}

/**
 * The engine half the sample runners need. A real `SqlExecutor` satisfies
 * `execute` structurally; `runPrismaPlaygroundCode` is the playground's own
 * entry point (translator + runner, no verdict, no static rules).
 */
export interface HeroLensEngine {
  execute: (sql: string) => QueryExecutionResult;
  runPrismaPlaygroundCode: typeof runPrismaPlaygroundCode;
}

function toLensStep(step: {
  label: string;
  sql: string;
  role?: 'main' | 'relation';
  result: QueryExecutionResult;
}): HeroLensStep {
  return {
    label: step.label,
    sql: step.sql,
    role: step.role ?? 'main',
    rows: step.result.success ? step.result.rowCount : null,
    ms: Number.isFinite(step.result.executionTimeMs) ? step.result.executionTimeMs : null,
    error: step.result.success ? null : step.result.error ?? 'Statement failed.',
  };
}

/** Translate + execute `HERO_PRISMA_SAMPLE` on `engine` (playground call path). */
export function buildPrismaSampleRun(engine: HeroLensEngine): HeroLensRun {
  const out = engine.runPrismaPlaygroundCode(HERO_PRISMA_SAMPLE, {
    executeQuery: (stmt: string) => engine.execute(stmt),
  });
  if (!out.ok) {
    return { steps: [], main: null, note: out.reason ?? 'No translatable Prisma call found.' };
  }
  return {
    steps: out.steps.map((s) => toLensStep(s)),
    main: out.mainResult ?? null,
    note: null,
  };
}

/** Execute `HERO_SQL_SAMPLE` on `engine` — one statement, one result. */
export function buildSqlSampleRun(engine: HeroLensEngine): HeroLensRun {
  const result = engine.execute(HERO_SQL_SAMPLE);
  return {
    steps: [toLensStep({ label: 'read', sql: HERO_SQL_SAMPLE, role: 'main', result })],
    main: result.success ? result : null,
    note: null,
  };
}

/* ── Returning-learner continuity ────────────────────────────────────────── */

/**
 * Percent of a track's learning units completed (0–100). Units are finished
 * tasks (a theory-only concept counts as one) — the same granularity the module
 * progress bars use. A module marked fully complete counts as all of its units
 * even when its stored record only carries `completedAt`.
 */
export function trackProgressPercent(modules: ModuleData[], state: UserLearningState): number {
  let done = 0;
  let total = 0;
  for (const mod of modules) {
    const counts = getModuleProgressCounts(mod, state);
    total += counts.total;
    done += isModuleFullyComplete(mod, state) ? counts.total : counts.done;
  }
  return total === 0 ? 0 : Math.round((done / total) * 100);
}

/** True when the learner has left ANY mark on this track's stored state. */
export function trackHasProgress(state: UserLearningState): boolean {
  if (Object.keys(state.completedModules ?? {}).length > 0) return true;
  if (Object.keys(state.completedConcepts ?? {}).length > 0) return true;
  if (Object.keys(state.completedTasks ?? {}).length > 0) return true;
  return Object.values(state.taskAttempts ?? {}).some((attempt) => attempt?.completed === true);
}

export interface ContinuityEntry {
  track: TrackId;
  moduleId: string;
  /** Cosmetic display label of the resume module, e.g. "Day 14". */
  moduleLabel: string;
  moduleTitle: string;
  conceptId: string | null;
  /** 0–100; 0 is possible (an attempt exists but no unit is finished yet). */
  percent: number;
  /** Theory page of the first incomplete concept, else that module's roadmap. */
  url: string;
}

/**
 * The one truthful line this track contributes to the homepage, or `null` when
 * the learner has never touched it (first-time visitors see no card at all).
 */
export function buildContinuityEntry(
  track: TrackId,
  state: UserLearningState,
): ContinuityEntry | null {
  if (!trackHasProgress(state)) return null;
  const modules = getTrackModules(track);
  if (modules.length === 0) return null;
  const position = deriveLastPosition(modules, state);
  const mod =
    getTrackModuleById(track, position.moduleId) ??
    modules.find((m) => m.id === position.moduleId);
  if (!mod) return null;
  return {
    track,
    moduleId: mod.id,
    moduleLabel: getModuleDisplayLabel(mod),
    moduleTitle: mod.title,
    conceptId: position.conceptId,
    percent: trackProgressPercent(modules, state),
    url: position.conceptId
      ? trackLearnUrl(track, mod.id, 'theory', position.conceptId)
      : trackRoadmapUrl(track, mod.id),
  };
}

