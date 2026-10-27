# Implementation Plan: User Profile & Learning Progress Hub

## Overview
Decouple learning progress from the public marketing homepage (`ClickHomepage.tsx`) and build a dedicated, production-quality **User Profile & Learning Progress Hub** (`/profile`). The homepage becomes a clean, distraction-free landing page for track discovery and live playground exploration, while user progression across all tracks (SQL, Prisma, Networking) is elevated into a rich, organized, and polished learner dashboard.

---

## User Requirements & Problem Statement
- **Current Problem:** The homepage currently mounts a client-side `#returning-learner-section` card directly between the Hero and the Track Cards. This clutters the public landing page, creates layout shift on hydration, and mixes marketing discovery with personal account state.
- **Goal:**
  1. Purge personal progress widgets and calculations from the homepage.
  2. Implement a dedicated `/profile` route with a refined learner dashboard.
  3. Organize progress across tracks (SQL 57 days, Prisma 14 days, Networking simulation) with milestones, completion percentages, next-up lesson anchors, and direct resume actions.
  4. Provide clear guest-to-cloud sync status, profile details, and account data controls (safe reset progress integration).
  5. Integrate `/profile` into the global `Header.tsx` account menu.

---

## Architecture & Design Decisions

### 1. Route & Surface Architecture
- **Route:** `src/app/(app)/profile/page.tsx`
- **Component:** `src/components/profile/UserProfileView.tsx`
- **Design System Mode:** `Operate / Experience` (Impeccable standard)
  - Color Tokens: Deep blueprint ink (`#060b16`), elevated surfaces (`bg-surface`, `bg-surface-2`), borders (`border-border`, `border-border-soft`), and brand accent (`#38bdf8`).
  - Typography: `font-display` (headings & titles), `font-mono` (metrics, days, and status chips), `font-sans` (body text).
  - Glassmorphic card styling, subtle radial backdrop aura, and zero harsh animations.

### 2. Learner State & Data Aggregation
- **Unified Progress Reader (`src/lib/progress/profile-progress.ts`):**
  - Consolidates progress calculation across all tracks without duplicating logic across components.
  - Queries `loadUserState(userId, trackId)` for both SQL and Prisma.
  - Aggregates:
    - Global stats: Total days completed, total practice tasks cleared, challenges passed, overall completion percentage, and last active timestamp.
    - SQL Track: Current active day, milestone tier (M1: Single-Table, M2: Multi-Table, M3: DDL & Capstone, M4: Production & Advanced), completed module count, and resume URL.
    - Prisma Track: Current active day, completed concepts & tasks, schema models cleared, and resume URL.
    - Networking Track: Active packet simulation day and status.
  - Supports both **Signed-In Users** (Better Auth session + cloud synced state) and **Guest Learners** (localStorage browser state + CTA to create account/sign in to persist progress across devices).

### 3. Homepage Streamlining (`ClickHomepage.tsx`)
- Strip `#returning-learner-section`, `#returning-learner-card`, and `#resume-learning-btn` from `ClickHomepage.tsx`.
- Remove redundant `localStorage` enumeration loops and client effects that caused hydration delay.
- Retain clean hero, direct track navigation (`/sql`, `/prisma`, `/networking`), and live playground preview.

### 4. Header & Navigation Integration (`Header.tsx`)
- In `src/components/layout/Header.tsx`, update the signed-in user popover menu:
  - Add "My Profile & Progress" link navigating to `/profile` with icon.
  - Add active state highlight when on `/profile`.
- Ensure guest users navigating to `/profile` receive an authentic guest dashboard view with an inline prompt to sign in.

---

## Detailed Task Breakdown

### Phase 1: Data Contracts & Progress Helper
#### Task 1: Create Profile Progress Aggregator (`src/lib/progress/profile-progress.ts`)
**Description:** Implement a clean, pure utility that reads the learner's state across all tracks (handling guest vs user keys) and returns structured dashboard metrics.
**Acceptance Criteria:**
- Computes total days completed, total tasks completed, and overall percentage.
- Resolves exact resume URLs for SQL, Prisma, and Networking using `deriveLastPosition`.
- Pure and fully unit-tested with mock state.
**Verification:**
- Unit tests pass in `tests/progress/profile-progress.test.ts`.
**Files touched:**
- `src/lib/progress/profile-progress.ts`
- `tests/progress/profile-progress.test.ts`
**Scope:** Small (2 files)

