---
description: Authoritative standards, pedagogy, canvas aesthetics, overlap prevention, and workflow rules for the SQLens Networking Track.
always_on: true
---

# SQLens Networking Track — Permanent Development Rules

Whenever designing, authoring, modifying, or testing any Networking Track module in SQLens, you MUST strictly adhere to the following standards. Full documentation is stored in `docs/networking/`:
- `docs/networking/CURRICULUM_AND_PEDAGOGY.md`
- `docs/networking/CANVAS_AND_UI_SPEC.md`
- `docs/networking/TRACK_ROADMAP_DAYS_1_TO_35.md`

---

## 1. Pedagogical Doctrine: "Zero Analogies & Physical Reality"

* **Zero Analogies Policy**:
  * **Forbidden**: Never use metaphors or analogies (no mailboxes, postmen, envelopes, postcards, apartments, water pipes, police officers).
  * **Mandatory**: Use exact technical realities: packets, frames, byte streams, IP addresses, MAC hardware addresses, routing tables, gateways, next hops, netmasks, broadcast addresses, CIDR prefixes, and RFC specifications.
* **"Taught Before Tested" (Absolute Rule)**:
  * No new acronym, protocol abbreviation, header field, or technical term is ever dropped without being explicitly motivated and defined first.
  * Every concept tested in a terminal command or quiz question must have been taught and grounded in an earlier or active concept section.
* **Human-Crafted Senior Engineer Tone**:
  * Phrasing must read like thoughtful, human-crafted curriculum written by a staff infrastructure engineer—never robotic, AI-default, or generic filler.
* **Natural Step Count**:
  * Modules take as many steps as the topic naturally demands (typically 5 to 7 steps, ending on a pure recap step with `cmd: null`). Never squeeze a complex protocol or pad a simple concept to fit an arbitrary number. UI and progress bars adapt dynamically to `steps.length`.
  * Every step implements the `NetworkingStep` interface (`num`, `group`, `title`, `concept`, `why`, `pic`, `task`, `cmd`, `read`, `rem`).
* **Task Hint Policy**: Only show `(tap it to fill the terminal).` on Days 1 and 2. On Day 3 onward, omit this hint and end the sentence with `.`.

---

## 2. Canvas & Hardware Design Standards

* **Fluid Pan/Zoom Engine**: All visual stages run inside `NetworkingCanvas.tsx` with drag-to-pan, wheel zoom (`0.4x` to `2.8x`), and floating HUD controls (`Zoom Out`, percentage badge, `Zoom In`, `Fit` via `Scan` icon).
* **Fullscreen / Canvas Expand Feature**:
  * Canvas includes an Expand / Restore button (`Maximize2` / `Minimize2`) in the top floating toolbar.
  * Keyboard shortcut `Esc` automatically restores normal viewport.
  * Toggling full canvas sets `isCanvasExpanded` in `NetworkingWorkspace.tsx`, expanding `#canvas` to `fixed inset-0 z-50 bg-[#07090e] p-2 flex flex-col`.
  * Debounced `useEffect` on `isExpanded` automatically calls `fitToView()` so every topology perfectly scales to both regular and full-screen viewports.
* **Virtual Coordinate Bounds (`DAY_WORLD_SPECS`)**:
  * Tailor virtual world bounds per module (e.g. `1100x560` to `1480x640`) so topologies breathe comfortably.
* **Hardware Component Geometry & Styling**:
  * **PC Workstations (`SvgWorkstation.tsx`)**:
    * Geometry: Laptop display lid (`76x48`), silver base chassis (`88x4` at `y + 48`), IP badge (`y + 56..74`), MAC badge (`y + 78..94`).
    * **Total bounding box**: `88px` wide, `94px` tall from device `(x, y)`. Always account for this full 94px vertical envelope to avoid overlap.
    * Metallic silver chassis line (`#d4d4d8`) is **exclusive to PC workstations** (never placed under switches or routers).
  * **Switches & Routers (`SvgSwitch.tsx`, `SvgRouter.tsx`)**:
    * Clean bottom edge (NO silver underline). NO stray power dots in corners. Bold headers (`#f1f5f9`).
    * Router port IPs must be rendered as stacked vertical pill badges (`P1: ...`, `P2: ...`) to eliminate horizontal text clipping.

---

## 3. Canvas Component Overlap Prevention Doctrine

When creating or modifying progressive canvas stages:
1. **Never place cards over devices or links**:
   * Diagnostic HUD cards, recap boxes, and status banners must NEVER share coordinates with workstations, routers, switches, or cable lines.
   * Central corridor cards (between diagonal or vertical links) must have `width <= 280px` or be placed in dedicated open quadrants.
2. **Safe Clearance Rules & Horizontal Cable Span Invariant**:
   * Maintain at least `15px-25px` margin between text labels/badges and neighboring cable lines or port markers.
   * **Horizontal Cable Span Invariant**: When placing an in-flight packet badge or error callout between two devices on a horizontal cable, verify the gap: `span = x_right_device_left - x_left_device_right`. The badge width MUST satisfy `width <= span - 30px` to guarantee at least 15px clearance on both sides. Never place a 210px or 230px badge in a 194px–214px span (which causes chassis penetration).
   * **Same-Level Alert Staggering**: When multiple alerts or callout boxes appear in the same step above adjacent devices or links, they MUST NOT share the same `y` coordinate unless `x1 + width1/2 < x2 - width2/2 - 15px`. If their horizontal spans are close or overlapping, stagger them vertically by at least 25px–35px (e.g. `y=100` and `y=140`).
   * On progressive reveals (Step 1, 2, 3, etc.), verify that newly appearing banners or packet callouts do not overlap static tables or earlier step badges.
