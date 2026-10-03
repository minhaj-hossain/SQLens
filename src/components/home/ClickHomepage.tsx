'use client';

import React from 'react';
import Link from 'next/link';
import { SqlDiagramSvg, PrismaDiagramSvg } from './TrackDiagrams';
import { ReturningLearnerCard } from '@/components/tracks/HeroLensInteractivePreview';
import { ClickFooter } from '@/components/layout/ClickFooter';

export interface ClickHomepageProps {
  className?: string;
}

export const ClickHomepage: React.FC<ClickHomepageProps> = ({ className = '' }) => {
  const cards = [
    {
      id: 'sql',
      title: 'SQL',
      desc: 'From SELECT to production engineering',
      meta: '57 days',
      href: '/sql',
      diagram: <SqlDiagramSvg />,
    },
    {
      id: 'prisma',
      title: 'Prisma',
      desc: 'Schema modeling and type-safe database access',
      meta: '14 days',
      href: '/prisma',
      diagram: <PrismaDiagramSvg />,
    },
  ];

  return (
    <div
      className={`flex w-full flex-col min-w-0 bg-[#060b16] text-[#e8eefb] font-sans ${className}`}
    >
      {/* Hero Section */}
      <section className="mx-auto flex w-full max-w-[1120px] flex-col items-center px-6 pt-[72px] pb-12 text-center">
        <div className="font-mono text-[12px] tracking-[0.14em] text-[#38bdf8] uppercase">
          WHEN CONCEPTS FINALLY CLICK
        </div>
        <h1 className="mt-5 max-w-[720px] text-3xl font-semibold leading-[1.06] tracking-[-0.03em] sm:text-[48px]">
          Learn the data layer by running it.
        </h1>
        <p className="mt-5 max-w-[440px] text-[17px] leading-[1.6] text-[#8a9bbd]">
          Hands-on tracks. A real engine. All in your browser.
        </p>

        {/* Seamless returning learner continuity (only renders if learner has progress) */}
        <div className="w-full max-w-[720px]">
          <ReturningLearnerCard />
        </div>
      </section>

      {/* Tracks Grid Section */}
      <section id="tracks" className="mx-auto w-full max-w-[1120px] px-6 pt-2 pb-14">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {cards.map((card) => (
            <Link
              key={card.id}
              href={card.href}
              className="tile group flex flex-col overflow-hidden rounded-[20px] border border-[#1b2a47] bg-[#0d1526] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#38bdf8]"
            >
              {/* Top Visual Container with Dot-Grid pattern */}
              <div className="bg-dot-grid flex items-center justify-center border-b border-[#1b2a47] p-6">
                {card.diagram}
              </div>

              {/* Bottom Metadata & Title */}
              <div className="flex flex-col gap-1.5 p-5 sm:px-6 sm:py-5">
                <div className="flex items-center gap-3">
                  <span className="text-[22px] font-semibold tracking-[-0.02em] text-[#e8eefb]">
                    {card.title}
                  </span>
                  <span className="flex-1" />
                  <span className="font-mono text-[12px] text-[#8a9bbd]">{card.meta}</span>
                  <span className="flex text-[#38bdf8] transition-transform duration-200 group-hover:translate-x-0.5">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </span>
                </div>
                <span className="text-[14px] leading-[1.5] text-[#8a9bbd]">{card.desc}</span>
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
