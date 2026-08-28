'use client';
import React from 'react';
import { useParams, notFound } from 'next/navigation';
import { getModuleById } from '@/content/curriculum-index';
import ModuleOverview from '@/components/learn/ModuleOverview';

export default function DayOverviewPage() {
  const { dayId } = useParams<{ dayId: string }>();
  const mod = getModuleById(dayId);
  if (!mod) notFound();
  return <ModuleOverview module={mod} />;
}
