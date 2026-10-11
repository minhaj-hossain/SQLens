/**
 * Networking curriculum index — Networking Track.
 * ─────────────────────────────────────────────────────────────────────────────
 * ADDITIVE ONLY. SQL (ALL_MODULES) and Prisma (PRISMA_MODULES) are untouched.
 * Parallel registry for `net-NN` modules, consumed via `src/tracks/registry.ts`.
 */

import { ModuleData } from '../../types/curriculum';
import { NET_01_MODULE } from './modules/net-01';
import { NET_02_MODULE } from './modules/net-02';
import { NET_03_MODULE } from './modules/net-03';
import { NET_04_MODULE } from './modules/net-04';
import { NET_05_MODULE } from './modules/net-05';
import { NET_06_MODULE } from './modules/net-06';
import { NET_07_MODULE } from './modules/net-07';
import { NET_08_MODULE } from './modules/net-08';

const RAW_NETWORKING_MODULES: ModuleData[] = [
  NET_01_MODULE,
  NET_02_MODULE,
  NET_03_MODULE,
  NET_04_MODULE,
  NET_05_MODULE,
  NET_06_MODULE,
  NET_07_MODULE,
  NET_08_MODULE,
];

export const NETWORKING_MODULES: ModuleData[] = RAW_NETWORKING_MODULES.map((m) => ({
  ...m,
  track: 'networking',
}));

export function getNetworkingModuleById(id: string): ModuleData | undefined {
  return NETWORKING_MODULES.find((m) => m.id === id);
}

export function getNetworkingModuleByDay(day: number): ModuleData | undefined {
  return NETWORKING_MODULES.find((m) => m.day === day);
}
