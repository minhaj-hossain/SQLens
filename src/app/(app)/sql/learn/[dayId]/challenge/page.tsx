import type { Metadata } from 'next';
import { learnPageMetadata } from '@/lib/learn-metadata';
import ChallengeView from '@/components/learn/ChallengeView';

/**
 * Server page wrapper (Phase 4 SEO layer) — challenge metadata; the
 * interactive challenge stays client-side.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ dayId: string }>;
}): Promise<Metadata> {
  const { dayId } = await params;
  return learnPageMetadata({ dayId, stage: 'challenge' });
}

export default async function ChallengePage({
  params,
}: {
  params: Promise<{ dayId: string }>;
}) {
  const { dayId } = await params;
  return <ChallengeView dayId={dayId} />;
}
