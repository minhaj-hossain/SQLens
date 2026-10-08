# Prisma Curriculum Pilot Testing Protocol & Falsification Specification

> **Target Standard:** Prisma 5.22 LTS  
> **Status:** Locked-In Pilot Specification  
> **Applicability:** Prisma Learning Fluency Curriculum (Days 1–8 and Milestone Checkpoints 1 & 2)

---

## 1. Executive Summary & Purpose

The purpose of this pilot testing protocol is to empirically falsify or validate the reforms made to the Prisma Learning Fluency curriculum. Prior iterations relied on pattern-matching and starter code completion; this reformed curriculum trains direct **cognitive fluency** through from-scratch daily reps, cumulative hint ladders, and rigorous milestone checkpoints.

To ensure that the curriculum achieves this goal without introducing unteachable cliffs, five non-Prisma developers will complete Days 1–8 uncoached in a structured **Think-Aloud** testing environment. Their interactions are instrumented for friction points, and their performance on Milestone Checkpoints 1 & 2 is measured against three pre-defined, locked-in **falsification thresholds**.

---

## 2. Participant Recruitment & Screening Criteria

### 2.1 Cohort Profile
- **Cohort Size:** 5 participants ($P_1, P_2, P_3, P_4, P_5$).
- **Experience Level:** Junior to Mid-level software engineers (1–3 years experience).
- **Prerequisites:**
  - Familiarity with TypeScript/JavaScript syntax (`async`/`await`, objects, functions).
  - Basic relational database knowledge (SQL `SELECT`, `WHERE`, primary keys, foreign keys).
- **Exclusion Criteria:**
  - Zero prior production experience with Prisma ORM.
  - No prior exposure to Prisma Schema Language (PSL) syntax.
  - Have not completed or reviewed SQLens Prisma curriculum tasks prior to the session.

---

## 3. Think-Aloud Session Protocol

### 3.1 Session Environment
1. **Uncoached Progression:** The researcher acts strictly as a neutral observer and proctor. No hints, coaching, explanations, or leading questions are permitted.
2. **Think-Aloud Directives:** Participants are instructed to continuously verbalize their thoughts:
   - What they expect to happen.
   - Why they are structuring a model or query in a specific way.
   - What they understand from error feedback and compiler diagnostics.
3. **Prompt from Observer:** If a participant remains silent for $>30$ seconds, the proctor issues a standard non-directive prompt: *"Please continue to say out loud what you are thinking or looking for."*
4. **Scope:**
   - Day 1: Why Prisma?
   - Day 2: Setup & Connection
   - Day 3: Models & Constraints
   - Day 4: Relations & Foreign Keys $\rightarrow$ **Milestone Checkpoint 1 (`prisma04-hw-2`)**
   - Day 5: Migrations & Seeding
   - Day 6: Client Lifecycle
   - Day 7: Reading Data
   - Day 8: Filtering & Pagination $\rightarrow$ **Milestone Checkpoint 2 (`prisma08-hw-2`)**

---

## 4. Friction Event Taxonomy & Telemetry

Observer logs and client-side telemetry capture five primary friction event categories:

| Friction Code | Formal Trigger | Significance |
| :--- | :--- | :--- |
| `[STALL]` | **Editor Inactivity $> 45$ seconds** with zero typing, test runs, or active scroll interactions. | Indicates cognitive paralysis or confusing instructions. |
| `[DOC]` | **External tab navigation** or logged search query targeting external documentation (e.g. google.com, prisma.io/docs). | Measures curriculum autonomy vs. external documentation dependency. |
| `[MUTATE]` | **Rapid code edits ($>3$ within 30 seconds)** followed by immediate test runs without reading compiler/validator feedback. | Indicates blind guessing / brute-force pattern hacking rather than model-based debugging. |
| `[HINT_REVEAL]` | Voluntary unlock of Tier 1, 2, or 3 hint ladders on practice tasks. | Tracks scaffolding reliance across the learning trajectory. |
| `[CHECKPOINT_SUBMIT]` | Test execution on Milestone Checkpoints (`prisma04-hw-2`, `prisma08-hw-2`). | Milestone evaluation attempt (pass/fail, duration, error payload). |

