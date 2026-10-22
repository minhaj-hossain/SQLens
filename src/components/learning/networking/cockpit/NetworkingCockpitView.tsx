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
import { StructuredStoryContent } from './StructuredStoryContent';
import { useLearning } from '../../../providers/LearningProgressProvider';
import { useLearningNavigation } from '../../../learn/use-learning-navigation';

interface NetworkingCockpitViewProps {
  module: ModuleData;
  concept: Concept;
  onComplete?: () => void;
  defaultMode?: 'welcome' | 'normal';
}

export const NetworkingCockpitView: React.FC<NetworkingCockpitViewProps> = ({
  module,
  concept,
  onComplete,
  defaultMode = 'welcome',
}) => {
  const { markConceptComplete, markModuleComplete } = useLearning();
  const { backToRoadmap } = useLearningNavigation();

  // State: current concept and rung indices
  const [conceptIdx, setConceptIdx] = useState<number>(0);
  const [rungIdx, setRungIdx] = useState<number>(0);

  // Full-screen page modes
  const [pageMode, setPageMode] = useState<'welcome' | 'intro' | 'normal' | 'concept-complete' | 'day-complete'>(
    defaultMode
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

  // Manual physical & address state (prevents ping from magically auto-fixing faults)
  const [manualCableState, setManualCableState] = useState<CableState | null>(null);
  const [manualStreetAddress, setManualStreetAddress] = useState<string | null>(null);

  // Highlighting link between stage and terminal
  const [hoveredStageId, setHoveredStageId] = useState<string | null>(null);

  const currentConcept: ConceptDefinition = ALL_DAY1_CONCEPTS[conceptIdx] || ALL_DAY1_CONCEPTS[0];
  const currentRung: Day1Rung = currentConcept.rungs[rungIdx] || currentConcept.rungs[0];

  // Stage state synchronized with current rung and local learner actions
  const effectiveStageState = useMemo(() => {
    const base = { ...currentRung.entryStageState };
    if (manualCableState !== null) {
      base.cable = manualCableState;
      if (manualCableState === 'both') {
        base.lights = { yours: 'on', friends: 'on' };
      } else {
        base.lights = { yours: 'off', friends: 'off' };
      }
    }
    if (manualStreetAddress !== null && base.tags && typeof base.tags.yours === 'object' && 'street' in base.tags.yours) {
      base.tags = {
        ...base.tags,
        yours: {
          ...base.tags.yours,
          street: manualStreetAddress,
        },
      };
    }
    if (hoveredStageId) {
      base.highlight = [hoveredStageId];
    }
    return base;
  }, [currentRung, manualCableState, manualStreetAddress, hoveredStageId]);

  // Restore from URL hash on initial mount (e.g. #c2/r3 or legacy #day1/c2/r3)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const match = window.location.hash.match(/(?:day1\/)?c(\d+)\/r(\d+)/);
    if (match) {
      const c = parseInt(match[1], 10) - 1;
      const r = parseInt(match[2], 10) - 1;
      if (c >= 0 && c < ALL_DAY1_CONCEPTS.length) {
        setConceptIdx(c);
        const rungs = ALL_DAY1_CONCEPTS[c].rungs;
        if (r >= 0 && r < rungs.length) {
          setRungIdx(r);
        }
        setPageMode('normal');
      }
    }
  }, []);

  // Synchronize URL Hash navigation
  useEffect(() => {
    if (typeof window !== 'undefined' && pageMode === 'normal') {
      window.location.hash = `c${conceptIdx + 1}/r${rungIdx + 1}`;
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
    setManualCableState(null);
    setManualStreetAddress(null);

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
      }
    }
  }, [conceptIdx, rungIdx, currentConcept, markConceptComplete, markModuleComplete, module, concept]);

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

  // Handle Question Selection
  const handleSelectOption = (optId: string) => {
    setSelectedOptionId(optId);
    const opt = currentRung.check.options?.find((o) => o.id === optId);
    if (opt) {
      setFeedbackText(opt.feedback);
      setIsQuestionCorrect(opt.isCorrect);
      setIsTaskDone(opt.isCorrect);
    }
  };

  // Handle Sort Match Selection (Concept 3 Rung 5)
  const handleSortSelect = (itemId: string, lbl: string) => {
    const nextMatches = { ...sortMatches, [itemId]: lbl };
    setSortMatches(nextMatches);
    const items = currentRung.check.sortItems || [];
    const allCorrect =
      items.length > 0 &&
      items.every((it) => nextMatches[it.id] === it.targetLabel);
    setIsTaskDone(allCorrect);
  };

  // Determine if primary button is ready
  const isPrimaryReady = useMemo(() => {
    if (currentRung.check.type === 'understand' && !currentRung.check.options) return true;
    if (currentRung.check.type === 'understand' && isQuestionCorrect === true) return true;
    if (currentRung.check.type === 'predict' && isQuestionCorrect === true) return true;
    if (currentRung.check.type === 'task' && isTaskDone) return true;
    if (currentRung.check.type === 'diagnose' && isTaskDone) return true;
    if (currentRung.check.type === 'explain-back' && isQuestionCorrect === true) return true;
    if (currentRung.check.type === 'write-and-compare' && selfCheckRevealed && isTaskDone) return true;
    if (currentRung.check.type === 'sort') {
      const items = currentRung.check.sortItems;
      if (!items || items.length === 0) return false;
      return items.every((item) => sortMatches[item.id] === item.targetLabel);
    }
    return false;
  }, [currentRung, isTaskDone, isQuestionCorrect, selfCheckRevealed, sortMatches]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        if (isPrimaryReady) {
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
  }, [handleContinue, handleBack, isPrimaryReady]);

  // Unlocked vocabulary words up to the current concept
  const unlockedWords = useMemo(() => {
    return Object.values(DAY1_VOCABULARY);
  }, []);

  return (
    <div
      className="flex flex-col w-full min-h-[calc(100vh-5rem)] max-w-7xl mx-auto px-2 sm:px-4 py-2 gap-3 text-zinc-100 font-sans select-none"
      data-testid="networking-cockpit-view"
    >
      {/* Page modes: welcome -> intro -> normal (workbench) -> concept-complete -> day-complete */}
      {pageMode === 'welcome' ? (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-6rem)] max-w-2xl mx-auto px-6 py-12 text-zinc-100 font-sans">
          <div className="w-full rounded-3xl bg-[#121214] border border-white/[0.08] p-8 sm:p-12 shadow-2xl space-y-8 animate-in fade-in duration-300">
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
              <p className="p-4 rounded-2xl bg-[#18181b] border border-white/[0.08] text-zinc-200">
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
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-black hover:bg-zinc-900 border border-white/20 hover:border-white/40 font-semibold text-white shadow-xl shadow-black/80 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <span>Start Day 1</span>
                <ChevronRight className="w-4 h-4 text-zinc-400" />
              </button>
            </div>
          </div>
        </div>
      ) : pageMode === 'intro' ? (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-6rem)] max-w-xl mx-auto px-6 py-12 text-zinc-100 font-sans">
          <div className="w-full rounded-3xl bg-[#121214] border border-white/[0.08] p-8 sm:p-10 shadow-2xl space-y-6 text-center animate-in fade-in zoom-in-95 duration-300">
            <span className="text-xs font-mono font-medium tracking-wider uppercase text-zinc-400">
              Concept {currentConcept.number} of 4
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {currentConcept.question}
            </h2>
            <div className="space-y-2 text-sm text-zinc-300">
              <p className="font-medium text-zinc-400">{currentConcept.timeEstimate}</p>
              <p>{currentConcept.goal}</p>
              <p className="text-zinc-500 text-xs pt-2 font-mono">
                New words in this concept: {currentConcept.newWordsCount}
              </p>
            </div>
            <div className="pt-4">
              <button
                type="button"
                onClick={() => setPageMode('normal')}
                className="px-8 py-3.5 rounded-2xl bg-black hover:bg-zinc-900 border border-white/20 hover:border-white/40 font-semibold text-white transition-all cursor-pointer shadow-lg active:scale-[0.98]"
              >
                Let&apos;s go
              </button>
            </div>
          </div>
        </div>
      ) : pageMode === 'concept-complete' ? (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-6rem)] max-w-xl mx-auto px-6 py-12 text-zinc-100 font-sans">
          <div className="w-full rounded-3xl bg-[#121214] border border-white/[0.08] p-8 sm:p-10 shadow-2xl space-y-6 animate-in fade-in duration-300">
            <div className="space-y-1 text-center">
              <span className="text-xs font-mono font-medium tracking-wider uppercase text-emerald-400">
                Completed
              </span>
              <h2 className="text-2xl font-bold text-white">
                Concept {currentConcept.number} complete!
              </h2>
            </div>

            <div className="space-y-3 p-5 rounded-2xl bg-[#18181b] border border-white/[0.08] text-sm">
              <div className="font-medium text-zinc-300">You can now:</div>
              <div className="flex items-start gap-2.5 text-zinc-200">
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
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-black hover:bg-zinc-900 border border-white/20 hover:border-white/40 font-semibold text-white transition-all cursor-pointer shadow-lg active:scale-[0.98]"
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
          <div className="w-full rounded-3xl bg-[#121214] border border-white/[0.08] p-8 sm:p-12 shadow-2xl space-y-6 text-center animate-in fade-in duration-300">
            <div className="w-14 h-14 rounded-full bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center mx-auto text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Day 1 Complete!</h2>
            <p className="text-sm text-zinc-300 leading-relaxed">
              You have mastered the foundational physical layer, IP addressing principles, latency diagnostics, and the 3-step triage method.
            </p>
            <div className="p-5 rounded-2xl bg-[#18181b] border border-white/[0.08] text-xs text-zinc-300 text-left space-y-1.5">
              <div className="font-semibold text-white">What awaits on Day 2:</div>
              <p>&ldquo;Your computer looked for .99, found nobody, and said so. How does a computer find out who has a label?&rdquo;</p>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  onComplete?.();
                  router.push('/networking/learn/net-02');
                }}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-black hover:bg-zinc-900 border border-white/20 hover:border-white/40 font-semibold text-white shadow-xl transition-all cursor-pointer active:scale-[0.98]"
              >
                Continue to Day 2
              </button>
              <button
                type="button"
                onClick={backToRoadmap}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#18181b] hover:bg-[#202024] border border-white/[0.08] text-zinc-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
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
          {/* 1. TOP BAR: Minimalist Rail, Concept Name & My Words Button               */}
          {/* ========================================================================= */}
          <header className="rounded-2xl bg-[#121214] border border-white/[0.08] px-5 py-3 flex items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-sm tracking-tight text-white">Day 1</span>
              <span className="text-zinc-600 font-mono">•</span>
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
                      ? 'bg-zinc-400 shadow-[0_0_6px_rgba(255,255,255,0.3)]'
                      : i === rungIdx
                      ? 'bg-white ring-2 ring-white/40 ring-offset-2 ring-offset-[#121214]'
                      : 'bg-zinc-800/80 hover:bg-zinc-700'
                  }`}
                />
              ))}
            </div>

            {/* My Words Drawer Button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsWordsDrawerOpen((prev) => !prev)}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#1c1c1f] hover:bg-[#25252a] border border-white/[0.08] text-xs font-medium text-zinc-200 hover:text-white transition-all cursor-pointer shadow-sm active:scale-[0.98]"
              >
                <BookOpen className="w-3.5 h-3.5 text-zinc-300" />
                <span>My Words</span>
                <span className="px-1.5 py-0.5 rounded-md bg-zinc-900 border border-white/10 text-[10px] font-mono text-zinc-300">
                  {unlockedWords.length}
                </span>
              </button>
            </div>
          </header>

          {/* ========================================================================= */}
          {/* 2. OPTIONAL TELEMETRY STATUS STRIP (42px)                                 */}
          {/* ========================================================================= */}
          {conceptIdx >= 1 && (
            <div className="w-full h-11 px-5 rounded-2xl bg-[#121214] border border-white/[0.08] flex items-center justify-between text-xs font-mono shadow-md">
              {conceptIdx === 3 ? (
                // Concept 4 Checklist Strip
                <div className="flex items-center gap-3">
                  <span className="text-zinc-500 font-semibold uppercase text-[11px] tracking-wider">Triage Order:</span>
                  <button
                    type="button"
                    onClick={() => setCheckedLight(true)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs transition-all cursor-pointer ${
                      checkedLight
                        ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-300 shadow-sm'
                        : 'bg-[#1c1c1f] border-white/[0.06] text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <span>① Light on?</span>
                    {checkedLight && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setCheckedAddress(true)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs transition-all cursor-pointer ${
                      checkedAddress
                        ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-300 shadow-sm'
                        : 'bg-[#1c1c1f] border-white/[0.06] text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <span>② Address right?</span>
                    {checkedAddress && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setCheckedPing(true)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs transition-all cursor-pointer ${
                      checkedPing
                        ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-300 shadow-sm'
                        : 'bg-[#1c1c1f] border-white/[0.06] text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <span>③ Ping replies?</span>
                    {checkedPing && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>
                </div>
              ) : (
                // Concept 2 and 3 Status Strip
                <div className="flex items-center gap-4">
                  <span className="inline-flex items-center gap-2 text-zinc-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                    <span>Light: <strong className="text-emerald-400 font-semibold">ON</strong></span>
                  </span>
                  <span className="text-zinc-700">|</span>
                  <span className="text-zinc-300">
                    Your address: <span className="text-blue-400 font-medium">192.168.1</span>.<span className="text-amber-400 font-medium">10</span>
                  </span>
                  <span className="text-zinc-700">|</span>
                  <span className="text-zinc-400">
                    Neighbor: <span className="text-zinc-200 font-medium">192.168.1.20</span>
                  </span>
                </div>
              )}

              <div className="text-[11px] text-zinc-500 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                <span>Simulated Direct Wire</span>
              </div>
            </div>
          )}

      {/* ========================================================================= */}
      {/* 3. MAIN WORKBENCH: STAGE (62%) & CARD + WORK AREA (38%)                   */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-[500px]">
        {/* Left Column: Stage Component (62% width on desktop) */}
        <div className="lg:col-span-7 flex flex-col rounded-2xl bg-[#0e0e11] border border-white/[0.08] overflow-hidden shadow-2xl">
          <PhysicalConnectionCanvas
            stageState={effectiveStageState}
            onToggleCable={() => {
              const next = (manualCableState ?? effectiveStageState.cable) === 'both' ? 'loose-on-desk' : 'both';
              setManualCableState(next);
              if (currentRung.id === 'c1-r5' && next === 'both') {
                setIsTaskDone(true);
              }
            }}
            onPlugCable={(target) => {
              setManualCableState(target);
              if (currentRung.id === 'c1-r5' && target === 'both') {
                setIsTaskDone(true);
              }
            }}
            onSelectTag={(which) => {
              if (currentRung.layoutState === 'STATE_C') setActiveWorkTab('address');
            }}
            onReplay={() => {
              setIsTaskDone(false);
              setManualCableState(null);
            }}
            onOpenLookInside={(id) => setActiveLookInsideId(id)}
          />
        </div>

        {/* Right Column: Card, Work Area & Fixed Button Row (38% width on desktop) */}
        <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl bg-[#121214] border border-white/[0.08] p-6 shadow-2xl">
          <div className="space-y-4">
            {/* Step Label & Compact Title */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-zinc-500 font-mono">
                <span className="uppercase tracking-wider font-normal">Concept {currentConcept.number} • Step {currentRung.rungNumber} of {currentConcept.rungs.length}</span>
                <span className="px-2 py-0.5 rounded-md bg-[#18181b] border border-white/[0.06] text-zinc-400 text-[11px] font-mono">{currentRung.timeEstimate}</span>
              </div>
              <h2 className="text-base sm:text-[17px] font-medium text-zinc-100 tracking-tight">
                {currentRung.title}
              </h2>
            </div>

            {/* Subtle Observation / Look line */}
            {currentRung.look && (
              <div className="text-xs sm:text-[13px] text-zinc-400 leading-relaxed bg-[#18181b]/50 border-l-2 border-zinc-600 pl-3 py-1.5 rounded-r-xl flex items-start gap-2">
                <span className="text-zinc-500 font-mono uppercase text-[10px] tracking-wider font-medium shrink-0 mt-0.5">
                  Look:
                </span>
                <span className="font-normal">{currentRung.look}</span>
              </div>
            )}

            {/* Main Explanation Story */}
            <StructuredStoryContent
              story={currentRung.story}
              meaningText={currentRung.meaningText}
              isTaskDone={isTaskDone}
            />

            {/* Simplified? note link */}
            {currentRung.simplified && (
              <div className="text-xs">
                <button
                  type="button"
                  onClick={() => setIsSimplifiedOpen((prev) => !prev)}
                  className="text-zinc-500 hover:text-zinc-300 underline cursor-pointer transition-colors"
                >
                  Simplified?
                </button>
                {isSimplifiedOpen && (
                  <div className="mt-2 p-3 rounded-xl bg-[#18181b] border border-white/[0.08] text-zinc-300 text-xs leading-relaxed animate-in fade-in duration-200">
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
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#18181b] hover:bg-[#202024] border border-white/[0.08] text-xs text-blue-300 font-medium transition-all cursor-pointer shadow-sm"
                >
                  <Search className="w-3.5 h-3.5 text-blue-400" />
                  <span>Look inside (optional)</span>
                </button>
              </div>
            )}

            {/* Your turn Hero Block: Only shown for hands-on tasks without questions */}
            {currentRung.doText && !currentRung.check.options && (
              <div className="rounded-xl bg-[#18181b]/80 border border-white/[0.06] p-4 space-y-2.5 shadow-sm">
                <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.4)]" />
                  <span>Your turn:</span>
                </div>
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex items-start gap-2">
                    <span className="font-medium text-emerald-400 font-mono text-[11px] shrink-0 mt-0.5">DO:</span>
                    <span className="text-zinc-200 font-normal leading-relaxed">{currentRung.doText}</span>
                  </div>
                  {currentRung.whyText && (
                    <div className="flex items-start gap-2 text-zinc-400 font-normal">
                      <span className="font-medium text-zinc-500 font-mono text-[11px] shrink-0 mt-0.5">WHY:</span>
                      <span className="leading-relaxed">{currentRung.whyText}</span>
                    </div>
                  )}
                  {currentRung.expectText && (
                    <div className="flex items-start gap-2 text-zinc-400 font-normal">
                      <span className="font-medium text-zinc-500 font-mono text-[11px] shrink-0 mt-0.5">EXPECT:</span>
                      <span className="leading-relaxed">{currentRung.expectText}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Interactive Questions Styled with Clean Radio Indicators */}
            {currentRung.check.options && (
              <div className="space-y-3 pt-1">
                <div className="text-[14px] sm:text-[15px] font-medium text-zinc-100 tracking-normal leading-snug">
                  {currentRung.check.question}
                </div>
                <div className="space-y-2">
                  {currentRung.check.options.map((opt) => {
                    const isSelected = selectedOptionId === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSelectOption(opt.id)}
                        className={`w-full text-left py-3 px-3.5 rounded-xl border text-sm transition-all flex items-center justify-between group cursor-pointer ${
                          isSelected
                            ? opt.isCorrect
                              ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-100 shadow-sm'
                              : 'bg-amber-950/30 border-amber-500/50 text-amber-200 shadow-sm'
                            : 'bg-[#18181b]/80 hover:bg-[#202024] border-white/[0.06] hover:border-white/10 text-zinc-300 hover:text-zinc-100'
                        }`}
                      >
                        <div className="flex items-center gap-3 pr-3">
                          <span
                            className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                              isSelected
                                ? opt.isCorrect
                                  ? 'border-emerald-400 bg-emerald-500/20'
                                  : 'border-amber-400 bg-amber-500/20'
                                : 'border-zinc-600 group-hover:border-zinc-400'
                            }`}
                          >
                            {isSelected && (
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  opt.isCorrect ? 'bg-emerald-400' : 'bg-amber-400'
                                }`}
                              />
                            )}
                          </span>
                          <span className="font-normal leading-snug">{opt.label}</span>
                        </div>
                        {isSelected && (
                          opt.isCorrect ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                          )
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Feedback message (No red buzzers) */}
            {feedbackText && (
              <div
                className={`p-3.5 rounded-xl border text-xs sm:text-[13px] leading-relaxed font-normal animate-in fade-in duration-200 ${
                  isQuestionCorrect
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                    : 'bg-[#18181b] border-white/[0.08] text-zinc-300'
                }`}
              >
                {feedbackText}
              </div>
            )}

            {/* Self-check Write & Compare (State F) */}
            {currentRung.check.type === 'write-and-compare' && (
              <div className="space-y-3 pt-2">
                <textarea
                  value={learnerSentence}
                  onChange={(e) => setLearnerSentence(e.target.value)}
                  placeholder="Write it in your own words..."
                  className="w-full p-3.5 rounded-xl bg-[#18181b] border border-white/[0.08] text-sm text-zinc-100 outline-none focus:border-white/30 focus:ring-1 focus:ring-white/10 h-24 resize-none font-sans placeholder:text-zinc-500"
                />
                {!selfCheckRevealed ? (
                  <button
                    type="button"
                    disabled={learnerSentence.trim().length < 6}
                    onClick={() => setSelfCheckRevealed(true)}
                    className="px-5 py-2.5 rounded-xl bg-[#1c1c1f] hover:bg-[#26262b] disabled:opacity-40 text-xs font-semibold text-zinc-200 border border-white/[0.08] cursor-pointer transition-all shadow-sm"
                  >
                    Check my sentence
                  </button>
                ) : (
                  <div className="p-4 rounded-xl bg-[#18181b] border border-white/[0.08] space-y-2.5 text-xs sm:text-sm">
                    <div className="text-zinc-400 font-semibold">Here&apos;s one way to say it:</div>
                    <div className="text-zinc-200 italic leading-relaxed">&ldquo;{currentRung.check.modelSentence}&rdquo;</div>
                    <div className="flex items-center gap-2.5 pt-1.5">
                      <button
                        type="button"
                        onClick={() => setIsTaskDone(true)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white cursor-pointer shadow-sm transition-all"
                      >
                        Yes, mine says the same
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelfCheckRevealed(false)}
                        className="px-4 py-2 rounded-xl bg-[#1c1c1f] hover:bg-[#26262a] text-xs font-medium text-zinc-300 border border-white/[0.06] cursor-pointer transition-all"
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
              <div className="space-y-3 text-xs">
                {currentRung.check.sortItems.map((item) => {
                  const selectedLbl = sortMatches[item.id];
                  const isMatchCorrect = selectedLbl === item.targetLabel;
                  return (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-xl border space-y-2.5 transition-all ${
                        selectedLbl
                          ? isMatchCorrect
                            ? 'bg-emerald-950/40 border-emerald-600/70'
                            : 'bg-[#18181b] border-amber-500/50'
                          : 'bg-[#18181b] border-white/[0.08]'
                      }`}
                    >
                      <div className="font-mono text-zinc-200 font-semibold">{item.snippet}</div>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {currentRung.check.sortLabels?.map((lbl) => {
                          const isSelected = selectedLbl === lbl;
                          return (
                            <button
                              key={lbl}
                              type="button"
                              onClick={() => handleSortSelect(item.id, lbl)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                                isSelected
                                  ? isMatchCorrect
                                    ? 'bg-emerald-600 text-white border-emerald-400 shadow-sm'
                                    : 'bg-amber-600 text-white border-amber-400 shadow-sm'
                                  : 'bg-[#1c1c1f] text-zinc-300 border-white/[0.06] hover:bg-[#26262a] hover:text-white'
                              }`}
                            >
                              {lbl}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {/* Status Guidance Banner */}
                {Object.keys(sortMatches).length === currentRung.check.sortItems.length ? (
                  isPrimaryReady ? (
                    <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/60 text-emerald-300 text-xs font-medium flex items-center gap-2 animate-in fade-in duration-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>All 3 matched correctly! Press Continue to proceed.</span>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-[#18181b] border border-amber-500/60 text-amber-200 text-xs leading-relaxed flex items-center gap-2 animate-in fade-in duration-200">
                      <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Some matches need adjusting. Check: transmit failed = stopped inside; unreachable = nobody has that label; time=1ms = it worked!</span>
                    </div>
                  )
                ) : (
                  <div className="text-zinc-500 text-[11px] font-mono">
                    Match all 3 outputs above to continue.
                  </div>
                )}
              </div>
            )}

            {/* Address Configuration Bar for Double-Fault Ticket (c4-r3) */}
            {currentRung.id === 'c4-r3' && (
              <div className="p-3.5 rounded-xl bg-[#18181b] border border-white/[0.08] flex items-center justify-between gap-3 text-xs shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-400 font-mono">Step ② Street:</span>
                  <span className={`font-mono font-semibold ${(manualStreetAddress || '192.168.2') === '192.168.1' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {(manualStreetAddress || '192.168.2')}.10
                  </span>
                </div>
                {(manualStreetAddress || '192.168.2') !== '192.168.1' ? (
                  <button
                    type="button"
                    onClick={() => setManualStreetAddress('192.168.1')}
                    className="px-3.5 py-1.5 rounded-lg bg-black hover:bg-zinc-900 border border-white/20 text-white font-medium text-xs cursor-pointer shadow-sm active:scale-[0.98]"
                  >
                    Fix Street to 192.168.1
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-1 text-emerald-400 font-medium font-mono text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Street 192.168.1 (Correct)
                  </span>
                )}
              </div>
            )}

            {/* Work Area: Terminal Simulator */}
            {(currentRung.layoutState === 'STATE_B' ||
              currentRung.layoutState === 'STATE_C' ||
              currentRung.layoutState === 'STATE_D' ||
              Boolean(currentRung.check.expectedCommand)) && (
              <Day1GuidedTerminal
                expectedCommand={currentRung.check.expectedCommand || 'ping 192.168.1.20'}
                allowedTargets={currentRung.check.allowedTargets}
                freeTargets={currentRung.check.freeTargets}
                stageState={effectiveStageState}
                currentRungId={currentRung.id}
                onFocusOrClick={() => {
                  if (currentRung.id === 'c1-r2') {
                    setIsTaskDone(true);
                  }
                }}
                onCommandRun={(cmd, outcome) => {
                  setTaskOutcome(outcome);
                  if (currentRung.id === 'c1-r2') {
                    setIsTaskDone(true);
                  }
                  if (currentRung.check.type === 'diagnose') {
                    // In diagnosis rungs, task completes ONLY when ping genuinely succeeds
                    if (outcome === 'reply') {
                      setIsTaskDone(true);
                    }
                  } else if (currentRung.check.type === 'task') {
                    if (currentRung.check.expectedCommand) {
                      if (cmd.toLowerCase().trim().startsWith(currentRung.check.expectedCommand.toLowerCase().trim())) {
                        setIsTaskDone(true);
                      }
                    } else {
                      setIsTaskDone(true);
                    }
                  }
                }}
                onStageHighlight={(tag) => setHoveredStageId(tag)}
              />
            )}
          </div>

          {/* Fixed Button Row */}
          <div className="pt-5 border-t border-white/[0.08] flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2.5 rounded-xl bg-[#1c1c1f] hover:bg-[#26262a] border border-white/[0.08] text-xs font-medium text-zinc-300 hover:text-white transition-all cursor-pointer shadow-sm"
            >
              Back
            </button>

            {/* Hint Button */}
            {hintLevel < 3 && currentRung.hints && (
              <button
                type="button"
                onClick={() => setHintLevel((prev) => prev + 1)}
                className="text-xs text-zinc-400 hover:text-zinc-200 underline cursor-pointer transition-colors"
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
              className={`px-7 py-3 rounded-xl font-medium text-xs sm:text-sm transition-all cursor-pointer ${
                isPrimaryReady
                  ? 'bg-black hover:bg-zinc-900 text-white border border-white/20 hover:border-white/40 shadow-lg shadow-black/60 ring-1 ring-white/10 active:scale-[0.98]'
                  : 'bg-zinc-900/60 text-zinc-500 cursor-not-allowed border border-white/[0.04]'
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
                className="px-5 py-2 rounded-lg bg-black hover:bg-zinc-900 border border-white/20 text-xs font-semibold text-white cursor-pointer active:scale-[0.98]"
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
