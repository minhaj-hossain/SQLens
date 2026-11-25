import { NetworkingModule } from '@/types/networking';

export const NET_21_MODULE: NetworkingModule = {
  id: 'net-21',
  dayNumber: 21,
  title: 'Day 21 · RIP: Counting Hops',
  shortTitle: 'RIP: Counting Hops',
  steps: [
    {
      group: 'Idea 1 of 4 · Distance-vector & RIPv2 updates',
      chg: 'Since Day 20: You learned why Autonomous Systems deploy Interior Gateway Protocols (IGPs) instead of static routes. Today we open the first IGP: RIPv2 (RFC 2453), a distance-vector protocol with Administrative Distance 120.',
      title: 'Exchanging prefix vectors over UDP port 520',
      what: `In a distance-vector protocol, no router knows the full physical topology of the network. Instead, each router maintains a vector of (prefix, metric, next-hop) entries and exchanges those summaries with directly connected neighbors.

RIPv2 (Routing Information Protocol version 2, RFC 2453) operates with four core mechanics:

• Transport & Classless Masks: Routers send RIPv2 Response packets over UDP port 520 to multicast address 224.0.0.9. Unlike legacy RIPv1, each 20-byte route entry includes an explicit subnet mask (for example, /24), supporting CIDR and VLSM.
• Bellman-Ford Rule: When Router R1 receives an update from neighbor R2 advertising 10.21.0.0/24 at metric M, R1 computes M + 1 and installs the route if the prefix is unknown or if M + 1 is strictly lower than R1's existing metric.
• Periodic Timers: Every 30 seconds, each router transmits its full RIP table out active interfaces. If no update refreshes a route for 180 seconds, it is marked invalid (possibly down); at 240 seconds, it is flushed from the RIB.
• Administrative Distance: As covered in Day 20, RIP routes carry AD 120, losing to OSPF (110) and static routes (1) if multiple sources advertise the same prefix.

Let’s inspect Router R1's RIPv2 table and active neighbor timers.`,
      why: 'Grounds distance-vector routing in exact RFC 2453 wire behavior (UDP port 520, multicast 224.0.0.9, Bellman-Ford M + 1, and timers) before examining metric flaws.',
      pic: 'Five-router topology (R1–R5) showing R1 exchanging periodic 30-second UDP port 520 RIPv2 updates with neighbors R2 and R3.',
      task: "Inspect Router R1's RIPv2 routing table and timer configuration using show ip rip.",
      cmd: 'show ip rip',
      read: [
        ['Algorithm', 'Distance-vector (Bellman-Ford): learn (prefix, M) and install M + 1'],
        ['Transport', 'UDP port 520 to multicast 224.0.0.9 with explicit subnet masks (RFC 2453)'],
        ['Timers', '30s periodic update, 180s invalid timeout, 240s RIB flush'],
        ['AD & Priority', 'Administrative Distance 120 (lower priority than OSPF 110 or static 1)'],
      ],
      rem: 'RIPv2 routers flood their (prefix, metric) vectors every 30 seconds over UDP port 520 (224.0.0.9) and compute next-hop metrics using Bellman-Ford (M + 1).',
    },
    {
      group: 'Idea 2 of 4 · Hop count metric & 15-hop limit',
      chg: "RIPv2 exchanges (prefix, metric) pairs every 30 seconds. Now let's examine how RIP measures path cost—and why a slow 10 Mbps link can beat a fast 10 Gbps link.",
      title: 'Why hop count ignores bandwidth and caps at 15 hops',
      what: `Every routing protocol needs a metric to rank competing paths to the same subnet. RIP uses the simplest possible metric: Hop Count—the number of Layer 3 routers a packet crosses to reach the destination.

This simplicity creates two major engineering limitations:

• Bandwidth Blindness: RIP ignores link speed, latency, and utilization. In our topology, R1 can reach 10.21.0.0/24 behind R5 via two paths:
  - Upper Path (R1 → R2 → R5): 2 hops over congested 10 Mbps serial links.
  - Lower Path (R1 → R3 → R4 → R5): 3 hops over 10 Gbps fiber links.
  Because 2 < 3, RIP installs the 10 Mbps path in the FIB and leaves the 10 Gbps path idle.
• The 15-Hop Ceiling (Infinity = 16): RFC 2453 defines metric 16 as unreachable (infinity). Any subnet 16 or more routers away is discarded, limiting RIP to small networks with a maximum diameter of 15 hops.

Let’s trace a packet from R1 to 10.21.0.10 to observe which physical path RIPv2 selected.`,
      why: 'Demonstrates why hop count is unsuitable for modern heterogeneous networks and motivates why Day 22 (OSPF) introduces bandwidth-aware link-state cost.',
      pic: 'R1 choosing the 2-hop 10 Mbps upper path (R1 -> R2 -> R5) over the 3-hop 10 Gbps lower path (R1 -> R3 -> R4 -> R5).',
      task: 'Trace the active path from R1 to 10.21.0.10 using traceroute 10.21.0.10.',
      cmd: 'traceroute 10.21.0.10',
      read: [
        ['Hop Count Metric', 'Counts only Layer 3 routers traversed (10 Mbps = 10 Gbps per hop)'],
        ['Suboptimal Path', '2-hop 10 Mbps path beats 3-hop 10 Gbps fiber path'],
        ['Max Diameter', '15 hops maximum; RIP cannot scale to large enterprise backbones'],
        ['Infinity Value', 'Metric 16 means unreachable and triggers route withdrawal'],
      ],
      rem: 'RIP ranks paths strictly by hop count—ignoring link bandwidth—and treats metric 16 as unreachable (infinity), capping networks at 15 hops.',
    },
    {
      group: 'Idea 3 of 4 · Count-to-infinity routing loop',
      chg: 'Because RIP routers only know neighbor-advertised hop counts—not the full network graph—a single link failure can trap routers in a routing loop.',
      title: 'How periodic updates create a count-to-infinity loop',
      what: `Before failure, R2 reaches 10.21.0.0/24 directly via R5 in 1 hop, and R1 reaches it via R2 in 2 hops. Now the physical link between R2 and R5 fails (NO-CARRIER / DOWN):

• Step 1 — Local Withdrawal: R2 detects the dead R2–R5 interface and removes its 1-hop route to 10.21.0.0/24.
• Step 2 — Stale Periodic Update: Before R2 advertises the loss, R1's 30-second timer fires. R1 sends its table to R2: "10.21.0.0/24 reachable in 2 hops." R2 does not know R1's path goes through R2 itself.
• Step 3 — False Route Installation: Applying Bellman-Ford (M + 1), R2 installs a route to 10.21.0.0/24 via R1 with metric 2 + 1 = 3.
• Step 4 — Count-to-Infinity Loop: On the next 30s cycle, R1 sees R2's metric rose to 3, so R1 updates its metric to 4. Both routers increment 3 → 4 → 5 → ... → 16 while forwarding packets back and forth (R1 ↔ R2) until IP TTL reaches 0.

This slow climb to metric 16 is called Count-to-Infinity—and it is the exact reason RIP uses 16 instead of 255 for infinity.

Let’s simulate the R2–R5 link failure and inspect the looping metric progression.`,
      why: 'Gives a step-by-step mechanical trace of the classic distance-vector failure mode so loop mitigations in Idea 4 feel necessary rather than arbitrary.',
      pic: 'R2-R5 link DOWN; R1 and R2 exchanging incrementing metrics (2 -> 3 -> 4 -> ... -> 16) while data packets bounce between R1 and R2.',
      task: 'Inspect the R2–R5 failure timeline and count-to-infinity loop trace using rip debug loop.',
      cmd: 'rip debug loop',
      read: [
        ['Root Cause', 'Routers lack a full topology map and trust neighbor hop counts blindly'],
        ['Loop Mechanics', 'R1 and R2 alternate incrementing M + 1 until reaching metric 16'],
        ['Packet Fate', 'Data packets bounce R1 ↔ R2 until IP TTL decrements to 0'],
        ['Why Infinity = 16', 'A small ceiling limits how long count-to-infinity takes to terminate'],
      ],
      rem: 'Count-to-infinity happens when stale 30-second updates cause neighboring routers to increment metrics (3 -> 4 -> ... -> 16) in a forwarding loop until IP TTL expires.',
    },
    {
      group: 'Idea 4 of 4 · Split horizon & poison reverse',
      chg: 'Count-to-infinity happened because R1 advertised a route back to R2—the very neighbor R1 learned it from. RIPv2 prevents this with three loop safeguards.',
      title: 'Breaking loops with split horizon, poison reverse, and hold-down',
      what: `To stop distance-vector routing loops before metrics climb to 16, RFC 2453 implementations enforce three cooperating rules:

• Split Horizon: A router never advertises a route back out of the same interface from which it learned that route. Because R1 learned 10.21.0.0/24 from R2 on eth0, R1 omits 10.21.0.0/24 from updates sent out eth0 to R2.
• Route Poisoning & Poison Reverse: When R2 loses the R2–R5 link, R2 does not wait 30 seconds. It immediately sends a triggered update advertising 10.21.0.0/24 with metric 16 (infinity) to mark the prefix dead. With Poison Reverse enabled, R1 echoes metric 16 back to R2 (overriding Split Horizon for that dead route) to confirm withdrawal.
• Hold-Down Timer (180s): Once a route enters metric 16, routers start a hold-down timer and reject worse or equal advertisements for that prefix until the timer expires or a strictly better path arrives.

Let’s verify that Split Horizon, Poison Reverse, and Hold-Down timers are active on R1 and R2.`,
      why: 'Completes the RFC 2453 protocol picture and explains how triggered infinity advertisements replace slow 30-second convergence.',
      pic: 'R2-R5 link DOWN; Split Horizon blocking R1 -> R2 echo, and R2 sending an immediate triggered metric-16 poison update.',
      task: 'Check Split Horizon, Poison Reverse, and Hold-Down status using show ip rip loops.',
      cmd: 'show ip rip loops',
      read: [
        ['Split Horizon', 'Never advertise a prefix back out the interface where it was learned'],
        ['Route Poisoning', 'Immediately advertise a failed prefix with metric 16 (triggered update)'],
        ['Poison Reverse', 'Echo metric 16 back to the sender to confirm dead-route withdrawal'],
        ['Hold-Down Timer', 'Ignore stale updates for 180s after a route is poisoned to metric 16'],
      ],
      rem: 'Split Horizon, Route Poisoning (metric 16 triggered updates), Poison Reverse, and 180s Hold-Down timers prevent count-to-infinity loops in RIPv2.',
    },
    {
      group: 'Recap',
      chg: 'Stage 6 · Day 21 Summary: RIPv2 & Distance-Vector Routing.',
      title: 'RIPv2: Hop-count simplicity, 15-hop ceiling, and loop prevention',
      what: `You have completed Day 21 and traced the full behavior and failure modes of RIPv2 (RFC 2453):

• Distance-Vector Updates: Routers exchange (prefix, metric) vectors over UDP port 520 (multicast 224.0.0.9) every 30 seconds and compute M + 1 via Bellman-Ford.
• Hop Count & 15-Hop Limit: RIP ignores link bandwidth (preferring 2 hops at 10 Mbps over 3 hops at 10 Gbps) and treats metric 16 as unreachable (infinity).
• Count-to-Infinity: Without loop safeguards, stale periodic updates after a link failure bounce packets R1 ↔ R2 while metrics climb to 16.
• Loop Safeguards: Split Horizon, Route Poisoning (metric 16 triggered updates), Poison Reverse, and Hold-Down timers eliminate 2-node loops.

In Day 22, we replace hop-count guesswork with OSPF—a link-state protocol where every router builds a complete topology map and computes bandwidth-aware shortest paths with Dijkstra's SPF algorithm.`,
      why: 'Consolidates Day 21 distance-vector concepts and sets up the contrast with Day 22 Link-State (OSPF).',
      pic: 'Full five-router topology showing RIPv2 limits (15 hops, bandwidth blindness) alongside active loop safeguards.',
      task: 'Review the Day 21 summary and proceed to Day 22 (OSPF: Sharing the Map) when ready.',
      cmd: null,
      read: [
        ['Protocol', 'RIPv2 (RFC 2453), UDP port 520, multicast 224.0.0.9, AD 120'],
        ['Metric & Ceiling', 'Hop count only (ignores bandwidth); max 15 hops, 16 = infinity'],
        ['Failure Mode', 'Count-to-infinity routing loops from stale 30s periodic updates'],
        ['Loop Safeguards', 'Split Horizon, Route Poisoning (16), Poison Reverse, 180s Hold-Down'],
      ],
      rem: 'RIPv2 is simple to configure for small 15-hop networks, but bandwidth blindness and slow periodic convergence motivate Link-State routing (OSPF) in Day 22.',
    },
  ],
  staticResponses: {
    'show ip rip': `RIPv2 Routing Process (RFC 2453) — Router R1
  Transport : UDP port 520 | Multicast: 224.0.0.9 | AD: 120
  Timers    : Update 30s | Invalid 180s | Hold-down 180s | Flush 240s
  Next periodic update in: 14s

RIPv2 RIB Entries on R1:
  Prefix            Metric  Next-Hop    Interface  Age
  10.21.12.0/30     0       connected   eth0       -
  10.21.13.0/30     0       connected   eth1       -
  10.21.25.0/30     1       10.21.12.2  eth0       12s  (via R2)
  10.21.34.0/30     1       10.21.13.2  eth1       08s  (via R3)
  10.21.0.0/24      2       10.21.12.2  eth0       12s  (via R2 -> R5)
  10.21.0.0/24     [3]      10.21.13.2  eth1       08s  (suppressed: higher hop count via R3 -> R4 -> R5)`,
    'traceroute 10.21.0.10': `traceroute to 10.21.0.10 (10.21.0.10), 30 hops max, 60 byte packets
 1  R2 (10.21.12.2)   18.412 ms  18.109 ms  18.305 ms   [10 Mbps serial link]
 2  R5 (10.21.25.2)   37.890 ms  37.641 ms  37.712 ms   [10 Mbps serial link]
 3  10.21.0.10        38.104 ms  38.022 ms  38.089 ms   [Destination reached in 2 router hops]

[RIPv2 Path Selection Note]
  Active FIB path : R1 -> R2 -> R5 (2 hops, 10 Mbps bottleneck)
  Ignored path    : R1 -> R3 -> R4 -> R5 (3 hops, 10 Gbps fiber)
  Reason          : RIPv2 ranks paths strictly by hop count (2 < 3), ignoring bandwidth.
  Max RIP hops    : 15 (Metric 16 = infinity / unreachable)`,
    'rip debug loop': `[EVENT t=000s] Physical link R2 <-> R5 (10.21.25.0/30) transitions to DOWN (NO-CARRIER)
[EVENT t=001s] R2 removes direct route 10.21.0.0/24 (1 hop) from RIB
[EVENT t=014s] R1 30s periodic timer fires -> sends stale update to R2: "10.21.0.0/24 metric 2"
[LOOP  t=014s] R2 applies Bellman-Ford (2 + 1) -> installs 10.21.0.0/24 via R1 (metric 3)!
[LOOP  t=044s] R1 receives R2 update (metric 3) -> updates R1 RIB to metric 4 via R2
[LOOP  t=074s] R2 receives R1 update (metric 4) -> updates R2 RIB to metric 5 via R1
...
[LOOP  t=404s] Metric reaches 16 (INFINITY) -> both routers finally mark 10.21.0.0/24 unreachable

[Forwarding Plane Impact]
  Packets to 10.21.0.10 bounce R1 <-> R2 until IP TTL decrements from 64 to 0 (TTL Exceeded).`,
    'show ip rip loops': `RIPv2 Loop-Prevention Status — R1 & R2 (RFC 2453)
  Interface   Split Horizon   Poison Reverse   Hold-Down   Triggered Updates
  R1 eth0     ENABLED         ENABLED          180s        ENABLED
  R2 eth0     ENABLED         ENABLED          180s        ENABLED

Simulated R2 <-> R5 Failure With Safeguards Active:
  1. Split Horizon : R1 blocks advertising 10.21.0.0/24 (learned on eth0) back out eth0 to R2.
  2. Route Poison  : R2 immediately sends triggered update: "10.21.0.0/24 metric 16 (infinity)".
  3. Poison Reverse: R1 flushes route via R2 and echoes metric 16 back to R2 on eth0.
  4. Hold-Down     : R1 & R2 suppress stale updates for 180s; R1 installs 3-hop path via R3 -> R4 -> R5.`,
  },
};
