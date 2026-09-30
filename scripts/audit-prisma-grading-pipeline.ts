/**
 * scripts/audit-prisma-grading-pipeline.ts
 * -----------------------------------------------------------------------------
 * Phase 8 audit harness: the Prisma mirror of `audit-grading-pipeline.ts`.
 * Runs EVERY Prisma curriculum task (concepts + challenges) through the SAME
 * `submitForTask` router the UI runs — telemetry OFF (`record: false`), so bulk
 * verification never pollutes the browser-session grading signal.
 *
 * Why `submitForTask` and not the raw pipeline: an audit failure must be a real
 * learner-visible failure. Routing through the track router also guards the
 * Phase-7 wiring itself — a task the router misclassifies fails here exactly
 * the way the learner would see it.
 *
 * Contract asserted per task:
 *
 *   1. SOLUTION_PASSES — the authored `solutionCode` reaches `passed: true`.
 *                        (A reference that does not pass is an authoring bug the
 *                        learner can never work around.)
 *   2. STARTER_FAILS   — the authored `initialCode` must NOT pass. A starter
 *                        that passes is a task with no lesson in it.
 *   3. LENS_RAN        — an executable task's pass carries real SQL Lens steps
 *                        (label + substituted SQL + per-statement result). A
 *                        pass with no steps on an executable task is the Prisma
 *                        "phantom pass" (cf. `PHANTOM_PASS` on the SQL side,
 *                        where `stateOk` guards it).
 *   4. LENS_HONEST     — a read-through pass (snippet lab: nothing translated)
 *                        must say so in `lens.note` (the reference-dataset line),
 *                        never showing steps it did not run.
 *   5. RETRY-SAFE      — on a `fresh` task, two consecutive submits of the same
 *                        solution end in the SAME post-state fingerprint, so
 *                        retries can never accumulate rows (the class of bug
 *                        that shipped twice on the SQL track).
 *   6. AUTHORING_OK    — no task reports `inconclusive` (its own reference failed
 *                        to run — never the learner's fault, so nothing else
 *                        would ever surface it).
 *
 * Exit code 1 on any finding, so CI blocks the regression instead of a human.
 *
 * Run: npm run audit:prisma-grading-pipeline
 */
import { PRISMA_MODULES } from '../src/content/prisma/prisma-curriculum-index';
import { SqlExecutor } from '../src/lib/sql-engine/executor';
import {
  isExecutablePrismaTask,
  isPrismaTask,
  runAndGradePrismaSubmission,
} from '../src/lib/prisma-engine/prisma-submit-pipeline';
import { submitForTask, type SubmitHooks, type TrackSubmitOutcome } from '../src/lib/track-submit';
import type { ModuleData, PracticeTask } from '../src/types/curriculum';
import type { DatabaseState } from '../src/types/database';

// Local surface alias — matches `audit-grading-pipeline.ts` so the two reports
// read the same way.
type Surface = 'lesson' | 'challenge';

interface Finding {
  day: number;
  where: Surface;
  taskId: string;
  title: string;
  kind:
    | 'NOT_A_PRISMA_TASK'
    | 'NO_SOLUTION'
    | 'THREW'
    | 'DID_NOT_PASS'
    | 'STARTER_PASSES'
    | 'LENS_EMPTY'
    | 'LENS_DISHONEST'
    | 'RETRY_UNSTABLE'
    | 'INCONCLUSIVE';
  detail: string;
}

const findings: Finding[] = [];
let checked = 0;
let executableSteps = 0;
let readThrough = 0;

/**
 * Hooks over a REAL session executor. The UI provider (`SqlExecutorProvider`)
 * sets `allowDdlOverwrite = true` for sandbox retry leniency; the harness must
 * match or its verdicts diverge from the UI. (Same rule as
 * `audit-grading-pipeline.ts`.)
 */
function hooksFor(exec: SqlExecutor): SubmitHooks {
  exec.allowDdlOverwrite = true;
  return {
    execute: (sql: string) => exec.executeQuery(sql),
    getDatabaseState: () => exec.getDatabaseState(),
    getCommittedState: () => exec.getCommittedState(),
    getTransactionState: () => exec.getTransactionState(),
    resetDatabase: () => exec.resetDatabase(),
  };
}

