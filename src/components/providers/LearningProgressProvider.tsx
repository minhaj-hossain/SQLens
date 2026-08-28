'use client';
/**
 * LearningProgressProvider — the single owner of learning state (Phase 0).
 * Extracted verbatim from AppShell:
 *   - Tier B progress (`userState`) + localStorage sync + cloud hydration,
 *     union-merge, debounced push, pagehide flush.
 *   - The learner's POSITION (module/concept/task/stage/tab) — temporarily
 *     co-located here because every progress handler fuses position + progress
 *     writes. Phase 3 (route migration) peels position out to URL segments.
 *   - All navigation actions (select module, start practice, complete concept,
 *     challenge task success, complete day, reset) with their unlock guards.
 * It owns NO chrome: modals, header, auth screens and page rendering stay in
 * AppShell. Reset boundaries: this provider never touches the SQL executor —
 * AppShell drives `resetDatabase()` from useSqlExecutor() as it does today.
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
import { ALL_MODULES, getModuleById } from '@/content/curriculum-index';
import {
  loadUserState,
  saveUserState,
  resetUserState,
  loadNavSnapshot,
  saveNavSnapshot,
  resetNavSnapshot,
} from '@/lib/progress/storage';
import { UserLearningState, AvailabilityMap } from '@/types/progress';
import { ModuleData, Concept, PracticeTask } from '@/types/curriculum';
import { setAvailabilityMap } from '@/lib/progress/availability-store';
import { mergeProgress, toCloudProgress, CloudProgress } from '@/lib/progress/merge';
import { useAuth } from './AuthProvider';
import {
  getModuleUnlockStatus,
  isConceptCompleted,
  isModuleChallengeUnlocked,
  getCompletedChallengeTaskIds,
} from '@/lib/progress/unlock-calculator';

export type LearningStage =
  | 'lesson'
  | 'practice'
  | 'concept_complete'
  | 'challenge'
  | 'day_complete';

// Active app view. The bottom navigation bar was removed; 'learning-path' is
// the landing view, 'practice' is entered by selecting a module.
// 'settings'/'home' are retained on the type for backward compatibility with
// saved state but are no longer directly navigable.
export type NavTab = 'home' | 'learning-path' | 'practice' | 'schema' | 'settings';

interface LearningContextValue {
  // ---- Tier B: learning progress ------------------------------------------
  userState: UserLearningState;
  setUserState: Dispatch<SetStateAction<UserLearningState>>;
  completedChallengeTaskIds: string[];
  // ---- Position (temporary here; moves to routes in Phase 3) ---------------
  currentModuleId: string;
  setCurrentModuleId: Dispatch<SetStateAction<string>>;
  /**
   * Stable concept slug (Phase 2). `null` = first concept of the module.
   * Views keep receiving the derived numeric `currentConceptIndex` below.
   */
  currentConceptId: string | null;
  setCurrentConceptId: Dispatch<SetStateAction<string | null>>;
  /** Derived from currentConceptId — safe to read, never set directly. */
  currentConceptIndex: number;
  currentTaskIndex: number;
  setCurrentTaskIndex: Dispatch<SetStateAction<number>>;
  stage: LearningStage;
  setStage: Dispatch<SetStateAction<LearningStage>>;
  activeTab: NavTab;
  setActiveTab: Dispatch<SetStateAction<NavTab>>;
  // ---- Derived -------------------------------------------------------------
  currentModule: ModuleData;
  concepts: Concept[];
  currentConcept: Concept | undefined;
  currentTasks: PracticeTask[];
  currentTask: PracticeTask | undefined;
  nextModule: ModuleData | undefined;
  availabilityVersion: number;
  // ---- Actions -------------------------------------------------------------
  applyUrlToNavState: (search: string) => boolean;
  handleSelectModuleAndConcept: (moduleId: string, conceptId?: string, targetStage?: LearningStage) => void;
  handleSelectModule: (moduleId: string) => void;
  handleResetProgress: () => void;
  handleStartPractice: () => void;
  handleTaskSuccess: (userSql: string, hintsUsed: number, viewedSolution: boolean) => void;
  handleCompleteConcept: () => void;
  handleContinueNextConcept: () => void;
  handleChallengeTaskSuccess: (taskId: string, userSql: string) => void;
  handleCompleteDay: () => void;
  handleReviewModule: () => void;
  handleContinueNextDay: () => void;
}

