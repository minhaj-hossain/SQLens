# SQLens Networking Track — Day 18 Detailed Specification
## Stage 5: Transport Layer & Core Internet Protocols (Days 14–19)
### Module: `net-18` · TCP: Reliable Delivery (Sequence Numbers, ACKs, Retransmissions & Flow Control)

---

## 1. Pedagogical Intent & Objectives

### Context & Learning Progression
- **Day 17**: Mastered the TCP Connection Lifecycle (RFC 793 / RFC 9293)—Initial Sequence Number (ISN) generation (RFC 6528), the 3-Way Handshake (`SYN` → `SYN-ACK` → `ACK`), why 2-way handshakes fail, the 4-Way Teardown (`FIN` → `ACK` → `FIN` → `ACK`) with half-closed `CLOSE_WAIT`, and the 2MSL `TIME_WAIT` safety drain timer.
- **Day 18 (This Module)**: Dives into the heart of TCP: **Reliable Data Delivery (RFC 793, RFC 6298, RFC 5681, RFC 2018)**.
  - Understand how TCP abstracts an unreliable, packet-dropping IP network into a seamless, ordered byte stream.
  - Master **Byte-Stream Sequence Numbers & Cumulative ACKs**: Why sequence numbers count bytes rather than packets, and the strict cumulative ACK invariant (`ack = seq + length`).
  - Master **Loss Detection via Dynamic RTO & Exponential Backoff**: Jacobson's RTT smoothing algorithm ($SRTT$, $RTTVAR$, $RTO$) and Karn's exponential backoff ($RTO \leftarrow 2 \cdot RTO$) during network congestion.
  - Master **Fast Retransmit & SACK (Selective Acknowledgment)**: How 3 Duplicate ACKs bypass sluggish RTO timers to recover lost segments in 1 RTT, and how RFC 2018 SACK blocks isolate non-contiguous received data.
  - Master **Flow Control & The Advertised Receive Window (`win`)**: How the 16-bit Window field prevents buffer overflow, how Zero Window (`win=0`) halts senders, and how Zero-Window Probes (ZWP) prevent deadlocks via the Persist Timer.

### Key Pedagogical Constraints
- **Zero Analogies Policy**:
  - STRICTLY FORBIDDEN: Metaphors (no envelopes, letters, post offices, postcards, telephone calls, handshakes between people, water pipes, apartments, cars).
  - MANDATORY: Exact physical & digital realities: 32-bit Sequence Numbers (`seq`), 32-bit Acknowledgment Numbers (`ack`), Cumulative ACKs, Jacobson's algorithm ($SRTT$, $RTTVAR$, $RTO$), Karn's exponential timer backoff, 3 Duplicate ACKs rule, Fast Retransmit (RFC 5681), SACK option blocks (RFC 2018), Advertised Receive Window (`win`), OS kernel socket buffers (`SO_RCVBUF`), Zero-Window Probing, and Persist Timers.
- **Taught Before Tested**:
  - Motivate byte-granularity counting before executing payload transmission.
  - Explain RTT variance and Jacobson's algorithm before testing packet loss and retransmission.
  - Explain out-of-order packet signatures and the 3 Duplicate ACKs rule before inspecting socket telemetry.
  - Explain receiver buffer constraints and persist timers before inspecting advertised window metrics.
- **Task Hint Policy**: Omit `(tap it to fill the terminal).` and end all task instructions with a clean period.

---

## 2. Module Identity & Metadata

