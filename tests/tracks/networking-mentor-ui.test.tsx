import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { TermChip } from '../../src/components/learning/networking/mentor/TermChip';
import { SpotlightLayer } from '../../src/components/learning/networking/mentor/SpotlightLayer';
import { MentorDialoguePanel } from '../../src/components/learning/networking/mentor/MentorDialoguePanel';
import { TicketStudio } from '../../src/components/learning/networking/mentor/TicketStudio';
import { MentorLessonStage } from '../../src/components/learning/networking/mentor/MentorLessonStage';
import { initMentorState } from '../../src/components/learning/networking/mentor/useMentorScript';
import type { MentorScript, TicketScene } from '../../src/types/networking-curriculum';
import type { Concept } from '../../src/types/curriculum';

describe('Mentor Mode: UI Shell & Components (Static Rendering & State Parity)', () => {
  const mockScript: MentorScript = {
    moduleId: 'net-03',
    conceptId: 'mac-table-and-forwarding',
    tier: 'shadow',
    allowedTerms: ['switch', 'mac', 'port', 'flooding'],
    terms: {
      switch: { label: 'Switch', part: 'switch' },
      mac: { label: 'MAC Address', part: 'mac-table' },
    },
    beats: [
      {
        id: 'beat-1',
        kind: 'say',
        say: ['Notice this {{term:switch}} and its {{term:mac}}.'],
        reveal: ['hosts', 'switch'],
        spotlight: 'switch',
      },
      {
        id: 'beat-2',
        kind: 'predict',
        say: ['Where does the switch forward this frame?'],
        options: [
          { id: 'opt-1', label: 'Port 2 only', isCorrect: false, feedback: 'Not yet known.' },
          { id: 'opt-2', label: 'Floods Ports 2, 3, 4', isCorrect: true, feedback: 'Correct flood.' },
          { id: 'opt-3', label: 'Drops frame', isCorrect: false, feedback: 'Never drops unknown.' },
        ],
        whyPrompt: 'Why does it flood?',
        whyOptions: [
          { id: 'w-1', label: 'Table has no entry for destination', isCorrect: true, feedback: 'Correct!' },
          { id: 'w-2', label: 'Cables are disconnected', isCorrect: false, feedback: 'Wrong.' },
        ],
        reactions: {
          correct: ['Boom! Exactly.'],
        },
      },
    ],
  };

  const mockConcept: Concept = {
    id: 'mac-table-and-forwarding',
    order: 1,
    title: 'MAC Learning & Forwarding',
    shortDescription: 'How switches build their forwarding tables.',
    theory: {
      summary: 'Switches learn source MAC addresses and flood unknown destinations.',
      explanation: ['Paragraph 1', 'Paragraph 2'],
      keyTakeaway: 'Switches learn on ingress and forward or flood on egress.',
      exampleQuery: '',
      exampleQueryExplanation: '',
    },
    tasks: [],
  };

  describe('TermChip', () => {
    it('renders label with # prefix and accessible aria attributes', () => {
      const html = renderToStaticMarkup(
        <TermChip
          termKey="mac"
          label="MAC Address"
          partId="mac-table"
        />,
      );

      expect(html).toContain('MAC Address');
      expect(html).toContain('#');
      expect(html).toContain('aria-label="Highlight MAC Address"');
      expect(html).toContain('border-dashed');
    });

    it('renders active styling when isActive is true', () => {
      const html = renderToStaticMarkup(
        <TermChip
          termKey="mac"
          label="MAC Address"
          partId="mac-table"
          isActive={true}
        />,
      );

      expect(html).toContain('bg-func/20');
      expect(html).toContain('border-func');
    });
  });

  describe('SpotlightLayer', () => {
    it('renders children and displays spotlight pill when spotlight is active', () => {
      const noSpotlightHtml = renderToStaticMarkup(
        <SpotlightLayer spotlight={null}>
          <div id="test-canvas">Stage Content</div>
        </SpotlightLayer>,
      );

      expect(noSpotlightHtml).toContain('id="test-canvas"');
      expect(noSpotlightHtml).toContain('data-active-spotlight="none"');
      expect(noSpotlightHtml).not.toContain('Focus:');

      const activeSpotlightHtml = renderToStaticMarkup(
        <SpotlightLayer spotlight="switch" activeLabel="Switch Hardware">
          <div id="test-canvas">Stage Content</div>
        </SpotlightLayer>,
      );

      expect(activeSpotlightHtml).toContain('data-active-spotlight="switch"');
      expect(activeSpotlightHtml).toContain('Focus: Switch Hardware');
    });
  });

  describe('MentorDialoguePanel', () => {
    it('renders bubbles with TermChips embedded for tokens', () => {
      const state = initMentorState(mockScript);

      const html = renderToStaticMarkup(
        <MentorDialoguePanel
          script={mockScript}
          currentBeat={mockScript.beats[0]}
          state={state}
          onNext={vi.fn()}
          onSelectPrediction={vi.fn()}
          onReplay={vi.fn()}
        />,
      );

      expect(html).toContain('Step 1 of 2');
      expect(html).toContain('Highlight Switch');
      expect(html).toContain('Highlight MAC Address');
      expect(html).toContain('Next Step');
      expect(html).toContain('aria-live="polite"');
    });

    it('renders predict options and paired why selector when resolved', () => {
      const state = {
        ...initMentorState(mockScript),
        beatIndex: 1,
        isPredictionResolved: true,
        selectedOptionIndex: 1,
        isWhyResolved: false,
      };

      const html = renderToStaticMarkup(
        <MentorDialoguePanel
          script={mockScript}
          currentBeat={mockScript.beats[1]}
          state={state}
          onNext={vi.fn()}
          onSelectPrediction={vi.fn()}
          onSelectWhy={vi.fn()}
          onReplay={vi.fn()}
        />,
      );

      expect(html).toContain('Floods Ports 2, 3, 4');
      expect(html).toContain('Why? Why does it flood?');
      expect(html).toContain('Table has no entry for destination');
    });
  });

  describe('TicketStudio', () => {
    interface DummyTicketState {
      port1State: string;
      mtu: number;
    }

    const mockTicket: TicketScene<DummyTicketState> = {
      id: 'ticket-999',
      title: 'The Misconfigured Link',
      symptom: 'Server cannot communicate across Port 1.',
      initialState: {
        port1State: 'disconnected',
        mtu: 9000,
      },
      inspectableComponents: [
        { id: 'comp-1', label: 'Port 1 Status', data: 'LINK DOWN' },
      ],
      diagnosticQuestion: {
        prompt: 'What is preventing link negotiation?',
        options: [
          { id: 'd-1', label: 'Port 1 cable is disconnected', isCorrect: true, feedback: 'Correct!' },
          { id: 'd-2', label: 'Power supply failure', isCorrect: false, feedback: 'Incorrect.' },
        ],
      },
      allowedFixActions: [
        {
          id: 'fix-cable',
          label: 'Plug in Port 1 patch cable',
          patch: { action: 'set-link', target: 'port1State', value: 'connected' },
        },
      ],
      isFixed: (s) => s.port1State === 'connected',
      verifyTelemetry: (s) => ({
        success: s.port1State === 'connected',
        pingOutput: s.port1State === 'connected' ? '4/4 packets received' : '0/4 packets received',
        packetLossPercent: s.port1State === 'connected' ? 0 : 100,
        explanation: s.port1State === 'connected' ? 'Physical link verified.' : 'Link down.',
      }),
    };

    it('renders ticket symptom, telemetry cards, and diagnostic options', () => {
      const html = renderToStaticMarkup(<TicketStudio ticket={mockTicket} onResolved={vi.fn()} />);

      expect(html).toContain('The Misconfigured Link');
      expect(html).toContain('Server cannot communicate across Port 1.');
      expect(html).toContain('Port 1 Status');
      expect(html).toContain('LINK DOWN');
      expect(html).toContain('Port 1 cable is disconnected');
    });
  });

  describe('MentorLessonStage', () => {
    it('renders 2-pane layout with mobile and desktop grid classes', () => {
      const html = renderToStaticMarkup(
        <MentorLessonStage
          moduleId="net-03"
          concept={mockConcept}
          script={mockScript}
          onComplete={vi.fn()}
        />,
      );

      expect(html).toContain('data-testid="mentor-lesson-stage"');
      expect(html).toContain('grid-cols-1 lg:grid-cols-12');
      expect(html).toContain('lg:col-span-5');
      expect(html).toContain('lg:col-span-7');
      expect(html).toContain('Read lesson summary as standard text');
    });
  });
});
