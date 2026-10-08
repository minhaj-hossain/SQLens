import type { Metadata } from 'next';
import { redirect, notFound } from 'next/navigation';
import { ALL_MODULES } from '@/content/sql/curriculum-index';
import { learnPageMetadata } from '@/lib/learn-metadata';
import { getTrackModuleById } from '@/tracks/registry';
import { trackLearnUrl } from '@/lib/track-routes';

/**
 * Server day-entry (Phase 4) — the `/learn/[dayId]` OVERVIEW page is GONE.
 *
 * This URL is now an immediate server redirect to the day's FIRST CONCEPT
 * lesson (`/sql/learn/[dayId]/theory/[firstConceptId]`), so a learner landing
 * on a bare day URL starts learning instead of seeing an intermediate landing
 * page. Lock/unlock handling moved into the day layout, which renders
 * `LockedDayNotice` in place of the lesson and never redirects.
 *
 * `generateStaticParams` + `generateMetadata` are kept so the day URLs stay
 * statically prerendered and keep their per-day metadata/canonical.
 */
export function generateStaticParams() {
  return ALL_MODULES.map((m) => ({ dayId: m.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ dayId: string }> }): Promise<Metadata> {
  const { dayId } = await params;
  return learnPageMetadata({ dayId, stage: 'theory' });
}

export default async function DayEntryPage({ params }: { params: Promise<{ dayId: string }> }) {
  const { dayId } = await params;
  const mod = getTrackModuleById('sql', dayId);
  const firstConcept = mod?.concepts[0];
  if (!mod || !firstConcept) notFound();
  redirect(trackLearnUrl('sql', mod.id, 'theory', firstConcept.id));
}
