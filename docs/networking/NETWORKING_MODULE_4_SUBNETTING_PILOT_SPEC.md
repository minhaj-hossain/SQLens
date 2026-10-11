# Module 4 Pilot Specification: IPv4 Subnetting, Boundaries & Forwarding

> **Document Version:** 1.2.0 (Final Approved Specification)  
> **Status:** Approved Pilot Architecture Specification  
> **Location:** `docs/networking/NETWORKING_MODULE_4_SUBNETTING_PILOT_SPEC.md`  
> **Pedagogical Model:** 5-Stage Cognitive Fading + Assessed Active-Octet Transfer

---

## Executive Overview

This specification details the approved learner experience for **Module 4, Concept 2: CIDR Subnet Boundaries, Usable Host Ranges, and Forwarding Decisions**.

Version 1.2.0 incorporates the final architectural refinements:
1. **Accurate Router-on-a-Stick Topology (Stage 4):** A single physical 802.1Q trunk link (`Router Gig0/0` $\leftrightarrow$ `Switch Port 24`) carrying tagged VLANs 10 and 20 into dedicated router subinterfaces (`Gig0/0.10` and `Gig0/0.20`), with explicit access ports for hosts.
2. **Explicit Simulated Host Next-Hop Mechanics (Stage 5):** Replaces ambiguous OS assumptions with a defined simulator routing model, exact terminal telemetry, and a two-device synchronized configuration task (aligning both Router `Gig0/0` and Workstation B).
3. **Assessed Active-Octet Transfer Task:** A no-hint assessment on `10.50.14.73/22` requiring mask calculation, network boundary, broadcast, usable host range ($1,022$ hosts), and local vs. remote classification in the 3rd octet.
4. **Historical Classful Wording Correction:** Replaces "classful /24 boundary" in the `/27` feedback with "assumed a /24 boundary" (respecting that `172.16.0.0` is historically Class B).
5. **Cross-Octet Delayed Retest:** Specifies an unseen prefix (`172.20.45.10/20`) testing the 3rd octet with an increment of 16 to evaluate 24-hour retention.

---

## 1. The Active Octet Rule & Scope

To prevent beginners from internalizing a false "4th-octet-only" shortcut, the curriculum explicitly anchors the **Active (Interesting) Octet Rule**:

