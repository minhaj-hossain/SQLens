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
import { Prisma_02_MODULE } from './modules/prisma-02-setup-connection';
import { Prisma_03_MODULE } from './modules/prisma-03-models-constraints';
import { Prisma_04_MODULE } from './modules/prisma-04-relations';
import { Prisma_05_MODULE } from './modules/prisma-05-schema-constraints';
import { Prisma_06_MODULE } from './modules/prisma-06-relations-1-n-1-1';
import { Prisma_07_MODULE } from './modules/prisma-07-referential-actions';
import { Prisma_08_MODULE } from './modules/prisma-08-many-to-many';
import { Prisma_09_MODULE } from './modules/prisma-09-create-writes';
import { Prisma_10_MODULE } from './modules/prisma-10-updating-deleting';
import { Prisma_11_MODULE } from './modules/prisma-11-workflow-init-generate';
import { Prisma_12_MODULE } from './modules/prisma-12-migrations-seeding';
import { Prisma_13_MODULE } from './modules/prisma-13-transactions-batching';
import { Prisma_14_MODULE } from './modules/prisma-14-production-capstone';

const RAW_PRISMA_MODULES: ModuleData[] = [
  Prisma_01_MODULE,
  Prisma_02_MODULE,
  Prisma_03_MODULE,
  Prisma_04_MODULE,
  Prisma_05_MODULE,
  Prisma_06_MODULE,
  Prisma_07_MODULE,
  Prisma_08_MODULE,
  Prisma_09_MODULE,
  Prisma_10_MODULE,
  Prisma_11_MODULE,
  Prisma_12_MODULE,
  Prisma_13_MODULE,
  Prisma_14_MODULE,
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
