'use client';

import React from 'react';
import Link from 'next/link';
import { BrandLogo } from '@/components/ui/BrandLogo';

export interface ClickFooterProps {
  className?: string;
}

export const ClickFooter: React.FC<ClickFooterProps> = ({ className = '' }) => {
  return (
    <footer
      data-testid="click-footer"
      className={`w-full border-t border-[#121d33] bg-[#060b16] text-[#e8eefb] ${className}`}
    >
      <div className="mx-auto flex w-full max-w-[1120px] flex-wrap justify-between gap-x-16 gap-y-10 px-6 pt-12 pb-8">
        {/* Brand identity column */}
        <div className="flex max-w-[340px] flex-1 basis-[260px] flex-col gap-3.5">
          <Link
            href="/"
            aria-label="Click Homepage"
            className="inline-flex w-fit items-center rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#38bdf8]"
          >
            <BrandLogo variant="click" size="md" />
          </Link>
          <p className="m-0 text-sm leading-[1.55] text-[#8a9bbd]">
            When concepts finally click.
          </p>
        </div>

        {/* Navigation links columns */}
        <div className="flex flex-wrap gap-x-16 gap-y-10">
          <div className="flex min-w-[120px] flex-col gap-3">
            <span className="font-mono text-[11px] tracking-[0.14em] text-[#7b8db0] uppercase">
              TRACKS
            </span>
            <Link href="/sql" className="flink text-sm">
              SQL
            </Link>
            <Link href="/prisma" className="flink text-sm">
              Prisma
            </Link>
          </div>

          <div className="flex min-w-[120px] flex-col gap-3">
            <span className="font-mono text-[11px] tracking-[0.14em] text-[#7b8db0] uppercase">
              PROJECT
            </span>
            <Link href="#about" className="flink text-sm">
              About
            </Link>
            <Link href="#feedback" className="flink text-sm">
              Feedback
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom copyright divider */}
      <div className="mx-auto w-full max-w-[1120px] px-6 pb-8">
        <div className="border-t border-[#121d33] pt-5 text-center text-[13px] text-[#7b8db0]">
          © 2026 Click
        </div>
      </div>
    </footer>
  );
};

export default ClickFooter;
