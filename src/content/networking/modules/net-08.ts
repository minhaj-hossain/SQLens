import { ModuleData } from '../../../types/curriculum';

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
        summary:
          'Because IPv4 only provides 4.3 billion addresses, the global internet ran out of unallocated address blocks. NAT enables an entire organization or home network to share one public IP. To discuss NAT accurately, network engineers use standardized Inside/Outside terminology.',
        explanation: [
          '### The IPv4 Exhaustion Crisis',
          'With over 15 billion connected devices worldwide today, IPv4’s 32-bit address space ($2^{32} \\approx 4.29$ billion) is vastly insufficient for every device to have a unique public address.',
          '',
          'In 1994, the IETF introduced two complementary technologies as a temporary bridge to IPv6:',
          '1. **RFC 1918 Private Addressing**: Dedicated three address blocks (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`) for internal use. Internet service providers (ISPs) drop these prefixes by default.',
          '2. **RFC 1631 / RFC 3022 Network Address Translation (NAT)**: A gateway router translates private source IPs into a public, routable IP before forwarding packets to the internet.',
          '',
          '### Standard NAT Terminology',
          'The networking industry (formalized by Cisco and IETF) defines four address quadrants:',
          '- **Inside Local**: The private IP address assigned to an internal host on the private LAN (e.g. `192.168.1.50`).',
          '- **Inside Global**: The public IP address representing the internal host to the outside world as traffic exits the router WAN interface (e.g. `203.0.113.1`).',
          '- **Outside Global**: The public IP address assigned to the external destination host on the internet (e.g. `198.51.100.80`).',
          '- **Outside Local**: The IP address of an outside host as known to the inside network (almost always identical to Outside Global in standard NAT).',
          '',
          '### Static NAT vs Dynamic NAT',
          '- **Static NAT (1:1)**: A permanent, one-to-one mapping between one Inside Local IP and one Inside Global IP. Typically used when an internal server (like an email or web server) needs a fixed public IP address so outside clients can connect directly.',
          '- **Dynamic NAT (Pool)**: Internal hosts share a pool of multiple public IPs on a first-come, first-served basis. If the pool has 5 public IPs, only 5 hosts can access the internet simultaneously.',
        ],
        keyTakeaway:
          'NAT translates private Inside Local addresses into public Inside Global addresses. Static NAT creates fixed 1:1 bindings for servers.',
        exampleQuery: '',
        exampleQueryExplanation: '',
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
          '### The Limitation of Pure NAT',
          'If a home or branch office has 50 phones, laptops, and smart TVs, but the ISP only assigns **one single public IPv4 address**, standard Dynamic NAT cannot help — only 1 device could browse at a time!',
          '',
          '### How PAT / NAT Overload Works',
          'Every TCP and UDP transmission includes a **16-bit Source Port** and **Destination Port** (range: 1–65535). PAT takes advantage of this Layer 4 field:',
          '',
          '1. **Client A** (`192.168.1.10:50240`) connects to `198.51.100.5:80`.',
          '2. **Client B** (`192.168.1.20:50240`) also connects to `198.51.100.5:80`.',
          'Notice that both internal clients happen to pick the same ephemeral port (`50240`).',
          '',
          '3. When Client A’s packet reaches the PAT router (public IP `203.0.113.1`):',
          '   - Router rewrites Source IP to `203.0.113.1`.',
          '   - Router preserves Source Port `50240` (since it is available).',
          '   - State entry logged: `192.168.1.10:50240` ↔ `203.0.113.1:50240`.',
          '',
          '4. When Client B’s packet arrives:',
          '   - Port `50240` is already in use by Client A on the public IP!',
          '   - The PAT router dynamically **rewrites Client B’s Source Port** to an unused port, e.g. `50241`.',
          '   - State entry logged: `192.168.1.20:50240` ↔ `203.0.113.1:50241`.',
          '',
          '### The NAT Translation Table State',
          '',
          '| Protocol | Inside Local | Inside Global | Outside Global |',
          '|---|---|---|---|',
          '| TCP | 192.168.1.10:50240 | 203.0.113.1:50240 | 198.51.100.5:80 |',
          '| TCP | 192.168.1.20:50240 | 203.0.113.1:50241 | 198.51.100.5:80 |',
          '',
          'Because the external server receives two different source ports (`50240` and `50241`), its return packets will carry different destination ports, enabling the PAT router to return each packet to the exact right client.',
        ],
        keyTakeaway:
          'PAT (NAT Overload) multiplexes multiple private IPs behind a single public IP by rewriting Layer 4 source port numbers and tracking the mappings in a translation table.',
        exampleQuery: '',
        exampleQueryExplanation: '',
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
      title: 'Return Traffic De-NATting & Implicit Perimeter Security',
      shortDescription:
        'Trace how return packets are de-translated and why NAT drops unsolicited inbound connection attempts.',
      theory: {
        summary:
          'When an external server sends return traffic back to the router’s public IP, the router performs De-NATting by looking up the destination port in its translation table. If an unsolicited packet arrives from the internet with no matching state table entry, the router discards it, providing an implicit firewall boundary.',
        explanation: [
          '### The Return Flow: De-NATting',
          'When the external server responds to an outbound request:',
          '1. The server transmits an IP packet with:',
          '   - Source: `Server IP:80`',
          '   - Destination: `Router Public IP:50241`',
          '2. The router’s WAN interface receives the packet and queries its **NAT state table**:',
          '   - Does an active entry exist for `Protocol=TCP`, `Public Port=50241`?',
          '   - **Yes**: Found `192.168.1.20:50240`.',
          '3. **De-NAT Translation**: The router rewrites the Destination IP and Port:',
          '   - New Destination: `192.168.1.20:50240`',
          '   - Source remains `Server IP:80`',
          '4. The router forwards the frame onto the LAN switch toward Client B.',
          '',
          '### Why Unsolicited Inbound Traffic Fails (Implicit Firewall)',
          'Suppose an external hacker on the internet attempts to connect to `Router Public IP:22` (SSH) or `Router Public IP:80` (HTTP) without the inside host having initiated any communication:',
          '1. The packet arrives at the router’s WAN interface with destination `203.0.113.1:22`.',
          '2. The router inspects its NAT translation table for `Public Port=22`.',
          '3. **No matching entry exists!** (No inside host initiated a session expecting traffic on port 22).',
          '4. The router has no destination private IP to rewrite the packet to. The packet is **silently discarded**.',
          '',
          'This unidirectional behavior is why consumer home routers act as basic stateful firewalls: internal devices can initiate connections outward freely, but external devices cannot initiate connections inward unless **Port Forwarding (Destination NAT)** is explicitly configured.',
        ],
        keyTakeaway:
          'Return traffic is de-NATted by looking up the incoming destination port in the translation table. Unsolicited inbound traffic is dropped because no state table entry exists.',
        exampleQuery: '',
        exampleQueryExplanation: '',
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