const LearningContext = createContext<LearningContextValue | null>(null);

/**
 * Resolve a position to a VALID concept slug for the given module (Phase 2
 * migration shim). Priority: explicit slug (validated) → legacy numeric index
 * → null (= first concept). Guarantees a stale/renamed slug or an
 * out-of-bounds legacy index can never break navigation.
 */
function resolveConceptId(
  moduleId: string | null | undefined,
  conceptId: string | null | undefined,
  legacyConceptIndex?: number,
): string | null {
  const mod = moduleId ? getModuleById(moduleId) : undefined;
  const concepts = mod?.concepts ?? [];
  if (conceptId && concepts.some((c) => c.id === conceptId)) return conceptId;
  if (typeof legacyConceptIndex === 'number' && concepts[legacyConceptIndex]) {
    return concepts[legacyConceptIndex].id;
  }
  return null;
}

export function LearningProgressProvider({ children }: { children: React.ReactNode }) {
  // On first mount, restore the learner's last navigation position so a reload
  // returns to the same screen (not the homepage). Falls back to saved progress
  // module or day-01.
  const persistedNav = useMemo(() => loadNavSnapshot(), []);

  const [userState, setUserState] = useState<UserLearningState>(() => {
    // Phase 2 shim: persisted states may carry the legacy numeric
    // `currentConceptIndex`. Resolve it to a slug and strip the legacy field.
    const raw = loadUserState();
    const legacyIndex = (raw as { currentConceptIndex?: number }).currentConceptIndex;
    const currentConceptId = resolveConceptId(raw.currentModuleId, raw.currentConceptId, legacyIndex);
    const resolved: UserLearningState = { ...raw, currentConceptId };
    delete (resolved as { currentConceptIndex?: number }).currentConceptIndex;
    return resolved;
  });
  const [currentModuleId, setCurrentModuleId] = useState<string>(
    persistedNav?.moduleId ?? userState.currentModuleId ?? 'day-01'
  );
  const [currentConceptId, setCurrentConceptId] = useState<string | null>(() =>
    resolveConceptId(
      persistedNav?.moduleId,
      persistedNav?.conceptId,
      persistedNav?.legacyConceptIndex,
    )
  );
  const [currentTaskIndex, setCurrentTaskIndex] = useState<number>(persistedNav?.taskIndex ?? 0);
  const [stage, setStage] = useState<LearningStage>(
    (persistedNav?.stage as LearningStage) || 'lesson'
  );
  const [completedChallengeTaskIds, setCompletedChallengeTaskIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<NavTab>(
    (persistedNav?.tab as NavTab) || 'learning-path'
  );

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

  // ---- Phase 2: cross-device progress sync --------------------------------
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
          // Merge guest/local progress with cloud progress → unified state.
          const merged = mergeProgress(latestStateRef.current, body.progress);
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

  // Persist the learner's current navigation position so reloads resume here.
  useEffect(() => {
    saveNavSnapshot({
      moduleId: currentModuleId,
      conceptId: currentConceptId,
      taskIndex: currentTaskIndex,
      stage,
      tab: activeTab,
    });
  }, [currentModuleId, currentConceptId, currentTaskIndex, stage, activeTab]);

  const currentModule: ModuleData = useMemo(() => {
    return getModuleById(currentModuleId) || ALL_MODULES[0];
  }, [currentModuleId]);

  // Derived position (Phase 2): the concept slug is the source of truth; the
  // numeric index is derived for view components that display "Concept N of M".
  const concepts = currentModule.concepts || [];
  const currentConceptIndex = Math.max(
    0,
    concepts.findIndex((c) => c.id === currentConceptId),
  );
  const currentConcept = concepts[currentConceptIndex] ?? concepts[0];
  const currentTasks = currentConcept?.tasks || [];
  const currentTask = currentTasks[currentTaskIndex] || currentTasks[0];

  // Find next module in roadmap
  const nextModule = ALL_MODULES.find((m) => m.day === currentModule.day + 1);


  // ---- Phase P6: URL ↔ lesson navigation sync ----
  // The learning flow is an internal state machine; here we mirror it into the
  // URL as ?day=N&stage=lesson|practice|challenge&concept=I&task=J so the
  // browser Back/Forward buttons, refresh, and shared links all restore the
  // exact lesson position. (Replaced by real routes in Phase 3.)
  const applyingUrlRef = useRef(true); // suppress push-back when we apply a URL
  const userStateRef = useRef(userState);
  userStateRef.current = userState;

  const applyUrlToNavState = useCallback((search: string): boolean => {
    const params = new URLSearchParams(search);
    const dayParam = Number(params.get('day'));
    const stageParam = params.get('stage');
    if (!dayParam || !Number.isFinite(dayParam) || !stageParam) return false;

    const target = getModuleById(`day-${String(dayParam).padStart(2, '0')}`);
    if (!target || !['lesson', 'practice', 'concept_complete', 'challenge', 'day_complete'].includes(stageParam)) {
      return false;
    }

    // Respect unlock rules: never let a URL open a locked module.
    const status = getModuleUnlockStatus(target, ALL_MODULES, userStateRef.current);
    if (!status.isUnlocked && !status.isCompleted && !userStateRef.current.bypassDailyLock) {
      return false;
    }

    const maxConcept = Math.max(0, (target.concepts?.length ?? 1) - 1);
    const conceptIdx = Math.min(Math.max(Number(params.get('concept') ?? 1) - 1, 0), maxConcept);
    const taskIdx = Math.max(Number(params.get('task') ?? 0), 0);

    setCurrentModuleId(target.id);
    // Resolve the legacy 1-based `?concept=` index to a stable concept slug.
    setCurrentConceptId(target.concepts[conceptIdx]?.id ?? null);
    setCurrentTaskIndex(taskIdx);
    setStage(stageParam as LearningStage);
    setActiveTab('practice');
    return true;
  }, []);

  // Deep-link / history navigation (Back & Forward & initial load with params).
  useEffect(() => {
    // Initial load: honour ?day=..&stage=.. links once on mount.
    applyUrlToNavState(window.location.search);

    const onPopState = () => {
      applyingUrlRef.current = true; // restoring from history — don't re-push
      const applied = applyUrlToNavState(window.location.search);
      if (!applied) {
        // No valid lesson params → treat as roadmap view.
        setStage('lesson');
        setActiveTab('learning-path');
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [applyUrlToNavState]);

  // Push a history entry whenever the lesson position changes in-app.
  useEffect(() => {
    const qs = new URLSearchParams();
    const mod = getModuleById(currentModuleId);
    const inLessonFlow =
      mod &&
      ['lesson', 'practice', 'concept_complete', 'challenge', 'day_complete'].includes(stage);

    if (inLessonFlow && mod) {
      qs.set('day', String(mod.day));
      qs.set('stage', stage);
      qs.set('concept', String(currentConceptIndex + 1));
      qs.set('task', String(currentTaskIndex));
    }
    const url = `${window.location.pathname}${qs.toString() ? `?${qs}` : ''}`;
    if (applyingUrlRef.current) {
      applyingUrlRef.current = false;
      // Replace instead of push so restoring from history doesn't duplicate entries.
      window.history.replaceState(null, '', url);
      return;
    }
    window.history.pushState(null, '', url);
  }, [currentModuleId, currentConceptIndex, currentTaskIndex, stage]);

  // On reload into a challenge view, restore completed-task markers from the
  // persisted module record so partial progress survives refresh (not just the
  // all-or-nothing challengeCompleted flag).
  useEffect(() => {
    if (stage === 'challenge' && currentModule.challenge) {
      setCompletedChallengeTaskIds(getCompletedChallengeTaskIds(currentModule, userState));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentModuleId, stage]);

  // Handle module selection from learning path or roadmap
  const handleSelectModuleAndConcept = (
    moduleId: string,
    conceptId?: string,
    targetStage: LearningStage = 'lesson'
  ) => {
    const mod = getModuleById(moduleId);
    if (!mod) return;

    const status = getModuleUnlockStatus(mod, ALL_MODULES, userState);
    if (!status.isUnlocked && !userState.completedModules[moduleId]) return;

    // Resolve the requested concept slug; unknown ids fall back to the first
    // concept of the module.
    const targetConceptId =
      conceptId && mod.concepts.some((c) => c.id === conceptId)
        ? conceptId
        : mod.concepts[0]?.id ?? null;

    // Strict guard: Enforce that user cannot access challenge before completing all module concepts
    if (targetStage === 'challenge') {
      const challengeUnlock = isModuleChallengeUnlocked(mod, ALL_MODULES, userState);
      if (!challengeUnlock.isUnlocked) {
        // Find first unfinished concept and guide the user there
        const firstIncompleteIdx = mod.concepts.findIndex(
          (c) => !isConceptCompleted(c, mod.id, userState)
        );
        setCurrentModuleId(moduleId);
        setCurrentConceptId(
          (firstIncompleteIdx >= 0 ? mod.concepts[firstIncompleteIdx]?.id : null) ??
            mod.concepts[0]?.id ??
            null,
        );
        setCurrentTaskIndex(0);
        setStage('lesson');
        setActiveTab('practice');
        return;
      }

      // If unlocked, take user directly to the Challenge stage
      setCurrentModuleId(moduleId);
      setCurrentConceptId(targetConceptId);
      setCurrentTaskIndex(0);
      setCompletedChallengeTaskIds(mod.challenge ? getCompletedChallengeTaskIds(mod, userState) : []);
      setStage('challenge');
      setActiveTab('practice');
      return;
    }

    setCurrentModuleId(moduleId);
    setCurrentConceptId(targetConceptId);
    setCurrentTaskIndex(0);
    // Non-challenge stages don't render challenge task tabs.
    setCompletedChallengeTaskIds([]);

    if (targetStage === 'day_complete' && userState.completedModules[moduleId]) {
      setStage('day_complete');
    } else {
      setStage(targetStage);
    }

    setActiveTab('practice');
  };


  const handleSelectModule = (moduleId: string) => {
    handleSelectModuleAndConcept(moduleId, undefined, 'lesson');
  };

  const handleResetProgress = () => {
    const fresh = resetUserState();
    resetNavSnapshot();
    setUserState(fresh);
    setCurrentModuleId('day-01');
    setCurrentConceptId(null);
    setCurrentTaskIndex(0);
    setStage('lesson');
    setCompletedChallengeTaskIds([]);
    setActiveTab('learning-path');
  };

  // Step 1: User finishes reading Concept Lesson -> Move to Guided Practice
  const handleStartPractice = () => {
    if (currentTasks.length > 0) {
      // Retain currentTaskIndex if already valid within the current concept; otherwise start at 0
      const validIndex =
        currentTaskIndex >= 0 && currentTaskIndex < currentTasks.length
          ? currentTaskIndex
          : 0;
      setCurrentTaskIndex(validIndex);
      setStage('practice');
    } else {
      handleCompleteConcept();
    }
  };


  // Step 2: Task completed successfully
  const handleTaskSuccess = (userSql: string, hintsUsed: number, viewedSolution: boolean) => {
    setUserState((prev) => {
      const existing = prev.taskAttempts?.[currentTask.id] || {
        taskId: currentTask.id,
        attemptsCount: 0,
        completed: false,
        hintsUsed: 0,
        viewedSolution: false,
      };

      const moduleProgress = prev.completedModules[currentModule.id] || {
        moduleId: currentModule.id,
        completedAt: '',
        completedConcepts: [],
        completedTasks: [],
        challengeCompleted: false,
      };

      const updatedCompletedTasks = [...(moduleProgress.completedTasks || [])];
      if (!updatedCompletedTasks.includes(currentTask.id)) {
        updatedCompletedTasks.push(currentTask.id);
      }

      return {
        ...prev,
        taskAttempts: {
          ...prev.taskAttempts,
          [currentTask.id]: {
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
          [currentModule.id]: {
            ...moduleProgress,
            completedTasks: updatedCompletedTasks,
          },
        },
      };
    });
  };

  // Step 3: All tasks in concept finished -> Advance to next concept / challenge / day complete
  const handleCompleteConcept = () => {
    setUserState((prev) => {
      const moduleProgress = prev.completedModules[currentModule.id];
      const completedConcepts = moduleProgress?.completedConcepts || [];
      if (!completedConcepts.includes(currentConcept.id)) {
        completedConcepts.push(currentConcept.id);
      }
      return {
        ...prev,
        completedModules: {
          ...prev.completedModules,
          [currentModule.id]: {
            moduleId: currentModule.id,
            completedAt: moduleProgress?.completedAt || '',
            completedConcepts,
            completedTasks: moduleProgress?.completedTasks || [],
            challengeCompleted: moduleProgress?.challengeCompleted || false,
          },
        },
      };
    });

    const nextConcept = concepts[currentConceptIndex + 1];
    if (nextConcept) {
      setCurrentConceptId(nextConcept.id);
      setCurrentTaskIndex(0);
      setStage('lesson');
    } else if (currentModule.challenge) {
      setStage('challenge');
    } else {
      handleCompleteDay();
    }
  };


  // Step 3 -> 4: Continue to Next Concept or Independent Challenge
  const handleContinueNextConcept = () => {
    const nextConcept = concepts[currentConceptIndex + 1];
    if (nextConcept) {
      setCurrentConceptId(nextConcept.id);
      setCurrentTaskIndex(0);
      setStage('lesson');
    } else if (currentModule.challenge) {
      setStage('challenge');
    } else {
      handleCompleteDay();
    }
  };

  // Step 4: Challenge Task Success
  const handleChallengeTaskSuccess = (taskId: string, userSql: string) => {
    setCompletedChallengeTaskIds((prev) => {
      if (prev.includes(taskId)) return prev;
      return [...prev, taskId];
    });

    setUserState((prev) => {
      const existing = prev.taskAttempts?.[taskId] || {
        taskId,
        attemptsCount: 0,
        completed: false,
        hintsUsed: 0,
        viewedSolution: false,
      };

      const moduleProgress = prev.completedModules[currentModule.id] || {
        moduleId: currentModule.id,
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
          [currentModule.id]: {
            ...moduleProgress,
            completedTasks: updatedCompletedTasks,
          },
        },
      };
    });
  };


  // Step 4 -> 5: Finish Challenge & Complete Day
  const handleCompleteDay = () => {
    const completedAt = new Date().toISOString();
    setUserState((prev) => ({
      ...prev,
      completedModules: {
        ...prev.completedModules,
        [currentModule.id]: {
          moduleId: currentModule.id,
          completedAt,
          completedConcepts: currentModule.concepts.map((c) => c.id),
          completedTasks: currentModule.concepts.flatMap((c) => c.tasks.map((t) => t.id)),
          challengeCompleted: true,
        },
      },
    }));

    setStage('day_complete');
  };

  // Review today's module from the beginning
  const handleReviewModule = () => {
    setCurrentConceptId(null);
    setCurrentTaskIndex(0);
    setStage('lesson');
  };

  const handleContinueNextDay = () => {
    if (nextModule) {
      handleSelectModule(nextModule.id);
    }
  };

  const value: LearningContextValue = {
    userState,
    setUserState,
    completedChallengeTaskIds,
    currentModuleId,
    setCurrentModuleId,
    currentConceptId,
    setCurrentConceptId,
    currentConceptIndex,
    currentTaskIndex,
    setCurrentTaskIndex,
    stage,
    setStage,
    activeTab,
    setActiveTab,
    currentModule,
    concepts,
    currentConcept,
    currentTasks,
    currentTask,
    nextModule,
    availabilityVersion,
    applyUrlToNavState,
    handleSelectModuleAndConcept,
    handleSelectModule,
    handleResetProgress,
    handleStartPractice,
    handleTaskSuccess,
    handleCompleteConcept,
    handleContinueNextConcept,
    handleChallengeTaskSuccess,
    handleCompleteDay,
    handleReviewModule,
    handleContinueNextDay,
  };

  return <LearningContext.Provider value={value}>{children}</LearningContext.Provider>;
}

export function useLearning(): LearningContextValue {
  const ctx = useContext(LearningContext);
  if (!ctx) throw new Error('useLearning must be used inside <LearningProgressProvider>');
  return ctx;
}

