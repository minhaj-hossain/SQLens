import { ModuleData } from '../../../types/curriculum';

/**
 * net-01: The End-to-End Communication Journey
 * ─────────────────────────────────────────────────────────────────────────────
 * Milestone 1 — Concepts C01, C02, C03, C04, C05
 * Teaches why computer networks exist, the distinction between endpoints and
 * intermediary devices, the parcel encapsulation hierarchy (Segment -> Packet
 * -> Frame -> Bits), local delivery vs remote network delivery boundaries, and
 * the practical mapping between the OSI 7-layer and TCP/IP 4-layer models.
 */

export const NET_01_MODULE: ModuleData = {
  id: 'net-01',
  slug: 'end-to-end-communication-journey',
  day: 1,
  title: 'Module 1: The End-to-End Communication Journey',
  shortTitle: 'Communication Journey',
  type: 'module',
  track: 'networking',
  milestoneId: 'net-milestone-1',
  description:
    'Trace how data travels across modern networks: why networks exist, endpoints vs intermediary devices, parcel encapsulation (Segment → Packet → Frame), and the OSI vs TCP/IP models.',
  estimatedMinutes: 25,
  curriculumOrder: 1,
  displayLabel: 'Module 1',
  completionLearnings: [
    'Networks connect independent computing systems to share resources, exchange messages, and distribute workloads',
    'Endpoints (hosts, servers, mobile devices) generate and consume data; intermediary devices (switches, routers) forward and direct it',
    'Data encapsulation wraps payload data in successive protocol headers: Segment (Transport) → Packet (Network) → Frame (Data Link)',
    'Local delivery occurs within the same broadcast domain using MAC addresses; remote delivery requires routing across gateways using IP addresses',
    'The 7-layer OSI model provides conceptual reference; practical engineering maps directly to the pragmatic 4-layer TCP/IP suite',
  ],
  concepts: [
    // ─────────────────────────────────────────────────────
    // Concept 1: Why Networks Exist & Endpoints vs Intermediaries (C01 + C02)
    // ─────────────────────────────────────────────────────
    {
      id: 'direct-link-mac',
      order: 1,
      title: 'Why Networks Exist & Endpoints vs Intermediaries',
      shortDescription:
        'Understand the purpose of computer networks and distinguish between devices that produce data and devices that forward it.',
      theory: {
        summary:
          'Networks exist to allow independent computing systems to exchange data and share resources. Every device on a network belongs to one of two fundamental categories: Endpoints (hosts that create or consume data) or Intermediaries (infrastructure nodes that forward and manage traffic).',
        explanation: [
          '### C01: Why Networks Exist',
          'An isolated computer can only compute on its own local data. To coordinate work, share files, stream media, and access cloud databases, computers must transmit electrical, optical, or radio signals across a transmission medium.',
          '',
          'A **computer network** is an interconnected collection of autonomous computing devices that exchange information using standardized communication protocols.',
          '',
          '### C02: Endpoints vs Intermediaries',
          'Every node in a network topology performs one of two distinct roles:',
          '',
          '1. **Endpoints (Hosts)**:',
          '- Devices where network traffic originates or terminates.',
          '- Examples: Laptops, database servers, smartphones, IoT sensors, network-attached storage (NAS).',
          '- Endpoints run user-space applications (browsers, database daemons, APIs) and manage socket connections.',
          '',
          '2. **Intermediary Devices**:',
          '- Infrastructure hardware positioned between endpoints to route, filter, amplify, and switch traffic.',
          '- Examples: Ethernet switches, IP routers, wireless access points (APs), firewalls.',
          '- Intermediary devices inspect protocol headers to make forwarding decisions without modifying application payload data.',
          '',
          '| Device Category | Primary Role | Examples |',
          '|---|---|---|',
          '| **Endpoint** | Generates or consumes data | Web browser, SQL database server, smartphone |',
          '| **Intermediary** | Moves data across the network | Switch (Layer 2), Router (Layer 3), Firewall |',
        ],
        keyTakeaway:
          'Endpoints produce and consume data at the application layer; intermediary devices forward traffic across physical and logical boundaries.',
        exampleQuery: '',
        exampleQueryExplanation: '',
        mcqs: [
          {
            id: 'net01-mcq-endpoint-vs-intermediary',
            question:
              'A PostgreSQL database server and an office Ethernet switch are connected on the same LAN. What are their respective roles?',
            options: [
              'Both are intermediary devices because both have network interface cards',
              'The PostgreSQL server is an endpoint; the Ethernet switch is an intermediary device',
              'The Ethernet switch is an endpoint; the PostgreSQL server is an intermediary device',
              'Both are endpoints because both process electrical signals',
            ],
            correctIndex: 1,
            explanation:
              'The database server runs application software and terminates user queries (endpoint), while the switch forwards Layer 2 Ethernet frames between network ports (intermediary device).',
          },
        ],
      },
      tasks: [
        {
          id: 'net01-p1-endpoint-intermediary-triage',
          title: 'Guided Practice: Endpoint vs Intermediary Classification',
          description:
            'Classify nodes in an enterprise network topology as endpoints or intermediary devices and defend your choices.',
          instructions: [
            'An engineer audits an office network consisting of a MacBook Pro, a 24-port Ethernet switch, an enterprise edge router, and a Redis caching server.',
            'Identify which nodes originate/terminate application data and which nodes exist solely to forward traffic.',
            'Defend why an enterprise router is classified as an intermediary device even though it runs an internal operating system.',
          ],
          type: 'guided',
          primaryTable: '',
          initialSql: '',
          solutionSql: 'NETWORKING_JUDGMENT_TASK',
          solutionExplanation:
            'The MacBook Pro and Redis server are endpoints (data producers/consumers). The switch and router are intermediaries whose primary purpose is forwarding and routing traffic across network boundaries.',
          hints: [
            {
              level: 1,
              text: 'Ask: does this device run the user application generating the payload, or does it exist to forward packets between cables?',
            },
            {
              level: 2,
              text: 'Switches and routers are intermediary devices because their core purpose is transit forwarding.',
            },
          ],
          validation: {
            judgment: [
              {
                kind: 'choose-and-defend',
                prompt:
                  'Which of the following devices is correctly classified as an ENDPOINT?',
                options: [
                  'A 48-port Layer 2 Ethernet switch in the server rack',
                  'An edge router performing BGP routing to an Internet Service Provider',
                  'A Redis cache server responding to application queries',
                  'A wireless access point bridging 802.11 Wi-Fi frames to copper Ethernet',
                ],
                correctIndex: 2,
                explanation:
                  'A Redis cache server is an endpoint because it hosts application state and terminates network connections from clients.',
              },
              {
                kind: 'choose-and-defend',
                prompt:
                  'Why is an enterprise router classified as an INTERMEDIARY device even though it possesses an IP address and management console?',
                options: [
                  'Because routers do not have physical network interface cards',
                  'Because its primary function in the data path is forwarding transit packets between network interfaces',
                  'Because routers can only operate at the physical Layer 1 layer',
                  'Because routers modify the application payload data of every packet they handle',
                ],
                correctIndex: 1,
                explanation:
                  'Intermediary devices exist to forward and route transit traffic between different network segments. Management interfaces do not change its core forwarding role.',
              },
            ],
          },
          successMessage:
            'Correct! Endpoints run applications and originate/terminate data; intermediary devices forward traffic across network hops.',
        },
      ],
    },

    // ─────────────────────────────────────────────────────
    // Concept 2: Encapsulation: Segment, Packet, Frame (C03)
    // ─────────────────────────────────────────────────────
    {
      id: 'encapsulation-segment-packet-frame',
      order: 2,
      title: 'Encapsulation: Frames, Packets, Segments & PDUs',
      shortDescription:
        'Trace the parcel encapsulation hierarchy as application data is wrapped in Transport, Network, and Link headers.',
      theory: {
        summary:
          'Data moves down the protocol stack by encapsulation: each layer wraps the payload from the layer above in its own header (and optional trailer), producing a distinct Protocol Data Unit (PDU). At the receiver, decapsulation strips each header in reverse order.',
        explanation: [
          '### C03: The Parcel Metaphor & Protocol Data Units (PDUs)',
          'When an application sends a message (e.g. an HTTP GET request), the raw message cannot be placed directly onto a physical wire. It must be prepared for delivery step by step, like a letter placed in an envelope, placed in a shipping parcel, and loaded into a delivery truck.',
          '',
          'Each layer produces a uniquely named **Protocol Data Unit (PDU)**:',
          '',
          '```',
          'Layer 4 (Transport):     [ TCP Header | Application Data ]              → SEGMENT',
          '                                    ↓',
          'Layer 3 (Network):       [ IP Header | TCP Header | Application Data ]   → PACKET',
          '                                    ↓',
          'Layer 2 (Data Link):     [ L2 Header | IP Header | TCP Header | Data | FCS ] → FRAME',
          '                                    ↓',
          'Layer 1 (Physical):      01101001 01110011 00100000 01100010 01101001...  → BITS',
          '```',
          '',
          '### PDU Hierarchy & Layer Responsibilities',
          '- **Segment (Layer 4 — Transport)**: Adds port numbers (e.g. source port 54321, destination port 443) and sequence numbers to multiplex multiple application sockets and guarantee reliable delivery.',
          '- **Packet / Datagram (Layer 3 — Network)**: Adds logical IP addresses (source IP and destination IP) to enable routing across disparate networks.',
          '- **Frame (Layer 2 — Data Link)**: Adds physical hardware MAC addresses (source MAC and destination MAC), EtherType, and an FCS (Frame Check Sequence) trailer for local hop delivery and bit-error detection.',
          '- **Bits (Layer 1 — Physical)**: Encodes the completed frame into electrical voltages, optical light pulses, or radio waves on the transmission medium.',
          '',
          '### Decapsulation at the Receiver',
          'When the destination receives the signal, it reverses the process (**decapsulation**):',
          '1. The NIC checks the frame FCS and destination MAC; if valid, it strips the Layer 2 header/trailer.',
          '2. The OS inspects the destination IP; if it matches this host, it strips the Layer 3 IP header.',
          '3. The TCP/UDP stack checks the destination port number and delivers the raw payload to the listening application socket.',
        ],
        keyTakeaway:
          'Encapsulation wraps data in headers as it moves down the stack: Data → Segment (L4 ports) → Packet (L3 IPs) → Frame (L2 MACs) → Bits.',
        exampleQuery: '',
        exampleQueryExplanation: '',
        mcqs: [
          {
            id: 'net01-mcq-pdu-order',
            question:
              'What is the correct Protocol Data Unit (PDU) name for data at Layer 3 (Network layer)?',
            options: [
              'Frame',
              'Segment',
              'Packet (or Datagram)',
              'Bitstream',
            ],
            correctIndex: 2,
            explanation:
              'Layer 3 PDUs are called Packets (or Datagrams in UDP/IP). Layer 2 PDUs are Frames, and Layer 4 PDUs are Segments.',
          },
          {
            id: 'net01-mcq-decapsulation-order',
            question:
              'When a receiving server decapsulates an incoming web request, in which order does it strip headers?',
            options: [
              'IP Header first, then Ethernet Header, then TCP Header',
              'TCP Header first, then IP Header, then Ethernet Header',
              'Ethernet Frame Header/Trailer first, then IP Header, then TCP Header',
              'Application payload first, then Transport Header',
            ],
            correctIndex: 2,
            explanation:
              'Decapsulation happens bottom-up: the physical NIC strips the Layer 2 Ethernet frame header/trailer first, then the network layer strips the IP header, and finally transport strips the TCP header to expose the payload.',
          },
        ],
      },
      tasks: [
        {
          id: 'net01-p2-encapsulation-trace',
          title: 'Guided Practice: Encapsulation & Header Layer Mapping',
          description:
            'Identify which headers are added at each stage of transmission and what addresses they carry.',
          instructions: [
            'A client laptop sends an HTTPS request to an API endpoint.',
            'Trace the message from the application down to the physical wire.',
            'Determine which layer encapsulates the data with IP addresses and which layer adds MAC addresses.',
          ],
          type: 'guided',
          primaryTable: '',
          initialSql: '',
          solutionSql: 'NETWORKING_JUDGMENT_TASK',
          solutionExplanation:
            'The transport layer produces a Segment with ports. The network layer wraps the segment into a Packet with IP addresses. The link layer wraps the packet into a Frame with MAC addresses and an FCS trailer.',
          hints: [
            {
              level: 1,
              text: 'Remember the PDU mnemonic: Data → Segment (L4) → Packet (L3) → Frame (L2).',
            },
            {
              level: 2,
              text: 'IP addresses belong to Layer 3 (Packets). MAC addresses belong to Layer 2 (Frames).',
            },
          ],
          validation: {
            judgment: [
              {
                kind: 'choose-and-defend',
                prompt:
                  'Which protocol header contains the Source MAC and Destination MAC addresses?',
                options: [
                  'Layer 4 TCP Header',
                  'Layer 3 IPv4/IPv6 Header',
                  'Layer 2 Ethernet Frame Header',
                  'Layer 7 HTTP Header',
                ],
                correctIndex: 2,
                explanation:
                  'MAC addresses are physical link-layer identifiers placed in the Layer 2 Ethernet Frame header.',
              },
              {
                kind: 'choose-and-defend',
                prompt:
                  'What is the primary role of the Layer 4 Transport Header (TCP/UDP Segment)?',
                options: [
                  'To provide physical signal synchronization on copper cables',
                  'To multiplex application conversations using port numbers and manage end-to-end reliability',
                  'To route packets across the global internet using autonomous system paths',
                  'To calculate CRC error detection across raw electrical pulses',
                ],
                correctIndex: 1,
                explanation:
                  'Layer 4 Transport headers use port numbers to direct traffic to the correct application process/socket and manage sequence numbers, ACKs, and flow control.',
              },
            ],
          },
          successMessage:
            'Excellent! You mastered encapsulation: Layer 4 Segments carry ports, Layer 3 Packets carry IPs, and Layer 2 Frames carry MACs and trailers.',
        },
      ],
    },

    // ─────────────────────────────────────────────────────
    // Concept 3: Local vs Remote Delivery & Network Models (C04 + C05)
    // ─────────────────────────────────────────────────────
    {
      id: 'local-vs-remote-and-network-models',
      order: 3,
      title: 'Local vs Remote Delivery & The OSI vs TCP/IP Models',
      shortDescription:
        'Distinguish between same-subnet local delivery and routed remote delivery, and map the OSI 7-layer model to TCP/IP.',
      theory: {
        summary:
          'Traffic delivered within the same local network (broadcast domain) uses direct Layer 2 frame forwarding. Traffic addressed to remote networks must be routed through a default gateway. Network architectures are modeled conceptually using the 7-layer OSI model, but implemented in practice using the pragmatic 4-layer TCP/IP stack.',
        explanation: [
          '### C04: Local Delivery vs Remote Network Delivery',
          'Before transmitting a packet, the sender must make a critical architectural decision:',
          '',
          '1. **Local Delivery (Same Subnet)**:',
          '- The destination computer is attached to the **same local network / broadcast domain**.',
          '- The sender encapsulates the packet into an Ethernet frame addressed **directly to the destination host\'s MAC address**.',
          '- Ethernet switches forward the frame directly to the recipient port without involving a router.',
          '',
          '2. **Remote Delivery (Different Subnet / Internet)**:',
          '- The destination IP address resides on an external network or across the internet.',
          '- The sender **cannot** send directly to the destination host\'s MAC address because Layer 2 frames do not cross router boundaries.',
          '- The sender encapsulates the packet into a frame addressed to the MAC address of its **Default Gateway** (the local router).',
          '- The router inspects the Layer 3 destination IP and forwards the packet toward the next hop.',
          '',
          '### C05: OSI 7-Layer vs TCP/IP 4-Layer Models',
          'Networking theory uses two major reference models:',
          '',
          '| OSI 7-Layer Model | TCP/IP 4-Layer Model | Core Protocol Examples | Primary PDU |',
          '|---|---|---|---|',
          '| 7. Application | **Application** | HTTP, DNS, SSH, DHCP | Application Data |',
          '| 6. Presentation | *(absorbed into Application)* | TLS/SSL, ASCII, JSON | Data |',
          '| 5. Session | *(absorbed into Application)* | Sockets, RPC sessions | Data |',
          '| 4. Transport | **Transport** | TCP, UDP | Segment / Datagram |',
          '| 3. Network | **Internet** | IPv4, IPv6, ICMP | Packet |',
          '| 2. Data Link | **Network Access (Link)** | Ethernet (802.3), Wi-Fi (802.11) | Frame |',
          '| 1. Physical | *(combined with Link)* | Cat6 copper, Fiber, Radios | Bits / Signals |',
          '',
          '**Why the TCP/IP Model Rules Practice**:',
          'The OSI model is a theoretical architectural framework created by committee. The TCP/IP model was built directly into operating system kernels (starting with BSD UNIX) and represents how internet software is actually constructed.',
        ],
        keyTakeaway:
          'Local delivery sends frames directly to the destination MAC; remote delivery sends frames to the default gateway MAC. Pragmatic engineering maps OSI layers 1–7 to the 4-layer TCP/IP suite.',
        exampleQuery: '',
        exampleQueryExplanation: '',
        mcqs: [
          {
            id: 'net01-mcq-local-vs-remote-gateway',
            question:
              'A computer in an office wants to communicate with a web server in another country. How does the sender address the Layer 2 Ethernet frame?',
            options: [
              'With the web server\'s MAC address as the destination MAC',
              'With the broadcast MAC address (FF:FF:FF:FF:FF:FF)',
              'With the Default Gateway\'s (local router\'s) MAC address as the destination MAC',
              'Frames are omitted completely when communicating across the internet',
            ],
            correctIndex: 2,
            explanation:
              'Layer 2 frames cannot cross routers. For remote delivery, the sender frames the packet to the MAC address of its local default gateway, keeping the destination IP set to the web server.',
          },
          {
            id: 'net01-mcq-osi-tcpip-layer-count',
            question:
              'Which layer of the 4-layer TCP/IP model corresponds to both the Data Link and Physical layers of the 7-layer OSI model?',
            options: [
              'Internet Layer',
              'Transport Layer',
              'Network Access (or Link) Layer',
              'Application Layer',
            ],
            correctIndex: 2,
            explanation:
              'The TCP/IP Network Access (Link) layer encompasses both the Physical transmission medium (OSI Layer 1) and Data Link framing/addressing (OSI Layer 2).',
          },
        ],
      },
      tasks: [
        {
          id: 'net01-p3-local-remote-decision',
          title: 'Independent Practice: Local vs Remote Delivery Evaluation',
          description:
            'Determine whether given communication scenarios represent local or remote delivery and identify the appropriate next hop.',
          instructions: [
            'Analyze two transmission scenarios in an enterprise office:',
            'Scenario A: Laptop A printing a PDF to an office network printer on the same Ethernet switch subnet.',
            'Scenario B: Laptop A pulling code from a GitHub repository hosted in a remote cloud region.',
            'Identify which scenario uses direct MAC delivery and which requires routing via the default gateway.',
          ],
          type: 'independent',
          primaryTable: '',
          initialSql: '',
          solutionSql: 'NETWORKING_JUDGMENT_TASK',
          solutionExplanation:
            'Scenario A is local delivery (same subnet, frames sent directly to printer MAC). Scenario B is remote delivery (different subnet, frames sent to the router default gateway MAC).',
          hints: [
            {
              level: 1,
              text: 'Are the two devices in the same physical broadcast domain, or does traffic need to traverse a router to leave the local network?',
            },
            {
              level: 2,
              text: 'When communicating outside the local subnet, the destination MAC on the local wire is always the default gateway.',
            },
          ],
          validation: {
            judgment: [
              {
                kind: 'choose-and-defend',
                prompt:
                  'In Scenario A (Laptop A printing to a local printer on the same switch), how is the Ethernet frame forwarded?',
                options: [
                  'The switch forwards the frame directly to the printer port based on the printer\'s destination MAC address',
                  'The frame must first pass through the office internet gateway router before reaching the printer',
                  'The laptop floods the printer data out every port of the building router',
                  'The communication uses DNS without creating any Layer 2 frames',
                ],
                correctIndex: 0,
                explanation:
                  'On the same local subnet, the switch performs direct Layer 2 forwarding using the printer\'s destination MAC address without involving any router.',
              },
              {
                kind: 'choose-and-defend',
                prompt:
                  'In Scenario B (Laptop A accessing GitHub cloud servers), why must the destination MAC in Laptop A\'s frame be the router\'s MAC?',
                options: [
                  'Because GitHub servers do not have MAC addresses',
                  'Because Layer 2 Ethernet frames cannot cross router boundaries; the local router must receive and route the packet',
                  'Because the switch blocks all packets that have external IP addresses',
                  'Because GitHub requires all clients to use the same shared MAC address',
                ],
                correctIndex: 1,
                explanation:
                  'Layer 2 broadcast domains terminate at the router interface. To reach any remote destination, the sender must transmit the frame to the default gateway router.',
              },
            ],
          },
          successMessage:
            'Mastery confirmed! You clearly distinguish between local Layer 2 frame forwarding and remote Layer 3 default gateway routing.',
        },
      ],
    },
  ],

  // ─────────────────────────────────────────────────────
  // Module 1 Challenge
  // ─────────────────────────────────────────────────────
  challenge: {
    id: 'net-01-challenge',
    title: 'Module 1 Challenge: The End-to-End Delivery Path',
    scenario:
      'A software developer reports that their browser can reach an internal team documentation wiki on their local office switch, but cannot load public internet websites. Trace the end-to-end communication path to isolate the failure boundary.',
    tasks: [
      {
        id: 'net01-c1-pdu-boundary-defense',
        title: 'Task 1: PDU Encapsulation & Device Role Defense',
        description:
          'Identify the exact Protocol Data Unit (PDU) transitions and intermediary device responsibilities across the office network.',
        instructions: [
          'Review the path from developer workstation to local switch to edge router.',
          'Identify what Layer 2 intermediary devices inspect versus what Layer 3 devices inspect.',
          'Explain why the internal wiki works (local delivery) while external sites fail.',
        ],
        type: 'challenge',
        primaryTable: '',
        initialSql: '',
        solutionSql: 'NETWORKING_JUDGMENT_TASK',
        solutionExplanation:
          'Local communication to the wiki succeeds because the switch operates at Layer 2 (inspecting MAC addresses) on the local subnet. External communication requires the default gateway router at Layer 3.',
        hints: [
          {
            level: 1,
            text: 'Does reaching the local wiki require a router or just a local Layer 2 switch?',
          },
          {
            level: 2,
            text: 'Reaching public websites requires a functional default gateway router to route Layer 3 IP packets beyond the local subnet.',
          },
        ],
        validation: {
          judgment: [
            {
              kind: 'choose-and-defend',
              prompt:
                'What part of the encapsulated frame does the local office Ethernet switch inspect to forward traffic to the local wiki?',
              options: [
                'The Layer 7 HTTP URL path',
                'The Layer 3 IP destination address',
                'The Layer 2 Ethernet destination MAC address',
                'The Layer 4 TCP destination port number',
              ],
              correctIndex: 2,
              explanation:
                'Standard Layer 2 Ethernet switches only inspect the Layer 2 frame header (Destination MAC address) to forward frames to the correct physical port.',
            },
            {
              kind: 'choose-and-defend',
              prompt:
                'Given that the developer can reach the local wiki on the same switch but no external websites, which device is the probable point of failure?',
              options: [
                'The developer\'s local Network Interface Card (NIC) is completely dead',
                'The office Ethernet switch has failed and is dropping all electrical signals',
                'The Default Gateway (edge router) is unreachable or misconfigured',
                'The local wiki server is corrupting TCP checksums',
              ],
              correctIndex: 2,
              explanation:
                'Because local communication on the switch functions normally, the client NIC and local switch are healthy. The failure boundary is at the default gateway (router) required for remote delivery.',
            },
          ],
        },
        successMessage:
          'Challenge 1 cleared! You identified that local delivery requires only the Layer 2 switch, isolating the failure to the default gateway router.',
      },
      {
        id: 'net01-c2-encapsulation-decapsulation-audit',
        title: 'Task 2: End-to-End Encapsulation Audit',
        description:
          'Verify your understanding of how headers are added during transmission and stripped during reception.',
        instructions: [
          'Audit the full lifecycle of an HTTP request message sent from a client to an API endpoint.',
          'Verify the state of the packet as it travels across physical media and enters the receiver.',
        ],
        type: 'challenge',
        primaryTable: '',
        initialSql: '',
        solutionSql: 'NETWORKING_JUDGMENT_TASK',
        solutionExplanation:
          'During transmission, encapsulation adds headers down the stack (Application Data -> TCP Segment -> IP Packet -> Ethernet Frame). During reception, decapsulation strips headers up the stack.',
        hints: [
          {
            level: 1,
            text: 'Encapsulation is top-down (adding headers); decapsulation is bottom-up (stripping headers).',
          },
        ],
        validation: {
          judgment: [
            {
              kind: 'choose-and-defend',
              prompt:
                'Which statement accurately describes the state of data as it traverses a physical fiber-optic cable between two routers?',
              options: [
                'It is an unencapsulated JSON string transmitted as pure software tokens',
                'It is an Ethernet (or optical framing) frame containing an IP packet, which contains a TCP segment, which contains application data',
                'It is a TCP segment stripped of all Layer 2 and Layer 3 headers to maximize transmission speed',
                'It consists only of Layer 3 IP addresses without any framing delimiters or synchronization',
              ],
              correctIndex: 1,
              explanation:
                'All data on the physical transmission medium is fully encapsulated: the outer frame header encloses the IP packet, which encloses the TCP segment, which encloses the payload.',
            },
          ],
        },
        successMessage:
          'Module 1 Mastered! You have proven complete command of why networks exist, endpoints vs intermediaries, encapsulation PDUs, and local vs remote delivery.',
      },
    ],
  },
};
