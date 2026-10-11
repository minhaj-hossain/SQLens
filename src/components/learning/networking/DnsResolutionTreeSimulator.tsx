'use client';

import React, { useState, useMemo } from 'react';
import type { DnsTaskContent, DnsRecordEntry, DnsResolutionHop } from '../../../types/curriculum';
import {
  Globe,
  Server,
  Laptop,
  ArrowRight,
  Database,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  ShieldCheck,
  Zap,
  RotateCcw,
  Layers,
  HelpCircle,
  Info,
  Network,
  RefreshCw,
} from 'lucide-react';

export interface DnsResolutionTreeSimulatorProps {
  taskContent?: DnsTaskContent;
  title?: string;
  description?: string;
}

export function calculateDnsResolutionMetrics(isCached: boolean, totalHops: number = 4) {
  if (isCached) {
    return {
      latencyMs: 1,
      upstreamQueries: 0,
      cacheStatus: 'HIT',
      bandwidthBytes: 120,
    };
  }
  return {
    latencyMs: totalHops * 18, // ~72ms average iterative walk
    upstreamQueries: Math.max(1, totalHops - 1),
    cacheStatus: 'MISS',
    bandwidthBytes: totalHops * 240,
  };
}

export function getDnsRcodeExplanation(rcode: 'NOERROR' | 'NXDOMAIN' | 'SERVFAIL' | 'REFUSED') {
  switch (rcode) {
    case 'NOERROR':
      return {
        code: 0,
        title: 'NOERROR (Success)',
        description: 'The query completed successfully and valid answer records were returned.',
        severity: 'success',
      };
    case 'NXDOMAIN':
      return {
        code: 3,
        title: 'NXDOMAIN (Non-Existent Domain)',
        description: 'The authoritative name server explicitly confirmed that the queried domain name does not exist.',
        severity: 'warning',
      };
    case 'SERVFAIL':
      return {
        code: 2,
        title: 'SERVFAIL (Server Failure)',
        description: 'The recursive resolver failed to obtain an answer because authoritative servers timed out, were unreachable, or DNSSEC validation failed.',
        severity: 'error',
      };
    case 'REFUSED':
      return {
        code: 5,
        title: 'REFUSED (Query Refused)',
        description: 'The name server refused to process the query due to access control or zone transfer restrictions.',
        severity: 'error',
      };
  }
}

