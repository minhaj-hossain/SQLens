# Networking Module 2, Day 2: The Shared Wire (Full Build Plan)

> **Companion Document:** Follows all rules, layout states, tone of voice, word limits, and accessibility standards defined in [`GLOBAL_SPEC.md`](./GLOBAL_SPEC.md).

---

## 0. Read this first

**Mission.** Build Day 2 of the networking track: an interactive lab where a beginner, with no mentor and no prior networking background, spends about 1 hours learning how three computers connect through a switch, why hardware MAC addresses exist, how computers find each other with ARP roll calls (broadcasts), and how to troubleshoot a shared local network.

**The hook from Day 1:** *“Your computer looked for .99, found nobody, and said so. How does a computer find out who has a label?”*

### What Day 2 adds to the map

| Topic | Day 1 | Day 2 |
|---|---|---|
| **Topology** | 2 computers, 1 cable | 3 computers (A, B, C) + 1 Switch (4 ports) |
| **Connection** | Direct point-to-point cable | Shared star network through a switch |
| **Addressing** | IP address only (Street + House) | IP address + Hardware badge (**MAC address**) |
| **Address resolution**| Roll call in silence | **ARP** broadcast ("Who has this?") + **ARP table** |
| **Ping outcomes** | Cannot send, Unreachable, Reply | Adds **Request timed out** (sent, but no answer) |
| **Troubleshooting** | 3-step triage (cable, IP, ping) | Expanded triage: port light, ARP table, ping |

---

## 1. Non-negotiable Rules for Day 2

1. **One idea per rung.** Max 2 new counted words per rung.
2. **Never show a tool before it is needed.** The switch appears in Concept 1, Rung 1. The hardware badge inspector appears in Concept 2, Rung 1. The ARP table command (`arp -a`) appears in Concept 3, Rung 2.
3. **Every action has a DO, a WHY, an EXPECT, and a MEANING.**
4. **Card word limits:** Story <= 35 words. Task block (DO, WHY, EXPECT) <= 65 words.
5. **No 3D camera dives or circuit cutaways:** Clean 2D SVG stage animated with Framer Motion.
6. **No shaming words:** `just`, `simply`, `obviously`, `easy`, `trivial`.
7. **Plausible answers only:** The right option is never the longest or most technical.
8. **Automated Term-Gate Test:** Enforces that Day 3+ terms (`router`, `default gateway`, `DNS`, `TCP`, `UDP`, `port numbers`) do not leak into Day 2 card copy.

---

## 2. Learning Goals and Success Checks

| # | The learner can... | Proven at | Passing evidence |
|---|---|---|---|
| **O1** | Explain why three computers need a switch to talk together | C1 Rung 5 | Explains why a single cable cannot link three machines. |
| **O2** | Read a hardware badge (MAC address) and explain why a computer needs both an IP and a MAC | C2 Rung 4 | Distinguishes permanent hardware badge from local street address. |
| **O3** | Explain what a broadcast is and how an ARP roll call works | C3 Rung 3 | Explains why Computer A asks everyone to find who has an IP. |
| **O4** | Read an address book with `arp -a` and match an IP to a MAC badge | C3 Rung 4 | Runs `arp -a` and identifies the dynamic entry. |
| **O5** | Tell apart four ping results: cannot send, unreachable, reply, and request timed out | C4 Rung 2 | Accurately identifies `Request timed out` vs `Destination host unreachable`. |
| **O6** | Troubleshoot a 3-computer shared network without help | C4 Rung 5 | Resolves 3 workplace tickets using the expanded triage method. |

### Time Budget

| Concept | Title | Rungs | Target Time |
|---|---|---|---|
| **1** | Three computers and a switch | 6 | 13 minutes |
| **2** | The hardware badge (MAC address) | 5 | 12 minutes |
| **3** | Asking the room (ARP & the address book) | 6 | 15 minutes |
| **4** | Find the fault on a shared wire | 6 | 15 minutes |
| | **Total** | **23 rungs** | **about 55 minutes** |

