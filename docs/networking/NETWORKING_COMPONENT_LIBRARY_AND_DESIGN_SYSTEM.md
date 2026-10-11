# Networking Component Library & Learning Design System

> **Document Version:** 1.0.0 (Phase 4 Deliverable)  
> **Status:** Production Standard for All 16 Networking Curriculum Modules  
> **Location:** `docs/networking/NETWORKING_COMPONENT_LIBRARY_AND_DESIGN_SYSTEM.md`  
> **Package Root:** `src/components/learning/networking/index.ts`

---

## 1. Executive Summary & Design Philosophy

The **SQLens Networking Component Library** is a modular, high-fidelity UI system designed specifically for teaching computer networking concepts through **interactive state machines**, **progressive disclosure**, and **cognitive fading**.

### Core Pedagogical Principles:
1. **Never Show Answers as Multiple-Choice Crutches:**
   Calculations (CIDR block sizes, network boundaries, MAC rewrites, next-hop IPs) must be computed or predicted by the learner rather than selected from a list of supplied numbers.
2. **Deterministic Step-by-Step State Machines:**
   Dynamic protocols (ARP, 802.1D STP, TCP 3-Way Handshake) are represented as deterministic, reversible event steppers rather than static bullet points.
3. **Multi-Layer Progressive Disclosure:**
   Packets are analyzed across OSI Layers 2, 3, 4, and 7. Learners can zoom in on specific layer headers or observe cross-hop transformations (e.g. TTL decrements, MAC rewrites).
4. **Rich Aesthetic Standards:**
   Curated HSL color tokens, dark mode glassmorphism (`bg-surface-1/90 backdrop-blur-md border border-border`), smooth transitions, and monospace telemetry viewports.

---

## 2. Component Catalog & Architecture

```
src/components/learning/networking/
├── index.ts                      # Unified component library export point
├── PacketInspector.tsx           # Multi-layer packet decoder & hop diff comparator
├── SubnetBitSlicer.tsx           # 32-bit interactive CIDR binary visualizer
├── StructuredTaskGrader.tsx      # Numerical/text grading with misconception feedback
├── ArpSimulationLab.tsx          # 4-step ARP resolution stepper & FIFO hold queue
├── SwitchSimulationLab.tsx       # Layer 2 switching topology simulator
├── SubnetPilotVisuals.tsx        # Router-on-a-Stick 802.1Q & Host Terminal visualizers
├── SwitchingTopologyCanvas.tsx   # Canvas for switch packet animations
├── MacTableView.tsx              # Switch CAM / MAC address table
├── PlaybackControls.tsx          # Play/pause/step simulation playback bar
└── PredictionGate.tsx            # Pre-transmission egress port prediction gate
```

---

## 3. Component API Reference

### 3.1. `PacketInspector`

The central inspection widget for Layer 2–Layer 7 protocol encapsulation and hop-by-hop telemetry analysis.

```tsx
import { PacketInspector } from '@/components/learning/networking';

<PacketInspector
  taskContent={{
    title: "Hop 1: Workstation ➔ Router R1 Egress",
    snapshots: [
      {
        hopLabel: "Ingress at Router Gig0/0",
        deviceType: "Router",
        layer2: {
          srcMac: "AA:AA:AA:AA:AA:AA",
          dstMac: "GW:01:01:01:01:01",
          etherType: "0x0800 (IPv4)",
        },
        layer3: {
          version: 4,
          srcIp: "192.168.1.10",
          dstIp: "8.8.8.8",
          ttl: 64,
          protocol: "ICMP (1)",
        },
        layer4: {
          type: "ICMP",
          icmpType: "Echo Request (8)",
          icmpCode: 0,
        },
      },
      {
        hopLabel: "Egress at Router Gig0/1",
        deviceType: "Router",
        layer2: {
          srcMac: "GW:02:02:02:02:02", // Rewritten router egress MAC
          dstMac: "ISP:99:99:99:99:99", // Next-hop ISP MAC
          etherType: "0x0800 (IPv4)",
        },
        layer3: {
          version: 4,
          srcIp: "192.168.1.10",
          dstIp: "8.8.8.8",
          ttl: 63, // Decremented TTL
          protocol: "ICMP (1)",
        },
      },
    ],
    highlightedModifications: [
      {
        layer: "L3",
        field: "TTL",
        description: "Router decrements TTL by 1 before forwarding",
        beforeValue: "64",
        afterValue: "63",
      },
      {
        layer: "L2",
        field: "Dst MAC",
        description: "Layer 2 destination rewritten to next-hop gateway",
        beforeValue: "GW:01:01:01:01:01",
        afterValue: "ISP:99:99:99:99:99",
      },
    ],
  }}
/>
```

