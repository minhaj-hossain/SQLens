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

  const isCurrentStepDone = !currentStep.cmd || completedSteps.has(activeStepIndex);
  const canGoNext = activeStepIndex < steps.length - 1 && isCurrentStepDone;

  const isStepAccessible = (targetIdx: number) => {
    if (targetIdx <= activeStepIndex) return true;
    for (let k = 0; k < targetIdx; k++) {
      const step = steps[k];
      if (step?.cmd && !completedSteps.has(k)) {
        return false;
      }
    }
    return true;
  };

  return (
    <section
      id="lesson"
      style={{
        fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
      }}
      className="flex flex-col bg-[#141416] border border-[#26262b] rounded-xl overflow-hidden min-h-0 h-full text-[15px] leading-[1.6]"
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
          const accessible = isStepAccessible(idx);

          return (
            <button
              key={idx}
              onClick={() => {
                if (accessible) {
                  setActiveStepIndex(idx);
                }
              }}
              disabled={!accessible}
              className={`flex-1 h-1.5 rounded-full transition-all duration-200 ${
                isActive
                  ? 'bg-[#60a5fa] ring-2 ring-[#60a5fa]/30 cursor-pointer'
                  : isDone
                  ? 'bg-[#4ade80] cursor-pointer'
                  : accessible
                  ? 'bg-[#26262b] hover:bg-[#3f3f46] cursor-pointer'
                  : 'bg-[#26262b]/50 opacity-40 cursor-not-allowed'
              }`}
              title={accessible ? `Step ${idx + 1}` : `Complete previous steps to unlock`}
              aria-label={`Jump to step ${idx + 1}`}
            />
          );
        })}
      </div>

      {/* Step Body Content */}
      <div className="flex-1 overflow-y-auto px-4 py-3.5 space-y-3.5 text-[#ececf0] text-[15px] leading-relaxed select-text">
        {/* Step Group Tag */}
        <div className="text-[12px] text-[#9a9aa5]">
          {currentStep.group}
        </div>

        {/* Step Title */}
        <h2 className="text-[19px] font-bold text-[#ececf0] leading-[1.3] m-0">
          {currentStep.title}
        </h2>

        {/* What is it / Big picture */}
        <div>
          <div className="text-[11px] font-semibold tracking-wider uppercase text-[#60a5fa] mb-1">
            {currentStep.cmd ? 'What is it?' : 'The big picture'}
          </div>
          <p className="text-[#ececf0] text-[15px] leading-[1.6] m-0">
            {currentStep.what}
          </p>
        </div>

        {/* Why does it matter + Canvas visual hint */}
        {currentStep.why && (
          <div>
            <div className="text-[11px] font-semibold tracking-wider uppercase text-[#60a5fa] mb-1">
              Why does it matter?
            </div>
            <p className="text-[#ececf0] text-[15px] leading-[1.6] mb-2">
              {currentStep.why}
            </p>

            {currentStep.pic && (
              <div className="border border-[#26262b] rounded-[10px] p-[10px_12px] bg-[#4ade80]/[0.07] text-[15px] leading-[1.6] text-[#ececf0]">
                <b>On the canvas:</b> {currentStep.pic}
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
            <p className="text-[15px] leading-[1.6] mb-2">
              {currentStep.task} Type{' '}
              <code
                data-c={currentStep.cmd}
                onClick={() => onCodeClick(currentStep.cmd!)}
                style={{
                  fontFamily: 'ui-monospace, Menlo, Consolas, monospace',
                }}
                className="bg-[#050506] text-[#4ade80] px-[7px] py-[2px] rounded-[6px] text-[13px] cursor-pointer inline-block"
              >
                {currentStep.cmd}
              </code>{' '}
              <span className="text-[#9a9aa5] text-[14px]">
                (tap it to fill the terminal).
              </span>
            </p>

            {/* How to read the result table */}
            <div className="text-[11px] font-semibold tracking-wider uppercase text-[#60a5fa] mb-1">
              How to read the result
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 46%) 1fr',
                gap: '6px 12px',
              }}
              className="text-[13px] border border-[#26262b] rounded-[10px] p-[10px_12px]"
            >
              {currentStep.read.map(([k, v], idx) => (
                <React.Fragment key={idx}>
                  <b
                    style={{
                      font: '500 12.5px ui-monospace, Menlo, Consolas, monospace',
                      overflowWrap: 'anywhere',
                    }}
                    className="text-[#4ade80]"
                  >
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
            <div className="text-[11px] font-semibold tracking-wider uppercase text-[#60a5fa] mb-1">
              The four questions
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 46%) 1fr',
                gap: '6px 12px',
              }}
              className="text-[13px] border border-[#26262b] rounded-[10px] p-[10px_12px] mb-3"
            >
              {currentStep.read.map(([k, v], idx) => (
                <React.Fragment key={idx}>
                  <b
                    style={{
                      font: '500 12.5px ui-monospace, Menlo, Consolas, monospace',
                      overflowWrap: 'anywhere',
                    }}
                    className="text-[#4ade80]"
                  >
                    {k}
                  </b>
                  <span className="text-[#9a9aa5]">{v}</span>
                </React.Fragment>
              ))}
            </div>

            <div className="text-[11px] font-semibold tracking-wider uppercase text-[#4ade80] mb-1">
              Your turn
            </div>
            <p className="text-[15px] leading-[1.6] m-0 text-[#ececf0]">
              {currentStep.task}
            </p>
          </div>
        )}

        {/* The Big Takeaway Callout */}
        <div className="border-l-[3px] border-[#60a5fa] pl-3 py-[2px] mt-4 font-semibold text-[#ececf0] text-[15px]">
          {currentStep.rem}
        </div>

        {/* Completion Badge */}
        <div className="text-[#4ade80] text-[13px] mt-2 min-h-[20px]">
          {isCurrentStepDone ? '✓ Done – nice work' : ''}
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex justify-between p-[10px_14px] border-t border-[#26262b]">
        <button
          onClick={() => setActiveStepIndex(Math.max(0, activeStepIndex - 1))}
          disabled={activeStepIndex === 0}
          className="bg-transparent border border-[#26262b] text-[#ececf0] rounded-[8px] px-[14px] py-[6px] text-[15px] cursor-pointer disabled:opacity-35 disabled:cursor-default"
        >
          ← Back
        </button>

        <button
          onClick={() => {
            if (canGoNext) {
              setActiveStepIndex(Math.min(steps.length - 1, activeStepIndex + 1));
            }
          }}
          disabled={!canGoNext}
          title={
            activeStepIndex === steps.length - 1
              ? 'End of lesson'
              : !isCurrentStepDone
              ? 'Complete the current task to continue'
              : 'Next step'
          }
          className="bg-transparent border border-[#26262b] text-[#ececf0] rounded-[8px] px-[14px] py-[6px] text-[15px] cursor-pointer disabled:opacity-35 disabled:cursor-default"
        >
          Next →
        </button>
      </div>
    </section>
  );
};
