import { ModuleData } from '../../../types/curriculum';
import type { MentorScript } from '../../../types/networking-curriculum';

export const NET_14_MENTOR_SCRIPT: MentorScript = {
  version: '1.0.0',
  moduleId: 'net-14',
  stageTitle: '5-Layer Office Outage Triage Lab',
  stageSubtitle: 'Step-by-step diagnostic isolation from physical copper link to DNS and transit hops',
  initialStageState: {
    spotlight: 'terminal',
    highlightedField: 'link',
  },
  revealLadder: {
    'step-link': ['diag-link'],
    'step-ip': ['diag-link', 'diag-ip'],
    'step-gateway': ['diag-link', 'diag-ip', 'diag-gateway'],
    'step-dns': ['diag-link', 'diag-ip', 'diag-gateway', 'diag-dns'],
    'step-trace': ['diag-link', 'diag-ip', 'diag-gateway', 'diag-dns', 'diag-trace'],
  },
  terms: {
    'icmp-echo': {
      term: 'ICMP Echo',
      definition: 'Layer 3 diagnostic protocol where Type 8 Request generates a Type 0 Reply.',
      part: 'diag-link',
    },
    'default-gateway': {
      term: 'Default Gateway',
      definition: 'The local router interface bridging your subnet to external networks.',
      part: 'diag-gateway',
    },
    'dns-demarcation': {
      term: 'DNS Demarcation',
      definition: 'Testing reachability by IP vs name to isolate name resolution from routing.',
      part: 'diag-dns',
    },
    'ttl-traceroute': {
      term: 'Traceroute TTL Probing',
      definition: 'Sending incremental TTL packets that expire to map hop-by-hop routers.',
      part: 'diag-trace',
    },
  },
  beats: [
    {
      id: 'b1',
      kind: 'say',
      text: "An employee panics: 'The internet is dead!' As a network engineer, you test systematically instead of guessing.",
      revealedParts: ['diag-link'],
    },
    {
      id: 'b2',
      kind: 'predict',
      text: 'Step 1: You run ping 8.8.8.8 and it replies in 12ms. But ping google.com fails. What is broken?',
      prompt: 'Select the failing network boundary:',
      options: [
        { id: 'opt-phys', text: 'The physical Ethernet cable was unplugged from the wall.', isCorrect: false },
        { id: 'opt-gw', text: 'The local default gateway router has crashed.', isCorrect: false },
        { id: 'opt-dns', text: 'The DNS name server is unreachable or unconfigured.', isCorrect: true },
      ],
      whyPrompt: 'Why does this test isolate DNS?',
      whyOptions: [
        { id: 'why-dns', text: 'Public IP routing works end-to-end, so only domain name translation is failing.', isCorrect: true },
        { id: 'why-wrong', text: 'Because 8.8.8.8 is a link-local address that never touches a router.', isCorrect: false },
      ],
      revealedParts: ['diag-link', 'diag-ip'],
    },
    {
      id: 'b3',
      kind: 'point',
      target: 'diag-gateway',
      text: 'Ping 8.8.8.8 proves physical link, local IP, and default gateway routing are 100% healthy.',
      revealedParts: ['diag-link', 'diag-ip', 'diag-gateway'],
    },
    {
      id: 'b4',
      kind: 'action',
      prompt: 'Isolate the {{term:dns-demarcation}} failure by querying the DNS server directly.',
      buttonLabel: 'Demarcate DNS',
      targetState: { spotlight: 'dns-check' },
      revealedParts: ['diag-link', 'diag-ip', 'diag-gateway', 'diag-dns'],
    },
    {
      id: 'b5',
      kind: 'say',
      text: 'What if a remote website is unreachable across the wide internet? How do you locate the failing router?',
      revealedParts: ['diag-link', 'diag-ip', 'diag-gateway', 'diag-dns'],
    },
    {
      id: 'b6',
      kind: 'predict',
      text: 'How does traceroute identify each intermediate router along an unknown internet path?',
      prompt: 'Select the hop discovery mechanism:',
      options: [
        { id: 'opt-ttl', text: 'It sends probes with incremental TTL=1, 2, 3... that expire at each hop.', isCorrect: true },
        { id: 'opt-ask', text: 'It requests a full copy of the internet BGP routing table from the ISP.', isCorrect: false },
        { id: 'opt-arp', text: 'It broadcasts Layer 2 ARP frames across all transit routers.', isCorrect: false },
      ],
      whyPrompt: 'Why does TTL expiration expose routers?',
      whyOptions: [
        { id: 'why-icmp', text: 'Routers decrement TTL to 0, discard the probe, and reply with ICMP Time Exceeded.', isCorrect: true },
        { id: 'why-bad', text: 'Because expired packets write the router hostname onto the physical fiber.', isCorrect: false },
      ],
      revealedParts: ['diag-link', 'diag-ip', 'diag-gateway', 'diag-dns', 'diag-trace'],
    },
    {
      id: 'b7',
      kind: 'point',
      target: 'diag-trace',
      text: 'Every router that decrements TTL to 0 sends an ICMP error, completing {{term:ttl-traceroute}}.',
      revealedParts: ['diag-link', 'diag-ip', 'diag-gateway', 'diag-dns', 'diag-trace'],
    },
    {
      id: 'b8',
      kind: 'debrief',
      text: 'By systematically checking link, IP, gateway, DNS, and transit hops, you solve any outage without guesswork.',
      revealedParts: ['diag-link', 'diag-ip', 'diag-gateway', 'diag-dns', 'diag-trace'],
    },
  ],
  ticketScene: {
    ticketId: 'TCK-114',
    title: 'Office Outage: Can Ping Gateway But No Web Browsing',
    symptom: 'Workstation ACME-PC-04 cannot open company portals. Ping to 192.168.1.1 succeeds, ping to 8.8.8.8 succeeds, but ping to corp.internal fails with Unknown Host.',
    options: [
      { id: 'opt1', text: 'Replace the physical network adapter card.', isCorrect: false },
      { id: 'opt2', text: 'DNS resolver is misconfigured or pointing to an unreachable DNS server IP.', isCorrect: true },
      { id: 'opt3', text: 'Reboot the building core default gateway router.', isCorrect: false },
    ],
    repairActions: [
      { id: 'rep1', text: 'Re-seat the RJ-45 copper patch cable in the wall jack.', isCorrect: false },
      {
        id: 'rep2',
        text: 'Configure primary DNS server to 192.168.1.10 and flush OS resolver cache with ipconfig /flushdns.',
        isCorrect: true,
        patch: { action: 'set_dns_and_flush', target: 'ACME-PC-04' },
      },
      { id: 'rep3', text: 'Assign an APIPA 169.254.1.1 static fallback address.', isCorrect: false },
    ],
  },
};

