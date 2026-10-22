import { redirect } from 'next/navigation';

/**
 * Legacy URL redirect: forwards any /networking/learn/[dayId]/theory/...
 * to the clean, scalable top-level route /networking/learn/[dayId].
 */
export default async function TheoryPage({
  params,
}: {
  params: Promise<{ dayId: string; conceptId: string }>;
}) {
  const { dayId } = await params;
  redirect(`/networking/learn/${dayId}`);
}
