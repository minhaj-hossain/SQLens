import { ModuleData } from '../../../types/curriculum';

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
        summary:
          'VLANs partition switches into isolated broadcast domains. Access ports carry untagged traffic for a single VLAN. Trunk ports carry multiple VLANs across switches using 4-byte IEEE 802.1Q tags with a 12-bit VLAN ID (VID 1–4094). Cross-VLAN traffic requires Layer 3 routing.',
        explanation: [
          '### Logical Broadcast Segmentation',
          'VLANs split a switch into logical isolated switches. Broadcasts on VLAN 10 never reach VLAN 20.',
          '',
          '### Access vs Trunk Ports (IEEE 802.1Q)',
          '- **Access Port**: Single VLAN, untagged for endpoint devices.',
          '- **Trunk Port**: Multiple VLANs, tagged with 4-byte 802.1Q header across switch interconnects.',
          '',
          '### Inter-VLAN Routing',
          'Because VLANs are separate Layer 2 domains, communicating between them requires a Layer 3 router (Router-on-a-Stick) or Layer 3 switch SVI.',
        ],
        keyTakeaway:
          'Access ports connect to endpoints untagged. Trunk ports insert 4-byte 802.1Q tags to multiplex VLANs across switches.',
        exampleQuery: '',
        exampleQueryExplanation: '',
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
          'Wi-Fi operates on a shared half-duplex radio medium. In 2.4 GHz, channels are 20 MHz wide with only 3 non-overlapping choices: 1, 6, and 11. Because radios cannot detect collisions while transmitting, Wi-Fi uses CSMA/CA with random backoff and Layer 2 ACKs.',
        explanation: [
          '### Half-Duplex Radio Physics',
          'Only one radio can transmit on a channel at a time. Colliding transmissions destroy frames.',
          '',
          '### 2.4 GHz Channels: 1, 6, 11',
          'Spacing is only 5 MHz, so adjacent channels overlap. Channels 1, 6, and 11 provide complete spectral isolation.',
          '',
          '### CSMA/CA vs CSMA/CD',
          'Wired Ethernet uses Collision Detection (CD). Radios cannot detect incoming collisions during transmission and must use Collision Avoidance (CA) with random backoff and RTS/CTS.',
        ],
        keyTakeaway:
          'Wi-Fi is a shared half-duplex medium. Use non-overlapping channels (1, 6, 11 in 2.4 GHz) and CSMA/CA to minimize collision loss.',
        exampleQuery: '',
        exampleQueryExplanation: '',
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
          'Dynamic routing automates path calculation during network topology changes. OSPF is an Interior Gateway Protocol (IGP) running Dijkstra SPF on link-state databases within an enterprise. BGP is an Exterior Gateway Protocol (EGP) exchanging path-vector reachability between Autonomous Systems (ASNs) across the global internet.',
        explanation: [
          '### Dynamic Routing Automation',
          'Dynamic protocols adapt to link failures in milliseconds without manual intervention.',
          '',
          '### OSPF (Interior Gateway Protocol)',
          'Link-state protocol using Dijkstra Shortest Path First. The OSPF metric is path Cost (a dimensionless integer derived from interface bandwidth by default, where Cost = Reference Bandwidth / Interface Bandwidth). Organized into Areas with Backbone Area 0.',
          '',
          '### BGP (Exterior Gateway Protocol)',
          'Path-vector protocol connecting Autonomous Systems across the internet based on business policies and AS_PATH.',
        ],
        keyTakeaway:
          'OSPF routes internally within an organization using Dijkstra SPF; BGP routes externally across the global internet between Autonomous Systems.',
        exampleQuery: '',
        exampleQueryExplanation: '',
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
