import type { Metadata } from 'next';
import AuthScreen from '@/components/auth/AuthScreen';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to SQLens to sync your learning progress across devices.',
};

export default function SignInPage() {
  return <AuthScreen mode="signin" />;
}
