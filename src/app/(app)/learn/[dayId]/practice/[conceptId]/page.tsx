import type { Metadata } from 'next';
import { learnPageMetadata } from '@/lib/learn-metadata';
import PracticeView from '@/components/learn/PracticeView';

/**
 * Server page wrapper (Phase 4 SEO layer) — per-concept practice metadata;
 * interactive task flow stays client-side (Suspense for useSearchParams).
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ dayId: string; conceptId: string }>;
}): Promise<Metadata> {
  const { dayId, conceptId } = await params;
  return learnPageMetadata({ dayId, stage: 'practice', conceptId });
}

export default async function PracticePage({
  params,
}: {
  params: Promise<{ dayId: string; conceptId: string }>;
}) {
  const { dayId, conceptId } = await params;
  return <PracticeView dayId={dayId} conceptId={conceptId} />;
}
