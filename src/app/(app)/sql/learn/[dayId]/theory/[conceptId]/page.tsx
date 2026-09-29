import type { Metadata } from 'next';
import { learnPageMetadata } from '@/lib/learn-metadata';
import TheoryView from '@/components/learn/TheoryView';

/**
 * Server page wrapper (Phase 4 SEO layer) — per-concept metadata; the
 * interactive lesson stays client-side (module data imports directly there).
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ dayId: string; conceptId: string }>;
}): Promise<Metadata> {
  const { dayId, conceptId } = await params;
  return learnPageMetadata({ dayId, stage: 'theory', conceptId });
}

export default async function TheoryPage({
  params,
}: {
  params: Promise<{ dayId: string; conceptId: string }>;
}) {
  const { dayId, conceptId } = await params;
  return <TheoryView dayId={dayId} conceptId={conceptId} />;
}
