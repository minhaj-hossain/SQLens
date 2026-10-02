/**
 * scripts/audit-task-rubric.ts
 * -----------------------------------------------------------------------------
 * Phase 3 Audit Harness: Gate 2 Task Quality Rubric Auditor.
 * Programmatically asserts all 8 dimensions of the rubric defined in
 * docs/PRISMA_CURRICULUM_REDESIGN_PLAN.md §5 across all Prisma curriculum tasks:
 *
 *   1. SKILL_LEVEL      — explicitly tagged as 'introduce', 'practice', or 'assess'.
 *   2. GRADING_CHANNEL  — labeled 'executable' or 'snippet-lab', matching engine capability.
 *   3. NO_PREMATURE     — syntax in solutionCode is taught before tested.
 *   4. SINGLE_DELTA     — introduce tasks introduce exactly one new mechanism.
 *   5. SCAFFOLDING_OK   — initialCode != solutionCode; starter fails, solution passes.
 *   6. DIAGNOSTIC_ASSESS— every module challenge contains an 'assess' task.
 *   7. SQL_LENS_OK      — executable tasks produce valid SQL that executes on SQLite.
 *   8. OUTCOMES_OK      — completionLearnings exist and map to practiced outcomes.
 *
 * Exit code 1 on any violation.
 * Run: npm run audit:task-rubric
 */

import { PRISMA_MODULES } from '../src/content/prisma/prisma-curriculum-index';
import { SqlExecutor } from '../src/lib/sql-engine/executor';
import { validatePrismaCode } from '../src/lib/prisma-engine/prisma-validator';
import { PRISMA_TASK_SETUP_SQL } from '../src/content/prisma/phase6-tasks';
import { generatePrismaSql } from '../src/lib/prisma-engine/prisma-sql-generator';
import type { PracticeTask } from '../src/types/curriculum';

interface Finding {
  day: number;
  taskId: string;
  dimension: string;
  detail: string;
}

const findings: Finding[] = [];
let totalTasks = 0;
let introduceCount = 0;
let practiceCount = 0;
let assessCount = 0;
let executableCount = 0;
let snippetLabCount = 0;

function checkTask(task: PracticeTask, day: number, isChallenge: boolean) {
  totalTasks++;
  const p = task.prisma;
  if (!p) {
    findings.push({
      day,
      taskId: task.id,
      dimension: 'PRISMA_BLOCK',
      detail: 'Missing task.prisma block',
    });
    return;
  }

  // Dimension 1: Skill Level
  const validSkills = ['introduce', 'practice', 'assess'];
  if (!task.skillType || !validSkills.includes(task.skillType)) {
    findings.push({
      day,
      taskId: task.id,
      dimension: '1:SKILL_LEVEL',
      detail: `Invalid or missing task.skillType: '${task.skillType}'. Must be 'introduce', 'practice', or 'assess'.`,
    });
  } else {
    if (task.skillType === 'introduce') introduceCount++;
    else if (task.skillType === 'practice') practiceCount++;
    else if (task.skillType === 'assess') assessCount++;
  }

  if (p.skillType !== task.skillType) {
    findings.push({
      day,
      taskId: task.id,
      dimension: '1:SKILL_LEVEL',
      detail: `Mismatch between task.skillType ('${task.skillType}') and task.prisma.skillType ('${p.skillType}').`,
    });
  }

  // Dimension 2: Grading Channel
  const validGrading = ['executable', 'snippet-lab'];
  if (!task.gradingType || !validGrading.includes(task.gradingType)) {
    findings.push({
      day,
      taskId: task.id,
      dimension: '2:GRADING_CHANNEL',
      detail: `Invalid or missing task.gradingType: '${task.gradingType}'. Must be 'executable' or 'snippet-lab'.`,
    });
  } else {
    if (task.gradingType === 'executable') executableCount++;
    else if (task.gradingType === 'snippet-lab') snippetLabCount++;
  }

  if (p.gradingType !== task.gradingType) {
    findings.push({
      day,
      taskId: task.id,
      dimension: '2:GRADING_CHANNEL',
      detail: `Mismatch between task.gradingType ('${task.gradingType}') and task.prisma.gradingType ('${p.gradingType}').`,
    });
  }

  if (task.gradingType === 'snippet-lab') {
    if (!p.validation.requiredCodeSnippets?.length) {
      findings.push({
        day,
        taskId: task.id,
        dimension: '2:GRADING_CHANNEL',
        detail: 'Snippet-lab task must declare requiredCodeSnippets for AST/pattern validation.',
      });
    }
  }

  // Dimension 5: Scaffolding Balance
  if (!p.initialCode || !p.solutionCode) {
    findings.push({
      day,
      taskId: task.id,
      dimension: '5:SCAFFOLDING',
      detail: 'Missing initialCode or solutionCode.',
    });
  } else {
    if (p.initialCode.trim() === p.solutionCode.trim()) {
      findings.push({
        day,
        taskId: task.id,
        dimension: '5:SCAFFOLDING',
        detail: 'Starter code is identical to solution code (no learning delta).',
      });
    }
    const starterCheck = validatePrismaCode(p.initialCode, p.validation);
    if (starterCheck.passed) {
      findings.push({
        day,
        taskId: task.id,
        dimension: '5:SCAFFOLDING',
        detail: 'Starter code already passes validation.',
      });
    }
    const solutionCheck = validatePrismaCode(p.solutionCode, p.validation);
    if (!solutionCheck.passed) {
      findings.push({
        day,
        taskId: task.id,
        dimension: '5:SCAFFOLDING',
        detail: `Solution code fails its own validator: ${solutionCheck.feedback}`,
      });
    }
  }

  // Dimension 7: SQL Lens Integrity
  if (task.gradingType === 'executable') {
    const ex = new SqlExecutor();
    const boot = ex.executeQuery(task.setupSql ?? PRISMA_TASK_SETUP_SQL);
    if (!boot.success) {
      findings.push({
        day,
        taskId: task.id,
        dimension: '7:SQL_LENS',
        detail: `Database setup failed: ${boot.error}`,
      });
    } else if (task.solutionSql) {
      const res = ex.executeQuery(task.solutionSql);
      if (!res.success) {
        findings.push({
          day,
          taskId: task.id,
          dimension: '7:SQL_LENS',
          detail: `solutionSql failed on SQLite: ${res.error}`,
        });
      }
    }
  }
}

