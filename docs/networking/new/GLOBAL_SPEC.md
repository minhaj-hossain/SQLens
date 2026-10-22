# Networking Track: The New Standard Architecture & Global Specification

> **Notice:** This document is the **single source of truth** for building all modules in the Networking Track. Any conversation, agent, or developer working on new networking modules must strictly follow the rules, voice, layout states, and cognitive engine defined here.

---

## 1. Mission & The 5-Second Test

### Mission
Build interactive, job-ready networking labs for self-taught beginners with zero prior knowledge and no live mentor. Each day is a ~55-minute hands-on lab where the learner builds genuine understanding, controls real tools, predicts outcomes, and fixes faults without assistance.

> **Watching animations does not count as success.** Success is when a learner can explain what happened in their own words and troubleshoot a broken setup using evidence.

### The 5-Second Test
A complete beginner looks at any screen for **five seconds**. They must instantly know:
1. **Where to look** (enforced by the `LOOK` line).
2. **What to do next** (enforced by the `DO` instruction).
3. **Why they are doing it** (enforced by the `WHY` instruction).

If any of the three is ambiguous, the screen is flawed, no matter how visually polished it is.

---

## 2. Who the Learner Is (Persona Constraints)

- **Prior Knowledge:** Can use a browser and smartphone. Has never opened a terminal, typed CLI commands, or configured an IP address.
- **Learning Environment:** Learns alone. Every undefined acronym or cryptic phrase is an abandonment point.
- **Goal:** Wants a real job in IT/networking. The training must feel like real work, but never present artificial CLI friction.
- **Language & Literacy:** May read English as a second language. Short, active sentences (average <= 14 words) at a grade 6 reading level.
- **Hardware:** May run on low-end laptops (integrated graphics) or mobile phones. No WebGL dependency.

---

## 3. The 5-Stage Cognitive Engine (Per-Rung Flow)

Every interactive lesson screen is called a **rung**. Every rung executes the same 5-beat rhythm in the exact same sequence:

```
┌─────────────┐
│ 1. LOOK     │ ──> The card explicitly tells the learner where to look FIRST.
├─────────────┤
│ 2. WATCH    │ ──> The stage animates (<= 3 seconds). Card text stays still.
├─────────────┤
│ 3. READ     │ ──> The story explains what happened (<= 35 words).
├─────────────┤
│ 4. DO       │ ──> The learner acts: DO / WHY / EXPECT block.
├─────────────┤
│ 5. CHECK    │ ──> The lab validates action, displays MEANING (What happened).
└─────────────┘
```

### Strict Flow Rules
1. **One idea per rung:** Max 2 new vocabulary words and max 1 new interactive tool per screen.
2. **Nothing moves while the learner is reading:** Stage animations finish completely before new card text appears. Replay is always 1-click or the `R` key.
3. **One primary button in a fixed position:** Three states: Locked (grey with missing action explanation), Ready (soft pulse, then still), or replaced by question buttons during a check.
4. **Back always works:** Restores the exact previous rung state with answers preserved.
5. **URL hash persistence:** Every rung has a distinct hash (e.g., `#day1/c2/r3`). Refreshes restore the exact lab state.

---

## 4. Voice, Tone & Writing Standards

Write as a **patient, clear colleague sitting next to the learner**, never as an academic textbook or reference manual.

### 10 Core Principles
1. **Talk to one person:** Use *you*, *your computer*, *your friend's computer*. Never *the user*, *the host*, or *the node*.
2. **Plain description FIRST, technical term SECOND:** Write: *"a tiny message that means 'are you there?' is called ping."* (Never: *"ping is an ICMP echo request."*)
3. **Short sentences, one idea each:** Average 14 words or fewer. Paragraphs <= 3 sentences.
4. **Give a reason for every instruction:** Use *because* or start with *This*.
5. **Concrete nouns, active verbs:** *"Your computer sends a message"*, not *"A packet is transmitted"*.
6. **Contractions are encouraged:** *can't*, *it's*, *don't*.
7. **Calm, respectful, no exclamation marks:** Exactly one exclamation mark allowed on concept-complete cards.
8. **Mistakes are neutral data:** Explain the cause; never say *wrong*, *incorrect*, or *failed*.
9. **Monospace for commands and outputs:** Numbers are numerals (`1`, `20`, `1 ms`).
10. **Banned words in all teaching text:**
    - `just`, `simply`, `obviously`, `easy`, `easily`, `trivial`, `clearly`, `as you know`.

### Instruction Block Standard (DO / WHY / EXPECT / MEANING)

| Section | Rule | Example |
|---|---|---|
| **DO** | Action verb first. Say exactly what to type or click (<= 20 words). | `Type ping 192.168.1.20 and press Enter.` |
| **WHY** | One sentence starting with *This* (<= 25 words). | `This sends a tiny message to your friend's computer and waits for an answer.` |
| **EXPECT** | Plain-language observable result (<= 20 words). | `A few lines of text will appear. Some start with Reply.` |
| **MEANING** | Appears after action. What happened and what it proves (<= 40 words). | `No reply. Your computer couldn't even send the message. It stopped inside.` |

---

## 5. UI Architecture & Screen Layout States

The interface is a fixed two-column layout on desktop (>= 1024px) with **zero page scroll**:
- **Stage Area (Left):** 62% width (fixed 16:10 box, SVG animated with Framer Motion).
- **Card & Work Area (Right):** 38% width (min 380px, max 480px).
- **Top Bar:** Day and concept title, Progress dots rail, My Words drawer button.
- **Status Strip (Above Stage):** 40px live telemetry strip (progressively unlocked).

