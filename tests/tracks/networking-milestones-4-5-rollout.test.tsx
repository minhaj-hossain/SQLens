/**
 * Phase 4 Verification Suite: Milestones 4 & 5 Rollout
 * Modules 09–13: DHCP, DNS, Ports & Sockets, TCP Reliability, TLS 1.3 & HTTPS
 * ─────────────────────────────────────────────────────────────────────────────
 * Validates:
 * 1. 3-Beat physical causality across all 15 micro-concepts in Modules 09–13.
 * 2. MCQ coverage (>= 2 per concept) with realistic options and valid indices.
 * 3. Workplace Diagnostic Terminals for Tickets #111, #112, #113, #114, #115.
 * 4. Dual-OS command availability (Windows PowerShell vs Linux / OpenSSL / POSIX).
 * 5. Static UI rendering with NetworkingPracticeTaskView.
 * 6. Judgment grading preservation across all milestone tasks.
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

import { NET_09_MODULE } from '../../src/content/networking/modules/net-09';
import { NET_10_MODULE } from '../../src/content/networking/modules/net-10';
import { NET_11_MODULE } from '../../src/content/networking/modules/net-11';
import { NET_12_MODULE } from '../../src/content/networking/modules/net-12';
import { NET_13_MODULE } from '../../src/content/networking/modules/net-13';

import { NetworkingPracticeTaskView } from '../../src/components/learning/networking/NetworkingPracticeTaskView';
import { gradeNetworkingSubmission } from '../../src/lib/network-engine/networking-submit-pipeline';

const MODULES_PHASE_4 = [
  { module: NET_09_MODULE, expectedConcepts: 3, ticket: 'Ticket #111' },
  { module: NET_10_MODULE, expectedConcepts: 3, ticket: 'Ticket #112' },
  { module: NET_11_MODULE, expectedConcepts: 3, ticket: 'Ticket #113' },
  { module: NET_12_MODULE, expectedConcepts: 3, ticket: 'Ticket #114' },
  { module: NET_13_MODULE, expectedConcepts: 3, ticket: 'Ticket #115' },
];

describe('Phase 4 (Milestones 4 & 5 Rollout) — Modules 09–13 Quality Gate', () => {
  it('enforces unbroken 3-beat physical causality across all 15 concepts in Modules 09–13', () => {
    let totalConceptsVerified = 0;

    MODULES_PHASE_4.forEach(({ module }) => {
      expect(module.concepts.length).toBeGreaterThanOrEqual(3);

      module.concepts.forEach((concept) => {
        totalConceptsVerified++;
        const text = concept.theory.explanation.join('\n');

        expect(text).toContain('Beat 1');
        expect(text).toContain('Beat 2');
        expect(text).toContain('Beat 3');

        // Check for physical or diagnostic depth
        expect(concept.theory.summary.length).toBeGreaterThan(40);
        expect(concept.theory.keyTakeaway.length).toBeGreaterThan(20);
      });
    });

    expect(totalConceptsVerified).toBe(15);
  });

  it('guarantees >= 2 MCQs per concept with valid schemas and explanations across all 15 concepts', () => {
    let totalMcqsVerified = 0;

    MODULES_PHASE_4.forEach(({ module }) => {
      module.concepts.forEach((concept) => {
        const mcqs = concept.theory.mcqs;
        expect(mcqs).toBeDefined();
        expect(mcqs!.length).toBeGreaterThanOrEqual(2);

        mcqs!.forEach((mcq) => {
          totalMcqsVerified++;
          expect(mcq.id).toBeTruthy();
          expect(mcq.question.length).toBeGreaterThan(15);
          expect(mcq.options.length).toBe(4);
          expect(mcq.correctIndex).toBeGreaterThanOrEqual(0);
          expect(mcq.correctIndex).toBeLessThan(4);
          expect(mcq.explanation.length).toBeGreaterThan(20);
        });
      });
    });

    expect(totalMcqsVerified).toBeGreaterThanOrEqual(30);
  });

  it('validates Ticket #111 workplace diagnostic terminal in Module 09 (DHCP)', () => {
    const task = NET_09_MODULE.concepts[2].tasks[0];
    expect(task.id).toBe('net09-p3-relay-apipa-diagnosis');
    expect(task.terminal).toBeDefined();

    const terminal = task.terminal!;
    expect(terminal.initialOutput).toContain('WORKPLACE TICKET #111');
    expect(terminal.commands['ipconfig /all']).toContain('DHCP Enabled');
    expect(terminal.commands['ipconfig /release']).toContain('released');
    expect(terminal.commands['ipconfig /renew']).toContain('192.168.1.105');
    expect(terminal.commands['ip addr show eth0']).toContain('169.254.44.120/16');
    expect(terminal.commands['dhclient -v eth0']).toContain('DHCPACK of 192.168.1.105');
  });

  it('validates Ticket #112 workplace diagnostic terminal in Module 10 (DNS)', () => {
    const task = NET_10_MODULE.concepts[2].tasks[0];
    expect(task.id).toBe('net10-p3-records-caching');
    expect(task.terminal).toBeDefined();

    const terminal = task.terminal!;
    expect(terminal.initialOutput).toContain('WORKPLACE TICKET #112');
    expect(terminal.commands['ipconfig /displaydns']).toContain('Record Name');
    expect(terminal.commands['ipconfig /flushdns']).toContain('Successfully flushed');
    expect(terminal.commands['nslookup blog.company.com 8.8.8.8']).toContain('198.51.100.45');
    expect(terminal.commands['resolvectl statistics']).toContain('Cache');
    expect(terminal.commands['resolvectl flush-caches']).toContain('Flushed all local DNS caches');
    expect(terminal.commands['dig +noall +answer blog.company.com @8.8.8.8']).toContain('198.51.100.45');
  });

  it('validates Ticket #113 workplace diagnostic terminal in Module 11 (Ports & Sockets)', () => {
    const task = NET_11_MODULE.concepts[0].tasks[0];
    expect(task.id).toBe('net11-p1-5tuple-multiplexing');
    expect(task.terminal).toBeDefined();

    const terminal = task.terminal!;
    expect(terminal.initialOutput).toContain('WORKPLACE TICKET #113');
    expect(terminal.commands['netstat -ano -p tcp']).toContain('ESTABLISHED');
    expect(terminal.commands['Get-NetTCPConnection']).toContain('192.168.1.100');
    expect(terminal.commands['ss -tulpn']).toContain('0.0.0.0:22');
    expect(terminal.commands['ss -t state established']).toContain('140.82.121.4:https');
  });

  it('validates Ticket #114 workplace diagnostic terminal in Module 12 (TCP Reliability)', () => {
    const task = NET_12_MODULE.concepts[2].tasks[0];
    expect(task.id).toBe('net12-p3-teardown-timewait');
    expect(task.terminal).toBeDefined();

    const terminal = task.terminal!;
    expect(terminal.initialOutput).toContain('WORKPLACE TICKET #114');
    expect(terminal.commands['netstat -s -p tcp']).toContain('Segments Retransmitted');
    expect(terminal.commands['Get-NetTCPConnection -State TimeWait']).toContain('TimeWait');
    expect(terminal.commands['ss -s']).toContain('timewait');
    expect(terminal.commands['ss -tan state time-wait']).toContain('52110');
  });

  it('validates Ticket #115 workplace diagnostic terminal in Module 13 (TLS 1.3 & HTTPS)', () => {
    const task = NET_13_MODULE.concepts[2].tasks[0];
    expect(task.id).toBe('net13-p3-tls13-handshake-eval');
    expect(task.terminal).toBeDefined();

    const terminal = task.terminal!;
    expect(terminal.initialOutput).toContain('WORKPLACE TICKET #115');
    expect(terminal.commands['curl.exe -Iv https://example.com']).toContain('TLSv1.3');
    expect(terminal.commands['curl.exe -Iv https://example.com']).toContain('TLS_AES_256_GCM_SHA384');
    expect(terminal.commands['curl -Iv https://example.com']).toContain('subjectAltName: host "example.com"');
    expect(terminal.commands['openssl s_client -connect example.com:443 -tls1_3']).toContain('Server Temp Key: X25519');
    expect(terminal.commands['openssl s_client -connect example.com:443 -tls1_3']).toContain('Verification: OK');
  });

  it('renders dual-diagnostic and specialized simulators cleanly in NetworkingPracticeTaskView', () => {
    // 1. Module 09 task with terminal
    const net09Task = NET_09_MODULE.concepts[2].tasks[0];
    const html09 = renderToStaticMarkup(
      <NetworkingPracticeTaskView
        task={net09Task}
        taskIndex={2}
        totalTasks={3}
        concept={NET_09_MODULE.concepts[2]}
        conceptIndex={2}
        totalConcepts={3}
        isCompleted={false}
        onTaskSuccess={vi.fn()}
      />,
    );
    expect(html09).toContain('data-testid="virtual-terminal-simulator"');
    expect(html09).toContain('WORKPLACE TICKET #111');

    // 2. Module 10 task with terminal
    const net10Task = NET_10_MODULE.concepts[2].tasks[0];
    const html10 = renderToStaticMarkup(
      <NetworkingPracticeTaskView
        task={net10Task}
        taskIndex={2}
        totalTasks={3}
        concept={NET_10_MODULE.concepts[2]}
        conceptIndex={2}
        totalConcepts={3}
        isCompleted={false}
        onTaskSuccess={vi.fn()}
      />,
    );
    expect(html10).toContain('data-testid="virtual-terminal-simulator"');
    expect(html10).toContain('WORKPLACE TICKET #112');

    // 3. Module 13 task with both HttpTlsHandshakeSimulator AND VirtualTerminalSimulator
    const net13Task = NET_13_MODULE.concepts[2].tasks[0];
    const html13 = renderToStaticMarkup(
      <NetworkingPracticeTaskView
        task={net13Task}
        taskIndex={2}
        totalTasks={3}
        concept={NET_13_MODULE.concepts[2]}
        conceptIndex={2}
        totalConcepts={3}
        isCompleted={false}
        onTaskSuccess={vi.fn()}
      />,
    );
    expect(html13).toContain('data-testid="http-tls-handshake-simulator"');
    expect(html13).toContain('TLS 1.3 1-RTT Handshake &amp; Ephemeral Diffie-Hellman Lab');
    expect(html13).toContain('data-testid="virtual-terminal-simulator"');
    expect(html13).toContain('WORKPLACE TICKET #115');
  });

  it('correctly grades judgment questions for all Phase 4 modules without regressions', () => {
    // Net-09 task 1
    const res09 = gradeNetworkingSubmission({
      task: NET_09_MODULE.concepts[0].tasks[0],
      judgmentAnswers: [1, 1],
    });
    expect(res09.passed).toBe(true);

    // Net-10 task 2
    const res10 = gradeNetworkingSubmission({
      task: NET_10_MODULE.concepts[1].tasks[0],
      judgmentAnswers: [1, 1],
    });
    expect(res10.passed).toBe(true);

    // Net-11 task 3
    const res11 = gradeNetworkingSubmission({
      task: NET_11_MODULE.concepts[2].tasks[0],
      judgmentAnswers: [0, 1],
    });
    expect(res11.passed).toBe(true);

    // Net-12 task 1
    const res12 = gradeNetworkingSubmission({
      task: NET_12_MODULE.concepts[0].tasks[0],
      judgmentAnswers: [1, 1],
    });
    expect(res12.passed).toBe(true);

    // Net-13 task 3
    const res13 = gradeNetworkingSubmission({
      task: NET_13_MODULE.concepts[2].tasks[0],
      judgmentAnswers: [1, 1],
    });
    expect(res13.passed).toBe(true);
  });
});
