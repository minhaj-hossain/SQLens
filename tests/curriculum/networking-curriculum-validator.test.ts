/**
 * Networking Curriculum Automated Validator Suite
 * ─────────────────────────────────────────────────────────────────────────────
 * Validates RFC conformance, technical accuracy invariants, and instructional
 * parity across all 16 networking track modules.
 *
 * Enforces:
 *  1. RFC Technical Precision:
 *     - RFC 5737 / RFC 3849: Documentation ranges must not be labeled as public
 *       without RFC citation / documentation disclaimer.
 *     - RFC 3021: /31 subnets have 1 host bit (2 addresses), not "0 host bits",
 *       and support point-to-point link router endpoints.
 *     - RFC 1034 §3.6.2: CNAME cannot coexist with any other record for the same name.
 *     - NAT vs Stateful Firewall: NAT translation table drops are decoupled from
 *       stateful packet inspection policies.
 *     - OSPF Metric: Cost (dimensionless integer) derived from bandwidth.
 *     - Wi-Fi 2.4 GHz: Non-overlapping channels 1, 6, 11 qualified by regulatory domain.
 *     - Transport Multiplexing: 5-tuple socket identification vs HTTP/2/3 tab multiplexing.
 *     - Head-of-Line Blocking: HTTP/2 application-layer vs HTTP/3 QUIC transport-layer.
 *  2. Instruction-to-Assessment Parity & Well-Formed Judgment Tasks:
 *     - All judgment exercises have valid kinds, >= 3 unique options, valid bounds,
 *       and robust explanations.
 *     - No orphan instruction steps left unassessed in multi-part reasoning tasks.
 */

import { describe, expect, it } from 'vitest';
import { NETWORKING_MODULES } from '../../src/content/networking/networking-curriculum-index';
import type { JudgmentKind, PracticeTask } from '../../src/types/curriculum';

const VALID_JUDGMENT_KINDS: JudgmentKind[] = [
  'choose-and-defend',
  'predict-failure',
  'diagnose-plan',
  'compare-tradeoff',
];

function getAllNetworkingTasks(): { modId: string; task: PracticeTask }[] {
  const tasks: { modId: string; task: PracticeTask }[] = [];
  for (const mod of NETWORKING_MODULES) {
    for (const concept of mod.concepts ?? []) {
      for (const t of concept.tasks ?? []) {
        tasks.push({ modId: mod.id, task: t as PracticeTask });
      }
    }
    for (const t of mod.challenge?.tasks ?? []) {
      tasks.push({ modId: mod.id, task: t as PracticeTask });
    }
  }
  return tasks;
}

function getAllModuleText(modId: string): string {
  const mod = NETWORKING_MODULES.find((m) => m.id === modId);
  if (!mod) return '';
  return JSON.stringify(mod);
}

describe('Networking Track: RFC & Technical Precision Invariants', () => {
  it('enforces RFC 3021 precision: /31 has 1 host bit and never claims 0 host bits for /31', () => {
    for (const mod of NETWORKING_MODULES) {
      const lines = JSON.stringify(mod, null, 2).split('\n');
      for (const line of lines) {
        if (line.includes('/31')) {
          expect(line).not.toMatch(/\b(0|zero)\s+host\s+bits/i);
        }
      }
    }

    const net04Text = getAllModuleText('net-04');
    expect(net04Text).toContain('/31');
    expect(net04Text).toMatch(/RFC\s*3021/i);
    expect(net04Text).toMatch(/1\s+host\s+bit/i);
  });

  it('enforces RFC 5737 and RFC 3849: documentation ranges are never presented as bare public addresses', () => {
    // 203.0.113.0/24 (TEST-NET-3), 198.51.100.0/24 (TEST-NET-2), 192.0.2.0/24 (TEST-NET-1)
    const net04Text = getAllModuleText('net-04');
    if (net04Text.includes('203.0.113.')) {
      expect(net04Text).toMatch(/RFC\s*5737|TEST-NET-3|documentation/i);
    }
    // Net-04 uses 8.8.8.8 for public Internet routing example
    expect(net04Text).toContain('8.8.8.8');

    // 2001:db8::/32 (RFC 3849)
    const net06Text = getAllModuleText('net-06');
    if (net06Text.includes('2001:db8:')) {
      expect(net06Text).toMatch(/RFC\s*3849|documentation/i);
    }
    // Net-06 uses Google public DNS IPv6 for live global unicast routing example
    expect(net06Text).toContain('2001:4860:4860::8888');
  });

  it('enforces RFC 1034 §3.6.2 universal CNAME rule in Module 10', () => {
    const net10Text = getAllModuleText('net-10');
    expect(net10Text).toMatch(/cannot\s+coexist\s+with\s+any\s+other\s+record/i);
    expect(net10Text).toMatch(/RFC\s*1034/i);
  });

  it('enforces NAT translation decoupling from stateful firewall filtering in Module 8', () => {
    const net08Text = getAllModuleText('net-08');
    expect(net08Text).toMatch(/not\s+a\s+(true|formal|full)?\s*stateful\s+firewall|decouple|translation\s+table/i);
    expect(net08Text).toMatch(/NIST|800-41/i);
  });

  it('enforces OSPF metric precision as path Cost in Module 16', () => {
    const net16Text = getAllModuleText('net-16');
    expect(net16Text).toMatch(/OSPF\s+metric\s+is\s+(path\s+)?Cost/i);
    expect(net16Text).toMatch(/dimensionless/i);
  });

  it('enforces Wi-Fi 2.4 GHz non-overlapping channel regulatory domain qualification in Module 16', () => {
    const net16Text = getAllModuleText('net-16');
    expect(net16Text).toMatch(/1,\s*6,\s*(and\s*)?11/);
    expect(net16Text).toMatch(/North America|FCC|regulatory domain/i);
  });

  it('enforces Layer 2 switching security qualification in Module 3', () => {
    const net03Text = getAllModuleText('net-03');
    // Ensure switches are not claimed to eliminate all eavesdropping without security qualifications
    expect(net03Text).toMatch(/ARP spoofing|CAM (overflow|table)|broadcast/i);
  });

  it('enforces HTTP/2 vs HTTP/3 Head-of-Line blocking precision in Module 13', () => {
    const net13Text = getAllModuleText('net-13');
    expect(net13Text).toMatch(/TCP.*Head-of-Line/i);
    expect(net13Text).toMatch(/QUIC/i);
  });

  it('enforces 5-tuple socket vs browser tab connection multiplexing in Module 11', () => {
    const net11Text = getAllModuleText('net-11');
    expect(net11Text).toMatch(/socket\s+connection/i);
    expect(net11Text).toMatch(/multiplex/i);
  });
});

