# ProjectDetails.md

## 1. Project Overview

**Project Name**
- `planner` (aka Planner / Upgrade OS)

**Purpose and Problem It Solves**
- Provides a multi-platform productivity suite that unifies planning, task execution, habit tracking, analytics, billing entitlements, and a study system (“Upgrade OS”) across web, desktop, mobile, and an admin CMS.
- Solves fragmentation of productivity workflows by centralizing core domain logic and database models in a monorepo shared by all apps.

**Target Users**
- End-users: individuals managing plans, tasks, habits, and study tracks.
- Power users: people using AI-generated learning plans and the study system with advanced metrics.
- Administrators: internal staff managing products, entitlements, users, and orders via CMS.

**Core Goals**
- Cross-platform parity through shared domain logic (`packages/domain`) and shared study logic (`packages/study-core`).
- Feature gating via entitlements and product features stored in the database.
- AI-assisted plan creation and structured learning generation.
- Scalable data model for tasks, habits, plans, billing, and study tracks.

**Tech Stack Summary**
- Monorepo tooling: `pnpm` workspaces, `turbo` task orchestration.
- Web apps: Next.js App Router (web + cms).
- Desktop app: Tauri + Vite + React.
- Mobile app: React Native (Expo) + NativeWind.
- Backend/data: Next.js API routes + Prisma (PostgreSQL).
- Auth: Supabase (SSR + browser + mobile SDKs).
- Billing: Razorpay.
- AI: Groq + OpenRouter (Mistral) via SDKs.
- UI: Tailwind CSS, Lucide icons, Framer Motion.

## 2. High-Level Architecture

**Architectural Style**
- Monorepo + Client-Server architecture with shared domain packages.
- UI clients (web, desktop, mobile, cms) consume shared business logic and data schema via internal packages.

**Architecture Diagram Explanation (Textual)**
- Clients: `apps/web`, `apps/desktop`, `apps/mobile`, `apps/cms`.
- Shared business logic: `packages/domain` (plans, tasks, habits, billing, analytics, study, cms, ai).
- Shared UI: `packages/ui` and `packages/study-ui-web`.
- Shared study orchestration: `packages/study-core`.
- Shared config + schemas: `packages/config`, `packages/api`, `packages/typescript-config`, `packages/eslint-config`.
- Data layer: `packages/db` (Prisma schema + client + seed scripts) backed by PostgreSQL.
- Auth layer: Supabase (browser + SSR + mobile), with user data mirrored into Prisma `User`.
- External services: Razorpay (billing), Groq + OpenRouter (AI), YouTube API (study playlists).

**Frontend-Backend Interaction Flow**
- Web/CMS: Next.js pages call server actions or API routes in `apps/web/app/api/*` or `apps/cms/*`.
- API routes call domain services in `packages/domain` and use Prisma via `@planner/db`.
- Study clients (web/desktop) use `@planner/study-core` hooks and `studyApi` (REST) which call `/api/study/*` routes.
- Mobile calls web API endpoints directly using Bearer tokens (via Supabase) for configuration and sync gating.

**State Management Flow**
- Web: local component state with hooks; `StudyFeatureProvider` wraps `StudyProvider` to store tracks, units, modals, and dashboard data.
- Desktop: local component state plus `useStudy` context from `@planner/study-core`.
- Mobile: `AuthContext` in React Native for session tracking; potential offline data in WatermelonDB (see `SyncServices.ts`).
- No centralized global store like Redux; state is feature-scoped.

**API Communication Structure**
- Next.js App Router API routes under `apps/web/app/api`.
- Routes call `getServerUser()` for auth (Supabase SSR) and then invoke domain services.
- `@planner/study-core` uses `apiClient` to call study endpoints and optionally sends `Authorization` header from `window.SUPABASE_SESSION_TOKEN`.

**Data Flow Explanation**
- Supabase handles authentication; upon login, `/api/auth/sync-user` or auth callback ensures user is created/updated in Prisma.
- Domain services read/write to Prisma models, often using transactions for consistency.
- Dashboard data is aggregated from `UserStats`, tasks, habits, and plans.
- Study data (tracks, units, sessions) is updated through StudyService which recalculates progress and daily load metrics.

**Folder Structure Reasoning**
- `apps/` isolates platform-specific UI and routing concerns.
- `packages/` isolates shared logic and configuration to avoid duplication.
- `lib/` at root contains generic auth and Prisma helpers used by multiple apps.
- `scripts/` contains admin/migration utilities for the database and domain logic.

