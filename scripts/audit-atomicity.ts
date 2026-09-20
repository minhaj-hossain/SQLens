import { ALL_MODULES } from '../src/content/curriculum-index';

// Lightweight atomicity lint: flags modules whose concept titles look like
// several unrelated Tier-1 constructs bundled into one day. Human-review
// warning only — never an automatic reject ("Views + CHECK OPTION" can be
// one atomic module). Exit 0 always; prints WARNING lines for review.
const SUSPECT = [
  /composite\s*\+\s*covering\s*\+\s*partial/i,
  /json\s*\+\s*uuid\s*\+\s*enum/i,
  /backup\s*\+\s*PITR\s*\+\s*migration/i,
  /partitioning\s*\+\s*sharding/i,
  /fulltext\s*\+\s*hash\s*\+\s*b-tree/i,
];

let warnings = 0;
for (const m of ALL_MODULES) {
  for (const c of m.concepts) {
    const title = c.title ?? '';
    if (SUSPECT.some((re) => re.test(title))) {
      warnings++;
      console.log(`WARNING — ${m.id} / ${c.id}: "${title}" looks bundled; human review.`);
    }
  }
}
console.log(warnings === 0 ? 'atomicity lint: no suspect bundles.' : `atomicity lint: ${warnings} warning(s) for review.`);
