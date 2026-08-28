'use client';
/**
 * UiChromeProvider — owns (app)-group chrome state that is shared between the
 * Header (layout level) and the page content:
 *   - Database Schema modal (opened from the header AND the learning path)
 *   - Roadmap modal (opened from the header… and rendered at layout level)
 * Phase 3: the roadmap modal's day selection navigates to /learn routes, and
 * the scroll-target plumbing moved to the `?highlight=` URL param on `/`.
 */
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { useLearning } from './LearningProgressProvider';
import { useLearningNavigation } from '@/components/learn/use-learning-navigation';
import { dayIdFromPathname } from '@/lib/learn-routes';

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
}

const UiChromeContext = createContext<UiChromeContextValue | null>(null);

export function UiChromeProvider({ children }: { children: React.ReactNode }) {
  // The roadmap modal needs learning state to highlight the current day and
  // to navigate when a day card is selected. The "current day" is derived
  // from the ROUTE (null on the roadmap itself → falls back to day-01).
  const { userState } = useLearning();
  const { selectModuleAndConcept } = useLearningNavigation();
  const pathname = usePathname();
  const currentModuleId = dayIdFromPathname(pathname) ?? 'day-01';

  const [isSchemaModalOpen, setIsSchemaModalOpen] = useState(false);
  const [isRoadmapModalOpen, setIsRoadmapModalOpen] = useState(false);

  const openSchema = useCallback(() => setIsSchemaModalOpen(true), []);
  const closeSchema = useCallback(() => setIsSchemaModalOpen(false), []);
  const openRoadmap = useCallback(() => setIsRoadmapModalOpen(true), []);
  const closeRoadmap = useCallback(() => setIsRoadmapModalOpen(false), []);

  const value = useMemo(
    () => ({ isSchemaModalOpen, openSchema, closeSchema, isRoadmapModalOpen, openRoadmap, closeRoadmap }),
    [isSchemaModalOpen, openSchema, closeSchema, isRoadmapModalOpen, openRoadmap, closeRoadmap],
  );

  return (
    <UiChromeContext.Provider value={value}>
      {children}
      <SchemaModal isOpen={isSchemaModalOpen} onClose={closeSchema} />
      <RoadmapModal
        isOpen={isRoadmapModalOpen}
        userState={userState}
        currentModuleId={currentModuleId}
        onSelectModule={(moduleId: string) => {
          closeRoadmap();
          selectModuleAndConcept(moduleId, undefined, 'theory');
        }}
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
