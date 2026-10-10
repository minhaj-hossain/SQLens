import { ModuleData } from '../../../types/curriculum';

/**
 * net-06: IPv6 Fundamentals & Neighbor Discovery
 * ─────────────────────────────────────────────────────────────────────────────
 * Milestone 3 — Concepts C24a, C24b, C24c, C24d, C24e
 * Teaches IPv6 128-bit hex notation and zero compression, IPv6 address scopes
 * (Global Unicast vs Link-Local), the absence of broadcast and solicited-node
 * multicast groups, the Neighbor Discovery Protocol (NDP: NS/NA replacing ARP),
 * and SLAAC router solicitation/advertisement for autoconfiguration.
 */

export const NET_06_MODULE: ModuleData = {
  id: 'net-06',
  slug: 'ipv6-and-neighbor-discovery',
  day: 6,
  title: 'Module 6: IPv6 Fundamentals & Neighbor Discovery',
  shortTitle: 'IPv6 & NDP',
  type: 'module',
  track: 'networking',
  milestoneId: 'net-milestone-2',
  description:
    'Explore the IPv6 address architecture — 128-bit hex notation and zero compression, address scopes, multicast-based neighbor discovery, and stateless address autoconfiguration (SLAAC).',
  estimatedMinutes: 35,
  curriculumOrder: 6,
  displayLabel: 'Module 6',
  completionLearnings: [
    'IPv6 addresses are 128 bits written as eight 16-bit colon-separated hex groups; double-colon (::) compresses consecutive all-zero groups',
    'Link-local addresses (fe80::/10) are auto-generated on every interface and never routed; Global Unicast addresses (2000::/3) are the routable equivalent of public IPv4',
    'IPv6 eliminates broadcast entirely; neighbor communication uses targeted solicited-node multicast groups instead',
    'NDP Neighbor Solicitation (NS) and Neighbor Advertisement (NA) replace ARP for IPv6 link-layer address resolution',
    'SLAAC (Router Solicitation / Router Advertisement) allows interfaces to self-configure a Global Unicast address without a DHCP server',
  ],
  concepts: [
    // ─────────────────────────────────────────────────────
    // Concept 1: 128-bit Notation & Zero Compression (C24a)
    // ─────────────────────────────────────────────────────
    {
      id: 'ipv6-notation-compression',
      order: 1,
      title: 'IPv6 128-bit Hex Notation & Zero Compression (::)',
      shortDescription:
        'Read and write IPv6 addresses in full expanded form and apply zero-compression rules to produce the canonical short form.',
      theory: {
        summary:
          'An IPv6 address is 128 bits written as eight 16-bit groups in hexadecimal, separated by colons. Two rules allow shortening: leading zeros within a group are dropped, and a single run of consecutive all-zero groups is replaced by a double colon (::).',
        explanation: [
          '### C24a: IPv6 128-bit Hex Notation & Zero Compression',
          '',
          '**Full Expanded Form** (128 bits = 8 × 16 bits):',
          '```',
          '2001:0db8:0000:0000:0000:0000:0001:0002',
          '│    │    │    │    │    │    │    │',
          '└────┴────┴────┴────┴────┴────┴────┴── 8 groups of 4 hex digits (16 bits each)',
          '```',
          '',
          '**Rule 1 — Omit Leading Zeros Within a Group**:',
          '```',
          '0db8 → db8        (drop the leading zero)',
          '0000 → 0          (only one zero remains)',
          '0001 → 1',
          '2001:db8:0:0:0:0:1:2',
          '```',
          '',
          '**Rule 2 — Double Colon (::) for Consecutive All-Zero Groups**:',
          '- Replace the **longest single run** of consecutive all-zero groups with `::`.  ',
          '- The `::` can appear **at most once** per address (ambiguity would result otherwise).',
          '```',
          '2001:db8:0:0:0:0:1:2',
          '      └──────────┘ four consecutive zero groups → replaced by ::',
          '2001:db8::1:2    ← canonical short form',
          '```',
          '',
          '**Canonical Examples**:',
          '| Full Expanded | Short Form | Notes |',
          '|---|---|---|',
          '| `0000:0000:0000:0000:0000:0000:0000:0001` | `::1` | Loopback |',
          '| `fe80:0000:0000:0000:1234:5678:9abc:def0` | `fe80::1234:5678:9abc:def0` | Link-local |',
          '| `2001:0db8:0000:0042:0000:0000:0000:1234` | `2001:db8:0:42::1234` | Mixed zeros |',
          '',
          '**Expansion back to full form** (what software does internally): for each `::`, count existing groups and insert enough all-zero groups to reach exactly 8 total.',
        ],
        keyTakeaway:
          'IPv6 short form: drop leading zeros per group; replace the longest consecutive run of all-zero groups with :: (at most once per address).',
        exampleQuery: '',
        exampleQueryExplanation: '',
        mcqs: [
          {
            id: 'net06-mcq-compress',
            question: 'Which is the correct canonical short form for 2001:0db8:0000:0000:abcd:0000:0000:0001?',
            options: [
              '2001:db8::abcd::1 (double :: used twice)',
              '2001:db8:0:0:abcd::1 (compress the shorter run, not the longer one first)',
              '2001:db8::abcd:0:0:1 (compress the first zero run; leave later zeros)',
              '2001:db8:0:0:abcd::1 — but this is wrong because the first run is shorter',
            ],
            correctIndex: 2,
            explanation:
              'Two runs of zeros exist: `0000:0000` (positions 3–4) and `0000:0000` (positions 6–7). When tied, convention compresses the FIRST run. The second run `0000:0000` (positions 6–7) is also a run of 2 groups — but we can only use :: once. One valid canonical form is `2001:db8::abcd:0:0:1` (compressing the first run). The :: replaces the first `0000:0000`.',
          },
          {
            id: 'net06-mcq-expand',
            question: 'How many all-zero groups does :: represent in the address fe80::1?',
            options: [
              '1 group (fe80:0000:1)',
              '6 groups — total 8 groups: fe80 + 6×0000 + 1',
              '5 groups — fe80 already counts as 2 groups',
              '7 groups — the :: always represents the maximum possible zeros',
            ],
            correctIndex: 1,
            explanation:
              'fe80::1 has 2 explicit groups (fe80 and 0001). Total must be 8 groups: 8 - 2 = 6 all-zero groups. Expanded: fe80:0000:0000:0000:0000:0000:0000:0001.',
          },
        ],
      },
      tasks: [
        {
          id: 'net06-p1-ipv6-notation',
          title: 'Guided Practice: IPv6 Compression & Expansion',
          description:
            'Apply zero-compression rules to shorten IPv6 addresses, and expand a short form back to its full 128-bit representation.',
          instructions: [
            'Task A — Compress: 2001:0db8:0000:0000:0000:ff00:0042:8329',
            'Task B — Expand: ::ffff:192.0.2.1 (IPv4-mapped IPv6 address)',
            'Task C — Identify the error: 2001:db8::1::2 — why is this invalid?',
          ],
          type: 'guided',
          primaryTable: '',
          initialSql: '',
          solutionSql: 'NETWORKING_JUDGMENT_TASK',
          solutionExplanation:
            'A: 2001:db8::ff00:42:8329. B: 0000:0000:0000:0000:0000:ffff:c000:0201. C: Two :: in one address is invalid — the parser cannot determine how many zeros each represents.',
          hints: [
            { level: 1, text: 'For Task A: find the longest run of consecutive all-zero groups. Drop leading zeros within each remaining group.' },
            { level: 2, text: 'A: three consecutive 0000 groups → ::. Result: 2001:db8::ff00:42:8329. C: :: can appear exactly once per address.' },
          ],
          validation: {
            judgment: [
              {
                kind: 'choose-and-defend',
                prompt: 'What is the correct canonical short form of 2001:0db8:0000:0000:0000:ff00:0042:8329?',
                options: [
                  '2001:db8:0:0:0:ff00:42:8329 (leading zeros dropped but no :: used)',
                  '2001:db8::ff00:42:8329 (three consecutive zero groups → ::)',
                  '2001:db8::ff00::8329 (compress both runs of zeros)',
                  '2001:0db8::ff00:42:8329 (leading zeros not dropped in first group)',
                ],
                correctIndex: 1,
                explanation:
                  'Dropping leading zeros: 0db8→db8, 0042→42. Three consecutive 0000 groups become ::. Result: 2001:db8::ff00:42:8329. The double-colon replaces exactly the three zero groups.',
              },
              {
                kind: 'choose-and-defend',
                prompt: 'Why is 2001:db8::1::2 an invalid IPv6 address?',
                options: [
                  'Because :: can only appear at the start of an address',
                  'Because it would be ambiguous — no way to determine how many zeros each :: represents',
                  'Because 2001:db8 is a documentation prefix and cannot be used in practice',
                  'Because the address has too many groups after expansion',
                ],
                correctIndex: 1,
                explanation:
                  'The :: is a wildcard for zero groups. With two :: in one address, there is no deterministic way to split the zero groups between them. RFC 5952 mandates at most one :: per address.',
              },
            ],
          },
          successMessage:
            'Excellent! Drop leading zeros first; use :: for the longest zero run; only one :: per address. These are the canonical RFC 5952 rules.',
        },
      ],
    },

    // ─────────────────────────────────────────────────────
    // Concept 2: IPv6 Address Scopes (C24b + C24c)
    // ─────────────────────────────────────────────────────
    {
      id: 'ipv6-address-scopes',
      order: 2,
      title: 'IPv6 Address Scopes & the End of Broadcast',
      shortDescription:
        'Distinguish Global Unicast from Link-Local addresses, and understand why IPv6 eliminated broadcast in favour of targeted multicast.',
      theory: {
        summary:
          'IPv6 defines strict address scopes. Link-local addresses (fe80::/10) are generated automatically, never routed, and used for on-link neighbor discovery. Global Unicast addresses (2000::/3) are globally routable. IPv6 has NO broadcast — solicited-node multicast groups ensure efficient neighbor resolution without flooding every host.',
        explanation: [
          '### C24b: IPv6 Scopes — Global Unicast vs Link-Local',
          '',
          '**Link-Local Addresses (fe80::/10)**:',
          '- Prefix: `fe80::` through `febf::` (first 10 bits = 1111111010)',
          '- **Automatically configured** on every IPv6-enabled interface at boot, derived from the MAC address (EUI-64) or randomly.',
          '- **Never forwarded by routers** — strictly on-link communication only.',
          '- Essential for: NDP neighbor discovery, router solicitation, DHCPv6 discovery.',
          '- Example: `fe80::1234:5678:9abc:def0`',
          '',
          '**Global Unicast Addresses (2000::/3)**:',
          '- Prefix: `2000::` through `3fff::` (first 3 bits = 001)',
          '- The publicly routable IPv6 address space — the equivalent of public IPv4 addresses.',
          '- Assigned by ISPs and regional Internet registries (RIRs).',
          '- Example: `2001:db8:85a3::8a2e:370:7334` (documentation range)',
          '',
          '**Other Notable Scopes**:',
          '| Prefix | Scope | Purpose |',
          '|---|---|---|',
          '| `::1` | Loopback | Host self-reference (same as IPv4 127.0.0.1) |',
          '| `fe80::/10` | Link-local | On-link only, never routed |',
          '| `fc00::/7` | Unique-local | Private (RFC 4193), similar to RFC 1918 |',
          '| `ff00::/8` | Multicast | One-to-many delivery |',
          '| `2000::/3` | Global Unicast | Publicly routable |',
          '',
          '### C24c: Absence of Broadcast & Solicited-Node Multicast',
          '',
          '**No IPv6 Broadcast**:',
          'IPv4 ARP used `FF:FF:FF:FF:FF:FF` Ethernet broadcast — every host on the segment woke up to process every ARP packet. In large subnets this could be thousands of devices interrupted per ARP.',
          '',
          '**IPv6 Solution: Solicited-Node Multicast Groups**:',
          'Each IPv6 interface automatically joins a **solicited-node multicast group** derived from its own address:',
          '```',
          'Formula: ff02::1:ff<last 24 bits of IPv6 address>',
          '',
          'Example: Interface with address 2001:db8::1234:5678',
          '  Last 24 bits of address: 34:56:78',
          '  Solicited-node multicast: ff02::1:ff34:5678',
          '```',
          '',
          '**How NDP uses this**:',
          'Instead of broadcasting "Who has 2001:db8::1234:5678?", the querying host sends a Neighbor Solicitation to **only** `ff02::1:ff34:5678`.',
          '- Only the interface(s) with that specific solicited-node multicast group process the packet.',
          '- In a /64 subnet with 10,000 hosts, only 1 host (or very rarely a few) is interrupted.',
          '- This is dramatically more efficient than IPv4 ARP broadcast.',
        ],
        keyTakeaway:
          'Link-local (fe80::/10) addresses are auto-configured, on-link only, and drive NDP. Global Unicast (2000::/3) are publicly routable. IPv6 replaces broadcast with solicited-node multicast — only the target host processes neighbor queries.',
        exampleQuery: '',
        exampleQueryExplanation: '',
        mcqs: [
          {
            id: 'net06-mcq-link-local',
            question:
              'A host has two IPv6 addresses: fe80::1 and 2001:db8::50. A packet arrives from outside the network destined for fe80::1. What does the router do?',
            options: [
              'Forwards the packet normally — fe80::1 is a valid IPv6 address',
              'Drops or does not forward the packet — link-local addresses are never routed beyond the local link',
              'Substitutes 2001:db8::50 as the destination and forwards correctly',
              'Sends an ICMPv6 error to the sender asking for a Global Unicast address',
            ],
            correctIndex: 1,
            explanation:
              'Link-local addresses (fe80::/10) are strictly on-link. Routers MUST NOT forward packets with a link-local source or destination to other network segments. Packets destined for fe80:: addresses are discarded by routers.',
          },
          {
            id: 'net06-mcq-no-broadcast',
            question:
              'Why does IPv6 use solicited-node multicast instead of broadcasting Neighbor Solicitations?',
            options: [
              'Because IPv6 multicast is faster than Ethernet broadcast at the hardware level',
              'To limit interruptions: only the target host (with a matching solicited-node group) processes the NS — other hosts ignore it entirely',
              'Because Ethernet hardware does not support broadcast frames longer than 512 bytes',
              'IPv6 does use broadcast, but calls it "multicast all-nodes" for compatibility',
            ],
            correctIndex: 1,
            explanation:
              'IPv6 solicited-node multicast derives a unique group from each interface address. Only the 1–2 hosts with matching groups are interrupted. In a 10,000-host subnet, IPv4 ARP would wake all 10,000 hosts; IPv6 NDP wakes ~1.',
          },
        ],
      },
      tasks: [
        {
          id: 'net06-p2-scope-classification',
          title: 'Independent Practice: IPv6 Scope Classification',
          description:
            'Classify IPv6 addresses by scope and predict router behaviour for each.',
          instructions: [
            'Classify each IPv6 address and predict whether a router will forward a packet destined for it:',
            '  A) fe80::1abc:2def',
            '  B) 2001:db8:1::100',
            '  C) ::1',
            '  D) fc00::a:b:c:d',
            '  E) ff02::1:ff34:5678',
          ],
          type: 'independent',
          primaryTable: '',
          initialSql: '',
          solutionSql: 'NETWORKING_JUDGMENT_TASK',
          solutionExplanation:
            'A: Link-local — not forwarded. B: Global Unicast — routed. C: Loopback — never leaves host. D: Unique-local (fc00::/7) — private, typically not globally routed. E: Solicited-node multicast — not unicast-routed.',
          hints: [
            { level: 1, text: 'Scope clues: fe80:: = link-local; 2xxx–3xxx = global unicast; ::1 = loopback; fc/fd = unique-local; ff = multicast.' },
            { level: 2, text: 'Routers forward Global Unicast (2000::/3) and some Unique-Local across site boundaries. Link-local, loopback, and multicast are never unicast-routed.' },
          ],
          validation: {
            judgment: [
              {
                kind: 'choose-and-defend',
                prompt: 'Which of the listed addresses would a standard internet router forward to a remote network?',
                options: [
                  'fe80::1abc:2def — link-local, auto-generated',
                  '2001:db8:1::100 — Global Unicast, publicly routable',
                  '::1 — loopback, host-internal only',
                  'ff02::1:ff34:5678 — solicited-node multicast',
                ],
                correctIndex: 1,
                explanation:
                  '2001:db8:1::100 uses the 2001:: prefix within the Global Unicast range (2000::/3), making it publicly routable. The others are link-local, loopback, or multicast — none of which routers forward as unicast routes.',
              },
            ],
          },
          successMessage:
            'Perfect scope classification! Only Global Unicast addresses are forwarded by internet routers. Link-local, loopback, and multicast stay on-link or local.',
        },
      ],
    },

    // ─────────────────────────────────────────────────────
    // Concept 3: NDP (C24d) + SLAAC (C24e)
    // ─────────────────────────────────────────────────────
    {
      id: 'ndp-and-slaac',
      order: 3,
      title: 'NDP: Neighbor Solicitation/Advertisement & SLAAC Autoconfiguration',
      shortDescription:
        'Trace an NDP Neighbor Solicitation (NS) / Neighbor Advertisement (NA) exchange and understand how SLAAC uses Router Advertisement to self-configure a Global Unicast address.',
      theory: {
        summary:
          'NDP (Neighbor Discovery Protocol, RFC 4861) replaces ARP with ICMPv6 Neighbor Solicitation (NS) and Neighbor Advertisement (NA) messages using solicited-node multicast. SLAAC adds stateless autoconfiguration: a host sends a Router Solicitation (RS), receives a Router Advertisement (RA) with a /64 prefix, and combines it with a host-specific Interface ID to form a complete Global Unicast address.',
        explanation: [
          '### C24d: NDP — Neighbor Solicitation (NS) & Neighbor Advertisement (NA)',
          '',
          '**Goal**: Host A (2001:db8::1) wants to reach Host B (2001:db8::2). A does not know B\'s MAC address.',
          '',
          '**Step 1 — Neighbor Solicitation (NS)**:',
          '```',
          'A sends ICMPv6 Type 135 (NS) to B\'s solicited-node multicast group:',
          '',
          '  IPv6 Dst:  ff02::1:ff00:0002  ← solicited-node multicast for ::2',
          '  ICMPv6:    NS "Who is 2001:db8::2? Tell 2001:db8::1."',
          '  Option:    Source Link-Layer Address (SLLA) = AA:AA:AA:AA:AA:AA',
          '```',
          '',
          '**Step 2 — Neighbor Advertisement (NA)**:',
          '```',
          'B sends ICMPv6 Type 136 (NA) unicast back to A:',
          '',
          '  IPv6 Dst:  2001:db8::1   ← unicast back to questioner',
          '  ICMPv6:    NA "I am 2001:db8::2. My MAC is BB:BB:BB:BB:BB:BB."',
          '  Option:    Target Link-Layer Address (TLLA) = BB:BB:BB:BB:BB:BB',
          '```',
          '',
          '**NDP Neighbor Cache** (equivalent of ARP cache):',
          '- Stores 2001:db8::2 → BB:BB:BB:BB:BB:BB with state REACHABLE.',
          '- States: INCOMPLETE → REACHABLE → STALE → DELAY → PROBE → (expire).',
          '',
          '### C24e: SLAAC — Stateless Address Autoconfiguration',
          '',
          '**The Problem SLAAC Solves**: In IPv4, hosts need a DHCP server to get an IP address, mask, gateway, and DNS. SLAAC lets IPv6 hosts self-configure a Global Unicast address without any server.',
          '',
          '**SLAAC Exchange**:',
          '',
          '**1. Router Solicitation (RS) — ICMPv6 Type 133**:',
          '   Host sends RS to all-routers multicast `ff02::2` shortly after link comes up:',
          '   *"Is there a router? Please advertise your prefix."*',
          '',
          '**2. Router Advertisement (RA) — ICMPv6 Type 134**:',
          '   Router replies to all-nodes multicast `ff02::1` (or unicast back):',
          '   ```',
          '   RA contains:',
          '     Prefix:         2001:db8:1::/64   (network prefix)',
          '     Prefix lifetime: 2592000s (30 days valid, 604800s preferred)',
          '     Router address: fe80::1  (gateway link-local)',
          '     DNS servers:    (optional RDNSS option)',
          '   ```',
          '',
          '**3. Interface ID Generation**:',
          '   Host takes the /64 prefix from RA + generates a 64-bit Interface ID:',
          '   - **EUI-64**: derived from MAC (insert `ff:fe` into MAC and flip U/L bit).',
          '   - **Random (RFC 8981 Privacy Extensions)**: random 64-bit value, rotated periodically.',
          '',
          '**4. Duplicate Address Detection (DAD)**:',
          '   Host sends NS for its own tentative address. If anyone replies → conflict → generate new ID.',
          '',
          '**5. Complete Address**:',
          '   ```',
          '   Prefix from RA:    2001:db8:1::',
          '   Interface ID:             ::aabb:ccdd:eeff:1122',
          '   Full address:      2001:db8:1:0:aabb:ccdd:eeff:1122/64',
          '   Gateway:          fe80::1 (from RA)',
          '   ```',
        ],
        keyTakeaway:
          'NDP replaces ARP: NS/NA use solicited-node multicast for efficient MAC resolution. SLAAC uses RS/RA to autoconfigure a complete IPv6 address from a router-advertised prefix — no DHCP required.',
        exampleQuery: '',
        exampleQueryExplanation: '',
        mcqs: [
          {
            id: 'net06-mcq-ns-type',
            question:
              'Which ICMPv6 message type does a host send to resolve an IPv6 neighbor\'s MAC address?',
            options: [
              'Type 128 — Echo Request (ping)',
              'Type 135 — Neighbor Solicitation (NS)',
              'Type 136 — Neighbor Advertisement (NA)',
              'Type 133 — Router Solicitation (RS)',
            ],
            correctIndex: 1,
            explanation:
              'ICMPv6 Type 135 is the Neighbor Solicitation — the NDP equivalent of an ARP Request. It is sent to the target\'s solicited-node multicast group asking for its link-layer address.',
          },
          {
            id: 'net06-mcq-slaac-prefix',
            question:
              'A host receives an RA with prefix 2001:db8:cafe::/64 and generates an EUI-64 Interface ID of 0200:5eff:fe00:1234. What is the complete SLAAC address?',
            options: [
              '2001:db8:cafe::0200:5eff:fe00:1234/64',
              '2001:db8:cafe:0200:5eff:fe00:1234::/64 — prefix first, ID last',
              '2001:db8:cafe:1::/64 — prefix incremented by EUI-64',
              '2001:db8:cafe:0:200:5eff:fe00:1234/64',
            ],
            correctIndex: 0,
            explanation:
              'SLAAC concatenates the /64 prefix (2001:db8:cafe:0000) with the 64-bit Interface ID (0200:5eff:fe00:1234): 2001:db8:cafe::200:5eff:fe00:1234/64. (Leading zero in 0200 is dropped to 200 in short form.)',
          },
        ],
      },
      tasks: [
        {
          id: 'net06-p3-ndp-slaac',
          title: 'Mastery Check: NDP Exchange & SLAAC Address Construction',
          description:
            'Trace an NDP NS/NA exchange and construct the SLAAC address from a received Router Advertisement.',
          instructions: [
            'Scenario 1 — NDP:',
            '  Host Alpha (2001:db8:1::10, MAC AA:BB:CC:11:22:33) wants to reach',
            '  Host Beta (2001:db8:1::20, MAC DD:EE:FF:44:55:66).',
            '  Alpha has no entry for Beta in its Neighbor Cache.',
            '',
            'Scenario 2 — SLAAC:',
            '  A freshly booted laptop receives an RA with:',
            '    Prefix: 2001:db8:abc::/64, Router: fe80::1',
            '    Its generated Interface ID: 0123:4567:89ab:cdef',
          ],
          type: 'challenge',
          primaryTable: '',
          initialSql: '',
          solutionSql: 'NETWORKING_JUDGMENT_TASK',
          solutionExplanation:
            'Scenario 1: Alpha sends NS (ICMPv6 Type 135) to ff02::1:ff00:0020 (Beta\'s solicited-node multicast). Beta replies with NA (Type 136) unicast to Alpha, containing its MAC DD:EE:FF:44:55:66. Scenario 2: SLAAC address = 2001:db8:abc:0:123:4567:89ab:cdef/64; Gateway = fe80::1.',
          hints: [
            { level: 1, text: 'NDP NS → solicited-node multicast (ff02::1:ff + last 24 bits of target). NA → unicast back to questioner.' },
            { level: 2, text: 'SLAAC: prefix (first 64 bits from RA) + interface ID (last 64 bits self-generated). 0123 drops leading zero → 123.' },
          ],
          validation: {
            judgment: [
              {
                kind: 'choose-and-defend',
                prompt: 'In Scenario 1, to what IPv6 destination does Alpha send the Neighbor Solicitation?',
                options: [
                  'ff02::1 — all-nodes multicast, like an IPv6 broadcast',
                  'ff02::1:ff00:0020 — the solicited-node multicast group for Beta\'s address ::20',
                  '2001:db8:1::20 — unicast to Beta\'s Global Unicast address',
                  'ff02::2 — all-routers multicast',
                ],
                correctIndex: 1,
                explanation:
                  'The solicited-node multicast group for 2001:db8:1::20 is formed by taking the last 24 bits of the address (00:00:20) and prepending ff02::1:ff → ff02::1:ff00:0020. This ensures only Beta (and any other host with the same last 24 bits) processes the NS.',
              },
              {
                kind: 'choose-and-defend',
                prompt: 'In Scenario 2, what is the complete SLAAC address the laptop assigns to itself?',
                options: [
                  '2001:db8:abc::1/64 — first available host address in the prefix',
                  '2001:db8:abc:0:123:4567:89ab:cdef/64 — prefix concatenated with the Interface ID',
                  '2001:db8:abc:0123:4567:89ab:cdef::/64 — interface ID placed in the prefix position',
                  'fe80::123:4567:89ab:cdef — uses the link-local prefix since SLAAC is on-link',
                ],
                correctIndex: 1,
                explanation:
                  'SLAAC constructs: [/64 prefix = 2001:db8:abc:0000] + [Interface ID = 0123:4567:89ab:cdef] = 2001:db8:abc:0:123:4567:89ab:cdef/64. The leading zero in 0123 is dropped to 123 in the short form. The gateway is the router\'s link-local address fe80::1.',
              },
            ],
          },
          successMessage:
            'Excellent mastery! NDP NS → solicited-node multicast → NA unicast back. SLAAC = RA prefix + self-generated Interface ID. No DHCP server required!',
        },
      ],
    },
  ],
};
