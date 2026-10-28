import { describe, it, expect } from 'vitest';
import {
  NET_01_MODULE,
  NET_02_MODULE,
  NET_03_MODULE,
  NET_04_MODULE,
  NET_05_MODULE,
  NET_06_MODULE,
  NET_07_MODULE,
  NET_08_MODULE,
  NET_09_MODULE,
  NET_10_MODULE,
  NET_11_MODULE,
  NET_12_MODULE,
  NET_13_MODULE,
  NET_14_MODULE,
  NET_15_MODULE,
  NET_16_MODULE,
  NET_17_MODULE,
  NET_18_MODULE,
  NETWORKING_ROADMAP_STAGES,
  getNetworkingModule,
} from '@/content/networking';

describe('Networking Curriculum Content Modules', () => {
  it('Day 1 module has exact title, 6 steps, and authentic command outputs', () => {
    expect(NET_01_MODULE.id).toBe('net-01');
    expect(NET_01_MODULE.title).toBe(
      'Day 1 · The First Link & Hardware Identity'
    );
    expect(NET_01_MODULE.steps).toHaveLength(6);

    const step1 = NET_01_MODULE.steps[0];
    expect(step1.group).toBe('Idea 1 of 5 · The connection');
    expect(step1.title).toBe('The cable: the physical link');
    expect(step1.cmd).toBe('link status');
    expect(NET_01_MODULE.staticResponses['link status']).toBe(
      'eth0: link UP, 100 Mbps, full duplex'
    );

    const step4 = NET_01_MODULE.steps[3];
    expect(step4.title).toBe('MAC address: identifying the network card');
    expect(step4.cmd).toBe('arp -a');

    const recap = NET_01_MODULE.steps[5];
    expect(recap.group).toBe('Recap');
    expect(recap.cmd).toBeNull();
  });

  it('Day 2 module has exact title, 6 steps, and subnet commands', () => {
    expect(NET_02_MODULE.id).toBe('net-02');
    expect(NET_02_MODULE.title).toBe(
      'Day 2 · IP Addressing: Networks and Hosts'
    );
    expect(NET_02_MODULE.steps).toHaveLength(6);

    const step1 = NET_02_MODULE.steps[0];
    expect(step1.cmd).toBe('subnet');
    expect(NET_02_MODULE.staticResponses['subnet']).toContain('Network part');

    const step2 = NET_02_MODULE.steps[1];
    expect(step2.cmd).toBe('subnet info');
    expect(NET_02_MODULE.staticResponses['subnet info']).toContain(
      'Broadcast address'
    );
  });

  it('Day 3 module has exact title, 6 steps, and CIDR/split commands', () => {
    expect(NET_03_MODULE.id).toBe('net-03');
    expect(NET_03_MODULE.title).toBe('Day 3 · Subnetting: Splitting a Network');
    expect(NET_03_MODULE.steps).toHaveLength(6);

    const step1 = NET_03_MODULE.steps[0];
    expect(step1.cmd).toBe('cidr');
    expect(NET_03_MODULE.staticResponses['cidr']).toContain('Prefix length');

    const step2 = NET_03_MODULE.steps[1];
    expect(step2.cmd).toBe('split 192.168.1.0/24');
    expect(NET_03_MODULE.staticResponses['split 192.168.1.0/24']).toContain(
      'Subnet 1'
    );
  });

  it('Day 4 module has exact title, 7 steps, and router commands', () => {
    expect(NET_04_MODULE.id).toBe('net-04');
    expect(NET_04_MODULE.title).toBe('Day 4 · The Router: Connecting Networks');
    expect(NET_04_MODULE.steps).toHaveLength(7);

    const step1 = NET_04_MODULE.steps[0];
    expect(step1.cmd).toBe('show router');
    expect(step1.chg).toContain('Since Day 3');

    const step3 = NET_04_MODULE.steps[2];
    expect(step3.title).toBe('The default gateway: where to send outside data');
    expect(step3.cmd).toBe('ipconfig');
  });

  it('Day 5 module has exact title, 7 steps, and static route commands', () => {
    expect(NET_05_MODULE.id).toBe('net-05');
    expect(NET_05_MODULE.title).toBe(
      'Day 5 · Static Routes: Reaching Distant Networks'
    );
    expect(NET_05_MODULE.steps).toHaveLength(7);

    const step1 = NET_05_MODULE.steps[0];
    expect(step1.cmd).toBe('show router r2');
    expect(step1.chg).toContain('Since Day 4');

    const step4 = NET_05_MODULE.steps[3];
    expect(step4.cmd).toBe('r1 route add 192.168.3.0/24 via 192.168.2.2');
  });

  it('Day 6 module has exact title, 6 steps, and default route commands', () => {
    expect(NET_06_MODULE.id).toBe('net-06');
    expect(NET_06_MODULE.title).toBe(
      'Day 6 · The Default Route: Leaving the Network'
    );
    expect(NET_06_MODULE.steps).toHaveLength(6);

    const step1 = NET_06_MODULE.steps[0];
    expect(step1.cmd).toBe('show router isp');
    expect(step1.chg).toContain('Since Day 5');

    const step3 = NET_06_MODULE.steps[2];
    expect(step3.title).toBe('0.0.0.0/0: matching every unknown network');
    expect(step3.cmd).toBe('r1 route add 0.0.0.0/0 via 203.0.113.1');

    const step4 = NET_06_MODULE.steps[3];
    expect(step4.title).toBe('Longest prefix match: the most specific route wins');
    expect(step4.cmd).toBe('r1 lookup 192.168.3.10');
  });

  it('Day 7 module has exact title, 6 steps, and ARP neighbour discovery commands', () => {
    expect(NET_07_MODULE.id).toBe('net-07');
    expect(NET_07_MODULE.title).toBe(
      "Day 7 · ARP: Finding a Neighbour's Hardware Address"
    );
    expect(NET_07_MODULE.steps).toHaveLength(6);

    const step1 = NET_07_MODULE.steps[0];
    expect(step1.title).toBe('IP alone cannot deliver data');
    expect(step1.cmd).toBe('arp -a');
    expect(step1.what).toContain('hexadecimal');

    const step2 = NET_07_MODULE.steps[1];
    expect(step2.cmd).toBe('debug arp on');
    expect(step2.what).toContain('FF:FF:FF:FF:FF:FF');

    const step3 = NET_07_MODULE.steps[2];
    expect(step3.cmd).toBe('ping 192.168.1.20');

    const step5 = NET_07_MODULE.steps[4];
    expect(step5.title).toBe('Outside the network: The Gateway’s MAC');
    expect(step5.cmd).toBe('ping 192.168.3.10');

    // Terminology check: strictly uses "message", never "frame"
    const fullText = JSON.stringify(NET_07_MODULE.steps);
    expect(fullText.toLowerCase()).not.toContain('frame');
  });

  it('Day 8 module has exact title, 6 steps, and MAC learning commands', () => {
    expect(NET_08_MODULE.id).toBe('net-08');
    expect(NET_08_MODULE.title).toBe(
      'Day 8 · How a Switch Learns: The MAC Address Table'
    );
    expect(NET_08_MODULE.steps).toHaveLength(6);

    const step1 = NET_08_MODULE.steps[0];
    expect(step1.title).toBe('The switch starts with an empty table');
    expect(step1.cmd).toBe('show mac table');

    const step2 = NET_08_MODULE.steps[1];
    expect(step2.cmd).toBe('ping 192.168.1.20');
    expect(step2.what).toContain('Source MAC');

    const step3 = NET_08_MODULE.steps[2];
    expect(step3.cmd).toBe('show switch log');
    expect(step3.what).toContain('unknown unicast flooding');

    const step4 = NET_08_MODULE.steps[3];
    expect(step4.cmd).toBe('show mac table');
    expect(step4.what).toContain('selective forwarding');

    const step5 = NET_08_MODULE.steps[4];
    expect(step5.cmd).toBe('clear mac table');
    expect(step5.what).toContain('Aging Timer');

    const step6 = NET_08_MODULE.steps[5];
    expect(step6.cmd).toBeNull();
  });

  it('Day 9 module has exact title, 6 steps, and broadcast domain commands', () => {
    // @ts-expect-error - NET_09_MODULE imported dynamically or tested via getNetworkingModule
    const mod = getNetworkingModule('net-09');
    expect(mod).toBeDefined();
    expect(mod?.id).toBe('net-09');
    expect(mod?.title).toBe('Day 9 · Broadcast Domains');
    expect(mod?.steps).toHaveLength(6);

    const step1 = mod!.steps[0];
    expect(step1.title).toBe('The broadcast address: reaching everyone');
    expect(step1.cmd).toBe('show broadcast domain');
    expect(step1.what).toContain('FF:FF:FF:FF:FF:FF');

    const step2 = mod!.steps[1];
    expect(step2.cmd).toBe('show station stats');
    expect(step2.what).toContain('hardware interrupt');

    const step3 = mod!.steps[2];
    expect(step3.cmd).toBe('show router broadcast');
    expect(step3.what).toContain('routers physically do not forward Layer 2 broadcasts');

    const step4 = mod!.steps[3];
    expect(step4.cmd).toBe('show domains');
    expect(step4.what).toContain('broadcast domain');

    const step5 = mod!.steps[4];
    expect(step5.cmd).toBe('ping 192.168.1.255');

    const step6 = mod!.steps[5];
    expect(step6.cmd).toBeNull();
  });

  it('Day 10 module has exact title, 6 steps, and authentic VLAN commands', () => {
    const mod = getNetworkingModule('net-10');
    expect(mod).toBeDefined();
    expect(mod?.id).toBe('net-10');
    expect(mod?.title).toBe('Day 10 · VLANs: Separating Networks on One Switch');
    expect(mod?.steps).toHaveLength(6);

    const step1 = mod!.steps[0];
    expect(step1.title).toBe('One physical switch, one big domain');
    expect(step1.cmd).toBe('show vlan');
    expect(step1.what).toContain('Virtual Local Area Network');
    expect(step1.what).toContain('VLAN 1');

    const step2 = mod!.steps[1];
    expect(step2.cmd).toBe('vlan create 10 20');
    expect(step2.what).toContain('VLAN ID');

    const step3 = mod!.steps[2];
    expect(step3.cmd).toBe('set port 1,2 vlan 10; set port 3,4 vlan 20');
    expect(step3.what).toContain('access port');

    const step4 = mod!.steps[3];
    expect(step4.cmd).toBe('ping 192.168.10.255');
    expect(step4.what).toContain('broadcast frame');

    const step5 = mod!.steps[4];
    expect(step5.cmd).toBe('ping 192.168.20.30');
    expect(step5.what).toContain('A Layer 2 switch will never pass frames between two different VLANs');

    const step6 = mod!.steps[5];
    expect(step6.cmd).toBeNull();
    expect(step6.title).toBe('The four rules of VLAN segmentation');
  });

  it('Day 11 module has exact title, 6 steps, and authentic 802.1Q trunk commands', () => {
    const mod = getNetworkingModule('net-11');
    expect(mod).toBeDefined();
    expect(mod?.id).toBe('net-11');
    expect(mod?.title).toBe('Day 11 · Trunks: Carrying VLANs Between Switches');
    expect(mod?.steps).toHaveLength(6);

    const step1 = mod!.steps[0];
    expect(step1.title).toBe('Connecting VLANs across multiple switches');
    expect(step1.cmd).toBe('show trunk');
    expect(step1.what).toContain('trunk port');

    const step2 = mod!.steps[1];
    expect(step2.cmd).toBe('set port 5 trunk');
    expect(step2.what).toContain('IEEE 802.1Q');
    expect(step2.what).toContain('VLAN ID');

    const step3 = mod!.steps[2];
    expect(step3.cmd).toBe('show frame header');
    expect(step3.title).toBe('Tagging and untagging: computers never see tags');
    expect(step3.what).toContain('strips the 802.1Q tag off completely');

    const step4 = mod!.steps[3];
    expect(step4.cmd).toBe('show trunk native');
    expect(step4.what).toContain('Native VLAN');

    const step5 = mod!.steps[4];
    expect(step5.cmd).toBe('ping 192.168.10.30');
    expect(step5.title).toBe('Testing cross-switch communication');
    expect(step5.what).toContain('192.168.10.30');

    const step6 = mod!.steps[5];
    expect(step6.cmd).toBeNull();
    expect(step6.title).toBe('The four rules of VLAN trunks');
  });

  it('Day 12 module has exact title, 6 steps, and authentic Router-on-a-Stick commands', () => {
    const mod = getNetworkingModule('net-12');
    expect(mod).toBeDefined();
    expect(mod?.id).toBe('net-12');
    expect(mod?.title).toBe('Day 12 · Routing Between VLANs: Router-on-a-Stick');
    expect(mod?.steps).toHaveLength(6);

    const step1 = mod!.steps[0];
    expect(step1.title).toBe('Isolated VLANs need a router');
    expect(step1.cmd).toBe('ping 192.168.20.20');
    expect(step1.what).toContain('100% packet loss');

    const step2 = mod!.steps[1];
    expect(step2.cmd).toBe('show router interfaces');
    expect(step2.title).toBe('Router-on-a-Stick: one cable, multiple VLANs');
    expect(step2.what).toContain('802.1Q trunk link');

    const step3 = mod!.steps[2];
    expect(step3.cmd).toBe('create subif eth0.10 10 192.168.10.1/24');
    expect(step3.title).toBe('Sub-interfaces: dividing a physical port');
    expect(step3.what).toContain('sub-interface');

    const step4 = mod!.steps[3];
    expect(step4.cmd).toBe('create subif eth0.20 20 192.168.20.1/24');
    expect(step4.title).toBe('Configuring the VLAN 20 sub-interface');
    expect(step4.what).toContain('eth0.20');

    const step5 = mod!.steps[4];
    expect(step5.cmd).toBe('ping 192.168.20.20');
    expect(step5.title).toBe('The hairpin route: how traffic flows');
    expect(step5.what).toContain('decrements the TTL');

    const step6 = mod!.steps[5];
    expect(step6.cmd).toBeNull();
    expect(step6.title).toBe('The four rules of Inter-VLAN routing');
  });

  it('Day 13 module has exact title, 6 steps, and authentic Spanning Tree commands', () => {
    const mod = getNetworkingModule('net-13');
    expect(mod).toBeDefined();
    expect(mod?.id).toBe('net-13');
    expect(mod?.title).toBe('Day 13 · Loops and Spanning Tree: Preventing Broadcast Storms');
    expect(mod?.steps).toHaveLength(6);

    const step1 = mod!.steps[0];
    expect(step1.title).toBe('Redundant links create Layer 2 loops');
    expect(step1.cmd).toBe('test broadcast loop');
    expect(step1.what).toContain('Layer 2 Ethernet headers contain no TTL');

    const step2 = mod!.steps[1];
    expect(step2.cmd).toBe('show mac-flapping');
    expect(step2.title).toBe('Broadcast storms and MAC table flapping');
    expect(step2.what).toContain('Broadcast Storm');
    expect(step2.what).toContain('MAC Table Flapping');

    const step3 = mod!.steps[2];
    expect(step3.cmd).toBe('enable stp');
    expect(step3.title).toBe('Spanning Tree Protocol and BPDUs');
    expect(step3.what).toContain('Bridge Protocol Data Units');
    expect(step3.what).toContain('01:80:C2:00:00:00');

    const step4 = mod!.steps[3];
    expect(step4.cmd).toBe('show spanning-tree');
    expect(step4.title).toBe('Bridge ID and the Root Bridge election');
    expect(step4.what).toContain('Bridge ID');
    expect(step4.what).toContain('Root Bridge');

    const step5 = mod!.steps[4];
    expect(step5.cmd).toBe('show spanning-tree ports');
    expect(step5.title).toBe('Port roles: Root, Designated, and Blocking');
    expect(step5.what).toContain('Blocking state');

    const step6 = mod!.steps[5];
    expect(step6.cmd).toBeNull();
    expect(step6.title).toBe('The four rules of Spanning Tree Protocol');
  });

  it('Day 14 module has exact title, 6 steps, and authentic ICMP/TTL commands', () => {
    const mod = getNetworkingModule('net-14');
    expect(mod).toBeDefined();
    expect(mod?.id).toBe('net-14');
    expect(mod?.title).toBe('Day 14 · ICMP and TTL: How Ping Works');
    expect(mod?.steps).toHaveLength(6);

    const step1 = mod!.steps[0];
    expect(step1.title).toBe('ICMP: The network diagnostic companion');
    expect(step1.cmd).toBe('ping 198.51.100.10 -c 1');
    expect(step1.what).toContain('Protocol number 1');
    expect(step1.what).toContain('Type 8 (Echo Request)');
    expect(step1.what).toContain('Type 0 (Echo Reply)');

    const step2 = mod!.steps[1];
    expect(step2.cmd).toBe('show packet header');
    expect(step2.title).toBe('The loop killer: IPv4 Time-To-Live (TTL)');
    expect(step2.what).toContain('8-bit Time-To-Live (TTL) field');
    expect(step2.what).toContain('Router Invariant');

    const step3 = mod!.steps[2];
    expect(step3.cmd).toBe('ping 198.51.100.10 -t 1');
    expect(step3.title).toBe('ICMP Type 11: Time Exceeded in Transit');
    expect(step3.what).toContain('ICMP Type 11 Code 0');
    expect(step3.what).toContain('Time to Live Exceeded in Transit');

    const step4 = mod!.steps[3];
    expect(step4.cmd).toBe('traceroute 198.51.100.10');
    expect(step4.title).toBe('Mapping the Internet: The Traceroute Algorithm');
    expect(step4.what).toContain('Van Jacobson');
    expect(step4.what).toContain('Traceroute Algorithm');

    const step5 = mod!.steps[4];
    expect(step5.cmd).toBe('ping 198.51.100.10 -s 1472 -d');
    expect(step5.title).toBe('ICMP Type 3 Code 4: Path MTU Discovery');
    expect(step5.what).toContain('Path MTU Discovery');
    expect(step5.what).toContain('Fragmentation Needed and DF Set');

    const step6 = mod!.steps[5];
    expect(step6.cmd).toBeNull();
    expect(step6.title).toBe('The four rules of ICMP and TTL');
  });

  it('Day 15 module has exact title, 5 steps, and authentic Traceroute commands', () => {
    const mod = getNetworkingModule('net-15');
    expect(mod).toBeDefined();
    expect(mod?.id).toBe('net-15');
    expect(mod?.title).toBe(
      'Day 15 · Traceroute: Following the Path Across the Internet'
    );
    expect(mod?.steps).toHaveLength(5);

    const step1 = mod!.steps[0];
    expect(step1.title).toBe('Why Traceroute sends three probes per hop');
    expect(step1.cmd).toBe('traceroute 198.51.100.10');
    expect(step1.what).toContain('three sequential probe packets');
    expect(step1.what).toContain('starting at 33434');

    const step2 = mod!.steps[1];
    expect(step2.cmd).toBe('show fiber links');
    expect(step2.title).toBe('RTT jumps: Optical fiber and propagation delay');
    expect(step2.what).toContain('speed of light');
    expect(step2.what).toContain('~5 microseconds per kilometer');

    const step3 = mod!.steps[2];
    expect(step3.cmd).toBe('traceroute 198.51.100.50');
    expect(step3.title).toBe(
      'The * * * mystery: Control Plane Policing (CoPP)'
    );
    expect(step3.what).toContain('Control Plane Policing (CoPP)');
    expect(step3.what).toContain('ICMP Rate Limiting');

    const step4 = mod!.steps[3];
    expect(step4.cmd).toBe('show return path');
    expect(step4.title).toBe('Asymmetric routing: The return path paradox');
    expect(step4.what).toContain('Asymmetric Routing');
    expect(step4.what).toContain('Border Gateway Protocol (BGP)');

    const step5 = mod!.steps[4];
    expect(step5.cmd).toBeNull();
    expect(step5.title).toBe('The four rules of traceroute and internet paths');
  });

  it('Day 16 module has exact title, 5 steps, and authentic Layer 4 port commands', () => {
    const mod = getNetworkingModule('net-16');
    expect(mod).toBeDefined();
    expect(mod?.id).toBe('net-16');
    expect(mod?.title).toBe('Day 16 · Ports: Reaching the Right Program');
    expect(mod?.steps).toHaveLength(5);

    const step1 = mod!.steps[0];
    expect(step1.title).toBe('Host-to-host vs process-to-process delivery');
    expect(step1.cmd).toBe('ss -tlpn');
    expect(step1.what).toContain('strictly a host-to-host delivery protocol');
    expect(step1.what).toContain(
      'Transport Layer (Layer 4) solves this problem by adding Port Numbers'
    );

    const step2 = mod!.steps[1];
    expect(step2.cmd).toBe('show ip-port-range');
    expect(step2.title).toBe('Well-known, registered, and ephemeral ports');
    expect(step2.what).toContain('RFC 6335');
    expect(step2.what).toContain('Well-Known Ports (0 – 1023)');

    const step3 = mod!.steps[2];
    expect(step3.cmd).toBe('ss -t4 state established');
    expect(step3.title).toBe(
      'The socket 5-tuple: Demultiplexing concurrent streams'
    );
    expect(step3.what).toContain('5-Tuple');
    expect(step3.what).toContain('Demultiplexing');

    const step4 = mod!.steps[3];
    expect(step4.cmd).toBe('nc -zv 198.51.100.10 80 81');
    expect(step4.title).toBe('Header byte layout and closed port responses');
    expect(step4.what).toContain('Bytes 0–1');
    expect(step4.what).toContain('RST (Reset)');
    expect(step4.what).toContain('ICMP Type 3 Code 3');

    const step5 = mod!.steps[4];
    expect(step5.cmd).toBeNull();
    expect(step5.title).toBe('The four rules of ports and sockets');
  });

  it('Day 17 module has exact title, 5 steps, and authentic TCP connection lifecycle commands', () => {
    expect(NET_17_MODULE).toBeDefined();
    expect(NET_17_MODULE.id).toBe('net-17');
    expect(NET_17_MODULE.title).toBe(
      'Day 17 · TCP: Opening and Closing a Connection'
    );
    expect(NET_17_MODULE.steps).toHaveLength(5);

    const step1 = NET_17_MODULE.steps[0];
    expect(step1.title).toBe(
      'The need for connection state and Initial Sequence Numbers (ISN)'
    );
    expect(step1.cmd).toBe('tcp connect 198.51.100.10:80');
    expect(step1.what).toContain('Initial Sequence Number (ISN)');
    expect(step1.what).toContain('RFC 6528');

    const step2 = NET_17_MODULE.steps[1];
    expect(step2.cmd).toBe('ss -tan state established');
    expect(step2.title).toBe(
      'SYN → SYN-ACK → ACK: Why three packets are mandatory'
    );
    expect(step2.what).toContain(
      'The fundamental law of TCP connection setup is the 3-Way Handshake'
    );
    expect(step2.what).toContain("Why Couldn't We Use a 2-Way Handshake?");

    const step3 = NET_17_MODULE.steps[2];
    expect(step3.cmd).toBe('tcp close 198.51.100.10:80');
    expect(step3.title).toBe(
      'FIN → ACK → FIN → ACK: Full-duplex graceful termination'
    );
    expect(step3.what).toContain('Full-Duplex');
    expect(step3.what).toContain('CLOSE_WAIT');

    const step4 = NET_17_MODULE.steps[3];
    expect(step4.cmd).toBe('ss -tan state time-wait');
    expect(step4.title).toBe('Why TIME_WAIT exists: The 2MSL safety timer');
    expect(step4.what).toContain('2MSL');
    expect(step4.what).toContain('Maximum Segment Lifetime');

    const step5 = NET_17_MODULE.steps[4];
    expect(step5.cmd).toBeNull();
    expect(step5.title).toBe('The four rules of TCP connection management');
    expect(step5.what).toContain('TCP provides ordered, full-duplex reliability');
  });

  it('Day 18 module has exact title, 5 steps, and authentic TCP reliable delivery commands', () => {
    expect(NET_18_MODULE).toBeDefined();
    expect(NET_18_MODULE.id).toBe('net-18');
    expect(NET_18_MODULE.title).toBe('Day 18 · TCP: Reliable Delivery');
    expect(NET_18_MODULE.steps).toHaveLength(5);

    const step1 = NET_18_MODULE.steps[0];
    expect(step1.title).toBe(
      'Byte-stream sequence numbers and cumulative acknowledgments'
    );
    expect(step1.cmd).toBe('tcp send "GET /data HTTP/1.1"');
    expect(step1.what).toContain('Cumulative');
    expect(step1.what).toContain('ISN');

    const step2 = NET_18_MODULE.steps[1];
    expect(step2.cmd).toBe('tcp drop-simulate --loss 100');
    expect(step2.title).toBe(
      "Packet loss detection: Jacobson's dynamic RTO and Karn's backoff"
    );
    expect(step2.what).toContain('Smoothed RTT');
    expect(step2.what).toContain('Exponential Backoff');

    const step3 = NET_18_MODULE.steps[2];
    expect(step3.cmd).toBe('ss -ti');
    expect(step3.title).toBe(
      'Fast Retransmit (3 Duplicate ACKs) and Selective Acknowledgment (SACK)'
    );
    expect(step3.what).toContain('3 Duplicate ACKs');
    expect(step3.what).toContain('SACK');

    const step4 = NET_18_MODULE.steps[3];
    expect(step4.cmd).toBe('ss -tan -o');
    expect(step4.title).toBe(
      'Flow control, the Advertised Receive Window (win), and Zero-Window Probes'
    );
    expect(step4.what).toContain('Advertised Receive Window');
    expect(step4.what).toContain('Zero-Window Probe');

    const step5 = NET_18_MODULE.steps[4];
    expect(step5.cmd).toBeNull();
    expect(step5.title).toBe('The four core invariants of TCP reliable delivery');
    expect(step5.what).toContain('ordered, lossless byte stream');
  });

  it('Roadmap contains 9 stages and 35 total days', () => {
    expect(NETWORKING_ROADMAP_STAGES).toHaveLength(9);
    const totalDays = NETWORKING_ROADMAP_STAGES.reduce(
      (acc, s) => acc + s.days.length,
      0
    );
    expect(totalDays).toBe(35);

    expect(getNetworkingModule('net-01')).toBeDefined();
    expect(getNetworkingModule(2)?.id).toBe('net-02');
    expect(getNetworkingModule('Day 3')?.id).toBe('net-03');
    expect(getNetworkingModule(4)?.id).toBe('net-04');
    expect(getNetworkingModule(5)?.id).toBe('net-05');
    expect(getNetworkingModule(6)?.id).toBe('net-06');
    expect(getNetworkingModule(7)?.id).toBe('net-07');
    expect(getNetworkingModule(8)?.id).toBe('net-08');
    expect(getNetworkingModule(9)?.id).toBe('net-09');
    expect(getNetworkingModule(10)?.id).toBe('net-10');
    expect(getNetworkingModule(11)?.id).toBe('net-11');
    expect(getNetworkingModule(12)?.id).toBe('net-12');
    expect(getNetworkingModule(13)?.id).toBe('net-13');
    expect(getNetworkingModule(14)?.id).toBe('net-14');
    expect(getNetworkingModule(15)?.id).toBe('net-15');
    expect(getNetworkingModule(16)?.id).toBe('net-16');
    expect(getNetworkingModule(17)?.id).toBe('net-17');
    expect(getNetworkingModule(18)?.id).toBe('net-18');
  });
});

