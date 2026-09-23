'use client';

import React from 'react';
import { Concept } from '../../../types/curriculum';
import { ExecutionPipelineVisualizer } from './ExecutionPipelineVisualizer';
import { JoinRelationalVisualizer } from './JoinRelationalVisualizer';
import { GroupBucketingVisualizer } from './GroupBucketingVisualizer';
import { VennSetVisualizer } from './VennSetVisualizer';
import { WindowFrameVisualizer } from './WindowFrameVisualizer';
import { TransactionTimelineVisualizer, TransactionTimelineVariant } from './TransactionTimelineVisualizer';
import { SchemaBlueprintVisualizer, SchemaBlueprintVariant } from './SchemaBlueprintVisualizer';
import { BTreeIndexVisualizer, BTreeIndexVariant } from './BTreeIndexVisualizer';
import { SecurityInjectionVisualizer } from './SecurityInjectionVisualizer';
import { PredicatePatternVisualizer } from './PredicatePatternVisualizer';
import { CaseDecisionVisualizer } from './CaseDecisionVisualizer';
import { StringTransformVisualizer } from './StringTransformVisualizer';
import { DateTimelineVisualizer } from './DateTimelineVisualizer';
import { CtePipelineVisualizer, CtePipelineVariant } from './CtePipelineVisualizer';
import { InterviewWhiteboardVisualizer } from './InterviewWhiteboardVisualizer';

export type ConceptArchetype =
  | 'TABULAR_PROJECTION'    // Default: shows authentic source table
  | 'PREDICATE_PATTERN'     // Day 3 concepts 5–8: BETWEEN, IN, LIKE, IS NULL
  | 'EXECUTION_PIPELINE'    // Days 6, 16
  | 'RELATIONAL_JOIN'       // Days 14, 15
  | 'GROUP_BUCKETING'       // Days 9, 13, 18
  | 'CASE_DECISION'         // Day 10
  | 'STRING_TRANSFORM'      // Day 11
  | 'DATE_TIMELINE'         // Day 12
  | 'SET_OPERATIONS_VENN'   // Day 17
  | 'SUBQUERY_CTE'          // Days 21, 22
  | 'WINDOW_ANALYTICAL'     // Days 23, 24
  | 'DML_TRANSACTION'       // Day 26
  | 'SCHEMA_DDL'            // Days 27, 28, 29, 30, 33
  | 'BTREE_INDEXING'        // Day 31
  | 'SECURITY_DEFENSE'      // Day 32 (injection concepts only)
  | 'INTERVIEW_WHITEBOARD'; // Days 36, 37, 38

// ---------------------------------------------------------------------------
// Concept-ID -> archetype overrides.
// ---------------------------------------------------------------------------

// NOTE — Milestone 4 (Days 39-57) deliberately has NO archetype entries here.
// Every M4 day resolves through the module-level defaults in
// `resolveConceptArchetype` (41/42 -> SUBQUERY_CTE with the recursive/hierarchy
// laps; 49/50 -> DML_TRANSACTION with isolation lanes, the atomicity view and
// the deadlock wait-for ring; 52 -> BTREE_INDEXING with the composite and
// index-only seeks; 56 -> SCHEMA_DDL with expand->backfill->contract), and the
// per-concept differences inside those days are *variants*
// (see CONCEPT_VARIANT_OVERRIDES / MODULE_VARIANT_DEFAULTS below).
//
// An earlier revision carried a second `M4_CONCEPT_OVERRIDES` map whose values
// (CTE_RECURSIVE, TX_ISOLATION, BTREE_COMPOSITE, ...) were members of neither
// `ConceptArchetype` nor the render switch: it failed type-checking and would
// have rendered nothing at all had it been reached. It was also unreachable —
// `isolation-selection` was shadowed by the TABULAR_PROJECTION entry below.
// If an M4 concept ever needs a *different component* (not just a different
// view of the same one), give its day a module default below; do not re-add a
// parallel archetype namespace.

