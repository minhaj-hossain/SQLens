'use client';

import React from 'react';
import { Concept } from '../../../types/curriculum';
import { ExecutionPipelineVisualizer } from './ExecutionPipelineVisualizer';
import { JoinRelationalVisualizer } from './JoinRelationalVisualizer';
import { GroupBucketingVisualizer } from './GroupBucketingVisualizer';
import { VennSetVisualizer } from './VennSetVisualizer';
import { WindowFrameVisualizer } from './WindowFrameVisualizer';
import { TransactionTimelineVisualizer } from './TransactionTimelineVisualizer';
import { SchemaBlueprintVisualizer } from './SchemaBlueprintVisualizer';
import { BTreeIndexVisualizer } from './BTreeIndexVisualizer';
import { SecurityInjectionVisualizer } from './SecurityInjectionVisualizer';
import { PredicatePatternVisualizer } from './PredicatePatternVisualizer';
import { CaseDecisionVisualizer } from './CaseDecisionVisualizer';
import { StringTransformVisualizer } from './StringTransformVisualizer';
import { DateTimelineVisualizer } from './DateTimelineVisualizer';
import { CtePipelineVisualizer } from './CtePipelineVisualizer';
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
// Concept-ID → archetype overrides.
// These are checked FIRST before the module-level fallback so that individual
// concepts within a multi-topic module can each get the correct visualizer.
// ---------------------------------------------------------------------------
const CONCEPT_ID_OVERRIDES: Record<string, ConceptArchetype> = {
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

  // 3. Universal fallback — shows authentic source table
  return 'TABULAR_PROJECTION';
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
  const diagramDrivenModules = [
    'day-06', 'day-14', 'day-15', 'day-16', 'day-17',
    'day-21', 'day-22',
    'day-23', 'day-24', 'day-26', 'day-27', 'day-28',
    'day-29', 'day-30', 'day-31', 'day-32',
    'day-36', 'day-37', 'day-38',
  ];
  return diagramDrivenModules.includes(mid);
}

interface ConceptMentalModelProps {
  moduleId: string;
  concept: Concept;
}

export const ConceptMentalModel: React.FC<ConceptMentalModelProps> = ({ moduleId, concept }) => {
  const archetype = resolveConceptArchetype(moduleId, concept);

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
      return <CtePipelineVisualizer />;
    case 'WINDOW_ANALYTICAL':
      return <WindowFrameVisualizer />;
    case 'DML_TRANSACTION':
      return <TransactionTimelineVisualizer />;
    case 'SCHEMA_DDL':
      return <SchemaBlueprintVisualizer />;
    case 'BTREE_INDEXING':
      return <BTreeIndexVisualizer />;
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
