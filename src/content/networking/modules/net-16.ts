import { ModuleData } from '../../../types/curriculum';
import type { MentorScript } from '../../../types/networking-curriculum';

export const NET_16_MENTOR_SCRIPT: MentorScript = {
  version: '1.0.0',
  moduleId: 'net-16',
  stageTitle: '802.1Q VLAN Trunking & Dijkstra Shortest Path Lab',
  stageSubtitle: 'Segment broadcast domains with 802.1Q tags and calculate loop-free enterprise routes with Dijkstra SPF',
  initialStageState: {
    spotlight: 'vlan-trunk',
    highlightedField: 'tag-dissection',
  },
  revealLadder: {
    'step-access': ['vlan-access'],
    'step-trunk': ['vlan-access', 'vlan-trunk'],
    'step-wifi': ['vlan-access', 'vlan-trunk', 'wifi-csmaca'],
    'step-channels': ['vlan-access', 'vlan-trunk', 'wifi-csmaca', 'wifi-channels'],
    'step-ospf': ['vlan-access', 'vlan-trunk', 'wifi-csmaca', 'wifi-channels', 'ospf-dijkstra'],
  },
  terms: {
    'vlan-segmentation': {
      term: 'VLAN Segmentation',
      definition: 'Dividing a physical switch into multiple isolated broadcast domains.',
      part: 'vlan-access',
    },
    'dot1q-tag': {
      term: '802.1Q Tag',
      definition: 'A 4-byte header inserted on trunk links containing a 12-bit VLAN ID.',
      part: 'vlan-trunk',
    },
    'csma-ca': {
      term: 'CSMA/CA',
      definition: 'Carrier Sense Multiple Access with Collision Avoidance for wireless RF airwaves.',
      part: 'wifi-csmaca',
    },
    'dijkstra-spf': {
      term: 'Dijkstra SPF',
      definition: 'Shortest Path First algorithm used by OSPF to compute lowest-cost routing trees.',
      part: 'ospf-dijkstra',
    },
  },
  beats: [
    {
      id: 'b1',
      kind: 'say',
      text: 'In a flat network, every workstation receives every other department broadcast chatter, leaking data and wasting CPU.',
      revealedParts: ['vlan-access'],
    },
    {
      id: 'b2',
      kind: 'predict',
      text: 'How does an enterprise switch isolate Finance from Marketing on the same physical box?',
      prompt: 'Select the Layer 2 segmentation technique:',
      options: [
        { id: 'opt-vlan', text: 'By partitioning switch ports into Virtual LANs (VLANs) with isolated broadcast domains.', isCorrect: true },
        { id: 'opt-volt', text: 'By running different electrical voltages through the copper patch cables.', isCorrect: false },
        { id: 'opt-mac', text: 'By rotating the switch physical MAC address every thirty seconds.', isCorrect: false },
      ],
      whyPrompt: 'Why does VLAN segmentation ensure isolation?',
      whyOptions: [
        { id: 'why-domain', text: 'Because switches only flood broadcast and unicast frames to ports sharing the same VLAN ID.', isCorrect: true },
        { id: 'why-power', text: 'Because computers in different departments use incompatible binary electrical currents.', isCorrect: false },
      ],
      revealedParts: ['vlan-access', 'vlan-trunk'],
    },
    {
      id: 'b3',
      kind: 'point',
      target: 'vlan-access',
      text: '{{term:vlan-segmentation}} creates isolated virtual switches inside one physical chassis.',
      revealedParts: ['vlan-access', 'vlan-trunk'],
    },
    {
      id: 'b4',
      kind: 'action',
      prompt: 'Inspect the 4-byte {{term:dot1q-tag}} inserted on trunk links between switches.',
      buttonLabel: 'Inspect 802.1Q Tag',
      targetState: { spotlight: 'tag-view' },
      revealedParts: ['vlan-access', 'vlan-trunk'],
    },
    {
      id: 'b5',
      kind: 'say',
      text: 'Now consider wireless links. Why cannot Wi-Fi radios transmit and detect collisions at the same time?',
      revealedParts: ['vlan-access', 'vlan-trunk', 'wifi-csmaca'],
    },
    {
      id: 'b6',
      kind: 'predict',
      text: 'Why must 802.11 Wi-Fi use collision avoidance (CSMA/CA) instead of Ethernet collision detection?',
      prompt: 'Select the wireless radio limitation:',
      options: [
        { id: 'opt-rf', text: 'A radio transmit power overwhelms its own receiver, preventing collision sensing while talking.', isCorrect: true },
        { id: 'opt-speed', text: 'Radio signals travel faster than light and cannot be decoded by silicon chips.', isCorrect: false },
        { id: 'opt-ant', text: 'Wi-Fi antennas cannot decode standard binary bits over radio frequencies.', isCorrect: false },
      ],
      whyPrompt: 'Why does transmit power blind the receiver?',
      whyOptions: [
        { id: 'why-blind', text: 'Local transmission drowns out faint incoming signals from other stations sharing the channel.', isCorrect: true },
        { id: 'why-rev', text: 'Because radio waves reflect off office walls and invert their binary values.', isCorrect: false },
      ],
      revealedParts: ['vlan-access', 'vlan-trunk', 'wifi-csmaca', 'wifi-channels'],
    },
    {
      id: 'b7',
      kind: 'point',
      target: 'wifi-csmaca',
      text: '{{term:csma-ca}} forces stations to listen first and back off randomly to prevent airborne collisions.',
      revealedParts: ['vlan-access', 'vlan-trunk', 'wifi-csmaca', 'wifi-channels', 'ospf-dijkstra'],
    },
    {
      id: 'b8',
      kind: 'debrief',
      text: '802.1Q tags carry multiple VLANs across switches, while {{term:dijkstra-spf}} computes loop-free shortest paths.',
      revealedParts: ['vlan-access', 'vlan-trunk', 'wifi-csmaca', 'wifi-channels', 'ospf-dijkstra'],
    },
  ],
  ticketScene: {
    ticketId: 'TCK-116',
    title: 'Inter-VLAN Black Hole: Engineering Cannot Reach Server Trunk',
    symptom: 'Workstations on Port FastEthernet0/5 (VLAN 10) cannot reach the file server on Switch-B. Switch-to-switch trunk link is dropping frames for VLAN 10.',
    options: [
      { id: 'opt1', text: 'The physical fiber uplink has run out of light bandwidth.', isCorrect: false },
      { id: 'opt2', text: 'The trunk port allowed VLAN list is missing VLAN 10.', isCorrect: true },
      { id: 'opt3', text: 'VLAN 10 has exceeded the 32-bit subnet address limit.', isCorrect: false },
    ],
    repairActions: [
      { id: 'rep1', text: 'Change the access port patch cable to unshielded twisted pair.', isCorrect: false },
      {
        id: 'rep2',
        text: 'Update trunk port allowed VLANs with switchport trunk allowed vlan add 10.',
        isCorrect: true,
        patch: { action: 'add_vlan_to_trunk', target: 'Gi0/1', vlanId: 10 },
      },
      { id: 'rep3', text: 'Configure static ARP entries on every client workstation.', isCorrect: false },
    ],
  },
};

