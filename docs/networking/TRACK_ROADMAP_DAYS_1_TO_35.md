# SQLens Networking Track — 35-Day Curriculum Master Roadmap

This document outlines the entire 35-day roadmap for the SQLens Networking Track, organized by pedagogical stages.

---

## Stage 1: Foundations (Days 1–3) · *Physical Link, IP Addressing & Subnetting*
*Goal*: Understand physical connectivity, hardware MAC identity, network vs host IP portions, and splitting networks with CIDR masks.

* **Day 1 · The First Link & Hardware Identity** (`net-01`) [LIVE]
  * *Concepts*: The Ethernet cable, link status, IP address (network/host), MAC address (permanent hardware name tag), ping round-trip probe.
  * *Canvas*: PC1 ↔ Direct Cable ↔ PC2 (`840x380`).
* **Day 2 · IP Addressing: Networks and Hosts** (`net-02`) [LIVE]
  * *Concepts*: Network prefix vs host number; subnet mask (`255.255.255.0`); the broadcast address (`.255`); local communication without routing.
  * *Canvas*: 4 PCs around a Central Switch (`960x460`).
* **Day 3 · Subnetting: Splitting a Network** (`net-03`) [LIVE]
  * *Concepts*: Binary bits, subnet mask (`255.255.255.0` vs `/26`), CIDR notation, separating departments into distinct broadcast domains.
  * *Canvas*: Subnet 1 (`192.168.1.0/26`) and Subnet 2 (`192.168.1.64/26`) (`1020x480`).

---

## Stage 2: Routing (Days 4–6) · *Connecting Networks Together*
*Goal*: Move packets between isolated broadcast domains using Layer 3 routers and routing tables.

* **Day 4 · The Router: Connecting Networks** (`net-04`) [LIVE]
  * *Concepts*: What happens when a destination IP is outside your subnet; the Default Gateway; Router R1 with multiple port IPs (`192.168.1.1` and `192.168.2.1`).
  * *Canvas*: Subnet 1 ↔ Router R1 (Port 1 & Port 2) ↔ Subnet 2 (`1180x520`).
* **Day 5 · Static Routes: Reaching Distant Networks** (`net-05`) [LIVE]
  * *Concepts*: Multi-hop topologies; transit link (`10.0.0.0/30`); routing tables; next-hop IP; return route requirement (`r1 route add ...` and `r2 route add ...`).
  * *Canvas*: Subnet 1 ↔ Router R1 ↔ Transit Link ↔ Router R2 ↔ Subnet 3 (`1380x580`).
* **Day 6 · The Default Route: Leaving the Network** (`net-06`) [LIVE]
  * *Concepts*: Public vs private addresses; the internet boundary; default gateway of last resort (`0.0.0.0/0`); longest prefix match rule.
  * *Canvas*: Subnet 1 ↔ Router R1 ↔ Transit ↔ Router R2 ↔ Router ISP ↔ Web Server (`1480x640`).

---

## Stage 3: Local Delivery (Days 7–9) · *Hardware Discovery & Switching*
*Goal*: Understand how Layer 2 hardware delivery operates across switches using ARP, MAC learning, and broadcast boundaries.

* **Day 7 · ARP: Finding a Neighbour's Hardware Address** (`net-07`) [LIVE]
  * *Concepts*: How a computer that knows only an IP address discovers the MAC address; the broadcast question to `FF:FF:FF:FF:FF:FF`; direct unicast reply; ARP cache timeouts; asking for the Default Gateway's MAC when reaching distant networks.
  * *Canvas*: Local Subnet 1 (PC1, PC2, Switch SW1, ARP Cache Table) ↔ Router R1 ↔ Distant Subnet 3 (PC5) (`1180x540`).
* **Day 8 · How a Switch Learns: The MAC Address Table** (`net-08`) [LIVE]
  * *Concepts*: Source MAC learning on frame ingress, port mapping tables, flooding unknown unicasts, selective point-to-point forwarding once learned, MAC aging timers.
  * *Canvas*: Local Star Topology (PC1, PC2, PC3, PC4, Central Switch SW1, MAC Address Table HUD) (`1040x520`).
