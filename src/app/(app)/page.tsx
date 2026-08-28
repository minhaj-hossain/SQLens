import RoadmapPage from '@/components/roadmap/RoadmapPage';
import { legacyNavigationToRoute, LegacySearchParams } from '@/lib/legacy-routes';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Learning Path — 25 Days of Hands-On SQL',
  description:
    'Your visual roadmap through 25 days of SQL: mental models, guided practice tasks and independent challenges in the in-browser query engine.',
};

/**
 * `/` — the roadmap (Phase 3). Server component so it can honour legacy
 * lesson deep links (?day=N&stage=…) with a proper redirect before render;
 * see src/lib/legacy-routes.ts for the mapping table.
 */
export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<LegacySearchParams>;
}) {
  const params = await searchParams;
  const legacyRoute = legacyNavigationToRoute(params);
  if (legacyRoute) redirect(legacyRoute);

  return (
    <RoadmapPage
      highlightDayId={typeof params.highlight === 'string' ? params.highlight : undefined}
    />
  );
}
