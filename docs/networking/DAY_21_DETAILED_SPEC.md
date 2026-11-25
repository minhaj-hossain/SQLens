# SQLens Networking Track — Day 21 Detailed Specification
## Stage 6: Dynamic Routing (Days 20–23) · Sharing the Map & Convergence
### Module: `net-21` · RIP: Counting Hops (Distance-Vector, 15-Hop Limit & Count-to-Infinity)

---

## 1. Pedagogical Intent & Objectives

### Context & Learning Progression
- **Day 20 (`net-20` — Why Dynamic Routing)**: Established why manual $O(R \times S)$ static routes fail to scale and cause silent blackholes on indirect link failures, introduced Autonomous Systems (AS), contrasted IGPs vs. EGPs, and defined Administrative Distance (AD `120` for RIP).
- **Day 21 (This Module — `net-21`)**: Opens our first concrete Interior Gateway Protocol (IGP): **RIPv2 (Routing Information Protocol version 2, RFC 2453)**. Students observe exact distance-vector mechanics and see firsthand why RIP's simplicity creates two famous engineering limits:
  - **Distance-Vector & Periodic UDP 520 Updates**: Each router maintains a vector of `(prefix, metric, next-hop)` entries and floods its Routing Information Base (RIB) to neighbors every **30 seconds** over **UDP port 520** (multicast `224.0.0.9`), using the **Bellman-Ford** update rule ($M + 1$).
  - **Hop Count Metric & 15-Hop Ceiling**: RIP counts only Layer 3 router hops and ignores link bandwidth, causing a slow `10 Mbps` 2-hop path to beat a fast `10 Gbps` 3-hop path. Metric **16** represents **infinity (unreachable)**, capping RIP networks at **15 hops**.
  - **Count-to-Infinity Routing Loops**: Because routers only see neighbor-advertised hop counts rather than the full graph, a link failure (`R2–R5 DOWN`) can cause `R1` and `R2` to feed stale routes back to each other, incrementing metrics `3 → 4 → 5 → ... → 16` while packets bounce until IP TTL expires.
  - **Loop Prevention Mechanisms**: **Split Horizon** (never advertise a route back out the interface it was learned on), **Route Poisoning & Poison Reverse** (immediately advertise failed prefixes at metric `16` via triggered updates), and **Hold-Down Timers** (`180s` suppression window).

### Key Pedagogical Constraints
- **Zero Analogies Policy**:
  - STRICTLY FORBIDDEN: Metaphors (no road signs, word of mouth, rumor/gossip, GPS, postmen, highways, passing notes).
  - MANDATORY: Exact physical & digital realities: Bellman-Ford distance-vector algorithm, Routing Information Base (RIB), RIPv2 (RFC 2453), UDP port 520, multicast `224.0.0.9`, classless subnet masks, hop count metric, metric `16` = infinity, `30s` update / `180s` invalid / `240s` flush timers, IP TTL expiry, Split Horizon, Route Poisoning, Poison Reverse, and Hold-Down timers.
- **Taught Before Tested**:
  - Motivate and define Distance-Vector, Bellman-Ford ($M + 1$), UDP port `520`, `224.0.0.9`, and RIPv2 timers (`30s` / `180s` / `240s`) before running `show ip rip`.
  - Explain hop count, bandwidth blindness (`10 Mbps` vs `10 Gbps`), and the `15`-hop limit (`16` = infinity) before running `traceroute 10.21.0.10`.
  - Walk through the exact `R1 ↔ R2` stale-update sequence and IP TTL decrement before running `rip debug loop`.
  - Define Split Horizon, Route Poisoning, Poison Reverse, and Hold-Down timers before running `show ip rip loops`.
- **Task Hint Policy**: Omit `(tap it to fill the terminal).` and end all task instructions with a clean period.

---

## 2. Module Identity & Metadata

```typescript
export const NET_21_MODULE: NetworkingModule = {
  id: 'net-21',
  dayNumber: 21,
  title: 'Day 21 · RIP: Counting Hops',
  shortTitle: 'RIP: Counting Hops',
  steps: [
    // 5 steps: 4 Ideas + 1 Recap
  ],
  staticResponses: {
    // Exact command outputs
  },
};
```

---

## 3. Step-by-Step Curriculum Architecture

