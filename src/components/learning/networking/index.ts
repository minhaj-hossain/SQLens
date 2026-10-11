/**
 * Networking Component Library Index — Phase 4 Component Extraction
 * ─────────────────────────────────────────────────────────────────────────────
 * Unified export point for interactive networking pedagogy widgets, protocol
 * decoders, simulators, and structured grading interfaces.
 */

export { PacketInspector, type PacketInspectorProps } from './PacketInspector';
export { SubnetBitSlicer, calculateSubnet, type SubnetBitSlicerProps } from './SubnetBitSlicer';
export { StructuredTaskGrader, type StructuredFieldDef, type StructuredTaskGraderProps } from './StructuredTaskGrader';
export { ArpSimulationLab, type ArpSimulationLabProps } from './ArpSimulationLab';
export { SwitchSimulationLab, type SwitchSimulationLabProps } from './SwitchSimulationLab';
export {
  RouterOnAStickDiagram,
  HostTelemetryTerminal,
  type RouterOnAStickProps,
  type HostTelemetryTerminalProps,
} from './SubnetPilotVisuals';
export { SwitchingTopologyCanvas, type SwitchingTopologyCanvasProps } from './SwitchingTopologyCanvas';
export { PlaybackControls, type PlaybackControlsProps } from './PlaybackControls';
export { MacTableView, type MacTableViewProps } from './MacTableView';
export { PredictionGate, type PredictionGateProps } from './PredictionGate';
export {
  VirtualTerminalSimulator,
  type VirtualTerminalSimulatorProps,
} from './VirtualTerminalSimulator';
export {
  EthernetFrameInspector,
  computeCrc32,
  type EthernetFrameInspectorProps,
} from './EthernetFrameInspector';
export {
  Ipv6NdpSimulator,
  macToEui64,
  toSolicitedNodeMulticast,
  canonicalizeIpv6,
  expandIpv6,
  type Ipv6NdpSimulatorProps,
  type Eui64Result,
} from './Ipv6NdpSimulator';
export {
  DhcpDoraSimulator,
  calculateDhcpTimers,
  type DhcpDoraSimulatorProps,
} from './DhcpDoraSimulator';
export {
  DnsResolutionTreeSimulator,
  calculateDnsResolutionMetrics,
  getDnsRcodeExplanation,
  type DnsResolutionTreeSimulatorProps,
} from './DnsResolutionTreeSimulator';
export { NetworkingPracticeTaskView } from './NetworkingPracticeTaskView';
