import { ModuleData } from '../../../types/curriculum';

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
        summary:
          'ICMP reports network status: Type 8 Echo Request, Type 0 Echo Reply, Type 11 Time Exceeded. Traceroute sends packets with incremental TTL values (1, 2, 3...); routers decrement TTL to 0 and reply with ICMP Type 11, revealing intermediate router IPs.',
        explanation: [
          '### ICMP Message Types',
          '- Type 8: Echo Request (Ping)',
          '- Type 0: Echo Reply',
          '- Type 3: Destination Unreachable',
          '- Type 11: Time Exceeded (TTL expired in transit)',
          '',
          '### How Traceroute Discovers Hops',
          'Traceroute sends probe packets starting with TTL=1. The first router drops it and returns ICMP Type 11, identifying Hop 1. Next, TTL=2 identifies Hop 2, continuing until destination reachability.',
          '',
          '### Intermediate Asterisks (* * *)',
          'Asterisks indicate intermediate routers rate-limiting ICMP responses, not broken paths, if subsequent hops respond.',
        ],
        keyTakeaway:
          'Traceroute maps internet hops using incremental TTL values and ICMP Type 11 Time Exceeded replies.',
        exampleQuery: '',
        exampleQueryExplanation: '',
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
          'CLI utilities isolate endpoint network states: ipconfig /all inspects interfaces and /flushdns purges resolver cache; nslookup tests name resolution against specific DNS servers; netstat -ano lists open ports and owning PIDs.',
        explanation: [
          '### ipconfig (Windows)',
          '- `/all`: Displays MAC, IP, mask, gateway, DHCP server, DNS.',
          '- `/release` & `/renew`: Drops and requests a fresh DHCP lease.',
          '- `/flushdns`: Clears OS resolver cache.',
          '',
          '### nslookup',
          'Queries DNS servers directly, bypassing application-level caches to isolate DNS failures from server downtime.',
          '',
          '### netstat -ano',
          'Displays active connections and listening ports with owning Process IDs (-o).',
        ],
        keyTakeaway:
          'ipconfig verifies IP configuration; nslookup tests DNS directly; netstat -ano identifies listening ports and processes.',
        exampleQuery: '',
        exampleQueryExplanation: '',
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
          'Troubleshoot bottom-up from Physical to Application: 1) Cable/Link State (link light), 2) APIPA 169.254.x.x (DHCP failure), 3) Default Gateway unreachable, 4) DNS Resolution failure (can ping 8.8.8.8 but not domain names), and 5) Port/Firewall block.',
        explanation: [
          '### Systematic Bottom-Up Triage',
          'Always verify lower layers first: Physical Link -> Local IP -> Gateway -> DNS -> Port/Firewall.',
          '',
          '### The DNS Ping Test',
          'If `ping 8.8.8.8` succeeds but `ping google.com` fails, network routing is 100% operational and only DNS name resolution is broken.',
          '',
          '### The Gateway Boundary',
          'If local host pings work but the gateway ping fails, the issue is isolated to the local router interface.',
        ],
        keyTakeaway:
          'Bottom-up triage prevents wasted effort. Pinging a public IP vs domain name instantly isolates DNS failures.',
        exampleQuery: '',
        exampleQueryExplanation: '',
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
