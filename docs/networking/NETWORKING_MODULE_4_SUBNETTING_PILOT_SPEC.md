# Module 4 Pilot Specification: IPv4 Subnetting, Boundaries & Local vs. Remote Forwarding

> **Document Version:** 1.0.0  
> **Status:** Approved Pilot Architecture Specification  
> **Location:** `docs/networking/NETWORKING_MODULE_4_SUBNETTING_PILOT_SPEC.md`  
> **Pedagogical Model:** 5-Stage Cognitive Fading (Observe ➔ Complete ➔ Perform ➔ Transfer ➔ Diagnose)

---

## Executive Overview

This specification details the complete learner journey for **Module 4, Concept 2: CIDR Subnet Boundaries, Usable Host Ranges, and Forwarding Decisions**.

It enforces:
1. **Fading Scaffolding:** Moving from an animated 32-bit bit-slicer to pure mental/arithmetic execution, ensuring the visualizer is a conceptual catalyst rather than a permanent crutch.
2. **Deterministic Evaluation:** 100% of numeric, range, and categorical choices are evaluated deterministically without free-text LLMs.
3. **Misconception-Targeted Feedback:** Errors trigger diagnostic feedback pinpointing the exact mental model failure (e.g. classful assumptions, off-by-one errors, neglecting the network/broadcast reservation).
4. **Authentic Transfer:** Tying the arithmetic calculation directly to Layer 2 vs. Layer 3 forwarding decisions.

---

## 1. Stage 1 — Observe (The Worked Example)

### Scenario & Objective
- **Target IP:** `192.168.10.130/26`
- **Objective:** Observe how the 32-bit subnet mask splits the 4th octet into 2 subnet bits and 6 host bits, determining the network address, broadcast address, and usable range.

### Interface & Bit-Slicer Visual State
The learner interacts with the **32-Bit Interactive Bit-Slicer**:
- **Octets 1–3 (`192.168.10`):** Shown in decimal and 8-bit binary (`11000000.10101000.00001010`). All 24 bits are solidly shaded in **Network Blue**.
- **Octet 4 (`130`):** Displayed in large, high-contrast bit cells:
  ```
  Bit index:   24  25  │  26  27  28  29  30  31
  Binary:       1   0  │   0   0   0   0   1   0   (130 decimal)
  Subnet Mask:  1   1  │   0   0   0   0   0   0   (192 decimal)
              ▲        │
         Network bits  │  Host bits (6 bits)
         (2 bits)      │  Block increment = 2^6 = 64
  ```
- **The Dividing Line:** A prominent vertical glowing divider sits between Bit 25 and Bit 26 (after the 26th bit).

### Worked Example Timeline Controls
Learner clicks **Next Step** through three animated phases:
1. **Phase 1: "Identify the Boundary"**
   - Visual: Prefix `/26` illuminates the boundary line. Formula badge displays: $\text{Host Bits} = 32 - 26 = 6$.
   - Calculation badge: $\text{Block Size (Increment)} = 2^6 = 64$. Subnets start at multiples of 64: `0, 64, 128, 192`.
2. **Phase 2: "Derive the Network Address (Zero Host Bits)"**
   - Visual: The 6 host bits animate to `000000`.
   - Result: `10` (Network bits) + `000000` (Host bits) = `10000000` ($128$).
   - Network Address: `192.168.10.128`.
3. **Phase 3: "Derive the Broadcast Address & Usable Range"**
   - Visual: The 6 host bits animate to all ones (`111111` = $63$).
   - Calculation: $128 + 63 = 191$. Broadcast Address: `192.168.10.191`.
   - Usable Range: First host = $128 + 1 = 129$; Last host = $191 - 1 = 190$. Total usable hosts = $2^6 - 2 = 62$.

---

## 2. Stage 2 — Complete (Guided Practice with Intermediate Scaffolding)

### Scenario
- **Target IP:** `192.168.10.65/26`
- **Objective:** Calculate the subnet parameters step-by-step with guided intermediate fields.

