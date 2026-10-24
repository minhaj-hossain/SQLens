# SQLens Networking Track — Curriculum & Pedagogical Doctrine

This document serves as the permanent, authoritative pedagogical reference for the **Networking Track** in SQLens. All future modules (Day 7 through Day 35) must strictly follow these pedagogical rules, schemas, and lesson formats.

---

## 1. Core Pedagogical Heart: "Zero Analogies & Physical Reality"

Students do not learn real-world networking by reading stories about mailmen, postboxes, envelopes, or street addresses. They learn by touching the wire, observing the link LEDs, typing terminal commands, seeing packet round-trips, and discovering routing table lookups.

### The Immutable Pedagogical Rules

1. **Zero Analogies Policy**:
   * **Forbidden**: Never use metaphors such as "post office", "envelopes", "apartments", "postcards", "police officers", or "mailboxes".
   * **Mandatory**: Use exact digital and physical terms: packets, frames, byte streams, IP addresses, MAC hardware addresses, routing tables, gateways, next hops, netmasks, broadcast addresses, and CIDR prefixes.
   * Explain *why* the technology works directly in terms of digital devices and electrical/logical networks.

2. **6-Idea Progressive Disclosure**:
   Every Day module is structured into **5 to 6 discrete Ideas** (steps):
   * Each idea introduces **one single concept** at a time.
   * Never introduce two new concepts in the same step.
   * Progressively build the canvas and tables: devices appear or update as concepts unlock.

3. **Consistent TypeScript Schema (`NetworkingStep`)**:
   Every step in `src/content/networking/modules/net-0X.ts` must implement:
   ```typescript
   export interface NetworkingStep {
     num: number;        // Step index (1-based: 1 to 6)
     group?: string;     // Idea badge label (e.g. "Idea 1 of 6 · The direct connection")
     title: string;      // Concise, concrete step title
     concept: string;    // Core explanation (1-2 clear paragraphs, no analogies)
     why: string;        // "Why does it matter?" practical rationale
     pic: string;        // What the learner sees on the canvas
     task: string;       // Actionable learner task
     cmd: string | null; // Exact terminal command to type (or null on recap steps)
     read: [string, string][]; // 2-column breakdown of how to interpret the terminal output
     rem: string;        // The Big Takeaway summary banner
   }
   ```

4. **Task Section Hints ("Tap it to fill")**:
   * For **Day 1 and Day 2**: The lesson sidebar displays `(tap it to fill the terminal).` next to the interactive code snippet to onboard beginners.
   * For **Day 3 onward**: Omit `(tap it to fill the terminal).` because learners already understand that clicking the `<code>` chip pre-fills the terminal input.

5. **Known Pedagogical Pacing & Gaps (Days 1–5 Context)**:
   * **Binary and Hexadecimal**: Day 3 introduces bits and CIDR prefixes. Day 1 MAC addresses use hexadecimal. When introducing later protocols (e.g. IPv6, TCP flags, port bitmasks), remind learners how binary counting maps to byte boundaries.
   * **Broadcast Address (`.255`)**: Introduced in Day 2. Days 7 and 9 (DHCP discovery and ARP broadcast storms) build directly on this: keep the definition exact (a message sent to the broadcast address is received and inspected by every device on that local subnet).
   * **Ping Mechanics**: Ping is introduced in Day 1 as an immediate physical round-trip probe. Ping is formally deconstructed on Day 14 (ICMP Type 8 Echo Request / Type 0 Echo Reply).

---

## 2. Daily Module Format Reference

When creating a new day `net-0X.ts` in `src/content/networking/modules/`:

```typescript
import { NetworkingModule } from '@/types/networking';

export const NET_0X_MODULE: NetworkingModule = {
  id: 'net-0X',
  dayNumber: X,
  title: 'Day X · [Clear Technical Title]',
  summary: '[One sentence explaining the practical networking skill learned today]',
  objectives: [
    '[Objective 1]',
    '[Objective 2]',
    '[Objective 3]',
  ],
  steps: [
    {
      num: 1,
      group: 'Idea 1 of 6 · [Group Name]',
      title: '[Step Title]',
      concept: '[Concept text with zero metaphors]',
      why: '[Why this matters in real networking]',
      pic: '[Canvas observation prompt]',
      task: '[Learner instruction to run command]',
      cmd: '[terminal command]',
      read: [
        ['[Key field 1]', '[What it means]'],
        ['[Key field 2]', '[What it means]'],
      ],
      rem: '[The Big Takeaway]',
    },
    // Steps 2 through 6 follow identical structure
  ],
  staticResponses: {
    '[command]': '[Exact simulated terminal output]',
  },
};
```
