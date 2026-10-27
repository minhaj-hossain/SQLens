import { NetworkingModule } from '@/types/networking';

export const NET_10_MODULE: NetworkingModule = {
  id: 'net-10',
  dayNumber: 10,
  title: 'Day 10 · VLANs: Separating Networks on One Switch',
  shortTitle: 'VLANs: Separating Networks on One Switch',
  steps: [
    {
      group: 'Idea 1 of 5 · The default switch',
      chg: 'Since Day 9: In Day 9, you used a physical router to separate two switches into two broadcast domains. Today, we look at how a single switch can separate traffic internally.',
      title: 'One physical switch, one big domain',
      what:
        'In Day 9, you learned that an entire Ethernet switch forms a single broadcast domain. Every computer plugged into that switch receives every broadcast frame.\n\nImagine an office with two departments: Engineering and Finance. If you plug all their computers into the same physical switch, they share the same broadcast domain. Finance computers receive every broadcast sent by Engineering, and anyone on the wire could inspect local network traffic.\n\nTo isolate them, you could buy two separate physical switches and connect them with a router. But buying a second switch every time you want to separate a few computers is expensive, wasteful, and leaves unused ports.\n\nInstead, switches can be divided logically using Virtual Local Area Networks, abbreviated as VLANs. A VLAN is a software-defined broadcast domain inside a single physical switch.\n\nOut of the box, every switch comes pre-configured with VLAN 1, known as the Default VLAN. Every physical port on the switch starts assigned to VLAN 1. That is why all ports share a single broadcast domain until you configure them.',
      why: 'Before you can segment a switch, you must understand its factory default state: every physical port belongs to VLAN 1.',
      pic: 'Switch SW1 sits in the center with cables to PC1 (Port 1), PC2 (Port 2), PC3 (Port 3), and PC4 (Port 4). All four ports glow neutral gray, labeled VLAN 1.',
      task: 'Inspect Switch SW1 to see its default VLAN configuration.',
      cmd: 'show vlan',
      read: [
        ['VLAN 1 (default)', 'Active · Member Ports: Port 1, Port 2, Port 3, Port 4'],
        ['VLAN Meaning', 'Virtual Local Area Network (a logical broadcast domain)'],
        ['Current State', 'All 4 ports share a single broadcast domain in VLAN 1'],
      ],
      rem: 'Out of the box, every port on an Ethernet switch belongs to VLAN 1, forming one shared broadcast domain.',
    },
    {
      group: 'Idea 2 of 5 · Creating virtual switches',
      title: 'Creating VLAN 10 and VLAN 20',
      what:
        'A VLAN splits the switch’s internal forwarding engine into independent, isolated tables. Each virtual network is identified by a number called a VLAN ID (a number from 1 to 4094).\n\nLet’s create two new VLANs on Switch SW1:\n- VLAN 10 for Engineering (IP subnet 192.168.10.0/24)\n- VLAN 20 for Finance (IP subnet 192.168.20.0/24)\n\nCreating a VLAN sets up an isolated container inside the switch’s memory. However, newly created VLANs start completely empty. Until we assign physical ports to them, no devices belong to these new networks.',
      why: 'VLAN IDs give the switch operating system distinct labels to categorize physical ports and isolate traffic.',
      pic: 'Two new containers appear in the switch table HUD: an Indigo container labeled VLAN 10 (Engineering) and an Emerald container labeled VLAN 20 (Finance). Both show 0 assigned ports.',
      task: 'Create VLAN 10 and VLAN 20 on Switch SW1.',
      cmd: 'vlan create 10 20',
      read: [
        ['VLAN 10', 'Created · Name: Engineering · 0 assigned ports'],
        ['VLAN 20', 'Created · Name: Finance · 0 assigned ports'],
        ['VLAN 1', 'Default · Ports 1, 2, 3, 4 still assigned'],
      ],
      rem: 'Creating a VLAN establishes a new logical network inside the switch, identified by its VLAN ID.',
    },
    {
      group: 'Idea 3 of 5 · Assigning physical ports',
      title: 'Access ports: assigning devices to a VLAN',
      what:
        'A newly created VLAN has no ports attached, so it cannot send or receive data. To connect a computer to a VLAN, you configure its physical switch port as an access port.\n\nAn access port is a switch port that connects to a single end device (like a workstation, laptop, or printer). An access port belongs to exactly one VLAN.\n\nWhen an access port receives an Ethernet frame from a computer, the switch internally associates that frame with that port’s VLAN ID.\n\nLet’s assign Port 1 (PC1) and Port 2 (PC2) to VLAN 10. Then we assign Port 3 (PC3) and Port 4 (PC4) to VLAN 20.\n\nNow the switch hardware enforces a strict boundary: traffic entering a port in VLAN 10 can only exit ports that also belong to VLAN 10.',
      why: 'Configuring access ports maps physical cables to logical VLANs, dictating which devices are allowed to talk to each other.',
      pic: 'Ports 1 and 2 on Switch SW1 turn indigo (VLAN 10), matching PC1 and PC2. Ports 3 and 4 turn emerald (VLAN 20), matching PC3 and PC4. The switch table updates to show 2 ports per VLAN.',
      task: 'Assign Ports 1 & 2 to VLAN 10, and Ports 3 & 4 to VLAN 20.',
      cmd: 'set port 1,2 vlan 10; set port 3,4 vlan 20',
      read: [
        ['VLAN 10 (Engineering)', 'Ports 1, 2 (PC1 192.168.10.10, PC2 192.168.10.20)'],
        ['VLAN 20 (Finance)', 'Ports 3, 4 (PC3 192.168.20.30, PC4 192.168.20.40)'],
        ['Access Port', 'A port dedicated to one end device on a single VLAN'],
        ['VLAN 1', '0 active access ports (no longer used)'],
      ],
      rem: 'An access port belongs to exactly one VLAN; traffic entering that port can only reach ports in the same VLAN.',
    },
    {
      group: 'Idea 4 of 5 · Broadcast confinement',
      title: 'Broadcasts stay inside their VLAN',
      what:
        'In Day 8, you saw that when PC1 sent a broadcast frame to FF:FF:FF:FF:FF:FF, the switch flooded it out of Ports 2, 3, and 4.\n\nNow test what happens when PC1 sends a broadcast on our segmented switch by pinging its subnet broadcast address: 192.168.10.255.\n\nPC1’s broadcast enters switch Port 1. The switch checks Port 1’s membership and sees it belongs to VLAN 10. The switch looks up the other members of VLAN 10 and finds only Port 2.\n\nThe switch forwards the broadcast frame out of Port 2 to PC2. It does not touch Ports 3 and 4. The wires to PC3 and PC4 stay completely silent. The broadcast is strictly confined to VLAN 10.',
      why: 'VLANs eliminate broadcast noise between departments without needing a separate physical switch for each team.',
      pic: 'An indigo broadcast wave leaves PC1 and exits only out of Port 2 to PC2. Ports 3 and 4 display gray lock badges; cables to PC3 and PC4 remain completely silent.',
      task: 'Ping the VLAN 10 subnet broadcast address 192.168.10.255 from PC1.',
      cmd: 'ping 192.168.10.255',
      read: [
        ['Ingress Port', 'Port 1 (VLAN 10 member)'],
        ['Forwarded To', 'Port 2 (VLAN 10 member) — PC2 replied'],
        ['Filtered Ports', 'Ports 3, 4 (VLAN 20 members) — BLOCKED / SILENT'],
        ['Result', 'Broadcast confined strictly to VLAN 10'],
      ],
      rem: 'A switch never forwards a broadcast from one VLAN into another; each VLAN is an independent broadcast domain.',
    },
    {
      group: 'Idea 5 of 5 · Unicast isolation',
      title: 'Same switch, zero communication',
      what:
        'Broadcasts are contained, but what about direct unicast messages? What happens if PC1 (192.168.10.10) tries to ping PC3 (192.168.20.30)?\n\nPC1 and PC3 are plugged into the exact same physical switch, inches apart on the front panel. But PC1 is in VLAN 10, and PC3 is in VLAN 20.\n\nPC1 checks its subnet mask and knows 192.168.20.30 is on a different subnet. If PC1 attempts to send an Ethernet frame to PC3 through Switch SW1, the switch drops the frame immediately.\n\nA Layer 2 switch will never pass frames between two different VLANs. To the computers, they might as well be on different physical switches in different buildings.\n\nTo pass traffic between VLAN 10 and VLAN 20, packets must leave the switch and be routed by a Layer 3 router. You will build this on Day 12.',
      why: 'VLANs provide complete security isolation: computers on different VLANs cannot communicate unless an administrator explicitly routes between them.',
      pic: 'PC1 transmits a ping probe toward PC3. The frame enters Switch SW1 and hits a glowing red barrier: "CROSS-VLAN BLOCKED ✕ (Layer 2 Switch Cannot Route Across VLANs)". PC3 hears nothing.',
      task: 'Ping across the VLAN boundary from PC1 to PC3 at 192.168.20.30.',
      cmd: 'ping 192.168.20.30',
      read: [
        ['Source', 'PC1 · Port 1 (VLAN 10 · 192.168.10.10)'],
        ['Destination', 'PC3 · Port 3 (VLAN 20 · 192.168.20.30)'],
        ['Switch Action', 'DROPPED (Layer 2 switches cannot forward between VLANs)'],
        ['Ping Result', '100% packet loss (Request timed out)'],
      ],
      rem: 'Devices on different VLANs cannot communicate through a Layer 2 switch without a router, even if they share the same physical switch.',
    },
    {
      group: 'Recap',
      title: 'The four rules of VLAN segmentation',
      what:
        'Virtual Local Area Networks break a single physical switch into isolated logical networks. They contain noisy broadcast storms, prevent unauthorized eavesdropping, and save money by consolidating hardware.',
      why: 'Understanding single-switch VLANs is the prerequisite for Day 11, where we carry multiple VLANs across a single trunk cable to a second switch.',
      pic: 'A clean split-view of Switch SW1 showing Indigo VLAN 10 on the left (PC1, PC2) and Emerald VLAN 20 on the right (PC3, PC4), completely isolated.',
      task: 'Review the four fundamental rules of VLAN segmentation.',
      cmd: null,
      read: [
        ['1. Default State', 'All switch ports start in VLAN 1 (one shared broadcast domain)'],
        ['2. Access Ports', 'Switch ports dedicated to one end device on a single VLAN'],
        ['3. Broadcast Confinement', 'Broadcasts flood only to ports assigned to that exact same VLAN'],
        ['4. Inter-VLAN Isolation', 'Traffic cannot cross between VLANs at Layer 2 (requires a Layer 3 router)'],
      ],
      rem: 'VLANs divide one physical switch into multiple isolated broadcast domains. Traffic never crosses between VLANs without a router.',
    },
  ],
  staticResponses: {
    'show vlan':
      'Switch SW1 VLAN Database\n----------------------------------------------------\nVLAN  Name              Status    Ports\n1     default           active    Port 1, Port 2, Port 3, Port 4\n----------------------------------------------------\nTotal VLANs: 1 (factory default state: all ports share one broadcast domain)',
    'vlan create 10 20':
      'Switch SW1(config)# vlan 10\nSwitch SW1(config-vlan)# name Engineering\nSwitch SW1(config)# vlan 20\nSwitch SW1(config-vlan)# name Finance\n\nVLAN 10 (Engineering) created.\nVLAN 20 (Finance) created.\nAssigned ports: none (empty VLANs).',
    'set port 1,2 vlan 10; set port 3,4 vlan 20':
      'Switch SW1(config)# interface range port 1 - 2\nSwitch SW1(config-if-range)# switchport mode access\nSwitch SW1(config-if-range)# switchport access vlan 10\nSwitch SW1(config)# interface range port 3 - 4\nSwitch SW1(config-if-range)# switchport mode access\nSwitch SW1(config-if-range)# switchport access vlan 20\n\nPort 1, Port 2 -> VLAN 10 (Engineering · Access Mode)\nPort 3, Port 4 -> VLAN 20 (Finance · Access Mode)',
    'ping 192.168.10.255':
      'Sending 4 64-byte ICMP Echos to VLAN 10 broadcast 192.168.10.255:\nReply from 192.168.10.20: bytes=64 time=0.8ms TTL=64 (PC2)\nReply from 192.168.10.20: bytes=64 time=0.6ms TTL=64 (PC2)\n\n--- 192.168.10.255 broadcast ping statistics ---\n2 responses received from PC2 (VLAN 10 member).\n0 responses from PC3 or PC4 (VLAN 20 members were not forwarded broadcast).',
    'ping 192.168.20.30':
      'Sending 4 64-byte ICMP Echos to 192.168.20.30:\nRequest timed out.\nRequest timed out.\nRequest timed out.\nRequest timed out.\n\n--- 192.168.20.30 ping statistics ---\n4 packets transmitted, 0 received, 100% packet loss\n(Host unreachable: Switch SW1 will not forward between VLAN 10 and VLAN 20 at Layer 2)',
    help:
      'Commands: show vlan, vlan create 10 20, set port 1,2 vlan 10; set port 3,4 vlan 20, ping 192.168.10.255, ping 192.168.20.30, cls, clear, help',
  },
};
