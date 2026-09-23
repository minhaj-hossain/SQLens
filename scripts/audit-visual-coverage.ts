/**
 * scripts/audit-visual-coverage.ts
 * -----------------------------------------------------------------------------
 * Milestone 4 visualization gate (audit §1.2 / plan item 12).
 *
 * The blind spot this closes: `resolveConceptArchetype()` silently returned the
 * universal TABULAR_PROJECTION fallback for every Day 39-57 concept, and nothing
 * in CI noticed — 51 concepts shipped with either a static source-table card or,
 * worse, no top visual at all (days 49-57 carried zero `introTable`s).
 *
 * Rules enforced (Days 39-57 BLOCK; earlier days print ADVISORY only, since
 * their visualization debt is pre-M4 and tracked separately):
 *
 *   1. NO NAKED FALLBACK — a concept must not resolve to the universal fallback
 *      while also lacking an `introTable`; that combination renders nothing.
 *   2. SUPPRESSION SYNC    — if a concept resolves to a diagram archetype, the
 *      module must be listed in `shouldSuppressTopIntroTable` (otherwise the
 *      diagram renders *and* a redundant source table is stacked above it);
 *      and TABULAR concepts must never be suppressed.
 *   3. STEPS BEFORE STEPS  — `stepBreakdowns` without a `targetQuery` violates
 *      the master plan's "target query before steps" ordering.
 *   4. NO DEAD OVERRIDES   — every concept id in the archetype / variant
 *      override maps must exist in the shipped content (typo guard), and every
 *      (archetype, variant) pair must be one the visualizer actually implements.
 *
 * Run: npx tsx scripts/audit-visual-coverage.ts   (npm run audit:visual-coverage)
 * Exit 1 on any blocking finding.
 */
import { ALL_MODULES } from '../src/content/curriculum-index';
import {
  resolveConceptArchetype,
  resolveVisualizerVariant,
  shouldSuppressTopIntroTable,
  CONCEPT_ID_OVERRIDES,
  CONCEPT_VARIANT_OVERRIDES,
  ConceptArchetype,
} from '../src/components/learning/mental-models/ConceptMentalModel';
import { ModuleData } from '../src/types/curriculum';

/** Milestone 4 owns the blocking scope (Days 39-57). */
const BLOCKING_MIN_DAY = 39;

/** Variants each archetype's visualizer implements (`undefined` = default view). */
const VALID_VARIANTS: Partial<Record<ConceptArchetype, string[]>> = {
  SUBQUERY_CTE: ['decomposition', 'recursive', 'hierarchy'],
  DML_TRANSACTION: ['atomicity', 'isolation', 'deadlock'],
  BTREE_INDEXING: ['basics', 'composite', 'covering'],
  SCHEMA_DDL: ['blueprint', 'migration'],
};

type FindingKind =
  | 'naked-fallback'
  | 'suppression-unsynced'
  | 'suppression-too-broad'
  | 'steps-without-target-query'
  | 'invalid-variant'
  | 'dead-override';

interface Finding {
  day: number;
  moduleId: string;
  conceptId: string;
  kind: FindingKind;
  detail: string;
  blocking: boolean;
}

const findings: Finding[] = [];
const seenConceptIds = new Set<string>();

function auditModule(module: ModuleData, day: number) {
  const blocking = day >= BLOCKING_MIN_DAY;

  for (const concept of module.concepts) {
    if (concept.id) seenConceptIds.add(concept.id);

    const archetype = resolveConceptArchetype(module.id, concept);
    const theory = concept.theory;
    const hasIntroTable = Boolean(theory?.introTable);
    const hasTargetQuery = Boolean(theory?.targetQuery);
    const steps = theory?.stepBreakdowns ?? [];
    const suppressed = shouldSuppressTopIntroTable(module.id, concept);

    // 1. A fallback concept with no introTable renders nothing at the top.
    if (archetype === 'TABULAR_PROJECTION' && !hasIntroTable) {
      findings.push({
        day,
        moduleId: module.id,
        conceptId: concept.id ?? '<no-id>',
        kind: 'naked-fallback',
        detail:
          'resolves to TABULAR_PROJECTION but has no introTable — the mental-model slot renders empty',
        blocking,
      });
    }

    // 2. Diagram archetypes must be registered as diagram-driven (and vice versa).
    const isDiagram = archetype !== 'TABULAR_PROJECTION';
    if (isDiagram && !suppressed) {
      findings.push({
        day,
        moduleId: module.id,
        conceptId: concept.id ?? '<no-id>',
        kind: 'suppression-unsynced',
        detail: `resolves to ${archetype} but ${module.id} is not in shouldSuppressTopIntroTable — diagram and source table would both render`,
        blocking,
      });
    }
    if (!isDiagram && suppressed) {
      findings.push({
        day,
        moduleId: module.id,
        conceptId: concept.id ?? '<no-id>',
        kind: 'suppression-too-broad',
        detail: `resolves to TABULAR_PROJECTION yet ${module.id} suppresses its authentic source table`,
        blocking,
      });
    }

    // 3. "Target query before steps" — steps must dissect something.
    if (steps.length > 0 && !hasTargetQuery) {
      findings.push({
        day,
        moduleId: module.id,
        conceptId: concept.id ?? '<no-id>',
        kind: 'steps-without-target-query',
        detail: `${steps.length} stepBreakdowns but no targetQuery — steps have no query to break down`,
        blocking,
      });
    }

    // 4. Variant must be one the resolved visualizer implements.
    const variant = resolveVisualizerVariant(module.id, concept);
    if (variant !== undefined) {
      const allowed = VALID_VARIANTS[archetype];
      if (!allowed || !allowed.includes(variant)) {
        findings.push({
          day,
          moduleId: module.id,
          conceptId: concept.id ?? '<no-id>',
          kind: 'invalid-variant',
          detail: `variant '${variant}' is not implemented by ${archetype} (expected ${allowed?.join(' | ') ?? 'none'})`,
          blocking,
        });
      }
    }
  }
}

