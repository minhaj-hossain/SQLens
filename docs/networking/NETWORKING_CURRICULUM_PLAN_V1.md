# Networking Track: Complete Curriculum & Interactive Implementation Plan
### *Target Audience: Entry-Level IT Support & Helpdesk Roles*

---

## 1. Architectural Foundations: Event-Sourced Engine & Separation of Concerns

### 1.1 Truthful Simulator vs. Mentor Commentary Layer
The simulation engine and mentor commentary are strictly decoupled:
* **The Network Engine is Authoritative and Truthful:** It executes a pure state machine over a typed topology model. It evaluates commands against actual physical connectivity, interface settings, ARP tables, and frame buffers. It never fakes or hardcodes results based on what the tutorial "wants" to happen.
* **The Mentor Layer is Reactive and Socratic:** The mentor observes state transitions and emitted engine events via **state/event predicates** (e.g. `event.type === 'COMMAND_EXEC' && event.command === 'ping' && event.outcome === 'TRANSMIT_FAIL_NO_CARRIER'`), rather than fragile raw command-string matching.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               EVENT-SOURCED ARCHITECTURE                               │
│                                                                                        │
│   Learner Action (e.g., Run Command, Seat Cable, Click Field)                          │
│        │                                                                               │
│        ▼                                                                               │
│   Action Log (Append-Only Array of Typed Events stored in memory & localStorage)       │
│        │                                                                               │
│        ▼                                                                               │
│   Pure Reducer: reduce(InitialTopology, ActionLog) ──► Current SimulationState         │
│        │                                                                               │
│        ├────────────────────────────────┬────────────────────────────────┐             │
│        ▼                                ▼                                ▼             │
│   Truthful I/O                     Topology Canvas              Mentor Predicate Layer │
│   (Terminal stdout,               (Port LEDs, Wire State,      (Observes state delta;  │
│    aria-live buffer)               Packet Animations)           fires Action/Evidence/ │
│                                                                 Concept commentary)    │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 General Topology Data Model (No Throwaway Code)
Rather than writing a bespoke simulator for Module 1, we define a **general-purpose, extensible networking domain model** used across the entire curriculum. Module 1 instantiates a 3-node graph on this model:

```typescript
// Core General Network Engine Types (src/lib/network-engine/types.ts)
// Strict JSON serializable: No Map, No ArrayBuffer, No Date.now()

export type MacAddress = string; // e.g. "00-1A-2B-3C-4D-10"
export type Ipv4Address = string; // e.g. "192.168.1.10"
export type SubnetMask = string; // e.g. "255.255.255.0"

export interface NetworkDevice {
  id: string; // e.g. "host-a", "sw1", "r1"
  name: string; // e.g. "Acme-PC-01"
  role: 'workstation' | 'switch' | 'router' | 'server';
  interfaces: Record<string, DeviceInterface>;
  // Fully serializable JSON record (no Map)
  arpTable: Record<Ipv4Address, { mac: MacAddress; type: 'dynamic' | 'static'; learnedAtTick: number }>;
  routeTable?: Array<{ destination: Ipv4Address; mask: SubnetMask; nextHop?: Ipv4Address; interfaceId: string }>;
}

export interface DeviceInterface {
  id: string; // e.g. "eth0", "gi0/0", "port-1"
  mac: MacAddress;
  ipConfig?: {
    mode: 'static' | 'dhcp';
    ip: Ipv4Address;
    mask: SubnetMask;
    gateway?: Ipv4Address;
  };
  connectedLinkId?: string;
  linkState: 'down' | 'negotiating' | 'up';
  linkSpeedMbps: number;
}

export interface PhysicalLink {
  id: string; // e.g. "cable-hostA-sw1"
  type: 'cat6-utp' | 'fiber' | 'internal';
  endpointA: { deviceId: string; interfaceId: string; isSeated: boolean };
  endpointB: { deviceId: string; interfaceId: string; isSeated: boolean };
  status: 'disconnected' | 'carrier-active' | 'faulty';
}

export interface EthernetFrame {
  destMac: MacAddress;
  sourceMac: MacAddress;
  etherType: '0x0800' | '0x0806' | '0x86DD';
  payloadHex: string; // Pure hex string representation, fully serializable
  fcsValid: boolean;
}

export type LearnerActionEvent =
  | { id: string; logicalTick: number; type: 'RUN_COMMAND'; command: string }
  | { id: string; logicalTick: number; type: 'SEAT_CABLE'; linkId: string }
  | { id: string; logicalTick: number; type: 'SELECT_CHIP'; chipId: string; value: string }
  | { id: string; logicalTick: number; type: 'CONTINUE'; beatId: string }
  | { id: string; logicalTick: number; type: 'ENTER_REVIEW'; targetBeatId: string }
  | { id: string; logicalTick: number; type: 'REPLAY_CHECKPOINT'; targetBeatId: string };

export interface SimulationState {
  logicalClock: number; // Integer tick counter (no Date.now())
  devices: Record<string, NetworkDevice>;
  links: Record<string, PhysicalLink>;
  packetTrace: EthernetFrame[];
  actionLog: LearnerActionEvent[];
  activeBeatId: string;
}

export interface SavedEngineSession {
  engineSchemaVersion: 1;
  scriptVersion: '1.0.0';
  actionLog: LearnerActionEvent[];
}
```

