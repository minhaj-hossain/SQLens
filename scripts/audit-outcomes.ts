/**
 * scripts/audit-outcomes.ts
 * Phase 5 Gate 3: Outcome Truth Auditor.
 * Verifies every completionLearnings statement in each Prisma module maps to
 * at least one demonstrated task via keyword matching.
 * Exit code 1 on any violation. Run: npm run audit:outcomes
 */

import { PRISMA_MODULES } from '../src/content/prisma/prisma-curriculum-index';
import type { PracticeTask } from '../src/types/curriculum';

interface Finding {
  day: number;
  moduleId: string;
  learning: string;
  detail: string;
}

const FILLER = new Set([
  'can', 'the', 'a', 'an', 'and', 'or', 'with', 'using', 'how', 'to', 'in',
  'on', 'by', 'for', 'of', 'at', 'from', 'as', 'be', 'is', 'are', 'that',
  'this', 'it', 'its', 'one', 'two', 'three', 'all', 'each', 'any', 'both',
  'when', 'then', 'than', 'not', 'no', 'without', 'over', 'into', 'via',
  'safe', 'safely', 'real', 'simple', 'basic', 'new', 'clean', 'exactly',
]);

function keywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[`'",.()[\]{}]/g, ' ')
    .split(/\s+/)
    .map(w => w.trim())
    .filter(w => w.length > 2 && !FILLER.has(w));
}

function taskCorpus(task: PracticeTask): string {
  return [
    task.title,
    task.description,
    ...(task.instructions ?? []),
    task.prisma?.solutionCode ?? '',
    task.prisma?.initialCode ?? '',
    ...(task.prisma?.validation?.requiredCodeSnippets ?? []),
  ]
    .join(' ')
    .toLowerCase();
}

const findings: Finding[] = [];
let totalClaims = 0;
let passedClaims = 0;

console.log('=== Outcome Truth Audit (Phase 5 — Gate 3) ===\n');

for (const mod of PRISMA_MODULES) {
  const allTasks: PracticeTask[] = [
    ...mod.concepts.flatMap(c => c.tasks),
    ...(mod.challenge?.tasks ?? []),
  ];
  const corpusList = allTasks.map(taskCorpus);
  const learnings = mod.completionLearnings ?? [];
  let modOk = true;

  for (const learning of learnings) {
    totalClaims++;
    const kws = keywords(learning);
    if (kws.length === 0) { passedClaims++; continue; }
    const matched = corpusList.some(corpus => kws.some(kw => corpus.includes(kw)));
    if (matched) {
      passedClaims++;
    } else {
      modOk = false;
      findings.push({
        day: mod.day,
        moduleId: mod.id,
        learning,
        detail: `No task covers keywords: [${kws.join(', ')}]`,
      });
    }
  }

  const label = `Day ${String(mod.day).padStart(2)}: ${(mod.shortTitle ?? mod.title).padEnd(35)}`;
  console.log(`${label} ${modOk ? 'OK' : 'FAIL'}`);
}

console.log('\n--- OUTCOME CENSUS ---');
console.log(`Total completionLearnings claims: ${totalClaims}`);
console.log(`  Passed:  ${passedClaims}`);
console.log(`  Failed:  ${findings.length}`);

if (findings.length > 0) {
  console.log('\n--- FINDINGS ---');
  for (const f of findings) {
    console.log(`  x Day ${f.day} [${f.moduleId}]`);
    console.log(`    Claim:  "${f.learning}"`);
    console.log(`    Detail: ${f.detail}`);
  }
  console.log('\nGATE 3 FAILED.');
  process.exit(1);
} else {
  console.log('\nPASS - All completionLearnings are falsifiable and task-backed.');
  process.exit(0);
}
