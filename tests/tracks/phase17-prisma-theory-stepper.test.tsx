import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';
import {
  PrismaTheoryHero,
  PrismaTheorySteps,
} from '../../src/components/learning/prisma/PrismaTheoryBlock';
import { PRISMA_MODULES } from '../../src/content/prisma/prisma-curriculum-index';
import type { ConceptTheory } from '../../src/types/curriculum';

describe('Phase 5 — PrismaTheoryBlock Stepper & Hero Components', () => {
  describe('PrismaTheoryHero', () => {
    it('returns null when targetHero is missing', () => {
      const theory: ConceptTheory = {
        summary: 'Test',
        explanation: ['Test'],
        keyTakeaway: 'Takeaway',
        exampleQuery: 'SELECT 1;',
        exampleQueryExplanation: 'Test query',
      };
      const html = renderToStaticMarkup(<PrismaTheoryHero theory={theory} />);
      expect(html).toBe('');
    });

    it('renders hero call with code, badge, and language', () => {
      const theory: ConceptTheory = {
        summary: 'Test',
        explanation: ['Test'],
        keyTakeaway: 'Takeaway',
        exampleQuery: 'SELECT 1;',
        exampleQueryExplanation: 'Test query',
        prisma: {
          targetHero: {
            code: 'await prisma.user.findMany()',
            language: 'typescript',
            badge: 'Target Prisma Call',
            explanation: 'Fetches all user rows',
          },
        },
      };
      const html = renderToStaticMarkup(<PrismaTheoryHero theory={theory} />);
      expect(html).toContain('Target Prisma Call');
      expect(html).toContain('typescript');
      expect(html).toContain('await prisma.user.findMany()');
      expect(html).toContain('Fetches all user rows');
    });
  });

  describe('PrismaTheorySteps Isolation & Guards', () => {
    it('returns null when theory.prisma is undefined (SQL track isolation)', () => {
      const sqlTheory: ConceptTheory = {
        summary: 'SQL Concept',
        explanation: ['SELECT * FROM users'],
        keyTakeaway: 'All columns returned',
        exampleQuery: 'SELECT * FROM users;',
        exampleQueryExplanation: 'Standard SQL query',
      };
      const html = renderToStaticMarkup(<PrismaTheorySteps theory={sqlTheory} />);
      expect(html).toBe('');
    });

    it('returns null when theory.prisma has no mental model and empty stepBreakdowns', () => {
      const theory: ConceptTheory = {
        summary: 'Empty Prisma Concept',
        explanation: ['Empty'],
        keyTakeaway: 'Takeaway',
        exampleQuery: '',
        exampleQueryExplanation: '',
        prisma: {
          stepBreakdowns: [],
        },
      };
      const html = renderToStaticMarkup(<PrismaTheorySteps theory={theory} />);
      expect(html).toBe('');
    });
  });

  describe('PrismaTheorySteps Stepper Rendering', () => {
    const mockTheory: ConceptTheory = {
      summary: 'Find Unique User',
      explanation: ['Finds user by id'],
      keyTakeaway: 'Fast index lookup',
      exampleQuery: 'SELECT * FROM users WHERE id = 1;',
      exampleQueryExplanation: 'Primary key query',
      prisma: {
        mentalModel: 'Prisma turns high-level TypeScript into parameterized SQL statements.',
        stepBreakdowns: [
          {
            stepNumber: 1,
            stepTitle: 'Step 1: Client Method Invocation',
            codeSnippet: 'await prisma.user.findUnique({ where: { id: 1 } })',
            explanation: 'Caller invokes findUnique on user model delegate with unique filter criteria.',
            visualData: {
              type: 'type_preview',
              title: 'Type Preview',
              details: null,
            },
          },
          {
            stepNumber: 2,
            stepTitle: 'Step 2: Query Engine SQL Generation',
            codeSnippet: 'SELECT "id", "email", "name" FROM "users" WHERE "id" = ? LIMIT 1;',
            explanation: 'The Rust query engine generates an optimized SQLite SELECT statement.',
            visualData: {
              type: 'sql_lens',
              title: 'Generated SQL',
              details: null,
            },
          },
          {
            stepNumber: 3,
            stepTitle: 'Step 3: Result Inferred Type',
            codeSnippet: 'type User = { id: number; email: string; name: string | null } | null;',
            explanation: 'Prisma guarantees that the returned type accurately reflects nullable fields.',
            visualData: {
              type: 'erd_highlight',
              title: 'ERD Highlight',
              details: null,
            },
          },
        ],
      },
    };

    it('renders the mental model paragraph', () => {
      const html = renderToStaticMarkup(<PrismaTheorySteps theory={mockTheory} />);
      expect(html).toContain('Prisma turns high-level TypeScript into parameterized SQL statements.');
    });

    it('renders mode switchers (Stepper and All Steps) when >= 2 steps exist', () => {
      const html = renderToStaticMarkup(<PrismaTheorySteps theory={mockTheory} />);
      expect(html).toContain('How Prisma executes this call');
      expect(html).toContain('Stepper');
      expect(html).toContain('All Steps');
    });

    it('renders horizontal timeline with step nodes and progress counter', () => {
      const html = renderToStaticMarkup(<PrismaTheorySteps theory={mockTheory} />);
      // Step timeline nodes
      expect(html).toContain('Client Method Invocation');
      expect(html).toContain('Query Engine SQL Generation');
      expect(html).toContain('Result Inferred Type');

      // Initial active step counter
      expect(html).toContain('Step 1 of 3');

      // Playback buttons
      expect(html).toContain('Previous');
      expect(html).toContain('Next');
      // Previous button is disabled on step 1
      expect(html).toContain('disabled=""');
      expect(html).toContain('aria-label="Previous step"');
      expect(html).toContain('aria-label="Next step"');
    });

    it('renders active step card with visual badge, snippet, and explanation', () => {
      const html = renderToStaticMarkup(<PrismaTheorySteps theory={mockTheory} />);
      expect(html).toContain('Step 1');
      expect(html).toContain('Type Preview');
      expect(html).toContain('await prisma.user.findUnique');
      expect(html).toContain('Caller invokes findUnique on user model delegate');
    });

    it('applies SQL syntax highlighting when visualData.type is sql_lens', () => {
      const sqlOnlyTheory: ConceptTheory = {
        summary: 'SQL Generation',
        explanation: ['SQL'],
        keyTakeaway: 'Key',
        exampleQuery: 'SELECT 1;',
        exampleQueryExplanation: 'Query',
        prisma: {
          stepBreakdowns: [
            {
              stepNumber: 1,
              stepTitle: 'Step 1: SQL Statement',
              codeSnippet: 'SELECT id, email FROM users;',
              explanation: 'Generated query.',
              visualData: {
                type: 'sql_lens',
                title: 'SQL Lens',
                details: null,
              },
            },
          ],
        },
      };
      const html = renderToStaticMarkup(<PrismaTheorySteps theory={sqlOnlyTheory} />);
      expect(html).toContain('text-code-kw');
      expect(html).toContain('SELECT');
      expect(html).toContain('FROM');
      expect(html).toContain('SQL Lens');
    });
  });

  describe('Real Curriculum Integration', () => {
    it('renders stepper without error across all Prisma curriculum concept lessons', () => {
      let inspectedConcepts = 0;
      for (const mod of PRISMA_MODULES) {
        for (const concept of mod.concepts) {
          if (concept.theory.prisma?.stepBreakdowns && concept.theory.prisma.stepBreakdowns.length > 0) {
            const html = renderToStaticMarkup(<PrismaTheorySteps theory={concept.theory} />);
            expect(html).toContain('How Prisma executes this call');
            inspectedConcepts++;
          }
        }
      }
      expect(inspectedConcepts).toBeGreaterThanOrEqual(10);
    });
  });
});
