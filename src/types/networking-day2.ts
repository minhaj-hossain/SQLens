// src/types/networking-day2.ts
// Data contracts for Networking Module 2 Day 2: The Shared Wire (Full 23-Rung Build Plan)

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

export type Day2StageState = {
  layout: 'wide' | 'compact';
  cables: {
    a: boolean; // Computer A to Switch Port 1
    b: boolean; // Computer B to Switch Port 2
    c: boolean; // Computer C to Switch Port 3
  };
  portLeds: {
    p1: 'green' | 'blinking' | 'off';
    p2: 'green' | 'blinking' | 'off';
    p3: 'green' | 'blinking' | 'off';
    p4: 'off';
  };
  tags: {
    a: AddrTag;
    b: AddrTag;
    c: AddrTag;
  };
  macBadges: {
    a: string;
    b: string;
    c: string;
  };
  macGlow: {
    a: boolean;
    b: boolean;
    c: boolean;
  };
  bands: 'hidden' | 'shown';
  message:
    | 'none'
    | 'ping-a-b'
    | 'arp-broadcast'
    | 'arp-reply'
    | 'arp-silent'
    | 'ping-c-silent';
  traffic: 'idle' | 'file-transfer';
  terminalGlow: boolean;
  highlight: string[];
  dim: string[];
  lookInside: string | null;
  stopwatch: string | null;
  activeLayer?: 'sockets' | 'addresses' | 'tags';
  arpTable: { ip: string; mac: string; type: 'dynamic' }[];
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

export type Day2RungCheck = {
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

export type Day2Rung = {
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
  check: Day2RungCheck;
  hints: [RungHint, RungHint, RungHint];
  simplified?: SimplifiedNote;
  lookInside?: LookInsideDialog;
  entryStageState: Day2StageState;
};

export type Day2ConceptDefinition = {
  number: 1 | 2 | 3 | 4;
  id: string;
  title: string;
  question: string;
  timeEstimate: string;
  goal: string;
  newWordsCount: number;
  hookLine: string;
  rungs: Day2Rung[];
};

export type Day2VocabularyTerm = {
  term: string;
  introducedAt: string;
  firstShownSentence: string;
  tooltip: string;
  myWordsEntry: string;
};
