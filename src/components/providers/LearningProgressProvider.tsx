'use client';
/**
 * LearningProgressProvider — the owner of Tier-B learning progress (Phase 3 & Sync Overhaul).
 *
 * POSITION IS NO LONGER HERE. With real routes, the URL is the source of
 * truth for module/concept/stage/task (see src/lib/learn-routes.ts and
 * use-learning-navigation.ts). This provider owns:
 *  - `userState`: completedModules/Concepts/Tasks, taskAttempts (incl. draft
 *    SQL), unlockedModuleIds — the Tier-B progress record
 *  - User-scoped localStorage persistence + cloud hydration with deep union-merge,
 *    debounced push, pagehide flush, and focus re-validation
 *  - Multi-tab cross-synchronization via BroadcastChannel & storage events
 *  - Account isolation: prevents account progress leakage on logout/login
 *  - Server-controlled curriculum availability fetch
 *  - PURE progress actions (`mark*`) — writes with NO navigation side effects
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  Dispatch,
  SetStateAction,
} from 'react';
import { getModuleById } from '@/content/curriculum-index';
import { loadUserState, saveUserState, resetUserState, resetModuleProgress, clearGuestState, INITIAL_USER_STATE } from '@/lib/progress/storage';
import { UserLearningState, AvailabilityMap } from '@/types/progress';
import { ModuleData } from '@/types/curriculum';
import { setAvailabilityMap } from '@/lib/progress/availability-store';
import {
  mergeProgress,
  fromCloudProgress,
  toCloudProgress,
  getResetEpoch,
  isResetTombstone,
  CloudProgress,
  detectProgressDivergence,
  DivergenceDetails,
} from '@/lib/progress/merge';
import {
  isInResetQuietWindow,
  shouldPushOnNullCloud,
  buildSyncMessage,
  buildResetMessage,
  decideIncomingBroadcast,
  decideIncomingStorage,
  RESET_QUIET_WINDOW_MS,
} from '@/lib/progress/sync-guard';
import { useAuth } from './AuthProvider';

interface LearningContextValue {
  userState: UserLearningState;
  setUserState: Dispatch<SetStateAction<UserLearningState>>;
  availabilityVersion: number;
  /**
   * Set when a signed-in user has meaningful progress BOTH locally and in the
   * cloud and they differ. While set, no automatic merge has been applied.
   */
  mergePrompt: { local: UserLearningState; cloud: CloudProgress; details?: DivergenceDetails } | null;
  /** Resolve the prompt: 'combine' (union, recommended) or 'useCloud'. */
  resolveMergePrompt: (choice: 'combine' | 'useCloud') => void;
  /** Record a guided practice task attempt/success. */
  markTaskComplete: (args: {
    taskId: string;
    moduleId: string;
    userSql: string;
    hintsUsed: number;
    viewedSolution: boolean;
  }) => void;
  /** Record an independent-challenge task success. */
  markChallengeTaskComplete: (args: { taskId: string; moduleId: string; userSql: string }) => void;
  /** Mark a concept's lessons+tasks as completed. */
  markConceptComplete: (moduleId: string, conceptId: string) => void;
  /** Mark the whole module complete (all concepts+tasks+challenge). */
  markModuleComplete: (module: ModuleData) => void;
  /** Wipe all progress back to Day 1, or reset a specific module's progress. */
  resetProgress: (options?: { moduleId?: string }) => Promise<void>;
  /**
   * Batch 5: the last full-reset error, if the tombstone write failed
   * (offline / 5xx). AppChrome surfaces it instead of navigating into a race
   * where refresh would resurrect. Null = last reset committed (or none yet).
   */
  resetError: string | null;
}


const LearningContext = createContext<LearningContextValue | null>(null);

/** Legacy nav-snapshot key from the pre-route era — cleared on reset. */
const LEGACY_NAV_KEY = 'sql_mastery_nav_v1';

/**
 * Phase 2 shim: persisted states may carry legacy numeric `currentConceptIndex`.
 * Resolve it to a valid slug and strip the field.
 */
function resolveLegacyPosition(raw: UserLearningState & { currentConceptIndex?: number }): UserLearningState {
  const legacyIndex = raw.currentConceptIndex;
  if (raw.currentConceptId || typeof legacyIndex !== 'number') {
    if (raw.currentConceptId) {
      const mod = getModuleById(raw.currentModuleId);
      if (mod && !mod.concepts.some((c) => c.id === raw.currentConceptId)) {
        return { ...raw, currentConceptId: null };
      }
    }
    return raw;
  }
  const mod = getModuleById(raw.currentModuleId);
  const currentConceptId = mod?.concepts[legacyIndex]?.id ?? null;
  const resolved: UserLearningState = { ...raw, currentConceptId };
  delete (resolved as { currentConceptIndex?: number }).currentConceptIndex;
  return resolved;
}

