import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-ink flex items-center justify-center px-4">
      <div className="bg-surface border border-border rounded-2xl p-8 max-w-md w-full text-center">
        <p className="font-mono text-[64px] font-bold leading-none text-func/20 mb-2 select-none">
          404
        </p>
        <h1 className="font-display font-bold text-xl text-text mb-2">Page not found</h1>
        <p className="text-sm text-text-dim leading-relaxed mb-6">
          This route doesn&apos;t exist. Explore one of our interactive learning tracks:
        </p>
        <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-2.5 mb-5">
          <Link
            href="/sql"
            className="w-full sm:w-auto inline-block bg-func text-ink font-mono text-xs font-bold px-3.5 py-2 rounded-lg hover:brightness-110 transition text-center"
          >
            SQL (57 Days)
          </Link>
          <Link
            href="/prisma"
            className="w-full sm:w-auto inline-block bg-surface-2 text-text border border-border font-mono text-xs font-bold px-3.5 py-2 rounded-lg hover:bg-surface-3 transition text-center"
          >
            Prisma (14 Days)
          </Link>
          <Link
            href="/networking"
            className="w-full sm:w-auto inline-block bg-[#4ade80]/10 text-[#4ade80] border border-[#4ade80]/30 font-mono text-xs font-bold px-3.5 py-2 rounded-lg hover:bg-[#4ade80]/20 transition text-center"
          >
            Networking (35 Days)
          </Link>
        </div>
        <Link
          href="/"
          className="text-xs font-mono text-text-dim hover:text-text transition"
        >
          ← Return to Home
        </Link>
      </div>
    </main>
  );
}
