/**
 * Phase 3 — per-track progress.
 *
 * SQL is FROZEN: the same local keys, the same document slot and the same
 * broadcast payloads as before Phase 3 (any drift breaks existing SQL-only
 * readers like admin analytics). Prisma is a separate store in every layer —
 * local keys, the `tracks.prisma` cloud slot, reset scoping and the multitab
 * protocol — so the two tracks can never bleed into each other.
 *
 * The suite runs in the node environment, so it installs a minimal in-memory
 * localStorage/sessionStorage to exercise the real storage layer.
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { LEARNING_CONFIG } from '../../src/config/learning';
import {
  INITIAL_USER_STATE,
  PLAYGROUND_DRAFT_KEY,
  clearGuestState,
  getStorageKey,
  initialStateForTrack,
  loadUserState,
  resetUserState,
  saveUserState,
} from '../../src/lib/progress/storage';
import {
  assertSqlStorageKeysUnchanged,
  getTrackGuestStorageKey,
  getTrackStorageKey,
} from '../../src/lib/progress/track-storage';
import { TRACK_META, trackOfStorageKey } from '../../src/types/track';
import { trackForModuleId } from '../../src/tracks/registry';
import {
  TRACK_PROJECTION,
  emptyTombstone,
  readTrackEpoch,
  readTrackSlice,
  trackResetFragment,
  trackSetFragment,
} from '../../src/lib/progress/track-cloud';
import {
  buildResetMessage,
  buildSyncMessage,
  decideIncomingBroadcast,
} from '../../src/lib/progress/sync-guard';
import type { CloudProgress } from '../../src/lib/progress/merge';
import type { UserLearningState } from '../../src/types/progress';

const SQL_USER_KEY = 'sqlens_progress_user_u_1';
const PRISMA_USER_KEY = 'prismalens_progress_user_u_1';

interface FakeStorage {
  store: Map<string, string>;
}

/** Install an in-memory Web Storage pair so the real storage layer runs here. */
function installFakeWebStorage(): FakeStorage {
  const store = new Map<string, string>();
  const fake = {
    get length() {
      return store.size;
    },
    key: (i: number) => Array.from(store.keys())[i] ?? null,
    getItem: (k: string) => (store.has(k) ? (store.get(k) as string) : null),
    setItem: (k: string, v: string) => {
      store.set(k, String(v));
    },
    removeItem: (k: string) => {
      store.delete(k);
    },
    clear: () => {
      store.clear();
    },
  };
  const g = globalThis as unknown as Record<string, unknown>;
  g.localStorage = fake;
  g.sessionStorage = fake;
  g.window = { localStorage: fake, sessionStorage: fake };
  return { store };
}

let fake: FakeStorage;

beforeAll(() => {
  fake = installFakeWebStorage();
});

afterAll(() => {
  const g = globalThis as unknown as Record<string, unknown>;
  delete g.localStorage;
  delete g.sessionStorage;
  delete g.window;
});

beforeEach(() => {
  fake.store.clear();
});

/** A SQL state four days in. */
function sqlState(): UserLearningState {
  return {
    ...INITIAL_USER_STATE,
    currentModuleId: 'day-04',
    completedModules: {
      'day-01': { moduleId: 'day-01', completedAt: '2026-09-01T00:00:00.000Z' },
    },
  };
}

/** A Prisma state with its pilot module complete. */
function prismaState(): UserLearningState {
  return {
    ...initialStateForTrack('prisma'),
    completedModules: {
      'prisma-01': { moduleId: 'prisma-01', completedAt: '2026-09-02T00:00:00.000Z' },
    },
  };
}

function sqlCloud(): CloudProgress {
  return {
    currentModuleId: 'day-04',
    currentConceptId: null,
    currentTaskIndex: 0,
    challengeTaskIndex: 0,
    taskAttempts: {},
    completedTasks: {},
    completedConcepts: {},
    completedModules: { 'day-01': { moduleId: 'day-01', completedAt: '2026-09-01T00:00:00.000Z' } },
    unlockedModuleIds: ['day-01'],
    lastActiveTimestamp: '2026-09-01T00:00:00.000Z',
  };
}

function prismaCloud(): CloudProgress {
  return {
    ...sqlCloud(),
    currentModuleId: 'prisma-01',
    completedModules: {
      'prisma-01': { moduleId: 'prisma-01', completedAt: '2026-09-02T00:00:00.000Z' },
    },
  };
}

