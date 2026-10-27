import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getNetworkingModule, getAllNetworkingModules } from '@/content/networking';
import { NetworkingWorkspace } from '@/components/learning/networking/workspace/NetworkingWorkspace';

interface Props {
  params: Promise<{ dayId: string }>;
}

export async function generateStaticParams() {
  const modules = getAllNetworkingModules();
  return modules.map((m) => ({
    dayId: m.id,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { dayId } = await params;
  const module = getNetworkingModule(dayId);

  if (!module) {
    return {
      title: 'Module Not Found | Click Networking',
    };
  }

  return {
    title: `${module.title} | Click Networking`,
    description: module.steps[0]?.what || 'Interactive networking lesson on live canvas.',
  };
}

export default async function NetworkingLearnDayPage({ params }: Props) {
  const { dayId } = await params;
  const module = getNetworkingModule(dayId);

  if (!module) {
    notFound();
  }

  return <NetworkingWorkspace module={module} />;
}