---

### Phase 2: User Profile UI & Layout
#### Task 2: Build `UserProfileView.tsx` Component & `/profile` Route
**Description:** Create the dedicated `/profile` page and `UserProfileView` component implementing the modern dark blueprint learner dashboard.
**Acceptance Criteria:**
- **Identity Header:** Avatar disc with conic accent, user name/email, account badge (`Learner` / `Admin`), and cloud sync indicator (Green dot for synced; amber banner for guest with 1-click sign in).
- **KPI Metrics HUD:** 4 metric cards: Total Days Completed, Challenges Mastered, Overall Progress %, and Last Active.
- **Track Progress Cards:**
  - SQL Card: Milestone badge, progress bar, active lesson title, direct "Resume SQL" button, and roadmap link.
  - Prisma Card: Progress bar, active lesson title, direct "Resume Prisma" button, and roadmap link.
  - Networking Card: Simulation status and link.
- **Account & Data Controls:** Theme toggle, Cloud sync status, and "Reset Progress" trigger opening `ResetProgressModal`.
- Fully responsive on mobile, tablet, and desktop (100% WCAG accessible).
**Verification:**
- Component renders static markup cleanly in tests.
- Navigates smoothly on local server.
**Files touched:**
- `src/app/(app)/profile/page.tsx`
- `src/components/profile/UserProfileView.tsx`
- `src/components/profile/ProfileSkeleton.tsx`
**Scope:** Medium (3 files)

---

### Phase 3: Header Integration & Homepage Decoupling
#### Task 3: Strip Progress from `ClickHomepage.tsx`
**Description:** Remove the returning learner card and state loops from `ClickHomepage.tsx`. Keep the landing page clean, fast, and focused on track exploration.
**Acceptance Criteria:**
- Homepage contains no `#returning-learner-section` or `#returning-learner-card`.
- Homepage renders with 0 client layout shift or hydration flicker.
- Update `tests/ui/click-homepage.test.tsx` and `tests/tracks/track-routing.test.ts` to reflect the clean landing page contract.
**Verification:**
- `npm test tests/ui/click-homepage.test.tsx tests/tracks/track-routing.test.ts` passes.
**Files touched:**
- `src/components/home/ClickHomepage.tsx`
- `tests/ui/click-homepage.test.tsx`
- `tests/tracks/track-routing.test.ts`
**Scope:** Small (3 files)

#### Task 4: Link Profile in `Header.tsx`
**Description:** Add "My Profile & Progress" to the user avatar dropdown menu in the header.
**Acceptance Criteria:**
- User menu displays "My Profile" as the top action above "Sign out".
- Active route indicator highlights when on `/profile`.
- Keyboard accessible (`role="menuitem"`, Enter/Space to navigate).
**Verification:**
- `tests/ui/header-minimal.test.tsx` passes.
**Files touched:**
- `src/components/layout/Header.tsx`
**Scope:** Small (1 file)

---

### Phase 4: Test Suite & Quality Verification
#### Task 5: End-to-End Suite & Quality Audits
**Description:** Add comprehensive tests for the profile page and run the entire verification suite.
**Acceptance Criteria:**
- New test file `tests/ui/user-profile.test.tsx` verifying:
  - Signed-in profile view with progress
  - Guest profile view with sign-in prompt
  - Direct resume links for SQL and Prisma
  - Milestone and percentage calculations
- `npm run lint` passes (0 errors).
- `npm test` passes (all 101+ test files pass).
- `npm run audit:all` passes (all 16 curriculum audits clean).
- `npm run build` compiles cleanly (97/97 static & SSG routes).
**Verification:**
- CI commands all return exit code 0.
**Files touched:**
- `tests/ui/user-profile.test.tsx`
**Scope:** Small (1-2 files)

---

## Checkpoints
- **Checkpoint 1 (After Tasks 1 & 2):** Profile progress aggregator and `/profile` UI page functional for both guest and authenticated users.
- **Checkpoint 2 (After Tasks 3 & 4):** Homepage cleaned up and header linked to `/profile`.
- **Checkpoint 3 (After Task 5):** Full CI test suite (`lint`, `test`, `audit:all`, `build`) green.
