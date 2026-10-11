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
        // ── Stage 1: Observe (Worked Demonstration 192.168.1.10 ➔ .20) ──────
        {
          id: 'net05-stage1-observe',
          title: 'Stage 1: Observe — ARP Resolution & Queued Packet State Machine',
          description:
            'Observe how an outbound Layer 3 IP packet is buffered in a FIFO hold queue until Layer 2 ARP resolution discovers the target MAC address.',
          instructions: [
            'Host A (192.168.1.10, MAC AA:AA:AA:AA:AA:AA, Port 1) initiates ping 192.168.1.20.',
            'Observe the FIFO hold queue: The IP packet cannot be transmitted because the destination MAC is unresolved.',
            'Step 1: Host A broadcasts an ARP Request frame (Dst: FF:FF:FF:FF:FF:FF) with Opcode 1 and Target MAC 00:00:00:00:00:00.',
            'Step 2: Switch SW1 learns Host A on Port 1 and floods the broadcast out Ports 2, 3, and 4.',
            'Step 3: Host C (Port 3) drops the frame (IP mismatch). Host B (Port 2) matches Target IP and records Host A in its ARP cache.',
            'Step 4: Host B sends a unicast ARP Reply (Opcode 2). Host A records Host B in its cache, dequeues the buffered IP packet, and transmits!',
          ],
          type: 'guided',
          primaryTable: '',
          initialSql: '',
          solutionSql: 'NETWORKING_JUDGMENT_TASK',
          solutionExplanation:
            'An outbound IP packet cannot be encapsulated onto the Ethernet wire without a valid destination MAC address. Host A holds the IP packet in a FIFO buffer while ARP resolves the MAC.',
          hints: [
            { level: 1, text: 'Look at the FIFO Buffer box: Layer 2 encapsulation is held until the ARP Reply arrives.' },
            { level: 2, text: 'Step 4 shows the IP packet status change to Dequeued & Transmitted.' },
          ],
          arp: {
            stage: 1,
            sourceHost: { name: 'Host A', ip: '192.168.1.10', mac: 'AA:AA:AA:AA:AA:AA', port: 1 },
            targetHost: { name: 'Host B', ip: '192.168.1.20', mac: 'BB:BB:BB:BB:BB:BB', port: 2 },
            allHosts: [
              { name: 'Host A', ip: '192.168.1.10', mac: 'AA:AA:AA:AA:AA:AA', port: 1 },
              { name: 'Host B', ip: '192.168.1.20', mac: 'BB:BB:BB:BB:BB:BB', port: 2 },
              { name: 'Host C', ip: '192.168.1.30', mac: 'CC:CC:CC:CC:CC:CC', port: 3 },
            ],
            isInteractive: true,
            isCollapsed: false,
          },
          validation: {
            judgment: [
              {
                kind: 'choose-and-defend',
                prompt:
                  'Based on the interactive ARP simulation, why is Host A\'s outbound ICMP packet held in a FIFO queue rather than transmitted immediately?',
                options: [
                  'Because the Layer 2 Ethernet frame requires a destination MAC address before it can be encapsulated and transmitted onto the wire',
                  'Because IP packets must wait for DNS resolution to complete on the local switch',
                  'Because ARP requests cannot travel over switches while an IP packet is transmitting',
                  'Because the switch CAM table must receive a permission token from the default gateway',
                ],
                correctIndex: 0,
                explanation:
                  'Network interface controllers cannot transmit raw Layer 3 packets without Layer 2 framing. Because Host A does not yet know Host B\'s MAC address, it must buffer the packet in a FIFO hold queue until the ARP Reply arrives.',
              },
            ],
          },
          successMessage:
            'Stage 1 observed! You traced the queued IP packet lifecycle and dynamic ARP resolution.',
        },
        // ── Stage 2: Complete (Guided Scaffolding 10.0.0.15 ➔ .30) ──────────
        {
          id: 'net05-stage2-complete',
          title: 'Stage 2: Complete — Guided Intermediate ARP Protocol Calculations',
          description:
            'Complete the intermediate state calculations for Host X (10.0.0.15) resolving Host Y (10.0.0.30) via switch SW1.',
          instructions: [
            'Host X (10.0.0.15, MAC 11:11:11:11:11:11, Port 1) pings Host Y (10.0.0.30, MAC 22:22:22:22:22:22, Port 3).',
            'Non-target Host Z (10.0.0.45, Port 2) is connected to the same switch.',
            'Calculate the 6 intermediate protocol parameters: broadcast destination, switch learning, host actions, and reply opcode.',
          ],
          type: 'guided',
          primaryTable: '',
          initialSql: '',
          solutionSql: 'NETWORKING_JUDGMENT_TASK',
          solutionExplanation:
            'ARP Request uses Ethernet broadcast FF:FF:FF:FF:FF:FF. Switch learns Port 1 -> 11:11:11:11:11:11. Host Z silently drops. Host Y learns Host X and returns unicast Reply (Opcode 2). IP packet dequeues.',
          hints: [
            { level: 1, text: 'ARP Request frame destination MAC is always FF:FF:FF:FF:FF:FF.' },
            { level: 2, text: 'ARP Reply opcode is 2 (Request is opcode 1).' },
          ],
          arp: {
            stage: 2,
            sourceHost: { name: 'Host X', ip: '10.0.0.15', mac: '11:11:11:11:11:11', port: 1 },
            targetHost: { name: 'Host Y', ip: '10.0.0.30', mac: '22:22:22:22:22:22', port: 3 },
            allHosts: [
              { name: 'Host X', ip: '10.0.0.15', mac: '11:11:11:11:11:11', port: 1 },
              { name: 'Host Z', ip: '10.0.0.45', mac: '33:33:33:33:33:33', port: 2 },
              { name: 'Host Y', ip: '10.0.0.30', mac: '22:22:22:22:22:22', port: 3 },
            ],
            fields: [
              {
                id: 'arp_req_eth_dst',
                label: 'ARP Request Ethernet Frame Destination MAC',
                placeholder: 'e.g. FF:FF:FF:FF:FF:FF',
                expected: 'FF:FF:FF:FF:FF:FF',
                helperText: 'Broadcast MAC address received by all stations',
                misconceptions: [
                  {
                    testPattern: '22:22',
                    feedback: 'Host X does not know Host Y\'s MAC yet! It must send to the broadcast address.',
                  },
                ],
              },
              {
                id: 'sw_learned_mac',
                label: 'Switch Port 1 Learned Source MAC',
                placeholder: 'e.g. 11:11:11:11:11:11',
                expected: '11:11:11:11:11:11',
                helperText: 'Switch learns source MAC of sender Host X on ingress port',
              },
              {
                id: 'non_target_action',
                label: 'Non-Target Host Z Action upon Receipt',
                type: 'select',
                options: [
                  { label: 'Silently discards frame (Target IP mismatch)', value: 'discard' },
                  { label: 'Replies with an ARP error message', value: 'error' },
                  { label: 'Forwards frame to default gateway', value: 'forward' },
                ],
                expected: 'discard',
                helperText: 'Hosts ignore ARP requests intended for other IP addresses',
              },
              {
                id: 'target_host_cache',
                label: 'Target Host Y ARP Cache Updated Entry',
                placeholder: 'e.g. 11:11:11:11:11:11',
                expected: '11:11:11:11:11:11',
                helperText: 'Host Y caches the requester MAC from the ARP payload',
              },
              {
                id: 'arp_reply_opcode',
                label: 'ARP Reply Payload Opcode',
                placeholder: '1 or 2',
                expected: '2',
                helperText: '1 = Request, 2 = Reply',
              },
              {
                id: 'hold_queue_action',
                label: 'Queued Outbound IP Packet Action upon Reply Receipt',
                type: 'select',
                options: [
                  { label: 'Dequeues and transmits immediately to Host Y MAC', value: 'dequeue' },
                  { label: 'Requires second ARP request for confirmation', value: 'retry' },
                  { label: 'Flushes packet from buffer', value: 'flush' },
                ],
                expected: 'dequeue',
                helperText: 'Resolution completes and buffered packet is transmitted',
              },
            ],
          },
          validation: {
            judgment: [
              {
                kind: 'choose-and-defend',
                prompt:
                  'When Switch SW1 receives Host X\'s ARP Request on Port 1, how does it process the frame?',
                options: [
                  'It learns Host X\'s MAC on Port 1 and floods the broadcast out Ports 2, 3, and 4 (all ports except ingress)',
                  'It unicasts the frame directly to Port 3 because the switch inspects the ARP Target IP',
                  'It drops the frame until Host Y sends a gratuitous ARP',
                  'It rewrites the source MAC to the switch\'s own management MAC address',
                ],
                correctIndex: 0,
                explanation:
                  'Switches are Layer 2 devices. They examine the source MAC (11:11:11:11:11:11) and record it in the CAM table against ingress Port 1. Because the destination MAC is broadcast (FF:FF:FF:FF:FF:FF), the switch floods it out all active ports in the VLAN except the ingress port.',
              },
            ],
          },
          successMessage:
            'Stage 2 completed! You correctly scaffolded the 6 ARP protocol state transitions.',
        },
        // ── Stage 3: Perform Independently (Unscaffolded 192.168.5.50 ➔ .75) ──
        {
          id: 'net05-stage3-perform',
          title: 'Stage 3: Perform Independently — Unscaffolded ARP Protocol Exchange',
          description:
            'Independently determine the exact ARP frame headers, egress ports, and cache state without visual scaffolding.',
          instructions: [
            'Host M (192.168.5.50, MAC 55:55:55:55:55:55, Port 4) wants to transmit an IP packet to Host N (192.168.5.75, MAC 77:77:77:77:77:77, Port 2).',
            'Host M has an empty ARP cache. The 4-port switch SW1 has an empty CAM table.',
            'Independently calculate all protocol parameters.',
          ],
          type: 'guided',
          primaryTable: '',
          initialSql: '',
          solutionSql: 'NETWORKING_JUDGMENT_TASK',
          solutionExplanation:
            'ARP Request target MAC is 00:00:00:00:00:00. Switch floods out Ports 1, 2, and 3. ARP Reply destination MAC is 55:55:55:55:55:55 (Opcode 2). Host M encapsulates IP packet with destination MAC 77:77:77:77:77:77.',
          hints: [
            { level: 1, text: 'In an ARP Request, the Target MAC is unknown, so all 48 bits are 0 (00:00:00:00:00:00).' },
            { level: 2, text: 'The switch floods the broadcast out all ports except the arrival port (Port 4).' },
          ],
          arp: {
            stage: 3,
            sourceHost: { name: 'Host M', ip: '192.168.5.50', mac: '55:55:55:55:55:55', port: 4 },
            targetHost: { name: 'Host N', ip: '192.168.5.75', mac: '77:77:77:77:77:77', port: 2 },
            allHosts: [
              { name: 'Host K', ip: '192.168.5.20', mac: '11:22:33:44:55:66', port: 1 },
              { name: 'Host N', ip: '192.168.5.75', mac: '77:77:77:77:77:77', port: 2 },
              { name: 'Host L', ip: '192.168.5.30', mac: 'AA:BB:CC:DD:EE:FF', port: 3 },
              { name: 'Host M', ip: '192.168.5.50', mac: '55:55:55:55:55:55', port: 4 },
            ],
            isCollapsed: true,
            fields: [
              {
                id: 'req_target_mac_unknown',
                label: 'ARP Request Target Hardware Address (MAC)',
                placeholder: 'e.g. 00:00:00:00:00:00',
                expected: '00:00:00:00:00:00',
                helperText: '48-bit placeholder used in ARP Request payload for unknown target',
              },
              {
                id: 'switch_egress_ports',
                label: 'Switch SW1 Egress Ports for Flooded ARP Request',
                placeholder: 'e.g. 1, 2, 3',
                expected: '1, 2, 3',
                helperText: 'All active ports excluding ingress Port 4',
              },
              {
                id: 'reply_dst_mac',
                label: 'ARP Reply Ethernet Destination MAC',
                placeholder: 'e.g. 55:55:55:55:55:55',
                expected: '55:55:55:55:55:55',
                helperText: 'Host N unicasts directly back to requester Host M',
              },
              {
                id: 'reply_opcode_indep',
                label: 'ARP Reply Operation Code',
                placeholder: '1 or 2',
                expected: '2',
                helperText: '1 = Request, 2 = Reply',
              },
              {
                id: 'dequeued_dst_mac',
                label: 'Destination MAC for Dequeued IP Packet',
                placeholder: 'e.g. 77:77:77:77:77:77',
                expected: '77:77:77:77:77:77',
                helperText: 'Host M wraps IP packet in Ethernet frame addressed to Host N',
              },
            ],
          },
          validation: {
            judgment: [
              {
                kind: 'choose-and-defend',
                prompt:
                  'What value is placed in the Target MAC field of an ARP Request packet, and why?',
                options: [
                  '00:00:00:00:00:00 — because the sender does not yet know the target\'s MAC address and needs the target to supply it',
                  'FF:FF:FF:FF:FF:FF — because the ARP payload must match the Layer 2 Ethernet broadcast destination',
                  'The sender\'s own MAC address — so the responder knows where to return the reply',
                  'The default gateway\'s MAC address — because switches only route frames via gateways',
                ],
                correctIndex: 0,
                explanation:
                  'In the ARP Request payload, Target MAC is the unknown entity being queried, set to 00:00:00:00:00:00. The Layer 2 Ethernet frame header uses FF:FF:FF:FF:FF:FF to broadcast the container frame.',
              },
            ],
          },
          successMessage:
            'Stage 3 mastered! You performed independent calculation of all ARP protocol parameters.',
        },
        // ── Stage 4: Transfer (Remote Subnet Gateway Resolution) ────────────
        {
          id: 'net05-stage4-transfer',
          title: 'Stage 4: Transfer — Remote Subnet Delivery & Gateway ARP Resolution',
          description:
            'Transfer ARP concepts to an authentic remote delivery scenario: resolving the default gateway MAC while preserving remote destination IP.',
          instructions: [
            'Host A: IP 192.168.1.50/24, MAC AA:AA:AA:AA:AA:AA, Default Gateway 192.168.1.1 (MAC GW:01:01:01:01:01).',
            'Host A initiates communication with remote public DNS server 8.8.8.8.',
            'Step 1: Perform the subnet AND test to determine local vs remote delivery.',
            'Step 2: Determine which IP address Host A puts in the Target IP field of its ARP Request.',
            'Step 3: Determine the Layer 2 Frame Destination MAC and Layer 3 Packet Destination IP of the transmitted packet.',
          ],
          type: 'guided',
          primaryTable: '',
          initialSql: '',
          solutionSql: 'NETWORKING_JUDGMENT_TASK',
          solutionExplanation:
            '8.8.8.8 is off-link (remote). Host A must ARP for Default Gateway 192.168.1.1 (NOT 8.8.8.8). The transmitted frame has Layer 2 Dst MAC GW:01:01:01:01:01, while Layer 3 Dst IP remains 8.8.8.8.',
          hints: [
            { level: 1, text: 'ARP broadcasts cannot cross routers. Host A cannot ARP for 8.8.8.8.' },
            { level: 2, text: 'Host A sends frames to the Default Gateway to reach remote networks.' },
          ],
          arp: {
            stage: 4,
            sourceHost: { name: 'Host A', ip: '192.168.1.50', mac: 'AA:AA:AA:AA:AA:AA', port: 1 },
            targetHost: { name: 'Remote DNS', ip: '8.8.8.8', mac: 'UNRESOLVABLE_DIRECTLY', port: 24 },
            gatewayHost: { name: 'Router R1 (Default Gateway)', ip: '192.168.1.1', mac: 'GW:01:01:01:01:01', port: 24 },
            allHosts: [
              { name: 'Host A', ip: '192.168.1.50', mac: 'AA:AA:AA:AA:AA:AA', port: 1 },
              { name: 'Router R1', ip: '192.168.1.1', mac: 'GW:01:01:01:01:01', port: 24 },
            ],
            fields: [
              {
                id: 'l3_delivery_decision',
                label: 'Subnet AND Delivery Decision for 8.8.8.8',
                type: 'select',
                options: [
                  { label: 'Remote (Off-Link) — Requires Default Gateway', value: 'remote' },
                  { label: 'Local (On-Link) — Direct ARP resolution', value: 'local' },
                ],
                expected: 'remote',
                helperText: '8.8.8.8 AND 255.255.255.0 = 8.8.8.0 ≠ 192.168.1.0',
              },
              {
                id: 'arp_target_ip_transfer',
                label: 'Target IP specified in Host A\'s ARP Request',
                placeholder: 'e.g. 192.168.1.1',
                expected: '192.168.1.1',
                helperText: 'The IP address whose MAC is needed to forward off-link',
                misconceptions: [
                  {
                    testPattern: '8\\.8\\.8\\.8',
                    feedback: 'Common misconception! ARP is strictly local. Host A must ARP for the default gateway (192.168.1.1), not the remote host.',
                  },
                ],
              },
              {
                id: 'transmitted_frame_dst_mac',
                label: 'Layer 2 Frame Destination MAC for Outbound Packet',
                placeholder: 'e.g. GW:01:01:01:01:01',
                expected: 'GW:01:01:01:01:01',
                helperText: 'Frame is physically addressed to the next-hop router',
              },
              {
                id: 'transmitted_packet_dst_ip',
                label: 'Layer 3 Packet Destination IP (Inside Payload)',
                placeholder: 'e.g. 8.8.8.8',
                expected: '8.8.8.8',
                helperText: 'End-to-end destination IP address is preserved across hops',
              },
            ],
          },
          validation: {
            judgment: [
              {
                kind: 'choose-and-defend',
                prompt:
                  'Host A (192.168.1.50/24, GW 192.168.1.1) initiates communication with remote IP 8.8.8.8. Which IP address does Host A place in the Target IP field of its ARP Request, and why?',
                options: [
                  '192.168.1.1 (the Default Gateway) — because 8.8.8.8 is off-link, so the frame must be delivered at Layer 2 to the router',
                  '8.8.8.8 — because ARP requests must always ask for the ultimate end-to-end destination IP address',
                  '255.255.255.255 — because off-link destinations require an IP broadcast',
                  '192.168.1.255 — the local broadcast address',
                ],
                correctIndex: 0,
                explanation:
                  'When a destination IP is outside the local subnet, host routing logic selects the next hop (the default gateway). Because ARP is non-routable and strictly link-local, the host ARPs for the gateway\'s IP (192.168.1.1) so it can frame the packet to the router at Layer 2.',
              },
            ],
          },
          successMessage:
            'Stage 4 transfer conquered! You mastered the gateway ARP rule: ARP for the gateway, preserve the end-to-end destination IP.',
        },
        // ── Stage 5: Diagnose (Subnet Mask Mismatch & Asymmetric Drops) ─────
        {
          id: 'net05-stage5-diagnose',
          title: 'Stage 5: Diagnose & Troubleshoot — Subnet Mask Mismatch & Asymmetric Drops',
          description:
            'Isolate and diagnose an asymmetric communication failure where Host A can send ARP requests to Host B, but receives 0 replies.',
          instructions: [
            'Host A: IP 192.168.1.10, Mask 255.255.255.0 (/24), Gateway 192.168.1.1.',
            'Host B: IP 192.168.1.200, Mask 255.255.255.128 (/25), Gateway 192.168.1.129.',
            'Both hosts are connected to Switch SW1 Ports 1 and 2 in VLAN 10.',
            'Telemetry: Host A pinging 192.168.1.200 times out (100% loss). Host B arp -a shows Host A (192.168.1.10 AA:AA:AA:AA:AA:AA).',
            'PCAP: ARP Request is seen on wire, but Host B never transmits an ARP Reply.',
            'Identify the asymmetric routing root cause and specify the corrective subnet mask.',
          ],
          type: 'guided',
          primaryTable: '',
          initialSql: '',
          solutionSql: 'NETWORKING_JUDGMENT_TASK',
          solutionExplanation:
            'Host A\'s /24 mask considers 192.168.1.200 local, sending an ARP Request. Host B receives it and caches Host A. But Host B\'s /25 mask considers Host A (192.168.1.10) remote (outside .128-.255), so Host B drops the reply trying to route via unroutable gateway 192.168.1.129. Fix: configure Host B with /24 (255.255.255.0).',
          hints: [
            { level: 1, text: 'Compare Host B\'s subnet range (/25: 192.168.1.128 - 192.168.1.255) with Host A\'s IP (192.168.1.10).' },
            { level: 2, text: 'Host B thinks Host A is remote, so it attempts to route the reply to gateway 192.168.1.129 instead of replying directly.' },
          ],
          arp: {
            stage: 5,
            sourceHost: { name: 'Host A', ip: '192.168.1.10', mac: 'AA:AA:AA:AA:AA:AA', port: 1 },
            targetHost: { name: 'Host B', ip: '192.168.1.200', mac: 'BB:BB:BB:BB:BB:BB', port: 2 },
            allHosts: [
              { name: 'Host A', ip: '192.168.1.10', mac: 'AA:AA:AA:AA:AA:AA', port: 1 },
              { name: 'Host B', ip: '192.168.1.200', mac: 'BB:BB:BB:BB:BB:BB', port: 2 },
            ],
            diagnostics: {
              arpTableOutput: 'Host B ARP Table:\nInternet Address      Physical Address      Type\n192.168.1.10          aa-aa-aa-aa-aa-aa     dynamic\n192.168.1.129         (incomplete)          failed',
              pcapOutput: 'Wireshark Port 1 & 2 Capture:\n1. 0.000000 AA:AA:AA:AA:AA:AA ➔ Broadcast ARP Who has 192.168.1.200? Tell 192.168.1.10\n2. 0.000010 BB:BB:BB:BB:BB:BB received frame, ARP cache updated\n3. 0.000015 Host B routing table lookup for 192.168.1.10 (classified OFF-LINK via 192.168.1.129)\n4. 0.000020 ARP Request for 192.168.1.129 failed (Gateway unreachable) ➔ Reply dropped',
              pingOutput: 'C:\\Users\\HostA> ping 192.168.1.200\nPinging 192.168.1.200 with 32 bytes of data:\nRequest timed out.\nRequest timed out.\nRequest timed out.\nPacket loss: 100%',
            },
            fields: [
              {
                id: 'host_a_classification',
                label: 'Host A\'s Delivery Classification for 192.168.1.200',
                type: 'select',
                options: [
                  { label: 'Local (On-Link) — Both share 192.168.1.0/24', value: 'local' },
                  { label: 'Remote (Off-Link) — Requires gateway', value: 'remote' },
                ],
                expected: 'local',
                helperText: '192.168.1.200 AND 255.255.255.0 = 192.168.1.0',
              },
              {
                id: 'host_b_classification',
                label: 'Host B\'s Delivery Classification for 192.168.1.10',
                type: 'select',
                options: [
                  { label: 'Remote (Off-Link) — 192.168.1.10 is outside Host B\'s /25 block', value: 'remote' },
                  { label: 'Local (On-Link) — Both share 192.168.1.x', value: 'local' },
                ],
                expected: 'remote',
                helperText: '192.168.1.10 AND 255.255.255.128 = 192.168.1.0 ≠ 192.168.1.128',
              },
              {
                id: 'asymmetric_failure_root_cause',
                label: 'Root Cause of 0 ARP Replies reaching Host A',
                type: 'select',
                options: [
                  { label: 'Host B attempts to route the reply to gateway 192.168.1.129 instead of replying directly', value: 'gateway_route' },
                  { label: 'The switch drops ARP replies across different ports', value: 'switch_drop' },
                  { label: 'Host A ignores ARP replies with mismatched subnets', value: 'host_a_ignore' },
                ],
                expected: 'gateway_route',
                helperText: 'Host B misclassifies the return path as off-link',
              },
              {
                id: 'corrective_subnet_mask',
                label: 'Corrective Subnet Mask to configure on Host B',
                placeholder: 'e.g. 255.255.255.0',
                expected: '255.255.255.0',
                helperText: 'Aligns Host B with the /24 subnet so both hosts agree on local delivery',
              },
            ],
          },
          validation: {
            judgment: [
              {
                kind: 'choose-and-defend',
                prompt:
                  'Host A (/24) pings Host B (/25) on the same switch. Host B receives the ARP Request and records Host A in its ARP cache, but Host A experiences 100% packet loss. Why does Host B fail to return an ARP Reply?',
                options: [
                  'Host B\'s /25 mask classifies Host A (192.168.1.10) as off-link (remote), so Host B drops the packet trying to route through its unreachable gateway instead of sending a local direct reply',
                  'The switch drops the reply because VLANs reject frames between hosts with mismatched subnet masks',
                  'Host A\'s ARP cache automatically blocks incoming replies that originate from /25 prefixes',
                  'Host B refuses to respond because ARP opcodes cannot cross subnet boundaries',
                ],
                correctIndex: 0,
                explanation:
                  'Because Host B is configured with a /25 mask, its local subnet is 192.168.1.128 to 192.168.1.255. When it prepares the ARP Reply for 192.168.1.10, it evaluates 192.168.1.10 as outside its subnet (remote). It therefore attempts to send the reply to its default gateway 192.168.1.129 rather than directly to Host A, resulting in total packet drop.',
              },
            ],
          },
          successMessage:
            'Stage 5 diagnostic resolved! You diagnosed asymmetric routing caused by subnet mask mismatch and aligned Host B with /24.',
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
