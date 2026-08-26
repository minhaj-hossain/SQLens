import type { AvailabilityMap, ModuleAvailability } from '../../types/progress';

/**
 * Client-side holder for the server's curriculum availability configuration.
 *
 * AppShell fetches GET /api/curriculum/availability once on mount and
 * registers it here; the unlock calculator reads it on every computation.
 * Because availability rarely changes mid-session, a plain module variable
 * is sufficient — AppShell re-renders its tree when it sets this, so all
 * roadmap components recompute with fresh values.
 */

let availabilityMap: AvailabilityMap = {};

export function setAvailabilityMap(map: AvailabilityMap | null | undefined): void {
  availabilityMap = map ?? {};
}

export function getAvailabilityMap(): AvailabilityMap {
  return availabilityMap;
}

export function getAvailabilityForModule(dayId: string): ModuleAvailability | null {
  return availabilityMap[dayId] ?? null;
}
