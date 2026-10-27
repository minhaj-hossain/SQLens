# SQLens Networking Track — Day 10 Implementation Specification
## Day 10 · VLANs: Separating Networks on One Switch (`net-10`)

> **Authoritative Specification & Implementation Blueprint**  
> **Status**: [READY FOR IMPLEMENTATION]  
> **Pedagogical Doctrine**: Zero Analogies, Physical Digital Reality, Exact Terminology, Gradual Canvas Reveal, Cognitive Pacing (Never Dump Too Much).  
> **Stylistic Requirement**: 100% human-crafted phrasing, authentic senior engineer tone, zero robotic prose.

---

### 1. Pedagogical Objective & Transition from Day 9

- **Context**: In Day 9, the learner saw that a Layer 3 router breaks up broadcast domains. However, buying a physical router every time an organization needs to isolate two departments is expensive, physically messy, and leaves switch ports unused.
- **The Core Question of Day 10**: How can a network engineer isolate two departments and contain broadcast noise when both departments are plugged into the *exact same physical switch*?
- **Digital Reality**:
  - Out of the box, every port on an Ethernet switch belongs to **VLAN 1 (the Default VLAN)**. The entire physical switch is one large broadcast domain.
  - A **Virtual Local Area Network (VLAN)** partitions the switch’s internal forwarding engine into independent logical broadcast domains using software configuration.
  - An **Access Port** connects directly to an end host (PC, server, printer) and belongs to exactly one VLAN.
  - When a broadcast frame enters an access port, the switch floods it **only** out of other ports assigned to that exact same VLAN.
  - Devices on different VLANs **cannot communicate at Layer 2**, even if they share the same physical switch. Communication between VLANs requires a Layer 3 router (introduced in Day 12).
  - **The Bridge to Day 11**: Once you understand how to split one switch with VLANs, Day 11 tackles the next challenge: how to extend those VLANs to a second switch over a single cable using an **802.1Q Trunk**.

---

### 2. Module Definition (`src/content/networking/modules/net-10.ts`)

