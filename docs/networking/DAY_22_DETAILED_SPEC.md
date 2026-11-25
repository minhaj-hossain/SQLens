# SQLens Networking Track — Day 22 Detailed Specification
## Stage 6: Dynamic Routing (Days 20–23) · Sharing the Map & Convergence
### Module: `net-22` · OSPF: Sharing the Map (Link-State, LSAs, Area 0 & Dijkstra SPF)

---

## 1. Pedagogical Intent & Objectives

### Context & Learning Progression
- **Day 21 (`net-21` — RIP: Counting Hops)**: Covered RIPv2 distance-vector mechanics, showing why hop count ignores link bandwidth (picking a 2-hop `10 Mbps` path over a 3-hop `10 Gbps` fiber path), caps networks at 15 hops, and suffers count-to-infinity loops without safeguards.
- **Day 22 (This Module — `net-22`)**: Introduces **OSPFv2 (Open Shortest Path First version 2, RFC 2328)**, the standard link-state Interior Gateway Protocol (IGP) with Administrative Distance **110**. Students learn how OSPF replaces neighbor hop-count guessing with a synchronized topology graph:
  - **Hello Protocol & Area 0 Adjacency**: OSPF runs directly over **IP protocol number 89** (using multicast `224.0.0.5` AllSPFRouters), discovers neighbors via `10s` Hello / `40s` Dead timers, and forms `FULL` adjacencies inside **Area 0 (`0.0.0.0`, the Backbone Area)**.
  - **Link-State Advertisements (LSAs) & LSDB**: Instead of exchanging routing tables, each router floods **Type-1 Router LSAs** describing its own interfaces and link costs. Every router in Area 0 builds an **identical Link-State Database (LSDB)** graph.
  - **Bandwidth-Aware Cost Metric**: OSPF ranks paths using **Cost = Reference Bandwidth / Interface Bandwidth**. With a `10,000 Mbps` (`10 Gbps`) reference bandwidth, `10 Gbps` links cost `1` while `10 Mbps` links cost `1000`, immediately preferring the fast 3-hop fiber path (`Cost 3`) over the slow 2-hop serial path (`Cost 2000`).
  - **Dijkstra's SPF Algorithm**: Each router runs **Dijkstra's Shortest Path First (SPF)** locally on the synchronized LSDB with itself as root, producing a **loop-free Shortest-Path Tree (SPT)** with no 15-hop limit and no count-to-infinity loops.

### Key Pedagogical Constraints
- **Zero Analogies Policy**:
  - STRICTLY FORBIDDEN: Metaphors (no road maps, GPS, street signs, puzzle pieces, town criers, blueprints, highways).
  - MANDATORY: Exact physical & digital realities: OSPFv2 (RFC 2328), IP protocol `89`, multicast `224.0.0.5`, Router ID (RID), `10s` Hello / `40s` Dead intervals, `FULL` neighbor state, Area `0.0.0.0` (Backbone), Type-1 Router LSA, Link-State Database (LSDB), Reference Bandwidth / Interface Bandwidth cost formula, Dijkstra SPF algorithm, Shortest-Path Tree (SPT), and Administrative Distance `110`.
- **Taught Before Tested**:
  - Motivate and define IP protocol `89`, `224.0.0.5`, Router ID, `10s`/`40s` Hello/Dead timers, `FULL` adjacency, and Area `0.0.0.0` before running `show ip ospf neighbor`.
  - Explain Type-1 Router LSAs, event-driven flooding, and LSDB synchronization before running `show ip ospf database`.
  - Derive the `Cost = Reference Bandwidth / Interface Bandwidth` formula (`10,000 Mbps` reference) before running `show ip ospf cost`.
  - Explain Dijkstra's SPF tree calculation and loop-free FIB installation before running `traceroute 10.22.0.10`.
- **Task Hint Policy**: Omit `(tap it to fill the terminal).` and end all task instructions with a clean period.

---

## 2. Module Identity & Metadata

