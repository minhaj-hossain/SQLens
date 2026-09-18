/**
 * scripts/count-validation-overlap.ts — Phase-1 audit instrument.
 * Reproduces the task census from the source of truth
 * (src/content/curriculum-index.ts): total tasks, requireExactResult share,
 * and for each structural rule how many tasks pair it with exact-result
 * grading (the keyword-veto blast radius). Exits non-zero on structural
 * drift (zero exact-result tasks would mean the audit's premise is stale).
 * Run: npx tsx scripts/count-validation-overlap.ts
 */
import { ALL_MODULES } from '../src/content/curriculum-index';

const tasks: any[] = [];
for (const m of ALL_MODULES as any[]) {
  for (const c of m.concepts ?? []) tasks.push(...(c.tasks ?? []));
  tasks.push(...(m.challenge?.tasks ?? []));
}
const has = (t: any, k: string): boolean => {
  const v = t.validation?.[k];
  return v !== undefined && v !== false && !(Array.isArray(v) && v.length === 0);
};
const exact = tasks.filter((t) => has(t, 'requireExactResult'));
const rules = [
  'whereContainsTerms', 'requireLimit', 'requireOffset', 'requireDistinct',
  'requireGroupBy', 'requireHaving', 'requireJoin', 'requireFunction',
  'requireCase', 'requireSetOp', 'requiredAliases', 'requiredColumns',
  'requireOrderBy', 'requireWhere', 'forbiddenColumns', 'expectedRowCount',
  'customValidator', 'expectFailure',
];

console.log(`tasks=${tasks.length} exact=${exact.length} structural-only=${tasks.length - exact.length - tasks.filter((t) => has(t, 'expectFailure')).length} expectFailure=${tasks.filter((t) => has(t, 'expectFailure')).length}`);
for (const r of rules) {
  const total = tasks.filter((t) => has(t, r)).length;
  const both = tasks.filter((t) => has(t, r) && has(t, 'requireExactResult')).length;
  console.log(`  ${r}: total=${total} withExact=${both}`);
}
if (exact.length === 0) {
  console.log('DRIFT: no requireExactResult tasks found.');
  process.exit(1);
}
