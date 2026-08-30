import { ModuleData } from '../../types/curriculum';

/**
 * Position-independent curriculum ordering helpers.
 * ─────────────────────────────────────────────────────────────────────────────
 * A module's ID is its immutable identity (like a database primary key) and
 * must NEVER encode position. Sequencing is derived from `curriculumOrder`
 * (falling back to the legacy `day` field for the original 25 modules), and
 * user-facing labels come from `displayLabel`. This lets new modules be
 * inserted between existing days (e.g. order 10.5 → "Day 10.5" or any label)
 * without touching IDs or corrupting stored progress.
 */

/** Canonical sort key for a module. */
export function getModuleOrder(module: ModuleData): number {
  return module.curriculumOrder ?? module.day;
}

/** User-facing label ("Day 10"). Cosmetic only — never used for logic. */
export function getModuleDisplayLabel(module: ModuleData): string {
  return module.displayLabel ?? `Day ${module.day}`;
}

/** All modules sorted by canonical curriculum order. */
export function getModulesByOrder(allModules: ModuleData[]): ModuleData[] {
  return [...allModules].sort((a, b) => getModuleOrder(a) - getModuleOrder(b));
}

/** True when the module is the first in the canonical order (always unlocked). */
export function isFirstModule(module: ModuleData, allModules: ModuleData[]): boolean {
  if (allModules.length === 0) return true;
  const minOrder = Math.min(...allModules.map(getModuleOrder));
  return getModuleOrder(module) === minOrder;
}

/** True when the module is the last in the canonical order. */
export function isLastModule(module: ModuleData, allModules: ModuleData[]): boolean {
  if (allModules.length === 0) return true;
  const maxOrder = Math.max(...allModules.map(getModuleOrder));
  return getModuleOrder(module) === maxOrder;
}

/** The module immediately preceding this one in canonical order (or undefined). */
export function getPreviousModule(
  module: ModuleData,
  allModules: ModuleData[]
): ModuleData | undefined {
  const order = getModuleOrder(module);
  const candidates = allModules
    .filter((m) => getModuleOrder(m) < order)
    .sort((a, b) => getModuleOrder(b) - getModuleOrder(a));
  return candidates[0];
}

/** The module immediately following this one in canonical order (or undefined). */
export function getNextModule(
  module: ModuleData,
  allModules: ModuleData[]
): ModuleData | undefined {
  const order = getModuleOrder(module);
  const candidates = allModules
    .filter((m) => getModuleOrder(m) > order)
    .sort((a, b) => getModuleOrder(a) - getModuleOrder(b));
  return candidates[0];
}
