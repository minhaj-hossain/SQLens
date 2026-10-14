/**
 * Lean Switching Simulation Engine — Gate 2.
 * ─────────────────────────────────────────────────────────────────────────────
 * Pure deterministic state machine modeling Layer 2 MAC learning and forwarding.
 * Emits granular, ordered transitions with state snapshots for each frame event:
 *   1. Ingress Source Evaluation (LEARN_NEW_SOURCE, REFRESH_SOURCE, MOVE_SOURCE)
 *   2. Destination Lookup & Egress Action (FORWARD_KNOWN_UNICAST, FLOOD_UNKNOWN_UNICAST,
 *      FLOOD_BROADCAST, FILTER_SAME_PORT)
 *
 * Guarantees zero DOM/React dependencies, zero side effects, and 100% replayability.
 */

export interface HostNode {
  id: string; // e.g. 'host-a'
  name: string; // e.g. 'Host A'
  mac: string; // e.g. 'AA:AA:AA:AA:AA:AA'
  port: number; // e.g. 1
  ip?: string; // e.g. '192.168.1.10'
}

export interface MacTableEntry {
  mac: string;
  port: number;
}

export interface FrameTransmission {
  srcMac: string;
  dstMac: string;
  ingressPort: number;
  payload?: string;
}

export type SwitchDecision =
  | 'LEARN_NEW_SOURCE' // Source MAC added to table
  | 'REFRESH_SOURCE' // Source MAC already mapped to this port
  | 'MOVE_SOURCE' // Source MAC updated from old port to new port
  | 'FLOOD_BROADCAST' // Destination is FF:FF:FF:FF:FF:FF
  | 'FLOOD_UNKNOWN_UNICAST' // Destination MAC not in table
  | 'FORWARD_KNOWN_UNICAST' // Destination MAC in table on different port
  | 'FILTER_SAME_PORT'; // Destination MAC in table on same ingress port

export interface PortState {
  port: number;
  state: 'transmitting' | 'idle' | 'dropped' | 'accepted';
}

export interface SimulationStep {
  stepIndex: number;
  phase: 'source_evaluation' | 'forwarding_action';
  actor: 'host' | 'switch';
  actorId: string;
  title: string;
  description: string;
  decision: SwitchDecision;
  technicalRule: string;
  activeFrame: {
    srcMac: string;
    dstMac: string;
    payload?: string;
  };
  ingressPort: number;
  egressPorts: number[];
  portStates: PortState[];
  macTableSnapshot: MacTableEntry[];
  highlightedPort?: number;
}

export const BROADCAST_MAC = 'FF:FF:FF:FF:FF:FF';

export function normalizeMac(mac: string): string {
  return mac.trim().toUpperCase().replace(/-/g, ':');
}

export function isBroadcastMac(mac: string): boolean {
  return normalizeMac(mac) === BROADCAST_MAC;
}

export interface SwitchSimulationOptions {
  totalPorts?: number;
  switchId?: string;
}

export class SwitchSimulationEngine {
  private hosts: HostNode[];
  private allPorts: number[];
  private macTable: Map<string, number>;
  private steps: SimulationStep[];
  private currentStepIndex: number;
  private switchId: string;

  constructor(hosts: HostNode[] = [], options?: SwitchSimulationOptions) {
    this.hosts = hosts;
    this.switchId = options?.switchId ?? 'switch-1';
    const hostPorts = hosts.map((h) => h.port);
    const maxPort = options?.totalPorts ?? Math.max(4, ...hostPorts, 0);
    const portSet = new Set<number>();
    for (let p = 1; p <= maxPort; p++) portSet.add(p);
    for (const p of hostPorts) portSet.add(p);
    this.allPorts = Array.from(portSet).sort((a, b) => a - b);
    this.macTable = new Map<string, number>();
    this.steps = [];
    this.currentStepIndex = 0;
  }

  public getMacTableSnapshot(): MacTableEntry[] {
    const entries: MacTableEntry[] = [];
    for (const [mac, port] of this.macTable.entries()) {
      entries.push({ mac, port });
    }
    return entries.sort((a, b) => a.port - b.port || a.mac.localeCompare(b.mac));
  }

