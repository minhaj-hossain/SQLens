# Module 4 Pilot Specification: IPv4 Subnetting, Boundaries & Local vs. Remote Forwarding

> **Document Version:** 1.1.0 (Rigorous Technical Refinement)  
> **Status:** Approved Pilot Architecture Specification  
> **Location:** `docs/networking/NETWORKING_MODULE_4_SUBNETTING_PILOT_SPEC.md`  
> **Pedagogical Model:** 5-Stage Cognitive Fading (Observe ➔ Complete ➔ Perform ➔ Transfer ➔ Diagnose)

---

## Executive Overview

This specification details the complete learner experience for **Module 4, Concept 2: CIDR Subnet Boundaries, Usable Host Ranges, and Forwarding Decisions**.

Version 1.1.0 incorporates essential technical corrections:
1. **Precise Next-Hop Routing Behavior:** Replaces vague "circular loop" phrasing with accurate host routing table and neighbor-resolution failure semantics when a configured gateway is off-link.
2. **Unambiguous Topology & Broadcast Domain Definitions:** Explicitly specifies VLAN memberships, physical router interfaces, and broadcast domain boundaries so Layer 2 and Layer 3 interactions are technically sound.
3. **Synchronized Multi-Device Corrective Configuration:** Guarantees that router interface addressing, workstation IP/mask, and gateway definitions correspond to a reachable, working topology.
4. **Curricular Dependency Alignment:** Clearly delineates what is assumed from Modules 1–2, what is assessed in Module 4 (the IP subnet boundary decision), and what is deferred to Module 5 (the ARP resolution mechanism).
5. **Universal Subnetting Method (The Active Octet Rule):** Ensures beginners do not falsely generalize the 4th-octet shortcut to `/20` or `/23` subnets.

---

## 1. Generalizing the Subnetting Method: The Active Octet Rule

To prevent learners from assuming that subnet increments only exist in the 4th octet, the curriculum explicitly introduces the **Active (Interesting) Octet Rule**:

```
┌────────────────────────────────────────────────────────────────────────┐
│                     THE ACTIVE OCTET RULE                              │
├─────────────┬──────────────┬───────────────┬───────────────────────────┤
│ CIDR Prefix │ Active Octet │ Octet Base    │ Host Bits in Active Octet │
├─────────────┼──────────────┼───────────────┼───────────────────────────┤
│ /1 to /8    │ Octet 1      │ Base = /0     │ H = 8 - Prefix            │
│ /9 to /16   │ Octet 2      │ Base = /8     │ H = 16 - Prefix           │
│ /17 to /24  │ Octet 3      │ Base = /16    │ H = 24 - Prefix           │
│ /25 to /32  │ Octet 4      │ Base = /24    │ H = 32 - Prefix           │
├─────────────┴──────────────┴───────────────┴───────────────────────────┤
│ Universal Formula:                                                     │
│   Block Increment = 2 ^ (Bits remaining in Active Octet)               │
│                                                                        │
│ Example for /22 on 10.50.14.0/22:                                      │
│   • Active Octet: Octet 3 (since 22 is between 17 and 24).             │
│   • Host bits in Octet 3: 24 - 22 = 2 bits.                            │
│   • Increment: 2^2 = 4 in the 3rd octet!                               │
│   • Subnet multiples in 3rd octet: 0, 4, 8, 12, 16...                  │
│   • 14 falls in block 12.0 ➔ Network: 10.50.12.0/22                    │
│   • Next block: 10.50.16.0 ➔ Broadcast: 10.50.15.255                  │
└────────────────────────────────────────────────────────────────────────┘
```

*Scaffolding note:* Stages 1–3 use the 4th octet (`/25` through `/28`) to control initial cognitive load on binary conversion, while a dedicated visual callout explicitly anchors the Active Octet rule so learners understand that `/20` or `/22` operates identically on Octet 3.

---

## 2. Learning-Sequence Dependencies: Module 4 vs. Module 5 (ARP)

We explicitly separate what is tested in Module 4 from what is deferred to Module 5:
- **Prior Knowledge (Assumed from Module 1 & 2):**
  - An Ethernet frame encapsulates an IP packet.
  - A local host sends directly to the destination's MAC address; a remote packet must be addressed at Layer 2 to the Default Gateway's MAC address.
