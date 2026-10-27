# SQLens Networking Track — Day 15 Detailed Specification
## Stage 5: Transport Layer & Core Internet Protocols (Days 14–19)
### Module: `net-15` · Traceroute: Following the Path · Latency, Probes & Asymmetric Routing

---

## 1. Pedagogical Intent & Objectives

### Context & Learning Progression
- **Day 14**: Deconstructed ICMP (RFC 792), IPv4 TTL hop decrementing, and the basic mechanism of Traceroute (forcing ICMP Type 11 via TTL=1, 2, 3...).
- **Day 15 (This Module)**: Takes learners from the theoretical concept of Traceroute into how real-world engineers diagnose global internet paths:
  1. **Probe Anatomy**: Why Traceroute sends 3 probes per hop, and the difference between Linux UDP probes (ports 33434+) vs Windows ICMP Echo probes.
  2. **Latency & Physics**: Interpreting RTT jumps (speed of light in optical fiber: ~5 µs/km).
  3. **The `* * *` Phenomenon**: Why intermediate routers return timeouts (Control Plane Policing, ICMP rate limiting, firewalling) while still forwarding traffic.
  4. **Asymmetric Routing**: The fundamental law that the outbound path and return path across autonomous systems are independent.

### Key Pedagogical Constraints
- **Zero Analogies Policy**: Do not describe packets as "tourists on a road trip" or routers as "toll booths". Use exact digital reality: UDP datagrams, ICMP Type 11, RTT in milliseconds, Control Plane Policing (CoPP), transit AS links, and fiber propagation delay.
- **Taught Before Tested**:
  - Explicitly explain why 3 probes are sent before asking the user to analyze 3 RTT columns.
  - Explicitly explain Control Plane Policing (CoPP) and rate limiting before showing `* * *`.
  - Explicitly explain asymmetric routing before showing split outbound/inbound paths.
- **Task Hint Policy**: Omit `(tap it to fill the terminal).` and end task instructions with a period.

---

## 2. Module Identity & Metadata

```typescript
export const NET_15_MODULE: NetworkingModule = {
  id: 'net-15',
  dayNumber: 15,
  title: 'Day 15 · Traceroute: Following the Path Across the Internet',
  shortTitle: 'Traceroute: Following the Path',
  summary:
    'Master real-world internet path tracing: analyze 3-probe RTT telemetry, explain intermediate * * * timeouts caused by Control Plane Policing, and understand asymmetric routing.',
  objectives: [
    'Deconstruct the 3-probe per hop mechanism and compare Linux UDP probes to Windows ICMP probes',
    'Calculate fiber propagation latency and diagnose physical distance from RTT telemetry jumps',
    'Explain why intermediate routers return * * * timeouts without indicating network failure (CoPP and ICMP rate limiting)',
    'Uncover asymmetric routing: why return packets traverse different autonomous systems than outbound packets',
  ],
  // ... steps 1 through 5
};
```

---

## 3. Step-by-Step Curriculum Architecture

### Step 1: Idea 1 of 4 · The Three Probes per Hop
- **Group**: `Idea 1 of 4 · Probe anatomy`
- **Chg**: `Since Day 14: You learned that routers decrement the IPv4 TTL and return ICMP Type 11 when TTL reaches 0. Now, we investigate how Traceroute uses multiple probes per hop to measure latency and jitter.`
- **Title**: Why Traceroute sends three probes per hop
- **What**:
  ```text
  When you run a standard traceroute command, you notice that every hop outputs not one, but three round-trip time measurements:
  1  192.168.1.1  1.182 ms  1.145 ms  1.198 ms

  Why three?
  A single packet measurement is vulnerable to momentary queueing delays, Wi-Fi interference, or buffer bloat. By transmitting three sequential probe packets for each TTL value, Traceroute provides statistical insight:
  • Consistent times (e.g. 1.1ms, 1.2ms, 1.1ms): Stable, uncongested link.
  • Highly fluctuating times (e.g. 1.2ms, 48.5ms, 2.1ms): Jitter caused by queue buffer congestion.
  • One or two packet drops (e.g. 1.2ms, *, 1.4ms): Intermittent packet loss.

  Probing Protocols:
  • Linux / macOS `traceroute`: By default, transmits UDP datagrams to high, randomized destination ports (starting at 33434 and incrementing with each probe). When the final destination is reached, the target machine returns ICMP Type 3 Code 3 (Port Unreachable), signaling completion!
  • Windows `tracert`: By default, transmits standard ICMP Echo Requests (Type 8) with incremental TTLs.

  Let’s trace the multi-hop path from PC1 to our Web Server across our nationwide network.
  ```
