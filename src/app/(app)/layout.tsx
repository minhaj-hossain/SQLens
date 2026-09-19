import { UiChromeProvider } from '@/components/providers/UiChromeProvider';
import AppChrome from '@/components/layout/AppChrome';

/**
 * (app) group layout — owns the learning application shell (Phase 1 + Batch 6):
 * AppProviders now lives at the ROOT layout (src/app/layout.tsx) so auth +
 * progress state — and LearningProgressProvider's in-memory epoch lineage —
 * survives navigation between route groups (e.g. `/` <-> `/admin`, which used
 * to unmount the whole provider tree and replay hydration from epoch 0).
 * This layout keeps only the (app)-scoped chrome: UiChromeProvider (needs
 * useLearning) + AppChrome (Header + <main>).
 * Route content never mounts providers itself.
 */
export default function AppGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <UiChromeProvider>
      <AppChrome>{children}</AppChrome>
    </UiChromeProvider>
  );
}
