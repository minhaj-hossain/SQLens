/**
 * Prisma playground — Phase 11.
 * ─────────────────────────────────────────────────────────────────────────────
 * The `/playground` Prisma mode's engine half: seed the two-table universe, run
 * the learner's TypeScript through the SAME translator + runner the curriculum
 * uses, and report the statements, the call's own result and the live tables.
 *
 * Deliberately the same code path as grading (`generatePrismaSql` → `runPrismaPlan`
 * → `renderGeneratedSql`), minus any verdict: a playground run is for looking at
 * the SQL, never for scoring. No file here grades, and no rule from
 * `prisma-validator.ts` is consulted.
 */

import type { QueryExecutionResult } from '../types/database';
import { PRISMA_TASK_SETUP_SQL } from '../content/prisma/phase6-tasks';
import { PRISMA_SEED_SCHEMA, prismaSeedContext } from './prisma-engine/prisma-submit-pipeline';
import { generatePrismaSql } from './prisma-engine/prisma-sql-generator';
import {
  runPrismaPlan,
  type PrismaExecutionStep,
  type PrismaStatementRunner,
} from './prisma-engine/prisma-proxy-executor';
import { parsePrismaSchema } from './prisma-engine/prisma-schema-parser';

/** The two-table seed the Prisma playground starts from. */
export function prismaPlaygroundSeedSql(): string {
  return PRISMA_TASK_SETUP_SQL;
}

/** The schema the playground translates against (the seed universe's). */
export function prismaPlaygroundSchemaSource(): string {
  return PRISMA_SEED_SCHEMA;
}

/** A first snippet that works on the seed rows, so the mode is never a blank page. */
export const PRISMA_PLAYGROUND_EXAMPLE = `// Prisma mode runs real Prisma client code against the seed database.
// The SQL Lens below shows the SQL every call generates.
const withPosts = await prisma.user.findUnique({
  where: { id: 1 },
  include: { posts: true },
});
`;

export interface PrismaPlaygroundRun {
  /** `false` when the code holds no translatable client call (honest reason). */
  ok: boolean;
  reason?: string;
  steps: PrismaExecutionStep[];
  /** The call's own result (last MAIN step) — what the grid shows. */
  mainResult?: QueryExecutionResult;
  /** First engine error, if any statement failed. */
  error?: string;
  /** `true` when at least one step was a relation load / nested write. */
  touchedRelation: boolean;
}

/**
 * Run playground TypeScript on `runner`. The playground owns seeding/resetting
 * (see `prismaPlaygroundSeedSql`), so this never reseeds behind the learner's
 * back: what they see in the tables is what their own calls did.
 */
export function runPrismaPlaygroundCode(
  code: string,
  runner: PrismaStatementRunner,
  schemaSource: string = PRISMA_SEED_SCHEMA,
): PrismaPlaygroundRun {
  const schema = parsePrismaSchema(schemaSource);
  const seed = prismaSeedContext();
  const gen = generatePrismaSql(code, { schema, seed });
  if (!gen.ok) {
    return { ok: false, reason: gen.reason, steps: [], touchedRelation: false };
  }
  const run = runPrismaPlan(gen, runner, { schema, seed });
  const mainStep =
    [...run.steps].reverse().find((s) => (s.role ?? 'main') !== 'relation') ??
    run.steps[run.steps.length - 1];
  return {
    ok: true,
    steps: run.steps,
    mainResult: mainStep?.result,
    error: run.error,
    touchedRelation: run.steps.some((s) => (s.role ?? 'main') === 'relation'),
  };
}

/** Row counts per table — the playground's live inventory panel. */
export function summarizeTables(
  state: { tables?: Record<string, unknown[]> } | null | undefined,
): { name: string; rows: number }[] {
  const tables = state?.tables ?? {};
  return Object.keys(tables)
    .sort()
    .map((name) => ({ name, rows: (tables[name] as unknown[]).length }));
}
