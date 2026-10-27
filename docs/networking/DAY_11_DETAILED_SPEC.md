# SQLens Networking Track — Day 11 Implementation Specification
## Day 11 · Trunks: Carrying VLANs Between Switches (`net-11`)

> **Authoritative Specification & Implementation Blueprint**  
> **Status**: [PLANNING & SPECIFICATION]  
> **Pedagogical Doctrine**: Zero Metaphors, Strictly Gated Vocabulary (No Term Used Before Introduction), Gradual Canvas Reveal, Cognitive Pacing (5 Ideas + 1 Recap).  
> **Stylistic Requirement**: 100% human-crafted phrasing, authentic engineer tone, clean authentic CLI commands.

---

### 1. Pedagogical Doctrine: Vocabulary Gating Audit

In the SQLens Networking Track, **no technical word, acronym, or concept is ever used before it is explicitly introduced and motivated**.

#### Vocabulary Gating Sequence for Day 11:
| Step | What the Learner Knows Before This Step | New Term Explicitly Introduced Here | Why It Is Introduced Here |
| :--- | :--- | :--- | :--- |
| **Idea 1** | VLANs, Access Ports, Port 1–4, Physical Cables (Day 10) | **Trunk Port / Trunk Link** | First motivates the scaling problem of connecting two switches: using a separate physical cable for each VLAN wastes cables and switch ports. Introduces a "trunk port" as a single port that carries traffic for multiple VLANs. |
| **Idea 2** | Trunk link, Ethernet frames (Day 8), VLAN ID (Day 10) | **VLAN Tagging** & **IEEE 802.1Q (Dot1q)** | Motivates the dilemma of a shared wire: how does the receiving switch know which VLAN an arriving frame belongs to? Standard frames have no VLAN ID. Introduces the industry standard 4-byte 802.1Q tag inserted into the frame header. |
| **Idea 3** | 802.1Q tag, Access ports vs Trunk ports | **Tag Insertion (Tagging)** & **Tag Stripping (Untagging)** | Explains the lifecycle of a frame: an access port receives an untagged frame from a PC; the switch inserts the 802.1Q tag upon sending it over the trunk; the receiving switch reads the tag, strips it off, and delivers an untagged frame to the destination PC. Computers never see 802.1Q tags. |
| **Idea 4** | 802.1Q tags, Trunk ports | **Native VLAN** | Addresses backwards compatibility: what happens if an untagged frame travels across a trunk link? Introduces the Native VLAN (defaulting to VLAN 1), which transmits without an 802.1Q tag across the trunk. |
| **Idea 5** | Multi-switch VLANs, ping (Day 1) | **Cross-Switch VLAN Communication** | Uses `ping 192.168.10.30` from PC1 (SW1, VLAN 10) to PC3 (SW2, VLAN 10) across the trunk link. Proves logical VLANs seamlessly bridge physical buildings while VLAN 20 traffic remains completely isolated. |
| **Recap** | All concepts above | **The 4 Rules of VLAN Trunks** | Synthesizes trunk rules and previews Day 12 (Inter-VLAN Routing with Router-on-a-Stick). |

---

### 2. Module Definition (`src/content/networking/modules/net-11.ts`)

