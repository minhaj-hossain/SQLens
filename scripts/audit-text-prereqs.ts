import { ALL_MODULES } from '../src/content/curriculum-index';

console.log('=== Checking for forward day references in module text ===\n');

for (const module of ALL_MODULES) {
  const day = module.day;
  
  // Collect all text in this module
  const texts: { loc: string; text: string }[] = [];
  texts.push({ loc: `Module description`, text: module.description || '' });
  
  for (const c of module.concepts) {
    texts.push({ loc: `Concept ${c.order} summary`, text: c.theory.summary || '' });
    for (const exp of c.theory.explanation || []) {
      texts.push({ loc: `Concept ${c.order} explanation`, text: exp });
    }
    for (const t of c.tasks || []) {
      texts.push({ loc: `Task ${t.id} description`, text: t.description || '' });
      for (const inst of t.instructions || []) {
        texts.push({ loc: `Task ${t.id} instructions`, text: inst });
      }
      for (const h of t.hints || []) {
        texts.push({ loc: `Task ${t.id} hint`, text: h.text });
      }
      texts.push({ loc: `Task ${t.id} success`, text: t.successMessage || '' });
    }
  }

  if (module.challenge) {
    texts.push({ loc: `Challenge scenario`, text: module.challenge.scenario || '' });
    for (const t of module.challenge.tasks || []) {
      texts.push({ loc: `Challenge Task ${t.id} description`, text: t.description || '' });
      for (const inst of t.instructions || []) {
        texts.push({ loc: `Challenge Task ${t.id} instructions`, text: inst });
      }
      for (const h of t.hints || []) {
        texts.push({ loc: `Challenge Task ${t.id} hint`, text: h.text });
      }
      texts.push({ loc: `Challenge Task ${t.id} success`, text: t.successMessage || '' });
      texts.push({ loc: `Challenge Task ${t.id} solutionExplanation`, text: t.solutionExplanation || '' });
    }
  }

  for (const item of texts) {
    // Check for "Day N" or "Day-N" where N > day
    const dayMatches = item.text.matchAll(/Day\s*[-–]?\s*(\d+)/gi);
    for (const m of dayMatches) {
      const referencedDay = parseInt(m[1], 10);
      if (referencedDay > day && referencedDay <= 38) {
        console.log(`[Day ${day}] references future Day ${referencedDay} in ${item.loc}:`);
        console.log(`  "${item.text}"\n`);
      }
    }
  }
}