```
┌────────────────────────────────────────────────────────────────────────┐
│                     THE ACTIVE OCTET RULE                              │
├─────────────┬──────────────┬───────────────┬───────────────────────────┤
│ CIDR Prefix │ Active Octet │ Octet Base    │ Host Bits in Active Octet │
├─────────────┼──────────────┼───────────────┼───────────────────────────┤
│ /1 to /8    │ Octet 1      │ Base = /0     │ H_active = 8 - Prefix     │
│ /9 to /16   │ Octet 2      │ Base = /8     │ H_active = 16 - Prefix    │
│ /17 to /24  │ Octet 3      │ Base = /16    │ H_active = 24 - Prefix    │
│ /25 to /32  │ Octet 4      │ Base = /24    │ H_active = 32 - Prefix    │
├─────────────┴──────────────┴───────────────┴───────────────────────────┤
│ Universal Formula:                                                     │
│   Block Increment = 2 ^ (Host Bits in Active Octet)                    │
│   • Octets before the Active Octet: Preserved unchanged.               │
│   • Octets after the Active Octet:  All 0s in Network Address;         │
│                                     All 255s in Broadcast Address.     │
│                                                                        │
│ Total Usable Hosts across the whole address = 2 ^ (32 - Prefix) - 2    │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Learning-Sequence Dependencies: Module 4 vs. Module 5 (ARP)

We strictly delineate the boundary between Module 4 and Module 5:
- **Assumed from Modules 1 & 2:** An Ethernet frame encapsulates an IP packet; local delivery targets the destination endpoint's MAC, while remote delivery targets the default gateway's MAC.
- **Assessed in Module 4 (Core Objective):** Applying the **subnet mask calculation** to determine whether an IP is on-link (local) or off-link (remote), and choosing the correct Layer 2 forwarding target (Destination MAC vs. Gateway MAC).
- **Deferred to Module 5 (ARP Deep-Dive):** The dynamic packet-level exchange of *how* that MAC address is discovered via ARP requests, replies, switch CAM learning, and cache expiration. In Module 4, learners assume the MAC is known or resolves normally once the forwarding target is selected.

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
  - *Feedback:* "You assumed a /24 boundary. A `/27` has 5 host bits ($2^5 = 32$ increment). Subnets start at `0, 32, 64, 96, 128`. Since 100 is between 96 and 127, the network address is `172.16.20.96`."
- **Entered Broadcast Address `172.16.20.128`:**
  - *Feedback:* "`.128` is the network address of the *next* subnet. The broadcast address is one less than the next subnet: $96 + 32 - 1 = 127$."
- **Entered Capacity `32`:**
  - *Feedback:* "$2^5 = 32$ total addresses, but `.96` (network ID) and `.127` (broadcast ID) cannot be assigned to hosts. You must subtract 2."

---

## 6. Stage 4 — Transfer (Authentic Layer 2 vs. Layer 3 Forwarding Decision)

### Precise Router-on-a-Stick Topology Specification
The network uses a standard Router-on-a-Stick architecture with a **single physical 802.1Q trunk cable**:

```
                              ROUTER R1
                       [Physical Interface Gig0/0]
                                  │
                  Single 802.1Q Trunk Link (Tagged VLANs 10, 20)
                                  │
                       [Switch Port 24: Trunk]
                             SWITCH SW1
    ┌─────────────────────────────┼─────────────────────────────┐
    │                             │                             │
[Port 1: Access VLAN 10]    [Port 2: Access VLAN 10]    [Port 5: Access VLAN 20]
    │                             │                             │
Workstation A               Destination 1               Destination 2
10.10.4.82/28               10.10.4.94/28               10.10.4.98/28
GW: 10.10.4.81
```

- **Router R1 Interface `Gig0/0`:** Single physical port with two 802.1Q subinterfaces:
  - `Gig0/0.10`: Encapsulation dot1Q 10, IP `10.10.4.81/28`, MAC `GW:81:81:81:81:81`
  - `Gig0/0.20`: Encapsulation dot1Q 20, IP `10.10.4.97/28`, MAC `GW:97:97:97:97:97`
- **Switch SW1 Configuration:**
  - `Port 24`: 802.1Q Trunk port connected to Router `Gig0/0` (allowing VLANs 10 and 20).
  - `Port 1`: Access port in VLAN 10 connected to Workstation A (`10.10.4.82/28`).
  - `Port 2`: Access port in VLAN 10 connected to Destination 1 (`10.10.4.94/28`).
  - `Port 5`: Access port in VLAN 20 connected to Destination 2 (`10.10.4.98/28`).

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
  - *Network Consequence:* "Workstation A computes that `.98` is outside its `/28` range (`.80–.95`). If Workstation A incorrectly assumed `.98` was local, it would send an ARP request for `10.10.4.98` out Port 1. Because Switch SW1 confines broadcasts on Port 1 to Access VLAN 10, the frame never enters Access VLAN 20 (Port 5). Destination 2 never sees it, causing an ARP timeout. By recognizing `.98` as remote, Workstation A stamps the Ethernet frame with Default Gateway `10.10.4.81`'s MAC, sending it across Trunk Port 24 to Router R1 for inter-VLAN routing."

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

### Simulated Host Routing Engine Rules
The simulation implements an explicit host routing evaluation engine:
1. **On-Link Route Derivation:** Workstation B derives its local on-link route from its IP and subnet mask:
   $$\text{Subnet} = 192.168.1.0/25 \quad (\text{Usable range: } 192.168.1.1 - 192.168.1.126)$$
2. **Next-Hop Evaluation Rule:** When sending to an off-link target or when pinging the gateway directly:
   - The host evaluates gateway IP `192.168.1.129` against its on-link route (`192.168.1.0/25`).
   - Because `192.168.1.129` is outside `.0–.127`, the simulator flags the configured gateway as **unreachable (off-link next-hop)**.
3. **Telemetry Displayed to the Learner:**
   - **Simulated Terminal `ip route show`:**
     ```
     default via 192.168.1.129 dev eth0 [status: unreachable - gateway not on link]
     192.168.1.0/25 dev eth0 proto kernel scope link src 192.168.1.120
     ```
   - **Simulated Ping Output:**
     ```
     C:\> ping 192.168.1.129
     PING 192.168.1.129: Destination host unreachable (no valid on-link route to gateway)
     ```
   - **Packet Sniffer View:** 0 packets transmitted on the physical link.

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
"Why does the simulated host fail to transmit packets to 192.168.1.129?"
[●] The host routing engine determines that 192.168.1.129 is not on its local subnet 
    (192.168.1.0/25). Because the gateway itself is off-link, the host cannot resolve 
    an on-link next hop and drops the packet internally before sending.
[ ] The frame loops endlessly between switch and router until TTL expires.
[ ] The router receives the frame but drops it because .120 is an even number.
```

