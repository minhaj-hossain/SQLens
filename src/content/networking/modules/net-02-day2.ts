// src/content/networking/modules/net-02-day2.ts
// Networking Module 2, Day 2: The Shared Wire (Complete 23-Rung Curriculum)
// Carefully structured with thorough explanations, zero jargon, and authentic diagnostic workflows.

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
      'A central hardware box with numbered sockets (ports) that connects computers together on the same street.',
    myWordsEntry: 'Switch: connects multiple computers together on one local network.',
  },
  port: {
    term: 'port',
    introducedAt: 'c1-r1',
    firstShownSentence:
      'Each physical socket on the switch where you plug in a network cable is called a port.',
    tooltip:
      'A numbered physical socket on a switch or computer where a network cable plugs in.',
    myWordsEntry: 'Port: a physical socket for a network cable.',
  },
  'mac address': {
    term: 'MAC address',
    introducedAt: 'c2-r1',
    firstShownSentence:
      'Inside each network card is a permanent hardware name tag, called a MAC address.',
    tooltip:
      "A computer's hardware name tag built in at the factory, written as six pairs of characters.",
    myWordsEntry: 'MAC address: permanent hardware name tag.',
  },
  broadcast: {
    term: 'broadcast',
    introducedAt: 'c3-r1',
    firstShownSentence:
      'Sending one message out to every computer in the room is called a broadcast.',
    tooltip:
      'A message delivered to every socket connected to the switch.',
    myWordsEntry: 'Broadcast: shouting to everyone connected to the switch.',
  },
  arp: {
    term: 'ARP',
    introducedAt: 'c3-r2',
    firstShownSentence:
      'The roll-call question asking “who has this IP address?” is called ARP.',
    tooltip:
      'The roll-call method a computer uses to discover which name tag owns an IP address.',
    myWordsEntry: 'ARP: roll call that asks who owns an IP address.',
  },
  'arp table': {
    term: 'ARP table',
    introducedAt: 'c3-r4',
    firstShownSentence:
      'The computer writes down who answered in its local address book, called the ARP table.',
    tooltip:
      'A temporary local notebook matching IP addresses to MAC hardware name tags.',
    myWordsEntry: 'ARP table: local notebook matching IP addresses to MAC name tags.',
  },
  'request timed out': {
    term: 'request timed out',
    introducedAt: 'c4-r2',
    firstShownSentence:
      'Your message reached the destination, but no answer came back before the timer expired. That result is called request timed out.',
    tooltip:
      'The destination machine is connected and received the ping, but did not reply back.',
    myWordsEntry: 'Request timed out: target is connected, but gave no answer.',
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
    a: '00-00-5e-00-53-01',
    b: '00-00-5e-00-53-02',
    c: '00-00-5e-00-53-03',
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
  activeLayer: 'sockets',
  showMacBadges: false,
  showAddressTags: false,
  showSwitch: true,
  unlockedLayers: ['sockets'],
  arpTable: [],
};

const CONCEPT_2_BASE_STAGE: Day2StageState = {
  ...BASE_STAGE,
  cables: { a: true, b: true, c: true },
  portLeds: { p1: 'green', p2: 'green', p3: 'green', p4: 'off' },
  showMacBadges: true,
  showAddressTags: true,
  showSwitch: true,
  unlockedLayers: ['sockets', 'addresses', 'tags'],
  activeLayer: 'tags',
};

