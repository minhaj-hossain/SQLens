import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { UserProfileView } from '@/components/profile/UserProfileView';
import { ProfileSkeleton } from '@/components/profile/ProfileSkeleton';

export const metadata: Metadata = {
  title: 'My Profile & Learning Progress · Click',
  description:
    'Track your hands-on SQL, Prisma ORM, and Networking progress, milestone achievements, and resume points.',
};

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <UserProfileView />
    </Suspense>
  );
}
