import { headers } from 'next/headers';
import { auth, db } from '@/lib/auth';
import AdminShell from '@/components/admin/AdminShell';
import AdminModulesPanel from '@/components/admin/AdminModulesPanel';

export const dynamic = 'force-dynamic';

/** /admin/modules — curriculum & scheduling controls (Phase 5 split). */
export default async function AdminModulesPage() {
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
      <AdminModulesPanel />
    </AdminShell>
  );
}
