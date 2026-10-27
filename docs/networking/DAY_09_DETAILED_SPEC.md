# SQLens Networking Track — Day 9 Implementation Specification
## Day 9 · Broadcast Domains (`net-09`)

> **Authoritative Specification & Implementation Blueprint**  
> **Status**: [PLANNED - READY FOR IMPLEMENTATION]  
> **Pedagogical Doctrine**: Zero Analogies, Physical Digital Reality, Exact Terminology, Gradual Canvas Reveal, Cognitive Pacing (Never Dump Too Much).

---

### 1. Pedagogical Objective & Transition from Day 8

- **Context**: In Day 7, the learner saw PC1 use ARP broadcast (`FF:FF:FF:FF:FF:FF`) to discover a neighbour's MAC address. In Day 8, the learner saw how a switch learns MAC addresses from source addresses and floods unknown unicasts until learned.
- **The Core Question of Day 9**: What happens when a message is intentionally sent to *everyone* (`FF:FF:FF:FF:FF:FF` or `.255`)? How far does that broadcast travel across the physical infrastructure, and why doesn't a broadcast crash the entire internet?
- **Digital Reality**:
  - A switch **always** floods Layer 2 broadcast frames (`FF:FF:FF:FF:FF:FF`) out of every active port except the arrival port. Broadcasts are never filtered or learned as a single port destination.
  - Every workstation in that broadcast domain has its physical network card accept the frame, trigger a **hardware CPU interrupt**, and force the operating system kernel to inspect the payload.
  - A **router interface does NOT forward Layer 2 broadcasts**. A router stops broadcasts cold (RFC 1812 compliance).
  - Therefore, **1 switch = 1 broadcast domain**, while **each router interface defines a new broadcast domain**.
  - **The Bridge to Stage 4**: Understanding broadcast domains explains why large flat networks suffer from broadcast storms, setting up the exact problem that **VLANs (Day 10)** solve on a single physical switch.

---

### 2. Module Definition (`src/content/networking/modules/net-09.ts`)

