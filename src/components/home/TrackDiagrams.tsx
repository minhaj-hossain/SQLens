import React from 'react';

/**
 * SQL Architecture Diagram SVG
 * Visualizes a SQL JOIN query in query.sql on the left executing into
 * an ordered result table on the right with the top row highlighted.
 */
export const SqlDiagramSvg: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <svg
      viewBox="0 0 480 220"
      width="100%"
      className={`block max-w-[480px] select-none ${className}`}
      role="img"
      aria-label="A SQL query on the left produces a sorted result table on the right"
    >
      {/* Left sub-window: query.sql */}
      <rect x="24" y="28" width="210" height="164" rx="12" fill="var(--surface-2)" stroke="var(--border)" />
      <circle cx="42" cy="44" r="3" fill="var(--border-strong)" />
      <circle cx="54" cy="44" r="3" fill="var(--border-strong)" />
      <circle cx="66" cy="44" r="3" fill="var(--border-strong)" />
      <text x="84" y="48" fontFamily="JetBrains Mono, monospace" fontSize="10" fill="var(--text-faint)">
        query.sql
      </text>
      <path d="M24 60H234" stroke="var(--border)" />
      <text x="40" y="84" fontFamily="JetBrains Mono, monospace" fontSize="12" fill="var(--text)">
        <tspan fill="var(--func)" fontWeight="600">SELECT</tspan> name, total
      </text>
      <text x="40" y="106" fontFamily="JetBrains Mono, monospace" fontSize="12" fill="var(--text)">
        <tspan fill="var(--func)" fontWeight="600">FROM</tspan> orders
      </text>
      <text x="40" y="128" fontFamily="JetBrains Mono, monospace" fontSize="12" fill="var(--text)">
        <tspan fill="var(--func)" fontWeight="600">JOIN</tspan> customers
      </text>
      <text x="40" y="150" fontFamily="JetBrains Mono, monospace" fontSize="12" fill="var(--text)">
        <tspan fill="var(--func)" fontWeight="600">WHERE</tspan> total &gt; 100
      </text>
      <text x="40" y="172" fontFamily="JetBrains Mono, monospace" fontSize="12" fill="var(--text)">
        <tspan fill="var(--func)" fontWeight="600">ORDER BY</tspan> total <tspan fill="var(--func)" fontWeight="600">DESC</tspan>
      </text>

      {/* Central directional arrow */}
      <path
        d="M242 110H270M262 102L270 110L262 118"
        fill="none"
        stroke="var(--func)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Right sub-window: result table */}
      <rect x="282" y="28" width="174" height="164" rx="12" fill="var(--surface-2)" stroke="var(--border)" />
      <text x="298" y="48" fontFamily="JetBrains Mono, monospace" fontSize="10" fill="var(--text-faint)">
        result
      </text>
      <path d="M282 60H456" stroke="var(--border)" />
      <text x="298" y="82" fontFamily="JetBrains Mono, monospace" fontSize="10" fill="var(--text-dim)">
        name
      </text>
      <text x="392" y="82" fontFamily="JetBrains Mono, monospace" fontSize="10" fill="var(--text-dim)">
        total
      </text>

      {/* Highlighted first row */}
      <rect
        x="290"
        y="92"
        width="158"
        height="24"
        rx="6"
        fill="var(--func)"
        fillOpacity="0.14"
        stroke="var(--func)"
      />
      <text x="298" y="108" fontFamily="JetBrains Mono, monospace" fontSize="12" fill="var(--func)" fontWeight="600">
        Ava
      </text>
      <text x="392" y="108" fontFamily="JetBrains Mono, monospace" fontSize="12" fill="var(--func)" fontWeight="600">
        420
      </text>

      {/* Other data rows */}
      <text x="298" y="134" fontFamily="JetBrains Mono, monospace" fontSize="12" fill="var(--text)">
        Liam
      </text>
      <text x="392" y="134" fontFamily="JetBrains Mono, monospace" fontSize="12" fill="var(--text)">
        310
      </text>
      <text x="298" y="158" fontFamily="JetBrains Mono, monospace" fontSize="12" fill="var(--text)">
        Noah
      </text>
      <text x="392" y="158" fontFamily="JetBrains Mono, monospace" fontSize="12" fill="var(--text)">
        260
      </text>
      <text x="298" y="182" fontFamily="JetBrains Mono, monospace" fontSize="12" fill="var(--text)">
        Mia
      </text>
      <text x="392" y="182" fontFamily="JetBrains Mono, monospace" fontSize="12" fill="var(--text)">
        180
      </text>
    </svg>
  );
};

/**
 * Prisma Architecture Diagram SVG
 * Visualizes a schema.prisma model on the left powering type-safe
 * autocomplete in app.ts on the right.
 */
