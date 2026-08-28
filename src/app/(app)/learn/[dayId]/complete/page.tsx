import type { Metadata } from 'next';
import { learnPageMetadata } from '@/lib/learn-metadata';
import CompleteView from '@/components/learn/CompleteView';

/**
 * Server page wrapper (Phase 4 SEO layer) — completion-screen metadata; the
 * interactive completion view stays client-side.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ dayId: string }>;
}): Promise<Metadata> {
  const { dayId } = await params;
  return learnPageMetadata({ dayId, stage: 'complete' });
}

export default async function CompletePage({
  params,
}: {
  params: Promise<{ dayId: string }>;
}) {
  const { dayId } = await params;
  return <CompleteView dayId={dayId} />;
}