```typescript
export const NET_22_MODULE: NetworkingModule = {
  id: 'net-22',
  dayNumber: 22,
  title: 'Day 22 · OSPF: Sharing the Map',
  shortTitle: 'OSPF: Sharing the Map',
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

### Step 1: Idea 1 of 4 · Link-state & Area 0 adjacency
- **Group**: `Idea 1 of 4 · Link-state & Area 0 adjacency`
- **Chg**: `Since Day 21: RIPv2 showed two major limits—it ignores link bandwidth and trusts neighbor hop counts blindly. Today we switch to OSPFv2 (RFC 2328, AD 110), a link-state IGP where routers share exact interface topologies.`
- **Title**: `Forming FULL neighbor adjacencies in Area 0 over IP protocol 89`
- **What**:
  ```text
  In a link-state protocol, routers do not exchange computed routing tables. Instead, every router first discovers its directly connected neighbors and establishes bidirectional adjacencies inside an OSPF Area.

  OSPFv2 (RFC 2328) starts with four foundational elements:

  • IP Protocol 89: OSPF does not use UDP or TCP. Its packets are encapsulated directly inside IPv4 with protocol number 89, addressed to multicast 224.0.0.5 (AllSPFRouters).
  • Router ID (RID): Every OSPF router is identified by a unique 32-bit ID in IPv4 format (for example, R1 = 1.1.1.1, R2 = 2.2.2.2).
  • Area 0 (0.0.0.0 — Backbone Area): OSPF groups routers into logical areas to bound flooding. Every OSPF domain centers on Area 0, and all routers in an area synchronize the same topology database.
  • Hello & Dead Timers: Routers send Hello packets every 10 seconds. If matching parameters (Area ID, subnet mask, Hello/Dead timers) align, neighbors synchronize databases and reach the FULL state. If no Hello arrives for 40 seconds (Dead interval), the neighbor is declared down.

  Let’s inspect Router R1's OSPF neighbor adjacencies in Area 0.
  ```
- **Why**: Establishes OSPF's wire transport (IP proto 89), identity (RID), hierarchy (Area 0), and liveness timers (`10s`/`40s`) before introducing LSAs.
- **Pic**: `Five-router Area 0 (0.0.0.0) domain showing R1 forming FULL OSPF adjacencies with R2 and R3 using IP protocol 89 Hello packets.`
- **Task**: `Inspect Router R1's OSPF neighbor table and Area 0 adjacency states using show ip ospf neighbor.`
- **Cmd**: `show ip ospf neighbor`
- **Read**:
  - `['Transport', 'IP protocol 89 (direct over IPv4, multicast 224.0.0.5 — no UDP/TCP)']`
  - `['Router ID (RID)', 'Unique 32-bit router identifier (e.g., 1.1.1.1 for R1)']`
  - `['Area 0 (0.0.0.0)', 'Core backbone area where all routers hold an identical topology database']`
  - `['Hello / Dead', '10s Hello interval and 40s Dead timer; healthy peers reach FULL state']`
- **Rem**: `OSPFv2 routers discover peers via 10s Hello packets over IP protocol 89 (224.0.0.5) and form FULL adjacencies inside Area 0.`

---

### Step 2: Idea 2 of 4 · Flooding LSAs & the LSDB
- **Group**: `Idea 2 of 4 · Flooding LSAs & the LSDB`
- **Chg**: `Once R1 reaches FULL adjacency with R2 and R3 in Area 0, the routers do not send routing tables—they flood raw link descriptions to build a shared graph.`
- **Title**: `Synchronizing the Link-State Database (LSDB) with Type-1 LSAs`
- **What**:
  ```text
  In RIP, a router only knows what its neighbor tells it about hop counts. In OSPF, every router describes its own directly attached links in a Link-State Advertisement (LSA) and floods it across Area 0:

  • Type-1 Router LSA: Each router originates one Router LSA containing its Router ID, every connected subnet prefix, its neighbor Router IDs, and the cost of each outgoing interface.
  • Reliable Event-Driven Flooding: When a link comes up or goes down, the router immediately floods an updated LSA (acknowledged via Link-State Ack packets) instead of waiting for a 30-second periodic timer.
  • Identical LSDB Graph: Once flooding settles, R1, R2, R3, R4, and R5 all hold the exact same Link-State Database (LSDB)—a complete node-and-edge graph of Area 0.

  Let’s inspect the synchronized Area 0 Link-State Database on Router R1.
  ```
