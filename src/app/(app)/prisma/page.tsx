import RoadmapPage from '@/components/roadmap/RoadmapPage';
import { LegacySearchParams } from '@/lib/legacy-routes';
import { TRACK_META } from '@/types/track';

export const metadata = {
  title: 'Prisma Learning Path — 14 Days of Prisma ORM',
  description:
    'Your visual roadmap through 14 Days of Prisma ORM: schema modeling, type-safe client queries, relations, transactions, migrations and production data-layer patterns.',
  alternates: { canonical: '/prisma' },
};

/**
 * `/prisma` — the Prisma track roadmap (Phase 2).
 *
 * Identical surface to `/sql`; the ONLY difference is the URL, which
 * `useTrack()` reads to swap in the Prisma curriculum and milestones
 * (`PRISMA_MODULES` / `PRISMA_ROADMAP_MILESTONES` via src/tracks/registry.ts).
 */
export default async function PrismaRoadmapPage({
  searchParams,
}: {
  searchParams: Promise<LegacySearchParams>;
}) {
  const params = await searchParams;

  return (
    <RoadmapPage
      highlightDayId={
        typeof params.highlight === 'string' ? params.highlight : TRACK_META.prisma.initialModuleId
      }
    />
  );
}
