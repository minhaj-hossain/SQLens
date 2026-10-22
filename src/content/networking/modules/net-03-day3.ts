// src/content/networking/modules/net-03-day3.ts
// Networking Module 3, Day 3: The Router & The Default Gateway (Full 22-Rung Curriculum)
// Carefully crafted to adhere to the SQLens Pedagogy, Term Gates, and 40/40 Design Health Standards.

import type {
  Day3ConceptDefinition,
  Day3VocabularyTerm,
  Day3Rung,
  Day3StageState,
} from '../../../types/networking-day3';

export const DAY3_VOCABULARY: Record<string, Day3VocabularyTerm> = {
  router: {
    term: 'router',
    introducedAt: 'c2-r1',
    firstShownSentence:
      'A physical device with multiple network cards that connects different streets together is called a router.',
    tooltip:
      'A hardware device that connects two or more different networks and forwards packets between them.',
    myWordsEntry: 'Router: connects different streets together so packets can travel between networks.',
  },
  'default gateway': {
    term: 'default gateway',
    introducedAt: 'c2-r1',
    firstShownSentence:
      'The doorway IP address on your local street where you send mail destined for any other street is your default gateway.',
    tooltip:
      'The local IP address of your router’s interface on your street. Your computer hands all foreign mail to this address.',
    myWordsEntry: 'Default Gateway: the doorway address on your street for reaching the outside world.',
  },
  hop: {
    term: 'hop',
    introducedAt: 'c2-r4',
    firstShownSentence:
      'Each jump from a computer across a router to the next network link is called a hop.',
    tooltip:
      'A single step along the network path from one router to the next.',
    myWordsEntry: 'Hop: one step along the journey from your machine across a router.',
  },
  'routing table': {
    term: 'routing table',
    introducedAt: 'c3-r1',
    firstShownSentence:
      'The router’s internal notebook listing which street connects to which physical port is called a routing table.',
    tooltip:
      'A lookup table inside a router that maps destination network addresses to physical egress interfaces.',
    myWordsEntry: 'Routing table: the router’s internal map of which street is on which port.',
  },
  forwarding: {
    term: 'forwarding',
    introducedAt: 'c3-r2',
    firstShownSentence:
      'Taking a packet arriving on one socket and sending it out the socket matching the destination street is called forwarding.',
    tooltip:
      'Relaying an incoming packet across router interfaces toward its destination network.',
    myWordsEntry: 'Forwarding: passing a packet from an incoming port to an outgoing port toward its goal.',
  },
  traceroute: {
    term: 'traceroute',
    introducedAt: 'c3-r3',
    firstShownSentence:
      'A diagnostic command that records every router doorway your packet stepped through is called traceroute (or tracert).',
    tooltip:
      'A terminal diagnostic command that lists each router hop along the path to a remote host.',
    myWordsEntry: 'Traceroute (tracert): prints the list of router doorways your packet passes through.',
  },
};

// ============================================================================
// BASE STAGE STATES
// ============================================================================

export const CONCEPT_1_BASE_STAGE: Day3StageState = {
  layout: 'split-streets',
  showRouter: false,
  showGatewayBadges: false,
  showRoutingTable: false,
  showRouterArp: false,
  cables: {
    hostA: true,
    hostB: true,
    routerEth0: false,
    routerEth1: false,
  },
  portLeds: {
    hostA: 'green',
    hostB: 'green',
    routerEth0: 'off',
    routerEth1: 'off',
  },
  tags: {
    a: { street: '192.168.1', house: '.10', split: true },
    b: { street: '192.168.2', house: '.20', split: true },
    routerEth0: 'hidden',
    routerEth1: 'hidden',
  },
  gateways: {
    a: '',
    b: '',
  },
  macBadges: {
    a: '00-00-5e-00-53-01',
    b: '00-00-5e-00-53-02',
    routerEth0: '00-00-5e-00-53-fe',
    routerEth1: '00-00-5e-00-53-ff',
  },
  message: 'none',
  highlight: [],
  dim: [],
  lookInside: null,
  hostArpTable: [],
  routerRoutingTable: [],
  routerArpTable: [],
};

export const CONCEPT_2_BASE_STAGE: Day3StageState = {
  ...CONCEPT_1_BASE_STAGE,
  showRouter: true,
  showGatewayBadges: true,
  cables: {
    hostA: true,
    hostB: true,
    routerEth0: true,
    routerEth1: true,
  },
  portLeds: {
    hostA: 'green',
    hostB: 'green',
    routerEth0: 'green',
    routerEth1: 'green',
  },
  tags: {
    a: { street: '192.168.1', house: '.10', split: true },
    b: { street: '192.168.2', house: '.20', split: true },
    routerEth0: { street: '192.168.1', house: '.1', split: true },
    routerEth1: { street: '192.168.2', house: '.1', split: true },
  },
  gateways: {
    a: '',
    b: '192.168.2.1',
  },
  hostArpTable: [],
  routerRoutingTable: [
    { destination: '192.168.1.0', nextHop: 'Direct (Port 1)', interface: 'eth0' },
    { destination: '192.168.2.0', nextHop: 'Direct (Port 2)', interface: 'eth1' },
  ],
  routerArpTable: [],
};

export const CONCEPT_3_BASE_STAGE: Day3StageState = {
  ...CONCEPT_2_BASE_STAGE,
  showRoutingTable: true,
  showRouterArp: true,
  gateways: {
    a: '192.168.1.1',
    b: '192.168.2.1',
  },
  hostArpTable: [
    { ip: '192.168.1.1', mac: '00-00-5e-00-53-fe', type: 'dynamic' },
  ],
  routerArpTable: [
    { ip: '192.168.1.10', mac: '00-00-5e-00-53-01', interface: 'eth0' },
    { ip: '192.168.2.20', mac: '00-00-5e-00-53-02', interface: 'eth1' },
  ],
};

// ============================================================================
// CONCEPT 1: THE DEAD END (5 RUNGS)
// ============================================================================

