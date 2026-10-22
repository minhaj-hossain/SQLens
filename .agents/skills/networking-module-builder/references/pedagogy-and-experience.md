# Pedagogy & Experience Guide for Networking Modules

This document details the exact tone, voice, emotional trajectory, and cognitive load management needed to author SQLens networking days.

---

## 1. Tone and Voice: The Empathetic Senior Engineer

The mentor in SQLens is not an academic lecturer reciting standards. They are a patient, observant senior engineer sitting right beside the student at the workbench.

### Characteristics of the Voice:
- **Warm, Direct, and Plain-Spoken**:
  - *Say*: "Your computer wants to send a message to friend's computer. But right now, there is no wire between them."
  - *Never say*: "The Layer 1 physical medium has not been provisioned between host interfaces."
- **Focus on Cause and Effect**:
  - Every lesson pairs a physical observation with an immediate consequence.
  - "Look at the light: it is OFF. When the light is off, signals cannot leave the computer."
- **Celebrate Detective Work**:
  - When something breaks, it isn't an error or a failure — it is a clue!
  - "No reply came back. Let's read what your computer told you."
- **No Condescension**:
  - Never make the learner feel silly for not knowing terminology. Acknowledge that networking terminology is often confusing and historic, and demystify it with intuitive analogies.

---

## 2. Metaphor System (Proven in Days 1 & 2)

Always maintain consistent, tangible metaphors:

| Technical Concept | Physical Metaphor in SQLens | Why It Clicks |
| :--- | :--- | :--- |
| **IP Address (192.168.1.10)** | **Street Name + House Number** (`192.168.1` is the street, `10` is the house on that street). | Beginners instantly understand why two houses on different streets can't hear each other without a doorway (router). |
| **MAC Address (`00-00-5e-00-53-01`)** | **Physical Hardware Metal Name Tag** stamped on the network card at the factory. | Clear separation between permanent hardware identity and temporary location/street address. |
| **Ethernet Switch** | **A quiet room with numbered socket doors** and an internal port notebook. | Explains why switches only talk to the intended port instead of broadcasting everything once learned. |
| **ARP Request** | **Shouting a roll call to the room** ("Who owns 192.168.1.20? Tell 192.168.1.10!"). | Demystifies why broadcasts hit every port on a switch. |
| **ARP Table** | **Your computer's personal memory notebook** (`arp -a`). | Clarifies that computers remember who they spoke to so they don't have to shout every time. |
| **Link Light (LED)** | **Two people holding hands across a wire**; both must hold on for the light to illuminate. | Immediately teaches that 1 loose cable end disables both lights. |
| **Software Firewall** | **A security guard at the door** who chooses whether to reply to incoming knocks (ICMP echo). | Explains why a ping can time out even when ARP succeeded and the cable is plugged in. |

---

## 3. Emotional Arc of a Day (From Mystery to Mastery)

Every Day module follows this 4-act progression:

```mermaid
journey
    title Learner Emotional Progression through a Day
    section Concept 1: The Barrier
      Curiosity & Intrigue: 4: Learner
      Hands-on exploration: 5: Learner
    section Concept 2: The Mental Model
      The "Aha!" moment: 5: Learner
      Demystifying the inner logic: 4: Learner
    section Concept 3: The Protocol in Motion
      Watching packets travel: 5: Learner
      Connecting the pieces: 5: Learner
    section Concept 4: The Triage Rulebook
      Solving real broken tickets: 5: Learner
      Confidence & Independence: 5: Learner
```

1. **Concept 1 (The Breakdown & Mystery)**:
   - Introduce the new barrier. Learner observes what happens when equipment is missing or disconnected.
   - Learner runs their first test command (`ping` or `arp -a`) and sees the initial diagnostic symptom.
2. **Concept 2 (The Rule of the System)**:
   - Dissect the structure. Why do addresses look this way? What is stored in memory?
   - Hands-on manipulation (editing an address, inspecting name tags).
3. **Concept 3 (The Live Symphony)**:
   - Watch the protocol execute in slow motion across the stage canvas.
   - Trace packet animations from port to port.
4. **Concept 4 (The Helpdesk Workbench)**:
   - 3 realistic customer support tickets:
     - **Ticket 1**: Physical layer fault (e.g. unplugged cable, loose socket).
     - **Ticket 2**: Addressing layer fault (e.g. wrong street, typo in IP).
     - **Ticket 3**: Higher layer / configuration fault (e.g. blocked firewall, missing route).
   - Learner applies the systematic triage checklist to solve every ticket independently.
