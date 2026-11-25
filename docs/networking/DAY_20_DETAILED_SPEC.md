# SQLens Networking Track — Day 20 Detailed Specification
## Stage 6: Dynamic Routing (Days 20–23) · Sharing the Map & Convergence
### Module: `net-20` · Why Dynamic Routing (Scalability, Failover & IGP vs EGP)

---

## 1. Pedagogical Intent & Objectives

### Context & Learning Progression
- **Day 19 (Stage 5 Finale)**: Mastered connectionless transport with UDP (RFC 768), the fixed 8-byte header, Head-of-Line blocking avoidance, stateless `UNCONN` sockets, and QUIC / HTTP/3.
- **Day 20 (This Module — Stage 6 Opener)**: Returns to Layer 3 routers (last examined in Days 4–6 with static and default routes) to answer a core infrastructure question: **Why do real networks replace manual static routes with dynamic routing protocols?**
  - **Static Route Scaling Limits**: Demonstrate mathematically why manual `ip route add` configuration fails as router count ($R$) and subnet count ($S$) grow ($O(R \times S)$ manual entries).
  - **Link Failures & Blackholing**: Explain why a static route pointing to an indirect next-hop stays in the **Routing Information Base (RIB)** even after a downstream physical link enters `NO-CARRIER` / `DOWN`, silently dropping packets (**blackholing**). Contrast with dynamic **Hello / Keepalive** timers that detect peer loss and withdraw dead paths automatically.
  - **Autonomous Systems (AS)**: Define an **Autonomous System (AS)** (RFC 1930 / RFC 6793) as a collection of IP prefixes and routers under a single administrative policy, identified by an **Autonomous System Number (ASN)** (e.g., private `AS64512`, upstream `AS64513`).
  - **IGP vs. EGP & Administrative Distance (AD)**: Contrast **Interior Gateway Protocols (IGPs)** (RIP, OSPF, IS-IS — optimal path selection *inside* one AS) against **Exterior Gateway Protocols (EGPs)** (BGP-4, RFC 4271 — policy-driven prefix exchange *between* ASes), and introduce **Administrative Distance (AD)** for ranking competing route sources.

### Key Pedagogical Constraints
- **Zero Analogies Policy**:
  - STRICTLY FORBIDDEN: Metaphors (no GPS, road maps, postmen, traffic cops, word of mouth, highways, tollbooths).
  - MANDATORY: Exact physical & digital realities: Routing Information Base (RIB), Forwarding Information Base (FIB), `ip route add`, `NO-CARRIER` link state, blackhole packet drops, Hello/Keepalive timers, Autonomous System (AS), 16-bit/32-bit ASN (RFC 1930 / RFC 6793), IGP (RIP, OSPF, IS-IS), EGP (BGP-4, RFC 4271), and Administrative Distance (AD).
- **Taught Before Tested**:
  - Motivate and define RIB, FIB, and $O(R \times S)$ static route scaling before running `ip route show`.
  - Explain `NO-CARRIER` link state, indirect next-hop blackholing, and Hello/Keepalive failure detection before running `traceroute 10.20.0.10`.
  - Define Autonomous Systems (AS) and ASNs (`64512–65534` private range) before running `as inspect 64512`.
  - Define IGP, EGP (BGP-4), and Administrative Distance (AD) before running `show route-protocols`.
- **Task Hint Policy**: Omit `(tap it to fill the terminal).` and end all task instructions with a clean period.

---

## 2. Module Identity & Metadata

