---
name: networking-module-builder
description: Comprehensive workflow to plan, author, implement, and verify any day/module in the SQLens Networking Track adhering to physical-reality pedagogy, anti-overlap canvas geometry, and the 9-file blueprint.
---

# SQLens Networking Module Builder Skill

This skill defines the authoritative procedure for **planning** and **implementing** any Day/Module in the SQLens Networking Track. When asked to "plan module XX", "author Day XX", or "build Day XX", you MUST strictly follow this exact workflow to guarantee consistency, zero analogies, anti-overlap canvas geometry, and 100% test pass rates across the 35-day curriculum.

---

## 1. Pedagogical Doctrine: "Zero Analogies & Physical Reality"

* **STRICTLY FORBIDDEN**: Never use metaphors or analogies (no mailboxes, postmen, envelopes, postcards, telephone calls, handshakes between people, apartments, water pipes, police officers).
* **MANDATORY**: Use exact physical and digital network realities: byte streams, packets, frames, 32-bit Sequence Numbers, 32-bit Acknowledgment Numbers, 16-bit Port numbers, RFC standards, kernel socket buffers, routing tables, CIDR netmasks, ARP caches, and hardware MAC addresses.
* **"Taught Before Tested" (Absolute Rule)**:
  * Never drop any acronym, header field, protocol abbreviation, or technical term without explicitly motivating and defining it first in an earlier or current step.
  * Every concept tested in a terminal command or quiz question must have been taught and grounded in an earlier or active concept section.
* **Tone**: Phrasing must read like thoughtful, human-crafted curriculum written by a senior infrastructure engineer—never robotic, AI-default, or generic filler.
* **Natural Step Count**: Modules take as many steps as the topic naturally demands (typically 4 Ideas + 1 Recap = 5 steps, or up to 7 steps). The final step is ALWAYS a pure recap step with `cmd: null`.
* **Task Hint Policy**: Omit `(tap it to fill the terminal).` on Day 3 onward. End all task instructions with a clean period.

---

## 2. Standard Module Planning Protocol (When Asked to "Plan Module XX")

When the user asks to "plan module XX" or invokes `/plan`:

1. **Step 1: Consult the Roadmap**:
   - Read `docs/networking/TRACK_ROADMAP_DAYS_1_TO_35.md` to identify the Stage, Title, and core technical goals of Day XX.
   - Review the previous day's spec (`docs/networking/DAY_${XX-1}_DETAILED_SPEC.md`) to create seamless pedagogical continuity ("Since Day XX-1: ...").
2. **Step 2: Define the Concepts & Invariants**:
   - Break the topic into 3 to 5 core technical ideas plus 1 comprehensive recap step.
   - For each step, outline the exact `NetworkingStep` interface fields:
     - `group`: e.g. `Idea 1 of 4 · Sequence numbering`
     - `title`: Action-oriented, technical title
     - `concept`: Markdown text explaining the physical reality, header fields, and RFCs
     - `why`: Direct sentence explaining the architectural purpose
     - `pic`: ASCII or visual diagram description
     - `task`: Specific CLI instruction ending in a period
     - `cmd`: Exact command string (or `null` for recap)
     - `read`: 4 key takeaway pairs `['Key', 'Value']` for the diagnostic table
     - `rem`: 1 memorable takeaway rule
3. **Step 3: Define CLI Commands & Static Responses**:
   - Design realistic Linux network tool outputs (`ip`, `ss`, `tcp`, `ping`, `traceroute`, `arp`, `curl`).
   - Define fuzzy aliases and command normalization (normalize whitespace, lowercase, trim).
4. **Step 4: Design Canvas Geometry with Anti-Overlap Rules**:
   - ViewBox: typically `0 0 1480 620` (or `1100x560` to `1500x650`).
   - Workstation geometry: `SvgWorkstation` has an 88px wide x 94px high bounding box. Silver base chassis is **exclusive to PC workstations** (never under switches or routers).
   - Routers: Stacked vertical IP pills (`P1: ...`, `P2: ...`) to eliminate horizontal text clipping.
   - **Horizontal Cable Span Invariant**: Any in-flight packet badge or callout width MUST satisfy `width <= (x_right_device_left - x_left_device_right) - 30px` to maintain $\ge 15\text{px}$ clearance on both sides and eliminate chassis penetration.
   - **Same-Level Alert Staggering**: When multiple alerts/callouts appear in the same step, stagger their `y` coordinates by $\ge 25\text{px}$ if their horizontal coordinates overlap or are close.
   - Audit progressive reveal: newly appearing badges or diagnostic cards at `y=350` must NEVER occlude devices, cables, or static tables.