- **Why**: Understanding probe anatomy prevents engineers from misinterpreting jitter as permanent hardware failure.
- **Pic**: `PC1 transmits 3 sequential probe packets with TTL=1, each receiving an ICMP Type 11 reply with individual RTT timestamps.`
- **Task**: `Run traceroute 198.51.100.10 to inspect the three probe timings across each hop.`
- **Cmd**: `traceroute 198.51.100.10`
- **Read**:
  - `['Probe Count', '3 probes transmitted per TTL value to measure latency variance']`
  - `['Hop 1 (LAN)', '192.168.1.1 · 1.182 ms  1.145 ms  1.198 ms (Local Gateway R1)']`
  - `['Hop 2 (Regional)', '10.0.0.2 · 8.412 ms  8.389 ms  8.405 ms (Denver Hub R2)']`
  - `['Hop 3 (Transcon)', '203.0.113.2 · 42.115 ms  42.088 ms  42.102 ms (New York R3)']`
  - `['Hop 4 (Destination)', '198.51.100.10 · 48.241 ms  48.196 ms  48.212 ms (Web Server)']`
- **Rem**: `Traceroute sends 3 probes per hop to measure latency consistency, jitter, and packet loss.`

---

### Step 2: Idea 2 of 4 · Physics, Distance, and RTT Jumps
- **Group**: `Idea 2 of 4 · Latency and physics`
- **Chg**: `Our traceroute completed across 4 hops. Notice the massive latency jump between Hop 2 (8.4 ms) and Hop 3 (42.1 ms). Let’s investigate the physical laws governing network speed.`
- **Title**: RTT jumps: Optical fiber and propagation delay
- **What**:
  ```text
  Network latency is not arbitrary; it is constrained by the speed of light.

  In a vacuum, light travels at 300,000 km/s. Inside silica glass optical fiber, light refracts through the core, slowing down to approximately 200,000 km/s (~5 microseconds per kilometer, or 1 millisecond per 200 km).

  Because traceroute measures Round-Trip Time (RTT)—the time to go and return—each 1 ms of RTT represents approximately 100 km of physical fiber distance:
  • LAN hop (same room): < 1 ms.
  • Regional link (SF to Denver, ~1,600 km): ~16 ms round-trip propagation + routing delay = ~8–10 ms.
  • Transcontinental link (Denver to NYC, ~2,800 km): ~28 ms propagation + serialization = ~34 ms jump (total ~42 ms).
  • Transatlantic submarine cable (NYC to London, ~5,600 km): ~56 ms jump (total ~75–80 ms).

  When you see a large, sudden RTT jump between two consecutive hops in a traceroute, you are observing physical geographic distance or transit through long-haul subsea/underground fiber.

  Let’s inspect the fiber link telemetry across our transit routers.
  ```
- **Why**: Understanding optical propagation prevents engineers from troubleshooting software configurations when high RTT is simply geographic distance.
- **Pic**: `Interactive fiber distance map linking SF Gateway R1, Denver Transit R2, NYC Backbone R3, and Frankfurt Server, displaying calculated propagation delay.`
- **Task**: `Inspect the physical link telemetry using show fiber links.`
- **Cmd**: `show fiber links`
- **Read**:
  - `['SF to Denver Link', '1,620 km single-mode fiber · 8.1 ms optical propagation delay']`
  - `['Denver to NYC Link', '2,850 km long-haul DWDM · 28.5 ms optical propagation delay']`
  - `['Physical Limit', '~5 microseconds per km (speed of light in silica glass optical fiber)']`
  - `['Rule of Thumb', 'Each 1 ms of round-trip time represents ~100 km of fiber distance']`
- **Rem**: `RTT jumps between traceroute hops reveal physical geographic distance governed by the speed of light in fiber (~5 µs/km).`

---

