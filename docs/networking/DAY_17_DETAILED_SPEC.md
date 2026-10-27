# SQLens Networking Track — Day 17 Detailed Specification
## Stage 5: Transport Layer & Core Internet Protocols (Days 14–19)
### Module: `net-17` · TCP: Opening and Closing a Connection (The State Machine)

---

## 1. Pedagogical Intent & Objectives

### Context & Learning Progression
- **Day 16**: Established Layer 4 process addressing via 16-bit Port numbers, the 5-Tuple socket model `(SIP:SPort, DIP:DPort, Proto)`, and closed port rejection (TCP RST vs ICMP Port Unreachable).
- **Day 17 (This Module)**: Dives into the **TCP Connection Lifecycle (RFC 793 / RFC 9293)**.
  - Understand why IP (connectionless, unreliable) requires an explicit state machine for ordered reliability.
  - Master the **3-Way Handshake (`SYN` → `SYN-ACK` → `ACK`)**: Initial Sequence Number (ISN) synchronization, receive window announcement, and state transitions (`LISTEN` → `SYN_SENT` / `SYN_RECEIVED` → `ESTABLISHED`).
  - Master the **4-Way Teardown (`FIN` → `ACK` → `FIN` → `ACK`)**: Full-duplex half-closed states (`FIN_WAIT_1`, `CLOSE_WAIT`, `FIN_WAIT_2`, `LAST_ACK`).
  - Demystify the **`TIME_WAIT` state & 2MSL timer**: Why an active closing host must linger in `TIME_WAIT` for 60–120 seconds to guarantee connection termination and eliminate stray duplicate segments.

### Key Pedagogical Constraints
- **Zero Analogies Policy**:
  - STRICTLY FORBIDDEN: Metaphors (no telephone call "hello, can you hear me? Yes, can you hear me? Yes", no handshakes between people, no contract signings).
  - MANDATORY: Exact physical & digital realities: 32-bit Sequence Numbers (`seq`), 32-bit Acknowledgment Numbers (`ack`), 1-bit TCP control flags (`SYN`, `ACK`, `FIN`, `RST`), RFC 6528 pseudo-random ISN generation, OS kernel socket buffers, full-duplex byte stream isolation, 2MSL timer (Maximum Segment Lifetime), and kernel state transitions.
- **Taught Before Tested**:
  - Motivate 32-bit sequence number synchronization before testing the SYN handshake.
  - Explain why 3 packets are mandatory (preventing 2-way handshake deadlock/ghost connections) before showing established sockets.
  - Explain full-duplex independent termination before walking through the 4-way FIN sequence.
  - Explain the 2MSL drain invariant before showing `TIME_WAIT` sockets.
- **Task Hint Policy**: Omit `(tap it to fill the terminal).` and end all task instructions with a clean period.

---

## 2. Module Identity & Metadata

```typescript
export const NET_17_MODULE: NetworkingModule = {
  id: 'net-17',
  dayNumber: 17,
  title: 'Day 17 · TCP: Opening and Closing a Connection',
  shortTitle: 'TCP: Opening and Closing a Connection',
  steps: [
    // 5 steps: 4 Ideas + 1 Recap
  ],
  staticResponses: {
    // Exact command outputs
  },
};
```

---

## 3. Step-by-Step Curriculum Architecture

### Step 1: Idea 1 of 4 · The Need for State & Sequence Synchronization
- **Group**: `Idea 1 of 4 · Sequence synchronization`
- **Chg**: `Since Day 16: You learned that ports direct packets to application processes. But Internet Protocol (IP) is completely connectionless and stateless—packets can arrive out of order, get duplicated, or disappear. How does TCP create a reliable byte stream over an unreliable network?`
- **Title**: The need for connection state and Initial Sequence Numbers (ISN)
- **What**:
  ```text
  Internet Protocol (IP) operates strictly on best-effort datagram delivery. It has no memory: each IP packet is routed independently, with no awareness of past or future packets.

  To provide applications with an ordered, error-free byte stream, the Transmission Control Protocol (TCP, RFC 793 / RFC 9293) establishes a Connection.
  A TCP connection is not a physical circuit or a dedicated wire; it is synchronized state maintained in the operating system kernel memory of both endpoints.

  The 20-Byte TCP Header:
  Inside every TCP segment, immediately following the 16-bit Source and Destination Ports, lie two critical 32-bit counters:
  1. Sequence Number (32 bits): Identifies the exact byte position in the sender's data stream.
  2. Acknowledgment Number (32 bits): Confirms the next byte the receiver expects to receive.
  3. Control Flags (6 bits): Single-bit switches, including SYN (Synchronize), ACK (Acknowledge), FIN (Finish), and RST (Reset).

  The Initial Sequence Number (ISN):
  When establishing a new connection, TCP does NOT start counting bytes from 0!
  If both endpoints started at seq=0, a delayed duplicate packet from an old, closed connection could wander into a new connection sharing the same 5-tuple and corrupt the application data.
  To prevent this, the OS kernel generates a pseudo-random 32-bit Initial Sequence Number (ISN) based on a cryptographic clock (RFC 6528).

  Before a single byte of application payload can be transmitted, both hosts must exchange and synchronize their respective ISNs.

  Let’s initiate a TCP connection from PC1 to our Web Server and inspect the outgoing SYN segment.
  ```
