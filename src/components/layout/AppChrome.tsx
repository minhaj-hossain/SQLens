'use client';
/**
 * AppChrome — the (app) route-group shell UI (Phase 3).
 * Renders the Header above route content and owns the blocked-account gate.
 * The header's view title and current-module context are derived from the
 * ROUTE (pathname), not from provider state — the URL is the position.
 */
import React from 'react';
import { usePathname } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import BlockedView from '@/components/auth/BlockedView';
import { getModuleById } from '@/content/curriculum-index';
import { getModuleDisplayLabel } from '@/lib/curriculum/module-order';
import { dayIdFromPathname } from '@/lib/learn-routes';
import { useLearning } from '@/components/providers/LearningProgressProvider';
import { useAuth } from '@/components/providers/AuthProvider';
import { useUiChrome } from '@/components/providers/UiChromeProvider';

export default function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { userState, resetProgress } = useLearning();
  const { user: authUser, isAuthPending, signOut } = useAuth();
  const { openSchema } = useUiChrome();

  // Route-derived context for the header.
  const pathDayId = dayIdFromPathname(pathname);
  const pathModule = pathDayId ? getModuleById(pathDayId) : undefined;
  const activeViewTitle = pathModule
    ? `${getModuleDisplayLabel(pathModule)}: ${pathModule.shortTitle}`
    : 'Learning Path';

  // A blocked account gets a dedicated full-page screen instead of the app.
  // (Server-side enforcement happens independently on every authenticated API.)
  if (!isAuthPending && authUser?.status === 'blocked') {
    return <BlockedView onSignOut={signOut} />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface-base text-on-surface font-body-md antialiased">
      <Header
        userState={userState}
        currentModule={pathModule ?? getModuleById('day-01')!}
        onResetProgress={() => {
          resetProgress();
          window.location.href = '/';
        }}
        onOpenSchemaModal={openSchema}
        user={authUser}
        isAuthPending={isAuthPending}
        onSignOut={signOut}
        activeViewTitle={activeViewTitle}
      />

      {/* Main Content Area — header is sticky (in flow), so no top offset needed */}
      <main className="relative w-full bg-surface-base min-h-screen">{children}</main>
    </div>
  );
}
