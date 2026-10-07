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
import { useTrackCurriculum } from '@/components/learn/use-track';
import { deriveLastPosition } from '@/lib/progress/unlock-calculator';
import ResetProgressModal from '@/components/ui/ResetProgressModal';

interface RoadmapPageProps {
  highlightDayId?: string;
}

export default function RoadmapPage({ highlightDayId }: RoadmapPageProps) {
  const { userState, resetProgress, resetError } = useLearning();
  const { modules } = useTrackCurriculum();
  const { openSchema } = useUiChrome();
  const { selectModuleAndConcept } = useLearningNavigation();
  const router = useRouter();
  const [resetModalOpen, setResetModalOpen] = React.useState(false);

  // The resume card reflects where the learner ACTUALLY is — the first module
  // not fully complete at its first incomplete concept (P9.7) — not the stale
  // stored `userState.currentModuleId`, which navigation never updated.
  const position = deriveLastPosition(modules, userState);

  const handleScrolledToModule = () => {
    // Clean ?highlight= query param from the browser URL without triggering
    // Next.js route navigation (which causes window scroll to snap to top).
    if (typeof window !== 'undefined' && window.location.search) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  return (
    <>
      <LearningPathView
        userState={userState}
        currentModuleId={position.moduleId}
        currentConceptId={position.conceptId}
        onSelectModuleAndConcept={selectModuleAndConcept}
        onOpenSchema={openSchema}
        scrollToModuleId={highlightDayId}
        onScrolledToModule={handleScrolledToModule}
        onResetClick={() => setResetModalOpen(true)}
      />
      <ResetProgressModal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        serverError={resetError ?? null}
        onConfirmReset={async (mode, moduleId) => {
          if (mode === 'module' && moduleId) {
            await resetProgress({ moduleId });
            router.refresh();
          } else {
            await resetProgress();
            router.refresh();
          }
        }}
      />
    </>
  );
}
