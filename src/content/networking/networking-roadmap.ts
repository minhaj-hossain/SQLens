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
  {
    id: 'net-milestone-4',
    number: 4,
    title: 'Core Network Services',
    subtitle: 'Dynamic IP Allocation & Name Resolution',
    description:
      'Master essential infrastructure protocols: DHCP client bootstrap, the 4-step DORA exchange, lease renewal timers, DHCP relay agents, APIPA fallback, and the global hierarchical Domain Name System (DNS).',
    daysRange: 'Modules 9–10',
    moduleIds: ['net-09', 'net-10'],
  },
  {
    id: 'net-milestone-5',
    number: 5,
    title: 'Transport & Application Protocols',
    subtitle: 'Sockets, TCP Reliability & Modern Web Delivery',
    description:
      'Understand end-to-end application multiplexing: 5-tuple socket bindings, UDP lightweight transport, TCP sequence numbers and cumulative ACKs, sliding window flow control, connection teardown, HTTP evolution, and TLS 1.3 cryptography.',
    daysRange: 'Modules 11–13',
    moduleIds: ['net-11', 'net-12', 'net-13'],
  },
  {
    id: 'net-milestone-6',
    number: 6,
    title: 'Diagnostics & Troubleshooting',
    subtitle: 'Systematic OSI Triage & Command Line Utilities',
    description:
      'Troubleshoot network anomalies with engineering discipline: ICMP Echo and Traceroute hop analysis, essential command-line tools (ipconfig, ping, tracert, nslookup, netstat), and isolating the 5 Classic Office Failures.',
    daysRange: 'Module 14',
    moduleIds: ['net-14'],
  },
  {
    id: 'net-milestone-7',
    number: 7,
    title: 'Enterprise Infrastructure & Security',
    subtitle: 'Loop Prevention, Firewalls, VLANs & Routing',
    description:
      'Scale enterprise networks securely: Spanning Tree Protocol (STP) loop prevention, stateless ACLs vs stateful conntrack firewalls, IEEE 802.1Q VLAN trunking, Wi-Fi 802.11 CSMA/CA, and dynamic routing protocol selection (OSPF vs BGP).',
    daysRange: 'Modules 15–16',
    moduleIds: ['net-15', 'net-16'],
  },
];