```typescript
import { NetworkingModule } from '@/types/networking';

export const NET_09_MODULE: NetworkingModule = {
  id: 'net-09',
  dayNumber: 9,
  title: 'Day 9 · Broadcast Domains',
  shortTitle: 'Broadcast Domains',
  steps: [
    {
      group: 'Idea 1 of 5 · The universal call',
      chg: 'Since Day 8: PC1–PC4 remain on Switch SW1. We now connect Router R1 to link our local network with a second switch, SW2, in Subnet 2.',
      title: 'The broadcast address: reaching everyone',
      what:
        'When a device needs to communicate with every machine on a local network without knowing their individual hardware addresses, it sends a broadcast.\n\nIn Layer 2 Ethernet, the broadcast address is FF:FF:FF:FF:FF:FF (all 48 bits set to binary 1). In IPv4, it is the subnet broadcast address (192.168.1.255 for 192.168.1.0/24).\n\nUnlike the unknown unicast from Day 8 which was only flooded temporarily until the destination replied, a broadcast is permanent. Switch SW1 replicates and floods every broadcast frame out of every connected port, ensuring every single machine receives it.',
      why: 'Protocols like ARP discovery and DHCP configuration require reaching every local station before IP addresses or routes are known.',
      pic: 'PC1 transmits an amber broadcast frame. Switch SW1 replicates it and floods it simultaneously out of Ports 2, 3, 4, and the link to Router R1.',
      task: 'Inspect Switch SW1 to view its broadcast domain scope.',
      cmd: 'show broadcast domain',
      read: [
        ['Domain Scope', 'Switch SW1 (Ports 1, 2, 3, 4)'],
        ['Broadcast MAC', 'FF:FF:FF:FF:FF:FF (48 binary 1s)'],
        ['Subnet Broadcast', '192.168.1.255 (/24 broadcast address)'],
        ['Forwarding Rule', 'FLOOD to every active port except arrival port'],
      ],
      rem: 'A switch replicates and floods every broadcast frame out of all active ports.',
    },
    {
      group: 'Idea 2 of 5 · The cost of noise',
      title: 'CPU interrupts: every station must listen',
      what:
        'When a network card receives a unicast frame addressed to someone else, the hardware card discards it immediately without waking the main processor.\n\nBut when a frame arrives addressed to FF:FF:FF:FF:FF:FF, the hardware network card must accept it and generate an operating system hardware interrupt.\n\nThe computer\'s CPU must immediately halt its current task, copy the frame into system memory, parse the headers, and decide whether to process it. If hundreds of devices broadcast constantly, this creates a broadcast storm that robs every computer of CPU cycles.',
      why: 'Broadcast traffic consumes CPU cycles on every single listening computer, not just bandwidth on the wire.',
      pic: 'PC2, PC3, and PC4 receive the broadcast frame. Flashing badges appear over their CPUs indicating active hardware interrupts and OS kernel inspection.',
      task: 'Inspect the station processing stats for PC2, PC3, and PC4.',
      cmd: 'show station stats',
      read: [
        ['Host PC2', '1 broadcast received · Hardware CPU interrupt generated'],
        ['Host PC3', '1 broadcast received · Hardware CPU interrupt generated'],
        ['Host PC4', '1 broadcast received · Hardware CPU interrupt generated'],
        ['Kernel Action', 'Network stack inspected payload headers'],
      ],
      rem: 'Every machine in a broadcast domain must halt its CPU to inspect every broadcast frame.',
    },
    {
      group: 'Idea 3 of 5 · The router boundary',
      title: 'Where broadcasts stop: the router interface',
      what:
        'Why does a broadcast from PC1 not travel across the internet and interrupt billions of computers worldwide?\n\nBecause routers physically do not forward Layer 2 broadcasts. When Switch SW1 floods the broadcast to Router R1 Port 1, the router inspects the frame. Because the destination is FF:FF:FF:FF:FF:FF and not a routable unicast IP packet, Router R1 drops the frame cold.\n\nRouter R1 will never forward an Ethernet broadcast from Port 1 out through Port 2 into Subnet 2. A router interface is the hard physical boundary where a broadcast domain terminates.',
      why: 'Router broadcast boundaries prevent local network chatter and storms from spilling into other networks or across the internet.',
      pic: 'The broadcast pulse reaches Router R1 Port 1. A glowing barrier appears at Port 1 labeled "ROUTER BROADCAST BARRIER ✕ · FRAME DROPPED". The link to Subnet 2 stays quiet.',
      task: 'Inspect Router R1’s broadcast handling log.',
      cmd: 'show router broadcast',
      read: [
        ['Ingress Port', 'Port 1 (192.168.1.1/24)'],
        ['Frame Type', 'Ethernet Broadcast (FF:FF:FF:FF:FF:FF)'],
        ['Router Action', 'DROP / FILTERED (RFC 1812 compliance)'],
        ['Egress Port', 'Port 2 (192.168.2.1/24) — SILENT (0 frames forwarded)'],
      ],
      rem: 'Routers do not forward Layer 2 broadcasts; every router port marks the boundary of a broadcast domain.',
    },
    {
      group: 'Idea 4 of 5 · Two separate domains',
      title: 'Counting broadcast domains across routers',
      what:
        'A broadcast domain is the entire set of network devices that receive a broadcast frame sent by any one of them.\n\nTo count broadcast domains in a topology, count the router interfaces. A switch creates a single broadcast domain connecting all its ports. But a router splits networks into separate, isolated broadcast domains.\n\nIn our topology, Switch SW1 and its PCs form Broadcast Domain 1 (192.168.1.0/24). Switch SW2 and its PCs form Broadcast Domain 2 (192.168.2.0/24). Router R1 connects them logically for unicast IP packets, while keeping broadcast noise strictly isolated.',
      why: 'Partitioning networks into distinct broadcast domains limits broadcast storms, increases security, and improves network scalability.',
      pic: 'Two distinct dashed boundary boxes glow on the canvas: Blue boundary around Subnet 1 (Broadcast Domain 1) and Green boundary around Subnet 2 (Broadcast Domain 2).',
      task: 'List all identified broadcast domains across the topology.',
      cmd: 'show domains',
      read: [
        ['Domain 1', '192.168.1.0/24 · PC1–PC4 + Switch SW1 + Router R1 Port 1'],
        ['Domain 2', '192.168.2.0/24 · PC5–PC6 + Switch SW2 + Router R1 Port 2'],
        ['Total Domains', '2 isolated broadcast domains'],
        ['Boundary Device', 'Router R1 (blocks Layer 2 broadcasts)'],
      ],
      rem: 'One switch equals one broadcast domain; each interface of a router creates a new broadcast domain.',
    },
    {
      group: 'Idea 5 of 5 · Directed broadcast in action',
      title: 'Testing the boundary with a subnet ping',
      what:
        'Let’s test the broadcast domain boundary live by having PC1 ping the subnet broadcast address: 192.168.1.255.\n\nPC1 transmits the ping. Every device on Subnet 1 (PC2, PC3, PC4) and the router’s local port (192.168.1.1) hears the echo request and replies back to PC1.\n\nNow look at Subnet 2: PC5 and PC6 hear nothing. Router R1 absorbed the broadcast at Port 1 and refused to forward it out of Port 2. Subnet 2 remained completely quiet.',
      why: 'Directed subnet broadcasts confirm that all local devices respond while foreign subnets remain completely protected from broadcast traffic.',
      pic: 'Ping pulses hit PC2, PC3, PC4, and R1 Port 1. Echo replies stream back to PC1. Subnet 2 links remain inactive.',
      task: 'Ping the subnet broadcast address 192.168.1.255 from PC1.',
      cmd: 'ping 192.168.1.255',
      read: [
        ['Reply from 192.168.1.20', 'PC2 replied (inside Broadcast Domain 1)'],
        ['Reply from 192.168.1.30', 'PC3 replied (inside Broadcast Domain 1)'],
        ['Reply from 192.168.1.40', 'PC4 replied (inside Broadcast Domain 1)'],
        ['Reply from 192.168.1.1', 'Router R1 Port 1 replied (inside Broadcast Domain 1)'],
        ['Subnet 2 Devices', '0 replies received (broadcast blocked at router boundary)'],
      ],
      rem: 'A subnet broadcast reaches every host on the local switch, but is blocked from crossing into other subnets by the router.',
    },
    {
      group: 'Recap',
      title: 'The four principles of broadcast domains',
      what:
        'Switches connect devices into a single broadcast domain and flood every broadcast frame. Routers break networks into multiple broadcast domains and drop broadcasts at the interface.',
      why: 'Understanding broadcast domains is the essential foundation for Stage 4, where we learn how Virtual LANs (VLANs) divide a single physical switch into multiple broadcast domains.',
      pic: 'Complete dual-subnet topology showing Domain 1 and Domain 2 isolated by Router R1, previewing the transition to VLANs.',
      task: 'Review the four fundamental rules of broadcast domains.',
      cmd: null,
      read: [
        ['1. Broadcast MAC', 'FF:FF:FF:FF:FF:FF (all bits 1; accepted by all local network cards)'],
        ['2. Switch Behavior', 'Always floods broadcasts to all ports except ingress'],
        ['3. Station Impact', 'Triggers a CPU interrupt on every computer in the domain'],
        ['4. Router Boundary', 'Drops Layer 2 broadcasts; every router port begins a new domain'],
      ],
      rem: 'Switches flood broadcasts; routers contain them. Keeping broadcast domains small is the foundation of network stability.',
    },
  ],
  staticResponses: {
    'show broadcast domain':
      'Switch SW1 Broadcast Domain Info\n--------------------------------------------\nVLAN / Domain:   Default (1)\nMember Ports:    Port 1 (PC1), Port 2 (PC2), Port 3 (PC3), Port 4 (PC4), Port 5 (R1:P1)\nBroadcast MAC:   FF:FF:FF:FF:FF:FF\nIPv4 Subnet:     192.168.1.0/24 (Broadcast: 192.168.1.255)\nForwarding Mode: FLOOD to all member ports',
    'show station stats':
      'Local Station Broadcast Reception Stats\n----------------------------------------------------\nHost    IP Address     MAC Address        Broadcasts  CPU Interrupt\nPC2     192.168.1.20   AA:BB:CC:00:00:02  1 frame     TRIGGERED\nPC3     192.168.1.30   AA:BB:CC:00:00:03  1 frame     TRIGGERED\nPC4     192.168.1.40   AA:BB:CC:00:00:04  1 frame     TRIGGERED\nState: All local CPUs interrupted for frame inspection.',
    'show router broadcast':
      '[Router R1] Ingress frame on Port 1 (192.168.1.1)\n[Router R1] Header: DA=FF:FF:FF:FF:FF:FF (Ethernet Broadcast)\n[Router R1] Inspection: Non-routable Layer 2 broadcast frame\n[Router R1] Forwarding Decision: DROP / FILTERED (RFC 1812)\n[Router R1] Port 2 (192.168.2.1) egress: SUPPRESSED (0 frames forwarded)',
    'show domains':
      'Topology Broadcast Domain Inventory\n----------------------------------------------------\nDomain ID  Subnet           Members                   Boundary Device\nDomain 1   192.168.1.0/24   PC1..PC4, SW1, R1:Port 1  Router R1\nDomain 2   192.168.2.0/24   PC5..PC6, SW2, R1:Port 2  Router R1\n----------------------------------------------------\nTotal Broadcast Domains: 2 (separated by Layer 3 Router R1)',
    'ping 192.168.1.255':
      'Sending 4 64-byte ICMP Echos to subnet broadcast 192.168.1.255:\nReply from 192.168.1.20: bytes=64 time=0.8ms TTL=64 (PC2)\nReply from 192.168.1.30: bytes=64 time=0.9ms TTL=64 (PC3)\nReply from 192.168.1.40: bytes=64 time=0.7ms TTL=64 (PC4)\nReply from 192.168.1.1:  bytes=64 time=0.5ms TTL=64 (Router R1 Port 1)\n\n--- 192.168.1.255 broadcast ping statistics ---\n4 responses received from 4 local devices. 0 responses from Subnet 2.',
    help:
      'Commands: show broadcast domain, show station stats, show router broadcast, show domains, ping 192.168.1.255, cls, clear, help',
  },
};
```

