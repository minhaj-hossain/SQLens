import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { NET_01_MODULE } from '../../src/content/networking/modules/net-01';
import { NET_02_MODULE } from '../../src/content/networking/modules/net-02';
import { NET_03_MODULE } from '../../src/content/networking/modules/net-03';
import { NET_04_MODULE } from '../../src/content/networking/modules/net-04';
import { NET_05_MODULE } from '../../src/content/networking/modules/net-05';
import { ConceptLessonView } from '../../src/components/learning/ConceptLessonView';
import type { MentorScript } from '../../src/types/networking-curriculum';

describe('Mentor Mode Rollout: Modules 1 to 5 Invariant Audits', () => {
  const modules = [
    { id: 'net-01', module: NET_01_MODULE, stageTestId: 'packet-inspector-stage' },
    { id: 'net-02', module: NET_02_MODULE, stageTestId: 'ethernet-frame-stage' },
    { id: 'net-03', module: NET_03_MODULE, stageTestId: 'switch-simulation-lab' },
    { id: 'net-04', module: NET_04_MODULE, stageTestId: 'subnet-slicer-stage' },
    { id: 'net-05', module: NET_05_MODULE, stageTestId: 'arp-simulation-stage' },
  ];

  modules.forEach(({ id, module, stageTestId }) => {
    describe(`Module ${id} Mentor Script`, () => {
      const script: MentorScript = module.concepts[0].theory.mentorScript!;

      it(`attaches mentorScript to ${id} Concept 1`, () => {
        expect(script).toBeDefined();
        expect(script.version).toBe('1.0.0');
        expect(script.moduleId).toBe(id);
      });

      it(`strictly satisfies Reveal Ladder (cumulative superset parts) for ${id}`, () => {
        expect(script.revealLadder).toBeDefined();
        const ladder = script.revealLadder!;
        const ladderKeys = Object.keys(ladder);
        expect(ladderKeys.length).toBeGreaterThanOrEqual(3);

        let previousParts: string[] = [];
        for (const key of ladderKeys) {
          const parts = ladder[key];
          expect(parts.length).toBeGreaterThan(0);
          for (const prev of previousParts) {
            expect(parts).toContain(prev);
          }
          previousParts = parts;
        }
      });

      it(`strictly satisfies Show-Then-Name invariant for ${id}`, () => {
        for (const beat of script.beats) {
          const text = beat.text || beat.say?.[0] || '';
          const termMatches = text.matchAll(/\{\{term:([a-z0-9-]+)\}\}/g);
          for (const match of termMatches) {
            const termId = match[1];
            const termDef = script.terms[termId];
            expect(termDef).toBeDefined();
            const parts = beat.revealedParts || beat.reveal || [];
            expect(parts).toContain(termDef.part);
          }
        }
      });

      it(`strictly satisfies Active Cadence invariant (<= 2 consecutive passive beats) for ${id}`, () => {
        let consecutivePassiveCount = 0;
        for (const beat of script.beats) {
          const isPassive = beat.kind === 'say' || beat.kind === 'point' || beat.kind === 'debrief';
          if (isPassive) {
            consecutivePassiveCount += 1;
            expect(
              consecutivePassiveCount,
              `Beat ${beat.id} in ${id} violated active cadence with ${consecutivePassiveCount} consecutive passive beats`,
            ).toBeLessThanOrEqual(2);
          } else {
            consecutivePassiveCount = 0;
          }
        }
      });

      it(`strictly satisfies Third Way assessment invariant for ${id}`, () => {
        const predictBeats = script.beats.filter((b) => b.kind === 'predict');
        expect(predictBeats.length).toBeGreaterThanOrEqual(1);

        for (const beat of predictBeats) {
          if (beat.kind === 'predict') {
            expect(beat.options).toBeDefined();
            expect(beat.options.length).toBeGreaterThanOrEqual(3);
            const correctOptions = beat.options.filter((o) => o.isCorrect);
            expect(correctOptions.length).toBe(1);

            expect(beat.whyOptions).toBeDefined();
            expect(beat.whyOptions!.length).toBeGreaterThanOrEqual(2);
            const correctWhy = beat.whyOptions!.filter((w) => w.isCorrect);
            expect(correctWhy.length).toBe(1);
          }
        }
      });

      it(`contains a valid TicketScene with >=3 options and repair actions for ${id}`, () => {
        expect(script.ticketScene).toBeDefined();
        const scene = script.ticketScene!;
        expect(scene.ticketId).toBeDefined();
        expect(scene.symptom.length).toBeGreaterThan(10);
        expect(scene.options.length).toBeGreaterThanOrEqual(3);
        const correctOptions = scene.options.filter((o: { isCorrect: boolean }) => o.isCorrect);
        expect(correctOptions.length).toBe(1);

        expect(scene.repairActions.length).toBeGreaterThanOrEqual(3);
        const correctRepairs = scene.repairActions.filter((r: { isCorrect: boolean }) => r.isCorrect);
        expect(correctRepairs.length).toBe(1);
        expect(correctRepairs[0].patch).toBeDefined();
        expect(correctRepairs[0].patch!.action).toBeDefined();
      });

      it(`renders MentorLessonStage in ConceptLessonView mounting ${stageTestId}`, () => {
        const concept = module.concepts[0];
        const html = renderToStaticMarkup(
          <ConceptLessonView
            moduleId={id}
            concept={concept}
            conceptIndex={0}
            totalConcepts={module.concepts.length}
            onStartPractice={vi.fn()}
          />,
        );

        expect(html).toContain('data-testid="mentor-lesson-stage"');
        expect(html).toContain('Mentor Mode');
        expect(html).toContain(stageTestId);
      });
    });
  });
});