function dayOf(module: ModuleData): number {
  const m = /day-(\d+)/i.exec(module.id);
  return m ? Number(m[1]) : 0;
}

/**
 * Dead-override guard: a stale concept id in either override map is invisible
 * content rot — the concept silently falls back to the module default. Checked
 * after every module is walked so `seenConceptIds` is complete.
 */
function auditDeadOverrides() {
  for (const [mapName, map] of [
    ['CONCEPT_ID_OVERRIDES', CONCEPT_ID_OVERRIDES],
    ['CONCEPT_VARIANT_OVERRIDES', CONCEPT_VARIANT_OVERRIDES],
  ] as const) {
    for (const conceptId of Object.keys(map)) {
      if (seenConceptIds.has(conceptId)) continue;
      findings.push({
        day: 0,
        moduleId: '<override-map>',
        conceptId,
        kind: 'dead-override',
        detail: `${mapName} entry '${conceptId}' does not match any shipped concept id (dead override — rename or delete it)`,
        blocking: true,
      });
    }
  }
}

function main() {
  console.log('\n=== Visual-coverage audit (§1.2) ===\n');
  console.log('Archetype resolution + introTable/targetQuery presence per concept.');
  console.log('Days 39-57 BLOCK; earlier days are ADVISORY.\n');

  const byDay: { day: number; modules: ModuleData[] }[] = [];
  for (const module of ALL_MODULES) {
    const day = dayOf(module);
    const bucket = byDay.find((b) => b.day === day);
    if (bucket) bucket.modules.push(module);
    else byDay.push({ day, modules: [module] });
  }
  byDay.sort((a, b) => a.day - b.day);

  for (const { day, modules } of byDay) {
    for (const module of modules) auditModule(module, day);

    const dayFindings = findings.filter((f) => f.day === day);
    const label = `Day ${String(day).padStart(2, '0')}`;
    const concepts = modules.reduce((n, m) => n + m.concepts.length, 0);
    console.log(
      dayFindings.length === 0
        ? `${label}  ${String(concepts).padStart(2)} concepts  OK`
        : `${label}  ${String(concepts).padStart(2)} concepts  ${dayFindings.length} finding(s) ${day >= BLOCKING_MIN_DAY ? 'BLOCKING' : 'advisory'}`,
    );
  }

  auditDeadOverrides();

  const blocking = findings.filter((f) => f.blocking);
  const advisory = findings.filter((f) => !f.blocking);

  console.log('\n--- FINDINGS (detail) ---');
  for (const f of [...blocking, ...advisory]) {
    console.log(
      `  ${f.blocking ? 'BLOCK' : 'advisory'}  day ${String(f.day).padStart(2, '0')}  ${f.moduleId}  ${f.conceptId}`,
    );
    console.log(`           ${f.kind}: ${f.detail}`);
  }
  if (findings.length === 0) console.log('  (none)');

  console.log('\n--- SUMMARY ---');
  console.log(`Blocking findings: ${blocking.length}`);
  console.log(`Advisory findings: ${advisory.length}`);
  console.log(
    blocking.length === 0
      ? 'Every Milestone 4 concept resolves to a real visualizer or an authentic source table.'
      : 'Milestone 4 has concepts that would render nothing or render twice.',
  );
  console.log('='.repeat(72) + '\n');

  process.exit(blocking.length === 0 ? 0 : 1);
}

main();
