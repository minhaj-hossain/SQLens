'use client';

import React from 'react';

export interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  variant?: 'click' | 'sqlens';
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'sm',
  showText = true,
  variant = 'click',
  className = '',
}) => {
  if (variant === 'click') {
    const clickDimensions = {
      sm: { icon: 22, text: 'text-[17px]', gap: 'gap-2' },
      md: { icon: 26, text: 'text-[19px]', gap: 'gap-2.5' },
      lg: { icon: 34, text: 'text-[24px]', gap: 'gap-3' },
    }[size];

    return (
      <div className={`flex items-center select-none ${clickDimensions.gap} ${className}`}>
        {/* Click cursor logo: pointer arrow + radial burst rays */}
        <svg
          width={clickDimensions.icon}
          height={clickDimensions.icon}
          viewBox="0 0 28 28"
          fill="none"
          className="shrink-0 transition-transform duration-200 group-hover:scale-105"
          aria-hidden="true"
        >
          {/* Pointer arrow polygon */}
          <path
            d="M10 7V21L14 17L17 24L19.5 23L16.5 16.3H22Z"
            fill="var(--func, #38bdf8)"
            stroke="var(--func, #38bdf8)"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {/* Radiating click energy burst rays */}
          <path
            d="M10 3V1M6 4L4.5 2.5M6 8H4"
            stroke="var(--func, #38bdf8)"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>

        {showText && (
          <span
            className={`font-semibold tracking-[-0.02em] text-[#e8eefb] whitespace-nowrap ${clickDimensions.text}`}
          >
            Click
          </span>
        )}
      </div>
    );
  }

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
