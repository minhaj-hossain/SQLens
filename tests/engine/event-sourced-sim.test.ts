import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest';
import {
  createInitialAcmeOfficeState,
} from '../../src/lib/network-engine/fixtures/acme-office-m1';
import {
  reduceSimulationState,
  reduceActionLog,
  saveEngineSession,
  loadEngineSession,
  ENGINE_STORAGE_KEY_V1,
} from '../../src/lib/network-engine/reducer';
import type { LearnerActionEvent } from '../../src/lib/network-engine/types';

function installFakeWebStorage() {
  const store = new Map<string, string>();
  const fake = {
    get length() { return store.size; },
    key: (i: number) => Array.from(store.keys())[i] ?? null,
    getItem: (k: string) => (store.has(k) ? (store.get(k) as string) : null),
    setItem: (k: string, v: string) => { store.set(k, String(v)); },
    removeItem: (k: string) => { store.delete(k); },
    clear: () => { store.clear(); },
  };
  const g = globalThis as unknown as Record<string, unknown>;
  g.localStorage = fake;
  g.window = { localStorage: fake };
}

describe('Network Engine — Event-Sourced Reducer & Parity Test', () => {
  let initialState = createInitialAcmeOfficeState();

  beforeAll(() => {
    installFakeWebStorage();
  });

  afterAll(() => {
    const g = globalThis as unknown as Record<string, unknown>;
    delete g.localStorage;
    delete g.window;
  });

  beforeEach(() => {
    initialState = createInitialAcmeOfficeState();
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
  });

  it('initial state has disconnected patch cable and link down', () => {
    expect(initialState.devices['host-a'].interfaces.eth0.linkState).toBe('down');
    expect(initialState.links['cable-hostA-sw1'].status).toBe('disconnected');
    expect(initialState.devices['host-a'].arpTable).toEqual({});
  });

  it('truthfully outputs transmit failed when pinging with cable unplugged (Beat 1)', () => {
    const action: LearnerActionEvent = {
      id: 'a1',
      logicalTick: 1,
      type: 'RUN_COMMAND',
      command: 'ping 192.168.1.1',
    };
    const nextState = reduceSimulationState(initialState, action);

    expect(nextState.terminalHistory).toHaveLength(1);
    expect(nextState.terminalHistory[0].output).toContain('PING: transmit failed. General failure.');
    expect(nextState.terminalHistory[0].output).toContain('100% loss');
  });

  it('truthfully outputs Media disconnected when ipconfig is run while link is down (Beat 2)', () => {
    const action: LearnerActionEvent = {
      id: 'a2',
      logicalTick: 1,
      type: 'RUN_COMMAND',
      command: 'ipconfig',
    };
    const nextState = reduceSimulationState(initialState, action);

    expect(nextState.terminalHistory[0].output).toContain('Media disconnected');
  });

  it('seats the Cat6 patch cable and brings Layer 1 carrier UP (Beat 3)', () => {
    const seatAction: LearnerActionEvent = {
      id: 'a3',
      logicalTick: 1,
      type: 'SEAT_CABLE',
      linkId: 'cable-hostA-sw1',
    };
    const seatedState = reduceSimulationState(initialState, seatAction);

    expect(seatedState.links['cable-hostA-sw1'].status).toBe('carrier-active');
    expect(seatedState.devices['host-a'].interfaces.eth0.linkState).toBe('up');
    expect(seatedState.devices['sw1'].interfaces['port-1'].linkState).toBe('up');
  });

  it('displays static IPv4 configuration once cable is seated (Beat 4)', () => {
    const actions: LearnerActionEvent[] = [
      { id: 'a1', logicalTick: 1, type: 'SEAT_CABLE', linkId: 'cable-hostA-sw1' },
      { id: 'a2', logicalTick: 2, type: 'RUN_COMMAND', command: 'ipconfig' },
    ];
    const state = reduceActionLog(initialState, actions);

    expect(state.terminalHistory[0].output).toContain('IPv4 Address. . . . . . . . . . . : 192.168.1.10');
    expect(state.terminalHistory[0].output).toContain('Subnet Mask . . . . . . . . . . . : 255.255.255.0');
    expect(state.terminalHistory[0].output).toContain('Default Gateway . . . . . . . . . : 192.168.1.1');
  });

  it('returns No ARP Entries Found prior to ping (Beat 5)', () => {
    const actions: LearnerActionEvent[] = [
      { id: 'a1', logicalTick: 1, type: 'SEAT_CABLE', linkId: 'cable-hostA-sw1' },
      { id: 'a2', logicalTick: 2, type: 'RUN_COMMAND', command: 'arp -a' },
    ];
    const state = reduceActionLog(initialState, actions);

    expect(state.terminalHistory[0].output).toContain('No ARP Entries Found.');
  });

  it('completes dynamic ARP resolution and receives 4 ICMP replies on ping (Beat 6 & 7)', () => {
    const actions: LearnerActionEvent[] = [
      { id: 'a1', logicalTick: 1, type: 'SEAT_CABLE', linkId: 'cable-hostA-sw1' },
      { id: 'a2', logicalTick: 2, type: 'RUN_COMMAND', command: 'ping 192.168.1.1' },
      { id: 'a3', logicalTick: 3, type: 'RUN_COMMAND', command: 'arp -a' },
    ];
    const state = reduceActionLog(initialState, actions);

    // Ping output has 4 replies, 0% loss
    expect(state.terminalHistory[0].output).toContain('Reply from 192.168.1.1: bytes=32 time<1ms TTL=64');
    expect(state.terminalHistory[0].output).toContain('0% loss');

    // ARP table is dynamically populated
    expect(state.devices['host-a'].arpTable['192.168.1.1']).toBeDefined();
    expect(state.devices['host-a'].arpTable['192.168.1.1'].mac).toBe('00-1A-2B-3C-4D-01');

    // arp -a output shows dynamic entry
    expect(state.terminalHistory[1].output).toContain('192.168.1.1');
    expect(state.terminalHistory[1].output).toContain('00-1a-2b-3c-4d-01');
    expect(state.terminalHistory[1].output).toContain('dynamic');
  });

  it('guarantees pure reducer idempotency: replay produced identical state', () => {
    const log: LearnerActionEvent[] = [
      { id: 'a1', logicalTick: 1, type: 'RUN_COMMAND', command: 'ping 192.168.1.1' },
      { id: 'a2', logicalTick: 2, type: 'RUN_COMMAND', command: 'ipconfig' },
      { id: 'a3', logicalTick: 3, type: 'SEAT_CABLE', linkId: 'cable-hostA-sw1' },
      { id: 'a4', logicalTick: 4, type: 'RUN_COMMAND', command: 'ipconfig' },
      { id: 'a5', logicalTick: 5, type: 'RUN_COMMAND', command: 'ping 192.168.1.1' },
      { id: 'a6', logicalTick: 6, type: 'RUN_COMMAND', command: 'arp -a' },
    ];

    const stateLive = reduceActionLog(initialState, log);
    const stateReplayed = reduceActionLog(createInitialAcmeOfficeState(), log);

    expect(stateLive.devices).toEqual(stateReplayed.devices);
    expect(stateLive.links).toEqual(stateReplayed.links);
    expect(stateLive.terminalHistory).toEqual(stateReplayed.terminalHistory);
  });

  it('persists and rehydrates session via localStorage under sqlens_net_action_log_net01_v1', () => {
    const log: LearnerActionEvent[] = [
      { id: 'a1', logicalTick: 1, type: 'SEAT_CABLE', linkId: 'cable-hostA-sw1' },
      { id: 'a2', logicalTick: 2, type: 'RUN_COMMAND', command: 'ping 192.168.1.1' },
    ];

    saveEngineSession({
      engineSchemaVersion: 1,
      scriptVersion: '1.0.0',
      actionLog: log,
    });

    const loaded = loadEngineSession();
    expect(loaded).toBeDefined();
    expect(loaded!.engineSchemaVersion).toBe(1);
    expect(loaded!.scriptVersion).toBe('1.0.0');
    expect(loaded!.actionLog).toEqual(log);

    const rehydrated = reduceActionLog(createInitialAcmeOfficeState(), loaded!.actionLog);
    expect(rehydrated.links['cable-hostA-sw1'].status).toBe('carrier-active');
    expect(rehydrated.devices['host-a'].arpTable['192.168.1.1'].mac).toBe('00-1A-2B-3C-4D-01');
  });
});
