import React from 'react';
import { parseAiModule } from '@/lib/ai-parser';
import LessonClient from './LessonClient';

export default async function LearnPage({ params }: { params: Promise<{ track: string, module: string }> }) {
  try {
    const resolvedParams = await params;
    
    // Parse the markdown file from docs/ai_curriculum/[track]-[module].md
    const steps = parseAiModule(resolvedParams.track, resolvedParams.module);
    
    return (
      <div className="w-full min-h-screen bg-white font-sans">
        <LessonClient steps={steps} />
      </div>
    );
  } catch (e: any) {
    return (
      <div className="p-12 max-w-3xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg">
          <h1 className="text-2xl font-bold mb-2">Error loading module</h1>
          <p>Could not load the requested track and module.</p>
          <p className="font-mono text-sm mt-4 p-4 bg-red-100 rounded">{e.message}</p>
        </div>
      </div>
    );
  }
}
