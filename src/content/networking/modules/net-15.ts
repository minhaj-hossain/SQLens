import { ModuleData } from '../../../types/curriculum';
import type { MentorScript } from '../../../types/networking-curriculum';

export const NET_15_MENTOR_SCRIPT: MentorScript = {
  version: '1.0.0',
  moduleId: 'net-15',
  stageTitle: 'STP Loops & Boundary Firewall Protection Lab',
  stageSubtitle: 'Prevent Layer 2 broadcast storms with STP and protect boundaries with stateful connection tracking',
  initialStageState: {
    spotlight: 'stp-topology',
    highlightedField: 'root-election',
  },
  revealLadder: {
    'step-bpdu': ['stp-bpdu'],
    'step-root': ['stp-bpdu', 'stp-root'],
    'step-block': ['stp-bpdu', 'stp-root', 'stp-block'],
    'step-acl': ['stp-bpdu', 'stp-root', 'stp-block', 'fw-acl'],
    'step-conntrack': ['stp-bpdu', 'stp-root', 'stp-block', 'fw-acl', 'fw-conntrack'],
  },
  terms: {
    'spanning-tree': {
      term: 'Spanning Tree Protocol',
      definition: 'IEEE 802.1D standard that breaks physical switch loops into a logical tree.',
      part: 'stp-root',
    },
    'root-bridge': {
      term: 'Root Bridge',
      definition: 'The reference switch with the lowest numerical Bridge ID in an STP domain.',
      part: 'stp-root',
    },
    'port-blocking': {
      term: 'Port Blocking',
      definition: 'STP port state that drops user data frames to eliminate broadcast loops.',
      part: 'stp-block',
    },
    'stateful-firewall': {
      term: 'Stateful Firewall',
      definition: 'Firewall tracking bidirectional connections to permit return traffic automatically.',
      part: 'fw-conntrack',
    },
  },
  beats: [
    {
      id: 'b1',
      kind: 'say',
      text: 'You plug two cables between switches for redundancy. Seconds later, all link lights flash amber and the network freezes!',
      revealedParts: ['stp-bpdu'],
    },
    {
      id: 'b2',
      kind: 'predict',
      text: 'Why does a redundant cable loop between switches cause a catastrophic broadcast storm?',
      prompt: 'Select the Layer 2 failure mechanism:',
      options: [
        { id: 'opt-nottl', text: 'Ethernet frames have no TTL counter, so flooded broadcasts loop and multiply forever.', isCorrect: true },
        { id: 'opt-heat', text: 'Copper patch cables overheat and reverse the polarity of electrical signals.', isCorrect: false },
        { id: 'opt-pool', text: 'The switches run out of local IP addresses in their internal subnet pool.', isCorrect: false },
      ],
      whyPrompt: 'Why does missing TTL cause infinite multiplication?',
      whyOptions: [
        { id: 'why-flood', text: 'Switches flood broadcasts out every active port with no hop limit to stop them.', isCorrect: true },
        { id: 'why-simplex', text: 'Because Ethernet switches only transmit data in one direction at a time.', isCorrect: false },
      ],
      revealedParts: ['stp-bpdu', 'stp-root'],
    },
    {
      id: 'b3',
      kind: 'point',
      target: 'stp-root',
      text: 'Every switch exchanges BPDUs to elect the {{term:root-bridge}} with the lowest Bridge Priority and MAC.',
      revealedParts: ['stp-bpdu', 'stp-root'],
    },
    {
      id: 'b4',
      kind: 'action',
      prompt: 'Run {{term:spanning-tree}} to detect redundant links and block the loop.',
      buttonLabel: 'Block Redundant Loop',
      targetState: { spotlight: 'stp-block' },
      revealedParts: ['stp-bpdu', 'stp-root', 'stp-block'],
    },
    {
      id: 'b5',
      kind: 'say',
      text: 'STP places backup links into {{term:port-blocking}}. Now what protects network boundaries from untrusted outside traffic?',
      revealedParts: ['stp-bpdu', 'stp-root', 'stp-block', 'fw-acl'],
    },
    {
      id: 'b6',
      kind: 'predict',
      text: 'Why do modern perimeter firewalls use stateful inspection instead of simple stateless ACL rules?',
      prompt: 'Select the firewall architecture advantage:',
      options: [
        { id: 'opt-track', text: 'Stateful firewalls track TCP states so return traffic is allowed without opening all high ports.', isCorrect: true },
        { id: 'opt-mac', text: 'Stateless ACLs can only read MAC addresses and cannot inspect IP headers.', isCorrect: false },
        { id: 'opt-encrypt', text: 'Stateful firewalls encrypt Ethernet cabling using quantum hardware microchips.', isCorrect: false },
      ],
      whyPrompt: 'Why does conntrack prevent security holes?',
      whyOptions: [
        { id: 'why-dynamic', text: 'Dynamic state tables associate incoming packets with established outbound requests.', isCorrect: true },
        { id: 'why-discard', text: 'Because stateless ACLs delete packet headers after inspecting port numbers.', isCorrect: false },
      ],
      revealedParts: ['stp-bpdu', 'stp-root', 'stp-block', 'fw-acl', 'fw-conntrack'],
    },
    {
      id: 'b7',
      kind: 'point',
      target: 'fw-conntrack',
      text: 'A {{term:stateful-firewall}} remembers outbound sessions, keeping perimeter defenses secure and automatic.',
      revealedParts: ['stp-bpdu', 'stp-root', 'stp-block', 'fw-acl', 'fw-conntrack'],
    },
    {
      id: 'b8',
      kind: 'debrief',
      text: 'STP eliminates internal Layer 2 broadcast storms, while stateful firewalls protect your boundary from outside intrusion.',
      revealedParts: ['stp-bpdu', 'stp-root', 'stp-block', 'fw-acl', 'fw-conntrack'],
    },
  ],
  ticketScene: {
    ticketId: 'TCK-115',
    title: 'Broadcast Storm & MAC Thrashing After Wiring Uplink',
    symptom: 'After connecting a backup patch cable between Switch-02 and Switch-03, network utilization hit 100%, management SSH froze, and switch logs reported MAC table flapping.',
    options: [
      { id: 'opt1', text: 'Replace all Category 6 cables with fiber optic transceivers.', isCorrect: false },
      { id: 'opt2', text: 'STP is disabled on the newly patched trunk link, causing an active Layer 2 switching loop.', isCorrect: true },
      { id: 'opt3', text: 'The switches ran out of VLAN IDs.', isCorrect: false },
    ],
    repairActions: [
      { id: 'rep1', text: 'Reboot all end-user workstations.', isCorrect: false },
      {
        id: 'rep2',
        text: 'Enable spanning-tree on the redundant trunk port and verify port enters blocking state.',
        isCorrect: true,
        patch: { action: 'enable_stp_blocking', target: 'SW-02-Gi0/2' },
      },
      { id: 'rep3', text: 'Disable ARP protocol on the core router.', isCorrect: false },
    ],
  },
};

