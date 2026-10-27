# SQLens Networking Track — Day 12 Implementation Specification
## Day 12 · Routing Between VLANs: Router-on-a-Stick (`net-12`)

> **Authoritative Specification & Implementation Blueprint**  
> **Status**: [PLANNING & SPECIFICATION]  
> **Pedagogical Doctrine**: Zero Metaphors, Strictly Gated Vocabulary (No Term Used Before Introduction), Gradual Canvas Reveal, Cognitive Pacing (5 Ideas + 1 Recap).  
> **Stylistic Requirement**: 100% human-crafted phrasing, authentic engineer tone, clean authentic CLI commands.

---

### 1. Pedagogical Doctrine: Vocabulary Gating Audit

In the SQLens Networking Track, **no technical word, acronym, or concept is ever used before it is explicitly introduced and motivated**.

#### Vocabulary Gating Sequence for Day 12:
| Step | What the Learner Knows Before This Step | New Term Explicitly Introduced Here | Why It Is Introduced Here |
| :--- | :--- | :--- | :--- |
| **Idea 1** | VLANs, Layer 2 isolation (Day 10), Routers (Day 4) | **Inter-VLAN Routing** | First reviews the Day 10 dilemma: VLAN 10 and VLAN 20 are completely isolated by the switch. To allow controlled communication (e.g., workstations reaching a database), packets must move between subnets via a Layer 3 routing engine. |
| **Idea 2** | Physical router interfaces, 802.1Q trunks (Day 11) | **Router-on-a-Stick (ROAS)** | Motivates the hardware scaling issue: running a separate physical cable for each VLAN into the router wastes expensive router ports. Introduces the industry-standard architecture where a single physical link carries an 802.1Q trunk into the router. |
| **Idea 3** | Physical interfaces, 802.1Q tags (Day 11) | **Sub-interface (Logical Interface)** | Explains how a single physical router port (e.g. `eth0`) can act as multiple virtual interfaces. Introduces dot notation (e.g., `eth0.10` and `eth0.20`), where each logical interface is bound to one VLAN. |
| **Idea 4** | Sub-interfaces, Default Gateways (Day 4) | **Sub-interface 802.1Q Encapsulation & Gateway IP** | Shows how to configure `encapsulation dot1q 10` and assign `192.168.10.1/24` to `eth0.10`, making that sub-interface the Default Gateway for all computers in VLAN 10. |
| **Idea 5** | Inter-VLAN routing, Default Gateway, Ping | **The Hairpin Route Flow (Two-Way Trunk Traversal)** | Traces a complete packet from PC1 to PC2: up the trunk stick to `eth0.10` (tagged VID=10) $\rightarrow$ routed at Layer 3 to `eth0.20` $\rightarrow$ down the trunk stick (tagged VID=20) $\rightarrow$ delivered untagged to PC2. Proves 0% packet loss. |
| **Recap** | All concepts above | **The 4 Rules of Inter-VLAN Routing** | Synthesizes Inter-VLAN routing principles and previews Day 13 (Loops and Spanning Tree Protocol). |

---

### 2. Module Definition (`src/content/networking/modules/net-12.ts`)