```typescript
export const NET_20_MODULE: NetworkingModule = {
  id: 'net-20',
  dayNumber: 20,
  title: 'Day 20 · Why Dynamic Routing',
  shortTitle: 'Why Dynamic Routing',
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

### Step 1: Idea 1 of 4 · Static Route Scaling Limits
- **Group**: `Idea 1 of 4 · Static route scaling limits`
- **Chg**: `Since Day 19: We completed Stage 5 (Transport Layer: TCP & UDP). Now in Stage 6, we return to Layer 3 routers—last seen in Days 5–6—to solve a critical scaling problem with static routes.`
- **Title**: Why manual static routes break down as networks grow
- **What**:
  ```text
  In Days 5 and 6, you connected two or three routers by typing static routes manually into each router's Routing Information Base (RIB), the table a router consults to choose a next-hop IP.

  Static routes work well for 2 routers and 3 subnets. In a real enterprise or ISP backbone, manual configuration collapses under basic math:

  • O(R × S) Configuration Burden: With R routers and S remote subnets, engineers must maintain roughly R × S static route entries across the fleet.
  • Single-Change Ripple Effect: Adding one new subnet (for example, 10.20.0.0/24 behind Router R4) requires logging into R1, R2, and R3 to add forward routes—and updating R4 with return routes to every existing prefix.
  • Human Error Risk: One typo in a subnet mask or next-hop IP creates asymmetric routing or silent packet drops that are slow to diagnose.

  Dynamic routing protocols solve this by having routers exchange reachability advertisements automatically, computing their own RIB entries and installing them into the kernel Forwarding Information Base (FIB).

  Let’s inspect Router R1's current static routing table to see the manual entries required just to reach a few subnets.
  ```
- **Why**: Establishes the operational and mathematical motivation for automated routing protocols before introducing protocol mechanics.
- **Pic**: `Multi-router mesh (R1, R2, R3, R4) inside AS 64512 showing manual static route entries proliferating across every router.`
- **Task**: `Inspect Router R1's static routing table using ip route show.`
- **Cmd**: `ip route show`
- **Read**:
  - `['RIB vs FIB', 'RIB holds learned routes; FIB is the active forwarding table']`
  - `['Static Scaling', 'O(R × S) manual entries required as routers and subnets grow']`
  - `['Operational Risk', 'Every new subnet forces manual edits on every upstream router']`
  - `['Dynamic Solution', 'Routers advertise prefixes and compute routes automatically']`
- **Rem**: `Static routes scale poorly at O(R × S) manual entries; dynamic routing automates prefix distribution across every router.`

---

### Step 2: Idea 2 of 4 · Link Failures & Blackhole Packet Loss
- **Group**: `Idea 2 of 4 · Link failures & blackholing`
- **Chg**: `Manual configuration is slow to scale, but an even bigger danger appears when a physical cable or router port fails in the middle of a multi-hop path.`
- **Title**: Static blackholing vs. dynamic failure detection
- **What**:
  ```text
  Suppose Router R1 has a static route sending 10.20.0.0/24 traffic to Router R2 (upper path), while Router R3 (lower path) is a backup router.

  Now imagine the physical fiber cable between R2 and R4 fails (interface enters DOWN / NO-CARRIER state):

  • Why Static Routes Fail Silently: R1's local interface to R2 is still UP! Because R1 only monitors its own directly connected ports, R1 has no idea that the R2–R4 link died.
  • Blackhole Forwarding: R1 keeps forwarding 10.20.0.0/24 packets to R2, and R2 drops them into a blackhole—even though R1 → R3 → R4 is completely healthy.
  • Manual Recovery Lag: Traffic stays broken until a human engineer notices an alert, logs into R1, deletes the dead static route, and adds a route via R3.

  How Dynamic Routing Recovers Automatically:
  • Neighbors exchange periodic Hello / Keepalive packets over each active link.
  • When R2 loses the link to R4, R2 immediately floods a route withdrawal update to R1.
  • R1 removes the dead path via R2 and installs the alternate path via R3 within seconds.

  Let’s trace the path toward 10.20.0.10 while the R2–R4 link is down to observe static blackholing in action.
  ```
- **Why**: Demonstrates why static routes cannot react to remote link failures and introduces Hello/Keepalive failure detection.
- **Pic**: `Redundant diamond topology (R1 → R2/R3 → R4) with the R2–R4 link marked DOWN (NO-CARRIER), showing static packets blackholed at R2 while R3's backup path sits unused.`
- **Task**: `Trace the packet path toward 10.20.0.10 to observe the blackhole at R2 using traceroute 10.20.0.10.`
- **Cmd**: `traceroute 10.20.0.10`
- **Read**:
  - `['Static Blind Spot', 'R1 cannot detect link failures beyond its own local ports']`
  - `['Blackhole Loss', 'Packets enter R2 and are dropped despite healthy backup R3']`
  - `['Dynamic Detection', 'Hello / Keepalive timers detect dead peers automatically']`
  - `['Self-Healing', 'Routers withdraw failed routes and reconverge onto backup paths']`
- **Rem**: `Static routes forward packets into blackholes when remote links fail; dynamic protocols use Hello timers to reroute around failures automatically.`

---

