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
