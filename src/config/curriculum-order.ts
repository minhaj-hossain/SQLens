/**
 * Canonical curriculum order & display labels.
 * ─────────────────────────────────────────────────────────────────────────────
 * After the 2026 ID consolidation every module id is `day-NN` and its canonical
 * position ("Day N") equals that id. Ordering still flows through
 * `curriculumOrder`/`displayLabel` so future modules may still be inserted at
 * fractional orders (e.g. 10.5) without re-keying existing modules.
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
  'day-10': { curriculumOrder: 10, displayLabel: 'Day 10' }, // CASE & Conditional Logic
  'day-11': { curriculumOrder: 11, displayLabel: 'Day 11' }, // String Functions
  'day-12': { curriculumOrder: 12, displayLabel: 'Day 12' }, // Date Functions
  'day-13': { curriculumOrder: 13, displayLabel: 'Day 13' }, // Practice: Reporting & Dashboards
  'day-14': { curriculumOrder: 14, displayLabel: 'Day 14' }, // JOINs
  'day-15': { curriculumOrder: 15, displayLabel: 'Day 15' }, // Debug: Fan-Out
  'day-16': { curriculumOrder: 16, displayLabel: 'Day 16' }, // Concept Lab: 7-Stage Pipeline
  'day-17': { curriculumOrder: 17, displayLabel: 'Day 17' }, // Set Operations (UNION / EXCEPT)
  'day-18': { curriculumOrder: 18, displayLabel: 'Day 18' }, // Project: BI Reporting Suite
  'day-19': { curriculumOrder: 19, displayLabel: 'Day 19' }, // Practice: Hardening & Temporal
  'day-20': { curriculumOrder: 20, displayLabel: 'Day 20' }, // Milestone 2 Checkpoint
  'day-21': { curriculumOrder: 21, displayLabel: 'Day 21' }, // Subqueries & CTEs
  'day-22': { curriculumOrder: 22, displayLabel: 'Day 22' }, // Practice: Subqueries & CTEs
  'day-23': { curriculumOrder: 23, displayLabel: 'Day 23' }, // Window Functions I: Ranking
  'day-24': { curriculumOrder: 24, displayLabel: 'Day 24' }, // Window Functions II: Running Metrics
  'day-25': { curriculumOrder: 25, displayLabel: 'Day 25' }, // DML
  'day-26': { curriculumOrder: 26, displayLabel: 'Day 26' }, // Transactions & atomicity
  'day-27': { curriculumOrder: 27, displayLabel: 'Day 27' }, // DDL I: Creating Tables
  'day-28': { curriculumOrder: 28, displayLabel: 'Day 28' }, // DDL II: Column Constraints
  'day-29': { curriculumOrder: 29, displayLabel: 'Day 29' }, // DDL III: Schema Evolution & Relationships
  'day-30': { curriculumOrder: 30, displayLabel: 'Day 30' }, // Schema Design & Normalization
  'day-31': { curriculumOrder: 31, displayLabel: 'Day 31' }, // Concept Lab: Performance & Indexing
  'day-32': { curriculumOrder: 32, displayLabel: 'Day 32' }, // Security & Production Safety
  'day-33': { curriculumOrder: 33, displayLabel: 'Day 33' }, // Capstone Project: SQLens Bookstore
  'day-34': { curriculumOrder: 34, displayLabel: 'Day 34' }, // Project: Backend API Queries
  'day-35': { curriculumOrder: 35, displayLabel: 'Day 35' }, // Project: Zero-State Hardening
  'day-36': { curriculumOrder: 36, displayLabel: 'Day 36' }, // Final Assessment
  'day-37': { curriculumOrder: 37, displayLabel: 'Day 37' }, // Interview Gauntlet (timed)
  'day-38': { curriculumOrder: 38, displayLabel: 'Day 38' }, // Graduation & Portfolio
};