- **Why**: Explains why state synchronization is required before data transfer and clarifies why sequence numbers start at random 32-bit values instead of zero.
- **Pic**: `TCP segment header diagram detailing 32-bit Sequence Number, 32-bit Acknowledgment Number, and 1-bit Control Flags (SYN, ACK, FIN, RST).`
- **Task**: `Send an initial TCP synchronization segment using tcp connect 198.51.100.10:80.`
- **Cmd**: `tcp connect 198.51.100.10:80`
- **Read**:
  - `['TCP Control Flags', 'SYN=1, ACK=0, FIN=0, RST=0 (Connection Initiation Request)']`
  - `['Client ISN (Sequence)', 'seq = 1000 (Randomized 32-bit client byte anchor)']`
  - `['Acknowledgment Field', 'ack = 0 (Unset; no incoming stream acknowledged yet)']`
  - `['Client State Transition', 'CLOSED → SYN_SENT (Kernel awaits server acknowledgment)']`
- **Rem**: `TCP establishes synchronized kernel state between endpoints; sequence numbers start at a randomized 32-bit ISN to prevent duplicate segment corruption.`

---

### Step 2: Idea 2 of 4 · The 3-Way Handshake & State Machine
- **Group**: `Idea 2 of 4 · The 3-way handshake`
- **Chg**: `PC1 sent a SYN with seq=1000 and entered SYN_SENT. Now let’s examine how the server responds, and why exactly three packets are physically necessary to open a reliable connection.`
- **Title**: SYN → SYN-ACK → ACK: Why three packets are mandatory
- **What**:
  ```text
  The fundamental law of TCP connection setup is the 3-Way Handshake:

  Packet 1: Client → Server [SYN]
  • Flags: SYN=1, ACK=0
  • Sequence: seq = ISN_c (e.g. 1000)
  • Meaning: "Client wishes to connect. My stream starts at byte 1000."
  • Client state: CLOSED → SYN_SENT.

  Packet 2: Server → Client [SYN, ACK]
  • Flags: SYN=1, ACK=1
  • Sequence: seq = ISN_s (e.g. 5000) — Server announces its own random ISN!
  • Acknowledgment: ack = 1001 (ISN_c + 1) — Confirms receipt of the client's SYN!
  • Meaning: "I acknowledge your byte 1000. My stream starts at byte 5000."
  • Server state: LISTEN → SYN_RECEIVED.

  Packet 3: Client → Server [ACK]
  • Flags: SYN=0, ACK=1
  • Sequence: seq = 1001
  • Acknowledgment: ack = 5001 (ISN_s + 1) — Confirms receipt of the server's SYN!
  • Meaning: "I acknowledge your byte 5000. Connection established."
  • Client & Server states: SYN_SENT / SYN_RECEIVED → ESTABLISHED!

  Why Couldn't We Use a 2-Way Handshake?
  Suppose TCP only used 2 packets (SYN and SYN-ACK). If the server sends SYN-ACK, the server would have to allocate memory buffers immediately. But in a network where packets get delayed:
  • An old, duplicate SYN arrives at the server.
  • The server replies SYN-ACK and assumes the connection is open!
  • But the client never requested it, so it ignores the SYN-ACK.
  • The server is left with a "ghost" half-open connection wasting memory!
  The 3rd packet (ACK from the client) proves to the server that the client is actually alive and capable of receiving traffic.

  Let’s inspect the active kernel socket table to verify the ESTABLISHED state.
  ```
