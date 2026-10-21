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
          '### Beat 1: The Physical Dilemma — The "Leaving the Building" Dilemma',
          'Suppose Host A (`192.168.1.10/24`) wants to send an HTTP request or ping to Google DNS (`8.8.8.8`).',
          'Before sending, the host checks its subnet mask:',
          '- `8.8.8.8 AND 255.255.255.0 = 8.8.8.0`',
          '- `192.168.1.10 AND 255.255.255.0 = 192.168.1.0`',
          '- Result: **Different network prefixes**. Destination is **remote (off-link)**.',
          '',
          'Now the physical dilemma strikes: Host A cannot send an ARP request asking *"Who has 8.8.8.8?"* because ARP broadcasts (`FF:FF:FF:FF:FF:FF`) are strictly confined to the local switch! If no Default Gateway is configured, the operating system drops the packet immediately before it even touches the network cable (`Network is unreachable`).',
          '',
          '### Beat 2: The Tool\'s Purpose — The Gateway as the Physical Door & The Golden Rule',
          'To leave the building, the host must hand the parcel to an intermediary device that physically connects to both the inside room and the outside street: the **Default Gateway** (router).',
          '',
          'The router has at least two network interface cards:',
          '1. **Inside LAN Interface** (e.g. `192.168.1.1`): Resides on the local subnet and listens to local Ethernet broadcasts.',
          '2. **Outside WAN Interface** (e.g. `198.51.100.1`): Resides on the upstream provider or Internet link.',
          '',
          '**The Golden Rule of Internetworking**:',
          '| Segment | Source MAC | Destination MAC | Source IP | Destination IP |',
          '|---|---|---|---|---|',
          '| **Hop 1: Host A → R1 (LAN)** | Host A MAC | R1 LAN MAC | 192.168.1.10 | 198.51.100.50 |',
          '| **Hop 2: R1 → Server Z (WAN)** | R1 WAN MAC | Server Z MAC | 192.168.1.10 | 198.51.100.50 |',
          '',
          '- **Layer 3 IPs Stay Constant**: The Source and Destination IP addresses represent the true endpoints. They remain preserved end-to-end across all hops.',
          '- **Layer 2 MACs Change at Every Hop**: Layer 2 frames only survive a single physical cable segment. At every router boundary, the old MAC header is stripped and discarded, and a brand-new MAC header is stamped for the next immediate physical receiver.',
          '',
          '### Beat 3: The Observable Result — Ticket #108 Gateway Route Verification',
          'When a computer loses its default gateway route, terminal telemetry displays:',
          '```',
          'PING 8.8.8.8: Destination host unreachable (or PING: transmit failed. General failure.)',
          '```',
          'Inspecting the routing table via Windows `route print` or Linux `ip route show default` proves whether the `0.0.0.0/0` default gateway route is present.',
        ],
        keyTakeaway:
          'Layer 3 IP addresses are preserved end-to-end; Layer 2 MAC addresses are stripped and rewritten at every router boundary. Without a local default gateway, off-link transmission fails.',
        exampleQuery: '',
        exampleQueryExplanation: '',
        mcqs: [
          {
            id: 'net07-mcq-gateway-role',
            question:
              'Why does a host need a Default Gateway configured to communicate with an IP address on another subnet?',
            options: [
              'Because Layer 2 switches reject frames if the gateway IP is not stamped in the Ethernet trailer',
              'Because ARP broadcasts cannot cross router boundaries; the host must address the Layer 2 frame to its local gateway router to forward traffic beyond the subnet',
              'Because default gateways assign temporary MAC addresses to public packets',
            ],
            correctIndex: 1,
            explanation:
              'Switches only forward within a broadcast domain. To reach a remote subnet, the host must send the packet to the local MAC address of its default gateway router, which routes it across network boundaries.',
          },
          {
            id: 'net07-mcq-golden-rule',
            question:
              'According to the Golden Rule of Routing, how do packet headers change when a router forwards an IP packet across an egress interface?',
            options: [
              'The Source and Destination IP addresses are rewritten; the MAC addresses remain unchanged',
              'Layer 2 MAC addresses are rewritten for the next link; Layer 3 IP addresses remain constant end-to-end',
              'Both MAC addresses and IP addresses are completely replaced at every hop',
            ],
            correctIndex: 1,
            explanation:
              'In standard routing, Layer 3 IP addresses identify the original sender and final destination and remain preserved. Layer 2 MAC addresses only have meaning on a local link and are rewritten at every hop.',
          },
        ],
      },
      tasks: [
        {
          id: 'net07-p1-remote-gateway-arp',
          title: 'Ticket #108 Workplace Lab: Default Gateway Route Restoration',
          description:
            'Trace how Layer 2 and Layer 3 headers are populated when communicating across a gateway and restore default routing across dual-OS environments.',
          instructions: [
            'Host A (IP: 192.168.1.10/24, MAC: AA:AA:AA:AA:AA:AA, Gateway: 192.168.1.1) wants to send an HTTP request to Server Z (IP: 198.51.100.50/24, MAC: ZZ:ZZ:ZZ:ZZ:ZZ:ZZ).',
            'Router R1 has LAN interface IP 192.168.1.1 (MAC: R1:LAN:R1:LAN) and WAN interface IP 198.51.100.1 (MAC: R1:WAN:R1:WAN).',
            'Inspect workstation routing tables using dual Windows (`route print`) and Linux (`ip route show default`) commands.',
            'Determine which MAC address Host A puts on the wire and verify header invariance.',
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
          terminal: {
            title: 'Workplace Diagnostic Terminal — Ticket #108 (Dual OS)',
            description:
              'Diagnose missing default gateway and inspect routing tables on Windows and Linux workstations.',
            availableCommands: [
              'route print',
              'ipconfig',
              'ip route show default',
              'ip route show',
              'ping 192.168.1.1',
            ],
            commandResponses: {
              'route print': `===========================================================================
Interface List
 12...00 1a 2b 3c 4d 10 ......Intel(R) Ethernet Connection
===========================================================================
IPv4 Route Table
===========================================================================
Active Routes:
Network Destination        Netmask          Gateway       Interface  Metric
          0.0.0.0          0.0.0.0      192.168.1.1     192.168.1.10      25
        127.0.0.0        255.0.0.0         On-link         127.0.0.1     331
      192.168.1.0    255.255.255.0         On-link      192.168.1.10     281
     192.168.1.10  255.255.255.255         On-link      192.168.1.10     281
    192.168.1.255  255.255.255.255         On-link      192.168.1.10     281
        224.0.0.0        240.0.0.0         On-link         127.0.0.1     331
  255.255.255.255  255.255.255.255         On-link      192.168.1.10     281
===========================================================================`,
              'ipconfig': `Windows IP Configuration

Ethernet adapter Ethernet0:
   Connection-specific DNS Suffix  . : corp.acme.com
   IPv4 Address. . . . . . . . . . . : 192.168.1.10
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . . . : 192.168.1.1`,
              'ip route show default': `default via 192.168.1.1 dev eth0 proto dhcp metric 100`,
              'ip route show': `default via 192.168.1.1 dev eth0 proto dhcp metric 100
192.168.1.0/24 dev eth0 proto kernel scope link src 192.168.1.10 metric 100`,
              'ping 192.168.1.1': `Pinging 192.168.1.1 with 32 bytes of data:
Reply from 192.168.1.1: bytes=32 time<1ms TTL=64
Reply from 192.168.1.1: bytes=32 time<1ms TTL=64

Ping statistics for 192.168.1.1:
    Packets: Sent = 2, Received = 2, Lost = 0 (0% loss)`,
            },
          },
          packetInspection: {
            title: 'Cross-Hop Header Inspection (Host A ➔ Router R1 ➔ Server Z)',
            description:
              'Inspect both hops to observe end-to-end IP invariance, hop-by-hop MAC rewrites, and TTL decrement.',
            snapshots: [
              {
                hopLabel: 'Hop 1: Host A ➔ Router R1 (LAN Link)',
                deviceType: 'Host',
                layer2: {
                  srcMac: 'AA:AA:AA:AA:AA:AA',
                  dstMac: '00:00:5E:00:53:01',
                  etherType: '0x0800 (IPv4)',
                  fcs: '0x5C89F1A0 (Valid)',
                },
                layer3: {
                  version: 4,
                  srcIp: '192.168.1.10',
                  dstIp: '198.51.100.50',
                  ttl: 64,
                  protocol: 'TCP (6)',
                },
                layer4: {
                  type: 'TCP',
                  srcPort: 49152,
                  dstPort: 80,
                  seqNum: 100,
                  flags: { syn: true },
                },
                layer7: {
                  protocol: 'HTTP',
                  summary: 'GET /index.html HTTP/1.1 (Host: 198.51.100.50)',
                },
              },
              {
                hopLabel: 'Hop 2: Router R1 ➔ Server Z (WAN Link)',
                deviceType: 'Router',
                layer2: {
                  srcMac: '00:00:5E:00:53:02',
                  dstMac: 'ZZ:ZZ:ZZ:ZZ:ZZ:ZZ',
                  etherType: '0x0800 (IPv4)',
                  fcs: '0x99A410ED (Valid)',
                },
                layer3: {
                  version: 4,
                  srcIp: '192.168.1.10',
                  dstIp: '198.51.100.50',
                  ttl: 63,
                  protocol: 'TCP (6)',
                },
                layer4: {
                  type: 'TCP',
                  srcPort: 49152,
                  dstPort: 80,
                  seqNum: 100,
                  flags: { syn: true },
                },
                layer7: {
                  protocol: 'HTTP',
                  summary: 'GET /index.html HTTP/1.1 (Host: 198.51.100.50)',
                },
              },
            ],
          },
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
          'Routers maintain a routing table (FIB) in memory mapping network prefixes to next-hop IPs or egress interfaces. When a packet matches multiple prefix entries, the router strictly picks the route with the longest prefix mask length (Longest Prefix Match). If no specific route matches, it falls back to the default route (0.0.0.0/0).',
        explanation: [
          '### Beat 1: Direct Physical Reality — Forwarding Information Base (FIB)',
          'Inside enterprise routers and core internet switches, routing decisions occur millions of times per second in high-speed hardware memory called **Ternary Content-Addressable Memory (TCAM)** or the kernel **Forwarding Information Base (FIB)**.',
          '',
          'Unlike a Layer 2 switch CAM table (which maps flat 48-bit MAC addresses to single physical switchports), a Layer 3 routing table contains hierarchical prefix entries:',
          '- **Destination Network Prefix & Mask**: The IP network boundary (e.g., `10.0.0.0/8`, `172.20.0.0/16`, `172.20.5.0/24`).',
          '- **Next-Hop IP Address**: The Layer 3 address of the adjacent router interface on the shared link that will handle forwarding toward the destination.',
          '- **Egress Interface**: The physical or logical interface through which the packet must physically exit the router chassis (e.g., `eth0`, `GigabitEthernet0/1`).',
          '- **Metric & Administrative Distance**: Priority weights used by dynamic routing protocols (OSPF, BGP) to select the best path into the FIB.',
          '',
          '### Beat 2: The Core Mechanism — The Longest Prefix Match (LPM) Rule',
          'Because modern IPv4 networks use Classless Inter-Domain Routing (CIDR), network address blocks are routinely subnetted into smaller, overlapping segments.',
          '',
          'Consider a core router whose FIB contains the following four routes:',
          '1. `10.0.0.0/8` via `Interface A` (covers `10.0.0.0` – `10.255.255.255`, 8 fixed prefix bits)',
          '2. `10.20.0.0/16` via `Interface B` (covers `10.20.0.0` – `10.20.255.255`, 16 fixed prefix bits)',
          '3. `10.20.30.0/24` via `Interface C` (covers `10.20.30.0` – `10.20.30.255`, 24 fixed prefix bits)',
          '4. `0.0.0.0/0` via `Interface D` (Default Route / Gateway of Last Resort, 0 fixed prefix bits)',
          '',
          'When an incoming packet arrives with destination IP **`10.20.30.50`**:',
          '- Binary bitwise comparison matches Route 1 (/8 = 8 matching prefix bits).',
          '- Binary bitwise comparison matches Route 2 (/16 = 16 matching prefix bits).',
          '- Binary bitwise comparison matches Route 3 (/24 = 24 matching prefix bits).',
          '- Binary bitwise comparison matches Route 4 (/0 = 0 matching prefix bits).',
          '',
          '**The Golden Rule of LPM**: The router ALWAYS selects the route with the **longest prefix length (most specific subnet mask)**. Here, **`10.20.30.0/24` via Interface C** wins because 24 matching bits is strictly more specific than 16, 8, or 0 bits. Routing table line order or entry insertion time is completely ignored.',
          '',
          '### The Gateway of Last Resort (`0.0.0.0/0`)',
          'The prefix `0.0.0.0` with subnet mask `0.0.0.0` (CIDR `/0`) requires 0 bits to match. Therefore, **every valid IPv4 address matches `0.0.0.0/0`**.',
          'Because its prefix length is 0 (the shortest possible), it will only be selected if **no more specific route** matches the destination IP. If a router has no default route and receives a packet with no matching prefix, it must discard the packet and transmit an **ICMP Destination Net Unreachable** (Type 3, Code 0) back to the sender.',
          '',
          '### Beat 3: Failure Modes & Workplace Diagnostics',
          'In production environments, route flapping, route aggregation errors, and unintended summary routes cause traffic blackholing:',
          '- **Blackholing (Null0 Route)**: If a destination prefix points to `Null0` or `discard`, the router quietly drops matching packets without generating ICMP replies.',
          '- **Order-of-Operation Confusion**: Technicians often assume the first route listed in a config file executes first. In reality, LPM compiles into a radix tree or hardware TCAM where mask length alone determines precedence.',
          '- **Workplace Verification**: Use `route print` on Windows or `ip route show` on Linux to inspect active routes, prefix masks, interface metrics, and gateway IPs.',
        ],
        keyTakeaway:
          'Longest Prefix Match (LPM) ensures the most specific prefix entry in the routing table always wins. The default route (0.0.0.0/0) is the fallback when no specific entry matches.',
        exampleQuery: '',
        exampleQueryExplanation: '',
        mcqs: [
          {
            id: 'net07-mcq-lpm-rule',
            question:
              'A router FIB has routes for 172.16.0.0/12, 172.16.10.0/24, and 0.0.0.0/0. A packet arrives for 172.16.10.25. Which route is chosen?',
            options: [
              '172.16.0.0/12 because it has the largest address block coverage',
              '172.16.10.0/24 because it has the longest matching prefix length (/24 > /12 > /0)',
              '0.0.0.0/0 because the default route always overrides static routes',
              'The router loads balances equally across all three routes',
            ],
            correctIndex: 1,
            explanation:
              'Under Longest Prefix Match (LPM), routers pick the most specific route (longest mask length). /24 has 24 matching bits, which beats /12 and /0.',
          },
          {
            id: 'net07-mcq-default-route',
            question:
              'What happens if a packet arrives for destination 198.51.100.8 and the router has no matching specific prefix and no 0.0.0.0/0 route?',
            options: [
              'The router floods the packet out all physical ports like a switch',
              'The router discards the packet and returns an ICMP Destination Net Unreachable (Type 3, Code 0) to the sender',
              'The router broadcasts an ARP request across the entire WAN link',
              'The router stores the packet in a permanent retry buffer indefinitely',
            ],
            correctIndex: 1,
            explanation:
              'Without a matching specific route or a default route (0.0.0.0/0), a router cannot forward the packet. RFC 792 dictates it drops the packet and sends an ICMP Destination Unreachable message back to the source.',
          },
        ],
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
          '### Beat 1: Direct Physical Reality — The Threat of Endless Routing Loops',
          'Suppose Router A has a misconfigured route directing traffic for `192.168.50.0/24` to Router B, while Router B has a route directing `192.168.50.0/24` back to Router A.',
          '',
          'In Ethernet switching (Layer 2), there is no hop counter or TTL field in the 802.3 frame header — an unmitigated switching loop circulates forever at wire speed, saturating multi-gigabit fiber backbones and crashing switch processors within seconds.',
          '',
          'In Internet Protocol (Layer 3), packets must traverse complex, multi-vendor global meshes. To prevent loops from permanently consuming router memory buffers and link bandwidth, RFC 791 defines an **8-bit Time-to-Live (TTL)** field (integer value 0–255) in every IPv4 packet header.',
          '',
          '### Beat 2: The Core Mechanism — Hop Decrement & ICMP Time Exceeded',
          'The TTL lifecycle follows a strict protocol state machine:',
          '1. **Initial TTL Value**: The originating host sets an initial TTL value in its IP stack (commonly **64** on Linux/macOS/iOS, **128** on Microsoft Windows, or **255** on network equipment and Cisco IOS).',
          '2. **Transit Decrement**: Whenever an intermediate Layer 3 router receives a packet, before writing it to an outbound interface buffer, the router **decrements TTL by exactly 1** (`TTL = TTL - 1`).',
          '3. **Checksum Recalculation**: Because the TTL field changed, the router recalculates the 16-bit **IPv4 Header Checksum** field.',
          '4. **Forward or Discard**: ',
          '   - **If `TTL > 0`**: The router looks up the next hop in its FIB, rewrites the Layer 2 Ethernet frame, and forwards the packet.',
          '   - **If `TTL == 0`**: The router **IMMEDIATELY DISCARDS THE PACKET**. The packet is permanently dead.',
          '',
          '### How Traceroute Dissects Internetwork Paths',
          'When a router discards an expired packet (`TTL == 0`), RFC 792 mandates that it notify the sender by generating an **ICMP Time Exceeded** message (**Type 11, Code 0**) addressed back to the original source IP.',
          '',
          'The diagnostic tools **`tracert` (Windows)** and **`traceroute` (Linux/UNIX)** exploit this behavior systematically:',
          '- **Probe 1 (TTL = 1)**: Transmits a probe with TTL=1. Router 1 decrements TTL to 0, drops the probe, and replies with ICMP Time Exceeded. The sender logs Router 1’s IP address and round-trip time (RTT).',
          '- **Probe 2 (TTL = 2)**: Transmits with TTL=2. Router 1 decrements to 1 and forwards; Router 2 decrements to 0, drops the packet, and replies. Hop 2 discovered!',
          '- **Incremental Sequence**: The client increments TTL sequentially (1, 2, 3, 4...) until the packet reaches the target server, which replies with an ICMP Echo Reply (Windows) or UDP/TCP port unreachable (Linux).',
          '',
          '### Beat 3: Failure Modes & Workplace Diagnostics (Ticket #109)',
          'When troubleshooting path latency or unreachable services in production:',
          '- **`Time to live exceeded in transit`**: If `ping` returns this error repeatedly from the same pair of router IPs, a circular routing loop is actively bouncing the packet until TTL reaches zero.',
          '- **Asterisk Output (`* * * Request timed out`)**: Indicates a transit router has disabled ICMP generation (RFC 1812 rate limiting), drops ICMP probes in its control plane (CoPP), or a stateful firewall blocked the probe.',
          '- **Diagnostic Commands**: On Windows, run `tracert -d <target>` (`-d` suppresses slow DNS reverse lookups). On Linux, run `traceroute -n <target>` (`-n` prevents DNS latency).',
        ],
        keyTakeaway:
          'TTL decrements by 1 at every transit router hop. If it reaches 0, the packet is dropped and an ICMP Time Exceeded (Type 11) is returned, preventing endless loops and enabling traceroute.',
        exampleQuery: '',
        exampleQueryExplanation: '',
        mcqs: [
          {
            id: 'net07-mcq-ttl-loop',
            question:
              'Why does Layer 3 (IP) have an 8-bit TTL field while standard Layer 2 (Ethernet) has no hop limit?',
            options: [
              'Because Ethernet switches are fast enough to handle infinite loops without crashing',
              'Ethernet relied on Spanning Tree Protocol (STP) to break loops physically, whereas IP is an unconstrained global mesh requiring per-packet hop expiration to prevent link saturation',
              'Because MAC addresses change every second so loops terminate automatically',
              'Because IPv4 packets are encrypted and cannot be retransmitted',
            ],
            correctIndex: 1,
            explanation:
              'Layer 2 frames have no TTL and will loop endlessly unless STP disables redundant ports. Layer 3 packets traverse complex multi-path meshes where transient routing loops would consume all bandwidth without a decremented hop counter.',
          },
          {
            id: 'net07-mcq-traceroute-icmp',
            question:
              'When running traceroute to discover Hop 3 on a path, what initial TTL does the utility set on the probe packet, and what ICMP response is received?',
            options: [
              'Initial TTL = 3; receives ICMP Time Exceeded (Type 11, Code 0) from the third router',
              'Initial TTL = 128; receives ICMP Echo Reply from the third router',
              'Initial TTL = 0; receives ICMP Redirect (Type 5) from the gateway',
              'Initial TTL = 255; receives ICMP Port Unreachable from the default gateway',
            ],
            correctIndex: 0,
            explanation:
              'Traceroute sets TTL = 3. Routers 1 and 2 decrement to 2 and 1; Router 3 decrements to 0, discards the packet, and sends back ICMP Time Exceeded (Type 11, Code 0) revealing its IP address.',
          },
        ],
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
            'Inspect path discovery commands on Windows (`tracert -d`) and Linux (`traceroute -n`) using the workplace diagnostic terminal.',
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
          terminal: {
            title: 'Workplace Diagnostic Terminal — Ticket #109 (Dual OS)',
            description:
              'Diagnose routing loops, inspect hop-by-hop latency, and probe path TTL expiration using Windows tracert and Linux traceroute.',
            availableCommands: [
              'tracert -d 8.8.8.8',
              'ping -i 1 8.8.8.8',
              'traceroute -n 8.8.8.8',
              'ping -c 2 -t 1 8.8.8.8',
              'ip route get 8.8.8.8',
            ],
            commandResponses: {
              'tracert -d 8.8.8.8': `Tracing route to 8.8.8.8 over a maximum of 30 hops

  1    <1 ms    <1 ms    <1 ms  192.168.1.1
  2     4 ms     3 ms     3 ms  10.240.0.1
  3    12 ms    11 ms    11 ms  198.51.100.254
  4    15 ms    14 ms    14 ms  8.8.8.8

Trace complete.`,
              'ping -i 1 8.8.8.8': `Pinging 8.8.8.8 with 32 bytes of data:
Reply from 192.168.1.1: TTL expired in transit.
Reply from 192.168.1.1: TTL expired in transit.

Ping statistics for 8.8.8.8:
    Packets: Sent = 2, Received = 2, Lost = 0 (0% loss)`,
              'traceroute -n 8.8.8.8': `traceroute to 8.8.8.8 (8.8.8.8), 30 hops max, 60 byte packets
 1  192.168.1.1  0.428 ms  0.395 ms  0.370 ms
 2  10.240.0.1  3.125 ms  3.080 ms  3.045 ms
 3  198.51.100.254  11.450 ms  11.380 ms  11.310 ms
 4  8.8.8.8  14.820 ms  14.750 ms  14.690 ms`,
              'ping -c 2 -t 1 8.8.8.8': `PING 8.8.8.8 (8.8.8.8) 56(84) bytes of data.
From 192.168.1.1 icmp_seq=1 Time to live exceeded
From 192.168.1.1 icmp_seq=2 Time to live exceeded

--- 8.8.8.8 ping statistics ---
2 packets transmitted, 0 received, +2 errors, 100% packet loss, time 1002ms`,
              'ip route get 8.8.8.8': `8.8.8.8 via 192.168.1.1 dev eth0 src 192.168.1.10 uid 1000
    cache`,
            },
          },
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