```typescript
import { NetworkingModule } from '@/types/networking';

export const NET_10_MODULE: NetworkingModule = {
  id: 'net-10',
  dayNumber: 10,
  title: 'Day 10 · VLANs: Separating Networks on One Switch',
  shortTitle: 'VLANs: Separating Networks on One Switch',
  steps: [
    {
      group: 'Idea 1 of 5 · The default switch',
      chg: 'Since Day 9: We saw that routers divide broadcast domains. Today, we leave the router behind and look at how a single switch can do this internally using VLANs.',
      title: 'One physical switch, one big domain',
      what:
        'Take a standard 24-port switch out of its box and power it on. By default, every single physical port belongs to VLAN 1 (the Default VLAN).\n\nBecause all ports belong to the same VLAN, the switch acts as one large broadcast domain. If PC1 on Port 1 sends a broadcast frame to FF:FF:FF:FF:FF:FF, the switch floods that frame out of Port 2, Port 3, Port 4, and every other active port.\n\nIn a small home or lab with four computers, this works fine. But in an office with 200 computers, accounting, engineering, and guest Wi-Fi would all share the same wire noise and security risks.',
      why: 'Before you can segment a switch, you must understand its factory default state: all ports wide open to each other in VLAN 1.',
      pic: 'A central switch SW1 connected to four workstations: PC1 (Port 1), PC2 (Port 2), PC3 (Port 3), and PC4 (Port 4). All four ports glow neutral gray, labeled VLAN 1.',
      task: 'Inspect the switch VLAN table to see the default port assignments.',
      cmd: 'show vlan',
      read: [
        ['VLAN 1 (default)', 'Active · Ports 1, 2, 3, 4'],
        ['Status', 'All ports in a single broadcast domain'],
        ['Isolation', 'None (all ports hear all broadcasts)'],
      ],
      rem: 'Out of the box, every port on an Ethernet switch belongs to VLAN 1, forming a single shared broadcast domain.',
    },
    {
      group: 'Idea 2 of 5 · Creating virtual switches',
      title: 'Carving the switch into VLAN 10 and VLAN 20',
      what:
        'Buying a separate physical switch for every department is expensive and leaves dozens of ports sitting unused. Virtual Local Area Networks (VLANs) solve this in software.\n\nA VLAN splits the switch’s internal forwarding engine into independent, isolated tables. Each VLAN gets a unique number (a VLAN ID from 1 to 4094).\n\nLet’s create two VLANs on Switch SW1: VLAN 10 for Engineering (IP subnet 192.168.10.0/24) and VLAN 20 for Finance (IP subnet 192.168.20.0/24). Until we assign ports to them, these VLANs are just empty buckets waiting for traffic.',
      why: 'Creating VLAN IDs establishes the logical network containers inside the switch operating system.',
      pic: 'Two color-coded zones appear inside the switch HUD: an Indigo container labeled VLAN 10 (Engineering) and an Emerald container labeled VLAN 20 (Finance). Both currently have 0 assigned ports.',
      task: 'Create VLAN 10 and VLAN 20 on Switch SW1.',
      cmd: 'vlan create 10 20',
      read: [
        ['VLAN 10', 'Created · Name: Engineering · 0 ports'],
        ['VLAN 20', 'Created · Name: Finance · 0 ports'],
        ['VLAN 1', 'Default · Ports 1, 2, 3, 4 still assigned'],
      ],
      rem: 'VLANs let you partition one physical switch into multiple logical networks using software configuration.',
    },
    {
      group: 'Idea 3 of 5 · Assigning physical ports',
      title: 'Assigning ports to VLANs',
      what:
        'Creating a VLAN doesn’t change what travels across the wire until you assign physical ports to it.\n\nPorts that connect directly to end devices (like workstations, printers, or servers) are configured as Access Ports. An access port belongs to exactly one VLAN. Any frame that enters an access port is stamped internally with that port’s VLAN ID.\n\nLet’s assign Port 1 (PC1) and Port 2 (PC2) to VLAN 10. Then we assign Port 3 (PC3) and Port 4 (PC4) to VLAN 20.\n\nNow, the switch hardware enforces a strict rule: traffic entering a port in VLAN 10 can only exit ports in VLAN 10.',
      why: 'Port assignment is where the physical cables meet the logical boundary. It dictates who is allowed to talk to whom.',
      pic: 'Ports 1 and 2 on Switch SW1 turn indigo (VLAN 10), matching PC1 and PC2. Ports 3 and 4 turn emerald (VLAN 20), matching PC3 and PC4. The switch table updates to show 2 ports per VLAN.',
      task: 'Assign Ports 1 & 2 to VLAN 10, and Ports 3 & 4 to VLAN 20.',
      cmd: 'vlan assign 1,2 to 10; vlan assign 3,4 to 20',
      read: [
        ['VLAN 10 (Engineering)', 'Ports 1, 2 (PC1 192.168.10.10, PC2 192.168.10.20)'],
        ['VLAN 20 (Finance)', 'Ports 3, 4 (PC3 192.168.20.30, PC4 192.168.20.40)'],
        ['VLAN 1', '0 active access ports'],
        ['Port Mode', 'Access (untagged end-station links)'],
      ],
      rem: 'An access port belongs to exactly one VLAN; traffic entering that port cannot leave through ports in other VLANs.',
    },
    {
      group: 'Idea 4 of 5 · Broadcast confinement',
      title: 'Broadcasts never cross the VLAN wall',
      what:
        'Now test what happens when PC1 sends a broadcast message to FF:FF:FF:FF:FF:FF (like an ARP request or DHCP discovery).\n\nIn Day 8, the switch flooded the broadcast out of Ports 2, 3, and 4.\n\nWatch what happens now: PC1’s broadcast enters Port 1. The switch sees that Port 1 belongs to VLAN 10. The switch looks up the membership of VLAN 10 and finds only one other member: Port 2.\n\nThe switch forwards the broadcast out of Port 2 to PC2. It does not touch Ports 3 and 4. The cables to PC3 and PC4 stay completely silent. The broadcast storm is cut in half.',
      why: 'VLANs contain broadcasts at Layer 2 without needing a physical router between every department.',
      pic: 'An indigo broadcast wave travels from PC1 into Port 1 and exits only out of Port 2 to PC2. Ports 3 and 4 have gray lock icons; the wires to PC3 and PC4 stay dead silent.',
      task: 'Transmit a broadcast from PC1 to observe VLAN boundary enforcement.',
      cmd: 'broadcast from pc1',
      read: [
        ['Ingress Port', 'Port 1 (VLAN 10)'],
        ['Replication Target', 'Port 2 (VLAN 10 member) — DELIVERED'],
        ['Filtered Ports', 'Ports 3, 4 (VLAN 20) — BLOCKED / SILENT'],
        ['Result', 'Broadcast confined strictly to VLAN 10'],
      ],
      rem: 'A switch never forwards a broadcast from one VLAN into another; each VLAN is an independent broadcast domain.',
    },
    {
      group: 'Idea 5 of 5 · Unicast isolation',
      title: 'Same switch, zero communication',
      what:
        'Broadcasts are contained, but what about direct unicast messages? What happens if PC1 (192.168.10.10) tries to ping PC3 (192.168.20.30)?\n\nThey are plugged into the exact same metal switch, three inches apart on the front panel. But PC1 is in VLAN 10, and PC3 is in VLAN 20.\n\nPC1 compares 192.168.20.30 to its subnet mask (255.255.255.0). It knows PC3 is on a different subnet. If PC1 tries to send data directly to PC3’s MAC address through Switch SW1, the switch drops the frame immediately. A Layer 2 switch will never pass frames between two different VLANs.\n\nTo communicate between VLAN 10 and VLAN 20, packets must leave the switch and pass through a Layer 3 router. That is the topic of Day 12.',
      why: 'VLANs provide complete security isolation: machines on different VLANs cannot talk to each other unless an administrator explicitly routes between them.',
      pic: 'PC1 sends a ping probe toward PC3. The packet reaches Switch SW1 and hits a glowing red barrier: "VLAN 10 ➔ VLAN 20 BLOCKED: LAYER 2 SWITCH CANNOT ROUTE ACROSS VLANS". PC3 hears nothing.',
      task: 'Ping across the VLAN boundary from PC1 to PC3 (192.168.20.30).',
      cmd: 'ping 192.168.20.30',
      read: [
        ['Source', 'PC1 · Port 1 (VLAN 10 · 192.168.10.10)'],
        ['Destination', 'PC3 · Port 3 (VLAN 20 · 192.168.20.30)'],
        ['Switch Forwarding', 'DROPPED (cross-VLAN Layer 2 forwarding prohibited)'],
        ['Packet Statistics', '100% packet loss (Destination host unreachable)'],
      ],
      rem: 'Devices on different VLANs cannot communicate through a Layer 2 switch without a router, even if they share the same physical switch.',
    },
    {
      group: 'Recap',
      title: 'The four rules of VLAN segmentation',
      what:
        'Virtual Local Area Networks break a single physical switch into isolated logical networks. They contain noisy broadcast storms, prevent unauthorized eavesdropping, and save money by consolidating hardware.',
      why: 'VLANs are the fundamental building block of enterprise switching. Understanding single-switch VLANs prepares you for Day 11, where we carry multiple VLANs across a single trunk cable to another switch.',
      pic: 'A clean split-view of Switch SW1 showing Indigo VLAN 10 on the left (PC1, PC2) and Emerald VLAN 20 on the right (PC3, PC4), completely isolated.',
      task: 'Review the four core rules of VLAN segmentation.',
      cmd: null,
      read: [
        ['1. Default State', 'All ports start in VLAN 1 (one big shared broadcast domain)'],
        ['2. Access Ports', 'Belong to exactly one VLAN; stamps incoming frames with that VLAN ID'],
        ['3. Broadcast Confinement', 'Broadcasts flood only to ports sharing the exact same VLAN ID'],
        ['4. Inter-VLAN Isolation', 'Traffic cannot cross between VLANs at Layer 2 (requires a Layer 3 router)'],
      ],
      rem: 'VLANs divide one physical switch into multiple isolated broadcast domains. Traffic never crosses between VLANs without a router.',
    },
  ],
  staticResponses: {
    'show vlan':
      'Switch SW1 VLAN Database\n----------------------------------------------------\nVLAN  Name              Status    Ports\n1     default           active    Port 1, Port 2, Port 3, Port 4\n----------------------------------------------------\nTotal VLANs: 1 (factory default state)',
    'vlan create 10 20':
      'Switch SW1(config)# vlan 10\nSwitch SW1(config-vlan)# name Engineering\nSwitch SW1(config)# vlan 20\nSwitch SW1(config-vlan)# name Finance\n\nVLAN 10 (Engineering) created successfully.\nVLAN 20 (Finance) created successfully.\nNo ports assigned yet.',
    'vlan assign 1,2 to 10; vlan assign 3,4 to 20':
      'Switch SW1(config)# interface range port 1 - 2\nSwitch SW1(config-if-range)# switchport mode access\nSwitch SW1(config-if-range)# switchport access vlan 10\nSwitch SW1(config)# interface range port 3 - 4\nSwitch SW1(config-if-range)# switchport mode access\nSwitch SW1(config-if-range)# switchport access vlan 20\n\nPort 1, Port 2 -> VLAN 10 (Engineering)\nPort 3, Port 4 -> VLAN 20 (Finance)',
    'broadcast from pc1':
      '[PC1] Transmitted broadcast frame to FF:FF:FF:FF:FF:FF\n[SW1] Ingress Port 1 -> Stamped with internal VLAN 10\n[SW1] Flood decision for VLAN 10:\n      -> Port 2 (VLAN 10): FORWARDED (PC2 received frame)\n      -> Port 3 (VLAN 20): FILTERED (boundary isolation)\n      -> Port 4 (VLAN 20): FILTERED (boundary isolation)\nBroadcast confined to 1 of 2 ports.',
    'ping 192.168.20.30':
      'Sending 4 64-byte ICMP Echos to 192.168.20.30:\nRequest timed out.\nRequest timed out.\nRequest timed out.\nRequest timed out.\n\n--- 192.168.20.30 ping statistics ---\n4 packets transmitted, 0 received, 100% packet loss\n(Host unreachable: VLAN 10 cannot forward to VLAN 20 at Layer 2)',
    help:
      'Commands: show vlan, vlan create 10 20, vlan assign 1,2 to 10; vlan assign 3,4 to 20, broadcast from pc1, ping 192.168.20.30, cls, clear, help',
  },
};
```

