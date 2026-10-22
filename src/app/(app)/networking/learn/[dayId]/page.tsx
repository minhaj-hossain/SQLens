import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NETWORKING_MODULES } from '@/content/networking/networking-curriculum-index';
import { learnPageMetadata, moduleJsonLd } from '@/lib/learn-metadata';
import { getTrackModuleById } from '@/tracks/registry';
import TheoryView from '@/components/learn/TheoryView';

/**
 * Server day-entry (Networking track) — renders the unified interactive day cockpit directly.
 * Clean, scalable URL architecture: /networking/learn/net-01#c1/r1
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

  const jsonLd = moduleJsonLd(dayId, 'networking');

  return (
    <>
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      )}
      <TheoryView dayId={dayId} conceptId={firstConcept.id} />
    </>
  );
}
