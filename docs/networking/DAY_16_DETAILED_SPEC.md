# SQLens Networking Track — Day 16 Detailed Specification
## Stage 5: Transport Layer & Core Internet Protocols (Days 14–19)
### Module: `net-16` · Ports & Sockets: Layer 4 Transport Multiplexing

---

## 1. Pedagogical Intent & Objectives

### Context & Learning Progression
- **Days 1–13**: Established Layer 1 (Physical cables, bits), Layer 2 (Ethernet frames, MAC addresses, switches, VLANs, STP), and Layer 3 (IP packets, subnets, routers, gateways, routing tables).
- **Days 14–15**: Deconstructed ICMP error signaling (RFC 792), IPv4 TTL hop limits, traceroute probe telemetry, fiber latency physics, and asymmetric routing.
- **Day 16 (This Module)**: Crosses the boundary into **Layer 4: The Transport Layer**.
  - Learners understand that IP addresses deliver packets only from **host to host** (machine to machine).
  - To deliver data to a specific **application process** running on that host, operating system kernels use **Port numbers** (16-bit integers, 0 to 65,535) embedded in TCP and UDP headers.
  - Explores the port hierarchy (Well-Known vs Registered vs Ephemeral), the fundamental **Socket 5-Tuple**, and how a client multiplexes multiple concurrent connections to the same server port.

### Key Pedagogical Constraints
- **Zero Analogies Policy**:
  - STRICTLY FORBIDDEN: Metaphors (no apartment door numbers, PO boxes, mail slots, telephone extensions, office cubicles).
  - MANDATORY: Exact physical & digital realities: 16-bit header fields in RFC 793 / RFC 768, operating system kernel socket tables, `struct sockaddr_in`, OS process file descriptors, TCP `LISTEN` and `ESTABLISHED` states, TCP `RST` packets, and ICMP Type 3 Code 3 responses.
- **Taught Before Tested**:
  - Motivate process demultiplexing before introducing the 16-bit port number field.
  - Define Well-Known (0–1023), Registered (1024–49151), and Ephemeral (49152–65535) before testing command output.
  - Explain the 5-Tuple `(Src IP, Src Port, Dst IP, Dst Port, Protocol)` before showing multiple browser connections.
- **Task Hint Policy**: Omit `(tap it to fill the terminal).` and end all task instructions with a clean period.

---

## 2. Module Identity & Metadata

```typescript
export const NET_16_MODULE: NetworkingModule = {
  id: 'net-16',
  dayNumber: 16,
  title: 'Day 16 · Ports: Reaching the Right Program',
  shortTitle: 'Ports: Reaching the Right Program',
  steps: [
    // 5 steps: 4 Ideas + 1 Recap
  ],
  staticResponses: {
    // Exact command outputs
  },
};
```

---

## 3. Step-by-Step Curriculum Architecture

### Step 1: Idea 1 of 4 · Host vs Process Delivery: Why IP Alone Is Not Enough
- **Group**: `Idea 1 of 4 · Process addressing`
- **Chg**: `Since Day 15: You traced packets across routers and autonomous systems using IP addresses. Now, packets reach the destination machine. But how does the operating system know which application program should receive the data bytes?`
- **Title**: Host-to-host vs process-to-process delivery
- **What**:
  ```text
  Internet Protocol (IPv4 / IPv6) is strictly a host-to-host delivery protocol.
  An IP address identifies a Network Interface Card (NIC) attached to a computer on a network. When an Ethernet frame carrying an IP packet arrives at a host, the physical and network layers succeed: the packet reached the right machine.

  However, modern operating systems run dozens or hundreds of concurrent programs simultaneously:
  • A web browser with multiple open tabs
  • An SSH remote management terminal daemon
  • A background database server (PostgreSQL)
  • A DNS resolver service

  If the arriving IP packet only contains the destination IP (e.g. 198.51.100.10), the OS kernel has no way to determine which application process owns the incoming byte stream!

  The Transport Layer (Layer 4) solves this problem by adding Port Numbers.
  A port is a 16-bit unsigned integer (ranging from 0 to 65,535) embedded in the header of every Layer 4 segment (TCP or UDP).
  When an application starts a network service, it asks the OS kernel to "bind" to a specific port number and listen for incoming connections.

  Let’s inspect the listening service ports on our multi-service server.
  ```