- **Why**: Deconstructs why two-way handshakes fail in distributed systems and shows exact sequence/acknowledgment increments during setup.
- **Pic**: `Three-step ladder diagram showing SYN (seq=1000), SYN-ACK (seq=5000, ack=1001), and ACK (seq=1001, ack=5001) transitioning sockets to ESTABLISHED.`
- **Task**: `Inspect active TCP socket states using ss -tan state established.`
- **Cmd**: `ss -tan state established`
- **Read**:
  - `['Packet 1 (SYN)', 'Client announces ISN_c=1000; enters SYN_SENT']`
  - `['Packet 2 (SYN-ACK)', 'Server announces ISN_s=5000, acknowledges ack=1001; enters SYN_RECEIVED']`
  - `['Packet 3 (ACK)', 'Client acknowledges ack=5001; both endpoints transition to ESTABLISHED']`
  - `['Active Sockets', '192.168.1.10:52101 ↔ 198.51.100.10:80 (ESTABLISHED)']`
- **Rem**: `The 3-way handshake synchronizes both ISNs and proves bidirectional connectivity before buffers are committed.`

---

### Step 3: Idea 3 of 4 · The 4-Way Teardown & Half-Closed State
- **Group**: `Idea 3 of 4 · Connection termination`
- **Chg**: `Data transfer has concluded. Now both hosts must close the connection. Because TCP is full-duplex, closing is fundamentally different from opening.`
- **Title**: FIN → ACK → FIN → ACK: Full-duplex graceful termination
- **What**:
  ```text
  A TCP connection is Full-Duplex: it consists of two independent byte streams running in opposite directions:
  • Outbound stream: Client → Server
  • Inbound stream: Server → Client

  Because each direction is independent, closing one direction does NOT automatically close the other!
  Graceful termination requires a 4-Way Teardown:

  1. Client sends FIN [seq=u, ack=v]:
  • Flags: FIN=1, ACK=1
  • Meaning: "Client has finished transmitting data bytes."
  • Client state: ESTABLISHED → FIN_WAIT_1.

  2. Server replies ACK [ack=u+1]:
  • Meaning: "Server acknowledges client's FIN."
  • Server state: ESTABLISHED → CLOSE_WAIT.
  • Client state: FIN_WAIT_1 → FIN_WAIT_2.
  • Crucial Architectural State: The connection is now Half-Closed! The client can no longer send application bytes, but the server can still transmit remaining data back to the client!

  3. Server finishes and sends FIN [seq=w, ack=u+1]:
  • Meaning: "Server has also finished transmitting data bytes."
  • Server state: CLOSE_WAIT → LAST_ACK.

  4. Client replies ACK [ack=w+1]:
  • Meaning: "Client acknowledges server's FIN."
  • Server state: LAST_ACK → CLOSED (memory released immediately).
  • Client state: FIN_WAIT_2 → TIME_WAIT.

  Notice that the active closer (the client) does not transition directly to CLOSED! It enters the TIME_WAIT state.

  Let’s execute a graceful connection closure and observe the socket teardown sequence.
  ```
- **Why**: Explains the full-duplex nature of TCP where independent byte streams require a 4-step teardown and introduces the half-closed `CLOSE_WAIT` state.
- **Pic**: `Four-step teardown ladder diagram illustrating FIN_WAIT_1, CLOSE_WAIT, FIN_WAIT_2, LAST_ACK, and transition into TIME_WAIT.`
- **Task**: `Terminate the connection using tcp close 198.51.100.10:80.`
- **Cmd**: `tcp close 198.51.100.10:80`
- **Read**:
  - `['Step 1 (Client FIN)', 'Client announces end-of-data; transitions to FIN_WAIT_1']`
  - `['Step 2 (Server ACK)', 'Server acknowledges FIN; transitions to CLOSE_WAIT (Half-Closed)']`
  - `['Step 3 (Server FIN)', 'Server finishes queued transmission; transitions to LAST_ACK']`
  - `['Step 4 (Client ACK)', 'Client acknowledges server FIN; transitions to TIME_WAIT']`
- **Rem**: `TCP teardown requires 4 steps because connections are full-duplex; each direction must be terminated independently.`

---

