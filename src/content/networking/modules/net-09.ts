import { ModuleData } from '../../../types/curriculum';

/**
 * net-09: Dynamic Host Configuration Protocol (DHCP)
 * ─────────────────────────────────────────────────────────────────────────────
 * Milestone 4 — Concepts C31, C32, C33
 * Teaches how network endpoints dynamically obtain IPv4 configuration parameters,
 * the UDP broadcast bootstrap dilemma, the DORA state machine (Discover, Offer,
 * Request, ACK), lease renewal timers (T1/T2), DHCP Relays (giaddr), and APIPA
 * link-local (169.254.0.0/16) fallback mechanics.
 */

export const NET_09_MODULE: ModuleData = {
  id: 'net-09',
  slug: 'dynamic-host-configuration-protocol-dhcp',
  day: 9,
  title: 'Module 9: Dynamic Host Configuration Protocol (DHCP)',
  shortTitle: 'DHCP & Auto-Config',
  type: 'module',
  track: 'networking',
  milestoneId: 'net-milestone-4',
  description:
    'Master how computers automatically join networks without manual configuration: the bootstrap UDP broadcast dilemma, the 4-step DORA handshake, lease renewal timers, DHCP relay agents, and APIPA failure diagnosis.',
  estimatedMinutes: 35,
  curriculumOrder: 9,
  displayLabel: 'Module 9',
  completionLearnings: [
    'An unconfigured client has no IP address yet, so it broadcasts from 0.0.0.0:68 to 255.255.255.255:67 with Layer 2 MAC FF:FF:FF:FF:FF:FF',
    'The DORA exchange consists of Discover (client broadcast), Offer (server unicast/broadcast), Request (client broadcast selecting offer), and ACK (server confirmation)',
    'The DHCP Request is broadcast even after receiving an offer so other competing DHCP servers know their offers were declined',
    'DHCP leases renew at T1 (50% of lease time via unicast to original server) and rebind at T2 (87.5% of lease time via broadcast)',
    'Routers drop Layer 3 broadcasts by default; cross-subnet DHCP requires a DHCP Relay Agent that rewrites broadcasts into unicasts via the giaddr field',
    'If no DHCP response is received, Windows and macOS fall back to Automatic Private IP Addressing (APIPA 169.254.0.0/16), indicating local-only connectivity',
  ],
  concepts: [
    // ─────────────────────────────────────────────────────
    // Concept 1: Bootstrap & The Broadcast Dilemma (C31)
    // ─────────────────────────────────────────────────────
    {
      id: 'net09-c1-dhcp-bootstrap',
      order: 1,
      title: 'DHCP Bootstrap & The Broadcast Dilemma',
      shortDescription:
        'Understand the chicken-and-egg problem of IP configuration: how a client without an IP address reaches a DHCP server on the local network.',
      theory: {
        summary:
          'When booting up, an unconfigured host has no IP, subnet mask, or gateway. It sends a UDP bootstrap datagram from 0.0.0.0:68 to 255.255.255.255:67 with MAC FF:FF:FF:FF:FF:FF and a random 32-bit transaction ID (XID) so servers can address replies.',
        explanation: [
          '### Beat 1: Direct Physical Reality — The Unconfigured Endpoint',
          'When an unconfigured machine boots up or plugs an Ethernet cable into a switchport, its network interface card (NIC) possesses a burnt-in 48-bit MAC address in ROM, but its operating system IP stack has **zero Layer 3 configuration**.',
          'It has no assigned IPv4 address, no subnet mask, no default gateway IP, and no DNS server addresses.',
          'Yet according to the rules of TCP/IP, a host cannot transmit a standard unicast IP packet without having a valid source IP address in the packet header. This creates the classic **Bootstrap Paradox**: How does an unconfigured host ask for an IP address before it has one?',
          '',
          '### Beat 2: The Core Mechanism — The UDP Broadcast Bootstrap',
          'RFC 2131 solves this bootstrap dilemma through a specialized broadcast encapsulation protocol operating over UDP:',
          '- **Source IP**: `0.0.0.0` (Defined in RFC 791 as "this host on this network", indicating the sender has no assigned address).',
          '- **Destination IP**: `255.255.255.255` (Limited broadcast address, instructing all Layer 3 hosts on the local physical link to process the packet).',
          '- **Source UDP Port**: `68` (Standard DHCP client port).',
          '- **Destination UDP Port**: `67` (Standard DHCP server daemon port).',
          '- **Destination MAC**: `FF:FF:FF:FF:FF:FF` (Layer 2 broadcast, ensuring the switch floods the frame out all ports in the broadcast domain).',
          '',
          '### The 32-Bit Transaction ID (XID)',
          'In a large enterprise or university campus, dozens of laptops may connect to the same switch simultaneously. If every client sends from `0.0.0.0` to `255.255.255.255`, how does a client identify which server response belongs to it?',
          'The client generates a **random 32-bit Transaction ID (XID)** and places its own **Client Hardware Address (CHADDR)** in the DHCP payload. Any responding server echoes this exact XID and CHADDR back in its offer.',
          '',
          '### Beat 3: Failure Modes & Workplace Diagnostics',
          'Common bootstrap failure scenarios:',
          '- **Rogue DHCP Servers**: If an employee connects an unmanaged consumer Wi-Fi router to the office LAN, its built-in DHCP server may answer Discover broadcasts faster than the corporate server, leasing wrong default gateways and hijacking network traffic.',
          '- **DHCP Starvation Attacks**: An attacker floods thousands of DHCP Discovers with spoofed MAC addresses, exhausting all available addresses in the server pool. Modern switches mitigate this using **DHCP Snooping** (trusting only authorized server switchports).',
        ],
        keyTakeaway:
          'An unconfigured client uses 0.0.0.0:68 to 255.255.255.255:67 with MAC FF:FF:FF:FF:FF:FF and a random XID to discover local DHCP servers.',
        exampleQuery: '',
        exampleQueryExplanation: '',
        mcqs: [
          {
            id: 'net09-mcq-bootstrap-source',
            question:
              'Why does an unconfigured host set its Source IP to 0.0.0.0 when sending a DHCP Discover datagram?',
            options: [
              'Because 0.0.0.0 is the loopback address used for local machine testing',
              'Because RFC 791/2131 designates 0.0.0.0 as "this host on this network" when an endpoint has not yet been assigned a valid IP',
              'Because 0.0.0.0 instructs the router to bypass all firewall inspection rules',
              'Because 0.0.0.0 is the private IP address of the switch management engine',
            ],
            correctIndex: 1,
            explanation:
              'Under RFC 791 and RFC 2131, 0.0.0.0 represents an unknown or unassigned host address during the initial bootstrap sequence.',
          },
          {
            id: 'net09-mcq-xid-correlation',
            question:
              'How does a client distinguish its own DHCP Offer from offers intended for other clients booting simultaneously on the same LAN?',
            options: [
              'By inspecting the unique 32-bit Transaction ID (XID) and Client Hardware Address (CHADDR) echoed in the server payload',
              'By checking the color of the Ethernet patch cable',
              'By comparing the server IP with its local HOSTS file',
              'By waiting 60 seconds before accepting any server response',
            ],
            correctIndex: 0,
            explanation:
              'The client generates a random 32-bit transaction ID (XID) and includes its MAC address in the CHADDR field. Responding servers echo these identifiers, allowing clients to ignore offers meant for other devices.',
          },
        ],
      },
      tasks: [
        {
          id: 'net09-p1-bootstrap-analysis',
          title: 'Practice: Analyzing DHCP Bootstrap Packets',
          description:
            'Inspect the exact header fields generated by an unconfigured host during initial network connection.',
          instructions: [
            'A new desktop PC boots up and sends a DHCP Discover frame.',
            'Review the header fields and answer the judgment questions on port numbers and address assignments.',
          ],
          type: 'guided',
          primaryTable: '',
          initialSql: '',
          solutionSql: 'NETWORKING_JUDGMENT_TASK',
          solutionExplanation:
            'An unconfigured client sources from 0.0.0.0:68 to destination 255.255.255.255:67 with Layer 2 MAC FF:FF:FF:FF:FF:FF.',
          dhcp: {
            title: 'DHCP Bootstrap & Broadcast Dilemma',
            description:
              'Trace the unconfigured client sending a DHCP Discover datagram from 0.0.0.0:68 to limited broadcast 255.255.255.255:67 with Layer 2 MAC FF:FF:FF:FF:FF:FF.',
            clientMac: '00:1A:2B:3C:4D:5E',
            transactionId: '0x39A2F1B0',
            initialStep: 1,
            scenarioMode: 'standard',
          },
          hints: [
            {
              level: 1,
              text: 'The client has no IP yet, so RFC 791 defines 0.0.0.0 as the source.',
            },
            {
              level: 2,
              text: 'DHCP servers listen on UDP port 67; clients receive on UDP port 68.',
            },
          ],
          validation: {
            judgment: [
              {
                kind: 'choose-and-defend',
                prompt:
                  'What are the source IP and source UDP port used by an unconfigured client sending a DHCP Discover?',
                options: [
                  'Source IP 127.0.0.1, Source Port 80',
                  'Source IP 0.0.0.0, Source Port 68',
                  'Source IP 255.255.255.255, Source Port 67',
                  'Source IP 192.168.1.1, Source Port 53',
                ],
                correctIndex: 1,
                explanation:
                  'RFC 2131 specifies that a client with no assigned IP uses 0.0.0.0 as source IP and UDP port 68 as source port.',
              },
              {
                kind: 'choose-and-defend',
                prompt:
                  'Why must the client use destination MAC FF:FF:FF:FF:FF:FF and destination IP 255.255.255.255?',
                options: [
                  'Because DHCP servers only accept multicast traffic on 224.0.0.1',
                  'Because the client does not yet know the IP or MAC address of any DHCP server on the local link, so it must reach all link devices',
                  'Because RFC 2131 prohibits unicast traffic during initial discovery to prevent switch MAC learning',
                  'Because the default gateway requires broadcast to populate its ARP table',
                ],
                correctIndex: 1,
                explanation:
                  'Since the client has no prior knowledge of server addresses on the local network, it broadcasts to all devices in the broadcast domain.',
              },
            ],
          },
          successMessage:
            'Correct! Source 0.0.0.0:68 to 255.255.255.255:67 broadcasts to all devices on the link without requiring pre-existing configuration.',
        },
      ],
    },

    // ─────────────────────────────────────────────────────
    // Concept 2: The DORA State Machine & Lease Timers (C32)
    // ─────────────────────────────────────────────────────
    {
      id: 'net09-c2-dora-process',
      order: 2,
      title: 'The DORA Exchange & Lease Lifecycle',
      shortDescription:
        'Trace the 4-step DORA handshake (Discover, Offer, Request, ACK) and examine lease renewal timers T1 and T2.',
      theory: {
        summary:
          'DORA encompasses Discover, Offer, Request, and ACK. The client broadcasts Request to notify competing servers their offers were declined. Leases renew at T1 (50% via unicast) and rebind at T2 (87.5% via broadcast).',
        explanation: [
          '### Beat 1: Direct Physical Reality — Multi-Server Competition',
          'In resilient enterprise networks, two or more DHCP servers (e.g., Primary at `192.168.1.1` and Secondary at `192.168.1.2`) share the broadcast domain for redundancy.',
          'When a client broadcasts a single DHCP Discover, **both servers receive it and both prepare an IP address offer**.',
          'The client must select one offer and decline the other without creating address leaks in the unselected server’s pool.',
          '',
          '### Beat 2: The Core Mechanism — The 4-Step DORA State Machine',
          'The DHCP protocol lifecycle executes across four distinct operational steps (D-O-R-A):',
          '1. **Discover (Client ➔ Broadcast)**: Unconfigured client broadcasts to discover active DHCP servers.',
          '2. **Offer (Server ➔ Client)**: Server reserves an unallocated IP from its scope and transmits an Offer containing offered IP, subnet mask, default gateway, DNS servers, and lease duration.',
          '3. **Request (Client ➔ Broadcast)**: Client selects one offer (typically the first received) and broadcasts a DHCP Request naming the chosen server in Option 54 (Server Identifier).',
          '   **Why broadcast the Request?** Broadcasting informs all competing DHCP servers simultaneously. The chosen server confirms the lease, while non-chosen servers release their temporarily reserved IPs back to their available pools immediately.',
          '4. **ACK (Server ➔ Client)**: The selected server confirms lease parameters with an Acknowledgment (ACK). The client configures its network interface and begins normal operation.',
          '',
          '### Lease Renewal Lifecycle: Timers T1 & T2',
          'DHCP addresses are not owned; they are **leased** for a defined duration (e.g., 8 hours = 28,800 seconds):',
          '- **Timer T1 (Renewal at 50% = 4 hours)**: The client attempts to renew its lease by transmitting a **unicast DHCP Request** directly to the server that granted the original lease. Because it is unicast, network overhead is zero.',
          '- **Timer T2 (Rebind at 87.5% = 7 hours)**: If the original server crashed or is unreachable at T1, the client waits until T2. At 87.5% of lease time, the client switches to **broadcast DHCP Request** to seek a lease renewal from ANY active DHCP server on the link.',
          '- **Lease Expiration (100% = 8 hours)**: If no server responds before timer expiry, the client must immediately release the IP address and halt all IP traffic.',
          '',
          '### Beat 3: Failure Modes & Workplace Diagnostics',
          '- **Lease Exhaustion**: High-turnover guest Wi-Fi networks (e.g. coffee shops) with long lease times (e.g. 24 hours) run out of IP addresses. Best practice is setting short leases (e.g. 30–60 minutes).',
          '- **DHCP NAK (Negative Acknowledgment)**: If a laptop moves to a different physical building and requests its old IP on a new subnet, the server returns a DHCP NAK forcing the client to release its configuration and restart from Discover.',
        ],
        keyTakeaway:
          'The DORA exchange configures the host. Broadcasting the Request releases unselected offers. T1 renews at 50% via unicast; T2 rebinds at 87.5% via broadcast.',
        exampleQuery: '',
        exampleQueryExplanation: '',
        mcqs: [
          {
            id: 'net09-mcq-dora-broadcast-req',
            question:
              'Why is the DHCP Request message sent as a Layer 3 broadcast even though the client has already chosen a specific server offer?',
            options: [
              'Because the operating system kernel disables unicast transmission until the final ACK is processed, and to let competing servers immediately release unchosen offered IPs',
              'Because routers require broadcast packets to calculate shortest path first trees',
              'Because the client needs to alert web servers on the internet that it is online',
              'Because Layer 2 switches do not support unicast frames on UDP port 67',
            ],
            correctIndex: 0,
            explanation:
              'Broadcasting the Request notifies all competing DHCP servers on the subnet simultaneously that their offers were not chosen, allowing them to return offered IPs to their available pools.',
          },
          {
            id: 'net09-mcq-lease-timers',
            question:
              'What happens when a client reaches Timer T1 (50% of lease time) without a network interruption?',
            options: [
              'It immediately drops its IP address and sends an ARP probe to the default gateway',
              'It sends a unicast DHCP Request directly to the server that issued the lease to extend the lease duration',
              'It broadcasts a DHCP Discover to find a faster DHCP server',
              'It switches to a self-assigned APIPA address (169.254.x.x)',
            ],
            correctIndex: 1,
            explanation:
              'At Timer T1 (50% of lease duration), the client quietly transmits a unicast DHCP Request directly to the leasing server to renew the lease without broadcasting.',
          },
        ],
      },
      tasks: [
        {
          id: 'net09-p2-dora-timing',
          title: 'Practice: DORA Steps & Lease Renewal Rules',
          description:
            'Evaluate the sequence of DORA messages and predict client behavior at lease renewal intervals.',
          instructions: [
            'A client is configured with an 8-hour DHCP lease from Server 192.168.1.1.',
            'Answer the judgment questions regarding the DORA exchange and renewal behavior.',
          ],
          type: 'guided',
          primaryTable: '',
          initialSql: '',
          solutionSql: 'NETWORKING_JUDGMENT_TASK',
          solutionExplanation:
            'The client broadcasts Request so other servers can release their offers. At T1 (50% = 4 hours), the client sends a unicast Request to the original server.',
          dhcp: {
            title: 'DORA 4-Way Handshake & T1/T2 Lease Timers',
            description:
              'Step through Discover, Offer, Request, and ACK. Evaluate why Request is broadcast to decline competing servers, and inspect T1 (50%) and T2 (87.5%) timers.',
            clientMac: '00:1A:2B:3C:4D:5E',
            primaryServer: {
              name: 'Enterprise DHCP Server',
              serverIp: '192.168.1.1',
              serverMac: '00:50:56:C0:00:01',
              offeredIp: '192.168.1.100',
              subnetMask: '255.255.255.0 (/24)',
              gateway: '192.168.1.1',
              dns: '8.8.8.8, 1.1.1.1',
              leaseTimeSeconds: 28800,
            },
            competingServer: {
              name: 'Secondary DHCP Pool',
              serverIp: '192.168.1.2',
              serverMac: '00:50:56:C0:00:02',
              offeredIp: '192.168.1.150',
              subnetMask: '255.255.255.0 (/24)',
              gateway: '192.168.1.1',
              dns: '8.8.8.8',
              leaseTimeSeconds: 28800,
            },
            initialStep: 3,
            scenarioMode: 'competing_servers',
            leaseSeconds: 28800,
          },
          hints: [
            {
              level: 1,
              text: 'T1 occurs at 50% of the lease duration and is sent as a unicast message.',
            },
            {
              level: 2,
              text: 'The broadcast Request allows declining servers to return unchosen IPs to their pools.',
            },
          ],
          validation: {
            judgment: [
              {
                kind: 'choose-and-defend',
                prompt:
                  'Why does the client send its DHCP Request as a broadcast rather than unicasting to the offering server?',
                options: [
                  'Because the client still does not have permission to use unicast IP until receiving the final ACK, and to notify other servers that their offers were not selected',
                  'Because RFC 2131 requires all DHCP packets to be flooded across the entire internet',
                  'Because switches drop unicast packets sent to UDP port 67',
                  'To force the default gateway to update its MAC table',
                ],
                correctIndex: 0,
                explanation:
                  'Broadcasting the Request serves two purposes: the client does not yet officially own the IP, and other DHCP servers on the subnet receive notification that their offers were not accepted.',
              },
              {
                kind: 'choose-and-defend',
                prompt:
                  'For an 8-hour lease, when does the client first attempt to renew its lease (T1), and how does it transmit this message?',
                options: [
                  'At 7 hours (87.5%), via broadcast to all servers',
                  'At 4 hours (50%), via unicast directly to the leasing DHCP server',
                  'At 8 hours (100%), by dropping the IP and restarting from DHCP Discover',
                  'At 1 hour (12.5%), via multicast to 224.0.0.1',
                ],
                correctIndex: 1,
                explanation:
                  'Timer T1 fires at 50% of lease time (4 hours for an 8-hour lease) and sends a unicast DHCP Request directly to the server that granted the lease.',
              },
            ],
          },
          successMessage:
            'Mastered! The client requests via broadcast to notify all servers, and quietly renews via unicast at T1 (50% lease time).',
        },
      ],
    },

    // ─────────────────────────────────────────────────────
    // Concept 3: DHCP Relays & APIPA Autoconfiguration (C33)
    // ─────────────────────────────────────────────────────
    {
      id: 'net09-c3-relays-apipa',
      order: 3,
      title: 'DHCP Relays & APIPA Failure Diagnosis',
      shortDescription:
        'Understand how DHCP Relays cross router boundaries and recognize Automatic Private IP Addressing (APIPA 169.254.0.0/16).',
      theory: {
        summary:
          'Routers drop broadcast packets by default. A DHCP Relay Agent bridges cross-subnet requests by unicasting them with the incoming interface IP in giaddr. If no DHCP server answers, clients fall back to APIPA (169.254.0.0/16).',
        explanation: [
          '### Beat 1: Direct Physical Reality — The Router Broadcast Barrier',
          'Layer 3 routers do not forward `255.255.255.255` broadcast frames across interfaces. By design, routers terminate broadcast domains to prevent global broadcast storms.',
          'However, enterprise networks cannot deploy a dedicated physical DHCP server on every individual departmental floor or branch subnet. A central cluster of DHCP servers in the data center must service hundreds of disparate subnets.',
          '',
          '### Beat 2: The Core Mechanism — DHCP Relay Agents & `giaddr`',
          'To bridge DHCP across router boundaries, network engineers configure a **DHCP Relay Agent** (e.g. Cisco `ip helper-address <DHCP-Server-IP>` or Linux `dhcrelay`):',
          '1. The client broadcasts DHCP Discover on the local LAN.',
          '2. The local router interface intercepts the UDP port 67 broadcast.',
          '3. The router populates the **`giaddr` (Gateway IP Address)** field in the DHCP payload with its own local interface IP address (e.g. `192.168.10.1`).',
          '4. The router converts the broadcast into a standard **unicast packet** and sends it across corporate WAN or MPLS links to the centralized DHCP server.',
          '5. **How does the server know which subnet to assign?** The DHCP server inspects the `giaddr` field. Seeing `192.168.10.1`, it allocates an available IP from the matching `192.168.10.0/24` scope!',
          '',
          '### APIPA: Automatic Private IP Addressing (`169.254.0.0/16`)',
          'If a client broadcasts DHCP Discovers and receives zero replies after multiple retries (due to a dead DHCP server, unplugged relay, or VLAN mismatch):',
          '- Operating systems (Windows and macOS) activate **APIPA (RFC 3927 Link-Local Addressing)**.',
          '- The client automatically assigns itself an address in the reserved block **`169.254.1.0` through `169.254.254.255`** with subnet mask `255.255.0.0` (/16).',
          '- **Workplace Rule**: An APIPA address proves that the client NIC, cable, and driver are physically operational, but **DHCP communication failed completely**. Because APIPA assigns no default gateway, the machine cannot reach internet services.',
          '',
          '### Beat 3: Failure Modes & Workplace Diagnostics (Ticket #111)',
          'Diagnosing DHCP failure and APIPA fallback in production:',
          '- On Windows: Run `ipconfig /all` to confirm APIPA `169.254.x.x`. Run `ipconfig /release` followed by `ipconfig /renew` to force a new DORA handshake.',
          '- On Linux: Run `ip addr show eth0`, followed by `sudo dhclient -r eth0` (release) and `sudo dhclient -v eth0` (verbose renew).',
        ],
        keyTakeaway:
          'DHCP Relays cross router boundaries using giaddr. An address in 169.254.0.0/16 (APIPA) diagnoses that the physical link is up but DHCP discovery failed.',
        exampleQuery: '',
        exampleQueryExplanation: '',
        mcqs: [
          {
            id: 'net09-mcq-apipa-range',
            question:
              'A user machine displays IP 169.254.55.90 with subnet mask 255.255.0.0 and no default gateway. What does this indicate?',
            options: [
              'The machine successfully obtained a public IP from a cloud DHCP service',
              'The physical NIC is working, but DHCP negotiation failed or timed out, causing the OS to assign an APIPA link-local address',
              'The user is infected with malware that disabled the network card hardware',
              'The machine is connected to a Gigabit switch that requires IPv6 exclusively',
            ],
            correctIndex: 1,
            explanation:
              'APIPA (169.254.0.0/16) is a self-assigned fallback address generated by the operating system when DHCP discovery fails to receive an answer.',
          },
          {
            id: 'net09-mcq-relay-giaddr',
            question:
              'When a router configured with a DHCP Relay Agent receives a client broadcast, how does the centralized server know which subnet pool to draw from?',
            options: [
              'The server inspects the giaddr (Gateway IP Address) field, which the router populated with its local interface IP address',
              'The server uses DNS to look up the client hostname',
              'The server sends an ICMP Echo probe to all devices on the network',
              'The router forwards the client MAC address directly to the ISP',
            ],
            correctIndex: 0,
            explanation:
              'The DHCP relay agent populates the giaddr field with its own interface IP on the client subnet, directing the central DHCP server to allocate an address from that specific scope.',
          },
        ],
      },
      tasks: [
        {
          id: 'net09-p3-relay-apipa-diagnosis',
          title: 'Practice: DHCP Relay Agents & APIPA Troubleshooting',
          description:
            'Diagnose an employee workstation that has self-assigned a 169.254.x.x IP address and determine how DHCP relays operate.',
          instructions: [
            'An office workstation runs `ipconfig` and displays IPv4 Address: `169.254.44.120`.',
            'Analyze why this occurred and how cross-subnet DHCP configuration functions.',
            'Use the workplace diagnostic terminal to inspect APIPA status, release the stale configuration, and renew a valid DHCP lease.',
          ],
          type: 'guided',
          primaryTable: '',
          initialSql: '',
          solutionSql: 'NETWORKING_JUDGMENT_TASK',
          solutionExplanation:
            '169.254.x.x is an APIPA link-local address indicating the client received no DHCP reply. DHCP Relays fill giaddr to inform the centralized server which pool to use.',
          dhcp: {
            title: 'APIPA Fallback Diagnosis (169.254.0.0/16)',
            description:
              'Client discovery broadcast times out without a server response, falling back to RFC 3927 Automatic Private IP Addressing.',
            clientMac: '00:1A:2B:3C:4D:5E',
            scenarioMode: 'apipa_timeout',
            initialStep: 1,
          },
          terminal: {
            title: 'Workplace Diagnostic Terminal — Ticket #111 (Dual OS)',
            description:
              'Triage APIPA 169.254.x.x address fallback, release stale IP configurations, and trigger DHCP lease renewal on Windows and Linux.',
            prompt: 'admin@corp-pc:~$',
            initialOutput: [
              '====================================================================',
              '  WORKPLACE TICKET #111: DHCP FAILURE & APIPA FALLBACK TRIAGE',
              '====================================================================',
              'Investigating workstation self-assigned 169.254.x.x link-local IP.',
              'Supported commands:',
              '  - Windows: ipconfig /all',
              '             ipconfig /release',
              '             ipconfig /renew',
              '  - Linux:   ip addr show eth0',
              '             dhclient -r eth0',
              '             dhclient -v eth0',
            ].join('\n'),
            availableCommands: [
              'ipconfig /all',
              'ipconfig /release',
              'ipconfig /renew',
              'ip addr show eth0',
              'dhclient -r eth0',
              'dhclient -v eth0',
            ],
            commands: {
              'ipconfig /all': `Windows IP Configuration

   Host Name . . . . . . . . . . . . : DESKTOP-CORP-91
   Primary Dns Suffix  . . . . . . . : corp.acme.com
   Node Type . . . . . . . . . . . . : Hybrid
   IP Routing Enabled. . . . . . . . : No

Ethernet adapter Ethernet0:
   Connection-specific DNS Suffix  . : 
   Description . . . . . . . . . . . : Intel(R) Ethernet Connection I219-LM
   Physical Address. . . . . . . . . : 00-1A-2B-3C-4D-5E
   DHCP Enabled. . . . . . . . . . . : Yes
   Autoconfiguration Enabled . . . . : Yes
   Autoconfiguration IPv4 Address. . : 169.254.44.120(Preferred)
   Subnet Mask . . . . . . . . . . . : 255.255.0.0
   Default Gateway . . . . . . . . . : 
   NetBIOS over Tcpip. . . . . . . . : Enabled`,
              'ipconfig /release': `Windows IP Configuration

No operation can be performed on Ethernet0 while it has its media disconnected or configuration cleared.
IP address has been released for adapter Ethernet0.`,
              'ipconfig /renew': `Windows IP Configuration

Ethernet adapter Ethernet0:
   Connection-specific DNS Suffix  . : corp.acme.com
   IPv4 Address. . . . . . . . . . . : 192.168.1.105
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . . . : 192.168.1.1`,
              'ip addr show eth0': `2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc mq state UP group default qlen 1000
    link/ether 00:1a:2b:3c:4d:5e brd ff:ff:ff:ff:ff:ff
    inet 169.254.44.120/16 brd 169.254.255.255 scope link eth0
       valid_lft forever preferred_lft forever`,
              'dhclient -r eth0': `Killed old client process
Internet Systems Consortium DHCP Client 4.4.1
Released lease for eth0.`,
              'dhclient -v eth0': `Internet Systems Consortium DHCP Client 4.4.1
Listening on LPF/eth0/00:1a:2b:3c:4d:5e
Sending on   LPF/eth0/00:1a:2b:3c:4d:5e
Sending on   Socket/fallback
DHCPDISCOVER on eth0 to 255.255.255.255 port 67 interval 3 (xid=0x39a2f1b0)
DHCPOFFER of 192.168.1.105 from 192.168.1.1
DHCPREQUEST for 192.168.1.105 on eth0 to 255.255.255.255 port 67 (xid=0x39a2f1b0)
DHCPACK of 192.168.1.105 from 192.168.1.1 (xid=0x39a2f1b0)
bound to 192.168.1.105 -- renewal in 14400 seconds.`,
            },
            commandResponses: {
              'ipconfig /all': `Windows IP Configuration

   Host Name . . . . . . . . . . . . : DESKTOP-CORP-91
   Primary Dns Suffix  . . . . . . . : corp.acme.com
   Node Type . . . . . . . . . . . . : Hybrid
   IP Routing Enabled. . . . . . . . : No

Ethernet adapter Ethernet0:
   Connection-specific DNS Suffix  . : 
   Description . . . . . . . . . . . : Intel(R) Ethernet Connection I219-LM
   Physical Address. . . . . . . . . : 00-1A-2B-3C-4D-5E
   DHCP Enabled. . . . . . . . . . . : Yes
   Autoconfiguration Enabled . . . . : Yes
   Autoconfiguration IPv4 Address. . : 169.254.44.120(Preferred)
   Subnet Mask . . . . . . . . . . . : 255.255.0.0
   Default Gateway . . . . . . . . . : 
   NetBIOS over Tcpip. . . . . . . . : Enabled`,
              'ipconfig /release': `Windows IP Configuration

No operation can be performed on Ethernet0 while it has its media disconnected or configuration cleared.
IP address has been released for adapter Ethernet0.`,
              'ipconfig /renew': `Windows IP Configuration

Ethernet adapter Ethernet0:
   Connection-specific DNS Suffix  . : corp.acme.com
   IPv4 Address. . . . . . . . . . . : 192.168.1.105
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . . . : 192.168.1.1`,
              'ip addr show eth0': `2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc mq state UP group default qlen 1000
    link/ether 00:1a:2b:3c:4d:5e brd ff:ff:ff:ff:ff:ff
    inet 169.254.44.120/16 brd 169.254.255.255 scope link eth0
       valid_lft forever preferred_lft forever`,
              'dhclient -r eth0': `Killed old client process
Internet Systems Consortium DHCP Client 4.4.1
Released lease for eth0.`,
              'dhclient -v eth0': `Internet Systems Consortium DHCP Client 4.4.1
Listening on LPF/eth0/00:1a:2b:3c:4d:5e
Sending on   LPF/eth0/00:1a:2b:3c:4d:5e
Sending on   Socket/fallback
DHCPDISCOVER on eth0 to 255.255.255.255 port 67 interval 3 (xid=0x39a2f1b0)
DHCPOFFER of 192.168.1.105 from 192.168.1.1
DHCPREQUEST for 192.168.1.105 on eth0 to 255.255.255.255 port 67 (xid=0x39a2f1b0)
DHCPACK of 192.168.1.105 from 192.168.1.1 (xid=0x39a2f1b0)
bound to 192.168.1.105 -- renewal in 14400 seconds.`,
            },
          },
          hints: [
            {
              level: 1,
              text: '169.254.0.0/16 is reserved for RFC 3927 link-local autoconfiguration when DHCP fails.',
            },
            {
              level: 2,
              text: 'The giaddr field tells the centralized server which subnet pool the client belongs to.',
            },
          ],
          validation: {
            judgment: [
              {
                kind: 'choose-and-defend',
                prompt:
                  'A support ticket reports a user cannot access internal web servers or the internet. `ipconfig` shows IP `169.254.89.201` and Subnet Mask `255.255.0.0`. What is the primary diagnosis?',
                options: [
                  'The user has connected to an external public IP on the internet and ISP routing is working correctly',
                  'The client failed to receive a DHCP response (server down, pool exhausted, or VLAN misconfiguration) and fell back to APIPA autoconfiguration',
                  'The user has a static IP collision with the default gateway',
                  'The network interface card has suffered hardware failure and cannot send Ethernet frames',
                ],
                correctIndex: 1,
                explanation:
                  '169.254.x.x is an APIPA address assigned automatically by the operating system when DHCP discovery times out without a response.',
              },
              {
                kind: 'choose-and-defend',
                prompt:
                  'When a router configured with a DHCP Relay Agent receives a client broadcast, how does the centralized DHCP server know which subnet IP pool to draw from?',
                options: [
                  'The server guesses based on the client MAC address vendor prefix',
                  'The router places its own LAN interface IP address into the DHCP header giaddr field before unicasting to the server',
                  'The server broadcasts back to all routers on the corporate network',
                  'The router translates the client source port to 443',
                ],
                correctIndex: 1,
                explanation:
                  'The DHCP Relay Agent writes its incoming LAN interface IP into the giaddr (gateway IP address) field. The centralized server uses giaddr to select the appropriate address pool.',
              },
            ],
          },
          successMessage:
            'Excellent! You understand the critical diagnostic role of 169.254.x.x APIPA and how DHCP Relay Agents bridge broadcast domains using giaddr.',
        },
      ],
    },
  ],

  challenge: {
    id: 'net09-challenge',
    title: 'Module 9 Challenge: DHCP Forensics & Enterprise Triage',
    scenario:
      'Diagnose complex DHCP anomalies in an enterprise network, including rogue DHCP server interference and cross-VLAN relay failures.',
    tasks: [
      {
        id: 'net09-ch1-rogue-dhcp-detection',
        title: 'Challenge 1: Rogue DHCP Server & DHCP Snooping Analysis',
        description:
          'Identify the symptoms of a rogue DHCP server and determine how enterprise switches defend against it.',
        instructions: [
          'Multiple users on Floor 3 suddenly lose internet access.',
          'Their workstations report default gateway: `192.168.1.1` instead of corporate gateway `10.50.0.1`.',
          'Investigation reveals an employee brought an unauthorized home Wi-Fi router and plugged its LAN port into a wall jack.',
          'Explain why clients accepted the wrong settings and how enterprise switches prevent this.',
        ],
        type: 'challenge',
        primaryTable: '',
        initialSql: '',
        solutionSql: 'NETWORKING_JUDGMENT_TASK',
        solutionExplanation:
          'DHCP clients accept the first valid DHCP Offer they receive. DHCP Snooping on switches marks access ports as untrusted and drops unauthorized DHCP server replies.',
        dhcp: {
          title: 'Rogue DHCP Server Detection & Snooping Defense',
          description:
            'A rogue home router offers incorrect gateway 192.168.1.1 competing with legitimate corporate server 10.50.0.1.',
          clientMac: '00:22:33:44:55:66',
          primaryServer: {
            name: 'Corporate DHCP Server',
            serverIp: '10.50.0.1',
            serverMac: '00:00:0C:07:AC:01',
            offeredIp: '10.50.0.125',
            subnetMask: '255.255.255.0 (/24)',
            gateway: '10.50.0.1',
            dns: '10.50.0.10, 10.50.0.11',
            leaseTimeSeconds: 28800,
          },
          competingServer: {
            name: 'Rogue Wi-Fi Router (Floor 3)',
            serverIp: '192.168.1.1',
            serverMac: '00:14:D1:E2:34:56',
            offeredIp: '192.168.1.100',
            subnetMask: '255.255.255.0 (/24)',
            gateway: '192.168.1.1',
            dns: '192.168.1.1',
            leaseTimeSeconds: 86400,
            isRogue: true,
          },
          initialStep: 2,
          scenarioMode: 'competing_servers',
        },
        hints: [
          {
            level: 1,
            text: 'DHCP clients do not verify server identity; they accept whichever Offer arrives first.',
          },
          {
            level: 2,
            text: 'DHCP Snooping configures switch ports as trusted (uplinks to real servers) or untrusted (user access ports).',
          },
        ],
        validation: {
          judgment: [
            {
              kind: 'choose-and-defend',
              prompt:
                'Why did the workstations accept configuration parameters from the rogue home router instead of the corporate DHCP server?',
              options: [
                'The home router had a higher priority configured in RFC 2131 headers',
                'DHCP clients accept whichever valid DHCP Offer arrives first; because the rogue router was physically closer on the local switch, its Offer reached the clients faster than the relayed corporate offer',
                'The corporate DHCP server refused to issue leases to Windows workstations',
                'Home routers use UDP port 67 while corporate servers use TCP port 80',
              ],
              correctIndex: 1,
              explanation:
                'DHCP client behavior is first-come, first-served. A local rogue server responds faster than a centralized corporate server traversing relays, winning the race condition.',
            },
            {
              kind: 'choose-and-defend',
              prompt:
                'What enterprise switch security feature prevents unauthorized devices on access ports from responding to DHCP Discovers?',
              options: [
                'Spanning Tree Protocol (STP)',
                'DHCP Snooping (classifying access ports as untrusted and dropping server replies from them)',
                'Port Mirroring (SPAN)',
                'Dynamic ARP Inspection without DHCP bindings',
              ],
              correctIndex: 1,
              explanation:
                'DHCP Snooping designates switch ports as trusted or untrusted. Access ports are untrusted; if a DHCP Offer or ACK appears on an untrusted port, the switch discards it.',
            },
          ],
        },
        successMessage:
          'Challenge 1 mastered! You identified the first-offer race condition and how DHCP Snooping secures switch ports against rogue servers.',
      },
      {
        id: 'net09-ch2-apipa-triage',
        title: 'Challenge 2: Enterprise APIPA Triage & Relay Configuration',
        description:
          'Resolve a branch office outage where all newly provisioned workstations receive 169.254.x.x addresses.',
        instructions: [
          'A company opens a new branch office on subnet 10.20.30.0/24.',
          'The router connects to the headquarters WAN, where the corporate DHCP server resides at 10.0.0.50.',
          'All PCs in the branch get 169.254.x.x addresses after booting.',
          'Identify the missing configuration on the branch router.',
        ],
        type: 'challenge',
        primaryTable: '',
        initialSql: '',
        solutionSql: 'NETWORKING_JUDGMENT_TASK',
        solutionExplanation:
          'The branch router interface requires a DHCP Relay Agent (ip helper-address 10.0.0.50) to forward client broadcast Discovers to the centralized server.',
        hints: [
          {
            level: 1,
            text: 'Routers do not forward 255.255.255.255 broadcasts across WAN links without a relay helper.',
          },
          {
            level: 2,
            text: 'The router LAN interface must be configured with ip helper-address pointing to 10.0.0.50.',
          },
        ],
        validation: {
          judgment: [
            {
              kind: 'choose-and-defend',
              prompt:
                'Why did all PCs at the branch office fail to receive IP addresses from the central DHCP server?',
              options: [
                'Branch PCs require static IP addresses; DHCP is only supported on the local headquarters LAN',
                'The branch router dropped the clients\' broadcast DHCP Discovers because routers do not forward Layer 3 broadcasts without a DHCP Relay Agent configured',
                'The central DHCP server rejected the requests because branch PCs used 100 Mbps Ethernet instead of Gigabit',
                'The DNS server blocked UDP port 67',
              ],
              correctIndex: 1,
              explanation:
                'Client DHCP Discovers are sent to 255.255.255.255. Routers drop broadcasts by default. Without an ip helper-address relay, the central server never sees the requests.',
            },
          ],
        },
        successMessage:
          'Challenge 2 cleared! You recognized the broadcast barrier and identified the need for a DHCP Relay Agent.',
      },
    ],
  },
};
