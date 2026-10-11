# Module 5 Pilot Specification: Address Resolution Protocol (ARP) & Queued Packet Resolution

> **Document Version:** 1.0.0 (Approved Architecture Specification)  
> **Status:** Companion Pilot Specification to Module 4  
> **Location:** `docs/networking/NETWORKING_MODULE_5_ARP_PILOT_SPEC.md`  
> **Pedagogical Model:** 5-Stage Cognitive Fading + Event-Driven Packet Stepper

---

## Executive Overview

This specification establishes the approved learner experience for **Module 5: Address Resolution Protocol (ARP), Dynamic Resolution State Machines, and Local vs. Remote Gateway Resolution**.

As established in the curriculum audit debate, Module 4 established *which* MAC address a host needs (Destination MAC for on-link vs. Gateway MAC for off-link). **Module 5 establishes *how* that MAC address is dynamically discovered and cached**, teaching:
1. **Queued IP Packet State Machine:** Visualizing that an outbound IP packet cannot be encapsulated until Layer 2 resolution completes, holding the packet in a FIFO resolution queue.
2. **The 4-Step Interactive ARP Stepper:**
   - Host A ARP Request broadcast (`FF:FF:FF:FF:FF:FF`, Opcode 1).
   - Switch Port 1 learning & flooded broadcast egress.
   - Non-target inspection & silent discard vs. target match & ARP cache update.
   - Target unicast ARP Reply (`AA:AA:...`, Opcode 2) and queued IP packet transmission.
3. **Remote-Subnet Gateway Transfer:** Proving that off-link destinations trigger an ARP Request for the **Default Gateway's IP**, while preserving the remote destination IP in the queued Layer 3 payload.
4. **Subnet Mask Mismatch Diagnostic:** Isolating asymmetric routing where Host A sends ARP locally, but Host B considers Host A remote, causing one-way packet drops.

---

## 1. The 5-Stage Cognitive Fading Sequence

```
┌────────────────────────────────────────────────────────────────────────┐
│                   MODULE 5 ARP COGNITIVE FADING MODEL                  │
├─────────┬───────────────────┬──────────────────────────────────────────┤
│ STAGE   │ PEDAGOGICAL ROLE  │ SCENARIO & BEHAVIOR                      │
├─────────┼───────────────────┼──────────────────────────────────────────┤
│ Stage 1 │ Observe           │ Worked example on 192.168.1.10 ➔ .20:    │
│         │ (Worked Example)  │ Stepper reveals Queued Packet, Request   │
│         │                   │ Broadcast, Target Match, Unicast Reply.  │
├─────────┼───────────────────┼──────────────────────────────────────────┤
│ Stage 2 │ Complete          │ Guided calculation on 10.0.0.15 ➔ .30:   │
│         │ (Scaffolding)     │ 6 intermediate fields (CAM learn, drop,  │
│         │                   │ cache update, unicast reply, dequeue).   │
├─────────┼───────────────────┼──────────────────────────────────────────┤
│ Stage 3 │ Perform Indep.    │ Unscaffolded resolution on 192.168.5.50: │
│         │ (Faded Stepper)   │ Exact opcodes, egress ports, and cache   │
│         │                   │ updates submitted on scratchpad.         │
├─────────┼───────────────────┼──────────────────────────────────────────┤
│ Stage 4 │ Transfer          │ Remote Subnet Gateway Resolution:        │
│         │ (Authentic L2/L3) │ Host sends to 8.8.8.8; must ARP for      │
│         │                   │ Gateway 192.168.1.1 MAC, keeping L3 IP.  │
├─────────┼───────────────────┼──────────────────────────────────────────┤
│ Stage 5 │ Diagnose          │ Mask Mismatch & Asymmetric Ping:         │
│         │ (Fault Isolation) │ Host A (/24) vs Host B (/25); diagnose   │
│         │                   │ one-way ARP return drop & reconfigure.   │
└─────────┴───────────────────┴──────────────────────────────────────────┘
```

---

## 2. Stage 1 — Observe (The Worked Example)

### Scenario
- **Sender:** Host A (`192.168.1.10`, MAC `AA:AA:AA:AA:AA:AA`, Switch Port 1).
- **Target:** Host B (`192.168.1.20`, MAC `BB:BB:BB:BB:BB:BB`, Switch Port 2).
- **Non-Target:** Host C (`192.168.1.30`, MAC `CC:CC:CC:CC:CC:CC`, Switch Port 3).
- **Initial Cache State:** Host A's ARP table is empty (`Cache Miss`).

### The Queued Packet State Machine
When Host A initiates `ping 192.168.1.20`:
1. **Packet Buffered:**
   ```
   [FIFO QUEUE: 1 Packet Pending Resolution]
   ┌────────────────────────────────────────────────────────┐
   │ IP Payload: ICMP Echo Request                          │
   │ Layer 3: Src 192.168.1.10 ➔ Dst 192.168.1.20           │
   │ Layer 2: Src AA:AA:...    ➔ Dst [UNRESOLVED - ON HOLD] │
   └────────────────────────────────────────────────────────┘
   ```
2. **Stepper Step 1 — ARP Request Broadcast:**
   - Ethernet Header: `Dst: FF:FF:FF:FF:FF:FF`, `Src: AA:AA:AA:AA:AA:AA`.
   - ARP Payload: `Sender: 192.168.1.10 / AA:AA...`, `Target: 192.168.1.20 / 00:00:00:00:00:00`, `Opcode: 1 (REQUEST)`.