const CONCEPT_1_RUNGS: Day3Rung[] = [
  {
    id: 'c1-r1',
    conceptNumber: 1,
    rungNumber: 1,
    layoutState: 'STATE_A',
    title: 'Two separate streets',
    timeEstimate: '2 min',
    newWords: [],
    look: 'Observe the canvas: Your computer sits on Green Street (192.168.1.x), while Friend’s computer sits across the divide on Orange Street (192.168.2.x).',
    story:
      'On Day 1, you wired two computers together. On Day 2, you connected multiple machines together on the same switch.\n\nNow, look at our lab layout:\n1. Your computer has address `192.168.1.10`. Its street name is `192.168.1`.\n2. Friend’s computer has address `192.168.2.20`. Its street name is `192.168.2`.\n\nThere is no wire bridging the gap between them. How do two different streets communicate?',
    nextHook: 'Let’s try sending a ping to see what happens when streets do not match.',
    lockMessage: 'Select your answer to understand the street boundary',
    check: {
      type: 'understand',
      question: 'Why do Computer A and Computer B belong to different networks?',
      options: [
        {
          id: 'opt-different-street',
          label: 'Their street prefixes differ: 192.168.1 vs 192.168.2',
          isCorrect: true,
          feedback:
            'Spot on! The first three numbers identify the street. Because they differ, these machines do not live on the same local wire.',
        },
        {
          id: 'opt-different-mac',
          label: 'Because their hardware MAC addresses were made by different factories',
          isCorrect: false,
          feedback:
            'MAC addresses are just hardware name tags. What determines local street boundaries is the IP street prefix.',
        },
        {
          id: 'opt-different-cables',
          label: 'Because one computer uses blue wire and the other uses black wire',
          isCorrect: false,
          feedback:
            'Cable color does not affect network logic. The IP address prefix defines the logical street.',
        },
      ],
    },
    hints: [
      { level: 1, label: 'General Direction', text: 'Look closely at the first three octets of both IP addresses.' },
      { level: 2, label: 'Specific Clue', text: 'Computer A starts with 192.168.1. Computer B starts with 192.168.2.' },
      { level: 3, label: 'Direct Answer', text: 'Select the option noting that their street prefixes differ: 192.168.1 vs 192.168.2.' },
    ],
    lookInside: {
      id: 'li-streets',
      title: 'The Street Prefix Rule',
      chipBeside: 'Subnet Boundary',
      pictureDescription: 'Diagram comparing 192.168.1.x and 192.168.2.x street names.',
      text: 'In standard home and small office setups, the first three numbers define the neighborhood street. When the street numbers match, machines talk directly over a switch. When they differ, a switch cannot help them.',
    },
    entryStageState: CONCEPT_1_BASE_STAGE,
  },
  {
    id: 'c1-r2',
    conceptNumber: 1,
    rungNumber: 2,
    layoutState: 'STATE_B',
    title: 'The ping across the divide',
    timeEstimate: '3 min',
    newWords: [],
    look: 'Your terminal is open on Computer A. Try pinging Computer B’s address on Orange Street.',
    story:
      'Let’s test what happens when you type `ping 192.168.2.20` into your terminal:\n\nStep 1: Your computer checks its local notebook.\nStep 2: It realizes `192.168.2.20` is NOT on Green Street (`192.168.1`).\nStep 3: Because no doorway has been configured, your operating system immediately halts with an error.\n\nType the command below to see the exact message.',
    doText: 'Type ping 192.168.2.20 in the terminal and press Enter.',
    expectText: 'Notice the immediate error: Destination host unreachable.',
    nextHook: 'Why did it say unreachable before even sending a single electrical pulse across the room?',
    lockMessage: 'Run ping 192.168.2.20 in the terminal',
    check: {
      type: 'task',
      expectedCommand: 'ping 192.168.2.20',
    },
    hints: [
      { level: 1, label: 'General Direction', text: 'Run the ping command with Computer B’s IP address.' },
      { level: 2, label: 'Specific Clue', text: 'Type ping 192.168.2.20 and press Enter or click the terminal chip.' },
      { level: 3, label: 'Direct Answer', text: 'Click the suggested chip [ping 192.168.2.20] above the terminal.' },
    ],
    entryStageState: {
      ...CONCEPT_1_BASE_STAGE,
      message: 'drop-no-gateway',
    },
  },
  {
    id: 'c1-r3',
    conceptNumber: 1,
    rungNumber: 3,
    layoutState: 'STATE_A',
    title: 'Why the switch is silent',
    timeEstimate: '2 min',
    newWords: [],
    look: 'On Day 2, when you pinged on the same street, an ARP broadcast shouted across all switch sockets.',
    story:
      'Remember Day 2? When Computer A wanted to find Computer B on the same street, it shouted an ARP broadcast:\n\n`"Who has 192.168.1.20? Tell 192.168.1.10!"`\n\nWhy didn’t Computer A shout for `192.168.2.20` over the switch?\n\n1. A switch only copies electrical frames between sockets on the same local wire.\n2. A computer will **never** broadcast an ARP shout onto its local switch for an address that belongs to a different street.\n3. Without a designated doorway, your computer knows shouting is futile.',
    nextHook: 'Let’s check your computer’s ARP notebook to verify.',
    lockMessage: 'Predict why Computer A refused to ARP for 192.168.2.20',
    check: {
      type: 'predict',
      question: 'Why didn’t Computer A shout an ARP broadcast for 192.168.2.20?',
      options: [
        {
          id: 'opt-broken-card',
          label: 'Computer A’s network card ran out of power',
          isCorrect: false,
          feedback:
            'The network card is working fine. The operating system prevented the transmission logically.',
        },
        {
          id: 'opt-knows-diff-street',
          label: 'Your computer sees 192.168.2 is a different street and knows local ARP cannot reach it',
          isCorrect: true,
          feedback:
            'Exactly! Computers check the street name first. If it is foreign, local ARP broadcast is skipped.',
        },
        {
          id: 'opt-switch-blocked',
          label: 'The switch automatically converted the ping into an email',
          isCorrect: false,
          feedback:
            'Switches are simple Layer 2 hardware; they do not convert packets into emails.',
        },
      ],
    },
    hints: [
      { level: 1, label: 'General Direction', text: 'Does Computer A think Computer B is in the same room?' },
      { level: 2, label: 'Specific Clue', text: 'Compare 192.168.1.10 and 192.168.2.20. Are they on the same street?' },
      { level: 3, label: 'Direct Answer', text: 'Choose the option explaining that your computer knows the different street cannot be reached by local ARP.' },
    ],
    entryStageState: CONCEPT_1_BASE_STAGE,
  },
  {
    id: 'c1-r4',
    conceptNumber: 1,
    rungNumber: 4,
    layoutState: 'STATE_B',
    title: 'Inspecting the empty notebook',
    timeEstimate: '2 min',
    newWords: [],
    look: 'Open Computer A’s terminal and check your ARP table with arp -a.',
    story:
      'In Day 2, running `arp -a` revealed all the computers you had talked to on your local switch.\n\nRun `arp -a` now to see what Computer A recorded after attempting to reach Computer B.',
    doText: 'Type arp -a in the terminal and press Enter.',
    expectText: 'Notice: "No ARP entries found." Computer A did not record Computer B.',
    nextHook: 'No entries found! What physical device is missing from the middle of the room?',
    lockMessage: 'Run arp -a in the terminal',
    check: {
      type: 'task',
      expectedCommand: 'arp -a',
    },
    hints: [
      { level: 1, label: 'General Direction', text: 'Inspect the local ARP table.' },
      { level: 2, label: 'Specific Clue', text: 'Type arp -a and press Enter.' },
      { level: 3, label: 'Direct Answer', text: 'Click the [arp -a] chip above the terminal.' },
    ],
    entryStageState: CONCEPT_1_BASE_STAGE,
  },
  {
    id: 'c1-r5',
    conceptNumber: 1,
    rungNumber: 5,
    layoutState: 'STATE_F',
    title: 'The rule of the dead end',
    timeEstimate: '3 min',
    newWords: [],
    look: 'Summarize the physical limitation of switches and separate streets.',
    story:
      'You have witnessed the Dead End:\n\n1. **A Switch** connects machines on the **same street**.\n2. When destination street numbers don’t match, the switch **cannot help you**.\n3. To leave Green Street and reach Orange Street, you need a specialized device that has **one foot in each street**.\n\nWrite a short explanation to solidify this concept.',
    nextHook: 'In Concept 2, we introduce this doorway device: The Router.',
    lockMessage: 'Complete the summary explanation',
    check: {
      type: 'explain-back',
      question: 'Explain why a switch alone cannot connect 192.168.1.10 to 192.168.2.20:',
      mustMention: ['different', 'street', 'switch'],
      modelSentence:
        'A switch only repeats frames within one local street (192.168.1). Because Computer B is on a different street (192.168.2), the switch cannot bridge them without a router.',
      options: [
        {
          id: 'opt-summary-wrong1',
          label: 'A switch needs higher voltage batteries to reach 192.168.2.20',
          isCorrect: false,
          feedback: 'Voltage is not the issue; logical routing boundaries are.',
        },
        {
          id: 'opt-summary-correct',
          label: 'A switch only operates inside a single local street; crossing between 192.168.1 and 192.168.2 requires a doorway device',
          isCorrect: true,
          feedback: 'Outstanding! You have mastered why switches alone hit a dead end when crossing streets.',
        },
        {
          id: 'opt-summary-wrong2',
          label: 'Switches only work on Mondays and Tuesdays',
          isCorrect: false,
          feedback: 'Switches run 24/7!',
        },
      ],
    },
    hints: [
      { level: 1, label: 'General Direction', text: 'Focus on what a switch is built for versus what crossing streets requires.' },
      { level: 2, label: 'Specific Clue', text: 'Remember that switches stay within one street.' },
      { level: 3, label: 'Direct Answer', text: 'Select the option stating that a switch only operates inside a single local street.' },
    ],
    entryStageState: CONCEPT_1_BASE_STAGE,
  },
];

