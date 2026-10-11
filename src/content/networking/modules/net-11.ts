import { ModuleData } from '../../../types/curriculum';

/**
 * net-11: Transport Layer: UDP & TCP Foundations
 * ─────────────────────────────────────────────────────────────────────────────
 * Milestone 5 — Concepts C37, C38, C39
 * Teaches transport layer multiplexing, well-known vs ephemeral ports, 5-tuple
 * socket bindings, UDP lightweight connectionless datagram mechanics, TCP
 * connection-oriented semantics, header control flags (SYN, ACK, FIN, RST),
 * and the classic 3-way handshake.
 */

export const NET_11_MODULE: ModuleData = {
  id: 'net-11',
  slug: 'transport-layer-udp-and-tcp-foundations',
  day: 11,
  title: 'Module 11: Transport Layer: UDP & TCP Foundations',
  shortTitle: 'UDP & TCP Foundations',
  type: 'module',
  track: 'networking',
  milestoneId: 'net-milestone-5',
  description:
    'Master how individual applications share a single physical connection: port numbers, the 5-tuple socket binding, UDP connectionless efficiency, TCP connection-oriented guarantees, and the 3-way handshake.',
  estimatedMinutes: 35,
  curriculumOrder: 11,
  displayLabel: 'Module 11',
  completionLearnings: [
    'Port numbers (16-bit: 0 to 65,535) allow multiple applications on a single IP address to send and receive traffic independently',
    'Ports are divided into Well-Known (0–1023), Registered (1024–49,151), and Ephemeral/Dynamic (49,152–65,535)',
    'An active connection is uniquely identified by its 5-tuple: (Protocol, Source IP, Source Port, Destination IP, Destination Port)',
    'UDP provides connectionless, best-effort delivery with a minimal 8-byte header and zero handshake overhead — ideal for DNS, VoIP, and gaming',
    'TCP provides reliable, ordered byte-stream delivery using sequence numbers, acknowledgments, and control flags (SYN, ACK, FIN, RST)',
    'The TCP 3-Way Handshake establishes synchronized Initial Sequence Numbers (ISNs) using SYN -> SYN-ACK -> ACK before any application data is sent',
    'A destination port that is closed immediately responds with a TCP RST (Reset) segment to terminate the connection attempt',
  ],
  concepts: [
    // ─────────────────────────────────────────────────────
    // Concept 1: Multiplexing & 5-Tuple Sockets (C37)
    // ─────────────────────────────────────────────────────
    {
      id: 'net11-c1-transport-multiplexing',
      order: 1,
      title: 'Transport Multiplexing & The 5-Tuple Socket',
      shortDescription:
        'Understand how an operating system routes incoming packets to the exact socket connection and application process using port numbers and 5-tuple socket bindings.',
      theory: {
        summary:
          '16-bit port numbers (0–65,535) enable host process-to-process multiplexing. Every active connection is uniquely bound by its 5-tuple: (Protocol, Source IP, Source Port, Destination IP, Destination Port). Ephemeral source ports allow distinct concurrent transport sessions to the same server (note: modern protocols like HTTP/2 can multiplex multiple application requests over one connection).',
        explanation: [
          '### The Need for Transport Ports',
          'IP delivers packets host-to-host. Transport ports (Layer 4) deliver data to specific application processes on that host.',
          '',
          '### Port Ranges',
          '- **Well-Known (0–1023)**: HTTP 80, HTTPS 443, SSH 22, DNS 53.',
          '- **Registered (1024–49,151)**: Databases and vendor daemons (MySQL 3306, Postgres 5432).',
          '- **Ephemeral (49,152–65,535)**: Temporary client outbound ports assigned dynamically by the OS.',
          '',
          '### The 5-Tuple Socket Binding',
          'An individual network connection is identified by (Proto, SrcIP, SrcPort, DstIP, DstPort). Unique ephemeral client ports allow separate connections to the same server simultaneously. Note that while distinct TCP connections get unique ephemeral ports, modern web browsers frequently multiplex multiple requests and tabs across a single shared HTTP/2 connection.',
        ],
        keyTakeaway:
          'Ports multiplex traffic to applications. Outbound connections receive unique ephemeral source ports, creating distinct 5-tuple sockets.',
        exampleQuery: '',
        exampleQueryExplanation: '',
      },
      tasks: [
        {
          id: 'net11-p1-5tuple-multiplexing',
          title: 'Practice: Deconstructing Concurrent Sockets',
          description:
            'Inspect concurrent connections on a developer workstation and determine how the OS distinguishes traffic flows.',
          instructions: [
            'A developer opens two simultaneous browser tabs to `https://github.com` (IP `140.82.121.4`).',
            'Answer the judgment questions on socket disambiguation and port ranges.',
          ],
          type: 'guided',
          primaryTable: '',
          initialSql: '',
          solutionSql: 'NETWORKING_JUDGMENT_TASK',
          solutionExplanation:
            'The OS assigns unique ephemeral source ports (e.g. 52001 and 52002), making each 5-tuple completely unique even though destination IP and destination port are identical.',
          hints: [
            {
              level: 1,
              text: 'Each outbound connection receives a distinct ephemeral source port from the operating system.',
            },
            {
              level: 2,
              text: 'The 5-tuple includes both source and destination ports.',
            },
          ],
          packetInspection: {
            title: 'Socket Disambiguation: Concurrent 5-Tuple Sockets',
            description:
              'Observe two concurrent TLS connections to the same server endpoint differentiated purely by ephemeral source ports.',
            snapshots: [
              {
                hopLabel: 'Socket 1: Browser Tab 1 (Source Port 52001 ➔ 443)',
                deviceType: 'Host',
                layer2: {
                  srcMac: '3C:22:FB:4A:11:80',
                  dstMac: '00:1A:2B:3C:4D:5E',
                  etherType: '0x0800 (IPv4)',
                },
                layer3: {
                  version: 4,
                  srcIp: '192.168.1.100',
                  dstIp: '140.82.121.4',
                  ttl: 64,
                  protocol: 'TCP (6)',
                },
                layer4: {
                  type: 'TCP',
                  srcPort: 52001,
                  dstPort: 443,
                  seqNum: 1000,
                  flags: { ack: true },
                },
                layer7: {
                  protocol: 'HTTPS / TLS 1.3',
                  summary: 'Encrypted Application Data (Tab 1: Repository View)',
                },
              },
              {
                hopLabel: 'Socket 2: Browser Tab 2 (Source Port 52002 ➔ 443)',
                deviceType: 'Host',
                layer2: {
                  srcMac: '3C:22:FB:4A:11:80',
                  dstMac: '00:1A:2B:3C:4D:5E',
                  etherType: '0x0800 (IPv4)',
                },
                layer3: {
                  version: 4,
                  srcIp: '192.168.1.100',
                  dstIp: '140.82.121.4',
                  ttl: 64,
                  protocol: 'TCP (6)',
                },
                layer4: {
                  type: 'TCP',
                  srcPort: 52002,
                  dstPort: 443,
                  seqNum: 5000,
                  flags: { ack: true },
                },
                layer7: {
                  protocol: 'HTTPS / TLS 1.3',
                  summary: 'Encrypted Application Data (Tab 2: Pull Requests)',
                },
              },
            ],
          },
          validation: {
            judgment: [
              {
                kind: 'choose-and-defend',
                prompt:
                  'A computer opens two simultaneous tabs to the same HTTPS web server at 140.82.121.4:443. How does the operating system ensure returning data reaches the correct tab?',
                options: [
                  'It embeds the browser tab name into the IP header Options field',
                  'It assigns a unique ephemeral source port (e.g. 50412 and 50413) to each connection, creating two distinct 5-tuples',
                  'It asks the server to send responses to different MAC addresses',
                  'It alternates packets one-by-one between tabs',
                ],
                correctIndex: 1,
                explanation:
                  'By choosing a different client source port for each connection, the resulting 5-tuple is unique. When the server replies, the destination port matches the corresponding socket.',
              },
              {
                kind: 'choose-and-defend',
                prompt:
                  'Which port range is designated by IANA as Ephemeral / Dynamic ports commonly assigned to client sockets?',
                options: [
                  '0 to 1023',
                  '1024 to 49151',
                  '49152 to 65535',
                  '65536 to 99999',
                ],
                correctIndex: 2,
                explanation:
                  'Ports 49152 through 65535 are designated as dynamic/private/ephemeral ports by IANA for temporary client-side connections.',
              },
            ],
          },
          successMessage:
            'Correct! The ephemeral source port creates a unique 5-tuple socket, allowing dozens of connections to the same server.',
        },
      ],
    },

    // ─────────────────────────────────────────────────────
    // Concept 2: UDP Foundations & Header Architecture (C38)
    // ─────────────────────────────────────────────────────
    {
      id: 'net11-c2-udp-foundations',
      order: 2,
      title: 'User Datagram Protocol (UDP) Foundations',
      shortDescription:
        'Explore UDP: the 8-byte header, connectionless operation, absence of acknowledgments, and why real-time protocols choose UDP over TCP.',
      theory: {
        summary:
          'UDP is connectionless and lightweight. Its 8-byte header contains Source Port, Destination Port, Length, and Checksum. It does not perform handshakes or retransmissions, making it ideal for DNS, VoIP, gaming, and HTTP/3 QUIC.',
        explanation: [
          '### UDP: Minimalist Transport',
          'UDP transmits without prior handshake or connection state. There are no acknowledgments or retransmissions.',
          '',
          '### The 8-Byte Header',
          'Four 16-bit fields: Source Port (2B), Destination Port (2B), Length (2B), Checksum (2B).',
          '',
          '### Why Use UDP?',
          '- **Real-Time Audio/Video**: Dropping a frame is better than freezing to wait for a late retransmission.',
          '- **Lightweight Transactions**: DNS and DHCP require single-packet exchanges without handshake overhead.',
          '- **HTTP/3 (QUIC)**: Userspace reliability protocol layered over UDP.',
        ],
        keyTakeaway:
          'UDP has an 8-byte header and zero handshake overhead. Checksum failures result in silent drops without retransmission.',
        exampleQuery: '',
        exampleQueryExplanation: '',
      },
      tasks: [
        {
          id: 'net11-p2-udp-header-analysis',
          title: 'Practice: Analyzing UDP Header Characteristics',
          description:
            'Inspect UDP datagram structure and evaluate protocol trade-offs between TCP and UDP.',
          instructions: [
            'Compare the UDP protocol against TCP for a live multiplayer gaming stream.',
            'Answer the judgment questions on header size and error handling.',
          ],
          type: 'guided',
          primaryTable: '',
          initialSql: '',
          solutionSql: 'NETWORKING_JUDGMENT_TASK',
          solutionExplanation:
            'UDP has an 8-byte header and does not retransmit lost packets or perform handshakes. It uses a checksum for error detection.',
          hints: [
            {
              level: 1,
              text: 'The 4 fields of UDP are Source Port, Destination Port, Length, and Checksum.',
            },
            {
              level: 2,
              text: 'If a UDP checksum fails, the receiver discards the corrupted datagram silently.',
            },
          ],
          validation: {
            judgment: [
              {
                kind: 'choose-and-defend',
                prompt:
                  'What is the total size of the UDP header, and what fields does it contain?',
                options: [
                  '20 bytes: Source Port, Dest Port, Sequence Number, ACK Number',
                  '8 bytes: Source Port (2B), Destination Port (2B), Length (2B), and Checksum (2B)',
                  '14 bytes: Preamble, EtherType, Payload, and FCS',
                  '4 bytes: Source Port and Destination Port only',
                ],
                correctIndex: 1,
                explanation:
                  'The UDP header is exactly 8 bytes (64 bits), consisting of four 16-bit fields: Source Port, Destination Port, Length, and Checksum.',
              },
              {
                kind: 'choose-and-defend',
                prompt:
                  'When a receiver calculates a UDP checksum and discovers it does not match the header Checksum field, what action does it take?',
                options: [
                  'Sends an ICMP retransmission request to the sender',
                  'Silently drops the corrupted datagram without requesting a retransmission',
                  'Stores the damaged packet in the receive buffer and halts the connection',
                  'Asks the default gateway to repair the corrupted bits',
                ],
                correctIndex: 1,
                explanation:
                  'UDP provides error detection, but not error recovery. If the checksum fails, the datagram is silently discarded. Any recovery logic must be implemented in the application layer.',
              },
            ],
          },
          successMessage:
            'Excellent! The 8-byte UDP header provides fast best-effort datagram delivery with checksum validation.',
        },
      ],
    },

    // ─────────────────────────────────────────────────────
    // Concept 3: TCP Foundations & The 3-Way Handshake (C39)
    // ─────────────────────────────────────────────────────
    {
      id: 'net11-c3-tcp-handshake',
      order: 3,
      title: 'TCP Foundations & The 3-Way Handshake',
      shortDescription:
        'Master TCP connection establishment: control flags (SYN, ACK, FIN, RST), Initial Sequence Numbers, and the 3-Way Handshake.',
      theory: {
        summary:
          'TCP guarantees reliable, ordered byte delivery. It uses 1-bit control flags (SYN, ACK, FIN, RST). The 3-Way Handshake (SYN -> SYN-ACK -> ACK) synchronizes Initial Sequence Numbers before application data transmission begins. Inactive ports return TCP RST.',
        explanation: [
          '### TCP Control Flags',
          'SYN initiates and synchronizes ISNs. ACK acknowledges received bytes. FIN initiates graceful teardown. RST resets aborted sessions or rejects closed ports.',
          '',
          '### The 3-Way Handshake Walk',
          '1. Client -> SYN (Seq = X)',
          '2. Server -> SYN-ACK (Seq = Y, Ack = X + 1)',
          '3. Client -> ACK (Seq = X + 1, Ack = Y + 1)',
          '',
          '### Closed Port RST Response',
          'If a host receives a SYN on a port with no listening service, it replies immediately with TCP RST/ACK ("Connection Refused").',
        ],
        keyTakeaway:
          'The 3-way handshake synchronizes sequence numbers before data transfer. Closed ports emit an immediate TCP RST.',
        exampleQuery: '',
        exampleQueryExplanation: '',
      },
      tasks: [
        {
          id: 'net11-p3-tcp-handshake-trace',
          title: 'Practice: Tracing the 3-Way Handshake & Closed Port RST',
          description:
            'Trace the sequence numbers and flags during connection establishment and analyze closed port rejection.',
          instructions: [
            'Client A initiates a connection to Web Server B with initial sequence number 1000.',
            'Server B chooses initial sequence number 5000.',
            'Answer the judgment questions on flag combinations and acknowledgment math.',
          ],
          type: 'guided',
          primaryTable: '',
          initialSql: '',
          solutionSql: 'NETWORKING_JUDGMENT_TASK',
          solutionExplanation:
            'SYN has Seq=X. SYN-ACK has Seq=Y and Ack=X+1. Third packet has Ack=Y+1 with ACK flag. Closed ports reply with RST.',
          hints: [
            {
              level: 1,
              text: 'The SYN consumes 1 sequence number, so the acknowledgment number is X + 1.',
            },
            {
              level: 2,
              text: 'A port with no listening service generates a TCP RST to reset the connection immediately.',
            },
          ],
          validation: {
            judgment: [
              {
                kind: 'choose-and-defend',
                prompt:
                  'A client sends a SYN packet with Sequence Number = 1000. What are the Sequence and Acknowledgment numbers in the server\'s SYN-ACK response if the server chooses ISN = 5000?',
                options: [
                  'Sequence Number = 5000, Acknowledgment Number = 1001',
                  'Sequence Number = 1001, Acknowledgment Number = 5000',
                  'Sequence Number = 5001, Acknowledgment Number = 1000',
                  'Sequence Number = 1000, Acknowledgment Number = 5000',
                ],
                correctIndex: 0,
                explanation:
                  'The server introduces its own ISN (Seq = 5000) and acknowledges the client\'s SYN by adding 1 to the client\'s sequence number (Ack = 1001).',
              },
              {
                kind: 'choose-and-defend',
                prompt:
                  'What packet does an operating system return when it receives a TCP SYN for a port on which no service is listening?',
                options: [
                  'An ICMP Echo Reply',
                  'A TCP segment with the RST (Reset) flag set to 1',
                  'A TCP FIN-ACK segment',
                  'It drops the packet silently without sending any response',
                ],
                correctIndex: 1,
                explanation:
                  'RFC 793 dictates that if a SYN arrives at an inactive TCP port and no firewall is silently blocking it, the operating system responds with a TCP RST segment, signaling "Connection Refused".',
              },
            ],
          },
          successMessage:
            'Mastered! You understand the 3-Way Handshake sequence numbers and how TCP RST rejects inactive ports.',
        },
      ],
    },
  ],

  challenge: {
    id: 'net11-challenge',
    title: 'Module 11 Challenge: Transport Socket Analysis & Port Scans',
    scenario:
      'Analyze network socket tables during a security audit and distinguish between active connections, closed ports, and firewalled services.',
    tasks: [
      {
        id: 'net11-ch1-concurrent-socket-binding',
        title: 'Challenge 1: Socket Table Deconstruction',
        description:
          'Inspect an active socket table from `netstat` and identify connection states and 5-tuple uniqueness.',
        instructions: [
          'A web server at 198.51.100.10:443 has 10,000 concurrent client connections.',
          'Two clients with the same public IP 203.0.113.88 (behind corporate NAT) connect simultaneously.',
          'Explain how the web server differentiates their incoming HTTP requests.',
        ],
        type: 'challenge',
        primaryTable: '',
        initialSql: '',
        solutionSql: 'NETWORKING_JUDGMENT_TASK',
        solutionExplanation:
          'The corporate NAT assigns different translated public source ports to each client, ensuring every 5-tuple received by the web server is distinct.',
        hints: [
          {
            level: 1,
            text: 'Even if the source IP is identical, the source port must differ.',
          },
          {
            level: 2,
            text: 'The 5-tuple evaluates (Proto, SrcIP, SrcPort, DstIP, DstPort).',
          },
        ],
        validation: {
          judgment: [
            {
              kind: 'choose-and-defend',
              prompt:
                'How can a single web server maintain distinct TCP sessions with two different devices sharing the exact same public source IP address?',
              options: [
                'The server assigns different MAC addresses to each device',
                'Each client session uses a distinct source port number, ensuring each connection has a completely unique 5-tuple socket definition',
                'The server buffers the first device\'s requests and waits for it to disconnect before answering the second',
                'The web server assigns different VLAN tags to the return traffic',
              ],
              correctIndex: 1,
              explanation:
                'Connection uniqueness is evaluated on all five parameters. As long as the source port is different, the 5-tuple is unique and the sessions operate completely independently.',
            },
          ],
        },
        successMessage:
          'Challenge 1 mastered! You identified how ephemeral port assignment guarantees 5-tuple socket uniqueness across shared IPs.',
      },
      {
        id: 'net11-ch2-tcp-rst-analysis',
        title: 'Challenge 2: Port Scan Diagnosis: Closed vs Filtered Ports',
        description:
          'Determine the difference in network behavior when scanning a closed port versus a firewalled port.',
        instructions: [
          'A security engineer scans server IP 192.168.1.50 with TCP SYN packets to port 22 and port 80.',
          'Port 22 immediately returns a TCP RST packet.',
          'Port 80 produces no response whatsoever until the scanner times out after 3 seconds.',
          'Identify the status of each port.',
        ],
        type: 'challenge',
        primaryTable: '',
        initialSql: '',
        solutionSql: 'NETWORKING_JUDGMENT_TASK',
        solutionExplanation:
          'Port 22 is Closed (the host is alive, but no daemon is listening). Port 80 is Filtered (a firewall dropped the SYN packet silently).',
        hints: [
          {
            level: 1,
            text: 'TCP RST means the host received the packet but no service is listening.',
          },
          {
            level: 2,
            text: 'A timeout with zero response indicates a firewall silently dropped the packet.',
          },
        ],
        validation: {
          judgment: [
            {
              kind: 'choose-and-defend',
              prompt:
                'What does an immediate TCP RST response indicate versus a silent timeout during a TCP port scan?',
              options: [
                'RST indicates the server is powered off; timeout indicates the port is open',
                'RST indicates the port is Closed (host is reachable but no service listens); timeout indicates the port is Filtered (a firewall dropped the packet silently)',
                'RST indicates the port is Open; timeout indicates the port is Closed',
                'Both mean the exact same thing: the host has crashed',
              ],
              correctIndex: 1,
              explanation:
                'An immediate RST confirms the host OS is online and reachable, but actively rejects connections because no process is bound to that port. A timeout indicates an upstream firewall dropped the frame with no response (Filtered).',
            },
          ],
        },
        successMessage:
          'Challenge 2 cleared! You correctly distinguished between an active host\'s closed port RST and a firewall\'s silent packet drop.',
      },
    ],
  },
};