* **Day 9 · Broadcast Domains** (`net-09`) [NEXT UP]
  * *Concepts*: Why switches flood broadcasts (`FF:FF:FF:FF:FF:FF` / `.255`); the cost of network-wide CPU interrupts; where broadcast domains end (at the router interface); isolating broadcast storms between subnets.
  * *Canvas*: Subnet 1 (PC1-PC4, Switch SW1) ↔ Router R1 ↔ Subnet 2 (Switch SW2, PC5-PC6) with Broadcast Domain boundaries (`1180x540`).

---

## Stage 4: Switching Design (Days 10–13) · *VLANs, Trunks & Spanning Tree*
*Goal*: Segment switches logically and prevent Layer 2 loop storms.

* **Day 10 · VLANs: Separating Networks on One Switch** (`net-10`) [COMPLETED]
  * *Concepts*: Virtual Local Area Networks (VLAN 10, VLAN 20); splitting one physical switch into multiple isolated broadcast domains without buying new hardware.
* **Day 11 · Trunks: Carrying VLANs Between Switches** (`net-11`) [COMPLETED]
  * *Concepts*: Access ports vs trunk ports; IEEE 802.1Q VLAN tagging; carrying traffic from multiple VLANs over a single link.
* **Day 12 · Routing Between VLANs** (`net-12`) [COMPLETED]
  * *Concepts*: Inter-VLAN routing; Router-on-a-Stick (sub-interfaces `eth0.10`, `eth0.20`); moving packets between isolated VLANs.
* **Day 13 · Loops and Spanning Tree** (`net-13`) [COMPLETED]
  * *Concepts*: Redundant switch links; Layer 2 broadcast loops and broadcast storms; Spanning Tree Protocol (STP, 802.1D); blocking redundant ports to keep topology loop-free.

---

## Stage 5: Path and Transport (Days 14–19) · *Diagnostics, Ports & Reliability*
*Goal*: Trace hops, demultiplex applications, and guarantee ordered delivery.

* **Day 14 · ICMP and TTL: How Ping Works** (`net-14`) [COMPLETED]
  * *Concepts*: ICMP protocol; Type 8 (Echo Request) and Type 0 (Echo Reply); Time To Live (TTL) decrement at each router; TTL expired in transit.
* **Day 15 · Traceroute: Following the Path** (`net-15`) [COMPLETED]
  * *Concepts*: Incrementing TTL (1, 2, 3...); receiving ICMP Time Exceeded from intermediate routers to map physical hops.
* **Day 16 · Ports: Reaching the Right Program** (`net-16`) [COMPLETED]
  * *Concepts*: Layer 4 port numbers (0–65535); well-known ports (80, 443, 22, 53); sockets (IP:Port); demultiplexing multiple applications on a single machine.
* **Day 17 · TCP: Opening and Closing a Connection** (`net-17`) [COMPLETED]
  * *Concepts*: Connection-oriented transport; Three-Way Handshake (SYN, SYN-ACK, ACK); Four-Way Teardown (FIN, ACK, FIN, ACK); connection states.
* **Day 18 · TCP: Reliable Delivery** (`net-18`) [COMPLETED]
  * *Concepts*: Sequence numbers, cumulative acknowledgments (ACK numbers), lost segment detection, retransmission timers, and sliding window flow control.
* **Day 19 · UDP: Fast and Simple** (`net-19`) [COMPLETED]
  * *Concepts*: Connectionless transport; low overhead (8-byte header); lack of acknowledgments; real-time audio, video, DNS, and gaming use cases.

---

## Stage 6: Dynamic Routing (Days 20–23) · *Sharing the Map & Convergence*
*Goal*: Automate routing table creation across complex mesh networks.

* **Day 20 · Why Dynamic Routing** (`net-20`) [NEXT UP]
  * *Concepts*: Scalability limits of static routes; route failure recovery; interior vs exterior routing protocols (IGP vs EGP); autonomous systems (AS).
