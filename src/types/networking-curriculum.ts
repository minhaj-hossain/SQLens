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

export interface Ipv6NdpTaskContent {
  title?: string;
  description?: string;
  macAddress?: string; // e.g. '3C:22:FB:4A:11:80'
  targetIpv6?: string; // e.g. '2001:db8:1::20'
  routerPrefix?: string; // e.g. '2001:db8:abc::/64'
  defaultMode?: 'eui64' | 'ndp_flow' | 'compression';
  interactiveStep?: number;
  explanationNotes?: string[];
}

export interface DhcpServerInfo {
  name: string;
  serverIp: string;
  serverMac: string;
  offeredIp: string;
  subnetMask: string;
  gateway: string;
  dns: string;
  leaseTimeSeconds: number; // e.g. 28800 (8 hours)
  isRogue?: boolean;
}

export interface DhcpTaskContent {
  title?: string;
  description?: string;
  clientMac?: string;
  clientHostname?: string;
  transactionId?: string; // e.g. '0x39A2F1B0'
  primaryServer?: DhcpServerInfo;
  competingServer?: DhcpServerInfo;
  initialStep?: 1 | 2 | 3 | 4;
  scenarioMode?: 'standard' | 'competing_servers' | 'apipa_timeout';
  leaseSeconds?: number;
}

export interface DnsRecordEntry {
  name: string;
  type: 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT' | 'NS' | 'SOA';
  value: string;
  ttl: number; // seconds
  priority?: number; // for MX
}

export interface DnsResolutionHop {
  tier: 'stub' | 'recursive' | 'root' | 'tld' | 'authoritative';
  serverName: string;
  serverIp: string;
  query: string;
  queryType: string;
  responseType: 'referral' | 'answer' | 'cname_chain' | 'servfail' | 'nxdomain';
  referredServers?: string[];
  records?: DnsRecordEntry[];
  protocol: 'UDP 53' | 'TCP 53';
  isTruncated?: boolean;
  latencyMs: number;
}

export interface DnsTaskContent {
  title?: string;
  description?: string;
  queryDomain?: string; // e.g. 'portal.example.com' or 'api.github.com'
  queryType?: 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT';
  defaultView?: 'hierarchy' | 'cache_comparison' | 'records_table' | 'failure_diagnosis';
  hops?: DnsResolutionHop[];
  records?: DnsRecordEntry[];
  cacheTtlRemaining?: number; // seconds
  isCached?: boolean;
  isTruncated?: boolean; // triggers TCP 53 fallback
  failureCode?: 'NOERROR' | 'NXDOMAIN' | 'SERVFAIL';
  explanationNotes?: string[];
}

export interface TcpSegmentEntry {
  id: string;
  sender: 'client' | 'server';
  flags: ('SYN' | 'ACK' | 'FIN' | 'RST' | 'PSH')[];
  seqNumber: number;
  ackNumber: number;
  payloadLength: number; // bytes
  rwnd: number; // advertised receive window in bytes
  isDropped?: boolean;
  isRetransmission?: boolean;
  isDuplicateAck?: boolean;
  annotation?: string;
}

export interface TcpLadderTaskContent {
  title?: string;
  description?: string;
  clientHost?: string; // default: 'Client (192.168.1.100)'
  serverHost?: string; // default: 'Server (93.184.216.34)'
  clientIsn?: number; // Initial Sequence Number, e.g. 1000
  serverIsn?: number; // Initial Sequence Number, e.g. 5000
  defaultScenario?: 'handshake' | 'data_flow' | 'fast_retransmit' | 'zero_window' | 'teardown';
  segments?: TcpSegmentEntry[];
  simulatedDroppedSegmentId?: string;
  activeRwnd?: number;
  explanationNotes?: string[];
}

export interface HttpStreamEntry {
  id: number;
  name: string; // e.g. 'index.html', 'styles.css', 'app.js', 'logo.png'
  sizeBytes: number;
  packetsTotal: number;
  status: 'pending' | 'in_flight' | 'delivered' | 'blocked' | 'retransmitting';
}

