// src/content/networking/modules/net-02-day2.ts
// Networking Module 2, Day 2: The Shared Wire (Complete 23-Rung Curriculum)
// Strictly adheres to GLOBAL_SPEC.md and DAY_2_THE_SHARED_WIRE.md

import type {
  Day2ConceptDefinition,
  Day2VocabularyTerm,
  Day2Rung,
  Day2StageState,
} from '../../../types/networking-day2';

export const DAY2_VOCABULARY: Record<string, Day2VocabularyTerm> = {
  switch: {
    term: 'switch',
    introducedAt: 'c1-r1',
    firstShownSentence:
      'A box with many sockets that connects multiple computers together is called a switch.',
    tooltip:
      'A device with numbered ports that connects multiple computers on the same street.',
    myWordsEntry: 'Switch: connects multiple computers together.',
  },
  'mac address': {
    term: 'MAC address',
    introducedAt: 'c2-r1',
    firstShownSentence:
      'Inside each network card is a permanent hardware badge, called a MAC address.',
    tooltip:
      "A computer's permanent hardware identifier, burned in at the factory.",
    myWordsEntry: 'MAC address: permanent hardware badge.',
  },
  'subnet mask': {
    term: 'subnet mask',
    introducedAt: 'c2-r3',
    firstShownSentence:
      'The rule that says which numbers belong to the street is called the subnet mask.',
    tooltip:
      'A setting (like 255.255.255.0) that tells your computer how long the street name is.',
    myWordsEntry: 'Subnet mask: tells which numbers are the street.',
  },
  broadcast: {
    term: 'broadcast',
    introducedAt: 'c3-r1',
    firstShownSentence:
      'Sending one message to every computer in the room is called a broadcast.',
    tooltip:
      'A message sent to all computers connected to the same switch.',
    myWordsEntry: 'Broadcast: sending to everyone in the room.',
  },
  arp: {
    term: 'ARP',
    introducedAt: 'c3-r2',
    firstShownSentence:
      'The question that asks “who has this IP address?” is called ARP.',
    tooltip:
      'The roll call a computer uses to discover who owns an IP address.',
    myWordsEntry: 'ARP: asks who owns an IP address.',
  },
  'arp table': {
    term: 'ARP table',
    introducedAt: 'c3-r4',
    firstShownSentence:
      'The computer writes down who answered in its local address book, called the ARP table.',
    tooltip:
      'A temporary address book matching IP addresses to MAC hardware badges.',
    myWordsEntry: 'ARP table: local address book of IP to MAC.',
  },
  'request timed out': {
    term: 'request timed out',
    introducedAt: 'c4-r2',
    firstShownSentence:
      'Your message left the computer, but nobody replied before time ran out. That result is called request timed out.',
    tooltip:
      'Your ping was sent, but the target did not answer before the timer expired.',
    myWordsEntry: 'Request timed out: sent, but no answer came back.',
  },
};

const BASE_STAGE: Day2StageState = {
  layout: 'wide',
  cables: { a: false, b: false, c: false },
  portLeds: { p1: 'off', p2: 'off', p3: 'off', p4: 'off' },
  tags: {
    a: { street: '192.168.1', house: '10', split: true },
    b: { street: '192.168.1', house: '20', split: true },
    c: { street: '192.168.1', house: '30', split: true },
  },
  macBadges: {
    a: '00-1A-2B-3C-4D-10',
    b: '00-1A-2B-3C-4D-20',
    c: '00-1A-2B-3C-4D-30',
  },
  macGlow: { a: false, b: false, c: false },
  bands: 'shown',
  message: 'none',
  traffic: 'idle',
  terminalGlow: false,
  highlight: [],
  dim: [],
  lookInside: null,
  stopwatch: null,
  arpTable: [],
};

