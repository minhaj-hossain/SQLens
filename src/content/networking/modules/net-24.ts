import { NetworkingModule } from '@/types/networking';

export const NET_24_MODULE: NetworkingModule = {
  id: 'net-24',
  dayNumber: 24,
  title: 'Day 24 · DHCP: Automatic Addressing',
  shortTitle: 'DHCP: Automatic Addressing',
  steps: [
    {
      group: 'Idea 1 of 4 · Unconfigured bootstrap & UDP 67/68',
      chg: 'Since Day 23: Stage 6 automated router-to-router reachability with OSPF and BFD. Now in Stage 7 (Services), we automate how client workstations receive their own IPv4 configuration.',
      title: 'How a host with 0.0.0.0 bootstraps over UDP ports 68 and 67',
      what: `In Days 3–8, you manually typed IP addresses, subnet masks, and default gateways on every workstation. In an enterprise with thousands of laptops and phones, manual addressing causes IP conflicts and administrative collapse.

When a brand-new workstation (PC1) powers on, its Ethernet interface (eth0) has a burned-in MAC address (aa:bb:cc:00:24:01) but no IPv4 address (0.0.0.0), no subnet mask, and no default gateway.

Because PC1 does not yet know the DHCP server's IP address, it bootstraps using two broadcast rules defined in RFC 2131:

• Layer 2 & Layer 3 Broadcast: PC1 sends frames to Ethernet broadcast ff:ff:ff:ff:ff:ff and IPv4 limited broadcast 255.255.255.255 (with source IP 0.0.0.0).
• UDP Ports 68 & 67: DHCP clients always listen on UDP port 68, and DHCP servers always listen on UDP port 67.

Let’s inspect PC1's unconfigured eth0 interface before DHCP runs.`,
      why: 'Establishes the exact Layer 2/3/4 bootstrap constraint (0.0.0.0:68 -> 255.255.255.255:67) before introducing DORA.',
      pic: 'PC1 (no IP / 0.0.0.0) connected via Switch SW1 to Router R1 (192.168.24.1) and DHCP Server (192.168.24.10).',
      task: "Inspect PC1's unconfigured interface before acquiring an IP using ip addr show.",
      cmd: 'ip addr show',
      read: [
        ['Bootstrap State', 'Interface is UP at Layer 1/2 (MAC), but has no IPv4 address (0.0.0.0)'],
        ['L2 / L3 Broadcast', 'Uses ff:ff:ff:ff:ff:ff and 255.255.255.255 to reach local DHCP servers'],
        ['UDP Ports', 'Client uses UDP port 68; Server listens on UDP port 67 (RFC 2131)'],
        ['Why Automate', 'Eliminates manual static IP typos and duplicate-address conflicts'],
      ],
      rem: 'An unconfigured host boots with 0.0.0.0 and broadcasts from UDP port 68 to UDP port 67 (255.255.255.255) to locate a DHCP server.',
    },
    {
      group: 'Idea 2 of 4 · The 4-packet DORA handshake',
      chg: "PC1's eth0 interface is UP with no IPv4 address. Now let's run the DHCP client to execute the 4-packet DORA handshake.",
      title: 'Discover, Offer, Request, Acknowledge (DORA)',
      what: `DHCP (RFC 2131) assigns an IPv4 configuration through a 4-packet exchange called DORA, tied together by a random 32-bit Transaction ID (xid) and PC1's MAC address (chaddr):

• 1. DHCPDISCOVER (PC1 → Broadcast): PC1 broadcasts 0.0.0.0:68 → 255.255.255.255:67 asking for an IPv4 lease on the local subnet.
• 2. DHCPOFFER (Server → PC1): The DHCP server (192.168.24.10) picks an unused IP from its pool (192.168.24.101/24) and replies with the proposed IP, subnet mask, gateway, DNS, and lease duration.
• 3. DHCPREQUEST (PC1 → Broadcast): PC1 broadcasts acceptance of 192.168.24.101 with Server Identifier (Option 54 = 192.168.24.10), informing any other DHCP servers on the LAN that their offers were declined.
• 4. DHCPACK (Server → PC1): The server commits (MAC → 192.168.24.101) to its lease table and sends final confirmation. PC1 performs a Gratuitous ARP check to verify no host already owns 192.168.24.101, then binds it to eth0.

Let’s run dhclient eth0 on PC1 to execute the DORA sequence.`,
      why: 'Gives the exact packet-level mechanics of all 4 DORA messages, including why DHCPREQUEST is broadcast (Option 54).',
      pic: '4-step DORA packet flow between PC1 and DHCP Server (192.168.24.10) across Switch SW1.',
      task: 'Run the DHCP client on PC1 to complete DORA and receive 192.168.24.101/24 using dhclient eth0.',
      cmd: 'dhclient eth0',
      read: [
        ['1. DISCOVER', 'Client broadcasts 0.0.0.0:68 → 255.255.255.255:67 with xid'],
        ['2. OFFER', 'Server proposes available IP (192.168.24.101/24) + options'],
        ['3. REQUEST', 'Client broadcasts acceptance with Option 54 (Server Identifier)'],
        ['4. ACK + DAD', 'Server commits lease; client verifies uniqueness via Gratuitous ARP'],
      ],
      rem: 'DORA (Discover, Offer, Request, Acknowledge) safely assigns 192.168.24.101/24 and confirms uniqueness before binding eth0.',
    },
    {
      group: 'Idea 3 of 4 · Address pools & DHCP options',
      chg: 'PC1 now holds 192.168.24.101/24—and notice it also learned its subnet mask, default gateway, and DNS server automatically.',
      title: 'Managing IP address pools, exclusions, and DHCP options',
      what: `A DHCP server does not hand out arbitrary addresses from a subnet. It manages a configured Address Pool with strict static exclusions and option payloads:

• Static Exclusions: Infrastructure devices—such as Router R1 (192.168.24.1) and the DHCP/DNS Server (192.168.24.10)—use fixed static IPs. The server excludes 192.168.24.1–192.168.24.99 so it never leases those IPs to clients.
• Dynamic Pool Range: Clients receive addresses from 192.168.24.100 – 192.168.24.200 (101 available leases).
• DHCP Options (RFC 2132): Alongside the IPv4 address, DHCPACK delivers essential network options:
  - Option 1  : Subnet Mask (255.255.255.0)
  - Option 3  : Default Gateway / Router (192.168.24.1)
  - Option 6  : DNS Server (192.168.24.10)
  - Option 51 : IP Address Lease Time (86400 seconds = 24 hours)

Let’s inspect the DHCP server's pool configuration and active MAC-to-IP bindings.`,
      why: 'Connects DHCP IP assignment to the full L3 configuration (mask, gateway, DNS) required for internet connectivity.',
      pic: 'DHCP Server (192.168.24.10) showing Pool 192.168.24.100–200, Exclusions .1–.99, and Options 1, 3, 6, 51.',
      task: "Inspect the DHCP server's address pool, exclusions, and active bindings using show dhcp pool.",
      cmd: 'show dhcp pool',
      read: [
        ['Exclusions', 'Static IPs (.1 gateway, .10 server) reserved outside the dynamic pool'],
        ['Dynamic Pool', '192.168.24.100–192.168.24.200 tracked by MAC-to-IP bindings'],
        ['Options 1 & 3', 'Option 1 = Subnet Mask (/24); Option 3 = Default Gateway (.1)'],
        ['Options 6 & 51', 'Option 6 = DNS Server (.10); Option 51 = Lease Time (86400s)'],
      ],
      rem: 'DHCP pools exclude static infrastructure IPs and deliver Subnet Mask (Opt 1), Gateway (Opt 3), DNS (Opt 6), and Lease Time (Opt 51) in one exchange.',
    },
    {
      group: 'Idea 4 of 4 · Lease timers (T1 renewal & T2 rebinding)',
      chg: 'Every DHCP address is granted for a finite lease time (86400s / 24h) rather than permanently. Why, and how does PC1 keep its IP without dropping active TCP connections?',
      title: 'Preventing pool exhaustion with T1 (50%) and T2 (87.5%) lease timers',
      what: `If DHCP leases were permanent, laptops that leave the network would exhaust the 192.168.24.100–200 pool. Finite leases reclaim unused IPs automatically, while two timers let active hosts renew seamlessly:

• T1 Renewal Timer (50% of Lease = 12h / 43200s): At 50% elapsed, PC1 enters RENEWING state and sends a unicast DHCPREQUEST directly to 192.168.24.10:67. If the server replies DHCPACK, the 24h clock resets with zero packet drop.
• T2 Rebinding Timer (87.5% of Lease = 21h / 75600s): If the original server is unreachable at T1 and stays silent until 87.5%, PC1 enters REBINDING state and broadcasts DHCPREQUEST (255.255.255.255:67) to any available DHCP server.
• 100% Expiry (24h / 86400s) & DHCPRELEASE: If no server responds before 100%, PC1 must unbind 192.168.24.101 and restart DORA. On clean shutdown, PC1 sends DHCPRELEASE so the server reclaims the IP immediately.

Let’s inspect PC1's active lease state and T1/T2 timer schedule.`,
      why: 'Explains the exact RFC 2131 renewal state machine (BOUND -> RENEWING (T1) -> REBINDING (T2) -> INIT) and unicast vs broadcast behavior.',
      pic: 'Lease timeline bar showing 0% BOUND, 50% T1 (Unicast Renew), 87.5% T2 (Broadcast Rebind), and 100% Expiry.',
      task: "Inspect PC1's active DHCP lease timers (T1 and T2) using show dhcp lease.",
      cmd: 'show dhcp lease',
      read: [
        ['T1 (50% = 12h)', 'Unicast DHCPREQUEST directly to original server (192.168.24.10)'],
        ['T2 (87.5% = 21h)', 'Broadcast DHCPREQUEST (255.255.255.255:67) to any DHCP server'],
        ['100% Expiry', 'Client drops IP (0.0.0.0) and restarts DORA from DHCPDISCOVER'],
        ['DHCPRELEASE', 'Clean shutdown message returning the IP to the pool immediately'],
      ],
      rem: 'DHCP leases renew via unicast at T1 (50%), rebind via broadcast at T2 (87.5%), and expire at 100% so disconnected hosts never exhaust the pool.',
    },
    {
      group: 'Recap',
      chg: 'Stage 7 · Day 24 Summary: DHCP Automatic Addressing.',
      title: 'DHCP (RFC 2131): DORA bootstrap, pools, options, and lease timers',
      what: `You have completed Day 24 and traced how DHCP (RFC 2131) automates IPv4 host configuration:

• Unconfigured Bootstrap: Hosts start at 0.0.0.0 and broadcast over UDP 68 → 67 (ff:ff:ff:ff:ff:ff / 255.255.255.255).
• DORA Handshake: DISCOVER → OFFER → REQUEST (Option 54) → ACK (+ Gratuitous ARP check).
• Pools & Options: Excludes static infrastructure IPs and delivers Subnet Mask (Opt 1), Gateway (Opt 3), DNS (Opt 6), and Lease Time (Opt 51).
• Lease Lifecycle: T1 (50%) unicast renewal, T2 (87.5%) broadcast rebinding, 100% expiry, and DHCPRELEASE.

In Day 25, we hit a crucial scaling question: since DHCP broadcasts stop at Router R1, how does one central DHCP server serve 20 different subnets?`,
      why: 'Consolidates Day 24 and directly motivates Day 25 (DHCP in Larger Networks / ip helper-address).',
      pic: 'Full LAN topology with PC1 bound to 192.168.24.101/24 and Day 25 DHCP Relay preview.',
      task: 'Review the Day 24 summary and proceed to Day 25 (DHCP in Larger Networks) when ready.',
      cmd: null,
      read: [
        ['Transport', 'UDP 68 (client) ↔ UDP 67 (server); 0.0.0.0 → 255.255.255.255'],
        ['DORA', 'DISCOVER → OFFER → REQUEST (Opt 54) → ACK + Gratuitous ARP'],
        ['Pool & Options', 'Excluded static IPs + Options 1 (Mask), 3 (GW), 6 (DNS), 51 (Lease)'],
        ['Timers', 'T1 50% (unicast renew), T2 87.5% (broadcast rebind), 100% expire'],
      ],
      rem: 'DHCP automates IPv4 addressing via DORA and lease timers on a local broadcast domain—setting up Day 25 DHCP Relay across routers.',
    },
  ],
  staticResponses: {
    'ip addr show': `2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 state UP
    link/ether aa:bb:cc:00:24:01 brd ff:ff:ff:ff:ff:ff
    (no IPv4 address assigned — bootstrap source IP: 0.0.0.0)
    (no default gateway | no DNS server configured)`,
    'dhclient eth0': `[DHCPv4 Client eth0 — RFC 2131 | xid=0x4a91c024]
  1. DHCPDISCOVER  0.0.0.0:68 -> 255.255.255.255:67  (MAC aa:bb:cc:00:24:01)
  2. DHCPOFFER     192.168.24.10:67 -> 192.168.24.101  (Pool offer, Lease 86400s)
  3. DHCPREQUEST   0.0.0.0:68 -> 255.255.255.255:67  (Option 54 ServerID=192.168.24.10)
  4. DHCPACK       192.168.24.10:67 -> 192.168.24.101  (Lease committed)
  [DAD] Gratuitous ARP for 192.168.24.101 -> 0 replies (address unique)

Bound to 192.168.24.101/24 | Gateway: 192.168.24.1 | DNS: 192.168.24.10 | Lease: 86400s`,
    'show dhcp pool': `DHCPv4 Server Pool Status — 192.168.24.10 (Subnet 192.168.24.0/24)
  Excluded Range : 192.168.24.1 - 192.168.24.99  (.1 Router R1, .10 DHCP/DNS)
  Dynamic Pool   : 192.168.24.100 - 192.168.24.200 (101 total | 1 leased | 100 free)

Configured DHCP Options (RFC 2132):
  Option  1 (Subnet Mask)     : 255.255.255.0
  Option  3 (Default Gateway) : 192.168.24.1
  Option  6 (DNS Server)      : 192.168.24.10
  Option 51 (Lease Time)      : 86400s (24h)

Active Bindings:
  IP Address       MAC Address        Hostname   State   Remaining
  192.168.24.101   aa:bb:cc:00:24:01  PC1        ACTIVE  23h 59m 54s`,
    'show dhcp lease': `DHCPv4 Client Lease — PC1 (eth0)
  Assigned IP    : 192.168.24.101/24
  DHCP Server    : 192.168.24.10 (UDP 67)
  State          : BOUND
  Lease Duration : 86400s (24h 00m 00s)

RFC 2131 Renewal Schedule:
  T1 (50.0% — Renewing)  : 43200s (12h) -> Unicast DHCPREQUEST to 192.168.24.10:67
  T2 (87.5% — Rebinding) : 75600s (21h) -> Broadcast DHCPREQUEST to 255.255.255.255:67
  Expiry (100%)          : 86400s (24h) -> Unbind IP & restart DHCPDISCOVER`,
  },
};
