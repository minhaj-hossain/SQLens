'use client';

import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'sm',
  showText = true,
  className = '',
}) => {
  const dimensions = {
    sm: { icon: 22, text: 'text-[16px]', viewBox: '0 0 30 30' },
    md: { icon: 28, text: 'text-[20px]', viewBox: '0 0 30 30' },
    lg: { icon: 36, text: 'text-[24px]', viewBox: '0 0 30 30' },
  }[size];

  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      {/* Official SQLens Optic Search Lens with Query Scan Lines */}
      <svg
        width={dimensions.icon}
        height={dimensions.icon}
        viewBox={dimensions.viewBox}
        fill="none"
        className="shrink-0 transition-transform duration-200 group-hover:scale-105"
        aria-hidden="true"
      >
        {/* Optic lens ring */}
        <circle cx="12.5" cy="12.5" r="9" stroke="var(--func)" strokeWidth="2.2" />
        {/* Handle */}
        <line
          x1="19"
          y1="19"
          x2="26.5"
          y2="26.5"
          stroke="var(--func)"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        {/* Upper query scan line */}
        <line
          x1="8"
          y1="10.5"
          x2="17"
          y2="10.5"
          stroke="var(--text)"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        {/* Lower query scan line (faint) */}
        <line
          x1="8"
          y1="14.5"
          x2="15"
          y2="14.5"
          stroke="var(--text)"
          strokeWidth="1.6"
          strokeLinecap="round"
          opacity="0.65"
        />
      </svg>

      {showText && (
        <span className={`font-display font-bold tracking-tight text-text whitespace-nowrap ${dimensions.text}`}>
          SQL<span className="text-func">ens</span>
        </span>
      )}
    </div>
  );
};

export default BrandLogo;