---

### 3. Canvas Topology & Visual Design (`DAY_WORLD_SPECS['net-09']`)

- **Virtual Coordinate Space**: `1180px` width × `540px` height.
- **Topology Architecture**:
  - **Left Subnet (Broadcast Domain 1)**:
    - Container box: `x=30, y=35, width=510, height=470`
    - Title: `LOCAL SUBNET 1 · 192.168.1.0/24 (BROADCAST DOMAIN 1)`
    - PC1 (Workstation): `x=90, y=190` (IP: `192.168.1.10`, MAC: `AA:BB:CC:00:00:01`)
    - PC2 (Workstation): `x=90, y=340` (IP: `192.168.1.20`, MAC: `AA:BB:CC:00:00:02`)
    - PC3 (Workstation): `x=240, y=55` (IP: `192.168.1.30`, MAC: `AA:BB:CC:00:00:03`)
    - PC4 (Workstation): `x=240, y=375` (IP: `192.168.1.40`, MAC: `AA:BB:CC:00:00:04`)
    - Switch SW1: `x=240, y=200`
  - **Center Router R1**:
    - SvgRouter: `x=580, y=190`
    - Port 1 (Left): `192.168.1.1` (connected to SW1)
    - Port 2 (Right): `192.168.2.1` (connected to SW2)
  - **Right Subnet (Broadcast Domain 2)**:
    - Container box: `x=720, y=35, width=430, height=470`
    - Title: `LOCAL SUBNET 2 · 192.168.2.0/24 (BROADCAST DOMAIN 2)`
    - Switch SW2: `x=810, y=200`
    - PC5 (Workstation): `x=970, y=130` (IP: `192.168.2.10`, MAC: `AA:BB:CC:00:02:01`)
    - PC6 (Workstation): `x=970, y=290` (IP: `192.168.2.20`, MAC: `AA:BB:CC:00:02:02`)

