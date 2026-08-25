/**
 * scripts/audit-all-tasks.ts
 * -----------------------------------------------------------------------------
 * Executes EVERY practice + challenge task in the curriculum through the real
 * SqlExecutor and validateTaskSolution — exactly the path the UI uses — and
 * reports per-day pass/fail with reasons.
 *
 * Run: npx tsx scripts/audit-all-tasks.ts
 */
import { ALL_MODULES } from '../src/content/curriculum-index';
import { SqlExecutor } from '../src/lib/sql-engine/executor';
import { validateTaskSolution } from '../src/lib/sql-engine/validator';
import { ModuleData, PracticeTask } from '../src/types/curriculum';
import { INITIAL_TABLES } from '../src/content/database/tables';

interface AuditIssue {
  day: number;
  taskId: string;
  title: string;
  where: 'lesson' | 'challenge';
  kind: 'EXEC_ERROR' | 'VALIDATION_FAIL' | 'ROWCOUNT_MISMATCH' | 'MASKED_PASS';
  detail: string;
  expected?: string;
  actual?: number;
}

const issues: AuditIssue[] = [];
let totalTasks = 0;
let passedTasks = 0;

function formatExpected(e: PracticeTask['validation']['expectedRowCount']): string {
  if (e === undefined) return '<none>';
  if (typeof e === 'number') return String(e);
  if (typeof e === 'object') {
    const parts: string[] = [];
    if (e.min !== undefined) parts.push(`min:${e.min}`);
    if (e.max !== undefined) parts.push(`max:${e.max}`);
    return `{${parts.join(', ')}}`;
  }
  return '<none>';
}

