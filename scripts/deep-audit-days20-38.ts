import { ALL_MODULES } from '../src/content/curriculum-index';
import { DATABASE_SCHEMAS } from '../src/content/database/schema';

console.log('=== DEEP CONTENT AUDIT: DAYS 20 TO 38 ===\n');

for (const mod of ALL_MODULES) {
  if (mod.day < 20) continue;

  console.log(`\n============================================================`);
  console.log(`DAY ${mod.day}: "${mod.title}" (ID: ${mod.id})`);
  console.log(`============================================================`);

  // Check concepts
  mod.concepts.forEach((c, cIdx) => {
    console.log(`\n  [Concept ${cIdx + 1}] "${c.title}" (ID: ${c.id})`);
    const th = c.theory;
    if (!th.targetQuery && th.stepBreakdowns && th.stepBreakdowns.length > 0) {
      console.log(`    ⚠️ MISSING targetQuery for step breakdown`);
    }
    if (!th.keyTakeaway || th.keyTakeaway.trim().length < 20) {
      console.log(`    ⚠️ WEAK/MISSING keyTakeaway`);
    }

    (c.tasks || []).forEach((t, tIdx) => {
      console.log(`    Task ${tIdx + 1}: [${t.id}] "${t.title}"`);
      console.log(`      Primary table: "${t.primaryTable}" (in schema: ${!!DATABASE_SCHEMAS[t.primaryTable?.toLowerCase()]})`);
      console.log(`      Lifecycle: ${t.databaseLifecycle ?? 'undefined'}`);
      console.log(`      Solution SQL: ${t.solutionSql.replace(/\n/g, ' ')}`);
      console.log(`      Instructions (${t.instructions.length}):`);
      t.instructions.forEach((inst, i) => console.log(`        ${i + 1}. ${inst}`));
      console.log(`      Validation: ${JSON.stringify(t.validation)}`);
      
      // Phrasing checks
      const text = `${t.title} ${t.description} ${t.instructions.join(' ')} ${t.hints.map(h => h.text).join(' ')}`;
      const typoMatches = text.match(/\b(teh|adn|fro|whihc|databse|colum|tabel|requried|fucntion|udpate|delte)\b/gi);
      if (typoMatches) {
        console.log(`      ⚠️ Potential typos: ${typoMatches.join(', ')}`);
      }
    });
  });

  if (mod.challenge) {
    console.log(`\n  [Challenge] "${mod.challenge.title}"`);
    mod.challenge.tasks.forEach((t, tIdx) => {
      console.log(`    Challenge Task ${tIdx + 1}: [${t.id}] "${t.title}"`);
      console.log(`      Primary table: "${t.primaryTable}" (in schema: ${!!DATABASE_SCHEMAS[t.primaryTable?.toLowerCase()]})`);
      console.log(`      Lifecycle: ${t.databaseLifecycle ?? 'undefined'}`);
      console.log(`      Solution SQL: ${t.solutionSql.replace(/\n/g, ' ')}`);
      console.log(`      Instructions (${t.instructions.length}):`);
      t.instructions.forEach((inst, i) => console.log(`        ${i + 1}. ${inst}`));
      console.log(`      Validation: ${JSON.stringify(t.validation)}`);

      const text = `${t.title} ${t.description} ${t.instructions.join(' ')} ${t.hints.map(h => h.text).join(' ')}`;
      const typoMatches = text.match(/\b(teh|adn|fro|whihc|databse|colum|tabel|requried|fucntion|udpate|delte)\b/gi);
      if (typoMatches) {
        console.log(`      ⚠️ Potential typos: ${typoMatches.join(', ')}`);
      }
    });
  }
}