### Step 1: Idea 1 of 4 · Distance-vector & RIPv2 updates
- **Group**: `Idea 1 of 4 · Distance-vector & RIPv2 updates`
- **Chg**: `Since Day 20: You learned why Autonomous Systems deploy Interior Gateway Protocols (IGPs) instead of static routes. Today we open the first IGP: RIPv2 (RFC 2453), a distance-vector protocol with Administrative Distance 120.`
- **Title**: `Exchanging prefix vectors over UDP port 520`
- **What**:
  ```text
  In a distance-vector protocol, no router knows the full physical topology of the network. Instead, each router maintains a vector of (prefix, metric, next-hop) entries and exchanges those summaries with directly connected neighbors.

  RIPv2 (Routing Information Protocol version 2, RFC 2453) operates with four core mechanics:

  • Transport & Classless Masks: Routers send RIPv2 Response packets over UDP port 520 to multicast address 224.0.0.9. Unlike legacy RIPv1, each 20-byte route entry includes an explicit subnet mask (for example, /24), supporting CIDR and VLSM.
  • Bellman-Ford Rule: When Router R1 receives an update from neighbor R2 advertising 10.21.0.0/24 at metric M, R1 computes M + 1 and installs the route if the prefix is unknown or if M + 1 is strictly lower than R1's existing metric.
  • Periodic Timers: Every 30 seconds, each router transmits its full RIP table out active interfaces. If no update refreshes a route for 180 seconds, it is marked invalid (possibly down); at 240 seconds, it is flushed from the RIB.
  • Administrative Distance: As covered in Day 20, RIP routes carry AD 120, losing to OSPF (110) and static routes (1) if multiple sources advertise the same prefix.

  Let’s inspect Router R1's RIPv2 table and active neighbor timers.
  ```
- **Why**: Grounds distance-vector routing in exact RFC 2453 wire behavior (UDP port 520, multicast `224.0.0.9`, Bellman-Ford `M + 1`, and timers) before examining metric flaws.
- **Pic**: `Five-router topology (R1–R5) showing R1 exchanging periodic 30-second UDP port 520 RIPv2 updates with neighbors R2 and R3.`
- **Task**: `Inspect Router R1's RIPv2 routing table and timer configuration using show ip rip.`
- **Cmd**: `show ip rip`
- **Read**:
  - `['Algorithm', 'Distance-vector (Bellman-Ford): learn (prefix, M) and install M + 1']`
  - `['Transport', 'UDP port 520 to multicast 224.0.0.9 with explicit subnet masks (RFC 2453)']`
  - `['Timers', '30s periodic update, 180s invalid timeout, 240s RIB flush']`
  - `['AD & Priority', 'Administrative Distance 120 (lower priority than OSPF 110 or static 1)']`
- **Rem**: `RIPv2 routers flood their (prefix, metric) vectors every 30 seconds over UDP port 520 (224.0.0.9) and compute next-hop metrics using Bellman-Ford (M + 1).`

---

### Step 2: Idea 2 of 4 · Hop count metric & 15-hop limit
- **Group**: `Idea 2 of 4 · Hop count metric & 15-hop limit`
- **Chg**: `RIPv2 exchanges (prefix, metric) pairs every 30 seconds. Now let's examine how RIP measures path cost—and why a slow 10 Mbps link can beat a fast 10 Gbps link.`
- **Title**: `Why hop count ignores bandwidth and caps at 15 hops`
- **What**:
  ```text
  Every routing protocol needs a metric to rank competing paths to the same subnet. RIP uses the simplest possible metric: Hop Count—the number of Layer 3 routers a packet crosses to reach the destination.

  This simplicity creates two major engineering limitations:

  • Bandwidth Blindness: RIP ignores link speed, latency, and utilization. In our topology, R1 can reach 10.21.0.0/24 behind R5 via two paths:
    - Upper Path (R1 → R2 → R5): 2 hops over congested 10 Mbps serial links.
    - Lower Path (R1 → R3 → R4 → R5): 3 hops over 10 Gbps fiber links.
    Because 2 < 3, RIP installs the 10 Mbps path in the FIB and leaves the 10 Gbps path idle.
  • The 15-Hop Ceiling (Infinity = 16): RFC 2453 defines metric 16 as unreachable (infinity). Any subnet 16 or more routers away is discarded, limiting RIP to small networks with a maximum diameter of 15 hops.

  Let’s trace a packet from R1 to 10.21.0.10 to observe which physical path RIPv2 selected.
  ```
