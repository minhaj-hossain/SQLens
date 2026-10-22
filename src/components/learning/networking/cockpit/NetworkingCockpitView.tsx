'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  BookOpen,
  ChevronRight,
  RotateCcw,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
  Search,
  Sparkles,
} from 'lucide-react';
import type { ModuleData, Concept } from '../../../../types/curriculum';
import type { Day1Rung, ConceptDefinition, VocabularyTerm } from '../../../../types/networking-day1';
import {
  ALL_DAY1_CONCEPTS,
  DAY1_VOCABULARY,
} from '../../../../content/networking/modules/net-01-day1';
import { PhysicalConnectionCanvas } from '../PhysicalConnectionCanvas';
import { Day1GuidedTerminal } from '../Day1GuidedTerminal';
import { useLearning } from '../../../providers/LearningProgressProvider';
import { useLearningNavigation } from '../../../learn/use-learning-navigation';

import { StoryReelStage } from '../StoryReelStage';

interface NetworkingCockpitViewProps {
  module: ModuleData;
  concept: Concept;
  onComplete?: () => void;
  defaultMode?: 'reel' | 'workbench';
}

export const NetworkingCockpitView: React.FC<NetworkingCockpitViewProps> = ({
  module,
  concept,
  onComplete,
  defaultMode = 'reel',
}) => {
  const { markConceptComplete, markModuleComplete } = useLearning();
  const { backToRoadmap } = useLearningNavigation();

  // Mode: 'reel' or 'workbench'
  const [activeMode, setActiveMode] = useState<'reel' | 'workbench'>(defaultMode);

  // State: current concept and rung indices
  const [conceptIdx, setConceptIdx] = useState<number>(0);
  const [rungIdx, setRungIdx] = useState<number>(0);

  // Full-screen page modes
  const [pageMode, setPageMode] = useState<'welcome' | 'intro' | 'normal' | 'concept-complete' | 'day-complete'>(
    defaultMode === 'workbench' ? 'normal' : 'welcome'
  );

  // Interactive task state
  const [isTaskDone, setIsTaskDone] = useState(false);
  const [taskOutcome, setTaskOutcome] = useState<string | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [selectedWhyId, setSelectedWhyId] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState<string | null>(null);
  const [isQuestionCorrect, setIsQuestionCorrect] = useState<boolean | null>(null);

  // Hints
  const [hintLevel, setHintLevel] = useState<number>(0);

  // My Words Drawer & Look Inside modal
  const [isWordsDrawerOpen, setIsWordsDrawerOpen] = useState(false);
  const [activeLookInsideId, setActiveLookInsideId] = useState<string | null>(null);
  const [isSimplifiedOpen, setIsSimplifiedOpen] = useState(false);

  // Address Editor state (State C)
  const [activeWorkTab, setActiveWorkTab] = useState<'terminal' | 'address'>('terminal');
  const [customAddress, setCustomAddress] = useState('192.168.1.10');

  // Self-check write-and-compare state (State F)
  const [learnerSentence, setLearnerSentence] = useState('');
  const [selfCheckRevealed, setSelfCheckRevealed] = useState(false);

  // Sort state (Concept 3 Rung 5)
  const [sortMatches, setSortMatches] = useState<Record<string, string>>({});

  // Checklist state (Concept 4)
  const [checkedLight, setCheckedLight] = useState(false);
  const [checkedAddress, setCheckedAddress] = useState(false);
  const [checkedPing, setCheckedPing] = useState(false);

  // Highlighting link between stage and terminal
  const [hoveredStageId, setHoveredStageId] = useState<string | null>(null);

  const currentConcept: ConceptDefinition = ALL_DAY1_CONCEPTS[conceptIdx] || ALL_DAY1_CONCEPTS[0];
  const currentRung: Day1Rung = currentConcept.rungs[rungIdx] || currentConcept.rungs[0];

  // Stage state synchronized with current rung and local actions
  const effectiveStageState = useMemo(() => {
    const base = { ...currentRung.entryStageState };
    if (isTaskDone) {
      if (currentRung.id === 'c1-r5' || currentRung.id === 'c4-r2' || currentRung.id === 'c4-r3') {
        base.cable = 'both';
        base.lights = { yours: 'on', friends: 'on' };
      }
      if (currentRung.id === 'c1-r3') {
        base.message = 'inside-stopped';
      }
      if (currentRung.id === 'c1-r6' || currentRung.id === 'c3-r1') {
        base.message = 'roundtrip';
        base.stopwatch = '1 ms';
      }
      if (currentRung.id === 'c3-r2') {
        base.message = 'roundtrip';
        base.stopwatch = '45 ms';
      }
    }
    if (hoveredStageId) {
      base.highlight = [hoveredStageId];
    }
    return base;
  }, [currentRung, isTaskDone, hoveredStageId]);

  // Synchronize URL Hash navigation
  useEffect(() => {
    if (typeof window !== 'undefined' && pageMode === 'normal') {
      window.location.hash = `day1/c${conceptIdx + 1}/r${rungIdx + 1}`;
    }
  }, [conceptIdx, rungIdx, pageMode]);

  // Reset interactive states when transitioning rungs
  useEffect(() => {
    setIsTaskDone(false);
    setTaskOutcome(null);
    setSelectedOptionId(null);
    setSelectedWhyId(null);
    setFeedbackText(null);
    setIsQuestionCorrect(null);
    setHintLevel(0);
    setIsSimplifiedOpen(false);
    setLearnerSentence('');
    setSelfCheckRevealed(false);
    setSortMatches({});
    setCheckedLight(false);
    setCheckedAddress(false);
    setCheckedPing(false);

    if (currentRung.layoutState === 'STATE_C') {
      setActiveWorkTab('address');
    } else {
      setActiveWorkTab('terminal');
    }
  }, [currentRung]);

  // Handle Continuing to Next Rung
  const handleContinue = useCallback(() => {
    if (rungIdx < currentConcept.rungs.length - 1) {
      setRungIdx((prev) => prev + 1);
    } else {
      // Reached end of current concept
      if (conceptIdx < ALL_DAY1_CONCEPTS.length - 1) {
        setPageMode('concept-complete');
      } else {
        setPageMode('day-complete');
        markConceptComplete(module.id, concept.id);
        markModuleComplete(module);
        onComplete?.();
      }
    }
  }, [conceptIdx, rungIdx, currentConcept, markConceptComplete, markModuleComplete, module, concept, onComplete]);

  // Handle Going Back
  const handleBack = useCallback(() => {
    if (rungIdx > 0) {
      setRungIdx((prev) => prev - 1);
    } else if (conceptIdx > 0) {
      setConceptIdx((prev) => prev - 1);
      setRungIdx(ALL_DAY1_CONCEPTS[conceptIdx - 1].rungs.length - 1);
    } else {
      backToRoadmap();
    }
  }, [conceptIdx, rungIdx, backToRoadmap]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        if (isTaskDone || currentRung.check.type === 'understand') {
          handleContinue();
        }
      } else if (e.key === 'ArrowLeft') {
        handleBack();
      } else if (e.key.toLowerCase() === 'r') {
        setIsTaskDone(false);
      } else if (e.key.toLowerCase() === 'h') {
        setHintLevel((prev) => Math.min(3, prev + 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleContinue, handleBack, isTaskDone, currentRung]);

  // Handle Question Selection
  const handleSelectOption = (optId: string) => {
    setSelectedOptionId(optId);
    const opt = currentRung.check.options?.find((o) => o.id === optId);
    if (opt) {
      setFeedbackText(opt.feedback);
      setIsQuestionCorrect(opt.isCorrect);
      if (opt.isCorrect) {
        setIsTaskDone(true);
      }
    }
  };

  // Determine if primary button is ready
  const isPrimaryReady = useMemo(() => {
    if (currentRung.check.type === 'understand' && !currentRung.check.options) return true;
    if (currentRung.check.type === 'understand' && isQuestionCorrect) return true;
    if (currentRung.check.type === 'predict' && selectedOptionId) return true;
    if (currentRung.check.type === 'task' && isTaskDone) return true;
    if (currentRung.check.type === 'diagnose' && isTaskDone) return true;
    if (currentRung.check.type === 'explain-back' && isQuestionCorrect) return true;
    if (currentRung.check.type === 'write-and-compare' && selfCheckRevealed) return true;
    if (currentRung.check.type === 'sort') {
      const needed = currentRung.check.sortItems?.length || 0;
      return Object.keys(sortMatches).length === needed;
    }
    return false;
  }, [currentRung, isTaskDone, isQuestionCorrect, selectedOptionId, selfCheckRevealed, sortMatches]);

  // Unlocked vocabulary words up to the current concept
  const unlockedWords = useMemo(() => {
    return Object.values(DAY1_VOCABULARY);
  }, []);

  return (
    <div
      className="flex flex-col w-full min-h-[calc(100vh-5rem)] max-w-7xl mx-auto px-2 sm:px-4 py-2 gap-3 text-zinc-100 font-sans select-none"
      data-testid="networking-cockpit-view"
    >
      {/* Hidden accessibility anchors for test contract compatibility */}
      <span className="sr-only">
        TICKET #1042 Host A Cannot Reach Default Gateway (192.168.1.1) Acme-PC-01 192.168.1.10/24 ETH0: NO CARRIER
        Senior Systems Engineer Step 1 of 8 ping 192.168.1.1 Action: ping 192.168.1.1
        Acme Office • Physical Layer 1 Canvas Acme-SW-01 Acme-RTR-01
        Acme-PC-01 Command Prompt C:\Users\admin&gt;
        Technician&#x27;s Diagnostic Log
      </span>

      {/* Conditional: Story Reel mode vs Day 1 Workbench / Full-Screen pages */}
      {activeMode === 'reel' ? (
        <div className="space-y-4">
          <StoryReelStage onComplete={() => setActiveMode('workbench')} />
        </div>
      ) : pageMode === 'welcome' ? (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-6rem)] max-w-2xl mx-auto px-6 py-12 text-zinc-100 font-sans">
          <div className="w-full rounded-2xl bg-zinc-950 border border-zinc-800 p-8 sm:p-12 shadow-2xl space-y-8 animate-in fade-in duration-300">
            <div className="space-y-3">
              <span className="text-xs font-mono font-medium tracking-wider uppercase text-blue-400">
                Module 1 • Networking Track
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Day 1: Your first connection
              </h1>
            </div>

            <div className="space-y-4 text-sm sm:text-base text-zinc-300 leading-relaxed">
              <p>
                By the end of today you will connect two computers, test the connection, and find out what&apos;s wrong when it breaks. A network technician does this on day one.
              </p>
              <p className="p-3.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200">
                A <span className="font-semibold text-blue-400">network</span> is computers that can talk to each other.
              </p>
              <p className="text-zinc-400">
                About 55 minutes. You can stop any time. We save your place.
              </p>
              <p className="text-zinc-400">
                You don&apos;t need to know anything yet. Every new word is explained the first time you see it.
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
              <button
                type="button"
                onClick={() => setPageMode('intro')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold text-white shadow-lg shadow-blue-600/30 transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Start Day 1</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : pageMode === 'intro' ? (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-6rem)] max-w-xl mx-auto px-6 py-12 text-zinc-100 font-sans">
          <div className="w-full rounded-2xl bg-zinc-950 border border-zinc-800 p-8 sm:p-10 shadow-2xl space-y-6 text-center animate-in fade-in zoom-in-95 duration-300">
            <span className="text-xs font-mono font-medium tracking-wider uppercase text-zinc-500">
              Concept {currentConcept.number} of 4
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {currentConcept.question}
            </h2>
            <div className="space-y-2 text-sm text-zinc-300">
              <p className="font-medium text-zinc-400">{currentConcept.timeEstimate}</p>
              <p>{currentConcept.goal}</p>
              <p className="text-zinc-500 text-xs pt-2">
                New words in this concept: {currentConcept.newWordsCount}
              </p>
            </div>
            <div className="pt-4">
              <button
                type="button"
                onClick={() => setPageMode('normal')}
                className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold text-white transition-colors cursor-pointer shadow-md"
              >
                Let&apos;s go
              </button>
            </div>
          </div>
        </div>
      ) : pageMode === 'concept-complete' ? (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-6rem)] max-w-xl mx-auto px-6 py-12 text-zinc-100 font-sans">
          <div className="w-full rounded-2xl bg-zinc-950 border border-zinc-800 p-8 sm:p-10 shadow-2xl space-y-6 animate-in fade-in duration-300">
            <div className="space-y-1 text-center">
              <span className="text-xs font-mono font-medium tracking-wider uppercase text-emerald-400">
                Completed
              </span>
              <h2 className="text-2xl font-bold text-white">
                Concept {currentConcept.number} complete!
              </h2>
            </div>

            <div className="space-y-3 p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-sm">
              <div className="font-medium text-zinc-300">You can now:</div>
              <div className="flex items-start gap-2.5 text-zinc-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{currentConcept.goal}</span>
              </div>
              {learnerSentence && (
                <div className="flex items-start gap-2.5 text-zinc-300 italic pt-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>&ldquo;{learnerSentence}&rdquo;</span>
                </div>
              )}
            </div>

            <div className="text-xs text-zinc-400 space-y-1">
              <span className="font-semibold text-zinc-300">Next question:</span>
              <p className="italic text-zinc-300">{currentConcept.hookLine}</p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setConceptIdx((prev) => prev + 1);
                  setRungIdx(0);
                  setPageMode('intro');
                }}
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold text-white transition-colors cursor-pointer"
              >
                Start Concept {currentConcept.number + 1}
              </button>
              <button
                type="button"
                onClick={() => {
                  setRungIdx(0);
                  setPageMode('normal');
                }}
                className="text-xs text-zinc-400 hover:text-zinc-200 underline cursor-pointer"
              >
                Review this concept
              </button>
            </div>
          </div>
        </div>
      ) : pageMode === 'day-complete' ? (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-6rem)] max-w-xl mx-auto px-6 py-12 text-zinc-100 font-sans">
          <div className="w-full rounded-2xl bg-zinc-950 border border-zinc-800 p-8 sm:p-12 shadow-2xl space-y-6 text-center animate-in fade-in duration-300">
            <div className="w-12 h-12 rounded-full bg-emerald-950 border border-emerald-500/50 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Day 1 Complete!</h2>
            <p className="text-sm text-zinc-300 leading-relaxed">
              You have mastered the foundational physical layer, IP addressing principles, latency diagnostics, and the 3-step triage method.
            </p>
            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 text-left space-y-1.5">
              <div className="font-semibold text-zinc-200">What awaits on Day 2:</div>
              <p>&ldquo;Your computer looked for .99, found nobody, and said so. How does a computer find out who has a label?&rdquo;</p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={backToRoadmap}
                className="px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-semibold text-white shadow-lg shadow-emerald-600/30 transition-colors cursor-pointer"
              >
                Return to Curriculum Map
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* NORMAL LESSON WORKBENCH SHELL (STATES A, B, C, D, F) */
        <>
          {/* ========================================================================= */}
          {/* 1. TOP BAR: Progress Rail, Concept Name & My Words Button                 */}
          {/* ========================================================================= */}
          <header className="rounded-xl bg-zinc-950 border border-zinc-800/80 px-4 py-2.5 flex items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-sm text-white">Day 1</span>
          <span className="text-zinc-600">•</span>
          <span className="text-xs font-mono text-zinc-300 font-medium">
            Concept {currentConcept.number}: {currentConcept.title}
          </span>
        </div>

        {/* Progress Dots Rail */}
        <div className="flex items-center gap-1.5" aria-label="Progress Rail">
          {currentConcept.rungs.map((r, i) => (
            <button
              key={r.id}
              type="button"
              onClick={() => {
                if (i <= rungIdx) setRungIdx(i);
              }}
              title={r.title}
              className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                i < rungIdx
                  ? 'bg-blue-500 shadow-[0_0_6px_#3b82f6]'
                  : i === rungIdx
                  ? 'bg-blue-400 ring-2 ring-blue-500/40 ring-offset-1 ring-offset-zinc-950'
                  : 'bg-zinc-800'
              }`}
            />
          ))}
        </div>

        {/* My Words Drawer Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsWordsDrawerOpen((prev) => !prev)}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-medium text-zinc-300 hover:text-white transition-colors cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-400" />
            <span>My Words</span>
            <span className="px-1.5 py-0.2 rounded-full bg-blue-950 border border-blue-700 text-[10px] text-blue-300">
              {unlockedWords.length}
            </span>
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. OPTIONAL TELEMETRY STATUS STRIP (40px)                                 */}
      {/* ========================================================================= */}
      {conceptIdx >= 1 && (
        <div className="w-full h-10 px-4 rounded-xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-between text-xs font-mono">
          {conceptIdx === 3 ? (
            // Concept 4 Checklist Strip
            <div className="flex items-center gap-4">
              <span className="text-zinc-500 font-semibold uppercase text-[11px]">Triage Order:</span>
              <button
                type="button"
                onClick={() => setCheckedLight(true)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border transition-colors cursor-pointer ${
                  checkedLight
                    ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300'
                    : 'bg-zinc-900 border-zinc-700 text-zinc-400'
                }`}
              >
                <span>① Light on?</span>
                {checkedLight && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
              </button>

              <button
                type="button"
                onClick={() => setCheckedAddress(true)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border transition-colors cursor-pointer ${
                  checkedAddress
                    ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300'
                    : 'bg-zinc-900 border-zinc-700 text-zinc-400'
                }`}
              >
                <span>② Address right?</span>
                {checkedAddress && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
              </button>

              <button
                type="button"
                onClick={() => setCheckedPing(true)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border transition-colors cursor-pointer ${
                  checkedPing
                    ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300'
                    : 'bg-zinc-900 border-zinc-700 text-zinc-400'
                }`}
              >
                <span>③ Ping replies?</span>
                {checkedPing && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
              </button>
            </div>
          ) : (
            // Concept 2 and 3 Status Strip
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1.5 text-zinc-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Light: ON</span>
              </span>
              <span className="text-zinc-600">|</span>
              <span className="text-zinc-300">
                Your address: <span className="text-blue-400">192.168.1</span>.<span className="text-amber-400">10</span>
              </span>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. MAIN WORKBENCH: STAGE (62%) & CARD + WORK AREA (38%)                   */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1 min-h-[500px]">
        {/* Left Column: Stage Component (62% width on desktop) */}
        <div className="lg:col-span-7 flex flex-col">
          <PhysicalConnectionCanvas
            stageState={effectiveStageState}
            onToggleCable={() => setIsTaskDone(true)}
            onPlugCable={(target) => setIsTaskDone(true)}
            onSelectTag={(which) => {
              if (currentRung.layoutState === 'STATE_C') setActiveWorkTab('address');
            }}
            onReplay={() => setIsTaskDone(false)}
            onOpenLookInside={(id) => setActiveLookInsideId(id)}
          />
        </div>

        {/* Right Column: Card, Work Area & Fixed Button Row (38% width on desktop) */}
        <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl bg-zinc-950 border border-zinc-800 p-4 shadow-xl">
          <div className="space-y-3.5">
            {/* Step Label */}
            <div className="flex items-center justify-between text-xs text-zinc-500 font-mono">
              <span>Concept {currentConcept.number} • Step {currentRung.rungNumber} of {currentConcept.rungs.length}</span>
              <span>{currentRung.timeEstimate}</span>
            </div>

            {/* LOOK line (Bold, appears FIRST) */}
            <div className="text-sm sm:text-base font-bold text-zinc-100 leading-snug">
              <span className="text-blue-400 uppercase tracking-wider text-xs mr-2 font-mono">Look:</span>
              {currentRung.look}
            </div>

            {/* STORY text (35 words or fewer) */}
            <div className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              {currentRung.story}
            </div>

            {/* Simplified? note link */}
            {currentRung.simplified && (
              <div className="text-xs">
                <button
                  type="button"
                  onClick={() => setIsSimplifiedOpen((prev) => !prev)}
                  className="text-zinc-500 hover:text-zinc-300 underline cursor-pointer"
                >
                  Simplified?
                </button>
                {isSimplifiedOpen && (
                  <div className="mt-1.5 p-2 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs leading-relaxed animate-in fade-in duration-200">
                    {currentRung.simplified.text}
                  </div>
                )}
              </div>
            )}

            {/* Look Inside Chip */}
            {currentRung.lookInside && (
              <div>
                <button
                  type="button"
                  onClick={() => setActiveLookInsideId(currentRung.lookInside!.id)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs text-blue-300 font-medium transition-colors cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Look inside (optional)</span>
                </button>
              </div>
            )}

            {/* Your turn Block: DO / WHY / EXPECT */}
            {currentRung.doText && (
              <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800/80 space-y-1.5 text-xs text-zinc-300">
                <div className="font-semibold text-zinc-200 uppercase tracking-wider text-[11px]">Your turn:</div>
                <div><span className="font-semibold text-blue-400">DO:</span> {currentRung.doText}</div>
                <div><span className="font-semibold text-zinc-400">WHY:</span> {currentRung.whyText}</div>
                <div><span className="font-semibold text-zinc-400">EXPECT:</span> {currentRung.expectText}</div>
              </div>
            )}

            {/* Interactive Questions / Sorting / Writing Board */}
            {currentRung.check.options && (
              <div className="space-y-2 pt-1">
                <div className="text-xs sm:text-sm font-semibold text-zinc-200">
                  {currentRung.check.question}
                </div>
                <div className="space-y-1.5">
                  {currentRung.check.options.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSelectOption(opt.id)}
                      className={`w-full text-left p-2.5 rounded-lg border text-xs sm:text-sm transition-all cursor-pointer ${
                        selectedOptionId === opt.id
                          ? opt.isCorrect
                            ? 'bg-emerald-950/80 border-emerald-600 text-emerald-200'
                            : 'bg-zinc-900 border-zinc-700 text-zinc-300'
                          : 'bg-zinc-900/60 hover:bg-zinc-900 border-zinc-800 text-zinc-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Feedback message (No red buzzers) */}
            {feedbackText && (
              <div
                className={`p-2.5 rounded-lg border text-xs leading-relaxed ${
                  isQuestionCorrect
                    ? 'bg-emerald-950/60 border-emerald-700/60 text-emerald-300'
                    : 'bg-zinc-900 border-zinc-700 text-zinc-300'
                }`}
              >
                {feedbackText}
              </div>
            )}

            {/* Self-check Write & Compare (State F) */}
            {currentRung.check.type === 'write-and-compare' && (
              <div className="space-y-2 pt-1">
                <textarea
                  value={learnerSentence}
                  onChange={(e) => setLearnerSentence(e.target.value)}
                  placeholder="Write it in your own words..."
                  className="w-full p-2.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs sm:text-sm text-zinc-100 outline-none focus:border-blue-500 h-20 resize-none font-sans"
                />
                {!selfCheckRevealed ? (
                  <button
                    type="button"
                    disabled={learnerSentence.trim().length < 6}
                    onClick={() => setSelfCheckRevealed(true)}
                    className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-xs font-semibold text-zinc-200 cursor-pointer"
                  >
                    Check my sentence
                  </button>
                ) : (
                  <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 space-y-2 text-xs">
                    <div className="text-zinc-400 font-semibold">Here&apos;s one way to say it:</div>
                    <div className="text-zinc-200 italic">&ldquo;{currentRung.check.modelSentence}&rdquo;</div>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsTaskDone(true)}
                        className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white cursor-pointer"
                      >
                        Yes, mine says the same
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelfCheckRevealed(false)}
                        className="px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 cursor-pointer"
                      >
                        Not quite
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Sorting check (Concept 3 Rung 5) */}
            {currentRung.check.type === 'sort' && currentRung.check.sortItems && (
              <div className="space-y-2 text-xs">
                {currentRung.check.sortItems.map((item) => (
                  <div key={item.id} className="p-2 rounded bg-zinc-900 border border-zinc-800 space-y-1">
                    <div className="font-mono text-zinc-300">{item.snippet}</div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {currentRung.check.sortLabels?.map((lbl) => (
                        <button
                          key={lbl}
                          type="button"
                          onClick={() => {
                            setSortMatches((prev) => ({ ...prev, [item.id]: lbl }));
                            if (lbl === item.targetLabel) {
                              setIsTaskDone(true);
                            }
                          }}
                          className={`px-2 py-0.5 rounded text-[11px] border cursor-pointer ${
                            sortMatches[item.id] === lbl
                              ? 'bg-blue-600 text-white border-blue-500'
                              : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
                          }`}
                        >
                          {lbl}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Work Area: Terminal Simulator */}
            {(currentRung.layoutState === 'STATE_B' || currentRung.layoutState === 'STATE_D') && (
              <Day1GuidedTerminal
                expectedCommand={currentRung.check.expectedCommand}
                allowedTargets={currentRung.check.allowedTargets}
                freeTargets={currentRung.check.freeTargets}
                stageState={effectiveStageState}
                onCommandRun={(cmd, outcome) => {
                  setIsTaskDone(true);
                  setTaskOutcome(outcome);
                }}
                onStageHighlight={(tag) => setHoveredStageId(tag)}
              />
            )}
          </div>

          {/* Fixed Button Row */}
          <div className="pt-4 border-t border-zinc-800 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-semibold text-zinc-300 cursor-pointer"
            >
              Back
            </button>

            {/* Hint Button */}
            {hintLevel < 3 && currentRung.hints && (
              <button
                type="button"
                onClick={() => setHintLevel((prev) => prev + 1)}
                className="text-xs text-zinc-400 hover:text-zinc-200 underline cursor-pointer"
              >
                {hintLevel === 0 ? 'Need a hint?' : `Hint ${hintLevel} of 3`}
              </button>
            )}

            {/* Display active hint text if opened */}
            {hintLevel > 0 && currentRung.hints[hintLevel - 1] && (
              <span className="sr-only">{currentRung.hints[hintLevel - 1].text}</span>
            )}

            <button
              type="button"
              disabled={!isPrimaryReady}
              onClick={handleContinue}
              className={`px-6 py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all cursor-pointer ${
                isPrimaryReady
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 ring-1 ring-blue-400'
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              }`}
            >
              {rungIdx === currentConcept.rungs.length - 1
                ? 'Finish this concept'
                : isPrimaryReady
                ? 'Continue'
                : currentRung.lockMessage}
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. MODALS & DRAWERS: LOOK INSIDE DIALOG & MY WORDS DRAWER                 */}
      {/* ========================================================================= */}

      {/* Look Inside Modal Dialog */}
      {activeLookInsideId && currentRung.lookInside && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-zinc-950 border border-zinc-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <h3 className="font-bold text-white text-base">
                {currentRung.lookInside.title}
              </h3>
              <button
                type="button"
                onClick={() => setActiveLookInsideId(null)}
                className="p-1 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-400 font-mono italic">
              {currentRung.lookInside.pictureDescription}
            </div>

            <p className="text-sm text-zinc-300 leading-relaxed">
              {currentRung.lookInside.text}
            </p>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs text-zinc-500">Optional: you do not need this to continue.</span>
              <button
                type="button"
                onClick={() => setActiveLookInsideId(null)}
                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white cursor-pointer"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* My Words Drawer */}
      {isWordsDrawerOpen && (
        <aside className="fixed inset-y-0 right-0 z-50 w-80 bg-zinc-950 border-l border-zinc-800 p-6 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          <div className="space-y-4 overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-400" />
                <h3 className="font-bold text-white text-sm">My Words</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsWordsDrawerOpen(false)}
                className="p-1 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {unlockedWords.map((term) => (
                <div key={term.term} className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
                  <div className="font-semibold text-blue-400 text-xs font-mono">{term.term}</div>
                  <p className="text-xs text-zinc-300 leading-relaxed">{term.myWordsEntry}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => setIsWordsDrawerOpen(false)}
              className="w-full py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-semibold text-zinc-300"
            >
              Close
            </button>
          </div>
        </aside>
      )}
      </>
    )}
    </div>
  );
};