  public reset(): void {
    this.macTable.clear();
    this.steps = [];
    this.currentStepIndex = 0;
  }

  public processFrame(transmission: FrameTransmission): [SimulationStep, SimulationStep] {
    const src = normalizeMac(transmission.srcMac);
    const dst = normalizeMac(transmission.dstMac);
    const ingress = transmission.ingressPort;

    // --- Transition 1: Source MAC Evaluation ---
    let sourceDecision: SwitchDecision;
    let sourceTitle: string;
    let sourceDesc: string;
    let sourceRule: string;

    const existingPort = this.macTable.get(src);
    if (existingPort === undefined) {
      sourceDecision = 'LEARN_NEW_SOURCE';
      sourceTitle = 'Source Learning: New Address Recorded';
      sourceDesc = `Switch inspected frame header. Source MAC ${src} is not in the MAC table. Associated ${src} with ingress Port ${ingress}.`;
      sourceRule =
        'Switches record the source MAC address and ingress port of every received frame into the CAM table.';
      this.macTable.set(src, ingress);
    } else if (existingPort === ingress) {
      sourceDecision = 'REFRESH_SOURCE';
      sourceTitle = 'Source Learning: Entry Refreshed';
      sourceDesc = `Source MAC ${src} is already recorded on Port ${ingress}. Entry timestamp refreshed.`;
      sourceRule =
        'When a frame arrives from a known MAC on its recorded port, the switch refreshes the entry aging timer.';
    } else {
      sourceDecision = 'MOVE_SOURCE';
      sourceTitle = 'Source Learning: Station Movement';
      sourceDesc = `Station migration detected! Source MAC ${src} moved from Port ${existingPort} to Port ${ingress}. Updated CAM table mapping.`;
      sourceRule =
        'If a frame from a known MAC arrives on a new port, the switch immediately updates the mapping to the new ingress port.';
      this.macTable.set(src, ingress);
    }

    const step1PortStates: PortState[] = this.allPorts.map((p) => ({
      port: p,
      state: p === ingress ? 'accepted' : 'idle',
    }));

    const step1: SimulationStep = {
      stepIndex: this.currentStepIndex++,
      phase: 'source_evaluation',
      actor: 'switch',
      actorId: this.switchId,
      title: sourceTitle,
      description: sourceDesc,
      decision: sourceDecision,
      technicalRule: sourceRule,
      activeFrame: {
        srcMac: src,
        dstMac: dst,
        payload: transmission.payload,
      },
      ingressPort: ingress,
      egressPorts: [],
      portStates: step1PortStates,
      macTableSnapshot: this.getMacTableSnapshot(),
      highlightedPort: ingress,
    };
    this.steps.push(step1);

    // --- Transition 2: Destination Lookup & Egress Action ---
    let forwardDecision: SwitchDecision;
    let forwardTitle: string;
    let forwardDesc: string;
    let forwardRule: string;
    let egressPorts: number[] = [];
    let highlightedPort: number | undefined;
    const isBcast = isBroadcastMac(dst);

    if (isBcast) {
      forwardDecision = 'FLOOD_BROADCAST';
      forwardTitle = 'Destination Lookup: Broadcast Flood';
      egressPorts = this.allPorts.filter((p) => p !== ingress);
      forwardDesc = `Destination is broadcast address ${BROADCAST_MAC}. Replicated and flooded out all ports except arrival Port ${ingress} (Ports ${egressPorts.join(', ')}).`;
      forwardRule =
        'Broadcast frames (FF:FF:FF:FF:FF:FF) are flooded to all ports in the broadcast domain except the ingress port.';
    } else {
      const destPort = this.macTable.get(dst);
      if (destPort === undefined) {
        forwardDecision = 'FLOOD_UNKNOWN_UNICAST';
        forwardTitle = 'Destination Lookup: Unknown Unicast Flood';
        egressPorts = this.allPorts.filter((p) => p !== ingress);
        forwardDesc = `Destination MAC ${dst} not found in MAC table. Flooded out all active ports except arrival Port ${ingress} (Ports ${egressPorts.join(', ')}).`;
        forwardRule =
          'Frames with unrecorded unicast destinations are flooded to all ports except the arrival port until the destination replies.';
      } else if (destPort !== ingress) {
        forwardDecision = 'FORWARD_KNOWN_UNICAST';
        forwardTitle = 'Destination Lookup: Known Unicast Forward';
        egressPorts = [destPort];
        highlightedPort = destPort;
        forwardDesc = `Destination MAC ${dst} found in MAC table on Port ${destPort}. Forwarded directly to Port ${destPort}. Other ports remain idle.`;
        forwardRule =
          'When destination MAC matches an entry on another port, the switch forwards the frame exclusively out that destination port.';
      } else {
        forwardDecision = 'FILTER_SAME_PORT';
        forwardTitle = 'Destination Lookup: Same-Port Filter';
        egressPorts = [];
        highlightedPort = ingress;
        forwardDesc = `Destination MAC ${dst} resides on the same ingress Port ${ingress}. Frame filtered and dropped to prevent loop/redundant traffic.`;
        forwardRule =
          'If the destination MAC is located on the same port where the frame entered, the frame is filtered (discarded).';
      }
    }

    const step2PortStates: PortState[] = this.allPorts.map((p) => {
      if (forwardDecision === 'FILTER_SAME_PORT' && p === ingress) {
        return { port: p, state: 'dropped' };
      }
      if (egressPorts.includes(p)) {
        return { port: p, state: 'transmitting' };
      }
      return { port: p, state: 'idle' };
    });

    const step2: SimulationStep = {
      stepIndex: this.currentStepIndex++,
      phase: 'forwarding_action',
      actor: 'switch',
      actorId: this.switchId,
      title: forwardTitle,
      description: forwardDesc,
      decision: forwardDecision,
      technicalRule: forwardRule,
      activeFrame: {
        srcMac: src,
        dstMac: dst,
        payload: transmission.payload,
      },
      ingressPort: ingress,
      egressPorts,
      portStates: step2PortStates,
      macTableSnapshot: this.getMacTableSnapshot(),
      highlightedPort,
    };
    this.steps.push(step2);

    return [step1, step2];
  }

