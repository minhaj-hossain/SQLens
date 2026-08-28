'use client';
/**
 * UiChromeProvider — owns (app)-group chrome state that is shared between the
 * Header (layout level) and the page content:
 *   - Database Schema modal (opened from the header AND the learning path)
 *   - Roadmap modal (opened from the header AND the module completion view)
 *   - Roadmap scroll target (logo click in the header, "back to path" in pages)
 * The two modals are rendered by this provider so they live at the layout
 * level, above route content. Phase 1 of the App Router migration.
 */
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useLearning } from './LearningProgressProvider';

// Heavy, rarely-opened modals stay code-split out of the initial bundle.
const SchemaModal = dynamic(
  () => import('@/components/roadmap/SchemaModal').then((m) => m.SchemaModal),
);
const RoadmapModal = dynamic(
  () => import('@/components/roadmap/RoadmapModal').then((m) => m.RoadmapModal),
);

interface UiChromeContextValue {
  isSchemaModalOpen: boolean;
  openSchema: () => void;
  closeSchema: () => void;
  isRoadmapModalOpen: boolean;
  openRoadmap: () => void;
  closeRoadmap: () => void;
  roadmapScrollTarget: string | null;
  setRoadmapScrollTarget: (id: string | null) => void;
}

const UiChromeContext = createContext<UiChromeContextValue | null>(null);

export function UiChromeProvider({ children }: { children: React.ReactNode }) {
  // The roadmap modal needs learning state to highlight the current day and
  // to navigate when a day card is selected.
  const { userState, currentModuleId, handleSelectModule } = useLearning();

  const [isSchemaModalOpen, setIsSchemaModalOpen] = useState(false);
  const [isRoadmapModalOpen, setIsRoadmapModalOpen] = useState(false);
  const [roadmapScrollTarget, setRoadmapScrollTarget] = useState<string | null>(null);

  const openSchema = useCallback(() => setIsSchemaModalOpen(true), []);
  const closeSchema = useCallback(() => setIsSchemaModalOpen(false), []);
  const openRoadmap = useCallback(() => setIsRoadmapModalOpen(true), []);
  const closeRoadmap = useCallback(() => setIsRoadmapModalOpen(false), []);
  const setScrollTarget = useCallback((id: string | null) => setRoadmapScrollTarget(id), []);

  const value = useMemo(
    () => ({
      isSchemaModalOpen,
      openSchema,
      closeSchema,
      isRoadmapModalOpen,
      openRoadmap,
      closeRoadmap,
      roadmapScrollTarget,
      setRoadmapScrollTarget: setScrollTarget,
    }),
    [isSchemaModalOpen, openSchema, closeSchema, isRoadmapModalOpen, openRoadmap, closeRoadmap, roadmapScrollTarget, setScrollTarget],
  );

  return (
    <UiChromeContext.Provider value={value}>
      {children}
      <SchemaModal isOpen={isSchemaModalOpen} onClose={closeSchema} />
      <RoadmapModal
        isOpen={isRoadmapModalOpen}
        userState={userState}
        currentModuleId={currentModuleId}
        onSelectModule={handleSelectModule}
        onClose={closeRoadmap}
      />
    </UiChromeContext.Provider>
  );
}

export function useUiChrome(): UiChromeContextValue {
  const ctx = useContext(UiChromeContext);
  if (!ctx) throw new Error('useUiChrome must be used inside <UiChromeProvider>');
  return ctx;
}
