'use client';

import React, { useState, useMemo } from 'react';
import type { TcpLadderTaskContent, TcpSegmentEntry } from '../../../types/curriculum';
import {
  ArrowRight,
  ArrowLeft,
  ArrowDownRight,
  ArrowUpLeft,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  ShieldAlert,
  Zap,
  RotateCcw,
  Sliders,
  Layers,
  HelpCircle,
  Info,
  Network,
  Activity,
  Play,
  Pause,
} from 'lucide-react';

export interface TcpSequenceLadderSimulatorProps {
  taskContent?: TcpLadderTaskContent;
  title?: string;
  description?: string;
}

/**
 * Calculates the next cumulative ACK number based on sequence number,
 * payload byte length, and SYN/FIN phantom byte consumption (RFC 793 / RFC 9293).
 */
export function calculateNextExpectedAck(
  seq: number,
  payloadLength: number,
  hasSynOrFin: boolean = false,
): number {
  return seq + payloadLength + (hasSynOrFin ? 1 : 0);
}

/**
 * Evaluates whether duplicate ACK arrivals have satisfied the RFC 5681
 * threshold (3 duplicate ACKs) required to trigger immediate Fast Retransmit.
 */
export function calculateFastRetransmitTrigger(dupAckCount: number) {
  return {
    dupAckCount,
    isTriggered: dupAckCount >= 3,
    remainingToTrigger: Math.max(0, 3 - dupAckCount),
    status:
      dupAckCount >= 3
        ? 'FAST RETRANSMIT TRIGGERED (Threshold Met: 3 Duplicate ACKs)'
        : `${dupAckCount} Duplicate ACK(s) received (Need 3 to trigger)`,
  };
}