---

## 3. Day 2 Vocabulary Budget (7 Counted Words)

Day 2 introduces strictly **7 counted words**. All first-shown sentences use plain language first and the term second.

| Term | Introduced At | First-Shown Sentence (plain words first) | Tooltip | My Words Entry |
|---|---|---|---|---|
| **switch** | C1 Rung 1 | A box with many sockets that connects multiple computers together is called a switch. | A device with numbered ports that connects multiple computers on the same street. | Switch: connects multiple computers together. |
| **MAC address** | C2 Rung 1 | Inside each network card is a permanent hardware badge, called a MAC address. | A computer's permanent hardware identifier, burned in at the factory. | MAC address: permanent hardware badge. |
| **broadcast** | C3 Rung 1 | Sending one message to every computer in the room is called a broadcast. | A message sent to all computers connected to the same switch. | Broadcast: sending to everyone in the room. |
| **ARP** | C3 Rung 2 | The question that asks “who has this IP address?” is called ARP. | The roll call a computer uses to discover who owns an IP address. | ARP: asks who owns an IP address. |
| **ARP table** | C3 Rung 4 | The computer writes down who answered in its local address book, called the ARP table. | A temporary address book matching IP addresses to MAC hardware badges. | ARP table: local address book of IP to MAC. |
| **subnet mask** | C2 Rung 3 | The rule that says which numbers belong to the street is called the subnet mask. | A setting (like 255.255.255.0) that tells your computer how long the street name is. | Subnet mask: tells which numbers are the street. |
| **request timed out** | C4 Rung 2 | Your message left the computer, but nobody replied before time ran out. That result is called request timed out. | Your ping was sent, but the target did not answer before the timer expired. | Request timed out: sent, but no answer came back. |

### Words Day 2 NEVER Uses in Teaching Text
`router`, `default gateway`, `DNS`, `internet`, `TCP`, `UDP`, `port numbers` (layer 4), `VLAN`, `STP`, `DHCP`.
*(If default gateway appears dimmed in `ipconfig`, it retains the Later tooltip).*

---

## 4. The 2D SVG Stage: New Objects and Layout

Wide layout: `viewBox="0 0 1000 620"`.

```
        Computer A                    Computer B                   Computer C
      192.168.1 . 10                192.168.1 . 20               192.168.1 . 30
      [00-1A-..-10]                 [00-1A-..-20]                [00-1A-..-30]
   ┌──────────────────┐          ┌──────────────────┐         ┌──────────────────┐
   │       >_         │          │                  │         │                  │
   └────────┬─────────┘          └────────┬─────────┘         └────────┬─────────┘
        (Port 1)                      (Port 2)                     (Port 3)
            \                            |                            /
             \                           |                           /
              \                 ┌──────────────────┐                /
               ●───────────────●│ [1] [2] [3] [4]  │●──────────────●
                                │   ACCESS SWITCH  │
                                └──────────────────┘
  ═══════════════════════ Street 192.168.1 (Shared Blue Band) ══════════════════════
  ───────────────────────────────────── Desk ───────────────────────────────────────
```

### New Stage Objects
1. **The Switch:** A sleek, low-profile dark box (center, y 400, 240px wide by 60px high) with 4 numbered RJ45 jacks: `[1] [2] [3] [4]`.
2. **Port Activity LEDs:** Above each switch jack, a small 8px LED:
   - Green solid = Link UP (carrier detected).
   - Blinking = Traffic passing through that port.
   - Dark = Unplugged / link DOWN.
3. **Computer C:** Third desktop workstation positioned at x 760 (mirrored, with its own address tag `192.168.1.30` and hardware badge `00-1A-2B-3C-4D-30`).
4. **Three Cables:** Blue Category-6 patch cables linking:
   - Computer A ➔ Switch Port 1
   - Computer B ➔ Switch Port 2
   - Computer C ➔ Switch Port 3
