import { ModuleData } from '../../../types/curriculum';

/**
 * net-10: Domain Name System (DNS)
 * ─────────────────────────────────────────────────────────────────────────────
 * Milestone 4 — Concepts C34, C35, C36
 * Teaches distributed hierarchical name resolution, the inverted domain tree,
 * recursive vs iterative queries, UDP/TCP port 53 mechanics, Resource Records
 * (A, AAAA, CNAME, MX, TXT), and TTL caching dynamics.
 */

export const NET_10_MODULE: ModuleData = {
  id: 'net-10',
  slug: 'domain-name-system-dns',
  day: 10,
  title: 'Module 10: Domain Name System (DNS)',
  shortTitle: 'DNS & Name Resolution',
  type: 'module',
  track: 'networking',
  milestoneId: 'net-milestone-4',
  description:
    'Master the global phonebook of the internet: the hierarchical domain tree, recursive vs iterative queries, UDP/TCP 53 transport rules, essential Resource Records (A, AAAA, CNAME, MX, TXT), and TTL caching behavior.',
  estimatedMinutes: 35,
  curriculumOrder: 10,
  displayLabel: 'Module 10',
  completionLearnings: [
    'The DNS namespace is an inverted tree beginning at the Root (.) managed by 13 root server clusters named a.root-servers.net through m.root-servers.net',
    'Top-Level Domains (TLDs) like .com, .org, and country codes (.uk, .de) delegate authoritative zones down to second-level domains',
    'A stub resolver on an endpoint asks its configured recursive resolver (e.g. 8.8.8.8 or 1.1.1.1) to find the answer on its behalf',
    'Recursive resolvers execute iterative queries: asking Root for TLD, TLD for Authoritative Name Server, and Auth server for the final record',
    'DNS uses UDP port 53 for fast, lightweight queries; it falls back to TCP port 53 when responses exceed 512 bytes (or EDNS0 buffer) and for zone transfers (AXFR)',
    'Common Resource Records include A (IPv4), AAAA (IPv6), CNAME (canonical alias), MX (mail exchanger), and TXT (domain verification, SPF, DKIM)',
    'Time-To-Live (TTL) values dictate caching duration; records cannot be forcefully updated on external resolvers until their TTL expires',
  ],
  concepts: [
    // ─────────────────────────────────────────────────────
    // Concept 1: Hierarchy & Namespace Delegation (C34)
    // ─────────────────────────────────────────────────────
    {
      id: 'net10-c1-dns-hierarchy',
      order: 1,
      title: 'DNS Namespace Hierarchy & Delegation',
      shortDescription:
        'Understand the global inverted tree: Root zone, Top-Level Domains (gTLDs/ccTLDs), Second-Level Domains, and zone delegation.',
      theory: {
        summary:
          'DNS is structured as an inverted tree beginning at the Root Zone (.), which delegates to Top-Level Domains (.com, .org), which in turn delegate to authoritative name servers holding the master zone records.',
        explanation: [
          '### The Inverted Tree',
          'DNS replaced static HOSTS files with a hierarchical, distributed database:',
          '- **Root Zone (.)**: 13 root clusters anycast across thousands of global sites.',
          '- **Top-Level Domains (TLDs)**: Generic (.com, .org, .net) and country-code (.uk, .jp).',
          '- **Second-Level Domains**: example.com, google.com.',
          '',
          '### Authoritative Delegation',
          'Root servers do not know individual host IPs. They refer queries to the appropriate TLD servers, which refer to Authoritative servers holding the actual zone data.',
        ],
        keyTakeaway:
          'Root servers provide referrals to TLD servers; Authoritative servers hold the official records for a specific domain.',
        exampleQuery: '',
        exampleQueryExplanation: '',
      },
      tasks: [
        {
          id: 'net10-p1-hierarchy-analysis',
          title: 'Practice: Navigating the DNS Namespace Tree',
          description:
            'Identify which tier of the DNS hierarchy is responsible for delegating zones and holding final authority.',
          instructions: [
            'Trace the resolution hierarchy for a domain name such as `mail.company.com`.',
            'Answer the judgment questions regarding root and authoritative server roles.',
          ],
          type: 'guided',
          primaryTable: '',
          initialSql: '',
          solutionSql: 'NETWORKING_JUDGMENT_TASK',
          solutionExplanation:
            'The Root server delegates to TLD (.com); the TLD delegates to the company authoritative servers, which hold the final answer.',
          hints: [
            {
              level: 1,
              text: 'Root servers do not hold host IP addresses; they refer queries to TLD servers.',
            },
            {
              level: 2,
              text: 'Authoritative servers for a domain hold the actual resource records created by the domain owner.',
            },
          ],
          validation: {
            judgment: [
              {
                kind: 'choose-and-defend',
                prompt:
                  'What information does a DNS Root server return when asked for the IP address of `app.example.com`?',
                options: [
                  'The final IPv4 address of app.example.com',
                  'A referral pointing to the authoritative name servers responsible for the .com Top-Level Domain (TLD)',
                  'An HTTP 301 redirect to https://example.com',
                  'A TCP RST packet resetting the connection',
                ],
                correctIndex: 1,
                explanation:
                  'Root servers do not store individual host records. They hold referrals to the TLD name servers (.com, .org, etc.).',
              },
              {
                kind: 'choose-and-defend',
                prompt:
                  'What is an "Authoritative Name Server" for a domain?',
                options: [
                  'A server that caches previous web searches on a home router',
                  'The designated name server configured by the domain owner that holds the official, master DNS records for that specific zone',
                  'The ISP router that assigns IP addresses via DHCP',
                  'A firewall that blocks port 53 traffic',
                ],
                correctIndex: 1,
                explanation:
                  'An Authoritative Name Server is the definitive source of truth for a domain zone. It contains the actual records configured by the zone administrator.',
              },
            ],
          },
          successMessage:
            'Well done! Root servers provide TLD referrals, and Authoritative servers hold the official records.',
        },
      ],
    },

    // ─────────────────────────────────────────────────────
    // Concept 2: Recursive vs Iterative Resolution (C35)
    // ─────────────────────────────────────────────────────
    {
      id: 'net10-c2-recursive-iterative',
      order: 2,
      title: 'Recursive vs Iterative Resolution & Port 53',
      shortDescription:
        'Contrast stub resolvers and recursive resolvers, trace step-by-step iterative queries, and understand UDP vs TCP port 53.',
      theory: {
        summary:
          'Stub resolvers on client endpoints send recursive queries to caching resolvers. Resolvers walk the hierarchy using iterative queries over UDP 53, falling back to TCP 53 when responses exceed buffer limits (TC=1) or during zone transfers.',
        explanation: [
          '### The Two Query Types',
          '1. **Recursive Query**: Sent by client stub resolver asking a caching resolver to find the complete answer.',
          '2. **Iterative Query**: Sent by the recursive resolver to Root, TLD, and Auth servers receiving referrals until reaching the answer.',
          '',
          '### UDP 53 vs TCP 53',
          '- **UDP Port 53**: Fast, lightweight single datagram exchange.',
          '- **TCP Port 53**: Required when response > 512 bytes with TC (Truncated) flag set, or during zone transfers (AXFR).',
        ],
        keyTakeaway:
          'Clients make recursive queries to resolvers; resolvers make iterative queries down the tree. If responses are truncated (TC=1), clients retry over TCP 53.',
        exampleQuery: '',
        exampleQueryExplanation: '',
      },
      tasks: [
        {
          id: 'net10-p2-resolution-trace',
          title: 'Practice: Tracing the Resolution Walk & Port Protocols',
          description:
            'Distinguish recursive queries from iterative queries and identify when DNS shifts between UDP and TCP.',
          instructions: [
            'A browser requests resolution for `www.wikipedia.org`.',
            'Answer the judgment questions on query mechanisms and transport behavior.',
          ],
          type: 'guided',
          primaryTable: '',
          initialSql: '',
          solutionSql: 'NETWORKING_JUDGMENT_TASK',
          solutionExplanation:
            'Clients issue recursive queries to resolvers; resolvers issue iterative queries to root/TLD/auth servers. If response > 512 bytes and TC flag is set, client retries over TCP 53.',
          hints: [
            {
              level: 1,
              text: 'Stub resolvers do not query root servers directly; they delegate to recursive resolvers.',
            },
            {
              level: 2,
              text: 'The TC (Truncated) flag tells the client that the answer was cut off and must be fetched via TCP 53.',
            },
          ],
          validation: {
            judgment: [
              {
                kind: 'choose-and-defend',
                prompt:
                  'What is the fundamental difference between a recursive query and an iterative query?',
                options: [
                  'Recursive queries use TCP while iterative queries use UDP',
                  'In a recursive query, the contacted server must find the complete final answer; in an iterative query, the contacted server returns referrals to the next best authority without doing the recursion itself',
                  'Recursive queries are only used for reverse IP lookups (PTR)',
                  'Iterative queries can only be resolved inside the local operating system kernel',
                ],
                correctIndex: 1,
                explanation:
                  'A recursive query demands a final answer. An iterative query expects the server to either provide the record or refer the inquirer to the next tier down the tree.',
              },
              {
                kind: 'choose-and-defend',
                prompt:
                  'A DNS response received over UDP port 53 has the TC (Truncated) bit set to 1. What does the client resolver do next?',
                options: [
                  'Discards the query and reports a DNS resolution error to the browser',
                  'Immediately re-sends the DNS query to the same server using TCP port 53 to receive the complete, un-truncated response',
                  'Broadcasts an ARP request for the root name server',
                  'Changes its default gateway IP to 8.8.8.8',
                ],
                correctIndex: 1,
                explanation:
                  'RFC 1035 specifies that when a response is truncated (TC=1) due to UDP message size limitations, the client must establish a TCP connection on port 53 to fetch the entire answer.',
              },
            ],
          },
          successMessage:
            'Spot on! You understand recursive delegation, iterative tree walking, and the TCP 53 truncation fallback.',
        },
      ],
    },

    // ─────────────────────────────────────────────────────
    // Concept 3: Resource Records & Caching Dynamics (C36)
    // ─────────────────────────────────────────────────────
    {
      id: 'net10-c3-resource-records',
      order: 3,
      title: 'Resource Records & TTL Caching Dynamics',
      shortDescription:
        'Master the core DNS record types (A, AAAA, CNAME, MX, TXT) and understand how Time-To-Live (TTL) governs cache invalidation.',
      theory: {
        summary:
          'Resource records map names to resources: A (IPv4), AAAA (IPv6), CNAME (canonical alias), MX (mail), and TXT (verification/SPF/DKIM). Under RFC 1034 §3.6.2, a CNAME cannot coexist with any other record of any type for the same owner name; because a zone apex must contain SOA and NS records, a CNAME cannot be placed at the apex. TTL defines the second-by-second caching window on external resolvers.',
        explanation: [
          '### Essential Record Types',
          '- **A**: Maps hostname to IPv4 address.',
          '- **AAAA**: Maps hostname to 128-bit IPv6 address.',
          '- **CNAME**: Canonical alias to another domain name (never to an IP directly). Under RFC 1034 §3.6.2, no other record can exist for an owner name that has a CNAME (which prevents placing a CNAME at the zone apex, where SOA and NS are mandatory).',
          '- **MX**: Mail server with numerical priority.',
          '- **TXT**: Text records used for SPF, DKIM, and domain ownership proof.',
          '',
          '### Time-To-Live (TTL)',
          'Records include TTL in seconds. Resolvers cache answers until TTL decrements to zero before querying authoritative servers again.',
        ],
        keyTakeaway:
          'CNAME aliases names to names and cannot coexist with other records for the same owner name. TTL controls caching duration on resolvers across the globe.',
        exampleQuery: '',
        exampleQueryExplanation: '',
      },
      tasks: [
        {
          id: 'net10-p3-records-caching',
          title: 'Practice: Evaluating DNS Record Types & TTL Expiration',
          description:
            'Inspect record declarations, analyze CNAME resolution paths, and calculate DNS cache invalidation windows.',
          instructions: [
            'A domain administrator updates their server configuration from an old IP to a new IP.',
            'Answer the judgment questions on record semantics and caching behavior.',
          ],
          type: 'guided',
          primaryTable: '',
          initialSql: '',
          solutionSql: 'NETWORKING_JUDGMENT_TASK',
          solutionExplanation:
            'A maps to IPv4, AAAA maps to IPv6, CNAME creates an alias to another name. Clients cache records until TTL reaches 0.',
          hints: [
            {
              level: 1,
              text: 'AAAA is named Quad-A because an IPv6 address is 128 bits (4 times 32 bits of IPv4).',
            },
            {
              level: 2,
              text: 'CNAME points to another domain name, not an IP address.',
            },
          ],
          validation: {
            judgment: [
              {
                kind: 'choose-and-defend',
                prompt:
                  'A web engineer creates a DNS record: `blog.company.com CNAME 198.51.100.45`. Why is this configuration invalid according to RFC specifications?',
                options: [
                  'Because blog subdomains must always use MX records',
                  'Because a CNAME record must point to another canonical domain name (e.g. company.com or host.cdn.net), never directly to an IP address; an A record should be used instead',
                  'Because CNAME records cannot exceed 10 characters',
                  'Because port 53 cannot translate subdomains',
                ],
                correctIndex: 1,
                explanation:
                  'CNAME defines an alias from one name to another name. If you want to point a hostname directly to an IPv4 address, you must use an A record.',
              },
              {
                kind: 'choose-and-defend',
                prompt:
                  'A company changes its website A record with TTL=86400 (24 hours). An engineer immediately tests from their laptop and still reaches the old web server. Why?',
                options: [
                  'The web server hardware crashed during the DNS update',
                  'Their local ISP recursive resolver has cached the old record and will not query the authoritative server again until the 24-hour TTL expires',
                  'The root servers deleted the .com TLD',
                  'The browser disabled IPv4 support',
                ],
                correctIndex: 1,
                explanation:
                  'Resolvers cache records for the duration specified by the authoritative TTL. Before the 24-hour timer elapses, resolvers serve the cached record without querying the authoritative server.',
              },
            ],
          },
          successMessage:
            'Mastered! You understand DNS record definitions, CNAME aliasing rules, and the operational impact of TTL caching.',
        },
      ],
    },
  ],

  challenge: {
    id: 'net10-challenge',
    title: 'Module 10 Challenge: DNS Forensics & Migration Troubleshooting',
    scenario:
      'Diagnose complex name resolution failures in an enterprise infrastructure during a cloud server migration.',
    tasks: [
      {
        id: 'net10-ch1-dns-iterative-troubleshooting',
        title: 'Challenge 1: Iterative Resolution Forensics',
        description:
          'Trace the exact sequence of servers queried during a cold-cache resolution and identify where a resolution failure occurs.',
        instructions: [
          'A user cannot reach `portal.partner.org`.',
          'Root and `.org` TLD servers respond with referrals.',
          'However, the authoritative name server `ns1.partner.org` specified in the referral does not respond to queries.',
          'Determine why the recursive resolver fails and what error code it returns to the client.',
        ],
        type: 'challenge',
        primaryTable: '',
        initialSql: '',
        solutionSql: 'NETWORKING_JUDGMENT_TASK',
        solutionExplanation:
          'When authoritative name servers fail to respond, the recursive resolver cannot complete resolution and returns SERVFAIL (Server Failure).',
        hints: [
          {
            level: 1,
            text: 'If the authoritative servers are offline or unreachable, the resolver cannot produce an answer.',
          },
          {
            level: 2,
            text: 'NXDOMAIN means the domain does not exist; SERVFAIL means the resolution infrastructure failed to respond.',
          },
        ],
        validation: {
          judgment: [
            {
              kind: 'choose-and-defend',
              prompt:
                'When all authoritative name servers for a domain are unreachable or time out, what standard DNS response code does a recursive resolver return to the client?',
              options: [
                'NOERROR with an empty answer section',
                'NXDOMAIN (Non-Existent Domain)',
                'SERVFAIL (Server Failure)',
                'REFUSED (Query Refused)',
              ],
              correctIndex: 2,
              explanation:
                'SERVFAIL indicates the resolver encountered a failure during the lookup process (such as unreachable authoritative servers or DNSSEC validation failure). NXDOMAIN is only returned when an authoritative server explicitly confirms the domain does not exist.',
            },
          ],
        },
        successMessage:
          'Challenge 1 mastered! You correctly identified SERVFAIL as the error indicating unreachable authoritative name servers.',
      },
      {
        id: 'net10-ch2-cname-loop-ttl',
        title: 'Challenge 2: CNAME Chaining & Zero-Downtime Migration',
        description:
          'Evaluate best practices for reducing TTL prior to a planned cloud migration.',
        instructions: [
          'A company plans to move its primary web portal to a new data center next Tuesday at 2:00 AM.',
          'The current A record has a TTL of 86400 seconds (24 hours).',
          'The team wants zero downtime and minimal customer impact during the switch.',
          'What proactive DNS change should they execute 48 hours BEFORE the migration?',
        ],
        type: 'challenge',
        primaryTable: '',
        initialSql: '',
        solutionSql: 'NETWORKING_JUDGMENT_TASK',
        solutionExplanation:
          'Lowering the TTL to 300 seconds (5 minutes) days in advance ensures that when the IP is updated, all resolvers will re-query within 5 minutes.',
        hints: [
          {
            level: 1,
            text: 'You cannot force third-party resolvers to purge their cache remotely.',
          },
          {
            level: 2,
            text: 'By lowering TTL days in advance, existing 24-hour caches expire and are replaced with short 5-minute caches.',
          },
        ],
        validation: {
          judgment: [
            {
              kind: 'choose-and-defend',
              prompt:
                'What is the standard industry procedure for ensuring rapid cutover during a DNS-based server migration?',
              options: [
                'Delete the domain from the registrar 24 hours prior to the migration',
                'Lower the record TTL from 86400 (24 hours) to a short duration (e.g. 300 seconds / 5 minutes) at least 24–48 hours before the migration, then switch the IP at cutover time',
                'Change the record to a CNAME pointing to 127.0.0.1',
                'Instruct all global internet users to run ipconfig /flushdns',
              ],
              correctIndex: 1,
              explanation:
                'By lowering TTL in advance, old long-lived cache entries expire and are replaced by short-lived entries. When cutover occurs, global traffic migrates to the new IP within minutes.',
            },
          ],
        },
        successMessage:
          'Challenge 2 cleared! You demonstrated professional understanding of proactive TTL pre-reduction for smooth cloud migrations.',
      },
    ],
  },
};
