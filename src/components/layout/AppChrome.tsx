'use client';
/**
 * AppChrome — the (app) route-group shell UI (Phase 1).
 * Renders the Header above route content and owns the blocked-account gate.
 * All learning state comes from the providers; no page state lives here.
 */
import React from 'react';
import { Header } from '@/components/layout/Header';
import BlockedView from '@/components/auth/BlockedView';
import { useLearning } from '@/components/providers/LearningProgressProvider';
import { useAuth } from '@/components/providers/AuthProvider';
import { useUiChrome } from '@/components/providers/UiChromeProvider';

export default function AppChrome({ children }: { children: React.ReactNode }) {
  const {
    userState,
    currentModuleId,
    setActiveTab,
    activeTab,
    currentModule,
    handleResetProgress,
  } = useLearning();
  const { user: authUser, isAuthPending, signOut } = useAuth();
  const { openSchema, setRoadmapScrollTarget } = useUiChrome();

  // A blocked account gets a dedicated full-page screen instead of the app.
  // (Server-side enforcement happens independently on every authenticated API.)
  if (!isAuthPending && authUser?.status === 'blocked') {
    return <BlockedView onSignOut={signOut} />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface-base text-on-surface font-body-md antialiased selection:bg-primary-container/30 selection:text-primary">
      <Header
        userState={userState}
        currentModule={currentModule}
        onResetProgress={handleResetProgress}
        onOpenSchemaModal={openSchema}
        onLogoClick={() => {
          setRoadmapScrollTarget(currentModuleId);
          setActiveTab('learning-path');
        }}
        user={authUser}
        isAuthPending={isAuthPending}
        onSignOut={signOut}
        activeViewTitle={activeTab === 'practice' ? `Day ${currentModule.day}: ${currentModule.shortTitle}` : 'Learning Path'}
      />

      {/* Main Content Area — header is sticky (in flow), so no top offset needed */}
      <main className="relative w-full bg-surface-base min-h-screen">{children}</main>
    </div>
  );
}
