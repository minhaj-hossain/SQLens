export default function Loading() {
  return (
    <main className="min-h-screen bg-ink flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-12 h-12">
          <span className="absolute inset-0 rounded-full border-2 border-border" />
          <span className="absolute inset-0 rounded-full border-2 border-transparent border-t-func animate-spin" />
        </div>
        <p className="font-mono text-xs tracking-wider text-text-dim uppercase">
          SQL<span className="text-func">ens</span> · loading
        </p>
      </div>
    </main>
  );
}
