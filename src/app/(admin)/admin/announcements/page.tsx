import AdminShell from '@/components/admin/AdminShell';
import AdminAnnouncementsPanel from '@/components/admin/AdminAnnouncementsPanel';
import { auth, db } from '@/lib/auth';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

export default async function AdminAnnouncementsPage() {
  const h = await headers();
  const session = await auth.api.getSession({ headers: h });
  const doc = session?.user?.id
    ? await db
        .collection('user')
        .findOne({ _id: new (await import('mongodb')).ObjectId(session.user.id) })
    : null;

  return (
    <AdminShell adminName={(doc?.name as string | undefined) ?? 'Admin'}>
      <AdminAnnouncementsPanel />
    </AdminShell>
  );
}
