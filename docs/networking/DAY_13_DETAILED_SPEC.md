# SQLens Networking Track — Day 13 Implementation Specification
## Day 13 · Loops and Spanning Tree: Preventing Broadcast Storms (`net-13`)

> **Authoritative Specification & Implementation Blueprint**  
> **Status**: [PLANNING & SPECIFICATION]  
> **Pedagogical Doctrine**: Zero Metaphors, Strictly Gated Vocabulary (No Term Used Before Introduction), Gradual Canvas Reveal, Cognitive Pacing (5 Ideas + 1 Recap).  
> **Stylistic Requirement**: 100% human-crafted phrasing, authentic engineer tone, clean authentic CLI commands.

---

### 1. Pedagogical Doctrine: Vocabulary Gating Audit

In the SQLens Networking Track, **no technical word, acronym, or concept is ever used before it is explicitly introduced and motivated**.

#### Vocabulary Gating Sequence for Day 13:
| Step | What the Learner Knows Before This Step | New Term Explicitly Introduced Here | Why It Is Introduced Here |
| :--- | :--- | :--- | :--- |
| **Idea 1** | Switches (Day 8), Broadcast frames (Day 9), Trunks (Day 11), TTL at Layer 3 (Day 4/12) | **Redundant Link & Layer 2 Loop** | Introduces physical redundancy for fault tolerance: connecting switches with multiple paths so the network survives a severed cable. Then introduces the fatal flaw: unlike Layer 3 IP packets with a TTL, Layer 2 Ethernet frames have **no TTL field**. Broadcast frames circulate infinitely. |
| **Idea 2** | MAC address table (Day 8), flooding (Day 8) | **Broadcast Storm & MAC Table Flapping** | Explains the two catastrophic physical symptoms of a Layer 2 loop: (1) exponential packet duplication consuming 100% of link bandwidth (Broadcast Storm), and (2) switches rapidly overwriting MAC port mappings as identical frames enter different ports (MAC Table Flapping). |
| **Idea 3** | Redundant links, loop catastrophe | **Spanning Tree Protocol (STP · IEEE 802.1D) & Bridge Protocol Data Unit (BPDU)** | Introduces the protocol invented by Radia Perlman that allows physical redundancy without loops. Explains that switches communicate by sending special Layer 2 control packets called **BPDUs (Bridge Protocol Data Units)** every 2 seconds to multicast MAC `01:80:C2:00:00:00`. |
| **Idea 4** | STP, BPDUs | **Bridge ID (BID), Priority & Root Bridge** | Introduces the decision metric: each switch has a **Bridge ID** composed of a Priority (default 32768) and its MAC address. Explains that the switch with the **lowest Bridge ID** is elected **Root Bridge**—the central reference point for the spanning tree. |
| **Idea 5** | Root Bridge, BPDUs | **Port Roles: Root Port (RP), Designated Port (DP), Alternate/Blocking Port (BLK)** | Explains how the loop is broken: non-root switches select their best port to the Root Bridge (Root Port), segments select a Designated Port, and redundant loop-causing ports are placed in the **Blocking state** (amber light). The blocked port discards data frames while staying ready to unblock if a primary link fails. |
| **Recap** | All concepts above | **The 4 Rules of Spanning Tree Protocol** | Synthesizes STP principles and previews Stage 5: Path and Transport (Day 14: ICMP and TTL — How Ping Works at Layer 3). |

---

### 2. Module Definition (`src/content/networking/modules/net-13.ts`)