- **Why**: Demonstrates why hop count is unsuitable for modern heterogeneous networks and motivates why Day 22 (OSPF) introduces bandwidth-aware link-state cost.
- **Pic**: `R1 choosing the 2-hop 10 Mbps upper path (R1 -> R2 -> R5) over the 3-hop 10 Gbps lower path (R1 -> R3 -> R4 -> R5).`
- **Task**: `Trace the active path from R1 to 10.21.0.10 using traceroute 10.21.0.10.`
- **Cmd**: `traceroute 10.21.0.10`
- **Read**:
  - `['Hop Count Metric', 'Counts only Layer 3 routers traversed (10 Mbps = 10 Gbps per hop)']`
  - `['Suboptimal Path', '2-hop 10 Mbps path beats 3-hop 10 Gbps fiber path']`
  - `['Max Diameter', '15 hops maximum; RIP cannot scale to large enterprise backbones']`
  - `['Infinity Value', 'Metric 16 means unreachable and triggers route withdrawal']`
- **Rem**: `RIP ranks paths strictly by hop count—ignoring link bandwidth—and treats metric 16 as unreachable (infinity), capping networks at 15 hops.`

---

### Step 3: Idea 3 of 4 · Count-to-infinity routing loop
- **Group**: `Idea 3 of 4 · Count-to-infinity routing loop`
- **Chg**: `Because RIP routers only know neighbor-advertised hop counts—not the full network graph—a single link failure can trap routers in a routing loop.`
- **Title**: `How periodic updates create a count-to-infinity loop`
- **What**:
  ```text
  Before failure, R2 reaches 10.21.0.0/24 directly via R5 in 1 hop, and R1 reaches it via R2 in 2 hops. Now the physical link between R2 and R5 fails (NO-CARRIER / DOWN):

  • Step 1 — Local Withdrawal: R2 detects the dead R2–R5 interface and removes its 1-hop route to 10.21.0.0/24.
  • Step 2 — Stale Periodic Update: Before R2 advertises the loss, R1's 30-second timer fires. R1 sends its table to R2: "10.21.0.0/24 reachable in 2 hops." R2 does not know R1's path goes through R2 itself.
  • Step 3 — False Route Installation: Applying Bellman-Ford (M + 1), R2 installs a route to 10.21.0.0/24 via R1 with metric 2 + 1 = 3.
  • Step 4 — Count-to-Infinity Loop: On the next 30s cycle, R1 sees R2's metric rose to 3, so R1 updates its metric to 4. Both routers increment 3 → 4 → 5 → ... → 16 while forwarding packets back and forth (R1 ↔ R2) until IP TTL reaches 0.

  This slow climb to metric 16 is called Count-to-Infinity—and it is the exact reason RIP uses 16 instead of 255 for infinity.

  Let’s simulate the R2–R5 link failure and inspect the looping metric progression.
  ```
- **Why**: Gives a step-by-step mechanical trace of the classic distance-vector failure mode so loop mitigations in Idea 4 feel necessary rather than arbitrary.
- **Pic**: `R2-R5 link DOWN; R1 and R2 exchanging incrementing metrics (2 -> 3 -> 4 -> ... -> 16) while data packets bounce between R1 and R2.`
- **Task**: `Inspect the R2–R5 failure timeline and count-to-infinity loop trace using rip debug loop.`
- **Cmd**: `rip debug loop`
- **Read**:
  - `['Root Cause', 'Routers lack a full topology map and trust neighbor hop counts blindly']`
  - `['Loop Mechanics', 'R1 and R2 alternate incrementing M + 1 until reaching metric 16']`
  - `['Packet Fate', 'Data packets bounce R1 ↔ R2 until IP TTL decrements to 0']`
  - `['Why Infinity = 16', 'A small ceiling limits how long count-to-infinity takes to terminate']`
- **Rem**: `Count-to-infinity happens when stale 30-second updates cause neighboring routers to increment metrics (3 -> 4 -> ... -> 16) in a forwarding loop until IP TTL expires.`

---

