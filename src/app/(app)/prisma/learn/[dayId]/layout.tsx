'use client';
/**
 * Day layout delegate (Task 4.2) — ALL day-boundary logic lives in
 * `TrackDayLayoutView`: dayId validation/404, the executor reset boundary,
 * lock enforcement and the breadcrumb chrome. This file and its sql sibling
 * are kept byte-identical except for the `track` literal (static guard:
 * tests/tracks/track-day-layout-view.test.tsx) — edit one, mirror the other.
 */
import type { ReactNode } from 'react';
import TrackDayLayoutView from '@/components/learn/TrackDayLayoutView';

export default function DayLayout({ children }: { children: ReactNode }) {
  return <TrackDayLayoutView track="prisma">{children}</TrackDayLayoutView>;
}