/**
 * net-16: VLANs, Wireless & Enterprise Routing
 * ─────────────────────────────────────────────────────────────────────────────
 * Milestone 7 — Concepts C48, C49, C50
 * Teaches enterprise infrastructure scaling: Virtual LANs (VLANs), IEEE 802.1Q
 * trunk tagging, Inter-VLAN routing, Wi-Fi 802.11 half-duplex radio mechanics,
 * non-overlapping channels (1, 6, 11), CSMA/CA collision avoidance, and
 * dynamic enterprise routing (OSPF link-state vs BGP path-vector).
 */

export const NET_16_MODULE: ModuleData = {
  id: 'net-16',
  slug: 'vlans-wireless-and-enterprise-routing',
  day: 16,
  title: 'Module 16: VLANs, Wireless & Enterprise Routing',
  shortTitle: 'VLANs, Wireless & Routing',
  type: 'module',
  track: 'networking',
  milestoneId: 'net-milestone-7',
  description:
    'Master advanced enterprise network architecture: partitioning switch broadcast domains with IEEE 802.1Q VLAN trunks, Wi-Fi half-duplex radio physics (CSMA/CA and channel planning), and dynamic routing protocol selection (OSPF vs BGP).',
  estimatedMinutes: 35,
  curriculumOrder: 16,
  displayLabel: 'Module 16',
  completionLearnings: [
    'A Virtual LAN (VLAN) segments a physical switch into multiple isolated broadcast domains; traffic cannot cross between VLANs without a Layer 3 router or multilayer switch',
    'Switch ports are configured as Access Ports (connected to single endpoints, untagged) or Trunk Ports (carrying multiple VLANs across switches tagged with a 4-byte IEEE 802.1Q header containing a 12-bit VLAN ID)',
    'Inter-VLAN routing is accomplished via Router-on-a-Stick (subinterfaces on a single physical link) or Switched Virtual Interfaces (SVIs) on a Layer 3 switch',
    'Wi-Fi (IEEE 802.11) is a shared, half-duplex RF medium; only one device can transmit on a radio channel at any instant',
    'The 2.4 GHz Wi-Fi band has only 3 non-overlapping 20 MHz channels in North America/Europe: 1, 6, and 11; overlapping channels cause co-channel interference and degraded throughput',
    'Because wireless radios cannot detect collisions while transmitting, Wi-Fi uses CSMA/CA (Collision Avoidance) with exponential backoff and optional RTS/CTS to solve the Hidden Node Problem',
    'Enterprise routing protocols automate table updates: OSPF (Link-State, Dijkstra SPF, Area 0) routes within an organization, while BGP (Path-Vector, Autonomous System numbers) routes across the global internet',
  ],
  concepts: [
    // ─────────────────────────────────────────────────────
    // Concept 1: VLANs & 802.1Q Trunk Tagging (C48)
    // ─────────────────────────────────────────────────────
    {
      id: 'net16-c1-vlans-trunking',
      order: 1,
      title: 'Virtual LANs (VLANs) & IEEE 802.1Q Trunk Tagging',
      shortDescription:
        'Understand logical network segmentation: separating departments on a shared switch, Access vs Trunk port roles, and 802.1Q tagging.',
      theory: {
        mentorScript: NET_16_MENTOR_SCRIPT,
        summary:
          'VLANs partition switches into isolated broadcast domains. Access ports carry untagged traffic for a single VLAN. Trunk ports carry multiple VLANs across switches using 4-byte IEEE 802.1Q tags with a 12-bit VLAN ID (VID 1–4094). Cross-VLAN traffic requires Layer 3 routing.',
        explanation: [
          '### Beat 1: Direct Physical Reality — The Flat Broadcast Domain Dilemma',
          'When hundreds of employee computers plug into a single physical switch topology without segmentation, they all share one flat **Layer 2 broadcast domain**.',
          'Every single ARP request, DHCP discover, and NetBIOS announcement floods out of every active switch port. As the network scales past 200 devices, constant broadcast chatter interrupts NIC controllers and consumes CPU cycles on every workstation.',
          'Furthermore, flat networks lack security boundaries: an intern in Marketing running Wireshark can capture unencrypted payroll packets or database credentials transmitted by the Finance department across the hall.',
          '',
          '### Beat 2: The Core Mechanism — IEEE 802.1Q Trunk Tagging & Port Roles',
          'Virtual LANs (VLANs, IEEE 802.1Q) solve both scalability and security by partitioning a physical switch into multiple isolated logical switches:',
          '1. **Access Ports (Untagged)**: Switch ports connected to end-user workstations, printers, or IP phones. The switch assigns the port a specific VLAN ID (e.g. VLAN 10). When the PC sends a standard Ethernet frame, the switch accepts it and guarantees it will only be delivered to other ports in VLAN 10. The frame exiting an access port is **never tagged**—endpoint network cards do not see 802.1Q headers.',
          '2. **Trunk Ports (Tagged)**: High-speed uplinks connecting switches together or connecting a switch to a router. A trunk carries frames for dozens of different VLANs simultaneously across a single physical cable.',
          '3. **The 4-Byte IEEE 802.1Q Header**: To distinguish which VLAN a frame belongs to across a trunk link, the transmitting switch inserts a 4-byte tag between the Source MAC and EtherType fields:',
          '   - **TPID (Tag Protocol Identifier)**: Set to `0x8100` to indicate an 802.1Q tagged frame.',
          '   - **TCI (Tag Control Information)**: Contains 3-bit Priority Code Point (PCP for QoS), 1-bit Drop Eligible Indicator (DEI), and a **12-bit VLAN Identifier (VID)** supporting $2^{12} - 2 = 4,094$ distinct VLANs.',
          '4. **Inter-VLAN Routing**: Because VLANs enforce absolute Layer 2 isolation, traffic cannot cross from VLAN 10 to VLAN 20 without a Layer 3 routing process (a **Router-on-a-Stick** with subinterfaces like `Gi0/0.10`, or a Layer 3 switch with Switched Virtual Interfaces / SVIs).',
          '',
          '### Beat 3: Failure Modes & Workplace Diagnostics (Ticket #116)',
          'VLAN misconfigurations cause silent connectivity blackouts during campus switch deployments:',
          '- **Access Port VLAN Mismatch**: Workstation is plugged into an access port assigned to VLAN 20, but the host is statically configured for the VLAN 10 subnet, preventing default gateway reachability.',
          '- **Trunk Pruning / Allowed List Omission**: An administrator forgets to add `allowed vlan add 30` to the trunk link, dropping cross-switch engineering traffic.',
          '- **Dual-Platform Diagnostics**: Inspect VLAN assignments with Cisco IOS (`show vlan brief`, `show interfaces trunk`) or Linux bridging (`bridge vlan show`, `ip link add link eth0 name eth0.10 type vlan id 10`).',
        ],
        keyTakeaway:
          'Access ports connect to endpoints untagged. Trunk ports insert 4-byte 802.1Q tags to multiplex VLANs across switches.',
        exampleQuery: '',
        exampleQueryExplanation: '',
        mcqs: [
          {
            id: 'net16-mcq-trunk-tagging',
            question:
              'What modification does an enterprise switch make to an Ethernet frame before transmitting it across an IEEE 802.1Q trunk link?',
            options: [
              'It encrypts the payload using AES-256',
              'It inserts a 4-byte 802.1Q tag containing TPID 0x8100 and the 12-bit VLAN ID',
              'It rewrites the source MAC address to FF:FF:FF:FF:FF:FF',
              'It compresses the frame into an ICMP Echo packet',
            ],
            correctIndex: 1,
            explanation:
              'IEEE 802.1Q inserts a 4-byte tag into the Ethernet header on trunk links so receiving switches know which logical broadcast domain the frame belongs to.',
          },
          {
            id: 'net16-mcq-inter-vlan',
            question:
              'Can a computer on VLAN 10 directly communicate with a server on VLAN 20 plugged into the same physical switch without Layer 3 routing?',
            options: [
              'Yes, if both computers use the same DNS server',
              'No; VLANs create completely isolated Layer 2 broadcast domains, and communication between different VLANs strictly requires a Layer 3 router or Layer 3 switch',
              'Yes, by sending a broadcast ARP frame',
              'Yes, if the physical switch is powered by PoE',
            ],
            correctIndex: 1,
            explanation:
              'VLANs enforce Layer 2 separation. Even on the same physical switch hardware, frames cannot cross between different VLAN IDs without a Layer 3 routing process.',
          },
        ],
      },
      tasks: [
        {
          id: 'net16-p1-vlan-tagging',
          title: 'Practice: Analyzing Access vs Trunk Ports & 802.1Q Tags',
          description:
            'Determine when Ethernet frames carry 802.1Q tags and evaluate cross-VLAN communication rules.',
          instructions: [
            'PC 1 on Switch A (VLAN 10) sends a packet to PC 2 on Switch B (VLAN 10) across an inter-switch trunk link.',
            'Answer the judgment questions on 802.1Q tagging behavior and port classifications.',
            'Use the workplace diagnostic terminal to inspect switch trunk states and Linux subinterface VLAN bindings.',
          ],
          type: 'guided',
          primaryTable: '',
          initialSql: '',
          solutionSql: 'NETWORKING_JUDGMENT_TASK',
          solutionExplanation:
            'Access ports send untagged frames to endpoints. Trunk ports add a 4-byte 802.1Q tag when crossing between switches to identify the VLAN ID.',
          hints: [
            {
              level: 1,
              text: 'End user devices (PCs) do not understand 802.1Q tags; access ports strip the tag before delivery.',
            },
            {
              level: 2,
              text: 'The 802.1Q tag is inserted on trunk links between switches.',
            },
          ],
          terminal: {
            title: 'Workplace Diagnostic Terminal — Ticket #116 (Dual Platform)',
            description:
              'Audit switch VLAN memberships and trunk allowed lists on Cisco IOS and Linux bridge interfaces.',
            prompt: 'admin@dist-switch:~$',
            initialOutput: [
              '====================================================================',
              '  WORKPLACE TICKET #116: VLAN SEGMENTATION & TRUNK AUDIT',
              '====================================================================',
              'Inspecting VLAN assignments, 802.1Q trunk allowed lists, and subinterfaces.',
              'Supported commands:',
              '  - Cisco IOS: show vlan brief',
              '               show interfaces trunk',
              '  - Linux:     bridge vlan show',
              '               ip link add link eth0 name eth0.10 type vlan id 10',
              '               ip addr show eth0.10',
            ].join('\n'),
            availableCommands: [
              'show vlan brief',
              'show interfaces trunk',
              'bridge vlan show',
              'ip link add link eth0 name eth0.10 type vlan id 10',
              'ip addr show eth0.10',
            ],
            commands: {
              'show vlan brief': `VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active    Gi0/4, Gi0/5
10   Engineering                      active    Gi0/1, Gi0/2
20   Finance                          active    Gi0/3
30   Management                       active    
1002 fddi-default                     act/unsup 
1003 token-ring-default               act/unsup`,
              'show interfaces trunk': `Port        Mode             Encapsulation  Status        Native vlan
Gi0/24      on               802.1q         trunking      1

Port        Vlans allowed on trunk
Gi0/24      1-4094

Port        Vlans allowed and active in management domain
Gi0/24      1,10,20,30

Port        Vlans in spanning tree forwarding state and not pruned
Gi0/24      1,10,20,30`,
              'bridge vlan show': `port              vlan-id
eth0              1 PVID Egress Untagged
                  10
                  20
eth1              10 PVID Egress Untagged
eth2              20 PVID Egress Untagged`,
              'ip link add link eth0 name eth0.10 type vlan id 10': `[OK] Created VLAN subinterface eth0.10 with 802.1Q tag 10 on parent eth0.`,
              'ip addr show eth0.10': `3: eth0.10@eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UP group default
    link/ether 00:1a:2b:3c:4d:01 brd ff:ff:ff:ff:ff:ff
    inet 192.168.10.1/24 brd 192.168.10.255 scope global eth0.10
       valid_lft forever preferred_lft forever`,
            },
            commandResponses: {
              'show vlan brief': `VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active    Gi0/4, Gi0/5
10   Engineering                      active    Gi0/1, Gi0/2
20   Finance                          active    Gi0/3
30   Management                       active`,
              'show interfaces trunk': `Port        Mode             Encapsulation  Status        Native vlan
Gi0/24      on               802.1q         trunking      1

Port        Vlans allowed on trunk
Gi0/24      1-4094`,
              'bridge vlan show': `port              vlan-id
eth0              1 PVID Egress Untagged
                  10
                  20`,
              'ip link add link eth0 name eth0.10 type vlan id 10': `[OK] Created VLAN subinterface eth0.10 with 802.1Q tag 10 on parent eth0.`,
              'ip addr show eth0.10': `3: eth0.10@eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UP group default
    inet 192.168.10.1/24 brd 192.168.10.255 scope global eth0.10`,
            },
          },
          validation: {
            judgment: [
              {
                kind: 'choose-and-defend',
                prompt:
                  'What occurs to an Ethernet frame as it traverses a trunk link between two enterprise switches carrying traffic for VLAN 20?',
                options: [
                  'The transmitting switch inserts a 4-byte IEEE 802.1Q tag into the frame containing VLAN ID 20, and the receiving switch reads the tag and strips it before forwarding to the destination access port',
                  'The switch converts the frame into an encrypted IPsec tunnel',
                  'The frame payload is compressed by 50%',
                  'The frame source IP is rewritten to 0.0.0.0',
                ],
                correctIndex: 0,
                explanation:
                  'IEEE 802.1Q adds a 4-byte tag on trunk links so the receiving switch knows which VLAN the frame belongs to. Access ports strip this tag before sending to normal endpoint devices.',
              },
              {
                kind: 'choose-and-defend',
                prompt:
                  'Can a host on VLAN 10 directly communicate with a host on VLAN 20 plugged into the same physical switch without involving a router or Layer 3 switch?',
                options: [
                  'Yes, if they use the same subnet mask',
                  'No; VLANs create completely isolated Layer 2 broadcast domains, and communication between different VLANs strictly requires a Layer 3 routing process',
                  'Yes, by broadcasting an ARP request with destination MAC FF:FF:FF:FF:FF:FF',
                  'Yes, if both computers run Windows 11',
                ],
                correctIndex: 1,
                explanation:
                  'VLANs enforce Layer 2 separation. Even on the same physical switch, traffic cannot cross from one VLAN to another without a Layer 3 routing device acting as a default gateway.',
              },
            ],
          },
          successMessage:
            'Spot on! Access ports connect to endpoints untagged, trunk links tag frames with 802.1Q, and inter-VLAN traffic requires Layer 3 routing.',
          vlanDijkstra: {
            title: '802.1Q VLAN Tagging & Trunk Port Simulator',
            description:
              'Simulate 4-byte 802.1Q header insertion (TPID 0x8100, 12-bit VID) and access vs trunk port tag-stripping behavior.',
            defaultTab: 'vlan_trunking',
            vlans: [
              { id: 10, name: 'Engineering', color: '#38bdf8' },
              { id: 20, name: 'Finance', color: '#34d399' },
              { id: 30, name: 'Guest / DMZ', color: '#f87171' },
            ],
            trunkPorts: [
              {
                portName: 'Gi0/1',
                mode: 'trunk',
                allowedVlans: [10, 20],
                nativeVlan: 1,
              },
            ],
          },
        },
      ],
    },

    // ─────────────────────────────────────────────────────
    // Concept 2: Wireless (Wi-Fi 802.11) Foundations (C49)
    // ─────────────────────────────────────────────────────
    {
      id: 'net16-c2-wifi-foundations',
      order: 2,
      title: 'Wireless Networking (Wi-Fi 802.11) & CSMA/CA',
      shortDescription:
        'Explore the physics and protocol rules of Wi-Fi: half-duplex RF medium, 2.4 GHz vs 5 GHz channels, and CSMA/CA collision avoidance.',
      theory: {
        summary:
          'Wi-Fi operates on an unguided, half-duplex RF radio medium. In 2.4 GHz, 20 MHz wide channels are spaced just 5 MHz apart, meaning adjacent channels overlap destructively; only channels 1, 6, and 11 provide spectral isolation. Because a transmitter\'s own RF signal obliterates its receiver, radios cannot detect collisions on the air (CSMA/CD is physically impossible) and must use CSMA/CA with random backoff and Layer 2 ACKs.',
        explanation: [
          '### Beat 1: The Physical Cause — Half-Duplex RF Medium & Overlapping Channels',
          'Unlike full-duplex twisted pair copper cables where separate wire pairs handle transmit (Tx) and receive (Rx) simultaneously, Wi-Fi operates in open unguided RF space on shared frequencies (2.4 GHz and 5 GHz). In the 2.4 GHz ISM band, the spectrum ranges from 2.401 GHz to 2.473 GHz. Each standard Wi-Fi channel is 20 MHz wide (or 22 MHz in 802.11b), but channel center frequencies are spaced a mere 5 MHz apart (Channel 1 is 2412 MHz, Channel 2 is 2417 MHz, etc.). This geometric reality means adjacent channels overlap extensively. Only channels 1 (2412 MHz), 6 (2437 MHz), and 11 (2462 MHz) have 25 MHz center-to-center spacing, providing zero spectral overlap in North American regulatory domains.',
          '',
          '### Beat 2: The Wire / System Consequence — Transmit Overwhelm & CSMA/CA Backoff',
          'When an 802.11 transceiver energizes its antenna to broadcast RF waveforms, the local transmit power (typically +15 to +20 dBm) completely saturates and deafens its own internal receiver circuitry compared to incoming signals from distant stations (which arrive attenuated at -60 to -85 dBm). Consequently, a wireless station cannot physically listen while talking: Ethernet\'s wired Collision Detection (CSMA/CD) is fundamentally impossible over radio waves. If two Wi-Fi stations transmit simultaneously on overlapping frequencies, their RF waveforms collide constructively and destructively in the air, corrupting both frames at the receiving access point. To avoid catastrophic packet loss, 802.11 implements Carrier Sense Multiple Access with Collision Avoidance (CSMA/CA). Stations listen before transmitting (Clear Channel Assessment / Physical Carrier Sense) and examine the Network Allocation Vector (Virtual Carrier Sense). If the medium is busy, stations defer transmission and execute a randomized binary exponential backoff timer. Furthermore, because collisions cannot be detected during transmission, every unicast frame requires an explicit Layer 2 acknowledgment (ACK) frame from the receiver; missing ACKs trigger retransmissions.',
          '',
          '### Beat 3: The Diagnostic / Operational Fix — Spectrum Planning & Dual-Band Offload',
          'In enterprise deployments, adjacent access points must be engineered onto non-overlapping channels (1, 6, 11 in 2.4 GHz) with careful RF power tuning to prevent co-channel interference (CCI) and adjacent-channel interference (ACI). Furthermore, high-density networks migrate voice, video, and corporate traffic to the 5 GHz (UNII-1, UNII-2, UNII-3) and 6 GHz (Wi-Fi 6E) bands, where dozens of non-overlapping 20 MHz or bonded 40/80 MHz channels are available, dramatically reducing channel contention domains and eliminating 2.4 GHz congestion.',
        ],
        keyTakeaway:
          'Wi-Fi is a shared half-duplex radio medium. Radios cannot detect collisions while transmitting and must use CSMA/CA with backoff and Layer 2 ACKs. In 2.4 GHz, always deploy non-overlapping channels 1, 6, and 11.',
        exampleQuery: '',
        exampleQueryExplanation: '',
        mcqs: [
          {
            id: 'net16-mcq-wifi-channels',
            question:
              'In the 2.4 GHz Wi-Fi spectrum, why are channels 1, 6, and 11 universally standard for multi-access-point enterprise deployments?',
            options: [
              'They are the only channels licensed by the FCC for commercial networking',
              'Because channels are 20 MHz wide with centers spaced 5 MHz apart, channels 1, 6, and 11 provide the necessary 25 MHz separation to prevent destructive spectral overlap',
              'Channels 1, 6, and 11 utilize laser signals instead of radio frequency waves',
              'Those channels automatically disable encryption to boost throughput',
            ],
            correctIndex: 1,
            correctAnswerIndex: 1,
            explanation:
              'Each 2.4 GHz channel occupies 20 MHz of bandwidth, but channel numbers are separated by only 5 MHz. Only channels 1 (2412 MHz), 6 (2437 MHz), and 11 (2462 MHz) have 25 MHz separation, allowing adjacent APs to transmit simultaneously without interfering.',
          },
          {
            id: 'net16-mcq-csmaca',
            question:
              'Why does 802.11 Wi-Fi rely on CSMA/CA (Collision Avoidance) rather than 802.3 Ethernet\'s CSMA/CD (Collision Detection)?',
            options: [
              'Wi-Fi frames lack source and destination MAC addresses',
              'Wi-Fi routers lack hardware processors capable of calculating frame checksums',
              'A transmitting radio\'s high local power overwhelms its own receiver, making it physically impossible to detect a simultaneous incoming collision on the shared RF medium',
              'Collision detection is strictly prohibited by IEEE 802 wireless regulatory standards',
            ],
            correctIndex: 2,
            correctAnswerIndex: 2,
            explanation:
              'Because a radio transmitter emits power thousands of times greater than the incoming faint signal from a remote station, it cannot detect collisions while transmitting. Therefore, stations must avoid collisions using carrier sensing, random backoff timers, and explicit Layer 2 ACKs.',
          },
        ],
      },
      tasks: [
        {
          id: 'net16-p2-wifi-channels-csmaca',
          title: 'Practice: Evaluating Wi-Fi Channel Planning & CSMA/CA',
          description:
            'Plan 2.4 GHz channel distributions to prevent interference and explain collision avoidance mechanics.',
          instructions: [
            'An enterprise installs 3 Wi-Fi access points in an open-plan office.',
            'Answer the judgment questions on channel selections and wireless collision protocols.',
          ],
          type: 'guided',
          primaryTable: '',
          initialSql: '',
          solutionSql: 'NETWORKING_JUDGMENT_TASK',
          solutionExplanation:
            'The three non-overlapping channels in 2.4 GHz are 1, 6, and 11. Wi-Fi uses CSMA/CA because radios cannot detect collisions while transmitting.',
          hints: [
            {
              level: 1,
              text: 'Channels must be separated by at least 25 MHz to avoid overlap in 2.4 GHz.',
            },
            {
              level: 2,
              text: 'Collision Avoidance (CA) uses random backoff and positive ACKs because Collision Detection (CD) is physically impossible on RF.',
            },
          ],
          validation: {
            judgment: [
              {
                kind: 'choose-and-defend',
                prompt:
                  'Which set of 2.4 GHz Wi-Fi channels are non-overlapping and recommended for multi-AP office deployments?',
                options: [
                  'Channels 1, 2, and 3',
                  'Channels 1, 6, and 11',
                  'Channels 2, 7, and 12',
                  'Channels 5, 10, and 15',
                ],
                correctIndex: 1,
                explanation:
                  'Because each channel is 20 MHz wide and channel centers are spaced 5 MHz apart, channels 1, 6, and 11 form the common 3-channel non-overlapping plan in North America (and Europe), providing 25 MHz separation between center frequencies.',
              },
              {
                kind: 'choose-and-defend',
                prompt:
                  'Why does Wi-Fi (802.11) use CSMA/CA (Collision Avoidance) instead of wired Ethernet\'s CSMA/CD (Collision Detection)?',
                options: [
                  'Because wireless routers do not have CPU processors',
                  'Because a wireless radio\'s outgoing signal overwhelms its own receiver, making it physically impossible to detect a simultaneous incoming collision while transmitting',
                  'Because Wi-Fi does not use MAC addresses',
                  'Because 802.11 frames are smaller than Ethernet frames',
                ],
                correctIndex: 1,
                explanation:
                  'Radio signal attenuation makes self-detection of collisions impossible during transmission. Radios must avoid collisions proactively using Carrier Sense, random backoff, and explicit Layer 2 ACKs.',
              },
            ],
          },
          successMessage:
            'Correct! Channels 1, 6, and 11 prevent 2.4 GHz co-channel interference, and CSMA/CA governs half-duplex RF transmission.',
          vlanDijkstra: {
            title: '2.4 GHz RF Spectrum & CSMA/CA Backoff Simulator',
            description:
              'Explore 20 MHz channel spacing, calculate RF overlap between channels, and observe binary exponential backoff.',
            defaultTab: 'wifi_spectrum',
            accessPoints: [
              { apId: 'ap-1', apName: 'AP-1 (North Wing)', channel: 1 },
              { apId: 'ap-2', apName: 'AP-2 (South Wing)', channel: 6 },
            ],
          },
        },
      ],
    },

    // ─────────────────────────────────────────────────────
    // Concept 3: Enterprise Dynamic Routing (OSPF & BGP) (C50)
    // ─────────────────────────────────────────────────────
    {
      id: 'net16-c3-enterprise-routing',
      order: 3,
      title: 'Enterprise Dynamic Routing: OSPF vs BGP',
      shortDescription:
        'Contrast Interior Gateway Protocols (OSPF) with Exterior Gateway Protocols (BGP), understand link-state Dijkstra algorithms and autonomous systems.',
      theory: {
        summary:
          'Dynamic routing protocols automatically construct and update routing tables as physical link states fluctuate. OSPF is an interior link-state protocol that floods Link-State Advertisements (LSAs) and runs Dijkstra\'s Shortest Path First (SPF) algorithm to calculate loop-free lowest-cost paths within an autonomous domain. BGP is the exterior path-vector protocol that glues the global internet together, exchanging network prefixes and AS-Path attributes between distinct Autonomous Systems based on commercial transit and peering policies.',
        explanation: [
          '### Beat 1: The Physical Cause — Link Degradation, Scale & Autonomous Boundaries',
          'Physical network topologies are dynamic: underground fiber cuts occur, undersea cables suffer pressure damage, transceivers burn out, and interface bandwidths vary from 1 Gbps access links to 100 Gbps core backbones. Furthermore, no single organization owns or manages the entire worldwide internet; the global network is segmented into thousands of independently administered domains known as Autonomous Systems (ASNs), each governed by its own commercial peering agreements, transit fees, and administrative policies.',
          '',
          '### Beat 2: The Wire / System Consequence — Link-State Dijkstra vs Path-Vector Attributes',
          'Within an enterprise, manual static routing fails because it cannot detect remote physical outages or dynamically route around congested links. OSPF (Open Shortest Path First) solves internal routing by forming neighbor adjacencies via Hello packets, synchronizing a comprehensive Link-State Database (LSDB) across the area, and executing Dijkstra\'s algorithm to compute the shortest path tree rooted at itself. The OSPF metric is path Cost, a dimensionless integer calculated as Cost = Reference Bandwidth / Interface Bandwidth (e.g. 100 Mbps / 10 Gbps = 1), ensuring high-capacity links are strictly preferred. However, flooding complete link-state topologies does not scale to millions of internet routers and ignores business agreements. For inter-domain routing, BGP (Border Gateway Protocol) operates as a path-vector protocol over reliable TCP port 179 sessions. Instead of raw link speeds, BGP advertises IP prefixes adorned with rich Path Attributes, foremost among them the AS_PATH list. As an update traverses each Autonomous System, the exporting border router prepends its own ASN to the AS_PATH. If a router receives an update containing its own ASN in the AS_PATH, it immediately drops the route, mathematically preventing inter-domain routing loops across the globe.',
          '',
          '### Beat 3: The Diagnostic / Operational Fix — Tiered Hierarchy & Route Filtering',
          'Enterprise networks deploy a two-tiered routing architecture: OSPF acts as the Interior Gateway Protocol (IGP) in Area 0 (Backbone) to provide lightning-fast, millisecond reconvergence over internal redundant fiber meshes. At the campus or datacenter edge, border routers run Exterior BGP (eBGP) with upstream transit ISPs, advertising provider-independent IP allocations, enforcing inbound/outbound route-maps, and filtering bogus prefix advertisements to maintain deterministic global reachability.',
        ],
        keyTakeaway:
          'OSPF routes internally within an organization using Dijkstra SPF based on link cost; BGP routes externally across the global internet between Autonomous Systems using AS_PATH and policy attributes.',
        exampleQuery: '',
        exampleQueryExplanation: '',
        mcqs: [
          {
            id: 'net16-mcq-ospf-dijkstra',
            question:
              'How does OSPF calculate the optimal route to a destination subnet, and what metric does it use by default?',
            options: [
              'It counts the number of router hops and picks the route with fewer than 15 hops',
              'It floods link-state advertisements (LSAs), builds a synchronized topology database, and runs Dijkstra\'s Shortest Path First algorithm using link cost (inversely proportional to bandwidth)',
              'It queries a central DNS server for the fastest IP route',
              'It selects paths randomly to achieve equal load balancing across all physical interfaces',
            ],
            correctIndex: 1,
            correctAnswerIndex: 1,
            explanation:
              'OSPF is a link-state IGP. Every router in an OSPF area maintains an identical Link-State Database (LSDB) and computes the shortest loop-free tree to all destinations using Dijkstra\'s SPF algorithm, where link cost is calculated from interface bandwidth (Reference Bandwidth / Interface Bandwidth).',
          },
          {
            id: 'net16-mcq-bgp-aspath',
            question:
              'In Border Gateway Protocol (BGP), what is the primary role of the AS_PATH attribute?',
            options: [
              'To measure physical cable length in kilometers between routers',
              'To encrypt packet payloads crossing public internet backbones',
              'To list the sequence of Autonomous System Numbers (ASNs) a prefix has traversed, enabling policy-based path selection and preventing routing loops',
              'To assign private RFC 1918 IP addresses to customer endpoints',
            ],
            correctIndex: 2,
            correctAnswerIndex: 2,
            explanation:
              'BGP is a path-vector protocol. As an update crosses AS boundaries, each AS prepends its ASN to the AS_PATH. Routers use this attribute to choose the shortest AS-level path and reject any route that already contains their own ASN, preventing inter-domain loops.',
          },
        ],
      },
      tasks: [
        {
          id: 'net16-p3-routing-protocols',
          title: 'Practice: Selecting Routing Protocols (OSPF vs BGP)',
          description:
            'Evaluate protocol requirements and match network topologies to OSPF or BGP.',
          instructions: [
            'An IT director reviews architecture proposals for an enterprise internal campus and an external multi-homed ISP connection.',
            'Answer the judgment questions on routing protocol characteristics and domains.',
          ],
          type: 'guided',
          primaryTable: '',
          initialSql: '',
          solutionSql: 'NETWORKING_JUDGMENT_TASK',
          solutionExplanation:
            'OSPF is an Interior Gateway Protocol using Dijkstra SPF within an organization. BGP is an Exterior Gateway Protocol routing between Autonomous Systems on the global internet.',
          hints: [
            {
              level: 1,
              text: 'OSPF operates inside an organization using link-state metrics.',
            },
            {
              level: 2,
              text: 'BGP connects Autonomous Systems across the internet.',
            },
          ],
          validation: {
            judgment: [
              {
                kind: 'choose-and-defend',
                prompt:
                  'Which routing protocol is the standard Interior Gateway Protocol (IGP) used to calculate shortest paths based on lowest total cost inside an enterprise corporate network?',
                options: [
                  'Border Gateway Protocol (BGP)',
                  'Open Shortest Path First (OSPF)',
                  'Address Resolution Protocol (ARP)',
                  'Dynamic Host Configuration Protocol (DHCP)',
                ],
                correctIndex: 1,
                explanation:
                  'OSPF is an open-standard link-state IGP that uses Dijkstra\'s Shortest Path First algorithm to calculate optimal forwarding paths based on lowest total path cost within an enterprise network.',
              },
              {
                kind: 'choose-and-defend',
                prompt:
                  'When an enterprise connects to two different internet service providers (multi-homing) and advertises its own public IP prefix to the global internet, which routing protocol must it run?',
                options: [
                  'Border Gateway Protocol (BGP)',
                  'Spanning Tree Protocol (STP)',
                  'RIP version 1',
                  'ICMP Router Discovery',
                ],
                correctIndex: 0,
                explanation:
                  'BGP is the only Exterior Gateway Protocol that exchanges routing and reachability information among Autonomous Systems (ASNs) across the public internet.',
              },
            ],
          },
          successMessage:
            'Mastered! You understand OSPF for high-speed internal link-state routing and BGP for inter-AS global internet path routing.',
          vlanDijkstra: {
            title: 'OSPF Link-State Dijkstra Shortest Path Lab',
            description:
              'Step through Dijkstra SPF algorithm execution, compute cumulative path costs, and inspect loop-free routing tables.',
            defaultTab: 'ospf_dijkstra',
            referenceBandwidthMbps: 100,
            sourceRouter: 'R1',
          },
        },
      ],
    },
  ],

  challenge: {
    id: 'net16-challenge',
    title: 'Module 16 Challenge: Enterprise Infrastructure & Wireless Architecture',
    scenario:
      'Audit enterprise campus infrastructure: resolve cross-switch 802.1Q VLAN trunk isolation and eliminate adjacent-channel wireless RF interference.',
    tasks: [
      {
        id: 'net16-ch1-intervlan-trunk-diagnosis',
        title: 'Challenge 1: Troubleshooting Inter-VLAN Trunking Failures',
        description:
          'Diagnose an inter-switch trunk misconfiguration where users in VLAN 30 cannot communicate across switches.',
        instructions: [
          'Switch A and Switch B are connected via a trunk link on GigabitEthernet 0/1.',
          'Switch A trunk configuration: `switchport trunk allowed vlan 10,20`.',
          'Switch B trunk configuration: `switchport trunk allowed vlan 10,20,30`.',
          'Users in VLAN 30 on Switch B report they cannot reach any servers in VLAN 30 on Switch A.',
          'Identify the misconfiguration.',
        ],
        type: 'challenge',
        primaryTable: '',
        initialSql: '',
        solutionSql: 'NETWORKING_JUDGMENT_TASK',
        solutionExplanation:
          'Switch A has pruned VLAN 30 from its allowed trunk list. Adding VLAN 30 to Switch A allows 802.1Q tagged frames for VLAN 30 to traverse the link.',
        hints: [
          {
            level: 1,
            text: 'Trunk ports only forward frames for VLANs included in their allowed VLAN list.',
          },
          {
            level: 2,
            text: 'Notice that Switch A only lists VLAN 10 and 20.',
          },
        ],
        validation: {
          judgment: [
            {
              kind: 'choose-and-defend',
              prompt:
                'Why can VLAN 30 traffic not cross between Switch A and Switch B?',
              options: [
                'VLAN 30 is reserved by the IEEE and cannot be routed',
                'Switch A\'s trunk port allowed VLAN list is configured for only VLAN 10 and 20, causing Switch A to drop all incoming and outgoing frames tagged with VLAN 30',
                'The cable speed is too low for three VLANs',
                'VLAN 30 must use Wi-Fi instead of Ethernet',
              ],
              correctIndex: 1,
              explanation:
                'Trunk ports discard frames for any VLAN not explicitly allowed in their trunk allowed list. Since Switch A only permits VLANs 10 and 20, VLAN 30 frames are filtered.',
            },
          ],
        },
        successMessage:
          'Challenge 1 mastered! You identified trunk allowed VLAN list mismatch as the root cause of cross-switch VLAN isolation.',
        vlanDijkstra: {
          title: 'Trunk Allowed VLAN Diagnosis Lab',
          description:
            'Inspect Switch A trunk port Gi0/1 where VLAN 30 is pruned from the allowed list, causing tagged frame drops.',
          defaultTab: 'vlan_trunking',
          trunkPorts: [
            {
              portName: 'Gi0/1',
              mode: 'trunk',
              allowedVlans: [10, 20],
              nativeVlan: 1,
            },
          ],
        },
      },
      {
        id: 'net16-ch2-wifi-channel-planning',
        title: 'Challenge 2: Enterprise High-Density Wi-Fi Channel Layout',
        description:
          'Audit a floor plan with adjacent Access Points causing co-channel interference.',
        instructions: [
          'An office has two adjacent Wi-Fi APs in the same large open room, both set to 2.4 GHz.',
          'AP-1 is configured on Channel 6.',
          'AP-2 is configured on Channel 7.',
          'Users report constant packet loss, jitter, and dropped video calls.',
          'What is the cause and recommended configuration?',
        ],
        type: 'challenge',
        primaryTable: '',
        initialSql: '',
        solutionSql: 'NETWORKING_JUDGMENT_TASK',
        solutionExplanation:
          'Channel 7 overlaps directly with Channel 6, causing destructive co-channel RF interference. Changing AP-2 to Channel 1 or Channel 11 provides a non-overlapping channel.',
        hints: [
          {
            level: 1,
            text: 'Channel 7 is separated from Channel 6 by only 5 MHz, but Wi-Fi channels are 20 MHz wide.',
          },
          {
            level: 2,
            text: 'Non-overlapping channels in 2.4 GHz are 1, 6, and 11.',
          },
        ],
        validation: {
          judgment: [
            {
              kind: 'choose-and-defend',
              prompt:
                'Why does configuring adjacent APs on Channel 6 and Channel 7 cause severe packet loss, and how is it corrected?',
              options: [
                'Channel 7 is restricted to military use; changing to Channel 8 fixes it',
                'Because 2.4 GHz channels are 20 MHz wide and spaced 5 MHz apart, Channel 7 overlaps heavily with Channel 6, creating severe RF interference; reconfiguring AP-2 to non-overlapping Channel 1 or 11 eliminates the interference',
                'The APs need to be connected via fiber optic cables',
                'Users must disable DHCP on their wireless cards',
              ],
              correctIndex: 1,
              explanation:
                'Adjacent overlapping channels (like 6 and 7) transmit on the exact same frequencies, corrupting each other\'s transmissions. Using 1, 6, and 11 ensures 25 MHz separation with zero spectral overlap.',
            },
          ],
        },
        successMessage:
          'Challenge 2 cleared! You diagnosed 2.4 GHz co-channel interference and applied professional 802.11 channel design.',
        vlanDijkstra: {
          title: 'High-Density Wi-Fi Interference Audit',
          description:
            'Analyze destructive adjacent-channel overlap between Channel 6 and Channel 7, and reconfigure to non-overlapping Channel 1 or 11.',
          defaultTab: 'wifi_spectrum',
          accessPoints: [
            { apId: 'ap-floor1', apName: 'AP-Conference', channel: 6 },
            { apId: 'ap-floor2', apName: 'AP-OpenOffice', channel: 7 },
          ],
        },
      },
    ],
  },
};