// =============================================================================
// CONCEPT 1: Three computers need a switch (6 Rungs)
// Hook: How do three computers share one connection?
// Words introduced: switch, port
// =============================================================================
const CONCEPT_1_RUNGS: Day2Rung[] = [
  {
    id: 'c1-r1',
    conceptNumber: 1,
    rungNumber: 1,
    layoutState: 'STATE_A',
    title: 'The three-computer problem',
    timeEstimate: '2 min',
    newWords: ['switch', 'port'],
    look: 'On Day 1, two computers talked through a single cable plugged directly between them. Now look at the desk: a third computer has arrived. A normal network cable has only two ends, and each computer has only one network socket. You cannot physically split one cable to reach two different desks.',
    story:
      'To let three or more computers share one local network without running separate cables between every pair, all machines plug into a central meeting box. A box with many sockets that connects multiple computers together is called a switch. Each physical socket on the switch where you plug in a network cable is called a port.',
    meaningText:
      'The switch sits at the center of the room. Every computer runs one cable directly to an open port on the switch.',
    doText: 'Click the switch box in the center of the desk to inspect its ports.',
    whyText: 'Observing the switch physically grounds how computers meet at a central point.',
    expectText: 'The switch highlights and you see its numbered ports clearly.',
    nextHook: 'Let us inspect the switch up close and see how its ports work.',
    lockMessage: 'Click the switch on the desk to inspect its ports.',
    check: {
      type: 'task',
    },
    hints: [
      {
        level: 1,
        label: 'Observation',
        text: 'Look at the center of the desk between the computers.',
      },
      {
        level: 2,
        label: 'Action',
        text: 'Click on the dark rectangular switch box in the middle of the screen.',
      },
      {
        level: 3,
        label: 'Direct answer',
        text: 'Click directly on the switch body to inspect its numbered ports.',
      },
    ],
    entryStageState: {
      ...BASE_STAGE,
      highlight: ['switch-box'],
      activeLayer: 'sockets',
    },
  },
  {
    id: 'c1-r2',
    conceptNumber: 1,
    rungNumber: 2,
    layoutState: 'STATE_A',
    title: 'Inside the switch ports',
    timeEstimate: '2 min',
    newWords: [],
    look: 'Notice the row of numbered sockets on the front panel: [1], [2], [3], and [4]. Right above each port is a small link light. Right now, all four link lights are dark because no cables are plugged into the switch yet.',
    story:
      'Each port on the switch acts as an independent connection point. When you plug a cable in, the switch and the computer test the electrical wire. If both ends are seated securely, the link light turns green, just like the link light on the back of your computer did on Day 1.',
    doText: 'Observe the four ports on the switch.',
    whyText:
      'Understanding how ports are numbered helps you track which computer connects to which socket.',
    expectText: 'Notice that Port 4 is an extra open port, ready for another machine.',
    nextHook: 'Let us plug all three computers into the switch.',
    lockMessage: 'Answer the question about the switch ports to continue.',
    check: {
      type: 'understand',
      question: 'What do the numbers [1] through [4] on the switch represent?',
      options: [
        {
          id: 'opt-priority',
          label: 'The priority order of which computer gets the fastest internet',
          isCorrect: false,
          feedback:
            'All ports on a modern switch run at equal speed. The numbers are simply physical labels for the sockets.',
        },
          {
          id: 'opt-ports',
          label: 'Numbered sockets (ports) where network cables plug in',
          isCorrect: true,
          feedback:
            'Exactly right. Each number marks an individual port where a computer can plug into the shared network.',
        },
          {
          id: 'opt-version',
          label: 'The version number of the switch software',
          isCorrect: false,
          feedback:
            'These are physical port numbers, just like numbered doors on an office floor.',
        },
        ],
    },
    hints: [
      {
        level: 1,
        label: 'Think about physical sockets',
        text: 'Where do network cables connect to a switch?',
      },
      {
        level: 2,
        label: 'Review the story',
        text: 'Each physical socket where you plug in a cable is called a port.',
      },
      {
        level: 3,
        label: 'Direct answer',
        text: 'Select the option stating they are numbered sockets where network cables plug in.',
      },
    ],
    simplified: {
      id: 's1',
      text: 'Real switches in business offices often have 8, 24, or 48 ports. This lab uses 4 ports so the screen remains clear and easy to read.',
    },
    entryStageState: {
      ...BASE_STAGE,
      highlight: ['switch-box'],
      activeLayer: 'sockets',
    },
  },
  {
    id: 'c1-r3',
    conceptNumber: 1,
    rungNumber: 3,
    layoutState: 'STATE_A',
    title: 'Connecting all three machines',
    timeEstimate: '2 min',
    newWords: [],
    look: 'Three computers sit on the desk: Your computer on the left, Friend’s computer in the middle, and Third computer on the right. Their cables are currently unplugged and lying on the desk.',
    story:
      'We need to connect all three computers to the switch. Your computer will plug into Port 1, Friend’s computer into Port 2, and Third computer into Port 3. Once connected, each machine has an unbroken electrical path into the switch.',
    doText: 'Click the cables to plug all three computers into the switch.',
    whyText:
      'A computer cannot send or receive signals until its physical wire is firmly seated in a port.',
    expectText:
      'Watch the link lights above Port 1, Port 2, and Port 3 turn solid green.',
    nextHook: 'Now that everyone is plugged in, let us test the connection with a ping.',
    lockMessage: 'Click the cables or the Connect All button to link all three computers.',
    check: {
      type: 'task',
    },
    hints: [
      {
        level: 1,
        label: 'Observation',
        text: 'Look at the loose cable ends resting near the switch ports.',
      },
      {
        level: 2,
        label: 'Action',
        text: 'Click on each unplugged cable to seat it into its corresponding switch port.',
      },
      {
        level: 3,
        label: 'Direct answer',
        text: 'Click the loose cables or click Connect All to light up Ports 1, 2, and 3.',
      },
    ],
    entryStageState: {
      ...BASE_STAGE,
      cables: { a: false, b: false, c: false },
      portLeds: { p1: 'off', p2: 'off', p3: 'off', p4: 'off' },
      activeLayer: 'sockets',
    },
  },
  {
    id: 'c1-r4',
    conceptNumber: 1,
    rungNumber: 4,
    layoutState: 'STATE_B',
    title: 'Pinging through the switch',
    timeEstimate: '2 min',
    newWords: [],
    look: 'All three link lights on the switch are solid green. Your computer has address 192.168.1.10. Friend’s computer has address 192.168.1.20. Both are on the 192.168.1 street.',
    story:
      'On Day 1, a ping traveled straight across one direct cable. Now, your message must travel out of your computer, enter Port 1 on the switch, and cross over to Port 2 where Friend’s computer is listening. Let us test if messages can cross the switch.',
    doText: 'Type ping 192.168.1.20 and press Enter.',
    whyText: 'This verifies that the switch successfully moves messages between two connected ports.',
    expectText: 'Four replies will return with time=1ms, confirming the path works.',
    nextHook: 'While your ping traveled to Friend’s computer, what happened to Third computer?',
    lockMessage: 'Run ping 192.168.1.20 in the terminal.',
    check: {
      type: 'task',
      expectedCommand: 'ping 192.168.1.20',
      allowedTargets: ['192.168.1.20'],
    },
    hints: [
      {
        level: 1,
        label: 'Check the prompt',
        text: 'Your computer is on the left at 192.168.1.10. Friend’s computer is at 192.168.1.20.',
      },
      {
        level: 2,
        label: 'Command help',
        text: 'Type ping 192.168.1.20 or click the suggested command chip.',
      },
      {
        level: 3,
        label: 'Direct answer',
        text: 'Press Tab to autofill ping 192.168.1.20 and press Enter.',
      },
    ],
    lookInside: {
      id: 'l1',
      title: 'Inside the switch',
      chipBeside: 'Processor & Memory',
      pictureDescription: 'Inside a switch showing internal microchip connecting ports.',
      text: 'A switch is not just dumb plastic and metal. Inside is a specialized computer chip that inspects incoming messages. It checks where each message needs to go and forwards it only to the intended port, keeping the other cables completely free.',
    },
    entryStageState: {
      ...BASE_STAGE,
      cables: { a: true, b: true, c: true },
      portLeds: { p1: 'green', p2: 'green', p3: 'green', p4: 'off' },
      activeLayer: 'addresses',
      showMacBadges: false,
      showAddressTags: true,
      unlockedLayers: ['sockets', 'addresses'],
    },
  },
  {
    id: 'c1-r5',
    conceptNumber: 1,
    rungNumber: 5,
    layoutState: 'STATE_A',
    title: 'Does Third computer see the ping?',
    timeEstimate: '2 min',
    newWords: [],
    look: 'Look at the three cables. Your computer is plugged into Port 1. Friend’s computer is plugged into Port 2. Third computer is plugged into Port 3.',
    story:
      'When your ping traveled across the switch, it went directly from Port 1 to Port 2. The switch did not send your ping to Port 3. Third computer heard nothing, and its cable remained completely quiet and free for other work. (Before the ping, an automatic roll call was sent to everyone to find Friend’s computer, which Concept 3 explains in detail; but the ping message itself traveled only to Friend’s computer.)',
    meaningText:
      'A switch isolates traffic: when two computers talk, other computers plugged into the switch do not receive their private messages.',
    nextHook: 'What would happen if our team grew and we needed to add a fourth computer?',
    lockMessage: 'Answer the question about traffic isolation to continue.',
    check: {
      type: 'understand',
      question:
        'When Your computer sent the ping to Friend’s computer (192.168.1.20), did Third computer on Port 3 receive the ping message?',
      options: [
        {
          id: 'opt-yes-all',
          label: 'Yes. Every message sent into a switch is copied and sent out of all ports.',
          isCorrect: false,
          feedback:
            'Older, obsolete devices called hubs used to do that, but modern switches do not. A switch forwards the ping only to the port where the destination computer is connected.',
        },
          {
          id: 'opt-broken',
          label: 'No, but only because Third computer’s cable was broken.',
          isCorrect: false,
          feedback:
            'Third computer’s cable is plugged in and healthy (Port 3 light is green). The switch intentionally kept the message away from Port 3 because it was addressed to Friend’s computer.',
        },
          {
          id: 'opt-no-isolation',
          label: 'No. The switch delivered the ping directly to Port 2, leaving Port 3 quiet.',
          isCorrect: true,
          feedback:
            'Correct! A switch directs messages specifically to the recipient’s port. Third computer never receives the ping.',
        },
        ],
    },
    hints: [
      {
        level: 1,
        label: 'Review the story',
        text: 'The story explains that the ping went directly from Port 1 to Port 2.',
      },
      {
        level: 2,
        label: 'Consider the purpose of a switch',
        text: 'Switches keep conversations private between the sender and recipient ports.',
      },
      {
        level: 3,
        label: 'Direct answer',
        text: 'Select the option stating No, the switch delivered the ping directly to Port 2.',
      },
    ],
    entryStageState: {
      ...BASE_STAGE,
      cables: { a: true, b: true, c: true },
      portLeds: { p1: 'green', p2: 'green', p3: 'green', p4: 'off' },
      message: 'ping-a-b',
      activeLayer: 'addresses',
      showMacBadges: false,
      showAddressTags: true,
      unlockedLayers: ['sockets', 'addresses'],
    },
  },
  {
    id: 'c1-r6',
    conceptNumber: 1,
    rungNumber: 6,
    layoutState: 'STATE_A',
    title: 'Adding a fourth computer',
    timeEstimate: '3 min',
    newWords: [],
    look: 'Take a close look at the switch faceplate again. Ports 1, 2, and 3 are currently in use. Port 4 is empty, with its link light off.',
    story:
      'Imagine a new teammate arrives tomorrow with a fourth computer. Because we installed a switch with four ports, we do not need to replace our cables or rewire the office. We simply run one new cable from the new computer into the switch’s open Port 4.',
    doText: 'Consider what equipment is required to connect a fourth computer to this network.',
    whyText: 'This checks your understanding of how a switch enables modular network growth.',
    expectText: 'Connect your mental model of ports to real workplace network expansion.',
    nextHook:
      'The switch sent our ping right to Port 2. But how did the switch know which socket Friend’s computer was plugged into?',
    lockMessage: 'Select the correct answer to complete Concept 1.',
    check: {
      type: 'understand',
      question:
        'A teammate brings a fourth computer to the desk. What do you need to connect them to the network?',
      options: [
        {
          id: 'opt-replace-switch',
          label: 'A completely new switch, because switches can only connect three computers',
          isCorrect: false,
          feedback:
            'Our switch has 4 ports! Port 4 is still open and ready for a new machine.',
        },
          {
          id: 'opt-fourth-port',
          label: 'One network cable to plug the new computer into the switch’s unused Port 4',
          isCorrect: true,
          feedback:
            'Exactly! Switches make network growth simple: just plug the new machine into any available port.',
        },
          {
          id: 'opt-direct-cables',
          label: 'Three separate cables running directly to each existing computer',
          isCorrect: false,
          feedback:
            'That is the messy web we avoided by using a switch! The new computer only needs one cable to the switch.',
        },
        ],
    },
    hints: [
      {
        level: 1,
        label: 'Check open ports',
        text: 'How many unused ports are on the switch right now?',
      },
      {
        level: 2,
        label: 'One cable per machine',
        text: 'Each computer only needs one cable connecting to an open port.',
      },
      {
        level: 3,
        label: 'Direct answer',
        text: 'Choose the option mentioning one network cable plugged into Port 4.',
      },
    ],
    entryStageState: {
      ...BASE_STAGE,
      cables: { a: true, b: true, c: true },
      portLeds: { p1: 'green', p2: 'green', p3: 'green', p4: 'off' },
      activeLayer: 'sockets',
      showMacBadges: false,
      showAddressTags: true,
      unlockedLayers: ['sockets', 'addresses'],
    },
  },
];

