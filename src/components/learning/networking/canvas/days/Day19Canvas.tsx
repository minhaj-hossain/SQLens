import React from 'react';
import type { DayCanvasProps } from './types';
import { SvgWorkstation } from '../SvgWorkstation';
import { SvgRouter } from '../SvgRouter';
import { SvgCable } from '../SvgCable';

export const Day19Canvas: React.FC<DayCanvasProps> = ({ activeStepIndex }) => (
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
                  UDP: FAST AND SIMPLE · CONNECTIONLESS TRANSPORT &amp; MINIMAL OVERHEAD
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
                    fontSize="7"
                    fontFamily="monospace"
                  >
                    192.168.1.0/24 · LAN Access Link (1 Gbps)
                  </text>
                </g>

                {/* Cable 2: Gateway R1 to Server */}
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
                {/* Link 2 Label: WAN Transit Link */}
                <g transform="translate(1013, 190)">
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
                    fontSize="7"
                    fontFamily="monospace"
                  >
                    198.51.100.0/24 · Internet / WAN Link (10 Gbps)
                  </text>
                </g>

                {/* Overhead Visual Diagnostics at translate(460, 65) */}
                {activeStepIndex === 0 && (
                  <g transform="translate(460, 65)">
                    <rect
                      x={0}
                      y={0}
                      width={560}
                      height={95}
                      rx={6}
                      fill="#070d19"
                      stroke="#38bdf8"
                      strokeWidth={1.2}
                    />
                    <text
                      x={280}
                      y={18}
                      textAnchor="middle"
                      fill="#38bdf8"
                      fontSize="9"
                      fontWeight="700"
                      fontFamily="monospace"
                    >
                      THE 8-BYTE UDP HEADER (RFC 768) · 60% SMALLER THAN TCP
                    </text>
                    {/* Header Anatomy Boxes */}
                    <g transform="translate(20, 28)">
                      <rect x={0} y={0} width={125} height={34} rx={3} fill="#0f172a" stroke="#38bdf8" strokeWidth={1} />
                      <text x={62} y={14} textAnchor="middle" fill="#38bdf8" fontSize="7.5" fontWeight="700" fontFamily="monospace">Source Port</text>
                      <text x={62} y={26} textAnchor="middle" fill="#94a3b8" fontSize="6.5" fontFamily="monospace">16 bits (2 Bytes)</text>

                      <rect x={132} y={0} width={125} height={34} rx={3} fill="#0f172a" stroke="#38bdf8" strokeWidth={1} />
                      <text x={194} y={14} textAnchor="middle" fill="#38bdf8" fontSize="7.5" fontWeight="700" fontFamily="monospace">Destination Port</text>
                      <text x={194} y={26} textAnchor="middle" fill="#94a3b8" fontSize="6.5" fontFamily="monospace">16 bits (2 Bytes)</text>

                      <rect x={264} y={0} width={125} height={34} rx={3} fill="#0f172a" stroke="#4ade80" strokeWidth={1} />
                      <text x={326} y={14} textAnchor="middle" fill="#4ade80" fontSize="7.5" fontWeight="700" fontFamily="monospace">Length (Hdr + Body)</text>
                      <text x={326} y={26} textAnchor="middle" fill="#94a3b8" fontSize="6.5" fontFamily="monospace">16 bits (2 Bytes)</text>

                      <rect x={396} y={0} width={124} height={34} rx={3} fill="#0f172a" stroke="#f59e0b" strokeWidth={1} />
                      <text x={458} y={14} textAnchor="middle" fill="#f59e0b" fontSize="7.5" fontWeight="700" fontFamily="monospace">Checksum</text>
                      <text x={458} y={26} textAnchor="middle" fill="#94a3b8" fontSize="6.5" fontFamily="monospace">16 bits (2 Bytes)</text>
                    </g>
                    <g transform="translate(20, 72)" fill="#94a3b8" fontSize="7.5" fontFamily="monospace">
                      <text x={0} y={10} fill="#f1f5f9">
                        Total Header: 8 Bytes · Zero Connection Setup (0 RTT) · Preserves Discrete Datagram Boundaries
                      </text>
                    </g>
                  </g>
                )}

                {activeStepIndex === 1 && (
                  <g transform="translate(460, 65)">
                    <rect
                      x={0}
                      y={0}
                      width={560}
                      height={95}
                      rx={6}
                      fill="#070d19"
                      stroke="#f59e0b"
                      strokeWidth={1.2}
                    />
                    <text
                      x={280}
                      y={18}
                      textAnchor="middle"
                      fill="#f59e0b"
                      fontSize="9"
                      fontWeight="700"
                      fontFamily="monospace"
                    >
                      HEAD-OF-LINE (HoL) BLOCKING COMPARISON · TCP STALL VS UDP FLOW
                    </text>
                    {/* TCP Flow */}
                    <g transform="translate(20, 28)">
                      <text x={0} y={12} fill="#ef4444" fontSize="7.5" fontWeight="700" fontFamily="monospace">TCP:</text>
                      <rect x={40} y={2} width={50} height={16} rx={2} fill="#1e293b" stroke="#38bdf8" />
                      <text x={65} y={13} textAnchor="middle" fill="#38bdf8" fontSize="6.5" fontFamily="monospace">Pkt 1</text>
                      <rect x={96} y={2} width={55} height={16} rx={2} fill="#450a0a" stroke="#ef4444" />
                      <text x={123} y={13} textAnchor="middle" fill="#ef4444" fontSize="6.5" fontFamily="monospace">Pkt 2 (✕)</text>
                      <rect x={157} y={2} width={50} height={16} rx={2} fill="#1e293b" stroke="#64748b" strokeDasharray="2 2" />
                      <text x={182} y={13} textAnchor="middle" fill="#64748b" fontSize="6.5" fontFamily="monospace">Pkt 3 ⏸</text>
                      <rect x={213} y={2} width={50} height={16} rx={2} fill="#1e293b" stroke="#64748b" strokeDasharray="2 2" />
                      <text x={238} y={13} textAnchor="middle" fill="#64748b" fontSize="6.5" fontFamily="monospace">Pkt 4 ⏸</text>
                      <text x={275} y={13} fill="#ef4444" fontSize="6.5" fontFamily="monospace">→ STALLED in buffer for 1 RTT (80–200ms)</text>
                    </g>
                    {/* UDP Flow */}
                    <g transform="translate(20, 52)">
                      <text x={0} y={12} fill="#4ade80" fontSize="7.5" fontWeight="700" fontFamily="monospace">UDP:</text>
                      <rect x={40} y={2} width={50} height={16} rx={2} fill="#1e293b" stroke="#38bdf8" />
                      <text x={65} y={13} textAnchor="middle" fill="#38bdf8" fontSize="6.5" fontFamily="monospace">Pkt 1</text>
                      <rect x={96} y={2} width={55} height={16} rx={2} fill="#450a0a" stroke="#ef4444" />
                      <text x={123} y={13} textAnchor="middle" fill="#ef4444" fontSize="6.5" fontFamily="monospace">Pkt 2 (✕)</text>
                      <rect x={157} y={2} width={50} height={16} rx={2} fill="#064e3b" stroke="#4ade80" />
                      <text x={182} y={13} textAnchor="middle" fill="#4ade80" fontSize="6.5" fontFamily="monospace">Pkt 3 ✓</text>
                      <rect x={213} y={2} width={50} height={16} rx={2} fill="#064e3b" stroke="#4ade80" />
                      <text x={238} y={13} textAnchor="middle" fill="#4ade80" fontSize="6.5" fontFamily="monospace">Pkt 4 ✓</text>
                      <text x={275} y={13} fill="#4ade80" fontSize="6.5" fontFamily="monospace">→ 0 ms stall! Opus PLC interpolates frame</text>
                    </g>
                    <text x={280} y={84} textAnchor="middle" fill="#cbd5e1" fontSize="7" fontFamily="monospace">
                      Real-Time Invariant: Stale data is useless; loss is preferred over latency
                    </text>
                  </g>
                )}

                {activeStepIndex === 2 && (
                  <g transform="translate(460, 65)">
                    <rect
                      x={0}
                      y={0}
                      width={560}
                      height={95}
                      rx={6}
                      fill="#070d19"
                      stroke="#818cf8"
                      strokeWidth={1.2}
                    />
                    <text
                      x={280}
                      y={18}
                      textAnchor="middle"
                      fill="#818cf8"
                      fontSize="9"
                      fontWeight="700"
                      fontFamily="monospace"
                    >
                      STATELESS SOCKET MULTIPLEXING · 1 SOCKET SERVES 10,000+ CLIENTS
                    </text>
                    <g transform="translate(24, 30)" fill="#cbd5e1" fontSize="7" fontFamily="monospace">
                      <rect x={0} y={0} width={240} height={42} rx={3} fill="#0f172a" stroke="#334155" />
                      <text x={12} y={14} fill="#818cf8" fontWeight="700">Client Demultiplexing:</text>
                      <text x={12} y={26}>PC1: 192.168.1.10:52101 ↘</text>
                      <text x={12} y={36}>PC2: 203.0.113.88:41920 → [Port 53 Recv-Q]</text>

                      <rect x={260} y={0} width={250} height={42} rx={3} fill="#0f172a" stroke="#334155" />
                      <text x={272} y={14} fill="#4ade80" fontWeight="700">Operating System Kernel Reality:</text>
                      <text x={272} y={26}>• State: UNCONN (No TCB or state machine)</text>
                      <text x={272} y={36}>• connect() sets dest filter (no packets sent!)</text>
                    </g>
                    <text x={280} y={85} textAnchor="middle" fill="#94a3b8" fontSize="7" fontFamily="monospace">
                      Zero connection control blocks in kernel memory · recvfrom() reads sender IP:Port directly
                    </text>
                  </g>
                )}

                {activeStepIndex === 3 && (
                  <g transform="translate(460, 65)">
                    <rect
                      x={0}
                      y={0}
                      width={560}
                      height={95}
                      rx={6}
                      fill="#070d19"
                      stroke="#a855f7"
                      strokeWidth={1.2}
                    />
                    <text
                      x={280}
                      y={18}
                      textAnchor="middle"
                      fill="#a855f7"
                      fontSize="9"
                      fontWeight="700"
                      fontFamily="monospace"
                    >
                      QUIC (RFC 9000 / HTTP/3) OVER UDP · MODERN USERSPACE TRANSPORT
                    </text>
                    <g transform="translate(20, 28)">
                      <rect x={0} y={0} width={165} height={42} rx={3} fill="#0f172a" stroke="#38bdf8" />
                      <text x={10} y={14} fill="#38bdf8" fontSize="7.5" fontWeight="700" fontFamily="monospace">0-RTT / 1-RTT Handshake</text>
                      <text x={10} y={26} fill="#94a3b8" fontSize="6.5" fontFamily="monospace">Combined Transport + TLS 1.3</text>
                      <text x={10} y={36} fill="#4ade80" fontSize="6.5" fontFamily="monospace">Instant secure flight</text>

                      <rect x={175} y={0} width={180} height={42} rx={3} fill="#0f172a" stroke="#a855f7" />
                      <text x={185} y={14} fill="#a855f7" fontSize="7.5" fontWeight="700" fontFamily="monospace">Multi-Stream Isolation</text>
                      <text x={185} y={26} fill="#94a3b8" fontSize="6.5" fontFamily="monospace">Streams 0, 4, 8 multiplexed</text>
                      <text x={185} y={36} fill="#ef4444" fontSize="6.5" fontFamily="monospace">Loss in #8 doesn&#x27;t stall 0 or 4</text>

                      <rect x={365} y={0} width={155} height={42} rx={3} fill="#0f172a" stroke="#f59e0b" />
                      <text x={375} y={14} fill="#f59e0b" fontSize="7.5" fontWeight="700" fontFamily="monospace">Connection Migration</text>
                      <text x={375} y={26} fill="#94a3b8" fontSize="6.5" fontFamily="monospace">64-bit Connection ID (CID)</text>
                      <text x={375} y={36} fill="#6ee7b7" fontSize="6.5" fontFamily="monospace">Survives Wi-Fi → 5G switch</text>
                    </g>
                    <text x={280} y={85} textAnchor="middle" fill="#cbd5e1" fontSize="7" fontFamily="monospace">
                      UDP enables rapid userspace innovation without waiting for OS kernel upgrades
                    </text>
                  </g>
                )}

                {/* Hardware Devices */}
                {/* 1. PC1 Client Workstation */}
                <SvgWorkstation
                  x={140}
                  y={220}
                  name="PC1 (Client)"
                  ip="192.168.1.10/24"
                  mac="00:1A:2B:3C:4D:5E"
                />

                {/* State Pill above PC1 at translate(140, 130) */}
                <g transform="translate(140, 130)">
                  <rect
                    x={-75}
                    y={-14}
                    width={150}
                    height={28}
                    rx={4}
                    fill="#0a0f1d"
                    stroke="#38bdf8"
                    strokeWidth={1}
                  />
                  <text
                    x={0}
                    y={-2}
                    textAnchor="middle"
                    fill="#38bdf8"
                    fontSize="7"
                    fontWeight="700"
                    fontFamily="monospace"
                  >
                    {activeStepIndex === 0
                      ? 'UDP Port 52101'
                      : activeStepIndex === 1
                      ? 'OPUS AUDIO STREAM'
                      : activeStepIndex === 2
                      ? 'SOCKET: UNCONN'
                      : activeStepIndex === 3
                      ? 'QUIC CLIENT'
                      : 'UDP SOCKET READY'}
                  </text>
                  <text
                    x={0}
                    y={9}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="6.5"
                    fontFamily="monospace"
                  >
                    {activeStepIndex === 0
                      ? '0 RTT DISPATCH'
                      : activeStepIndex === 1
                      ? 'NO HOL BLOCKING'
                      : activeStepIndex === 2
                      ? '0 TCB OVERHEAD'
                      : activeStepIndex === 3
                      ? '0-RTT HANDSHAKE'
                      : 'LIGHTWEIGHT TRANSPORT'}
                  </text>
                </g>

                {/* 2. Gateway Router R1 */}
                <SvgRouter
                  x={680}
                  y={215}
                  name="Gateway R1"
                  port1Ip="192.168.1.1"
                  port2Ip="198.51.100.1"
                />

                {/* 3. DNS / Media / QUIC Server */}
                <SvgWorkstation
                  x={1220}
                  y={220}
                  name="Server (DNS/Media/QUIC)"
                  ip="198.51.100.53/24"
                  mac="00:50:56:FE:ED:01"
                />

                {/* State Pill above Server at translate(1220, 130) */}
                <g transform="translate(1220, 130)">
                  <rect
                    x={-75}
                    y={-14}
                    width={150}
                    height={28}
                    rx={4}
                    fill="#0a0f1d"
                    stroke="#38bdf8"
                    strokeWidth={1}
                  />
                  <text
                    x={0}
                    y={-2}
                    textAnchor="middle"
                    fill="#38bdf8"
                    fontSize="7"
                    fontWeight="700"
                    fontFamily="monospace"
                  >
                    {activeStepIndex === 0
                      ? 'PORT 53 (DNS)'
                      : activeStepIndex === 1
                      ? 'MEDIA RECEIVER'
                      : activeStepIndex === 2
                      ? 'PORT 53 LISTENING'
                      : activeStepIndex === 3
                      ? 'PORT 443 (QUIC/H3)'
                      : 'SERVICE MATRIX'}
                  </text>
                  <text
                    x={0}
                    y={9}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="6.5"
                    fontFamily="monospace"
                  >
                    {activeStepIndex === 0
                      ? 'UNBOUNDED DATAGRAMS'
                      : activeStepIndex === 1
                      ? 'PLC CONCEALMENT ACTIVE'
                      : activeStepIndex === 2
                      ? 'RECV-Q: 0 (DROP SAFE)'
                      : activeStepIndex === 3
                      ? 'MULTI-STREAM READY'
                      : 'RFC 768 COMPLIANT'}
                  </text>
                </g>

                {/* In-Flight Packet Badges (Horizontal Cable Span Invariant: width <= 340px) */}
                {/* Step 0: Cable 1 shows UDP Datagram with 8B header */}
                {activeStepIndex === 0 && (
                  <g transform="translate(454, 250)">
                    <rect
                      x={-170}
                      y={-14}
                      width={340}
                      height={28}
                      rx={4}
                      fill="#070c14"
                      stroke="#38bdf8"
                      strokeWidth={1.2}
                    />
                    <text
                      x={0}
                      y={-2}
                      textAnchor="middle"
                      fill="#38bdf8"
                      fontSize="7.5"
                      fontWeight="700"
                      fontFamily="monospace"
                    >
                      [UDP] 192.168.1.10:52101 → 198.51.100.53:53
                    </text>
                    <text
                      x={0}
                      y={9}
                      textAnchor="middle"
                      fill="#cbd5e1"
                      fontSize="6.5"
                      fontFamily="monospace"
                    >
                      Header: 8B · Length: 20B · Payload: &quot;domain query&quot; (0 RTT)
                    </text>
                  </g>
                )}

                {/* Step 1: Cable 2 shows Real-Time Audio stream frame skipping */}
                {activeStepIndex === 1 && (
                  <g transform="translate(1013, 250)">
                    <rect
                      x={-170}
                      y={-14}
                      width={340}
                      height={28}
                      rx={4}
                      fill="#070c14"
                      stroke="#f59e0b"
                      strokeWidth={1.2}
                    />
                    <text
                      x={0}
                      y={-2}
                      textAnchor="middle"
                      fill="#f59e0b"
                      fontSize="7.5"
                      fontWeight="700"
                      fontFamily="monospace"
                    >
                      [UDP STREAM] Opus Frame #3..#4 (0 ms HoL delay)
                    </text>
                    <text
                      x={0}
                      y={9}
                      textAnchor="middle"
                      fill="#cbd5e1"
                      fontSize="6.5"
                      fontFamily="monospace"
                    >
                      Frame #2 dropped in transit ✕ · Audio renders uninterrupted
                    </text>
                  </g>
                )}

                {/* Step 2: Cable 1 shows Stateless Socket multiplexing */}
                {activeStepIndex === 2 && (
                  <g transform="translate(454, 250)">
                    <rect
                      x={-170}
                      y={-14}
                      width={340}
                      height={28}
                      rx={4}
                      fill="#070c14"
                      stroke="#818cf8"
                      strokeWidth={1.2}
                    />
                    <text
                      x={0}
                      y={-2}
                      textAnchor="middle"
                      fill="#818cf8"
                      fontSize="7.5"
                      fontWeight="700"
                      fontFamily="monospace"
                    >
                      [UDP RECV-Q] UNCONN Socket Telemetry (0 TCB)
                    </text>
                    <text
                      x={0}
                      y={9}
                      textAnchor="middle"
                      fill="#cbd5e1"
                      fontSize="6.5"
                      fontFamily="monospace"
                    >
                      Port 53 listening on 0.0.0.0:* · Multiplexed recvfrom()
                    </text>
                  </g>
                )}

                {/* Step 3: Cable 2 shows QUIC over UDP Multi-Stream & CID */}
                {activeStepIndex === 3 && (
                  <g transform="translate(1013, 250)">
                    <rect
                      x={-170}
                      y={-14}
                      width={340}
                      height={28}
                      rx={4}
                      fill="#070c14"
                      stroke="#a855f7"
                      strokeWidth={1.2}
                    />
                    <text
                      x={0}
                      y={-2}
                      textAnchor="middle"
                      fill="#a855f7"
                      fontSize="7.5"
                      fontWeight="700"
                      fontFamily="monospace"
                    >
                      [QUIC/UDP] CID:0x4f92c18a3e7b · Streams 0,4,8 (Isolated)
                    </text>
                    <text
                      x={0}
                      y={9}
                      textAnchor="middle"
                      fill="#cbd5e1"
                      fontSize="6.5"
                      fontFamily="monospace"
                    >
                      Integrated TLS 1.3 · Connection survives IP migration
                    </text>
                  </g>
                )}

                {/* Bottom Diagnostic HUD Cards strictly clearing the 94px device envelope (y=350) */}
                {activeStepIndex < 4 && (
                  <>
                    {/* Card 1: Client Transport HUD */}
                    <g transform="translate(70, 350)">
                      <rect
                        x={0}
                        y={0}
                        width={280}
                        height={175}
                        rx={6}
                        fill="#070d19"
                        stroke="#1e293b"
                        strokeWidth={1}
                      />
                      <text
                        x={140}
                        y={20}
                        textAnchor="middle"
                        fill="#38bdf8"
                        fontSize="8.5"
                        fontWeight="700"
                        fontFamily="monospace"
                      >
                        CLIENT UDP SUBSYSTEM
                      </text>
                      <g
                        transform="translate(16, 38)"
                        fill="#cbd5e1"
                        fontSize="7.5"
                        fontFamily="monospace"
                      >
                        <text x={0} y={0}>Client Host: PC1</text>
                        <text x={0} y={16}>Interface: eth0 (192.168.1.10)</text>
                        <text x={0} y={32} fill="#38bdf8">Ephemeral Port: 52101</text>
                        <text x={0} y={48}>Connection Setup: 0 ms (0 RTT)</text>
                        <text x={0} y={64} fill="#4ade80">
                          Framing: Discrete Datagrams
                        </text>
                        <text x={0} y={80}>Buffer State: Recv-Q=0, Send-Q=0</text>
                        <text x={0} y={96} fill="#f59e0b">
                          State: UNCONN (Stateless)
                        </text>
                        <text x={0} y={112} fill="#6ee7b7">
                          Kernel TCB Memory: 0 Bytes
                        </text>
                      </g>
                    </g>

                    {/* Card 2: Central Protocol Diagnostic Telemetry */}
                    <g transform="translate(380, 350)">
                      <rect
                        x={0}
                        y={0}
                        width={620}
                        height={175}
                        rx={6}
                        fill="#070d19"
                        stroke="#1e293b"
                        strokeWidth={1}
                      />
                      <text
                        x={310}
                        y={20}
                        textAnchor="middle"
                        fill="#f1f5f9"
                        fontSize="8.5"
                        fontWeight="700"
                        fontFamily="monospace"
                      >
                        LAYER 4 PROTOCOL MECHANICS &amp; PACKET PIPELINE
                      </text>
                      <g
                        transform="translate(20, 38)"
                        fill="#94a3b8"
                        fontSize="7.5"
                        fontFamily="monospace"
                      >
                        {activeStepIndex === 0 && (
                          <>
                            <text x={0} y={0} fill="#38bdf8" fontWeight="700">
                              [Idea 1] The Minimalist 8-Byte UDP Header (RFC 768)
                            </text>
                            <text x={0} y={18} fill="#cbd5e1">
                              • Zero Handshake Overhead: No SYN, SYN-ACK, ACK round trips before sending data.
                            </text>
                            <text x={0} y={34} fill="#cbd5e1">
                              • Fixed Header Size: Exactly 8 bytes vs 20–60 bytes in TCP (60% header bandwidth savings).
                            </text>
                            <text x={0} y={50} fill="#cbd5e1">
                              • Discrete Datagram Framing: sendto() produces exactly one datagram; recvfrom() reads exactly one.
                            </text>
                            <text x={0} y={66} fill="#cbd5e1">
                              • Optional IPv4 Checksum: Covers UDP pseudo-header, header, and payload data.
                            </text>
                            <text x={0} y={84} fill="#4ade80" fontWeight="600">
                              Diagnostic: Datagram sent immediately with 0 ms connection establishment delay.
                            </text>
                          </>
                        )}
                        {activeStepIndex === 1 && (
                          <>
                            <text x={0} y={0} fill="#f59e0b" fontWeight="700">
                              [Idea 2] Head-of-Line (HoL) Blocking &amp; Real-Time Latency
                            </text>
                            <text x={0} y={18} fill="#cbd5e1">
                              • TCP Byte Stream Curse: Receiver OS halts delivery to application until lost segment retransmits.
                            </text>
                            <text x={0} y={34} fill="#cbd5e1">
                              • The Staleness Invariant: In VoIP, video, or gaming, a packet delayed by 100ms is completely useless.
                            </text>
                            <text x={0} y={50} fill="#cbd5e1">
                              • Zero Queue Stall: UDP delivers Packets #3 and #4 immediately without waiting for lost Packet #2.
                            </text>
                            <text x={0} y={66} fill="#cbd5e1">
                              • Codec Concealment: Modern audio codecs (Opus) use Packet Loss Concealment (PLC) to fill gaps.
                            </text>
                            <text x={0} y={84} fill="#f59e0b" fontWeight="600">
                              Diagnostic: Real-time stream continued with 0 ms jitter stall; Frame #2 dropped silently.
                            </text>
                          </>
                        )}
                        {activeStepIndex === 2 && (
                          <>
                            <text x={0} y={0} fill="#818cf8" fontWeight="700">
                              [Idea 3] Stateless Sockets &amp; OS Kernel Architecture
                            </text>
                            <text x={0} y={18} fill="#cbd5e1">
                              • No Transmission Control Blocks (TCBs): Kernel tracks zero connection states or timer trees.
                            </text>
                            <text x={0} y={34} fill="#cbd5e1">
                              • Mass Multiplexing: A single socket bound to 0.0.0.0:53 serves queries from unlimited remote IPs.
                            </text>
                            <text x={0} y={50} fill="#cbd5e1">
                              • Connected UDP: connect() sets an OS kernel destination filter (no SYN packets transmitted).
                            </text>
                            <text x={0} y={66} fill="#cbd5e1">
                              • ICMP Error Reporting: Connected UDP sockets receive asynchronous ICMP Port Unreachable errors.
                            </text>
                            <text x={0} y={84} fill="#818cf8" fontWeight="600">
                              Diagnostic: ss -uan verified UNCONN state with zero allocated handshake memory.
                            </text>
                          </>
                        )}
                        {activeStepIndex === 3 && (
                          <>
                            <text x={0} y={0} fill="#a855f7" fontWeight="700">
                              [Idea 4] Userspace Reliability &amp; QUIC (HTTP/3 / RFC 9000)
                            </text>
                            <text x={0} y={18} fill="#cbd5e1">
                              • Userspace Agility: Modern protocols innovate above UDP without waiting for OS kernel patches.
                            </text>
                            <text x={0} y={34} fill="#cbd5e1">
                              • 0-RTT Integrated Handshake: QUIC combines transport and TLS 1.3 encryption in 1 round trip.
                            </text>
                            <text x={0} y={50} fill="#cbd5e1">
                              • Multi-Stream Isolation: Eliminates Head-of-Line blocking across independent HTTP/3 requests.
                            </text>
                            <text x={0} y={66} fill="#cbd5e1">
                              • Connection Migration: 64-bit Connection ID survives client IP switches (Wi-Fi → 5G cellular).
                            </text>
                            <text x={0} y={84} fill="#a855f7" fontWeight="600">
                              Diagnostic: HTTP/3 endpoint responded over UDP 443 with isolated multi-stream multiplexing.
                            </text>
                          </>
                        )}
                      </g>
                    </g>

                    {/* Card 3: Server Socket & Protocol State */}
                    <g transform="translate(1040, 350)">
                      <rect
                        x={0}
                        y={0}
                        width={380}
                        height={175}
                        rx={6}
                        fill="#070d19"
                        stroke="#1e293b"
                        strokeWidth={1}
                      />
                      <text
                        x={190}
                        y={20}
                        textAnchor="middle"
                        fill="#38bdf8"
                        fontSize="8.5"
                        fontWeight="700"
                        fontFamily="monospace"
                      >
                        SERVER TRANSPORT SUBSYSTEM
                      </text>
                      <g
                        transform="translate(16, 38)"
                        fill="#cbd5e1"
                        fontSize="7.5"
                        fontFamily="monospace"
                      >
                        <text x={0} y={0}>Server Host: 198.51.100.53</text>
                        <text x={0} y={16}>Active UDP Sockets: 53 (DNS), 443 (QUIC)</text>
                        <text x={0} y={32} fill="#38bdf8">
                          Socket State: UNCONN (Stateless)
                        </text>
                        <text x={0} y={48}>Receive Buffer: 212992 bytes (Default)</text>
                        <text x={0} y={64} fill="#4ade80">
                          Recv-Q Drops: 0 (Buffer healthy)
                        </text>
                        <text x={0} y={80} fill="#f59e0b">
                          HoL Penalty: 0 ms (Real-time delivery)
                        </text>
                        <text x={0} y={96} fill="#6ee7b7">
                          QUIC CID Table: 1 active session
                        </text>
                        <text x={0} y={112} fill="#a855f7">
                          RFC Compliance: RFC 768, RFC 9000
                        </text>
                      </g>
                    </g>
                  </>
                )}

                {/* Step 4: Master Recap Cards */}
                {activeStepIndex === 4 && (
                  <>
                    {/* Card 1: The Four Invariants of UDP */}
                    <g transform="translate(70, 350)">
                      <rect
                        x={0}
                        y={0}
                        width={280}
                        height={185}
                        rx={6}
                        fill="#070d19"
                        stroke="#38bdf8"
                        strokeWidth={1.2}
                      />
                      <text
                        x={140}
                        y={20}
                        textAnchor="middle"
                        fill="#38bdf8"
                        fontSize="8.5"
                        fontWeight="700"
                        fontFamily="monospace"
                      >
                        THE 4 INVARIANTS OF UDP
                      </text>
                      <g
                        transform="translate(14, 38)"
                        fill="#cbd5e1"
                        fontSize="7.5"
                        fontFamily="monospace"
                      >
                        <text x={0} y={0} fill="#38bdf8" fontWeight="700">1. Minimal Overhead</text>
                        <text x={0} y={14} fill="#94a3b8">Fixed 8-byte header; no ACKs or timers</text>

                        <text x={0} y={32} fill="#f59e0b" fontWeight="700">2. Zero HoL Blocking</text>
                        <text x={0} y={46} fill="#94a3b8">Dropped packet never stalls subsequent data</text>

                        <text x={0} y={64} fill="#818cf8" fontWeight="700">3. Datagram Boundaries</text>
                        <text x={0} y={78} fill="#94a3b8">sendto() message size is preserved intact</text>

                        <text x={0} y={96} fill="#a855f7" fontWeight="700">4. Modern Transport Base</text>
                        <text x={0} y={110} fill="#94a3b8">Powers DNS, WebRTC, and HTTP/3 QUIC</text>
                      </g>
                    </g>

                    {/* Card 2: Transport Protocol Matrix (TCP vs UDP) */}
                    <g transform="translate(380, 350)">
                      <rect
                        x={0}
                        y={0}
                        width={720}
                        height={185}
                        rx={6}
                        fill="#070d19"
                        stroke="#1e293b"
                        strokeWidth={1.2}
                      />
                      <text
                        x={360}
                        y={20}
                        textAnchor="middle"
                        fill="#f1f5f9"
                        fontSize="8.5"
                        fontWeight="700"
                        fontFamily="monospace"
                      >
                        TRANSPORT LAYER COMPARISON: TCP VS UDP
                      </text>
                      <g transform="translate(18, 38)" fontSize="7" fontFamily="monospace">
                        {/* Table Header */}
                        <text x={0} y={0} fill="#38bdf8" fontWeight="700">Dimension</text>
                        <text x={140} y={0} fill="#f59e0b" fontWeight="700">TCP (Transmission Control Protocol)</text>
                        <text x={440} y={0} fill="#4ade80" fontWeight="700">UDP (User Datagram Protocol)</text>

                        {/* Row 1 */}
                        <text x={0} y={18} fill="#94a3b8">Header Size</text>
                        <text x={140} y={18} fill="#cbd5e1">20–60 bytes (Variable, Options)</text>
                        <text x={440} y={18} fill="#cbd5e1">8 bytes strictly fixed</text>

                        {/* Row 2 */}
                        <text x={0} y={34} fill="#94a3b8">Connection Setup</text>
                        <text x={140} y={34} fill="#cbd5e1">1 RTT (SYN, SYN-ACK, ACK 3-way handshake)</text>
                        <text x={440} y={34} fill="#cbd5e1">0 RTT (Immediate dispatch)</text>

                        {/* Row 3 */}
                        <text x={0} y={50} fill="#94a3b8">Reliability / Loss</text>
                        <text x={140} y={50} fill="#cbd5e1">Cumulative ACKs, RTO retransmissions, SACK</text>
                        <text x={440} y={50} fill="#cbd5e1">None (Best-effort or userspace FEC/QUIC)</text>

                        {/* Row 4 */}
                        <text x={0} y={66} fill="#94a3b8">Ordering / HoL</text>
                        <text x={140} y={66} fill="#ef4444">Strict in-order byte stream; HoL blocking</text>
                        <text x={440} y={66} fill="#4ade80">Independent datagrams; zero HoL blocking</text>

                        {/* Row 5 */}
                        <text x={0} y={82} fill="#94a3b8">Flow &amp; Congestion</text>
                        <text x={140} y={82} fill="#cbd5e1">Sliding window (win), AIMD congestion backoff</text>
                        <text x={440} y={82} fill="#cbd5e1">None at transport layer (application handled)</text>

                        {/* Row 6 */}
                        <text x={0} y={98} fill="#94a3b8">Primary Use Cases</text>
                        <text x={140} y={98} fill="#cbd5e1">HTTP/1.1, HTTP/2, SSH, DB queries, File downloads</text>
                        <text x={440} y={98} fill="#cbd5e1">DNS, VoIP, Video Streaming, Gaming, HTTP/3 QUIC</text>
                      </g>
                    </g>

                    {/* Card 3: Stage 5 Completion Badge */}
                    <g transform="translate(1130, 350)">
                      <rect
                        x={0}
                        y={0}
                        width={280}
                        height={185}
                        rx={6}
                        fill="#070d19"
                        stroke="#4ade80"
                        strokeWidth={1.2}
                      />
                      <text
                        x={140}
                        y={20}
                        textAnchor="middle"
                        fill="#4ade80"
                        fontSize="8.5"
                        fontWeight="700"
                        fontFamily="monospace"
                      >
                        STAGE 5 COMPLETE ✓
                      </text>
                      <g
                        transform="translate(16, 38)"
                        fill="#cbd5e1"
                        fontSize="7.5"
                        fontFamily="monospace"
                      >
                        <text x={0} y={0}>Day 14: ICMP &amp; TTL</text>
                        <text x={0} y={16}>Day 15: Traceroute Cross-Net</text>
                        <text x={0} y={32}>Day 16: Transport Ports &amp; Sockets</text>
                        <text x={0} y={48}>Day 17: TCP Handshake &amp; Teardown</text>
                        <text x={0} y={64}>Day 18: TCP Reliable Delivery</text>
                        <text x={0} y={80} fill="#38bdf8" fontWeight="600">
                          Day 19: UDP Fast &amp; Simple
                        </text>
                        <text x={0} y={100} fill="#6ee7b7" fontWeight="700">
                          Next: Stage 6 · Dynamic Routing
                        </text>
                        <text x={0} y={116} fill="#94a3b8">
                          (Days 20–23 · RIP, OSPF &amp; BGP)
                        </text>
                      </g>
                    </g>
                  </>
                )}
              </>
);
