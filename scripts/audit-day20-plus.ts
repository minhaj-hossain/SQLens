import { ALL_MODULES } from '../src/content/curriculum-index';
import { SqlExecutor } from '../src/lib/sql-engine/executor';
import { runAndGradeSubmission } from '../src/lib/sql-engine/submit-pipeline';
import { DATABASE_SCHEMAS } from '../src/content/database/schema';
import { INITIAL_TABLES } from '../src/content/database/tables';
import { PracticeTask, ModuleData } from '../src/types/curriculum';

interface TaskFinding {
  day: number;
  moduleId: string;
  taskId: string;
  taskTitle: string;
  type: string;
  lifecycle?: string;
  isDdl: boolean;
  isDml: boolean;
  primaryTable: string;
  primaryTableInSchema: boolean;
  issues: string[];
}

const findings: TaskFinding[] = [];

console.log('=== AUDITING DAY 20 TO DAY 38 ===\n');

for (const mod of ALL_MODULES) {
  if (mod.day < 20) continue;

  const sessionExec = new SqlExecutor();
  sessionExec.allowDdlOverwrite = true;

  const allModTasks: { task: PracticeTask; where: string }[] = [];
  for (const c of mod.concepts) {
    for (const t of c.tasks || []) {
      allModTasks.push({ task: t, where: `Concept: ${c.title}` });
    }
  }
  if (mod.challenge) {
    for (const t of mod.challenge.tasks || []) {
      allModTasks.push({ task: t, where: 'Challenge' });
    }
  }

  for (const { task, where } of allModTasks) {
    const issues: string[] = [];
    const isDdl = /CREATE\s+TABLE|ALTER\s+TABLE|DROP\s+TABLE|CREATE\s+(?:UNIQUE\s+)?INDEX|DROP\s+INDEX/i.test(task.solutionSql);
    const isDml = /INSERT\s+INTO|UPDATE\s+|DELETE\s+FROM/i.test(task.solutionSql);
    const primaryTableLower = (task.primaryTable || '').toLowerCase();
    const liveSchemas = sessionExec.getDatabaseState().schemas || {};
    const primaryTableInSchema = !!DATABASE_SCHEMAS[primaryTableLower] || !!liveSchemas[primaryTableLower];

    // 1. DDL Double Execution check: what happens if learner clicks Run Preview, then Check Answer?
    if (isDdl) {
      const exec = new SqlExecutor();
      exec.allowDdlOverwrite = true;
      try {
        // Run 1: Preview
        const previewRes = exec.executeQuery(task.solutionSql);
        if (!previewRes.success) {
          issues.push(`DDL preview execution failed: ${previewRes.error}`);
        } else {
          // Run 2: Submitting without reset (simulating Run Preview then Check Answer without fresh lifecycle)
          const submitRes = exec.executeQuery(task.solutionSql);
          if (!submitRes.success && task.databaseLifecycle !== 'fresh') {
            issues.push(`IDEMPOTENCY TRAP: Re-executing DDL fails with "${submitRes.error}" (databaseLifecycle is ${task.databaseLifecycle ?? 'undefined'}). A user clicking Run then Check will fail!`);
          }
        }
      } catch (err: any) {
        issues.push(`DDL threw exception on execute: ${err.message}`);
      }
    }

    // 2. Primary table existence in DATABASE_SCHEMAS vs DatabaseExplorer
    if (!primaryTableInSchema && !isDdl) {
      // Is it a table created in a previous task?
      issues.push(`primaryTable '${task.primaryTable}' does not exist in DATABASE_SCHEMAS`);
    }

    // 3. Phrasing / Weird sentencing check
    const textToCheck = `${task.title} ${task.description} ${task.instructions.join(' ')}`;
    // Check for weird phrases, typo patterns, unprofessional text, placeholder words
    if (/lorem|todo|tbd|fixme|dummy|asdf/i.test(textToCheck)) {
      issues.push(`Contains placeholder/TODO text`);
    }
    if (/\b(?:wanna|gonna|dunno|ain't)\b/i.test(textToCheck)) {
      issues.push(`Unprofessional colloquialism detected`);
    }
    if (/\?\s*\?/i.test(textToCheck) || /!\s*!/i.test(textToCheck)) {
      issues.push(`Punctuation anomaly (?? or !!)`);
    }
    if (task.instructions.some(inst => inst.trim().length === 0)) {
      issues.push(`Empty instruction line`);
    }
    if (!task.description || task.description.trim().length < 15) {
      issues.push(`Very short or missing description`);
    }
    if (task.instructions.length === 0) {
      issues.push(`No instructions provided`);
    }
    if (!task.solutionExplanation || task.solutionExplanation.trim().length < 15) {
      issues.push(`Missing or very short solutionExplanation`);
    }

    // 4. Verification of submit pipeline
    try {
      const outcome = runAndGradeSubmission({
        task,
        sql: task.solutionSql,
        hooks: {
          execute: (s) => sessionExec.executeQuery(s),
          getDatabaseState: () => sessionExec.getDatabaseState(),
          getCommittedState: () => sessionExec.getCommittedState(),
          getTransactionState: () => sessionExec.getTransactionState(),
          resetDatabase: () => sessionExec.resetDatabase(),
        },
        surface: 'lesson',
        record: false,
      });

      if (!outcome.passed) {
        issues.push(`submit-pipeline failed for solutionSql: ${outcome.feedback}`);
      }
    } catch (err: any) {
      issues.push(`submit-pipeline threw exception: ${err.message}`);
    }

    findings.push({
      day: mod.day,
      moduleId: mod.id,
      taskId: task.id,
      taskTitle: task.title,
      type: where,
      lifecycle: task.databaseLifecycle,
      isDdl,
      isDml,
      primaryTable: task.primaryTable,
      primaryTableInSchema,
      issues,
    });
  }
}

// Print findings summary
console.log(`Total tasks audited (Days 20-38): ${findings.length}`);
const withIssues = findings.filter(f => f.issues.length > 0);
console.log(`Tasks with flagged issues: ${withIssues.length}\n`);

for (const f of withIssues) {
  console.log(`[Day ${f.day}] [${f.taskId}] "${f.taskTitle}" (${f.type})`);
  for (const iss of f.issues) {
    console.log(`   ⚠️  ${iss}`);
  }
}