```typescript
import { NetworkingModule } from '@/types/networking';

export const NET_12_MODULE: NetworkingModule = {
  id: 'net-12',
  dayNumber: 12,
  title: 'Day 12 · Routing Between VLANs: Router-on-a-Stick',
  shortTitle: 'Routing Between VLANs',
  steps: [
    {
      group: 'Idea 1 of 5 · The communication problem',
      chg: 'Since Day 11: Switch SW1 connects PC1 (VLAN 10) and PC2 (VLAN 20). Router R1 is now connected to Switch SW1 with a single cable on Port 4.',
      title: 'Isolated VLANs need a router',
      what:
        'In Day 10, you divided Switch SW1 into two VLANs: VLAN 10 (192.168.10.0/24) for Engineering and VLAN 20 (192.168.20.0/24) for Finance.\n\nBecause they belong to different broadcast domains and different IP subnets, Switch SW1 completely isolates them. A Layer 2 switch will never pass frames between different VLANs.\n\nNow, test what happens if PC1 (192.168.10.10) tries to ping PC2 (192.168.20.20). Even though they are plugged into the exact same physical switch inches apart, the ping fails with 100% packet loss.\n\nTo allow controlled communication between different VLANs, traffic must leave the switch and pass through a Layer 3 routing engine. This process is called Inter-VLAN Routing.',
      why: 'VLANs provide complete security isolation by default; any communication between them requires explicit Layer 3 routing.',
      pic: 'PC1 (VLAN 10) and PC2 (VLAN 20) are plugged into Switch SW1. A ping probe hits the switch and is dropped cold.',
      task: 'Ping from PC1 to PC2 at 192.168.20.20 to observe the Layer 2 isolation barrier.',
      cmd: 'ping 192.168.20.20',
      read: [
        ['Source', 'PC1 · Port 1 (VLAN 10 · 192.168.10.10)'],
        ['Destination', 'PC2 · Port 2 (VLAN 20 · 192.168.20.20)'],
        ['Switch Action', 'DROPPED (Layer 2 switches cannot forward between VLANs)'],
        ['Ping Result', 'Request timed out (100% packet loss)'],
      ],
      rem: 'Devices on different VLANs cannot communicate through a switch without a router, even on the same physical box.',
    },
    {
      group: 'Idea 2 of 5 · The single-cable design',
      title: 'Router-on-a-Stick: one cable, multiple VLANs',
      what:
        'How should we connect Router R1 to Switch SW1?\n\nThe naive method is to run two physical cables: one cable from a switch port in VLAN 10 into Router Port 1, and a second cable from a switch port in VLAN 20 into Router Port 2.\n\nHowever, enterprise networks have dozens of VLANs. Buying a router with 20 physical Ethernet ports just to connect one switch is extremely expensive and wastes hardware.\n\nInstead, we connect Router R1 to Switch SW1 with a single physical cable configured as an IEEE 802.1Q trunk link (on Switch Port 4). Because an 802.1Q trunk carries multiple VLANs over one wire (from Day 11), traffic for all VLANs can travel over this single connection.\n\nThis architecture is known as Router-on-a-Stick (ROAS).',
      why: 'Router-on-a-Stick uses a single physical cable to route between multiple VLANs, eliminating the cost of multi-port router hardware.',
      pic: 'A single vertical cable connects Switch SW1 Port 4 up to Router R1 interface eth0. Port 4 glows cyan as an 802.1Q trunk.',
      task: 'Inspect Router R1’s physical interface eth0.',
      cmd: 'show router interfaces',
      read: [
        ['Interface', 'eth0 (Physical RJ-45 GigabitEthernet)'],
        ['Link State', 'UP · Connected to Switch SW1 Port 4 (Trunk)'],
        ['IP Address', 'Unassigned (Awaiting sub-interface configuration)'],
      ],
      rem: 'Router-on-a-Stick connects a router to a switch trunk using a single physical cable to carry all VLAN traffic.',
    },
    {
      group: 'Idea 3 of 5 · Virtual router ports',
      title: 'Sub-interfaces: dividing a physical port',
      what:
        'Router R1 has only one physical port (`eth0`). How can one port belong to multiple subnets with different IP addresses?\n\nThe router operating system splits the physical port into virtual, software-defined ports called sub-interfaces.\n\nA sub-interface is a logical interface created inside the router’s memory, designated by a period followed by a number (like `eth0.10` for VLAN 10 and `eth0.20` for VLAN 20).\n\nEach sub-interface acts as an independent virtual network interface card with its own IP address and its own 802.1Q tag parser.',
      why: 'Sub-interfaces allow one physical router port to serve as the default gateway for multiple distinct IP subnets.',
      pic: 'Interface eth0 divides into two logical slots: eth0.10 (Indigo) and eth0.20 (Emerald).',
      task: 'Create sub-interface eth0.10 configured for VLAN 10 with IP 192.168.10.1/24.',
      cmd: 'create subif eth0.10 10 192.168.10.1/24',
      read: [
        ['Sub-interface', 'eth0.10 (Logical division of eth0)'],
        ['Encapsulation', 'IEEE 802.1Q · VLAN ID: 10'],
        ['IP Address', '192.168.10.1/24 (VLAN 10 Default Gateway)'],
        ['Status', 'Active · Routing enabled for VLAN 10'],
      ],
      rem: 'A sub-interface is a software division of a physical router port, bound to a specific VLAN ID.',
    },
    {
      group: 'Idea 4 of 5 · The second gateway',
      title: 'Configuring the VLAN 20 sub-interface',
      what:
        'Now we configure the second sub-interface for Finance on VLAN 20.\n\nWe create `eth0.20`, set its encapsulation to 802.1Q with VLAN ID 20, and assign it the IP address `192.168.20.1/24`.\n\nNow Router R1 has two connected routes in its routing table (from Day 4):\n- `192.168.10.0/24` directly connected via `eth0.10`\n- `192.168.20.0/24` directly connected via `eth0.20`\n\nPC1 has its Default Gateway set to `192.168.10.1` (`eth0.10`). PC2 has its Default Gateway set to `192.168.20.1` (`eth0.20`). The stage is set for traffic to cross between the VLANs.',
      why: 'Both VLANs must have their respective Default Gateway configured on the router before packets can be forwarded between them.',
      pic: 'Router R1’s sub-interface table shows both eth0.10 (192.168.10.1) and eth0.20 (192.168.20.1) active and connected.',
      task: 'Create sub-interface eth0.20 configured for VLAN 20 with IP 192.168.20.1/24.',
      cmd: 'create subif eth0.20 20 192.168.20.1/24',
      read: [
        ['Sub-interface', 'eth0.20 (Logical division of eth0)'],
        ['Encapsulation', 'IEEE 802.1Q · VLAN ID: 20'],
        ['IP Address', '192.168.20.1/24 (VLAN 20 Default Gateway)'],
        ['Status', 'Active · Routing enabled for VLAN 20'],
      ],
      rem: 'Each VLAN has its own sub-interface on the router acting as that subnet’s default gateway.',
    },
    {
      group: 'Idea 5 of 5 · The packet journey',
      title: 'The hairpin route: how traffic flows',
      what:
        'Let’s test communication again by pinging PC2 at 192.168.20.20 from PC1.\n\nFollow the complete journey of the packet:\n1. PC1 sees 192.168.20.20 is outside its subnet. PC1 transmits an untagged frame addressed to its Default Gateway (192.168.10.1) into SW1 Port 1.\n2. SW1 receives the frame on access Port 1 (VLAN 10), inserts an 802.1Q tag (VID=10), and forwards it up trunk Port 4 to Router R1.\n3. R1 receives the frame on physical port `eth0`. The router reads `VID=10` and sends the packet to sub-interface `eth0.10`.\n4. R1 removes the Ethernet header, inspects the destination IP (192.168.20.20), looks up its routing table, and finds `192.168.20.0/24` on sub-interface `eth0.20`.\n5. R1 decrements the TTL, encapsulates the packet in a new Ethernet frame with an 802.1Q tag (VID=20), and sends it back down the exact same trunk cable into SW1 Port 4.\n6. SW1 receives the frame on trunk Port 4, reads `VID=20`, strips the tag, and delivers the untagged frame out of access Port 2 to PC2.\n\nPC2 receives the ping and replies in reverse! The ping succeeds with 0% packet loss.',
      why: 'Understanding the hairpin traversal proves how Layer 2 VLAN tagging and Layer 3 IP routing work together over a single physical cable.',
      pic: 'An animated pulse leaves PC1, ascends the trunk tagged VID=10, loops inside Router R1, descends the trunk tagged VID=20, and arrives at PC2. PC2 replies successfully.',
      task: 'Ping from PC1 to PC2 at 192.168.20.20 through the Router-on-a-Stick.',
      cmd: 'ping 192.168.20.20',
      read: [
        ['Path Out', 'PC1 -> SW1 -> [Tag VID=10] -> R1:eth0.10 -> Route -> R1:eth0.20 -> [Tag VID=20] -> SW1 -> PC2'],
        ['Path Return', 'PC2 -> SW1 -> [Tag VID=20] -> R1:eth0.20 -> Route -> R1:eth0.10 -> [Tag VID=10] -> SW1 -> PC1'],
        ['Ping Result', 'Reply from 192.168.20.20: bytes=64 time=1.8ms TTL=63 (0% packet loss)'],
        ['TTL Decrement', 'TTL decremented from 64 to 63 (proves Layer 3 router hop)'],
      ],
      rem: 'Router-on-a-Stick routes packets between VLANs by sending tagged frames up and down a single trunk cable.',
    },
    {
      group: 'Recap',
      title: 'The four rules of Inter-VLAN routing',
      what:
        'Inter-VLAN routing allows computers in separate virtual networks to communicate under the controlled policies of a Layer 3 router. Router-on-a-Stick maximizes efficiency by multiplexing multiple VLAN default gateways across sub-interfaces on a single physical link.',
      why: 'Mastering Router-on-a-Stick completes your foundation in VLAN architecture, preparing you for Day 13 where we prevent catastrophic broadcast loops with Spanning Tree Protocol.',
      pic: 'Clean topology showing PC1 (VLAN 10), Switch SW1, Router R1 with sub-interfaces eth0.10 & eth0.20, and PC2 (VLAN 20) with active bidirectional routing.',
      task: 'Review the four fundamental rules of Router-on-a-Stick Inter-VLAN routing.',
      cmd: null,
      read: [
        ['1. Router Required', 'Switches isolate VLANs at Layer 2; moving between VLANs always requires a Layer 3 router'],
        ['2. Trunk Link', 'The router connects to the switch via an 802.1Q trunk port carrying all VLAN traffic'],
        ['3. Sub-interfaces', 'The router divides its physical port into virtual sub-interfaces (eth0.10, eth0.20)'],
        ['4. Hairpin Routing', 'Packets travel up the trunk tagged in one VLAN and back down tagged in the other'],
      ],
      rem: 'Inter-VLAN routing connects isolated VLANs through router sub-interfaces over a single trunk cable.',
    },
  ],
  staticResponses: {
    'ping 192.168.20.20':
      'Sending 4 64-byte ICMP Echos to 192.168.20.20:\nRequest timed out.\nRequest timed out.\nRequest timed out.\nRequest timed out.\n\n--- 192.168.20.20 ping statistics ---\n4 packets transmitted, 0 received, 100% packet loss\n(Host unreachable: Switch SW1 will not forward between VLAN 10 and VLAN 20 at Layer 2)',
    'show router interfaces':
      'Router R1 Interface Status\n----------------------------------------------------\nInterface  IP-Address      Status   Protocol  Description\neth0       unassigned      up       up        Trunk link to SW1:Port 4\n----------------------------------------------------\nSub-interfaces: None configured.',
    'create subif eth0.10 10 192.168.10.1/24':
      'Router R1(config)# interface eth0.10\nRouter R1(config-subif)# encapsulation dot1q 10\nRouter R1(config-subif)# ip address 192.168.10.1 255.255.255.0\n\nSub-interface eth0.10 created.\nEncapsulation: IEEE 802.1Q · VLAN ID: 10\nIP Address: 192.168.10.1/24 (Gateway for VLAN 10).',
    'create subif eth0.20 20 192.168.20.1/24':
      'Router R1(config)# interface eth0.20\nRouter R1(config-subif)# encapsulation dot1q 20\nRouter R1(config-subif)# ip address 192.168.20.1 255.255.255.0\n\nSub-interface eth0.20 created.\nEncapsulation: IEEE 802.1Q · VLAN ID: 20\nIP Address: 192.168.20.1/24 (Gateway for VLAN 20).\n\nRouting table updated: 2 connected subnets (192.168.10.0/24, 192.168.20.0/24).',
    help:
      'Commands: ping 192.168.20.20, show router interfaces, create subif eth0.10 10 192.168.10.1/24, create subif eth0.20 20 192.168.20.1/24, cls, clear, help',
  },
};
```