3. **Stepper Step 2 — Switch Port 1 Learning & Flood:**
   - Switch SW1 learns `Port 1 ➔ AA:AA:AA:AA:AA:AA`.
   - Frame flooded out Ports 2, 3, and 4.
4. **Stepper Step 3 — Host Inspection & Target Cache Update:**
   - Host C (Port 3) inspects Target IP `192.168.1.20` $\ne$ `192.168.1.30` $\implies$ **Silently Dropped**.
   - Host B (Port 2) inspects Target IP `192.168.1.20` $==$ `192.168.1.20` $\implies$ **Match!**
   - Host B updates its ARP table: `192.168.1.10 ➔ AA:AA:AA:AA:AA:AA`.
5. **Stepper Step 4 — Unicast ARP Reply & IP Dequeue:**
   - Host B sends unicast reply to `AA:AA:AA:AA:AA:AA` (`Opcode: 2`).
   - Switch forwards out Port 1 (known unicast).
   - Host A updates its ARP cache: `192.168.1.20 ➔ BB:BB:BB:BB:BB:BB`.
   - Queued ICMP Echo Request dequeues and transmits out Port 1 with `Dst MAC: BB:BB:BB:BB:BB:BB`!

---

## 3. Stage 2 — Complete (Guided Practice with Intermediate Scaffolding)

### Scenario
- Host X (`10.0.0.15`, `11:11...`, Port 1) pings Host Y (`10.0.0.30`, `22:22...`, Port 3). Non-target Host Z (`10.0.0.45`, Port 2).

### Intermediate Scaffolding Fields
1. **ARP Request Ethernet Destination:** `FF:FF:FF:FF:FF:FF`
2. **Switch Ingress Learning:** `Port 1 ➔ 11:11:11:11:11:11`
3. **Non-Target Host Z Action:** `Silently discards packet (Target IP mismatch)`
4. **Target Host Y Action:** `Records 10.0.0.15 ➔ 11:11:11:11:11:11 in ARP cache`
5. **ARP Reply Ethernet Destination:** `11:11:11:11:11:11` (Unicast)
6. **Queued IP Packet Action:** `Dequeues and transmits immediately`

---

## 4. Stage 3 — Perform Independently (No Answer Leaks, Faded Stepper)

### Scenario
- Host M (`192.168.5.50`, MAC `55:55...`, Port 4) pings Host N (`192.168.5.75`, MAC `77:77...`, Port 2). Stepper is collapsed.

### Required Learner Inputs
1. **ARP Request Target Hardware Address (MAC):** `00:00:00:00:00:00` (Unknown placeholder).
2. **Switch Egress Ports for Request:** `Ports 1, 2, 3` (All except ingress Port 4).
3. **Target Host N Cache Entry:** `192.168.5.50 ➔ 55:55:55:55:55:55`.
4. **ARP Reply Destination MAC:** `55:55:55:55:55:55`.
5. **Switch Action for Reply:** `Unicast forward to Port 4 only`.
6. **Status of IP Packet during resolution:** `Buffered in memory queue`.

---

## 5. Stage 4 — Transfer (Remote Subnet ARP Resolution: Gateway MAC vs. Destination IP)

### Scenario & Core Cognitive Hurdle
- **Topology:**
  - Host A: `192.168.1.50/24`, Default Gateway `192.168.1.1` (`GW:01:01:01:01:01`).
  - Destination: Remote Public DNS `8.8.8.8`.
- **The Hurdle:** Beginners often assume the host sends an ARP Request asking *"Who has 8.8.8.8?"*.
- **The Correct Rule:**
  - Host A applies subnet mask: `8.8.8.8` is **Off-Link (Remote)**.
  - Host A initiates ARP for **`192.168.1.1` (Default Gateway)**.
  - Target IP in ARP Request: `192.168.1.1` (NOT `8.8.8.8`).
  - Once resolved, the IP Packet is encapsulated:
    - Layer 2 Frame Dst MAC: `GW:01:01:01:01:01`
    - Layer 3 Packet Dst IP: `8.8.8.8` (Preserved end-to-end!)

---

## 6. Stage 5 — Diagnose (Subnet Mask Mismatch & Asymmetric ARP Drops)

### The Malfunctioning Topology
- Host A: IP `192.168.1.10`, Mask `255.255.255.0` (`/24`), GW `192.168.1.1`.
- Host B: IP `192.168.1.200`, Mask `255.255.255.128` (`/25`), GW `192.168.1.129`.
- Both connected to Switch Ports 1 and 2 in VLAN 10.

### Asymmetric Failure Mechanics
1. **Outbound Probe:** Host A pings Host B (`192.168.1.200`). Host A's `/24` mask classifies `.200` as **LOCAL**. Host A broadcasts ARP Request.
2. **Receipt:** Host B receives ARP Request, updates its ARP table (`192.168.1.10 ➔ AA:AA...`).
3. **The Drop:** Host B attempts to transmit reply to `192.168.1.10`. Host B's `/25` mask classifies `.10` as **REMOTE** (outside `.128–.255`). Host B attempts to route via gateway `.129`, which fails, dropping the reply!
4. **Symptom:** Host A experiences 100% packet loss despite Host B having received the request.
5. **Resolution:** Reconfigure Host B's subnet mask to `255.255.255.0` (`/24`).
