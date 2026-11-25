import { NetworkingModule } from '@/types/networking';

export const NET_20_MODULE: NetworkingModule = {
  id: 'net-20',
  dayNumber: 20,
  title: 'Day 20 · Why Dynamic Routing',
  shortTitle: 'Why Dynamic Routing',
  steps: [
    {
      group: 'Idea 1 of 4 · Static route scaling limits',
      chg: 'Since Day 19: We completed Stage 5 (Transport Layer: TCP & UDP). Now in Stage 6, we return to Layer 3 routers—last seen in Days 5–6—to solve a critical scaling problem with static routes.',
      title: 'Why manual static routes break down as networks grow',
      what:
        'In Days 5 and 6, you connected two or three routers by typing static routes manually into each router\'s Routing Information Base (RIB), the table a router consults to choose a next-hop IP.\n\nStatic routes work well for 2 routers and 3 subnets. In a real enterprise or ISP backbone, manual configuration collapses under basic math:\n\n• O(R × S) Configuration Burden: With R routers and S remote subnets, engineers must maintain roughly R × S static route entries across the fleet.\n• Single-Change Ripple Effect: Adding one new subnet (for example, 10.20.0.0/24 behind Router R4) requires logging into R1, R2, and R3 to add forward routes—and updating R4 with return routes to every existing prefix.\n• Human Error Risk: One typo in a subnet mask or next-hop IP creates asymmetric routing or silent packet drops that are slow to diagnose.\n\nDynamic routing protocols solve this by having routers exchange reachability advertisements automatically, computing their own RIB entries and installing them into the kernel Forwarding Information Base (FIB).\n\nLet’s inspect Router R1\'s current static routing table to see the manual entries required just to reach a few subnets.',
      why: 'Establishes the operational and mathematical motivation for automated routing protocols before introducing protocol mechanics.',
      pic: 'Multi-router mesh (R1, R2, R3, R4) inside AS 64512 showing manual static route entries proliferating across every router.',
      task: 'Inspect Router R1\'s static routing table using ip route show.',
      cmd: 'ip route show',
      read: [
        ['RIB vs FIB', 'RIB holds learned routes; FIB is the active forwarding table'],
        ['Static Scaling', 'O(R × S) manual entries required as routers and subnets grow'],
        ['Operational Risk', 'Every new subnet forces manual edits on every upstream router'],
        ['Dynamic Solution', 'Routers advertise prefixes and compute routes automatically'],
      ],
      rem: 'Static routes scale poorly at O(R × S) manual entries; dynamic routing automates prefix distribution across every router.',
    },
    {
      group: 'Idea 2 of 4 · Link failures & blackholing',
      chg: 'Manual configuration is slow to scale, but an even bigger danger appears when a physical cable or router port fails in the middle of a multi-hop path.',
      title: 'Static blackholing vs. dynamic failure detection',
      what:
        'Suppose Router R1 has a static route sending 10.20.0.0/24 traffic to Router R2 (upper path), while Router R3 (lower path) is a backup router.\n\nNow imagine the physical fiber cable between R2 and R4 fails (interface enters DOWN / NO-CARRIER state):\n\n• Why Static Routes Fail Silently: R1\'s local interface to R2 is still UP! Because R1 only monitors its own directly connected ports, R1 has no idea that the R2–R4 link died.\n• Blackhole Forwarding: R1 keeps forwarding 10.20.0.0/24 packets to R2, and R2 drops them into a blackhole—even though R1 → R3 → R4 is completely healthy.\n• Manual Recovery Lag: Traffic stays broken until a human engineer notices an alert, logs into R1, deletes the dead static route, and adds a route via R3.\n\nHow Dynamic Routing Recovers Automatically:\n• Neighbors exchange periodic Hello / Keepalive packets over each active link.\n• When R2 loses the link to R4, R2 immediately floods a route withdrawal update to R1.\n• R1 removes the dead path via R2 and installs the alternate path via R3 within seconds.\n\nLet’s trace the path toward 10.20.0.10 while the R2–R4 link is down to observe static blackholing in action.',
      why: 'Demonstrates why static routes cannot react to remote link failures and introduces Hello/Keepalive failure detection.',
      pic: 'Redundant diamond topology (R1 → R2/R3 → R4) with the R2–R4 link marked DOWN (NO-CARRIER), showing static packets blackholed at R2 while R3\'s backup path sits unused.',
      task: 'Trace the packet path toward 10.20.0.10 to observe the blackhole at R2 using traceroute 10.20.0.10.',
      cmd: 'traceroute 10.20.0.10',
      read: [
        ['Static Blind Spot', 'R1 cannot detect link failures beyond its own local ports'],
        ['Blackhole Loss', 'Packets enter R2 and are dropped despite healthy backup R3'],
        ['Dynamic Detection', 'Hello / Keepalive timers detect dead peers automatically'],
        ['Self-Healing', 'Routers withdraw failed routes and reconverge onto backup paths'],
      ],
      rem: 'Static routes forward packets into blackholes when remote links fail; dynamic protocols use Hello timers to reroute around failures automatically.',
    },
    {
      group: 'Idea 3 of 4 · Autonomous Systems (AS)',
      chg: 'Dynamic routing lets routers share topology updates automatically. But the global internet has over 100,000 networks—every router on Earth cannot share internal link updates with every other router.',
      title: 'Partitioning the internet into Autonomous Systems (AS)',
      what:
        'If every router on the internet exchanged detailed link-state updates with every other router, routing tables and CPU load would overwhelm every device on the planet.\n\nTo solve this, the internet is divided into independent administrative domains called Autonomous Systems (AS) (defined in RFC 1930 and RFC 6793):\n\n• What an AS Is: A collection of IP prefixes and routers operated by a single organization (such as an enterprise, university, or ISP) under one unified routing policy.\n• Autonomous System Number (ASN): Each AS is identified by a unique 16-bit or 32-bit number (for example, AS15169 for Google, AS13335 for Cloudflare, or private ASNs 64512–65534 for internal labs).\n• Information Hiding: Routers inside AS 64512 share full internal link details with each other, but they hide that internal topology from AS 64513 (the upstream ISP)—advertising only summary IP prefixes across the border.\n\nBorder routers that sit at the edge between two Autonomous Systems are called Autonomous System Boundary Routers (ASBRs)—like Router R4 connecting AS 64512 to ISP1 in AS 64513.\n\nLet’s inspect the boundary, prefixes, and neighbor peering of AS 64512.',
      why: 'Grounds the concept of an Autonomous System (AS) as an administrative and scalability boundary before distinguishing IGP from EGP.',
      pic: 'Dual-AS topology showing AS 64512 (Enterprise Core: PC1, R1, R2, R3, R4) separated by a clear eBGP boundary from AS 64513 (Upstream ISP: ISP1, S1).',
      task: 'Inspect the Autonomous System metadata and prefixes for AS 64512 using as inspect 64512.',
      cmd: 'as inspect 64512',
      read: [
        ['Autonomous System', 'Routers and IP prefixes under one administrative policy'],
        ['ASN Identifier', '16-bit or 32-bit number (64512–65534 reserved for private use)'],
        ['Topology Hiding', 'Internal link failures stay inside the AS; borders share prefixes'],
        ['Border Router', 'R4 peers externally with ISP1 (AS 64513) at the AS edge'],
      ],
      rem: 'An Autonomous System (AS) groups routers under one administrative policy, hiding internal topology behind an ASN boundary.',
    },
    {
      group: 'Idea 4 of 4 · IGP vs EGP & Administrative Distance',
      chg: 'Now that networks are grouped into Autonomous Systems, routers need two different kinds of dynamic protocols: one for inside an AS, and one for between ASes.',
      title: 'Interior Gateway Protocols (IGP), Exterior Gateway Protocols (EGP), and Administrative Distance',
      what:
        'Dynamic routing protocols split cleanly into two families based on whether they operate inside an AS or across AS borders:\n\n1. Interior Gateway Protocols (IGPs) — Inside One AS:\n• Goal: Find the fastest, loop-free path between internal routers (R1, R2, R3, R4).\n• Examples: RIP (hop-count distance vector), OSPF (link-state shortest path), and IS-IS.\n• Trust Model: All routers belong to the same organization, so they share detailed link metrics freely.\n\n2. Exterior Gateway Protocols (EGPs) — Between Different ASes:\n• Goal: Exchange IP prefix reachability and enforce business/security policies between separate organizations (R4 in AS 64512 ↔ ISP1 in AS 64513).\n• Modern Standard: BGP-4 (Border Gateway Protocol, RFC 4271) is the sole EGP used on the modern internet.\n\nAdministrative Distance (AD):\nWhat if Router R4 learns a route to 10.20.0.0/24 from both a Static Route and OSPF? The router uses Administrative Distance (lower = more trusted):\n• Connected Interface: AD 0\n• Static Route: AD 1\n• External BGP (eBGP): AD 20\n• OSPF: AD 110\n• RIP: AD 120\n\nLet’s inspect the active routing protocols and Administrative Distance table on Router R4.',
      why: 'Establishes the IGP vs. EGP taxonomy and Administrative Distance tie-breaking rules, setting up Day 21 (RIP) and Day 22 (OSPF).',
      pic: 'Protocol split diagram: IGP (OSPF/RIP, AD 110/120) operating inside AS 64512 vs EGP (BGP-4, AD 20) operating across the R4–ISP1 AS border.',
      task: 'Display active routing protocols and Administrative Distance rankings using show route-protocols.',
      cmd: 'show route-protocols',
      read: [
        ['IGP (Intra-AS)', 'RIP, OSPF, IS-IS optimize internal paths inside a single AS'],
        ['EGP (Inter-AS)', 'BGP-4 (RFC 4271) exchanges prefixes and policy between ASes'],
        ['Admin Distance (AD)', 'Ranks route trustworthiness: Connected 0 < Static 1 < eBGP 20 < OSPF 110'],
        ['Next Up', 'Day 21 examines RIP (distance-vector); Day 22 examines OSPF (link-state)'],
      ],
      rem: 'IGPs (RIP, OSPF) optimize paths inside one Autonomous System; EGP (BGP-4) exchanges policy-filtered prefixes between Autonomous Systems.',
    },
    {
      group: 'Recap',
      title: 'The four core rules of dynamic routing & AS architecture',
      what:
        'Dynamic routing replaces fragile manual tables with automated, self-healing prefix distribution:\n\n1. Scalability: Static routes require O(R × S) manual entries and break under fleet growth; dynamic protocols distribute prefixes automatically into each router\'s RIB and FIB.\n2. Automatic Failover: Static routes cannot see remote link failures and blackhole traffic; dynamic protocols use Hello/Keepalive timers to withdraw dead paths and reroute.\n3. Autonomous Systems (AS): The internet is partitioned into administrative domains identified by ASNs (e.g., AS 64512), keeping internal topology details local.\n4. IGP vs. EGP & AD: IGPs (RIP, OSPF) compute optimal internal paths; EGP (BGP-4) exchanges prefixes across AS borders; Administrative Distance ranks competing route sources.',
      why: 'Consolidates Day 20 concepts and prepares the learner for Day 21 (RIP: Counting Hops) and Day 22 (OSPF: Sharing the Map).',
      pic: 'Master summary card contrasting Static Routing vs Dynamic Routing, AS boundaries, and the IGP/EGP/AD hierarchy.',
      task: 'Review the four core rules of dynamic routing and Autonomous System architecture.',
      cmd: null,
      read: [
        ['1. Scalability', 'Dynamic protocols eliminate O(R × S) manual static route edits'],
        ['2. Failure Recovery', 'Hello/Keepalive timers prevent blackholes by withdrawing dead links'],
        ['3. AS Boundaries', 'Autonomous Systems (ASN) isolate internal topology behind policy edges'],
        ['4. IGP vs EGP', 'IGP (RIP/OSPF) runs inside an AS; EGP (BGP-4) runs between ASes'],
      ],
      rem: 'Dynamic routing automates RIB/FIB updates, recovers from remote link failures, and separates intra-AS (IGP) from inter-AS (EGP/BGP) routing.',
    },
  ],
  staticResponses: {
    'ip route show':
      'Router R1 Routing Information Base (RIB) — Static Configuration:\n' +
      '----------------------------------------------------------------------\n' +
      '10.10.0.0/24   dev eth0        proto kernel   scope link   (Connected, AD 0)\n' +
      '10.12.0.0/30   dev eth1        proto kernel   scope link   (Connected, AD 0)\n' +
      '10.13.0.0/30   dev eth2        proto kernel   scope link   (Connected, AD 0)\n' +
      '10.20.0.0/24   via 10.12.0.2   dev eth1       proto static (Manual, AD 1)\n' +
      '10.24.0.0/30   via 10.12.0.2   dev eth1       proto static (Manual, AD 1)\n' +
      '198.51.100.0/24 via 10.12.0.2  dev eth1       proto static (Manual, AD 1)\n' +
      '----------------------------------------------------------------------\n' +
      'Scaling Warning: 4 routers × 6 subnets = 24 manual static entries.\n' +
      'Adding 1 new subnet behind R4 requires manual edits on R1, R2, R3, and R4.',

    'traceroute 10.20.0.10':
      'traceroute to 10.20.0.10 (10.20.0.10), 30 hops max, 60 byte packets\n' +
      ' 1  10.10.0.1 (R1)     0.42 ms   0.38 ms   0.35 ms\n' +
      ' 2  10.12.0.2 (R2)     1.14 ms   1.09 ms   1.12 ms\n' +
      ' 3  * * *  [BLACKHOLE: R2–R4 link DOWN (NO-CARRIER)]\n' +
      ' 4  * * *  [Static route on R1 still points to 10.12.0.2]\n' +
      '----------------------------------------------------------------------\n' +
      'Diagnosis: R1 eth1 is UP, so static route remains in RIB.\n' +
      'Backup path via R3 (10.13.0.2) is healthy, but unused without dynamic routing.',

    'as inspect 64512':
      'Autonomous System Inspection: AS64512 (Private ASN Range 64512–65534)\n' +
      '----------------------------------------------------------------------\n' +
      'Organization:   SQLens Enterprise Core\n' +
      'Internal IGP:   OSPF / RIP (Full internal topology visible inside AS64512)\n' +
      'Owned Prefixes: 10.10.0.0/24, 10.20.0.0/24, 10.12.0.0/30, 10.13.0.0/30\n' +
      'Border Router:  R4 (ASBR) — 203.0.113.1\n' +
      'External Peer:  AS64513 (Upstream ISP1 — 203.0.113.2)\n' +
      '----------------------------------------------------------------------\n' +
      'Policy: Internal link states (R1–R2–R3) are hidden from AS64513.\n' +
      'Only aggregated reachability prefixes cross the AS64512 ↔ AS64513 border.',

    'show route-protocols':
      'Active Routing Protocols & Administrative Distance (Router R4):\n' +
      '----------------------------------------------------------------------\n' +
      'Protocol          Scope           Metric / Policy         Admin Distance (AD)\n' +
      'Connected         Local Link      Direct Interface        0\n' +
      'Static            Manual          Engineer Configured     1\n' +
      'eBGP (BGP-4)      EGP (Inter-AS)  AS-Path & Policy        20\n' +
      'OSPF              IGP (Intra-AS)  Link Bandwidth Cost     110\n' +
      'RIP               IGP (Intra-AS)  Hop Count (max 15)      120\n' +
      '----------------------------------------------------------------------\n' +
      'Summary: IGP routes packets inside AS64512; eBGP peers with AS64513.',

    help:
      'Commands: ip route show, traceroute 10.20.0.10, as inspect 64512, show route-protocols, cls, clear, help',
  },
};