// =============================================================================
// CONCEPT 2: Every computer has a name tag (5 Rungs)
// Hook: How does the switch know which socket Friend's computer is on?
// Words introduced: MAC address
// =============================================================================
const CONCEPT_2_RUNGS: Day2Rung[] = [
  {
    id: 'c2-r1',
    conceptNumber: 2,
    rungNumber: 1,
    layoutState: 'STATE_A',
    title: 'The hardware name tag',
    timeEstimate: '2 min',
    newWords: ['mac address'],
    look: 'In Concept 1, we asked: How does the switch know which socket Friend’s computer is on? Look at each computer on the stage. Beneath each monitor, you can now see a new hardware badge.',
    story:
      'Every network card built in a factory is stamped with a unique physical identity badge. Inside each network card is a permanent hardware name tag, called a MAC address. While an IP address is like a street address that can change when you move, your MAC address is like your physical name tag: it identifies the hardware itself.',
    doText: 'Click on Your computer’s hardware name tag badge to inspect it.',
    whyText: 'Learning to identify hardware name tags shows you how the switch distinguishes computers physically.',
    expectText: 'Notice the badge showing 00-00-5e-00-53-01.',
    nextHook: 'Let us inspect the formatting and structure of these hardware badges.',
    lockMessage: 'Click the hardware name tag badge on Your computer.',
    check: {
      type: 'task',
    },
    hints: [
      {
        level: 1,
        label: 'Observation',
        text: 'Look right under the IP address tag on the left computer (Your computer).',
      },
      {
        level: 2,
        label: 'Action',
        text: 'Click on the small badge labeled MAC: 00-00-5e-00-53-01.',
      },
      {
        level: 3,
        label: 'Direct answer',
        text: 'Click the MAC badge on Your computer to complete this inspection.',
      },
    ],
    simplified: {
      id: 's2',
      text: 'Although MAC addresses are stamped into the hardware at the factory, modern operating systems and software can override them (called MAC spoofing). In everyday networking, however, they represent the machine’s physical identity.',
    },
    lookInside: {
      id: 'l2',
      title: 'Why do we need both an IP and a MAC?',
      chipBeside: 'Identity vs Location',
      pictureDescription: 'Comparison of a person’s National ID badge versus their home postal address.',
      text: 'Think of your MAC address as your National ID card: it proves who you are no matter where you travel. Your IP address is your postal address: it tells everyone which street and desk you are sitting at today. You need the postal address to find the neighborhood, and the name tag to hand the message to the right machine.',
    },
    entryStageState: {
      ...CONCEPT_2_BASE_STAGE,
      cables: { a: true, b: true, c: true },
      portLeds: { p1: 'green', p2: 'green', p3: 'green', p4: 'off' },
      highlight: ['mac-a'],
      activeLayer: 'tags',
    },
  },
  {
    id: 'c2-r2',
    conceptNumber: 2,
    rungNumber: 2,
    layoutState: 'STATE_A',
    title: 'Reading the badges',
    timeEstimate: '2 min',
    newWords: [],
    look: 'Compare the three hardware badges on the screen: Your computer has 00-00-5e-00-53-01. Friend’s computer has 00-00-5e-00-53-02. Third computer has 00-00-5e-00-53-03.',
    story:
      'MAC addresses are written as six pairs of hexadecimal characters separated by dashes or colons. Hexadecimal uses numbers 0 through 9 and letters a through f. In real life, no two network cards in the world share the same factory MAC address. (The prefix 00-00-5e shown here is the official range reserved for documentation and learning labs by RFC 7042.)',
    doText: 'Examine the differences between the three hardware name tags.',
    whyText: 'Knowing how MAC addresses look helps you recognize them instantly in diagnostic tools.',
    expectText: 'Notice how each machine has a completely distinct hardware badge ending in 01, 02, and 03.',
    nextHook: 'Now that we know each machine has a name tag, how does the switch learn them?',
    lockMessage: 'Answer the question about MAC address uniqueness to proceed.',
    check: {
      type: 'understand',
      question: 'Which of the following is true about a computer’s MAC address?',
      options: [
        {
          id: 'opt-mac-hardware',
          label: 'It is a physical hardware name tag stamped into the network card at the factory.',
          isCorrect: true,
          feedback:
            'Exactly right. The MAC address is the hardware name tag of the network interface itself.',
        },
          {
          id: 'opt-mac-street',
          label: 'It changes automatically whenever you unplug a cable and plug it into another room.',
          isCorrect: false,
          feedback:
            'That is what an IP address does! The hardware MAC address stays with the computer wherever you carry it.',
        },
          {
          id: 'opt-mac-four',
          label: 'It is made of four numbers separated by dots, like 192.168.1.10.',
          isCorrect: false,
          feedback:
            'Four numbers separated by dots is an IPv4 address. A MAC address uses six pairs of characters, like 00-00-5e-00-53-01.',
        },
        ],
    },
    hints: [
      {
        level: 1,
        label: 'Recall the definition',
        text: 'Review the story: what was stamped into the network card at the factory?',
      },
      {
        level: 2,
        label: 'Compare with IP',
        text: 'IP addresses change by street. MAC addresses belong to the hardware.',
      },
      {
        level: 3,
        label: 'Direct answer',
        text: 'Select the option stating it is a physical hardware name tag stamped into the network card.',
      },
    ],
    entryStageState: {
      ...CONCEPT_2_BASE_STAGE,
      cables: { a: true, b: true, c: true },
      portLeds: { p1: 'green', p2: 'green', p3: 'green', p4: 'off' },
      activeLayer: 'tags',
    },
  },
  {
    id: 'c2-r3',
    conceptNumber: 2,
    rungNumber: 3,
    layoutState: 'STATE_A',
    title: 'The switch’s notebook',
    timeEstimate: '3 min',
    newWords: [],
    look: 'Inside the switch is internal memory. Think of it as a small blank notebook. When the switch was first powered on, its notebook was completely empty: it had no idea which computer was plugged into which port.',
    story:
      'Here is the secret of how the switch learns: whenever a computer sends any electrical signal into a port, the switch looks at the sender’s hardware name tag. When Friend’s computer sends a message into Port 2, the switch immediately writes down in its notebook: “Name tag 00-00-5e-00-53-02 is sitting on Port 2.” The switch learns this automatically without any human configuring it.',
    meaningText:
      'By listening to the sender’s name tag on incoming messages, the switch builds its own map connecting every name tag to its exact physical socket.',
    nextHook: 'Now that the switch has a notebook, how do messages travel between computers?',
    lockMessage: 'Answer the question about how the switch learns port locations.',
    check: {
      type: 'understand',
      question:
        'How does a switch discover that Friend’s computer (00-00-5e-00-53-02) is connected to Port 2?',
      options: [
        {
          id: 'opt-manual-entry',
          label: 'A network administrator had to type every MAC address into the switch before it could work.',
          isCorrect: false,
          feedback:
            'Switches learn automatically! You just plug cables in, and the switch builds its notebook by watching traffic.',
        },
          {
          id: 'opt-learn-sender',
          label: 'The switch reads the sender’s name tag whenever Friend’s computer transmits a message into Port 2.',
          isCorrect: true,
          feedback:
            'Correct! The switch inspects the sender address on incoming messages and records which port they arrived on.',
        },
          {
          id: 'opt-guess-port',
          label: 'The switch guesses randomly and hopes it picks the right port.',
          isCorrect: false,
          feedback:
            'A switch never guesses. It records the exact port where the sender’s electrical signals entered.',
        },
        ],
    },
    hints: [
      {
        level: 1,
        label: 'Think about incoming traffic',
        text: 'What does a message carry that tells the switch who sent it?',
      },
      {
        level: 2,
        label: 'Automatic learning',
        text: 'The switch observes the sender’s MAC address when messages arrive.',
      },
      {
        level: 3,
        label: 'Direct answer',
        text: 'Select the option stating the switch reads the sender’s name tag whenever it transmits a message.',
      },
    ],
    entryStageState: {
      ...CONCEPT_2_BASE_STAGE,
      cables: { a: true, b: true, c: true },
      portLeds: { p1: 'green', p2: 'green', p3: 'green', p4: 'off' },
      highlight: ['switch-box'],
      activeLayer: 'sockets',
    },
  },
  {
    id: 'c2-r4',
    conceptNumber: 2,
    rungNumber: 4,
    layoutState: 'STATE_A',
    title: 'Nested layers: envelope and letter',
    timeEstimate: '3 min',
    newWords: [],
    look: 'Every network message is packaged in two nested layers, like a letter inside a mailing envelope. The outer layer is the delivery envelope. The inner layer is the message inside.',
    story:
      'The outer envelope carries the destination’s hardware name tag (MAC address). The switch reads this outer label so it knows which physical port to send the signal out of. Once delivered, the destination computer opens the envelope and reads the inner letter, which contains the street and house number (IP address) and the actual data. This is why both addresses exist: the switch reads the outer name tag to navigate the room, while the computer reads the inner IP address to process the conversation.',
    meaningText:
      'Switches only need to read the outer MAC envelope to forward signals to the right wire. Computers read the inner IP letter.',
    nextHook: 'Let us see what happens when you physically move a computer to a new desk.',
    lockMessage: 'Answer the question about nested address layers to proceed.',
    check: {
      type: 'understand',
      question: 'Why does a network message need both an outer MAC label and an inner IP letter?',
      options: [
        {
          id: 'opt-redundancy',
          label: 'It is a duplicate backup in case the first address gets erased by static electricity.',
          isCorrect: false,
          feedback:
            'They serve completely different purposes! The switch navigates locally by MAC, while computers organize communication by IP.',
        },
          {
          id: 'opt-switch-reads-ip',
          label: 'The switch only reads the inner IP address and ignores the outer MAC address completely.',
          isCorrect: false,
          feedback:
            'A local switch does not look at IP addresses at all. It forwards messages based on the outer MAC name tag.',
        },
          {
          id: 'opt-layers-purpose',
          label: 'The switch reads the outer MAC address for physical port delivery; the computer reads the inner IP address.',
          isCorrect: true,
          feedback:
            'Precisely right. The switch uses the outer MAC name tag to pick the wire, and the receiving computer uses the inner IP to handle the data.',
        },
        ],
    },
    hints: [
      {
        level: 1,
        label: 'Think about who reads what',
        text: 'Who reads the outer envelope? Who opens and reads the letter inside?',
      },
      {
        level: 2,
        label: 'Review the story',
        text: 'The switch reads the outer label, and the computer reads the inner letter.',
      },
      {
        level: 3,
        label: 'Direct answer',
        text: 'Select the option explaining that the switch reads the outer MAC for port delivery and the computer reads the inner IP.',
      },
    ],
    entryStageState: {
      ...CONCEPT_2_BASE_STAGE,
      cables: { a: true, b: true, c: true },
      portLeds: { p1: 'green', p2: 'green', p3: 'green', p4: 'off' },
      activeLayer: 'tags',
    },
  },
  {
    id: 'c2-r5',
    conceptNumber: 2,
    rungNumber: 5,
    layoutState: 'STATE_A',
    title: 'Moving to a new desk',
    timeEstimate: '2 min',
    newWords: [],
    look: 'Imagine you unplug Third computer (192.168.1.30, MAC 00-00-5e-00-53-03) from this desk, carry the computer down the hall into another department, and plug it into a different network.',
    story:
      'In the new department, the local street is 10.0.0.x instead of 192.168.1.x. To talk to its new neighbors, Third computer must change its IP address to match the new street. But what happens to its hardware name tag? The network card inside the computer did not change, so its MAC address remains 00-00-5e-00-53-03.',
    doText: 'Consider which address changes when a machine moves locations.',
    whyText: 'This confirms you can distinguish temporary street addresses from permanent hardware identities.',
    expectText: 'Connect the physical nature of hardware to the flexibility of network addresses.',
    nextHook: 'Concept 2 complete! You can take a break here, or continue to Concept 3.',
    lockMessage: 'Select the correct outcome to finish Concept 2.',
    check: {
      type: 'understand',
      question:
        'You move Third computer to another desk in a different department. Which address changes?',
      options: [
        {
          id: 'opt-mac-changes-ip-stays',
          label: 'Its MAC address changes, but its IP address is permanent and cannot be changed.',
          isCorrect: false,
          feedback:
            'The opposite is true! The MAC address is built into the physical hardware, while the IP address is configured based on your current location.',
        },
          {
          id: 'opt-ip-changes-mac-stays',
          label: 'Its IP address changes to match the new street, but its hardware MAC address stays the same.',
          isCorrect: true,
          feedback:
            'Perfect! Your street address changes when you move to a new building, but your physical identity travels with you.',
        },
          {
          id: 'opt-both-change',
          label: 'Both addresses are physically tied to the wooden desk and must be replaced.',
          isCorrect: false,
          feedback:
            'A computer keeps its hardware network card (and its MAC address) no matter what desk it sits on.',
        },
        ],
    },
    hints: [
      {
        level: 1,
        label: 'Think about physical hardware',
        text: 'Did the computer get a new network card when it was carried down the hall?',
      },
      {
        level: 2,
        label: 'Street vs Name tag',
        text: 'The street address (IP) updates to match the new room. The name tag (MAC) stays on the machine.',
      },
      {
        level: 3,
        label: 'Direct answer',
        text: 'Choose the option stating IP changes to match the street, but MAC stays the same.',
      },
    ],
    entryStageState: {
      ...CONCEPT_2_BASE_STAGE,
      cables: { a: true, b: true, c: true },
      portLeds: { p1: 'green', p2: 'green', p3: 'green', p4: 'off' },
      activeLayer: 'tags',
    },
  },
];

