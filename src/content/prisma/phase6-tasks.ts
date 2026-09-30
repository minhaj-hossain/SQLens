import type { PracticeTask } from '../../types/curriculum';
import type { PrismaMethod, PrismaValidationRule } from '../../types/prisma-curriculum';
import { extractPrismaTarget } from '../../lib/prisma-engine/prisma-validator';

/**
 * Phase-6 task factories. Every task runs its `solutionSql` on a FRESH DB
 * holding the two-table seed (`users` + `posts`) + their seed rows, stamped
 * below. Without setupSql the engine errors ("Table 'users' does not exist").
 *
 * Phase 10: `posts` joined the universe so relation loads (`include: { posts:
 * true }`) are no longer a lens note — they execute as a real second query and
 * the relation's rows are graded from the engine, not described.
 */
export const PRISMA_TASK_SETUP_SQL =
  'CREATE TABLE users (id INTEGER, name TEXT, email TEXT); ' +
  'CREATE TABLE posts (id INTEGER, title TEXT, authorId INTEGER); ' +
  'INSERT INTO users (id, name, email) VALUES ' +
  "(1, 'Alex', 'alex@prisma.io'), " +
  "(2, 'Mina', 'mina@prisma.io'), " +
  "(3, 'Rafi', 'rafi@prisma.io'); " +
  'INSERT INTO posts (id, title, authorId) VALUES ' +
  "(1, 'Hello Prisma', 1), " +
  "(2, 'Typed queries', 1), " +
  "(3, 'Migrations 101', 3);";

export const PRISMA_SEED_ROWS: (string | number | null)[][] = [
  [1, 'Alex', 'alex@prisma.io'],
  [2, 'Mina', 'mina@prisma.io'],
  [3, 'Rafi', 'rafi@prisma.io'],
];

/** `posts(id, title, authorId)` — child rows of users 1 (two) and 3 (one). */
export const PRISMA_SEED_POST_ROWS: (string | number | null)[][] = [
  [1, 'Hello Prisma', 1],
  [2, 'Typed queries', 1],
  [3, 'Migrations 101', 3],
];

function usersIntro(description: string) {
  return {
    tableName: 'users',
    description,
    columns: ['id', 'name', 'email'],
    rows: PRISMA_SEED_ROWS,
  };
}

/**
 * Every method the Phase-6 factories can grade. Probed as `.name(`, so
 * `createMany` can never be read as `create`. Delegates to the engine's
 * `extractPrismaTarget` so content and validator can never drift apart.
 */

export function methodOf(code: string): PrismaMethod {
  const { method } = extractPrismaTarget(code);
  return (method as PrismaMethod | undefined) ?? 'findMany';
}

/**
 * Optional contracts shared by both factories. All additive: omitting them
 * reproduces the Phase-6 pilot behaviour exactly.
 */
export interface PrismaTaskExtras {
  /** What Prisma really sends (INSERT/UPDATE/DELETE). Defaults to `solutionSql`. */
  generatedSql?: string;
  /** Override the graded method (defaults to the method found in `code1`). */
  method?: PrismaMethod;
  /** Override the graded model (defaults to `user`). */
  model?: string;
  /** Relation names that MUST appear in an `include` block. */
  includes?: string[];
  /** Sort contract graded through `requiredOrderBy`. */
  orderBy?: { field: string; direction?: 'asc' | 'desc' }[];
  /** Pagination contract graded through `requirePagination`. */
  pagination?: { take?: number; skip?: number; cursor?: boolean };
  /** Extra literal fragments the code must contain. */
  snippets?: string[];
  /** Literal fragments the code must NOT contain. */
  forbidden?: string[];
  /** `true` for labs the structural validator cannot grade (e.g. $transaction). */
  noModelContract?: boolean;
}

/** Rules shared by both factories' Prisma side (needs `code1` to infer the method). */
function prismaRules(
  t: PrismaTaskExtras & { code1: string },
  selectFields: string[],
): Record<string, unknown> {
  return {
    ...(t.noModelContract
      ? {}
      : { targetModel: t.model ?? 'user', requiredMethod: t.method ?? methodOf(t.code1) }),
    ...(!t.noModelContract && selectFields.length > 0
      ? { requiredFieldsInSelect: selectFields }
      : {}),
    ...(t.includes?.length ? { requiredIncludes: t.includes } : {}),
    ...(t.orderBy?.length ? { requiredOrderBy: t.orderBy } : {}),
    ...(t.pagination ? { requirePagination: t.pagination } : {}),
    ...(t.snippets?.length ? { requiredCodeSnippets: t.snippets } : {}),
    ...(t.forbidden?.length ? { forbiddenCodeSnippets: t.forbidden } : {}),
  };
}

/**
 * Fields referenced INSIDE the `where` block only. Scanning the whole call
 * would also match `select: { id: true }` and make the code validator demand
 * `id` in `where` (false failure) — the validator reads the where block alone.
 */
