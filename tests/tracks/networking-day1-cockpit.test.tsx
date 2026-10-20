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

  it('renders Ticket #1042 incident banner and workstation telemetry header', () => {
    const html = renderToStaticMarkup(
      <NetworkingCockpitView
        module={NET_01_MODULE}
        concept={concept}
      />,
    );

    // Incident Banner
    expect(html).toContain('TICKET #1042');
    expect(html).toContain('Host A Cannot Reach Default Gateway (192.168.1.1)');
    expect(html).toContain('Acme-PC-01');
    expect(html).toContain('192.168.1.10/24');
    // Initial physical state: disconnected
    expect(html).toContain('ETH0: NO CARRIER');
  });

  it('renders the Senior Systems Engineer console with Beat 1 instructions', () => {
    const html = renderToStaticMarkup(
      <NetworkingCockpitView
        module={NET_01_MODULE}
        concept={concept}
      />,
    );

    expect(html).toContain('Senior Systems Engineer');
    expect(html).toContain('Step 1 of 8');
    // Beat 1 instruction
    expect(html).toContain('ping 192.168.1.1');
    expect(html).toContain('Action: ping 192.168.1.1');
  });

  it('renders the Physical Layer 1 Topology Canvas and Windows Command Prompt', () => {
    const html = renderToStaticMarkup(
      <NetworkingCockpitView
        module={NET_01_MODULE}
        concept={concept}
      />,
    );

    // Physical canvas
    expect(html).toContain('Acme Office • Physical Layer 1 Canvas');
    expect(html).toContain('Acme-SW-01');
    expect(html).toContain('Acme-RTR-01');

    // Windows Command Prompt
    expect(html).toContain('Acme-PC-01 Command Prompt');
    expect(html).toContain('C:\\Users\\admin&gt;');
  });

  it('renders the collapsible Technician Diagnostic Log with verified facts', () => {
    const html = renderToStaticMarkup(
      <NetworkingCockpitView
        module={NET_01_MODULE}
        concept={concept}
      />,
    );

    expect(html).toContain("Technician&#x27;s Diagnostic Log");
  });

  it('routes networking Day 1 to NetworkingCockpitView in TheoryView', () => {
    currentTrack = 'networking';
    const html = renderToStaticMarkup(
      <TheoryView dayId="net-01" conceptId="direct-link-mac" />,
    );

    expect(html).toContain('data-testid="networking-cockpit-view"');
    expect(html).toContain('TICKET #1042');
    // Does NOT render SQL lesson header
    expect(html).not.toContain('SQL Lesson');
  });

  it('leaves SQL track on ConceptLessonView with SQL chrome', () => {
    currentTrack = 'sql';
    const html = renderToStaticMarkup(
      <TheoryView dayId="day-01" conceptId="select-and-from" />,
    );

    // SQL track renders ConceptLessonView with SQL lesson header
    expect(html).toContain('SQL Lesson');
    expect(html).not.toContain('TICKET #1042');
  });
});