---

### 3. Canvas Topology & Visual Design (`DAY_WORLD_SPECS['net-10']`)

- **Virtual Coordinate Bounds**: `1080px` width × `520px` height.
- **Components & Placement**:
  - **Left Section · VLAN 10 (Indigo / Engineering)**:
    - Container Box: `x=35, y=30, width=460, height=460`
    - Subnet Label: `VLAN 10 (ENGINEERING) · 192.168.10.0/24`
    - PC1 (Workstation): `x=90, y=140`, IP: `192.168.10.10`, MAC: `AA:BB:CC:10:00:01`, Blue badge.
    - PC2 (Workstation): `x=90, y=330`, IP: `192.168.10.20`, MAC: `AA:BB:CC:10:00:02`, Blue badge.
  - **Center · Central Switch SW1 & VLAN HUD**:
    - Central SvgSwitch: `x=484, y=260` (width 112, height 48, cx=540, cy=284).
    - Port 1 & 2 on left face, Port 3 & 4 on right face.
    - **Floating VLAN Database HUD Card** above switch: `x=380, y=30, width=320, height=160`.
      - Displays live VLAN table (VLAN ID, Name, Ports, Status) dynamically reflecting step commands.
  - **Right Section · VLAN 20 (Emerald / Finance)**:
    - Container Box: `x=585, y=30, width=460, height=460`
    - Subnet Label: `VLAN 20 (FINANCE) · 192.168.20.0/24`
    - PC3 (Workstation): `x=900, y=140`, IP: `192.168.20.30`, MAC: `AA:BB:CC:20:00:03`, Green badge.
    - PC4 (Workstation): `x=900, y=330`, IP: `192.168.20.40`, MAC: `AA:BB:CC:20:00:04`, Green badge.