### Step 3: Idea 3 of 4 · Autonomous Systems (AS) & Administrative Boundaries
- **Group**: `Idea 3 of 4 · Autonomous Systems (AS)`
- **Chg**: `Dynamic routing lets routers share topology updates automatically. But the global internet has over 100,000 networks—every router on Earth cannot share internal link updates with every other router.`
- **Title**: Partitioning the internet into Autonomous Systems (AS)
- **What**:
  ```text
  If every router on the internet exchanged detailed link-state updates with every other router, routing tables and CPU load would overwhelm every device on the planet.

  To solve this, the internet is divided into independent administrative domains called Autonomous Systems (AS) (defined in RFC 1930 and RFC 6793):

  • What an AS Is: A collection of IP prefixes and routers operated by a single organization (such as an enterprise, university, or ISP) under one unified routing policy.
  • Autonomous System Number (ASN): Each AS is identified by a unique 16-bit or 32-bit number (for example, AS15169 for Google, AS13335 for Cloudflare, or private ASNs 64512–65534 for internal labs).
  • Information Hiding: Routers inside AS 64512 share full internal link details with each other, but they hide that internal topology from AS 64513 (the upstream ISP)—advertising only summary IP prefixes across the border.

  Border routers that sit at the edge between two Autonomous Systems are called Autonomous System Boundary Routers (ASBRs)—like Router R4 connecting AS 64512 to ISP1 in AS 64513.

  Let’s inspect the boundary, prefixes, and neighbor peering of AS 64512.
  ```
- **Why**: Grounds the concept of an Autonomous System (AS) as an administrative and scalability boundary before distinguishing IGP from EGP.
- **Pic**: `Dual-AS topology showing AS 64512 (Enterprise Core: PC1, R1, R2, R3, R4) separated by a clear eBGP boundary from AS 64513 (Upstream ISP: ISP1, S1).`
- **Task**: `Inspect the Autonomous System metadata and prefixes for AS 64512 using as inspect 64512.`
- **Cmd**: `as inspect 64512`
- **Read**:
  - `['Autonomous System', 'Routers and IP prefixes under one administrative policy']`
  - `['ASN Identifier', '16-bit or 32-bit number (64512–65534 reserved for private use)']`
  - `['Topology Hiding', 'Internal link failures stay inside the AS; borders share prefixes']`
  - `['Border Router', 'R4 peers externally with ISP1 (AS 64513) at the AS edge']`
- **Rem**: `An Autonomous System (AS) groups routers under one administrative policy, hiding internal topology behind an ASN boundary.`

---

### Step 4: Idea 4 of 4 · IGP vs. EGP & Administrative Distance
- **Group**: `Idea 4 of 4 · IGP vs EGP & Administrative Distance`
- **Chg**: `Now that networks are grouped into Autonomous Systems, routers need two different kinds of dynamic protocols: one for inside an AS, and one for between ASes.`
- **Title**: Interior Gateway Protocols (IGP), Exterior Gateway Protocols (EGP), and Administrative Distance
- **What**:
  ```text
  Dynamic routing protocols split cleanly into two families based on whether they operate inside an AS or across AS borders:

  1. Interior Gateway Protocols (IGPs) — Inside One AS:
  • Goal: Find the fastest, loop-free path between internal routers (R1, R2, R3, R4).
  • Examples: RIP (hop-count distance vector), OSPF (link-state shortest path), and IS-IS.
  • Trust Model: All routers belong to the same organization, so they share detailed link metrics freely.

  2. Exterior Gateway Protocols (EGPs) — Between Different ASes:
  • Goal: Exchange IP prefix reachability and enforce business/security policies between separate organizations (R4 in AS 64512 ↔ ISP1 in AS 64513).
  • Modern Standard: BGP-4 (Border Gateway Protocol, RFC 4271) is the sole EGP used on the modern internet.

  Administrative Distance (AD):
  What if Router R4 learns a route to 10.20.0.0/24 from both a Static Route and OSPF? The router uses Administrative Distance (lower = more trusted):
  • Connected Interface: AD 0
  • Static Route: AD 1
  • External BGP (eBGP): AD 20
  • OSPF: AD 110
  • RIP: AD 120

  Let’s inspect the active routing protocols and Administrative Distance table on Router R4.
  ```
