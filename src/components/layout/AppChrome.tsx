'use client';
/**
 * AppChrome — the (app) route-group shell UI (Phase 3).
 * Renders the Header above route content and owns the blocked-account gate.
 * The header's view title and current-module context are derived from the
 * ROUTE (pathname), not from provider state — the URL is the position.
 */
import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import BlockedView from '@/components/auth/BlockedView';
import { getModuleById } from '@/content/curriculum-index';
import { getModuleDisplayLabel } from '@/lib/curriculum/module-order';
import { dayIdFromPathname } from '@/lib/learn-routes';
import { useLearning } from '@/components/providers/LearningProgressProvider';
import { useAuth } from '@/components/providers/AuthProvider';
import { useUiChrome } from '@/components/providers/UiChromeProvider';
import AnnouncementBanner from '@/components/ui/AnnouncementBanner';

export default function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  // Batch 5: resetProgress now THROWS when the tombstone write fails, and
  // exposes resetError. Only navigate after the server ack — navigating first
  // (push + refresh) remounts + GETs while the cloud still holds old progress
  // and resurrects it. On failure we stay on the page; the modal shows the
  // error with a retry.
  const { userState, resetProgress, resetError } = useLearning();
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
        currentModule={pathModule ?? null}
        onResetProgress={async (mode?: 'all' | 'module', moduleId?: string) => {
          // Await the tombstone ack BEFORE navigating: resetProgress throws
          // when the server write fails, so push/refresh only run on commit.
          if (mode === 'module' && moduleId) {
            await resetProgress({ moduleId });
            router.refresh();
          } else {
            await resetProgress();
            router.push('/');
            router.refresh();
          }
        }}
        resetError={resetError}
        onOpenSchemaModal={openSchema}
        user={authUser}
        isAuthPending={isAuthPending}
        onSignOut={signOut}
        activeViewTitle={activeViewTitle}
      />

      <AnnouncementBanner />

      {/* Main Content Area — header is sticky (in flow), so no top offset needed */}
      <main className="relative w-full bg-surface-base min-h-screen">{children}</main>
    </div>
  );
}
