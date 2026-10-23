import { NetworkingModule } from '@/types/networking';

export const NET_02_MODULE: NetworkingModule = {
  id: 'net-02',
  dayNumber: 2,
  title: 'Day 2 · IP Addressing: Networks and Hosts',
  shortTitle: 'IP Addressing: Networks and Hosts',
  steps: [
    {
      group: 'Idea 1 of 5 · Network and host',
      title: 'The subnet mask: splitting the address',
      what:
        'In Day 1 you saw that PC1 has the address 192.168.1.10, and ipconfig showed a mask, 255.255.255.0, next to it. The mask tells every device how to read an IP address by splitting it into two parts. The network part is the same for all devices on one network. The host part is different for each device. Where the mask has 255, that number belongs to the network part. Where it has 0, that number belongs to the host part.',
      why:
        'A device needs to know which addresses are on its own network and which are not. It uses the mask to find out.',
      pic:
        'PC1 is 192.168.1.10, PC2 is 192.168.1.20 and PC3 is 192.168.1.30. They share 192.168.1, so they are on the same network. Only the last number, the host part, is different.',
      read: [
        ['Address 192.168.1.10', 'The full IP address of PC1.'],
        [
          'Mask 255.255.255.0',
          'The first three numbers are the network part. The last number is the host part.',
        ],
        [
          'Network part 192.168.1',
          'The same on every device in this network.',
        ],
        ['Host part 10', 'Identifies PC1 inside the network.'],
      ],
      rem: 'The mask splits an IP address into a network part and a host part.',
      task: "Show how PC1's address is split.",
      cmd: 'subnet',
    },
    {
      group: 'Idea 2 of 5 · Reserved addresses',
      title: 'Network and broadcast addresses',
      what:
        'The host part can be any number from 0 to 255, but two values are reserved. The first, with host part 0, is the network address. It names the network itself, not a device (192.168.1.0). The last, with host part 255, is the broadcast address. A message sent to it is received by every device on the network (192.168.1.255). Devices can only use the addresses in between.',
      why:
        'This is why a network with the mask 255.255.255.0 holds 254 devices, not 256. It also tells you which addresses you may give to a computer.',
      pic:
        'On this network the usable addresses run from 192.168.1.1 to 192.168.1.254. PC1, PC2 and PC3 use 10, 20 and 30.',
      read: [
        [
          'Network address 192.168.1.0',
          'Names the network. No device can use it.',
        ],
        ['First usable 192.168.1.1', 'The lowest address a device can have.'],
        [
          'Last usable 192.168.1.254',
          'The highest address a device can have.',
        ],
        [
          'Broadcast address 192.168.1.255',
          'Reaches every device on the network. No device can use it.',
        ],
        ['Usable hosts 254', 'How many devices fit in this network.'],
      ],
      rem:
        'The first address names the network, the last is the broadcast, and the addresses between them belong to devices.',
      task: "Show the address range of PC1's network.",
      cmd: 'subnet info',
    },
    {
      group: 'Idea 3 of 5 · Reaching other networks',
      title: 'Different networks cannot reach each other directly',
      what:
        "A new computer, PC4, is plugged into the same switch. Its address is 192.168.2.10. Its network part is 192.168.2, but PC1's network part is 192.168.1. PC1 compares the two, sees that the network parts are different, and knows PC4 is not on its own network. The switch only passes data inside one network, so the ping cannot reach PC4.",
      why:
        'Every device uses the mask to decide whether the destination is on its own network. If it is not, sending the data directly will not work.',
      pic:
        'PC4 now appears below the switch. It is plugged in like the others, but its address belongs to the 192.168.2 network.',
      read: [
        ['Request timed out', 'No reply came back.'],
        [
          '192.168.2.10',
          "The destination. Its network part is different from PC1's.",
        ],
        ['not on PC1\'s network', 'The reason: the network parts do not match.'],
      ],
      rem: 'Devices can talk directly only when they are on the same network.',
      task: 'Ping PC4 and see what happens.',
      cmd: 'ping 192.168.2.10',
    },
    {
      group: 'Idea 4 of 5 · Setting an address',
      title: 'Setting a static address',
      what:
        "To make PC4 reachable from PC1, give it an address in PC1's network. You do this by setting its IP address and mask by hand, which is called a static address. For PC4, choose 192.168.1.40. The network part 192.168.1 matches PC1, and the host part 40 is not used by any other device.",
      why:
        'A static address stays the same until someone changes it. Choosing it correctly means picking the right network part and an unused host part.',
      pic:
        'After the change, the label of PC4 on the canvas shows 192.168.1.40.',
      read: [
        [
          'PC4 address set to 192.168.1.40',
          'The new address is stored on PC4.',
        ],
        ['255.255.255.0', 'The mask, the same as on the other devices.'],
        ['Same network as PC1', 'The network parts now match.'],
      ],
      rem:
        "To join a network, a device needs that network's address part, an unused host part, and the same mask.",
      task:
        "Give PC4 an address on PC1's network, then ping 192.168.1.40 to confirm.",
      cmd: 'setip pc4 192.168.1.40 255.255.255.0',
    },
    {
      group: 'Idea 5 of 5 · Unique addresses',
      title: 'Every address must be unique',
      what:
        'The host part must be different for every device. If two devices have the same address, the network cannot tell which one should receive the data, and the address is reported as a conflict. Try giving PC3 the address that PC1 already uses.',
      why:
        'Duplicate addresses make connections stop working at random. It is one of the most common mistakes when setting addresses by hand.',
      pic:
        'PC1 already has 192.168.1.10. Setting PC3 to the same address would put two devices on one address.',
      read: [
        ['Conflict', 'The address cannot be used.'],
        [
          '192.168.1.10 is already used by PC1',
          'Names the device that already owns the address.',
        ],
      ],
      rem: 'One address, one device.',
      task: 'Try to give PC3 the same address as PC1.',
      cmd: 'setip pc3 192.168.1.10 255.255.255.0',
    },
    {
      group: 'Recap',
      title: 'Putting it together',
      what:
        'The mask splits an address into a network part and a host part. The first address of a range names the network and the last is the broadcast, so devices use the ones between them. Devices talk directly only when their network parts match, so a new device needs an address on the right network. And every device needs its own host part.',
      read: [
        ['Subnet mask', 'Which part of the address is the network?'],
        ['Reserved addresses', 'Which addresses can a device use?'],
        ['Same network', 'Can these two devices talk directly?'],
        ['Static address', 'How does a device join a network?'],
        ['Unique address', 'Is this address already taken?'],
      ],
      rem:
        'Same network, own address: that is how devices join one network.',
      task: 'Complete the five commands above to finish this lesson.',
      cmd: null,
    },
  ],
  staticResponses: {
    subnet:
      'Address        192.168.1.10\nMask           255.255.255.0\nNetwork part   192.168.1\nHost part      10',
    'subnet info':
      'Network address    192.168.1.0\nFirst usable       192.168.1.1\nLast usable        192.168.1.254\nBroadcast address  192.168.1.255\nUsable hosts       254',
  },
};
