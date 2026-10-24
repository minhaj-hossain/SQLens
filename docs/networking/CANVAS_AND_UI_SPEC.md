# SQLens Networking Track — Canvas Engine & UI Architecture

This document documents the exact UI, canvas, hardware styling, and navigation architecture for the **SQLens Networking Track**. Every future module must preserve these visual and architectural standards.

---

## 1. Canvas Fluid Pan & Zoom Engine

All networking topologies run inside the fluid `PanZoomCanvasEngine` (`src/components/learning/networking/canvas/PanZoomCanvasEngine.tsx`).

### Virtual World Coordinates
The canvas container in the workspace is fixed at `100%` width and height, but components are laid out in a generous **virtual coordinate space** to avoid element overlapping:

| Module / Topology | Virtual Width | Virtual Height | Components & Topology |
| :--- | :--- | :--- | :--- |
| **Day 1** (Direct Cable) | `840px` | `380px` | PC1, Cable, PC2 |
| **Day 2** (Local Switch & ARP) | `960px` | `460px` | PC1, PC2, PC3, PC4 around Central Switch |
| **Day 3** (Subnetting / CIDR) | `1020px` | `480px` | Subnet 1 (PC1, PC2) & Subnet 2 (PC3, PC4) |
| **Day 4** (Router R1 & Gateway) | `1180px` | `520px` | Subnet 1 (PC1, PC2) ↔ Router R1 (Port 1 & 2) ↔ Subnet 2 (PC3, PC4) |
| **Day 5** (Static Routes / Dual Routers) | `1380px` | `580px` | Subnet 1 ↔ Router R1 ↔ Transit Link ↔ Router R2 ↔ Subnet 3 |
| **Day 6** (Default Route & ISP) | `1480px` | `640px` | Subnet 1 ↔ Router R1 ↔ Transit ↔ Router R2 ↔ ISP Router ↔ Distant Web Server |
| **Days 7+ Scaling Formula** | `+160px` width per router/hop | `580px - 720px` | Scale virtual coordinate space so cables and device labels never collide |

### Pan / Zoom Mechanics
- **Drag to Pan**: Drag anywhere on the canvas background to pan in any direction (clamped within boundary margins).
- **Wheel to Zoom**: Scrolling with the mouse over the canvas zooms in and out (`minScale: 0.55`, `maxScale: 1.85`).
- **HUD Control Pill**: Floating HUD at the bottom center offers:
  - `-` (Zoom out)
  - `Fit` (Resets zoom and centers the topology in the viewport)
  - `+` (Zoom in)
  - Current zoom percentage badge (e.g. `100%`)

---

## 2. Hardware Component Design System

All SVG hardware devices must strictly adhere to the following aesthetics:

### 1. PC Workstation (`SvgWorkstation.tsx`)
- **Laptop Aesthetic**: Dark screen bezel (`#090d16` / `#0b101b`) with a glowing network display, activity LEDs, and an IP/MAC badge.
- **Silver Base Line**: A thin metallic silver chassis line (`#d4d4d8`, 1.5px thick, subtle rounded base) along the bottom of the computer.
- **Rule**: This silver base line is **exclusive to PC workstations** (never placed under Switches or Routers).

### 2. Network Switch (`SvgSwitch.tsx`)
- **Chassis**: Industrial dark enterprise chassis (`#090d15` fill, `#1e293b` border, `rounded-md`).
- **Clean Bottom**: No base line underneath.
- **Ports & LEDs**: Clear RJ-45 port sockets with green link LEDs. No stray power dots on upper corners.
- **Typography**: Header label is **bold** (`font-bold font-mono text-[10.5px] fill-[#f1f5f9]`).

### 3. Router (`SvgRouter.tsx`)
- **Chassis**: Dark metallic router chassis with Layer 3 routing accent badge (`LAYER 3 GATEWAY` or `ROUTER R1 / R2 / ISP`).
- **Clean Bottom**: No silver base line.
- **Port IPs — Anti-Overlap Standard**:
  - Router port IP addresses are rendered as **stacked vertical pill badges**:
    ```text
    ┌──────────────────────────┐
    │ P1: 192.168.1.1          │
    ├──────────────────────────┤
    │ P2: 10.0.0.1             │
    └──────────────────────────┘
    ```
  - Port IP text is never rendered horizontally side-by-side inside small router chassis to prevent label clipping and overlaps.

---

## 3. Terminal Architecture (`NetworkingTerminal.tsx`)

1. **Commands Supported**:
   - `cls` and `clear`: Clears the terminal output log (`setLogs([])`).
   - `help`: Lists valid commands for the active day.
   - Real-time commands: `ping <address>`, `ipconfig`, `show router`, `show routes`, `arp -a`, `r1 route add ...`, etc.
   - Dynamic simulation: Updates canvas state (e.g. ping pulse animation, dynamic gateway settings, route table additions).

2. **Keyboard Ergonomics**:
   - `[Ctrl+L]` or `[Cmd+L]`: Clears the screen.
   - `[Tab]`: Autocompletes expected command with ghost overlay.
   - `[ArrowUp]` / `[ArrowDown]`: Command history navigation.
   - `[Enter]`: Submits command.
   - Clicking code chips in lesson task pre-fills the terminal input.

---

## 4. Navigation & Flow Architecture

1. **Roadmap to Lesson**:
   - Clicking a day circle or module card on `/networking` routes to `/networking/learn/net-0X`.
2. **Back to Roadmap**:
   - In `NetworkingLessonSidebar`: On Idea 1 (`activeStepIndex === 0`), the `← Back` button is **active and enabled**.
   - Clicking it navigates to `/networking#day-${dayNumber}`.
   - The top header "Roadmap" and "35 Days" links also point to `/networking#day-${module.dayNumber}`.
3. **Smooth Scroll & Focus on Roadmap**:
   - When the user lands on `/networking#day-X`, `NetworkingHomePage` smoothly scrolls the page and centers the day circle.
   - The targeted day circle matches CSS `:target` styling: `target:ring-4 target:ring-[#4ade80]/60 target:scale-110 target:border-[#4ade80]`, providing immediate visual feedback of where the user is.
