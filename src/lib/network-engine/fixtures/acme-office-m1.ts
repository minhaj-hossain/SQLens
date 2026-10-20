import type { SimulationState } from '../types';

export function createInitialAcmeOfficeState(): SimulationState {
  return {
    logicalClock: 0,
    devices: {
      'host-a': {
        id: 'host-a',
        name: 'Acme-PC-01',
        role: 'workstation',
        interfaces: {
          eth0: {
            id: 'eth0',
            mac: '00-1A-2B-3C-4D-10',
            ipConfig: {
              mode: 'static',
              ip: '192.168.1.10',
              mask: '255.255.255.0',
              gateway: '192.168.1.1',
            },
            connectedLinkId: 'cable-hostA-sw1',
            linkState: 'down',
            linkSpeedMbps: 1000,
          },
        },
        arpTable: {},
      },
      sw1: {
        id: 'sw1',
        name: 'Acme-SW-01',
        role: 'switch',
        interfaces: {
          'port-1': {
            id: 'port-1',
            mac: '00-1A-2B-3C-4D-S1',
            connectedLinkId: 'cable-hostA-sw1',
            linkState: 'down',
            linkSpeedMbps: 1000,
          },
          'port-2': {
            id: 'port-2',
            mac: '00-1A-2B-3C-4D-S2',
            connectedLinkId: 'cable-sw1-r1',
            linkState: 'up',
            linkSpeedMbps: 1000,
          },
        },
        arpTable: {},
      },
      r1: {
        id: 'r1',
        name: 'Acme-RTR-01',
        role: 'router',
        interfaces: {
          'gi0/0': {
            id: 'gi0/0',
            mac: '00-1A-2B-3C-4D-01',
            ipConfig: {
              mode: 'static',
              ip: '192.168.1.1',
              mask: '255.255.255.0',
            },
            connectedLinkId: 'cable-sw1-r1',
            linkState: 'up',
            linkSpeedMbps: 1000,
          },
        },
        arpTable: {
          // Router knows its own interface IP
        },
      },
    },
    links: {
      'cable-hostA-sw1': {
        id: 'cable-hostA-sw1',
        type: 'cat6-utp',
        endpointA: { deviceId: 'host-a', interfaceId: 'eth0', isSeated: false },
        endpointB: { deviceId: 'sw1', interfaceId: 'port-1', isSeated: true },
        status: 'disconnected',
      },
      'cable-sw1-r1': {
        id: 'cable-sw1-r1',
        type: 'cat6-utp',
        endpointA: { deviceId: 'sw1', interfaceId: 'port-2', isSeated: true },
        endpointB: { deviceId: 'r1', interfaceId: 'gi0/0', isSeated: true },
        status: 'carrier-active',
      },
    },
    packetTrace: [],
    actionLog: [],
    activeBeatId: 'beat-1',
    terminalHistory: [],
    slowMotionStep: 0,
  };
}