- **Assessed in Module 4 (Core Objective):**
  - Calculating whether a destination IP is **on-link (local)** or **off-link (remote)** using the IP address and subnet mask.
  - Using that boundary calculation to make the Layer 2 forwarding decision: *"Do I target the host's MAC or the gateway's MAC?"*
- **Deferred to Module 5 (ARP Deep-Dive):**
  - How the host dynamically discovers that MAC address via ARP broadcast and unicast reply if it is not already in the ARP cache. In Module 4, assume the required MAC is known or resolves normally once the forwarding target is chosen.

---

## 3. Stage 1 — Observe (The Worked Example)

### Scenario & Objective
- **Target IP:** `192.168.10.130/26`
- **Objective:** Observe how the 32-bit subnet mask splits the 4th octet into 2 subnet bits and 6 host bits, determining the network address, broadcast address, and usable range.

### Interface & Bit-Slicer Visual State
```
Octets 1–3: 192.168.10 (All 24 bits solid Blue Network color)
Octet 4 (130 decimal):
Bit index:   24  25  │  26  27  28  29  30  31
Binary:       1   0  │   0   0   0   0   1   0   (130 decimal)
Subnet Mask:  1   1  │   0   0   0   0   0   0   (192 decimal)
              ▲      │   ▲
         Network bits│   Host bits (6 bits)
         (2 bits)    │   Block increment = 2^6 = 64
```
A vertical glowing divider sits between Bit 25 and Bit 26 (after the 26th bit).

### Step-by-Step Interactive Timeline
1. **Phase 1: "Identify the Boundary & Increment"**
   - Active octet is Octet 4 (prefix 26).
   - Remaining host bits in octet: $32 - 26 = 6$ bits.
   - Increment: $2^6 = 64$. Subnets start at multiples of 64: `0, 64, 128, 192`.
2. **Phase 2: "Derive the Network Address (Zero Host Bits)"**
   - The 6 host bits animate to all zeros (`000000`).
   - The 4th octet reads `10000000` ($128$).
   - Network Address: **`192.168.10.128`**.
3. **Phase 3: "Derive the Broadcast Address & Usable Range"**
   - The 6 host bits animate to all ones (`111111` = $63$).
   - Calculation: $128 + 63 = 191$. Broadcast Address: **`192.168.10.191`**.
   - Usable Range: First host = $128 + 1 = 129$; Last host = $191 - 1 = 190$. Usable capacity = $2^6 - 2 = 62$.

---

## 4. Stage 2 — Complete (Guided Practice with Intermediate Scaffolding)

### Scenario
- **Target IP:** `192.168.10.65/26`
- **Initial State:** Bit-slicer is interactive (slider set to `/26`), and intermediate prompts guide the learner step by step.

### Learner Inputs & Expected Outputs
```
[ Step 1: Host Bits in Active Octet ]
Remaining Host Bits = 32 - [ 26 ] = [ 6 ]

[ Step 2: Increment ]
Block Size = 2 ^ [ 6 ] = [ 64 ]

[ Step 3: Subnet Multiple ]
Which multiple of 64 contains .65?
Subnet blocks: 0, 64, 128, 192
Network Address: 192.168.10.[ 64 ]

[ Step 4: Broadcast & Usable Range ]
Broadcast Address (Network + Increment - 1): 192.168.10.[ 127 ]
First Usable Host: 192.168.10.[ 65 ]
Last Usable Host:  192.168.10.[ 126 ]
Total Usable Hosts: [ 62 ]
```

### Deterministic Grading & Misconception Feedback
- **Increment = 32 or 128:** "Remember that increment is $2^H$, where $H$ is the number of host bits in the active octet ($H = 6 \implies 2^6 = 64$)."
- **Network Address = `192.168.10.0`:** "`.0` covers `.0` through `.63`. Because the target address is `.65`, it falls into the next block starting at `.64`."
- **Usable Hosts = 64:** "You calculated the total number of IP addresses in the block ($2^6 = 64$). Remember to subtract 2 for the network address (`.64`) and broadcast address (`.127`). Usable count is 62."