function whereFieldsOf(code: string): string[] | undefined {
  const key = /\bwhere\s*:\s*\{/.exec(code);
  if (!key) return undefined;
  const open = code.indexOf('{', key.index);
  let depth = 0;
  let block = '';
  for (let i = open; i < code.length; i++) {
    if (code[i] === '{') depth++;
    else if (code[i] === '}') {
      depth--;
      if (depth === 0) {
        block = code.slice(open, i + 1);
        break;
      }
    }
  }
  const found = ['id', 'name', 'email'].filter((f) => new RegExp(`\\b${f}\\b`).test(block));
  return found.length > 0 ? found : undefined;
}

/**
 * Read-probe task: where+select on `users`; SQL lens is a single-table
 * SELECT. `initialSql` is a scaffold only, so the starter always fails.
 */
export type PrismaReadTaskOptions = PrismaTaskExtras & {
  id: string;
  title: string;
  description: string;
  instructions: string[];
  hint: string;
  scaffold: string;
  solutionSql: string;
  why: string;
  /** Columns the SQL lens must return (and the default `select` contract). */
  cols?: string[];
  /** Columns the SQL lens must NOT return. */
  noCols?: string[];
  /** Select contract override; `[]` disables the select rule (write ops). */
  select?: string[];
  rows: number;
  code0: string;
  code1: string;
  rtype: string;
};

export function prismaReadTask(t: PrismaReadTaskOptions): PracticeTask {
  const wf = whereFieldsOf(t.code1);
  const selectFields = t.select ?? t.cols ?? [];
  return {
    id: t.id,
    title: t.title,
    description: t.description,
    instructions: t.instructions,
    type: 'guided',
    primaryTable: 'users',
    databaseLifecycle: 'fresh',
    setupSql: PRISMA_TASK_SETUP_SQL,
    initialSql: `${t.scaffold}\n`,
    solutionSql: t.solutionSql,
    solutionExplanation: t.why,
    hints: [{ level: 1, text: t.hint }],
    validation: {
      requireExactResult: true,
      targetTable: 'users',
      requiredColumns: t.cols,
      ...(t.noCols ? { forbiddenColumns: t.noCols } : {}),
      expectedRowCount: t.rows,
    },
    successMessage: 'Correct — the SQL lens proves it.',
    prisma: {
      initialCode: t.code0,
      solutionCode: t.code1,
      generatedSql: t.generatedSql ?? t.solutionSql,
      expectedType: t.rtype,
      validation: {
        ...prismaRules(t, selectFields),
        ...(t.noCols ? { forbiddenFieldsInSelect: t.noCols } : {}),
        ...(wf ? { requiredWhereClauses: wf } : {}),
        expectedRowCount: t.rows,
      } as PrismaValidationRule,
    },
  };
}

/**
 * Snippet-lab task (CLI/schema/URL/Zod/transactions): the starter misses a
 * required snippet (or carries a forbidden one); the solution has every one.
 */
export type PrismaSnippetTaskOptions = PrismaTaskExtras & {
  id: string;
  title: string;
  description: string;
  instructions: string[];
  hint: string;
  scaffold: string;
  solutionSql: string;
  why: string;
  cols?: string[];
  /** Select contract for the Prisma side; defaults to `cols`. */
  select?: string[];
  rows: number;
  code0: string;
  code1: string;
  need: string[];
  ban?: string[];
  /** Override the Type Inspector string (e.g. a Zod schema type). */
  rtype?: string;
};

export function prismaSnippetTask(t: PrismaSnippetTaskOptions): PracticeTask {
  const selectFields = t.select ?? t.cols ?? [];
  // Snippet labs only gain structural rules when the author *names* the
  // contract (method / relations / sort / pagination) — the CLI, schema.prisma,
  // URL and Zod labs have no `prisma.<model>.<method>(...)` call to grade.
  const structural =
    t.method !== undefined ||
    !!t.includes?.length ||
    !!t.orderBy?.length ||
    t.pagination !== undefined;
  return {
    id: t.id,
    title: t.title,
    description: t.description,
    instructions: t.instructions,
    type: 'guided',
    primaryTable: 'users',
    databaseLifecycle: 'fresh',
    setupSql: PRISMA_TASK_SETUP_SQL,
    initialSql: `${t.scaffold}\n`,
    solutionSql: t.solutionSql,
    solutionExplanation: t.why,
    hints: [{ level: 1, text: t.hint }],
    validation: {
      requireExactResult: true,
      targetTable: 'users',
      requiredColumns: t.cols,
      expectedRowCount: t.rows,
    },
    successMessage: 'Correct.',
    prisma: {
      initialCode: t.code0,
      solutionCode: t.code1,
      generatedSql: t.generatedSql ?? t.solutionSql,
      expectedType: t.rtype ?? 'string',
      validation: {
        requiredCodeSnippets: t.need,
        ...(t.ban ? { forbiddenCodeSnippets: t.ban } : {}),
        ...(t.forbidden ? { forbiddenCodeSnippets: t.forbidden } : {}),
        ...(t.noModelContract || !structural
          ? {}
          : prismaRules({ ...t, snippets: undefined }, selectFields)),
        expectedRowCount: t.rows,
      } as PrismaValidationRule,
    },
  };
}

/** Shared theory builder: seeded intro table + one hero + SQL lens. */
export function prismaTheory(
  summary: string,
  takeaway: string,
  sql: string,
  heroCode: string,
  heroLang: 'typescript' | 'prisma' | 'bash',
  heroWhy: string,
) {
  return {
    summary,
    introTable: usersIntro('Seeded table every probe reads from.'),
    explanation: [
      'Every probe runs against the same three seeded users.',
      'The SQL lens shows the exact query Prisma generates.',
    ],
    targetQuery: { sql, explanation: 'The exact SQL this concept generates.', badge: "The query we're going to break down" },
    stepBreakdowns: [
      { stepNumber: 1, stepTitle: 'FROM users exists', sqlSnippet: 'FROM users', explanation: 'Setup SQL creates the table first.' },
    ],
    keyTakeaway: takeaway,
    exampleQuery: sql,
    exampleQueryExplanation: 'Run it — the grid matches the seed rows.',
    liveDemoSql: sql,
    liveDemoNotes: 'Run it against the seeded users table.',
    prisma: { targetHero: { code: heroCode, language: heroLang, explanation: heroWhy } },
  };
}