// =============================================================================
// CONCEPT 3: Asking the room (6 Rungs)
// Hook: How does Your computer find Friend's computer's name tag?
// Words introduced: broadcast, ARP, ARP table
// =============================================================================
const CONCEPT_3_RUNGS: Day2Rung[] = [
  {
    id: 'c3-r1',
    conceptNumber: 3,
    rungNumber: 1,
    layoutState: 'STATE_A',
    title: 'The missing name tag problem',
    timeEstimate: '2 min',
    newWords: ['broadcast'],
    look: 'Your computer wants to send a message to Friend’s computer at 192.168.1.20. You know Friend’s IP address. But as we learned in Concept 2, the switch requires an outer envelope addressed with Friend’s hardware name tag (MAC address) to deliver the message.',
    story:
      'Your computer is freshly turned on and does not know what hardware name tag belongs to 192.168.1.20. It cannot guess. How does it find out? It shouts a question into the switch that reaches every computer plugged into the room. Sending one message out to every computer in the room is called a broadcast.',
    meaningText:
      'A broadcast is a message addressed to "everyone". When the switch receives a broadcast on Port 1, it forwards copies out of Port 2 and Port 3 so everyone can hear.',
    nextHook: 'What exact question does Your computer shout to the room?',
    doText: 'Click the Broadcast button on the stage (or in this card) to simulate shouting to the room.',
    whyText: 'Your computer needs Friend’s hardware name tag (MAC) before it can address the outer envelope.',
    expectText: 'A golden question wave fans out across the switch to every computer plugged into the room.',
    lockMessage: 'Click the Broadcast button on the stage to simulate shouting to the room.',
    check: {
      type: 'task',
    },
    hints: [
      {
        level: 1,
        label: 'Observation',
        text: 'Look at the stage controls at the bottom of the canvas.',
      },
      {
        level: 2,
        label: 'Action',
        text: 'Click the Broadcast button to see the golden ripple pulse fan out across the switch.',
      },
      {
        level: 3,
        label: 'Direct answer',
        text: 'Trigger the broadcast animation to proceed to the next rung.',
      },
    ],
    entryStageState: {
      ...CONCEPT_2_BASE_STAGE,
      cables: { a: true, b: true, c: true },
      portLeds: { p1: 'green', p2: 'green', p3: 'green', p4: 'off' },
      message: 'arp-broadcast',
      activeLayer: 'addresses',
    },
  },
  {
    id: 'c3-r2',
    conceptNumber: 3,
    rungNumber: 2,
    layoutState: 'STATE_A',
    title: 'The roll-call question: ARP',
    timeEstimate: '2 min',
    newWords: ['arp'],
    look: 'Your computer sends a special roll-call question into Port 1. The switch receives it and sends it out to both Friend’s computer (Port 2) and Third computer (Port 3).',
    story:
      'The roll-call question asking “who has this IP address?” is called ARP (Address Resolution Protocol). Your computer broadcasts: “Who has 192.168.1.20? Tell 192.168.1.10.” Third computer hears the roll call, checks its own IP (192.168.1.30), says “that is not me,” and stays quiet. Friend’s computer hears it, recognizes its own address, and sends a direct reply: “I have 192.168.1.20, and my name tag is 00-00-5e-00-53-02!”',
    meaningText:
      'ARP is the bridge that discovers the hardware name tag for any local IP address.',
    nextHook: 'Let us watch this roll-call wave spread across the wires in slow motion.',
    lockMessage: 'Answer the question about how machines handle an ARP roll call.',
    check: {
      type: 'understand',
      question:
        'When Your computer broadcasts an ARP roll call for 192.168.1.20, what does Third computer (192.168.1.30) do?',
      options: [
        {
          id: 'opt-third-replies',
          label: 'Third computer replies saying it does not own that address.',
          isCorrect: false,
          feedback:
            'If every machine replied to say "not me", the network would become clogged with useless chatter! Only the owner replies.',
        },
          {
          id: 'opt-third-forwards',
          label: 'Third computer forwards the question to another switch.',
          isCorrect: false,
          feedback:
            'Third computer is an end workstation, not a switch. It simply drops messages that do not belong to it.',
        },
          {
          id: 'opt-third-ignores',
          label: 'Third computer hears the question, sees it is not for 192.168.1.30, and quietly ignores it.',
          isCorrect: true,
          feedback:
            'Exactly right. Computers only reply to ARP roll calls if their own IP address matches the question.',
        },
        ],
    },
    hints: [
      {
        level: 1,
        label: 'Think about a classroom roll call',
        text: 'When a teacher calls out a student’s name, do all the other students yell "not me"?',
      },
      {
        level: 2,
        label: 'Only the owner responds',
        text: 'Only the computer holding the requested IP address answers back.',
      },
      {
        level: 3,
        label: 'Direct answer',
        text: 'Select the option stating Third computer quietly ignores the question.',
      },
    ],
    simplified: {
      id: 's4',
      text: 'Real ARP roll calls take less than a single millisecond. The lab slows down the animation so you can clearly observe the question fanning out and the reply coming back.',
    },
    lookInside: {
      id: 'l3',
      title: 'What does an ARP message contain?',
      chipBeside: 'Simple Query Format',
      pictureDescription: 'An ARP request structure showing sender IP/MAC and target IP.',
      text: 'An ARP message has no file data, images, or web text. It contains only four simple fields: Sender IP (192.168.1.10), Sender MAC (00-00-5e-00-53-01), Target IP (192.168.1.20), and Target MAC (00-00-00-00-00-00, meaning "tell me!").',
    },
    entryStageState: {
      ...CONCEPT_2_BASE_STAGE,
      cables: { a: true, b: true, c: true },
      portLeds: { p1: 'green', p2: 'green', p3: 'green', p4: 'off' },
      message: 'arp-broadcast',
      activeLayer: 'addresses',
    },
  },
  {
    id: 'c3-r3',
    conceptNumber: 3,
    rungNumber: 3,
    layoutState: 'STATE_A',
    title: 'Watching the roll call',
    timeEstimate: '2 min',
    newWords: [],
    look: 'Notice the golden wave rolling outward across the switch: it leaves Your computer, enters Port 1, and pulses out across Port 2 and Port 3 simultaneously.',
    story:
      'This roll-call wave is the same roll call you experienced on Day 1 when you pinged .99! On Day 1, your computer shouted across the wire, but nobody had .99, so nobody answered. Today, Friend’s computer is plugged into Port 2, so it hears the shout and sends its name tag back directly to your port.',
    doText: 'Watch the roll-call ripple fan out from the switch to both computers.',
    whyText: 'Observing the visual pulse cements the idea of broadcast distribution.',
    expectText: 'Notice how the wave reaches both Port 2 and Port 3 at the same time.',
    nextHook: 'Now that Friend replied, where does Your computer store this information?',
    lockMessage: 'Answer the question about the broadcast destination to continue.',
    check: {
      type: 'understand',
      question: 'Why does the switch send the ARP question out of both Port 2 and Port 3?',
      options: [
        {
          id: 'opt-broadcast-fanout',
          label: 'Because the ARP question is a broadcast, so the switch delivers it to every active port in the room.',
          isCorrect: true,
          feedback:
            'Exactly right. The switch does not know which computer owns 192.168.1.20, so it sends the broadcast to all connected ports.',
        },
          {
          id: 'opt-switch-knows',
          label: 'Because the switch already knew who owned it and wanted to test Third computer.',
          isCorrect: false,
          feedback:
            'The switch does not track IP addresses. It delivers broadcasts to everyone because it was told to ask the entire room.',
        },
          {
          id: 'opt-error',
          label: 'It was an electrical glitch inside the switch.',
          isCorrect: false,
          feedback:
            'This is standard network behavior designed into every Ethernet switch.',
        },
        ],
    },
    hints: [
      {
        level: 1,
        label: 'Remember what a broadcast means',
        text: 'A broadcast means delivering to everyone in the room.',
      },
      {
        level: 2,
        label: 'Switch role',
        text: 'When a switch gets a broadcast, it replicates it to all active ports.',
      },
      {
        level: 3,
        label: 'Direct answer',
        text: 'Select the option explaining it is a broadcast delivered to every active port.',
      },
    ],
    entryStageState: {
      ...CONCEPT_2_BASE_STAGE,
      cables: { a: true, b: true, c: true },
      portLeds: { p1: 'green', p2: 'green', p3: 'green', p4: 'off' },
      message: 'arp-broadcast',
      activeLayer: 'addresses',
    },
  },
  {
    id: 'c3-r4',
    conceptNumber: 3,
    rungNumber: 4,
    layoutState: 'STATE_B',
    title: 'The computer’s notebook: ARP table',
    timeEstimate: '3 min',
    newWords: ['arp table'],
    look: 'Your computer does not want to shout to the entire room every single time it sends a ping. That would waste network bandwidth and interrupt other machines.',
    story:
      'When Friend’s computer answers the roll call, Your computer writes down who answered in its local address book, called the ARP table. The next time you send a ping to 192.168.1.20, Your computer checks its notebook, finds Friend’s name tag (00-00-5e-00-53-02), and creates the outer envelope immediately without shouting to the room. In Windows, you inspect this notebook with the command arp -a.',
    doText: 'Type arp -a and press Enter in the terminal.',
    whyText: 'This displays the local address book matching IP addresses to physical MAC name tags.',
    expectText: 'Notice the table entry: 192.168.1.20 mapped to 00-00-5e-00-53-02.',
    nextHook: 'Now we have two different notebooks on our desk! Let us compare them side by side.',
    lockMessage: 'Run arp -a in the terminal.',
    check: {
      type: 'task',
      expectedCommand: 'arp -a',
      allowedTargets: ['-a'],
    },
    hints: [
      {
        level: 1,
        label: 'Terminal command',
        text: 'Type arp -a in the terminal window.',
      },
      {
        level: 2,
        label: 'Shortcut',
        text: 'Click the suggested command chip labeled arp -a.',
      },
      {
        level: 3,
        label: 'Direct answer',
        text: 'Press Tab to autofill arp -a and press Enter.',
      },
    ],
    simplified: {
      id: 's5',
      text: 'Entries in your computer’s ARP table are not permanent. If you stop communicating with Friend’s computer, the entry expires and disappears after a few minutes (learned automatically). If you ping again later, your computer simply runs another quick roll call.',
    },
    entryStageState: {
      ...CONCEPT_2_BASE_STAGE,
      cables: { a: true, b: true, c: true },
      portLeds: { p1: 'green', p2: 'green', p3: 'green', p4: 'off' },
      arpTable: [
        {
          ip: '192.168.1.20',
          mac: '00-00-5e-00-53-02',
          type: 'dynamic',
        },
      ],
      activeLayer: 'addresses',
    },
  },
  {
    id: 'c3-r5',
    conceptNumber: 3,
    rungNumber: 5,
    layoutState: 'STATE_A',
    title: 'The two notebooks side by side',
    timeEstimate: '3 min',
    newWords: [],
    look: 'Beginners often confuse the switch’s notebook with the computer’s notebook. Look at the two tables side by side: the switch keeps one, and your computer keeps the other.',
    story:
      'The switch’s notebook (MAC table) matches a hardware name tag to a switch port (00-00-5e-00-53-02 ➔ Port 2). Its job is physical: knowing which electrical socket to send signals down. Your computer’s notebook (ARP table) matches an IP address to a hardware name tag (192.168.1.20 ➔ 00-00-5e-00-53-02). Its job is packaging: knowing what hardware name tag to write on the delivery envelope.',
    meaningText:
      'Your computer maps IP ➔ MAC. The switch maps MAC ➔ Port. Together, they guide the message from your application straight to Friend’s socket.',
    nextHook: 'Let us test your understanding of who keeps which notebook.',
    lockMessage: 'Answer the question comparing the two notebooks to proceed.',
    check: {
      type: 'understand',
      question:
        'Which notebook maps an IP address (like 192.168.1.20) to a hardware name tag (MAC address)?',
      options: [
        {
          id: 'opt-switch-table',
          label: 'The switch’s internal port notebook',
          isCorrect: false,
          feedback:
            'The switch does not know about IP addresses! The switch only maps MAC name tags to physical port numbers.',
        },
          {
          id: 'opt-arp-table',
          label: 'Your computer’s ARP table (inspected with arp -a)',
          isCorrect: true,
          feedback:
            'Exactly! Your computer keeps the ARP table to translate IP addresses into hardware MAC name tags.',
        },
          {
          id: 'opt-cable-table',
          label: 'A notebook stored inside the blue cable wire',
          isCorrect: false,
          feedback:
            'Cables are copper wires that carry electrical pulses; they do not have memory or notebooks.',
        },
        ],
    },
    hints: [
      {
        level: 1,
        label: 'Review the two jobs',
        text: 'Who translates an IP address into a MAC address?',
      },
      {
        level: 2,
        label: 'Think about arp -a',
        text: 'You just ran arp -a on your computer, showing IP mapped to Physical Address.',
      },
      {
        level: 3,
        label: 'Direct answer',
        text: 'Select Your computer’s ARP table (inspected with arp -a).',
      },
    ],
    entryStageState: {
      ...CONCEPT_2_BASE_STAGE,
      cables: { a: true, b: true, c: true },
      portLeds: { p1: 'green', p2: 'green', p3: 'green', p4: 'off' },
      arpTable: [
        {
          ip: '192.168.1.20',
          mac: '00-00-5e-00-53-02',
          type: 'dynamic',
        },
      ],
      activeLayer: 'addresses',
    },
  },
  {
    id: 'c3-r6',
    conceptNumber: 3,
    rungNumber: 6,
    layoutState: 'STATE_A',
    title: 'Explaining the whole journey',
    timeEstimate: '3 min',
    newWords: [],
    look: 'Take a step back and look at the whole picture: your terminal, the switch, and the three computers.',
    story:
      'When you type ping 192.168.1.20, your computer checks its ARP table. If it does not know the MAC address, it broadcasts an ARP roll call to the room. Friend’s computer replies with its name tag. Your computer writes the name tag on the outer envelope and sends the ping. The switch reads the outer MAC address and forwards the message out of Port 2.',
    doText: 'Review how an IP address becomes a physical delivery across the switch.',
    whyText: 'Explaining this complete sequence is the core skill of local network fundamentals.',
    expectText: 'Connect all three concepts into one coherent, repeatable mental model.',
    nextHook: 'Now that we understand how a healthy shared network runs, what happens when it breaks?',
    lockMessage: 'Select the correct step sequence to complete Concept 3.',
    check: {
      type: 'understand',
      question:
        'When you ping a new neighbor for the very first time, what happens before your ping message leaves your computer?',
      options: [
        {
          id: 'opt-ping-direct',
          label: 'The ping leaves immediately because the switch knows where every IP is without asking.',
          isCorrect: false,
          feedback:
            'The switch does not know IP addresses! Your computer must discover the MAC address first via ARP.',
        },
          {
          id: 'opt-format-drive',
          label: 'Your computer deletes its address book and formats its hard drive.',
          isCorrect: false,
          feedback:
            'Sending a ping is a safe diagnostic check; it never formats drives!',
        },
          {
          id: 'opt-arp-first',
          label: 'Your computer sends an ARP broadcast to discover the neighbor’s MAC address.',
          isCorrect: true,
          feedback:
            'Spot on! Your computer must learn the destination’s hardware name tag before it can address the outer envelope.',
        },
        ],
    },
    hints: [
      {
        level: 1,
        label: 'Remember the envelope rule',
        text: 'What must be written on the outer envelope before the switch can deliver it?',
      },
      {
        level: 2,
        label: 'Roll call before delivery',
        text: 'Your computer broadcasts an ARP question to find the missing name tag.',
      },
      {
        level: 3,
        label: 'Direct answer',
        text: 'Choose the option stating Your computer sends an ARP broadcast to discover the neighbor’s MAC address.',
      },
    ],
    entryStageState: {
      ...CONCEPT_2_BASE_STAGE,
      cables: { a: true, b: true, c: true },
      portLeds: { p1: 'green', p2: 'green', p3: 'green', p4: 'off' },
      activeLayer: 'addresses',
    },
  },
];

