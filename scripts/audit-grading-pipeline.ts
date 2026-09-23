/**
 * scripts/audit-grading-pipeline.ts
 * -----------------------------------------------------------------------------
 * Phase 3 audit harness: runs EVERY curriculum task through the SAME grading
 * pipeline the UI runs (`runAndGradeSubmission`), not a lookalike.
 *
 * Why this exists: `audit-all-tasks.ts` reproduced the *validate* half of a
 * submit but never the final-state half, so "343/343 passed" could not see the
 * blocking INSERT bug (a CORRECT query reported `expected 32, found 31`). This
 * script asserts the full user-visible contract instead:
 *
 *   1. PASSES        — every task's own `solutionSql` reaches `passed: true`.
 *   2. REAL GRADING  — every mutation task is graded by the state layer
 *                      (`stateOk === true`), catching "phantom passes" where the
 *                      state comparison silently never ran.
 *   3. RETRY-SAFE    — a `fresh` task passes on attempt 1 AND attempt N, with an
 *                      identical post-state. This is the exact regression that
 *                      shipped twice (retries accumulated 28→29→30→31 and every
 *                      grader message went off-by-one, so the learner was stuck
 *                      on `Try Again` with a correct query).
 *   4. AUTHORING OK  — no task reports `inconclusive` (its reference solution
 *                      failed to run — a broken `solutionSql`, never a learner's
 *                      fault, and therefore never noticed in production).
 *
 * Exit code 1 on any finding, so CI blocks the regression instead of a human.
 *
 * Run: npx tsx scripts/audit-grading-pipeline.ts
 */
import { ALL_MODULES } from '../src/content/curriculum-index';
import { SqlExecutor } from '../src/lib/sql-engine/executor';
import { runAndGradeSubmission, isStateGraded, SubmitHooks } from '../src/lib/sql-engine/submit-pipeline';
import { ModuleData, PracticeTask } from '../src/types/curriculum';
import { DatabaseState } from '../src/types/database';

type Surface = 'lesson' | 'challenge';

interface Finding {
  day: number;
  where: Surface;
  taskId: string;
  title: string;
  kind: 'NO_SOLUTION' | 'THREW' | 'DID_NOT_PASS' | 'PHANTOM_PASS' | 'RETRY_UNSTABLE' | 'INCONCLUSIVE';
  detail: string;
}

const findings: Finding[] = [];
let checked = 0;
let stateGraded = 0;

/** Hooks over a REAL session executor — identical to the provider's wiring
 *  (`SqlExecutorProvider` sets `allowDdlOverwrite = true` for sandbox retry
 *  leniency; the harness must match or its verdicts diverge from the UI). */
