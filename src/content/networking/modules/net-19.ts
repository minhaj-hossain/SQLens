import { NetworkingModule } from '@/types/networking';

export const NET_19_MODULE: NetworkingModule = {
  id: 'net-19',
  dayNumber: 19,
  title: 'Day 19 · UDP: Fast and Simple',
  shortTitle: 'UDP: Fast and Simple',
  steps: [
    {
      group: 'Idea 1 of 4 · The minimalist transport header',
      chg: 'Since Day 18: You saw that TCP guarantees ordered, lossless delivery through sequence numbers, acknowledgments, retransmission timers, and sliding windows. But this reliability costs 20+ bytes of header overhead, 1 RTT setup latency, and head-of-line blocking. What if an application prioritizes speed and low latency over guaranteed delivery?',
      title: 'The User Datagram Protocol (UDP, RFC 768) and the 8-byte header',
      what:
        'The User Datagram Protocol (UDP, RFC 768) is the simplest possible transport layer protocol on the internet.\n\nUnlike TCP, UDP adds virtually nothing to raw IP datagrams except port addressing and an optional checksum:\n• No connection establishment (no SYN, SYN-ACK, ACK 3-way handshake).\n• No sequence numbers (seq).\n• No acknowledgment numbers (ack).\n• No retransmissions or RTO timers.\n• No flow control or receive windows (win).\n• No congestion control backoff.\n\nThe 8-Byte UDP Header Anatomy:\nWhile a standard TCP header is at least 20 bytes (often 32–40 bytes with options like SACK and Timestamps), the UDP header is strictly fixed at 8 bytes (64 bits):\n1. Source Port (16 bits / 2 bytes): Identifies the sending application process.\n2. Destination Port (16 bits / 2 bytes): Identifies the receiving application process.\n3. Length (16 bits / 2 bytes): The total byte size of the UDP header plus payload (minimum 8 bytes).\n4. Checksum (16 bits / 2 bytes): End-to-end payload & pseudo-header error detection (optional in IPv4, mandatory in IPv6).\n\nDatagram Boundaries vs Byte Streams:\nTCP is a continuous byte stream without message boundaries; an application calling write() three times may be received by read() in one giant chunk.\nUDP preserves explicit Datagram Boundaries: each sendto() call produces exactly one discrete UDP datagram, and each recvfrom() call on the socket receives exactly that one datagram.\n\nLet’s transmit a lightweight UDP datagram from PC1 to our DNS Server and inspect the 8-byte header layout.',
      why: 'Demystifies why UDP exists by contrasting its fixed 8-byte header and message-boundary preservation against TCP\'s heavyweight stateful stream.',
      pic: 'UDP 8-byte header anatomy diagram showing Source Port (2B), Destination Port (2B), Length (2B), Checksum (2B), and application payload.',
      task: 'Send a discrete UDP datagram to the DNS server using udp send 198.51.100.53:53 "domain query".',
      cmd: 'udp send 198.51.100.53:53 "domain query"',
      read: [
        ['Header Size', '8 bytes (Fixed; 60% smaller than 20-byte TCP)'],
        ['Connection State', 'None (0 RTT setup latency; immediate transmission)'],
        ['Message Framing', 'Discrete datagram boundary preserved'],
        ['Header Fields', 'Source Port, Destination Port, Length, Checksum'],
      ],
      rem: 'UDP provides minimalist Layer 4 transport in a fixed 8-byte header with zero connection setup overhead and preserved message boundaries.',
    },
    {
      group: 'Idea 2 of 4 · Head-of-Line blocking & real-time latency',
      chg: 'UDP sends packets immediately with an 8-byte header. But why would an engineer willingly give up TCP\'s guaranteed reliability and retransmission?',
      title: 'Head-of-Line (HoL) blocking and why real-time systems choose packet loss over latency',
      what:
        'To understand why modern infrastructure relies on UDP, we must understand the fundamental curse of reliable byte streams: Head-of-Line (HoL) Blocking.\n\nHow TCP Causes Head-of-Line Blocking:\nTCP guarantees strictly in-order byte reassembly.\nIf a video conference or multiplayer game stream transmits packets 1, 2, 3, 4, 5, and Packet 2 is dropped by a router:\n• Packets 3, 4, and 5 arrive at the receiver kernel socket buffer, BUT the OS kernel refuses to hand them to the application!\n• The entire application freezes until the sender detects loss via 3 Dup ACKs or RTO, retransmits Packet 2, and Packet 2 traverses the internet.\n• If RTT is 80ms, the entire video or audio stream freezes for 80ms to 200ms.\n\nWhy Real-Time Media Prefers Loss to Latency:\nIn VoIP (voice over IP), live video streaming, and competitive gaming:\n• Packet 2 contains audio spoken 100 milliseconds ago or player position from 5 frames ago.\n• If Packet 2 is delayed by 150ms, its data is completely useless! Playing out-of-date audio frames causes jarring echoes or stuttering; rubber-banding game coordinates breaks gameplay physics.\n• Modern audio codecs (such as Opus) use Packet Loss Concealment (PLC) to interpolate and synthesize minor lost audio frames imperceptibly.\n\nUDP delivers Packets 3, 4, and 5 immediately to the application without waiting for Packet 2. In real-time systems, staleness is far worse than loss.\n\nLet’s simulate a live audio stream under 10% packet drop and inspect how UDP delivers audio chunks without stalling.',
      why: 'Explains the physical and mathematical reality of Head-of-Line blocking and why latency-critical applications intentionally accept loss.',
      pic: 'Comparison timeline showing TCP HoL blocking (queue stalls behind dropped packet #2) vs UDP immediate delivery (packet #2 skipped, packets #3..#5 delivered instantly).',
      task: 'Stream real-time audio datagrams and observe latency under packet loss using udp stream --codec opus.',
      cmd: 'udp stream --codec opus',
      read: [
        ['Head-of-Line Blocking', '0 ms delay (Packets never queued behind lost segments)'],
        ['Drop Behavior', 'Packet #2 dropped; Packets #3..#5 delivered without stall'],
        ['Audio Quality', 'Opus PLC conceals isolated drop; continuous playback'],
        ['Transmission Latency', 'Immediate 0-RTT frame delivery'],
      ],
      rem: 'TCP guarantees ordered reliability at the cost of Head-of-Line blocking; UDP eliminates blocking so real-time applications never stall on lost packets.',
    },
    {
      group: 'Idea 3 of 4 · Stateless sockets & multiplexing',
      chg: 'UDP delivers packets immediately without blocking. But without a 3-way handshake to bind a connection, how do operating systems manage UDP sockets and direct replies?',
      title: 'Stateless sockets, socket buffers, and connected UDP sockets',
      what:
        'Unlike TCP where every connection maintains an explicit state machine (SYN_SENT, ESTABLISHED, TIME_WAIT) and dedicated send/receive buffers in kernel memory:\n\nUDP is completely Stateless:\n• The OS kernel maintains no handshake records, sequence counters, or connection timers.\n• A single UDP socket listening on port 53 can receive datagrams from thousands of distinct remote clients simultaneously through a single file descriptor!\n\nHow UDP Multiplexing Works:\n• When a UDP datagram arrives on a network interface, the kernel inspects the 16-bit Destination Port.\n• It places the payload and the sender\'s source (IP, Port) into the matching socket\'s receive buffer queue.\n• The application calls recvfrom(&buf, &sender_addr) and immediately reads the sender\'s address along with the payload.\n\nConnected UDP Sockets (connect() on UDP):\nEngineers are often surprised to learn that you can call connect() on a UDP socket!\n• On a UDP socket, connect() does NOT transmit any network packets (no SYN)!\n• Instead, it simply sets an OS kernel filter: the socket will only accept incoming datagrams from that specific (IP, Port), and application calls to send() or write() will automatically use that destination without needing sendto().\n• This also allows the kernel to report asynchronous ICMP Port Unreachable errors to the application.\n\nLet’s inspect our system’s active UDP sockets and buffer queues using ss -uan.',
      why: 'Clarifies how the OS kernel handles UDP sockets without state machines and introduces the mechanics of connect() on datagram sockets.',
      pic: 'Kernel UDP socket demultiplexing diagram showing multiple incoming datagrams from different source IPs hitting a single port 53 socket buffer.',
      task: 'Inspect active UDP sockets and receive buffer queues using ss -uan.',
      cmd: 'ss -uan',
      read: [
        ['Socket State', 'UNCONN (Unconnected stateless datagram socket)'],
        ['Kernel Memory Overhead', 'Negligible (No state machine, timers, or TCBs)'],
        ['Multiplexing Model', 'Single socket accepts datagrams from any client IP'],
        ['Queue Behavior', 'Recv-Q holds discrete datagrams; drops on overflow'],
      ],
      rem: 'UDP sockets are stateless; a single socket can receive datagrams from multiple endpoints without connection control blocks.',
    },
    {
      group: 'Idea 4 of 4 · Modern transport: QUIC & HTTP/3',
      chg: 'UDP offers zero overhead and no HoL blocking, but raw UDP has no loss recovery or congestion control. If an application needs both high speed and reliability, what can we do?',
      title: 'Application-layer reliability, Forward Error Correction, and QUIC (HTTP/3)',
      what:
        'Historically, engineers faced a binary trade-off:\n• Choose TCP for reliability, but suffer 3-way handshake RTT latency, TLS round trips, and Head-of-Line blocking.\n• Choose UDP for raw speed, but write your own retransmission logic if you need guaranteed delivery.\n\nThe Modern Solution: Reliability in Userspace over UDP:\nBecause UDP imposes zero protocol constraints, applications are free to implement custom, intelligent reliability algorithms in userspace without changing OS kernel code:\n\n1. Forward Error Correction (FEC):\n• Send redundant parity packets alongside data packets (e.g. 10 data packets + 2 XOR parity packets).\n• If any 1 or 2 packets are dropped, the receiver mathematically reconstructs the lost packets instantly without asking for a retransmission!\n\n2. QUIC (RFC 9000) & HTTP/3:\nThe most revolutionary transport protocol of the past 20 years: Google and the IETF built QUIC on top of UDP.\nSolves TCP\'s fundamental flaws while running over universal UDP (Port 443):\n• 0-RTT Connection Setup: Combines transport handshake and TLS 1.3 cryptographic handshake into a single flight.\n• Independent Multi-Stream Multiplexing: Eliminates Head-of-Line blocking! If Stream A drops a packet, Stream B and Stream C continue flowing without pausing.\n• Connection Migration: When a smartphone switches from Wi-Fi to 5G cellular, the IP address changes. TCP connections break and must re-handshake; QUIC uses a 64-bit Connection ID that survives IP and port changes without disconnecting!\n\nLet’s test a modern QUIC / HTTP/3 query over UDP port 443 and verify 0-RTT independent streaming.',
      why: 'Connects fundamental Layer 4 concepts to cutting-edge production internet protocols (QUIC, HTTP/3, and WebRTC).',
      pic: 'Comparison diagram showing TCP+TLS (3 RTTs, single stream HoL blocking) vs QUIC over UDP (0-1 RTT, multi-stream isolation, connection ID migration).',
      task: 'Probe an HTTP/3 endpoint over UDP using quic probe 198.51.100.10:443.',
      cmd: 'quic probe 198.51.100.10:443',
      read: [
        ['Underlying Protocol', 'UDP (Port 443 / RFC 9000 QUIC)'],
        ['Handshake Latency', '0-RTT / 1-RTT (Transport + TLS 1.3 integrated)'],
        ['HoL Blocking', 'Stream-level isolation (Stream drop does not stall peers)'],
        ['Connection Mobility', '64-bit Connection ID survives Wi-Fi → 5G cellular IP change'],
      ],
      rem: 'QUIC builds multiplexed, encrypted reliability on top of UDP, eliminating TCP\'s connection latency and head-of-line blocking.',
    },
    {
      group: 'Recap',
      chg: 'You have completed the exploration of transport protocols across Stage 5: Ports (Day 16), TCP connection states (Day 17), TCP reliable byte streams (Day 18), and UDP minimalist datagrams (Day 19).',
      title: 'The four core invariants of UDP & TCP vs UDP transport comparison',
      what:
        'The Transport Layer (Layer 4) provides two distinct philosophical approaches to data transfer:\n\n1. UDP (Minimalist, Connectionless, Datagrams):\nFixed 8-byte header, zero handshake latency, preserved message boundaries, and zero Head-of-Line blocking. Ideal for real-time media, DNS lookups, competitive gaming, telemetry, and modern userspace transport protocols like QUIC / HTTP/3.\n\n2. TCP (Stateful, Connection-Oriented, Byte Streams):\n20+ byte header, 3-way handshake synchronization, strict cumulative acknowledgments, dynamic RTO retransmission with exponential backoff, and sliding window flow control. Ideal for file downloads, transactional databases, and critical document transfers where 100% losslessness is strictly required.\n\nBy understanding both transport models, you can architect distributed networks that balance absolute reliability against lowest possible latency.',
      why: 'Synthesizes Stage 5 (Path & Transport: Days 14–19) and sets the stage for Stage 6: Dynamic Routing (Days 20–23).',
      pic: 'Master Transport Layer comparison cheat sheet contrasting TCP vs UDP across Header size, Connection state, Reliability, Ordering, and Use cases.',
      task: 'Review the four fundamental invariants of UDP and transport protocol selection.',
      cmd: null,
      read: [
        ['1. Minimal Overhead', '8-byte header; no sequence numbers, ACKs, or state machines'],
        ['2. Zero HoL Blocking', 'Packet loss never freezes subsequent datagrams; ideal for real-time media'],
        ['3. Datagram Boundaries', 'sendto() preserves discrete message sizes; no byte stream slicing'],
        ['4. Modern Foundation', 'UDP powers DNS, WebRTC, and HTTP/3 QUIC across the modern internet'],
      ],
      rem: 'UDP provides lightweight, connectionless transport without head-of-line blocking; modern protocols build userspace reliability on top of UDP.',
    },
  ],
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
  },
};
