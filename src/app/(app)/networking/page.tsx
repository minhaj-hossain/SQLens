import type { Metadata } from 'next';
import { NetworkingHomePage } from '@/components/learning/networking/homepage/NetworkingHomePage';

export const metadata: Metadata = {
  title: 'Networking Track — Learn Networking by Building It | SQLens',
  description:
    'Short daily modules. Read the concept, then practise it on a live canvas with a real terminal.',
};

export default function NetworkingPage() {
  return <NetworkingHomePage />;
}
