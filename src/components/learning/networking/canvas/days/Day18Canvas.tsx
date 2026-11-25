import React from 'react';
import type { DayCanvasProps } from './types';
import { SvgWorkstation } from '../SvgWorkstation';
import { SvgRouter } from '../SvgRouter';
import { SvgCable } from '../SvgCable';

export const Day18Canvas: React.FC<DayCanvasProps> = ({ activeStepIndex, isPinging }) => (
              <>
                {/* Upper Path Title Banner */}
                <rect
                  x={500}
                  y={18}
                  width={480}
                  height={22}
                  rx={4}
                  fill="#070c14"
                  stroke="#38bdf8"
                  strokeWidth={1}
                />
                <text
                  x={740}
                  y={32}
                  textAnchor="middle"
                  fill="#38bdf8"
                  fontSize="8"
                  fontWeight="700"
                  fontFamily="monospace"
                >
                  TCP RELIABLE DELIVERY · SEQUENCE NUMBERS, ACKS, RTO &amp; FLOW CONTROL
                </text>

                {/* Cable 1: PC1 to Gateway R1 */}
                <SvgCable
                  x1={228}
                  y1={250}
                  x2={680}
                  y2={250}
                  color="#38bdf8"
                  isTransmitting={
                    activeStepIndex === 0 ||
                    activeStepIndex === 1 ||
                    activeStepIndex === 2 ||
                    activeStepIndex === 3
                  }
                />
                {/* Link 1 Label: LAN Access Link */}
                <g transform="translate(454, 190)">
                  <rect
                    x={-80}
                    y={-10}
                    width={160}
                    height={20}
                    rx={4}
                    fill="#0a0f1d"
                    stroke="#1e293b"
                    strokeWidth={1}
                  />
                  <text
                    x={0}
                    y={3}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="7.5"
                    fontFamily="monospace"
                  >
                    LAN Access Link (Gigabit Ethernet)
                  </text>
                </g>

                {/* Cable 2: Gateway R1 to Web Server */}
                <SvgCable
                  x1={806}
                  y1={250}
                  x2={1220}
                  y2={250}
                  color="#38bdf8"
                  isTransmitting={
                    activeStepIndex === 0 ||
                    activeStepIndex === 1 ||
                    activeStepIndex === 2 ||
                    activeStepIndex === 3
                  }
                />
                {/* Link 2 Label: Datacenter Transit Link */}
                <g transform="translate(1013, 190)">
                  <rect
                    x={-85}
                    y={-10}
                    width={170}
                    height={20}
                    rx={4}
                    fill="#0a0f1d"
                    stroke="#1e293b"
                    strokeWidth={1}
                  />
                  <text
                    x={0}
                    y={3}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="7.5"
                    fontFamily="monospace"
                  >
                    Datacenter Transit Link (10 GbE)
                  </text>
                </g>

                {/* Devices */}
                {/* 1. PC1 Workstation (Client) */}
                <SvgWorkstation
                  x={140}
                  y={220}
                  name="PC1 (Client)"
                  ip="192.168.1.10/24"
                  mac="00:1A:2B:3C:4D:10"
                  ipColor="blue"
                  showIp={true}
                  showMac={true}
                  isPinging={isPinging || activeStepIndex === 0 || activeStepIndex === 1 || activeStepIndex === 2 || activeStepIndex === 3}
                />

                {/* 2. Gateway Router R1 */}
                <SvgRouter
                  x={680}
                  y={215}
                  name="Gateway R1"
                  port1Ip="192.168.1.1"
                  port2Ip="198.51.100.1"
                  port1Active={true}
                  port2Active={true}
                  showPortIps={true}
                  isPinging={isPinging || activeStepIndex === 0 || activeStepIndex === 1 || activeStepIndex === 2 || activeStepIndex === 3}
                />

                {/* 3. Web Server */}
                <SvgWorkstation
                  x={1220}
                  y={220}
                  name="Web Server"
                  ip="198.51.100.10/24"
                  mac="00:1A:2B:3C:4D:99"
                  ipColor="green"
                  showIp={true}
                  showMac={true}
                  isPinging={isPinging || activeStepIndex === 0 || activeStepIndex === 1 || activeStepIndex === 2 || activeStepIndex === 3}
                />

                {/* ================= STEP-SPECIFIC OVERLAYS ================= */}

                {/* Step 0: Sequence Numbers & Cumulative ACKs */}
                {activeStepIndex === 0 && (
                  <>
                    {/* PC1 State Pill above PC1 */}
                    <g transform="translate(140, 130)">
                      <rect x={-75} y={-10} width={150} height={20} rx={4} fill="#064e3b" stroke="#34d399" strokeWidth={1} />
                      <text x={0} y={3.5} textAnchor="middle" fill="#6ee7b7" fontSize="7" fontWeight="700" fontFamily="monospace">
                        State: ESTABLISHED · Tx: seq=1001
                      </text>
                    </g>

                    {/* Server State Pill above Server */}
                    <g transform="translate(1220, 130)">
                      <rect x={-75} y={-10} width={150} height={20} rx={4} fill="#064e3b" stroke="#34d399" strokeWidth={1} />
                      <text x={0} y={3.5} textAnchor="middle" fill="#6ee7b7" fontSize="7" fontWeight="700" fontFamily="monospace">
                        State: ESTABLISHED · Rx: ack=1025
                      </text>
                    </g>

                    {/* Center Overhead: Byte-Stream Accounting & Cumulative ACK Tracker */}
                    <g transform="translate(460, 65)">
                      <rect x={0} y={0} width={560} height={95} rx={6} fill="#070c14" stroke="#38bdf8" strokeWidth={1.2} />
                      <text x={280} y={18} textAnchor="middle" fill="#38bdf8" fontSize="8" fontWeight="700" fontFamily="monospace">
                        BYTE-STREAM ACCOUNTING &amp; CUMULATIVE ACK TRACKER
                      </text>
                      <g transform="translate(20, 34)" fill="#cbd5e1" fontSize="7.2" fontFamily="monospace">
                        <text x={0} y={0} fill="#38bdf8">
                          [1] Application payload: 24 bytes (&quot;GET /data HTTP/1.1\r\n\r\n&quot;)
                        </text>
                        <text x={0} y={16} fill="#4ade80">
                          [2] Sender stream mapping: seq=1001 (Offset range: bytes 1001 .. 1024)
                        </text>
                        <text x={0} y={32} fill="#60a5fa">
                          [3] Cumulative ACK asserted: ack=1025 (&quot;All bytes up to 1024 received; awaiting 1025&quot;)
                        </text>
                        <text x={0} y={48} fill="#6ee7b7" fontWeight="600">
                          ✓ Unbroken sequence confirmed · Byte tracking active
                        </text>
                      </g>
                    </g>

                    {/* In-Flight Packet Badge on Cable 1: Span 228..680 (452px) */}
                    <g transform="translate(454, 250)">
                      <rect
                        x={-170}
                        y={-11}
                        width={340}
                        height={22}
                        rx={4}
                        fill="#0c1a30"
                        stroke="#38bdf8"
                        strokeWidth={1.5}
                        className="animate-pulse"
                      />
                      <text
                        x={0}
                        y={4}
                        textAnchor="middle"
                        fill="#38bdf8"
                        fontSize="7"
                        fontWeight="700"
                        fontFamily="monospace"
                      >
                        [TCP PSH, ACK] seq=1001 len=24B (&quot;GET /data HTTP/1.1&quot;)
                      </text>
                    </g>

                    {/* Card 1 at (70, 350): Byte Stream vs Packet Counting */}
                    <g transform="translate(70, 350)">
                      <rect x={0} y={0} width={280} height={175} rx={6} fill="#070c14" stroke="#38bdf8" strokeWidth={1.2} />
                      <text x={140} y={20} textAnchor="middle" fill="#38bdf8" fontSize="8.5" fontWeight="700" fontFamily="monospace">
                        BYTE STREAM VS PACKET COUNTING
                      </text>
                      <g transform="translate(14, 38)" fill="#cbd5e1" fontSize="7.5" fontFamily="monospace">
                        <text x={0} y={0} fill="#60a5fa" fontWeight="600">Byte-Granularity Model:</text>
                        <text x={12} y={14}>• TCP does NOT count packets</text>
                        <text x={12} y={28}>• Numbers every single byte</text>
                        <text x={12} y={42} fill="#38bdf8">• seq = (ISN + 1 + offset) mod 2³²</text>
                        <text x={12} y={56}>• Treats payload as byte stream</text>
                        <text x={0} y={74} fill="#4ade80" fontWeight="600">Application Transparency:</text>
                        <text x={12} y={88}>Apps issue write() and read()</text>
                        <text x={12} y={102} fill="#94a3b8">TCP slices into discrete segments</text>
                      </g>
                    </g>

                    {/* Card 2 at (380, 350): The Cumulative ACK Invariant */}
                    <g transform="translate(380, 350)">
                      <rect x={0} y={0} width={620} height={175} rx={6} fill="#070c14" stroke="#1e293b" strokeWidth={1.2} />
                      <text x={310} y={20} textAnchor="middle" fill="#f1f5f9" fontSize="8.5" fontWeight="700" fontFamily="monospace">
                        THE CUMULATIVE ACKNOWLEDGMENT INVARIANT
                      </text>
                      <g transform="translate(20, 38)" fill="#cbd5e1" fontSize="7.5" fontFamily="monospace">
                        <text x={0} y={0} fill="#4ade80" fontWeight="600">
                          Mathematical Definition of Cumulative Acknowledgment:
                        </text>
                        <text x={0} y={16}>
                          • An acknowledgment number K confirms receipt of all bytes up to K - 1 in contiguous unbroken order.
                        </text>
                        <text x={0} y={32}>
                          • In this transmission: Sender seq=1001 with len=24 bytes (bytes 1001..1024).
                        </text>
                        <text x={0} y={48} fill="#38bdf8">
                          • Receiver returns ack = 1001 + 24 = 1025 (asserting: &quot;I need byte 1025 next&quot;).
                        </text>
                        <line x1={0} y1={58} x2={580} y2={58} stroke="#334155" strokeWidth={1} />
                        <text x={0} y={72} fill="#f59e0b" fontWeight="600">
                          Fault Tolerance Benefit:
                        </text>
                        <text x={0} y={88}>
                          If an intermediate ACK packet is dropped, a subsequent ACK with a higher number covers all prior bytes.
                        </text>
                        <text x={0} y={104} fill="#cbd5e1">
                          No unnecessary retransmissions occur as long as subsequent cumulative ACKs arrive safely.
                        </text>
                      </g>
                    </g>

                    {/* Card 3 at (1040, 350): Observed Payload Advance */}
                    <g transform="translate(1040, 350)">
                      <rect x={0} y={0} width={380} height={175} rx={6} fill="#070c14" stroke="#38bdf8" strokeWidth={1.2} />
                      <text x={190} y={20} textAnchor="middle" fill="#38bdf8" fontSize="8.5" fontWeight="700" fontFamily="monospace">
                        OBSERVED PAYLOAD ADVANCE
                      </text>
                      <g transform="translate(16, 38)" fill="#cbd5e1" fontSize="7.5" fontFamily="monospace">
                        <text x={0} y={0} fill="#60a5fa" fontWeight="600">Socket Telemetry:</text>
                        <text x={12} y={14}>• 192.168.1.10:52101 → :80</text>
                        <text x={12} y={28}>• Flag: PSH (Push payload to app)</text>
                        <text x={12} y={42}>• Payload Length: 24 Bytes</text>
                        <text x={0} y={60} fill="#4ade80" fontWeight="600">Receive Buffer Space:</text>
                        <text x={12} y={74}>• win = 65535 (64 KB free credit)</text>
                        <text x={12} y={88}>• Stream Pointer: Advanced to 1025</text>
                        <text x={12} y={102} fill="#94a3b8">• Status: Segment safely acknowledged</text>
                      </g>
                    </g>
                  </>
                )}

                {/* Step 1: Packet Loss, Dynamic RTO & Exponential Backoff */}
                {activeStepIndex === 1 && (
                  <>
                    {/* PC1 State Pill above PC1 */}
                    <g transform="translate(140, 130)">
                      <rect x={-80} y={-10} width={160} height={20} rx={4} fill="#451a03" stroke="#f59e0b" strokeWidth={1} />
                      <text x={0} y={3.5} textAnchor="middle" fill="#fef08a" fontSize="7" fontWeight="700" fontFamily="monospace">
                        RTO: 200ms → 400ms (Karn Backoff)
                      </text>
                    </g>

                    {/* R1 Packet Drop Indicator */}
                    <g transform="translate(680, 140)">
                      <rect x={-75} y={-10} width={150} height={20} rx={4} fill="#450a0a" stroke="#f87171" strokeWidth={1} />
                      <text x={0} y={3.5} textAnchor="middle" fill="#fca5a5" fontSize="7" fontWeight="700" fontFamily="monospace">
                        ⚠ Packet Dropped in Transit
                      </text>
                    </g>

                    {/* Server State Pill above Server */}
                    <g transform="translate(1220, 130)">
                      <rect x={-65} y={-10} width={130} height={20} rx={4} fill="#0c1a30" stroke="#38bdf8" strokeWidth={1} />
                      <text x={0} y={3.5} textAnchor="middle" fill="#7dd3fc" fontSize="7" fontWeight="700" fontFamily="monospace">
                        Awaiting Byte 1025
                      </text>
                    </g>

                    {/* Center Overhead: Jacobson's RTO & Karn's Exponential Backoff */}
                    <g transform="translate(460, 65)">
                      <rect x={0} y={0} width={560} height={95} rx={6} fill="#070c14" stroke="#f59e0b" strokeWidth={1.2} />
                      <text x={280} y={18} textAnchor="middle" fill="#fef08a" fontSize="8" fontWeight="700" fontFamily="monospace">
                        JACOBSON&apos;S DYNAMIC RTO &amp; KARN&apos;S EXPONENTIAL BACKOFF
                      </text>
                      <g transform="translate(20, 34)" fill="#cbd5e1" fontSize="7.2" fontFamily="monospace">
                        <text x={0} y={0} fill="#f59e0b">
                          • SRTT = 40ms, RTTVAR = 40ms → RTO = SRTT + 4×RTTVAR = 200ms
                        </text>
                        <text x={0} y={16} fill="#f87171">
                          • Segment seq=1025 dropped; RTO expired after 200ms without ACK
                        </text>
                        <text x={0} y={32} fill="#38bdf8">
                          • Retransmit triggered: seq=1025 re-sent to 198.51.100.10:80
                        </text>
                        <text x={0} y={48} fill="#4ade80" fontWeight="600">
                          • Karn&apos;s Backoff: Next RTO doubled to 400ms (Prevents congestion collapse)
                        </text>
                      </g>
                    </g>

                    {/* In-Flight Packet Badge on Cable 2: Span 806..1220 (414px) */}
                    <g transform="translate(1013, 250)">
                      <rect
                        x={-170}
                        y={-11}
                        width={340}
                        height={22}
                        rx={4}
                        fill="#451a03"
                        stroke="#f59e0b"
                        strokeWidth={1.5}
                        className="animate-pulse"
                      />
                      <text
                        x={0}
                        y={4}
                        textAnchor="middle"
                        fill="#fef08a"
                        fontSize="7"
                        fontWeight="700"
                        fontFamily="monospace"
                      >
                        [RETRANSMIT] seq=1025 len=50B (RTO Expired at t=200ms)
                      </text>
                    </g>

                    {/* Card 1 at (70, 350): Why Static RTO Fails */}
                    <g transform="translate(70, 350)">
                      <rect x={0} y={0} width={280} height={175} rx={6} fill="#070c14" stroke="#f59e0b" strokeWidth={1.2} />
                      <text x={140} y={20} textAnchor="middle" fill="#fef08a" fontSize="8.5" fontWeight="700" fontFamily="monospace">
                        WHY STATIC RTO FAILS
                      </text>
                      <g transform="translate(14, 38)" fill="#cbd5e1" fontSize="7.5" fontFamily="monospace">
                        <text x={0} y={0} fill="#f59e0b" fontWeight="600">Latency Variance:</text>
                        <text x={12} y={14}>• LAN RTT: &lt; 1 ms</text>
                        <text x={12} y={28}>• Transoceanic RTT: &gt; 150 ms</text>
                        <text x={0} y={46} fill="#f87171" fontWeight="600">Static Timeout Pitfalls:</text>
                        <text x={12} y={60}>• Too short: Spurious retransmissions</text>
                        <text x={12} y={74}>• Floods routers with duplicate data</text>
                        <text x={12} y={88}>• Too long: Seconds of stalled pipe</text>
                        <text x={12} y={102} fill="#94a3b8">• Dynamic RTT tracking is mandatory</text>
                      </g>
                    </g>

                    {/* Card 2 at (380, 350): Jacobson's Algorithm */}
                    <g transform="translate(380, 350)">
                      <rect x={0} y={0} width={620} height={175} rx={6} fill="#070c14" stroke="#1e293b" strokeWidth={1.2} />
                      <text x={310} y={20} textAnchor="middle" fill="#f1f5f9" fontSize="8.5" fontWeight="700" fontFamily="monospace">
                        JACOBSON&apos;S ALGORITHM &amp; EXPONENTIAL BACKOFF (RFC 6298)
                      </text>
                      <g transform="translate(20, 38)" fill="#cbd5e1" fontSize="7.5" fontFamily="monospace">
                        <text x={0} y={0} fill="#38bdf8" fontWeight="600">
                          Mathematical Formulation:
                        </text>
                        <text x={0} y={16}>
                          1. Measure Sample RTT (R) for each successfully acknowledged segment.
                        </text>
                        <text x={0} y={32}>
                          2. SRTT ← 0.875 · SRTT + 0.125 · R  |  RTTVAR ← 0.75 · RTTVAR + 0.25 · |SRTT - R|
                        </text>
                        <text x={0} y={48} fill="#fef08a">
                          3. RTO = SRTT + max(G, 4 · RTTVAR) = 40ms + 4×(40ms) = 200 ms.
                        </text>
                        <line x1={0} y1={58} x2={580} y2={58} stroke="#334155" strokeWidth={1} />
                        <text x={0} y={72} fill="#f87171" fontWeight="600">
                          Karn&apos;s Exponential Backoff Rule:
                        </text>
                        <text x={0} y={88}>
                          On consecutive timeouts, RTO doubles: 200ms → 400ms → 800ms.
                        </text>
                        <text x={0} y={104} fill="#4ade80">
                          Prevents congested bottleneck routers from collapsing under retransmissions.
                        </text>
                      </g>
                    </g>

                    {/* Card 3 at (1040, 350): Karn-Partridge Invariant */}
                    <g transform="translate(1040, 350)">
                      <rect x={0} y={0} width={380} height={175} rx={6} fill="#070c14" stroke="#f59e0b" strokeWidth={1.2} />
                      <text x={190} y={20} textAnchor="middle" fill="#fef08a" fontSize="8.5" fontWeight="700" fontFamily="monospace">
                        KARN-PARTRIDGE INVARIANT
                      </text>
                      <g transform="translate(16, 38)" fill="#cbd5e1" fontSize="7.5" fontFamily="monospace">
                        <text x={0} y={0} fill="#f87171" fontWeight="600">The Ambiguity Hazard:</text>
                        <text x={12} y={14}>• Segment sent at t=0ms</text>
                        <text x={12} y={28}>• Retransmitted at t=200ms</text>
                        <text x={12} y={42}>• ACK arrives at t=210ms</text>
                        <text x={0} y={60} fill="#f59e0b" fontWeight="600">Which segment was ACKed?</text>
                        <text x={12} y={74}>• If #1: RTT = 210ms</text>
                        <text x={12} y={88}>• If #2: RTT = 10ms</text>
                        <text x={12} y={102} fill="#4ade80">• Rule: Ignore RTT on retransmits!</text>
                      </g>
                    </g>
                  </>
                )}

                {/* Step 2: Fast Retransmit & SACK */}
                {activeStepIndex === 2 && (
                  <>
                    {/* PC1 State Pill above PC1 */}
                    <g transform="translate(140, 130)">
                      <rect x={-80} y={-10} width={160} height={20} rx={4} fill="#1e1b4b" stroke="#a78bfa" strokeWidth={1} />
                      <text x={0} y={3.5} textAnchor="middle" fill="#c7d2fe" fontSize="7" fontWeight="700" fontFamily="monospace">
                        Fast Retransmit Active (3 Dup ACKs)
                      </text>
                    </g>

                    {/* Server State Pill above Server */}
                    <g transform="translate(1220, 130)">
                      <rect x={-80} y={-10} width={160} height={20} rx={4} fill="#064e3b" stroke="#34d399" strokeWidth={1} />
                      <text x={0} y={3.5} textAnchor="middle" fill="#6ee7b7" fontSize="7" fontWeight="700" fontFamily="monospace">
                        SACK Blocks: [3000-5000] Buffered
                      </text>
                    </g>

                    {/* Center Overhead: Fast Retransmit & SACK Blocks */}
                    <g transform="translate(460, 65)">
                      <rect x={0} y={0} width={560} height={95} rx={6} fill="#070c14" stroke="#a78bfa" strokeWidth={1.2} />
                      <text x={280} y={18} textAnchor="middle" fill="#a78bfa" fontSize="8" fontWeight="700" fontFamily="monospace">
                        FAST RETRANSMIT (3 DUP ACKS) &amp; SACK BLOCKS (RFC 2018)
                      </text>
                      <g transform="translate(20, 34)" fill="#cbd5e1" fontSize="7.2" fontFamily="monospace">
                        <text x={0} y={0} fill="#38bdf8">
                          • Out-of-order arrival: Seg 1 (1000..1999) &amp; Seg 3-4 (3000..5000) received
                        </text>
                        <text x={0} y={16} fill="#f59e0b">
                          • Seg 2 (2000..2999) missing → Server sends 3 Dup ACKs with ack=2000
                        </text>
                        <text x={0} y={32} fill="#6ee7b7">
                          • SACK Option reports: [3000-5000] safely buffered in receiver memory
                        </text>
                        <text x={0} y={48} fill="#a78bfa" fontWeight="600">
                          • Fast Retransmit: Sender retransmits ONLY missing gap [2000..2999] in 1 RTT!
                        </text>
                      </g>
                    </g>

                    {/* In-Flight Packet Badge on Cable 2: Span 806..1220 (414px) */}
                    <g transform="translate(1013, 250)">
                      <rect
                        x={-170}
                        y={-11}
                        width={340}
                        height={22}
                        rx={4}
                        fill="#1e1b4b"
                        stroke="#a78bfa"
                        strokeWidth={1.5}
                        className="animate-pulse"
                      />
                      <text
                        x={0}
                        y={4}
                        textAnchor="middle"
                        fill="#c7d2fe"
                        fontSize="7"
                        fontWeight="700"
                        fontFamily="monospace"
                      >
                        [FAST RETRANSMIT] seq=2000..2999 (SACK Gap Repaired)
                      </text>
                    </g>

                    {/* Card 1 at (70, 350): The 3 Dup ACKs Threshold */}
                    <g transform="translate(70, 350)">
                      <rect x={0} y={0} width={280} height={175} rx={6} fill="#070c14" stroke="#a78bfa" strokeWidth={1.2} />
                      <text x={140} y={20} textAnchor="middle" fill="#c7d2fe" fontSize="8.5" fontWeight="700" fontFamily="monospace">
                        THE 3 DUP ACKS THRESHOLD
                      </text>
                      <g transform="translate(14, 38)" fill="#cbd5e1" fontSize="7.5" fontFamily="monospace">
                        <text x={0} y={0} fill="#a78bfa" fontWeight="600">Why wait for 3 Dup ACKs?</text>
                        <text x={12} y={14}>• 1 Dup ACK: Likely minor reorder</text>
                        <text x={12} y={28}>• 2 Dup ACKs: Possible packet delay</text>
                        <text x={12} y={42} fill="#6ee7b7">• 3 Dup ACKs: Statistical certainty of loss</text>
                        <text x={0} y={60} fill="#f59e0b" fontWeight="600">Performance Advantage:</text>
                        <text x={12} y={74}>• Bypasses 200ms RTO timeout</text>
                        <text x={12} y={88}>• Recovers packet in exactly 1 RTT</text>
                        <text x={12} y={102} fill="#94a3b8">• Pipeline throughput stays high</text>
                      </g>
                    </g>

                    {/* Card 2 at (380, 350): Selective Acknowledgment (RFC 2018) */}
                    <g transform="translate(380, 350)">
                      <rect x={0} y={0} width={620} height={175} rx={6} fill="#070c14" stroke="#1e293b" strokeWidth={1.2} />
                      <text x={310} y={20} textAnchor="middle" fill="#f1f5f9" fontSize="8.5" fontWeight="700" fontFamily="monospace">
                        SELECTIVE ACKNOWLEDGMENT (RFC 2018)
                      </text>
                      <g transform="translate(20, 38)" fill="#cbd5e1" fontSize="7.5" fontFamily="monospace">
                        <text x={0} y={0} fill="#4ade80" fontWeight="600">
                          SACK vs Legacy Cumulative ACKs:
                        </text>
                        <text x={0} y={16}>
                          • Under standard cumulative ACKs, the sender cannot tell which out-of-order packets arrived.
                        </text>
                        <text x={0} y={32}>
                          • In legacy TCP (Tahoe/Reno), the sender retransmitted Segments 2, 3, and 4 (wasteful).
                        </text>
                        <text x={0} y={48} fill="#c7d2fe">
                          • RFC 2018 SACK option carries up to 4 non-contiguous byte blocks: SACK=[3000-5000].
                        </text>
                        <line x1={0} y1={58} x2={580} y2={58} stroke="#334155" strokeWidth={1} />
                        <text x={0} y={72} fill="#38bdf8" fontWeight="600">
                          Exact Gap Repair:
                        </text>
                        <text x={0} y={88}>
                          The sender retransmits solely the missing gap: bytes 2000–2999.
                        </text>
                        <text x={0} y={104} fill="#cbd5e1">
                          Conserves network bandwidth and eliminates duplicate delivery on high-bandwidth links.
                        </text>
                      </g>
                    </g>

                    {/* Card 3 at (1040, 350): Telemetry from ss -ti */}
                    <g transform="translate(1040, 350)">
                      <rect x={0} y={0} width={380} height={175} rx={6} fill="#070c14" stroke="#a78bfa" strokeWidth={1.2} />
                      <text x={190} y={20} textAnchor="middle" fill="#c7d2fe" fontSize="8.5" fontWeight="700" fontFamily="monospace">
                        TELEMETRY FROM SS -TI
                      </text>
                      <g transform="translate(16, 38)" fill="#cbd5e1" fontSize="7.5" fontFamily="monospace">
                        <text x={0} y={0} fill="#60a5fa" fontWeight="600">Kernel Socket Diagnostics:</text>
                        <text x={12} y={14}>• dupack: 3 (Threshold met)</text>
                        <text x={12} y={28}>• rcvoopack: 2 (Out-of-order rx)</text>
                        <text x={12} y={42}>• rtt: 41.2 ms (Round-trip time)</text>
                        <text x={0} y={60} fill="#4ade80" fontWeight="600">Latency Saved:</text>
                        <text x={12} y={74}>• RTO wait time: 200.0 ms</text>
                        <text x={12} y={88}>• Fast Retransmit: 41.2 ms</text>
                        <text x={12} y={102} fill="#34d399">• Latency reduction: 158.8 ms saved</text>
                      </g>
                    </g>
                  </>
                )}

                {/* Step 3: Flow Control & The Advertised Receive Window */}
                {activeStepIndex === 3 && (
                  <>
                    {/* PC1 State Pill above PC1 */}
                    <g transform="translate(140, 130)">
                      <rect x={-75} y={-10} width={150} height={20} rx={4} fill="#0c1a30" stroke="#38bdf8" strokeWidth={1} />
                      <text x={0} y={3.5} textAnchor="middle" fill="#7dd3fc" fontSize="7" fontWeight="700" fontFamily="monospace">
                        Sliding Window: win=65535
                      </text>
                    </g>

                    {/* Server State Pill above Server */}
                    <g transform="translate(1220, 130)">
                      <rect x={-75} y={-10} width={150} height={20} rx={4} fill="#064e3b" stroke="#34d399" strokeWidth={1} />
                      <text x={0} y={3.5} textAnchor="middle" fill="#6ee7b7" fontSize="7" fontWeight="700" fontFamily="monospace">
                        RcvBuffer: 64KB Free Space
                      </text>
                    </g>

                    {/* Center Overhead: Flow Control & Sliding Window */}
                    <g transform="translate(460, 65)">
                      <rect x={0} y={0} width={560} height={95} rx={6} fill="#070c14" stroke="#38bdf8" strokeWidth={1.2} />
                      <text x={280} y={18} textAnchor="middle" fill="#38bdf8" fontSize="8" fontWeight="700" fontFamily="monospace">
                        FLOW CONTROL: SLIDING WINDOW &amp; ZERO-WINDOW PROBING
                      </text>
                      <g transform="translate(20, 34)" fill="#cbd5e1" fontSize="7.2" fontFamily="monospace">
                        <text x={0} y={0} fill="#38bdf8">
                          • Invariant: Max allowed in-flight bytes = LastByteAcked + win
                        </text>
                        <text x={0} y={16} fill="#4ade80">
                          • Receiver Advertised Window: win=65535 (64 KB free buffer credit)
                        </text>
                        <text x={0} y={32} fill="#f59e0b">
                          • Zero Window Hazard: win=0 halts sender; lost update causes deadlock
                        </text>
                        <text x={0} y={48} fill="#6ee7b7" fontWeight="600">
                          • Persist Timer: Fires 1-byte probe to force receiver window update ACK
                        </text>
                      </g>
                    </g>

                    {/* In-Flight Packet Badge on Cable 2: Span 806..1220 (414px) */}
                    <g transform="translate(1013, 250)">
                      <rect
                        x={-170}
                        y={-11}
                        width={340}
                        height={22}
                        rx={4}
                        fill="#0c1a30"
                        stroke="#38bdf8"
                        strokeWidth={1.5}
                        className="animate-pulse"
                      />
                      <text
                        x={0}
                        y={4}
                        textAnchor="middle"
                        fill="#38bdf8"
                        fontSize="7"
                        fontWeight="700"
                        fontFamily="monospace"
                      >
                        [TCP ACK] win=65535 (Buffer Credit: 64 KB Available)
                      </text>
                    </g>

                    {/* Card 1 at (70, 350): Receive Buffer Constraints */}
                    <g transform="translate(70, 350)">
                      <rect x={0} y={0} width={280} height={175} rx={6} fill="#070c14" stroke="#38bdf8" strokeWidth={1.2} />
                      <text x={140} y={20} textAnchor="middle" fill="#38bdf8" fontSize="8.5" fontWeight="700" fontFamily="monospace">
                        RECEIVE BUFFER CONSTRAINTS
                      </text>
                      <g transform="translate(14, 38)" fill="#cbd5e1" fontSize="7.5" fontFamily="monospace">
                        <text x={0} y={0} fill="#60a5fa" fontWeight="600">Kernel Buffer Limits:</text>
                        <text x={12} y={14}>• OS allocates SO_RCVBUF</text>
                        <text x={12} y={28}>• Typically 64 KB to several MB</text>
                        <text x={12} y={42}>• Slow apps delay calling read()</text>
                        <text x={0} y={60} fill="#f87171" fontWeight="600">Buffer Overflow Hazard:</text>
                        <text x={12} y={74}>• Overflowed packets get dropped</text>
                        <text x={12} y={88}>• Flow control throttles sender</text>
                        <text x={12} y={102} fill="#4ade80">• Prevents buffer discard storms</text>
                      </g>
                    </g>

                    {/* Card 2 at (380, 350): Zero Window & Persist Timer Deadlock */}
                    <g transform="translate(380, 350)">
                      <rect x={0} y={0} width={620} height={175} rx={6} fill="#070c14" stroke="#1e293b" strokeWidth={1.2} />
                      <text x={310} y={20} textAnchor="middle" fill="#f1f5f9" fontSize="8.5" fontWeight="700" fontFamily="monospace">
                        ZERO WINDOW &amp; PERSIST TIMER DEADLOCK
                      </text>
                      <g transform="translate(20, 38)" fill="#cbd5e1" fontSize="7.5" fontFamily="monospace">
                        <text x={0} y={0} fill="#f59e0b" fontWeight="600">
                          The Deadlock Scenario:
                        </text>
                        <text x={0} y={16}>
                          1. Receiver buffer fills completely → Receiver advertises win = 0. Sender halts transmission.
                        </text>
                        <text x={0} y={32}>
                          2. Receiver app reads data and frees space → Receiver sends window update ACK (win = 65535).
                        </text>
                        <text x={0} y={48} fill="#f87171">
                          3. If that window update ACK is dropped in transit: Both sides wait forever (Deadlock)!
                        </text>
                        <line x1={0} y1={58} x2={580} y2={58} stroke="#334155" strokeWidth={1} />
                        <text x={0} y={72} fill="#4ade80" fontWeight="600">
                          The Persist Timer Solution:
                        </text>
                        <text x={0} y={88}>
                          Sender arms a Persist Timer when win=0. When it expires, sender sends a 1-byte Zero-Window Probe.
                        </text>
                        <text x={0} y={104} fill="#cbd5e1">
                          The probe forces the receiver to respond with an ACK containing its current window size!
                        </text>
                      </g>
                    </g>

                    {/* Card 3 at (1040, 350): Window Scale Option */}
                    <g transform="translate(1040, 350)">
                      <rect x={0} y={0} width={380} height={175} rx={6} fill="#070c14" stroke="#38bdf8" strokeWidth={1.2} />
                      <text x={190} y={20} textAnchor="middle" fill="#38bdf8" fontSize="8.5" fontWeight="700" fontFamily="monospace">
                        WINDOW SCALE OPTION (RFC 7323)
                      </text>
                      <g transform="translate(16, 38)" fill="#cbd5e1" fontSize="7.5" fontFamily="monospace">
                        <text x={0} y={0} fill="#60a5fa" fontWeight="600">16-Bit Header Limit:</text>
                        <text x={12} y={14}>• 16-bit field max = 65,535 bytes</text>
                        <text x={12} y={28}>• 64 KB cap limits BDP throughput</text>
                        <text x={0} y={46} fill="#4ade80" fontWeight="600">RFC 7323 Scaling Factor:</text>
                        <text x={12} y={60}>• Window Scale negotiated in SYN</text>
                        <text x={12} y={74}>• Bit-shifts window value up to 14</text>
                        <text x={12} y={88} fill="#38bdf8">• Max window increases to 1 Gigabyte</text>
                        <text x={12} y={102} fill="#94a3b8">• Essential for modern multi-Gbps WAN</text>
                      </g>
                    </g>
                  </>
                )}

                {/* Step 4: Recap: The 4 Core Invariants of TCP Reliable Delivery */}
                {activeStepIndex === 4 && (
                  <>
                    {/* Card 1 at (70, 350): Layer 4 Reliability Cheat Sheet */}
                    <g transform="translate(70, 350)">
                      <rect x={0} y={0} width={280} height={185} rx={6} fill="#070c14" stroke="#38bdf8" strokeWidth={1.2} />
                      <text x={140} y={20} textAnchor="middle" fill="#38bdf8" fontSize="8.5" fontWeight="700" fontFamily="monospace">
                        LAYER 4 RELIABILITY CHEAT SHEET
                      </text>
                      <g transform="translate(14, 38)" fill="#cbd5e1" fontSize="7.5" fontFamily="monospace">
                        <text x={0} y={0} fill="#38bdf8" fontWeight="600">Accounting: Byte Stream</text>
                        <text x={12} y={13} fill="#94a3b8">seq counts bytes; ack is cumulative</text>
                        <text x={0} y={27} fill="#f59e0b" fontWeight="600">Timer: Dynamic RTO</text>
                        <text x={12} y={40} fill="#94a3b8">Jacobson SRTT + Karn Backoff</text>
                        <text x={0} y={54} fill="#a78bfa" fontWeight="600">Loss: Fast Retransmit</text>
                        <text x={12} y={67} fill="#94a3b8">3 Dup ACKs + SACK blocks</text>
                        <text x={0} y={81} fill="#4ade80" fontWeight="600">Flow: Sliding Window</text>
                        <text x={12} y={94} fill="#94a3b8">win field + Zero-Window Probes</text>
                        <text x={0} y={112} fill="#38bdf8" fontWeight="600">Reliability Mastered</text>
                      </g>
                    </g>

                    {/* Card 2 at (380, 350): The 4 Core Invariants */}
                    <g transform="translate(380, 350)">
                      <rect x={0} y={0} width={720} height={185} rx={8} fill="#070c14" stroke="#38bdf8" strokeWidth={1.3} />
                      <text x={360} y={22} textAnchor="middle" fill="#38bdf8" fontSize="9.5" fontWeight="700" fontFamily="monospace">
                        THE 4 CORE INVARIANTS OF TCP RELIABLE DELIVERY
                      </text>
                      <g transform="translate(20, 42)" fill="#cbd5e1" fontSize="8" fontFamily="monospace">
                        <text x={0} y={0}>
                          1. BYTE-STREAM ACCOUNTING: TCP sequence numbers count every individual payload byte; cumulative ACKs confirm unbroken contiguous receipt and request the next expected byte.
                        </text>
                        <text x={0} y={16}>
                          2. DYNAMIC RTO &amp; BACKOFF: TCP calculates dynamic RTO from Smoothed RTT and RTT variance; consecutive timeouts double the timer (exponential backoff) to prevent network collapse.
                        </text>
                        <text x={0} y={32}>
                          3. FAST RETRANSMIT &amp; SACK: Three duplicate ACKs trigger Fast Retransmit without waiting for RTO; SACK blocks tell the sender precisely which non-contiguous blocks were received.
                        </text>
                        <text x={0} y={48} fill="#4ade80" fontWeight="600">
                          4. RECEIVE WINDOW FLOW CONTROL: The advertised window field (win) bounds sender transmission to receiver free buffer space; zero-window probes prevent receiver deadlock.
                        </text>
                        <line x1={0} y1={60} x2={680} y2={60} stroke="#1e293b" strokeWidth={1} />
                        <text x={0} y={78} fill="#a78bfa" fontWeight="600">
                          Stage 5 Reliable Transport Complete! You understand how TCP delivers lossless byte streams over lossy IP networks.
                        </text>
                        <text x={0} y={96} fill="#6ee7b7" fontWeight="600">
                          Next: Day 19 · UDP: Fast, Simple and Connectionless →
                        </text>
                      </g>
                    </g>

                    {/* Card 3 at (1130, 350): Reliability Metrics */}
                    <g transform="translate(1130, 350)">
                      <rect x={0} y={0} width={280} height={185} rx={6} fill="#070c14" stroke="#1e293b" strokeWidth={1.2} />
                      <text x={140} y={20} textAnchor="middle" fill="#f1f5f9" fontSize="8.5" fontWeight="700" fontFamily="monospace">
                        RELIABILITY METRICS
                      </text>
                      <g transform="translate(16, 38)" fill="#cbd5e1" fontSize="7.5" fontFamily="monospace">
                        <text x={0} y={0}>Accounting: Byte-granular</text>
                        <text x={0} y={16}>Loss Detection: RTO (200ms)</text>
                        <text x={0} y={32}>Fast Retransmit: 3 Dup ACKs</text>
                        <text x={0} y={48}>SACK Blocks: RFC 2018</text>
                        <text x={0} y={64} fill="#4ade80" fontWeight="600">
                          Flow Control: win=65535
                        </text>
                        <text x={0} y={80} fill="#38bdf8">
                          Deadlock: Zero-Window Probe
                        </text>
                        <text x={0} y={96} fill="#6ee7b7" fontWeight="600">
                          Status: 100% Production Ready
                        </text>
                      </g>
                    </g>
                  </>
                )}
              </>
);
