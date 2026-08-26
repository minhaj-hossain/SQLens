import 'server-only';
import { db } from '@/lib/auth';
import type { AvailabilityMap, ModuleAvailability, UnlockMode } from '@/types/progress';

/**
 * Server-side global curriculum-availability control (Phase 8).
 *
 * Stores one document per module in the `module_availability` collection:
 *   { dayId, unlockMode, unlockAt?, updatedAt, updatedBy }
 *
 * Semantics (enforced by the client-side unlock calculator):
 *  - automatic  → default behaviour (previous-module completion + 6 PM cycle)
 *  - manual     → unlocked for everyone immediately (admin override)
 *  - scheduled  → unlocked for everyone once `unlockAt` passes
 *  - locked     → locked for everyone, even if the previous module is done
 */

const VALID_MODES: UnlockMode[] = ['automatic', 'manual', 'scheduled', 'locked'];

function col() {
  return db.collection('module_availability');
}

/** Fetch the full availability map; modules without a doc default to automatic. */
export async function getAllModuleAvailability(): Promise<AvailabilityMap> {
  const docs = await col()
    .find({})
    .project<{ dayId: string; unlockMode: UnlockMode; unlockAt?: Date | null; updatedAt?: Date | null; updatedBy?: string | null }>({
      _id: 0,
      dayId: 1,
      unlockMode: 1,
      unlockAt: 1,
      updatedAt: 1,
      updatedBy: 1,
    })
    .toArray();

  const map: AvailabilityMap = {};
  for (const d of docs) {
    if (!d?.dayId || !VALID_MODES.includes(d.unlockMode)) continue;
    // 'automatic' means "no override" — never expose it in the public map.
    if (d.unlockMode === 'automatic') continue;
    map[d.dayId] = {
      dayId: d.dayId,
      unlockMode: d.unlockMode,
      unlockAt: d.unlockAt ? new Date(d.unlockAt).toISOString() : null,
      updatedAt: d.updatedAt ? new Date(d.updatedAt).toISOString() : null,
      updatedBy: d.updatedBy ?? null,
    };
  }
  return map;
}

export interface SetAvailabilityInput {
  unlockMode: UnlockMode;
  /** ISO datetime string — required (and only used) for the scheduled mode. */
  unlockAt?: string | null;
}

/** Create/update one module's availability. Returns the stored record.
 *  Setting 'automatic' removes the override document entirely so the module
 *  falls back to its built-in progression + 6 PM behaviour. */
export async function setModuleAvailability(
  dayId: string,
  input: SetAvailabilityInput,
  adminId: string,
): Promise<ModuleAvailability> {
  if (!VALID_MODES.includes(input.unlockMode)) {
    throw new Error('invalid_unlock_mode');
  }

  const now = new Date();

  if (input.unlockMode === 'automatic') {
    await col().deleteOne({ dayId });
    return { dayId, unlockMode: 'automatic', unlockAt: null, updatedAt: now.toISOString(), updatedBy: adminId };
  }

  let unlockAt: Date | null = null;
  if (input.unlockMode === 'scheduled') {
    unlockAt = input.unlockAt ? new Date(input.unlockAt) : null;
    if (!unlockAt || isNaN(unlockAt.getTime())) {
      throw new Error('invalid_unlock_at');
    }
  }

  await col().updateOne(
    { dayId },
    {
      $set: {
        unlockMode: input.unlockMode,
        ...(input.unlockMode === 'scheduled' && unlockAt ? { unlockAt } : { unlockAt: null }),
        updatedAt: now,
        updatedBy: adminId,
      },
    },
    { upsert: true },
  );

  return {
    dayId,
    unlockMode: input.unlockMode,
    unlockAt: unlockAt ? unlockAt.toISOString() : null,
    updatedAt: now.toISOString(),
    updatedBy: adminId,
  };
}