- **Why**: Clarifies the fundamental architectural shift from Distance-Vector (neighbor vectors) to Link-State (synchronized LSDB graph via LSAs).
- **Pic**: `R1–R5 exchanging Type-1 Router LSAs across Area 0 so every router holds an identical 5-node LSDB graph.`
- **Task**: `Inspect R1's synchronized Area 0 Link-State Database using show ip ospf database.`
- **Cmd**: `show ip ospf database`
- **Read**:
  - `['Type-1 Router LSA', 'Generated by each router to list its own interfaces, neighbors, and costs']`
  - `['LSDB Sync', 'Every router in Area 0 stores the exact same topology graph']`
  - `['Event-Driven', 'LSAs flood immediately upon link change (plus 1800s safety refresh)']`
  - `['Vs. RIPv2', 'No blind 30s table dumps; every router sees the entire Area 0 graph']`
- **Rem**: `Each OSPF router floods Type-1 Router LSAs across Area 0 until every router holds an identical Link-State Database (LSDB).`

---

### Step 3: Idea 3 of 4 · Bandwidth-aware link cost
- **Group**: `Idea 3 of 4 · Bandwidth-aware link cost`
- **Chg**: `In Day 21, RIP chose a slow 10 Mbps 2-hop path over a 10 Gbps 3-hop path. Now let's see how OSPF's Cost metric fixes bandwidth blindness.`
- **Title**: `Computing interface cost from link bandwidth (Cost = Ref / BW)`
- **What**:
  ```text
  OSPF replaces hop count with a bandwidth-aware Cost metric on every interface:

  • Cost Formula: Cost = Reference Bandwidth / Interface Bandwidth.
  • Modern Reference Bandwidth: Legacy RFC 2328 defaulted to 100 Mbps (where 100 Mbps, 1 Gbps, and 10 Gbps all clamped to Cost 1). Enterprise networks set Reference Bandwidth to 10,000 Mbps (10 Gbps) so high-speed links are distinguished accurately:
    - 10 Gbps fiber link  → 10,000 / 10,000 = Cost 1
    - 1 Gbps Ethernet     → 10,000 / 1,000  = Cost 10
    - 100 Mbps FastEth    → 10,000 / 100    = Cost 100
    - 10 Mbps serial link → 10,000 / 10     = Cost 1000
  • Total Path Cost Comparison to 10.22.0.0/24:
    - Upper Path (R1 → R2 → R5, two 10 Mbps links): 1000 + 1000 = Cost 2000.
    - Lower Path (R1 → R3 → R4 → R5, three 10 Gbps links): 1 + 1 + 1 = Cost 3.

  Let’s inspect the OSPF interface costs configured across R1's paths.
  ```
- **Why**: Directly resolves Day 21's bandwidth-blindness problem using exact division arithmetic.
- **Pic**: `Upper 10 Mbps links labeled Cost 1000 each (total 2000) vs Lower 10 Gbps links labeled Cost 1 each (total 3).`
- **Task**: `Inspect OSPF interface bandwidths and computed path costs using show ip ospf cost.`
- **Cmd**: `show ip ospf cost`
- **Read**:
  - `['Cost Formula', 'Interface Cost = Reference Bandwidth / Interface Bandwidth']`
  - `['10 Gbps Fiber', '10,000 / 10,000 = Cost 1 per hop (3 hops = total Cost 3)']`
  - `['10 Mbps Serial', '10,000 / 10 = Cost 1000 per hop (2 hops = total Cost 2000)']`
  - `['Path Winner', 'OSPF prefers Lower Path (Cost 3) over Upper Path (Cost 2000)']`
- **Rem**: `OSPF calculates Cost = Reference Bandwidth / Interface Bandwidth, choosing the 10 Gbps 3-hop path (Cost 3) over the 10 Mbps 2-hop path (Cost 2000).`

---

