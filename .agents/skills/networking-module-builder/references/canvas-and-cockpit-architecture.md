# Canvas Stage & Cockpit Architecture Reference

This document provides technical design specifications for the split 62/38 view in SQLens networking modules.

---

## 1. Split Layout Architecture

```text
+-------------------------------------------------------------------------------------------------------+
|  TOP PROGRESS RAIL: Concept Badge • Step Indicator • Time Estimate • My Words Vocabulary Drawer      |
+----------------------------------------------------+--------------------------------------------------+
|                                                    |                                                  |
|  LEFT STAGE CANVAS (62% Desktop Width)             |  RIGHT COCKPIT PANEL (38% Desktop Width)         |
|  - Interactive visual networking hardware          |  - Step Header & Look Observation Strip          |
|  - Sockets with dual LED link status               |  - Structured Story Content with Micro-Cards     |
|  - Cables, switches, routers                       |  - DO / WHY / EXPECT Task Hero Block             |
|  - MAC name tags, IP address banners               |  - Interactive Utility Strips (Firewall/Editor)  |
|  - Animated particle signal packets                |  - Guided Terminal Simulator with Autocomplete   |
|  - Diagnostic tooltips                             |  - Multiple Choice Questions (A/B/C Mixed)       |
|                                                    |  - Back / Continue Action Bar                    |
+----------------------------------------------------+--------------------------------------------------+
```

---

## 2. Dynamic Stage Unfolding (`entryStageState`)

The stage canvas on the left must **never** be static or overloaded with information. It is driven by the active rung's `entryStageState`:

```typescript
export interface EntryStageState {
  // Nodes present on stage (gradually unlocked)
  nodes: {
    yours: { x: number; y: number; active: boolean };
    friends: { x: number; y: number; active: boolean };
    third?: { x: number; y: number; active: boolean };
    switch?: { x: number; y: number; active: boolean; ports: number };
    router?: { x: number; y: number; active: boolean };
  };
  // Physical wiring status
  cables: {
    [cableId: string]: 'connected' | 'loose-on-desk' | 'unplugged';
  };
  // LED link lights next to sockets
  lights: {
    [socketId: string]: 'on' | 'off' | 'blinking';
  };
  // Visual address and name tags (only show when taught!)
  tags: {
    [nodeId: string]: {
      showStreet?: boolean;
      showHouse?: boolean;
      showMac?: boolean;
    };
  };
  // Focused glowing elements to direct attention
  highlight?: string[];
}
```

### Transitioning Canvas Elements
- **Day 1 Concept 1**: Only computers A and B with dark sockets. Rung 6 introduces the cable. Rung 7 shows link lights.
- **Day 1 Concept 2**: Rung 1 reveals the IP address split (blue street band + white house tag).
- **Day 2 Concept 1**: A 4-port switch appears in the middle with ports numbered 1 to 4. Cables connect to ports 1, 2, 3.
- **Day 2 Concept 2**: Metallic MAC badges appear attached to network interface cards.
- **Day 2 Concept 3**: Packets animate across switch ports, highlighting broadcast roll-call vs unicast delivery.

---

## 3. Cockpit Micro-Card Styling System

All text in the cockpit view uses curated typography tokens:

### A. Observation Callout (`look`)
```tsx
{currentRung.look && (
  <div className="text-xs sm:text-[13px] text-zinc-400 leading-relaxed bg-[#18181b]/50 border-l-2 border-zinc-600 pl-3 py-1.5 rounded-r-xl flex items-start gap-2">
    <span className="text-zinc-500 font-mono uppercase text-[10px] tracking-wider font-medium shrink-0 mt-0.5">
      Look:
    </span>
    <span className="font-normal">{currentRung.look}</span>
  </div>
)}
```

### B. Story Content (`StructuredStoryContent`)
Use the `StructuredStoryContent` component:
- Detects numbered diagnostic lists (`1. ... 2. ...`) and sequential step markers (`Step 1: ... Step 2: ...`).
- Wraps each item in a sleek micro-card (`bg-[#161619] border border-white/[0.06] rounded-xl p-3`).
- Formats backtick technical terms (`` `ping` ``, `` `arp -a` ``) with monospace badge badges (`bg-zinc-800 font-mono text-[12px]`).
- Appends `meaningText` with an emerald indicator upon completion.

### C. Hero Action Block (`doText`, `whyText`, `expectText`)
```tsx
<div className="rounded-xl bg-[#18181b]/80 border border-white/[0.06] p-4 space-y-2.5 shadow-sm">
  <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-medium">
    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.4)]" />
    <span>Your turn:</span>
  </div>
  <div className="space-y-2 text-xs sm:text-sm">
    <div className="flex items-start gap-2">
      <span className="font-medium text-emerald-400 font-mono text-[11px] shrink-0 mt-0.5">DO:</span>
      <span className="text-zinc-200 font-normal leading-relaxed">{currentRung.doText}</span>
    </div>
    {currentRung.whyText && (
      <div className="flex items-start gap-2 text-zinc-400 font-normal">
        <span className="font-medium text-zinc-500 font-mono text-[11px] shrink-0 mt-0.5">WHY:</span>
        <span className="leading-relaxed">{currentRung.whyText}</span>
      </div>
    )}
    {currentRung.expectText && (
      <div className="flex items-start gap-2 text-zinc-400 font-normal">
        <span className="font-medium text-zinc-500 font-mono text-[11px] shrink-0 mt-0.5">EXPECT:</span>
        <span className="leading-relaxed">{currentRung.expectText}</span>
      </div>
    )}
  </div>
</div>
```

### D. Utility Strips Above Terminal (Compact Controls)
When providing an interactive hardware control above the terminal:
- Keep it compact (1 or 2 rows max, `p-3 sm:p-3.5 rounded-xl bg-[#141417] border border-white/[0.08]`).
- Use an icon indicator badge (`Shield`, `Network`, `Sliders`).
- Provide real-time status (`Echo Blocked` in amber / `Echo Allowed` in emerald).
- Include direct preset buttons or tactile action toggles.

### E. Multiple-Choice Questions (MCQ) Distribution
- **Never** hardcode `isCorrect: true` at index 0 across all questions.
- Rotate positions across A, B, and C with equal frequency.
- Always include helpful `feedback` strings explaining the physical intuition for both correct and incorrect choices.
