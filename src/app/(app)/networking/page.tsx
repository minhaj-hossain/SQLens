import NetworkingTrackHomePage from '@/components/learning/networking/homepage/NetworkingTrackHomePage';

export const metadata = {
  title: 'Networking Fundamentals — Local Links to the Global Internet',
  description:
    'Your visual roadmap through Networking Fundamentals: direct links, shared media, Layer 2 switching, MAC learning, and packet routing.',
  alternates: { canonical: '/networking' },
};

/**
 * `/networking` — Dedicated Networking Track Homepage.
 */
export default function NetworkingRoadmapPage() {
  return <NetworkingTrackHomePage />;
}