**Design Patterns Used**
- Service layer pattern: domain modules expose functions (e.g., `StudyService`, `plans`, `billing`).
- Repository-like data access: Prisma client centralized in `@planner/db`.
- Feature modules: web features grouped under `apps/web/features/*`.
- Context-based state: `StudyProvider`, `AuthProvider`.
- Monorepo share-first: packages for UI, config, and validation schemas.

## 3. Complete Folder & File Structure Breakdown

**Root (`/home/dhruv/planner`)**
- `package.json`: monorepo scripts, dependency overrides, turbo tasks.
- `pnpm-workspace.yaml`: defines workspace packages (`apps/*`, `packages/*`).
- `turbo.json`: task pipeline configuration + build env var list.
- `tsconfig.json`: root TypeScript config, path alias for `@planner/*`.
- `README.md`: generic Turbo starter readme (not project-specific).
- `planner.md`: internal root architecture documentation.
- `Details.md`: high-level project overview (beginner-friendly).
- `UPGRADE_OS_README.md`: upgrade OS rollout/migration instructions.
- `index.js`: entrypoint that currently requires `apps/mobile/index.js`.
- `lib/`: shared auth/prisma utilities.
- `scripts/`: migration/seeding/verification utilities.
- `docs/`: ADRs and design decisions.
- `apps/`: platform-specific applications.
- `packages/`: shared logic, configs, UI, db, and study packages.
- `export_code_to_word.py`: utility to export code to Word.
- `project_code_dump.docx`: generated output from export script.

**`lib/`**
- `lib/auth.ts`: Supabase SSR session check and cached Prisma user lookup.
- `lib/prisma.ts`: Prisma client singleton with dev hot-reload safety.
- Architectural note: `apps/web` also defines `lib/auth-server.ts` and `lib/prisma.ts`, creating multiple Prisma client entry points; consider consolidating.

**`docs/`**
- `docs/adr/2026-02-extract-study-core.md`: ADR for extracting study logic and UI into shared packages.

**`scripts/`**
- `backfill-stats.ts`: recalculates user stats and plan counters.
- `backfill-study-to-tracks.ts`: migrates legacy study playlists to tracks/units.
- `init-free-tier.ts`, `seed-page-features.ts`, `sync-tiers.ts`: tier/feature seeding and synchronization.
- `verify-logic.ts`: verifies StudyService weight/XP logic.
- Improvement note: these scripts appear to run manually; no CI hooks are defined.

**`apps/`**
- `apps/web`: main user-facing Next.js app.
- `apps/cms`: admin CMS Next.js app.
- `apps/desktop`: Tauri desktop app.
- `apps/mobile`: Expo React Native app.
- `apps/apps.md`: architectural description of apps.

**`apps/web/` (key folders)**
- `app/`: Next.js App Router pages, layouts, and API routes.
- `features/`: feature modules (auth, billing, dashboard, plans, study, tasks).
- `shared/`: shared web-only UI components.
- `lib/`: web-specific auth and data access utilities.
- `config/`: web-specific navigation config (duplicates `packages/config/siteNav.ts`).
- `types/`: plan + Razorpay type declarations.
- `utils/`: browser Supabase client.
- `middleware.ts`: auth gate using cookie presence.
- `public/`: static assets.

**`apps/cms/` (key folders)**
- `app/`: Next.js App Router pages/layouts for admin.
- `components/`: admin UI components.
- `lib/`: CMS auth and Prisma helpers.
- `middleware.ts`: admin route protection.

**`apps/desktop/` (key folders)**
- `src/`: React UI, features, services.
- `src-tauri/`: Rust backend (system tray, notifications, window behavior).
- `public/`: static assets.
- `vite.config.ts`, `tauri.conf.json`, `Cargo.toml` for build.

**`apps/mobile/` (key folders)**
- `app/`: Expo Router screens.
- `components/`: reusable mobile UI.
- `context/`: `AuthContext`.
- `services/`: sync + config fetch services.
- `lib/`: Supabase + API config.
- `db/`: WatermelonDB definitions and sync model.

**`packages/`**
- `api/`: shared Zod schemas + Supabase client helper.
- `config/`: shared navigation config (siteNav).
- `db/`: Prisma client, schema, seeds, migrations.
- `domain/`: all business logic services.
- `study-core/`: shared study hooks + API client.
- `study-ui-web/`: shared study UI components.
- `ui/`: shared general UI components (currently stub/placeholder).
- `eslint-config/`, `typescript-config/`: shared build/lint config.

