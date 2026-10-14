# Networking Track: Mentor Mode ("Trainer & Disciple") Architecture Specification

> **Document Version:** 2.1.0  
> **Status:** Approved Architecture Contract  
> **Location:** `docs/networking/NETWORKING_MENTOR_MODE_SPEC.md`  
> **Audited against:** repo `main` @ `98ba35c` (Oct 14, 2026)  
> **Companion Document:** `docs/networking/NETWORKING_MENTOR_CURRICULUM_M1_M5.md` (Curriculum & Script Content)

---

## 1. System Invariants & Frozen Constraints

1. **Next.js & Repo Rules:** All mentor components are additive client-side components. No server actions or new routes required. SQL (57 days) and Prisma (14 days) remain untouched.
2. **Third Way Assessment:** Zero free-text input, zero LLM grading, zero 50/50 2-option guessable predictions.
   - Every prediction beat requires $\ge 3$ distinct options with targeted misconception feedback.
   - Predictions must include a paired causal "Why" selector.
3. **5-Stage Cognitive Fading:** Observe $\to$ Complete $\to$ Perform $\to$ Transfer $\to$ Diagnose.
4. **Active Cadence Rule:** A learner must NEVER experience more than 2 consecutive passive (`say` or `point`) beats without an active interaction (`do`, `predict`, or `select`).
5. **Show, Then Name Rule:** A beat may not introduce or use a technical term (`{{term:x}}`) until the stage has revealed its physical or visual counterpart.
6. **Pilot-First Rollout:** `net-03` is piloted and validated first (pure switching engine exists), followed by `net-05` (ARP), then `net-04`, `net-02`, and `net-01`.

---

## 2. Core Data Types

The mentor runtime types reside in `src/types/networking-curriculum.ts`:

```ts
export type MentorPartId = string;

export interface MentorReactions {
  correct?: string[];
  wrong?: Record<string | number, string[]>;
  fallback?: string[];
  hintAfter?: number;
}

export interface MentorBeatBase {
  id: string;
  say?: string[];              // <= 2 bubbles, ~35 words each, may contain {{term:x}}
  reveal?: MentorPartId[];     // Cumulative parts added to stage
  spotlight?: MentorPartId;    // Spotlight ring target, or omit
  stage?: { stepIndex?: number };
}

export type MentorBeat =
  | (MentorBeatBase & { kind: 'say' | 'point' | 'debrief' })
  | (MentorBeatBase & { 
      kind: 'do'; 
      expect: 'transmit' | 'step' | 'select-port' | 'toggle-device' | string;
    })
  | (MentorBeatBase & {
      kind: 'predict';
      options: Array<{
        id: string;
        label: string;
        isCorrect: boolean;
        feedback: string;
        egressPorts?: number[];
      }>;
      whyPrompt?: string;
      whyOptions?: Array<{
        id: string;
        label: string;
        isCorrect: boolean;
        feedback: string;
      }>;
      reactions: MentorReactions;
    })
  | (MentorBeatBase & {
      kind: 'fill';
      fields: Array<{
        id: string;
        label: string;
        expected: string;
        helperText?: string;
      }>;
      reactions: MentorReactions;
    })
  | (MentorBeatBase & {
      kind: 'ticket';
      sceneId: string;
    });

export interface MentorScript {
  moduleId: string;
  conceptId: string;
  tier: 'shadow' | 'call-the-shots' | 'urgent-ticket';
  allowedTerms: string[];
  terms: Record<string, { label: string; part: MentorPartId }>;
  beats: MentorBeat[];
}
```

---

## 3. Simulator Contract: `MentorControllable`

All simulators (`SwitchSimulationLab`, `ArpSimulationLab`, `SubnetBitSlicer`, `EthernetFrameInspector`) implement optional `MentorControllable` props. When omitted, simulators retain their legacy self-directed behavior:

```ts
export interface MentorControllable {
  /** Visible stage elements. When undefined, renders full canvas. */
  visibleParts?: ReadonlySet<string>;
  /** Element ID to highlight; all other elements receive spotlight dimming. */
  spotlight?: string;
  /** Explicit step index for external stepper control. */
  controlledStepIndex?: number;
  /** Callback fired upward when learner triggers a physical control. */
  onAction?: (action: { type: string; payload?: unknown }) => void;
  /** Declarative state overrides for ticket diagnostics. */
  stateOverrides?: Record<string, unknown>;
}
```

