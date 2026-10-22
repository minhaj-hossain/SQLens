import { redirect } from 'next/navigation';

/**
 * Server page wrapper (Networking track) — redirects to the unified day cockpit.
 * Day 1 & Day 2 contain all learning, terminal experiments, and workplace tickets directly in the cockpit.
 */
export default async function PracticePage({
  params,
}: {
  params: Promise<{ dayId: string; conceptId: string }>;
}) {
  const { dayId } = await params;
  redirect(`/networking/learn/${dayId}`);
}