**Architectural Violations / Improvements**
- Duplicate navigation configs in `packages/config` and `apps/web/config` create divergence risk.
- `packages/ui` is a stub (button alerts), not production-ready.
- Multiple Prisma client modules (`lib/prisma.ts` and `apps/web/lib/prisma.ts`) can cause confusion.
- Some API route files appear misnamed (`apps/web/app/api/v1/plans/route.ts` serves config).

## 4. Page-wise / Module-wise Breakdown

### Web App Pages (Next.js App Router)

**`apps/web/app/(marketing)/layout.tsx`**
- Purpose: Base layout for marketing/public pages.
- UI responsibility: Provides shared shell for marketing content.
- Business logic: None.
- State handling: None.
- API calls: None.
- Components used: Header/Footer (from shared components).
- Reusability: Layout can be reused by other public routes.
- Performance concerns: Minimal.
- Improvements: Ensure consistent metadata and SEO.

**`apps/web/app/(marketing)/page.tsx`**
- Purpose: Marketing landing page.
- UI responsibility: Product introduction, CTA, branding.
- Business logic: None.
- State handling: Minimal or none.
- API calls: None.
- Components used: Header/Footer/marketing sections.
- Reusability: Mostly page-specific.
- Performance concerns: Heavy animation/hero assets should be optimized.
- Improvements: Ensure SSR-friendly assets and lazy load large visuals.

**`apps/web/app/login/page.tsx`**
- Purpose: Login screen.
- UI responsibility: Collect login credentials.
- Business logic: Uses Supabase auth client.
- State handling: local form state.
- API calls: Supabase auth calls.
- Components used: AuthForm/AuthPage.
- Reusability: Shared with signup via components.
- Performance concerns: None.
- Improvements: Add rate-limit or captcha in production.

**`apps/web/app/signup/page.tsx`**
- Purpose: Sign-up screen.
- UI responsibility: Register new user.
- Business logic: Supabase signup, triggers `/api/auth/sync-user` via callback.
- State handling: local form state.
- API calls: Supabase auth.
- Components used: AuthForm/AuthPage.
- Improvements: Ensure email verification flows and error handling for duplicates.

**`apps/web/app/forgot-password/page.tsx`**
- Purpose: Password recovery initiation.
- UI responsibility: email input and instructions.
- Business logic: Supabase recovery flow.
- Improvements: Rate limiting and UX for spam prevention.

**`apps/web/app/auth/update-password/page.tsx`**
- Purpose: Password update after recovery.
- UI responsibility: new password form.
- Business logic: Supabase auth update.
- Improvements: Ensure session validation and min password rules.

**`apps/web/app/auth/callback/route.ts`**
- Purpose: Supabase auth code exchange and redirect.
- Business logic: exchanges code for session, ensures user exists in Prisma.
- State handling: None.
- API calls: Supabase SSR, Prisma via `ensureUserExists`.
- Improvements: harden error logging, ensure redirect target validation.

**`apps/web/app/layout.tsx`**
- Purpose: Root layout.
- UI responsibility: global wrappers, fonts, providers.
- State handling: global (Toast Provider, etc.).

**`apps/web/app/dashboard/layout.tsx`**
- Purpose: Dashboard shell layout.
- UI responsibility: sidebar + authenticated layout.
- Business logic: access control via `getPagePermissions`.
- State handling: minimal.
- Improvements: server-side permission check vs client gating for critical actions.

**`apps/web/app/dashboard/page.tsx`**
- Purpose: Main dashboard overview.
- UI responsibility: aggregated stats, habits, tasks.
- Business logic: fetches `/api/dashboard` server data.
- State handling: server-rendered data mapping into UI.
- API calls: `getDashboardStats` (domain) via API.
- Components used: `DashboardUI`.
- Performance concerns: placeholder values for XP/level suggest incomplete integration.
- Improvements: replace placeholders with real XP stats (StudyService or UserStats).

**`apps/web/app/dashboard/plans/page.tsx`**
- Purpose: Plans list and management.
- UI responsibility: list plans, create/import actions.
- Business logic: fetch plans via API.
- State handling: local client state for modals.
- API calls: `/api/plans`, `/api/plans/import-json`.
- Improvements: pagination, filtering, and list virtualization for large plan counts.

**`apps/web/app/dashboard/plans/[planId]/page.tsx`**
- Purpose: Plan detail screen.
- UI responsibility: per-day task schedule and task editing.
- Business logic: fetches plan by id.
- State handling: in `plan-detail-client.tsx`.
- API calls: `/api/plans/[id]`, `/api/tasks/*`, `/api/plans/[id]/days`.
- Improvements: reduce client bundle size; consider server actions.