// ============================================================================
// CONCEPT 2: THE DOORWAY DEVICE (ROUTER & DEFAULT GATEWAY) (6 RUNGS)
// ============================================================================

const CONCEPT_2_RUNGS: Day3Rung[] = [
  {
    id: 'c2-r1',
    conceptNumber: 2,
    rungNumber: 1,
    layoutState: 'STATE_A',
    title: 'Meet the router',
    timeEstimate: '2 min',
    newWords: ['router', 'default gateway'],
    look: 'Look at the center of the canvas! A new device has appeared between Green Street and Orange Street.',
    story:
      'Behold the **Router**!\n\nA router is a computer with multiple network cards. Notice its two physical interfaces:\n1. **Port 1 (`eth0`)**: Lives on **Green Street** with address `192.168.1.1`.\n2. **Port 2 (`eth1`)**: Lives on **Orange Street** with address `192.168.2.1`.\n\nBecause the router has an address on Green Street, it can act as the **doorway** for Computer A. In networking, this doorway address is called your **Default Gateway**.',
    nextHook: 'Let’s physically plug the network cables into both router ports.',
    lockMessage: 'Confirm what makes the router unique',
    check: {
      type: 'understand',
      question: 'What allows a router to connect Green Street and Orange Street?',
      options: [
        {
          id: 'opt-metal-case',
          label: 'It has a heavier metal case than a regular switch',
          isCorrect: false,
          feedback: 'Case material does not dictate network capability.',
        },
        {
          id: 'opt-two-interfaces',
          label: 'It has physical network interfaces on BOTH streets (192.168.1.1 and 192.168.2.1)',
          isCorrect: true,
          feedback:
            'Exactly! It has one foot on Green Street and one foot on Orange Street, allowing it to bridge the two worlds.',
        },
        {
          id: 'opt-wireless-magic',
          label: 'It ignores IP addresses and beams data through the air',
          isCorrect: false,
          feedback: 'This is a physical wired router connecting two copper Ethernet links.',
        },
      ],
    },
    hints: [
      { level: 1, label: 'General Direction', text: 'Look at the IP addresses assigned to the router’s two ports.' },
      { level: 2, label: 'Specific Clue', text: 'Port 1 is 192.168.1.1. Port 2 is 192.168.2.1.' },
      { level: 3, label: 'Direct Answer', text: 'Select the option noting that it has physical interfaces on both streets.' },
    ],
    lookInside: {
      id: 'li-router-hardware',
      title: 'Inside a Dual-Homed Router',
      chipBeside: 'Router Hardware',
      pictureDescription: 'Illustration showing a router with two separate network interface cards (NICs).',
      text: 'Unlike a regular PC with one network jack, a router has multiple independent network cards. Each port has its own distinct IP address, its own MAC hardware name tag, and its own physical link LED.',
    },
    entryStageState: {
      ...CONCEPT_2_BASE_STAGE,
      cables: { hostA: true, hostB: true, routerEth0: false, routerEth1: false },
      portLeds: { hostA: 'green', hostB: 'green', routerEth0: 'off', routerEth1: 'off' },
    },
  },
  {
    id: 'c2-r2',
    conceptNumber: 2,
    rungNumber: 2,
    layoutState: 'STATE_C',
    title: 'Plugging in the router cables',
    timeEstimate: '2 min',
    newWords: [],
    look: 'Look at the dangling cables between the computers and the router ports.',
    story:
      'Before any data can move, physical electricity must flow:\n\n1. Cable 1 connects Computer A’s switch to Router Port 1 (`eth0`).\n2. Cable 2 connects Computer B’s switch to Router Port 2 (`eth1`).\n\nClick the **Plug Router Cables** button to connect both lines and watch the green LEDs illuminate!',
    doText: 'Click "Plug Router Cables" to attach both Ethernet lines.',
    expectText: 'Both router port link LEDs glow solid emerald.',
    nextHook: 'Both links are live! But does Computer A know where the doorway is yet?',
    lockMessage: 'Plug in the router cables',
    check: {
      type: 'task',
    },
    hints: [
      { level: 1, label: 'General Direction', text: 'Connect the physical cables to the router.' },
      { level: 2, label: 'Specific Clue', text: 'Click the button below to connect the cables.' },
      { level: 3, label: 'Direct Answer', text: 'Click "Plug Router Cables" in the action area.' },
    ],
    entryStageState: {
      ...CONCEPT_2_BASE_STAGE,
      cables: { hostA: true, hostB: true, routerEth0: false, routerEth1: false },
      portLeds: { hostA: 'green', hostB: 'green', routerEth0: 'off', routerEth1: 'off' },
    },
  },
  {
    id: 'c2-r3',
    conceptNumber: 2,
    rungNumber: 3,
    layoutState: 'STATE_C',
    title: 'Configuring the Default Gateway',
    timeEstimate: '3 min',
    newWords: [],
    look: 'Inspect Computer A’s network settings card. Notice the Default Gateway field is currently blank!',
    story:
      'The router is physically connected, but Computer A does not automatically know where the exit door is!\n\nIf you tell Computer A:\n`Default Gateway: 192.168.1.1`\n\nThen whenever you type an address that is NOT on `192.168.1.x`, Computer A knows: *"Send this packet to the doorway at 192.168.1.1."*\n\nEnter `192.168.1.1` into Computer A’s gateway setting and save.',
    doText: 'Enter 192.168.1.1 into the Default Gateway field and click Save.',
    expectText: 'Computer A’s gateway badge updates to 192.168.1.1 in glowing emerald.',
    nextHook: 'Now that the doorway is configured, let’s test reaching it with ping.',
    lockMessage: 'Set Computer A’s Default Gateway to 192.168.1.1',
    check: {
      type: 'task',
    },
    hints: [
      { level: 1, label: 'General Direction', text: 'Set the gateway IP on Computer A.' },
      { level: 2, label: 'Specific Clue', text: 'Enter 192.168.1.1 in the input field and click Save Gateway.' },
      { level: 3, label: 'Direct Answer', text: 'Type 192.168.1.1 into the box and press Save.' },
    ],
    entryStageState: {
      ...CONCEPT_2_BASE_STAGE,
      gateways: { a: '', b: '192.168.2.1' },
    },
  },
  {
    id: 'c2-r4',
    conceptNumber: 2,
    rungNumber: 4,
    layoutState: 'STATE_B',
    title: 'Pinging the doorway',
    timeEstimate: '2 min',
    newWords: ['hop'],
    look: 'Test connectivity to your local doorway: ping 192.168.1.1.',
    story:
      'Always test the doorway first!\n\nBefore trying to reach across the entire world, verify that your computer can reach its own local gateway.\n\nType `ping 192.168.1.1` in the terminal below.\n\nThis single jump from your computer to the router is called **one hop**.',
    doText: 'Type ping 192.168.1.1 in the terminal.',
    expectText: 'Notice: Reply from 192.168.1.1: bytes=32 time<1ms. Success!',
    nextHook: 'The doorway is open! Now what happens in Computer A’s ARP table?',
    lockMessage: 'Run ping 192.168.1.1 in the terminal',
    check: {
      type: 'task',
      expectedCommand: 'ping 192.168.1.1',
    },
    hints: [
      { level: 1, label: 'General Direction', text: 'Ping the router interface on Green Street.' },
      { level: 2, label: 'Specific Clue', text: 'Type ping 192.168.1.1 and hit Enter.' },
      { level: 3, label: 'Direct Answer', text: 'Click [ping 192.168.1.1] above the terminal.' },
    ],
    entryStageState: {
      ...CONCEPT_2_BASE_STAGE,
      gateways: { a: '192.168.1.1', b: '192.168.2.1' },
      message: 'ping-to-gateway',
    },
  },
  {
    id: 'c2-r5',
    conceptNumber: 2,
    rungNumber: 5,
    layoutState: 'STATE_A',
    title: 'Whose name tag does Computer A need?',
    timeEstimate: '3 min',
    newWords: [],
    look: 'Think back to Day 2: to send an electrical frame across the wire, Computer A needs a hardware MAC name tag.',
    story:
      'Here is the golden rule of local networks:\n\n1. Computer A wants to send data to Computer B (`192.168.2.20`).\n2. Computer A knows Computer B is on a **different street**.\n3. Computer A cannot talk to Computer B directly.\n4. So Computer A places the letter in an envelope addressed physically to **the Gateway Doorway** (`192.168.1.1`)!\n\nWhose MAC address does Computer A look up in its notebook?',
    nextHook: 'Let’s check arp -a to verify.',
    lockMessage: 'Select whose MAC address is needed',
    check: {
      type: 'predict',
      question: 'When sending data to 192.168.2.20, whose physical MAC address does Computer A place on the local wire?',
      options: [
        {
          id: 'opt-router-mac',
          label: 'The Router’s Gateway Port 1 MAC address (00-00-5e-00-53-fe)',
          isCorrect: true,
          feedback:
            'Bulls-eye! This is one of the most important concepts in all of networking: on the local wire, the packet is physically addressed to the Router Doorway!',
        },
        {
          id: 'opt-dest-mac',
          label: 'Computer B’s MAC address directly',
          isCorrect: false,
          feedback:
            'Computer A cannot reach Computer B directly over the local wire, so it cannot use Computer B’s MAC tag.',
        },
        {
          id: 'opt-random-mac',
          label: 'A random MAC address made up by the keyboard',
          isCorrect: false,
          feedback: 'Hardware switches and routers require exact matching MAC addresses.',
        },
      ],
    },
    hints: [
      { level: 1, label: 'General Direction', text: 'Who is physically receiving the electrical frame on Green Street?' },
      { level: 2, label: 'Specific Clue', text: 'Computer A sends the physical frame to its local doorway (the router).' },
      { level: 3, label: 'Direct Answer', text: 'Select the Router’s Gateway Port 1 MAC address.' },
    ],
    entryStageState: {
      ...CONCEPT_2_BASE_STAGE,
      gateways: { a: '192.168.1.1', b: '192.168.2.1' },
    },
  },
  {
    id: 'c2-r6',
    conceptNumber: 2,
    rungNumber: 6,
    layoutState: 'STATE_B',
    title: 'Inspecting the Gateway in ARP',
    timeEstimate: '2 min',
    newWords: [],
    look: 'Run arp -a on Computer A to see the newly learned doorway entry.',
    story:
      'Run `arp -a` in the terminal.\n\nLook at the table:\n- Internet Address: `192.168.1.1`\n- Physical Address: `00-00-5e-00-53-fe` (The Router’s Green Street port)\n\nNotice that Computer B (`192.168.2.20`) is **NOT** in this table! Your computer only needs to know the physical name tag of the doorway.',
    doText: 'Type arp -a in the terminal and press Enter.',
    expectText: 'See 192.168.1.1 mapped to 00-00-5e-00-53-fe.',
    nextHook: 'In Concept 3, watch what the router does when the packet arrives at the door!',
    lockMessage: 'Run arp -a in the terminal',
    check: {
      type: 'task',
      expectedCommand: 'arp -a',
    },
    hints: [
      { level: 1, label: 'General Direction', text: 'Check the ARP table.' },
      { level: 2, label: 'Specific Clue', text: 'Type arp -a in the terminal.' },
      { level: 3, label: 'Direct Answer', text: 'Click the [arp -a] chip above the terminal.' },
    ],
    entryStageState: {
      ...CONCEPT_2_BASE_STAGE,
      gateways: { a: '192.168.1.1', b: '192.168.2.1' },
      hostArpTable: [
        { ip: '192.168.1.1', mac: '00-00-5e-00-53-fe', type: 'dynamic' },
      ],
    },
  },
];