5. **Broadcast Pulse Animation:** A golden ripple pulse that enters Switch Port 1 and fans out to both Port 2 and Port 3 simultaneously.
6. **Hardware Badge Tags:** A secondary monospace pill beneath each IP address tag displaying its factory MAC badge.

---

## 5. Simplified? Notes & Look Inside Dialogs (Day 2)

### Simplified? Notes (Exact)
- **S1 (C1 Rung 2):** Real switches have 8, 24 or 48 ports. This lab uses 4 ports so the screen stays clear.
- **S2 (C2 Rung 2):** MAC addresses are written in hex numbers (0-9 and A-F). Day 2 only asks you to match them, not calculate hex.
- **S3 (C2 Rung 3):** 255.255.255.0 means the first three numbers are the street. A later day shows other street lengths.
- **S4 (C3 Rung 2):** ARP roll calls happen automatically in milliseconds. The lab slows it down so you can see who answers.
- **S5 (C3 Rung 4):** Entries in the ARP table expire after a few minutes if no messages are sent.
- **S6 (C4 Rung 2):** Request timed out can also happen if a firewall silently drops your ping.

### Look Inside Dialogs (Exact)
- **L1 (C1 Rung 4 - Inside the switch):** A switch has a microchip that remembers which computer is plugged into each port. It only sends messages to the port that needs them, keeping the other cables quiet.
- **L2 (C2 Rung 1 - Why both IP and MAC?):** Think of MAC as your National ID card (who you are permanently) and IP as your postal address (where you currently live). You need both so messages find your street and verify who receives them.
- **L3 (C3 Rung 3 - What an ARP packet holds):** An ARP question has no regular data. It simply asks: “Who has 192.168.1.20? Tell 192.168.1.10.” Computer B replies with its MAC badge.
- **L4 (C4 Rung 6 - Viewing MAC on Linux):** On Linux, type `ip link` or `cat /sys/class/net/eth0/address` to see your MAC badge. Type `ip neigh` to see your ARP table.

---

## 6. Beat-by-Beat Concept Ladder

```
┌────────────────────────────────────────────────────────────────────────┐
│  CONCEPT 1: THREE COMPUTERS AND A SWITCH (6 rungs, ~13 min)            │
└────────────────────────────────────────────────────────────────────────┘
```
*Hook: How do more than two computers connect?*
*New word: `switch`*

- **Rung 1 (State A): A third computer arrives.**
  - **LOOK:** Look at Computer C on the far right.
  - **STORY:** A teammate joined your desk. Now there are three computers. A single cable can only connect two machines.
  - **Your turn:** none (reading).
  - **Next:** How do three computers connect?

- **Rung 2 (State A): Meet the switch.**
  - **LOOK:** Look at the small box in the middle of the desk.
  - **STORY:** A box with many sockets that connects multiple computers together is called a switch. It has four numbered ports.
  - **DO:** Click the switch box to inspect its ports.
  - **WHY:** To see where each cable connects.
  - **EXPECT:** Port 1, Port 2, Port 3, and Port 4 glow.
  - **MEANING:** Each computer gets its own cable into the switch.

- **Rung 3 (State A): Plug all three computers in.**
  - **LOOK:** Look at the loose cables on the desk.
  - **STORY:** Each computer needs a cable connected to the switch.
  - **DO:** Click or drag cables to connect Computer A to Port 1, B to Port 2, and C to Port 3.
  - **WHY:** To complete the physical link for all three machines.
  - **EXPECT:** All three port LEDs light up solid green.
  - **MEANING:** All three computers are physically linked through the switch.

- **Rung 4 (State B): Ping through the switch.**
  - **LOOK:** Look at Computer B (`192.168.1.20`).
  - **STORY:** Computer A can now send messages to Computer B through the switch.
  - **DO:** Type `ping 192.168.1.20` and press Enter.
  - **WHY:** To test reachability across the switch.
  - **EXPECT:** `Reply from 192.168.1.20: bytes=32 time=1ms`.
  - **MEANING:** The switch forwarded your ping directly to Computer B.

