import type { PracticeTask, TaskHint } from '../../types/curriculum';
import type {
  GradingType,
  PrismaHowToThink,
  PrismaLittleDetails,
  PrismaMethod,
  PrismaSqlBridge,
  PrismaStepBreakdown,
  PrismaTargetHero,
  PrismaValidationRule,
  PrismaWorkspaceMode,
  SkillType,
} from '../../types/prisma-curriculum';
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
  /**
   * Task 0.2 — runtime bindings for write params the translator cannot see
   * (`data: { name }` → `name`). Threaded to `prisma.demoVariables` so the
   * reference renders a real value instead of the honest `NULL`.
   */
  demoVariables?: Record<string, unknown>;
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
  /** Milestone 1: Workspace interaction surface ('schema' | 'query' | 'cli'). */
  workspaceMode?: PrismaWorkspaceMode;
  /** Phase 3 Quality Rubric: pedagogical role ('introduce' | 'practice' | 'assess'). */
  skillType?: SkillType;
  /** Phase 3 Quality Rubric: Strategy C grading channel ('executable' | 'snippet-lab'). */
  gradingType?: GradingType;
  /** Phase 9/Phase 6: which editor tab this task OPENS on (`editor` or `schema`). */
  activeTab?: 'editor' | 'schema';
  /** Phase 9/Phase 6: custom schema.prisma source for multi-model or custom tasks. */
  schemaSource?: string;
  /** Custom bootstrap SQL statements for custom table definitions/columns. */
  setupSql?: string;
  /** Phase 2: behavioral evaluation harness hook. */
  behavioralGrader?:
    | 'day6-singleton'
    | 'day9-zod'
    | 'day12-transaction'
    | 'day13-errors'
    | 'orderby-tiebreaker'
    | 'checkpoint1-schema'
    | 'checkpoint2-feed';
  /** Custom hints override (defaults to single-level from `hint`). */
  hints?: TaskHint[];
  /** Phase 3: 3-tier cumulative hint ladder [concept anchor, structural skeleton, cumulative 1-step-short]. */
  hintLadder?: [string, string, string];
  /** Phase 3: flags task as a 5-minute blank-slate fluency rep. */
  fromScratch?: boolean;
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
    ...(t.behavioralGrader ? { behavioralGrader: t.behavioralGrader } : {}),
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
  hint?: string;
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
  const gradingType: GradingType = t.gradingType ?? 'executable';
  const skillType: SkillType =
    t.skillType ?? (t.id.includes('-hw-') ? 'assess' : t.id.endsWith('-t1') ? 'introduce' : 'practice');
  return {
    id: t.id,
    title: t.title,
    description: t.description,
    instructions: t.instructions,
    type: 'guided',
    skillType,
    gradingType,
    primaryTable: 'users',
    databaseLifecycle: 'fresh',
    setupSql: t.setupSql ?? PRISMA_TASK_SETUP_SQL,
    initialSql: `${t.scaffold}\n`,
    solutionSql: t.solutionSql,
    solutionExplanation: t.why,
    hints: t.hintLadder
      ? [
          { level: 1, text: t.hintLadder[0] },
          { level: 2, text: t.hintLadder[1] },
          { level: 3, text: t.hintLadder[2] },
        ]
      : (t.hints ?? (t.hint ? [{ level: 1, text: t.hint }] : [])),
    validation: {
      requireExactResult: true,
      targetTable: 'users',
      requiredColumns: t.cols,
      ...(t.noCols ? { forbiddenColumns: t.noCols } : {}),
      expectedRowCount: t.rows,
    },
    successMessage: 'Correct — the SQL lens proves it.',
    prisma: {
      workspaceMode: t.workspaceMode ?? 'query',
      skillType,
      gradingType,
      ...(t.fromScratch ? { fromScratch: true } : {}),
      initialCode: t.code0,
      solutionCode: t.code1,
      expectedType: t.rtype,
      ...(t.activeTab ? { activeTab: t.activeTab } : {}),
      ...(t.schemaSource ? { schemaSource: t.schemaSource } : {}),
      ...(t.demoVariables ? { demoVariables: t.demoVariables } : {}),
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
  hint?: string;
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
  const gradingType: GradingType = t.gradingType ?? 'snippet-lab';
  const skillType: SkillType =
    t.skillType ?? (t.id.includes('-hw-') ? 'assess' : t.id.endsWith('-t1') ? 'introduce' : 'practice');
  // Snippet labs only gain structural rules when the author *names* the
  // contract (method / relations / sort / pagination) — the CLI, schema.prisma,
  // URL and Zod labs have no `prisma.<model>.<method>(...)` call to grade.
  const structural =
    t.method !== undefined ||
    !!t.includes?.length ||
    !!t.orderBy?.length ||
    t.pagination !== undefined;
  const workspaceMode: PrismaWorkspaceMode =
    t.workspaceMode ??
    (t.activeTab === 'schema' || t.schemaSource !== undefined
      ? 'schema'
      : /\b(npx prisma|prisma init|prisma generate|prisma migrate|resolveTypeDesync)\b/.test(
            t.code1 + ' ' + (t.code0 || '')
          )
        ? 'cli'
        : 'query');

  return {
    id: t.id,
    title: t.title,
    description: t.description,
    instructions: t.instructions,
    type: 'guided',
    skillType,
    gradingType,
    primaryTable: 'users',
    databaseLifecycle: 'fresh',
    setupSql: t.setupSql ?? PRISMA_TASK_SETUP_SQL,
    initialSql: `${t.scaffold}\n`,
    solutionSql: t.solutionSql,
    solutionExplanation: t.why,
    hints: t.hintLadder
      ? [
          { level: 1, text: t.hintLadder[0] },
          { level: 2, text: t.hintLadder[1] },
          { level: 3, text: t.hintLadder[2] },
        ]
      : (t.hints ?? (t.hint ? [{ level: 1, text: t.hint }] : [])),
    validation: {
      requireExactResult: true,
      targetTable: 'users',
      requiredColumns: t.cols,
      expectedRowCount: t.rows,
    },
    successMessage: 'Correct.',
    prisma: {
      workspaceMode,
      skillType,
      gradingType,
      ...(t.fromScratch ? { fromScratch: true } : {}),
      initialCode: t.code0,
      solutionCode: t.code1,
      expectedType:
        t.rtype ??
        (workspaceMode === 'schema' ? 'schema.prisma' : workspaceMode === 'cli' ? 'terminal' : 'string'),
      ...(t.activeTab ? { activeTab: t.activeTab } : {}),
      ...(t.schemaSource ? { schemaSource: t.schemaSource } : {}),
      ...(t.demoVariables ? { demoVariables: t.demoVariables } : {}),
      validation: {
        requiredCodeSnippets: t.need,
        ...(t.ban ? { forbiddenCodeSnippets: t.ban } : {}),
        ...(t.forbidden ? { forbiddenCodeSnippets: t.forbidden } : {}),
        ...(t.behavioralGrader ? { behavioralGrader: t.behavioralGrader } : {}),
        ...(t.noModelContract || !structural
          ? {}
          : prismaRules({ ...t, snippets: undefined }, selectFields)),
        expectedRowCount: t.rows,
      } as PrismaValidationRule,
    },
  };
}

/**
 * Shared skeleton for the Prisma theory builders: seeded intro table, the
 * generated-SQL target, the live demo and the hero card. P2.1: no placeholder
 * steps — `stepBreakdowns` appears ONLY when real ones are authored
 * (`richPrismaTheory`), never auto-filled.
 */
function basePrismaTheory(t: {
  summary: string;
  takeaway: string;
  sql: string;
  explanation: string[];
  hero: PrismaTargetHero;
  mentalModel?: string;
  steps?: PrismaStepBreakdown[];
  littleDetails?: PrismaLittleDetails;
  sqlBridge?: PrismaSqlBridge;
  howToThink?: PrismaHowToThink;
}) {
  return {
    summary: t.summary,
    introTable: usersIntro('Seeded table every probe reads from.'),
    explanation: t.explanation,
    targetQuery: { sql: t.sql, explanation: 'The exact SQL this concept generates.', badge: "The query we're going to break down" },
    keyTakeaway: t.takeaway,
    exampleQuery: t.sql,
    exampleQueryExplanation: 'Run it — the grid matches the seed rows.',
    liveDemoSql: t.sql,
    liveDemoNotes: 'Run it against the seeded users table.',
    prisma: {
      targetHero: t.hero,
      ...(t.mentalModel ? { mentalModel: t.mentalModel } : {}),
      ...(t.steps && t.steps.length > 0 ? { stepBreakdowns: t.steps } : {}),
      ...(t.littleDetails ? { littleDetails: t.littleDetails } : {}),
      ...(t.sqlBridge ? { sqlBridge: t.sqlBridge } : {}),
      ...(t.howToThink ? { howToThink: t.howToThink } : {}),
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
  return basePrismaTheory({
    summary,
    takeaway,
    sql,
    explanation: [
      'Every probe runs against the same three seeded users.',
      'The SQL lens shows the exact query Prisma generates.',
    ],
    hero: { code: heroCode, language: heroLang, explanation: heroWhy },
  });
}

/**
 * P2.1 — rich theory builder: a bespoke mental model plus genuine steps
 * (client call → Query-Engine translation → inferred result type), beginner
 * micro-rules, SQL-to-Prisma comparison, and decision checklists.
 */
export function richPrismaTheory(t: {
  summary: string;
  takeaway: string;
  sql: string;
  heroCode: string;
  heroLang: 'typescript' | 'prisma' | 'bash';
  heroWhy: string;
  mentalModel?: string;
  /** Concept-specific explanation lines; falls back to the two generic ones. */
  explanation?: string[];
  steps: PrismaStepBreakdown[];
  littleDetails?: PrismaLittleDetails;
  sqlBridge?: PrismaSqlBridge;
  howToThink?: PrismaHowToThink;
}) {
  return basePrismaTheory({
    summary: t.summary,
    takeaway: t.takeaway,
    sql: t.sql,
    explanation: t.explanation ?? [
      'Every probe runs against the same three seeded users.',
      'The SQL lens shows the exact query Prisma generates.',
    ],
    hero: { code: t.heroCode, language: t.heroLang, explanation: t.heroWhy },
    mentalModel: t.mentalModel,
    steps: t.steps,
    littleDetails: t.littleDetails,
    sqlBridge: t.sqlBridge,
    howToThink: t.howToThink,
  });
}
