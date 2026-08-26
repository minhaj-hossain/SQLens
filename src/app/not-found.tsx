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
          This route doesn&apos;t exist. The learning path lives at the root of the site.
        </p>
        <Link
          href="/"
          className="inline-block bg-func text-ink font-mono text-xs font-bold px-5 py-2.5 rounded-lg hover:brightness-110 transition"
        >
          ← Back to SQLens
        </Link>
      </div>
    </main>
  );
}
