// src/types/networking-day1.ts
// Data contracts for Networking Module 1 Day 1 (Full 25-Rung Build Plan)

export type LayoutState =
  | 'STATE_A' // Story only (looking, reading, button questions)
  | 'STATE_B' // Terminal active
  | 'STATE_C' // Address editor active
  | 'STATE_D' // Checklist strip + terminal/editor (Concept 4)
  | 'STATE_E' // Full-screen page (Welcome, Intro, Complete)
  | 'STATE_F'; // Board (sorting three outputs, writing)

export type AddrTag =
  | 'hidden'
  | 'question'
  | 'not-set'
  | { street: string; house: string; split: boolean };

export type CableState =
  | 'absent'
  | 'loose-on-desk'
  | 'one-end-yours'
  | 'one-end-friends'
  | 'both';

export type StageState = {
  layout: 'wide' | 'compact';
  cable: CableState;
  lights: { yours: 'off' | 'on'; friends: 'off' | 'on' };
  tags: { yours: AddrTag; friends: AddrTag };
  bands: 'hidden' | 'shown';
  message: 'none' | 'sending' | 'inside-stopped' | 'roundtrip' | 'asking-around';
  traffic: 'idle' | 'file-transfer';
  terminalGlow: boolean;
  highlight: string[]; // at most 2 ids
  dim: string[]; // ids drawn at 35% opacity
  inset: 'none' | 'socket';
  lookInside: string | null;
  stopwatch: string | null; // e.g., '1 ms'
};

export type CheckType =
  | 'task'
  | 'understand'
  | 'predict'
  | 'explain-back'
  | 'write-and-compare'
  | 'sort'
  | 'diagnose';

export type QuestionOption = {
  id: string;
  label: string;
  isCorrect: boolean;
  feedback: string;
};

export type RungCheck = {
  type: CheckType;
  question?: string;
  options?: QuestionOption[];
  variant2?: {
    question: string;
    options: QuestionOption[];
  };
  expectedCommand?: string;
  allowedTargets?: string[];
  freeTargets?: boolean;
  mustMention?: string[];
  modelSentence?: string;
  modelSentenceSimpler?: string;
  sortItems?: { id: string; snippet: string; targetLabel: string }[];
  sortLabels?: string[];
};

export type RungHint = {
  level: 1 | 2 | 3;
  label: string;
  text: string;
};

export type SimplifiedNote = {
  id: string;
  text: string;
};

export type LookInsideDialog = {
  id: string;
  title: string;
  chipBeside: string;
  pictureDescription: string;
  text: string;
};

export type Day1Rung = {
  id: string;
  conceptNumber: 1 | 2 | 3 | 4;
  rungNumber: number;
  layoutState: LayoutState;
  title: string;
  timeEstimate: string;
  newWords: string[];
  look: string;
  story: string;
  doText?: string;
  whyText?: string;
  expectText?: string;
  meaningText?: string;
  nextHook: string;
  lockMessage: string;
  check: RungCheck;
  hints: [RungHint, RungHint, RungHint];
  simplified?: SimplifiedNote;
  lookInside?: LookInsideDialog;
  entryStageState: StageState;
};

export type ConceptDefinition = {
  number: 1 | 2 | 3 | 4;
  id: string;
  title: string;
  question: string;
  timeEstimate: string;
  goal: string;
  newWordsCount: number;
  hookLine: string;
  rungs: Day1Rung[];
};

export type VocabularyTerm = {
  term: string;
  introducedAt: string;
  firstShownSentence: string;
  tooltip: string;
  myWordsEntry: string;
};