// =============================================================================
// CONCEPT 4: Find the fault on a shared wire (6 Rungs)
// Hook: Nobody answers. Is anyone home?
// Words introduced: request timed out
// =============================================================================
const CONCEPT_4_RUNGS: Day2Rung[] = [
  {
    id: 'c4-r1',
    conceptNumber: 4,
    rungNumber: 1,
    layoutState: 'STATE_A',
    title: 'The 4-step shared wire checklist',
    timeEstimate: '2 min',
    newWords: [],
    look: 'On Day 1, we learned a reliable 3-step triage habit: ① Is the link light on? ② Is the address on the right street? ③ Does ping reply? Now that we have a switch and an address book, we keep that exact habit and add one optional diagnostic step when a ping fails.',
    story:
      'When troubleshooting on a switch, follow our 4-step checklist:\n1. Link light on? (Check both the computer and the switch port lights).\n2. Address right? (Verify the first three numbers match the local street).\n3. Ping replies? (Test communication with ping).\n4. Check arp -a: (If ping fails, check arp -a to see if the computer answered the roll call).',
    meaningText:
      'Step 4 (arp -a) is your secret diagnostic tool: it reveals whether the target computer is physically present on the wire even when it refuses to answer pings.',
    nextHook: 'What does it mean when a ping fails with Request timed out instead of Unreachable?',
    lockMessage: 'Answer the question about our troubleshooting checklist to proceed.',
    check: {
      type: 'understand',
      question:
        'When a ping to a neighbor fails on a switch, why is running arp -a useful as an extra step?',
      options: [
        {
          id: 'opt-arp-repairs-cable',
          label: 'Running arp -a physically repairs bent copper pins in the network cable.',
          isCorrect: false,
          feedback:
            'Software commands cannot physically fix damaged hardware pins. It is a diagnostic inspection tool.',
        },
          {
          id: 'opt-arp-proves-presence',
          label: 'It reveals whether the neighbor answered the roll call, proving they are plugged into the wire.',
          isCorrect: true,
          feedback:
            'Exactly! If their MAC address appears in your ARP table, you know their cable is plugged in and their network card is active.',
        },
          {
          id: 'opt-arp-speeds-up',
          label: 'It doubles the transmission speed of your switch.',
          isCorrect: false,
          feedback:
            'arp -a simply prints your local notebook. It does not alter hardware link speed.',
        },
        ],
    },
    hints: [
      {
        level: 1,
        label: 'Think about evidence',
        text: 'What does having a neighbor’s MAC in your notebook prove?',
      },
      {
        level: 2,
        label: 'Roll-call response',
        text: 'A computer only appears in arp -a if it heard and answered the roll call.',
      },
      {
        level: 3,
        label: 'Direct answer',
        text: 'Select the option stating it reveals whether the neighbor answered the roll call.',
      },
    ],
    entryStageState: {
      ...CONCEPT_2_BASE_STAGE,
      cables: { a: true, b: true, c: true },
      portLeds: { p1: 'green', p2: 'green', p3: 'green', p4: 'off' },
      activeLayer: 'addresses',
    },
  },
  {
    id: 'c4-r2',
    conceptNumber: 4,
    rungNumber: 2,
    layoutState: 'STATE_A',
    title: 'Unreachable vs. Request timed out',
    timeEstimate: '3 min',
    newWords: ['request timed out'],
    look: 'There are two very different ways a ping can fail. Understanding the contrast between them is the hallmark of a skilled network technician.',
    story:
      '“Destination host unreachable” means NOBODY IS HOME: your computer broadcast an ARP roll call, but nobody answered. No name tag was ever found, so your computer could not even send the ping.\n“Request timed out” means SOMEONE IS HOME, BUT NOT ANSWERING: your computer found their name tag in the ARP table and delivered the ping message to their port, but no reply came back before the stopwatch expired.',
    meaningText:
      'Unreachable = roll call failed (unplugged or wrong street). Timed out = roll call succeeded, but the target ignored or blocked the ping.',
    nextHook: 'Let us practice solving real workplace tickets using this contrast.',
    lockMessage: 'Answer the question contrasting Unreachable and Timed out.',
    check: {
      type: 'understand',
      question:
        'Your ping returns "Request timed out", and you run arp -a. What do you expect to see in the ARP table?',
      options: [
        {
          id: 'opt-mac-present',
          label: 'The target’s IP and MAC address ARE listed, proving the machine is on the wire but not replying.',
          isCorrect: true,
          feedback:
            'Spot on! Timed out means the roll call succeeded and the message was delivered, but the target did not send an answer back.',
        },
          {
          id: 'opt-table-empty',
          label: 'The ARP table is completely blank because the target does not exist at all.',
          isCorrect: false,
          feedback:
            'If the ARP table were blank, the ping would have failed with "Destination host unreachable", because no message could even be sent!',
        },
          {
          id: 'opt-router-error',
          label: 'A warning saying you must buy a new router immediately.',
          isCorrect: false,
          feedback:
            'We are on a local switch! We do not need a router to reach computers on our own street.',
        },
        ],
    },
    hints: [
      {
        level: 1,
        label: 'Remember the contrast',
        text: 'Unreachable means nobody answered roll call. Timed out means someone is home.',
      },
      {
        level: 2,
        label: 'Evidence in the notebook',
        text: 'If someone answered the roll call, their MAC address was recorded in arp -a.',
      },
      {
        level: 3,
        label: 'Direct answer',
        text: 'Select the option stating the target’s IP and MAC are listed in the ARP table.',
      },
    ],
    simplified: {
      id: 's6',
      text: 'Request timed out frequently happens when a computer’s operating system firewall is set to ignore incoming ping echo requests for security.',
    },
    entryStageState: {
      ...CONCEPT_2_BASE_STAGE,
      cables: { a: true, b: true, c: true },
      portLeds: { p1: 'green', p2: 'green', p3: 'green', p4: 'off' },
      activeLayer: 'addresses',
    },
  },
  {
    id: 'c4-r3',
    conceptNumber: 4,
    rungNumber: 3,
    layoutState: 'STATE_B',
    title: 'Ticket #201: The dark port light',
    timeEstimate: '3 min',
    newWords: [],
    look: 'Help Desk Ticket #201: “I cannot ping Third computer at 192.168.1.30. It says Destination host unreachable.” Follow our checklist!',
    story:
      'Step 1: Check the link light! Look at Port 3 on the switch: its light is completely DARK, and the cable to Third computer has come loose from the socket. Because the wire is unplugged, your ARP roll call could never reach Third computer, resulting in Destination host unreachable.',
    doText: 'Click the loose cable to plug Third computer back into Port 3, then run ping 192.168.1.30.',
    whyText: 'Physical layer disconnection is always step 1 of network triage.',
    expectText: 'The Port 3 light turns solid green, and ping returns four successful replies.',
    nextHook: 'Ticket #201 resolved! Now let us inspect Ticket #202.',
    lockMessage: 'Plug in the cable to Port 3 and verify ping 192.168.1.30 in the terminal.',
    check: {
      type: 'task',
      expectedCommand: 'ping 192.168.1.30',
      allowedTargets: ['192.168.1.30'],
    },
    hints: [
      {
        level: 1,
        label: 'Check the checklist',
        text: 'Step 1: Is the link light on? Look at Port 3 on the switch.',
      },
      {
        level: 2,
        label: 'Fix physical connection',
        text: 'Click the loose cable to seat it in Port 3. Watch the light turn green.',
      },
      {
        level: 3,
        label: 'Run ping',
        text: 'Type ping 192.168.1.30 in the terminal to verify the fix.',
      },
    ],
    entryStageState: {
      ...CONCEPT_2_BASE_STAGE,
      cables: { a: true, b: true, c: false },
      portLeds: { p1: 'green', p2: 'green', p3: 'off', p4: 'off' },
      activeLayer: 'sockets',
    },
  },
  {
    id: 'c4-r4',
    conceptNumber: 4,
    rungNumber: 4,
    layoutState: 'STATE_C',
    title: 'Ticket #202: The wrong street',
    timeEstimate: '3 min',
    newWords: [],
    look: 'Help Desk Ticket #202: “All link lights are green, but pinging Third computer gives Destination host unreachable again.” Follow our checklist!',
    story:
      'Step 1: Link lights are on. Step 2: Check the addresses! Your computer is on street 192.168.1 (192.168.1.10). Look at Third computer’s address tag: someone typed 192.168.2.30! The first three numbers do not match our street. Third computer is listening on street 192.168.2, so it ignored our 192.168.1 roll call.',
    doText: 'In the address editor, change Third computer’s address from 192.168.2.30 to 192.168.1.30.',
    whyText: 'Computers on the same switch must share the same street address numbers to communicate locally.',
    expectText: 'Notice Third computer’s address band change from purple to matching blue.',
    nextHook: 'Third computer is back on our street. Now let us tackle Ticket #203.',
    lockMessage: 'Change Third computer’s address to 192.168.1.30.',
    check: {
      type: 'task',
    },
    hints: [
      {
        level: 1,
        label: 'Check the checklist',
        text: 'Step 2: Is the address right? Compare 192.168.2 with 192.168.1.',
      },
      {
        level: 2,
        label: 'Address editor',
        text: 'Change the third number from 2 to 1 so it reads 192.168.1.30.',
      },
      {
        level: 3,
        label: 'Direct answer',
        text: 'Click Save Address to update Third computer’s IP to 192.168.1.30.',
      },
    ],
    entryStageState: {
      ...CONCEPT_2_BASE_STAGE,
      cables: { a: true, b: true, c: true },
      portLeds: { p1: 'green', p2: 'green', p3: 'green', p4: 'off' },
      tags: {
        a: { street: '192.168.1', house: '10', split: true },
        b: { street: '192.168.1', house: '20', split: true },
        c: { street: '192.168.2', house: '30', split: true },
      },
      activeLayer: 'addresses',
    },
  },
  {
    id: 'c4-r5',
    conceptNumber: 4,
    rungNumber: 5,
    layoutState: 'STATE_B',
    title: 'Ticket #203: The silent machine',
    timeEstimate: '4 min',
    newWords: [],
    look: 'Help Desk Ticket #203: “Third computer is on 192.168.1.30, its cable light is solid green, but when we ping it, Windows returns: Request timed out.”',
    story:
      'Let us run our diagnosis:\n1. Link light? Solid green (Port 3 is active).\n2. Address? Correct (192.168.1.30 matches our street).\n3. Ping? Fails with Request timed out.\n4. Check arp -a: Look at the terminal output! Third computer’s MAC address (00-00-5e-00-53-03) IS listed in our ARP table! Someone is home! Why did ping fail? Third computer’s firewall was configured to block incoming pings.',
    doText: 'Click Unblock Ping on Third computer to allow ping replies, then run ping 192.168.1.30.',
    whyText:
      'Fixing the firewall completes the diagnosis. Third computer now responds to ping roll calls.',
    expectText: 'Ping returns Reply from 192.168.1.30: bytes=32 time=1ms.',
    nextHook: 'Concept 4 Complete! Ticket #203 resolved.',
    lockMessage: 'Unblock pings and run ping 192.168.1.30 to verify.',
    check: {
      type: 'task',
      expectedCommand: 'ping 192.168.1.30',
      allowedTargets: ['192.168.1.30'],
    },
    hints: [
      {
        level: 1,
        label: 'Evidence of connection',
        text: 'What proved that Third computer heard and answered our roll call?',
      },
      {
        level: 2,
        label: 'Mention key terms',
        text: 'Explain that Third computer’s MAC address was present in the ARP table.',
      },
      {
        level: 3,
        label: 'Model answer',
        text: 'The ARP table showed Third computer’s name tag, proving it was connected while its firewall blocked the ping.',
      },
    ],
    entryStageState: {
      ...CONCEPT_2_BASE_STAGE,
      cables: { a: true, b: true, c: true },
      portLeds: { p1: 'green', p2: 'green', p3: 'green', p4: 'off' },
      arpTable: [
        {
          ip: '192.168.1.30',
          mac: '00-00-5e-00-53-03',
          type: 'dynamic',
        },
      ],
      activeLayer: 'addresses',
    },
  },
  {
    id: 'c4-r6',
    conceptNumber: 4,
    rungNumber: 6,
    layoutState: 'STATE_A',
    title: 'Beyond the local street: The router preview',
    timeEstimate: '2 min',
    newWords: [],
    look: 'Celebrate what you have built: three computers connected to a shared switch, talking with both street addresses (IP) and hardware name tags (MAC), discovering each other via ARP, and running a complete diagnostic checklist.',
    story:
      'A switch is the king of the local room: it connects everyone on the same street (192.168.1.x). But what happens if you want to send a message to a computer on another street across town, or a web server across the world? A switch cannot cross between different streets. To leave your local street, your network needs a doorway device that connects two different streets together.',
    meaningText:
      'Day 2 taught you how machines share a local wire. Day 3 will introduce the device that connects different streets to the wider world: the router.',
    nextHook: 'Day 2 complete! You are ready for the world beyond your local switch.',
    lockMessage: 'Select the bridge question to finish Day 2.',
    check: {
      type: 'understand',
      question:
        'A switch connects computers on the SAME street (like 192.168.1.x). What is needed to reach a computer on a DIFFERENT street?',
      options: [
        {
          id: 'opt-longer-cable',
          label: 'Just a much longer blue network cable plugged into the same switch',
          isCorrect: false,
          feedback:
            'A longer cable on the same switch is still on the same street! Different streets require a gateway.',
        },
          {
          id: 'opt-router-bridge',
          label: 'A doorway device that connects different streets together (introduced on Day 3)',
          isCorrect: true,
          feedback:
            'Exactly right! A switch manages the local room; a doorway device (router) connects different streets together.',
        },
          {
          id: 'opt-faster-switch',
          label: 'A switch with 100 ports running at double speed',
          isCorrect: false,
          feedback:
            'No matter how fast a switch is, it only switches traffic within one local street.',
        },
        ],
    },
    hints: [
      {
        level: 1,
        label: 'Think about streets',
        text: 'A switch handles one local street. How do you leave your street?',
      },
      {
        level: 2,
        label: 'Day 3 preview',
        text: 'Day 3 introduces the device that connects different streets together.',
      },
      {
        level: 3,
        label: 'Direct answer',
        text: 'Select the option mentioning a doorway device connecting different streets together.',
      },
    ],
    lookInside: {
      id: 'l4',
      title: 'Viewing hardware badges on Linux',
      chipBeside: 'ip link & ip neigh',
      pictureDescription: 'Linux terminal showing ip link and ip neigh outputs.',
      text: 'On Linux, you view your network card’s MAC hardware name tag by typing ip link. You inspect your local ARP notebook by typing ip neigh (short for IP neighbors). The concepts are identical on every operating system in the world.',
    },
    entryStageState: {
      ...CONCEPT_2_BASE_STAGE,
      cables: { a: true, b: true, c: true },
      portLeds: { p1: 'green', p2: 'green', p3: 'green', p4: 'off' },
      activeLayer: 'addresses',
    },
  },
];