// ============================================================================
// CONCEPT 1: THREE COMPUTERS AND A SWITCH (6 rungs, ~13 min)
// ============================================================================
const CONCEPT_1_RUNGS: Day2Rung[] = [
  {
    id: 'c1-r1',
    conceptNumber: 1,
    rungNumber: 1,
    layoutState: 'STATE_A',
    title: 'A third computer arrives',
    timeEstimate: '2 min',
    newWords: ['switch'],
    look: 'Look at Computer C on the far right.',
    story:
      'A teammate joined your desk. Now there are three computers. A single cable can only connect two machines.',
    doText: 'Look at the desk and notice three computers sitting side by side.',
    whyText: 'To see why two machines were simple, but three require something new.',
    expectText: 'Computer C appears on the right side of the desk.',
    meaningText: 'One cable has only two ends. Three computers need a shared meeting point.',
    nextHook: 'How do three computers connect together?',
    lockMessage: 'Take in the three computers to continue.',
    check: {
      type: 'understand',
      question: 'Why can two computers use one cable, but three computers cannot?',
      options: [
        {
          id: 'c1r1-opt-a',
          label: 'A standard cable has only two plugs, so it can only join two ports.',
          isCorrect: true,
          feedback:
            'Exactly! A single patch cable only has two ends. You need a central box for more machines.',
        },
        {
          id: 'c1r1-opt-b',
          label: 'Computer C uses a different electrical voltage.',
          isCorrect: false,
          feedback: 'All computers use standard signals. The physical limitation is the two cable ends.',
        },
      ],
    },
    hints: [
      { level: 1, label: 'Look at the cable ends', text: 'Count how many plugs a regular cable has.' },
      { level: 2, label: 'Two into three', text: 'A single wire cannot plug into three sockets at once.' },
      { level: 3, label: 'Direct answer', text: 'Select option A.' },
    ],
    entryStageState: {
      ...BASE_STAGE,
      highlight: ['comp-c'],
    },
  },
  {
    id: 'c1-r2',
    conceptNumber: 1,
    rungNumber: 2,
    layoutState: 'STATE_A',
    title: 'Meet the switch',
    timeEstimate: '2 min',
    newWords: [],
    look: 'Look at the small box in the middle of the desk.',
    story:
      'A box with many sockets that connects multiple computers together is called a switch. It has four numbered ports.',
    doText: 'Click the switch box to inspect its numbered ports.',
    whyText: 'To see where each computer connects into the network.',
    expectText: 'Port 1, Port 2, Port 3, and Port 4 glow brightly.',
    meaningText: 'Each computer gets its own cable running into one port on the switch.',
    nextHook: 'Let us connect each computer to its port.',
    lockMessage: 'Click the switch box to inspect the ports.',
    simplified: {
      id: 's1',
      text: 'Real switches have 8, 24 or 48 ports. This lab uses 4 ports so the screen stays clear.',
    },
    check: {
      type: 'task',
      expectedCommand: 'click-switch',
    },
    hints: [
      { level: 1, label: 'Find the center box', text: 'The dark metal box with 4 sockets sits between the desks.' },
      { level: 2, label: 'Click to inspect', text: 'Click anywhere on the switch box.' },
      { level: 3, label: 'Direct action', text: 'Click the switch in the center of the canvas.' },
    ],
    entryStageState: {
      ...BASE_STAGE,
      highlight: ['switch-box'],
    },
  },
  {
    id: 'c1-r3',
    conceptNumber: 1,
    rungNumber: 3,
    layoutState: 'STATE_A',
    title: 'Plug all three computers in',
    timeEstimate: '2 min',
    newWords: [],
    look: 'Look at the loose cables on the desk.',
    story:
      'Each computer needs a cable connected to the switch.',
    doText: 'Click the cables to plug Computer A to Port 1, B to Port 2, and C to Port 3.',
    whyText: 'To complete the physical link for all three machines.',
    expectText: 'Port lights 1, 2, and 3 turn solid green.',
    meaningText: 'All three computers are physically linked through the switch.',
    nextHook: 'Now that everyone is connected, can we ping through the switch?',
    lockMessage: 'Plug all three computers into the switch.',
    check: {
      type: 'task',
      expectedCommand: 'plug-all',
    },
    hints: [
      { level: 1, label: 'Click the cables', text: 'Click the loose cables on the desk to seat them into the switch ports.' },
      { level: 2, label: 'Check the lights', text: 'Make sure all three port LEDs illuminate green.' },
      { level: 3, label: 'Direct action', text: 'Click the Connect All Cables button on the stage.' },
    ],
    entryStageState: {
      ...BASE_STAGE,
      cables: { a: false, b: false, c: false },
      portLeds: { p1: 'off', p2: 'off', p3: 'off', p4: 'off' },
    },
  },
  {
    id: 'c1-r4',
    conceptNumber: 1,
    rungNumber: 4,
    layoutState: 'STATE_B',
    title: 'Ping through the switch',
    timeEstimate: '2 min',
    newWords: [],
    look: 'Look at Computer B (192.168.1.20).',
    story:
      'Computer A can now send messages to Computer B through the switch.',
    doText: 'Type ping 192.168.1.20 and press Enter.',
    whyText: 'To test reachability across the switch.',
    expectText: 'Reply from 192.168.1.20: bytes=32 time=1ms.',
    meaningText: 'The switch forwarded your ping directly to Computer B.',
    nextHook: 'Did Computer C see that message too?',
    lockMessage: 'Run ping 192.168.1.20 in the terminal.',
    lookInside: {
      id: 'l1',
      title: 'Inside the switch',
      chipBeside: 'Switch chip',
      pictureDescription: 'A microchip with memory paths forwarding traffic between ports.',
      text:
        'A switch has a microchip that remembers which computer is plugged into each port. It only sends messages to the port that needs them, keeping the other cables quiet.',
    },
    check: {
      type: 'task',
      expectedCommand: 'ping 192.168.1.20',
      allowedTargets: ['192.168.1.20'],
    },
    hints: [
      { level: 1, label: 'Type the command', text: 'Type ping 192.168.1.20 or press Tab.' },
      { level: 2, label: 'Press Enter', text: 'Hit Enter to send the test knock through Port 1 to Port 2.' },
      { level: 3, label: 'Direct command', text: 'Run: ping 192.168.1.20' },
    ],
    entryStageState: {
      ...BASE_STAGE,
      cables: { a: true, b: true, c: true },
      portLeds: { p1: 'green', p2: 'green', p3: 'green', p4: 'off' },
    },
  },
  {
    id: 'c1-r5',
    conceptNumber: 1,
    rungNumber: 5,
    layoutState: 'STATE_A',
    title: 'Prediction: Does Computer C see the ping?',
    timeEstimate: '2 min',
    newWords: [],
    look: 'Look at Computer C on Port 3 while Computer A pings Computer B.',
    story:
      'Computer A sent a message meant only for Computer B.',
    doText: 'Predict whether Computer C receives the ping message.',
    whyText: 'To understand how a switch handles private conversation.',
    expectText: 'The ping travels through Port 1 directly to Port 2. Port 3 stays quiet.',
    meaningText: 'A switch forwards private messages only to the intended recipient.',
    nextHook: 'Why can we not just tie three wires together?',
    lockMessage: 'Answer the prediction to continue.',
    check: {
      type: 'predict',
      question: 'Did the ping message travel across Computer C’s cable?',
      options: [
        {
          id: 'c1r5-opt-a',
          label: 'No. The switch sends it only to Computer B.',
          isCorrect: true,
          feedback:
            'Exactly! A switch is smart. It delivers messages only to the computer that needs them, keeping Computer C’s wire free.',
        },
        {
          id: 'c1r5-opt-b',
          label: 'Yes. All messages go to all computers on the desk.',
          isCorrect: false,
          feedback:
            'Older boxes called hubs used to do that, but switches keep private messages strictly on the destination port.',
        },
      ],
    },
    hints: [
      { level: 1, label: 'Think about privacy', text: 'Does Computer C need to hear messages sent to Computer B?' },
      { level: 2, label: 'Switch behavior', text: 'A switch sends traffic only to the port where the destination lives.' },
      { level: 3, label: 'Direct answer', text: 'Select option A.' },
    ],
    entryStageState: {
      ...BASE_STAGE,
      cables: { a: true, b: true, c: true },
      portLeds: { p1: 'green', p2: 'green', p3: 'green', p4: 'off' },
      message: 'ping-a-b',
    },
  },
  {
    id: 'c1-r6',
    conceptNumber: 1,
    rungNumber: 6,
    layoutState: 'STATE_F',
    title: 'Mastery check: Why do we need a switch?',
    timeEstimate: '3 min',
    newWords: [],
    look: 'Look at the 3-computer star layout on the desk.',
    story:
      'You connected three computers and watched the switch route traffic cleanly.',
    doText: 'Choose the true reason three computers need a central switch.',
    whyText: 'To cement the physical necessity of central port boxes.',
    expectText: 'Confirmation of the star layout principle.',
    meaningText: 'A switch bridges multiple point-to-point links into one shared room.',
    nextHook: 'How does the switch know which machine is which?',
    lockMessage: 'Answer the mastery check to unlock Concept 2.',
    check: {
      type: 'understand',
      question: 'Why can’t three computers talk using only one regular cable?',
      options: [
        {
          id: 'c1r6-opt-a',
          label: 'A cable has only two ends, so three computers need a central box with multiple ports.',
          isCorrect: true,
          feedback:
            'Spot on! Each cable connects one computer to one port on the switch.',
        },
        {
          id: 'c1r6-opt-b',
          label: 'Cables only carry electricity in one direction.',
          isCorrect: false,
          feedback: 'Network cables carry data in both directions. The limitation is having only two physical ends.',
        },
        {
          id: 'c1r6-opt-c',
          label: 'Computer C requires wireless signals.',
          isCorrect: false,
          feedback: 'All three workstations are wired computers.',
        },
      ],
    },
    hints: [
      { level: 1, label: 'Physical ends', text: 'Think about how many plugs are on a cable.' },
      { level: 2, label: 'Central hub', text: 'A central box is needed when you have more than two machines.' },
      { level: 3, label: 'Direct answer', text: 'Select option A.' },
    ],
    entryStageState: {
      ...BASE_STAGE,
      cables: { a: true, b: true, c: true },
      portLeds: { p1: 'green', p2: 'green', p3: 'green', p4: 'off' },
    },
  },
];