```typescript
import { NetworkingModule } from '@/types/networking';

export const NET_11_MODULE: NetworkingModule = {
  id: 'net-11',
  dayNumber: 11,
  title: 'Day 11 · Trunks: Carrying VLANs Between Switches',
  shortTitle: 'Trunks: Carrying VLANs Between Switches',
  steps: [
    {
      group: 'Idea 1 of 5 · The multi-switch scaling problem',
      chg: 'Since Day 10: In Day 10, all devices were on a single switch. Today, our company expands to a second floor with a second switch, SW2.',
      title: 'Connecting VLANs across multiple switches',
      what:
        'In Day 10, you divided Switch SW1 into two isolated VLANs: VLAN 10 for Engineering and VLAN 20 for Finance.\n\nNow imagine our company expands to a second building with a second switch, Switch SW2. The second building also has Engineering workstations and Finance workstations.\n\nHow do we connect VLAN 10 on Switch SW1 to VLAN 10 on Switch SW2, and VLAN 20 on SW1 to VLAN 20 on SW2?\n\nThe naive solution is to run a separate physical cable for every VLAN: one cable between Port 4 on SW1 and Port 4 on SW2 for VLAN 10, and a second cable between Port 5 on SW1 and Port 5 on SW2 for VLAN 20. But if an enterprise has 50 VLANs, this approach requires 50 physical cables and burns 50 switch ports just to interconnect two switches.\n\nTo solve this, switches support trunk ports. A trunk port is a physical switch port configured to carry traffic for multiple VLANs across a single cable link.',
      why: 'Trunk links eliminate the need to run dedicated physical cables between switches for every individual VLAN.',
      pic: 'Two switches appear on the canvas: Switch SW1 on the left and Switch SW2 on the right, joined by a single cable on Port 5. Both switches have workstations in VLAN 10 and VLAN 20.',
      task: 'Inspect Switch SW1 to check its current trunk configuration.',
      cmd: 'show trunk',
      read: [
        ['Trunk Ports', 'None configured (Port 5 currently in default access mode)'],
        ['Limitation', 'Cannot carry multiple VLANs across single link without trunking'],
        ['Goal', 'Configure Port 5 as a trunk link carrying VLAN 10 and VLAN 20'],
      ],
      rem: 'An access port belongs to only one VLAN; a trunk port carries traffic for multiple VLANs simultaneously.',
    },
    {
      group: 'Idea 2 of 5 · The trunk dilemma',
      title: 'The need for identity: IEEE 802.1Q VLAN tagging',
      what:
        'If multiple VLANs share the same physical cable between switches, a fundamental problem arises.\n\nRecall from Day 8 that a standard Ethernet frame contains only Destination MAC, Source MAC, EtherType, Payload, and CRC. It has no field specifying which VLAN the frame belongs to!\n\nWhen PC1 (in VLAN 10) sends a frame across a shared cable to Switch SW2, how does Switch SW2 know whether the frame belongs to Engineering (VLAN 10) or Finance (VLAN 20)? Without an explicit label, SW2 would not know which ports may receive the frame.\n\nTo solve this, switches use the IEEE 802.1Q standard, commonly called Dot1q. When an Ethernet frame leaves a switch through a trunk port, the switch inserts a 4-byte 802.1Q tag into the frame header. The most important field inside this tag is the 12-bit VLAN ID (VID), which explicitly states which VLAN owns the frame.',
      why: 'VLAN tags prevent frames from different virtual networks from becoming mixed together when traversing a shared wire.',
      pic: 'Port 5 on both switches turns into a high-visibility striped trunk port. A diagram above the link highlights the 4-byte 802.1Q tag inserted into the Ethernet header.',
      task: 'Configure Port 5 as an 802.1Q trunk port on Switch SW1 and Switch SW2.',
      cmd: 'set port 5 trunk',
      read: [
        ['Port 5 Mode', 'TRUNK (802.1Q Encapsulation enabled)'],
        ['Allowed VLANs', '10 (Engineering), 20 (Finance), 1 (Default)'],
        ['Tagging Action', 'Inserts 4-byte 802.1Q header with VLAN ID on egress'],
      ],
      rem: 'IEEE 802.1Q inserts a 4-byte tag containing the VLAN ID into every Ethernet frame crossing a trunk link.',
    },
    {
      group: 'Idea 3 of 5 · Frame lifecycle',
      title: 'Tagging and untagging: computers never see tags',
      what:
        'End devices—like PCs, laptops, and printers—do not understand 802.1Q tags. If a normal computer received a tagged frame, its network card would report a checksum or header error and drop the packet.\n\nThe switches handle all tagging transparently:\n1. Ingress at Access Port: PC1 transmits a standard, untagged Ethernet frame into SW1 Port 1. SW1 knows Port 1 is an access port assigned to VLAN 10.\n2. Egress at Trunk Port: SW1 forwards the frame across the trunk cable on Port 5. Before transmitting onto the wire, SW1 inserts the 4-byte 802.1Q tag with VID=10.\n3. Ingress at Trunk Port: SW2 receives the frame on its Port 5 trunk, reads VID=10, and determines the frame belongs to VLAN 10.\n4. Egress at Access Port: SW2 strips the 802.1Q tag off completely and forwards the original untagged frame out of Port 1 to PC3.\n\nPC3 receives a completely standard, untagged frame. End devices never know a trunk was involved.',
      why: 'Transparent tagging allows standard network equipment to communicate across complex enterprise VLAN architectures without special drivers.',
      pic: 'A frame travels from PC1: untagged entering SW1 -> tagged with [VID=10] over the trunk link -> stripped by SW2 -> delivered untagged to PC3.',
      task: 'Inspect the frame headers traversing the trunk wire to observe the 802.1Q tag.',
      cmd: 'show frame header',
      read: [
        ['Destination MAC', 'AA:BB:CC:10:00:03 (PC3 on Switch SW2)'],
        ['Source MAC', 'AA:BB:CC:10:00:01 (PC1 on Switch SW1)'],
        ['802.1Q Tag', 'TPID: 0x8100 · Priority: 0 · VLAN ID: 10'],
        ['Payload', 'ICMP Echo Request (Ping)'],
        ['Access Action', 'Tag will be stripped before egress to PC3'],
      ],
      rem: 'Switches tag frames when sending them across a trunk, and strip the tags before delivering them to access ports.',
    },
    {
      group: 'Idea 4 of 5 · The untagged exception',
      title: 'The Native VLAN: compatibility on the trunk',
      what:
        'What happens if an older device that does not understand 802.1Q tags is plugged into a trunk link, or an untagged frame arrives on a trunk port?\n\nTo maintain backwards compatibility, the 802.1Q standard defines a Native VLAN for every trunk link. By default, the Native VLAN is VLAN 1.\n\nWhen a switch sends traffic belonging to the Native VLAN across a trunk link, it does not insert an 802.1Q tag; the frame travels across the trunk untagged.\n\nConversely, when a switch receives an untagged frame on a trunk port, it automatically assigns that frame to its configured Native VLAN.\n\nBoth switches on a trunk link must agree on the exact same Native VLAN. If SW1 uses VLAN 1 as Native and SW2 uses VLAN 2, traffic from VLAN 1 on SW1 will leak directly into VLAN 2 on SW2, causing a severe security vulnerability known as a Native VLAN mismatch.',
      why: 'The Native VLAN ensures management and control protocols can traverse switch links even without 802.1Q encapsulation.',
      pic: 'Trunk configuration table highlights Native VLAN: 1 (Untagged). A warning indicator explains that Native VLANs must match on both ends.',
      task: 'Inspect the Native VLAN setting on Switch SW1 and SW2.',
      cmd: 'show trunk native',
      read: [
        ['Trunk Port', 'Port 5 (Connected to SW2 Port 5)'],
        ['Native VLAN', 'VLAN 1 (Untagged transit)'],
        ['Tagged VLANs', 'VLAN 10 (Engineering), VLAN 20 (Finance)'],
        ['Status', 'Matched on both ends (No VLAN leaking)'],
      ],
      rem: 'Frames belonging to the Native VLAN cross the trunk without an 802.1Q tag; both switches must agree on the same Native VLAN.',
    },
    {
      group: 'Idea 5 of 5 · End-to-end verification',
      title: 'Testing cross-switch communication',
      what:
        'Let’s test our segmented multi-switch network by having PC1 (192.168.10.10, VLAN 10 on SW1) ping PC3 (192.168.10.30, VLAN 10 on SW2).\n\n1. PC1 checks its mask and sees 192.168.10.30 is on its local subnet (192.168.10.0/24).\n2. PC1 transmits an untagged frame into SW1 Port 1.\n3. SW1 identifies the ingress port as VLAN 10, encapsulates the frame with an 802.1Q tag (VID=10), and forwards it across the trunk link on Port 5.\n4. SW2 receives the frame on trunk Port 5, reads VID=10, strips the tag, and forwards the untagged frame out of Port 1 to PC3.\n5. PC3 receives the ping and replies back through the exact same trunk path.\n\nNow, test what happens if PC1 tries to reach PC4 (192.168.20.40, VLAN 20 on SW2): the ping fails completely. Even though both VLANs share the trunk cable, their traffic remains strictly isolated at Layer 2.',
      why: 'VLAN trunks allow logical broadcast domains to span an entire campus without sacrificing security or broadcast isolation.',
      pic: 'An indigo ping pulse leaves PC1, gains an 802.1Q badge across the trunk, drops the badge at SW2, and arrives at PC3. Wires to PC2 and PC4 remain completely silent.',
      task: 'Ping PC3 at 192.168.10.30 from PC1 across the trunk link.',
      cmd: 'ping 192.168.10.30',
      read: [
        ['Source', 'PC1 (192.168.10.10 · VLAN 10 on SW1)'],
        ['Destination', 'PC3 (192.168.10.30 · VLAN 10 on SW2)'],
        ['Trunk Transit', 'Port 5 tagged with 802.1Q (VID=10)'],
        ['Ping Result', 'Reply from 192.168.10.30: 0% loss (VLAN 10 bridged successfully)'],
        ['VLAN 20 Isolation', 'PC2 & PC4 remained completely untouched'],
      ],
      rem: 'Trunk links allow members of the same VLAN to communicate across multiple switches while maintaining total isolation from other VLANs.',
    },
    {
      group: 'Recap',
      title: 'The four rules of VLAN trunks',
      what:
        'Trunk links allow multiple VLANs to share a single physical connection between network switches. By tagging frames with IEEE 802.1Q headers, switches maintain strict Layer 2 isolation across distributed campuses without wasting ports.',
      why: 'Understanding 802.1Q trunks is the foundation for Day 12, where we connect a single trunk link to a router to route traffic between isolated VLANs.',
      pic: 'Complete dual-switch campus topology showing VLAN 10 (Indigo) and VLAN 20 (Emerald) multiplexed across the central 802.1Q trunk link.',
      task: 'Review the four fundamental rules of VLAN trunking.',
      cmd: null,
      read: [
        ['1. Trunk Port', 'A switch port configured to carry traffic for multiple VLANs over one link'],
        ['2. IEEE 802.1Q', 'A 4-byte header containing the 12-bit VLAN ID inserted into frames on the trunk'],
        ['3. Transparent to Hosts', 'Access ports add tags on egress to trunks, and strip tags before delivery to PCs'],
        ['4. Native VLAN', 'The one VLAN that traverses the trunk untagged; must match on both switches'],
      ],
      rem: 'Trunks carry multiple VLANs over a single wire using 802.1Q tags; access ports keep tags invisible to end devices.',
    },
  ],
  staticResponses: {
    'show trunk':
      'Switch SW1 Trunk Interface Status\n----------------------------------------------------\nPort   Mode      Encapsulation   Status        Native VLAN\nPort 5 auto      802.1q          not-trunking  1\n----------------------------------------------------\nResult: Port 5 is operating in standard Access Mode (single VLAN only).',
    'set port 5 trunk':
      'Switch SW1(config)# interface port 5\nSwitch SW1(config-if)# switchport mode trunk\nSwitch SW1(config-if)# switchport trunk allowed vlan 1,10,20\n\nSwitch SW2(config)# interface port 5\nSwitch SW2(config-if)# switchport mode trunk\nSwitch SW2(config-if)# switchport trunk allowed vlan 1,10,20\n\nTrunk link established on Port 5 between SW1 and SW2.\nEncapsulation: IEEE 802.1Q (Dot1q) · Allowed VLANs: 1, 10, 20.',
    'show frame header':
      'Captured Frame on Trunk Port 5 Link (SW1 -> SW2):\n----------------------------------------------------\n[Ethernet Header]\n  Destination MAC:  AA:BB:CC:10:00:03 (PC3)\n  Source MAC:       AA:BB:CC:10:00:01 (PC1)\n[IEEE 802.1Q Tag]\n  TPID (Tag Protocol Identifier): 0x8100\n  Priority (PCP):                 0 (Best Effort)\n  VLAN ID (VID):                  10 (Engineering)\n[Payload]\n  EtherType:        0x0800 (IPv4)\n  Source IP:        192.168.10.10\n  Destination IP:   192.168.10.30\n  Protocol:         ICMP Echo Request\n----------------------------------------------------\nAction at SW2: Tag 0x8100 stripped before egress on Port 1.',
    'show trunk native':
      'Switch SW1 & SW2 Trunk Native VLAN Status\n----------------------------------------------------\nPort     Trunk Mode   Native VLAN   Status    VLAN Leaking\nSW1:P5   802.1Q       VLAN 1        MATCHED   Protected (None)\nSW2:P5   802.1Q       VLAN 1        MATCHED   Protected (None)\n----------------------------------------------------\nNative VLAN frames traverse Port 5 untagged with 0 byte overhead.',
    'ping 192.168.10.30':
      'Sending 4 64-byte ICMP Echos to 192.168.10.30 across 802.1Q trunk:\nReply from 192.168.10.30: bytes=64 time=1.2ms TTL=64 (PC3 via SW2:P1)\nReply from 192.168.10.30: bytes=64 time=0.9ms TTL=64 (PC3 via SW2:P1)\nReply from 192.168.10.30: bytes=64 time=0.8ms TTL=64 (PC3 via SW2:P1)\nReply from 192.168.10.30: bytes=64 time=0.9ms TTL=64 (PC3 via SW2:P1)\n\n--- 192.168.10.30 ping statistics ---\n4 packets transmitted, 4 received, 0% packet loss\n(VLAN 10 frames successfully tagged, transported across Port 5 trunk, and untagged at SW2)',
    help:
      'Commands: show trunk, set port 5 trunk, show frame header, show trunk native, ping 192.168.10.30, cls, clear, help',
  },
};
```

