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
          '### Beat 1: Direct Physical Reality — The Multiplexing Dilemma',
          'At any given second, a single laptop network card is receiving millions of raw electrical and optical pulses representing a video conference, music stream, five open browser tabs, an SSH terminal, and background cloud syncing.',
          'The Layer 3 Internet Protocol delivers packets from host IP to host IP, but IP has **no mechanism to determine which running software process owns which packet**.',
          'Without Layer 4 transport multiplexing, the operating system kernel would have no way to distinguish a Zoom audio packet from a banking web page.',
          '',
          '### Beat 2: The Core Mechanism — Port Numbers & The 5-Tuple Socket',
          'The transport layer solves this by introducing **16-bit Port Numbers** ($2^{16} = 65,536$ unique ports, 0 to 65,535):',
          '- **Well-Known Ports (0–1023)**: Reserved for privileged system daemons (HTTP 80, HTTPS 443, SSH 22, DNS 53, DHCP 67/68). Bound only by administrator/root privileges.',
          '- **Registered Ports (1024–49,151)**: Vendor and database services (MySQL 3306, PostgreSQL 5432, Redis 6379, RDP 3389).',
          '- **Dynamic / Ephemeral Ports (49,152–65,535)**: Temporary source ports assigned automatically by the OS kernel to outbound client connections.',
          '',
          '### The 5-Tuple Socket Identifier',
          'An active network connection is not defined by IP address alone. The kernel indexes every open socket by its unique **5-tuple**:',
          '$$\\text{5-Tuple} = \\langle \\text{Protocol, Source IP, Source Port, Destination IP, Destination Port} \\rangle$$',
          'When you open three concurrent tabs to `github.com` (`140.82.121.4:443`), each connection receives a distinct ephemeral source port (e.g. `52001`, `52002`, `52003`). Even though Protocol (TCP), Source IP, Destination IP, and Destination Port are identical across all three tabs, the **unique source port makes each 5-tuple distinct in OS memory**.',
          '',
          '### Beat 3: Failure Modes & Workplace Diagnostics (Ticket #113)',
          'Common enterprise socket and port issues:',
          '- **Port Binding Conflicts (`EADDRINUSE`)**: Occurs when a developer starts a local server (e.g. Node.js on port 3000) while another background process is already bound to that port.',
          '- **Ephemeral Port Exhaustion**: High-volume microservices or database connection pools opening thousands of connections per second without connection reuse can deplete ports 49152–65535, causing connection timeouts.',
          '- **Socket Diagnostics**: Inspect listening services and active sockets using Windows PowerShell (`netstat -ano -p tcp`, `Get-NetTCPConnection`) vs Linux (`ss -tulpn`).',
        ],
        keyTakeaway:
          'Ports multiplex traffic to applications. Outbound connections receive unique ephemeral source ports, creating distinct 5-tuple sockets.',
        exampleQuery: '',
        exampleQueryExplanation: '',
        mcqs: [
          {
            id: 'net11-mcq-port-ranges',
            question:
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
          {
            id: 'net11-mcq-5tuple-uniqueness',
            question:
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
        ],
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
            'Inspect live 5-tuple socket bindings, listening ports, and owning process IDs using Windows (`netstat -ano`) and Linux (`ss -tulpn`).',
          ],
          type: 'guided',
          primaryTable: '',
          initialSql: '',
          solutionSql: 'NETWORKING_JUDGMENT_TASK',
          solutionExplanation:
            'The OS assigns unique ephemeral source ports (e.g. 52001 and 52002), making each 5-tuple completely unique even though destination IP and destination port are identical.',
          terminal: {
            title: 'Workplace Diagnostic Terminal — Ticket #113 (Dual OS)',
            description:
              'Inspect active 5-tuple socket connections, established states, listening ports, and owning process IDs on Windows and Linux workstations.',
            prompt: 'admin@bastion:~$',
            initialOutput: [
              '====================================================================',
              '  WORKPLACE TICKET #113: 5-TUPLE SOCKET & PROCESS PORT AUDIT',
              '====================================================================',
              'Inspecting active TCP connections, established states, and process IDs.',
              'Supported commands:',
              '  - Windows: netstat -ano -p tcp',
              '             Get-NetTCPConnection',
              '             Get-NetTCPConnection -State Established',
              '  - Linux:   ss -tulpn',
              '             ss -t state established',
            ].join('\n'),
            availableCommands: [
              'netstat -ano -p tcp',
              'Get-NetTCPConnection',
              'Get-NetTCPConnection -State Established',
              'ss -tulpn',
              'ss -t state established',
            ],
            commands: {
              'netstat -ano -p tcp': `Active Connections

  Proto  Local Address          Foreign Address        State           PID
  TCP    0.0.0.0:135            0.0.0.0:0              LISTENING       840
  TCP    0.0.0.0:445            0.0.0.0:0              LISTENING       4
  TCP    192.168.1.100:52001    140.82.121.4:443       ESTABLISHED     4812
  TCP    192.168.1.100:52002    140.82.121.4:443       ESTABLISHED     4812
  TCP    192.168.1.100:52110    198.51.100.20:443      TIME_WAIT       0`,
              'Get-NetTCPConnection': `LocalAddress   LocalPort RemoteAddress   RemotePort State       AppliedSetting OwningProcess
------------   --------- -------------   ---------- -----       -------------- -------------
192.168.1.100  52001     140.82.121.4    443        Established Internet       4812
192.168.1.100  52002     140.82.121.4    443        Established Internet       4812`,
              'Get-NetTCPConnection -State Established': `LocalAddress   LocalPort RemoteAddress   RemotePort State       AppliedSetting OwningProcess
------------   --------- -------------   ---------- -----       -------------- -------------
192.168.1.100  52001     140.82.121.4    443        Established Internet       4812
192.168.1.100  52002     140.82.121.4    443        Established Internet       4812`,
              'ss -tulpn': `Netid State      Recv-Q Send-Q   Local Address:Port    Peer Address:Port Process                               
tcp   LISTEN     0      128            0.0.0.0:22           0.0.0.0:*     users:(("sshd",pid=712,fd=3))         
tcp   LISTEN     0      511          127.0.0.1:3000         0.0.0.0:*     users:(("node",pid=3412,fd=19))       
tcp   ESTAB      0      0        192.168.1.100:52001   140.82.121.4:443   users:(("chrome",pid=4812,fd=42))     
tcp   ESTAB      0      0        192.168.1.100:52002   140.82.121.4:443   users:(("chrome",pid=4812,fd=45))`,
              'ss -t state established': `Recv-Q Send-Q   Local Address:Port    Peer Address:Port
0      0        192.168.1.100:52001   140.82.121.4:https
0      0        192.168.1.100:52002   140.82.121.4:https`,
            },
            commandResponses: {
              'netstat -ano -p tcp': `Active Connections

  Proto  Local Address          Foreign Address        State           PID
  TCP    0.0.0.0:135            0.0.0.0:0              LISTENING       840
  TCP    0.0.0.0:445            0.0.0.0:0              LISTENING       4
  TCP    192.168.1.100:52001    140.82.121.4:443       ESTABLISHED     4812
  TCP    192.168.1.100:52002    140.82.121.4:443       ESTABLISHED     4812
  TCP    192.168.1.100:52110    198.51.100.20:443      TIME_WAIT       0`,
              'Get-NetTCPConnection -State Established': `LocalAddress   LocalPort RemoteAddress   RemotePort State       AppliedSetting OwningProcess
------------   --------- -------------   ---------- -----       -------------- -------------
192.168.1.100  52001     140.82.121.4    443        Established Internet       4812
192.168.1.100  52002     140.82.121.4    443        Established Internet       4812`,
              'ss -tulpn': `Netid State      Recv-Q Send-Q   Local Address:Port    Peer Address:Port Process                               
tcp   LISTEN     0      128            0.0.0.0:22           0.0.0.0:*     users:(("sshd",pid=712,fd=3))         
tcp   LISTEN     0      511          127.0.0.1:3000         0.0.0.0:*     users:(("node",pid=3412,fd=19))       
tcp   ESTAB      0      0        192.168.1.100:52001   140.82.121.4:443   users:(("chrome",pid=4812,fd=42))     
tcp   ESTAB      0      0        192.168.1.100:52002   140.82.121.4:443   users:(("chrome",pid=4812,fd=45))`,
              'ss -t state established': `Recv-Q Send-Q   Local Address:Port    Peer Address:Port
0      0        192.168.1.100:52001   140.82.121.4:https
0      0        192.168.1.100:52002   140.82.121.4:https`,
            },
          },
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
          '### Beat 1: Direct Physical Reality — The Burden of Reliability',
          'TCP guarantees that every single byte transmitted will arrive in perfect order, without duplication, retransmitting missing segments until acknowledged.',
          'While essential for file transfers and web code, this guarantee introduces a fatal flaw for real-time media: **latency and jitter**.',
          'In a live voice call (VoIP) or fast-paced online game, if a packet is lost at millisecond 100, retransmitting it at millisecond 350 is useless — the speaker has already spoken, and the player has already moved. Delaying the entire stream to wait for late bytes ruins the real-time experience.',
          '',
          '### Beat 2: The Core Mechanism — The 8-Byte UDP Header',
          'RFC 768 defines the User Datagram Protocol (UDP) as a connectionless, best-effort delivery mechanism.',
          'The UDP header is exactly **8 bytes (64 bits)**, consisting of just four 16-bit fields:',
          '1. **Source Port (16 bits)**: Sender port number.',
          '2. **Destination Port (16 bits)**: Target service port number.',
          '3. **Length (16 bits)**: Total byte length of the UDP header plus payload.',
          '4. **Checksum (16 bits)**: One’s complement checksum covering the pseudo-IP header, UDP header, and payload. (Provides error detection; if the checksum fails, the receiver **silently drops** the packet without retransmission).',
          '',
          '### Core UDP Protocol Characteristics',
          '- **Connectionless**: No 3-way handshake. Applications transmit immediately.',
          '- **No Acknowledgments or Retransmissions**: The sender does not wait for ACKs.',
          '- **No Flow or Congestion Control**: Senders transmit as fast as the application generates data.',
          '- **Unordered Delivery**: Datagrams may arrive out of order; applications must sort them if required.',
          '',
          '### Beat 3: Failure Modes & Workplace Diagnostics',
          '- **UDP Buffer Overflows**: Because UDP has no flow control (no receive window signaling), an aggressive sender can easily overflow the receiver’s OS socket buffer, causing silent packet drops.',
          '- **Amplification Attacks**: Because UDP lacks connection state and allows source IP spoofing, attackers abuse public NTP/DNS/SNMP servers to bounce massive responses to victim IPs (DDoS amplification).',
        ],
        keyTakeaway:
          'UDP has an 8-byte header and zero handshake overhead. Checksum failures result in silent drops without retransmission.',
        exampleQuery: '',
        exampleQueryExplanation: '',
        mcqs: [
          {
            id: 'net11-mcq-udp-overhead',
            question:
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
            id: 'net11-mcq-udp-usecases',
            question:
              'Why do live voice calls (VoIP) and online multiplayer games choose UDP over TCP?',
            options: [
              'Because UDP encrypts all voice data with hardware acceleration',
              'Because waiting for TCP to retransmit lost packets causes stream freezes; real-time protocols prefer dropping a lost packet to maintain zero-latency playback',
              'Because UDP is the only protocol permitted on Wi-Fi networks',
              'Because UDP guarantees 100% packet delivery across WAN links',
            ],
            correctIndex: 1,
            explanation:
              'Real-time audio and gaming require immediate low-latency delivery. Waiting for TCP retransmissions creates intolerable audio jitter and lag.',
          },
        ],
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
          '### Beat 1: Direct Physical Reality — Synchronizing Across an Unreliable Mesh',
          'Two computers thousands of miles apart across the global internet mesh want to exchange a critical file or financial transaction.',
          'Packets can be delayed, duplicated, re-routed, or lost entirely by transit routers.',
          'Before transferring a single byte of application data, both machines must agree on starting sequence numbers, allocate buffer memory in OS kernel space, and confirm bidirectional path viability.',
          '',
          '### Beat 2: The Core Mechanism — Control Flags & The 3-Way Handshake',
          'The 20-byte base TCP header contains six 1-bit control flags: **SYN, ACK, FIN, RST, PSH, URG**.',
          '',
          'Connection establishment executes via the **3-Way Handshake**:',
          '1. **Step 1: Client ➔ Server (SYN)**:',
          '   - Client chooses a pseudo-random **Initial Sequence Number (ISN)** $X$ (e.g. $1000$).',
          '   - Sends TCP segment with **`SYN=1, ACK=0`**, `Seq = 1000`.',
          '   - Client enters state `SYN_SENT`.',
          '2. **Step 2: Server ➔ Client (SYN-ACK)**:',
          '   - Server receives the SYN, allocates a transmission control block (TCB) buffer in kernel RAM.',
          '   - Server chooses its own random ISN $Y$ (e.g. $5000$).',
          '   - Server acknowledges the client’s SYN by setting **`Ack = X + 1`** ($1001$). (The SYN bit consumes 1 sequence number!).',
          '   - Sends TCP segment with **`SYN=1, ACK=1`**, `Seq = 5000`, `Ack = 1001`.',
          '   - Server enters state `SYN_RECEIVED`.',
          '3. **Step 3: Client ➔ Server (ACK)**:',
          '   - Client acknowledges server’s SYN by setting **`Ack = Y + 1`** ($5001$).',
          '   - Sends TCP segment with **`SYN=0, ACK=1`**, `Seq = 1001`, `Ack = 5001`.',
          '   - Both endpoints enter state **`ESTABLISHED`**. Data transfer may now proceed!',
          '',
          '### Closed Port Rejection: The TCP RST Flag',
          'If a client sends a SYN packet to a server port where **no application service is actively listening** (and no stateful firewall intercepts it):',
          '- The operating system kernel immediately generates a packet with the **RST (Reset)** flag set to 1 (`RST=1, ACK=1`).',
          '- This instantly informs the client application that the connection was refused, terminating the socket attempt without waiting for timeouts.',
          '',
          '### Beat 3: Failure Modes & Workplace Diagnostics',
          '- **SYN Flood Denial of Service (DoS)**: An attacker floods millions of SYN packets with forged source IPs. The server allocates buffer memory for each and waits in `SYN_RECEIVED`, exhausting kernel memory. Mitigated via **SYN Cookies** (encoding connection state into the server’s ISN instead of allocating memory).',
          '- **Connection Refused vs. Connection Timed Out**: "Connection Refused" means the host was reached and emitted an explicit TCP RST. "Connection Timed Out" means packets were silently dropped along the path by a firewall or dead router.',
        ],
        keyTakeaway:
          'The 3-way handshake synchronizes sequence numbers before data transfer. Closed ports emit an immediate TCP RST.',
        exampleQuery: '',
        exampleQueryExplanation: '',
        mcqs: [
          {
            id: 'net11-mcq-syn-ack-flags',
            question:
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
            id: 'net11-mcq-closed-port-rst',
            question:
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