// ============================================================================
// CONCEPT 2: THE HARDWARE BADGE (MAC ADDRESS) (5 rungs, ~12 min)
// ============================================================================
const CONCEPT_2_RUNGS: Day2Rung[] = [
  {
    id: 'c2-r1',
    conceptNumber: 2,
    rungNumber: 1,
    layoutState: 'STATE_A',
    title: 'Meet the hardware badge',
    timeEstimate: '2 min',
    newWords: ['mac address'],
    look: 'Look at the badge below each computer’s IP address.',
    story:
      'Inside each network card is a permanent hardware badge, called a MAC address. It was burned in at the factory.',
    doText: 'Click Computer A’s hardware badge to read 00-1A-2B-3C-4D-10.',
    whyText: 'Every network card in the world has a unique hardware identity.',
    expectText: 'Computer A’s hardware badge glows amber.',
    meaningText: 'IP is your postal street address; MAC is your physical fingerprint badge.',
    nextHook: 'What happens if you move your computer to a new room?',
    lockMessage: 'Click Computer A’s hardware badge to inspect it.',
    lookInside: {
      id: 'l2',
      title: 'Why both IP and MAC?',
      chipBeside: 'Identity comparison',
      pictureDescription: 'A government ID card side-by-side with a home envelope address.',
      text:
        'Think of MAC as your National ID card (who you are permanently) and IP as your postal address (where you currently live). You need both so messages find your street and verify who receives them.',
    },
    check: {
      type: 'task',
      expectedCommand: 'inspect-mac-a',
    },
    hints: [
      { level: 1, label: 'Find the amber badge', text: 'Look right below the IP address label on Computer A.' },
      { level: 2, label: 'Click the badge', text: 'Click the badge reading 00-1A-2B-3C-4D-10.' },
      { level: 3, label: 'Direct action', text: 'Click Computer A’s hardware badge on the stage.' },
    ],
    entryStageState: {
      ...BASE_STAGE,
      cables: { a: true, b: true, c: true },
      portLeds: { p1: 'green', p2: 'green', p3: 'green', p4: 'off' },
      highlight: ['mac-a'],
    },
  },
  {
    id: 'c2-r2',
    conceptNumber: 2,
    rungNumber: 2,
    layoutState: 'STATE_A',
    title: 'IP vs MAC comparison',
    timeEstimate: '2 min',
    newWords: [],
    look: 'Compare the two labels above Computer A.',
    story:
      'IP addresses can be changed anytime. A MAC address belongs to the physical card and never changes.',
    doText: 'Consider what changes when a computer moves to a new building.',
    whyText: 'To understand why computers have two distinct kinds of addresses.',
    expectText: 'Clear separation between local street location and permanent hardware identity.',
    meaningText: 'You change postal addresses when moving homes, but keep your passport identity.',
    nextHook: 'How does a computer know which part of the IP is the street?',
    lockMessage: 'Answer the comparison check to continue.',
    simplified: {
      id: 's2',
      text: 'MAC addresses are written in hex numbers (0-9 and A-F). Day 2 only asks you to match them, not calculate hex.',
    },
    check: {
      type: 'understand',
      question: 'If you move your computer to a new office with a new street, which label changes?',
      options: [
        {
          id: 'c2r2-opt-a',
          label: 'The IP address changes to match the new street, but the MAC address stays the same.',
          isCorrect: true,
          feedback:
            'Yes! IP is where you live right now. MAC is who you are permanently.',
        },
        {
          id: 'c2r2-opt-b',
          label: 'The MAC address changes, but the IP address stays the same.',
          isCorrect: false,
          feedback: 'The MAC address was burned into the chip at the factory and never changes.',
        },
        {
          id: 'c2r2-opt-c',
          label: 'Both labels stay identical forever.',
          isCorrect: false,
          feedback: 'IP addresses must change to match the street of the network they connect to.',
        },
      ],
    },
    hints: [
      { level: 1, label: 'Permanent vs temporary', text: 'Which badge is burned in at the factory?' },
      { level: 2, label: 'Moving desks', text: 'Street numbers change when you move; your hardware chip does not.' },
      { level: 3, label: 'Direct answer', text: 'Select option A.' },
    ],
    entryStageState: {
      ...BASE_STAGE,
      cables: { a: true, b: true, c: true },
      portLeds: { p1: 'green', p2: 'green', p3: 'green', p4: 'off' },
      macGlow: { a: true, b: false, c: false },
    },
  },
  {
    id: 'c2-r3',
    conceptNumber: 2,
    rungNumber: 3,
    layoutState: 'STATE_B',
    title: 'Meet the subnet mask',
    timeEstimate: '3 min',
    newWords: ['subnet mask'],
    look: 'Look at the line Subnet Mask . . . : 255.255.255.0 in ipconfig.',
    story:
      'The rule that says which numbers belong to the street is called the subnet mask.',
    doText: 'Run ipconfig and inspect the Subnet Mask line.',
    whyText: 'It tells your computer that the first three numbers (192.168.1) are the street.',
    expectText: 'The Subnet Mask line is bright and glows blue.',
    meaningText: '255.255.255.0 confirms all three computers are neighbors on the same street.',
    nextHook: 'When sending a message, what gets written on the envelope?',
    lockMessage: 'Run ipconfig in the terminal to inspect the mask.',
    simplified: {
      id: 's3',
      text: '255.255.255.0 means the first three numbers are the street. A later day shows other street lengths.',
    },
    check: {
      type: 'task',
      expectedCommand: 'ipconfig',
    },
    hints: [
      { level: 1, label: 'Run the command', text: 'Type ipconfig into the terminal.' },
      { level: 2, label: 'Find the mask line', text: 'Look under Ethernet adapter for Subnet Mask.' },
      { level: 3, label: 'Direct command', text: 'Run: ipconfig' },
    ],
    entryStageState: {
      ...BASE_STAGE,
      cables: { a: true, b: true, c: true },
      portLeds: { p1: 'green', p2: 'green', p3: 'green', p4: 'off' },
    },
  },
  {
    id: 'c2-r4',
    conceptNumber: 2,
    rungNumber: 4,
    layoutState: 'STATE_A',
    title: 'Postal address vs Badge',
    timeEstimate: '2 min',
    newWords: [],
    look: 'Look at the delivery envelope preparing to leave Computer A.',
    story:
      'To deliver a message across a switch, the computer stamps two pieces of delivery information.',
    doText: 'Identify what Computer A stamps on the outer delivery envelope.',
    whyText: 'To understand how computers address messages on a shared network.',
    expectText: 'Both the street IP address and the hardware MAC badge appear on the frame.',
    meaningText: 'The network needs both: IP for the street, MAC for the specific card.',
    nextHook: 'Let us match our three key addressing concepts.',
    lockMessage: 'Answer the envelope addressing check to continue.',
    check: {
      type: 'understand',
      question: 'Computer A wants to send a message to Computer B. What does it stamp on the outer delivery envelope?',
      options: [
        {
          id: 'c2r4-opt-a',
          label: 'Both: Destination IP (the street address) and Destination MAC (the hardware badge).',
          isCorrect: true,
          feedback:
            'Exactly! The network needs the IP to know the street, and the MAC badge to hand it to the exact machine.',
        },
        {
          id: 'c2r4-opt-b',
          label: 'Only the computer’s nickname.',
          isCorrect: false,
          feedback: 'Hardware network chips do not understand informal nicknames.',
        },
        {
          id: 'c2r4-opt-c',
          label: 'Only the switch port number.',
          isCorrect: false,
          feedback: 'Computers do not know which physical port number another machine is plugged into.',
        },
      ],
    },
    hints: [
      { level: 1, label: 'Both addresses', text: 'Think about postal delivery: street address plus recipient name.' },
      { level: 2, label: 'Hardware and software', text: 'Computer A needs both the IP address and the MAC badge.' },
      { level: 3, label: 'Direct answer', text: 'Select option A.' },
    ],
    entryStageState: {
      ...BASE_STAGE,
      cables: { a: true, b: true, c: true },
      portLeds: { p1: 'green', p2: 'green', p3: 'green', p4: 'off' },
    },
  },
  {
    id: 'c2-r5',
    conceptNumber: 2,
    rungNumber: 5,
    layoutState: 'STATE_F',
    title: 'Mastery check: Match the terms',
    timeEstimate: '3 min',
    newWords: [],
    look: 'Review the three addressing terms on your screen.',
    story:
      'You learned the three components that define identity on a local network.',
    doText: 'Match each term to its exact definition.',
    whyText: 'To ensure you never confuse an IP address, a MAC badge, and a subnet mask.',
    expectText: 'All three cards match their definitions.',
    meaningText: 'IP is location, MAC is hardware identity, subnet mask defines street boundaries.',
    nextHook: 'If Computer A only knows the IP, how does it learn Computer B’s MAC badge?',
    lockMessage: 'Match all three terms to unlock Concept 3.',
    check: {
      type: 'sort',
      sortLabels: ['IP address', 'MAC address', 'Subnet mask'],
      sortItems: [
        {
          id: 'sort-ip',
          snippet: 'Where the computer lives on this street.',
          targetLabel: 'IP address',
        },
        {
          id: 'sort-mac',
          snippet: 'Permanent hardware badge on the network card.',
          targetLabel: 'MAC address',
        },
        {
          id: 'sort-mask',
          snippet: 'Rule that defines which numbers belong to the street.',
          targetLabel: 'Subnet mask',
        },
      ],
    },
    hints: [
      { level: 1, label: 'IP = Street', text: 'Match IP address to where the computer lives on this street.' },
      { level: 2, label: 'MAC = Hardware', text: 'Match MAC address to the permanent hardware badge.' },
      { level: 3, label: 'Subnet mask = Rule', text: 'Match Subnet mask to the rule defining street numbers.' },
    ],
    entryStageState: {
      ...BASE_STAGE,
      cables: { a: true, b: true, c: true },
      portLeds: { p1: 'green', p2: 'green', p3: 'green', p4: 'off' },
      macGlow: { a: true, b: true, c: true },
    },
  },
];

