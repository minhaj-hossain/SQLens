import { ModuleData } from '../../../types/curriculum';

export const NET_01_MODULE: ModuleData = {
  id: 'net-01',
  slug: 'two-computers-one-cable',
  day: 1,
  title: 'Module 1: Two Computers, One Cable',
  shortTitle: 'Two Computers, One Cable',
  type: 'module',
  track: 'networking',
  milestoneId: 'net-milestone-1',
  description:
    'Understand the physical and data-link reality of direct communication: NICs, physical media, framing, bit transmission, and link-layer addressing.',
  estimatedMinutes: 20,
  curriculumOrder: 1,
  displayLabel: 'Module 1',
  completionLearnings: [
    'Every network device has a physical interface (NIC) with a hardware address (MAC address)',
    'Bits are encoded into physical signals across media (copper, fiber, radio waves)',
    'Data-link framing provides boundaries, addressing, and error detection for raw bitstreams',
    'Direct link communication requires only source and destination MAC addresses on the local medium',
  ],
  concepts: [
    {
      id: 'direct-link-mac',
      order: 1,
      title: 'Direct Links and MAC Addresses',
      shortDescription: 'How two computers exchange framed data over a physical cable.',
      theory: {
        summary:
          'Two computers connected by a cable transmit bits framed with link-layer headers containing hardware (MAC) addresses.',
        explanation: [
          'A Network Interface Card (NIC) connects a computer to a physical transmission medium.',
          'Data cannot be transmitted as an amorphous stream of bits; it must be encapsulated into discrete frames with start and end delimiters.',
          'Each Ethernet frame contains a 48-bit Media Access Control (MAC) address identifying the sender and receiver on the local link.',
        ],
        keyTakeaway: 'Local communication requires physical media and data-link framing with MAC addresses.',
        exampleQuery: '',
        exampleQueryExplanation: '',
      },
      tasks: [],
    },
  ],
};
