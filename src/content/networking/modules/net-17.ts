import { NetworkingModule } from '@/types/networking';

export const NET_17_MODULE: NetworkingModule = {
  id: 'net-17',
  dayNumber: 17,
  title: 'Day 17 · TCP: Opening and Closing a Connection',
  shortTitle: 'TCP: Opening and Closing a Connection',
  steps: [
    {
      group: 'Idea 1 of 4 · Sequence synchronization',
      chg: 'Since Day 16: You learned that ports direct packets to application processes. But Internet Protocol (IP) is completely connectionless and stateless—packets can arrive out of order, get duplicated, or disappear. How does TCP create a reliable byte stream over an unreliable network?',
      title: 'The need for connection state and Initial Sequence Numbers (ISN)',
      what:
        'Internet Protocol (IP) operates strictly on best-effort datagram delivery. It has no memory: each IP packet is routed independently, with no awareness of past or future packets.\n\nTo provide applications with an ordered, error-free byte stream, the Transmission Control Protocol (TCP, RFC 793 / RFC 9293) establishes a Connection.\nA TCP connection is not a physical circuit or a dedicated wire; it is synchronized state maintained in the operating system kernel memory of both endpoints.\n\nThe 20-Byte TCP Header:\nInside every TCP segment, immediately following the 16-bit Source and Destination Ports, lie two critical 32-bit counters:\n1. Sequence Number (32 bits): Identifies the exact byte position in the sender’s data stream.\n2. Acknowledgment Number (32 bits): Confirms the next byte the receiver expects to receive.\n3. Control Flags (6 bits): Single-bit switches, including SYN (Synchronize), ACK (Acknowledge), FIN (Finish), and RST (Reset).\n\nThe Initial Sequence Number (ISN):\nWhen establishing a new connection, TCP does NOT start counting bytes from 0!\nIf both endpoints started at seq=0, a delayed duplicate packet from an old, closed connection could wander into a new connection sharing the same 5-tuple and corrupt the application data.\nTo prevent this, the OS kernel generates a pseudo-random 32-bit Initial Sequence Number (ISN) based on a cryptographic clock (RFC 6528).\n\nBefore a single byte of application payload can be transmitted, both hosts must exchange and synchronize their respective ISNs.\n\nLet’s initiate a TCP connection from PC1 to our Web Server and inspect the outgoing SYN segment.',
      why: 'Explains why state synchronization is required before data transfer and clarifies why sequence numbers start at random 32-bit values instead of zero.',
      pic: 'TCP segment header diagram detailing 32-bit Sequence Number, 32-bit Acknowledgment Number, and 1-bit Control Flags (SYN, ACK, FIN, RST).',
      task: 'Send an initial TCP synchronization segment using tcp connect 198.51.100.10:80.',
      cmd: 'tcp connect 198.51.100.10:80',
      read: [
        ['TCP Control Flags', 'SYN=1, ACK=0, FIN=0, RST=0 (Connection Initiation Request)'],
        ['Client ISN (Sequence)', 'seq = 1000 (Randomized 32-bit client byte anchor)'],
        ['Acknowledgment Field', 'ack = 0 (Unset; no incoming stream acknowledged yet)'],
        ['Client State Transition', 'CLOSED → SYN_SENT (Kernel awaits server acknowledgment)'],
      ],
      rem: 'TCP establishes synchronized kernel state between endpoints; sequence numbers start at a randomized 32-bit ISN to prevent duplicate segment corruption.',
    },
    {
      group: 'Idea 2 of 4 · The 3-way handshake',
      chg: 'PC1 sent a SYN with seq=1000 and entered SYN_SENT. Now let’s examine how the server responds, and why exactly three packets are physically necessary to open a reliable connection.',
      title: 'SYN → SYN-ACK → ACK: Why three packets are mandatory',
      what:
        'The fundamental law of TCP connection setup is the 3-Way Handshake:\n\nPacket 1: Client → Server [SYN]\n• Flags: SYN=1, ACK=0\n• Sequence: seq = ISN_c (e.g. 1000)\n• Meaning: "Client wishes to connect. My stream starts at byte 1000."\n• Client state: CLOSED → SYN_SENT.\n\nPacket 2: Server → Client [SYN, ACK]\n• Flags: SYN=1, ACK=1\n• Sequence: seq = ISN_s (e.g. 5000) — Server announces its own random ISN!\n• Acknowledgment: ack = 1001 (ISN_c + 1) — Confirms receipt of the client\'s SYN!\n• Meaning: "I acknowledge your byte 1000. My stream starts at byte 5000."\n• Server state: LISTEN → SYN_RECEIVED.\n\nPacket 3: Client → Server [ACK]\n• Flags: SYN=0, ACK=1\n• Sequence: seq = 1001\n• Acknowledgment: ack = 5001 (ISN_s + 1) — Confirms receipt of the server\'s SYN!\n• Meaning: "I acknowledge your byte 5000. Connection established."\n• Client & Server states: SYN_SENT / SYN_RECEIVED → ESTABLISHED!\n\nWhy Couldn\'t We Use a 2-Way Handshake?\nSuppose TCP only used 2 packets (SYN and SYN-ACK). If the server sends SYN-ACK, the server would have to allocate memory buffers immediately. But in a network where packets get delayed:\n• An old, duplicate SYN arrives at the server.\n• The server replies SYN-ACK and assumes the connection is open!\n• But the client never requested it, so it ignores the SYN-ACK.\n• The server is left with a "ghost" half-open connection wasting memory!\nThe 3rd packet (ACK from the client) proves to the server that the client is actually alive and capable of receiving traffic.\n\nLet’s inspect the active kernel socket table to verify the ESTABLISHED state.',
      why: 'Deconstructs why two-way handshakes fail in distributed systems and shows exact sequence/acknowledgment increments during setup.',
      pic: 'Three-step ladder diagram showing SYN (seq=1000), SYN-ACK (seq=5000, ack=1001), and ACK (seq=1001, ack=5001) transitioning sockets to ESTABLISHED.',
      task: 'Inspect active TCP socket states using ss -tan state established.',
      cmd: 'ss -tan state established',
      read: [
        ['Packet 1 (SYN)', 'Client announces ISN_c=1000; enters SYN_SENT'],
        ['Packet 2 (SYN-ACK)', 'Server announces ISN_s=5000, acknowledges ack=1001; enters SYN_RECEIVED'],
        ['Packet 3 (ACK)', 'Client acknowledges ack=5001; both endpoints transition to ESTABLISHED'],
        ['Active Sockets', '192.168.1.10:52101 ↔ 198.51.100.10:80 (ESTABLISHED)'],
      ],
      rem: 'The 3-way handshake synchronizes both ISNs and proves bidirectional connectivity before buffers are committed.',
    },
    {
      group: 'Idea 3 of 4 · Connection termination',
      chg: 'Data transfer has concluded. Now both hosts must close the connection. Because TCP is full-duplex, closing is fundamentally different from opening.',
      title: 'FIN → ACK → FIN → ACK: Full-duplex graceful termination',
      what:
        'A TCP connection is Full-Duplex: it consists of two independent byte streams running in opposite directions:\n• Outbound stream: Client → Server\n• Inbound stream: Server → Client\n\nBecause each direction is independent, closing one direction does NOT automatically close the other!\nGraceful termination requires a 4-Way Teardown:\n\n1. Client sends FIN [seq=u, ack=v]:\n• Flags: FIN=1, ACK=1\n• Meaning: "Client has finished transmitting data bytes."\n• Client state: ESTABLISHED → FIN_WAIT_1.\n\n2. Server replies ACK [ack=u+1]:\n• Meaning: "Server acknowledges client\'s FIN."\n• Server state: ESTABLISHED → CLOSE_WAIT.\n• Client state: FIN_WAIT_1 → FIN_WAIT_2.\n• Crucial Architectural State: The connection is now Half-Closed! The client can no longer send application bytes, but the server can still transmit remaining data back to the client!\n\n3. Server finishes and sends FIN [seq=w, ack=u+1]:\n• Meaning: "Server has also finished transmitting data bytes."\n• Server state: CLOSE_WAIT → LAST_ACK.\n\n4. Client replies ACK [ack=w+1]:\n• Meaning: "Client acknowledges server\'s FIN."\n• Server state: LAST_ACK → CLOSED (memory released immediately).\n• Client state: FIN_WAIT_2 → TIME_WAIT.\n\nNotice that the active closer (the client) does not transition directly to CLOSED! It enters the TIME_WAIT state.\n\nLet’s execute a graceful connection closure and observe the socket teardown sequence.',
      why: 'Explains the full-duplex nature of TCP where independent byte streams require a 4-step teardown and introduces the half-closed CLOSE_WAIT state.',
      pic: 'Four-step teardown ladder diagram illustrating FIN_WAIT_1, CLOSE_WAIT, FIN_WAIT_2, LAST_ACK, and transition into TIME_WAIT.',
      task: 'Terminate the connection using tcp close 198.51.100.10:80.',
      cmd: 'tcp close 198.51.100.10:80',
      read: [
        ['Step 1 (Client FIN)', 'Client announces end-of-data; transitions to FIN_WAIT_1'],
        ['Step 2 (Server ACK)', 'Server acknowledges FIN; transitions to CLOSE_WAIT (Half-Closed)'],
        ['Step 3 (Server FIN)', 'Server finishes queued transmission; transitions to LAST_ACK'],
        ['Step 4 (Client ACK)', 'Client acknowledges server FIN; transitions to TIME_WAIT'],
      ],
      rem: 'TCP teardown requires 4 steps because connections are full-duplex; each direction must be terminated independently.',
    },
    {
      group: 'Idea 4 of 4 · The TIME_WAIT invariant',
      chg: 'The server received our final ACK and closed. But on our client machine, the socket lingers in TIME_WAIT for 60 to 120 seconds. Why does the operating system refuse to immediately destroy the socket?',
      title: 'Why TIME_WAIT exists: The 2MSL safety timer',
      what:
        'When a host initiates an active close, its socket remains in TIME_WAIT for a duration equal to 2MSL (Maximum Segment Lifetime, RFC 793).\nIn modern Linux systems, MSL is defined as 30 or 60 seconds, meaning TIME_WAIT lasts 60 to 120 seconds.\n\nEngineers often ask: "Why waste resources keeping a closed socket in memory?"\nTIME_WAIT is mandatory for two physical network realities:\n\n1. Reliability: Guaranteeing the Final ACK Was Received\nSuppose the client\'s final ACK (Step 4) is dropped by an intermediate router.\n• The server\'s retransmission timer fires, and the server resends its FIN!\n• If the client had immediately transitioned to CLOSED, it would have no record of the connection. When the server\'s duplicate FIN arrived, the client kernel would reply with TCP RST (Reset), indicating an unexpected packet!\n• The server application would report a "Connection reset by peer" error instead of a clean, graceful shutdown.\nBecause the client stays in TIME_WAIT, it can re-transmit the final ACK if it sees another FIN.\n\n2. Safety: Preventing Stray Segment Cross-Talk\nIP packets can be delayed in router queue buffers across the internet for dozens of seconds.\nSuppose the client immediately closed and immediately opened a new connection to the same server using the exact same ephemeral port (reusing the 5-tuple).\nIf a delayed duplicate packet from the old connection suddenly emerged from the network, the new connection would accept it as valid data, corrupting the application payload!\nThe 2MSL duration ensures all delayed segments belonging to the previous connection have expired and dropped out of the internet before the 5-tuple can be reused.\n\nLet’s inspect our client’s TIME_WAIT socket and its countdown timer.',
      why: 'Solves one of the most persistent interview questions and production troubleshooting dilemmas in backend engineering (TIME_WAIT socket exhaustion).',
      pic: '2MSL timeline diagram showing how the TIME_WAIT buffer absorbs retransmitted FINs and guarantees stray delayed IP packets expire.',
      task: 'Inspect sockets in the TIME_WAIT state using ss -tan state time-wait.',
      cmd: 'ss -tan state time-wait',
      read: [
        ['Socket State', 'TIME_WAIT (Active close initiated by client)'],
        ['Duration (2MSL)', '2 × Maximum Segment Lifetime = 60 seconds countdown'],
        ['Purpose 1 (Reliability)', 'Retransmits final ACK if server re-sends FIN'],
        ['Purpose 2 (Safety)', 'Drains delayed duplicate packets from network before 5-tuple reuse'],
      ],
      rem: 'The 2MSL TIME_WAIT state guarantees that the peer received the final ACK and prevents delayed duplicate segments from corrupting future connections.',
    },
    {
      group: 'Recap',
      title: 'The four rules of TCP connection management',
      what:
        'TCP provides ordered, full-duplex reliability on top of unreliable IP networks. By governing connection opening with the 3-way handshake and termination with the 4-way teardown and TIME_WAIT timer, TCP guarantees data integrity across the global internet.',
      why: 'Consolidates the TCP state machine before exploring sequence numbering, sliding windows, and reliable retransmission in Day 18.',
      pic: 'Master TCP lifecycle state machine diagram displaying CLOSED → SYN_SENT → ESTABLISHED → FIN_WAIT_1 → FIN_WAIT_2 → TIME_WAIT → CLOSED.',
      task: 'Review the four fundamental rules of TCP connection establishment and teardown.',
      cmd: null,
      read: [
        ['1. State Synchronization', 'Randomized 32-bit ISNs synchronize byte counters before payload transmission'],
        ['2. 3-Way Handshake', 'SYN → SYN-ACK → ACK proves bidirectional reachability and commits kernel buffers'],
        ['3. 4-Way Teardown', 'Full-duplex channels close independently; CLOSE_WAIT allows half-closed draining'],
        ['4. 2MSL TIME_WAIT', 'Lingers 60–120s to ensure clean peer closure and prevent stray packet corruption'],
      ],
      rem: 'TCP state transitions guarantee synchronized byte tracking and safe connection teardown.',
    },
  ],
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
  },
};