// ============================================================================
// CONCEPT 3: THE HANDOFF IN MOTION (5 RUNGS)
// ============================================================================

const CONCEPT_3_RUNGS: Day3Rung[] = [
  {
    id: 'c3-r1',
    conceptNumber: 3,
    rungNumber: 1,
    layoutState: 'STATE_A',
    title: 'The Router’s Map: The Routing Table',
    timeEstimate: '3 min',
    newWords: ['routing table'],
    look: 'Observe the Routing Table drawer located on the central router.',
    story:
      'How does the router know where to send a packet once it arrives?\n\nIt checks its **Routing Table**—a simple map of connected streets:\n\n1. Destination `192.168.1.0` ➔ Send out Port 1 (`eth0`) [Green Street]\n2. Destination `192.168.2.0` ➔ Send out Port 2 (`eth1`) [Orange Street]\n\nWhen a packet destined for `192.168.2.20` arrives at Port 1, the router consults line 2 of its table and knows: *"This belongs to Orange Street. Hand it over to Port 2!"*',
    nextHook: 'Now let’s launch a live ping across the router and watch the animation!',
    lockMessage: 'Verify your understanding of the routing table',
    check: {
      type: 'understand',
      question: 'What is the primary job of a router’s routing table?',
      options: [
        {
          id: 'opt-store-passwords',
          label: 'To store user passwords and credit card numbers',
          isCorrect: false,
          feedback: 'Routers do not store passwords in routing tables; they route packets.',
        },
        {
          id: 'opt-map-streets',
          label: 'To map destination network streets to the correct physical exit port',
          isCorrect: true,
          feedback:
            'Correct! The routing table tells the router which wire leads toward the destination street.',
        },
        {
          id: 'opt-measure-speed',
          label: 'To measure how hot the router’s cooling fan is running',
          isCorrect: false,
          feedback: 'That is hardware telemetry, not a routing table.',
        },
      ],
    },
    hints: [
      { level: 1, label: 'General Direction', text: 'What does a map do?' },
      { level: 2, label: 'Specific Clue', text: 'It maps streets to physical exit ports.' },
      { level: 3, label: 'Direct Answer', text: 'Select the option stating it maps destination network streets to physical exit ports.' },
    ],
    lookInside: {
      id: 'li-routing-table',
      title: 'Real Routing Tables',
      chipBeside: 'netstat -r / ip route',
      pictureDescription: 'Terminal showing route print on Windows and ip route on Linux.',
      text: 'Every router, laptop, and phone has a routing table! On Windows, type `route print` to see yours. On Linux or macOS, type `ip route`. You will see your local network entries and a default entry (`0.0.0.0`) pointing to your gateway router.',
    },
    entryStageState: CONCEPT_3_BASE_STAGE,
  },
  {
    id: 'c3-r2',
    conceptNumber: 3,
    rungNumber: 2,
    layoutState: 'STATE_B',
    title: 'The cross-street ping in motion',
    timeEstimate: '3 min',
    newWords: ['forwarding'],
    look: 'Type ping 192.168.2.20 and watch the glowing packet traverse the stage.',
    story:
      'Now that the gateway is configured and the router is listening, run the ping again!\n\nWatch the full journey:\n1. **Hop 1:** Computer A sends the packet across Green Street to Router Port 1.\n2. **The Handoff:** The router inspects the destination IP (`192.168.2.20`), looks up Orange Street in its table, and **forwards** the packet out Port 2.\n3. **Hop 2:** The packet arrives at Computer B on Orange Street!\n4. **The Return:** Computer B sends the reply back to its gateway (`192.168.2.1`), which forwards it back to Computer A.',
    doText: 'Type ping 192.168.2.20 in the terminal.',
    expectText: 'Reply from 192.168.2.20: bytes=32 time=2ms TTL=127. Success!',
    nextHook: 'Notice the TTL dropped from 128 to 127! Let’s trace the exact hops using tracert.',
    lockMessage: 'Run ping 192.168.2.20 in the terminal',
    check: {
      type: 'task',
      expectedCommand: 'ping 192.168.2.20',
    },
    hints: [
      { level: 1, label: 'General Direction', text: 'Ping Computer B on Orange Street.' },
      { level: 2, label: 'Specific Clue', text: 'Type ping 192.168.2.20 in the terminal.' },
      { level: 3, label: 'Direct Answer', text: 'Click [ping 192.168.2.20] above the terminal.' },
    ],
    entryStageState: {
      ...CONCEPT_3_BASE_STAGE,
      message: 'cross-hop-ping',
    },
  },
  {
    id: 'c3-r3',
    conceptNumber: 3,
    rungNumber: 3,
    layoutState: 'STATE_B',
    title: 'Tracing the hops: tracert',
    timeEstimate: '3 min',
    newWords: ['traceroute'],
    look: 'Run tracert 192.168.2.20 in your terminal.',
    story:
      'How can an engineer prove that a packet actually walked through a router?\n\nWe use **`tracert`** (on Windows) or **`traceroute`** (on Mac/Linux).\n\nType `tracert 192.168.2.20` in the terminal to see each router doorway printed one by one.',
    doText: 'Type tracert 192.168.2.20 in the terminal and press Enter.',
    expectText: 'Notice Hop 1 (192.168.1.1) and Hop 2 (192.168.2.20). Trace complete.',
    nextHook: 'Look inside the packet at the router. What changed and what stayed the same?',
    lockMessage: 'Run tracert 192.168.2.20 in the terminal',
    check: {
      type: 'task',
      expectedCommand: 'tracert 192.168.2.20',
    },
    hints: [
      { level: 1, label: 'General Direction', text: 'Run the traceroute command.' },
      { level: 2, label: 'Specific Clue', text: 'Type tracert 192.168.2.20.' },
      { level: 3, label: 'Direct Answer', text: 'Click [tracert 192.168.2.20] above the terminal.' },
    ],
    entryStageState: {
      ...CONCEPT_3_BASE_STAGE,
      message: 'cross-hop-ping',
    },
  },
  {
    id: 'c3-r4',
    conceptNumber: 3,
    rungNumber: 4,
    layoutState: 'STATE_A',
    title: 'What changes, what stays the same?',
    timeEstimate: '3 min',
    newWords: [],
    look: 'Inspect the packet headers before and after passing through the router.',
    story:
      'This is one of the deepest truths in computer networking:\n\n- **IP Addresses stay the same** from start to finish! Source IP is always `192.168.1.10`, and Destination IP is always `192.168.2.20`.\n- **MAC Addresses rewrite at every router hop!**\n  - On Green Street: Source MAC = Computer A, Destination MAC = Router Port 1.\n  - On Orange Street: Source MAC = Router Port 2, Destination MAC = Computer B.\n\nThink of the IP address as the postal address written on the letter, and the MAC address as the delivery van carrying it on this specific street.',
    nextHook: 'Let’s sort these properties on the board to prove mastery.',
    lockMessage: 'Confirm what changes across a router hop',
    check: {
      type: 'understand',
      question: 'When a packet crosses a router from one street to another, which header changes?',
      options: [
        {
          id: 'opt-ip-changes',
          label: 'The Destination IP address changes to 0.0.0.0',
          isCorrect: false,
          feedback: 'IP addresses stay constant so the destination knows where it came from.',
        },
        {
          id: 'opt-mac-changes',
          label: 'The MAC hardware addresses are rewritten for each local link, while IP addresses remain constant',
          isCorrect: true,
          feedback:
            'Brilliant! MAC addresses belong only to the local wire. IP addresses endure across the entire journey.',
        },
        {
          id: 'opt-all-change',
          label: 'All letters and numbers change into binary emojis',
          isCorrect: false,
          feedback: 'Network protocols follow strict, disciplined header formats.',
        },
      ],
    },
    hints: [
      { level: 1, label: 'General Direction', text: 'Recall the postal address vs delivery van analogy.' },
      { level: 2, label: 'Specific Clue', text: 'The postal address (IP) stays the same. The local van (MAC) changes.' },
      { level: 3, label: 'Direct Answer', text: 'Select the option stating MAC addresses are rewritten while IP addresses remain constant.' },
    ],
    lookInside: {
      id: 'li-packet-anatomy',
      title: 'Layer 2 Frame vs Layer 3 Packet',
      chipBeside: 'Packet Anatomy',
      pictureDescription: 'Diagram showing Ethernet header being stripped and rewritten while the IP packet inside stays unchanged.',
      text: 'When the router receives an Ethernet frame on Port 1, it tears off the old Layer 2 envelope (Computer A ➔ Router Port 1 MAC). It inspects the IP packet inside. When it forwards the packet out Port 2, it wraps it in a brand-new Layer 2 envelope (Router Port 2 MAC ➔ Computer B MAC).',
    },
    entryStageState: CONCEPT_3_BASE_STAGE,
  },
  {
    id: 'c3-r5',
    conceptNumber: 3,
    rungNumber: 5,
    layoutState: 'STATE_F',
    title: 'Sort the properties: IP vs MAC',
    timeEstimate: '3 min',
    newWords: [],
    look: 'Sort the four networking properties into their correct category.',
    story:
      'Categorize each behavior:\nDoes it apply to **IP Addresses (Layer 3)** or **MAC Addresses (Layer 2)**?\n\nMatch each item to its correct bucket.',
    nextHook: 'Now that you understand the theory, let’s solve real troubleshooting tickets in Concept 4!',
    lockMessage: 'Match all 4 items to complete the sort',
    check: {
      type: 'sort',
      sortItems: [
        { id: 'item-1', snippet: 'Stays the same from origin to final destination', targetLabel: 'IP Address (Layer 3)' },
        { id: 'item-2', snippet: 'Rewritten at every router hop along the path', targetLabel: 'MAC Address (Layer 2)' },
        { id: 'item-3', snippet: 'Identifies the local delivery van on the immediate wire', targetLabel: 'MAC Address (Layer 2)' },
        { id: 'item-4', snippet: 'Specifies the street name (e.g. 192.168.1)', targetLabel: 'IP Address (Layer 3)' },
      ],
      sortLabels: ['IP Address (Layer 3)', 'MAC Address (Layer 2)'],
    },
    hints: [
      { level: 1, label: 'General Direction', text: 'Think about what travels across routers versus what stays on one wire.' },
      { level: 2, label: 'Specific Clue', text: 'IP is the global address. MAC is the local hardware tag.' },
      { level: 3, label: 'Direct Answer', text: 'Items 1 and 4 belong to IP Address. Items 2 and 3 belong to MAC Address.' },
    ],
    entryStageState: CONCEPT_3_BASE_STAGE,
  },
];

