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
          feedback: 'Exactly right! When the destination is unknown, the switch floods out all other ports.',
          egressPorts: [2, 3, 4],
        },
        {
          id: 'opt-drop',
          label: 'Drops the frame immediately',
          isCorrect: false,
          feedback: 'Switches never drop frames just because the destination is unlearned.',
        },
      ],
      whyPrompt: 'Why does the switch forward out all other ports?',
      whyOptions: [
        {
          id: 'why-flood',
          label: 'Flooding guarantees the frame reaches Host B without needing prior knowledge',
          isCorrect: true,
          feedback: 'Correct causal defense: flooding guarantees delivery when the location is unknown.',
        },
        {
          id: 'why-short',
          label: 'Because Port 1 has an electrical short circuit',
          isCorrect: false,
          feedback: 'Port 1 received the frame normally.',
        },
      ],
      reactions: {
        correct: ['Boom! Exactly right. An unknown destination triggers an immediate unknown unicast flood.'],
        wrong: {
          0: ['Check the table first: Is Host B recorded in it?'],
          2: ['Switches do not discard frames when the destination is missing; they flood.'],
        },
        fallback: ['Think about what choice an ignorant switch has to deliver the data.'],
        hintAfter: 2,
      },
    },
    {
      id: 'net03-beat-6',
      stage: { stageNumber: 1, stepIndex: 1, title: 'Observe: Unknown Unicast Flood' },
      kind: 'point',
      text: 'Watch the flood execute: Ports 2, 3, and 4 illuminate. Hosts C and D discard it, while Host B accepts it. That is {{term:flooding}}.',
      say: ['Watch the flood execute: Ports 2, 3, and 4 illuminate. Hosts C and D discard it, while Host B accepts it. That is {{term:flooding}}.'],
      reveal: ['egress-ports'],
      revealedParts: ['hosts', 'host-mac', 'switch', 'ports', 'controls', 'mac-table', 'egress-ports'],
      spotlight: 'egress-ports',
    },
    {
      id: 'net03-beat-7',
      stage: { stageNumber: 2, stepIndex: 2, title: 'Stage 2: Complete the Reply' },
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
  title: 'Module 3: The Bridge / Switch: MAC Learning & Forwarding',
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
    'Frames with known unicast destinations are forwarded specifically to the recorded port, eliminating collisions and reducing casual eavesdropping compared to hubs (though broadcast frames, ARP spoofing, and CAM overflow still require security controls)',
    'Switches adapt dynamically to station migration when a known host reconnects to a different port',
  ],
  concepts: [
    {
      id: 'mac-table-and-forwarding',
      order: 1,
      title: 'Source Learning, Destination Forwarding, and the Prediction Gate',
      shortDescription:
        'Master the two fundamental rules of Layer 2 switching: learn on source MAC, forward or flood on destination MAC.',
      theory: {
        summary:
          'A Layer 2 switch builds its forwarding table (CAM table) dynamically by inspecting the Source MAC address of every incoming frame, and forwards frames selectively based on Destination MAC lookups.',
        explanation: [
          '### Step 1: The Problem — The Blind Postmaster Scenario',
          'In early Ethernet networks, physical **hubs** repeated every electrical signal out every single cable. As networks grew, this created severe problems:',
          '- **Bandwidth Waste**: Every host had to process every packet, even if it was meant for someone else.',
          '- **Collision Domains**: Simultaneous transmissions collided, degrading performance exponentially.',
          '- **Security & Privacy**: Any connected computer could passively eavesdrop on all communications.',
          '',
          'To solve this, Ethernet **switches** were invented. A switch is an intelligent Layer 2 bridge that selectively isolates traffic so that Host A talking to Host B does not disturb Host C or Host D.',
          '',
          '### Step 2: Prerequisite Gate — Header Inspection',
          'Every Ethernet II frame contains two vital 48-bit hardware addresses:',
          '- **Source MAC (Src MAC)**: The physical address of the device transmitting the frame.',
          '- **Destination MAC (Dst MAC)**: The physical address of the device intended to receive the frame.',
          '',
          '### Step 3: Intuitive Metaphor — The Mailroom Clerk',
          'Imagine a mailroom clerk in a building with 4 unlabelled offices (Doors 1, 2, 3, 4). On Day 1, the clerk knows nothing about who sits where.',
          'When Alice in Door 1 hands the clerk a letter addressed to Bob, the clerk does something clever:',
          '1. The clerk looks at the **return address** (Alice) and marks down: *"Alice sits behind Door 1"*.',
          '2. The clerk checks the recipient (Bob). Because the clerk does not know Bob yet, the clerk delivers copies to Doors 2, 3, and 4 (flooding).',
          '3. When Bob behind Door 2 replies to Alice, the clerk notes: *"Bob sits behind Door 2"*. The clerk then checks Alice: *"Alice is behind Door 1!"* The clerk delivers Bob\'s reply **only** through Door 1. Doors 3 and 4 hear nothing!',
          '',
          '### Step 4: The Deterministic Rules of Ethernet Switching',
          'A modern switch executes this exact logic via two distinct phases on every received frame:',
          '',
          '**Phase 1: Ingress Source Learning** (Updating the CAM Table)',
          'When a frame arrives on Port P:',
          '- Switch inspects the **Source MAC**.',
          '- If Source MAC is new: Switch inserts `(Source MAC -> Port P)` into its Content Addressable Memory (CAM) table.',
          '- If Source MAC is already on Port P: Switch refreshes the entry aging timer.',
          '- If Source MAC was on Port Q (different port): Switch updates the mapping to Port P (**Station Migration**).',
          '',
          '**Phase 2: Destination Lookup & Egress Action**',
          'Next, the switch inspects the **Destination MAC** to decide where to send the frame:',
          '- **Known Unicast Forward**: Destination MAC is in CAM table on Port D (where D != P) -> Forward ONLY out Port D.',
          '- **Unknown Unicast Flood**: Destination MAC is NOT in CAM table -> Replicate and flood out ALL ports EXCEPT arrival Port P.',
          '- **Broadcast Flood**: Destination MAC is `FF:FF:FF:FF:FF:FF` -> Flood out ALL ports EXCEPT arrival Port P.',
          '- **Same-Port Filter**: Destination MAC is in CAM table on arrival Port P -> Drop the frame (filtered to prevent unnecessary looping).',
          '',
          '### Step 5: Guided Visualization & Prediction Gate',
          'Interact with the live switch laboratory below. Step through Host A transmitting to Host B. Notice that before Host B replies, the **Prediction Gate** pauses playback to verify your understanding before the event executes.',
        ],
        keyTakeaway:
          'Golden Rule of Switching: Switches LEARN from the Ingress SOURCE MAC, and FORWARD or FLOOD based on the DESTINATION MAC.',
        exampleQuery: '',
        exampleQueryExplanation: '',
        mentorScript: NET_03_MENTOR_SCRIPT,
      },
      tasks: [
        {
          id: 'net03-p1-guided-cold-start',
          title: 'Guided Practice: Cold-Start Trace (Host C to Host D)',
          description:
            'Predict switch CAM table updates and egress port forwarding when Host C transmits to Host D on an empty table.',
          instructions: [
            'Host C (CC:CC:CC:CC:CC:CC, Port 3) transmits a frame to Host D (DD:DD:DD:DD:DD:DD, Port 4).',
            'The switch CAM table currently has no recorded entries for Host C or Host D.',
            'Select the correct learning action and forwarding decision for this transmission.',
          ],
          type: 'guided',
          primaryTable: '',
          initialSql: '',
          solutionSql: 'PREDICT_FLOOD_UNKNOWN_UNICAST_PORTS_1_2_4',
          solutionExplanation:
            'When Host C transmits on Port 3, the switch inspects the Source MAC and records CC:CC:CC:CC:CC:CC -> Port 3. Destination DD is absent from the CAM table, triggering an Unknown Unicast Flood out all ports except arrival Port 3 (Ports 1, 2, and 4).',
          hints: [
            {
              level: 1,
              text: 'Remember the Golden Rule: Ingress Source MAC is learned; Destination MAC is looked up.',
            },
            {
              level: 2,
              text: 'Host C is transmitting on Port 3, so CC is recorded on Port 3. Destination DD is not in the CAM table, causing an unknown unicast flood out Ports 1, 2, and 4.',
            },
          ],
          validation: {
            judgment: [
              {
                kind: 'choose-and-defend',
                prompt: 'Which MAC address does the switch record into its CAM table upon frame arrival?',
                options: [
                  'Destination MAC (DD:DD:DD:DD:DD:DD) mapped to Port 4',
                  'Source MAC (CC:CC:CC:CC:CC:CC) mapped to ingress Port 3',
                  'Both Source and Destination MACs simultaneously',
                ],
                correctIndex: 1,
                explanation:
                  'Switches inspect only the INGRESS SOURCE MAC address of incoming frames to learn device locations. They never learn from destination MACs.',
              },
              {
                kind: 'choose-and-defend',
                prompt: 'Why does the switch flood the frame out Ports 1, 2, and 4?',
                options: [
                  'Because Destination MAC DD is absent from the CAM table (Unknown Unicast Flood)',
                  'Because the frame was sent to the Ethernet broadcast address FF:FF:FF:FF:FF:FF',
                  'Because standard switches always broadcast every frame by default',
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
        {
          id: 'net03-p2-station-migration',
          title: 'Independent Practice: Host Movement & Station Migration',
          description:
            'Diagnose how a switch dynamically updates its CAM table when a known host moves to a different physical port.',
          instructions: [
            'Host A (AA:AA:AA:AA:AA:AA) was previously learned on Port 1.',
            'An engineer unplugs Host A from Port 1 and reconnects it to Port 3.',
            'Host A now transmits a new frame from Port 3 to Host B (BB:BB:BB:BB:BB:BB, Port 2).',
            'Predict the switch CAM table update and forwarding action.',
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
          'Broadcast frames (FF:FF:FF:FF:FF:FF) are never learned as destinations; they are replicated and flooded out all ports in the broadcast domain except the ingress arrival port (Port 3).',
        hints: [
          {
            level: 1,
            text: 'Does a broadcast frame target a single device or all devices?',
          },
          {
            level: 2,
            text: 'FF:FF:FF:FF:FF:FF is flooded to all ports except the arrival port (Ports 1, 2, 4).',
          },
        ],
        validation: {
          judgment: [
            {
              kind: 'choose-and-defend',
              prompt:
                'Which ports will the switch forward a broadcast frame (FF:FF:FF:FF:FF:FF) out when it enters on Port 3?',
              options: [
                'Ports 1, 2, and 4 (All ports except ingress Port 3)',
                'All 4 ports including Port 3',
                'Only Port 1',
              ],
              correctIndex: 0,
              explanation:
                'Broadcast frames are flooded to all ports in the broadcast domain except the port on which they entered.',
            },
          ],
        },
        successMessage:
          'Correct! Broadcast frames flood out all ports except the ingress port.',
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
              label: 'Replicated and flooded out Ports 1, 2, and 4 (Broadcast Flood)',
              egressPorts: [1, 2, 4],
              decision: 'FLOOD_BROADCAST',
            },
            {
              label: 'Flooded out all 4 ports including arrival Port 3',
              egressPorts: [1, 2, 3, 4],
              misconceptionExplanation: 'Switches never echo frames back out the arrival port.',
            },
          ],
          correctOptionIndex: 0,
          explanation: 'Broadcast flooded to Ports 1, 2, 4.',
          governingRule: 'Destination FF:FF:FF:FF:FF:FF -> Replicate and flood except ingress port.',
        },
      },
      {
        id: 'net03-c3-same-port-filter',
        title: 'Task 3: Same-Port Filtering',
        description:
          'Identify what happens when a frame arrives on a port where the destination MAC is already located.',
        instructions: [
          'Host B (BB:BB:BB:BB:BB:BB) is recorded on Port 2.',
          'Due to an upstream shared hub on Port 2, a frame enters Port 2 addressed to Host B.',
          'Determine the switch forwarding action.',
        ],
        type: 'challenge',
        primaryTable: '',
        initialSql: '',
        solutionSql: 'SAME_PORT_FILTER_DROP',
        solutionExplanation:
          'When the destination MAC resides on the same ingress port where the frame arrived, the switch filters (discards) the frame because the destination has already received it on the local shared segment.',
        hints: [
          {
            level: 1,
            text: 'If the sender and receiver are on the same cable segment, does the switch need to forward the frame to other ports?',
          },
          {
            level: 2,
            text: 'No. The switch filters (drops) the frame to avoid creating redundant traffic.',
          },
        ],
        validation: {
          judgment: [
            {
              kind: 'choose-and-defend',
              prompt:
                'What action does the switch take when a frame arrives on Port 2 and destination MAC BB is also on Port 2?',
              options: [
                'It filters (drops) the frame without forwarding it out any port',
                'It floods the frame out Ports 1, 3, and 4',
                'It echoes the frame back out Port 2',
              ],
              correctIndex: 0,
              explanation:
                'Same-port filtering discards the frame because both source and destination share the same ingress segment.',
            },
          ],
        },
        successMessage:
          'Correct! The switch filters the frame to prevent redundant traffic and loops.',
        networking: {
          topology: STANDARD_4_HOSTS,
          initialSequence: [
            { srcMac: 'BB:BB:BB:BB:BB:BB', dstMac: 'AA:AA:AA:AA:AA:AA', ingressPort: 2 },
          ],
          pendingTransmission: {
            srcMac: 'DD:DD:DD:DD:DD:DD',
            dstMac: 'BB:BB:BB:BB:BB:BB',
            ingressPort: 2,
          },
          expectedDecision: 'FILTER_SAME_PORT',
          expectedEgressPorts: [],
          options: [
            {
              label: 'Filtered and dropped (Same-Port Filter)',
              egressPorts: [],
              decision: 'FILTER_SAME_PORT',
            },
            {
              label: 'Flooded out Ports 1, 3, and 4',
              egressPorts: [1, 3, 4],
              misconceptionExplanation: 'Destination is known to be on Port 2, so flooding to other ports is wrong.',
            },
          ],
          correctOptionIndex: 0,
          explanation: 'Destination on same ingress port -> Filter/drop.',
          governingRule: 'Destination MAC on arrival port -> Filter and drop frame.',
        },
      },
      {
        id: 'net03-c4-transfer-validation',
        title: 'Task 4: Transfer Validation (5-Port Unfamiliar Topology)',
        description:
          'Apply your switching knowledge to an unfamiliar 5-port single-switch topology with novel MAC addresses without hints.',
        instructions: [
          'An enterprise 5-port switch connects Node 1 through Node 5 on Ports 1 to 5.',
          'Transmission 1: Node 1 (00:11:22:33:44:55, Port 1) transmits to Node 5 (00:11:22:33:44:99, Port 5).',
          'Transmission 2: Node 5 replies back to Node 1.',
          'Predict the exact forwarding action for Transmission 2 (Node 5 -> Node 1).',
        ],
        type: 'challenge',
        primaryTable: '',
        initialSql: '',
        solutionSql: 'TRANSFER_VALIDATION_NODE5_TO_NODE1_PORT_1',
        solutionExplanation:
          'Transmission 1 caused the switch to record Node 1 (00:11:22:33:44:55) on Port 1. When Node 5 replies, destination 00:11:22:33:44:55 matches Port 1. The switch forwards exclusively out Port 1, while Ports 2, 3, 4, and 5 stay idle.',
        hints: [],
        validation: {
          judgment: [
            {
              kind: 'choose-and-defend',
              prompt:
                'On the 5-port switch, which egress port(s) will Node 5\'s reply frame exit?',
              options: [
                'Forwarded ONLY out Port 1 directly to Node 1',
                'Flooded out Ports 1, 2, 3, and 4 (All ports except arrival Port 5)',
                'Flooded out all 5 ports',
                'Filtered and dropped',
              ],
              correctIndex: 0,
              explanation:
                'Transfer complete! The switch learned Node 1 on Port 1 during the first transmission. Node 5\'s reply is known unicast and forwards solely out Port 1.',
            },
          ],
        },
        successMessage:
          'Transfer validation successful! You have demonstrated generalized mastery of Layer 2 switching on an unfamiliar topology.',
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
              label: 'Forwarded ONLY out Port 1 directly to Node 1',
              egressPorts: [1],
              decision: 'FORWARD_KNOWN_UNICAST',
            },
            {
              label: 'Flooded out Ports 1, 2, 3, and 4 (Unknown Unicast Flood)',
              egressPorts: [1, 2, 3, 4],
              misconceptionExplanation:
                'Node 1 was already learned on Port 1 during Transmission 1. Known unicast destination is forwarded, not flooded.',
            },
          ],
          correctOptionIndex: 0,
          explanation: 'Forwards solely out Port 1 on the 5-port switch.',
          governingRule: 'Destination MAC in CAM table on Port 1 -> Forward known unicast.',
        },
      },
    ],
  },
};
