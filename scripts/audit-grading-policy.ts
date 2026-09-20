/**
 * scripts/audit-grading-policy.ts
 * -----------------------------------------------------------------------------
 * Phase 4 enforcer for `docs/GRADING_POLICY.md`. Static census over every
 * curriculum task — no execution, no DB, milliseconds to run. Fails CI (exit 1)
 * when a task violates the policy, so the contract holds without hand-review.
 *
 * Rules enforced (see GRADING_POLICY.md for the WHY behind each):
 *   Rule 1 — every single read-only `solutionSql` (non-expectFailure) sets
 *            `requireExactResult: true` (dataset comparison, not row-count-only).
 *   Rule 3 — `strictConstruct: true` requires `requireExactResult: true`, and is
 *            flagged for justification outside the construct-teaching days
 *            (Days 4, 9, 10, 12, 14, 17, 32 as of 2026-09-20).
 *   Rule 4 — `verifyColumnTypes: true` is flagged for justification outside DDL
 *            type-teaching days (Days 27–29 as of 2026-09-20).
 *
 * Rules 2 + 5 are behavioral (final-state agreement, retry idempotence) and are
 * enforced by the sibling gate `scripts/audit-grading-pipeline.ts`, which runs
 * every task through the real `runAndGradeSubmission` pipeline. This script is
 * the static half; that script is the dynamic half. Both must be green.
 *
 * Run: npx tsx scripts/audit-grading-policy.ts
 */
import { ALL_MODULES } from '../src/content/curriculum-index';
import { isReadOnlySelect } from '../src/lib/sql-engine/validator';
import { ModuleData, PracticeTask } from '../src/types/curriculum';

type Surface = 'lesson' | 'challenge';

interface PolicyFinding {
  day: number;
  where: Surface;
  taskId: string;
  rule: string;
  detail: string;
}

/** Days whose lessons teach CONSTRUCTS — `strictConstruct` needs no extra note. */
const STRICT_CONSTRUCT_DAYS = new Set([4, 9, 10, 12, 14, 17, 32]);

/** Days whose lessons teach DDL types — `verifyColumnTypes` needs no extra note. */
const TYPE_TEACHING_DAYS = new Set([27, 28, 29]);

const findings: PolicyFinding[] = [];
let checked = 0;
let exactResult = 0;
let stateGraded = 0;
let strictConstruct = 0;

function checkTask(module: ModuleData, where: Surface, task: PracticeTask): void {
  checked++;
  const v = task.validation;
  if (v.requireExactResult) exactResult++;
  if (v.strictConstruct) strictConstruct++;

  // Mutation/DDL tasks grade by final state — count them for the census line.
  // (Agreement itself is enforced dynamically by audit-grading-pipeline.ts.)
  if (!isReadOnlySelect(task.solutionSql) && !v.expectFailure) stateGraded++;

  // ---- Rule 1: exact-result coverage for single read-only solutions ---------
  if (isReadOnlySelect(task.solutionSql) && !v.expectFailure && v.requireExactResult !== true) {
    findings.push({
      day: module.day,
      where,
      taskId: task.id,
      rule: 'Rule 1 (exact-result coverage)',
      detail:
        'solutionSql is a single read-only query but requireExactResult is not set — ' +
        'grading falls back to row-count-only and can reject equivalent-but-correct SQL.',
    });
  }

  // ---- Rule 3: strictConstruct must pair with a dataset ---------------------
  if (v.strictConstruct === true && v.requireExactResult !== true) {
    findings.push({
      day: module.day,
      where,
      taskId: task.id,
      rule: 'Rule 3 (strictConstruct needs a dataset)',
      detail:
        'strictConstruct is set without requireExactResult — strictness without a ' +
        'dataset to be strict about is a contradiction. Either add requireExactResult or drop strictConstruct.',
    });
  }
  if (v.strictConstruct === true && !STRICT_CONSTRUCT_DAYS.has(module.day)) {
    findings.push({
      day: module.day,
      where,
      taskId: task.id,
      rule: 'Rule 3 (strictConstruct justification)',
      detail:
        `strictConstruct outside the construct-teaching days (${[...STRICT_CONSTRUCT_DAYS].sort((a, b) => a - b).join(', ')}) — ` +
        'allowed only when the construct IS the deliverable. Add a comment on the task justifying it, or drop the flag.',
    });
  }

  // ---- Rule 4: verifyColumnTypes is opt-in for type-teaching DDL ------------
  if (v.verifyColumnTypes === true && !TYPE_TEACHING_DAYS.has(module.day)) {
    findings.push({
      day: module.day,
      where,
      taskId: task.id,
      rule: 'Rule 4 (verifyColumnTypes justification)',
      detail:
        `verifyColumnTypes outside the DDL type-teaching days (${[...TYPE_TEACHING_DAYS].sort((a, b) => a - b).join(', ')}) — ` +
        'type comparison rejects legal variations (VARCHAR(100) vs VARCHAR(200)). ' +
        'Add a comment on the task justifying it, or drop the flag.',
    });
  }
}

console.log('\n=== Grading-policy audit (Phase 4) ===');
console.log('Static enforcement of docs/GRADING_POLICY.md.\n');

for (const module of ALL_MODULES) {
  for (const concept of module.concepts) {
    for (const task of concept.tasks || []) checkTask(module, 'lesson', task);
  }
  for (const task of module.challenge?.tasks || []) checkTask(module, 'challenge', task);
}

console.log('--- CENSUS ---');
console.log(`Tasks checked:            ${checked}`);
console.log(`requireExactResult:       ${exactResult}`);
console.log(`mutation/DDL (Rule 2):    ${stateGraded}`);
console.log(`strictConstruct (Rule 3): ${strictConstruct}`);
console.log(`Policy findings:          ${findings.length}`);

if (findings.length) {
  console.log('\n--- FINDINGS ---');
  for (const f of findings) {
    console.log(`  ✗ Day ${f.day} ${f.where.padEnd(9)} ${f.taskId.padEnd(20)} [${f.rule}]`);
    console.log(`      ${f.detail}`);
  }
  console.log('\nGRADING POLICY AUDIT FAILED — fix the task, not the enforcer (see docs/GRADING_POLICY.md).');
  process.exit(1);
}

console.log('\nAll tasks satisfy the grading policy (static half; run audit:grading-pipeline for the dynamic half).');
