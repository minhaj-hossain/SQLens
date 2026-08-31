export type TaskType = 'guided' | 'independent' | 'stretch' | 'challenge' | 'project' | 'assignment';

export type LessonStepType = 'concept_theory' | 'practice_task' | 'concept_complete' | 'module_challenge' | 'module_complete';

export interface TaskHint {
  level: number; // 1 = subtle, 2 = direct
  text: string;
}

export interface ValidationRule {
  targetTable?: string;
  requiredColumns?: string[];
  forbiddenColumns?: string[];
  requiredAliases?: Record<string, string>; // original -> alias
  requireLimit?: number | { min?: number; max?: number; exact?: number };
  requireOffset?: number;
  requireOrderBy?: { column: string; direction?: 'ASC' | 'DESC' }[];
  requireDistinct?: boolean;
  requireWhere?: boolean;
  whereContainsTerms?: string[];
  requireJoin?: boolean;
  requireGroupBy?: boolean;
  requireHaving?: boolean;
  /** Require a CASE WHEN … THEN … END expression in the query. */
  requireCase?: boolean;
  /** Require a call to this function (e.g. 'CONCAT', 'YEAR') in the query. */
  requireFunction?: string;
  /** Require a top-level set operation: 'UNION', 'UNION ALL', or 'EXCEPT'. */
  requireSetOp?: 'UNION' | 'UNION ALL' | 'EXCEPT';
  /**
   * Deliberate-failure lab: the task REQUIRES the query to error (e.g. a
   * constraint violation mid-transaction). Passes when the engine rejects it.
   */
  expectFailure?: boolean;
  expectedRowCount?: number | { min?: number; max?: number };
  customValidator?: (queryAst: any, result: any) => { valid: boolean; message?: string };
  /**
   * Compare the returned dataset against the task's solutionSql output
   * (multiset of row-values; ordered when requireOrderBy is set). This makes
   * grading content-aware instead of row-count-only, while staying fair to
   * equivalent approaches (aliasing, operator/spacing/case differences,
   * `IN` vs `OR`, `<>` vs `!=`, etc.).
   */
  requireExactResult?: boolean;
}

export interface PracticeTask {
  id: string;
  title: string;
  description: string;
  instructions: string[];
  type: TaskType;
  primaryTable: string;
  secondaryTables?: string[];
  initialSql: string;
  solutionSql: string;
  solutionExplanation: string;
  hints: TaskHint[];
  validation: ValidationRule;
  successMessage: string;
  /**
   * Database lifecycle for this task (v2, replaces the earlier `freshDb`
   * boolean — audited Day 19/20 curriculum): 
   *   - `fresh`  — always start from the original seed state (reset on mount).
   *   - `inherit`— continue from the previously-mutated state (for connected
   *               multi-step scenarios, e.g. a challenge's second task that
   *               builds on the first task's INSERT/CREATE).
   *   undefined (default) — current behavior: inherit within a concept/day.
   */
  databaseLifecycle?: 'fresh' | 'inherit';
}

export interface SyntaxBlock {
  title: string;
  sql: string;
  description: string;
}

export interface ConceptMCQ {
  id?: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export interface TargetQuery {
  sql: string;
  explanation?: string;
  badge?: string; // e.g. "Query we'll break down", "Dissecting this query"
}

export interface ConceptStepBreakdown {
  stepNumber: number;
  stepTitle: string;
  sqlSnippet: string;
  clause?: string;
  explanation: string;
  tableData?: {
    tableName: string;
    columns: string[];
    rows: (string | number | null)[][];
    highlightedColumns?: string[];
    highlightedRows?: number[];
    dimmedRows?: number[];
  };
}

export interface ConceptTheory {
  summary: string;
  explanation: string[];
  keyTakeaway: string;
  exampleQuery: string;
  exampleQueryExplanation: string;
  targetQuery?: TargetQuery;
  introTable?: {
    tableName: string;
    description?: string;
    columns: string[];
    rows: (string | number | null)[][];
  };
  stepBreakdowns?: ConceptStepBreakdown[];
  mcqs?: ConceptMCQ[];
  syntaxDiagram?: string;
  syntaxBlocks?: SyntaxBlock[];
  mentalModel?: {
    entity: string;
    rowInstance: string;
    columnProperty: string;
    analogyText?: string;
  };
  liveDemoSql?: string;
  liveDemoNotes?: string;
  commonMistakes?: string[];
  understandingChecks?: { question: string; answer?: string }[];
  debuggingExercise?: { brokenSql: string; bugs: string[]; fixDescription: string };
  highlightedColumns?: string[];
  masteryPoints?: string[];
  interactiveDemo?: {
    table: string;
    queries: {
      label: string;
      sql: string;
      description: string;
      highlightColumns: string[];
    }[];
  };
}

export interface Concept {
  id: string;
  order: number;
  title: string;
  shortDescription: string;
  theory: ConceptTheory;
  tasks: PracticeTask[];
  masteryPoints?: string[];
}

export interface IndependentChallenge {
  id: string;
  title: string;
  scenario: string;
  /**
   * Database lifecycle for the challenge's task SET (v2):
   *   - `fresh`  (recommended) — each task starts from the seed state, so
   *              challenge tasks are independently verifiable.
   *   - `inherit` — the whole challenge runs as one sequence: the first task
   *              starts from seed, later tasks build on earlier mutations.
   *   undefined (default) — `fresh` (independence; decide per challenge).
   */
  databaseLifecycle?: 'fresh' | 'inherit';
  tasks: PracticeTask[];
}

export type ModuleChallenge = IndependentChallenge;

export type ModuleType = 'module' | 'practice_day' | 'conceptual_session' | 'project_part' | 'assignment' | 'setup';

export interface ModuleData {
  id: string;
  slug: string;
  day: number;
  title: string;
  shortTitle: string;
  type: ModuleType;
  milestoneId: string;
  description: string;
  estimatedMinutes: number;
  concepts: Concept[];
  challenge?: IndependentChallenge;
  completionLearnings: string[];
  /**
   * Position-independent sort key controlling the canonical curriculum order
   * (unlock sequence, roadmap ordering, prev/next navigation). Existing
   * modules may omit it — `day` is used as the fallback. New modules MUST set
   * it explicitly. Module ids are consistently `day-NN`; fractional orders like
   * 10.5 remain available when inserting content between days.
   */
  curriculumOrder?: number;
  /**
   * Cosmetic display label, e.g. "Day 10". Falls back to `Day ${day}` when
   * omitted. Never used for logic — ordering/unlocking reads curriculumOrder.
   */
  displayLabel?: string;
  /**
   * Optional ISO datetime string (e.g. "2024-11-01T18:00:00") for manually
   * scheduling this module's earliest availability. If set, the module will NOT
   * unlock before this date even if the user has completed the previous module
   * and waited the standard 24-hour period. Useful for cohort-based launches.
   * Can be set per-module in the content file OR via curriculum-schedule.ts
   * (which takes precedence).
   */
  scheduledPublishDate?: string;
}

export interface MilestoneData {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  description: string;
  daysRange: string;
  moduleIds: string[];
}
