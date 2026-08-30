'use client';
/**
 * RoadmapPage — the content of `/` (Phase 3).
 * Renders the learning path; module/concept selection navigates to real
 * /learn routes via useLearningNavigation. `highlightDayId` (from ?highlight=)
 * auto-scrolls to a day card after returning from a lesson; the URL is
 * cleaned once the scroll has happened.
 */
import React from 'react';
import { useRouter } from 'next/navigation';
import { LearningPathView } from './LearningPathView';
import { useLearning } from '@/components/providers/LearningProgressProvider';
import { useUiChrome } from '@/components/providers/UiChromeProvider';
import { useLearningNavigation } from '@/components/learn/use-learning-navigation';
import { ALL_MODULES } from '@/content/curriculum-index';
import { deriveLastPosition } from '@/lib/progress/unlock-calculator';

interface RoadmapPageProps {
  highlightDayId?: string;
}

export default function RoadmapPage({ highlightDayId }: RoadmapPageProps) {
  const { userState } = useLearning();
  const { openSchema } = useUiChrome();
  const { selectModuleAndConcept } = useLearningNavigation();
  const router = useRouter();

  // The resume card reflects where the learner ACTUALLY is — the first module
  // not fully complete at its first incomplete concept (P9.7) — not the stale
  // stored `userState.currentModuleId`, which navigation never updated.
  const position = deriveLastPosition(ALL_MODULES, userState);

  return (
    <LearningPathView
      userState={userState}
      currentModuleId={position.moduleId}
      currentConceptId={position.conceptId}
      onSelectModuleAndConcept={selectModuleAndConcept}
      onOpenSchema={openSchema}
      scrollToModuleId={highlightDayId}
      onScrolledToModule={() => router.replace('/')}
    />
  );
}
