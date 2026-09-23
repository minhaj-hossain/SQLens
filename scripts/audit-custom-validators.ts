/**
 * scripts/audit-custom-validators.ts
 * -----------------------------------------------------------------------------
 * Batch 5 gate: the `validation.customValidator` predicates — the last grading
 * surface no other gate reads.
 *
 * Batches 1–4 made the DECLARATIVE grading surface auditable (rendered
 * instructions, solutionSql literals, taught constructs, policy rules). These 17
 * predicates are CODE: nothing typed them, nothing tested them, nothing re-read
 * them, so a predicate could grade nothing (`always-valid`), never run at all
 * (`unreachable`), fail with no explanation (`silent-failure`), or key off a
 * value the learner can never see (`ghost-value`) — while every existing gate
 * stayed green.
 *
 * Two halves, both required:
 *   STATIC     — walk the curriculum, read `fn.toString()`, classify defects.
 *   BEHAVIOURAL— replay each module as a LADDER (concepts then challenge, one
 *                session executor per module) and run every task through the
 *                shared submit pipeline with the predicate wrapped in a call
 *                counter, then assert it was actually INVOKED and did not
 *                reject its own reference solution. A pushed-but-never-called
 *                predicate is dead code wearing a requirement.
 *
 * Ladder fidelity is load-bearing. An `inherit` task's predicate is only
 * reachable once the tasks before it have left their state behind; probing each
 * site in a fresh executor made every `inherit` task die at `engine-error`
 * before rule 14 and reported it as "dead code" — a probe artefact
 * indistinguishable from a real defect. This is the same ladder
 * `audit-grading-pipeline.ts` walks, so the two audits cannot disagree.
 *
 * Run: npx tsx scripts/audit-custom-validators.ts
 */
import { ALL_MODULES } from '../src/content/curriculum-index';
import { SqlExecutor } from '../src/lib/sql-engine/executor';
import { runAndGradeSubmission, SubmitHooks } from '../src/lib/sql-engine/submit-pipeline';
import {
  auditCustomValidators,
  CustomFindingKind,
  CustomValidatorSite,
} from '../src/lib/curriculum/custom-validators';
import type { PracticeTask } from '../src/types/curriculum';

console.log('\n=== Custom-validator audit (Batch 5) ===');
console.log('The 17 authored grading predicates must be reachable, refutable and explainable.\n');

const { checked, sites, findings } = auditCustomValidators(ALL_MODULES);

const byKind = (kind: CustomFindingKind) => findings.filter((f) => f.kind === kind);

// ---------------------------------------------------------------- static half
console.log('--- STATIC CENSUS ---');
console.log(`Predicate sites:          ${checked}`);
console.log(`  always-valid:           ${byKind('always-valid').length}`);
console.log(`  unreachable:            ${byKind('unreachable').length}`);
console.log(`  silent-failure:         ${byKind('silent-failure').length}`);
console.log(`  ghost-value:            ${byKind('ghost-value').length}`);
console.log(`  no-solution:            ${byKind('no-solution').length}`);
console.log(`Static findings:          ${findings.length}`);

for (const f of findings.slice(0, 80)) {
  console.log(`  ✗ Day ${f.day} ${f.where.padEnd(9)} ${f.taskId.padEnd(20)} [${f.kind}]`);
  console.log(`      ${f.detail}`);
}

// ----------------------------------------------------------- behavioural half
/** Hooks over a REAL session executor — identical to the provider's wiring. */
function hooksFor(exec: SqlExecutor): SubmitHooks {
  return {
    execute: (sql: string) => exec.executeQuery(sql),
    getDatabaseState: () => exec.getDatabaseState(),
    resetDatabase: () => exec.resetDatabase(),
  };
}

interface BehaviouralFinding {
  site: CustomValidatorSite;
  kind: 'NOT_INVOKED' | 'UNREACHABLE' | 'REJECTS_REFERENCE' | 'THREW';
  detail: string;
}

const behavioural: BehaviouralFinding[] = [];
let probed = 0;

// Keyed lookup so the ladder walk can tell "this task carries an authored
// predicate" from "this task only exists to leave state behind for the next one".
const siteKey = (day: number, where: string, taskId: string) => `${day}|${where}|${taskId}`;
const siteByKey = new Map(sites.map((s) => [siteKey(s.day, s.where, s.taskId), s]));
const daysWithSites = new Set(sites.map((s) => s.day));

/**
 * Grade ONE task in-ladder; when it carries an authored predicate, count whether
 * rule 14 actually invoked it.
 *
 * `inherit` tasks are the whole reason this takes an executor instead of making
 * one: their predicate is unreachable until the earlier tasks in the same module
 * have left their state behind.
 */
