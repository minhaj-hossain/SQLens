import { ModuleData } from '../../../types/curriculum';

export const NET_02_MODULE: ModuleData = {
  id: 'net-02',
  slug: 'shared-medium-and-collisions',
  day: 2,
  title: 'Module 2: The Problem of Shared Media',
  shortTitle: 'Shared Media & Collisions',
  type: 'module',
  track: 'networking',
  milestoneId: 'net-milestone-1',
  description:
    'Explore what happens when three or more computers share a physical medium: hubs, repeating, collision domains, and the breakdown of bus topologies.',
  estimatedMinutes: 25,
  curriculumOrder: 2,
  displayLabel: 'Module 2',
  completionLearnings: [
    'Hubs operate purely at Layer 1, blindly repeating electrical signals to all other ports',
    'Simultaneous transmissions on a shared medium collide, destroying frames and wasting bandwidth',
    'A collision domain is the segment where simultaneous transmissions interfere with each other',
    'Shared bus and hub topologies scale poorly as node count increases due to contention',
  ],
  concepts: [
    {
      id: 'shared-medium-collisions',
      order: 1,
      title: 'Hubs and Collision Domains',
      shortDescription: 'Why multi-node shared media need intelligent isolation.',
      theory: {
        summary:
          'When multiple devices share a physical medium or hub, simultaneous transmissions collide, creating the need for Layer 2 bridging.',
        explanation: [
          'A network hub is a Layer 1 repeater: any electrical signal entering one port is replicated out all other ports.',
          'If two hosts transmit at the same time, their electrical signals collide on the shared wire, corrupting both transmissions.',
          'As more computers join a shared hub, collisions multiply exponentially and available bandwidth plummets.',
        ],
        keyTakeaway: 'Hubs create a single shared collision domain that does not scale.',
        exampleQuery: '',
        exampleQueryExplanation: '',
      },
      tasks: [],
    },
  ],
};
