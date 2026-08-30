/**
 * Canonical curriculum order & display labels.
 * ─────────────────────────────────────────────────────────────────────────────
 * Order (position in the learning journey) and label ("Day N") are decoupled
 * from module IDs. Legacy modules keep their `day-NN` IDs but shift position
 * as new modules are inserted; new modules use semantic IDs.
 * The full 38-day journey is authored: every slot below maps to a real module.
 */
export const MODULE_CURRICULUM_ORDER: Record<string, { curriculumOrder: number; displayLabel: string }> = {
  'day-01': { curriculumOrder: 1, displayLabel: 'Day 1' },
  'day-02': { curriculumOrder: 2, displayLabel: 'Day 2' },
  'day-03': { curriculumOrder: 3, displayLabel: 'Day 3' },
  'day-04': { curriculumOrder: 4, displayLabel: 'Day 4' },
  'day-05': { curriculumOrder: 5, displayLabel: 'Day 5' },
  'day-06': { curriculumOrder: 6, displayLabel: 'Day 6' },
  'day-07': { curriculumOrder: 7, displayLabel: 'Day 7' },
  'day-08': { curriculumOrder: 8, displayLabel: 'Day 8' },
  'day-09': { curriculumOrder: 9, displayLabel: 'Day 9' },
  'case-conditional-logic': { curriculumOrder: 10, displayLabel: 'Day 10' },
  'string-functions': { curriculumOrder: 11, displayLabel: 'Day 11' },
  'date-functions': { curriculumOrder: 12, displayLabel: 'Day 12' },
  'day-10': { curriculumOrder: 13, displayLabel: 'Day 13' },   // Practice: Reporting & Dashboards
  'day-11': { curriculumOrder: 14, displayLabel: 'Day 14' },   // JOINs
  'day-12': { curriculumOrder: 15, displayLabel: 'Day 15' },   // Debug: Fan-Out
  'day-13': { curriculumOrder: 16, displayLabel: 'Day 16' },   // Concept Lab: 7-Stage Pipeline
  'set-operations': { curriculumOrder: 17, displayLabel: 'Day 17' }, // Set Operations (UNION / EXCEPT)
  'day-14': { curriculumOrder: 18, displayLabel: 'Day 18' },   // Project: BI Reporting Suite
  'day-15': { curriculumOrder: 19, displayLabel: 'Day 19' },   // Practice: Hardening & Temporal
  'day-16': { curriculumOrder: 20, displayLabel: 'Day 20' },   // Milestone 2 Checkpoint
  'day-17': { curriculumOrder: 21, displayLabel: 'Day 21' },   // Subqueries & CTEs
  'day-18': { curriculumOrder: 22, displayLabel: 'Day 22' },   // Practice: Subqueries & CTEs
  'window-ranking': { curriculumOrder: 23, displayLabel: 'Day 23' },       // Window Functions I: Ranking
  'window-running-metrics': { curriculumOrder: 24, displayLabel: 'Day 24' }, // Window Functions II: Running Metrics
  'day-19': { curriculumOrder: 25, displayLabel: 'Day 25' },   // DML
  'dml-transactions': { curriculumOrder: 26, displayLabel: 'Day 26' }, // Transactions & atomicity
  'day-20': { curriculumOrder: 27, displayLabel: 'Day 27' },   // DDL I: Creating Tables
  'ddl-column-constraints': { curriculumOrder: 28, displayLabel: 'Day 28' },   // DDL II: Column Constraints
  'ddl-schema-evolution': { curriculumOrder: 29, displayLabel: 'Day 29' },     // DDL III: Schema Evolution & Relationships
  'schema-design-normalization': { curriculumOrder: 30, displayLabel: 'Day 30' }, // Schema Design & Normalization
  'day-21': { curriculumOrder: 31, displayLabel: 'Day 31' },   // Concept Lab: Performance & Indexing
  'capstone-bookstore': { curriculumOrder: 33, displayLabel: 'Day 33' }, // Capstone Project: SQLens Bookstore
  'security-production-safety': { curriculumOrder: 32, displayLabel: 'Day 32' }, // Security & Production Safety (injection live demo)
  'day-22': { curriculumOrder: 34, displayLabel: 'Day 34' },   // Project: Backend API Queries
  'day-23': { curriculumOrder: 35, displayLabel: 'Day 35' },   // Project: Zero-State Hardening
  'day-24': { curriculumOrder: 36, displayLabel: 'Day 36' },   // Final Assessment (reworked in a later batch)
  'interview-gauntlet': { curriculumOrder: 37, displayLabel: 'Day 37' }, // Interview Gauntlet (timed)
  'day-25': { curriculumOrder: 38, displayLabel: 'Day 38' },   // Graduation & Portfolio
};
