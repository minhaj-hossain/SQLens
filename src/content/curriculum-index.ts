import { ModuleData } from '../types/curriculum';
import { MODULE_PUBLISH_SCHEDULE } from '../config/curriculum-schedule';
import { MODULE_CURRICULUM_ORDER } from '../config/curriculum-order';
import { Day_01_MODULE } from './modules/day-01-select-queries';
import { Day_02_MODULE } from './modules/day-02-where-filtering';
import { Day_03_MODULE } from './modules/day-03-specialized-filtering';
import { Day_04_MODULE } from './modules/day-04-result-shaping';
import { Day_05_MODULE } from './modules/day-05-single-table-pipelines';
import { Day_06_MODULE } from './modules/day-06-query-processing-order';
import { Day_07_MODULE } from './modules/day-07-schema-exploration';
import { Day_08_MODULE } from './modules/day-08-milestone-1-checkpoint';
import { Day_09_MODULE } from './modules/day-09-aggregation-grouping';
import { Day_10_MODULE } from './modules/day-10-case-conditional-logic';
import { Day_11_MODULE } from './modules/day-11-string-functions';
import { Day_12_MODULE } from './modules/day-12-date-functions';
import { Day_13_MODULE } from './modules/day-13-reporting-dashboards';
import { Day_14_MODULE } from './modules/day-14-joins';
import { Day_15_MODULE } from './modules/day-15-fanout-debug-lab';
import { Day_16_MODULE } from './modules/day-16-query-pipeline';
import { Day_17_MODULE } from './modules/day-17-set-operations';
import { Day_18_MODULE } from './modules/day-18-bi-reporting-suite';
import { Day_19_MODULE } from './modules/day-19-hardening-temporal';
import { Day_20_MODULE } from './modules/day-20-milestone-2-checkpoint';
import { Day_21_MODULE } from './modules/day-21-subqueries-ctes';
import { Day_22_MODULE } from './modules/day-22-subquery-cte-practice';
import { Day_23_MODULE } from './modules/day-23-window-ranking';
import { Day_24_MODULE } from './modules/day-24-window-running-metrics';
import { Day_25_MODULE } from './modules/day-25-dml';
import { Day_26_MODULE } from './modules/day-26-dml-transactions';
import { Day_27_MODULE } from './modules/day-27-ddl-creating-tables';
import { Day_28_MODULE } from './modules/day-28-ddl-column-constraints';
import { Day_29_MODULE } from './modules/day-29-ddl-schema-evolution';
import { Day_30_MODULE } from './modules/day-30-schema-design-normalization';
import { Day_31_MODULE } from './modules/day-31-performance-indexing';
import { Day_32_MODULE } from './modules/day-32-security-production-safety';
import { Day_33_MODULE } from './modules/day-33-capstone-bookstore';
import { Day_34_MODULE } from './modules/day-34-backend-api-queries';
import { Day_35_MODULE } from './modules/day-35-zero-state-hardening';
import { Day_36_MODULE } from './modules/day-36-final-assessment';
import { Day_37_MODULE } from './modules/day-37-interview-gauntlet';
import { Day_38_MODULE } from './modules/day-38-graduation-portfolio';

/** Raw module definitions, in canonical day order (1-38). */
const RAW_MODULES: ModuleData[] = [
  Day_01_MODULE,
  Day_02_MODULE,
  Day_03_MODULE,
  Day_04_MODULE,
  Day_05_MODULE,
  Day_06_MODULE,
  Day_07_MODULE,
  Day_08_MODULE,
  Day_09_MODULE,
  Day_10_MODULE,
  Day_11_MODULE,
  Day_12_MODULE,
  Day_13_MODULE,
  Day_14_MODULE,
  Day_15_MODULE,
  Day_16_MODULE,
  Day_17_MODULE,
  Day_18_MODULE,
  Day_19_MODULE,
  Day_20_MODULE,
  Day_21_MODULE,
  Day_22_MODULE,
  Day_23_MODULE,
  Day_24_MODULE,
  Day_25_MODULE,
  Day_26_MODULE,
  Day_27_MODULE,
  Day_28_MODULE,
  Day_29_MODULE,
  Day_30_MODULE,
  Day_31_MODULE,
  Day_32_MODULE,
  Day_33_MODULE,
  Day_34_MODULE,
  Day_35_MODULE,
  Day_36_MODULE,
  Day_37_MODULE,
  Day_38_MODULE,
];

/**
 * All modules with publish-schedule overrides merged in.
 * Entries in MODULE_PUBLISH_SCHEDULE take precedence over any
 * `scheduledPublishDate` field defined inside a module's content file.
 * Position fields are also derived here: legacy modules inherit
 * `curriculumOrder`/`displayLabel` from their `day` so ordering helpers always
 * have a value, while new semantic-ID modules set them explicitly.
 */
export const ALL_MODULES: ModuleData[] = RAW_MODULES.map((m) => ({
  ...m,
  scheduledPublishDate: MODULE_PUBLISH_SCHEDULE[m.id] ?? m.scheduledPublishDate,
  curriculumOrder: m.curriculumOrder ?? MODULE_CURRICULUM_ORDER[m.id]?.curriculumOrder ?? m.day,
  displayLabel: m.displayLabel ?? MODULE_CURRICULUM_ORDER[m.id]?.displayLabel ?? `Day ${m.day}`,
}));

export function getModuleById(id: string): ModuleData | undefined {
  return ALL_MODULES.find(m => m.id === id);
}

export function getModuleByDay(day: number): ModuleData | undefined {
  return ALL_MODULES.find(m => m.day === day);
}

/**
 * Order-based lookup for the position-based sequence. Preferred over
 * getModuleByDay now that modules may have fractional/semantic ordering.
 */
export function getModuleByOrder(order: number): ModuleData | undefined {
  return ALL_MODULES.find(m => (m.curriculumOrder ?? m.day) === order);
}
