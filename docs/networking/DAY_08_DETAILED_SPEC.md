# SQLens Networking Track — Day 8 Implementation Specification
## Day 8 · How a Switch Learns: The MAC Address Table (`net-08`)

> **Authoritative Specification for Implementation in Next Conversation**  
> **Status**: [LIVE - IMPLEMENTED & VERIFIED]  
> **Pedagogical Doctrine**: Zero Analogies, Physical Digital Reality, Exact Terminology, Gradual Canvas Reveal.

---

### 1. Pedagogical Objective & Transition from Day 7

- **Context**: In Day 7, the learner observed **PC1** using ARP to discover PC2's physical MAC address.
- **The Core Question of Day 8**: Once PC1 puts PC2's MAC address on the wire, how does the physical switch in the middle know which wire leads to PC2?
- **Digital Reality**:
  - A switch does **not** have an IP address, default gateway, or routing table for packet forwarding.
  - A switch maintains a **MAC Address Table** (also known as the Filtering Database or CAM Table) mapping physical switch ports (`Port 1`, `Port 2`, etc.) to hardware MAC addresses (`AA:BB:CC:00:00:01`).
  - **The Golden Rule of Switching**: A switch learns from the **Source MAC** of incoming frames, and forwards based on the **Destination MAC**.
  - **Unknown Unicast Flooding**: When the destination MAC is not in the table, the switch floods the frame out of all ports except the arrival port.
  - **Selective Forwarding**: Once both devices have transmitted, traffic is forwarded point-to-point only between their specific ports; other ports hear nothing.
  - **Aging Timer**: Entries expire after inactivity (default 300 seconds) so moved or unplugged devices do not cause stale delivery.

---

### 2. Module Definition (`src/content/networking/modules/net-08.ts`)