function probeInLadder(
  exec: SqlExecutor,
  day: number,
  where: 'lesson' | 'challenge',
  task: PracticeTask,
): void {
  // Deliberate-error labs return before rule 14; the static half already reports
  // the unreachable predicate, and the ladder audit skips them for the same
  // reason (they are not meant to leave state behind).
  if (task.validation?.expectFailure) return;
  if (!task.solutionSql?.trim()) return;

  const site = siteByKey.get(siteKey(day, where, task.id));

  // Ladder-only step: no predicate to count, but it still has to run — the tasks
  // after it inherit its state.
  if (!site) {
    runAndGradeSubmission({
      task,
      sql: task.solutionSql,
      judgmentAnswers: task.validation.judgment?.map((j) => j.correctIndex),
      hooks: hooksFor(exec),
      surface: where,
      attempt: 1,
      record: false,
    });
    return;
  }

  probed++;
  const original = task.validation.customValidator!;
  let calls = 0;
  // Patch the LIVE validation object so the pipeline's own call site is counted.
  task.validation.customValidator = (ast: any, result: any, features: any) => {
    calls++;
    return original(ast, result, features);
  };

  try {
    const verdict = runAndGradeSubmission({
      task,
      sql: task.solutionSql,
      judgmentAnswers: task.validation.judgment?.map((j) => j.correctIndex),
      hooks: hooksFor(exec),
      surface: where,
      attempt: 1,
      record: false,
    });

    if (calls > 0) {
      if (!verdict.passed && !verdict.inconclusive) {
        behavioural.push({
          site,
          kind: 'REJECTS_REFERENCE',
          detail: `the predicate rejects the task's own solution (stage=${verdict.stage}) :: ${
            verdict.feedback ?? 'no feedback'
          }`,
        });
      } else if (verdict.inconclusive) {
        behavioural.push({
          site,
          kind: 'THREW',
          detail: `the reference solution could not be graded :: ${verdict.feedback ?? ''}`,
        });
      }
      return;
    }

    // Never called — say WHY. An earlier stage stopping the run is a different,
    // separately-fixable defect from a predicate with no call site, and calling
    // it "dead code" would send the reader to the wrong file.
    if (verdict.stage === 'engine-error') {
      behavioural.push({
        site,
        kind: 'UNREACHABLE',
        detail: `the reference solution could not execute in-ladder (stage=engine-error) :: ${
          verdict.feedback ?? 'no feedback'
        } — rule 14 never ran, so this predicate grades nothing.`,
      });
    } else if (!verdict.passed && !verdict.inconclusive) {
      behavioural.push({
        site,
        kind: 'UNREACHABLE',
        detail: `the pipeline stopped at stage=${verdict.stage} before rule 14 :: ${
          verdict.feedback ?? 'no feedback'
        }.`,
      });
    } else {
      behavioural.push({
        site,
        kind: 'NOT_INVOKED',
        detail:
          'the pipeline passed its own reference solution without ever calling this predicate — dead code that reads as a requirement.',
      });
    }
  } catch (err) {
    behavioural.push({ site, kind: 'THREW', detail: (err as Error).message });
  } finally {
    task.validation.customValidator = original;
  }
}

// One session executor per module — a learner's session — walking concepts then
// challenge, the same ladder `audit-grading-pipeline.ts` walks. Only modules that
// contain a predicate are replayed: the pipeline audit already grades every other
// task, so re-running them here would buy minutes and no signal.
for (const module of ALL_MODULES) {
  if (!daysWithSites.has(module.day)) continue;
  const exec = new SqlExecutor();
  for (const concept of module.concepts ?? []) {
    for (const task of concept.tasks ?? []) probeInLadder(exec, module.day, 'lesson', task);
  }
  for (const task of module.challenge?.tasks ?? []) {
    probeInLadder(exec, module.day, 'challenge', task);
  }
}

console.log('\n--- BEHAVIOURAL PROBE (shared submit pipeline) ---');
console.log(`Predicate sites probed:   ${probed}`);
console.log(`Behavioural findings:     ${behavioural.length}`);

for (const f of behavioural) {
  console.log(
    `  ✗ Day ${f.site.day} ${f.site.where.padEnd(9)} ${f.site.taskId.padEnd(20)} [${f.kind}]`,
  );
  console.log(`      ${f.detail}`);
}

if (findings.length + behavioural.length > 0) {
  console.log(
    '\nCUSTOM-VALIDATOR AUDIT FAILED — a grading predicate must be reachable, refutable and explainable (see Batch 5 plan).',
  );
  process.exit(1);
}

console.log('\nEvery grading predicate runs, can fail, explains itself, and keys off visible values.');
