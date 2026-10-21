import { ModuleData } from '../../../types/curriculum';
import type { MentorScript } from '../../../types/networking-curriculum';

export const NET_08_MENTOR_SCRIPT: MentorScript = {
  version: '1.0.0',
  track: 'networking',
  moduleId: 'net-08',
  conceptId: 'why-nat-and-terminology',
  revealLadder: {
    'step-0': ['host-a'],
    'step-1': ['host-a', 'private-ip'],
    'step-2': ['host-a', 'private-ip', 'edge-router'],
    'step-3': ['host-a', 'private-ip', 'edge-router', 'nat-table'],
    'step-4': ['host-a', 'private-ip', 'edge-router', 'nat-table', 'public-web'],
    'step-5': ['host-a', 'private-ip', 'edge-router', 'nat-table', 'public-web', 'return-flow'],
  },
  terms: {
    rfc1918: {
      label: 'RFC 1918 Private IP',
      part: 'private-ip',
      explanation: 'Internal non-routable IPv4 addresses (10.x, 172.16.x, 192.168.x) dropped immediately by public internet ISP routers.',
    },
    pat: {
      label: 'Port Address Translation (PAT)',
      part: 'nat-table',
      explanation: 'NAT overload multiplexing thousands of private devices behind 1 public IP using unique Layer 4 source ports.',
    },
    nattable: {
      label: 'NAT State Table',
      part: 'nat-table',
      explanation: 'The router memory table binding (Inside Local IP:Port) to (Inside Global Public IP:Port) to route return traffic.',
    },
    denat: {
      label: 'De-NATting',
      part: 'return-flow',
      explanation: 'The reverse translation on incoming response packets restoring the private host destination IP and port.',
    },
  },
  beats: [
    {
      id: 'beat-1',
      stage: { stageNumber: 1, title: 'Observe: The Private Address Dilemma' },
      kind: 'say',
      text: 'Host A has IP `192.168.1.100`. This is an {{term:rfc1918}} private address. If this packet enters the public internet wire with a private source IP, ISP routers drop it instantly. It is non-routable!',
      spotlight: 'private-ip',
      revealedParts: ['host-a', 'private-ip'],
    },
    {
      id: 'beat-2',
      stage: { stageNumber: 1, title: 'Predict: The Office Analogy' },
      kind: 'predict',
      text: 'Your office has 500 employees, but the telephone company only gave your building 1 public phone number. How does an outside client call reach your specific desk extension?',
      spotlight: 'edge-router',
      revealedParts: ['host-a', 'private-ip', 'edge-router'],
      options: [
        {
          id: 'opt-receptionist',
          label: 'The receptionist answers on the main number and connects the call to your unique internal extension.',
          isCorrect: true,
          feedback: 'Exactly! The edge router acts like the corporate telephone receptionist. It shares 1 public IP and uses port numbers like internal telephone extensions.',
        },
        {
          id: 'opt-broadcast-phone',
          label: 'The phone rings on all 500 desks simultaneously and everyone answers.',
          isCorrect: false,
          feedback: 'That would cause mass chaos in the office! We need a stateful lookup mechanism.',
        },
        {
          id: 'opt-voicemail',
          label: 'Every caller is sent to voicemail because IP addresses cannot support voice communication.',
          isCorrect: false,
          feedback: 'VoIP runs natively on IP networks; the key challenge is multiplexing multiple conversations.',
        },
      ],
      whyOptions: [
        {
          id: 'why-port-multiplex',
          label: 'Layer 4 port numbers distinguish between multiple internal conversations sharing a single public IP address.',
          isCorrect: true,
          feedback: 'Spot on! Each inside connection is mapped to a distinct source port on the public IP.',
        },
        {
          id: 'why-ip-overlap',
          label: 'All private internal devices are assigned the exact same MAC address by the ISP.',
          isCorrect: false,
          feedback: 'MAC addresses are unique hardware serials and never touch public ISP routers.',
        },
      ],
    },
    {
      id: 'beat-3',
      stage: { stageNumber: 1, title: 'Action: Outbound PAT Translation' },
      kind: 'do',
      text: 'Host A initiates an HTTP request from port 52410 toward `198.51.100.4:80`. Click Translate Egress to record the mapping in the {{term:nattable}}.',
      actionPrompt: 'Translate Egress (192.168.1.100:52410 → 203.0.113.1:40001)',
      actionTargetPart: 'nat-table',
      revealedParts: ['host-a', 'private-ip', 'edge-router', 'nat-table', 'public-web'],
      spotlight: 'nat-table',
    },
    {
      id: 'beat-4',
      stage: { stageNumber: 1, title: 'Observe: The Public Internet Egress' },
      kind: 'point',
      text: 'The packet leaves the router WAN port stamped with public Source IP `203.0.113.1` and Port `40001`. The web server believes it is talking solely to the router! The private LAN is completely hidden.',
      spotlight: 'public-web',
      revealedParts: ['host-a', 'private-ip', 'edge-router', 'nat-table', 'public-web'],
    },
    {
      id: 'beat-5',
      stage: { stageNumber: 1, title: 'Predict: Return Flow De-NATting' },
      kind: 'predict',
      text: 'The web server responds to `203.0.113.1:40001`. How does the edge router know which of the 500 office computers should receive the webpage response?',
      spotlight: 'return-flow',
      revealedParts: ['host-a', 'private-ip', 'edge-router', 'nat-table', 'public-web', 'return-flow'],
      options: [
        {
          id: 'opt-nat-lookup',
          label: 'It checks the NAT table: destination port 40001 maps to Inside Local 192.168.1.100:52410 (De-NATting).',
          isCorrect: true,
          feedback: 'Spot on! The router looks up port 40001, swaps the destination IP/port back to Host A, and forwards it onto the local LAN.',
        },
        {
          id: 'opt-nat-flood',
          label: 'It floods the response to all 500 computers on the switch.',
          isCorrect: false,
          feedback: 'No! The router consults its exact state table binding. If no entry matches, the packet is silently discarded.',
        },
        {
          id: 'opt-nat-discard',
          label: 'It forwards the response to the DNS server to inspect who owns the connection.',
          isCorrect: false,
          feedback: 'DNS does not handle live packet state tracking; the router NAT table does.',
        },
      ],
      whyOptions: [
        {
          id: 'why-state-binding',
          label: 'The state table preserves the 1:1 dynamic association between private Inside Local and public Inside Global ports.',
          isCorrect: true,
          feedback: 'Correct! Without this dynamic state table entry, return packets have no routable path back to the client.',
        },
        {
          id: 'why-stateless-guess',
          label: 'Routers guess which computer sent the request based on CPU load.',
          isCorrect: false,
          feedback: 'Routers never guess; networking relies on deterministic state bindings.',
        },
      ],
    },
    {
      id: 'beat-6',
      stage: { stageNumber: 1, title: 'Observe: The Inherent Firewall Barrier' },
      kind: 'say',
      text: 'Notice a vital security superpower: If an external attacker on the internet attempts to initiate an unsolicited connection to `203.0.113.1`, the router has no matching entry in its NAT table and drops it immediately! NAT creates an automatic inbound defense barrier.',
      spotlight: 'edge-router',
      revealedParts: ['host-a', 'private-ip', 'edge-router', 'nat-table', 'public-web', 'return-flow'],
    },
  ],
  ticketScene: {
    ticketId: '108',
    title: 'Ticket #108: Inbound Web Server Port Forwarding Failure',
    symptom: 'Public users cannot access company web portal at 203.0.113.10:80. Internal hosts reach the web server at 192.168.1.80:80 without issue.',
    telemetry: [
      'Edge Router WAN IP: 203.0.113.10 (State: ACTIVE)',
      'Internal Web Server: 192.168.1.80:80 (HTTP 200 OK via internal curl)',
      'External Ingress Test: curl http://203.0.113.10/ -> Connection refused / Timeout',
      'NAT Translation Table: Zero active translations for TCP port 80. NAT port forwarding rule is MISSING.',
    ],
    options: [
      {
        id: 'opt-missing-dnat',
        label: 'The edge router is missing a DNAT (port forwarding) rule mapping WAN port 80 to internal IP 192.168.1.80:80.',
        isCorrect: true,
        feedback: 'Correct! Inbound unsolicited traffic is dropped by PAT unless a static DNAT port-forwarding rule explicitly routes that external port to an internal server.',
      },
      {
        id: 'opt-web-dead',
        label: 'The Apache/Nginx web server service crashed on 192.168.1.80.',
        isCorrect: false,
        feedback: 'Internal telemetry verified curl http://192.168.1.80 returns HTTP 200 OK; the web server is healthy.',
      },
      {
        id: 'opt-mac-aging',
        label: 'The internal web server MAC address aged out of the switch CAM table.',
        isCorrect: false,
        feedback: 'Internal communication is working normally, proving the switch CAM table has active entries.',
      },
    ],
    repairActions: [
      {
        id: 'fix-add-port-forward',
        label: 'Add static DNAT rule: `ip nat inside source static tcp 192.168.1.80 80 203.0.113.10 80`',
        isCorrect: true,
        patch: { action: 'add-nat-forward', target: 'router-r1', value: { proto: 'tcp', extPort: 80, intIp: '192.168.1.80', intPort: 80 } },
      },
      {
        id: 'fix-reboot-server',
        label: 'Reboot the internal web server hardware',
        isCorrect: false,
        patch: { action: 'reboot-host', target: 'web-server', value: true },
      },
      {
        id: 'fix-flush-arp',
        label: 'Flush the router ARP table on all interfaces',
        isCorrect: false,
        patch: { action: 'flush-arp', target: 'router-r1', value: 'all' },
      },
    ],
  },
};