### Step 4: Idea 4 of 4 · Split horizon & poison reverse
- **Group**: `Idea 4 of 4 · Split horizon & poison reverse`
- **Chg**: `Count-to-infinity happened because R1 advertised a route back to R2—the very neighbor R1 learned it from. RIPv2 prevents this with three loop safeguards.`
- **Title**: `Breaking loops with split horizon, poison reverse, and hold-down`
- **What**:
  ```text
  To stop distance-vector routing loops before metrics climb to 16, RFC 2453 implementations enforce three cooperating rules:

  • Split Horizon: A router never advertises a route back out of the same interface from which it learned that route. Because R1 learned 10.21.0.0/24 from R2 on eth0, R1 omits 10.21.0.0/24 from updates sent out eth0 to R2.
  • Route Poisoning & Poison Reverse: When R2 loses the R2–R5 link, R2 does not wait 30 seconds. It immediately sends a triggered update advertising 10.21.0.0/24 with metric 16 (infinity) to mark the prefix dead. With Poison Reverse enabled, R1 echoes metric 16 back to R2 (overriding Split Horizon for that dead route) to confirm withdrawal.
  • Hold-Down Timer (180s): Once a route enters metric 16, routers start a hold-down timer and reject worse or equal advertisements for that prefix until the timer expires or a strictly better path arrives.

  Let’s verify that Split Horizon, Poison Reverse, and Hold-Down timers are active on R1 and R2.
  ```
- **Why**: Completes the RFC 2453 protocol picture and explains how triggered infinity advertisements replace slow 30-second convergence.
- **Pic**: `R2-R5 link DOWN; Split Horizon blocking R1 -> R2 echo, and R2 sending an immediate triggered metric-16 poison update.`
- **Task**: `Check Split Horizon, Poison Reverse, and Hold-Down status using show ip rip loops.`
- **Cmd**: `show ip rip loops`
- **Read**:
  - `['Split Horizon', 'Never advertise a prefix back out the interface where it was learned']`
  - `['Route Poisoning', 'Immediately advertise a failed prefix with metric 16 (triggered update)']`
  - `['Poison Reverse', 'Echo metric 16 back to the sender to confirm dead-route withdrawal']`
  - `['Hold-Down Timer', 'Ignore stale updates for 180s after a route is poisoned to metric 16']`
- **Rem**: `Split Horizon, Route Poisoning (metric 16 triggered updates), Poison Reverse, and 180s Hold-Down timers prevent count-to-infinity loops in RIPv2.`

---

### Step 5: Recap · RIPv2 Summary
- **Group**: `Recap`
- **Chg**: `Stage 6 · Day 21 Summary: RIPv2 & Distance-Vector Routing.`
- **Title**: `RIPv2: Hop-count simplicity, 15-hop ceiling, and loop prevention`
- **What**:
  ```text
  You have completed Day 21 and traced the full behavior and failure modes of RIPv2 (RFC 2453):

  • Distance-Vector Updates: Routers exchange (prefix, metric) vectors over UDP port 520 (multicast 224.0.0.9) every 30 seconds and compute M + 1 via Bellman-Ford.
  • Hop Count & 15-Hop Limit: RIP ignores link bandwidth (preferring 2 hops at 10 Mbps over 3 hops at 10 Gbps) and treats metric 16 as unreachable (infinity).
  • Count-to-Infinity: Without loop safeguards, stale periodic updates after a link failure bounce packets R1 ↔ R2 while metrics climb to 16.
  • Loop Safeguards: Split Horizon, Route Poisoning (metric 16 triggered updates), Poison Reverse, and Hold-Down timers eliminate 2-node loops.

  In Day 22, we replace hop-count guesswork with OSPF—a link-state protocol where every router builds a complete topology map and computes bandwidth-aware shortest paths with Dijkstra's SPF algorithm.
  ```
- **Why**: Consolidates Day 21 distance-vector concepts and sets up the contrast with Day 22 Link-State (OSPF).
- **Pic**: `Full five-router topology showing RIPv2 limits (15 hops, bandwidth blindness) alongside active loop safeguards.`
- **Task**: `Review the Day 21 summary and proceed to Day 22 (OSPF: Sharing the Map) when ready.`
- **Cmd**: `null`
- **Read**:
  - `['Protocol', 'RIPv2 (RFC 2453), UDP port 520, multicast 224.0.0.9, AD 120']`
  - `['Metric & Ceiling', 'Hop count only (ignores bandwidth); max 15 hops, 16 = infinity']`
  - `['Failure Mode', 'Count-to-infinity routing loops from stale 30s periodic updates']`
  - `['Loop Safeguards', 'Split Horizon, Route Poisoning (16), Poison Reverse, 180s Hold-Down']`
