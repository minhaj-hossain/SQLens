'use client';
/**
 * /learn/[dayId]/theory/[conceptId] — ConceptLessonView on a real route.
 * Theory pages read no query params, so no Suspense boundary is required.
 */
import React from 'react';
import { useParams, useRouter, notFound } from 'next/navigation';
import { getModuleById } from '@/content/curriculum-index';
import { isConceptCompleted } from '@/lib/progress/unlock-calculator';
import { learnUrl } from '@/lib/learn-routes';
import { ConceptLessonView } from '@/components/learning/ConceptLessonView';
import { useLearning } from '@/components/providers/LearningProgressProvider';
import { useSqlExecutor } from '@/components/providers/SqlExecutorProvider';
import { useLearningNavigation } from '@/components/learn/use-learning-navigation';

export default function TheoryPage() {
  const { dayId, conceptId } = useParams<{ dayId: string; conceptId: string }>();
  const mod = getModuleById(dayId);
  const concept = mod?.concepts.find((c) => c.id === conceptId);
  if (!mod || !concept) notFound();

  const { userState } = useLearning();
  const { executeQuery } = useSqlExecutor();
  const nav = useLearningNavigation();
  const router = useRouter();

  const conceptIndex = mod.concepts.findIndex((c) => c.id === concept.id);
  // Concept-level lock: only concepts up to the first incomplete one are open.
  const completedCount = mod.concepts.filter((c) => isConceptCompleted(c, mod.id, userState)).length;
  const conceptLocked = !isConceptCompleted(concept, mod.id, userState) && conceptIndex > completedCount;
  if (conceptLocked) {
    router.replace(`/learn/${mod.id}`);
    return null;
  }

  const prevConcept = conceptIndex > 0 ? mod.concepts[conceptIndex - 1] : undefined;

  return (
    <ConceptLessonView
      concept={concept}
      conceptIndex={conceptIndex}
      totalConcepts={mod.concepts.length}
      onStartPractice={() => nav.startPractice(mod.id, concept.id)}
      onExecuteSql={executeQuery}
      onPrevious={() => {
        if (prevConcept) router.push(learnUrl(mod.id, 'theory', prevConcept.id));
      }}
      canGoBack={conceptIndex > 0}
    />
  );
}
