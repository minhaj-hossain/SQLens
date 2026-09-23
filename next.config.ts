/** @type {import('next').NextConfig} */

// ---------------------------------------------------------------------------
// Milestone 4 (item 14) — baseline security headers (finding S-4).
//
// * nosniff / X-Frame-Options / Referrer-Policy apply everywhere, dev + prod.
// * The CSP is production-only: Next's dev overlay + HMR websocket rely on
//   eval and ws:// endpoints a strict policy would break, and dev is never
//   exposed anyway.
// * script-src needs 'unsafe-inline' because the App Router ships its RSC
//   flight payload as inline <script> tags; a nonce-based policy would require
//   the Next 16 proxy/middleware layer and is out of scope for this audit.
//   The layout's inline theme script is covered by the same allowance. Every
//   external source stays 'self' — the app loads no fonts, CDNs, or analytics
//   (grep over layout.tsx finds only schema.org/SITE_URL metadata literals).
// ---------------------------------------------------------------------------
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
];

if (process.env.NODE_ENV === 'production') {
  securityHeaders.push(
    { key: 'Content-Security-Policy', value: CONTENT_SECURITY_POLICY },
    // S-4 also flagged missing HSTS. Harmless over http (browsers ignore it),
    // effective on Vercel where TLS terminates at the edge.
    { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
  );
}

const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
