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

### Phase 5: Milestone 6 & Capstone Exam (Modules 14–16 / `net-14.ts` to `net-16.ts`)
- [x] **Task 5.1: Author Module 16 (VLANs & 802.1Q)**: Flat broadcast isolation, access vs trunk ports. Ticket #116 (`net-16.ts`), 802.11 Wi-Fi CSMA/CA, OSPF vs BGP.
- [x] **Task 5.2: Author Module 15 (Firewalls & ACLs)**: Stateless 5-tuple vs Stateful conntrack. Ticket #117 (`net-15.ts`).
- [x] **Task 5.3: Author Module 15 (Spanning Tree Protocol)**: Redundant loops, broadcast storms, root bridge election. Ticket #118 (`net-15.ts`).
- [x] **Task 5.4: Author Module 14 (Capstone 5-Layer Triage Exam)**:
  - [x] Step 1: Layer 1 Cable check.
  - [x] Step 2: Layer 2 Duplex/STP check.
  - [x] Step 3: Layer 3 Gateway conflict check.
  - [x] Step 4: DHCP APIPA recovery.
  - [x] Step 5: DNS resolver cache fix.
  - [x] Capstone exam diagnostic terminal with 5-layer systematic triage.
- [x] **Task 5.5: Track Registry Sync & Full Regression Suite**
  - [x] Created `tests/tracks/networking-milestones-6-7-rollout.test.tsx` (8/8 tests green).
  - [x] Full networking test suite passing 100%: 31/31 test files, 471/471 tests green.

---

### Phase 6: Interactive Story Reel (MentorScript) Rollout for Modules 6–16
*Theme: Author auto-pausing animated story reels obeying strict anti-overload rules (micro-beats <=35 words, 1 dilemma at a time, Third Way assessment with >=3 options & >=2 whyOptions, and TicketScenes).*

- [x] **Batch 1: Crossing Network Boundaries (Modules 6, 7, 8)**
  - [x] **Module 6 (`net-06.ts`)**: `NET_06_MENTOR_SCRIPT` — IPv6 128-bit Expansion & NDP Solicitation (no more broadcast, solicited-node multicast, SLAAC link-local autoconfig). Wired to `PacketInspector` stage.
  - [x] **Module 7 (`net-07.ts`)**: `NET_07_MENTOR_SCRIPT` — Default Gateways & Hop-by-Hop L2 Rewrite (leaving the subnet dilemma, router dual-NIC, constant L3 IP vs rewritten L2 MAC, TTL decrement). Wired to 2-hop `PacketInspector` stage.
  - [x] **Module 8 (`net-08.ts`)**: `NET_08_MENTOR_SCRIPT` — NAT & PAT Overload (RFC 1918 private exhaustion, corporate receptionist analogy, dynamic port translation table, return flow de-NATting, inherent firewall effect). Wired to L2/L3/L4 `PacketInspector` stage.
  - [x] **Simulator Integration (`MentorLessonStage.tsx`)**: Mounted custom packet inspection stages for `net-06`, `net-07`, and `net-08`.
  - [x] **Verification Suite**: Updated `tests/tracks/networking-mentor-rollout-m1-m5.test.tsx` to audit Modules 1–8 (56/56 tests passing). Full networking suite: 31 test files, 492/492 tests green (100%).