---

### 4. Step-by-Step Gradual Reveal Progression

| Step | Active Elements Revealed | Cable States & Animations | Badges & HUD Indicators |
| :--- | :--- | :--- | :--- |
| **Idea 1** (`step 0`) | Full topology visible; cables connected; domain boundaries subtle | Amber pulses from PC1 across SW1 to PC2, PC3, PC4, and R1:Port 1 | SW1 Broadcast Domain Info HUD card |
| **Idea 2** (`step 1`) | Broadcast waves hit all stations on SW1 | Amber transmission lines on all 4 SW1 links | Pulsing "CPU INTERRUPT: Frame Inspected" badges over PC2, PC3, and PC4 |
| **Idea 3** (`step 2`) | Broadcast reaches Router R1 Port 1 | SW1 ➔ R1:Port 1 link amber; R1:Port 2 ➔ SW2 link completely dark (gray/silent) | Glowing crimson barrier pill: `ROUTER BROADCAST BARRIER ✕ · FRAME DROPPED` |
| **Idea 4** (`step 3`) | Both broadcast domains highlighted | Boundary lines pulse with colored glow: Blue (Domain 1) and Green (Domain 2) | HUD card: `2 BROADCAST DOMAINS (DIVIDED BY ROUTER R1)` |
| **Idea 5** (`step 4`) | Directed ping executed (`192.168.1.255`) | Multi-color ping pulses stream back from PC2, PC3, PC4, and R1 to PC1 | "Subnet 2 Silent (Isolated)" callout over SW2 |
| **Recap** (`step 5`) | Complete high-contrast dual-domain summary | All links green, quiescent | 4-Rule Golden Takeaway banner + Next Stage 4 (VLANs) teaser |
