// Core General Network Engine Types (src/lib/network-engine/types.ts)
// Strict JSON serializable: No Map, No ArrayBuffer, No Date.now()

export type MacAddress = string; // e.g. "00-1A-2B-3C-4D-10"
export type Ipv4Address = string; // e.g. "192.168.1.10"
export type SubnetMask = string; // e.g. "255.255.255.0"

export interface NetworkDevice {
  id: string; // e.g. "host-a", "sw1", "r1"
  name: string; // e.g. "Acme-PC-01"
  role: 'workstation' | 'switch' | 'router' | 'server';
  interfaces: Record<string, DeviceInterface>;
  // Fully serializable JSON record (no Map)
  arpTable: Record<Ipv4Address, { mac: MacAddress; type: 'dynamic' | 'static'; learnedAtTick: number }>;
  routeTable?: Array<{ destination: Ipv4Address; mask: SubnetMask; nextHop?: Ipv4Address; interfaceId: string }>;
}

export interface DeviceInterface {
  id: string; // e.g. "eth0", "gi0/0", "port-1"
  mac: MacAddress;
  ipConfig?: {
    mode: 'static' | 'dhcp';
    ip: Ipv4Address;
    mask: SubnetMask;
    gateway?: Ipv4Address;
  };
  connectedLinkId?: string;
  linkState: 'down' | 'negotiating' | 'up';
  linkSpeedMbps: number;
}

export interface PhysicalLink {
  id: string; // e.g. "cable-hostA-sw1"
  type: 'cat6-utp' | 'fiber' | 'internal';
  endpointA: { deviceId: string; interfaceId: string; isSeated: boolean };
  endpointB: { deviceId: string; interfaceId: string; isSeated: boolean };
  status: 'disconnected' | 'carrier-active' | 'faulty';
}

export interface EthernetFrame {
  destMac: MacAddress;
  sourceMac: MacAddress;
  etherType: '0x0800' | '0x0806' | '0x86DD';
  payloadHex: string; // Pure hex string representation, fully serializable
  fcsValid: boolean;
  description?: string;
}

export type LearnerActionEvent =
  | { id: string; logicalTick: number; type: 'RUN_COMMAND'; command: string; output?: string }
  | { id: string; logicalTick: number; type: 'SEAT_CABLE'; linkId: string }
  | { id: string; logicalTick: number; type: 'UNSEAT_CABLE'; linkId: string }
  | { id: string; logicalTick: number; type: 'SELECT_CHIP'; chipId: string; value: string }
  | { id: string; logicalTick: number; type: 'CONTINUE'; beatId: string }
  | { id: string; logicalTick: number; type: 'ENTER_REVIEW'; targetBeatId: string }
  | { id: string; logicalTick: number; type: 'REPLAY_CHECKPOINT'; targetBeatId: string };

export interface CommandExecutionResult {
  stdout: string;
  exitCode: number;
  emittedFrames?: EthernetFrame[];
  outcome:
    | 'SUCCESS'
    | 'TRANSMIT_FAIL_NO_CARRIER'
    | 'REQUEST_TIMED_OUT'
    | 'MEDIA_DISCONNECTED'
    | 'ARP_EMPTY'
    | 'ARP_RESOLVED'
    | 'UNKNOWN_COMMAND';
}

export interface SimulationState {
  logicalClock: number; // Integer tick counter (no Date.now())
  devices: Record<string, NetworkDevice>;
  links: Record<string, PhysicalLink>;
  packetTrace: EthernetFrame[];
  actionLog: LearnerActionEvent[];
  activeBeatId: string;
  terminalHistory: Array<{ command: string; output: string }>;
  slowMotionStep?: number; // 0: Idle, 1: ARP Broadcast, 2: ARP Reply, 3: ICMP Echo
}

export interface SavedEngineSession {
  engineSchemaVersion: 1;
  scriptVersion: '1.0.0';
  actionLog: LearnerActionEvent[];
}
