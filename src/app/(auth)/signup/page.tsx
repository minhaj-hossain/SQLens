import type { Metadata } from 'next';
import AuthScreen from '@/components/auth/AuthScreen';

export const metadata: Metadata = {
  title: 'Create Account',
  description:
    'Create a free Click account to keep your progress cloud-synced across devices, guests welcome too.',
};

export default function SignUpPage() {
  return <AuthScreen mode="signup" />;
}