/**
 * net-08: Network Address Translation (NAT & PAT)
 * ─────────────────────────────────────────────────────────────────────────────
 * Milestone 4 — Concept C30
 * Teaches why Network Address Translation became the foundation of modern IPv4
 * networks, Inside/Outside terminology, Static NAT, Port Address Translation
 * (PAT / NAT Overload), dynamic source port rewriting, state table tracking,
 * return packet de-NATting, and the implicit security barrier against unsolicited
 * inbound connections.
 */

export const NET_08_MODULE: ModuleData = {
  id: 'net-08',
  slug: 'network-address-translation-nat-pat',
  day: 8,
  title: 'Module 8: Network Address Translation (NAT & PAT)',
  shortTitle: 'NAT & PAT',
  type: 'module',
  track: 'networking',
  milestoneId: 'net-milestone-3',
  description:
    'Discover how NAT and PAT multiplex thousands of private devices behind a single public IPv4 address, how the translation state table preserves return flows, and why NAT creates an inherent firewall boundary.',
  estimatedMinutes: 35,
  curriculumOrder: 8,
  displayLabel: 'Module 8',
  completionLearnings: [
    'NAT solves IPv4 exhaustion by translating non-routable RFC 1918 private addresses into globally unique public IP addresses',
    'Port Address Translation (PAT / NAT Overload) maps multiple private IP addresses to a single public IP by tracking unique Layer 4 source ports',
    'The NAT Translation Table maintains state bindings between (Inside Local IP:Port) and (Inside Global IP:Port)',
    'On outbound egress, the router rewrites the Source IP and Source Port; on inbound return, it reverses the mapping to the Destination IP and Port (De-NATting)',
    'Unsolicited inbound packets from the public internet are discarded by default because no matching outbound state table entry exists (implicit firewall effect)',
  ],
  concepts: [
    // ─────────────────────────────────────────────────────
    // Concept 1: Why NAT Exists & Address Terminology (C30a)
    // ─────────────────────────────────────────────────────
    {
      id: 'why-nat-and-terminology',
      order: 1,
      title: 'Why NAT Exists: Address Scarcity & Inside/Outside Terminology',
      shortDescription:
        'Understand the IPv4 exhaustion problem, RFC 1918 non-routable boundaries, and standard NAT address terms.',
      theory: {
        mentorScript: NET_08_MENTOR_SCRIPT,
        summary:
          'Because IPv4 only provides 4.3 billion addresses, the global internet ran out of unallocated address blocks. NAT enables an entire organization or home network to share one public IP. To discuss NAT accurately, network engineers use standardized Inside/Outside terminology.',
        explanation: [
          '### Beat 1: Direct Physical Reality — The IPv4 Depletion Wall',
          'The IPv4 protocol defines a 32-bit address field, yielding an absolute theoretical maximum of $2^{32} \\approx 4,294,967,296$ unique addresses.',
          'With tens of billions of smartphones, laptops, IoT gadgets, and cloud instances online today, the global pool of unallocated IPv4 addresses (managed by IANA and the Regional Internet Registries) was officially exhausted in 2011.',
          '',
          'To prevent the internet from grinding to a halt while the world transitioned toward IPv6, two critical RFC standards were deployed:',
          '1. **RFC 1918 Private Address Spaces**: Three address blocks were reserved strictly for internal private networks:',
          '   - `10.0.0.0/8` (10.0.0.0 – 10.255.255.255, 16.7 million hosts)',
          '   - `172.16.0.0/12` (172.16.0.0 – 172.31.255.255, 1.04 million hosts)',
          '   - `192.168.0.0/16` (192.168.0.0 – 192.168.255.255, 65,536 hosts)',
          '   Internet Service Providers (ISPs) configure their core BGP routers to **immediately drop** any packets carrying RFC 1918 source or destination addresses. They are non-routable on the public internet.',
          '2. **RFC 1631 / RFC 3022 Network Address Translation (NAT)**: Gateway routers at the network perimeter rewrite non-routable private addresses into globally unique public IP addresses before packets enter the internet wire.',
          '',
          '### Beat 2: The Core Mechanism — The Four NAT Address Quadrants',
          'To specify translation boundaries without confusion, the networking industry (formalized by Cisco and RFC 2663) established four standard address classifications:',
          '- **Inside Local**: The private IP address configured on an internal device within the LAN (e.g., `10.50.1.25` or `192.168.1.100`).',
          '- **Inside Global**: The public, globally routable IP address allocated to the organization by an ISP, which represents the inside device to the outside world as packets exit the gateway router WAN interface (e.g., `203.0.113.10`).',
          '- **Outside Global**: The public, globally routable IP address assigned to the destination server or service on the internet (e.g., `198.51.100.4`).',
          '- **Outside Local**: The IP address of an external host as it appears to inside network devices (in almost all standard enterprise and home deployments, this is identical to the Outside Global address).',
          '',
          '### Static NAT vs. Dynamic NAT',
          '- **Static NAT (1:1 Binding)**: A permanent, bidirectional mapping between one Inside Local IP and one Inside Global IP. Typically assigned to internal servers (mail servers, web servers) requiring a consistent public address so external users can initiate connections.',
          '- **Dynamic NAT (Address Pooling)**: Internal hosts share a pool of multiple public IPs on a first-come, first-served basis. If a company owns 10 public IPs, only 10 internal devices can concurrently communicate with the public internet.',
          '',
          '### Beat 3: Failure Modes & Workplace Diagnostics',
          'Common enterprise routing and NAT failure modes include:',
          '- **RFC 1918 Leakage & Bogon Filtering**: If a gateway router’s NAT engine is disabled or misconfigured, internal packets egress with private source IPs. Upstream ISP border routers drop these packets silently due to ingress anti-spoofing filters (BCP 38 / bogon lists).',
          '- **NAT Pool Exhaustion**: In Dynamic NAT pools without port overloading, once all public IPs are assigned to active hosts, subsequent outbound connection attempts are dropped with translation allocation failures.',
          '- **Workplace Diagnostics**: Inspect translation rules and verify interface assignments (inside vs. outside) on gateway routers.',
        ],
        keyTakeaway:
          'NAT translates private Inside Local addresses into public Inside Global addresses. Static NAT creates fixed 1:1 bindings for servers.',
        exampleQuery: '',
        exampleQueryExplanation: '',
        mcqs: [
          {
            id: 'net08-mcq-rfc1918-drop',
            question:
              'What happens if a workstation with private IP 192.168.1.50 sends a packet directly onto the public internet without passing through a NAT router?',
            options: [
              'Internet routers route the packet directly to the server, which responds to 192.168.1.50',
              'The first upstream ISP transit router drops the packet immediately because RFC 1918 private ranges are non-routable on the public internet backbone',
              'The workstation automatically converts its MAC address into a public IPv4 address',
              'The switch converts the packet to IPv6 automatically',
            ],
            correctIndex: 1,
            explanation:
              'RFC 1918 prefixes are allocated strictly for private networks. Internet service providers configure ingress ACLs and BGP filters to immediately discard RFC 1918 source and destination IPs.',
          },
          {
            id: 'net08-mcq-inside-local',
            question:
              'In official NAT terminology, what does "Inside Local" specifically designate?',
            options: [
              'The public IP address assigned to the external web server',
              'The private IP address configured on an internal host inside the local enterprise or home network',
              'The public IP address configured on the router WAN interface',
              'The loopback address of the ISP gateway',
            ],
            correctIndex: 1,
            explanation:
              'Inside Local is the IP address assigned to an internal host on the private LAN (inside network boundary).',
          },
        ],
      },
      tasks: [
        {
          id: 'net08-p1-inside-outside-terminology',
          title: 'Guided Practice: NAT Terminology & Address Classification',
          description:
            'Identify Inside Local, Inside Global, and Outside Global addresses in an enterprise NAT deployment.',
          instructions: [
            'A company laptop has IP 10.50.1.25 on the office Wi-Fi.',
            'The office gateway router has LAN IP 10.50.1.1 and WAN IP 203.0.113.10.',
            'The laptop connects to an internet server at IP 198.51.100.4.',
            'Classify each IP according to official NAT terminology.',
          ],
          type: 'guided',
          primaryTable: '',
          initialSql: '',
          solutionSql: 'NETWORKING_JUDGMENT_TASK',
          solutionExplanation:
            '10.50.1.25 is the Inside Local address (private device on LAN). 203.0.113.10 is the Inside Global address (public IP visible to outside). 198.51.100.4 is the Outside Global address.',
          hints: [
            {
              level: 1,
              text: 'Inside Local is the private address inside the network. Inside Global is the public address allocated to the gateway.',
            },
            {
              level: 2,
              text: 'The external server on the public internet is the Outside Global address.',
            },
          ],
          packetInspection: {
            title: 'NAT / PAT Translation Inspection (Inside Local ➔ Inside Global)',
            description:
              'Compare the packet before and after NAT traversal to observe how private addresses and ports are rewritten to public routable ones.',
            snapshots: [
              {
                hopLabel: 'Segment 1 (Inside LAN): Inside Local Address (10.50.1.25:52140)',
                deviceType: 'Host',
                layer2: {
                  srcMac: 'AA:BB:CC:11:22:33',
                  dstMac: '00:00:5E:00:53:01',
                  etherType: '0x0800 (IPv4)',
                  fcs: '0x22A1E4F9 (Valid)',
                },
                layer3: {
                  version: 4,
                  srcIp: '10.50.1.25',
                  dstIp: '198.51.100.4',
                  ttl: 64,
                  protocol: 'TCP (6)',
                },
                layer4: {
                  type: 'TCP',
                  srcPort: 52140,
                  dstPort: 80,
                  seqNum: 500,
                  flags: { syn: true },
                },
                layer7: {
                  protocol: 'HTTP',
                  summary: 'GET /index.html HTTP/1.1 (Host: 198.51.100.4)',
                },
              },
              {
                hopLabel: 'Segment 2 (Outside WAN): Inside Global Address (203.0.113.10:41000)',
                deviceType: 'Router',
                layer2: {
                  srcMac: '00:00:5E:00:53:02',
                  dstMac: 'CC:DD:EE:77:88:99',
                  etherType: '0x0800 (IPv4)',
                  fcs: '0x8B30C19A (Valid)',
                },
                layer3: {
                  version: 4,
                  srcIp: '203.0.113.10',
                  dstIp: '198.51.100.4',
                  ttl: 63,
                  protocol: 'TCP (6)',
                },
                layer4: {
                  type: 'TCP',
                  srcPort: 41000,
                  dstPort: 80,
                  seqNum: 500,
                  flags: { syn: true },
                },
                layer7: {
                  protocol: 'HTTP',
                  summary: 'GET /index.html HTTP/1.1 (Host: 198.51.100.4)',
                },
              },
            ],
          },
          validation: {
            judgment: [
              {
                kind: 'choose-and-defend',
                prompt:
                  'What is the Inside Local address in this scenario?',
                options: [
                  '203.0.113.10 because it is the public IP configured on the router',
                  '10.50.1.25 because it is the private IP address of the internal host on the inside LAN',
                  '198.51.100.4 because it is the destination host requested by the user',
                ],
                correctIndex: 1,
                explanation:
                  'Inside Local always refers to the private IPv4 address configured on the internal client or host within the private network boundary.',
              },
              {
                kind: 'choose-and-defend',
                prompt:
                  'When the laptop’s packets arrive at the web server (198.51.100.4), what source IP does the server see in the packet header?',
                options: [
                  '10.50.1.25 because routers never alter source IP addresses',
                  '203.0.113.10 (Inside Global) because the NAT router translated the private source IP into its public WAN IP',
                  '127.0.0.1 because loopback addresses are used for public internet routing',
                ],
                correctIndex: 1,
                explanation:
                  'Because private RFC 1918 addresses cannot be routed over the public internet, the NAT router substitutes the private source IP (10.50.1.25) with its public Inside Global IP (203.0.113.10).',
              },
            ],
          },
          successMessage:
            'Correct! 10.50.1.25 is Inside Local, and the external server receives packets showing the Inside Global IP (203.0.113.10).',
        },
      ],
    },

    // ─────────────────────────────────────────────────────
    // Concept 2: Port Address Translation / PAT (C30b)
    // ─────────────────────────────────────────────────────
    {
      id: 'port-address-translation-pat',
      order: 2,
      title: 'Port Address Translation (PAT / NAT Overload)',
      shortDescription:
        'Discover how thousands of internal devices share a single public IP by multiplexing Layer 4 source ports.',
      theory: {
        summary:
          'Static and Dynamic NAT still require one public IP per active device. Port Address Translation (PAT), also known as NAT Overload, solves this completely: it translates BOTH the IP address and the Layer 4 Source Port number, allowing up to ~65,000 concurrent connections to share a single public IP.',
        explanation: [
          '### Beat 1: Direct Physical Reality — Scaling Beyond 1:1 NAT',
          'In a standard home, coffee shop, or small enterprise, an internet service provider typically supplies exactly **one single public IPv4 address**.',
          'Yet on the internal LAN, dozens or hundreds of laptops, smartphones, smart TVs, and security cameras need simultaneous, uninterrupted access to the internet.',
          'If the gateway router used standard 1:1 NAT, only the first device online could connect; all others would be completely locked out.',
          '',
          '### Beat 2: The Core Mechanism — Multiplexing Over Layer 4 Source Ports',
          'Port Address Translation (PAT, also referred to as **NAT Overload** in Cisco IOS, or **IP Masquerading** in Linux netfilter) leverages the transport layer to overcome address scarcity.',
          '',
          'Every TCP segment and UDP datagram contains a **16-bit Source Port** and a **16-bit Destination Port** field (values 1 to 65,535). PAT exploits this 16-bit source port space to multiplex thousands of discrete internal sockets behind a single public IP:',
          '',
          '1. **Client A** (`192.168.1.10:50240`) initiates a TCP connection to Server `198.51.100.5:80`.',
          '2. **Client B** (`192.168.1.20:50240`) simultaneously initiates a connection to the exact same server `198.51.100.5:80`. Both clients randomly choose ephemeral source port `50240`.',
          '',
          '3. **Router Egress Translation** (Gateway public IP `203.0.113.1`):',
          '   - Client A’s packet arrives first. The router rewrites Source IP to `203.0.113.1`. Since port `50240` is free on `203.0.113.1`, it retains source port `50240`.',
          '   - Translation table entry: `192.168.1.10:50240` ↔ `203.0.113.1:50240` (to `198.51.100.5:80`).',
          '   - Client B’s packet arrives next. Port `50240` is already taken on the public IP! The router dynamically **allocates a different unused source port**, such as `50241`.',
          '   - Translation table entry: `192.168.1.20:50240` ↔ `203.0.113.1:50241` (to `198.51.100.5:80`).',
          '',
          '4. **The NAT Translation Table (State Table)**:',
          '   The router maintains this active state in RAM:',
          '   - `TCP  192.168.1.10:50240  203.0.113.1:50240  198.51.100.5:80`',
          '   - `TCP  192.168.1.20:50240  203.0.113.1:50241  198.51.100.5:80`',
          '',
          'When the web server responds, packets for Client A are sent to destination port `50240`, while packets for Client B are sent to destination port `50241`. The router inspects the incoming destination port, queries its state table, and de-multiplexes each return stream to the correct internal host.',
          '',
          '### Beat 3: Failure Modes & Workplace Diagnostics (Ticket #110)',
          'High-density enterprise environments experience unique PAT failure modes:',
          '- **Ephemeral Port Exhaustion**: A single public IP has roughly 64,000 usable ephemeral ports (ports 1024–65535). Heavy web crawling, microservices, or SYN flood attacks can exhaust available source ports, causing new outbound connections to time out.',
          '- **UDP Session Timeout Churn**: Unlike TCP (which has explicit FIN and RST flags to close state entries), UDP has no connection termination signaling. NAT tables must rely on inactivity timers (typically 30–120 seconds). Aggressive UDP traffic can bloat NAT state tables.',
          '- **Workplace Inspection Commands**: On Cisco enterprise routers, run `show ip nat translations` and `show ip nat statistics`. On Linux gateways, inspect `conntrack -L` or `iptables -t nat -L -v -n`.',
        ],
        keyTakeaway:
          'PAT (NAT Overload) multiplexes multiple private IPs behind a single public IP by rewriting Layer 4 source port numbers and tracking the mappings in a translation table.',
        exampleQuery: '',
        exampleQueryExplanation: '',
        mcqs: [
          {
            id: 'net08-mcq-pat-multiplex',
            question:
              'How does Port Address Translation (PAT / NAT Overload) allow thousands of private devices to browse the internet concurrently using only ONE public IP?',
            options: [
              'By encrypting all packets so the destination server cannot see the source IP',
              'By translating both the private IP and the Layer 4 Source Port, tracking unique port bindings in a state table',
              'By having devices take 1-second turns sending packets across the router WAN port',
              'By assigning each device a virtual MAC address on the ISP router',
            ],
            correctIndex: 1,
            explanation:
              'PAT uses the 16-bit Layer 4 TCP/UDP source port field to multiplex up to ~65,000 simultaneous connections behind a single public IPv4 address, logging every mapping in its state table.',
          },
          {
            id: 'net08-mcq-pat-state-table',
            question:
              'Why does the NAT translation table record the outside destination IP and port alongside the inside host IP and port?',
            options: [
              'To enable exact demultiplexing of return responses and support overlapping source ports to different destinations',
              'To charge the client billing fees for each distinct domain visited',
              'To rewrite the server\'s MAC address in the Ethernet frame',
              'To compress HTTP payloads during transit',
            ],
            correctIndex: 0,
            explanation:
              'By tracking the full connection tuple (Protocol, Inside Local, Inside Global, Outside Global), the router can reliably de-NAT return packets and multiplex multiple connections even when outside destinations differ.',
          },
        ],
      },
      tasks: [
        {
          id: 'net08-p2-pat-port-multiplexing',
          title: 'Guided Practice: PAT Port Disambiguation & Table Tracking',
          description:
            'Trace how a PAT router manages source port collisions when two clients send outbound traffic simultaneously.',
          instructions: [
            'Host 1 (192.168.1.10:49152) and Host 2 (192.168.1.20:49152) both send HTTP GET requests to Web Server 203.0.113.50:80.',
            'The gateway router performs PAT using its single public IP 198.51.100.1.',
            'Host 1’s packet is processed first; the router assigns public source port 49152.',
            'Explain how Host 2’s packet is translated and recorded.',
            'Inspect live NAT state table entries and hit counters using Cisco IOS (`show ip nat translations`) and Linux (`conntrack -L`).',
          ],
          type: 'guided',
          primaryTable: '',
          initialSql: '',
          solutionSql: 'NETWORKING_JUDGMENT_TASK',
          solutionExplanation:
            'Because port 49152 on the public IP is already occupied by Host 1, the router assigns an alternative unused port (e.g. 49153) to Host 2 and records the mapping in its NAT table.',
          hints: [
            {
              level: 1,
              text: 'The public IP can only have one active connection per unique (Protocol, Public IP, Port, Destination IP, Dest Port) tuple.',
            },
            {
              level: 2,
              text: 'PAT must alter the source port of the second host to prevent collisions when both use the same internal port.',
            },
          ],
          terminal: {
            title: 'Workplace Diagnostic Terminal — Ticket #110 (Cisco IOS & Linux conntrack)',
            description:
              'Inspect active NAT/PAT translation tables, active port bindings, translation statistics, and stateful conntrack flows.',
            availableCommands: [
              'show ip nat translations',
              'show ip nat statistics',
              'conntrack -L',
              'iptables -t nat -L -v -n',
            ],
            commandResponses: {
              'show ip nat translations': `Pro Inside global      Inside local       Outside local      Outside global
tcp 198.51.100.1:49152 192.168.1.10:49152 203.0.113.50:80    203.0.113.50:80
tcp 198.51.100.1:49153 192.168.1.20:49152 203.0.113.50:80    203.0.113.50:80
tcp 198.51.100.1:51400 192.168.1.55:51400 198.51.100.20:443  198.51.100.20:443`,
              'show ip nat statistics': `Total active translations: 3 (0 static, 3 dynamic, 3 extended)
Outside interfaces: GigabitEthernet0/0 (WAN)
Inside interfaces: GigabitEthernet0/1 (LAN)
Hits: 142089  Misses: 3
Expired translations: 1204
Dynamic mappings:
-- Inside Source
[Id: 1] access-list 101 pool OVERLOAD refcount 3
 pool OVERLOAD: netmask 255.255.255.0
       start 198.51.100.1 end 198.51.100.1
       type generic, total addresses 1, allocated 1 (100%)`,
              'conntrack -L': `tcp      6 431998 ESTABLISHED src=192.168.1.10 dst=203.0.113.50 sport=49152 dport=80 src=203.0.113.50 dst=198.51.100.1 sport=80 dport=49152 [ASSURED] mark=0 use=1
tcp      6 431995 ESTABLISHED src=192.168.1.20 dst=203.0.113.50 sport=49152 dport=80 src=203.0.113.50 dst=198.51.100.1 sport=80 dport=49153 [ASSURED] mark=0 use=1
conntrack v1.4.6 (cache: 2048 entries): 2 flow entries displayed`,
              'iptables -t nat -L -v -n': `Chain PREROUTING (policy ACCEPT 1420 packets, 85200 bytes)
 pkts bytes target     prot opt in     out     source               destination         

Chain INPUT (policy ACCEPT 0 packets, 0 bytes)
 pkts bytes target     prot opt in     out     source               destination         

Chain POSTROUTING (policy ACCEPT 0 packets, 0 bytes)
 pkts bytes target     prot opt in     out     source               destination         
 142K 9820K MASQUERADE all  --  *      eth0    192.168.1.0/24       0.0.0.0/0           

Chain OUTPUT (policy ACCEPT 0 packets, 0 bytes)
 pkts bytes target     prot opt in     out     source               destination`,
            },
          },
          validation: {
            judgment: [
              {
                kind: 'choose-and-defend',
                prompt:
                  'How does the PAT router handle Host 2’s packet when port 49152 is already assigned to Host 1?',
                options: [
                  'It drops Host 2’s packet and sends an ICMP Port Unreachable message',
                  'It allocates an alternate unused source port (e.g. 49153) on the public IP and logs the binding in the NAT table',
                  'It merges both connections into one socket so Host 1 and Host 2 share the same stream',
                ],
                correctIndex: 1,
                explanation:
                  'The core mechanism of PAT is dynamic Layer 4 port translation. When two inside hosts pick the same ephemeral port, the router translates the second host’s source port to an available number on the public IP.',
              },
              {
                kind: 'choose-and-defend',
                prompt:
                  'Why is this port rewriting essential for return traffic coming back from the Web Server?',
                options: [
                  'Because the web server needs to know the exact physical port on the internal switch where each host sits',
                  'Because without unique destination ports on the return packets, the router could not determine which internal host (192.168.1.10 vs 192.168.1.20) should receive the response',
                  'Because web servers reject requests if the client port is below 50000',
                ],
                correctIndex: 1,
                explanation:
                  'When the server replies, its destination port is the port the router sent (49152 for Host 1, 49153 for Host 2). The router inspects this destination port against its NAT table to de-NAT the packet to the correct private IP.',
              },
            ],
          },
          successMessage:
            'Correct! PAT dynamically reallocates colliding source ports so return packets can be demultiplexed to the proper internal host.',
        },
      ],
    },

    // ─────────────────────────────────────────────────────
    // Concept 3: Inbound Return Flows & Stateful Security (C30c)
    // ─────────────────────────────────────────────────────
    {
      id: 'nat-return-flows-and-security',
      order: 3,
      title: 'Return Traffic De-NATting & Inbound Drop Mechanics',
      shortDescription:
        'Trace how return packets are de-translated and why NAT drops unsolicited inbound connection attempts.',
      theory: {
        summary:
          'When an external server sends return traffic back to the router’s public IP, the router performs De-NATting by looking up the destination port in its translation table. If an unsolicited packet arrives from the internet with no matching state table entry, the router discards it because no translation mapping exists (note: this translation drop is distinct from a complete stateful firewall policy).',
        explanation: [
          '### Beat 1: Direct Physical Reality — Return Traffic Ingress',
          'When an external web server on the internet processes an HTTP or HTTPS request, it crafts a response packet destined for the gateway router’s public IP address and the translated source port allocated by the router.',
          'Upon arriving at the router WAN interface, the packet has destination `203.0.113.1:50241`. If the router simply passed this frame onto the LAN without modification, no device on the subnet would claim it because the destination IP is the router WAN IP, not the private IP of Client B.',
          '',
          '### Beat 2: The Core Mechanism — De-NATting & Inbound Drops',
          'The router executes a reverse translation state machine called **De-NATting**:',
          '1. **Header Inspection**: The router WAN interface parses the incoming Layer 3 IPv4 header (Destination IP = `203.0.113.1`) and Layer 4 TCP header (Destination Port = `50241`).',
          '2. **State Table Query**: The router searches its NAT translation table for an active entry matching `Protocol=TCP`, `Public Port=50241`.',
          '3. **Table Hit**: It finds the mapping: `192.168.1.20:50240` ↔ `203.0.113.1:50241`.',
          '4. **Header Rewrite**: The router rewrites the Destination IP to `192.168.1.20` and the Destination Port to `50240`. The Source IP remains the external server (`198.51.100.5:80`).',
          '5. **Checksum & Forward**: The router recalculates the IPv4 and TCP checksums, resolves Client B’s MAC address in its ARP cache, encapsulates the packet into an Ethernet frame, and forwards it across the LAN switch.',
          '',
          '### Why Unsolicited Inbound Traffic Is Dropped',
          'Now consider what happens when an internet port scanner, crawler, or malicious actor transmits an unsolicited packet targeting `203.0.113.1:22` (SSH) or `203.0.113.1:3389` (RDP):',
          '1. The packet hits the router WAN interface.',
          '2. The router queries the NAT state table for `Public Port=22` or `3389`.',
          '3. **No matching entry exists!** Because no internal host initiated an outbound connection on that port, there is no corresponding Inside Local IP in memory.',
          '4. The router cannot route or translate the packet. **The packet is silently dropped**.',
          '',
          '### Port Forwarding (Destination NAT / DNAT)',
          'To permit external internet users to intentionally access an internal server (such as an on-premises web server at `192.168.1.200:80`):',
          '- An administrator configures a **Port Forwarding (DNAT)** rule.',
          '- This creates a permanent, static table entry: `Public IP:80 ➔ 192.168.1.200:80`.',
          '- When inbound traffic arrives on public port 80, the router immediately translates the destination IP to `192.168.1.200` without requiring prior outbound session state.',
          '',
          '### Beat 3: Failure Modes & Workplace Diagnostics',
          'Important architectural nuances every network engineer must understand:',
          '- **NAT Is NOT a Stateful Firewall**: While dynamic PAT drops unsolicited inbound traffic due to absence of translation state, NAT was designed strictly as an address conservation protocol (RFC 3022). It lacks stateful connection inspection (NIST SP 800-41), protocol sanity checking, deep packet inspection, egress domain filtering, and rule-based logging.',
          '- **Asymmetric Routing Blackholes**: If outbound traffic leaves through Gateway Router 1 (which logs the NAT state), but return traffic enters via Gateway Router 2, Router 2 has no translation state and drops the returning packets immediately.',
          '- **Port Forwarding Port Collisions**: Two different internal servers cannot share the same external public port. Hosting two internal web servers requires separate public ports (e.g. 80 and 8080) or a Layer 7 Reverse Proxy (Nginx, Traefik, HAProxy).',
        ],
        keyTakeaway:
          'Return traffic is de-NATted by looking up the incoming destination port in the translation table. Unsolicited inbound traffic is dropped because no state table entry exists. NAT translates addresses; stateful firewalls enforce security policy.',
        exampleQuery: '',
        exampleQueryExplanation: '',
        mcqs: [
          {
            id: 'net08-mcq-unsolicited-drop',
            question:
              'Why does a standard dynamic NAT/PAT router drop unsolicited inbound connection attempts from the internet?',
            options: [
              'Because an AI antivirus scanner detects malicious intent in all inbound packets',
              'Because no matching entry exists in the translation table, so the router has no internal private IP to forward the packet to',
              'Because RFC 1918 forbids public routers from receiving TCP SYN packets',
              'Because the router WAN interface disables Ethernet frames from internet IPs',
            ],
            correctIndex: 1,
            explanation:
              'Dynamic NAT tables only populate when an inside host initiates an outbound connection. An unsolicited inbound packet matches zero table entries, leaving the router with no internal destination address, resulting in an immediate drop.',
          },
          {
            id: 'net08-mcq-port-forwarding',
            question:
              'If an organization wishes to host an internal web server (192.168.1.200:80) behind a single public IP router, what configuration is required?',
            options: [
              'Static Port Forwarding (Destination NAT) mapping Public IP port 80 to 192.168.1.200:80',
              'Disabling the router firewall and enabling broadcast forwarding on all ports',
              'Setting the server IP to 0.0.0.0/0',
              'Changing the server subnet mask to 255.255.255.255',
            ],
            correctIndex: 0,
            explanation:
              'Port Forwarding (DNAT) establishes a permanent static mapping in the NAT table so that unsolicited inbound traffic arriving on public port 80 is translated and forwarded to internal private server 192.168.1.200:80.',
          },
        ],
      },
      tasks: [
        {
          id: 'net08-p3-state-table-return-flow',
          title: 'Independent Practice: Return Flow & Unsolicited Drop Analysis',
          description:
            'Trace the header transformation on a returning web response and diagnose an unsolicited inbound packet.',
          instructions: [
            'A home computer (192.168.1.100) established a TCP session to 198.51.100.20:443 through NAT gateway 203.0.113.1.',
            'The NAT table contains: TCP 192.168.1.100:54321 <-> 203.0.113.1:61000 <-> 198.51.100.20:443.',
            'Packet 1: Web server replies to 203.0.113.1:61000.',
            'Packet 2: An external scanner sends a probe to 203.0.113.1:3389 (Remote Desktop).',
            'Predict the router’s handling of Packet 1 and Packet 2.',
          ],
          type: 'guided',
          primaryTable: '',
          initialSql: '',
          solutionSql: 'NETWORKING_JUDGMENT_TASK',
          solutionExplanation:
            'Packet 1 matches the state table: Destination rewritten to 192.168.1.100:54321 and delivered. Packet 2 has no matching table entry and is dropped.',
          hints: [
            {
              level: 1,
              text: 'Check Packet 1’s destination port (61000) against the NAT table entry.',
            },
            {
              level: 2,
              text: 'Check if port 3389 exists in the NAT table. If not, the router has nowhere to forward it.',
            },
          ],
          validation: {
            judgment: [
              {
                kind: 'choose-and-defend',
                prompt:
                  'What does the router do when Packet 1 (destination 203.0.113.1:61000) arrives from the web server?',
                options: [
                  'It floods the packet to all devices on the LAN switch because it does not know the MAC address',
                  'It looks up port 61000 in the NAT table, rewrites Destination IP:Port to 192.168.1.100:54321, and forwards to the LAN',
                  'It rejects the packet because the web server’s source IP does not match the router’s WAN IP',
                ],
                correctIndex: 1,
                explanation:
                  'The router matches destination port 61000 against its active NAT state table, finds the binding for 192.168.1.100:54321, rewrites the destination headers, and forwards the packet to the client.',
              },
              {
                kind: 'choose-and-defend',
                prompt:
                  'What happens to Packet 2 (destination 203.0.113.1:3389) from the external internet scanner?',
                options: [
                  'It is automatically forwarded to the first device on the network (192.168.1.100)',
                  'The router drops the packet because port 3389 has no matching entry in the NAT translation table',
                  'The router stores the packet in a buffer and asks all LAN hosts if any want to accept RDP',
                ],
                correctIndex: 1,
                explanation:
                  'Because no internal host initiated a session on port 3389, no translation entry exists in the table. The router cannot determine where to deliver the packet, so it drops it. This provides basic inbound perimeter security.',
              },
            ],
          },
          successMessage:
            'Correct! Packet 1 is de-NATted via the state table, while unsolicited Packet 2 is dropped due to absence of a translation mapping.',
        },
      ],
    },
  ],

  challenge: {
    id: 'net08-challenge',
    title: 'Module 8 Challenge: NAT Table Forensics & Port Forwarding',
    scenario:
      'Reconstruct state table records from raw packet captures and diagnose port forwarding requirements for hosted services.',
    tasks: [
      {
        id: 'net08-ch1-pat-table-reconstruction',
        title: 'Challenge 1: Reconstructing NAT Translation Table Entries',
        description:
          'Inspect outbound packet transformations and reconstruct the exact NAT state record.',
        instructions: [
          'Packet captured on LAN (before router):',
          'Source: 10.0.0.15:52000 | Destination: 93.184.216.34:443',
          'Packet captured on WAN (after router):',
          'Source: 198.51.100.2:63400 | Destination: 93.184.216.34:443',
          'Identify the exact NAT state table record created by the router.',
        ],
        type: 'challenge',
        primaryTable: '',
        initialSql: '',
        solutionSql: 'NETWORKING_JUDGMENT_TASK',
        solutionExplanation:
          'Inside Local: 10.0.0.15:52000, Inside Global: 198.51.100.2:63400, Outside Global: 93.184.216.34:443.',
        hints: [
          {
            level: 1,
            text: 'Inside Local is the private client IP:Port. Inside Global is the translated public IP:Port.',
          },
          {
            level: 2,
            text: 'Notice the source port was translated from 52000 to 63400.',
          },
        ],
        validation: {
          judgment: [
            {
              kind: 'choose-and-defend',
              prompt:
                'Which row correctly represents the state table entry created for this connection?',
              options: [
                'Inside Local: 10.0.0.15:52000 <-> Inside Global: 198.51.100.2:63400 <-> Outside Global: 93.184.216.34:443',
                'Inside Local: 198.51.100.2:63400 <-> Inside Global: 10.0.0.15:52000 <-> Outside Global: 93.184.216.34:443',
                'Inside Local: 10.0.0.15:443 <-> Inside Global: 198.51.100.2:443 <-> Outside Global: 93.184.216.34:52000',
              ],
              correctIndex: 0,
              explanation:
                'Inside Local is the private host address (10.0.0.15:52000), Inside Global is the router’s public translated address (198.51.100.2:63400), and Outside Global is the external server (93.184.216.34:443).',
            },
          ],
        },
        successMessage:
          'Correct! You reconstructed the complete NAT table mapping from ingress and egress packet headers.',
      },
      {
        id: 'net08-ch2-unsolicited-inbound-diagnosis',
        title: 'Challenge 2: Inbound Web Hosting & Port Forwarding Diagnosis',
        description:
          'Diagnose why an external user cannot reach an internal web server and determine the required configuration.',
        instructions: [
          'A developer sets up a web server at 192.168.1.200 listening on port 80.',
          'The router has public IP 203.0.113.5 and performs standard PAT for outbound traffic.',
          'A friend on the internet tries to visit http://203.0.113.5 in their browser, but the connection times out.',
          'Explain why the connection failed and identify the standard solution.',
        ],
        type: 'challenge',
        primaryTable: '',
        initialSql: '',
        solutionSql: 'NETWORKING_JUDGMENT_TASK',
        solutionExplanation:
          'Unsolicited inbound connection attempts have no matching entry in the dynamic NAT table and are dropped. The solution is Port Forwarding (Static Destination NAT) mapping 203.0.113.5:80 -> 192.168.1.200:80.',
        hints: [
          {
            level: 1,
            text: 'Dynamic PAT only creates entries when an internal device initiates outbound traffic.',
          },
          {
            level: 2,
            text: 'To allow external users to initiate inbound connections to an internal IP, a permanent static translation rule is required.',
          },
        ],
        validation: {
          judgment: [
            {
              kind: 'choose-and-defend',
              prompt:
                'Why did the connection attempt to http://203.0.113.5 fail, and how is it resolved?',
                options: [
                  'Web traffic must use UDP; the solution is changing the web server to HTTP/3 over UDP port 80',
                  'The router has no dynamic state table entry for unsolicited inbound port 80 traffic and drops it; the solution is configuring a static Port Forwarding (Destination NAT) rule directing 203.0.113.5:80 to 192.168.1.200:80',
                  'The web server has a private IP address and private IPs are forbidden by RFC 791 from generating HTTP response headers',
                ],
              correctIndex: 1,
              explanation:
                'Because dynamic PAT only logs mappings initiated from the inside out, unsolicited inbound traffic to public port 80 matches no table entry and is dropped. A static Port Forwarding rule permanently maps public port 80 to internal IP 192.168.1.200:80.',
            },
          ],
        },
        successMessage:
          'Superb! You correctly identified the inherent inbound drop behavior of dynamic NAT and the requirement for static Port Forwarding.',
      },
    ],
  },
};
