import AppProviders from '@/components/providers/AppProviders';
import { UiChromeProvider } from '@/components/providers/UiChromeProvider';
import AppChrome from '@/components/layout/AppChrome';

/**
 * (app) group layout — owns the learning application shell (Phase 1):
 * providers (auth session, learning progress, SQL executor) at the root of
 * the group, then the chrome (Header + <main>) around every route inside.
 * Route content never mounts providers itself.
 */
export default function AppGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProviders>
      <UiChromeProvider>
        <AppChrome>{children}</AppChrome>
      </UiChromeProvider>
    </AppProviders>
  );
}