export interface TlsHandshakeHop {
  phase: 'tcp' | 'tls' | 'quic' | 'http';
  roundTrip: number; // e.g. 1, 2, 3
  sender: 'client' | 'server';
  message: string;
  description: string;
  encrypted: boolean;
  cumulativeRtt: number;
}

export interface X509CertificateInfo {
  subject: string;
  issuer: string;
  sanList: string[];
  validFrom: string;
  validTo: string;
  serialNumber: string;
  signatureAlgorithm: string;
  publicKeyInfo: string;
  isIssuerInTrustStore?: boolean;
}

export interface HttpTlsTaskContent {
  title?: string;
  description?: string;
  defaultTab?: 'handshake_latency' | 'hol_blocking' | 'tls13_handshake' | 'pki_certificates';
  rttMs?: number;
  activeProtocol?: 'http1_tls12' | 'http2_tls13' | 'http3_quic' | 'http3_0rtt';
  streams?: HttpStreamEntry[];
  certificate?: X509CertificateInfo;
  targetDomain?: string;
  failureCode?: 'SEC_ERROR_UNKNOWN_ISSUER' | 'ERR_CERT_COMMON_NAME_INVALID' | 'SEC_ERROR_EXPIRED_CERTIFICATE' | 'NONE';
  explanationNotes?: string[];
}

export interface AclRule {
  line: number;
  action: 'permit' | 'deny';
  protocol: 'tcp' | 'udp' | 'icmp' | 'ip';
  source: string; // e.g. '10.0.0.0/24' or 'any'
  destination: string; // e.g. 'host 10.0.0.5' or 'any'
  destPort?: number | string; // e.g. 80, 443, 'any'
  comment?: string;
}

export interface ConntrackEntry {
  id: string;
  protocol: 'tcp' | 'udp' | 'icmp';
  srcIp: string;
  srcPort: number;
  dstIp: string;
  dstPort: number;
  state: 'NEW' | 'ESTABLISHED' | 'RELATED' | 'INVALID';
  timeoutSeconds: number;
}

export interface StpSwitchNode {
  id: string;
  name: string;
  priority: number; // e.g. 4096, 32768
  macAddress: string;
  isRoot?: boolean;
}

export interface StpLink {
  id: string;
  fromSwitch: string;
  fromPort: string;
  toSwitch: string;
  toPort: string;
  cost: number;
  status: 'forwarding' | 'blocking';
}

export interface FirewallTaskContent {
  title?: string;
  description?: string;
  defaultTab?: 'acl_pipeline' | 'stateful_conntrack' | 'stp_topology';
  rules?: AclRule[];
  conntrackEntries?: ConntrackEntry[];
  switches?: StpSwitchNode[];
  links?: StpLink[];
  stpEnabled?: boolean;
  explanationNotes?: string[];
}

export interface VlanConfig {
  id: number;
  name: string;
  color?: string;
}

export interface TrunkPortConfig {
  portName: string;
  mode: 'access' | 'trunk';
  accessVlan?: number;
  allowedVlans?: number[];
  nativeVlan?: number;
}

export interface VlanTrunkPacket {
  id: string;
  sourceHost: string;
  destHost: string;
  sourceIp: string;
  destIp: string;
  vlanId: number;
  isTagged: boolean;
  priority?: number;
  dropEligible?: boolean;
  payload: string;
}

export interface WifiChannelConfig {
  apId: string;
  apName: string;
  channel: number;
  powerDbm?: number;
}

export interface OspfRouterNode {
  id: string;
  name: string;
  routerId: string;
  area?: number;
}

export interface OspfLink {
  id: string;
  fromRouter: string;
  toRouter: string;
  bandwidthMbps: number;
  cost: number;
  failed?: boolean;
}

export interface VlanDijkstraTaskContent {
  title?: string;
  description?: string;
  defaultTab?: 'vlan_trunking' | 'wifi_spectrum' | 'ospf_dijkstra';
  vlans?: VlanConfig[];
  trunkPorts?: TrunkPortConfig[];
  packets?: VlanTrunkPacket[];
  accessPoints?: WifiChannelConfig[];
  referenceBandwidthMbps?: number;
  routers?: OspfRouterNode[];
  links?: OspfLink[];
  sourceRouter?: string;
  explanationNotes?: string[];
}

