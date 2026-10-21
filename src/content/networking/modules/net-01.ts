import { ModuleData } from '../../../types/curriculum';
import type { MentorScript } from '../../../types/networking-curriculum';

export const NET_01_MENTOR_SCRIPT: MentorScript = {
  version: '1.0.0',
  track: 'networking',
  moduleId: 'net-01',
  conceptId: 'direct-link-mac',
  tier: 'shadow',
  revealLadder: {
    'step-0': ['host-a'],
    'step-1': ['host-a', 'cable'],
    'step-2': ['host-a', 'cable', 'switch-sw1', 'router-r1'],
    'step-3': ['host-a', 'cable', 'switch-sw1', 'router-r1', 'terminal'],
    'step-4': ['host-a', 'cable', 'switch-sw1', 'router-r1', 'terminal', 'arp-table'],
    'step-5': ['host-a', 'cable', 'switch-sw1', 'router-r1', 'terminal', 'arp-table', 'frame-inspector'],
  },
  terms: {
    endpoints: {
      label: 'Endpoints',
      part: 'host-a',
      explanation: 'Devices where network traffic originates or terminates (e.g. workstations, web servers, smartphones).',
    },
    media: {
      label: 'Media',
      part: 'cable',
      explanation: 'The physical transmission medium (copper cable, optical fiber, radio waves) carrying electrical signals.',
    },
    layer1: {
      label: 'Layer 1 Physical',
      part: 'cable',
      explanation: 'The hardware layer responsible for physical connectors, cable continuity, and bit-level electrical signals.',
    },
    switch: {
      label: 'Access Switch',
      part: 'switch-sw1',
      explanation: 'An intermediary device connecting office PCs together and forwarding traffic between local ports.',
    },
    arp: {
      label: 'ARP Table',
      part: 'arp-table',
      explanation: 'The operating system address book cache mapping local IPv4 addresses to physical MAC hardware addresses.',
    },
    mac: {
      label: 'MAC Address',
      part: 'host-a',
      explanation: 'A unique 48-bit physical hardware identifier burned into each network interface controller card.',
    },
    envelope: {
      label: 'Ethernet Frame',
      part: 'frame-inspector',
      explanation: 'The Layer 2 outer packaging stamped with destination and source MAC addresses enclosing the IP packet.',
    },
  },
  beats: [
    {
      id: 'beat-1',
      stage: { stageNumber: 1, stepIndex: 0, title: 'Stage 1: Shadow the Master' },
      kind: 'do',
      say: [
        "In the Concept Story Reel, we saw that a solitary computer is isolated without a physical wire, and every NIC has a permanent factory MAC address (00-1A-2B-3C-4D-10). Here at Acme-PC-01, our user cannot reach the network. Let's test the connection.",
        "Type `ping 192.168.1.1` and press Enter. (Tap the suggestion chip below to insert it).",
      ],
      actionPrompt: 'ping 192.168.1.1',
      actionTargetPart: 'terminal',
      expect: 'ping',
      revealedParts: ['host-a', 'cable', 'switch-sw1', 'router-r1', 'terminal'],
      spotlight: 'terminal',
    },
    {
      id: 'beat-2',
      stage: { stageNumber: 1, stepIndex: 1, title: 'Stage 1: Shadow the Master' },
      kind: 'predict',
      say: [
        "Notice it said `transmit failed. General failure.` Our computer couldn't even launch the knock out the door! Something is stopping the signal on our own PC.",
        "Look at that line: `Media State . . . : Media disconnected`. In computer hardware, what does 'Media' refer to?",
      ],
      spotlight: 'cable',
      revealedParts: ['host-a', 'cable', 'switch-sw1', 'router-r1', 'terminal'],
      options: [
        {
          id: 'opt-media-cable',
          label: 'The physical network cable, connector, or electrical link path',
          isCorrect: true,
          feedback:
            "Right! 'Media' is the physical transmission medium (copper, fiber, or radio waves). 'Disconnected' means our network card senses no electrical link pulse. Our cable is unplugged!",
        },
        {
          id: 'opt-media-software',
          label: 'Software applications installed on Windows',
          isCorrect: false,
          feedback: "Software is applications; 'media' refers to the physical transmission path.",
        },
        {
          id: 'opt-media-router',
          label: 'The remote router in the server room',
          isCorrect: false,
          feedback: "The router is a node; 'media' is the physical path that connects us to it.",
        },
      ],
      whyOptions: [
        {
          id: 'why-l1-carrier',
          label:
            'Network interface cards require an electrical or optical carrier signal on the wire to transmit frames.',
          isCorrect: true,
          feedback:
            'Correct! Without physical continuity, the network interface card driver cannot transmit electrical signals.',
        },
        {
          id: 'why-l1-software',
          label: 'Media refers only to audio and video files stored on disk.',
          isCorrect: false,
          feedback:
            'In computer networking, transmission media refers to the physical layer carrier.',
        },
      ],
    },
    {
      id: 'beat-3',
      stage: { stageNumber: 1, stepIndex: 2, title: 'Stage 1: Shadow the Master' },
      kind: 'do',
      say: [
        'Look behind Workstation-01. The Ethernet cable is completely unplugged.',
        "Click the cable (or press Enter on it) to plug it into the PC's port.",
      ],
      actionPrompt: 'Seat Ethernet Cable',
      actionTargetPart: 'cable',
      expect: 'seat-cable',
      revealedParts: ['host-a', 'cable', 'switch-sw1', 'router-r1', 'terminal'],
      spotlight: 'cable',
    },
    {
      id: 'beat-4',
      stage: { stageNumber: 1, stepIndex: 3, title: 'Stage 1: Shadow the Master' },
      kind: 'predict',
      say: [
        'Now that the wire is connected, `ipconfig` shows our PC is `192.168.1.10` with mask `255.255.255.0`.',
        'If we wanted to reach `192.168.2.5`, is it on our local street or outside?',
      ],
      spotlight: 'terminal',
      revealedParts: ['host-a', 'cable', 'switch-sw1', 'router-r1', 'terminal'],
      options: [
        {
          id: 'opt-diff-subnet',
          label: 'It is on a different street because the third number is 2, not 1',
          isCorrect: true,
          feedback:
            'Exactly right! Because the third number is different, 192.168.2.5 is outside our local street. But 192.168.1.1 shares 192.168.1, so it is on-link (a direct neighbor).',
        },
        {
          id: 'opt-same-subnet',
          label: 'It is on our local street because both start with 192.168',
          isCorrect: false,
          feedback:
            'Under mask 255.255.255.0, all three numbers must match for local on-link delivery!',
        },
        {
          id: 'opt-unknown-subnet',
          label: 'Subnet masks only apply to public Internet servers',
          isCorrect: false,
          feedback:
            'Subnet masks apply to every IPv4 interface to determine whether destinations are local or remote.',
        },
      ],
      whyOptions: [
        {
          id: 'why-mask-boundary',
          label:
            'The 255.255.255.0 mask designates the first three octets as the network prefix boundary.',
          isCorrect: true,
          feedback:
            'Precise! The 255.255.255.0 subnet mask locks the first 24 bits as the local network identifier.',
        },
        {
          id: 'why-all-192-local',
          label: 'All IP addresses starting with 192 are on the exact same physical wire.',
          isCorrect: false,
          feedback:
            'Only IP addresses matching the complete network mask portion share the same subnet.',
        },
      ],
    },
    {
      id: 'beat-5',
      stage: { stageNumber: 2, stepIndex: 4, title: 'Stage 2: Guided Hop Traversal' },
      kind: 'do',
      say: [
        "Before sending another ping, let's see which local devices this PC already knows about.",
        'Type `arp -a` and press Enter.',
      ],
      actionPrompt: 'arp -a',
      actionTargetPart: 'terminal',
      expect: 'arp',
      revealedParts: ['host-a', 'cable', 'switch-sw1', 'router-r1', 'terminal', 'arp-table'],
      spotlight: 'arp-table',
    },
    {
      id: 'beat-6',
      stage: { stageNumber: 2, stepIndex: 5, title: 'Stage 2: Guided Hop Traversal' },
      kind: 'do',
      say: [
        'Watch what happens when we ping now. The simulator will pause in flight so you can see each step.',
        'Type `ping 192.168.1.1` and press Enter.',
      ],
      actionPrompt: 'ping 192.168.1.1 (Slow-Motion)',
      actionTargetPart: 'terminal',
      expect: 'ping-slow',
      revealedParts: ['host-a', 'cable', 'switch-sw1', 'router-r1', 'terminal', 'arp-table'],
      spotlight: 'terminal',
    },
    {
      id: 'beat-7',
      stage: { stageNumber: 2, stepIndex: 6, title: 'Stage 2: Guided Hop Traversal' },
      kind: 'do',
      say: [
        "Now that communication succeeded, let's verify what our PC recorded in its address book.",
        'Type `arp -a` and press Enter.',
      ],
      actionPrompt: 'arp -a',
      actionTargetPart: 'terminal',
      expect: 'arp',
      revealedParts: ['host-a', 'cable', 'switch-sw1', 'router-r1', 'terminal', 'arp-table'],
      spotlight: 'arp-table',
    },
    {
      id: 'beat-8',
      stage: { stageNumber: 3, stepIndex: 7, title: 'Stage 3: Inspect Outer Packaging' },
      kind: 'predict',
      say: [
        'Look at the Destination MAC on the envelope (`00-1A-2B-3C-4D-01`).',
        'Where did our PC get this physical hardware address?',
      ],
      spotlight: 'frame-inspector',
      revealedParts: [
        'host-a',
        'cable',
        'switch-sw1',
        'router-r1',
        'terminal',
        'arp-table',
        'frame-inspector',
      ],
      options: [
        {
          id: 'opt-mac-from-arp',
          label: 'From the dynamic ARP address book entry we verified in Beat 7',
          isCorrect: true,
          feedback:
            'Brilliant! Even though ping targeted IP 192.168.1.1, the network card stamped the outer Ethernet envelope with Router R1 hardware MAC address learned dynamically via ARP!',
        },
        {
          id: 'opt-mac-guessed',
          label: 'It guessed it randomly by translating the IP numbers',
          isCorrect: false,
          feedback:
            'IP addresses do not reveal hardware MACs; ARP had to discover it dynamically!',
        },
        {
          id: 'opt-mac-hardcoded',
          label: 'Windows comes pre-installed with every office MAC address',
          isCorrect: false,
          feedback: 'MAC addresses are discovered dynamically through local network broadcasts.',
        },
      ],
      whyOptions: [
        {
          id: 'why-arp-cache-mapping',
          label:
            'Host A queries its ARP cache to map destination IPv4 addresses to Layer 2 physical MAC addresses for wire transmission.',
          isCorrect: true,
          feedback:
            'Exactly! Layer 3 IP packets must be packaged inside Layer 2 Ethernet frames addressed to the neighbor hardware MAC address.',
        },
        {
          id: 'why-mac-random',
          label: 'MAC addresses change randomly every second.',
          isCorrect: false,
          feedback:
            'Physical MAC addresses are fixed hardware identifiers assigned to the network interface card.',
        },
      ],
    },
  ],
  ticketScene: {
    ticketId: '101',
    title: 'Discovery Ticket #101: The Silent Link',
    symptom:
      'Acme-PC-02 cannot transmit packets or reach the office router. All local pings report transmit failed. General failure.',
    telemetry: [
      'Workstation: Acme-PC-02',
      'Ethernet adapter Ethernet0: Media disconnected',
      'Port eth0 Link LED: OFF',
      'Static IP configured in registry: 192.168.1.15 / 255.255.255.0',
    ],
    options: [
      {
        id: 'opt-reboot-os',
        label: 'Reboot Acme-PC-02 operating system to reset network sockets.',
        isCorrect: false,
        feedback: 'Operating system reboot will not resolve an unlatched physical cable.',
      },
      {
        id: 'opt-reconnect-cable',
        label:
          'Physical Layer 1 issue: Cat6 patch cable disconnected or unlatched from the RJ-45 jack.',
        isCorrect: true,
        feedback:
          'Spot on! Without a physical link carrier, Layer 2 Ethernet cannot transmit electrical pulses.',
      },
      {
        id: 'opt-dns-down',
        label: 'DNS root servers are offline.',
        isCorrect: false,
        feedback: 'DNS is an application layer protocol; failure here is at physical Layer 1.',
      },
    ],
    repairActions: [
      {
        id: 'fix-reconnect',
        label: 'Inspect physical cable behind desk and plug firmly into RJ-45 port',
        isCorrect: true,
        patch: { action: 'set-link', target: 'port-1', value: 'connected' },
      },
      {
        id: 'fix-reconfigure-ip',
        label: 'Change Host A IP address to 192.168.1.99',
        isCorrect: false,
        patch: {
          action: 'reconfigure-interface',
          target: 'host-a',
          value: { ip: '192.168.1.99' },
        },
      },
      {
        id: 'fix-flush-dns',
        label: 'Flush local DNS cache',
        isCorrect: false,
        patch: { action: 'flush-dns', target: 'host-a', value: 'all' },
      },
    ],
  },
};

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
  slug: 'the-first-link-and-hardware-identity',
  day: 1,
  title: 'Module 1: The First Link & Hardware Identity',
  shortTitle: 'The First Link',
  type: 'module',
  track: 'networking',
  milestoneId: 'net-milestone-1',
  description:
    'Master the physical layer foundations: the Trapped Data Dilemma, 8-strand Cat6 full-duplex channels, permanent 48-bit silicon MAC addresses, and Ethernet II framing with CRC-32 error detection.',
  estimatedMinutes: 25,
  curriculumOrder: 1,
  displayLabel: 'Module 1',
  completionLearnings: [
    'Computers cannot transmit data beyond motherboard silicon without an active physical transmission medium and carrier pulse',
    'Cat6 8-strand copper cables provide dedicated Transmit (TX) and Receive (RX) pairs, enabling Full-Duplex communication with zero collisions on direct links',
    'Every Network Interface Card (NIC) is permanently identified by a 48-bit MAC address burned into hardware ROM (24-bit OUI + 24-bit device serial)',
    'Ethernet II frames wrap Layer 3 packets in a 14-byte header and a 4-byte CRC-32 Frame Check Sequence (FCS) trailer to detect electrical bit-flips',
    'Corrupted frames that fail CRC verification are silently discarded by NIC silicon at Layer 2 without interrupting host operating system CPU cycles',
  ],
  concepts: [
    // ─────────────────────────────────────────────────────
    // Concept 1.1: The Trapped Data Dilemma (direct-link-mac)
    // ─────────────────────────────────────────────────────
    {
      id: 'direct-link-mac',
      order: 1,
      title: 'The Trapped Data Dilemma & Physical Carrier',
      shortDescription:
        'Discover why data cannot leave a motherboard without a physical medium and how the operating system detects a physical link carrier.',
      theory: {
        mentorScript: NET_01_MENTOR_SCRIPT,
        summary:
          'Data stored in CPU registers and RAM cannot escape an isolated computer without an electrical, optical, or radio transmission medium. When the physical link carrier pulse is absent, network transmission fails immediately at Layer 1 before any packet can be placed on the wire.',
        explanation: [
          '### Beat 1: The Physical Dilemma — The Trapped Data Dilemma',
          'Imagine a high-powered workstation sitting in an office. Its CPU can perform billions of operations per second, and its SSD holds gigabytes of databases. Yet, if an application attempts to send a single bit to another computer, the attempt fails immediately with:',
          '',
          '```',
          'PING: transmit failed. General failure.',
          'Media State . . . . . . . . . . . : Media disconnected',
          '```',
          '',
          'Why does this occur? Because computer logic inside silicon chips operates on microscopic voltage levels (0.8V to 1.2V) constrained to printed circuit board traces. To cross the room or the continent, that data must be converted into physical signals (electrical voltages across copper, light flashes in glass fiber, or electromagnetic radio waves).',
          '',
          '### Beat 2: The Diagnostic Tool\'s Purpose',
          'Before an operating system wastes memory constructing network packets, the Network Interface Card (NIC) physical layer hardware (PHY) constantly senses the physical medium for a **link pulse** (carrier signal).',
          '',
          'We inspect this hardware carrier state using standard diagnostic commands:',
          '- **Windows:** `ipconfig /all` asks the OS driver: *"Is the physical media connected or disconnected?"*',
          '- **Linux:** `ip link show` or `ethtool eth0` asks the kernel: *"Is the carrier detected and the interface state UP or DOWN?"*',
          '',
          '### Beat 3: The Observable Result',
          'When the Cat6 patch cable is firmly seated into the RJ-45 jack, the PHY chip detects the electrical carrier. The green Link LED illuminates solid, and the diagnostic output transitions:',
          '- Windows displays: `Media State . . . : [Active / Connected]`',
          '- Linux displays: `state UP ... carrier detected: yes`',
        ],
        keyTakeaway:
          'Layer 1 Rule: No physical carrier signal means zero packets leave the host. Always verify the physical link status before debugging IP or DNS configurations.',
        exampleQuery: '',
        exampleQueryExplanation: '',
        mcqs: [
          {
            id: 'net01-mcq-media-disconnected',
            question:
              'A user types "ping 192.168.1.1" on Windows and receives "PING: transmit failed. General failure. Media State: Media disconnected". What layer is failing?',
            options: [
              'Layer 7 Application Layer because the DNS server is offline',
              'Layer 3 Network Layer because the IP address has a subnet mask typo',
              'Layer 1 Physical Layer because the network card senses no physical electrical link carrier on the wire',
              'Layer 4 Transport Layer because the TCP handshake timed out',
            ],
            correctIndex: 2,
            explanation:
              '"Media disconnected" is reported directly by the NIC driver at Layer 1 when physical continuity or electrical carrier pulses are not detected on the physical port.',
          },
        ],
      },
      tasks: [
        {
          id: 'net01-p1-carrier-and-link-triage',
          title: 'Workplace Lab (Ticket #101): The Silent Link Carrier Triage',
          description:
            'Use dual-OS command diagnostics to inspect an uncommunicative workstation, identify the root cause of the connection failure, and verify hardware identity.',
          instructions: [
            'Workstation Acme-PC-02 in the accounting department cannot communicate with the local router or access file shares.',
            'Execute diagnostic commands in the virtual terminal simulator (support for both Windows "ipconfig /all" and Linux "ip link show").',
            'Inspect the reported Media State, Link LED carrier status, and Physical Address (MAC).',
            'Defend the exact layer and root cause of the outage to resolve Discovery Ticket #101.',
          ],
          type: 'guided',
          primaryTable: '',
          initialSql: '',
          solutionSql: 'NETWORKING_JUDGMENT_TASK',
          solutionExplanation:
            'Both ipconfig /all and ip link show confirm that the network adapter has no physical carrier (Media disconnected / state DOWN). The Cat6 cable is unseated at Layer 1. The Physical Address 00-1A-2B-3C-4D-10 represents the factory-burned Layer 2 hardware MAC.',
          hints: [
            {
              level: 1,
              text: 'Check the "Media State" or "state" field in the terminal output. Is the interface carrier active or disconnected?',
            },
            {
              level: 2,
              text: 'Before software protocols can route or resolve names, the physical NIC requires an active electrical link on the copper wire.',
            },
          ],
          terminal: {
            hostname: 'Acme-PC-02',
            userPrompt: 'C:\\Users\\admin>',
            initialLines: [
              'Microsoft Windows [Version 10.0.19045.3803]',
              '(c) Microsoft Corporation. All rights reserved.',
              '',
              'Acme-PC-02 Diagnostics Terminal. Run diagnostic commands to triage Ticket #101.',
            ],
            availableCommands: [
              'ipconfig /all',
              'ip link show',
              'ethtool eth0',
              'ping 192.168.1.1',
            ],
            commandResponses: {
              'ipconfig /all': `Windows IP Configuration\n\n   Host Name . . . . . . . . . . . . : Acme-PC-02\n   Primary Dns Suffix  . . . . . . . : corp.acme.com\n   Node Type . . . . . . . . . . . . : Hybrid\n   IP Routing Enabled. . . . . . . . : No\n   WINS Proxy Enabled. . . . . . . . : No\n\nEthernet adapter Ethernet0:\n   Media State . . . . . . . . . . . : Media disconnected\n   Connection-specific DNS Suffix  . : \n   Description . . . . . . . . . . . : Intel(R) I219-LM Gigabit Network Connection\n   Physical Address. . . . . . . . . : 00-1A-2B-3C-4D-10\n   DHCP Enabled. . . . . . . . . . . : Yes\n   Autoconfiguration Enabled . . . . : Yes`,
              'ip link show': `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN mode DEFAULT group default qlen 1000\n    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00\n2: eth0: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc fq_codel state DOWN mode DEFAULT group default qlen 1000\n    link/ether 00:1a:2b:3c:4d:10 brd ff:ff:ff:ff:ff:ff`,
              'ethtool eth0': `Settings for eth0:\n\tSupported ports: [ TP ]\n\tSupported link modes:   10baseT/Half 10baseT/Full\n\t                        100baseT/Half 100baseT/Full\n\t                        1000baseT/Full\n\tSpeed: Unknown!\n\tDuplex: Unknown!\n\tPort: Twisted Pair\n\tPHYAD: 1\n\tTransceiver: internal\n\tAuto-negotiation: on\n\tLink detected: no`,
              'ping 192.168.1.1': `Pinging 192.168.1.1 with 32 bytes of data:\nPING: transmit failed. General failure.\nPING: transmit failed. General failure.\n\nPing statistics for 192.168.1.1:\n    Packets: Sent = 2, Received = 0, Lost = 2 (100% loss)`,
            },
          },
          validation: {
            judgment: [
              {
                kind: 'choose-and-defend',
                prompt:
                  'You run "ipconfig /all" (or "ip link show") on Acme-PC-02. What exact observable line in the output isolates the failure to Layer 1?',
                options: [
                  'DHCP Enabled . . . : Yes',
                  'Media State . . . . . : Media disconnected (or state DOWN / Link detected: no)',
                  'Host Name . . . . . . : Acme-PC-02',
                  'Description . . . . . : Intel(R) I219-LM Gigabit Network Connection',
                ],
                correctIndex: 1,
                explanation:
                  '"Media disconnected" (and Linux "state DOWN / NO-CARRIER") indicates that the physical network adapter detects no carrier frequency or electrical continuity on the wire.',
              },
              {
                kind: 'choose-and-defend',
                prompt:
                  'What physical action must be performed first to resolve Discovery Ticket #101?',
                options: [
                  'Reboot the Windows operating system to clear transient socket errors',
                  'Verify the Cat6 patch cord is firmly plugged and latched into the workstation RJ-45 jack and wall port',
                  'Change the static IP address to 192.168.1.99',
                  'Flush the DNS resolver cache',
                ],
                correctIndex: 1,
                explanation:
                  'When the physical link carrier is disconnected, software fixes cannot help. The physical patch cable must be plugged in and latched until the Link LED lights up green.',
              },
            ],
          },
          successMessage:
            'Ticket #101 Resolved! You correctly identified the physical Layer 1 media disconnect and verified link carrier requirements.',
        },
      ],
    },

    // ─────────────────────────────────────────────────────
    // Concept 1.2: Copper Strands & Full-Duplex Channels
    // ─────────────────────────────────────────────────────
    {
      id: 'copper-strands-full-duplex',
      order: 2,
      title: 'Copper Strands & Full-Duplex Channels',
      shortDescription:
        'Explore Cat6 twisted-pair pinouts and understand why direct copper connections operate in Full-Duplex with zero collisions.',
      theory: {
        summary:
          'Category 6 (Cat6) Ethernet cables contain 8 color-coded copper strands arranged in 4 twisted pairs. In modern point-to-point Ethernet links, dedicated Transmit (TX) and Receive (RX) pairs enable simultaneous two-way communication (Full-Duplex) with zero electrical collisions.',
        explanation: [
          '### Beat 1: The Physical Dilemma — How Do Signals Cross the Span?',
          'If two people talk through a single tin can and string, only one person can speak at a time. If both shout simultaneously, their sound waves interfere and neither message is understood.',
          '',
          'In early networking, computers faced this exact dilemma on coaxial cables. To solve this physically, twisted-pair cabling was introduced.',
          '',
          '### The Anatomy of Cat6 Twisted Pair',
          'A standard unshielded twisted pair (UTP) Cat6 cable contains **8 solid copper conductors** grouped into **4 tightly twisted pairs**:',
          '- Pair 1: Blue / White-Blue',
          '- Pair 2: Orange / White-Orange',
          '- Pair 3: Green / White-Green',
          '- Pair 4: Brown / White-Brown',
          '',
          'The twists cancel electromagnetic interference (crosstalk) from adjacent pairs and external noise.',
          '',
          '### Pinout Modes: Fast Ethernet vs Gigabit Ethernet',
          '| Standard | Speed | Active Pairs | Roles |',
          '|---|---|---|---|',
          '| **100BASE-TX (Fast Ethernet)** | 100 Mbps | 2 Pairs (4 wires) | Pins 1 & 2 = Transmit (TX)<br>Pins 3 & 6 = Receive (RX) |',
          '| **1000BASE-T (Gigabit Ethernet)** | 1 Gbps | All 4 Pairs (8 wires) | All 4 pairs operate simultaneously in full-duplex with digital signal processing (DSP) |',
          '',
          '### The Full-Duplex Guarantee (No Collisions!)',
          'Because the transmission wire has dedicated, physically isolated lanes for outgoing signals and incoming signals:',
          '- Computer A can transmit at full wire speed on the TX pair.',
          '- Simultaneously, Computer B can transmit at full wire speed on the RX pair.',
          '',
          '**Critical Rule:** On a direct, point-to-point copper Ethernet link running Full-Duplex, **collisions are physically impossible**. Collisions ONLY occur when multiple computers share the same electrical wire simultaneously (e.g., legacy Half-Duplex hubs).',
        ],
        keyTakeaway:
          'Dedicated TX and RX wire pairs allow simultaneous bidirectional communication (Full-Duplex). Direct point-to-point copper connections have ZERO collisions.',
        exampleQuery: '',
        exampleQueryExplanation: '',
        mcqs: [
          {
            id: 'net01-mcq-full-duplex-collision',
            question:
              'Why do two modern computers connected directly via a Cat6 cable running Full-Duplex never experience data collisions?',
            options: [
              'Because the operating system limits transmission to one packet per second',
              'Because transmission and reception travel across physically separate twisted wire pairs (dedicated TX and RX channels)',
              'Because Ethernet switches delete collisions before they reach the computer',
              'Because copper cables only permit electricity to flow in one direction',
            ],
            correctIndex: 1,
            explanation:
              'In Full-Duplex mode, transmission (TX) and reception (RX) utilize dedicated wire channels, allowing both nodes to send and receive simultaneously without signal interference.',
          },
          {
            id: 'net01-mcq-gigabit-pairs',
            question:
              'How many twisted pairs does Gigabit Ethernet (1000BASE-T) utilize over Cat6 cabling to achieve 1 Gbps throughput?',
            options: [
              'Only 1 pair',
              '2 pairs (4 wires)',
              'All 4 pairs (8 wires)',
              '8 pairs (16 wires)',
            ],
            correctIndex: 2,
            explanation:
              'Gigabit Ethernet (1000BASE-T) utilizes all 4 twisted pairs (8 wires) simultaneously, with each pair carrying 250 Mbps in full duplex.',
          },
        ],
      },
      tasks: [
        {
          id: 'net01-p2-duplex-channel-verification',
          title: 'Guided Practice: Full-Duplex Physical Channel Verification',
          description:
            'Analyze physical cable pinouts and identify the conditions required for collision-free Full-Duplex transmission.',
          instructions: [
            'Review the physical pinout configuration of an office workstation connected to an access switch via Cat6 cabling.',
            'Identify which pins transmit data and which receive data in 100BASE-TX mode.',
            'Defend why point-to-point full-duplex links eliminate the need for collision detection.',
          ],
          type: 'guided',
          primaryTable: '',
          initialSql: '',
          solutionSql: 'NETWORKING_JUDGMENT_TASK',
          solutionExplanation:
            'In full-duplex point-to-point links, dedicated TX and RX wire pairs physically prevent signal collision, achieving bidirectional wire-speed throughput.',
          hints: [
            {
              level: 1,
              text: 'Are outgoing and incoming signals sharing the same copper wire, or traveling on separate pairs?',
            },
          ],
          validation: {
            judgment: [
              {
                kind: 'choose-and-defend',
                prompt:
                  'In a 100BASE-TX Fast Ethernet connection, which RJ-45 pin pairs are assigned to transmit and receive?',
                options: [
                  'Pins 1 & 2 for Transmit (TX), Pins 3 & 6 for Receive (RX)',
                  'Pins 4 & 5 for Transmit, Pins 7 & 8 for Receive',
                  'Pins 1, 2, 3, and 4 all transmit simultaneously in half-duplex',
                  'All pins are shared randomly based on cable length',
                ],
                correctIndex: 0,
                explanation:
                  'Standard 100BASE-TX pinout allocates Pins 1 & 2 for Transmit (TX) and Pins 3 & 6 for Receive (RX), leaving pins 4, 5, 7, and 8 unused.',
              },
              {
                kind: 'choose-and-defend',
                prompt:
                  'Under what condition would an Ethernet link fall back to Half-Duplex and risk collisions?',
                options: [
                  'When the Cat6 cable is longer than 5 meters',
                  'When connected to a legacy multi-port repeater Hub or when duplex auto-negotiation fails to a forced half-duplex setting',
                  'Whenever the network carries IPv6 traffic instead of IPv4',
                  'When the workstation transmits more than 1500 bytes per second',
                ],
                correctIndex: 1,
                explanation:
                  'Half-duplex is required only when connected to a shared-medium multi-port hub or when duplex auto-negotiation fails, forcing nodes to share a single collision domain.',
              },
            ],
          },
          successMessage:
            'Physical channel mastery confirmed! You clearly distinguish between dedicated TX/RX pairs in Full-Duplex and shared-medium Half-Duplex.',
        },
      ],
    },

    // ─────────────────────────────────────────────────────
    // Concept 3: Local vs Remote Delivery & Network Models (C04 + C05)
    // ─────────────────────────────────────────────────────
    {
      id: 'nic-permanent-mac-address',
      order: 3,
      title: 'Physical NIC Chip & Permanent MAC Address',
      shortDescription:
        'Understand the role of the Network Interface Card and the 48-bit hardware serial number burned into silicon by the manufacturer.',
      theory: {
        summary:
          'Every computer requires a Network Interface Card (NIC) to serialize digital bytes into physical signals. The NIC is permanently identified by a 48-bit Media Access Control (MAC) address burned into its ROM silicon, consisting of a 24-bit IEEE Organizationally Unique Identifier (OUI) and a 24-bit device serial number.',
        explanation: [
          '### Beat 1: The Physical Dilemma — Who Is Talking on the Wire?',
          'Once electrons are pulsing across the copper wire, a fundamental question arises:',
          '*When a burst of electrical voltage reaches a network card, how does that card know whether this message was meant for this computer or another machine? And how does it know who sent it?*',
          '',
          'To solve this at the hardware level, the IEEE established the **Media Access Control (MAC)** address.',
          '',
          '### The Burned-In Address (BIA)',
          'A MAC address is a **48-bit binary number**, represented as 12 hexadecimal characters separated by colons or hyphens (e.g., `00-1A-2B-3C-4D-10` or `00:1a:2b:3c:4d:10`).',
          '',
          '```',
          '┌───────────────────────────┬───────────────────────────┐',
          '│   24 Bits: IEEE OUI       │   24 Bits: Device Serial  │',
          '│   (Manufacturer Vendor ID)│   (Factory Burned-In ROM) │',
          '├───────────────────────────┼───────────────────────────┤',
          '│         00 : 1A : 2B      │        3C : 4D : 10       │',
          '└───────────────────────────┴───────────────────────────┘',
          '```',
          '',
          '- **First 24 Bits (OUI)**: The Organizationally Unique Identifier assigned by IEEE to the hardware manufacturer (e.g., Intel, Apple, Cisco, Realtek).',
          '- **Last 24 Bits (NIC Serial)**: Assigned by the vendor during chip fabrication to ensure global uniqueness.',
          '',
          '### Layer 2 Hardware Filtering',
          'The physical NIC hardware filters incoming frames before disturbing the main computer CPU:',
          '1. If Destination MAC matches the NIC\'s burned-in MAC → Accept and interrupt CPU.',
          '2. If Destination MAC is the Broadcast address (`FF:FF:FF:FF:FF:FF`) → Accept and pass to OS.',
          '3. If Destination MAC belongs to someone else → The NIC hardware drops the frame instantly without consuming CPU or memory.',
        ],
        keyTakeaway:
          'MAC is a permanent Layer 2 hardware serial number burned into NIC silicon. The NIC inspects the destination MAC in hardware and drops irrelevant frames with zero CPU overhead.',
        exampleQuery: '',
        exampleQueryExplanation: '',
        mcqs: [
          {
            id: 'net01-mcq-mac-structure',
            question:
              'In the MAC address "00-1A-2B-3C-4D-10", what do the first 24 bits (00-1A-2B) represent?',
            options: [
              'The IP subnet identifier of the local office network',
              'The Organizationally Unique Identifier (OUI) assigned to the NIC manufacturer by the IEEE',
              'The physical switch port number where the computer is connected',
              'The dynamic DHCP lease expiration timestamp',
            ],
            correctIndex: 1,
            explanation:
              'The first 3 bytes (24 bits) of an Ethernet MAC address are the OUI, identifying the registered hardware manufacturer (such as Intel, Apple, or Cisco).',
          },
          {
            id: 'net01-mcq-hardware-filtering',
            question:
              'What does a workstation\'s Network Interface Card do when it receives a unicast Ethernet frame addressed to a different MAC address?',
            options: [
              'It forwards the frame to the office default gateway router',
              'It drops the frame immediately in NIC hardware without interrupting the host CPU',
              'It logs an error in the Windows Event Viewer and crashes the application',
              'It broadcasts the frame out all other ports',
            ],
            correctIndex: 1,
            explanation:
              'In normal (non-promiscuous) mode, the NIC hardware filters out frames that do not match its own MAC or the broadcast address, discarding them with zero CPU overhead.',
          },
        ],
      },
      tasks: [
        {
          id: 'net01-p3-mac-identity-forensics',
          title: 'Guided Practice: MAC Address Structure & Hardware Identity',
          description:
            'Examine MAC address formatting, identify vendor OUIs, and understand hardware-level filtering.',
          instructions: [
            'Audit three network adapters found in an enterprise datacenter rack.',
            'Distinguish between the 24-bit OUI and the 24-bit vendor-assigned serial number.',
            'Explain why MAC addresses cannot be used for global routing across the public internet.',
          ],
          type: 'guided',
          primaryTable: '',
          initialSql: '',
          solutionSql: 'NETWORKING_JUDGMENT_TASK',
          solutionExplanation:
            'MAC addresses are flat 48-bit hardware serial numbers without hierarchical structure. They identify local hardware interfaces on a single physical link or switch, but cannot scale for global routing.',
          hints: [
            {
              level: 1,
              text: 'Does a MAC address contain country codes or network boundaries like postal codes, or is it a flat serial number?',
            },
          ],
          validation: {
            judgment: [
              {
                kind: 'choose-and-defend',
                prompt:
                  'Why can\'t routers use flat Layer 2 MAC addresses to route packets across the global internet?',
                options: [
                  'Because MAC addresses change every time a computer restarts',
                  'Because MAC addresses have no geographical or hierarchical structure; routers would need to store billions of unaggregated entries',
                  'Because MAC addresses can only be transmitted over wireless radio frequencies',
                  'Because internet routers only understand ASCII text strings',
                ],
                correctIndex: 1,
                explanation:
                  'Flat MAC addresses lack hierarchy. Unlike telephone numbers or IP addresses (which group devices by area/network), every router on earth would need to know the specific port for every individual laptop.',
              },
            ],
          },
          successMessage:
            'Hardware identity confirmed! You understand 48-bit MAC anatomy, IEEE OUIs, and the boundary between Layer 2 hardware serials and Layer 3 routing.',
        },
      ],
    },

    // ─────────────────────────────────────────────────────
    // Concept 1.4: Ethernet II Packaging Envelope & CRC Checksum
    // ─────────────────────────────────────────────────────
    {
      id: 'encapsulation-segment-packet-frame',
      order: 4,
      title: 'Ethernet II Packaging Envelope & CRC Checksum',
      shortDescription:
        'Trace the Ethernet II frame layout and discover how the 32-bit CRC Frame Check Sequence detects bit corruption in hardware.',
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
          packetInspection: {
            title: 'Protocol Encapsulation Stack (L2 ➔ L3 ➔ L4 ➔ L7)',
            description: 'Observe how application data is encapsulated into a Segment, Packet, and Frame.',
            snapshots: [
              {
                hopLabel: 'Transmitted Frame (Client NIC)',
                deviceType: 'Host',
                layer2: {
                  srcMac: '3C:22:FB:4A:11:80',
                  dstMac: '00:1A:2B:3C:4D:5E',
                  etherType: '0x0800 (IPv4)',
                  fcs: '0x3F8B1A2C (Valid)',
                },
                layer3: {
                  version: 4,
                  srcIp: '192.168.1.50',
                  dstIp: '142.250.190.46',
                  ttl: 64,
                  protocol: 'TCP (6)',
                },
                layer4: {
                  type: 'TCP',
                  srcPort: 52140,
                  dstPort: 443,
                  seqNum: 1000,
                  flags: { syn: true },
                },
                layer7: {
                  protocol: 'HTTP',
                  summary: 'GET /api/v1/resource HTTP/1.1 (Host: api.example.com)',
                  data: {
                    method: 'GET',
                    path: '/api/v1/resource',
                    host: 'api.example.com',
                  },
                },
              },
            ],
          },
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
