/**
 * track-submit — Phase 7: the ONE place the UI decides WHICH pipeline grades a
 * task, plus the track-aware editor / solution / SQL-Lens decisions around it.
 * ─────────────────────────────────────────────────────────────────────────────
 * `PracticeTaskView` and `IndependentChallengeView` each called
 * `runAndGradeSubmission` directly — two call sites for one grading contract,
 * the shape of duplication that shipped the blocking INSERT bug twice. Both now
 * call `submitForTask`, which picks by the task itself:
 *
 *   - a task WITH a `prisma` block → `runAndGradePrismaSubmission`
 *     (translate the learner's TypeScript → execute the generated SQL → grade)
 *   - every other task           → the unchanged SQL pipeline
 *
 * …and both paths come back as one `TrackSubmitOutcome`, so the views keep a
 * single render path and a Prisma task can never be graded as if it were SQL.
 *
 * The helpers below keep the track-aware DECISIONS out of the components
 * (starter code, solution reveal, lens state, editor chrome): pure functions,
 * unit-tested in `tests/tracks/phase7-prisma-ui-wiring.test.ts`.
 */
import type { PracticeTask } from '../types/curriculum';
import type { QueryExecutionResult } from '../types/database';
import type { GradingStage } from './grading-telemetry';
import { runAndGradeSubmission, type SubmitHooks } from './sql-engine/submit-pipeline';
import {
  isExecutablePrismaTask,
  isPrismaTask,
  previewPrismaSubmission,
  prismaSchemaSourceForTask,
  runAndGradePrismaSubmission,
  type PrismaSubmitOutcome,
} from './prisma-engine/prisma-submit-pipeline';
import {
  inferResultType,
  type InferredField,
  type InferredResultType,
} from './prisma-engine/prisma-type-inference';
import type { PrismaExecutionStep } from './prisma-engine/prisma-proxy-executor';
import { splitTaskScaffold } from './task-scaffold';

export type { SubmitHooks } from './sql-engine/submit-pipeline';
export type { PrismaExecutionStep } from './prisma-engine/prisma-proxy-executor';
export type { InferredField, InferredResultType } from './prisma-engine/prisma-type-inference';
export { isPrismaTask } from './prisma-engine/prisma-submit-pipeline';

/** Prisma SQL Lens payload — what `SqlLensPanel` renders. */
export interface SqlLensState {
  /** One entry per statement that ran (empty until something translated + ran). */
  steps: PrismaExecutionStep[];
  /** Honest line for the lens body when there is nothing to show. */
  note?: string;
}

/**
 * The lens line for a snippet lab: nothing was translated, so the rows (when
 * any) are the authored reference run, never the learner's own SQL.
 */
const READ_THROUGH_NOTE =
  'No Prisma client call to translate: this lab is graded by its static rules, and the rows shown are the task reference dataset.';

export interface TrackSubmitOptions {
  task: PracticeTask;
  /** The learner's editor content: TypeScript on the Prisma track, SQL otherwise. */
  code: string;
  hooks: SubmitHooks;
  /** P1 answers to `validation.judgment` (SQL track only — see `submitForTask`). */
  judgmentAnswers?: (number | null)[];
  /** Which surface sent this submit (telemetry). */
  surface: 'lesson' | 'challenge';
  /** 1-based attempt within the current task session (telemetry only). */
  attempt?: number;
  /** `false` in audits/scripts: telemetry must not be written by bulk runs. */
  record?: boolean;
}

/** One outcome shape for both pipelines — the views render it without branching. */
export interface TrackSubmitOutcome {
  passed: boolean;
  feedback?: string;
  stage: GradingStage;
  /** Engine result the console renders (see `submitForTask` for what it means). */
  result?: QueryExecutionResult;
  /** SQL track: the open-transaction submit gate refused the verdict. */
  txnBlocked?: boolean;
  /** SQL track: the pipeline reset the database (fresh lifecycle replay). */
  reset?: boolean;
  /** Prisma track only: the SQL Lens (undefined on the SQL track). */
  lens?: SqlLensState;
}