---

### 3. Canvas Topology & Visual Design (`DAY_WORLD_SPECS['net-12']`)

- **Virtual Coordinate Bounds**: `1100px` width × `560px` height.
- **Components & Placement**:
  - **Switch SW1 (Bottom Center)**:
    - SvgSwitch at `x=490, y=340` (width 120, height 48, cx=550, cy=364).
    - Port 1 (PC1, VLAN 10): Left face (`x=490, y=352`).
    - Port 2 (PC2, VLAN 20): Right face (`x=610, y=352`).
    - Port 4 (Trunk "Stick"): Center top face (`x=550, y=340`).
  - **Router R1 (Top Center)**:
    - SvgRouter at `x=490, y=100` (width 120, height 50, cx=550, cy=125).
    - Physical port `eth0`: Bottom center face (`x=550, y=150`).
  - **The Trunk "Stick" Cable**:
    - Connects SW1 Port 4 (`x=550, y=340`) straight up to R1 `eth0` (`x=550, y=150`).
    - In steps 0–1: Gray vertical link (`#64748b`).
    - In steps 2+: Multi-tone cyan/indigo trunk cable with animated pulse flow.
    - Callout: `802.1Q TRUNK "STICK" (VLAN 10 + 20)`.
  - **Sub-interface HUD Card** (Top Right of Router):
    - `x=660, y=55, width=320, height=135`.
    - Live table showing status of `eth0.10` and `eth0.20`:
      - Columns: `SUB-INTERFACE`, `802.1Q VID`, `GATEWAY IP`, `STATUS`
      - Step 1: Shows empty / unconfigured.
      - Step 2: `eth0.10` active with `VID=10`, `192.168.10.1/24`.
      - Step 3+: Both `eth0.10` and `eth0.20` active with green checkmarks.
  - **Workstations**:
    - **PC1 (Left, VLAN 10 / Engineering)**:
      - SvgWorkstation at `x=110, y=340`, IP `192.168.10.10`, MAC `AA:BB:CC:10:00:01`, Blue badge.
      - Underneath: `Gateway: 192.168.10.1 (eth0.10)`.
      - Cable from PC1 to SW1 Port 1: Indigo (`#818cf8`).
    - **PC2 (Right, VLAN 20 / Finance)**:
      - SvgWorkstation at `x=910, y=340`, IP `192.168.20.20`, MAC `AA:BB:CC:20:00:02`, Green badge.
      - Underneath: `Gateway: 192.168.20.1 (eth0.20)`.
      - Cable from PC2 to SW1 Port 2: Emerald (`#34d399`).

