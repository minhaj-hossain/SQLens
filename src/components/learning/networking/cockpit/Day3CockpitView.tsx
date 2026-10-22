'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  BookOpen,
  ChevronRight,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  X,
  Search,
  Keyboard,
  Network,
  ArrowRight,
} from 'lucide-react';
import type { ModuleData, Concept } from '../../../../types/curriculum';
import type {
  Day3Rung,
  Day3ConceptDefinition,
  Day3VocabularyTerm,
  Day3StageState,
} from '../../../../types/networking-day3';
import {
  ALL_DAY3_CONCEPTS,
  DAY3_VOCABULARY,
} from '../../../../content/networking/modules/net-03-day3';
import { PhysicalRouterCanvas } from '../PhysicalRouterCanvas';
import { Day3GuidedTerminal } from '../Day3GuidedTerminal';
import { StructuredStoryContent } from './StructuredStoryContent';
import { ProgressiveHintBox } from './ProgressiveHintBox';
import { KeyboardShortcutsModal } from './KeyboardShortcutsModal';
import { useLearning } from '../../../providers/LearningProgressProvider';
import { useLearningNavigation } from '../../../learn/use-learning-navigation';

interface Day3CockpitViewProps {
  module: ModuleData;
  concept: Concept;
  onComplete?: () => void;
  defaultMode?: 'welcome' | 'normal';
}

