# User Profile & Learning Progress Hub Task List

## Phase 1: Data Contracts & Progress Helper
- [x] Task 1.1: Create `src/lib/progress/profile-progress.ts` to aggregate cross-track progress (SQL, Prisma, Networking)
- [x] Task 1.2: Add unit tests in `tests/progress/profile-progress.test.ts` for guest and authenticated states

## Phase 2: User Profile UI & Layout
- [x] Task 2.1: Implement `src/components/profile/ProfileSkeleton.tsx` for layout-shift-free loading
- [x] Task 2.2: Implement `src/components/profile/UserProfileView.tsx` with:
  - Identity header (avatar, user info, role badge, cloud-sync status)
  - 4 KPI summary cards (Days completed, challenges mastered, total progress %, last active)
  - Track progress cards (SQL with milestones, Prisma with relations/models, Networking with simulation status)
  - Account and data management (reset progress trigger, theme indicator, cloud sync status)
- [x] Task 2.3: Create route page `src/app/(app)/profile/page.tsx` with metadata and suspense boundary

## Checkpoint: Profile Page Functional
- [x] Verify `/profile` loads and displays mock/stored state for both guest and logged-in learners

## Phase 3: Header Integration & Homepage Decoupling
- [x] Task 3.1: Remove `#returning-learner-section` and progress calculation loops from `src/components/home/ClickHomepage.tsx`
- [x] Task 3.2: Update `tests/ui/click-homepage.test.tsx` and `tests/tracks/track-routing.test.ts` to reflect the streamlined homepage
- [x] Task 3.3: In `src/components/layout/Header.tsx`, add "My Profile & Progress" to user avatar dropdown

## Phase 4: Production Verification & Regression Testing
- [x] Task 4.1: Create `tests/ui/user-profile.test.tsx` testing the Profile page render, resume URLs, and guest vs signed-in states
- [x] Task 4.2: Run `npm run lint` (`tsc --noEmit`)
- [x] Task 4.3: Run `npm test` (all 103 test files, 1182 tests passed)
- [x] Task 4.4: Run `npm run audit:all` and `npm run build` (99/99 pages static/dynamic compiled)
