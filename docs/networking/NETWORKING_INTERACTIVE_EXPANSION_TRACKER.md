# Networking Track: Interactive Visualizer Expansion Spec & Execution Tracker

> **Document Version:** 1.0.0  
> **Last Updated:** October 12, 2026  
> **Location:** `docs/networking/NETWORKING_INTERACTIVE_EXPANSION_TRACKER.md`  
> **Purpose:** Single source of truth and implementation blueprint for rolling out dedicated interactive simulation widgets across the remaining 9 curriculum modules (Modules 2, 6, 9, 10, 12, 13, 15, and 16).

---

## ⚡ Quick Start for New Conversations & Agents

If you are resuming this work in a fresh conversation, **read this first before writing code**:

1. **Do NOT re-debate settled topics:** All instructional design ("Third Way" prediction-before-explanation), RFC accuracy rules, and platform contracts are **frozen**. See [`NETWORKING_STATUS_AND_DECISION_RECORD.md`](./NETWORKING_STATUS_AND_DECISION_RECORD.md).
2. **Current Baseline State:**
   - Git branch: `main`
   - Test suite: `npm test` runs 109 test files (1,282 tests) with 100% passing.
   - Track tests: `npx vitest run tests/tracks/` runs 35 test files (454 tests) with 100% passing.
   - Typecheck: `npm run lint` (`tsc --noEmit`) passes with 0 errors.
   - **Protected Invariants:** SQL (57 days) and Prisma (14 days) tracks are 100% frozen. Never modify their files.
3. **Current Curriculum Status:**
   - **All 16 modules** already implement the "Third Way" choose-and-defend judgment gates (136 total questions, zero raw recall MCQs) and RFC technical errata.
   - **8 modules** already have dedicated interactive widgets:
     - `net-01`: `PacketInspector` (L2/L3/L4/L7 progressive disclosure)
     - `net-02`: `EthernetFrameInspector` (framing dissection, 46B padding slider, CRC-32 bit-flip error injector)
     - `net-03`: `SwitchSimulationLab` (interactive port selection & CAM table)
     - `net-04`: `SubnetBitSlicer` (32-bit CIDR bit slicer + Router-on-a-Stick + active-octet /22 transfer)
     - `net-05`: `ArpSimulationLab` (4-step state machine + outbound hold queue)
     - `net-07`: `PacketInspector` (Cross-hop MAC rewrites + TTL decrement)
     - `net-08`: `PacketInspector` (NAT/PAT translation table)
     - `net-11`: `PacketInspector` (5-tuple socket multiplexing)
     - `net-14`: `VirtualTerminalSimulator` (Windows CLI diagnostics: `ipconfig`, `ping`, `tracert`, `nslookup`, `netstat`)
   - **8 modules** currently use text/code briefing cards and are scheduled for dedicated interactive visualizers in this tracker.

---

