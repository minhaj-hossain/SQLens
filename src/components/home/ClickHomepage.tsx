'use client';

import React from 'react';
import Link from 'next/link';
import { SqlDiagramSvg, PrismaDiagramSvg, NetworkingDiagramSvg } from './TrackDiagrams';
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
      hoverBorder: 'hover:border-func/60',
      hoverShadow: 'hover:shadow-2xl hover:shadow-func/10',
      badgeBorder: 'border-func/30 text-func bg-func/10',
      hoverTitle: 'group-hover:text-func',
      ctaText: 'text-func',
      outlineRing: 'focus-visible:outline-func',
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
      hoverBorder: 'hover:border-[#38bdf8]/60',
      hoverShadow: 'hover:shadow-2xl hover:shadow-[#38bdf8]/10',
      badgeBorder: 'border-[#38bdf8]/30 text-[#38bdf8] bg-[#38bdf8]/10',
      hoverTitle: 'group-hover:text-[#38bdf8]',
      ctaText: 'text-[#38bdf8]',
      outlineRing: 'focus-visible:outline-[#38bdf8]',
    },
    {
      id: 'networking',
      title: 'Networking',
      desc: 'Physical reality of packets, cables, routing tables & sockets',
      meta: '35 days',
      badge: 'Packet Simulation',
      href: '/networking',
      tags: ['Ethernet & MACs', 'Subnets & CIDR', 'L3 Routing & Gateways', 'VLANs & Trunks', 'TCP/UDP Sockets'],
      diagram: <NetworkingDiagramSvg />,
      hoverBorder: 'hover:border-[#4ade80]/60',
      hoverShadow: 'hover:shadow-2xl hover:shadow-[#4ade80]/10',
      badgeBorder: 'border-[#4ade80]/30 text-[#4ade80] bg-[#4ade80]/10',
      hoverTitle: 'group-hover:text-[#4ade80]',
      ctaText: 'text-[#4ade80]',
      outlineRing: 'focus-visible:outline-[#4ade80]',
    },
  ];

  return (
    <div
      className={`flex w-full flex-col min-w-0 bg-ink text-text font-sans ${className}`}
    >
      {/* Atmospheric Top Glow (Theme-reactive data-light ambiance) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[480px] overflow-hidden opacity-25 select-none"
        style={{
          background: 'radial-gradient(ellipse 65% 50% at 50% -10%, var(--func) 0%, var(--pulse-mid) 50%, transparent 100%)',
        }}
      />

      {/* Hero Section */}
      <section className="relative mx-auto flex w-full max-w-[1120px] flex-col items-center px-6 pt-[72px] pb-12 text-center">
        {/* Alive status pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-surface border border-border shadow-sm mb-2 hover:border-func/40 transition-colors">
          <span className="h-2 w-2 rounded-full bg-func animate-pulse" />
          <span className="font-mono text-[11px] font-semibold tracking-[0.14em] text-func uppercase">
            WHEN CONCEPTS FINALLY CLICK
          </span>
        </div>

        <h1 className="mt-5 max-w-[780px] text-3xl font-bold leading-[1.08] tracking-[-0.03em] sm:text-[50px] text-text">
          Learn the data layer by running it.
        </h1>
        <p className="mt-5 max-w-[500px] text-[17px] leading-[1.6] text-text-dim">
          Hands-on tracks. A real engine. All in your browser.
        </p>

        {/* Hero Quick Start CTAs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
          <a
            href="#tracks"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-ink bg-func hover:brightness-110 transition shadow-lg shadow-func/20 hover:scale-[1.02] active:scale-[0.99]"
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
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-text bg-surface hover:bg-surface-2 border border-border hover:border-func/40 transition shadow-sm"
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
              className="text-func"
              aria-hidden="true"
            >
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            <span>Launch Live Playground</span>
          </Link>
        </div>

        {/* Capability Trust Badges */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 pt-4 border-t border-border-soft text-xs text-text-dim">
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
            <span>Interactive Packet Canvas</span>
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
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-text">
              Choose Your Learning Track
            </h2>
            <p className="text-sm text-text-dim mt-1">
              Curricula designed for complete mastery through real code execution.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <Link
              key={card.id}
              href={card.href}
              className={`tile group flex flex-col overflow-hidden rounded-[20px] border border-border bg-surface ${card.hoverBorder} ${card.hoverShadow} transition-all duration-300 ease-out hover:-translate-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${card.outlineRing}`}
            >
              {/* Top Visual Container with Dot-Grid pattern */}
              <div className="bg-dot-grid relative flex items-center justify-center border-b border-border p-6 group-hover:bg-surface-2 transition-colors">
                <span className={`absolute top-3 left-4 font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border ${card.badgeBorder}`}>
                  {card.badge}
                </span>
                {card.diagram}
              </div>

              {/* Bottom Metadata & Title */}
              <div className="flex flex-col gap-3 p-5 sm:p-6 flex-1 justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[22px] font-bold tracking-[-0.02em] text-text ${card.hoverTitle} transition-colors`}>
                      {card.title}
                    </span>
                    <span className="flex-1" />
                    <span className="font-mono text-[12px] font-semibold text-text-dim px-2.5 py-0.5 rounded bg-surface-2 border border-border">
                      {card.meta}
                    </span>
                  </div>
                  <p className="text-[14px] leading-[1.5] text-text-dim mt-1.5">{card.desc}</p>

                  {/* Curriculum Topic Chips */}
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {card.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] font-medium text-text-dim bg-surface-2 px-2 py-0.5 rounded border border-border"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className={`flex items-center justify-between pt-3 border-t border-border-soft text-xs font-semibold ${card.ctaText} group-hover:text-text transition-colors`}>
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
