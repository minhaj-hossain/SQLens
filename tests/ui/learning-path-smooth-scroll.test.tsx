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

describe('LearningPathView Smooth Scroll & Track Softness', () => {
  it('renders SQL track with warm gold accents, scroll-mt-48 leaf anchors, and target rings', () => {
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

    // SQL warm gold accents (#f4c430)
    expect(html).toContain('bg-[#f4c430]');
    expect(html).toContain('target:ring-[#f4c430]/60');
    expect(html).toContain('border-[#f4c430]/35');
    expect(html).toContain('shadow-[0_0_28px_rgba(244,196,48,0.08)]');

    // Should NOT contain Prisma sky blue accent (#38bdf8) in SQL track
    expect(html).not.toContain('bg-[#38bdf8]');
    expect(html).not.toContain('target:ring-[#38bdf8]/60');
  });

  it('renders Prisma track with electric sky accents, scroll-mt-48 leaf anchors, and target rings', () => {
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

    // Prisma electric sky accents (#38bdf8)
    expect(html).toContain('bg-[#38bdf8]');
    expect(html).toContain('target:ring-[#38bdf8]/60');
    expect(html).toContain('border-[#38bdf8]/35');
    expect(html).toContain('shadow-[0_0_28px_rgba(56,189,248,0.08)]');

    // Should NOT contain SQL gold accent (#f4c430) in Prisma track
    expect(html).not.toContain('bg-[#f4c430]');
    expect(html).not.toContain('target:ring-[#f4c430]/60');
  });
});
