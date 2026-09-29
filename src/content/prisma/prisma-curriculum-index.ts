/**
 * Prisma curriculum index — Phase 1 (multi-track foundation).
 * ─────────────────────────────────────────────────────────────────────────────
 * ADDITIVE ONLY. `src/content/curriculum-index.ts` (ALL_MODULES, SQL) is NOT
 * modified and stays the single source of truth for SQL. This is the parallel
 * registry for `prisma-NN` modules, consumed only via `src/tracks/registry.ts`.
 */

import { ModuleData } from '../../types/curriculum';
import { MODULE_PUBLISH_SCHEDULE } from '../../config/curriculum-schedule';
import { PRISMA_MODULE_PUBLISH_SCHEDULE } from '../../config/prisma-schedule';
import { PRISMA_MODULE_CURRICULUM_ORDER } from './prisma-curriculum-order';
import { Prisma_01_MODULE } from './modules/prisma-01-why-prisma';

const RAW_PRISMA_MODULES: ModuleData[] = [
  Prisma_01_MODULE,
  // Phase 6 adds prisma-02 … prisma-14 here.
];

export const PRISMA_MODULES: ModuleData[] = RAW_PRISMA_MODULES.map((m) => ({
  ...m,
  track: 'prisma',
  scheduledPublishDate:
    PRISMA_MODULE_PUBLISH_SCHEDULE[m.id] ??
    MODULE_PUBLISH_SCHEDULE[m.id] ??
    m.scheduledPublishDate,
  curriculumOrder:
    m.curriculumOrder ?? PRISMA_MODULE_CURRICULUM_ORDER[m.id]?.curriculumOrder ?? m.day,
  displayLabel:
    m.displayLabel ?? PRISMA_MODULE_CURRICULUM_ORDER[m.id]?.displayLabel ?? `Day ${m.day}`,
}));

export function getPrismaModuleById(id: string): ModuleData | undefined {
  return PRISMA_MODULES.find((m) => m.id === id);
}

export function getPrismaModuleByDay(day: number): ModuleData | undefined {
  return PRISMA_MODULES.find((m) => m.day === day);
}