export const PrismaDiagramSvg: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <svg
      viewBox="0 0 480 220"
      width="100%"
      className={`block max-w-[480px] select-none ${className}`}
      role="img"
      aria-label="A Prisma schema on the left powers type-safe autocomplete in code on the right"
    >
      {/* Left sub-window: schema.prisma */}
      <rect x="24" y="28" width="210" height="164" rx="12" fill="#0d1526" stroke="#1b2a47" />
      <circle cx="42" cy="44" r="3" fill="#2a3d63" />
      <circle cx="54" cy="44" r="3" fill="#2a3d63" />
      <circle cx="66" cy="44" r="3" fill="#2a3d63" />
      <text x="84" y="48" fontFamily="JetBrains Mono, monospace" fontSize="10" fill="#7b8db0">
        schema.prisma
      </text>
      <path d="M24 60H234" stroke="#1b2a47" />
      <text x="40" y="86" fontFamily="JetBrains Mono, monospace" fontSize="12" fill="#e8eefb">
        <tspan fill="#38bdf8">model</tspan> User &#123;
      </text>
      <text x="56" y="108" fontFamily="JetBrains Mono, monospace" fontSize="12" fill="#e8eefb">
        id
      </text>
      <text x="108" y="108" fontFamily="JetBrains Mono, monospace" fontSize="12" fill="#8a9bbd">
        Int
      </text>
      <text x="150" y="108" fontFamily="JetBrains Mono, monospace" fontSize="12" fill="#38bdf8">
        @id
      </text>
      <text x="56" y="130" fontFamily="JetBrains Mono, monospace" fontSize="12" fill="#e8eefb">
        email
      </text>
      <text x="108" y="130" fontFamily="JetBrains Mono, monospace" fontSize="12" fill="#8a9bbd">
        String
      </text>
      <text x="56" y="152" fontFamily="JetBrains Mono, monospace" fontSize="12" fill="#e8eefb">
        posts
      </text>
      <text x="108" y="152" fontFamily="JetBrains Mono, monospace" fontSize="12" fill="#8a9bbd">
        Post[]
      </text>
      <text x="40" y="176" fontFamily="JetBrains Mono, monospace" fontSize="12" fill="#e8eefb">
        &#125;
      </text>

      {/* Central directional arrow */}
      <path
        d="M242 110H270M262 102L270 110L262 118"
        fill="none"
        stroke="#38bdf8"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Right sub-window: app.ts */}
      <rect x="282" y="28" width="174" height="164" rx="12" fill="#0d1526" stroke="#1b2a47" />
      <text x="298" y="48" fontFamily="JetBrains Mono, monospace" fontSize="10" fill="#7b8db0">
        app.ts
      </text>
      <path d="M282 60H456" stroke="#1b2a47" />
      <text x="298" y="84" fontFamily="JetBrains Mono, monospace" fontSize="12" fill="#e8eefb">
        <tspan fill="#38bdf8">prisma</tspan>.user.
      </text>
      {/* Blinking typing caret */}
      <rect x="385" y="72" width="2" height="14" fill="#38bdf8" />

      {/* Autocomplete dropdown box */}
      <rect x="298" y="96" width="146" height="82" rx="8" fill="#111c33" stroke="#2a3d63" />
      <text x="310" y="114" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#e8eefb">
        id
      </text>
      <text x="376" y="114" fontFamily="JetBrains Mono, monospace" fontSize="10" fill="#7b8db0">
        number
      </text>

      {/* Highlighted autocomplete item */}
      <rect
        x="302"
        y="122"
        width="138"
        height="20"
        rx="5"
        fill="#38bdf8"
        fillOpacity="0.16"
      />
      <text x="310" y="136" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#38bdf8">
        email
      </text>
      <text x="376" y="136" fontFamily="JetBrains Mono, monospace" fontSize="10" fill="#38bdf8">
        string
      </text>

      <text x="310" y="162" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#e8eefb">
        posts
      </text>
      <text x="376" y="162" fontFamily="JetBrains Mono, monospace" fontSize="10" fill="#7b8db0">
        Post[]
      </text>
    </svg>
  );
};

/**
 * Networking Architecture Diagram SVG
 * Visualizes a full-width horizontal network topology matching Proposal 2:
 * PC1 Workstation transmitting ICMP packets through Switch SW1 to Gateway R1,
 * with live hop telemetry and Click theme color tokens.
 */