---

### 4. Step-by-Step Gradual Reveal Progression

| Step | Canvas State | Cables & Badges | HUD Card & Callouts |
| :--- | :--- | :--- | :--- |
| **Idea 1** (`step 0`) | Switch SW1 with PC1 and PC2. Router R1 is idle above with an unconfigured cable. | Ping probe hits Switch SW1 center and strikes a red barrier: `CROSS-VLAN BLOCKED ✕`. | Callout: `Different VLANs Cannot Communicate at Layer 2`. |
| **Idea 2** (`step 1`) | `show router interfaces` run. | Vertical cable lights up cyan between SW1 Port 4 and R1 `eth0`. | HUD: `Router R1: Physical eth0 connected as 802.1Q Trunk Link`. |
| **Idea 3** (`step 2`) | `create subif eth0.10 ...` run. | R1 divides: `eth0.10` appears with Indigo badge (`VID=10 · 192.168.10.1`). | HUD: `eth0.10 Active · VLAN 10 Gateway Configured`. |
| **Idea 4** (`step 3`) | `create subif eth0.20 ...` run. | `eth0.20` appears with Emerald badge (`VID=20 · 192.168.20.1`). | HUD: `Both Sub-interfaces Active · 2 Connected Routes in R1 Table`. |
| **Idea 5** (`step 4`) | `ping 192.168.20.20` run. | Hairpin animation: Indigo pulse PC1 $\rightarrow$ up trunk tagged [VID=10] $\rightarrow$ R1 routes to eth0.20 $\rightarrow$ down trunk tagged [VID=20] $\rightarrow$ delivered untagged to PC2. | Success callout: `Inter-VLAN Ping Reply (0% Loss · TTL Decremented to 63)`. |
| **Recap** (`step 5`) | Complete balanced topology showing Router-on-a-Stick architecture with active two-way routing. | All links active with color-coded badges. | Summary Card: `THE 4 RULES OF INTER-VLAN ROUTING` + Preview: `Day 13 · Loops and Spanning Tree`. |