3. **Audit Coordinate Precedents**:
   * Day 7 ARP Cache HUD: `(60, 205)` | Reply callout: `(370, 295)` (clears HUD and PC2).
   * Day 8 MAC Table HUD: `(685, 25)` | Aging card & recap: `(685, 335..345)` (clears PC2).
   * Day 9 Recap: `(643, 385)` (centered under Router R1, clears PC4).
   * Day 10 VLAN 20 Filtered Badge: `(650, 260)` (clears switch port labels).
   * Day 11 Trunk Active Badge: `width=220px` at `(600, 240)` (clears SW1/SW2 port text).
   * Day 12 Trunk Stick Badge: `(560, 155)` (clears hairpin tags at `y=230`).
   * Day 13 Central Cards: `width=270px` (clears diagonal links at `x=402.5` and `x=692.5`); BPDU link badges at `y=170`.
   * Day 14 ICMP & TTL:
     * Echo Reply badge constrained to `width=154px` at `(943, 278)` (20px clearance from R2 and ISP).
     * ICMP Type 11 badge constrained to `width=180px` at `(269, 275)` (21px clearance from PC1 and R1).
     * Bottleneck Alert staggered to `y=100` at `(943, 100)` to eliminate 40px collision with Packet Drop Warning at `(783, 140)`.
     * ICMP Type 3 Code 4 badge constrained to `width=174px` at `(613, 275)` (clears R1 at `x=506` and R2 at `x=720` by 20px, eliminating 8px chassis penetration on both sides).

---

## 4. Terminal Mechanics & Navigation

* **Terminal (`NetworkingTerminal.tsx`)**:
  * Must support both `cls` and `clear` commands to reset terminal logs.
  * Supports `Ctrl+L`, ghost Tab autocomplete, command history (`ArrowUp`/`ArrowDown`), and code chip pre-filling.
  * **Command Matching in Workspace**: Normalize whitespace with `.trim().toLowerCase().replace(/\s+/g, ' ')`. Always prioritize checking `activeStepIndex` first before fallback searching to support repeated commands across steps.
* **Navigation & Return Flow**:
  * On Idea 1 (`activeStepIndex === 0`), the `← Back` button in `NetworkingLessonSidebar` is **active and enabled**. It links directly to `/networking#day-${dayNumber}`.
  * On the final Recap step (`activeStepIndex === steps.length - 1`), the button dynamically renders `Day N+1 →` (or `Back to Roadmap ✓` on final day) to smoothly continue navigation.
  * The top header "Roadmap" and "35 Days" buttons link to `/networking#day-${module.dayNumber}`.
  * On `/networking`, targeted day circles highlight with `:target` ring and smoothly scroll into center view.

---

## 5. Track Status & Implementation Blueprint for Day 14+

### Completed & Deployed Modules (Days 1–14):
* **Stage 1 (Days 1–3)**: Physical Link, Local Star Topology, Subnetting & CIDR.
* **Stage 2 (Days 4–6)**: The Gateway Router, Multi-Router Static Routes, Default Route & Global Internet.
* **Stage 3 (Days 7–9)**: ARP & Neighbor Discovery, Switch MAC Learning & Flooding, Broadcast Domains & Boundaries.
* **Stage 4 (Days 10–13)**: Single-Switch VLANs, 802.1Q Trunks, Router-on-a-Stick, Spanning Tree Protocol (STP).
* **Stage 5 (Day 14)**: ICMP & TTL · How Ping Works (RFC 792, Protocol 1, TTL loop prevention, Type 11 Time Exceeded, Traceroute algorithm, PMTUD Type 3 Code 4).

### Next Up: Stage 5 — Transport Layer & Core Internet Protocols (Days 15–19)
* **Day 15**: **Traceroute: Following the Path · RTT, Latency & Asymmetric Routes**
  * Concept 1: The full anatomy of traceroute probe packets (UDP high-port probes vs ICMP echo probes).
  * Concept 2: Round-Trip Time (RTT) variance across router hops (measuring latency at each hop).
  * Concept 3: Why intermediate router hops show `* * *` (rate limiting and ICMP deprioritization on router control planes).
  * Concept 4: Asymmetric routing (the return path from server to client often traverses different routers than outbound).
  * Concept 5: Recap: The 4 Core Rules of Traceroute & Internet Paths.

### Checklist of Files Touched When Implementing a New Day:
1. `src/content/networking/modules/net-XX.ts` (Curriculum step content adhering to strict zero-analogy and taught-before-tested rules).
2. `src/content/networking/index.ts` (Export module and register in `NETWORKING_MODULES` array).
3. `src/components/learning/networking/canvas/NetworkingCanvas.tsx` (Add `DAY_WORLD_SPECS`, SVG hardware devices, cables, HUD cards with anti-overlap bounds).
4. `src/components/learning/networking/workspace/NetworkingWorkspace.tsx` (Add command aliases/state triggers for module commands).
5. `tests/curriculum/networking-curriculum.test.ts` (Add curriculum validation test).
6. `tests/ui/networking-canvas.test.tsx` (Add UI progressive reveal test).
7. `docs/networking/DAY_XX_DETAILED_SPEC.md` (Document detailed technical spec before/during implementation).

---

## 6. Mandatory Verification Protocol
Before marking any new day complete, you MUST:
1. Run curriculum & progression tests: `npx vitest run tests/curriculum/networking-curriculum.test.ts tests/curriculum/networking-interactive-flow.test.tsx tests/curriculum/networking-step-progression.test.tsx`.
2. Run canvas UI test suite: `npx vitest run tests/ui/networking-canvas.test.tsx`.
3. Confirm TypeScript build passes: `npx tsc --noEmit`.
4. Verify interactive command entry unlocks the Next button on every single step.
