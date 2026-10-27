import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { LearningPathView } from '../../src/components/roadmap/LearningPathView';
import { initialStateForTrack } from '../../src/lib/progress/storage';

const mockSqlModule = {
  id: 'day-01',
  day: 1,
  title: 'Day 1 — Select Queries',
  shortTitle: 'Select Queries',
  milestoneId: 'sql-m1',
  concepts: [
    {
      id: 'select-from',
      title: 'SELECT and FROM',
      shortDescription: 'Query columns from tables',
      tasks: [{ id: 'task-1' }],
    },
  ],
};

const mockSqlMilestone = {
  id: 'sql-m1',
  number: 1,
  title: 'Stage 1',
  subtitle: 'Single Table Foundations',
  daysRange: 'Days 1-7',
  moduleIds: ['day-01'],
};

const mockPrismaModule = {
  id: 'prisma-01',
  day: 1,
  title: 'Day 1 — Schema Foundations',
  shortTitle: 'Schema Foundations',
  milestoneId: 'prisma-m1',
  concepts: [
    {
      id: 'model-declaration',
      title: 'Model Declaration',
      shortDescription: 'Define models and scalar types',
      tasks: [{ id: 'task-p1' }],
    },
  ],
};

const mockPrismaMilestone = {
  id: 'prisma-m1',
  number: 1,
  title: 'Stage 1',
  subtitle: 'Schema & Query Foundations',
  daysRange: 'Days 1-4',
  moduleIds: ['prisma-01'],
};

let currentMockTrack: 'sql' | 'prisma' = 'sql';

vi.mock('../../src/components/learn/use-track', () => ({
  useTrackCurriculum: () => {
    if (currentMockTrack === 'prisma') {
      return {
        track: 'prisma',
        meta: { basePath: '/prisma', label: 'Prisma' },
        modules: [mockPrismaModule],
        milestones: [mockPrismaMilestone],
        getModuleById: (id: string) => (id === 'prisma-01' ? mockPrismaModule : undefined),
      };
    }
    return {
      track: 'sql',
      meta: { basePath: '/sql', label: 'SQL' },
      modules: [mockSqlModule],
      milestones: [mockSqlMilestone],
      getModuleById: (id: string) => (id === 'day-01' ? mockSqlModule : undefined),
    };
  },
}));

describe('LearningPathView Smooth Scroll & Strict Theme Separation', () => {
  it('renders SQL track with semantic theme tokens, scroll-mt-48 leaf anchors, and zero hardcoded color leaks', () => {
    currentMockTrack = 'sql';
    const userState = initialStateForTrack('sql');

    const html = renderToStaticMarkup(
      <LearningPathView
        userState={userState}
        currentModuleId="day-01"
        currentConceptId="select-from"
        onSelectModuleAndConcept={vi.fn()}
        onOpenSchema={vi.fn()}
      />,
    );

    // Leaf anchor wrapper must support direct hash navigation (#day-1) with scroll offset
    expect(html).toContain('id="day-1"');
    expect(html).toContain('scroll-mt-48');

    // Stage card and leaf button IDs
    expect(html).toContain('id="stage-card-day-01"');
    expect(html).toContain('id="leaf-day-01"');

    // Strict theme tokens for pure palette separation
    expect(html).toContain('bg-func');
    expect(html).toContain('text-ink');
    expect(html).toContain('border-func');
    expect(html).toContain('target:ring-(--accent-line)');
    expect(html).toContain('border-func/35');
    expect(html).toContain('shadow-[0_0_28px_var(--accent-dim)]');

    // Smooth floating circle popover card with theme tokens
    expect(html).toContain('data-testid="circle-tooltip"');
    expect(html).toContain('role="tooltip"');
    expect(html).toContain('bg-surface-3');

    // Neither theme palette colors should be hardcoded in the markup
    expect(html).not.toContain('#f4c430');
    expect(html).not.toContain('#38bdf8');
  });

  it('renders Prisma track with semantic theme tokens, scroll-mt-48 leaf anchors, and zero hardcoded color leaks', () => {
    currentMockTrack = 'prisma';
    const userState = initialStateForTrack('prisma');

    const html = renderToStaticMarkup(
      <LearningPathView
        userState={userState}
        currentModuleId="prisma-01"
        currentConceptId="model-declaration"
        onSelectModuleAndConcept={vi.fn()}
        onOpenSchema={vi.fn()}
      />,
    );

    // Leaf anchor wrapper must support direct hash navigation (#day-1) with scroll offset
    expect(html).toContain('id="day-1"');
    expect(html).toContain('scroll-mt-48');

    // Stage card and leaf button IDs
    expect(html).toContain('id="stage-card-prisma-01"');
    expect(html).toContain('id="leaf-prisma-01"');

    // Strict theme tokens for pure palette separation
    expect(html).toContain('bg-func');
    expect(html).toContain('text-ink');
    expect(html).toContain('border-func');
    expect(html).toContain('target:ring-(--accent-line)');
    expect(html).toContain('border-func/35');
    expect(html).toContain('shadow-[0_0_28px_var(--accent-dim)]');

    // Smooth floating circle popover card with theme tokens
    expect(html).toContain('data-testid="circle-tooltip"');
    expect(html).toContain('role="tooltip"');
    expect(html).toContain('bg-surface-3');

    // Neither theme palette colors should be hardcoded in the markup
    expect(html).not.toContain('#f4c430');
    expect(html).not.toContain('#38bdf8');
  });
});
