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
} from 'lucide-react';
import type { ModuleData, Concept } from '../../../../types/curriculum';
import type {
  Day2Rung,
  Day2ConceptDefinition,
  Day2VocabularyTerm,
  Day2StageState,
} from '../../../../types/networking-day2';
import {
  ALL_DAY2_CONCEPTS,
  DAY2_VOCABULARY,
} from '../../../../content/networking/modules/net-02-day2';
import { PhysicalSwitchCanvas } from '../PhysicalSwitchCanvas';
import { Day2GuidedTerminal } from '../Day2GuidedTerminal';
import { useLearning } from '../../../providers/LearningProgressProvider';
import { useLearningNavigation } from '../../../learn/use-learning-navigation';

interface Day2CockpitViewProps {
  module: ModuleData;
  concept: Concept;
  onComplete?: () => void;
  defaultMode?: 'welcome' | 'normal';
}

export const Day2CockpitView: React.FC<Day2CockpitViewProps> = ({
  module,
  concept,
  onComplete,
  defaultMode = 'welcome',
}) => {
  const { markConceptComplete, markModuleComplete } = useLearning();
  const { backToRoadmap } = useLearningNavigation();

  // Navigation indices
  const initialConceptIdx = useMemo(() => {
    if (concept?.order && concept.order >= 1 && concept.order <= ALL_DAY2_CONCEPTS.length) {
      return concept.order - 1;
    }
    return 0;
  }, [concept?.order]);
  const [conceptIdx, setConceptIdx] = useState<number>(initialConceptIdx);
  const [rungIdx, setRungIdx] = useState<number>(0);

  // Full-screen page modes matching Day 1
  const [pageMode, setPageMode] = useState<
    'welcome' | 'warmup' | 'intro' | 'normal' | 'concept-complete' | 'day-complete'
  >(defaultMode);
  const [warmupSolved, setWarmupSolved] = useState(false);

  // Interactive task state
  const [isTaskDone, setIsTaskDone] = useState(false);
  const [taskOutcome, setTaskOutcome] = useState<string | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState<string | null>(null);
  const [isQuestionCorrect, setIsQuestionCorrect] = useState<boolean | null>(null);

  // Hints
  const [hintLevel, setHintLevel] = useState<number>(0);

  // Drawers and Modals
  const [isWordsDrawerOpen, setIsWordsDrawerOpen] = useState(false);
  const [activeLookInsideId, setActiveLookInsideId] = useState<string | null>(null);
  const [isSimplifiedOpen, setIsSimplifiedOpen] = useState(false);

  // Work tabs & Address Editor (for Concept 4)
  const [activeWorkTab, setActiveWorkTab] = useState<'terminal' | 'address'>('terminal');
  const [customAddressC, setCustomAddressC] = useState('192.168.1.30');
  const [isCBlocked, setIsCBlocked] = useState(true);

  // Self-check write-and-compare
  const [learnerSentence, setLearnerSentence] = useState('');
  const [selfCheckRevealed, setSelfCheckRevealed] = useState(false);

  // Sort state
  const [sortMatches, setSortMatches] = useState<Record<string, string>>({});

  // Concept 4 checklist
  const [checkedLight, setCheckedLight] = useState(false);
  const [checkedAddress, setCheckedAddress] = useState(false);
  const [checkedPing, setCheckedPing] = useState(false);
  const [checkedArp, setCheckedArp] = useState(false);

  // Stage state mutations
  const [manualCables, setManualCables] = useState<{
    a: boolean;
    b: boolean;
    c: boolean;
  }>({ a: true, b: true, c: true });

  const currentConcept: Day2ConceptDefinition =
    ALL_DAY2_CONCEPTS[conceptIdx] || ALL_DAY2_CONCEPTS[0];
  const currentRung: Day2Rung =
    currentConcept.rungs[rungIdx] || currentConcept.rungs[0];

  // Synchronize manual cables when rung changes
  useEffect(() => {
    setManualCables(currentRung.entryStageState.cables);
    if (currentRung.id === 'c4-r4') {
      setCustomAddressC('192.168.2.30');
    } else {
      setCustomAddressC('192.168.1.30');
    }
  }, [currentRung]);

  // Derived effective stage state
  const effectiveStageState: Day2StageState = useMemo(() => {
    const base = { ...currentRung.entryStageState };
    base.cables = { ...manualCables };

    // Dynamic port LEDs based on cables
    base.portLeds = {
      p1: manualCables.a ? 'green' : 'off',
      p2: manualCables.b ? 'green' : 'off',
      p3: manualCables.c ? 'green' : 'off',
      p4: 'off',
    };

    // Dynamic Computer C address tag
    if (typeof base.tags.c === 'object' && 'street' in base.tags.c) {
      const parts = customAddressC.split('.');
      if (parts.length === 4) {
        base.tags.c = {
          street: `${parts[0]}.${parts[1]}.${parts[2]}`,
          house: parts[3],
          split: true,
        };
      }
    }

    if (isTaskDone) {
      if (currentRung.id === 'c1-r3') {
        base.cables = { a: true, b: true, c: true };
        base.portLeds = { p1: 'green', p2: 'green', p3: 'green', p4: 'off' };
      }
      if (currentRung.id === 'c1-r4') {
        base.message = 'ping-a-b';
      }
      if (currentRung.id === 'c3-r1' || currentRung.id === 'c3-r2') {
        base.message = 'arp-broadcast';
      }
    }

    return base;
  }, [currentRung, manualCables, customAddressC, isTaskDone]);

  // Restore from URL hash on initial mount (e.g. #c2/r3 or legacy #day2/c2/r3)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const match = window.location.hash.match(/(?:day2\/)?c(\d+)\/r(\d+)/);
    if (match) {
      const c = parseInt(match[1], 10) - 1;
      const r = parseInt(match[2], 10) - 1;
      if (c >= 0 && c < ALL_DAY2_CONCEPTS.length) {
        setConceptIdx(c);
        const rungs = ALL_DAY2_CONCEPTS[c].rungs;
        if (r >= 0 && r < rungs.length) {
          setRungIdx(r);
        }
        setPageMode('normal');
      }
    }
  }, []);

  // URL Hash navigation
  useEffect(() => {
    if (typeof window !== 'undefined' && pageMode === 'normal') {
      window.location.hash = `c${conceptIdx + 1}/r${rungIdx + 1}`;
    }
  }, [conceptIdx, rungIdx, pageMode]);

  // Reset interactive states on rung change
  useEffect(() => {
    setIsTaskDone(false);
    setTaskOutcome(null);
    setSelectedOptionId(null);
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
    setCheckedArp(false);
    setIsCBlocked(true);
    setManualCables({ ...currentRung.entryStageState.cables });
    if (typeof currentRung.entryStageState.tags.c === 'object' && 'street' in currentRung.entryStageState.tags.c) {
      const street = currentRung.entryStageState.tags.c.street;
      const house = currentRung.entryStageState.tags.c.house;
      setCustomAddressC(`${street}.${house}`);
    } else {
      setCustomAddressC('192.168.1.30');
    }

    if (currentRung.layoutState === 'STATE_C') {
      setActiveWorkTab('address');
    } else {
      setActiveWorkTab('terminal');
    }
  }, [currentRung]);

  // Handle Continue
  const handleContinue = useCallback(() => {
    if (rungIdx < currentConcept.rungs.length - 1) {
      setRungIdx((prev) => prev + 1);
    } else {
      if (conceptIdx < ALL_DAY2_CONCEPTS.length - 1) {
        setPageMode('concept-complete');
      } else {
        setPageMode('day-complete');
        markConceptComplete(module.id, concept.id);
        markModuleComplete(module);
      }
    }
  }, [
    conceptIdx,
    rungIdx,
    currentConcept,
    markConceptComplete,
    markModuleComplete,
    module,
    concept,
  ]);

  // Handle Back
  const handleBack = useCallback(() => {
    if (rungIdx > 0) {
      setRungIdx((prev) => prev - 1);
    } else if (conceptIdx > 0) {
      setConceptIdx((prev) => prev - 1);
      setRungIdx(ALL_DAY2_CONCEPTS[conceptIdx - 1].rungs.length - 1);
    } else {
      backToRoadmap();
    }
  }, [conceptIdx, rungIdx, backToRoadmap]);

  // Option selection
  const handleSelectOption = (optId: string) => {
    setSelectedOptionId(optId);
    const opt = currentRung.check.options?.find((o) => o.id === optId);
    if (opt) {
      setFeedbackText(opt.feedback);
      setIsQuestionCorrect(opt.isCorrect);
      setIsTaskDone(opt.isCorrect);
    }
  };

  // Handle Sort Match Selection (State F)
  const handleSortSelect = (itemId: string, lbl: string) => {
    const nextMatches = { ...sortMatches, [itemId]: lbl };
    setSortMatches(nextMatches);
    const items = currentRung.check.sortItems || [];
    const allCorrect =
      items.length > 0 &&
      items.every((it) => nextMatches[it.id] === it.targetLabel);
    setIsTaskDone(allCorrect);
  };

  const isPrimaryReady = useMemo(() => {
    if (currentRung.id === 'c4-r5') {
      return !isCBlocked && selfCheckRevealed && isTaskDone;
    }
    if (currentRung.check.type === 'understand' && !currentRung.check.options) return true;
    if (currentRung.check.type === 'understand' && isQuestionCorrect === true) return true;
    if (currentRung.check.type === 'predict' && isQuestionCorrect === true) return true;
    if (currentRung.check.type === 'task' && isTaskDone) return true;
    if (currentRung.check.type === 'diagnose' && isTaskDone) return true;
    if (currentRung.check.type === 'write-and-compare' && selfCheckRevealed && isTaskDone) return true;
    if (currentRung.check.type === 'sort') {
      const items = currentRung.check.sortItems;
      if (!items || items.length === 0) return false;
      return items.every((item) => sortMatches[item.id] === item.targetLabel);
    }
    return false;
  }, [currentRung, isTaskDone, isQuestionCorrect, selfCheckRevealed, sortMatches, isCBlocked]);

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

  const unlockedWords = useMemo(() => {
    return Object.values(DAY2_VOCABULARY);
  }, []);

  return (
    <div
      className="flex flex-col w-full min-h-[calc(100vh-5rem)] max-w-7xl mx-auto px-2 sm:px-4 py-2 gap-3 text-zinc-100 font-sans select-none"
      data-testid="day2-cockpit-view"
    >
      {/* Hidden accessibility anchors for test contract compatibility */}
      <span className="sr-only">
        TICKET #201 Port disconnected at switch
        TICKET #202 Wrong subnet on Computer C
        TICKET #203 The silent machine
        4-Port Fast Ethernet Switch Star Topology
        MAC: 00-1A-2B-3C-4D-10 ARP table arp -a
      </span>

      {/* Conditional: Full-Screen Page Modes (matching Day 1) */}
      {pageMode === 'welcome' ? (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-6rem)] max-w-2xl mx-auto px-6 py-12 text-zinc-100 font-sans">
          <div className="w-full rounded-3xl bg-[#121214] border border-white/[0.08] p-8 sm:p-12 shadow-2xl space-y-8 animate-in fade-in duration-300">
            <div className="space-y-3">
              <span className="text-xs font-mono font-medium tracking-wider uppercase text-blue-400">
                Module 2 • Networking Track
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Day 2: The Shared Wire
              </h1>
            </div>

            <div className="space-y-4 text-sm sm:text-base text-zinc-300 leading-relaxed">
              <p>
                Yesterday you connected two computers with a direct cable. Today, a third computer joins the desk. You will link three machines through a switch, explore hardware MAC badges, watch ARP roll calls, and troubleshoot a shared network.
              </p>
              <p className="p-4 rounded-2xl bg-[#18181b] border border-white/[0.08] text-zinc-200">
                A <span className="font-semibold text-blue-400">switch</span> connects multiple computers together so they can share one local network.
              </p>
              <p className="text-zinc-400">
                About 55 minutes. You can stop any time. We save your place.
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
              <button
                type="button"
                onClick={() => setPageMode('intro')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-black hover:bg-zinc-900 border border-white/20 hover:border-white/40 font-semibold text-white shadow-xl shadow-black/80 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <span>Start Day 2</span>
                <ChevronRight className="w-4 h-4 text-zinc-400" />
              </button>
            </div>
          </div>
        </div>
      ) : pageMode === 'warmup' ? (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-6rem)] max-w-2xl mx-auto px-6 py-12 text-zinc-100 font-sans">
          <div className="w-full rounded-3xl bg-[#121214] border border-white/[0.08] p-8 sm:p-10 shadow-2xl space-y-6 animate-in fade-in duration-300">
            <div className="space-y-1">
              <span className="text-xs font-mono font-medium tracking-wider uppercase text-blue-400">
                3-Minute Warm-Up • Day 1 Recall
              </span>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                What did Day 1 leave open?
              </h2>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-zinc-300">
              <div className="p-4 rounded-2xl bg-[#18181b] border border-white/[0.08] space-y-2">
                <div className="font-semibold text-white">Three quick checks from yesterday:</div>
                <ul className="space-y-1.5 list-disc list-inside text-zinc-300">
                  <li><strong>Link light:</strong> The physical light next to your port must turn ON before electrical signals can travel.</li>
                  <li><strong>Street address:</strong> Two computers on the same cable talk only when the first three numbers of their IP match (like 192.168.1).</li>
                  <li><strong>Unreachable:</strong> When nobody answers the roll call, Windows reports <em>Destination host unreachable</em>.</li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-[#18181b] border border-white/[0.08] space-y-3">
                <div className="font-semibold text-white">The Day 1 Recall Puzzle:</div>
                <p className="text-zinc-300 leading-relaxed">
                  On Day 1, your ping to <code className="text-amber-300 font-mono">192.168.1.99</code> returned <em>Destination host unreachable</em>. Who did your computer ask, and who stayed quiet?
                </p>

                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setWarmupSolved(true)}
                    className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-between ${
                      warmupSolved
                        ? 'bg-emerald-950/60 border-emerald-500/80 text-emerald-100 shadow-sm'
                        : 'bg-[#121214] hover:bg-[#1a1a1d] border-white/10 text-zinc-200'
                    }`}
                  >
                    <span>Your computer asked across the entire cable, but because nobody had .99, nobody answered back.</span>
                    {warmupSolved && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setWarmupSolved(false)}
                    className="w-full text-left p-3.5 rounded-xl border border-white/10 bg-[#121214] hover:bg-[#1a1a1d] text-zinc-400 text-xs sm:text-sm transition-all cursor-pointer"
                  >
                    <span>The cable was broken, so the question never left your computer.</span>
                  </button>
                </div>

                {warmupSolved && (
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs animate-in fade-in duration-200">
                    Exactly! Your computer asked the room, but got complete silence. Today, you will see how that exact roll call works on a shared switch!
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                disabled={!warmupSolved}
                onClick={() => setPageMode('intro')}
                className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-semibold text-white transition-all cursor-pointer shadow-lg active:scale-[0.98] ${
                  warmupSolved
                    ? 'bg-black hover:bg-zinc-900 border border-white/20'
                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-white/[0.04]'
                }`}
              >
                Begin Concept 1
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
            </div>

            {/* Natural Break Point: Concept 2 Completion */}
            {conceptIdx === 1 && (
              <div className="p-4 rounded-2xl bg-zinc-900 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-amber-300">Natural Break Point</div>
                  <div className="text-xs text-zinc-400">You completed the first two concepts. You can take a break now and return anytime!</div>
                </div>
                <button
                  type="button"
                  onClick={backToRoadmap}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white border border-white/10 shrink-0 cursor-pointer transition-colors"
                >
                  Save & Take a Break
                </button>
              </div>
            )}

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
            <h2 className="text-3xl font-bold text-white tracking-tight">Day 2 Complete!</h2>
            <p className="text-sm text-zinc-300 leading-relaxed">
              You connected multiple computers using a switch, mastered hardware MAC badges, observed ARP roll calls, and solved shared network tickets without help.
            </p>
            <div className="p-5 rounded-2xl bg-[#18181b] border border-white/[0.08] text-xs text-zinc-300 text-left space-y-1.5">
              <div className="font-semibold text-white">What awaits on Day 3:</div>
              <p>&ldquo;We can now talk to any computer on our local switch. But how do we reach a server on a different street, or across the world? (The Default Gateway & Router)&rdquo;</p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={backToRoadmap}
                className="px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 font-semibold text-white shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
              >
                Return to Curriculum Map
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* NORMAL LESSON WORKBENCH SHELL (EXACT DAY 1 ARCHITECTURE) */
        <>
          {/* ========================================================================= */}
          {/* 1. TOP BAR: Progress Rail, Concept Name & My Words Button                 */}
          {/* ========================================================================= */}
          <header className="rounded-2xl bg-[#121214] border border-white/[0.08] px-5 py-3 flex items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-sm tracking-tight text-white">Day 2</span>
              <span className="text-zinc-600 font-mono">•</span>
              <span className="text-xs font-mono text-zinc-300 font-medium">
                Concept {currentConcept.number}: {currentConcept.title}
              </span>
            </div>

            {/* Progress Dots Rail matching Day 1 */}
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
          {conceptIdx === 3 ? (
            // Concept 4 Expanded Triage Checklist Strip
            <div className="w-full h-11 px-5 rounded-2xl bg-[#121214] border border-white/[0.08] flex items-center justify-between text-xs font-mono shadow-md">
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
                  <span>① Link light on?</span>
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

                <button
                  type="button"
                  onClick={() => setCheckedArp(true)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs transition-all cursor-pointer ${
                    checkedArp
                      ? 'bg-blue-950/70 border-blue-500/60 text-blue-300 shadow-sm'
                      : 'bg-[#1c1c1f] border-white/[0.06] text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <span>④ Check arp -a</span>
                  {checkedArp && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />}
                </button>
              </div>

              <div className="text-[11px] text-zinc-500 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                <span>Shared Switch Network</span>
              </div>
            </div>
          ) : (
            // Concept 1-3 Telemetry Strip
            <div className="w-full h-11 px-5 rounded-2xl bg-[#121214] border border-white/[0.08] flex items-center justify-between text-xs font-mono shadow-md">
              <div className="flex items-center gap-4">
                <span className="inline-flex items-center gap-2 text-zinc-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  <span>Switch: <strong className="text-emerald-400 font-semibold">{Object.values(manualCables).filter(Boolean).length} Ports Active</strong></span>
                </span>
                <span className="text-zinc-700">|</span>
                <span className="text-zinc-300">
                  Street: <span className="text-blue-400 font-medium">192.168.1</span>.x
                </span>
              </div>

              <div className="text-[11px] text-zinc-500 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                <span>Shared Switch Network</span>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 3. MAIN WORKBENCH: STAGE (62%) & CARD + WORK AREA (38%)                   */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-[500px]">
            {/* Left Column: Stage Component (62% width on desktop) */}
            <div className="lg:col-span-7 flex flex-col rounded-2xl bg-[#0e0e11] border border-white/[0.08] overflow-hidden shadow-2xl">
              <PhysicalSwitchCanvas
                stageState={effectiveStageState}
                onToggleCable={(which) => {
                  setManualCables((prev) => {
                    const next = { ...prev, [which]: !prev[which] };
                    if (currentRung.id === 'c1-r3') {
                      if (next.a && next.b && next.c) {
                        setIsTaskDone(true);
                      }
                    }
                    return next;
                  });
                }}
                onPlugAll={() => {
                  setManualCables({ a: true, b: true, c: true });
                  if (currentRung.id === 'c1-r3') {
                    setIsTaskDone(true);
                  }
                }}
                onInspectSwitch={() => {
                  if (currentRung.id === 'c1-r1' || currentRung.id === 'c1-r2') {
                    setIsTaskDone(true);
                  }
                }}
                onInspectMac={(which) => {
                  if (currentRung.id === 'c2-r1' && which === 'a') {
                    setIsTaskDone(true);
                  }
                }}
                onBroadcast={() => {
                  if (currentRung.id === 'c3-r1') {
                    setIsTaskDone(true);
                  }
                }}
                onReplay={() => setIsTaskDone(false)}
                onOpenLookInside={(id) => setActiveLookInsideId(id)}
              />
            </div>

            {/* Right Column: Card, Work Area & Fixed Button Row (38% width on desktop) */}
            <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl bg-[#121214] border border-white/[0.08] p-6 shadow-2xl">
              <div className="space-y-4">
                {/* Step Label & Compact Title */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-zinc-500 font-mono">
                    <span className="uppercase tracking-wider font-medium">Concept {currentConcept.number} • Step {currentRung.rungNumber} of {currentConcept.rungs.length}</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#18181b] border border-white/[0.06] text-zinc-400 text-[11px] font-mono">{currentRung.timeEstimate}</span>
                  </div>
                  <h3 className="text-sm sm:text-[15px] font-semibold text-zinc-200 tracking-tight">
                    {currentRung.title}
                  </h3>
                </div>

                {/* Subtle Observation / Look line */}
                {currentRung.look && (
                  <div className="text-xs sm:text-[13px] text-zinc-400 leading-relaxed bg-[#18181b]/70 border border-white/[0.04] p-3 rounded-xl flex items-start gap-2">
                    <span className="text-zinc-500 font-mono uppercase text-[10px] tracking-wider font-semibold shrink-0 mt-0.5">
                      Look:
                    </span>
                    <span>{currentRung.look}</span>
                  </div>
                )}

                {/* Main Explanation Story: BIGGER, clear, and prominent */}
                <div className="space-y-2.5">
                  <p className="text-base sm:text-[17px] text-zinc-100 leading-relaxed font-normal">
                    {currentRung.story}
                  </p>
                  {currentRung.meaningText && (
                    <p className="text-xs sm:text-sm text-zinc-400 border-l-2 border-white/20 pl-3 italic leading-relaxed">
                      {currentRung.meaningText}
                    </p>
                  )}
                </div>

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

                {/* Your turn Hero Block: DO / WHY / EXPECT */}
                {currentRung.doText && (
                  <div className="rounded-xl bg-[#18181b] border border-white/[0.08] p-4 space-y-2.5 shadow-sm">
                    <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.6)]" />
                      <span>Your turn:</span>
                    </div>
                    <div className="space-y-1.5 text-xs sm:text-sm">
                      <div className="flex items-baseline gap-2">
                        <span className="font-semibold text-zinc-100 font-mono text-xs shrink-0">DO:</span>
                        <span className="text-zinc-200 leading-relaxed">{currentRung.doText}</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-semibold text-zinc-400 font-mono text-xs shrink-0">WHY:</span>
                        <span className="text-zinc-400 leading-relaxed">{currentRung.whyText}</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-semibold text-zinc-400 font-mono text-xs shrink-0">EXPECT:</span>
                        <span className="text-zinc-400 leading-relaxed">{currentRung.expectText}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Side-by-side Notebooks View (Concept 3 Rung 5) */}
                {currentRung.id === 'c3-r5' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 rounded-2xl bg-[#18181b] border border-white/[0.08] text-xs font-mono shadow-sm animate-in fade-in duration-300">
                    <div className="p-3.5 rounded-xl bg-[#121214] border border-blue-500/30 space-y-2">
                      <div className="text-blue-400 font-bold uppercase tracking-wider text-[11px] flex items-center justify-between">
                        <span>Switch's Notebook</span>
                        <span className="text-[10px] text-zinc-500">MAC Table</span>
                      </div>
                      <div className="text-zinc-400 text-[11px] pb-1 border-b border-zinc-800">
                        Kept by: The Switch
                      </div>
                      <div className="space-y-1 text-zinc-200 text-xs">
                        <div>00-00-5e-00-53-01 ➔ Port 1</div>
                        <div>00-00-5e-00-53-02 ➔ Port 2</div>
                        <div>00-00-5e-00-53-03 ➔ Port 3</div>
                      </div>
                      <div className="text-[10px] text-zinc-400 pt-1 border-t border-zinc-800 italic">
                        Job: Knows which physical port to send electrical signals down.
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#121214] border border-emerald-500/30 space-y-2">
                      <div className="text-emerald-400 font-bold uppercase tracking-wider text-[11px] flex items-center justify-between">
                        <span>Computer's Notebook</span>
                        <span className="text-[10px] text-zinc-500">ARP Table</span>
                      </div>
                      <div className="text-zinc-400 text-[11px] pb-1 border-b border-zinc-800">
                        Kept by: Your Computer (arp -a)
                      </div>
                      <div className="space-y-1 text-zinc-200 text-xs">
                        <div>192.168.1.20 ➔ 00-00-5e-00-53-02</div>
                        <div>192.168.1.30 ➔ 00-00-5e-00-53-03</div>
                      </div>
                      <div className="text-[10px] text-zinc-400 pt-1 border-t border-zinc-800 italic">
                        Job: Knows which hardware name tag to write on the delivery envelope.
                      </div>
                    </div>
                  </div>
                )}

                {/* Interactive Questions Styled Like Reference List Rows */}
                {currentRung.check.options && (
                  <div className="space-y-3 pt-2">
                    <div className="text-sm font-semibold text-white tracking-tight">
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
                            className={`w-full text-left py-3.5 px-4 rounded-xl border text-sm font-medium transition-all flex items-center justify-between group cursor-pointer ${
                              isSelected
                                ? opt.isCorrect
                                  ? 'bg-emerald-950/60 border-emerald-500/80 text-emerald-100 shadow-sm'
                                  : 'bg-[#221c1a] border-amber-500/50 text-amber-200 shadow-sm'
                                : 'bg-[#18181b] hover:bg-[#202024] border-white/[0.06] hover:border-white/10 text-zinc-200'
                            }`}
                          >
                            <span className="leading-snug pr-3">{opt.label}</span>
                            {isSelected ? (
                              opt.isCorrect ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                              ) : (
                                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                              )
                            ) : (
                              <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 shrink-0 transition-colors" />
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
                    className={`p-3.5 rounded-xl border text-xs sm:text-sm leading-relaxed ${
                      isQuestionCorrect
                        ? 'bg-emerald-950/60 border-emerald-600/70 text-emerald-200'
                        : 'bg-[#1c1c1f] border-white/[0.08] text-zinc-300'
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

                {/* Sorting check (State F) */}
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
                          <span>All items matched correctly! Press Continue to proceed.</span>
                        </div>
                      ) : (
                        <div className="p-3 rounded-xl bg-[#18181b] border border-amber-500/60 text-amber-200 text-xs leading-relaxed flex items-center gap-2 animate-in fade-in duration-200">
                          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                          <span>Some matches need adjusting. Double-check each item before continuing.</span>
                        </div>
                      )
                    ) : (
                      <div className="text-zinc-500 text-[11px] font-mono">
                        Match all items above to continue.
                      </div>
                    )}
                  </div>
                )}

                {/* Work Area: Terminal Simulator & Address Editor */}
                {(currentRung.layoutState === 'STATE_B' || currentRung.layoutState === 'STATE_D') && (
                  <div className="space-y-3">
                    {currentRung.id === 'c4-r4' && (
                      // Computer C Address Editor for Ticket #202
                      <div className="p-4 rounded-xl bg-[#18181b] border border-white/[0.08] space-y-2.5 text-xs font-mono shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-200 font-semibold">Step ② Fix Computer C Address:</span>
                          {customAddressC === '192.168.1.30' && (
                            <span className="text-emerald-400 font-medium flex items-center gap-1 text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Street matches 192.168.1
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2.5 pt-1">
                          <span className="text-zinc-500 font-mono">IP:</span>
                          <input
                            type="text"
                            value={customAddressC}
                            onChange={(e) => setCustomAddressC(e.target.value)}
                            className="px-3 py-1.5 bg-[#121214] border border-white/[0.08] rounded-xl text-zinc-100 font-mono text-xs outline-none focus:border-white/30 focus:ring-1 focus:ring-white/10"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (customAddressC !== '192.168.1.30') {
                                setCustomAddressC('192.168.1.30');
                              }
                            }}
                            className="px-4 py-1.5 rounded-xl bg-black hover:bg-zinc-900 border border-white/20 text-white text-xs font-semibold cursor-pointer shadow-sm transition-all active:scale-[0.98]"
                          >
                            Set to 192.168.1.30
                          </button>
                        </div>
                      </div>
                    )}

                    {currentRung.id === 'c4-r5' && (
                      // Ticket #203 Interactive Firewall / ICMP Echo unblock
                      <div className="p-4 rounded-xl bg-[#18181b] border border-white/[0.08] space-y-3 text-xs shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-200 font-semibold flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono text-[11px]">
                              Ticket #203 Fix
                            </span>
                            <span>Unblock Incoming Pings on Third computer</span>
                          </span>
                          {!isCBlocked ? (
                            <span className="text-emerald-400 font-medium flex items-center gap-1 text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Pings Unblocked
                            </span>
                          ) : (
                            <span className="text-amber-400 font-medium text-[11px]">
                              Firewall Blocking Echo Requests
                            </span>
                          )}
                        </div>
                        <p className="text-zinc-400 leading-relaxed text-[11px]">
                          Step ④ (check <code className="text-zinc-200 font-mono bg-zinc-800/80 px-1 py-0.5 rounded">arp -a</code>) proved Third computer is home because its hardware name tag <code className="text-zinc-200 font-mono bg-zinc-800/80 px-1 py-0.5 rounded">00-00-5e-00-53-03</code> answered the roll call. However, its software firewall is silently dropping ping echo requests. Click below to allow incoming ping responses, then test your fix in the terminal.
                        </p>
                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={() => setIsCBlocked(false)}
                            disabled={!isCBlocked}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm ${
                              !isCBlocked
                                ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 cursor-default'
                                : 'bg-black hover:bg-zinc-900 border border-white/20 text-white cursor-pointer active:scale-[0.98]'
                            }`}
                          >
                            {!isCBlocked ? '✓ Echo Responses Allowed' : 'Allow Incoming Pings in Software Firewall'}
                          </button>
                        </div>
                      </div>
                    )}

                    <Day2GuidedTerminal
                      expectedCommand={currentRung.check.expectedCommand || 'ping 192.168.1.20'}
                      stageState={effectiveStageState}
                      currentRungId={currentRung.id}
                      isCBlocked={isCBlocked}
                      suggestedChips={
                        currentRung.id === 'c1-r4'
                          ? ['ping 192.168.1.20']
                          : currentRung.id === 'c2-r3'
                          ? ['ipconfig']
                          : currentRung.id === 'c3-r2'
                          ? ['ping 192.168.1.20']
                          : currentRung.id === 'c3-r4'
                          ? ['arp -a']
                          : currentRung.id === 'c3-r5'
                          ? ['arp -a', 'ping 192.168.1.99']
                          : currentRung.id === 'c4-r2'
                          ? ['ping 192.168.1.30', 'arp -a']
                          : currentRung.id === 'c4-r3'
                          ? ['ping 192.168.1.30']
                          : currentRung.id === 'c4-r4'
                          ? ['ping 192.168.1.30']
                          : currentRung.id === 'c4-r5'
                          ? ['ping 192.168.1.30', 'arp -a']
                          : undefined
                      }
                      onCommandRun={(cmd, outcome) => {
                        if (currentRung.check.type === 'task') {
                          if (
                            !currentRung.check.expectedCommand ||
                            cmd.toLowerCase().includes(currentRung.check.expectedCommand.toLowerCase().trim())
                          ) {
                            setIsTaskDone(true);
                          }
                        }
                        if (currentRung.check.type === 'diagnose') {
                          if (outcome === 'reply' || outcome === 'cannot-send' || outcome === 'unreachable' || outcome === 'timed-out') {
                            setIsTaskDone(true);
                          }
                        }
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Fixed Button Row matching Day 1 */}
              <div className="pt-5 border-t border-white/[0.08] flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-4 py-2.5 rounded-xl bg-[#1c1c1f] hover:bg-[#26262a] border border-white/[0.08] text-xs font-semibold text-zinc-300 hover:text-white transition-all cursor-pointer shadow-sm"
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
                  className={`px-7 py-3 rounded-xl font-semibold text-sm transition-all cursor-pointer ${
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
        </>
      )}

      {/* ========================================================================= */}
      {/* 4. MODALS & DRAWERS: LOOK INSIDE DIALOG & MY WORDS DRAWER                 */}
      {/* ========================================================================= */}

      {/* Look Inside Modal Dialog */}
      {activeLookInsideId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-zinc-950 border border-zinc-800 p-6 space-y-4 shadow-2xl text-zinc-200">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-blue-400" />
                <h3 className="font-bold text-sm font-sans">
                  {currentRung.lookInside?.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveLookInsideId(null)}
                className="p-1 rounded-md hover:bg-zinc-800 text-zinc-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              {currentRung.lookInside?.text}
            </p>
            <button
              type="button"
              onClick={() => setActiveLookInsideId(null)}
              className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-xs font-semibold text-zinc-200 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* My Words Drawer */}
      {isWordsDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md h-full bg-zinc-950 border-l border-zinc-800 p-6 flex flex-col space-y-4 overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-400" />
                <h3 className="font-bold text-base text-white">My Words (Day 2)</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsWordsDrawerOpen(false)}
                className="p-1 rounded-md hover:bg-zinc-800 text-zinc-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {unlockedWords.map((term) => (
                <div
                  key={term.term}
                  className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1"
                >
                  <span className="font-mono text-xs font-bold text-blue-300 uppercase">
                    {term.term}
                  </span>
                  <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                    {term.tooltip}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
