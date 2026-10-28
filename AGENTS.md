<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# SQLens Project & Networking Track — Permanent Agent Rules

When authoring or modifying any Networking Track module in SQLens, ALWAYS adhere to the authoritative rules codified in `.agents/rules/networking-track.md` and `docs/networking/`:

1. **Pedagogical Heart — "Zero Analogies & Physical Reality"**:
   - STRICTLY FORBIDDEN: Metaphors (no envelopes, mailboxes, postcards, water pipes, apartments, cars).
   - MANDATORY: Exact physical & digital network concepts (frames, packets, byte streams, MAC addresses, IP prefixes, routing tables, gateways, next hops).
   - "TAUGHT BEFORE TESTED": Never drop an acronym, header field, or protocol without explicitly motivating and defining it first.
   - Tone: Written like a senior infrastructure engineer, thoughtful, human-crafted, never AI-generic.

2. **Canvas Anti-Overlap & Hardware Geometry**:
   - PC Workstations (`SvgWorkstation.tsx`) have an 88px wide x 94px high vertical envelope (chassis at y+48, IP pill at y+56..74, MAC pill at y+78..94). Elements positioned below a workstation MUST clear `y + 94`.
   - Metallic silver base chassis is EXCLUSIVE to PC workstations (never switches or routers).
   - In corridor topologies, central diagnostic cards must stay `width <= 280px` to clear diagonal link cables.
   - **Horizontal Cable Span Invariant**: In-flight packet badge width MUST satisfy `width <= (x_right_device_left - x_left_device_right) - 30px` to maintain 15px clearance on both sides and eliminate chassis penetration.
   - **Same-Level Alert Staggering**: Stagger adjacent alerts/callouts vertically by >= 25px when horizontal distance is tight to eliminate alert collisions.
   - Audit progressive reveal across EVERY step so newly appearing HUD cards do not occlude static components or prior step badges.

3. **Canvas Fullscreen / Workspace Expansion**:
   - Supports floating `Maximize2` / `Minimize2` toggle and `Esc` key recovery.
   - Topologies must center and scale cleanly in both normal and fullscreen viewports via `fitToView()`.

4. **Terminal & Navigation Standards**:
   - Terminal must support `cls`, `clear`, `Ctrl+L`, ghost Tab autocomplete, and command history.
   - Command matching in `NetworkingWorkspace.tsx` normalizes whitespace (`.trim().toLowerCase().replace(/\s+/g, ' ')`) and checks `activeStepIndex` first before fallback searching.
   - On Step 1 (Idea 1), the `← Back` button is active and navigates to `/networking#day-${dayNumber}`.

5. **9-File Blueprint for Any New Day**:
   1. `docs/networking/DAY_XX_DETAILED_SPEC.md` (Authoritative detailed technical spec).
   2. `src/content/networking/modules/net-XX.ts` (Curriculum step content).
   3. `src/content/networking/index.ts` (Register in `NETWORKING_MODULES`).
   4. `src/components/learning/networking/homepage/NetworkingHomePage.tsx` (Add teaser to `MODULE_TEASERS`).
   5. `src/components/learning/networking/canvas/NetworkingCanvas.tsx` (`DAY_WORLD_SPECS` + anti-overlap stage).
   6. `src/components/learning/networking/workspace/NetworkingWorkspace.tsx` (Command triggers and aliases).
   7. `src/components/learning/networking/terminal/NetworkingTerminal.tsx` (Help/command output synchronization).
   8. `tests/curriculum/networking-curriculum.test.ts` (Curriculum schema validation test).
   9. `tests/ui/networking-canvas.test.tsx` and `tests/ui/networking-homepage.test.tsx` (Canvas coordinates & live days count).

6. **Standard Planning Protocol & Skill**:
   - When asked to "plan module XX" or "build module XX", strictly follow `.agents/skills/networking-module-builder/SKILL.md`.
   - Days 1–17 are completed and deployed. Day 18 (`net-18` TCP: Reliable Delivery) is the active next module.
   - Always run: `npm test -- tests/curriculum/networking- tests/ui/networking-` and `npx tsc --noEmit`.
