import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export const dynamic = 'force-dynamic';

/**
 * (auth) group layout — signed-in users never see the auth screens; they are
 * redirected home (where the learning app / blocked gate takes over).
 */
export default async function AuthGroupLayout({ children }: { children: React.ReactNode }) {
  const h = await headers();
  const session = await auth.api.getSession({ headers: h });
  if (session?.user) redirect('/');

  return (
    <div className="min-h-screen bg-ink">
      {/* Auth pages have no header chrome — float the theme switcher. */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      {children}
    </div>
  );
}
