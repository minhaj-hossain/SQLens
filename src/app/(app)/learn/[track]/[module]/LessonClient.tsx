"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/base16/gruvbox-dark-hard.css";
import { LessonStep } from "@/lib/ai-parser";
import { ChevronRight, ChevronLeft, Terminal, BookOpen, Code2, Play } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const PyodideEditor = dynamic(() => import("@/components/ai-sandbox/PyodideEditor"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-[#1d2021] text-[#ebdbb2]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-6 h-6 border-2 border-[#8ec07c] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-mono tracking-widest uppercase text-[#8ec07c]">Booting AINA OS...</p>
      </div>
    </div>
  ),
});

export default function LessonClient({ steps }: { steps: LessonStep[] }) {
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  if (!steps || steps.length === 0) return <div className="p-8 text-[#fb4934]">No steps found.</div>;

  const currentStep = steps[activeStepIndex];
  
  let currentTaskCode = "";
  let currentTestCode = "";
  
  if (currentStep.type === "task") {
    currentTaskCode = currentStep.initialCode;
    currentTestCode = currentStep.testCode;
  } else {
    currentTaskCode = "# 👉 Read the concept on the left.\n# 🚀 Then click 'Continue' to start the task!";
  }

  const goNext = () => {
    if (activeStepIndex < steps.length - 1) setActiveStepIndex((prev) => prev + 1);
  };
  
  const goPrev = () => {
    if (activeStepIndex > 0) setActiveStepIndex((prev) => prev - 1);
  };

  const progressPercentage = ((activeStepIndex + 1) / steps.length) * 100;

  // Custom Markdown components to inject Gruvbox styling
  const MarkdownComponents = {
    h1: ({node, ...props}: any) => <h1 className="text-3xl font-extrabold text-[#fbf1c7] mt-8 mb-4 tracking-tight" {...props} />,
    h2: ({node, ...props}: any) => <h2 className="text-xl font-bold text-[#8ec07c] mt-8 mb-3 uppercase tracking-wider text-sm border-b border-[#3c3836] pb-2" {...props} />,
    h3: ({node, ...props}: any) => <h3 className="text-lg font-bold text-[#fabd2f] mt-6 mb-2" {...props} />,
    p: ({node, ...props}: any) => <p className="text-[#ebdbb2] leading-relaxed mb-4 text-[16px] font-light" {...props} />,
    strong: ({node, ...props}: any) => <strong className="font-semibold text-[#fbf1c7]" {...props} />,
    pre: ({node, ...props}: any) => (
      <pre className="bg-[#282828] border border-[#3c3836] rounded-xl p-4 my-4 overflow-x-auto shadow-lg shadow-black/20" {...props} />
    ),
    code: ({node, inline, ...props}: any) => 
      inline ? (
        <code className="bg-[#3c3836] text-[#fabd2f] px-1.5 py-0.5 rounded font-mono text-[14px]" {...props} />
      ) : (
        <code className="font-mono text-[14px] text-[#ebdbb2]" {...props} />
      ),
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#1d2021] overflow-hidden" style={{ fontFamily: "'Fira Sans', system-ui, sans-serif" }}>
      
      {/* Top Navigation - RCAI Style */}
      <header className="h-16 bg-[#1d2021] border-b border-[#3c3836] flex items-center justify-between px-6 shrink-0 z-20 shadow-md">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 text-[#fbf1c7] font-extrabold text-lg tracking-wide">
            <div className="w-8 h-8 bg-gradient-to-br from-[#8ec07c] to-[#689d6a] rounded flex items-center justify-center text-[#1d2021] shadow-lg shadow-[#8ec07c]/20">
              <Terminal size={18} strokeWidth={2.5} />
            </div>
            RCAI <span className="text-[#8ec07c] font-normal mx-1">/</span> Bootcamp
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="hidden md:flex items-center gap-3 w-48">
            <div className="h-1.5 w-full bg-[#3c3836] rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-[#fabd2f] to-[#fe8019] rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>
            <span className="text-[11px] font-mono font-bold text-[#928374] w-8">{Math.round(progressPercentage)}%</span>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={goPrev} 
              disabled={activeStepIndex === 0} 
              className="flex items-center justify-center w-9 h-9 rounded-full border border-[#3c3836] hover:bg-[#3c3836] hover:text-[#fbf1c7] disabled:opacity-30 transition-colors text-[#928374]"
            >
              <ChevronLeft size={18} />
            </button>
            <button 
              onClick={goNext} 
              disabled={activeStepIndex === steps.length - 1} 
              className="flex items-center gap-2 px-5 py-2 text-[15px] font-bold bg-gradient-to-br from-[#8ec07c] to-[#689d6a] text-[#1d2021] rounded hover:shadow-[0_8px_22px_rgba(142,192,124,0.35)] hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:shadow-none transition-all duration-200"
            >
              {activeStepIndex === steps.length - 1 ? 'Finish' : 'Continue'}
              <ChevronRight size={16} strokeWidth={3} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Split Screen */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Left Panel: Guide */}
        <div className="w-[45%] flex flex-col bg-[#1d2021] border-r border-[#3c3836] relative z-10">
          {/* subtle radial background glow like RCAI */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 0%, #8ec07c, transparent 60%)' }}></div>
          
          <div className="px-10 pt-12 pb-6 relative z-10">
             <motion.div 
                key={`badge-${currentStep.title}`}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3c3836]/60 border border-[#504945] text-[#fabd2f] text-[11px] font-mono uppercase tracking-[0.16em] font-semibold mb-5 backdrop-blur-md"
             >
                {currentStep.type === 'concept' ? <BookOpen size={14} /> : <Play size={14} />}
                {currentStep.type === 'concept' ? 'CONCEPT' : 'LAB'} // {activeStepIndex + 1}
             </motion.div>
             <motion.h1 
                key={`h1-${currentStep.title}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-3xl font-extrabold text-[#fbf1c7] tracking-tight leading-tight"
             >
               {currentStep.title}
             </motion.h1>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto px-10 py-6 custom-scrollbar relative z-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStepIndex}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                {currentStep.type === "concept" ? (
                  <div className="pb-16">
                    <ReactMarkdown 
                      components={MarkdownComponents}
                      rehypePlugins={[rehypeHighlight]}
                    >
                      {currentStep.contentMd}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="space-y-6 pb-16">
                    <div className="bg-[#282828] border border-[#504945] rounded-xl p-7 relative overflow-hidden shadow-xl shadow-black/20 hover:border-[#8ec07c]/50 transition-colors duration-300">
                      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#8ec07c] to-[#fabd2f]"></div>
                      <h3 className="text-[#8ec07c] font-bold text-[13px] font-mono tracking-[0.12em] mb-4 uppercase flex items-center gap-2">
                        <Code2 size={16} />
                        Mission Objectives
                      </h3>
                      <div>
                        <ReactMarkdown components={MarkdownComponents}>
                          {currentStep.instructionsMd}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Right Panel: Sandbox */}
        <div className="flex-1 bg-[#1d2021] relative z-20">
          <PyodideEditor 
            initialCode={currentTaskCode} 
            testCode={currentTestCode} 
          />
        </div>
      </div>
    </div>
  );
}
