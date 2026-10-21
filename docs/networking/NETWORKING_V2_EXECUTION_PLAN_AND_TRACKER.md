# Networking Track V2: Execution Plan & Progress Tracker

> **QUICK RESUME INSTRUCTION FOR FUTURE SESSIONS:**  
> When starting a new conversation, tell the assistant:  
> **"Read `docs/networking/NETWORKING_V2_EXECUTION_PLAN_AND_TRACKER.md` and continue the next pending task."**

---

## 📌 Context & Architecture Baseline

* **Goal:** Turn complete beginners into job-ready Network Administrators & SREs.
* **Master Specification:** [`docs/curriculum/networking-master-curriculum.md`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/docs/curriculum/networking-master-curriculum.md)
* **The 3-Beat Pedagogical Rule:**
  1. *Beat 1: The Physical Dilemma First* — Show the failure on the wire before giving it a technical name.
  2. *Beat 2: The Tool's Purpose* — What question does this command/protocol ask the operating system?
  3. *Beat 3: The Observable Result* — What exact line in terminal output proves that the concept worked?
* **Learning Modality:**
  * **Interactive Story Reel:** 3 animated visual scenes with auto-pausing teachable moments.
  * **Guided Workplace Lab:** 3 guided steps, dual Windows PowerShell (`ipconfig`) & Linux/Cisco (`ip link`, `show mac`) commands, and immediate visual verification on the topology canvas.

---

## 🚦 Master Phase Tracker

| Phase | Description | Modules | Concepts | Status |
|---|---|---|---|---|
| **Phase 0** | **Homepage & Story Reel Architecture** | Homepage | UI / Hero / Reel | **✅ COMPLETE** |
| **Phase 1** | **Milestone 1: Local Link & Layer 2 Switching** | Mod 01–03 | 11 Concepts | **✅ COMPLETE** |
| **Phase 2** | **Milestone 2: Addressing, Subnetting & ARP** | Mod 04–07 | 14 Concepts | **✅ COMPLETE** |
| **Phase 3** | **Milestone 3: Internetwork Routing & Gateways** | Mod 08–10 | 9 Concepts | **🟡 NEXT UP** |
| **Phase 4** | **Milestones 4 & 5: Services & Transport Security** | Mod 11–15 | 17 Concepts | ⚪ Queued |
| **Phase 5** | **Milestone 6 & Capstone: VLANs, STP & 5-Layer Exam** | Mod 16–19 | 11 Concepts | ⚪ Queued |

---

## 📝 Detailed Task-by-Task Checklist

### Phase 0: Homepage & Story Reel Architecture (COMPLETED ✅)
- [x] **Task 0.1:** Create dedicated `/networking` route rendering custom `NetworkingTrackHomePage.tsx`.
- [x] **Task 0.2:** Build live NOC Mission Control Hero with animated interactive topology packet simulator (`Host-A` ➔ `SW-1` ➔ `R-1` ➔ `Internet`).
- [x] **Task 0.3:** Build 3-Beat Pedagogy showcase cards & 7-Milestone expandable curriculum roadmap.
- [x] **Task 0.4:** Implement `StoryReelStage.tsx` with auto-pausing teachable moments and freeze-frame spotlights.
- [x] **Task 0.5:** Integrate Story Reel into `NetworkingCockpitView.tsx` with seamless mode toggle (`[🎬 Story Reel]` / `[💻 Workplace Lab]`).
- [x] **Task 0.6:** Author master curriculum specification and freeze in `docs/curriculum/networking-master-curriculum.md`.
- [x] **Task 0.7:** Unit tests passing: `tests/tracks/networking-homepage-story-reel.test.tsx` (424/424 networking tests passing).

---

### Phase 1: Milestone 1 — Local Link & Layer 2 Switching (COMPLETED ✅)
*Goal: Master physical cables, full-duplex channels, hardware MAC identity, and collision-free switch forwarding.*

- [x] **Task 1.1: Author Module 1 Content (`src/content/networking/modules/net-01.ts`)**
  - [x] Concept 1.1: The Trapped Data Dilemma (1 isolated computer, physical medium required).
  - [x] Concept 1.2: Copper Strands & Full-Duplex Channels (8-strand Cat6, dedicated TX/RX pairs).
  - [x] Concept 1.3: Physical NIC Chip & Permanent MAC Address (Factory-burned 48-bit serial / IEEE OUI).
  - [x] Concept 1.4: Ethernet II Packaging Envelope (Payload, Destination MAC, Source MAC, CRC-32 checksum).
  - [x] Ticket #101: Verify physical link carrier and MAC address (`ipconfig /all` vs `ip link show`).