/** Row counts per table — the fingerprint retries must not change. */
function tableCounts(state: DatabaseState): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [table, rows] of Object.entries(state.tables ?? {})) {
    out[table] = (rows as unknown[]).length;
  }
  return out;
}

function report(
  module: ModuleData,
  where: Surface,
  task: PracticeTask,
  kind: Finding['kind'],
  detail: string,
) {
  findings.push({ day: module.day, where, taskId: task.id, title: task.title, kind, detail });
}

/** One submit through the router the UI uses, with telemetry switched off. */
function submit(
  task: PracticeTask,
  code: string,
  hooks: SubmitHooks,
  where: Surface,
  attempt: number,
): TrackSubmitOutcome {
  return submitForTask({ task, code, hooks, surface: where, attempt, record: false });
}

/**
 * Grade ONE Prisma task the way a learner experiences it: their code goes to
 * `submitForTask`, the track router picks the Prisma pipeline, and the SQL Lens
 * reports what ran.
 *
 * `surface` matters: concept tasks and challenge tasks reach the same router
 * from two different views, so both are audited.
 */
function auditTask(module: ModuleData, where: Surface, task: PracticeTask, exec: SqlExecutor) {
  if (!isPrismaTask(task) || !task.prisma) {
    report(module, where, task, 'NOT_A_PRISMA_TASK', 'task ships no `prisma` block — nothing grades it');
    return;
  }
  if (!task.prisma.solutionCode?.trim() || !task.prisma.initialCode?.trim()) {
    report(module, where, task, 'NO_SOLUTION', 'task is missing `prisma.initialCode`/`solutionCode` to verify');
    return;
  }
  checked++;

  const executable = isExecutablePrismaTask(task);
  const hooks = hooksFor(exec);

  // ---- Attempt 1: the reference solution must pass --------------------------
  let first: TrackSubmitOutcome;
  try {
    first = submit(task, task.prisma.solutionCode, hooks, where, 1);
  } catch (err) {
    report(module, where, task, 'THREW', `submit pipeline threw: ${(err as Error).message}`);
    return;
  }

  if (!first.passed) {
    report(
      module,
      where,
      task,
      'DID_NOT_PASS',
      `stage=${first.stage} :: ${first.feedback ?? 'no feedback'}`,
    );
    return;
  }

  // ---- The lens must report what the pass actually ran ----------------------
  // Executable tasks really execute, so a pass with no steps is the Prisma
  // phantom pass. Read-through tasks execute nothing, so their lens must say the
  // rows are the reference dataset instead of showing statements never run.
  if (executable) {
    if (first.lens?.steps.length) {
      executableSteps++;
    } else {
      report(
        module,
        where,
        task,
        'LENS_EMPTY',
        'executable task passed but the SQL Lens carries no executed statement — nothing proves what ran',
      );
      return;
    }
  } else {
    readThrough++;
    if (first.lens?.steps.length) {
      report(
        module,
        where,
        task,
        'LENS_DISHONEST',
        'snippet lab shows lens steps, but nothing was translated — the learner would see SQL that never ran',
      );
      return;
    }
    if (!first.lens?.note?.includes('reference dataset')) {
      report(
        module,
        where,
        task,
        'LENS_DISHONEST',
        'read-through pass hides that its rows are the reference dataset, not the learner SQL',
      );
      return;
    }
  }

  const ok = auditRetrySafety(module, where, task, exec, hooks);
  if (!ok) return;
  auditStarter(module, where, task, hooks);
}

/**
 * AUTHORING_OK + RETRY-SAFE.
 *
 * The router outcome deliberately drops `inconclusive` (an authoring-bug signal,
 * not UI state), so the raw pipeline is asked once: a task whose own reference
 * fails can never be passed by a learner, and nothing else would surface it.
 *
 * Then, on a `fresh` task, two consecutive submits of the same solution must end
 * in the SAME post-state fingerprint — the pipeline resets before every submit,
 * so drift here is exactly the 28→29→30→31 accumulation that stranded learners
 * on "Try Again" with a correct query.
 *
 * Returns `false` when a finding was filed (the caller stops grading that task).
 */