// ============================================================================
// CONCEPT 4: FIND THE FAULT (5-STEP GATEWAY TRIAGE) (6 RUNGS)
// ============================================================================

const CONCEPT_4_RUNGS: Day3Rung[] = [
  {
    id: 'c4-r1',
    conceptNumber: 4,
    rungNumber: 1,
    layoutState: 'STATE_D',
    title: 'Ticket 1: The Missing Doorway',
    timeEstimate: '3 min',
    newWords: [],
    look: 'Ticket #301: Computer A cannot reach Computer B (192.168.2.20). Pinging fails immediately.',
    story:
      'Let’s practice our **5-Step Gateway Triage Order**:\n\nStep 1: **Link light on?** Yes, both computer and router LEDs are solid green.\nStep 2: **Local address right?** Yes, Computer A is `192.168.1.10`.\nStep 3: **Gateway IP set?** Look at Computer A’s settings: the Default Gateway is completely blank!\n\nEnter the gateway address `192.168.1.1` and click Save.',
    doText: 'Enter 192.168.1.1 in the Default Gateway field and click Save.',
    expectText: 'Gateway set! Ping to 192.168.2.20 succeeds.',
    nextHook: 'Ticket 1 solved! Now let’s tackle a trickier issue in Ticket 2.',
    lockMessage: 'Fix the missing gateway setting',
    check: {
      type: 'diagnose',
      expectedCommand: 'ping 192.168.2.20',
    },
    hints: [
      { level: 1, label: 'General Direction', text: 'Follow Step 3 of the triage order.' },
      { level: 2, label: 'Specific Clue', text: 'Computer A has no Default Gateway configured. Enter 192.168.1.1.' },
      { level: 3, label: 'Direct Answer', text: 'Type 192.168.1.1 in the gateway box and click Save Gateway.' },
    ],
    entryStageState: {
      ...CONCEPT_3_BASE_STAGE,
      gateways: { a: '', b: '192.168.2.1' },
      message: 'drop-no-gateway',
    },
  },
  {
    id: 'c4-r2',
    conceptNumber: 4,
    rungNumber: 2,
    layoutState: 'STATE_D',
    title: 'Ticket 2: The Doorway on the Wrong Street',
    timeEstimate: '3 min',
    newWords: [],
    look: 'Ticket #302: An intern tried to fix Computer A, but now ping says "Destination host unreachable".',
    story:
      'Look closely at Computer A’s settings:\n- IP Address: `192.168.1.10` (Green Street)\n- Default Gateway: `192.168.2.1` (Orange Street!)\n\nDo you see the critical error?\nA computer **cannot** use a gateway on a foreign street, because it has to cross the gateway to reach that street in the first place!\n\nYour gateway MUST always be an address on your **own local street** (`192.168.1.1`).\n\nChange the gateway to `192.168.1.1` and save.',
    doText: 'Change Computer A’s gateway from 192.168.2.1 to 192.168.1.1 and click Save.',
    expectText: 'Gateway corrected to local street! Pings succeed.',
    nextHook: 'Ticket 2 resolved! Now let’s inspect a remote link failure in Ticket 3.',
    lockMessage: 'Correct Computer A’s gateway to 192.168.1.1',
    check: {
      type: 'diagnose',
      expectedCommand: 'ping 192.168.2.20',
    },
    hints: [
      { level: 1, label: 'General Direction', text: 'Check which street the gateway address belongs to.' },
      { level: 2, label: 'Specific Clue', text: '192.168.2.1 is on Orange Street. Computer A is on Green Street (192.168.1).' },
      { level: 3, label: 'Direct Answer', text: 'Change the gateway setting to 192.168.1.1 and click Save.' },
    ],
    entryStageState: {
      ...CONCEPT_3_BASE_STAGE,
      gateways: { a: '192.168.2.1', b: '192.168.2.1' },
      message: 'drop-no-gateway',
    },
  },
  {
    id: 'c4-r3',
    conceptNumber: 4,
    rungNumber: 3,
    layoutState: 'STATE_D',
    title: 'Ticket 3: The Far-Side Disconnect',
    timeEstimate: '3 min',
    newWords: [],
    look: 'Ticket #303: Computer A can ping its gateway (192.168.1.1), but pinging Computer B (192.168.2.20) gives "Request timed out".',
    story:
      'Follow the triage order:\n\nStep 1: Check Computer A’s local link: LED is green.\nStep 2: Check Computer A’s gateway: `192.168.1.1` (correct).\nStep 3: Ping gateway: `ping 192.168.1.1` replies instantly!\nStep 4: Look at the router’s Orange Street port (`eth1`): **Its link light is dark!** Cable 2 was kicked loose under the desk!\n\nClick the loose cable on Router Port 2 to re-plug it, then test `ping 192.168.2.20`.',
    doText: 'Click the loose cable on Router Port 2 to plug it in, then run ping 192.168.2.20.',
    expectText: 'Router Port 2 LED turns green. Ping receives replies from 192.168.2.20.',
    nextHook: 'All three tickets solved! Let’s perform our final mastery check.',
    lockMessage: 'Re-plug the loose router cable and verify ping',
    check: {
      type: 'diagnose',
      expectedCommand: 'ping 192.168.2.20',
    },
    hints: [
      { level: 1, label: 'General Direction', text: 'Check the router’s link lights on the canvas.' },
      { level: 2, label: 'Specific Clue', text: 'Router Port 2 is unplugged. Click the cable or plug button to reconnect it.' },
      { level: 3, label: 'Direct Answer', text: 'Click "Re-plug Cable 2", then type ping 192.168.2.20 in the terminal.' },
    ],
    entryStageState: {
      ...CONCEPT_3_BASE_STAGE,
      cables: { hostA: true, hostB: true, routerEth0: true, routerEth1: false },
      portLeds: { hostA: 'green', hostB: 'green', routerEth0: 'green', routerEth1: 'off' },
      message: 'drop-remote-down',
    },
  },
  {
    id: 'c4-r4',
    conceptNumber: 4,
    rungNumber: 4,
    layoutState: 'STATE_F',
    title: 'Mastery: The Gateway Rule',
    timeEstimate: '3 min',
    newWords: [],
    look: 'Explain to a colleague why you cannot set your default gateway to 8.8.8.8 at home.',
    story:
      'Many beginners ask:\n*"If a distant server is at 8.8.8.8, why can’t I just set my computer’s Default Gateway directly to 8.8.8.8?"*\n\nBased on what you learned in Ticket 2, select the accurate explanation to teach your colleague:',
    nextHook: 'Review what you accomplished today on Day 3!',
    lockMessage: 'Select the correct explanation',
    check: {
      type: 'write-and-compare',
      question: 'Why can’t you set your Default Gateway directly to a distant address like 8.8.8.8?',
      options: [
        {
          id: 'opt-google-block',
          label: 'Because distant servers block all incoming default gateways',
          isCorrect: false,
          feedback: 'Distant servers do not block default gateways; this is an architectural rule.',
        },
        {
          id: 'opt-local-doorway-rule',
          label: 'Your gateway must be on your own local street so your computer can reach it directly over the local wire to exit',
          isCorrect: true,
          feedback:
            'Magnificent! To reach the outside world, you must first reach the physical doorway in your own room. The gateway must be on your local subnet.',
        },
        {
          id: 'opt-too-many-digits',
          label: 'Because 8.8.8.8 has fewer numbers than 192.168.1.1',
          isCorrect: false,
          feedback: 'Both are standard 32-bit IPv4 addresses.',
        },
      ],
    },
    hints: [
      { level: 1, label: 'General Direction', text: 'How do you leave a building?' },
      { level: 2, label: 'Specific Clue', text: 'You cannot step into a room down the street before passing through your own front door.' },
      { level: 3, label: 'Direct Answer', text: 'Select the option stating your gateway must be on your own local street.' },
    ],
    entryStageState: CONCEPT_3_BASE_STAGE,
  },
  {
    id: 'c4-r5',
    conceptNumber: 4,
    rungNumber: 5,
    layoutState: 'STATE_E',
    title: 'Day 3 Complete: You Conquered Routing!',
    timeEstimate: '1 min',
    newWords: [],
    look: 'Celebrate your progress: You connected separate local networks across a router!',
    story:
      'Congratulations on conquering Day 3!\n\nHere is what you mastered:\n1. **The Dead End:** Switches only forward within one local street (`192.168.1`).\n2. **The Router:** A device with multiple network cards that bridges different streets.\n3. **Default Gateway:** The doorway address on your local street where you send all foreign mail.\n4. **Hop-by-Hop Handoff:** IP addresses stay constant, while MAC addresses rewrite at every router hop.\n5. **The Gateway Triage:** Link light ➔ Local IP ➔ Gateway IP on local street ➔ Ping gateway ➔ Ping target.',
    nextHook: 'Preview Day 4: Subnetting and how computers mathematically calculate street boundaries.',
    lockMessage: 'Click Continue to finish Day 3',
    check: {
      type: 'understand',
      question: 'Ready for Day 4?',
      options: [
        {
          id: 'opt-ready',
          label: 'Ready for Day 4: The Subnet Mask & IP Math!',
          isCorrect: true,
          feedback: 'Onward to Day 4!',
        },
      ],
    },
    hints: [
      { level: 1, label: 'General Direction', text: 'Click the ready button.' },
      { level: 2, label: 'Specific Clue', text: 'Select Ready for Day 4.' },
      { level: 3, label: 'Direct Answer', text: 'Click the option to continue.' },
    ],
    entryStageState: CONCEPT_3_BASE_STAGE,
  },
  {
    id: 'c4-r6',
    conceptNumber: 4,
    rungNumber: 6,
    layoutState: 'STATE_E',
    title: 'Day 4 Preview: The Subnet Mask',
    timeEstimate: '1 min',
    newWords: [],
    look: 'How does a computer mathematically know where the street name ends and the house number begins?',
    story:
      'Today, we used our eyes to see that `192.168.1` and `192.168.2` are different streets.\n\nBut computers don’t have eyes—they only have binary bits (0s and 1s)!\n\nOn **Day 4**, you will discover the **Subnet Mask** (`255.255.255.0` or `/24`): the mathematical stencil that slices any IP address into its street and house numbers with surgical precision.',
    nextHook: 'See you on Day 4!',
    lockMessage: 'Finish Day 3',
    check: {
      type: 'understand',
      question: 'What question does Day 4 answer?',
      options: [
        {
          id: 'opt-preview',
          label: 'How computers mathematically calculate street boundaries using subnet masks',
          isCorrect: true,
          feedback: 'See you on Day 4!',
        },
      ],
    },
    hints: [
      { level: 1, label: 'General Direction', text: 'Select the Day 4 preview option.' },
      { level: 2, label: 'Specific Clue', text: 'Subnet masks calculate street boundaries.' },
      { level: 3, label: 'Direct Answer', text: 'Click the preview option.' },
    ],
    entryStageState: CONCEPT_3_BASE_STAGE,
  },
];