describe('Phase 3 — SQL storage keys are frozen', () => {
  it('keeps every SQL key byte-identical, with or without an explicit track', () => {
    expect(assertSqlStorageKeysUnchanged()).toBe(true);
    expect(getStorageKey()).toBe('sql_mastery_progress_v1');
    expect(getStorageKey(null)).toBe(LEARNING_CONFIG.STORAGE_KEY);
    expect(getStorageKey(undefined, 'sql')).toBe('sql_mastery_progress_v1');
    expect(getStorageKey('u_1')).toBe(SQL_USER_KEY);
    expect(getStorageKey('u_1', 'sql')).toBe(SQL_USER_KEY);
    expect(getTrackStorageKey('sql', 'u_1')).toBe(SQL_USER_KEY);
  });

  it('namespaces Prisma keys away from SQL', () => {
    expect(getTrackStorageKey('prisma')).toBe('prismalens_progress_v1');
    expect(getTrackStorageKey('prisma', 'u_1')).toBe(PRISMA_USER_KEY);
    expect(getTrackGuestStorageKey('prisma')).toBe(TRACK_META.prisma.guestStorageKey);
    expect(getStorageKey('u_1', 'prisma')).toBe(PRISMA_USER_KEY);
    expect(getStorageKey(null, 'prisma')).not.toBe(LEARNING_CONFIG.STORAGE_KEY);
  });

  it('maps keys and module ids back to their owning track', () => {
    expect(trackOfStorageKey(SQL_USER_KEY)).toBe('sql');
    expect(trackOfStorageKey('sql_mastery_progress_v1')).toBe('sql');
    expect(trackOfStorageKey(PRISMA_USER_KEY)).toBe('prisma');
    expect(trackOfStorageKey('prismalens_progress_v1')).toBe('prisma');
    expect(trackOfStorageKey('sql_mastery_nav_v1')).toBeNull();
    expect(trackForModuleId('day-07')).toBe('sql');
    expect(trackForModuleId('prisma-07')).toBe('prisma');
  });
});

describe('Phase 3 — local state is per track', () => {
  it('seeds the track first module and unlocks only it', () => {
    expect(initialStateForTrack('sql').currentModuleId).toBe('day-01');
    expect(initialStateForTrack('prisma').currentModuleId).toBe('prisma-01');
    expect(initialStateForTrack('prisma').unlockedModuleIds).toEqual(['prisma-01']);
    // Fresh copies — never the shared singleton.
    expect(initialStateForTrack('sql')).not.toBe(INITIAL_USER_STATE);
  });

  it('round-trips both tracks into their own keys for one account', () => {
    saveUserState(sqlState(), 'u_1', 'sql');
    saveUserState(prismaState(), 'u_1', 'prisma');
    expect(fake.store.get(SQL_USER_KEY)).toBeTruthy();
    expect(fake.store.get(PRISMA_USER_KEY)).toBeTruthy();

    expect(loadUserState('u_1', 'sql').currentModuleId).toBe('day-04');
    expect(loadUserState('u_1').currentModuleId).toBe('day-04');
    expect(loadUserState('u_1', 'prisma').currentModuleId).toBe('prisma-01');
    expect(Object.keys(loadUserState('u_1', 'prisma').completedModules)).toEqual(['prisma-01']);
  });

  it('falls back to the track default when only the other track has data', () => {
    saveUserState(sqlState(), 'u_1', 'sql');
    const prisma = loadUserState('u_1', 'prisma');
    expect(prisma.currentModuleId).toBe('prisma-01');
    expect(prisma.completedModules).toEqual({});
  });

  it('writes guest progress to the track guest key only', () => {
    saveUserState(prismaState(), null, 'prisma');
    expect(fake.store.has('prismalens_progress_v1')).toBe(true);
    expect(fake.store.has('sql_mastery_progress_v1')).toBe(false);
    expect(loadUserState(null, 'prisma').currentModuleId).toBe('prisma-01');
    expect(loadUserState(null).currentModuleId).toBe('day-01');
  });

  it('clears only the requested track guest key', () => {
    saveUserState(sqlState(), null, 'sql');
    saveUserState(prismaState(), null, 'prisma');
    clearGuestState('prisma');
    expect(fake.store.has('prismalens_progress_v1')).toBe(false);
    expect(fake.store.has('sql_mastery_progress_v1')).toBe(true);
  });
});