/**
 * Grade one submission on whichever track the task belongs to.
 *
 * SQL track: the outcome is `runAndGradeSubmission`'s, untouched — `result` is
 * the learner's own run and `lens` stays undefined, so the SQL experience (and
 * every existing test) is byte-identical.
 *
 * Prisma track: `result` is the LAST statement the translation ran (the rows
 * the lens explains). A snippet lab executes nothing: `result` is then the
 * authored reference run and `lens.note` says so.
 *
 * Deliberate limitation (fail-closed, and tested): the Prisma grader scores the
 * `prisma` block, not `validation.judgment`, so a Prisma task that declared
 * reasoning questions could never verify them. Instead of silently blessing
 * such a task, `submitForTask` refuses to pass it. No Prisma task authors
 * judgment questions today (asserted in the Phase-7 test), so this is a
 * tripwire for the next author, not a learner-facing path.
 */
export function submitForTask(options: TrackSubmitOptions): TrackSubmitOutcome {
  const { task, code, hooks, judgmentAnswers, surface, attempt, record } = options;

  if (!isPrismaTask(task)) {
    return runAndGradeSubmission({
      task,
      sql: code,
      hooks,
      judgmentAnswers,
      surface,
      attempt,
      record,
    });
  }

  if ((task.validation.judgment?.length ?? 0) > 0) {
    return {
      passed: false,
      feedback:
        'This Prisma task declares reasoning questions the Prisma grader cannot score yet — the submit path refuses to pass it.',
      stage: 'validation',
      lens: { steps: [] },
    };
  }

  const outcome = runAndGradePrismaSubmission({
    task,
    code,
    hooks: { execute: hooks.execute, resetDatabase: hooks.resetDatabase },
    surface,
    attempt,
    record,
  });

  return {
    passed: outcome.passed,
    feedback: outcome.feedback,
    stage: outcome.stage,
    result: outcome.result,
    lens: submitLensState(outcome),
  };
}

/** Lens state for a finished graded submit (steps, or the honest reason). */
function submitLensState(outcome: PrismaSubmitOutcome): SqlLensState {
  if (outcome.steps.length > 0) return { steps: outcome.steps };
  return {
    steps: [],
    note: outcome.readThrough ? READ_THROUGH_NOTE : outcome.feedback,
  };
}

export interface TrackPreviewOutcome {
  /** The SQL Lens for this run (never undefined: only Prisma tasks preview here). */
  lens: SqlLensState;
  /** Last statement's result — the rows the console grid renders. */
  result?: QueryExecutionResult;
}

/**
 * Prisma-only preview (the editor's Run, ungraded): translate + execute on the
 * session executor and hand back the lens. The SQL track keeps its existing Run
 * Preview (the learner's SQL runs directly), so this never wraps it.
 */
export function previewPrismaTask(
  task: PracticeTask,
  code: string,
  hooks: SubmitHooks,
): TrackPreviewOutcome {
  const preview = previewPrismaSubmission({
    task,
    code,
    hooks: { execute: hooks.execute, resetDatabase: hooks.resetDatabase },
  });
  const last =
    preview.steps.length > 0 ? preview.steps[preview.steps.length - 1].result : undefined;
  return {
    lens:
      preview.steps.length > 0
        ? { steps: preview.steps }
        : {
            steps: [],
            note:
              preview.reason ??
              'Nothing executable was generated from this code yet — keep typing, then Run again.',
          },
    result: last,
  };
}

/**
 * What the editor opens with.
 *
 * Prisma tasks edit TypeScript (`prisma.initialCode`): their `initialSql` is the
 * SQL scaffold the lens is compared against, so loading it into the editor would
 * silently ask the learner to hand-write the SQL Prisma is supposed to generate.
 */
export function editorStarterCode(task: PracticeTask): string {
  if (isPrismaTask(task)) return task.prisma!.initialCode;
  return splitTaskScaffold(task.initialSql).code;
}