### Step 4: Idea 4 of 4 · Dijkstra's SPF tree & loop-free FIB
- **Group**: `Idea 4 of 4 · Dijkstra's SPF tree & loop-free FIB`
- **Chg**: `Every router in Area 0 now holds the same LSDB graph weighted by bandwidth cost. Next, each router computes its own forwarding table independently.`
- **Title**: `Running Dijkstra's SPF algorithm for loop-free shortest paths`
- **What**:
  ```text
  With the Area 0 LSDB complete, every router independently executes Dijkstra's Shortest Path First (SPF) algorithm with itself as the root node:

  • Shortest-Path Tree (SPT): Starting from R1 (1.1.1.1, cost 0), Dijkstra expands the lowest cumulative cost edges outward until it reaches every prefix in Area 0, building a cycle-free tree.
  • FIB Installation (AD 110): R1 installs the winning next-hop (R3, cumulative Cost 3) for 10.22.0.0/24 into its RIB/FIB with Administrative Distance 110 (beating RIP's AD 120).
  • Why OSPF Avoids RIP's Limits:
    - No 15-Hop Ceiling: SPF uses cumulative 32-bit interface costs, supporting hundreds of hops.
    - No Count-to-Infinity Loops: Because every router computes its SPT from the exact same LSDB graph, routing decisions stay mathematically consistent without neighbor-echo loops.

  Let’s trace a packet from R1 to 10.22.0.10 to verify the SPF-selected 10 Gbps path.
  ```
- **Why**: Connects the LSDB and Cost metric to the actual packet-forwarding outcome (`R1 → R3 → R4 → R5`) and closes the contrast with Day 21.
- **Pic**: `R1's Dijkstra SPF tree highlighting the Cost 3 lower fiber path (R1 -> R3 -> R4 -> R5) as the active FIB route.`
- **Task**: `Trace the SPF-computed path from R1 to 10.22.0.10 using traceroute 10.22.0.10.`
- **Cmd**: `traceroute 10.22.0.10`
- **Read**:
  - `['Dijkstra SPF', 'Computes a loop-free Shortest-Path Tree from the local router as root']`
  - `['Active Path', 'R1 → R3 → R4 → R5 (3 hops, 10 Gbps fiber, total OSPF Cost 3)']`
  - `['No 15-Hop Cap', 'Uses cumulative bandwidth cost instead of a 15-hop ceiling']`
  - `['Loop Immunity', 'Identical LSDB across Area 0 prevents count-to-infinity loops']`
- **Rem**: `Dijkstra's SPF algorithm builds a loop-free Shortest-Path Tree from the synchronized Area 0 LSDB, routing traffic over the Cost 3 10 Gbps fiber path.`

---

### Step 5: Recap · OSPF Summary
- **Group**: `Recap`
- **Chg**: `Stage 6 · Day 22 Summary: OSPFv2 Link-State Routing.`
- **Title**: `OSPFv2: Synchronized LSDB, bandwidth cost, and Dijkstra SPF`
- **What**:
  ```text
  You have completed Day 22 and traced how OSPFv2 (RFC 2328) solves the limitations of RIPv2:

  • Area 0 Adjacencies: Routers exchange 10s Hello packets over IP protocol 89 (224.0.0.5) to reach FULL adjacency in Area 0 (0.0.0.0).
  • LSAs & Shared LSDB: Every router floods Type-1 Router LSAs so all Area 0 routers hold an identical topology graph.
  • Bandwidth Cost: Cost = Reference Bandwidth / Interface Bandwidth (10,000 Mbps ref gives 10 Gbps = 1 vs 10 Mbps = 1000).
  • Dijkstra SPF: Each router computes a cycle-free Shortest-Path Tree independently—no 15-hop limit and no count-to-infinity loops.

  In Day 23 (Stage 6 Finale), we will put OSPF under stress by cutting a live 10 Gbps link and measuring real-time failure detection and convergence timers.
  ```
- **Why**: Consolidates Day 22 link-state concepts and bridges directly to Day 23 (Failover and Convergence).
- **Pic**: `Complete Area 0 topology showing OSPF Cost 3 fiber path active and Day 23 failover preview.`
- **Task**: `Review the Day 22 summary and proceed to Day 23 (Failover and Convergence) when ready.`
- **Cmd**: `null`
- **Read**:
  - `['Protocol', 'OSPFv2 (RFC 2328), IP protocol 89, multicast 224.0.0.5, AD 110']`
  - `['Topology Sync', 'Type-1 Router LSAs build an identical Area 0 LSDB on every router']`
  - `['Metric', 'Cost = Reference BW / Interface BW (10 Gbps = 1, 10 Mbps = 1000)']`
  - `['Path Algorithm', 'Dijkstra SPF produces loop-free trees with no 15-hop ceiling']`