### Initial State
- The bit-slicer is interactive: slider is set to `/26`, displaying `192.168.10.65`.
- Scaffolding fields are presented sequentially with inline guidance cards.

### Learner Inputs & Expected Outputs
```
┌────────────────────────────────────────────────────────────────────────┐
│ GUIDED STEP 1: Host Bits Calculation                                   │
│   Remaining Host Bits = 32 - [ 26 ] = [   ]                           │
│   Expected: 6                                                          │
│                                                                        │
│ GUIDED STEP 2: Block Size (Increment)                                  │
│   Increment = 2 ^ [ 6 ] = [   ]                                        │
│   Expected: 64                                                         │
│                                                                        │
│ GUIDED STEP 3: Subnet Multiple                                         │
│   Which multiple of 64 contains .65?                                   │
│   Subnet Candidates: 0, 64, 128, 192                                   │
│   Network Address: 192.168.10.[   ]                                    │
│   Expected: 64                                                         │
│                                                                        │
│ GUIDED STEP 4: Broadcast & Usable Range                                │
│   Broadcast Address (Network + Increment - 1): 192.168.10.[   ]        │
│   Expected: 127                                                        │
│   Usable Range: 192.168.10.[   ] to 192.168.10.[   ]                   │
│   Expected: 65 to 126                                                  │
│   Usable Host Count (2^6 - 2): [   ]                                   │
│   Expected: 62                                                         │
└────────────────────────────────────────────────────────────────────────┘
```

### Deterministic Grading & Misconception Feedback
- **Error in Step 2 (Entered 32 or 128):**
  - *Feedback:* "Remember that increment is $2^H$, where $H$ is host bits. Here $H = 6$, so $2^6 = 64$."
- **Error in Step 3 (Entered 0):**
  - *Feedback:* "`.0` covers `.0` through `.63`. Because the target is `.65`, it falls into the next block starting at `.64`."
- **Error in Usable Count (Entered 64):**
  - *Feedback:* "You calculated the total number of IP addresses in the block ($2^6 = 64$). Remember to subtract 2 for the network address (`.64`) and broadcast address (`.127`). Usable count is 62."

### Role of Progressive Hints
- **Hint Tier 1 (Conceptual):** "Identify the increment first. For /26, $32 - 26 = 6$ bits, giving an increment of 64."
- **Hint Tier 2 (Formula):** "List the subnet multiples: `0, 64, 128, 192`. Identify which block `.65` falls into."
- **Hint Tier 3 (Full Solution Walkthrough):** Reveals step-by-step arithmetic without giving credit for unassisted solving.

---

## 3. Stage 3 — Perform Independently (No Answer Leaks, Faded Visualizer)

### Scenario
- **Target IP:** `172.16.20.100/27`
- **Scaffolding Fading Rule:** The bit-slicer is **hidden/collapsed**. The learner must perform the calculation on scratchpad or mentally and submit numeric values. (The visualizer unlocks only *after* submission as a review tool).

### Learner Inputs
```
┌────────────────────────────────────────────────────────────────────────┐
│ INDEPENDENT CALCULATION TASK                                           │
│ Target: 172.16.20.100 / 27                                             │
├────────────────────────────────────────────────────────────────────────┤
│ 1. Subnet Mask (Dotted-Decimal):    [ 255.255.255.224           ]      │
│ 2. Subnet Network Address:          [ 172.16.20.96              ]      │
│ 3. Subnet Broadcast Address:        [ 172.16.20.127             ]      │
│ 4. First Usable Host IP:            [ 172.16.20.97              ]      │
│ 5. Last Usable Host IP:             [ 172.16.20.126             ]      │
│ 6. Total Usable Host Capacity:      [ 30                        ]      │
└────────────────────────────────────────────────────────────────────────┘
```

### Deterministic Grading Rules
1. Exact string match on IP dotted-quad format (`/^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$/`).
2. Exact integer validation for capacity (`30`).