5. **Step 5: Author the Authoritative Specification**:
   - Write the complete specification to `docs/networking/DAY_XX_DETAILED_SPEC.md` using the standard 6-section template.

---

## 3. The 9-File Implementation Blueprint

When implementing Day XX, the following 9 files MUST be authored or updated:

1. `docs/networking/DAY_XX_DETAILED_SPEC.md` — Authoritative specification document.
2. `src/content/networking/modules/net-XX.ts` — Module definition implementing `NetworkingModule`.
3. `src/content/networking/index.ts` — Export module and register in `NETWORKING_MODULES` array.
4. `src/components/learning/networking/homepage/NetworkingHomePage.tsx` — Add teaser to `MODULE_TEASERS`.
5. `src/components/learning/networking/canvas/NetworkingCanvas.tsx` — Add `DAY_WORLD_SPECS` and Day XX render stage.
6. `src/components/learning/networking/workspace/NetworkingWorkspace.tsx` — Add command triggers and aliases.
7. `src/components/learning/networking/terminal/NetworkingTerminal.tsx` — Verify help/clear/command support.
8. `tests/curriculum/networking-curriculum.test.ts` — Add curriculum schema test for Day XX.
9. `tests/ui/networking-canvas.test.tsx` and `tests/ui/networking-homepage.test.tsx` — Add canvas coordinate tests and update "XX Days Live" in homepage test.

---

## 4. Detailed Specification Template (Section by Section)

When authoring `docs/networking/DAY_XX_DETAILED_SPEC.md`, strictly use this format:

```markdown
# SQLens Networking Track — Day XX Detailed Specification
## Stage X: [Stage Name] (Days XX–YY)
### Module: `net-XX` · [Full Title]

---

## 1. Pedagogical Intent & Objectives
### Context & Learning Progression
- **Day XX-1**: [Prior module recap]
- **Day XX (This Module)**: [Core goals, RFCs, and physical realities]

### Key Pedagogical Constraints
- **Zero Analogies Policy**: [Explicitly list forbidden analogies and mandatory technical terms]
- **Taught Before Tested**: [Prerequisite sequence]
- **Task Hint Policy**: Omit '(tap it to fill the terminal).' and end with a clean period.

---

## 2. Module Identity & Metadata
```typescript
export const NET_XX_MODULE: NetworkingModule = {
  id: 'net-XX',
  dayNumber: XX,
  title: 'Day XX · [Title]',
  shortTitle: '[Short Title]',
  steps: [ /* steps */ ],
  staticResponses: { /* CLI outputs */ },
};
```

---

## 3. Step-by-Step Curriculum Architecture
### Step 1: Idea 1 of N · [Topic]
- **Group**: `Idea 1 of N · [Topic]`
- **Chg**: `Since Day XX-1: ...`
- **Title**: [Title]
- **What**: [In-depth senior engineering explanation with exact packet headers/counters]
- **Why**: [Architectural purpose]
- **Pic**: [Diagram description]
- **Task**: [Instruction ending in period]
- **Cmd**: `[command]`
- **Read**: 4 takeaway pairs
- **Rem**: 1 memorable summary rule

[Repeat for Step 2 .. Step N-1]

### Step N: Recap · [Topic]
- **Group**: `Recap`
- **Title**: [Title]
- **What**: [Synthesis of core rules]
- **Why**: [Consolidation]
- **Pic**: [Cheat sheet / master diagram description]
- **Task**: `Review the N fundamental rules of [Topic].`
- **Cmd**: `null`
- **Read**: 4 rule takeaways
- **Rem**: Summary rule

---

## 4. Static Terminal Responses & Aliases
[Provide complete, realistic CLI mock outputs and workspace alias mapping]

---

## 5. Canvas Anti-Overlap Geometry & Layout
- ViewBox: `0 0 1480 620`
- Top Title Banner coordinates
- Device coordinates (`SvgWorkstation`, `SvgRouter`, `SvgSwitch`)
- Link cables & port pins
- Step-by-step progressive reveal overlays with safe clearance guarantees ($\ge 15\text{px}$)

---

## 6. Verification Checklist
- [List of files and exact npm test command]
```

---

## 5. Mandatory Verification Protocol

Before finishing any module:
1. Run curriculum tests:
   ```bash
   npx vitest run tests/curriculum/networking-curriculum.test.ts tests/curriculum/networking-interactive-flow.test.tsx tests/curriculum/networking-step-progression.test.tsx
   ```
2. Run canvas UI test suite:
   ```bash
   npx vitest run tests/ui/networking-canvas.test.tsx tests/ui/networking-homepage.test.tsx
   ```
3. Run full project typecheck:
   ```bash
   npx tsc --noEmit
   ```
4. Verify interactive command entry unlocks the Next button on every single step.