```typescript
import { NetworkingModule } from '@/types/networking';

export const NET_08_MODULE: NetworkingModule = {
  id: 'net-08',
  dayNumber: 8,
  title: "Day 8 · How a Switch Learns: The MAC Address Table",
  shortTitle: "How a Switch Learns",
  summary: "Discover how switches map physical ports to MAC hardware addresses, flood unknown unicasts, and selectively forward frames.",
  objectives: [
    "Inspect an empty switch MAC address table at boot",
    "Understand passive source MAC learning on frame arrival",
    "Observe unknown unicast flooding across all non-ingress ports",
    "Verify selective point-to-point forwarding once addresses are learned",
    "Understand MAC table aging timers and dynamic cache invalidation",
  ],
  steps: [
    {
      group: "Idea 1 of 5 · The switch's memory",
      chg: "Since Day 7: PC1 and PC2 remain on the switch, joined by PC3 and PC4. We now look inside the switch itself.",
      title: "The switch starts with an empty table",
      what:
        "When an Ethernet switch powers on, its MAC address table is completely empty. Unlike a router, a switch does not care about IP addresses or subnet masks. Its only job is to deliver Layer 2 Ethernet messages to the correct physical port.\n\nTo do this, the switch maintains a table with two columns: a physical port number (Port 1, Port 2, Port 3, Port 4) and the MAC address of the device plugged into that port. Before any device transmits data, the switch knows nothing about what is plugged into its cables.",
      why: "A switch does not need pre-configuration or manual address assignment. It discovers the entire local network automatically by observing wire traffic.",
      pic: "Switch SW1 sits in the center with cables to PC1, PC2, PC3, and PC4. Beside the switch, the MAC Address Table HUD shows Port 1 through 4 with no learned addresses.",
      task: "Inspect Switch SW1's current MAC address table.",
      cmd: "show mac table",
      read: [
        ["Port", "Physical RJ-45 socket on the switch (Ports 1–4)"],
        ["MAC Address", "Hardware address of the connected network card"],
        ["Type", "DYNAMIC (learned automatically from traffic)"],
        ["Table State", "Empty (0 learned entries at boot)"],
      ],
      rem: "A switch starts with an empty MAC address table and discovers connected devices automatically.",
    },
    {
      group: "Idea 2 of 5 · Passive listening",
      title: "Learning from the source address",
      what:
        "A switch never sends questions or probes to discover who is plugged in. Instead, it learns passively by inspecting every message that enters a port.\n\nWhen PC1 sends a message to PC2, the message enters switch Port 1. The switch looks at the Source MAC field: AA:BB:CC:00:00:01.\n\nThe switch instantly records this in its table: Port 1 ➔ AA:BB:CC:00:00:01. From this moment on, whenever any other computer sends data to AA:BB:CC:00:00:01, the switch knows exactly which port to send it out of.",
      why: "Learning from the source address allows the switch to build its forwarding map without generating extra network traffic.",
      pic: "A frame leaves PC1 and enters Switch Port 1. Port 1 in the MAC table instantly lights up green with AA:BB:CC:00:00:01.",
      task: "Send a frame from PC1 to initiate learning on Port 1.",
      cmd: "ping 192.168.1.20",
      read: [
        ["Ingress Port", "Port 1 (where the electrical signal arrived)"],
        ["Source MAC", "AA:BB:CC:00:00:01 (PC1's network card)"],
        ["Learned Action", "Table updated: Port 1 = AA:BB:CC:00:00:01"],
        ["Destination MAC", "AA:BB:CC:00:00:02 (currently unknown to the switch)"],
      ],
      rem: "A switch learns which device is on a port by reading the Source MAC of incoming frames.",
    },
    {
      group: "Idea 3 of 5 · The unknown destination",
      title: "Unknown unicast flooding",
      what:
        "PC1's message is addressed to PC2 at AA:BB:CC:00:00:02. The switch looks up AA:BB:CC:00:00:02 in its MAC table. Because PC2 has not sent any data yet, the table has no entry for it.\n\nThe switch cannot guess where PC2 is, and it cannot drop the data. Instead, it performs unknown unicast flooding: it sends a copy of the frame out of every single port except the port it arrived on (Port 2, Port 3, and Port 4).\n\nPC3 and PC4 inspect the frame, see that the destination MAC does not match their network cards, and silently discard it. PC2 receives the frame and processes it.",
      why: "Flooding guarantees that an unknown destination receives its message even before the switch has learned where it is plugged in.",
      pic: "Yellow pulses fan out from Switch Ports 2, 3, and 4 simultaneously. PC3 and PC4 discard the frame; PC2 accepts it.",
      task: "Inspect the switch forwarding decision log to see the unknown unicast flood.",
      cmd: "show switch log",
      read: [
        ["Destination MAC", "AA:BB:CC:00:00:02 (not in table)"],
        ["Switch Action", "FLOOD out ports 2, 3, 4 (all except ingress Port 1)"],
        ["PC3 & PC4", "Destination MAC mismatch: frame dropped"],
        ["PC2", "Destination MAC match: frame accepted"],
      ],
      rem: "When a destination MAC is not in its table, a switch floods the frame out of all ports except the arrival port.",
    },
    {
      group: "Idea 4 of 5 · The return path",
      title: "Selective forwarding: quiet wires",
      what:
        "Now PC2 transmits its reply to PC1. The reply enters switch Port 2 with Source MAC AA:BB:CC:00:00:02 and Destination MAC AA:BB:CC:00:00:01.\n\nTwo things happen immediately:\n1. The switch records PC2's address: Port 2 ➔ AA:BB:CC:00:00:02.\n2. The switch looks up the destination (AA:BB:CC:00:00:01) and finds it is on Port 1.\n\nInstead of flooding, the switch performs selective forwarding: it sends the frame only out of Port 1 straight to PC1. Ports 3 and 4 hear nothing. The wires to PC3 and PC4 stay completely silent.",
      why: "Selective forwarding isolates traffic so conversations between two devices do not waste bandwidth on other computers.",
      pic: "Switch table now has both Port 1 and Port 2. Green pulse travels directly from Port 2 to Port 1; cables to PC3 and PC4 show zero activity.",
      task: "Inspect the updated MAC table showing both learned ports.",
      cmd: "show mac table",
      read: [
        ["Port 1", "AA:BB:CC:00:00:01 (PC1) - Active"],
        ["Port 2", "AA:BB:CC:00:00:02 (PC2) - Active"],
        ["Port 3 & 4", "Empty (no traffic seen yet)"],
        ["Forwarding Mode", "Selective unicast forwarding (no flooding)"],
      ],
      rem: "Once both addresses are learned, the switch forwards frames directly between their ports without bothering other devices.",
    },
    {
      group: "Idea 5 of 5 · Aging and moved devices",
      title: "Aging timers: cleaning stale entries",
      what:
        "What happens if an engineer unplugs PC2 from Port 2 and moves it to Port 4? Or what if PC1 powers off?\n\nIf MAC table entries were permanent, the switch would continue sending PC2's traffic to empty Port 2 forever.\n\nTo prevent this, every learned MAC entry has an Aging Timer (typically 300 seconds / 5 minutes). Every time a frame from that MAC arrives, the timer resets to 300. If no frames are seen from that device for 300 seconds, the entry expires and is removed from the table.\n\nIf the device speaks again from a new port, the switch immediately learns the new port mapping.",
      why: "Aging timers allow network switches to adapt automatically when cables are moved, hardware is replaced, or computers go to sleep.",
      pic: "A countdown age column appears in the MAC table HUD. Manually flushing the table resets all ports to empty.",
      task: "Clear the switch MAC table to observe dynamic aging and reset.",
      cmd: "clear mac table",
      read: [
        ["Command", "clear mac table (or 300s aging timeout)"],
        ["Result", "All dynamic MAC table entries flushed"],
        ["Next Transmission", "Will trigger new source learning and unknown flooding"],
        ["Benefit", "Prevents stale port forwarding when topology changes"],
      ],
      rem: "Aging timers ensure outdated port mappings expire so the switch adapts when devices move or disconnect.",
    },
    {
      group: "Recap",
      title: "The four principles of switching",
      what:
        "An Ethernet switch is a Layer 2 multiport bridge that connects devices inside a single local network. It learns passively, floods when necessary, and filters traffic to keep wires quiet.",
      why: "Understanding MAC tables is essential for diagnosing network performance, security sniffing, and loop prevention.",
      pic: "Complete local switch topology with 4 PCs, showing the active MAC address table and quiet links.",
      task: "Review the four fundamental rules of Ethernet switching.",
      cmd: null,
      read: [
        ["1. How does it learn?", "Reads the Source MAC of every incoming frame"],
        ["2. How does it forward?", "Looks up Destination MAC; sends only to the matching port"],
        ["3. Unknown destination?", "Floods out all ports except the arrival port"],
        ["4. Why do entries expire?", "Aging timers purge old entries so moved devices still work"],
      ],
      rem: "Switches learn from source MACs, forward to destination MACs, flood unknown unicasts, and expire stale entries with aging timers.",
    },
  ],
  staticResponses: {
    "show mac table":
      "Switch SW1 MAC Address Table\n--------------------------------------------\nVLAN  Port    MAC Address        Type     Age\n1     Port 1  AA:BB:CC:00:00:01  DYNAMIC  12s\n1     Port 2  AA:BB:CC:00:00:02  DYNAMIC  8s\nTotal entries: 2",
    "show switch log":
      "[Port 1] Ingress frame: SA=AA:BB:CC:00:00:01 DA=AA:BB:CC:00:00:02\n[SW1]    Learned: AA:BB:CC:00:00:01 on Port 1\n[SW1]    Lookup DA AA:BB:CC:00:00:02: NOT FOUND in MAC table\n[SW1]    Action: UNKNOWN UNICAST FLOOD -> Ports 2, 3, 4\n[Port 2] Frame received by PC2 (DA match)\n[Port 3] Frame discarded by PC3 (DA mismatch)\n[Port 4] Frame discarded by PC4 (DA mismatch)",
    "clear mac table":
      "Switch SW1: MAC address table cleared.\nAll dynamic entries removed.",
    "ping 192.168.1.20":
      "Sending 3 64-byte ICMP Echos to 192.168.1.20:\nReply from 192.168.1.20: bytes=64 time=0.8ms TTL=64\nReply from 192.168.1.20: bytes=64 time=0.6ms TTL=64\nReply from 192.168.1.20: bytes=64 time=0.5ms TTL=64\n\n--- 192.168.1.20 ping statistics ---\n3 packets transmitted, 3 received, 0% packet loss",
    "help":
      "Commands: show mac table, ping 192.168.1.20, show switch log, clear mac table, cls, clear, help",
  },
};
```

