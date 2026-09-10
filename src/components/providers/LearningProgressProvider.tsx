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
  CloudProgress,
  detectProgressDivergence,
  DivergenceDetails,
} from '@/lib/progress/merge';
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

  // Multi-tab channel & sync suppression refs
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);
  const skipNextBroadcastRef = useRef(false);
  const skipNextPushRef = useRef(false);

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
        const data = event.data;
        if (data?.type === 'PROGRESS_SYNC' && data.state) {
          if (data.userId === signedInUserIdRef.current) {
            skipNextBroadcastRef.current = true;
            skipNextPushRef.current = true;
            latestStateRef.current = data.state;
            setUserState(data.state);
          }
        }
      };
    }

    const onStorage = (e: StorageEvent) => {
      if (e.key && e.newValue && e.key.startsWith('sqlens_progress')) {
        try {
          const incoming = JSON.parse(e.newValue);
          if (incoming?.currentModuleId) {
            skipNextBroadcastRef.current = true;
            skipNextPushRef.current = true;
            latestStateRef.current = incoming;
            setUserState(incoming);
          }
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
    if (syncTimerRef.current) {
      clearTimeout(syncTimerRef.current);
      syncTimerRef.current = null;
    }
    const payload = JSON.stringify({ progress: toCloudProgress(latestStateRef.current) });
    try {
      const r = await fetch('/api/me/progress', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
      });
      if (!r.ok) throw new Error(String(r.status));
      lastPushedJsonRef.current = payload;
      pendingPushRef.current = false;
      retryCountRef.current = 0;
      return true;
    } catch {
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
          // First sign-in with no cloud doc — upload existing guest progress if any
          if (hasGuestProgress) {
            saveUserState(guestState, signedInUserId);
            latestStateRef.current = guestState;
            setUserState(guestState);
            clearGuestState();
          }
          await pushCloudNow();
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
      broadcastChannelRef.current?.postMessage({
        type: 'PROGRESS_SYNC',
        userId: signedInUserId,
        state: userState,
      });
    }
    skipNextBroadcastRef.current = false;
  }, [userState, signedInUserId]);

  // Debounced cloud sync for signed-in users
  useEffect(() => {
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
        // Reset single module progress
        const mod = getModuleById(targetModuleId);
        const next = resetModuleProgress(targetModuleId, latestStateRef.current, mod);
        latestStateRef.current = next;
        saveUserState(next, signedInUserIdRef.current);
        setUserState(next);

        if (!skipNextBroadcastRef.current) {
          broadcastChannelRef.current?.postMessage({
            type: 'PROGRESS_SYNC',
            userId: signedInUserIdRef.current,
            state: next,
          });
        }

        if (signedInUserIdRef.current) {
          await pushCloudNow();
        }
        return;
      }

      // Full curriculum reset back to Day 1
      if (syncTimerRef.current) {
        clearTimeout(syncTimerRef.current);
        syncTimerRef.current = null;
      }
      pendingPushRef.current = false;
      lastPushedJsonRef.current = null;
      skipNextPushRef.current = true;

      const fresh = resetUserState(signedInUserIdRef.current);
      try {
        localStorage.removeItem(LEGACY_NAV_KEY);
      } catch {
        /* ignore */
      }
      latestStateRef.current = fresh;
      saveUserState(fresh, signedInUserIdRef.current);
      setUserState(fresh);
      setMergePrompt(null);

      if (!skipNextBroadcastRef.current) {
        broadcastChannelRef.current?.postMessage({
          type: 'PROGRESS_SYNC',
          userId: signedInUserIdRef.current,
          state: fresh,
        });
      }

      if (signedInUserIdRef.current) {
        try {
          await fetch('/api/me/progress', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            keepalive: true,
          });
        } catch (e) {
          console.error('Failed to delete cloud progress:', e);
        }
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