// ============================================================================
// ALL DAY 3 CONCEPTS EXPORT
// ============================================================================

export const ALL_DAY3_CONCEPTS: Day3ConceptDefinition[] = [
  {
    number: 1,
    id: 'the-dead-end',
    title: 'The dead end across the street',
    question: 'Why can’t a switch connect two different streets?',
    timeEstimate: '12 min',
    goal: 'Understand why local switches cannot forward traffic to different IP subnets.',
    newWordsCount: 0,
    hookLine: 'A switch repeats to its neighbors. It cannot cross the border to another street.',
    rungs: CONCEPT_1_RUNGS,
  },
  {
    number: 2,
    id: 'the-doorway-device',
    title: 'The doorway device: router & gateway',
    question: 'How do computers find the exit door to other streets?',
    timeEstimate: '14 min',
    goal: 'Discover routers, dual interfaces, and configure a default gateway.',
    newWordsCount: 3,
    hookLine: 'To reach another street, you must send your mail to the doorway on your own street.',
    rungs: CONCEPT_2_RUNGS,
  },
  {
    number: 3,
    id: 'the-handoff-in-motion',
    title: 'The handoff in motion',
    question: 'What changes when a packet crosses a router?',
    timeEstimate: '14 min',
    goal: 'Inspect routing tables, trace router hops, and distinguish Layer 2 rewriting from Layer 3 preservation.',
    newWordsCount: 3,
    hookLine: 'The IP address is the letter’s destination. The MAC address is the local delivery van.',
    rungs: CONCEPT_3_RUNGS,
  },
  {
    number: 4,
    id: 'find-the-fault-gateway',
    title: 'Find the fault: gateway triage',
    question: 'The destination is silent. Where is the doorway blocked?',
    timeEstimate: '15 min',
    goal: 'Diagnose and resolve gateway and router faults using a 5-step engineering checklist.',
    newWordsCount: 0,
    hookLine: 'Cable light first, local address second, gateway third, gateway ping fourth, target fifth.',
    rungs: CONCEPT_4_RUNGS,
  },
];