---

### 3. Canvas Topology & Dimensions (`DAY_WORLD_SPECS['net-08']`)

- **World Coordinates**:
  ```typescript
  'net-08': {
    width: 1040,
    height: 520,
    title: 'LAYER 2 SWITCHING · MAC ADDRESS TABLE & FLOODING ENGINE',
  }
  ```
- **Component Coordinates**:
  - **Switch SW1**: Centered at `x={450}, y={210}`. 4 RJ-45 ports with active link LEDs.
  - **PC1 (Workstation)**: `x={120}, y={204}` (connected to SW1 Port 1 via green cable `x1=206, y1=240, x2=450, y2=240`).
  - **PC2 (Workstation)**: `x={780}, y={204}` (connected to SW1 Port 2 via green cable `x1=560, y1=240, x2=780, y2=240`).
  - **PC3 (Workstation - Top)**: `x={450}, y={45}` (connected to SW1 Port 3 via cable `x1=505, y1=125, x2=505, y2=210`).
  - **PC4 (Workstation - Bottom)**: `x={450}, y={365}` (connected to SW1 Port 4 via cable `x1=505, y1=270, x2=505, y2=365`).
  - **Interactive MAC Address Table HUD**: Positioned directly below or beside Switch SW1 (`x={680}, y={45}` or floating right):
    - Header: `MAC ADDRESS TABLE · SW1`
    - Columns: `Port | MAC Address | Type | Age`
    - Progressive states:
      - Step 0 (Idea 1): Empty (`(0 entries learned · table empty)`).
      - Step 1 (Idea 2): Port 1 entry (`Port 1 | AA:BB:CC:00:00:01 | DYNAMIC | 298s`).
      - Step 2 (Idea 3): Flooding indicator on Ports 2, 3, 4 with yellow pulsing badges.
      - Step 3 (Idea 4): Port 1 + Port 2 populated (`Port 2 | AA:BB:CC:00:00:02 | DYNAMIC | 300s`).
      - Step 4 (Idea 5): Countdown timer or `(flushed by clear mac table)`.