### Step 3: Idea 3 of 4 · The Mysterious `* * *` (Timeouts)
- **Group**: `Idea 3 of 4 · Control plane policing`
- **Chg**: `We now understand latency jumps. Now let’s tackle the single most misunderstood output in networking: three asterisks (* * *) on an intermediate hop.`
- **Title**: The * * * mystery: Control Plane Policing (CoPP)
- **What**:
  ```text
  Frequently, a traceroute output looks like this:
  2  10.0.0.2     8.412 ms  8.389 ms  8.405 ms
  3  * * *
  4  198.51.100.10  48.241 ms  48.196 ms  48.212 ms

  Beginners often panic and conclude: "Hop 3 is down! Packets are failing at Hop 3!"
  This conclusion is 100% false. If Hop 3 were down, Hop 4 could never have responded!

  Why did Hop 3 return `* * *`?
  Modern enterprise routers split their architecture into two distinct planes:
  1. Data Plane (Hardware ASICs): Forwards customer transit traffic at wire speed (terabits per second). It never touches the main router CPU.
  2. Control Plane (General CPU): Handles routing protocols (BGP, OSPF) and generates ICMP error messages (Type 11).

  To protect the router CPU from distributed denial-of-service (DDoS) attacks, network engineers configure Control Plane Policing (CoPP) and ICMP Rate Limiting. When traceroute sends probe packets, the router’s CPU may:
  • Drop the probe rather than generating an ICMP Type 11 message.
  • Firewall ICMP generation on that transit interface entirely.

  Crucial Rule: If hops AFTER the `* * *` respond successfully, the `* * *` is simply an intermediate router with ICMP generation disabled or rate-limited. It is NOT packet loss or network failure!

  Let’s observe this by running a trace across a router configured with ICMP Control Plane Policing.
  ```
- **Why**: Debunking the `* * *` myth is a rite of passage for network engineers, saving countless hours of false troubleshooting.
- **Pic**: `Router R3’s hardware ASIC forwards transit packets cleanly to Hop 4, but its Control Plane CoPP policer drops the ICMP Type 11 generation, resulting in * * *.`
- **Task**: `Run traceroute 198.51.100.50 through a firewalled transit router to witness CoPP rate limiting.`
- **Cmd**: `traceroute 198.51.100.50`
- **Read**:
  - `['Hop 3 Output', '* * * (Request timed out / ICMP rate limited)']`
  - `['Hop 4 Output', '198.51.100.50 · 48.1 ms (Destination reached successfully!)']`
  - `['Data Plane State', '100% forwarding throughput via hardware ASICs']`
  - `['Control Plane State', 'ICMP Type 11 generation suppressed by Control Plane Policing (CoPP)']`
- **Rem**: `An intermediate * * * is not packet loss if subsequent hops respond; it simply indicates that the router suppresses ICMP generation.`

---

### Step 4: Idea 4 of 4 · Asymmetric Routing
- **Group**: `Idea 4 of 4 · Asymmetric paths`
- **Chg**: `We know how routers report hops. Now, let’s discover the hidden paradox of internet routing: the return path rarely mirrors the outbound path.`
- **Title**: Asymmetric routing: The return path paradox
- **What**:
  ```text
  When you trace from your computer in San Francisco to a server in Frankfurt, you see the outbound path:
  PC1 → SF Gateway → Denver → NYC → Frankfurt Server.

  Many engineers assume the reply packet travels the exact same path in reverse:
  Frankfurt Server → NYC → Denver → SF Gateway → PC1.

  In the global internet, this assumption is frequently wrong!
  The internet is composed of over 100,000 independent Autonomous Systems (ASes) connected by Border Gateway Protocol (BGP). Every network operator makes their own routing policy and cost decisions:
  • Outbound traffic from your ISP might use Provider A (the lowest-cost transit provider across the continent).
  • Return traffic from the European server might use Provider B (a low-latency direct transoceanic peer).

  This phenomenon is called Asymmetric Routing.

  Crucial Architectural Consequence:
  Traceroute shows ONLY the outgoing path! The IP addresses listed in hops 1, 2, 3... are the incoming interfaces of the routers on the outbound journey. If you want to know how packets return, you must run traceroute from the server back to the client!

  Let’s inspect the asymmetric return path of our multi-provider network.
  ```
- **Why**: Asymmetric routing explains why one-way packet loss, firewall state drops, and RTT spikes occur when reverse paths traverse congested links.
- **Pic**: `Dual-path topology showing outbound traffic flowing across Transit Provider A (Denver/NYC) while return traffic flows across Transit Provider B (Chicago/Seattle).`
- **Task**: `Inspect the return route path using show return path.`
- **Cmd**: `show return path`
- **Read**:
  - `['Outbound Path', 'PC1 → R1 (SF) → R2 (Denver) → R3 (NYC) → Server (Frankfurt)']`
  - `['Return Path', 'Server → R_Transit_B (Amsterdam) → R_Transit_B (Chicago) → R1 → PC1']`
  - `['Routing Mechanism', 'Independent BGP routing policies per Autonomous System (AS)']`
  - `['Traceroute Reality', 'Traceroute only reports outgoing hops; reverse path must be traced from destination']`
