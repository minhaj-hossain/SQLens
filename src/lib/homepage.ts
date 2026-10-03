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
 */

import type { QueryExecutionResult } from '../types/database';
import type { runPrismaPlaygroundCode } from './prisma-playground';

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



