'use client';

import React from 'react';
import { NetworkingStep } from '@/types/networking';
import { Check, ArrowLeft, ArrowRight } from 'lucide-react';

interface NetworkingLessonSidebarProps {
  steps: NetworkingStep[];
  activeStepIndex: number;
  setActiveStepIndex: (index: number) => void;
  completedSteps: Set<number>;
  onCodeClick: (cmd: string) => void;
}

export const NetworkingLessonSidebar: React.FC<NetworkingLessonSidebarProps> = ({
  steps,
  activeStepIndex,
  setActiveStepIndex,
  completedSteps,
  onCodeClick,
}) => {
  const currentStep = steps[activeStepIndex];
  if (!currentStep) return null;

  const isStepDone = completedSteps.has(activeStepIndex);

  return (
    <section
      id="lesson"
      className="flex flex-col bg-[#141416] border border-[#26262b] rounded-xl overflow-hidden min-h-0 h-full"
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between px-3.5 py-2 border-b border-[#26262b] bg-[#141416] text-[11px] font-mono uppercase tracking-wider text-[#9a9aa5]">
        <span>LESSON</span>
        <span id="cnt" className="text-[#ececf0] font-semibold">
          {activeStepIndex + 1} / {steps.length}
        </span>
      </div>

      {/* Progress Step Indicators */}
      <div className="flex gap-1.5 px-3.5 pt-2.5 pb-1">
        {steps.map((_, idx) => {
          const isDone = completedSteps.has(idx);
          const isActive = idx === activeStepIndex;

          return (
            <button
              key={idx}
              onClick={() => setActiveStepIndex(idx)}
              className={`flex-1 h-1.5 rounded-full transition-all duration-200 ${
                isActive
                  ? 'bg-[#60a5fa] ring-2 ring-[#60a5fa]/30'
                  : isDone
                  ? 'bg-[#4ade80]'
                  : 'bg-[#26262b] hover:bg-[#3f3f46]'
              }`}
              title={`Step ${idx + 1}`}
              aria-label={`Jump to step ${idx + 1}`}
            />
          );
        })}
      </div>

      {/* Step Body Content */}
      <div className="flex-1 overflow-y-auto px-4 py-3.5 space-y-3.5 text-[#ececf0] text-[15px] leading-relaxed select-text">
        {/* Step Group Tag */}
        <div className="text-[12px] font-mono text-[#9a9aa5] tracking-wide">
          {currentStep.group}
        </div>

        {/* Step Title */}
        <h2 className="text-[19px] font-bold text-[#ececf0] leading-snug m-0">
          {currentStep.title}
        </h2>

        {/* What is it / Big picture */}
        <div>
          <div className="text-[11px] font-semibold tracking-wider uppercase text-[#60a5fa] mb-1">
            {currentStep.cmd ? 'What is it?' : 'The big picture'}
          </div>
          <p className="text-[#ececf0]/90 text-[14.5px] leading-relaxed m-0">
            {currentStep.what}
          </p>
        </div>

        {/* Why does it matter + Canvas visual hint */}
        {currentStep.why && (
          <div>
            <div className="text-[11px] font-semibold tracking-wider uppercase text-[#60a5fa] mb-1">
              Why does it matter?
            </div>
            <p className="text-[#ececf0]/90 text-[14.5px] leading-relaxed mb-2.5">
              {currentStep.why}
            </p>

            {currentStep.pic && (
              <div className="border border-[#26262b] rounded-lg p-2.5 bg-[#4ade80]/[0.06] text-[13px] leading-normal text-[#ececf0]">
                <b className="text-[#4ade80]">On the canvas: </b>
                <span>{currentStep.pic}</span>
              </div>
            )}
          </div>
        )}

        {/* Your Turn (Interactive Prompt with clickable code chip) */}
        {currentStep.cmd ? (
          <div>
            <div className="text-[11px] font-semibold tracking-wider uppercase text-[#4ade80] mb-1">
              Your turn
            </div>
            <p className="text-[14px] leading-normal mb-3">
              {currentStep.task} Type{' '}
              <button
                type="button"
                onClick={() => onCodeClick(currentStep.cmd!)}
                className="inline-flex items-center gap-1 font-mono text-[13px] bg-[#050506] hover:bg-[#1a1a20] text-[#4ade80] px-2 py-0.5 rounded border border-[#26262b] hover:border-[#4ade80]/50 transition-colors cursor-pointer"
                title="Click to fill into terminal"
              >
                <span>{currentStep.cmd}</span>
              </button>{' '}
              <span className="text-[#9a9aa5] text-[13px]">
                (tap it to fill the terminal).
              </span>
            </p>

            {/* How to read the result table */}
            <div className="text-[11px] font-semibold tracking-wider uppercase text-[#60a5fa] mb-1.5">
              How to read the result
            </div>
            <div className="grid grid-cols-[minmax(0,46%)_1fr] gap-x-3 gap-y-1.5 text-[13px] border border-[#26262b] rounded-lg p-2.5 bg-[#0a0a0c]">
              {currentStep.read.map(([k, v], idx) => (
                <React.Fragment key={idx}>
                  <b className="font-mono text-[12.5px] font-medium text-[#4ade80] break-words">
                    {k}
                  </b>
                  <span className="text-[#9a9aa5]">{v}</span>
                </React.Fragment>
              ))}
            </div>
          </div>
        ) : (
          /* Recap Step */
          <div>
            <div className="text-[11px] font-semibold tracking-wider uppercase text-[#60a5fa] mb-1.5">
              The four questions
            </div>
            <div className="grid grid-cols-[minmax(0,46%)_1fr] gap-x-3 gap-y-1.5 text-[13px] border border-[#26262b] rounded-lg p-2.5 bg-[#0a0a0c] mb-3">
              {currentStep.read.map(([k, v], idx) => (
                <React.Fragment key={idx}>
                  <b className="font-mono text-[12.5px] font-medium text-[#4ade80] break-words">
                    {k}
                  </b>
                  <span className="text-[#9a9aa5]">{v}</span>
                </React.Fragment>
              ))}
            </div>

            <div className="text-[11px] font-semibold tracking-wider uppercase text-[#4ade80] mb-1">
              Your turn
            </div>
            <p className="text-[14px] leading-normal m-0 text-[#ececf0]">
              {currentStep.task}
            </p>
          </div>
        )}

        {/* The Big Takeaway Callout */}
        <div className="border-l-[3px] border-[#60a5fa] pl-3 py-1 my-3 font-semibold text-[#ececf0] text-[13.5px]">
          {currentStep.rem}
        </div>

        {/* Completion Badge */}
        <div className="min-h-[22px] flex items-center text-[#4ade80] text-[13px] font-semibold">
          {isStepDone && (
            <span className="flex items-center gap-1.5">
              <Check size={15} strokeWidth={2.5} />
              <span>Done – nice work</span>
            </span>
          )}
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-t border-[#26262b] bg-[#141416]">
        <button
          onClick={() => setActiveStepIndex(Math.max(0, activeStepIndex - 1))}
          disabled={activeStepIndex === 0}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#26262b] hover:border-[#60a5fa] hover:text-[#ececf0] disabled:opacity-30 disabled:hover:border-[#26262b] text-[#9a9aa5] text-[13px] font-medium transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          <ArrowLeft size={14} />
          <span>Back</span>
        </button>

        <button
          onClick={() =>
            setActiveStepIndex(Math.min(steps.length - 1, activeStepIndex + 1))
          }
          disabled={activeStepIndex === steps.length - 1}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#26262b] hover:border-[#4ade80] hover:text-[#ececf0] disabled:opacity-30 disabled:hover:border-[#26262b] text-[#9a9aa5] text-[13px] font-medium transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          <span>Next</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </section>
  );
};