- **Why**: Distinguishing host addressing (Layer 3 IP) from process addressing (Layer 4 Port) is the bedrock of transport protocol design.
- **Pic**: `Incoming IP packet arrives at the host NIC, where the OS kernel inspects the Layer 4 destination port to demultiplex data to the correct process socket buffer.`
- **Task**: `Inspect active listening server processes using ss -tlpn.`
- **Cmd**: `ss -tlpn`
- **Read**:
  - `['Layer 3 Responsibility', 'Host-to-host delivery via 32-bit IP addresses']`
  - `['Layer 4 Responsibility', 'Process-to-process multiplexing via 16-bit Port numbers (0–65535)']`
  - `['Port 22 (SSH)', 'sshd daemon listening on 0.0.0.0:22 (PID 412)']`
  - `['Port 80 (HTTP)', 'nginx web server listening on 0.0.0.0:80 (PID 884)']`
  - `['Port 5432 (PostgreSQL)', 'postgres database listening on 127.0.0.1:5432 (PID 920)']`
- **Rem**: `IP addresses identify machines; port numbers identify specific application processes on those machines.`

---

### Step 2: Idea 2 of 4 · The Port Number Hierarchy (RFC 6335)
- **Group**: `Idea 2 of 4 · Port categories`
- **Chg**: `We saw that services bind to numbers like 22, 80, and 5432. The Internet Assigned Numbers Authority (IANA) divides the 65,536 available ports into three distinct operational ranges.`
- **Title**: Well-known, registered, and ephemeral ports
- **What**:
  ```text
  The 16-bit port number space (0 through 65,535) is standardized by IANA under RFC 6335 into three functional tiers:

  1. Well-Known Ports (0 – 1023):
  Reserved for core infrastructure and universally standardized services.
  • Port 22: SSH (Secure Shell)
  • Port 25: SMTP (Simple Mail Transfer)
  • Port 53: DNS (Domain Name System)
  • Port 80: HTTP (Unencrypted Web)
  • Port 443: HTTPS (TLS Encrypted Web)
  Security Invariant: On POSIX/Linux systems, binding to ports below 1024 requires administrative privileges (root or the CAP_NET_BIND_SERVICE capability) to prevent untrusted users from running rogue system daemons.

  2. Registered Ports (1024 – 49151):
  Assigned by IANA to software vendors and developers for specific application services:
  • Port 3306: MySQL Database
  • Port 5432: PostgreSQL Database
  • Port 6379: Redis In-Memory Cache
  • Port 8080: Alternative HTTP development server
  Any standard user process can bind to registered ports without root privileges.

  3. Ephemeral / Dynamic Ports (49152 – 65535):
  Never used by permanent listening servers. Instead, when a client application (such as your web browser or curl) initiates an outbound connection, the operating system kernel automatically assigns a temporary, high-numbered port from this pool as the client’s source port.
  (Note: The Linux kernel default dynamic range is configured via /proc/sys/net/ipv4/ip_local_port_range, typically 32768–60999).

  Let’s inspect the kernel’s ephemeral port allocation parameters.
  ```
- **Why**: Understanding port tiers explains why servers use static low ports while clients use dynamic high ports, and clarifies permission boundaries.
- **Pic**: `Three-tier port spectrum diagram displaying Well-Known (0–1023, privileged), Registered (1024–49151, user daemons), and Ephemeral (49152–65535, client allocation).`
- **Task**: `Query the client operating system ephemeral port range using show ip-port-range.`
- **Cmd**: `show ip-port-range`
- **Read**:
  - `['Well-Known Range (0–1023)', 'Reserved for system daemons (HTTP:80, HTTPS:443, SSH:22). Requires root privileges.']`
  - `['Registered Range (1024–49151)', 'Standard databases & apps (MySQL:3306, Postgres:5432, Redis:6379).']`
  - `['Ephemeral Range (49152–65535)', 'Auto-assigned by OS kernel for client outbound source ports.']`
  - `['Linux Kernel Config', 'ip_local_port_range = 32768 60999 (28,232 concurrent client ports per destination IP)']`
- **Rem**: `Servers listen on well-known or registered static ports; clients are dynamically assigned ephemeral ports by the OS kernel.`

---

