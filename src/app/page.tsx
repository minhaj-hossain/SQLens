import AppShell from '@/components/app/AppShell';
import AppProviders from '@/components/providers/AppProviders';

// Phase 0: providers mount here so the prerendered shell has auth/progress/
// executor context. Phase 1 moves this into the (app)/layout.tsx.
export default function HomePage() {
  return (
    <AppProviders>
      <AppShell />
    </AppProviders>
  );
}