- [x] **Task 1.2: Author Module 2 Content (`src/content/networking/modules/net-02.ts`)**
  - [x] Concept 2.1: The Multi-Node Dilemma (Connecting 3+ PCs with a Layer 1 dumb Hub).
  - [x] Concept 2.2: Electrical Collisions & Half-Duplex Bottlenecks (Constructive interference, +4V corruption).
  - [x] Concept 2.3: Traffic Cop: CSMA/CD & Exponential Backoff (Jam signals, random backoff timers).
  - [x] Ticket #102: Port collision diagnosis and duplex auto-negotiation (`show interfaces status` vs `ethtool -S eth0`).
- [x] **Task 1.3: Author Module 3 Content (`src/content/networking/modules/net-03.ts`)**
  - [x] Concept 3.1: The Switch Clean Slate (Empty table at power-on).
  - [x] Concept 3.2: Learning by Listening (Switch ONLY learns from Source MAC ingress).
  - [x] Concept 3.3: Unicast Forwarding vs Unknown Flooding (Direct delivery vs flooding all ports).
  - [x] Concept 3.4: Table Aging & Dynamic Eviction (300s aging timer & port migration).
  - [x] Ticket #103: Cisco `show mac address-table dynamic` & Linux `bridge fdb show` to triage station migration.
- [x] **Task 1.4: Dual-OS Terminal Enhancement (`VirtualTerminalSimulator.tsx`)**
  - [x] Added quick pills support for `propAvailableCommands` and `scenario?.availableCommands`.
  - [x] Full rendering across `NetworkingPracticeTaskView` alongside switch topology labs and standalone terminal scenarios.
- [x] **Task 1.5: Verification Suite**
  - [x] Created `tests/tracks/networking-milestone-1-rollout.test.tsx` (10/10 tests green).
  - [x] Full networking test suite passing 100%: 27/27 test files, 434/434 tests green.

---