export const CONCEPT_ID_OVERRIDES: Record<string, ConceptArchetype> = {
  // ── Day 3 ─────────────────────────────────────────────────────────────────
  // Concepts 1–4 are about boolean logic (AND/OR/NOT/Parentheses):
  // they use the authentic students/products table, NOT the predicate visualizer.
  'where-and-intersection':     'TABULAR_PROJECTION',
  'where-or-union':             'TABULAR_PROJECTION',
  'where-not-negation':         'TABULAR_PROJECTION',
  'where-parentheses-precedence': 'TABULAR_PROJECTION',
  // Concepts 5–8 are the pattern/range/set/null group — predicate visualizer IS correct.
  'where-between-range':        'PREDICATE_PATTERN',
  'where-in-set':               'PREDICATE_PATTERN',
  'where-like-wildcards':       'PREDICATE_PATTERN',
  'where-null-safety':          'PREDICATE_PATTERN',

  // ── Day 9 ─────────────────────────────────────────────────────────────────
  // Concepts 1–5 are standalone aggregation functions (COUNT, MIN, MAX, SUM, AVG):
  // they do NOT use GROUP BY or HAVING and should show authentic source tables.
  'aggregate-count':            'TABULAR_PROJECTION',
  'aggregate-min':              'TABULAR_PROJECTION',
  'aggregate-max':              'TABULAR_PROJECTION',
  'aggregate-sum':              'TABULAR_PROJECTION',
  'aggregate-avg':              'TABULAR_PROJECTION',
  // Concepts 6 & 7 explicitly teach GROUP BY & HAVING — GroupBucketingVisualizer is correct.
  'grouping-with-group-by':     'GROUP_BUCKETING',
  'having-filter':              'GROUP_BUCKETING',

  // ── Day 12 ────────────────────────────────────────────────────────────────
  // Concepts 1, 2, 4 teach date extraction and difference:
  'date-components':            'TABULAR_PROJECTION',
  'group-by-date-parts':        'TABULAR_PROJECTION',
  'datediff':                   'TABULAR_PROJECTION',
  // Concept 3 explicitly teaches relative date math ("The Last N Days") — DateTimelineVisualizer is correct.
  'date-arithmetic':            'DATE_TIMELINE',

  // ── Day 21 ────────────────────────────────────────────────────────────────
  // Concepts 1–4 teach subqueries (scalar, IN, NOT IN, correlated) before CTEs are introduced.
  'subqueries-scalar':          'TABULAR_PROJECTION',
  'subqueries-in-set':          'TABULAR_PROJECTION',
  'subqueries-not-in-null-trap': 'TABULAR_PROJECTION',
  'subqueries-correlated':      'TABULAR_PROJECTION',
  // Concept 5 explicitly teaches Common Table Expressions (WITH) — CtePipelineVisualizer is correct.
  'common-table-expressions-cte': 'SUBQUERY_CTE',

  // ── Day 32 ────────────────────────────────────────────────────────────────
  // Only the SQL injection concepts should show the security visualizer.
  // "Production Safety Drills" is a checklist concept — authentic table is better.
  'sec-injection':              'SECURITY_DEFENSE',
  'sec-parameterized':          'SECURITY_DEFENSE',
  'sec-production':             'TABULAR_PROJECTION',

  // ── Day 38 ────────────────────────────────────────────────────────────────
  // Concept 1 is "Beyond the Course: Window Functions Preview" — NOT an interview whiteboard.
  'window-functions-and-future': 'WINDOW_ANALYTICAL',

  // ── Milestone 4 ───────────────────────────────────────────────────────────
  // Day 49 concept 3 ("Choosing an Isolation Level") is a decision matrix: the
  // authentic table of levels vs trade-offs teaches it better than session lanes.
  'isolation-selection': 'TABULAR_PROJECTION',
  // Day 57 concept 2 (composite indexing capstone) re-routes to the existing
  // BTreeIndexVisualizer composite view — same multi-key seek shape as Day 52.
  // Its variant lives in CONCEPT_VARIANT_OVERRIDES ('composite').
  'capstone-composite-indexing': 'BTREE_INDEXING',
};

/**
 * Resolves the visual presentation archetype for a given module and concept.
 *
 * Resolution order:
 *  1. Per-concept ID override (most specific — handles mixed-topic modules)
 *  2. Module-level default (all concepts in that module share the same archetype)
 *  3. TABULAR_PROJECTION (universal fallback)
 */
