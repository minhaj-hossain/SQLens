import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { NET_03_MODULE, NET_03_MENTOR_SCRIPT } from '../../src/content/networking/modules/net-03';
import { ConceptLessonView } from '../../src/components/learning/ConceptLessonView';
import { generateSwitchSimulation } from '../../src/lib/network-engine/switching-sim';

describe('Mentor Mode Pilot: Module 3 (net-03)', () => {
  it('attaches NET_03_MENTOR_SCRIPT to Concept 1 theory', () => {
    const concept = NET_03_MODULE.concepts[0];
    expect(concept.theory.mentorScript).toBeDefined();
    expect(concept.theory.mentorScript?.moduleId).toBe('net-03');
    expect(concept.theory.mentorScript?.tier).toBe('shadow');
    expect(concept.theory.mentorScript?.beats.length).toBe(10);
  });

  it('strictly satisfies the Reveal Ladder invariant (cumulative parts)', () => {
    const seenParts = new Set<string>();
    for (const beat of NET_03_MENTOR_SCRIPT.beats) {
      if (beat.reveal) {
        // No beat adds more than 2 elements
        expect(beat.reveal.length).toBeLessThanOrEqual(2);
        for (const part of beat.reveal) {
          seenParts.add(part);
        }
      }
    }
    expect(seenParts.has('hosts')).toBe(true);
    expect(seenParts.has('host-mac')).toBe(true);
    expect(seenParts.has('switch')).toBe(true);
    expect(seenParts.has('ports')).toBe(true);
    expect(seenParts.has('mac-table')).toBe(true);
    expect(seenParts.has('controls')).toBe(true);
    expect(seenParts.has('egress-ports')).toBe(true);
  });

  it('strictly satisfies the Show-Then-Name invariant', () => {
    const cumulativeRevealed = new Set<string>();
    const termRegex = /\{\{term:([a-zA-Z0-9_-]+)\}\}/g;

    for (const beat of NET_03_MENTOR_SCRIPT.beats) {
      if (beat.reveal) {
        for (const p of beat.reveal) {
          cumulativeRevealed.add(p);
        }
      }

      for (const text of beat.say ?? []) {
        let match: RegExpExecArray | null;
        while ((match = termRegex.exec(text)) !== null) {
          const termKey = match[1];
          const termDef = NET_03_MENTOR_SCRIPT.terms[termKey];
          expect(termDef, `Term key ${termKey} must exist in terms map`).toBeDefined();
          expect(
            cumulativeRevealed.has(termDef.part),
            `Term "${termDef.label}" (${termDef.part}) must be revealed before or in beat ${beat.id}`,
          ).toBe(true);
        }
      }
    }
  });

  it('strictly satisfies the Active Cadence invariant (<= 2 consecutive passive beats)', () => {
    let consecutivePassive = 0;
    for (const beat of NET_03_MENTOR_SCRIPT.beats) {
      if (beat.kind === 'say' || beat.kind === 'point' || beat.kind === 'debrief') {
        consecutivePassive += 1;
        expect(
          consecutivePassive,
          `Beat ${beat.id} exceeded the max 2 consecutive passive beats rule!`,
        ).toBeLessThanOrEqual(2);
      } else {
        consecutivePassive = 0;
      }
    }
  });

  it('strictly satisfies the Third Way assessment invariant (>=3 options + paired why)', () => {
    const predictBeats = NET_03_MENTOR_SCRIPT.beats.filter((b) => b.kind === 'predict');
    expect(predictBeats.length).toBe(2);

    for (const beat of predictBeats) {
      if (beat.kind === 'predict') {
        expect(beat.options.length).toBeGreaterThanOrEqual(3);
        const correctOptions = beat.options.filter((o) => o.isCorrect);
        expect(correctOptions.length).toBe(1);

        // Every option must have feedback
        for (const opt of beat.options) {
          expect(opt.feedback.length).toBeGreaterThan(0);
        }

        // Must have paired why prompt and options
        expect(beat.whyPrompt).toBeDefined();
        expect(beat.whyOptions).toBeDefined();
        expect(beat.whyOptions!.length).toBeGreaterThanOrEqual(2);
        const correctWhy = beat.whyOptions!.filter((w) => w.isCorrect);
        expect(correctWhy.length).toBe(1);
      }
    }
  });

  it('aligns step indices with pure generateSwitchSimulation output', () => {
    const steps = generateSwitchSimulation();
    expect(steps.length).toBe(4);

    // Step 0: Ingress learn Host A on Port 1
    expect(steps[0].decision).toBe('LEARN_NEW_SOURCE');
    expect(steps[0].macTableSnapshot.length).toBe(1);
    expect(steps[0].macTableSnapshot[0].mac).toBe('AA:AA:AA:AA:AA:AA');

    // Step 1: Egress unknown unicast flood
    expect(steps[1].decision).toBe('FLOOD_UNKNOWN_UNICAST');
    expect(steps[1].egressPorts).toEqual([2, 3, 4]);

    // Step 2: Ingress learn Host B on Port 2
    expect(steps[2].decision).toBe('LEARN_NEW_SOURCE');
    expect(steps[2].macTableSnapshot.length).toBe(2);

    // Step 3: Egress known unicast forward to Port 1
    expect(steps[3].decision).toBe('FORWARD_KNOWN_UNICAST');
    expect(steps[3].egressPorts).toEqual([1]);
  });

  it('renders MentorLessonStage inside ConceptLessonView when mentorScript is present', () => {
    const concept = NET_03_MODULE.concepts[0];
    const html = renderToStaticMarkup(
      <ConceptLessonView
        moduleId="net-03"
        concept={concept}
        conceptIndex={0}
        totalConcepts={3}
        onStartPractice={vi.fn()}
      />,
    );

    // Verifies Mentor Mode mounts and renders the 2-pane stage
    expect(html).toContain('data-testid="mentor-lesson-stage"');
    expect(html).toContain('Mentor Mode');
    expect(html).toContain('Stage 1: Shadow the Master');
    expect(html).toContain('data-testid="switch-simulation-lab"');
  });
});
