'use client';

import React, { useState, useMemo } from 'react';
import {
  Globe,
  Lock,
  ShieldCheck,
  ShieldAlert,
  Zap,
  Layers,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  Key,
  Server,
  Laptop,
  Clock,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import type {
  HttpTlsTaskContent,
  HttpStreamEntry,
  X509CertificateInfo,
} from '../../../types/networking-curriculum';

// ─────────────────────────────────────────────────────────────────────────────
// PURE PROTOCOL HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

export type SupportedProtocol = 'http1_tls12' | 'http2_tls13' | 'http3_quic' | 'http3_0rtt';

export interface HandshakeCalculationResult {
  protocol: SupportedProtocol;
  rttCount: number;
  totalLatencyMs: number;
  timeToFirstByteMs: number;
  stages: {
    name: string;
    rttOffset: number;
    description: string;
    direction: 'client-to-server' | 'server-to-client' | 'roundtrip';
    protocolLayer: 'TCP' | 'TLS' | 'QUIC' | 'HTTP';
  }[];
  explanation: string;
}

export function calculateHandshakeRttLatency(
  protocol: SupportedProtocol,
  rttMs: number,
): HandshakeCalculationResult {
  const safeRtt = Math.max(1, rttMs);

  switch (protocol) {
    case 'http1_tls12': {
      // 1 RTT (TCP) + 2 RTT (TLS 1.2) + 1 RTT (HTTP GET / 200 OK) = 4 RTTs
      const rttCount = 4;
      return {
        protocol,
        rttCount,
        totalLatencyMs: rttCount * safeRtt,
        timeToFirstByteMs: rttCount * safeRtt,
        stages: [
          {
            name: 'TCP 3-Way Handshake',
            rttOffset: 1,
            description: 'SYN -> SYN-ACK -> ACK establishes transport socket',
            direction: 'roundtrip',
            protocolLayer: 'TCP',
          },
          {
            name: 'TLS 1.2 ClientHello / ServerHello',
            rttOffset: 2,
            description: 'Cipher suite negotiation + Server Certificate exchange',
            direction: 'roundtrip',
            protocolLayer: 'TLS',
          },
          {
            name: 'TLS 1.2 Key Exchange & Finished',
            rttOffset: 3,
            description: 'ClientKeyExchange + ChangeCipherSpec + Finished verification',
            direction: 'roundtrip',
            protocolLayer: 'TLS',
          },
          {
            name: 'HTTP/1.1 Request & Response',
            rttOffset: 4,
            description: 'GET /index.html -> 200 OK (First Contentful Byte)',
            direction: 'roundtrip',
            protocolLayer: 'HTTP',
          },
        ],
        explanation:
          'HTTP/1.1 over TLS 1.2 requires 4 round trips (4 RTT) before the client receives the first byte of application data: 1 TCP RTT + 2 TLS 1.2 RTTs + 1 HTTP transaction RTT.',
      };
    }

    case 'http2_tls13': {
      // 1 RTT (TCP) + 1 RTT (TLS 1.3 ECDHE) + 1 RTT (HTTP GET / 200 OK) = 3 RTTs
      const rttCount = 3;
      return {
        protocol,
        rttCount,
        totalLatencyMs: rttCount * safeRtt,
        timeToFirstByteMs: rttCount * safeRtt,
        stages: [
          {
            name: 'TCP 3-Way Handshake',
            rttOffset: 1,
            description: 'SYN -> SYN-ACK -> ACK socket initialization',
            direction: 'roundtrip',
            protocolLayer: 'TCP',
          },
          {
            name: 'TLS 1.3 1-RTT Handshake',
            rttOffset: 2,
            description: 'ClientHello (key_share) -> ServerHello (key_share + EncryptedExtensions + Finished)',
            direction: 'roundtrip',
            protocolLayer: 'TLS',
          },
          {
            name: 'HTTP/2 Multiplexed Request',
            rttOffset: 3,
            description: 'HEADERS frame GET / -> HEADERS+DATA frame 200 OK',
            direction: 'roundtrip',
            protocolLayer: 'HTTP',
          },
        ],
        explanation:
          'HTTP/2 over TLS 1.3 cuts connection latency to 3 RTTs: TLS 1.3 transmits ephemeral Diffie-Hellman key shares in the initial ClientHello, cutting crypto negotiation down to a single round trip (1-RTT).',
      };
    }

    case 'http3_quic': {
      // 1 RTT (Combined QUIC Transport + TLS 1.3 Crypto) + 1 RTT (HTTP/3 GET / 200 OK) = 2 RTTs
      const rttCount = 2;
      return {
        protocol,
        rttCount,
        totalLatencyMs: rttCount * safeRtt,
        timeToFirstByteMs: rttCount * safeRtt,
        stages: [
          {
            name: 'QUIC Combined Handshake (1-RTT)',
            rttOffset: 1,
            description: 'QUIC Initial + TLS 1.3 ClientHello -> QUIC Handshake + ServerHello + Finished over UDP',
            direction: 'roundtrip',
            protocolLayer: 'QUIC',
          },
          {
            name: 'HTTP/3 Stream Request & Response',
            rttOffset: 2,
            description: 'Stream 0: QPACK HEADERS GET -> HEADERS+DATA 200 OK',
            direction: 'roundtrip',
            protocolLayer: 'HTTP',
          },
        ],
        explanation:
          'HTTP/3 over QUIC merges transport connection setup and TLS 1.3 key exchange into 1 combined round trip over UDP, yielding data on RTT 2.',
      };
    }

    case 'http3_0rtt': {
      // 0 RTT Resumption: Early Data sent in QUIC Initial! 1 RTT to first byte.
      const rttCount = 1;
      return {
        protocol,
        rttCount,
        totalLatencyMs: rttCount * safeRtt,
        timeToFirstByteMs: safeRtt,
        stages: [
          {
            name: 'QUIC 0-RTT Resumption + Early Data',
            rttOffset: 1,
            description: 'Client sends QUIC Initial + PSK ticket + HTTP GET Early Data in the very first packet; Server returns 200 OK immediately',
            direction: 'roundtrip',
            protocolLayer: 'QUIC',
          },
        ],
        explanation:
          'HTTP/3 0-RTT Session Resumption uses a pre-shared key (PSK) ticket from a previous connection to encrypt and transmit HTTP GET requests in the initial packet, delivering responses in just 1 RTT!',
      };
    }
  }
}

export interface HolSimulationResult {
  protocol: 'http2' | 'http3';
  droppedStreamId: number;
  totalStreams: number;
  blockedStreamIds: number[];
  deliveredStreamIds: number[];
  isHoLBlocked: boolean;
  explanation: string;
}

export function evaluateHolBlockingImpact(
  protocol: 'http2' | 'http3',
  droppedStreamId: number,
  totalStreams: number = 3,
): HolSimulationResult {
  const allIds = Array.from({ length: totalStreams }, (_, i) => i + 1);

  if (protocol === 'http2') {
    // In HTTP/2 (over single TCP socket): dropping 1 packet stalls all streams
    const blockedStreamIds = allIds;
    return {
      protocol,
      droppedStreamId,
      totalStreams,
      blockedStreamIds,
      deliveredStreamIds: [],
      isHoLBlocked: true,
      explanation:
        `HTTP/2 TCP Head-of-Line Blocking: Dropping a packet on Stream ${droppedStreamId} forces the OS TCP stack to pause data delivery for ALL multiplexed streams (Stream ${allIds.join(', ')}). TCP guarantees byte-stream in-order delivery, so subsequent packets sit idle in the kernel receive buffer until the missing segment is retransmitted.`,
    };
  }

  // In HTTP/3 (over QUIC/UDP): streams are independent
  const blockedStreamIds = [droppedStreamId];
  const deliveredStreamIds = allIds.filter((id) => id !== droppedStreamId);
  return {
    protocol,
    droppedStreamId,
    totalStreams,
    blockedStreamIds,
    deliveredStreamIds,
    isHoLBlocked: false,
    explanation:
      `HTTP/3 QUIC Independence: A dropped packet on Stream ${droppedStreamId} only pauses Stream ${droppedStreamId}. Streams ${deliveredStreamIds.join(', ')} are independent byte streams over UDP and are delivered and processed immediately without delay!`,
  };
}

export interface CertVerificationResult {
  valid: boolean;
  errorCode: string;
  explanation: string;
}

export function verifyCertificateTrust(options: {
  domain: string;
  sanList: string[];
  issuerTrusted: boolean;
  notAfterDate?: string;
  currentDate?: string;
}): CertVerificationResult {
  const { domain, sanList, issuerTrusted, notAfterDate, currentDate } = options;

  // 1. Check Issuer Trust Store
  if (!issuerTrusted) {
    return {
      valid: false,
      errorCode: 'SEC_ERROR_UNKNOWN_ISSUER',
      explanation:
        'Untrusted Certificate Issuer: The certificate signature chain does not terminate in any Root CA pre-installed in the client device/browser trust store.',
    };
  }

  // 2. Check Expiration
  if (notAfterDate && currentDate) {
    const expiry = new Date(notAfterDate).getTime();
    const now = new Date(currentDate).getTime();
    if (!isNaN(expiry) && !isNaN(now) && now > expiry) {
      return {
        valid: false,
        errorCode: 'SEC_ERROR_EXPIRED_CERTIFICATE',
        explanation:
          `Certificate Expired: The certificate validity period ended on ${notAfterDate}. The browser strictly rejects expired certificates.`,
      };
    }
  }

  // 3. Check SAN domain match (RFC 6125)
  const normalizedDomain = domain.toLowerCase().trim();
  const domainMatches = sanList.some((san) => {
    const s = san.toLowerCase().trim();
    if (s === normalizedDomain) return true;
    if (s.startsWith('*.')) {
      const wildcardSuffix = s.slice(2);
      const dotIndex = normalizedDomain.indexOf('.');
      if (dotIndex !== -1) {
        const rootOfDomain = normalizedDomain.slice(dotIndex + 1);
        return rootOfDomain === wildcardSuffix;
      }
    }
    return false;
  });

  if (!domainMatches) {
    return {
      valid: false,
      errorCode: 'ERR_CERT_COMMON_NAME_INVALID',
      explanation:
        `Domain Mismatch: The requested hostname '${domain}' does not match any domain listed in the Subject Alternative Names (SAN): [${sanList.join(', ')}].`,
    };
  }

  return {
    valid: true,
    errorCode: 'NONE',
    explanation:
      `Certificate Valid: Hostname '${domain}' matches SAN entry, issuer is trusted in the Root CA store, and validity dates are active.`,
  };
}

export interface ForwardSecrecyComparisonResult {
  cipher: 'RSA' | 'ECDHE';
  forwardSecrecy: boolean;
  pastTrafficCompromised: boolean;
  message: string;
}

export function compareCipherKeyExchange(
  cipher: 'RSA' | 'ECDHE',
  serverPrivateKeyCompromised: boolean,
): ForwardSecrecyComparisonResult {
  if (cipher === 'RSA') {
    return {
      cipher,
      forwardSecrecy: false,
      pastTrafficCompromised: serverPrivateKeyCompromised,
      message: serverPrivateKeyCompromised
        ? 'CRITICAL SECURITY BREACH: Static RSA does NOT provide Forward Secrecy. Compromising the server private key allows attackers to decrypt ALL historically recorded network captures!'
        : 'Static RSA: Client encrypts pre-master secret using server public key. If the server private key is ever leaked in the future, all recorded past sessions can be decrypted.',
    };
  }

  return {
    cipher,
    forwardSecrecy: true,
    pastTrafficCompromised: false,
    message: serverPrivateKeyCompromised
      ? 'FORWARD SECRECY PRESERVED: TLS 1.3 Ephemeral Diffie-Hellman (ECDHE) generated temporary key pairs for the session and erased them immediately. The server private key is only used to sign the handshake, NOT encrypt session keys. Past recorded sessions CANNOT be decrypted!'
      : 'TLS 1.3 Ephemeral Diffie-Hellman (ECDHE): Generates one-time temporary keys per session. Guarantees Perfect Forward Secrecy (PFS).',
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT PROPS & DEFAULTS
// ─────────────────────────────────────────────────────────────────────────────

export interface HttpTlsHandshakeSimulatorProps {
  taskContent?: HttpTlsTaskContent;
  title?: string;
  description?: string;
}

const DEFAULT_STREAMS: HttpStreamEntry[] = [
  { id: 1, name: 'index.html (HTML Document)', sizeBytes: 14200, packetsTotal: 10, status: 'in_flight' },
  { id: 2, name: 'app.min.js (Client Bundle)', sizeBytes: 85400, packetsTotal: 60, status: 'in_flight' },
  { id: 3, name: 'styles.css (Tailwind Styles)', sizeBytes: 24000, packetsTotal: 17, status: 'in_flight' },
];

const DEFAULT_CERTIFICATE: X509CertificateInfo = {
  subject: 'CN=*.example.com, O=Example Global Corp, C=US',
  issuer: 'CN=DigiCert Global G2 TLS CA, O=DigiCert Inc, C=US',
  sanList: ['*.example.com', 'example.com', 'api.example.com'],
  validFrom: '2025-01-01',
  validTo: '2027-01-01',
  serialNumber: '0x4A:7B:1C:89:DF:22',
  signatureAlgorithm: 'SHA256withRSA (PKCS#1 v1.5)',
  publicKeyInfo: 'Elliptic Curve 256-bit (secp256r1 / NIST P-256)',
  isIssuerInTrustStore: true,
};

export const HttpTlsHandshakeSimulator: React.FC<HttpTlsHandshakeSimulatorProps> = ({
  taskContent,
  title,
  description,
}) => {
  // Tab state
  const [activeTab, setActiveTab] = useState<
    'handshake_latency' | 'hol_blocking' | 'tls13_handshake' | 'pki_certificates'
  >(taskContent?.defaultTab ?? 'handshake_latency');

  // Latency tab state
  const [activeProtocol, setActiveProtocol] = useState<SupportedProtocol>(
    taskContent?.activeProtocol ?? 'http2_tls13',
  );
  const [rttMs, setRttMs] = useState<number>(taskContent?.rttMs ?? 50);

  // HoL blocking tab state
  const [holProtocol, setHolProtocol] = useState<'http2' | 'http3'>('http2');
  const [droppedStreamId, setDroppedStreamId] = useState<number>(1);
  const [isPacketDropped, setIsPacketDropped] = useState<boolean>(true);

  // TLS 1.3 / Forward Secrecy state
  const [selectedCipher, setSelectedCipher] = useState<'RSA' | 'ECDHE'>('ECDHE');
  const [serverPrivateKeyCompromised, setServerPrivateKeyCompromised] = useState<boolean>(false);
  const [handshakeStep, setHandshakeStep] = useState<number>(2);

  // PKI Certificates tab state
  const [customDomain, setCustomDomain] = useState<string>(
    taskContent?.targetDomain ?? 'checkout.example.com',
  );
  const [issuerTrusted, setIssuerTrusted] = useState<boolean>(
    taskContent?.certificate?.isIssuerInTrustStore ?? true,
  );
  const [certExpired, setCertExpired] = useState<boolean>(false);

  // Calculations
  const handshakeCalc = useMemo(
    () => calculateHandshakeRttLatency(activeProtocol, rttMs),
    [activeProtocol, rttMs],
  );

  const holCalc = useMemo(() => {
    if (!isPacketDropped) {
      return {
        protocol: holProtocol,
        droppedStreamId: 0,
        totalStreams: 3,
        blockedStreamIds: [],
        deliveredStreamIds: [1, 2, 3],
        isHoLBlocked: false,
        explanation: 'All packets delivered cleanly without drops. Streams deliver smoothly.',
      };
    }
    return evaluateHolBlockingImpact(holProtocol, droppedStreamId, 3);
  }, [holProtocol, droppedStreamId, isPacketDropped]);

  const certData: X509CertificateInfo = useMemo(
    () => ({
      ...DEFAULT_CERTIFICATE,
      ...(taskContent?.certificate ?? {}),
      validTo: certExpired ? '2023-01-01' : (taskContent?.certificate?.validTo ?? '2027-01-01'),
      isIssuerInTrustStore: issuerTrusted,
    }),
    [taskContent?.certificate, certExpired, issuerTrusted],
  );

  const certResult = useMemo(
    () =>
      verifyCertificateTrust({
        domain: customDomain,
        sanList: certData.sanList,
        issuerTrusted: certData.isIssuerInTrustStore ?? true,
        notAfterDate: certData.validTo,
        currentDate: '2026-10-12',
      }),
    [customDomain, certData],
  );

  const forwardSecrecyResult = useMemo(
    () => compareCipherKeyExchange(selectedCipher, serverPrivateKeyCompromised),
    [selectedCipher, serverPrivateKeyCompromised],
  );

  return (
    <div
      className="w-full rounded-2xl border border-border bg-surface-1/90 shadow-xl backdrop-blur-md overflow-hidden text-text"
      data-testid="http-tls-handshake-simulator"
    >
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-border bg-surface-2/40 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-func/15 border border-func/30 flex items-center justify-center text-func shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-bold text-func uppercase tracking-wider">
                Module 13 Interactive Visualizer
              </span>
              <span className="text-text-muted text-xs">•</span>
              <span className="text-xs text-text-dim font-medium">HTTP/2, HTTP/3 & TLS 1.3</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-text truncate">
              {taskContent?.title || title || 'Web Transport & Cryptographic Security Lab'}
            </h3>
          </div>
        </div>

        {/* Tab Navigation Buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface-3/60 border border-border text-xs font-medium">
          <button
            onClick={() => setActiveTab('handshake_latency')}
            data-testid="tab-handshake-latency"
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'handshake_latency'
                ? 'bg-func text-white shadow-sm font-semibold'
                : 'text-text-muted hover:text-text'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Handshake RTT</span>
          </button>
          <button
            onClick={() => setActiveTab('hol_blocking')}
            data-testid="tab-hol-blocking"
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'hol_blocking'
                ? 'bg-func text-white shadow-sm font-semibold'
                : 'text-text-muted hover:text-text'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>HoL Blocking</span>
          </button>
          <button
            onClick={() => setActiveTab('tls13_handshake')}
            data-testid="tab-tls13-handshake"
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'tls13_handshake'
                ? 'bg-func text-white shadow-sm font-semibold'
                : 'text-text-muted hover:text-text'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>TLS 1.3 & PFS</span>
          </button>
          <button
            onClick={() => setActiveTab('pki_certificates')}
            data-testid="tab-pki-certificates"
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'pki_certificates'
                ? 'bg-func text-white shadow-sm font-semibold'
                : 'text-text-muted hover:text-text'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>PKI Certificates</span>
          </button>
        </div>
      </div>

      {(taskContent?.description || description) && (
        <div className="px-5 py-2.5 bg-surface-2/20 border-b border-border/50 text-xs text-text-dim">
          {taskContent?.description || description}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────
          TAB 1: HANDSHAKE LATENCY & RTT TIMELINE
          ───────────────────────────────────────────────────────────────────── */}
      {activeTab === 'handshake_latency' && (
        <div className="p-4 sm:p-6 space-y-6" data-testid="view-handshake-latency">
          {/* Controls Bar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-surface-2/40 border border-border">
            {/* Protocol Selector */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold text-text-dim uppercase tracking-wider block">
                Protocol Architecture
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'http1_tls12', label: 'HTTP/1.1 + TLS 1.2', rtt: '4 RTT' },
                  { id: 'http2_tls13', label: 'HTTP/2 + TLS 1.3', rtt: '3 RTT' },
                  { id: 'http3_quic', label: 'HTTP/3 + QUIC', rtt: '2 RTT' },
                  { id: 'http3_0rtt', label: 'HTTP/3 (0-RTT PSK)', rtt: '1 RTT' },
                ].map((proto) => (
                  <button
                    key={proto.id}
                    onClick={() => setActiveProtocol(proto.id as SupportedProtocol)}
                    data-testid={`protocol-btn-${proto.id}`}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      activeProtocol === proto.id
                        ? 'border-func bg-func/15 text-text font-bold shadow-sm'
                        : 'border-border/60 bg-surface-1/60 text-text-muted hover:border-border hover:text-text'
                    }`}
                  >
                    <div className="text-xs font-semibold">{proto.label}</div>
                    <div className="text-[10px] text-func font-mono">{proto.rtt} to first byte</div>
                  </button>
                ))}
              </div>
            </div>

            {/* RTT Slider */}
            <div className="space-y-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-text-dim uppercase">One-Way Network RTT</span>
                  <span className="text-func font-bold" data-testid="rtt-ms-display">
                    {rttMs} ms
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="200"
                  step="5"
                  value={rttMs}
                  onChange={(e) => setRttMs(Number(e.target.value))}
                  data-testid="rtt-slider"
                  className="w-full mt-2 accent-func cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-text-muted font-mono mt-1">
                  <span>10ms (Local Metro)</span>
                  <span>50ms (Transcontinental)</span>
                  <span>200ms (Satellite)</span>
                </div>
              </div>

              {/* Total Latency KPI card */}
              <div className="p-3 rounded-lg bg-surface-3/50 border border-border flex items-center justify-between">
                <div>
                  <div className="text-[10.5px] uppercase font-mono text-text-muted font-bold">
                    Time-To-First-Byte (TTFB)
                  </div>
                  <div
                    className="text-lg font-mono font-bold text-func"
                    data-testid="ttfb-result-ms"
                  >
                    {handshakeCalc.totalLatencyMs} ms
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10.5px] uppercase font-mono text-text-muted font-bold">
                    Round Trips Required
                  </div>
                  <div className="text-sm font-mono font-bold text-text" data-testid="rtt-count">
                    {handshakeCalc.rttCount} RTT ({handshakeCalc.rttCount} × {rttMs}ms)
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Visual Timeline Waterfall */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-text-dim flex items-center gap-2">
              <Clock className="w-4 h-4 text-func" />
              Round-Trip Sequence Breakdown
            </h4>

            <div className="space-y-2.5 font-mono text-xs">
              {handshakeCalc.stages.map((stage, idx) => {
                const startMs = idx * rttMs;
                const endMs = (idx + 1) * rttMs;
                return (
                  <div
                    key={stage.name}
                    className="p-3 rounded-xl border border-border bg-surface-2/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all hover:border-func/40"
                    data-testid={`handshake-stage-${idx}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-func/20 border border-func/40 flex items-center justify-center font-bold text-func text-xs">
                        {stage.rttOffset}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-text">{stage.name}</span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              stage.protocolLayer === 'TCP'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : stage.protocolLayer === 'TLS'
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                : stage.protocolLayer === 'QUIC'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            }`}
                          >
                            {stage.protocolLayer}
                          </span>
                        </div>
                        <div className="text-[11px] text-text-dim font-sans mt-0.5">
                          {stage.description}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-[11px] font-bold text-text-muted">
                        +{rttMs}ms ({startMs}ms → {endMs}ms)
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Explanation Alert */}
          <div className="p-4 rounded-xl bg-func/10 border border-func/30 text-xs text-text-dim flex items-start gap-3">
            <Zap className="w-5 h-5 text-func shrink-0 mt-0.5" />
            <div className="space-y-1 font-sans">
              <div className="font-bold text-text font-mono">Protocol Latency Insight:</div>
              <p className="leading-relaxed">{handshakeCalc.explanation}</p>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────
          TAB 2: HEAD-OF-LINE (HoL) BLOCKING SIMULATOR
          ───────────────────────────────────────────────────────────────────── */}
      {activeTab === 'hol_blocking' && (
        <div className="p-4 sm:p-6 space-y-6" data-testid="view-hol-blocking">
          {/* Controls Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-surface-2/40 border border-border">
            {/* Transport protocol toggle */}
            <div>
              <label className="text-xs font-mono font-bold text-text-dim uppercase tracking-wider block mb-1.5">
                Transport Layer
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setHolProtocol('http2')}
                  data-testid="hol-proto-http2"
                  className={`flex-1 py-2 px-3 rounded-lg border text-xs font-mono font-bold transition-all ${
                    holProtocol === 'http2'
                      ? 'border-func bg-func/20 text-white'
                      : 'border-border bg-surface-1 text-text-muted hover:text-text'
                  }`}
                >
                  HTTP/2 (TCP)
                </button>
                <button
                  onClick={() => setHolProtocol('http3')}
                  data-testid="hol-proto-http3"
                  className={`flex-1 py-2 px-3 rounded-lg border text-xs font-mono font-bold transition-all ${
                    holProtocol === 'http3'
                      ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                      : 'border-border bg-surface-1 text-text-muted hover:text-text'
                  }`}
                >
                  HTTP/3 (QUIC)
                </button>
              </div>
            </div>

            {/* Target Stream to Drop */}
            <div>
              <label className="text-xs font-mono font-bold text-text-dim uppercase tracking-wider block mb-1.5">
                Target Stream for Drop
              </label>
              <select
                value={droppedStreamId}
                onChange={(e) => setDroppedStreamId(Number(e.target.value))}
                data-testid="hol-stream-select"
                className="w-full py-2 px-3 rounded-lg border border-border bg-surface-1 text-xs font-mono font-bold text-text"
              >
                <option value={1}>Stream 1: index.html</option>
                <option value={2}>Stream 2: app.min.js</option>
                <option value={3}>Stream 3: styles.css</option>
              </select>
            </div>

            {/* Toggle Drop Packet */}
            <div>
              <label className="text-xs font-mono font-bold text-text-dim uppercase tracking-wider block mb-1.5">
                Packet Loss Simulation
              </label>
              <button
                onClick={() => setIsPacketDropped((prev) => !prev)}
                data-testid="hol-toggle-drop-btn"
                className={`w-full py-2 px-3 rounded-lg border text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 ${
                  isPacketDropped
                    ? 'border-red-500/50 bg-red-500/20 text-red-300'
                    : 'border-emerald-500/50 bg-emerald-500/20 text-emerald-300'
                }`}
              >
                {isPacketDropped ? (
                  <>
                    <XCircle className="w-4 h-4" />
                    <span>Packet Dropped on Stream {droppedStreamId}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>0% Packet Loss (Normal)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Stream Lanes Visualizer */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-text-dim flex items-center gap-2">
              <Layers className="w-4 h-4 text-func" />
              Concurrent Stream Pipeline Status
            </h4>

            <div className="space-y-3 font-mono">
              {DEFAULT_STREAMS.map((stream) => {
                const isDropped = isPacketDropped && stream.id === droppedStreamId;
                const isBlocked = isPacketDropped && holCalc.blockedStreamIds.includes(stream.id);
                const isDelivered = isPacketDropped && holCalc.deliveredStreamIds.includes(stream.id);

                return (
                  <div
                    key={stream.id}
                    data-testid={`stream-lane-${stream.id}`}
                    className={`p-4 rounded-xl border transition-all ${
                      isDropped
                        ? 'border-red-500/60 bg-red-950/20'
                        : isBlocked
                        ? 'border-amber-500/50 bg-amber-950/20'
                        : isDelivered
                        ? 'border-emerald-500/50 bg-emerald-950/20'
                        : 'border-border bg-surface-2/40'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-text">Stream {stream.id}:</span>
                        <span className="text-xs text-text-dim">{stream.name}</span>
                        <span className="text-[10px] text-text-muted">
                          ({stream.sizeBytes.toLocaleString()} bytes)
                        </span>
                      </div>

                      {/* Status Badges */}
                      <div>
                        {isDropped ? (
                          <span
                            data-testid={`stream-status-${stream.id}`}
                            className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-red-500/25 text-red-300 border border-red-500/40"
                          >
                            PACKET DROPPED — RETRANSMITTING
                          </span>
                        ) : isBlocked ? (
                          <span
                            data-testid={`stream-status-${stream.id}`}
                            className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-amber-500/25 text-amber-300 border border-amber-500/40 animate-pulse"
                          >
                            BLOCKED BY TCP HEAD-OF-LINE DELAY
                          </span>
                        ) : isDelivered ? (
                          <span
                            data-testid={`stream-status-${stream.id}`}
                            className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-emerald-500/25 text-emerald-300 border border-emerald-500/40"
                          >
                            INDEPENDENTLY DELIVERED (QUIC UDP)
                          </span>
                        ) : (
                          <span
                            data-testid={`stream-status-${stream.id}`}
                            className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-blue-500/25 text-blue-300 border border-blue-500/40"
                          >
                            ACTIVE IN FLIGHT
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar with Packet Chunks */}
                    <div className="w-full h-3 rounded-full bg-surface-3 overflow-hidden flex border border-border">
                      {Array.from({ length: 8 }).map((_, i) => {
                        const isPacketLossIndex = isDropped && i === 3;
                        const isStalledIndex = isBlocked && i >= 3;
                        return (
                          <div
                            key={i}
                            className={`flex-1 border-r border-surface-1 last:border-none transition-all ${
                              isPacketLossIndex
                                ? 'bg-red-500 animate-ping'
                                : isStalledIndex
                                ? 'bg-amber-600/40'
                                : isDelivered
                                ? 'bg-emerald-500'
                                : 'bg-func/80'
                            }`}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Diagnostic Box */}
          <div
            className={`p-4 rounded-xl border text-xs flex items-start gap-3 ${
              holCalc.isHoLBlocked
                ? 'bg-red-500/10 border-red-500/30 text-red-200'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
            }`}
          >
            {holCalc.isHoLBlocked ? (
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1 font-sans">
              <div className="font-bold font-mono">
                {holCalc.isHoLBlocked
                  ? 'TCP Cross-Stream Blocking Detected:'
                  : 'QUIC Stream Isolation Verified:'}
              </div>
              <p className="leading-relaxed">{holCalc.explanation}</p>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────
          TAB 3: TLS 1.3 1-RTT HANDSHAKE & FORWARD SECRECY
          ───────────────────────────────────────────────────────────────────── */}
      {activeTab === 'tls13_handshake' && (
        <div className="p-4 sm:p-6 space-y-6" data-testid="view-tls13-handshake">
          {/* Handshake Step Stepper */}
          <div className="p-4 rounded-xl bg-surface-2/40 border border-border space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-text-dim">
                TLS 1.3 Ephemeral (ECDHE) 1-RTT Exchange
              </h4>
              <span className="text-xs font-mono text-func font-bold">
                Step {handshakeStep} of 4
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[
                { step: 1, title: 'ClientHello', desc: 'Sends key_share (Curve25519)' },
                { step: 2, title: 'ServerHello', desc: 'Matches key_share & derives secret' },
                { step: 3, title: 'Encrypted Cert', desc: 'Encrypted Certificate + Finished' },
                { step: 4, title: 'Application Data', desc: 'Symmetric AEAD payload' },
              ].map((s) => (
                <button
                  key={s.step}
                  onClick={() => setHandshakeStep(s.step)}
                  data-testid={`step-btn-${s.step}`}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    handshakeStep === s.step
                      ? 'border-func bg-func/20 text-white font-bold'
                      : handshakeStep > s.step
                      ? 'border-emerald-500/40 bg-emerald-950/20 text-text'
                      : 'border-border bg-surface-1/40 text-text-muted hover:text-text'
                  }`}
                >
                  <div className="text-xs font-mono font-bold">
                    {s.step}. {s.title}
                  </div>
                  <div className="text-[10px] text-text-dim mt-0.5 font-sans truncate">{s.desc}</div>
                </button>
              ))}
            </div>

            {/* Active Step Details */}
            <div className="p-4 rounded-xl bg-surface-3/60 border border-border font-mono text-xs space-y-2">
              <div className="flex items-center justify-between text-text-dim">
                <span className="font-bold text-func">Packet Inspection Details:</span>
                <span className="text-[11px]">
                  Encryption:{' '}
                  {handshakeStep >= 3 ? (
                    <span className="text-emerald-400 font-bold">ENCRYPTED (AES-256-GCM)</span>
                  ) : (
                    <span className="text-amber-400 font-bold">PLAINTEXT (Handshake Negotiation)</span>
                  )}
                </span>
              </div>

              {handshakeStep === 1 && (
                <div className="text-text space-y-1">
                  <div>&gt; TLSv1.3 Record: Handshake Protocol: Client Hello</div>
                  <div className="text-text-dim">&gt; Supported Ciphers: TLS_AES_256_GCM_SHA384, TLS_CHACHA20_POLY1305_SHA256</div>
                  <div className="text-emerald-400 font-bold">
                    &gt; Extension: key_share (Group: x25519, Ephemeral Public Key: 0x8a91bc...)
                  </div>
                </div>
              )}

              {handshakeStep === 2 && (
                <div className="text-text space-y-1">
                  <div>&lt; TLSv1.3 Record: Handshake Protocol: Server Hello</div>
                  <div className="text-text-dim">&lt; Selected Cipher: TLS_AES_256_GCM_SHA384</div>
                  <div className="text-emerald-400 font-bold">
                    &lt; Extension: key_share (Server Ephemeral Key: 0x3f5c1a...)
                  </div>
                  <div className="text-func font-bold pt-1">
                    [!] Both endpoints now immediately calculate the shared Master Secret via ECDH!
                  </div>
                </div>
              )}

              {handshakeStep === 3 && (
                <div className="text-text space-y-1">
                  <div className="text-purple-400 font-bold">&lt; EncryptedExtensions (Encrypted under Handshake Secret)</div>
                  <div>&lt; Certificate (X.509 server chain, digitally signed by CA)</div>
                  <div>&lt; CertificateVerify (Server signs handshake transcript using its private key)</div>
                  <div>&lt; Finished (HMAC verifying transcript integrity)</div>
                </div>
              )}

              {handshakeStep === 4 && (
                <div className="text-text space-y-1">
                  <div className="text-emerald-400 font-bold">&gt; Client Finished (Verification ACK)</div>
                  <div className="text-emerald-300 font-bold">&gt; Application Data: HTTP GET /dashboard (AEAD Encrypted)</div>
                  <div className="text-emerald-300 font-bold">&lt; Application Data: HTTP 200 OK (AEAD Encrypted)</div>
                </div>
              )}
            </div>
          </div>

          {/* Forward Secrecy Threat Simulator */}
          <div className="p-4 sm:p-5 rounded-xl bg-surface-2/40 border border-border space-y-4">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-text-dim flex items-center gap-2">
              <Key className="w-4 h-4 text-func" />
              Perfect Forward Secrecy (PFS) Forensic Defense
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Cipher Mode Select */}
              <div className="space-y-2">
                <span className="text-xs font-mono text-text-dim block">Key Exchange Algorithm:</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedCipher('RSA')}
                    data-testid="cipher-select-rsa"
                    className={`flex-1 p-2.5 rounded-lg border text-xs font-mono font-bold transition-all ${
                      selectedCipher === 'RSA'
                        ? 'border-amber-500 bg-amber-500/20 text-amber-200'
                        : 'border-border bg-surface-1 text-text-muted hover:text-text'
                    }`}
                  >
                    Legacy Static RSA
                  </button>
                  <button
                    onClick={() => setSelectedCipher('ECDHE')}
                    data-testid="cipher-select-ecdhe"
                    className={`flex-1 p-2.5 rounded-lg border text-xs font-mono font-bold transition-all ${
                      selectedCipher === 'ECDHE'
                        ? 'border-emerald-500 bg-emerald-500/20 text-emerald-200'
                        : 'border-border bg-surface-1 text-text-muted hover:text-text'
                    }`}
                  >
                    TLS 1.3 ECDHE (PFS)
                  </button>
                </div>
              </div>

              {/* Compromise toggle */}
              <div className="space-y-2">
                <span className="text-xs font-mono text-text-dim block">Future Compromise Scenario:</span>
                <button
                  onClick={() => setServerPrivateKeyCompromised((prev) => !prev)}
                  data-testid="toggle-compromise-btn"
                  className={`w-full p-2.5 rounded-lg border text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 ${
                    serverPrivateKeyCompromised
                      ? 'border-red-500 bg-red-950/40 text-red-300'
                      : 'border-border bg-surface-1 text-text-muted hover:text-text'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>
                    {serverPrivateKeyCompromised
                      ? 'Server Private Key Leaked (5 Years Later)'
                      : 'Server Private Key Secure'}
                  </span>
                </button>
              </div>
            </div>

            {/* Verdict Box */}
            <div
              data-testid="forward-secrecy-verdict"
              className={`p-4 rounded-xl border text-xs flex items-start gap-3 ${
                forwardSecrecyResult.pastTrafficCompromised
                  ? 'bg-red-500/15 border-red-500/40 text-red-200'
                  : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200'
              }`}
            >
              {forwardSecrecyResult.pastTrafficCompromised ? (
                <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              ) : (
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1 font-sans">
                <div className="font-bold font-mono">
                  {forwardSecrecyResult.pastTrafficCompromised
                    ? 'SECURITY FAILURE: Past Captures Decrypted'
                    : 'FORWARD SECRECY ACTIVE: Past Captures Protected'}
                </div>
                <p className="leading-relaxed">{forwardSecrecyResult.message}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────
          TAB 4: PKI CERTIFICATES & TRUST CHAIN INSPECTOR
          ───────────────────────────────────────────────────────────────────── */}
      {activeTab === 'pki_certificates' && (
        <div className="p-4 sm:p-6 space-y-6" data-testid="view-pki-certificates">
          {/* Domain Tester Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 rounded-xl bg-surface-2/40 border border-border">
            <div className="md:col-span-1 space-y-1.5">
              <label className="text-xs font-mono font-bold text-text-dim uppercase tracking-wider block">
                Requested URL Domain
              </label>
              <input
                type="text"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                data-testid="domain-input"
                className="w-full py-2 px-3 rounded-lg border border-border bg-surface-1 font-mono text-xs text-text font-bold"
                placeholder="e.g. checkout.example.com"
              />
            </div>

            {/* Failure Toggles */}
            <div className="md:col-span-2 flex flex-wrap items-end gap-2">
              <button
                onClick={() => setIssuerTrusted((prev) => !prev)}
                data-testid="toggle-issuer-trust-btn"
                className={`py-2 px-3 rounded-lg border text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                  issuerTrusted
                    ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-300'
                    : 'border-red-500/50 bg-red-500/20 text-red-300'
                }`}
              >
                {issuerTrusted ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                <span>Root CA in Trust Store: {issuerTrusted ? 'YES' : 'NO (Untrusted)'}</span>
              </button>

              <button
                onClick={() => setCertExpired((prev) => !prev)}
                data-testid="toggle-expired-btn"
                className={`py-2 px-3 rounded-lg border text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                  certExpired
                    ? 'border-red-500/50 bg-red-500/20 text-red-300'
                    : 'border-border bg-surface-1 text-text-muted hover:text-text'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Validity Period: {certExpired ? 'EXPIRED' : 'ACTIVE'}</span>
              </button>
            </div>
          </div>

          {/* Certificate Hierarchy & Verification Box */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left: Chain of Trust */}
            <div className="p-4 rounded-xl border border-border bg-surface-2/40 space-y-3 font-mono text-xs">
              <h4 className="font-bold uppercase tracking-wider text-text-dim flex items-center gap-2">
                <FileText className="w-4 h-4 text-func" />
                X.509 Certification Hierarchy
              </h4>

              {/* Step 1: Root CA */}
              <div
                data-testid="cert-root-ca"
                className={`p-3 rounded-lg border ${
                  issuerTrusted
                    ? 'border-emerald-500/40 bg-emerald-950/20'
                    : 'border-red-500/40 bg-red-950/20'
                }`}
              >
                <div className="flex items-center justify-between text-text font-bold">
                  <span>1. Root CA (DigiCert Global Root G2)</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded ${
                      issuerTrusted ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                    }`}
                  >
                    {issuerTrusted ? 'IN ROOT STORE' : 'MISSING FROM STORE'}
                  </span>
                </div>
                <div className="text-[11px] text-text-dim mt-0.5 font-sans">
                  Self-signed trust anchor installed in OS certificate store.
                </div>
              </div>

              <div className="flex justify-center text-text-muted">
                <ChevronRight className="w-4 h-4 rotate-90" />
              </div>

              {/* Step 2: Intermediate CA */}
              <div className="p-3 rounded-lg border border-border bg-surface-3/50">
                <div className="flex items-center justify-between text-text font-bold">
                  <span>2. Intermediate CA (DigiCert TLS RSA SHA256 CA)</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">
                    DIGITALLY SIGNED
                  </span>
                </div>
                <div className="text-[11px] text-text-dim mt-0.5 font-sans">
                  Delegated signing authority protecting the offline Root CA.
                </div>
              </div>

              <div className="flex justify-center text-text-muted">
                <ChevronRight className="w-4 h-4 rotate-90" />
              </div>

              {/* Step 3: Leaf Certificate */}
              <div className="p-3 rounded-lg border border-border bg-surface-3/50 space-y-1.5">
                <div className="flex items-center justify-between text-text font-bold">
                  <span>3. End-Entity Certificate (*.example.com)</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded ${
                      certExpired ? 'bg-red-500/20 text-red-300' : 'bg-emerald-500/20 text-emerald-300'
                    }`}
                  >
                    {certExpired ? 'EXPIRED' : 'VALID EXPIRY'}
                  </span>
                </div>
                <div className="text-[11px] text-text-dim font-sans">
                  Subject Alternative Names (SAN):
                </div>
                <div className="flex flex-wrap gap-1">
                  {certData.sanList.map((san) => (
                    <span
                      key={san}
                      className="px-2 py-0.5 rounded bg-func/15 text-func text-[10.5px] border border-func/30 font-bold"
                    >
                      {san}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Browser Evaluation Verdict */}
            <div className="p-4 rounded-xl border border-border bg-surface-2/40 flex flex-col justify-between space-y-4">
              <div>
                <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-text-dim mb-3 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-func" />
                  Client Browser Verification Verdict
                </h4>

                <div
                  data-testid="cert-verdict-box"
                  className={`p-4 rounded-xl border space-y-2 ${
                    certResult.valid
                      ? 'border-emerald-500/50 bg-emerald-950/20 text-emerald-200'
                      : 'border-red-500/50 bg-red-950/20 text-red-200'
                  }`}
                >
                  <div className="flex items-center gap-2 font-mono font-bold text-sm">
                    {certResult.valid ? (
                      <>
                        <ShieldCheck className="w-5 h-5 text-emerald-400" />
                        <span>SECURE CONNECTION ESTABLISHED</span>
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="w-5 h-5 text-red-400" />
                        <span data-testid="cert-error-code">{certResult.errorCode}</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs leading-relaxed font-sans">{certResult.explanation}</p>
                </div>
              </div>

              {/* Technical Specifications */}
              <div className="p-3 rounded-lg bg-surface-3/50 border border-border font-mono text-[11px] space-y-1">
                <div className="flex justify-between">
                  <span className="text-text-muted">Signature Algorithm:</span>
                  <span className="text-text font-bold">{certData.signatureAlgorithm}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Public Key Type:</span>
                  <span className="text-text font-bold">{certData.publicKeyInfo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Serial Number:</span>
                  <span className="text-text font-bold">{certData.serialNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Validity Window:</span>
                  <span className="text-text font-bold">
                    {certData.validFrom} to {certData.validTo}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
