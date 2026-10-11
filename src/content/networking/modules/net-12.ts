import { ModuleData } from '../../../types/curriculum';

/**
 * net-12: TCP Reliability, Flow Control & Teardown
 * ─────────────────────────────────────────────────────────────────────────────
 * Milestone 5 — Concepts C40a, C40b, C40c, C40d
 * Teaches TCP byte-stream sequence numbering, cumulative acknowledgments,
 * sliding window flow control (rwnd), Retransmission Timeout (RTO),
 * 3-duplicate-ACK Fast Retransmit, 4-way FIN/ACK teardown, and the critical
 * TIME_WAIT state (2*MSL).
 */

export const NET_12_MODULE: ModuleData = {
  id: 'net-12',
  slug: 'tcp-reliability-flow-control-and-teardown',
  day: 12,
  title: 'Module 12: TCP Reliability, Flow Control & Teardown',
  shortTitle: 'TCP Reliability & Teardown',
  type: 'module',
  track: 'networking',
  milestoneId: 'net-milestone-5',
  description:
    'Master the mechanisms that make TCP reliable: byte offset sequence numbering, cumulative ACKs, sliding window flow control (rwnd), fast retransmit, graceful 4-way teardown, and the TIME_WAIT state.',
  estimatedMinutes: 35,
  curriculumOrder: 12,
  displayLabel: 'Module 12',
  completionLearnings: [
    'TCP tracks individual data bytes, not packet counts; Sequence Number represents the byte stream index of the first byte in the segment payload',
    'TCP uses cumulative acknowledgments: an ACK number of N informs the sender that all bytes up to N-1 were received and byte N is expected next',
    'Flow control uses the Receive Window (rwnd) field in the TCP header to advertise how many unacknowledged bytes the receiver buffer can currently accept',
    'If rwnd drops to 0 (Zero Window), the sender halts transmission and sends periodic Zero Window Probes to detect when buffer space reopens',
    'Retransmission Timeout (RTO) resends unacknowledged data after timer expiry; receiving 3 duplicate ACKs triggers Fast Retransmit immediately',
    'Connection teardown uses a 4-way handshake: FIN -> ACK (half-closed) followed by the reverse FIN -> ACK',
    'The endpoint initiating the teardown remains in TIME_WAIT for 2*MSL (Maximum Segment Lifetime, 60–120s) to absorb delayed packets and ensure the final ACK was delivered',
  ],
  concepts: [
    // ─────────────────────────────────────────────────────
    // Concept 1: Byte-Stream Numbers & Cumulative ACKs (C40a/b)
    // ─────────────────────────────────────────────────────
    {
      id: 'net12-c1-seq-ack-math',
      order: 1,
      title: 'Byte Offsets & Cumulative Acknowledgments',
      shortDescription:
        'Understand TCP byte accounting: how Sequence Numbers track byte offsets and why Acknowledgments confirm continuous streams.',
      theory: {
        summary:
          'TCP is a stream of bytes. Sequence numbers track the byte offset of payload bytes. Acknowledgments are cumulative: ACK N indicates that all bytes through N-1 were received and byte N is expected next. Gaps cause repeated duplicate ACKs.',
        explanation: [
          '### Byte Counting vs Packet Counting',
          'TCP treats payload as a continuous stream of bytes. Sequence number is the stream index of the first byte in the payload.',
          '',
          '### Cumulative ACKs',
          'The ACK number announces the next expected byte. If byte 1000 is received with 500 bytes of data (1000–1499), the receiver replies with ACK 1500.',
          '',
          '### Handling Gaps',
          'If a segment is lost, out-of-order packets trigger duplicate ACKs repeating the earliest unreceived byte index.',
        ],
        keyTakeaway:
          'Sequence numbers track byte offsets; ACK numbers request the next expected byte. Gaps generate duplicate ACKs.',
        exampleQuery: '',
        exampleQueryExplanation: '',
      },
      tasks: [
        {
          id: 'net12-p1-ack-calculation',
          title: 'Practice: Calculating Sequence & ACK Offsets',
          description:
            'Calculate exact Sequence and ACK values across multi-segment transmissions.',
          instructions: [
            'A client sends 3 consecutive segments of 1000 bytes each starting at Sequence Number 5000.',
            'Calculate the sequence numbers of each segment and the final cumulative ACK.',
          ],
          type: 'guided',
          primaryTable: '',
          initialSql: '',
          solutionSql: 'NETWORKING_JUDGMENT_TASK',
          solutionExplanation:
            'Segment 1 has Seq=5000 (bytes 5000-5999). Segment 2 has Seq=6000 (bytes 6000-6999). Segment 3 has Seq=7000 (bytes 7000-7999). Final ACK is 8000.',
          tcpLadder: {
            title: 'Byte Offsets & Cumulative Acknowledgments',
            description:
              'Calculate sequence offsets across payload segments and observe how cumulative ACKs specify the earliest unreceived byte index.',
            defaultScenario: 'data_flow',
            clientIsn: 1000,
            serverIsn: 5000,
          },
          hints: [
            {
              level: 1,
              text: 'Each segment sequence number equals previous sequence number plus payload length.',
            },
            {
              level: 2,
              text: 'ACK number equals the next expected byte index.',
            },
          ],
          validation: {
            judgment: [
              {
                kind: 'choose-and-defend',
                prompt:
                  'A sender transmits a segment with Sequence Number = 10,000 carrying 1,460 bytes of data. What will be the Acknowledgment Number in the receiver\'s reply if received without error?',
                options: [
                  '10,001',
                  '11,460',
                  '11,459',
                  '10,000',
                ],
                correctIndex: 1,
                explanation:
                  'The segment carries bytes 10,000 through 11,459 (total 1,460 bytes). The receiver confirms receipt by asking for the next expected byte: 10,000 + 1,460 = 11,460.',
              },
              {
                kind: 'choose-and-defend',
                prompt:
                  'A receiver gets bytes 1–1000 (Seq 1), then loses bytes 1001–2000, but successfully receives bytes 2001–3000. What ACK number does it send when bytes 2001–3000 arrive?',
                options: [
                  'ACK 3001, confirming all arrived data',
                  'ACK 1001, because TCP ACKs are cumulative and cannot acknowledge past the missing gap',
                  'ACK 2001, skipping the gap',
                  'ACK 0, resetting the connection',
                ],
                correctIndex: 1,
                explanation:
                  'TCP cumulative ACKs confirm contiguous bytes. Because bytes 1001–2000 are missing, the receiver must repeat ACK 1001 (a duplicate ACK).',
              },
            ],
          },
          successMessage:
            'Perfect! TCP sequence numbers track byte indices, and cumulative ACKs always specify the earliest unreceived byte.',
        },
      ],
    },

    // ─────────────────────────────────────────────────────
    // Concept 2: Flow Control (rwnd) & Fast Retransmit (C40c/d)
    // ─────────────────────────────────────────────────────
    {
      id: 'net12-c2-flow-congestion',
      order: 2,
      title: 'Flow Control (rwnd) & Fast Retransmit',
      shortDescription:
        'Contrast end-host buffer flow control (rwnd) with network congestion, and understand how 3 duplicate ACKs trigger Fast Retransmit.',
      theory: {
        summary:
          'Flow control uses rwnd to limit unacknowledged in-flight bytes based on available receiver memory. rwnd=0 halts sender data transmission. Receiving 3 duplicate ACKs triggers Fast Retransmit without waiting for the slow RTO timer.',
        explanation: [
          '### Receive Window (`rwnd`) Flow Control',
          'The receiver advertises its free buffer space via rwnd. The sender is forbidden from transmitting more unacknowledged bytes than rwnd.',
          '',
          '### Zero Window & Persist Timer',
          'When rwnd drops to 0, transmission halts. The sender sends periodic 1-byte probes until window space reopens.',
          '',
          '### Fast Retransmit',
          'Rather than waiting for the Retransmission Timeout (RTO) timer, receiving 3 duplicate ACKs triggers immediate retransmission of the missing segment.',
        ],
        keyTakeaway:
          'rwnd prevents receiver buffer overrun. 3 duplicate ACKs trigger Fast Retransmit before RTO timer expiry.',
        exampleQuery: '',
        exampleQueryExplanation: '',
      },
      tasks: [
        {
          id: 'net12-p2-flow-retransmit-eval',
          title: 'Practice: Evaluating Flow Control & Fast Retransmit',
          description:
            'Predict sender behavior when receive buffers saturate and evaluate duplicate ACK retransmission thresholds.',
          instructions: [
            'A receiving host advertises `rwnd = 0`. Later, a sender receives 3 duplicate ACKs for byte 4000.',
            'Answer the judgment questions on flow control and packet recovery.',
          ],
          type: 'guided',
          primaryTable: '',
          initialSql: '',
          solutionSql: 'NETWORKING_JUDGMENT_TASK',
          solutionExplanation:
            'rwnd=0 halts sender data transmission. 3 duplicate ACKs trigger Fast Retransmit without waiting for the RTO timer.',
          tcpLadder: {
            title: 'Flow Control (rwnd) & Fast Retransmit',
            description:
              'Observe buffer overflow prevention when rwnd drops to 0, and verify how 3 duplicate ACKs trigger immediate Fast Retransmit.',
            defaultScenario: 'fast_retransmit',
            clientIsn: 1000,
            serverIsn: 5000,
          },
          hints: [
            {
              level: 1,
              text: 'Flow control protects the receiver buffer; congestion control protects the network links.',
            },
            {
              level: 2,
              text: 'Fast Retransmit requires 3 duplicate ACKs (4 identical ACKs total).',
            },
          ],
          validation: {
            judgment: [
              {
                kind: 'choose-and-defend',
                prompt:
                  'What does a TCP receiver signal when it sets the Window Size (rwnd) field to 0 in an ACK segment?',
                options: [
                  'It requests the sender to increase its transmission speed by 2x',
                  'Its local application receive buffer is completely full, and the sender must cease sending new data until buffer space becomes available',
                  'The connection has experienced a hardware disconnect and must terminate',
                  'The server has run out of IP addresses',
                ],
                correctIndex: 1,
                explanation:
                  'rwnd indicates available buffer space on the receiver. rwnd = 0 (Zero Window) halts transmission to prevent packet drops caused by buffer overrun.',
              },
              {
                kind: 'choose-and-defend',
                prompt:
                  'What condition triggers TCP Fast Retransmit rather than waiting for the Retransmission Timeout (RTO) timer?',
                options: [
                  'The arrival of 3 duplicate ACKs for the same sequence number',
                  'The link latency dropping below 5 milliseconds',
                  'The receiver sending an ICMP Echo Reply',
                  'The sender reaching maximum MTU size',
                ],
                correctIndex: 0,
                explanation:
                  'RFC 5681 defines Fast Retransmit: upon receiving 3 duplicate ACKs (indicating 3 subsequent segments arrived safely while one is missing), the sender immediately retransmits the missing segment.',
              },
            ],
          },
          successMessage:
            'Spot on! You understand sliding window flow control limits and how 3 duplicate ACKs trigger Fast Retransmit.',
        },
      ],
    },

    // ─────────────────────────────────────────────────────
    // Concept 3: Teardown & The TIME_WAIT State (C40e)
    // ─────────────────────────────────────────────────────
    {
      id: 'net12-c3-connection-teardown',
      order: 3,
      title: 'Connection Teardown & The TIME_WAIT State',
      shortDescription:
        'Trace the 4-way FIN/ACK teardown handshake and discover why the active closer must linger in the TIME_WAIT state for 2*MSL.',
      theory: {
        summary:
          'Because TCP is full-duplex, terminating a connection requires 4 packets (FIN -> ACK, then reverse FIN -> ACK). The side initiating close lingers in TIME_WAIT for 2*MSL (60-120s) to absorb wandering duplicate packets and guarantee delivery of the final ACK.',
        explanation: [
          '### The 4-Way Teardown Handshake',
          '1. Initiator -> FIN',
          '2. Responder -> ACK (Connection is now Half-Closed)',
          '3. Responder -> FIN',
          '4. Initiator -> ACK',
          '',
          '### The Critical Role of TIME_WAIT (2*MSL)',
          '- **Guarantees Final ACK Delivery**: If the final ACK is dropped, the responder retransmits FIN. The closer in TIME_WAIT can resend the ACK.',
          '- **Drains Wandering Segments**: Prevents delayed duplicates from an old session corrupting a newly opened connection reusing the same 5-tuple.',
        ],
        keyTakeaway:
          'Full-duplex teardown requires 4 packets. The active closer holds TIME_WAIT for 2*MSL to drain lingering packets.',
        exampleQuery: '',
        exampleQueryExplanation: '',
      },
      tasks: [
        {
          id: 'net12-p3-teardown-timewait',
          title: 'Practice: Analyzing Teardown Flags & TIME_WAIT Semantics',
          description:
            'Inspect socket state progressions during connection teardown and explain TIME_WAIT safety guarantees.',
          instructions: [
            'A client terminates an active HTTP session with a web server.',
            'Answer the judgment questions on 4-way teardown and the role of TIME_WAIT.',
          ],
          type: 'guided',
          primaryTable: '',
          initialSql: '',
          solutionSql: 'NETWORKING_JUDGMENT_TASK',
          solutionExplanation:
            'TCP teardown uses FIN and ACK flags. The active closer enters TIME_WAIT for 2*MSL to allow delayed packets to drain and ensure the final ACK arrives.',
          tcpLadder: {
            title: '4-Way Teardown & TIME_WAIT Semantics',
            description:
              'Step through bidirectional connection termination and analyze why the active closer enters TIME_WAIT for 2*MSL (60-120s).',
            defaultScenario: 'teardown',
            clientIsn: 20000,
            serverIsn: 30000,
          },
          hints: [
            {
              level: 1,
              text: 'Each side sends a FIN and acknowledges the other side\'s FIN.',
            },
            {
              level: 2,
              text: 'MSL stands for Maximum Segment Lifetime; 2*MSL allows a round trip for delayed segments.',
            },
          ],
          validation: {
            judgment: [
              {
                kind: 'choose-and-defend',
                prompt:
                  'Why does TCP require 4 packets to close a connection instead of 2?',
                options: [
                  'Because the 4 packets re-authenticate the user with the DNS server',
                  'Because TCP is full-duplex, and each direction of communication must be closed independently with its own FIN and ACK',
                  'Because routers drop connections that close in fewer than 4 packets',
                  'To ensure both sides reset their sequence numbers back to 0',
                ],
                correctIndex: 1,
                explanation:
                  'TCP is full-duplex. Closing data transfer from A to B does not automatically close data transfer from B to A, so each direction requires its own FIN and ACK.',
              },
              {
                kind: 'choose-and-defend',
                prompt:
                  'What is the primary danger if an operating system immediately reopened a socket rather than holding it in TIME_WAIT for 2*MSL?',
                options: [
                  'The switch MAC address table would erase all port entries',
                  'Old delayed duplicate segments from the previous connection could arrive and be mistakenly accepted by the new connection sharing the same 5-tuple, causing data corruption',
                  'The default gateway would run out of IP addresses',
                  'The client would be banned from the domain registrar',
                ],
                correctIndex: 1,
                explanation:
                  'The primary purpose of TIME_WAIT is to let all delayed, wandering duplicate segments from the old incarnation drain from the network so they do not corrupt a new connection reusing the same port tuple.',
              },
            ],
          },
          successMessage:
            'Mastered! You understand bidirectional full-duplex teardown and the critical packet-draining role of the TIME_WAIT state.',
        },
      ],
    },
  ],

  challenge: {
    id: 'net12-challenge',
    title: 'Module 12 Challenge: Packet Loss Reconstruction & High-Load Sockets',
    scenario:
      'Diagnose performance bottlenecks on a high-throughput microservice architecture experiencing packet drops and socket exhaustion.',
    tasks: [
      {
        id: 'net12-ch1-fast-retransmit-trace',
        title: 'Challenge 1: Packet Loss & Fast Retransmit Accounting',
        description:
          'Analyze a sequence of packet captures during a dropped segment and determine exact ACK numbers generated.',
        instructions: [
          'A sender transmits 4 segments of 1000 bytes: Seg 1 (Seq 1000), Seg 2 (Seq 2000), Seg 3 (Seq 3000), Seg 4 (Seq 4000).',
          'Seg 2 is dropped by a congested intermediate router.',
          'Seg 1, Seg 3, and Seg 4 arrive at the receiver in that order.',
          'Identify what ACK packets the receiver emits upon receiving Seg 3 and Seg 4.',
        ],
        type: 'challenge',
        primaryTable: '',
        initialSql: '',
        solutionSql: 'NETWORKING_JUDGMENT_TASK',
        solutionExplanation:
          'When Seg 3 arrives, receiver sends ACK 2000. When Seg 4 arrives, receiver sends another ACK 2000. These duplicate ACKs trigger Fast Retransmit of Seg 2.',
        tcpLadder: {
          title: 'Packet Loss & Fast Retransmit Accounting',
          description:
            'Observe segment 2 loss triggering duplicate ACKs 2000 upon arrival of segments 3 and 4, prompting sender Fast Retransmit.',
          defaultScenario: 'fast_retransmit',
          clientIsn: 1000,
          serverIsn: 5000,
          simulatedDroppedSegmentId: 'fr-2',
        },
        hints: [
          {
            level: 1,
            text: 'Seg 2 (bytes 2000-2999) was lost, so the receiver is still waiting for byte 2000.',
          },
          {
            level: 2,
            text: 'Every out-of-order segment that arrives causes the receiver to repeat the last valid cumulative ACK.',
          },
        ],
        validation: {
          judgment: [
            {
              kind: 'choose-and-defend',
              prompt:
                'When Seg 3 (Seq 3000) and Seg 4 (Seq 4000) arrive after Seg 2 (Seq 2000) was lost, what Acknowledgment numbers do the emitted ACK packets carry?',
              options: [
                'ACK 3000 and ACK 4000',
                'Both packets carry ACK 2000, functioning as duplicate ACKs because byte 2000 is still missing',
                'ACK 5000, acknowledging all data received regardless of order',
                'An ICMP Destination Unreachable packet',
              ],
              correctIndex: 1,
              explanation:
                'Because TCP acknowledgments are strictly cumulative, the receiver cannot acknowledge beyond the gap. Every out-of-order segment triggers a duplicate ACK repeating the first missing byte (ACK 2000).',
            },
          ],
        },
        successMessage:
          'Challenge 1 mastered! You traced cumulative ACK generation through gaps and demonstrated the trigger for Fast Retransmit.',
      },
      {
        id: 'net12-ch2-timewait-exhaustion',
        title: 'Challenge 2: High-Throughput TIME_WAIT Socket Exhaustion',
        description:
          'Diagnose why a reverse proxy server handling 50,000 short-lived HTTP connections per second runs out of outbound sockets.',
        instructions: [
          'An API gateway makes short-lived HTTP/1.0 requests to an internal backend pool without connection reuse.',
          'The gateway actively closes every connection after receiving the response.',
          'Under peak traffic, the gateway logs error: `connect: cannot assign requested address`.',
          'Identify the root cause of this failure.',
        ],
        type: 'challenge',
        primaryTable: '',
        initialSql: '',
        solutionSql: 'NETWORKING_JUDGMENT_TASK',
        solutionExplanation:
          'Because the gateway initiates the active close, tens of thousands of sockets linger in TIME_WAIT for 60s, completely exhausting ephemeral source ports. The solution is HTTP keep-alive / connection pooling.',
        tcpLadder: {
          title: 'High-Throughput TIME_WAIT Socket Exhaustion',
          description:
            'Diagnose thousands of short-lived connections accumulating in TIME_WAIT, exhausting the ephemeral port pool without connection pooling.',
          defaultScenario: 'teardown',
          clientIsn: 40000,
          serverIsn: 80,
        },
        hints: [
          {
            level: 1,
            text: 'The active closer enters TIME_WAIT for 2*MSL (1–2 minutes).',
          },
          {
            level: 2,
            text: 'Opening and closing thousands of connections per second consumes all ~60,000 ephemeral ports.',
          },
        ],
        validation: {
          judgment: [
            {
              kind: 'choose-and-defend',
              prompt:
                'Why did the API gateway run out of available socket addresses under high load, and what is the standard architectural fix?',
              options: [
                'The gateway\'s hard drive ran out of swap space; the fix is increasing virtual memory',
                'Because the gateway actively closed every TCP connection, thousands of sockets accumulated in TIME_WAIT for 2*MSL, exhausting the ephemeral port pool; the fix is enabling HTTP Keep-Alive / connection pooling to reuse existing connections',
                'The backend DNS server crashed; the fix is restarting bind9',
                'The switch port link speed downgraded to 10 Mbps; the fix is replacing the Ethernet cable',
              ],
              correctIndex: 1,
              explanation:
                'Rapid connection churn where the client or proxy actively closes causes ephemeral ports to remain locked in TIME_WAIT for 60–120s. Enabling connection pooling reuses TCP streams and prevents port exhaustion.',
            },
          ],
        },
        successMessage:
          'Challenge 2 cleared! You diagnosed real-world ephemeral port exhaustion caused by TIME_WAIT accumulation in high-concurrency architectures.',
      },
    ],
  },
};