```typescript
import { NetworkingModule } from '@/types/networking';

export const NET_13_MODULE: NetworkingModule = {
  id: 'net-13',
  dayNumber: 13,
  title: 'Day 13 · Loops and Spanning Tree: Preventing Broadcast Storms',
  shortTitle: 'Loops and Spanning Tree',
  steps: [
    {
      group: 'Idea 1 of 5 · The redundancy dilemma',
      chg: 'Since Day 12: You routed between VLANs using Router-on-a-Stick. Now, we expand the switch topology to three switches: SW1, SW2, and SW3, connected in a redundant triangle.',
      title: 'Redundant links create Layer 2 loops',
      what:
        'In enterprise networks, a single cable connecting two switches is a single point of failure. If that cable is unplugged or fails, an entire floor or building loses connectivity.\n\nTo provide fault tolerance, network engineers add redundant links—connecting Switch SW1, Switch SW2, and Switch SW3 in a closed loop (a physical triangle).\n\nHowever, Ethernet at Layer 2 has no mechanism to expire packets. In Day 4 and Day 12, you learned that Layer 3 IP headers contain a Time-To-Live (TTL) field that routers decrement at every hop until expired. Layer 2 Ethernet headers contain no TTL.\n\nWhen PC1 transmits a broadcast frame into this triangle, each switch floods it out all other ports. The frame circulates around the loop endlessly without ever stopping.\n\nLet\'s test what happens when a broadcast frame enters this unmanaged redundant loop.',
      why: 'Understanding why Ethernet cannot handle loops natively motivates the necessity of Spanning Tree Protocol.',
      pic: 'Switches SW1, SW2, and SW3 form a triangle. A broadcast frame enters SW2 and splits, looping endlessly between all three switches.',
      task: 'Inject a broadcast frame into the switch triangle to observe the Layer 2 loop.',
      cmd: 'test broadcast loop',
      read: [
        ['Topology', '3 switches (SW1, SW2, SW3) connected in a closed triangle loop'],
        ['TTL Mechanism', 'None (Layer 2 Ethernet headers have no Time-To-Live field)'],
        ['Switch Action', 'Floods frame out all ports indefinitely (Infinite Loop)'],
        ['Result', 'Frame circulation detected: packet count multiplying exponentially'],
      ],
      rem: 'Layer 2 Ethernet frames have no TTL; a closed loop of switches circulates broadcast frames endlessly.',
    },
    {
      group: 'Idea 2 of 5 · The symptoms of a loop',
      chg: 'The broadcast loop is circulating across the three switches at line speed.',
      title: 'Broadcast storms and MAC table flapping',
      what:
        'A Layer 2 loop causes two catastrophic network failures:\n\n1. Broadcast Storm: Every time a switch receives the broadcast frame, it duplicates and floods it out its other ports. Within milliseconds, millions of duplicate copies saturate 100% of the link bandwidth. Switch CPU utilization spikes to 100%, and valid traffic cannot pass.\n\n2. MAC Table Flapping (Thrashing): In Day 8, you learned that a switch learns a device’s location by reading the source MAC of incoming frames. When PC1 sends a frame with MAC AA:BB:CC:00:00:01, SW1 learns it on Port 1. Microseconds later, the looping copy arrives on SW1 Port 2. SW1 overwrites its table: Port 2. Then another copy arrives on Port 1, and SW1 overwrites it again: Port 1.\n\nThis rapid, unending oscillation corrupts the MAC address table and completely breaks unicast forwarding.',
      why: 'MAC table thrashing and broadcast storms explain why a single loop can bring down an entire enterprise campus network.',
      pic: 'SW1’s MAC address table flips continuously between Port 1 and Port 2 as duplicate frames arrive from opposite directions.',
      task: 'Inspect Switch SW1’s MAC address table stability log.',
      cmd: 'show mac-flapping',
      read: [
        ['Target MAC', 'AA:BB:CC:00:00:01 (PC1)'],
        ['Oscillation', 'Flapping between Port 1 and Port 2 every 1.4 ms'],
        ['MAC Table State', 'CORRUPTED / THRASHING'],
        ['Network Impact', '100% link saturation · Unicast forwarding failure'],
      ],
      rem: 'A loop causes broadcast storms that saturate bandwidth and MAC flapping that destroys table accuracy.',
    },
    {
      group: 'Idea 3 of 5 · Protocol negotiation',
      chg: 'The switches are still caught in a broadcast loop. We need an automated control plane to prevent loops without removing physical cables.',
      title: 'Spanning Tree Protocol and BPDUs',
      what:
        'We need redundant cables for backup when hardware fails, but we cannot tolerate active loops during normal operation.\n\nIn 1985, network engineer Radia Perlman invented the Spanning Tree Protocol (STP), later standardized as IEEE 802.1D.\n\nSpanning Tree allows switches to keep redundant physical links plugged in while mathematically disabling loops in software.\n\nSwitches do this by exchanging special Layer 2 control messages called Bridge Protocol Data Units (BPDUs) every 2 seconds. BPDUs are addressed to the standardized multicast MAC address `01:80:C2:00:00:00`. Devices like computers ignore them, but switches read them to discover the physical network layout.',
      why: 'BPDUs are the heartbeat of Spanning Tree, allowing switches to map the network topology dynamically.',
      pic: 'Switches SW1, SW2, and SW3 begin transmitting BPDUs (01:80:C2:00:00:00) across all interconnecting links.',
      task: 'Enable IEEE 802.1D Spanning Tree Protocol on all switches.',
      cmd: 'enable stp',
      read: [
        ['Protocol', 'IEEE 802.1D Spanning Tree Protocol (STP)'],
        ['Control Frame', 'BPDU (Bridge Protocol Data Unit)'],
        ['Destination MAC', '01:80:C2:00:00:00 (STP Multicast)'],
        ['Hello Interval', 'Every 2 seconds'],
      ],
      rem: 'STP uses periodic BPDUs to discover switch topology and prevent loops without pulling cables.',
    },
    {
      group: 'Idea 4 of 5 · The election',
      chg: 'STP is enabled. Switches SW1, SW2, and SW3 are exchanging BPDUs to elect a Root Bridge.',
      title: 'Bridge ID and the Root Bridge election',
      what:
        'To build a loop-free tree, all switches must agree on a single reference point: the Root Bridge (the root of the tree).\n\nHow do switches elect the Root Bridge?\n\nEvery switch has a Bridge ID (BID) composed of two values:\n1. Bridge Priority: A 2-byte configurable number (default: 32768).\n2. Base MAC Address: The switch\'s unique hardware address.\n\nDuring BPDU exchange, each switch advertises its Bridge ID. The rule is simple: The switch with the lowest Bridge ID wins the election and becomes the Root Bridge.\n\nIn our network, all switches use the default priority (32768), so the tie-breaker is the lowest MAC address:\n- SW1: `32768.AA:BB:CC:00:00:01` (Lowest MAC!)\n- SW2: `32768.AA:BB:CC:00:00:02`\n- SW3: `32768.AA:BB:CC:00:00:03`\n\nSwitch SW1 wins the election and becomes the Root Bridge.',
      why: 'The Root Bridge is the central hub through which all spanning tree forwarding decisions are calculated.',
      pic: 'SW1 is elected Root Bridge. A golden crown indicator appears over SW1 as all switches calculate their shortest path to it.',
      task: 'Inspect the Spanning Tree status and verify the Root Bridge election.',
      cmd: 'show spanning-tree',
      read: [
        ['Root Bridge', 'SW1 · BID: 32768.AA:BB:CC:00:00:01 (This bridge is the root)'],
        ['Path Cost to Root', 'SW1: 0 · SW2: 4 (1 Gbps link) · SW3: 4 (1 Gbps link)'],
        ['Election Method', 'Lowest Bridge ID (Priority 32768 + Lowest MAC AA:BB:CC:00:00:01)'],
      ],
      rem: 'The switch with the lowest Bridge ID (Priority + MAC) is elected Root Bridge.',
    },
    {
      group: 'Idea 5 of 5 · Breaking the loop',
      chg: 'SW1 is elected Root Bridge. STP is now assigning port roles to eliminate the redundant loop.',
      title: 'Port roles: Root, Designated, and Blocking',
      what:
        'With the Root Bridge elected, STP assigns each port a specific role to eliminate loops while keeping the network fully connected:\n\n1. Root Port (RP): The single port on a non-root switch with the lowest path cost back to the Root Bridge. SW2 Port 1 and SW3 Port 1 both point directly to SW1, so they become Root Ports in the Forwarding state (Green).\n\n2. Designated Port (DP): The port on a network segment with the best path to the Root Bridge. All ports on the Root Bridge are Designated Ports and always Forward.\n\n3. Alternate / Blocking Port (BLK): On the link between SW2 and SW3, both switches have equal cost to the Root. SW2 has a lower Bridge ID than SW3, so SW2 wins the segment. SW3 Port 2 becomes the Alternate Port and enters the Blocking state (Amber).\n\nA blocked port drops all regular data frames and does not learn MAC addresses. It only listens for BPDUs.\n\nThe loop is broken! Broadcast storms stop, MAC flapping ceases, and if the primary link to SW1 ever fails, SW3 Port 2 unblocks automatically.',
      why: 'Blocking a redundant port eliminates the loop while providing instant automatic failover if another link fails.',
      pic: 'Port 2 on SW3 turns amber (Blocked). The triangle loop is broken into an open tree. Normal traffic flows between PC1 and PC2.',
      task: 'Inspect the port roles and verify that the redundant loop is blocked.',
      cmd: 'show spanning-tree ports',
      read: [
        ['SW1 Ports', 'Port 1: Designated (FWD) · Port 2: Designated (FWD)'],
        ['SW2 Ports', 'Port 1: Root Port (FWD) · Port 2: Designated (FWD)'],
        ['SW3 Ports', 'Port 1: Root Port (FWD) · Port 2: Alternate (BLOCKING)'],
        ['Loop Status', 'RESOLVED · Topology is a loop-free tree with active standby redundancy'],
      ],
      rem: 'STP places redundant ports into the Blocking state to eliminate loops while preserving standby redundancy.',
    },
    {
      group: 'Recap',
      title: 'The four rules of Spanning Tree Protocol',
      what:
        'Spanning Tree Protocol transforms redundant physical networks into loop-free logical topologies. It prevents the catastrophic failure of broadcast storms and MAC table flapping while preserving continuous automatic fault tolerance.',
      why: 'Mastering Spanning Tree Protocol completes Stage 4 (Switching Design), giving you the foundation to explore Layer 4 transport protocols and Layer 3 diagnostics in Stage 5.',
      pic: 'Clean topology showing SW1 as Root Bridge (Green links), SW2 Forwarding, and SW3 with Port 2 in standby Blocking mode (Amber). Communication between PC1 and PC2 is clean and stable.',
      task: 'Review the four fundamental rules of Spanning Tree Protocol.',
      cmd: null,
      read: [
        ['1. Loops Are Fatal', 'Layer 2 Ethernet has no TTL; loops cause infinite broadcast storms and MAC flapping'],
        ['2. BPDUs Map the Map', 'Switches exchange BPDUs every 2 seconds to share Bridge IDs and path costs'],
        ['3. Root Bridge Election', 'The switch with the lowest Bridge ID (Priority + MAC) is elected Root Bridge'],
        ['4. Blocking Breaks Loops', 'Redundant ports enter the Blocking state to break loops while standing ready for failover'],
      ],
      rem: 'Spanning Tree blocks redundant links in software to eliminate loops while guaranteeing hardware failover.',
    },
  ],
  staticResponses: {
    'test broadcast loop':
      'Transmitting 1 broadcast frame (FF:FF:FF:FF:FF:FF) from PC1 into SW2...\n\n[SW2] Received broadcast on Port 3. Flooding to Port 1 (SW1) and Port 2 (SW3).\n[SW1] Received broadcast on Port 1. Flooding to Port 2 (SW3).\n[SW3] Received broadcast on Port 1. Flooding to Port 2 (SW2).\n[SW2] Received duplicate broadcast on Port 2. Flooding to Port 1 (SW1)...\n\n*** LAYER 2 LOOP DETECTED ***\nCirculating frames: 4,096 / sec\nBandwidth utilization: 100% (Link saturated)\nSwitch CPU: 100% (Broadcast Storm in progress)',
    'show mac-flapping':
      'Switch SW1 MAC Flapping Diagnostic Log\n----------------------------------------------------\nTime      MAC Address        Previous Port  Current Port  Delta\n14:02:01  AA:BB:CC:00:00:01  Port 1         Port 2        1.4ms\n14:02:01  AA:BB:CC:00:00:01  Port 2         Port 1        1.2ms\n14:02:01  AA:BB:CC:00:00:01  Port 1         Port 2        1.3ms\n14:02:01  AA:BB:CC:00:00:01  Port 2         Port 1        1.5ms\n----------------------------------------------------\nAlert: MAC table instability detected. Unicast forwarding corrupted.',
    'enable stp':
      'Switch SW1(config)# spanning-tree mode classic\nSwitch SW2(config)# spanning-tree mode classic\nSwitch SW3(config)# spanning-tree mode classic\n\nSTP IEEE 802.1D activated on all switches.\nTransmitting configuration BPDUs to multicast 01:80:C2:00:00:00 every 2s.\nRoot Bridge election in progress...',
    'show spanning-tree':
      'VLAN 1 Spanning Tree Protocol (IEEE 802.1D)\n----------------------------------------------------\nRoot ID    Priority: 32768\n           Address:  AA:BB:CC:00:00:01 (Switch SW1)\n           Cost:     0 (This bridge is the root)\n           Hello:    2 sec  Max Age: 20 sec  Forward Delay: 15 sec\n\nBridge ID  Priority: 32768\n           Address:  AA:BB:CC:00:00:01\n           Aging:    300 sec\n----------------------------------------------------\nElection: SW1 elected Root Bridge (lowest Bridge ID: 32768.AA:BB:CC:00:00:01).',
    'show spanning-tree ports':
      'Switch Port Spanning Tree Roles & States\n----------------------------------------------------\nSwitch  Port    Role        State       Cost  Designated Bridge\nSW1     Port 1  Designated  FORWARDING  4     32768.AA:BB:CC:00:00:01\nSW1     Port 2  Designated  FORWARDING  4     32768.AA:BB:CC:00:00:01\nSW2     Port 1  Root        FORWARDING  4     32768.AA:BB:CC:00:00:01\nSW2     Port 2  Designated  FORWARDING  4     32768.AA:BB:CC:00:00:02\nSW3     Port 1  Root        FORWARDING  4     32768.AA:BB:CC:00:00:01\nSW3     Port 2  Alternate   BLOCKING    4     32768.AA:BB:CC:00:00:02\n----------------------------------------------------\nLoop-Free Topology Confirmed: SW3 Port 2 is BLOCKING (Amber).',
    help:
      'Commands: test broadcast loop, show mac-flapping, enable stp, show spanning-tree, show spanning-tree ports, cls, clear, help',
  },
};
```

