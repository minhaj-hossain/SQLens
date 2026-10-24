import { NetworkingModule } from '@/types/networking';

export const NET_07_MODULE: NetworkingModule = {
  id: 'net-07',
  dayNumber: 7,
  title: "Day 7 · ARP: Finding a Neighbour's Hardware Address",
  shortTitle: "ARP: Finding a Neighbour's Hardware Address",
  steps: [
    {
      group: 'Idea 1 of 5 · The missing hardware address',
      chg: 'Since Day 6: no changes to the physical network. The focus moves to PC1, PC2, and how local data is addressed across the switch.',
      title: 'IP alone cannot deliver data',
      what:
        'Recall Day 1: physical data on a cable travels to a specific network interface card. PC1 wants to send data to PC2 at 192.168.1.20, but network cards on a local switch only accept messages carrying their own hardware MAC address. PC1 knows PC2\'s IP address, but has no idea what MAC address belongs to that IP.\n\nMAC addresses are written in hexadecimal (base 16, using digits 0–9 and letters A–F) because each pair of characters represents exactly one byte (8 bits) of hardware address data.\n\nTo avoid asking over and over, every computer maintains an ARP cache—a local in-memory table of addresses it has already learned.',
      why: 'Without the destination MAC address, a network card cannot construct a physical message on the wire.',
      pic: 'PC1 and PC2 connected through a switch. Under PC1, the ARP cache table is currently empty.',
      task: "Inspect PC1's current ARP cache table.",
      cmd: 'arp -a',
      read: [
        ['Table State', 'Empty (no entries learned yet)'],
        ['Target IP', '192.168.1.20 (known logical address)'],
        ['Target MAC', 'Unknown (cannot build physical message)'],
      ],
      rem: 'A computer cannot deliver data across a switch without knowing the destination network card’s physical MAC address.',
    },
    {
      group: 'Idea 2 of 5 · The broadcast roll-call',
      title: 'Asking everyone: The ARP Request',
      what:
        'When PC1 needs to find who owns an IP address, it uses the Address Resolution Protocol (ARP). PC1 creates an ARP request message asking: "Who has 192.168.1.20? Tell 192.168.1.10."\n\nBecause PC1 does not know PC2\'s MAC address, it sends this message to the universal broadcast MAC address: FF:FF:FF:FF:FF:FF (every bit set to 1). When the switch receives a message addressed to FF:FF:FF:FF:FF:FF, it forwards a copy out of every connected port. Every network card on the switch receives and inspects the question.',
      why: 'Broadcasting to FF:FF:FF:FF:FF:FF guarantees that the unknown owner of the IP address receives the question anywhere on the local network.',
      pic: 'An amber broadcast pulse labeled "ARP Request: Who has 192.168.1.20?" fans out from PC1 across the switch to all ports.',
      task: 'Turn on terminal ARP event tracing to inspect ARP messages as they travel across the wire.',
      cmd: 'debug arp on',
      read: [
        ['Destination MAC', 'FF:FF:FF:FF:FF:FF (broadcast to all switch ports)'],
        ['Question', 'Who has 192.168.1.20? (target IP being searched)'],
        ['Sender Identity', 'Tell 192.168.1.10 at AA:BB:CC:00:00:01'],
      ],
      rem: 'An ARP request is sent to broadcast MAC FF:FF:FF:FF:FF:FF so every device on the local network hears the question.',
    },
    {
      group: 'Idea 3 of 5 · The direct answer',
      title: 'The answer: Unicast ARP Reply',
      what:
        'Every device on the switch receives the ARP broadcast question, but only the machine that actually owns that IP address replies. Other computers on the switch silently ignore the message.\n\nPC2 sees that the message is asking for 192.168.1.20. PC2 creates an ARP reply message: "192.168.1.20 is at AA:BB:CC:00:00:02". Unlike the request, PC2 sends this reply directly to PC1\'s unicast MAC address (AA:BB:CC:00:00:01).\n\nNow PC1 has the physical destination address. It immediately wraps its ping message and delivers it straight to PC2.',
      why: 'Sending the reply directly to the requester avoids creating another noisy broadcast across the switch.',
      pic: 'PC2 sends an emerald "ARP Reply" message straight back to PC1, followed by bidirectional ping pulses.',
      task: 'Ping PC2 at 192.168.1.20. Watch the ARP request and reply precede the ping echo.',
      cmd: 'ping 192.168.1.20',
      read: [
        ['ARP Request', 'Broadcast to FF:FF:FF:FF:FF:FF to find owner'],
        ['ARP Reply', 'Unicast from PC2 (AA:BB:CC:00:00:02) to PC1'],
        ['Ping Data', 'Delivered directly to AA:BB:CC:00:00:02'],
      ],
      rem: 'While the question is broadcast to everyone, the ARP reply is sent unicast directly to the sender.',
    },
    {
      group: 'Idea 4 of 5 · Remembering the answer',
      title: 'The cache and its timeout',
      what:
        'If a computer had to broadcast an ARP question for every single ping or packet, the switch would constantly be flooded with broadcast traffic.\n\nTo prevent this, PC1 saves the answer in its ARP cache (ARP table). The next time PC1 sends data to 192.168.1.20, it reads AA:BB:CC:00:00:02 straight from memory without broadcasting any question.\n\nHowever, network cards can be replaced, cables re-patched, and IP addresses reassigned. If entries were permanent, changes would break communication. Therefore, ARP cache entries are dynamic and have a timeout (typically 300 seconds). If unused, the entry expires and is removed.',
      why: 'The cache eliminates redundant broadcasts, while timeouts ensure stale or changed hardware addresses are cleaned up.',
      pic: 'The ARP Table HUD under PC1 populates with 192.168.1.20 and AA:BB:CC:00:00:02, displaying an active age timer.',
      task: "Inspect PC1's updated ARP cache table.",
      cmd: 'arp -a',
      read: [
        ['Internet Address', '192.168.1.20 (target IP)'],
        ['Physical Address', 'AA:BB:CC:00:00:02 (discovered MAC)'],
        ['Type', 'dynamic (learned automatically from wire)'],
        ['Age', '14s (will expire if inactive)'],
      ],
      rem: 'An ARP cache avoids repeating questions, and cache timeouts ensure outdated hardware entries expire.',
    },
    {
      group: 'Idea 5 of 5 · Reaching a distant destination',
      title: 'Outside the network: The Gateway’s MAC',
      what:
        'What happens when PC1 wants to ping 192.168.3.10 on a distant network (past Router R1)?\n\nPC1 compares 192.168.3.10 with its subnet mask (255.255.255.0). It sees that 192.168.3.10 is NOT on the local subnet. Can PC1 broadcast an ARP request asking "Who has 192.168.3.10?"\n\nNo! Routers do NOT forward broadcast messages. PC1 can never communicate directly with 192.168.3.10\'s network card.\n\nInstead, PC1 looks at its routing table and finds its Default Gateway is 192.168.1.1 (Router R1 Port 1). PC1 asks: "Who has 192.168.1.1?" PC1 puts Router R1’s MAC address (AA:BB:CC:00:A1:01) on the message. Router R1 receives the message, inspects the destination IP (192.168.3.10), and forwards it across the distant link.',
      why: 'Distant packets must be delivered physically to the local gateway router so the router can forward them onward.',
      pic: 'Router R1 Port 1 highlights with MAC AA:BB:CC:00:A1:01. PC1 addresses the physical message to R1, not to PC5.',
      task: 'Ping distant host 192.168.3.10 and observe whose MAC address is requested.',
      cmd: 'ping 192.168.3.10',
      read: [
        ['Target IP', '192.168.3.10 (distant destination)'],
        ['ARP Queried', '192.168.1.1 (the local gateway router)'],
        ['Destination MAC', 'AA:BB:CC:00:A1:01 (Router R1 Port 1)'],
        ['Distant Host MAC', 'Never in PC1’s ARP table'],
      ],
      rem: 'For destinations outside the local network, a computer asks for the Default Gateway’s MAC address—never the distant destination’s MAC.',
    },
    {
      group: 'Recap',
      title: 'The five questions of ARP',
      what:
        'Address Resolution Protocol binds Layer 3 logical IP addresses to Layer 2 physical network card identities.',
      why: 'Without ARP, devices on an Ethernet network could not translate logical IP routes into physical electrical deliveries.',
      pic: 'Full topology map showing PC1, Switch, PC2, and Router R1, with both PC2 and Router R1 registered in PC1’s ARP table.',
      task: 'Review the five fundamental principles of local hardware delivery.',
      cmd: null,
      read: [
        ['What does ARP ask?', '"Who has this IP address? Tell my IP."'],
        ['Who receives the request?', 'Every device on the local switch (broadcast FF:FF:FF:FF:FF:FF)'],
        ['Who answers the request?', 'Only the device that owns that IP address (unicast reply)'],
        ['Why keep an ARP cache?', 'To avoid sending a broadcast question for every single message'],
        ['Whose MAC for far targets?', 'The Default Gateway router’s MAC, never the distant host’s MAC'],
      ],
      rem: 'ARP discovers local physical MAC addresses using broadcast questions and direct replies; distant traffic is always addressed physically to the gateway router.',
    },
  ],
  staticResponses: {
    'arp -a':
      'No ARP entries found.',
    'debug arp on':
      'ARP debug tracing enabled.\nOutbound and inbound ARP messages will be displayed.',
    'ping 192.168.1.20':
      'ARP: who has 192.168.1.20? tell 192.168.1.10 (broadcast FF:FF:FF:FF:FF:FF)\nARP: 192.168.1.20 is at AA:BB:CC:00:00:02 (unicast to AA:BB:CC:00:00:01)\nReply from 192.168.1.20: bytes=32 time=1.4ms TTL=64\nReply from 192.168.1.20: bytes=32 time=0.9ms TTL=64\nReply from 192.168.1.20: bytes=32 time=0.8ms TTL=64',
    'ping 192.168.3.10':
      'ARP: who has 192.168.1.1? tell 192.168.1.10 (broadcast FF:FF:FF:FF:FF:FF)\nARP: 192.168.1.1 is at AA:BB:CC:00:A1:01 (unicast to AA:BB:CC:00:00:01)\nReply from 192.168.3.10: bytes=32 time=4.2ms TTL=62\nReply from 192.168.3.10: bytes=32 time=3.9ms TTL=62\nReply from 192.168.3.10: bytes=32 time=4.1ms TTL=62',
    ipconfig:
      'eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500\n        inet 192.168.1.10  netmask 255.255.255.0  broadcast 192.168.1.255\n        ether AA:BB:CC:00:00:01  txqueuelen 1000  (Ethernet)',
    'link status':
      'eth0: link UP, 100 Mbps, full duplex',
    help:
      'Commands: arp -a, debug arp on, ping 192.168.1.20, ping 192.168.3.10, ipconfig, link status, cls, clear, help',
  },
};
