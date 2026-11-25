import React from 'react';
import type { DayCanvasProps } from './types';
import { SvgWorkstation } from '../SvgWorkstation';
import { SvgRouter } from '../SvgRouter';
import { SvgCable } from '../SvgCable';

export const Day17Canvas: React.FC<DayCanvasProps> = ({ activeStepIndex, isPinging }) => (
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
                  TCP CONNECTION LIFECYCLE · 3-WAY HANDSHAKE &amp; 4-WAY TEARDOWN
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
                    activeStepIndex === 2
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
                    activeStepIndex === 2
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
                  isPinging={isPinging || activeStepIndex === 0 || activeStepIndex === 1 || activeStepIndex === 2}
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
                  isPinging={isPinging || activeStepIndex === 0 || activeStepIndex === 1 || activeStepIndex === 2}
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
                  isPinging={isPinging || activeStepIndex === 0 || activeStepIndex === 1 || activeStepIndex === 2}
                />

                {/* ================= STEP-SPECIFIC OVERLAYS ================= */}

                {/* Step 0: Connection Initiation & ISN */}
                {activeStepIndex === 0 && (
                  <>
                    {/* PC1 State Pill above PC1 */}
                    <g transform="translate(140, 130)">
                      <rect x={-60} y={-10} width={120} height={20} rx={4} fill="#451a03" stroke="#f59e0b" strokeWidth={1} />
                      <text x={0} y={3.5} textAnchor="middle" fill="#fef08a" fontSize="7" fontWeight="700" fontFamily="monospace">
                        State: SYN_SENT
                      </text>
                    </g>

                    {/* Server State Pill above Server */}
                    <g transform="translate(1220, 130)">
                      <rect x={-55} y={-10} width={110} height={20} rx={4} fill="#0c1a30" stroke="#38bdf8" strokeWidth={1} />
                      <text x={0} y={3.5} textAnchor="middle" fill="#7dd3fc" fontSize="7" fontWeight="700" fontFamily="monospace">
                        State: LISTEN
                      </text>
                    </g>

                    {/* In-Flight Packet Badge on Cable 1: Span 228..680 (452px) */}
                    <g transform="translate(454, 250)">
                      <rect
                        x={-160}
                        y={-11}
                        width={320}
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
                        [TCP SYN] seq=1000 ack=0 (ISN_c)
                      </text>
                    </g>

                    {/* Card 1 at (70, 350): TCP Header Anatomy */}
                    <g transform="translate(70, 350)">
                      <rect x={0} y={0} width={280} height={175} rx={6} fill="#070c14" stroke="#38bdf8" strokeWidth={1.2} />
                      <text x={140} y={20} textAnchor="middle" fill="#38bdf8" fontSize="8.5" fontWeight="700" fontFamily="monospace">
                        TCP HEADER ANATOMY
                      </text>
                      <g transform="translate(14, 38)" fill="#cbd5e1" fontSize="7.5" fontFamily="monospace">
                        <text x={0} y={0} fill="#60a5fa" fontWeight="600">Core 20-Byte Header:</text>
                        <text x={12} y={14}>• 32-bit Sequence Number: Byte offset</text>
                        <text x={12} y={28}>• 32-bit Acknowledgment: Expected byte</text>
                        <text x={12} y={42} fill="#38bdf8">• Flags: SYN, ACK, FIN, RST</text>
                        <text x={12} y={56}>• Window Size: Flow control credit</text>
                        <text x={12} y={70}>• Checksum: End-to-end integrity</text>
                        <text x={0} y={88} fill="#4ade80" fontWeight="600">State-Driven Architecture:</text>
                        <text x={12} y={102} fill="#94a3b8">Kernel tracks bytes, not loose packets</text>
                      </g>
                    </g>

                    {/* Card 2 at (380, 350): ISN Synchronization */}
                    <g transform="translate(380, 350)">
                      <rect x={0} y={0} width={620} height={175} rx={6} fill="#070c14" stroke="#1e293b" strokeWidth={1.2} />
                      <text x={310} y={20} textAnchor="middle" fill="#f1f5f9" fontSize="8.5" fontWeight="700" fontFamily="monospace">
                        INITIAL SEQUENCE NUMBER (ISN) SYNCHRONIZATION
                      </text>
                      <g transform="translate(20, 38)" fill="#cbd5e1" fontSize="7.5" fontFamily="monospace">
                        <text x={0} y={0} fill="#f59e0b" fontWeight="600">
                          Why do sequence numbers start at random numbers instead of 0?
                        </text>
                        <text x={0} y={16}>
                          1. Prevents duplicate packet collision from an earlier, closed session with the same 5-tuple
                        </text>
                        <text x={0} y={32}>
                          2. Protects against sequence prediction &amp; off-path TCP connection hijacking attacks
                        </text>
                        <text x={0} y={48} fill="#38bdf8">
                          3. RFC 6528: Clock-driven PRNG generates cryptographically isolated ISNs per connection
                        </text>
                        <line x1={0} y1={58} x2={580} y2={58} stroke="#334155" strokeWidth={1} />
                        <text x={0} y={72} fill="#4ade80" fontWeight="600">
                          Observed Transmission:
                        </text>
                        <text x={0} y={88}>
                          [1] OUTBOUND: 192.168.1.10:52101 → 198.51.100.10:80 [SYN] seq=1000 ack=0
                        </text>
                        <text x={0} y={104} fill="#cbd5e1">
                          Client state: CLOSED → SYN_SENT (Kernel commits temporary memory &amp; arms timer)
                        </text>
                      </g>
                    </g>

                    {/* Card 3 at (1040, 350): Connectionless IP vs Stateful TCP */}
                    <g transform="translate(1040, 350)">
                      <rect x={0} y={0} width={380} height={175} rx={6} fill="#070c14" stroke="#38bdf8" strokeWidth={1.2} />
                      <text x={190} y={20} textAnchor="middle" fill="#38bdf8" fontSize="8.5" fontWeight="700" fontFamily="monospace">
                        CONNECTIONLESS IP VS STATEFUL TCP
                      </text>
                      <g transform="translate(16, 38)" fill="#cbd5e1" fontSize="7.5" fontFamily="monospace">
                        <text x={0} y={0} fill="#f87171" fontWeight="600">Layer 3 (IP): Connectionless</text>
                        <text x={12} y={14}>• Best-effort datagram delivery</text>
                        <text x={12} y={28}>• Routers have no memory of flows</text>
                        <text x={12} y={42}>• Packets may arrive out-of-order</text>
                        <text x={0} y={60} fill="#4ade80" fontWeight="600">Layer 4 (TCP): Stateful</text>
                        <text x={12} y={74}>• Synchronized kernel state machines</text>
                        <text x={12} y={88}>• Guarantees ordered byte reassembly</text>
                        <text x={12} y={102} fill="#94a3b8">• Full-duplex reliable byte stream</text>
                      </g>
                    </g>
                  </>
                )}

                {/* Step 1: The 3-Way Handshake & ESTABLISHED */}
                {activeStepIndex === 1 && (
                  <>
                    {/* Overhead 3-Way Handshake Ladder Diagram across x=460..1020 */}
                    <g transform="translate(460, 65)">
                      <rect x={0} y={0} width={560} height={95} rx={6} fill="#070c14" stroke="#38bdf8" strokeWidth={1.2} />
                      <text x={280} y={18} textAnchor="middle" fill="#38bdf8" fontSize="8" fontWeight="700" fontFamily="monospace">
                        TCP 3-WAY HANDSHAKE SEQUENCE (RFC 793)
                      </text>
                      <g transform="translate(20, 34)" fill="#cbd5e1" fontSize="7.2" fontFamily="monospace">
                        <text x={0} y={0} fill="#38bdf8">
                          [1] PC1 → SYN (seq=1000) → Server (SYN_SENT)
                        </text>
                        <text x={0} y={16} fill="#4ade80">
                          [2] Server → SYN, ACK (seq=5000, ack=1001) → PC1 (SYN_RECEIVED)
                        </text>
                        <text x={0} y={32} fill="#38bdf8">
                          [3] PC1 → ACK (seq=1001, ack=5001) → Server
                        </text>
                        <text x={0} y={48} fill="#6ee7b7" fontWeight="600">
                          ✓ Both endpoints synchronized · State: ESTABLISHED
                        </text>
                      </g>
                    </g>

                    {/* PC1 State Pill */}
                    <g transform="translate(140, 130)">
                      <rect x={-65} y={-10} width={130} height={20} rx={4} fill="#064e3b" stroke="#34d399" strokeWidth={1} />
                      <text x={0} y={3.5} textAnchor="middle" fill="#6ee7b7" fontSize="7" fontWeight="700" fontFamily="monospace">
                        State: ESTABLISHED
                      </text>
                    </g>

                    {/* Server State Pill */}
                    <g transform="translate(1220, 130)">
                      <rect x={-65} y={-10} width={130} height={20} rx={4} fill="#064e3b" stroke="#34d399" strokeWidth={1} />
                      <text x={0} y={3.5} textAnchor="middle" fill="#6ee7b7" fontSize="7" fontWeight="700" fontFamily="monospace">
                        State: ESTABLISHED
                      </text>
                    </g>

                    {/* In-Flight Packet Badge on Cable 2: Span 806..1220 (414px) */}
                    <g transform="translate(1013, 250)">
                      <rect
                        x={-170}
                        y={-11}
                        width={340}
                        height={22}
                        rx={4}
                        fill="#064e3b"
                        stroke="#34d399"
                        strokeWidth={1.5}
                        className="animate-pulse"
                      />
                      <text
                        x={0}
                        y={4}
                        textAnchor="middle"
                        fill="#6ee7b7"
                        fontSize="7"
                        fontWeight="700"
                        fontFamily="monospace"
                      >
                        [TCP ACK] seq=1001 ack=5001 (Handshake Complete)
                      </text>
                    </g>

                    {/* Card 1 at (70, 350): The 3-Way Handshake */}
                    <g transform="translate(70, 350)">
                      <rect x={0} y={0} width={280} height={175} rx={6} fill="#070c14" stroke="#38bdf8" strokeWidth={1.2} />
                      <text x={140} y={20} textAnchor="middle" fill="#38bdf8" fontSize="8.5" fontWeight="700" fontFamily="monospace">
                        THE 3-WAY HANDSHAKE
                      </text>
                      <g transform="translate(14, 38)" fill="#cbd5e1" fontSize="7.5" fontFamily="monospace">
                        <text x={0} y={0} fill="#38bdf8" fontWeight="600">3 Handshake Packets:</text>
                        <text x={12} y={14}>1. SYN: Client announces ISN_c</text>
                        <text x={12} y={28}>2. SYN-ACK: Server announces ISN_s</text>
                        <text x={12} y={42}>3. ACK: Client confirms ISN_s</text>
                        <text x={0} y={60} fill="#4ade80" fontWeight="600">Operational Results:</text>
                        <text x={12} y={74}>• Both byte counters synchronized</text>
                        <text x={12} y={88}>• Buffer memory committed</text>
                        <text x={12} y={102} fill="#34d399">• Bi-directional channel active</text>
                      </g>
                    </g>

                    {/* Card 2 at (380, 350): Why 2-Way Handshakes Fail */}
                    <g transform="translate(380, 350)">
                      <rect x={0} y={0} width={620} height={175} rx={6} fill="#070c14" stroke="#1e293b" strokeWidth={1.2} />
                      <text x={310} y={20} textAnchor="middle" fill="#f1f5f9" fontSize="8.5" fontWeight="700" fontFamily="monospace">
                        WHY 2-WAY HANDSHAKES FAIL (GHOST CONNECTIONS)
                      </text>
                      <g transform="translate(20, 38)" fill="#cbd5e1" fontSize="7.5" fontFamily="monospace">
                        <text x={0} y={0} fill="#f87171" fontWeight="600">
                          The Fundamental Problem of Distributed Systems:
                        </text>
                        <text x={0} y={16}>
                          • If TCP only used 2 packets (SYN and SYN-ACK), the server would establish state on SYN-ACK.
                        </text>
                        <text x={0} y={32}>
                          • But if a delayed duplicate SYN from an old session arrives, the server opens a ghost connection!
                        </text>
                        <text x={0} y={48}>
                          • The client never requested it, so the client ignores the SYN-ACK.
                        </text>
                        <text x={0} y={64} fill="#fca5a5">
                          • Result: The server keeps memory allocated indefinitely for a non-existent conversation!
                        </text>
                        <line x1={0} y1={74} x2={580} y2={74} stroke="#334155" strokeWidth={1} />
                        <text x={0} y={88} fill="#34d399" fontWeight="600">
                          The 3rd Packet (ACK) Invariant:
                        </text>
                        <text x={0} y={104} fill="#cbd5e1">
                          Proves to the server that the client is actually alive and capable of bidirectional communication
                        </text>
                      </g>
                    </g>

                    {/* Card 3 at (1040, 350): Socket Buffer Commitment */}
                    <g transform="translate(1040, 350)">
                      <rect x={0} y={0} width={380} height={175} rx={6} fill="#070c14" stroke="#38bdf8" strokeWidth={1.2} />
                      <text x={190} y={20} textAnchor="middle" fill="#38bdf8" fontSize="8.5" fontWeight="700" fontFamily="monospace">
                        SOCKET BUFFER COMMITMENT
                      </text>
                      <g transform="translate(16, 38)" fill="#cbd5e1" fontSize="7.5" fontFamily="monospace">
                        <text x={0} y={0} fill="#60a5fa" fontWeight="600">What Happens at ESTABLISHED:</text>
                        <text x={12} y={14}>• Kernel allocates send &amp; recv ring buffers</text>
                        <text x={12} y={28}>• Default buffer: ~64 KB to 4 MB per socket</text>
                        <text x={12} y={42}>• Window Scale (RFC 7323) enabled</text>
                        <text x={12} y={56}>• Apps can now issue write() and read()</text>
                        <text x={0} y={74} fill="#4ade80" fontWeight="600">Payload Ready:</text>
                        <text x={12} y={88}>Socket is now primed for HTTP GET requests</text>
                        <text x={12} y={102} fill="#94a3b8">and TLS cryptographic handshakes</text>
                      </g>
                    </g>
                  </>
                )}

                {/* Step 2: The 4-Way Teardown & Half-Closed State */}
                {activeStepIndex === 2 && (
                  <>
                    {/* Overhead 4-Way Teardown Ladder Diagram across x=460..1020 */}
                    <g transform="translate(460, 65)">
                      <rect x={0} y={0} width={560} height={95} rx={6} fill="#070c14" stroke="#a78bfa" strokeWidth={1.2} />
                      <text x={280} y={18} textAnchor="middle" fill="#a78bfa" fontSize="8" fontWeight="700" fontFamily="monospace">
                        TCP 4-WAY TEARDOWN SEQUENCE (RFC 793)
                      </text>
                      <g transform="translate(20, 34)" fill="#cbd5e1" fontSize="7.2" fontFamily="monospace">
                        <text x={0} y={0} fill="#a78bfa">
                          [1] PC1 → FIN, ACK (seq=1001, ack=5001) → Server [FIN_WAIT_1]
                        </text>
                        <text x={0} y={16} fill="#f59e0b">
                          [2] Server → ACK (ack=1002) → PC1 [Server: CLOSE_WAIT | Client: FIN_WAIT_2]
                        </text>
                        <text x={0} y={32} fill="#a78bfa">
                          [3] Server → FIN, ACK (seq=5001, ack=1002) → PC1 [Server: LAST_ACK]
                        </text>
                        <text x={0} y={48} fill="#6ee7b7" fontWeight="600">
                          [4] PC1 → ACK (ack=5002) → Server [Server: CLOSED | Client: TIME_WAIT]
                        </text>
                      </g>
                    </g>

                    {/* PC1 State Pill */}
                    <g transform="translate(140, 130)">
                      <rect x={-65} y={-10} width={130} height={20} rx={4} fill="#1e1b4b" stroke="#a78bfa" strokeWidth={1} />
                      <text x={0} y={3.5} textAnchor="middle" fill="#c7d2fe" fontSize="7" fontWeight="700" fontFamily="monospace">
                        State: FIN_WAIT_2
                      </text>
                    </g>

                    {/* Server State Pill */}
                    <g transform="translate(1220, 130)">
                      <rect x={-65} y={-10} width={130} height={20} rx={4} fill="#451a03" stroke="#f59e0b" strokeWidth={1} />
                      <text x={0} y={3.5} textAnchor="middle" fill="#fef08a" fontSize="7" fontWeight="700" fontFamily="monospace">
                        State: CLOSE_WAIT
                      </text>
                    </g>

                    {/* In-Flight Packet Badge on Cable 2 */}
                    <g transform="translate(1013, 250)">
                      <rect
                        x={-165}
                        y={-11}
                        width={330}
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
                        [TCP FIN, ACK] seq=1001 ack=5001 (Client Close)
                      </text>
                    </g>

                    {/* Card 1 at (70, 350): Full-Duplex Teardown */}
                    <g transform="translate(70, 350)">
                      <rect x={0} y={0} width={280} height={175} rx={6} fill="#070c14" stroke="#a78bfa" strokeWidth={1.2} />
                      <text x={140} y={20} textAnchor="middle" fill="#c7d2fe" fontSize="8.5" fontWeight="700" fontFamily="monospace">
                        FULL-DUPLEX TEARDOWN
                      </text>
                      <g transform="translate(14, 38)" fill="#cbd5e1" fontSize="7.5" fontFamily="monospace">
                        <text x={0} y={0} fill="#a78bfa" fontWeight="600">Independent Byte Streams:</text>
                        <text x={12} y={14}>• Stream 1: Client → Server</text>
                        <text x={12} y={28}>• Stream 2: Server → Client</text>
                        <text x={0} y={46} fill="#f59e0b" fontWeight="600">Why 4 Packets?</text>
                        <text x={12} y={60}>• Closing Stream 1 leaves Stream 2 open</text>
                        <text x={12} y={74}>• Server can finish queued replies</text>
                        <text x={12} y={88} fill="#34d399">• Both directions terminate cleanly</text>
                        <text x={12} y={102} fill="#94a3b8">• Eliminates truncated payload data</text>
                      </g>
                    </g>

                    {/* Card 2 at (380, 350): The Half-Closed State */}
                    <g transform="translate(380, 350)">
                      <rect x={0} y={0} width={620} height={175} rx={6} fill="#070c14" stroke="#1e293b" strokeWidth={1.2} />
                      <text x={310} y={20} textAnchor="middle" fill="#f1f5f9" fontSize="8.5" fontWeight="700" fontFamily="monospace">
                        THE HALF-CLOSED STATE (CLOSE_WAIT &amp; FIN_WAIT_2)
                      </text>
                      <g transform="translate(20, 38)" fill="#cbd5e1" fontSize="7.5" fontFamily="monospace">
                        <text x={0} y={0} fill="#f59e0b" fontWeight="600">
                          Step-by-Step State Transition Analysis:
                        </text>
                        <text x={0} y={16}>
                          • Step 1: Client sends FIN. Client enters FIN_WAIT_1.
                        </text>
                        <text x={0} y={32}>
                          • Step 2: Server acknowledges with ACK. Server enters CLOSE_WAIT; Client enters FIN_WAIT_2.
                        </text>
                        <text x={0} y={48} fill="#fef08a">
                          • Crucial Reality: The connection is now Half-Closed! Client cannot send bytes, but Server can!
                        </text>
                        <text x={0} y={64}>
                          • Step 3: When Server application finishes, it calls close() and transmits its own FIN (LAST_ACK).
                        </text>
                        <text x={0} y={80} fill="#4ade80">
                          • Step 4: Client acknowledges Server FIN with ACK. Server closes immediately.
                        </text>
                        <text x={0} y={98} fill="#94a3b8">
                          Active closer (Client) enters TIME_WAIT instead of closing immediately
                        </text>
                      </g>
                    </g>

                    {/* Card 3 at (1040, 350): Graceful vs Abrupt Termination */}
                    <g transform="translate(1040, 350)">
                      <rect x={0} y={0} width={380} height={175} rx={6} fill="#070c14" stroke="#a78bfa" strokeWidth={1.2} />
                      <text x={190} y={20} textAnchor="middle" fill="#c7d2fe" fontSize="8.5" fontWeight="700" fontFamily="monospace">
                        GRACEFUL VS ABRUPT TERMINATION
                      </text>
                      <g transform="translate(16, 38)" fill="#cbd5e1" fontSize="7.5" fontFamily="monospace">
                        <text x={0} y={0} fill="#4ade80" fontWeight="600">Graceful Close (FIN Flag):</text>
                        <text x={12} y={14}>• Transmits queued in-flight bytes</text>
                        <text x={12} y={28}>• Orderly 4-way handshake</text>
                        <text x={12} y={42}>• Application calls close() cleanly</text>
                        <text x={0} y={60} fill="#ef4444" fontWeight="600">Abrupt Close (RST Flag):</text>
                        <text x={12} y={74}>• Process crashes or network resets</text>
                        <text x={12} y={88}>• Drops all unread receive buffers</text>
                        <text x={12} y={102} fill="#94a3b8">• Bypasses 4-way handshake and TIME_WAIT</text>
                      </g>
                    </g>
                  </>
                )}

                {/* Step 3: The TIME_WAIT State & 2MSL Timer */}
                {activeStepIndex === 3 && (
                  <>
                    {/* PC1 State Pill above PC1 */}
                    <g transform="translate(140, 130)">
                      <rect x={-80} y={-10} width={160} height={20} rx={4} fill="#451a03" stroke="#f59e0b" strokeWidth={1} />
                      <text x={0} y={3.5} textAnchor="middle" fill="#fef08a" fontSize="7" fontWeight="700" fontFamily="monospace">
                        State: TIME_WAIT (60s)
                      </text>
                    </g>

                    {/* Server State Pill above Server */}
                    <g transform="translate(1220, 130)">
                      <rect x={-55} y={-10} width={110} height={20} rx={4} fill="#0f172a" stroke="#64748b" strokeWidth={1} />
                      <text x={0} y={3.5} textAnchor="middle" fill="#94a3b8" fontSize="7" fontWeight="700" fontFamily="monospace">
                        State: CLOSED
                      </text>
                    </g>

                    {/* Center Overhead 2MSL Drain Visualization */}
                    <g transform="translate(460, 65)">
                      <rect x={0} y={0} width={560} height={95} rx={6} fill="#070c14" stroke="#f59e0b" strokeWidth={1.2} />
                      <text x={280} y={18} textAnchor="middle" fill="#fef08a" fontSize="8" fontWeight="700" fontFamily="monospace">
                        2MSL SAFETY DRAIN TIMER (60 SECONDS COUNTDOWN)
                      </text>
                      <g transform="translate(20, 34)" fill="#cbd5e1" fontSize="7.2" fontFamily="monospace">
                        <text x={0} y={0} fill="#4ade80">
                          ✓ Purpose 1: Retransmits final ACK if Server re-sends its FIN packet
                        </text>
                        <text x={0} y={16} fill="#38bdf8">
                          ✓ Purpose 2: Drains delayed duplicate segments from internet router queues
                        </text>
                        <text x={0} y={32} fill="#cbd5e1">
                          • Invariant: 5-Tuple (192.168.1.10:52101 ↔ 198.51.100.10:80) cannot be reused
                        </text>
                        <text x={0} y={48} fill="#f59e0b" fontWeight="600">
                          Active Timer: timewait (59.4s remaining / 2MSL) · Port Locked
                        </text>
                      </g>
                    </g>

                    {/* Card 1 at (70, 350): The TIME_WAIT Invariant */}
                    <g transform="translate(70, 350)">
                      <rect x={0} y={0} width={280} height={175} rx={6} fill="#070c14" stroke="#f59e0b" strokeWidth={1.2} />
                      <text x={140} y={20} textAnchor="middle" fill="#fef08a" fontSize="8.5" fontWeight="700" fontFamily="monospace">
                        THE TIME_WAIT INVARIANT
                      </text>
                      <g transform="translate(14, 38)" fill="#cbd5e1" fontSize="7.5" fontFamily="monospace">
                        <text x={0} y={0} fill="#f59e0b" fontWeight="600">Why Lingering is Mandatory:</text>
                        <text x={12} y={14}>• Active closer enters TIME_WAIT</text>
                        <text x={12} y={28}>• Duration = 2 × MSL (60–120s)</text>
                        <text x={12} y={42}>• MSL: Maximum Segment Lifetime</text>
                        <text x={12} y={56}>• Kernel keeps socket record in memory</text>
                        <text x={12} y={70} fill="#38bdf8">• Port is temporarily locked</text>
                        <text x={0} y={88} fill="#4ade80" fontWeight="600">Protocol Guarantee:</text>
                        <text x={12} y={102} fill="#94a3b8">Prevents cross-connection corruption</text>
                      </g>
                    </g>

                    {/* Card 2 at (380, 350): Why 2MSL is Mandatory */}
                    <g transform="translate(380, 350)">
                      <rect x={0} y={0} width={620} height={175} rx={6} fill="#070c14" stroke="#1e293b" strokeWidth={1.2} />
                      <text x={310} y={20} textAnchor="middle" fill="#f1f5f9" fontSize="8.5" fontWeight="700" fontFamily="monospace">
                        WHY 2MSL IS MANDATORY (ACK RESEND &amp; STRAY DRAIN)
                      </text>
                      <g transform="translate(20, 38)" fill="#cbd5e1" fontSize="7.5" fontFamily="monospace">
                        <text x={0} y={0} fill="#4ade80" fontWeight="600">
                          1. Reliability (Guaranteeing Server Closes Cleanly):
                        </text>
                        <text x={12} y={14}>
                          • If the client&apos;s final ACK was dropped in transit, the server re-sends its FIN.
                        </text>
                        <text x={12} y={28}>
                          • Because the client is in TIME_WAIT, it re-transmits the ACK cleanly.
                        </text>
                        <text x={12} y={42} fill="#fca5a5">
                          • If client had closed immediately, it would reply with TCP RST, triggering a server error!
                        </text>
                        <line x1={0} y1={52} x2={580} y2={52} stroke="#334155" strokeWidth={1} />
                        <text x={0} y={66} fill="#38bdf8" fontWeight="600">
                          2. Safety (Preventing Old Duplicate Packet Corruption):
                        </text>
                        <text x={12} y={80}>
                          • Packets can be delayed in router queue buffers across the internet for dozens of seconds.
                        </text>
                        <text x={12} y={94}>
                          • The 2MSL timer ensures all old delayed packets expire before the 5-tuple can be reused!
                        </text>
                      </g>
                    </g>

                    {/* Card 3 at (1040, 350): TIME_WAIT Socket Exhaustion */}
                    <g transform="translate(1040, 350)">
                      <rect x={0} y={0} width={380} height={175} rx={6} fill="#070c14" stroke="#f59e0b" strokeWidth={1.2} />
                      <text x={190} y={20} textAnchor="middle" fill="#fef08a" fontSize="8.5" fontWeight="700" fontFamily="monospace">
                        TIME_WAIT SOCKET EXHAUSTION
                      </text>
                      <g transform="translate(16, 38)" fill="#cbd5e1" fontSize="7.5" fontFamily="monospace">
                        <text x={0} y={0} fill="#f87171" fontWeight="600">Production Web Scale Hazard:</text>
                        <text x={12} y={14}>• High-traffic proxies (Nginx / Envoy)</text>
                        <text x={12} y={28}>• 30,000 requests/sec with active close</text>
                        <text x={12} y={42}>• Exhausts ephemeral port pool (28k ports)</text>
                        <text x={0} y={60} fill="#4ade80" fontWeight="600">Production Mitigations:</text>
                        <text x={12} y={74}>• HTTP Keep-Alive (reusing TCP sessions)</text>
                        <text x={12} y={88}>• tcp_tw_reuse kernel sysctl flag</text>
                        <text x={12} y={102} fill="#94a3b8">• Let the client close instead of the proxy</text>
                      </g>
                    </g>
                  </>
                )}

                {/* Step 4: Recap: The 4 Core Rules of TCP Connection Management */}
                {activeStepIndex === 4 && (
                  <>
                    {/* Card 1 at (70, 350): TCP State Machine Recap */}
                    <g transform="translate(70, 350)">
                      <rect x={0} y={0} width={280} height={185} rx={6} fill="#070c14" stroke="#38bdf8" strokeWidth={1.2} />
                      <text x={140} y={20} textAnchor="middle" fill="#38bdf8" fontSize="8.5" fontWeight="700" fontFamily="monospace">
                        TCP STATE MACHINE RECAP
                      </text>
                      <g transform="translate(14, 38)" fill="#cbd5e1" fontSize="7.5" fontFamily="monospace">
                        <text x={0} y={0} fill="#38bdf8" fontWeight="600">Opening: 3-Way Handshake</text>
                        <text x={12} y={13} fill="#94a3b8">SYN → SYN-ACK → ACK</text>
                        <text x={0} y={27} fill="#4ade80" fontWeight="600">Transfer: ESTABLISHED</text>
                        <text x={12} y={40} fill="#94a3b8">Synchronized sequence tracking</text>
                        <text x={0} y={54} fill="#a78bfa" fontWeight="600">Closing: 4-Way Teardown</text>
                        <text x={12} y={67} fill="#94a3b8">FIN → ACK → FIN → ACK</text>
                        <text x={0} y={81} fill="#f59e0b" fontWeight="600">Linger: TIME_WAIT</text>
                        <text x={12} y={94} fill="#94a3b8">2MSL safety drain timer (60s)</text>
                        <text x={0} y={112} fill="#38bdf8" fontWeight="600">Lifecycle Mastered</text>
                      </g>
                    </g>

                    {/* Card 2 at (380, 350): The 4 Core Rules */}
                    <g transform="translate(380, 350)">
                      <rect x={0} y={0} width={720} height={185} rx={8} fill="#070c14" stroke="#38bdf8" strokeWidth={1.3} />
                      <text x={360} y={22} textAnchor="middle" fill="#38bdf8" fontSize="9.5" fontWeight="700" fontFamily="monospace">
                        THE 4 CORE RULES OF TCP CONNECTION MANAGEMENT
                      </text>
                      <g transform="translate(20, 42)" fill="#cbd5e1" fontSize="8" fontFamily="monospace">
                        <text x={0} y={0}>
                          1. STATE SYNCHRONIZATION: TCP establishes synchronized kernel state between endpoints; sequence numbers start at a randomized 32-bit ISN to prevent duplicate segment corruption.
                        </text>
                        <text x={0} y={16}>
                          2. 3-WAY HANDSHAKE: Three packets (SYN → SYN-ACK → ACK) are mathematically required to verify bi-directional reachability and prevent ghost connections.
                        </text>
                        <text x={0} y={32}>
                          3. 4-WAY TEARDOWN: Connections are full-duplex; each direction must be closed independently with FIN/ACK, allowing half-closed (CLOSE_WAIT) data draining.
                        </text>
                        <text x={0} y={48} fill="#4ade80" fontWeight="600">
                          4. 2MSL TIME_WAIT TIMER: The active closer lingers in TIME_WAIT for 60–120s to ensure the peer received the final ACK and drain stray delayed segments from the internet.
                        </text>
                        <line x1={0} y1={60} x2={680} y2={60} stroke="#1e293b" strokeWidth={1} />
                        <text x={0} y={78} fill="#a78bfa" fontWeight="600">
                          Stage 5 Connection Lifecycle Complete! You understand the foundational mechanics of reliable internet transport.
                        </text>
                        <text x={0} y={96} fill="#6ee7b7" fontWeight="600">
                          Next: Day 18 · Sequence Numbers, ACK &amp; Sliding Windows →
                        </text>
                      </g>
                    </g>

                    {/* Card 3 at (1130, 350): Connection Metrics */}
                    <g transform="translate(1130, 350)">
                      <rect x={0} y={0} width={280} height={185} rx={6} fill="#070c14" stroke="#1e293b" strokeWidth={1.2} />
                      <text x={140} y={20} textAnchor="middle" fill="#f1f5f9" fontSize="8.5" fontWeight="700" fontFamily="monospace">
                        CONNECTION METRICS
                      </text>
                      <g transform="translate(16, 38)" fill="#cbd5e1" fontSize="7.5" fontFamily="monospace">
                        <text x={0} y={0}>Client ISN: seq=1000</text>
                        <text x={0} y={16}>Server ISN: seq=5000</text>
                        <text x={0} y={32}>Handshake: 3 packets</text>
                        <text x={0} y={48}>Teardown: 4 packets</text>
                        <text x={0} y={64} fill="#4ade80" fontWeight="600">
                          2MSL Timer: 60 seconds
                        </text>
                        <text x={0} y={80} fill="#38bdf8">
                          State: Successfully Closed
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