### Step 3: Idea 3 of 4 · The Socket 5-Tuple & Demultiplexing
- **Group**: `Idea 3 of 4 · Connection multiplexing`
- **Chg**: `We know servers listen on static ports and clients receive ephemeral ports. Now, consider a real scenario: you open three tabs in your browser to the exact same web server (198.51.100.10:443). How does the server or client avoid mixing up the data?`
- **Title**: The socket 5-tuple: Demultiplexing concurrent streams
- **What**:
  ```text
  A network "Socket" is the software interface between an operating system application and the network stack. In code, a socket endpoint is defined by:
  (IP Address, Port Number).

  However, a destination IP and destination port are NOT enough to identify a unique conversation.
  Every active network connection on the internet is uniquely identified by the 5-Tuple:
  1. Source IP Address
  2. Source Port Number
  3. Destination IP Address
  4. Destination Port Number
  5. Transport Protocol (TCP or UDP)

  How Multi-Tab Browsing Works:
  When your browser opens two tabs to https://198.51.100.10:
  • Tab 1 Socket: (192.168.1.10, 52101, 198.51.100.10, 443, TCP)
  • Tab 2 Socket: (192.168.1.10, 52102, 198.51.100.10, 443, TCP)

  Notice:
  Both connections share the identical Source IP (192.168.1.10), Destination IP (198.51.100.10), Destination Port (443), and Protocol (TCP).
  The ONLY difference is the ephemeral Source Port allocated by the client OS (52101 vs 52102)!

  When the web server replies with web data:
  • Reply to Tab 1: Dst IP 192.168.1.10, Dst Port 52101 → Kernel routes bytes to Tab 1’s memory buffer.
  • Reply to Tab 2: Dst IP 192.168.1.10, Dst Port 52102 → Kernel routes bytes to Tab 2’s memory buffer.

  This mechanism is called Demultiplexing. A single web server can maintain over 100,000 active connections on Port 443 because each connection has a unique client IP and client ephemeral port!

  Let’s inspect active connections between PC1 and the Web Server.
  ```
- **Why**: Deconstructs how thousands of processes and connections coexist over a single physical cable and single IP address without cross-contamination.
- **Pic**: `PC1 with two browser processes sending packets with distinct ephemeral ports (52101 and 52102) to the server on port 443, showing the kernel socket table demultiplexing replies.`
- **Task**: `Inspect established client connections using ss -t4 state established.`
- **Cmd**: `ss -t4 state established`
- **Read**:
  - `['5-Tuple Definition', 'Protocol, Source IP, Source Port, Destination IP, Destination Port']`
  - `['Stream 1 (Tab 1)', 'TCP  192.168.1.10:52101 → 198.51.100.10:443 (ESTABLISHED)']`
  - `['Stream 2 (Tab 2)', 'TCP  192.168.1.10:52102 → 198.51.100.10:443 (ESTABLISHED)']`
  - `['Demultiplexing Rule', 'Unique ephemeral source ports allow the client OS to route reply bytes to distinct process buffers']`
- **Rem**: `Every connection is uniquely identified by its 5-tuple; distinct ephemeral source ports allow concurrent connections to the same server port.`

---

### Step 4: Idea 4 of 4 · Transport Header Anatomy & Closed Ports
- **Group**: `Idea 4 of 4 · Header fields and port state`
- **Chg**: `We understand how sockets demultiplex streams. Now let’s look at the actual byte positions in the transport header, and see what happens when a packet arrives at a port that no process is listening to.`
- **Title**: Header byte layout and closed port responses
- **What**:
  ```text
  Where do ports physically exist inside a packet?
  Unlike IP addresses, which are located at Layer 3, ports exist in the first 4 bytes of both TCP (RFC 793) and UDP (RFC 768) headers:
  • Bytes 0–1 (Bits 0–15): Source Port (16 bits)
  • Bytes 2–3 (Bits 16–31): Destination Port (16 bits)

  Because these fields are exactly 16 bits wide, $2^{16} = 65,536$ unique port values ($0$ to $65,535$) can be encoded. Port 0 is reserved and invalid for network transmission.

  What Happens If a Packet Reaches a Closed Port?
  Suppose a client sends a TCP SYN packet to Port 81 on our server, but no application process is listening on Port 81:
  1. The NIC receives the frame and passes it to the OS kernel.
  2. The kernel verifies the destination IP matches the host.
  3. The kernel consults its internal Socket Table for TCP port 81.
  4. Finding no process bound to port 81, the kernel does NOT silently drop the packet!
  5. Instead, the OS immediately transmits an active rejection:
     • For TCP: The kernel sends a TCP segment with the RST (Reset) and ACK flags set. This explicitly tells the client: "No process is listening here. Close your connection."
     • For UDP: The kernel returns an ICMP Type 3 Code 3 (Destination Port Unreachable) error message!

  This is how port scanners (such as nmap) instantly determine whether a port is OPEN (replies with SYN-ACK), CLOSED (replies with RST or ICMP Port Unreachable), or FILTERED (no reply / dropped by firewall).

  Let’s test connecting to an open port (80) versus a closed port (81).
  ```
