import type { ModuleData } from '../../../types/curriculum';
import type { HostNode, MentorScript } from '../../../types/networking-curriculum';

const STANDARD_4_HOSTS: HostNode[] = [
  { id: 'host-a', name: 'Host A', mac: 'AA:AA:AA:AA:AA:AA', port: 1 },
  { id: 'host-b', name: 'Host B', mac: 'BB:BB:BB:BB:BB:BB', port: 2 },
  { id: 'host-c', name: 'Host C', mac: 'CC:CC:CC:CC:CC:CC', port: 3 },
  { id: 'host-d', name: 'Host D', mac: 'DD:DD:DD:DD:DD:DD', port: 4 },
];

const FIVE_PORT_TRANSFER_HOSTS: HostNode[] = [
  { id: 'node-1', name: 'Node 1', mac: '00:11:22:33:44:55', port: 1 },
  { id: 'node-2', name: 'Node 2', mac: '00:11:22:33:44:66', port: 2 },
  { id: 'node-3', name: 'Node 3', mac: '00:11:22:33:44:77', port: 3 },
  { id: 'node-4', name: 'Node 4', mac: '00:11:22:33:44:88', port: 4 },
  { id: 'node-5', name: 'Node 5', mac: '00:11:22:33:44:99', port: 5 },
];

export const NET_03_MENTOR_SCRIPT: MentorScript = {
  version: '1.0.0',
  track: 'networking',
  moduleId: 'net-03',
  conceptId: 'mac-table-and-forwarding',
  tier: 'shadow',
  allowedTerms: ['switch', 'mac', 'port', 'cam-table', 'flooding'],
  revealLadder: {
    'step-0': ['hosts', 'host-mac'],
    'step-1': ['hosts', 'host-mac', 'switch', 'ports'],
    'step-2': ['hosts', 'host-mac', 'switch', 'ports', 'controls'],
    'step-3': ['hosts', 'host-mac', 'switch', 'ports', 'controls', 'mac-table'],
    'step-4': ['hosts', 'host-mac', 'switch', 'ports', 'controls', 'mac-table', 'egress-ports'],
  },
  terms: {
    mac: { label: 'MAC Address', part: 'host-mac', explanation: 'A 48-bit unique hardware identifier burnt into each host network card.' },
    switch: { label: 'Switch', part: 'switch', explanation: 'A Layer 2 multiport bridge that forwards frames based on MAC addresses.' },
    port: { label: 'Switch Port', part: 'ports', explanation: 'A physical RJ-45 interface on the switch dedicated to an individual host.' },
    'cam-table': { label: 'MAC Table (CAM)', part: 'mac-table', explanation: 'Content Addressable Memory table mapping learned MACs to physical port numbers.' },
    flooding: { label: 'Flooding', part: 'egress-ports', explanation: 'Forwarding a frame out all active ports except the arrival ingress port.' },
  },
  beats: [
    {
      id: 'net03-beat-1',
      stage: { stageNumber: 1, title: 'Observe: Physical Endpoints' },
      kind: 'say',
      text: 'Four computers sit in our lab. Each has a unique 48-bit hardware {{term:mac}} address.',
      say: ['Four computers sit in our lab. Each has a unique 48-bit hardware {{term:mac}} address.'],
      reveal: ['hosts', 'host-mac'],
      revealedParts: ['hosts', 'host-mac'],
      spotlight: 'hosts',
    },
    {
      id: 'net03-beat-2',
      stage: { stageNumber: 1, title: 'Observe: Switch Ports' },
      kind: 'point',
      text: 'Each computer connects to a numbered physical {{term:port}} on the central {{term:switch}}.',
      say: ['Each computer connects to a numbered physical {{term:port}} on the central {{term:switch}}.'],
      reveal: ['switch', 'ports'],
      revealedParts: ['hosts', 'host-mac', 'switch', 'ports'],
      spotlight: 'ports',
    },
    {
      id: 'net03-beat-3',
      stage: { stageNumber: 1, stepIndex: 0, title: 'Observe: Ingress Transmission' },
      kind: 'do',
      text: 'Host A needs to send a frame to Host B. Click Transmit to launch the frame across Port 1.',
      say: ['Host A needs to send a frame to Host B. Click Transmit to launch the frame across Port 1.'],
      actionPrompt: 'Launch Frame from Host A',
      reveal: ['controls'],
      revealedParts: ['hosts', 'host-mac', 'switch', 'ports', 'controls'],
      spotlight: 'controls',
      expect: 'transmit',
    },
    {
      id: 'net03-beat-4',
      stage: { stageNumber: 1, stepIndex: 0, title: 'Observe: Ingress Learning' },
      kind: 'point',
      text: 'Frame arrived on Port 1! The switch immediately inspects the source MAC and records it in its {{term:cam-table}}: Port 1 = Host A.',
      say: ['Frame arrived on Port 1! The switch immediately inspects the source MAC and records it in its {{term:cam-table}}: Port 1 = Host A.'],
      reveal: ['mac-table'],
      revealedParts: ['hosts', 'host-mac', 'switch', 'ports', 'controls', 'mac-table'],
      spotlight: 'mac-table',
    },
    {
      id: 'net03-beat-5',
      stage: { stageNumber: 1, stepIndex: 0, title: 'Observe: Unknown Unicast Prediction' },
      kind: 'predict',
      text: 'Host B is not in the table yet. Where must the switch forward this frame?',
      say: ['Host B is not in the table yet. Where must the switch forward this frame?'],
      spotlight: 'ports',
      revealedParts: ['hosts', 'host-mac', 'switch', 'ports', 'controls', 'mac-table'],
      options: [
        {
          id: 'opt-port2',
          label: 'Out Port 2 only',
          isCorrect: false,
          feedback: 'The switch has no record of Host B yet. It cannot guess which cable leads to Host B.',
        },
        {
          id: 'opt-flood',
          label: 'Out Ports 2, 3, and 4 (floods all ports except arrival Port 1)',
          isCorrect: true,
          feedback: 'Spot on! An unknown unicast destination forces the switch to flood all ports except the arrival port.',
          egressPorts: [2, 3, 4],
        },
        {
          id: 'opt-drop',
          label: 'Drops the frame because Host B is unknown',
          isCorrect: false,
          feedback: 'Switches do not drop frames for unknown destinations; they flood to locate the recipient.',
        },
      ],
      whyPrompt: 'Why does the switch flood Ports 2, 3, and 4 instead of dropping?',
      whyOptions: [
        {
          id: 'why-locate',
          label: 'Because the switch does not know which physical wire Host B is connected to yet',
          isCorrect: true,
          feedback: 'Correct! Flooding ensures the destination receives the frame so it can respond.',
        },
        {
          id: 'why-hub',
          label: 'Because switches act as hubs permanently',
          isCorrect: false,
          feedback: 'Switches only flood when the destination is unknown or broadcast.',
        },
      ],
      reactions: {
        correct: ['Spot on! The switch floods to discover Host B.'],
        wrong: {
          0: ['The switch has no way to guess Port 2 without learning it first.'],
          2: ['Dropping would break connectivity. The switch floods instead.'],
        },
        fallback: ['Remember: unknown unicast destinations are flooded to all ports except the arrival port.'],
      },
    },
    {
      id: 'net03-beat-6',
      stage: { stageNumber: 2, stepIndex: 1, title: 'Stage 2: Flooding Execution' },
      kind: 'point',
      text: 'Ports 2, 3, and 4 all illuminate as the frame is flooded! Host B receives it.',
      say: ['Ports 2, 3, and 4 all illuminate as the frame is flooded! Host B receives it.'],
      reveal: ['egress-ports'],
      revealedParts: ['hosts', 'host-mac', 'switch', 'ports', 'controls', 'mac-table', 'egress-ports'],
      spotlight: 'egress-ports',
    },
    {
      id: 'net03-beat-7',
      stage: { stageNumber: 3, stepIndex: 2, title: 'Stage 3: The Reply' },
      kind: 'do',
      text: 'Now Host B replies back to Host A (Dest: Host A). Click Step to watch the reply enter Port 2.',
      say: ['Now Host B replies back to Host A (Dest: Host A). Click Step to watch the reply enter Port 2.'],
      actionPrompt: 'Step Host B Reply into Port 2',
      revealedParts: ['hosts', 'host-mac', 'switch', 'ports', 'controls', 'mac-table', 'egress-ports'],
      spotlight: 'controls',
      expect: 'step',
    },
    {
      id: 'net03-beat-8',
      stage: { stageNumber: 3, stepIndex: 2, title: 'Stage 3: Known Unicast Forwarding' },
      kind: 'predict',
      text: 'Look at the table now: the switch learned Host B on Port 2. Where does this reply to Host A go?',
      say: ['Look at the table now: the switch learned Host B on Port 2. Where does this reply to Host A go?'],
      spotlight: 'mac-table',
      revealedParts: ['hosts', 'host-mac', 'switch', 'ports', 'controls', 'mac-table', 'egress-ports'],
      options: [
        {
          id: 'opt-r-flood',
          label: 'Floods out Ports 1, 3, and 4',
          isCorrect: false,
          feedback: 'Host A was already learned on Port 1 during Step 0. No flood is necessary.',
        },
        {
          id: 'opt-r-port1',
          label: 'Out Port 1 only',
          isCorrect: true,
          feedback: 'Correct! Host A is recorded on Port 1, so the switch forwards directly to Port 1.',
          egressPorts: [1],
        },
        {
          id: 'opt-r-port2',
          label: 'Reflects back out Port 2',
          isCorrect: false,
          feedback: 'Port 2 is the ingress port where the reply came from.',
        },
      ],
      whyPrompt: 'Why is there zero traffic on Ports 3 and 4?',
      whyOptions: [
        {
          id: 'why-microsegment',
          label: 'Because Host A is a known unicast in the CAM table, eliminating unnecessary broadcast traffic',
          isCorrect: true,
          feedback: 'Spot on! That is how switches eliminate collisions and microsegment network traffic.',
        },
        {
          id: 'why-ports-off',
          label: 'Because Ports 3 and 4 were administratively disabled',
          isCorrect: false,
          feedback: 'Ports 3 and 4 remain fully active.',
        },
      ],
      reactions: {
        correct: ['Spot on! Known unicast forwarding delivers directly to Port 1.'],
        wrong: {
          0: ['Check the table: Host A is already learned on Port 1.'],
          2: ['Port 2 is the arrival port.'],
        },
        fallback: ['Check which port Host A lives on in the table.'],
      },
    },
    {
      id: 'net03-beat-9',
      stage: { stageNumber: 4, stepIndex: 3, title: 'Stage 4: Zero Flooding' },
      kind: 'point',
      text: 'Only Port 1 illuminates! Hosts C and D hear absolute silence. Collisions are eliminated.',
      say: ['Only Port 1 illuminates! Hosts C and D hear absolute silence. Collisions are eliminated.'],
      revealedParts: ['hosts', 'host-mac', 'switch', 'ports', 'controls', 'mac-table', 'egress-ports'],
      spotlight: 'egress-ports',
    },
    {
      id: 'net03-beat-10',
      stage: { stageNumber: 5, stepIndex: 3, title: 'Stage 5: Live Diagnosis' },
      kind: 'point',
      text: 'A station migration ticket has arrived: Host C was moved to spare Port 5, but Host A cannot reach it. Investigate Ticket #103 below.',
      say: ['A station migration ticket has arrived: Host C was moved to spare Port 5, but Host A cannot reach it. Investigate Ticket #103 below.'],
      revealedParts: ['hosts', 'host-mac', 'switch', 'ports', 'controls', 'mac-table', 'egress-ports'],
      spotlight: 'mac-table',
    },
  ],
  ticketScene: {
    ticketId: '103',
    title: 'Ticket #103: The Moved Desk: Station Migration',
    symptom: 'Host C was moved from Port 3 to spare Port 5. Host A attempts to send data to Host C, but Host C receives nothing.',
    telemetry: [
      'Switch CAM Table Status:',
      '  Port 1: Host A (Active, Aging: 298s)',
      '  Port 3: Host C (Stale, Aging: 240s remaining)',
      '  Port 5: Empty (Link Active)',
    ],
    options: [
      {
        id: 'opt-nic-bad',
        label: 'Host C network card is incompatible with Port 5.',
        isCorrect: false,
        feedback: 'Port 5 link LED is green and auto-negotiation succeeded.',
      },
      {
        id: 'opt-stale-cam',
        label: 'The switch CAM table has a stale entry mapping Host C to Port 3, causing unicast frames to be forwarded down the wrong cable until Host C transmits.',
        isCorrect: true,
        feedback: 'Spot on! Switches learn on source MAC. Because Host C has not transmitted on Port 5 yet, the switch continues forwarding traffic to Port 3.',
      },
      {
        id: 'opt-port5-trunk',
        label: 'Port 5 is an uplink trunk and cannot accept access workstations.',
        isCorrect: false,
        feedback: 'Port 5 is configured as an access port on VLAN 1.',
      },
    ],
    repairActions: [
      {
        id: 'fix-transmit',
        label: 'Have Host C transmit a frame on Port 5 to trigger immediate dynamic source MAC migration',
        isCorrect: true,
        patch: { action: 'transmit-frame', target: 'host-c', value: 'data-frame' },
      },
      {
        id: 'fix-ups',
        label: 'Power cycle the central building UPS',
        isCorrect: false,
        patch: { action: 'power-cycle', target: 'building-ups', value: 'all' },
      },
      {
        id: 'fix-nic',
        label: 'Replace Host C network card with a new MAC',
        isCorrect: false,
        patch: { action: 'replace-nic', target: 'host-c', value: 'new-nic' },
      },
    ],
  },
};

