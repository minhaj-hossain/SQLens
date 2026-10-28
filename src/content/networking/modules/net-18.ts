import { NetworkingModule } from '@/types/networking';

export const NET_18_MODULE: NetworkingModule = {
  id: 'net-18',
  dayNumber: 18,
  title: 'Day 18 · TCP: Reliable Delivery',
  shortTitle: 'TCP: Reliable Delivery',
  steps: [
    {
      group: 'Idea 1 of 4 · Sequence numbers & cumulative ACKs',
      chg: 'Since Day 17: You mastered opening and closing TCP connections via the 3-way handshake and 4-way teardown. Once the socket is ESTABLISHED, how does TCP guarantee that application payload bytes arrive reliably and in order across an unreliable IP network?',
      title: 'Byte-stream sequence numbers and cumulative acknowledgments',
      what:
        'Unlike lower-layer protocols that operate on discrete frames or packets, TCP provides applications with a continuous, unstructured stream of bytes.\n\nByte-Granularity Accounting:\nTCP does NOT number packets (Packet #1, Packet #2). Instead, TCP assigns an explicit 32-bit sequence number to every individual byte of data:\nseq_byte = (ISN + 1 + byte_offset) mod 2^32\n\nIn the 20-byte TCP header:\n• Sequence Number (32 bits): Contains the sequence number of the very first byte carried in that segment’s payload.\n• If a sender transmits a payload of L bytes starting at sequence number S, that segment contains payload bytes spanning the range [S, S + L - 1].\n\nThe Cumulative Acknowledgment Invariant:\nWhen the receiver receives incoming bytes, it confirms receipt using the 32-bit Acknowledgment Number (ack) field.\nCrucially, TCP acknowledgments are strictly Cumulative:\nack = S + L\n\nAn acknowledgment number of K asserts an unambiguous mathematical guarantee:\n"I have successfully received and buffered all bytes up to K - 1 in unbroken, contiguous order. I am now waiting for byte K."\n\nNotice the power of this design: if an ACK packet is lost on the return path, but a subsequent ACK with a higher number arrives, the sender knows all preceding bytes arrived safely!\n\nLet’s transmit an HTTP request payload of 24 bytes ("GET /data HTTP/1.1\\r\\n\\r\\n") from PC1 to our Web Server and observe how sequence and acknowledgment numbers advance.',
      why: 'Explains how TCP achieves byte-granularity tracking over packet-oriented IP networks and introduces the cumulative ACK invariant.',
      pic: 'Byte stream diagram showing payload bytes 1001..1024 mapping to seq=1001, payload_len=24, and triggering receiver cumulative ack=1025.',
      task: 'Transmit an HTTP payload over the established socket using tcp send "GET /data HTTP/1.1".',
      cmd: 'tcp send "GET /data HTTP/1.1"',
      read: [
        ['Payload Length', '24 bytes ("GET /data HTTP/1.1\\r\\n\\r\\n")'],
        ['Sender Sequence', 'seq = 1001 (First byte offset in stream)'],
        ['Receiver Cumulative ACK', 'ack = 1025 (1001 + 24 = next expected byte)'],
        ['Byte Tracking Model', 'Byte-level counter (not packet-count based)'],
      ],
      rem: 'TCP sequence numbers count every individual payload byte; cumulative ACKs confirm unbroken contiguous receipt and request the next expected byte.',
    },
    {
      group: 'Idea 2 of 4 · Dynamic RTO & timer backoff',
      chg: 'Payload was delivered and acknowledged. But what happens if an intermediate IP router drops the segment? The sender never receives an ACK. How does TCP know when to retransmit without flooding the network?',
      title: 'Packet loss detection: Jacobson\'s dynamic RTO and Karn\'s backoff',
      what:
        'When an IP router drops a packet due to buffer queue congestion or bit errors, it rarely notifies the sender. TCP must detect loss purely by the absence of an acknowledgment.\n\nThe Retransmission Timer & RTO:\nEvery time TCP sends a segment containing data, it starts a Retransmission Timer armed with a Retransmission Timeout (RTO). If the timer fires before an ACK covering that segment arrives, TCP concludes the segment was lost and retransmits it.\n\nWhy Static RTO Fails:\nInternet latency is inherently unpredictable. Across local LANs, Round-Trip Times (RTT) are sub-millisecond; across transcontinental fiber, RTTs exceed 150 ms.\n• If RTO is set too low: TCP fires premature retransmissions for delayed packets, congesting the network with duplicates.\n• If RTO is set too high: TCP stalls throughput for seconds after a real loss event.\n\nJacobson\'s Algorithm (RFC 6298):\nModern TCP dynamically tracks network latency using Smoothed RTT (SRTT) and RTT Variance (RTTVAR):\n1. Measure Sample RTT (R): Elapsed time between sending a segment and receiving its ACK.\n2. Update Smoothed RTT: SRTT ← (1 - α) · SRTT + α · R  (α = 0.125)\n3. Update RTT Variance: RTTVAR ← (1 - β) · RTTVAR + β · |SRTT - R|  (β = 0.25)\n4. Compute RTO: RTO = SRTT + max(G, 4 · RTTVAR)  (where G is clock granularity)\n\nKarn\'s Algorithm & Exponential Backoff:\nIf a retransmission timer expires, retransmitting immediately at the same pace could trigger catastrophic "congestion collapse" at the congested bottleneck router.\n• Exponential Backoff: For each consecutive timeout, TCP doubles the RTO: RTO ← min(2 · RTO, RTO_max).\n• Karn-Partridge Rule: Never measure Sample RTT for retransmitted segments, because the sender cannot tell whether an arriving ACK responds to the original transmission or the retransmission!\n\nLet’s simulate a 100% loss event on the link to observe RTO expiration, retransmission, and exponential timer backoff.',
      why: 'Explains mathematical loss detection via dynamic RTT estimation and the necessity of exponential backoff during congestion.',
      pic: 'Timeline diagram showing dropped segment, RTO countdown (200ms), timer expiration, retransmission with doubled RTO (400ms), and eventual ACK.',
      task: 'Simulate a dropped segment and observe dynamic RTO retransmission using tcp drop-simulate --loss 100.',
      cmd: 'tcp drop-simulate --loss 100',
      read: [
        ['Initial RTO Timer', 'RTO = 200 ms (Calculated: SRTT 40ms + 4×RTTVAR 40ms)'],
        ['Timer Expiration', 'RTO expired at t=200ms; ACK not received'],
        ['Retransmission', 'Retransmitted seq=1025 (len=50B) to 198.51.100.10:80'],
        ['Exponential Backoff', 'RTO doubled to 400 ms (Karn\'s backoff rule)'],
      ],
      rem: 'TCP calculates dynamic RTO from Smoothed RTT and RTT variance; consecutive timeouts double the timer (exponential backoff) to prevent network collapse.',
    },
    {
      group: 'Idea 3 of 4 · Fast Retransmit & SACK',
      chg: 'RTO timers guarantee recovery, but waiting 200ms to 1 second completely halts high-bandwidth connections. When a stream of multiple packets is in flight and only one packet is lost, can TCP recover immediately without waiting for a timer?',
      title: 'Fast Retransmit (3 Duplicate ACKs) and Selective Acknowledgment (SACK)',
      what:
        'When multiple segments are in flight (pipeline transmission), packet loss exhibits a distinct signature at the receiver.\n\nThe Out-of-Order Signature:\nSuppose the sender transmits 4 segments:\n• Segment 1: seq=1000..1999\n• Segment 2: seq=2000..2999\n• Segment 3: seq=3000..3999\n• Segment 4: seq=4000..4999\n\nSuppose Segment 2 is dropped by a router, but Segments 3 and 4 arrive safely at the receiver.\nBecause TCP ACKs are strictly cumulative, the receiver cannot ACK Segments 3 or 4! It must continue acknowledging the last contiguous byte received: ack=2000.\nRFC 5681: Whenever an out-of-order segment arrives, the receiver MUST immediately generate a Duplicate ACK (Dup ACK) repeating ack=2000.\n\nThe 3 Duplicate ACKs Rule (Fast Retransmit):\nWhy wait for 3 Duplicate ACKs?\nInternet paths can reorder packets slightly (e.g. multi-path routing or router queue variations). A single duplicate ACK might just be a packet that arrived 1 millisecond out of order.\nHowever, receiving 3 Duplicate ACKs in rapid succession is an overwhelming statistical guarantee that Segment 2 was genuinely lost, not merely delayed.\nThe sender immediately retransmits Segment 2 without waiting for the RTO timer to expire! This is Fast Retransmit.\n\nSelective Acknowledgment (SACK, RFC 2018):\nUnder standard cumulative ACKs, the sender does not know whether Segments 3 and 4 arrived. In older TCP implementations (Tahoe/Reno), the sender might retransmit Segments 2, 3, and 4 unnecessarily!\nSACK solves this by adding an optional TCP header field: SACK Blocks.\nIn each Duplicate ACK, the receiver reports: ack=2000, SACK=[3000-5000].\nThe sender sees that bytes 3000–5000 were already safely buffered; it retransmits ONLY the missing gap: bytes 2000–2999!\n\nLet’s inspect internal socket telemetry to examine SACK negotiated options and fast retransmit counters using ss -ti.',
      why: 'Explains how TCP recovers from isolated packet drops in a single round-trip time without suffering throughput collapse.',
      pic: 'Packet ladder diagram showing missing segment #2, three duplicate ACKs with SACK=[3000-5000], immediate Fast Retransmit, and recovery ACK.',
      task: 'Inspect TCP internal socket metrics and SACK blocks using ss -ti.',
      cmd: 'ss -ti',
      read: [
        ['Fast Retransmit Trigger', '3 Duplicate ACKs (ACK=2000 repeated 3 times)'],
        ['SACK Option (RFC 2018)', 'SACK Blocks: [3000-5000] (Out-of-order segments isolated)'],
        ['Gap Retransmission', 'Sender retransmits only missing bytes 2000–2999'],
        ['Latency Improvement', 'Immediate recovery in 1 RTT (bypassed 200ms RTO timer)'],
      ],
      rem: 'Three duplicate ACKs trigger Fast Retransmit without waiting for RTO; SACK blocks tell the sender precisely which non-contiguous blocks were received.',
    },
    {
      group: 'Idea 4 of 4 · Flow control & receive windows',
      chg: 'Reliability guarantees packets arrive, but what if the sender transmits data faster than the receiving application can read it from kernel memory? How does TCP prevent receiver buffer overflow?',
      title: 'Flow control, the Advertised Receive Window (win), and Zero-Window Probes',
      what:
        'Every host allocates a finite amount of OS kernel memory for TCP receive buffers (SO_RCVBUF, typically 64 KB to several MB).\nIf the sender pushes data at 10 Gbps but the receiver\'s application (e.g. database query worker or web browser) is busy disk-writing and calls read() slowly, the receive buffer fills up.\nIf the buffer overflows, incoming packets must be discarded by the OS kernel, wasting bandwidth and triggering retransmission storms.\n\nThe Advertised Receive Window (win):\nIn every TCP header, the receiver advertises its current free buffer space in the 16-bit Window Size (win) field:\nRcvWindow = BufferSize - (BytesReceived - BytesReadByApp)\n\nThe Sliding Window Invariant:\nThe sender is legally prohibited from transmitting bytes beyond:\nMaxAllowedByte = LastByteAcked + win\n\nZero Window (win=0) & The Persist Timer:\nWhen the receiver buffer is 100% full, the receiver sends win=0 (Zero Window).\nThe sender immediately halts transmission.\n\nDeadlock Hazard:\nWhen the receiver application finally reads data and frees space, the receiver sends an ACK with win=65535. But what if that window update packet is dropped by an intermediate router?\n• The sender is waiting for a window update.\n• The receiver assumes the sender already has window credit and waits for data.\n• Result: Permanent connection deadlock!\n\nZero-Window Probes (ZWP):\nTo eliminate this deadlock, the sender arms a Persist Timer when win=0 is received.\nWhen the persist timer expires, the sender transmits a 1-byte Zero-Window Probe segment.\nThe receiver must reply with an ACK specifying its current window size. If still zero, the sender doubles the persist timer and probes again until window credit reopens.\n\nLet’s inspect our socket state, window sizes, and active persist timers using ss -tan -o.',
      why: 'Explains receiver buffer limits, the sliding window constraint, and how zero-window probing prevents deadlock.',
      pic: 'Sliding window buffer diagram showing Bytes Acknowledged, In-Flight Window, Usable Window, and Zero-Window Probe exchange.',
      task: 'Inspect advertised receive windows and zero-window probe timers using ss -tan -o.',
      cmd: 'ss -tan -o',
      read: [
        ['Advertised Window (win)', 'win = 65535 bytes (Current receiver buffer credit)'],
        ['Flow Control Invariant', 'Sender bytes in-flight cannot exceed advertised window'],
        ['Zero-Window Handling', 'Transmission halts when win=0; Persist Timer armed'],
        ['Deadlock Prevention', '1-byte Zero-Window Probes force receiver window updates'],
      ],
      rem: 'The advertised window field (win) bounds sender transmission to receiver free buffer space; zero-window probes prevent receiver deadlock.',
    },
    {
      group: 'Recap',
      title: 'The four core invariants of TCP reliable delivery',
      what:
        'TCP transforms an unreliable, best-effort packet network into an ordered, lossless byte stream through four interlocking mechanisms:\n1. Byte-granularity sequence numbers and cumulative acknowledgments track and confirm every individual byte.\n2. Dynamic RTO calculation (Jacobson\'s algorithm) and exponential backoff (Karn\'s algorithm) detect lost segments and prevent network collapse.\n3. Fast Retransmit (3 Duplicate ACKs) and Selective Acknowledgment (SACK) patch missing data gaps within a single round trip without timer stalls.\n4. Advertised receive windows (win) and zero-window probing prevent fast senders from exhausting receiver kernel buffers.',
      why: 'Synthesizes the core mechanisms of Layer 4 reliability before comparing TCP to UDP in Day 19.',
      pic: 'Master Layer 4 reliability diagram showing byte stream alignment, RTO timer, SACK gap repair, and sliding window flow control.',
      task: 'Review the four fundamental invariants of TCP reliable delivery.',
      cmd: null,
      read: [
        ['1. Byte-Stream Accounting', 'seq = ISN + offset; ack = next expected contiguous byte'],
        ['2. Dynamic RTO & Backoff', 'RTO = SRTT + 4×RTTVAR; doubles on loss to prevent congestion collapse'],
        ['3. Fast Retransmit & SACK', '3 Duplicate ACKs trigger instant 1-RTT gap repair via SACK blocks'],
        ['4. Receive Window Flow Control', 'win field limits in-flight bytes; Zero-Window Probes eliminate deadlock'],
      ],
      rem: 'TCP guarantees ordered, lossless delivery through byte-level tracking, dynamic retransmission, SACK gap filling, and window flow control.',
    },
  ],
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

    'tcp send "get /data http/1.1"':
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
  },
};
