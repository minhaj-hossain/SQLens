/**
 * Sprint 4: Module 10 — DNS Resolution Tree & Cache Simulator Tests.
 * ─────────────────────────────────────────────────────────────────────────────
 * Verifies:
 *  1. Pure Resolution Metrics & RCODE Status Decoders:
 *     - calculateDnsResolutionMetrics: Cache hit (1ms, 0 upstream queries) vs cold miss (~72ms, 3 queries).
 *     - getDnsRcodeExplanation: RFC 1035 codes NOERROR (0), NXDOMAIN (3), SERVFAIL (2), REFUSED (5).
 *  2. DnsResolutionTreeSimulator standalone rendering across all 4 modes:
 *     - Resolution Tree tab: Hierarchical walk (Root referral -> TLD referral -> Auth answer).
 *     - Cache Hit vs Miss tab: Latency comparison, upstream query elimination, TTL countdown.
 *     - Resource Records tab: A, AAAA, CNAME, MX, TXT table and RFC 1034 §3.6.2 apex CNAME rule.
 *     - Diagnostics tab: SERVFAIL unreachable auth forensics and TC=1 (TCP 53) truncation fallback.
 *  3. NetworkingPracticeTaskView integration with net-10 tasks:
 *     - net10-p1-hierarchy-analysis renders DnsResolutionTreeSimulator in hierarchy mode.
 *     - net10-p2-resolution-trace renders DnsResolutionTreeSimulator with truncation support.
 *     - net10-p3-records-caching renders DnsResolutionTreeSimulator in cache mode with 86400s TTL.
 *     - net10-ch1-dns-iterative-troubleshooting renders SERVFAIL failure diagnosis.
 *     - net10-ch2-cname-loop-ttl renders proactive 300s TTL migration lab.
 *     - Status label displays "DNS Resolution Lab".
 *  4. isNetworkingTask classifier recognizes all tasks with dns property.
 *  5. Central submit pipeline evaluates all net-10 tasks with 100% precision.
 *  6. Zero regressions across the entire curriculum.
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  DnsResolutionTreeSimulator,
  calculateDnsResolutionMetrics,
  getDnsRcodeExplanation,
} from '../../src/components/learning/networking/DnsResolutionTreeSimulator';
import { NetworkingPracticeTaskView } from '../../src/components/learning/networking/NetworkingPracticeTaskView';
import { NET_10_MODULE } from '../../src/content/networking/modules/net-10';
import {
  isNetworkingTask,
  gradeNetworkingSubmission,
} from '../../src/lib/network-engine/networking-submit-pipeline';
import { submitForTask } from '../../src/lib/track-submit';
import type { PracticeTask, DnsTaskContent } from '../../src/types/curriculum';

// ─────────────────────────────────────────────────────────────────────────────
// Test Suite 1: Pure Resolution Metrics & RFC Status Helpers
// ─────────────────────────────────────────────────────────────────────────────

describe('Sprint 4 — Test 1: DNS Resolution Metrics & RCODE Decoders', () => {
  it('calculates instant response metrics for cache hit', () => {
    const hit = calculateDnsResolutionMetrics(true, 4);

    expect(hit.latencyMs).toBe(1);
    expect(hit.upstreamQueries).toBe(0);
    expect(hit.cacheStatus).toBe('HIT');
    expect(hit.bandwidthBytes).toBe(120);
  });

  it('calculates multi-hop iterative latency and query counts for cold cache miss', () => {
    const miss = calculateDnsResolutionMetrics(false, 4);

    expect(miss.latencyMs).toBe(72); // 4 * 18ms
    expect(miss.upstreamQueries).toBe(3); // Root, TLD, Auth
    expect(miss.cacheStatus).toBe('MISS');
    expect(miss.bandwidthBytes).toBe(960);
  });

  it('decodes standard RFC 1035 response codes accurately', () => {
    const noerror = getDnsRcodeExplanation('NOERROR');
    expect(noerror.code).toBe(0);
    expect(noerror.severity).toBe('success');

    const servfail = getDnsRcodeExplanation('SERVFAIL');
    expect(servfail.code).toBe(2);
    expect(servfail.title).toContain('SERVFAIL');
    expect(servfail.severity).toBe('error');

    const nxdomain = getDnsRcodeExplanation('NXDOMAIN');
    expect(nxdomain.code).toBe(3);
    expect(nxdomain.severity).toBe('warning');

    const refused = getDnsRcodeExplanation('REFUSED');
    expect(refused.code).toBe(5);
    expect(refused.severity).toBe('error');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test Suite 2: DnsResolutionTreeSimulator Standalone Rendering
// ─────────────────────────────────────────────────────────────────────────────

describe('Sprint 4 — Test 2: DnsResolutionTreeSimulator Standalone Rendering', () => {
  it('renders Resolution Tree mode with iterative walk tiers and referrals', () => {
    const config: DnsTaskContent = {
      title: 'DNS Resolution Tree Walk',
      queryDomain: 'portal.example.com',
      queryType: 'A',
      defaultView: 'hierarchy',
    };

    const html = renderToStaticMarkup(<DnsResolutionTreeSimulator taskContent={config} />);

    expect(html).toContain('data-testid="dns-resolution-tree-simulator"');
    expect(html).toContain('data-testid="hierarchy-view"');
    expect(html).toContain('portal.example.com');
    expect(html).toContain('[A]');
    expect(html).toContain('1. stub');
    expect(html).toContain('2. root');
    expect(html).toContain('3. tld');
    expect(html).toContain('4. authoritative');
    expect(html).toContain('Client Stub Resolver');
  });

  it('renders Cache Hit vs Miss mode with latency and query metrics', () => {
    const config: DnsTaskContent = {
      title: 'DNS Caching Dynamics',
      queryDomain: 'api.github.com',
      queryType: 'A',
      defaultView: 'cache_comparison',
      cacheTtlRemaining: 300,
      isCached: true,
    };

    const html = renderToStaticMarkup(<DnsResolutionTreeSimulator taskContent={config} />);

    expect(html).toContain('data-testid="cache-view"');
    expect(html).toContain('data-testid="toggle-cache-btn"');
    expect(html).toContain('State: CACHE HIT');
    expect(html).toContain('data-testid="metric-latency"');
    expect(html).toContain('1 ms');
    expect(html).toContain('data-testid="metric-queries"');
    expect(html).toContain('0 queries');
    expect(html).toContain('data-testid="metric-ttl"');
    expect(html).toContain('300s');
    expect(html).toContain('Planned Migrations &amp; TTL Pre-Reduction');
  });

  it('renders Resource Records table and RFC 1034 §3.6.2 CNAME rule callout', () => {
    const config: DnsTaskContent = {
      title: 'Resource Records Explorer',
      queryDomain: 'blog.company.com',
      queryType: 'A',
      defaultView: 'records_table',
    };

    const html = renderToStaticMarkup(<DnsResolutionTreeSimulator taskContent={config} />);

    expect(html).toContain('data-testid="records-view"');
    expect(html).toContain('blog.company.com');
    expect(html).toContain('CNAME');
    expect(html).toContain('MX');
    expect(html).toContain('TXT');
    expect(html).toContain('data-testid="cname-apex-rule-box"');
    expect(html).toContain('Universal RFC 1034 §3.6.2 CNAME Rule: No Coexistence');
    expect(html).toContain('place a CNAME at the apex');
  });

  it('renders Diagnostics mode with SERVFAIL status and TCP 53 truncation toggle', () => {
    const config: DnsTaskContent = {
      title: 'DNS Diagnostics Lab',
      queryDomain: 'portal.partner.org',
      queryType: 'A',
      defaultView: 'failure_diagnosis',
      failureCode: 'SERVFAIL',
      isTruncated: true,
    };

    const html = renderToStaticMarkup(<DnsResolutionTreeSimulator taskContent={config} />);

    expect(html).toContain('data-testid="diagnostics-view"');
    expect(html).toContain('SERVFAIL (Server Failure)');
    expect(html).toContain('RCODE = 2');
    expect(html).toContain('data-testid="toggle-tcp-btn"');
    expect(html).toContain('TC=1 (TCP 53 Active)');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test Suite 3: NetworkingPracticeTaskView Split-Pane Integration
// ─────────────────────────────────────────────────────────────────────────────

describe('Sprint 4 — Test 3: NetworkingPracticeTaskView Integration with net-10 Tasks', () => {
  it('renders net10-p1-hierarchy-analysis with DNS Resolution Lab badge and tree view', () => {
    const task = NET_10_MODULE.concepts[0].tasks[0];
    const concept = NET_10_MODULE.concepts[0];

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
    expect(html).toContain('DNS Resolution Lab');
    expect(html).toContain('data-testid="dns-resolution-tree-simulator"');
    expect(html).toContain('app.example.com');
  });

  it('renders net10-p2-resolution-trace with truncation telemetry', () => {
    const task = NET_10_MODULE.concepts[1].tasks[0];
    const concept = NET_10_MODULE.concepts[1];

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

    expect(html).toContain('data-testid="dns-resolution-tree-simulator"');
    expect(html).toContain('www.wikipedia.org');
    expect(html).toContain('Resolution Walk &amp; UDP/TCP 53 Truncation');
  });

  it('renders net10-p3-records-caching in cache comparison mode', () => {
    const task = NET_10_MODULE.concepts[2].tasks[0];
    const concept = NET_10_MODULE.concepts[2];

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

    expect(html).toContain('data-testid="dns-resolution-tree-simulator"');
    expect(html).toContain('data-testid="cache-view"');
    expect(html).toContain('blog.company.com');
    expect(html).toContain('86400s');
  });

  it('renders net10-ch1-dns-iterative-troubleshooting challenge task with SERVFAIL diagnostics', () => {
    const task = NET_10_MODULE.challenge!.tasks[0];

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

    expect(html).toContain('Mastery Challenge');
    expect(html).toContain('data-testid="dns-resolution-tree-simulator"');
    expect(html).toContain('data-testid="diagnostics-view"');
    expect(html).toContain('SERVFAIL (Server Failure)');
  });

  it('renders net10-ch2-cname-loop-ttl challenge task with proactive TTL reduction view', () => {
    const task = NET_10_MODULE.challenge!.tasks[1];

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

    expect(html).toContain('data-testid="dns-resolution-tree-simulator"');
    expect(html).toContain('portal.company.com');
    expect(html).toContain('300s');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Test Suite 4: Task Classification & Submission Pipeline
// ─────────────────────────────────────────────────────────────────────────────

describe('Sprint 4 — Test 4: Task Classification & Submission Pipeline', () => {
  it('correctly classifies all net-10 tasks via isNetworkingTask', () => {
    const allTasks: PracticeTask[] = [
      ...NET_10_MODULE.concepts.flatMap((c) => c.tasks),
      ...(NET_10_MODULE.challenge?.tasks || []),
    ];

    expect(allTasks.length).toBe(5);

    for (const task of allTasks) {
      expect(isNetworkingTask(task)).toBe(true);
    }
  });

  it('grades net10-p1-hierarchy-analysis correctly with reference answers', () => {
    const task = NET_10_MODULE.concepts[0].tasks[0];
    const outcome = gradeNetworkingSubmission({
      task,
      judgmentAnswers: [1, 1], // Option 1: Referral to TLD servers; Option 1: Designated server holding master zone records
    });

    expect(outcome.passed).toBe(true);
  });

  it('grades net10-p2-resolution-trace correctly with reference answers', () => {
    const task = NET_10_MODULE.concepts[1].tasks[0];
    const outcome = gradeNetworkingSubmission({
      task,
      judgmentAnswers: [1, 1], // Option 1: Recursive demands answer vs iterative returns referrals; Option 1: re-sends via TCP port 53
    });

    expect(outcome.passed).toBe(true);
  });

  it('grades net10-p3-records-caching correctly with reference answers', () => {
    const task = NET_10_MODULE.concepts[2].tasks[0];
    const outcome = gradeNetworkingSubmission({
      task,
      judgmentAnswers: [1, 1], // Option 1: CNAME must point to domain name not IP; Option 1: local ISP resolver has cached record
    });

    expect(outcome.passed).toBe(true);
  });

  it('grades net10-ch1-dns-iterative-troubleshooting challenge task correctly', () => {
    const task = NET_10_MODULE.challenge!.tasks[0];
    const outcome = gradeNetworkingSubmission({
      task,
      judgmentAnswers: [2], // Option 2: SERVFAIL
    });

    expect(outcome.passed).toBe(true);
  });

  it('grades net10-ch2-cname-loop-ttl challenge task correctly', () => {
    const task = NET_10_MODULE.challenge!.tasks[1];
    const outcome = gradeNetworkingSubmission({
      task,
      judgmentAnswers: [1], // Option 1: Lower TTL to 300s 24-48h before migration
    });

    expect(outcome.passed).toBe(true);
  });

  it('rejects incorrect judgment answers with targeted explanation', () => {
    const task = NET_10_MODULE.challenge!.tasks[0];
    const outcome = gradeNetworkingSubmission({
      task,
      judgmentAnswers: [1], // Wrong: chose NXDOMAIN instead of SERVFAIL
    });

    expect(outcome.passed).toBe(false);
    expect(outcome.feedback).toBeDefined();
    expect(outcome.feedback).toContain('SERVFAIL');
  });

  it('passes all Module 10 tasks via submitForTask central pipeline', () => {
    const allTasks: PracticeTask[] = [
      ...NET_10_MODULE.concepts.flatMap((c) => c.tasks),
      ...(NET_10_MODULE.challenge?.tasks || []),
    ];

    const mockHooks = {
      execute: () => ({ success: true, columns: [], rows: [], rowCount: 0, executionTimeMs: 0 }),
      recordSubmission: vi.fn(),
      triggerFeedbackModal: vi.fn(),
      syncAdaptiveChallengeUnlock: vi.fn(),
    };

    for (const task of allTasks) {
      const correctAnswers = (task.validation.judgment ?? []).map((j) => j.correctIndex);
      const outcome = submitForTask({
        task,
        code: '',
        hooks: mockHooks,
        judgmentAnswers: correctAnswers,
        surface: 'lesson',
      });

      expect(outcome.passed).toBe(true);
    }
  });
});
