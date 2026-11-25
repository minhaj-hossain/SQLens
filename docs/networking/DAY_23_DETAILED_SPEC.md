# SQLens Networking Track — Day 23 Detailed Specification
## Stage 6: Dynamic Routing (Days 20–23) · Sharing the Map & Convergence
### Module: `net-23` · Failover and Convergence (Link Failure Detection, SPF Rerun & BFD)

---

## 1. Pedagogical Intent & Objectives

### Context & Learning Progression
- **Day 22 (`net-22` — OSPF: Sharing the Map)**: Established OSPFv2 (RFC 2328) Area 0 `FULL` adjacencies, Type-1 Router LSAs, synchronized LSDBs, bandwidth-aware Cost (`10 Gbps = 1`, `10 Mbps = 1000`), and Dijkstra's SPF selecting the Cost `3` `R1 → R3 → R4 → R5` fiber path.
- **Day 23 (This Module — Stage 6 Finale, `net-23`)**: Puts the converged Area 0 OSPF network under a live link failure (`R3 ↔ R4` fiber cut) and measures **Convergence Time** end-to-end:
  - **Failure Detection**: Contrast immediate physical `NO-CARRIER` detection (`< 10 ms`) with silent/indirect failures that stall for the **40-second OSPF Dead Timer** (`4 × 10s` Hellos).
  - **LSA Re-Flooding & SPF Rerun**: `R3` and `R4` increment their Type-1 Router LSA sequence numbers (`0x80000005 → 0x80000006`) without the dead link and flood them across Area 0; `R1` updates its LSDB and runs Dijkstra SPF to install `R1 → R2 → R5` (Cost `2000`).
  - **Convergence Time & FIB Failover**: Define **Convergence Time** (`Detection + LSA Flood + SPF Calculation + FIB Update`) and verify packet delivery over the redundant backup path.
  - **Sub-Second Detection with BFD (RFC 5880)**: Introduce **Bidirectional Forwarding Detection (BFD)** over **UDP port 3784** (`5 ms` interval × `3` multiplier = `15 ms` failure detection) to eliminate the 40-second Dead Timer bottleneck.

### Key Pedagogical Constraints
- **Zero Analogies Policy**:
  - STRICTLY FORBIDDEN: Metaphors (no detours, traffic jams, roadblocks, heartbeats, emergency sirens, backup highways).
  - MANDATORY: Exact physical & digital realities: `NO-CARRIER` loss-of-signal, OSPF `10s` Hello / `40s` Dead timers, Type-1 Router LSA sequence number increment, LSDB synchronization, SPF throttle delay, Dijkstra SPF recalculation, FIB update, Convergence Time, and BFD (RFC 5880, UDP port `3784`, `5 ms` tx/rx, `3×` multiplier = `15 ms`).
- **Taught Before Tested**:
  - Explain direct `NO-CARRIER` vs indirect `40s` Dead Timer detection before running `link cut r3-r4`.
  - Explain Type-1 LSA sequence increments and SPF recalculation before running `show ip ospf spf`.
  - Define Convergence Time and FIB failover before running `traceroute 10.23.0.10`.
  - Define BFD (RFC 5880, UDP `3784`, `5 ms × 3 = 15 ms`) before running `show bfd neighbors`.
- **Task Hint Policy**: Omit `(tap it to fill the terminal).` and end all task instructions with a clean period.

---

## 2. Module Identity & Metadata

