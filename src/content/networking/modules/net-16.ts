import { NetworkingModule } from '@/types/networking';

export const NET_16_MODULE: NetworkingModule = {
  id: 'net-16',
  dayNumber: 16,
  title: 'Day 16 · Ports: Reaching the Right Program',
  shortTitle: 'Ports: Reaching the Right Program',
  steps: [
    {
      group: 'Idea 1 of 4 · Process addressing',
      chg: 'Since Day 15: You traced packets across routers and autonomous systems using IP addresses. Now, packets reach the destination machine. But how does the operating system know which application program should receive the data bytes?',
      title: 'Host-to-host vs process-to-process delivery',
      what:
        'Internet Protocol (IPv4 / IPv6) is strictly a host-to-host delivery protocol.\nAn IP address identifies a Network Interface Card (NIC) attached to a computer on a network. When an Ethernet frame carrying an IP packet arrives at a host, the physical and network layers succeed: the packet reached the right machine.\n\nHowever, modern operating systems run dozens or hundreds of concurrent programs simultaneously:\n• A web browser with multiple open tabs\n• An SSH remote management terminal daemon\n• A background database server (PostgreSQL)\n• A DNS resolver service\n\nIf the arriving IP packet only contains the destination IP (e.g. 198.51.100.10), the OS kernel has no way to determine which application process owns the incoming byte stream!\n\nThe Transport Layer (Layer 4) solves this problem by adding Port Numbers.\nA port is a 16-bit unsigned integer (ranging from 0 to 65,535) embedded in the header of every Layer 4 segment (TCP or UDP).\nWhen an application starts a network service, it asks the OS kernel to "bind" to a specific port number and listen for incoming connections.\n\nLet’s inspect the listening service ports on our multi-service server.',
      why: 'Distinguishing host addressing (Layer 3 IP) from process addressing (Layer 4 Port) is the bedrock of transport protocol design.',
      pic: 'Incoming IP packet arrives at the host NIC, where the OS kernel inspects the Layer 4 destination port to demultiplex data to the correct process socket buffer.',
      task: 'Inspect active listening server processes using ss -tlpn.',
      cmd: 'ss -tlpn',
      read: [
        ['Layer 3 Responsibility', 'Host-to-host delivery via 32-bit IP addresses'],
        ['Layer 4 Responsibility', 'Process-to-process multiplexing via 16-bit Port numbers (0–65535)'],
        ['Port 22 (SSH)', 'sshd daemon listening on 0.0.0.0:22 (PID 412)'],
        ['Port 80 (HTTP)', 'nginx web server listening on 0.0.0.0:80 (PID 884)'],
        ['Port 5432 (PostgreSQL)', 'postgres database listening on 127.0.0.1:5432 (PID 920)'],
      ],
      rem: 'IP addresses identify machines; port numbers identify specific application processes on those machines.',
    },
    {
      group: 'Idea 2 of 4 · Port categories',
      chg: 'We saw that services bind to numbers like 22, 80, and 5432. The Internet Assigned Numbers Authority (IANA) divides the 65,536 available ports into three distinct operational ranges.',
      title: 'Well-known, registered, and ephemeral ports',
      what:
        'The 16-bit port number space (0 through 65,535) is standardized by IANA under RFC 6335 into three functional tiers:\n\n1. Well-Known Ports (0 – 1023):\nReserved for core infrastructure and universally standardized services.\n• Port 22: SSH (Secure Shell)\n• Port 25: SMTP (Simple Mail Transfer)\n• Port 53: DNS (Domain Name System)\n• Port 80: HTTP (Unencrypted Web)\n• Port 443: HTTPS (TLS Encrypted Web)\nSecurity Invariant: On POSIX/Linux systems, binding to ports below 1024 requires administrative privileges (root or the CAP_NET_BIND_SERVICE capability) to prevent untrusted users from running rogue system daemons.\n\n2. Registered Ports (1024 – 49151):\nAssigned by IANA to software vendors and developers for specific application services:\n• Port 3306: MySQL Database\n• Port 5432: PostgreSQL Database\n• Port 6379: Redis In-Memory Cache\n• Port 8080: Alternative HTTP development server\nAny standard user process can bind to registered ports without root privileges.\n\n3. Ephemeral / Dynamic Ports (49152 – 65535):\nNever used by permanent listening servers. Instead, when a client application (such as your web browser or curl) initiates an outbound connection, the operating system kernel automatically assigns a temporary, high-numbered port from this pool as the client’s source port.\n(Note: The Linux kernel default dynamic range is configured via /proc/sys/net/ipv4/ip_local_port_range, typically 32768–60999).\n\nLet’s inspect the kernel’s ephemeral port allocation parameters.',
      why: 'Understanding port tiers explains why servers use static low ports while clients use dynamic high ports, and clarifies permission boundaries.',
      pic: 'Three-tier port spectrum diagram displaying Well-Known (0–1023, privileged), Registered (1024–49151, user daemons), and Ephemeral (49152–65535, client allocation).',
      task: 'Query the client operating system ephemeral port range using show ip-port-range.',
      cmd: 'show ip-port-range',
      read: [
        ['Well-Known Range (0–1023)', 'Reserved for system daemons (HTTP:80, HTTPS:443, SSH:22). Requires root privileges.'],
        ['Registered Range (1024–49151)', 'Standard databases & apps (MySQL:3306, Postgres:5432, Redis:6379).'],
        ['Ephemeral Range (49152–65535)', 'Auto-assigned by OS kernel for client outbound source ports.'],
        ['Linux Kernel Config', 'ip_local_port_range = 32768 60999 (28,232 concurrent client ports per destination IP)'],
      ],
      rem: 'Servers listen on well-known or registered static ports; clients are dynamically assigned ephemeral ports by the OS kernel.',
    },
    {
      group: 'Idea 3 of 4 · Connection multiplexing',
      chg: 'We know servers listen on static ports and clients receive ephemeral ports. Now, consider a real scenario: you open three tabs in your browser to the exact same web server (198.51.100.10:443). How does the server or client avoid mixing up the data?',
      title: 'The socket 5-tuple: Demultiplexing concurrent streams',
      what:
        'A network "Socket" is the software interface between an operating system application and the network stack. In code, a socket endpoint is defined by:\n(IP Address, Port Number).\n\nHowever, a destination IP and destination port are NOT enough to identify a unique conversation.\nEvery active network connection on the internet is uniquely identified by the 5-Tuple:\n1. Source IP Address\n2. Source Port Number\n3. Destination IP Address\n4. Destination Port Number\n5. Transport Protocol (TCP or UDP)\n\nHow Multi-Tab Browsing Works:\nWhen your browser opens two tabs to https://198.51.100.10:\n• Tab 1 Socket: (192.168.1.10, 52101, 198.51.100.10, 443, TCP)\n• Tab 2 Socket: (192.168.1.10, 52102, 198.51.100.10, 443, TCP)\n\nNotice:\nBoth connections share the identical Source IP (192.168.1.10), Destination IP (198.51.100.10), Destination Port (443), and Protocol (TCP).\nThe ONLY difference is the ephemeral Source Port allocated by the client OS (52101 vs 52102)!\n\nWhen the web server replies with web data:\n• Reply to Tab 1: Dst IP 192.168.1.10, Dst Port 52101 → Kernel routes bytes to Tab 1’s memory buffer.\n• Reply to Tab 2: Dst IP 192.168.1.10, Dst Port 52102 → Kernel routes bytes to Tab 2’s memory buffer.\n\nThis mechanism is called Demultiplexing. A single web server can maintain over 100,000 active connections on Port 443 because each connection has a unique client IP and client ephemeral port!\n\nLet’s inspect active connections between PC1 and the Web Server.',
      why: 'Deconstructs how thousands of processes and connections coexist over a single physical cable and single IP address without cross-contamination.',
      pic: 'PC1 with two browser processes sending packets with distinct ephemeral ports (52101 and 52102) to the server on port 443, showing the kernel socket table demultiplexing replies.',
      task: 'Inspect established client connections using ss -t4 state established.',
      cmd: 'ss -t4 state established',
      read: [
        ['5-Tuple Definition', 'Protocol, Source IP, Source Port, Destination IP, Destination Port'],
        ['Stream 1 (Tab 1)', 'TCP  192.168.1.10:52101 → 198.51.100.10:443 (ESTABLISHED)'],
        ['Stream 2 (Tab 2)', 'TCP  192.168.1.10:52102 → 198.51.100.10:443 (ESTABLISHED)'],
        ['Demultiplexing Rule', 'Unique ephemeral source ports allow the client OS to route reply bytes to distinct process buffers'],
      ],
      rem: 'Every connection is uniquely identified by its 5-tuple; distinct ephemeral source ports allow concurrent connections to the same server port.',
    },
    {
      group: 'Idea 4 of 4 · Header fields and port state',
      chg: 'We understand how sockets demultiplex streams. Now let’s look at the actual byte positions in the transport header, and see what happens when a packet arrives at a port that no process is listening to.',
      title: 'Header byte layout and closed port responses',
      what:
        'Where do ports physically exist inside a packet?\nUnlike IP addresses, which are located at Layer 3, ports exist in the first 4 bytes of both TCP (RFC 793) and UDP (RFC 768) headers:\n• Bytes 0–1 (Bits 0–15): Source Port (16 bits)\n• Bytes 2–3 (Bits 16–31): Destination Port (16 bits)\n\nBecause these fields are exactly 16 bits wide, 2^16 = 65,536 unique port values (0 to 65,535) can be encoded. Port 0 is reserved and invalid for network transmission.\n\nWhat Happens If a Packet Reaches a Closed Port?\nSuppose a client sends a TCP SYN packet to Port 81 on our server, but no application process is listening on Port 81:\n1. The NIC receives the frame and passes it to the OS kernel.\n2. The kernel verifies the destination IP matches the host.\n3. The kernel consults its internal Socket Table for TCP port 81.\n4. Finding no process bound to port 81, the kernel does NOT silently drop the packet!\n5. Instead, the OS immediately transmits an active rejection:\n   • For TCP: The kernel sends a TCP segment with the RST (Reset) and ACK flags set. This explicitly tells the client: "No process is listening here. Close your connection."\n   • For UDP: The kernel returns an ICMP Type 3 Code 3 (Destination Port Unreachable) error message!\n\nThis is how port scanners (such as nmap) instantly determine whether a port is OPEN (replies with SYN-ACK), CLOSED (replies with RST or ICMP Port Unreachable), or FILTERED (no reply / dropped by firewall).\n\nLet’s test connecting to an open port (80) versus a closed port (81).',
      why: 'Explains physical header byte positions and teaches engineers how operating systems actively signal non-listening ports (TCP RST vs UDP ICMP Port Unreachable).',
      pic: 'Transport segment header diagram showing 16-bit Source Port and Destination Port fields, followed by kernel socket lookup and TCP RST generation on closed ports.',
      task: 'Probe both open and closed ports using nc -zv 198.51.100.10 80 81.',
      cmd: 'nc -zv 198.51.100.10 80 81',
      read: [
        ['Header Position', 'Bytes 0–1: Source Port (16 bits), Bytes 2–3: Destination Port (16 bits)'],
        ['Port 80 (Open)', 'Connection to 198.51.100.10 80 port [tcp/http] succeeded! (Kernel returned SYN-ACK)'],
        ['Port 81 (Closed)', 'connect to 198.51.100.10 port 81 (tcp) failed: Connection refused (Kernel returned TCP RST)'],
        ['Rejection Invariant', 'TCP closed ports return RST; UDP closed ports return ICMP Type 3 Code 3'],
      ],
      rem: 'Ports occupy the first 4 bytes of TCP/UDP headers; when a port is closed, the host kernel replies with TCP RST or ICMP Port Unreachable.',
    },
    {
      group: 'Recap',
      title: 'The four rules of ports and sockets',
      what:
        'The Transport Layer bridges network hardware to software processes. By utilizing 16-bit port numbers and 5-tuple socket multiplexing, operating systems allow millions of concurrent internet conversations to traverse shared physical cables and IP addresses without interference.',
      why: 'Consolidates Layer 4 multiplexing before diving into the TCP state machine, 3-way handshake, and reliable sequence tracking in Days 17–19.',
      pic: 'Master transport HUD diagram illustrating Layer 4 port spectrum, socket 5-tuple table, OS process demultiplexing, and open vs closed port kernel state responses.',
      task: 'Review the four fundamental rules of Layer 4 ports, sockets, and transport multiplexing.',
      cmd: null,
      read: [
        ['1. Host vs Process', 'IP delivers packets to the machine; Port numbers deliver data to specific processes'],
        ['2. Port Hierarchy', 'Well-Known (0–1023, privileged), Registered (1024–49151), Ephemeral (49152–65535, client dynamic)'],
        ['3. The 5-Tuple', '(Src IP, Src Port, Dst IP, Dst Port, Protocol) uniquely defines every active internet connection'],
        ['4. Port Rejection State', 'Active OS kernels return TCP RST or ICMP Type 3 Code 3 when traffic arrives at closed ports'],
      ],
      rem: 'Layer 4 ports demultiplex concurrent data streams to software processes using the 5-tuple socket model.',
    },
  ],
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
  },
};