---

### 5. Implementation Task Breakdown

1. **Module Data (`src/content/networking/modules/net-12.ts`)**:
   - Write the module with 5 ideas + 1 recap adhering to the audited vocabulary sequence.
   - Author authentic static responses for `ping 192.168.20.20`, `show router interfaces`, `create subif eth0.10 10 192.168.10.1/24`, and `create subif eth0.20 20 192.168.20.1/24`.
2. **Curriculum Index Registration (`src/content/networking/index.ts`)**:
   - Register `NET_12_MODULE` in `NETWORKING_MODULES`, `getAllNetworkingModules`, and exports.
3. **Terminal Support (`NetworkingTerminal.tsx`)**:
   - Add `net-12` help string and dynamic command responses for initial failed ping vs post-subinterface success ping, interface inspection, and sub-interface creation.
4. **Workspace Aliases (`NetworkingWorkspace.tsx`)**:
   - Add command alias matchers for Day 12 commands (including Cisco-style syntax: `interface eth0.10`, `encapsulation dot1q 10`, `ip address 192.168.10.1 ...`).
5. **Interactive SVG Canvas (`NetworkingCanvas.tsx`)**:
   - Add `'net-12'` in `DAY_WORLD_SPECS` (`1100 x 560`).
   - Define `isDay12 = dayId === 'net-12'`.
   - Render vertical Router-on-a-Stick topology (R1 on top, SW1 on bottom, PC1 on left, PC2 on right, vertical trunk cable, sub-interface HUD card, and hairpin route animation).
6. **Tests**:
   - Curriculum test in `tests/curriculum/networking-curriculum.test.ts`.
   - Canvas UI test in `tests/ui/networking-canvas.test.tsx`.
   - Verify with `node ./node_modules/vitest/vitest.mjs run` and `npx tsc --noEmit`.