- **Rem**: `RIPv2 is simple to configure for small 15-hop networks, but bandwidth blindness and slow periodic convergence motivate Link-State routing (OSPF) in Day 22.`

---

## 4. Static Terminal Responses & Aliases

### `staticResponses` Keys in `net-21.ts`
1. `'show ip rip'`:
   ```text
   RIPv2 Routing Process (RFC 2453) — Router R1
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
     10.21.0.0/24     [3]      10.21.13.2  eth1       08s  (suppressed: higher hop count via R3 -> R4 -> R5)
   ```
2. `'traceroute 10.21.0.10'`:
   ```text
   traceroute to 10.21.0.10 (10.21.0.10), 30 hops max, 60 byte packets
    1  R2 (10.21.12.2)   18.412 ms  18.109 ms  18.305 ms   [10 Mbps serial link]
    2  R5 (10.21.25.2)   37.890 ms  37.641 ms  37.712 ms   [10 Mbps serial link]
    3  10.21.0.10        38.104 ms  38.022 ms  38.089 ms   [Destination reached in 2 router hops]

   [RIPv2 Path Selection Note]
     Active FIB path : R1 -> R2 -> R5 (2 hops, 10 Mbps bottleneck)
     Ignored path    : R1 -> R3 -> R4 -> R5 (3 hops, 10 Gbps fiber)
     Reason          : RIPv2 ranks paths strictly by hop count (2 < 3), ignoring bandwidth.
     Max RIP hops    : 15 (Metric 16 = infinity / unreachable)
   ```
3. `'rip debug loop'`:
   ```text
   [EVENT t=000s] Physical link R2 <-> R5 (10.21.25.0/30) transitions to DOWN (NO-CARRIER)
   [EVENT t=001s] R2 removes direct route 10.21.0.0/24 (1 hop) from RIB
   [EVENT t=014s] R1 30s periodic timer fires -> sends stale update to R2: "10.21.0.0/24 metric 2"
   [LOOP  t=014s] R2 applies Bellman-Ford (2 + 1) -> installs 10.21.0.0/24 via R1 (metric 3)!
   [LOOP  t=044s] R1 receives R2 update (metric 3) -> updates R1 RIB to metric 4 via R2
   [LOOP  t=074s] R2 receives R1 update (metric 4) -> updates R2 RIB to metric 5 via R1
   ...
   [LOOP  t=404s] Metric reaches 16 (INFINITY) -> both routers finally mark 10.21.0.0/24 unreachable

   [Forwarding Plane Impact]
     Packets to 10.21.0.10 bounce R1 <-> R2 until IP TTL decrements from 64 to 0 (TTL Exceeded).
   ```
4. `'show ip rip loops'`:
   ```text
   RIPv2 Loop-Prevention Status — R1 & R2 (RFC 2453)
     Interface   Split Horizon   Poison Reverse   Hold-Down   Triggered Updates
     R1 eth0     ENABLED         ENABLED          180s        ENABLED
     R2 eth0     ENABLED         ENABLED          180s        ENABLED

   Simulated R2 <-> R5 Failure With Safeguards Active:
     1. Split Horizon : R1 blocks advertising 10.21.0.0/24 (learned on eth0) back out eth0 to R2.
     2. Route Poison  : R2 immediately sends triggered update: "10.21.0.0/24 metric 16 (infinity)".
     3. Poison Reverse: R1 flushes route via R2 and echoes metric 16 back to R2 on eth0.
     4. Hold-Down     : R1 & R2 suppress stale updates for 180s; R1 installs 3-hop path via R3 -> R4 -> R5.
   ```

### Workspace & Terminal Fuzzy Aliases (`NetworkingWorkspace.tsx` & `NetworkingTerminal.tsx`)
- **Step 0 (`show ip rip`)**:
  - Exact: `show ip rip`
  - Aliases: `show rip`, `ip rip`, `rip`, `show route rip`, `ip route show rip`