export const ALL_DAY2_CONCEPTS: Day2ConceptDefinition[] = [
  {
    number: 1,
    id: 'three-computers-need-a-switch',
    title: 'Three computers need a switch',
    question: 'How do three computers share one connection?',
    timeEstimate: '13 min',
    goal: 'Connect three computers through a switch and verify reachability.',
    newWordsCount: 2,
    hookLine: 'Two computers can share a cable. Three computers need a meeting point.',
    rungs: CONCEPT_1_RUNGS,
  },
  {
    number: 2,
    id: 'the-hardware-badge-mac',
    title: 'Every computer has a name tag',
    question: 'How does the switch know which socket Friend’s computer is on?',
    timeEstimate: '12 min',
    goal: 'Distinguish permanent hardware MAC name tags from temporary IP addresses.',
    newWordsCount: 1,
    hookLine: 'IP is your street address. MAC is your permanent hardware name tag.',
    rungs: CONCEPT_2_RUNGS,
  },
  {
    number: 3,
    id: 'asking-the-room-arp',
    title: 'Asking the room',
    question: 'How does Your computer find Friend’s computer’s name tag?',
    timeEstimate: '15 min',
    goal: 'Explain broadcast roll calls and inspect the ARP address book.',
    newWordsCount: 3,
    hookLine: 'When you do not know who owns an address, you ask the room.',
    rungs: CONCEPT_3_RUNGS,
  },
  {
    number: 4,
    id: 'find-the-fault-shared-wire',
    title: 'Find the fault',
    question: 'Nobody answers. Is anyone home?',
    timeEstimate: '15 min',
    goal: 'Use expanded triage order to resolve switch tickets without help.',
    newWordsCount: 1,
    hookLine: 'Link light first, address second, ping third, ARP table fourth.',
    rungs: CONCEPT_4_RUNGS,
  },
];
