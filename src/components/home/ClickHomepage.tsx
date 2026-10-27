'use client';

import React from 'react';
import Link from 'next/link';
import { SqlDiagramSvg, PrismaDiagramSvg } from './TrackDiagrams';
import { ClickFooter } from '@/components/layout/ClickFooter';

export interface ClickHomepageProps {
  className?: string;
}

export const ClickHomepage: React.FC<ClickHomepageProps> = ({
  className = '',
}) => {


  const cards = [
    {
      id: 'sql',
      title: 'SQL',
      desc: 'From SELECT to production engineering',
      meta: '57 days',
      badge: 'Core Engine',
      href: '/sql',
      tags: ['SELECT & Filtering', 'Multi-table JOINs', 'Window Functions', 'EXPLAIN & Indexes', 'ACID Transactions'],
      diagram: <SqlDiagramSvg />,
    },
    {
      id: 'prisma',
      title: 'Prisma',
      desc: 'Schema modeling and type-safe database access',
      meta: '14 days',
      badge: 'Type-Safe ORM',
      href: '/prisma',
      tags: ['Schema DSL', '1:1, 1:N & M:N Relations', 'Migrations Workflow', 'Query Optimization', 'REST API Capstone'],
      diagram: <PrismaDiagramSvg />,
    },
  ];

  return (
    <div
      className={`flex w-full flex-col min-w-0 bg-[#060b16] text-[#e8eefb] font-sans ${className}`}
    >
      {/* Atmospheric Top Glow (Restrained data-light ambiance) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[480px] overflow-hidden opacity-30 select-none"
        style={{
          background: 'radial-gradient(ellipse 65% 50% at 50% -10%, #38bdf8 0%, rgba(56, 189, 248, 0.05) 50%, transparent 100%)',
        }}
      />

      {/* Hero Section */}
      <section className="relative mx-auto flex w-full max-w-[1120px] flex-col items-center px-6 pt-[72px] pb-12 text-center">
        {/* Alive status pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#0d1526] border border-[#1b2a47] shadow-sm mb-2 hover:border-[#38bdf8]/40 transition-colors">
          <span className="h-2 w-2 rounded-full bg-[#38bdf8] animate-pulse" />
          <span className="font-mono text-[11px] font-semibold tracking-[0.14em] text-[#38bdf8] uppercase">
            WHEN CONCEPTS FINALLY CLICK
          </span>
        </div>

        <h1 className="mt-5 max-w-[780px] text-3xl font-bold leading-[1.08] tracking-[-0.03em] sm:text-[50px] text-[#f8fafc]">
          Learn the data layer by running it.
        </h1>
        <p className="mt-5 max-w-[500px] text-[17px] leading-[1.6] text-[#94a3b8]">
          Hands-on tracks. A real engine. All in your browser.
        </p>

        {/* Hero Quick Start CTAs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
          <a
            href="#tracks"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-[#060b16] bg-[#38bdf8] hover:bg-[#38bdf8]/90 transition shadow-lg shadow-[#38bdf8]/20 hover:scale-[1.02] active:scale-[0.99]"
          >
            <span>Explore Learning Tracks</span>
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </a>
          <Link
            href="/playground?from=/"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-[#e8eefb] bg-[#0d1526] hover:bg-[#131f38] border border-[#1b2a47] hover:border-[#38bdf8]/40 transition shadow-sm"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-[#38bdf8]"
              aria-hidden="true"
            >
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            <span>Launch Live Playground</span>
          </Link>
        </div>

        {/* Capability Trust Badges */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 pt-4 border-t border-[#121d33]/80 text-xs text-[#7b8db0]">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span>SQLite WASM Engine</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span>Prisma Client Runtime</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span>Instant Query Feedback & Diffs</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span>Zero Setup Required</span>
          </div>
        </div>
      </section>



      {/* Tracks Grid Section */}
      <section id="tracks" className="mx-auto w-full max-w-[1120px] px-6 pt-2 pb-14">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#f8fafc]">
              Choose Your Learning Track
            </h2>
            <p className="text-sm text-[#8a9bbd] mt-1">
              Curricula designed for complete mastery through real code execution.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {cards.map((card) => (
            <Link
              key={card.id}
              href={card.href}
              className="tile group flex flex-col overflow-hidden rounded-[20px] border border-[#1b2a47] bg-[#0d1526] hover:border-[#38bdf8]/50 hover:shadow-2xl hover:shadow-[#38bdf8]/10 transition-all duration-300 hover:-translate-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#38bdf8]"
            >
              {/* Top Visual Container with Dot-Grid pattern */}
              <div className="bg-dot-grid relative flex items-center justify-center border-b border-[#1b2a47] p-6 group-hover:bg-[#0f192d] transition-colors">
                <span className="absolute top-3 left-4 font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-[#1b2a47]/70 text-[#8a9bbd] border border-[#2a3d63]/50">
                  {card.badge}
                </span>
                {card.diagram}
              </div>

              {/* Bottom Metadata & Title */}
              <div className="flex flex-col gap-3 p-5 sm:p-6 flex-1 justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-[22px] font-bold tracking-[-0.02em] text-[#f8fafc] group-hover:text-[#38bdf8] transition-colors">
                      {card.title}
                    </span>
                    <span className="flex-1" />
                    <span className="font-mono text-[12px] font-semibold text-[#8a9bbd] px-2.5 py-0.5 rounded bg-[#162238] border border-[#233555]">
                      {card.meta}
                    </span>
                  </div>
                  <p className="text-[14px] leading-[1.5] text-[#8a9bbd] mt-1.5">{card.desc}</p>

                  {/* Curriculum Topic Chips */}
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {card.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] font-medium text-[#7b8db0] bg-[#121d33] px-2 py-0.5 rounded border border-[#1b2a47]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#1b2a47]/60 text-xs font-semibold text-[#38bdf8] group-hover:text-white transition-colors">
                  <span>Start Track</span>
                  <span className="flex items-center gap-1 transition-transform duration-200 group-hover:translate-x-1">
                    <span>Enter</span>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>


      {/* Click Multi-Column Footer */}
      <ClickFooter />
    </div>
  );
};

export default ClickHomepage;
