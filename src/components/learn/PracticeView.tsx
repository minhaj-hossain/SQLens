'use client';
/**
 * PracticeView — client view for /learn/[dayId]/practice/[conceptId]?task=N.
 * Extracted from the page (Phase 4) for server-side metadata. The task index
 * lives in the query string so paging between tasks of the same concept never
 * remounts the editor or loses draft SQL. Wrapped in Suspense by the page
 * (useSearchParams).
 */
import React, { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams, notFound } from 'next/navigation';
import { getModuleById } from '@/content/curriculum-index';
import { Concept, ModuleData } from '@/types/curriculum';
import { learnUrl } from '@/lib/learn-routes';
import { PracticeTaskView } from '@/components/learning/PracticeTaskView';
import { useLearning } from '@/components/providers/LearningProgressProvider';
import { useSqlExecutor } from '@/components/providers/SqlExecutorProvider';
import { useLearningNavigation } from '@/components/learn/use-learning-navigation';
import { useStepBack } from './use-step-back';

interface PracticeViewProps {
  dayId: string;
  conceptId: string;
}

export default function PracticeView({ dayId, conceptId }: PracticeViewProps) {
  const mod = getModuleById(dayId);
  const concept = mod?.concepts.find((c) => c.id === conceptId);
  if (!mod || !concept) notFound();

  return (
    <Suspense fallback={null}>
      <PracticeInner mod={mod} concept={concept} />
    </Suspense>
  );
}

function PracticeInner({ mod, concept }: { mod: ModuleData; concept: Concept }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { userState, markTaskComplete } = useLearning();
  const { executeQuery } = useSqlExecutor();
  const nav = useLearningNavigation();

  const rawTask = Number(searchParams.get('task') ?? 0);
  const taskIndex =
    Number.isFinite(rawTask) && rawTask > 0
      ? Math.min(rawTask, concept.tasks.length - 1)
      : 0;
  const task = concept.tasks[taskIndex] ?? concept.tasks[0];

  // P11.2: step-chain Back — task N -> task N-1 -> lesson -> prev concept task
  const { backStep, goBack } = useStepBack(mod.id, String(taskIndex));

  // A concept with no practice tasks shouldn't render this page — complete it
  // and continue to the next stage (mirrors old handleStartPractice).
  useEffect(() => {
    if (!task) nav.completeConcept(mod.id, concept.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task]);

  // Database lifecycle (v2, replaces freshDb): reset to seed when this task
  // mounts with the `fresh` lifecycle. `inherit`/undefined keep continuity
  // (which the concept-boundary reset in the day layout still bounds).
  const { resetDatabase, getDatabaseState } = useSqlExecutor();
  useEffect(() => {
    if (task?.databaseLifecycle === 'fresh') resetDatabase();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task?.id]);

  if (!task) return null;

  return (
    <PracticeTaskView
      task={task}
      taskIndex={taskIndex}
      totalTasks={concept.tasks.length}
      concept={concept}
      conceptIndex={mod.concepts.findIndex((c) => c.id === concept.id)}
      totalConcepts={mod.concepts.length}
      isCompleted={Boolean(
        userState.taskAttempts?.[task.id]?.completed ||
        userState.completedModules?.[mod.id]?.completedTasks?.includes(task.id)
      )}
      savedSql={userState.taskAttempts?.[task.id]?.lastSubmittedSql}
      onExecuteSql={executeQuery}
      getDatabaseState={getDatabaseState}
      onTaskSuccess={(userSql, hintsUsed, viewedSolution) =>
        markTaskComplete({ taskId: task.id, moduleId: mod.id, userSql, hintsUsed, viewedSolution })
      }
      onBack={backStep ? () => goBack(backStep.url) : undefined}
      backLabel={backStep?.label}
      onNextTask={() => {
        if (taskIndex < concept.tasks.length - 1) {
          router.push(learnUrl(mod.id, 'practice', concept.id, taskIndex + 1));
        } else {
          nav.completeConcept(mod.id, concept.id);
        }
      }}
      canGoForward={
        taskIndex < concept.tasks.length - 1 ||
        Boolean(userState.taskAttempts?.[task.id]?.completed)
      }
    />
  );
}
