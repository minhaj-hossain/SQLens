# Networking Module 1, Day 1: The First Link (Full Specification)

> **Companion Document:** See [`GLOBAL_SPEC.md`](./GLOBAL_SPEC.md) for overarching architectural rules, layout states, tone of voice, and cognitive engine guidelines.

---

## 1. Day 1 Overview & Learning Objectives

- **Topology:** Strictly **2 Computers** (Computer A: `192.168.1.10`, Computer B: `192.168.1.20`) and **1 Copper Cable**.
- **Deferred to Day 2+:** Switches, routers, MAC addresses, ARP tables, subnet masks, default gateways, DNS, request timed out.
- **Time Budget:** 4 concepts, 25 rungs, ~55 minutes total.

### Measurable Objectives (Mastery Checks)
| # | Objective | Proven At | Passing Evidence |
|---|---|---|---|
| **O1** | Explain why two computers need a cable connected at both ends before they can talk | C1 Rung 8 | Reads light and ping result, fixes fault, and completes self-check mentioning both ends. |
| **O2** | Run ping and say what a reply means | C1 Rung 6, C3 Rung 1 | Runs command unaided and identifies who replied. |
| **O3** | Read an address as street plus house, and verify if two computers share a street | C2 Rungs 2 & 4 | Answers street question correctly on new example. |
| **O4** | Explain why a computer with no address or wrong street cannot send | C2 Rung 5 | Diagnoses hidden fault and identifies cause. |
| **O5** | Read ping reply line: who answered and how long it took | C3 Rungs 1 & 2 | Identifies both fields on new reply line. |
| **O6** | Distinguish three results: can't send, nobody has that label, it worked | C3 Rungs 5 & 6 | Correctly sorts three terminal snippets and diagnoses random fault. |
| **O7** | Troubleshoot in dependency order (light ➔ address ➔ ping) and fix multiple faults | C4 Rungs 3 & 5 | Solves 3 helpdesk tickets and justifies fixes with evidence. |

---

## 2. Vocabulary Budget (Strictly 8 Counted Words)

| Term | Introduced At | First-Shown Sentence | Tooltip | My Words Entry |
|---|---|---|---|---|
| **network** | Welcome | A network is computers that can talk to each other. | Two or more computers that can send messages to each other. | Network: computers that can talk to each other. |
| **terminal** | C1 Rung 2 | This black box is the terminal. You type instructions here, called commands. | The window where you type instructions to your computer. | Terminal: the window where you type instructions. |
| **command** | C1 Rung 2 | (Same sentence as terminal) | One instruction you type in the terminal and send with Enter. | Command: one instruction you type, then press Enter. |
| **ping** | C1 Rung 3 | To check if another computer is there, we send it a tiny message that means “are you there?” and wait for an answer. That test is called ping. | A tiny “are you there?” message sent to another computer. If it answers, you get a reply. | Ping: a tiny “are you there?” test. |
| **link light** | C1 Rung 5 | Next to the cable socket is a small light, called the link light. | A small light by the cable socket. It is on only when the cable is connected at both ends. | Link light: ON means the cable is connected at both ends. |
| **IP address** | C2 Rung 1 | That number is your friend's IP address. It is the label that says which computer is which. | A computer's label on a network. Four numbers separated by dots, like 192.168.1.10. | IP address: a computer's label on a network. |
| **time (ms)** | C3 Rung 1 | The word time is how long one round trip took, in milliseconds. A millisecond is a thousandth of a second. | How long your message and its answer took together, in milliseconds. | Time (ms): how long one round trip took. |
| **unreachable** | C3 Rung 3 | Unreachable means your computer looked for that label and found nobody. | Your computer looked for that label on this street and found nobody there. | Unreachable: nobody has that label. |
| **ipconfig** | C3 Rung 4 | To see your own address, type ipconfig. | A command that shows your computer's own network details, including its address. | ipconfig: shows your computer's own address. |

---

## 3. The 4 Concepts Breakdown

### Concept 1: Two Computers Need a Connection (8 Rungs, ~15 min)
*Goal: Test whether two computers are connected, and explain what is missing when they are not.*
- **Rung 1 (State A):** Look at the desk. Unconnected computers.
- **Rung 2 (State B):** Meet the terminal. Click inside to focus; grey ghost suggestion appears.
- **Rung 3 (State B):** Run your first ping. Command halts inside Computer A (NIC buffer). `PING: transmit failed. General failure.`
- **Rung 4 (State B):** Read the failure. Question on `transmit failed` (Transmit means send).
- **Rung 5 (State A):** Plug in the cable. Drag/click to seat plugs. Both link lights turn green (`Light: ON`).
- **Rung 6 (State B):** Test the wire with ping. Ping succeeds with `Reply from 192.168.1.20`.
- **Rung 7 (State A):** What if one end is loose? Prediction: both lights stay OFF.
- **Rung 8 (State F):** Mastery check in your own words. Self-check write and compare with model sentence.

