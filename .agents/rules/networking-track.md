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
2. **Safe Clearance Rules**:
   * Maintain at least `15px-25px` margin between text labels/badges and neighboring cable lines or port markers.
   * On progressive reveals (Step 1, 2, 3, etc.), verify that newly appearing banners or packet callouts do not overlap static tables or earlier step badges.
3. **Audit Coordinate Precedents**:
   * Day 7 ARP Cache HUD: `(60, 205)` | Reply callout: `(370, 295)` (clears HUD and PC2).
   * Day 8 MAC Table HUD: `(685, 25)` | Aging card & recap: `(685, 335..345)` (clears PC2).
   * Day 9 Recap: `(643, 385)` (centered under Router R1, clears PC4).
   * Day 10 VLAN 20 Filtered Badge: `(650, 260)` (clears switch port labels).
   * Day 11 Trunk Active Badge: `width=220px` at `(600, 240)` (clears SW1/SW2 port text).
   * Day 12 Trunk Stick Badge: `(560, 155)` (clears hairpin tags at `y=230`).
   * Day 13 Central Cards: `width=270px` (clears diagonal links at `x=402.5` and `x=692.5`); BPDU link badges at `y=170`.

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

### Completed & Deployed Modules (Days 1–13):
* **Stage 1 (Days 1–3)**: Physical Link, Local Star Topology, Subnetting & CIDR.
* **Stage 2 (Days 4–6)**: The Gateway Router, Multi-Router Static Routes, Default Route & Global Internet.
* **Stage 3 (Days 7–9)**: ARP & Neighbor Discovery, Switch MAC Learning & Flooding, Broadcast Domains & Boundaries.
* **Stage 4 (Days 10–13)**: Single-Switch VLANs, 802.1Q Trunks, Router-on-a-Stick, Spanning Tree Protocol (STP).

### Next Up: Stage 5 — Transport Layer & Core Internet Protocols (Days 14–21)
* **Day 14**: **ICMP & TTL · How Ping & Traceroute Function at Layer 3**
  * Concept 1: ICMP as the diagnostic companion protocol to IP (RFC 792; protocol 1 inside IPv4).
  * Concept 2: ICMP Type 8 (Echo Request) & Type 0 (Echo Reply) Anatomy.
  * Concept 3: The IPv4 TTL (Time-To-Live) field — decrement-by-1 at each router hop to prevent permanent packet circulation.
  * Concept 4: ICMP Type 11 (Time Exceeded in Transit) generated by routers when TTL reaches 0.
  * Concept 5: How Traceroute works: sending probes with incremental TTL values (`TTL=1, 2, 3...`) to discover every router IP on a path.
  * Concept 6: Path MTU Discovery (PMTUD) & ICMP Type 3 Code 4 (Fragmentation Needed but DF set).
  * Concept 7: Recap: The 4 Core Rules of ICMP & TTL.

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
