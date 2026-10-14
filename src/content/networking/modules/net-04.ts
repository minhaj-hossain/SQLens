import { ModuleData } from '../../../types/curriculum';
import type { MentorScript } from '../../../types/networking-curriculum';

export const NET_04_MENTOR_SCRIPT: MentorScript = {
  version: '1.0.0',
  track: 'networking',
  moduleId: 'net-04',
  conceptId: 'why-ip-addresses-exist',
  revealLadder: {
    'step-0': ['ipv4-octets'],
    'step-1': ['ipv4-octets', 'slicer-blade'],
    'step-2': ['ipv4-octets', 'slicer-blade', 'active-octet'],
    'step-3': ['ipv4-octets', 'slicer-blade', 'active-octet', 'router-trunk'],
    'step-4': ['ipv4-octets', 'slicer-blade', 'active-octet', 'router-trunk', 'ticket-desk'],
  },
  terms: {
    'active-octet': {
      label: 'Active Octet',
      part: 'active-octet',
      explanation: 'The specific 8-bit octet where the prefix length divider splits network bits from host bits.',
    },
    'block-increment': {
      label: 'Block Increment',
      part: 'slicer-blade',
      explanation: '2^(remaining host bits in the active octet), determining the numerical spacing between consecutive subnet blocks.',
    },
    'network-id': {
      label: 'Network ID',
      part: 'ipv4-octets',
      explanation: 'The base address of a subnet with all host bits set to 0, identifying the subnet itself on routing tables.',
    },
    'broadcast-ip': {
      label: 'Broadcast Address',
      part: 'ipv4-octets',
      explanation: 'The final address in a subnet range with all host bits set to 1, used to address all hosts on the link.',
    },
  },
  beats: [
    {
      id: 'beat-1',
      stage: { stageNumber: 1, title: 'Stage 1: The 32-Bit Dotted Quad' },
      kind: 'point',
      text: 'Every IPv4 address is a 32-bit integer formatted into four 8-bit octets. Watch 192.168.10.130 broken down: octets 1–3 are network prefixes, and octet 4 holds 130 (binary 10000010).',
      spotlight: 'ipv4-octets',
      revealedParts: ['ipv4-octets'],
    },
    {
      id: 'beat-2',
      stage: { stageNumber: 1, title: 'Stage 1: Position Netmask Blade' },
      kind: 'do',
      text: 'Click Position Netmask Blade at /26 to divide the network bits from the host bits.',
      actionPrompt: 'Position Netmask Blade at /26',
      actionTargetPart: 'slicer-blade',
      revealedParts: ['ipv4-octets', 'slicer-blade'],
      spotlight: 'slicer-blade',
    },
    {
      id: 'beat-3',
      stage: { stageNumber: 1, title: 'Stage 1: The Active Octet Rule' },
      kind: 'point',
      text: 'Because /26 is between /25 and /32, Octet 4 is the {{term:active-octet}}. It has 2 network bits (prefix 26 - 24 = 2) and 6 host bits (8 - 2 = 6). The {{term:block-increment}} is 2^6 = 64. Subnet blocks start at 0, 64, 128, 192.',
      spotlight: 'active-octet',
      revealedParts: ['ipv4-octets', 'slicer-blade', 'active-octet'],
    },
    {
      id: 'beat-4',
      stage: { stageNumber: 1, title: 'Stage 1: Identify Subnet Block' },
      kind: 'do',
      text: 'Click Highlight Block .128 to lock in the subnet containing host IP .130.',
      actionPrompt: 'Highlight Subnet Block .128',
      actionTargetPart: 'ipv4-octets',
      revealedParts: ['ipv4-octets', 'slicer-blade', 'active-octet'],
      spotlight: 'ipv4-octets',
    },
    {
      id: 'beat-5',
      stage: { stageNumber: 2, title: 'Stage 2: Complete the /26 Calculation' },
      kind: 'predict',
      text: 'For host IP 192.168.10.65/26, what is the {{term:network-id}} and usable host range?',
      spotlight: 'ipv4-octets',
      revealedParts: ['ipv4-octets', 'slicer-blade', 'active-octet'],
      options: [
        {
          id: 'opt-net-0',
          label: 'Network ID: 192.168.10.0, Usable: .1 to .62',
          isCorrect: false,
          feedback: 'Value .65 exceeds block 0 (which ends at .63); it belongs to the second block.',
        },
        {
          id: 'opt-net-64',
          label: 'Network ID: 192.168.10.64, Usable: .65 to .126',
          isCorrect: true,
          feedback: 'Correct! Increment is 64; .65 falls into block [64..127]. .64 is the Network ID, .127 is the Broadcast, leaving .65–.126 usable.',
        },
        {
          id: 'opt-net-65',
          label: 'Network ID: 192.168.10.65, Usable: .66 to .128',
          isCorrect: false,
          feedback: 'Host IPs can never be the Network ID itself.',
        },
      ],
      whyOptions: [
        {
          id: 'why-block-64',
          label: 'The block increment is 64, so block 2 spans 64 to 127. First is Network ID, last is Broadcast, interior addresses are usable hosts.',
          isCorrect: true,
        },
        {
          id: 'why-subnets-odd',
          label: 'Network IDs must always be even numbers.',
          isCorrect: false,
        },
        {
          id: 'why-class-c',
          label: 'All 192.168 addresses have 254 usable hosts regardless of mask.',
          isCorrect: false,
        },
      ],
    },
    {
      id: 'beat-6',
      stage: { stageNumber: 3, title: 'Stage 3: Perform /27 Subnet Sizing' },
      kind: 'predict',
      text: 'A remote branch office assigns 172.16.20.100/27. How many usable host addresses does this subnet support, and what is the {{term:broadcast-ip}}?',
      spotlight: 'ipv4-octets',
      revealedParts: ['ipv4-octets', 'slicer-blade', 'active-octet'],
      options: [
        {
          id: 'opt-27-valid',
          label: '30 usable hosts, Broadcast Address: 172.16.20.127',
          isCorrect: true,
          feedback: 'Spot on! /27 leaves 5 host bits: 2^5 = 32 addresses, minus 2 = 30 usable hosts. 100 falls in block [96..127].',
        },
        {
          id: 'opt-27-62',
          label: '62 usable hosts, Broadcast Address: 172.16.20.128',
          isCorrect: false,
          feedback: '62 usable hosts corresponds to a /26 mask, not /27.',
        },
        {
          id: 'opt-27-14',
          label: '14 usable hosts, Broadcast Address: 172.16.20.111',
          isCorrect: false,
          feedback: '14 usable hosts corresponds to a /28 mask.',
        },
      ],
      whyOptions: [
        {
          id: 'why-27-math',
          label: '32 total bits - 27 prefix bits = 5 host bits. Capacity is 2^5 - 2 = 30 usable hosts.',
          isCorrect: true,
        },
        {
          id: 'why-broadcast-always-255',
          label: 'Broadcast addresses must always end in .255.',
          isCorrect: false,
        },
        {
          id: 'why-27-fixed',
          label: 'Subnets in 172.16.x are hardcoded by RFC standards to 16 hosts.',
          isCorrect: false,
        },
      ],
    },
    {
      id: 'beat-7',
      stage: { stageNumber: 4, title: 'Stage 4: Transfer to 3rd-Octet Prefix' },
      kind: 'point',
      text: 'Now test the Active Octet Rule beyond the 4th octet: examine 10.50.14.73/22. Prefixes /17 to /24 have their boundary in Octet 3!',
      spotlight: 'router-trunk',
      revealedParts: ['ipv4-octets', 'slicer-blade', 'active-octet', 'router-trunk'],
    },
    {
      id: 'beat-8',
      stage: { stageNumber: 4, title: 'Stage 4: /22 Calculation & Routing' },
      kind: 'predict',
      text: 'For 10.50.14.73/22, which octet is the {{term:active-octet}}, and what is the Network ID?',
      spotlight: 'router-trunk',
      revealedParts: ['ipv4-octets', 'slicer-blade', 'active-octet', 'router-trunk'],
      options: [
        {
          id: 'opt-octet-4',
          label: 'Active Octet is 4; Network ID is 10.50.14.0',
          isCorrect: false,
          feedback: 'Don\'t fall into the 4th-octet shortcut! /22 has 22 network bits: 8 in octet 1, 8 in octet 2, and 6 in octet 3.',
        },
        {
          id: 'opt-octet-3',
          label: 'Active Octet is 3; Network ID is 10.50.12.0',
          isCorrect: true,
          feedback: 'Brilliant! Octet 3 has 6 network bits and 2 host bits. Increment is 2^2 = 4 (blocks: 0, 4, 8, 12, 16...). 14 falls in block 12 (10.50.12.0/22).',
        },
        {
          id: 'opt-octet-2',
          label: 'Active Octet is 2; Network ID is 10.50.0.0',
          isCorrect: false,
          feedback: 'Octet 2 would only be active for prefixes between /9 and /16.',
        },
      ],
      whyOptions: [
        {
          id: 'why-active-3',
          label: 'Prefix /22 leaves 2 host bits in the 3rd octet (increment 4), so the block spans 10.50.12.0 to 10.50.15.255.',
          isCorrect: true,
        },
        {
          id: 'why-always-octet4',
          label: 'Subnetting only applies to the last octet of an IPv4 address.',
          isCorrect: false,
        },
        {
          id: 'why-class-a',
          label: '10.x.x.x addresses must always use 255.0.0.0 masks.',
          isCorrect: false,
        },
      ],
    },
    {
      id: 'beat-9',
      stage: { stageNumber: 5, title: 'Stage 5: Live Diagnosis' },
      kind: 'point',
      text: 'A critical connectivity ticket has just escalated: Workstation B cannot reach external services or its default gateway. Investigate the ticket below.',
      spotlight: 'ticket-desk',
      revealedParts: ['ipv4-octets', 'slicer-blade', 'active-octet', 'router-trunk', 'ticket-desk'],
    },
  ],
  ticketScene: {
    ticketId: '104',
    title: 'Ticket #104: The Off-Link Default Gateway',
    symptom: 'Workstation B (192.168.1.120) cannot access internet services or its configured default gateway (192.168.1.129).',
    telemetry: [
      'C:\\> ipconfig',
      'IPv4 Address. . . . . . . . . . : 192.168.1.120',
      'Subnet Mask . . . . . . . . . . : 255.255.255.128  (/25)',
      'Default Gateway . . . . . . . . : 192.168.1.129',
      'C:\\> ping 192.168.1.129',
      'PING 192.168.1.129: Destination host unreachable',
    ],
    options: [
      {
        id: 'opt-cable',
        label: 'Switch Port 2 cable is unplugged.',
        isCorrect: false,
        feedback: 'Link LEDs are solid green; local loopback and link-layer are functional.',
      },
      {
        id: 'opt-offlink-gw',
        label: 'Workstation B (.120/25) belongs to subnet 192.168.1.0–127, while Gateway (.129) is in subnet 192.168.1.128–255. Because the gateway is off-link, the host cannot ARP for it.',
        isCorrect: true,
        feedback: 'Spot on! A host cannot route through a gateway that is not in its own local subnet. The host drops the packets internally.',
      },
      {
        id: 'opt-too-many-hosts',
        label: 'Subnet mask /25 has exceeded its maximum capacity of 64 hosts.',
        isCorrect: false,
        feedback: 'A /25 supports 126 usable hosts; address exhaustion is not the cause.',
      },
    ],
    repairActions: [
      {
        id: 'fix-reconfigure-gw',
        label: 'Reconfigure Workstation B default gateway to 192.168.1.1 (within subnet .0-.127)',
        isCorrect: true,
        patch: { action: 'reconfigure-interface', target: 'workstation-b', value: { gateway: '192.168.1.1' } },
      },
      {
        id: 'fix-ip-254',
        label: 'Change Workstation B IP address to 192.168.1.254',
        isCorrect: false,
        patch: { action: 'reconfigure-interface', target: 'workstation-b', value: { ip: '192.168.1.254' } },
      },
      {
        id: 'fix-reboot-sw',
        label: 'Reboot the access switch',
        isCorrect: false,
        patch: { action: 'reboot', target: 'switch', value: 'all' },
      },
    ],
  },
};