/** The reference "View Solution" reveals — and the language to label it with. */
export function solutionReveal(task: PracticeTask): {
  language: 'typescript' | 'sql';
  label: string;
  code: string;
} {
  if (isPrismaTask(task)) {
    return {
      language: 'typescript',
      label: 'Solution (TypeScript)',
      code: task.prisma!.solutionCode,
    };
  }
  return { language: 'sql', label: 'Solution SQL', code: task.solutionSql };
}

/**
 * The SQL Lens state BEFORE anything runs.
 *
 * `isExecutablePrismaTask` answers "does this task have a client call to
 * translate?" at render time, so a snippet lab is never mistaken for a broken
 * lens: the panel says which of the two it is. `undefined` on the SQL track,
 * which renders no lens UI at all.
 */
export function idleLensState(task: PracticeTask): SqlLensState | undefined {
  if (!isPrismaTask(task)) return undefined;
  return {
    steps: [],
    note: isExecutablePrismaTask(task)
      ? 'Run your code to see the SQL Prisma sends to the database.'
      : 'This lab has no Prisma client call to translate — it is graded by its static rules against the reference dataset.',
  };
}

/**
 * Editor chrome per track: the Prisma surface is a TypeScript file, so the SQL
 * keyword chips make no sense there and the Type Inspector takes their place.
 */
export function editorSurface(task: PracticeTask): {
  fileLabel: string;
  showQuickChips: boolean;
  expectedType: string | null;
} {
  if (!isPrismaTask(task)) {
    return { fileLabel: 'query.sql', showQuickChips: true, expectedType: null };
  }
  return {
    fileLabel: 'query.ts',
    showQuickChips: false,
    expectedType: task.prisma!.expectedType ?? null,
  };
}

/** The editor surfaces a task can open: its code file, and (Prisma only) the schema. */
export type PrismaEditorTab = 'editor' | 'schema';

/**
 * Phase 9 — the `schema.prisma` tab a Prisma editor shows.
 *
 * `undefined` on the SQL track: no schema UI exists there, so the SQL editor
 * keeps its exact single-file layout. On the Prisma track the tab always exists
 * (a Prisma task without an authored schema still runs against the two-model
 * seed universe — and hiding that would make the generated SQL unexplainable).
 */
export function editorSchemaTab(
  task: PracticeTask,
): { label: string; source: string; caption: string } | undefined {
  if (!isPrismaTask(task)) return undefined;
  const authored = task.prisma!.schemaSource?.trim();
  return {
    label: 'schema.prisma',
    source: prismaSchemaSourceForTask(task),
    caption: authored
      ? 'This lab ships its own schema.prisma — the SQL below is generated from THIS schema.'
      : 'The seed universe schema every Prisma probe executes against (users + posts).',
  };
}

/** Phase 9 — which editor tab a task OPENS on (`prisma.activeTab`, default `editor`). */
export function defaultEditorTab(task: PracticeTask): PrismaEditorTab {
  if (!isPrismaTask(task)) return 'editor';
  return task.prisma!.activeTab === 'schema' ? 'schema' : 'editor';
}

/**
 * Phase 9 — the Type Inspector payload for a task and the rows it just produced.
 *
 * `undefined` on the SQL track. Both halves are reported separately because they
 * are different things: the authored reference type (a promise from the task
 * author) and the type observed on THIS run (measured). Either can be absent —
 * never faked.
 */
export interface TypeInspectorState {
  /** `prisma.expectedType` — what the reference call resolves to. */
  expectedType: string | null;
  /** Measured from the run's rows. */
  inferred: InferredResultType;
  /** `inferred.fields`, hoisted for the panel's table. */
  fields: InferredField[];
  /** True when the panel has anything beyond "run your code" to show. */
  hasReferenceType: boolean;
}

export function typeInspectorState(
  task: PracticeTask,
  result: QueryExecutionResult | null | undefined,
): TypeInspectorState | undefined {
  if (!isPrismaTask(task)) return undefined;
  const inferred = inferResultType(result);
  const expectedType = task.prisma!.expectedType?.trim() || null;
  return {
    expectedType,
    inferred,
    fields: inferred.fields,
    hasReferenceType: expectedType !== null,
  };
}
