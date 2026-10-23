import { describe, it, expect } from 'vitest';
import {
  NET_01_MODULE,
  NET_02_MODULE,
  NET_03_MODULE,
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

  it('Roadmap contains 4 stages and 12 total days', () => {
    expect(NETWORKING_ROADMAP_STAGES).toHaveLength(4);
    const totalDays = NETWORKING_ROADMAP_STAGES.reduce(
      (acc, s) => acc + s.days.length,
      0
    );
    expect(totalDays).toBe(12);

    expect(getNetworkingModule('net-01')).toBeDefined();
    expect(getNetworkingModule(2)?.id).toBe('net-02');
    expect(getNetworkingModule('Day 3')?.id).toBe('net-03');
  });
});