---

### 3. SVG Canvas Topology Design (`1140 x 560`)

#### Spatial Placement & Coordinates
```
                             [SW1 - Root Bridge]
                             x: 480, y: 70
                             BID: 32768.AA:BB:CC:00:00:01
                           /                             \
                          / (Trunk P1 <-> P1)             \ (Trunk P2 <-> P1)
                         /                                 \
                        /                                   \
  [PC1] ------------ [SW2] ----------------------------- [SW3] ------------ [PC2]
  x: 50, y: 350     x: 230, y: 350    (P2 <-> P2 BLOCKED) x: 740, y: 350    x: 960, y: 350
  192.168.1.10      Port 1: RP                           Port 1: RP         192.168.1.20
                    Port 2: DP                           Port 2: BLK [Amber]
```

1. **Top Center: Switch SW1 (Root Bridge)**:
   - Coordinates: `x: 480, y: 70, width: 130, height: 60`.
   - Crown / Root Bridge indicator when step $\ge$ 3.
   - Port 1 (`P1`): connected down-left to SW2.
   - Port 2 (`P2`): connected down-right to SW3.

2. **Bottom-Left: Switch SW2**:
   - Coordinates: `x: 230, y: 350, width: 130, height: 60`.
   - Port 1 (`P1`): connected to SW1 Port 1. Role: `RP` (Green).
   - Port 2 (`P2`): connected across to SW3 Port 2. Role: `DP` (Green).
   - Port 3 (`P3`): connected to PC1.

