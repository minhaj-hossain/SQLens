'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { NETWORKING_ROADMAP_STAGES } from '@/content/networking';
import { ArrowRight, Sparkles, Terminal } from 'lucide-react';

export const NetworkingHomePage: React.FC = () => {
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    dayNumber: number;
    title: string;
    x: number;
    y: number;
  }>({
    visible: false,
    dayNumber: 1,
    title: '',
    x: 0,
    y: 0,
  });

  const handleMouseEnter = (
    e: React.MouseEvent<HTMLAnchorElement>,
    dayNumber: number,
    title: string
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      visible: true,
      dayNumber,
      title,
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    });
  };

  const handleMouseLeave = () => {
    setTooltip((prev) => ({ ...prev, visible: false }));
  };

  return (
    <div
      style={{
        fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
      }}
      className="min-h-screen bg-[#0a0a0a] text-[#ececf0] text-[16px] leading-[1.6] flex flex-col selection:bg-[#4ade80]/20 selection:text-[#4ade80]"
    >
      {/* Top Navigation */}
      <nav className="sticky top-0 z-30 flex items-center justify-between px-6 py-3.5 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-[#2a2a30]">
        <Link href="/" className="font-semibold text-[17px] tracking-tight hover:text-[#4ade80] transition-colors">
          SQLens
        </Link>
        <div className="flex items-center gap-6 text-[14px] text-[#9a9aa5]">
          <Link href="/sql" className="hover:text-[#ececf0] transition-colors">
            SQL Track
          </Link>
          <Link href="/prisma" className="hover:text-[#ececf0] transition-colors">
            Prisma Track
          </Link>
          <a href="#roadmap" className="hover:text-[#ececf0] transition-colors">
            Roadmap
          </a>
          <Link
            href="/networking/learn/net-01"
            className="border border-[#2a2a30] hover:border-[#4ade80] hover:text-[#4ade80] px-4 py-1.5 rounded-full text-[13px] font-medium transition-colors"
          >
            Start Day 1
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="max-w-[680px] mx-auto pt-20 pb-12 px-6 text-center">
        <div className="inline-flex items-center gap-2 text-[12px] font-mono uppercase tracking-[0.14em] text-[#4ade80] font-semibold mb-3">
          <Terminal size={14} />
          <span>Networking track</span>
        </div>

        <h1 className="text-[34px] sm:text-[48px] font-medium tracking-tight leading-[1.15] mb-4 text-[#ececf0]">
          Learn networking by building it.
        </h1>

        <p className="text-[#9a9aa5] text-[16px] leading-relaxed max-w-[520px] mx-auto mb-7">
          Short daily modules. Read the concept, then practise it on a live canvas with a real terminal.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/networking/learn/net-01"
            className="inline-flex items-center gap-2 bg-[#4ade80] text-[#0a0a0a] rounded-full px-6 py-2.5 font-semibold text-[15px] hover:bg-[#4ade80]/90 transition-transform active:scale-95"
          >
            <span>Start Day 1</span>
            <ArrowRight size={16} />
          </Link>
          <a
            href="#roadmap"
            className="text-[14px] text-[#9a9aa5] hover:text-[#ececf0] px-4 py-2 transition-colors"
          >
            View Roadmap ↓
          </a>
        </div>

        <div className="mt-5 text-[13px] text-[#9a9aa5]">
          12 days · Beginner friendly · Zero prerequisites
        </div>
      </header>

      {/* Interactive Roadmap Tree Section */}
      <section id="roadmap" className="px-4 pt-8 pb-24 flex-1">
        <h2 className="text-center text-[13px] font-mono tracking-[0.14em] uppercase text-[#9a9aa5] font-medium mb-8">
          Curriculum Roadmap
        </h2>

        {/* Tree Container */}
        <div className="flex flex-col items-center">
          {/* Root Node */}
          <div className="border border-[#4ade80] text-[#4ade80] bg-[#4ade80]/[0.05] rounded-full px-4 py-1 text-[13px] font-mono font-medium">
            Networking
          </div>

          {/* Stages Breakdown */}
          {NETWORKING_ROADMAP_STAGES.map((stage, stageIdx) => (
            <React.Fragment key={stageIdx}>
              {/* Vertical trunk line */}
              <div className="w-[1px] h-7 bg-[#2a2a30]"></div>

              {/* Stage label */}
              <div className="text-[11px] font-mono tracking-[0.12em] uppercase text-[#9a9aa5] py-0.5">
                {stage.name}
              </div>

              {/* Small trunk line */}
              <div className="w-[1px] h-3 bg-[#2a2a30]"></div>

              {/* Day Children Cluster */}
              <div className="relative flex gap-7 sm:gap-9">
                {/* Horizontal connector line */}
                <div className="absolute top-0 left-[27px] right-[27px] h-[1px] bg-[#2a2a30]" />

                {stage.days.map((day) => {
                  const isAvailable = day.dayNumber <= 3;
                  const isFirst = day.dayNumber === 1;

                  return (
                    <div key={day.id} className="relative pt-6 flex flex-col items-center">
                      {/* Vertical line from horizontal connector to node */}
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-6 bg-[#2a2a30]" />

                      {/* Day Node Circle */}
                      <Link
                        href={isAvailable ? `/networking/learn/${day.id}` : '#'}
                        onMouseEnter={(e) =>
                          handleMouseEnter(e, day.dayNumber, day.title)
                        }
                        onMouseLeave={handleMouseLeave}
                        className={`relative z-10 w-[52px] h-[52px] rounded-full border grid place-items-center font-mono text-[15px] font-semibold transition-all duration-200 ${
                          isFirst
                            ? 'bg-[#4ade80] border-[#4ade80] text-[#0a0a0a] shadow-[0_0_16px_rgba(74,222,128,0.35)]'
                            : isAvailable
                            ? 'bg-[#141416] border-[#2a2a30] text-[#ececf0] hover:border-[#4ade80] hover:text-[#4ade80] hover:scale-105'
                            : 'bg-[#0f0f11] border-[#222226] text-[#62626d] hover:border-[#3f3f46]'
                        }`}
                        aria-label={`Day ${day.dayNumber}: ${day.title}`}
                      >
                        {day.dayNumber}
                      </Link>
                    </div>
                  );
                })}
              </div>
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* Floating Hover Tooltip */}
      {tooltip.visible && (
        <div
          className="fixed z-50 pointer-events-none -translate-x-1/2 -translate-y-full bg-[#141416] border border-[#2a2a30] rounded-lg px-3 py-1.5 text-[13px] leading-tight text-[#ececf0] shadow-xl transition-opacity duration-150 max-w-[220px]"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <div className="text-[11px] font-mono text-[#9a9aa5]">
            Day {tooltip.dayNumber}
          </div>
          <div className="font-medium mt-0.5">{tooltip.title}</div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-[#2a2a30] py-6 px-6 text-center text-[13px] text-[#9a9aa5]">
        SQLens · Networking track
      </footer>
    </div>
  );
};