export const DnsResolutionTreeSimulator: React.FC<DnsResolutionTreeSimulatorProps> = ({
  taskContent,
  title,
  description,
}) => {
  const queryDomain = taskContent?.queryDomain || 'portal.example.com';
  const queryType = taskContent?.queryType || 'A';
  const initialView = taskContent?.defaultView || 'hierarchy';
  const failureCode = taskContent?.failureCode || 'NOERROR';

  const [activeTab, setActiveTab] = useState<'hierarchy' | 'cache_comparison' | 'records_table' | 'failure_diagnosis'>(
    initialView,
  );
  const [activeHopIndex, setActiveHopIndex] = useState<number>(0);
  const [simulatedCached, setSimulatedCached] = useState<boolean>(taskContent?.isCached ?? false);
  const [ttlRemaining, setTtlRemaining] = useState<number>(taskContent?.cacheTtlRemaining ?? 300);
  const [tcpFallbackActive, setTcpFallbackActive] = useState<boolean>(taskContent?.isTruncated ?? false);

  // Default default hops for hierarchical resolution
  const defaultHops: DnsResolutionHop[] = useMemo(() => {
    if (taskContent?.hops && taskContent.hops.length > 0) {
      return taskContent.hops;
    }

    return [
      {
        tier: 'stub',
        serverName: 'Client Stub Resolver',
        serverIp: '192.168.1.100',
        query: queryDomain,
        queryType: queryType,
        responseType: 'referral',
        protocol: 'UDP 53',
        latencyMs: 1,
      },
      {
        tier: 'root',
        serverName: 'Root Name Server (a.root-servers.net)',
        serverIp: '198.41.0.4',
        query: queryDomain,
        queryType: queryType,
        responseType: 'referral',
        referredServers: ['a.gtld-servers.net (.com TLD)', 'b.gtld-servers.net'],
        protocol: 'UDP 53',
        latencyMs: 14,
      },
      {
        tier: 'tld',
        serverName: '.COM TLD Name Server (a.gtld-servers.net)',
        serverIp: '192.5.6.30',
        query: queryDomain,
        queryType: queryType,
        responseType: 'referral',
        referredServers: ['ns1.example.com', 'ns2.example.com'],
        protocol: 'UDP 53',
        latencyMs: 22,
      },
      {
        tier: 'authoritative',
        serverName: 'Authoritative Name Server (ns1.example.com)',
        serverIp: '203.0.113.53',
        query: queryDomain,
        queryType: queryType,
        responseType: failureCode === 'SERVFAIL' ? 'servfail' : failureCode === 'NXDOMAIN' ? 'nxdomain' : 'answer',
        records: [
          { name: queryDomain, type: 'A', value: '198.51.100.42', ttl: 300 },
          { name: 'example.com', type: 'NS', value: 'ns1.example.com', ttl: 86400 },
          { name: 'example.com', type: 'SOA', value: 'ns1.example.com hostmaster.example.com 2026101201', ttl: 3600 },
        ],
        protocol: tcpFallbackActive ? 'TCP 53' : 'UDP 53',
        isTruncated: tcpFallbackActive,
        latencyMs: 28,
      },
    ];
  }, [taskContent?.hops, queryDomain, queryType, failureCode, tcpFallbackActive]);

  // Default records list
  const recordsList: DnsRecordEntry[] = useMemo(() => {
    if (taskContent?.records && taskContent.records.length > 0) {
      return taskContent.records;
    }
    return [
      { name: queryDomain, type: 'A', value: '198.51.100.42', ttl: 300 },
      { name: queryDomain, type: 'AAAA', value: '2001:db8:85a3::8a2e:370:7334', ttl: 300 },
      { name: `www.${queryDomain.split('.').slice(-2).join('.')}`, type: 'CNAME', value: queryDomain, ttl: 600 },
      { name: queryDomain.split('.').slice(-2).join('.'), type: 'MX', value: 'mail.example.com', ttl: 3600, priority: 10 },
      { name: queryDomain.split('.').slice(-2).join('.'), type: 'TXT', value: 'v=spf1 include:_spf.example.com ~all', ttl: 3600 },
    ];
  }, [taskContent?.records, queryDomain]);

  const metrics = useMemo(
    () => calculateDnsResolutionMetrics(simulatedCached, defaultHops.length),
    [simulatedCached, defaultHops.length],
  );

  const rcodeInfo = useMemo(() => getDnsRcodeExplanation(failureCode), [failureCode]);

  return (
    <div
      className="w-full rounded-2xl border border-border bg-surface-1/90 backdrop-blur-md p-4 sm:p-5 shadow-lg space-y-5 text-text"
      data-testid="dns-resolution-tree-simulator"
    >
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER BAR: Title, Domain Badge & Mode Selector
          ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-soft pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-mono text-sm sm:text-base font-bold text-text">
              {taskContent?.title || title || 'DNS Resolution Tree & Cache Simulator'}
            </h3>
            <span className="text-[11px] font-mono text-text-dim block">
              Query: <code className="text-sky-400 font-bold">{queryDomain}</code> [{queryType}] • RFC 1034 / 1035
            </span>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex flex-wrap items-center gap-1 bg-surface-2/80 p-1 rounded-lg border border-border-soft self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('hierarchy')}
            className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition cursor-pointer ${
              activeTab === 'hierarchy'
                ? 'bg-func text-white font-bold shadow-sm'
                : 'text-text-dim hover:text-text'
            }`}
            data-testid="tab-hierarchy"
          >
            Resolution Tree
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cache_comparison')}
            className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition cursor-pointer ${
              activeTab === 'cache_comparison'
                ? 'bg-func text-white font-bold shadow-sm'
                : 'text-text-dim hover:text-text'
            }`}
            data-testid="tab-cache"
          >
            Cache Hit vs Miss
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('records_table')}
            className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition cursor-pointer ${
              activeTab === 'records_table'
                ? 'bg-func text-white font-bold shadow-sm'
                : 'text-text-dim hover:text-text'
            }`}
            data-testid="tab-records"
          >
            Resource Records
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('failure_diagnosis')}
            className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition cursor-pointer ${
              activeTab === 'failure_diagnosis'
                ? 'bg-func text-white font-bold shadow-sm'
                : 'text-text-dim hover:text-text'
            }`}
            data-testid="tab-failure"
          >
            Diagnostics
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. VIEW 1: RESOLUTION HIERARCHY TREE
          ───────────────────────────────────────────────────────────── */}
      {activeTab === 'hierarchy' && (
        <div className="space-y-4" data-testid="hierarchy-view">
          {/* Stepper Timeline for the 4 Tiers */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-text-dim flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-func" />
                Iterative Walk Tiers:
              </span>
              <span className="text-[11px] text-text-dim">
                Hop {activeHopIndex + 1} of {defaultHops.length}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-center text-xs font-mono">
              {defaultHops.map((hop, idx) => {
                const isActive = activeHopIndex === idx;
                const isPassed = activeHopIndex > idx;
                return (
                  <button
                    key={hop.tier}
                    type="button"
                    onClick={() => setActiveHopIndex(idx)}
                    className={`p-2.5 rounded-xl border transition cursor-pointer flex flex-col items-center justify-between min-h-[58px] ${
                      isActive
                        ? 'bg-func/20 border-func text-func font-bold shadow-sm'
                        : isPassed
                        ? 'bg-surface-2 border-emerald-500/40 text-emerald-400'
                        : 'bg-surface-2/60 border-border text-text-dim hover:text-text'
                    }`}
                    data-testid={`hop-btn-${idx}`}
                  >
                    <span className="text-[11px] uppercase tracking-wider font-bold truncate">
                      {idx + 1}. {hop.tier}
                    </span>
                    <span className="text-[9.5px] opacity-75 truncate">{hop.serverName.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Hop Card Detail */}
          {defaultHops[activeHopIndex] && (
            <div className="p-4 rounded-xl border border-border bg-surface-2/80 space-y-3 font-mono text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-soft pb-2.5">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-sky-400" />
                  <span className="font-bold text-text text-sm">
                    {defaultHops[activeHopIndex].serverName}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-surface-3 text-[10px] text-text-dim">
                    IP: {defaultHops[activeHopIndex].serverIp}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    defaultHops[activeHopIndex].protocol === 'TCP 53'
                      ? 'bg-purple-500/20 text-purple-300'
                      : 'bg-sky-500/20 text-sky-300'
                  }`}>
                    {defaultHops[activeHopIndex].protocol}
                  </span>
                </div>
              </div>

              {/* Hop Telemetry */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px]">
                <div className="p-2.5 rounded-lg bg-surface-3/70 border border-border-soft space-y-1">
                  <span className="text-[10px] text-text-dim block uppercase">Query Sent:</span>
                  <div className="flex justify-between">
                    <span className="text-text-dim">QNAME:</span>
                    <span className="font-bold text-sky-400">{defaultHops[activeHopIndex].query}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-dim">QTYPE:</span>
                    <span className="font-bold text-text">{defaultHops[activeHopIndex].queryType}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-surface-3/70 border border-border-soft space-y-1">
                  <span className="text-[10px] text-text-dim block uppercase">Response Semantics:</span>
                  <div className="flex justify-between">
                    <span className="text-text-dim">Action:</span>
                    <span className="font-bold text-emerald-400 uppercase">
                      {defaultHops[activeHopIndex].responseType}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-dim">Latency:</span>
                    <span>+{defaultHops[activeHopIndex].latencyMs} ms</span>
                  </div>
                </div>
              </div>

              {/* Referral or Final Answers block */}
              {defaultHops[activeHopIndex].referredServers && (
                <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[11px] font-sans text-amber-200 space-y-1">
                  <strong className="font-mono text-amber-300 block text-xs">
                    Referral Delegation (Next Tier Authorities):
                  </strong>
                  <ul className="list-disc list-inside space-y-0.5 font-mono text-[10.5px]">
                    {defaultHops[activeHopIndex].referredServers!.map((srv, sIdx) => (
                      <li key={sIdx}>{srv}</li>
                    ))}
                  </ul>
                </div>
              )}

              {defaultHops[activeHopIndex].records && (
                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-mono space-y-1">
                  <span className="font-bold text-emerald-300 block text-xs">
                    Authoritative Answer Section:
                  </span>
                  <div className="space-y-1">
                    {defaultHops[activeHopIndex].records!.map((rec, rIdx) => (
                      <div key={rIdx} className="flex justify-between bg-surface-3/80 p-1.5 rounded">
                        <span className="font-bold text-text">{rec.name}</span>
                        <span className="text-sky-400 font-bold">{rec.type}</span>
                        <span className="text-emerald-300">{rec.value}</span>
                        <span className="text-text-dim">TTL: {rec.ttl}s</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hop Navigation buttons */}
              <div className="flex justify-between items-center pt-2 border-t border-border-soft font-sans">
                <button
                  type="button"
                  disabled={activeHopIndex <= 0}
                  onClick={() => setActiveHopIndex((p) => Math.max(0, p - 1))}
                  className="px-3 py-1 rounded text-xs font-mono bg-surface-3 hover:bg-surface-4 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                >
                  Previous Tier
                </button>
                <button
                  type="button"
                  disabled={activeHopIndex >= defaultHops.length - 1}
                  onClick={() => setActiveHopIndex((p) => Math.min(defaultHops.length - 1, p + 1))}
                  className="px-3 py-1 rounded text-xs font-mono font-bold bg-func text-white hover:bg-func/90 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                >
                  Next Tier
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. VIEW 2: CACHE HIT VS CACHE MISS COMPARISON
          ───────────────────────────────────────────────────────────── */}
      {activeTab === 'cache_comparison' && (
        <div className="space-y-4" data-testid="cache-view">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-surface-2 border border-border-soft">
            <div className="space-y-0.5">
              <span className="font-mono text-xs font-bold text-text flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-func" />
                Resolver Cache State Simulator
              </span>
              <p className="text-[11px] text-text-dim font-sans">
                Toggle cache state to observe latency and external network trips.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSimulatedCached((c) => !c)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  simulatedCached
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}
                data-testid="toggle-cache-btn"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                {simulatedCached ? 'State: CACHE HIT' : 'State: CACHE MISS (Cold)'}
              </button>
            </div>
          </div>

          {/* Metrics Comparative Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
            <div className="p-3 rounded-xl bg-surface-2 border border-border space-y-1">
              <span className="text-[10.5px] text-text-dim block uppercase">Observed Latency:</span>
              <span className={`text-base font-bold ${simulatedCached ? 'text-emerald-400' : 'text-amber-400'}`} data-testid="metric-latency">
                {metrics.latencyMs} ms
              </span>
              <span className="text-[10px] text-text-dim block font-sans">
                {simulatedCached ? 'Local memory lookup (RAM)' : 'Full recursive iterative walk'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-surface-2 border border-border space-y-1">
              <span className="text-[10.5px] text-text-dim block uppercase">Upstream DNS Packets:</span>
              <span className="text-base font-bold text-text" data-testid="metric-queries">
                {metrics.upstreamQueries} queries
              </span>
              <span className="text-[10px] text-text-dim block font-sans">
                {simulatedCached ? 'Zero external traffic generated' : 'Queries Root, TLD & Auth'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-surface-2 border border-border space-y-1">
              <span className="text-[10.5px] text-text-dim block uppercase">Cache TTL Window:</span>
              <span className="text-base font-bold text-sky-400" data-testid="metric-ttl">
                {ttlRemaining}s
              </span>
              <span className="text-[10px] text-text-dim block font-sans">
                Decrements second-by-second
              </span>
            </div>
          </div>

          {/* Operational Lesson Callout */}
          <div className="p-3 rounded-xl bg-surface-3/70 border border-border-soft space-y-2 text-xs font-sans text-text-dim">
            <strong className="text-text font-mono text-xs block">
              Operational Impact: Planned Migrations &amp; TTL Pre-Reduction
            </strong>
            <p className="leading-relaxed text-[11.5px]">
              Because authoritative servers cannot remotely purge external resolvers&apos; caches, an update to an A record with a <strong>24-hour TTL (86,400s)</strong> takes up to 24 hours to propagate across all users.
              Best practice dictates lowering the TTL to <strong>300 seconds (5 minutes)</strong> at least 48 hours prior to maintenance.
            </p>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. VIEW 3: RESOURCE RECORDS & CNAME RULES
          ───────────────────────────────────────────────────────────── */}
      {activeTab === 'records_table' && (
        <div className="space-y-4" data-testid="records-view">
          <div className="border border-border rounded-xl overflow-hidden font-mono text-xs">
            <div className="grid grid-cols-12 bg-surface-3 p-2.5 font-bold text-text-dim border-b border-border-soft text-[11px]">
              <span className="col-span-4">Owner Name (FQDN)</span>
              <span className="col-span-2">Type</span>
              <span className="col-span-4">RDATA / Value</span>
              <span className="col-span-2 text-right">TTL</span>
            </div>
            <div className="divide-y divide-border-soft bg-surface-2">
              {recordsList.map((rec, i) => (
                <div key={i} className="grid grid-cols-12 p-2.5 items-center hover:bg-surface-3/50 text-[11px]">
                  <span className="col-span-4 font-bold text-text truncate">{rec.name}</span>
                  <span className="col-span-2">
                    <span className="px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-300 font-bold text-[10px]">
                      {rec.type}
                    </span>
                  </span>
                  <span className="col-span-4 text-emerald-400 truncate">{rec.value}</span>
                  <span className="col-span-2 text-right text-text-dim">{rec.ttl}s</span>
                </div>
              ))}
            </div>
          </div>

          {/* RFC 1034 CNAME Constraint Highlight */}
          <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-xs font-sans text-indigo-200 space-y-1.5" data-testid="cname-apex-rule-box">
            <div className="flex items-center gap-2 font-mono font-bold text-indigo-300">
              <Info className="w-4 h-4 shrink-0" />
              <span>Universal RFC 1034 §3.6.2 CNAME Rule: No Coexistence</span>
            </div>
            <p className="text-[11.5px] leading-relaxed">
              If a CNAME record exists for a name, <strong>no other data may exist for that same name</strong>.
              Because a domain apex (e.g. <code>example.com</code>) must always contain <strong>SOA</strong> and <strong>NS</strong> records, you <em>cannot</em> place a CNAME at the apex.
              Furthermore, a CNAME must always point to another canonical hostname, never directly to an IP address.
            </p>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. VIEW 4: DIAGNOSTICS & TRUNCATION FALLBACK
          ───────────────────────────────────────────────────────────── */}
      {activeTab === 'failure_diagnosis' && (
        <div className="space-y-4" data-testid="diagnostics-view">
          {/* Response Code Status Card */}
          <div className={`p-4 rounded-xl border space-y-2 ${
            rcodeInfo.severity === 'error'
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
              : rcodeInfo.severity === 'warning'
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
          }`}>
            <div className="flex items-center justify-between font-mono">
              <span className="font-bold text-sm flex items-center gap-2">
                {rcodeInfo.severity === 'error' ? <ShieldAlert className="w-4 h-4 text-rose-400" /> : <ShieldCheck className="w-4 h-4 text-emerald-400" />}
                {rcodeInfo.title}
              </span>
              <span className="text-xs opacity-75">RCODE = {rcodeInfo.code}</span>
            </div>
            <p className="text-xs font-sans leading-relaxed">{rcodeInfo.description}</p>
          </div>

          {/* TCP 53 Truncation Fallback Toggle */}
          <div className="p-3.5 rounded-xl bg-surface-2 border border-border-soft space-y-2.5 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-text flex items-center gap-1.5">
                <Network className="w-4 h-4 text-func" />
                UDP 53 vs TCP 53 Truncation (TC=1)
              </span>
              <button
                type="button"
                onClick={() => setTcpFallbackActive((v) => !v)}
                className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition cursor-pointer ${
                  tcpFallbackActive
                    ? 'bg-purple-500 text-white'
                    : 'bg-surface-3 text-text-dim hover:text-text'
                }`}
                data-testid="toggle-tcp-btn"
              >
                {tcpFallbackActive ? 'TC=1 (TCP 53 Active)' : 'UDP 53 (Normal)'}
              </button>
            </div>

            <div className="p-2.5 rounded bg-surface-3 text-[11px] font-sans text-text-dim space-y-1">
              <p>
                When a DNS response exceeds <strong>512 bytes</strong> (or the EDNS0 buffer size), the server sets the <code>TC (Truncated)</code> bit to <code>1</code>.
              </p>
              <p className="text-text font-mono text-[10.5px]">
                {tcpFallbackActive
                  ? 'Client established 3-way TCP handshake on port 53 and retrieved the complete, un-truncated response.'
                  : 'Operating normally over lightweight UDP port 53 single datagram transactions.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