function auditTask(task: PracticeTask, module: ModuleData, where: 'lesson' | 'challenge') {
  totalTasks++;
  const exec = new SqlExecutor();

  let result;
  try {
    result = exec.executeQuery(task.solutionSql);
  } catch (e) {
    issues.push({
      day: module.day,
      taskId: task.id,
      title: task.title,
      where,
      kind: 'EXEC_ERROR',
      detail: e instanceof Error ? e.message : String(e),
      expected: formatExpected(task.validation.expectedRowCount),
    });
    return;
  }

  if (!result.success) {
    issues.push({
      day: module.day,
      taskId: task.id,
      title: task.title,
      where,
      kind: 'EXEC_ERROR',
      detail: result.error || 'Unknown execution error',
      expected: formatExpected(task.validation.expectedRowCount),
      actual: result.rowCount,
    });
    return;
  }

  const outcome = validateTaskSolution(task.solutionSql, result, task.validation);

  if (outcome.passed) {
    passedTasks++;

    // ---- MASKED-PASS DETECTION ---------------------------------------------
    // A task whose solution contains `NOT (...)` LIKELY passes for the wrong
    // reason: if the engine drops the condition (falls through to `return true`)
    // the query returns the FULL table. We flag it when that happens.
    const upper = task.solutionSql.toUpperCase();
    const hasNotParen = /\bNOT\s*\(/.test(upper);
    if (hasNotParen && result.rowCount > 0) {
      const tbl =
        task.primaryTable?.toLowerCase() || result.columns.find((c) => !!INITIAL_TABLES[c])?.toLowerCase();
      const fullLen = tbl && INITIAL_TABLES[tbl] ? INITIAL_TABLES[tbl].length : 0;
      if (fullLen > 0 && result.rowCount === fullLen) {
        issues.push({
          day: module.day,
          taskId: task.id,
          title: task.title,
          where,
          kind: 'MASKED_PASS',
          detail: `Solution uses "NOT (...)" but query returned the ENTIRE table (${fullLen} rows) — possible evaluateWhere fall-through.`,
          actual: result.rowCount,
        });
      }
    }
    return;
  }

  const expected = typeof task.validation.expectedRowCount;
  const isDml = /^(UPDATE|DELETE|INSERT)\b/i.test(task.solutionSql.trim());
  const isRowMismatch =
    expected === 'number' &&
    task.validation.expectedRowCount !== result.rowCount;

  // For DML, the executor returns rowCount:1 (a status row), but tasks that set
  // a numeric expectedRowCount likely intend "number of affected rows" — which
  // is exposed as result.affectedRows. Flag that distinction for the audit.
  let detail = outcome.feedback;
  if (isDml && result.affectedRows !== undefined) {
    detail =
      `DML: rowCount=${result.rowCount} (status row), affectedRows=${result.affectedRows}. ` +
      outcome.feedback;
  }

  issues.push({
    day: module.day,
    taskId: task.id,
    title: task.title,
    where,
    kind: isRowMismatch ? 'ROWCOUNT_MISMATCH' : 'VALIDATION_FAIL',
    detail,
    expected: formatExpected(task.validation.expectedRowCount),
    actual: result.rowCount,
  });
}

console.log('\n=== SQLens Full-Task Audit (solution execution + validation) ===\n');

for (const module of ALL_MODULES) {
  const before = totalTasks;
  for (const concept of module.concepts) {
    for (const task of concept.tasks || []) {
      auditTask(task, module, 'lesson');
    }
  }
  for (const task of module.challenge?.tasks || []) {
    auditTask(task, module, 'challenge');
  }
  const dayTotal = totalTasks - before;
  const dayIssues = issues.filter((i) => i.day === module.day);
  const dayPass = dayTotal - dayIssues.length;
  const flag = dayIssues.length === 0 ? 'OK' : 'ISSUES';
  console.log(
    `Day ${String(module.day).padStart(2, ' ')}: ${module.shortTitle.padEnd(40)} ` +
      `[${String(dayTotal).padStart(2)} tasks | ${String(dayPass).padStart(2)} pass | ${String(dayIssues.length).padStart(2)} fail] ${flag}`
  );
}

console.log('\n--- SUMMARY ---');
console.log(`Total tasks: ${totalTasks}`);
console.log(`Passed:      ${passedTasks}`);
console.log(`Failed:      ${issues.length}`);
console.log(`Failure rate: ${((issues.length / totalTasks) * 100).toFixed(1)}%`);

console.log('\n--- FAILURES (detail) ---');
const rowOnly = issues.filter((i) => i.kind === 'ROWCOUNT_MISMATCH');
console.log(`\n[Row-Count mismatches: ${rowOnly.length}]`);
for (const i of rowOnly.slice(0, 60)) {
  console.log(
    `  Day ${i.day} ${i.where.padEnd(9)} ${i.taskId.padEnd(20)} expected=${i.expected} actual=${i.actual} :: ${i.title}`
  );
}
const execFail = issues.filter((i) => i.kind === 'EXEC_ERROR');
console.log(`\n[Execution errors: ${execFail.length}]`);
for (const i of execFail.slice(0, 60)) {
  console.log(`  Day ${i.day} ${i.where.padEnd(9)} ${i.taskId.padEnd(20)} :: ${i.detail}`);
}
const valFail = issues.filter((i) => i.kind === 'VALIDATION_FAIL');
console.log(`\n[Other validation failures: ${valFail.length}]`);
for (const i of valFail.slice(0, 60)) {
  console.log(`  Day ${i.day} ${i.where.padEnd(9)} ${i.taskId.padEnd(20)} :: ${i.detail}`);
}
const masked = issues.filter((i) => i.kind === 'MASKED_PASS');
console.log(`\n[Masked passes (NOT fall-through suspicion — passes for the wrong reason): ${masked.length}]`);
for (const i of masked.slice(0, 60)) {
  console.log(`  Day ${i.day} ${i.where.padEnd(9)} ${i.taskId.padEnd(20)} expected=${i.expected} actual=${i.actual} :: ${i.detail}`);
}

console.log('\n==========================================================');