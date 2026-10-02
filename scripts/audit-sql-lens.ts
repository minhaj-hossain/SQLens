/**
 * scripts/audit-sql-lens.ts
 * Phase 5 Gate 5: SQL Lens Parity Auditor.
 * Verifies all executable tasks produce valid, non-empty SQL via the
 * Prisma SQL generator, and that the SQL executes successfully on SQLite.
 * Exit code 1 on any violation. Run: npm run audit:sql-lens
 */

import { PRISMA_MODULES } from '../src/content/prisma/prisma-curriculum-index';
import { SqlExecutor } from '../src/lib/sql-engine/executor';
import {
  previewPrismaSubmission,
  type PrismaSubmitHooks,
} from '../src/lib/prisma-engine/prisma-submit-pipeline';
import type { PracticeTask } from '../src/types/curriculum';

interface Finding {
  day: number;
  taskId: string;
  dimension: string;
  detail: string;
}

const findings: Finding[] = [];
let totalExecutable = 0;
let passed = 0;

function auditTask(task: PracticeTask, day: number) {
  if (task.gradingType !== 'executable') return;
  totalExecutable++;

  const p = task.prisma;
  if (!p) {
    findings.push({
      day,
      taskId: task.id,
      dimension: 'PRISMA_BLOCK',
      detail: 'Missing task.prisma block on executable task.',
    });
    return;
  }

  const ex = new SqlExecutor();
  const hooks: PrismaSubmitHooks = {
    execute: (sql: string) => ex.executeQuery(sql),
    resetDatabase: () => ex.resetDatabase?.(),
  };

  const preview = previewPrismaSubmission({
    task,
    code: p.solutionCode,
    hooks,
  });

  if (!preview.ok) {
    findings.push({
      day,
      taskId: task.id,
      dimension: '5:SQL_GENERATE',
      detail: `SQL generation failed: ${preview.reason ?? 'unknown reason'}. Reclassify as snippet-lab or fix solutionCode.`,
    });
    return;
  }

  if (!preview.steps || preview.steps.length === 0) {
    findings.push({
      day,
      taskId: task.id,
      dimension: '5:SQL_STEPS',
      detail: 'previewPrismaSubmission returned ok: true but no execution steps were generated.',
    });
    return;
  }

  const isExpectFailure = task.validation?.expectFailure || p.validation?.expectFailure;

  if (isExpectFailure) {
    const anyFailed = preview.steps.some((s) => !s.result?.success);
    if (!anyFailed) {
      findings.push({
        day,
        taskId: task.id,
        dimension: '5:SQL_EXPECT_FAIL',
        detail: 'Task has expectFailure set, but all generated statements succeeded.',
      });
      return;
    }
    passed++;
    return;
  }

  // Normal execution verification
  for (const step of preview.steps) {
    if (!step.sql?.trim()) {
      findings.push({
        day,
        taskId: task.id,
        dimension: '5:SQL_EMPTY',
        detail: `Step "${step.label}" has empty SQL.`,
      });
      return;
    }

    if (!step.result?.success) {
      findings.push({
        day,
        taskId: task.id,
        dimension: '5:SQL_EXECUTE',
        detail: `Step "${step.label}" failed on SQLite: ${step.result?.error}\nSQL: ${step.sql}`,
      });
      return;
    }
  }

  // Row count check if defined
  const expectedCount = p.validation?.expectedRowCount;
  if (typeof expectedCount === 'number') {
    const mainStep =
      [...preview.steps].reverse().find((s) => (s.role ?? 'main') !== 'relation') ??
      preview.steps[preview.steps.length - 1];
    const actualCount =
      typeof mainStep.result?.affectedRows === 'number'
        ? mainStep.result.affectedRows
        : (mainStep.result?.rows?.length ?? 0);
    if (actualCount !== expectedCount) {
      findings.push({
        day,
        taskId: task.id,
        dimension: '5:ROW_COUNT',
        detail: `Expected ${expectedCount} rows, got ${actualCount}. Step: "${mainStep.label}", SQL: ${mainStep.sql}`,
      });
      return;
    }
  }

  passed++;
}

console.log('=== SQL Lens Parity Audit (Phase 5 — Gate 5) ===\n');

for (const mod of PRISMA_MODULES) {
  for (const c of mod.concepts) {
    for (const t of c.tasks) auditTask(t, mod.day);
  }
  for (const t of mod.challenge?.tasks ?? []) auditTask(t, mod.day);

  const modFindings = findings.filter((f) =>
    f.taskId.startsWith(`prisma${String(mod.day).padStart(2, '0')}`)
  ).length;
  const label = `Day ${String(mod.day).padStart(2)}: ${(mod.shortTitle ?? mod.title).padEnd(35)}`;
  console.log(`${label} ${modFindings === 0 ? 'OK' : `FAIL (${modFindings} finding(s))`}`);
}

console.log('\n--- SQL LENS CENSUS ---');
console.log(`Executable tasks audited: ${totalExecutable}`);
console.log(`  Passed:  ${passed}`);
console.log(`  Failed:  ${findings.length}`);

if (findings.length > 0) {
  console.log('\n--- FINDINGS ---');
  for (const f of findings) {
    console.log(`  x Day ${f.day} [${f.dimension}] ${f.taskId}:`);
    console.log(`    ${f.detail}`);
  }
  console.log('\nGATE 5 FAILED — all executable tasks must produce valid SQL.');
  process.exit(1);
} else {
  console.log('\nPASS - All executable tasks produce valid SQL via the SQL generator.');
  process.exit(0);
}