export function resolveConceptArchetype(moduleId: string, concept?: Concept): ConceptArchetype {
  // 1. Per-concept override (highest priority)
  if (concept?.id && CONCEPT_ID_OVERRIDES[concept.id] !== undefined) {
    return CONCEPT_ID_OVERRIDES[concept.id];
  }

  const mid = moduleId.toLowerCase();

  // 2. Module-level defaults
  if (mid === 'day-03') return 'PREDICATE_PATTERN';
  if (mid === 'day-06' || mid === 'day-16') return 'EXECUTION_PIPELINE';
  // Day 7 is an E-Commerce schema audit (exploration), NOT joins — joins start Day 14.
  if (mid === 'day-14' || mid === 'day-15') return 'RELATIONAL_JOIN';
  if (mid === 'day-09') return 'GROUP_BUCKETING';
  // Day 13 & Day 18 are practice dashboard / applied BI modules — authentic source tables.
  if (mid === 'day-10') return 'CASE_DECISION';
  if (mid === 'day-11') return 'STRING_TRANSFORM';
  if (mid === 'day-12') return 'DATE_TIMELINE';
  if (mid === 'day-17') return 'SET_OPERATIONS_VENN';
  if (mid === 'day-21' || mid === 'day-22') return 'SUBQUERY_CTE';
  if (mid === 'day-23' || mid === 'day-24') return 'WINDOW_ANALYTICAL';
  // Day 25 is basic INSERT/UPDATE/DELETE — no commit/rollback; TransactionTimeline is Day 26 only.
  if (mid === 'day-26') return 'DML_TRANSACTION';
  // Day 33 is the Bookstore Capstone — authentic multi-table bookstore schema, NOT generic users/orders blueprint.
  if (mid === 'day-27' || mid === 'day-28' || mid === 'day-29' || mid === 'day-30') return 'SCHEMA_DDL';
  if (mid === 'day-31') return 'BTREE_INDEXING';
  // Day 32 security: concept-level overrides above handle injection vs production concepts.
  if (mid === 'day-32') return 'SECURITY_DEFENSE';
  if (mid === 'day-36' || mid === 'day-37') return 'INTERVIEW_WHITEBOARD';

  // ── Milestone 4 (Days 39–57) ──────────────────────────────────────────────
  // Days 39/40 (views) and 46 (triggers) deliberately stay TABULAR_PROJECTION:
  // their concepts are about *a named object and its stored query*, which the
  // authentic source table plus the module's introTable explains better than a
  // diagram. They must carry an introTable (enforced by audit:visual-coverage).
  // Days 41/42 are recursion — the CTE pipeline gains recursive + hierarchy laps.
  if (mid === 'day-41' || mid === 'day-42') return 'SUBQUERY_CTE';
  // Days 49/50 are concurrency — the transaction timeline gains isolation lanes
  // (two interleaved sessions) and a deadlock wait-for cycle.
  if (mid === 'day-49' || mid === 'day-50') return 'DML_TRANSACTION';
  // Day 52 extends Day 31's B-tree with the composite (multi-key) and
  // covering (index-only) seek shapes.
  if (mid === 'day-52') return 'BTREE_INDEXING';
  // Day 56 is schema evolution — the blueprint gains the expand/backfill/contract
  // migration sequence.
  if (mid === 'day-56') return 'SCHEMA_DDL';

  // 3. Universal fallback — shows authentic source table
  return 'TABULAR_PROJECTION';
}

/**
 * Variant selection for the archetypes whose visualizer exposes more than one
 * view. Concept-level entries win over the module default; an unknown pair
 * yields `undefined`, which lets each component fall back to its own default
 * (decomposition / atomicity / basics / blueprint).
 */
export const CONCEPT_VARIANT_OVERRIDES: Record<string, string> = {
  // Day 49 — "Choosing an Isolation Level" is a comparison/decision concept,
  // so it keeps the authentic tabular projection via the archetype override
  // above; the other two render the interleaved session lanes.
  'concurrency-anomalies': 'isolation',
  'isolation-levels': 'isolation',
  // Day 50 — SELECT ... FOR UPDATE shows one session holding a row lock while
  // another waits; SAVEPOINT is partial rollback (the atomicity view).
  'select-for-update': 'isolation',
  'savepoints': 'atomicity',
  'deadlocks': 'deadlock',
  // Day 52 — leftmost-prefix reuse walks the same composite key; only the
  // full covering (index-only) read needs its own shape.
  'composite-indexes': 'composite',
  'prefix-reuse': 'composite',
  'covering-indexes': 'covering',
  // Day 56
  'expand-contract': 'migration',
  'backfill-sync': 'migration',
  // Day 57 capstone revisits composite indexing as a review exercise.
  'capstone-composite-indexing': 'composite',
};

const MODULE_VARIANT_DEFAULTS: Record<string, string> = {
  'day-41': 'recursive',
  'day-42': 'hierarchy',
  'day-49': 'isolation',
  'day-50': 'deadlock',
  'day-52': 'composite',
  'day-56': 'migration',
};

/**
 * Variant selection for the archetypes whose visualizer exposes more than one
 * view. Concept-level entries win over the module default; an unknown pair
 * yields `undefined`, which lets each component fall back to its own default
 * (decomposition / atomicity / basics / blueprint).
 *
 * Variants only mean something for archetypes whose component *has* variants,
 * so resolution is archetype-aware: a concept that resolves to
 * TABULAR_PROJECTION (or any single-view archetype) always yields `undefined`,
 * even when its day has a module-level variant default. Without this, a day
 * like 49 would hand the string 'isolation' to a static source table â€” the pair
 * `audit:visual-coverage` flags as `invalid-variant` because nothing consumes
 * it. Keeping the check here means every caller (component *and* gate) sees the
 * same, consistent (archetype, variant) pair.
 */
