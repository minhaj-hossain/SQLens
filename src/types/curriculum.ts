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
  expectedRowCount?: number | { min?: number; max?: number };
  customValidator?: (queryAst: any, result: any) => { valid: boolean; message?: string };
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

export interface ConceptStepBreakdown {
  stepNumber: number;
  stepTitle: string;
  sqlSnippet: string;
  explanation: string;
  tableData?: {
    tableName: string;
    columns: string[];
    rows: (string | number)[][];
    highlightedColumns?: string[];
  };
}

export interface ConceptTheory {
  summary: string;
  explanation: string[];
  keyTakeaway: string;
  exampleQuery: string;
  exampleQueryExplanation: string;
  introTable?: {
    tableName: string;
    description?: string;
    columns: string[];
    rows: (string | number)[][];
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
