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

export type ConceptArchetype =
  | 'TABULAR_PROJECTION'    // Days 1-5, 34
  | 'EXECUTION_PIPELINE'    // Days 6, 16
  | 'RELATIONAL_JOIN'       // Days 7, 14, 15
  | 'GROUP_BUCKETING'       // Days 9, 13
  | 'BRANCHING_TEMPORAL'    // Days 10, 11, 12
  | 'SET_OPERATIONS_VENN'   // Day 17
  | 'SUBQUERY_CTE'          // Days 21, 22
  | 'WINDOW_ANALYTICAL'     // Days 23, 24
  | 'DML_TRANSACTION'       // Days 25, 26
  | 'SCHEMA_DDL'            // Days 27, 28, 29, 30, 33
  | 'BTREE_INDEXING'        // Day 31
  | 'SECURITY_DEFENSE';     // Days 32, 35, 36, 37, 38

/**
 * Resolves the visual presentation archetype for a given module and concept.
 */
export function resolveConceptArchetype(moduleId: string, concept?: Concept): ConceptArchetype {
  const mid = moduleId.toLowerCase();

  if (mid === 'day-06' || mid === 'day-16') return 'EXECUTION_PIPELINE';
  if (mid === 'day-07' || mid === 'day-14' || mid === 'day-15') return 'RELATIONAL_JOIN';
  if (mid === 'day-09' || mid === 'day-13') return 'GROUP_BUCKETING';
  if (mid === 'day-10' || mid === 'day-11' || mid === 'day-12') return 'BRANCHING_TEMPORAL';
  if (mid === 'day-17') return 'SET_OPERATIONS_VENN';
  if (mid === 'day-21' || mid === 'day-22') return 'SUBQUERY_CTE';
  if (mid === 'day-23' || mid === 'day-24') return 'WINDOW_ANALYTICAL';
  if (mid === 'day-25' || mid === 'day-26') return 'DML_TRANSACTION';
  if (mid === 'day-27' || mid === 'day-28' || mid === 'day-29' || mid === 'day-30' || mid === 'day-33') return 'SCHEMA_DDL';
  if (mid === 'day-31') return 'BTREE_INDEXING';
  if (mid === 'day-32' || mid === 'day-35' || mid === 'day-36' || mid === 'day-37' || mid === 'day-38') return 'SECURITY_DEFENSE';

  return 'TABULAR_PROJECTION';
}

/**
 * Whether the top introTable should be suppressed because a dedicated
 * mental model visualizer replaces it or a static table makes no pedagogical sense.
 */
export function shouldSuppressTopIntroTable(moduleId: string): boolean {
  const mid = moduleId.toLowerCase();
  // These modules require conceptual diagrams rather than a flat mock table at top
  const diagramDrivenModules = [
    'day-06', 'day-14', 'day-15', 'day-16', 'day-17',
    'day-23', 'day-24', 'day-26', 'day-27', 'day-28',
    'day-29', 'day-30', 'day-31', 'day-32', 'day-35',
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
    case 'EXECUTION_PIPELINE':
      return <ExecutionPipelineVisualizer />;
    case 'RELATIONAL_JOIN':
      return <JoinRelationalVisualizer />;
    case 'GROUP_BUCKETING':
      return <GroupBucketingVisualizer />;
    case 'SET_OPERATIONS_VENN':
      return <VennSetVisualizer />;
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
    default:
      // Tabular projection concepts rely on their authentic source table
      return null;
  }
};

export default ConceptMentalModel;
