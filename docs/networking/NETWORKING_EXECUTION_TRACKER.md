# Networking Track: Cross-Conversation Execution Tracker & Handoff Guide

> **Document Version:** 1.0.0  
> **Last Updated:** October 11, 2026  
> **Location:** `docs/networking/NETWORKING_EXECUTION_TRACKER.md`  
> **Purpose:** Single source of truth for tracking live execution across different conversations, sessions, and agents.

---

## ⚡ Quick Start for New Conversations & Agents

If you are a new AI agent or continuing in a fresh conversation, **read this first before taking any action**:

1. **Do NOT re-debate settled topics:** All instructional design, assessment philosophy ("Third Way"), and curriculum architecture debates are **closed and frozen**. Review [`NETWORKING_STATUS_AND_DECISION_RECORD.md`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/docs/networking/NETWORKING_STATUS_AND_DECISION_RECORD.md).
2. **Current Baseline State:**
   - Git branch: `main`
   - Test suite: `npm test` runs 103 test files (1,202 tests) with 100% passing.
   - Networking tests: `npx vitest run tests/tracks/networking-` runs 7 test files (141 tests) with 100% passing.
   - Typecheck: `npm run lint` (`tsc --noEmit`) passes with 0 errors.
   - Protected tracks: SQL (57 days) and Prisma (14 days) are 100% frozen. Never modify their source files or tests.
3. **Current Active Phase:** **Phase 1: Technical Errata & Automated Validator Suite**.
4. **Where the approved pilot spec lives:** [`docs/networking/NETWORKING_MODULE_4_SUBNETTING_PILOT_SPEC.md`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/docs/networking/NETWORKING_MODULE_4_SUBNETTING_PILOT_SPEC.md) (v1.2.0).

---