export const NetworkingDiagramSvg: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <svg
      viewBox="0 0 480 220"
      width="100%"
      className={`block max-w-[480px] select-none ${className}`}
      role="img"
      aria-label="An interactive network topology routing packets from PC1 through a switch to Gateway R1"
    >
      {/* Outer Window Container */}
      <rect x="24" y="28" width="432" height="164" rx="12" fill="var(--surface-2)" stroke="var(--border)" />
      
      {/* Window Header Dots & Title */}
      <circle cx="42" cy="44" r="3" fill="var(--border-strong)" />
      <circle cx="54" cy="44" r="3" fill="var(--border-strong)" />
      <circle cx="66" cy="44" r="3" fill="var(--border-strong)" />
      <text x="84" y="48" fontFamily="JetBrains Mono, monospace" fontSize="10" fill="var(--text-faint)">
        topology.net
      </text>

      {/* Header Live Status Indicator */}
      <circle cx="366" cy="44.5" r="2.5" fill="var(--func)" />
      <text x="376" y="48" fontFamily="JetBrains Mono, monospace" fontSize="9.5" fill="var(--func)" fontWeight="600">
        LIVE LINK
      </text>

      {/* Window Header Divider */}
      <path d="M24 60H456" stroke="var(--border)" />

      {/* Node 1: PC1 Workstation */}
      <rect x="44" y="74" width="96" height="52" rx="8" fill="var(--surface)" stroke="var(--border)" />
      <text x="92" y="93" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="11" fontWeight="700" fill="var(--text)">
        PC1
      </text>
      <rect x="52" y="102" width="80" height="16" rx="4" fill="var(--surface-2)" stroke="var(--border-subtle)" />
      <text x="92" y="113.5" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="8.5" fill="var(--text-dim)">
        192.168.1.10
      </text>

      {/* Cable 1: PC1 to SW1 */}
      <line x1="140" y1="100" x2="192" y2="100" stroke="var(--border-strong)" strokeWidth="1.5" strokeDasharray="3 3" />
      <circle cx="140" cy="100" r="2.5" fill="var(--func)" />
      <circle cx="192" cy="100" r="2.5" fill="var(--func)" />
      <text x="166" y="93" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="7.5" fill="var(--text-faint)">
        eth0
      </text>

      {/* Node 2: SW1 Switch */}
      <rect x="192" y="74" width="96" height="52" rx="8" fill="var(--surface)" stroke="var(--border)" />
      <text x="240" y="93" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="11" fontWeight="700" fill="var(--text)">
        SW1
      </text>
      <rect x="200" y="102" width="80" height="16" rx="4" fill="var(--surface-2)" stroke="var(--border-subtle)" />
      <text x="240" y="113.5" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="8.5" fill="var(--text-dim)">
        VLAN 10
      </text>

      {/* Cable 2: SW1 to R1 */}
      <line x1="288" y1="100" x2="340" y2="100" stroke="var(--func)" strokeWidth="2" />
      <circle cx="288" cy="100" r="2.5" fill="var(--func)" />
      <circle cx="340" cy="100" r="2.5" fill="var(--func)" />

      {/* In-flight ICMP Packet Badge */}
      <rect x="294" y="89" width="40" height="22" rx="4" fill="var(--func)" stroke="var(--func)" />
      <text x="314" y="103.5" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="8" fontWeight="800" fill="var(--ink)">
        ICMP
      </text>
      <path d="M336 97L340 100L336 103" fill="none" stroke="var(--func)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Node 3: R1 Gateway Router (Highlighted Target) */}
      <rect x="340" y="74" width="96" height="52" rx="8" fill="var(--func)" fillOpacity="0.10" stroke="var(--func)" strokeWidth="1.5" />
      <text x="388" y="93" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="10.5" fontWeight="700" fill="var(--func)">
        R1 GATEWAY
      </text>
      <rect x="348" y="102" width="80" height="16" rx="4" fill="var(--func)" fillOpacity="0.16" stroke="var(--func)" strokeOpacity="0.4" />
      <text x="388" y="113.5" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="8.5" fontWeight="600" fill="var(--func)">
        192.168.1.1
      </text>

      {/* Bottom Packet & Route Telemetry Tray */}
      <rect x="44" y="138" width="392" height="40" rx="8" fill="var(--surface)" fillOpacity="0.8" stroke="var(--border)" />
      
      {/* TTL Pill */}
      <rect x="54" y="146" width="62" height="24" rx="5" fill="var(--func)" fillOpacity="0.14" stroke="var(--func)" strokeOpacity="0.35" />
      <text x="85" y="161.5" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="9.5" fontWeight="700" fill="var(--func)">
        TTL=64
      </text>

      {/* Hop Routing Telemetry */}
      <text x="126" y="157" fontFamily="JetBrains Mono, monospace" fontSize="10" fill="var(--text)">
        <tspan fill="var(--func)" fontWeight="600">IP</tspan> 192.168.1.10 → 192.168.1.1
      </text>
      <text x="126" y="171" fontFamily="JetBrains Mono, monospace" fontSize="8.5" fill="var(--text-dim)">
        Eth: MAC PC1 → Next Hop R1 (0x0800)
      </text>

      {/* Round-trip Latency */}
      <text x="424" y="162" textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="9.5" fontWeight="600" fill="var(--func)">
        0.84 ms
      </text>
    </svg>
  );
};