---

## 5. Stage 3 — Perform Independently (No Answer Leaks, Faded Visualizer)

### Scenario
- **Target IP:** `172.16.20.100/27`
- **Fading Rule:** The bit-slicer is **hidden/collapsed**. The learner must perform the calculation on scratchpad or mentally and submit numeric values. (The visualizer unlocks only *after* submission as a review tool).

### Learner Inputs (Clean Numerical Entry)
```
1. Subnet Mask (Dotted-Decimal):    [ 255.255.255.224           ]
2. Subnet Network Address:          [ 172.16.20.96              ]
3. Subnet Broadcast Address:        [ 172.16.20.127             ]
4. First Usable Host IP:            [ 172.16.20.97              ]
5. Last Usable Host IP:             [ 172.16.20.126             ]
6. Total Usable Host Capacity:      [ 30                        ]
```

### Deterministic Grading & Misconception Feedback
- **Entered Network Address `172.16.20.0`:**
  - *Feedback:* "You defaulted to `.0`. A `/27` has 5 host bits ($2^5 = 32$ increment). Subnets start at `0, 32, 64, 96, 128`. Since 100 is between 96 and 127, the network address is `172.16.20.96`."
- **Entered Broadcast Address `172.16.20.128`:**
  - *Feedback:* "`.128` is the network address of the *next* subnet. The broadcast address is one less than the next subnet: $96 + 32 - 1 = 127$."
- **Entered Capacity `32`:**
  - *Feedback:* "$2^5 = 32$ total addresses, but `.96` (network ID) and `.127` (broadcast ID) cannot be assigned to hosts. You must subtract 2."

---

## 6. Stage 4 — Transfer (Authentic Layer 2 vs. Layer 3 Forwarding Decision)

### Precise Topology & Broadcast Domain Specification
To ensure the networking consequences are technically accurate:
- **Switch 1:** Configured with two isolated broadcast domains:
  - **VLAN 10:** Subnet `10.10.4.80/28`.
    - Host Workstation A: Port 1 (Access VLAN 10), IP `10.10.4.82/28`, Gateway `10.10.4.81`.
    - Destination 1: Port 2 (Access VLAN 10), IP `10.10.4.94/28`.
    - Router Interface `Gig0/0.10`: IP `10.10.4.81/28`, MAC `GW:81:81:81:81:81`.
  - **VLAN 20:** Subnet `10.10.4.96/28`.
    - Destination 2: Port 5 (Access VLAN 20), IP `10.10.4.98/28`.
    - Router Interface `Gig0/0.20`: IP `10.10.4.97/28`, MAC `GW:97:97:97:97:97`.

```
        ┌─────────────────────────────────────────────────────────────┐
        │                          ROUTER R1                          │
        │   Gig0/0.10: 10.10.4.81/28        Gig0/0.20: 10.10.4.97/28  │
        └──────────────┬──────────────────────────────┬───────────────┘
                       │                              │
         VLAN 10 Trunk │                VLAN 20 Trunk │
        ┌──────────────┴──────────────────────────────┴───────────────┐
        │                          SWITCH SW1                         │
        │   [Port 1: VLAN 10]    [Port 2: VLAN 10]   [Port 5: VLAN 20]│
        └──────────┬─────────────────────┬────────────────────┬───────┘
                   │                     │                    │
              Workstation A         Destination 1        Destination 2
             10.10.4.82/28          10.10.4.94/28        10.10.4.98/28
```

### Learner Inputs & Decisions
```
[ Step 1: Calculate Workstation A's Subnet Boundary ]
Workstation A Network Address:   [ 10.10.4.80  ]
Workstation A Broadcast Address: [ 10.10.4.95  ]

[ Step 2: Delivery Decision for Destination 1 (10.10.4.94) ]
Subnet Boundary Check: Is .94 within 10.10.4.80 - 10.10.4.95?
Subnet Status:     (●) Local Subnet (On-Link)   ( ) Remote Subnet (Off-Link)
Forwarding Action: [ Deliver directly across local VLAN 10 switch        ▼]
Ethernet Dest MAC: [ Destination 1's MAC Address (AA:94:...)             ▼]

[ Step 3: Delivery Decision for Destination 2 (10.10.4.98) ]
Subnet Boundary Check: Is .98 within 10.10.4.80 - 10.10.4.95?
Subnet Status:     ( ) Local Subnet (On-Link)   (●) Remote Subnet (Off-Link)
Forwarding Action: [ Deliver to Default Gateway Router (Gig0/0.10)       ▼]
Ethernet Dest MAC: [ Default Gateway's MAC Address (GW:81:...)            ▼]
```