### 1.3 State Management, Review, Replay & Persistence
Because `SimulationState` is a pure reducer over `ActionLog`:
* **Review Mode (Non-Destructive Back Navigation):**
  Renders the simulation state at a prefix of the log: `reduce(InitialState, ActionLog.slice(0, targetCheckpointIndex))`. Read-only. The current active state is untouched.
* **Replay Checkpoint (State-Rewinding Retry):**
  Learner confirms via a dialog: *"Reset back to this step? Progress after this point will be undone."* Upon confirmation, an action `{ type: 'REPLAY_CHECKPOINT', targetBeatId }` truncates the log, automatically restoring cable disconnects, clearing ARP caches, and wiping subsequent terminal outputs.
* **Deterministic Refresh Persistence:**
  The `SavedEngineSession` is serialized to `localStorage` under key `sqlens_net_action_log_net01_v1`. On page load, `reduce(InitialState, savedSession.actionLog)` runs deterministically, re-hydrating the exact terminal, canvas, and mentor state without race conditions.

---

## 2. Pedagogical Architecture: The Socratic Spiral Curriculum

### 2.1 The 3-Layer Explanation Timing (Strictly AFTER Learner Action)
To ensure the learner is never left typing blind commands or abandoned with unanswered questions:

| Layer | Question Answered | Timing & Delivery Rule |
| :--- | :--- | :--- |
| **Layer A: Action** | *"What did that command just do?"* | **Immediate:** Delivered in plain language right after output on the command's first use (e.g. `ping` = knocking on a door; `ipconfig` = checking ID card; `arp -a` = checking the neighbor address book). |
| **Layer B: Evidence** | *"What does this specific result mean?"* | **Same Beat:** Directly connects terminal output to hardware reality. If the mentor posed an option-chip question, the answer and feedback (for both correct and incorrect choices) must close in this beat. |
| **Layer C: Concept Naming** | *"What is this officially called, and how does it fit?"* | **When Evidence is Meaningful:** Only introduces formal terms (e.g. Layer 1, ARP, MAC) after the physical evidence has been seen. Deeper theory is deferred via the **Parking Lot**. |

### 2.2 The "Acme Office" Scenario
Instead of disconnected, synthetic test cases, all 16 modules take place inside **Acme Logistics, Inc.** (an active fictional office environment):
* **The Cast:** You are the Junior IT Support Tech sitting at `Acme-PC-01`.
* **The Living Topology:** The network map shows your workstation (`Acme-PC-01`), the office access switch (`Acme-SW-01`), and the local gateway router (`Acme-RTR-01`) from the start:
  - **Module 1:** The switch (`Acme-SW-01`) is visible on the canvas and map as the physical intermediary connecting PC-01 to RTR-01. When first seen in Beat 3, it receives a one-line plain-language explanation: *"The box in the middle is an access switch—it passes traffic between office devices. We'll explore its inner workings in Module 3."*
  - **Module 3:** Unlocks the switch's inner workings (MAC address CAM table, per-port inspection, and selective forwarding), rather than the device's physical existence.
  - **Module 7:** Unlocks the regional warehouse router (`Acme-RTR-02`) and multi-hop routing.
  - **Module 9:** Unlocks the office DHCP/DC server (`Acme-SRV-01`).
  - **Module 10:** Unlocks the external Internet gateway and corporate DNS.

### 2.3 Concept Level Registry & Parking Lot Payoffs
Every networking concept is tracked through three distinct levels across the track:
1. **Level 1 (Introductory Hook):** High-level functional analogy (Module 1: ARP is an "address book of neighbors").
2. **Level 2 (Mechanism & Protocol):** Frame structure, packet exchange, timing (Module 5: ARP Request/Reply, broadcast domains, hold queues).
3. **Level 3 (Troubleshooting & Enterprise):** Anomaly resolution, spoofing, security (Module 15/16: Dynamic ARP Inspection, proxy ARP).

#### The Module 1 Simplification & Parking Lot Register
When a pedagogical simplification is used to avoid beginner cognitive overload, it is formally logged in the **Simplifications Register** with an explicit payoff module:

