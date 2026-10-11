/**
 * Sprint 6 Test Suite: HTTP/2, HTTP/3 & TLS 1.3 Handshake Simulator (Module 13)
 * ─────────────────────────────────────────────────────────────────────────────
 * Validates:
 * 1. Pure latency calculation helpers (HTTP/1.1 4-RTT, HTTP/2 3-RTT, HTTP/3 2-RTT, 0-RTT PSK).
 * 2. Pure HoL blocking evaluator (TCP cumulative stalling vs QUIC stream isolation).
 * 3. Pure PKI certificate validator (SAN wildcard matching, untrusted issuer, expired certs).
 * 4. Pure Forward Secrecy comparison (Static RSA breach vs Ephemeral ECDHE immunity).
 * 5. Standalone HttpTlsHandshakeSimulator rendering across all tabs:
 *    - Handshake Latency mode (RTT timeline, TTFB calculations, protocol stages).
 *    - HoL Blocking mode (stream lanes, packet drop markers, status badges).
 *    - TLS 1.3 1-RTT Handshake mode (ECDHE key_share, encryption status, forward secrecy).
 *    - PKI Certificates mode (trust hierarchy, SAN pills, Root CA store check).
 * 6. Pipeline detection (`isNetworkingTask`) and `NetworkingPracticeTaskView` split-pane integration.
 * 7. Verification that all Module 13 tasks (p1, p2, p3, ch1, ch2) have `httpTls` properly configured.
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

import {
  HttpTlsHandshakeSimulator,
  calculateHandshakeRttLatency,
  evaluateHolBlockingImpact,
  verifyCertificateTrust,
  compareCipherKeyExchange,
} from '../../src/components/learning/networking/HttpTlsHandshakeSimulator';

import { NetworkingPracticeTaskView } from '../../src/components/learning/networking/NetworkingPracticeTaskView';
import {
  isNetworkingTask,
  gradeNetworkingSubmission,
} from '../../src/lib/network-engine/networking-submit-pipeline';
import { submitForTask } from '../../src/lib/track-submit';
import { NET_13_MODULE } from '../../src/content/networking/modules/net-13';
import type { PracticeTask, HttpTlsTaskContent } from '../../src/types/curriculum';

// ─────────────────────────────────────────────────────────────────────────────
// Test Suite 1: Pure Protocol Calculation & Cryptographic Helpers
// ─────────────────────────────────────────────────────────────────────────────

describe('Sprint 6 — Test 1: Pure Handshake Latency & Protocol Calculations', () => {
  it('calculates 4-RTT latency for HTTP/1.1 + TLS 1.2', () => {
    const result = calculateHandshakeRttLatency('http1_tls12', 50);
    expect(result.rttCount).toBe(4);
    expect(result.totalLatencyMs).toBe(200);
    expect(result.stages).toHaveLength(4);
    expect(result.stages[0].name).toContain('TCP 3-Way Handshake');
    expect(result.stages[1].protocolLayer).toBe('TLS');
    expect(result.stages[3].protocolLayer).toBe('HTTP');
    expect(result.explanation).toContain('4 round trips');
  });

  it('calculates 3-RTT latency for HTTP/2 + TLS 1.3', () => {
    const result = calculateHandshakeRttLatency('http2_tls13', 40);
    expect(result.rttCount).toBe(3);
    expect(result.totalLatencyMs).toBe(120);
    expect(result.stages).toHaveLength(3);
    expect(result.stages[1].description).toContain('key_share');
    expect(result.explanation).toContain('cuts connection latency to 3 RTTs');
  });

  it('calculates 2-RTT latency for HTTP/3 over QUIC', () => {
    const result = calculateHandshakeRttLatency('http3_quic', 60);
    expect(result.rttCount).toBe(2);
    expect(result.totalLatencyMs).toBe(120);
    expect(result.stages[0].protocolLayer).toBe('QUIC');
    expect(result.stages[0].description).toContain('UDP');
    expect(result.explanation).toContain('merges transport connection setup');
  });

  it('calculates 1-RTT latency for HTTP/3 0-RTT PSK Session Resumption', () => {
    const result = calculateHandshakeRttLatency('http3_0rtt', 50);
    expect(result.rttCount).toBe(1);
    expect(result.totalLatencyMs).toBe(50);
    expect(result.timeToFirstByteMs).toBe(50);
    expect(result.stages[0].description).toContain('Early Data');
    expect(result.explanation).toContain('0-RTT Session Resumption');
  });
});

describe('Sprint 6 — Test 2: Head-of-Line Blocking Evaluation (TCP vs QUIC)', () => {
  it('proves HTTP/2 over TCP blocks all streams when 1 packet drops', () => {
    const result = evaluateHolBlockingImpact('http2', 1, 3);
    expect(result.isHoLBlocked).toBe(true);
    expect(result.blockedStreamIds).toEqual([1, 2, 3]);
    expect(result.deliveredStreamIds).toEqual([]);
    expect(result.explanation).toContain('TCP Head-of-Line Blocking');
  });

  it('proves HTTP/3 over QUIC delivers non-dropped streams independently', () => {
    const result = evaluateHolBlockingImpact('http3', 1, 3);
    expect(result.isHoLBlocked).toBe(false);
    expect(result.blockedStreamIds).toEqual([1]);
    expect(result.deliveredStreamIds).toEqual([2, 3]);
    expect(result.explanation).toContain('QUIC Independence');
  });
});

describe('Sprint 6 — Test 3: X.509 Certificate & PKI Trust Chain Verification', () => {
  const validSanList = ['*.example.com', 'example.com', 'api.example.com'];

  it('validates matching wildcard domain with trusted root CA', () => {
    const result = verifyCertificateTrust({
      domain: 'checkout.example.com',
      sanList: validSanList,
      issuerTrusted: true,
      notAfterDate: '2028-01-01',
      currentDate: '2026-10-12',
    });
    expect(result.valid).toBe(true);
    expect(result.errorCode).toBe('NONE');
    expect(result.explanation).toContain('Certificate Valid');
  });

  it('detects domain mismatch when requested hostname is not in SAN', () => {
    const result = verifyCertificateTrust({
      domain: 'admin.internal.com',
      sanList: validSanList,
      issuerTrusted: true,
      notAfterDate: '2028-01-01',
      currentDate: '2026-10-12',
    });
    expect(result.valid).toBe(false);
    expect(result.errorCode).toBe('ERR_CERT_COMMON_NAME_INVALID');
    expect(result.explanation).toContain('Domain Mismatch');
  });

  it('rejects untrusted issuer when Root CA is missing from client trust store', () => {
    const result = verifyCertificateTrust({
      domain: 'checkout.example.com',
      sanList: validSanList,
      issuerTrusted: false,
      notAfterDate: '2028-01-01',
      currentDate: '2026-10-12',
    });
    expect(result.valid).toBe(false);
    expect(result.errorCode).toBe('SEC_ERROR_UNKNOWN_ISSUER');
    expect(result.explanation).toContain('Untrusted Certificate Issuer');
  });

  it('rejects expired certificates', () => {
    const result = verifyCertificateTrust({
      domain: 'checkout.example.com',
      sanList: validSanList,
      issuerTrusted: true,
      notAfterDate: '2024-01-01',
      currentDate: '2026-10-12',
    });
    expect(result.valid).toBe(false);
    expect(result.errorCode).toBe('SEC_ERROR_EXPIRED_CERTIFICATE');
    expect(result.explanation).toContain('Certificate Expired');
  });
});

describe('Sprint 6 — Test 4: Forward Secrecy Forensic Comparison (Static RSA vs ECDHE)', () => {
  it('demonstrates legacy static RSA vulnerability to retroactive decryption', () => {
    const uncompromised = compareCipherKeyExchange('RSA', false);
    expect(uncompromised.forwardSecrecy).toBe(false);
    expect(uncompromised.pastTrafficCompromised).toBe(false);

    const breached = compareCipherKeyExchange('RSA', true);
    expect(breached.pastTrafficCompromised).toBe(true);
    expect(breached.message).toContain('CRITICAL SECURITY BREACH');
  });

  it('demonstrates TLS 1.3 ECDHE immunity to future private key leaks', () => {
    const breached = compareCipherKeyExchange('ECDHE', true);
    expect(breached.forwardSecrecy).toBe(true);
    expect(breached.pastTrafficCompromised).toBe(false);
    expect(breached.message).toContain('FORWARD SECRECY PRESERVED');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test Suite 5: Standalone HttpTlsHandshakeSimulator Rendering
// ─────────────────────────────────────────────────────────────────────────────

describe('Sprint 6 — Test 5: HttpTlsHandshakeSimulator Standalone Rendering', () => {
  it('renders default Handshake Latency view with RTT timeline and TTFB metrics', () => {
    const html = renderToStaticMarkup(<HttpTlsHandshakeSimulator />);

    expect(html).toContain('data-testid="http-tls-handshake-simulator"');
    expect(html).toContain('data-testid="view-handshake-latency"');
    expect(html).toContain('Time-To-First-Byte (TTFB)');
    expect(html).toContain('data-testid="ttfb-result-ms"');
    expect(html).toContain('150 ms'); // 3 RTT * 50ms default
    expect(html).toContain('data-testid="tab-handshake-latency"');
    expect(html).toContain('data-testid="tab-hol-blocking"');
    expect(html).toContain('data-testid="tab-tls13-handshake"');
    expect(html).toContain('data-testid="tab-pki-certificates"');
  });

  it('renders Head-of-Line (HoL) Blocking tab with stream pipelines', () => {
    const config: HttpTlsTaskContent = {
      defaultTab: 'hol_blocking',
      activeProtocol: 'http2_tls13',
    };

    const html = renderToStaticMarkup(<HttpTlsHandshakeSimulator taskContent={config} />);

    expect(html).toContain('data-testid="view-hol-blocking"');
    expect(html).toContain('Concurrent Stream Pipeline Status');
    expect(html).toContain('data-testid="stream-lane-1"');
    expect(html).toContain('data-testid="stream-lane-2"');
    expect(html).toContain('data-testid="stream-lane-3"');
    expect(html).toContain('PACKET DROPPED');
    expect(html).toContain('BLOCKED BY TCP HEAD-OF-LINE DELAY');
  });

  it('renders TLS 1.3 & Forward Secrecy tab with 1-RTT stepper', () => {
    const config: HttpTlsTaskContent = {
      defaultTab: 'tls13_handshake',
    };

    const html = renderToStaticMarkup(<HttpTlsHandshakeSimulator taskContent={config} />);

    expect(html).toContain('data-testid="view-tls13-handshake"');
    expect(html).toContain('TLS 1.3 Ephemeral (ECDHE) 1-RTT Exchange');
    expect(html).toContain('ClientHello');
    expect(html).toContain('ServerHello');
    expect(html).toContain('Perfect Forward Secrecy (PFS) Forensic Defense');
    expect(html).toContain('data-testid="forward-secrecy-verdict"');
    expect(html).toContain('FORWARD SECRECY ACTIVE');
  });

  it('renders PKI Certificates tab with X.509 hierarchy and SAN list', () => {
    const config: HttpTlsTaskContent = {
      defaultTab: 'pki_certificates',
      targetDomain: 'admin.company.com',
      certificate: {
        subject: 'CN=company.com',
        issuer: 'CN=DigiCert Global Root CA',
        sanList: ['company.com', 'www.company.com'],
        validFrom: '2025-01-01',
        validTo: '2027-01-01',
        serialNumber: '0x1F:2E:3D:4C:5B',
        signatureAlgorithm: 'SHA256withRSA',
        publicKeyInfo: 'RSA 2048-bit',
        isIssuerInTrustStore: true,
      },
    };

    const html = renderToStaticMarkup(<HttpTlsHandshakeSimulator taskContent={config} />);

    expect(html).toContain('data-testid="view-pki-certificates"');
    expect(html).toContain('X.509 Certification Hierarchy');
    expect(html).toContain('data-testid="cert-root-ca"');
    expect(html).toContain('IN ROOT STORE');
    expect(html).toContain('data-testid="cert-error-code"');
    expect(html).toContain('ERR_CERT_COMMON_NAME_INVALID');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test Suite 6: NetworkingPracticeTaskView Split-Pane Integration
// ─────────────────────────────────────────────────────────────────────────────

describe('Sprint 6 — Test 6: NetworkingPracticeTaskView Integration with net-13 Tasks', () => {
  it('renders net13-p1-http-semantics with HTTP & TLS Lab badge and latency analyzer', () => {
    const task = NET_13_MODULE.concepts[0].tasks[0];
    const concept = NET_13_MODULE.concepts[0];

    const html = renderToStaticMarkup(
      <NetworkingPracticeTaskView
        task={task}
        taskIndex={0}
        totalTasks={3}
        concept={concept}
        conceptIndex={0}
        totalConcepts={3}
        isCompleted={false}
        onTaskSuccess={vi.fn()}
      />,
    );

    expect(html).toContain('data-testid="networking-practice-task-view"');
    expect(html).toContain('HTTP &amp; TLS Lab');
    expect(html).toContain('data-testid="http-tls-handshake-simulator"');
    expect(html).toContain('HTTP/1.1 vs HTTP/2 vs HTTP/3 Latency Analyzer');
  });

  it('renders net13-p2-pki-trust-chain with PKI certificate validator', () => {
    const task = NET_13_MODULE.concepts[1].tasks[0];
    const concept = NET_13_MODULE.concepts[1];

    const html = renderToStaticMarkup(
      <NetworkingPracticeTaskView
        task={task}
        taskIndex={1}
        totalTasks={3}
        concept={concept}
        conceptIndex={1}
        totalConcepts={3}
        isCompleted={false}
        onTaskSuccess={vi.fn()}
      />,
    );

    expect(html).toContain('data-testid="http-tls-handshake-simulator"');
    expect(html).toContain('X.509 Certificate Chain &amp; SAN Validator');
    expect(html).toContain('ERR_CERT_COMMON_NAME_INVALID');
  });

  it('renders net13-p3-tls13-handshake-eval with TLS 1.3 handshake lab', () => {
    const task = NET_13_MODULE.concepts[2].tasks[0];
    const concept = NET_13_MODULE.concepts[2];

    const html = renderToStaticMarkup(
      <NetworkingPracticeTaskView
        task={task}
        taskIndex={2}
        totalTasks={3}
        concept={concept}
        conceptIndex={2}
        totalConcepts={3}
        isCompleted={false}
        onTaskSuccess={vi.fn()}
      />,
    );

    expect(html).toContain('data-testid="http-tls-handshake-simulator"');
    expect(html).toContain('TLS 1.3 1-RTT Handshake &amp; Ephemeral Diffie-Hellman Lab');
  });

  it('renders net13-ch1-tls-certificate-error challenge with unknown issuer diagnostics', () => {
    const task = NET_13_MODULE.challenge!.tasks[0];

    const html = renderToStaticMarkup(
      <NetworkingPracticeTaskView
        task={task}
        taskIndex={0}
        totalTasks={2}
        isChallenge={true}
        isCompleted={false}
        onTaskSuccess={vi.fn()}
      />,
    );

    expect(html).toContain('data-testid="http-tls-handshake-simulator"');
    expect(html).toContain('PKI Certificate Authority Chain Forensic Lab');
    expect(html).toContain('SEC_ERROR_UNKNOWN_ISSUER');
  });

  it('renders net13-ch2-http2-multiplexing-hol challenge with HoL blocking simulator', () => {
    const task = NET_13_MODULE.challenge!.tasks[1];

    const html = renderToStaticMarkup(
      <NetworkingPracticeTaskView
        task={task}
        taskIndex={1}
        totalTasks={2}
        isChallenge={true}
        isCompleted={false}
        onTaskSuccess={vi.fn()}
      />,
    );

    expect(html).toContain('data-testid="http-tls-handshake-simulator"');
    expect(html).toContain('Web Asset Waterfall &amp; HoL Multiplexing Simulator');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test Suite 7: Pipeline Classifier & Submission Evaluation
// ─────────────────────────────────────────────────────────────────────────────

describe('Sprint 6 — Test 7: Submit Pipeline Recognition & Grading', () => {
  it('recognizes any task containing httpTls as a networking task', () => {
    const dummyTask: PracticeTask = {
      id: 'custom-http-task',
      title: 'Web Transport Evaluation',
      description: 'Test description',
      instructions: [],
      type: 'guided',
      primaryTable: '',
      initialSql: '',
      solutionSql: 'NETWORKING_JUDGMENT_TASK',
      solutionExplanation: 'Test explanation',
      successMessage: 'Test success',
      hints: [],
      validation: { judgment: [] },
      httpTls: {
        defaultTab: 'handshake_latency',
      },
    };

    expect(isNetworkingTask(dummyTask)).toBe(true);
  });

  it('evaluates judgment submission for net13-p1 correctly via gradeNetworkingSubmission', () => {
    const task = NET_13_MODULE.concepts[0].tasks[0];

    // Correct answers: [1, 1] (502 Bad Gateway, binary framing & multiplexing)
    const passOutcome = gradeNetworkingSubmission({
      task,
      judgmentAnswers: [1, 1],
    });
    expect(passOutcome.passed).toBe(true);

    // Incorrect answer
    const failOutcome = gradeNetworkingSubmission({
      task,
      judgmentAnswers: [0, 0],
    });
    expect(failOutcome.passed).toBe(false);
  });

  it('evaluates judgment submission for net13-ch1 challenge correctly via submitForTask', () => {
    const task = NET_13_MODULE.challenge!.tasks[0];

    // Correct answer: option 1 (Internal Corporate Root CA missing from trust store)
    const passOutcome = submitForTask({
      task,
      code: '',
      hooks: {
        execute: () => ({ success: true, columns: [], rows: [], rowCount: 0, executionTimeMs: 0 }),
      },
      judgmentAnswers: [1],
      surface: 'challenge',
    });
    expect(passOutcome.passed).toBe(true);
    expect(passOutcome.feedback).toContain('Challenge 1 mastered');
  });
});
