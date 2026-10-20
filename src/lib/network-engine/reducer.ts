import type {
  LearnerActionEvent,
  SavedEngineSession,
  SimulationState,
} from './types';
import { executeCommandTruthfully } from './commands';
import { createInitialAcmeOfficeState } from './fixtures/acme-office-m1';

export const ENGINE_STORAGE_KEY_V1 = 'sqlens_net_action_log_net01_v1';

export function reduceSimulationState(
  state: SimulationState,
  action: LearnerActionEvent,
): SimulationState {
  const clock = state.logicalClock + 1;
  const nextLog = [...state.actionLog, action];

  switch (action.type) {
    case 'SEAT_CABLE': {
      const link = state.links[action.linkId];
      if (!link) return { ...state, logicalClock: clock, actionLog: nextLog };

      const updatedLink = {
        ...link,
        status: 'carrier-active' as const,
        endpointA: { ...link.endpointA, isSeated: true },
      };

      const hostA = state.devices['host-a'];
      const eth0 = hostA?.interfaces?.eth0;
      const updatedHostA = hostA && eth0
        ? {
            ...hostA,
            interfaces: {
              ...hostA.interfaces,
              eth0: {
                ...eth0,
                linkState: 'up' as const,
              },
            },
          }
        : hostA;

      const sw1 = state.devices['sw1'];
      const swPort1 = sw1?.interfaces?.['port-1'];
      const updatedSw1 = sw1 && swPort1
        ? {
            ...sw1,
            interfaces: {
              ...sw1.interfaces,
              'port-1': {
                ...swPort1,
                linkState: 'up' as const,
              },
            },
          }
        : sw1;

      return {
        ...state,
        logicalClock: clock,
        links: {
          ...state.links,
          [action.linkId]: updatedLink,
        },
        devices: {
          ...state.devices,
          ...(updatedHostA ? { 'host-a': updatedHostA } : {}),
          ...(updatedSw1 ? { sw1: updatedSw1 } : {}),
        },
        actionLog: nextLog,
      };
    }

    case 'UNSEAT_CABLE': {
      const link = state.links[action.linkId];
      if (!link) return { ...state, logicalClock: clock, actionLog: nextLog };

      const updatedLink = {
        ...link,
        status: 'disconnected' as const,
        endpointA: { ...link.endpointA, isSeated: false },
      };

      const hostA = state.devices['host-a'];
      const eth0 = hostA?.interfaces?.eth0;
      const updatedHostA = hostA && eth0
        ? {
            ...hostA,
            interfaces: {
              ...hostA.interfaces,
              eth0: {
                ...eth0,
                linkState: 'down' as const,
              },
            },
          }
        : hostA;

      const sw1 = state.devices['sw1'];
      const swPort1 = sw1?.interfaces?.['port-1'];
      const updatedSw1 = sw1 && swPort1
        ? {
            ...sw1,
            interfaces: {
              ...sw1.interfaces,
              'port-1': {
                ...swPort1,
                linkState: 'down' as const,
              },
            },
          }
        : sw1;

      return {
        ...state,
        logicalClock: clock,
        links: {
          ...state.links,
          [action.linkId]: updatedLink,
        },
        devices: {
          ...state.devices,
          ...(updatedHostA ? { 'host-a': updatedHostA } : {}),
          ...(updatedSw1 ? { sw1: updatedSw1 } : {}),
        },
        actionLog: nextLog,
      };
    }

    case 'RUN_COMMAND': {
      const { result, updatedState } = executeCommandTruthfully(state, action.command);
      const nextHistory =
        action.command.trim().toLowerCase() === 'cls' || action.command.trim().toLowerCase() === 'clear'
          ? []
          : [...state.terminalHistory, { command: action.command, output: result.stdout }];

      return {
        ...updatedState,
        logicalClock: clock,
        actionLog: [
          ...state.actionLog,
          { ...action, output: result.stdout, logicalTick: clock },
        ],
        terminalHistory: nextHistory,
      };
    }

    case 'CONTINUE': {
      return {
        ...state,
        logicalClock: clock,
        activeBeatId: action.beatId,
        actionLog: nextLog,
      };
    }

    case 'SELECT_CHIP': {
      return {
        ...state,
        logicalClock: clock,
        actionLog: nextLog,
      };
    }

    case 'REPLAY_CHECKPOINT': {
      // Find index where target beat started
      const targetBeatId = action.targetBeatId;
      const initial = createInitialAcmeOfficeState();
      const priorLog: LearnerActionEvent[] = [];

      for (const logItem of state.actionLog) {
        if (logItem.type === 'CONTINUE' && logItem.beatId === targetBeatId) {
          break;
        }
        priorLog.push(logItem);
      }

      const replayed = reduceActionLog(initial, priorLog);
      return {
        ...replayed,
        activeBeatId: targetBeatId,
      };
    }

    case 'ENTER_REVIEW': {
      return {
        ...state,
        logicalClock: clock,
        activeBeatId: action.targetBeatId,
      };
    }

    default:
      return state;
  }
}

export function reduceActionLog(
  initialState: SimulationState,
  log: LearnerActionEvent[],
): SimulationState {
  let curr = initialState;
  for (const action of log) {
    curr = reduceSimulationState(curr, action);
  }
  return curr;
}

export function saveEngineSession(session: SavedEngineSession): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(ENGINE_STORAGE_KEY_V1, JSON.stringify(session));
  } catch (err) {
    console.warn('[NetworkEngine] Failed to persist session:', err);
  }
}

export function loadEngineSession(): SavedEngineSession | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(ENGINE_STORAGE_KEY_V1);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedEngineSession;
    if (parsed.engineSchemaVersion === 1 && Array.isArray(parsed.actionLog)) {
      return parsed;
    }
  } catch (err) {
    console.warn('[NetworkEngine] Failed to load session:', err);
  }
  return null;
}
