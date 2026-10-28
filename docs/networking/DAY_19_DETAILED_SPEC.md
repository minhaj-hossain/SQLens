# SQLens Networking Track — Day 19 Detailed Specification
## Stage 5: Transport Layer & Core Internet Protocols (Days 14–19)
### Module: `net-19` · UDP: Fast and Simple (Connectionless Transport & Minimal Overhead)

---

## 1. Pedagogical Intent & Objectives

### Context & Learning Progression
- **Day 18**: Mastered TCP reliable delivery (RFC 793, RFC 6298, RFC 5681, RFC 2018)—byte-stream sequence numbers, cumulative ACKs, dynamic RTO estimation with Karn's exponential backoff, Fast Retransmit with SACK blocks, and sliding window flow control.
- **Day 19 (This Module)**: Explores the opposite end of the transport spectrum: **The User Datagram Protocol (UDP, RFC 768)**.
  - Understand why applications intentionally abandon guaranteed reliability in exchange for raw speed, zero connection overhead, and minimal latency.
  - Master the **Minimal 8-Byte UDP Header**: Source Port, Destination Port, Length, Checksum (60% smaller than TCP's 20-byte minimum).
  - Deconstruct **Head-of-Line (HoL) Blocking**: Why TCP stalls an entire data pipeline when an isolated packet drops, and why real-time systems (VoIP, video conferencing, gaming, live sensor telemetry) prefer packet loss over latency.
  - Understand **Stateless Sockets & Multiplexing**: How a single UDP socket receives datagrams from thousands of clients simultaneously without maintaining connection records or state machine buffers.
  - Connect fundamentals to modern production protocols: **Application-layer reliability, Forward Error Correction (FEC), and QUIC / HTTP/3 (RFC 9000)** built entirely on top of UDP.

### Key Pedagogical Constraints
- **Zero Analogies Policy**:
  - STRICTLY FORBIDDEN: Metaphors (no postcards, telegrams, walkie-talkies, mail drops, shouting, Megaphones, delivery trucks).
  - MANDATORY: Exact physical & digital realities: 16-bit Port numbers, 8-byte UDP header, RFC 768, discrete datagram boundaries, Head-of-Line (HoL) blocking, Packet Loss Concealment (PLC), kernel socket receive queues (`SO_RCVBUF`), `UNCONN` socket state, `recvfrom()` address tuples, Forward Error Correction (FEC), and QUIC (RFC 9000).
- **Taught Before Tested**:
  - Motivate the 8-byte header and connectionless transport before issuing datagram transmission commands.
  - Explain the physical mechanics of Head-of-Line blocking before running real-time stream simulations.
  - Explain stateless sockets and `UNCONN` queue buffering before querying socket tables with `ss -uan`.
  - Motivate userspace transport architectures and QUIC multi-streaming before probing HTTP/3 endpoints.
- **Task Hint Policy**: Omit `(tap it to fill the terminal).` and end all task instructions with a clean period.

---

## 2. Module Identity & Metadata

```typescript
export const NET_19_MODULE: NetworkingModule = {
  id: 'net-19',
  dayNumber: 19,
  title: 'Day 19 · UDP: Fast and Simple',
  shortTitle: 'UDP: Fast and Simple',
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

### Step 1: Idea 1 of 4 · The Minimalist Transport Layer & 8-Byte Header
- **Group**: `Idea 1 of 4 · The minimalist transport header`
- **Chg**: `Since Day 18: You saw that TCP guarantees ordered, lossless delivery through sequence numbers, acknowledgments, retransmission timers, and sliding windows. But this reliability costs 20+ bytes of header overhead, 1 RTT setup latency, and head-of-line blocking. What if an application prioritizes speed and low latency over guaranteed delivery?`
- **Title**: The User Datagram Protocol (UDP, RFC 768) and the 8-byte header
- **What**:
  ```text
  The User Datagram Protocol (UDP, RFC 768) is the simplest possible transport layer protocol on the internet.

  Unlike TCP, UDP adds virtually nothing to raw IP datagrams except port addressing and an optional checksum:
  • No connection establishment (no SYN, SYN-ACK, ACK 3-way handshake).
  • No sequence numbers (seq).
  • No acknowledgment numbers (ack).
  • No retransmissions or RTO timers.
  • No flow control or receive windows (win).
  • No congestion control backoff.

  The 8-Byte UDP Header Anatomy:
  While a standard TCP header is at least 20 bytes (often 32–40 bytes with options like SACK and Timestamps), the UDP header is strictly fixed at 8 bytes (64 bits):
  1. Source Port (16 bits / 2 bytes): Identifies the sending application process.
  2. Destination Port (16 bits / 2 bytes): Identifies the receiving application process.
  3. Length (16 bits / 2 bytes): The total byte size of the UDP header plus payload (minimum 8 bytes).
  4. Checksum (16 bits / 2 bytes): End-to-end payload & pseudo-header error detection (optional in IPv4, mandatory in IPv6).

  Datagram Boundaries vs Byte Streams:
  TCP is a continuous byte stream without message boundaries; an application calling write() three times may be received by read() in one giant chunk.
  UDP preserves explicit Datagram Boundaries: each sendto() call produces exactly one discrete UDP datagram, and each recvfrom() call on the socket receives exactly that one datagram.

  Let’s transmit a lightweight UDP datagram from PC1 to our DNS Server and inspect the 8-byte header layout.
  ```
- **Why**: Demystifies why UDP exists by contrasting its fixed 8-byte header and message-boundary preservation against TCP's heavyweight stateful stream.
- **Pic**: `UDP 8-byte header anatomy diagram showing Source Port (2B), Destination Port (2B), Length (2B), Checksum (2B), and application payload.`
- **Task**: `Send a discrete UDP datagram to the DNS server using udp send 198.51.100.53:53 "domain query".`
- **Cmd**: `udp send 198.51.100.53:53 "domain query"`
- **Read**:
  - `['Header Size', '8 bytes (Fixed; 60% smaller than 20-byte TCP)']`
  - `['Connection State', 'None (0 RTT setup latency; immediate transmission)']`
  - `['Message Framing', 'Discrete datagram boundary preserved']`
  - `['Header Fields', 'Source Port, Destination Port, Length, Checksum']`
- **Rem**: `UDP provides minimalist Layer 4 transport in a fixed 8-byte header with zero connection setup overhead and preserved message boundaries.`

---

### Step 2: Idea 2 of 4 · Head-of-Line Blocking & Real-Time Performance
- **Group**: `Idea 2 of 4 · Head-of-Line blocking & real-time latency`
- **Chg**: `UDP sends packets immediately with an 8-byte header. But why would an engineer willingly give up TCP's guaranteed reliability and retransmission?`
- **Title**: Head-of-Line (HoL) blocking and why real-time systems choose packet loss over latency
- **What**:
  ```text
  To understand why modern infrastructure relies on UDP, we must understand the fundamental curse of reliable byte streams: Head-of-Line (HoL) Blocking.

  How TCP Causes Head-of-Line Blocking:
  TCP guarantees strictly in-order byte reassembly.
  If a video conference or multiplayer game stream transmits packets 1, 2, 3, 4, 5, and Packet 2 is dropped by a router:
  • Packets 3, 4, and 5 arrive at the receiver kernel socket buffer, BUT the OS kernel refuses to hand them to the application!
  • The entire application freezes until the sender detects loss via 3 Dup ACKs or RTO, retransmits Packet 2, and Packet 2 traverses the internet.
  • If RTT is 80ms, the entire video or audio stream freezes for 80ms to 200ms.

  Why Real-Time Media Prefers Loss to Latency:
  In VoIP (voice over IP), live video streaming, and competitive gaming:
  • Packet 2 contains audio spoken 100 milliseconds ago or player position from 5 frames ago.
  • If Packet 2 is delayed by 150ms, its data is completely useless! Playing out-of-date audio frames causes jarring echoes or stuttering; rubber-banding game coordinates breaks gameplay physics.
  • Modern audio codecs (such as Opus) use Packet Loss Concealment (PLC) to interpolate and synthesize minor lost audio frames imperceptibly.

  UDP delivers Packets 3, 4, and 5 immediately to the application without waiting for Packet 2. In real-time systems, staleness is far worse than loss.

  Let’s simulate a live audio stream under 10% packet drop and inspect how UDP delivers audio chunks without stalling.
  ```
- **Why**: Explains the physical and mathematical reality of Head-of-Line blocking and why latency-critical applications intentionally accept loss.
- **Pic**: `Comparison timeline showing TCP HoL blocking (queue stalls behind dropped packet #2) vs UDP immediate delivery (packet #2 skipped, packets #3..#5 delivered instantly).`
- **Task**: `Stream real-time audio datagrams and observe latency under packet loss using udp stream --codec opus.`
- **Cmd**: `udp stream --codec opus`
- **Read**:
  - `['Head-of-Line Blocking', '0 ms delay (Packets never queued behind lost segments)']`
  - `['Drop Behavior', 'Packet #2 dropped; Packets #3..#5 delivered without stall']`
  - `['Audio Quality', 'Opus PLC conceals isolated drop; continuous playback']`
  - `['Transmission Latency', 'Immediate 0-RTT frame delivery']`
- **Rem**: `TCP guarantees ordered reliability at the cost of Head-of-Line blocking; UDP eliminates blocking so real-time applications never stall on lost packets.`

---

### Step 3: Idea 3 of 4 · Stateless Sockets & Port Multiplexing
- **Group**: `Idea 3 of 4 · Stateless sockets & multiplexing`
- **Chg**: `UDP delivers packets immediately without blocking. But without a 3-way handshake to bind a connection, how do operating systems manage UDP sockets and direct replies?`
- **Title**: Stateless sockets, socket buffers, and connected UDP sockets
- **What**:
  ```text
  Unlike TCP where every connection maintains an explicit state machine (SYN_SENT, ESTABLISHED, TIME_WAIT) and dedicated send/receive buffers in kernel memory:
  UDP is completely Stateless:
  • The OS kernel maintains no handshake records, sequence counters, or connection timers.
  • A single UDP socket listening on port 53 can receive datagrams from thousands of distinct remote clients simultaneously through a single file descriptor!

  How UDP Multiplexing Works:
  • When a UDP datagram arrives on a network interface, the kernel inspects the 16-bit Destination Port.
  • It places the payload and the sender's source (IP, Port) into the matching socket's receive buffer queue.
  • The application calls recvfrom(&buf, &sender_addr) and immediately reads the sender's address along with the payload.

  Connected UDP Sockets (connect() on UDP):
  Engineers are often surprised to learn that you can call connect() on a UDP socket!
  • On a UDP socket, connect() does NOT transmit any network packets (no SYN)!
  • Instead, it simply sets an OS kernel filter: the socket will only accept incoming datagrams from that specific (IP, Port), and application calls to send() or write() will automatically use that destination without needing sendto().
  • This also allows the kernel to report asynchronous ICMP Port Unreachable errors to the application.

  Let’s inspect our system’s active UDP sockets and buffer queues using ss -uan.
  ```
- **Why**: Clarifies how the OS kernel handles UDP sockets without state machines and introduces the mechanics of `connect()` on datagram sockets.
- **Pic**: `Kernel UDP socket demultiplexing diagram showing multiple incoming datagrams from different source IPs hitting a single port 53 socket buffer.`
- **Task**: `Inspect active UDP sockets and receive buffer queues using ss -uan.`
- **Cmd**: `ss -uan`
- **Read**:
  - `['Socket State', 'UNCONN (Unconnected stateless datagram socket)']`
  - `['Kernel Memory Overhead', 'Negligible (No state machine, timers, or TCBs)']`
  - `['Multiplexing Model', 'Single socket accepts datagrams from any client IP']`
  - `['Queue Behavior', 'Recv-Q holds discrete datagrams; drops on overflow']`
- **Rem**: `UDP sockets are stateless; a single socket can receive datagrams from multiple endpoints without connection control blocks.`

---

### Step 4: Idea 4 of 4 · Application-Layer Reliability & QUIC (HTTP/3)
- **Group**: `Idea 4 of 4 · Modern transport: QUIC & HTTP/3`
- **Chg**: `UDP offers zero overhead and no HoL blocking, but raw UDP has no loss recovery or congestion control. If an application needs both high speed and reliability, what can we do?`
- **Title**: Application-layer reliability, Forward Error Correction, and QUIC (HTTP/3)
- **What**:
  ```text
  Historically, engineers faced a binary trade-off:
  • Choose TCP for reliability, but suffer 3-way handshake RTT latency, TLS round trips, and Head-of-Line blocking.
  • Choose UDP for raw speed, but write your own retransmission logic if you need guaranteed delivery.

  The Modern Solution: Reliability in Userspace over UDP:
  Because UDP imposes zero protocol constraints, applications are free to implement custom, intelligent reliability algorithms in userspace without changing OS kernel code:

  1. Forward Error Correction (FEC):
  • Send redundant parity packets alongside data packets (e.g. 10 data packets + 2 XOR parity packets).
  • If any 1 or 2 packets are dropped, the receiver mathematically reconstructs the lost packets instantly without asking for a retransmission!

  2. QUIC (RFC 9000) & HTTP/3:
  The most revolutionary transport protocol of the past 20 years: Google and the IETF built QUIC on top of UDP.
  Solves TCP's fundamental flaws while running over universal UDP (Port 443):
  • 0-RTT Connection Setup: Combines transport handshake and TLS 1.3 cryptographic handshake into a single flight.
  • Independent Multi-Stream Multiplexing: Eliminates Head-of-Line blocking! If Stream A drops a packet, Stream B and Stream C continue flowing without pausing.
  • Connection Migration: When a smartphone switches from Wi-Fi to 5G cellular, the IP address changes. TCP connections break and must re-handshake; QUIC uses a 64-bit Connection ID that survives IP and port changes without disconnecting!

  Let’s test a modern QUIC / HTTP/3 query over UDP port 443 and verify 0-RTT independent streaming.
  ```
- **Why**: Connects fundamental Layer 4 concepts to cutting-edge production internet protocols (QUIC, HTTP/3, and WebRTC).
- **Pic**: `Comparison diagram showing TCP+TLS (3 RTTs, single stream HoL blocking) vs QUIC over UDP (0-1 RTT, multi-stream isolation, connection ID migration).`
- **Task**: `Probe an HTTP/3 endpoint over UDP using quic probe 198.51.100.10:443.`
- **Cmd**: `quic probe 198.51.100.10:443`
- **Read**:
  - `['Underlying Protocol', 'UDP (Port 443 / RFC 9000 QUIC)']`
  - `['Handshake Latency', '0-RTT / 1-RTT (Transport + TLS 1.3 integrated)']`
  - `['HoL Blocking', 'Stream-level isolation (Stream drop does not stall peers)']`
  - `['Connection Mobility', '64-bit Connection ID survives Wi-Fi → 5G cellular IP change']`
- **Rem**: `QUIC builds multiplexed, encrypted reliability on top of UDP, eliminating TCP's connection latency and head-of-line blocking.`

---

### Step 5: Recap · The Four Core Invariants of UDP & Transport Layer Mastery
- **Group**: `Recap`
- **Title**: The four core invariants of UDP & TCP vs UDP transport comparison
- **What**:
  ```text
  The Transport Layer (Layer 4) provides two distinct philosophical approaches to data transfer:
  1. UDP (Minimalist, Connectionless, Datagrams): Fixed 8-byte header, zero handshake latency, preserved message boundaries, zero Head-of-Line blocking. Ideal for real-time media, DNS, gaming, and custom userspace protocols (QUIC).
  2. TCP (Stateful, Connection-Oriented, Byte Streams): 20+ byte header, 3-way handshake, strict cumulative ACKs, dynamic RTO retransmission, and sliding window flow control. Ideal for file downloads, financial transactions, and web text.
  ```
- **Why**: Synthesizes Stage 5 (Path & Transport: Days 14–19) and sets the stage for Stage 6: Dynamic Routing (Days 20–23).
- **Pic**: `Master Transport Layer comparison cheat sheet contrasting TCP vs UDP across Header size, Connection state, Reliability, Ordering, and Use cases.`
- **Task**: `Review the four fundamental invariants of UDP and transport protocol selection.`
- **Cmd**: `null`
- **Read**:
  - `['1. Minimal Overhead', '8-byte header; no sequence numbers, ACKs, or state machines']`
  - `['2. Zero HoL Blocking', 'Packet loss never freezes subsequent datagrams; ideal for real-time media']`
  - `['3. Datagram Boundaries', 'sendto() preserves discrete message sizes; no byte stream slicing']`
  - `['4. Modern Foundation', 'UDP powers DNS, WebRTC, and HTTP/3 QUIC across the modern internet']`
- **Rem**: `UDP provides lightweight, connectionless transport without head-of-line blocking; modern protocols build userspace reliability on top of UDP.`

---

## 4. Static Terminal Responses & Aliases

```typescript
staticResponses: {
  'udp send 198.51.100.53:53 "domain query"':
    'Transmitting UDP datagram to 198.51.100.53:53...\n' +
    '----------------------------------------------------------------------\n' +
    '[UDP Datagram Header (8 Bytes)]\n' +
    '  Source Port:      52101\n' +
    '  Destination Port: 53 (DNS)\n' +
    '  Length:           20 bytes (8B header + 12B payload)\n' +
    '  Checksum:         0x7a3f (Valid)\n' +
    '[Application Payload (12 Bytes)]\n' +
    '  Query: "domain query" (Preserved as 1 discrete datagram)\n' +
    '----------------------------------------------------------------------\n' +
    'Transmission dispatched. Connection setup latency: 0 ms (0 RTT).',

  'udp send 198.51.100.53:53 domain query':
    'Transmitting UDP datagram to 198.51.100.53:53...\n' +
    '----------------------------------------------------------------------\n' +
    '[UDP Datagram Header (8 Bytes)]\n' +
    '  Source Port:      52101\n' +
    '  Destination Port: 53 (DNS)\n' +
    '  Length:           20 bytes (8B header + 12B payload)\n' +
    '  Checksum:         0x7a3f (Valid)\n' +
    '[Application Payload (12 Bytes)]\n' +
    '  Query: "domain query" (Preserved as 1 discrete datagram)\n' +
    '----------------------------------------------------------------------\n' +
    'Transmission dispatched. Connection setup latency: 0 ms (0 RTT).',

  'udp stream --codec opus':
    'Initiating real-time UDP audio stream (Opus 48 kHz / 20ms frames)...\n' +
    '----------------------------------------------------------------------\n' +
    '[Frame 1] seq_app=1 (len=40B) → Delivered (Latency: 12.4 ms)\n' +
    '[Frame 2] seq_app=2 (len=40B) → DROPPED IN TRANSIT ✕\n' +
    '[Frame 3] seq_app=3 (len=40B) → Delivered immediately! (Latency: 12.8 ms)\n' +
    '[Frame 4] seq_app=4 (len=40B) → Delivered immediately! (Latency: 12.5 ms)\n' +
    '----------------------------------------------------------------------\n' +
    'Head-of-Line Blocking Analysis:\n' +
    '  • TCP Behavior: Frames 3 & 4 would stall in kernel buffer until Frame 2 retransmitted\n' +
    '  • UDP Behavior: Frame 2 skipped; Frames 3 & 4 rendered in real-time\n' +
    '  • Jitter Buffer: Opus Packet Loss Concealment (PLC) masked dropped frame',

  'ss -uan':
    'State       Recv-Q Send-Q    Local Address:Port         Peer Address:Port\n' +
    'UNCONN      0      0         192.168.1.10:52101              0.0.0.0:*\n' +
    'UNCONN      0      0        198.51.100.53:53                 0.0.0.0:*\n' +
    '----------------------------------------------------------------------\n' +
    'UDP Socket Telemetry:\n' +
    '  • State: UNCONN (Stateless; no handshake or TCB memory allocated)\n' +
    '  • Recv-Q: 0 (Datagrams queued for user process read)\n' +
    '  • Peer Address: 0.0.0.0:* (Listens and accepts datagrams from any source)',

  'quic probe 198.51.100.10:443':
    'Connecting via QUIC (HTTP/3) over UDP port 443 to 198.51.100.10:443...\n' +
    '----------------------------------------------------------------------\n' +
    '[1] QUIC Initial Flight: Integrated Transport + TLS 1.3 Handshake (1 RTT)\n' +
    '    Connection ID: 0x4f92c18a3e7b (Client CID)\n' +
    '[2] Multi-Stream Multiplexing:\n' +
    '    • Stream 0 (GET /index.html): Active\n' +
    '    • Stream 4 (GET /style.css): Active\n' +
    '    • Stream 8 (GET /app.js):    Packet dropped (Isolated; Streams 0 & 4 unaffected!)\n' +
    '----------------------------------------------------------------------\n' +
    'QUIC Advantages Confirmed: 0 HoL blocking between streams; mobility-safe CID.',

  help:
    'Commands: udp send 198.51.100.53:53 "domain query", udp stream --codec opus, ss -uan, quic probe 198.51.100.10:443, cls, clear, help',
}
```

### Workspace Aliases to Support:
- Step 0: `udp send 198.51.100.53:53 "domain query"`, `udp send 198.51.100.53:53 domain query`, `udp send 198.51.100.53:53`, `dig @198.51.100.53 example.com`, `dig example.com`, `nslookup example.com 198.51.100.53`
- Step 1: `udp stream --codec opus`, `udp stream`, `stream --codec opus`, `udp stream audio`, `test udp stream`
- Step 2: `ss -uan`, `ss -u -a -n`, `ss -ua`, `netstat -uan`, `ss -u`
- Step 3: `quic probe 198.51.100.10:443`, `quic probe 198.51.100.10`, `curl --http3 https://198.51.100.10`, `quic probe`, `http3 probe`

---

## 5. Canvas Anti-Overlap Geometry & Layout

### Device Coordinates:
- ViewBox: `0 0 1480 620`
- Top Title Banner: `x=500, y=18, width=480, height=22`
  - Text: `UDP: FAST AND SIMPLE · CONNECTIONLESS TRANSPORT & MINIMAL OVERHEAD`
- Devices:
  1. **Client PC1**: `SvgWorkstation` at `x=140, y=220`, IP `192.168.1.10/24`
  2. **Gateway Router R1**: `SvgRouter` at `x=680, y=215`, Port 1 `192.168.1.1`, Port 2 `198.51.100.1`
  3. **Server (DNS / Media / QUIC)**: `SvgWorkstation` at `x=1220, y=220`, IP `198.51.100.53/24`
- Links:
  - Cable 1: `x1=228, y1=250` to `x2=680, y2=250` (`#38bdf8`)
  - Cable 2: `x1=806, y1=250` to `x2=1220, y2=250` (`#38bdf8`)
  - Link labels at `y=190` (`translate(454, 190)` and `translate(1013, 190)`), 60px above cables.

### Center Overhead Diagnostics (`translate(460, 65)`):
- Step 0: 8-Byte UDP Header Anatomy & Datagram Framing card (width 560, height 95)
- Step 1: Head-of-Line Blocking Comparison (TCP Stall vs UDP Continuous Flow) (width 560, height 95)
- Step 2: Stateless Socket Multiplexing & Port 53 Queue card (width 560, height 95)
- Step 3: QUIC over UDP Multi-Stream & Connection Migration Diagram (width 560, height 95)

### In-Flight Packet Badges (Horizontal Cable Span Invariant):
- Cable 1 Span: $680 - 228 = 452\text{px}$. Badge width $340\text{px}$ leaves $(452-340)/2 = 56\text{px}$ clearance on both sides ($\ge 15\text{px}$).
- Cable 2 Span: $1220 - 806 = 414\text{px}$. Badge width $340\text{px}$ leaves $(414-340)/2 = 37\text{px}$ clearance on both sides ($\ge 15\text{px}$).

### Bottom Diagnostic HUD Cards:
- Start strictly at `y=350`, completely clearing the 94px device envelope (`y=220..314`).
- Card 1: `translate(70, 350)` (width 280, height 175)
- Card 2: `translate(380, 350)` (width 620, height 175)
- Card 3: `translate(1040, 350)` (width 380, height 175)
- Step 4 Recap Cards:
  - Card 1: `translate(70, 350)` (width 280, height 185)
  - Card 2: `translate(380, 350)` (width 720, height 185)
  - Card 3: `translate(1130, 350)` (width 280, height 185)

---

## 6. Verification Checklist
- [ ] `docs/networking/DAY_19_DETAILED_SPEC.md` authored.
- [ ] `src/content/networking/modules/net-19.ts` created and exported.
- [ ] `src/content/networking/index.ts` registers `NET_19_MODULE`.
- [ ] `src/components/learning/networking/homepage/NetworkingHomePage.tsx` adds Day 19 teaser.
- [ ] `src/components/learning/networking/canvas/NetworkingCanvas.tsx` adds `net-19` canvas stage.
- [ ] `src/components/learning/networking/workspace/NetworkingWorkspace.tsx` adds Day 19 command aliases.
- [ ] `src/components/learning/networking/terminal/NetworkingTerminal.tsx` adds Day 19 help text and dynamic responses.
- [ ] `tests/curriculum/networking-curriculum.test.ts` validates Day 19 structure.
- [ ] `tests/ui/networking-canvas.test.tsx` and `tests/ui/networking-homepage.test.tsx` pass with anti-overlap guarantees and "19 Days Live".
- [ ] `npm test -- tests/curriculum/networking- tests/ui/networking-` passes 100%.
- [ ] `npx tsc --noEmit` returns 0 errors.