// ============================================================================
// CONCEPT 3: ASKING THE ROOM (ARP & ADDRESS BOOK) (6 rungs, ~15 min)
// ============================================================================
const CONCEPT_3_RUNGS: Day2Rung[] = [
  {
    id: 'c3-r1',
    conceptNumber: 3,
    rungNumber: 1,
    layoutState: 'STATE_A',
    title: 'Shouting to the room (Broadcast)',
    timeEstimate: '2 min',
    newWords: ['broadcast'],
    look: 'Watch the golden pulse leave Computer A.',
    story:
      'Sending one message to every computer in the room is called a broadcast. The switch sends it out every port.',
    doText: 'Click the Send Broadcast button on the stage.',
    whyText: 'When you do not know who has a badge, you must ask everyone in the room.',
    expectText: 'A golden wave enters Port 1 and ripples out Port 2 and Port 3 simultaneously.',
    meaningText: 'A broadcast reaches all machines connected to this switch.',
    nextHook: 'What question does Computer A ask the room?',
    lockMessage: 'Click Send Broadcast to watch the ripple.',
    check: {
      type: 'task',
      expectedCommand: 'send-broadcast',
    },
    hints: [
      { level: 1, label: 'Click the button', text: 'Click Send Broadcast on the stage controls.' },
      { level: 2, label: 'Watch the wave', text: 'See how the wave copies out to all connected ports.' },
      { level: 3, label: 'Direct action', text: 'Click the Send Broadcast button.' },
    ],
    entryStageState: {
      ...BASE_STAGE,
      cables: { a: true, b: true, c: true },
      portLeds: { p1: 'green', p2: 'green', p3: 'green', p4: 'off' },
    },
  },
  {
    id: 'c3-r2',
    conceptNumber: 3,
    rungNumber: 2,
    layoutState: 'STATE_B',
    title: 'The question called ARP',
    timeEstimate: '3 min',
    newWords: ['arp'],
    look: 'Read the message bubble: “Who has 192.168.1.20? Tell 192.168.1.10.”',
    story:
      'The question that asks “who has this IP address?” is called ARP.',
    doText: 'Run ping 192.168.1.20 and watch the roll call happen first.',
    whyText: 'Computer A cannot send a ping until it learns Computer B’s MAC badge.',
    expectText: 'An ARP broadcast fans out. Computer B replies with its MAC badge.',
    meaningText: 'Computer B replies directly: “I am 192.168.1.20! My MAC is 00-1A-2B-3C-4D-20.”',
    nextHook: 'Why did Computer C stay silent?',
    lockMessage: 'Run ping 192.168.1.20 to trigger the ARP roll call.',
    simplified: {
      id: 's4',
      text: 'ARP roll calls happen automatically in milliseconds. The lab slows it down so you can see who answers.',
    },
    check: {
      type: 'task',
      expectedCommand: 'ping 192.168.1.20',
      allowedTargets: ['192.168.1.20'],
    },
    hints: [
      { level: 1, label: 'Type the ping', text: 'Type ping 192.168.1.20 and hit Enter.' },
      { level: 2, label: 'Watch the stage', text: 'Notice the golden roll call before the green ping.' },
      { level: 3, label: 'Direct command', text: 'Run: ping 192.168.1.20' },
    ],
    entryStageState: {
      ...BASE_STAGE,
      cables: { a: true, b: true, c: true },
      portLeds: { p1: 'green', p2: 'green', p3: 'green', p4: 'off' },
    },
  },
  {
    id: 'c3-r3',
    conceptNumber: 3,
    rungNumber: 3,
    layoutState: 'STATE_A',
    title: 'Prediction: Why did Computer C ignore it?',
    timeEstimate: '2 min',
    newWords: [],
    look: 'Look at Computer C while Computer A asks who has .20.',
    story:
      'Computer A shouted to the whole room: “Who has 192.168.1.20?”',
    doText: 'Explain why Computer C stayed silent and dropped the request.',
    whyText: 'To understand how computers filter broadcast roll calls.',
    expectText: 'Computer C compares the request against its own address and drops it.',
    meaningText: 'Only the machine with the matching IP address sends an ARP reply.',
    nextHook: 'Where does Computer A save this answer?',
    lockMessage: 'Answer the roll call check to continue.',
    lookInside: {
      id: 'l3',
      title: 'What an ARP packet holds',
      chipBeside: 'Packet format',
      pictureDescription: 'A tiny message packet showing Sender IP, Sender MAC, and Target IP.',
      text:
        'An ARP question has no regular data. It simply asks: “Who has 192.168.1.20? Tell 192.168.1.10.” Computer B replies with its MAC badge.',
    },
    check: {
      type: 'predict',
      question: 'Why didn’t Computer C answer Computer A’s ARP question?',
      options: [
        {
          id: 'c3r3-opt-a',
          label: 'Computer C checked its own label (192.168.1.30), saw it was not .20, and remained silent.',
          isCorrect: true,
          feedback:
            'Correct! Only the computer that owns that IP address is allowed to answer an ARP question.',
        },
        {
          id: 'c3r3-opt-b',
          label: 'Computer C’s cable is broken.',
          isCorrect: false,
          feedback: 'Port 3 is green and healthy. Computer C received the broadcast and safely ignored it.',
        },
        {
          id: 'c3r3-opt-c',
          label: 'Computer C was turned off.',
          isCorrect: false,
          feedback: 'Computer C is on and actively listening to broadcasts on the shared switch.',
        },
      ],
    },
    hints: [
      { level: 1, label: 'Check C’s IP', text: 'What is Computer C’s IP address? Is it .20 or .30?' },
      { level: 2, label: 'Filtering rule', text: 'A computer only answers when its own address is called.' },
      { level: 3, label: 'Direct answer', text: 'Select option A.' },
    ],
    entryStageState: {
      ...BASE_STAGE,
      cables: { a: true, b: true, c: true },
      portLeds: { p1: 'green', p2: 'green', p3: 'green', p4: 'off' },
      message: 'arp-silent',
    },
  },
  {
    id: 'c3-r4',
    conceptNumber: 3,
    rungNumber: 4,
    layoutState: 'STATE_B',
    title: 'Check your address book (arp -a)',
    timeEstimate: '3 min',
    newWords: ['arp table'],
    look: 'Look at the new command suggestion: arp -a.',
    story:
      'The computer writes down who answered in its local address book, called the ARP table.',
    doText: 'Type arp -a and press Enter.',
    whyText: 'To see the list of IP addresses matched to MAC hardware badges.',
    expectText: '192.168.1.20 is matched to 00-1a-2b-3c-4d-20 as dynamic.',
    meaningText: 'Computer A remembered Computer B’s badge. Next time, it doesn’t need to shout!',
    nextHook: 'What happens if you ask for an IP address that nobody owns?',
    lockMessage: 'Run arp -a to inspect the local address book.',
    simplified: {
      id: 's5',
      text: 'Entries in the ARP table expire after a few minutes if no messages are sent.',
    },
    check: {
      type: 'task',
      expectedCommand: 'arp -a',
    },
    hints: [
      { level: 1, label: 'Type the command', text: 'Type arp -a into the terminal.' },
      { level: 2, label: 'Read the table', text: 'Look for the Internet Address and Physical Address columns.' },
      { level: 3, label: 'Direct command', text: 'Run: arp -a' },
    ],
    entryStageState: {
      ...BASE_STAGE,
      cables: { a: true, b: true, c: true },
      portLeds: { p1: 'green', p2: 'green', p3: 'green', p4: 'off' },
      arpTable: [
        { ip: '192.168.1.20', mac: '00-1a-2b-3c-4d-20', type: 'dynamic' },
      ],
    },
  },
  {
    id: 'c3-r5',
    conceptNumber: 3,
    rungNumber: 5,
    layoutState: 'STATE_B',
    title: 'A silent machine on ARP',
    timeEstimate: '3 min',
    newWords: [],
    look: 'What happens when you ping 192.168.1.99?',
    story:
      'Computer A broadcasts: “Who has .99?” Silence. No machine on the switch owns .99.',
    doText: 'Run ping 192.168.1.99 in the terminal.',
    whyText: 'To observe what happens when ARP gets no reply.',
    expectText: 'Reply from 192.168.1.10: Destination host unreachable.',
    meaningText: 'Now you know why Day 1 printed unreachable: ARP timed out with no reply!',
    nextHook: 'Can you explain the complete roll call in your own words?',
    lockMessage: 'Run ping 192.168.1.99 to observe the silent response.',
    check: {
      type: 'task',
      expectedCommand: 'ping 192.168.1.99',
      allowedTargets: ['192.168.1.99'],
    },
    hints: [
      { level: 1, label: 'Type the ping', text: 'Type ping 192.168.1.99 in the terminal.' },
      { level: 2, label: 'Watch the result', text: 'Notice Destination host unreachable after nobody answers ARP.' },
      { level: 3, label: 'Direct command', text: 'Run: ping 192.168.1.99' },
    ],
    entryStageState: {
      ...BASE_STAGE,
      cables: { a: true, b: true, c: true },
      portLeds: { p1: 'green', p2: 'green', p3: 'green', p4: 'off' },
      arpTable: [
        { ip: '192.168.1.20', mac: '00-1a-2b-3c-4d-20', type: 'dynamic' },
      ],
    },
  },
  {
    id: 'c3-r6',
    conceptNumber: 3,
    rungNumber: 6,
    layoutState: 'STATE_F',
    title: 'Mastery check: Explain the roll call',
    timeEstimate: '3 min',
    newWords: [],
    look: 'Review the steps Computer A takes when pinging a neighbor.',
    story:
      'You watched Computer A ask the room with ARP, receive a MAC badge, and save it in its ARP table.',
    doText: 'Write in your own words what happens when Computer A pings a teammate for the first time.',
    whyText: 'Explaining a process in your own words ensures deep conceptual retention.',
    expectText: 'Compare your explanation with the benchmark model sentence.',
    meaningText: 'ARP is the bridge that turns an IP address into a real hardware delivery badge.',
    nextHook: 'What happens when cables and ARP work, but ping still fails?',
    lockMessage: 'Write your explanation and compare it to unlock Concept 4.',
    check: {
      type: 'write-and-compare',
      mustMention: ['arp', 'mac', 'broadcast', 'ip'],
      modelSentence:
        'Computer A broadcasts an ARP roll call asking who owns the IP address. The matching computer replies with its MAC hardware badge, and Computer A saves it in its ARP address book.',
      modelSentenceSimpler:
        'Computer A asks everyone on the switch who owns the IP. The owner replies with its hardware badge, and Computer A writes it down.',
    },
    hints: [
      { level: 1, label: 'Step 1: Broadcast', text: 'Computer A broadcasts an ARP question to everyone on the switch.' },
      { level: 2, label: 'Step 2: Reply', text: 'The matching computer sends back its permanent MAC hardware badge.' },
      { level: 3, label: 'Step 3: Table', text: 'Computer A stores the pairing in its local ARP table.' },
    ],
    entryStageState: {
      ...BASE_STAGE,
      cables: { a: true, b: true, c: true },
      portLeds: { p1: 'green', p2: 'green', p3: 'green', p4: 'off' },
      arpTable: [
        { ip: '192.168.1.20', mac: '00-1a-2b-3c-4d-20', type: 'dynamic' },
      ],
    },
  },
];

