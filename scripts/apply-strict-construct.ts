/**
 * scripts/apply-strict-construct.ts — Batch 6 content pass (auditable, idempotent).
 *
 * WHY: Batch 2 made construct rules ADVISORY when the learner's dataset matches
 * the reference exactly (`strictConstruct` defaults to false). That is right for
 * most tasks — a correct answer by another route is still correct. But on a
 * lesson whose SUBJECT is the construct, an equivalent formulation that skips it
 * is a false accept (e.g. `SELECT DISTINCT city` instead of
 * `SELECT city … GROUP BY city`, `UNION ALL` instead of `UNION` when the data has
 * no duplicates, a literal instead of `CASE`). Those tasks opt in.
 *
 * CRITERION (auditable, not vibes): a task opts in when the CONCEPT it belongs to
 * is *named after / dedicated to* the construct, or it is that construct's
 * module-level challenge. Tasks where the construct is merely a means to a report
 * stay advisory, because the dataset then self-verifies the construct anyway.
 *
 * Run: npx tsx scripts/apply-strict-construct.ts          (dry run, prints plan)
 *      npx tsx scripts/apply-strict-construct.ts --write  (applies the edits)
 */
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { ALL_MODULES } from '../src/content/curriculum-index';

interface Scope {
  module: string;
  /** Concept id, or '*' for every concept in the module. */
  concept: string;
  rule: string;
}

/** The reviewed decision. One line per (module, concept, rule) justification. */
const SCOPE: Scope[] = [
  // Set operations: every Day-17 concept is named after an operator, and the
  // UNION payload IS the mechanism of the Day-32 injection task.
  { module: 'day-17', concept: '*', rule: 'requireSetOp' },
  { module: 'day-32', concept: 'sec-injection', rule: 'requireSetOp' },
  // Day 10 is the conditional-logic module (all concepts are case-*).
  { module: 'day-10', concept: '*', rule: 'requireCase' },
  // Dedicated DISTINCT lessons.
  { module: 'day-04', concept: 'distinct-deduplication', rule: 'requireDistinct' },
  { module: 'day-04', concept: 'challenge', rule: 'requireDistinct' },
  // Dedicated LIMIT/OFFSET lesson.
  { module: 'day-04', concept: 'limit-and-offset', rule: 'requireLimit' },
  { module: 'day-04', concept: 'limit-and-offset', rule: 'requireOffset' },
  // Aggregation lessons (Day 9 = GROUP BY/HAVING, Day 12 = grouping by date part).
  { module: 'day-09', concept: 'grouping-with-group-by', rule: 'requireGroupBy' },
  { module: 'day-09', concept: 'having-filter', rule: 'requireGroupBy' },
  { module: 'day-09', concept: 'having-filter', rule: 'requireHaving' },
  { module: 'day-09', concept: 'challenge', rule: 'requireGroupBy' },
  { module: 'day-09', concept: 'challenge', rule: 'requireHaving' },
  { module: 'day-12', concept: 'group-by-date-parts', rule: 'requireGroupBy' },
  { module: 'day-12', concept: 'challenge', rule: 'requireGroupBy' },
  // Day 14 is the JOIN module (concepts named after the join type).
  { module: 'day-14', concept: 'relational-keys-inner-join', rule: 'requireJoin' },
  { module: 'day-14', concept: 'left-join-preserving-left', rule: 'requireJoin' },
  { module: 'day-14', concept: 'challenge', rule: 'requireJoin' },
];
const write = process.argv.includes('--write');

// ---- 1. Resolve the scope to concrete task ids -----------------------------
const targets = new Set<string>();
const reasons = new Map<string, string[]>();

for (const mod of ALL_MODULES as any[]) {
  const groups: Array<[string, any[]]> = (mod.concepts ?? []).map((c: any) => [c.id, c.tasks ?? []]);
  if (mod.challenge?.tasks) groups.push(['challenge', mod.challenge.tasks]);
  for (const [conceptId, tasks] of groups) {
    for (const scope of SCOPE) {
      if (scope.module !== mod.id) continue;
      if (scope.concept !== '*' && scope.concept !== conceptId) continue;
      for (const t of tasks) {
        if (!t.validation?.requireExactResult) continue;
        if (!t.validation?.[scope.rule]) continue; // only if the rule is actually set
        targets.add(t.id);
        const list = reasons.get(t.id) ?? [];
        list.push(`${scope.rule} @ ${conceptId}`);
        reasons.set(t.id, list);
      }
    }
  }
}

// ---- 2. Apply to the source files -----------------------------------------
const dir = join(process.cwd(), 'src', 'content', 'modules');
const files = readdirSync(dir).filter((f) => f.endsWith('.ts'));
let applied = 0;
let already = 0;
const notFound: string[] = [];

for (const file of files) {
  const path = join(dir, file);
  const original = readFileSync(path, 'utf8');
  const lines = original.split('\n');
  let changed = false;

  for (const taskId of targets) {
    const idIdx = lines.findIndex((l) => l.includes(`id: '${taskId}'`));
    if (idIdx === -1) continue;
    // This task's validation block starts at the next `requireExactResult: true,`.
    let valIdx = -1;
    for (let i = idIdx; i < Math.min(idIdx + 60, lines.length); i++) {
      if (/requireExactResult:\s*true/.test(lines[i])) { valIdx = i; break; }
      if (/^\s{6}\},?\s*$/.test(lines[i]) && i > idIdx + 2) break; // task object ended
    }
    if (valIdx === -1) { notFound.push(taskId); continue; }

    // Idempotent: scan forward from the validation block to the start of the NEXT
    // task object (or a bounded window) and skip if the flag is already present.
    // (Scanning a fixed few lines was unreliable: the flag can sit further down
    // the block, and a second --write would then insert a duplicate.)
    let hasFlag = false;
    const scanEnd = (() => {
      for (let i = valIdx + 1; i < Math.min(valIdx + 40, lines.length); i++) {
        if (/\bid:\s*'/.test(lines[i])) return i;
      }
      return Math.min(valIdx + 40, lines.length);
    })();
    for (let i = valIdx; i < scanEnd; i++) {
      if (/strictConstruct:\s*true/.test(lines[i])) { hasFlag = true; break; }
    }
    if (hasFlag) { already++; continue; }

    const indent = (lines[valIdx].match(/^\s*/) ?? [''])[0];
    lines.splice(valIdx + 1, 0, `${indent}strictConstruct: true,`);
    changed = true;
    applied++;
  }

  if (changed && write) writeFileSync(path, lines.join('\n'), 'utf8');
  if (changed) console.log(`${write ? 'WROTE  ' : 'WOULD  '}${file}`);
}

console.log(`\napply-strict-construct: targets=${targets.size} applied=${applied} already=${already} notFound=${notFound.length}`);
if (notFound.length) console.log('  not located: ' + notFound.join(', '));
if (!write) {
  console.log('\nReasoning per task:');
  for (const [id, why] of [...reasons.entries()].sort()) console.log(`  ${id.padEnd(18)} ${why.join('; ')}`);
  console.log('\n(dry run — re-run with --write to apply)');
}
