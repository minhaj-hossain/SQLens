# Module Authoring TypeScript Template

Copy this blueprint when authoring content for Day 3, Day 4, or any future networking day.

---

```typescript
import type { ConceptDefinition, VocabularyTerm } from '../../../../types/networking-dayX';

// 1. Strict Vocabulary Gate: Exactly 6-7 terms allowed for this day
export const DAY_X_VOCABULARY: Record<string, VocabularyTerm> = {
  'term-1': {
    term: 'router',
    pronunciation: 'ROO-ter',
    definition: 'A doorway device that connects two different streets (networks) together.',
    firstSeen: 'Concept 1, Step 1',
  },
  'term-2': {
    term: 'default gateway',
    pronunciation: 'de-FAWLT GATE-way',
    definition: 'The specific IP address of the local router doorway on your street.',
    firstSeen: 'Concept 1, Step 4',
  },
  // Add exactly 4-5 more terms here...
};

// 2. Base Stage State for this day
const BASE_STAGE = {
  cables: { uplink: 'unplugged' },
  lights: { router: 'off' },
  tags: {},
};

// 3. Concepts 1 to 4 Definition
export const CONCEPT_1: ConceptDefinition = {
  id: 'c1-gateway',
  number: 1,
  title: 'Leaving the Local Room',
  tagline: 'When two computers live on different streets',
  timeEstimate: '12 min',
  rungs: [
    {
      id: 'c1-r1',
      conceptNumber: 1,
      rungNumber: 1,
      layoutState: 'STATE_A',
      title: 'A packet destined for another street',
      timeEstimate: '2 min',
      newWords: ['router'],
      look: 'Look at the new machine sitting between the two switches.',
      story: 'Your computer is on street 192.168.1. You want to send a message to a server on street 10.0.0. A local switch cannot cross streets on its own.',
      doText: 'Observe the boundary between the two local networks.',
      whyText: 'Switches only switch traffic within a single local street.',
      expectText: 'Notice that neither switch has a direct wire to the other.',
      meaningText: 'To cross between different streets, networks use a doorway device called a router.',
      nextHook: 'Next: how does your computer know where the doorway is?',
      lockMessage: 'Pick an answer to continue.',
      check: {
        type: 'understand',
        question: 'Why can’t Computer A reach the server using only its local switch?',
        options: [
          {
            id: 'opt-b',
            label: 'The server lives on a different street prefix (10.0.0 vs 192.168.1).',
            isCorrect: true, // Distributed: Option A here, Option B elsewhere!
            feedback: 'Spot on! Local switches only forward frames inside their own street.',
          },
          {
            id: 'opt-a',
            label: 'Computer A forgot to turn on its link light.',
            isCorrect: false,
            feedback: 'Computer A’s light is on! The issue is addressing across networks.',
          },
          {
            id: 'opt-c',
            label: 'The switch ran out of memory sockets.',
            isCorrect: false,
            feedback: 'The switch has plenty of sockets; it simply does not route between streets.',
          },
        ],
      },
      entryStageState: {
        ...BASE_STAGE,
      },
    },
    // Add rungs 2 through 6 here...
  ],
};

// Repeat for CONCEPT_2, CONCEPT_3, and CONCEPT_4 (Triage Rulebook)
export const ALL_DAY_X_CONCEPTS: ConceptDefinition[] = [
  CONCEPT_1,
  // CONCEPT_2,
  // CONCEPT_3,
  // CONCEPT_4,
];
```