### Complete Synchronized Two-Device Configuration Task
To resolve the fault, the learner must independently reconfigure both devices to align with Subnet 1 (`192.168.1.0/25`):

```
┌────────────────────────────────────────────────────────────────────────┐
│ CONFIGURATION CARD 1: Router R1 Interface Gig0/0                       │
│   IP Address:    [ 192.168.1.1       ] (Valid usable range: .1 to .126)│
│   Subnet Mask:   [ 255.255.255.128   ] (/25)                           │
├────────────────────────────────────────────────────────────────────────┤
│ CONFIGURATION CARD 2: Workstation B Settings                           │
│   IP Address:    [ 192.168.1.120     ] (Kept on Subnet 1)              │
│   Subnet Mask:   [ 255.255.255.128   ] (/25)                           │
│   Gateway:       [ 192.168.1.1       ] (Must match Router Gig0/0 IP!)  │
└────────────────────────────────────────────────────────────────────────┘

Verified Event Sequence After Learner Submission:
  1. Workstation B checks gateway 192.168.1.1 against /25 mask ➔ ON-LINK.
  2. Workstation B broadcasts ARP Request for 192.168.1.1 across VLAN 10.
  3. Router Gig0/0 receives ARP broadcast on VLAN 10 and replies with its MAC.
  4. Ping succeeds with 0% packet loss.
```

---

## 8. Assessed Active-Octet Transfer Task (The 3rd-Octet Challenge)

To prove that learners have mastered the universal subnetting formula and are not merely executing a 4th-octet shortcut, this **unassisted, no-hint assessment** tests a prefix in the **3rd octet**:

### Problem Statement
An enterprise allocates a branch office block: **`10.50.14.73/22`**.

### Learner Inputs (Clean Numerical Entry)
```
┌────────────────────────────────────────────────────────────────────────┐
│ ASSESSED ACTIVE-OCTET TASK (NO HINTS AVAILABLE)                        │
│ Target: 10.50.14.73 / 22                                               │
├────────────────────────────────────────────────────────────────────────┤
│ 1. Active (Interesting) Octet:       [ Octet 3 (3rd Octet)       ▼ ]   │
│ 2. Subnet Mask (Dotted-Decimal):     [ 255.255.252.0             ]     │
│ 3. Block Increment in Active Octet:  [ 4                         ]     │
│ 4. Subnet Network Address:           [ 10.50.12.0                ]     │
│ 5. Subnet Broadcast Address:         [ 10.50.15.255              ]     │
│ 6. First Usable Host IP:             [ 10.50.12.1                ]     │
│ 7. Last Usable Host IP:              [ 10.50.15.254              ]     │
│ 8. Total Usable Host Capacity:       [ 1022                      ]     │
├────────────────────────────────────────────────────────────────────────┤
│ 9. Forwarding Decision for Destination 10.50.15.200:                   │
│    [ (●) Local Subnet (On-Link)    ( ) Remote Subnet (Off-Link) ]      │
│                                                                        │
│ 10. Forwarding Decision for Destination 10.50.16.5:                    │
│    [ ( ) Local Subnet (On-Link)    (●) Remote Subnet (Off-Link) ]      │
└────────────────────────────────────────────────────────────────────────┘
```

