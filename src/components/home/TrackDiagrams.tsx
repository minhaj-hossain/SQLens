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
      <rect x="24" y="28" width="210" height="164" rx="12" fill="#0d1526" stroke="#1b2a47" />
      <circle cx="42" cy="44" r="3" fill="#2a3d63" />
      <circle cx="54" cy="44" r="3" fill="#2a3d63" />
      <circle cx="66" cy="44" r="3" fill="#2a3d63" />
      <text x="84" y="48" fontFamily="JetBrains Mono, monospace" fontSize="10" fill="#7b8db0">
        query.sql
      </text>
      <path d="M24 60H234" stroke="#1b2a47" />
      <text x="40" y="84" fontFamily="JetBrains Mono, monospace" fontSize="12" fill="#e8eefb">
        <tspan fill="#38bdf8">SELECT</tspan> name, total
      </text>
      <text x="40" y="106" fontFamily="JetBrains Mono, monospace" fontSize="12" fill="#e8eefb">
        <tspan fill="#38bdf8">FROM</tspan> orders
      </text>
      <text x="40" y="128" fontFamily="JetBrains Mono, monospace" fontSize="12" fill="#e8eefb">
        <tspan fill="#38bdf8">JOIN</tspan> customers
      </text>
      <text x="40" y="150" fontFamily="JetBrains Mono, monospace" fontSize="12" fill="#e8eefb">
        <tspan fill="#38bdf8">WHERE</tspan> total &gt; 100
      </text>
      <text x="40" y="172" fontFamily="JetBrains Mono, monospace" fontSize="12" fill="#e8eefb">
        <tspan fill="#38bdf8">ORDER BY</tspan> total <tspan fill="#38bdf8">DESC</tspan>
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

      {/* Right sub-window: result table */}
      <rect x="282" y="28" width="174" height="164" rx="12" fill="#0d1526" stroke="#1b2a47" />
      <text x="298" y="48" fontFamily="JetBrains Mono, monospace" fontSize="10" fill="#7b8db0">
        result
      </text>
      <path d="M282 60H456" stroke="#1b2a47" />
      <text x="298" y="82" fontFamily="JetBrains Mono, monospace" fontSize="10" fill="#7b8db0">
        name
      </text>
      <text x="392" y="82" fontFamily="JetBrains Mono, monospace" fontSize="10" fill="#7b8db0">
        total
      </text>

      {/* Highlighted first row */}
      <rect
        x="290"
        y="92"
        width="158"
        height="24"
        rx="6"
        fill="#38bdf8"
        fillOpacity="0.14"
        stroke="#38bdf8"
      />
      <text x="298" y="108" fontFamily="JetBrains Mono, monospace" fontSize="12" fill="#38bdf8">
        Ava
      </text>
      <text x="392" y="108" fontFamily="JetBrains Mono, monospace" fontSize="12" fill="#38bdf8">
        420
      </text>

      {/* Other data rows */}
      <text x="298" y="134" fontFamily="JetBrains Mono, monospace" fontSize="12" fill="#e8eefb">
        Liam
      </text>
      <text x="392" y="134" fontFamily="JetBrains Mono, monospace" fontSize="12" fill="#e8eefb">
        310
      </text>
      <text x="298" y="158" fontFamily="JetBrains Mono, monospace" fontSize="12" fill="#e8eefb">
        Noah
      </text>
      <text x="392" y="158" fontFamily="JetBrains Mono, monospace" fontSize="12" fill="#e8eefb">
        260
      </text>
      <text x="298" y="182" fontFamily="JetBrains Mono, monospace" fontSize="12" fill="#e8eefb">
        Mia
      </text>
      <text x="392" y="182" fontFamily="JetBrains Mono, monospace" fontSize="12" fill="#e8eefb">
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