| Registered Simplification | Initial Rule Taught (Module 1) | Deeper Engineering Reality | Payoff Module |
| :--- | :--- | :--- | :--- |
| **Subnet Neighborhood Shortcut** | "If the first three numbers match (`192.168.1.x`), devices are on the same local street." | True only for `/24` (255.255.255.0). Arbitrary CIDR masks (`/26`, `/28`) split octets. | **Module 4 (Subnetting & CIDR)** |
| **Switch Forwarding** | "The switch passes traffic between office devices like an automated junction box." | Ingress MAC learning, CAM table aging, unknown unicast flooding. Frames do not travel point-to-point without switch forwarding decisions. | **Module 3 (Switching & CAM)** |
| **ARP Table Multicast Filter** | "Address book shows only discovered unicast neighbors." | Real Windows `arp -a` includes static multicast (`224.0.0.x`) and broadcast (`255.255.255.255`) groups. Filtered to reduce noise. | **Module 5 (ARP Protocol)** & **Module 6 (IPv6 Multicast)** |
| **Default Gateway Role** | "Gateway is the exit door, not needed for local neighbors." | Longest Prefix Match routing tables, hop-by-hop MAC rewrites, next-hop IP. | **Module 7 (Routing & Gateways)** |
| **TTL Expiry Counter** | "TTL stands for Time to Live—it prevents lost packets from looping forever." | Hop-by-hop TTL decrement by routers, ICMP Type 11 Time Exceeded. | **Module 7 (Routing & Gateways)** |
| **DNS Suffix** | "Connection-specific DNS Suffix: Ignore for now." | Local search domains appended to unqualified hostnames. | **Module 10 (DNS Resolution)** |

### 2.4 State-Predicate Advancement & "Evidence Already Seen" Gating
Beat advancement is evaluated strictly via state and event predicates on `SimulationState`, never by matching command strings:
* **Beat 1 Predicate:**
  ```typescript
  export const isBeat1Complete = (state: SimulationState): boolean =>
    state.actionLog.some(
      (a) => a.type === 'RUN_COMMAND' &&
             isPingCommand(a.command, '192.168.1.1') &&
             state.links['cable-hostA-sw1'].status === 'disconnected'
    );
  ```
* **Adapting to "Evidence Already Seen":**
  - **Early `ipconfig` during Beat 1:** If the learner runs `ipconfig` before pinging, the simulator runs it truthfully (displaying `Media disconnected`). When the learner subsequently runs `ping` and advances to Beat 2, the mentor adapts:
    *"You already took a peek at `ipconfig`! Let's examine that `Media disconnected` line closely."*
  - **Early `ping` after plugging cable (Beat 4):** If the learner pings right after plugging the cable, ARP resolution completes dynamically. When entering Beat 5 (checking empty ARP cache), the mentor adapts:
    *"You already tested the connection and populated our PC's neighbor list early! Let's run `arp -a` to see who answered."*
  - This prevents the simulator from contradicting itself or forcing artificial "un-learning".

---

## 3. Module 1 Beat Scripts: Evidence-First, Zero-Spoiler Flow

Module 1 is split into **Session A** (Physical & Interface) and **Session B** (Neighbors, ARP & Framing).

### Session A: Physical Continuity & Interface State

#### Beat 1: The Reachability Test
* **Mentor Prompt:**
  > *"We are at Workstation-01. Our user reports they cannot connect to the office router at `192.168.1.1`. Let's test the connection.*
  > *Type `ping 192.168.1.1` and press Enter."*
  > *(Tap chip `[ ping 192.168.1.1 ]` to fill input).*
* **Learner Action:** Types `ping 192.168.1.1` and presses Enter.
* **Simulator Result:**
  ```cmd
  Pinging 192.168.1.1 with 32 bytes of data:
  PING: transmit failed. General failure.
  PING: transmit failed. General failure.
  PING: transmit failed. General failure.
  PING: transmit failed. General failure.

  Ping statistics for 192.168.1.1:
      Packets: Sent = 4, Received = 0, Lost = 4 (100% loss),
  ```
* **Mentor Explanations:**
  - **Layer A (Action):** *"The `ping` command sends small test messages to another device and waits for a reply—like knocking on a door to see if anyone is home. Here, we knocked on `192.168.1.1`."*
  - **Layer B (Evidence):** *"Notice it didn't say 'Request timed out' (which means waiting for someone who didn't answer). It said `transmit failed. General failure.` Our computer couldn't even launch the knock out the door! Something is stopping the signal on our own PC."*
* **Advancement Gate:** `[ Continue → ]` button unlocks. Clicking advances to Beat 2.

---

#### Beat 2: Checking the ID Card
* **Mentor Prompt:**
  > *"Let's check our computer's network interface to see what it reports.*
  > *Type `ipconfig` and press Enter."*
