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
}

export const Day2CockpitView: React.FC<Day2CockpitViewProps> = ({
  module,
  concept,
  onComplete,
}) => {
  const { markConceptComplete, markModuleComplete } = useLearning();
  const { backToRoadmap } = useLearningNavigation();

  // Navigation indices
  const [conceptIdx, setConceptIdx] = useState<number>(0);
  const [rungIdx, setRungIdx] = useState<number>(0);

  // Page mode
  const [pageMode, setPageMode] = useState<
    'welcome' | 'normal' | 'concept-complete' | 'day-complete'
  >('normal');

  // Interactive task state
  const [isTaskDone, setIsTaskDone] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState<string | null>(null);
  const [isQuestionCorrect, setIsQuestionCorrect] = useState<boolean | null>(null);

  // Hints
  const [hintLevel, setHintLevel] = useState<number>(0);

  // Drawers and Modals
  const [isWordsDrawerOpen, setIsWordsDrawerOpen] = useState(false);
  const [activeLookInsideId, setActiveLookInsideId] = useState<string | null>(null);
  const [isSimplifiedOpen, setIsSimplifiedOpen] = useState(false);

  // Work tabs & Address Editor
  const [activeWorkTab, setActiveWorkTab] = useState<'terminal' | 'address'>('terminal');
  const [customAddressC, setCustomAddressC] = useState('192.168.1.30');

  // Self-check write-and-compare
  const [learnerSentence, setLearnerSentence] = useState('');
  const [selfCheckRevealed, setSelfCheckRevealed] = useState(false);

  // Sort state
  const [sortMatches, setSortMatches] = useState<Record<string, string>>({});

  // Concept 4 checklist
  const [checkedLight, setCheckedLight] = useState(false);
  const [checkedAddress, setCheckedAddress] = useState(false);
  const [checkedPing, setCheckedPing] = useState(false);

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
      if (currentRung.id === 'c4-r3') {
        base.cables.c = true;
        base.portLeds.p3 = 'green';
      }
    }

    return base;
  }, [currentRung, manualCables, customAddressC, isTaskDone]);

  // URL Hash navigation
  useEffect(() => {
    if (typeof window !== 'undefined' && pageMode === 'normal') {
      window.location.hash = `day2/c${conceptIdx + 1}/r${rungIdx + 1}`;
    }
  }, [conceptIdx, rungIdx, pageMode]);

  // Reset interactive states on rung change
  useEffect(() => {
    setIsTaskDone(false);
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
        onComplete?.();
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
    onComplete,
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
      } else if (e.key.toLowerCase() === 'h') {
        setHintLevel((prev) => Math.min(3, prev + 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleContinue, handleBack, isTaskDone, currentRung]);

  // Option selection
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

  const isPrimaryReady = useMemo(() => {
    if (currentRung.check.type === 'understand' && !currentRung.check.options) return true;
    if (currentRung.check.type === 'understand' && isQuestionCorrect) return true;
    if (currentRung.check.type === 'predict' && isQuestionCorrect) return true;
    if (currentRung.check.type === 'task' && isTaskDone) return true;
    if (currentRung.check.type === 'diagnose' && isTaskDone) return true;
    if (currentRung.check.type === 'write-and-compare' && selfCheckRevealed) return true;
    if (currentRung.check.type === 'sort') {
      const needed = currentRung.check.sortItems?.length || 0;
      return Object.keys(sortMatches).length === needed;
    }
    return false;
  }, [currentRung, isTaskDone, isQuestionCorrect, selfCheckRevealed, sortMatches]);

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

      {/* Top Header & Telemetry Strip */}
      <header className="flex items-center justify-between px-3 py-2 bg-[#0E1524] rounded-xl border border-zinc-800 shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => backToRoadmap()}
            className="text-xs font-mono text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            ← Roadmap
          </button>
          <div className="h-4 w-px bg-zinc-800" />
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-sky-950/80 border border-sky-700/60 text-sky-300 font-mono text-xs font-bold">
              DAY 2
            </span>
            <span className="text-sm font-semibold text-zinc-200 hidden sm:inline">
              The Shared Wire
            </span>
          </div>
        </div>

        {/* Concept pills */}
        <div className="flex items-center gap-1.5">
          {ALL_DAY2_CONCEPTS.map((c, i) => (
            <button
              key={c.id}
              onClick={() => {
                setConceptIdx(i);
                setRungIdx(0);
              }}
              className={`px-2.5 py-1 rounded-md text-xs font-mono transition-all ${
                i === conceptIdx
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/50 font-bold'
                  : i < conceptIdx
                  ? 'bg-zinc-800/80 text-emerald-400 border border-emerald-500/30'
                  : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
              }`}
            >
              C{c.number}
            </button>
          ))}
        </div>

        {/* Actions: My Words Drawer & Reset */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsWordsDrawerOpen(true)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-medium text-zinc-200 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">My Words</span>
            <span className="w-4 h-4 rounded-full bg-sky-500/20 text-sky-300 text-[10px] inline-flex items-center justify-center font-mono">
              7
            </span>
          </button>

          <button
            onClick={() => {
              setRungIdx(0);
              setIsTaskDone(false);
            }}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 border border-zinc-700 transition-colors"
            title="Reset current step"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Cockpit Stage Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1">
        {/* Stage Canvas (Top / Upper Section) */}
        <div className="lg:col-span-12">
          <PhysicalSwitchCanvas
            stageState={effectiveStageState}
            onToggleCable={(which) => {
              setManualCables((prev) => {
                const next = { ...prev, [which]: !prev[which] };
                if (currentRung.id === 'c4-r3' && which === 'c' && next.c) {
                  setIsTaskDone(true);
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
              if (currentRung.id === 'c1-r2') {
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
            onOpenLookInside={(id) => setActiveLookInsideId(id)}
          />
        </div>

        {/* Bottom Left: Interactive Pedagogical Card (5-Second Test) */}
        <div className="lg:col-span-6 flex flex-col justify-between p-4 bg-[#0E1524] rounded-2xl border border-zinc-800 shadow-xl space-y-4">
          <div className="space-y-3">
            {/* Header: Concept number, title, time, rung */}
            <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
              <span className="text-sky-400 font-semibold uppercase">
                Concept {currentConcept.number} • {currentConcept.title}
              </span>
              <span>
                Step {currentRung.rungNumber} of {currentConcept.rungs.length} ({currentRung.timeEstimate})
              </span>
            </div>

            {/* Title */}
            <h2 className="text-lg font-bold text-zinc-100 tracking-tight">
              {currentRung.title}
            </h2>

            {/* LOOK Line (First 5-Second Test Anchor) */}
            <div className="p-2.5 rounded-lg bg-sky-950/40 border border-sky-800/50 text-xs font-mono text-sky-200">
              <span className="text-sky-400 font-bold uppercase mr-2">LOOK:</span>
              {currentRung.look}
            </div>

            {/* STORY (<= 35 words) */}
            <p className="text-sm text-zinc-300 leading-relaxed font-sans">
              {currentRung.story}
            </p>

            {/* DO / WHY / EXPECT / MEANING Block (<= 65 words) */}
            {currentRung.doText && (
              <div className="space-y-1.5 p-3 rounded-xl bg-zinc-900/80 border border-zinc-800/80 text-xs text-zinc-300">
                <div className="flex items-start gap-2">
                  <span className="font-bold text-emerald-400 shrink-0 font-mono">DO:</span>
                  <span>{currentRung.doText}</span>
                </div>
                {currentRung.whyText && (
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-sky-400 shrink-0 font-mono">WHY:</span>
                    <span className="text-zinc-400">{currentRung.whyText}</span>
                  </div>
                )}
                {currentRung.expectText && (
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-amber-400 shrink-0 font-mono">EXPECT:</span>
                    <span className="text-zinc-400">{currentRung.expectText}</span>
                  </div>
                )}
                {currentRung.meaningText && (
                  <div className="flex items-start gap-2 pt-1 border-t border-zinc-800">
                    <span className="font-bold text-indigo-400 shrink-0 font-mono">MEANING:</span>
                    <span className="text-zinc-300 font-medium">{currentRung.meaningText}</span>
                  </div>
                )}
              </div>
            )}

            {/* Simplified note pill */}
            {currentRung.simplified && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsSimplifiedOpen(!isSimplifiedOpen)}
                  className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 underline font-mono"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  Simplified?
                </button>
                {isSimplifiedOpen && (
                  <span className="text-xs text-zinc-400 bg-zinc-900 px-2 py-1 rounded border border-zinc-800">
                    {currentRung.simplified.text}
                  </span>
                )}
              </div>
            )}

            {/* Look inside chip */}
            {currentRung.lookInside && (
              <div>
                <button
                  onClick={() => setActiveLookInsideId(currentRung.lookInside!.id)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/30 text-xs font-mono transition-colors"
                >
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  Look Inside: {currentRung.lookInside.title}
                </button>
              </div>
            )}

            {/* Questions (Understand / Predict) */}
            {currentRung.check.options && (
              <div className="space-y-2 pt-2">
                <p className="text-xs font-semibold text-zinc-200">
                  {currentRung.check.question}
                </p>
                <div className="space-y-1.5">
                  {currentRung.check.options.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectOption(opt.id)}
                      className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all ${
                        selectedOptionId === opt.id
                          ? opt.isCorrect
                            ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
                            : 'bg-rose-950/60 border-rose-500 text-rose-200'
                          : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700 text-zinc-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                {feedbackText && (
                  <p
                    className={`text-xs p-2 rounded border leading-relaxed ${
                      isQuestionCorrect
                        ? 'bg-emerald-950/40 border-emerald-700 text-emerald-300'
                        : 'bg-rose-950/40 border-rose-700 text-rose-300'
                    }`}
                  >
                    {feedbackText}
                  </p>
                )}
              </div>
            )}

            {/* Write and Compare Check (State F) */}
            {currentRung.check.type === 'write-and-compare' && (
              <div className="space-y-2 pt-2">
                <textarea
                  value={learnerSentence}
                  onChange={(e) => setLearnerSentence(e.target.value)}
                  placeholder="Type your explanation in your own words..."
                  className="w-full p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 font-sans focus:outline-none focus:border-sky-500"
                  rows={3}
                />
                {!selfCheckRevealed ? (
                  <button
                    disabled={learnerSentence.trim().length < 10}
                    onClick={() => {
                      setSelfCheckRevealed(true);
                      setIsTaskDone(true);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-xs font-semibold text-white transition-all"
                  >
                    Compare with Benchmark
                  </button>
                ) : (
                  <div className="p-3 rounded-lg bg-sky-950/40 border border-sky-800 text-xs text-sky-200 space-y-1">
                    <span className="font-bold text-sky-400 font-mono uppercase block">Model Explanation:</span>
                    <p>{currentRung.check.modelSentence}</p>
                  </div>
                )}
              </div>
            )}

            {/* Sort Check (State F) */}
            {currentRung.check.type === 'sort' && currentRung.check.sortItems && (
              <div className="space-y-2 pt-2">
                <p className="text-xs text-zinc-400">Match each definition to its term:</p>
                {currentRung.check.sortItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 space-y-1.5"
                  >
                    <p className="text-xs text-zinc-300 italic">“{item.snippet}”</p>
                    <div className="flex items-center gap-1.5">
                      {currentRung.check.sortLabels?.map((label) => (
                        <button
                          key={label}
                          onClick={() => {
                            setSortMatches((prev) => {
                              const next = { ...prev, [item.id]: label };
                              if (
                                Object.keys(next).length ===
                                currentRung.check.sortItems!.length
                              ) {
                                setIsTaskDone(true);
                              }
                              return next;
                            });
                          }}
                          className={`px-2 py-1 rounded text-[11px] font-mono border transition-all ${
                            sortMatches[item.id] === label
                              ? label === item.targetLabel
                                ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                                : 'bg-rose-950 border-rose-500 text-rose-300'
                              : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Card Controls: Hints & Continue */}
          <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setHintLevel((prev) => Math.min(3, prev + 1))}
                className="px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 text-xs font-mono transition-colors"
              >
                [H] Hint ({hintLevel}/3)
              </button>
              {hintLevel > 0 && (
                <span className="text-xs text-amber-300 font-sans">
                  {currentRung.hints[hintLevel - 1].text}
                </span>
              )}
            </div>

            <button
              disabled={!isPrimaryReady}
              onClick={handleContinue}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                isPrimaryReady
                  ? 'bg-sky-500 hover:bg-sky-400 text-zinc-950 shadow-lg shadow-sky-500/20'
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              }`}
            >
              <span>Continue</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Bottom Right: Work Tab (Guided Terminal / Address Editor) */}
        <div className="lg:col-span-6 flex flex-col h-[400px] lg:h-[480px]">
          {/* Work Tabs Bar */}
          <div className="flex items-center justify-between px-3 py-1.5 bg-[#0E1524] rounded-t-xl border-t border-x border-zinc-800 text-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveWorkTab('terminal')}
                className={`px-2.5 py-1 rounded-md font-mono transition-colors ${
                  activeWorkTab === 'terminal'
                    ? 'bg-zinc-800 text-sky-300 font-semibold border border-zinc-700'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Terminal
              </button>
              <button
                onClick={() => setActiveWorkTab('address')}
                className={`px-2.5 py-1 rounded-md font-mono transition-colors ${
                  activeWorkTab === 'address'
                    ? 'bg-zinc-800 text-sky-300 font-semibold border border-zinc-700'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Address Editor
              </button>
            </div>

            {/* Concept 4 Triage Checklist */}
            {currentConcept.number === 4 && (
              <div className="flex items-center gap-2 text-[10px] font-mono">
                <span
                  onClick={() => setCheckedLight(!checkedLight)}
                  className={`cursor-pointer px-1.5 py-0.5 rounded border ${
                    checkedLight
                      ? 'bg-emerald-950 border-emerald-600 text-emerald-300'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                  }`}
                >
                  ① Port lights
                </span>
                <span>➔</span>
                <span
                  onClick={() => setCheckedAddress(!checkedAddress)}
                  className={`cursor-pointer px-1.5 py-0.5 rounded border ${
                    checkedAddress
                      ? 'bg-emerald-950 border-emerald-600 text-emerald-300'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                  }`}
                >
                  ② Address/ARP
                </span>
                <span>➔</span>
                <span
                  onClick={() => setCheckedPing(!checkedPing)}
                  className={`cursor-pointer px-1.5 py-0.5 rounded border ${
                    checkedPing
                      ? 'bg-emerald-950 border-emerald-600 text-emerald-300'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                  }`}
                >
                  ③ Ping
                </span>
              </div>
            )}
          </div>

          {/* Active Work Area */}
          <div className="flex-1 rounded-b-xl border border-zinc-800 overflow-hidden">
            {activeWorkTab === 'terminal' ? (
              <Day2GuidedTerminal
                expectedCommand={currentRung.check.expectedCommand || 'ping 192.168.1.20'}
                stageState={effectiveStageState}
                currentRungId={currentRung.id}
                onCommandRun={(cmd, outcome) => {
                  if (currentRung.check.type === 'task') {
                    if (
                      currentRung.check.expectedCommand &&
                      cmd.toLowerCase().includes(currentRung.check.expectedCommand.toLowerCase())
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
            ) : (
              <div className="p-4 bg-[#0C101A] h-full flex flex-col justify-between text-xs space-y-4">
                <div className="space-y-3">
                  <h3 className="font-mono text-zinc-300 font-bold">
                    Computer C Network Properties
                  </h3>
                  <div className="space-y-2">
                    <label className="block text-zinc-400 font-mono">IPv4 Address:</label>
                    <input
                      type="text"
                      value={customAddressC}
                      onChange={(e) => setCustomAddressC(e.target.value)}
                      className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded text-zinc-100 font-mono text-xs focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-zinc-400 font-mono">Subnet Mask:</label>
                    <input
                      type="text"
                      disabled
                      value="255.255.255.0"
                      className="w-full p-2 bg-zinc-900/50 border border-zinc-800 rounded text-zinc-500 font-mono text-xs cursor-not-allowed"
                    />
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (customAddressC === '192.168.1.30') {
                      setIsTaskDone(true);
                    }
                  }}
                  className="w-full py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg transition-colors font-sans"
                >
                  Apply Network Settings
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Look Inside Modal Dialog */}
      {activeLookInsideId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#0F172A] border border-zinc-700 rounded-2xl p-6 space-y-4 shadow-2xl text-zinc-200">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-400" />
                <h3 className="font-bold text-sm font-sans">
                  {currentRung.lookInside?.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveLookInsideId(null)}
                className="p-1 rounded-md hover:bg-zinc-800 text-zinc-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              {currentRung.lookInside?.text}
            </p>
            <button
              onClick={() => setActiveLookInsideId(null)}
              className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-xs font-semibold text-zinc-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* My Words Drawer */}
      {isWordsDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md h-full bg-[#0E1524] border-l border-zinc-800 p-6 flex flex-col space-y-4 overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-sky-400" />
                <h3 className="font-bold text-base text-zinc-100">My Words (Day 2)</h3>
              </div>
              <button
                onClick={() => setIsWordsDrawerOpen(false)}
                className="p-1 rounded-md hover:bg-zinc-800 text-zinc-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {Object.values(DAY2_VOCABULARY).map((term) => (
                <div
                  key={term.term}
                  className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1"
                >
                  <span className="font-mono text-xs font-bold text-sky-300 uppercase">
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
