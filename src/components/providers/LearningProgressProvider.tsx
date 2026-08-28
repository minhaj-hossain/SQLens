'use client';
/**
 * LearningProgressProvider — the owner of Tier-B learning progress (Phase 3).
 *
 * POSITION IS NO LONGER HERE. With real routes, the URL is the source of
 * truth for module/concept/stage/task (see src/lib/learn-routes.ts and
 * use-learning-navigation.ts). This provider owns:
 *  - `userState`: completedModules/Concepts/Tasks, taskAttempts (incl. draft
 *    SQL), unlockedModuleIds — the Tier-B progress record
 *  - localStorage persistence (instant, offline-safe) + cloud hydration with
 *    union-merge, debounced push and pagehide flush for signed-in users
 *  - curriculum availability fetch (server-controlled unlock overrides)
 *  - PURE progress actions (`mark*`) — writes with NO navigation side effects;
 *    navigation decisions live in use-learning-navigation.ts
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
import { loadUserState, saveUserState, resetUserState } from '@/lib/progress/storage';
import { UserLearningState, AvailabilityMap } from '@/types/progress';
import { ModuleData } from '@/types/curriculum';
import { setAvailabilityMap } from '@/lib/progress/availability-store';
import { mergeProgress, fromCloudProgress, toCloudProgress, CloudProgress } from '@/lib/progress/merge';
import { useAuth } from './AuthProvider';

interface LearningContextValue {
  userState: UserLearningState;
  setUserState: Dispatch<SetStateAction<UserLearningState>>;
  availabilityVersion: number;
  /**
   * Set when a signed-in user has meaningful progress BOTH locally and in the
   * cloud and they differ. While set, no automatic merge has been applied —
   * the user must choose (guest-progress prompt UX, Phase 5).
   */
  mergePrompt: { local: UserLearningState; cloud: CloudProgress } | null;
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
  /** Wipe all progress back to Day 1 (also clears the legacy nav snapshot). */
  resetProgress: () => void;
}

const LearningContext = createContext<LearningContextValue | null>(null);

/** Legacy nav-snapshot key from the pre-route era — cleared on reset. */
const LEGACY_NAV_KEY = 'sql_mastery_nav_v1';

/**
 * Phase 2 shim (kept): persisted states may carry the legacy numeric
 * `currentConceptIndex`. Resolve it to a valid slug and strip the field.
 */