- [x] **Batch 2: Services & Transport Mechanics (Modules 9, 10, 11, 12, 13)**
  - [x] **Module 9 (`net-09.ts`)**: `NET_09_MENTOR_SCRIPT` — DHCP DORA Handshake (0.0.0.0 broadcast discovery, transaction ID matching, lease duration math, T1/T2 renewals, APIPA 169.254.x.x fallback). Wired to `DhcpDoraSimulator`.
  - [x] **Module 10 (`net-10.ts`)**: `NET_10_MENTOR_SCRIPT` — Hierarchical DNS Resolution (dot root, TLD name servers, authoritative name servers, recursive queries, TTL caching, poisoned resolver flushing). Wired to `DnsResolutionTreeSimulator`.
  - [x] **Module 11 (`net-11.ts`)**: `NET_11_MENTOR_SCRIPT` — UDP vs TCP Sockets & Port Binding (16-bit port spaces, 5-tuple socket uniqueness, UDP fire-and-forget, TCP 3-way handshake SYN/ACK, socket binding collisions). Wired to `packet-inspector-stage-net11`.
  - [x] **Module 12 (`net-12.ts`)**: `NET_12_MENTOR_SCRIPT` — TCP Sequence Ladder & Sliding Window (byte-stream sequence offsets, cumulative Ack N math, duplicate ACK gap detection, fast retransmit, 4-way teardown with TIME_WAIT 2*MSL, zero window flow control). Wired to `TcpSequenceLadderSimulator`.
  - [x] **Module 13 (`net-13.ts`)**: `NET_13_MENTOR_SCRIPT` — HTTP & TLS 1.3 Key Exchange (cleartext sniffing danger, X.509 CA trust chain, 1-RTT ECDHE ephemeral key exchange for forward secrecy, AES-GCM record framing, expired certificate alert). Wired to `HttpTlsHandshakeSimulator`.
  - [x] **Simulator Integration (`MentorLessonStage.tsx`)**: Wired `DhcpDoraSimulator`, `DnsResolutionTreeSimulator`, `packet-inspector-stage-net11`, `TcpSequenceLadderSimulator`, and `HttpTlsHandshakeSimulator`.
  - [x] **Verification Suite**: Updated `tests/tracks/networking-mentor-rollout-m1-m5.test.tsx` to audit Modules 1–13 (91/91 tests passing).
- [x] **Batch 3: Enterprise Infrastructure & Incident Triage (Modules 14, 15, 16)**
  - [x] **Module 14 (`net-14.ts`)**: `NET_14_MENTOR_SCRIPT` — 5-Layer Office Outage Triage (L1 link light $\to$ L2/L3 APIPA $\to$ L3 gateway reachability $\to$ L3 internet ping 8.8.8.8 $\to$ L7 DNS resolution $\to$ TTL traceroute hop mapping). Wired to `virtual-terminal-stage`.
  - [x] **Module 15 (`net-15.ts`)**: `NET_15_MENTOR_SCRIPT` — STP BPDU Root Election & Boundary Firewalls (missing frame TTL reality, infinite broadcast storm multiplication, BPDU exchange, lowest Priority + MAC Root Bridge election, port blocking, stateful conntrack return flow tracking). Wired to `firewall-stp-stage`.
  - [x] **Module 16 (`net-16.ts`)**: `NET_16_MENTOR_SCRIPT` — 802.1Q VLAN Trunking & Dijkstra Shortest Path (flat broadcast domain isolation, untagged access ports, 4-byte IEEE 802.1Q trunk tagging with 12-bit VID, Wi-Fi half-duplex CSMA/CA collision avoidance, Dijkstra SPF shortest path tree calculation). Wired to `vlan-dijkstra-stage`.
  - [x] **Simulator Integration (`MentorLessonStage.tsx`)**: Mounted `VirtualTerminalSimulator` (`virtual-terminal-stage`), `FirewallAclRuleSimulator` (`firewall-stp-stage`), and `VlanTrunkDijkstraLab` (`vlan-dijkstra-stage`).
  - [x] **Verification Suite**: Updated `tests/tracks/networking-mentor-rollout-m1-m5.test.tsx` to audit ALL 16 Modules (112/112 tests passing). Full networking regression suite: 31 test files, 548/548 tests green (100% pass rate).

---

## 💾 Current Session State (Where We Are Right Now)
* **Active Milestone:** **Phase 6 COMPLETE across all 16 Modules.**
* **Current Status:**
  - Modules 1–16 have complete, verified, interactive `mentorScript` story reels attached to Concept 1.
  - Every single story reel strictly obeys all pedagogical constraints: micro-beats ($\le 35$ words), single dilemma at a time, active cadence ($\le 2$ passive beats), cumulative superset reveal ladders, show-then-name term bindings, and 3-way assessment predict beats.
  - Interactive stage simulators are dynamically mounted for every module in `MentorLessonStage.tsx`.
* **Next Immediate Task:** Transition to Frontend & UI polish (visual styling, animations, responsiveness, dark mode, sound design, or student journey flows).