- **Step 1 (`traceroute 10.21.0.10`)**:
  - Exact: `traceroute 10.21.0.10`
  - Aliases: `traceroute`, `trace 10.21.0.10`, `mtr 10.21.0.10`, `traceroute 10.21.0.0`
- **Step 2 (`rip debug loop`)**:
  - Exact: `rip debug loop`
  - Aliases: `debug ip rip`, `debug rip`, `rip loop`, `count to infinity`
- **Step 3 (`show ip rip loops`)**:
  - Exact: `show ip rip loops`
  - Aliases: `show rip loops`, `split horizon`, `poison reverse`, `show ip rip database`

### Step-Specific Coaching Hints (Fallback in `NetworkingTerminal.tsx`)
- Step 0: `💡 Tip: Run "show ip rip" to inspect Router R1's RIPv2 table, UDP 520 multicast, and 30s/180s/240s timers.`
- Step 1: `💡 Tip: Run "traceroute 10.21.0.10" to see why RIP picks the 2-hop 10 Mbps path over the 3-hop 10 Gbps path.`
- Step 2: `💡 Tip: Run "rip debug loop" to observe how stale 30s updates cause R1 and R2 to count to infinity (16).`
- Step 3: `💡 Tip: Run "show ip rip loops" to verify Split Horizon, Route Poisoning (metric 16), and Hold-Down timers.`

---

## 5. Canvas Anti-Overlap Geometry & Layout (`Day21Canvas.tsx`)

### World Coordinate Space
- **ViewBox**: `0 0 1480 620`
- **`DAY_WORLD_SPECS['net-21']`**: `{ width: 1480, height: 620 }`

### Static Topology Coordinates (Guaranteed Anti-Overlap)
| Element | Type | `(x, y)` | Dimensions / Vertical Envelope | Clearance Notes |
|---|---|---|---|---|
| **R1** (Edge/Source) | `SvgRouter` | `(130, 210)` | `126×52` (`x: 130..256`, `y: 210..262`), port pills to `y: 298` | Left anchor router |
| **R2** (Upper 10 Mbps) | `SvgRouter` | `(677, 95)` | `126×52` (`x: 677..803`, `y: 95..147`), port pills to `y: 183` | Upper path (`2 hops`) |
| **R3** (Lower 10 Gbps) | `SvgRouter` | `(460, 260)` | `126×52` (`x: 460..586`, `y: 260..312`), port pills to `y: 348` | Lower path hop 1 |
| **R4** (Lower 10 Gbps) | `SvgRouter` | `(890, 260)` | `126×52` (`x: 890..1016`, `y: 260..312`), port pills to `y: 348` | Lower path hop 2 |
| **R5** (Dest Edge) | `SvgRouter` | `(1220, 210)` | `126×52` (`x: 1220..1346`, `y: 210..262`), port pills to `y: 298` | Right anchor router |
| **Dest Subnet Badge** | SVG pill | `(1213, 138)` | `140×28` (`x: 1213..1353`, `y: 138..166`) | `44px` clear above `R5` (`y=210`) |

### Horizontal & Diagonal Cable Spans
1. **R1 ↔ R2** (10 Mbps serial): `(256, 224)` to `(677, 121)` — horizontal span `421px`
2. **R2 ↔ R5** (10 Mbps serial): `(803, 121)` to `(1220, 224)` — horizontal span `417px`
3. **R1 ↔ R3** (10 Gbps fiber): `(256, 248)` to `(460, 286)` — horizontal span `204px`
4. **R3 ↔ R4** (10 Gbps fiber): `(586, 286)` to `(890, 286)` — horizontal span `304px` (any badge `width <= 130px` has `87px` clearance on each side, well above the `15px` minimum)
5. **R4 ↔ R5** (10 Gbps fiber): `(1016, 286)` to `(1220, 248)` — horizontal span `204px`

### Progressive Step Overlays (`y >= 395` Bottom HUD Zone)
All bottom HUD cards sit at `y = 395` (`height = 175`, `y: 395..570`), giving `47px` vertical clearance below `R3`/`R4` port pills (`y=348`) and `50px` above the `620px` bottom edge:
- **Step 0 (`show ip rip`)**:
  - `R1 → R2` & `R1 → R3` links glow cyan (`#06b6d4`) with animated RIPv2 `UDP:520` packet badges.
  - Bottom-Left Card (`x=70, y=395, w=630, h=175`): **RIPv2 Protocol Frame & Timers** (`UDP 520 · 224.0.0.9 · Update 30s / Invalid 180s / Flush 240s · AD 120`).
  - Bottom-Right Card (`x=780, y=395, w=630, h=175`): **R1 Distance-Vector RIB** (`10.21.0.0/24 via R2 metric 2` active vs `via R3 metric 3` suppressed).
