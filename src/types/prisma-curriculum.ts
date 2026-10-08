/**
 * Prisma track types — Phase 1 (multi-track foundation).
 * ─────────────────────────────────────────────────────────────────────────────
 * ADDITIVE ONLY: mirrors the SQL pedagogy shape (`ModuleData` → `Concept` →
 * `theory` + `tasks` + `challenge`) so the same roadmap / theory / practice /
 * challenge UI can render both tracks. SQL types in
 * `src/types/curriculum.ts` are NOT modified here — Prisma fields are attached
 * as OPTIONAL extensions there.
 *
 * Source: docs/global/archive/specs-and-curriculum/PRISMA_LEARNING_PLATFORM_SPECIFICATION.md §4, adapted to SQL
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
  /**
   * Phase 2: behavioral evaluation harness hook. Replaces brittle snippet
   * matching with simulated runtime execution (Day 6 singleton, Day 9 Zod,
   * Day 12 transaction, Day 13 error handlers, Day 8 tiebreakers).
   */
  behavioralGrader?:
    | 'day6-singleton'
    | 'day9-zod'
    | 'day12-transaction'
    | 'day13-errors'
    | 'orderby-tiebreaker'
    | 'checkpoint1-schema'
    | 'checkpoint2-feed';
}

/**
 * Prisma side of a practice task. `solutionSql` (on the task) stays the
 * executable reference: the Prisma engine generates SQL from `solutionCode`
 * and runs it through the existing in-browser SQL executor (real execution).
 */
/**
 * Workspace Interaction Mode (Milestone 1):
 * Dictates what UI surface the learner interacts with.
 * - `schema`: Full-width schema.prisma editor + ERD / schema visualizer + AST checklist.
 * - `query`: query.ts editor + unified data/JSON results + secondary SQL lens / type inspector.
 * - `cli`: Terminal shell prompt + simulated execution stdout.
 */
export type PrismaWorkspaceMode = 'schema' | 'query' | 'cli';

export interface PrismaTaskContent {
  /** The workspace interaction surface ('schema' | 'query' | 'cli'). */
  workspaceMode?: PrismaWorkspaceMode;
  /** Phase 3 Quality Rubric: pedagogical role ('introduce' | 'practice' | 'assess'). */
  skillType?: SkillType;
  /** Phase 3 Quality Rubric: grading channel ('executable' | 'snippet-lab'). */
  gradingType?: GradingType;
  /** Phase 3: Flags task as a 5-minute blank-slate fluency rep. */
  fromScratch?: boolean;
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
  /** Plain-English conversational sentence translation of this code step. */
  sentenceReading?: string;
  /** Explicit indicator: this step defines a physical database column. */
  isPhysicalColumn?: boolean;
  /** Explicit indicator: this step defines a virtual in-memory relation handle. */
  isVirtualRelation?: boolean;
  visualData?: {
    type: 'sql_lens' | 'type_preview' | 'table_diff' | 'erd_highlight';
    title: string;
    details?: unknown;
  };
}

export interface PrismaLittleDetailRule {
  ruleNumber: number;
  title: string;
  description: string;
  codeSnippet?: string;
  badge?: string;
}

export interface PrismaLittleDetails {
  title?: string;
  rules: PrismaLittleDetailRule[];
}

export interface PrismaSqlBridgeMapping {
  sql: string;
  prisma: string;
  note?: string;
  isVirtual?: boolean;
}

export interface PrismaSqlBridge {
  title?: string;
  description?: string;
  mappings: PrismaSqlBridgeMapping[];
}

export interface PrismaHowToThinkQuestion {
  questionNumber: number;
  question: string;
  answer: string;
  template?: string;
}

export interface PrismaHowToThink {
  bidirectionalCheck?: {
    forward: string;
    reverse: string;
  };
  decisionQuestions?: PrismaHowToThinkQuestion[];
  toolingTip?: string;
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
  /** Beginner micro-details, syntax rules and conventions. */
  littleDetails?: PrismaLittleDetails;
  /** Side-by-side SQL to Prisma comparative token mappings. */
  sqlBridge?: PrismaSqlBridge;
  /** "How to think through this" bidirectional test and decision checklist. */
  howToThink?: PrismaHowToThink;
}
