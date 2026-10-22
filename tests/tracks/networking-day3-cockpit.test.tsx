import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Day3CockpitView } from '../../src/components/learning/networking/cockpit/Day3CockpitView';
import TheoryView from '../../src/components/learn/TheoryView';
import { NET_03_MODULE } from '../../src/content/networking/modules/net-03';
import { ALL_MODULES } from '../../src/content/sql/curriculum-index';
import { PRISMA_MODULES } from '../../src/content/prisma/prisma-curriculum-index';
import { initialStateForTrack } from '../../src/lib/progress/track-storage';

// Mutable mock state
let currentTrack = 'networking';
let currentModId = 'net-03';
const mockMarkConceptComplete = vi.fn();
const mockMarkModuleComplete = vi.fn();
const mockBackToRoadmap = vi.fn();
const mockReplace = vi.fn();
const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: mockPush,
  }),
  usePathname: () => `/${currentTrack}/learn/${currentModId}/theory/mac-table-and-forwarding`,
  notFound: () => {
    throw new Error('NEXT_NOT_FOUND');
  },
}));

vi.mock('../../src/components/learn/use-track', () => ({
  useTrack: () => currentTrack,
  useTrackConceptId: () => 'mac-table-and-forwarding',
  useTrackCurriculum: () => ({
    track: currentTrack,
    getModuleById: (id: string) => {
      if (currentTrack === 'networking') return NET_03_MODULE;
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

describe('Day3CockpitView & Routing Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentTrack = 'networking';
    currentModId = 'net-03';
  });

  const concept = NET_03_MODULE.concepts[0];

  it('renders Day 3 welcome screen in defaultMode="welcome"', () => {
    const html = renderToStaticMarkup(
      <Day3CockpitView
        module={NET_03_MODULE}
        concept={concept}
        defaultMode="welcome"
      />
    );

    expect(html).toContain('The Router &amp; The Default Gateway');
    expect(html).toContain('Enter Lesson Workbench');
    expect(html).toContain('Day 3: The Outside World');
  });

  it('renders normal workbench with 62% Stage and 38% Cockpit in defaultMode="normal"', () => {
    const html = renderToStaticMarkup(
      <Day3CockpitView
        module={NET_03_MODULE}
        concept={concept}
        defaultMode="normal"
      />
    );

    expect(html).toContain('Concept 1: The dead end across the street');
    expect(html).toContain('Two separate streets');
    expect(html).toContain('Physical Divide');
    expect(html).toContain('Green Street:');
    expect(html).toContain('Orange Street:');
    expect(html).toContain('My Words');
  });

  it('wires TheoryView to render Day3CockpitView when track="networking" and mod.id="net-03"', () => {
    const html = renderToStaticMarkup(
      <TheoryView dayId="net-03" conceptId="mac-table-and-forwarding" />
    );

    expect(html).toContain('The Router &amp; The Default Gateway');
    expect(html).toContain('Enter Lesson Workbench');
  });
});