```
┌────────────────────────────────────────────────────────────────────────┐
│ TOP BAR  Day X · Concept Y of Z       ● ● ◐ ○ ○        [My Words] [≡]  │
├──────────────────────────────────────────┬─────────────────────────────┤
│ (optional thin status strip, 40 px)      │ CARD                        │
│ ┌──────────────────────────────────────┐ │  Look: where to look        │
│ │                                      │ │  Story (<= 35 words)        │
│ │            STAGE (SVG)               │ │  Your turn:                 │
│ │            62% of width              │ │    DO / WHY / EXPECT        │
│ │            16:10 aspect ratio        │ ├─────────────────────────────┤
│ │                                      │ │ WORK AREA                   │
│ │                                      │ │  (one tool at a time)       │
│ └──────────────────────────────────────┘ ├─────────────────────────────┤
│                                          │ [Back]            [Continue]│
└──────────────────────────────────────────┴─────────────────────────────┘
```

### The 6 Standard Layout States
1. **STATE A (Story Only):** Stage + Card. Used for looking, reading, or answering multiple-choice questions.
2. **STATE B (Guided Terminal):** Stage + Card + Terminal simulator.
3. **STATE C (Editor):** Stage + Card + Device/Address configuration form.
4. **STATE D (Triage Checklist + Tool):** Stage + Checklist strip + Card + Terminal/Editor.
5. **STATE E (Full-Screen Page):** Centered 560px column (Welcome, Concept Intro, Concept Complete, Day Complete). No stage.
6. **STATE F (Interactive Board):** Stage dimmed (35% opacity) + Full card sorting/writing board.

### Mobile Standard (< 640px)
- Stage takes top 36% height.
- Card takes middle section.
- Terminal / Editor opens as a 70% bottom sheet.
- **Suggestion chips** are 1-tap actions so the software keyboard does not pop up uninvited.

---

## 6. The Guided Terminal Standard

The terminal must feel authentic while providing safety guardrails. It is **not an unguided blank sandbox**.

### Terminal Capabilities
1. **Ghost Autocomplete:** As the learner types, grey ghost text shows the expected command. Pressing `Tab` fills it.
2. **Clickable Suggestion Chips:** Chips below input fill or run commands in 1 tap.
3. **Forgiving Parser:**
   - Case-insensitive (`PING`, `ping`, `Ping`).
   - Collapses extra spaces.
   - Forgives leading zeros with a polite hint: `Lab: Close. Write it without the extra zeros.`
4. **Dimmed Untaught Lines:** Real outputs are printed in full, but lines the learner has not met yet are dimmed to 45% with a dotted underline and a tooltip: *"A later day explains this. You can ignore it for now."*
5. **Lab Guidance Messages:** Differentiated with a blue left border and prefix `Lab:`.
   - Unknown command: `Lab: That command isn't part of this lab yet. Try: <expectedCommand>`
   - `ping` with no address: `Lab: Ping needs an address after it. Try: <expectedCommand>`
   - Near miss: `Lab: Close. Try: <expectedCommand>`
6. **Bidirectional Stage Highlighting:**
   - Hovering terminal output (e.g., `time=1ms`, `IPv4 Address`) highlights the corresponding physical stage element.
   - Clicking a stage component pulses its terminal data.

---

## 7. Hiding Detail: Three Built-In Escape Hatches

The main path teaches only what is on the current rung. Extra depth is handled through 3 non-blocking mechanisms:

1. **Term Popovers:** Dotted underlined words. Tapping shows the definition from the vocabulary table (<= 40 words). Never blocks progress.
2. **Simplified? Notes:** Inline expandable link under any sentence where the lab simplifies real-world complexity (<= 50 words). Must be honest.
3. **Look Inside (Optional) Dialogs:** Chip beside a stage object opening a modal dialog with a title, illustration, and <= 60 words. Always ends with: *"Optional: you do not need this to continue."*

---

## 8. Anti-Patterns (BANNED from All Modules)

| Anti-Pattern | Why It Is Prohibited |
|---|---|
| **All panels visible at once** | Clutters the screen and creates cognitive overload. |
| **Status strip with multiple readouts on Day 1** | Introduces terminology before it is taught. |
| **3D camera dives / fly-throughs** | Causes orientation disorientation and GPU performance loss. |
| **Jargon labels on stage pictures** | Scares beginners before they grasp the concept. |
| **Quiz answers where correct is longest** | Learners guess by pattern rather than understanding. |
| **Red buzzers, error sounds, scores, lives** | Induces anxiety. Mistakes are neutral learning data. |
| **Hover-only tooltips** | Completely fails on mobile phones and keyboards. |
| **Invented terminal outputs** | Teaches wrong expectations for real CLI tools. |

---

## 9. Verification & Quality Gates

Every module must ship with automated vitest suites enforcing:
1. **The Term Gate Test:** Scans all card text in the curriculum file and fails the build if any forbidden future-concept term appears.
2. **Word Count Limits:** Tests that story <= 35 words and task <= 65 words for every single rung.
3. **Feedback Integrity:** Tests that every option in every check has authored feedback (> 10 characters).
4. **Hint Ladders:** Tests that every rung has exactly 3 hints culminating in `Show me`.
