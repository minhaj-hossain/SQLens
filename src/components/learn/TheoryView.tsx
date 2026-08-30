'use client';
/**
 * TheoryView — client view for /learn/[dayId]/theory/[conceptId].
 * Extracted from the page (Phase 4) so the page can be a server component
 * with generateMetadata while this component stays client-side (module data
 * contains non-serializable validators and imports directly here).
 */
import React from 'react';
import { useRouter, notFound } from 'next/navigation';
import { getModuleById } from '@/content/curriculum-index';
import { isConceptCompleted } from '@/lib/progress/unlock-calculator';
import { ConceptLessonView, ConceptDot } from '@/components/learning/ConceptLessonView';

import { useLearning } from '@/components/providers/LearningProgressProvider';
import { useSqlExecutor } from '@/components/providers/SqlExecutorProvider';
import { useLearningNavigation } from '@/components/learn/use-learning-navigation';
import { useStepBack } from './use-step-back';

interface TheoryViewProps {
  dayId: string;
  conceptId: string;
}

export default function TheoryView({ dayId, conceptId }: TheoryViewProps) {
  const mod = getModuleById(dayId);
  const concept = mod?.concepts.find((c) => c.id === conceptId);
  if (!mod || !concept) notFound();

  const { userState } = useLearning();
  const { executeQuery } = useSqlExecutor();
  const nav = useLearningNavigation();
  const router = useRouter();
  // P11.2: step-chain Back — concept i>0 goes to the previous concept's LAST
  // task; the first concept goes back to the module card (hooks before any
  // conditional return, per rules-of-hooks).
  const { backStep, goBack } = useStepBack(mod.id);

  const conceptIndex = mod.concepts.findIndex((c) => c.id === concept.id);
  // Concept-level lock: only concepts up to the first incomplete one are open.
  const completedCount = mod.concepts.filter((c) => isConceptCompleted(c, mod.id, userState)).length;
  const conceptLocked = !isConceptCompleted(concept, mod.id, userState) && conceptIndex > completedCount;
  if (conceptLocked) {
    router.replace(`/learn/${mod.id}`);
    return null;
  }

  return (
    <ConceptLessonView
      concept={concept}
      conceptIndex={conceptIndex}
      totalConcepts={mod.concepts.length}
      conceptDots={mod.concepts.map((cc) =>
        isConceptCompleted(cc, mod.id, userState) ? 'done' : cc.id === concept.id ? 'current' : 'todo',
      )}
      onStartPractice={() => nav.startPractice(mod.id, concept.id)}
      onExecuteSql={executeQuery}
      onPrevious={backStep ? () => goBack(backStep.url) : undefined}
      canGoBack={Boolean(backStep)}
    />
  );
}
