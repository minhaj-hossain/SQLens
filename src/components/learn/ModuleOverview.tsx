'use client';
/**
 * ModuleOverview — /learn/[dayId] day-level landing page (NEW in Phase 3).
 * Shows the day's concepts with per-concept state (done / current / locked),
 * the challenge entry and a "Continue" CTA. Locked days render a dedicated
 * notice instead of the content (client-side unlock rules, per the plan).
 */
import React from 'react';
import Icon from '@/components/ui/Icon';
import { ModuleData } from '@/types/curriculum';
import { ALL_MODULES } from '@/content/curriculum-index';
import {
  getModuleUnlockStatus,
  getModuleProgressCounts,
  isConceptCompleted,
  isModuleChallengeUnlocked,
} from '@/lib/progress/unlock-calculator';
import { useLearning } from '@/components/providers/LearningProgressProvider';
import { useLearningNavigation } from './use-learning-navigation';

interface ModuleOverviewProps {
  module: ModuleData;
}

export default function ModuleOverview({ module: mod }: ModuleOverviewProps) {
  const { userState, availabilityVersion } = useLearning();
  const { selectModuleAndConcept, startPractice, finishModule } = useLearningNavigation();

  const unlockStatus = getModuleUnlockStatus(mod, ALL_MODULES, userState);
  const counts = getModuleProgressCounts(mod, userState);
  const doneCount = mod.concepts.filter((c) => isConceptCompleted(c, mod.id, userState)).length;
  const totalConcepts = mod.concepts.length;
  const completedConceptsCount = doneCount;

  // ---- Locked day → dedicated notice (client-side unlock rules mirror the
  // pre-migration refusal of locked deep links) ----
  if (!unlockStatus.isUnlocked && !userState.completedModules[mod.id]) {
    return (
      <div className="max-w-xl mx-auto text-center py-16">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-surface-container border border-outline-variant/60 text-text-dim mb-4">
          <Icon name="lock" className="text-[26px]" />
        </div>
        <h1 className="font-display text-xl font-bold text-text mb-2">Day {mod.day} is locked</h1>
        <p className="text-sm text-text-dim font-body leading-relaxed mb-6">
          {unlockStatus.reason || 'Complete the previous days to unlock this lesson.'}
        </p>
        <a
          href="/"
          className="inline-flex items-center gap-2 font-mono text-xs bg-func text-ink font-bold px-4 py-2 rounded-lg hover:brightness-110 transition"
        >
          <Icon name="arrow_back" className="text-[15px]" />
          Back to Learning Path
        </a>
      </div>
    );
  }

  const isModuleFullyDone = Boolean(userState.completedModules[mod.id]);
  const challengeUnlock = isModuleChallengeUnlocked(mod, ALL_MODULES, userState);
  const challengeDone = Boolean(userState.completedModules[mod.id]?.challengeCompleted);
  const firstIncomplete =
    mod.concepts.find((c) => !isConceptCompleted(c, mod.id, userState)) ?? mod.concepts[0];

  return (
    <div data-availability={availabilityVersion} className="max-w-3xl mx-auto">
      {/* Day header */}
      <h1 className="font-display text-2xl sm:text-3xl font-bold text-text">
        Day {mod.day}: {mod.title}
      </h1>
      <p className="text-sm text-text-dim font-body leading-relaxed mt-2 mb-2">{mod.description}</p>
      <div className="flex items-center gap-3 text-[11px] font-mono text-text-dim mb-6">
        <span className="bg-surface-container border border-outline-variant/60 px-2 py-0.5 rounded">
          ~{mod.estimatedMinutes} min
        </span>
        <span>{totalConcepts} concepts</span>
        {mod.challenge && <span>+ challenge</span>}
        <span className="ml-auto">{counts.done} tasks done</span>
      </div>

      {/* Progress bar */}
      <div className="h-2 w-full rounded-full bg-surface-container border border-outline-variant/40 overflow-hidden mb-8">
        <div
          className="h-full bg-func transition-all duration-300"
          style={{ width: `${totalConcepts ? Math.round((doneCount / totalConcepts) * 100) : 0}%` }}
        />
      </div>

      {/* Concept list */}
      <ul className="flex flex-col gap-2 mb-8">
        {mod.concepts.map((concept, idx) => {
          const done = isConceptCompleted(concept, mod.id, userState);
          const isCurrent = !done && idx === completedConceptsCount;
          const locked = !done && idx > completedConceptsCount;
          return (
            <li key={concept.id}>
              <button
                onClick={() => {
                  if (locked) return;
                  if (done) {
                    startPractice(mod.id, concept.id);
                  } else {
                    selectModuleAndConcept(mod.id, concept.id, 'theory');
                  }
                }}
                disabled={locked}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition ${
                  done
                    ? 'border-func/30 bg-func/5 cursor-pointer hover:bg-func/10'
                    : isCurrent
                      ? 'border-func bg-func/10 cursor-pointer hover:bg-func/15'
                      : 'border-outline-variant/40 bg-surface-container opacity-60 cursor-not-allowed'
                }`}
              >
                <span
                  className={`shrink-0 flex items-center justify-center w-8 h-8 rounded-full border font-mono text-xs ${
                    done
                      ? 'bg-func text-ink border-func'
                      : isCurrent
                        ? 'border-func text-func'
                        : 'border-outline-variant text-text-faint'
                  }`}
                >
                  {done ? <Icon name="check" className="text-[16px]" /> : idx + 1}
                </span>
                <span className="min-w-0">
                  <span className="block font-body text-sm font-semibold text-text truncate">
                    {concept.title}
                  </span>
                  <span className="block text-xs text-text-dim font-body truncate">
                    {concept.shortDescription}
                  </span>
                </span>
                <span className="ml-auto shrink-0 text-text-faint">
                  {locked ? (
                    <Icon name="lock" className="text-[16px]" />
                  ) : (
                    <Icon name="chevron_right" className="text-[18px]" />
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ul>


      {/* Challenge entry */}
      {mod.challenge && (
        <button
          onClick={() => selectModuleAndConcept(mod.id, undefined, 'challenge')}
          disabled={!challengeUnlock.isUnlocked}
          className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border text-left transition mb-8 ${
            challengeDone
              ? 'border-func/30 bg-func/5'
              : challengeUnlock.isUnlocked
                ? 'border-func bg-func/10 hover:bg-func/15 cursor-pointer'
                : 'border-outline-variant/40 bg-surface-container opacity-60 cursor-not-allowed'
          }`}
        >
          <span className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full border border-func text-func">
            <Icon name="emoji_events" className="text-[16px]" />
          </span>
          <span className="min-w-0">
            <span className="block font-body text-sm font-semibold text-text">
              Independent Challenge: {mod.challenge.title}
            </span>
            <span className="block text-xs text-text-dim font-body">
              {challengeDone
                ? 'Completed'
                : challengeUnlock.isUnlocked
                  ? mod.challenge.scenario
                  : 'Complete all concept lessons and practice tasks to unlock'}
            </span>
          </span>
          <span className="ml-auto shrink-0">
            {challengeDone ? (
              <Icon name="check_circle" className="text-[18px] text-func" />
            ) : challengeUnlock.isUnlocked ? (
              <Icon name="chevron_right" className="text-[18px]" />
            ) : (
              <Icon name="lock" className="text-[16px]" />
            )}
          </span>
        </button>
      )}

      {/* Continue CTA */}
      {firstIncomplete && !isModuleFullyDone && (
        <div className="flex justify-end">
          <button
            onClick={() => selectModuleAndConcept(mod.id, firstIncomplete.id, 'theory')}
            className="inline-flex items-center gap-2 bg-func text-ink font-body font-bold text-sm px-6 py-3 rounded-full hover:brightness-110 transition"
          >
            {doneCount > 0 ? 'Continue Learning' : 'Start Learning'}
            <Icon name="arrow_forward" className="text-[18px]" />
          </button>
        </div>
      )}
      {isModuleFullyDone && (
        <div className="flex justify-end">
          <button
            onClick={() => finishModule(mod)}
            className="inline-flex items-center gap-2 bg-func text-ink font-body font-bold text-sm px-6 py-3 rounded-full hover:brightness-110 transition"
          >
            Review Day Completion
            <Icon name="arrow_forward" className="text-[18px]" />
          </button>
        </div>
      )}
    </div>
  );
}