### Phase 2: Milestone 2 — Addressing, Subnetting & ARP (COMPLETED ✅)
- [x] **Task 2.1: Author Module 4 Content (`net-04.ts`)**
  - [x] Concept 4.1: The 100k-Device Scaling Crisis (Why flat MACs can't route, CAM overflow, broadcast storms).
  - [x] Concept 4.2: Hardware vs Software Address (MAC in silicon vs IP in OS memory).
  - [x] Concept 4.3: IPv4 Octets & Hierarchy (Network ID vs Host ID, RFC 1918 private spaces).
  - [x] Ticket #104: Static IP assignment and conflict triage with dual Windows (`netsh`) & Linux (`ip -4 addr`).
- [x] **Task 2.2: Author Module 5 Content (`net-05.ts`)**
  * [x] Concept 5.1: The Street & House Decimal Analogy.
  * [x] Concept 5.2: 32-Bit Binary Subnet Mask & Contiguity Rule.
  * [x] Concept 5.3: Bitwise AND Decision Engine (`(Local IP & Mask) === (Dest IP & Mask)`).
  * [x] Concept 5.4: CIDR Slash Notation (`/24`, `/16`, `/8`) & The Minus-2 Rule.
  * [x] Ticket #105: Fix `/24` vs `/16` subnet mismatch with dual Windows (`ipconfig`) & Linux (`ip addr`, `ip route`).
- [x] **Task 2.3: Author Module 6 Content (`net-06.ts`)**
  - [x] Concept 6.1: The IP-to-MAC Disconnect & ARP Hold Queue.
  - [x] Concept 6.2: The ARP Request (Broadcast) & Reply (Unicast).
  - [x] Concept 6.3: ARP Cache Management & Gratuitous ARP (GARP).
  - [x] Ticket #106: ARP table inspection and cache flush (`arp -a` / `ip neigh`).
- [x] **Task 2.4: Author Module 7 Content / IPv6 NDP (`net-06.ts` / `net-07.ts`)**
  - [x] Concept 7.1: IPv4 Exhaustion Reality & 128-bit hex addressing.
  - [x] Concept 7.2: IPv6 RFC 5952 Zero Compression (`::`) & Scope Classification.
  - [x] Concept 7.3: Killing Broadcast: Neighbor Discovery Protocol (NDP) & SLAAC autoconfiguration.
  - [x] Ticket #107: Ping Link-Local `fe80::1` and inspect IPv6 global unicast (`ipconfig` vs `ip -6 addr`).
- [x] **Task 2.5: Verification Suite**
  - [x] Created `tests/tracks/networking-milestone-2-rollout.test.tsx` (10/10 tests green).
  - [x] Full networking test suite passing 100%: 28/28 test files, 444/444 tests green.

---

### Phase 3: Milestone 3 — Routing & Gateways (Modules 8–10 / `net-07.ts` & `net-08.ts`)
- [x] **Task 3.1: Author Content for Default Gateways & Hop-by-Hop L2 Rewrite (`net-07.ts` Concept 1)**
  - [x] Concept 8.1: Leaving the Subnet Dilemma.
  - [x] Concept 8.2: Default Gateway as the Physical Door (Router dual-NICs).
  - [x] Concept 8.3: The Hop-by-Hop L2 Rewrite (IP stays constant; MAC changes at every hop).
  - [x] Ticket #108: Missing gateway restoration with dual Windows (`route print`) & Linux (`ip route show default`).
- [x] **Task 3.2: Author Content for Longest Prefix Match & Loop Mitigation (`net-07.ts` Concepts 2 & 3)**
  - [x] Concept 9.1: Longest Prefix Match (Most specific prefix wins).
  - [x] Concept 9.2: Gateway of Last Resort (`0.0.0.0/0`).
  - [x] Concept 9.3: Loop Prevention via TTL (Traceroute hop inspection).
  - [x] Ticket #109: Multi-hop path trace & TTL triage with dual Windows (`tracert -d`) & Linux (`traceroute -n`).
- [x] **Task 3.3: Author Content for NAT & PAT (`net-08.ts` Concepts 1, 2 & 3)**
  - [x] Concept 10.1: RFC 1918 Private Ranges (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`) & Address Quadrants (Inside/Outside Local/Global).
  - [x] Concept 10.2: Port Address Translation (PAT / NAT Overload) & Dynamic Source Port Disambiguation.
  - [x] Concept 10.3: Inbound Port Forwarding (DNAT) & Return Flow De-NATting.
  - [x] Ticket #110: Inspect NAT state table with Cisco IOS (`show ip nat translations`) & Linux conntrack (`conntrack -L`).
- [x] **Task 3.4: Verification Suite**
  - [x] Added `tests/tracks/networking-milestone-3-rollout.test.tsx` (10/10 tests green).
  - [x] Full networking test suite passing 100%: 29/29 test files, 454/454 tests green.

---

### Phase 4: Milestones 4 & 5 — Services, Transport & Security (Modules 11–15 / `net-09.ts` to `net-13.ts`)
- [x] **Task 4.1: Author Module 11 (DHCP)**: DORA exchange, APIPA (`169.254.x.x`), lease renew. Ticket #111 (`net-09.ts`).
- [x] **Task 4.2: Author Module 12 (DNS)**: Hierarchy, A/CNAME records, resolver cache flush. Ticket #112 (`net-10.ts`).
- [x] **Task 4.3: Author Module 13 (Ports & Sockets)**: 5-tuple sockets, `netstat -ano` / `ss -tulpn`. Ticket #113 (`net-11.ts`).
- [x] **Task 4.4: Author Module 14 (TCP vs UDP)**: 3-Way Handshake, Sequence numbers, `TIME_WAIT`. Ticket #114 (`net-12.ts`).
- [x] **Task 4.5: Author Module 15 (TLS 1.3 & HTTPS)**: Cleartext sniffing danger, CA certificate validation, 1-RTT. Ticket #115 (`net-13.ts`).
- [x] **Task 4.6: Verification Suite**
  - [x] Added `tests/tracks/networking-milestones-4-5-rollout.test.tsx` (9/9 tests green).
  - [x] Full networking test suite passing 100%: 30/30 test files, 463/463 tests green.

---

### Phase 5: Milestone 6 & Capstone Exam (Modules 16–19)
- [ ] **Task 5.1: Author Module 16 (VLANs & 802.1Q)**: Flat broadcast isolation, access vs trunk ports. Ticket #116.
- [ ] **Task 5.2: Author Module 17 (Firewalls & ACLs)**: Stateless 5-tuple vs Stateful conntrack. Ticket #117.
- [ ] **Task 5.3: Author Module 18 (Spanning Tree Protocol)**: Redundant loops, broadcast storms, root bridge election. Ticket #118.
- [ ] **Task 5.4: Author Module 19 (Capstone 5-Layer Triage Exam)**:
  - [ ] Step 1: Layer 1 Cable check.
  - [ ] Step 2: Layer 2 Duplex/STP check.
  - [ ] Step 3: Layer 3 Gateway conflict check.
  - [ ] Step 4: DHCP APIPA recovery.
  - [ ] Step 5: DNS resolver cache fix.
- [ ] **Task 5.5: Track Registry Sync & Full Regression Suite**
  - [ ] Update `src/content/networking/networking-roadmap.ts` and `src/tracks/registry.ts`.
  - [ ] Run full project test suite.

---

## 💾 Current Session State (Where We Are Right Now)
* **Active Milestone:** Milestone 6 & Capstone Exam (Modules 16–19).
* **Next Immediate Task:** **Task 5.1 — Author Module 16 (VLANs & 802.1Q)** (`net-14.ts`: flat broadcast isolation, 802.1Q tags, access vs trunk ports, Ticket #116).