### Real-World Consequence Feedback (Why This Matters)
- **If learner marks Destination 2 (`10.10.4.98`) as Local:**
  - *Grading:* Incorrect.
  - *Network Consequence:* "Workstation A computes that `.98` is outside its `/28` range (`.80–.95`). If Workstation A incorrectly assumed `.98` was local, it would send an ARP request for `10.10.4.98` out its interface. Because Switch 1 isolates VLAN 10 from VLAN 20, the ARP broadcast would never enter VLAN 20. Destination 2 would never receive the request, and communication would fail with an ARP timeout. By recognizing `.98` as remote, Workstation A stamps the Ethernet frame with Default Gateway `10.10.4.81`'s MAC, allowing Router R1 to route the packet across to VLAN 20."

---

## 7. Stage 5 — Diagnose (Fault Isolation in Broken Subnetting)

### The Malfunctioning Topology & Initial State
A remote office reports that Workstation B cannot connect to the corporate network or Internet:
- **Physical & Layer 2 Setup:**
  - Switch Port 1 connects to Router `Gig0/0`.
  - Switch Port 2 connects to Workstation B.
  - Both ports are untagged Access ports in **VLAN 10** (a single shared Layer 2 broadcast domain).
  - Link status LEDs on both switch ports and NICs are **SOLID GREEN**.
- **The Misconfiguration:**
  - Workstation B: Configured as IP `192.168.1.120`, Subnet Mask `255.255.255.128` (`/25`), Default Gateway `192.168.1.129`.
  - Router Interface `Gig0/0`: Configured as IP `192.168.1.129`, Subnet Mask `255.255.255.128` (`/25`).

```
    Workstation B                                   Router R1 (Gig0/0)
    IP: 192.168.1.120/25                            IP: 192.168.1.129/25
    Gateway: 192.168.1.129                          (Connected on VLAN 10)
            │                                               │
            └───────► [Switch Port 2]       [Switch Port 1] ◄───────┘
                                VLAN 10 (Access)
```

### Technical Root Cause: Route & Next-Hop Resolution Failure
When Workstation B attempts to transmit a packet to an Internet host (or tries to `ping 192.168.1.129`):
1. **Subnet Evaluation:** Workstation B checks whether target `192.168.1.129` is on-link:
   $$\text{Local Subnet} = 192.168.1.0/25 \quad (\text{Range: } 192.168.1.0 \text{ to } 192.168.1.127)$$
   Since `.129` is outside `.0–.127`, Workstation B evaluates it as **off-link (remote)**.
2. **Next-Hop Lookup:** To reach a remote destination, Workstation B consults its routing table for the Default Gateway: `192.168.1.129`.
3. **The Next-Hop Failure (Not a Forwarding Loop):**
   - The OS routing engine inspects the default gateway IP (`192.168.1.129`).
   - A host can only send traffic to a gateway if that gateway itself is directly reachable via an **on-link interface route**.
   - Because `192.168.1.129` does not match Workstation B's on-link route (`192.168.1.0/25`), the routing table cannot resolve an interface or a next-hop link-layer address for the gateway.
   - The OS network stack treats the gateway as **unreachable/indirect**. The packet is discarded immediately inside the host's IP stack with an error (e.g. `Destination host unreachable` or `Network is unreachable`), without transmitting an Ethernet frame onto the wire.