- **Why**: Explains physical header byte positions and teaches engineers how operating systems actively signal non-listening ports (TCP RST vs UDP ICMP Port Unreachable).
- **Pic**: `Transport segment header diagram showing 16-bit Source Port and Destination Port fields, followed by kernel socket lookup and TCP RST generation on closed ports.`
- **Task**: `Probe both open and closed ports using nc -zv 198.51.100.10 80 81.`
- **Cmd**: `nc -zv 198.51.100.10 80 81`
- **Read**:
  - `['Header Position', 'Bytes 0–1: Source Port (16 bits), Bytes 2–3: Destination Port (16 bits)']`
  - `['Port 80 (Open)', 'Connection to 198.51.100.10 80 port [tcp/http] succeeded! (Kernel returned SYN-ACK)']`
  - `['Port 81 (Closed)', 'connect to 198.51.100.10 port 81 (tcp) failed: Connection refused (Kernel returned TCP RST)']`
  - `['Rejection Invariant', 'TCP closed ports return RST; UDP closed ports return ICMP Type 3 Code 3']`
- **Rem**: `Ports occupy the first 4 bytes of TCP/UDP headers; when a port is closed, the host kernel replies with TCP RST or ICMP Port Unreachable.`

---

### Step 5: Recap · The Four Core Rules of Layer 4 Ports & Sockets
- **Group**: `Recap`
- **Title**: The four rules of ports and sockets
- **What**:
  ```text
  The Transport Layer bridges network hardware to software processes. By utilizing 16-bit port numbers and 5-tuple socket multiplexing, operating systems allow millions of concurrent internet conversations to traverse shared physical cables and IP addresses without interference.
  ```
- **Why**: Consolidates Layer 4 multiplexing before diving into the TCP state machine, 3-way handshake, and reliable sequence tracking in Days 17–19.
- **Pic**: `Master transport HUD diagram illustrating Layer 4 port spectrum, socket 5-tuple table, OS process demultiplexing, and open vs closed port kernel state responses.`
- **Task**: `Review the four fundamental rules of Layer 4 ports, sockets, and transport multiplexing.`
- **Cmd**: `null`
- **Read**:
  - `['1. Host vs Process', 'IP delivers packets to the machine; Port numbers deliver data to specific processes']`
  - `['2. Port Hierarchy', 'Well-Known (0–1023, privileged), Registered (1024–49151), Ephemeral (49152–65535, client dynamic)']`
  - `['3. The 5-Tuple', '(Src IP, Src Port, Dst IP, Dst Port, Protocol) uniquely defines every active internet connection']`
  - `['4. Port Rejection State', 'Active OS kernels return TCP RST or ICMP Type 3 Code 3 when traffic arrives at closed ports']`
- **Rem**: `Layer 4 ports demultiplex concurrent data streams to software processes using the 5-tuple socket model.`

---

## 4. Static Terminal Responses & Aliases