---

### 4. Step-by-Step Gradual Reveal Progression

| Step | State on Canvas | Cables & LEDs | HUD Table & Badges |
| :--- | :--- | :--- | :--- |
| **Idea 1** (`step 0`) | Factory default switch: Single neutral container box encompassing all 4 PCs. | Neutral gray cables. Ports 1–4 glow gray. | HUD: `VLAN 1 (default) -> Ports 1, 2, 3, 4`. Badge: `1 Shared Broadcast Domain`. |
| **Idea 2** (`step 1`) | `vlan create 10 20` run. | Unchanged wiring. | HUD updates: `VLAN 10 (Engineering) [0 ports]` and `VLAN 20 (Finance) [0 ports]` appear in table. |
| **Idea 3** (`step 2`) | `vlan assign` run. Single container cleanly splits into two colored zones: Indigo (left) and Emerald (right). | Ports 1 & 2 light up Indigo (`#6366f1`). Ports 3 & 4 light up Emerald (`#10b981`). | HUD: `VLAN 10: Ports 1, 2` and `VLAN 20: Ports 3, 4`. Badge: `Access Mode Active`. |
| **Idea 4** (`step 3`) | `broadcast from pc1` run. | Indigo broadcast wave flows from PC1 into Port 1 and exclusively out of Port 2 to PC2. | Ports 3 & 4 show Lock / Silent icons (`VLAN 20 Filtered ✕`). Wire to PC3 & PC4 dead quiet. |
| **Idea 5** (`step 4`) | `ping 192.168.20.30` run. | Probe leaves PC1, enters Port 1, and hits switch core. | Flashing crimson shield at switch center: `CROSS-VLAN BLOCKED ✕ (Layer 2 Isolation)`. PC3 remains untouched. |
| **Recap** (`step 5`) | High-contrast split view of Switch SW1 with two isolated logical domains. | Balanced dual-color topology. | Summary Card: `THE 4 RULES OF VLAN SEGMENTATION` + Teaser: `Day 11 · 802.1Q Trunks`. |

---

### 5. Implementation Task List

1. **Task 1: Module Definition**: Create `src/content/networking/modules/net-10.ts` with exact content and static responses.
2. **Task 2: Registry Integration**: Register in `src/content/networking/index.ts`.
3. **Task 3: Terminal & Workspace Aliases**: Add `net-10` commands and help text in `NetworkingTerminal.tsx` and `NetworkingWorkspace.tsx`.
4. **Task 4: Canvas Visualization**: Add `'net-10'` in `DAY_WORLD_SPECS` and render the split-VLAN SVG architecture in `NetworkingCanvas.tsx`.
5. **Task 5: Test Suite Coverage**: Add unit tests in `networking-curriculum.test.ts` and UI tests in `networking-canvas.test.tsx`.