describe('Networking Track: Instruction-to-Assessment Parity & Well-Formed Tasks', () => {
  const allTasks = getAllNetworkingTasks();

  it('ensures all 16 modules are registered and populated', () => {
    expect(NETWORKING_MODULES).toHaveLength(16);
    for (let day = 1; day <= 16; day++) {
      const mod = NETWORKING_MODULES.find((m) => m.day === day);
      expect(mod, `Day ${day} module must exist`).toBeDefined();
      expect(mod?.concepts.length).toBeGreaterThan(0);
    }
  });

  it('every authored judgment item adheres to the curriculum contract', () => {
    const failures: string[] = [];

    for (const { modId, task } of allTasks) {
      const judgments = task.validation?.judgment ?? [];
      judgments.forEach((j, index) => {
        const tag = `${modId} / ${task.id}[${index}]`;

        if (!VALID_JUDGMENT_KINDS.includes(j.kind)) {
          failures.push(`${tag}: invalid kind "${j.kind}"`);
        }
        if (!j.prompt || j.prompt.trim().length < 10) {
          failures.push(`${tag}: prompt too short (< 10 chars)`);
        }
        if (!Array.isArray(j.options) || j.options.length < 3) {
          failures.push(`${tag}: must have >= 3 options`);
        }
        if (j.options && new Set(j.options).size !== j.options.length) {
          failures.push(`${tag}: duplicate options found`);
        }
        if (
          typeof j.correctIndex !== 'number' ||
          j.correctIndex < 0 ||
          j.correctIndex >= (j.options?.length ?? 0)
        ) {
          failures.push(`${tag}: correctIndex ${j.correctIndex} out of bounds (options length ${j.options?.length})`);
        }
        if (!j.explanation || j.explanation.trim().length < 20) {
          failures.push(`${tag}: explanation too short (< 20 chars)`);
        }
      });
    }

    expect(failures).toEqual([]);
  });

  it('net-04 task 2 (net04-p2-subnet-decision) has exact instruction-to-assessment parity for Destination A and B', () => {
    const task = allTasks.find((t) => t.task.id === 'net04-p2-subnet-decision')?.task;
    expect(task).toBeDefined();
    expect(task?.validation?.judgment).toHaveLength(2);
    // Task instructions mention Destination A and Destination B
    const instructionsStr = task?.instructions?.join('\n') ?? '';
    expect(instructionsStr).toContain('Destination: 10.0.1.200');
    expect(instructionsStr).toContain('Destination: 10.0.2.10');
    // And does NOT contain unassessed Destination C
    expect(instructionsStr).not.toContain('Destination C');
  });

  it('net-06 task 1 (net06-p1-ipv6-notation) has exact instruction-to-assessment parity for compression and syntax', () => {
    const task = allTasks.find((t) => t.task.id === 'net06-p1-ipv6-notation')?.task;
    expect(task).toBeDefined();
    expect(task?.validation?.judgment).toHaveLength(2);
    const instructionsStr = task?.instructions?.join('\n') ?? '';
    expect(instructionsStr).toContain('Task 1');
    expect(instructionsStr).toContain('Task 2');
    expect(instructionsStr).not.toContain('Task B (Expansion');
  });

  it('net-16 challenge tasks have aligned instructions and scenario', () => {
    const mod = NETWORKING_MODULES.find((m) => m.id === 'net-16');
    const challengeTasks = mod?.challenge?.tasks ?? [];
    expect(challengeTasks).toHaveLength(2);

    const trunkTask = challengeTasks[0];
    expect(trunkTask.validation?.judgment).toHaveLength(1);
    expect(trunkTask.instructions?.join('\n')).toContain('vlan 10,20');

    const wifiTask = challengeTasks[1];
    expect(wifiTask.validation?.judgment).toHaveLength(1);
    expect(wifiTask.instructions?.join('\n')).toContain('2.4 GHz');
  });
});