- **Why**: Establishes the IGP vs. EGP taxonomy and Administrative Distance tie-breaking rules, setting up Day 21 (RIP) and Day 22 (OSPF).
- **Pic**: `Protocol split diagram: IGP (OSPF/RIP, AD 110/120) operating inside AS 64512 vs EGP (BGP-4, AD 20) operating across the R4–ISP1 AS border.`
- **Task**: `Display active routing protocols and Administrative Distance rankings using show route-protocols.`
- **Cmd**: `show route-protocols`
- **Read**:
  - `['IGP (Intra-AS)', 'RIP, OSPF, IS-IS optimize internal paths inside a single AS']`
  - `['EGP (Inter-AS)', 'BGP-4 (RFC 4271) exchanges prefixes and policy between ASes']`
  - `['Admin Distance (AD)', 'Ranks route trustworthiness: Connected 0 < Static 1 < eBGP 20 < OSPF 110']`
  - `['Next Up', 'Day 21 examines RIP (distance-vector); Day 22 examines OSPF (link-state)']`
- **Rem**: `IGPs (RIP, OSPF) optimize paths inside one Autonomous System; EGP (BGP-4) exchanges policy-filtered prefixes between Autonomous Systems.`

---

### Step 5: Recap · The Four Core Rules of Dynamic Routing
- **Group**: `Recap`
- **Title**: The four core rules of dynamic routing & AS architecture
- **What**:
  ```text
  Dynamic routing replaces fragile manual tables with automated, self-healing prefix distribution:

  1. Scalability: Static routes require O(R × S) manual entries and break under fleet growth; dynamic protocols distribute prefixes automatically into each router's RIB and FIB.
  2. Automatic Failover: Static routes cannot see remote link failures and blackhole traffic; dynamic protocols use Hello/Keepalive timers to withdraw dead paths and reroute.
  3. Autonomous Systems (AS): The internet is partitioned into administrative domains identified by ASNs (e.g., AS 64512), keeping internal topology details local.
  4. IGP vs. EGP & AD: IGPs (RIP, OSPF) compute optimal internal paths; EGP (BGP-4) exchanges prefixes across AS borders; Administrative Distance ranks competing route sources.
  ```
- **Why**: Consolidates Day 20 concepts and prepares the learner for Day 21 (`net-21` RIP: Counting Hops) and Day 22 (`net-22` OSPF: Sharing the Map).
- **Pic**: `Master summary card contrasting Static Routing vs Dynamic Routing, AS boundaries, and the IGP/EGP/AD hierarchy.`
- **Task**: `Review the four core rules of dynamic routing and Autonomous System architecture.`
- **Cmd**: `null`
- **Read**:
  - `['1. Scalability', 'Dynamic protocols eliminate O(R × S) manual static route edits']`
  - `['2. Failure Recovery', 'Hello/Keepalive timers prevent blackholes by withdrawing dead links']`
  - `['3. AS Boundaries', 'Autonomous Systems (ASN) isolate internal topology behind policy edges']`
  - `['4. IGP vs EGP', 'IGP (RIP/OSPF) runs inside an AS; EGP (BGP-4) runs between ASes']`
- **Rem**: `Dynamic routing automates RIB/FIB updates, recovers from remote link failures, and separates intra-AS (IGP) from inter-AS (EGP/BGP) routing.`

---

## 4. Static Terminal Responses & Aliases

```typescript
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
}
```

### Workspace Aliases to Support:
- **Step 0 (`ip route show`)**: `ip route show`, `ip route`, `ip r`, `show ip route`, `route -n`
- **Step 1 (`traceroute 10.20.0.10`)**: `traceroute 10.20.0.10`, `traceroute -n 10.20.0.10`, `tracert 10.20.0.10`, `traceroute r4`
- **Step 2 (`as inspect 64512`)**: `as inspect 64512`, `as inspect as64512`, `whois as64512`, `show bgp summary`, `as inspect`
- **Step 3 (`show route-protocols`)**: `show route-protocols`, `show ip protocols`, `route-protocols`, `ip route summary`, `show protocols`

---

## 5. Canvas Anti-Overlap Geometry & Layout

### Device Coordinates (`0 0 1480 620` viewBox):
- **Top Title Banner**: `x=490, y=18, width=500, height=22`
  - Text: `WHY DYNAMIC ROUTING · SCALABILITY, FAILOVER & IGP VS EGP`