* **Learner Action:** Types `ipconfig` and presses Enter.
* **Simulator Result:**
  ```cmd
  Windows IP Configuration

  Ethernet adapter Ethernet0:

     Media State . . . . . . . . . . . : Media disconnected
     Connection-specific DNS Suffix  . :
  ```
* **Mentor Explanations:**
  - **Layer A (Action):** *"The `ipconfig` command displays how this computer's network adapter is currently configured—like checking its employee badge and connection status."*
  - **Layer B (Evidence Question via Chips):**
    > *"Look at that second line: `Media State . . . : Media disconnected`.*
    > *In computer hardware, what does 'Media' refer to?"*
    > - `[ 🔘 A: The physical network cable or link ]` *(Correct)*
    > - `[ 🔘 B: Software programs installed on Windows ]` *(Incorrect feedback: "Software is applications; media is the physical path.")*
    > - `[ 🔘 C: The remote router in the server room ]` *(Incorrect feedback: "The router is a node; media is what connects us to it.")*
  - **Feedback & Layer C (Concept Naming):**
    > *"Right! 'Media' is the physical transmission medium (copper, fiber, or radio waves). 'Disconnected' means our network card senses no electrical link pulse. Our cable is unplugged!"*
* **Advancement Gate:** `[ Continue → ]` button unlocks. Advances to Beat 3.

---

#### Beat 3: Restoring Physical Layer 1
* **Right Side Shows:** **Physical Connection Canvas appears for the first time.**
  - Shows `Acme-PC-01` connected through an access switch `Acme-SW-01` to `Acme-RTR-01`.
  - Ethernet port on PC has LED indicator: `[LINK: OFF]`.
  - Unseated Cat6 patch cable hovering next to the port.
  - The cable connector is an accessible, focusable `<button>` (`Tab` $\rightarrow$ `Enter/Space` to seat).
* **Mentor Prompt:**
  > *"Look behind Workstation-01. The Ethernet cable is completely unplugged.*
  > *Click the cable (or press Enter on it) to plug it into the PC's port."*
* **Learner Action:** Seats the cable.
* **Simulator Result:**
  - Cable snaps into socket.
  - Port LED updates to: `[LINK: 1Gbps UP]`.
* **Mentor Explanations:**
  - **Layer A (Action):** *"Plugging the cable connected the copper pins so the PC and switch could detect each other's signal."*
  - **Layer B (Evidence):** *"The link light changed from `[LINK: OFF]` to `[LINK: 1Gbps UP]`."*
  - **Layer C (Concept Naming):** *"That cable and signal is **Layer 1: The Physical Layer**. Notice the little box in the middle? That's an access switch (`Acme-SW-01`)—it passes traffic between office devices. We'll explore its inner workings in Module 3.*
    *(Parked Item registered: 'Switch MAC learning & port forwarding $\rightarrow$ Module 3')."*
* **Advancement Gate:** `[ Continue → ]` button unlocks. Advances to Beat 4.

---

#### Beat 4: Verify the Interface and IP Configuration
* **Mentor Prompt:**
  > *"Now that the physical wire is connected, let's verify what Windows reports.*
  > *Type `ipconfig` and press Enter."*
* **Learner Action:** Types `ipconfig` and presses Enter.
* **Simulator Result:**
  ```cmd
  Windows IP Configuration

  Ethernet adapter Ethernet0:

     Connection-specific DNS Suffix  . : 
     IPv4 Address. . . . . . . . . . . : 192.168.1.10
     Subnet Mask . . . . . . . . . . . : 255.255.255.0
     Default Gateway . . . . . . . . . : 192.168.1.1
  ```
* **Mentor Explanations & Terminal Values Explained:**
  - **Layer A (Action):** *"We queried the network adapter's settings again."*
  - **Terminal Values Breakdown:**
    - `IPv4 Address: 192.168.1.10` $\rightarrow$ Our PC's unique address on this office network.
    - `Subnet Mask: 255.255.255.0` $\rightarrow$ Tells the PC which part is the neighborhood street (`192.168.1`) and which is our personal house number (`10`).
    - `Default Gateway: 192.168.1.1` $\rightarrow$ The exit door to reach devices outside our street *(parked $\rightarrow$ Module 7)*.
    - `Connection-specific DNS Suffix` $\rightarrow$ *Ignore this line for now (parked $\rightarrow$ Module 10 DNS).*
  - **Layer B (Evidence Question via Chips — Testing a New Case):**
    > *"Our PC is `192.168.1.10` with mask `255.255.255.0`. If we wanted to reach `192.168.2.5`, is it on our local street or outside?"*
    > - `[ 🔘 A: It's on a different street because the third number is 2, not 1 ]` *(Correct)*
    > - `[ 🔘 B: It's on our local street because both start with 192.168 ]` *(Incorrect feedback: "Under 255.255.255.0, all three numbers must match for local delivery!")*
  - **Feedback & Layer C (Concept Naming):**
    > *"Exactly right! Because the third number is different, `192.168.2.5` is outside our local street. But `192.168.1.1` shares `192.168.1`, so it is **on-link** (a direct neighbor). Connecting the cable didn't assign our static IP—it just activated the wire so our configured IP can talk!"*