## 1. Master Phase Tracker & Progress Overview

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                             EXECUTION PROGRESS MATRIX                            │
├─────────┬────────────────────────────────────────────┬─────────┬─────────────────┤
│ PHASE   │ DESCRIPTION                                │ STATUS  │ TARGET ARTIFACT │
├─────────┼────────────────────────────────────────────┼─────────┼─────────────────┤
│ Phase 0 │ Baseline Repository Inventory & Audit      │ DONE    │ Audit v2.0      │
├─────────┼────────────────────────────────────────────┼─────────┼─────────────────┤
│ Phase 1 │ RFC Technical Errata & Curriculum Valid.   │ READY   │ 8 Module Files  │
│         │ (Apply errata, write vitest validator)     │ TO RUN  │ + New Test File │
├─────────┼────────────────────────────────────────────┼─────────┼─────────────────┤
│ Phase 2 │ Module 4 Subnetting Pilot Implementation   │ QUEUED  │ Bit-Slicer UI + │
│         │ (5-stage fading, /22 transfer task)        │         │ Structured Grdr │
├─────────┼────────────────────────────────────────────┼─────────┼─────────────────┤
│ Phase 3 │ Module 5 ARP Companion Pilot Spec & Code   │ QUEUED  │ Spec v1.0 +     │
│         │ (Queued packet state, remote GW transfer)  │         │ Simulator UI    │
├─────────┼────────────────────────────────────────────┼─────────┼─────────────────┤
│ Phase 4 │ Component Library Extraction               │ QUEUED  │ PacketInspector │
│         │ (PacketInspector.tsx, SubnetBitSlicer.tsx) │         │ shared package  │
├─────────┼────────────────────────────────────────────┼─────────┼─────────────────┤
│ Phase 5 │ Curriculum-Wide Rollout (Modules 1-3, 6-16)│ QUEUED  │ All 16 Modules  │
└─────────┴────────────────────────────────────────────┴─────────┴─────────────────┘
```

---

## 2. Phase 1 Execution Checklist (CURRENT ACTIVE TASK)

**Goal:** Correct all RFC and technical precision inaccuracies across the 8 affected module files, and author an automated test file that prevents regressions.

- [ ] **Task 1.1 — Update `src/content/networking/modules/net-04.ts`:**
  - [ ] Label `203.0.113.5` as RFC 5737 TEST-NET-3 (documentation only). Use `8.8.8.8` as the public Internet example.
  - [ ] Correct `/31` point-to-point text: 1 host bit, 2 usable host addresses under RFC 3021 (not "0 host bits").
- [ ] **Task 1.2 — Update `src/content/networking/modules/net-06.ts`:**
  - [ ] Label `2001:db8:1::100` as RFC 3849 documentation-only. Use `2001:4860:4860::8888` for live public routing examples.
- [ ] **Task 1.3 — Update `src/content/networking/modules/net-08.ts`:**
  - [ ] Decouple NAT/PAT address translation from stateful firewall filtering. Emphasize that NAT drops unsolicited inbound traffic due to lack of a translation table entry, but does not replace explicit stateful firewall policy rules.
- [ ] **Task 1.4 — Update `src/content/networking/modules/net-10.ts`:**
  - [ ] State the universal CNAME rule: a CNAME cannot coexist with *any other record of any type* for the same owner name (which causes the apex issue because apex requires SOA/NS).
- [ ] **Task 1.5 — Update `src/content/networking/modules/net-11.ts`:**
  - [ ] Clarify that a 5-tuple identifies an individual socket connection, but modern HTTP/2 and HTTP/3 browsers multiplex multiple tabs and streams over a single shared connection.
- [ ] **Task 1.6 — Update `src/content/networking/modules/net-13.ts`:**
  - [ ] Clarify HTTP/2 vs HTTP/3 head-of-line blocking: HTTP/2 solves application stream blocking; HTTP/3 over QUIC mitigates TCP cross-stream transport blocking, but in-stream ordering and shared congestion control remain.
- [ ] **Task 1.7 — Update `src/content/networking/modules/net-02.ts` & `net-03.ts`:**
  - [ ] Refine switching security claims: switches isolate collision domains and reduce casual sniffing compared to hubs, but do not prevent broadcast inspection, ARP spoofing, or MAC table flooding.
- [ ] **Task 1.8 — Update `src/content/networking/modules/net-15.ts`:**
  - [ ] Explicitly show both Inbound and Outbound ACL rule tables on the router interface so learners observe why return traffic with ephemeral ports is dropped.
- [ ] **Task 1.9 — Update `src/content/networking/modules/net-16.ts`:**
  - [ ] Clarify that the OSPF metric is path **Cost** (dimensionless integer), derived from interface bandwidth by default.
  - [ ] Qualify Wi-Fi non-overlapping channels 1, 6, 11 as the standard US/FCC 2.4 GHz plan, noting regulatory domain variations.
- [ ] **Task 1.10 — Author `tests/curriculum/networking-curriculum-validator.test.ts`:**
  - [ ] Invariant check: Assert zero unlabeled TEST-NET addresses labeled as public.
  - [ ] Invariant check: Assert zero claims of "0 host bits" for `/31`.
  - [ ] Parity check: Verify every instruction step has a matching assessable question.
- [ ] **Task 1.11 — Verification & Commit:**
  - [ ] Run `npm run lint` $\to$ Exit code 0.
  - [ ] Run `npx vitest run tests/` $\to$ 100% tests passing.
  - [ ] Commit with clean git message: `fix(networking): correct RFC errata and add automated curriculum validator`.

---

## 3. Phase 2 Execution Checklist (QUEUED)

**Goal:** Implement the approved Module 4 Subnetting Pilot specification ([`NETWORKING_MODULE_4_SUBNETTING_PILOT_SPEC.md`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/docs/networking/NETWORKING_MODULE_4_SUBNETTING_PILOT_SPEC.md)).

- [ ] Build `src/components/learning/networking/SubnetBitSlicer.tsx`:
  - [ ] 32-bit binary visualizer with 4 octets.
  - [ ] Interactive CIDR slider with network (blue) vs host (emerald) bit illumination.
  - [ ] Real-time block size, network address, broadcast address, and usable host count calculation.
  - [ ] Collapsible state for Stage 3 (Perform Independently) cognitive fading.
- [ ] Build `src/components/learning/networking/StructuredTaskGrader.tsx`:
  - [ ] Clean numerical entry fields for IP dotted-quads and host capacities.
  - [ ] Deterministic regex & integer evaluation.
  - [ ] Targeted misconception feedback cards.
  - [ ] Optional ungraded reflection box with unlockable model explanations.
- [ ] Wire Stages 1–5 into `NetworkingPracticeTaskView.tsx` for `net-04`.
- [ ] Add the assessed Active-Octet transfer task (`10.50.14.73/22` in 3rd octet).
- [ ] Author `tests/tracks/networking-module-4-pilot.test.tsx` verifying Stages 1–5.
- [ ] Run lint, test suite, and commit.

---

## 4. Phase 3 Execution Checklist (QUEUED)

**Goal:** Author and implement the companion Module 5 ARP Protocol Pilot.

- [ ] Write `docs/networking/NETWORKING_MODULE_5_ARP_PILOT_SPEC.md` (v1.0.0):
  - [ ] 5-stage cognitive fading model for ARP.
  - [ ] Queued IP packet waiting for resolution state machine.
  - [ ] Switch Port 1 learning, broadcast flood, non-target inspection, target unicast reply.
  - [ ] Remote-subnet transfer challenge (resolving Default Gateway MAC).
- [ ] Implement event-driven ARP stepper in `NetworkingPracticeTaskView.tsx`.
- [ ] Author unit tests in `tests/tracks/networking-module-5-pilot.test.tsx`.

---

## 5. Phase 4 & Phase 5 Checklist (QUEUED)

- [ ] **Phase 4:** Extract shared components:
  - [ ] `PacketInspector.tsx` (multi-layer before/after hop snapshots with progressive disclosure).
  - [ ] `SubnetBitSlicer.tsx`.
  - [ ] `StructuredTaskGrader.tsx`.
- [ ] **Phase 5:** Curriculum-wide rollout across remaining modules (`net-01`, `net-02`, `net-06`–`net-16`).
- [ ] Implement Virtual Terminal Simulator in Module 14 (`ipconfig`, `ping`, `tracert`, `nslookup`).
- [ ] Re-measure real completion times with novice learners.

---

## 6. Repository Verification Commands

Run these commands in PowerShell from the repository root (`d:\Everything Else\Programming Hero\google ai\sql_learning`):

```powershell
# 1. Typecheck the entire project (must exit 0)
npm run lint

