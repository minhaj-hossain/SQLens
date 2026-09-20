/**
 * scripts/audit-taught-before-tested.ts
 * -----------------------------------------------------------------------------
 * Batch 2 gate: every construct a task's solution uses must be TAUGHT (shown in
 * theory CODE — never prose) by the task's own or an earlier concept, and every
 * value the grader enforces must appear in the RENDERED prompt
 * (title/description/instructions/scenario — never hints/solution).
 *
 * Motivating bugs: Day 26 `tx-c1-t2`/`tx-hw-2` require multi-row
 * `VALUES (...), (...)` that no earlier theory teaches; Day 26 `tx-c1-t1`
 * graded `'Flash Sale Mouse', ...` while the visible prompt said "one
 * flash-sale product".
 *
 * Run: npx tsx scripts/audit-taught-before-tested.ts
 */
import { ALL_MODULES } from '../src/content/curriculum-index';
import { auditTaughtBeforeTested } from '../src/lib/curriculum/taught-before-tested';

console.log('\n=== Taught-before-tested audit (Batch 2) ===');
console.log('Every solution construct must be taught in theory code; every enforced value must be visible.\n');

const { checked, findings } = auditTaughtBeforeTested(ALL_MODULES);

const constructs = findings.filter((f) => f.kind === 'construct');
const literals = findings.filter((f) => f.kind === 'literal');

console.log('--- CENSUS ---');
console.log(`Tasks checked:            ${checked}`);
console.log(`Construct findings:       ${constructs.length}`);
console.log(`Literal findings:         ${literals.length}`);
console.log(`Total findings:           ${findings.length}`);

if (findings.length) {
  console.log('\n--- FINDINGS (construct: untaught syntax) ---');
  for (const f of constructs.slice(0, 60)) {
    console.log(`  ✗ Day ${f.day} ${f.where.padEnd(9)} ${f.taskId.padEnd(20)} [${f.constructId}]`);
    console.log(`      ${f.detail}`);
  }
  console.log('\n--- FINDINGS (literal: enforced value never shown) ---');
  for (const f of literals.slice(0, 60)) {
    console.log(`  ✗ Day ${f.day} ${f.where.padEnd(9)} ${f.taskId.padEnd(20)}`);
    console.log(`      ${f.detail}`);
  }
  console.log('\nTAUGHT-BEFORE-TESTED AUDIT FAILED — teach first, then test (see Batch 2 plan).');
  process.exit(1);
}

console.log('\nAll tasks test only what the curriculum teaches, with visible values.');