#### Feature Highlights:
- **Layer Accordions:** Dedicated collapsible panels for L2 (Amber), L3 (Cyan), L4 (Purple), L7 (Emerald).
- **Hop Diff Mode:** Side-by-side comparative inspection highlighting header rewrites across routing hops and NAT boundaries.
- **Hex Dump Inspection:** Interactive byte offset viewer mapping raw octets to ASCII.

---

### 3.2. `SubnetBitSlicer`

Visualizes 32-bit IPv4 addresses split into network and host bits across octets 1–4.

```tsx
import { SubnetBitSlicer, calculateSubnet } from '@/components/learning/networking';

<SubnetBitSlicer
  initialIp="192.168.10.130"
  initialPrefix={26}
  isInteractive={true}
  initiallyCollapsed={false}
  title="Octet 4 Bit Slicing Demo"
/>
```

#### Key Capabilities:
- **Active-Octet Detection:** Automatically isolates whether slicing occurs in Octet 1 (`/1`–`/8`), Octet 2 (`/9`–`/16`), Octet 3 (`/17`–`/24`), or Octet 4 (`/25`–`/30`).
- **Mathematical Invariants:** Calculates dotted subnet mask, network address, broadcast address, first usable host, last usable host, total blocks, and usable capacity ($2^H - 2$, with RFC 3021 $/31$ exception handling).

---

### 3.3. `StructuredTaskGrader`

Deterministic numeric and string evaluation form for scaffolded tasks.

```tsx
import { StructuredTaskGrader } from '@/components/learning/networking';

<StructuredTaskGrader
  title="Calculate Subnet Host Capacity"
  description="Enter the network boundary and usable host range."
  fields={[
    {
      id: "net_addr",
      label: "Network Address",
      placeholder: "e.g. 192.168.10.128",
      expected: "192.168.10.128",
      misconceptions: [
        {
          test: (val) => val === "192.168.10.0",
          feedback: "Remember that /26 creates 4 subnets in multiples of 64: 0, 64, 128, 192.",
        },
      ],
    },
    {
      id: "usable_hosts",
      label: "Total Usable Host Addresses",
      type: "number",
      expected: 62,
    },
  ]}
  isPassed={false}
  onGrade={(passed, details) => {
    console.log("Grade outcome:", passed, details);
  }}
  reflectionPrompt="Why must every subnet subtract 2 addresses from the total host capacity?"
  modelExplanation="One address is reserved for the Subnet Identifier (all host bits 0), and one address is reserved for the Directed Broadcast (all host bits 1)."
/>
```

---

### 3.4. `ArpSimulationLab`

Event-driven 4-step stepper illustrating dynamic Layer 2 resolution and FIFO hold queueing.

```tsx
import { ArpSimulationLab } from '@/components/learning/networking';

<ArpSimulationLab
  taskArp={{
    stage: 1,
    sourceHost: { name: "Host A", ip: "192.168.1.10", mac: "AA:AA:AA:AA:AA:AA", port: 1 },
    targetHost: { name: "Host B", ip: "192.168.1.20", mac: "BB:BB:BB:BB:BB:BB", port: 2 },
    allHosts: [
      { name: "Host A", ip: "192.168.1.10", mac: "AA:AA:AA:AA:AA:AA", port: 1 },
      { name: "Host B", ip: "192.168.1.20", mac: "BB:BB:BB:BB:BB:BB", port: 2 },
      { name: "Host C", ip: "192.168.1.30", mac: "CC:CC:CC:CC:CC:CC", port: 3 },
    ],
  }}
/>
```

