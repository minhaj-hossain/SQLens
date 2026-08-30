import { ModuleData } from '../types/curriculum';
import { MODULE_PUBLISH_SCHEDULE } from '../config/curriculum-schedule';
import { MODULE_CURRICULUM_ORDER } from '../config/curriculum-order';
import { DAY_01_MODULE } from './modules/day01';
import { DAY_02_MODULE } from './modules/day02';
import { DAY_03_MODULE } from './modules/day03';
import {
  DAY_04_MODULE,
  DAY_05_MODULE,
  DAY_06_MODULE,
  DAY_07_MODULE,
  DAY_08_MODULE,
} from './modules/day04to08';
import {
  DAY_09_MODULE,
  DAY_10_MODULE,
  DAY_11_MODULE,
  DAY_12_MODULE,
  DAY_13_MODULE,
  DAY_14_MODULE,
  DAY_15_MODULE,
  DAY_16_MODULE,
} from './modules/day09to16';
import {
  DAY_17_MODULE,
  DAY_18_MODULE,
  DAY_19_MODULE,
  DAY_20_MODULE,
  DAY_22_MODULE,
  DAY_23_MODULE,
  DAY_24_MODULE,
  DAY_25_MODULE,
} from './modules/day17to25';
import { CASE_CONDITIONAL_LOGIC_MODULE } from './modules/case-conditional-logic';
import { STRING_FUNCTIONS_MODULE } from './modules/string-functions';
import { DATE_FUNCTIONS_MODULE } from './modules/date-functions';
import { SET_OPERATIONS_MODULE } from './modules/set-operations';
import { WINDOW_RANKING_MODULE } from './modules/window-ranking';
import { WINDOW_RUNNING_METRICS_MODULE } from './modules/window-running-metrics';
import { DML_TRANSACTIONS_MODULE } from './modules/dml-transactions';
import { PERFORMANCE_INDEXING_MODULE } from './modules/performance-indexing';
import { CAPSTONE_BOOKSTORE_MODULE } from './modules/capstone-bookstore';
import { SECURITY_PRODUCTION_SAFETY_MODULE } from './modules/security-production-safety';
import { INTERVIEW_GAUNTLET_MODULE } from './modules/interview-gauntlet';

/** Raw module definitions before schedule overrides are applied. */
const RAW_MODULES: ModuleData[] = [
  DAY_01_MODULE,
  DAY_02_MODULE,
  DAY_03_MODULE,
  DAY_04_MODULE,
  DAY_05_MODULE,
  DAY_06_MODULE,
  DAY_07_MODULE,
  DAY_08_MODULE,
  DAY_09_MODULE,
  CASE_CONDITIONAL_LOGIC_MODULE, // order 10
  STRING_FUNCTIONS_MODULE,       // order 11
  DATE_FUNCTIONS_MODULE,         // order 12
  DAY_10_MODULE,
  DAY_11_MODULE,
  DAY_12_MODULE,
  DAY_13_MODULE,
  SET_OPERATIONS_MODULE,         // order 17
  DAY_14_MODULE,
  DAY_15_MODULE,
  DAY_16_MODULE,
  DAY_17_MODULE,
  DAY_18_MODULE,
  WINDOW_RANKING_MODULE,         // order 23
  WINDOW_RUNNING_METRICS_MODULE, // order 24
  DAY_19_MODULE,
  DML_TRANSACTIONS_MODULE,       // order 26
  DAY_20_MODULE,
  PERFORMANCE_INDEXING_MODULE, // order 31 (reworked Day 21, frozen legacy ID)
  DAY_22_MODULE,
  DAY_23_MODULE,
  DAY_24_MODULE,
  DAY_25_MODULE,
  CAPSTONE_BOOKSTORE_MODULE, // order 33 (Day 33) â€” appended last to keep legacy index stable
  SECURITY_PRODUCTION_SAFETY_MODULE, // order 32 (Day 32) â€” appended last to keep legacy index stable
  INTERVIEW_GAUNTLET_MODULE, // order 37 (Day 37) - appended last to keep legacy index stable
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
