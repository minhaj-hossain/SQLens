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
          '### Beat 1: Direct Physical Reality — The Scaling Death of Flat HOSTS Files',
          'In the early ARPANET of the 1970s and 1980s, network hostname resolution was managed by a single centralized text file called `HOSTS.TXT`, maintained by SRI and downloaded via FTP by every computer on the network.',
          'As thousands of universities and businesses joined, this centralized architecture collapsed: file download bandwidth exploded, name collisions multiplied, and updates took days to propagate.',
          'Paul Mockapetris designed the **Domain Name System (RFC 1034 / RFC 1035)** in 1983 to replace flat files with a globally distributed, hierarchical database.',
          '',
          '### Beat 2: The Core Mechanism — The Inverted Domain Tree',
          'The DNS namespace forms an inverted tree branching downward from a single invisible root:',
          '1. **The Root Zone (`.`)**: Managed by 13 root server IP identities (`a.root-servers.net` through `m.root-servers.net`), distributed across more than 1,500 physical locations globally using BGP Anycast. The root server does NOT store individual website IPs; it stores pointers (delegation records) to TLD servers.',
          '2. **Top-Level Domains (TLDs)**: Generic TLDs (`.com`, `.org`, `.net`, `.edu`) and country-code TLDs (`.uk`, `.de`, `.jp`). Registry operators (such as Verisign for `.com`) manage these zones and delegate authority to second-level domains.',
          '3. **Second-Level Domains**: `company.com`, `wikipedia.org`. The domain owner configures their own **Authoritative Name Servers** to manage records.',
          '4. **Subdomains & Hosts**: `app.company.com`, `mail.company.com`.',
          '',
          '### Zone Delegation & Glue Records',
          'Delegation occurs via **Name Server (NS) records**. When the `.com` TLD receives a query for `company.com`, it replies with NS records pointing to `ns1.company.com`.',
          'If the name server sits inside the domain it serves (`ns1.company.com` within `company.com`), the parent zone must also provide a **Glue Record** (the A/AAAA IP address of `ns1`) to avoid an unresolvable chicken-and-egg dependency.',
          '',
          '### Beat 3: Failure Modes & Workplace Diagnostics',
          '- **Dangling Delegation / Subdomain Takeover**: If an NS or CNAME record points to an expired external cloud service (e.g. AWS S3, GitHub Pages), an attacker can register the cloud resource and hijack the domain.',
          '- **Lame Delegation**: Occurs when parent zone NS records point to a server that has not been configured to be authoritative for the child zone, returning REFUSED or SERVFAIL.',
        ],
        keyTakeaway:
          'Root servers provide referrals to TLD servers; Authoritative servers hold the official records for a specific domain.',
        exampleQuery: '',
        exampleQueryExplanation: '',
        mcqs: [
          {
            id: 'net10-mcq-root-referrals',
            question:
              'What information does a DNS Root server return when asked for the IP address of app.example.com?',
            options: [
              'The final IPv4 address of app.example.com',
              'A referral pointing to the authoritative name servers responsible for the .com Top-Level Domain (TLD)',
              'An HTTP 301 redirect to https://example.com',
              'A TCP RST packet resetting the connection',
            ],
            correctIndex: 1,
            explanation:
              'Root servers do not store individual host records. They return referrals pointing to the appropriate TLD name servers (.com, .org, etc.).',
          },
          {
            id: 'net10-mcq-auth-servers',
            question:
              'What is an "Authoritative Name Server" for a domain in DNS architecture?',
            options: [
              'A server that caches previous web searches on a home router',
              'The designated name server configured by the domain owner that holds the official, master DNS records for that specific zone',
              'The ISP router that assigns IP addresses via DHCP',
              'A firewall that blocks port 53 traffic',
            ],
            correctIndex: 1,
            explanation:
              'An Authoritative Name Server is the definitive source of truth for a domain zone, storing and answering with the actual resource records configured by the domain owner.',
          },
        ],
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
          dns: {
            title: 'DNS Namespace Tree & Referral Delegation',
            description:
              'Trace how queries for app.example.com walk the inverted tree: Root (.) referrals, TLD (.com) referrals, and Authoritative server answers.',
            queryDomain: 'app.example.com',
            queryType: 'A',
            defaultView: 'hierarchy',
          },
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
          '### Beat 1: Direct Physical Reality — Why Endpoints Delegate Resolution',
          'A modern mobile phone or office laptop queries thousands of domain names every hour.',
          'If every single client device had to directly contact root servers, then TLD servers, and then authoritative servers for every domain lookup, global internet root servers would collapse under petabytes of redundant traffic, and page loads would suffer hundreds of milliseconds of latency.',
          '',
          '### Beat 2: The Core Mechanism — Recursive vs. Iterative Query Flow',
          'DNS splits the work between two distinct query modes:',
          '1. **Recursive Query (Client ➔ Recursive Resolver)**: ',
          '   - The client endpoint runs a lightweight **Stub Resolver**.',
          '   - It issues a single recursive query to its configured **Recursive Resolver** (e.g. corporate resolver, ISP DNS, or public resolvers like `8.8.8.8` or `1.1.1.1`).',
          '   - "Recursive" means: *You do the work and return the final answer (or error) to me.*',
          '2. **Iterative Queries (Recursive Resolver ➔ Namespace Tree)**:',
          '   - The recursive resolver checks its local cache. If cold, it performs iterative lookups:',
          '   - Iteration 1: Queries Root server (`.`) ➔ Receives referral to `.com` TLD servers.',
          '   - Iteration 2: Queries `.com` TLD server ➔ Receives referral to `company.com` auth servers.',
          '   - Iteration 3: Queries `company.com` auth server ➔ Receives the authoritative answer.',
          '   - The resolver caches the answer according to its TTL and returns it to the client.',
          '',
          '### Transport Rules: UDP 53 vs. TCP 53',
          '- **UDP Port 53**: The primary transport for DNS queries. Fast, lightweight single-datagram request/reply with zero connection handshake latency.',
          '- **The 512-Byte Limit & EDNS0**: Classic DNS payloads over UDP were capped at 512 bytes to avoid IPv4 fragmentation. EDNS0 (RFC 6891) allows clients to advertise larger UDP buffer sizes (typically 1232 or 4096 bytes).',
          '- **TCP Port 53 & The TC (Truncated) Bit**: If a response exceeds the allowed UDP buffer, the server sets the **TC (Truncated) flag** in the DNS header. The client resolver must immediately discard the partial payload and re-issue the query over **TCP port 53**.',
          '',
          '### Beat 3: Failure Modes & Workplace Diagnostics',
          '- **Port 53 TCP Blockage**: Overly restrictive firewalls often permit UDP 53 but mistakenly block TCP 53. When large DNS responses (e.g. DNSSEC records or large TXT records) trigger truncation, clients fail to resolve.',
          '- **Kaminsky DNS Cache Poisoning**: In 2008, Dan Kaminsky demonstrated how attackers could forge UDP DNS replies by guessing the 16-bit Transaction ID. Modern resolvers mitigate this using **Source Port Randomization** (UDP ports 1024–65535) and cryptographic DNSSEC validation.',
        ],
        keyTakeaway:
          'Clients make recursive queries to resolvers; resolvers make iterative queries down the tree. If responses are truncated (TC=1), clients retry over TCP 53.',
        exampleQuery: '',
        exampleQueryExplanation: '',
        mcqs: [
          {
            id: 'net10-mcq-iterative-lookup',
            question:
              'What is the fundamental difference between a recursive DNS query and an iterative DNS query?',
            options: [
              'Recursive queries use TCP while iterative queries use UDP',
              'In a recursive query, the contacted server must find the complete final answer; in an iterative query, the contacted server returns referrals to the next best authority without doing the recursion itself',
              'Recursive queries are only used for reverse IP lookups (PTR)',
              'Iterative queries can only be resolved inside the local operating system kernel',
            ],
            correctIndex: 1,
            explanation:
              'A recursive query tasks the receiving server with finding the full answer. An iterative query expects the queried server to either answer with the record or refer the inquirer down the delegation tree.',
          },
          {
            id: 'net10-mcq-dns-transport-port',
            question:
              'A DNS client receives a response over UDP port 53 with the TC (Truncated) bit set to 1. How does the client respond?',
            options: [
              'It discards the query and reports a DNS resolution error to the browser',
              'It immediately establishes a TCP connection to port 53 on the same server to fetch the complete response',
              'It broadcasts an ARP request for the root name server',
              'It changes its default gateway IP to 8.8.8.8',
            ],
            correctIndex: 1,
            explanation:
              'RFC 1035 specifies that when a response is truncated (TC=1) due to UDP message size constraints, the resolver must re-issue the query over TCP port 53.',
          },
        ],
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
          dns: {
            title: 'Resolution Walk & UDP/TCP 53 Truncation',
            description:
              'Analyze how the recursive resolver performs iterative lookups, and observe fallback to TCP port 53 when responses are truncated (TC=1).',
            queryDomain: 'www.wikipedia.org',
            queryType: 'A',
            defaultView: 'hierarchy',
            isTruncated: true,
          },
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
          '### Beat 1: Direct Physical Reality — Separating Services Under One Name',
          'A single enterprise domain (e.g. `company.com`) delivers dozens of distinct network services: web traffic over IPv4, modern web traffic over IPv6, enterprise email servers, and email authentication systems (SPF/DKIM).',
          'DNS separates these functional endpoints through typed **Resource Records (RRs)**.',
          '',
          '### Beat 2: The Core Mechanism — Standard Resource Records & The CNAME Rule',
          'Essential record types include:',
          '- **A Record**: Maps a hostname to a 32-bit IPv4 address (e.g., `app.company.com ➔ 198.51.100.45`).',
          '- **AAAA Record (Quad-A)**: Maps a hostname to a 128-bit IPv6 address (e.g., `2001:db8::45`).',
          '- **CNAME Record (Canonical Name)**: Maps an alias hostname to another canonical domain name (e.g., `www.company.com CNAME company.com`).',
          '  **The Golden CNAME Rule (RFC 1034 §3.6.2)**: If a CNAME record exists for a name, NO OTHER RECORD of any type can exist for that same name. Because a domain root (zone apex `company.com`) requires Start of Authority (SOA) and NS records, **a CNAME can NEVER be placed at the zone apex**.',
          '- **MX Record (Mail Exchanger)**: Specifies mail servers with priority preference integers (e.g., `10 mail1.company.com`, `20 mail2.company.com`).',
          '- **TXT Record**: Arbitrary text strings used for cryptographic email verification (SPF, DKIM, DMARC) and domain ownership verification.',
          '',
          '### Time-To-Live (TTL) & Cache Invalidation',
          'Every DNS record includes an integer **Time-To-Live (TTL)** in seconds:',
          '- When a recursive resolver fetches a record, it stores it in memory.',
          '- With every second that passes, the resolver decrements the record’s TTL countdown timer.',
          '- As long as `TTL > 0`, the resolver answers subsequent client requests immediately from memory without querying the authoritative server.',
          '- Once `TTL == 0`, the cached entry expires and must be re-fetched.',
          '',
          '### Beat 3: Failure Modes & Workplace Diagnostics (Ticket #112)',
          'Operational DNS troubleshooting scenarios:',
          '- **Stale Cache Lockout During Migrations**: If an administrator moves servers while the record has a 24-hour TTL (86,400s), global internet users will continue visiting the dead old server for up to 24 hours. **Best practice**: Lower TTL to 300 seconds (5 minutes) at least 48 hours prior to migration.',
          '- **Negative Caching (NXDOMAIN Caching)**: RFC 2308 mandates that negative responses (domain does not exist) are also cached, determined by the SOA record’s MINIMUM field.',
          '- **Flushing Local Resolver Caches**: On Windows, run `ipconfig /displaydns` and `ipconfig /flushdns`. On Linux, run `resolvectl flush-caches` and test queries using `dig +noall +answer <domain>`.',
        ],
        keyTakeaway:
          'CNAME aliases names to names and cannot coexist with other records for the same owner name. TTL controls caching duration on resolvers across the globe.',
        exampleQuery: '',
        exampleQueryExplanation: '',
        mcqs: [
          {
            id: 'net10-mcq-cname-apex',
            question:
              'Why cannot an administrator configure a CNAME record for the root apex of a domain (e.g. company.com CNAME cdn.provider.net)?',
            options: [
              'Because CNAME records can only be created by internet service providers',
              'Because RFC 1034 §3.6.2 dictates no other record can coexist with a CNAME for the same owner name, and the apex must contain mandatory SOA and NS records',
              'Because web browsers do not support HTTPS over CNAME records',
              'Because the zone apex is restricted strictly to TXT records',
            ],
            correctIndex: 1,
            explanation:
              'Under RFC 1034, a CNAME cannot coexist with any other record for the same owner name. Since a zone apex must have SOA and NS records, placing a CNAME at the apex violates DNS specifications.',
          },
          {
            id: 'net10-mcq-ttl-expiration',
            question:
              'A company updates its web server IP address. The previous DNS record had a TTL of 86400 seconds (24 hours). Why do users still reach the old server after 2 hours?',
            options: [
              'Because recursive resolvers around the world cache the previous record and will not query the authoritative server again until the 24-hour TTL expires',
              'Because the root servers permanently blackhole updated records for 7 days',
              'Because the browser cache stores the IP address inside the local BIOS chip',
              'Because the web server TCP connection is permanently locked',
            ],
            correctIndex: 0,
            explanation:
              'Resolvers cache records for the full duration specified by the authoritative TTL. Before the 24-hour timer reaches zero, resolvers serve the cached record without querying authoritative servers.',
          },
        ],
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
            'Inspect cached DNS entries and flush stale resolver caches using dual Windows (`ipconfig /flushdns`) and Linux (`resolvectl flush-caches`) diagnostic tools.',
          ],
          type: 'guided',
          primaryTable: '',
          initialSql: '',
          solutionSql: 'NETWORKING_JUDGMENT_TASK',
          solutionExplanation:
            'A maps to IPv4, AAAA maps to IPv6, CNAME creates an alias to another name. Clients cache records until TTL reaches 0.',
          dns: {
            title: 'Record Types, CNAME Constraints & TTL Caching',
            description:
              'Evaluate why CNAME cannot alias to an IP or coexist at the apex, and observe how resolvers serve cached records until the 24-hour TTL decrements to 0.',
            queryDomain: 'blog.company.com',
            queryType: 'A',
            defaultView: 'cache_comparison',
            cacheTtlRemaining: 86400,
            isCached: true,
          },
          terminal: {
            title: 'Workplace Diagnostic Terminal — Ticket #112 (Dual OS)',
            description:
              'Inspect local resolver DNS cache, execute cache flushes, and query authoritative/public resolvers using Windows nslookup and Linux dig.',
            prompt: 'admin@dns-resolver:~$',
            initialOutput: [
              '====================================================================',
              '  WORKPLACE TICKET #112: DNS RESOLVER CACHE & PROPAGATION AUDIT',
              '====================================================================',
              'Investigating stale DNS records and verifying authoritative TTL caching.',
              'Supported commands:',
              '  - Windows: ipconfig /displaydns',
              '             ipconfig /flushdns',
              '             nslookup blog.company.com 8.8.8.8',
              '  - Linux:   resolvectl statistics',
              '             resolvectl flush-caches',
              '             dig +noall +answer blog.company.com @8.8.8.8',
            ].join('\n'),
            availableCommands: [
              'ipconfig /displaydns',
              'ipconfig /flushdns',
              'nslookup blog.company.com 8.8.8.8',
              'resolvectl statistics',
              'resolvectl flush-caches',
              'dig +noall +answer blog.company.com @8.8.8.8',
            ],
            commands: {
              'ipconfig /displaydns': `Windows IP Configuration

    blog.company.com
    ----------------------------------------
    Record Name . . . . . : blog.company.com
    Record Type . . . . . : 1 (A)
    Time To Live  . . . . : 82400
    Data Length . . . . . : 4
    Section . . . . . . . : Answer
    A (IPv4) Record . . . : 198.51.100.45`,
              'ipconfig /flushdns': `Windows IP Configuration

Successfully flushed the DNS Resolver Cache.`,
              'nslookup blog.company.com 8.8.8.8': `Server:  dns.google
Address:  8.8.8.8

Non-authoritative answer:
Name:    blog.company.com
Address:  198.51.100.45`,
              'nslookup blog.company.com': `Server:  dns.google
Address:  8.8.8.8

Non-authoritative answer:
Name:    blog.company.com
Address:  198.51.100.45`,
              'resolvectl statistics': `DNSSEC supported by cache: yes
Current Cache:
  Cache Transactions: 1420
  Cache Hits: 890
  Cache Misses: 530
Cache Size: 180 entries`,
              'resolvectl flush-caches': `Flushed all local DNS caches.`,
              'dig +noall +answer blog.company.com @8.8.8.8': `blog.company.com.    82400   IN      A       198.51.100.45`,
              'dig +noall +answer blog.company.com': `blog.company.com.    82400   IN      A       198.51.100.45`,
            },
            commandResponses: {
              'ipconfig /displaydns': `Windows IP Configuration

    blog.company.com
    ----------------------------------------
    Record Name . . . . . : blog.company.com
    Record Type . . . . . : 1 (A)
    Time To Live  . . . . : 82400
    Data Length . . . . . : 4
    Section . . . . . . . : Answer
    A (IPv4) Record . . . : 198.51.100.45`,
              'ipconfig /flushdns': `Windows IP Configuration

Successfully flushed the DNS Resolver Cache.`,
              'nslookup blog.company.com 8.8.8.8': `Server:  dns.google
Address:  8.8.8.8

Non-authoritative answer:
Name:    blog.company.com
Address:  198.51.100.45`,
              'resolvectl statistics': `DNSSEC supported by cache: yes
Current Cache:
  Cache Transactions: 1420
  Cache Hits: 890
  Cache Misses: 530
Cache Size: 180 entries`,
              'resolvectl flush-caches': `Flushed all caches.`,
              'dig +noall +answer blog.company.com @8.8.8.8': `blog.company.com.    82400   IN      A       198.51.100.45`,
            },
          },
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
        dns: {
          title: 'Authoritative Server Timeout: SERVFAIL Forensics',
          description:
            'Root and .org TLD referrals succeed, but authoritative name servers ns1.partner.org fail to answer queries, resulting in SERVFAIL (RCODE=2).',
          queryDomain: 'portal.partner.org',
          queryType: 'A',
          defaultView: 'failure_diagnosis',
          failureCode: 'SERVFAIL',
        },
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
        dns: {
          title: 'Proactive TTL Reduction for Zero-Downtime Migration',
          description:
            'Simulate shortening TTL to 300 seconds 48 hours in advance to eliminate stale resolver cache windows before server cutover.',
          queryDomain: 'portal.company.com',
          queryType: 'A',
          defaultView: 'cache_comparison',
          cacheTtlRemaining: 300,
          isCached: false,
        },
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
