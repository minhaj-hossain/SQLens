import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * (auth) group layout — signed-in users never see the auth screens; they are
 * redirected home (where the learning app / blocked gate takes over).
 */
export default async function AuthGroupLayout({ children }: { children: React.ReactNode }) {
  const h = await headers();
  const session = await auth.api.getSession({ headers: h });
  if (session?.user) redirect('/');

  return <div className="min-h-screen bg-ink">{children}</div>;
}
