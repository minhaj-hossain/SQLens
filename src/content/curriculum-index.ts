import { ModuleData } from '../types/curriculum';
import { MODULE_PUBLISH_SCHEDULE } from '../config/curriculum-schedule';
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
  DAY_21_MODULE,
  DAY_22_MODULE,
  DAY_23_MODULE,
  DAY_24_MODULE,
  DAY_25_MODULE,
} from './modules/day17to25';

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
  DAY_10_MODULE,
  DAY_11_MODULE,
  DAY_12_MODULE,
  DAY_13_MODULE,
  DAY_14_MODULE,
  DAY_15_MODULE,
  DAY_16_MODULE,
  DAY_17_MODULE,
  DAY_18_MODULE,
  DAY_19_MODULE,
  DAY_20_MODULE,
  DAY_21_MODULE,
  DAY_22_MODULE,
  DAY_23_MODULE,
  DAY_24_MODULE,
  DAY_25_MODULE,
];

/**
 * All modules with publish-schedule overrides merged in.
 * Entries in MODULE_PUBLISH_SCHEDULE take precedence over any
 * `scheduledPublishDate` field defined inside a module's content file.
 */
export const ALL_MODULES: ModuleData[] = RAW_MODULES.map((m) => ({
  ...m,
  scheduledPublishDate: MODULE_PUBLISH_SCHEDULE[m.id] ?? m.scheduledPublishDate,
}));

export function getModuleById(id: string): ModuleData | undefined {
  return ALL_MODULES.find(m => m.id === id);
}

export function getModuleByDay(day: number): ModuleData | undefined {
  return ALL_MODULES.find(m => m.day === day);
}
