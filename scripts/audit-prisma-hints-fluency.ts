/**
 * scripts/audit-prisma-hints-fluency.ts
 * -----------------------------------------------------------------------------
 * Phase 3 Fluency & Hint Ladder Audit.
 *
 * Enforces the core fluency guarantees across all 89 Prisma tasks:
 *   1. 3-TIER HINT LADDER: Every task must have at least 3 progressive hint tiers:
 *      - Tier 1 (Concept Anchor): Mental model / Query Engine behavior.
 *        STRICT CONTRACT: Zero backticks (`), zero code blocks.
 *      - Tier 2 (Structural Skeleton): Method signature, option layout, or clause order.
 *      - Tier 3 (1-Step-Short Skeleton): Cumulative guidance that stops strictly
 *        one step short of the solution. Never the verbatim solution or copy-paste code.
 *   2. DAILY FROM-SCRATCH REPS: Every module (Days 1–14) must have >= 1 task
 *      flagged with `fromScratch: true` testing blank-slate recall.
 *
 * Exit code 1 on any violation.
 * Run: npm run audit:prisma-hints
 */
import { PRISMA_MODULES } from '../src/content/prisma/prisma-curriculum-index';
import type { PracticeTask, ModuleData } from '../src/types/curriculum';

interface Finding {
  day: number;
  taskId: string;
  kind:
    | 'INSUFFICIENT_HINTS'
    | 'TIER1_CONTAINS_CODE'
    | 'TIER3_REVEALS_SOLUTION'
    | 'TIER3_EQUALS_SNIPPET'
    | 'TIER3_NOT_STOPPING_SHORT'
    | 'NO_FROM_SCRATCH_REP'
    | 'INVALID_FROM_SCRATCH_STARTER';
  detail: string;
}

const findings: Finding[] = [];
let totalTasks = 0;
let tasksWithFromScratch = 0;

function cleanCode(str: string): string {
  return str.replace(/\s+/g, ' ').trim();
}

function auditTask(module: ModuleData, task: PracticeTask) {
  totalTasks++;
  const hints = task.hints ?? [];

  // 1. Hint count check
  if (hints.length < 3) {
    findings.push({
      day: module.day,
      taskId: task.id,
      kind: 'INSUFFICIENT_HINTS',
      detail: `Expected >= 3 hints, found ${hints.length}`,
    });
    return;
  }

  const [t1, t2, t3] = hints;

  // 2. Tier 1: Concept Anchor — strictly zero backticks
  if (t1.text.includes('`')) {
    findings.push({
      day: module.day,
      taskId: task.id,
      kind: 'TIER1_CONTAINS_CODE',
      detail: `Tier 1 contains backticks/code. Concept anchor must be code-free. Found: "${t1.text}"`,
    });
  }

  // 3. Tier 3: Cumulative skeleton — stops 1 step short
  const sol = task.prisma?.solutionCode ?? '';
  const cleanedSol = cleanCode(sol);
  const cleanedT3 = cleanCode(t3.text);

  if (cleanedT3 === cleanedSol || cleanedT3.includes(cleanedSol)) {
    findings.push({
      day: module.day,
      taskId: task.id,
      kind: 'TIER3_REVEALS_SOLUTION',
      detail: `Tier 3 gives away the entire solution verbatim. Must stop 1 step short.`,
    });
  }

  // If snippet lab with required snippet: Tier 3 cannot be identical to the snippet
  const snippets = task.prisma?.validation?.requiredCodeSnippets;
  if (snippets && snippets.length > 0) {
    for (const snip of snippets) {
      if (cleanedT3 === cleanCode(snip)) {
        findings.push({
          day: module.day,
          taskId: task.id,
          kind: 'TIER3_EQUALS_SNIPPET',
          detail: `Tier 3 is identical to required snippet "${snip}". Must stop 1 step short.`,
        });
      }
    }
  }

  // Tier 3 must indicate that the learner completes the final piece (placeholder comment, ..., or missing value)
  const stopsShortMarkers = [
    '/*',
    '//',
    '...',
    'TODO',
    'your',
    'Your',
    'fill',
    'replace',
    'specify',
    'set the',
    'add the',
  ];
  const hasStopShortMarker = stopsShortMarkers.some((m) => t3.text.includes(m));
  if (!hasStopShortMarker) {
    findings.push({
      day: module.day,
      taskId: task.id,
      kind: 'TIER3_NOT_STOPPING_SHORT',
      detail: `Tier 3 does not contain a placeholder comment or stop-short indicator (e.g. /* ... */, // ..., etc). Found: "${t3.text}"`,
    });
  }

  if (task.prisma?.fromScratch) {
    tasksWithFromScratch++;
    // Verify starter code doesn't have the whole solution already filled in
    if (cleanCode(task.prisma.initialCode) === cleanCode(task.prisma.solutionCode)) {
      findings.push({
        day: module.day,
        taskId: task.id,
        kind: 'INVALID_FROM_SCRATCH_STARTER',
        detail: `fromScratch task initialCode equals solutionCode.`,
      });
    }
  }
}

console.log('\n=== Prisma Hints & Fluency Audit (Phase 3) ===');
console.log('Auditing 3-tier cumulative hint ladders and daily from-scratch reps across Days 1–14.\n');

for (const module of PRISMA_MODULES) {
  let moduleFromScratchCount = 0;

  for (const concept of module.concepts) {
    for (const task of concept.tasks ?? []) {
      auditTask(module, task);
      if (task.prisma?.fromScratch) moduleFromScratchCount++;
    }
  }

  for (const task of module.challenge?.tasks ?? []) {
    auditTask(module, task);
    if (task.prisma?.fromScratch) moduleFromScratchCount++;
  }

  if (moduleFromScratchCount === 0) {
    findings.push({
      day: module.day,
      taskId: `Day-${module.day}`,
      kind: 'NO_FROM_SCRATCH_REP',
      detail: `Day ${module.day} has no task with fromScratch: true. Each day requires at least one 5-minute blank-slate rep.`,
    });
  }

  console.log(
    `Day ${String(module.day).padStart(2, ' ')}: ${module.shortTitle.padEnd(35)} (fromScratch reps: ${moduleFromScratchCount})`,
  );
}

console.log('\n--- SUMMARY ---');
console.log(`Total Tasks Audited:       ${totalTasks}`);
console.log(`From-Scratch Reps:         ${tasksWithFromScratch}`);
console.log(`Audit Findings:            ${findings.length}`);

if (findings.length > 0) {
  console.log('\n--- FINDINGS ---');
  for (const f of findings) {
    console.log(`  ✗ Day ${f.day} [${f.taskId}] [${f.kind}]: ${f.detail}`);
  }
  console.log(`\nPRISMA HINTS AUDIT FAILED with ${findings.length} finding(s).`);
  process.exit(1);
}

console.log('\nAll 89 Prisma tasks satisfy 3-tier cumulative hint ladders and daily from-scratch reps!\n');
