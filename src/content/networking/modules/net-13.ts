import { ModuleData } from '../../../types/curriculum';
import type { MentorScript } from '../../../types/networking-curriculum';

export const NET_13_MENTOR_SCRIPT: MentorScript = {
  version: '1.0.0',
  track: 'networking',
  moduleId: 'net-13',
  conceptId: 'net13-c1-http-evolution',
  revealLadder: {
    'step-0': ['browser-client'],
    'step-1': ['browser-client', 'plaintext-wire'],
    'step-2': ['browser-client', 'plaintext-wire', 'tls-padlock'],
    'step-3': ['browser-client', 'plaintext-wire', 'tls-padlock', 'ca-cert'],
    'step-4': ['browser-client', 'plaintext-wire', 'tls-padlock', 'ca-cert', 'ecdh-exchange'],
    'step-5': ['browser-client', 'plaintext-wire', 'tls-padlock', 'ca-cert', 'ecdh-exchange', 'encrypted-stream', 'http2-multiplex'],
  },
  terms: {
    sniffing: {
      label: 'Cleartext Sniffing',
      part: 'plaintext-wire',
      explanation: 'Unencrypted HTTP traffic can be inspected, intercepted, and modified by anyone on the physical path or public Wi-Fi.',
    },
    x509: {
      label: 'X.509 Certificate & CA Chain',
      part: 'ca-cert',
      explanation: 'A cryptographic identity signed by a trusted Certificate Authority binding a domain to its public key.',
    },
    tls13: {
      label: 'TLS 1.3 1-RTT Handshake',
      part: 'ecdh-exchange',
      explanation: 'ECDHE ephemeral key exchange negotiating symmetric AES-GCM session keys in a single round trip.',
    },
    forwardsecrecy: {
      label: 'Forward Secrecy',
      part: 'encrypted-stream',
      explanation: 'Generates disposable ephemeral keys so that compromising a server private key in the future cannot decrypt past recorded sessions.',
    },
  },
  beats: [
    {
      id: 'beat-1',
      stage: { stageNumber: 1, title: 'Observe: The Cleartext Wire Dilemma' },
      kind: 'say',
      text: 'In legacy HTTP, passwords and credit card numbers travel across the copper wire in plain ASCII text. Anyone at a coffee shop running Wireshark can read every single byte!',
      spotlight: 'plaintext-wire',
      revealedParts: ['browser-client', 'plaintext-wire'],
    },
    {
      id: 'beat-2',
      stage: { stageNumber: 1, title: 'Predict: The Man-in-the-Middle Trap' },
      kind: 'predict',
      text: 'Suppose an attacker intercepts your connection and says: "Hello, I am bank.com, here is my public encryption key." How does your browser know if that key actually belongs to your bank?',
      spotlight: 'ca-cert',
      revealedParts: ['browser-client', 'plaintext-wire', 'tls-padlock', 'ca-cert'],
      options: [
        {
          id: 'opt-ca-chain',
          label: 'The server presents an X.509 Certificate digitally signed by a trusted Certificate Authority (CA) in the OS Root Store.',
          isCorrect: true,
          feedback: 'Correct! Browsers trust root CAs (like DigiCert or Let\'s Encrypt). If the mathematical cryptographic signature validates, the domain identity is genuine.',
        },
        {
          id: 'opt-ip-reputation',
          label: 'The browser checks if the server IP address is listed in Google search results.',
          isCorrect: false,
          feedback: 'Search engines do not validate cryptographic key authenticity on transport sockets.',
        },
        {
          id: 'opt-arp-trust',
          label: 'The local switch confirms the MAC address is friendly.',
          isCorrect: false,
          feedback: 'Switches know nothing about cryptographic certificates; public keys are verified by Public Key Infrastructure (PKI).',
        },
      ],
      whyOptions: [
        {
          id: 'why-pki-hierarchy',
          label: 'Asymmetric public key cryptography allows trusted CAs to sign domain certificates without ever sharing the domain\'s private key.',
          isCorrect: true,
          feedback: 'Spot on! The browser uses the CA\'s pre-installed public key to verify the mathematical signature.',
        },
        {
          id: 'why-symmetric-secret',
          label: 'All websites in the world share the exact same secret password.',
          isCorrect: false,
          feedback: 'Sharing symmetric secrets globally would completely destroy web security.',
        },
      ],
    },
    {
      id: 'beat-3',
      stage: { stageNumber: 1, title: 'Action: 1-RTT TLS 1.3 Key Exchange' },
      kind: 'do',
      text: 'Click Execute ECDHE Handshake to watch the client and server exchange Diffie-Hellman key shares in a single round trip.',
      actionPrompt: 'Execute TLS 1.3 Handshake (1-RTT)',
      actionTargetPart: 'ecdh-exchange',
      revealedParts: ['browser-client', 'plaintext-wire', 'tls-padlock', 'ca-cert', 'ecdh-exchange'],
      spotlight: 'ecdh-exchange',
    },
    {
      id: 'beat-4',
      stage: { stageNumber: 1, title: 'Predict: Ephemeral Keys & Forward Secrecy' },
      kind: 'predict',
      text: 'Why does TLS 1.3 generate disposable ephemeral keys for every single session instead of using the server\'s static private key to encrypt data?',
      spotlight: 'encrypted-stream',
      revealedParts: ['browser-client', 'plaintext-wire', 'tls-padlock', 'ca-cert', 'ecdh-exchange', 'encrypted-stream'],
      options: [
        {
          id: 'opt-forward-secrecy',
          label: 'To provide Forward Secrecy: if the server\'s private key is stolen 5 years from now, previously recorded encrypted traffic can NEVER be decrypted.',
          isCorrect: true,
          feedback: 'Brilliant! Ephemeral keys are wiped from memory as soon as the session closes. Historical wire captures remain permanently uncrackable.',
        },
        {
          id: 'opt-reduce-cpu',
          label: 'Because generating new keys uses 0% CPU power.',
          isCorrect: false,
          feedback: 'Diffie-Hellman requires elliptic-curve mathematical operations, but the security guarantee is worth the microsecond calculation.',
        },
        {
          id: 'opt-allow-passwords',
          label: 'To allow users to log in without needing a password.',
          isCorrect: false,
          feedback: 'TLS secures the transport channel; user credentials are handled at the application layer.',
        },
      ],
      whyOptions: [
        {
          id: 'why-ephemeral-erasure',
          label: 'Discarding the ephemeral session keys immediately after communication leaves no cryptographic mathematical residue for attackers.',
          isCorrect: true,
          feedback: 'Correct! This is why legacy static RSA key exchange was completely abolished in TLS 1.3.',
        },
        {
          id: 'why-static-faster',
          label: 'Static keys allow anyone on the internet to decrypt all customer credit cards.',
          isCorrect: false,
          feedback: 'Static key exposure was a catastrophic vulnerability in legacy TLS 1.2 and earlier.',
        },
      ],
    },
    {
      id: 'beat-5',
      stage: { stageNumber: 1, title: 'Observe: Encrypted Streams & HTTP/2 Multiplexing' },
      kind: 'point',
      text: 'The tunnel is locked! All application data flows through AES-256-GCM authenticated encryption. Combined with HTTP/2 binary framing, dozens of concurrent requests stream through a single encrypted socket with zero head-of-line blocking!',
      spotlight: 'http2-multiplex',
      revealedParts: ['browser-client', 'plaintext-wire', 'tls-padlock', 'ca-cert', 'ecdh-exchange', 'encrypted-stream', 'http2-multiplex'],
    },
  ],
  ticketScene: {
    ticketId: '113',
    title: 'Ticket #113: Expired SSL/TLS Certificate Outage',
    symptom: 'All external customers seeing browser security warnings: `NET::ERR_CERT_DATE_INVALID` when visiting https://shop.click.dev.',
    telemetry: [
      'Browser Security Error: NET::ERR_CERT_DATE_INVALID',
      'OpenSSL Handshake Verification (`openssl s_client -connect shop.click.dev:443`):',
      '  depth=0 CN = shop.click.dev',
      '  notAfter=Oct 20 23:59:59 2026 GMT (EXPIRED)',
      '  verify error:num=10:certificate has expired',
      'Reverse Proxy: NGINX edge terminating TLS on old wildcard cert.',
    ],
    options: [
      {
        id: 'opt-cert-expired',
        label: 'The server TLS certificate validity period expired on Oct 20 2026, causing browser Root CA trust chain verification to reject the connection.',
        isCorrect: true,
        feedback: 'Correct! Browsers verify certificate validity timestamps against the local system clock. An expired certificate triggers an immediate security blockade.',
      },
      {
        id: 'opt-ddos-flood',
        label: 'A volumetric SYN flood overwhelmed the edge router.',
        isCorrect: false,
        feedback: 'The TLS handshake initiates normally and delivers the certificate; the failure is strictly a cryptographic certificate date rejection.',
      },
      {
        id: 'opt-gateway-mac',
        label: 'The default gateway MAC address was changed by ARP poisoning.',
        isCorrect: false,
        feedback: 'Network connectivity is 100% functional; the issue is cryptographic validation in the application layer.',
      },
    ],
    repairActions: [
      {
        id: 'fix-renew-cert',
        label: 'Deploy renewed Let\'s Encrypt certificate: `certbot renew --nginx` and reload reverse proxy',
        isCorrect: true,
        patch: { action: 'renew-certificate', target: 'reverse-proxy', value: { domain: 'shop.click.dev' } },
      },
      {
        id: 'fix-flush-switch',
        label: 'Flush the core switch MAC table',
        isCorrect: false,
        patch: { action: 'flush-cam', target: 'switch-sw1', value: 'all' },
      },
      {
        id: 'fix-change-ip',
        label: 'Change the web server IP address to a new private IP',
        isCorrect: false,
        patch: { action: 'reconfigure-ip', target: 'reverse-proxy', value: '10.0.0.99' },
      },
    ],
  },
};

