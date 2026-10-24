import { NetworkingModule } from '@/types/networking';

export const NET_03_MODULE: NetworkingModule = {
  id: 'net-03',
  dayNumber: 3,
  title: 'Day 3 · Subnetting: Splitting a Network',
  shortTitle: 'Subnetting: Splitting a Network',
  steps: [
    {
      group: 'Idea 1 of 5 · Writing the mask',
      title: 'Prefix length: a shorter way to write the mask',
      what:
        "In Day 2 you learned that the mask 255.255.255.0 splits an address into a network part and a host part. Computers store addresses in binary: a bit is a single switch that is either 0 or 1. Eight bits give 256 possible combinations (counting from 0 to 255), which is why each of the four numbers in an address stops at 255. In total an address has 32 bits. In a mask, every 255 is eight bits set to 1. Counting the 1s gives a short form called the prefix length, written after a slash. 255.255.255.0 has 24 ones, so it is written /24, and PC1's address with its mask is written 192.168.1.10/24.",
      why:
        'The prefix length tells you directly how many bits belong to the network part. The remaining bits belong to the host part. Every networking tool uses this form.',
      pic:
        'For PC1, 192.168.1.10/24 means the first 24 bits (the first three numbers) are the network part, and the last 8 bits (the last number) are the host part.',
      read: [
        ['Mask 255.255.255.0', 'The mask in the form you already know.'],
        [
          'Prefix length /24',
          '24 bits are set to 1, so 24 bits are the network part.',
        ],
        ['Network bits 24', 'The first three numbers.'],
        [
          'Host bits 8',
          'The last number. 8 bits give 256 values (0 to 255), which is why a /24 network has 254 usable addresses.',
        ],
      ],
      rem: 'The prefix length is the number of network bits: /24 means 24.',
      task: "Show PC1's mask as a prefix length.",
      cmd: 'cidr',
    },
    {
      group: 'Idea 2 of 5 · Splitting a network',
      title: 'Subnetting: splitting one network into two',
      what:
        'A /24 network holds up to 254 devices, and a broadcast reaches all of them. To make smaller networks, you take bits from the host part and use them as network bits. This is called subnetting, and each smaller network is a subnet. Change the prefix from /24 to /25 and one host bit becomes a network bit. That bit can be 0 or 1, so the original network splits into two subnets.',
      why:
        'Smaller subnets limit each broadcast to fewer devices, and they let you keep groups of computers apart, such as one department from another.',
      pic:
        'A legend now appears on the canvas with the two subnets. PC1, PC2 and PC3 are all in the first one, shown in blue.',
      read: [
        [
          'Mask 255.255.255.128',
          'The /25 mask. The last number now includes one network bit.',
        ],
        [
          'Subnet 1  192.168.1.0/25',
          'Addresses 192.168.1.0 to 192.168.1.127. Usable: 1 to 126.',
        ],
        [
          'Subnet 2  192.168.1.128/25',
          'Addresses 192.168.1.128 to 192.168.1.255. Usable: 129 to 254.',
        ],
        [
          'Hosts per subnet 126',
          'Each subnet has its own network address and broadcast address.',
        ],
      ],
      rem:
        'Borrowing host bits turns one network into several smaller ones.',
      task: "Split PC1's network into two subnets.",
      cmd: 'split 192.168.1.0/24',
    },
    {
      group: 'Idea 3 of 5 · Finding the subnet',
      title: 'Which subnet does an address belong to?',
      what:
        'With a /25 mask the last number is divided at 128. If the last number is from 0 to 127, the address is in Subnet 1. If it is from 128 to 255, the address is in Subnet 2. The first three numbers stay the same. Devices make this comparison with the mask every time they send data, as you saw in Day 2, but now the boundary between networks runs through the middle of the last number.',
      why:
        'Being able to name the subnet of any address tells you immediately which devices can talk directly and which cannot.',
      pic:
        '192.168.1.130 ends in 130, which is 128 or higher, so it belongs to Subnet 2.',
      read: [
        ['Address 192.168.1.130', 'The address being checked.'],
        ['Mask 255.255.255.128 (/25)', 'The mask used for the check.'],
        ['Subnet 192.168.1.128/25', 'The subnet this address is in.'],
        [
          'Range 192.168.1.129 - 192.168.1.254',
          'The usable addresses of that subnet.',
        ],
        ['Broadcast 192.168.1.255', 'The last address of that subnet.'],
      ],
      rem:
        'With /25, last numbers 0 to 127 are Subnet 1, and 128 to 255 are Subnet 2.',
      task: 'Find the subnet of the address 192.168.1.130.',
      cmd: 'subnet 192.168.1.130/25',
    },
    {
      group: 'Idea 4 of 5 · Using a subnet',
      title: 'Placing a device in the second subnet',
      what:
        'Now put Subnet 2 to use. Give PC3 the address 192.168.1.130 with the /25 mask, 255.255.255.128. The network part of this address matches Subnet 2, not Subnet 1, so PC3 now belongs to a different subnet from PC1 and PC2, even though all three are plugged into the same switch.',
      why:
        'The subnet a device belongs to depends only on its address and mask, not on where its cable is plugged in.',
      pic:
        "PC3's address on the canvas turns green, the colour of Subnet 2, while PC1 and PC2 stay blue.",
      read: [
        ['PC3 address set to 192.168.1.130', 'The new address of PC3.'],
        ['255.255.255.128', 'The /25 mask.'],
        ['Subnet 2 (192.168.1.128/25)', 'The subnet PC3 is now in.'],
        ['Subnet 1 (192.168.1.0/25)', 'The subnet PC1 and PC2 stay in.'],
      ],
      rem:
        "A device's subnet is decided by its address and mask, not by its cable.",
      task: 'Move PC3 into the second subnet.',
      cmd: 'setip pc3 192.168.1.130 255.255.255.128',
    },
    {
      group: 'Idea 5 of 5 · Between subnets',
      title: 'Subnets cannot reach each other directly',
      what:
        'In Day 2, PC4 could not be reached because its network part was different. The same rule applies to subnets. PC1 is in 192.168.1.0/25 and PC3 is now in 192.168.1.128/25. PC1 compares the destination with its own mask, sees a different subnet, and does not send the data directly. The first three numbers of the two addresses match, but the mask puts the boundary inside the last number.',
      why:
        'Splitting a network also separates it. For different subnets to exchange data they must be joined by a device made for that purpose, which a later lesson covers.',
      pic:
        'PC1 and PC3 are on the same switch and their first three numbers match, yet the ping fails because they are in different subnets.',
      read: [
        ['Request timed out', 'No reply came back.'],
        [
          '192.168.1.130',
          'The destination, which is in Subnet 2.',
        ],
        [
          'different subnet (192.168.1.128/25)',
          'The reason the ping failed.',
        ],
        ['PC1 is in 192.168.1.0/25', "PC1's own subnet."],
      ],
      rem:
        'Different subnets cannot talk directly, even on the same switch.',
      task: 'Ping PC3 from PC1 and see what happens.',
      cmd: 'ping 192.168.1.130',
    },
    {
      group: 'Recap',
      title: 'Putting it together',
      what:
        'The prefix length counts the network bits of the mask. Subnetting borrows host bits to cut one network into smaller subnets. The mask decides which subnet any address is in. A device\'s subnet depends on its address and mask, and devices in different subnets cannot talk directly, even on the same switch.',
      read: [
        ['Prefix length', 'How many bits are the network part?'],
        ['Subnetting', 'How do I make smaller networks?'],
        ['Finding the subnet', 'Which subnet is this address in?'],
        ['Placing a device', 'Which subnet does this device belong to?'],
        ['Between subnets', 'Can these two devices talk directly?'],
      ],
      rem:
        'The mask decides which network a device is in and who it can reach directly.',
      task: 'Complete the five commands above to finish this lesson.',
      cmd: null,
    },
  ],
  staticResponses: {
    cidr:
      'Address        192.168.1.10/24\nMask           255.255.255.0\nPrefix length  /24\nNetwork bits   24\nHost bits      8',
    'split 192.168.1.0/24':
      'Prefix /24 -> /25 (mask 255.255.255.128)\nSubnet 1  192.168.1.0/25\n  usable 192.168.1.1 - 192.168.1.126\n  broadcast 192.168.1.127\nSubnet 2  192.168.1.128/25\n  usable 192.168.1.129 - 192.168.1.254\n  broadcast 192.168.1.255\nHosts per subnet  126\nPC1, PC2 and PC3 are in Subnet 1.',
    'subnet 192.168.1.130/25':
      'Address    192.168.1.130\nMask       255.255.255.128 (/25)\nSubnet     192.168.1.128/25\nRange      192.168.1.129 - 192.168.1.254\nBroadcast  192.168.1.255',
  },
};
