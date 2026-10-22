import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { NetworkingCockpitView } from '../../src/components/learning/networking/cockpit/NetworkingCockpitView';
import TheoryView from '../../src/components/learn/TheoryView';
import { NET_01_MODULE } from '../../src/content/networking/modules/net-01';
import { ALL_MODULES } from '../../src/content/sql/curriculum-index';
import { PRISMA_MODULES } from '../../src/content/prisma/prisma-curriculum-index';
import type { UserLearningState } from '../../src/types/progress';
import { initialStateForTrack } from '../../src/lib/progress/track-storage';

// Mutable mock state
let currentTrack = 'networking';
const mockMarkConceptComplete = vi.fn();
const mockMarkModuleComplete = vi.fn();
const mockBackToRoadmap = vi.fn();
const mockReplace = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: vi.fn(),
  }),
  usePathname: () => `/${currentTrack}/learn/net-01/theory/direct-link-mac`,
  notFound: () => {
    throw new Error('NEXT_NOT_FOUND');
  },
}));

vi.mock('../../src/components/learn/use-track', () => ({
  useTrack: () => currentTrack,
  useTrackConceptId: () => 'direct-link-mac',
  useTrackCurriculum: () => ({
    track: currentTrack,
    getModuleById: (id: string) => {
      if (currentTrack === 'networking') return NET_01_MODULE;
      if (currentTrack === 'prisma') return PRISMA_MODULES[0];
      return ALL_MODULES[0];
    },
  }),
}));

vi.mock('../../src/components/providers/LearningProgressProvider', () => ({
  useLearning: () => ({
    userState: initialStateForTrack('networking'),
    isProgressReady: true,
    markConceptComplete: mockMarkConceptComplete,
    markModuleComplete: mockMarkModuleComplete,
  }),
}));

vi.mock('../../src/components/providers/SqlExecutorProvider', () => ({
  useSqlExecutor: () => ({
    executeQuery: vi.fn(),
    resetDatabase: vi.fn(),
  }),
}));

vi.mock('../../src/components/learn/use-learning-navigation', () => ({
  useLearningNavigation: () => ({
    backToRoadmap: mockBackToRoadmap,
    startPractice: vi.fn(),
  }),
}));

vi.mock('../../src/components/learn/use-step-back', () => ({
  useStepBack: () => ({
    backStep: null,
    goBack: vi.fn(),
  }),
}));

describe('NetworkingCockpitView & Routing Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentTrack = 'networking';
  });

  const concept = NET_01_MODULE.concepts[0];

  it('renders Day 1 welcome page by default matching pedagogy flow', () => {
    const html = renderToStaticMarkup(
      <NetworkingCockpitView
        module={NET_01_MODULE}
        concept={concept}
      />,
    );

    expect(html).toContain('Day 1: Your first connection');
    expect(html).toContain('Start Day 1');
    expect(html).toContain('About 55 minutes');
  });

  it('renders Day 1 workbench header with progress rail and My Words button in normal mode', () => {
    const html = renderToStaticMarkup(
      <NetworkingCockpitView
        module={NET_01_MODULE}
        concept={concept}
        defaultMode="normal"
      />,
    );

    expect(html).toContain('Day 1');
    expect(html).toContain('Concept 1: Connection');
    expect(html).toContain('aria-label="Progress Rail"');
    expect(html).toContain('My Words');
  });

  it('renders the 2-computer physical connection canvas on stage in normal mode', () => {
    const html = renderToStaticMarkup(
      <NetworkingCockpitView
        module={NET_01_MODULE}
        concept={concept}
        defaultMode="normal"
      />,
    );

    expect(html).toContain('data-testid="physical-connection-canvas"');
    expect(html).toContain('Your computer');
    expect(html).toContain("Friend&#x27;s computer");
  });

  it('renders the 5-Second Test card layout: Look and Story', () => {
    const html = renderToStaticMarkup(
      <NetworkingCockpitView
        module={NET_01_MODULE}
        concept={concept}
        defaultMode="normal"
      />,
    );

    expect(html).toContain('Look:');
    expect(html).toContain('The left one is yours');
  });

  it('routes networking Day 1 to NetworkingCockpitView in TheoryView', () => {
    currentTrack = 'networking';
    const html = renderToStaticMarkup(
      <TheoryView dayId="net-01" conceptId="direct-link-mac" />,
    );

    expect(html).toContain('data-testid="networking-cockpit-view"');
    expect(html).toContain('Day 1: Your first connection');
    expect(html).not.toContain('SQL Lesson');
  });

  it('leaves SQL track on ConceptLessonView with SQL chrome', () => {
    currentTrack = 'sql';
    const html = renderToStaticMarkup(
      <TheoryView dayId="day-01" conceptId="select-and-from" />,
    );

    expect(html).toContain('SQL Lesson');
    expect(html).not.toContain('Your first connection');
  });
});