---

### 3. Canvas Topology & Visual Design (`DAY_WORLD_SPECS['net-11']`)

- **Virtual Coordinate Bounds**: `1200px` width × `540px` height.
- **Components & Placement**:
  - **Left Switch SW1 (Floor 1 / Building A)**:
    - SvgSwitch at `x=320, y=260` (width 120, height 48, cx=380, cy=284).
    - Port 1 (PC1, VLAN 10): Left face top.
    - Port 2 (PC2, VLAN 20): Left face bottom.
    - Port 5 (Trunk): Right face center (`x=440, y=284`).
    - PC1 (Workstation): `x=80, y=140`, IP: `192.168.10.10`, MAC: `AA:BB:CC:10:00:01`, Blue badge.
    - PC2 (Workstation): `x=80, y=360`, IP: `192.168.20.20`, MAC: `AA:BB:CC:20:00:02`, Green badge.
  - **Right Switch SW2 (Floor 2 / Building B)**:
    - SvgSwitch at `x=760, y=260` (width 120, height 48, cx=820, cy=284).
    - Port 1 (PC3, VLAN 10): Right face top.
    - Port 2 (PC4, VLAN 20): Right face bottom.
    - Port 5 (Trunk): Left face center (`x=760, y=284`).
    - PC3 (Workstation): `x=1020, y=140`, IP: `192.168.10.30`, MAC: `AA:BB:CC:10:00:03`, Blue badge.
    - PC4 (Workstation): `x=1020, y=360`, IP: `192.168.20.40`, MAC: `AA:BB:CC:20:00:04`, Green badge.
  - **Central Trunk Cable & Frame Inspector**:
    - Trunk Cable: from SW1:P5 (`x=440, y=284`) to SW2:P5 (`x=760, y=284`).
    - In steps 0: Gray standard link (`#64748b`).
    - In steps 1+: Vivid cyan/indigo multi-VLAN trunk cable with glowing transmission markers.
    - **Floating 802.1Q Frame Dissection HUD Card** above trunk:
      - `x=450, y=35, width=300, height=185`.
      - Shows Ethernet Frame structure with highlighted `[802.1Q Tag: VID=10]` block.
      - Displays Tagging on egress from SW1 and Untagging on ingress into SW2.

