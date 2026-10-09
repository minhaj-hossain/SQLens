import type { Metadata } from 'next';
import { redirect, notFound } from 'next/navigation';
import { NETWORKING_MODULES } from '@/content/networking/networking-curriculum-index';
import { learnPageMetadata } from '@/lib/learn-metadata';
import { getTrackModuleById } from '@/tracks/registry';
import { trackLearnUrl } from '@/lib/track-routes';

/**
 * Server day-entry (Networking track) — immediate redirect to first concept.
 */
export function generateStaticParams() {
  return NETWORKING_MODULES.map((m) => ({ dayId: m.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ dayId: string }> }): Promise<Metadata> {
  const { dayId } = await params;
  return learnPageMetadata({ track: 'networking', dayId, stage: 'theory' });
}

export default async function DayEntryPage({ params }: { params: Promise<{ dayId: string }> }) {
  const { dayId } = await params;
  const mod = getTrackModuleById('networking', dayId);
  const firstConcept = mod?.concepts[0];
  if (!mod || !firstConcept) notFound();
  redirect(trackLearnUrl('networking', mod.id, 'theory', firstConcept.id));
}