**`apps/web/app/dashboard/plans/[planId]/plan-detail-client.tsx`**
- Purpose: Client-only plan management with inline editing.
- UI responsibility: create/edit/delete tasks, insert/delete days, subtasks.
- Business logic: uses client-side `fetch` for CRUD operations.
- State handling: local `useState` for editing and in-flight actions.
- Performance concerns: large component, many re-renders, no memoization on task lists.
- Improvements: split into smaller components, add optimistic updates with rollback.

**`apps/web/app/dashboard/tasks/page.tsx`**
- Purpose: Tasks overview page.
- UI responsibility: list tasks, allow timers and completion.
- Business logic: uses task API and TaskItem components.
- State handling: local for timer interactions.
- Performance concerns: per-task intervals can be expensive at scale.
- Improvements: central timer management, virtualization.

**`apps/web/app/dashboard/daily-checklist/page.tsx`**
- Purpose: Habit tracking and daily notes.
- UI responsibility: daily checklist UI and note editor.
- Business logic: interacts with habits API.
- State handling: local state per day.
- Improvements: caching per date and optimistic log updates.

**`apps/web/app/dashboard/analytics/page.tsx`**
- Purpose: Analytics visualization.
- UI responsibility: charts and summary of tasks/habits.
- Business logic: fetch `/api/analytics`.
- Improvements: caching with SWR or ISR, aggregate queries optimized for scale.

**`apps/web/app/dashboard/study/layout.tsx`**
- Purpose: Study section layout.
- UI responsibility: wraps study pages with providers.
- State handling: `StudyFeatureProvider`.

**`apps/web/app/dashboard/study/page.tsx`**
- Purpose: Study dashboard/overview.
- UI responsibility: study HUD and track list.
- Business logic: calls StudyContext `fetchDashboard`.
- Improvements: paginate tracks, reduce render cost of HUD.

**`apps/web/app/dashboard/study/[trackId]/page.tsx`**
- Purpose: Track detail view.
- UI responsibility: track summary, units, kanban board.
- Business logic: fetch track summary + units via StudyService.

**`apps/web/app/dashboard/study/[trackId]/unit/[unitId]/page.tsx`**
- Purpose: Unit-specific study view.
- UI responsibility: unit detail, notes, session controls.
- Business logic: start/end session, progress updates.

**`apps/web/app/dashboard/settings/page.tsx`**
- Purpose: User settings page.
- UI responsibility: account settings.
- Business logic: likely uses `/api/auth/me`.
- Improvements: ensure sensitive updates validated.

**`apps/web/app/dashboard/subscriptions/page.tsx`**
- Purpose: Subscription management UI.
- Business logic: fetch `/api/billing/subscription`.

**`apps/web/app/dashboard/checkout/page.tsx`**
- Purpose: Razorpay checkout flow.
- UI responsibility: embed Razorpay JS and handle payment response.
- Business logic: verifies payment via `/api/billing/verify`.
- Performance concerns: client-side script loading.
- Security concerns: ensure verification only server-side.

**`apps/web/app/login/page.tsx`, `signup`, `forgot-password`**
- Purpose: Auth flows.
- Business logic: Supabase client.
- Improvements: unify error handling and telemetry.

### CMS Pages

**`apps/cms/app/(public)/login/page.tsx`**
- Purpose: Admin login.
- Business logic: Supabase auth.
- Security concerns: needs admin role verification after login.

**`apps/cms/app/(admin)/layout.tsx`**
- Purpose: Admin shell with persistent sidebar.
- UI responsibility: admin navigation.

**`apps/cms/app/(admin)/page.tsx`**
- Purpose: Admin dashboard summary.
- Business logic: uses `getDashboardCounts`.

**`apps/cms/app/(admin)/users/page.tsx`**
- Purpose: User management.
- Business logic: reads subscriptions, assigns plans, edits AI limits.
- Improvements: pagination and filtering for 1M users.

**`apps/cms/app/(admin)/products/page.tsx`**
- Purpose: Product/tier management.
- Business logic: list products, features, toggle entitlements.

**`apps/cms/app/(admin)/products/[id]/page.tsx`**
- Purpose: Product detail edit.
- Business logic: update feature values and enabled flags.

**`apps/cms/app/(admin)/orders/page.tsx`**
- Purpose: Orders list.
- Business logic: fetch recent orders and details.