/**
 * net-15: Boundary Security, Firewalls & STP
 * ─────────────────────────────────────────────────────────────────────────────
 * Milestone 7 — Concepts C46, C47
 * Teaches Layer 2 redundancy loop mitigation via Spanning Tree Protocol (STP
 * IEEE 802.1D/802.1w), Bridge Protocol Data Units (BPDUs), Root Bridge election,
 * stateless Access Control Lists (ACLs) with first-match implicit deny, and
 * stateful connection tracking (conntrack) firewalls.
 */

export const NET_15_MODULE: ModuleData = {
  id: 'net-15',
  slug: 'boundary-security-firewalls-and-stp',
  day: 15,
  title: 'Module 15: Boundary Security, Firewalls & STP',
  shortTitle: 'Security, Firewalls & STP',
  type: 'module',
  track: 'networking',
  milestoneId: 'net-milestone-7',
  description:
    'Master network protection at Layer 2 and Layer 3/4: Spanning Tree Protocol (STP) broadcast storm prevention, BPDU Root Bridge elections, stateless ACL rule ordering, and stateful connection tracking (conntrack) firewalls.',
  estimatedMinutes: 35,
  curriculumOrder: 15,
  displayLabel: 'Module 15',
  completionLearnings: [
    'Ethernet frames lack a TTL field; redundant physical loops cause infinite broadcast storms and MAC table thrashing that saturate network switches in seconds',
    'Spanning Tree Protocol (STP, IEEE 802.1D / RSTP 802.1w) automatically detects physical loops and places redundant ports into a Blocking/Discarding state',
    'Switches elect a single Root Bridge based on the lowest Bridge ID (Priority + MAC address); all active forwarding paths form a loop-free tree originating from the Root',
    'Stateless Access Control Lists (ACLs) inspect packets individually against sequential rules; the first matching rule dictates the action, followed by an invisible implicit deny at the end',
    'Stateless ACLs cannot track connection state: allowing outbound web traffic requires manually allowing all inbound traffic on ports >1023, creating severe security holes',
    'Stateful firewalls maintain a dynamic connection state table (conntrack): when an outbound connection is permitted (state NEW), return traffic is automatically allowed (state ESTABLISHED)',
  ],
  concepts: [
    // ─────────────────────────────────────────────────────
    // Concept 1: STP & Layer 2 Loop Prevention (C46)
    // ─────────────────────────────────────────────────────
    {
      id: 'net15-c1-stp-loops',
      order: 1,
      title: 'Layer 2 Redundancy & Spanning Tree Protocol (STP)',
      shortDescription:
        'Understand why redundant switch links cause catastrophic broadcast storms and how STP breaks physical loops into logical trees.',
      theory: {
        mentorScript: NET_15_MENTOR_SCRIPT,
        summary:
          'Because standard Ethernet frames lack a Time-To-Live (TTL) field, redundant physical links between switches cause infinite broadcast multiplication, frame duplication, and MAC address table thrashing that collapse networks in seconds. IEEE 802.1D Spanning Tree Protocol (STP) and 802.1w Rapid STP prevent loops by exchanging Bridge Protocol Data Units (BPDUs), electing a single Root Bridge based on lowest Bridge ID (Priority + MAC), and blocking redundant ports while keeping them ready for instant failover.',
        explanation: [
          '### Beat 1: The Physical Cause — Physical Cabling Redundancy & Missing Frame TTL',
          'Enterprise networks require high availability: if a single copper patch cable or fiber uplink is severed, business operations must not halt. Network engineers therefore cable redundant links between switches (e.g. triangle or ring meshes). However, unlike Layer 3 IPv4/IPv6 headers which possess a Time-To-Live (TTL) or Hop Limit counter decremented at each router hop to discard runaway packets, the IEEE 802.3 Ethernet frame header contains only Source MAC, Destination MAC, EtherType, Payload, and CRC. There is no TTL field. When a switch receives a broadcast frame (such as an ARP request for FF:FF:FF:FF:FF:FF) or an unknown unicast frame, physical switch hardware is required by the IEEE standard to flood that frame out of every active port except the ingress port.',
          '',
          '### Beat 2: The Wire / System Consequence — Infinite Broadcast Storms & MAC Thrashing',
          'In a redundant triangle topology without loop prevention, Switch A receives an ARP broadcast from PC-1 on port 1 and floods it across its uplinks to Switch B and Switch C. Switch B floods the frame across its cross-link to Switch C; Switch C simultaneously floods its copy to Switch B. Both switches then flood the duplicate copies back to Switch A. Because there is no TTL counter to expire the frames, the broadcast copies multiply exponentially with every transit. Within 500 milliseconds, millions of looping frames saturate 100% of physical wire bandwidth. Simultaneously, switches experience MAC table thrashing: the switches continually overwrite their Forwarding Information Base (CAM table), recording the source MAC as arriving from port 1, then port 2, then port 3 in rapid succession. Switch CPU utilization hits 100%, management access drops, and the entire local network crashes.',
          '',
          '### Beat 3: The Diagnostic / Operational Fix — BPDU Exchange, Root Election & Port Blocking',
          'IEEE 802.1D Spanning Tree Protocol (and modern 802.1w RSTP) resolves this physical reality without sacrificing redundant cabling. Every 2 seconds, switches broadcast Bridge Protocol Data Units (BPDUs). Switches elect a single Root Bridge—the switch with the lowest Bridge ID (composed of a configurable 2-byte Priority, default 32768, followed by the switch\'s 6-byte base MAC address). Every non-root switch determines its single lowest-cost path to the Root Bridge (its Root Port) and designates forwarding ports towards downstream segments. All other redundant paths are placed into a Blocking (or Discarding) state. A blocked port drops all regular user data frames and stops MAC learning, but continues listening to BPDUs. If a primary cable is cut, STP detects the loss of BPDUs and transitions the blocked port into Forwarding, restoring connectivity automatically.',
        ],
        keyTakeaway:
          'Ethernet lacks a TTL field. Unmanaged redundant links cause fatal broadcast storms and MAC thrashing. STP elects a Root Bridge (lowest Priority + MAC) and blocks redundant ports to guarantee a loop-free logical tree.',
        exampleQuery: '',
        exampleQueryExplanation: '',
        mcqs: [
          {
            id: 'net15-mcq-stp-broadcast-storm',
            question:
              'Why does an accidental physical cable loop crash an unmanaged Layer 2 switch network, while a routing loop at Layer 3 does not immediately freeze the entire enterprise?',
            options: [
              'Layer 2 switches run at much higher electric voltages than routers',
              'Ethernet frames lack a Time-To-Live (TTL) field; without a hop limit, broadcast frames circulate and multiply indefinitely until physical link bandwidth and switch buffers are 100% exhausted',
              'ARP requests are chemically corrosive to twisted-pair copper wire',
              'Layer 2 switches automatically shut off power whenever two switches are connected',
            ],
            correctIndex: 1,
            correctAnswerIndex: 1,
            explanation:
              'IPv4 headers contain a TTL field decremented by routers until it reaches 0 and is dropped with an ICMP Time Exceeded. Layer 2 Ethernet headers have no TTL or hop counter, so looped broadcast frames circulate forever, multiplying exponentially until the network collapses.',
          },
          {
            id: 'net15-mcq-root-bridge-election',
            question:
              'In IEEE 802.1D Spanning Tree Protocol, how do switches elect the Root Bridge among all participating bridges?',
            options: [
              'The switch with the highest IP address is automatically elected',
              'The switch with the lowest Bridge ID (configured Bridge Priority, with lowest MAC address as tie-breaker) is elected',
              'The switch with the greatest number of physical ports is elected',
              'All switches take turns acting as the Root Bridge every 60 seconds',
            ],
            correctIndex: 1,
            correctAnswerIndex: 1,
            explanation:
              'The Bridge ID consists of a 2-byte Priority (default 32768) and a 6-byte MAC address. The switch advertising the lowest numerical Bridge ID wins the Root Bridge election. Administrators explicitly set the primary core switch priority to 4096 or 0 to guarantee root status.',
          },
        ],
      },
      tasks: [
        {
          id: 'net15-p1-stp-election',
          title: 'Practice: Evaluating STP Root Election & Blocking Ports',
          description:
            'Determine the Root Bridge from switch priority and MAC values, and explain why Ethernet loops crash networks.',
          instructions: [
            'Three switches (SW1, SW2, SW3) form a triangle.',
            'SW1 has Bridge Priority 32768, MAC 00:11:22:33:44:01.',
            'SW2 has Bridge Priority 4096, MAC 00:11:22:33:44:02.',
            'SW3 has Bridge Priority 32768, MAC 00:11:22:33:44:03.',
            'Answer the judgment questions on Root Bridge election and loop mechanics.',
          ],
          type: 'guided',
          primaryTable: '',
          initialSql: '',
          solutionSql: 'NETWORKING_JUDGMENT_TASK',
          solutionExplanation:
            'SW2 has the lowest Bridge Priority (4096) and becomes the Root Bridge. Ethernet frames have no TTL, so loops cause infinite broadcast multiplication.',
          terminal: {
            title: 'Workplace Diagnostic Terminal — Ticket #118 (Dual Platform)',
            description:
              'Inspect Spanning Tree Protocol topologies, Root Bridge election parameters, and blocked port states across Cisco IOS and Linux bridge interfaces.',
            prompt: 'admin@dist-sw01:~$',
            initialOutput: [
              '====================================================================',
              '  WORKPLACE TICKET #118: SPANNING TREE PROTOCOL & LOOP AUDIT',
              '====================================================================',
              'Inspecting BPDU exchanges, Root Bridge election status, and redundant port states.',
              'Supported commands:',
              '  - Cisco IOS: show spanning-tree',
              '               show spanning-tree root',
              '  - Linux:     brctl showstp br0',
            ].join('\n'),
            availableCommands: [
              'show spanning-tree',
              'show spanning-tree root',
              'brctl showstp br0',
            ],
            commands: {
              'show spanning-tree': `VLAN0001
  Spanning tree enabled protocol rstp
  Root ID    Priority    4096
             Address     0011.2233.4402
             Cost        4
             Port        1 (GigabitEthernet0/1)
             Hello Time   2 sec  Max Age 20 sec  Forward Delay 15 sec

  Bridge ID  Priority    32768  (priority 32768 sys-id-ext 0)
             Address     0011.2233.4401
             Hello Time   2 sec  Max Age 20 sec  Forward Delay 15 sec

Interface           Role Sts Cost      Prio.Nbr Type
------------------- ---- --- --------- -------- --------------------------------
Gi0/1               Root FWD 4         128.1    P2p 
Gi0/2               Altn BLK 4         128.2    P2p (Blocked to eliminate loop)`,
              'show spanning-tree root': `                                        Root  Hello Max Fwd
Vlan                   Root ID          Cost  Time  Age Dly  Root Port
---------------- -------------------- ------ ----- --- ---  ----------------
VLAN0001          4096 0011.2233.4402      4     2   20  15  Gi0/1`,
              'brctl showstp br0': `br0
 bridge id              8000.001122334401
 designated root        1000.001122334402
 root path cost                  4              root port                       1
 max age                        20.00           bridge max age                 20.00
 hello time                      2.00           bridge hello time               2.00
 forward delay                  15.00           bridge forward delay           15.00
 ageing time                   300.00
 hello timer                     0.00           tcn timer                       0.00
 topology change timer           0.00           gc timer                        0.00
 flags

eth0 (1)
 port id                8001                    state                forwarding
 designated root        1000.001122334402       path cost                     4
 designated bridge      8000.001122334401       message age timer             0.00
 designated port        8001                    forward delay timer           0.00
 designated cost                 0              hold timer                    0.00
 flags

eth1 (2)
 port id                8002                    state                  blocking
 designated root        1000.001122334402       path cost                     4
 designated bridge      8000.001122334403       message age timer             1.82
 designated port        8002                    forward delay timer           0.00`,
            },
            commandResponses: {
              'show spanning-tree': `VLAN0001
  Spanning tree enabled protocol rstp
  Root ID    Priority    4096
             Address     0011.2233.4402
  Bridge ID  Priority    32768
Interface           Role Sts Cost      Prio.Nbr Type
Gi0/1               Root FWD 4         128.1    P2p 
Gi0/2               Altn BLK 4         128.2    P2p`,
              'show spanning-tree root': `VLAN0001          4096 0011.2233.4402      4     2   20  15  Gi0/1`,
              'brctl showstp br0': `br0: designated root 1000.001122334402, root port 1 (eth0), eth1 state: blocking`,
            },
          },
          firewall: {
            title: 'Spanning Tree Protocol (STP) Root Election & Loop Lab',
            description:
              'Simulate BPDU exchange, determine Root Bridge election from Bridge ID, and prevent Layer 2 broadcast storms.',
            defaultTab: 'stp_topology',
            switches: [
              { id: 'SW1', name: 'SW1 (Core)', priority: 32768, macAddress: '00:11:22:33:44:01' },
              { id: 'SW2', name: 'SW2 (Distribution)', priority: 4096, macAddress: '00:11:22:33:44:02' },
              { id: 'SW3', name: 'SW3 (Access)', priority: 32768, macAddress: '00:11:22:33:44:03' },
            ],
            stpEnabled: true,
            explanationNotes: [
              'SW2 priority 4096 is lower than 32768, winning the Root Bridge election',
              'Ethernet frames lack a TTL field; unblocked loops cause infinite broadcast multiplication',
            ],
          },
          hints: [
            {
              level: 1,
              text: 'The switch with the lowest Bridge Priority wins the election.',
            },
            {
              level: 2,
              text: 'Ethernet frames have no TTL counter to expire loops like IP packets do.',
            },
          ],
          validation: {
            judgment: [
              {
                kind: 'choose-and-defend',
                prompt:
                  'Which switch will be elected as the Spanning Tree Root Bridge in this topology?',
                options: [
                  'SW1, because it has the lowest MAC address',
                  'SW2, because its Bridge Priority of 4096 is lower than the default priority 32768 on SW1 and SW3',
                  'SW3, because it connects to the highest number of endpoints',
                  'All three switches share root duties simultaneously',
                ],
                correctIndex: 1,
                explanation:
                  'Bridge ID consists of Priority followed by MAC. The lowest priority wins. Since SW2 has priority 4096 (lower than 32768), it is elected Root Bridge without needing to compare MAC addresses.',
              },
              {
                kind: 'choose-and-defend',
                prompt:
                  'Why does a physical loop on an unmanaged Layer 2 switch network cause total network failure, whereas a loop at Layer 3 does not?',
                options: [
                  'Because Layer 2 switches run at higher voltage than routers',
                  'Because Ethernet II frame headers have no Time-to-Live (TTL) field; looped broadcast frames circulate indefinitely, endlessly duplicating until switch buffers and bandwidth saturate',
                  'Because ARP requests cannot cross Ethernet cables',
                  'Because switches automatically shut down power when two cables are plugged together',
                ],
                correctIndex: 1,
                explanation:
                  'IP packets have a TTL field decremented by routers to kill routing loops. Layer 2 Ethernet frames have no TTL or hop count field; broadcast frames circulate forever until the physical link is severed.',
              },
            ],
          },
          successMessage:
            'Correct! Lowest Priority wins the Root Bridge election, and STP prevents catastrophic Layer 2 broadcast storms.',
        },
      ],
    },

    // ─────────────────────────────────────────────────────
    // Concept 2: Stateless Access Control Lists (C47a)
    // ─────────────────────────────────────────────────────
    {
      id: 'net15-c2-stateless-acls',
      order: 2,
      title: 'Stateless Access Control Lists (ACLs)',
      shortDescription:
        'Examine stateless packet filtering, top-down sequential evaluation, the implicit deny rule, and the return traffic dilemma.',
      theory: {
        summary:
          'Stateless Access Control Lists (ACLs) inspect every network packet in total isolation against an ordered, top-down sequence of 5-tuple filtering rules (Source IP, Destination IP, Protocol, Source Port, Destination Port). Processing halts upon the very first matching rule, and every ACL concludes with an invisible implicit deny. Because stateless filters possess zero memory of previous packets, permitting outbound client connections forces administrators to open tens of thousands of high ephemeral ports to the public internet.',
        explanation: [
          '### Beat 1: The Physical Cause — Header Field Inspection Without Memory',
          'Routers and Layer 3 switches forward millions of packets per second using hardware ASICs. Stateless packet filtering was engineered to evaluate packets at line rate by inspecting only the Layer 3 (IPv4/IPv6) and Layer 4 (TCP/UDP/ICMP) headers of the instantaneous packet currently in transit. The router extracts the standard 5-tuple: Source IP, Destination IP, Protocol (TCP 6, UDP 17, ICMP 1), Source Port, and Destination Port. It compares these fields against a numbered, ordered list of Access Control List (ACL) entries.',
          '',
          '### Beat 2: The Wire / System Consequence — Top-Down First Match & The Return Dilemma',
          'ACL processing follows two immutable rules: first-match evaluation and implicit deny. The router tests the packet against Rule 1; if it matches, the permit or deny action is immediately executed and all subsequent rules are skipped. If no explicitly configured rule matches, the packet falls through to the invisible, unwritten rule at the bottom: `deny ip any any` (Implicit Deny All). However, this creates a catastrophic dilemma for bidirectional client-server traffic (such as TCP web browsing). When an internal PC (10.0.0.5) sends an HTTP request from ephemeral port 51240 to an external web server (93.184.216.34:80), the outbound packet matches a permit rule. But when the web server transmits the SYN-ACK or HTTP response back to 10.0.0.5:51240, the inbound router interface evaluates the return packet. Because stateless ACLs have no connection memory, the router does not know this incoming packet is a legitimate response. It hits the inbound implicit deny and is silently discarded.',
          '',
          '### Beat 3: The Diagnostic / Operational Fix — The Flawed High-Port Hack & Stateful Transition',
          'To make stateless ACLs work for clients, legacy administrators were forced to insert inbound rules permitting all incoming TCP traffic destined for ports >1023 (e.g. `permit tcp any 10.0.0.0/24 gt 1023 established`). While checking the ACK bit prevented raw incoming SYN packets, it left a massive attack surface open to any external attacker sending crafted non-SYN packets. This fundamental architectural limitation proved that perimeter security requires stateful connection tracking firewalls.',
        ],
        keyTakeaway:
          'Stateless ACLs evaluate top-down, halt on the first matching rule, and end with an implicit deny all. They cannot track connection state, making safe return traffic filtering impossible.',
        exampleQuery: '',
        exampleQueryExplanation: '',
        mcqs: [
          {
            id: 'net15-mcq-acl-first-match',
            question:
              'A network administrator configures an ACL: Line 10: "deny tcp any host 10.0.0.5 eq 80", Line 20: "permit tcp any host 10.0.0.5 eq 80". What happens when a user attempts to browse http://10.0.0.5?',
            options: [
              'The connection is permitted because Line 20 explicitly allows it',
              'The connection is blocked because ACLs are evaluated sequentially top-down and halt on the very first matching rule (Line 10)',
              'The router averages the two rules and drops 50% of the packets',
              'The router reboots due to a syntax conflict error',
            ],
            correctIndex: 1,
            correctAnswerIndex: 1,
            explanation:
              'ACLs execute top-down first-match semantics. As soon as Line 10 matches the destination IP and port, the deny action is enforced immediately, and all lower lines (including Line 20) are ignored.',
          },
          {
            id: 'net15-mcq-acl-implicit-deny',
            question:
              'What happens to an inbound DNS query packet (UDP port 53) if an ACL contains only rules permitting HTTP (TCP port 80) and HTTPS (TCP port 443)?',
            options: [
              'It is allowed because DNS is critical infrastructure exempt from ACL filtering',
              'It is discarded by the invisible "Implicit Deny All" rule present at the end of every ACL',
              'It is redirected to the router\'s local loopback interface',
              'The router converts the UDP packet into a TCP packet automatically',
            ],
            correctIndex: 1,
            correctAnswerIndex: 1,
            explanation:
              'All standard ACLs terminate with an invisible `deny ip any any` rule. If a packet fails to match any explicitly defined permit rule above it, it is dropped.',
          },
        ],
      },
      tasks: [
        {
          id: 'net15-p2-acl-rule-evaluation',
          title: 'Practice: Tracing Stateless ACL First-Match & Implicit Deny',
          description:
            'Evaluate packet flow against ordered ACL rules and predict whether packets are permitted or discarded.',
          instructions: [
            'An engineer authors an inbound router ACL with three rules.',
            'Answer the judgment questions on rule ordering and the implicit deny behavior.',
          ],
          type: 'guided',
          primaryTable: '',
          initialSql: '',
          solutionSql: 'NETWORKING_JUDGMENT_TASK',
          solutionExplanation:
            'ACLs process sequentially; first match wins. Any packet not matching an explicit permit or deny hits the implicit deny any and is dropped.',
          firewall: {
            title: 'Stateless ACL First-Match & Implicit Deny Pipeline',
            description:
              'Trace sequential packet evaluation through ordered rules and observe first-match termination and implicit deny behavior.',
            defaultTab: 'acl_pipeline',
            rules: [
              { line: 10, action: 'deny', protocol: 'tcp', source: 'any', destination: 'host 10.0.0.5', destPort: 80, comment: 'Block HTTP to sensitive host' },
              { line: 20, action: 'permit', protocol: 'tcp', source: 'any', destination: 'host 10.0.0.5', destPort: 80, comment: 'Conflicting rule (never reached)' },
              { line: 30, action: 'permit', protocol: 'tcp', source: 'any', destination: 'any', destPort: 443, comment: 'Allow HTTPS traffic' },
            ],
            explanationNotes: [
              'Line 10 matches first and blocks traffic; Line 20 is never evaluated',
              'Unmatched DNS query (UDP 53) hits the invisible implicit deny at the end',
            ],
          },
          hints: [
            {
              level: 1,
              text: 'Once a rule matches, processing stops immediately.',
            },
            {
              level: 2,
              text: 'Every ACL ends with an invisible deny ip any any.',
            },
          ],
          validation: {
            judgment: [
              {
                kind: 'choose-and-defend',
                prompt:
                  'An ACL contains: Line 10: `deny tcp any host 10.0.0.5 eq 80`; Line 20: `permit tcp any host 10.0.0.5 eq 80`. What happens when a user attempts to connect to http://10.0.0.5?',
                options: [
                  'The connection is permitted because Line 20 allows it',
                  'The connection is blocked because Line 10 matches first, and ACL processing halts on first match',
                  'The router averages the two rules and allows half of the packets',
                  'The router reports a syntax compilation error and reboots',
                ],
                correctIndex: 1,
                explanation:
                  'ACL rules are evaluated top-down. Line 10 matches the destination and port, so the deny action is applied immediately. Line 20 is never reached.',
              },
              {
                kind: 'choose-and-defend',
                prompt:
                  'What happens to an inbound DNS query packet (UDP port 53) if an ACL lists only rules permitting HTTP (port 80) and HTTPS (port 443)?',
                options: [
                  'It is allowed through because DNS is an essential internet service',
                  'It is dropped by the invisible "Implicit Deny All" rule present at the end of every ACL',
                  'The router translates it into an HTTP packet',
                  'It is redirected to 127.0.0.1',
                ],
                correctIndex: 1,
                explanation:
                  'Every ACL concludes with an invisible implicit deny. If a packet does not match any explicitly configured permit rule, it is dropped.',
              },
            ],
          },
          successMessage:
            'Spot on! You understand the strict first-match evaluation order and the invisible implicit deny at the end of stateless ACLs.',
        },
      ],
    },

    // ─────────────────────────────────────────────────────
    // Concept 3: Stateful Firewalls & Connection Tracking (C47b)
    // ─────────────────────────────────────────────────────
    {
      id: 'net15-c3-stateful-firewalls',
      order: 3,
      title: 'Stateful Firewalls & Connection Tracking (conntrack)',
      shortDescription:
        'Contrast stateless filters with stateful inspection: connection tracking state tables (NEW, ESTABLISHED, RELATED) and automatic return traffic authorization.',
      theory: {
        summary:
          'Stateful Packet Inspection (SPI) firewalls maintain a dynamic connection state table in memory (such as Linux conntrack) tracking the Layer 4 state and sequence numbers of every ongoing session. Packets are categorized into four states: NEW, ESTABLISHED, RELATED, and INVALID. When an internal host initiates an outbound connection, the firewall records the 5-tuple and state; when the external server responds, the firewall recognizes the return traffic as ESTABLISHED and automatically permits it without opening high ports.',
        explanation: [
          '### Beat 1: The Physical Cause — Ephemeral Ports & The Inbound Dilemma',
          'Whenever an endpoint applications initiates network communication (such as an HTTPS web request to a remote server on port 443), the operating system kernel dynamically binds a random ephemeral port (e.g. 52140). Because client operating systems allocate ephemeral ports unpredictably across the range 1024–65535, a boundary firewall cannot predict which destination port the external server\'s response will be sent to. In a purely stateless architecture, this requires either blocking return traffic (breaking the internet) or opening all ports >1023 (breaking security).',
          '',
          '### Beat 2: The Wire / System Consequence — Dynamic Conntrack State Tables',
          'Stateful Packet Inspection (SPI) firewalls solve this dilemma by allocating kernel memory for a dynamic connection tracking table (conntrack). Every packet passing through the firewall is parsed and classified into one of four fundamental states:',
          '- **NEW**: The packet is initiating a new connection (e.g. a TCP SYN packet). If the perimeter security policy permits outbound connections, the firewall creates a new entry in its conntrack table recording `[Source IP:Port, Dest IP:Port, Protocol, State]`.',
          '- **ESTABLISHED**: The packet is part of an already approved bidirectional conversation (e.g. TCP SYN-ACK, ACK, or subsequent data payload). When an external server replies to the client\'s ephemeral port, the firewall matches the incoming packet\'s reverse 5-tuple against the active table entry and immediately allows it through.',
          '- **RELATED**: The packet initiates a new connection but is cryptographically or functionally tied to an existing session (e.g. FTP data channel port negotiation or ICMP Destination Unreachable / Time Exceeded error messages caused by an active TCP stream).',
          '- **INVALID**: The packet does not match any known connection and has illegal TCP flag combinations (e.g. SYN-FIN or corrupted sequence numbers) and is immediately dropped.',
          '',
          '### Beat 3: The Diagnostic / Operational Fix — Default-Deny Perimeter Architecture',
          'With connection tracking enabled, enterprise perimeter security achieves the gold standard of defense: the default policy is set to drop all unsolicited inbound traffic (`Chain INPUT (policy DROP)` / `Chain FORWARD (policy DROP)`). A single high-performance rule at the top of the chain permits all traffic with state `ESTABLISHED,RELATED` (`iptables -A FORWARD -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT`). Outbound client traffic is permitted with state `NEW`, allowing employees full internet access while blocking 100% of external port scans, unsolicited connection probes, and zero-day intrusion attempts.',
        ],
        keyTakeaway:
          'Stateful firewalls maintain a dynamic memory table (conntrack) that classifies packets as NEW, ESTABLISHED, RELATED, or INVALID. Return traffic is automatically authorized without opening broad listening ports.',
        exampleQuery: '',
        exampleQueryExplanation: '',
        mcqs: [
          {
            id: 'net15-mcq-conntrack-states',
            question:
              'In a stateful firewall\'s connection tracking system (such as Linux conntrack), how is an unsolicited TCP SYN packet arriving from an unknown internet IP address classified?',
            options: [
              'ESTABLISHED',
              'NEW',
              'RELATED',
              'LOOPBACK',
            ],
            correctIndex: 1,
            correctAnswerIndex: 1,
            explanation:
              'A TCP SYN packet that does not match any existing session in the conntrack memory table is categorized as NEW. If the perimeter policy denies unsolicited inbound connections, the packet is discarded immediately.',
          },
          {
            id: 'net15-mcq-stateful-return-traffic',
            question:
              'How does a stateful firewall permit web servers to reply to internal office laptops without requiring the administrator to open all incoming TCP ports above 1023?',
            options: [
              'It decrypts all traffic and executes malware scans on the fly',
              'It tracks the outbound 5-tuple in its kernel state table; when the remote server sends a SYN-ACK back to the laptop\'s ephemeral port, the firewall recognizes it as ESTABLISHED and admits it automatically',
              'It assigns every internal laptop a public IP address during web browsing',
              'It translates TCP packets into UDP datagrams before delivery',
            ],
            correctIndex: 1,
            correctAnswerIndex: 1,
            explanation:
              'Because the firewall tracks the connection state in memory, incoming replies match the inverted 5-tuple of the outbound session, qualifying as ESTABLISHED traffic. This allows return packets while keeping the perimeter locked to unsolicited incoming traffic.',
          },
        ],
      },
      tasks: [
        {
          id: 'net15-p3-stateful-conntrack',
          title: 'Practice: Analyzing Stateful Connection Tracking Tables',
          description:
            'Inspect connection tracking state classifications and predict firewall filtering behavior.',
          instructions: [
            'A company deploys a stateful firewall protecting internal office clients.',
            'Answer the judgment questions on connection tracking states and inbound security.',
          ],
          type: 'guided',
          primaryTable: '',
          initialSql: '',
          solutionSql: 'NETWORKING_JUDGMENT_TASK',
          solutionExplanation:
            'Stateful firewalls classify returning traffic as ESTABLISHED and permit it automatically, while dropping unsolicited external packets classified as NEW.',
          terminal: {
            title: 'Workplace Diagnostic Terminal — Ticket #117 (Dual Platform)',
            description:
              'Inspect stateful firewall filter rules, connection tracking state tables, and host firewall rules on Linux Netfilter and Windows PowerShell.',
            prompt: 'root@firewall-gw:~#',
            initialOutput: [
              '====================================================================',
              '  WORKPLACE TICKET #117: STATEFUL FIREWALL & CONNTRACK AUDIT',
              '====================================================================',
              'Auditing stateful connection tracking table and rule chains.',
              'Supported commands:',
              '  - Linux:   iptables -L -v -n',
              '             conntrack -L',
              '  - Windows: Get-NetFirewallRule',
            ].join('\n'),
            availableCommands: [
              'iptables -L -v -n',
              'conntrack -L',
              'Get-NetFirewallRule',
            ],
            commands: {
              'iptables -L -v -n': `Chain INPUT (policy DROP 124 packets, 7440 bytes)
 pkts bytes target     prot opt in     out     source               destination         
 482K  312M ACCEPT     all  --  *      *       0.0.0.0/0            0.0.0.0/0            ctstate RELATED,ESTABLISHED
 1420 85200 ACCEPT     tcp  --  eth0   *       0.0.0.0/0            192.168.1.1          tcp dpt:22 ctstate NEW

Chain FORWARD (policy DROP 42 packets, 2520 bytes)
 pkts bytes target     prot opt in     out     source               destination         
 1.2M  890M ACCEPT     all  --  eth1   eth0    10.0.0.0/24          0.0.0.0/0            ctstate NEW,RELATED,ESTABLISHED
 980K  720M ACCEPT     all  --  eth0   eth1    0.0.0.0/0            10.0.0.0/24          ctstate RELATED,ESTABLISHED

Chain OUTPUT (policy ACCEPT 512K packets, 410M bytes)`,
              'conntrack -L': `tcp      6 431999 ESTABLISHED src=10.0.0.105 dst=93.184.216.34 sport=51240 dport=443 src=93.184.216.34 dst=10.0.0.105 sport=443 dport=51240 [ASSURED] mark=0 use=1
tcp      6 118 SYN_SENT src=10.0.0.110 dst=142.250.190.46 sport=49812 dport=443 [UNREPLIED] src=142.250.190.46 dst=10.0.0.110 sport=443 dport=49812 mark=0 use=1
conntrack v1.4.6 (conntrack-tools): 2 flow entries have been shown.`,
              'Get-NetFirewallRule': `Name                  : Block-Unsolicited-Inbound
DisplayName           : Block Unsolicited Inbound Network Traffic
Description           : Enforces stateful boundary drop for unsolicited inbound connections
DisplayGroup          : Core Networking
Enabled               : True
Profile               : Domain, Private, Public
Platform              : {}
Direction             : Inbound
Action                : Block
EdgeTraversalPolicy   : Block
LooseSourceMapping    : False
LocalOnlyMapping      : False
Owner                 : SYSTEM
PrimaryStatus         : OK
EnforcementStatus     : NotApplicable
PolicyStoreSource     : PersistentStore
PolicyStoreSourceType : Local`,
            },
            commandResponses: {
              'iptables -L -v -n': `Chain INPUT (policy DROP)
 482K ACCEPT all -- * * 0.0.0.0/0 0.0.0.0/0 ctstate RELATED,ESTABLISHED
Chain FORWARD (policy DROP)
 1.2M ACCEPT all -- eth1 eth0 10.0.0.0/24 0.0.0.0/0 ctstate NEW,RELATED,ESTABLISHED
 980K ACCEPT all -- eth0 eth1 0.0.0.0/0 10.0.0.0/24 ctstate RELATED,ESTABLISHED`,
              'conntrack -L': `tcp 6 431999 ESTABLISHED src=10.0.0.105 dst=93.184.216.34 sport=51240 dport=443 [ASSURED]
tcp 6 118 SYN_SENT src=10.0.0.110 dst=142.250.190.46 sport=49812 dport=443 [UNREPLIED]`,
              'Get-NetFirewallRule': `Name: Block-Unsolicited-Inbound, Direction: Inbound, Action: Block, Enabled: True`,
            },
          },
          firewall: {
            title: 'Stateful Connection Tracking (conntrack) Inspector',
            description:
              'Analyze connection tracking tables and contrast automatic ESTABLISHED return allowance with unsolicited NEW packet dropping.',
            defaultTab: 'stateful_conntrack',
            conntrackEntries: [
              { id: 'ct-1', protocol: 'tcp', srcIp: '10.0.0.105', srcPort: 51240, dstIp: '93.184.216.34', dstPort: 443, state: 'ESTABLISHED', timeoutSeconds: 7180 },
              { id: 'ct-2', protocol: 'tcp', srcIp: '10.0.0.110', srcPort: 49812, dstIp: '142.250.190.46', dstPort: 443, state: 'NEW', timeoutSeconds: 115 },
            ],
            explanationNotes: [
              'Returning SYN-ACK packets match active conntrack entries and are classified as ESTABLISHED',
              'Unsolicited external SYN packets are classified as NEW and blocked by default perimeter policy',
            ],
          },
          hints: [
            {
              level: 1,
              text: 'A returning SYN-ACK packet matches an existing state entry and is classified as ESTABLISHED.',
            },
            {
              level: 2,
              text: 'Unsolicited external SYN packets are classified as NEW and blocked unless explicitly allowed.',
            },
          ],
          validation: {
            judgment: [
              {
                kind: 'choose-and-defend',
                prompt:
                  'How does a stateful firewall permit web response traffic from an external server back to an internal client without requiring an administrator to open all high inbound ports?',
                options: [
                  'It asks the ISP router to decrypt the web traffic',
                  'It records the outbound 5-tuple in its active connection state table (conntrack); when the external server replies, the firewall recognizes the return packet as part of an ESTABLISHED connection and permits it',
                  'It temporarily assigns the client a public IP address for 5 seconds',
                  'It runs an internal DNS server that rewrites all packet payloads',
                ],
                correctIndex: 1,
                explanation:
                  'The state table dynamically tracks active bidirectional connections. When return packets arrive matching an existing entry, they are classified as ESTABLISHED and allowed through automatically.',
              },
              {
                kind: 'choose-and-defend',
                prompt:
                  'An external host on the public internet sends a TCP SYN packet to an internal office desktop behind a stateful firewall. How is this packet classified by the firewall\'s connection tracker?',
                options: [
                  'ESTABLISHED',
                  'NEW (unsolicited inbound connection)',
                  'RELATED',
                  'LOOPBACK',
                ],
                correctIndex: 1,
                explanation:
                  'Because the packet is an initial SYN not matching any existing session in the state table, it is classified as NEW. Since internal desktops do not permit unsolicited inbound connections, the firewall drops it.',
              },
            ],
          },
          successMessage:
            'Mastered! You understand stateful connection tracking and how conntrack secures internal networks from unsolicited inbound attacks.',
        },
      ],
    },
  ],

  challenge: {
    id: 'net15-challenge',
    title: 'Module 15 Challenge: STP Topology & Firewall Rule Architecture',
    scenario:
      'Audit enterprise switch redundancy to prevent broadcast loops and optimize stateful firewall policies.',
    tasks: [
      {
        id: 'net15-ch1-stp-topology-blocking',
        title: 'Challenge 1: Spanning Tree Topology & Port Role Identification',
        description:
          'Trace BPDU root path costs in a redundant switch loop and determine which port is placed into Blocking state.',
        instructions: [
          'Switches SW-A, SW-B, and SW-C are connected in a loop with 1 Gbps links (STP cost = 4 per link).',
          'SW-A is the Root Bridge (lowest priority 4096).',
          'SW-B connects to SW-A directly (cost 4).',
          'SW-C connects to SW-A directly (cost 4).',
          'SW-B and SW-C also have a direct cross-link between them.',
          'Identify what STP does with the link between SW-B and SW-C.',
        ],
        type: 'challenge',
        primaryTable: '',
        initialSql: '',
        solutionSql: 'NETWORKING_JUDGMENT_TASK',
        solutionExplanation:
          'The link between SW-B and SW-C is redundant. One end becomes a Designated Port and the other is placed into Blocking/Discarding state to eliminate the loop.',
        firewall: {
          title: 'STP Redundant Topology & Port Role Identification Lab',
          description:
            'Trace BPDU root path costs in a redundant switch triangle and identify the blocked port on the inter-switch cross-link.',
          defaultTab: 'stp_topology',
          switches: [
            { id: 'SW-A', name: 'SW-A (Root)', priority: 4096, macAddress: '00:1A:2B:3C:4D:01' },
            { id: 'SW-B', name: 'SW-B (Uplink)', priority: 32768, macAddress: '00:1A:2B:3C:4D:02' },
            { id: 'SW-C', name: 'SW-C (Access)', priority: 32768, macAddress: '00:1A:2B:3C:4D:03' },
          ],
          links: [
            { id: 'link-ab', fromSwitch: 'SW-A', fromPort: 'Gi0/1', toSwitch: 'SW-B', toPort: 'Gi0/1', cost: 4, status: 'forwarding' },
            { id: 'link-ac', fromSwitch: 'SW-A', fromPort: 'Gi0/2', toSwitch: 'SW-C', toPort: 'Gi0/1', cost: 4, status: 'forwarding' },
            { id: 'link-bc', fromSwitch: 'SW-B', fromPort: 'Gi0/2', toSwitch: 'SW-C', toPort: 'Gi0/2', cost: 4, status: 'blocking' },
          ],
          stpEnabled: true,
          explanationNotes: [
            'Both SW-B and SW-C select direct links to SW-A as Root Ports',
            'Cross-link between SW-B and SW-C places one port into Blocking to eliminate the loop',
          ],
        },
        hints: [
          {
            level: 1,
            text: 'Both SW-B and SW-C use their direct links to SW-A as their Root Ports.',
          },
          {
            level: 2,
            text: 'The link between SW-B and SW-C would form a loop if both ends forwarded traffic.',
          },
        ],
        validation: {
          judgment: [
            {
              kind: 'choose-and-defend',
              prompt:
                'What port state does Spanning Tree Protocol assign to one end of the redundant cross-link between SW-B and SW-C?',
              options: [
                'Forwarding on both ends to double network speed',
                'Blocking (or Discarding in RSTP), preventing user data traffic from looping while remaining ready to unblock if an active uplink to SW-A fails',
                'Disabled permanently with the port power turned off',
                'Switched to Half-Duplex mode',
              ],
              correctIndex: 1,
              explanation:
                'To break the loop, STP places one port on the redundant inter-switch link into Blocking/Discarding state. It forwards no traffic, preventing broadcast storms, but activates if a primary link fails.',
            },
          ],
        },
        successMessage:
          'Challenge 1 mastered! You correctly identified how STP prevents loops by placing redundant ports into Blocking state.',
      },
      {
        id: 'net15-ch2-stateless-vs-stateful-firewall',
        title: 'Challenge 2: Debugging Asymmetric Stateless ACL Drops',
        description:
          'Diagnose why internal clients cannot browse the web after an engineer deploys a stateless ACL.',
        instructions: [
          'A junior network administrator configures stateless ACLs on a perimeter router:',
          '  • Outbound WAN ACL: `permit tcp 10.0.0.0/24 any eq 80`, `permit tcp 10.0.0.0/24 any eq 443`, followed by implicit deny.',
          '  • Inbound WAN ACL: contains no return permit rules for web ports, concluding with the standard implicit `deny ip any any`.',
          'Users immediately lose all web browsing capabilities.',
          'Explain why the connection fails.',
        ],
        type: 'challenge',
        primaryTable: '',
        initialSql: '',
        solutionSql: 'NETWORKING_JUDGMENT_TASK',
        solutionExplanation:
          'Because the ACL is stateless, the outbound SYN leaves, but returning SYN-ACK packets from web servers are blocked by the inbound implicit deny because there is no matching return permit rule.',
        firewall: {
          title: 'Stateless vs Stateful Asymmetric Return Flow Simulator',
          description:
            'Diagnose why stateless ACLs drop return web traffic (SYN-ACK) while stateful conntrack permits it automatically.',
          defaultTab: 'stateful_conntrack',
          conntrackEntries: [
            { id: 'ct-web-1', protocol: 'tcp', srcIp: '10.0.0.50', srcPort: 52100, dstIp: '93.184.216.34', dstPort: 80, state: 'NEW', timeoutSeconds: 120 },
          ],
          explanationNotes: [
            'Outbound SYN leaves under permit rule, but returning SYN-ACK hits inbound implicit deny',
            'Stateful firewalls eliminate this dilemma by tracking active session states',
          ],
        },
        hints: [
          {
            level: 1,
            text: 'TCP requires bidirectional communication (SYN, SYN-ACK, ACK).',
          },
          {
            level: 2,
            text: 'Stateless ACLs do not remember outbound requests when evaluating inbound responses.',
          },
        ],
        validation: {
          judgment: [
            {
              kind: 'choose-and-defend',
              prompt:
                'Why did the outbound stateless ACL break web browsing for internal users?',
              options: [
                'Port 80 and 443 are deprecated by the IETF',
                'TCP connections require bidirectional packet flow; while the client SYN leaves, the returning SYN-ACK from the web server is dropped by the router\'s inbound implicit deny because stateless ACLs do not track return traffic',
                'The router ran out of memory storing the rules',
                'Web browsers refuse to send traffic to routers with ACLs',
              ],
              correctIndex: 1,
              explanation:
                'Stateless ACLs have no connection memory. Outbound packets succeed, but return packets are dropped unless an explicit inbound permit rule exists. This is why stateful firewalls are the industry standard.',
            },
          ],
        },
        successMessage:
          'Challenge 2 cleared! You diagnosed asymmetric return traffic drops in stateless ACLs and proved the architectural necessity of stateful inspection.',
      },
    ],
  },
};
