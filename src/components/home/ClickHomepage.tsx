'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { SqlDiagramSvg, PrismaDiagramSvg } from './TrackDiagrams';
import { ClickFooter } from '@/components/layout/ClickFooter';
import { loadUserState, initialStateForTrack } from '@/lib/progress/storage';
import { getTrackDefinition } from '@/tracks/registry';
import { deriveLastPosition } from '@/lib/progress/unlock-calculator';
import { TRACK_IDS, TRACK_META, TrackId } from '@/types/track';
import { trackLearnUrl } from '@/lib/track-routes';
import type { UserLearningState } from '@/types/progress';

export interface ActiveTrackProgress {
  track: TrackId;
  trackLabel: string;
  dayNumber: number;
  dayTitle: string;
  totalDays: number;
  completedDays: number;
  percent: number;
  resumeUrl: string;
}

export interface ClickHomepageProps {
  className?: string;
  initialProgress?: ActiveTrackProgress | null;
}

function getSavedTrackState(track: TrackId): UserLearningState {
  if (typeof window === 'undefined') return initialStateForTrack(track);
  try {
    const guestState = loadUserState(null, track);
    const guestCount =
      Object.keys(guestState.completedModules ?? {}).length +
      Object.keys(guestState.completedTasks ?? {}).length;

    const userPrefix = track === 'sql' ? 'sqlens_progress_user_' : 'prismalens_progress_user_';
    let bestUserState: UserLearningState | null = null;
    let bestUserCount = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(userPrefix)) {
        const raw = localStorage.getItem(key);
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            const count =
              Object.keys(parsed.completedModules ?? {}).length +
              Object.keys(parsed.completedTasks ?? {}).length;
            if (count > bestUserCount) {
              bestUserCount = count;
              bestUserState = parsed;
            }
          } catch {
            /* ignore malformed key */
          }
        }
      }
    }

    if (bestUserState && bestUserCount > guestCount) {
      return bestUserState;
    }
    return guestState;
  } catch {
    return initialStateForTrack(track);
  }
}

export const ClickHomepage: React.FC<ClickHomepageProps> = ({
  className = '',
  initialProgress = null,
}) => {
  const [activeProgress, setActiveProgress] = useState<ActiveTrackProgress | null>(initialProgress);

  useEffect(() => {
    if (initialProgress) return;

    let bestProgress: ActiveTrackProgress | null = null;
    let bestTimestamp = 0;

    for (const tId of TRACK_IDS) {
      const trackDef = getTrackDefinition(tId);
      const state = getSavedTrackState(tId);
      const completedDays = Object.keys(state.completedModules ?? {}).length;
      const completedTasks = Object.keys(state.completedTasks ?? {}).length;

      if (completedDays > 0 || completedTasks > 0) {
        const ts = new Date(state.lastActiveTimestamp ?? 0).getTime() || 0;
        if (!bestProgress || ts > bestTimestamp) {
          bestTimestamp = ts;
          const position = deriveLastPosition(trackDef.modules, state);
          const activeMod = trackDef.getModuleById(position.moduleId) ?? trackDef.modules[0];
          const percent = Math.min(100, Math.round((completedDays / trackDef.modules.length) * 100));
          const resumeUrl = position.conceptId
            ? trackLearnUrl(tId, position.moduleId, 'theory', position.conceptId)
            : `/${tId}/learn`;
          bestProgress = {
            track: tId,
            trackLabel: TRACK_META[tId].label,
            dayNumber: activeMod.day,
            dayTitle: activeMod.title,
            totalDays: trackDef.modules.length,
            completedDays,
            percent,
            resumeUrl,
          };
        }
      }
    }

    setActiveProgress(bestProgress);
  }, [initialProgress]);

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
      </section>

      {/* Returning Learner Resume Card */}
      {activeProgress && (
        <section id="returning-learner-section" className="mx-auto w-full max-w-[1120px] px-6 pb-6">
          <div
            id="returning-learner-card"
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 p-5 sm:p-6 rounded-[20px] border border-[#1b2a47] bg-[#0d1526] bg-gradient-to-r from-[#38bdf8]/10 via-[#0d1526] to-[#0d1526] shadow-xl"
          >
            <div className="flex flex-col gap-2 min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="font-mono text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#38bdf8]/15 text-[#38bdf8] border border-[#38bdf8]/30">
                  {activeProgress.trackLabel} Track
                </span>
                <span className="font-mono text-xs text-[#8a9bbd]">
                  Day {activeProgress.dayNumber} of {activeProgress.totalDays}
                </span>
                <span className="font-mono text-xs text-[#38bdf8] font-semibold">
                  • {activeProgress.percent}% Completed
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-semibold text-[#e8eefb] truncate">
                {activeProgress.dayTitle}
              </h2>
              <div className="w-full max-w-md h-1.5 bg-[#1b2a47] rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-[#38bdf8] rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(4, activeProgress.percent)}%` }}
                />
              </div>
            </div>

            <Link
              id="resume-learning-btn"
              href={activeProgress.resumeUrl}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold font-sans bg-[#38bdf8] hover:bg-[#38bdf8]/90 text-[#060b16] transition shrink-0 shadow-md hover:shadow-[#38bdf8]/20"
            >
              <span>Resume Learning</span>
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
            </Link>
          </div>
        </section>
      )}

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