function auditRetrySafety(
  module: ModuleData,
  where: Surface,
  task: PracticeTask,
  exec: SqlExecutor,
  hooks: SubmitHooks,
): boolean {
  try {
    const raw = runAndGradePrismaSubmission({
      task,
      code: task.prisma!.solutionCode,
      hooks: { execute: hooks.execute, resetDatabase: hooks.resetDatabase },
      surface: where,
      attempt: 1,
      record: false,
    });
    if (raw.inconclusive) {
      report(module, where, task, 'INCONCLUSIVE', raw.feedback ?? 'reference solution failed to run');
      return false;
    }
  } catch (err) {
    report(module, where, task, 'THREW', `reference re-run threw: ${(err as Error).message}`);
    return false;
  }

  if (task.databaseLifecycle !== 'fresh') return true;

  try {
    const second = submit(task, task.prisma!.solutionCode, hooks, where, 2);
    if (!second.passed) {
      report(
        module,
        where,
        task,
        'RETRY_UNSTABLE',
        `attempt 1 passed but the retry failed (stage=${second.stage}) :: ${second.feedback ?? ''}`,
      );
      return false;
    }
    const stateAfterRetry = JSON.stringify(tableCounts(exec.getDatabaseState()));
    hooks.resetDatabase?.();
    const third = submit(task, task.prisma!.solutionCode, hooks, where, 3);
    if (!third.passed) {
      report(
        module,
        where,
        task,
        'RETRY_UNSTABLE',
        `the retry passed but the explicit-reset replay failed (stage=${third.stage}) :: ${third.feedback ?? ''}`,
      );
      return false;
    }
    const stateAfterReplay = JSON.stringify(tableCounts(exec.getDatabaseState()));
    if (stateAfterRetry !== stateAfterReplay) {
      report(
        module,
        where,
        task,
        'RETRY_UNSTABLE',
        `fresh task accumulates across attempts — ${stateAfterRetry} vs ${stateAfterReplay}`,
      );
      return false;
    }
  } catch (err) {
    report(module, where, task, 'THREW', `pipeline threw on retry: ${(err as Error).message}`);
    return false;
  }
  return true;
}

/** STARTER_FAILS: a starter that passes is a task with no lesson in it. */
function auditStarter(module: ModuleData, where: Surface, task: PracticeTask, hooks: SubmitHooks) {
  try {
    const starter = submit(task, task.prisma!.initialCode, hooks, where, 1);
    if (starter.passed) {
      report(module, where, task, 'STARTER_PASSES', 'starter code already passes — nothing left to learn');
    }
  } catch (err) {
    report(module, where, task, 'THREW', `pipeline threw on the starter: ${(err as Error).message}`);
  }
}

// ---- Walk the whole Prisma track ---------------------------------------------
console.log('\n=== Prisma grading-pipeline audit (Phase 8) ===');
console.log('Every Prisma task runs through the SAME `submitForTask` router the UI runs.\n');

for (const module of PRISMA_MODULES) {
  // One session executor per module, mirroring a learner's session.
  const exec = new SqlExecutor();
  const before = findings.length;

  for (const concept of module.concepts) {
    for (const task of concept.tasks ?? []) auditTask(module, 'lesson', task, exec);
  }
  for (const task of module.challenge?.tasks ?? []) auditTask(module, 'challenge', task, exec);

  const filed = findings.length - before;
  console.log(
    `Day ${String(module.day).padStart(2, ' ')}: ${module.shortTitle.padEnd(40)} ${
      filed === 0 ? 'OK' : `${filed} ISSUE(S)`
    }`,
  );
}

console.log('\n--- SUMMARY ---');
console.log(`Tasks graded:          ${checked}`);
console.log(`Lens-backed (execute): ${executableSteps}`);
console.log(`Read-through (static): ${readThrough}`);
console.log(`Findings:              ${findings.length}`);

if (findings.length > 0) {
  console.log('\n--- FINDINGS ---');
  for (const f of findings) {
    console.log(`  ✗ Day ${f.day} ${f.where.padEnd(9)} ${f.taskId.padEnd(20)} [${f.kind}]`);
    console.log(`      ${f.title}`);
    console.log(`      ${f.detail}`);
  }
  console.log('\nPRISMA GRADING PIPELINE AUDIT FAILED — a learner-visible grading defect exists.');
  process.exit(1);
}

console.log(
  '\nAll Prisma tasks pass through the real UI submit path (translate → execute → grade, lens-verified).',
);
