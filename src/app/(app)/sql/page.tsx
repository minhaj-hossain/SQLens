import RoadmapPage from '@/components/roadmap/RoadmapPage';
import { LegacySearchParams } from '@/lib/legacy-routes';

export const metadata = {
  title: 'SQL Learning Path — 57 Days of Hands-On SQL',
  description:
    'Your visual roadmap through 57 Days of SQL: mental models, guided practice tasks and independent challenges in the in-browser query engine.',
  alternates: { canonical: '/sql' },
};

/**
 * `/sql` — the SQL track roadmap (Phase 2).
 *
 * This is the roadmap that used to live at `/`. It is a server component for
 * the same reason: `?highlight=day-NN` (set when returning from a lesson) is
 * read from the URL and handed to the client view for auto-scroll.
 *
 * `RoadmapPage` resolves its curriculum from the active track, which
 * `useTrack()` derives from this pathname — so no prop or provider is needed.
 */
export default async function SqlRoadmapPage({
  searchParams,
}: {
  searchParams: Promise<LegacySearchParams>;
}) {
  const params = await searchParams;

  return (
    <RoadmapPage
      highlightDayId={typeof params.highlight === 'string' ? params.highlight : undefined}
    />
  );
}
