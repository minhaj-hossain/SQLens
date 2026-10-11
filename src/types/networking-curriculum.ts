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

