import { ModuleData } from '../../../types/curriculum';

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
        summary:
          'Because Ethernet lacks a TTL field, physical switch loops cause infinite broadcast storms. STP elects a Root Bridge (lowest Bridge ID: Priority + MAC) via BPDUs and places redundant ports into a Blocking/Discarding state, breaking loops while preserving failover paths.',
        explanation: [
          '### The Broadcast Storm Threat',
          'Ethernet frames have no TTL. A broadcast frame in a physical loop multiplies exponentially, consuming 100% of bandwidth and freezing switch CPUs.',
          '',
          '### STP Loop Prevention',
          'Switches exchange BPDUs every 2s. The switch with lowest Priority + MAC becomes the Root Bridge. Ports are assigned roles: Root Port, Designated Port, and Blocking Port (blocks user frames, listens for BPDUs).',
        ],
        keyTakeaway:
          'Ethernet has no TTL. STP prevents catastrophic broadcast storms by placing redundant ports into Blocking state.',
        exampleQuery: '',
        exampleQueryExplanation: '',
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
          'Stateless ACLs evaluate each packet in isolation against an ordered list of 5-tuple rules. Processing is sequential and stops at first match. All ACLs end with an invisible implicit deny. Because they cannot track state, permitting return traffic requires opening broad high ports.',
        explanation: [
          '### First-Match Processing',
          'Packets are checked line-by-line. As soon as a rule matches, the action is taken and subsequent rules are skipped.',
          '',
          '### Implicit Deny All',
          'Any packet that fails to match an explicit permit rule hits the implicit deny any and is dropped.',
          '',
          '### The Return Traffic Dilemma',
          'Stateless filters cannot know that an inbound packet is a response to an allowed outbound request, requiring dangerous open ports for return flows.',
        ],
        keyTakeaway:
          'ACLs evaluate top-down on first-match and conclude with an implicit deny all. They cannot track return connection state.',
        exampleQuery: '',
        exampleQueryExplanation: '',
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
          'Stateful Packet Inspection maintains a dynamic connection state table (conntrack). Packets are classified as NEW, ESTABLISHED, RELATED, or INVALID. When an outbound session is permitted, returning responses are classified as ESTABLISHED and allowed through automatically while blocking unsolicited external attacks.',
        explanation: [
          '### The Connection Tracking Model',
          '- **NEW**: Unsolicited packet attempting to establish a connection.',
          '- **ESTABLISHED**: Packet belonging to an existing bidirectional session.',
          '- **RELATED**: Packet related to an active session (e.g. ICMP error or FTP data).',
          '- **INVALID**: Corrupt or out-of-order packet.',
          '',
          '### Return Traffic Solution',
          'By permitting outbound NEW and inbound ESTABLISHED/RELATED, internal endpoints communicate freely while external unsolicited attempts are dropped.',
        ],
        keyTakeaway:
          'Stateful firewalls dynamically track active sessions, automatically permitting returning ESTABLISHED traffic without broad open ports.',
        exampleQuery: '',
        exampleQueryExplanation: '',
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
