import type { Metadata } from 'next';
import { Suspense } from 'react';
import { VerifyEmailView } from '@/components/auth/VerifyEmailView';

export const metadata: Metadata = {
  title: 'Verify Email',
  description:
    'Confirm your email address to activate your SQLens account and keep your 38-day SQL progress synced across devices.',
};

export default function VerifyEmailPage() {
  return (
    // VerifyEmailView reads search params (email hint) → needs a Suspense
    // boundary for the App Router.
    <Suspense>
      <VerifyEmailView />
    </Suspense>
  );
}
