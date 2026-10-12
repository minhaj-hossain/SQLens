import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { LearningPathView } from '../../src/components/roadmap/LearningPathView';
import { initialStateForTrack } from '../../src/lib/progress/storage';
import ResetProgressModal from '../../src/components/ui/ResetProgressModal';

const mockNetworkingModule = {
  id: 'net-01',
  curriculumOrder: 1,
  day: 1,
  title: 'End-to-End Packet Journey',
  shortTitle: 'Packet Journey',
  milestoneId: 'm1',
  concepts: [
    {
      id: 'net-01-c1',
      title: 'Direct Ethernet Links & Media',
      shortDescription: 'Bits over physical wire',
      tasks: [{ id: 'task-1' }],
    },
    {
      id: 'net-01-c2',
      title: 'Packet Encapsulation & Headers',
      shortDescription: 'L2 frames, L3 packets, L4 segments',
      tasks: [{ id: 'task-2' }],
    },
  ],
  challenge: {
    id: 'ch-net-01',
    title: 'Wiring the First Hop',
    tasks: [{ id: 'ch-task-1' }],
  },
};

const mockMilestone = {
  id: 'm1',
  number: 1,
  title: 'Local Links to Switched LANs',
  subtitle: 'Direct Links & Layer 2',
  daysRange: 'Modules 1–4',
  moduleIds: ['net-01'],
};

vi.mock('../../src/components/learn/use-track', () => ({
  useTrackCurriculum: () => ({
    track: 'networking',
    meta: { id: 'networking', basePath: '/networking', label: 'Networking' },
    modules: [mockNetworkingModule],
    milestones: [mockMilestone],
    getModuleById: (id: string) => (id === 'net-01' ? mockNetworkingModule : undefined),
  }),
}));

describe('LearningPathView Networking Track Appearance & Routing', () => {
  it('renders dedicated Networking Hero with Protocol Stack HUD and zero blue shades', () => {
    const userState = initialStateForTrack('networking');
    const onSelect = vi.fn();
    const onOpenSchema = vi.fn();

    const html = renderToStaticMarkup(
      <LearningPathView
        userState={userState}
        currentModuleId="net-01"
        currentConceptId="net-01-c1"
        onSelectModuleAndConcept={onSelect}
        onOpenSchema={onOpenSchema}
      />
    );

    // Hero title and identity
    expect(html).toContain('NETWORKING SUITE');
    expect(html).toContain('PROTOCOL ARCHITECTURE');
    expect(html).toContain('Master computer networking from');
    expect(html).toContain('raw ethernet frames');
    expect(html).toContain('LINK 100BASE-TX: ACTIVE');

    // Protocol stack layers
    expect(html).toContain('L7');
    expect(html).toContain('L4');
    expect(html).toContain('L3');
    expect(html).toContain('L2');
    expect(html).toContain('L1');

    // Does NOT render SQL hero elements
    expect(html).not.toContain('SELECT *');
    expect(html).not.toContain('COMPLETE');
    expect(html).not.toContain('SQL / CURRICULUM ROADMAP');

    // Verified NO blue Tailwind classes are in the rendered output
    expect(html).not.toContain('bg-blue-');
    expect(html).not.toContain('text-blue-');
    expect(html).not.toContain('border-blue-');
    expect(html).not.toContain('bg-sky-');
    expect(html).not.toContain('text-sky-');
  });

  it('renders module circle with only the number and not "Module 1"', () => {
    const userState = initialStateForTrack('networking');
    const onSelect = vi.fn();
    const onOpenSchema = vi.fn();

    const html = renderToStaticMarkup(
      <LearningPathView
        userState={userState}
        currentModuleId="net-01"
        currentConceptId="net-01-c1"
        onSelectModuleAndConcept={onSelect}
        onOpenSchema={onOpenSchema}
      />
    );

    // Module circle button renders bare number "1"
    expect(html).toContain('id="leaf-net-01"');
    // Leaf content should contain >1< inside button, NOT >Module 1<
    expect(html).not.toContain('>Module 1<');
    expect(html).not.toContain('>Day 1<');
  });

  it('renders Reset Networking Progress in footer', () => {
    const userState = initialStateForTrack('networking');
    const onSelect = vi.fn();
    const onOpenSchema = vi.fn();
    const onReset = vi.fn();

    const html = renderToStaticMarkup(
      <LearningPathView
        userState={userState}
        currentModuleId="net-01"
        currentConceptId="net-01-c1"
        onSelectModuleAndConcept={onSelect}
        onOpenSchema={onOpenSchema}
        onResetClick={onReset}
      />
    );

    expect(html).toContain('Reset Networking Progress');
    expect(html).toContain('Networking — 0% through the path.');
    expect(html).not.toContain('Reset SQL Progress');
  });
});

describe('ResetProgressModal Networking Adaptivity', () => {
  it('renders Reset Networking Progress title and module-centric wording', () => {
    const html = renderToStaticMarkup(
      <ResetProgressModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirmReset={vi.fn()}
        currentModule={mockNetworkingModule as any}
      />
    );

    expect(html).toContain('Reset Networking Progress');
    expect(html).toContain('Reset Entire Track (Modules 1–1)');
    expect(html).toContain('interactive simulation tasks');
    expect(html).not.toContain('practice queries');
  });
});
