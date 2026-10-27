import { NetworkingModule } from '@/types/networking';

export const NET_12_MODULE: NetworkingModule = {
  id: 'net-12',
  dayNumber: 12,
  title: 'Day 12 · Routing Between VLANs: Router-on-a-Stick',
  shortTitle: 'Routing Between VLANs',
  steps: [
    {
      group: 'Idea 1 of 5 · The communication problem',
      chg: 'Since Day 11: Switch SW1 connects PC1 (VLAN 10) and PC2 (VLAN 20). Router R1 is now connected to Switch SW1 with a single cable on Port 4.',
      title: 'Isolated VLANs need a router',
      what:
        'In Day 10, you divided Switch SW1 into two VLANs: VLAN 10 (192.168.10.0/24) for Engineering and VLAN 20 (192.168.20.0/24) for Finance.\n\nBecause they belong to different broadcast domains and different IP subnets, Switch SW1 completely isolates them. A Layer 2 switch will never pass frames between different VLANs.\n\nNow, test what happens if PC1 (192.168.10.10) tries to ping PC2 (192.168.20.20). Even though they are plugged into the exact same physical switch inches apart, the ping fails with 100% packet loss.\n\nTo allow controlled communication between different VLANs, traffic must leave the switch and pass through a Layer 3 routing engine. This process is called Inter-VLAN Routing.',
      why: 'VLANs provide complete security isolation by default; any communication between them requires explicit Layer 3 routing.',
      pic: 'PC1 (VLAN 10) and PC2 (VLAN 20) are plugged into Switch SW1. A ping probe hits the switch and is dropped cold.',
      task: 'Ping from PC1 to PC2 at 192.168.20.20 to observe the Layer 2 isolation barrier.',
      cmd: 'ping 192.168.20.20',
      read: [
        ['Source', 'PC1 · Port 1 (VLAN 10 · 192.168.10.10)'],
        ['Destination', 'PC2 · Port 2 (VLAN 20 · 192.168.20.20)'],
        ['Switch Action', 'DROPPED (Layer 2 switches cannot forward between VLANs)'],
        ['Ping Result', 'Request timed out (100% packet loss)'],
      ],
      rem: 'Devices on different VLANs cannot communicate through a switch without a router, even on the same physical box.',
    },
    {
      group: 'Idea 2 of 5 · The single-cable design',
      title: 'Router-on-a-Stick: one cable, multiple VLANs',
      what:
        'How should we connect Router R1 to Switch SW1?\n\nThe naive method is to run two physical cables: one cable from a switch port in VLAN 10 into Router Port 1, and a second cable from a switch port in VLAN 20 into Router Port 2.\n\nHowever, enterprise networks have dozens of VLANs. Buying a router with 20 physical Ethernet ports just to connect one switch is extremely expensive and wastes hardware.\n\nInstead, we connect Router R1 to Switch SW1 with a single physical cable configured as an IEEE 802.1Q trunk link (on Switch Port 4). Because an 802.1Q trunk carries multiple VLANs over one wire (from Day 11), traffic for all VLANs can travel over this single connection.\n\nThis architecture is known as Router-on-a-Stick (ROAS).',
      why: 'Router-on-a-Stick uses a single physical cable to route between multiple VLANs, eliminating the cost of multi-port router hardware.',
      pic: 'A single vertical cable connects Switch SW1 Port 4 up to Router R1 interface eth0. Port 4 glows cyan as an 802.1Q trunk.',
      task: 'Inspect Router R1’s physical interface eth0.',
      cmd: 'show router interfaces',
      read: [
        ['Interface', 'eth0 (Physical RJ-45 GigabitEthernet)'],
        ['Link State', 'UP · Connected to Switch SW1 Port 4 (Trunk)'],
        ['IP Address', 'Unassigned (Awaiting sub-interface configuration)'],
      ],
      rem: 'Router-on-a-Stick connects a router to a switch trunk using a single physical cable to carry all VLAN traffic.',
    },
    {
      group: 'Idea 3 of 5 · Virtual router ports',
      title: 'Sub-interfaces: dividing a physical port',
      what:
        'Router R1 has only one physical port (`eth0`). How can one port belong to multiple subnets with different IP addresses?\n\nThe router operating system splits the physical port into virtual, software-defined ports called sub-interfaces.\n\nA sub-interface is a logical interface created inside the router’s memory, designated by a period followed by a number (like `eth0.10` for VLAN 10 and `eth0.20` for VLAN 20).\n\nEach sub-interface acts as an independent virtual network interface card with its own IP address and its own 802.1Q tag parser.',
      why: 'Sub-interfaces allow one physical router port to serve as the default gateway for multiple distinct IP subnets.',
      pic: 'Interface eth0 divides into two logical slots: eth0.10 (Indigo) and eth0.20 (Emerald).',
      task: 'Create sub-interface eth0.10 configured for VLAN 10 with IP 192.168.10.1/24.',
      cmd: 'create subif eth0.10 10 192.168.10.1/24',
      read: [
        ['Sub-interface', 'eth0.10 (Logical division of eth0)'],
        ['Encapsulation', 'IEEE 802.1Q · VLAN ID: 10'],
        ['IP Address', '192.168.10.1/24 (VLAN 10 Default Gateway)'],
        ['Status', 'Active · Routing enabled for VLAN 10'],
      ],
      rem: 'A sub-interface is a software division of a physical router port, bound to a specific VLAN ID.',
    },
    {
      group: 'Idea 4 of 5 · The second gateway',
      title: 'Configuring the VLAN 20 sub-interface',
      what:
        'Now we configure the second sub-interface for Finance on VLAN 20.\n\nWe create `eth0.20`, set its encapsulation to 802.1Q with VLAN ID 20, and assign it the IP address `192.168.20.1/24`.\n\nNow Router R1 has two connected routes in its routing table (from Day 4):\n- `192.168.10.0/24` directly connected via `eth0.10`\n- `192.168.20.0/24` directly connected via `eth0.20`\n\nPC1 has its Default Gateway set to `192.168.10.1` (`eth0.10`). PC2 has its Default Gateway set to `192.168.20.1` (`eth0.20`). The stage is set for traffic to cross between the VLANs.',
      why: 'Both VLANs must have their respective Default Gateway configured on the router before packets can be forwarded between them.',
      pic: 'Router R1’s sub-interface table shows both eth0.10 (192.168.10.1) and eth0.20 (192.168.20.1) active and connected.',
      task: 'Create sub-interface eth0.20 configured for VLAN 20 with IP 192.168.20.1/24.',
      cmd: 'create subif eth0.20 20 192.168.20.1/24',
      read: [
        ['Sub-interface', 'eth0.20 (Logical division of eth0)'],
        ['Encapsulation', 'IEEE 802.1Q · VLAN ID: 20'],
        ['IP Address', '192.168.20.1/24 (VLAN 20 Default Gateway)'],
        ['Status', 'Active · Routing enabled for VLAN 20'],
      ],
      rem: 'Each VLAN has its own sub-interface on the router acting as that subnet’s default gateway.',
    },
    {
      group: 'Idea 5 of 5 · The packet journey',
      title: 'The hairpin route: how traffic flows',
      what:
        'Let’s test communication again by pinging PC2 at 192.168.20.20 from PC1.\n\nFollow the complete journey of the packet:\n1. PC1 sees 192.168.20.20 is outside its subnet. PC1 transmits an untagged frame addressed to its Default Gateway (192.168.10.1) into SW1 Port 1.\n2. SW1 receives the frame on access Port 1 (VLAN 10), inserts an 802.1Q tag (VID=10), and forwards it up trunk Port 4 to Router R1.\n3. R1 receives the frame on physical port `eth0`. The router reads `VID=10` and sends the packet to sub-interface `eth0.10`.\n4. R1 removes the Ethernet header, inspects the destination IP (192.168.20.20), looks up its routing table, and finds `192.168.20.0/24` on sub-interface `eth0.20`.\n5. R1 decrements the TTL, encapsulates the packet in a new Ethernet frame with an 802.1Q tag (VID=20), and sends it back down the exact same trunk cable into SW1 Port 4.\n6. SW1 receives the frame on trunk Port 4, reads `VID=20`, strips the tag, and delivers the untagged frame out of access Port 2 to PC2.\n\nPC2 receives the ping and replies in reverse! The ping succeeds with 0% packet loss.',
      why: 'Understanding the hairpin traversal proves how Layer 2 VLAN tagging and Layer 3 IP routing work together over a single physical cable.',
      pic: 'An animated pulse leaves PC1, ascends the trunk tagged VID=10, loops inside Router R1, descends the trunk tagged VID=20, and arrives at PC2. PC2 replies successfully.',
      task: 'Ping from PC1 to PC2 at 192.168.20.20 through the Router-on-a-Stick.',
      cmd: 'ping 192.168.20.20',
      read: [
        ['Path Out', 'PC1 -> SW1 -> [Tag VID=10] -> R1:eth0.10 -> Route -> R1:eth0.20 -> [Tag VID=20] -> SW1 -> PC2'],
        ['Path Return', 'PC2 -> SW1 -> [Tag VID=20] -> R1:eth0.20 -> Route -> R1:eth0.10 -> [Tag VID=10] -> SW1 -> PC1'],
        ['Ping Result', 'Reply from 192.168.20.20: bytes=64 time=1.8ms TTL=63 (0% packet loss)'],
        ['TTL Decrement', 'TTL decremented from 64 to 63 (proves Layer 3 router hop)'],
      ],
      rem: 'Router-on-a-Stick routes packets between VLANs by sending tagged frames up and down a single trunk cable.',
    },
    {
      group: 'Recap',
      title: 'The four rules of Inter-VLAN routing',
      what:
        'Inter-VLAN routing allows computers in separate virtual networks to communicate under the controlled policies of a Layer 3 router. Router-on-a-Stick maximizes efficiency by multiplexing multiple VLAN default gateways across sub-interfaces on a single physical link.',
      why: 'Mastering Router-on-a-Stick completes your foundation in VLAN architecture, preparing you for Day 13 where we prevent catastrophic broadcast loops with Spanning Tree Protocol.',
      pic: 'Clean topology showing PC1 (VLAN 10), Switch SW1, Router R1 with sub-interfaces eth0.10 & eth0.20, and PC2 (VLAN 20) with active bidirectional routing.',
      task: 'Review the four fundamental rules of Router-on-a-Stick Inter-VLAN routing.',
      cmd: null,
      read: [
        ['1. Router Required', 'Switches isolate VLANs at Layer 2; moving between VLANs always requires a Layer 3 router'],
        ['2. Trunk Link', 'The router connects to the switch via an 802.1Q trunk port carrying all VLAN traffic'],
        ['3. Sub-interfaces', 'The router divides its physical port into virtual sub-interfaces (eth0.10, eth0.20)'],
        ['4. Hairpin Routing', 'Packets travel up the trunk tagged in one VLAN and back down tagged in the other'],
      ],
      rem: 'Inter-VLAN routing connects isolated VLANs through router sub-interfaces over a single trunk cable.',
    },
  ],
  staticResponses: {
    'ping 192.168.20.20':
      'Sending 4 64-byte ICMP Echos to 192.168.20.20:\nRequest timed out.\nRequest timed out.\nRequest timed out.\nRequest timed out.\n\n--- 192.168.20.20 ping statistics ---\n4 packets transmitted, 0 received, 100% packet loss\n(Host unreachable: Switch SW1 will not forward between VLAN 10 and VLAN 20 at Layer 2)',
    'show router interfaces':
      'Router R1 Interface Status\n----------------------------------------------------\nInterface  IP-Address      Status   Protocol  Description\neth0       unassigned      up       up        Trunk link to SW1:Port 4\n----------------------------------------------------\nSub-interfaces: None configured.',
    'create subif eth0.10 10 192.168.10.1/24':
      'Router R1(config)# interface eth0.10\nRouter R1(config-subif)# encapsulation dot1q 10\nRouter R1(config-subif)# ip address 192.168.10.1 255.255.255.0\n\nSub-interface eth0.10 created.\nEncapsulation: IEEE 802.1Q · VLAN ID: 10\nIP Address: 192.168.10.1/24 (Gateway for VLAN 10).',
    'create subif eth0.20 20 192.168.20.1/24':
      'Router R1(config)# interface eth0.20\nRouter R1(config-subif)# encapsulation dot1q 20\nRouter R1(config-subif)# ip address 192.168.20.1 255.255.255.0\n\nSub-interface eth0.20 created.\nEncapsulation: IEEE 802.1Q · VLAN ID: 20\nIP Address: 192.168.20.1/24 (Gateway for VLAN 20).\n\nRouting table updated: 2 connected subnets (192.168.10.0/24, 192.168.20.0/24).',
    help:
      'Commands: ping 192.168.20.20, show router interfaces, create subif eth0.10 10 192.168.10.1/24, create subif eth0.20 20 192.168.20.1/24, cls, clear, help',
  },
};