// ============================================================================
// CONCEPT 4: FIND THE FAULT ON A SHARED WIRE (6 rungs, ~15 min)
// ============================================================================
const CONCEPT_4_RUNGS: Day2Rung[] = [
  {
    id: 'c4-r1',
    conceptNumber: 4,
    rungNumber: 1,
    layoutState: 'STATE_D',
    title: 'The expanded triage checklist',
    timeEstimate: '2 min',
    newWords: [],
    look: 'Look at the updated triage strip: Port lights on? -> Address & ARP table right? -> Ping replies?',
    story:
      'On a switch network, check port LEDs first, then verify the ARP table, then ping.',
    doText: 'Click the checklist steps to review the 3-step triage sequence.',
    whyText: 'Physical link at the switch must be green before software tables work.',
    expectText: 'All three checklist steps highlight in sequence.',
    meaningText: 'Always check hardware links before suspecting software configuration.',
    nextHook: 'Let us see what happens when the target refuses to talk.',
    lockMessage: 'Review the 3-step checklist to continue.',
    check: {
      type: 'task',
      expectedCommand: 'review-checklist',
    },
    hints: [
      { level: 1, label: 'Step 1: Port lights', text: 'Always check if the green port LED is on.' },
      { level: 2, label: 'Step 2: ARP & IP', text: 'Verify the IP address and check if ARP learned the MAC badge.' },
      { level: 3, label: 'Step 3: Ping', text: 'Send a test ping once the first two steps pass.' },
    ],
    entryStageState: {
      ...BASE_STAGE,
      cables: { a: true, b: true, c: true },
      portLeds: { p1: 'green', p2: 'green', p3: 'green', p4: 'off' },
      arpTable: [
        { ip: '192.168.1.20', mac: '00-1a-2b-3c-4d-20', type: 'dynamic' },
      ],
    },
  },
  {
    id: 'c4-r2',
    conceptNumber: 4,
    rungNumber: 2,
    layoutState: 'STATE_B',
    title: 'Meet Request Timed Out',
    timeEstimate: '3 min',
    newWords: ['request timed out'],
    look: 'Look at Computer C. Its cable is plugged in, port light is green, and ARP succeeded. But ping fails!',
    story:
      'Your message reached Computer C, but Computer C did not answer. That result is called Request timed out.',
    doText: 'Run ping 192.168.1.30 and observe the Request timed out lines.',
    whyText: 'To distinguish between a roll call failure and a target that does not answer.',
    expectText: 'Request timed out appears after your packet was delivered.',
    meaningText: 'Timed out means the destination exists, but dropped or failed to reply.',
    nextHook: 'Time to put our triage checklist into action on workplace tickets.',
    lockMessage: 'Answer the question comparing unreachable and timed out.',
    simplified: {
      id: 's6',
      text: 'Request timed out can also happen if a firewall silently drops your ping.',
    },
    check: {
      type: 'understand',
      question: 'What is the difference between Destination host unreachable and Request timed out?',
      options: [
        {
          id: 'c4r2-opt-a',
          label: 'Unreachable means ARP found nobody with that IP. Timed out means the machine was reached, but never answered back.',
          isCorrect: true,
          feedback:
            'Yes! Unreachable = no one on the street answered the roll call. Timed out = the machine is there, but refused or failed to reply.',
        },
        {
          id: 'c4r2-opt-b',
          label: 'They mean the exact same thing.',
          isCorrect: false,
          feedback: 'They are very different! Unreachable fails at ARP; Timed out reaches the target but gets no answer.',
        },
        {
          id: 'c4r2-opt-c',
          label: 'Timed out means the cable is unplugged.',
          isCorrect: false,
          feedback: 'If the cable were unplugged, the terminal would show Transmit failed or Unreachable.',
        },
      ],
    },
    hints: [
      { level: 1, label: 'Unreachable = ARP', text: 'Unreachable happens when no computer answers the ARP roll call.' },
      { level: 2, label: 'Timed out = No answer', text: 'Timed out means the message reached the destination, but no reply arrived.' },
      { level: 3, label: 'Direct answer', text: 'Select option A.' },
    ],
    entryStageState: {
      ...BASE_STAGE,
      cables: { a: true, b: true, c: true },
      portLeds: { p1: 'green', p2: 'green', p3: 'green', p4: 'off' },
      arpTable: [
        { ip: '192.168.1.20', mac: '00-1a-2b-3c-4d-20', type: 'dynamic' },
        { ip: '192.168.1.30', mac: '00-1a-2b-3c-4d-30', type: 'dynamic' },
      ],
    },
  },
  {
    id: 'c4-r3',
    conceptNumber: 4,
    rungNumber: 3,
    layoutState: 'STATE_D',
    title: 'Ticket #201: Port disconnected at switch',
    timeEstimate: '3 min',
    newWords: [],
    look: 'User says: “Computer C cannot ping anyone.” Look at Port 3 on the switch.',
    story:
      'Step 1 of triage is checking port LEDs. Port 3 light is dark!',
    doText: 'Plug in the cable at Switch Port 3, then run ping 192.168.1.30.',
    whyText: 'Physical link at the switch port must be established first.',
    expectText: 'Port 3 LED turns green and ping succeeds with 1ms replies.',
    meaningText: 'Always check the physical port light before suspecting IP settings.',
    nextHook: 'What if the port light is on, but ping still fails?',
    lockMessage: 'Fix the unplugged port and verify with ping.',
    check: {
      type: 'diagnose',
      expectedCommand: 'ping 192.168.1.30',
    },
    hints: [
      { level: 1, label: 'Check the switch', text: 'Notice that Port 3 LED is completely dark.' },
      { level: 2, label: 'Plug cable', text: 'Click the loose cable end to seat it into Port 3.' },
      { level: 3, label: 'Test with ping', text: 'Type ping 192.168.1.30 to verify the link.' },
    ],
    entryStageState: {
      ...BASE_STAGE,
      cables: { a: true, b: true, c: false },
      portLeds: { p1: 'green', p2: 'green', p3: 'off', p4: 'off' },
    },
  },
  {
    id: 'c4-r4',
    conceptNumber: 4,
    rungNumber: 4,
    layoutState: 'STATE_D',
    title: 'Ticket #202: Wrong subnet on Computer C',
    timeEstimate: '3 min',
    newWords: [],
    look: 'User says: “Computer C is plugged into the switch, but cannot reach Computer A.”',
    story:
      'Port 3 light is green. But check Computer C’s address tag: 192.168.2.30!',
    doText: 'Change Computer C’s IP address to 192.168.1.30 and test with ping.',
    whyText: 'All machines on this switch must live on the same 192.168.1 street.',
    expectText: 'Computer C joins street 192.168.1 and ping replies arrive.',
    meaningText: 'Subnet numbers must match across all neighbors on the same switch.',
    nextHook: 'Ready to solve a ticket completely on your own?',
    lockMessage: 'Fix Computer C’s street number and verify with ping.',
    check: {
      type: 'diagnose',
      expectedCommand: 'ping 192.168.1.30',
    },
    hints: [
      { level: 1, label: 'Compare street numbers', text: 'Computer A is on 192.168.1. Computer C is set to 192.168.2!' },
      { level: 2, label: 'Edit the IP', text: 'Use the address editor tab to set Computer C to 192.168.1.30.' },
      { level: 3, label: 'Ping to confirm', text: 'Run ping 192.168.1.30 to confirm reachability.' },
    ],
    entryStageState: {
      ...BASE_STAGE,
      cables: { a: true, b: true, c: true },
      portLeds: { p1: 'green', p2: 'green', p3: 'green', p4: 'off' },
      tags: {
        a: { street: '192.168.1', house: '10', split: true },
        b: { street: '192.168.1', house: '20', split: true },
        c: { street: '192.168.2', house: '30', split: true },
      },
    },
  },
  {
    id: 'c4-r5',
    conceptNumber: 4,
    rungNumber: 5,
    layoutState: 'STATE_D',
    title: 'Ticket #203: The silent machine (Unassisted)',
    timeEstimate: '3 min',
    newWords: [],
    look: 'User says: “My workstation cannot reach Computer B.” Diagnose using your checklist.',
    story:
      'Check ① Port lights, ② Address & ARP table, and ③ Ping.',
    doText: 'Follow your triage sequence to identify the fault and report the cause.',
    whyText: 'Real workplace troubleshooting requires disciplined dependency order.',
    expectText: 'Accurate root-cause identification backed by physical and ARP evidence.',
    meaningText: 'You now possess a systematic troubleshooting methodology for local networks.',
    nextHook: 'Let us celebrate your mastery of Day 2!',
    lockMessage: 'Select the correct diagnosis based on your investigation.',
    check: {
      type: 'understand',
      question: 'You ran arp -a and saw Computer B’s MAC is missing, and Port 2 LED is off. What is the fault?',
      options: [
        {
          id: 'c4r5-opt-a',
          label: 'Port 2 has no physical link (cable unplugged or loose at the switch).',
          isCorrect: true,
          feedback:
            'Outstanding! Port LED is off, which explains why ARP received no reply and ping failed. Physical link is step 1.',
        },
        {
          id: 'c4r5-opt-b',
          label: 'Computer B has the wrong subnet mask.',
          isCorrect: false,
          feedback: 'A subnet mask mismatch would not turn off the physical link LED on the switch.',
        },
        {
          id: 'c4r5-opt-c',
          label: 'The ARP table is corrupted and needs a reboot.',
          isCorrect: false,
          feedback: 'ARP tables simply cache who answers. If the port is disconnected, no machine can answer.',
        },
      ],
    },
    hints: [
      { level: 1, label: 'Step 1: Check the light', text: 'Port 2 LED is off. What does that tell you?' },
      { level: 2, label: 'Physical layer first', text: 'Without a physical carrier, no ARP or IP traffic can flow.' },
      { level: 3, label: 'Direct answer', text: 'Select option A.' },
    ],
    entryStageState: {
      ...BASE_STAGE,
      cables: { a: true, b: false, c: true },
      portLeds: { p1: 'green', p2: 'off', p3: 'green', p4: 'off' },
    },
  },
  {
    id: 'c4-r6',
    conceptNumber: 4,
    rungNumber: 6,
    layoutState: 'STATE_E',
    title: 'Day 2 Wrap-up & Tomorrow’s Question',
    timeEstimate: '2 min',
    newWords: [],
    look: 'Look at the completed 3-workstation office network.',
    story:
      'You connected multiple computers using a switch, mastered hardware MAC badges, and traced ARP roll calls.',
    doText: 'Review your achievements and discover the question for Day 3.',
    whyText: 'To reflect on your progress and preview the bridge to the outside world.',
    expectText: 'All Day 2 skills unlocked and logged.',
    meaningText: 'You can now build, address, and troubleshoot any local switch network.',
    nextHook: 'How do we send a message to a server on a different street, or across the world?',
    lockMessage: 'Complete Day 2 to unlock your achievement.',
    lookInside: {
      id: 'l4',
      title: 'Viewing MAC on Linux',
      chipBeside: 'Linux terminal',
      pictureDescription: 'A bash shell displaying ip link and ip neigh outputs.',
      text:
        'On Linux, type ip link or cat /sys/class/net/eth0/address to see your MAC badge. Type ip neigh to see your ARP table.',
    },
    check: {
      type: 'understand',
      question: 'We can now talk to any computer on our local switch. What do we need to talk to a server on a different street?',
      options: [
        {
          id: 'c4r6-opt-a',
          label: 'A gateway device (called a router) that connects different streets together.',
          isCorrect: true,
          feedback:
            'Exactly! Switches connect one street. To cross between different streets, you need a router. That is Day 3!',
        },
        {
          id: 'c4r6-opt-b',
          label: 'A longer blue cable that stretches across town.',
          isCorrect: false,
          feedback: 'Cables cannot stretch infinitely. You need a device that routes between different networks.',
        },
      ],
    },
    hints: [
      { level: 1, label: 'Different streets', text: 'A switch only links computers on the same street.' },
      { level: 2, label: 'Leaving the room', text: 'Crossing to another street requires a gateway device.' },
      { level: 3, label: 'Direct answer', text: 'Select option A.' },
    ],
    entryStageState: {
      ...BASE_STAGE,
      cables: { a: true, b: true, c: true },
      portLeds: { p1: 'green', p2: 'green', p3: 'green', p4: 'off' },
      arpTable: [
        { ip: '192.168.1.20', mac: '00-1a-2b-3c-4d-20', type: 'dynamic' },
        { ip: '192.168.1.30', mac: '00-1a-2b-3c-4d-30', type: 'dynamic' },
      ],
    },
  },
];