---

### 4. Terminal Simulation Logic (`NetworkingTerminal.tsx`)

Add Day 8 handlers inside `runCommand` in `src/components/learning/networking/terminal/NetworkingTerminal.tsx`:
```typescript
if (dayId === 'net-08') {
  if (v === 'show mac table' || v === 'mac-table' || v === 'show mac') {
    if (activeStepIndex === 0) {
      out = 'Switch SW1 MAC Address Table\n--------------------------------------------\nVLAN  Port    MAC Address        Type     Age\n(0 entries learned · table empty at boot)';
    } else if (activeStepIndex === 1 || activeStepIndex === 2) {
      out = 'Switch SW1 MAC Address Table\n--------------------------------------------\nVLAN  Port    MAC Address        Type     Age\n1     Port 1  AA:BB:CC:00:00:01  DYNAMIC  14s\nTotal entries: 1';
    } else {
      out = 'Switch SW1 MAC Address Table\n--------------------------------------------\nVLAN  Port    MAC Address        Type     Age\n1     Port 1  AA:BB:CC:00:00:01  DYNAMIC  22s\n1     Port 2  AA:BB:CC:00:00:02  DYNAMIC  6s\nTotal entries: 2';
    }
    isSuccess = true;
  } else if (v === 'clear mac table' || v === 'clear mac') {
    out = 'Switch SW1: Dynamic MAC address table cleared.\nAll learned port mappings removed.';
    isSuccess = true;
  } else if (v === 'show switch log' || v === 'show log') {
    out = '[Port 1] Ingress frame: SA=AA:BB:CC:00:00:01 DA=AA:BB:CC:00:00:02\n[SW1]    Learned: AA:BB:CC:00:00:01 on Port 1\n[SW1]    Lookup DA AA:BB:CC:00:00:02: NOT IN TABLE\n[SW1]    Action: UNKNOWN UNICAST FLOOD -> Ports 2, 3, 4\n[Port 2] Frame delivered to PC2 (DA matched)\n[Port 3] Discarded by PC3 (DA mismatch)\n[Port 4] Discarded by PC4 (DA mismatch)';
    isSuccess = true;
  }
}
```

---

### 5. Implementation Steps in the Next Conversation

1. Create `src/content/networking/modules/net-08.ts` with the exact schema above.
2. Register `NET_08_MODULE` in `src/content/networking/index.ts`.
3. Add `net-08` world specs and canvas rendering in `src/components/learning/networking/canvas/NetworkingCanvas.tsx`.
4. Add `net-08` terminal command simulation in `src/components/learning/networking/terminal/NetworkingTerminal.tsx`.
5. Update `NetworkingHomePage.tsx` to include Day 8 and update the live day count badge.
6. Run `tests/curriculum/networking-interactive-flow.test.tsx` and `tests/curriculum/networking-step-progression.test.tsx`.
7. Verify all tests pass and launch browser subagent to verify live.