### Desktop App Pages / Views

**`apps/desktop/src/App.tsx`**
- Purpose: Desktop shell, routing, sidebar, notifications.
- UI responsibility: app layout and navigation.
- Business logic: uses Supabase auth; uses Tauri `invoke("notify")`.
- State handling: `useAuth` for session; uses `StudyFeatureProvider` for study.
- Improvements: use `HashRouter` for Tauri compatibility; better error handling in notify.

**`apps/desktop/src/pages/study/TracksPage.tsx`**
- Purpose: Study tracks page entry.
- Business logic: simply renders `DesktopTracksView`.

**`apps/desktop/src/features/study/views/DesktopTracksView.tsx`**
- Purpose: desktop study tracks and kanban board.
- UI responsibility: renders sidebar, main board, notes panel.
- Business logic: uses `useStudy` to fetch dashboard; uses URL params for selected track/unit.
- State handling: local search state; relies on router params.
- Improvements: wire Kanban actions to update URL; implement drag/drop persistence.

**`apps/desktop/src/features/study/layouts/DesktopStudyLayout.tsx`**
- Purpose: resizable panel layout.
- Concern: `sidebar` prop unused but included in `defaultLayout`, resulting in mismatch.

### Mobile App Screens (Expo Router)

**`apps/mobile/app/_layout.tsx`**
- Purpose: Root layout and navigation providers.
- State handling: wraps `AuthProvider`.

**`apps/mobile/app/index.tsx`**
- Purpose: Entry screen; likely redirects based on auth.

**`apps/mobile/app/(auth)/login.tsx`**
- Purpose: mobile login screen.
- Business logic: Supabase auth.

**`apps/mobile/app/(auth)/signup.tsx`**
- Purpose: mobile signup screen.

**`apps/mobile/app/(drawer)/dashboard.tsx`**
- Purpose: mobile dashboard screen.

**`apps/mobile/app/(drawer)/planner.tsx`**
- Purpose: plan/task management on mobile.

**`apps/mobile/app/(drawer)/profile.tsx`**
- Purpose: profile screen.

## 5. Features Breakdown

**Authentication (Supabase)**
- Files: `apps/web/app/auth/callback/route.ts`, `apps/web/lib/auth-server.ts`, `lib/auth.ts`, `apps/mobile/lib/supabase.ts`, `apps/cms/components/AdminNav.tsx`.
- Flow: Supabase session created → callback exchanges code → `ensureUserExists` ensures Prisma User/Profile → API routes use `getServerUser` for auth.
- Edge cases: cookie-name detection in `middleware.ts` is heuristic; session validity not verified there.
- Security: relies on Supabase; ensure environment vars are set and rotated.

**Plans**
- Files: `packages/domain/plans/service.ts`, `apps/web/app/api/plans/*`, `apps/web/app/dashboard/plans/*`, `apps/web/features/plans/*`.
- Flow: create plan → tasks added and scheduled → plan days can be inserted/shifted → plan can be paused/resumed with task date shifting.
- Edge cases: task priority parsing; plan date shifting uses raw SQL updates; potential timezone inconsistencies.
- Security: must ensure userId scoping for all plan and task operations.

**Tasks & Subtasks**
- Files: `packages/domain/plans/service.ts`, `packages/domain/tasks/service.ts`, `apps/web/app/api/tasks/*`, `apps/web/app/api/subtasks/*`, `apps/web/features/tasks/*`.
- Flow: tasks are created under plans, subtasks managed separately, timers log time and completion via API.
- Edge cases: status values in UI sometimes use capitalized strings; domain uses lower-case enums.
- Security: ensure userId in task queries; some operations are in plan service, others in tasks service (duplication risk).

**Habits & Daily Notes**
- Files: `packages/domain/habits/service.ts`, `apps/web/app/api/habits/*`, `apps/web/app/api/daily-notes/route.ts`.
- Flow: habits are created and logged per day; daily notes are upserted or deleted if empty.
- Edge cases: date normalization to midnight; timezone must be consistent for cross-region users.

**Analytics**
- Files: `packages/domain/analytics/service.ts`, `apps/web/app/api/analytics/route.ts`.
- Flow: aggregates tasks and habit logs over last 7 days to build charts.
- Performance: uses multiple queries; should index and consider precomputed aggregates for scale.

**Dashboard**
- Files: `packages/domain/dashboard/service.ts`, `apps/web/app/api/dashboard/route.ts`, `apps/web/app/dashboard/page.tsx`.
- Flow: merges user stats, habits, and today’s tasks into dashboard data.
- Edge cases: some values are placeholders in UI.