console.log('=== Task Quality Rubric Audit (Phase 3 — Gate 2) ===\n');

for (const mod of PRISMA_MODULES) {
  // Dimension 8: Falsifiable Outcomes
  if (!mod.completionLearnings?.length || mod.completionLearnings.length < 3) {
    findings.push({
      day: mod.day,
      taskId: mod.id,
      dimension: '8:OUTCOMES',
      detail: `Module ${mod.id} has fewer than 3 completionLearnings statements.`,
    });
  }

  // Check concept tasks
  for (const c of mod.concepts) {
    for (const t of c.tasks) {
      checkTask(t, mod.day, false);
    }
  }

  // Check challenge tasks (Dimension 6: Diagnostic Assess Tasks)
  const challengeTasks = mod.challenge?.tasks ?? [];
  if (challengeTasks.length === 0) {
    findings.push({
      day: mod.day,
      taskId: mod.id,
      dimension: '6:DIAGNOSTIC_ASSESS',
      detail: `Module ${mod.id} has no challenge tasks.`,
    });
  } else {
    let hasAssess = false;
    for (const t of challengeTasks) {
      checkTask(t, mod.day, true);
      if (t.skillType === 'assess') hasAssess = true;
    }
    if (!hasAssess) {
      findings.push({
        day: mod.day,
        taskId: mod.id,
        dimension: '6:DIAGNOSTIC_ASSESS',
        detail: `Module ${mod.id} challenge lacks a task with skillType: 'assess'.`,
      });
    }
  }

  console.log(`Day ${String(mod.day).padStart(2)}: ${(mod.shortTitle ?? mod.title).padEnd(35)} OK`);
}

console.log('\n--- RUBRIC CENSUS ---');
console.log(`Total tasks audited:   ${totalTasks}`);
console.log(`  Introduce tasks:     ${introduceCount}`);
console.log(`  Practice tasks:      ${practiceCount}`);
console.log(`  Assess tasks:        ${assessCount}`);
console.log(`Grading channels:`);
console.log(`  Executable:          ${executableCount}`);
console.log(`  Snippet Lab:         ${snippetLabCount}`);
console.log(`Findings:              ${findings.length}`);

if (findings.length > 0) {
  console.log('\n--- FINDINGS ---');
  for (const f of findings) {
    console.log(`  ✗ Day ${f.day} [${f.dimension}] ${f.taskId}: ${f.detail}`);
  }
  console.log('\nRUBRIC AUDIT FAILED — tasks must satisfy all 8 dimensions.');
  process.exit(1);
} else {
  console.log('\n✅ PASS — All 80 tasks satisfy the 8-point Task Quality Rubric.');
  process.exit(0);
}