```typescript
export const NET_23_MODULE: NetworkingModule = {
  id: 'net-23',
  dayNumber: 23,
  title: 'Day 23 · Failover and Convergence',
  shortTitle: 'Failover & Convergence',
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

### Step 1: Idea 1 of 4 · Link failure detection & Dead timers
- **Group**: `Idea 1 of 4 · Link failure detection & Dead timers`
- **Chg**: `Since Day 22: OSPF chose the Cost 3 10 Gbps path (R1 → R3 → R4 → R5) for 10.23.0.0/24. Now we cut the R3–R4 fiber link to measure how quickly routers detect the failure.`
- **Title**: `Physical NO-CARRIER loss vs. the 40-second OSPF Dead timer`
- **What**:
  ```text
  Before a routing protocol can reroute around a broken cable, at least one router must detect that the link failed. Detection speed depends on how the failure occurs:

  • Direct Physical Loss (NO-CARRIER): When a fiber cable between R3 and R4 is severed directly, the optical transceivers lose light immediately. The kernel transitions eth1 to DOWN (NO-CARRIER) in under 10 milliseconds and notifies OSPF at once.
  • Indirect / Silent Failure (40s Dead Timer): If an intermediate Layer 2 switch or optical transport fails silently, R3's physical port stays UP. OSPF must wait for 4 missed Hello packets (4 × 10s = 40 seconds) before declaring R4 DEAD.

  Let’s sever the 10 Gbps fiber link between R3 and R4 and inspect the failure detection event.
  ```
- **Why**: Establishes that failure detection—not routing computation—is often the largest component of convergence delay.
- **Pic**: `Area 0 topology with R3 <-> R4 fiber link transitioning to DOWN (NO-CARRIER).`
- **Task**: `Simulate a fiber cut between R3 and R4 and inspect the failure event using link cut r3-r4.`
- **Cmd**: `link cut r3-r4`
- **Read**:
  - `['Direct Failure', 'Optical NO-CARRIER detected by kernel in < 10 ms']`
  - `['Silent Failure', 'Port stays UP; OSPF waits 40s (4 × 10s Hello) Dead interval']`
  - `['Affected Link', 'R3 (3.3.3.3) <-> R4 (4.4.4.4) Cost 1 fiber link removed']`
  - `['Next Phase', 'R3 and R4 must now flood updated LSAs across Area 0']`
- **Rem**: `Direct physical cuts trigger immediate NO-CARRIER detection (< 10 ms), whereas silent intermediate failures wait up to 40 seconds for the OSPF Dead timer.`

---

### Step 2: Idea 2 of 4 · LSA re-flooding & SPF recalculation
- **Group**: `Idea 2 of 4 · LSA re-flooding & SPF recalculation`
- **Chg**: `R3 and R4 have detected that their 10 Gbps link is DOWN. Now OSPF must synchronize the updated topology across Area 0 and recompute shortest paths.`
- **Title**: `Flooding updated Type-1 LSAs and rerunning Dijkstra SPF`
- **What**:
  ```text
  The instant R3 and R4 remove the dead link, OSPF executes three automated control-plane steps:

  • LSA Sequence Increment: R3 (3.3.3.3) and R4 (4.4.4.4) generate new Type-1 Router LSAs with an incremented sequence number (0x80000005 → 0x80000006) omitting the R3–R4 edge.
  • Area 0 Flooding: R3 floods its updated LSA to R1 over 224.0.0.5; R4 floods its updated LSA to R5. Every router updates its Link-State Database (LSDB) within milliseconds.
  • SPF Recalculation: After a brief SPF throttle delay (50 ms) to batch simultaneous link flaps, R1 runs Dijkstra's SPF against the new LSDB. With Cost 3 unavailable, R1 computes the redundant backup path: R1 → R2 → R5 (Cost 2000).

  Let’s inspect R1's LSA sequence update and SPF recalculation log.
  ```
- **Why**: Shows the exact event-driven control-plane sequence (LSA seq++ → LSDB update → SPF rerun) that replaces RIP's slow 30-second periodic timers.
- **Pic**: `R3 flooding Type-1 LSA (Seq 0x80000006) to R1, triggering Dijkstra SPF recalculation onto R1 -> R2 -> R5 (Cost 2000).`
- **Task**: `Inspect R1's LSA update and Dijkstra SPF run log using show ip ospf spf.`
- **Cmd**: `show ip ospf spf`
- **Read**:
  - `['LSA Seq++', 'R3 & R4 increment Router LSA sequence (0x80000005 → 0x80000006)']`
  - `['LSDB Update', 'All Area 0 routers remove the R3–R4 edge from their graph']`
  - `['SPF Throttle', '50 ms batching delay prevents CPU thrashing during link flaps']`
  - `['New SPF Winner', 'R1 → R2 → R5 (Cost 2000) promoted from backup to active']`
- **Rem**: `Updated Type-1 LSAs flood immediately across Area 0, allowing every router to rerun Dijkstra SPF and select the backup Cost 2000 path.`

---

