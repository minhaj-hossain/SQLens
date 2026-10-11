import { ModuleData } from '../../../types/curriculum';

/**
 * net-02: Links, Interfaces & Ethernet Framing
 * ─────────────────────────────────────────────────────────────────────────────
 * Milestone 1 — Concepts C06, C07a, C07b, C07c, C08, C09
 * Teaches physical transmission media, link states and LED diagnostics,
 * Ethernet II header architecture, the 1500B payload MTU vs 1518B total wire
 * frame boundary, FCS trailer CRC-32 error detection, 48-bit MAC addresses,
 * and the evolutionary shift from hub collision domains to switched microsegmentation.
 */

export const NET_02_MODULE: ModuleData = {
  id: 'net-02',
  slug: 'links-interfaces-and-ethernet-framing',
  day: 2,
  title: 'Module 2: Links, Interfaces & Ethernet Framing',
  shortTitle: 'Links & Ethernet Framing',
  type: 'module',
  track: 'networking',
  milestoneId: 'net-milestone-1',
  description:
    'Explore the physical and data-link layers: cable types, link-light diagnostics, Ethernet II framing, the 1500-byte MTU boundary, FCS CRC error detection, 48-bit MAC addresses, and collision domains.',
  estimatedMinutes: 30,
  curriculumOrder: 2,
  displayLabel: 'Module 2',
  completionLearnings: [
    'Physical media include twisted-pair copper (100m distance limit) and fiber optics (single-mode vs multi-mode, immune to EMI)',
    'Interface link state indicates physical carrier detection; link/speed LEDs diagnose cable connectivity and auto-negotiation',
    'Ethernet II frames contain a 14-byte header (Dst MAC, Src MAC, EtherType), a variable payload, and a 4-byte FCS trailer',
    'The standard 1500-byte MTU defines the Layer 3 payload limit, producing a maximum untagged on-the-wire frame of 1518 bytes',
    'The Frame Check Sequence (FCS) uses CRC-32 to detect transmission corruption; corrupted frames are silently discarded without Layer 2 retransmission',
    '48-bit MAC addresses provide flat hardware identification; switches eliminate hub collisions via dedicated microsegmented links',
  ],
  concepts: [
    // ─────────────────────────────────────────────────────
    // Concept 1: Physical Links, Cable Types & Link States (C06)
    // ─────────────────────────────────────────────────────
    {
      id: 'shared-medium-collisions',
      order: 1,
      title: 'Physical Links, Cable Types & Link States',
      shortDescription:
        'Understand copper vs fiber media, transceivers, interface link states, and LED diagnostics.',
      theory: {
        summary:
          'Before any digital frame can be exchanged, a physical connection must be established. Network interfaces connect via twisted-pair copper or fiber-optic media, exchanging physical carrier pulses to negotiate link state, speed, and duplex.',
        explanation: [
          '### C06: Physical Media & Interface Link States',
          'All network communication relies on physical signals transmitted through a medium:',
          '',
          '1. **Twisted-Pair Copper (Cat 5e, Cat 6, Cat 6a)**:',
          '- Uses pairs of copper wires twisted together to cancel electromagnetic interference (crosstalk).',
          '- Terminated with **RJ-45** connectors.',
          '- **Strict 100-meter (328 ft) distance limit**: Beyond 100 meters, signal attenuation and timing degrade signal integrity below standard thresholds.',
          '',
          '2. **Fiber Optics**:',
          '- Transmits light pulses through ultra-pure glass or plastic cores. Completely immune to electromagnetic interference (EMI) and radio frequency interference (RFI).',
          '- **Multi-Mode Fiber (MMF)**: Wider core (~50–62.5 µm); uses low-cost LEDs/VCSELs; ideal for intra-building datacenters up to ~300–550 meters.',
          '- **Single-Mode Fiber (SMF)**: Narrow core (~9 µm); uses precision lasers; ideal for long-distance telecommunications and WAN links spanning 10 to 40+ kilometers.',
          '- Connected via modular transceivers: **SFP** (1 Gbps), **SFP+** (10 Gbps), **QSFP** (40/100 Gbps).',
          '',
          '3. **Interface Link States & Diagnostics**:',
          '- **Link UP**: The Network Interface Card (NIC) detects physical carrier signals or link pulses from the attached switch port. Physical Layer 1 is operational.',
          '- **Link DOWN**: No carrier signal detected. Causes include unplugged cables, cut wire strands, disabled switch ports, or incompatible transceivers.',
          '- **LED Diagnostics**:',
          '  - **Link/Activity LED**: Solid green indicates an active link; flashing indicates active frame transmission or reception; dark/off indicates physical link down.',
          '  - **Speed LED**: Amber or green indicates negotiated connection speed (e.g. Amber = 100 Mbps, Green = 1000 Mbps).',
          '',
          '4. **Duplex Modes**:',
          '- **Half-Duplex**: Devices can either transmit OR receive, but not both at the same time (legacy hubs).',
          '- **Full-Duplex**: Dedicated transmit and receive paths allow simultaneous two-way communication with zero collisions (modern switches).',
        ],
        keyTakeaway:
          'Copper links have a 100m limit; fiber spans kilometers immune to EMI. A solid link light verifies physical carrier integrity before upper protocols can function.',
        exampleQuery: '',
        exampleQueryExplanation: '',
        mcqs: [
          {
            id: 'net02-mcq-copper-distance',
            question:
              'What is the maximum certified cable run distance for standard twisted-pair copper Ethernet (Cat 5e/Cat 6)?',
            options: [
              '50 meters (164 ft)',
              '100 meters (328 ft)',
              '500 meters (1,640 ft)',
              '1,000 meters (3,280 ft)',
            ],
            correctIndex: 1,
            explanation:
              'The TIA/EIA standard specifies a maximum length of 100 meters (90m horizontal solid core + 10m patch cables) for twisted-pair copper Ethernet to prevent signal attenuation and timing skew.',
          },
          {
            id: 'net02-mcq-fiber-type',
            question:
              'A network engineer needs to connect two datacenter buildings separated by 5 kilometers. Which physical transmission medium is appropriate?',
            options: [
              'Category 6a unshielded twisted pair copper',
              'Single-Mode Fiber (SMF) with laser transceivers',
              'Multi-Mode Fiber (MMF) with LED transceivers',
              'Standard USB 3.0 active extension cabling',
            ],
            correctIndex: 1,
            explanation:
              'Single-Mode Fiber (SMF) has a narrow 9-micron core and uses lasers to transmit light signals over distances exceeding 10–40 kilometers without repeaters. Multi-Mode fiber is limited to ~550 meters, and copper to 100 meters.',
          },
        ],
      },
      tasks: [
        {
          id: 'net02-p1-link-diagnostics',
          title: 'Guided Practice: Physical Link Diagnostics & LED Triage',
          description:
            'Diagnose physical network interface connectivity issues using link LED indications and media specifications.',
          instructions: [
            'A desktop computer in an engineering lab cannot communicate with the local network.',
            'The technician inspects the back of the computer and observes that the RJ-45 Ethernet port LED is completely dark (unlit).',
            'Determine the root physical cause and identify the correct diagnostic step.',
          ],
          type: 'guided',
          primaryTable: '',
          initialSql: '',
          solutionSql: 'NETWORKING_JUDGMENT_TASK',
          solutionExplanation:
            'A dark link LED means the physical interface has no carrier signal (Link DOWN). Upper-layer protocols (IP, DNS) cannot function until the physical cable or port issue is resolved.',
          hints: [
            {
              level: 1,
              text: 'A dark link light indicates Layer 1 (physical) failure, not a DNS or IP software configuration problem.',
            },
            {
              level: 2,
              text: 'Check physical cable seating, cable integrity, or whether the switch port on the other end is connected and enabled.',
            },
          ],
          validation: {
            judgment: [
              {
                kind: 'choose-and-defend',
                prompt:
                  'What does a completely unlit (dark) Ethernet link LED on a computer\'s network port indicate?',
                options: [
                  'The computer has a DNS name resolution failure',
                  'The network interface is not detecting a physical carrier signal (Layer 1 Link is Down)',
                  'The switch CAM table has full MAC memory',
                  'The web browser is using an invalid SSL/TLS certificate',
                ],
                correctIndex: 1,
                explanation:
                  'The link LED is driven by the physical transceiver hardware. If it is unlit, no physical link pulses or carrier frequencies are being detected from the other end of the cable.',
              },
              {
                kind: 'choose-and-defend',
                prompt:
                  'Which action should the technician perform FIRST to resolve the unlit link light?',
                options: [
                  'Reconfigure the IPv4 default gateway in Windows network settings',
                  'Verify physical cable seating at both ends and test with a known good patch cable',
                  'Flush the DNS resolver cache using the command prompt',
                  'Submit a firewall rule change to open TCP port 443',
                ],
                correctIndex: 1,
                explanation:
                  'Troubleshooting follows a disciplined bottom-up methodology. When Layer 1 is down (unlit LED), software settings are irrelevant until the physical cable and port connectivity are restored.',
              },
            ],
          },
          successMessage:
            'Correct! Bottom-up troubleshooting begins at Layer 1: an unlit link LED indicates an absence of physical carrier, requiring physical cable and port verification.',
        },
      ],
    },

    // ─────────────────────────────────────────────────────
    // Concept 2: Ethernet Framing, MTU & Error Detection (C07a + C07b + C07c)
    // ─────────────────────────────────────────────────────
    {
      id: 'ethernet-framing-mtu-fcs',
      order: 2,
      title: 'Ethernet Framing: MTU, Fields & FCS Error Detection',
      shortDescription:
        'Dissect Ethernet II headers, understand the 1500B payload MTU vs 1518B wire boundary, and master FCS CRC-32 error detection.',
      theory: {
        summary:
          'Ethernet II frames encapsulate network layer packets into discrete transmission units. The standard 1500-byte MTU governs the maximum payload size, resulting in a 1518-byte untagged frame on the wire. The 4-byte Frame Check Sequence (FCS) trailer detects bit errors; corrupted frames are dropped silently without Layer 2 retransmission.',
        explanation: [
          '### C07a: Ethernet II Frame Architecture',
          'An Ethernet II frame on the physical wire consists of distinct structured fields:',
          '',
          '```',
          '| Preamble & SFD | Dst MAC | Src MAC | EtherType | Payload (IP Packet) | FCS Trailer |',
          '|    8 bytes     | 6 bytes | 6 bytes |  2 bytes  |   46–1500 bytes     |   4 bytes   |',
          '```',
          '',
          '- **Preamble (7 bytes) + Start Frame Delimiter (SFD, 1 byte)**: A 101010... bit sequence ending in 10101011 that synchronizes receiving clock circuitry. (Stripped by physical layer; not counted in frame size).',
          '- **Destination MAC (6 bytes / 48 bits)**: Hardware address of the next-hop recipient on the local link.',
          '- **Source MAC (6 bytes / 48 bits)**: Hardware address of the transmitting network card.',
          '- **EtherType (2 bytes / 16 bits)**: Identifies the encapsulated Layer 3 protocol payload:',
          '  - `0x0800`: IPv4 Datagram',
          '  - `0x86DD`: IPv6 Datagram',
          '  - `0x0806`: Address Resolution Protocol (ARP) Request/Reply',
          '- **Payload (46 to 1500 bytes)**: The encapsulated Layer 3 data. If the payload is smaller than 46 bytes, padding bytes are appended to ensure the frame reaches the minimum legal size of 64 bytes.',
          '- **FCS Trailer (4 bytes / 32 bits)**: Frame Check Sequence containing a 32-bit Cyclic Redundancy Check (CRC-32).',
          '',
          '### C07b: 1500B Payload MTU vs 1518B Total Frame Size',
          'A pervasive point of confusion among engineers is the distinction between MTU and frame size:',
          '- **MTU (Maximum Transmission Unit)**: Defines the **maximum payload size** that can be passed down to the link layer from Layer 3 (traditionally **1500 bytes**).',
          '- **Total Wire Frame Size**: Includes the Layer 2 framing overhead:',
          '  - 14 bytes header (6B Dst MAC + 6B Src MAC + 2B EtherType)',
          '  + 1500 bytes payload (MTU)',
          '  + 4 bytes FCS trailer',
          '  = **1518 bytes total untagged frame on the wire** (or **1522 bytes** if an 802.1Q VLAN tag is present).',
          '',
          '### C07c: FCS Trailer & CRC-32 Error Detection',
          'When sending a frame, the transmitting NIC computes a 32-bit CRC mathematical checksum across all bits from the Destination MAC through the payload, placing the result in the **FCS trailer**.',
          '',
          'When the receiving NIC receives the frame:',
          '1. It recalculates the CRC over the received bits.',
          '2. If the calculated CRC matches the FCS in the trailer, the frame is intact and passed up to the OS.',
          '3. **If a bit flipped during transmission (CRC mismatch)**: The receiving interface **silently drops the frame immediately**.',
          '',
          '**Critical Rule**: Ethernet provides **error detection, NOT error recovery**. There is NO negative acknowledgment (NACK) or Layer 2 retransmission in standard Ethernet. If reliable recovery is needed, it must be performed by end-to-end transport protocols (like TCP).',
        ],
        keyTakeaway:
          '1500-byte MTU limits payload; total untagged wire frame is 1518 bytes. The 4-byte FCS drops corrupted frames silently without Layer 2 retransmission.',
        exampleQuery: '',
        exampleQueryExplanation: '',
        mcqs: [
          {
            id: 'net02-mcq-mtu-vs-frame',
            question:
              'If a standard Ethernet interface is configured with an MTU of 1500 bytes, what is the maximum total size of an untagged Ethernet II frame on the wire (including header, payload, and FCS)?',
            options: [
              '1500 bytes',
              '1514 bytes',
              '1518 bytes',
              '1522 bytes',
            ],
            correctIndex: 2,
            explanation:
              'The 1500-byte MTU accounts only for the payload. Adding the 14-byte Ethernet header (6B Dst MAC + 6B Src MAC + 2B EtherType) and the 4-byte FCS trailer yields exactly 1518 bytes on the wire.',
          },
          {
            id: 'net02-mcq-fcs-behavior',
            question:
              'What does an Ethernet switch or receiving host do when it receives a frame whose recalculated CRC does not match the FCS trailer?',
            options: [
              'It sends an Ethernet NACK frame to the sender requesting an immediate retransmission',
              'It repairs the flipped bits using forward error correction and forwards the frame',
              'It silently drops and discards the corrupted frame',
              'It forwards the frame anyway but appends an error warning flag',
            ],
            correctIndex: 2,
            explanation:
              'Ethernet is a best-effort, unacknowledged link layer protocol. When an FCS CRC mismatch occurs, the corrupted frame is silently dropped. Ethernet does not perform link-layer retransmissions.',
          },
        ],
      },
      tasks: [
        {
          id: 'net02-p2-frame-dissection',
          title: 'Guided Practice: Frame Dissection & MTU Boundary Analysis',
          description:
            'Inspect Ethernet frame fields in a network analyzer trace to verify EtherType, payload boundaries, and FCS validation.',
          instructions: [
            'A network engineer captures an Ethernet frame with Wireshark.',
            'The frame header shows Destination MAC `00:50:56:C0:00:08`, Source MAC `00:0C:29:12:34:56`, and EtherType `0x0800`.',
            'The frame payload contains an IPv4 packet measuring 1500 bytes.',
            'Verify the total frame size and determine how the receiver handles CRC validation.',
          ],
          type: 'guided',
          primaryTable: '',
          initialSql: '',
          solutionSql: 'NETWORKING_JUDGMENT_TASK',
          solutionExplanation:
            'EtherType 0x0800 indicates IPv4. A 1500-byte payload combined with 14 bytes of header and 4 bytes of FCS equals 1518 bytes. The receiver checks the FCS CRC; if valid, it decapsulates the IPv4 payload.',
          ethernetFrame: {
            title: 'Wireshark Telemetry: Standard IPv4 Ethernet II Frame',
            description:
              'Dissect the 14-byte header, 1500-byte payload MTU, and 4-byte FCS trailer. Drag the slider to observe padding insertion when payload is under 46 bytes.',
            destinationMac: '00:50:56:C0:00:08',
            sourceMac: '00:0C:29:12:34:56',
            etherType: '0x0800',
            payloadProtocol: 'IPv4 Datagram',
            initialPayloadSize: 1500,
            hasVlanTag: false,
          },
          hints: [
            {
              level: 1,
              text: '0x0800 indicates IPv4; 0x86DD indicates IPv6; 0x0806 indicates ARP.',
            },
            {
              level: 2,
              text: 'Remember: 14 bytes header + 1500 bytes payload + 4 bytes FCS = 1518 bytes total on wire.',
            },
          ],
          validation: {
            judgment: [
              {
                kind: 'choose-and-defend',
                prompt:
                  'What protocol is encapsulated inside the frame payload when the EtherType field is 0x0800?',
                options: [
                  'IPv6 Datagram',
                  'IPv4 Datagram',
                  'Address Resolution Protocol (ARP)',
                  'Spanning Tree Protocol (STP)',
                ],
                correctIndex: 1,
                explanation:
                  'EtherType 0x0800 is the assigned standard identifier for IPv4. IPv6 uses 0x86DD, and ARP uses 0x0806.',
              },
              {
                kind: 'choose-and-defend',
                prompt:
                  'If electromagnetic noise from an unshielded motor flips two bits in the frame payload while in transit, what occurs at the receiving switch port?',
                options: [
                  'The switch automatically recovers the flipped bits using parity and forwards the frame',
                  'The receiver calculates a CRC that mismatches the FCS trailer and silently discards the frame',
                  'The switch logs an error and transmits an Ethernet Pause frame to the sender',
                  'The frame is delivered to the operating system with an error alert flag',
                ],
                correctIndex: 1,
                explanation:
                  'Any flipped bit alters the recalculated CRC-32. The receiver detects the mismatch with the FCS trailer and silently discards the frame without attempting repair or retransmission.',
              },
            ],
          },
          successMessage:
            'Excellent! You mastered Ethernet II framing: EtherType specifies the payload protocol, MTU limits payload size to 1500 bytes, and FCS drops corrupted frames.',
        },
      ],
    },

    // ─────────────────────────────────────────────────────
    // Concept 3: 48-bit MAC Addresses & Collision Domains (C08 + C09)
    // ─────────────────────────────────────────────────────
    {
      id: 'mac-addresses-and-collision-domains',
      order: 3,
      title: '48-bit MAC Addresses & The Elimination of Collision Domains',
      shortDescription:
        'Understand MAC address formatting, unicast vs broadcast addresses, and how switches eliminated hub collisions.',
      theory: {
        summary:
          'Media Access Control (MAC) addresses are 48-bit hardware identifiers burned into NICs. Early networks used Layer 1 hubs where all connected devices shared a single collision domain. Modern switches provide microsegmentation, giving every port an independent, full-duplex collision-free path.',
        explanation: [
          '### C08: 48-Bit MAC Addresses Architecture',
          'Every Ethernet Network Interface Card has a globally unique physical address called a **MAC address**:',
          '- **Format**: 48 bits (6 octets / 6 bytes), written as 12 hexadecimal digits (e.g. `00:1A:2B:3C:4D:5E` or `001a.2b3c.4d5e`).',
          '- **Structure**:',
          '  - **OUI (Organizationally Unique Identifier)**: The first 24 bits (3 bytes) identify the manufacturer (assigned by the IEEE, e.g. Cisco, Apple, Intel).',
          '  - **NIC Specific (Device Identifier)**: The remaining 24 bits (3 bytes) are assigned by the manufacturer to uniquely identify the physical interface.',
          '',
          '### MAC Address Types',
          '1. **Unicast MAC**: Addresses a single specific device. (Least significant bit of first octet is `0`, e.g. `00:1A:...`).',
          '2. **Broadcast MAC**: `FF:FF:FF:FF:FF:FF` (all 48 bits are `1`). Replicated and delivered to **every device** on the local broadcast domain.',
          '3. **Multicast MAC**: Addresses an interested group of devices. (Least significant bit of first octet is `1`, e.g. `01:00:5E:...` for IPv4 multicast).',
          '4. **Locally Administered / Randomized MACs**: Modern smartphones and laptops randomize their MAC address when scanning for public Wi-Fi to prevent tracking.',
          '',
          '### C09: Hub Collisions vs Switched Microsegmentation',
          'Understanding why switches exist requires understanding the fatal flaw of **hubs**:',
          '',
          '| Feature | Layer 1 Hub | Layer 2 Switch |',
          '|---|---|---|',
          '| **Operation** | Blind electrical repeater | Intelligent frame bridge |',
          '| **Collision Domain** | **One shared collision domain** across all ports | **Separate collision domain** per port |',
          '| **Transmission** | Half-duplex (devices share the medium) | Full-duplex (simultaneous send/receive) |',
          '| **Collisions** | Common (CSMA/CD protocol required) | **Zero collisions** on full-duplex links |',
          '| **Bandwidth** | Shared (100 Mbps shared among all ports) | Dedicated (full speed per port) |',
          '',
          'In a hub topology, if Host A and Host B transmit at the same instant, their electrical pulses collide on the shared wire, destroying both frames. As more devices join a hub, collision rates soar and usable bandwidth collapses.',
          '',
          '**Switched Microsegmentation**: By buffering frames in memory and using independent transmit/receive wire pairs, a switch isolates each port into its own private collision domain. This eliminates collisions entirely and paves the way for MAC learning (covered in Module 3).',
        ],
        keyTakeaway:
          '48-bit MAC addresses identify network cards on the local link. Switches isolate each port into its own collision domain, ending the shared collision flaws of hubs.',
        exampleQuery: '',
        exampleQueryExplanation: '',
        mcqs: [
          {
            id: 'net02-mcq-broadcast-mac',
            question:
              'What is the standard Ethernet broadcast MAC address received and processed by every host on a local network?',
            options: [
              '00:00:00:00:00:00',
              'FF:FF:FF:FF:FF:FF',
              '01:00:5E:00:00:01',
              '192.168.1.255',
            ],
            correctIndex: 1,
            explanation:
              'FF:FF:FF:FF:FF:FF is the 48-bit all-ones broadcast MAC address. Any frame sent to this destination is flooded to all ports on the local Layer 2 broadcast domain.',
          },
          {
            id: 'net02-mcq-hub-vs-switch-collision',
            question:
              'Why does replacing an 8-port Ethernet hub with an 8-port Ethernet switch eliminate network collisions?',
            options: [
              'Because switches convert electrical signals into optical laser beams',
              'Because switches microsegment the network, placing each port into its own isolated collision domain operating in full-duplex',
              'Because switches change MAC addresses into IP addresses',
              'Because switches compress packets so they can never overlap in time',
            ],
            correctIndex: 1,
            explanation:
              'Switches microsegment the network so that each cable is an independent, point-to-point collision domain. Combined with full-duplex signaling, simultaneous transmissions no longer collide.',
          },
        ],
      },
      tasks: [
        {
          id: 'net02-p3-mac-collision-evaluation',
          title: 'Independent Practice: MAC Classification & Collision Analysis',
          description:
            'Inspect MAC addresses to determine address types and analyze collision domain boundaries in network topologies.',
          instructions: [
            'A network technician investigates a high-density office floor plan.',
            'Topology 1 uses legacy hubs connecting 16 workstations.',
            'Topology 2 uses an enterprise Layer 2 switch connecting the same 16 workstations with full-duplex Cat 6 cables.',
            'Analyze collision domains and classify destination MAC addresses.',
          ],
          type: 'independent',
          primaryTable: '',
          initialSql: '',
          solutionSql: 'NETWORKING_JUDGMENT_TASK',
          solutionExplanation:
            'The 16-port hub creates 1 shared collision domain with high contention. The 16-port switch creates 16 independent collision domains with zero collisions in full-duplex mode. Destination FF:FF:FF:FF:FF:FF is a broadcast frame.',
          ethernetFrame: {
            title: 'Ethernet Broadcast Frame: ARP Request Dissection',
            description:
              'Inspect a Layer 2 broadcast frame addressed to FF:FF:FF:FF:FF:FF with EtherType 0x0806 (ARP). Note the 28-byte payload requiring 18 bytes of padding to reach the 64-byte minimum legal frame size.',
            destinationMac: 'FF:FF:FF:FF:FF:FF',
            sourceMac: '00:1A:2B:3C:4D:5E',
            etherType: '0x0806',
            payloadProtocol: 'ARP Request',
            initialPayloadSize: 28,
            hasVlanTag: false,
          },
          hints: [
            {
              level: 1,
              text: 'Every switch port is an independent collision domain. A hub combines all connected ports into a single shared collision domain.',
            },
            {
              level: 2,
              text: 'FF:FF:FF:FF:FF:FF is received by all hosts in the broadcast domain.',
            },
          ],
          validation: {
            judgment: [
              {
                kind: 'choose-and-defend',
                prompt:
                  'How many collision domains exist in Topology 1 (16 workstations connected to a single 16-port hub) versus Topology 2 (16 workstations connected to a 16-port switch)?',
                options: [
                  'Topology 1 has 16 collision domains; Topology 2 has 1 collision domain',
                  'Topology 1 has 1 collision domain; Topology 2 has 16 collision domains',
                  'Both topologies have exactly 1 shared collision domain',
                  'Both topologies have zero collision domains',
                ],
                correctIndex: 1,
                explanation:
                  'A hub is a Layer 1 repeater where all ports share 1 collision domain. A switch microsegments traffic so that each of its 16 ports is an independent collision domain.',
              },
              {
                kind: 'choose-and-defend',
                prompt:
                  'A host sends an ARP Request with destination MAC FF:FF:FF:FF:FF:FF. Which devices on the local segment will process this frame?',
                options: [
                  'Only the default gateway router',
                  'Only devices whose MAC address begins with the same 24-bit OUI',
                  'All devices connected to the local broadcast domain',
                  'Only the device that sent the frame',
                ],
                correctIndex: 2,
                explanation:
                  'The all-ones address FF:FF:FF:FF:FF:FF is the Layer 2 broadcast address. Every device connected to the broadcast domain receives, decapsulates, and inspects the frame.',
              },
            ],
          },
          successMessage:
            'Outstanding! You have mastered MAC address types and how switched microsegmentation eliminates collision domains.',
        },
      ],
    },
  ],

  // ─────────────────────────────────────────────────────
  // Module 2 Challenge
  // ─────────────────────────────────────────────────────
  challenge: {
    id: 'net-02-challenge',
    title: 'Module 2 Challenge: Physical Link Diagnostics & Frame Forensics',
    scenario:
      'A remote branch office experiences severe performance degradation and packet drops. Technicians report flickering port LEDs on an access switch, and Wireshark captures reveal abnormal frame drop counters and oversized packets. Conduct a physical and data-link forensic analysis.',
    tasks: [
      {
        id: 'net02-c1-link-light-cable-fault-triage',
        title: 'Task 1: Physical Link Triage & Cable Fault Isolation',
        description:
          'Isolate physical link failures using cable specifications, distance constraints, and link state indicators.',
        instructions: [
          'An unshielded Cat 5e cable was run from a second-floor server room to an outdoor security camera located 145 meters away.',
          'The switch port link LED fluctuates intermittently between link UP and link DOWN.',
          'Identify the underlying physical engineering defect causing the intermittent link.',
        ],
        type: 'challenge',
        primaryTable: '',
        initialSql: '',
        solutionSql: 'NETWORKING_JUDGMENT_TASK',
        solutionExplanation:
          'Standard twisted-pair copper Ethernet is strictly limited to 100 meters. A 145-meter run causes excessive signal attenuation and timing failures, resulting in carrier drop and link flapping.',
        hints: [
          {
            level: 1,
            text: 'What is the certified distance limit for twisted-pair copper Ethernet cabling?',
          },
          {
            level: 2,
            text: 'At 145 meters, the copper run exceeds the 100-meter maximum length, causing physical signal degradation.',
          },
        ],
        validation: {
          judgment: [
            {
              kind: 'choose-and-defend',
              prompt:
                'What is the root cause of the intermittent link flapping on the 145-meter outdoor camera run?',
              options: [
                'The camera is requesting an IPv6 address that the switch does not support',
                'The cable length (145m) violates the 100m certified maximum for copper Ethernet, causing severe signal attenuation',
                'The switch CAM table has run out of memory entries for the camera',
                'The camera is sending HTTP requests instead of HTTPS requests',
              ],
              correctIndex: 1,
              explanation:
                'Standard copper Ethernet standards (100BASE-TX, 1000BASE-T) strictly specify a maximum length of 100 meters. Exceeding this distance causes signal attenuation and timing skew, making carrier detection unstable.',
            },
            {
              kind: 'choose-and-defend',
              prompt:
                'What is the standard engineering solution to reliably connect a device located 145 meters away from the switch?',
              options: [
                'Change the subnet mask on the camera from /24 to /16 to increase range',
                'Replace the copper cable with fiber optics (or insert an intermediate PoE switch/repeater within 100m)',
                'Configure static ARP entries in the camera operating system',
                'Disable the FCS checksum check on the switch port',
              ],
              correctIndex: 1,
              explanation:
                'Fiber-optic cabling easily supports distances of hundreds of meters or kilometers without attenuation. Alternatively, an intermediate switch or certified Ethernet extender must be placed within the 100m boundary.',
            },
          ],
        },
        successMessage:
          'Challenge 1 mastered! You recognized the 100-meter copper limit and identified fiber/repeater remediation.',
      },
      {
        id: 'net02-c2-frame-forensics-mtu-crc',
        title: 'Task 2: Frame Header Forensics, MTU Sizing & FCS Integrity',
        description:
          'Evaluate frame size boundaries, MTU limits, and CRC error discard behaviors in packet trace telemetry.',
        instructions: [
          'A packet trace reveals that a host attempts to transmit a 1600-byte IP packet onto a standard Ethernet network with a 1500-byte MTU.',
          'Additionally, high electrical noise from nearby elevator machinery causes 5% of arriving frames to have corrupted FCS values.',
          'Determine the handling of both the oversized packet and the corrupted frames.',
        ],
        type: 'challenge',
        primaryTable: '',
        initialSql: '',
        solutionSql: 'NETWORKING_JUDGMENT_TASK',
        solutionExplanation:
          'A 1600-byte IP packet exceeds the standard 1500-byte MTU and must be fragmented or dropped with an ICMP "Fragmentation Needed" error. Frames failing FCS CRC validation are dropped immediately by the receiver without Layer 2 retransmission.',
        ethernetFrame: {
          title: 'Elevator EMI Interference: Corrupted Frame Capture',
          description:
            'Wireshark trace showing corrupted FCS trailer caused by electrical noise. Notice the CRC MISMATCH resulting in immediate silent NIC discard without Layer 2 retransmission.',
          destinationMac: '00:1A:2B:3C:4D:5E',
          sourceMac: '00:11:22:33:44:55',
          etherType: '0x0800',
          payloadProtocol: 'IPv4 Datagram',
          initialPayloadSize: 40,
          initialCorrupted: true,
          corruptedField: 'payload',
        },
        hints: [
          {
            level: 1,
            text: 'Can a standard Ethernet interface encapsulate a payload larger than its configured MTU (1500 bytes) without IP fragmentation?',
          },
          {
            level: 2,
            text: 'FCS failures result in immediate silent frame discard at Layer 2.',
          },
        ],
        validation: {
          judgment: [
            {
              kind: 'choose-and-defend',
              prompt:
                'What happens when an application attempts to send a 1600-byte IP packet through an interface configured with a standard 1500-byte MTU?',
              options: [
                'The link layer automatically expands the Ethernet header by 100 bytes to accommodate the data',
                'The packet exceeds the MTU; the network layer must fragment the packet into smaller chunks or discard it',
                'The switch compresses the packet using CRC-32 before placing it on the wire',
                'The frame is padded with zeros and sent normally',
              ],
              correctIndex: 1,
              explanation:
                'MTU dictates the maximum Layer 3 payload size. Any packet exceeding the 1500-byte MTU cannot fit into a single standard Ethernet frame and must be fragmented by the IP layer or dropped (if DF bit is set).',
            },
            {
              kind: 'choose-and-defend',
              prompt:
                'When the switch detects that 5% of frames fail FCS CRC-32 checks due to electrical interference, how does Layer 2 respond?',
              options: [
                'The switch retransmits the corrupted frames automatically across the cable',
                'The switch silently drops each corrupted frame; higher-layer protocols like TCP must detect loss and retransmit',
                'The switch sends an ICMP Echo Reply alert to the transmitting station',
                'The switch repairs the corrupted data using parity bits stored in the preamble',
              ],
              correctIndex: 1,
              explanation:
                'Standard Ethernet provides unacknowledged, best-effort delivery. Corrupted frames with FCS errors are silently discarded by the switch. Upper-layer transport protocols (such as TCP) must detect the missing data and retransmit.',
            },
          ],
        },
        successMessage:
          'Module 2 Mastered! You have proven deep technical understanding of physical links, 1500-byte MTU constraints, FCS CRC error discards, and 48-bit MAC addressing.',
      },
    ],
  },
};