- **Rung 5 (State A): Prediction: Does Computer C see the ping?**
  - **LOOK:** Look at Computer C on Port 3 while Computer A pings Computer B.
  - **STORY:** Computer A sent a message meant only for Computer B.
  - **Question:** Did the ping message travel across Computer C's cable?
  - **Options:**
    - `[A]` (Correct) No. The switch sends it only to Computer B.
    - `[B]` Yes. All messages go to all computers.
  - **Feedback:** Exactly! A switch is smart. It delivers messages only to the computer that needs them, keeping Computer C's wire free.

- **Rung 6 (State F): Mastery check: Why do we need a switch?**
  - **Question:** Why can't three computers talk using only one regular cable?
  - **Options:**
    - `[A]` (Correct) A cable has only two ends, so three computers need a central box with multiple ports.
    - `[B]` Cables only carry electricity in one direction.
    - `[C]` Computer C requires wireless signals.
  - **Next hook:** How does the switch know which machine is which?

---

```
┌────────────────────────────────────────────────────────────────────────┐
│  CONCEPT 2: THE HARDWARE BADGE (MAC ADDRESS) (5 rungs, ~12 min)        │
└────────────────────────────────────────────────────────────────────────┘
```
*Hook: How does a computer know which machine is which on a shared wire?*
*New words: `MAC address`, `subnet mask`*

- **Rung 1 (State A): Meet the hardware badge.**
  - **LOOK:** Look at the badge below each computer's IP address.
  - **STORY:** Inside each network card is a permanent hardware badge, called a MAC address. It was burned in at the factory.
  - **DO:** Read Computer A's hardware badge: `00-1A-2B-3C-4D-10`.
  - **WHY:** Every network card in the world has a unique hardware identity.
  - **EXPECT:** The hardware badge glows amber.
  - **MEANING:** IP is your postal street address; MAC is your physical fingerprint badge.

- **Rung 2 (State A): IP vs MAC comparison.**
  - **LOOK:** Compare the two labels above Computer A.
  - **STORY:** IP addresses can be changed anytime. A MAC address belongs to the physical card and never changes.
  - **Question:** If you move your computer to a new office with a new street, which label changes?
  - **Options:**
    - `[A]` (Correct) The IP address changes to match the new street, but the MAC address stays the same.
    - `[B]` The MAC address changes, but the IP address stays the same.
    - `[C]` Both labels stay identical forever.
  - **Feedback:** Yes! IP is where you live right now. MAC is who you are permanently.

- **Rung 3 (State B): Meet the subnet mask.**
  - **LOOK:** Look at the line `Subnet Mask . . . : 255.255.255.0` in ipconfig.
  - **STORY:** The rule that says which numbers belong to the street is called the subnet mask.
  - **DO:** Run `ipconfig` and find the Subnet Mask line.
  - **WHY:** It tells your computer that the first three numbers (`192.168.1`) are the street.
  - **EXPECT:** The Subnet Mask line is bright and glows.
  - **MEANING:** `255.255.255.0` confirms all three computers are neighbors on the same street.

- **Rung 4 (State A): Understanding check: Postal address vs Badge.**
  - **Question:** Computer A wants to send a message to Computer B. What does it stamp on the outer delivery envelope?
  - **Options:**
    - `[A]` (Correct) Both: Destination IP (the street address) and Destination MAC (the hardware badge).
    - `[B]` Only the computer's nickname.
    - `[C]` Only the switch port number.
  - **Feedback:** Exactly! The network needs the IP to know the street, and the MAC badge to hand it to the exact machine.