### Misconception-Targeted Error Responses
- **Entered Network Address `172.16.20.0`:**
  - *Diagnosed Misconception:* Defaulting to classful `/24` boundary.
  - *Feedback:* "You defaulted to `.0`. A `/27` has 5 host bits ($2^5 = 32$ increment). Subnets start at `0, 32, 64, 96, 128`. Since 100 is between 96 and 127, the network address is `172.16.20.96`."
- **Entered Broadcast Address `172.16.20.128`:**
  - *Diagnosed Misconception:* Confusing next subnet ID with current broadcast.
  - *Feedback:* "`.128` is the network address of the *next* subnet. The broadcast address is one less than the next subnet: $96 + 32 - 1 = 127$."
- **Entered Total Capacity `32`:**
  - *Diagnosed Misconception:* Forgetting $-2$ reservation rule.
  - *Feedback:* "$2^5 = 32$ total addresses, but `.96` (network ID) and `.127` (broadcast ID) cannot be assigned to hosts. You must subtract 2."

---

## 4. Stage 4 — Transfer (Authentic Layer 2 vs. Layer 3 Networking Decision)

### Scenario
A workstation is configured on a corporate branch LAN:
- **Host Workstation A:** IP `10.10.4.82`, Subnet Mask `255.255.255.240` (`/28`), Default Gateway `10.10.4.81`
- **Workstation A attempts to send packets to two different destinations:**
  - **Destination 1:** `10.10.4.94`
  - **Destination 2:** `10.10.4.98`

### Learner Inputs & Decisions
```
┌────────────────────────────────────────────────────────────────────────┐
│ STEP 1: Calculate Workstation A's Subnet Boundary                      │
│   Network Address:       [ 10.10.4.80  ]                               │
│   Broadcast Address:     [ 10.10.4.95  ]                               │
├────────────────────────────────────────────────────────────────────────┤
│ STEP 2: Delivery Decision for Destination 1 (10.10.4.94)               │
│   Subnet Status:         [ (●) Local Subnet   ( ) Remote Subnet ]      │
│   Forwarding Action:     [ Deliver directly via local Layer 2 Switch ▼]│
│   Ethernet Dest MAC:     [ Destination 1's MAC Address (AA:94:...)  ▼]│
├────────────────────────────────────────────────────────────────────────┤
│ STEP 3: Delivery Decision for Destination 2 (10.10.4.98)               │
│   Subnet Status:         [ ( ) Local Subnet   (●) Remote Subnet ]      │
│   Forwarding Action:     [ Deliver to Default Gateway Router        ▼]│
│   Ethernet Dest MAC:     [ Default Gateway's MAC Address (GW:81:...) ▼]│
└────────────────────────────────────────────────────────────────────────┘
```

### Deterministic Grading & Real-World Consequences
- **If learner marks Destination 2 (`10.10.4.98`) as Local:**
  - *Grading:* Incorrect.
  - *Network Consequence Feedback:* "Because `.98` is greater than `.95`, it lies on a different subnet (`10.10.4.96/28`). If Workstation A assumed it was local, it would send an ARP request for `.98` on the local switch. The switch would flood the request, but `.98` is on a different physical or virtual network segment and would never receive it. Workstation A must send the frame to its Default Gateway (`10.10.4.81`) at Layer 2."

---

## 5. Stage 5 — Diagnose (Fault Isolation in Broken Subnetting)

### The Malfunctioning Network Topology
A remote office reports that Workstation B cannot connect to the company file server or the Internet.
- **Switch Configuration:** Ports 1 and 2 are in VLAN 10.
- **Router Interface `Eth0/1`:** Configured as `192.168.1.129`, Subnet Mask `255.255.255.128` (`/25`).
- **Workstation B:** Configured as `192.168.1.120`, Subnet Mask `255.255.255.128` (`/25`), Default Gateway `192.168.1.129`.
- **Diagnostic Evidence:**
  - Link status LEDs on both switch and workstation are **SOLID GREEN**.
  - Ping from Workstation B to `192.168.1.129` results in `Destination host unreachable`.

