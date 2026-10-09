import type { Metadata } from 'next';
import { learnPageMetadata } from '@/lib/learn-metadata';
import CompleteView from '@/components/learn/CompleteView';

/**
 * Server page wrapper (Networking track) — completion-screen metadata and view.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ dayId: string }>;
}): Promise<Metadata> {
  const { dayId } = await params;
  return learnPageMetadata({ track: 'networking', dayId, stage: 'complete' });
}

export default async function CompletePage({
  params,
}: {
  params: Promise<{ dayId: string }>;
}) {
  const { dayId } = await params;
  return <CompleteView dayId={dayId} />;
}
