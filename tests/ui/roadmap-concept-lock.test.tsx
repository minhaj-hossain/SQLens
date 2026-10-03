import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { LearningPathView } from '../../src/components/roadmap/LearningPathView';
import { initialStateForTrack } from '../../src/lib/progress/storage';

const mockModule = {
  id: 'day-01',
  day: 1,
  title: 'Fundamentals of Relational Databases',
  shortTitle: 'Fundamentals',
  milestoneId: 'm1',
  concepts: [
    {
      id: 'tables-and-rows',
      title: 'What is a Database?',
      shortDescription: 'Tables, rows, and columns',
      tasks: [{ id: 'task-1' }],
    },
    {
      id: 'relational-model',
      title: 'Relational Model',
      shortDescription: 'Primary and foreign keys',
      tasks: [{ id: 'task-2' }],
    },
  ],
};

const mockMilestone = {
  id: 'm1',
  number: 1,
  title: 'Stage 1',
  subtitle: 'The Basics',
  daysRange: 'Days 1-5',
  moduleIds: ['day-01'],
};

vi.mock('../../src/components/learn/use-track', () => ({
  useTrackCurriculum: () => ({
    track: 'sql',
    meta: { basePath: '/sql', label: 'SQL' },
    modules: [mockModule],
    milestones: [mockMilestone],
    getModuleById: (id: string) => (id === 'day-01' ? mockModule : undefined),
  }),
}));

describe('LearningPathView Callout Concept Lock Interaction', () => {
  it('renders locked concepts with lock styling, title, and lock icon when previous concept is incomplete', () => {
    const userState = initialStateForTrack('sql');
    const onSelect = vi.fn();
    const onOpenSchema = vi.fn();

    const html = renderToStaticMarkup(
      <LearningPathView
        userState={userState}
        currentModuleId="day-01"
        currentConceptId="tables-and-rows"
        onSelectModuleAndConcept={onSelect}
        onOpenSchema={onOpenSchema}
      />
    );

    // Concept 1 (active) is rendered and not locked
    expect(html).toContain('What is a Database?');
    // Concept 2 is locked
    expect(html).toContain('Relational Model');
    expect(html).toContain('locked — complete earlier concepts first');
    expect(html).toContain('cursor-not-allowed');
    expect(html).toContain('opacity-60');
  });

  it('renders completed concepts with checkmark and unlocked next concept', () => {
    const userState = {
      ...initialStateForTrack('sql'),
      completedConcepts: {
        'tables-and-rows': { conceptId: 'tables-and-rows', moduleId: 'day-01' },
      },
    };
    const onSelect = vi.fn();
    const onOpenSchema = vi.fn();

    const html = renderToStaticMarkup(
      <LearningPathView
        userState={userState}
        currentModuleId="day-01"
        currentConceptId="relational-model"
        onSelectModuleAndConcept={onSelect}
        onOpenSchema={onOpenSchema}
      />
    );

    // Concept 1 is completed
    expect(html).toContain('✓');
    // Concept 2 is now current (not locked)
    expect(html).toContain('Relational Model');
    expect(html).not.toContain('Relational Model (locked');
  });
});
