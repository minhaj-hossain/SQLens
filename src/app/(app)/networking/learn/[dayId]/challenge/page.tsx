import type { Metadata } from 'next';
import { learnPageMetadata } from '@/lib/learn-metadata';
import ChallengeView from '@/components/learn/ChallengeView';

/**
 * Server page wrapper (Networking track) — challenge metadata and view.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ dayId: string }>;
}): Promise<Metadata> {
  const { dayId } = await params;
  return learnPageMetadata({ track: 'networking', dayId, stage: 'challenge' });
}

export default async function ChallengePage({
  params,
}: {
  params: Promise<{ dayId: string }>;
}) {
  const { dayId } = await params;
  return <ChallengeView dayId={dayId} />;
}
