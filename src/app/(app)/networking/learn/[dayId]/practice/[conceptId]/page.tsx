import type { Metadata } from 'next';
import { learnPageMetadata } from '@/lib/learn-metadata';
import PracticeView from '@/components/learn/PracticeView';

/**
 * Server page wrapper (Networking track) — per-concept practice metadata and view.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ dayId: string; conceptId: string }>;
}): Promise<Metadata> {
  const { dayId, conceptId } = await params;
  return learnPageMetadata({ track: 'networking', dayId, stage: 'practice', conceptId });
}

export default async function PracticePage({
  params,
}: {
  params: Promise<{ dayId: string; conceptId: string }>;
}) {
  const { dayId, conceptId } = await params;
  return <PracticeView dayId={dayId} conceptId={conceptId} />;
}