// ─────────────────────────────────────────────────────────────
// Mentor Mode ("Trainer & Disciple") Runtime Architecture Types
// ─────────────────────────────────────────────────────────────

export type MentorPartId = string;

export interface MentorReactions {
  correct?: string[];
  wrong?: Record<string | number, string[]>;
  fallback?: string[];
  hintAfter?: number;
}

export interface MentorBeatBase {
  id: string;
  say?: string[];              // <= 2 bubbles, ~35 words each, may contain {{term:x}}
  text?: string;               // Unified beat dialogue text
  reveal?: MentorPartId[];     // Parts added to stage in this beat
  revealedParts?: MentorPartId[]; // Cumulative parts visible up to this beat
  spotlight?: MentorPartId;    // Spotlight ring target, or omit
  actionPrompt?: string;       // Interactive CTA button label
  actionTargetPart?: string;   // Element targeted by action
  stage?: { stageNumber?: number; stepIndex?: number; title?: string };
}

export type MentorBeat =
  | (MentorBeatBase & { kind: 'say' | 'point' | 'debrief' })
  | (MentorBeatBase & { 
      kind: 'do'; 
      expect?: 'transmit' | 'step' | 'select-port' | 'toggle-device' | string;
    })
  | (MentorBeatBase & {
      kind: 'predict';
      options: Array<{
        id: string;
        label: string;
        isCorrect: boolean;
        feedback: string;
        egressPorts?: number[];
      }>;
      whyPrompt?: string;
      whyOptions?: Array<{
        id: string;
        label: string;
        isCorrect: boolean;
        feedback?: string;
      }>;
      reactions?: MentorReactions;
    })
  | (MentorBeatBase & {
      kind: 'fill';
      fields: Array<{
        id: string;
        label: string;
        expected: string;
        helperText?: string;
      }>;
      reactions?: MentorReactions;
    })
  | (MentorBeatBase & {
      kind: 'ticket';
      sceneId: string;
    });

export interface MentorScript {
  version?: string;
  track?: string;
  moduleId: string;
  conceptId: string;
  tier?: 'shadow' | 'call-the-shots' | 'urgent-ticket';
  allowedTerms?: string[];
  revealLadder?: Record<string, string[]>;
  terms: Record<string, { label: string; part: MentorPartId; explanation?: string }>;
  beats: MentorBeat[];
  ticketScene?: {
    ticketId: string;
    title: string;
    symptom: string;
    telemetry: string[];
    options: Array<{ id: string; label: string; isCorrect: boolean; feedback: string }>;
    repairActions: Array<{
      id: string;
      label: string;
      isCorrect: boolean;
      patch?: DeclarativePatch;
    }>;
  };
}

export interface MentorControllable {
  /** Visible stage elements. When undefined, renders full canvas. */
  visibleParts?: ReadonlySet<string>;
  /** Element ID to highlight; all other elements receive spotlight dimming. */
  spotlight?: string;
  /** Explicit step index for external stepper control. */
  controlledStepIndex?: number;
  /** Callback fired upward when learner triggers a physical control. */
  onAction?: (action: { type: string; payload?: unknown }) => void;
  /** Declarative state overrides for ticket diagnostics. */
  stateOverrides?: Record<string, unknown>;
}

export interface DeclarativePatch<TState = unknown> {
  action: 'set-link' | 'set-mtu' | 'reconfigure-interface' | 'transmit-frame' | string;
  target: string;
  value: unknown;
}

export interface TicketScene<TState = unknown> {
  id: string;
  title: string;
  symptom: string;
  initialState: TState;
  inspectableComponents: Array<{ id: string; label: string; data: unknown }>;
  diagnosticQuestion: {
    prompt: string;
    options: Array<{ id: string; label: string; isCorrect: boolean; feedback: string }>;
  };
  allowedFixActions: Array<{
    id: string;
    label: string;
    patch: DeclarativePatch<TState>;
    feedbackOnWrong?: string;
  }>;
  isFixed: (state: TState) => boolean;
  verifyTelemetry: (state: TState) => {
    success: boolean;
    pingOutput: string;
    packetLossPercent: number;
    explanation: string;
  };
}





