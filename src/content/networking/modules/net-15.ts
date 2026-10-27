import { NetworkingModule } from '@/types/networking';

export const NET_15_MODULE: NetworkingModule = {
  id: 'net-15',
  dayNumber: 15,
  title: 'Day 15 · Traceroute: Following the Path Across the Internet',
  shortTitle: 'Traceroute: Following the Path',
  steps: [
    {
      group: 'Idea 1 of 4 · Probe anatomy',
      chg: 'Since Day 14: You learned that routers decrement the IPv4 TTL and return ICMP Type 11 when TTL reaches 0. Now, we investigate how Traceroute uses multiple probes per hop to measure latency and jitter.',
      title: 'Why Traceroute sends three probes per hop',
      what:
        'When you run a standard traceroute command, you notice that every hop outputs not one, but three round-trip time measurements:\n1  192.168.1.1  1.182 ms  1.145 ms  1.198 ms\n\nWhy three?\nA single packet measurement is vulnerable to momentary queueing delays, Wi-Fi interference, or buffer bloat. By transmitting three sequential probe packets for each TTL value, Traceroute provides statistical insight:\n• Consistent times (e.g. 1.1ms, 1.2ms, 1.1ms): Stable, uncongested link.\n• Highly fluctuating times (e.g. 1.2ms, 48.5ms, 2.1ms): Jitter caused by queue buffer congestion.\n• One or two packet drops (e.g. 1.2ms, *, 1.4ms): Intermittent packet loss.\n\nProbing Protocols:\n• Linux / macOS traceroute: By default, transmits UDP datagrams to high, randomized destination ports (starting at 33434 and incrementing with each probe). When the final destination is reached, the target machine returns ICMP Type 3 Code 3 (Port Unreachable), signaling completion!\n• Windows tracert: By default, transmits standard ICMP Echo Requests (Type 8) with incremental TTLs.\n\nLet’s trace the multi-hop path from PC1 to our Web Server across our nationwide network.',
      why: 'Understanding probe anatomy prevents engineers from misinterpreting jitter as permanent hardware failure.',
      pic: 'PC1 transmits 3 sequential probe packets with TTL=1, each receiving an ICMP Type 11 reply with individual RTT timestamps.',
      task: 'Run traceroute 198.51.100.10 to inspect the three probe timings across each hop.',
      cmd: 'traceroute 198.51.100.10',
      read: [
        ['Probe Count', '3 probes transmitted per TTL value to measure latency variance'],
        ['Hop 1 (LAN)', '192.168.1.1 · 1.182 ms  1.145 ms  1.198 ms (Local Gateway R1)'],
        ['Hop 2 (Regional)', '10.0.0.2 · 8.412 ms  8.389 ms  8.405 ms (Denver Hub R2)'],
        ['Hop 3 (Transcon)', '203.0.113.2 · 42.115 ms  42.088 ms  42.102 ms (New York R3)'],
        ['Hop 4 (Destination)', '198.51.100.10 · 48.241 ms  48.196 ms  48.212 ms (Web Server)'],
      ],
      rem: 'Traceroute sends 3 probes per hop to measure latency consistency, jitter, and packet loss.',
    },
    {
      group: 'Idea 2 of 4 · Latency and physics',
      chg: 'Our traceroute completed across 4 hops. Notice the massive latency jump between Hop 2 (8.4 ms) and Hop 3 (42.1 ms). Let’s investigate the physical laws governing network speed.',
      title: 'RTT jumps: Optical fiber and propagation delay',
      what:
        'Network latency is not arbitrary; it is constrained by the speed of light.\n\nIn a vacuum, light travels at 300,000 km/s. Inside silica glass optical fiber, light refracts through the core, slowing down to approximately 200,000 km/s (~5 microseconds per kilometer, or 1 millisecond per 200 km).\n\nBecause traceroute measures Round-Trip Time (RTT)—the time to go and return—each 1 ms of RTT represents approximately 100 km of physical fiber distance:\n• LAN hop (same room): < 1 ms.\n• Regional link (SF to Denver, ~1,600 km): ~16 ms round-trip propagation + routing delay = ~8–10 ms.\n• Transcontinental link (Denver to NYC, ~2,800 km): ~28 ms propagation + serialization = ~34 ms jump (total ~42 ms).\n• Transatlantic submarine cable (NYC to London, ~5,600 km): ~56 ms jump (total ~75–80 ms).\n\nWhen you see a large, sudden RTT jump between two consecutive hops in a traceroute, you are observing physical geographic distance or transit through long-haul subsea/underground fiber.\n\nLet’s inspect the fiber link telemetry across our transit routers.',
      why: 'Understanding optical propagation prevents engineers from troubleshooting software configurations when high RTT is simply geographic distance.',
      pic: 'Interactive fiber distance map linking SF Gateway R1, Denver Transit R2, NYC Backbone R3, and Frankfurt Server, displaying calculated propagation delay.',
      task: 'Inspect the physical link telemetry using show fiber links.',
      cmd: 'show fiber links',
      read: [
        ['SF to Denver Link', '1,620 km single-mode fiber · 8.1 ms optical propagation delay'],
        ['Denver to NYC Link', '2,850 km long-haul DWDM · 28.5 ms optical propagation delay'],
        ['Physical Limit', '~5 microseconds per km (speed of light in silica glass optical fiber)'],
        ['Rule of Thumb', 'Each 1 ms of round-trip time represents ~100 km of fiber distance'],
      ],
      rem: 'RTT jumps between traceroute hops reveal physical geographic distance governed by the speed of light in fiber (~5 µs/km).',
    },
    {
      group: 'Idea 3 of 4 · Control plane policing',
      chg: 'We now understand latency jumps. Now let’s tackle the single most misunderstood output in networking: three asterisks (* * *) on an intermediate hop.',
      title: 'The * * * mystery: Control Plane Policing (CoPP)',
      what:
        'Frequently, a traceroute output looks like this:\n2  10.0.0.2     8.412 ms  8.389 ms  8.405 ms\n3  * * *\n4  198.51.100.10  48.241 ms  48.196 ms  48.212 ms\n\nBeginners often panic and conclude: "Hop 3 is down! Packets are failing at Hop 3!"\nThis conclusion is 100% false. If Hop 3 were down, Hop 4 could never have responded!\n\nWhy did Hop 3 return * * *?\nModern enterprise routers split their architecture into two distinct planes:\n1. Data Plane (Hardware ASICs): Forwards customer transit traffic at wire speed (terabits per second). It never touches the main router CPU.\n2. Control Plane (General CPU): Handles routing protocols (BGP, OSPF) and generates ICMP error messages (Type 11).\n\nTo protect the router CPU from distributed denial-of-service (DDoS) attacks, network engineers configure Control Plane Policing (CoPP) and ICMP Rate Limiting. When traceroute sends probe packets, the router’s CPU may:\n• Drop the probe rather than generating an ICMP Type 11 message.\n• Firewall ICMP generation on that transit interface entirely.\n\nCrucial Rule: If hops AFTER the * * * respond successfully, the * * * is simply an intermediate router with ICMP generation disabled or rate-limited. It is NOT packet loss or network failure!\n\nLet’s observe this by running a trace across a router configured with ICMP Control Plane Policing.',
      why: 'Debunking the * * * myth is a rite of passage for network engineers, saving countless hours of false troubleshooting.',
      pic: 'Router R3’s hardware ASIC forwards transit packets cleanly to Hop 4, but its Control Plane CoPP policer drops the ICMP Type 11 generation, resulting in * * *.',
      task: 'Run traceroute 198.51.100.50 through a firewalled transit router to witness CoPP rate limiting.',
      cmd: 'traceroute 198.51.100.50',
      read: [
        ['Hop 3 Output', '* * * (Request timed out / ICMP rate limited)'],
        ['Hop 4 Output', '198.51.100.50 · 48.1 ms (Destination reached successfully!)'],
        ['Data Plane State', '100% forwarding throughput via hardware ASICs'],
        ['Control Plane State', 'ICMP Type 11 generation suppressed by Control Plane Policing (CoPP)'],
      ],
      rem: 'An intermediate * * * is not packet loss if subsequent hops respond; it simply indicates that the router suppresses ICMP generation.',
    },
    {
      group: 'Idea 4 of 4 · Asymmetric paths',
      chg: 'We know how routers report hops. Now, let’s discover the hidden paradox of internet routing: the return path rarely mirrors the outbound path.',
      title: 'Asymmetric routing: The return path paradox',
      what:
        'When you trace from your computer in San Francisco to a server in Frankfurt, you see the outbound path:\nPC1 → SF Gateway → Denver → NYC → Frankfurt Server.\n\nMany engineers assume the reply packet travels the exact same path in reverse:\nFrankfurt Server → NYC → Denver → SF Gateway → PC1.\n\nIn the global internet, this assumption is frequently wrong!\nThe internet is composed of over 100,000 independent Autonomous Systems (ASes) connected by Border Gateway Protocol (BGP). Every network operator makes their own routing policy and cost decisions:\n• Outbound traffic from your ISP might use Provider A (the lowest-cost transit provider across the continent).\n• Return traffic from the European server might use Provider B (a low-latency direct transoceanic peer).\n\nThis phenomenon is called Asymmetric Routing.\n\nCrucial Architectural Consequence:\nTraceroute shows ONLY the outgoing path! The IP addresses listed in hops 1, 2, 3... are the incoming interfaces of the routers on the outbound journey. If you want to know how packets return, you must run traceroute from the server back to the client!\n\nLet’s inspect the asymmetric return path of our multi-provider network.',
      why: 'Asymmetric routing explains why one-way packet loss, firewall state drops, and RTT spikes occur when reverse paths traverse congested links.',
      pic: 'Dual-path topology showing outbound traffic flowing across Transit Provider A (Denver/NYC) while return traffic flows across Transit Provider B (Chicago/Seattle).',
      task: 'Inspect the return route path using show return path.',
      cmd: 'show return path',
      read: [
        ['Outbound Path', 'PC1 → R1 (SF) → R2 (Denver) → R3 (NYC) → Server (Frankfurt)'],
        ['Return Path', 'Server → R_Transit_B (Amsterdam) → R_Transit_B (Chicago) → R1 → PC1'],
        ['Routing Mechanism', 'Independent BGP routing policies per Autonomous System (AS)'],
        ['Traceroute Reality', 'Traceroute only reports outgoing hops; reverse path must be traced from destination'],
      ],
      rem: 'Internet paths are frequently asymmetric: outbound packets and return packets traverse completely different routers and transit providers.',
    },
    {
      group: 'Recap',
      title: 'The four rules of traceroute and internet paths',
      what:
        'Traceroute is the premier diagnostic tool for Layer 3 internetworking. By understanding its physical, hardware, and protocol realities, you can accurately diagnose latency, packet loss, and routing behavior across the globe.',
      why: 'Consolidates path diagnosis before moving into Layer 4 Transport protocols (Ports, TCP 3-way handshake, and reliable delivery) in Days 16–19.',
      pic: 'Master topology HUD displaying probe telemetry, fiber propagation physics, CoPP rate limiting, and asymmetric transit loops.',
      task: 'Review the four fundamental rules of traceroute and internet path discovery.',
      cmd: null,
      read: [
        ['1. Three Probes per Hop', 'Measures latency stability, jitter, and intermittent packet loss'],
        ['2. Fiber Propagation Physics', 'Light travels at ~5 µs/km in glass; each 1 ms RTT represents ~100 km of fiber'],
        ['3. The * * * Truth', 'Intermediate timeouts reflect Control Plane Policing (CoPP), not packet loss, if later hops reply'],
        ['4. Asymmetric Reality', 'Outbound and inbound paths are independent; traceroute only maps the outbound journey'],
      ],
      rem: 'Traceroute maps outbound hops using incremental TTLs, measures optical fiber latency, and reveals internet routing realities.',
    },
  ],
  staticResponses: {
    'traceroute 198.51.100.10':
      'traceroute to 198.51.100.10 (198.51.100.10), 30 hops max, 60 byte packets\n 1  192.168.1.1 (192.168.1.1)  1.182 ms  1.145 ms  1.198 ms\n 2  10.0.0.2 (10.0.0.2)  8.412 ms  8.389 ms  8.405 ms\n 3  203.0.113.2 (203.0.113.2)  42.115 ms  42.088 ms  42.102 ms\n 4  198.51.100.10 (198.51.100.10)  48.241 ms  48.196 ms  48.212 ms',
    'show fiber links':
      'Optical Fiber Propagation Telemetry\n----------------------------------------------------\nSegment              Fiber Distance  Propagation Delay  Effective RTT\nPC1 - R1 (LAN)       15 meters       0.0001 ms          1.1 ms (switched)\nR1 - R2 (SF-Denver)  1,620 km        8.10 ms            8.4 ms\nR2 - R3 (Denver-NYC) 2,850 km        28.50 ms           42.1 ms\nR3 - Server (NYC-FRA)5,800 km (subsea)29.00 ms          48.2 ms\n----------------------------------------------------\nPhysical Law: Speed of light in silica fiber = ~200,000 km/s (5 µs/km)',
    'traceroute 198.51.100.50':
      'traceroute to 198.51.100.50 (198.51.100.50), 30 hops max, 60 byte packets\n 1  192.168.1.1 (192.168.1.1)  1.182 ms  1.145 ms  1.198 ms\n 2  10.0.0.2 (10.0.0.2)  8.412 ms  8.389 ms  8.405 ms\n 3  * * *\n 4  198.51.100.50 (198.51.100.50)  48.241 ms  48.196 ms  48.212 ms\n\n[Note: Hop 3 suppressed ICMP Type 11 via Control Plane Policing (CoPP). Transit forwarding 100% operational.]',
    'show return path':
      'BGP Asymmetric Route Inspection\n----------------------------------------------------\nOUTBOUND PATH (Traceroute View):\n  PC1 (SF) → R1 (AS64501) → R2 (AS64502 Denver) → R3 (AS64503 NYC) → Server (Frankfurt)\n\nINBOUND RETURN PATH (Reverse Path):\n  Server (Frankfurt) → AS64510 (Amsterdam) → AS64520 (Chicago) → R1 (AS64501) → PC1\n----------------------------------------------------\nStatus: Asymmetric routing active. Return traffic traverses independent BGP peers.',
    help:
      'Commands: traceroute 198.51.100.10, show fiber links, traceroute 198.51.100.50, show return path, cls, clear, help',
  },
};
