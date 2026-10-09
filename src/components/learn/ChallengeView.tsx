'use client';
/**
 * ChallengeView — client view for /learn/[dayId]/challenge.
 * Guard: locked challenge → routed to the first incomplete concept's theory
 * (mirrors the pre-migration handleSelectModuleAndConcept behaviour).
 */
import React, { useEffect } from 'react';
import { useRouter, notFound } from 'next/navigation';
import { useTrack, useTrackCurriculum } from '@/components/learn/use-track';
import {
  isConceptCompleted,
  isModuleChallengeUnlocked,
  getCompletedChallengeTaskIds,
} from '@/lib/progress/unlock-calculator';
import { trackLearnUrl, trackRoadmapUrl } from '@/lib/track-routes';
import { IndependentChallengeView } from '@/components/learning/IndependentChallengeView';
import { useLearning } from '@/components/providers/LearningProgressProvider';
import { useSqlExecutor } from '@/components/providers/SqlExecutorProvider';
import { useLearningNavigation } from '@/components/learn/use-learning-navigation';

interface ChallengeViewProps {
  dayId: string;
}

export default function ChallengeView({ dayId }: ChallengeViewProps) {
  const track = useTrack();
  const { modules: ALL_MODULES, getModuleById } = useTrackCurriculum();
  const mod = getModuleById(dayId);
  if (!mod) notFound();

  const { userState, markChallengeTaskComplete, isProgressReady } = useLearning();
  const { executeQuery, resetDatabase, getDatabaseState, getCommittedState, getTransactionState } = useSqlExecutor();
  const nav = useLearningNavigation();
  const router = useRouter();

  const challengeUnlock = isModuleChallengeUnlocked(mod, ALL_MODULES, userState);
  // Derived from progress (no separate state needed since Phase 3): the view
  // updates as soon as the underlying userState changes.
  const completedTaskIds = getCompletedChallengeTaskIds(mod, userState);

  useEffect(() => {
    // Phase 3: never redirect while progress is still hydrating.
    if (!isProgressReady) return;
    if (!challengeUnlock.isUnlocked) {
      const firstIncomplete =
        mod.concepts.find((c) => !isConceptCompleted(c, mod.id, userState)) ?? mod.concepts[0];
      // Phase 5: never fall back to the removed overview URL — open the first
      // incomplete concept's theory, else the track roadmap (concept-less module).
      if (firstIncomplete) router.replace(trackLearnUrl(track, mod.id, 'theory', firstIncomplete.id));
      else router.replace(trackRoadmapUrl(track, mod.id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [challengeUnlock.isUnlocked, isProgressReady]);

  if (!mod.challenge || !challengeUnlock.isUnlocked || !isProgressReady) return null;

  return (
    <IndependentChallengeView
      challenge={mod.challenge}
      completedTaskIds={completedTaskIds}
      onExecuteSql={executeQuery}
      getDatabaseState={getDatabaseState}
      getCommittedState={getCommittedState}
      getTransactionState={getTransactionState}
      // P0 FIX: idempotent fresh-challenge retries (reset at submit, not just
      // on task switch).
      onResetDatabase={resetDatabase}
      onChallengeTaskSuccess={(taskId, userSql) =>
        markChallengeTaskComplete({ taskId, moduleId: mod.id, userSql })
      }
      onFinishAllChallenges={() => nav.finishModule(mod)}
      onSelectedTaskChange={() => {
        // v2 lifecycle: fresh challenges reset the DB to seed on every task
        // switch; inherit (or default) keeps continuity for connected tasks.
        if (mod.challenge?.databaseLifecycle === 'fresh') resetDatabase();
      }}
      onBackToPractice={() => {
        const last = mod.concepts[mod.concepts.length - 1];
        if (!last) {
          router.push(trackRoadmapUrl(track, mod.id));
          return;
        }
        const taskCount = last.tasks?.length ?? 0;
        if (taskCount > 0) {
          const lastTaskIndex = Math.max(0, taskCount - 1);
          router.push(trackLearnUrl(track, mod.id, 'practice', last.id, lastTaskIndex));
        } else {
          router.push(trackLearnUrl(track, mod.id, 'theory', last.id));
        }
      }}
    />
  );
}