### Learner Inputs & Diagnostic Isolation
```
[ Step 1: Compute the Subnet Ranges ]
Workstation B Subnet (192.168.1.120/25): [ 192.168.1.0   ] to [ 192.168.1.127 ]
Router Gig0/0 Subnet (192.168.1.129/25): [ 192.168.1.128 ] to [ 192.168.1.255 ]

[ Step 2: Identify the Root Cause ]
[●] Workstation B and Router Gig0/0 are assigned IP addresses in two different /25 
    subnets, making the default gateway off-link to the workstation.
[ ] The /25 mask allows 0 usable host addresses.
[ ] Switch VLAN 10 is blocking IP packets because the physical link is down.

[ Step 3: Explain the Transmission Failure ]
"When Workstation B attempts to reach 192.168.1.129, why does the connection fail?"
[●] Workstation B determines that 192.168.1.129 is on a remote subnet. Because its 
    configured gateway is also on that remote subnet, the routing table cannot 
    resolve an on-link path to the gateway, dropping the packet locally.
[ ] The packet loops endlessly between the workstation and switch until TTL expires.
[ ] The router receives the frame but drops it because .120 is an even number.
```

### Complete Synchronized Corrective Configuration
A gateway address is useless unless it corresponds to a live, matching router interface on the same broadcast domain.

The learner must provide the **synchronized two-device correction**:

```
[ Step 4: Propose the Complete Network Correction ]
Option A (Align to Subnet 1: 192.168.1.0/25):
  • Router Gig0/0 IP:       [ 192.168.1.1   ]  (Usable in 192.168.1.0/25)
  • Router Gig0/0 Mask:     [ 255.255.255.128 ] (/25)
  • Workstation B IP:       [ 192.168.1.120 ]  (Unchanged)
  • Workstation B Mask:     [ 255.255.255.128 ] (/25)
  • Workstation B Gateway:  [ 192.168.1.1   ]  (Points to Router Gig0/0)

Verification of Event Sequence After Fix:
  1. Workstation B checks gateway 192.168.1.1 against its mask /25 ➔ ON-LINK.
  2. Workstation B broadcasts ARP Request for 192.168.1.1 on VLAN 10.
  3. Router Gig0/0 receives ARP broadcast on VLAN 10 and replies with its MAC.
  4. Workstation B populates ARP cache and forwards traffic to the router successfully.
```

---

## 8. Empirical Beginner Testing: Success Evidence & Acceptance Criteria

```
┌────────────────────────────────────────────────────────────────────────┐
│                        VALIDATION CRITERIA                             │
├───────────────────────┬────────────────────────────────────────────────┤
│ USABILITY CRITERIA    │ LEARNING EVIDENCE CRITERIA                     │
├───────────────────────┼────────────────────────────────────────────────┤
│ 1. 100% Task Naviga-  │ 1. Unassisted Independence:                    │
│    tion: Novices find │    ≥ 75% of novices correctly calculate the    │
│    all fields without │    network/broadcast addresses in Stage 3      │
│    prompting.         │    (Perform) with the bit-slicer collapsed     │
│                       │    and 0 hints opened.                         │
├───────────────────────┼────────────────────────────────────────────────┤
│ 2. Zero Input Format- │ 2. Boundary Decision Transfer:                 │
│    ting Confusion: 0% │    ≥ 80% of novices correctly classify Dest 1 │
│    of errors caused   │    as Local and Dest 2 as Remote in Stage 4    │
│    by dotted-decimal  │    based on the /28 calculation.               │
│    vs prefix syntax.  │                                                │
├───────────────────────┼────────────────────────────────────────────────┤
│ 3. Clear Feedback     │ 3. Root Cause Isolation:                       │
│    Comprehension:     │    ≥ 70% of novices in Stage 5 identify the    │
│    Learners read and  │    off-link gateway mismatch as the root cause │
│    correct errors on  │    without guessing or attributing it to a     │
│    their next trial.  │    physical wire failure.                      │
├───────────────────────┼────────────────────────────────────────────────┤
│ 4. Scaffolding Clari- │ 4. 24-Hour Retention Retest:                   │
│    ty: Learners don't │    When tested 24h later with an unseen prefix │
│    report feeling     │    (e.g. /29) with no visualizer, learners     │
│    trapped by the     │    calculate the usable range and host count   │
│    collapsed widget.  │    accurately.                                 │
└───────────────────────┴────────────────────────────────────────────────┘
```