  public processSequence(sequence: FrameTransmission[]): SimulationStep[] {
    for (const tx of sequence) {
      this.processFrame(tx);
    }
    return this.steps;
  }

  public getAllSteps(): SimulationStep[] {
    return [...this.steps];
  }
}

export const DEFAULT_SWITCH_HOSTS: HostNode[] = [
  { id: 'host-a', name: 'Host A', mac: 'AA:AA:AA:AA:AA:AA', port: 1 },
  { id: 'host-b', name: 'Host B', mac: 'BB:BB:BB:BB:BB:BB', port: 2 },
  { id: 'host-c', name: 'Host C', mac: 'CC:CC:CC:CC:CC:CC', port: 3 },
  { id: 'host-d', name: 'Host D', mac: 'DD:DD:DD:DD:DD:DD', port: 4 },
];

export const DEFAULT_FRAME_SEQUENCE: FrameTransmission[] = [
  // Frame 1: Host A sends to Host B (cold start flood)
  { srcMac: 'AA:AA:AA:AA:AA:AA', dstMac: 'BB:BB:BB:BB:BB:BB', ingressPort: 1 },
  // Frame 2: Host B replies to Host A (learned unicast)
  { srcMac: 'BB:BB:BB:BB:BB:BB', dstMac: 'AA:AA:AA:AA:AA:AA', ingressPort: 2 },
];

/**
 * Pure deterministic function producing granular step-by-step playback states.
 * Guarantees zero side effects and complete replayability.
 */
export function generateSwitchSimulation(
  hosts: HostNode[] = DEFAULT_SWITCH_HOSTS,
  sequence: FrameTransmission[] = DEFAULT_FRAME_SEQUENCE,
  options?: SwitchSimulationOptions
): SimulationStep[] {
  const engine = new SwitchSimulationEngine(hosts, options);
  return engine.processSequence(sequence);
}

