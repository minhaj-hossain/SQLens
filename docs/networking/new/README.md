# Networking Track: New Standard Curriculum & Architecture

Welcome to the new standard for the **Networking Track** at SQLens.

This directory contains the definitive specifications, architectural contracts, UI state machines, and curriculum scripts created to build a world-class, beginner-first networking learning experience.

---

## Documents Directory

| Document | Purpose |
|---|---|
| [`GLOBAL_SPEC.md`](./GLOBAL_SPEC.md) | **The Global Architecture & Rules.** Covers the 5-second test, learner persona, the 5-stage cognitive engine (`LOOK ➔ WATCH ➔ READ ➔ DO ➔ CHECK`), tone of voice, forbidden words, 6 layout states, guided terminal rules, and quality gates. **Mandatory reading for all modules.** |
| [`DAY_1_THE_FIRST_LINK.md`](./DAY_1_THE_FIRST_LINK.md) | **Day 1 (Module 1) Specification.** Complete 4 concepts, 25 rungs, exact copy, 8 counted vocabulary words, Simplified notes, Look Inside dialogs, and troubleshooting tickets. |
| [`DAY_2_THE_SHARED_WIRE.md`](./DAY_2_THE_SHARED_WIRE.md) | **Day 2 (Module 2) Specification.** The introduction of a 3rd computer, the network switch, MAC hardware badges, ARP roll calls (broadcasts), ARP address books (`arp -a`), and Request Timed Out. |

---

## Core Principles to Maintain in Future Modules (Day 2+)

1. **Strict Term Budget:** Cap vocabulary to <= 3 new technical words per concept. Never use jargon before plain description.
2. **2D SVG Stage over 3D:** Flat, clear, high-contrast SVG animated with Framer Motion. Zero camera-orientation load.
3. **The 5-Second Test:** The learner must immediately know **Where to look**, **What to do**, and **Why**.
4. **Guided Terminal with Progressive Disclosure:** Ghost suggestions, chip options, dimmed untaught lines with tooltips, and bidirectional stage linking.
5. **Universal Card Pattern:** `LOOK` (bold, 1st) ➔ `WATCH` ➔ `STORY` (<= 35 words) ➔ `DO / WHY / EXPECT` (<= 65 words) ➔ `CHECK` ➔ `MEANING`.
6. **No Red Buzzers / No Shame:** Neutral, educational feedback. No lives, scores, or timers.
7. **Automated Term-Gate Testing:** Every module must have an automated vitest contract ensuring future concepts don't leak early into card copy.