### Step 4: Idea 4 of 4 · The TIME_WAIT State & The 2MSL Timer
- **Group**: `Idea 4 of 4 · The TIME_WAIT invariant`
- **Chg**: `The server received our final ACK and closed. But on our client machine, the socket lingers in TIME_WAIT for 60 to 120 seconds. Why does the operating system refuse to immediately destroy the socket?`
- **Title**: Why TIME_WAIT exists: The 2MSL safety timer
- **What**:
  ```text
  When a host initiates an active close, its socket remains in TIME_WAIT for a duration equal to 2MSL (Maximum Segment Lifetime, RFC 793).
  In modern Linux systems, MSL is defined as 30 or 60 seconds, meaning TIME_WAIT lasts 60 to 120 seconds.

  Engineers often ask: "Why waste resources keeping a closed socket in memory?"
  TIME_WAIT is mandatory for two physical network realities:

  1. Reliability: Guaranteeing the Final ACK Was Received
  Suppose the client's final ACK (Step 4) is dropped by an intermediate router.
  • The server's retransmission timer fires, and the server resends its FIN!
  • If the client had immediately transitioned to CLOSED, it would have no record of the connection. When the server's duplicate FIN arrived, the client kernel would reply with TCP RST (Reset), indicating an unexpected packet!
  • The server application would report a "Connection reset by peer" error instead of a clean, graceful shutdown.
  Because the client stays in TIME_WAIT, it can re-transmit the final ACK if it sees another FIN.

  2. Safety: Preventing Stray Segment Cross-Talk
  IP packets can be delayed in router queue buffers across the internet for dozens of seconds.
  Suppose the client immediately closed and immediately opened a new connection to the same server using the exact same ephemeral port (reusing the 5-tuple).
  If a delayed duplicate packet from the old connection suddenly emerged from the network, the new connection would accept it as valid data, corrupting the application payload!
  The 2MSL duration ensures all delayed segments belonging to the previous connection have expired and dropped out of the internet before the 5-tuple can be reused.

  Let’s inspect our client’s TIME_WAIT socket and its countdown timer.
  ```
- **Why**: Solves one of the most persistent interview questions and production troubleshooting dilemmas in backend engineering (TIME_WAIT socket exhaustion).
- **Pic**: `2MSL timeline diagram showing how the TIME_WAIT buffer absorbs retransmitted FINs and guarantees stray delayed IP packets expire.`
- **Task**: `Inspect sockets in the TIME_WAIT state using ss -tan state time-wait.`
- **Cmd**: `ss -tan state time-wait`
- **Read**:
  - `['Socket State', 'TIME_WAIT (Active close initiated by client)']`
  - `['Duration (2MSL)', '2 × Maximum Segment Lifetime = 60 seconds countdown']`
  - `['Purpose 1 (Reliability)', 'Retransmits final ACK if server re-sends FIN']`
  - `['Purpose 2 (Safety)', 'Drains delayed duplicate packets from network before 5-tuple reuse']`
- **Rem**: `The 2MSL TIME_WAIT state guarantees that the peer received the final ACK and prevents delayed duplicate segments from corrupting future connections.`

---

### Step 5: Recap · The Four Core Rules of the TCP Lifecycle
- **Group**: `Recap`
- **Title**: The four rules of TCP connection management
- **What**:
  ```text
  TCP provides ordered, full-duplex reliability on top of unreliable IP networks. By governing connection opening with the 3-way handshake and termination with the 4-way teardown and TIME_WAIT timer, TCP guarantees data integrity across the global internet.
  ```
- **Why**: Consolidates the TCP state machine before exploring sequence numbering, sliding windows, and reliable retransmission in Day 18.
- **Pic**: `Master TCP lifecycle state machine diagram displaying CLOSED → SYN_SENT → ESTABLISHED → FIN_WAIT_1 → FIN_WAIT_2 → TIME_WAIT → CLOSED.`
- **Task**: `Review the four fundamental rules of TCP connection establishment and teardown.`
- **Cmd**: `null`
- **Read**:
  - `['1. State Synchronization', 'Randomized 32-bit ISNs synchronize byte counters before payload transmission']`
  - `['2. 3-Way Handshake', 'SYN → SYN-ACK → ACK proves bidirectional reachability and commits kernel buffers']`
  - `['3. 4-Way Teardown', 'Full-duplex channels close independently; CLOSE_WAIT allows half-closed draining']`
  - `['4. 2MSL TIME_WAIT', 'Lingers 60–120s to ensure clean peer closure and prevent stray packet corruption']`
- **Rem**: `TCP state transitions guarantee synchronized byte tracking and safe connection teardown.`

---

## 4. Static Terminal Responses & Aliases