### Step 3: Idea 3 of 4 · FIB failover & convergence time
- **Group**: `Idea 3 of 4 · FIB failover & convergence time`
- **Chg**: `R1's control plane has computed the new Shortest-Path Tree via R2. Now R1 updates its hardware Forwarding Information Base (FIB) and completes convergence.`
- **Title**: `Measuring total convergence time and verifying FIB failover`
- **What**:
  ```text
  Convergence Time is the total elapsed duration from link failure until every router in the network has updated its Forwarding Information Base (FIB) and resumed loop-free delivery:

  • Convergence Breakdown (Direct NO-CARRIER):
    - Link Detection :   8 ms (kernel NO-CARRIER)
    - LSA Flooding   :  12 ms (R3 → R1 LSDB sync)
    - SPF Rerun      :  54 ms (50 ms throttle + 4 ms Dijkstra)
    - FIB Install    :  11 ms (kernel route swap to eth0 via R2)
    - Total          : ~85 ms (sub-100 ms failover!)
  • Why OSPF Beats RIPv2: RIPv2 required up to 180–240 seconds (or risked count-to-infinity loops), whereas OSPF converges deterministically in milliseconds on direct cuts.

  Let’s trace a packet from R1 to 10.23.0.10 to verify traffic is flowing cleanly over the failover path.
  ```
- **Why**: Quantifies convergence as a measurable engineering budget (`Detection + Flood + SPF + FIB`) and demonstrates live failover.
- **Pic**: `Active traffic flowing over R1 -> R2 -> R5 (Cost 2000) while R3 <-> R4 remains severed.`
- **Task**: `Verify live failover routing from R1 to 10.23.0.10 using traceroute 10.23.0.10.`
- **Cmd**: `traceroute 10.23.0.10`
- **Read**:
  - `['Convergence Time', 'Detection + LSA Flood + SPF Calculation + FIB Update']`
  - `['Direct Cut Total', '~85 ms total outage for direct physical NO-CARRIER cuts']`
  - `['Failover Path', 'R1 → R2 → R5 (10 Mbps backup, OSPF Cost 2000)']`
  - `['Remaining Bottleneck', 'Indirect failures still wait 40s for the OSPF Dead timer']`
- **Rem**: `Total OSPF convergence time (~85 ms on direct cuts) equals Detection + LSA Flood + SPF + FIB Update, restoring delivery via R1 -> R2 -> R5.`

---

### Step 4: Idea 4 of 4 · Sub-second detection with BFD
- **Group**: `Idea 4 of 4 · Sub-second detection with BFD`
- **Chg**: `OSPF converged in 85 ms for a direct fiber cut—but an indirect silent failure still stalls for 40 seconds waiting on the Dead timer. Modern networks fix this with BFD.`
- **Title**: `Eliminating the 40-second Dead timer with BFD (RFC 5880)`
- **What**:
  ```text
  Lowering OSPF's own Hello timer to milliseconds burns control-plane CPU. Instead, routers offload rapid liveness checks to BFD (Bidirectional Forwarding Detection, RFC 5880):

  • UDP Port 3784: BFD runs as a lightweight, protocol-independent session over UDP port 3784 directly between neighboring router interfaces.
  • 15 ms Silent Failure Detection: Configured with a 5 ms transmit/receive interval and a detection multiplier of 3, BFD declares a peer DOWN after 3 missed packets (3 × 5 ms = 15 ms)—2,600× faster than OSPF's 40-second Dead timer.
  • Instant OSPF Trigger: When BFD detects a silent path break in 15 ms, it immediately tears down the OSPF neighbor adjacency and triggers Type-1 LSA flooding, keeping total convergence under 100 ms even across intermediate switches.

  Let’s inspect the active BFD sessions protecting Area 0.
  ```
- **Why**: Teaches production-grade sub-second failover architecture (OSPF + BFD) without modifying OSPF's own CPU-heavy Hello state machine.
- **Pic**: `BFD UDP 3784 5ms probes running across Area 0 links, triggering 15ms failure notification to OSPF.`
- **Task**: `Inspect active BFD sub-second liveness sessions using show bfd neighbors.`
- **Cmd**: `show bfd neighbors`
- **Read**:
  - `['BFD (RFC 5880)', 'Lightweight liveness protocol over UDP port 3784']`
  - `['Timer Math', '5 ms interval × 3 multiplier = 15 ms failure detection']`
  - `['Speedup', '15 ms BFD detection vs 40,000 ms OSPF Dead timer']`
  - `['OSPF Integration', 'BFD notifies OSPF immediately to flood LSAs and rerun SPF']`
- **Rem**: `BFD (UDP port 3784) detects silent link failures in 15 ms (5 ms × 3) and triggers immediate OSPF LSA withdrawal, achieving sub-100 ms convergence.`

---