---

### 4. Step-by-Step Gradual Reveal Progression

| Step | Canvas State | Cables & Badges | HUD Card & Callouts |
| :--- | :--- | :--- | :--- |
| **Idea 1** (`step 0`) | Two switches, each with local VLAN 10 and 20. Port 5 is a standard gray wire. | Standard gray wire on Port 5. Badge: `Port 5: Access Mode (Untrunked)`. | HUD: `Switch SW1 Port 5 · Trunk Inactive`. Callout explains the dilemma of needing multiple cables. |
| **Idea 2** (`step 1`) | `set port 5 trunk` run. | Port 5 lights up cyan (`#38bdf8`) on both switches. Trunk cable turns into vibrant dual-band link: `802.1Q TRUNK (VLAN 10 + 20)`. | HUD updates: `Port 5: Trunk Active · IEEE 802.1Q Enabled`. |
| **Idea 3** (`step 2`) | `show frame header` run. | Live dissection view of 802.1Q tag appears above the trunk line: `[ Dest MAC ][ Src MAC ][ 802.1Q Tag: VID=10 ][ EtherType ][ Payload ]`. | Tag lifecycle animation: Tag inserted by SW1 $\rightarrow$ Tag stripped by SW2 before reaching PC3. |
| **Idea 4** (`step 3`) | `show trunk native` run. | Native VLAN 1 status box glows green at the bottom of the trunk: `Native VLAN: 1 (Untagged Transit) · Matched`. | Status: `Protected: No Native VLAN Leaking`. |
| **Idea 5** (`step 4`) | `ping 192.168.10.30` run. | Indigo broadcast/unicast pulse leaves PC1, gains an `802.1Q VID=10` tag over Port 5, gets untagged at SW2, and delivers to PC3. PC3 replies back. | PC2 and PC4 show lock badges: `VLAN 20 Isolated (0 Frames)`. |
| **Recap** (`step 5`) | Complete campus overview with balanced two-building topology. | High-contrast dual-switch visualization with active 802.1Q trunk. | Summary Card: `THE 4 RULES OF VLAN TRUNKS` + Preview: `Day 12 · Router-on-a-Stick`. |

