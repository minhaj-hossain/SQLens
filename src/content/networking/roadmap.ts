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
        title: 'IP Addressing Basics',
      },
      {
        dayNumber: 3,
        id: 'net-03',
        title: 'Subnets and Masks',
      },
    ],
  },
  {
    name: 'Switching',
    days: [
      {
        dayNumber: 4,
        id: 'net-04',
        title: 'How a Switch Learns',
      },
      {
        dayNumber: 5,
        id: 'net-05',
        title: 'VLANs',
      },
      {
        dayNumber: 6,
        id: 'net-06',
        title: 'Trunks',
      },
    ],
  },
  {
    name: 'Routing',
    days: [
      {
        dayNumber: 7,
        id: 'net-07',
        title: 'Your First Router',
      },
      {
        dayNumber: 8,
        id: 'net-08',
        title: 'Static Routes',
      },
      {
        dayNumber: 9,
        id: 'net-09',
        title: 'Dynamic Routing',
      },
    ],
  },
  {
    name: 'Services',
    days: [
      {
        dayNumber: 10,
        id: 'net-10',
        title: 'DHCP',
      },
      {
        dayNumber: 11,
        id: 'net-11',
        title: 'DNS',
      },
      {
        dayNumber: 12,
        id: 'net-12',
        title: 'NAT',
      },
    ],
  },
];