export const TcpSequenceLadderSimulator: React.FC<TcpSequenceLadderSimulatorProps> = ({
  taskContent,
  title,
  description,
}) => {
  const clientHost = taskContent?.clientHost || 'Client (192.168.1.100)';
  const serverHost = taskContent?.serverHost || 'Server (93.184.216.34)';
  const clientIsn = taskContent?.clientIsn || 1000;
  const serverIsn = taskContent?.serverIsn || 5000;
  const initialScenario = taskContent?.defaultScenario || 'data_flow';

  const [activeScenario, setActiveScenario] = useState<
    'handshake' | 'data_flow' | 'fast_retransmit' | 'zero_window' | 'teardown'
  >(initialScenario);
  const [packetDropped, setPacketDropped] = useState<boolean>(true);
  const [activeStep, setActiveStep] = useState<number>(0);

  // Scenario 1: 3-Way Handshake Segments
  const handshakeSegments: TcpSegmentEntry[] = useMemo(
    () => [
      {
        id: 'hs-1',
        sender: 'client',
        flags: ['SYN'],
        seqNumber: clientIsn,
        ackNumber: 0,
        payloadLength: 0,
        rwnd: 64240,
        annotation: `Client SYN: Proposes ISN_c = ${clientIsn}`,
      },
      {
        id: 'hs-2',
        sender: 'server',
        flags: ['SYN', 'ACK'],
        seqNumber: serverIsn,
        ackNumber: clientIsn + 1,
        payloadLength: 0,
        rwnd: 65535,
        annotation: `Server SYN-ACK: Confirms ISN_c + 1 (${clientIsn + 1}) and proposes ISN_s = ${serverIsn}`,
      },
      {
        id: 'hs-3',
        sender: 'client',
        flags: ['ACK'],
        seqNumber: clientIsn + 1,
        ackNumber: serverIsn + 1,
        payloadLength: 0,
        rwnd: 64240,
        annotation: `Client ACK: Confirms ISN_s + 1 (${serverIsn + 1}) -> Connection ESTABLISHED`,
      },
    ],
    [clientIsn, serverIsn],
  );

  // Scenario 2: Data Transfer with Byte Accounting
  const dataFlowSegments: TcpSegmentEntry[] = useMemo(
    () => [
      {
        id: 'df-1',
        sender: 'client',
        flags: ['ACK', 'PSH'],
        seqNumber: 10000,
        ackNumber: serverIsn + 1,
        payloadLength: 1460,
        rwnd: 64240,
        annotation: 'Client Seg 1: Bytes 10,000–11,459 (Len = 1,460B)',
      },
      {
        id: 'df-2',
        sender: 'server',
        flags: ['ACK'],
        seqNumber: serverIsn + 1,
        ackNumber: 11460,
        payloadLength: 0,
        rwnd: 65535,
        annotation: 'Server Cumulative ACK: 10,000 + 1,460 = ACK 11,460',
      },
      {
        id: 'df-3',
        sender: 'client',
        flags: ['ACK', 'PSH'],
        seqNumber: 11460,
        ackNumber: serverIsn + 1,
        payloadLength: 1460,
        rwnd: 64240,
        annotation: 'Client Seg 2: Bytes 11,460–12,919 (Len = 1,460B)',
      },
      {
        id: 'df-4',
        sender: 'server',
        flags: ['ACK'],
        seqNumber: serverIsn + 1,
        ackNumber: 12920,
        payloadLength: 0,
        rwnd: 65535,
        annotation: 'Server Cumulative ACK: 11,460 + 1,460 = ACK 12,920',
      },
    ],
    [serverIsn],
  );

  // Scenario 3: Packet Loss & Fast Retransmit
  const fastRetransmitSegments: TcpSegmentEntry[] = useMemo(() => {
    const list: TcpSegmentEntry[] = [
      {
        id: 'fr-1',
        sender: 'client',
        flags: ['ACK'],
        seqNumber: 1000,
        ackNumber: 5001,
        payloadLength: 1000,
        rwnd: 64240,
        annotation: 'Client Seg 1: Bytes 1000–1999 (Arrived OK)',
      },
      {
        id: 'fr-ack-1',
        sender: 'server',
        flags: ['ACK'],
        seqNumber: 5001,
        ackNumber: 2000,
        payloadLength: 0,
        rwnd: 65535,
        annotation: 'Server ACK: Confirms bytes up to 1999 -> Expects 2000',
      },
      {
        id: 'fr-2',
        sender: 'client',
        flags: ['ACK'],
        seqNumber: 2000,
        ackNumber: 5001,
        payloadLength: 1000,
        rwnd: 64240,
        isDropped: packetDropped,
        annotation: packetDropped
          ? 'Client Seg 2: Bytes 2000–2999 [DROPPED IN TRANSIT]'
          : 'Client Seg 2: Bytes 2000–2999 (Arrived OK)',
      },
      {
        id: 'fr-3',
        sender: 'client',
        flags: ['ACK'],
        seqNumber: 3000,
        ackNumber: 5001,
        payloadLength: 1000,
        rwnd: 64240,
        annotation: 'Client Seg 3: Bytes 3000–3999 (Arrived Out of Order)',
      },
      {
        id: 'fr-ack-dup1',
        sender: 'server',
        flags: ['ACK'],
        seqNumber: 5001,
        ackNumber: 2000,
        payloadLength: 0,
        rwnd: 65535,
        isDuplicateAck: packetDropped,
        annotation: packetDropped
          ? 'Server Duplicate ACK #1: Gap at byte 2000! Repeats ACK 2000'
          : 'Server Cumulative ACK: 4000',
      },
      {
        id: 'fr-4',
        sender: 'client',
        flags: ['ACK'],
        seqNumber: 4000,
        ackNumber: 5001,
        payloadLength: 1000,
        rwnd: 64240,
        annotation: 'Client Seg 4: Bytes 4000–4999 (Arrived Out of Order)',
      },
      {
        id: 'fr-ack-dup2',
        sender: 'server',
        flags: ['ACK'],
        seqNumber: 5001,
        ackNumber: 2000,
        payloadLength: 0,
        rwnd: 65535,
        isDuplicateAck: packetDropped,
        annotation: packetDropped
          ? 'Server Duplicate ACK #2: Gap remains! Repeats ACK 2000'
          : 'Server Cumulative ACK: 5000',
      },
      {
        id: 'fr-5',
        sender: 'client',
        flags: ['ACK'],
        seqNumber: 5000,
        ackNumber: 5001,
        payloadLength: 1000,
        rwnd: 64240,
        annotation: 'Client Seg 5: Bytes 5000–5999 (Arrived Out of Order)',
      },
      {
        id: 'fr-ack-dup3',
        sender: 'server',
        flags: ['ACK'],
        seqNumber: 5001,
        ackNumber: 2000,
        payloadLength: 0,
        rwnd: 65535,
        isDuplicateAck: packetDropped,
        annotation: packetDropped
          ? 'Server Duplicate ACK #3: 3rd Dup ACK received! Triggers Fast Retransmit'
          : 'Server Cumulative ACK: 6000',
      },
    ];

    if (packetDropped) {
      list.push({
        id: 'fr-retransmit',
        sender: 'client',
        flags: ['ACK'],
        seqNumber: 2000,
        ackNumber: 5001,
        payloadLength: 1000,
        rwnd: 64240,
        isRetransmission: true,
        annotation: 'FAST RETRANSMIT: Client resends Seg 2 (Bytes 2000–2999) without waiting for RTO!',
      });
      list.push({
        id: 'fr-ack-final',
        sender: 'server',
        flags: ['ACK'],
        seqNumber: 5001,
        ackNumber: 6000,
        payloadLength: 0,
        rwnd: 65535,
        annotation: 'Server Cumulative ACK: Gap healed! Acknowledges all buffered bytes up to ACK 6000',
      });
    }

    return list;
  }, [packetDropped]);

  // Scenario 4: Flow Control & Zero Window Probes
  const zeroWindowSegments: TcpSegmentEntry[] = useMemo(
    () => [
      {
        id: 'zw-1',
        sender: 'server',
        flags: ['ACK'],
        seqNumber: 5001,
        ackNumber: 10000,
        payloadLength: 0,
        rwnd: 0,
        annotation: 'Server Zero Window: Buffer full! rwnd = 0 -> Client halts transmission',
      },
      {
        id: 'zw-2',
        sender: 'client',
        flags: ['ACK'],
        seqNumber: 10000,
        ackNumber: 5001,
        payloadLength: 1,
        rwnd: 64240,
        annotation: 'Client Zero Window Probe: Persist timer fires -> 1-byte probe sent',
      },
      {
        id: 'zw-3',
        sender: 'server',
        flags: ['ACK'],
        seqNumber: 5001,
        ackNumber: 10001,
        payloadLength: 0,
        rwnd: 64240,
        annotation: 'Server Window Update: Buffer drained! Reopens rwnd = 64,240B',
      },
    ],
    [],
  );

  // Scenario 5: Teardown & TIME_WAIT (2*MSL)
  const teardownSegments: TcpSegmentEntry[] = useMemo(
    () => [
      {
        id: 'td-1',
        sender: 'client',
        flags: ['FIN', 'ACK'],
        seqNumber: 20000,
        ackNumber: 30000,
        payloadLength: 0,
        rwnd: 64240,
        annotation: 'Client FIN: Initiates active close -> Client enters FIN_WAIT_1',
      },
      {
        id: 'td-2',
        sender: 'server',
        flags: ['ACK'],
        seqNumber: 30000,
        ackNumber: 20001,
        payloadLength: 0,
        rwnd: 65535,
        annotation: 'Server ACK: Confirms Client FIN -> Half-Closed (Server: CLOSE_WAIT, Client: FIN_WAIT_2)',
      },
      {
        id: 'td-3',
        sender: 'server',
        flags: ['FIN', 'ACK'],
        seqNumber: 30000,
        ackNumber: 20001,
        payloadLength: 0,
        rwnd: 65535,
        annotation: 'Server FIN: Server finishes sending data -> Server enters LAST_ACK',
      },
      {
        id: 'td-4',
        sender: 'client',
        flags: ['ACK'],
        seqNumber: 20001,
        ackNumber: 30001,
        payloadLength: 0,
        rwnd: 64240,
        annotation: 'Client ACK: Final handshake -> Client enters TIME_WAIT (2*MSL = 120s), Server CLOSED',
      },
    ],
    [],
  );

  const currentSegments = useMemo(() => {
    switch (activeScenario) {
      case 'handshake':
        return handshakeSegments;
      case 'data_flow':
        return dataFlowSegments;
      case 'fast_retransmit':
        return fastRetransmitSegments;
      case 'zero_window':
        return zeroWindowSegments;
      case 'teardown':
        return teardownSegments;
    }
  }, [activeScenario, handshakeSegments, dataFlowSegments, fastRetransmitSegments, zeroWindowSegments, teardownSegments]);

  return (
    <div
      className="w-full rounded-2xl border border-border bg-surface-1/90 backdrop-blur-md p-4 sm:p-5 shadow-lg space-y-5 text-text"
      data-testid="tcp-sequence-ladder-simulator"
    >
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER BAR: Title, Scenario Tabs & Drop Toggle
          ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-soft pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-mono text-sm sm:text-base font-bold text-text">
              {taskContent?.title || title || 'TCP Sequence & Sliding Window Ladder'}
            </h3>
            <span className="text-[11px] font-mono text-text-dim block">
              RFC 793 / 9293 • Byte Accounting • Fast Retransmit • TIME_WAIT
            </span>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex flex-wrap items-center gap-1 bg-surface-2/80 p-1 rounded-lg border border-border-soft self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveScenario('handshake')}
            className={`px-2 py-1 rounded text-xs font-mono font-medium transition cursor-pointer ${
              activeScenario === 'handshake'
                ? 'bg-func text-white font-bold shadow-sm'
                : 'text-text-dim hover:text-text'
            }`}
            data-testid="mode-handshake"
          >
            Handshake
          </button>
          <button
            type="button"
            onClick={() => setActiveScenario('data_flow')}
            className={`px-2 py-1 rounded text-xs font-mono font-medium transition cursor-pointer ${
              activeScenario === 'data_flow'
                ? 'bg-func text-white font-bold shadow-sm'
                : 'text-text-dim hover:text-text'
            }`}
            data-testid="mode-data-flow"
          >
            Data Flow
          </button>
          <button
            type="button"
            onClick={() => setActiveScenario('fast_retransmit')}
            className={`px-2 py-1 rounded text-xs font-mono font-medium transition cursor-pointer ${
              activeScenario === 'fast_retransmit'
                ? 'bg-func text-white font-bold shadow-sm'
                : 'text-text-dim hover:text-text'
            }`}
            data-testid="mode-fast-retransmit"
          >
            Fast Retransmit
          </button>
          <button
            type="button"
            onClick={() => setActiveScenario('zero_window')}
            className={`px-2 py-1 rounded text-xs font-mono font-medium transition cursor-pointer ${
              activeScenario === 'zero_window'
                ? 'bg-func text-white font-bold shadow-sm'
                : 'text-text-dim hover:text-text'
            }`}
            data-testid="mode-zero-window"
          >
            Zero Window
          </button>
          <button
            type="button"
            onClick={() => setActiveScenario('teardown')}
            className={`px-2 py-1 rounded text-xs font-mono font-medium transition cursor-pointer ${
              activeScenario === 'teardown'
                ? 'bg-func text-white font-bold shadow-sm'
                : 'text-text-dim hover:text-text'
            }`}
            data-testid="mode-teardown"
          >
            Teardown
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. PACKET DROP / SIMULATION KNOB (Fast Retransmit Mode)
          ───────────────────────────────────────────────────────────── */}
      {activeScenario === 'fast_retransmit' && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-surface-2 border border-border-soft font-mono text-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Simulate Dropped Packet (Segment 2 - Bytes 2000–2999):</span>
          </div>
          <button
            type="button"
            onClick={() => setPacketDropped((d) => !d)}
            className={`px-3 py-1 rounded text-xs font-bold transition cursor-pointer ${
              packetDropped
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
            }`}
            data-testid="toggle-drop-btn"
          >
            {packetDropped ? 'Packet State: DROPPED (Loss)' : 'Packet State: DELIVERED (No Loss)'}
          </button>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. SPACE-TIME LADDER DIAGRAM CANVAS
          ───────────────────────────────────────────────────────────── */}
      <div className="p-4 rounded-xl border border-border bg-surface-2/70 space-y-3 font-mono text-xs">
        {/* Host Timeline Column Headers */}
        <div className="grid grid-cols-2 text-center pb-2 border-b border-border-soft">
          <div className="flex flex-col items-center justify-center">
            <span className="font-bold text-sky-400 text-xs sm:text-sm">{clientHost}</span>
            <span className="text-[10px] text-text-dim uppercase">Client / Initiator</span>
          </div>
          <div className="flex flex-col items-center justify-center">
            <span className="font-bold text-emerald-400 text-xs sm:text-sm">{serverHost}</span>
            <span className="text-[10px] text-text-dim uppercase">Server / Responder</span>
          </div>
        </div>

        {/* Vertical Segment Trajectory Ladder */}
        <div className="space-y-3 py-2" data-testid="ladder-segments-container">
          {currentSegments.map((seg, idx) => {
            const isClientSender = seg.sender === 'client';
            return (
              <div
                key={seg.id}
                className={`p-2.5 rounded-lg border transition ${
                  seg.isDropped
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                    : seg.isRetransmission
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-200'
                    : seg.isDuplicateAck
                    ? 'bg-purple-500/10 border-purple-500/30 text-purple-200'
                    : 'bg-surface-3/80 border-border-soft text-text'
                }`}
                data-testid={`segment-row-${seg.id}`}
              >
                {/* Arrow & Flight Info */}
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <div className="flex items-center gap-1.5">
                    {/* Flag Badges */}
                    <div className="flex gap-1">
                      {seg.flags.map((flag) => (
                        <span
                          key={flag}
                          className={`px-1.5 py-0.2 rounded text-[9.5px] font-bold ${
                            flag === 'SYN'
                              ? 'bg-sky-500/20 text-sky-300'
                              : flag === 'FIN'
                              ? 'bg-rose-500/20 text-rose-300'
                              : flag === 'ACK'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-surface-4 text-text-dim'
                          }`}
                        >
                          {flag}
                        </span>
                      ))}
                    </div>

                    <span className="text-text-dim">
                      {isClientSender ? 'Client → Server' : 'Server → Client'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[10.5px]">
                    <span className="text-func font-bold">Seq={seg.seqNumber}</span>
                    <span className="text-emerald-400 font-bold">Ack={seg.ackNumber}</span>
                    {seg.payloadLength > 0 && (
                      <span className="text-amber-400">Len={seg.payloadLength}B</span>
                    )}
                    <span className="text-text-dim">rwnd={seg.rwnd}</span>
                  </div>
                </div>

                {/* Annotation Callout */}
                <p className="text-[10.5px] font-sans text-text-dim mt-1.5 leading-snug">
                  {seg.annotation}
                </p>
              </div>
            );
          })}
        </div>

        {/* Special Teardown TIME_WAIT Safety Box */}
        {activeScenario === 'teardown' && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-sans text-amber-200 space-y-1.5" data-testid="timewait-callout">
            <div className="flex items-center gap-2 font-mono font-bold text-amber-300">
              <Clock className="w-4 h-4 shrink-0" />
              <span>TIME_WAIT Safety Duration (2 * MSL = 60–120 seconds)</span>
            </div>
            <p className="text-[11.5px] leading-relaxed">
              The active closer stays in <strong>TIME_WAIT</strong> for 2 Maximum Segment Lifetimes.
              This guarantees that if the final ACK is lost, the retransmitted FIN can be acknowledged, and all lingering out-of-order packets drain from the network before the port 5-tuple can be recycled.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