```typescript
staticResponses: {
  'tcp connect 198.51.100.10:80':
    'Initiating TCP 3-Way Handshake to 198.51.100.10:80...\n' +
    '----------------------------------------------------------------------\n' +
    '[1] OUTBOUND:  192.168.1.10:52101 → 198.51.100.10:80 [SYN]  seq=1000 ack=0 win=65535\n' +
    '    Socket state: CLOSED → SYN_SENT\n' +
    '[2] INBOUND:   198.51.100.10:80 → 192.168.1.10:52101 [SYN, ACK] seq=5000 ack=1001 win=65535\n' +
    '    Socket state: SYN_SENT → SYN_RECEIVED (Server acknowledges ISN_c)\n' +
    '[3] OUTBOUND:  192.168.1.10:52101 → 198.51.100.10:80 [ACK]  seq=1001 ack=5001 win=65535\n' +
    '----------------------------------------------------------------------\n' +
    'Connection established. Both endpoints synchronized at Layer 4.',

  'ss -tan state established':
    'Recv-Q  Send-Q     Local Address:Port             Peer Address:Port        State\n' +
    '0       0       192.168.1.10:52101           198.51.100.10:80           ESTABLISHED\n' +
    '----------------------------------------------------------------------\n' +
    'TCP Connection State: ESTABLISHED\n' +
    '  Client Stream:  seq=1001 (Ready to send application data)\n' +
    '  Server Stream:  ack=5001 (Server ISN synchronized)',

  'tcp close 198.51.100.10:80':
    'Initiating TCP 4-Way Teardown for 192.168.1.10:52101 ↔ 198.51.100.10:80...\n' +
    '----------------------------------------------------------------------\n' +
    '[1] OUTBOUND:  192.168.1.10:52101 → 198.51.100.10:80 [FIN, ACK] seq=1001 ack=5001\n' +
    '    Client state: ESTABLISHED → FIN_WAIT_1\n' +
    '[2] INBOUND:   198.51.100.10:80 → 192.168.1.10:52101 [ACK]      seq=5001 ack=1002\n' +
    '    Server state: ESTABLISHED → CLOSE_WAIT  |  Client state: FIN_WAIT_2 (Half-Closed)\n' +
    '[3] INBOUND:   198.51.100.10:80 → 192.168.1.10:52101 [FIN, ACK] seq=5001 ack=1002\n' +
    '    Server state: CLOSE_WAIT → LAST_ACK\n' +
    '[4] OUTBOUND:  192.168.1.10:52101 → 198.51.100.10:80 [ACK]      seq=1002 ack=5002\n' +
    '    Server state: LAST_ACK → CLOSED (Immediate)\n' +
    '    Client state: FIN_WAIT_2 → TIME_WAIT (2MSL timer armed)\n' +
    '----------------------------------------------------------------------\n' +
    'Graceful teardown complete. Client socket entered TIME_WAIT safety state.',

  'ss -tan state time-wait':
    'Recv-Q  Send-Q     Local Address:Port             Peer Address:Port        State        Timer\n' +
    '0       0       192.168.1.10:52101           198.51.100.10:80           TIME_WAIT    timewait (59.4s / 2MSL)\n' +
    '----------------------------------------------------------------------\n' +
    'Kernel Safety Drain Active: Port 52101 locked to prevent delayed segment collision.',

  help:
    'Commands: tcp connect 198.51.100.10:80, ss -tan state established, tcp close 198.51.100.10:80, ss -tan state time-wait, cls, clear, help',
}
```

### Workspace Aliases to Support:
- Step 0: `tcp connect 198.51.100.10:80`, `tcp connect 198.51.100.10`, `connect 198.51.100.10:80`, `curl 198.51.100.10`
- Step 1: `ss -tan state established`, `ss -t state established`, `ss -tan`, `netstat -tan | grep ESTABLISHED`, `ss -t`
- Step 2: `tcp close 198.51.100.10:80`, `tcp close`, `close 198.51.100.10:80`, `tcp disconnect`
- Step 3: `ss -tan state time-wait`, `ss -t state time-wait`, `ss -tan | grep TIME_WAIT`, `show time-wait`, `netstat -tan | grep TIME_WAIT`

---

## 5. Canvas Anti-Overlap Geometry & Layout

### Device Coordinates:
- ViewBox: `0 0 1480 620`
- Top Title Banner: `x=500, y=18, width=480, height=22`
  - Text: `TCP CONNECTION LIFECYCLE · 3-WAY HANDSHAKE & 4-WAY TEARDOWN`