# 2. Run all networking tests (must exit 0)
npx vitest run tests/tracks/networking-

# 3. Run the full test suite (103 files, must exit 0)
npm test

# 4. Check git status (ensure no untracked clutter)
git status -s
```

---

## 7. Master Document Inventory & Cross-References

| Document File | Purpose |
| :--- | :--- |
| [`NETWORKING_EXECUTION_TRACKER.md`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/docs/networking/NETWORKING_EXECUTION_TRACKER.md) | **This document:** Real-time cross-conversation tracker and task checklist. |
| [`NETWORKING_STATUS_AND_DECISION_RECORD.md`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/docs/networking/NETWORKING_STATUS_AND_DECISION_RECORD.md) | The frozen decision record summarizing the 4 debate rounds and immutable choices. |
| [`NETWORKING_MODULE_4_SUBNETTING_PILOT_SPEC.md`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/docs/networking/NETWORKING_MODULE_4_SUBNETTING_PILOT_SPEC.md) | The approved v1.2.0 technical specification for the Module 4 subnetting pilot. |
| [`NETWORKING_CURRICULUM_AUDIT_AND_DEBATE.md`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/docs/networking/NETWORKING_CURRICULUM_AUDIT_AND_DEBATE.md) | The full v2.0 debate analysis, pedagogical consensus, and component blueprints. |
| [`NETWORKING_TRACK_SPECIFICATION_AND_TRACKER.md`](file:///d:/Everything%20Else/Programming%20Hero/google%20ai/sql_learning/docs/networking/NETWORKING_TRACK_SPECIFICATION_AND_TRACKER.md) | The master architecture tracker, concept inventory, and platform integration contracts. |
