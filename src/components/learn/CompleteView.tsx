'use client';
/**
 * CompleteView — client view for /learn/[dayId]/complete.
 * Guard: only reachable when the module is actually completed; otherwise
 * redirected to the day overview.
 */
import React, { useEffect } from 'react';
import { useRouter, notFound } from 'next/navigation';
import { ALL_MODULES, getModuleById } from '@/content/curriculum-index';
import { getNextModule } from '@/lib/curriculum/module-order';
import { ModuleCompletionView } from '@/components/learning/ModuleCompletionView';
import { useLearning } from '@/components/providers/LearningProgressProvider';
import { useLearningNavigation } from '@/components/learn/use-learning-navigation';

interface CompleteViewProps {
  dayId: string;
}

export default function CompleteView({ dayId }: CompleteViewProps) {
  const mod = getModuleById(dayId);
  if (!mod) notFound();

  const { userState } = useLearning();
  const nav = useLearningNavigation();
  const router = useRouter();

  const isCompleted = Boolean(userState.completedModules[mod.id]);
  useEffect(() => {
    if (!isCompleted) router.replace(`/learn/${mod.id}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCompleted]);

  if (!isCompleted) return null;

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
