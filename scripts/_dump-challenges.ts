import * as M from '../src/content/modules';

for (const [name, mod] of Object.entries(M)) {
  const m = mod as any;
  const ch = m.challenge;
  if (!ch) { console.log(`=== ${name}: NO CHALLENGE BLOCK`); continue; }
  console.log(`\n=== ${name} :: ${m.title}`);
  console.log(`SCENARIO: ${ch.scenario}`);
  for (const t of ch.tasks) {
    console.log(`  [${t.id}] ${t.title}`);
    console.log(`    desc: ${t.description}`);
    console.log(`    expl: ${t.solutionExplanation}`);
  }
}