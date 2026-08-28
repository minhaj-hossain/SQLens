/**
 * Phase 2 verification: concept slugs are unique per module and the legacy
 * index→slug resolution (replicating resolveConceptId in the provider) works
 * for every module and every index, including out-of-bounds values.
 */
import { ALL_MODULES, getModuleById } from '../src/content/curriculum-index';

function resolveConceptId(
  moduleId: string | null | undefined,
  conceptId: string | null | undefined,
  legacyConceptIndex?: number,
): string | null {
  const mod = moduleId ? getModuleById(moduleId) : undefined;
  const concepts = mod?.concepts ?? [];
  if (conceptId && concepts.some((c) => c.id === conceptId)) return conceptId;
  if (typeof legacyConceptIndex === 'number' && concepts[legacyConceptIndex]) {
    return concepts[legacyConceptIndex].id;
  }
  return null;
}

let failures = 0;
const fail = (msg: string) => {
  failures += 1;
  console.error('FAIL:', msg);
};

for (const mod of ALL_MODULES) {
  const ids = mod.concepts.map((c) => c.id);
  if (new Set(ids).size !== ids.length) {
    fail(`${mod.id}: duplicate concept ids: ${ids.join(', ')}`);
  }
  if (ids.some((id) => !/^[a-z0-9-]+$/.test(id))) {
    fail(`${mod.id}: non-url-safe concept id found: ${ids.filter((id) => !/^[a-z0-9-]+$/.test(id)).join(', ')}`);
  }
  // Legacy index resolution: every valid index resolves to the right slug;
  // out-of-bounds resolves to null (= first concept fallback).
  ids.forEach((id, idx) => {
    const resolved = resolveConceptId(mod.id, null, idx);
    if (resolved !== id) fail(`${mod.id}: legacy index ${idx} resolved to ${resolved}, expected ${id}`);
  });
  if (resolveConceptId(mod.id, null, ids.length) !== null) {
    fail(`${mod.id}: out-of-bounds legacy index should resolve to null`);
  }
  // Valid slug round-trip + unknown slug rejection.
  if (ids.length > 0) {
    if (resolveConceptId(mod.id, ids[0], undefined) !== ids[0]) fail(`${mod.id}: valid slug rejected`);
    if (resolveConceptId(mod.id, 'not-a-real-concept', undefined) !== null) fail(`${mod.id}: unknown slug accepted`);
  }
  // Legacy-slug resolution with an unknown id but valid index → index wins.
  if (ids.length > 2 && resolveConceptId(mod.id, 'not-a-real-concept', 2) !== ids[2]) {
    fail(`${mod.id}: legacy index should win over invalid slug`);
  }
}

console.log(`Checked ${ALL_MODULES.length} modules, ${ALL_MODULES.reduce((n, m) => n + m.concepts.length, 0)} concepts.`);
if (failures > 0) {
  console.error(`${failures} failure(s)`);
  process.exit(1);
}
console.log('PHASE 2 CHECK: all assertions passed');