describe('Phase 3 — reset is scoped to one track', () => {
  it('resets only the requested track and bumps that epoch alone', () => {
    saveUserState(sqlState(), 'u_1', 'sql');
    saveUserState(prismaState(), 'u_1', 'prisma');

    const fresh = resetUserState('u_1', 0, 'prisma');
    expect(fresh.currentModuleId).toBe('prisma-01');
    expect(fresh.unlockedModuleIds).toEqual(['prisma-01']);
    expect(fresh.resetEpoch).toBe(1);
    expect(fake.store.has(PRISMA_USER_KEY)).toBe(false);
    // The other track's cached progress is untouched.
    expect(loadUserState('u_1', 'sql').currentModuleId).toBe('day-04');
  });

  it('keeps SQL-only cleanup (legacy nav + playground) off the Prisma path', () => {
    saveUserState(sqlState(), null, 'sql');
    fake.store.set('sql_mastery_nav_v1', '{}');
    fake.store.set(PLAYGROUND_DRAFT_KEY, 'SELECT 1;');

    resetUserState(null, 0, 'prisma');
    expect(fake.store.has('sql_mastery_progress_v1')).toBe(true);
    expect(fake.store.has('sql_mastery_nav_v1')).toBe(true);
    expect(fake.store.has(PLAYGROUND_DRAFT_KEY)).toBe(true);

    resetUserState(null, 0, 'sql');
    expect(fake.store.has('sql_mastery_progress_v1')).toBe(false);
    expect(fake.store.has('sql_mastery_nav_v1')).toBe(false);
    expect(fake.store.has(PLAYGROUND_DRAFT_KEY)).toBe(false);
  });

  it('a default reset is still the SQL day-01 reset', () => {
    const fresh = resetUserState(null);
    expect(fresh.currentModuleId).toBe('day-01');
    expect(fresh.unlockedModuleIds).toEqual(['day-01']);
    expect(fresh.resetEpoch).toBe(0);
  });
});

describe('Phase 3 — cloud document layout', () => {
  const NOW = '2026-09-03T00:00:00.000Z';

  it('writes SQL to the identical top-level slot and Prisma under tracks.*', () => {
    expect(trackSetFragment('sql', sqlCloud(), 3, NOW)).toEqual({
      progress: { ...sqlCloud(), resetEpoch: 3 },
      resetEpoch: 3,
      updatedAt: NOW,
    });
    const prismaFragment = trackSetFragment('prisma', prismaCloud(), 7, NOW);
    expect(prismaFragment).toEqual({
      'tracks.prisma': { progress: { ...prismaCloud(), resetEpoch: 7 }, resetEpoch: 7 },
      updatedAt: NOW,
    });
    // A Prisma save never touches the SQL slot.
    expect(prismaFragment.progress).toBeUndefined();
    expect(prismaFragment.resetEpoch).toBeUndefined();
  });

  it('reset fragments mirror the same two shapes', () => {
    const tombstone = emptyTombstone('prisma', NOW, 2);
    expect(trackResetFragment('sql', tombstone, 2, NOW)).toEqual({
      progress: tombstone,
      resetEpoch: 2,
      resetAt: NOW,
      updatedAt: NOW,
    });
    expect(trackResetFragment('prisma', tombstone, 2, NOW)).toEqual({
      'tracks.prisma': { progress: tombstone, resetEpoch: 2, resetAt: NOW },
      updatedAt: NOW,
    });
  });

  it('reads each track from its own slot with an independent epoch', () => {
    const doc = {
      userId: 'u1',
      progress: { ...sqlCloud(), resetEpoch: 1 },
      resetEpoch: 1,
      resetAt: '2026-09-01T00:00:00.000Z',
      tracks: { prisma: { progress: { ...prismaCloud(), resetEpoch: 9 }, resetEpoch: 9 } },
      version: 3,
      updatedAt: NOW,
    };
    expect(readTrackSlice(doc, 'sql')?.progress.currentModuleId).toBe('day-04');
    expect(readTrackEpoch(doc, 'sql')).toBe(1);
    expect(readTrackSlice(doc, 'sql')?.resetAt).toBe('2026-09-01T00:00:00.000Z');
    expect(readTrackSlice(doc, 'prisma')?.progress.currentModuleId).toBe('prisma-01');
    expect(readTrackEpoch(doc, 'prisma')).toBe(9);
    expect(readTrackSlice(doc, 'prisma')?.resetAt).toBeNull();
  });

  it('treats a pre-Phase-3 document as SQL-only', () => {
    const legacy = { userId: 'u1', progress: { ...sqlCloud(), resetEpoch: 4 }, version: 2 };
    expect(readTrackEpoch(legacy, 'sql')).toBe(4);
    expect(readTrackSlice(legacy, 'sql')?.progress.currentModuleId).toBe('day-04');
    expect(readTrackSlice(legacy, 'prisma')).toBeNull();
    expect(readTrackEpoch(legacy, 'prisma')).toBe(0);
  });

  it('handles absent documents and malformed slots', () => {
    expect(readTrackSlice(null, 'sql')).toBeNull();
    expect(readTrackEpoch(null, 'sql')).toBe(0);
    expect(readTrackEpoch({}, 'prisma')).toBe(0);
    expect(readTrackSlice({ progress: 'nope' }, 'sql')).toBeNull();
    expect(readTrackSlice({ tracks: { prisma: {} } }, 'prisma')).toBeNull();
  });

  it('the SQL tombstone is exactly the pre-Phase-3 day-01 state', () => {
    expect(emptyTombstone('sql', NOW, 5)).toEqual({
      currentModuleId: 'day-01',
      currentConceptId: null,
      currentTaskIndex: 0,
      challengeTaskIndex: 0,
      taskAttempts: {},
      completedTasks: {},
      completedConcepts: {},
      completedModules: {},
      unlockedModuleIds: ['day-01'],
      lastActiveTimestamp: NOW,
      resetEpoch: 5,
      resetAt: NOW,
    });
    expect(emptyTombstone('prisma', NOW, 1).currentModuleId).toBe('prisma-01');
    expect(emptyTombstone('prisma', NOW, 1).unlockedModuleIds).toEqual(['prisma-01']);
  });

  it('projects every field both slots need', () => {
    for (const key of ['progress', 'resetEpoch', 'resetAt', 'tracks', 'version', 'updatedAt'] as const) {
      expect(TRACK_PROJECTION[key]).toBe(1);
    }
  });
});