### Step 5: Recap · Stage 6 Finale
- **Group**: `Recap`
- **Chg**: `Stage 6 Complete (Days 20–23) · Dynamic Routing Summary.`
- **Title**: `From static blackholes to sub-100 ms OSPF + BFD convergence`
- **What**:
  ```text
  Congratulations—you have completed Stage 6 (Dynamic Routing, Days 20–23)! Across these four days you mastered:

  • Day 20 (Why Dynamic Routing): Replaced O(R × S) static routes and silent blackholes with IGPs inside an AS and BGP-4 between ASes.
  • Day 21 (RIPv2): Observed distance-vector hop counting (UDP 520), the 15-hop ceiling, count-to-infinity loops, and Split Horizon / Poison Reverse.
  • Day 22 (OSPFv2): Built synchronized Area 0 LSDBs with Type-1 LSAs (IP proto 89), bandwidth-aware Cost, and Dijkstra SPF.
  • Day 23 (Failover & Convergence): Measured end-to-end convergence (~85 ms), verified redundant FIB failover, and eliminated the 40s Dead timer with BFD (15 ms).

  In Stage 7 (Days 24–29: Services), we move up to network services—starting in Day 24 with DHCP automatic addressing (DORA).
  ```
- **Why**: Summarizes all of Stage 6 and transitions cleanly into Stage 7 (Services).
- **Pic**: `Converged Area 0 topology with OSPF + BFD active and Stage 7 (DHCP) transition.`
- **Task**: `Review the Stage 6 summary and proceed to Day 24 (DHCP: Automatic Addressing) when ready.`
- **Cmd**: `null`
- **Read**:
  - `['Detection', 'Direct NO-CARRIER (< 10 ms) vs OSPF Dead (40s) vs BFD (15 ms)']`
  - `['Control Plane', 'Updated Type-1 LSA (Seq++) floods Area 0 → Dijkstra SPF rerun']`
  - `['Convergence', 'Detection + LSA Flood + SPF + FIB Update (~85 ms with BFD/NO-CARRIER)']`
  - `['Stage 6 Complete', 'Static → RIPv2 (AD 120) → OSPFv2 (AD 110) + BFD sub-100 ms failover']`
- **Rem**: `Stage 6 complete: OSPFv2 + BFD delivers sub-100 ms loop-free convergence around failed links, preparing you for Stage 7 (DHCP, DNS, NAT).`

---

## 4. Static Terminal Responses & Aliases

### `staticResponses` Keys in `net-23.ts`
1. `'link cut r3-r4'`:
   ```text
   [t=000.000s] Simulating physical fiber cut on R3 (eth1) <-> R4 (eth0) [10.23.34.0/30]
   [t=000.008s] KERNEL: R3 eth1 link state -> DOWN (NO-CARRIER)
   [t=000.008s] KERNEL: R4 eth0 link state -> DOWN (NO-CARRIER)
   [t=000.009s] OSPF-5-ADJCHG: Process 1, Nbr 4.4.4.4 on eth1 from FULL to DOWN (Interface Down)

   [Detection Mode Comparison]
     Direct Fiber Cut (this event) : 8 ms (immediate NO-CARRIER interrupt)
     Silent Switch Failure         : 40,000 ms (4 × 10s Hello Dead Timer without BFD)
   ```
2. `'show ip ospf spf'`:
   ```text
   OSPFv2 SPF Recalculation Log — Router R1 (RID 1.1.1.1 | Area 0.0.0.0)
     [t=000.020s] Received Type-1 Router LSA from 3.3.3.3 (R3) | Seq: 0x80000006 (was 0x80000005)
     [t=000.021s] Received Type-1 Router LSA from 4.4.4.4 (R4) | Seq: 0x80000006 (was 0x80000005)
     [t=000.021s] LSDB updated: edge (R3 <-> R4) removed from Area 0 graph
     [t=000.071s] SPF throttle timer expired (50 ms) -> executing Dijkstra SPF
     [t=000.075s] SPF complete (4 ms):
                  10.23.0.0/24 old path R1->R3->R4->R5 [UNREACHABLE]
                  10.23.0.0/24 new path R1->R2->R5     [Cost 2000, via eth0]
     [t=000.085s] FIB updated: 10.23.0.0/24 next-hop 10.23.12.2 (R2)
   ```