3. **Bottom-Right: Switch SW3**:
   - Coordinates: `x: 740, y: 350, width: 130, height: 60`.
   - Port 1 (`P1`): connected to SW1 Port 2. Role: `RP` (Green).
   - Port 2 (`P2`): connected across to SW2 Port 2. Role: `BLK` (Amber, blocked on step $\ge$ 4).
   - Port 3 (`P3`): connected to PC2.

4. **Inter-Switch Links**:
   - Link 1: SW1 `(510, 130)` to SW2 `(295, 350)`.
   - Link 2: SW1 `(580, 130)` to SW3 `(805, 350)`.
   - Link 3: SW2 `(360, 380)` to SW3 `(740, 380)` (Horizontal link).
     - Steps 0-3: Active link in closed loop.
     - Step 4+: Orange/Amber dashed link with Amber `✕ BLOCKED` icon on SW3:Port 2.

5. **Workstations**:
   - PC1: `x: 60, y: 345`, IP `192.168.1.10`, connected to SW2:Port 3.
   - PC2: `x: 950, y: 345`, IP `192.168.1.20`, connected to SW3:Port 3.

6. **Interactive State Visualizations per Step**:
   - **Step 0 (Loop Active)**:
     - Red spinning circular animated storm indicators around the triangle center `(545, 260)`.
     - Alert banner: `LAYER 2 LOOP DETECTED ⚠ · BROADCAST REPLICATING ENDLESSLY`.
   - **Step 1 (Broadcast Storm & Flapping)**:
     - HUD Table Card on SW1 showing rapid port oscillation `P1 ⇄ P2 (1.4ms)`.
     - Callout: `MAC Address Table Thrashing · 100% Link Saturation`.
   - **Step 2 (STP Activated & BPDUs)**:
     - Storm stops. Cyan animated BPDU pulses traveling across all 3 links.
     - BPDU Dissection card at `(400, 205)`: Multicast `01:80:C2:00:00:00`, Hello: 2s.
   - **Step 3 (Root Bridge Election)**:
     - Golden crown badge on SW1: `ROOT BRIDGE · Lowest BID (32768.AA:BB:CC:00:00:01)`.
     - Non-root badges on SW2 and SW3 showing Bridge ID comparison.
   - **Step 4 (Port Roles & Blocked Port)**:
     - Port 1 on SW2 & SW3 labeled `RP` (Root Port · Green).
     - Port 1 & 2 on SW1 labeled `DP` (Designated Port · Green).
     - Port 2 on SW2 labeled `DP` (Designated Port · Green).
     - Port 2 on SW3 turns **Amber / Orange** labeled `BLK` (Alternate / Blocking).
     - Green data packet travels cleanly from PC1 $\rightarrow$ SW2 $\rightarrow$ SW1 $\rightarrow$ SW3 $\rightarrow$ PC2.
     - Banner: `TOPOLOGY CONVERGED · LOOP BROKEN (SW3:P2 BLOCKING)`.
   - **Step 5 (Recap)**:
     - The Four Rules of Spanning Tree Protocol summary card.
     - Preview: `Next: Day 14 · ICMP and TTL (How Ping Works at Layer 3)`.