---

## 5. The Three Locked-In Falsification Rules

The curriculum passes or fails based on three strictly defined empirical thresholds:

### 5.1 Falsification Rule 1: Checkpoint 1 Composite Indexing Scaffolding
- **Target Task:** Milestone 1 Checkpoint (`prisma04-hw-2` — Catalog & Review Modeling).
- **Core Invariant:** Constructing the composite index `@@index([productId, createdAt])` (or `@@index([productId, createdAt(sort: Desc)])`) on the `Review` model.
- **Time Limit:** 25 minutes.
- **Falsification Threshold:**
  $$\text{Failures} > 1 \text{ of } 5 \text{ participants}$$
  *If 2 or more participants fail to construct the composite index within 25 minutes, Rule 1 is breached.*
- **Mandatory Remediation Action:**
  - Rework Days 3 & 4 curriculum scaffolding.
  - Add an explicit diagnostic drill in Day 3 demonstrating that a single-column index on `createdAt` cannot efficiently satisfy a compound query filtered by `productId` and sorted by `createdAt`.

---

### 5.2 Falsification Rule 2: Checkpoint 2 Cursor Tiebreaker Diagnostic
- **Target Task:** Milestone 2 Checkpoint (`prisma08-hw-2` — Deterministic Feed with Tiebreakers).
- **Core Invariant:** Diagnosing and resolving unstable pagination order caused by identical millisecond timestamps by adding a secondary unique tiebreaker: `orderBy: [{ createdAt: 'desc' }, { id: 'desc' }]`.
- **Falsification Threshold:**
  $$\text{Participants requiring } > 1 \text{ failed attempt to diagnose tiebreaker} > 2 \text{ of } 5$$
  *If 3 or more participants require more than 1 failed attempt to diagnose that identical timestamps cause unstable order, Rule 2 is breached.*
- **Mandatory Remediation Action:**
  - Day 8 must add an explicit "break-it" tiebreaker task immediately preceding the checkpoint.
  - The drill must force learners to reproduce and fix an unstable duplicate-item bug on a 3-item tied feed.

---

### 5.3 Falsification Rule 3: Platform Autonomy & Zero-Search Policy
- **Target Tasks:** Milestone Checkpoints 1 & 2 (`prisma04-hw-2`, `prisma08-hw-2`).
- **Measurement:** Count of external documentation search queries or browser tab departures per participant during checkpoint execution.
- **Falsification Threshold:**
  $$\exists P_i \text{ such that } \text{DocSearches}(P_i, \text{CP1} \cup \text{CP2}) > 3$$
  *If ANY single participant leaves the platform to search Prisma docs more than 3 times during either checkpoint, Rule 3 is breached.*
- **Mandatory Remediation Action:**
  - Expand in-platform quick reference cards and theory concept sidebars.
  - Ensure all 1:1, 1:N, M:N PSL syntax conventions and Prisma cursor pagination parameter signatures are directly accessible from the in-editor reference drawer.

---

## 6. Cohort Evaluation Logic

A cohort run is evaluated by `evaluatePilotCohort(events: PilotEvent[])`:

1. **Calculate Metrics:**
   - CP1 success rate and duration for each participant.
   - CP2 first-attempt diagnosis rate.
   - Total external doc searches during checkpoints for each participant.
   - Total `[STALL]` and `[MUTATE]` friction counts.
2. **Verdict:**
   - **PASSED:** All three falsification rules satisfied ($\text{Rule 1} \land \text{Rule 2} \land \text{Rule 3} = \text{true}$).
   - **FALSIFIED:** Any rule breached; triggers targeted curriculum remediation.
