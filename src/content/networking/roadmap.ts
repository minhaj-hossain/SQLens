import { RoadmapStage } from '@/types/networking';

export const NETWORKING_ROADMAP_STAGES: RoadmapStage[] = [
  {
    name: 'Foundations',
    days: [
      {
        dayNumber: 1,
        id: 'net-01',
        title: 'The First Link & Hardware Identity',
      },
      {
        dayNumber: 2,
        id: 'net-02',
        title: 'IP Addressing: Networks and Hosts',
      },
      {
        dayNumber: 3,
        id: 'net-03',
        title: 'Subnetting: Splitting a Network',
      },
    ],
  },
  {
    name: 'Routing',
    days: [
      {
        dayNumber: 4,
        id: 'net-04',
        title: 'The Router: Connecting Networks',
      },
      {
        dayNumber: 5,
        id: 'net-05',
        title: 'Static Routes: Reaching Distant Networks',
      },
      {
        dayNumber: 6,
        id: 'net-06',
        title: 'The Default Route: Leaving the Network',
      },
    ],
  },
  {
    name: 'Local Delivery',
    days: [
      {
        dayNumber: 7,
        id: 'net-07',
        title: 'ARP: Finding a Neighbour\'s Hardware Address',
      },
      {
        dayNumber: 8,
        id: 'net-08',
        title: 'How a Switch Learns',
      },
      {
        dayNumber: 9,
        id: 'net-09',
        title: 'Broadcast Domains',
      },
    ],
  },
  {
    name: 'Switching Design',
    days: [
      {
        dayNumber: 10,
        id: 'net-10',
        title: 'VLANs: Separating Networks on One Switch',
      },
      {
        dayNumber: 11,
        id: 'net-11',
        title: 'Trunks: Carrying VLANs Between Switches',
      },
      {
        dayNumber: 12,
        id: 'net-12',
        title: 'Routing Between VLANs',
      },
      {
        dayNumber: 13,
        id: 'net-13',
        title: 'Loops and Spanning Tree',
      },
    ],
  },
  {
    name: 'Path and Transport',
    days: [
      {
        dayNumber: 14,
        id: 'net-14',
        title: 'ICMP and TTL: How Ping Works',
      },
      {
        dayNumber: 15,
        id: 'net-15',
        title: 'Traceroute: Following the Path',
      },
      {
        dayNumber: 16,
        id: 'net-16',
        title: 'Ports: Reaching the Right Program',
      },
      {
        dayNumber: 17,
        id: 'net-17',
        title: 'TCP: Opening and Closing a Connection',
      },
      {
        dayNumber: 18,
        id: 'net-18',
        title: 'TCP: Reliable Delivery',
      },
      {
        dayNumber: 19,
        id: 'net-19',
        title: 'UDP: Fast and Simple',
      },
    ],
  },
  {
    name: 'Dynamic Routing',
    days: [
      {
        dayNumber: 20,
        id: 'net-20',
        title: 'Why Dynamic Routing',
      },
      {
        dayNumber: 21,
        id: 'net-21',
        title: 'RIP: Counting Hops',
      },
      {
        dayNumber: 22,
        id: 'net-22',
        title: 'OSPF: Sharing the Map',
      },
      {
        dayNumber: 23,
        id: 'net-23',
        title: 'Failover and Convergence',
      },
    ],
  },
  {
    name: 'Services',
    days: [
      {
        dayNumber: 24,
        id: 'net-24',
        title: 'DHCP: Automatic Addressing',
      },
      {
        dayNumber: 25,
        id: 'net-25',
        title: 'DHCP in Larger Networks',
      },
      {
        dayNumber: 26,
        id: 'net-26',
        title: 'DNS: Names Instead of Numbers',
      },
      {
        dayNumber: 27,
        id: 'net-27',
        title: 'DNS in Depth: Records and the Hierarchy',
      },
      {
        dayNumber: 28,
        id: 'net-28',
        title: 'NAT: Private to Public',
      },
      {
        dayNumber: 29,
        id: 'net-29',
        title: 'NAT with Ports',
      },
    ],
  },
  {
    name: 'Security',
    days: [
      {
        dayNumber: 30,
        id: 'net-30',
        title: 'Access Lists: Filtering Traffic',
      },
      {
        dayNumber: 31,
        id: 'net-31',
        title: 'Stateful Firewalls',
      },
      {
        dayNumber: 32,
        id: 'net-32',
        title: 'Securing the Switch',
      },
    ],
  },
  {
    name: 'Wrap-up',
    days: [
      {
        dayNumber: 33,
        id: 'net-33',
        title: 'The Layered Model',
      },
      {
        dayNumber: 34,
        id: 'net-34',
        title: 'Troubleshooting Method',
      },
      {
        dayNumber: 35,
        id: 'net-35',
        title: 'Capstone: Build a Network',
      },
    ],
  },
];