---

### 4. Implementation Plan & Testing Strategy

#### Slice 1: Content Module & Curriculum Tests
- Create `src/content/networking/modules/net-13.ts`.
- Register in `src/content/networking/index.ts`.
- Add test coverage in `tests/curriculum/networking-curriculum.test.ts`.
- Verify with `vitest run tests/curriculum/networking-curriculum.test.ts`.

#### Slice 2: Terminal Execution & Workspace Matchers
- Update `src/components/learning/networking/terminal/NetworkingTerminal.tsx`:
  - `net-13` help string.
  - Commands: `test broadcast loop`, `show mac-flapping`, `enable stp`, `show spanning-tree`, `show spanning-tree ports`.
  - Suggestions in `!out` for `stp`, `bpdu`, `spanning-tree`.
- Update `src/components/learning/networking/workspace/NetworkingWorkspace.tsx`:
  - Alternate matchers for `enable stp`, `show spanning-tree`, `show mac-flapping`, etc.

#### Slice 3: Interactive SVG Canvas Topology
- Add `'net-13'` entry to `DAY_WORLD_SPECS` (`1140 x 560`).
- Define `const isDay13 = dayId === 'net-13';` in `NetworkingCanvas.tsx`.
- Render SW1, SW2, SW3, PC1, PC2, triangle links, BPDU animations, Root Bridge crown, and blocking port state.
- Add UI tests in `tests/ui/networking-canvas.test.tsx`.
- Verify with `vitest run tests/ui/networking-canvas.test.tsx`.

#### Slice 4: Full Validation & Git Commit
- Run `npx tsc --noEmit` (ensure 0 errors).
- Run full Vitest suite.
- Update `docs/networking/TRACK_ROADMAP_DAYS_1_TO_35.md` to `[COMPLETED]`.
- Clean atomic git commit.
