import { ModuleData } from '../../../types/curriculum';

/**
 * net-07: Default Gateways & Internetwork Routing
 * ─────────────────────────────────────────────────────────────────────────────
 * Milestone 4 — Concepts C25, C26, C27, C28, C29
 * Teaches how computers send traffic beyond local broadcast domains via default
 * gateways, the Golden Rule of Layer 2 hop-by-hop MAC rewrites vs Layer 3
 * end-to-end IP preservation, router routing table architecture, Longest Prefix
 * Match (LPM), default route 0.0.0.0/0, and IPv4 TTL loop mitigation.
 */

export const NET_07_MODULE: ModuleData = {
  id: 'net-07',
  slug: 'default-gateways-and-internetwork-routing',
  day: 7,
  title: 'Module 7: Default Gateways & Internetwork Routing',
  shortTitle: 'Gateways & Routing',
  type: 'module',
  track: 'networking',
  milestoneId: 'net-milestone-3',
  description:
    'Master how packets travel across multiple network boundaries: resolving gateway MACs, hop-by-hop link-layer rewrites, routing table lookup via Longest Prefix Match, and TTL loop mitigation.',
  estimatedMinutes: 35,
  curriculumOrder: 7,
  displayLabel: 'Module 7',
  completionLearnings: [
    'When destination IP is remote (different subnet), the sender must address the Layer 2 frame to its Default Gateway MAC',
    'Golden Rule of Routing: Layer 2 MAC addresses are rewritten at every router hop, while Layer 3 IP addresses remain preserved end-to-end',
    'Routers consult their routing table and select the best match using Longest Prefix Match (LPM) — the route with the most specific prefix length',
    'The default route (0.0.0.0/0) acts as the gateway of last resort when no specific prefix matches',
    'Every router decrements the IPv4 Time-to-Live (TTL) header by 1; if TTL reaches 0, the packet is discarded and an ICMP Time Exceeded (Type 11) is returned',
  ],
  concepts: [
    // ─────────────────────────────────────────────────────
    // Concept 1: Default Gateways & Hop-by-Hop MAC Rewriting (C25 + C26)
    // ─────────────────────────────────────────────────────
    {
      id: 'default-gateways-and-mac-rewriting',
      order: 1,
      title: 'Default Gateways & The Golden Rule of MAC Rewriting',
      shortDescription:
        'Understand why remote traffic must be directed to the gateway MAC and how MAC headers rewrite while IP headers stay constant.',
      theory: {
        summary:
          'When sending to an IP outside the local subnet, the host cannot ARP for the remote IP directly. Instead, it sends the frame to its Default Gateway (the local router interface). Across each router hop, the source and destination MACs are rewritten, but the source and destination IPs remain preserved from end to end.',
        explanation: [
          '### C25: The Local vs Remote Decision & Default Gateway',
          'Before sending any packet, a host compares the destination IP against its own subnet mask:',
          '- **Local Destination**: If `(Dest IP & Mask) == (Host IP & Mask)`, destination is on the local link. The host ARPs for the destination IP directly.',
          '- **Remote Destination**: If `(Dest IP & Mask) != (Host IP & Mask)`, destination is on a remote network. The host cannot send directly to the remote device because Layer 2 broadcast domains do not span routers.',
          '',
          'To reach a remote destination, the host sends the packet to its **Default Gateway** (the local interface of its first-hop router):',
          '1. The host looks up the Default Gateway IP configured on its interface (e.g. `192.168.1.1`).',
          '2. The host checks its ARP cache for `192.168.1.1` (or transmits an ARP Request if absent).',
          '3. The host encapsulates the IP packet inside an Ethernet frame with the **Gateway’s MAC** as the destination MAC.',
          '',
          '### C26: The Golden Rule of Internetworking',
          'Consider Host A (`192.168.1.10`) communicating with Web Server B (`203.0.113.80`) across Router R1:',
          '',
          '| Segment | Source MAC | Destination MAC | Source IP | Destination IP |',
          '|---|---|---|---|---|',
          '| **Host A → R1 (LAN)** | Host A MAC | R1 LAN MAC | 192.168.1.10 | 203.0.113.80 |',
          '| **R1 → Server B (WAN)** | R1 WAN MAC | Server B MAC | 192.168.1.10 | 203.0.113.80 |',
          '',
          '**Key Principles**:',
          '- **End-to-End Invariance**: Source IP and Destination IP **NEVER change** across hops (in standard routing without NAT). They represent the true sender and ultimate recipient.',
          '- **Hop-by-Hop Ephemerality**: Layer 2 MAC addresses **change at every single hop**. The destination MAC always identifies the next immediate physical receiver on the current link.',
        ],
        keyTakeaway:
          'Layer 3 IP addresses are preserved end-to-end; Layer 2 MAC addresses are stripped and rewritten at every router boundary.',
        exampleQuery: '',
        exampleQueryExplanation: '',
      },
      tasks: [
        {
          id: 'net07-p1-remote-gateway-arp',
          title: 'Guided Practice: Remote Delivery & Header Invariance',
          description:
            'Trace how Layer 2 and Layer 3 headers are populated when communicating with a remote server across a gateway.',
          instructions: [
            'Host A (IP: 192.168.1.10/24, MAC: AA:AA:AA:AA:AA:AA, Gateway: 192.168.1.1) wants to send an HTTP request to Server Z (IP: 198.51.100.50/24, MAC: ZZ:ZZ:ZZ:ZZ:ZZ:ZZ).',
            'Router R1 has LAN interface IP 192.168.1.1 (MAC: R1:LAN:R1:LAN) and WAN interface IP 198.51.100.1 (MAC: R1:WAN:R1:WAN).',
            'Determine which MAC address Host A puts on the wire and which headers change when Router R1 forwards the packet.',
          ],
          type: 'guided',
          primaryTable: '',
          initialSql: '',
          solutionSql: 'NETWORKING_JUDGMENT_TASK',
          solutionExplanation:
            'Host A sends to the Default Gateway MAC (R1 LAN interface). Across Router R1, MAC headers are rewritten (R1:WAN -> Server Z), while IPs remain 192.168.1.10 -> 198.51.100.50.',
          hints: [
            {
              level: 1,
              text: 'Host A and Server Z are in different subnets (/24). Host A cannot ARP for Server Z directly across a router.',
            },
            {
              level: 2,
              text: 'The destination MAC on the first hop must be the Default Gateway. IP addresses do not change in standard routing.',
            },
          ],
          validation: {
            judgment: [
              {
                kind: 'choose-and-defend',
                prompt:
                  'What destination MAC address does Host A place in the Ethernet frame sent from its network card?',
                options: [
                  'Server Z MAC (ZZ:ZZ:ZZ:ZZ:ZZ:ZZ) because Server Z is the ultimate recipient of the packet',
                  'Gateway R1 LAN MAC (R1:LAN:R1:LAN) because Server Z is remote and must be forwarded by the router',
                  'Broadcast MAC (FF:FF:FF:FF:FF:FF) because the host does not know how many routers exist in between',
                ],
                correctIndex: 1,
                explanation:
                  'When the destination IP is outside the local subnet, the sender encapsulates the packet with its Default Gateway’s MAC address. Switches cannot forward frames across subnets without a router.',
              },
              {
                kind: 'choose-and-defend',
                prompt:
                  'When Router R1 forwards the packet out its WAN interface toward Server Z, what happens to the IP and MAC addresses?',
                options: [
                  'Both IP addresses and MAC addresses are rewritten to match Router R1 WAN interface details',
                  'IP addresses remain 192.168.1.10 → 198.51.100.50; MAC addresses rewrite to R1 WAN MAC → Server Z MAC',
                  'MAC addresses remain Host A → Server Z; IP addresses rewrite to R1 WAN IP → Server Z IP',
                ],
                correctIndex: 1,
                explanation:
                  'The Golden Rule of Routing dictates that Layer 3 IP headers remain unchanged end-to-end, while Layer 2 MAC addresses are stripped and rewritten for each new physical link.',
              },
            ],
          },
          successMessage:
            'Correct! Host A frames to the gateway MAC, and Router R1 rewrites the MAC header while preserving the end-to-end IP addresses.',
        },
      ],
    },

    // ─────────────────────────────────────────────────────
    // Concept 2: Router Forwarding & Longest Prefix Match (C27 + C28)
    // ─────────────────────────────────────────────────────
    {
      id: 'routing-tables-and-lpm',
      order: 2,
      title: 'Router Forwarding & Longest Prefix Match (LPM)',
      shortDescription:
        'Learn how routers inspect destination IPs against their routing table and select the most specific route.',
      theory: {
        summary:
          'Routers maintain a routing table that maps network prefixes to next-hop IPs or egress interfaces. When a packet matches multiple prefix entries, the router strictly picks the route with the longest prefix mask length (Longest Prefix Match). If no specific route matches, it falls back to the default route (0.0.0.0/0).',
        explanation: [
          '### C27: Anatomy of a Router Routing Table',
          'Unlike a Layer 2 switch CAM table (which maps flat MACs to ports), a Layer 3 routing table contains hierarchical prefix entries:',
          '- **Destination Network Prefix**: The network range (e.g. `10.0.0.0/8`, `192.168.1.0/24`).',
          '- **Next-Hop IP**: The IP address of the adjacent router interface that can forward toward the destination.',
          '- **Egress Interface**: The physical or logical interface through which the packet must depart (e.g. `eth0`, `GigabitEthernet0/1`).',
          '- **Metric / Administrative Distance**: Cost and priority values used to compare competing route sources.',
          '',
          '### C28: Longest Prefix Match (LPM) Rule',
          'In modern CIDR routing, address blocks are often subdivided. Consider a router with these routes:',
          '1. `10.0.0.0/8` via `Interface A` (covers 10.0.0.0 – 10.255.255.255)',
          '2. `10.20.0.0/16` via `Interface B` (covers 10.20.0.0 – 10.20.255.255)',
          '3. `10.20.30.0/24` via `Interface C` (covers 10.20.30.0 – 10.20.30.255)',
          '4. `0.0.0.0/0` via `Interface D` (Default Route / Gateway of Last Resort)',
          '',
          'When a packet arrives for `10.20.30.50`:',
          '- It matches route 1 (/8 = 8 matching bits)',
          '- It matches route 2 (/16 = 16 matching bits)',
          '- It matches route 3 (/24 = 24 matching bits)',
          '- It matches route 4 (/0 = 0 matching bits)',
          '',
          '**Decision**: The router selects **`10.20.30.0/24` via Interface C** because `/24` has the longest (most specific) network mask. More specific routes always override broader ones.',
          '',
          '### The Default Route (0.0.0.0/0)',
          'A mask of `/0` matches zero required bits, which means it technically matches *every possible IPv4 address*. Because it has the shortest possible prefix length (0 bits), it will only be used if NO other specific entry in the table matches.',
        ],
        keyTakeaway:
          'Longest Prefix Match (LPM) ensures the most specific prefix entry in the routing table always wins. The default route (0.0.0.0/0) is the fallback when no specific entry matches.',
        exampleQuery: '',
        exampleQueryExplanation: '',
      },
      tasks: [
        {
          id: 'net07-p2-longest-prefix-match',
          title: 'Guided Practice: Longest Prefix Match Evaluation',
          description:
            'Determine the winning routing table entry for destination IPs matching overlapping prefix ranges.',
          instructions: [
            'A core router has four routes in its Forwarding Information Base (FIB):',
            'Route 1: 172.16.0.0/12 via Interface eth0',
            'Route 2: 172.20.0.0/16 via Interface eth1',
            'Route 3: 172.20.5.0/24 via Interface eth2',
            'Route 4: 0.0.0.0/0 via Interface eth3 (Default Route)',
            'Evaluate where the router forwards packets destined for 172.20.5.99 and 8.8.8.8.',
          ],
          type: 'guided',
          primaryTable: '',
          initialSql: '',
          solutionSql: 'NETWORKING_JUDGMENT_TASK',
          solutionExplanation:
            '172.20.5.99 matches Route 1 (/12), Route 2 (/16), Route 3 (/24), and Route 4 (/0). By LPM, Route 3 (/24 on eth2) wins. 8.8.8.8 only matches Route 4 (/0 on eth3).',
          hints: [
            {
              level: 1,
              text: 'Compare the prefix lengths: /24 has 24 matching bits, which is longer and more specific than /16 or /12.',
            },
            {
              level: 2,
              text: 'When an address matches no private or company prefix, only 0.0.0.0/0 matches.',
            },
          ],
          validation: {
            judgment: [
              {
                kind: 'choose-and-defend',
                prompt:
                  'A packet arrives with destination IP 172.20.5.99. Through which interface does the router forward it?',
                options: [
                  'Interface eth0 because 172.16.0.0/12 is listed first in the routing table',
                  'Interface eth2 because 172.20.5.0/24 is the Longest Prefix Match (most specific mask /24)',
                  'Interface eth3 because /0 is the default route and takes priority over subnetted routes',
                ],
                correctIndex: 1,
                explanation:
                  'Under the Longest Prefix Match rule, the router selects the entry with the longest prefix length. /24 (24 bits) is more specific than /16 (16 bits) and /12 (12 bits). Table order does not dictate route selection.',
              },
              {
                kind: 'choose-and-defend',
                prompt:
                  'A second packet arrives destined for 8.8.8.8. How does the router process this destination?',
                options: [
                  'The router discards the packet immediately because 8.8.8.8 does not start with 172.x',
                  'The router forwards it through Interface eth3 because the default route 0.0.0.0/0 matches all destinations when no specific route exists',
                  'The router broadcasts an ARP Request on all interfaces searching for 8.8.8.8',
                ],
                correctIndex: 1,
                explanation:
                  'The default route 0.0.0.0/0 acts as the gateway of last resort. When no specific network entry matches the destination IP, the router forwards the packet to the next hop specified by the default route.',
              },
            ],
          },
          successMessage:
            'Correct! 172.20.5.99 selects the /24 route via eth2 by LPM, and 8.8.8.8 falls back to the default route on eth3.',
        },
      ],
    },

    // ─────────────────────────────────────────────────────
    // Concept 3: IPv4 Header TTL & Loop Mitigation (C29)
    // ─────────────────────────────────────────────────────
    {
      id: 'ttl-and-loop-mitigation',
      order: 3,
      title: 'IPv4 TTL Hop Limit & Loop Mitigation',
      shortDescription:
        'Understand how the 8-bit Time-to-Live field prevents infinite loops and enables path diagnostics like traceroute.',
      theory: {
        summary:
          'If two routers have misconfigured, circular routing entries, packets could bounce back and forth indefinitely. The IPv4 Time-to-Live (TTL) field mitigates this: every router decrements TTL by 1 before forwarding. When TTL hits 0, the packet is discarded and an ICMP Time Exceeded message is returned to the sender.',
        explanation: [
          '### C29: The Problem of Routing Loops',
          'Suppose Router A has a route sending `192.168.50.0/24` to Router B, but Router B’s routing table has a typo sending `192.168.50.0/24` back to Router A.',
          '',
          'In Ethernet switching (Layer 2), there is no TTL in the frame header — a switching loop circulates forever at wire speed until a link fails or equipment crashes.',
          '',
          'In Internet Protocol (Layer 3), the IPv4 header includes an **8-bit Time-to-Live (TTL)** field (0–255) specifically designed to prevent persistent loops:',
          '1. The originating sender sets an initial TTL (commonly 64 on Linux/macOS, 128 on Windows, or 255 on network gear).',
          '2. When an IP packet arrives at a transit router, the router decrements the TTL by 1 (`TTL = TTL - 1`).',
          '3. **If `TTL > 0`**: The router recalculates the IPv4 header checksum and forwards the packet toward the next hop.',
          '4. **If `TTL == 0`**: The router **DISCARDS the packet** immediately. It does not forward it.',
          '',
          '### ICMP Time Exceeded & Traceroute Mechanics',
          'When a router discards an expired packet (TTL = 0), RFC 792 mandates that it notify the sender by transmitting an **ICMP Time Exceeded** message (Type 11, Code 0) back to the packet’s Source IP.',
          '',
          'The diagnostic tool `traceroute` (or `tracert` on Windows) exploits this mechanism deliberately:',
          '- Probes with **`TTL = 1`**: The first router decrements TTL to 0, drops the packet, and returns an ICMP Time Exceeded containing its own IP address. Hop 1 identified!',
          '- Probes with **`TTL = 2`**: Router 1 decrements to 1; Router 2 decrements to 0 and replies. Hop 2 identified!',
          '- The probe TTL increments until the ultimate destination is reached (which replies with an ICMP Echo Reply or TCP/UDP response).',
        ],
        keyTakeaway:
          'TTL decrements by 1 at every transit router hop. If it reaches 0, the packet is dropped and an ICMP Time Exceeded (Type 11) is returned, preventing endless loops and enabling traceroute.',
        exampleQuery: '',
        exampleQueryExplanation: '',
      },
      tasks: [
        {
          id: 'net07-p3-ttl-loop-mitigation',
          title: 'Independent Practice: TTL Decrement & Traceroute Analysis',
          description:
            'Predict how transit routers modify the TTL field and evaluate how traceroute discovers hop IPs.',
          instructions: [
            'A Windows client (default initial TTL = 128) sends a packet across 4 routers (R1, R2, R3, R4) to reach a cloud server.',
            'Calculate the TTL value of the packet as it arrives at each transit hop and when it reaches the server.',
            'Explain what occurs if a routing loop exists between R2 and R3.',
          ],
          type: 'guided',
          primaryTable: '',
          initialSql: '',
          solutionSql: 'NETWORKING_JUDGMENT_TASK',
          solutionExplanation:
            'Each router decrements TTL by 1. After passing 4 routers (R1, R2, R3, R4), TTL decreases from 128 to 124 at the server. In a loop, TTL decrements to 0, packet is dropped, and ICMP Type 11 is returned.',
          hints: [
            {
              level: 1,
              text: 'Every Layer 3 router decrements the TTL by exactly 1 before forwarding out an interface. Switches (Layer 2) do not touch TTL.',
            },
            {
              level: 2,
              text: 'If a packet enters a loop, TTL will decrement by 1 each time it visits a router until it hits 0.',
            },
          ],
          validation: {
            judgment: [
              {
                kind: 'choose-and-defend',
                prompt:
                  'A Windows client transmits a packet with initial TTL 128. If the packet traverses routers R1, R2, R3, and R4, what is the TTL when it arrives at the server?',
                options: [
                  'TTL = 128 because TTL is only decremented if the packet encounters an error or congestion',
                  'TTL = 124 because each of the 4 routers decrements the TTL by 1 prior to egress forwarding',
                  'TTL = 0 because 4 hops exceeds the maximum permitted hop count for private IP ranges',
                ],
                correctIndex: 1,
                explanation:
                  'Every intermediate router decrements the IPv4 TTL field by exactly 1. After 4 router hops, 128 - 4 = 124.',
              },
              {
                kind: 'choose-and-defend',
                prompt:
                  'Suppose R2 and R3 have a mutual loop misconfiguration. What prevents the packet from circulating between them forever?',
                options: [
                  'The switch spanning tree protocol shuts down the physical link between the routers',
                  'The TTL decrements by 1 on each bounce; once it reaches 0, the router discards it and returns an ICMP Time Exceeded message',
                  'The router inspects the payload and drops duplicate HTTP requests automatically',
                ],
                correctIndex: 1,
                explanation:
                  'The TTL field is the fundamental loop-mitigation mechanism of the Internet Protocol. Each loop traversal decrements the TTL until it reaches 0, at which point the packet is discarded and an ICMP Time Exceeded (Type 11) is sent.',
              },
            ],
          },
          successMessage:
            'Correct! The TTL decrements by 1 at every router hop (124 at destination), and TTL exhaustion to 0 drops looping packets with ICMP Time Exceeded.',
        },
      ],
    },
  ],

  challenge: {
    id: 'net07-challenge',
    title: 'Module 7 Challenge: Multi-Hop Routing & Header Forensics',
    scenario:
      'Analyze complete packet header transformations across a multi-hop internetwork topology and solve complex Longest Prefix Match forwarding decisions.',
    tasks: [
      {
        id: 'net07-ch1-multihop-packet-trace',
        title: 'Challenge 1: Multi-Hop Packet Trace (Host to Server)',
        description:
          'Determine exact Layer 2 and Layer 3 header values across a 2-router path.',
        instructions: [
          'Topology: Host A (10.0.1.50, MAC: AA:AA:AA:AA:AA:AA) -> Router 1 -> Router 2 -> Server B (172.16.80.200, MAC: BB:BB:BB:BB:BB:BB).',
          'Link 1: Host A connects to R1 LAN (10.0.1.1, MAC: 11:11:11:11:11:11).',
          'Link 2: R1 WAN (192.168.100.1, MAC: 12:12:12:12:12:12) connects to R2 WAN (192.168.100.2, MAC: 21:21:21:21:21:21).',
          'Link 3: R2 LAN (172.16.80.1, MAC: 22:22:22:22:22:22) connects to Server B.',
          'Identify what the Ethernet frame looks like on Link 2 (between R1 and R2).',
        ],
        type: 'challenge',
        primaryTable: '',
        initialSql: '',
        solutionSql: 'NETWORKING_JUDGMENT_TASK',
        solutionExplanation:
          'On Link 2 between R1 and R2: Source MAC is R1 WAN (12:12...), Destination MAC is R2 WAN (21:21...), Source IP remains Host A (10.0.1.50), Destination IP remains Server B (172.16.80.200).',
        hints: [
          {
            level: 1,
            text: 'On Link 2, the transmitting interface is R1 WAN, and the receiving interface is R2 WAN.',
          },
          {
            level: 2,
            text: 'IP addresses do not change as the packet moves across routers in standard routing.',
          },
        ],
        validation: {
          judgment: [
            {
              kind: 'choose-and-defend',
              prompt:
                'On Link 2 (between Router 1 and Router 2), what are the Source/Destination MAC and IP addresses of the transmitted frame?',
              options: [
                'Src MAC: AA:AA:AA:AA:AA:AA, Dst MAC: BB:BB:BB:BB:BB:BB | Src IP: 10.0.1.50, Dst IP: 172.16.80.200',
                'Src MAC: 12:12:12:12:12:12, Dst MAC: 21:21:21:21:21:21 | Src IP: 10.0.1.50, Dst IP: 172.16.80.200',
                'Src MAC: 12:12:12:12:12:12, Dst MAC: 21:21:21:21:21:21 | Src IP: 192.168.100.1, Dst IP: 192.168.100.2',
              ],
              correctIndex: 1,
              explanation:
                'On transit Link 2, the Layer 2 header has been rewritten to reflect the link’s sender (R1 WAN MAC: 12:12...) and next hop (R2 WAN MAC: 21:21...). The Layer 3 IPs remain the original source (10.0.1.50) and final destination (172.16.80.200).',
            },
          ],
        },
        successMessage:
          'Excellent! You correctly identified that MAC headers rewrite on Link 2 while end-to-end IP addresses stay intact.',
      },
      {
        id: 'net07-ch2-lpm-routing-decision',
        title: 'Challenge 2: Enterprise Routing Table LPM Decision',
        description:
          'Select the correct next hop for complex overlapping subnets.',
        instructions: [
          'An enterprise edge router has the following active routes in its routing table:',
          '- 10.0.0.0/8 via Next Hop 192.168.0.1',
          '- 10.150.0.0/16 via Next Hop 192.168.0.2',
          '- 10.150.64.0/20 via Next Hop 192.168.0.3',
          '- 10.150.64.0/24 via Next Hop 192.168.0.4',
          '- 0.0.0.0/0 via Next Hop 192.168.0.254',
          'Evaluate which next hop is selected for packets addressed to 10.150.70.15 and 10.150.64.1.',
        ],
        type: 'challenge',
        primaryTable: '',
        initialSql: '',
        solutionSql: 'NETWORKING_JUDGMENT_TASK',
        solutionExplanation:
          '10.150.70.15 falls within 10.150.64.0/20 (covers 10.150.64.0 - 10.150.79.255) but not the /24, so it routes via 192.168.0.3. 10.150.64.1 matches the /24 and routes via 192.168.0.4.',
        hints: [
          {
            level: 1,
            text: 'A /20 subnet has a block size of 16 in the third octet (64 to 79). A /24 has a block size of 1 (64 only).',
          },
          {
            level: 2,
            text: 'Check if 10.150.70.15 is inside the /24 (10.150.64.0–10.150.64.255). It is not! It is inside the /20.',
          },
        ],
        validation: {
          judgment: [
            {
              kind: 'choose-and-defend',
              prompt:
                'Where does the router forward a packet addressed to destination 10.150.70.15?',
              options: [
                'Next Hop 192.168.0.4 because the /24 route is the longest prefix in the table',
                'Next Hop 192.168.0.3 because 10.150.70.15 is inside the 10.150.64.0/20 block (64–79) and /20 is the longest matching prefix for this IP',
                'Next Hop 192.168.0.2 because /16 covers all 10.150.x.x addresses and takes precedence over sub-blocks',
              ],
              correctIndex: 1,
              explanation:
                '10.150.70.15 is NOT inside 10.150.64.0/24 (which only spans 10.150.64.0 to 10.150.64.255). It IS inside 10.150.64.0/20 (which spans 10.150.64.0 to 10.150.79.255). Therefore, the /20 route via 192.168.0.3 is the longest matching prefix.',
            },
          ],
        },
        successMessage:
          'Outstanding! You correctly calculated CIDR block boundaries and applied Longest Prefix Match to route traffic.',
      },
    ],
  },
};