- Devices:
  1. **Client PC1**: `SvgWorkstation` at `x=140, y=220`, IP `192.168.1.10/24`
  2. **Gateway Router R1**: `SvgRouter` at `x=680, y=215`, Port 1 `192.168.1.1`, Port 2 `198.51.100.1`
  3. **Web Server**: `SvgWorkstation` at `x=1220, y=220`, IP `198.51.100.10/24`, Port 80
- Links:
  - Cable 1: `x1=228, y1=250` to `x2=680, y2=250` (`#38bdf8`)
  - Cable 2: `x1=806, y1=250` to `x2=1220, y2=250` (`#38bdf8`)
  - Link labels at `y=190`
- In-Flight Packets:
  - Width $\le \text{span} - 30\text{px}$ to strictly maintain $\ge 15\text{px}$ clearance from device chassis.

### Step-Specific Overlays:
- **Step 0**:
  - In-flight packet badge on Cable 1: `[TCP SYN] seq=1000 ack=0 (ISN_c)`
  - Cards at `y=350`:
    - Card 1 at `(70, 350)`: `TCP HEADER ANATOMY`
    - Card 2 at `(380, 350)`: `ISN SYNCHRONIZATION (RFC 6528)`
    - Card 3 at `(1040, 350)`: `CONNECTIONLESS IP VS STATEFUL TCP`
- **Step 1**:
  - 3-Way Handshake Ladder Diagram in center overhead across `x=460..1020` at `y=70..160`:
    - Step 1: `PC1 → SYN (seq=1000)`
    - Step 2: `← Server: SYN+ACK (seq=5000, ack=1001)`
    - Step 3: `PC1 → ACK (seq=1001, ack=5001)`
  - State Pills above devices:
    - PC1: `ESTABLISHED` (Green)
    - Web Server: `ESTABLISHED` (Green)
  - Cards at `y=350`:
    - Card 1 at `(70, 350)`: `THE 3-WAY HANDSHAKE`
    - Card 2 at `(380, 350)`: `WHY 2-WAY HANDSHAKES FAIL (GHOST CONNECTIONS)`
    - Card 3 at `(1040, 350)`: `SOCKET BUFFER COMMITMENT`
- **Step 2**:
  - 4-Way Teardown Ladder Diagram in center overhead across `x=460..1020` at `y=70..160`:
    - Step 1: `PC1 → FIN+ACK (seq=1001, ack=5001)`
    - Step 2: `← Server: ACK (ack=1002) [CLOSE_WAIT]`
    - Step 3: `← Server: FIN+ACK (seq=5001, ack=1002)`
    - Step 4: `PC1 → ACK (ack=5002) [TIME_WAIT]`
  - Cards at `y=350`:
    - Card 1 at `(70, 350)`: `FULL-DUPLEX TEARDOWN`
    - Card 2 at `(380, 350)`: `THE HALF-CLOSED STATE (CLOSE_WAIT)`
    - Card 3 at `(1040, 350)`: `GRACEFUL VS ABRUPT TERMINATION`
- **Step 3**:
  - TIME_WAIT countdown timer above PC1 at `y=110`:
    - Badge: `TIME_WAIT · 2MSL Timer Active (60s countdown)`
  - Delayed packet drain visualization in center overhead
  - Cards at `y=350`:
    - Card 1 at `(70, 350)`: `THE TIME_WAIT INVARIANT`
    - Card 2 at `(380, 350)`: `WHY 2MSL IS MANDATORY (ACK RESEND & STRAY DRAIN)`
    - Card 3 at `(1040, 350)`: `TIME_WAIT SOCKET EXHAUSTION`
- **Step 4 (Recap)**:
  - Master TCP State Machine cheat sheet displaying the 4 core rules with `cmd: null`.

---

## 6. Verification Checklist
- `src/content/networking/modules/net-17.ts`
- Register in `src/content/networking/index.ts`
- Homepage teaser in `src/components/learning/networking/homepage/NetworkingHomePage.tsx`
- Aliases in `NetworkingWorkspace.tsx`
- Static responses in `NetworkingTerminal.tsx`
- Unit tests in `tests/curriculum/networking-curriculum.test.ts`
- Coordinate tests in `tests/ui/networking-canvas.test.tsx`
- Update `tests/ui/networking-homepage.test.tsx` to assert "17 Days Live"
- Run: `npm test -- tests/curriculum/networking- tests/ui/networking-` and `npx tsc --noEmit`