function hooksFor(exec: SqlExecutor): SubmitHooks {
  exec.allowDdlOverwrite = true;
  return {
    execute: (sql: string) => exec.executeQuery(sql),
    getDatabaseState: () => exec.getDatabaseState(),
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

/**
 * Grade ONE task the way a learner experiences it.
 *
 * `surface` matters: PracticeTask and ChallengeTask carry the same fields, but
 * the UI takes different code paths per surface — auditing both is how the
 * duplicated-logic bug got caught.
 */
function auditTask(module: ModuleData, where: Surface, task: PracticeTask, exec: SqlExecutor) {
  if (task.validation?.expectFailure) return; // deliberate-error labs are exempt
  if (!task.solutionSql || !task.solutionSql.trim()) {
    report(module, where, task, 'NO_SOLUTION', 'task has no solutionSql to verify');
    return;
  }
  checked++;

  const hooks = hooksFor(exec);
  // P1: reference answers for `judgment[]` — the audits simulate a perfect
  // learner (right SQL + right reasoning).
  const judgmentAnswers = task.validation.judgment?.map((j) => j.correctIndex);

  // ---- Attempt 1: does the reference solution actually pass? ----------------
  let first: ReturnType<typeof runAndGradeSubmission>;
  try {
    first = runAndGradeSubmission({
      task,
      sql: task.solutionSql,
      judgmentAnswers,
      hooks,
      surface: where,
      attempt: 1,
      record: false,
    });
  } catch (err) {
    report(module, where, task, 'THREW', `pipeline threw: ${(err as Error).message}`);
    return;
  }

  if (!first.passed) {
    report(
      module,
      where,
      task,
      'DID_NOT_PASS',
      `stage=${first.stage} stateOk=${first.stateOk} :: ${first.feedback ?? 'no feedback'}`,
    );
    return;
  }

  // ---- Layer 2 must actually have run for mutation tasks -------------------
  // A `stateOk === undefined` on a mutation task means the final-state check was
  // skipped (no snapshot hooks / non-state-graded path): the pass came from the
  // weaker validator layer only. That is precisely how "343/343 green" hid the
  // blocking INSERT bug.
  const mutation = isStateGraded(task);
  if (mutation) {
    if (first.stateOk !== true) {
      report(
        module,
        where,
        task,
        'PHANTOM_PASS',
        `passed with stateOk=${first.stateOk} — final-state layer never agreed`,
      );
      return;
    }
    stateGraded++;
  }

  if (first.inconclusive) {
    report(
      module,
      where,
      task,
      'INCONCLUSIVE',
      first.feedback ?? 'reference solution failed to run',
    );
  }

  // ---- Attempt N: `fresh` retries must be idempotent ------------------------
  // The shipped regression: retries stacked mutations (28→29→30→31) so a correct
  // query could not unlock Next. Assert the SAME verdict and the SAME post-state
  // fingerprint on a second submit against a dirty executor.
  if (task.databaseLifecycle === 'fresh' && mutation) {
    try {
      const second = runAndGradeSubmission({
        task,
        sql: task.solutionSql,
        judgmentAnswers,
        hooks,
        surface: where,
        attempt: 2,
        record: false,
      });
      if (!second.passed) {
        report(
          module,
          where,
          task,
          'RETRY_UNSTABLE',
          `attempt 1 passed but attempt 2 failed (stage=${second.stage}) :: ${second.feedback ?? ''}`,
        );
        return;
      }
      if (!second.reset) {
        report(
          module,
          where,
          task,
          'RETRY_UNSTABLE',
          'fresh task did not report a pre-submit reset — retries can accumulate rows',
        );
        return;
      }
      // Same fingerprint on both attempts == no accumulation.
      const a = JSON.stringify(tableCounts(exec.getDatabaseState()));
      hooks.resetDatabase?.();
      runAndGradeSubmission({ task, sql: task.solutionSql, judgmentAnswers, hooks, surface: where, attempt: 3, record: false });
      const b = JSON.stringify(tableCounts(exec.getDatabaseState()));
      if (a !== b) {
        report(
          module,
          where,
          task,
          'RETRY_UNSTABLE',
          `post-state differs between attempts — ${a} vs ${b}`,
        );
      }
    } catch (err) {
      report(module, where, task, 'THREW', `pipeline threw on retry: ${(err as Error).message}`);
    }
  }
}

// ---- Walk the whole curriculum ---------------------------------------------
console.log('\n=== Grading-pipeline audit (Phase 3) ===');
console.log('Runs every task through the SAME pipeline the UI runs.\n');

for (const module of ALL_MODULES) {
  // One session executor per module, mirroring a learner's session.
  const exec = new SqlExecutor();

  for (const concept of module.concepts) {
    for (const task of concept.tasks || []) {
      auditTask(module, 'lesson', task, exec);
    }
  }

  const challenge = module.challenge;
  if (challenge?.tasks?.length) {
    for (const task of challenge.tasks) {
      auditTask(module, 'challenge', task, exec);
    }
  }

  const dayFindings = findings.filter((f) => f.day === module.day);
  const flag = dayFindings.length === 0 ? 'OK' : `${dayFindings.length} ISSUE(S)`;
  console.log(
    `Day ${String(module.day).padStart(2, ' ')}: ${module.shortTitle.padEnd(38)} ${flag}`,
  );
}

console.log('\n--- SUMMARY ---');
console.log(`Tasks graded:          ${checked}`);
console.log(`State-graded (mutate): ${stateGraded}`);
console.log(`Findings:              ${findings.length}`);

if (findings.length) {
  console.log('\n--- FINDINGS ---');
  for (const f of findings) {
    console.log(`  ✗ Day ${f.day} ${f.where.padEnd(9)} ${f.taskId.padEnd(20)} [${f.kind}]`);
    console.log(`      ${f.title}`);
    console.log(`      ${f.detail}`);
  }
  console.log('\nGRADING PIPELINE AUDIT FAILED — a learner-visible grading defect exists.');
  process.exit(1);
}

console.log('\nAll tasks pass through the real grading pipeline (validator + final state).');