- **Rem**: `OSPFv2 replaces hop-count guessing with a synchronized Area 0 LSDB, bandwidth-based Cost, and Dijkstra's SPF algorithm—setting up Day 23 convergence testing.`

---

## 4. Static Terminal Responses & Aliases

### `staticResponses` Keys in `net-22.ts`
1. `'show ip ospf neighbor'`:
   ```text
   OSPFv2 Process 1 (RFC 2328) — Router ID 1.1.1.1 (R1) | Area 0.0.0.0
     Transport : IP Protocol 89 | Multicast: 224.0.0.5 (AllSPFRouters) | AD: 110
     Timers    : Hello 10s | Dead 40s

   Neighbor ID     Pri   State           Dead Time   Address         Interface
   2.2.2.2 (R2)      1   FULL/  -        00:00:34    10.22.12.2      eth0
   3.3.3.3 (R3)      1   FULL/  -        00:00:37    10.22.13.2      eth1
   ```
2. `'show ip ospf database'`:
   ```text
   OSPF Router with ID (1.1.1.1) (Process ID 1)

                   Router Link States (Area 0.0.0.0)

   Link ID         ADV Router      Age         Seq#       Checksum Link count
   1.1.1.1 (R1)    1.1.1.1         42          0x80000004 0x004a1c 2
   2.2.2.2 (R2)    2.2.2.2         39          0x80000003 0x0091b2 2
   3.3.3.3 (R3)    3.3.3.3         41          0x80000005 0x00c308 2
   4.4.4.4 (R4)    4.4.4.4         36          0x80000003 0x007f41 2
   5.5.5.5 (R5)    5.5.5.5         35          0x80000004 0x00e819 3

   [LSDB Sync Status]
     All 5 routers in Area 0.0.0.0 hold the identical 5-node Link-State Database.
   ```
3. `'show ip ospf cost'`:
   ```text
   OSPFv2 Interface Cost Table (Reference Bandwidth = 10,000 Mbps / 10 Gbps)
     Link / Segment       Speed       Formula                  Cost
     R1 <-> R2 (eth0)     10 Mbps     10,000 / 10              1000
     R2 <-> R5            10 Mbps     10,000 / 10              1000
     R1 <-> R3 (eth1)     10 Gbps     10,000 / 10,000             1
     R3 <-> R4            10 Gbps     10,000 / 10,000             1
     R4 <-> R5            10 Gbps     10,000 / 10,000             1

   Candidate Paths to 10.22.0.0/24 (behind R5):
     Upper Path (R1 -> R2 -> R5)      : 1000 + 1000 = Cost 2000  [BACKUP]
     Lower Path (R1 -> R3 -> R4 -> R5): 1 + 1 + 1   = Cost 3     [SPF WINNER]
   ```
4. `'traceroute 10.22.0.10'`:
   ```text
   traceroute to 10.22.0.10 (10.22.0.10), 30 hops max, 60 byte packets
    1  R3 (10.22.13.2)   0.412 ms  0.389 ms  0.401 ms   [10 Gbps fiber | Cost 1]
    2  R4 (10.22.34.2)   0.834 ms  0.811 ms  0.822 ms   [10 Gbps fiber | Cost 1]
    3  R5 (10.22.45.2)   1.245 ms  1.219 ms  1.230 ms   [10 Gbps fiber | Cost 1]
    4  10.22.0.10        1.390 ms  1.365 ms  1.378 ms   [Destination reached | Total Cost 3]

   [Dijkstra SPF & FIB Summary]
     Installed route : 10.22.0.0/24 via 10.22.13.2 (eth1, R3) | OSPF AD 110 | Cost 3
     Why it beat RIP : RIPv2 picked 2-hop 10 Mbps (38 ms RTT); OSPF picked 3-hop 10 Gbps (1.4 ms RTT).
   ```

