import { ModuleData } from '../../../types/curriculum';

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
        summary:
          'HTTP methods define actions (GET, POST, PUT, DELETE). Status code families categorize responses (2xx success, 3xx redirect, 4xx client error, 5xx server error). HTTP/2 uses binary framing to multiplex concurrent streams on one TCP stream, while HTTP/3 runs over UDP/QUIC.',
        explanation: [
          '### HTTP Methods & Status Codes',
          '- 2xx: 200 OK, 201 Created.',
          '- 3xx: 301 Moved Permanently, 304 Not Modified.',
          '- 4xx: 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found.',
          '- 5xx: 500 Internal Server Error, 502 Bad Gateway, 503 Unavailable.',
          '',
          '### Protocol Generations',
          '- **HTTP/1.1**: Persistent connections, but Head-of-Line blocking limits request concurrency on a single connection.',
          '- **HTTP/2**: Multiplexes concurrent streams over 1 TCP connection, eliminating application-level stream blocking, but remains subject to TCP transport-layer Head-of-Line blocking if a packet drops.',
          '- **HTTP/3**: Operates over UDP/QUIC with independent streams, mitigating TCP cross-stream transport blocking (though byte ordering within an individual stream and shared congestion control remain).',
        ],
        keyTakeaway:
          'HTTP/2 multiplexes streams over 1 TCP connection; HTTP/3 runs over UDP/QUIC to isolate packet drops to individual streams.',
        exampleQuery: '',
        exampleQueryExplanation: '',
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
          '### Asymmetric Cryptography',
          'The private key stays strictly confidential on the server. The public key is shared inside the digital certificate. Anyone can encrypt for the server, but only the private key can decrypt.',
          '',
          '### Certificate Authorities (CAs)',
          'CAs cryptographically sign the server certificate. Client operating systems possess a Root CA Store. The browser traces the signature chain to verify authenticity.',
          '',
          '### Subject Alternative Names (SAN)',
          'The SAN field enumerates authorized domain hostnames. Mismatching hostnames trigger security warnings.',
        ],
        keyTakeaway:
          'Trust is anchored in the client Root CA Store. The browser verifies CA digital signatures and checks that the URL matches the certificate SAN.',
        exampleQuery: '',
        exampleQueryExplanation: '',
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
          '### Eliminating Static RSA',
          'Static RSA allows future attackers who obtain the server private key to retroactively decrypt historical traffic captures.',
          '',
          '### Perfect Forward Secrecy (PFS)',
          'With ECDHE, temporary key pairs are generated for each session and discarded immediately. Future private key leaks cannot decrypt past sessions.',
          '',
          '### 1-RTT Handshake',
          'The client includes its Diffie-Hellman key share directly in ClientHello. The server responds with its share, enabling symmetric AEAD encryption in 1 round trip.',
        ],
        keyTakeaway:
          'TLS 1.3 provides 1-RTT handshakes and mandates Perfect Forward Secrecy via Ephemeral Diffie-Hellman key shares.',
        exampleQuery: '',
        exampleQueryExplanation: '',
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