```typescript
staticResponses: {
  'ss -tlpn':
    'State      Recv-Q  Send-Q   Local Address:Port   Peer Address:Port  Process\n' +
    'LISTEN     0       128            0.0.0.0:22          0.0.0.0:*      users:(("sshd",pid=412,fd=3))\n' +
    'LISTEN     0       511            0.0.0.0:80          0.0.0.0:*      users:(("nginx",pid=884,fd=6))\n' +
    'LISTEN     0       128          127.0.0.1:5432        0.0.0.0:*      users:(("postgres",pid=920,fd=5))\n' +
    'LISTEN     0       511            0.0.0.0:443         0.0.0.0:*      users:(("nginx",pid=884,fd=7))',

  'show ip-port-range':
    'Layer 4 Port Number Allocation (RFC 6335 / Linux Kernel)\n' +
    '----------------------------------------------------------------------\n' +
    'Range Tier         Port Range       Privilege  Typical Usage\n' +
    'Well-Known Ports   0 – 1023         Root only  Standard Daemons (SSH:22, HTTP:80, HTTPS:443)\n' +
    'Registered Ports   1024 – 49151     User       Databases & Apps (MySQL:3306, Postgres:5432)\n' +
    'Dynamic/Ephemeral  49152 – 65535    Automatic  Client Outbound Source Ports\n' +
    '----------------------------------------------------------------------\n' +
    'Linux Kernel Ephemeral Config (/proc/sys/net/ipv4/ip_local_port_range):\n' +
    '  Lower Bound: 32768    Upper Bound: 60999    Total Pool: 28,232 sockets',

  'ss -t4 state established':
    'Recv-Q  Send-Q     Local Address:Port             Peer Address:Port        Process / State\n' +
    '0       0       192.168.1.10:52101           198.51.100.10:443          users:(("browser-tab-1",pid=2104))\n' +
    '0       0       192.168.1.10:52102           198.51.100.10:443          users:(("browser-tab-2",pid=2108))\n' +
    '0       0       192.168.1.10:49812            198.51.100.5:22           users:(("ssh",pid=1850))\n' +
    '----------------------------------------------------------------------\n' +
    'Socket Demultiplexing Invariant: Distinct ephemeral source ports isolate concurrent tabs to the same server port.',

  'nc -zv 198.51.100.10 80 81':
    'Connection to 198.51.100.10 80 port [tcp/http] succeeded!\n' +
    'nc: connect to 198.51.100.10 port 81 (tcp) failed: Connection refused\n' +
    '----------------------------------------------------------------------\n' +
    '[Analysis: Port 80 is OPEN (Kernel returned TCP SYN-ACK).\n' +
    '          Port 81 is CLOSED (Kernel actively returned TCP RST flag).] ',

  help:
    'Commands: ss -tlpn, show ip-port-range, ss -t4 state established, nc -zv 198.51.100.10 80 81, cls, clear, help',
}
```

### Workspace Aliases to Support:
- Step 0: `ss -tlpn`, `netstat -tlpn`, `netstat -tuln`, `ss -tuln`, `ss -tln`, `netstat -tln`
- Step 1: `show ip-port-range`, `show port range`, `show port ranges`, `cat /proc/sys/net/ipv4/ip_local_port_range`, `show ports`
- Step 2: `ss -t4 state established`, `ss -t state established`, `netstat -an | grep 198.51.100.10`, `ss -t4`, `ss -t`
- Step 3: `nc -zv 198.51.100.10 80 81`, `nc -zv 198.51.100.10 80`, `nc -zv 198.51.100.10 81`, `nmap -p 80,81 198.51.100.10`, `nmap 198.51.100.10`

---

## 5. Canvas Anti-Overlap Geometry & Layout

### Device Envelope & Coordinates:
- ViewBox: `0 0 1480 620`
- Top Title Banner: `x=500, y=18, width=480, height=22`
  - Text: `LAYER 4 TRANSPORT MULTIPLEXING · PORTS & SOCKETS`
- Devices:
  1. **Client PC1**: `SvgWorkstation` at `x=140, y=220`, IP `192.168.1.10/24`, MAC `00:1A:2B:3C:4D:10`
  2. **Layer 3 Switch / Gateway R1**: `SvgRouter` at `x=680, y=215`, Port 1 `192.168.1.1`, Port 2 `198.51.100.1`
  3. **Web & App Server**: `SvgWorkstation` at `x=1220, y=220`, IP `198.51.100.10/24`, MAC `00:1A:2B:3C:4D:99`
- Links:
  - Cable 1: `x1=228, y1=250` to `x2=680, y2=250` (color `#38bdf8`)
  - Cable 2: `x1=806, y1=250` to `x2=1220, y2=250` (color `#38bdf8`)
  - Link 1 Label at `translate(454, 190)`: `LAN Access Link (Gigabit Ethernet)`
  - Link 2 Label at `translate(1013, 190)`: `Datacenter Transit Link (10 GbE)`
- In-Flight Packets:
  - Cable 1 Span: $680 - 228 = 452\text{px}$. Packet badge width $\le 420\text{px}$.
  - Cable 2 Span: $1220 - 806 = 414\text{px}$. Packet badge width $\le 380\text{px}$.
  - Strictly maintain $\ge 15\text{px}$ clearance on both sides to eliminate chassis penetration.

