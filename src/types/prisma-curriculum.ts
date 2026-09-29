/**
 * Prisma track types — Phase 1 (multi-track foundation).
 * ─────────────────────────────────────────────────────────────────────────────
 * ADDITIVE ONLY: mirrors the SQL pedagogy shape (`ModuleData` → `Concept` →
 * `theory` + `tasks` + `challenge`) so the same roadmap / theory / practice /
 * challenge UI can render both tracks. SQL types in
 * `src/types/curriculum.ts` are NOT modified here — Prisma fields are attached
 * as OPTIONAL extensions there.
 *
 * Source: PRISMA_LEARNING_PLATFORM_SPECIFICATION.md §4, adapted to SQL
 * practices (target hero before steps, ≥2 tasks per concept, final challenge).
 */

export type PrismaMethod =
  | 'findMany'
  | 'findUnique'
  | 'findFirst'
  | 'create'
  | 'createMany'
  | 'update'
  | 'updateMany'
  | 'upsert'
  | 'delete'
  | 'deleteMany'
  | '$transaction';

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
  /** Which editor surface this task uses. */
  activeTab?: 'editor' | 'schema';
  /** Starter TypeScript shown in the editor. */
  initialCode: string;
  /** Reference solution TypeScript. */
  solutionCode: string;
  /** Generated SQL preview for the SQL Lens (authored; engine verifies). */
  generatedSql?: string;
  /** Inferred result type preview for the Type Inspector. */
  expectedType?: string;
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
  stepBreakdowns?: PrismaStepBreakdown[];
  liveDemoCode?: string;
}
