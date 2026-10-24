---
description: Authoritative standards, pedagogy, canvas aesthetics, and workflow rules for the SQLens Networking Track.
always_on: true
---

# SQLens Networking Track — Permanent Development Rules

Whenever designing, authoring, modifying, or testing any Networking Track module in SQLens, you MUST strictly adhere to the following standards. Full documentation is stored in `docs/networking/`:
- `docs/networking/CURRICULUM_AND_PEDAGOGY.md`
- `docs/networking/CANVAS_AND_UI_SPEC.md`
- `docs/networking/TRACK_ROADMAP_DAYS_1_TO_35.md`

---

## 1. Pedagogical Doctrine: "Zero Analogies & Physical Reality"
* **Never use metaphors or analogies**: No mailboxes, postmen, envelopes, apartments, or postcards. Explain packets, frames, byte streams, IP addresses, MAC addresses, routing tables, and CIDR masks as the concrete digital realities they are.
* **Natural Step Count**: Modules take as many steps as the topic naturally demands (e.g. 4 to 8+ steps). Never squeeze a complex protocol or pad a simple concept to fit an arbitrary number. UI and progress bars adapt dynamically to `steps.length`. Every step implements the `NetworkingStep` interface (`num`, `group`, `title`, `concept`, `why`, `pic`, `task`, `cmd`, `read`, `rem`).
* **Task Hint Policy**: Only show `(tap it to fill the terminal).` on Days 1 and 2. On Day 3+, omit this hint and end the sentence with `.`.
* **Pacing Gaps**:
  * Binary and Hexadecimal: MAC addresses use hex, CIDR/subnets use binary bits.
  * Broadcast Address (`.255`): Introduced in Day 2, relied upon by Days 7 and 9. Keep definition exact.
  * Ping: Probe in Day 1; formally deconstructed in Day 14 (ICMP Type 8/0).

---

## 2. Canvas & Hardware Design Standards
* **Fluid Pan/Zoom Engine**: All visual stages use `PanZoomCanvasEngine` with drag-to-pan, wheel zoom (`0.55x` to `1.85x`), and floating HUD controls (`-`, `Fit`, `+`, `%`).
* **Virtual Coordinate Bounds**:
  * Day 1: `840x380`
  * Day 2: `960x460`
  * Day 3: `1020x480`
  * Day 4: `1180x520`
  * Day 5: `1380x580`
  * Day 6: `1480x640`
  * Days 7+: Expand horizontal width by `+160px` per hop to guarantee cables and device labels never collide or overlap.
* **Hardware Styling**:
  * **PC Workstations (`SvgWorkstation.tsx`)**: Laptop design with dark glowing screen and a thin metallic silver base chassis line (`#d4d4d8`).
  * **Switch & Router (`SvgSwitch.tsx`, `SvgRouter.tsx`)**: Clean bottom edge (NO silver underline). NO stray power dots in corners. Bold headers (`#f1f5f9`).
  * **Router Port IPs**: Rendered as stacked vertical pill badges (`P1: ...`, `P2: ...`) to eliminate horizontal text overlap inside router chassis.

---

## 3. Terminal Mechanics & Navigation
* **Terminal (`NetworkingTerminal.tsx`)**:
  * Must support both `cls` and `clear` commands to reset terminal logs.
  * Supports `Ctrl+L`, ghost Tab autocomplete, command history (`ArrowUp`/`ArrowDown`), and code chip pre-filling.
* **Navigation & Return Flow**:
  * On Idea 1 (`activeStepIndex === 0`), the `← Back` button in `NetworkingLessonSidebar` is **active and enabled**. It links directly to `/networking#day-${dayNumber}`.
  * The top header "Roadmap" and "35 Days" buttons link to `/networking#day-${module.dayNumber}`.
  * On `/networking`, targeted day circles highlight with `:target` ring and smoothly scroll into center view.