```typescript
export const NET_18_MODULE: NetworkingModule = {
  id: 'net-18',
  dayNumber: 18,
  title: 'Day 18 · TCP: Reliable Delivery',
  shortTitle: 'TCP: Reliable Delivery',
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

### Step 1: Idea 1 of 4 · Byte-Stream Sequence Numbers & Cumulative ACKs
- **Group**: `Idea 1 of 4 · Sequence numbers & cumulative ACKs`
- **Chg**: `Since Day 17: You mastered opening and closing TCP connections via the 3-way handshake and 4-way teardown. Once the socket is ESTABLISHED, how does TCP guarantee that application payload bytes arrive reliably and in order across an unreliable IP network?`
- **Title**: Byte-stream sequence numbers and cumulative acknowledgments
- **What**:
  ```text
  Unlike lower-layer protocols that operate on discrete frames or packets, TCP provides applications with a continuous, unstructured stream of bytes.

  Byte-Granularity Accounting:
  TCP does NOT number packets (Packet #1, Packet #2). Instead, TCP assigns an explicit 32-bit sequence number to every individual byte of data:
  seq_byte = (ISN + 1 + byte_offset) mod 2^32

  In the 20-byte TCP header:
  • Sequence Number (32 bits): Contains the sequence number of the very first byte carried in that segment's payload.
  • If a sender transmits a payload of L bytes starting at sequence number S, that segment contains payload bytes spanning the range [S, S + L - 1].

  The Cumulative Acknowledgment Invariant:
  When the receiver receives incoming bytes, it confirms receipt using the 32-bit Acknowledgment Number (ack) field.
  Crucially, TCP acknowledgments are strictly Cumulative:
  ack = S + L

  An acknowledgment number of K asserts an unambiguous mathematical guarantee:
  "I have successfully received and buffered all bytes up to K - 1 in unbroken, contiguous order. I am now waiting for byte K."

  Notice the power of this design: if an ACK packet is lost on the return path, but a subsequent ACK with a higher number arrives, the sender knows all preceding bytes arrived safely!

  Let’s transmit an HTTP request payload of 24 bytes ("GET /data HTTP/1.1\r\n\r\n") from PC1 to our Web Server and observe how sequence and acknowledgment numbers advance.
  ```
- **Why**: Explains how TCP achieves byte-granularity tracking over packet-oriented IP networks and introduces the cumulative ACK invariant.
- **Pic**: `Byte stream diagram showing payload bytes 1001..1024 mapping to seq=1001, payload_len=24, and triggering receiver cumulative ack=1025.`
- **Task**: `Transmit an HTTP payload over the established socket using tcp send "GET /data HTTP/1.1".`
- **Cmd**: `tcp send "GET /data HTTP/1.1"`
- **Read**:
  - `['Payload Length', '24 bytes ("GET /data HTTP/1.1\\r\\n\\r\\n")']`
  - `['Sender Sequence', 'seq = 1001 (First byte offset in stream)']`
  - `['Receiver Cumulative ACK', 'ack = 1025 (1001 + 24 = next expected byte)']`
  - `['Byte Tracking Model', 'Byte-level counter (not packet-count based)']`
- **Rem**: `TCP sequence numbers count every individual payload byte; cumulative ACKs confirm unbroken contiguous receipt and request the next expected byte.`

---

### Step 2: Idea 2 of 4 · Packet Loss, Dynamic RTO & Exponential Backoff
- **Group**: `Idea 2 of 4 · Dynamic RTO & timer backoff`
- **Chg**: `Payload was delivered and acknowledged. But what happens if an intermediate IP router drops the segment? The sender never receives an ACK. How does TCP know when to retransmit without flooding the network?`
- **Title**: Packet loss detection: Jacobson's dynamic RTO and Karn's backoff
- **What**:
  ```text
  When an IP router drops a packet due to buffer queue congestion or bit errors, it rarely notifies the sender. TCP must detect loss purely by the absence of an acknowledgment.

  The Retransmission Timer & RTO:
  Every time TCP sends a segment containing data, it starts a Retransmission Timer armed with a Retransmission Timeout (RTO). If the timer fires before an ACK covering that segment arrives, TCP concludes the segment was lost and retransmits it.

  Why Static RTO Fails:
  Internet latency is inherently unpredictable. Across local LANs, Round-Trip Times (RTT) are sub-millisecond; across transcontinental fiber, RTTs exceed 150 ms.
  • If RTO is set too low: TCP fires premature retransmissions for delayed packets, congesting the network with duplicates.
  • If RTO is set too high: TCP stalls throughput for seconds after a real loss event.

  Jacobson's Algorithm (RFC 6298):
  Modern TCP dynamically tracks network latency using Smoothed RTT (SRTT) and RTT Variance (RTTVAR):
  1. Measure Sample RTT (R): Elapsed time between sending a segment and receiving its ACK.
  2. Update Smoothed RTT: SRTT ← (1 - α) · SRTT + α · R  (α = 0.125)
  3. Update RTT Variance: RTTVAR ← (1 - β) · RTTVAR + β · |SRTT - R|  (β = 0.25)
  4. Compute RTO: RTO = SRTT + max(G, 4 · RTTVAR)  (where G is clock granularity)

  Karn's Algorithm & Exponential Backoff:
  If a retransmission timer expires, retransmitting immediately at the same pace could trigger catastrophic "congestion collapse" at the congested bottleneck router.
  • Exponential Backoff: For each consecutive timeout, TCP doubles the RTO: RTO ← min(2 · RTO, RTO_max).
  • Karn-Partridge Rule: Never measure Sample RTT for retransmitted segments, because the sender cannot tell whether an arriving ACK responds to the original transmission or the retransmission!

  Let’s simulate a 100% loss event on the link to observe RTO expiration, retransmission, and exponential timer backoff.
  ```
- **Why**: Explains mathematical loss detection via dynamic RTT estimation and the necessity of exponential backoff during congestion.
- **Pic**: `Timeline diagram showing dropped segment, RTO countdown (200ms), timer expiration, retransmission with doubled RTO (400ms), and eventual ACK.`
- **Task**: `Simulate a dropped segment and observe dynamic RTO retransmission using tcp drop-simulate --loss 100.`
- **Cmd**: `tcp drop-simulate --loss 100`
- **Read**:
  - `['Initial RTO Timer', 'RTO = 200 ms (Calculated: SRTT 40ms + 4×RTTVAR 40ms)']`
  - `['Timer Expiration', 'RTO expired at t=200ms; ACK not received']`
  - `['Retransmission', 'Retransmitted seq=1025 (len=50B) to 198.51.100.10:80']`
  - `['Exponential Backoff', 'RTO doubled to 400 ms (Karn\'s backoff rule)']`
- **Rem**: `TCP calculates dynamic RTO from Smoothed RTT and RTT variance; consecutive timeouts double the timer (exponential backoff) to prevent network collapse.`

---

### Step 3: Idea 3 of 4 · Fast Retransmit & SACK (Selective Acknowledgment)
- **Group**: `Idea 3 of 4 · Fast Retransmit & SACK`
- **Chg**: `RTO timers guarantee recovery, but waiting 200ms to 1 second completely halts high-bandwidth connections. When a stream of multiple packets is in flight and only one packet is lost, can TCP recover immediately without waiting for a timer?`
- **Title**: Fast Retransmit (3 Duplicate ACKs) and Selective Acknowledgment (SACK)
- **What**:
  ```text
  When multiple segments are in flight (pipeline transmission), packet loss exhibits a distinct signature at the receiver.

  The Out-of-Order Signature:
  Suppose the sender transmits 4 segments:
  • Segment 1: seq=1000..1999
  • Segment 2: seq=2000..2999
  • Segment 3: seq=3000..3999
  • Segment 4: seq=4000..4999

  Suppose Segment 2 is dropped by a router, but Segments 3 and 4 arrive safely at the receiver.
  Because TCP ACKs are strictly cumulative, the receiver cannot ACK Segments 3 or 4! It must continue acknowledging the last contiguous byte received: ack=2000.
  RFC 5681: Whenever an out-of-order segment arrives, the receiver MUST immediately generate a Duplicate ACK (Dup ACK) repeating ack=2000.

  The 3 Duplicate ACKs Rule (Fast Retransmit):
  Why wait for 3 Duplicate ACKs?
  Internet paths can reorder packets slightly (e.g. multi-path routing or router queue variations). A single duplicate ACK might just be a packet that arrived 1 millisecond out of order.
  However, receiving 3 Duplicate ACKs in rapid succession is an overwhelming statistical guarantee that Segment 2 was genuinely lost, not merely delayed.
  The sender immediately retransmits Segment 2 without waiting for the RTO timer to expire! This is Fast Retransmit.

  Selective Acknowledgment (SACK, RFC 2018):
  Under standard cumulative ACKs, the sender does not know whether Segments 3 and 4 arrived. In older TCP implementations (Tahoe/Reno), the sender might retransmit Segments 2, 3, and 4 unnecessarily!
  SACK solves this by adding an optional TCP header field: SACK Blocks.
  In each Duplicate ACK, the receiver reports: ack=2000, SACK=[3000-5000].
  The sender sees that bytes 3000–5000 were already safely buffered; it retransmits ONLY the missing gap: bytes 2000–2999!

  Let’s inspect internal socket telemetry to examine SACK negotiated options and fast retransmit counters using ss -ti.
  ```
- **Why**: Explains how TCP recovers from isolated packet drops in a single round-trip time without suffering throughput collapse.
- **Pic**: `Packet ladder diagram showing missing segment #2, three duplicate ACKs with SACK=[3000-5000], immediate Fast Retransmit, and recovery ACK.`
- **Task**: `Inspect TCP internal socket metrics and SACK blocks using ss -ti.`
- **Cmd**: `ss -ti`
- **Read**:
  - `['Fast Retransmit Trigger', '3 Duplicate ACKs (ACK=2000 repeated 3 times)']`
  - `['SACK Option (RFC 2018)', 'SACK Blocks: [3000-5000] (Out-of-order segments isolated)']`
  - `['Gap Retransmission', 'Sender retransmits only missing bytes 2000–2999']`
  - `['Latency Improvement', 'Immediate recovery in 1 RTT (bypassed 200ms RTO timer)']`
- **Rem**: `Three duplicate ACKs trigger Fast Retransmit without waiting for RTO; SACK blocks tell the sender precisely which non-contiguous blocks were received.`

---

### Step 4: Idea 4 of 4 · Flow Control & The Advertised Receive Window
- **Group**: `Idea 4 of 4 · Flow control & receive windows`
- **Chg**: `Reliability guarantees packets arrive, but what if the sender transmits data faster than the receiving application can read it from kernel memory? How does TCP prevent receiver buffer overflow?`
- **Title**: Flow control, the Advertised Receive Window (`win`), and Zero-Window Probes
- **What**:
  ```text
  Every host allocates a finite amount of OS kernel memory for TCP receive buffers (SO_RCVBUF, typically 64 KB to several MB).
  If the sender pushes data at 10 Gbps but the receiver's application (e.g. database query worker or web browser) is busy disk-writing and calls read() slowly, the receive buffer fills up.
  If the buffer overflows, incoming packets must be discarded by the OS kernel, wasting bandwidth and triggering retransmission storms.

  The Advertised Receive Window (win):
  In every TCP header, the receiver advertises its current free buffer space in the 16-bit Window Size (win) field:
  RcvWindow = BufferSize - (BytesReceived - BytesReadByApp)

  The Sliding Window Invariant:
  The sender is legally prohibited from transmitting bytes beyond:
  MaxAllowedByte = LastByteAcked + win

  Zero Window (win=0) & The Persist Timer:
  When the receiver buffer is 100% full, the receiver sends win=0 (Zero Window).
  The sender immediately halts transmission.

  Deadlock Hazard:
  When the receiver application finally reads data and frees space, the receiver sends an ACK with win=65535. But what if that window update packet is dropped by an intermediate router?
  • The sender is waiting for a window update.
  • The receiver assumes the sender already has window credit and waits for data.
  • Result: Permanent connection deadlock!

  Zero-Window Probes (ZWP):
  To eliminate this deadlock, the sender arms a Persist Timer when win=0 is received.
  When the persist timer expires, the sender transmits a 1-byte Zero-Window Probe segment.
  The receiver must reply with an ACK specifying its current window size. If still zero, the sender doubles the persist timer and probes again until window credit reopens.

  Let’s inspect our socket state, window sizes, and active persist timers using ss -tan -o.
  ```
- **Why**: Explains receiver buffer limits, the sliding window constraint, and how zero-window probing prevents deadlock.
- **Pic**: `Sliding window buffer diagram showing Bytes Acknowledged, In-Flight Window, Usable Window, and Zero-Window Probe exchange.`
- **Task**: `Inspect advertised receive windows and zero-window probe timers using ss -tan -o.`
- **Cmd**: `ss -tan -o`
- **Read**:
  - `['Advertised Window (win)', 'win = 65535 bytes (Current receiver buffer credit)']`
  - `['Flow Control Invariant', 'Sender bytes in-flight cannot exceed advertised window']`
  - `['Zero-Window Handling', 'Transmission halts when win=0; Persist Timer armed']`
  - `['Deadlock Prevention', '1-byte Zero-Window Probes force receiver window updates']`
- **Rem**: `The advertised window field (win) bounds sender transmission to receiver free buffer space; zero-window probes prevent receiver deadlock.`

---

### Step 5: Recap · The Four Core Invariants of TCP Reliable Delivery
- **Group**: `Recap`
- **Title**: The four core invariants of TCP reliable delivery
- **What**:
  ```text
  TCP transforms an unreliable, best-effort packet network into an ordered, lossless byte stream through four interlocking mechanisms:
  1. Byte-granularity sequence numbers and cumulative acknowledgments track and confirm every individual byte.
  2. Dynamic RTO calculation (Jacobson's algorithm) and exponential backoff (Karn's algorithm) detect lost segments and prevent network collapse.
  3. Fast Retransmit (3 Duplicate ACKs) and Selective Acknowledgment (SACK) patch missing data gaps within a single round trip without timer stalls.
  4. Advertised receive windows (win) and zero-window probing prevent fast senders from exhausting receiver kernel buffers.
  ```
- **Why**: Synthesizes the core mechanisms of Layer 4 reliability before comparing TCP to UDP in Day 19.
- **Pic**: `Master Layer 4 reliability diagram showing byte stream alignment, RTO timer, SACK gap repair, and sliding window flow control.`
- **Task**: `Review the four fundamental invariants of TCP reliable delivery.`
- **Cmd**: `null`
- **Read**:
  - `['1. Byte-Stream Accounting', 'seq = ISN + offset; ack = next expected contiguous byte']`
  - `['2. Dynamic RTO & Backoff', 'RTO = SRTT + 4×RTTVAR; doubles on loss to prevent congestion collapse']`
  - `['3. Fast Retransmit & SACK', '3 Duplicate ACKs trigger instant 1-RTT gap repair via SACK blocks']`
  - `['4. Receive Window Flow Control', 'win field limits in-flight bytes; Zero-Window Probes eliminate deadlock']`
- **Rem**: `TCP guarantees ordered, lossless delivery through byte-level tracking, dynamic retransmission, SACK gap filling, and window flow control.`

---

## 4. Static Terminal Responses & Aliases

```typescript
staticResponses: {
  'tcp send "GET /data HTTP/1.1"':
    'Transmitting application payload (24 bytes) to 198.51.100.10:80...\n' +
    '----------------------------------------------------------------------\n' +
    '[1] OUTBOUND: 192.168.1.10:52101 → 198.51.100.10:80 [PSH, ACK]\n' +
    '    Sequence:  seq = 1001 (Payload byte range: 1001 .. 1024)\n' +
    '    Length:    24 bytes ("GET /data HTTP/1.1\\r\\n\\r\\n")\n' +
    '[2] INBOUND:  198.51.100.10:80 → 192.168.1.10:52101 [ACK]\n' +
    '    Acknowledgment: ack = 1025 (All 24 bytes received; waiting for byte 1025)\n' +
    '    Window Size:    win = 65535 (Receiver buffer available: 64 KB)\n' +
    '----------------------------------------------------------------------\n' +
    'Delivery confirmed. Sender stream pointer advanced: 1001 → 1025.',

  'tcp drop-simulate --loss 100':
    'Simulating transit link packet loss (100% loss rate)...\n' +
    '----------------------------------------------------------------------\n' +
    '[t=0ms]   OUTBOUND: seq=1025 (len=50B) → Gateway R1 (Dropped in transit!)\n' +
    '          Retransmission timer armed: RTO = 200 ms (SRTT=40ms, RTTVAR=40ms)\n' +
    '[t=200ms] RTO EXPIRED: No ACK received for byte 1025!\n' +
    '          Jacobson loss trigger: Segment marked LOST.\n' +
    '[t=201ms] RETRANSMIT: seq=1025 (len=50B) → 198.51.100.10:80\n' +
    '          Karn\'s Exponential Backoff applied: Next RTO = 400 ms (2 × 200ms)\n' +
    '[t=242ms] INBOUND: ack=1075 (Server confirms receipt of retransmitted bytes)\n' +
    '----------------------------------------------------------------------\n' +
    'Loss recovered via RTO timer. Exponential backoff safely decayed.',

  'ss -ti':
    'State       Recv-Q Send-Q    Local Address:Port         Peer Address:Port\n' +
    'ESTABLISHED 0      0      192.168.1.10:52101       198.51.100.10:80\n' +
    '     cubic wscale:7,7 rto:200 rtt:41.2/1.8 ato:40 mss:1460 rcvspace:65535\n' +
    '     sack opt:sack,timestamps retrans:1/1 dsack:0 dupack:3\n' +
    '     lost:0 reord:0 fackets:0 unacked:0 retrans:0 rcvoopack:2\n' +
    '----------------------------------------------------------------------\n' +
    'Fast Retransmit Telemetry:\n' +
    '  • Duplicate ACKs Received: 3 (ACK=2000 repeated) → Triggered Fast Retransmit\n' +
    '  • SACK Blocks Reported:   [3000-5000] (Out-of-order bytes safely buffered)\n' +
    '  • Recovery Latency:        41.2 ms (1 RTT vs 200ms RTO timeout)',

  'ss -tan -o':
    'State       Recv-Q Send-Q    Local Address:Port         Peer Address:Port    Timer\n' +
    'ESTABLISHED 0      0      192.168.1.10:52101       198.51.100.10:80      timer:(persist,4.8s,0)\n' +
    '----------------------------------------------------------------------\n' +
    'TCP Window & Flow Control Telemetry:\n' +
    '  • Advertised Receive Window (win): 65535 bytes (Free receiver buffer space)\n' +
    '  • Sender Sliding Window Limit:    LastAcked + 65535\n' +
    '  • Zero-Window Handling:          win=0 halts sender; arms Persist Timer\n' +
    '  • Zero-Window Probes (ZWP):       1-byte probe sent every persist interval to prevent deadlock',

  help:
    'Commands: tcp send "GET /data HTTP/1.1", tcp drop-simulate --loss 100, ss -ti, ss -tan -o, cls, clear, help',
}
```

### Workspace Aliases to Support:
- Step 0: `tcp send "GET /data HTTP/1.1"`, `tcp send 'GET /data HTTP/1.1'`, `tcp send GET /data HTTP/1.1`, `tcp send get /data`, `tcp send "get /data"`, `curl http://198.51.100.10/data`, `curl 198.51.100.10/data`, `tcp send "GET /data"`
- Step 1: `tcp drop-simulate --loss 100`, `tcp drop-simulate`, `drop-simulate`, `tcp simulate loss`, `simulate drop`, `tcp drop-simulate --loss`
- Step 2: `ss -ti`, `ss -t -i`, `ss -it`, `ss -ti state established`, `tcp fast-retransmit-test`, `show sack`, `ss -t`
- Step 3: `ss -tan -o`, `ss -tano`, `ss -to`, `ss -tan --options`, `ss -tan`

---

## 5. Canvas Anti-Overlap Geometry & Layout

### Device Coordinates:
- ViewBox: `0 0 1480 620`
- Top Title Banner: `x=500, y=18, width=480, height=22`
  - Text: `TCP RELIABLE DELIVERY · SEQUENCE NUMBERS, ACKS, RTO & FLOW CONTROL`
- Devices:
  1. **Client PC1**: `SvgWorkstation` at `x=140, y=220`, IP `192.168.1.10/24`
  2. **Gateway Router R1**: `SvgRouter` at `x=680, y=215`, Port 1 `192.168.1.1`, Port 2 `198.51.100.1`
  3. **Web Server**: `SvgWorkstation` at `x=1220, y=220`, IP `198.51.100.10/24`, Port 80
- Links:
  - Cable 1: `x1=228, y1=250` to `x2=680, y2=250` (`#38bdf8`)
  - Cable 2: `x1=806, y1=250` to `x2=1220, y2=250` (`#38bdf8`)
  - Link labels at `y=190` (`translate(454, 190)` and `translate(1013, 190)`), 60px above cables.

### Center Overhead Diagnostics (`translate(460, 65)`):
- Step 0: Byte stream mapping and cumulative ACK advance card (width 560, height 95)
- Step 1: Jacobson RTO formula and Karn's exponential backoff card (width 560, height 95)
- Step 2: SACK option blocks and 3 Duplicate ACKs Fast Retransmit ladder (width 560, height 95)
- Step 3: Sliding window buffer allocation and zero-window probe card (width 560, height 95)

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
- [ ] `docs/networking/DAY_18_DETAILED_SPEC.md` authored.
- [ ] `src/content/networking/modules/net-18.ts` created and exported.
- [ ] `src/content/networking/index.ts` registers `NET_18_MODULE`.
- [ ] `src/components/learning/networking/homepage/NetworkingHomePage.tsx` adds Day 18 teaser.
- [ ] `src/components/learning/networking/canvas/NetworkingCanvas.tsx` adds `net-18` canvas stage.
- [ ] `src/components/learning/networking/workspace/NetworkingWorkspace.tsx` adds Day 18 command aliases.
- [ ] `src/components/learning/networking/terminal/NetworkingTerminal.tsx` adds Day 18 help text and dynamic responses.
- [ ] `tests/curriculum/networking-curriculum.test.ts` validates Day 18 structure.
- [ ] `tests/ui/networking-canvas.test.tsx` and `tests/ui/networking-homepage.test.tsx` pass with anti-overlap guarantees and "18 Days Live".
- [ ] `npm test -- tests/curriculum/networking- tests/ui/networking-` passes 100%.
- [ ] `npx tsc --noEmit` returns 0 errors.