/**
 * net-14: Diagnostics & Windows Office Troubleshooting
 * ─────────────────────────────────────────────────────────────────────────────
 * Milestone 6 — Concepts C43, C44, C45
 * Teaches systematic network diagnosis: ICMP Echo and Traceroute mechanics,
 * essential CLI diagnostic utilities (ipconfig, ping, tracert, nslookup, netstat),
 * and the 5 Classic Office Failures (Cable/Link, APIPA, Gateway, DNS, Port).
 */

export const NET_14_MODULE: ModuleData = {
  id: 'net-14',
  slug: 'diagnostics-and-windows-office-troubleshooting',
  day: 14,
  title: 'Module 14: Diagnostics & Windows Office Troubleshooting',
  shortTitle: 'Diagnostics & Troubleshooting',
  type: 'module',
  track: 'networking',
  milestoneId: 'net-milestone-6',
  description:
    'Master systematic network troubleshooting from Layer 1 to Layer 7: ICMP Echo and Traceroute hop analysis, essential command-line diagnostics (ipconfig, ping, tracert, nslookup, netstat), and isolating the 5 Classic Office Failures.',
  estimatedMinutes: 35,
  curriculumOrder: 14,
  displayLabel: 'Module 14',
  completionLearnings: [
    'ICMP operates at Layer 3 to communicate diagnostic information; Ping uses Echo Request (Type 8) and Echo Reply (Type 0)',
    'Traceroute (tracert on Windows) maps internet paths by sending probes with incremental TTL values (TTL=1, 2, 3...) and recording the IP of routers returning ICMP Time Exceeded (Type 11 Code 0)',
    'ipconfig /all displays MAC address, IP, subnet mask, default gateway, DHCP server, and DNS servers; /flushdns purges the local OS DNS cache',
    'nslookup and dig query DNS servers directly, bypassing the local browser cache to isolate name resolution issues from web server failures',
    'netstat -ano displays active network connections, listening ports, and the corresponding operating system Process ID (PID)',
    'The 5 Classic Office Failures follow the OSI stack: 1) Physical cable/link drop, 2) APIPA 169.254.x.x DHCP failure, 3) Default gateway unreachable, 4) DNS resolution failure, and 5) Firewall/port block',
    'The golden test for DNS failure: if you can ping a public IP address (e.g. 8.8.8.8) but cannot open websites by domain name, IP routing is healthy and DNS is broken',
  ],
  concepts: [
    // ─────────────────────────────────────────────────────
    // Concept 1: ICMP Ping & Traceroute Mechanics (C43)
    // ─────────────────────────────────────────────────────
    {
      id: 'net14-c1-icmp-diagnostics',
      order: 1,
      title: 'ICMP Diagnostics: Ping & Traceroute Mechanics',
      shortDescription:
        'Understand how ICMP enables network probing: Echo Request/Reply types and the clever TTL increment mechanism powering traceroute.',
      theory: {
        mentorScript: NET_14_MENTOR_SCRIPT,
        summary:
          'The Internet Control Message Protocol (ICMP) operates at Layer 3 to communicate diagnostic telemetry and transmission errors without application sockets. Traceroute exploits the IPv4 Time-to-Live (TTL) field by transmitting incremental probe packets (TTL=1, 2, 3...); each intermediate router decrements the TTL to zero, discards the packet, and responds with an ICMP Time Exceeded (Type 11 Code 0) datagram, systematically exposing the hop-by-hop topology across the internet.',
        explanation: [
          '### Beat 1: The Physical Cause — Transient Packet Decay & The Decrement Rule',
          'Every IPv4 packet travelling across physical fibers and Ethernet links contains an 8-bit Time-to-Live (TTL) header field (or Hop Limit in IPv6). The physical purpose of the TTL is to prevent runaway packets from circulating forever in routing loops and melting link capacity. According to RFC 791, every Layer 3 router that receives an IP packet must decrement its TTL field by at least 1 before forwarding. If a router decrements the TTL and the value hits 0, hardware ASICs are strictly prohibited from forwarding the packet onto the next physical link.',
          '',
          '### Beat 2: The Wire / System Consequence — ICMP Error Dispatch & Hop Discovery',
          'When a router drops a packet whose TTL expired to 0, it does not drop it silently. Instead, the router generates an Internet Control Message Protocol (ICMP) Type 11 Code 0 ("Time Exceeded in Transit") datagram directed back to the packet\'s original source IP, encapsulating the original IP header and the first 64 bits of the dropped payload. Traceroute (`tracert` on Windows) exploits this mechanism: it intentionally sends packets with TTL=1. The first upstream router decrements the TTL to 0, drops the packet, and replies with ICMP Type 11, identifying Hop 1. Traceroute then sends a packet with TTL=2, discovering Hop 2, and continues incrementing TTL until reaching the destination. If an intermediate hop shows `* * *`, it usually does not mean an outage; rather, the router is prioritizing transit forwarding and rate-limiting CPU-generated ICMP error replies.',
          '',
          '### Beat 3: The Diagnostic / Operational Fix — Latency Triage & Hop Demarcation',
          'Network engineers deploy Ping (ICMP Type 8 Echo Request / Type 0 Echo Reply) to verify end-to-end reachability and round-trip latency. When ping fails or latency spikes, traceroute reveals the precise physical boundary of the fault: if Round Trip Time (RTT) jumps from 15ms at Hop 4 to 280ms at Hop 5, or if Hop 5 permanently returns "Destination Unreachable" (ICMP Type 3), engineers pinpoint the exact transit provider, undersea fiber link, or enterprise gateway responsible for the degradation.',
        ],
        keyTakeaway:
          'Ping verifies end-to-end reachability using ICMP Type 8/0. Traceroute maps intermediate router hops by transmitting incremental TTL probes and collecting ICMP Type 11 Time Exceeded replies.',
        exampleQuery: '',
        exampleQueryExplanation: '',
        mcqs: [
          {
            id: 'net14-mcq-icmp-types',
            question:
              'Which ICMP message types correspond to a standard Ping Request and its successful Reply?',
            options: [
              'Type 3 (Destination Unreachable) and Type 11 (Time Exceeded)',
              'Type 8 (Echo Request) and Type 0 (Echo Reply)',
              'Type 1 (Echo Request) and Type 2 (Echo Reply)',
              'Type 80 (HTTP Request) and Type 443 (HTTPS Reply)',
            ],
            correctIndex: 1,
            correctAnswerIndex: 1,
            explanation:
              'Standard ICMP echo diagnostic probing uses Type 8 for the initial Echo Request sent by the client, and Type 0 for the Echo Reply generated by the target host upon receipt.',
          },
          {
            id: 'net14-mcq-tracert-ttl',
            question:
              'How does the Windows `tracert` utility discover the IP address of the fourth router along an internet path?',
            options: [
              'It asks the local DNS resolver to look up the fourth router\'s hostname',
              'It transmits an IP probe with a Time-To-Live (TTL) of 4; the fourth router decrements the TTL to 0, drops the packet, and transmits an ICMP Type 11 (Time Exceeded) message back to the source',
              'It sends an Ethernet broadcast frame with destination MAC FF:FF:FF:FF:FF:FF',
              'It reads the remote router\'s routing table using SNMP',
            ],
            correctIndex: 1,
            correctAnswerIndex: 1,
            explanation:
              'Traceroute relies on incremental TTL values. A probe with TTL=4 travels through hops 1, 2, and 3 (where TTL becomes 3, 2, 1). When it arrives at hop 4, the TTL is decremented to 0. Hop 4 drops the packet and generates an ICMP Type 11 Code 0 error back to the sender, exposing Hop 4\'s IP address.',
          },
        ],
      },
      tasks: [
        {
          id: 'net14-p1-icmp-trace-eval',
          title: 'Practice: Analyzing Traceroute Probes & ICMP Messages',
          description:
            'Inspect traceroute output and determine the technical rule governing router replies.',
          instructions: [
            'A network engineer runs `tracert 93.184.216.34` from a Windows laptop.',
            'Answer the judgment questions on TTL behavior and ICMP response types.',
          ],
          type: 'guided',
          primaryTable: '',
          initialSql: '',
          solutionSql: 'NETWORKING_JUDGMENT_TASK',
          solutionExplanation:
            'Traceroute sends packets with TTL=1, 2, 3... Intermediate routers decrement TTL to 0 and reply with ICMP Type 11 Time Exceeded.',
          hints: [
            {
              level: 1,
              text: 'When an intermediate router drops a packet due to TTL=0, it informs the source using ICMP Type 11.',
            },
            {
              level: 2,
              text: 'Asterisks in the middle of a working trace mean that specific router refuses to generate ICMP replies.',
            },
          ],
          terminal: {
            title: 'Diagnostic Terminal — ICMP Ping & Traceroute Inspection',
            description: 'Run diagnostic traceroute and ping commands to observe TTL behavior and intermediate router hops.',
            hostname: 'IT-ADMIN-PC',
            userPrompt: 'C:\\Users\\admin>',
            prompt: 'C:\\Users\\admin>',
            initialLines: [
              'Microsoft Windows [Version 10.0.19045.3803]',
              '(c) Microsoft Corporation. All rights reserved.',
              '',
              'Type "tracert 93.184.216.34" or "ping 93.184.216.34" to test path metrics.',
            ],
            initialOutput: [
              'Microsoft Windows [Version 10.0.19045.3803]',
              '(c) Microsoft Corporation. All rights reserved.',
              '',
              'Type "tracert 93.184.216.34" or "ping 93.184.216.34" to test path metrics.',
            ].join('\n'),
            availableCommands: [
              'tracert 93.184.216.34',
              'ping 93.184.216.34',
              'ipconfig /all',
              'nslookup example.com',
            ],
            commands: {
              'tracert 93.184.216.34': `Tracing route to 93.184.216.34 over a maximum of 30 hops:

  1    <1 ms    <1 ms    <1 ms  192.168.1.1
  2     3 ms     2 ms     3 ms  10.0.24.1
  3     8 ms     7 ms     9 ms  198.51.100.1
  4    12 ms    11 ms    12 ms  93.184.216.34

Trace complete.`,
              'ping 93.184.216.34': `Pinging 93.184.216.34 with 32 bytes of data:
Reply from 93.184.216.34: bytes=32 time=12ms TTL=56
Reply from 93.184.216.34: bytes=32 time=11ms TTL=56
Reply from 93.184.216.34: bytes=32 time=12ms TTL=56
Reply from 93.184.216.34: bytes=32 time=12ms TTL=56

Ping statistics for 93.184.216.34:
    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),
Approximate round trip times in milli-seconds:
    Minimum = 11ms, Maximum = 12ms, Average = 11ms`,
              'ipconfig /all': `Windows IP Configuration
   Host Name . . . . . . . . . . . . : IT-ADMIN-PC
   Primary Dns Suffix  . . . . . . . : corp.internal
   IPv4 Address. . . . . . . . . . . : 192.168.1.100(Preferred)
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . . . : 192.168.1.1
   DNS Servers . . . . . . . . . . . : 192.168.1.1`,
              'nslookup example.com': `Server:  corp-dns.internal
Address:  192.168.1.1

Non-authoritative answer:
Name:    example.com
Address:  93.184.216.34`,
            },
            commandResponses: {
              'tracert 93.184.216.34': `Tracing route to 93.184.216.34:
  1    <1 ms  192.168.1.1
  2     2 ms  10.0.24.1
  3     7 ms  198.51.100.1
  4    11 ms  93.184.216.34
Trace complete.`,
              'ping 93.184.216.34': `Reply from 93.184.216.34: bytes=32 time=11ms TTL=56
Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)`,
              'ipconfig /all': `IPv4 Address: 192.168.1.100, Gateway: 192.168.1.1, DNS: 192.168.1.1`,
              'nslookup example.com': `Name: example.com, Address: 93.184.216.34`,
            },
            customResponses: {
              'tracert 93.184.216.34': [
                'Tracing route to 93.184.216.34 over a maximum of 30 hops:',
                '',
                '  1    <1 ms    <1 ms    <1 ms  192.168.1.1',
                '  2     3 ms     2 ms     3 ms  10.0.24.1',
                '  3     8 ms     7 ms     9 ms  198.51.100.1',
                '  4    12 ms    11 ms    12 ms  93.184.216.34',
                '',
                'Trace complete.',
              ],
              'ping 93.184.216.34': [
                'Pinging 93.184.216.34 with 32 bytes of data:',
                'Reply from 93.184.216.34: bytes=32 time=12ms TTL=56',
                'Reply from 93.184.216.34: bytes=32 time=11ms TTL=56',
                'Reply from 93.184.216.34: bytes=32 time=12ms TTL=56',
                'Reply from 93.184.216.34: bytes=32 time=12ms TTL=56',
                '',
                'Ping statistics for 93.184.216.34:',
                '    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),',
                'Approximate round trip times in milli-seconds:',
                '    Minimum = 11ms, Maximum = 12ms, Average = 11ms',
              ],
            },
          },
          validation: {
            judgment: [
              {
                kind: 'choose-and-defend',
                prompt:
                  'How does the `tracert` utility discover the IP address of the third router along an internet path?',
                options: [
                  'It queries the DNS root server for the third router\'s name',
                  'It transmits an IP packet with TTL = 3; the third router decrements TTL to 0, drops the packet, and transmits an ICMP Time Exceeded (Type 11) message back to the source',
                  'It sends a broadcast ARP request across the WAN',
                  'It reads the BGP routing table stored on the client laptop',
                ],
                correctIndex: 1,
                explanation:
                  'By setting TTL=3, the packet expires exactly when it reaches the third hop. That router drops the expired packet and generates an ICMP Time Exceeded message, revealing its IP address.',
              },
              {
                kind: 'choose-and-defend',
                prompt:
                  'In a traceroute output, Hop 5 displays `* * * Request timed out`, but Hop 6 and the final destination (Hop 7) respond with low latency and 0% loss. What is the cause of Hop 5\'s asterisks?',
                options: [
                  'The cable between Hop 5 and Hop 6 is severed',
                  'Router 5 is configured to ignore or rate-limit generating ICMP Time Exceeded messages, but it continues forwarding transit data traffic normally',
                  'The client laptop has an IP address conflict',
                  'Hop 5 is running IPv6 instead of IPv4',
                ],
                correctIndex: 1,
                explanation:
                  'Since subsequent hops and the destination respond normally, transit forwarding through Hop 5 is healthy. Many core routers intentionally suppress generating ICMP error replies to protect CPU resources.',
              },
            ],
          },
          successMessage:
            'Correct! Traceroute maps hops via incremental TTL expiration and ICMP Type 11 messages.',
        },
      ],
    },

    // ─────────────────────────────────────────────────────
    // Concept 2: Core Host Diagnostics CLI (C44)
    // ─────────────────────────────────────────────────────
    {
      id: 'net14-c2-cli-diagnostics',
      order: 2,
      title: 'Host Diagnostic Utilities: ipconfig, nslookup & netstat',
      shortDescription:
        'Master the command-line tools for endpoint inspection: IP/DHCP interrogation, DNS resolution testing, and socket listening verification.',
      theory: {
        summary:
          'Operating system networking relies on internal kernel state tables: the IP interface stack, local DNS client resolver caches, and Layer 4 socket binding tables. Standard command-line diagnostic utilities (`ipconfig`, `nslookup`, `netstat`) interrogate these subsystems directly, enabling engineers to isolate whether an issue stems from an unassigned IP lease, stale cached DNS mappings, or an unstarted backend application process.',
        explanation: [
          '### Beat 1: The Physical Cause — Ephemeral Leases, Cached TTLs & Socket Bindings',
          'Modern operating systems decouple hardware interfaces from application code via several kernel layers. An Ethernet or Wi-Fi adapter requires dynamic Layer 3 addressing via DHCP, maintaining lease timers that count down and eventually expire. Simultaneously, to reduce WAN traffic and latency, the operating system caches every DNS query result in RAM according to the record\'s TTL. At Layer 4, server processes request the OS kernel to bind specific TCP/UDP port numbers and transition into a listening socket state. If an interface cable drops, a DHCP server runs out of addresses, a DNS record changes before its TTL expires in local RAM, or a service fails to bind to its listening socket, network communication silently fails.',
          '',
          '### Beat 2: The Wire / System Consequence — State Divergence & The "Works on My Machine" Syndrome',
          'When internal network state diverges from reality, applications produce cryptic errors ("Server Not Found", "Connection Refused"). If a system administrator updates a corporate web server\'s IP address, remote clients whose OS DNS cache contains the old IP continue attempting connections to the dead address until the TTL expires—producing apparent downtime while other users connect normally. If an application daemon crashes, the TCP port closes, and inbound SYN packets are immediately met with TCP RST packets from the kernel, leading developers to falsely suspect firewall interference.',
          '',
          '### Beat 3: The Diagnostic / Operational Fix — Target Subsystem Interrogation',
          'Network technicians deploy three specialized CLI tools to interrogate each layer with surgical precision:',
          '- `ipconfig /all`: Audits the physical MAC address, assigned IPv4/IPv6 address, subnet mask, default gateway, and DHCP/DNS server IPs. If the lease expired or failed, `ipconfig /release` and `ipconfig /renew` force a fresh DORA exchange.',
          '- `ipconfig /flushdns`: Flushes and purges the local OS DNS resolver cache from memory, forcing subsequent name resolutions to query authoritative DNS servers directly.',
          '- `nslookup domain [dns-server]`: Bypasses OS resolver caches and local hosts files entirely by sending raw UDP 53 queries directly to a specified DNS server, isolating whether DNS server records are accurate.',
          '- `netstat -ano`: Dumps the kernel socket table showing all active TCP connections and listening ports in numeric format (`-n`), including the owning Process ID (`-o`) for immediate correlation in Task Manager or process monitors.',
        ],
        keyTakeaway:
          'Use ipconfig /all to verify interface IP/gateway configuration, /flushdns to purge stale cache, nslookup to query DNS servers directly, and netstat -ano to verify listening ports and PIDs.',
        exampleQuery: '',
        exampleQueryExplanation: '',
        mcqs: [
          {
            id: 'net14-mcq-flushdns',
            question:
              'A web developer updates a corporate domain\'s IP address, but their local Windows PC continues loading the decommissioned web server. Which command purges stale domain-to-IP mappings from the operating system\'s local resolver memory?',
            options: [
              'ipconfig /release',
              'ipconfig /flushdns',
              'ping -t 127.0.0.1',
              'route -f',
            ],
            correctIndex: 1,
            correctAnswerIndex: 1,
            explanation:
              'The `ipconfig /flushdns` command completely purges the Windows DNS client resolver cache, forcing the OS to issue a new query to configured DNS servers for subsequent requests.',
          },
          {
            id: 'net14-mcq-netstat-ano',
            question:
              'An IT security analyst suspects an unauthorized program is listening on TCP port 4444. Which Windows command lists all listening ports numerically along with the owning Process ID (PID)?',
            options: [
              'netstat -ano',
              'ipconfig /all',
              'tracert -d 4444',
              'ping -n 4444 localhost',
            ],
            correctIndex: 0,
            correctAnswerIndex: 0,
            explanation:
              '`netstat -ano` displays all active connections and listening ports (-a), displays addresses and port numbers numerically (-n), and displays the owning Process ID (-o), allowing administrators to identify the executable in Task Manager.',
          },
        ],
      },
      tasks: [
        {
          id: 'net14-p2-cli-commands',
          title: 'Practice: Selecting Diagnostic Commands for Network Scenarios',
          description:
            'Match network troubleshooting objectives to the correct CLI command and flags.',
          instructions: [
            'Review IT support tickets requiring command-line intervention.',
            'Answer the judgment questions on utility commands and output analysis.',
          ],
          type: 'guided',
          primaryTable: '',
          initialSql: '',
          solutionSql: 'NETWORKING_JUDGMENT_TASK',
          solutionExplanation:
            'ipconfig /flushdns clears DNS cache. netstat -ano identifies listening ports and process IDs. nslookup queries DNS directly.',
          hints: [
            {
              level: 1,
              text: 'flushdns removes cached domain-to-IP mappings from the OS memory.',
            },
            {
              level: 2,
              text: 'The -o flag in netstat outputs the PID.',
            },
          ],
          terminal: {
            title: 'Diagnostic Terminal — Core Windows CLI Diagnostics',
            description: 'Execute ipconfig, nslookup, and netstat commands to inspect endpoint configuration and socket states.',
            hostname: 'CORP-WS-04',
            userPrompt: 'C:\\Users\\engineer>',
            prompt: 'C:\\Users\\engineer>',
            initialLines: [
              'Windows PowerShell Diagnostics Console',
              'Ready for diagnostic command execution.',
            ],
            initialOutput: [
              'Windows PowerShell Diagnostics Console',
              'Ready for diagnostic command execution.',
            ].join('\n'),
            availableCommands: [
              'ipconfig /all',
              'ipconfig /flushdns',
              'netstat -ano',
              'nslookup example.com',
            ],
            commands: {
              'ipconfig /all': `Windows IP Configuration
   Host Name . . . . . . . . . . . . : CORP-WS-04
   Primary Dns Suffix  . . . . . . . : corp.local
   Node Type . . . . . . . . . . . . : Hybrid
   IP Routing Enabled. . . . . . . . : No
   WINS Proxy Enabled. . . . . . . . : No

Ethernet adapter vEthernet (Default Switch):
   Connection-specific DNS Suffix  . : 
   Description . . . . . . . . . . . : Intel(R) Ethernet Connection I219-LM
   Physical Address. . . . . . . . . : 00-1A-2B-3C-4D-5E
   DHCP Enabled. . . . . . . . . . . : Yes
   IPv4 Address. . . . . . . . . . . : 10.0.10.45(Preferred) 
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . . . : 10.0.10.1
   DHCP Server . . . . . . . . . . . : 10.0.10.1
   DNS Servers . . . . . . . . . . . : 10.0.10.2, 8.8.8.8`,
              'ipconfig /flushdns': `Windows IP Configuration

Successfully flushed the DNS Resolver Cache.`,
              'netstat -ano': `Active Connections

  Proto  Local Address          Foreign Address        State           PID
  TCP    0.0.0.0:80             0.0.0.0:0              LISTENING       4
  TCP    0.0.0.0:135            0.0.0.0:0              LISTENING       840
  TCP    0.0.0.0:443            0.0.0.0:0              LISTENING       4
  TCP    0.0.0.0:4444           0.0.0.0:0              LISTENING       3184
  TCP    10.0.10.45:51280       93.184.216.34:443      ESTABLISHED     5120`,
              'nslookup example.com': `Server:  corp-dc01.corp.local
Address:  10.0.10.2

Non-authoritative answer:
Name:    example.com
Address:  93.184.216.34`,
            },
            commandResponses: {
              'ipconfig /all': `IPv4 Address: 10.0.10.45, Gateway: 10.0.10.1, DHCP: 10.0.10.1, DNS: 10.0.10.2`,
              'ipconfig /flushdns': `Successfully flushed the DNS Resolver Cache.`,
              'netstat -ano': `TCP 0.0.0.0:4444 LISTENING PID 3184 | TCP 10.0.10.45:51280 93.184.216.34:443 ESTABLISHED PID 5120`,
              'nslookup example.com': `Server: 10.0.10.2, Name: example.com, Address: 93.184.216.34`,
            },
          },
          validation: {
            judgment: [
              {
                kind: 'choose-and-defend',
                prompt:
                  'A web developer makes a DNS change on their domain, but their local Windows machine continues resolving the old IP address. What command clears the Windows DNS resolver cache?',
                options: [
                  'ipconfig /release',
                  'ipconfig /flushdns',
                  'ping -t 127.0.0.1',
                  'tracert -d localhost',
                ],
                correctIndex: 1,
                explanation:
                  'ipconfig /flushdns flushes and resets the contents of the DNS client resolver cache, forcing the OS to query DNS servers on subsequent lookups.',
              },
              {
                kind: 'choose-and-defend',
                prompt:
                  'An administrator suspects a rogue service is listening on TCP port 4444. What command lists active listening ports along with the corresponding Process ID (PID) on Windows?',
                options: [
                  'netstat -ano',
                  'ping -n 4444',
                  'ipconfig /all',
                  'route print',
                ],
                correctIndex: 0,
                explanation:
                  'netstat -ano lists all connections and ports numerically (-n) and includes the owning Process ID (-o), enabling correlation with Task Manager.',
              },
            ],
          },
          successMessage:
            'Well done! You know when and how to deploy ipconfig, nslookup, and netstat for endpoint investigation.',
        },
      ],
    },

    // ─────────────────────────────────────────────────────
    // Concept 3: The 5 Classic Office IT Failures (C45)
    // ─────────────────────────────────────────────────────
    {
      id: 'net14-c3-five-office-failures',
      order: 3,
      title: 'The 5 Classic Office IT Failures & Systematic Triage',
      shortDescription:
        'Apply the systematic bottom-up OSI troubleshooting method to isolate the 5 classic failure patterns in enterprise IT support.',
      theory: {
        summary:
          'When users report "the internet is down," jumping to random solutions wastes critical response time. Professional enterprise support applies systematic, bottom-up OSI triage across five classic failure patterns: Physical Cable/Link Drop (Layer 1), APIPA 169.254.x.x DHCP Failure (Layer 2/3), Default Gateway Demarcation Drop (Layer 3), DNS Resolution Failure (Layer 7), and Firewall Port Block (Layer 4).',
        explanation: [
          '### Beat 1: The Physical Cause — Hierarchical Interdependence of the Protocol Stack',
          'Networking protocols do not function in isolation; each upper layer assumes the physical and electrical integrity of all layers below it. An application (HTTP browser) cannot open a socket without Layer 4 TCP; TCP cannot route packets without Layer 3 IP addressing; Layer 3 cannot resolve neighbors without Layer 2 Ethernet frames; and Layer 2 frames cannot transmit without Layer 1 copper voltage, fiber photons, or RF waves. If an unplugged RJ45 cable causes link-loss, debugging DNS records or reinstalling software is futile.',
          '',
          '### Beat 2: The Wire / System Consequence — The 5 Classic Signatures of Failure',
          'Field engineering classifies 95% of office outages into five distinct signatures:',
          '1. **Physical Cable/Link Drop (Layer 1)**: NIC link light is dark/unlit; OS displays "Network Cable Unplugged" or `NO-CARRIER`. No bits cross the wire.',
          '2. **APIPA 169.254.x.x (Layer 2/3 DHCP Failure)**: Physical link is up (solid green LED), but DHCP Discover broadcasts timed out with no Offer from a DHCP server. Windows automatically assigns an Automatic Private IP Addressing (APIPA) subnet `169.254.0.0/16` with a blank default gateway, isolating the host from the rest of the company.',
          '3. **Default Gateway Demarcation (Layer 3)**: The host possesses a valid static or DHCP IP (e.g. 192.168.10.45) and can ping neighboring PCs in the same room (`192.168.10.50`), but pinging the Default Gateway (`192.168.10.1`) returns "Request timed out". The failure is isolated strictly to the local router interface, trunk link, or switch uplink.',
          '4. **DNS Resolution Failure (Layer 7)**: The "Golden Test" reveals the problem instantly: executing `ping 8.8.8.8` returns immediate successful ICMP replies, proving Layer 1, Layer 2, Layer 3 routing, NAT, and WAN internet transit are 100% operational. However, attempting `ping google.com` or loading a URL in a browser fails with "Could not find host". This proves the issue is purely Layer 7 name resolution.',
          '5. **Firewall / Port Block (Layer 4)**: The destination IP is pingable and DNS resolves, but connection attempts to a specific port (e.g. 443 or 3389) hang or immediately return "Connection Refused", indicating an intermediate stateful firewall drop or unstarted backend daemon.',
          '',
          '### Beat 3: The Diagnostic / Operational Fix — Systematic Bottom-Up Triage Order',
          'Always triage in strict bottom-up order: 1) Verify physical link LEDs; 2) Run `ipconfig /all` to confirm a valid non-APIPA IP and gateway; 3) Ping the Default Gateway to verify local Layer 3 exit; 4) Ping public IP `8.8.8.8` to verify WAN internet transit; 5) Ping domain name `google.com` to isolate DNS; 6) Test specific TCP/UDP port reachability with `Test-NetConnection -Port` or `curl`. This methodical pipeline eliminates guesswork and isolates root causes in under 60 seconds.',
        ],
        keyTakeaway:
          'Always troubleshoot bottom-up: Physical Link -> Local IP (non-APIPA) -> Gateway -> Public IP (8.8.8.8) -> Domain Name (DNS) -> Port/Firewall.',
        exampleQuery: '',
        exampleQueryExplanation: '',
        mcqs: [
          {
            id: 'net14-mcq-dns-ping-isolation',
            question:
              'A user cannot open web pages. Pinging public IP `8.8.8.8` succeeds with 15ms latency, but pinging `google.com` returns "Ping request could not find host google.com". What is the definitive technical conclusion?',
            options: [
              'The user\'s Ethernet cable is damaged and dropping packets',
              'The default gateway router has crashed and stopped forwarding packets',
              'Layers 1 through 3 network connectivity, routing, and internet transit are completely healthy; the failure is isolated strictly to Layer 7 DNS name resolution',
              'The user\'s PC requires a new network interface card',
            ],
            correctIndex: 2,
            correctAnswerIndex: 2,
            explanation:
              'Because ICMP packets reach `8.8.8.8` across the internet and return, the physical cable, NIC, IP stack, local switch, gateway, and ISP connection are all functioning properly. The inability to resolve `google.com` isolates the failure exclusively to DNS.',
          },
          {
            id: 'net14-mcq-apipa-root-cause',
            question:
              'An office workstation has a solid green Ethernet link light, but `ipconfig /all` shows an IPv4 address of `169.254.44.12` and a blank Default Gateway. What has occurred?',
            options: [
              'The workstation successfully connected to a high-speed Gigabit fiber network',
              'Layer 1 physical link is operational, but the workstation failed to receive a response from a DHCP server and assigned itself an Automatic Private IP (APIPA), preventing routing beyond the local link',
              'The corporate firewall blocked port 80',
              'The DNS root servers have revoked the workstation\'s domain registration',
            ],
            correctIndex: 1,
            correctAnswerIndex: 1,
            explanation:
              'An address in the 169.254.0.0/16 range with no default gateway indicates APIPA. The physical link is active (green light), but DHCP Discover broadcasts received no Offer, leaving the workstation without valid enterprise network configuration.',
          },
        ],
      },
      tasks: [
        {
          id: 'net14-p3-systematic-triage',
          title: 'Practice: Systematic Bottom-Up Triage in Action',
          description:
            'Diagnose network failures using diagnostic ping tests and isolate the faulty layer.',
          instructions: [
            'An office worker calls support stating "The internet is completely down on my desktop".',
            'You run diagnostic tests from their machine.',
            'Answer the judgment questions to isolate the root cause.',
          ],
          type: 'guided',
          primaryTable: '',
          initialSql: '',
          solutionSql: 'NETWORKING_JUDGMENT_TASK',
          solutionExplanation:
            'Being able to ping 8.8.8.8 proves Layer 1 through 3 are fully operational up to the public internet. Failure to resolve google.com confirms a Layer 7 DNS failure.',
          terminal: {
            title: 'Diagnostic Terminal — 5-Layer Bottom-Up Triage Console',
            description: 'Run diagnostic ping and ipconfig tests to isolate local gateway versus DNS resolution failure boundaries.',
            hostname: 'OFFICE-PC-01',
            userPrompt: 'C:\\Users\\employee>',
            prompt: 'C:\\Users\\employee>',
            initialLines: [
              'Enterprise Workstation Diagnostics Console',
              'Symptom: User reports total internet outage.',
              'Type "ipconfig /all", "ping 192.168.10.1", "ping 8.8.8.8", or "ping google.com" to diagnose.',
            ],
            initialOutput: [
              'Enterprise Workstation Diagnostics Console',
              'Symptom: User reports total internet outage.',
              'Type "ipconfig /all", "ping 192.168.10.1", "ping 8.8.8.8", or "ping google.com" to diagnose.',
            ].join('\n'),
            availableCommands: [
              'ipconfig /all',
              'ping 192.168.10.1',
              'ping 8.8.8.8',
              'ping google.com',
            ],
            commands: {
              'ipconfig /all': `Windows IP Configuration
   Host Name . . . . . . . . . . . . : OFFICE-PC-01
   IPv4 Address. . . . . . . . . . . : 192.168.10.75(Preferred)
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . . . : 192.168.10.1
   DNS Servers . . . . . . . . . . . : 192.168.10.250 (Unreachable)`,
              'ping 192.168.10.1': `Pinging 192.168.10.1 with 32 bytes of data:
Reply from 192.168.10.1: bytes=32 time=1ms TTL=64
Reply from 192.168.10.1: bytes=32 time=1ms TTL=64
Packets: Sent = 2, Received = 2, Lost = 0 (0% loss)`,
              'ping 8.8.8.8': `Pinging 8.8.8.8 with 32 bytes of data:
Reply from 8.8.8.8: bytes=32 time=14ms TTL=58
Reply from 8.8.8.8: bytes=32 time=15ms TTL=58
Packets: Sent = 2, Received = 2, Lost = 0 (0% loss)`,
              'ping google.com': `Ping request could not find host google.com. Please check the name and try again.`,
            },
            commandResponses: {
              'ipconfig /all': `IPv4: 192.168.10.75, Gateway: 192.168.10.1, DNS: 192.168.10.250`,
              'ping 192.168.10.1': `Reply from 192.168.10.1: bytes=32 time=1ms TTL=64 (Gateway Reachable)`,
              'ping 8.8.8.8': `Reply from 8.8.8.8: bytes=32 time=14ms TTL=58 (WAN Transit Healthy)`,
              'ping google.com': `Ping request could not find host google.com. (DNS Resolution Failed)`,
            },
          },
          hints: [
            {
              level: 1,
              text: 'If ping to an internet IP address works, your router and ISP connection are working.',
            },
            {
              level: 2,
              text: 'The inability to convert human domain names into IP addresses is a DNS issue.',
            },
          ],
          validation: {
            judgment: [
              {
                kind: 'choose-and-defend',
                prompt:
                  'A user reports no websites will load. You run two tests: 1) `ping 8.8.8.8` returns 4 replies with 15ms latency; 2) `ping google.com` returns "Ping request could not find host google.com". What is the exact root cause?',
                options: [
                  'The user\'s Ethernet cable is severed',
                  'The default gateway router has crashed',
                  'Layer 1–3 network connectivity and internet routing are functioning perfectly, but DNS name resolution is failing',
                  'The user\'s network card cannot support 64-bit operating systems',
                ],
                correctIndex: 2,
                explanation:
                  'Because packets to 8.8.8.8 reach the public internet and return, the physical link, IP configuration, gateway, and ISP route are completely healthy. Only name translation (DNS) is failing.',
              },
              {
                kind: 'choose-and-defend',
                prompt:
                  'A computer can ping other computers in the same office room (192.168.10.x), but cannot reach any external websites. Pinging its default gateway (192.168.10.1) results in "Request timed out". Where is the failure boundary?',
                options: [
                  'Layer 2 local switching is working, but communication to or through the Layer 3 Default Gateway is broken',
                  'The local switch has lost power',
                  'The computer has an invalid loopback driver',
                  'All remote internet servers have simultaneously gone offline',
                ],
                correctIndex: 0,
                explanation:
                  'Since communication with local subnet peers succeeds, Layer 1 and Layer 2 on the local switch are functional. Failure to reach the gateway isolates the issue to the router interface or the link connecting to the router.',
              },
            ],
          },
          successMessage:
            'Mastered! You applied systematic bottom-up triage to isolate DNS failures and gateway boundaries with precision.',
        },
      ],
    },
  ],

  challenge: {
    id: 'net14-challenge',
    title: 'Module 14 Challenge: Corporate Network Outage Triage',
    scenario:
      'Triage an escalated executive support escalation where multiple symptoms appear simultaneously after an office network update.',
    tasks: [
      {
        id: 'net14-ch1-tracert-hops-analysis',
        title: 'Challenge 1: Traceroute Hop-by-Hop Failure Analysis',
        description:
          'Identify where packet forwarding terminates along an enterprise WAN path using traceroute logs.',
        instructions: [
          'A branch office user cannot reach corporate ERP server `10.100.50.25`.',
          'Traceroute log:',
          '  Hop 1: 192.168.1.1 (Branch Router LAN) [1 ms]',
          '  Hop 2: 172.16.5.2 (Branch Router WAN) [4 ms]',
          '  Hop 3: 172.16.5.1 (HQ Core Gateway) [12 ms]',
          '  Hop 4: * * * Request timed out.',
          '  Hop 5: * * * Request timed out.',
          '  (Times out indefinitely through Hop 30)',
          'Identify which device is responsible for dropping the traffic.',
        ],
        type: 'challenge',
        primaryTable: '',
        initialSql: '',
        solutionSql: 'NETWORKING_JUDGMENT_TASK',
        solutionExplanation:
          'Hop 3 (HQ Core Gateway 172.16.5.1) is the last responsive device. The next-hop router or internal firewall behind Hop 3 is dropping the packets.',
        hints: [
          {
            level: 1,
            text: 'Notice that traffic successfully reaches Hop 3 at 172.16.5.1.',
          },
          {
            level: 2,
            text: 'Continuous timeouts until Hop 30 mean the packet was dropped after Hop 3 and never reached subsequent devices.',
          },
        ],
        validation: {
          judgment: [
            {
              kind: 'choose-and-defend',
              prompt:
                'Based on the traceroute output, where did the connection fail?',
              options: [
                'At the local branch workstation before reaching Hop 1',
                'On the WAN link between Hop 1 and Hop 2',
                'At or immediately beyond Hop 3 (HQ Core Gateway 172.16.5.1), where the next-hop router is unreachable or a firewall is blocking the traffic',
                'At the ERP server application layer',
              ],
              correctIndex: 2,
              explanation:
                'Traffic successfully travels from Hop 1 through Hop 2 and arrives at Hop 3 (172.16.5.1). The permanent timeout starting at Hop 4 indicates the path breaks after leaving Hop 3.',
            },
          ],
        },
        successMessage:
          'Challenge 1 mastered! You traced WAN path forwarding up to Hop 3 and isolated the failure boundary.',
      },
      {
        id: 'net14-ch2-office-outage-triage',
        title: 'Challenge 2: Multi-Step Office Outage Triage',
        description:
          'Execute a full 4-step bottom-up triage workflow on an offline workstation.',
        instructions: [
          'An accountant reports their laptop cannot access the company accounting software.',
          'Step 1: Check link light -> Solid Green.',
          'Step 2: Run `ipconfig /all` -> IPv4 Address: `169.254.20.15`, Subnet Mask: `255.255.0.0`, Default Gateway: `` (Blank).',
          'Step 3: What does this diagnostic step prove as the primary root cause?',
        ],
        type: 'challenge',
        primaryTable: '',
        initialSql: '',
        solutionSql: 'NETWORKING_JUDGMENT_TASK',
        solutionExplanation:
          'Solid link light confirms Layer 1 is good. IP 169.254.x.x confirms Layer 3 DHCP failure (APIPA). The workstation never received configuration from the DHCP server.',
        terminal: {
          title: 'Capstone Exam Terminal — 5-Layer Systematic Triage',
          description: 'Interrogate physical and logical adapter state to verify the APIPA diagnosis.',
          hostname: 'ACCOUNTING-LAPTOP',
          userPrompt: 'C:\\Users\\accountant>',
          prompt: 'C:\\Users\\accountant>',
          initialLines: [
            '====================================================================',
            '  CAPSTONE EXAM: 5-LAYER SYSTEMATIC OFFICE OUTAGE TRIAGE',
            '====================================================================',
            'Symptom: Client reports total software and network unavailability.',
            'Type "ipconfig /all" or "ping 127.0.0.1" to interrogate network subsystem.',
          ],
          initialOutput: [
            '====================================================================',
            '  CAPSTONE EXAM: 5-LAYER SYSTEMATIC OFFICE OUTAGE TRIAGE',
            '====================================================================',
            'Symptom: Client reports total software and network unavailability.',
            'Type "ipconfig /all" or "ping 127.0.0.1" to interrogate network subsystem.',
          ].join('\n'),
          availableCommands: [
            'ipconfig /all',
            'ping 127.0.0.1',
            'ping 169.254.20.15',
            'ipconfig /renew',
          ],
          commands: {
            'ipconfig /all': `Windows IP Configuration
   Host Name . . . . . . . . . . . . : ACCOUNTING-LAPTOP
   Autoconfiguration Enabled . . . . : Yes

Ethernet adapter Local Area Connection:
   Connection-specific DNS Suffix  . : 
   Link-local IPv6 Address . . . . . : fe80::49a1:38b2:dc12:89ff%12
   Autoconfiguration IPv4 Address. . : 169.254.20.15(Preferred)
   Subnet Mask . . . . . . . . . . . : 255.255.0.0
   Default Gateway . . . . . . . . . : 
   DHCP Server . . . . . . . . . . . : (Timed out - No response)`,
            'ping 127.0.0.1': `Pinging 127.0.0.1 with 32 bytes of data:
Reply from 127.0.0.1: bytes=32 time<1ms TTL=128
Reply from 127.0.0.1: bytes=32 time<1ms TTL=128
Packets: Sent = 2, Received = 2, Lost = 0 (0% loss)`,
            'ping 169.254.20.15': `Pinging 169.254.20.15 with 32 bytes of data:
Reply from 169.254.20.15: bytes=32 time<1ms TTL=128
Packets: Sent = 1, Received = 1, Lost = 0 (0% loss)`,
            'ipconfig /renew': `An error occurred while renewing interface Local Area Connection : unable to contact your DHCP server. Request has timed out.`,
          },
          commandResponses: {
            'ipconfig /all': `IPv4: 169.254.20.15 (APIPA), Mask: 255.255.0.0, Default Gateway: [Blank]`,
            'ping 127.0.0.1': `Reply from 127.0.0.1: bytes=32 time<1ms (TCP/IP Protocol Stack OK)`,
            'ping 169.254.20.15': `Reply from 169.254.20.15: bytes=32 time<1ms (NIC Driver OK)`,
            'ipconfig /renew': `Unable to contact your DHCP server. Request has timed out.`,
          },
        },
        hints: [
          {
            level: 1,
            text: '169.254.0.0/16 is APIPA.',
          },
          {
            level: 2,
            text: 'A green link light means the physical connection is working.',
          },
        ],
        validation: {
          judgment: [
            {
              kind: 'choose-and-defend',
              prompt:
                'What is the confirmed root cause of the accountant\'s network outage?',
              options: [
                'The laptop Ethernet port hardware is burned out and cannot transmit electrical signals',
                'Physical Layer 1 connectivity is healthy (green link light), but the device failed to receive a DHCP lease and assigned itself an APIPA address (169.254.x.x), leaving it with no gateway or valid network IP',
                'The accounting software database has run out of disk space',
                'The default gateway router is blocking port 80',
              ],
              correctIndex: 1,
              explanation:
                'The green light confirms Layer 1 link state is up. The 169.254.x.x address with a blank gateway is the classic signature of a DHCP assignment failure (APIPA).',
            },
          ],
        },
        successMessage:
          'Challenge 2 cleared! You conducted a textbook bottom-up triage from physical link verification to APIPA root cause isolation.',
      },
    ],
  },
};
