import RoadmapPage from '@/components/roadmap/RoadmapPage';
import { LegacySearchParams } from '@/lib/legacy-routes';
import { TRACK_META } from '@/types/track';

export const metadata = {
  title: 'Networking Fundamentals — Local Links to the Global Internet',
  description:
    'Your visual roadmap through Networking Fundamentals: direct links, shared media, Layer 2 switching, MAC learning, and packet routing.',
  alternates: { canonical: '/networking' },
};

/**
 * `/networking` — the Networking track roadmap.
 */
export default async function NetworkingRoadmapPage({
  searchParams,
}: {
  searchParams: Promise<LegacySearchParams>;
}) {
  const params = await searchParams;

  return (
    <RoadmapPage
      highlightDayId={
        typeof params.highlight === 'string' ? params.highlight : TRACK_META.networking.initialModuleId
      }
    />
  );
}
