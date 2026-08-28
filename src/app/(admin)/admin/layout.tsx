import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth, db } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * (admin) group layout — the role gate for EVERY admin route (Phase 1).
 * The role check reads the MongoDB `user` document via the trusted Better Auth
 * session — never a client-supplied value — so hitting any /admin/* page as an
 * anonymous user or regular user yields a redirect, not a render. (The admin
 * API re-verifies independently on every request.)
 */
export default async function AdminGroupLayout({ children }: { children: React.ReactNode }) {
  const h = await headers();
  const session = await auth.api.getSession({ headers: h });

  if (!session?.user) redirect('/');

  // Re-read from the DB so a revoked/demoted admin is caught mid-session.
  const doc = await db
    .collection('user')
    .findOne({ _id: new (await import('mongodb')).ObjectId(session.user.id) });
  const status = (doc?.status as string | undefined) ?? 'active';
  if ((doc?.role as string | undefined) !== 'admin' || status !== 'active') {
    redirect('/');
  }

  return <>{children}</>;
}