**Study / Upgrade OS**
- Files: `packages/domain/study/service.ts`, `packages/study-core/*`, `packages/study-ui-web/*`, `apps/web/app/api/study/*`, `apps/web/features/study/*`, `apps/desktop/src/features/study/*`.
- Flow: create track or import YouTube playlist → units generated → plan today based on energy level → move/complete units → track stats recalculated → sessions logged → fatigue/overload computed.
- Edge cases: playlist sync and track planning relies on playlist availability; no backoff or retry strategy.
- Security: all track/unit operations require userId scoping in StudyService.

**AI Plan Generation**
- Files: `packages/domain/ai/service.ts`, `packages/domain/ai/prompt-builder.ts`, `apps/web/app/api/ai/plan/route.ts`, `apps/web/features/plans/components/AIPlanGenerator.tsx`.
- Flow: Groq generates syllabus structure; OpenRouter (Mistral) generates detailed tasks; response imported as plan tasks and metadata.
- Edge cases: JSON parsing errors, long outputs, prompt injection risks.
- Security: API keys must be protected; add rate limits.

**Billing & Subscriptions**
- Files: `packages/domain/billing/service.ts`, `apps/web/app/api/billing/*`, `apps/web/features/billing/*`.
- Flow: create Razorpay order → client checkout → verify signature → activate subscription and update user tier.
- Edge cases: webhook replays, order mismatch, race conditions in activation.

**Entitlements / Feature Flags**
- Files: `packages/domain/billing/entitlements.ts`, `apps/web/app/api/entitlements/route.ts`, `apps/web/shared/components/FeatureLocked.tsx`.
- Flow: feature flags stored in DB (product_features) and mapped into `features` map; frontend gates routes and UI.
- Edge cases: missing flags default to allow for non-free tiers.

**CMS (Admin)**
- Files: `packages/domain/cms/service.ts`, `apps/cms/app/(admin)/*`.
- Flow: admin can manage products, features, users, orders, AI limits.
- Security: admin role checks must be enforced server-side.

**Mobile Sync & Offline**
- Files: `apps/mobile/services/SyncServices.ts`, `apps/mobile/services/ConfigService.ts`.
- Flow: config fetched from `/api/v1/config` (route currently named `v1/plans/route.ts`) → if Pro, sync using Supabase RPCs `pull_changes` and `push_changes` with WatermelonDB.
- Edge cases: API route name mismatch, token passed via cookie header hack.

**Desktop Notifications & Tray**
- Files: `apps/desktop/src-tauri/src/lib.rs`, `apps/desktop/src/App.tsx`.
- Flow: frontend calls `invoke("notify")` to trigger system notification; tray menu manages show/hide and quit; close hides window.
- Edge cases: notifications failure currently `unwrap()` and can panic.

## 6. API & Backend Analysis

**API Structure**
- Next.js App Router routes in `apps/web/app/api/*`.
- Most endpoints follow `GET/POST/DELETE/PATCH` conventions and call domain services.

**Route Breakdown (Key)**
- Auth: `/api/auth/me`, `/api/auth/sync-user`.
- Dashboard: `/api/dashboard`.
- Plans: `/api/plans`, `/api/plans/[id]`, `/api/plans/[id]/days`, `/api/plans/[id]/toggle-status`, `/api/plans/import-json`.
- Tasks: `/api/tasks`, `/api/tasks/[taskId]`.
- Subtasks: `/api/subtasks`, `/api/subtasks/[subtaskId]`.
- Habits: `/api/habits`, `/api/habits/[id]`, `/api/habits/[id]/log`.
- Analytics: `/api/analytics`.
- Billing: `/api/billing/products`, `/api/billing/create-order`, `/api/billing/verify`, `/api/billing/subscription`, `/api/billing/webhook`.
- Entitlements: `/api/entitlements`.
- AI: `/api/ai/plan`.
- Study: `/api/study/dashboard`, `/api/study/tracks`, `/api/study/tracks/[trackId]`, `/api/study/tracks/[trackId]/sync`, `/api/study/tracks/[trackId]/commit`, `/api/study/tracks/import-playlist`, `/api/study/plan-today`, `/api/study/units`, `/api/study/units/[unitId]`, `/api/study/units/[unitId]/move`, `/api/study/units/[unitId]/progress`, `/api/study/units/[unitId]/complete`, `/api/study/units/[unitId]/notes`, `/api/study/units/[unitId]/session/start`, `/api/study/units/session/[sessionId]/end`, `/api/study/reflection`.
- Public content: `/api/public/content/[type]`.
- Debug: `/api/debug`.
- Mobile config: `/api/v1/plans` (file name) returns config payload; mismatch should be fixed.