---

### 5. Implementation Task Breakdown

1. **Module Data (`src/content/networking/modules/net-11.ts`)**:
   - Write the module with 5 ideas + 1 recap adhering to the audited vocabulary gating sequence.
   - Author authentic static responses for `show trunk`, `set port 5 trunk`, `show frame header`, `show trunk native`, and `ping 192.168.10.30`.
2. **Curriculum Index Registration (`src/content/networking/index.ts`)**:
   - Register `NET_11_MODULE` in `NETWORKING_MODULES`, `getAllNetworkingModules`, and exports.
3. **Terminal Support (`NetworkingTerminal.tsx`)**:
   - Add `net-11` help string and dynamic command responses for `show trunk`, `set port 5 trunk`, `show frame header`, and `show trunk native`.
4. **Workspace Aliases (`NetworkingWorkspace.tsx`)**:
   - Add command alias matchers for Day 11 commands.
5. **Interactive SVG Canvas (`NetworkingCanvas.tsx`)**:
   - Add `'net-11'` in `DAY_WORLD_SPECS` (`1200 x 540`).
   - Define `isDay11 = dayId === 'net-11'`.
   - Render dual-switch campus topology (SW1 and SW2), 4 PCs, high-visibility 802.1Q trunk link, floating frame inspector HUD, and gradual reveal transitions.
6. **Tests**:
   - Curriculum test in `tests/curriculum/networking-curriculum.test.ts`.
   - Canvas UI test in `tests/ui/networking-canvas.test.tsx`.
   - Verify with `node ./node_modules/vitest/vitest.mjs run` and `npx tsc --noEmit`.
