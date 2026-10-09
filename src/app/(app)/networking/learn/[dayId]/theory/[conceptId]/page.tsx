import type { Metadata } from 'next';
import { learnPageMetadata, moduleJsonLd } from '@/lib/learn-metadata';
import { getTrackModuleById } from '@/tracks/registry';
import TheoryView from '@/components/learn/TheoryView';

/**
 * Server page wrapper (Networking track) — per-concept theory metadata and view.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ dayId: string; conceptId: string }>;
}): Promise<Metadata> {
  const { dayId, conceptId } = await params;
  return learnPageMetadata({ track: 'networking', dayId, stage: 'theory', conceptId });
}

export default async function TheoryPage({
  params,
}: {
  params: Promise<{ dayId: string; conceptId: string }>;
}) {
  const { dayId, conceptId } = await params;
  const isFirstConcept = getTrackModuleById('networking', dayId)?.concepts[0]?.id === conceptId;
  const jsonLd = isFirstConcept ? moduleJsonLd(dayId, 'networking') : null;

  return (
    <>
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      )}
      <TheoryView dayId={dayId} conceptId={conceptId} />
    </>
  );
}
