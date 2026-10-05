/**
 * Prisma track types — Phase 1 (multi-track foundation).
 * ─────────────────────────────────────────────────────────────────────────────
 * ADDITIVE ONLY: mirrors the SQL pedagogy shape (`ModuleData` → `Concept` →
 * `theory` + `tasks` + `challenge`) so the same roadmap / theory / practice /
 * challenge UI can render both tracks. SQL types in
 * `src/types/curriculum.ts` are NOT modified here — Prisma fields are attached
 * as OPTIONAL extensions there.
 *
 * Source: docs/archive/specs-and-curriculum/PRISMA_LEARNING_PLATFORM_SPECIFICATION.md §4, adapted to SQL
 * practices (target hero before steps, ≥2 tasks per concept, final challenge).
 */

export type PrismaMethod =
  | 'findMany'
  | 'findUnique'
  | 'findUniqueOrThrow'
  | 'findFirst'
  | 'create'
  | 'createMany'
  | 'update'
  | 'updateMany'
  | 'upsert'
  | 'delete'
  | 'deleteMany'
  | '$transaction';

/**
 * Pedagogical skill level for a task (Phase 3 Quality Rubric):
 * - `introduce`: Introduces exactly one new mechanism or concept.
 * - `practice`: Builds fluency with introduced concepts in different combinations.
 * - `assess`: Diagnostic/synthesis challenge without hand-holding or direct method naming.
 */
export type SkillType = 'introduce' | 'practice' | 'assess';

/**
 * Strategy C Grading Channel (Phase 3 Quality Rubric):
 * - `executable`: Graded by SQLite engine execution and SQL Lens comparison.
 * - `snippet-lab`: Graded by AST / code snippet matching and structural validation.
 */
export type GradingType = 'executable' | 'snippet-lab';

export interface PrismaValidationRule {
  /** e.g. "user", "post", "product" (lowercase model name). */
  targetModel?: string;
  requiredMethod?: PrismaMethod;
  /** e.g. ['id', 'email', 'name'] */
  requiredFieldsInSelect?: string[];
  /** e.g. ['password', 'hash'] */
  forbiddenFieldsInSelect?: string[];
  /** e.g. ['posts', 'profile', 'categories'] */
  requiredIncludes?: string[];
  /** e.g. ['email', 'status', 'createdAt'] */
  requiredWhereClauses?: string[];
  requiredOrderBy?: { field: string; direction?: 'asc' | 'desc' }[];
  requirePagination?: { take?: number; skip?: number; cursor?: boolean };
  /**
   * Phase 6: literal fragments the raw code must contain, for labs the
   * structural client validator cannot grade (CLI strings, schema.prisma
   * blocks, connection URLs, Zod schemas). Checked verbatim via
   * `String.includes` — keep them short and exact.
   */
  requiredCodeSnippets?: string[];
  /** Phase 6: literal fragments the raw code must NOT contain. */
  forbiddenCodeSnippets?: string[];
  /** Deliberate error lab (e.g. unique constraint violation). */
  expectFailure?: boolean;
  /** e.g. 'P2002' (unique key), 'P2025' (not found). */
  expectedErrorCode?: string;
  expectedRowCount?: number | { min?: number; max?: number };
  expectedResultSnippet?: Record<string, unknown>;
  customValidator?: (codeAst: unknown, result: unknown, rawSql: string) => {
    valid: boolean;
    message?: string;
  };
}

/**
 * Prisma side of a practice task. `solutionSql` (on the task) stays the
 * executable reference: the Prisma engine generates SQL from `solutionCode`
 * and runs it through the existing in-browser SQL executor (real execution).
 */
export interface PrismaTaskContent {
  /** Phase 3 Quality Rubric: pedagogical role ('introduce' | 'practice' | 'assess'). */
  skillType?: SkillType;
  /** Phase 3 Quality Rubric: grading channel ('executable' | 'snippet-lab'). */
  gradingType?: GradingType;
  /**
   * Which editor surface this task OPENS on. Default `editor` (the TypeScript
   * file); `schema` opens the read-only `schema.prisma` tab, which also carries
   * the live ERD of that schema.
   */
  activeTab?: 'editor' | 'schema';
  /**
   * Phase 9: the `schema.prisma` this task is translated against. Omitted →
   * the seed universe's two-model schema (`users` + `posts`) is shown, which is
   * what the generated SQL actually runs on — never a decorative schema.
   */
  schemaSource?: string;
  /** Starter TypeScript shown in the editor. */
  initialCode: string;
  /** Reference solution TypeScript. */
  solutionCode: string;
  /** Inferred result type preview for the Type Inspector. */
  expectedType?: string;
  /**
   * Task 0.2 — author-declared runtime bindings for params the translator
   * cannot see (`update({ data: { name } })`). Resolved by
   * `renderGeneratedSql` (source identifier first, then field name) through the
   * seed context, so a reference renders `SET name = 'Alexandra'` instead of the
   * honest `NULL` for an unresolved param. Omitted → the shared demo universe
   * (`id` / `userId` / `email`) applies and unresolved params stay `NULL`.
   */
  demoVariables?: Record<string, unknown>;
  validation: PrismaValidationRule;
}

/** Hero target snippet shown BEFORE theory steps (spec core principle #1). */
export interface PrismaTargetHero {
  code: string;
  language: 'typescript' | 'prisma' | 'bash';
  explanation: string;
  badge?: string;
}

export interface PrismaStepBreakdown {
  stepNumber: number;
  stepTitle: string;
  codeSnippet: string;
  explanation: string;
  visualData?: {
    type: 'sql_lens' | 'type_preview' | 'table_diff' | 'erd_highlight';
    title: string;
    details: unknown;
  };
}

/** Prisma side of concept theory (SQL fields stay populated for reuse). */
export interface PrismaTheoryContent {
  targetHero?: PrismaTargetHero;
  /**
   * P2.1 — markdown mental model shown above the steps: the one-picture
   * explanation the call → SQL → type steps hang off. Rendered by
   * `PrismaTheoryBlock` on the concept lesson.
   */
  mentalModel?: string;
  /**
   * P2.1 — genuine step breakdowns (client call → Query-Engine translation →
   * inferred result type), authored per concept. Absent = the lesson renders
   * no steps section (never an auto-filled placeholder).
   */
  stepBreakdowns?: PrismaStepBreakdown[];
  liveDemoCode?: string;
  /**
   * Phase 9: the `schema.prisma` the concept's ERD card draws. Omitted → the
   * seed universe's schema is drawn (the one every probe executes against).
   */
  schemaSource?: string;
}