export function LearningProgressProvider({ children }: { children: React.ReactNode }) {
  const { user: authUser } = useAuth();
  const signedInUserId = authUser?.id && authUser.status !== 'blocked' ? authUser.id : null;
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  const [userState, setUserState] = useState<UserLearningState>(() =>
    resolveLegacyPosition(loadUserState(null)),
  );

  // Guest-progress prompt state
  const [mergePrompt, setMergePrompt] = useState<{
    local: UserLearningState;
    cloud: CloudProgress;
    details?: DivergenceDetails;
  } | null>(null);
  const mergePromptRef = useRef(mergePrompt);
  mergePromptRef.current = mergePrompt;

  // Batch 5: last full-reset tombstone error (surfaced by AppChrome).
  const [resetError, setResetError] = useState<string | null>(null);

  // Multi-tab channel
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);
  const skipNextBroadcastRef = useRef(false);
  const skipNextPushRef = useRef(false);
  // Batch 1 — write serialization: abort an in-flight PUT before a reset
  // DELETE so stale bytes cannot land after the reset (V1), and suppress
  // background writers (debounce/pagehide/focus) for a short quiet window
  // after each reset while the DELETE settles.
  const inflightPutRef = useRef<AbortController | null>(null);
  const resetQuietUntilRef = useRef(0);

  // Server-controlled curriculum availability
  const [availabilityVersion, setAvailabilityVersion] = useState(0);
  useEffect(() => {
    let cancelled = false;
    fetch('/api/curriculum/availability')
      .then((r) => (r.ok ? r.json() : { availability: {} }))
      .then((body: { availability?: AvailabilityMap }) => {
        if (cancelled) return;
        setAvailabilityMap(body?.availability ?? {});
        setAvailabilityVersion((v) => v + 1);
      })
      .catch(() => {
        /* Fail open */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const hydratedForUserRef = useRef<string | null>(null);
  const latestStateRef = useRef(userState);
  latestStateRef.current = userState;
  const signedInUserIdRef = useRef<string | null>(null);
  signedInUserIdRef.current = signedInUserId;
  const pendingPushRef = useRef(false);
  const lastPushedJsonRef = useRef<string | null>(null);
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryCountRef = useRef(0);

  /** Multi-tab listener: synchronize tabs in real-time on localhost/browser */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let bc: BroadcastChannel | null = null;
    if ('BroadcastChannel' in window) {
      bc = new BroadcastChannel('sqlens_progress_sync');
      broadcastChannelRef.current = bc;
      bc.onmessage = (event) => {
        // Batch 4: epoch-gated adoption (closes V4). Older-generation senders
        // are stale tabs that haven't converged — ignore them instead of
        // merging old bytes back. Newer-or-equal is adopted WITHOUT pushing
        // back; PROGRESS_RESET additionally drops pendingPush, aborts the
        // in-flight PUT, clears the debounce timer, and extends the quiet
        // window so this tab can never re-upload pre-reset bytes.
        const decision = decideIncomingBroadcast(
          event.data,
          signedInUserIdRef.current,
          getResetEpoch(latestStateRef.current),
        );
        if (decision.action === 'ignore') return;
        if (decision.action === 'adopt-reset') {
          inflightPutRef.current?.abort();
          inflightPutRef.current = null;
          if (syncTimerRef.current) {
            clearTimeout(syncTimerRef.current);
            syncTimerRef.current = null;
          }
          pendingPushRef.current = false;
          retryCountRef.current = 0;
          skipNextBroadcastRef.current = true;
          skipNextPushRef.current = true;
          resetQuietUntilRef.current = Date.now() + RESET_QUIET_WINDOW_MS;
          latestStateRef.current = decision.state;
          saveUserState(decision.state, signedInUserIdRef.current);
          setMergePrompt(null);
          setUserState(decision.state);
          return;
        }
        skipNextBroadcastRef.current = true;
        skipNextPushRef.current = true;
        latestStateRef.current = decision.state;
        setUserState(decision.state);
      };
    }

    const onStorage = (e: StorageEvent) => {
      if (e.key && e.newValue && e.key.startsWith('sqlens_progress')) {
        try {
          const incoming = JSON.parse(e.newValue);
          // Batch 4: same epoch gate for the storage-event path (covers
          // browsers without BroadcastChannel). Older generation ignored.
          const decision = decideIncomingStorage(incoming, getResetEpoch(latestStateRef.current));
          if (decision.action === 'ignore') return;
          if (typeof decision.state?.currentModuleId !== 'string') return;
          skipNextBroadcastRef.current = true;
          skipNextPushRef.current = true;
          latestStateRef.current = decision.state;
          setUserState(decision.state);
        } catch {
          /* ignore */
        }
      }
    };
    window.addEventListener('storage', onStorage);

    return () => {
      bc?.close();
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  /** Immediate PUT of the current local state to the user's cloud doc. */
  const pushCloudNow = async (): Promise<boolean> => {
    if (!signedInUserIdRef.current) return false;
    if (isInResetQuietWindow(resetQuietUntilRef.current, Date.now())) {
      // Batch 1: a reset just settled — drop this background push so stale
      // bytes cannot recreate the deleted doc (V1/V3). The reset's own write
      // path sets lastPushedJsonRef explicitly, so keeping pendingPush false
      // here is safe: there is nothing newer worth pushing yet.
      pendingPushRef.current = false;
      if (process.env.NODE_ENV === 'development') {
        console.debug('[progress] push skipped: inside post-reset quiet window');
      }
      return false;
    }
    if (syncTimerRef.current) {
      clearTimeout(syncTimerRef.current);
      syncTimerRef.current = null;
    }
    // Abort any previous in-flight PUT so only the latest payload lands.
    inflightPutRef.current?.abort();
    const controller = new AbortController();
    inflightPutRef.current = controller;
    const payload = JSON.stringify({ progress: toCloudProgress(latestStateRef.current) });
    try {
      const r = await fetch('/api/me/progress', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        signal: controller.signal,
      });
      if (r.status === 409) {
        // Batch 2: our epoch is older than the server's reset tombstone (stale
        // tab, or a PUT that raced the DELETE). Stop retrying, pull the
        // authoritative tombstone, and converge to Day 1 instead of pushing
        // old bytes back over it.
        pendingPushRef.current = false;
        if (inflightPutRef.current === controller) inflightPutRef.current = null;
        try {
          const conflict = (await r.json()) as { storedEpoch?: number };
          const get = await fetch('/api/me/progress');
          if (get.ok) {
            const fresh = (await get.json()) as { progress: CloudProgress | null };
            if (fresh.progress && getResetEpoch(fresh.progress) >= getResetEpoch(latestStateRef.current)) {
              const adopted = fromCloudProgress(fresh.progress, latestStateRef.current);
              latestStateRef.current = adopted;
              saveUserState(adopted, signedInUserIdRef.current);
              skipNextPushRef.current = true;
              setUserState(adopted);
              setMergePrompt(null);
            }
          }
          if (process.env.NODE_ENV === 'development') {
            console.debug('[progress] stale PUT rejected (409), converged to epoch', conflict.storedEpoch);
          }
        } catch {
          /* offline mid-recovery — local epoch guard still holds next push */
        }
        return false;
      }
      if (!r.ok) throw new Error(String(r.status));
      lastPushedJsonRef.current = payload;
      pendingPushRef.current = false;
      retryCountRef.current = 0;
      if (inflightPutRef.current === controller) inflightPutRef.current = null;
      return true;
    } catch (err) {
      // Batch 1: an aborted PUT (reset superseded it) is intentional — never
      // retry it, or stale bytes would resurrect after the DELETE (V1).
      if (typeof DOMException !== 'undefined' && err instanceof DOMException && err.name === 'AbortError') {
        if (process.env.NODE_ENV === 'development') {
          console.debug('[progress] push aborted (superseded by reset or newer write)');
        }
        if (inflightPutRef.current === controller) inflightPutRef.current = null;
        return false;
      }
      // Network failure — localStorage holds the data; retry w/ backoff.
      if (retryCountRef.current < 3) {
        retryCountRef.current += 1;
        pendingPushRef.current = true;
        syncTimerRef.current = setTimeout(
          () => void pushCloudNow(),
          4000 * retryCountRef.current,
        );
      }
      return false;
    }
  };

  /** User login / logout / switch reconciliation */
  useEffect(() => {
    if (prevUserIdRef.current === undefined) {
      prevUserIdRef.current = signedInUserId;
      if (signedInUserId) {
        const userSaved = loadUserState(signedInUserId);
        if (
          Object.keys(userSaved.taskAttempts ?? {}).length > 0 ||
          Object.keys(userSaved.completedModules ?? {}).length > 0
        ) {
          setUserState(userSaved);
          latestStateRef.current = userSaved;
        }
      }
    } else if (prevUserIdRef.current !== signedInUserId) {
      // User signed out: reset in-memory state to clean guest state so no data leaks
      if (!signedInUserId) {
        prevUserIdRef.current = null;
        hydratedForUserRef.current = null;
        setMergePrompt(null);
        const guestState = resolveLegacyPosition(loadUserState(null));
        setUserState(guestState);
        latestStateRef.current = guestState;
        return;
      }
      // User signed in or switched account:
      prevUserIdRef.current = signedInUserId;
      const userSaved = loadUserState(signedInUserId);
      if (
        Object.keys(userSaved.taskAttempts ?? {}).length > 0 ||
        Object.keys(userSaved.completedModules ?? {}).length > 0
      ) {
        setUserState(userSaved);
        latestStateRef.current = userSaved;
      }
    }

    if (!signedInUserId) {
      hydratedForUserRef.current = null;
      return;
    }
    if (hydratedForUserRef.current === signedInUserId) return; // already done
    hydratedForUserRef.current = signedInUserId;

    let cancelled = false;
    void (async () => {
      try {
        const r = await fetch('/api/me/progress');
        if (cancelled || !r.ok) {
          return;
        }
        const body = (await r.json()) as { progress: CloudProgress | null };
        if (cancelled) return;

        const guestState = resolveLegacyPosition(loadUserState(null));
        const hasGuestProgress =
          Object.keys(guestState.taskAttempts ?? {}).length > 0 ||
          Object.keys(guestState.completedModules ?? {}).length > 0;

        if (body.progress) {
          const cloud = body.progress;
          // Batch 2/3: epoch fencing decides before any timestamp/divergence
          // logic. A newer-epoch tombstone is adopted outright (Day 1 wins, no
          // combine prompt, no union of local bytes back in); an older-epoch
          // cloud snapshot is ignored — local (post-reset) stays and pushes.
          const localEpochNow = getResetEpoch(latestStateRef.current);
          const cloudEpoch = getResetEpoch(cloud);
          if (cloudEpoch > localEpochNow) {
            const adopted = fromCloudProgress(cloud, latestStateRef.current);
            latestStateRef.current = adopted;
            saveUserState(adopted, signedInUserId);
            setUserState(adopted);
            if (hasGuestProgress) clearGuestState();
            setMergePrompt(null);
            lastPushedJsonRef.current = JSON.stringify(toCloudProgress(adopted));
            pendingPushRef.current = false;
            if (cancelled) return;
            return;
          }
          if (localEpochNow > cloudEpoch) {
            if (hasGuestProgress) clearGuestState();
            await pushCloudNow();
            return;
          }
          if (isResetTombstone(cloud) && !hasGuestProgress) {
            const adopted = fromCloudProgress(cloud, latestStateRef.current);
            latestStateRef.current = adopted;
            saveUserState(adopted, signedInUserId);
            setUserState(adopted);
            lastPushedJsonRef.current = JSON.stringify(toCloudProgress(adopted));
            pendingPushRef.current = false;
            return;
          }
          if (hasGuestProgress) {
            const divergence = detectProgressDivergence(guestState, cloud);
            if (divergence.isDivergent) {
              if (cancelled) return;
              setMergePrompt({ local: guestState, cloud, details: divergence });
              return;
            }
          }

          const localSource = hasGuestProgress ? guestState : latestStateRef.current;
          const merged = mergeProgress(localSource, cloud);
          latestStateRef.current = merged;
          saveUserState(merged, signedInUserId);
          setUserState(merged);
          if (hasGuestProgress) clearGuestState();
          await pushCloudNow();
        } else {
          // First sign-in with no cloud doc — upload existing guest progress if any.
          // Batch 1 (V3): without a guest upload, only push when the in-memory
          // state is at least as new as the guest state just loaded, so a stale
          // ref cannot recreate a just-deleted cloud doc.
          if (hasGuestProgress) {
            saveUserState(guestState, signedInUserId);
            latestStateRef.current = guestState;
            setUserState(guestState);
            clearGuestState();
            await pushCloudNow();
          } else if (shouldPushOnNullCloud(latestStateRef.current, guestState)) {
            await pushCloudNow();
          } else if (process.env.NODE_ENV === 'development') {
            console.debug('[progress] hydration upload skipped: stale in-memory state');
          }
        }
      } catch {
        /* offline / network error */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [signedInUserId]);

  /** Window focus / visibility change re-validation (cross-browser / cross-device) */
  useEffect(() => {
    const onFocusOrVisible = async () => {
      // Batch 1: skip revalidation while a reset is settling (V1/V3).
      if (isInResetQuietWindow(resetQuietUntilRef.current, Date.now())) return;
      if (typeof document === 'undefined' || document.visibilityState !== 'visible' || !signedInUserIdRef.current) {
        return;
      }
      try {
        const r = await fetch('/api/me/progress');
        if (!r.ok) return;
        const body = (await r.json()) as { progress: CloudProgress | null };
        if (body.progress) {
          const cloud = body.progress;
          const current = latestStateRef.current;
          // Batch 2/3: epoch first, timestamps second. A newer-epoch cloud doc
          // (reset committed elsewhere) is adopted outright — mergeProgress
          // does exactly this, but adopt explicitly so no prompt/union can run.
          // An older-epoch cloud snapshot is ignored: local already reset.
          if (getResetEpoch(cloud) > getResetEpoch(current)) {
            const adopted = fromCloudProgress(cloud, current);
            latestStateRef.current = adopted;
            saveUserState(adopted, signedInUserIdRef.current);
            skipNextPushRef.current = true;
            setUserState(adopted);
            setMergePrompt(null);
            return;
          }
          if (getResetEpoch(current) > getResetEpoch(cloud)) return;
          const cloudTs = Date.parse(cloud.lastActiveTimestamp ?? '');
          const localTs = Date.parse(current.lastActiveTimestamp ?? '');
          if (cloudTs > localTs) {
            const merged = mergeProgress(current, cloud);
            latestStateRef.current = merged;
            saveUserState(merged, signedInUserIdRef.current);
            skipNextPushRef.current = true;
            setUserState(merged);
          }
        }
      } catch {
        /* offline */
      }
    };

    window.addEventListener('focus', onFocusOrVisible);
    document.addEventListener('visibilitychange', onFocusOrVisible);
    return () => {
      window.removeEventListener('focus', onFocusOrVisible);
      document.removeEventListener('visibilitychange', onFocusOrVisible);
    };
  }, []);

  // Sync state with localStorage (instant — offline-safe, user-scoped)
  useEffect(() => {
    saveUserState(userState, signedInUserId);
    if (!skipNextBroadcastRef.current) {
      // Batch 4: every broadcast carries its epoch so receivers can tell a
      // stale sender from an authoritative one.
      broadcastChannelRef.current?.postMessage(buildSyncMessage(signedInUserId, userState));
    }
    skipNextBroadcastRef.current = false;
  }, [userState, signedInUserId]);

  // Debounced cloud sync for signed-in users
  useEffect(() => {
    // Batch 1: reset just settled — keep the local save, skip the cloud push.
    if (isInResetQuietWindow(resetQuietUntilRef.current, Date.now())) return;
    if (!signedInUserId || hydratedForUserRef.current !== signedInUserId) return;
    if (skipNextPushRef.current) {
      skipNextPushRef.current = false;
      return;
    }
    if (lastPushedJsonRef.current === JSON.stringify(toCloudProgress(userState))) return;
    pendingPushRef.current = true;
    const t = setTimeout(() => void pushCloudNow(), 1500);
    return () => clearTimeout(t);
  }, [userState, signedInUserId]);

  // Flush pending cloud saves when the tab is closed or hidden
  useEffect(() => {
    const flush = () => {
      if (!signedInUserIdRef.current || !pendingPushRef.current) return;
      // Batch 1: never flush inside the post-reset quiet window (V1).
      if (isInResetQuietWindow(resetQuietUntilRef.current, Date.now())) {
        pendingPushRef.current = false;
        return;
      }
      try {
        void fetch('/api/me/progress', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ progress: toCloudProgress(latestStateRef.current) }),
          keepalive: true,
        });
        pendingPushRef.current = false;
      } catch {
        /* nothing more on unload */
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') flush();
    };
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('pagehide', flush);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  // ---- Pure progress actions ------------------------------------------------

  const markTaskComplete = useCallback(
    (args: { taskId: string; moduleId: string; userSql: string; hintsUsed: number; viewedSolution: boolean }) => {
      const { taskId, moduleId, userSql, hintsUsed, viewedSolution } = args;
      const now = new Date().toISOString();
      setUserState((prev) => {
        const existing = prev.taskAttempts?.[taskId] || {
          taskId,
          attemptsCount: 0,
          completed: false,
          hintsUsed: 0,
          viewedSolution: false,
        };

        const moduleProgress = prev.completedModules[moduleId] || {
          moduleId,
          completedAt: '',
          completedConcepts: [],
          completedTasks: [],
          challengeCompleted: false,
        };

        const updatedCompletedTasks = [...(moduleProgress.completedTasks || [])];
        if (!updatedCompletedTasks.includes(taskId)) {
          updatedCompletedTasks.push(taskId);
        }

        const taskRecord = {
          ...existing,
          attemptsCount: (existing.attemptsCount || 0) + 1,
          completed: true,
          hintsUsed: Math.max(existing.hintsUsed || 0, hintsUsed),
          viewedSolution: existing.viewedSolution || viewedSolution,
          lastSubmittedSql: userSql,
          completedAt: now,
        };

        return {
          ...prev,
          lastActiveTimestamp: now,
          taskAttempts: {
            ...prev.taskAttempts,
            [taskId]: taskRecord,
          },
          completedTasks: {
            ...prev.completedTasks,
            [taskId]: taskRecord,
          },
          completedModules: {
            ...prev.completedModules,
            [moduleId]: {
              ...moduleProgress,
              completedTasks: updatedCompletedTasks,
            },
          },
        };
      });
    },
    [],
  );

  const markChallengeTaskComplete = useCallback(
    (args: { taskId: string; moduleId: string; userSql: string }) => {
      const { taskId, moduleId, userSql } = args;
      const now = new Date().toISOString();
      setUserState((prev) => {
        const existing = prev.taskAttempts?.[taskId] || {
          taskId,
          attemptsCount: 0,
          completed: false,
          hintsUsed: 0,
          viewedSolution: false,
        };

        const moduleProgress = prev.completedModules[moduleId] || {
          moduleId,
          completedAt: '',
          completedConcepts: [],
          completedTasks: [],
          challengeCompleted: false,
        };

        const updatedCompletedTasks = [...(moduleProgress.completedTasks || [])];
        if (!updatedCompletedTasks.includes(taskId)) {
          updatedCompletedTasks.push(taskId);
        }

        const taskRecord = {
          ...existing,
          attemptsCount: (existing.attemptsCount || 0) + 1,
          completed: true,
          lastSubmittedSql: userSql,
          completedAt: now,
        };

        return {
          ...prev,
          lastActiveTimestamp: now,
          taskAttempts: {
            ...prev.taskAttempts,
            [taskId]: taskRecord,
          },
          completedTasks: {
            ...prev.completedTasks,
            [taskId]: taskRecord,
          },
          completedModules: {
            ...prev.completedModules,
            [moduleId]: {
              ...moduleProgress,
              completedTasks: updatedCompletedTasks,
            },
          },
        };
      });
    },
    [],
  );

  const markConceptComplete = useCallback((moduleId: string, conceptId: string) => {
    const now = new Date().toISOString();
    setUserState((prev) => {
      const moduleProgress = prev.completedModules[moduleId];
      const completedConcepts = moduleProgress?.completedConcepts || [];
      if (!completedConcepts.includes(conceptId)) {
        completedConcepts.push(conceptId);
      }
      return {
        ...prev,
        currentModuleId: moduleId,
        currentConceptId: conceptId,
        lastActiveTimestamp: now,
        completedConcepts: {
          ...prev.completedConcepts,
          [conceptId]: {
            conceptId,
            moduleId,
            completedAt: now,
          },
        },
        completedModules: {
          ...prev.completedModules,
          [moduleId]: {
            moduleId,
            completedAt: moduleProgress?.completedAt || '',
            completedConcepts,
            completedTasks: moduleProgress?.completedTasks || [],
            challengeCompleted: moduleProgress?.challengeCompleted || false,
          },
        },
      };
    });
  }, []);

  const markModuleComplete = useCallback((module: ModuleData) => {
    const completedAt = new Date().toISOString();
    setUserState((prev) => ({
      ...prev,
      currentModuleId: module.id,
      currentConceptId: null,
      lastActiveTimestamp: completedAt,
      completedModules: {
        ...prev.completedModules,
        [module.id]: {
          moduleId: module.id,
          completedAt,
          completedConcepts: module.concepts.map((c) => c.id),
          completedTasks: module.concepts.flatMap((c) => c.tasks.map((t) => t.id)),
          challengeCompleted: true,
        },
      },
    }));
  }, []);

  const resetProgress = useCallback(
    async (options?: { moduleId?: string }): Promise<void> => {
      const targetModuleId = options?.moduleId;

      if (targetModuleId) {
        // Batch 1: serialize like full reset — drop pending/in-flight writes
        // so the pruned state is what lands, then push it explicitly before
        // opening the quiet window (pushCloudNow stays silent inside it).
        inflightPutRef.current?.abort();
        inflightPutRef.current = null;
        if (syncTimerRef.current) {
          clearTimeout(syncTimerRef.current);
          syncTimerRef.current = null;
        }
        pendingPushRef.current = false;
        const mod = getModuleById(targetModuleId);
        const next = resetModuleProgress(targetModuleId, latestStateRef.current, mod);
        latestStateRef.current = next;
        saveUserState(next, signedInUserIdRef.current);
        setUserState(next);

        if (!skipNextBroadcastRef.current) {
          broadcastChannelRef.current?.postMessage(
            buildSyncMessage(signedInUserIdRef.current, next),
          );
        }

        if (signedInUserIdRef.current) {
          await pushCloudNow();
        }
        resetQuietUntilRef.current = Date.now() + RESET_QUIET_WINDOW_MS;
        return;
      }

      // Full curriculum reset back to Day 1.
      // Batch 2: the reset bumps resetEpoch and commits an authoritative
      // server tombstone (DELETE writes epoch+1 empty doc, not deleteOne), so
      // racing/stale PUTs are 409-rejected and later GETs converge to Day 1.
      if (syncTimerRef.current) {
        clearTimeout(syncTimerRef.current);
        syncTimerRef.current = null;
      }
      pendingPushRef.current = false;
      lastPushedJsonRef.current = null;
      skipNextPushRef.current = true;

      const fresh = resetUserState(signedInUserIdRef.current, getResetEpoch(latestStateRef.current));
      try {
        localStorage.removeItem(LEGACY_NAV_KEY);
      } catch {
        /* ignore */
      }
      // Batch 1 (V1): abort any in-flight PUT so stale bytes cannot land
      // after the DELETE below, then open a quiet window that silences
      // background writers while the reset settles.
      inflightPutRef.current?.abort();
      inflightPutRef.current = null;
      resetQuietUntilRef.current = Date.now() + RESET_QUIET_WINDOW_MS;
      latestStateRef.current = fresh;
      saveUserState(fresh, signedInUserIdRef.current);
      setUserState(fresh);
      setMergePrompt(null);

      if (!skipNextBroadcastRef.current) {
        // Batch 4: PROGRESS_RESET (not SYNC) — stale tabs that receive it drop
        // their pendingPush, abort in-flight PUTs, and converge to Day 1
        // instead of re-uploading their older epoch.
        broadcastChannelRef.current?.postMessage(
          buildResetMessage(signedInUserIdRef.current, fresh),
        );
      }

      if (signedInUserIdRef.current) {
        try {
          const r = await fetch('/api/me/progress', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            keepalive: true,
          });
          if (!r.ok) {
            // Batch 5: tombstone write failed (offline / 5xx). Local is Day 1
            // but the cloud still holds old progress — a refresh would
            // resurrect. Record the error and THROW so AppChrome stays on the
            // page with a retry instead of navigating into the race.
            // Local state is intentionally left at Day 1: the next online
            // reset (or any push of this newer epoch) still converges.
            const message = `Cloud reset failed (HTTP ${r.status}). Your progress looks reset on this device, but the server still holds the old data — reconnect and retry the reset before refreshing.`;
            setResetError(message);
            throw new Error(message);
          }
          setResetError(null);
          if (r.ok) {
            // Adopt the server's authoritative epoch (covers the race where a
            // concurrent reset elsewhere already bumped past ours) so local,
            // cloud, and other tabs agree on the generation.
            try {
              const committed = (await r.json()) as { resetEpoch?: number; resetAt?: string };
              if (typeof committed.resetEpoch === 'number' && committed.resetEpoch !== getResetEpoch(latestStateRef.current)) {
                const synced: typeof fresh = {
                  ...fresh,
                  resetEpoch: committed.resetEpoch,
                  resetAt: committed.resetAt ?? fresh.resetAt ?? null,
                };
                latestStateRef.current = synced;
                saveUserState(synced, signedInUserIdRef.current);
                skipNextPushRef.current = true;
                setUserState(synced);
                lastPushedJsonRef.current = JSON.stringify(toCloudProgress(synced));
              } else {
                lastPushedJsonRef.current = JSON.stringify(toCloudProgress(fresh));
              }
            } catch {
              lastPushedJsonRef.current = JSON.stringify(toCloudProgress(fresh));
            }
          }
        } catch (e) {
          // Batch 5: network threw (offline tab-close etc.) — same contract as
          // !r.ok above: surface + rethrow so callers don't navigate away.
          // The console.error stays for debugging; the throw drives the UI.
          console.error('Failed to reset cloud progress:', e);
          if (e instanceof Error && e.message.startsWith('Cloud reset failed')) throw e;
          const message =
            'Cloud reset failed (network error). Your progress looks reset on this device, but the server may still hold the old data — reconnect and retry the reset before refreshing.';
          setResetError(message);
          throw new Error(message);
        }
      } else {
        setResetError(null);
      }
    },
    [],
  );


  /** Guest-progress prompt resolution */
  const resolveMergePrompt = useCallback((choice: 'combine' | 'useCloud') => {
    const prompt = mergePromptRef.current;
    if (!prompt) return;
    setMergePrompt(null);
    if (choice === 'combine') {
      const merged = mergeProgress(prompt.local, prompt.cloud);
      latestStateRef.current = merged;
      saveUserState(merged, signedInUserIdRef.current);
      setUserState(merged);
    } else {
      const adopted = fromCloudProgress(prompt.cloud, prompt.local);
      latestStateRef.current = adopted;
      saveUserState(adopted, signedInUserIdRef.current);
      setUserState(adopted);
    }
    clearGuestState();
    void pushCloudNow();
  }, []);

  const value: LearningContextValue = useMemo(
    () => ({
      userState,
      setUserState,
      availabilityVersion,
      mergePrompt,
      resolveMergePrompt,
      markTaskComplete,
      markChallengeTaskComplete,
      markConceptComplete,
      markModuleComplete,
      resetProgress,
      resetError,
    }),
    [
      userState,
      availabilityVersion,
      mergePrompt,
      resolveMergePrompt,
      markTaskComplete,
      markChallengeTaskComplete,
      markConceptComplete,
      markModuleComplete,
      resetProgress,
      resetError,
    ],
  );

  return (
    <LearningContext.Provider value={value}>
      {children}
      {mergePrompt && (
        <MergePromptDialog prompt={mergePrompt} onResolve={resolveMergePrompt} />
      )}
    </LearningContext.Provider>
  );
}

/** Informative guest-progress prompt dialog with divergence stats */
function MergePromptDialog({
  prompt,
  onResolve,
}: {
  prompt: { local: UserLearningState; cloud: CloudProgress; details?: DivergenceDetails };
  onResolve: (choice: 'combine' | 'useCloud') => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/80 backdrop-blur-sm px-4">
      <div className="bg-surface border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl">
        <h2 className="font-display text-lg font-bold text-text mb-2">
          Keep this device&apos;s learning progress?
        </h2>
        <p className="text-sm text-text-dim font-body leading-relaxed mb-4">
          We found progress on this browser and in your cloud account. Combine them to keep everything, or use only your account&apos;s saved progress.
        </p>

        {prompt.details && (
          <div className="bg-surface-2 border border-border/70 rounded-xl p-3 mb-5 text-xs font-mono space-y-1.5">
            <div className="flex justify-between items-center text-text">
              <span className="text-text-dim">This device:</span>
              <span className="font-semibold text-func">
                {prompt.details.localTaskCount} task{prompt.details.localTaskCount === 1 ? '' : 's'} completed
              </span>
            </div>
            <div className="flex justify-between items-center text-text">
              <span className="text-text-dim">Account (cloud):</span>
              <span className="font-semibold text-text">
                {prompt.details.cloudTaskCount} task{prompt.details.cloudTaskCount === 1 ? '' : 's'} completed
              </span>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
          <button
            onClick={() => onResolve('useCloud')}
            className="px-4 py-2.5 rounded-lg border border-border font-mono text-xs text-text-dim hover:text-text hover:border-text-dim transition"
          >
            Use my account&apos;s progress
          </button>
          <button
            onClick={() => onResolve('combine')}
            className="px-4 py-2.5 rounded-lg bg-func text-ink font-mono text-xs font-bold hover:brightness-110 transition"
          >
            Combine both (recommended)
          </button>
        </div>
      </div>
    </div>
  );
}

export function useLearning(): LearningContextValue {
  const ctx = useContext(LearningContext);
  if (!ctx) throw new Error('useLearning must be used inside <LearningProgressProvider>');
  return ctx;
}
