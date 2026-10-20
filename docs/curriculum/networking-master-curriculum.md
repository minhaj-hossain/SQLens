# Networking Fundamentals Track — Master Curriculum Specification
**Version:** 2.0.0  
**Status:** FROZEN MASTER SPECIFICATION  
**Target Persona:** Absolute Beginners to Job-Ready Network Administrators & SREs  
**Pedagogy Engine:** Interactive Story Reel (Visual Cause-and-Effect) + Guided Workplace Lab (3-Beat Incident Triage)  
**Tooling Scope:** Dual-OS Environment (Windows PowerShell & Linux/Cisco CLI side-by-side)

---

## Pedagogical Golden Rules

1. **The 3-Beat Principle:**
   * **Beat 1: The Physical Dilemma First:** Why can't we do this simply? Show the failure on the wire before giving it a name.
   * **Beat 2: The Tool's Purpose:** What question does this command/protocol ask the operating system?
   * **Beat 3: The Observable Result:** What exact line on the screen proves that the concept worked?
2. **The Unbroken Chain of Causality:**
   * Every module starts with the exact unanswered dilemma left open by the previous module. Zero unearned jargon gaps.
3. **Multi-Concept Decomposition:**
   * Modules contain 2 to 4 micro-concepts (3–4 minutes per concept) with an interactive visual proof, followed by a realistic 10-minute workplace incident lab.

---

## Complete Curriculum Blueprint

### 🏛️ MILESTONE 1: Local Link & Layer 2 Switching
*Theme: From single isolated silicon to collision-free local office switching.*

#### **Module 01: The First Link & Hardware Identity**
* **Concept 1.1: The Trapped Data Dilemma**
  * *Physical Dilemma:* 1 isolated computer. Demonstrates why data cannot leave a motherboard without a physical medium.
  * *Takeaway:* Data requires a physical medium to travel beyond the local motherboard.
* **Concept 1.2: Copper Strands & Full-Duplex Channels**
  * *Physical Dilemma:* Cat6 8-strand copper cable. Pinout pairs: 100Mbps (2 pairs) vs Gigabit (4 pairs).
  * *Takeaway:* Dedicated TX (Transmit) and RX (Receive) lanes allow simultaneous two-way talk without collisions (Full-Duplex).
* **Concept 1.3: The Physical NIC Chip & Permanent MAC Address**
  * *Physical Dilemma:* How does the receiver know who is talking? The manufacturer burns a 48-bit serial number into silicon (IEEE OUI).
  * *Takeaway:* MAC is the permanent hardware serial number (Layer 2).
* **Concept 1.4: The Ethernet II Packaging Envelope & CRC Checksum**
  * *Physical Dilemma:* How does the receiver know if a bit got flipped by interference?
  * *Takeaway:* The outer frame wraps payload with `Destination MAC`, `Source MAC`, and `FCS / CRC-32` checksum.