* **Day 21 · RIP: Counting Hops** (`net-21`) [PLANNED]
  * *Concepts*: Distance-vector routing; hop count metric; 15-hop limit; periodic routing updates and count-to-infinity problem.
* **Day 22 · OSPF: Sharing the Map** (`net-22`) [PLANNED]
  * *Concepts*: Link-state routing; Shortest Path First (Dijkstra SPF algorithm); link cost metric; Link State Advertisements (LSAs) and Area 0 backbone.
* **Day 23 · Failover and Convergence** (`net-23`) [PLANNED]
  * *Concepts*: Link failure detection; route recalculation time (convergence); redundant path failover in real-time.

---

## Stage 7: Services (Days 24–29) · *DHCP, DNS & Address Translation*
*Goal*: Automate device configuration, translate human names, and connect private subnets to the public internet.

* **Day 24 · DHCP: Automatic Addressing** (`net-24`) [PLANNED]
  * *Concepts*: Manual IP pain; DHCP four-step lease process (DORA: Discover, Offer, Request, Acknowledge); address pools and lease durations.
* **Day 25 · DHCP in Larger Networks** (`net-25`) [PLANNED]
  * *Concepts*: Why DHCP broadcasts cannot cross routers; DHCP Relay Agent (`ip helper-address`); forwarding unicast DHCP requests across subnets.
* **Day 26 · DNS: Names Instead of Numbers** (`net-26`) [PLANNED]
  * *Concepts*: `/etc/hosts` file history and limits; DNS resolver; A records; DNS query UDP port 53; caching lookups locally.
* **Day 27 · DNS in Depth: Records and the Hierarchy** (`net-27`) [PLANNED]
  * *Concepts*: Root servers (`.`), TLD servers (`.com`), Authoritative nameservers; record types (A, AAAA, CNAME, MX); TTL expiration and recursive lookups.
* **Day 28 · NAT: Private to Public** (`net-28`) [PLANNED]
  * *Concepts*: IPv4 exhaustion; RFC 1918 private IP ranges (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`); static and dynamic NAT translation.
* **Day 29 · NAT with Ports** (`net-29`) [PLANNED]
  * *Concepts*: Port Address Translation (PAT / NAT Overload); mapping thousands of internal private sockets to a single public IP via ephemeral port numbers.

---

## Stage 8: Security (Days 30–32) · *Firewalls & Port Security*
*Goal*: Control packet flow, enforce policy, and protect physical ports.

* **Day 30 · Access Lists: Filtering Traffic** (`net-30`) [PLANNED]
  * *Concepts*: Stateless packet filtering; standard vs extended ACLs; source/destination IP, port, and protocol matching; implicit deny all.
* **Day 31 · Stateful Firewalls** (`net-31`) [PLANNED]
  * *Concepts*: Limitations of stateless ACLs; connection state tracking (NEW, ESTABLISHED, RELATED); state tables; allowing return traffic automatically.
* **Day 32 · Securing the Switch** (`net-32`) [PLANNED]
  * *Concepts*: Switch security threats (MAC flooding attacks, ARP poisoning, rogue DHCP servers); Port Security (sticky MAC, violation modes: protect, restrict, shutdown).

---

## Stage 9: Wrap-up (Days 33–35) · *The Full Picture & Capstone*
*Goal*: Unify all layers into a mental model, master structured troubleshooting, and build a full production topology.

* **Day 33 · The Layered Model** (`net-33`) [PLANNED]
  * *Concepts*: OSI 7-Layer model and TCP/IP 4-Layer model; encapsulation and decapsulation (Data ➔ Segment ➔ Packet ➔ Frame ➔ Bits); header structures.
* **Day 34 · Troubleshooting Method** (`net-34`) [PLANNED]
  * *Concepts*: Structured diagnostic workflows; bottom-up (physical to app) vs top-down vs divide-and-conquer; using ping, traceroute, arp, and netstat systematically.
* **Day 35 · Capstone: Build a Network** (`net-35`) [PLANNED]
  * *Concepts*: Full infrastructure integration: subnets, VLANs, inter-VLAN routing, OSPF, DHCP relay, NAT overload, and ACLs. Comprehensive hands-on terminal challenge.

