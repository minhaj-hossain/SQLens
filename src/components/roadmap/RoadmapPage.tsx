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

interface RoadmapPageProps {
  highlightDayId?: string;
}

export default function RoadmapPage({ highlightDayId }: RoadmapPageProps) {
  const { userState } = useLearning();
  const { openSchema } = useUiChrome();
  const { selectModuleAndConcept } = useLearningNavigation();
  const router = useRouter();

  return (
    <LearningPathView
      userState={userState}
      currentModuleId={userState.currentModuleId}
      currentConceptId={userState.currentConceptId}
      onSelectModuleAndConcept={selectModuleAndConcept}
      onOpenSchema={openSchema}
      scrollToModuleId={highlightDayId}
      onScrolledToModule={() => router.replace('/')}
    />
  );
}
