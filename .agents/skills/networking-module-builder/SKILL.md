---
name: networking-module-builder
description: >-
  Authoritative guide and runbook for designing, architecting, and implementing
  hands-on interactive Networking modules (Day 1, Day 2, Day 3, and beyond) in SQLens.
  Use this skill whenever creating a new networking module, designing an interactive
  canvas stage, building a cockpit view, writing pedagogical rungs, or auditing
  cognitive pacing and term gates.
---

# Networking Module Builder (The SQLens Pedagogy & Engineering Standard)

This skill encapsulates the exact design philosophy, pedagogical heart, stage canvas mechanics, and cockpit UX architecture established in **Day 1 (Direct Connection)** and **Day 2 (Local Switches & ARP)**.

Every new Day (Day 3 Routers & Gateways, Day 4 Subnetting, Day 5 DNS, etc.) **must** adhere strictly to the rules, feeling, and standards documented here.

---

## 1. The Core Pedagogical Doctrine: "Feel It Before You Name It"

Students do not learn networking by memorizing RFC definitions or dry protocol tables. They learn by **touching the wire, seeing the lights, breaking the link, and diagnosing the symptom**.

### The 5 Golden Rules of Pedagogy
1. **Concrete Before Abstract**:
   - Never introduce an acronym (e.g. *ARP*, *MAC*, *ICMP*, *CIDR*) without first showing the physical problem it was invented to solve.
   - *Example (Day 1)*: We don't lecture on IP addressing; we show a house number and a street name painted on the computer.
   - *Example (Day 2)*: We don't start with ARP frames; we show that Computer A wants to send a physical electrical packet to Computer B across a switch, but has no idea which socket or physical name tag belongs to Computer B, so it must shout roll-call to the room.
2. **Gradual Unfolding (Zero Cognitive Stacking)**:
   - **Never dump canvas elements all at once**. Elements are hidden until the exact rung where they become relevant.
   - Stage evolves rung by rung: from dark unlit sockets ➔ plugged cables ➔ synchronized link lights ➔ split address tags ➔ electrical pulse animations ➔ central switch ➔ port LED indicators ➔ MAC hardware name tags ➔ ARP discovery envelopes.
3. **Strict Term Gates (Enforced by Tests)**:
   - Forbid leaking future concepts early. Every Day has a hard boundary:
     - **Day 1**: Only 2 computers + 1 direct cable + IP street/house numbers + link lights + ping round-trip time. Zero mention of switches, MACs, routers, DNS, or gateways.
     - **Day 2**: 4 computers + 1 central switch + ports + MAC addresses + ARP roll-call broadcast + ARP cache table + local firewalls. Zero mention of routers, default gateways, DNS, or internet until the Day 3 preview bridge on the very last rung.
   - Every day defines a strict `VOCABULARY` dictionary (6–7 terms maximum).
4. **Hands-On Physical Action on Every Rung**:
   - Every single rung demands learner participation:
     - Clicking a loose cable to plug it in.
     - Typing or Tab-completing a diagnostic command in the terminal.
     - Changing an octet in an IP address editor.
     - Clicking a toggle to unblock ICMP echo in a software firewall.
     - Making a prediction before running a command.
5. **No Red Buzzers / Warm Constructive Feedback**:
   - Incorrect answers never shame the user with harsh red penalty buzzers or score reductions.
   - Every option provides thoughtful diagnostic explanation explaining *why* that misconception was plausible and guiding the learner back to the physical evidence.

---

## 2. Workspace & File Structure

When building Day `X`:
```text
src/
├── content/networking/modules/
│   ├── net-0X-dayX.ts               # Core content: 4 concepts, 20-24 rungs, vocabulary, stage states
│   └── net-0X.ts                    # Curriculum metadata & track registration
├── components/learning/networking/
│   ├── stage/                       # Canvas visualizers (computers, switches, cables, signals)
│   └── cockpit/
│       ├── DayXCockpitView.tsx      # Main 62% Stage / 38% Cockpit orchestrator
│       ├── StructuredStoryContent.tsx # Auto-formats lists, steps, and inline code badges
│       └── DayXTerminal.tsx         # Guided terminal simulator with ghost autocomplete
tests/tracks/
├── networking-dayX-cockpit.test.tsx # Component rendering & flow integration tests
└── networking-dayX-termgate.test.ts # Automated vocabulary leak & cognitive pacing audit
```

---

## 3. The 4-Concept / 20–24 Rung Blueprint

Every Day module contains **exactly 4 Concepts**, each containing **5 to 6 Rungs**:

| Concept | Purpose | Layout State | Learner Experience |
| :--- | :--- | :--- | :--- |
| **Concept 1: The Physical Problem** | Sensory introduction to the new physical hardware or barrier. | `STATE_A` / `STATE_B` | Inspect the equipment, observe the symptoms when broken vs working. |
| **Concept 2: The Mental Model & Mechanics** | How the system organizes data locally. | `STATE_B` / `STATE_C` | Address manipulation, packet inspection, table learning. |
| **Concept 3: The Protocol in Motion** | Dynamic exchange (e.g. ARP shout, handshake, routing lookup). | `STATE_B` / `STATE_D` | Roll-call fanout, step-by-step frame inspection across ports. |
| **Concept 4: Troubleshooting & Triage Rulebook** | Systematic engineering checklist with 3 tickets. | `STATE_D` / `STATE_E` / `STATE_F` | Real tickets: Ticket 1 (cable), Ticket 2 (address), Ticket 3 (firewall/gateway). |

