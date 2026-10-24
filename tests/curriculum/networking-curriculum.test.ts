import { describe, it, expect } from 'vitest';
import {
  NET_01_MODULE,
  NET_02_MODULE,
  NET_03_MODULE,
  NET_04_MODULE,
  NET_05_MODULE,
  NET_06_MODULE,
  NET_07_MODULE,
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
  });
});