export const ALL_DAY2_CONCEPTS: Day2ConceptDefinition[] = [
  {
    number: 1,
    id: 'three-computers-and-a-switch',
    title: 'Three computers and a switch',
    question: 'How do more than two computers connect?',
    timeEstimate: '13 min',
    goal: 'Connect three computers through a switch and verify reachability.',
    newWordsCount: 1,
    hookLine: 'Two computers can share a cable. Three computers need a meeting point.',
    rungs: CONCEPT_1_RUNGS,
  },
  {
    number: 2,
    id: 'the-hardware-badge-mac',
    title: 'The hardware badge (MAC address)',
    question: 'How does a computer know which machine is which?',
    timeEstimate: '12 min',
    goal: 'Distinguish permanent hardware MAC badges from temporary IP addresses.',
    newWordsCount: 2,
    hookLine: 'IP is your street address. MAC is your permanent fingerprint.',
    rungs: CONCEPT_2_RUNGS,
  },
  {
    number: 3,
    id: 'asking-the-room-arp',
    title: 'Asking the room (ARP & the address book)',
    question: 'How does Computer A match an IP to a hardware badge?',
    timeEstimate: '15 min',
    goal: 'Explain broadcast roll calls and inspect the ARP address book.',
    newWordsCount: 3,
    hookLine: 'When you do not know who owns an address, you ask the room.',
    rungs: CONCEPT_3_RUNGS,
  },
  {
    number: 4,
    id: 'find-the-fault-shared-wire',
    title: 'Find the fault on a shared wire',
    question: 'How do we troubleshoot a switch network when something breaks?',
    timeEstimate: '15 min',
    goal: 'Use expanded triage order to resolve switch tickets without help.',
    newWordsCount: 1,
    hookLine: 'Port LED first, ARP address book second, ping third.',
    rungs: CONCEPT_4_RUNGS,
  },
];
