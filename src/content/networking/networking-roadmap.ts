/**
 * Networking roadmap milestones — Networking Track.
 * ─────────────────────────────────────────────────────────────────────────────
 * ADDITIVE ONLY. SQL and Prisma milestones are untouched.
 * Milestone ids are prefixed `net-milestone-*`. Module ids use `net-NN`.
 */

import { MilestoneData } from '../../types/curriculum';

export const NETWORKING_ROADMAP_MILESTONES: MilestoneData[] = [
  {
    id: 'net-milestone-1',
    number: 1,
    title: 'Local Link & Switching',
    subtitle: 'From Physical Cables to Layer 2 Bridges',
    description:
      'Understand how devices physically connect, why shared media collide, and how Layer 2 switches learn MAC addresses and forward traffic.',
    daysRange: 'Modules 1–3',
    moduleIds: ['net-01', 'net-02', 'net-03'],
  },
  {
    id: 'net-milestone-2',
    number: 2,
    title: 'Network Addressing & Resolution',
    subtitle: 'IPv4, IPv6, Subnets & ARP',
    description:
      'Master IPv4 dotted-decimal notation, CIDR subnetting, the binary AND subnet decision, ARP Request/Reply resolution, ARP cache management, and IPv6 fundamentals including zero compression, address scopes, solicited-node multicast, NDP, and SLAAC autoconfiguration.',
    daysRange: 'Modules 4–6',
    moduleIds: ['net-04', 'net-05', 'net-06'],
  },
  {
    id: 'net-milestone-3',
    number: 3,
    title: 'Internetwork Routing & NAT',
    subtitle: 'Default Gateways, Route Tables & Port Address Translation',
    description:
      'Connect disparate networks across router boundaries. Master Default Gateways, hop-by-hop Layer 2 MAC rewrites, routing table lookup via Longest Prefix Match, the IPv4 TTL loop mitigation field, and Network Address Translation (NAT/PAT) state tracking.',
    daysRange: 'Modules 7–8',
    moduleIds: ['net-07', 'net-08'],
  },
];