* **💻 Workplace Lab (Ticket #101):** Verify physical link carrier and MAC address on a newly deployed workstation.
  * *Windows:* `ipconfig /all` (locate "Physical Address" line).
  * *Linux:* `ip link show` / `ethtool eth0` (verify link carrier state).

---

#### **Module 02: Expanding the Room — The Shared Wire & Collisions**
* **Concept 2.1: The Multi-Node Dilemma (Enter the Hub)**
  * *Physical Dilemma:* 3 computers need to talk. A dumb electrical repeater (Hub) connects them by repeating signals out all ports.
  * *Takeaway:* A Hub is a dumb Layer 1 electrical repeater with zero memory or intelligence.
* **Concept 2.2: Electrical Collisions & Half-Duplex Bottlenecks**
  * *Physical Dilemma:* Two computers talk at the same millisecond. Constructive voltage addition (+2V + +2V = +4V) corrupts the data.
  * *Takeaway:* Shared copper creates a single Collision Domain where only one device can transmit at a time (Half-Duplex).
* **Concept 2.3: CSMA/CD & Exponential Backoff**
  * *Physical Dilemma:* How do computers recover when a collision occurs?
  * *Takeaway:* Carrier Sense Multiple Access with Collision Detection sends a jam signal and initiates a random microsecond backoff timer.
* **💻 Workplace Lab (Ticket #102):** Diagnose high collision rates on a legacy hub port; verify full-duplex auto-negotiation.
  * *Cisco:* `show interfaces status` / `show controllers`.
  * *Linux:* `ethtool -S eth0` (grep `collision_errors`).

---

#### **Module 03: The Intelligent Switch & Dynamic MAC Learning**
* **Concept 3.1: The Switch Clean Slate**
  * *Physical Dilemma:* We replace the hub with a switch. The switch powers on with an empty MAC Address Table.
  * *Takeaway:* Switches work out of the box with zero static configuration through self-learning.
* **Concept 3.2: Learning by Listening (Source MAC Ingress)**
  * *Physical Dilemma:* How does the switch learn where computers are plugged in?
  * *Takeaway:* The switch ONLY learns by inspecting the **Source MAC** of incoming frames on each physical port.
* **Concept 3.3: Unicast Forwarding vs Unknown Flooding**
  * *Physical Dilemma:* What happens if the switch doesn't know where the destination is?
  * *Takeaway:* It floods all ports once. As soon as the target replies, it switches to direct unicast forwarding.
* **Concept 3.4: Table Aging & Dynamic Eviction**
  * *Physical Dilemma:* What happens when a user unplugs their laptop and moves to another desk?
  * *Takeaway:* MAC entries age out after 300 seconds of silence, but update instantly upon new ingress.
* **💻 Workplace Lab (Ticket #103):** Locate an unauthorized rogue laptop by matching its MAC address to a physical switch port.
  * *Cisco:* `show mac address-table dynamic`.
  * *Linux:* `bridge fdb show`.

---

### 🌐 MILESTONE 2: Logical Addressing & Network Boundaries
*Theme: Why MAC addresses fail at scale, how IP works, and how ARP bridges them.*

#### **Module 04: Why MACs Can't Route — Enter IPv4**
* **Concept 4.1: The 100,000-Device Scaling Crisis**
  * *Physical Dilemma:* Why connecting cities with switches crashes: switch tables overflow, and broadcast storms overwhelm every CPU.
  * *Takeaway:* Flat MAC addresses have zero hierarchy or geography.
* **Concept 4.2: Hardware Identity vs Software Identity**
  * *Physical Dilemma:* MAC is burned into hardware (Layer 2); IP is assigned in operating system memory (Layer 3).
  * *Takeaway:* Separation of concerns: MAC delivers across local wires; IP routes globally.
* **Concept 4.3: The Hierarchical Structure of IPv4**
  * *Physical Dilemma:* 32 bits = 4 octets (0–255). Why an octet cannot exceed 255 ($2^8 = 256$).
  * *Takeaway:* IPv4 divides into Network ID (Street Name) and Host ID (House Number).
* **💻 Workplace Lab (Ticket #104):** Resolve a static IP address conflict between two office printers.
  * *Windows:* `netsh interface ip show config`.
  * *Linux:* `ip -4 addr show`.

---

#### **Module 05: The Subnet Mask & Network Boundaries**
* **Concept 5.1: The "Street & House" Decimal Analogy**
  * *Physical Dilemma:* How does Computer A know if Computer B is in the same room or across the internet?
  * *Takeaway:* Every `255` in the mask means "Must Match (Street)"; `0` means "Personal Host Number".
* **Concept 5.2: The Subnet Mask in 32-Bit Binary**
  * *Physical Dilemma:* The Contiguity Rule: a mask MUST be continuous 1s followed by continuous 0s.
  * *Takeaway:* `255.255.255.0` is 24 ones followed by 8 zeros.
* **Concept 5.3: The Computer's Decision Engine (Bitwise AND)**
  * *Physical Dilemma:* Computer A applies its *own* subnet mask to the destination IP.
  * *Takeaway:* If `(Dest IP & Local Mask) === Local Network ID`, destination is local; else, remote.
* **Concept 5.4: Prefix Slash Notation (CIDR `/24`, `/16`, `/8`) & The Minus-2 Rule**
  * *Physical Dilemma:* Why `/24` allows 254 hosts instead of 256.
  * *Takeaway:* Network Address (`.0`) and Broadcast Address (`.255`) are reserved ($2^H - 2$).
* **💻 Workplace Lab (Ticket #105):** Fix a communication failure where one computer was given mask `/24` and its peer `/16`.
  * *Windows:* `ipconfig` & calculate subnet boundaries.
  * *Linux:* `ip calc` / `ip route show table local`.

---

#### **Module 06: The Local Handshake — The ARP Protocol**
* **Concept 6.1: The IP-to-MAC Disconnect**
  * *Physical Dilemma:* Software knows Bob's IP, but the copper wire and switch ONLY deliver to physical MAC addresses!
  * *Takeaway:* The operating system must translate Layer 3 IP into Layer 2 MAC before transmitting.
* **Concept 6.2: The ARP Request (Broadcast) & Reply (Unicast)**
  * *Physical Dilemma:* Computer A broadcasts `FF:FF:FF:FF:FF:FF`: *"Who has 192.168.1.50?"* Bob replies directly with his MAC.
  * *Takeaway:* ARP is strictly confined to the local broadcast domain (routers do not forward it).
* **Concept 6.3: The ARP Cache & Poisoning Vulnerability**
  * *Physical Dilemma:* Storing learned MACs in memory so the PC doesn't broadcast for every single packet.
  * *Takeaway:* ARP has zero authentication; poisoned ARP caches cause man-in-the-middle attacks.
* **💻 Workplace Lab (Ticket #106):** Clear a corrupted ARP cache preventing an executive's laptop from reaching the gateway.
  * *Windows:* `arp -a` (view) & `arp -d *` (flush).
  * *Linux:* `ip neigh show` & `ip neigh flush all`.

---

#### **Module 07: Modern Addressing — IPv6 & Neighbor Discovery (NDP)**
* **Concept 7.1: The IPv4 Exhaustion Reality**
  * *Physical Dilemma:* 4.3 billion addresses ran out. How 128-bit hexadecimal addressing solves exhaustion forever.
  * *Takeaway:* IPv6 eliminates the need for NAT and restores end-to-end connectivity.
* **Concept 7.2: IPv6 Address Structure & Zero Compression**
  * *Physical Dilemma:* Why `::` can only be used once per address.
  * *Takeaway:* Double colon replaces one contiguous block of zeros.
* **Concept 7.3: Killing Broadcast: Neighbor Discovery Protocol (NDP)**
  * *Physical Dilemma:* Why IPv6 abolished ARP broadcasts entirely.
  * *Takeaway:* Solicited-Node Multicast and Router Advertisements (SLAAC) replace broadcast noise.
* **💻 Workplace Lab (Ticket #107):** Inspect IPv6 Link-Local (`fe80::/10`) addresses and ping the gateway via IPv6.
  * *Windows:* `ping -6 fe80::1%eth0`.
  * *Linux:* `ip -6 addr show` / `ndisc6`.

---

### 🚪 MILESTONE 3: Crossing Network Boundaries (Internetwork Routing)
*Theme: Route packets across network boundaries and the public internet.*

#### **Module 08: The Default Gateway & Hop-by-Hop L2 Rewrite**
* **Concept 8.1: The "Leaving the Building" Dilemma**
  * *Physical Dilemma:* Destination is `8.8.8.8` (remote). Subnet mask says not local. Who takes the parcel?
  * *Takeaway:* Without a Default Gateway, remote communication fails before leaving the computer.
* **Concept 8.2: The Gateway as the Physical Door**
  * *Physical Dilemma:* The router has two NICs: one on the local LAN, one on the outside WAN.
  * *Takeaway:* The Default Gateway IP MUST reside on the host's local subnet.
* **Concept 8.3: The Hop-by-Hop Layer 2 Rewrite (The Golden Rule)**
  * *Physical Dilemma:* Does the destination IP change at each router?
  * *Takeaway:* **IP addresses stay constant from source to destination; MAC addresses change at EVERY SINGLE HOP.**
* **💻 Workplace Lab (Ticket #108):** Restore internet reachability to an accounting server that lost its default gateway route.
  * *Windows:* `route print` / `route add`.
  * *Linux:* `ip route show default` / `ip route add default via 192.168.1.1`.

---

#### **Module 09: The Router's Brain — Routing Tables & Loop Prevention (TTL)**
* **Concept 9.1: Longest Prefix Match**
  * *Physical Dilemma:* Packet matches both `/8` and `/24`. Which path wins?
  * *Takeaway:* The router always forwards out the interface matching the longest (most specific) prefix.
* **Concept 9.2: The Default Route (`0.0.0.0/0`)**
  * *Physical Dilemma:* What happens when no specific company route matches?
  * *Takeaway:* The gateway of last resort handles all unlisted internet traffic.
* **Concept 9.3: Loop Prevention via Time-To-Live (TTL)**
  * *Physical Dilemma:* What happens if two misconfigured routers bounce packets back and forth?
  * *Takeaway:* TTL decrements by 1 at every router hop. When it hits 0, the packet is discarded (ICMP Time Exceeded).
* **💻 Workplace Lab (Ticket #109):** Trace multi-hop network paths and observe TTL values using traceroute.
  * *Windows:* `tracert -d 8.8.8.8`.
  * *Linux:* `traceroute -n 8.8.8.8`.

---

#### **Module 10: Private vs Public IP Space — NAT & PAT**
* **Concept 10.1: RFC 1918 Private Ranges**
  * *Physical Dilemma:* `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`. Why internet routers drop them.
  * *Takeaway:* Private IPs can be reused in millions of homes because they never route on public backbones.
* **Concept 10.2: Port Address Translation (PAT / NAT Overload)**
  * *Physical Dilemma:* How 500 office computers share ONE public IP.
  * *Takeaway:* Router swaps private source IP/port with public IP/ephemeral port and tracks it in its state table.
* **Concept 10.3: Inbound Port Forwarding (DNAT)**
  * *Physical Dilemma:* Why external users cannot connect to internal servers behind NAT.
  * *Takeaway:* Static port forwarding maps a public port to an internal private IP/port.
* **💻 Workplace Lab (Ticket #110):** Inspect active NAT translations on an edge router; verify port forwarding for a DMZ web server.
  * *Cisco:* `show ip nat translations`.
  * *Linux:* `iptables -t nat -L -v -n`.

---

### ⚡ MILESTONE 4: Automated Infrastructure Services
*Theme: Automate network configuration and domain name resolution.*

#### **Module 11: Dynamic IP Allocation — DHCP**
* **Concept 11.1: The Zero-Knowledge Client Problem**
  * *Physical Dilemma:* A new laptop boots with no IP. How does it transmit?
  * *Takeaway:* Broadcasts from `0.0.0.0:68` to `255.255.255.255:67`.
* **Concept 11.2: The 4-Step DORA Handshake**
  * *Physical Dilemma:* Discover ➔ Offer ➔ Request ➔ Acknowledge.
  * *Takeaway:* Why Request is broadcast (so other offering servers can release their holds).
* **Concept 11.3: Lease Renewal Timers (T1, T2) & APIPA (`169.254.x.x`)**
  * *Physical Dilemma:* What happens when the DHCP server dies?
  * *Takeaway:* APIPA proves Layer 1/2 works, but Layer 3 DHCP failed.
* **💻 Workplace Lab (Ticket #111):** Release an exhausted DHCP pool lease and recover a computer stuck on APIPA (`169.254.21.4`).
  * *Windows:* `ipconfig /release` && `ipconfig /renew`.
  * *Linux:* `dhclient -r` && `dhclient -v`.

---

#### **Module 12: The Internet's Phonebook — Hierarchical DNS**
* **Concept 12.1: Human Names to Computer Numbers**
  * *Physical Dilemma:* Humans cannot memorize 32-bit/128-bit numbers.
  * *Takeaway:* DNS resolves alphanumeric strings to IP addresses.
* **Concept 12.2: The Global DNS Tree Hierarchy**
  * *Physical Dilemma:* Root (`.`) ➔ TLD (`.com`) ➔ Authoritative nameserver.
  * *Takeaway:* DNS resolution is distributed and hierarchical, never centralized on one server.
* **Concept 12.3: Record Types (A, AAAA, CNAME, MX, TXT)**
  * *Physical Dilemma:* A (IPv4), AAAA (IPv6), CNAME (Domain Alias), MX (Mail server).
  * *Takeaway:* CNAMEs can only point to names, never to raw IP addresses.
* **Concept 12.4: Recursive Resolvers vs Local Cache TTL**
  * *Physical Dilemma:* Why website changes don't show up immediately on local machines.
  * *Takeaway:* TTL controls how long resolvers cache records before querying authoritative servers.
* **💻 Workplace Lab (Ticket #112):** Query authoritative nameservers directly and flush corrupted workstation DNS caches.
  * *Windows:* `nslookup api.click.dev 8.8.8.8` & `ipconfig /flushdns`.
  * *Linux:* `dig @1.1.1.1 api.click.dev +trace`.

---

### 📦 MILESTONE 5: Applications, Transport & Security
*Theme: Multiplex applications, guarantee data integrity, and encrypt communication.*

#### **Module 13: Multiplexing Applications — Ports & Sockets**
* **Concept 13.1: The Single IP Multi-App Dilemma**
  * *Physical Dilemma:* 10 applications running on 1 computer. How does the OS deliver incoming packets?
  * *Takeaway:* Operating system demultiplexes packets using Layer 4 port numbers.
* **Concept 13.2: 16-Bit Port Numbers (0–65535)**
  * *Physical Dilemma:* Well-Known (1–1023), Registered (1024–49151), Ephemeral (49152–65535).
  * *Takeaway:* Server listens on well-known ports; client OS assigns random high ephemeral ports.
* **Concept 13.3: The 5-Tuple Socket Binding**
  * *Physical Dilemma:* How multiple browser tabs open to the same website simultaneously.
  * *Takeaway:* Unique 5-tuple: `(Src IP, Src Port, Dst IP, Dst Port, Protocol)`.
* **💻 Workplace Lab (Ticket #113):** Hunt down a rogue process consuming port 8080 and examine listening network sockets.
  * *Windows:* `netstat -ano | findstr :8080`.
  * *Linux:* `ss -tulpn | grep 8080`.

---

#### **Module 14: Transport Reliability — TCP vs UDP**
* **Concept 14.1: The Reliability Dilemma: Speed vs Guarantee**
  * *Physical Dilemma:* Dropping a video pixel (UDP) vs dropping a bank wire transfer digit (TCP).
  * *Takeaway:* UDP is lightweight and connectionless; TCP is connection-oriented and reliable.
* **Concept 14.2: The TCP 3-Way Handshake**
  * *Physical Dilemma:* SYN ➔ SYN-ACK ➔ ACK.
  * *Takeaway:* Both sides must synchronize and acknowledge sequence numbers before sending payload.
* **Concept 14.3: Sequence Numbers & Cumulative ACKs**
  * *Physical Dilemma:* What happens when packets arrive out of order or get dropped?
  * *Takeaway:* TCP numbers bytes and retransmits missing segments automatically.
* **Concept 14.4: Connection Teardown & `TIME_WAIT`**
  * *Physical Dilemma:* Why sockets stay in `TIME_WAIT` for 2 minutes.
  * *Takeaway:* Ensures delayed duplicate packets drain from the network before port reuse.
* **💻 Workplace Lab (Ticket #114):** Diagnose packet drops, TCP retransmissions, and identify connection leaks.
  * *Windows:* `netstat -s`.
  * *Linux:* `ss -s`.

---

#### **Module 15: Modern Web Security — TLS 1.3 Cryptography**
* **Concept 15.1: Cleartext Eavesdropping Danger**
  * *Physical Dilemma:* Packet sniffers on unencrypted HTTP (Port 80) read passwords in plaintext.
  * *Takeaway:* Routers need IP/TCP headers, but payload must be encrypted.
* **Concept 15.2: Public Key Cryptography & Certificate Chains**
  * *Physical Dilemma:* How does the browser know the server isn't an impostor?
  * *Takeaway:* Pre-installed Certificate Authorities (CAs) cryptographically sign server identity.
* **Concept 15.3: The TLS 1.3 1-RTT Handshake**
  * *Physical Dilemma:* Ephemeral Diffie-Hellman key exchange.
  * *Takeaway:* Perfect Forward Secrecy prevents retrospective decryption if server private key is leaked.
* **💻 Workplace Lab (Ticket #115):** Inspect SSL/TLS certificate chains, verify expiration dates, and test cipher suites.
  * *Terminal:* `openssl s_client -connect api.click.dev:443 -servername api.click.dev`.

---

### 🏢 MILESTONE 6: Enterprise Segmentation & Resilience
*Theme: Isolate departments, block threats, and eliminate network-killing broadcast loops.*

#### **Module 16: Enterprise Segmentation — VLANs & 802.1Q**
* **Concept 16.1: The Flat Network Security Crisis**
  * *Physical Dilemma:* 500 computers on one switch. Guest Wi-Fi users snoop on accounting payroll servers.
  * *Takeaway:* Flat switches offer zero security; hardware isolation is required at Layer 2.
* **Concept 16.2: Virtual LANs (VLANs) & Access Ports**
  * *Physical Dilemma:* Slicing one physical switch into isolated broadcast domains.
  * *Takeaway:* Access ports strip/add VLAN IDs; end devices never see VLAN tags.
* **Concept 16.3: 802.1Q Tagged Frames & Trunk Links**
  * *Physical Dilemma:* Carrying multiple VLANs across a single cable between switches.
  * *Takeaway:* 4-byte 802.1Q header tag carries the 12-bit VLAN ID (`1–4094`).
* **💻 Workplace Lab (Ticket #116):** Configure access ports for Accounting (VLAN 10) and verify trunk links.
  * *Cisco:* `show vlan brief` & `show interfaces trunk`.

---

#### **Module 17: Perimeter Defense — Firewalls & Access Control Lists (ACLs)**
* **Concept 17.1: Inter-VLAN Routing Vulnerability**
  * *Physical Dilemma:* Routers route between VLANs by default, re-opening access.
  * *Takeaway:* Security boundaries require explicit firewall rule inspection.
* **Concept 17.2: Stateless 5-Tuple ACLs**
  * *Physical Dilemma:* Matching Permit/Deny top-down without memory breaks return web browsing.
  * *Takeaway:* Stateless ACLs require explicit reverse rules for incoming responses.
* **Concept 17.3: Stateful Firewalls & Connection Tracking (conntrack)**
  * *Physical Dilemma:* How firewalls dynamically permit return packets while blocking inbound probes.
  * *Takeaway:* The state table tracks outbound sessions and auto-permits replies.
* **💻 Workplace Lab (Ticket #117):** Write firewall rules blocking the Guest subnet from reaching internal database servers.
  * *Linux:* `ufw status` / `iptables -A FORWARD -s 192.168.20.0/24 -d 192.168.10.0/24 -j DROP`.
  * *Cisco:* `access-list 101 deny ip 192.168.20.0 0.0.0.255 192.168.10.0 0.0.0.255`.

---

#### **Module 18: Loop Elimination — Spanning Tree Protocol (STP)**
* **Concept 18.1: The Redundant Cable Disaster**
  * *Physical Dilemma:* A tech plugs in a backup cable between switches to prevent downtime.
  * *Takeaway:* Layer 2 Ethernet frames have NO TTL field and will circulate forever.
* **Concept 18.2: Broadcast Storms & MAC Table Flapping**
  * *Physical Dilemma:* Frames circulate a million times a second, locking switch ports and crashing the network.
  * *Takeaway:* Loops cause catastrophic failure within seconds.
* **Concept 18.3: Spanning Tree Protocol (IEEE 802.1D / RSTP)**
  * *Physical Dilemma:* How switches prevent loops without unplugging cables.
  * *Takeaway:* Switches elect a Root Bridge and put redundant links in `BLOCKING` state until failure.
* **💻 Workplace Lab (Ticket #118):** Identify the Root Bridge and find which redundant port is in `BLOCKING` vs `FORWARDING` mode.
  * *Cisco:* `show spanning-tree`.

---

### 🏆 CAPSTONE: Module 19 — The Enterprise NOC Triage
*Theme: Prove full job-readiness by solving a real-world multi-tier network breakdown.*

#### **Module 19: The 5-Layer Office Outage Triage (Final Exam)**
* **Scenario:** Acme Corp Monday morning. Office network is completely down.
* **The 5-Layer Triage Flow:**
  1. **Concept 19.1:** *Layer 1 Check:* Diagnose unseated cable on switch port 12 (`NO CARRIER`).
  2. **Concept 19.2:** *Layer 2 Check:* Fix half-duplex mismatch and verify STP forwarding state.
  3. **Concept 19.3:** *Layer 3 Check:* Resolve duplicate IP conflict on Default Gateway interface.
  4. **Concept 19.4:** *Service Check:* Release exhausted DHCP pool and recover workstation from APIPA (`169.254.x.x`).
  5. **Concept 19.5:** *Resolution Check:* Fix misconfigured DNS server IP and flush local resolver cache.
* **💻 Workplace Lab (Graduation Challenge):** Full multi-node enterprise topology troubleshooting with zero hand-holding.
