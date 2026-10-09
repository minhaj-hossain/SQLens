import { ModuleData } from '../../../types/curriculum';

export const NET_03_MODULE: ModuleData = {
  id: 'net-03',
  slug: 'mac-learning-and-forwarding',
  day: 3,
  title: 'Module 3: The Bridge / Switch: MAC Learning & Forwarding',
  shortTitle: 'MAC Learning & Forwarding',
  type: 'module',
  track: 'networking',
  milestoneId: 'net-milestone-1',
  description:
    'Discover how a Layer 2 switch isolates collision domains by inspecting source MAC addresses, building a CAM table, and selectively forwarding frames.',
  estimatedMinutes: 30,
  curriculumOrder: 3,
  displayLabel: 'Module 3',
  completionLearnings: [
    'Switches operate at Layer 2, inspecting Ethernet frame headers rather than raw physical bits',
    'Source MAC addresses are dynamically recorded into the MAC address table (CAM table)',
    'Frames with unknown unicast or broadcast destinations are flooded out all ports except the arrival port',
    'Frames with known unicast destinations are forwarded specifically to the recorded port, eliminating collisions',
  ],
  concepts: [
    {
      id: 'mac-table-and-forwarding',
      order: 1,
      title: 'Source Learning and Unicast Forwarding',
      shortDescription: 'How the switch learns topology dynamically and forwards frames selectively.',
      theory: {
        summary:
          'A switch builds its MAC table by inspecting the source MAC address of incoming frames, and forwards frames based on destination MAC lookups.',
        explanation: [
          'When a frame arrives at an ingress port, the switch records the source MAC address and ingress port in its MAC table.',
          'The switch then checks its MAC table for the destination MAC address.',
          'If the destination MAC is in the table on a different port, the frame is forwarded only to that port (Known Unicast Forwarding).',
          'If the destination MAC is unknown or broadcast (FF:FF:FF:FF:FF:FF), the frame is flooded to all ports except the arrival port.',
        ],
        keyTakeaway: 'Switches learn on source MAC and forward or flood on destination MAC.',
        exampleQuery: '',
        exampleQueryExplanation: '',
      },
      tasks: [],
    },
  ],
};
