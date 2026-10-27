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
 * Visualizes an interactive network terminal session on the left transmitting
 * ICMP packets to a live device topology and decoded Layer 2/3 frame on the right.
 */
export const NetworkingDiagramSvg: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <svg
      viewBox="0 0 480 220"
      width="100%"
      className={`block max-w-[480px] select-none ${className}`}
      role="img"
      aria-label="A network terminal on the left transmits ICMP packets to a live device topology on the right"
    >
      {/* Left sub-window: terminal */}
      <rect x="24" y="28" width="210" height="164" rx="12" fill="#070c14" stroke="#1b2a47" />
      <circle cx="42" cy="44" r="3" fill="#223049" />
      <circle cx="54" cy="44" r="3" fill="#223049" />
      <circle cx="66" cy="44" r="3" fill="#223049" />
      <text x="84" y="48" fontFamily="JetBrains Mono, monospace" fontSize="10" fill="#7b8db0">
        terminal
      </text>
      <path d="M24 60H234" stroke="#1b2a47" />

      {/* Terminal ping execution output */}
      <text x="38" y="84" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#e8eefb">
        <tspan fill="#4ade80" fontWeight="600">$</tspan> ping 192.168.1.1
      </text>
      <text x="38" y="106" fontFamily="JetBrains Mono, monospace" fontSize="10" fill="#8a9bbd">
        PING 192.168.1.1: 56 data bytes
      </text>
      <text x="38" y="128" fontFamily="JetBrains Mono, monospace" fontSize="10.5" fill="#e8eefb">
        64 bytes: icmp_seq=1 <tspan fill="#4ade80">ttl=64</tspan>
      </text>
      <text x="38" y="150" fontFamily="JetBrains Mono, monospace" fontSize="10.5" fill="#4ade80" fontWeight="600">
        time=1.12 ms (direct link)
      </text>
      <text x="38" y="172" fontFamily="JetBrains Mono, monospace" fontSize="10" fill="#38bdf8">
        1 packets transmitted · 0% loss
      </text>

      {/* Central directional link cable & packet badge */}
      <path
        d="M234 110H282M274 102L282 110L274 118"
        fill="none"
        stroke="#4ade80"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="240" y="87" width="36" height="14" rx="3" fill="#064e3b" stroke="#4ade80" strokeWidth="1" />
      <text x="258" y="97.5" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="7.5" fill="#6ee7b7" fontWeight="700">
        ICMP
      </text>

      {/* Right sub-window: topology & packet frame */}
      <rect x="282" y="28" width="174" height="164" rx="12" fill="#070c14" stroke="#1b2a47" />
      <text x="298" y="48" fontFamily="JetBrains Mono, monospace" fontSize="10" fill="#7b8db0">
        topology
      </text>
      <path d="M282 60H456" stroke="#1b2a47" />

      {/* Device 1: PC1 */}
      <rect x="296" y="74" width="58" height="34" rx="4" fill="#0f172a" stroke="#334155" strokeWidth="1" />
      <text x="325" y="88" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="8.5" fill="#f1f5f9" fontWeight="700">
        PC1
      </text>
      <text x="325" y="100" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="7" fill="#60a5fa">
        192.168.1.10
      </text>

      {/* Connecting cable between devices */}
      <line x1="354" y1="91" x2="384" y2="91" stroke="#4ade80" strokeWidth="1.5" strokeDasharray="3 2" />

      {/* Device 2: Router R1 (Gateway) */}
      <rect x="384" y="74" width="58" height="34" rx="4" fill="#0f172a" stroke="#4ade80" strokeWidth="1.2" />
      <text x="413" y="88" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="8" fill="#4ade80" fontWeight="700">
        R1 GATEWAY
      </text>
      <text x="413" y="100" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="7" fill="#6ee7b7">
        192.168.1.1
      </text>

      {/* Layer 2/3 Frame breakdown container */}
      <rect
        x="292"
        y="118"
        width="154"
        height="62"
        rx="6"
        fill="#064e3b"
        fillOpacity="0.16"
        stroke="#4ade80"
        strokeWidth="1"
      />
      <text x="300" y="132" fontFamily="JetBrains Mono, monospace" fontSize="8.5" fill="#4ade80" fontWeight="600">
        LAYER 2/3 FRAME DECODE
      </text>
      <text x="300" y="148" fontFamily="JetBrains Mono, monospace" fontSize="8" fill="#cbd5e1">
        Eth: PC1 MAC → Gateway MAC
      </text>
      <text x="300" y="162" fontFamily="JetBrains Mono, monospace" fontSize="8" fill="#cbd5e1">
        IP:  192.168.1.10 → 192.168.1.1
      </text>
      <text x="300" y="174" fontFamily="JetBrains Mono, monospace" fontSize="7.5" fill="#6ee7b7">
        ICMP Type 8 (Echo Request)
      </text>
    </svg>
  );
};