export const Day3CockpitView: React.FC<Day3CockpitViewProps> = ({
  module,
  concept,
  onComplete,
  defaultMode = 'welcome',
}) => {
  const { markConceptComplete, markModuleComplete } = useLearning();
  const { backToRoadmap } = useLearningNavigation();

  // Navigation indices
  const initialConceptIdx = useMemo(() => {
    if (concept?.order && concept.order >= 1 && concept.order <= ALL_DAY3_CONCEPTS.length) {
      return concept.order - 1;
    }
    return 0;
  }, [concept?.order]);

  const [conceptIdx, setConceptIdx] = useState<number>(initialConceptIdx);
  const [rungIdx, setRungIdx] = useState<number>(0);
  const [pageMode, setPageMode] = useState<'welcome' | 'normal' | 'complete'>(defaultMode);

  // Active concept & rung
  const currentConcept: Day3ConceptDefinition = ALL_DAY3_CONCEPTS[conceptIdx] || ALL_DAY3_CONCEPTS[0];
  const currentRung: Day3Rung = currentConcept.rungs[rungIdx] || currentConcept.rungs[0];

  // Drawer & Modal states
  const [isWordsDrawerOpen, setIsWordsDrawerOpen] = useState(false);
  const [wordsSearchQuery, setWordsSearchQuery] = useState('');
  const [activeLookInsideId, setActiveLookInsideId] = useState<string | null>(null);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isRoutingTableModalOpen, setIsRoutingTableModalOpen] = useState(false);
  const [isRouterArpModalOpen, setIsRouterArpModalOpen] = useState(false);

  // Interactive step states
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isQuestionCorrect, setIsQuestionCorrect] = useState<boolean | null>(null);
  const [isTaskDone, setIsTaskDone] = useState(false);
  const [selfCheckRevealed, setSelfCheckRevealed] = useState(false);
  const [sortMatches, setSortMatches] = useState<Record<string, string>>({});
  const [hintLevel, setHintLevel] = useState<number>(0);

  // Custom Gateway & Hardware inputs
  const [customGatewayA, setCustomGatewayA] = useState<string>('');
  const [manualCables, setManualCables] = useState<{
    hostA?: boolean;
    hostB?: boolean;
    routerEth0?: boolean;
    routerEth1?: boolean;
  }>({});

  // Concept 4 Triage Checklist states
  const [triageCableChecked, setTriageCableChecked] = useState(false);
  const [triageLocalIpChecked, setTriageLocalIpChecked] = useState(false);
  const [triageGatewayIpChecked, setTriageGatewayIpChecked] = useState(false);
  const [triageGatewayPingChecked, setTriageGatewayPingChecked] = useState(false);
  const [triageTargetPingChecked, setTriageTargetPingChecked] = useState(false);

  // Effective Stage State calculation
  const effectiveStageState: Day3StageState = useMemo(() => {
    const base = currentRung.entryStageState;
    return {
      ...base,
      cables: {
        hostA: manualCables.hostA ?? base.cables.hostA,
        hostB: manualCables.hostB ?? base.cables.hostB,
        routerEth0: manualCables.routerEth0 ?? base.cables.routerEth0,
        routerEth1: manualCables.routerEth1 ?? base.cables.routerEth1,
      },
      gateways: {
        a: customGatewayA !== '' ? customGatewayA : base.gateways.a,
        b: base.gateways.b,
      },
    };
  }, [currentRung.entryStageState, manualCables, customGatewayA]);

  // Reset rung step state
  const handleResetRung = useCallback(() => {
    setSelectedOptionId(null);
    setIsQuestionCorrect(null);
    setIsTaskDone(false);
    setSelfCheckRevealed(false);
    setSortMatches({});
    setHintLevel(0);
    setCustomGatewayA('');
    setManualCables({});
  }, []);

  // Reset when rung changes
  useEffect(() => {
    handleResetRung();
  }, [currentRung.id, handleResetRung]);

  // Verification whether student is ready to proceed
  const isPrimaryReady = useMemo(() => {
    if (currentRung.check.type === 'understand') return isQuestionCorrect === true;
    if (currentRung.check.type === 'predict') return isQuestionCorrect === true;
    if (currentRung.check.type === 'task') return isTaskDone;
    if (currentRung.check.type === 'diagnose') return isTaskDone;
    if (currentRung.check.type === 'explain-back') return isQuestionCorrect === true;
    if (currentRung.check.type === 'write-and-compare') return isQuestionCorrect === true;
    if (currentRung.check.type === 'sort') {
      const items = currentRung.check.sortItems;
      if (!items || items.length === 0) return false;
      return items.every((item) => sortMatches[item.id] === item.targetLabel);
    }
    return false;
  }, [currentRung, isQuestionCorrect, isTaskDone, sortMatches]);

  // Advance to next rung or complete concept
  const handleContinue = useCallback(() => {
    if (!isPrimaryReady) return;

    if (rungIdx < currentConcept.rungs.length - 1) {
      setRungIdx((prev) => prev + 1);
    } else {
      markConceptComplete(currentConcept.id);
      if (conceptIdx < ALL_DAY3_CONCEPTS.length - 1) {
        setConceptIdx((prev) => prev + 1);
        setRungIdx(0);
      } else {
        markModuleComplete('net-03');
        setPageMode('complete');
        onComplete?.();
      }
    }
  }, [
    isPrimaryReady,
    rungIdx,
    conceptIdx,
    currentConcept.rungs.length,
    currentConcept.id,
    markConceptComplete,
    markModuleComplete,
    onComplete,
  ]);

  // Step back navigation
  const handleBack = useCallback(() => {
    if (rungIdx > 0) {
      setRungIdx((prev) => prev - 1);
    } else if (conceptIdx > 0) {
      setConceptIdx((prev) => prev - 1);
      const prevConcept = ALL_DAY3_CONCEPTS[conceptIdx - 1];
      setRungIdx(prevConcept.rungs.length - 1);
    } else {
      setPageMode('welcome');
    }
  }, [rungIdx, conceptIdx]);

  // Handle MCQ selection
  const handleSelectOption = useCallback(
    (optionId: string) => {
      setSelectedOptionId(optionId);
      const opt = currentRung.check.options?.find((o) => o.id === optionId);
      if (opt) {
        setIsQuestionCorrect(opt.isCorrect);
        if (opt.isCorrect) setIsTaskDone(true);
      }
    },
    [currentRung.check.options]
  );

  // Global Keyboard Shortcuts Accelerator (Heuristics 3 & 7)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (pageMode !== 'normal') return;

      if (e.key === 'Escape') {
        if (isShortcutsOpen) { setIsShortcutsOpen(false); return; }
        if (isRoutingTableModalOpen) { setIsRoutingTableModalOpen(false); return; }
        if (isRouterArpModalOpen) { setIsRouterArpModalOpen(false); return; }
        if (activeLookInsideId) { setActiveLookInsideId(null); return; }
        if (isWordsDrawerOpen) { setIsWordsDrawerOpen(false); return; }
      }

      // Do not trigger letter/number hotkeys if user is focused inside an input/textarea
      const target = e.target as HTMLElement | null;
      const tagName = target?.tagName?.toLowerCase();
      if (tagName === 'input' || tagName === 'textarea' || target?.isContentEditable) {
        return;
      }

      if (e.key === 'Enter') {
        if (isPrimaryReady) {
          e.preventDefault();
          handleContinue();
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'Backspace') {
        e.preventDefault();
        handleBack();
      } else if (e.key === 'ArrowRight') {
        if (isPrimaryReady) {
          e.preventDefault();
          handleContinue();
        }
      } else if (e.key === '1' || e.key === '2' || e.key === '3') {
        const idx = parseInt(e.key, 10) - 1;
        if (currentRung.check.options && currentRung.check.options[idx]) {
          e.preventDefault();
          handleSelectOption(currentRung.check.options[idx].id);
        }
      } else if (e.key.toLowerCase() === 'w') {
        e.preventDefault();
        setIsWordsDrawerOpen((prev) => !prev);
      } else if (e.key.toLowerCase() === 'h') {
        if (currentRung.hints && currentRung.hints.length > 0) {
          e.preventDefault();
          setHintLevel((prev) => (prev < currentRung.hints!.length ? prev + 1 : 1));
        }
      } else if (e.key === '?') {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
      } else if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        handleResetRung();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    pageMode,
    isPrimaryReady,
    isShortcutsOpen,
    isRoutingTableModalOpen,
    isRouterArpModalOpen,
    activeLookInsideId,
    isWordsDrawerOpen,
    currentRung,
    handleContinue,
    handleBack,
    handleSelectOption,
    handleResetRung,
  ]);

  // Unlocked vocabulary words
  const unlockedWords = useMemo(() => {
    return Object.values(DAY3_VOCABULARY);
  }, []);

  return (
    <div className="w-full min-h-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans select-none">
      {/* ========================================================================= */}
      {/* WELCOME / INTRO PAGE (STATE_E)                                            */}
      {/* ========================================================================= */}
      {pageMode === 'welcome' ? (
        <div className="flex-1 flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="max-w-xl w-full p-8 rounded-3xl bg-[#121216] border border-white/10 shadow-2xl space-y-6 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Network className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-xs uppercase font-mono tracking-widest text-blue-400 font-bold">
                Day 3: The Outside World
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                The Router & The Default Gateway
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-md mx-auto">
                On Day 1, you wired two machines together. On Day 2, you mastered local switches and ARP.
                Now, discover how packets leave their local street and cross into other networks.
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setPageMode('normal')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-lg active:scale-95 flex items-center justify-center gap-2"
              >
                <span>Enter Lesson Workbench</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={backToRoadmap}
                className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 text-xs font-semibold transition-all cursor-pointer"
              >
                Back to Curriculum Map
              </button>
            </div>
          </div>
        </div>
      ) : pageMode === 'complete' ? (
        /* ========================================================================= */
        /* COMPLETION SCREEN (STATE_E)                                               */
        /* ========================================================================= */
        <div className="flex-1 flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="max-w-xl w-full p-8 rounded-3xl bg-[#121216] border border-white/10 shadow-2xl space-y-6 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-xs uppercase font-mono tracking-widest text-emerald-400 font-bold">
                Module 3 Complete
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                You Conquered Routing!
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-md mx-auto">
                You understand how routers connect different streets, why default gateways are essential,
                and how IP packets endure while MAC addresses rewrite at every hop.
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={backToRoadmap}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-lg active:scale-95"
              >
                Return to Curriculum Map
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* NORMAL LESSON WORKBENCH SHELL                                             */
        /* ========================================================================= */
        <div className="flex-1 flex flex-col p-3 sm:p-5 gap-3 sm:gap-4 max-w-[1680px] w-full mx-auto">
          {/* Top Bar Header */}
          <header className="rounded-2xl bg-[#121214] border border-white/[0.08] px-5 py-3 flex items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-sm tracking-tight text-white">Day 3</span>
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

            {/* My Words & Shortcuts Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsShortcutsOpen(true)}
                title="Keyboard Shortcuts (?)"
                className="p-1.5 rounded-xl bg-[#1c1c1f] hover:bg-[#25252a] border border-white/[0.08] text-zinc-400 hover:text-white transition-all cursor-pointer shadow-sm active:scale-[0.98]"
              >
                <Keyboard className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setIsWordsDrawerOpen((prev) => !prev)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1c1c1f] hover:bg-[#25252a] border border-white/[0.08] text-xs font-medium text-zinc-200 hover:text-white transition-all cursor-pointer shadow-sm active:scale-[0.98]"
              >
                <BookOpen className="w-3.5 h-3.5 text-zinc-300" />
                <span>My Words</span>
                <span className="px-1.5 py-0.5 rounded-md bg-zinc-900 border border-white/10 text-[10px] font-mono text-zinc-300">
                  {unlockedWords.length}
                </span>
                <kbd className="text-[10px] font-mono px-1 py-0.2 rounded bg-zinc-800/80 text-zinc-400 ml-0.5 border border-white/10 hidden sm:inline">
                  W
                </kbd>
              </button>
            </div>
          </header>

          {/* ========================================================================= */}
          {/* CONCEPT 4: 5-STEP GATEWAY TRIAGE STRIP (Concept 4 only)                   */}
          {/* ========================================================================= */}
          {conceptIdx === 3 && (
            <div className="w-full px-5 py-2.5 rounded-2xl bg-[#121214] border border-white/[0.08] flex items-center justify-between text-xs font-mono shadow-md overflow-x-auto">
              <div className="flex items-center gap-2.5 shrink-0">
                <span className="text-zinc-500 font-semibold uppercase text-[11px] tracking-wider">Gateway Triage:</span>

                <button
                  type="button"
                  onClick={() => setTriageCableChecked(true)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs transition-all cursor-pointer ${
                    triageCableChecked
                      ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-300 shadow-sm'
                      : 'bg-[#1c1c1f] border-white/[0.06] text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <span>① Link lights on?</span>
                  {triageCableChecked && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                </button>

                <button
                  type="button"
                  onClick={() => setTriageLocalIpChecked(true)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs transition-all cursor-pointer ${
                    triageLocalIpChecked
                      ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-300 shadow-sm'
                      : 'bg-[#1c1c1f] border-white/[0.06] text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <span>② Local IP valid?</span>
                  {triageLocalIpChecked && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                </button>

                <button
                  type="button"
                  onClick={() => setTriageGatewayIpChecked(true)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs transition-all cursor-pointer ${
                    triageGatewayIpChecked
                      ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-300 shadow-sm'
                      : 'bg-[#1c1c1f] border-white/[0.06] text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <span>③ Gateway IP set?</span>
                  {triageGatewayIpChecked && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                </button>

                <button
                  type="button"
                  onClick={() => setTriageGatewayPingChecked(true)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs transition-all cursor-pointer ${
                    triageGatewayPingChecked
                      ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-300 shadow-sm'
                      : 'bg-[#1c1c1f] border-white/[0.06] text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <span>④ Ping Gateway?</span>
                  {triageGatewayPingChecked && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                </button>

                <button
                  type="button"
                  onClick={() => setTriageTargetPingChecked(true)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs transition-all cursor-pointer ${
                    triageTargetPingChecked
                      ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-300 shadow-sm'
                      : 'bg-[#1c1c1f] border-white/[0.06] text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <span>⑤ Ping Destination?</span>
                  {triageTargetPingChecked && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* MAIN 62% STAGE / 38% COCKPIT SPLIT WORKBENCH                              */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-[500px]">
            {/* Left 62% Stage Visualizer */}
            <div className="lg:col-span-7 flex flex-col rounded-2xl bg-[#0e0e11] border border-white/[0.08] overflow-hidden shadow-2xl">
              <PhysicalRouterCanvas
                stageState={effectiveStageState}
                onInspectRoutingTable={() => setIsRoutingTableModalOpen(true)}
                onInspectRouterArp={() => setIsRouterArpModalOpen(true)}
                onPlugRouterCables={() => {
                  setManualCables((prev) => ({ ...prev, routerEth0: true, routerEth1: true }));
                  if (currentRung.id === 'c2-r2') setIsTaskDone(true);
                }}
                onReplay={() => {
                  setIsTaskDone(false);
                }}
              />
            </div>

            {/* Right 38% Cockpit Action Card */}
            <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl bg-[#121214] border border-white/[0.08] p-5 sm:p-6 shadow-2xl">
              <div className="space-y-4">
                {/* Step Header */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-zinc-500 font-mono">
                    <span className="uppercase tracking-wider font-normal">
                      Concept {currentConcept.number} • Step {currentRung.rungNumber} of {currentConcept.rungs.length}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-[#18181b] border border-white/[0.06] text-zinc-400 text-[11px] font-mono">
                      {currentRung.timeEstimate}
                    </span>
                  </div>
                  <h2 className="text-base sm:text-[17px] font-medium text-zinc-100 tracking-tight">
                    {currentRung.title}
                  </h2>
                </div>

                {/* Look Line */}
                {currentRung.look && (
                  <div className="text-xs sm:text-[13px] text-zinc-400 leading-relaxed bg-[#18181b]/50 border-l-2 border-zinc-600 pl-3 py-1.5 rounded-r-xl flex items-start gap-2">
                    <span className="text-zinc-500 font-mono uppercase text-[10px] tracking-wider font-medium shrink-0 mt-0.5">
                      Look:
                    </span>
                    <span className="font-normal">{currentRung.look}</span>
                  </div>
                )}

                {/* Structured Story Content */}
                <StructuredStoryContent
                  story={currentRung.story}
                  meaningText={currentRung.meaningText}
                  isTaskDone={isTaskDone}
                />

                {/* Plug Router Cables Action Card (c2-r2) */}
                {currentRung.id === 'c2-r2' && (
                  <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-white/10 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-semibold text-zinc-100 flex items-center gap-1.5">
                        <Network className="w-3.5 h-3.5 text-blue-400" />
                        <span>Router Physical Patch Cables</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 font-normal">
                        {isTaskDone
                          ? '✓ Cables connected! Both port link LEDs are glowing green.'
                          : 'Port 1 and Port 2 are currently unplugged.'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setManualCables((prev) => ({ ...prev, routerEth0: true, routerEth1: true }));
                        setIsTaskDone(true);
                      }}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                        isTaskDone
                          ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
                          : 'bg-white hover:bg-zinc-200 text-zinc-950 shadow-sm active:scale-95'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isTaskDone ? 'Plugged' : 'Plug Router Cables'}</span>
                    </button>
                  </div>
                )}

                {/* Gateway Input Editor Strip (c2-r3, c4-r1, c4-r2) */}
                {(currentRung.id === 'c2-r3' || currentRung.id === 'c4-r1' || currentRung.id === 'c4-r2') && (
                  <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-zinc-200">
                      <span>Computer A: Default Gateway Editor</span>
                      <span className="text-[10px] font-mono text-zinc-500">Street 192.168.1</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={customGatewayA}
                        onChange={(e) => setCustomGatewayA(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            if (customGatewayA.trim() === '192.168.1.1') {
                              setIsTaskDone(true);
                            }
                          }
                        }}
                        placeholder="e.g. 192.168.1.1"
                        className="flex-1 px-3 py-1.5 rounded-lg bg-zinc-950 border border-white/15 text-xs font-mono text-zinc-100 outline-none focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (customGatewayA.trim() === '192.168.1.1') {
                            setIsTaskDone(true);
                          }
                        }}
                        className={`px-3.5 py-1.5 rounded-lg font-semibold text-xs transition-all cursor-pointer shadow-sm active:scale-95 flex items-center gap-1.5 ${
                          isTaskDone && customGatewayA.trim() === '192.168.1.1'
                            ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
                            : 'bg-blue-600 hover:bg-blue-500 text-white'
                        }`}
                      >
                        {isTaskDone && customGatewayA.trim() === '192.168.1.1' ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Saved</span>
                          </>
                        ) : (
                          <span>Save Gateway</span>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Re-plug Loose Cable 2 Button (Ticket 3) */}
                {currentRung.id === 'c4-r3' && (
                  <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 flex items-center justify-between">
                    <div className="text-xs text-amber-200">
                      <span className="font-semibold">Router Port 2 Cable:</span> Loose under desk
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setManualCables((prev) => ({ ...prev, routerEth1: true }));
                        setIsTaskDone(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs cursor-pointer shadow-sm active:scale-95"
                    >
                      Re-plug Cable 2
                    </button>
                  </div>
                )}

                {/* Multiple Choice Question / Interactive Checks */}
                {currentRung.check.options && (
                  <div className="space-y-2 pt-2">
                    <div className="text-xs font-semibold text-zinc-200">
                      {currentRung.check.question}
                    </div>

                    <div className="space-y-2">
                      {currentRung.check.options.map((opt, idx) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleSelectOption(opt.id)}
                          className={`w-full text-left p-3 rounded-xl border text-xs transition-all cursor-pointer flex items-start gap-2.5 ${
                            selectedOptionId === opt.id
                              ? opt.isCorrect
                                ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-200 shadow-md ring-1 ring-emerald-500/30'
                                : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                              : 'bg-[#18181b]/70 border-white/[0.06] text-zinc-300 hover:bg-[#202024] hover:text-white'
                          }`}
                        >
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-white/10 shrink-0">
                            [ {idx + 1} ]
                          </span>
                          <div className="space-y-1 flex-1">
                            <div>{opt.label}</div>
                            {selectedOptionId === opt.id && (
                              <div
                                className={`text-[11px] leading-relaxed mt-1.5 pt-1.5 border-t ${
                                  opt.isCorrect
                                    ? 'border-emerald-500/20 text-emerald-300'
                                    : 'border-amber-500/20 text-amber-300'
                                }`}
                              >
                                {opt.feedback}
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sort Check (C3-R5) */}
                {currentRung.check.type === 'sort' && currentRung.check.sortItems && (
                  <div className="space-y-3 pt-2">
                    <div className="text-xs font-semibold text-zinc-200">
                      Assign each item to its correct category:
                    </div>

                    <div className="space-y-2">
                      {currentRung.check.sortItems.map((item) => (
                        <div
                          key={item.id}
                          className="p-3 rounded-xl bg-zinc-900/90 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                        >
                          <span className="text-xs text-zinc-200">{item.snippet}</span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {currentRung.check.sortLabels?.map((label) => (
                              <button
                                key={label}
                                type="button"
                                onClick={() => {
                                  setSortMatches((prev) => ({ ...prev, [item.id]: label }));
                                }}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold transition-all cursor-pointer ${
                                  sortMatches[item.id] === label
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400'
                                }`}
                              >
                                {label}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Terminal Simulator */}
                {(currentRung.layoutState === 'STATE_B' ||
                  currentRung.layoutState === 'STATE_D' ||
                  currentRung.check.type === 'task' ||
                  currentRung.check.type === 'diagnose') && (
                  <div className="pt-2">
                    <Day3GuidedTerminal
                      expectedCommand={currentRung.check.expectedCommand || 'ping 192.168.2.20'}
                      stageState={effectiveStageState}
                      currentRungId={currentRung.id}
                      suggestedChips={
                        currentRung.id === 'c1-r2'
                          ? ['ping 192.168.2.20']
                          : currentRung.id === 'c1-r4'
                          ? ['arp -a']
                          : currentRung.id === 'c2-r4'
                          ? ['ping 192.168.1.1']
                          : currentRung.id === 'c2-r6'
                          ? ['arp -a']
                          : currentRung.id === 'c3-r2'
                          ? ['ping 192.168.2.20']
                          : currentRung.id === 'c3-r3'
                          ? ['tracert 192.168.2.20']
                          : currentRung.id === 'c4-r1' || currentRung.id === 'c4-r2' || currentRung.id === 'c4-r3'
                          ? ['ping 192.168.2.20', 'ping 192.168.1.1', 'arp -a']
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
                          if (outcome === 'reply') {
                            setIsTaskDone(true);
                          }
                        }
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Progressive Hint Box (Heuristic 10) */}
              <ProgressiveHintBox
                hints={currentRung.hints}
                hintLevel={hintLevel}
                onNextHint={() => setHintLevel((prev) => (prev < currentRung.hints.length ? prev + 1 : prev))}
                onClose={() => setHintLevel(0)}
              />

              {/* Fixed Action Button Row */}
              <div className="pt-4 sm:pt-5 border-t border-white/[0.08] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-3.5 sm:px-4 py-2.5 rounded-xl bg-[#1c1c1f] hover:bg-[#26262a] border border-white/[0.08] text-xs font-medium text-zinc-300 hover:text-white transition-all cursor-pointer shadow-sm flex items-center gap-1.5 active:scale-[0.98]"
                  >
                    <span>Back</span>
                    <span className="text-[10px] font-mono text-zinc-500 hidden sm:inline">←</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetRung}
                    title="Reset step (R)"
                    className="px-3 py-2.5 rounded-xl bg-[#1c1c1f] hover:bg-[#26262a] border border-white/[0.08] text-zinc-400 hover:text-white transition-all cursor-pointer shadow-sm active:scale-[0.98] flex items-center gap-1.5 text-xs font-medium"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Reset</span>
                  </button>
                </div>

                {/* Hint Trigger */}
                {hintLevel === 0 && currentRung.hints && (
                  <button
                    type="button"
                    onClick={() => setHintLevel(1)}
                    className="text-xs text-zinc-400 hover:text-zinc-200 underline cursor-pointer transition-colors flex items-center gap-1"
                  >
                    <span>Need a hint?</span>
                    <kbd className="text-[9px] font-mono px-1 py-0.2 rounded bg-zinc-800 text-zinc-400 border border-white/10 hidden sm:inline">
                      H
                    </kbd>
                  </button>
                )}

                <button
                  type="button"
                  disabled={!isPrimaryReady}
                  onClick={handleContinue}
                  className={`px-6 sm:px-7 py-2.5 sm:py-3 rounded-xl font-medium text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 ${
                    isPrimaryReady
                      ? 'bg-black hover:bg-zinc-900 text-white border border-white/20 hover:border-white/40 shadow-lg shadow-black/60 ring-1 ring-white/10 active:scale-[0.98]'
                      : 'bg-zinc-900/60 text-zinc-500 cursor-not-allowed border border-white/[0.04]'
                  }`}
                >
                  <span>
                    {rungIdx === currentConcept.rungs.length - 1
                      ? 'Finish this concept'
                      : isPrimaryReady
                      ? 'Continue'
                      : currentRung.lockMessage}
                  </span>
                  {isPrimaryReady && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/20 text-white hidden sm:inline">
                      ↵ Enter
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS & DRAWERS: ROUTING TABLE, ROUTER ARP, LOOK INSIDE, MY WORDS        */}
      {/* ========================================================================= */}

      {/* Routing Table Inspection Modal */}
      {isRoutingTableModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-zinc-950 border border-zinc-800 p-6 space-y-4 shadow-2xl text-zinc-200">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Network className="w-4 h-4 text-blue-400" />
                <h3 className="font-bold text-sm">Router Routing Table</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsRoutingTableModalOpen(false)}
                className="p-1 rounded-md hover:bg-zinc-800 text-zinc-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-x-auto text-xs font-mono">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-zinc-500 border-b border-zinc-800">
                    <th className="py-2">Destination Network</th>
                    <th className="py-2">Next Hop</th>
                    <th className="py-2">Interface</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  <tr>
                    <td className="py-2 text-emerald-400 font-bold">192.168.1.0</td>
                    <td className="py-2 text-zinc-300">Directly Connected</td>
                    <td className="py-2 text-zinc-300 font-bold">eth0 (Port 1)</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-amber-400 font-bold">192.168.2.0</td>
                    <td className="py-2 text-zinc-300">Directly Connected</td>
                    <td className="py-2 text-zinc-300 font-bold">eth1 (Port 2)</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <button
              type="button"
              onClick={() => setIsRoutingTableModalOpen(false)}
              className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 rounded-xl text-xs font-semibold text-zinc-300 transition-colors cursor-pointer border border-zinc-700"
            >
              Close (Esc)
            </button>
          </div>
        </div>
      )}

      {/* Router ARP Table Modal */}
      {isRouterArpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-zinc-950 border border-zinc-800 p-6 space-y-4 shadow-2xl text-zinc-200">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-blue-400" />
                <h3 className="font-bold text-sm">Router ARP Cache (Dual Interfaces)</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsRouterArpModalOpen(false)}
                className="p-1 rounded-md hover:bg-zinc-800 text-zinc-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-x-auto text-xs font-mono">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-zinc-500 border-b border-zinc-800">
                    <th className="py-2">IP Address</th>
                    <th className="py-2">MAC Hardware Name Tag</th>
                    <th className="py-2">Port</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  <tr>
                    <td className="py-2 text-emerald-400">192.168.1.10</td>
                    <td className="py-2 text-zinc-300">00-00-5e-00-53-01</td>
                    <td className="py-2 text-zinc-300 font-bold">eth0 (Port 1)</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-amber-400">192.168.2.20</td>
                    <td className="py-2 text-zinc-300">00-00-5e-00-53-02</td>
                    <td className="py-2 text-zinc-300 font-bold">eth1 (Port 2)</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <button
              type="button"
              onClick={() => setIsRouterArpModalOpen(false)}
              className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 rounded-xl text-xs font-semibold text-zinc-300 transition-colors cursor-pointer border border-zinc-700"
            >
              Close (Esc)
            </button>
          </div>
        </div>
      )}

      {/* Look Inside Modal Dialog */}
      {activeLookInsideId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-zinc-950 border border-zinc-800 p-6 space-y-4 shadow-2xl text-zinc-200">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-blue-400" />
                <h3 className="font-bold text-sm">
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

      {/* Searchable My Words Drawer */}
      {isWordsDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md h-full bg-zinc-950 border-l border-zinc-800 p-5 sm:p-6 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-400" />
                  <h3 className="font-bold text-base text-white">My Words (Day 3)</h3>
                  <span className="text-[11px] font-mono text-zinc-500">({unlockedWords.length})</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsWordsDrawerOpen(false)}
                  className="p-1 rounded-md hover:bg-zinc-800 text-zinc-400 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Search Filter */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={wordsSearchQuery}
                  onChange={(e) => setWordsSearchQuery(e.target.value)}
                  placeholder="Search vocabulary..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 outline-none focus:border-blue-500/50 placeholder:text-zinc-500 font-sans"
                />
              </div>

              <div className="space-y-2.5">
                {unlockedWords
                  .filter(
                    (term) =>
                      term.term.toLowerCase().includes(wordsSearchQuery.toLowerCase()) ||
                      term.tooltip.toLowerCase().includes(wordsSearchQuery.toLowerCase())
                  )
                  .map((term) => (
                    <div
                      key={term.term}
                      className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800/80 space-y-1"
                    >
                      <span className="font-mono text-xs font-bold text-blue-300 uppercase">
                        {term.term}
                      </span>
                      <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                        {term.tooltip}
                      </p>
                    </div>
                  ))}
                {unlockedWords.filter(
                  (term) =>
                    term.term.toLowerCase().includes(wordsSearchQuery.toLowerCase()) ||
                    term.tooltip.toLowerCase().includes(wordsSearchQuery.toLowerCase())
                ).length === 0 && (
                  <div className="text-center py-6 text-xs text-zinc-500 font-mono">
                    No matching vocabulary found.
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setIsWordsDrawerOpen(false)}
                className="w-full py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-semibold text-zinc-300 transition-colors cursor-pointer"
              >
                Close (Esc)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
};
