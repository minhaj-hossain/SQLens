/**
 * scripts/audit-assess-coverage.ts
 * Phase 5 Gate 4: Diagnostic Presence Auditor.
 * Verifies that every core section day (Days 7-14) contains at least one
 * task with skillType === "assess".
 * Exit code 1 on any violation. Run: npm run audit:assess
 */

import { PRISMA_MODULES } from '../src/content/prisma/prisma-curriculum-index';

const CORE_DAYS = [7, 8, 9, 10, 11, 12, 13, 14];

interface Finding {
  day: number;
  moduleId: string;
  detail: string;
}

const findings: Finding[] = [];

console.log('=== Diagnostic Assess Coverage Audit (Phase 5 — Gate 4) ===\n');

for (const mod of PRISMA_MODULES) {
  if (!CORE_DAYS.includes(mod.day)) {
    const label = `Day ${String(mod.day).padStart(2)}: ${(mod.shortTitle ?? mod.title).padEnd(35)}`;
    console.log(`${label} SKIP (non-core)`);
    continue;
  }

  const allTasks = [
    ...mod.concepts.flatMap(c => c.tasks),
    ...(mod.challenge?.tasks ?? []),
  ];

  const assessTasks = allTasks.filter(t => t.skillType === 'assess');
  const label = `Day ${String(mod.day).padStart(2)}: ${(mod.shortTitle ?? mod.title).padEnd(35)}`;

  if (assessTasks.length === 0) {
    findings.push({
      day: mod.day,
      moduleId: mod.id,
      detail: `No task with skillType: 'assess' found in ${allTasks.length} tasks.`,
    });
    console.log(`${label} FAIL`);
  } else {
    console.log(`${label} OK  (${assessTasks.length} assess task(s): ${assessTasks.map(t => t.id).join(', ')})`);
  }
}

console.log('\n--- ASSESS COVERAGE CENSUS ---');
console.log(`Core section days checked: ${CORE_DAYS.join(', ')}`);
console.log(`Days failing Gate 4:       ${findings.length}`);

if (findings.length > 0) {
  console.log('\n--- FINDINGS ---');
  for (const f of findings) {
    console.log(`  x Day ${f.day} [${f.moduleId}]: ${f.detail}`);
  }
  console.log('\nGATE 4 FAILED — each core section day must have >= 1 assess task.');
  process.exit(1);
} else {
  console.log('\nPASS - All core section days (7-14) contain >= 1 assess task.');
  process.exit(0);
}
