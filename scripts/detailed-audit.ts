import { ALL_MODULES } from '../src/content/curriculum-index';
import { DATABASE_SCHEMAS } from '../src/content/database/schema';

console.log('=== DETAILED AUDIT FOR DAYS 20 TO 38 ===\n');

for (const m of ALL_MODULES) {
  if (m.day < 20) continue;
  console.log(`\n------------------------------------------------------------`);
  console.log(`DAY ${m.day}: "${m.title}" (ID: ${m.id})`);
  console.log(`------------------------------------------------------------`);

  // 1. Module level check
  if (m.id !== `day-${m.day}` && m.id !== `day${m.day}`) {
    console.log(`  [MODULE ID DRIFT] Day ${m.day} has moduleId '${m.id}'`);
  }

  // 2. Concepts check
  m.concepts.forEach((c, idx) => {
    const th = c.theory;
    if (!th.targetQuery && (!th.exampleQuery || th.exampleQuery.trim().length === 0)) {
      console.log(`  [CONCEPT] "${c.title}" has neither targetQuery nor exampleQuery`);
    }
    if (!th.stepBreakdowns || th.stepBreakdowns.length === 0) {
      console.log(`  [CONCEPT] "${c.title}" has 0 stepBreakdowns`);
    }
    if (!th.keyTakeaway) {
      console.log(`  [CONCEPT] "${c.title}" missing keyTakeaway`);
    }
    if (!th.mcqs || th.mcqs.length === 0) {
      console.log(`  [CONCEPT] "${c.title}" has 0 MCQs`);
    }
  });

  // 3. Task audit
  const allTasks: { task: any; kind: string }[] = [];
  m.concepts.forEach(c => (c.tasks || []).forEach(t => allTasks.push({ task: t, kind: 'concept' })));
  if (m.challenge) {
    (m.challenge.tasks || []).forEach(t => allTasks.push({ task: t, kind: 'challenge' }));
  }

  for (const { task, kind } of allTasks) {
    // Check Task ID drift
    const dayMatch = task.id.match(/^day(\d+)/);
    if (dayMatch && parseInt(dayMatch[1]) !== m.day) {
      console.log(`  [TASK ID DRIFT] Task '${task.id}' uses prefix day${dayMatch[1]} but is in Day ${m.day}`);
    }

    // Check primaryTable
    const pt = (task.primaryTable || '').toLowerCase();
    const isDdl = /CREATE|ALTER|DROP/i.test(task.solutionSql);
    if (!DATABASE_SCHEMAS[pt]) {
      console.log(`  [UNKNOWN TABLE] Task '${task.id}' primaryTable is '${task.primaryTable}' (not in DATABASE_SCHEMAS, isDdl=${isDdl})`);
    }

    // Check title naming conventions
    if (!task.title.match(/^(?:Task\s+\d+|Deliverable\s+\d+|Mission\s+\d+|Warmup\s+\d+|Exploration\s+\d+|Endpoint\s+\d+)/i)) {
      console.log(`  [UNCONVENTIONAL TITLE] Task '${task.id}' title: "${task.title}"`);
    }

    // Check weird phrases in instructions / description
    for (let i = 0; i < task.instructions.length; i++) {
      const inst = task.instructions[i];
      if (inst.length < 10) {
        console.log(`  [SHORT INSTRUCTION] Task '${task.id}' instruction ${i + 1}: "${inst}"`);
      }
      if (inst.includes('TODO') || inst.includes('FIXME') || inst.includes('...') && inst.length < 20) {
        console.log(`  [SUSPICIOUS INSTRUCTION] Task '${task.id}' instruction ${i + 1}: "${inst}"`);
      }
    }

    // Check validation completeness
    const v = task.validation || {};
    if (!v.requireExactResult && !v.expectedRowCount && !v.customValidator && !isDdl) {
      console.log(`  [WEAK VALIDATION] Task '${task.id}' has no exactResult, expectedRowCount, or customValidator`);
    }

    // Check hints
    if (!task.hints || task.hints.length === 0) {
      console.log(`  [NO HINTS] Task '${task.id}' has 0 hints`);
    }
  }
}