* **Advancement Gate:** `[ Complete Session A → ]` advances to Session B.

---

### Session B: Neighbors, ARP & Ethernet Framing

#### Beat 5: Checking the Neighbor Address Book
* **Mentor Prompt (Zero Spoilers):**
  > *"Before sending another ping, let's see which local devices this PC already knows about.*
  > *Type `arp -a` and press Enter."*
* **Learner Action:** Types `arp -a` and presses Enter.
* **Simulator Result:**
  ```cmd
  No ARP Entries Found.
  ```
* **Mentor Explanations:**
  - **Layer A (Action):** *"The `arp -a` command asks Windows to show its internal address book of nearby physical devices."*
  - **Layer B (Evidence):** *"It returns `No ARP Entries Found.` Our computer knows it wants to reach IP `192.168.1.1`, but its address book has zero entries."*
  - **Layer C (Concept Naming):** *"That neighbor address book is called the **ARP Table**, and the physical hardware identifier it needs is a **MAC Address**."*
* **Advancement Gate:** `[ Continue → ]` button unlocks. Advances to Beat 6.

---

#### Beat 6: Dual-Protocol Resolution (Slow-Motion Ping)
* **Right Side Shows:** **Step-Through Controls appear above terminal:**
  `[ ⏸️ Slow-Motion Enabled ]` `[ Step 1: ARP Broadcast ]` `[ Step 2: ARP Reply ]` `[ Step 3: ICMP Echo ]`
* **Mentor Prompt:**
  > *"Watch what happens when we ping now. The simulator will pause in flight so you can see each step.*
  > *Type `ping 192.168.1.1` and press Enter."*
* **Learner Action:** Types `ping 192.168.1.1`.
* **Simulator Result:**
  - **Step 1 (Shout):** Host A broadcasts: *"Who has 192.168.1.1? Tell 192.168.1.10!"*
  - **Step 2 (Reply):** Router R1 replies directly: *"I have 192.168.1.1, my hardware MAC is `00-1A-2B-3C-4D-01`."*
  - **Step 3 (ICMP Echo):** Host A sends ICMP Echo Request. Router returns Echo Reply.
  - **Terminal Output:**
    ```cmd
    Pinging 192.168.1.1 with 32 bytes of data:
    Reply from 192.168.1.1: bytes=32 time<1ms TTL=64
    Reply from 192.168.1.1: bytes=32 time<1ms TTL=64
    Reply from 192.168.1.1: bytes=32 time<1ms TTL=64
    Reply from 192.168.1.1: bytes=32 time<1ms TTL=64

    Ping statistics for 192.168.1.1:
        Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),
    ```
* **Mentor Explanations & Terminal Values Explained:**
  - **Layer A (Action):** *"Our computer found the hardware address first, then delivered the ping messages."*
  - **Terminal Values Breakdown:**
    - `bytes=32` $\rightarrow$ The 32-byte test data buffer carried inside the ping.
    - `time<1ms` $\rightarrow$ The round-trip response time (under 1 millisecond).
    - `TTL=64` $\rightarrow$ Time to Live—an expiry counter preventing lost packets from looping forever *(parked $\rightarrow$ Module 7)*.
  - **Layer B & C (Evidence & Concepts):** *"4 replies, 0% loss! The initial shout was an **ARP broadcast**, the answer was an **ARP unicast**, and the ping test itself is an **ICMP Echo**."*
* **Advancement Gate:** `[ Continue → ]` button unlocks. Advances to Beat 7.

---

#### Beat 7: Confirming the Address Book Entry
* **Mentor Prompt:**
  > *"Now that communication succeeded, let's verify what our PC recorded in its address book.*
  > *Type `arp -a` and press Enter."*
* **Learner Action:** Types `arp -a`.
* **Simulator Result:**
  ```cmd
  Interface: 192.168.1.10 --- 0xb
    Internet Address      Physical Address      Type
    192.168.1.1           00-1a-2b-3c-4d-01     dynamic
  ```
* **Mentor Explanations:**
  - **Layer A (Action):** *"We re-inspected the ARP address cache."*
  - **Layer B (Evidence):** *"Look at the new line: IP `192.168.1.1` is now mapped to physical MAC address `00-1a-2b-3c-4d-01`."*
  - **Layer C (Concept Naming):** *"The type says `dynamic`. Our PC learned it automatically in milliseconds. As long as this entry remains cached, our PC can send frames without asking again."*
* **Advancement Gate:** `[ Continue → ]` button unlocks. Advances to Beat 8.

---