- **Autonomous System Boundaries**:
  - **AS 64512 (Enterprise Core · IGP Domain)**: `x=50, y=55, width=975, height=330` (dashed `#38bdf8` border)
  - **AS 64513 (Upstream ISP · External AS)**: `x=1085, y=55, width=355, height=330` (dashed `#a855f7` border)
  - Clear `60px` eBGP border gap between `x=1025` and `x=1085`.
- **Devices**:
  1. **PC1 (`SvgWorkstation`)**: `x=80, y=220`, IP `10.10.0.10/24` (envelope `x=74..162`, `y=220..314`).
  2. **Router R1 (`SvgRouter`)**: `x=320, y=220` (`w=126`, right edge `446`), P1 `10.10.0.1`, P2 `10.12.0.1`, P3 `10.13.0.1`.
  3. **Router R2 (`SvgRouter`, upper transit)**: `x=600, y=120` (`w=126`, right edge `726`), P1 `10.12.0.2`, P2 `10.24.0.1`.
  4. **Router R3 (`SvgRouter`, lower backup)**: `x=600, y=280` (`w=126`, right edge `726`), P1 `10.13.0.2`, P2 `10.34.0.1`.
  5. **Router R4 (`SvgRouter`, ASBR)**: `x=870, y=220` (`w=126`, right edge `996`), P1 `10.24.0.2`, P2 `203.0.113.1`.
  6. **Router ISP1 (`SvgRouter`, AS 64513)**: `x=1160, y=220` (`w=126`, right edge `1286`), P1 `203.0.113.2`, P2 `198.51.100.1`.
  7. **Server S1 (`SvgWorkstation`)**: `x=1345, y=220`, IP `198.51.100.10/24` (envelope `x=1339..1427`, `y=220..314`).

### Links & Horizontal Cable Span Invariant:
- `PC1 → R1`: `x1=156, y1=246` to `x2=320, y2=246` (span `164px`; any badge `<= 134px` leaves `>= 15px` clearance on both sides).
- `R1 → R2`: `x1=446, y1=236` to `x2=600, y2=146`.
- `R1 → R3`: `x1=446, y1=256` to `x2=600, y2=306`.
- `R2 → R4`: `x1=726, y1=146` to `x2=870, y2=236` (marked `#ef4444` dashed `DOWN / NO-CARRIER` on Step 1).
- `R3 → R4`: `x1=726, y1=306` to `x2=870, y2=256` (highlighted `#4ade80` backup path on Step 1).
- `R4 → ISP1` (eBGP boundary): `x1=996, y1=246` to `x2=1160, y2=246` (span `164px`; any badge `<= 134px` leaves `>= 15px` clearance on both sides).
- `ISP1 → S1`: `x1=1286, y1=246` to `x2=1345, y2=246`.

### Progressive Reveal & Bottom Diagnostic HUD Cards (`y=395`):
- R3 at `y=280` + height `52` + stacked port IPs (`~36px`) ends at `~368px`.
- PC1 & S1 at `y=220` + height `94px` end at `314px`.
- All Bottom Diagnostic HUD Cards start strictly at `y=395` (`>= 27px` clearance below R3 and `>= 81px` below PC1/S1):
  - **Card 1**: `translate(70, 395)` (`width=320, height=185`)
  - **Card 2**: `translate(420, 395)` (`width=640, height=185`)
  - **Card 3**: `translate(1090, 395)` (`width=320, height=185`)
- Any adjacent step alerts (e.g., `DOWN / NO-CARRIER` callout on `R2–R4` at `y=155` vs `Backup Path` callout on `R3–R4` at `y=320`) are separated by `165px` (`>= 25px` stagger invariant).

---

## 6. Verification Checklist
- [x] `docs/networking/DAY_20_DETAILED_SPEC.md` authored.
- [ ] `src/content/networking/modules/net-20.ts` created and registered in `src/content/networking/index.ts`.
- [ ] `src/components/learning/networking/homepage/NetworkingHomePage.tsx` adds Day 20 teaser.
- [ ] `src/components/learning/networking/canvas/days/Day20Canvas.tsx` created and registered in `NetworkingCanvas.tsx`.
- [ ] `NetworkingWorkspace.tsx` & `NetworkingTerminal.tsx` wired with aliases and help output.
- [ ] `tests/curriculum/networking-curriculum.test.ts`, `tests/ui/networking-canvas.test.tsx`, `tests/ui/networking-homepage.test.tsx` updated.
- [ ] All networking tests + `npx tsc --noEmit` pass with 0 errors.
