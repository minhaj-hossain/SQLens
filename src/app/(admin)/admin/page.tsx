import { headers } from 'next/headers';
import { auth, db } from '@/lib/auth';
import AdminDashboard from '@/components/admin/AdminDashboard';

export const dynamic = 'force-dynamic';

/**
 * /admin — Overview dashboard. Role protection lives in the (admin) group
 * layout; this page only reads the admin's display name.
 */
export default async function AdminPage() {
  const h = await headers();
  const session = await auth.api.getSession({ headers: h });

  const doc = session?.user
    ? await db
        .collection('user')
        .findOne({ _id: new (await import('mongodb')).ObjectId(session.user.id) })
    : null;

  return (
    <AdminDashboard
      adminName={doc?.name ?? session?.user?.name ?? session?.user?.email ?? 'Admin'}
    />
  );
}