- **Rung 5 (State F): Mastery check: Match the terms.**
  - Match:
    - `IP address` ➔ *Where the computer lives on this street.*
    - `MAC address` ➔ *Permanent hardware badge on the network card.*
    - `Subnet mask` ➔ *Rule that defines which numbers belong to the street.*
  - **Next hook:** If Computer A only knows the IP `192.168.1.20`, how does it find Computer B's MAC badge?

---

```
┌────────────────────────────────────────────────────────────────────────┐
│  CONCEPT 3: ASKING THE ROOM (ARP & ADDRESS BOOK) (6 rungs, ~15 min)    │
└────────────────────────────────────────────────────────────────────────┘
```
*Hook: How does Computer A match an IP address to a hardware badge?*
*New words: `broadcast`, `ARP`, `ARP table`*

- **Rung 1 (State A): Shouting to the room (Broadcast).**
  - **LOOK:** Watch the golden pulse leave Computer A.
  - **STORY:** Sending one message to every computer in the room is called a broadcast. The switch sends it out every port.
  - **DO:** Click the Broadcast button on the stage.
  - **WHY:** When you don't know who has a badge, you must ask everyone.
  - **EXPECT:** The pulse lights up Port 2 and Port 3 simultaneously.
  - **MEANING:** A broadcast reaches all machines connected to this switch.

- **Rung 2 (State B): The question called ARP.**
  - **LOOK:** Read the message bubble: *“Who has 192.168.1.20? Tell 192.168.1.10.”*
  - **STORY:** The question that asks “who has this IP address?” is called ARP.
  - **DO:** Run `ping 192.168.1.20` and watch the first step before ping.
  - **WHY:** Computer A cannot send a ping until it learns Computer B's MAC badge.
  - **EXPECT:** An ARP broadcast travels across the switch. Computer C ignores it; Computer B replies.
  - **MEANING:** Computer B replies directly: *“I am 192.168.1.20! My MAC is 00-1A-2B-3C-4D-20.”*

- **Rung 3 (State A): Prediction: Why did Computer C ignore it?**
  - **Question:** Why didn't Computer C answer Computer A's ARP question?
  - **Options:**
    - `[A]` (Correct) Computer C checked its own label (`192.168.1.30`), saw it was not `.20`, and remained silent.
    - `[B]` Computer C's cable is broken.
    - `[C]` Computer C was turned off.
  - **Feedback:** Correct! Only the computer that owns that IP address is allowed to answer an ARP question.

- **Rung 4 (State B): Check your address book (`arp -a`).**
  - **LOOK:** Look at the new command suggestion: `arp -a`.
  - **STORY:** The computer writes down who answered in its local address book, called the ARP table.
  - **DO:** Type `arp -a` and press Enter.
  - **WHY:** To see the list of IP addresses matched to MAC hardware badges.
  - **EXPECT:**
    ```text
    Internet Address      Physical Address      Type
    192.168.1.20          00-1a-2b-3c-4d-20     dynamic
    ```
  - **MEANING:** Computer A remembered Computer B's badge. Next time, it doesn't need to shout!

- **Rung 5 (State A): A silent machine on ARP.**
  - **LOOK:** What happens when you ping `192.168.1.99`?
  - **STORY:** Computer A broadcasts: *“Who has .99?”* Silence. No machine on the switch owns `.99`.
  - **DO:** Run `ping 192.168.1.99`.
  - **WHY:** To observe what happens when ARP gets no reply.
  - **EXPECT:** After 2 seconds of silence, your terminal outputs:
    `Reply from 192.168.1.10: Destination host unreachable.`
  - **MEANING:** Now you know why Day 1 printed unreachable: ARP timed out with no reply!

- **Rung 6 (State F): Mastery check: Explain the roll call.**
  - **Write and compare task:** *“Explain in your own words what happens when Computer A pings a teammate for the very first time.”*
  - **Model sentence:** *“Computer A broadcasts an ARP roll call asking who owns the IP address. The matching computer replies with its MAC hardware badge, and Computer A saves it in its ARP address book.”*
  - **Next hook:** What happens when messages get through, but nobody answers?

