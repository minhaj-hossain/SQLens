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
import { useTrack, useTrackCurriculum } from '@/components/learn/use-track';
import { getModuleDisplayLabel } from '@/lib/curriculum/module-order';
import { trackModuleIdFromPathname, trackRoadmapUrl } from '@/lib/track-routes';
import { useLearning } from '@/components/providers/LearningProgressProvider';
import { useAuth } from '@/components/providers/AuthProvider';
import { useUiChrome } from '@/components/providers/UiChromeProvider';
import AnnouncementBanner from '@/components/ui/AnnouncementBanner';

export default function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHomepage = pathname === '/';
  const { userState } = useLearning();
  const { user: authUser, isAuthPending, signOut } = useAuth();
  const { openSchema } = useUiChrome();

  // Route-derived context for the header (Phase 2: track-aware).
  const track = useTrack();
  const { getModuleById, meta } = useTrackCurriculum();
  const pathDayId = trackModuleIdFromPathname(pathname);
  const pathModule = pathDayId ? getModuleById(pathDayId) : undefined;
  const activeViewTitle = pathModule
    ? `${getModuleDisplayLabel(pathModule)}: ${pathModule.shortTitle}`
    : track === 'sql'
      ? 'Learning Path'
      : `${meta.label} Path`;

  // A blocked account gets a dedicated full-page screen instead of the app.
  // (Server-side enforcement happens independently on every authenticated API.)
  if (!isAuthPending && authUser?.status === 'blocked') {
    return <BlockedView onSignOut={signOut} />;
  }

  return (
    <div
      className={`flex min-h-screen flex-col ${
        isHomepage ? 'bg-[#060b16]' : 'bg-surface-base text-on-surface font-body-md'
      } antialiased`}
    >
      <Header
        userState={userState}
        currentModule={pathModule ?? null}
        onOpenSchemaModal={openSchema}
        user={authUser}
        isAuthPending={isAuthPending}
        onSignOut={signOut}
        activeViewTitle={activeViewTitle}
        isMinimal={isHomepage}
      />

      <AnnouncementBanner />

      {/* Main Content Area — header is sticky (in flow), so no top offset needed */}
      <main className={`relative w-full ${isHomepage ? 'bg-[#060b16]' : 'bg-surface-base'} min-h-screen`}>
        {children}
      </main>
    </div>
  );
}