### Learner Inputs & Diagnostic Isolation
```
┌────────────────────────────────────────────────────────────────────────┐
│ STEP 1: Compute the Subnet Ranges                                      │
│   Workstation B Subnet (192.168.1.120/25):                             │
│     Range: [ 192.168.1.0   ] to [ 192.168.1.127 ]                      │
│   Router Gateway Subnet (192.168.1.129/25):                            │
│     Range: [ 192.168.1.128 ] to [ 192.168.1.255 ]                      │
├────────────────────────────────────────────────────────────────────────┤
│ STEP 2: Identify the Root Cause                                        │
│   [●] The workstation and default gateway are in two different /25     │
│       subnets separated by the .128 boundary.                          │
│   [ ] The subnet mask /25 provides zero usable host addresses.         │
│   [ ] The physical link is down because the IP addresses are odd/even. │
├────────────────────────────────────────────────────────────────────────┤
│ STEP 3: Explain the Communication Failure                              │
│   "When Workstation B attempts to send traffic to 192.168.1.129, it:    │
│    [ (●) Recognizes .129 is remote, looks for its default gateway, but │
│          its gateway is on the remote subnet, creating a circular loop]│
│    [ ( ) Broadcasts an ARP frame that gets dropped by the switch ]"    │
├────────────────────────────────────────────────────────────────────────┤
│ STEP 4: Provide the Corrective Configuration                           │
│   Enter a valid, usable Gateway IP for Workstation B's subnet:         │
│   IP: [ 192.168.1.1       ] (Valid entries: 192.168.1.1 to .126)       │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Distinguishing Conceptual Understanding from Visualizer Crutch

A critical hazard in interactive learning tools is **visualizer dependency**: learners slide controls until an indicator turns green without understanding the mathematics.

### Fading Scaffolding Architecture
To verify true independence, the platform enforces three strict boundaries:

```
Stage 1 (Observe): Visualizer fully unlocked and animated.
    │
    ▼
Stage 2 (Complete): Visualizer is present, but requires manual calculation entry.
    │
    ▼
Stage 3 (Perform): Visualizer is COLLAPSED & LOCKED.
    │              Learner must calculate and submit.
    │              (Unlocks post-submission for error inspection only).
    ▼
Stage 4 & 5 (Transfer & Diagnose): ZERO visualizer available.
                   Learner works exclusively with raw IP/CIDR specifications
                   and network topology tables.
```

If a learner can complete Stage 4 and Stage 5 with zero visualizer assistance and zero hints, we have empirical proof that the underlying mental model—not the UI widget—is driving the performance.

---

## 7. Beginner Validation: Evidence & Acceptance Criteria

We explicitly separate **Usability Success** (UI navigation) from **Learning Success** (cognitive mastery):

### A. Usability Criteria (The Interface Does Not Impede)
- **100% Task Discovery:** Novices locate the input fields without prompting.
- **Zero Input Ambiguity:** 0% of errors caused by formatting confusion (e.g., whether to type `/26` or `255.255.255.192`).
- **Clear State Transition:** Learners clearly recognize when an answer is evaluated versus when it is pending submission.

### B. Learning Criteria (Authentic Cognitive Transfer)
1. **Unassisted Independence:** $\ge 75\%$ of novice test subjects correctly calculate the network and broadcast addresses in **Stage 3 (Perform)** without opening Hint Tier 2 or 3.
2. **Transfer Across Subnet Boundaries:** $\ge 80\%$ of subjects correctly classify Destination 1 as Local and Destination 2 as Remote in **Stage 4 (Transfer)**.
3. **Articulation of Failure:** In **Stage 5 (Diagnose)**, $\ge 70\%$ of subjects identify that `.120` and `.129` belong to separate subnets under a `/25` mask, proving they have internalized the boundary rule.
4. **Retention Retest (24h+):** When presented with an unseen prefix (e.g. `/29`) 24 hours later with no hints, the learner calculates the usable range and host count accurately.
