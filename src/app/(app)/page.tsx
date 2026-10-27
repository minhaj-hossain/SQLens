import TrackSelector from '@/components/tracks/TrackSelector';
import { legacyNavigationToRoute, LegacySearchParams } from '@/lib/legacy-routes';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Click — Learn the data layer by running it',
  description:
    'When concepts finally click. Hands-on tracks. A real engine. All in your browser. Master SQL in 57 Days, Prisma ORM in 14 Days, and Computer Networking in 35 Days.',
};

/**
 * `/` — Click Homepage & Track Selector.
 *
 * Renders the modern Click homepage experience with interactive SVG architecture
 * diagrams for SQL, Prisma, and Networking, returning learner resume card, and multi-column footer.
 * Also preserves legacy `?day=N&stage=…` lesson deep links with proper redirects.
 */
export default async function TrackPickerPage({
  searchParams,
}: {
  searchParams: Promise<LegacySearchParams>;
}) {
  const params = await searchParams;
  const legacyRoute = legacyNavigationToRoute(params);
  if (legacyRoute) redirect(legacyRoute);

  return <TrackSelector />;
}