const VARIANT_CAPABLE_ARCHETYPES: ReadonlySet<ConceptArchetype> = new Set<ConceptArchetype>([
  'SUBQUERY_CTE',
  'DML_TRANSACTION',
  'BTREE_INDEXING',
  'SCHEMA_DDL',
]);

export function resolveVisualizerVariant(moduleId: string, concept?: Concept): string | undefined {
  if (!VARIANT_CAPABLE_ARCHETYPES.has(resolveConceptArchetype(moduleId, concept))) {
    return undefined;
  }
  if (concept?.id && CONCEPT_VARIANT_OVERRIDES[concept.id] !== undefined) {
    return CONCEPT_VARIANT_OVERRIDES[concept.id];
  }
  return MODULE_VARIANT_DEFAULTS[moduleId.toLowerCase()];
}



/**
 * Whether the top introTable should be suppressed because a dedicated
 * mental model visualizer replaces it or a static table makes no pedagogical sense.
 */
export function shouldSuppressTopIntroTable(moduleId: string, concept?: Concept): boolean {
  // If the concept resolves to TABULAR_PROJECTION, we NEVER suppress its authentic source table.
  const archetype = resolveConceptArchetype(moduleId, concept);
  if (archetype === 'TABULAR_PROJECTION') {
    return false;
  }

  const mid = moduleId.toLowerCase();
  // These modules require conceptual diagrams rather than a flat mock table at top.
  // Day 7, 25, 35 removed: they have useful source tables that contextualize the lesson.
  // Days 41/42/49/50/52/56 (Milestone 4) added: each resolves to a dedicated
  // diagram archetype (recursive/hierarchy laps, session lanes, deadlock ring,
  // composite seek, expand→backfill→contract), so a static source table on top
  // would only push the diagram below the fold. Days 39/40 (views) and 46
  // (triggers) stay unsuppressed on purpose — there the source table IS the
  // teaching device. `audit:visual-coverage` keeps this list in sync with
  // `resolveConceptArchetype`.
  const diagramDrivenModules = [
    'day-06', 'day-14', 'day-15', 'day-16', 'day-17',
    'day-21', 'day-22',
    'day-23', 'day-24', 'day-26', 'day-27', 'day-28',
    'day-29', 'day-30', 'day-31', 'day-32',
    'day-36', 'day-37', 'day-38',
    'day-41', 'day-42', 'day-49', 'day-50', 'day-52', 'day-56', 'day-57',
  ];
  return diagramDrivenModules.includes(mid);
}

interface ConceptMentalModelProps {
  moduleId: string;
  concept: Concept;
}

export const ConceptMentalModel: React.FC<ConceptMentalModelProps> = ({ moduleId, concept }) => {
  const archetype = resolveConceptArchetype(moduleId, concept);
  const variant = resolveVisualizerVariant(moduleId, concept);

  switch (archetype) {
    case 'PREDICATE_PATTERN':
      return <PredicatePatternVisualizer conceptId={concept?.id} />;
    case 'EXECUTION_PIPELINE':
      return <ExecutionPipelineVisualizer />;
    case 'RELATIONAL_JOIN':
      return <JoinRelationalVisualizer />;
    case 'GROUP_BUCKETING':
      return <GroupBucketingVisualizer />;
    case 'CASE_DECISION':
      return <CaseDecisionVisualizer />;
    case 'STRING_TRANSFORM':
      return <StringTransformVisualizer />;
    case 'DATE_TIMELINE':
      return <DateTimelineVisualizer />;
    case 'SET_OPERATIONS_VENN':
      return <VennSetVisualizer />;
    case 'SUBQUERY_CTE':
      return <CtePipelineVisualizer variant={variant as CtePipelineVariant | undefined} />;
    case 'WINDOW_ANALYTICAL':
      return <WindowFrameVisualizer />;
    case 'DML_TRANSACTION':
      return <TransactionTimelineVisualizer variant={variant as TransactionTimelineVariant | undefined} />;
    case 'SCHEMA_DDL':
      return <SchemaBlueprintVisualizer variant={variant as SchemaBlueprintVariant | undefined} />;
    case 'BTREE_INDEXING':
      return <BTreeIndexVisualizer variant={variant as BTreeIndexVariant | undefined} />;
    case 'SECURITY_DEFENSE':
      return <SecurityInjectionVisualizer />;
    case 'INTERVIEW_WHITEBOARD':
      return <InterviewWhiteboardVisualizer />;
    default:
      // Tabular projection concepts rely on their authentic source table
      return null;
  }
};

export default ConceptMentalModel;
