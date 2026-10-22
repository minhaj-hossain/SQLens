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

  it('renders Day 2 welcome page by default matching Day 1 flow', () => {
    const html = renderToStaticMarkup(
      <Day2CockpitView
        module={NET_02_MODULE}
        concept={concept}
      />,
    );

    expect(html).toContain('Day 2: The Shared Wire');
    expect(html).toContain('Start Day 2');
    expect(html).toContain('About 55 minutes');
  });

  it('renders Day 2 workbench header with progress rail and My Words button in normal mode', () => {
    const html = renderToStaticMarkup(
      <Day2CockpitView
        module={NET_02_MODULE}
        concept={concept}
        defaultMode="normal"
      />,
    );

    expect(html).toContain('Day 2');
    expect(html).toContain('Concept 1: Three computers need a switch');
    expect(html).toContain('aria-label="Progress Rail"');
    expect(html).toContain('My Words');
  });

  it('renders the 4-Port Switch and 3 Workstations with MAC Badges on the 2D stage in normal mode', () => {
    const html = renderToStaticMarkup(
      <Day2CockpitView
        module={NET_02_MODULE}
        concept={concept}
        defaultMode="normal"
      />,
    );

    // Canvas & Switch
    expect(html).toContain('data-testid="physical-switch-canvas"');
    expect(html).toContain('4-PORT ACCESS SWITCH');

    // Computers: Your computer, Friend's computer, Third computer
    expect(html).toContain('Your computer');
    expect(html).toContain('Friend’s computer');
    expect(html).toContain('Third computer');

    // Factory MAC Badges (RFC 7042 documentation addresses)
    expect(html).toContain('00-00-5e-00-53-01');
    expect(html).toContain('00-00-5e-00-53-02');
    expect(html).toContain('00-00-5e-00-53-03');
  });

  it('renders the 5-Second Test card layout: Look, Story, Your turn (DO/WHY/EXPECT)', () => {
    const html = renderToStaticMarkup(
      <Day2CockpitView
        module={NET_02_MODULE}
        concept={concept}
        defaultMode="normal"
      />,
    );

    expect(html).toContain('Look:');
    expect(html).toContain('Your turn:');
    expect(html).toContain('DO:');
    expect(html).toContain('WHY:');
    expect(html).toContain('EXPECT:');
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
