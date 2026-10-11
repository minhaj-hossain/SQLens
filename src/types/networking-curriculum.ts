import type {
  HostNode,
  FrameTransmission,
  SwitchDecision,
  MacTableEntry,
  SimulationStep,
  PortState,
} from '../lib/network-engine/switching-sim';

export type {
  HostNode,
  FrameTransmission,
  SwitchDecision,
  MacTableEntry,
  SimulationStep,
  PortState,
};

export interface NetworkingPredictionOption {
  label: string;
  egressPorts: number[];
  decision?: SwitchDecision;
  misconceptionExplanation?: string;
}

export interface SubnetFieldDef {
  id: string;
  label: string;
  placeholder?: string;
  type?: 'text' | 'number' | 'select' | 'radio';
  options?: { label: string; value: string }[];
  expected: string | number;
  helperText?: string;
  misconceptions?: {
    testPattern?: string;
    feedback: string;
  }[];
}

export interface SubnettingTaskContent {
  stage: 1 | 2 | 3 | 4 | 5;
  targetIp: string;
  prefix: number;
  isInteractive?: boolean;
  isCollapsed?: boolean;
  fields?: SubnetFieldDef[];
  reflectionPrompt?: string;
  modelExplanation?: string;
  routerOnAStick?: {
    trunkPort: number;
    subinterfaces: { id: string; vlan: number; ip: string; mac: string }[];
    hosts: { name: string; ip: string; port: number; vlan: number }[];
  };
  diagnostics?: {
    terminalOutput: string;
    routeTableOutput: string;
    pingOutput: string;
  };
}

export interface ArpHost {
  name: string;
  ip: string;
  mac: string;
  port: number;
}

export interface ArpPacketHeader {
  hwType?: string;
  protoType?: string;
  hwSize?: number;
  protoSize?: number;
  opcode: 1 | 2; // 1 = Request, 2 = Reply
  senderMac: string;
  senderIp: string;
  targetMac: string;
  targetIp: string;
}

export interface ArpSimulationStep {
  stepNumber: number;
  title: string;
  description: string;
  activePacket?: {
    type: 'ARP_REQUEST' | 'ARP_REPLY' | 'IP_PACKET';
    sourceHost: string;
    targetHost?: string;
    ethernetDst: string;
    arp?: ArpPacketHeader;
  };
  queuedPacket?: {
    type: string;
    sourceIp: string;
    destIp: string;
    status: 'QUEUED_WAITING_FOR_ARP' | 'DEQUEUED_TRANSMITTING' | 'RESOLVED';
  };
  switchCamTable: { port: number; mac: string }[];
  hostArpTable: { host: string; ip: string; mac: string }[];
  highlightPort?: number[];
}

export interface ArpTaskContent {
  stage: 1 | 2 | 3 | 4 | 5;
  sourceHost: ArpHost;
  targetHost: ArpHost;
  gatewayHost?: ArpHost;
  allHosts: ArpHost[];
  queuedPacketDescription?: string;
  simulationSteps?: ArpSimulationStep[];
  isInteractive?: boolean;
  isCollapsed?: boolean;
  fields?: SubnetFieldDef[];
  diagnostics?: {
    arpTableOutput: string;
    pcapOutput: string;
    pingOutput: string;
  };
}

export interface NetworkingTaskContent {
  topology: HostNode[];
  initialSequence?: FrameTransmission[];
  pendingTransmission: FrameTransmission;
  expectedDecision: SwitchDecision;
  expectedEgressPorts: number[];
  options: NetworkingPredictionOption[];
  correctOptionIndex: number;
  explanation: string;
  governingRule: string;
  misconceptionRemediation?: Record<number, string>;
}

export interface Layer2Header {
  srcMac: string;
  dstMac: string;
  etherType: string;
  vlanTag?: {
    tpid: string;
    vlanId: number;
    priority?: number;
  };
  fcs?: string;
}

export interface Layer3Header {
  version: 4 | 6;
  srcIp: string;
  dstIp: string;
  ttl?: number;
  protocol: string;
  tosDscp?: string;
  totalLength?: number;
  identification?: string;
  flags?: string;
  headerChecksum?: string;
}

export interface Layer4Header {
  type: 'TCP' | 'UDP' | 'ICMP';
  srcPort?: number;
  dstPort?: number;
  seqNum?: number;
  ackNum?: number;
  flags?: {
    syn?: boolean;
    ack?: boolean;
    fin?: boolean;
    rst?: boolean;
    psh?: boolean;
    urg?: boolean;
  };
  windowSize?: number;
  checksum?: string;
  icmpType?: string;
  icmpCode?: number;
}

export interface Layer7Payload {
  protocol: string;
  summary: string;
  data?: Record<string, string | number | boolean>;
  rawHex?: string;
}

export interface PacketSnapshot {
  hopLabel: string;
  deviceType?: 'Host' | 'Switch' | 'Router' | 'Firewall';
  layer2: Layer2Header;
  layer3: Layer3Header;
  layer4?: Layer4Header;
  layer7?: Layer7Payload;
}

export interface PacketInspectionTaskContent {
  title?: string;
  description?: string;
  snapshots: PacketSnapshot[];
  highlightedModifications?: {
    layer: 'L2' | 'L3' | 'L4' | 'L7';
    field: string;
    description: string;
    beforeValue: string;
    afterValue: string;
  }[];
  isComparative?: boolean;
}

export interface TerminalScenario {
  hostname?: string;
  userPrompt?: string;
  currentIp?: string;
  subnetMask?: string;
  gatewayIp?: string;
  dnsServer?: string;
  macAddress?: string;
  initialLines?: string[];
  initialHistory?: string[];
  commandResponses?: Record<string, string>;
  customResponses?: Record<string, string[]>;
  availableCommands?: string[];
  suggestedCommands?: string[];
}

export interface EthernetVlanTag {
  tpid: string; // '0x8100'
  pcp: number; // 0-7 (Priority Code Point)
  dei: number; // 0 or 1 (Drop Eligible Indicator)
  vid: number; // 1-4094 (VLAN Identifier)
}

export interface EthernetFrameTaskContent {
  title?: string;
  description?: string;
  destinationMac?: string;
  sourceMac?: string;
  etherType?: string; // e.g. '0x0800', '0x86DD', '0x0806'
  payloadProtocol?: string; // e.g. 'IPv4 Datagram', 'ARP Request', 'IPv6 Datagram'
  initialPayloadSize?: number; // bytes (e.g. 1500 or 40)
  minPayloadSize?: number; // default: 10
  maxPayloadSize?: number; // default: 1500
  vlanTag?: EthernetVlanTag;
  hasVlanTag?: boolean;
  initialCorrupted?: boolean;
  corruptedField?: 'dstMac' | 'srcMac' | 'etherType' | 'payload' | 'fcs';
  explanationNotes?: string[];
}