- **Rem**: `Internet paths are frequently asymmetric: outbound packets and return packets traverse completely different routers and transit providers.`

---

### Step 5: Idea 5 of 5 · Recap: The 4 Core Rules of Traceroute
- **Group**: `Recap`
- **Title**: The four rules of traceroute and internet paths
- **What**:
  ```text
  Traceroute is the premier diagnostic tool for Layer 3 internetworking. By understanding its physical, hardware, and protocol realities, you can accurately diagnose latency, packet loss, and routing behavior across the globe.
  ```
- **Why**: Consolidates path diagnosis before moving into Layer 4 Transport protocols (Ports, TCP 3-way handshake, and reliable delivery) in Days 16–19.
- **Pic**: `Master topology HUD displaying probe telemetry, fiber propagation physics, CoPP rate limiting, and asymmetric transit loops.`
- **Task**: `Review the four fundamental rules of traceroute and internet path discovery.`
- **Cmd**: `null`
- **Read**:
  - `['1. Three Probes per Hop', 'Measures latency stability, jitter, and intermittent packet loss']`
  - `['2. Fiber Propagation Physics', 'Light travels at ~5 µs/km in glass; each 1 ms RTT represents ~100 km of fiber']`
  - `['3. The * * * Truth', 'Intermediate timeouts reflect Control Plane Policing (CoPP), not packet loss, if later hops reply']`
  - `['4. Asymmetric Reality', 'Outbound and inbound paths are independent; traceroute only maps the outbound journey']`
- **Rem**: `Traceroute maps outbound hops using incremental TTLs, measures optical fiber latency, and reveals internet routing realities.`

---

## 4. Canvas Virtual World & Hardware Layout

### World Dimensions
- Virtual Coordinate Space: `1480px` wide by `560px` high (`DAY_WORLD_SPECS['net-15'] = { width: 1480, height: 560 }`).

### Hardware Device Positions
1. **PC1 (Client - San Francisco)**:
   - Coordinates: `(70, 220)`
   - IP: `192.168.1.10/24` | MAC: `00:1A:2B:3C:4D:10` | Gateway: `192.168.1.1`
2. **Router R1 (SF Gateway)**:
   - Coordinates: `(380, 215)`
   - Port 1: `192.168.1.1` (LAN) | Port 2: `10.0.0.1` (to Denver)
3. **Router R2 (Denver Regional Hub)**:
   - Coordinates: `(720, 215)`
   - Port 1: `10.0.0.2` (from SF) | Port 2: `203.0.113.1` (to NYC)
4. **Router R3 (NYC Transcontinental Backbone)**:
   - Coordinates: `(1040, 215)`
   - Port 1: `203.0.113.2` (from Denver) | Port 2: `198.51.100.1` (to Web Server)
5. **Web Server (Frankfurt Datacenter)**:
   - Coordinates: `(1320, 220)`
   - IP: `198.51.100.10/24` | Server styling

### Horizontal Spans & Clearance Budget
- **PC1 to R1**: `x=158` to `x=380` $\to$ Span = `222px`. Max badge width: `180px` (21px clearance on both sides).
- **R1 to R2**: `x=506` to `x=720` $\to$ Span = `214px`. Max badge width: `174px` (20px clearance on both sides).
- **R2 to R3**: `x=846` to `x=1040` $\to$ Span = `194px`. Max badge width: `154px` (20px clearance on both sides).
- **R3 to Server**: `x=1166` to `x=1320` $\to$ Span = `154px`. Max badge width: `120px` (17px clearance on both sides).

### Upper Alerts & Tag Staggering
- Top device hop tags: `y=145` (centered above routers at `x=443`, `x=783`, `x=1103`, `x=1364`).
- Fiber distance labels: `y=190` (centered between cables: `(269, 190)`, `(613, 190)`, `(943, 190)`, `(1243, 190)`).
- Control plane alerts: If an alert box is placed above R3, place at `y=100` so it does not collide with Hop 3 tag at `y=145`.

