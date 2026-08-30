import type { Metadata } from 'next';
import AuthScreen from '@/components/auth/AuthScreen';

export const metadata: Metadata = {
  title: 'Create Account',
  description:
    'Create a free SQLens account to keep your 38-day SQL progress â€” cloud-synced across devices, guests welcome too.',
};

export default function SignUpPage() {
  return <AuthScreen mode="signup" />;
}
