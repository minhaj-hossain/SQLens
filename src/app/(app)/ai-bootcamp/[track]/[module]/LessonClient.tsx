"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import { LessonStep } from "@/lib/ai-parser";

const PyodideEditor = dynamic(() => import("@/components/ai-sandbox/PyodideEditor"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-[#09090b] text-zinc-500 font-mono text-xs border border-white/10 rounded-xl">
      Initializing Python Engine...
    </div>
  ),
});

export default function LessonClient({ steps }: { steps: LessonStep[] }) {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  // Persist code written by user across step navigation
  const [userCodes, setUserCodes] = useState<Record<number, string>>({});
  const [passedSteps, setPassedSteps] = useState<Record<number, boolean>>({});

  if (!steps || steps.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09090b] text-zinc-500 font-mono text-sm">
        No lesson steps found.
      </div>
    );
  }

  const currentStep = steps[activeStepIndex];

  // Helper to find the concept step preceding a task
  const getPrecedingConcept = (index: number) => {
    for (let i = index - 1; i >= 0; i--) {
      if (steps[i].type === "concept") return { index: i, step: steps[i] };
    }
    return null;
  };

  const precedingConcept = currentStep.type === "task" ? getPrecedingConcept(activeStepIndex) : null;

  const handleCodeChange = (code: string) => {
    setUserCodes((prev) => ({
      ...prev,
      [activeStepIndex]: code,
    }));
  };

  const handleTestPass = () => {
    setPassedSteps((prev) => ({
      ...prev,
      [activeStepIndex]: true,
    }));
  };

  const goNext = () => {
    if (activeStepIndex < steps.length - 1) {
      setActiveStepIndex((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goPrev = () => {
    if (activeStepIndex > 0) {
      setActiveStepIndex((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const jumpToStep = (index: number) => {
    setActiveStepIndex(index);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans selection:bg-[#f4c430]/20 selection:text-[#f4c430]">
      {/* ── CLEAN TOP NAVBAR (NO PILL STEPPER) ── */}
      <header className="sticky top-0 z-50 bg-[#121215] border-b border-white/10 px-4 sm:px-6 py-3">
        <div className="max-w-[1700px] mx-auto flex items-center justify-between gap-4">
          {/* Track & Module Breadcrumb */}
          <div className="flex items-center space-x-2.5 font-mono text-xs">
            <span className="text-zinc-500 uppercase tracking-widest text-[11px]">AI BOOTCAMP</span>
            <span className="text-zinc-600">/</span>
            <span className="text-zinc-400 font-medium">TRACK 0</span>
            <span className="text-zinc-600">/</span>
            <span className="text-zinc-200 font-medium">MODULE 01</span>
          </div>

          {/* Right Status & Step Navigation */}
          <div className="flex items-center space-x-4">
            <div className="text-xs font-mono text-zinc-400">
              <span className="text-zinc-500 uppercase tracking-wider text-[11px] mr-1.5">
                {currentStep.type === "concept" ? "Concept" : "Task"}
              </span>
              <span className="text-zinc-200 font-medium">
                {activeStepIndex + 1}
              </span>
              <span className="text-zinc-600 mx-1">/</span>
              <span className="text-zinc-500">{steps.length}</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={goPrev}
                disabled={activeStepIndex === 0}
                className="px-3 py-1.5 text-xs font-mono font-medium text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={goNext}
                disabled={activeStepIndex === steps.length - 1}
                className="px-4 py-1.5 text-xs font-mono font-bold bg-[#f4c430] hover:brightness-110 text-[#09090b] rounded disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1"
              >
                <span>{activeStepIndex === steps.length - 1 ? "Finish" : "Next"}</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT AREA ── */}
      <main className="flex-grow flex flex-col">
        {currentStep.type === "concept" ? (
          /* ========================================================================= */
          /* 1. CONCEPT FULL-PAGE READER MODE                                         */
          /* ========================================================================= */
          <div className="flex-grow flex flex-col items-center justify-between p-6 sm:p-12 max-w-4xl mx-auto w-full">
            <div className="w-full">
              {/* Concept Banner Header */}
              <div className="mb-8 border-b border-white/10 pb-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-zinc-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded">
                    Concept • Step {activeStepIndex + 1} of {steps.length}
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
                  {currentStep.title}
                </h1>
              </div>

              {/* Formatted Markdown Content */}
              <article className="prose prose-invert max-w-none prose-headings:text-zinc-100 prose-headings:font-bold prose-headings:border-b prose-headings:border-white/10 prose-headings:pb-2 prose-p:text-zinc-300 prose-p:leading-relaxed prose-strong:text-white prose-code:text-[#f4c430] prose-code:bg-white/5 prose-code:border prose-code:border-white/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-[#121215] prose-pre:border prose-pre:border-white/10 prose-pre:rounded-xl prose-pre:p-4 prose-hr:border-white/10 mb-12">
                <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                  {currentStep.contentMd}
                </ReactMarkdown>
              </article>
            </div>

            {/* Bottom Next CTA Card */}
            <div className="w-full mt-8 p-6 bg-[#121215] border border-white/10 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-semibold text-zinc-200">Finished reading the concept?</h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Put what you learned into practice with the interactive coding challenge.
                </p>
              </div>
              <button
                onClick={goNext}
                className="w-full sm:w-auto px-5 py-2.5 bg-[#f4c430] hover:brightness-110 text-[#09090b] font-mono text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 group active:scale-95"
              >
                <span>Start Interactive Task</span>
                <span className="group-hover:translate-x-0.5 transition-transform">→</span>
              </button>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* 2. TASK INTERACTIVE WORKBENCH MODE (SPLIT SCREEN)                         */
          /* ========================================================================= */
          <div className="flex-grow flex flex-col lg:flex-row h-[calc(100vh-57px)] w-full overflow-hidden">
            {/* Left Column: Instructions (38% width) */}
            <div className="w-full lg:w-[38%] flex flex-col bg-[#121215] border-r border-white/10 overflow-y-auto">
              <div className="p-6 sm:p-8 flex-grow space-y-6">
                {/* Step badge */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-zinc-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded">
                    Task • Step {activeStepIndex + 1} of {steps.length}
                  </span>

                  {precedingConcept && (
                    <button
                      onClick={() => jumpToStep(precedingConcept.index)}
                      className="text-xs font-mono text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
                    >
                      <span>← Review Concept</span>
                    </button>
                  )}
                </div>

                {/* Task Title */}
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">
                    {currentStep.title}
                  </h2>
                </div>

                {/* Instructions Box */}
                <div className="bg-[#18181c] border border-white/10 rounded-xl p-5 space-y-3">
                  <div className="text-[11px] font-mono font-semibold uppercase tracking-widest text-zinc-400 border-b border-white/10 pb-2">
                    Instructions
                  </div>
                  <div className="prose prose-invert prose-sm text-zinc-300 leading-relaxed prose-code:text-[#f4c430] prose-code:bg-white/5 prose-code:px-1 prose-code:rounded">
                    <ReactMarkdown>{currentStep.instructionsMd}</ReactMarkdown>
                  </div>
                </div>

                {/* Note */}
                <div className="bg-white/[0.02] border border-white/10 rounded-xl p-4 text-xs text-zinc-400 space-y-1">
                  <span className="font-mono text-zinc-300 block text-[11px] uppercase tracking-wider">How to submit</span>
                  <p className="leading-relaxed">
                    Write your Python solution in the editor on the right, then click <strong className="text-zinc-200">&quot;Run & Test&quot;</strong>. The sandbox runs Pyodide in-browser and verifies your solution.
                  </p>
                </div>
              </div>

              {/* Task Footer Navigation */}
              <div className="p-4 bg-[#09090b] border-t border-white/10 flex items-center justify-between">
                <button
                  onClick={goPrev}
                  className="px-3.5 py-2 text-xs font-mono font-medium text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded transition-colors"
                >
                  ← {precedingConcept ? "Back to Concept" : "Previous"}
                </button>

                <button
                  onClick={goNext}
                  disabled={activeStepIndex === steps.length - 1}
                  className={`px-4 py-2 text-xs font-mono font-bold rounded transition-all flex items-center gap-1.5 ${
                    passedSteps[activeStepIndex]
                      ? "bg-[#f4c430] hover:brightness-110 text-[#09090b]"
                      : "bg-white/10 hover:bg-white/15 text-zinc-200 border border-white/10"
                  }`}
                >
                  <span>{activeStepIndex === steps.length - 1 ? "Finish Module" : "Next Step"}</span>
                  <span>→</span>
                </button>
              </div>
            </div>

            {/* Right Column: Editor & Console Sandbox (62% width) */}
            <div className="w-full lg:w-[62%] h-full p-3 sm:p-4 bg-[#09090b] flex flex-col overflow-hidden">
              <PyodideEditor
                key={`step-${activeStepIndex}`}
                initialCode={currentStep.initialCode}
                testCode={currentStep.testCode}
                value={userCodes[activeStepIndex] ?? currentStep.initialCode}
                onChange={handleCodeChange}
                onPass={handleTestPass}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
