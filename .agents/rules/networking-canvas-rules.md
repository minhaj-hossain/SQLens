# Networking Module Hardware & Stage Canvas Rules

This rule is mandatory across all conversations in this repository when designing or building networking modules (Day 1, Day 2, Day 3, Day 4, and beyond).

---

## 1. Absolute Ban on Generic HTML Div Device Cards

- **NEVER** build the visual stage canvas out of HTML flexbox `<div>` cards or floating container elements for computers, switches, routers, or servers.
- The visual canvas MUST ALWAYS be implemented as a **handcrafted vector SVG workbench scene** inside a single responsive SVG element (`viewBox="0 0 1000 680"` or `viewBox="0 0 1000 720"`).

---

## 2. Mandatory SVG Workbench Anatomy

Every networking stage canvas MUST follow the physical workbench layout established in `PhysicalConnectionCanvas.tsx` (Day 1), `PhysicalSwitchCanvas.tsx` (Day 2), and `PhysicalRouterCanvas.tsx` (Day 3):

### A. Desk Ground & Horizon
- Desk surface: `<rect x="0" y="500" width="1000" height="180" fill="url(#deskGrad)" />`
- Horizon line: `<line x1="0" y1="500" x2="1000" y2="500" stroke="#1E293B" strokeWidth="2" />`
- Gradient definition:
  ```xml
  <linearGradient id="deskGrad" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stopColor="#141D2D" />
    <stop offset="100%" stopColor="#0B101B" />
  </linearGradient>
  ```

### B. Computer Workstations (Monitors)
- **Stand**: Base path (`<path d="..." fill="#1E293B" />`) and desk foot (`<rect fill="#334155" rx="3" />`).
- **Bezel**: Dark monitor frame (`fill="#0F172A" stroke="#334155" strokeWidth="2" rx="10"`).
- **Screen Glass**: High-contrast CRT/display glass (`fill="#020617" rx="5"`).
- **Screen Display**: Monospace terminal prompt (`>_`) with mini live diagnostics (IP, Gateway, Subnet mask).
- **Physical RJ-45 Socket**: Cutout `<rect fill="#0F172A" stroke="#64748B" strokeWidth="1" rx="2" />` sitting on the monitor bezel.
- **Link LED**: Glowing circle (`r="4.5"`) with `filter="url(#softGlow)"` (Green `#22C55E` when link is up, dark `#334155` when unplugged).
- **Link Status Text**: Crisp label beneath the stand (`Link light: ON` or `OFF`).

### C. Central Rackmount Chassis (Switch, Router, Server)
- **Body**: Sleek rack appliance (`fill="url(#routerGrad)"` or `fill="url(#switchGrad)"` with `stroke="#334155"` and `rx="8"` to `rx="10"`).
- **Rack Ears**: Metal mounting ears with screw hole circles on both left and right edges.
- **Faceplate**: Ventilation cooling slats, appliance header text, and processing core indicator (`ROUTE CORE` / `SWITCH CORE`).
- **Physical Ports**: Cutout RJ-45 ports with individual port numbers (e.g. `eth0 [Port 1]`, `eth1 [Port 2]`), link LEDs, and gateway/street doorway badges.
- **Direct Chassis Controls**: Interactive inspection triggers (Routing table, ARP cache, Port table) mounted directly on or below the chassis.

### D. Physical Curved Ethernet Patch Cables
- **Connected State**:
  - Smooth cubic bezier `<path d="M x1 y1 C ... x2 y2" strokeWidth="6" strokeLinecap="round" />`.
  - Core electrical highlight path (`strokeWidth="1.5" opacity="0.8"`).
  - Color-coded by neighborhood street (e.g. Emerald for 192.168.1.x, Amber for 192.168.2.x, Blue for default local).
- **Disconnected / Unplugged State**:
  - Cable realistically droops to the desk surface (`strokeDasharray="6 4"` with `stroke="#64748B"`).
  - Terminating red circular tip on the desk surface.
  - Interactive "⚡ Click to Plug Cable" button trigger.

### E. Neighborhood Street Bands on the Desk
- Directly painted onto the desk surface (`y = 590 to 625`):
  - Rounded pill outline with dashed stroke (`strokeWidth="1.5" strokeDasharray="4 4"`).
  - Color-coded text: `Green Street: 192.168.1.x`, `Orange Street: 192.168.2.x`, etc.

### F. Vector Coordinate Badges & Stage Layer Switcher
- Floating badges (IP tags, MAC badges, Gateway doorway pills) MUST be SVG `<g transform="translate(x, y)">` elements, never absolute HTML divs positioned over the canvas.
- Provide a Stage Layer Switcher at the top: `[All | Sockets | Addresses | Doorways | Name tags]`. Clicking a layer dims irrelevant badges (`opacity="0.35"`) and highlights the active layer.

---

## 3. Strict Student-Facing Language Bar

- **Zero Jargon**: Never use formal academic jargon (e.g. "encapsulation layer", "protocol data unit", "provisioned medium", "subnet mask bitwise ANDing") without first explaining it in plain words.
- **No Verbose Filler**: Keep explanations short, punchy, and grounded in visible cause-and-effect.
- **Grounded Metaphors Only**:
  - IP Address = Street Name + House Number.
  - MAC Address = Hardware Metal Name Tag.
  - Switch = Room with numbered socket doors and a port notebook.
  - Router = Doorway between two different streets.
  - ARP = Roll-call shout in the room.
  - Link Light = Two people holding hands across a wire.
- **No Complex / Unnecessary Analogies**: Do NOT invent whimsical, convoluted analogies (e.g. post offices with stamps, trains with cargo cars, magical pipes, or pizza delivery routes). Stick strictly to the physical equipment sitting right in front of the student on the workbench.