### Deterministic Grading Rationale
- **Active Octet:** 22 is between 17 and 24 $\implies$ Octet 3.
- **Host Bits in Octet 3:** $24 - 22 = 2$ bits.
- **Increment:** $2^2 = 4$ in the 3rd octet. Multiples: `0, 4, 8, 12, 16...`
- **Subnet ID:** $14$ falls into the block starting at $12$ $\implies$ **`10.50.12.0`**.
- **Broadcast ID:** Next block is $16.0$, minus 1 $\implies$ **`10.50.15.255`**.
- **Capacity:** Total host bits $= 32 - 22 = 10 \implies 2^{10} - 2 = 1024 - 2 =$ **`1022`**.
- **Forwarding:** `.15.200` is inside `.12.0–.15.255` $\implies$ **Local**. `.16.5` is outside $\implies$ **Remote**.

---

## 9. Delayed Retest Specification (24-Hour Cross-Octet Retention)

To confirm long-term retention without scaffolding:
- **Scenario:** 24 hours post-module, the learner receives an unannounced quick assessment:
- **Test IP:** **`172.20.45.10/20`** (testing Octet 3 with an increment of $16$).
- **Success Criteria:** The learner correctly calculates:
  - Subnet Mask: `255.255.240.0`
  - Network Address: `172.20.32.0`
  - Broadcast Address: `172.20.47.255`
  - Total Usable Hosts: $4094$ ($2^{12} - 2$)
  - Zero hints permitted.

---

## 10. Empirical Acceptance Criteria: Usability vs. Learning Transfer

```
┌────────────────────────────────────────────────────────────────────────┐
│                        VALIDATION CRITERIA                             │
├───────────────────────┬────────────────────────────────────────────────┤
│ USABILITY CRITERIA    │ LEARNING TRANSFER CRITERIA                     │
├───────────────────────┼────────────────────────────────────────────────┤
│ 1. 100% Task Naviga-  │ 1. Active-Octet Independence:                  │
│    tion: Novices find │    ≥ 75% of novices correctly calculate the    │
│    all fields without │    mask, network ID, and usable capacity for   │
│    prompting.         │    10.50.14.73/22 in Section 8 with 0 hints.   │
├───────────────────────┼────────────────────────────────────────────────┤
│ 2. Zero Formatting    │ 2. Dual-Device Gateway Alignment:              │
│    Ambiguity: 0%      │    ≥ 80% of novices in Stage 5 reconfigure     │
│    input errors from  │    BOTH Router Gig0/0 and Workstation B to     │
│    dotted-decimal vs  │    matching Subnet 1 parameters.               │
│    prefix syntax.     │                                                │
├───────────────────────┼────────────────────────────────────────────────┤
│ 3. Clear Feedback     │ 3. Boundary Forwarding Decision:               │
│    Comprehension:     │    ≥ 85% of novices correctly classify .15.200 │
│    Learners read and  │    as Local and .16.5 as Remote in the /22     │
│    correct errors on  │    transfer task.                              │
│    their next trial.  │                                                │
├───────────────────────┼────────────────────────────────────────────────┤
│ 4. Scaffolding Clari- │ 4. 24-Hour Cross-Octet Retention:              │
│    ty: Learners don't │    ≥ 70% of novices successfully solve the     │
│    report feeling     │    172.20.45.10/20 retest 24 hours later with  │
│    trapped by the     │    no access to the visualizer.                │
│    collapsed widget.  │                                                │
└───────────────────────┴────────────────────────────────────────────────┘
```