### The Rung Layout States
- `STATE_A`: Pure visual observation + Concept intro (no terminal clutter).
- `STATE_B`: Hands-on terminal simulator with ghost suggestion & Tab auto-complete.
- `STATE_C`: Hardware manipulation (e.g. interactive address editor, cable re-patcher).
- `STATE_D`: Combined diagnosis (Stage canvas + utility control strip + terminal).
- `STATE_E`: Troubleshooting ticket workbench with real-time symptom validation.
- `STATE_F`: Mastery check (Write-and-compare self-assessment or sorting category match).

---

## 4. Cockpit View Architecture (38% Right Panel)

Follow the layout and styling established in [Day2CockpitView.tsx](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/src/components/learning/networking/cockpit/Day2CockpitView.tsx):

1. **Top Header**:
   - Concept number & title badge (`Concept X • Step Y of Z`).
   - Time estimate pill (`2 min`, `font-mono`).
   - Progress dot rail (clickable to navigate to previously unlocked rungs).
   - "My Words" drawer button with unlocked vocabulary counter.
2. **Telemetry / Triage Strip** (Concept 4 only):
   - 42px dark utility strip: `① Link light on? ➔ ② Address right? ➔ ③ Ping replies? ➔ ④ ARP table?`
   - Active step glows emerald when checked.
3. **Structured Explanation Story**:
   - Use `<StructuredStoryContent story={currentRung.story} meaningText={currentRung.meaningText} isTaskDone={isTaskDone} />`.
   - Never render raw text in a generic paragraph that collapses newlines.
   - Numbered items (`1. ... 2. ...`) or steps (`Step 1: ... Step 2: ...`) automatically render as individual micro-cards with monospace badge badges `[ 1 ]`, `[ 2 ]` and backtick code styling.
4. **Utility Control Bars Above Terminal**:
   - **Never make clunky stacked cards**.
   - Create compact 1-row or 2-row utility strips (`bg-[#141417] border border-white/[0.08] rounded-xl`).
   - Include an icon status badge, live status text, and crisp tactile action toggle/button.
5. **Interactive Check & MCQ Rules**:
   - **CRITICAL**: Never place the correct answer always in the first slot!
   - Distribute correct answers naturally across **Option A, Option B, and Option C**.
   - Every option must include clear feedback explaining the real-world cause.

---

## 5. Visual Stage Design (62% Left Canvas)

Follow the styling established in `PhysicalConnectionCanvas.tsx`:
- **Theme**: Premium dark aesthetic (`bg-[#0c0c0e]`, `border-white/[0.06]`).
- **Nodes (Computers/Switches)**:
  - Rounded glassmorphic cards with crisp borders.
  - Active RJ-45 sockets with dual link LEDs (`off` = dark, `on` = glowing emerald `#10b981`).
  - Street address bands (`192.168.1`) highlighted in blue or purple; house numbers (`.10`, `.20`) highlighted in bright white mono text.
  - Hardware MAC name tags displayed as metallic badges (`00-00-5e-00-53-01`).
- **Cables & Signals**:
  - Smooth SVG curves connecting sockets.
  - Cable disconnection shows realistic dangling patch cables on the desk.
  - Electrical packets animate along the wire with particle glow (`emerald` for ping echo, `amber` for broadcast roll-call, `rose` for blocked drop).

---

## 6. Authoring Checklist for New Modules

When building a new Day, execute this checklist:
- [ ] **Define Vocabulary**: Exactly 6–7 key terms in `DAYX_VOCABULARY`.
- [ ] **Plan 4 Concepts / 20–24 Rungs**: Write out the learning objective for each step.
- [ ] **Check Term Gate Restrictions**: Verify no terms from future modules leak into teaching text.
- [ ] **Format Question Options**: Check that `isCorrect: true` is varied across A, B, and C.
- [ ] **Use StructuredStoryContent**: Ensure all diagnostic checklists use numbered lists or step markers.
- [ ] **Test with Vitest**:
  - Run `npx vitest run tests/tracks/networking-dayX-cockpit.test.tsx tests/tracks/networking-dayX-termgate.test.ts`.
- [ ] **Validate Build**: Run `npm run build` to guarantee zero TypeScript or Next.js build errors.
- [ ] **Deploy & Verify**: Deploy to Vercel production and verify interactive responsiveness.

For in-depth reference implementations and code templates, see:
- [Pedagogy & Voice Guide](./references/pedagogy-and-experience.md)
- [Canvas & Cockpit Blueprint](./references/canvas-and-cockpit-architecture.md)
- [Module Rung Template](./references/module-authoring-template.md)