- **Step 1 (`traceroute 10.21.0.10`)**:
  - Upper path (`R1 → R2 → R5`) glows amber/green (`#10b981`) as active 2-hop `10 Mbps` path; lower path (`R1 → R3 → R4 → R5`) stays dimmed (`10 Gbps` unused).
  - Bottom-Left Card (`x=70, y=395, w=630, h=175`): **Hop-Count Selection (2 < 3)** showing why `10 Mbps` beats `10 Gbps`.
  - Bottom-Right Card (`x=780, y=395, w=630, h=175`): **15-Hop Ceiling (Metric 16 = Infinity)**.
- **Step 2 (`rip debug loop`)**:
  - `R2 ↔ R5` cable turns `#ef4444` (`isTransmitting={false}` — note: `SvgCable` does NOT take `isLinkUp`) with `LINK DOWN (NO-CARRIER)` badge at `x=950, y=118`.
  - Staggered loop callouts on `R1 ↔ R2`:
    - Top badge (`x=330, y=108, w=190, h=28`): `R1 → R2: 10.21.0.0/24 = 2`
    - Lower badge (`x=435, y=158, w=205, h=28`): `R2 ↔ R1: 3 → 4 → ... → 16` (`50px` vertical stagger, `>= 25px` required).
  - Bottom-Left Card (`x=70, y=395, w=630, h=175`): **Count-to-Infinity Sequence (`t=0s..404s`)**.
  - Bottom-Right Card (`x=780, y=395, w=630, h=175`): **Data Plane Loop (`R1 ↔ R2` until IP TTL = 0)**.
- **Step 3 (`show ip rip loops`)**:
  - `R2 ↔ R5` stays `#ef4444` (`LINK DOWN`), while `R1 → R3 → R4 → R5` glows emerald (`#10b981`) as the newly converged 3-hop `10 Gbps` path!
  - Staggered safeguard badges:
    - `SPLIT HORIZON: eth0 blocked` at `x=105, y=148`
    - `POISON: 10.21.0.0/24 = 16` at `x=365, y=118` (`30px` vertical stagger).
  - Bottom-Left Card (`x=70, y=395, w=630, h=175`): **Split Horizon + Route Poisoning / Poison Reverse**.
  - Bottom-Right Card (`x=780, y=395, w=630, h=175`): **180s Hold-Down & Failover to 3-Hop Fiber Path**.
- **Step 4 (Recap)**:
  - Bottom-Left Card (`x=70, y=395, w=630, h=175`): **RIPv2 Core Rules (UDP 520 · 15-Hop Max)**.
  - Bottom-Right Card (`x=780, y=395, w=630, h=175`): **Why Day 22 Moves to OSPF (Link-State)**.

---

## 6. Verification Checklist
- [ ] `src/content/networking/modules/net-21.ts` authored with zero metaphors/analogies, `\n\n` paragraphs, `•` bullets, 4 `read` pairs per step, and `cmd: null` on Recap.
- [ ] `src/content/networking/index.ts` exports and registers `NET_21_MODULE`.
- [ ] `NetworkingHomePage.tsx` includes `'net-21'` teaser in `MODULE_TEASERS`.
- [ ] `src/components/learning/networking/canvas/days/Day21Canvas.tsx` implements `1480×620` topology with `y >= 395` HUD cards and `>= 25px` alert stagger, registered in `DAY_WORLD_SPECS` and `DAY_CANVAS_MAP`.
- [ ] `NetworkingWorkspace.tsx` and `NetworkingTerminal.tsx` wire all `net-21` commands, aliases, help text, and step-specific tips.
- [ ] `tests/curriculum/networking-curriculum.test.ts`, `tests/ui/networking-canvas.test.tsx`, `tests/ui/networking-homepage.test.tsx`, and `tests/ui/networking-workspace.test.tsx` updated and passing.
- [ ] Full Vitest networking suite and `npx tsc --noEmit` pass with 0 errors.