## 1. Master Curriculum Visualizer Status Matrix

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              16-MODULE INTERACTIVITY MATRIX                            │
├────────┬─────────────────────────────┬──────────────────────────┬──────────────────────┤
│ MODULE │ TITLE                       │ INTERACTIVE COMPONENT    │ STATUS               │
├────────┼─────────────────────────────┼──────────────────────────┼──────────────────────┤
│ net-01 │ Communication Journey       │ PacketInspector (L2-7)   │ ✅ LIVE (Phase 5)    │
│ net-02 │ Links & Ethernet Framing    │ EthernetFrameInspector   │ ✅ LIVE (Sprint 1)   │
│ net-03 │ MAC Learning & Forwarding   │ SwitchSimulationLab      │ ✅ LIVE (Milestone 2)│
│ net-04 │ IPv4 Subnetting Pilot       │ SubnetBitSlicer          │ ✅ LIVE (Phase 2)    │
│ net-05 │ ARP & Local Delivery        │ ArpSimulationLab         │ ✅ LIVE (Phase 3)    │
│ net-06 │ IPv6 & NDP                  │ Ipv6NdpSimulator         │ 📋 SPECIFIED (Sprint 2)
│ net-07 │ Gateways & Routing          │ PacketInspector (TTL)    │ ✅ LIVE (Phase 5)    │
│ net-08 │ NAT & PAT                   │ PacketInspector (NAT)    │ ✅ LIVE (Phase 5)    │
│ net-09 │ DHCP & Auto-Configuration   │ DhcpDoraSimulator        │ 📋 SPECIFIED (Sprint 3)
│ net-10 │ DNS & Name Resolution       │ DnsResolutionTreeSim     │ 📋 SPECIFIED (Sprint 4)
│ net-11 │ UDP & TCP Foundations       │ PacketInspector (5-T)    │ ✅ LIVE (Phase 5)    │
│ net-12 │ TCP Reliability & Teardown  │ TcpSequenceLadderSim     │ 📋 SPECIFIED (Sprint 5)
│ net-13 │ HTTP & TLS/HTTPS            │ HttpTlsHandshakeSim      │ 📋 SPECIFIED (Sprint 6)
│ net-14 │ Diagnostics & Triage        │ VirtualTerminalSimulator │ ✅ LIVE (Phase 5)    │
│ net-15 │ Security, Firewalls & STP   │ FirewallAclRuleSim       │ 📋 SPECIFIED (Sprint 7)
│ net-16 │ VLANs, Wireless & Routing   │ VlanTrunkDijkstraLab     │ 📋 SPECIFIED (Sprint 8)
└────────┴─────────────────────────────┴──────────────────────────┴──────────────────────┘
```

---

## 2. Technical Blueprint & RFC Specifications for Remaining Modules

Each component must adhere strictly to established RFC standards and the repository's design system (`NETWORKING_COMPONENT_LIBRARY_AND_DESIGN_SYSTEM.md`).

---

### Sprint 1: Module 2 — `EthernetFrameInspector.tsx`
*Target Module:* `src/content/networking/modules/net-02.ts`  
*Component Location:* `src/components/learning/networking/EthernetFrameInspector.tsx`

#### 1. RFC & Technical Precision Requirements
- **Preamble & SFD:** 7 octets alternating `10101010` (`0xAA`) + 1 octet Start of Frame Delimiter `10101011` (`0xAB`).
- **MAC Addressing:** 6-byte Destination MAC + 6-byte Source MAC (48-bit EUI-48).
- **EtherType Field (IEEE 802.3):** 2 octets. Values $\ge 1536$ (`0x0600`) represent EtherType (`0x0800` IPv4, `0x0806` ARP, `0x86DD` IPv6). Values $\le 1500$ represent 802.3 length.
- **Minimum Frame Size & Padding:** Minimum Ethernet frame length is **64 bytes** (excluding preamble and SFD). Minimum payload size is **46 bytes**. If payload is $< 46$ bytes, padding bytes (`0x00`) must be inserted. Maximum transmission unit (MTU) standard is **1500 bytes** (total max frame 1518 bytes).
- **FCS / CRC-32 Trailer:** 4 octets calculated using standard generator polynomial `0x04C11DB7` (reflected `0xEDB88320`). Corrupted bits must trigger an invalid FCS state.
- **Inter-Packet Gap (IPG):** 96 bit times of idle line state (0.096 µs on 1 Gbps, 9.6 µs on 10 Mbps).

#### 2. Interactive Features
- **Dynamic Payload Slider:** Drag payload size from 10 bytes to 1500 bytes. Visualizer illuminates added padding when payload is under 46 bytes and calculates total wire length.
- **Bit-Flip Error Injector:** Toggle any bit in the frame header or payload. CRC recalculates immediately, showing `CRC MISMATCH -> Frame Discarded by NIC` with no TCP ACK generated.

---

### Sprint 2: Module 6 — `Ipv6NdpSimulator.tsx`
*Target Module:* `src/content/networking/modules/net-06.ts`  
*Component Location:* `src/components/learning/networking/Ipv6NdpSimulator.tsx`

#### 1. RFC & Technical Precision Requirements
- **RFC 5952 Canonical Representation:** 128-bit address in 8 16-bit hextets. Lowercase hexadecimal, leading zeros omitted, single longest run of two or more consecutive zero hextets compressed to `::` exactly once.
- **RFC 4291 Modified EUI-64 Identifier:** 48-bit MAC address split in half (`OUI` and `NIC`), `0xFFFE` inserted in the middle, and Universal/Local (U/L) bit (bit 7 of octet 1) inverted (0 $\to$ 1). Prepend `fe80::/10` to produce the Link-Local address.
- **RFC 4861 Neighbor Discovery Protocol (NDP):**
  - **Solicited-Node Multicast Address:** `ff02::1:ffxx:xxxx` formed by appending the lower 24 bits of the target IPv6 address to the prefix `ff02::1:ff00:0/104`.
  - **Neighbor Solicitation (NS):** ICMPv6 Type 135 sent to the Solicited-Node Multicast address (not a broadcast).
  - **Neighbor Advertisement (NA):** ICMPv6 Type 136 returned unicast by the target host with its target link-layer MAC address.
  - **Router Advertisement (RA):** ICMPv6 Type 134 containing prefix information, On-Link flag (L), Autonomous Address-Configuration flag (A), Managed address configuration flag (M), and Other configuration flag (O).

#### 2. Interactive Features
- **EUI-64 Transformation Stepper:** Step-by-step visual dissection: MAC (`3C:22:FB:4A:11:80`) $\to$ Split $\to$ Insert `FF:FE` $\to$ Invert bit 7 (`3C` $\to$ `3E`) $\to$ Canonical IPv6 Link-Local `fe80::3e22:fbff:fe4a:1180`.
- **Solicited-Node Multicast Resolution Flow:** Contrast IPv4 ARP broadcast (disturbs all LAN hosts) with IPv6 NS sent only to hosts joined to that specific solicited-node multicast group.

---

### Sprint 3: Module 9 — `DhcpDoraSimulator.tsx`
*Target Module:* `src/content/networking/modules/net-09.ts`  
*Component Location:* `src/components/learning/networking/DhcpDoraSimulator.tsx`

#### 1. RFC & Technical Precision Requirements
- **RFC 2131 / RFC 2132 Protocol Details:**
  - Transport: UDP Port 67 (Server) and UDP Port 68 (Client).
  - Transaction ID (`xid`): 32-bit random number matching requests and replies.
  - Client Hardware Address (`chaddr`): 16-byte field containing client MAC.
  - Assigned Client Address (`yiaddr`): "Your IP Address" offered by the server.
- **The DORA 4-Way Exchange:**
  1. **Discover:** Broadcast `0.0.0.0:68` $\to$ `255.255.255.255:67` (DHCP Option 53 = 1).
  2. **Offer:** Server sends `yiaddr`, Option 1 (Mask), Option 3 (Gateway), Option 6 (DNS), Option 51 (Lease Time). DHCP Option 53 = 2.
  3. **Request:** Broadcast `0.0.0.0:68` $\to$ `255.255.255.255:67` containing Option 54 (Server Identifier) to inform all servers which offer was accepted. DHCP Option 53 = 3.
  4. **Acknowledge (ACK):** Server confirms the binding and commits lease timers ($T_1$ renewal at 50%, $T_2$ rebind at 87.5%, expire at 100%). DHCP Option 53 = 5.
- **APIPA Failure State (RFC 3927):** If no DHCP offer is received after timeout, host self-assigns `169.254.x.x/16` with Gratuitous ARP to verify unicity.

#### 2. Interactive Features
- **4-Step DORA Stepper:** Interactive timeline displaying state transition, packet headers, options table, and lease countdown timers.
- **Rogue / Competing Server Scenario:** Two DHCP servers respond with different subnets; learner observes why the Request must be broadcast to release the non-selected server's hold.

---

### Sprint 4: Module 10 — `DnsResolutionTreeSimulator.tsx`
*Target Module:* `src/content/networking/modules/net-10.ts`  
*Component Location:* `src/components/learning/networking/DnsResolutionTreeSimulator.tsx`

#### 1. RFC & Technical Precision Requirements
- **RFC 1034 / RFC 1035 Architecture:**
  - Recursive resolution: Client laptop $\to$ Local Recursive Resolver (ISP / 8.8.8.8).
  - Iterative resolution: Recursive Resolver $\to$ Root (`.`) $\to$ TLD (`.com`) $\to$ Authoritative Name Server.
  - Port 53: UDP for queries $< 512$ bytes (or $< 4096$ with EDNS0); TCP for zone transfers (AXFR) and truncated (`TC=1`) responses.
- **Record Types:**
  - `A`: IPv4 host record (32-bit).
  - `AAAA`: IPv6 host record (128-bit).
  - `CNAME`: Canonical name alias. **Universal RFC rule:** A CNAME cannot coexist with any other record of any type for the same owner name (which prevents apex domain CNAMEs because apex requires SOA and NS).
  - `MX`: Mail exchanger with preference integer (lowest preference number wins).
  - `TXT`: Arbitrary text (SPF, DKIM, site verification).
  - `SOA`: Start of Authority (primary NS, admin email with `@` as `.`, serial number, refresh, retry, expire, negative cache TTL).
- **Resolver Cache:** TTL expiration rules and negative caching (RFC 2308).

#### 2. Interactive Features
- **Interactive Resolution Hierarchy Tree:** Learner types a domain (e.g. `api.github.com`) and steps through: Root server referral with NS and glue records $\to$ TLD `.com` server referral $\to$ Authoritative server final answer.
- **Cache Hit vs Cache Miss Simulator:** Toggle TTL countdown to visualize instant cache return vs iterative network trip.

---

### Sprint 5: Module 12 — `TcpSequenceLadderSimulator.tsx`
*Target Module:* `src/content/networking/modules/net-12.ts`  
*Component Location:* `src/components/learning/networking/TcpSequenceLadderSimulator.tsx`

#### 1. RFC & Technical Precision Requirements
- **RFC 793 / RFC 9293 Transmission Control Protocol:**
  - **3-Way Handshake:**
    1. Client $\to$ Server: `SYN`, `Seq = ISN_c` (e.g. 1000), `Ack = 0`.
    2. Server $\to$ Client: `SYN + ACK`, `Seq = ISN_s` (e.g. 5000), `Ack = 1001` (ISN_c + 1).
    3. Client $\to$ Server: `ACK`, `Seq = 1001`, `Ack = 5001` (ISN_s + 1).
  - **Cumulative Acknowledgment:** `ACK N` acknowledges receipt of all contiguous octets up to $N - 1$ and expects octet $N$ next.
  - **Flow Control (`rwnd`):** Receiver advertises free buffer window in bytes.
  - **Congestion Control (RFC 5681):** Slow Start (exponential window growth), Congestion Avoidance (additive increase / multiplicative decrease AIMD), Fast Retransmit on 3 duplicate ACKs.
  - **Connection Teardown:** 4-way `FIN` / `ACK` / `FIN` / `ACK`. Final sender stays in `TIME-WAIT` state for $2 \times \text{MSL}$ (Maximum Segment Lifetime, typically 1–2 minutes) to ensure last ACK reached the peer.

#### 2. Interactive Features
- **Interactive Space-Time Ladder Diagram:** Animated packet trajectory lines with sequence numbers, ACK numbers, and payload byte lengths.
- **Packet Drop & Fast Retransmit Trigger:** Click to drop segment 2. Learner observes receiver generate 3 duplicate ACKs for segment 1, triggering sender's immediate retransmission without waiting for RTO timer expiry.

---

### Sprint 6: Module 13 — `HttpTlsHandshakeSimulator.tsx`
*Target Module:* `src/content/networking/modules/net-13.ts`  
*Component Location:* `src/components/learning/networking/HttpTlsHandshakeSimulator.tsx`

#### 1. RFC & Technical Precision Requirements
- **TLS 1.3 (RFC 8446) vs TLS 1.2:**
  - TLS 1.2: 2-RTT handshake (`ClientHello` $\to$ `ServerHello + Certificate + ServerKeyExchange` $\to$ `ClientKeyExchange` $\to$ `Finished`).
  - TLS 1.3: 1-RTT handshake. Client includes supported Diffie-Hellman groups and key shares in `ClientHello`. Server responds with `ServerHello + key_share + EncryptedExtensions + Certificate + Finished`.
  - Zero-RTT (0-RTT) resumption using Pre-Shared Keys (PSK) with replay considerations.
- **HTTP Evolution & Multiplexing:**
  - HTTP/1.1: Text protocol, persistent connections with keep-alive, head-of-line blocking on pipelining.
  - HTTP/2 (RFC 7540): Binary framing layer, stream multiplexing over a single TCP connection. Cross-stream TCP head-of-line blocking persists if a packet is lost.
  - HTTP/3 over QUIC (RFC 9000 / RFC 9114): QUIC runs over UDP. Independent byte streams without cross-stream blocking; packet loss on stream 1 does not stall stream 2 or 3.

#### 2. Interactive Features
- **Handshake Latency Comparison:** Visual timeline comparing RTT delays of HTTP/1.1 + TLS 1.2 (3 RTTs to first data) vs HTTP/2 + TLS 1.3 (2 RTTs) vs HTTP/3 0-RTT (0–1 RTT).
- **Head-of-Line Blocking Demonstration:** Drop 1 TCP packet in HTTP/2 (all streams freeze) vs 1 QUIC packet in HTTP/3 (only the affected stream waits).

---

### Sprint 7: Module 15 — `FirewallAclRuleSimulator.tsx` & `StpTopologyLab.tsx`
*Target Module:* `src/content/networking/modules/net-15.ts`  
*Component Location:* `src/components/learning/networking/FirewallAclRuleSimulator.tsx`

#### 1. RFC & Technical Precision Requirements
- **Stateful Packet Inspection (NIST SP 800-41):**
  - Connection state tracking: `NEW`, `ESTABLISHED`, `RELATED`, `INVALID`.
  - Outbound TCP SYN matches rule `PERMIT OUTBOUND 80, 443`, creating state entry.
  - Return TCP SYN-ACK matches `ESTABLISHED` state in state table and is admitted automatically. Unsolicited inbound SYN has no state entry and is dropped.
- **Stateless ACL Rules:**
  - Top-down evaluation: Evaluated sequentially line-by-line; first match determines action (`PERMIT` or `DENY`).
  - Implicit Deny: Packets matching no rule hit the implicit `DENY ALL` at the bottom.
- **Spanning Tree Protocol (IEEE 802.1D / 802.1w RSTP):**
  - Bridge ID = Bridge Priority (16 bits: priority multiple of 4096 + VLAN ID) + MAC Address (48 bits). Lowest Bridge ID becomes Root Bridge.
  - Port Roles: Root Port (lowest root path cost toward root), Designated Port (lowest cost per link), Blocking / Alternate Port (breaks loop).

#### 2. Interactive Features
- **Interactive Rule-Match Pipeline:** Learner configures 5 ACL rules and tests probes with different source/dest IPs and ports, watching real-time line-by-line evaluation until first-match termination.
- **Switch Loop & STP Break Visualizer:** Triangle switch topology. Learner toggles STP off (broadcast packet multiplies infinitely into a storm) and on (blocking port chosen to eliminate loop).

---

### Sprint 8: Module 16 — `VlanTrunkDijkstraLab.tsx`
*Target Module:* `src/content/networking/modules/net-16.ts`  
*Component Location:* `src/components/learning/networking/VlanTrunkDijkstraLab.tsx`

#### 1. RFC & Technical Precision Requirements
- **IEEE 802.1Q VLAN Tagging:**
  - 4-Byte Tag insertion between Source MAC and EtherType:
    - TPID (Tag Protocol Identifier): 2 octets = `0x8100`.
    - TCI (Tag Control Information): 3 bits PCP (Priority Code Point / 802.1p CoS), 1 bit DEI (Drop Eligible Indicator), 12 bits VID (VLAN Identifier, 1 to 4094).
  - Native VLAN: Untagged frames traversing a trunk belong to the configured native VLAN (mismatch creates security and routing leaks).
- **Wi-Fi Architecture (IEEE 802.11):**
  - CSMA/CA (Collision Avoidance): Random backoff timer, DIFS, SIFS, ACK frames.
  - 2.4 GHz non-overlapping channels in US regulatory domain: Channels 1, 6, 11 (20 MHz channel width with 5 MHz spacing between channel centers).
- **OSPF (RFC 2328) Link-State Routing:**
  - Dijkstra Shortest Path First (SPF) algorithm.
  - Metric: Path **Cost** $= \frac{\text{Reference Bandwidth}}{\text{Interface Bandwidth}}$ (default reference 100 Mbps).
  - Backbone Area 0 requirement for inter-area routing.

#### 2. Interactive Features
- **802.1Q Header Expansion Animation:** Zoom in on an Ethernet frame as it crosses an access port into a trunk port; view the 4-byte 802.1Q tag insertion and VID field decoding.
- **Interactive Dijkstra Shortest Path Calculator:** 5-router network topology. Learner clicks source node and inspects step-by-step SPF tree calculation, cost additions, and shortest path selection.

---

## 3. Sprint Execution Checklist

Track execution across sprints. Each sprint must follow the standard 6-step cycle:
1. Build interactive widget with strict typing and unit test suite.
2. Export in `src/components/learning/networking/index.ts`.
3. Wire into `NetworkingPracticeTaskView.tsx` with responsive layout.
4. Attach component task data into module content file (`net-XX.ts`).
5. Verify `npm run lint` (`tsc --noEmit`) and full test suite (`npm test`).
6. Update this tracker and commit to `main`.

---

### [x] Sprint 1: Module 2 — Ethernet Framing & FCS Inspector (COMPLETED)
- [x] Build `src/components/learning/networking/EthernetFrameInspector.tsx`
- [x] Export `EthernetFrameInspector` in `src/components/learning/networking/index.ts`
- [x] Add `ethernetFrame` property to `PracticeTask` and curriculum types
- [x] Wire `EthernetFrameInspector` into `NetworkingPracticeTaskView.tsx`
- [x] Update `src/content/networking/modules/net-02.ts` with frame inspector scenarios
- [x] Author `tests/tracks/networking-sprint1-frame-inspector.test.tsx`
- [x] Verify `npm run lint` $\to$ 0 errors, `npm test` $\to$ 100% pass (109 files, 1282 tests)

---

### [ ] Sprint 2: Module 6 — IPv6 NDP & EUI-64 Simulator
- [ ] Build `src/components/learning/networking/Ipv6NdpSimulator.tsx`
- [ ] Export `Ipv6NdpSimulator` in `src/components/learning/networking/index.ts`
- [ ] Add `ipv6Ndp` property to `PracticeTask` and curriculum types
- [ ] Wire `Ipv6NdpSimulator` into `NetworkingPracticeTaskView.tsx`
- [ ] Update `src/content/networking/modules/net-06.ts` with EUI-64 and NDP scenarios
- [ ] Author `tests/tracks/networking-sprint2-ipv6-ndp.test.tsx`
- [ ] Verify `npm run lint` $\to$ 0 errors, `npm test` $\to$ 100% pass

---

### [ ] Sprint 3: Module 9 — DHCP DORA Protocol Stepper
- [ ] Build `src/components/learning/networking/DhcpDoraSimulator.tsx`
- [ ] Export `DhcpDoraSimulator` in `src/components/learning/networking/index.ts`
- [ ] Add `dhcp` property to `PracticeTask` and curriculum types
- [ ] Wire `DhcpDoraSimulator` into `NetworkingPracticeTaskView.tsx`
- [ ] Update `src/content/networking/modules/net-09.ts` with DORA exchange scenarios
- [ ] Author `tests/tracks/networking-sprint3-dhcp-dora.test.tsx`
- [ ] Verify `npm run lint` $\to$ 0 errors, `npm test` $\to$ 100% pass

---

### [ ] Sprint 4: Module 10 — DNS Resolution Tree & Cache Simulator
- [ ] Build `src/components/learning/networking/DnsResolutionTreeSimulator.tsx`
- [ ] Export `DnsResolutionTreeSimulator` in `src/components/learning/networking/index.ts`
- [ ] Add `dns` property to `PracticeTask` and curriculum types
- [ ] Wire `DnsResolutionTreeSimulator` into `NetworkingPracticeTaskView.tsx`
- [ ] Update `src/content/networking/modules/net-10.ts` with recursive resolution scenarios
- [ ] Author `tests/tracks/networking-sprint4-dns-tree.test.tsx`
- [ ] Verify `npm run lint` $\to$ 0 errors, `npm test` $\to$ 100% pass

---

### [ ] Sprint 5: Module 12 — TCP Sequence & Sliding Window Ladder
- [ ] Build `src/components/learning/networking/TcpSequenceLadderSimulator.tsx`
- [ ] Export `TcpSequenceLadderSimulator` in `src/components/learning/networking/index.ts`
- [ ] Add `tcpLadder` property to `PracticeTask` and curriculum types
- [ ] Wire `TcpSequenceLadderSimulator` into `NetworkingPracticeTaskView.tsx`
- [ ] Update `src/content/networking/modules/net-12.ts` with handshake and retransmit scenarios
- [ ] Author `tests/tracks/networking-sprint5-tcp-ladder.test.tsx`
- [ ] Verify `npm run lint` $\to$ 0 errors, `npm test` $\to$ 100% pass

---

### [ ] Sprint 6: Module 13 — HTTP/2, HTTP/3 & TLS 1.3 Handshake Simulator
- [ ] Build `src/components/learning/networking/HttpTlsHandshakeSimulator.tsx`
- [ ] Export `HttpTlsHandshakeSimulator` in `src/components/learning/networking/index.ts`
- [ ] Add `httpTls` property to `PracticeTask` and curriculum types
- [ ] Wire `HttpTlsHandshakeSimulator` into `NetworkingPracticeTaskView.tsx`
- [ ] Update `src/content/networking/modules/net-13.ts` with multiplexing and TLS scenarios
- [ ] Author `tests/tracks/networking-sprint6-http-tls.test.tsx`
- [ ] Verify `npm run lint` $\to$ 0 errors, `npm test` $\to$ 100% pass

---

### [ ] Sprint 7: Module 15 — Stateful Firewall & STP Loop Simulator
- [ ] Build `src/components/learning/networking/FirewallAclRuleSimulator.tsx`
- [ ] Export `FirewallAclRuleSimulator` in `src/components/learning/networking/index.ts`
- [ ] Add `firewall` property to `PracticeTask` and curriculum types
- [ ] Wire `FirewallAclRuleSimulator` into `NetworkingPracticeTaskView.tsx`
- [ ] Update `src/content/networking/modules/net-15.ts` with state table and ACL scenarios
- [ ] Author `tests/tracks/networking-sprint7-firewall-stp.test.tsx`
- [ ] Verify `npm run lint` $\to$ 0 errors, `npm test` $\to$ 100% pass

---

### [ ] Sprint 8: Module 16 — 802.1Q VLAN Trunk & OSPF Dijkstra Lab
- [ ] Build `src/components/learning/networking/VlanTrunkDijkstraLab.tsx`
- [ ] Export `VlanTrunkDijkstraLab` in `src/components/learning/networking/index.ts`
- [ ] Add `vlanDijkstra` property to `PracticeTask` and curriculum types
- [ ] Wire `VlanTrunkDijkstraLab` into `NetworkingPracticeTaskView.tsx`
- [ ] Update `src/content/networking/modules/net-16.ts` with 802.1Q and Dijkstra scenarios
- [ ] Author `tests/tracks/networking-sprint8-vlan-dijkstra.test.tsx`
- [ ] Verify `npm run lint` $\to$ 0 errors, `npm test` $\to$ 100% pass

---

## 4. Verification Protocol & Quality Gates

Before any sprint is considered complete, execute the following commands in order:

```powershell
# 1. Typecheck the entire project (must exit 0 with zero errors)
npm run lint

