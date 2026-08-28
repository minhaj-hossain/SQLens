'use client';
/**
 * /learn/[dayId]/challenge — IndependentChallengeView on a real route.
 * Guard: locked challenge → routed to the first incomplete concept's theory
 * (mirrors the pre-migration handleSelectModuleAndConcept behaviour).
 */
import React, { useEffect } from 'react';
import { useParams, useRouter, notFound } from 'next/navigation';
import { ALL_MODULES, getModuleById } from '@/content/curriculum-index';
import {
  isConceptCompleted,
  isModuleChallengeUnlocked,
  getCompletedChallengeTaskIds,
} from '@/lib/progress/unlock-calculator';
import { learnUrl } from '@/lib/learn-routes';
import { IndependentChallengeView } from '@/components/learning/IndependentChallengeView';
import { useLearning } from '@/components/providers/LearningProgressProvider';
import { useSqlExecutor } from '@/components/providers/SqlExecutorProvider';
import { useLearningNavigation } from '@/components/learn/use-learning-navigation';

export default function ChallengePage() {
  const { dayId } = useParams<{ dayId: string }>();
  const mod = getModuleById(dayId);
  if (!mod) notFound();

  const { userState, markChallengeTaskComplete } = useLearning();
  const { executeQuery } = useSqlExecutor();
  const nav = useLearningNavigation();
  const router = useRouter();

  const challengeUnlock = isModuleChallengeUnlocked(mod, ALL_MODULES, userState);
  // Derived from progress (no separate state needed since Phase 3): the view
  // updates as soon as the underlying userState changes.
  const completedTaskIds = getCompletedChallengeTaskIds(mod, userState);

  useEffect(() => {
    if (!challengeUnlock.isUnlocked) {
      const firstIncomplete =
        mod.concepts.find((c) => !isConceptCompleted(c, mod.id, userState)) ?? mod.concepts[0];
      if (firstIncomplete) router.replace(learnUrl(mod.id, 'theory', firstIncomplete.id));
      else router.replace(`/learn/${mod.id}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [challengeUnlock.isUnlocked]);

  if (!mod.challenge || !challengeUnlock.isUnlocked) return null;

  return (
    <IndependentChallengeView
      challenge={mod.challenge}
      completedTaskIds={completedTaskIds}
      onExecuteSql={executeQuery}
      onChallengeTaskSuccess={(taskId, userSql) =>
        markChallengeTaskComplete({ taskId, moduleId: mod.id, userSql })
      }
      onFinishAllChallenges={() => nav.finishModule(mod)}
      onBackToPractice={() => {
        const last = mod.concepts[mod.concepts.length - 1];
        if (last) router.push(learnUrl(mod.id, 'practice', last.id, 0));
      }}
    />
  );
}