/**
 * net-04: Network Layer & IPv4 Addressing
 * ─────────────────────────────────────────────────────────────────────────────
 * Milestone 3 — Concepts C15, C16, C17, C18, C19, C20
 * Teaches WHY IP addresses exist beyond flat MAC addressing, how dotted-decimal
 * notation and RFC 1918 private ranges work, the binary AND subnet mask
 * operation, local vs remote delivery decisions, CIDR block sizing, and the
 * /31 point-to-point and /32 host-route exceptions.
 */

export const NET_04_MODULE: ModuleData = {
  id: 'net-04',
  slug: 'ipv4-addressing-and-subnetting',
  day: 4,
  title: 'Module 4: The Network Layer & IPv4 Addressing',
  shortTitle: 'IPv4 Addressing',
  type: 'module',
  track: 'networking',
  milestoneId: 'net-milestone-2',
  description:
    'Discover why flat MAC addressing cannot scale to the global internet, how IPv4 dotted-decimal notation and subnet masks define network boundaries, and how CIDR notation compactly expresses address ranges.',
  estimatedMinutes: 35,
  curriculumOrder: 4,
  displayLabel: 'Module 4',
  completionLearnings: [
    'IP addresses exist because flat MAC addresses provide no geographical or topological hierarchy — routers need IP to route across networks',
    'IPv4 addresses are 32-bit numbers expressed in dotted-decimal notation (four octets, 0–255)',
    'RFC 1918 defines three private address ranges (10.x, 172.16–31.x, 192.168.x) that are never routed on the public internet',
    'A subnet mask isolates the network prefix from the host portion via a bitwise AND operation',
    'CIDR notation (/n) expresses the number of leading 1-bits in the mask; a /24 gives 254 usable host addresses',
    '/31 links (RFC 3021) leave 1 host bit (2 addresses, both usable as router endpoints on point-to-point links); /32 addresses identify a single host (loopback, anycast)',
  ],
  concepts: [
    // ─────────────────────────────────────────────────────
    // Concept 1: Why IP Addresses Exist (C15 + C16)
    // ─────────────────────────────────────────────────────
    {
      id: 'why-ip-addresses-exist',
      order: 1,
      title: 'Why IP Addresses Are Needed & IPv4 Dotted-Decimal',
      shortDescription:
        'Understand the fundamental limitation of MAC-only addressing and how IPv4 dotted-decimal and RFC 1918 private ranges solve it.',
      theory: {
        mentorScript: NET_04_MENTOR_SCRIPT,
        summary:
          'MAC addresses are flat, unstructured identifiers with no hierarchy. They cannot tell a router "which direction" to send a packet. IP addresses add a hierarchical, routable layer on top of the flat link layer.',

        explanation: [
          '### C15: Why IP Addresses Are Needed Beyond Flat MACs',
          'When Host A sends a frame to Host B on the **same Ethernet segment**, MAC addressing works perfectly — the switch uses the destination MAC to forward the frame to the correct port.',
          '',
          'But imagine a company with 10,000 employees in 50 cities. If we tried to route purely by MAC:',
          '- **No Hierarchy**: MACs are assigned by manufacturers (OUI prefix) — there is no concept of "this MAC is in New York" vs "this MAC is in London." Every router would need to know every single MAC in the world.',
          '- **Exponential Routing Tables**: The global internet has billions of devices. A MAC-only router would need billions of table entries — completely infeasible.',
          '',
          '**Solution — IP Addressing**: Internet Protocol (IP) adds a **second, hierarchical address** layer above MAC:',
          '- **Network portion**: Identifies which organization or logical network the device belongs to.',
          '- **Host portion**: Identifies the specific device within that network.',
          'Routers only need to know how to reach each **network prefix**, not every individual host.',
          '',
          '### C16: IPv4 Dotted-Decimal & RFC 1918 Private Ranges',
          'An **IPv4 address** is a 32-bit binary number, written as four decimal octets separated by dots:',
          '```',
          '192.168.1.100',
          '│   │   │  └── 100 = 0110 0100  (4th octet)',
          '│   │   └───── 1   = 0000 0001  (3rd octet)',
          '│   └───────── 168 = 1010 1000  (2nd octet)',
          '└───────────── 192 = 1100 0000  (1st octet)',
          '```',
          'Each octet ranges from **0 to 255** (2⁸ combinations). The total space is 2³² = 4,294,967,296 addresses.',
          '',
          '**RFC 1918 Private Ranges** — Three blocks are reserved for internal networks and are **never routed on the public internet**:',
          '| Range | CIDR | Available Addresses |',
          '|---|---|---|',
          '| `10.0.0.0 – 10.255.255.255` | `10.0.0.0/8` | ~16.7 million |',
          '| `172.16.0.0 – 172.31.255.255` | `172.16.0.0/12` | ~1 million |',
          '| `192.168.0.0 – 192.168.255.255` | `192.168.0.0/16` | 65,536 |',
          '',
          'Private addresses enable organizations to use large internal address spaces while sharing a single public IP through **NAT** (covered in Module 8).',
        ],
        keyTakeaway:
          'MAC addresses cannot route between networks — they are flat. IP addresses add a hierarchical structure that allows routers to forward packets globally using network prefixes.',
        exampleQuery: '',
        exampleQueryExplanation: '',
        mcqs: [
          {
            id: 'net04-mcq-why-ip',
            question:
              'Why can routers NOT use only MAC addresses to forward packets across the internet?',
            options: [
              'MAC addresses are too short (only 16 bits)',
              'MAC addresses are flat with no geographical or topological hierarchy, making global routing tables impossibly large',
              'MAC addresses change every time a device reboots',
              'MAC addresses are only used for wireless connections',
            ],
            correctIndex: 1,
            explanation:
              'MAC addresses are 48-bit flat identifiers assigned by manufacturers. They carry no information about location or network topology, so a global router would need a table entry for every device — billions of entries, updated constantly.',
          },
          {
            id: 'net04-mcq-rfc1918',
            question: 'Which of the following is a valid RFC 1918 private IP address?',
            options: [
              '8.8.8.8 (Google Public DNS)',
              '172.32.0.1',
              '192.168.10.50',
              '11.0.0.1',
            ],
            correctIndex: 2,
            explanation:
              '192.168.10.50 falls within the 192.168.0.0/16 RFC 1918 private range. 8.8.8.8 is a public address. 172.32.0.1 is outside the 172.16.0.0–172.31.255.255 range. 11.0.0.1 is also public.',
          },
        ],
      },
      tasks: [
        {
          id: 'net04-p1-ip-need',
          title: 'Guided Practice: MAC Limitation & RFC 1918 Classification',
          description:
            'Identify why MAC-only routing fails and classify IP addresses as private or public.',
          instructions: [
            'A network engineer is designing a global corporate network connecting offices in 30 countries.',
            'She considers routing purely by MAC addresses but quickly identifies a fundamental problem.',
            'She then evaluates several IP addresses to classify them as private (RFC 1918) or public.',
          ],
          type: 'guided',
          primaryTable: '',
          initialSql: '',
          solutionSql: 'NETWORKING_JUDGMENT_TASK',
          solutionExplanation:
            'MAC routing fails due to absence of hierarchy. 172.20.5.1 and 10.42.0.100 are RFC 1918 private; 8.8.8.8 is a globally routable public address (note: 203.0.113.0/24 is reserved under RFC 5737 as TEST-NET-3 for documentation only).',
          hints: [
            {
              level: 1,
              text: 'Think about what information a MAC address encodes: it only identifies a device, not its location in the network topology.',
            },
            {
              level: 2,
              text: 'RFC 1918 private ranges are: 10.0.0.0/8, 172.16.0.0/12 (172.16–31), and 192.168.0.0/16.',
            },
          ],
          validation: {
            judgment: [
              {
                kind: 'choose-and-defend',
                prompt:
                  'Why would a router need billions of table entries if routing used only MAC addresses?',
                options: [
                  'Because MAC addresses are 48 bits long, requiring more memory than 32-bit IP addresses',
                  'Because MACs have no network hierarchy — every unique device MAC requires its own routing table entry',
                  'Because MAC routing uses flooding instead of directed forwarding',
                  'Because routers cannot read Layer 2 MAC addresses at all',
                ],
                correctIndex: 1,
                explanation:
                  'IP addresses carry a network prefix (shared by all hosts in a subnet), allowing routers to aggregate millions of hosts into a single routing entry. MAC addresses have no such hierarchy.',
              },
              {
                kind: 'choose-and-defend',
                prompt: 'Which of these IP addresses is in an RFC 1918 private range?',
                options: [
                  '8.8.8.8 (Google Public DNS)',
                  '172.20.5.1',
                  '11.255.0.1',
                  '8.8.4.4',
                ],
                correctIndex: 1,
                explanation:
                  '172.20.5.1 falls within 172.16.0.0–172.31.255.255, which is the 172.16.0.0/12 RFC 1918 private range. 8.8.8.8, 11.255.0.1, and 8.8.4.4 are public addresses. (Note: 203.0.113.0/24 is reserved under RFC 5737 as TEST-NET-3 for documentation only).',
              },
            ],
          },
          successMessage:
            'Correct! MAC addresses cannot scale globally due to missing hierarchy. RFC 1918 defines three private ranges that routers never forward onto the public internet.',
        },
      ],
    },

    // ─────────────────────────────────────────────────────
    // Concept 2: Subnet Masks & Binary AND (C17 + C18)
    // ─────────────────────────────────────────────────────
    {
      id: 'subnet-masks-and-binary-and',
      order: 2,
      title: 'Subnet Masks & the Local vs Remote Delivery Decision',
      shortDescription:
        'Apply the binary AND operation to determine if a destination is on the local subnet or requires routing via a gateway.',
      theory: {
        summary:
          'A subnet mask is a 32-bit pattern of consecutive 1-bits followed by consecutive 0-bits. Performing a bitwise AND between an IP address and its mask isolates the network prefix, enabling the local/remote delivery decision.',
        explanation: [
          '### C17: Subnet Masks & Binary AND Masking',
          'A **subnet mask** is a 32-bit value where a block of leading 1-bits defines the **network portion** and trailing 0-bits define the **host portion**:',
          '```',
          'Mask 255.255.255.0 in binary:',
          '  1111 1111 . 1111 1111 . 1111 1111 . 0000 0000',
          '  └──────────── network prefix (24 bits) ──────┘ └─ host (8 bits) ─┘',
          '```',
          '',
          'The **bitwise AND operation** extracts the network address from any IP:',
          '```',
          'IP:   192.168.1.100  →  1100 0000 . 1010 1000 . 0000 0001 . 0110 0100',
          'Mask: 255.255.255.0  →  1111 1111 . 1111 1111 . 1111 1111 . 0000 0000',
          'AND:  192.168.1.0    →  1100 0000 . 1010 1000 . 0000 0001 . 0000 0000',
          '```',
          'The result (192.168.1.0) is the **network address** — the identifier of the subnet.',
          '',
          '### C18: Local Subnet Decision',
          'Every IP stack applies this mask AND test before sending any packet:',
          '',
          '**Step 1**: Compute `My IP AND My Mask` → My Network Address.',
          '**Step 2**: Compute `Dest IP AND My Mask` → Dest Network Address.',
          '**Step 3**: Compare:',
          '- **Same network addresses** → Destination is **local** → ARP for destination MAC directly.',
          '- **Different network addresses** → Destination is **remote** → ARP for the default gateway MAC instead.',
          '',
          '**Example**:',
          '```',
          'My IP:    192.168.1.50   My Mask: 255.255.255.0',
          'Dest IP:  192.168.1.200',
          '',
          'My network:   192.168.1.50  AND 255.255.255.0 = 192.168.1.0',
          'Dest network: 192.168.1.200 AND 255.255.255.0 = 192.168.1.0',
          'Same → LOCAL DELIVERY → ARP for 192.168.1.200 directly.',
          '```',
          '',
          '```',
          'My IP:    192.168.1.50   My Mask: 255.255.255.0',
          'Dest IP:  10.0.0.5',
          '',
          'My network:   192.168.1.0',
          'Dest network: 10.0.0.0',
          'Different → REMOTE DELIVERY → ARP for default gateway (router).',
          '```',
        ],
        keyTakeaway:
          'The subnet mask AND test is the fundamental local-vs-remote decision every IP stack makes before every packet: same network prefix → deliver locally; different → send to the default gateway.',
        exampleQuery: '',
        exampleQueryExplanation: '',
        mcqs: [
          {
            id: 'net04-mcq-and-mask',
            question:
              'A host with IP 192.168.2.75 and mask 255.255.255.0 wants to reach 192.168.2.200. What is the delivery decision?',
            options: [
              'Remote — different network addresses, must route via gateway',
              'Local — both are in the 192.168.2.0/24 subnet, ARP directly',
              'Local — both share the 192 prefix',
              'Remote — 192.168.2.200 is above .128, which is a different subnet',
            ],
            correctIndex: 1,
            explanation:
              '192.168.2.75 AND 255.255.255.0 = 192.168.2.0. 192.168.2.200 AND 255.255.255.0 = 192.168.2.0. Same network prefix → local delivery, ARP for the destination directly.',
          },
        ],
      },
      tasks: [
        {
          id: 'net04-p2-subnet-decision',
          title: 'Independent Practice: Local vs Remote Subnet Decision',
          description:
            'Apply the binary AND subnet mask test to determine local or remote delivery for three different destination scenarios.',
          instructions: [
            'Host configuration: IP = 10.0.1.30, Mask = 255.255.255.0, Gateway = 10.0.1.1',
            'Evaluate the following destination IPs to classify them as local (ARP direct) or remote (send to gateway):',
            '  A) Destination: 10.0.1.200',
            '  B) Destination: 10.0.2.10',
          ],
          type: 'independent',
          primaryTable: '',
          initialSql: '',
          solutionSql: 'NETWORKING_JUDGMENT_TASK',
          solutionExplanation:
            'A is local (10.0.1.0/24 match); B is remote (different network prefix 10.0.2.0/24, send to gateway 10.0.1.1).',
          hints: [
            {
              level: 1,
              text: 'Apply: Dest IP AND 255.255.255.0. If the result equals 10.0.1.0, the destination is local.',
            },
            {
              level: 2,
              text: 'A: 10.0.1.200 AND 255.255.255.0 = 10.0.1.0 → local. B: 10.0.2.10 AND 255.255.255.0 = 10.0.2.0 → remote. C: 8.8.8.8 → entirely different prefix → remote.',
            },
          ],
          validation: {
            judgment: [
              {
                kind: 'choose-and-defend',
                prompt: 'For Destination 10.0.1.200, what does the host do?',
                options: [
                  'Sends packet to default gateway (10.0.1.1) because 200 > 128',
                  'ARPs directly for 10.0.1.200 — it is on the same 10.0.1.0/24 subnet',
                  'Drops the packet — 10.0.1.200 is a broadcast address',
                  'Sends to gateway because the host portion (200) is not in the ARP cache',
                ],
                correctIndex: 1,
                explanation:
                  '10.0.1.200 AND 255.255.255.0 = 10.0.1.0, which equals My Network (10.0.1.30 AND mask = 10.0.1.0). Same network → local ARP.',
              },
              {
                kind: 'choose-and-defend',
                prompt: 'For Destination 10.0.2.10, what does the host do?',
                options: [
                  'ARPs directly for 10.0.2.10 — the 10.x prefix matches',
                  'Sends packet to gateway 10.0.1.1 — different /24 subnet (10.0.2.0 ≠ 10.0.1.0)',
                  'Drops the packet — only /8 masks apply to 10.x addresses',
                  'Broadcasts the packet on the local segment',
                ],
                correctIndex: 1,
                explanation:
                  '10.0.2.10 AND 255.255.255.0 = 10.0.2.0, which differs from My Network (10.0.1.0). Different network prefix → remote delivery → packet sent to gateway 10.0.1.1.',
              },
            ],
          },
          successMessage:
            'Well done! The subnet AND test correctly classifies local vs remote: 10.0.1.x is local, 10.0.2.x and public addresses go via the gateway.',
        },
        // ── Stage 1: Observe (Worked Example 192.168.10.130/26) ──────
        {
          id: 'net04-stage1-observe',
          title: 'Stage 1: Observe — Subnet Bit Slicing & Boundary Derivation',
          description:
            'Observe how the 32-bit subnet mask splits an IPv4 address into network bits and host bits on target 192.168.10.130/26.',
          instructions: [
            'Target IP: 192.168.10.130/26.',
            'Examine the 32-bit bit slicer: Octets 1–3 (24 bits) are solid network bits.',
            'In Octet 4 (130 = 10000010), the /26 mask allocates 2 network bits (128) and leaves 6 host bits.',
            'Block increment = 2^6 = 64. Subnet blocks advance in multiples of 64: 0, 64, 128, 192.',
            '130 falls into the block starting at 128 (192.168.10.128).',
            'Broadcast is 128 + 64 - 1 = 192.168.10.191. Usable host range is 192.168.10.129 to 192.168.10.190 (62 usable hosts).',
          ],
          type: 'guided',
          primaryTable: '',
          initialSql: '',
          solutionSql: 'NETWORKING_JUDGMENT_TASK',
          solutionExplanation:
            'With /26, 6 host bits remain in the 4th octet (increment 64). Blocks: 0, 64, 128, 192. 130 is in 192.168.10.128.',
          hints: [
            { level: 1, text: 'Look at the glowing divider at bit 26 in the 4th octet.' },
            { level: 2, text: 'Increment = 2^(32-26) = 2^6 = 64. 130 falls between 128 and 191.' },
          ],
          subnetting: {
            stage: 1,
            targetIp: '192.168.10.130',
            prefix: 26,
            isInteractive: true,
            isCollapsed: false,
          },
          validation: {
            judgment: [
              {
                kind: 'choose-and-defend',
                prompt:
                  'Based on the 32-bit bit-slicer observation for 192.168.10.130/26, why is the network address 192.168.10.128 rather than 192.168.10.0?',
                options: [
                  'Because /26 leaves 6 host bits (increment 64), and .130 falls into the block spanning 128 to 191',
                  'Because all class C subnets start at .128 by default',
                  'Because the last octet is an even number',
                  'Because 192.168.10.0 is reserved for default gateways only',
                ],
                correctIndex: 0,
                explanation:
                  'With prefix /26, 6 host bits remain in the 4th octet, giving a block increment of 2^6 = 64. Subnet blocks start at 0, 64, 128, and 192. Since 130 is between 128 and 191, the subnet network address is 192.168.10.128.',
              },
            ],
          },
          successMessage:
            'Stage 1 observed! You derived the 64-block increment and verified 192.168.10.128 network boundary.',
        },
        // ── Stage 2: Complete (Guided Practice 192.168.10.65/26) ─────
        {
          id: 'net04-stage2-complete',
          title: 'Stage 2: Complete — Guided Subnet Calculation & Host Range',
          description:
            'Complete the step-by-step intermediate calculations for target IP 192.168.10.65/26 using the interactive bit-slicer.',
          instructions: [
            'Target IP: 192.168.10.65/26.',
            'Step 1: Calculate remaining host bits in the 4th octet (32 - 26).',
            'Step 2: Calculate the block increment (2^H).',
            'Step 3: Identify the subnet multiple containing .65.',
            'Step 4: Compute the broadcast address and usable host range.',
          ],
          type: 'guided',
          primaryTable: '',
          initialSql: '',
          solutionSql: 'NETWORKING_JUDGMENT_TASK',
          solutionExplanation:
            'Step 1: 6 host bits. Step 2: 2^6 = 64. Step 3: 192.168.10.64. Step 4: Broadcast .127, usable .65–.126 (62 hosts).',
          hints: [
            { level: 1, text: 'Host bits = 32 - prefix = 32 - 26 = 6.' },
            { level: 2, text: 'Increment is 2^6 = 64. Multiples: 0, 64, 128, 192. .65 is in block 64.' },
          ],
          subnetting: {
            stage: 2,
            targetIp: '192.168.10.65',
            prefix: 26,
            isInteractive: true,
            isCollapsed: false,
            fields: [
              {
                id: 'host_bits',
                label: 'Step 1: Host Bits in Active Octet (32 - 26)',
                expected: '6',
                type: 'number',
              },
              {
                id: 'increment',
                label: 'Step 2: Block Size Increment (2^H)',
                expected: '64',
                type: 'number',
                misconceptions: [
                  {
                    testPattern: '^(32|128)$',
                    feedback:
                      'Remember that increment is 2^H, where H is the number of host bits in the active octet (H = 6 => 2^6 = 64).',
                  },
                ],
              },
              {
                id: 'network_address',
                label: 'Step 3: Subnet Network Address',
                expected: '192.168.10.64',
                misconceptions: [
                  {
                    testPattern: '192\\.168\\.10\\.0$',
                    feedback:
                      '.0 covers .0 through .63. Because the target address is .65, it falls into the next block starting at .64.',
                  },
                ],
              },
              {
                id: 'broadcast_address',
                label: 'Step 4: Broadcast Address (Network + Increment - 1)',
                expected: '192.168.10.127',
              },
              {
                id: 'first_usable',
                label: 'Step 5: First Usable Host IP',
                expected: '192.168.10.65',
              },
              {
                id: 'last_usable',
                label: 'Step 6: Last Usable Host IP',
                expected: '192.168.10.126',
              },
              {
                id: 'usable_capacity',
                label: 'Step 7: Total Usable Host Capacity (2^H - 2)',
                expected: '62',
                type: 'number',
                misconceptions: [
                  {
                    testPattern: '^64$',
                    feedback:
                      'You calculated the total number of IP addresses in the block (2^6 = 64). Remember to subtract 2 for the network address (.64) and broadcast address (.127). Usable count is 62.',
                  },
                ],
              },
            ],
          },
          validation: {
            judgment: [
              {
                kind: 'choose-and-defend',
                prompt: 'What is the network address for host 192.168.10.65/26?',
                options: [
                  '192.168.10.0 (the first block)',
                  '192.168.10.64 (second block spanning .64 to .127)',
                  '192.168.10.65 (the host IP itself)',
                  '192.168.10.128 (third block)',
                ],
                correctIndex: 1,
                explanation:
                  'The /26 prefix divides the 4th octet into blocks of 64 (.0, .64, .128, .192). .65 falls into the second block starting at 192.168.10.64.',
              },
            ],
          },
          successMessage:
            'Stage 2 completed! You calculated the 6 host bits, 64 block size, and 62 usable host capacity.',
        },
        // ── Stage 3: Perform Independently (Faded Visualizer 172.16.20.100/27) ──
        {
          id: 'net04-stage3-perform',
          title: 'Stage 3: Perform Independently — Independent Subnetting Calculation',
          description:
            'Perform the full subnet calculation for 172.16.20.100/27 independently with the visualizer collapsed.',
          instructions: [
            'Target IP: 172.16.20.100/27.',
            'The bit-slicer is collapsed to enforce independent mental calculation.',
            'Calculate the dotted-decimal subnet mask, network address, broadcast address, and usable host range.',
            'Submit clean numerical entries.',
          ],
          type: 'independent',
          primaryTable: '',
          initialSql: '',
          solutionSql: 'NETWORKING_JUDGMENT_TASK',
          solutionExplanation:
            '/27 gives 5 host bits (increment 32). Blocks: 0, 32, 64, 96, 128. 100 falls in 172.16.20.96. Broadcast 172.16.20.127, usable 97–126 (30 hosts).',
          hints: [
            { level: 1, text: 'Host bits = 32 - 27 = 5. Increment = 2^5 = 32.' },
            { level: 2, text: 'Multiples of 32: 0, 32, 64, 96, 128. 100 is between 96 and 127.' },
          ],
          subnetting: {
            stage: 3,
            targetIp: '172.16.20.100',
            prefix: 27,
            isInteractive: false,
            isCollapsed: true,
            reflectionPrompt:
              'Why cannot 172.16.20.96 and 172.16.20.127 be assigned to workstation network adapters?',
            modelExplanation:
              '172.16.20.96 has all host bits set to 0, representing the subnet wire ID. 172.16.20.127 has all host bits set to 1, representing the directed broadcast address for that subnet. Host IP stacks reject both.',
            fields: [
              {
                id: 'mask',
                label: 'Subnet Mask (Dotted-Decimal)',
                expected: '255.255.255.224',
              },
              {
                id: 'network',
                label: 'Subnet Network Address',
                expected: '172.16.20.96',
                misconceptions: [
                  {
                    testPattern: '172\\.16\\.20\\.0$',
                    feedback:
                      'You assumed a /24 boundary. A /27 has 5 host bits (2^5 = 32 increment). Subnets start at 0, 32, 64, 96, 128. Since 100 is between 96 and 127, the network address is 172.16.20.96.',
                  },
                ],
              },
              {
                id: 'broadcast',
                label: 'Subnet Broadcast Address',
                expected: '172.16.20.127',
                misconceptions: [
                  {
                    testPattern: '172\\.16\\.20\\.128$',
                    feedback:
                      '.128 is the network address of the next subnet. The broadcast address is one less than the next subnet: 96 + 32 - 1 = 127.',
                  },
                ],
              },
              {
                id: 'first_usable',
                label: 'First Usable Host IP',
                expected: '172.16.20.97',
              },
              {
                id: 'last_usable',
                label: 'Last Usable Host IP',
                expected: '172.16.20.126',
              },
              {
                id: 'capacity',
                label: 'Total Usable Host Capacity',
                expected: '30',
                type: 'number',
                misconceptions: [
                  {
                    testPattern: '^32$',
                    feedback:
                      '2^5 = 32 total addresses, but .96 (network ID) and .127 (broadcast ID) cannot be assigned to hosts. You must subtract 2.',
                  },
                ],
              },
            ],
          },
          validation: {
            judgment: [
              {
                kind: 'choose-and-defend',
                prompt: 'For 172.16.20.100/27, what is the valid usable host range?',
                options: [
                  '172.16.20.1 to 172.16.20.254',
                  '172.16.20.97 to 172.16.20.126',
                  '172.16.20.96 to 172.16.20.127',
                  '172.16.20.65 to 172.16.20.94',
                ],
                correctIndex: 1,
                explanation:
                  'With a /27 prefix (increment 32), the subnet is 172.16.20.96/27. The first usable host is .97 (network + 1) and last usable host is .126 (broadcast - 1).',
              },
            ],
          },
          successMessage:
            'Stage 3 mastered! Independent calculation verified for 172.16.20.100/27 without visualizer assistance.',
        },
        // ── Stage 4: Transfer (Router-on-a-Stick 10.10.4.82/28) ──────
        {
          id: 'net04-stage4-transfer',
          title: 'Stage 4: Transfer — Layer 2 vs. Layer 3 Forwarding on Router-on-a-Stick',
          description:
            'Apply subnet mask boundaries to make on-link vs. off-link forwarding decisions across 802.1Q VLANs.',
          instructions: [
            'Router R1 connects to Switch SW1 via a single physical trunk link (Port 24) carrying tagged VLANs 10 and 20.',
            'Subinterface Gig0/0.10: IP 10.10.4.81/28, MAC GW:81:81:81:81:81 (Default Gateway for VLAN 10).',
            'Subinterface Gig0/0.20: IP 10.10.4.97/28, MAC GW:97:97:97:97:97 (Default Gateway for VLAN 20).',
            'Workstation A is connected to Port 1 (Access VLAN 10) with IP 10.10.4.82/28.',
            'Destination 1 is connected to Port 2 (Access VLAN 10) with IP 10.10.4.94/28.',
            'Destination 2 is connected to Port 5 (Access VLAN 20) with IP 10.10.4.98/28.',
            'Compute Workstation A\'s subnet boundaries and decide forwarding actions for Destination 1 and Destination 2.',
          ],
          type: 'independent',
          primaryTable: '',
          initialSql: '',
          solutionSql: 'NETWORKING_JUDGMENT_TASK',
          solutionExplanation:
            'Workstation A is in 10.10.4.80/28 (.80–.95). .94 is local (send directly across VLAN 10). .98 is remote (send to Default Gateway Gig0/0.10 MAC GW:81).',
          hints: [
            { level: 1, text: '/28 has 4 host bits -> increment 16. Multiples: 0, 16, 32, 48, 64, 80, 96.' },
            { level: 2, text: 'Workstation A is 10.10.4.80–.95. .94 is inside -> local. .98 is outside -> remote via router gateway.' },
          ],
          subnetting: {
            stage: 4,
            targetIp: '10.10.4.82',
            prefix: 28,
            routerOnAStick: {
              trunkPort: 24,
              subinterfaces: [
                { id: 'Gig0/0.10', vlan: 10, ip: '10.10.4.81/28', mac: 'GW:81:81:81:81:81' },
                { id: 'Gig0/0.20', vlan: 20, ip: '10.10.4.97/28', mac: 'GW:97:97:97:97:97' },
              ],
              hosts: [
                { name: 'Workstation A', ip: '10.10.4.82/28', port: 1, vlan: 10 },
                { name: 'Destination 1', ip: '10.10.4.94/28', port: 2, vlan: 10 },
                { name: 'Destination 2', ip: '10.10.4.98/28', port: 5, vlan: 20 },
              ],
            },
            fields: [
              {
                id: 'workstation_network',
                label: 'Workstation A Subnet Network Address',
                expected: '10.10.4.80',
              },
              {
                id: 'workstation_broadcast',
                label: 'Workstation A Broadcast Address',
                expected: '10.10.4.95',
              },
              {
                id: 'dest1_status',
                label: 'Destination 1 (10.10.4.94) Subnet Status',
                type: 'radio',
                options: [
                  { label: 'Local Subnet (On-Link)', value: 'local' },
                  { label: 'Remote Subnet (Off-Link)', value: 'remote' },
                ],
                expected: 'local',
              },
              {
                id: 'dest1_mac',
                label: 'Destination 1 Ethernet Dest MAC Target',
                type: 'select',
                options: [
                  { label: "Destination 1's MAC (AA:94:...)", value: 'dest1' },
                  { label: 'Default Gateway MAC (GW:81:...)', value: 'gateway' },
                ],
                expected: 'dest1',
              },
              {
                id: 'dest2_status',
                label: 'Destination 2 (10.10.4.98) Subnet Status',
                type: 'radio',
                options: [
                  { label: 'Local Subnet (On-Link)', value: 'local' },
                  { label: 'Remote Subnet (Off-Link)', value: 'remote' },
                ],
                expected: 'remote',
              },
              {
                id: 'dest2_mac',
                label: 'Destination 2 Ethernet Dest MAC Target',
                type: 'select',
                options: [
                  { label: "Destination 2's MAC (BB:98:...)", value: 'dest2' },
                  { label: 'Default Gateway MAC (GW:81:...)', value: 'gateway' },
                ],
                expected: 'gateway',
              },
            ],
          },
          validation: {
            judgment: [
              {
                kind: 'choose-and-defend',
                prompt:
                  'When Workstation A (10.10.4.82/28) sends a packet to Destination 2 (10.10.4.98/28), why MUST it address the Ethernet frame to Default Gateway MAC GW:81:81:81:81:81?',
                options: [
                  'Because 10.10.4.98 is outside Workstation A\'s /28 subnet (.80–.95); sending an ARP request locally would fail because Switch SW1 confines VLAN 10 broadcasts away from VLAN 20',
                  'Because Destination 2 is powered off',
                  'Because all /28 packets must go through the router regardless of destination',
                  'Because switches cannot read IPv4 addresses',
                ],
                correctIndex: 0,
                explanation:
                  'Workstation A computes that .98 is outside its /28 range (.80–.95). Because Switch SW1 confines broadcasts on Port 1 to Access VLAN 10, an ARP request for .98 would never enter Access VLAN 20 (Port 5). By recognizing .98 as remote, Workstation A sends the frame to Default Gateway 10.10.4.81\'s MAC, transmitting across Trunk Port 24 to Router R1 for inter-VLAN routing.',
              },
            ],
          },
          successMessage:
            'Stage 4 transfer achieved! You correctly applied subnet boundaries to choose destination MAC vs. default gateway MAC.',
        },
        // ── Stage 5: Diagnose (Off-Link Gateway Fault Isolation 192.168.1.120/25) ──
        {
          id: 'net04-stage5-diagnose',
          title: 'Stage 5: Diagnose — Fault Isolation & Synchronized Gateway Configuration',
          description:
            'Diagnose an off-link gateway configuration error in simulated host telemetry and synchronize dual-device settings.',
          instructions: [
            'Workstation B (Port 2, VLAN 10) reports no connectivity to the network or default gateway.',
            'Workstation B configuration: IP 192.168.1.120, Mask 255.255.255.128 (/25), Gateway 192.168.1.129.',
            'Router R1 Gig0/0 (Port 1, VLAN 10) configuration: IP 192.168.1.129, Mask 255.255.255.128 (/25).',
            'Physical link LEDs are solid green, but simulated ping fails with "Destination host unreachable (no valid on-link route to gateway)".',
            'Step 1: Compute the subnets for Workstation B and Router Gig0/0 to identify the fault.',
            'Step 2: Correctly reconfigure Router Gig0/0 and Workstation B to synchronize on Subnet 1 (192.168.1.0/25).',
          ],
          type: 'independent',
          primaryTable: '',
          initialSql: '',
          solutionSql: 'NETWORKING_JUDGMENT_TASK',
          solutionExplanation:
            'Workstation B is in 192.168.1.0/25; Gateway .129 is in 192.168.1.128/25. Align both to Subnet 1: Router Gig0/0 = 192.168.1.1, Workstation B Gateway = 192.168.1.1.',
          hints: [
            { level: 1, text: 'A /25 mask splits the octet into two blocks: 0–127 and 128–255.' },
            { level: 2, text: '.120 is in Subnet 0–127; .129 is in Subnet 128–255. The gateway is off-link!' },
          ],
          subnetting: {
            stage: 5,
            targetIp: '192.168.1.120',
            prefix: 25,
            diagnostics: {
              routeTableOutput:
                'default via 192.168.1.129 dev eth0 [status: unreachable - gateway not on link]\n192.168.1.0/25 dev eth0 proto kernel scope link src 192.168.1.120',
              pingOutput:
                'C:\\> ping 192.168.1.129\nPING 192.168.1.129: Destination host unreachable (no valid on-link route to gateway)',
              terminalOutput: 'Simulated Host eth0: 0 packets transmitted on physical link',
            },
            fields: [
              {
                id: 'host_subnet',
                label: 'Workstation B Subnet Network (192.168.1.120/25)',
                expected: '192.168.1.0',
              },
              {
                id: 'gateway_subnet',
                label: 'Router Gig0/0 Subnet Network (192.168.1.129/25)',
                expected: '192.168.1.128',
              },
              {
                id: 'reconfig_router_ip',
                label: 'Reconfigured Router Gig0/0 IP (in Subnet 1)',
                expected: '192.168.1.1',
              },
              {
                id: 'reconfig_router_mask',
                label: 'Reconfigured Router Gig0/0 Subnet Mask',
                expected: '255.255.255.128',
              },
              {
                id: 'reconfig_host_gw',
                label: 'Reconfigured Workstation B Default Gateway',
                expected: '192.168.1.1',
              },
            ],
          },
          validation: {
            judgment: [
              {
                kind: 'diagnose-plan',
                prompt:
                  'Why does the simulated host fail to transmit packets when attempting to ping gateway 192.168.1.129?',
                options: [
                  'The host routing engine determines that 192.168.1.129 is not on its local subnet (192.168.1.0/25). Because the configured gateway is off-link, the host cannot resolve an on-link next hop and drops the packet internally before sending',
                  'The frame loops endlessly between switch and router until TTL expires',
                  'The router receives the frame but drops it because .120 is an even number',
                  'The physical cable between switch and workstation is defective',
                ],
                correctIndex: 0,
                explanation:
                  'Workstation B\'s on-link route is 192.168.1.0/25 (.0 to .127). The gateway 192.168.1.129 is in subnet 192.168.1.128/25. Because the gateway itself is off-link, the host\'s route table flags it as unreachable and suppresses packet transmission.',
              },
            ],
          },
          successMessage:
            'Stage 5 diagnosed! You identified the off-link gateway misconfiguration and synchronized both devices on Subnet 1.',
        },
        // ── Active-Octet Transfer Assessment: 10.50.14.73/22 ───────────
        {
          id: 'net04-transfer-active-octet',
          title: 'Active-Octet Transfer Assessment: 10.50.14.73/22 (No Hints Available)',
          description:
            'Master the universal Active-Octet Rule for enterprise 3rd-octet subnetting without shortcuts or hints.',
          instructions: [
            'Target allocation: 10.50.14.73/22.',
            'Active (Interesting) Octet Rule: /22 falls into Octet 3 (between /17 and /24).',
            'Host bits in Octet 3: 24 - 22 = 2 bits -> Increment = 2^2 = 4 in the 3rd octet.',
            'Calculate the subnet mask, network address, broadcast address, and usable capacity (1,022 hosts).',
            'Classify forwarding for Destination 10.50.15.200 and Destination 10.50.16.5.',
          ],
          type: 'independent',
          primaryTable: '',
          initialSql: '',
          solutionSql: 'NETWORKING_JUDGMENT_TASK',
          solutionExplanation:
            'Active Octet = 3. Mask = 255.255.252.0. Increment = 4 in 3rd octet. Subnet = 10.50.12.0. Broadcast = 10.50.15.255. Usable = 10.50.12.1 to 10.50.15.254 (1,022 hosts). .15.200 is local; .16.5 is remote.',
          hints: [],
          subnetting: {
            stage: 3,
            targetIp: '10.50.14.73',
            prefix: 22,
            isInteractive: false,
            isCollapsed: true,
            fields: [
              {
                id: 'active_octet',
                label: 'Active (Interesting) Octet',
                type: 'select',
                options: [
                  { label: 'Octet 1', value: '1' },
                  { label: 'Octet 2', value: '2' },
                  { label: 'Octet 3', value: '3' },
                  { label: 'Octet 4', value: '4' },
                ],
                expected: '3',
              },
              {
                id: 'mask',
                label: 'Subnet Mask (Dotted-Decimal)',
                expected: '255.255.252.0',
              },
              {
                id: 'increment',
                label: 'Block Increment in Active Octet',
                expected: '4',
                type: 'number',
              },
              {
                id: 'network',
                label: 'Subnet Network Address',
                expected: '10.50.12.0',
              },
              {
                id: 'broadcast',
                label: 'Subnet Broadcast Address',
                expected: '10.50.15.255',
              },
              {
                id: 'first_usable',
                label: 'First Usable Host IP',
                expected: '10.50.12.1',
              },
              {
                id: 'last_usable',
                label: 'Last Usable Host IP',
                expected: '10.50.15.254',
              },
              {
                id: 'usable_capacity',
                label: 'Total Usable Host Capacity (2^10 - 2)',
                expected: '1022',
                type: 'number',
              },
              {
                id: 'dest1_forwarding',
                label: 'Forwarding Decision for Destination 10.50.15.200',
                type: 'radio',
                options: [
                  { label: 'Local Subnet (On-Link)', value: 'local' },
                  { label: 'Remote Subnet (Off-Link)', value: 'remote' },
                ],
                expected: 'local',
              },
              {
                id: 'dest2_forwarding',
                label: 'Forwarding Decision for Destination 10.50.16.5',
                type: 'radio',
                options: [
                  { label: 'Local Subnet (On-Link)', value: 'local' },
                  { label: 'Remote Subnet (Off-Link)', value: 'remote' },
                ],
                expected: 'remote',
              },
            ],
          },
          validation: {
            judgment: [
              {
                kind: 'choose-and-defend',
                prompt:
                  'For 10.50.14.73/22, which octet is active and what is its block increment?',
                options: [
                  'Octet 3 with increment 4 (subnets advance every 4 in the 3rd octet: 0, 4, 8, 12, 16...)',
                  'Octet 4 with increment 64',
                  'Octet 2 with increment 2',
                  'Octet 3 with increment 252',
                ],
                correctIndex: 0,
                explanation:
                  'A /22 prefix falls in the 3rd octet (between /17 and /24). 24 - 22 = 2 host bits in the 3rd octet, so increment is 2^2 = 4. The 3rd octet values advance by 4.',
              },
              {
                kind: 'choose-and-defend',
                prompt:
                  'When host 10.50.14.73/22 sends a packet to 10.50.15.200, why is delivery local?',
                options: [
                  '10.50.15.200 falls within the subnet boundary 10.50.12.0 to 10.50.15.255',
                  'Both addresses share the 10.50 prefix, and all 10.50 addresses are local',
                  '10.50.15.200 is a broadcast address',
                  'Because /22 subnets do not use default gateways',
                ],
                correctIndex: 0,
                explanation:
                  'The /22 subnet boundary spans from 10.50.12.0 through 10.50.15.255. 10.50.15.200 is inside this range, so it is on-link and delivered locally via ARP.',
              },
            ],
          },
          successMessage:
            'Active-Octet Transfer Mastered! You solved the 3rd-octet enterprise subnetting challenge with 0 hints.',
        },
      ],
    },

    // ─────────────────────────────────────────────────────
    // Concept 3: CIDR Notation & /31 /32 Exceptions (C19 + C20)
    // ─────────────────────────────────────────────────────
    {
      id: 'cidr-notation-and-exceptions',
      order: 3,
      title: 'CIDR Notation, Block Sizing & the /31 and /32 Exceptions',
      shortDescription:
        'Count usable host addresses using CIDR prefix length, understand /31 point-to-point links (RFC 3021), and know when /32 host routes apply.',
      theory: {
        summary:
          'CIDR (Classless Inter-Domain Routing) replaces classful A/B/C boundaries with a variable-length prefix (/n) that compactly specifies the subnet size. /31 and /32 are mathematical exceptions with special RFC-defined semantics.',
        explanation: [
          '### C19: CIDR Notation & Block Sizing',
          '**CIDR (Classless Inter-Domain Routing)** uses a slash suffix to express the subnet mask length:',
          '```',
          '192.168.1.0/24  →  24 leading 1-bits in mask → 255.255.255.0',
          '10.0.0.0/8      →   8 leading 1-bits in mask → 255.0.0.0',
          '172.16.0.0/12   →  12 leading 1-bits in mask → 255.240.0.0',
          '```',
          '',
          '**Usable Host Count Formula** (for ordinary subnets /0 through /30):',
          '```',
          'Host bits = 32 - prefix_length',
          'Total addresses = 2^(host bits)',
          'Usable hosts = 2^(host bits) - 2',
          '  (subtract network address and broadcast address)',
          '',
          '/24 → host bits = 8 → 2^8 = 256 → 256 - 2 = 254 usable hosts',
          '/25 → host bits = 7 → 2^7 = 128 → 128 - 2 = 126 usable hosts',
          '/30 → host bits = 2 → 2^2 = 4   →   4 - 2 = 2 usable hosts',
          '```',
          '',
          '### C20: The /31 and /32 Exceptions',
          '',
          '**`/31` — Point-to-Point Links (RFC 3021)**:',
          '- Leaves 1 host bit (2^1 = 2 addresses). Under the standard host formula (2^H - 2), this would yield 0 usable hosts.',
          '- RFC 3021 establishes that on point-to-point links between two routers, **both addresses** are valid host endpoints without reserved network or broadcast addresses.',
          '- Example: `10.0.0.0/31` → Router A uses `10.0.0.0`, Router B uses `10.0.0.1`.',
          '- Common on ISP and WAN links to conserve IP space.',
          '',
          '**`/32` — Host Routes**:',
          '- A /32 identifies a **single specific host** (all 32 bits are the network prefix; 0 host bits).',
          '- Used for: loopback interfaces (`127.0.0.1/32`), traffic engineering, anycast virtual IPs.',
          '- `ip route 8.8.8.8/32 via 192.168.1.1` sends traffic to exactly one host via a specific next-hop.',
        ],
        keyTakeaway:
          'CIDR compresses routing tables and allows precise block sizing. The formula 2^(32-n) − 2 gives usable hosts for /0–/30. /31 is a valid RFC 3021 point-to-point exception; /32 identifies a single host.',
        exampleQuery: '',
        exampleQueryExplanation: '',
        mcqs: [
          {
            id: 'net04-mcq-cidr-count',
            question:
              'How many usable host IP addresses does a /26 subnet provide?',
            options: ['64', '62', '126', '30'],
            correctIndex: 1,
            explanation:
              '/26 → host bits = 32 - 26 = 6 → 2^6 = 64 total addresses → 64 - 2 = 62 usable hosts (subtract network address and broadcast address).',
          },
          {
            id: 'net04-mcq-31-exception',
            question:
              'An ISP uses a /31 between two routers. Which statement is correct?',
            options: [
              '/31 is invalid — no usable hosts exist after subtracting network and broadcast',
              'RFC 3021 permits /31 on point-to-point links; both addresses are usable by the two routers',
              '/31 provides 2 usable hosts through normal formula: 2^1 − 2 = 0, so broadcast is recycled',
              '/31 is only valid on loopback interfaces',
            ],
            correctIndex: 1,
            explanation:
              'RFC 3021 carves out an exception: on a /31 point-to-point link, there is no traditional network or broadcast concept. Both .0 and .1 addresses are assigned to the two peer interfaces.',
          },
        ],
      },
      tasks: [
        {
          id: 'net04-p3-cidr-sizing',
          title: 'Mastery Check: CIDR Block Sizing & Exception Rules',
          description:
            'Calculate usable hosts for given CIDR prefixes and identify correct /31 and /32 usage scenarios.',
          instructions: [
            'A network engineer must choose the right subnet size for three scenarios:',
            '  1. A department of 50 hosts needs its own subnet.',
            '  2. A WAN link between two routers needs exactly 2 addresses with no waste.',
            '  3. A traffic-engineering rule must route all packets to a single server at 203.0.113.5.',
          ],
          type: 'independent',
          primaryTable: '',
          initialSql: '',
          solutionSql: 'NETWORKING_JUDGMENT_TASK',
          solutionExplanation:
            'Scenario 1: /26 (62 usable hosts, smallest block ≥ 50). Scenario 2: /31 (RFC 3021 point-to-point). Scenario 3: /32 host route to a single IP.',
          hints: [
            {
              level: 1,
              text: 'For Scenario 1, find the smallest /n where 2^(32-n) − 2 ≥ 50.',
            },
            {
              level: 2,
              text: '/26 gives 62 hosts (just enough). /30 gives 2 hosts (WAN link). /31 gives RFC-exception 2 addresses. /32 is a host route.',
            },
          ],
          validation: {
            judgment: [
              {
                kind: 'choose-and-defend',
                prompt: 'Which CIDR prefix is the smallest that accommodates 50 hosts?',
                options: [
                  '/25 — provides 126 usable hosts (wasteful but valid)',
                  '/26 — provides 62 usable hosts (smallest block ≥ 50)',
                  '/27 — provides 30 usable hosts (too small)',
                  '/30 — provides 2 usable hosts (far too small)',
                ],
                correctIndex: 1,
                explanation:
                  '/27 gives only 30 usable hosts (insufficient). /26 gives 62 usable hosts — the smallest CIDR block that fits 50 devices. /25 is valid but wastes 76 addresses.',
              },
              {
                kind: 'choose-and-defend',
                prompt:
                  'For the WAN link between two routers needing exactly 2 usable addresses, which prefix and rule applies?',
                options: [
                  '/30 — standard formula: 2^2 − 2 = 2 usable hosts (network + broadcast consumed)',
                  '/31 — RFC 3021 point-to-point exception: both addresses usable, no network/broadcast overhead',
                  '/32 — each router gets its own /32 host route, paired together',
                  '/28 — wastes 14 addresses but is the most compatible choice',
                ],
                correctIndex: 1,
                explanation:
                  'Both /30 and /31 technically work for 2 routers. /31 (RFC 3021) is more efficient — it uses only 2 IP addresses total with no waste on a point-to-point link. /30 wastes 2 addresses on network/broadcast identifiers.',
              },
            ],
          },
          successMessage:
            'Perfect! /26 for 50 hosts, /31 for point-to-point WAN links (RFC 3021), and /32 for single-host traffic-engineering routes.',
        },
      ],
    },
  ],
  challenge: {
    id: 'net04-challenge',
    title: 'Module 4 Challenge: IPv4 Network Design & Analysis',
    scenario:
      'You are a junior network engineer at a company expanding its office network. You must analyze the existing IP scheme, calculate subnet capacities, and decide delivery paths for cross-subnet traffic.',
    tasks: [
      {
        id: 'net04-ch1-network-classification',
        title: 'Challenge Task 1: IP Address Classification',
        description:
          'Classify a set of IP addresses as public, RFC 1918 private, or special-use.',
        instructions: [
          'Classify each of the following IP addresses:',
          '  A) 172.17.0.50',
          '  B) 192.169.1.1',
          '  C) 10.0.0.1',
          '  D) 127.0.0.1',
        ],
        type: 'challenge',
        primaryTable: '',
        initialSql: '',
        solutionSql: 'NETWORKING_JUDGMENT_TASK',
        solutionExplanation:
          'A: Private (172.16–31 range). B: Public (192.169 is outside 192.168 private range). C: Private (10.0.0.0/8). D: Loopback/special-use (127.0.0.0/8).',
        hints: [
          {
            level: 1,
            text: 'RFC 1918 private ranges: 10.0.0.0/8, 172.16.0.0/12 (172.16–31), 192.168.0.0/16. Loopback: 127.0.0.0/8.',
          },
        ],
        validation: {
          judgment: [
            {
              kind: 'choose-and-defend',
              prompt: 'Which address is public (routable on the internet)?',
              options: [
                '172.17.0.50 — falls within RFC 1918 172.16.0.0/12',
                '10.0.0.1 — falls within RFC 1918 10.0.0.0/8',
                '192.169.1.1 — outside all RFC 1918 ranges, publicly routable',
                '127.0.0.1 — loopback, special-use',
              ],
              correctIndex: 2,
              explanation:
                '192.168.0.0/16 (private) covers 192.168.x.x only. 192.169.1.1 uses the 192.169 range, which is NOT in any RFC 1918 block, making it a public address.',
            },
          ],
        },
        successMessage:
          '172.17.x is private (172.16/12). 192.169.x is public. 10.x is private. 127.x is loopback. Well done!',
      },
      {
        id: 'net04-ch2-subnetting-calculation',
        title: 'Challenge Task 2: Subnet Host Capacity & Path Decision',
        description:
          'Calculate usable hosts for two subnets and determine the delivery path for an inter-subnet packet.',
        instructions: [
          'Office Network: 172.16.10.0/24 (Department A)',
          'Server Network: 172.16.20.0/23 (Data Center)',
          'Host: 172.16.10.50, Mask: 255.255.255.0, Gateway: 172.16.10.1',
          '',
          'Question 1: How many usable hosts does the /23 Data Center subnet support?',
          'Question 2: When the host at 172.16.10.50 sends a packet to 172.16.20.100, is the delivery local or remote?',
        ],
        type: 'challenge',
        primaryTable: '',
        initialSql: '',
        solutionSql: 'NETWORKING_JUDGMENT_TASK',
        solutionExplanation:
          '/23 has host bits = 9 → 2^9 - 2 = 510 usable hosts. 172.16.10.50 AND 255.255.255.0 = 172.16.10.0 ≠ 172.16.20.0 → remote, sends to gateway.',
        hints: [
          {
            level: 1,
            text: 'For /23: host bits = 32 - 23 = 9. For local/remote: the host uses mask 255.255.255.0 (/24), not the destination subnet mask.',
          },
          {
            level: 2,
            text: '2^9 = 512 - 2 = 510. The host applies ITS OWN mask (255.255.255.0) to both IPs: 172.16.10.x → local; 172.16.20.x → different → remote.',
          },
        ],
        validation: {
          judgment: [
            {
              kind: 'choose-and-defend',
              prompt: 'How many usable host addresses does the /23 subnet provide?',
              options: [
                '254 — same as /24',
                '510 — 2^(32-23) - 2 = 512 - 2',
                '512 — 2^9 with no subtraction needed',
                '1022 — 2^10 - 2',
              ],
              correctIndex: 1,
              explanation:
                '/23 → host bits = 32 - 23 = 9 → 2^9 = 512 total addresses → 512 - 2 = 510 usable hosts.',
            },
            {
              kind: 'choose-and-defend',
              prompt:
                'When 172.16.10.50/24 sends to 172.16.20.100, is the delivery local or remote?',
              options: [
                'Local — both are in the 172.16.0.0/12 private range',
                'Remote — the host applies its own /24 mask: 172.16.10.0 ≠ 172.16.20.0, so it routes via gateway',
                'Local — the destination /23 subnet contains the host',
                'Remote — 172.16.20.100 is a server, servers are always remote',
              ],
              correctIndex: 1,
              explanation:
                'The host applies ITS OWN mask (255.255.255.0). My Network = 172.16.10.0; Dest Network = 172.16.20.100 AND 255.255.255.0 = 172.16.20.0. Different → remote → packet goes to gateway 172.16.10.1.',
            },
          ],
        },
        successMessage:
          '/23 provides 510 usable hosts. The packet to 172.16.20.100 is remote — the host uses its own /24 mask to decide, not the destination subnet size.',
      },
    ],
  },
};