function resolveLegacyPosition(raw: UserLearningState & { currentConceptIndex?: number }): UserLearningState {
  const legacyIndex = raw.currentConceptIndex;
  if (raw.currentConceptId || typeof legacyIndex !== 'number') {
    if (raw.currentConceptId) {
      // Validate: a stale slug falls back to null (= first concept).
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
  const [userState, setUserState] = useState<UserLearningState>(() =>
    resolveLegacyPosition(loadUserState()),
  );

  // Guest-progress prompt state (Phase 5) — see hydration effect below.
  const [mergePrompt, setMergePrompt] = useState<{
    local: UserLearningState;
    cloud: CloudProgress;
  } | null>(null);
  const mergePromptRef = useRef(mergePrompt);
  mergePromptRef.current = mergePrompt;

  // ---- Auth (session user id drives cloud sync) -----------------------------
  const { user: authUser } = useAuth();

  // Server-controlled curriculum availability (Phase 8): fetched once on mount
  // from the public endpoint, registered into the unlock calculator's store,
  // and version-bumped so every roadmap component recomputes with fresh data.
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
        /* Fail open: empty map → default automatic behaviour everywhere. */
      });
    return () => {
      cancelled = true;
    };
  }, []);


  // ---- Cross-device progress sync ------------------------------------------
  // Local writes stay instant & offline-safe. For signed-in users we also
  // hydrate from the server once per session, merge (local ∪ cloud), then
  // keep a debounced copy pushed to /api/me/progress (with retry + flush).
  const signedInUserId =
    authUser?.id && authUser.status !== 'blocked' ? authUser.id : null;

  const hydratedForUserRef = useRef<string | null>(null);
  const latestStateRef = useRef(userState);
  latestStateRef.current = userState;
  const signedInUserIdRef = useRef<string | null>(null);
  signedInUserIdRef.current = signedInUserId;
  const pendingPushRef = useRef(false);
  const lastPushedJsonRef = useRef<string | null>(null);
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryCountRef = useRef(0);

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
      // Network failure — localStorage already holds the data; retry w/ backoff.
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


  useEffect(() => {
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
        if (cancelled || !r.ok) return;
        const body = (await r.json()) as { progress: CloudProgress | null };
        if (cancelled) return;
        if (body.progress) {
          // Guest-progress prompt (Phase 5): if BOTH sides have meaningful
          // progress and they differ, let the user choose. Otherwise keep the
          // silent union-merge (covers: empty cloud → upload local, empty
          // local → take cloud, identical progress → no-op).
          const local = latestStateRef.current;
          const cloud = body.progress;
          const localKeys = Object.keys(local.completedModules ?? {}).sort().join(',');
          const cloudKeys = Object.keys(cloud.completedModules ?? {}).sort().join(',');
          const divergent =
            localKeys.length > 0 && cloudKeys.length > 0 && localKeys !== cloudKeys;
          if (divergent) {
            if (cancelled) return;
            setMergePrompt({ local, cloud });
            return;
          }
          // Merge guest/local progress with cloud progress → unified state.
          const merged = mergeProgress(local, cloud);
          latestStateRef.current = merged;
          setUserState(merged);
          await pushCloudNow(); // persist merged result immediately
        } else {
          // First sign-in with no cloud doc — upload existing local progress.
          await pushCloudNow();
        }
      } catch {
        /* offline — the debounced saver will reconcile on the next change */
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signedInUserId]);

  // Sync state with localStorage (instant — offline-safe source of truth)
  useEffect(() => {
    saveUserState(userState);
  }, [userState]);

  // Debounced cloud sync for signed-in users (skips no-op / already-synced
  // state, e.g. the write performed by hydration itself).
  useEffect(() => {
    if (!signedInUserId || hydratedForUserRef.current !== signedInUserId) return;
    if (lastPushedJsonRef.current === JSON.stringify(toCloudProgress(userState))) return;
    pendingPushRef.current = true;
    const t = setTimeout(() => void pushCloudNow(), 1500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userState, signedInUserId]);

  // Flush pending cloud saves when the tab is closed or hidden.
  useEffect(() => {
    const flush = () => {
      if (!signedInUserIdRef.current || !pendingPushRef.current) return;
      try {
        void fetch('/api/me/progress', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ progress: toCloudProgress(latestStateRef.current) }),
          keepalive: true, // survives tab unload
        });
        pendingPushRef.current = false;
      } catch {
        /* nothing more we can do on unload */
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


  // ---- Pure progress actions (no navigation; writes only) ------------------

  const markTaskComplete = useCallback(
    (args: { taskId: string; moduleId: string; userSql: string; hintsUsed: number; viewedSolution: boolean }) => {
      const { taskId, moduleId, userSql, hintsUsed, viewedSolution } = args;
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

        return {
          ...prev,
          taskAttempts: {
            ...prev.taskAttempts,
            [taskId]: {
              ...existing,
              attemptsCount: (existing.attemptsCount || 0) + 1,
              completed: true,
              hintsUsed: Math.max(existing.hintsUsed || 0, hintsUsed),
              viewedSolution: existing.viewedSolution || viewedSolution,
              lastSubmittedSql: userSql,
              completedAt: new Date().toISOString(),
            },
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

        return {
          ...prev,
          taskAttempts: {
            ...prev.taskAttempts,
            [taskId]: {
              ...existing,
              attemptsCount: (existing.attemptsCount || 0) + 1,
              completed: true,
              lastSubmittedSql: userSql,
              completedAt: new Date().toISOString(),
            },
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
    setUserState((prev) => {
      const moduleProgress = prev.completedModules[moduleId];
      const completedConcepts = moduleProgress?.completedConcepts || [];
      if (!completedConcepts.includes(conceptId)) {
        completedConcepts.push(conceptId);
      }
      return {
        ...prev,
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

  const resetProgress = useCallback(() => {
    const fresh = resetUserState();
    // Clear the legacy pre-route navigation snapshot (Phase 3 cleanup).
    try {
      localStorage.removeItem(LEGACY_NAV_KEY);
    } catch {
      /* ignore */
    }
    setUserState(fresh);
    setMergePrompt(null);
  }, []);

  /** Guest-progress prompt resolution (Phase 5). */
  const resolveMergePrompt = useCallback((choice: 'combine' | 'useCloud') => {
    const prompt = mergePromptRef.current;
    if (!prompt) return;
    setMergePrompt(null);
    if (choice === 'combine') {
      // Union-merge local ∪ cloud, then persist the merged result.
      const merged = mergeProgress(prompt.local, prompt.cloud);
      latestStateRef.current = merged;
      setUserState(merged);
    } else {
      // Adopt the account's progress; keep local-only dev toggles.
      const adopted = fromCloudProgress(prompt.cloud, prompt.local);
      latestStateRef.current = adopted;
      setUserState(adopted);
    }
    // Persist either way (debounced saver also fires; this is immediate).
    void pushCloudNow();
  }, []);

  const value: LearningContextValue = {
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
  };

  return (
    <LearningContext.Provider value={value}>
      {children}
      {mergePrompt && <MergePromptDialog onResolve={resolveMergePrompt} />}
    </LearningContext.Provider>
  );
}

/** Guest-progress prompt dialog (Phase 5). */
function MergePromptDialog({ onResolve }: { onResolve: (choice: 'combine' | 'useCloud') => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/80 backdrop-blur-sm px-4">
      <div className="bg-surface border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl">
        <h2 className="font-display text-lg font-bold text-text mb-2">
          Keep this learning progress?
        </h2>
        <p className="text-sm text-text-dim font-body leading-relaxed mb-6">
          We found learning progress on this device <em>and</em> in your account, and
          they cover different days. Combine them to keep everything, or use only your
          account&apos;s progress.
        </p>
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

