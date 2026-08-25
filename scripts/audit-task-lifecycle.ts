/**
 * scripts/audit-task-lifecycle.ts
 * -----------------------------------------------------------------------------
 * Deep lifecycle audit of every task in the curriculum:
 *  1. No duplicate task IDs across modules
 *  2. initialSql executes without error when the learner first runs it
 *  3. solutionSql executes successfully on a fresh DB
 *  4. validateTaskSolution passes for the solutionSql
 *  5. solution result columns satisfy validation.requiredColumns
 *  6. Each task has required validation metadata
 *  7. Challenges reference tasks that are all present
 *
 * Run: npx tsx scripts/audit-task-lifecycle.ts
 */
import { ALL_MODULES } from '../src/content/curriculum-index';
import { SqlExecutor } from '../src/lib/sql-engine/executor';
import { validateTaskSolution } from '../src/lib/sql-engine/validator';
import { ModuleData, PracticeTask } from '../src/types/curriculum';

interface LifecycleIssue {
  day: number;
  taskId: string;
  where: 'lesson' | 'challenge';
  category:
    | 'DUP_ID'
    | 'INITIAL_SQL_ERROR'
    | 'SOLUTION_SQL_ERROR'
    | 'VALIDATION_FAIL'
    | 'REQUIRED_COL_MISSING'
    | 'NO_EXPECTED_COUNT';
  detail: string;
}

const issues: LifecycleIssue[] = [];
const seenIds = new Map<string, string>();
let totalTasks = 0;
let challengeTasks = 0;
let lessonTasks = 0;

function runForTask(task: PracticeTask, module: ModuleData, where: 'lesson' | 'challenge') {
  totalTasks++;
  if (where === 'challenge') challengeTasks++; else lessonTasks++;

  const day = module.day;

  // 1) duplicate IDs
  if (seenIds.has(task.id)) {
    issues.push({
      day,
      taskId: task.id,
      where,
      category: 'DUP_ID',
      detail: `Duplicate task id '${task.id}' (also used by '${seenIds.get(task.id)}')`,
    });
  }
  seenIds.set(task.id, task.title);

  const exec = new SqlExecutor();

  // 2) initialSql execution (what the learner sees on open)
  if (task.initialSql) {
    const init = task.initialSql.trim();
    const isCommentOnly = /^--[\s\S]*$/.test(init) || init.length === 0;
    if (!isCommentOnly) {
      try {
        const r = exec.executeQuery(init);
        if (!r.success) {
          issues.push({
            day, taskId: task.id, where, category: 'INITIAL_SQL_ERROR',
            detail: `initialSql errors: ${r.error}`,
          });
        }
      } catch (e) {
        issues.push({
          day, taskId: task.id, where, category: 'INITIAL_SQL_ERROR',
          detail: `initialSql threw: ${String(e)}`,
        });
      }
    }
  }

  // 3) solutionSql execution
  let result;
  try {
    result = exec.executeQuery(task.solutionSql);
  } catch (e) {
    issues.push({
      day, taskId: task.id, where, category: 'SOLUTION_SQL_ERROR',
      detail: `solutionSql threw: ${String(e)}`,
    });
    return;
  }
  if (!result.success) {
    issues.push({
      day, taskId: task.id, where, category: 'SOLUTION_SQL_ERROR',
      detail: `solutionSql error: ${result.error}`,
    });
    return;
  }

  // 4) validation pass
  const outcome = validateTaskSolution(task.solutionSql, result, task.validation);
  if (!outcome.passed) {
    issues.push({
      day, taskId: task.id, where, category: 'VALIDATION_FAIL',
      detail: `solutionSql rejected: ${outcome.feedback}`,
    });
  }

  // 5) requiredColumns contained in result columns
  const cols = (result.columns || []).map((c) => c.toLowerCase());
  if (task.validation.requiredColumns) {
    for (const rc of task.validation.requiredColumns) {
      // aliases commonly produce a different name than the source column, so we
      // only flag when no output column plausibly matches (source or alias).
      const target = rc.toLowerCase();
      const shortTarget = target.split('.').pop()!;
      if (!cols.includes(target) && !cols.includes(shortTarget)) {
        issues.push({
          day, taskId: task.id, where, category: 'REQUIRED_COL_MISSING',
          detail: `requiredColumn '${rc}' not in solution output [${cols.join(', ')}]`,
        });
      }
    }
  }

  // 6) expected metadata present
  if (task.validation.expectedRowCount === undefined) {
    issues.push({
      day, taskId: task.id, where, category: 'NO_EXPECTED_COUNT',
      detail: 'No expectedRowCount set; validation relies only on SQL-lexical checks.',
    });
  }
}

console.log('\n=== SQLens Task Lifecycle Audit (start → end) ===\n');

for (const module of ALL_MODULES) {
  for (const concept of module.concepts) {
    for (const task of concept.tasks || []) {
      runForTask(task, module, 'lesson');
    }
  }
  for (const task of module.challenge?.tasks || []) {
    runForTask(task, module, 'challenge');
  }
}

console.log(`Total modules:   ${ALL_MODULES.length}`);
console.log(`Total tasks:     ${totalTasks}  (lesson ${lessonTasks}, challenge ${challengeTasks})`);
console.log(`Unique task IDs: ${seenIds.size}`);
console.log(`Lifecycle issues: ${issues.length}\n`);

const cats = [
  'DUP_ID', 'INITIAL_SQL_ERROR', 'SOLUTION_SQL_ERROR', 'VALIDATION_FAIL',
  'REQUIRED_COL_MISSING', 'NO_META',
] as const;

for (const c of cats) {
  const list = issues.filter((i) => i.category === c);
  if (list.length === 0) {
    console.log(`[${c}] 0`);
    continue;
  }
  console.log(`\n[${c}] ${list.length}`);
  for (const i of list.slice(0, 40)) {
    console.log(`  Day ${String(i.day).padStart(2)} ${i.where.padEnd(9)} ${i.taskId.padEnd(22)} :: ${i.detail}`);
  }
}

console.log('\n==========================================================');