export const NET_03_MODULE: ModuleData = {
  id: 'net-03',
  slug: 'mac-learning-and-forwarding',
  day: 3,
  title: 'Module 3: The Intelligent Switch & Dynamic MAC Learning',
  shortTitle: 'MAC Learning & Forwarding',
  type: 'module',
  track: 'networking',
  milestoneId: 'net-milestone-1',
  description:
    'Discover how a Layer 2 switch isolates collision domains by inspecting source MAC addresses, building a CAM table, and selectively forwarding frames.',
  estimatedMinutes: 30,
  curriculumOrder: 3,
  displayLabel: 'Module 3',
  completionLearnings: [
    'Switches operate at Layer 2, inspecting Ethernet frame headers rather than raw physical bits',
    'Source MAC addresses are dynamically recorded into the CAM table alongside the arrival ingress port',
    'Frames with unknown unicast or broadcast destinations are flooded out all ports except the arrival port',
    'Frames with known unicast destinations are forwarded specifically to the recorded port, eliminating collisions and reducing casual eavesdropping compared to hubs',
    'Switches adapt dynamically to station migration when a known host reconnects to a different port',
  ],
  concepts: [
    // ─────────────────────────────────────────────────────
    // Concept 1: The Switch Clean Slate & The CAM Architecture
    // ─────────────────────────────────────────────────────
    {
      id: 'mac-table-and-forwarding',
      order: 1,
      title: 'The Clean Slate Switch & Content Addressable Memory (CAM)',
      shortDescription:
        'Master how a switch powers on with an empty table and builds forwarding memory dynamically.',
      theory: {
        summary:
          'A Layer 2 switch powers on with an empty MAC Address Table (CAM table). Through dynamic self-learning, it maps physical ports to 48-bit hardware addresses with zero static configuration.',
        explanation: [
          '### Beat 1: The Clean Slate Problem (The Dumb Repeater vs The Intelligent Bridge)',
          'In early Ethernet networks, physical **hubs** operated purely at Layer 1: electrical pulses arriving on one port were repeated identically out every other port. As corporate networks grew, this created unbearable bottlenecks:',
          '- **Collision Chaos**: Multiple stations attempting to transmit collided continuously on the shared medium.',
          '- **Bandwidth Starvation**: A 100 Mbps hub shared 100 Mbps across 24 computers (averaging less than 4 Mbps per device).',
          '- **Zero Security**: Any workstation could put its NIC into promiscuous mode and eavesdrop on all corporate traffic.',
          '',
          'To permanently solve this, the **Layer 2 Switch** was created. When an enterprise switch powers up from a cold boot, its forwarding database—called the **MAC Address Table** or **Content Addressable Memory (CAM) Table**—is completely blank. It has zero manual IP configurations, zero preloaded host lists, and zero static port assignments.',
          '',
          '### Beat 2: Hardware-Accelerated CAM Architecture',
          'Unlike general-purpose software running on a server CPU, enterprise switches use dedicated **Application-Specific Integrated Circuits (ASICs)** and **Content Addressable Memory (CAM)**:',
          '- In conventional computer memory (RAM), the CPU provides an address to retrieve data.',
          '- In CAM memory, the ASIC provides the data (**the 48-bit Destination MAC**) and the memory hardware returns the matching **physical port number in a single clock cycle (nanoseconds)**.',
          '',
          '### Beat 3: The Golden Rule of Ingress Learning',
          'How does the blank CAM table populate without human intervention? Through the immutable **Golden Rule of Ethernet Switching**:',
          '1. **A switch learns EXCLUSIVELY on INGRESS (Arrival)**.',
          '2. **A switch inspects the SOURCE MAC address of incoming frames**.',
          '3. It records the pair: `(Source MAC Address ➔ Arrival Physical Port)`.',
          '',
          'When Host A (MAC `AA:AA:AA:AA:AA:AA`) transmits its very first frame toward Host B on Port 1, the switch immediately burns `AA ➔ Port 1` into its CAM table before making any forwarding decision.',
        ],
        keyTakeaway:
          'Switches boot with a completely blank CAM table and self-learn port-to-MAC associations strictly by reading incoming Source MACs in hardware.',
        exampleQuery: 'show mac address-table dynamic',
        exampleQueryExplanation:
          'Displays all dynamically learned MAC addresses mapped to their physical switch ports and remaining aging timers.',
        mcqs: [
          {
            id: 'net03-mcq-clean-slate-cam',
            question:
              'When a brand-new 24-port Gigabit switch is unboxed and powered on for the first time, what entries exist in its dynamic CAM table?',
            options: [
              'Zero entries; the dynamic MAC address table is completely empty on boot',
              '24 entries pre-configured with the default MAC addresses of connected workstations',
              'A broadcast entry mapping FF:FF:FF:FF:FF:FF to all ports',
              'Static mappings pointing each port to the default gateway router',
            ],
            correctIndex: 0,
            explanation:
              'Dynamic switches require zero configuration. On startup, their CAM table is completely empty until connected stations begin transmitting frames.',
          },
          {
            id: 'net03-mcq-cam-lookup-speed',
            question:
              'Why do enterprise Ethernet switches use CAM (Content Addressable Memory) hardware instead of standard CPU RAM tables for frame forwarding?',
            options: [
              'CAM memory searches all MAC address entries simultaneously in a single clock cycle',
              'CAM memory encrypts all frame payloads with AES-256 before transmission',
              'CAM memory converts Layer 2 Ethernet frames into Layer 3 IP packets',
              'CAM memory reduces the physical power consumption of the Cat6 copper wire',
            ],
            correctIndex: 0,
            explanation:
              'CAM searches the entire address space in parallel in a single hardware cycle (nanoseconds), allowing switches to forward traffic at full wirespeed without buffering delays.',
          },
        ],
        mentorScript: NET_03_MENTOR_SCRIPT,
      },
      tasks: [
        {
          id: 'net03-p1-source-learning-unknown-unicast',
          title: 'Guided Practice: Source Learning & Unknown Unicast Flooding',
          description:
            'Predict how a clean switch with an empty CAM table processes the first frame sent from Host C to Host D.',
          instructions: [
            'A 4-host switch currently has an empty CAM table.',
            'Host C (CC:CC:CC:CC:CC:CC, Port 3) transmits a frame to Host D (DD:DD:DD:DD:DD:DD, Port 4).',
            'Predict: (1) what entry is added to the CAM table, and (2) which egress ports the frame exits.',
          ],
          type: 'guided',
          primaryTable: '',
          initialSql: '',
          solutionSql: 'PREDICT_SOURCE_LEARN_CC_FLOOD_PORTS_1_2_4',
          solutionExplanation:
            'On ingress, the switch inspects the Source MAC (CC) and records CC -> Port 3. It then checks the Destination MAC (DD). Because DD is unrecorded, the switch floods the frame out all ports except arrival Port 3 (Ports 1, 2, 4).',
          hints: [
            {
              level: 1,
              text: 'Remember the golden rule: which field in the Ethernet header teaches the switch where a host is located?',
            },
            {
              level: 2,
              text: 'The switch learns from the Source MAC (Host C on Port 3). Because Host D is not yet in the table, it must flood all ports except the arrival port.',
            },
          ],
          validation: {
            judgment: [
              {
                kind: 'choose-and-defend',
                prompt:
                  'Which MAC address does the switch record in its CAM table upon receiving this frame on Port 3?',
                options: [
                  'Host D (DD:DD:DD:DD:DD:DD) on Port 4',
                  'Host C (CC:CC:CC:CC:CC:CC) on Port 3',
                  'Both Host C on Port 3 and Host D on Port 4 simultaneously',
                ],
                correctIndex: 1,
                explanation:
                  'A switch ONLY learns from the Source MAC of arriving frames. Because the frame arrived on Port 3 from Host C, it learns CC -> Port 3. It cannot learn Host D yet because Host D has not transmitted.',
              },
              {
                kind: 'choose-and-defend',
                prompt:
                  'Why does the switch forward this frame out Ports 1, 2, and 4 instead of only Port 4?',
                options: [
                  'Because Destination MAC DD is absent from the CAM table, forcing an Unknown Unicast Flood out all ports except arrival Port 3',
                  'Because Ethernet switches always broadcast all frames to all ports permanently',
                  'Because Host D explicitly requested a broadcast delivery',
                ],
                correctIndex: 0,
                explanation:
                  'When a unicast destination MAC is not recorded in the CAM table, the switch must flood it to all active ports except the arrival port until the target replies.',
              },
            ],
          },
          successMessage:
            'Correct! Host C is learned on Port 3, and the frame is flooded out Ports 1, 2, and 4.',
          networking: {
            topology: STANDARD_4_HOSTS,
            initialSequence: [],
            pendingTransmission: {
              srcMac: 'CC:CC:CC:CC:CC:CC',
              dstMac: 'DD:DD:DD:DD:DD:DD',
              ingressPort: 3,
            },
            expectedDecision: 'FLOOD_UNKNOWN_UNICAST',
            expectedEgressPorts: [1, 2, 4],
            options: [
              {
                label: 'Learns CC on Port 3; Floods out Ports 1, 2, and 4 (Unknown Unicast Flood)',
                egressPorts: [1, 2, 4],
                decision: 'FLOOD_UNKNOWN_UNICAST',
              },
              {
                label: 'Learns DD on Port 4; Forwards directly out Port 4',
                egressPorts: [4],
                decision: 'FORWARD_KNOWN_UNICAST',
                misconceptionExplanation:
                  'Misconception: Switches NEVER learn from the Destination MAC! The switch inspects only the INGRESS SOURCE MAC (Host C on Port 3). Because DD is unrecorded, it must flood.',
              },
              {
                label: 'Learns CC on Port 3; Floods out all 4 ports including arrival Port 3',
                egressPorts: [1, 2, 3, 4],
                decision: 'FLOOD_UNKNOWN_UNICAST',
                misconceptionExplanation:
                  'Misconception: A switch NEVER reflects a frame back out the ingress arrival port (Port 3). Flooding only reaches the other ports.',
              },
            ],
            correctOptionIndex: 0,
            explanation:
              'Source MAC CC is learned on Port 3. Destination DD is unrecorded, so the frame floods out Ports 1, 2, 4.',
            governingRule:
              'Source MAC learned on Port 3, Destination MAC absent -> Unknown Unicast Flood out Ports 1, 2, 4.',
          },
        },
      ],
    },

    // ─────────────────────────────────────────────────────
    // Concept 2: Learning by Listening — Source MAC Ingress Only
    // ─────────────────────────────────────────────────────
    {
      id: 'learning-by-listening',
      order: 2,
      title: 'Learning by Listening — Source MAC Ingress Only',
      shortDescription:
        'Discover why switches strictly inspect arrival Source MACs and never learn from destination headers.',
      theory: {
        summary:
          'Switches build table state exclusively by listening to the return address (Source MAC) of incoming frames. They never learn from Destination MAC headers, preventing table poisoning and misdirection.',
        explanation: [
          '### Beat 1: The "Return Address" Dilemma',
          'Consider what happens when you drop a letter into a physical postbox:',
          '- The **Return Address** represents where the letter *originated*—a verifiable fact about where the envelope physically came from.',
          '- The **Destination Address** represents where the sender *hopes* the letter will go—an unverified wish.',
          '',
          'In networking, if a switch were designed to learn from Destination MAC headers, catastrophe would follow immediately:',
          '- If Alice (Port 1) sends a packet to Bob (MAC `BB:BB:BB:BB:BB:BB`), and the switch erroneously mapped `BB ➔ Port 1`, all future traffic destined for Bob would be routed straight into Alice\'s cable!',
          '- Any rogue station or malware could easily hijack another computer\'s identity simply by transmitting random destination headers.',
          '',
          '### Beat 2: Passive Listening on Physical Ingress Pins',
          'The switch ASIC listens strictly to the physical RX copper strands of each port. When electrical transitions trigger frame reception on Port 2:',
          '1. The hardware registers: *"Signal entered Port 2."*',
          '2. The ASIC reads the 6 bytes beginning at byte offset 6 of the Ethernet header: `Source MAC`.',
          '3. If Port 2 received a frame with Source MAC `BB:BB:BB:BB:BB:BB`, the switch now possesses 100% verifiable physical proof: **Host B is electrically seated on Port 2**.',
          '',
          '### Beat 3: The Complete Two-Way Handshake Transformation',
          'Watch the dramatic shift in network behavior during a standard two-way conversation:',
          '- **Frame 1 (Host A ➔ Host B)**: Host A is learned on Port 1. Host B is unknown. The switch **floods** Ports 2, 3, and 4.',
          '- **Frame 2 (Host B ➔ Host A reply)**: The reply enters Port 2. The switch learns `Host B ➔ Port 2`. Next, the switch looks up destination Host A. Host A was already recorded on Port 1!',
          '- **Outcome**: The reply is forwarded **exclusively out Port 1**. Ports 3 and 4 hear absolute silence. **The broadcast noise is permanently snuffed out.**',
        ],
        keyTakeaway:
          'Switches learn physical topology by listening to the sender on ingress. Once both hosts have transmitted one frame, communication becomes purely isolated unicast microsegmentation.',
        exampleQuery: 'show mac address-table interface fastEthernet 0/2',
        exampleQueryExplanation:
          'Shows the dynamic MAC addresses learned exclusively through frame ingress on physical port Fa0/2.',
        mcqs: [
          {
            id: 'net03-mcq-never-learn-destination',
            question:
              'Why is an Ethernet switch engineered to NEVER learn port associations from the Destination MAC field of an Ethernet frame?',
            options: [
              'Because the Destination MAC indicates where the sender hopes to reach, not where the sending device is physically attached',
              'Because Destination MAC addresses are encrypted by standard Layer 2 switches',
              'Because Destination MAC addresses change at every switch port hop',
              'Because Ethernet frames do not contain Destination MAC fields during initial transmission',
            ],
            correctIndex: 0,
            explanation:
              'The Destination MAC specifies the intended recipient, not the physical location of the transmitting station. Learning from Destination MACs would misroute traffic to the sender port.',
          },
          {
            id: 'net03-mcq-microsegmentation-benefit',
            question:
              'What happens to workstations on Ports 3 and 4 when Host B replies directly to Host A after both MAC addresses have been learned by the switch?',
            options: [
              'Workstations on Ports 3 and 4 receive zero traffic, eliminating collision risk and casual packet eavesdropping',
              'Workstations on Ports 3 and 4 receive a copy marked with an FCS error flag',
              'Ports 3 and 4 are placed into a temporary shutdown state by the switch ASIC',
              'The switch broadcasts a notification packet to Ports 3 and 4 alerting them to the transfer',
            ],
            correctIndex: 0,
            explanation:
              'Known unicast forwarding sends the frame solely to the destination port (Port 1). Other ports experience complete silence, providing collision-free microsegmentation.',
          },
        ],
      },
      tasks: [
        {
          id: 'net03-p2-known-unicast-forwarding',
          title: 'Independent Practice: Known Unicast Forwarding & Zero Flooding',
          description:
            'Predict switch behavior when Host B transmits a reply back to Host A after Host A was already learned on Port 1.',
          instructions: [
            'Host A (AA:AA:AA:AA:AA:AA) is already registered on Port 1 in the switch CAM table.',
            'Host B (BB:BB:BB:BB:BB:BB, Port 2) transmits a reply frame addressed to Host A.',
            'Predict the CAM update for Host B and identify the exact egress forwarding behavior.',
          ],
          type: 'independent',
          primaryTable: '',
          initialSql: '',
          solutionSql: 'PREDICT_LEARN_BB_FORWARD_PORT_1_ONLY',
          solutionExplanation:
            'On ingress, the switch records Source MAC BB -> Port 2. It then inspects Destination MAC AA. Because AA is already recorded on Port 1, the switch forwards directly out Port 1 with zero flooding.',
          hints: [
            {
              level: 1,
              text: 'Check the CAM table state: is destination Host A (AA) known or unknown?',
            },
            {
              level: 2,
              text: 'Because Host A was already learned on Port 1, no flood is necessary. The switch unicasts directly to Port 1.',
            },
          ],
          validation: {
            judgment: [
              {
                kind: 'choose-and-defend',
                prompt:
                  'What new entry does the switch insert into its CAM table upon receiving Host B\'s reply on Port 2?',
                options: [
                  'BB:BB:BB:BB:BB:BB on Port 2',
                  'AA:AA:AA:AA:AA:AA on Port 2',
                  'FF:FF:FF:FF:FF:FF on Port 1',
                ],
                correctIndex: 0,
                explanation:
                  'The switch inspects the arriving frame\'s Source MAC (Host B, BB) on ingress Port 2, adding BB -> Port 2 to its table.',
              },
              {
                kind: 'choose-and-defend',
                prompt:
                  'Which ports will this return frame exit from the switch?',
                options: [
                  'Forwarded exclusively out Port 1 directly to Host A',
                  'Flooded out Ports 1, 3, and 4',
                  'Reflected back out Port 2 to verify connection integrity',
                ],
                correctIndex: 0,
                explanation:
                  'Because destination MAC AA was already learned on Port 1 during the initial transmission, the switch executes known unicast forwarding exclusively out Port 1.',
              },
            ],
          },
          successMessage:
            'Outstanding! You confirmed that once destination MACs are learned, switches perform pinpoint known unicast delivery with zero flooding.',
          networking: {
            topology: STANDARD_4_HOSTS,
            initialSequence: [
              { srcMac: 'AA:AA:AA:AA:AA:AA', dstMac: 'BB:BB:BB:BB:BB:BB', ingressPort: 1 },
            ],
            pendingTransmission: {
              srcMac: 'BB:BB:BB:BB:BB:BB',
              dstMac: 'AA:AA:AA:AA:AA:AA',
              ingressPort: 2,
            },
            expectedDecision: 'FORWARD_KNOWN_UNICAST',
            expectedEgressPorts: [1],
            options: [
              {
                label: 'Learns BB on Port 2; Forwards ONLY out Port 1 directly to Host A',
                egressPorts: [1],
                decision: 'FORWARD_KNOWN_UNICAST',
              },
              {
                label: 'Learns BB on Port 2; Floods out Ports 1, 3, and 4',
                egressPorts: [1, 3, 4],
                misconceptionExplanation:
                  'Misconception: Host A is already recorded on Port 1. Flooding only occurs when the destination is unknown.',
              },
            ],
            correctOptionIndex: 0,
            explanation:
              'Source BB is learned on Port 2; Destination AA is in the CAM table on Port 1 -> Known Unicast Forward.',
            governingRule:
              'Source learned on Port 2, Destination in CAM table on Port 1 -> Forward known unicast to Port 1.',
          },
        },
      ],
    },

    // ─────────────────────────────────────────────────────
    // Concept 3: Unicast Forwarding vs Unknown Flooding & Same-Port Filtering
    // ─────────────────────────────────────────────────────
    {
      id: 'unicast-vs-unknown-flooding',
      order: 3,
      title: 'Unicast Forwarding, Unknown Flooding & Same-Port Wire Filtering',
      shortDescription:
        'Analyze known unicast, unknown flood, broadcast delivery, and same-port wire echo filtering.',
      theory: {
        summary:
          'A switch makes one of four distinct egress decisions for every frame: Known Unicast Forward, Unknown Unicast Flood, Broadcast Flood, or Same-Port Wire Filter (Drop).',
        explanation: [
          '### Beat 1: The Four Forwarding Outcomes',
          'Every Ethernet frame received by a switch ASIC triggers a deterministic forwarding lookup based on its Destination MAC:',
          '',
          '| Egress Decision | Condition | Switch Action |',
          '|---|---|---|',
          '| **Known Unicast Forward** | Dst MAC matches a port in CAM table (where Port != Ingress Port) | Transmit ONLY on matching physical port |',
          '| **Unknown Unicast Flood** | Dst MAC is unicast (least significant bit of byte 0 is 0), but absent from CAM | Replicate & transmit out ALL active ports except ingress port |',
          '| **Broadcast Flood** | Dst MAC is `FF:FF:FF:FF:FF:FF` (all 48 bits are 1) | Replicate & transmit out ALL active ports except ingress port |',
          '| **Same-Port Filter (Drop)** | Dst MAC matches the SAME port where the frame arrived | Silently discard frame (zero egress transmission) |',
          '',
          '### Beat 2: The Same-Port Filtering Mystery',
          'Why would a frame ever arrive on Port 1 when its destination is ALSO on Port 1? Consider legacy or multi-device topologies:',
          '- An unmanaged hub or docking station with multiple computers is connected to Switch Port 1.',
          '- Laptop A and Laptop B both share the cable attached to Port 1.',
          '- When Laptop A sends a frame to Laptop B, the signal enters Switch Port 1. But because Laptop B is on the same local copper segment outside the switch, Laptop B already received the signal directly across the shared wire!',
          '- If the switch were to forward that frame back out Port 1, it would create an endless wire echo loop and trigger severe collisions.',
          '',
          '### Beat 3: Silent Discard Mechanics',
          'When the ASIC detects `Ingress Port == Destination Egress Port`:',
          '- The switch **filters (silently drops)** the frame without generating any error message or ICMP notification.',
          '- This same-port filtering capability is the historical foundation of the Ethernet bridge: it isolates local segment chatter and prevents unnecessary packets from congesting other building segments.',
        ],
        keyTakeaway:
          'When the destination device lives on the same physical port where the frame entered, the switch silently filters (drops) the frame to avoid duplicate traffic and wire collisions.',
        exampleQuery: 'show mac address-table count',
        exampleQueryExplanation:
          'Displays the total count of active dynamic, static, and filtered MAC entries across all switch VLANs.',
        mcqs: [
          {
            id: 'net03-mcq-same-port-filter',
            question:
              'Host A and Host B are connected to a legacy hub plugged into Switch Port 1. When Host A transmits a frame addressed to Host B, how does the switch handle the frame?',
            options: [
              'The switch filters (silently drops) the frame because the destination MAC resides on the arrival port',
              'The switch floods the frame out all other ports to alert other hosts',
              'The switch generates an ICMP Redirect packet to Host A',
              'The switch buffers the frame for 300 seconds before retransmitting',
            ],
            correctIndex: 0,
            explanation:
              'Because Host B is on the same physical segment as Host A, Host B already received the electrical signal locally. The switch drops the frame to prevent duplicate wire transmission.',
          },
          {
            id: 'net03-mcq-broadcast-never-reflected',
            question:
              'When an ARP request addressed to FF:FF:FF:FF:FF:FF arrives on Switch Port 3, which ports receive the flooded broadcast?',
            options: [
              'All active ports EXCEPT Port 3; a switch never reflects flooded traffic back out the arrival port',
              'All active ports including Port 3',
              'Only ports configured with static IP addresses',
              'Only Port 1 (the default management port)',
            ],
            correctIndex: 0,
            explanation:
              'Flooding always excludes the ingress port where the frame entered to prevent infinite reflective broadcast loops.',
          },
        ],
      },
      tasks: [
        {
          id: 'net03-p3-same-port-filtering',
          title: 'Independent Practice: Same-Port Filtering & Wire Isolation',
          description:
            'Analyze switch forwarding logic when a frame arrives with a destination MAC already learned on the same ingress port.',
          instructions: [
            'Host A (AA:AA:AA:AA:AA:AA) is learned on Port 1.',
            'A frame arrives on Port 1 with Destination MAC AA:AA:AA:AA:AA:AA.',
            'Determine whether the switch forwards, floods, or filters the frame.',
          ],
          type: 'independent',
          primaryTable: '',
          initialSql: '',
          solutionSql: 'PREDICT_FILTER_SAME_PORT',
          solutionExplanation:
            'When the destination MAC is recorded on the same port where the frame arrived (Ingress Port == Egress Port), the switch drops the frame (Same-Port Filtering) to prevent wire echo.',
          hints: [
            {
              level: 1,
              text: 'Compare the arrival port with the port recorded in the CAM table for the destination MAC.',
            },
            {
              level: 2,
              text: 'If Ingress Port equals Egress Port, the switch filters and drops the frame.',
            },
          ],
          validation: {
            judgment: [
              {
                kind: 'choose-and-defend',
                prompt:
                  'What technical action does the switch execute when a frame arrives on Port 1 addressed to a destination already learned on Port 1?',
                options: [
                  'Filters (silently discards) the frame to prevent wire echo and looping',
                  'Floods the frame out Ports 2, 3, and 4',
                  'Reflects the frame back out Port 1 with an inverted checksum',
                ],
                correctIndex: 0,
                explanation:
                  'If the destination host is already on the arrival port, the target received the signal directly. The switch filters the frame to avoid duplicate wire traffic.',
              },
            ],
          },
          successMessage:
            'Superb! You correctly identified same-port filtering, the fundamental bridging mechanism that confines local traffic to its own segment.',
          networking: {
            topology: STANDARD_4_HOSTS,
            initialSequence: [
              { srcMac: 'AA:AA:AA:AA:AA:AA', dstMac: 'BB:BB:BB:BB:BB:BB', ingressPort: 1 },
            ],
            pendingTransmission: {
              srcMac: 'BB:BB:BB:BB:BB:BB',
              dstMac: 'AA:AA:AA:AA:AA:AA',
              ingressPort: 1,
            },
            expectedDecision: 'FILTER_SAME_PORT',
            expectedEgressPorts: [],
            options: [
              {
                label: 'Filters and drops frame (Destination AA is already on arrival Port 1)',
                egressPorts: [],
                decision: 'FILTER_SAME_PORT',
              },
              {
                label: 'Floods out Ports 2, 3, and 4',
                egressPorts: [2, 3, 4],
                misconceptionExplanation:
                  'The destination is already known on Port 1. Flooding other ports would waste bandwidth.',
              },
            ],
            correctOptionIndex: 0,
            explanation:
              'Destination AA is mapped to Port 1, and the frame entered on Port 1. Ingress == Egress -> Filter (Drop).',
            governingRule:
              'Destination MAC in CAM table on same port as arrival -> Filter and drop frame.',
          },
        },
      ],
    },

    // ─────────────────────────────────────────────────────
    // Concept 4: Table Aging, Station Migration & Dynamic Eviction
    // ─────────────────────────────────────────────────────
    {
      id: 'table-aging-dynamic-eviction',
      order: 4,
      title: 'Table Aging, Station Migration & Dynamic Eviction',
      shortDescription:
        'Understand the 300-second CAM aging timer, station migration, and dual-CLI switch troubleshooting.',
      theory: {
        summary:
          'To prevent memory exhaustion and handle office mobility, switch CAM entries have a 300-second aging timer. When stations move desks, dynamic station migration updates the table instantly on the next transmission.',
        explanation: [
          '### Beat 1: The Aging Timer Dilemma (Why CAM Tables Must Forget)',
          'In an enterprise office with hundreds of laptops connecting, disconnecting, and migrating between conference rooms, a switch cannot retain MAC addresses forever:',
          '- Switch CAM tables possess finite hardware capacity (e.g., 8,192 to 32,768 MAC entries in enterprise access switches).',
          '- If entries never expired, the table would quickly fill up with retired devices, causing a catastrophic condition called **Fail-Open Flooding** (where the switch exhausts memory and reverts to behaving like a dumb hub!).',
          '',
          'To maintain table hygiene, every dynamically learned entry has an **Aging Timer**:',
          '- The industry standard default aging time is **300 seconds (5 minutes)**.',
          '- Every time a known station transmits a frame, its aging timer resets back to 300 seconds.',
          '- If a workstation stays completely silent or gets unplugged for 300 continuous seconds, the switch ASIC automatically **evicts (purges)** the entry from hardware memory.',
          '',
          '### Beat 2: Station Migration (The Moved Desk Scenario)',
          'What happens when Alice unplugs her laptop from Port 1 and moves to a conference room on Port 3?',
          '1. **Before Alice transmits**: The switch CAM table still maps `Alice ➔ Port 1` with an active aging timer. If Bob attempts to send a frame to Alice, the switch forwards it out Port 1 (an empty cable!), causing brief packet drop.',
          '2. **The instant Alice transmits**: Alice\'s laptop sends any packet (e.g., an ARP probe, DHCP request, or DNS query) into Port 3.',
          '3. **Hardware Update**: The switch ASIC observes `Source MAC: Alice` arriving on **Port 3**. It immediately overwrites the stale mapping from Port 1 to Port 3. Future packets for Alice now fly straight out Port 3.',
          '',
          '### Beat 3: Workplace Incident Investigation (Ticket #103)',
          'Network administrators frequently troubleshoot MAC address table issues using dual-OS diagnostic toolsets:',
          '- On Cisco / Enterprise Switches: `show mac address-table dynamic` reveals the physical port and VLAN for any hardware address.',
          '- On Linux Bridges / SDN Hypervisors: `bridge fdb show` displays the forwarding database mapping MAC addresses to virtual bridge interfaces (`veth` / `eth`).',
        ],
        keyTakeaway:
          'Dynamically learned MAC entries expire after 300 seconds of silence to conserve hardware memory, but station migration updates table mappings instantly upon new frame ingress.',
        exampleQuery: 'show mac address-table dynamic address 001a.2b3c.4d10',
        exampleQueryExplanation:
          'Locates the exact physical switch port where a specific device MAC is currently active in the forwarding database.',
        mcqs: [
          {
            id: 'net03-mcq-aging-time-standard',
            question:
              'What is the standard IEEE / industry default aging time for dynamic MAC address table entries on enterprise switches?',
            options: [
              '300 seconds (5 minutes)',
              '30 seconds',
              '3,600 seconds (1 hour)',
              'Dynamic entries never expire until the switch is rebooted',
            ],
            correctIndex: 0,
            explanation:
              'The standard default aging time across Ethernet switches is 300 seconds (5 minutes). Silence for 300 seconds triggers automatic entry eviction.',
          },
          {
            id: 'net03-mcq-station-movement-trigger',
            question:
              'When a user moves their workstation from Port 1 to Port 3, what triggers the switch to update its CAM table mapping to Port 3?',
            options: [
              'The first frame transmitted by the moved workstation arriving on Port 3',
              'The network administrator must manually execute a clear CAM table command',
              'The switch polls Port 1 using ICMP Echo requests every 10 seconds',
              'The workstation sends an 802.1Q VLAN re-registration tag',
            ],
            correctIndex: 0,
            explanation:
              'Switches learn dynamically on ingress. As soon as the relocated workstation transmits any frame on Port 3, the switch updates its table entry immediately.',
          },
        ],
      },
      tasks: [
        {
          id: 'net03-p4-station-migration',
          title: 'Independent Practice: Host Movement & Station Migration',
          description:
            'Diagnose how a switch dynamically updates its CAM table when a known host moves to a different physical port.',
          instructions: [
            'Host A (AA:AA:AA:AA:AA:AA) was previously learned on Port 1.',
            'An engineer unplugs Host A from Port 1 and reconnects it to Port 3.',
            'Host A now transmits a new frame from Port 3 to Host B (BB:BB:BB:BB:BB:BB, Port 2).',
            'Predict the switch CAM table update and forwarding action, and inspect Ticket #103 CLI diagnostics.',
          ],
          type: 'independent',
          primaryTable: '',
          initialSql: '',
          solutionSql: 'STATION_MIGRATION_AA_PORT_3',
          solutionExplanation:
            'When Host A transmits on Port 3, the switch detects station movement: AA was on Port 1, but is now arriving on Port 3. The switch immediately updates AA -> Port 3 in its CAM table and forwards the frame out Port 2.',
          hints: [
            {
              level: 1,
              text: 'Consider what happens when you unplug a laptop from one office desk and plug it into another desk across the hall.',
            },
            {
              level: 2,
              text: 'The switch overwrites the previous port mapping with the new arrival port (Station Movement / Port Migration).',
            },
          ],
          terminal: {
            hostname: 'ACME-DIST-SW01',
            userPrompt: 'Switch#',
            initialLines: [
              'Cisco IOS Software, C2960 Software (C2960-LANBASEK9-M)',
              'Incident Ticket #103: Switch Port MAC Migration & Rogue Device Investigation.',
            ],
            availableCommands: [
              'show mac address-table dynamic',
              'show mac address-table aging-time',
              'bridge fdb show',
            ],
            commandResponses: {
              'show mac address-table dynamic':
                '          Mac Address Table\n-------------------------------------------\nVlan    Mac Address       Type        Ports\n----    -----------       --------    -----\n   1    001a.2b3c.4d10    DYNAMIC     Fa0/1\n   1    001a.2b3c.4d20    DYNAMIC     Fa0/2\n   1    aa00.bb11.cc22    DYNAMIC     Fa0/3\n   1    0011.2233.4455    DYNAMIC     Fa0/5\nTotal Mac Addresses for this module: 4',
              'show mac address-table aging-time':
                'Global Aging Time: 300 seconds\nVlan  1 Aging Time: 300 seconds',
              'bridge fdb show':
                '00:1a:2b:3c:4d:10 dev eth1 vlan 1 master br0\n00:1a:2b:3c:4d:20 dev eth2 vlan 1 master br0\naa:00:bb:11:cc:22 dev eth3 vlan 1 master br0\n00:11:22:33:44:55 dev eth5 vlan 1 master br0',
            },
          },
          validation: {
            judgment: [
              {
                kind: 'choose-and-defend',
                prompt:
                  'How does the switch update its CAM table when a frame from AA arrives on Port 3?',
                options: [
                  'It drops the frame as a security violation because AA is registered on Port 1',
                  'It immediately updates the mapping for AA from Port 1 to Port 3 (Station Migration)',
                  'It creates a duplicate second entry with AA mapped to both Port 1 and Port 3',
                ],
                correctIndex: 1,
                explanation:
                  'Ethernet switches dynamically adapt to station mobility: when a frame from a known MAC arrives on a new port, its CAM table mapping is updated immediately to the new ingress port.',
              },
              {
                kind: 'choose-and-defend',
                prompt:
                  'Assuming Host B (BB) was already learned on Port 2, which port(s) will this frame exit?',
                options: [
                  'Forwarded ONLY out Port 2 directly to Host B',
                  'Flooded out Ports 1, 2, and 4',
                  'Filtered and dropped',
                ],
                correctIndex: 0,
                explanation:
                  'Because Destination MAC BB is already recorded on Port 2, the switch performs known unicast forwarding directly out Port 2.',
              },
            ],
          },
          successMessage:
            'Correct! Station migration updated Host A from Port 1 to Port 3, and the frame forwarded cleanly out Port 2.',
          networking: {
            topology: STANDARD_4_HOSTS,
            initialSequence: [
              { srcMac: 'AA:AA:AA:AA:AA:AA', dstMac: 'BB:BB:BB:BB:BB:BB', ingressPort: 1 },
              { srcMac: 'BB:BB:BB:BB:BB:BB', dstMac: 'AA:AA:AA:AA:AA:AA', ingressPort: 2 },
            ],
            pendingTransmission: {
              srcMac: 'AA:AA:AA:AA:AA:AA',
              dstMac: 'BB:BB:BB:BB:BB:BB',
              ingressPort: 3,
            },
            expectedDecision: 'MOVE_SOURCE',
            expectedEgressPorts: [2],
            options: [
              {
                label: 'Updates AA to Port 3 (Station Move); Forwards ONLY out Port 2',
                egressPorts: [2],
                decision: 'FORWARD_KNOWN_UNICAST',
              },
              {
                label: 'Drops frame because AA is locked to Port 1',
                egressPorts: [],
                misconceptionExplanation:
                  'Standard unmanaged Layer 2 switches do not drop frames when hosts move ports; they update the CAM table dynamically.',
              },
              {
                label: 'Floods out Ports 1, 2, and 4 because of the port mismatch',
                egressPorts: [1, 2, 4],
                misconceptionExplanation:
                  'The destination Host B is known on Port 2. A port migration on the source does not cause destination flooding.',
              },
            ],
            correctOptionIndex: 0,
            explanation:
              'AA mapping updated to Port 3; known unicast forwarded out Port 2.',
            governingRule:
              'If a frame from a known MAC arrives on a new port, the switch updates the mapping to the new ingress port.',
          },
        },
      ],
    },
  ],

  // ─────────────────────────────────────────────────────
  // Module 3 Challenge
  // ─────────────────────────────────────────────────────
  challenge: {
    id: 'net-03-challenge',
    title: 'Module 3 Mastery Check: Switch Forwarding & Transfer Validation',
    scenario:
      'Prove your mastery of Layer 2 switching by defending causal forwarding decisions across unicast, broadcast, same-port filtering, and an unfamiliar 5-port topology.',
    tasks: [
      {
        id: 'net03-c1-causal-defense',
        title: 'Task 1: Causal Defense — Known Unicast Forwarding',
        description:
          'Defend why a return frame from Host B to Host A is forwarded directly out Port 1, whereas Host A to Host B was flooded.',
        instructions: [
          'Review the two-frame exchange: Frame 1 (Host A -> Host B) followed by Frame 2 (Host B -> Host A).',
          'Identify the governing technical rule that enabled selective unicast forwarding on Frame 2.',
        ],
        type: 'challenge',
        primaryTable: '',
        initialSql: '',
        solutionSql: 'DEFEND_KNOWN_UNICAST_RULE',
        solutionExplanation:
          'During Frame 1, the switch recorded AA -> Port 1. When Host B replies in Frame 2, destination MAC AA matches Port 1 in the CAM table, enabling selective single-port forwarding.',
        hints: [
          {
            level: 1,
            text: 'What was placed in the CAM table when Host A sent the first frame?',
          },
          {
            level: 2,
            text: 'Frame 1 placed AA:AA:AA:AA:AA:AA on Port 1. Frame 2 looked up AA and forwarded directly out Port 1.',
          },
        ],
        validation: {
          judgment: [
            {
              kind: 'choose-and-defend',
              prompt:
                'Why was Host B\'s return frame forwarded ONLY out Port 1 instead of being flooded?',
              options: [
                'Because Destination MAC AA was already recorded on Port 1 during Frame 1\'s ingress',
                'Because Host B specified Port 1 inside the Ethernet frame header',
                'Because the switch queried Host A via ARP before sending the frame',
              ],
              correctIndex: 0,
              explanation:
                'Switches record source MACs on ingress. Frame 1 taught the switch that Host A is on Port 1. Frame 2 performs a destination lookup, finds Port 1, and unicasts directly.',
            },
          ],
        },
        successMessage:
          'Correct! Known unicast forwarding occurs because the destination MAC was learned during Frame 1.',
        networking: {
          topology: STANDARD_4_HOSTS,
          initialSequence: [
            { srcMac: 'AA:AA:AA:AA:AA:AA', dstMac: 'BB:BB:BB:BB:BB:BB', ingressPort: 1 },
          ],
          pendingTransmission: {
            srcMac: 'BB:BB:BB:BB:BB:BB',
            dstMac: 'AA:AA:AA:AA:AA:AA',
            ingressPort: 2,
          },
          expectedDecision: 'FORWARD_KNOWN_UNICAST',
          expectedEgressPorts: [1],
          options: [
            {
              label: 'Learns BB on Port 2; Forwards ONLY out Port 1 directly to Host A',
              egressPorts: [1],
              decision: 'FORWARD_KNOWN_UNICAST',
            },
            {
              label: 'Learns BB on Port 2; Floods out Ports 1, 3, and 4',
              egressPorts: [1, 3, 4],
              misconceptionExplanation:
                'Misconception: Host A is already recorded on Port 1. The switch does not flood when the destination is known.',
            },
          ],
          correctOptionIndex: 0,
          explanation: 'Learns BB on Port 2, unicasts out Port 1.',
          governingRule: 'Destination MAC in CAM table on different port -> Forward known unicast.',
        },
      },
      {
        id: 'net03-c2-broadcast-flood',
        title: 'Task 2: Broadcast Frame (FF:FF:FF:FF:FF:FF) Forwarding',
        description:
          'Determine switch behavior when Host C transmits an ARP request to the Ethernet broadcast address.',
        instructions: [
          'Host C (Port 3) sends a frame with Destination MAC FF:FF:FF:FF:FF:FF.',
          'Identify how the switch treats all-ones broadcast addresses.',
        ],
        type: 'challenge',
        primaryTable: '',
        initialSql: '',
        solutionSql: 'PREDICT_BROADCAST_FLOOD_PORTS_1_2_4',
        solutionExplanation:
          'A broadcast frame with Destination MAC FF:FF:FF:FF:FF:FF is flooded to all active ports except the ingress port (Ports 1, 2, and 4).',
        hints: [
          {
            level: 1,
            text: 'What does FF:FF:FF:FF:FF:FF represent at Layer 2?',
          },
          {
            level: 2,
            text: 'It is the broadcast MAC address. It floods all ports except the arrival port.',
          },
        ],
        validation: {
          judgment: [
            {
              kind: 'choose-and-defend',
              prompt:
                'Where does the switch forward a frame addressed to Destination MAC FF:FF:FF:FF:FF:FF?',
              options: [
                'Flooded out all active ports EXCEPT the ingress port (Port 3)',
                'Only to the default gateway on Port 1',
                'Dropped because FF:FF:FF:FF:FF:FF cannot be assigned to a physical computer',
              ],
              correctIndex: 0,
              explanation:
                'The all-ones MAC address FF:FF:FF:FF:FF:FF is the Ethernet broadcast address. Switches replicate and flood broadcast frames out every active port except the arrival port.',
            },
          ],
        },
        successMessage:
          'Correct! Broadcast frames (FF:FF:FF:FF:FF:FF) flood all active ports except the arrival port.',
        networking: {
          topology: STANDARD_4_HOSTS,
          initialSequence: [],
          pendingTransmission: {
            srcMac: 'CC:CC:CC:CC:CC:CC',
            dstMac: 'FF:FF:FF:FF:FF:FF',
            ingressPort: 3,
          },
          expectedDecision: 'FLOOD_BROADCAST',
          expectedEgressPorts: [1, 2, 4],
          options: [
            {
              label: 'Learns CC on Port 3; Floods out Ports 1, 2, and 4 (Broadcast Flood)',
              egressPorts: [1, 2, 4],
              decision: 'FLOOD_BROADCAST',
            },
            {
              label: 'Learns CC on Port 3; Drops frame because FF:FF:FF:FF:FF:FF is invalid',
              egressPorts: [],
              misconceptionExplanation:
                'FF:FF:FF:FF:FF:FF is the standard broadcast address, not an invalid address.',
            },
          ],
          correctOptionIndex: 0,
          explanation: 'Broadcast frames flood out all ports except arrival Port 3.',
          governingRule: 'Destination MAC is FF:FF:FF:FF:FF:FF -> Flood all ports except arrival port.',
        },
      },
      {
        id: 'net03-c3-station-migration-defense',
        title: 'Task 3: Station Migration Mechanics',
        description:
          'Analyze how a switch handles a host that unplugs from one port and reappears on another.',
        instructions: [
          'Host D moves from Port 4 to Port 2 and sends a frame.',
          'Identify what happens to the old Port 4 CAM entry.',
        ],
        type: 'challenge',
        primaryTable: '',
        initialSql: '',
        solutionSql: 'DEFEND_STATION_MIGRATION_UPDATE',
        solutionExplanation:
          'When Host D transmits from Port 2, the switch immediately overwrites its previous Port 4 mapping with Port 2.',
        hints: [
          {
            level: 1,
            text: 'Can a single MAC address be mapped to two different ports simultaneously on a standard unmanaged switch?',
          },
          {
            level: 2,
            text: 'No, the switch updates the mapping to the newest arrival port.',
          },
        ],
        validation: {
          judgment: [
            {
              kind: 'choose-and-defend',
              prompt:
                'What happens to the CAM table when Host D moves from Port 4 to Port 2 and transmits?',
              options: [
                'The switch updates Host D\'s entry to Port 2, replacing the old Port 4 association',
                'The switch retains Port 4 and drops all traffic on Port 2 until rebooted',
                'The switch creates two conflicting entries for Host D',
              ],
              correctIndex: 0,
              explanation:
                'Switches adapt dynamically to host movement. A new ingress frame from a known MAC updates that MAC to the new arrival port immediately.',
            },
          ],
        },
        successMessage:
          'Correct! The switch dynamically updates the CAM table entry to the new ingress port.',
        networking: {
          topology: STANDARD_4_HOSTS,
          initialSequence: [
            { srcMac: 'DD:DD:DD:DD:DD:DD', dstMac: 'AA:AA:AA:AA:AA:AA', ingressPort: 4 },
          ],
          pendingTransmission: {
            srcMac: 'DD:DD:DD:DD:DD:DD',
            dstMac: 'AA:AA:AA:AA:AA:AA',
            ingressPort: 2,
          },
          expectedDecision: 'MOVE_SOURCE',
          expectedEgressPorts: [1],
          options: [
            {
              label: 'Updates DD to Port 2 (Station Move); Forwards out Port 1',
              egressPorts: [1],
              decision: 'FORWARD_KNOWN_UNICAST',
            },
            {
              label: 'Drops frame because DD is locked to Port 4',
              egressPorts: [],
              misconceptionExplanation:
                'Standard switches allow station migration and do not lock MACs to ports.',
            },
          ],
          correctOptionIndex: 0,
          explanation: 'DD updated to Port 2; unicast out Port 1.',
          governingRule: 'Known MAC arrives on new port -> Update CAM table to new port.',
        },
      },
      {
        id: 'net03-c4-five-port-transfer',
        title: 'Task 4: Transfer Validation — Unfamiliar 5-Port Topology',
        description:
          'Apply Layer 2 switching rules to a novel 5-port network topology with unfamiliar MAC addresses.',
        instructions: [
          'Examine a 5-port switch with five nodes (Node 1 through Node 5).',
          'Node 1 (Port 1, 00:11:22:33:44:55) sends to Node 5 (Port 5, 00:11:22:33:44:99).',
          'Now Node 5 replies back to Node 1. Predict the forwarding decision and egress port(s).',
        ],
        type: 'challenge',
        primaryTable: '',
        initialSql: '',
        solutionSql: 'TRANSFER_VALIDATION_PORT_1_ONLY',
        solutionExplanation:
          'During Frame 1, Node 1 was learned on Port 1. When Node 5 replies, Destination MAC 00:11:22:33:44:55 is found in the CAM table on Port 1. The frame is forwarded ONLY out Port 1.',
        hints: [
          {
            level: 1,
            text: 'Does Node 5 know where Node 1 is? More importantly, does the SWITCH know where Node 1 is?',
          },
          {
            level: 2,
            text: 'The switch recorded Node 1 on Port 1 during the first transmission. Node 5\'s reply will be forwarded directly out Port 1.',
          },
        ],
        validation: {
          judgment: [
            {
              kind: 'choose-and-defend',
              prompt:
                'In this 5-port topology, which port(s) will Node 5\'s return frame exit?',
              options: [
                'Port 1 ONLY (known unicast forwarding to Node 1)',
                'Ports 1, 2, 3, and 4 (flooding to all ports except arrival Port 5)',
                'All 5 ports including Port 5',
              ],
              correctIndex: 0,
              explanation:
                'Transfer validation successful: Node 1 was recorded on Port 1 during Frame 1. Node 5\'s reply is delivered directly out Port 1 with zero flooding across the other 3 ports.',
            },
          ],
        },
        successMessage:
          'Transfer validation successful! You proved that Layer 2 switching rules apply universally across any port count or MAC scheme.',
        networking: {
          topology: FIVE_PORT_TRANSFER_HOSTS,
          initialSequence: [
            {
              srcMac: '00:11:22:33:44:55',
              dstMac: '00:11:22:33:44:99',
              ingressPort: 1,
            },
          ],
          pendingTransmission: {
            srcMac: '00:11:22:33:44:99',
            dstMac: '00:11:22:33:44:55',
            ingressPort: 5,
          },
          expectedDecision: 'FORWARD_KNOWN_UNICAST',
          expectedEgressPorts: [1],
          options: [
            {
              label: 'Learns Node 5 on Port 5; Forwards ONLY out Port 1 to Node 1',
              egressPorts: [1],
              decision: 'FORWARD_KNOWN_UNICAST',
            },
            {
              label: 'Learns Node 5 on Port 5; Floods out Ports 1, 2, 3, and 4',
              egressPorts: [1, 2, 3, 4],
              misconceptionExplanation:
                'Node 1 was already learned on Port 1 during the first transmission. Flooding is not needed.',
            },
          ],
          correctOptionIndex: 0,
          explanation: 'Node 5 learned on Port 5, known unicast out Port 1.',
          governingRule: 'Destination Node 1 is recorded in CAM table on Port 1 -> Forward known unicast out Port 1.',
        },
      },
    ],
  },
};
