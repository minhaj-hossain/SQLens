import type { Metadata } from 'next';
import { learnPageMetadata, moduleJsonLd } from '@/lib/learn-metadata';
import { getTrackModuleById } from '@/tracks/registry';
import TheoryView from '@/components/learn/TheoryView';

/**
 * Server page wrapper (Phase 4 SEO layer) — per-concept metadata; the
 * interactive lesson stays client-side (module data imports directly there).
 *
 * Phase 4: the day OVERVIEW page was removed and `/prisma/learn/[dayId]` now
 * redirects to this URL (the day's first concept). The day's
 * `LearningResource` JSON-LD therefore lives HERE — emitted once, on the FIRST
 * concept only, so every concept page does not duplicate it.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ dayId: string; conceptId: string }>;
}): Promise<Metadata> {
  const { dayId, conceptId } = await params;
  return learnPageMetadata({ track: 'prisma', dayId, stage: 'theory', conceptId });
}

export default async function TheoryPage({
  params,
}: {
  params: Promise<{ dayId: string; conceptId: string }>;
}) {
  const { dayId, conceptId } = await params;
  const isFirstConcept = getTrackModuleById('prisma', dayId)?.concepts[0]?.id === conceptId;
  const jsonLd = isFirstConcept ? moduleJsonLd(dayId, 'prisma') : null;

  return (
    <>
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      )}
      <TheoryView dayId={dayId} conceptId={conceptId} />
    </>
  );
}