#### Beat 8: Inspecting the Ethernet Envelope & MAC Matching
* **Right Side Shows:** **Ethernet Envelope Inspector appears:**
  ```
  ┌────────────────────────────────────────────────────────┐
  │ ETHERNET ENVELOPE (Layer 2 Outer Packaging)            │
  │  • Destination MAC: 00-1A-2B-3C-4D-01 (Router R1)      │
  │  • Source MAC:      00-1A-2B-3C-4D-10 (Host A)         │
  │  • What's Inside:   IPv4 Packet (carrying ICMP ping)   │
  └────────────────────────────────────────────────────────┘
  [ + Optional: View Full Byte Breakdown (74 bytes / 78 bytes with FCS) ]
  ```
* **Socratic Diagnostic Question (MAC Matching):**
  > *"Look at the Destination MAC on the envelope (`00-1A-2B-3C-4D-01`). Where did our PC get this address?"*
  > - `[ 🔘 A: From the dynamic ARP address book entry we verified in Beat 7 ]` *(Correct)*
  > - `[ 🔘 B: It guessed it randomly from the IP address ]` *(Incorrect feedback: "IP addresses don't reveal MACs; ARP had to discover it!")*
* **Mentor Explanations:**
  - **Layer A (Action):** *"We examined the outer Ethernet envelope of our packet."*
  - **Layer B & C (Evidence & Concept):** *"Even though ping targeted IP `192.168.1.1`, the network card stamped the outer Ethernet envelope with Router R1's hardware MAC address. The IP packet travels inside the Ethernet frame like a letter inside an envelope!*
    *(Optional expander shows 14-byte header + 60-byte IP packet = 74 bytes, or 78 bytes with 4-byte FCS)."*
* **Advancement Gate:** `[ Complete Module 1 🎉 ]` unlocks and navigates to Module Completion Summary.

---

## 4. Off-Script Handling & Error Recovery Matrix

The simulator answers truthfully to all inputs; the mentor layer catches deviations and guides the learner without getting stuck:

| Scenario / Learner Input | Truthful Simulator Output | Mentor Reaction (Non-Punitive) | Beat State Action |
| :--- | :--- | :--- | :--- |
| **Learner runs `ping 8.8.8.8` early (Beat 1)** | Outputs `PING: transmit failed. General failure.` (because cable is down). | *"Good instinct trying another IP! But notice it failed with the exact same error. Our physical connection is down. Let's inspect our adapter: type `ipconfig`."* | Stays on Beat 1 until `ping 192.168.1.1` is run (or accepts it if goal was observing transmit failure). |
| **Learner runs later command early (e.g. `ipconfig` during Beat 1)** | Executes `ipconfig` truthfully (outputs `Media disconnected`). | *"Nice initiative checking the adapter early! Notice it says Media disconnected. Let's finish our reachability test first: type `ping 192.168.1.1`."* | Preserves terminal history; keeps Beat 1 open. |
| **Learner types typo (e.g. `pign`, `ipconfg`)** | Windows error: `'pign' is not recognized as an internal or external command, operable program or batch file.` | *"Looks like a quick typo! Did you mean `ping 192.168.1.1`? Tap the suggestion chip below to insert it."* | Keeps beat open; provides autofill chip. |
| **Stuck for 2 consecutive failed attempts** | Appropriate error or repetition. | Mentoring card elevates: *"Here's a helping hand. To test reachability, the exact command is `ping 192.168.1.1`. Click the chip below to fill your terminal."* | Elevates hint level; highlights suggestion pill. |
| **Learner enters unknown command (e.g. `hello`, `help`)** | Windows message or help list. | *"Windows cmd doesn't recognize that command for this test. Follow our mission: type `ping 192.168.1.1`."* | Prompts redirection. |
| **Learner clicks Suggestion Chip** | Text inserts into terminal input buffer (`inputVal = 'ping 192.168.1.1'`). Terminal focuses. | Learner presses Enter to execute (no automated execution). | Learner maintains physical control of execution. |

---

## 5. Scope for Entry-Level IT Support (Core vs. Extended)

