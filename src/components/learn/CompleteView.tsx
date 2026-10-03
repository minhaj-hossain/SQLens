'use client';
/**
 * CompleteView — client view for /learn/[dayId]/complete.
 * Guard: only reachable when the module is actually completed; otherwise
 * redirected to the track roadmap (Phase 5: the day overview page is gone).
 */
import React, { useEffect } from 'react';
import { useRouter, notFound } from 'next/navigation';
import { useTrackCurriculum } from '@/components/learn/use-track';
import { getNextModule } from '@/lib/curriculum/module-order';
import { trackRoadmapUrl } from '@/lib/track-routes';
import { ModuleCompletionView } from '@/components/learning/ModuleCompletionView';
import { useLearning } from '@/components/providers/LearningProgressProvider';
import { useLearningNavigation } from '@/components/learn/use-learning-navigation';

interface CompleteViewProps {
  dayId: string;
}

export default function CompleteView({ dayId }: CompleteViewProps) {
  const { modules: ALL_MODULES, getModuleById, track } = useTrackCurriculum();
  const mod = getModuleById(dayId);
  if (!mod) notFound();

  const { userState, isProgressReady } = useLearning();
  const nav = useLearningNavigation();
  const router = useRouter();

  const isCompleted = Boolean(userState.completedModules[mod.id]);
  useEffect(() => {
    // Phase 3: never redirect while progress is still hydrating.
    if (!isProgressReady) return;
    if (!isCompleted) router.replace(trackRoadmapUrl(track, mod.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCompleted, isProgressReady]);

  if (!isCompleted || !isProgressReady) return null;

  const nextModule = getNextModule(mod, ALL_MODULES);

  return (
    <ModuleCompletionView
      module={mod}
      nextModule={nextModule}
      userState={userState}
      onReviewModule={() => nav.reviewModule(mod.id)}
      onContinueNextDay={() => nav.continueNextDay(mod.id)}
    />
  );
}
