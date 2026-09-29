import TrackSelector from '@/components/tracks/TrackSelector';
import { legacyNavigationToRoute, LegacySearchParams } from '@/lib/legacy-routes';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'SQLens — Choose Your Learning Track',
  description:
    'Two hands-on data tracks in one visual learning system: 57 Days of SQL, or 14 Days of Prisma ORM. Mental models, guided practice and independent challenges in the browser.',
};

/**
 * `/` — the TRACK SELECTOR (Phase 2).
 *
 * The roadmap that used to live here is now `/sql` (SQL) and `/prisma`
 * (Prisma). This page stays a server component for the same reason it always
 * was one: it must honour legacy `?day=N&stage=…` lesson deep links with a
 * proper redirect before render (see src/lib/legacy-routes.ts, which now
 * targets the SQL track's namespaced URLs).
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