#### Protocol Stages Illustrated:
1. **FIFO Outbound Queue:** Buffers Layer 3 IP packet in pending status.
2. **ARP Request Broadcast:** Frame `FF:FF:FF:FF:FF:FF`, Opcode 1, Target MAC `00:00:00:00:00:00`.
3. **Switch Ingress Learning:** Switch CAM table records Port ➔ Source MAC.
4. **Target Match & Cache Update:** Target records sender; non-targets silently drop.
5. **Unicast Reply & Dequeue:** Target replies with Opcode 2; sender dequeues and transmits buffered IP packet.

---

## 4. Module-by-Module Component Rollout Matrix (Phase 5 Guide)

| Module ID | Module Title | Recommended Primary Widgets | Key Interactive Tasks |
| :--- | :--- | :--- | :--- |
| **`net-01`** | Two Computers & a Wire | `PacketInspector` (L1/L2) | Frame preamble, MAC addressing, FCS verification |
| **`net-02`** | Hubs vs. Switches | `SwitchSimulationLab` | Collision domain vs. broadcast domain, CAM learning |
| **`net-03`** | Switching & VLANs | `SwitchSimulationLab`, `RouterOnAStickDiagram` | 802.1Q trunking, access ports, broadcast boundary |
| **`net-04`** | IPv4 & Subnetting | `SubnetBitSlicer`, `StructuredTaskGrader` | 32-bit bit slicing, /22 active-octet transfer |
| **`net-05`** | ARP & Resolution | `ArpSimulationLab`, `StructuredTaskGrader` | FIFO hold queue, default gateway ARP resolution |
| **`net-06`** | IPv6 & NDP | `SubnetBitSlicer`, `PacketInspector` | 128-bit compression, SLAAC, Solicit-Node multicast |
| **`net-07`** | Routing Fundamentals | `PacketInspector` (Hop Diff) | Longest prefix match, TTL decrement, MAC rewrite |
| **`net-08`** | OSPF & Dynamic Routing | `SwitchSimulationLab` | Link-state advertisements (LSA), Dijkstra metric |
| **`net-09`** | BGP & Autonomous Systems | `PacketInspector` (L3/L4) | AS-Path prepending, eBGP vs iBGP peering |
| **`net-10`** | TCP & Transport | `PacketInspector` (L4) | 3-Way handshake (SYN/ACK), sliding window flow control |
| **`net-11`** | UDP & Real-Time Protocols | `PacketInspector` (L4) | Header comparison (8 bytes vs 20 bytes), jitter/loss |
| **`net-12`** | DNS & Name Resolution | `PacketInspector` (L7) | Recursive vs iterative queries, authoritative records |
| **`net-13`** | DHCP & Dynamic Config | `PacketInspector` (L7) | DORA exchange (Discover, Offer, Request, Acknowledge) |
| **`net-14`** | Network Troubleshooting | `HostTelemetryTerminal` | Simulated CLI: `ipconfig`, `ping`, `tracert`, `nslookup` |
| **`net-15`** | Network Security & Firewalls | `PacketInspector` | Stateful packet inspection (SPI), ACL permit/deny |
| **`net-16`** | Modern Architectures & TLS | `PacketInspector` (L7) | TLS 1.3 cryptographic handshake, SNI, overlay tunnels |

---

## 5. Verification & Testing Requirements

1. **Static Rendering:** All components must render to static HTML via `renderToStaticMarkup` without requiring DOM emulation or browser APIs.
2. **Type Safety:** 100% strict TypeScript typing with zero `any` parameters in component props.
3. **Accessibility:** Semantic buttons, proper `aria-label` attributes, keyboard navigation support, and high-contrast color badges.