describe('Phase 3 — broadcast protocol is track-aware', () => {
  it('keeps SQL payloads byte-identical (no track field)', () => {
    const msg = buildSyncMessage('u1', sqlState());
    expect(msg).toEqual({ type: 'PROGRESS_SYNC', userId: 'u1', state: sqlState(), resetEpoch: 0 });
    expect('track' in msg).toBe(false);
    expect('track' in buildResetMessage('u1', sqlState())).toBe(false);
  });

  it('stamps the track only when it is not SQL', () => {
    expect(buildSyncMessage('u1', prismaState(), 'prisma').track).toBe('prisma');
    expect(buildResetMessage('u1', prismaState(), 'prisma').track).toBe('prisma');
  });

  it('adopts its own track and ignores the other one', () => {
    const prismaMsg = buildSyncMessage(null, prismaState(), 'prisma');
    // The decision stamps the incoming epoch onto the adopted state.
    expect(decideIncomingBroadcast(prismaMsg, null, 0, 'prisma')).toEqual({
      action: 'adopt-sync',
      state: { ...prismaMsg.state, resetEpoch: 0 },
    });
    expect(decideIncomingBroadcast(prismaMsg, null, 0, 'sql')).toEqual({
      action: 'ignore',
      reason: 'track-mismatch',
    });
  });

  it('treats a pre-Phase-3 sender (no track field) as SQL-only', () => {
    const legacyMsg = buildSyncMessage(null, sqlState());
    expect(decideIncomingBroadcast(legacyMsg, null, 0, 'sql').action).toBe('adopt-sync');
    expect(decideIncomingBroadcast(legacyMsg, null, 0, 'prisma')).toEqual({
      action: 'ignore',
      reason: 'track-mismatch',
    });
  });

  it('keeps the user + epoch gates ahead of the track gate', () => {
    const prismaMsg = buildSyncMessage('u1', prismaState(), 'prisma');
    expect(decideIncomingBroadcast(prismaMsg, 'other_user', 0, 'prisma')).toEqual({
      action: 'ignore',
      reason: 'user-mismatch',
    });
    expect(decideIncomingBroadcast(prismaMsg, 'u1', 5, 'prisma')).toEqual({
      action: 'ignore',
      reason: 'stale-epoch',
    });
  });
});
