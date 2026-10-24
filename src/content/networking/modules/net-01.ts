import { NetworkingModule } from '@/types/networking';

export const NET_01_MODULE: NetworkingModule = {
  id: 'net-01',
  dayNumber: 1,
  title: 'Day 1 · The First Link & Hardware Identity',
  shortTitle: 'The First Link & Hardware Identity',
  steps: [
    {
      group: 'Idea 1 of 5 · The connection',
      title: 'The cable: the physical link',
      what:
        'A network starts with two devices joined by a cable. PC1 and PC2 are computers, devices where data is created and used. The cable between them carries electrical signals from one to the other. If this connection is down, nothing built on top of it can work.',
      why:
        'When a network problem appears, check the physical connection first. Every other test depends on it.',
      pic:
        'The line between PC1 and PC2 is the cable. The link is up when both ends of the cable detect a signal.',
      read: [
        ['link UP', 'Both ends detect a signal. The connection works.'],
        ['100 Mbps', 'The speed of the link, in megabits per second.'],
        ['full duplex', 'Both computers can send and receive at the same time.'],
      ],
      rem: 'No link, no network. Always check the cable first.',
      task: 'Ask PC1 whether its cable is connected.',
      cmd: 'link status',
    },
    {
      group: 'Idea 2 of 5 · Identifying a device',
      title: 'IP address: identifying a device',
      what:
        'A cable only carries signals; it does not tell the network which device is which. So every device gets an IP address, a number that identifies it on the network. It has four numbers separated by dots, like 192.168.1.10.',
      why:
        'When PC1 sends data, it writes the IP address of the receiver into the message. Without it, the network cannot know which device the data is for.',
      pic:
        'PC1 has 192.168.1.10 and PC2 has 192.168.1.20. The first three numbers (192.168.1) are the same, so both are on the same network. The last number is different for each device.',
      read: [
        ['IPv4 192.168.1.10', 'The address of this computer, PC1.'],
        [
          'Mask 255.255.255.0',
          'Shows which part of the address is the network (192.168.1) and which part is the device (the last number).',
        ],
      ],
      rem: 'An IP address identifies a device on the network.',
      task: 'Find the address of PC1.',
      cmd: 'ipconfig',
    },
    {
      group: 'Idea 3 of 5 · Testing',
      title: 'Ping: testing reachability',
      what:
        'You now have a cable and an address, and ping uses both. Ping sends a small test message from PC1 to an IP address, and the device with that address sends a reply. If the reply comes back, the cable and the address both work.',
      why:
        'When two devices cannot communicate, ping shows whether they can reach each other at all. It is the first test used on a network.',
      pic:
        'The message goes along the cable from PC1 to PC2 (192.168.1.20), and the reply returns the same way.',
      read: [
        ['Reply from 192.168.1.20', 'PC2 received the message and answered.'],
        ['time<1ms', 'The time for the message to go and return. Lower is better.'],
        ['3 sent, 3 received', 'Every message got a reply. 0% loss means none were lost.'],
      ],
      rem: 'A reply to ping means the destination can be reached.',
      task: 'Ping PC2 using the address you just learned.',
      cmd: 'ping 192.168.1.20',
    },
    {
      group: 'Idea 4 of 5 · Hardware identity',
      title: 'MAC address: identifying the network card',
      what:
        'Your ping reached 192.168.1.20, but on the cable, data is delivered to a network card, not to an IP address. So PC1 has to know which network card uses that IP address. Every network card has a MAC address set at the factory, like AA:BB:CC:00:00:02. It is stored in the hardware, so it stays the same even if the IP address changes. It is written in hexadecimal, a counting system that uses letters A through F alongside digits 0 to 9 to write large values with fewer characters.',
      why:
        'Each device keeps a list that matches IP addresses to MAC addresses. It uses this list to deliver every message to the correct network card.',
      pic:
        "PC1's card has MAC AA:BB:CC:00:00:01 and PC2's card has AA:BB:CC:00:00:02.",
      read: [
        ['192.168.1.20', 'The IP address of PC2.'],
        ['AA:BB:CC:00:00:02', "The MAC address of PC2's network card."],
        [
          'Hexadecimal letters',
          'Letters A through F stand for values 10 to 15 to keep the hardware address compact.',
        ],
      ],
      rem: 'A MAC address identifies the network card itself, and the hardware fixes it.',
      task: "Your ping made PC1 learn PC2's MAC address. Show that list.",
      cmd: 'arp -a',
    },
    {
      group: 'Idea 5 of 5 · More devices',
      title: 'The switch: connecting more computers',
      what:
        'So far one cable joined two computers. Now a third computer, PC3, joins. Joining every pair directly would need a cable between each pair, and each computer would need many ports. A port is a socket where a cable plugs in. A switch solves this: each computer plugs into one port of the switch, and the switch passes data between them. To know which port leads to which computer, the switch keeps a list of the MAC addresses it has seen on each port.',
      why:
        'Real networks have many computers. With a switch, each computer needs only one cable, and the switch uses the MAC address in each message to send it out of the right port.',
      pic:
        'The switch now sits in the middle with PC3 added. Each computer has one cable to the switch.',
      read: [
        [
          'Port 1  AA:BB:CC:00:00:01',
          'PC1 is plugged into port 1. Data for this MAC address leaves through port 1.',
        ],
        ['Port 2  AA:BB:CC:00:00:02', 'PC2 is plugged into port 2.'],
        ['Port 3  AA:BB:CC:00:00:03', 'PC3 is plugged into port 3.'],
      ],
      rem: 'A switch connects many computers and uses MAC addresses to send data to the right one.',
      task: "Show the switch's list of ports and MAC addresses.",
      cmd: 'show mac table',
    },
    {
      group: 'Recap',
      title: 'Putting it together',
      what:
        'The cable carries the signal between devices. The IP address says which device the data is for. Ping checks that the device can be reached. The MAC address identifies the network card that receives the data. When more computers join, a switch uses MAC addresses to deliver data to the right one. Each idea depends on the one before it.',
      read: [
        ['Cable (link)', 'Is the connection up?'],
        ['IP address', 'Which device is it on the network?'],
        ['Ping', 'Can I reach it?'],
        ['MAC address', 'Which network card is it?'],
        ['Switch', 'How do more computers connect?'],
      ],
      rem:
        'Connected, identified, reachable, matched to the hardware, and ready to grow. That is the first link.',
      task: 'Complete the five commands above to finish this lesson.',
      cmd: null,
    },
  ],
  staticResponses: {
    'show mac table':
      'Port  MAC address         Device\n1     AA:BB:CC:00:00:01   PC1\n2     AA:BB:CC:00:00:02   PC2\n3     AA:BB:CC:00:00:03   PC3',
    'link status': 'eth0: link UP, 100 Mbps, full duplex',
    'ping 192.168.1.20':
      'Reply from 192.168.1.20: time<1ms\nReply from 192.168.1.20: time<1ms\nReply from 192.168.1.20: time<1ms\n3 sent, 3 received, 0% loss',
    ipconfig: 'eth0\n  IPv4   192.168.1.10\n  Mask   255.255.255.0',
    'arp -a':
      '192.168.1.20   AA:BB:CC:00:00:02\n192.168.1.1    AA:BB:CC:00:00:FE',
  },
};
