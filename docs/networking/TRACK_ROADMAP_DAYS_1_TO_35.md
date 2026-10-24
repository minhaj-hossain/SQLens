# SQLens Networking Track — 35-Day Curriculum Master Roadmap

This document outlines the entire 35-day roadmap for the SQLens Networking Track, organized by pedagogical stages.

---

## Stage 1: The Local Network (Days 1–3) · *Direct Link, Switches, Subnets*
*Goal*: Understand physical connectivity, hardware MAC identity, local broadcast domains, and IP splitting on a single physical site.

* **Day 1 · The First Link & Hardware Identity** (`net-01`) [LIVE]
  * *Concepts*: The Ethernet cable, link status, IP address (network/host), MAC address (permanent hardware name tag), ping round-trip probe.
  * *Canvas*: PC1 ↔ Direct Cable ↔ PC2 (`840x380`).
* **Day 2 · Local Switches & ARP: Speaking to Neighbors** (`net-02`) [LIVE]
  * *Concepts*: Central switch, physical ports, MAC address learning table, broadcast roll-call address (`.255`), ARP table (`arp -a`).
  * *Canvas*: 4 PCs around a Central Switch (`960x460`).
* **Day 3 · Subnetting: Splitting a Network** (`net-03`) [LIVE]
  * *Concepts*: Binary bits, subnet mask (`255.255.255.0` vs `/26`), CIDR notation, separating departments into distinct broadcast domains.
  * *Canvas*: Subnet 1 (`192.168.1.0/26`) and Subnet 2 (`192.168.1.64/26`) (`1020x480`).

---

## Stage 2: Routing & Distant Subnets (Days 4–6) · *Connecting Networks Together*
*Goal*: Move packets between isolated broadcast domains using Layer 3 routers and routing tables.

* **Day 4 · The Router: Connecting Isolated Networks** (`net-04`) [LIVE]
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
* **Day 8 · How a Switch Learns: The MAC Address Table** (`net-08`) [PLANNED - See [DAY_08_DETAILED_SPEC.md](./DAY_08_DETAILED_SPEC.md)]
  * *Concepts*: Source MAC learning on frame ingress, port mapping tables, flooding unknown unicasts, selective point-to-point forwarding once learned, MAC aging timers.
* **Day 9 · Broadcast Domains** (`net-09`) [PLANNED]
  * *Concepts*: Why switches flood broadcasts; where broadcast domains end (at the router interface); broadcast traffic isolation.

---

## Stage 4: Name Resolution & Diagnostics (Days 11–15) · *DNS & Network Tools*
*Goal*: Translate human names to IP addresses and diagnose packet loss.

* **Day 11 · DNS: Names to Numbers** (`net-11`) [PLANNED]
  * *Concepts*: `/etc/hosts` file limitations; DNS client resolver; A records; DNS query UDP port 53; caching lookups.
* **Day 12 · Hierarchical DNS: Root, TLD, and Authoritative** (`net-12`) [PLANNED]
  * *Concepts*: Recursive vs iterative DNS lookups; root servers (`.`), TLD servers (`.com`), authoritative nameservers; TTL expiration.
* **Day 13 · NAT: Private Addresses on the Public Internet** (`net-13`) [PLANNED]
  * *Concepts*: IPv4 exhaustion; RFC 1918 private spaces; Network Address Translation (NAT / PAT); translation mapping tables.
* **Day 14 · ICMP & Deconstructing Ping** (`net-14`) [PLANNED]
  * *Concepts*: ICMP protocol; Type 8 (Echo Request) and Type 0 (Echo Reply); Time To Live (TTL) field; TTL expired in transit.
* **Day 15 · Traceroute: Mapping the Internet Hop by Hop** (`net-15`) [PLANNED]
  * *Concepts*: Incrementing TTL (TTL=1, TTL=2, TTL=3); receiving ICMP TTL Exceeded from intermediate routers to map physical hops.

---

## Stage 5: Transport Layer & Reliability (Days 16–22) · *Ports, TCP & UDP*
*Goal*: Demultiplex applications and guarantee ordered, loss-free data delivery.

* **Day 16 · Ports & Sockets: Which App Gets the Packet?** (`net-16`)
* **Day 17 · TCP Three-Way Handshake: SYN, SYN-ACK, ACK** (`net-17`)
* **Day 18 · TCP Sequence Numbers & Ordered Delivery** (`net-18`)
* **Day 19 · Packet Loss & TCP Retransmission** (`net-19`)
* **Day 20 · Flow Control & TCP Sliding Window** (`net-20`)
* **Day 21 · UDP: Fast, Unreliable, Real-Time Streams** (`net-21`)
* **Day 22 · TCP vs UDP: Choosing the Right Transport** (`net-22`)

---

## Stage 6: Application Layer & Security (Days 23–29) · *HTTP, TLS & Firewalls*
*Goal*: Inspect web application protocols, cryptographic tunnels, and packet filters.

* **Day 23 · HTTP on the Wire: GET, POST, Headers, and Statuses** (`net-23`)
* **Day 24 · TLS Handshake: Encryption & Certificates** (`net-24`)
* **Day 25 · HTTPS in Action: Encrypted Payloads** (`net-25`)
* **Day 26 · Stateless Packet Filtering: Access Control Lists (ACLs)** (`net-26`)
* **Day 27 · Stateful Firewalls: Tracking Connection States (NEW, ESTABLISHED)** (`net-27`)
* **Day 28 · Port Forwarding: Exposing Internal Services Through NAT** (`net-28`)
* **Day 29 · Reverse Proxies & Load Balancers** (`net-29`)

---

## Stage 7: Advanced Architectures & Modern Operations (Days 30–35) · *BGP, IPv6 & Cloud*
*Goal*: Understand global internet routing, next-generation addressing, and zero-trust cloud architectures.

* **Day 30 · Dynamic Routing: OSPF & Shortest Path First** (`net-30`)
* **Day 31 · BGP: How the Global Internet Routes Traffic** (`net-31`)
* **Day 32 · IPv6: 128-Bit Addressing & Neighbor Discovery (NDP)** (`net-32`)
* **Day 33 · VPNs & WireGuard: Encrypted Virtual Overlays** (`net-33`)
* **Day 34 · Cloud VPCs & Subnets: AWS / GCP Virtual Private Clouds** (`net-34`)
* **Day 35 · Capstone: Designing & Troubleshooting a Multi-Region Infrastructure** (`net-35`)
