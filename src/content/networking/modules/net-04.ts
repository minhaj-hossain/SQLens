import { ModuleData } from '../../../types/curriculum';

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