/**
 * net-13: Application Protocols: HTTP & TLS/HTTPS
 * ─────────────────────────────────────────────────────────────────────────────
 * Milestone 5 — Concepts C41, C42
 * Teaches modern web application transport: HTTP/1.1 semantics, status codes,
 * HTTP/2 multiplexing and HTTP/3 QUIC, Public Key Infrastructure (PKI), X.509
 * digital certificates, Certificate Authority trust chains, and the 1-RTT
 * TLS 1.3 ephemeral Diffie-Hellman (ECDHE) handshake.
 */

export const NET_13_MODULE: ModuleData = {
  id: 'net-13',
  slug: 'application-protocols-http-and-tls-https',
  day: 13,
  title: 'Module 13: Application Protocols: HTTP & TLS/HTTPS',
  shortTitle: 'HTTP & TLS/HTTPS',
  type: 'module',
  track: 'networking',
  milestoneId: 'net-milestone-5',
  description:
    'Master the protocols that power the modern web: HTTP request/response semantics, HTTP/2 multiplexing vs HTTP/3 QUIC, Public Key Infrastructure (PKI), digital certificates, and the TLS 1.3 ephemeral handshake.',
  estimatedMinutes: 35,
  curriculumOrder: 13,
  displayLabel: 'Module 13',
  completionLearnings: [
    'HTTP/1.1 uses plaintext request/response headers with persistent Keep-Alive connections, but suffers from Head-of-Line (HoL) blocking on single TCP streams',
    'HTTP/2 introduces binary framing and multiplexed concurrent streams over a single TCP connection (eliminating application-level blocking), while HTTP/3 runs over UDP/QUIC to mitigate cross-stream TCP transport Head-of-Line blocking',
    'Status code categories: 2xx Success, 3xx Redirection, 4xx Client Error (e.g. 404 Not Found, 403 Forbidden), 5xx Server Error (e.g. 500 Internal Error, 502 Bad Gateway)',
    'Public Key Infrastructure (PKI) relies on asymmetric key pairs: the public key is shared openly in an X.509 certificate, while the private key remains confidential on the server',
    'Certificate Authorities (CAs) digitally sign server certificates; client operating systems validate authenticity using a pre-installed Root CA trust store',
    'TLS 1.3 completely removes insecure legacy ciphers (static RSA, RC4, CBC) and establishes secure symmetric keys in a single round trip (1-RTT) using Ephemeral Diffie-Hellman (ECDHE)',
    'Forward Secrecy ensures that if a server\'s private key is compromised in the future, past recorded encrypted traffic cannot be decrypted',
  ],
  concepts: [
    // ─────────────────────────────────────────────────────
    // Concept 1: HTTP Evolution & Protocol Semantics (C41)
    // ─────────────────────────────────────────────────────
    {
      id: 'net13-c1-http-evolution',
      order: 1,
      title: 'HTTP Semantics, Status Codes & Protocol Evolution',
      shortDescription:
        'Explore HTTP request/response architecture, status code families, and the generational leap from HTTP/1.1 to HTTP/2 and HTTP/3.',
      theory: {
        mentorScript: NET_13_MENTOR_SCRIPT,
        summary:
          'HTTP methods define actions (GET, POST, PUT, DELETE). Status code families categorize responses (2xx success, 3xx redirect, 4xx client error, 5xx server error). HTTP/2 uses binary framing to multiplex concurrent streams on one TCP stream, while HTTP/3 runs over UDP/QUIC to isolate packet drops.',
        explanation: [
          '### Beat 1: Direct Physical Reality — The Plaintext Request/Response Cycle',
          'At the physical socket level, an HTTP/1.1 transaction consists of raw ASCII text lines pushed into a stream-oriented TCP buffer.',
          'For example: `GET /index.html HTTP/1.1\\r\\nHost: example.com\\r\\n\\r\\n`. The remote server reads until the double CRLF (`\\r\\n\\r\\n`), parses the headers, and sends back ASCII status lines followed by data.',
          'However, HTTP/1.1 suffers from severe physical concurrency limits: because responses arrive serially on a connection, browsers open up to 6 parallel TCP connections per origin. When a page requests 100 assets, requests must wait in queues behind slower requests, causing **Application Head-of-Line (HoL) Blocking**.',
          '',
          '### Beat 2: The Core Mechanism — Status Code Families & Stream Multiplexing',
          'HTTP responses are categorized into 5 standardized status code families:',
          '- **2xx (Success)**: `200 OK` (standard response), `201 Created` (resource generated via POST), `204 No Content`.',
          '- **3xx (Redirection)**: `301 Moved Permanently` (browser caches target URL), `304 Not Modified` (conditional GET using ETag/Last-Modified).',
          '- **4xx (Client Error)**: `400 Bad Request` (malformed syntax), `401 Unauthorized` (missing credentials), `403 Forbidden` (authenticated but permission denied), `404 Not Found` (endpoint does not exist).',
          '- **5xx (Server/Infrastructure Error)**: `500 Internal Server Error` (backend crashed/unhandled exception), `502 Bad Gateway` (reverse proxy like NGINX failed to receive response from upstream backend), `503 Service Unavailable` (server overloaded or in maintenance), `504 Gateway Timeout` (upstream failed to respond before proxy timer expired).',
          '',
          '### The Generational Evolution: HTTP/1.1 vs HTTP/2 vs HTTP/3',
          '1. **HTTP/1.1**: Plaintext ASCII headers, persistent TCP Keep-Alive, but requests must finish serially on each socket.',
          '2. **HTTP/2**: Splits communication into binary frames (`HEADERS`, `DATA`, `SETTINGS`) tagged with numeric stream IDs. Multiple requests and responses interleave concurrently over a single TCP connection, eliminating application-level HoL blocking.',
          '3. **HTTP/3 (QUIC)**: Replaces TCP with UDP-based QUIC. Each stream has independent packet delivery and recovery. If a single packet drops, only the affected stream pauses for retransmission, while other concurrent streams continue uninterrupted, mitigating transport-layer HoL blocking.',
          '',
          '### Beat 3: Failure Modes & Workplace Diagnostics',
          'In production web deployments, diagnosing 4xx vs 5xx errors determines operational ownership:',
          '- If a client sees `403 Forbidden` or `404 Not Found`, the issue is in client routing or authorization policies.',
          '- If a client sees `502 Bad Gateway`, the reverse proxy (e.g. NGINX on port 443) is working, but the upstream application daemon (e.g. Node.js on port 3000 or PHP-FPM) has crashed or socket file permissions are blocked.',
        ],
        keyTakeaway:
          'HTTP status families distinguish client (4xx) from server (5xx) issues; HTTP/2 multiplexes streams over 1 TCP connection while HTTP/3 isolates packet drops over QUIC.',
        exampleQuery: '',
        exampleQueryExplanation: '',
        mcqs: [
          {
            id: 'net13-mcq-status-codes',
            question:
              'An NGINX reverse proxy attempts to forward an incoming request to an internal backend service, but the backend process is dead and refuses the connection. What status code does NGINX return to the client?',
            options: [
              '404 Not Found',
              '502 Bad Gateway',
              '401 Unauthorized',
              '304 Not Modified',
            ],
            correctIndex: 1,
            explanation:
              '502 Bad Gateway indicates that an intermediate proxy or gateway server received an invalid or failed response (such as a connection refused) from the upstream application server.',
          },
          {
            id: 'net13-mcq-http2-multiplexing',
            question:
              'How does HTTP/2 achieve concurrent asset loading without opening multiple parallel TCP connections?',
            options: [
              'By encoding all web assets into DNS TXT records',
              'By breaking requests into binary frames with stream IDs and multiplexing them concurrently over a single TCP connection',
              'By disabling TLS encryption to speed up frame delivery',
              'By converting all HTTP requests into UDP broadcasts',
            ],
            correctIndex: 1,
            explanation:
              'HTTP/2 introduces binary framing, allowing multiple logical streams to be interleaved and transmitted simultaneously across a single shared TCP socket.',
          },
        ],
      },
      tasks: [
        {
          id: 'net13-p1-http-semantics',
          title: 'Practice: Analyzing HTTP Status Codes & Stream Multiplexing',
          description:
            'Categorize server status responses and contrast HTTP/1.1 with HTTP/2 connection utilization.',
          instructions: [
            'A frontend developer analyzes network waterfall tabs in DevTools.',
            'Answer the judgment questions on status code meanings and HTTP protocol generations.',
          ],
          type: 'guided',
          primaryTable: '',
          initialSql: '',
          solutionSql: 'NETWORKING_JUDGMENT_TASK',
          solutionExplanation:
            '502 Bad Gateway indicates an upstream server error. HTTP/2 multiplexes multiple streams across a single TCP connection, eliminating HTTP/1.1 HoL blocking.',
          httpTls: {
            title: 'HTTP/1.1 vs HTTP/2 vs HTTP/3 Latency Analyzer',
            description:
              'Evaluate connection setup round trips (RTT) and time-to-first-byte (TTFB) across web protocol generations.',
            defaultTab: 'handshake_latency',
            activeProtocol: 'http2_tls13',
            rttMs: 50,
            explanationNotes: [
              'HTTP/2 multiplexes streams concurrently over a single TCP connection',
              'HTTP/3 runs over UDP/QUIC to eliminate cross-stream transport Head-of-Line blocking',
            ],
          },
          hints: [
            {
              level: 1,
              text: '4xx errors are client mistakes; 5xx errors are server/infrastructure failures.',
            },
            {
              level: 2,
              text: 'HTTP/2 sends multiple concurrent requests as independent binary frames over one TCP connection.',
            },
          ],
          validation: {
            judgment: [
              {
                kind: 'choose-and-defend',
                prompt:
                  'A reverse proxy (such as NGINX) is unable to connect to the backend Node.js application server because the backend crashed. What HTTP status code does the proxy return to the client browser?',
                options: [
                  '404 Not Found',
                  '502 Bad Gateway',
                  '401 Unauthorized',
                  '301 Moved Permanently',
                ],
                correctIndex: 1,
                explanation:
                  'A 502 Bad Gateway indicates that a proxy or gateway server received an invalid or failed response from the upstream backend server it was attempting to reach.',
              },
              {
                kind: 'choose-and-defend',
                prompt:
                  'How does HTTP/2 solve the Head-of-Line (HoL) blocking limitation inherent in HTTP/1.1?',
                options: [
                  'By requiring websites to embed all images directly into HTML as base64 strings',
                  'By splitting requests and responses into binary frames and multiplexing multiple independent streams concurrently over a single shared TCP connection',
                  'By switching the physical Ethernet link to 10 Gbps',
                  'By forcing all HTTP traffic to use port 8080',
                ],
                correctIndex: 1,
                explanation:
                  'HTTP/2 introduces binary framing and stream multiplexing. Multiple requests and responses can be interleaved simultaneously over a single TCP connection without waiting for preceding responses to finish.',
              },
            ],
          },
          successMessage:
            'Correct! You understand HTTP status families and the multiplexing architectural breakthrough in HTTP/2.',
        },
      ],
    },

    // ─────────────────────────────────────────────────────
    // Concept 2: PKI & X.509 Digital Certificates (C42a)
    // ─────────────────────────────────────────────────────
    {
      id: 'net13-c2-pki-certificates',
      order: 2,
      title: 'Public Key Infrastructure (PKI) & Digital Certificates',
      shortDescription:
        'Understand asymmetric cryptography, how Certificate Authorities sign X.509 certificates, and how browsers validate identity.',
      theory: {
        summary:
          'PKI pairs public and private keys. Servers present an X.509 certificate containing their public key and Subject Alternative Names (SAN), digitally signed by a Certificate Authority (CA). Browsers validate the signature chain up to pre-installed trusted root CAs.',
        explanation: [
          '### Beat 1: Direct Physical Reality — Cleartext Sniffing & The Man-in-the-Middle Danger',
          'When packets travel over cleartext HTTP (port 80), every intermediate device along the physical route—Wi-Fi access points, ISP routers, transit switches, and packet capture taps—can inspect and alter the raw payload.',
          'Attackers running Wireshark or `tcpdump` can capture session cookies, passwords, and banking data in plaintext, or inject malicious JavaScript directly into HTTP responses.',
          'Securing web traffic requires solving two distinct physical problems: **Confidentiality** (encrypting data so eavesdroppers see only random noise) and **Authenticity** (proving you are genuinely talking to your bank and not an imposter router).',
          '',
          '### Beat 2: The Core Mechanism — Asymmetric Cryptography & X.509 Trust Chains',
          'Public Key Infrastructure (PKI) solves authentication and key establishment through asymmetric math:',
          '1. **Key Pairs**: The server generates two mathematically linked keys: a **Private Key** (kept strictly confidential on the server) and a **Public Key** (distributed openly inside an X.509 digital certificate).',
          '2. **Digital Signatures**: To prove ownership of a domain, the server generates a Certificate Signing Request (CSR). A trusted **Certificate Authority (CA)** (e.g. Let’s Encrypt, DigiCert) verifies domain control and cryptographically signs the server certificate using the CA’s own private key.',
          '3. **Root CA Trust Store**: Client operating systems (Windows, Linux, macOS, iOS) ship with a pre-installed repository of trusted **Root CA certificates**. When your browser connects to an HTTPS website, it traces the signature chain backwards from the server certificate, through intermediate CAs, until it reaches a trusted Root CA in the local trust store.',
          '4. **Subject Alternative Name (SAN)**: RFC 6125 mandates that the browser verify that the exact Fully Qualified Domain Name (FQDN) in the URL matches one of the entries in the certificate’s Subject Alternative Name (`X509v3 Subject Alternative Name`) field.',
          '',
          '### Beat 3: Failure Modes & Workplace Diagnostics',
          'Common PKI failures encountered in engineering environments include:',
          '- **`ERR_CERT_COMMON_NAME_INVALID`**: The server certificate is valid and signed by a trusted CA, but its SAN only lists `example.com` and `www.example.com` while the user visited `admin.example.com`.',
          '- **`SEC_ERROR_UNKNOWN_ISSUER`**: The certificate was signed by a private internal enterprise CA that has not been deployed to the client workstation\'s Root CA store.',
          '- **`CERT_DATE_INVALID`**: The certificate’s `Not After` expiration timestamp has lapsed, or the client workstation’s system clock is skewed.',
        ],
        keyTakeaway:
          'Trust is anchored in the client Root CA Store; browsers verify CA digital signatures and ensure the requested URL matches the certificate SAN.',
        exampleQuery: '',
        exampleQueryExplanation: '',
        mcqs: [
          {
            id: 'net13-mcq-pki-keys',
            question:
              'In Public Key Infrastructure (PKI) used for HTTPS, which key is openly shared with clients and which key must never leave the server?',
            options: [
              'Both keys are shared publicly in DNS records',
              'The public key is shared inside the X.509 certificate; the private key remains strictly confidential on the server',
              'The private key is shared with clients; the public key is kept confidential on the server',
              'Both keys are discarded after the TCP 3-way handshake',
            ],
            correctIndex: 1,
            explanation:
              'In asymmetric PKI, the public key is openly distributed inside the digital certificate so clients can verify signatures and encrypt data, while the private key is guarded on the server.',
          },
          {
            id: 'net13-mcq-ca-trust',
            question:
              'Why does a client web browser accept and trust the authenticity of an X.509 digital certificate presented by a remote web server?',
            options: [
              'Because the web server sends a signed letter via physical mail',
              'Because the certificate signature chain terminates at a trusted Root CA pre-installed in the client OS or browser trust store',
              'Because the switch ports are configured with 802.1Q tagging',
              'Because UDP checksum verification guarantees identity',
            ],
            correctIndex: 1,
            explanation:
              'The client verifies cryptographic signatures hierarchically up to an anchor in its local Root CA store, which is maintained by the operating system or browser vendor.',
          },
        ],
      },
      tasks: [
        {
          id: 'net13-p2-pki-trust-chain',
          title: 'Practice: Evaluating PKI Trust Chains & SAN Fields',
          description:
            'Inspect X.509 certificate validation workflows and identify common certificate verification failures.',
          instructions: [
            'A browser connects to `https://checkout.mystore.com`.',
            'Answer the judgment questions on certificate validation and CA hierarchy.',
          ],
          type: 'guided',
          primaryTable: '',
          initialSql: '',
          solutionSql: 'NETWORKING_JUDGMENT_TASK',
          solutionExplanation:
            'Browsers validate the certificate signature chain against the trusted root store and verify the requested hostname matches the SAN (Subject Alternative Name).',
          httpTls: {
            title: 'X.509 Certificate Chain & SAN Validator',
            description:
              'Simulate browser validation of domain names against certificate Subject Alternative Name (SAN) fields.',
            defaultTab: 'pki_certificates',
            targetDomain: 'admin.company.com',
            certificate: {
              subject: 'CN=company.com, O=Company Inc, C=US',
              issuer: 'CN=DigiCert Global Root CA, O=DigiCert Inc, C=US',
              sanList: ['company.com', 'www.company.com'],
              validFrom: '2025-01-01',
              validTo: '2027-01-01',
              serialNumber: '0x1F:2E:3D:4C:5B',
              signatureAlgorithm: 'SHA256withRSA',
              publicKeyInfo: 'RSA 2048-bit',
              isIssuerInTrustStore: true,
            },
            failureCode: 'ERR_CERT_COMMON_NAME_INVALID',
            explanationNotes: [
              'RFC 6125 mandates matching against the SAN list',
              'Missing subdomains in SAN trigger browser security warning pages',
            ],
          },
          hints: [
            {
              level: 1,
              text: 'The browser checks that the URL in the address bar matches one of the SAN entries.',
            },
            {
              level: 2,
              text: 'Root CA certificates are pre-installed in the client operating system or browser.',
            },
          ],
          validation: {
            judgment: [
              {
                kind: 'choose-and-defend',
                prompt:
                  'A user visits `https://admin.company.com`. The certificate presented is valid and signed by a trusted CA, but its Subject Alternative Name (SAN) only lists `company.com` and `www.company.com`. What does the browser do?',
                options: [
                  'Silently loads the page because the root domain matches',
                  'Displays a security warning error (e.g. NET::ERR_CERT_COMMON_NAME_INVALID) because the requested hostname does not match any name listed in the certificate SAN field',
                  'Requests the server\'s private key to verify authorization',
                  'Automatically registers the subdomain with ICANN',
                ],
                correctIndex: 1,
                explanation:
                  'RFC 6125 requires the browser to verify that the exact FQDN in the address bar matches an entry in the certificate\'s Subject Alternative Name (SAN) list. If it does not match, a certificate hostname mismatch error is thrown.',
              },
              {
                kind: 'choose-and-defend',
                prompt:
                  'Why does a client browser trust a Certificate Authority\'s digital signature on a third-party website certificate?',
                options: [
                  'Because the website pays the browser vendor a per-visit fee',
                  'Because the Root CA\'s own certificate is pre-installed in the client OS or browser trusted root store during manufacturing/updates',
                  'Because DNS servers guarantee that certificates cannot be spoofed',
                  'Because routers encrypt all traffic using IPsec',
                ],
                correctIndex: 1,
                explanation:
                  'Trust is anchored in the local device\'s Root CA store. The browser trusts certificates signed by an intermediate CA whose signature traces back to a trusted root in that store.',
              },
            ],
          },
          successMessage:
            'Spot on! You understand the X.509 trust chain and how SAN verification guards against impersonation.',
        },
      ],
    },

    // ─────────────────────────────────────────────────────
    // Concept 3: TLS 1.3 Ephemeral Handshake (C42b)
    // ─────────────────────────────────────────────────────
    {
      id: 'net13-c3-tls13-handshake',
      order: 3,
      title: 'TLS 1.3 Handshake & Modern Cryptographic Security',
      shortDescription:
        'Dissect the 1-RTT TLS 1.3 handshake, understand Ephemeral Diffie-Hellman (ECDHE), Perfect Forward Secrecy, and AEAD symmetric encryption.',
      theory: {
        summary:
          'TLS 1.3 eliminates static RSA key exchange in favor of Ephemeral Diffie-Hellman (ECDHE) for Perfect Forward Secrecy. Key shares are included in the initial ClientHello and ServerHello, establishing encrypted communication in just 1 round trip (1-RTT).',
        explanation: [
          '### Beat 1: Direct Physical Reality — The Static RSA Vulnerability & 2-RTT Latency',
          'In legacy TLS 1.2 and earlier implementations, the client frequently encrypted a pre-master secret using the server’s static RSA public key.',
          'This created a devastating physical security vulnerability: an intelligence agency or network attacker could record all encrypted wire traffic flowing into a data center and store it indefinitely. If the server\'s private key was ever leaked, stolen, or subpoenaed years later, the attacker could retroactively decrypt every single historical session recorded in the past!',
          'Furthermore, TLS 1.2 required two full round trips (2-RTT) of back-and-forth negotiation before any encrypted HTTP data could be transmitted, adding 100–200ms of initial page load latency.',
          '',
          '### Beat 2: The Core Mechanism — The 1-RTT Handshake & Ephemeral Diffie-Hellman',
          'TLS 1.3 (RFC 8446) modernized internet cryptography through fundamental architectural redesigns:',
          '1. **Mandatory Perfect Forward Secrecy (PFS)**: Static RSA and insecure legacy ciphers (RC4, 3DES, CBC mode) were completely banned. TLS 1.3 mandates **Ephemeral Diffie-Hellman (ECDHE)**: client and server generate temporary, single-use key pairs for every individual session and destroy them immediately after session teardown.',
          '2. **1-RTT Handshake Architecture**: Instead of exchanging cipher suites first and key shares second, the client speculates on the key group (e.g. X25519) and transmits its ephemeral Diffie-Hellman public key share directly inside the initial **ClientHello**.',
          '3. **Instant Key Derivation**: The server selects the cipher suite, responds with its own matching **ServerHello** containing its ephemeral key share, and immediately derives the symmetric AEAD (Authenticated Encryption with Associated Data, e.g. AES-GCM or ChaCha20-Poly1305) session keys. Encrypted application traffic begins in just **1 round trip (1-RTT)**.',
          '',
          '### Beat 3: Failure Modes & Workplace Diagnostics (Ticket #115)',
          'When diagnosing HTTPS negotiation failures, certificate errors, or cipher mismatches in production, engineers rely on dual-platform command-line tools:',
          '- **Windows PowerShell / curl.exe**: Execute `curl.exe -Iv https://example.com` to inspect the TLS handshake stages, negotiated protocol version (`TLSv1.3`), ALPN negotiation (`h2`), and certificate chain.',
          '- **Linux CLI / OpenSSL**: Run `openssl s_client -connect example.com:443 -tls1_3` to view the raw cryptographic parameters, cipher suite (`TLS_AES_256_GCM_SHA384`), peer certificate details, and session verification return codes.',
        ],
        keyTakeaway:
          'TLS 1.3 establishes symmetric keys in 1-RTT using ECDHE key shares in ClientHello/ServerHello, guaranteeing Perfect Forward Secrecy.',
        exampleQuery: '',
        exampleQueryExplanation: '',
        mcqs: [
          {
            id: 'net13-mcq-tls13-1rtt',
            question:
              'How does TLS 1.3 reduce handshake latency to a single round trip (1-RTT) compared to TLS 1.2?',
            options: [
              'By disabling server certificate validation',
              'The client speculatively includes its ephemeral Diffie-Hellman key share directly inside the initial ClientHello message',
              'By sending plaintext HTTP passwords in the TCP SYN packet',
              'By transmitting all web traffic over ICMP Echo packets',
            ],
            correctIndex: 1,
            explanation:
              'In TLS 1.3, the client includes its ECDHE key share directly in ClientHello. The server pairs it with its own share in ServerHello, allowing symmetric encryption to begin in 1 round trip.',
          },
          {
            id: 'net13-mcq-forward-secrecy',
            question:
              'Why does Ephemeral Diffie-Hellman (ECDHE) provide Perfect Forward Secrecy while static RSA key exchange does not?',
            options: [
              'Because ECDHE keys are stored permanently in the server BIOS',
              'Because ephemeral keys are generated uniquely per session and discarded immediately; future compromise of the server private key cannot decrypt past recorded sessions',
              'Because static RSA encrypts only the TCP header',
              'Because ECDHE uses 4-byte IPv4 addresses as encryption keys',
            ],
            correctIndex: 1,
            explanation:
              'Perfect Forward Secrecy ensures that because ephemeral session keys are destroyed after connection termination, past captured ciphertext remains undecryptable even if the server private key is leaked later.',
          },
        ],
      },
      tasks: [
        {
          id: 'net13-p3-tls13-handshake-eval',
          title: 'Practice: Analyzing TLS 1.3 Handshake & Forward Secrecy',
          description:
            'Evaluate key share exchange mechanisms in TLS 1.3 and understand forward secrecy protections.',
          instructions: [
            'A security architect evaluates a migration from legacy TLS 1.2 to modern TLS 1.3.',
            'Answer the judgment questions on 1-RTT latency and cryptographic security.',
          ],
          type: 'guided',
          primaryTable: '',
          initialSql: '',
          solutionSql: 'NETWORKING_JUDGMENT_TASK',
          solutionExplanation:
            'TLS 1.3 establishes shared symmetric encryption in 1-RTT using ECDHE key shares in ClientHello/ServerHello, ensuring Perfect Forward Secrecy.',
          httpTls: {
            title: 'TLS 1.3 1-RTT Handshake & Ephemeral Diffie-Hellman Lab',
            description:
              'Step through 1-RTT cryptographic parameter negotiation and test Perfect Forward Secrecy resilience.',
            defaultTab: 'tls13_handshake',
            activeProtocol: 'http2_tls13',
            rttMs: 50,
            explanationNotes: [
              'TLS 1.3 transmits ECDHE key shares inside ClientHello to establish keys in 1-RTT',
              'Static RSA is eliminated to guarantee Perfect Forward Secrecy against retroactive decryption',
            ],
          },
          terminal: {
            prompt: 'admin@prod-bastion:~$',
            initialOutput: [
              '====================================================================',
              '  WORKPLACE TICKET #115: TLS 1.3 HANDSHAKE & CERTIFICATE AUDIT',
              '====================================================================',
              'Auditing external web endpoint https://example.com for TLS 1.3 cipher',
              'negotiation, 1-RTT latency, and X.509 certificate trust validation.',
              'Supported commands:',
              '  - Windows: curl.exe -Iv https://example.com',
              '  - Linux:   curl -Iv https://example.com',
              '             openssl s_client -connect example.com:443 -tls1_3',
            ].join('\n'),
            commands: {
              'curl.exe -Iv https://example.com': `*   Trying 93.184.216.34:443...
* Connected to example.com (93.184.216.34) port 443
* ALPN: offers h2,http/1.1
* TLSv1.3 (OUT), TLS handshake, Client hello (1):
* TLSv1.3 (IN), TLS handshake, Server hello (2):
* TLSv1.3 (IN), TLS handshake, Encrypted Extensions (8):
* TLSv1.3 (IN), TLS handshake, Certificate (11):
* TLSv1.3 (IN), TLS handshake, CERT verify (15):
* TLSv1.3 (IN), TLS handshake, Finished (20):
* TLSv1.3 (OUT), TLS handshake, Finished (20):
* SSL connection using TLSv1.3 / TLS_AES_256_GCM_SHA384 / X25519 / RSASSA-PSS
* ALPN: server accepted h2
* Server certificate:
*  subject: CN=example.com
*  start date: Jan 15 00:00:00 2026 GMT
*  expire date: Jan 15 23:59:59 2027 GMT
*  subjectAltName: host "example.com" matched cert's "example.com"
*  issuer: C=US, O=DigiCert Inc, CN=DigiCert Global Root G2
*  SSL certificate verify ok.
> GET / HTTP/2
> Host: example.com
> User-Agent: curl/8.4.0
< HTTP/2 200 
< content-type: text/html; charset=UTF-8
< server: ECS (iad/182A)`,
              'curl -Iv https://example.com': `*   Trying 93.184.216.34:443...
* Connected to example.com (93.184.216.34) port 443
* ALPN: offers h2,http/1.1
* TLSv1.3 (OUT), TLS handshake, Client hello (1):
* TLSv1.3 (IN), TLS handshake, Server hello (2):
* TLSv1.3 (IN), TLS handshake, Encrypted Extensions (8):
* TLSv1.3 (IN), TLS handshake, Certificate (11):
* TLSv1.3 (IN), TLS handshake, CERT verify (15):
* TLSv1.3 (IN), TLS handshake, Finished (20):
* TLSv1.3 (OUT), TLS handshake, Finished (20):
* SSL connection using TLSv1.3 / TLS_AES_256_GCM_SHA384 / X25519 / RSASSA-PSS
* ALPN: server accepted h2
* Server certificate:
*  subject: CN=example.com
*  start date: Jan 15 00:00:00 2026 GMT
*  expire date: Jan 15 23:59:59 2027 GMT
*  subjectAltName: host "example.com" matched cert's "example.com"
*  issuer: C=US, O=DigiCert Inc, CN=DigiCert Global Root G2
*  SSL certificate verify ok.
> GET / HTTP/2
> Host: example.com
> User-Agent: curl/8.5.0
< HTTP/2 200 
< content-type: text/html; charset=UTF-8
< server: ECS (iad/182A)`,
              'openssl s_client -connect example.com:443 -tls1_3': `CONNECTED(00000003)
---
Certificate chain
 0 s:CN = example.com
   i:C = US, O = DigiCert Inc, CN = DigiCert Global Root G2
---
Server certificate
-----BEGIN CERTIFICATE-----
MIIFazCCA1OgAwIBAgIQD6oU4vS5bVpL8Xq4rWn8JzANBgkqhkiG9w0BAQsFADBL
... [X.509 PEM Certificate Data Truncated] ...
-----END CERTIFICATE-----
subject=CN = example.com
issuer=C = US, O = DigiCert Inc, CN = DigiCert Global Root G2
---
No client certificate CA names sent
Peer signing digest: SHA256
Peer signature type: RSA-PSS
Server Temp Key: X25519, 253 bits
---
SSL handshake has read 3142 bytes and written 384 bytes
Verification: OK
---
New, TLSv1.3, Cipher is TLS_AES_256_GCM_SHA384
Server public key is 2048 bit
Secure Renegotiation IS NOT supported
Compression: NONE
Expansion: NONE
No ALPN negotiated
Early data was not sent
Verify return code: 0 (ok)`,
            },
          },
          hints: [
            {
              level: 1,
              text: 'The client sends its ephemeral Diffie-Hellman key share in the very first ClientHello message.',
            },
            {
              level: 2,
              text: 'Ephemeral keys are discarded after session termination, protecting past captures from future key leakage.',
            },
          ],
          validation: {
            judgment: [
              {
                kind: 'choose-and-defend',
                prompt:
                  'Why did the IETF eliminate static RSA key exchange in the TLS 1.3 specification?',
                options: [
                  'Because RSA key pairs cannot be generated on Linux servers',
                  'Because static RSA does not provide Perfect Forward Secrecy: compromising the server private key in the future allows retroactive decryption of all past recorded sessions',
                  'Because RSA keys are limited to 56 bits of entropy',
                  'To force all web servers to use UDP port 53',
                ],
                correctIndex: 1,
                explanation:
                  'Static RSA allows anyone who captures encrypted traffic to decrypt it if they ever acquire the server\'s private key in the future. TLS 1.3 enforces ephemeral Diffie-Hellman to guarantee Perfect Forward Secrecy.',
              },
              {
                kind: 'choose-and-defend',
                prompt:
                  'How does TLS 1.3 achieve a 1-RTT connection handshake compared to the 2-RTT required by TLS 1.2?',
                options: [
                  'By skipping server identity verification and certificate checks completely',
                  'The client proactively generates and includes its ephemeral Diffie-Hellman key share inside the initial ClientHello message, allowing both sides to derive the encryption key upon ServerHello receipt',
                  'By transmitting unencrypted HTTP passwords in the TCP SYN packet',
                  'By establishing the connection over ICMP instead of TCP',
                ],
                correctIndex: 1,
                explanation:
                  'In TLS 1.3, the client speculates on the cipher group and attaches its Diffie-Hellman key share in ClientHello. The server responds with its matching share, allowing symmetric encryption to begin in 1 round trip.',
              },
            ],
          },
          successMessage:
            'Mastered! You understand modern 1-RTT TLS 1.3 cryptography, ephemeral Diffie-Hellman, and Perfect Forward Secrecy.',
        },
      ],
    },
  ],

  challenge: {
    id: 'net13-challenge',
    title: 'Module 13 Challenge: Web Security & Certificate Forensics',
    scenario:
      'Diagnose critical HTTPS and certificate deployment failures during an enterprise web portal upgrade.',
    tasks: [
      {
        id: 'net13-ch1-tls-certificate-error',
        title: 'Challenge 1: Deciphering Browser Certificate Warnings',
        description:
          'Investigate a widespread user outage caused by certificate verification failures and identify the exact root cause.',
        instructions: [
          'Employees attempting to access internal portal `https://wiki.corp.internal` receive browser alert: `SEC_ERROR_UNKNOWN_ISSUER`.',
          'The server certificate has valid dates and lists `wiki.corp.internal` in its SAN.',
          'The certificate was signed by the company\'s private internal Corporate CA.',
          'External websites like `google.com` load without any warnings on the same workstations.',
          'Identify the required remediation.',
        ],
        type: 'challenge',
        primaryTable: '',
        initialSql: '',
        solutionSql: 'NETWORKING_JUDGMENT_TASK',
        solutionExplanation:
          'The internal Corporate Root CA certificate is missing from the client operating systems\' trusted root store. Deploying the internal Root CA certificate resolves the error.',
        httpTls: {
          title: 'PKI Certificate Authority Chain Forensic Lab',
          description:
            'Diagnose SEC_ERROR_UNKNOWN_ISSUER errors caused by enterprise private CAs missing from OS trust stores.',
          defaultTab: 'pki_certificates',
          targetDomain: 'wiki.corp.internal',
          certificate: {
            subject: 'CN=wiki.corp.internal, O=Internal Corp, C=US',
            issuer: 'CN=Corporate Internal Private Root CA, O=Internal Corp, C=US',
            sanList: ['wiki.corp.internal'],
            validFrom: '2025-01-01',
            validTo: '2027-01-01',
            serialNumber: '0x99:88:77:66:55',
            signatureAlgorithm: 'SHA256withRSA',
            publicKeyInfo: 'ECDSA 256-bit',
            isIssuerInTrustStore: false,
          },
          failureCode: 'SEC_ERROR_UNKNOWN_ISSUER',
          explanationNotes: [
            'Client browsers trust only certificates rooted in the pre-installed trust store',
            'Private enterprise CAs must be pushed to devices via device management/MDM',
          ],
        },
        hints: [
          {
            level: 1,
            text: 'SEC_ERROR_UNKNOWN_ISSUER means the browser cannot verify the signature back to a trusted root.',
          },
          {
            level: 2,
            text: 'Private enterprise CAs are not pre-installed in default browser trust stores.',
          },
        ],
        validation: {
          judgment: [
            {
              kind: 'choose-and-defend',
              prompt:
                'Why did the browsers reject the internally signed certificate with `SEC_ERROR_UNKNOWN_ISSUER`, and how is it resolved?',
              options: [
                'The server needs to be rebooted to clear the TCP socket cache',
                'The internal Corporate Root CA certificate is not installed in the workstations\' trusted root certificate store; deploying the internal root certificate via enterprise device management resolves the issue',
                'The certificate must be upgraded to HTTP/3',
                'Private internal domains are forbidden from using HTTPS by RFC 8446',
              ],
              correctIndex: 1,
              explanation:
                'Browsers only trust certificates whose signature chain ends in a known trusted root in the OS trust store. Private enterprise CAs must be distributed to client devices via Group Policy or MDM.',
            },
          ],
        },
        successMessage:
          'Challenge 1 mastered! You identified missing Root CA distribution as the cause of untrusted issuer errors.',
      },
      {
        id: 'net13-ch2-http2-multiplexing-hol',
        title: 'Challenge 2: Web Performance: HTTP/1.1 vs HTTP/2 Waterfall Analysis',
        description:
          'Evaluate page load metrics for a web application loading 120 small icon images under HTTP/1.1 versus HTTP/2.',
        instructions: [
          'An e-commerce homepage loads 120 small product icons.',
          'Under HTTP/1.1, the browser opens 6 TCP connections and the icons load in staggered batches with high queuing time.',
          'After upgrading the server to HTTP/2, all 120 icons load virtually simultaneously over a single TCP connection.',
          'Explain why HTTP/2 dramatically reduces load time in this scenario.',
        ],
        type: 'challenge',
        primaryTable: '',
        initialSql: '',
        solutionSql: 'NETWORKING_JUDGMENT_TASK',
        solutionExplanation:
          'HTTP/2 multiplexes multiple requests concurrently across a single TCP connection, eliminating the 6-connection per-domain browser limit and request queuing of HTTP/1.1.',
        httpTls: {
          title: 'Web Asset Waterfall & HoL Multiplexing Simulator',
          description:
            'Simulate high-concurrency asset loading and investigate packet loss recovery in HTTP/2 TCP vs HTTP/3 QUIC.',
          defaultTab: 'hol_blocking',
          activeProtocol: 'http2_tls13',
          streams: [
            { id: 1, name: 'product-icon-1.png', sizeBytes: 3200, packetsTotal: 3, status: 'in_flight' },
            { id: 2, name: 'product-icon-2.png', sizeBytes: 4100, packetsTotal: 3, status: 'in_flight' },
            { id: 3, name: 'product-icon-3.png', sizeBytes: 2900, packetsTotal: 2, status: 'in_flight' },
          ],
          explanationNotes: [
            'HTTP/2 multiplexes 100+ requests over a single TCP connection, eliminating 6-socket browser limits',
            'QUIC stream isolation prevents one dropped packet from stalling unaffected streams',
          ],
        },
        hints: [
          {
            level: 1,
            text: 'HTTP/1.1 browsers limit concurrent TCP connections to ~6 per origin.',
          },
          {
            level: 2,
            text: 'HTTP/2 sends all 120 requests concurrently as independent interleaved binary streams.',
          },
        ],
        validation: {
          judgment: [
            {
              kind: 'choose-and-defend',
              prompt:
                'Why does HTTP/2 provide dramatically faster loading for 120 small assets compared to HTTP/1.1?',
              options: [
                'HTTP/2 compresses images using a lossy algorithmic codec on the switch',
                'HTTP/2 multiplexes all 120 requests and responses concurrently over a single TCP connection without waiting for preceding requests to finish, bypassing HTTP/1.1\'s 6-connection browser limit and request queueing',
                'HTTP/2 disables encryption to save CPU cycles',
                'HTTP/2 increases the Ethernet MTU to 65,535 bytes',
              ],
              correctIndex: 1,
              explanation:
                'In HTTP/1.1, loading 120 assets across 6 connections requires 20 serial round trips per connection. HTTP/2 sends all requests simultaneously as multiplexed streams across one shared connection.',
            },
          ],
        },
        successMessage:
          'Challenge 2 cleared! You demonstrated deep comprehension of multiplexed stream transport in modern web performance.',
      },
    ],
  },
};
