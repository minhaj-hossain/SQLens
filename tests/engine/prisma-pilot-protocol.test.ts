import { describe, it, expect, beforeEach } from 'vitest';
import {
  recordPilotEvent,
  readPilotEvents,
  clearPilotEvents,
  summarizeParticipant,
  evaluatePilotCohort,
  formatCohortMarkdownReport,
  type PilotEvent,
} from '../../src/lib/prisma-engine/pilot';

describe('Phase 6: Prisma Curriculum Pilot Protocol & Telemetry', () => {
  beforeEach(() => {
    clearPilotEvents();
  });

  describe('Telemetry Ring Buffer & Storage Invariants', () => {
    it('records and retrieves pilot events in reverse-chronological order', () => {
      recordPilotEvent({
        participantId: 'p1',
        sessionId: 's1',
        taskId: 'prisma04-hw-2',
        kind: 'STALL',
        durationMs: 48000,
      });

      recordPilotEvent({
        participantId: 'p1',
        sessionId: 's1',
        taskId: 'prisma04-hw-2',
        kind: 'CHECKPOINT_SUBMIT',
        metadata: { passed: true },
      });

      const events = readPilotEvents();
      expect(events.length).toBe(2);
      expect(events[0].kind).toBe('CHECKPOINT_SUBMIT');
      expect(events[1].kind).toBe('STALL');
      expect(events[1].durationMs).toBe(48000);
    });

    it('respects ring buffer maximum bounds and clears correctly', () => {
      for (let i = 0; i < 550; i++) {
        recordPilotEvent({
          participantId: 'p1',
          sessionId: 's1',
          taskId: 'task-' + i,
          kind: 'MUTATE',
        });
      }

      const events = readPilotEvents();
      expect(events.length).toBe(500);

      clearPilotEvents();
      expect(readPilotEvents().length).toBe(0);
    });
  });

  describe('Participant Summarizer', () => {
    it('accurately aggregates friction events, times, and checkpoint pass states', () => {
      const events: PilotEvent[] = [
        { participantId: 'p1', sessionId: 's1', taskId: 'prisma01-c1-t1', kind: 'STALL', timestamp: 1000 },
        { participantId: 'p1', sessionId: 's1', taskId: 'prisma02-c1-t1', kind: 'DOC', timestamp: 2000 },
        { participantId: 'p1', sessionId: 's1', taskId: 'prisma04-hw-2', kind: 'DOC', timestamp: 3000 },
        { participantId: 'p1', sessionId: 's1', taskId: 'prisma04-hw-2', kind: 'DOC', timestamp: 3500 },
        { participantId: 'p1', sessionId: 's1', taskId: 'prisma03-c1-t1', kind: 'MUTATE', timestamp: 4000 },
        { participantId: 'p1', sessionId: 's1', taskId: 'prisma03-c1-t1', kind: 'HINT_REVEAL', timestamp: 5000 },
        {
          participantId: 'p1',
          sessionId: 's1',
          taskId: 'prisma04-hw-2',
          kind: 'CHECKPOINT_SUBMIT',
          timestamp: 6000,
          durationMs: 18 * 60 * 1000,
          metadata: { passed: true },
        },
        {
          participantId: 'p1',
          sessionId: 's1',
          taskId: 'prisma08-hw-2',
          kind: 'CHECKPOINT_SUBMIT',
          timestamp: 7000,
          metadata: { passed: false },
        },
        {
          participantId: 'p1',
          sessionId: 's1',
          taskId: 'prisma08-hw-2',
          kind: 'CHECKPOINT_SUBMIT',
          timestamp: 8000,
          metadata: { passed: true },
        },
      ];

      const summary = summarizeParticipant('p1', events);
      expect(summary.totalStalls).toBe(1);
      expect(summary.totalDocSearches).toBe(3);
      expect(summary.checkpointDocSearches).toBe(2);
      expect(summary.totalMutations).toBe(1);
      expect(summary.totalHintReveals).toBe(1);
      expect(summary.cp1Passed).toBe(true);
      expect(summary.cp1DurationMs).toBe(18 * 60 * 1000);
      expect(summary.cp2Attempts).toBe(2);
      expect(summary.cp2Passed).toBe(true);
    });
  });

  describe('Falsification Rule 1: Checkpoint 1 Composite Index Scaffolding', () => {
    it('passes when at most 1 of 5 participants fails Checkpoint 1 within 25m', () => {
      const events: PilotEvent[] = [
        // P1: pass in 16m
        { participantId: 'p1', sessionId: 's', taskId: 'prisma04-hw-2', kind: 'CHECKPOINT_SUBMIT', timestamp: 1, durationMs: 16 * 60 * 1000, metadata: { passed: true } },
        // P2: pass in 19m
        { participantId: 'p2', sessionId: 's', taskId: 'prisma04-hw-2', kind: 'CHECKPOINT_SUBMIT', timestamp: 1, durationMs: 19 * 60 * 1000, metadata: { passed: true } },
        // P3: pass in 22m
        { participantId: 'p3', sessionId: 's', taskId: 'prisma04-hw-2', kind: 'CHECKPOINT_SUBMIT', timestamp: 1, durationMs: 22 * 60 * 1000, metadata: { passed: true } },
        // P4: pass in 24m
        { participantId: 'p4', sessionId: 's', taskId: 'prisma04-hw-2', kind: 'CHECKPOINT_SUBMIT', timestamp: 1, durationMs: 24 * 60 * 1000, metadata: { passed: true } },
        // P5: fail / exceeded 25m (1 allowed failure)
        { participantId: 'p5', sessionId: 's', taskId: 'prisma04-hw-2', kind: 'CHECKPOINT_SUBMIT', timestamp: 1, durationMs: 27 * 60 * 1000, metadata: { passed: false } },
      ];

      const evalResult = evaluatePilotCohort(events);
      expect(evalResult.rule1Passed).toBe(true);
      expect(evalResult.rule1Failures).toBe(1);
    });

    it('fails when >1 of 5 participants fails Checkpoint 1 within 25m and recommends Days 3 & 4 rework', () => {
      const events: PilotEvent[] = [
        // P1, P2, P3 pass
        { participantId: 'p1', sessionId: 's', taskId: 'prisma04-hw-2', kind: 'CHECKPOINT_SUBMIT', timestamp: 1, durationMs: 15 * 60 * 1000, metadata: { passed: true } },
        { participantId: 'p2', sessionId: 's', taskId: 'prisma04-hw-2', kind: 'CHECKPOINT_SUBMIT', timestamp: 1, durationMs: 18 * 60 * 1000, metadata: { passed: true } },
        { participantId: 'p3', sessionId: 's', taskId: 'prisma04-hw-2', kind: 'CHECKPOINT_SUBMIT', timestamp: 1, durationMs: 21 * 60 * 1000, metadata: { passed: true } },
        // P4: exceeded 25m
        { participantId: 'p4', sessionId: 's', taskId: 'prisma04-hw-2', kind: 'CHECKPOINT_SUBMIT', timestamp: 1, durationMs: 28 * 60 * 1000, metadata: { passed: false } },
        // P5: never passed
        { participantId: 'p5', sessionId: 's', taskId: 'prisma04-hw-2', kind: 'CHECKPOINT_SUBMIT', timestamp: 1, durationMs: 25 * 60 * 1000, metadata: { passed: false } },
      ];

      const evalResult = evaluatePilotCohort(events);
      expect(evalResult.rule1Passed).toBe(false);
      expect(evalResult.rule1Failures).toBe(2);
      expect(evalResult.recommendations.some((r) => r.includes('Days 3 & 4'))).toBe(true);
    });
  });

  describe('Falsification Rule 2: Checkpoint 2 Cursor Tiebreaker Diagnostic', () => {
    it('passes when at most 2 of 5 participants require >1 failed attempt to diagnose tiebreaker bug', () => {
      const events: PilotEvent[] = [
        // P1: passed on 1st attempt
        { participantId: 'p1', sessionId: 's', taskId: 'prisma08-hw-2', kind: 'CHECKPOINT_SUBMIT', timestamp: 1, metadata: { passed: true } },
        // P2: passed on 1st attempt
        { participantId: 'p2', sessionId: 's', taskId: 'prisma08-hw-2', kind: 'CHECKPOINT_SUBMIT', timestamp: 1, metadata: { passed: true } },
        // P3: passed on 2nd attempt (1 failed attempt, total 2 attempts)
        { participantId: 'p3', sessionId: 's', taskId: 'prisma08-hw-2', kind: 'CHECKPOINT_SUBMIT', timestamp: 1, metadata: { passed: false } },
        { participantId: 'p3', sessionId: 's', taskId: 'prisma08-hw-2', kind: 'CHECKPOINT_SUBMIT', timestamp: 2, metadata: { passed: true } },
        // P4: needed 3 attempts (>1 failed attempt, excess retry #1)
        { participantId: 'p4', sessionId: 's', taskId: 'prisma08-hw-2', kind: 'CHECKPOINT_SUBMIT', timestamp: 1, metadata: { passed: false } },
        { participantId: 'p4', sessionId: 's', taskId: 'prisma08-hw-2', kind: 'CHECKPOINT_SUBMIT', timestamp: 2, metadata: { passed: false } },
        { participantId: 'p4', sessionId: 's', taskId: 'prisma08-hw-2', kind: 'CHECKPOINT_SUBMIT', timestamp: 3, metadata: { passed: true } },
        // P5: needed 3 attempts (excess retry #2)
        { participantId: 'p5', sessionId: 's', taskId: 'prisma08-hw-2', kind: 'CHECKPOINT_SUBMIT', timestamp: 1, metadata: { passed: false } },
        { participantId: 'p5', sessionId: 's', taskId: 'prisma08-hw-2', kind: 'CHECKPOINT_SUBMIT', timestamp: 2, metadata: { passed: false } },
        { participantId: 'p5', sessionId: 's', taskId: 'prisma08-hw-2', kind: 'CHECKPOINT_SUBMIT', timestamp: 3, metadata: { passed: true } },
      ];

      const evalResult = evaluatePilotCohort(events);
      expect(evalResult.rule2Passed).toBe(true);
      expect(evalResult.rule2ExcessiveRetries).toBe(2);
    });

    it('fails when >2 of 5 participants require >1 failed attempt and recommends Day 8 break-it drill', () => {
      const events: PilotEvent[] = [
        // P1 & P2: 1st try pass
        { participantId: 'p1', sessionId: 's', taskId: 'prisma08-hw-2', kind: 'CHECKPOINT_SUBMIT', timestamp: 1, metadata: { passed: true } },
        { participantId: 'p2', sessionId: 's', taskId: 'prisma08-hw-2', kind: 'CHECKPOINT_SUBMIT', timestamp: 1, metadata: { passed: true } },
        // P3, P4, P5 all need 3 attempts
        ...['p3', 'p4', 'p5'].flatMap((id) => [
          { participantId: id, sessionId: 's', taskId: 'prisma08-hw-2', kind: 'CHECKPOINT_SUBMIT' as const, timestamp: 1, metadata: { passed: false } },
          { participantId: id, sessionId: 's', taskId: 'prisma08-hw-2', kind: 'CHECKPOINT_SUBMIT' as const, timestamp: 2, metadata: { passed: false } },
          { participantId: id, sessionId: 's', taskId: 'prisma08-hw-2', kind: 'CHECKPOINT_SUBMIT' as const, timestamp: 3, metadata: { passed: true } },
        ]),
      ];

      const evalResult = evaluatePilotCohort(events);
      expect(evalResult.rule2Passed).toBe(false);
      expect(evalResult.rule2ExcessiveRetries).toBe(3);
      expect(evalResult.recommendations.some((r) => r.includes('Day 8'))).toBe(true);
    });
  });

  describe('Falsification Rule 3: Platform Autonomy & Zero-Search Policy', () => {
    it('passes when zero participants exceed 3 external doc searches during checkpoints', () => {
      const events: PilotEvent[] = [
        // P1 searches 1 time during CP1
        { participantId: 'p1', sessionId: 's', taskId: 'prisma04-hw-2', kind: 'DOC', timestamp: 1 },
        // P2 searches 2 times
        { participantId: 'p2', sessionId: 's', taskId: 'prisma04-hw-2', kind: 'DOC', timestamp: 1 },
        { participantId: 'p2', sessionId: 's', taskId: 'prisma08-hw-2', kind: 'DOC', timestamp: 2 },
        // P3 searches 3 times (limit is >3)
        { participantId: 'p3', sessionId: 's', taskId: 'prisma04-hw-2', kind: 'DOC', timestamp: 1 },
        { participantId: 'p3', sessionId: 's', taskId: 'prisma04-hw-2', kind: 'DOC', timestamp: 2 },
        { participantId: 'p3', sessionId: 's', taskId: 'prisma08-hw-2', kind: 'DOC', timestamp: 3 },
        // P4 & P5: 0 searches
        { participantId: 'p4', sessionId: 's', taskId: 'prisma01-c1-t1', kind: 'DOC', timestamp: 1 }, // Non-checkpoint doc search
        { participantId: 'p5', sessionId: 's', taskId: 'prisma01-c1-t1', kind: 'DOC', timestamp: 1 },
      ];

      const evalResult = evaluatePilotCohort(events);
      expect(evalResult.rule3Passed).toBe(true);
      expect(evalResult.rule3DocViolations).toBe(0);
    });

    it('fails when any participant searches external docs >3 times during checkpoints', () => {
      const events: PilotEvent[] = [
        // P1 has 4 searches during CP1/CP2
        { participantId: 'p1', sessionId: 's', taskId: 'prisma04-hw-2', kind: 'DOC', timestamp: 1 },
        { participantId: 'p1', sessionId: 's', taskId: 'prisma04-hw-2', kind: 'DOC', timestamp: 2 },
        { participantId: 'p1', sessionId: 's', taskId: 'prisma08-hw-2', kind: 'DOC', timestamp: 3 },
        { participantId: 'p1', sessionId: 's', taskId: 'prisma08-hw-2', kind: 'DOC', timestamp: 4 },
      ];

      const evalResult = evaluatePilotCohort(events);
      expect(evalResult.rule3Passed).toBe(false);
      expect(evalResult.rule3DocViolations).toBe(1);
      expect(evalResult.recommendations.some((r) => r.includes('reference cards'))).toBe(true);
    });
  });

  describe('Synthetic Baseline Cohort Simulation & Report Formatting', () => {
    it('evaluates a clean baseline 5-developer cohort satisfying all 3 rules', () => {
      const baselineEvents: PilotEvent[] = [];

      const participants = [
        { id: 'p1', cp1Minutes: 14, cp2Attempts: 1, cpDocs: 0, stalls: 2, mutates: 0 },
        { id: 'p2', cp1Minutes: 18, cp2Attempts: 2, cpDocs: 1, stalls: 3, mutates: 1 },
        { id: 'p3', cp1Minutes: 20, cp2Attempts: 1, cpDocs: 2, stalls: 4, mutates: 1 },
        { id: 'p4', cp1Minutes: 16, cp2Attempts: 2, cpDocs: 0, stalls: 1, mutates: 0 },
        { id: 'p5', cp1Minutes: 23, cp2Attempts: 3, cpDocs: 1, stalls: 5, mutates: 2 },
      ];

      for (const p of participants) {
        // Stalls & mutates
        for (let i = 0; i < p.stalls; i++) {
          baselineEvents.push({ participantId: p.id, sessionId: 'sess', taskId: 'prisma03-c1-t1', kind: 'STALL', timestamp: i * 100 });
        }
        for (let i = 0; i < p.mutates; i++) {
          baselineEvents.push({ participantId: p.id, sessionId: 'sess', taskId: 'prisma07-c1-t1', kind: 'MUTATE', timestamp: i * 100 });
        }

        // Checkpoint Doc searches
        for (let i = 0; i < p.cpDocs; i++) {
          baselineEvents.push({ participantId: p.id, sessionId: 'sess', taskId: 'prisma04-hw-2', kind: 'DOC', timestamp: i * 100 });
        }

        // CP1
        baselineEvents.push({
          participantId: p.id,
          sessionId: 'sess',
          taskId: 'prisma04-hw-2',
          kind: 'CHECKPOINT_SUBMIT',
          timestamp: 1000,
          durationMs: p.cp1Minutes * 60 * 1000,
          metadata: { passed: true },
        });

        // CP2
        for (let a = 1; a <= p.cp2Attempts; a++) {
          baselineEvents.push({
            participantId: p.id,
            sessionId: 'sess',
            taskId: 'prisma08-hw-2',
            kind: 'CHECKPOINT_SUBMIT',
            timestamp: 2000 + a * 100,
            metadata: { passed: a === p.cp2Attempts },
          });
        }
      }

      const evalResult = evaluatePilotCohort(baselineEvents);
      expect(evalResult.passed).toBe(true);
      expect(evalResult.rule1Passed).toBe(true);
      expect(evalResult.rule2Passed).toBe(true);
      expect(evalResult.rule3Passed).toBe(true);
      expect(evalResult.recommendations.length).toBe(0);

      const summaries = participants.map((p) => summarizeParticipant(p.id, baselineEvents));
      const markdown = formatCohortMarkdownReport(evalResult, summaries);

      expect(markdown).toContain('Pilot Cohort Evaluation Summary');
      expect(markdown).toContain('Rule 1');
      expect(markdown).toContain('Rule 2');
      expect(markdown).toContain('Rule 3');
      expect(markdown).toContain('PASSED');
    });
  });
});
