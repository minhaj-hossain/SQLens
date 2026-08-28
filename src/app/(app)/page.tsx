import LearnHomePage from '@/components/app/LearnHomePage';

export const metadata = {
  title: 'Learning Path — 25 Days of Hands-On SQL',
  description:
    'Your visual roadmap through 25 days of SQL: mental models, guided practice tasks and independent challenges in the in-browser query engine.',
};

// Phase 1: the roadmap lives in the (app) group because it is the landing
// view of the learning application (Header + providers) — not marketing.
export default function Page() {
  return <LearnHomePage />;
}
