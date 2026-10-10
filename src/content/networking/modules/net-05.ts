import { ModuleData } from '../../../types/curriculum';

/**
 * net-05: Address Resolution Protocol (ARP) & Local Delivery
 * ─────────────────────────────────────────────────────────────────────────────
 * Milestone 3 — Concepts C21, C22, C23
 * Teaches the ARP Request/Reply exchange that resolves IP addresses to MAC
 * addresses on the local subnet, how the ARP cache stores and expires mappings,
 * Gratuitous ARP (GARP), and how subnet mask mismatch causes asymmetric and
 * one-way communication failures.
 */

export const NET_05_MODULE: ModuleData = {
  id: 'net-05',
  slug: 'arp-and-local-delivery',
  day: 5,
  title: 'Module 5: ARP & Local IP-to-MAC Resolution',
  shortTitle: 'ARP & Local Delivery',
  type: 'module',
  track: 'networking',
  milestoneId: 'net-milestone-2',
  description:
    'Learn how the Address Resolution Protocol bridges the gap between Layer 3 IP addresses and Layer 2 MAC addresses, enabling direct local delivery within a subnet.',
  estimatedMinutes: 25,
  curriculumOrder: 5,
  displayLabel: 'Module 5',
  completionLearnings: [
    'ARP resolves an IP address to a MAC address on the local subnet using a broadcast Request and a unicast Reply',
    'The ARP cache stores IP-to-MAC mappings to avoid repeated broadcasts; entries expire after ~20–120 seconds',
    'Gratuitous ARP (GARP) announces a new MAC binding to all neighbors without a prior request (used at startup and after failover)',
    'A subnet mask mismatch causes one-way or zero-way communication: the misconfigured host misidentifies local vs remote traffic',
  ],
  concepts: [
    // ─────────────────────────────────────────────────────
    // Concept 1: ARP Request / Reply Exchange (C21)
    // ─────────────────────────────────────────────────────
    {
      id: 'arp-request-reply',
      order: 1,
      title: 'ARP Request & Reply: Bridging IP and MAC',
      shortDescription:
        'Trace the two-message ARP exchange that maps an IP address to a MAC address on the local link.',
      theory: {
        summary:
          'When a host knows the destination IP but not its MAC address, it sends an ARP Request broadcast. The target host responds with a unicast ARP Reply containing its MAC address.',
        explanation: [
          '### C21: ARP — Local IP-to-MAC Resolution',
          'In Module 4, we learned that a host performing local delivery must ARP for the destination IP. **Why?**',
          '- The IP stack knows the destination IP (e.g. `192.168.1.200`).',
          '- But Ethernet frames require a **48-bit MAC address** as the destination.',
          '- The host does not know the destination MAC, so it asks the network: *"Who has 192.168.1.200?"*',
          '',
          '**ARP Request (Broadcast)**:',
          'The sender broadcasts an ARP Request to **all hosts** on the local segment:',
          '```',
          'Ethernet Frame:',
          '  Dst MAC:  FF:FF:FF:FF:FF:FF  ← broadcast to ALL hosts',
          '  Src MAC:  AA:AA:AA:AA:AA:AA  ← sender\'s MAC',
          '',
          'ARP Payload:',
          '  Operation:          REQUEST (who-has)',
          '  Sender IP:          192.168.1.100  (questioner)',
          '  Sender MAC:         AA:AA:AA:AA:AA:AA',
          '  Target IP:          192.168.1.200  (whose MAC we want)',
          '  Target MAC:         00:00:00:00:00:00  (unknown — filled by responder)',
          '```',
          '',
          '**ARP Reply (Unicast)**:',
          'The host with IP `192.168.1.200` sends a **unicast** ARP Reply directly back to the questioner:',
          '```',
          'Ethernet Frame:',
          '  Dst MAC:  AA:AA:AA:AA:AA:AA  ← back to the original requester',
          '  Src MAC:  BB:BB:BB:BB:BB:BB  ← responder\'s MAC',
          '',
          'ARP Payload:',
          '  Operation:   REPLY (is-at)',
          '  Sender IP:   192.168.1.200',
          '  Sender MAC:  BB:BB:BB:BB:BB:BB  ← the answer!',
          '  Target IP:   192.168.1.100',
          '  Target MAC:  AA:AA:AA:AA:AA:AA',
          '```',
          '',
          '**Key Observations**:',
          '1. ARP Requests are **broadcast** — every host on the local segment receives them.',
          '2. ARP Replies are **unicast** — only the questioner receives the answer.',
          '3. ARP is **local-only** — it only works within a single broadcast domain. Routers do NOT forward ARP broadcasts.',
          '4. The switch learns both hosts\' MACs from the frames, populating its CAM table.',
        ],
        keyTakeaway:
          'ARP bridges Layer 3 (IP) and Layer 2 (MAC): a broadcast Request asks "Who has this IP?" and a unicast Reply answers "I have it, here is my MAC."',
        exampleQuery: '',
        exampleQueryExplanation: '',
        mcqs: [
          {
            id: 'net05-mcq-arp-type',
            question: 'An ARP Request is sent as a ______ frame; an ARP Reply is sent as a ______ frame.',
            options: [
              'Unicast; Broadcast',
              'Broadcast; Unicast',
              'Broadcast; Broadcast',
              'Unicast; Unicast',
            ],
            correctIndex: 1,
            explanation:
              'ARP Requests use destination MAC FF:FF:FF:FF:FF:FF (broadcast) to reach all hosts on the segment. Once the target is identified, it sends a unicast ARP Reply directly to the requester.',
          },
          {
            id: 'net05-mcq-arp-scope',
            question: 'Host A (192.168.1.50) wants to reach Host C (10.0.0.5) on a different network. Does A send an ARP Request for 10.0.0.5?',
            options: [
              'Yes — ARP is used for all IP communication regardless of subnet',
              'No — A sends an ARP Request for the default gateway MAC, not for 10.0.0.5 directly',
              'No — A uses DNS to resolve 10.0.0.5 before sending any frames',
              'Yes — the ARP Request is routed across subnets by the default gateway',
            ],
            correctIndex: 1,
            explanation:
              'ARP is strictly local. When the destination is on a different subnet, the IP stack detects this via the subnet AND test, then ARPs for the default gateway\'s MAC instead. The router handles the cross-subnet forwarding.',
          },
        ],
      },
      tasks: [
        {
          id: 'net05-p1-arp-exchange',
          title: 'Guided Practice: Trace an ARP Request/Reply Exchange',
          description:
            'Identify which host sends the ARP Request, which sends the ARP Reply, and what information each message contains.',
          instructions: [
            'Host A (IP: 192.168.10.10, MAC: AA:AA:AA:AA:AA:AA) wants to send data to Host B (IP: 192.168.10.20, MAC: BB:BB:BB:BB:BB:BB).',
            'Host A has no entry for 192.168.10.20 in its ARP cache.',
            'Both hosts are on the same /24 subnet with no router between them.',
          ],
          type: 'guided',
          primaryTable: '',
          initialSql: '',
          solutionSql: 'NETWORKING_JUDGMENT_TASK',
          solutionExplanation:
            'Host A broadcasts ARP Request to FF:FF:FF:FF:FF:FF asking "Who has 192.168.10.20?". Host B sends unicast ARP Reply to AA:AA:AA:AA:AA:AA with its MAC BB:BB:BB:BB:BB:BB.',
          hints: [
            { level: 1, text: 'ARP Requests always use the Ethernet broadcast address FF:FF:FF:FF:FF:FF.' },
            { level: 2, text: 'After the ARP Reply, Host A records BB:BB:BB:BB:BB:BB → 192.168.10.20 in its ARP cache.' },
          ],
          validation: {
            judgment: [
              {
                kind: 'choose-and-defend',
                prompt: 'What destination MAC address does Host A use in the ARP Request frame?',
                options: [
                  'BB:BB:BB:BB:BB:BB (Host B\'s MAC) — because A knows B is local',
                  'FF:FF:FF:FF:FF:FF — Ethernet broadcast to reach all hosts on the segment',
                  '00:00:00:00:00:00 — placeholder for unknown MACs',
                  'Host A\'s own MAC AA:AA:AA:AA:AA:AA — ARP is sent to oneself first',
                ],
                correctIndex: 1,
                explanation:
                  'The whole point of ARP is that Host A does NOT yet know Host B\'s MAC. It sends the frame to the broadcast address FF:FF:FF:FF:FF:FF so every host on the segment receives it. Host B recognises its own IP and replies.',
              },
              {
                kind: 'choose-and-defend',
                prompt: 'How does Host B send its ARP Reply back to Host A?',
                options: [
                  'As a broadcast to FF:FF:FF:FF:FF:FF — all hosts need to know the mapping',
                  'As a unicast frame to AA:AA:AA:AA:AA:AA — Host B learned Host A\'s MAC from the Request',
                  'Host B does not reply — ARP is a one-way announcement',
                  'Via the default gateway — Host B routes the reply like any other packet',
                ],
                correctIndex: 1,
                explanation:
                  'The ARP Request contains the sender\'s (Host A\'s) MAC address. Host B records this and sends a unicast ARP Reply directly to AA:AA:AA:AA:AA:AA — only Host A needs the answer.',
              },
            ],
          },
          successMessage:
            'Correct! ARP Request = broadcast "who-has?"; ARP Reply = unicast "I am at this MAC." Now both hosts can communicate with Ethernet frames.',
        },
      ],
    },

    // ─────────────────────────────────────────────────────
    // Concept 2: ARP Cache, Timeouts & GARP (C22)
    // ─────────────────────────────────────────────────────
    {
      id: 'arp-cache-and-garp',
      order: 2,
      title: 'The ARP Cache, Timeouts & Gratuitous ARP',
      shortDescription:
        'Understand how the ARP cache stores IP-to-MAC mappings to reduce broadcast traffic, when entries expire, and what Gratuitous ARP (GARP) is used for.',
      theory: {
        summary:
          'Sending an ARP Request broadcast before every packet would flood the network. The ARP cache maintains IP-to-MAC mappings with aging timers (typically 20–120 seconds). Gratuitous ARP allows a host to announce its MAC binding without a prior request.',
        explanation: [
          '### C22: The ARP Cache Table, Timeouts & GARP',
          '',
          '**The ARP Cache**:',
          'Every OS maintains an in-memory ARP cache that stores recent IP → MAC mappings:',
          '```',
          '# Example: view ARP cache on Windows',
          '$ arp -a',
          '',
          'Interface: 192.168.1.100',
          '  Internet Address      Physical Address      Type',
          '  192.168.1.1           aa:bb:cc:dd:ee:ff     dynamic',
          '  192.168.1.50          11:22:33:44:55:66     dynamic',
          '```',
          '',
          '**Cache Aging**:',
          '- Dynamic entries are **incomplete** (awaiting ARP) or **complete** (resolved).',
          '- Complete entries expire after ~20 seconds (incomplete) to ~120 seconds (complete) on Linux; Windows uses ~2 minutes.',
          '- Upon expiry, the OS ARP-requests again before the next packet if the IP is still needed.',
          '',
          '**Cache Benefits**:',
          '- Eliminates repeated ARP broadcasts for frequently-used destinations.',
          '- On a subnet with 100 hosts, without a cache every packet would trigger a broadcast — 100× overhead.',
          '',
          '**Gratuitous ARP (GARP)**:',
          'A host voluntarily sends an ARP Reply that no one requested. Use cases:',
          '- **Initial Announce**: When a host boots, it GARPs its own IP → MAC mapping to update all neighbors\' caches simultaneously.',
          '- **Duplicate IP Detection**: A host GARPs its intended IP; if another host replies, there is an IP conflict.',
          '- **Failover / HSRP/VRRP**: When a standby router takes over a virtual IP, it sends a GARP to update all hosts\' caches immediately.',
          '',
          '**GARP Structure**: Sender IP == Target IP (same IP in both fields), sent to broadcast.',
        ],
        keyTakeaway:
          'The ARP cache avoids broadcasting before every packet. Entries expire and are refreshed on demand. Gratuitous ARP proactively announces a MAC binding to all neighbors at once.',
        exampleQuery: '',
        exampleQueryExplanation: '',
        mcqs: [
          {
            id: 'net05-mcq-garp-purpose',
            question:
              'A network failover device takes over a virtual IP. What does it send to immediately update all hosts on the segment?',
            options: [
              'An ICMP Echo Request (ping) to every host',
              'A Gratuitous ARP (GARP) with the virtual IP in both sender and target IP fields',
              'An ARP Request for the virtual IP to check for duplicates',
              'A DNS UPDATE record to refresh name resolution',
            ],
            correctIndex: 1,
            explanation:
              'A GARP is sent to the broadcast address with Sender IP = Target IP = the virtual IP. Every host on the segment updates its ARP cache entry for the virtual IP to point to the new device\'s MAC — instant failover without waiting for cache expiry.',
          },
        ],
      },
      tasks: [
        {
          id: 'net05-p2-arp-cache-reasoning',
          title: 'Independent Practice: ARP Cache Scenarios',
          description:
            'Determine ARP behavior when the cache has an entry, when it has expired, and when GARP is needed.',
          instructions: [
            'Scenario A: Host A cached 192.168.1.10 → BB:BB:BB:BB:BB:BB 5 seconds ago (timeout: 60s). A sends another packet to 192.168.1.10.',
            'Scenario B: Host A cached 192.168.1.20 → CC:CC:CC:CC:CC:CC, but that entry expired. A sends a new packet to 192.168.1.20.',
            'Scenario C: Server X fails. Server Y takes over the same virtual IP 192.168.1.100. Hosts still have Server X\'s MAC in cache.',
          ],
          type: 'independent',
          primaryTable: '',
          initialSql: '',
          solutionSql: 'NETWORKING_JUDGMENT_TASK',
          solutionExplanation:
            'A: Uses cached entry — no ARP broadcast needed. B: Cache expired → new ARP Request broadcast. C: Server Y sends GARP to update all caches immediately.',
          hints: [
            { level: 1, text: 'If an ARP cache entry is still valid (not expired), no new ARP broadcast is needed.' },
            { level: 2, text: 'GARP is used proactively: the new owner sends it without being asked, immediately refreshing stale ARP cache entries on all hosts.' },
          ],
          validation: {
            judgment: [
              {
                kind: 'choose-and-defend',
                prompt: 'In Scenario B (expired cache entry), what happens when Host A sends to 192.168.1.20?',
                options: [
                  'The packet is sent using the old (expired) MAC — ARP cache entries are never truly deleted',
                  'Host A sends a new ARP Request broadcast to resolve 192.168.1.20\'s current MAC before transmitting',
                  'Host A drops the packet because the ARP entry expired',
                  'Host A sends the packet to the default gateway since the local entry expired',
                ],
                correctIndex: 1,
                explanation:
                  'When an ARP cache entry expires, the OS marks it stale or removes it. The next outgoing packet to that IP triggers a new ARP Request broadcast to re-resolve the current MAC address.',
              },
              {
                kind: 'choose-and-defend',
                prompt: 'In Scenario C, why does Server Y send a Gratuitous ARP instead of waiting for hosts to ARP again?',
                options: [
                  'Because Server Y does not have an IP address yet and needs one assigned',
                  'To immediately invalidate stale ARP caches pointing to Server X, minimizing downtime',
                  'Because ARP Replies can only be sent unsolicited — this is the standard mechanism',
                  'To reserve the IP address 192.168.1.100 before Server X can reclaim it',
                ],
                correctIndex: 1,
                explanation:
                  'Without GARP, hosts would continue sending traffic to Server X\'s (dead) MAC until their ARP cache entries expire naturally — potentially 20–120 seconds of downtime. GARP lets Server Y announce the new MAC→IP binding instantly to all hosts on the segment.',
              },
            ],
          },
          successMessage:
            'Exactly right! Valid cache → skip ARP. Expired cache → new ARP broadcast. Failover → Gratuitous ARP to update all neighbors instantly.',
        },
      ],
    },

    // ─────────────────────────────────────────────────────
    // Concept 3: Mask Mismatch & Asymmetric Communication (C23)
    // ─────────────────────────────────────────────────────
    {
      id: 'mask-mismatch-asymmetric',
      order: 3,
      title: 'Subnet Mask Mismatch: Asymmetric One-Way Communication',
      shortDescription:
        'Diagnose how a misconfigured subnet mask causes one host to classify remote traffic as local (or vice versa), producing asymmetric communication failures.',
      theory: {
        summary:
          'Each host independently applies its own mask to determine local vs remote delivery. If two hosts on the same physical segment use different masks, one may try to ARP locally while the other sends traffic via a gateway — producing asymmetric, one-way communication.',
        explanation: [
          '### C23: Mask Mismatch — Asymmetric & One-Way Communication',
          '',
          '**Setup**:',
          '- Host A: IP `192.168.1.50`, Mask `255.255.255.0` (/24)',
          '- Host B: IP `192.168.1.200`, Mask `255.255.0.0` (/16)',
          '- Same physical segment. Default gateway: `192.168.1.1`.',
          '',
          '**Host A tries to reach Host B (192.168.1.200)**:',
          '```',
          'A\'s local/remote test: 192.168.1.200 AND 255.255.255.0 = 192.168.1.0',
          'A\'s own network:       192.168.1.50  AND 255.255.255.0 = 192.168.1.0',
          'Result: SAME → A thinks B is LOCAL → A sends ARP Request for 192.168.1.200.',
          '```',
          'B is on the same segment and receives the ARP broadcast → **B replies with its MAC.**',
          'Host A can send frames to Host B. ✅',
          '',
          '**Host B tries to reach Host A (192.168.1.50)**:',
          '```',
          'B\'s local/remote test: 192.168.1.50  AND 255.255.0.0 = 192.168.0.0',
          'B\'s own network:       192.168.1.200 AND 255.255.0.0 = 192.168.0.0',
          'Result: SAME → B also thinks A is LOCAL → B sends ARP Request for 192.168.1.50.',
          '```',
          'A receives the ARP broadcast → **A replies with its MAC.**',
          'Host B can send frames to Host A. ✅',
          '',
          '**A more severe mask mismatch (one-way failure)**:',
          '- Host C: IP `192.168.1.50`, Mask `255.255.255.0` (/24)',
          '- Host D: IP `192.168.2.10`, Mask `255.255.0.0` (/16)',
          '',
          '```',
          'C → D: 192.168.2.10 AND 255.255.255.0 = 192.168.2.0 ≠ 192.168.1.0 → REMOTE → routes via gateway.',
          '  Gateway forwards to D only if it has a route to 192.168.2.0/24. C may reach D.',
          '',
          'D → C: 192.168.1.50 AND 255.255.0.0 = 192.168.0.0 = own network → LOCAL → D ARPs for 192.168.1.50.',
          '  If D and C are NOT on the same segment, the ARP broadcast never reaches C → D cannot reach C at all.',
          '```',
          '',
          '**Diagnostic Symptom**: Ping works in one direction but not the other → **always suspect mask mismatch.**',
        ],
        keyTakeaway:
          'A subnet mask mismatch produces asymmetric communication: one host routes correctly while the other misidentifies local vs remote, causing one-directional or zero connectivity failures.',
        exampleQuery: '',
        exampleQueryExplanation: '',
        mcqs: [
          {
            id: 'net05-mcq-mask-mismatch',
            question:
              'A network engineer notices that Host X can ping Host Y, but Host Y cannot ping Host X. What is the most likely cause?',
            options: [
              'A firewall is blocking ICMP in the Y→X direction',
              'A subnet mask mismatch — one host is classifying the other as local when it is actually remote (or vice versa)',
              'The ARP cache on Host Y is full and cannot store new entries',
              'Host X has a static MAC entry and Host Y has a dynamic one',
            ],
            correctIndex: 1,
            explanation:
              'Asymmetric ping failure (one direction works, the other does not) is a classic mask mismatch symptom. A firewall is also possible, but subnet mask misconfiguration is the most common Layer 3 cause.',
          },
        ],
      },
      tasks: [
        {
          id: 'net05-p3-mask-mismatch-diagnosis',
          title: 'Mastery Check: Diagnose a Mask Mismatch Failure',
          description:
            'Given a misconfigured host pair, trace each direction of communication and predict whether it succeeds or fails.',
          instructions: [
            'Host Alpha: IP 10.0.1.5, Mask 255.255.255.0 (/24), Gateway 10.0.1.1',
            'Host Beta:  IP 10.0.1.100, Mask 255.255.0.0 (/16), Gateway 10.0.1.1',
            'Both hosts are connected to the same switch on the same physical segment.',
            '',
            'Question 1: When Alpha pings Beta (10.0.1.100), does the communication succeed?',
            'Question 2: When Beta pings Alpha (10.0.1.5), does the communication succeed?',
          ],
          type: 'challenge',
          primaryTable: '',
          initialSql: '',
          solutionSql: 'NETWORKING_JUDGMENT_TASK',
          solutionExplanation:
            'Alpha→Beta: 10.0.1.100 AND 255.255.255.0 = 10.0.1.0 = Alpha\'s network → local → ARP succeeds (same segment) ✅. Beta→Alpha: 10.0.1.5 AND 255.255.0.0 = 10.0.0.0 = Beta\'s network → local → ARP for 10.0.1.5 succeeds (same segment) ✅. Both succeed here because both hosts are on the same segment — the masks are different, but ARPs can still resolve.',
          hints: [
            { level: 1, text: 'Apply each host\'s OWN mask to the destination IP, then compare to the host\'s OWN network address.' },
            { level: 2, text: 'Since both Alpha and Beta are on the same physical segment, ARP broadcasts can reach both regardless of mask differences. The failure mode is worse when the hosts are on different segments.' },
          ],
          validation: {
            judgment: [
              {
                kind: 'choose-and-defend',
                prompt: 'Alpha (10.0.1.5/24) pings Beta (10.0.1.100). What is Alpha\'s delivery decision?',
                options: [
                  'Remote — 10.0.1.100 has a higher host number than Alpha\'s gateway',
                  'Local — 10.0.1.100 AND 255.255.255.0 = 10.0.1.0, same as Alpha\'s network',
                  'Remote — Alpha uses Beta\'s mask (/16) for the test',
                  'Local — all 10.x.x.x addresses are always in the same network',
                ],
                correctIndex: 1,
                explanation:
                  'Alpha applies ITS OWN mask: 10.0.1.100 AND 255.255.255.0 = 10.0.1.0. Alpha\'s network: 10.0.1.5 AND 255.255.255.0 = 10.0.1.0. Same → local delivery → ARP for Beta directly.',
              },
              {
                kind: 'choose-and-defend',
                prompt: 'Beta (10.0.1.100/16) pings Alpha (10.0.1.5). What delivery decision does Beta make?',
                options: [
                  'Remote — Beta uses the /24 mask since the destination is in a /24 subnet',
                  'Local — 10.0.1.5 AND 255.255.0.0 = 10.0.0.0, same as Beta\'s network (10.0.1.100 AND 255.255.0.0 = 10.0.0.0)',
                  'Remote — 10.0.1.5 is below 10.0.1.100, so it\'s a lower subnet',
                  'Local — Beta has a cached route to 10.0.1.5',
                ],
                correctIndex: 1,
                explanation:
                  'Beta applies ITS OWN mask (/16): 10.0.1.5 AND 255.255.0.0 = 10.0.0.0. Beta\'s own network: 10.0.1.100 AND 255.255.0.0 = 10.0.0.0. Same → local → Beta ARPs for 10.0.1.5 directly. Since both are on the same segment, this ARP succeeds.',
              },
            ],
          },
          successMessage:
            'Great analysis! On the same physical segment, mask mismatch here still allows communication because ARP broadcasts reach all devices. The failure mode is more severe when the two hosts are on different physical segments — then misrouted packets cannot reach the other host at all.',
        },
      ],
    },
  ],
};