### Concept 2: Every Computer Needs an Address (5 Rungs, ~11 min)
*Goal: Read an address as street plus house, and verify if two computers share a street.*
- **Rung 1 (State A):** Meet the IP address tags above Computer A (`192.168.1.10`) and Computer B (`192.168.1.20`).
- **Rung 2 (State A):** Street and house comparison. First 3 numbers = street (blue band `192.168.1`), last number = house (`10`, `20`).
- **Rung 3 (State C):** A computer with no address. Tag says `not set`. Running ping fails: computer cannot put a return address on the message.
- **Rung 4 (State B):** Different streets cannot talk directly. Computer B moved to `192.168.2.20` (purple band). Direct cable ping fails.
- **Rung 5 (State F):** Mastery check: Spot the street mismatch between `192.168.1.10` and `192.168.2.5`.

### Concept 3: Reading What Ping Tells You (6 Rungs, ~14 min)
*Goal: Read reply times, understand cable queues, spot unreachable errors, and check your own address with ipconfig.*
- **Rung 1 (State B):** Round trip time (`time=1ms`). Stopwatch pill rides the traveling pulse.
- **Rung 2 (State A):** A busy cable makes time bigger. Big file capsules stream across the wire. Ping waits in queue (`time=45ms`). *Slow is not stopped.*
- **Rung 3 (State B):** Nobody has that label (`ping 192.168.1.99`). Computer A asks down the wire; Computer B checks its label and stays silent. Result: `Destination host unreachable`.
- **Rung 4 (State B):** Ask your computer who it is (`ipconfig`). Shows `IPv4 Address: 192.168.1.10`.
- **Rung 5 (State F):** Sort three outputs. Match snippets to `Can't send`, `Nobody has that label`, and `It worked`.
- **Rung 6 (State B):** No-help check. Unassisted diagnosis of a broken link.

### Concept 4: Find the Fault (6 Rungs, ~15 min)
*Goal: Troubleshoot problems in dependency order: ① Cable light ➔ ② Address ➔ ③ Ping.*
- **Rung 1 (State D):** Why order matters. Triage checklist strip introduced: `① Light on? ② Address right? ③ Ping replies?`
- **Rung 2 (State D):** One fault, with the checklist. User ticket: cable loose at friend's end. Fixed in 1 pass.
- **Rung 3 (State D):** Two faults at once. Cable is loose AND address is on the wrong street (`192.168.2.10`). Fixing cable uncovers address issue.
- **Rung 4 (State D):** When the same message has two causes. `transmit failed` appears for loose cable and wrong address; strip reveals the truth.
- **Rung 5 (State D):** Three tickets, no help. Solve 3 workplace tickets using the investigation log.
- **Rung 6 (State E):** Day 1 wrap-up. Day 2 hook: *"Your computer looked for .99, found nobody, and said so. How does a computer find out who has a label?"*

---

## 4. Simplified? Notes & Look Inside Dialogs

### Simplified? Notes (Exact)
- **S1 (C1 Rung 4):** The exact words differ between Windows versions, and on Linux. The meaning is the same: nothing was sent.
- **S2 (C1 Rung 6):** On a fast connection, Windows may show time<1ms instead of time=1ms. It means the same thing: very quick.
- **S3 (C2 Rung 3):** A real computer with no address often gives itself a temporary one. A later day covers that. In this lab, no address means no sending.
- **S4 (C2 Rung 4):** In this lab, two computers on one cable talk only when their first three numbers match. That is true here. A later day explains the full rule, and why it is three numbers in this lab.
- **S5 (C3 Rung 2):** The lab slows things down so you can see them. A real cable moves messages far faster.
- **S6 (C3 Rung 3):** Windows still prints Received = 4 and 0% loss under this result. Ignore that line. Nobody answered. Linux words this message differently.
- **S7 (C3 Rung 4):** On Linux the command is ip a. We show it at the end of Day 1.

### Look Inside Dialogs (Exact)
- **L1 (C1 Rung 5 - Inside the cable):** A network cable holds 8 thin copper wires, twisted together in pairs. The twisting helps stop electrical noise from outside from scrambling your messages.
- **L2 (C1 Rung 6 - Why the light turns on):** Each computer keeps sending a tiny test signal down the cable. The light turns on when a computer hears the other one's signal. That is why both ends must be connected.
- **L3 (C3 Rung 2 - Where a message waits):** When many messages want the cable at once, they line up and go through one after another. Your ping waited its turn. That waiting made time bigger.
- **L4 (C4 Rung 6 - The same test on Linux):** Windows: `ping 192.168.1.20` and `ipconfig`. Linux: `ping -c 4 192.168.1.20` and `ip a`. The `-c 4` means send 4 and stop. Linux ping keeps going until you press Ctrl+C. Both show who answered and how long it took.
