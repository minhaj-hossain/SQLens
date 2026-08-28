import { headers } from 'next/headers';
import { auth, db } from '@/lib/auth';
import AdminShell from '@/components/admin/AdminShell';
import AdminUsersPanel from '@/components/admin/AdminUsersPanel';

export const dynamic = 'force-dynamic';

/** /admin/users — user management (Phase 5 split). */
export default async function AdminUsersPage() {
  const h = await headers();
  const session = await auth.api.getSession({ headers: h });

  const doc = session?.user
    ? await db
        .collection('user')
        .findOne({ _id: new (await import('mongodb')).ObjectId(session.user.id) })
    : null;
  const adminName = doc?.name ?? session?.user?.name ?? session?.user?.email ?? 'Admin';

  return (
    <AdminShell adminName={adminName}>
      <AdminUsersPanel />
    </AdminShell>
  );
}