**Middleware Usage**
- `apps/web/middleware.ts`: checks for Supabase cookie presence; protects `/dashboard` and `/admin`.
- `apps/cms/middleware.ts`: admin protection.

**Authentication Flow**
- Supabase SSR session used in API routes via `getServerUser()`.
- `/api/auth/sync-user` ensures user row exists in Prisma.

**Validation Logic**
- Minimal validation in API routes; Zod schemas exist in `packages/api` but not consistently applied.
- Plan import route performs custom normalization.

**Error Handling**
- Most routes catch and return JSON with error message.
- Some routes log and return 500 without specific error details.

**Security Concerns**
- Debug endpoint returns auth state even for unauthenticated requests.
- Middleware only checks cookie presence; does not validate session token.
- Some APIs rely on client-provided values without strict schema validation.
- Webhook signature validated correctly in billing service.

**Performance Risks**
- Analytics and dashboard queries could become heavy for 1M users; need aggregation or caching.
- StudyService recomputes track stats by loading all units without pagination.

## 7. State Management Analysis

**Global vs Local State**
- Global: `StudyProvider` (tracks, dashboard, active track, modal state), `AuthContext` (mobile).
- Local: extensive use of `useState` in plan detail and task items.

**State Flow**
- Study: actions in `StudyContext` call `studyApi` → update local state → refetch dashboard/track.
- Plans: plan detail uses client-side fetch to APIs and refreshes route.

**Data Dependencies**
- Dashboard depends on `UserStats`, `Plan`, `Task`, `Habit`.
- Study depends on `Track`, `Unit`, `DailySession`, `RevisionSchedule`.

**Optimization Suggestions**
- Introduce memoization or virtualization for large task lists.
- Consolidate re-fetch patterns into a single data layer (React Query/SWR).
- Move heavy calculations to server or background jobs.

## 8. Reusability & Component Architecture

**Reusable Components**
- Web: `shared/components` (Header, Sidebar, Modal, Button, ToastProvider).
- CMS: `components` (AdminSidebar, ConfirmModal).
- Study: `packages/study-ui-web` provides reusable track and HUD components.

**Prop Drilling Issues**
- Plan detail client component passes many actions and state props; likely prop drilling as feature grows.

**Tight Coupling**
- `apps/web` pages tightly coupled to specific API route shapes (e.g., plan detail expects certain JSON structure).
- `study-core` directly uses `/api` routes; mobile/desktop needs consistent base URL and auth header patterns.

**Clean Architecture Compliance**
- Domain services are reasonably isolated, but some API routes access Prisma directly instead of domain layer (e.g., plan toggle route).
- `packages/ui` is not production-ready and does not reflect actual app UI.

## 9. Security Review

**Authentication Vulnerabilities**
- `apps/web/middleware.ts` uses cookie presence rather than validating session token. This can be bypassed by setting a fake cookie name.
- `apps/web/app/api/debug/route.ts` returns auth status and userId without authorization checks.

**Authorization Gaps**
- Admin CMS relies on Supabase auth but role checks must be ensured at all server actions; verify that `verifyAdminAccess` is enforced where required.

**Input Validation Issues**
- Many API routes accept raw JSON without Zod validation (`packages/api` schemas exist but are not consistently used).

**Sensitive Data Exposure**
- Some endpoints return full user profile or subscription data; ensure least-privilege selection.