---

## 4. Declarative `TicketScene` Architecture

To prevent un-auditable closures, all Stage 5 tickets use declarative state transitions:

```ts
export interface DeclarativePatch<TState> {
  action: 'set-link' | 'set-mtu' | 'reconfigure-interface' | 'transmit-frame';
  target: string;
  value: unknown;
}

export interface TicketScene<TState> {
  id: string;
  title: string;
  symptom: string;
  initialState: TState;
  inspectableComponents: Array<{ id: string; label: string; data: unknown }>;
  diagnosticQuestion: {
    prompt: string;
    options: Array<{ id: string; label: string; isCorrect: boolean; feedback: string }>;
  };
  allowedFixActions: Array<{
    id: string;
    label: string;
    patch: DeclarativePatch<TState>;
    feedbackOnWrong?: string;
  }>;
  isFixed: (state: TState) => boolean;
  verifyTelemetry: (state: TState) => {
    success: boolean;
    pingOutput: string;
    packetLossPercent: number;
    explanation: string;
  };
}
```

---

## 5. View Integration & Progressive Disclosure

In `src/components/learning/ConceptLessonView.tsx`:

```tsx
{theory.mentorScript ? (
  <MentorLessonStage
    moduleId={moduleId}
    concept={concept}
    script={theory.mentorScript}
    onComplete={handleConceptComplete}
  />
) : (
  <>
    <ConceptMentalModel moduleId={moduleId} concept={concept} />
    {/* Existing legacy markdown explanation */}
  </>
)}
```

- When `mentorScript` is present, it mounts the unified 2-pane mentor studio.
- Legacy markdown text remains accessible via an unobtrusive `"Read as text"` disclosure for accessibility.

---

## 6. Component Directory Structure

```
src/components/learning/networking/mentor/
├── MentorLessonStage.tsx       # 2-pane responsive grid (7/12 stage, 5/12 dialogue)
├── MentorDialoguePanel.tsx     # Chat bubbles, reactive feedback, action area
├── SpotlightLayer.tsx          # SVG spotlight mask dimming
├── TermChip.tsx                # Dotted chip with bidirectional hover highlight
├── TicketStudio.tsx            # Unified Stage 5 diagnostic runner
├── useMentorScript.ts          # Pure deterministic reducer
└── index.ts
```

---

## 7. Audit & Validation Invariants

An audit script `scripts/audit-mentor-scripts.ts` runs inside `npm run audit:all` to enforce:
1. **Reveal Invariant:** The `revealed` set is strictly cumulative ($A \subseteq B$ for successive beats).
2. **Show-Then-Name Invariant:** No `{{term:x}}` appears before or without its target element being in `revealed`.
3. **Cadence Invariant:** No more than 2 consecutive `say`/`point` beats exist without an interactive beat.
4. **Third Way Invariant:** All prediction beats contain $\ge 3$ options with authentic misconception explanations and paired "Why" rationale options.
5. **Valid MAC Invariant:** All MAC addresses match `/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/`.
6. **Subnet Math Invariant:** Subnet calculations in scripts match `calculateSubnet()` outputs.
7. **Jargon Blacklist Invariant:** Terms from later modules do not appear in earlier scripts (e.g. `ARP` forbidden in Modules 1–4, `ICMP/DF` forbidden in Modules 1–3).

---

## 8. Phased Execution Plan

| Phase | Milestone | Stop & Report Condition |
| :--- | :--- | :--- |
| **Phase 1** | Types, pure reducer `useMentorScript.ts`, and unit tests | Reducer tests pass 100% |
| **Phase 2** | UI Components (`MentorLessonStage`, `MentorDialoguePanel`, `SpotlightLayer`) | Static rendering clean at 375px & 1280px |
| **Phase 3** | `MentorControllable` props added to `SwitchSimulationLab` | All 40 existing net-03 tests pass |
| **Phase 4** | Pilot `net-03` mentor script authored and wired to `ConceptLessonView` | **Stop and demonstrate running pilot to user** |
| **Phase 5** | Audit script `audit-mentor-scripts.ts` wired to `npm run audit:all` | Audit clean |
| **Phase 6** | Roll out `net-05` (ARP), `net-04` (Subnetting), `net-02`, and `net-01` | Sequential module delivery |
