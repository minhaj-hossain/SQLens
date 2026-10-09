'use client';
/**
 * /learn — resume redirect (Phase 3).
 * The resume point depends on localStorage progress (client-only), so this
 * page renders a spinner and navigates in an effect:
 *   first incomplete concept → its theory page
 *   else unfinished challenge → challenge
 *   else the completion screen.
 */
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTrackCurriculum } from '@/components/learn/use-track';
import { deriveLastPosition, isConceptCompleted } from '@/lib/progress/unlock-calculator';
import { trackLearnUrl } from '@/lib/track-routes';
import { useLearning } from '@/components/providers/LearningProgressProvider';

export default function LearnIndexPage() {
  const { userState, isProgressReady } = useLearning();
  const router = useRouter();
  const { track, modules, getModuleById } = useTrackCurriculum();

  useEffect(() => {
    if (!isProgressReady) return;

    const position = deriveLastPosition(modules, userState);
    const mod = getModuleById(position.moduleId) ?? modules[0];
    if (!mod) return;

    const firstIncompleteIdx = mod.concepts.findIndex(
      (c) => !isConceptCompleted(c, mod.id, userState),
    );
    if (firstIncompleteIdx >= 0) {
      const concept = mod.concepts[firstIncompleteIdx];
      if (concept) {
        router.replace(trackLearnUrl(track, mod.id, 'theory', concept.id));
        return;
      }
    }
    if (mod.challenge && !userState.completedModules[mod.id]?.challengeCompleted) {
      router.replace(trackLearnUrl(track, mod.id, 'challenge'));
      return;
    }
    router.replace(trackLearnUrl(track, mod.id, 'complete'));
  }, [isProgressReady, userState, modules, track, getModuleById, router]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <span className="w-8 h-8 rounded-full border-2 border-border border-t-func animate-spin" />
    </div>
  );
}