---

```
┌────────────────────────────────────────────────────────────────────────┐
│  CONCEPT 4: FIND THE FAULT ON A SHARED WIRE (6 rungs, ~15 min)         │
└────────────────────────────────────────────────────────────────────────┘
```
*Hook: How do we troubleshoot a switch network when something breaks?*
*New word: `request timed out`*

- **Rung 1 (State D): The expanded triage checklist.**
  - **LOOK:** Look at the updated triage strip:
    `① Port lights on? ➔ ② Address & ARP table right? ➔ ③ Ping replies?`
  - **STORY:** On a switch network, check port LEDs first, then verify the ARP table, then ping.
  - **DO:** Review the 3 steps.
  - **WHY:** Physical link at the switch must be green before software tables work.
  - **EXPECT:** Checklist strip unlocks.

- **Rung 2 (State B): Meet Request Timed Out.**
  - **LOOK:** Look at Computer C. Its cable is plugged in, port light is green, and ARP succeeded. But ping fails!
  - **STORY:** Your message reached Computer C, but Computer C did not answer. That result is called `Request timed out`.
  - **Terminal Output:**
    ```text
    Request timed out.
    Request timed out.
    ```
  - **Question:** What is the difference between `Destination host unreachable` and `Request timed out`?
  - **Options:**
    - `[A]` (Correct) `Unreachable` means ARP found nobody with that IP. `Timed out` means the machine was reached, but never answered back.
    - `[B]` They mean the exact same thing.
    - `[C]` `Timed out` means the cable is unplugged.
  - **Feedback:** Yes! `Unreachable` = no one on the street answered the roll call. `Timed out` = the machine is there, but refused or failed to reply.

- **Rung 3 (State D): Ticket #201: Port disconnected at switch.**
  - User says: *“Computer C cannot ping anyone.”*
  - Learner follows checklist:
    - ① Checks Switch Port 3 ➔ Light is OFF!
    - Plugs in cable at Port 3 ➔ Light turns green.
    - Runs ping ➔ Replies arrive.

- **Rung 4 (State D): Ticket #202: Wrong subnet on Computer C.**
  - User says: *“Computer C is plugged into the switch, but cannot reach Computer A.”*
  - Learner follows checklist:
    - ① Port 3 light is ON (physical link OK).
    - ② Runs `ipconfig` on Computer C ➔ IP is `192.168.2.30` (wrong street!).
    - Changes address to `192.168.1.30`.
    - Runs ping ➔ Ping succeeds.

- **Rung 5 (State D): Ticket #203: The silent machine (Unassisted).**
  - Random fault test:
    - Learner investigates using ① Port LED, ② `arp -a`, and ③ `ping`.
    - Learner diagnoses correctly and explains with evidence.

- **Rung 6 (State E): Day 2 Wrap-up.**
  - You can now:
    - Connect multiple computers using a switch.
    - Read MAC hardware badges and understand why we need both IP and MAC.
    - Explain how ARP roll calls find who owns an IP address.
    - Read the ARP table with `arp -a`.
    - Distinguish `Destination host unreachable` from `Request timed out`.
    - Troubleshoot a shared switch network using dependency order.
  - **Tomorrow's Question (Day 3 Hook):**
    *“We can now talk to any computer on our own street. But how do we send a message to a server on a different street, or across the world? (The Default Gateway and Router).”*

---

## 7. Verification Invariants & Testing Contracts

Day 2 build must pass:
1. `networking-day2-termgate.test.ts`: Exactly 4 concepts, 23 rungs, 7 counted words. Card text contains zero mentions of `router`, `gateway`, `DNS`, `internet`, `TCP`, `UDP`.
2. `networking-day2-cockpit.test.tsx`: Tests switch rendering, 3-computer topology, ARP broadcast animation, and ticket resolution.
3. Word limits: Story <= 35 words, Task <= 65 words on every rung.
