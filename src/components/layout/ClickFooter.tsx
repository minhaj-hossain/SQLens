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
      className={`w-full border-t border-border-soft bg-ink text-text ${className}`}
    >
      <div className="mx-auto flex w-full max-w-[1120px] flex-wrap justify-between gap-x-16 gap-y-10 px-6 pt-12 pb-8">
        {/* Brand identity column */}
        <div className="flex max-w-[340px] flex-1 basis-[260px] flex-col gap-3.5">
          <Link
            href="/"
            aria-label="Click Homepage"
            className="inline-flex w-fit items-center rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-func"
          >
            <BrandLogo variant="click" size="md" />
          </Link>
          <p className="m-0 text-sm leading-[1.55] text-text-dim">
            When concepts finally click.
          </p>
        </div>

        {/* Navigation links columns */}
        <div className="flex flex-wrap gap-x-16 gap-y-10">
          <div className="flex min-w-[120px] flex-col gap-3">
            <span className="font-mono text-[11px] font-semibold tracking-[0.14em] text-text-faint uppercase">
              TRACKS
            </span>
            <Link href="/sql" className="flink text-sm">
              SQL (57 Days)
            </Link>
            <Link href="/prisma" className="flink text-sm">
              Prisma (14 Days)
            </Link>
            <Link href="/networking" className="flink text-sm">
              Networking (35 Days)
            </Link>
            <Link href="/playground?from=/" className="flink text-sm flex items-center gap-1 text-func hover:brightness-110">
              <span>Playground</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-func/10 border border-func/30 font-mono">Live</span>
            </Link>
          </div>

          <div className="flex min-w-[120px] flex-col gap-3">
            <span className="font-mono text-[11px] font-semibold tracking-[0.14em] text-text-faint uppercase">
              PROJECT
            </span>
            <a href="#about" className="flink text-sm">
              About
            </a>
            <a
              href="https://github.com/minhaj-hossain/SQLens"
              target="_blank"
              rel="noopener noreferrer"
              className="flink text-sm"
            >
              GitHub Repository
            </a>
            <a
              href="#feedback"
              className="flink text-sm"
            >
              Feedback
            </a>
          </div>
        </div>
      </div>

      {/* Bottom copyright divider */}
      <div className="mx-auto w-full max-w-[1120px] px-6 pb-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border-soft pt-6 text-[13px] text-text-faint">
          <span>© 2026 Click. Hands-on learning runtime.</span>
          <div className="flex items-center gap-4 text-xs">
            <span className="inline-flex items-center gap-1.5 text-[var(--success-text)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--success-text)] animate-pulse" />
              SQLite WASM, Prisma &amp; Network Simulation Ready
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default ClickFooter;
