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
import { ALL_MODULES, getModuleById } from '@/content/curriculum-index';
import { isConceptCompleted } from '@/lib/progress/unlock-calculator';
import { learnUrl } from '@/lib/learn-routes';
import { useLearning } from '@/components/providers/LearningProgressProvider';

export default function LearnIndexPage() {
  const { userState } = useLearning();
  const router = useRouter();

  useEffect(() => {
    const mod = getModuleById(userState.currentModuleId) ?? ALL_MODULES[0];
    const firstIncompleteIdx = mod.concepts.findIndex(
      (c) => !isConceptCompleted(c, mod.id, userState),
    );
    if (firstIncompleteIdx >= 0) {
      const concept = mod.concepts[firstIncompleteIdx];
      if (concept) router.replace(learnUrl(mod.id, 'theory', concept.id));
      return;
    }
    if (mod.challenge && !userState.completedModules[mod.id]?.challengeCompleted) {
      router.replace(learnUrl(mod.id, 'challenge'));
      return;
    }
    router.replace(learnUrl(mod.id, 'complete'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <span className="w-8 h-8 rounded-full border-2 border-border border-t-func animate-spin" />
    </div>
  );
}