# 2. Run the sprint-specific test suite
npx vitest run tests/tracks/networking-sprintX-*.test.tsx

# 3. Run all track tests across SQL, Prisma, and Networking (34+ files)
npx vitest run tests/tracks/

# 4. Run the full repository test suite (108+ files, 1269+ tests)
npm test

# 5. Check git working tree
git status
```

---

## 5. Master Cross-Reference Guide

| Document File | Purpose |
| :--- | :--- |
| [`NETWORKING_INTERACTIVE_EXPANSION_TRACKER.md`](./NETWORKING_INTERACTIVE_EXPANSION_TRACKER.md) | **This document:** Detailed technical specification and execution tracker for the 9-module visualizer rollout. |
| [`NETWORKING_EXECUTION_TRACKER.md`](./NETWORKING_EXECUTION_TRACKER.md) | Tracks the initial Phases 0–5 overhaul (RFC errata, Modules 4/5 pilots, component extraction, Phase 5 rollout). |
| [`NETWORKING_COMPONENT_LIBRARY_AND_DESIGN_SYSTEM.md`](./NETWORKING_COMPONENT_LIBRARY_AND_DESIGN_SYSTEM.md) | Design system, token hierarchy, layout contracts, and UI widget guidelines. |
| [`NETWORKING_STATUS_AND_DECISION_RECORD.md`](./NETWORKING_STATUS_AND_DECISION_RECORD.md) | Frozen pedagogical decisions record (the "Third Way", prediction-before-explanation). |
| [`NETWORKING_MODULE_4_SUBNETTING_PILOT_SPEC.md`](./NETWORKING_MODULE_4_SUBNETTING_PILOT_SPEC.md) | Approved v1.2.0 pilot specification for SubnetBitSlicer and cognitive fading. |
| [`NETWORKING_MODULE_5_ARP_PILOT_SPEC.md`](./NETWORKING_MODULE_5_ARP_PILOT_SPEC.md) | Approved v1.0.0 pilot specification for ArpSimulationLab. |
| [`NETWORKING_TRACK_SPECIFICATION_AND_TRACKER.md`](./NETWORKING_TRACK_SPECIFICATION_AND_TRACKER.md) | Master curriculum taxonomy, 45 concepts, and platform submission pipeline contracts. |