To ensure learners master job-ready troubleshooting without CCNA-level mathematical overload:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                      TRACK SCOPE & TIER BREAKDOWN                                      │
│                                                                                        │
│  ⭐ CORE CURRICULUM (Entry-Level Helpdesk / IT Support):                               │
│     • Module 1: Physical Link & Adapter Diagnosis (Cable, ipconfig, on-link ping)      │
│     • Module 3: Switch Basics & CAM Learning (Lightweight: ports, MAC tables)          │
│     • Module 4: IPv4 Subnetting Essentials (Default masks, on-link /24 shortcuts)      │
│     • Module 5: ARP & Local Resolution (Neighbor discovery, duplicate IP detection)    │
│     • Module 7: Default Gateways & Routing (Off-link decisions, gateway failure)       │
│     • Module 8: NAT & Home/Office Routers (Private IPs, port forwarding)               │
│     • Module 9: DHCP Protocol & APIPA (DORA, 169.254.x.x troubleshooting)             │
│     • Module 10: DNS & Name Resolution (nslookup, flushdns, host file overrides)       │
│     • Module 11: Transport Ports & Sockets (netstat, port conflicts)                   │
│     • Module 14: Systematic OSI Diagnostic Triage (Capstone Helpdesk Workbench)        │
│                                                                                        │
│  🔬 EXTENDED / ADVANCED ELECTIVES (Network Admin / CCNA Transition):                   │
│     • Module 2: Bit-level CRC-32 math & CSMA/CD half-duplex bus collisions             │
│     • Module 6: IPv6 EUI-64 bit flipping & NDP multicast groups                        │
│     • Module 12: Byte-level TCP sequence math & sliding window flow control            │
│     • Module 13: Cryptographic TLS 1.3 Diffie-Hellman key derivation                   │
│     • Module 15: Spanning Tree Protocol (STP) Bridge ID & Root Port elections          │
│     • Module 16: Wildcard mask ACL authoring & conntrack packet filtering              │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### Ticket-First Hooks for Modules 2+
Starting with Module 2, every module opens with a **visible office helpdesk ticket symptom** rather than an abstract concept:
- **Module 3:** Ticket: *"New office printer plugged into Switch Port 3 cannot be reached by Workstation-01"* (Learner traces switch port CAM learning and flooding).
- **Module 4:** Ticket: *"New remote workstation has invalid IP address error"* (Learner calculates broadcast collision).
- **Module 5:** Ticket: *"Duplicate IP address warning pops up on sales manager's laptop"* (Learner investigates ARP cache and Gratuitous ARP).
- **Module 7:** Ticket: *"Cannot reach regional warehouse file server on 10.0.0.50"* (Learner identifies missing default gateway).
- **Module 9:** Ticket: *"Staff laptops displaying 'No Internet, Secured' and getting 169.254.x.x addresses"* (Learner identifies exhausted DHCP scope).
- **Module 10:** Ticket: *"Accounting software works by IP but fails by domain name"* (Learner flushes stale DNS cache and checks hosts file).

### 5.2 Concept x Level x Module Matrix
Before starting Module 2, all concepts are registered across the spiral curriculum:

| Concept Domain | Level 1: Intro Hook | Level 2: Protocol Mechanism | Level 3: Troubleshooting / Security |
| :--- | :--- | :--- | :--- |
| **Physical Media** | Module 1 (Cable & Link status) | Module 2 (MTU, bit slicing, CRC) | Module 14 (Physical vs Logical Triage) |
| **Layer 2 Switching** | Module 1 (Switch as junction box) | Module 3 (CAM table learning, flooding)| Module 15 (VLANs, Trunks, STP Loops) |
| **IP Addressing & Mask**| Module 1 (Local street /24 shortcut)| Module 4 (Binary AND, CIDR slicing) | Module 7 (Subnet mismatch in routing) |
| **Address Resolution** | Module 1 (Neighbor address book) | Module 5 (ARP Request/Reply, hold queue)| Module 16 (Dynamic ARP Inspection) |
| **Default Gateways** | Module 1 (Exit door concept) | Module 7 (Routing table, LPM, MAC rewrite)| Module 14 (Isolating gateway failures) |
| **Name Resolution** | Module 1 (DNS suffix parking) | Module 10 (Recursive DNS query tree) | Module 10 & 14 (Stale cache & hosts file)|

---

## 6. Accessibility & Mobile Standards

1. **Focusable Hardware Elements:**
   - The RJ-45 cable connector in `PhysicalConnectionCanvas` is an accessible `<button>` with clear focus rings (`focus-visible:ring-2 focus-visible:ring-func`).
   - Accessible via keyboard: `Tab` focuses the cable; pressing `Enter` or `Space` seats the cable.
2. **Accessible Status LEDs:**
   - LEDs never rely on color alone. Every link light renders an explicit text label (e.g. `<span className="sr-only">Link status: </span><span aria-hidden="true">[LINK: UP]</span>`).
3. **Motion Sensitivity:**
   - All packet animations and pulse effects respect `prefers-reduced-motion: reduce`, replacing moving packets with instant state indicators.
4. **Live Screen Reader Announcements:**
   - The terminal output container is marked `aria-live="polite"` and `role="region"` so screen readers announce command execution outputs.
5. **Mobile Viewport & Keyboard Handling:**
   - Uses dynamic viewport units (`dvh`) and listens to `window.visualViewport`.
   - When the mobile software keyboard opens, the top environment pane smoothly resizes so the mentor instruction and terminal prompt never get pushed offscreen.