**Environment Variable Handling**
- Requires `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `DATABASE_URL`, `RAZORPAY_*`, `GEMINI_API_KEY`, `GROQ_API_KEY`, `OPENROUTER_API_KEY`.
- Ensure production secrets are not exposed to client builds.

**Potential Attack Vectors**
- Open endpoints without rate limiting (AI plan generation, plan imports) can be abused.
- Webhook endpoint must be protected with signature validation (present in billing service).

## 10. Performance Review

**Re-renders**
- `plan-detail-client.tsx` is large and likely causes heavy re-renders on state changes.
- Task timers use per-task intervals; with many tasks this can degrade performance.

**Expensive Operations**
- StudyService recalculates track stats by fetching all units per update.
- Dashboard and analytics aggregate queries lack caching layer.

**API Inefficiencies**
- Multiple endpoints fetch overlapping data; no batching layer.
- Study dashboard calls multiple queries sequentially in domain service.

**Memory Leaks**
- ToastProvider manages timers but cleans them; safe.
- TaskItem timers should be cleaned; currently they are, but per-task intervals can be costly.

**Bundle Size Concerns**
- `plan-detail-client.tsx` is large and imports many icons.
- Framer Motion used in multiple pages; could be tree-shaken but still adds weight.

## 11. Code Quality Review

**Naming Conventions**
- Generally consistent; some files use uppercase route names or comments implying fixes.
- `apps/web/app/api/v1/plans/route.ts` contains config logic; filename mismatch is confusing.

**Separation of Concerns**
- Domain logic is centralized, but some API routes bypass domain and access Prisma directly.
- UI components occasionally embed business logic (task completion modal triggers data updates).

**SOLID Violations**
- `StudyService` handles too many responsibilities (playlist import, scheduling, analytics, fatigue calculations, sessions).
- Plan detail UI combines business logic, API calls, and rendering in one file.

**DRY Violations**
- Navigation config duplicated in `packages/config` and `apps/web/config`.
- Task management logic split between `packages/domain/tasks` and `packages/domain/plans`.

**Overengineering / Underengineering**
- `packages/ui` remains a stub, underengineered for production.
- AI prompts are heavily hard-coded without dynamic templates or safeguards.

## 12. Scalability Analysis

**Scalability of Current Structure**
- Monorepo and shared domain logic are scalable for engineering velocity.
- Prisma schema includes indexes for key queries and supports large datasets.

**What Will Break at Scale**
- Large task/plan lists without pagination or virtualization.
- Analytics and dashboard queries run per request without caching.
- StudyService recalculation and playlist sync can be heavy for many users.
- CMS pages that load all users/products/orders without pagination will become unusable.

**Database Growth Considerations**
- High write volumes for `AiUsageLog`, `UnitSession`, `HabitLog` will require archiving or partitioning.
- `UserStats` table already helps reduce read load.

**Suggested Improvements**
- Introduce background workers for analytics aggregation and study stats recalculation.
- Add caching (Redis) for dashboard and analytics endpoints.
- Add pagination and indexing for CMS and user-facing lists.
- Add read replicas for heavy analytics.

## 13. DevOps & Deployment

**Environment Configuration**
- Build depends on `DATABASE_URL`, Supabase keys, Razorpay keys, and AI keys.
- Turbo build tasks require env vars listed in `turbo.json`.

**Build Process**
- `pnpm dev` runs `turbo dev`.
- `pnpm build` runs `turbo run build` for all apps.
- `postinstall` runs Prisma generation for `@planner/db`.

**Deployment Strategy**
- Not explicitly defined; likely Next.js to Vercel or similar for web/cms.
- Tauri desktop uses native build pipeline.
- Mobile uses Expo/EAS.

**CI/CD Presence**
- No CI/CD configuration found in repo.

**Production-Readiness Score**
- 5/10. Core architecture is solid but lacks production-grade observability, security hardening, and performance scaling.

## 14. Improvement Roadmap

**Critical Fixes**
- Fix `/api/v1/plans` misnaming to `/api/v1/config` and align mobile `ConfigService`.
- Replace cookie existence checks with real Supabase session validation in middleware.
- Remove or restrict `/api/debug` in production.
- Add schema validation for API routes (Zod).

**Medium Priority Improvements**
- Introduce caching for dashboard and analytics.
- Break up `StudyService` into sub-services.
- Standardize task status casing between UI and domain.
- Add pagination to CMS and heavy list endpoints.

**Long-Term Refactor Suggestions**
- Add event-driven architecture or background jobs for heavy calculations.
- Consolidate Prisma client usage.
- Build a proper design system package to replace stub UI.
- Introduce multi-tenant observability (logging, tracing).

## 15. Technical Debt Assessment

**Debt List and Severity**
- Duplicate navigation configs (Medium).
- Stub UI package `packages/ui` (Medium).
- Middleware auth validation by cookie presence (High).
- `StudyService` oversized (High).
- Plan detail UI monolith (Medium).
- Misnamed API route for mobile config (High).
- Debug endpoint in production (High).

**Refactoring Complexity**
- Low: rename route, remove debug endpoint.
- Medium: replace middleware auth, add validation.
- High: refactor StudyService and plan detail UI.

## 16. Final Architecture Score

- Architecture: 7/10
- Code Quality: 6/10
- Scalability: 5/10
- Security: 5/10
- Maintainability: 6/10

