// src/types/networking-day3.ts
// Data contracts for Networking Module 3 Day 3: The Router & The Default Gateway
// Adheres strictly to the SQLens Pedagogy & 40/40 Design Health Standards

export type LayoutState =
  | 'STATE_A' // Story only (observing equipment, reading, button questions)
  | 'STATE_B' // Terminal active (ping, arp -a, tracert)
  | 'STATE_C' // Hardware / Gateway editor active (entering default gateway IP)
  | 'STATE_D' // Checklist triage strip + terminal/editor (Concept 4)
  | 'STATE_E' // Full-screen page (Welcome, Intro, Complete)
  | 'STATE_F'; // Board (sorting hop changes, write & compare)

export type AddrTag =
  | 'hidden'
  | 'question'
  | 'not-set'
  | { street: string; house: string; split: boolean };

export type RouterInterface = {
  id: 'eth0' | 'eth1';
  name: string;
  ip: string;
  mac: string;
  streetName: string;
  connected: boolean;
  led: 'green' | 'amber' | 'blinking' | 'off';
};

export type Day3StageState = {
  layout: 'split-streets' | 'compact';
  showRouter: boolean;
  showGatewayBadges: boolean;
  showRoutingTable: boolean;
  showRouterArp: boolean;
  cables: {
    hostA: boolean;     // Computer A to Green Street Switch / Router Port 1
    hostB: boolean;     // Computer B to Orange Street Switch / Router Port 2
    routerEth0: boolean;// Router Port 1 (Green Street 192.168.1.1)
    routerEth1: boolean;// Router Port 2 (Orange Street 192.168.2.1)
  };
  portLeds: {
    hostA: 'green' | 'blinking' | 'off';
    hostB: 'green' | 'blinking' | 'off';
    routerEth0: 'green' | 'amber' | 'blinking' | 'off';
    routerEth1: 'green' | 'amber' | 'blinking' | 'off';
  };
  tags: {
    a: AddrTag;
    b: AddrTag;
    routerEth0: AddrTag;
    routerEth1: AddrTag;
  };
  gateways: {
    a: string; // e.g. '' | '192.168.1.1' | '192.168.2.1'
    b: string; // e.g. '192.168.2.1'
  };
  macBadges: {
    a: string;
    b: string;
    routerEth0: string;
    routerEth1: string;
  };
  message:
    | 'none'
    | 'arp-broadcast-local'
    | 'arp-reply-gateway'
    | 'ping-to-gateway'
    | 'cross-hop-ping'
    | 'cross-hop-reply'
    | 'drop-no-gateway'
    | 'drop-remote-down';
  activePacketHop?: 'none' | 'a-to-gateway' | 'gateway-to-b' | 'b-to-gateway' | 'gateway-to-a';
  highlight: string[];
  dim: string[];
  lookInside: string | null;
  hostArpTable: { ip: string; mac: string; type: 'dynamic' }[];
  routerRoutingTable: { destination: string; nextHop: string; interface: string }[];
  routerArpTable: { ip: string; mac: string; interface: string }[];
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

export type Day3RungCheck = {
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

export type Day3Rung = {
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
  check: Day3RungCheck;
  hints: [RungHint, RungHint, RungHint];
  simplified?: SimplifiedNote;
  lookInside?: LookInsideDialog;
  entryStageState: Day3StageState;
};

export type Day3ConceptDefinition = {
  number: 1 | 2 | 3 | 4;
  id: string;
  title: string;
  question: string;
  timeEstimate: string;
  goal: string;
  newWordsCount: number;
  hookLine: string;
  rungs: Day3Rung[];
};

export type Day3VocabularyTerm = {
  term: string;
  introducedAt: string;
  firstShownSentence: string;
  tooltip: string;
  myWordsEntry: string;
};