6. **Command Suggestion Chips:**
   - Suggestion chips fill the terminal input field and place the cursor at the end; the learner explicitly taps Enter. No auto-run surprise.

---

## 7. Verification Plan & Testable Acceptance Gates

Before approving implementation, the codebase must satisfy the following automated and manual test suites:

### 7.1 Automated Linters & Tests (Vitest)
```bash
npm run test tests/tracks/networking*
```
1. **Term-Registry Lint Test (`tests/tracks/term-registry-lint.test.ts`):**
   - Scans all mentor dialogue strings AND UI badges/labels across all beats.
   - Asserts that no term (e.g. "Layer 1", "MAC Address", "ARP", "Physical Media", "Ethernet Frame") is rendered prior to its formal introduction beat in `terms-registry.json`.
2. **Spoiler Check Test (`tests/tracks/spoiler-guard.test.ts`):**
   - Asserts that diagnostic conclusion words ("disconnected cable", "hardware failure") do not appear in Beat 1 or Beat 2 prompts prior to evidence generation.
3. **Action Explanation Coverage Test (`tests/tracks/action-explanation.test.ts`):**
   - Validates that every command executed for the first time (`ping`, `ipconfig`, `arp -a`) has an authored Layer A plain-language explanation immediately following its output.
4. **Socratic Closure Test (`tests/tracks/socratic-closure.test.ts`):**
   - Asserts that every question posed to the learner (via option chips) has immediate, authored closure and feedback in the same beat.
5. **Parking Lot Integrity Test (`tests/tracks/parking-lot.test.ts`):**
   - Validates that every registered parked item (e.g. `/24` subnet shortcut, switch CAM learning, TTL counter, DNS suffix) has a matching payoff beat in its declared target module.
6. **Engine Event Parity Test (`tests/engine/event-sourced-sim.test.ts`):**
   - Asserts that reducing `ActionLog` produces identical state to live step execution.
   - Tests `ReviewMode` (log prefix) and `ReplayCheckpoint` (log truncation).
   - Validates `localStorage` serialization and rehydration under key `sqlens_net_action_log_net01_v1`.

### 7.2 Manual Quality Acceptance Gates
1. **Think-Aloud Beginner Validation Protocol:**
   - Test Module 1 with 3–5 beginner learners. Measure time per beat, number of off-script commands, and whether any learner stalls without knowing what to type.
2. **Seeded Multi-Variant Transfer-Fault Challenge (End of Module 1 Gate):**
   - Immediately following Beat 8, the learner is placed in a fresh, unguided sandbox with a randomly seeded fault from 3 possible variants:
     - **Variant A (Physical):** `Acme-PC-02` patch cable is disconnected under the desk.
     - **Variant B (Port Fault):** Cable is plugged into switch Port 4 which is administratively down (LED OFF). Learner must move cable to active Port 3.
     - **Variant C (Configuration):** Static IP on `Acme-PC-02` was mistyped as `192.168.2.10/24`. Learner inspects `ipconfig`, spots the neighborhood mismatch, and reconfigures to `192.168.1.15`.
   - If the learner independently runs diagnostics, identifies the fault, and applies the physical or configuration fix to achieve 0% ping loss, Module 1 is officially approved.

---

## 8. Summary of Components & Files to Create/Modify

```
src/
├── lib/network-engine/
│   ├── types.ts                     [NEW] General topology domain types (Devices, Interfaces, Links, Frames)
│   ├── reducer.ts                   [NEW] Pure event-sourced state reducer & ActionLog manager
│   ├── commands.ts                  [NEW] Truthful Windows cmd parsers & formatters (ipconfig, ping, arp)
│   └── fixtures/
│       └── acme-office-m1.ts        [NEW] Acme Office initial topology fixture (Host A, SW1, R1)
├── components/learning/networking/
│   ├── VirtualTerminalSimulator.tsx [MODIFY] Event-sourced integration, chip auto-fill, aria-live
│   ├── PhysicalConnectionCanvas.tsx [NEW] Accessible, focusable RJ-45 cable seating & labelled LEDs
│   ├── PacketInspector.tsx          [MODIFY] Progressive layer disclosure; Ethernet envelope view
│   └── mentor/
│       ├── useMentorScript.ts       [MODIFY] Reducer state-predicate advancement & ActionLog bindings
│       ├── MentorDialoguePanel.tsx  [MODIFY] 3-layer timing render, chip feedback, dvh keyboard styles
│       └── MentorLessonStage.tsx    [MODIFY] Session A/B stage switcher, single-column mobile stack
└── content/networking/modules/
    └── net-01.ts                    [MODIFY] Completely rewritten with finalized Session A & B beats
```

---

*This revised plan is complete, fully aligned with the senior-engineer pedagogy, and ready for your review and approval before any implementation begins.*
