import React from 'react';
import type { DayCanvasProps } from './types';
import { SvgWorkstation } from '../SvgWorkstation';
import { SvgRouter } from '../SvgRouter';
import { SvgCable } from '../SvgCable';

export const Day16Canvas: React.FC<DayCanvasProps> = ({ activeStepIndex, isPinging }) => (
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
                  LAYER 4 TRANSPORT MULTIPLEXING · PORTS &amp; SOCKETS
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
                  isPinging={isPinging || activeStepIndex === 2 || activeStepIndex === 3}
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
                  isPinging={isPinging || activeStepIndex === 2 || activeStepIndex === 3}
                />

                {/* 3. Web & App Server */}
                <SvgWorkstation
                  x={1220}
                  y={220}
                  name="Web Server"
                  ip="198.51.100.10/24"
                  mac="00:1A:2B:3C:4D:99"
                  ipColor="green"
                  showIp={true}
                  showMac={true}
                  isPinging={isPinging || activeStepIndex === 2 || activeStepIndex === 3}
                />

                {/* ================= STEP-SPECIFIC OVERLAYS ================= */}

                {/* Step 0: Host vs Process Delivery */}
                {activeStepIndex === 0 && (
                  <>
                    {/* PC1 Application Processes Badge */}
                    <g transform="translate(140, 130)">
                      <rect
                        x={-95}
                        y={-10}
                        width={190}
                        height={20}
                        rx={4}
                        fill="#064e3b"
                        stroke="#34d399"
                        strokeWidth={1}
                      />
                      <text
                        x={0}
                        y={3.5}
                        textAnchor="middle"
                        fill="#6ee7b7"
                        fontSize="7"
                        fontWeight="700"
                        fontFamily="monospace"
                      >
                        Running Apps: Browser, SSH, Discord
                      </text>
                    </g>

                    {/* Server Service Listeners Badge Box */}
                    <g transform="translate(1220, 110)">
                      <rect
                        x={-95}
                        y={-32}
                        width={190}
                        height={64}
                        rx={5}
                        fill="#0f172a"
                        stroke="#38bdf8"
                        strokeWidth={1.2}
                      />
                      <text
                        x={0}
                        y={-18}
                        textAnchor="middle"
                        fill="#38bdf8"
                        fontSize="7.5"
                        fontWeight="700"
                        fontFamily="monospace"
                      >
                        LISTENING PORTS (SS -TLPN)
                      </text>
                      <text
                        x={-85}
                        y={-4}
                        fill="#cbd5e1"
                        fontSize="6.8"
                        fontFamily="monospace"
                      >
                        Port 22: sshd (PID 412)
                      </text>
                      <text
                        x={-85}
                        y={9}
                        fill="#4ade80"
                        fontSize="6.8"
                        fontFamily="monospace"
                      >
                        Port 80/443: nginx (PID 884)
                      </text>
                      <text
                        x={-85}
                        y={22}
                        fill="#a78bfa"
                        fontSize="6.8"
                        fontFamily="monospace"
                      >
                        Port 5432: postgres (PID 920)
                      </text>
                    </g>

                    {/* Card 1 at (70, 360): Host vs Process Addressing */}
                    <g transform="translate(70, 360)">
                      <rect
                        x={0}
                        y={0}
                        width={280}
                        height={175}
                        rx={6}
                        fill="#070c14"
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
                        HOST VS PROCESS ADDRESSING
                      </text>
                      <g
                        transform="translate(14, 38)"
                        fill="#cbd5e1"
                        fontSize="7.5"
                        fontFamily="monospace"
                      >
                        <text x={0} y={0} fill="#60a5fa" fontWeight="600">Layer 3 (IP): Host-to-Host</text>
                        <text x={12} y={14}>• Identifies machine NIC on network</text>
                        <text x={12} y={28}>• Delivers packet to OS kernel</text>
                        <text x={0} y={46} fill="#4ade80" fontWeight="600">Layer 4 (Port): Process Delivery</text>
                        <text x={12} y={60}>• 16-bit integer (0 to 65,535)</text>
                        <text x={12} y={74}>• OS kernel maintains Socket Table</text>
                        <text x={12} y={88}>• Demultiplexes incoming bytes</text>
                        <text x={12} y={102} fill="#38bdf8">• Maps port number to application PID</text>
                      </g>
                    </g>

                    {/* Card 2 at (380, 360): Active Listening Sockets */}
                    <g transform="translate(380, 360)">
                      <rect
                        x={0}
                        y={0}
                        width={620}
                        height={175}
                        rx={6}
                        fill="#070c14"
                        stroke="#1e293b"
                        strokeWidth={1.2}
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
                        ACTIVE LISTENING SOCKETS (SS -TLPN)
                      </text>
                      <g
                        transform="translate(20, 38)"
                        fill="#cbd5e1"
                        fontSize="7.5"
                        fontFamily="monospace"
                      >
                        <text x={0} y={0} fill="#38bdf8" fontWeight="600">
                          State   Recv-Q Send-Q Local Address:Port  Peer Address:Port Process
                        </text>
                        <line x1={0} y1={6} x2={580} y2={6} stroke="#334155" strokeWidth={1} />
                        <text x={0} y={20}>LISTEN  0      128    0.0.0.0:22          0.0.0.0:*         users:(sshd,pid=412,fd=3)</text>
                        <text x={0} y={36}>LISTEN  0      511    0.0.0.0:80          0.0.0.0:*         users:(nginx,pid=884,fd=6)</text>
                        <text x={0} y={52}>LISTEN  0      128    127.0.0.1:5432      0.0.0.0:*         users:(postgres,pid=920,fd=5)</text>
                        <text x={0} y={68}>LISTEN  0      511    0.0.0.0:443         0.0.0.0:*         users:(nginx,pid=884,fd=7)</text>
                        <text x={0} y={88} fill="#94a3b8">
                          Kernel Invariant: A process binds to an IP:Port pair to register ownership of incoming segments
                        </text>
                      </g>
                    </g>

                    {/* Card 3 at (1040, 360): The bind() and listen() system calls */}
                    <g transform="translate(1040, 360)">
                      <rect
                        x={0}
                        y={0}
                        width={380}
                        height={175}
                        rx={6}
                        fill="#070c14"
                        stroke="#38bdf8"
                        strokeWidth={1.2}
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
                        THE BIND() &amp; LISTEN() SYSTEM CALLS
                      </text>
                      <g
                        transform="translate(16, 38)"
                        fill="#cbd5e1"
                        fontSize="7.5"
                        fontFamily="monospace"
                      >
                        <text x={0} y={0} fill="#60a5fa" fontWeight="600">POSIX Socket Lifecycle:</text>
                        <text x={12} y={14}>1. socket(): Creates endpoint descriptor</text>
                        <text x={12} y={28}>2. bind(): Associates socket with port</text>
                        <text x={12} y={42}>3. listen(): Marks socket as passive listener</text>
                        <text x={12} y={56}>4. accept(): Extracts connection from queue</text>
                        <text x={0} y={74} fill="#4ade80" fontWeight="600">Kernel Port Exclusivity:</text>
                        <text x={12} y={88} fill="#94a3b8">Only one process can bind to an IP:Port</text>
                        <text x={12} y={102} fill="#94a3b8">at a time (without SO_REUSEPORT)</text>
                      </g>
                    </g>
                  </>
                )}

                {/* Step 1: The Port Number Hierarchy (RFC 6335) */}
                {activeStepIndex === 1 && (
                  <>
                    {/* Overhead Port Spectrum Diagram across x=440..1040 at y=65..155 */}
                    <g transform="translate(440, 65)">
                      <rect
                        x={0}
                        y={0}
                        width={600}
                        height={90}
                        rx={6}
                        fill="#070c14"
                        stroke="#38bdf8"
                        strokeWidth={1.2}
                      />
                      <text
                        x={300}
                        y={18}
                        textAnchor="middle"
                        fill="#38bdf8"
                        fontSize="8"
                        fontWeight="700"
                        fontFamily="monospace"
                      >
                        RFC 6335 PORT NUMBER SPECTRUM (16-BIT INTEGER: 0 TO 65535)
                      </text>

                      {/* Box 1: Well-Known (0-1023) */}
                      <g transform="translate(15, 28)">
                        <rect
                          x={0}
                          y={0}
                          width={180}
                          height={50}
                          rx={4}
                          fill="#450a0a"
                          stroke="#ef4444"
                          strokeWidth={1}
                        />
                        <text x={90} y={14} textAnchor="middle" fill="#fca5a5" fontSize="7.5" fontWeight="700" fontFamily="monospace">
                          WELL-KNOWN: 0–1023
                        </text>
                        <text x={90} y={28} textAnchor="middle" fill="#cbd5e1" fontSize="6.8" fontFamily="monospace">
                          Root / CAP_NET_BIND_SERVICE
                        </text>
                        <text x={90} y={42} textAnchor="middle" fill="#f87171" fontSize="6.8" fontWeight="600" fontFamily="monospace">
                          SSH(22), HTTP(80), HTTPS(443)
                        </text>
                      </g>

                      {/* Box 2: Registered (1024-49151) */}
                      <g transform="translate(205, 28)">
                        <rect
                          x={0}
                          y={0}
                          width={190}
                          height={50}
                          rx={4}
                          fill="#0c1a30"
                          stroke="#38bdf8"
                          strokeWidth={1}
                        />
                        <text x={95} y={14} textAnchor="middle" fill="#7dd3fc" fontSize="7.5" fontWeight="700" fontFamily="monospace">
                          REGISTERED: 1024–49151
                        </text>
                        <text x={95} y={28} textAnchor="middle" fill="#cbd5e1" fontSize="6.8" fontFamily="monospace">
                          User Daemons &amp; Applications
                        </text>
                        <text x={95} y={42} textAnchor="middle" fill="#38bdf8" fontSize="6.8" fontWeight="600" fontFamily="monospace">
                          MySQL(3306), PG(5432), Redis(6379)
                        </text>
                      </g>

                      {/* Box 3: Ephemeral (49152-65535) */}
                      <g transform="translate(405, 28)">
                        <rect
                          x={0}
                          y={0}
                          width={180}
                          height={50}
                          rx={4}
                          fill="#064e3b"
                          stroke="#34d399"
                          strokeWidth={1}
                        />
                        <text x={90} y={14} textAnchor="middle" fill="#6ee7b7" fontSize="7.5" fontWeight="700" fontFamily="monospace">
                          EPHEMERAL: 49152–65535
                        </text>
                        <text x={90} y={28} textAnchor="middle" fill="#cbd5e1" fontSize="6.8" fontFamily="monospace">
                          Client Outbound Source Ports
                        </text>
                        <text x={90} y={42} textAnchor="middle" fill="#34d399" fontSize="6.8" fontWeight="600" fontFamily="monospace">
                          Linux Pool: 32768–60999 (28k)
                        </text>
                      </g>
                    </g>

                    {/* Card 1 at (70, 360): Port Hierarchy Rules */}
                    <g transform="translate(70, 360)">
                      <rect x={0} y={0} width={280} height={175} rx={6} fill="#070c14" stroke="#38bdf8" strokeWidth={1.2} />
                      <text x={140} y={20} textAnchor="middle" fill="#38bdf8" fontSize="8.5" fontWeight="700" fontFamily="monospace">
                        PORT HIERARCHY RULES
                      </text>
                      <g transform="translate(14, 38)" fill="#cbd5e1" fontSize="7.5" fontFamily="monospace">
                        <text x={0} y={0} fill="#f87171" fontWeight="600">Well-Known (0–1023):</text>
                        <text x={12} y={14}>• Privileged system services</text>
                        <text x={12} y={28}>• Requires root or capability</text>
                        <text x={0} y={46} fill="#38bdf8" fontWeight="600">Registered (1024–49151):</text>
                        <text x={12} y={60}>• Standard developer databases</text>
                        <text x={0} y={78} fill="#34d399" fontWeight="600">Ephemeral (49152–65535):</text>
                        <text x={12} y={92}>• Auto-allocated client ports</text>
                        <text x={0} y={110} fill="#94a3b8">Total Port Space: 65,536 integers</text>
                      </g>
                    </g>

                    {/* Card 2 at (380, 360): IANA Port Allocation Tiers */}
                    <g transform="translate(380, 360)">
                      <rect x={0} y={0} width={620} height={175} rx={6} fill="#070c14" stroke="#1e293b" strokeWidth={1.2} />
                      <text x={310} y={20} textAnchor="middle" fill="#f1f5f9" fontSize="8.5" fontWeight="700" fontFamily="monospace">
                        IANA PORT ALLOCATION TIERS (SHOW IP-PORT-RANGE)
                      </text>
                      <g transform="translate(20, 38)" fill="#cbd5e1" fontSize="7.5" fontFamily="monospace">
                        <text x={0} y={0} fill="#38bdf8" fontWeight="600">
                          Range Tier         Port Range       Privilege  Typical Usage
                        </text>
                        <line x1={0} y1={6} x2={580} y2={6} stroke="#334155" strokeWidth={1} />
                        <text x={0} y={20} fill="#fca5a5">Well-Known Ports   0 – 1023         Root only  Standard Daemons (SSH:22, HTTP:80, HTTPS:443)</text>
                        <text x={0} y={36} fill="#7dd3fc">Registered Ports   1024 – 49151     User       Databases &amp; Apps (MySQL:3306, Postgres:5432)</text>
                        <text x={0} y={52} fill="#6ee7b7">Dynamic/Ephemeral  49152 – 65535    Automatic  Client Outbound Source Ports</text>
                        <line x1={0} y1={62} x2={580} y2={62} stroke="#334155" strokeWidth={1} />
                        <text x={0} y={76} fill="#fef08a" fontWeight="600">
                          Linux Kernel Ephemeral Config (/proc/sys/net/ipv4/ip_local_port_range):
                        </text>
                        <text x={0} y={92} fill="#cbd5e1">
                          Lower Bound: 32768    Upper Bound: 60999    Total Pool: 28,232 sockets
                        </text>
                      </g>
                    </g>

                    {/* Card 3 at (1040, 360): Security & Capabilities */}
                    <g transform="translate(1040, 360)">
                      <rect x={0} y={0} width={380} height={175} rx={6} fill="#070c14" stroke="#38bdf8" strokeWidth={1.2} />
                      <text x={190} y={20} textAnchor="middle" fill="#38bdf8" fontSize="8.5" fontWeight="700" fontFamily="monospace">
                        SECURITY &amp; CAP_NET_BIND_SERVICE
                      </text>
                      <g transform="translate(16, 38)" fill="#cbd5e1" fontSize="7.5" fontFamily="monospace">
                        <text x={0} y={0} fill="#f87171" fontWeight="600">Why restrict ports &lt; 1024?</text>
                        <text x={12} y={14}>• In multi-user Unix systems, unprivileged users</text>
                        <text x={12} y={28}>  could bind to port 80/22 and capture passwords</text>
                        <text x={0} y={46} fill="#4ade80" fontWeight="600">Linux POSIX Capabilities:</text>
                        <text x={12} y={60}>• CAP_NET_BIND_SERVICE allows binding to &lt;1024</text>
                        <text x={12} y={74}>  without full root administrative power</text>
                        <text x={12} y={88} fill="#94a3b8">• systemd assigns capability to worker daemons</text>
                      </g>
                    </g>
                  </>
                )}

                {/* Step 2: The Socket 5-Tuple & Demultiplexing */}
                {activeStepIndex === 2 && (
                  <>
                    {/* PC1 Client Socket Badges (Two Concurrent Tabs) */}
                    <g transform="translate(140, 115)">
                      <g transform="translate(0, 0)">
                        <rect x={-95} y={-9} width={190} height={18} rx={3} fill="#064e3b" stroke="#34d399" strokeWidth={1} />
                        <text x={0} y={3.5} textAnchor="middle" fill="#6ee7b7" fontSize="6.8" fontWeight="700" fontFamily="monospace">
                          Tab 1: 192.168.1.10:52101 → :443
                        </text>
                      </g>
                      <g transform="translate(0, 24)">
                        <rect x={-95} y={-9} width={190} height={18} rx={3} fill="#0c1a30" stroke="#38bdf8" strokeWidth={1} />
                        <text x={0} y={3.5} textAnchor="middle" fill="#7dd3fc" fontSize="6.8" fontWeight="700" fontFamily="monospace">
                          Tab 2: 192.168.1.10:52102 → :443
                        </text>
                      </g>
                    </g>

                    {/* Server Demux Badge */}
                    <g transform="translate(1220, 125)">
                      <rect x={-95} y={-10} width={190} height={20} rx={4} fill="#1e1b4b" stroke="#a78bfa" strokeWidth={1} />
                      <text x={0} y={3.5} textAnchor="middle" fill="#c7d2fe" fontSize="7" fontWeight="700" fontFamily="monospace">
                        Port 443 Demux: 2 Active Streams
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
                        Tab 1: 192.168.1.10:52101 → 198.51.100.10:443 [TCP ACK]
                      </text>
                    </g>

                    {/* Card 1 at (70, 360): The Socket 5-Tuple */}
                    <g transform="translate(70, 360)">
                      <rect x={0} y={0} width={280} height={175} rx={6} fill="#070c14" stroke="#38bdf8" strokeWidth={1.2} />
                      <text x={140} y={20} textAnchor="middle" fill="#38bdf8" fontSize="8.5" fontWeight="700" fontFamily="monospace">
                        THE SOCKET 5-TUPLE
                      </text>
                      <g transform="translate(14, 38)" fill="#cbd5e1" fontSize="7.5" fontFamily="monospace">
                        <text x={0} y={0} fill="#38bdf8" fontWeight="600">Connection Identity Keys:</text>
                        <text x={12} y={14}>1. Source IP: 192.168.1.10</text>
                        <text x={12} y={28} fill="#34d399">2. Source Port: 52101 / 52102</text>
                        <text x={12} y={42}>3. Destination IP: 198.51.100.10</text>
                        <text x={12} y={56}>4. Destination Port: 443 (HTTPS)</text>
                        <text x={12} y={70}>5. Transport Protocol: TCP (6)</text>
                        <text x={0} y={88} fill="#f59e0b">Every active conversation must have</text>
                        <text x={0} y={102} fill="#f59e0b">a unique 5-tuple in the OS kernel</text>
                      </g>
                    </g>

                    {/* Card 2 at (380, 360): Concurrent Connection Demultiplexing */}
                    <g transform="translate(380, 360)">
                      <rect x={0} y={0} width={620} height={175} rx={6} fill="#070c14" stroke="#1e293b" strokeWidth={1.2} />
                      <text x={310} y={20} textAnchor="middle" fill="#f1f5f9" fontSize="8.5" fontWeight="700" fontFamily="monospace">
                        CONCURRENT CONNECTION DEMULTIPLEXING (SS -T4)
                      </text>
                      <g transform="translate(20, 38)" fill="#cbd5e1" fontSize="7.5" fontFamily="monospace">
                        <text x={0} y={0} fill="#38bdf8" fontWeight="600">
                          Recv-Q Send-Q  Local Address:Port       Peer Address:Port        Process / State
                        </text>
                        <line x1={0} y1={6} x2={580} y2={6} stroke="#334155" strokeWidth={1} />
                        <text x={0} y={20} fill="#6ee7b7">0      0       192.168.1.10:52101     198.51.100.10:443        browser-tab-1 (PID 2104)</text>
                        <text x={0} y={36} fill="#7dd3fc">0      0       192.168.1.10:52102     198.51.100.10:443        browser-tab-2 (PID 2108)</text>
                        <text x={0} y={52}>0      0       192.168.1.10:49812      198.51.100.5:22         ssh (PID 1850)</text>
                        <line x1={0} y1={62} x2={580} y2={62} stroke="#334155" strokeWidth={1} />
                        <text x={0} y={76} fill="#a78bfa" fontWeight="600">
                          Socket Demultiplexing Invariant:
                        </text>
                        <text x={0} y={92} fill="#94a3b8">
                          Distinct ephemeral source ports isolate concurrent tabs to the same server port
                        </text>
                      </g>
                    </g>

                    {/* Card 3 at (1040, 360): Kernel Socket Hash Table */}
                    <g transform="translate(1040, 360)">
                      <rect x={0} y={0} width={380} height={175} rx={6} fill="#070c14" stroke="#38bdf8" strokeWidth={1.2} />
                      <text x={190} y={20} textAnchor="middle" fill="#38bdf8" fontSize="8.5" fontWeight="700" fontFamily="monospace">
                        KERNEL SOCKET HASH TABLE
                      </text>
                      <g transform="translate(16, 38)" fill="#cbd5e1" fontSize="7.5" fontFamily="monospace">
                        <text x={0} y={0} fill="#60a5fa" fontWeight="600">How OS Routes Incoming Bytes:</text>
                        <text x={12} y={14}>1. Packet arrives: Dst Port = 52101</text>
                        <text x={12} y={28}>2. Kernel hashes 5-tuple to find socket</text>
                        <text x={12} y={42}>3. Matches socket for browser-tab-1</text>
                        <text x={12} y={56}>4. Copies bytes to tab-1 memory buffer</text>
                        <text x={0} y={74} fill="#4ade80" fontWeight="600">Zero Cross-Contamination:</text>
                        <text x={12} y={88} fill="#94a3b8">Even with 100,000 clients on Port 443,</text>
                        <text x={12} y={102} fill="#94a3b8">each socket buffer is completely isolated</text>
                      </g>
                    </g>
                  </>
                )}

                {/* Step 3: Transport Header Anatomy & Closed Ports */}
                {activeStepIndex === 3 && (
                  <>
                    {/* Overhead Transport Header Layout Card at translate(440, 65) */}
                    <g transform="translate(440, 65)">
                      <rect
                        x={0}
                        y={0}
                        width={600}
                        height={85}
                        rx={6}
                        fill="#070c14"
                        stroke="#38bdf8"
                        strokeWidth={1.2}
                      />
                      <text
                        x={300}
                        y={18}
                        textAnchor="middle"
                        fill="#38bdf8"
                        fontSize="8"
                        fontWeight="700"
                        fontFamily="monospace"
                      >
                        TCP / UDP TRANSPORT HEADER (FIRST 4 BYTES)
                      </text>

                      {/* Source Port (Bytes 0-1) */}
                      <g transform="translate(15, 26)">
                        <rect x={0} y={0} width={280} height={46} rx={4} fill="#0c1a30" stroke="#38bdf8" strokeWidth={1} />
                        <text x={140} y={16} textAnchor="middle" fill="#7dd3fc" fontSize="7.5" fontWeight="700" fontFamily="monospace">
                          SOURCE PORT (16 BITS / 2 BYTES)
                        </text>
                        <text x={140} y={32} textAnchor="middle" fill="#cbd5e1" fontSize="7" fontFamily="monospace">
                          Range: 0 – 65,535 (Bits 0–15)
                        </text>
                      </g>

                      {/* Destination Port (Bytes 2-3) */}
                      <g transform="translate(305, 26)">
                        <rect x={0} y={0} width={280} height={46} rx={4} fill="#064e3b" stroke="#34d399" strokeWidth={1} />
                        <text x={140} y={16} textAnchor="middle" fill="#6ee7b7" fontSize="7.5" fontWeight="700" fontFamily="monospace">
                          DESTINATION PORT (16 BITS / 2 BYTES)
                        </text>
                        <text x={140} y={32} textAnchor="middle" fill="#cbd5e1" fontSize="7" fontFamily="monospace">
                          Range: 0 – 65,535 (Bits 16–31)
                        </text>
                      </g>
                    </g>

                    {/* Port 80 vs 81 Probing Badges above Server */}
                    <g transform="translate(1220, 115)">
                      <g transform="translate(0, 0)">
                        <rect x={-95} y={-9} width={190} height={18} rx={3} fill="#064e3b" stroke="#34d399" strokeWidth={1} />
                        <text x={0} y={3.5} textAnchor="middle" fill="#6ee7b7" fontSize="6.8" fontWeight="700" fontFamily="monospace">
                          Port 80 [HTTP]: OPEN → SYN-ACK
                        </text>
                      </g>
                      <g transform="translate(0, 24)">
                        <rect x={-95} y={-9} width={190} height={18} rx={3} fill="#450a0a" stroke="#ef4444" strokeWidth={1} />
                        <text x={0} y={3.5} textAnchor="middle" fill="#fca5a5" fontSize="6.8" fontWeight="700" fontFamily="monospace">
                          Port 81 [TCP]: CLOSED → TCP RST
                        </text>
                      </g>
                    </g>

                    {/* Card 1 at (70, 360): Open vs Closed Ports */}
                    <g transform="translate(70, 360)">
                      <rect x={0} y={0} width={280} height={175} rx={6} fill="#070c14" stroke="#38bdf8" strokeWidth={1.2} />
                      <text x={140} y={20} textAnchor="middle" fill="#38bdf8" fontSize="8.5" fontWeight="700" fontFamily="monospace">
                        OPEN VS CLOSED PORTS
                      </text>
                      <g transform="translate(14, 38)" fill="#cbd5e1" fontSize="7.5" fontFamily="monospace">
                        <text x={0} y={0} fill="#34d399" fontWeight="600">Open Port Behavior:</text>
                        <text x={12} y={14}>• Process bound to socket</text>
                        <text x={12} y={28}>• Kernel replies: TCP SYN-ACK</text>
                        <text x={0} y={46} fill="#ef4444" fontWeight="600">Closed Port Behavior:</text>
                        <text x={12} y={60}>• No listening socket found</text>
                        <text x={12} y={74} fill="#fca5a5">• TCP: Kernel sends TCP RST flag</text>
                        <text x={12} y={88} fill="#fef08a">• UDP: Kernel sends ICMP 3:3</text>
                        <text x={0} y={106} fill="#94a3b8">Filtered: Firewall dropped packet</text>
                      </g>
                    </g>

                    {/* Card 2 at (380, 360): Port Probing Telemetry */}
                    <g transform="translate(380, 360)">
                      <rect x={0} y={0} width={620} height={175} rx={6} fill="#070c14" stroke="#1e293b" strokeWidth={1.2} />
                      <text x={310} y={20} textAnchor="middle" fill="#f1f5f9" fontSize="8.5" fontWeight="700" fontFamily="monospace">
                        PORT PROBING TELEMETRY (NC -ZV 198.51.100.10 80 81)
                      </text>
                      <g transform="translate(20, 38)" fill="#cbd5e1" fontSize="7.5" fontFamily="monospace">
                        <text x={0} y={0} fill="#4ade80" fontWeight="600">
                          Connection to 198.51.100.10 80 port [tcp/http] succeeded!
                        </text>
                        <text x={0} y={16} fill="#f87171" fontWeight="600">
                          nc: connect to 198.51.100.10 port 81 (tcp) failed: Connection refused
                        </text>
                        <line x1={0} y1={26} x2={580} y2={26} stroke="#334155" strokeWidth={1} />
                        <text x={0} y={40} fill="#38bdf8" fontWeight="600">Physical Protocol Analysis:</text>
                        <text x={12} y={56}>• Port 80 is OPEN: nginx returned SYN-ACK; connection succeeded</text>
                        <text x={12} y={72}>• Port 81 is CLOSED: Host kernel actively returned TCP RST (Reset)</text>
                        <text x={12} y={88} fill="#cbd5e1">• The RST flag explicitly notifies the client to abort immediately</text>
                        <text x={12} y={104} fill="#94a3b8">• If port was filtered, nc would hang waiting for timeout</text>
                      </g>
                    </g>

                    {/* Card 3 at (1040, 360): How Port Scanners Work */}
                    <g transform="translate(1040, 360)">
                      <rect x={0} y={0} width={380} height={175} rx={6} fill="#070c14" stroke="#38bdf8" strokeWidth={1.2} />
                      <text x={190} y={20} textAnchor="middle" fill="#38bdf8" fontSize="8.5" fontWeight="700" fontFamily="monospace">
                        HOW PORT SCANNERS WORK (SYN VS RST)
                      </text>
                      <g transform="translate(16, 38)" fill="#cbd5e1" fontSize="7.5" fontFamily="monospace">
                        <text x={0} y={0} fill="#60a5fa" fontWeight="600">Scanner Tri-State Logic:</text>
                        <text x={12} y={14}>• SYN-ACK received → OPEN</text>
                        <text x={12} y={28} fill="#ef4444">• RST received → CLOSED</text>
                        <text x={12} y={42} fill="#94a3b8">• No reply / timeout → FILTERED</text>
                        <text x={0} y={60} fill="#4ade80" fontWeight="600">Kernel Active Rejection:</text>
                        <text x={12} y={74}>Receiving a TCP RST proves the host</text>
                        <text x={12} y={88}>is online, IP routing succeeded, and</text>
                        <text x={12} y={102} fill="#94a3b8">the network fabric is fully operational</text>
                      </g>
                    </g>
                  </>
                )}

                {/* Step 4: Recap: The 4 Core Rules of Ports and Sockets */}
                {activeStepIndex === 4 && (
                  <>
                    {/* Card 1 at (70, 350): Layer 4 Cheat Sheet */}
                    <g transform="translate(70, 350)">
                      <rect x={0} y={0} width={280} height={185} rx={6} fill="#070c14" stroke="#38bdf8" strokeWidth={1.2} />
                      <text x={140} y={20} textAnchor="middle" fill="#38bdf8" fontSize="8.5" fontWeight="700" fontFamily="monospace">
                        LAYER 4 CHEAT SHEET
                      </text>
                      <g transform="translate(14, 38)" fill="#cbd5e1" fontSize="7.5" fontFamily="monospace">
                        <text x={0} y={0} fill="#34d399" fontWeight="600">Host vs Process</text>
                        <text x={12} y={13} fill="#94a3b8">IP routes to host; Port routes to process</text>
                        <text x={0} y={27} fill="#60a5fa" fontWeight="600">Port Number Spectrum</text>
                        <text x={12} y={40} fill="#94a3b8">16-bit integer (0 to 65,535)</text>
                        <text x={0} y={54} fill="#f59e0b" fontWeight="600">The Socket 5-Tuple</text>
                        <text x={12} y={67} fill="#94a3b8">(SIP, SPort, DIP, DPort, Proto)</text>
                        <text x={0} y={81} fill="#ef4444" fontWeight="600">Closed Port Response</text>
                        <text x={12} y={94} fill="#94a3b8">TCP RST / UDP ICMP Port Unreachable</text>
                        <text x={0} y={112} fill="#38bdf8" fontWeight="600">Transport Multiplexing Mastered</text>
                      </g>
                    </g>

                    {/* Card 2 at (380, 350): The 4 Core Rules */}
                    <g transform="translate(380, 350)">
                      <rect x={0} y={0} width={720} height={185} rx={8} fill="#070c14" stroke="#38bdf8" strokeWidth={1.3} />
                      <text x={360} y={22} textAnchor="middle" fill="#38bdf8" fontSize="9.5" fontWeight="700" fontFamily="monospace">
                        THE 4 CORE RULES OF PORTS, SOCKETS &amp; TRANSPORT MULTIPLEXING
                      </text>
                      <g transform="translate(20, 42)" fill="#cbd5e1" fontSize="8" fontFamily="monospace">
                        <text x={0} y={0}>
                          1. HOST VS PROCESS: Layer 3 IP delivers frames to the NIC; Layer 4 Port numbers deliver data bytes to specific process buffers.
                        </text>
                        <text x={0} y={16}>
                          2. PORT HIERARCHY: Well-Known (0–1023, privileged root daemons), Registered (1024–49151, user apps), Ephemeral (49152–65535, client dynamic).
                        </text>
                        <text x={0} y={32}>
                          3. THE 5-TUPLE: Every active connection is uniquely identified by (Src IP, Src Port, Dst IP, Dst Port, Protocol); unique client source ports allow multi-tab concurrency.
                        </text>
                        <text x={0} y={48} fill="#4ade80" fontWeight="600">
                          4. ACTIVE PORT REJECTION: Unoccupied ports return TCP RST or ICMP Type 3 Code 3; they are never silently ignored by healthy operating system kernels.
                        </text>
                        <line x1={0} y1={60} x2={680} y2={60} stroke="#1e293b" strokeWidth={1} />
                        <text x={0} y={78} fill="#a78bfa" fontWeight="600">
                          Stage 5 Transport Foundations Unlocked: You understand how operating systems multiplex internet streams.
                        </text>
                        <text x={0} y={96} fill="#6ee7b7" fontWeight="600">
                          Next: Day 17 · TCP Three-Way Handshake &amp; Reliable Streams →
                        </text>
                      </g>
                    </g>

                    {/* Card 3 at (1130, 350): Transport Metrics */}
                    <g transform="translate(1130, 350)">
                      <rect x={0} y={0} width={280} height={185} rx={6} fill="#070c14" stroke="#1e293b" strokeWidth={1.2} />
                      <text x={140} y={20} textAnchor="middle" fill="#f1f5f9" fontSize="8.5" fontWeight="700" fontFamily="monospace">
                        TRANSPORT METRICS
                      </text>
                      <g transform="translate(16, 38)" fill="#cbd5e1" fontSize="7.5" fontFamily="monospace">
                        <text x={0} y={0}>Port Space: 65,536 ports</text>
                        <text x={0} y={16}>Ephemeral Pool: 28,232 sockets</text>
                        <text x={0} y={32}>Active Listeners: 4 services</text>
                        <text x={0} y={48}>Concurrent Streams: 2 tabs + SSH</text>
                        <text x={0} y={64} fill="#4ade80" fontWeight="600">
                          Closed Port Signal: TCP RST
                        </text>
                        <text x={0} y={80} fill="#38bdf8">
                          Transport State: Established
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