### Lower Diagnostic HUD Cards
- Lower quadrant: `y=360` to `y=525`, 46px clear vertical gap below PC1 and Server (`y=314`).
- Card 1 at `(70, 360)`: `width=280` (Probe Telemetry / CoPP Inspector).
- Card 2 at `(380, 360)`: `width=620` (Traceroute Hop Table / Fiber Distance Analysis).
- Card 3 at `(1040, 360)`: `width=380` (Asymmetric Path Matrix / Rules Summary).

---

## 5. Pre-Planned Simulated Terminal Outputs

```typescript
staticResponses: {
  'traceroute 198.51.100.10':
    'traceroute to 198.51.100.10 (198.51.100.10), 30 hops max, 60 byte packets\n' +
    ' 1  192.168.1.1 (192.168.1.1)  1.182 ms  1.145 ms  1.198 ms\n' +
    ' 2  10.0.0.2 (10.0.0.2)  8.412 ms  8.389 ms  8.405 ms\n' +
    ' 3  203.0.113.2 (203.0.113.2)  42.115 ms  42.088 ms  42.102 ms\n' +
    ' 4  198.51.100.10 (198.51.100.10)  48.241 ms  48.196 ms  48.212 ms',
  'show fiber links':
    'Optical Fiber Propagation Telemetry\n' +
    '----------------------------------------------------\n' +
    'Segment              Fiber Distance  Propagation Delay  Effective RTT\n' +
    'PC1 - R1 (LAN)       15 meters       0.0001 ms          1.1 ms (switched)\n' +
    'R1 - R2 (SF-Denver)  1,620 km        8.10 ms            8.4 ms\n' +
    'R2 - R3 (Denver-NYC) 2,850 km        28.50 ms           42.1 ms\n' +
    'R3 - Server (NYC-FRA)5,800 km (subsea)29.00 ms          48.2 ms\n' +
    '----------------------------------------------------\n' +
    'Physical Law: Speed of light in silica fiber = ~200,000 km/s (5 µs/km)',
  'traceroute 198.51.100.50':
    'traceroute to 198.51.100.50 (198.51.100.50), 30 hops max, 60 byte packets\n' +
    ' 1  192.168.1.1 (192.168.1.1)  1.182 ms  1.145 ms  1.198 ms\n' +
    ' 2  10.0.0.2 (10.0.0.2)  8.412 ms  8.389 ms  8.405 ms\n' +
    ' 3  * * *\n' +
    ' 4  198.51.100.50 (198.51.100.50)  48.241 ms  48.196 ms  48.212 ms\n\n' +
    '[Note: Hop 3 suppressed ICMP Type 11 via Control Plane Policing (CoPP). Transit forwarding 100% operational.]',
  'show return path':
    'BGP Asymmetric Route Inspection\n' +
    '----------------------------------------------------\n' +
    'OUTBOUND PATH (Traceroute View):\n' +
    '  PC1 (SF) → R1 (AS64501) → R2 (AS64502 Denver) → R3 (AS64503 NYC) → Server (Frankfurt)\n\n' +
    'INBOUND RETURN PATH (Reverse Path):\n' +
    '  Server (Frankfurt) → AS64510 (Amsterdam) → AS64520 (Chicago) → R1 (AS64501) → PC1\n' +
    '----------------------------------------------------\n' +
    'Status: Asymmetric routing active. Return traffic traverses independent BGP peers.',
  help:
    'Commands: traceroute 198.51.100.10, show fiber links, traceroute 198.51.100.50, show return path, cls, clear, help',
}
```

---

## 6. Verification Checklist for Day 15
1. `src/content/networking/modules/net-15.ts` implements all 5 steps with zero analogies and taught-before-tested doctrine.
2. `src/content/networking/index.ts` registers `NET_15_MODULE`.
3. `NetworkingCanvas.tsx` adds `DAY_WORLD_SPECS['net-15']` and renders topology observing Horizontal Cable Span Invariants.
4. `NetworkingWorkspace.tsx` adds command aliases for `traceroute`, `show fiber links`, `show return path`.
5. `NetworkingTerminal.tsx` adds Day 15 static response routing and help string.
6. Curriculum tests pass: `npm test -- tests/curriculum/networking-`.
7. Canvas UI tests pass: `npm test -- tests/ui/networking-canvas.test.tsx`.
8. TypeScript check passes: `npx tsc --noEmit`.