3. `'traceroute 10.23.0.10'`:
   ```text
   traceroute to 10.23.0.10 (10.23.0.10), 30 hops max, 60 byte packets
    1  R2 (10.23.12.2)   18.210 ms  18.044 ms  18.119 ms   [10 Mbps backup | Cost 1000]
    2  R5 (10.23.25.2)   37.412 ms  37.190 ms  37.288 ms   [10 Mbps backup | Cost 1000]
    3  10.23.0.10        37.650 ms  37.511 ms  37.590 ms   [Destination reached | Total Cost 2000]

   [Convergence Summary]
     Total Failover Outage : ~85 ms (8 ms detect + 12 ms LSA flood + 54 ms SPF + 11 ms FIB)
     Active FIB Route      : 10.23.0.0/24 via R2 (eth0) | OSPF AD 110 | Cost 2000
   ```
4. `'show bfd neighbors'`:
   ```text
   BFD Session Table — Router R1 (RFC 5880 | UDP Port 3784)
     NeighAddr     LD/RD    RH/RS     State   Int    Tx/Rx(ms)  Mult  DetectTime
     10.23.12.2    1/2      Up        Up      eth0   5 / 5      3     15 ms  (R2)
     10.23.13.2    2/3      Up        Up      eth1   5 / 5      3     15 ms  (R3)

   [BFD + OSPF Integration]
     Without BFD : Silent L2 failure takes 40,000 ms (4 × 10s Hello Dead Timer).
     With BFD    : 3 missed 5 ms packets trigger OSPF LSA flood in 15 ms (sub-100 ms total).
   ```

### Workspace & Terminal Fuzzy Aliases
- **Step 0 (`link cut r3-r4`)**: `link cut r3-r4`, `link cut`, `cut r3-r4`, `shutdown r3-r4`
- **Step 1 (`show ip ospf spf`)**: `show ip ospf spf`, `show ospf spf`, `show ip ospf database`, `ospf spf`
- **Step 2 (`traceroute 10.23.0.10`)**: `traceroute 10.23.0.10`, `traceroute`, `trace 10.23.0.10`, `show ip route ospf`
- **Step 3 (`show bfd neighbors`)**: `show bfd neighbors`, `show bfd`, `bfd neighbors`, `bfd`

---

## 5. Canvas Anti-Overlap Geometry & Layout (`Day23Canvas.tsx`)

- **ViewBox**: `0 0 1480 620`
- **Area 0 (0.0.0.0) Boundary**: `x=60, y=50, width=1360, height=335`
- **Routers**: `R1 (130, 210)`, `R2 (677, 95)`, `R3 (460, 260)`, `R4 (890, 260)`, `R5 (1220, 210)`, `10.23.0.0/24 LAN` pill `(1213, 138, 140×28)`
- **`R3 ↔ R4` Cable**: `#ef4444` (`isTransmitting={false}` — remember `SvgCable` has no `isLinkUp` prop) with `LINK CUT (NO-CARRIER)` badge (`width=130`) at `translate(673, 273)` (`87px` clear on both sides of `586..890`).
- **Staggered Alerts**:
  - Step 1 (`show ip ospf spf`): `LSA SEQ 0x80000006` at `translate(275, 195)` and `SPF: R1→R2→R5 (COST 2000)` at `translate(390, 120)` (`75px` vertical stagger).
  - Step 3 (`show bfd neighbors`): `BFD UDP:3784 (5ms × 3 = 15ms)` at `translate(390, 120)`.
- **Bottom HUD Cards (`y=395`, `height=175`, `47px` clear below `R3`/`R4` port pills at `y=348`)**:
  - Left Card: `translate(70, 395)`, `630×175`
  - Right Card: `translate(780, 395)`, `630×175`

---

## 6. Verification Checklist
- [ ] `src/content/networking/modules/net-23.ts` authored and registered in `src/content/networking/index.ts`.
- [ ] `NetworkingHomePage.tsx` includes `'net-23'` teaser in `MODULE_TEASERS`.
- [ ] `src/components/learning/networking/canvas/days/Day23Canvas.tsx` created and registered in `DAY_WORLD_SPECS` and `DAY_CANVAS_MAP`.
- [ ] `NetworkingWorkspace.tsx` and `NetworkingTerminal.tsx` wire `net-23` commands, aliases, and `help`.
- [ ] `tests/curriculum/networking-curriculum.test.ts`, `tests/ui/networking-canvas.test.tsx`, and `tests/ui/networking-homepage.test.tsx` (`23 Days Live`) updated and passing with `npx tsc --noEmit`.
