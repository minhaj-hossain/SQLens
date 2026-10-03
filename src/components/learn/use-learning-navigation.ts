'use client';
/**
 * useLearningNavigation — the client-side navigation actions for the /learn
 * route tree (Phase 3). Replaces the old state-machine handlers: every action
 * either NAVIGATES to a route URL or does a progress WRITE (via useLearning)
 * followed by navigation. Unlock guards mirror the pre-migration behaviour.
 */
import { useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTrack, useTrackCurriculum } from './use-track';
import { trackLearnUrl, trackRoadmapUrl } from '@/lib/track-routes';
import { type TrackId } from '@/types/track';
import { getTrackModuleById } from '@/tracks/registry';
import { getNextModule } from '@/lib/curriculum/module-order';
import { ModuleData } from '@/types/curriculum';
import {
  getModuleUnlockStatus,
  isConceptCompleted,
  isModuleChallengeUnlocked,
} from '@/lib/progress/unlock-calculator';
import { useLearning } from '@/components/providers/LearningProgressProvider';

export function useLearningNavigation() {
  const router = useRouter();
  const { userState, markConceptComplete, markModuleComplete } = useLearning();
  // Phase 2: the active track comes from the URL (`/sql/…` / `/prisma/…`).
  const track = useTrack();
  const { modules, getModuleById } = useTrackCurriculum();

  const userStateRef = useRef(userState);
  userStateRef.current = userState;
  const routerRef = useRef(router);
  routerRef.current = router;

  /**
   * Navigate to a module at a given stage with the pre-migration guards:
   *  - locked & not completed modules are refused (no navigation)
   *  - 'challenge' requires all concepts done, else routes to the first
   *    incomplete concept's theory page
   */
  const selectModuleAndConcept = useCallback(
    (moduleId: string, conceptId?: string, stage: 'theory' | 'practice' | 'challenge' = 'theory') => {
      const mod = getModuleById(moduleId);
      if (!mod) return;
      const state = userStateRef.current;

      const status = getModuleUnlockStatus(mod, modules, state);
      if (!status.isUnlocked && !state.completedModules[moduleId]) return;

      if (stage === 'challenge') {
        const challengeUnlock = isModuleChallengeUnlocked(mod, modules, state);
        if (!challengeUnlock.isUnlocked) {
          const firstIncomplete =
            mod.concepts.find((c) => !isConceptCompleted(c, mod.id, state)) ?? mod.concepts[0];
          if (firstIncomplete) {
            routerRef.current.push(trackLearnUrl(track, moduleId, 'theory', firstIncomplete.id));
          }
          return;
        }
        routerRef.current.push(trackLearnUrl(track, moduleId, 'challenge'));
        return;
      }

      const target =
        (conceptId && mod.concepts.some((c) => c.id === conceptId) && conceptId) ||
        mod.concepts[0]?.id;
      if (!target) return;
      routerRef.current.push(trackLearnUrl(track, moduleId, stage, target));
    },
    [track],
  );

  /** From a theory page: start the concept's practice (or complete a task-less concept). */
  const startPractice = useCallback((moduleId: string, conceptId: string) => {
    const mod = getModuleById(moduleId);
    const concept = mod?.concepts.find((c) => c.id === conceptId);
    if (!mod || !concept) return;
    if (concept.tasks.length > 0) {
      routerRef.current.push(trackLearnUrl(track, moduleId, 'practice', conceptId, 0));
    } else {
      markConceptComplete(moduleId, conceptId);
      // Task-less concept: advance straight to the next stage.
      navigateAfterConcept(moduleId, conceptId, routerRef.current, track);
    }
  }, [markConceptComplete, track]);

  /** Finish a concept: write progress, then continue to next theory/challenge/complete. */
  const completeConcept = useCallback(
    (moduleId: string, conceptId: string) => {
      markConceptComplete(moduleId, conceptId);
      navigateAfterConcept(moduleId, conceptId, routerRef.current, track);
    },
    [markConceptComplete, track],
  );

  /** Finish the challenge: write full-module completion, show completion screen. */
  const finishModule = useCallback(
    (module: ModuleData) => {
      markModuleComplete(module);
      routerRef.current.push(trackLearnUrl(track, module.id, 'complete'));
    },
    [markModuleComplete, track],
  );

  /** Review a completed module from the first incomplete concept (or the start). */
  const reviewModule = useCallback((moduleId: string) => {
    const mod = getModuleById(moduleId);
    if (!mod) return;
    const firstIncomplete =
      mod.concepts.find((c) => !isConceptCompleted(c, mod.id, userStateRef.current)) ??
      mod.concepts[0];
    if (firstIncomplete) {
      routerRef.current.push(trackLearnUrl(track, moduleId, 'theory', firstIncomplete.id));
    }
  }, [track]);

  /** Continue to the next module's lesson (canonical curriculum order). */
  const continueNextDay = useCallback((moduleId: string) => {
    const mod = getModuleById(moduleId);
    if (!mod) return;
    const next = getNextModule(mod, modules);
    if (!next) return;
    const firstIncomplete =
      next.concepts.find((c) => !isConceptCompleted(c, next.id, userStateRef.current)) ??
      next.concepts[0];
    if (firstIncomplete) {
      routerRef.current.push(trackLearnUrl(track, next.id, 'theory', firstIncomplete.id));
    } else {
      // Phase 5: never push the removed overview URL — fall back to the track
      // roadmap (only reachable for a concept-less module).
      routerRef.current.push(trackRoadmapUrl(track, next.id));
    }
  }, [track]);

  /** Back to the roadmap, auto-scrolling to this module's card. */
  const backToRoadmap = useCallback((highlightDayId?: string) => {
    routerRef.current.push(trackRoadmapUrl(track, highlightDayId));
  }, [track]);

  return {
    selectModuleAndConcept,
    startPractice,
    completeConcept,
    finishModule,
    reviewModule,
    continueNextDay,
    backToRoadmap,
  };
}

/** Shared "what comes after finishing a concept" navigation. */
function navigateAfterConcept(
  moduleId: string,
  conceptId: string,
  router: ReturnType<typeof useRouter>,
  track: TrackId,
) {
  const mod = getTrackModuleById(track, moduleId);
  if (!mod) return;
  const idx = mod.concepts.findIndex((c) => c.id === conceptId);
  const next = idx >= 0 ? mod.concepts[idx + 1] : undefined;
  if (next) {
    router.push(trackLearnUrl(track, moduleId, 'theory', next.id));
  } else if (mod.challenge) {
    router.push(trackLearnUrl(track, moduleId, 'challenge'));
  } else {
    router.push(trackLearnUrl(track, moduleId, 'complete'));
  }
}