### Workspace & Terminal Fuzzy Aliases (`NetworkingWorkspace.tsx` & `NetworkingTerminal.tsx`)
- **Step 0 (`show ip ospf neighbor`)**: `show ip ospf neighbor`, `show ospf neighbor`, `ospf neighbor`, `show ip ospf`
- **Step 1 (`show ip ospf database`)**: `show ip ospf database`, `show ospf database`, `ospf database`, `show lsdb`
- **Step 2 (`show ip ospf cost`)**: `show ip ospf cost`, `show ospf cost`, `show ip ospf interface`, `ospf cost`
- **Step 3 (`traceroute 10.22.0.10`)**: `traceroute 10.22.0.10`, `traceroute`, `trace 10.22.0.10`, `show ip route ospf`

---

## 5. Canvas Anti-Overlap Geometry & Layout (`Day22Canvas.tsx`)

### World Coordinate Space
- **ViewBox**: `0 0 1480 620`
- **`DAY_WORLD_SPECS['net-22']`**: `{ width: 1480, height: 620 }`

### Static Topology Coordinates (Guaranteed Anti-Overlap)
- **Area 0 (0.0.0.0) Boundary**: `x=60, y=50, width=1360, height=335` (clears top title at `y=18..40` and bottom HUD cards at `y=395`).
- **Area 0 Label Pill**: `x=75, y=58, width=240, height=18` (`AREA 0.0.0.0 · OSPF BACKBONE`)
- **Devices**:
  - `R1 (RID 1.1.1.1)`: `(130, 210)` (`port1Ip="10.22.12.1/30"`, `port2Ip="10.22.13.1/30"`)
  - `R2 (RID 2.2.2.2)`: `(677, 95)` (`port1Ip="10.22.12.2/30"`, `port2Ip="10.22.25.1/30"`)
  - `R3 (RID 3.3.3.3)`: `(460, 260)` (`port1Ip="10.22.13.2/30"`, `port2Ip="10.22.34.1/30"`)
  - `R4 (RID 4.4.4.4)`: `(890, 260)` (`port1Ip="10.22.34.2/30"`, `port2Ip="10.22.45.1/30"`)
  - `R5 (RID 5.5.5.5)`: `(1220, 210)` (`port1Ip="10.22.25.2/30"`, `port2Ip="10.22.0.1/24"`)
  - `10.22.0.0/24 LAN` pill: `(1213, 138)`, `140×28` (`44px` above `R5`)
- **Cable Span & Badges**:
  - `R3 ↔ R4` (`x1=586` to `x2=890`, span `304px`): badge `width="130"` at `translate(673, 273)` (`87px` clear on both sides).
  - Step 2 cost callouts:
    - Upper path cost badge: `translate(405, 58)` (`width=155, height=22`) -> `UPPER: 10 Mbps · COST 1000`
    - Lower path cost badge: `translate(668, 240)` (`width=145, height=22`) -> `LOWER: 10 Gbps · COST 1`
- **Bottom HUD Cards (`y=395`, `height=175`, `47px` clear below `R3`/`R4` port pills at `y=348`)**:
  - Left Card: `translate(70, 395)`, `630×175`
  - Right Card: `translate(780, 395)`, `630×175`

---

## 6. Verification Checklist
- [ ] `src/content/networking/modules/net-22.ts` authored and registered in `src/content/networking/index.ts`.
- [ ] `NetworkingHomePage.tsx` includes `'net-22'` teaser in `MODULE_TEASERS`.
- [ ] `src/components/learning/networking/canvas/days/Day22Canvas.tsx` created and registered in `DAY_WORLD_SPECS` and `DAY_CANVAS_MAP`.
- [ ] `NetworkingWorkspace.tsx` and `NetworkingTerminal.tsx` wire `net-22` commands, aliases, and `help`.
- [ ] `tests/curriculum/networking-curriculum.test.ts`, `tests/ui/networking-canvas.test.tsx`, and `tests/ui/networking-homepage.test.tsx` (`22 Days Live`) updated and passing with `npx tsc --noEmit`.