### Step-Specific Overlays & Progressive Reveals:
- **Step 0**:
  - Above PC1: Client app processes tag `translate(140, 130)`: `Running Apps: Browser, SSH, Discord`
  - Above Server: Server service listener badges at `translate(1220, 110)`:
    - Box with 3 rows: `PID 412: sshd (Port 22)`, `PID 884: nginx (Port 80/443)`, `PID 920: postgres (Port 5432)`
  - Diagnostic HUD Cards at `y=360`:
    - Card 1 at `(70, 360)`, width 280: `HOST VS PROCESS ADDRESSING`
    - Card 2 at `(380, 360)`, width 620: `ACTIVE LISTENING SOCKETS (SS -TLPN)`
    - Card 3 at `(1040, 360)`, width 380: `THE BIND() & LISTEN() SYSTEM CALLS`
- **Step 1**:
  - Center Spectrum Diagram overhead across `x=400..1080` at `y=75..150`:
    - Tier 1 (0–1023): Well-Known (Red/Amber, `Privileged / Root`)
    - Tier 2 (1024–49151): Registered (Blue, `User Services`)
    - Tier 3 (49152–65535): Ephemeral (Green, `Client Dynamic`)
  - Diagnostic HUD Cards at `y=360`:
    - Card 1 at `(70, 360)`, width 280: `PORT HIERARCHY RULES`
    - Card 2 at `(380, 360)`, width 620: `IANA PORT ALLOCATION TIERS (SHOW IP-PORT-RANGE)`
    - Card 3 at `(1040, 360)`, width 380: `SECURITY & CAP_NET_BIND_SERVICE`
- **Step 2**:
  - Client Socket Badges above PC1 at `y=120..165`:
    - Tab 1 Socket: `Port 52101 → Web Server:443` (Green)
    - Tab 2 Socket: `Port 52102 → Web Server:443` (Cyan)
  - In-flight packet badge on Cable 2:
    - `Tab 1: 192.168.1.10:52101 → 198.51.100.10:443 [TCP ACK]`
  - Diagnostic HUD Cards at `y=360`:
    - Card 1 at `(70, 360)`, width 280: `THE SOCKET 5-TUPLE`
    - Card 2 at `(380, 360)`, width 620: `CONCURRENT CONNECTION DEMULTIPLEXING (SS -T4)`
    - Card 3 at `(1040, 360)`, width 380: `KERNEL SOCKET HASH TABLE`
- **Step 3**:
  - Transport Header Layout Card at `translate(400, 65)`:
    - Bytes 0–1: Source Port (16 bits) | Bytes 2–3: Destination Port (16 bits)
  - Port 80 vs Port 81 Probing indicators:
    - Port 80 Probe: `SYN → SYN-ACK (Open)` at server
    - Port 81 Probe: `SYN → RST (Closed / Connection Refused)` at server
  - Diagnostic HUD Cards at `y=360`:
    - Card 1 at `(70, 360)`, width 280: `OPEN VS CLOSED PORTS`
    - Card 2 at `(380, 360)`, width 620: `PORT PROBING TELEMETRY (NC -ZV 198.51.100.10 80 81)`
    - Card 3 at `(1040, 360)`, width 380: `HOW PORT SCANNERS WORK (SYN VS RST)`
- **Step 4 (Recap)**:
  - Master HUD Cheat Sheet displaying the 4 core rules of Layer 4 Transport Multiplexing.
  - Three summary cards at `y=360` with `cmd: null`.

---

## 6. Verification & Quality Checklist

1. **Curriculum**:
   - `src/content/networking/modules/net-16.ts`
   - Registered in `src/content/networking/index.ts`
   - Teaser added to `src/components/learning/networking/homepage/NetworkingHomePage.tsx`
2. **Interactive Workspace & Terminal**:
   - Normalized command aliases in `NetworkingWorkspace.tsx`
   - Static response routing in `NetworkingTerminal.tsx`
3. **Canvas Invariants**:
   - SvgWorkstation envelope cleared ($y \ge 360$ for bottom HUD cards)
   - Silver base chassis strictly exclusive to PC1 / Server workstations
   - Horizontal link cable clearance: in-flight badges maintain $\ge 15\text{px}$ from router and workstation chassis
4. **Test Coverage**:
   - Unit tests in `tests/curriculum/networking-curriculum.test.ts`
   - UI and coordinate anti-overlap tests in `tests/ui/networking-canvas.test.tsx`
   - Homepage test asserting `16 Days Live` in `tests/ui/networking-homepage.test.tsx`
   - Type-check: `npx tsc --noEmit`
   - Test suite: `npm test -- tests/curriculum/networking- tests/ui/networking-`
