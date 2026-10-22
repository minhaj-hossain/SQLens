import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Day2CockpitView } from '../../src/components/learning/networking/cockpit/Day2CockpitView';
import TheoryView from '../../src/components/learn/TheoryView';
import { NET_02_MODULE } from '../../src/content/networking/modules/net-02';
import { ALL_MODULES } from '../../src/content/sql/curriculum-index';
import { PRISMA_MODULES } from '../../src/content/prisma/prisma-curriculum-index';
import { initialStateForTrack } from '../../src/lib/progress/track-storage';

// Mutable mock state
let currentTrack = 'networking';
let currentModId = 'net-02';
const mockMarkConceptComplete = vi.fn();
const mockMarkModuleComplete = vi.fn();
const mockBackToRoadmap = vi.fn();
const mockReplace = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: vi.fn(),
  }),
  usePathname: () => `/${currentTrack}/learn/${currentModId}/theory/shared-medium-collisions`,
  notFound: () => {
    throw new Error('NEXT_NOT_FOUND');
  },
}));

vi.mock('../../src/components/learn/use-track', () => ({
  useTrack: () => currentTrack,
  useTrackConceptId: () => 'shared-medium-collisions',
  useTrackCurriculum: () => ({
    track: currentTrack,
    getModuleById: (id: string) => {
      if (currentTrack === 'networking') return NET_02_MODULE;
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

describe('Day2CockpitView & Routing Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentTrack = 'networking';
    currentModId = 'net-02';
  });

  const concept = NET_02_MODULE.concepts[0];

  it('renders Day 2 header with Day 2 badge, title, and 4 concept navigation pills', () => {
    const html = renderToStaticMarkup(
      <Day2CockpitView
        module={NET_02_MODULE}
        concept={concept}
      />,
    );

    expect(html).toContain('DAY 2');
    expect(html).toContain('The Shared Wire');
    expect(html).toContain('C1');
    expect(html).toContain('C2');
    expect(html).toContain('C3');
    expect(html).toContain('C4');
  });

  it('renders the 4-Port Fast Ethernet Switch and 3 Workstations with MAC Badges on the 2D stage', () => {
    const html = renderToStaticMarkup(
      <Day2CockpitView
        module={NET_02_MODULE}
        concept={concept}
      />,
    );

    // Canvas & Switch
    expect(html).toContain('data-testid="physical-switch-canvas"');
    expect(html).toContain('4-Port Fast Ethernet Switch');
    expect(html).toContain('Star Topology');

    // Computers A, B, C
    expect(html).toContain('Computer A (You)');
    expect(html).toContain('Computer B (Teammate)');
    expect(html).toContain('Computer C (New Desk)');

    // Factory MAC Badges
    expect(html).toContain('MAC: 00-1A-2B-3C-4D-10');
    expect(html).toContain('MAC: 00-1A-2B-3C-4D-20');
    expect(html).toContain('MAC: 00-1A-2B-3C-4D-30');
  });

  it('renders the 5-Second Test card layout: LOOK, STORY, DO, WHY, EXPECT, MEANING', () => {
    const html = renderToStaticMarkup(
      <Day2CockpitView
        module={NET_02_MODULE}
        concept={concept}
      />,
    );

    expect(html).toContain('LOOK:');
    expect(html).toContain('DO:');
    expect(html).toContain('WHY:');
    expect(html).toContain('EXPECT:');
    expect(html).toContain('MEANING:');
  });

  it('renders the Day 2 Guided Windows Command Prompt with Computer A prompt', () => {
    const html = renderToStaticMarkup(
      <Day2CockpitView
        module={NET_02_MODULE}
        concept={concept}
      />,
    );

    expect(html).toContain('data-testid="day2-guided-terminal"');
    expect(html).toContain('Computer A • Command Prompt');
    expect(html).toContain('C:\\Users\\you&gt;');
  });

  it('routes networking Day 2 (net-02) to Day2CockpitView in TheoryView', () => {
    currentTrack = 'networking';
    currentModId = 'net-02';

    const html = renderToStaticMarkup(
      <TheoryView dayId="net-02" conceptId="shared-medium-collisions" />,
    );

    expect(html).toContain('data-testid="day2-cockpit-view"');
    expect(html).toContain('The Shared Wire');
    expect(html).not.toContain('SQL Lesson');
  });
});
