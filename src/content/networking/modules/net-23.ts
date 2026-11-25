import { NetworkingModule } from '@/types/networking';

export const NET_23_MODULE: NetworkingModule = {
  id: 'net-23',
  dayNumber: 23,
  title: 'Day 23 · Failover and Convergence',
  shortTitle: 'Failover & Convergence',
  steps: [
    {
      group: 'Idea 1 of 4 · Link failure detection & Dead timers',
      chg: 'Since Day 22: OSPF chose the Cost 3 10 Gbps path (R1 → R3 → R4 → R5) for 10.23.0.0/24. Now we cut the R3–R4 fiber link to measure how quickly routers detect the failure.',
      title: 'Physical NO-CARRIER loss vs. the 40-second OSPF Dead timer',
      what: `Before a routing protocol can reroute around a broken cable, at least one router must detect that the link failed. Detection speed depends on how the failure occurs:

• Direct Physical Loss (NO-CARRIER): When a fiber cable between R3 and R4 is severed directly, the optical transceivers lose light immediately. The kernel transitions eth1 to DOWN (NO-CARRIER) in under 10 milliseconds and notifies OSPF at once.
• Indirect / Silent Failure (40s Dead Timer): If an intermediate Layer 2 switch or optical transport fails silently, R3's physical port stays UP. OSPF must wait for 4 missed Hello packets (4 × 10s = 40 seconds) before declaring R4 DEAD.

Let’s sever the 10 Gbps fiber link between R3 and R4 and inspect the failure detection event.`,
      why: 'Establishes that failure detection—not routing computation—is often the largest component of convergence delay.',
      pic: 'Area 0 topology with R3 <-> R4 fiber link transitioning to DOWN (NO-CARRIER).',
      task: 'Simulate a fiber cut between R3 and R4 and inspect the failure event using link cut r3-r4.',
      cmd: 'link cut r3-r4',
      read: [
        ['Direct Failure', 'Optical NO-CARRIER detected by kernel in < 10 ms'],
        ['Silent Failure', 'Port stays UP; OSPF waits 40s (4 × 10s Hello) Dead interval'],
        ['Affected Link', 'R3 (3.3.3.3) <-> R4 (4.4.4.4) Cost 1 fiber link removed'],
        ['Next Phase', 'R3 and R4 must now flood updated LSAs across Area 0'],
      ],
      rem: 'Direct physical cuts trigger immediate NO-CARRIER detection (< 10 ms), whereas silent intermediate failures wait up to 40 seconds for the OSPF Dead timer.',
    },
    {
      group: 'Idea 2 of 4 · LSA re-flooding & SPF recalculation',
      chg: 'R3 and R4 have detected that their 10 Gbps link is DOWN. Now OSPF must synchronize the updated topology across Area 0 and recompute shortest paths.',
      title: 'Flooding updated Type-1 LSAs and rerunning Dijkstra SPF',
      what: `The instant R3 and R4 remove the dead link, OSPF executes three automated control-plane steps:

• LSA Sequence Increment: R3 (3.3.3.3) and R4 (4.4.4.4) generate new Type-1 Router LSAs with an incremented sequence number (0x80000005 → 0x80000006) omitting the R3–R4 edge.
• Area 0 Flooding: R3 floods its updated LSA to R1 over 224.0.0.5; R4 floods its updated LSA to R5. Every router updates its Link-State Database (LSDB) within milliseconds.
• SPF Recalculation: After a brief SPF throttle delay (50 ms) to batch simultaneous link flaps, R1 runs Dijkstra's SPF against the new LSDB. With Cost 3 unavailable, R1 computes the redundant backup path: R1 → R2 → R5 (Cost 2000).

Let’s inspect R1's LSA sequence update and SPF recalculation log.`,
      why: "Shows the exact event-driven control-plane sequence (LSA seq++ -> LSDB update -> SPF rerun) that replaces RIP's slow 30-second periodic timers.",
      pic: 'R3 flooding Type-1 LSA (Seq 0x80000006) to R1, triggering Dijkstra SPF recalculation onto R1 -> R2 -> R5 (Cost 2000).',
      task: "Inspect R1's LSA update and Dijkstra SPF run log using show ip ospf spf.",
      cmd: 'show ip ospf spf',
      read: [
        ['LSA Seq++', 'R3 & R4 increment Router LSA sequence (0x80000005 → 0x80000006)'],
        ['LSDB Update', 'All Area 0 routers remove the R3–R4 edge from their graph'],
        ['SPF Throttle', '50 ms batching delay prevents CPU thrashing during link flaps'],
        ['New SPF Winner', 'R1 → R2 → R5 (Cost 2000) promoted from backup to active'],
      ],
      rem: 'Updated Type-1 LSAs flood immediately across Area 0, allowing every router to rerun Dijkstra SPF and select the backup Cost 2000 path.',
    },
    {
      group: 'Idea 3 of 4 · FIB failover & convergence time',
      chg: "R1's control plane has computed the new Shortest-Path Tree via R2. Now R1 updates its hardware Forwarding Information Base (FIB) and completes convergence.",
      title: 'Measuring total convergence time and verifying FIB failover',
      what: `Convergence Time is the total elapsed duration from link failure until every router in the network has updated its Forwarding Information Base (FIB) and resumed loop-free delivery:

• Convergence Breakdown (Direct NO-CARRIER):
  - Link Detection :   8 ms (kernel NO-CARRIER)
  - LSA Flooding   :  12 ms (R3 → R1 LSDB sync)
  - SPF Rerun      :  54 ms (50 ms throttle + 4 ms Dijkstra)
  - FIB Install    :  11 ms (kernel route swap to eth0 via R2)
  - Total          : ~85 ms (sub-100 ms failover!)
• Why OSPF Beats RIPv2: RIPv2 required up to 180–240 seconds (or risked count-to-infinity loops), whereas OSPF converges deterministically in milliseconds on direct cuts.

Let’s trace a packet from R1 to 10.23.0.10 to verify traffic is flowing cleanly over the failover path.`,
      why: 'Quantifies convergence as a measurable engineering budget (Detection + Flood + SPF + FIB) and demonstrates live failover.',
      pic: 'Active traffic flowing over R1 -> R2 -> R5 (Cost 2000) while R3 <-> R4 remains severed.',
      task: 'Verify live failover routing from R1 to 10.23.0.10 using traceroute 10.23.0.10.',
      cmd: 'traceroute 10.23.0.10',
      read: [
        ['Convergence Time', 'Detection + LSA Flood + SPF Calculation + FIB Update'],
        ['Direct Cut Total', '~85 ms total outage for direct physical NO-CARRIER cuts'],
        ['Failover Path', 'R1 → R2 → R5 (10 Mbps backup, OSPF Cost 2000)'],
        ['Remaining Bottleneck', 'Indirect failures still wait 40s for the OSPF Dead timer'],
      ],
      rem: 'Total OSPF convergence time (~85 ms on direct cuts) equals Detection + LSA Flood + SPF + FIB Update, restoring delivery via R1 -> R2 -> R5.',
    },
    {
      group: 'Idea 4 of 4 · Sub-second detection with BFD',
      chg: 'OSPF converged in 85 ms for a direct fiber cut—but an indirect silent failure still stalls for 40 seconds waiting on the Dead timer. Modern networks fix this with BFD.',
      title: 'Eliminating the 40-second Dead timer with BFD (RFC 5880)',
      what: `Lowering OSPF's own Hello timer to milliseconds burns control-plane CPU. Instead, routers offload rapid liveness checks to BFD (Bidirectional Forwarding Detection, RFC 5880):

• UDP Port 3784: BFD runs as a lightweight, protocol-independent session over UDP port 3784 directly between neighboring router interfaces.
• 15 ms Silent Failure Detection: Configured with a 5 ms transmit/receive interval and a detection multiplier of 3, BFD declares a peer DOWN after 3 missed packets (3 × 5 ms = 15 ms)—2,600× faster than OSPF's 40-second Dead timer.
• Instant OSPF Trigger: When BFD detects a silent path break in 15 ms, it immediately tears down the OSPF neighbor adjacency and triggers Type-1 LSA flooding, keeping total convergence under 100 ms even across intermediate switches.

Let’s inspect the active BFD sessions protecting Area 0.`,
      why: "Teaches production-grade sub-second failover architecture (OSPF + BFD) without modifying OSPF's own CPU-heavy Hello state machine.",
      pic: 'BFD UDP 3784 5ms probes running across Area 0 links, triggering 15ms failure notification to OSPF.',
      task: 'Inspect active BFD sub-second liveness sessions using show bfd neighbors.',
      cmd: 'show bfd neighbors',
      read: [
        ['BFD (RFC 5880)', 'Lightweight liveness protocol over UDP port 3784'],
        ['Timer Math', '5 ms interval × 3 multiplier = 15 ms failure detection'],
        ['Speedup', '15 ms BFD detection vs 40,000 ms OSPF Dead timer'],
        ['OSPF Integration', 'BFD notifies OSPF immediately to flood LSAs and rerun SPF'],
      ],
      rem: 'BFD (UDP port 3784) detects silent link failures in 15 ms (5 ms × 3) and triggers immediate OSPF LSA withdrawal, achieving sub-100 ms convergence.',
    },
    {
      group: 'Recap',
      chg: 'Stage 6 Complete (Days 20–23) · Dynamic Routing Summary.',
      title: 'From static blackholes to sub-100 ms OSPF + BFD convergence',
      what: `Congratulations—you have completed Stage 6 (Dynamic Routing, Days 20–23)! Across these four days you mastered:

• Day 20 (Why Dynamic Routing): Replaced O(R × S) static routes and silent blackholes with IGPs inside an AS and BGP-4 between ASes.
• Day 21 (RIPv2): Observed distance-vector hop counting (UDP 520), the 15-hop ceiling, count-to-infinity loops, and Split Horizon / Poison Reverse.
• Day 22 (OSPFv2): Built synchronized Area 0 LSDBs with Type-1 LSAs (IP proto 89), bandwidth-aware Cost, and Dijkstra SPF.
• Day 23 (Failover & Convergence): Measured end-to-end convergence (~85 ms), verified redundant FIB failover, and eliminated the 40s Dead timer with BFD (15 ms).

In Stage 7 (Days 24–29: Services), we move up to network services—starting in Day 24 with DHCP automatic addressing (DORA).`,
      why: 'Summarizes all of Stage 6 and transitions cleanly into Stage 7 (Services).',
      pic: 'Converged Area 0 topology with OSPF + BFD active and Stage 7 (DHCP) transition.',
      task: 'Review the Stage 6 summary and proceed to Day 24 (DHCP: Automatic Addressing) when ready.',
      cmd: null,
      read: [
        ['Detection', 'Direct NO-CARRIER (< 10 ms) vs OSPF Dead (40s) vs BFD (15 ms)'],
        ['Control Plane', 'Updated Type-1 LSA (Seq++) floods Area 0 → Dijkstra SPF rerun'],
        ['Convergence', 'Detection + LSA Flood + SPF + FIB Update (~85 ms with BFD/NO-CARRIER)'],
        ['Stage 6 Complete', 'Static → RIPv2 (AD 120) → OSPFv2 (AD 110) + BFD sub-100 ms failover'],
      ],
      rem: 'Stage 6 complete: OSPFv2 + BFD delivers sub-100 ms loop-free convergence around failed links, preparing you for Stage 7 (DHCP, DNS, NAT).',
    },
  ],
  staticResponses: {
    'link cut r3-r4': `[t=000.000s] Simulating physical fiber cut on R3 (eth1) <-> R4 (eth0) [10.23.34.0/30]
[t=000.008s] KERNEL: R3 eth1 link state -> DOWN (NO-CARRIER)
[t=000.008s] KERNEL: R4 eth0 link state -> DOWN (NO-CARRIER)
[t=000.009s] OSPF-5-ADJCHG: Process 1, Nbr 4.4.4.4 on eth1 from FULL to DOWN (Interface Down)

[Detection Mode Comparison]
  Direct Fiber Cut (this event) : 8 ms (immediate NO-CARRIER interrupt)
  Silent Switch Failure         : 40,000 ms (4 × 10s Hello Dead Timer without BFD)`,
    'show ip ospf spf': `OSPFv2 SPF Recalculation Log — Router R1 (RID 1.1.1.1 | Area 0.0.0.0)
  [t=000.020s] Received Type-1 Router LSA from 3.3.3.3 (R3) | Seq: 0x80000006 (was 0x80000005)
  [t=000.021s] Received Type-1 Router LSA from 4.4.4.4 (R4) | Seq: 0x80000006 (was 0x80000005)
  [t=000.021s] LSDB updated: edge (R3 <-> R4) removed from Area 0 graph
  [t=000.071s] SPF throttle timer expired (50 ms) -> executing Dijkstra SPF
  [t=000.075s] SPF complete (4 ms):
               10.23.0.0/24 old path R1->R3->R4->R5 [UNREACHABLE]
               10.23.0.0/24 new path R1->R2->R5     [Cost 2000, via eth0]
  [t=000.085s] FIB updated: 10.23.0.0/24 next-hop 10.23.12.2 (R2)`,
    'traceroute 10.23.0.10': `traceroute to 10.23.0.10 (10.23.0.10), 30 hops max, 60 byte packets
 1  R2 (10.23.12.2)   18.210 ms  18.044 ms  18.119 ms   [10 Mbps backup | Cost 1000]
 2  R5 (10.23.25.2)   37.412 ms  37.190 ms  37.288 ms   [10 Mbps backup | Cost 1000]
 3  10.23.0.10        37.650 ms  37.511 ms  37.590 ms   [Destination reached | Total Cost 2000]

[Convergence Summary]
  Total Failover Outage : ~85 ms (8 ms detect + 12 ms LSA flood + 54 ms SPF + 11 ms FIB)
  Active FIB Route      : 10.23.0.0/24 via R2 (eth0) | OSPF AD 110 | Cost 2000`,
    'show bfd neighbors': `BFD Session Table — Router R1 (RFC 5880 | UDP Port 3784)
  NeighAddr     LD/RD    RH/RS     State   Int    Tx/Rx(ms)  Mult  DetectTime
  10.23.12.2    1/2      Up        Up      eth0   5 / 5      3     15 ms  (R2)
  10.23.13.2    2/3      Up        Up      eth1   5 / 5      3     15 ms  (R3)

[BFD + OSPF Integration]
  Without BFD : Silent L2 failure takes 40,000 ms (4 × 10s Hello Dead Timer).
  With BFD    : 3 missed 5 ms packets trigger OSPF LSA flood in 15 ms (sub-100 ms total).`,
  },
};
